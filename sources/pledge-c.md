lang: C/C++
system: OpenBSD
system-link: https://openbsd.org
subsystem: pledge

```c
#include <unistd.h> /* pledge(2) */
#include <stdio.h> /* puts(3) */

int
main(void)
{
	if (pledge("stdin", NULL) == -1)
		return 1;
	/* SECURE. */
	puts("Hello, world!");
	return 0;
}
```
