lang: C/C++
system: openbsd
subsystem: pledge
githubAttestations: 
    kristapsdz kristapsdz/kcaldav,
    kristapsdz kristapsdz/kcgi,
    kristapsdz kristapsdz/lowdown,
    kristapsdz kristapsdz/openradtool,
    kristapsdz kristapsdz/sblg,
    kristapsdz kristapsdz/sintl,
    kristapsdz kristapsdz/sqlite2mdoc,
    kristapsdz openbsd/src/tree/master/usr.bin/rsync,
    ischwarze https://cvsweb.bsd.lv/mandoc,
    djmdjm openssh/openssh-portable,

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
