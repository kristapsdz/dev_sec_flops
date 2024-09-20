lang: C/C++
system: linux
subsystem: landlock

```c
#define _GNU_SOURCE
#define __SANE_USERSPACE_TYPES__
#include <arpa/inet.h>
#include <errno.h>
#include <fcntl.h>
#include <linux/landlock.h>
#include <linux/prctl.h>
#include <stddef.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/prctl.h>
#include <sys/stat.h>
#include <sys/syscall.h>
#include <unistd.h>

#ifndef landlock_create_ruleset
static inline int
landlock_create_ruleset(const struct landlock_ruleset_attr *const attr,
			const size_t size, const __u32 flags)
{
	return syscall(__NR_landlock_create_ruleset, attr, size, flags);
}
#endif

#ifndef landlock_add_rule
static inline int landlock_add_rule(const int ruleset_fd,
				    const enum landlock_rule_type rule_type,
				    const void *const rule_attr,
				    const __u32 flags)
{
	return syscall(__NR_landlock_add_rule, ruleset_fd, rule_type, rule_attr,
		       flags);
}
#endif

#ifndef landlock_restrict_self
static inline int landlock_restrict_self(const int ruleset_fd,
					 const __u32 flags)
{
	return syscall(__NR_landlock_restrict_self, ruleset_fd, flags);
}
#endif

#define ENV_FS_RO_NAME "LL_FS_RO"
#define ENV_FS_RW_NAME "LL_FS_RW"
#define ENV_TCP_BIND_NAME "LL_TCP_BIND"
#define ENV_TCP_CONNECT_NAME "LL_TCP_CONNECT"
#define ENV_DELIMITER ":"

static int parse_path(char *env_path, const char ***const path_list)
{
	int i, num_paths = 0;

	if (env_path) {
		num_paths++;
		for (i = 0; env_path[i]; i++) {
			if (env_path[i] == ENV_DELIMITER[0])
				num_paths++;
		}
	}
	*path_list = malloc(num_paths * sizeof(**path_list));
	for (i = 0; i < num_paths; i++)
		(*path_list)[i] = strsep(&env_path, ENV_DELIMITER);

	return num_paths;
}

/* clang-format off */

#define ACCESS_FILE ( \
	LANDLOCK_ACCESS_FS_EXECUTE | \
	LANDLOCK_ACCESS_FS_WRITE_FILE | \
	LANDLOCK_ACCESS_FS_READ_FILE | \
	LANDLOCK_ACCESS_FS_TRUNCATE | \
	LANDLOCK_ACCESS_FS_IOCTL_DEV)

/* clang-format on */

static int populate_ruleset_fs(const char *const env_var, const int ruleset_fd,
			       const __u64 allowed_access)
{
	int num_paths, i, ret = 1;
	char *env_path_name;
	const char **path_list = NULL;
	struct landlock_path_beneath_attr path_beneath = {
		.parent_fd = -1,
	};

	env_path_name = getenv(env_var);
	if (!env_path_name) {
		/* Prevents users to forget a setting. */
		fprintf(stderr, "Missing environment variable %s\n", env_var);
		return 1;
	}
	env_path_name = strdup(env_path_name);
	unsetenv(env_var);
	num_paths = parse_path(env_path_name, &path_list);
	if (num_paths == 1 && path_list[0][0] == '\0') {
		/*
		 * Allows to not use all possible restrictions (e.g. use
		 * LL_FS_RO without LL_FS_RW).
		 */
		ret = 0;
		goto out_free_name;
	}

	for (i = 0; i < num_paths; i++) {
		struct stat statbuf;

		path_beneath.parent_fd = open(path_list[i], O_PATH | O_CLOEXEC);
		if (path_beneath.parent_fd < 0) {
			fprintf(stderr, "Failed to open \"%s\": %s\n",
				path_list[i], strerror(errno));
			continue;
		}
		if (fstat(path_beneath.parent_fd, &statbuf)) {
			fprintf(stderr, "Failed to stat \"%s\": %s\n",
				path_list[i], strerror(errno));
			close(path_beneath.parent_fd);
			goto out_free_name;
		}
		path_beneath.allowed_access = allowed_access;
		if (!S_ISDIR(statbuf.st_mode))
			path_beneath.allowed_access &= ACCESS_FILE;
		if (landlock_add_rule(ruleset_fd, LANDLOCK_RULE_PATH_BENEATH,
				      &path_beneath, 0)) {
			fprintf(stderr,
				"Failed to update the ruleset with \"%s\": %s\n",
				path_list[i], strerror(errno));
			close(path_beneath.parent_fd);
			goto out_free_name;
		}
		close(path_beneath.parent_fd);
	}
	ret = 0;

out_free_name:
	free(path_list);
	free(env_path_name);
	return ret;
}

static int populate_ruleset_net(const char *const env_var, const int ruleset_fd,
				const __u64 allowed_access)
{
	int ret = 1;
	char *env_port_name, *env_port_name_next, *strport;
	struct landlock_net_port_attr net_port = {
		.allowed_access = allowed_access,
		.port = 0,
	};

	env_port_name = getenv(env_var);
	if (!env_port_name)
		return 0;
	env_port_name = strdup(env_port_name);
	unsetenv(env_var);

	env_port_name_next = env_port_name;
	while ((strport = strsep(&env_port_name_next, ENV_DELIMITER))) {
		net_port.port = atoi(strport);
		if (landlock_add_rule(ruleset_fd, LANDLOCK_RULE_NET_PORT,
				      &net_port, 0)) {
			fprintf(stderr,
				"Failed to update the ruleset with port \"%llu\": %s\n",
				net_port.port, strerror(errno));
			goto out_free_name;
		}
	}
	ret = 0;

out_free_name:
	free(env_port_name);
	return ret;
}

/* clang-format off */

#define ACCESS_FS_ROUGHLY_READ ( \
	LANDLOCK_ACCESS_FS_EXECUTE | \
	LANDLOCK_ACCESS_FS_READ_FILE | \
	LANDLOCK_ACCESS_FS_READ_DIR)

#define ACCESS_FS_ROUGHLY_WRITE ( \
	LANDLOCK_ACCESS_FS_WRITE_FILE | \
	LANDLOCK_ACCESS_FS_REMOVE_DIR | \
	LANDLOCK_ACCESS_FS_REMOVE_FILE | \
	LANDLOCK_ACCESS_FS_MAKE_CHAR | \
	LANDLOCK_ACCESS_FS_MAKE_DIR | \
	LANDLOCK_ACCESS_FS_MAKE_REG | \
	LANDLOCK_ACCESS_FS_MAKE_SOCK | \
	LANDLOCK_ACCESS_FS_MAKE_FIFO | \
	LANDLOCK_ACCESS_FS_MAKE_BLOCK | \
	LANDLOCK_ACCESS_FS_MAKE_SYM | \
	LANDLOCK_ACCESS_FS_REFER | \
	LANDLOCK_ACCESS_FS_TRUNCATE | \
	LANDLOCK_ACCESS_FS_IOCTL_DEV)

/* clang-format on */

#define LANDLOCK_ABI_LAST 5

int
main(void)
{
	const char *cmd_path;
	char *const *cmd_argv;
	int ruleset_fd, abi;
	char *env_port_name;
	__u64 access_fs_ro = ACCESS_FS_ROUGHLY_READ,
	      access_fs_rw = ACCESS_FS_ROUGHLY_READ | ACCESS_FS_ROUGHLY_WRITE;

	struct landlock_ruleset_attr ruleset_attr = {
		.handled_access_fs = access_fs_rw,
		.handled_access_net = LANDLOCK_ACCESS_NET_BIND_TCP |
				      LANDLOCK_ACCESS_NET_CONNECT_TCP,
	};

	if (landlock_create_ruleset(NULL, 0, LANDLOCK_CREATE_RULESET_VERSION) < 0)
        return 1;

	if (prctl(PR_SET_NO_NEW_PRIVS, 1, 0, 0, 0)) {
		perror("Failed to restrict privileges");
		goto err_close_ruleset;
	}
	if (landlock_restrict_self(ruleset_fd, 0)) {
		perror("Failed to enforce ruleset");
		goto err_close_ruleset;
	}
	close(ruleset_fd);

    puts("Hello, world!");
	return 0;
}
```
