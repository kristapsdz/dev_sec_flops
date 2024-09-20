lang: C/C++
system: Linux
system-link: https://linux.org
subsystem: seccomp
githubAttestations: 
    kristapsdz kristapsdz/kcgi,

```c
#include <sys/prctl.h> /* prctl(2) */
#include <linux/audit.h>
#include <linux/filter.h>
#include <linux/seccomp.h>
#include <stddef.h> /* offsetof(3) */
#include <stdio.h> /* puts(3) */

/* XXX: define to your architecture. */
#define SECCOMP_AUDIT_ARCH AUDIT_ARCH_X86_64

#ifdef AUDIT_ARCH_AARCH64
#define __ARCH_WANT_SYSCALL_NO_AT
#define __ARCH_WANT_SYSCALL_DEPRECATED
#endif
#include <asm/unistd.h>

#define SECCOMP_FILTER_FAIL SECCOMP_RET_KILL

#define SC_DENY(_nr, _errno) \
	BPF_JUMP(BPF_JMP+BPF_JEQ+BPF_K, __NR_ ## _nr, 0, 1), \
	BPF_STMT(BPF_RET+BPF_K, SECCOMP_RET_ERRNO|(_errno))
#define SC_ALLOW(_nr) \
	BPF_JUMP(BPF_JMP+BPF_JEQ+BPF_K, __NR_ ## _nr, 0, 1), \
	BPF_STMT(BPF_RET+BPF_K, SECCOMP_RET_ALLOW)

static const struct sock_filter preauth_work[] = {
	BPF_STMT(BPF_LD+BPF_W+BPF_ABS,
		offsetof(struct seccomp_data, arch)),
	BPF_JUMP(BPF_JMP+BPF_JEQ+BPF_K, SECCOMP_AUDIT_ARCH, 1, 0),
	BPF_STMT(BPF_RET+BPF_K, SECCOMP_FILTER_FAIL),
	BPF_STMT(BPF_LD+BPF_W+BPF_ABS,
		offsetof(struct seccomp_data, nr)),
	SC_ALLOW(getpid),
#ifdef __NR_getrandom
	SC_ALLOW(getrandom),
#endif
	SC_ALLOW(gettimeofday),
	SC_ALLOW(clock_gettime),
#ifdef __NR_time /* not defined on EABI ARM */
	SC_ALLOW(time),
#endif
	SC_ALLOW(read),
	SC_ALLOW(readv),
	SC_ALLOW(lseek),
	SC_ALLOW(fstat),
#ifdef __NR_newfstatat
	SC_ALLOW(newfstatat),
#endif
#ifdef __NR_statx
	SC_ALLOW(statx),
#endif
	SC_ALLOW(write),
	SC_ALLOW(writev),
	SC_ALLOW(close),
#ifdef __NR_fcntl64 /* only noted on arm */
	SC_ALLOW(fcntl64),
#endif
#ifdef __NR_shutdown /* not defined on archs that go via socketcall(2) */
	SC_ALLOW(shutdown),
#endif
	SC_ALLOW(brk),
#ifdef __NR_ppoll
	SC_ALLOW(ppoll),
#endif
#ifdef __NR_poll /* not defined on aarch64 */
	SC_ALLOW(poll),
#endif
#ifdef __NR__newselect
	SC_ALLOW(_newselect),
#endif
#ifdef __NR_select
	SC_ALLOW(select),
#endif
#ifdef __NR_pselect6
	SC_ALLOW(pselect6),
#endif
	SC_ALLOW(madvise),
#ifdef __NR_mmap2 /* EABI ARM only has mmap2() */
	SC_ALLOW(mmap2),
#endif
#ifdef __NR_mmap
	SC_ALLOW(mmap),
#endif
	SC_ALLOW(mremap),
	SC_ALLOW(munmap),
	SC_ALLOW(exit_group),
#ifdef __NR_rt_sigprocmask
	SC_ALLOW(rt_sigprocmask),
#else
	SC_ALLOW(sigprocmask),
#endif
	BPF_STMT(BPF_RET+BPF_K, SECCOMP_FILTER_FAIL),
};

static const struct sock_fprog filter = {
	.len = (unsigned short)(sizeof(preauth_work)/sizeof(preauth_work[0])),
	.filter = (struct sock_filter *)preauth_work,
};

int
main(void)
{
	if (prctl(PR_SET_NO_NEW_PRIVS, 1, 0, 0, 0) == -1)
		return 1;
	if (prctl(PR_SET_SECCOMP, SECCOMP_MODE_FILTER, &filter) == -1)
		return 1;
    /* SECURE. */
	puts("Hello, world!");
	return 0;
}
```
