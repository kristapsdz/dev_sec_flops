lang: C/C++
system: FreeBSD
system-link: https://freebsd.org
subsystem: capsicum

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
