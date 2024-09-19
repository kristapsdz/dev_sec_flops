lang: C/C++
system: FreeBSD
system-link: https://freebsd.org
subsystem: capsicum
notes: The sandbox itself doesn't handle forking, which I consider a resource
    we want to protect against; however, we can use resource limits to do that.
    I don't currently include that in this example.

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
