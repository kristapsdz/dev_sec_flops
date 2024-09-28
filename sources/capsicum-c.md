lang: C/C++
system: freebsd
subsystem: capsicum
notes: The sandbox itself doesn't handle forking, which I consider a resource
    we want to protect against; however, we can use resource limits to do that.
    I don't currently include that in this example.
githubAttestations: 
    kristapsdz kristapsdz/kcgi,
    kristapsdz kristapsdz/lowdown,
    djmdjm openssh/openssh-portable,
    rwatson chromium/chromium,
freebsdAttestations:
    oshogbo usr.bin/basename,
    oshogbo usr.bin/col,
    eadler usr.bin/dc,
    oshogbo usr.bin/diff,
    oshogbo usr.bin/diff3,
    oshogbo usr.bin/dirname,
    oshogbo usr.bin/elfdump,
    oshogbo usr.bin/getopt,
    oshogbo usr.bin/hexdump,
    oshogbo usr.bin/iconv,
    oshogbo usr.bin/ident,
    oshogbo usr.bin/indent,
    oshogbo usr.bin/jot,
    oshogbo usr.bin/kdump,
    ceme usr.bin/ktrdump,
    oshogbo usr.bin/lam,
    oshogbo usr.bin/last,
    oshogbo usr.bin/logname,
    oshogbo usr.bin/ministat,
    oshogbo usr.bin/pom,
    oshogbo usr.bin/primes,
    oshogbo usr.bin/printenv,
    oshogbo usr.bin/rwho,
    oshogbo usr.bin/tee,
    oshogbo usr.bin/tr,
    oshogbo usr.bin/uniq,
    oshogbo usr.bin/units,
    oshogbo usr.bin/wc,
    oshogbo usr.bin/write,
    oshogbo usr.bin/yes,
    oshogbo usr.sbin/bhyve,
    oshogbo usr.sbin/rwhod,

```c
#include <sys/capsicum.h> /* cap_enter(2) */
#include <stdio.h> /* puts(3) */

int
main(void)
{
	if (cap_enter() == -1)
		return 1;
	/* SECURE. */
	puts("Hello, world!");
	return 0;
}
```
