lang: C/C++
system: linux
subsystem: landlock
githubAttestations:
    Larhzu tukaani-project/xz,
    omar-polo omar-polo/gmid,
    regit OISF/suricata,
    redpig google/minijail,
    valoq pwmt/zathura,
    omar-polo telescope-browser/telescope,
    ThomasAdam ThomasAdam/got-portable,

```c
#define _GNU_SOURCE
#define __SANE_USERSPACE_TYPES__
#include <linux/landlock.h>
#include <linux/prctl.h>
#include <stdio.h>
#include <sys/prctl.h>
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

#ifndef landlock_restrict_self
static inline int
landlock_restrict_self(const int ruleset_fd, const __u32 flags)
{
    return syscall(__NR_landlock_restrict_self, ruleset_fd, flags);
}
#endif

nt
main(void)
{
    int fd;
    struct landlock_ruleset_attr attr = {0};
    attr.handled_access_fs =
        LANDLOCK_ACCESS_FS_WRITE_FILE |
        LANDLOCK_ACCESS_FS_READ_FILE;
    fd = landlock_create_ruleset(&attr, sizeof(attr), 0);
    if (fd == -1)
        return 1;
    if (prctl(PR_SET_NO_NEW_PRIVS, 1, 0, 0, 0))
        return 1;
    if (landlock_restrict_self(fd, 0))
        return 1;
    close(fd);
    /* SECURE. */
    puts("Hello, world!");
    return 0;
}
```
