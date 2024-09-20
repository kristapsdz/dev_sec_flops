lang: C/C++
system: mac os x
subsystem: sandbox
githubAttestations: 
    kristapsdz kristapsdz/kcaldav,
    kristapsdz kristapsdz/kcgi,
    kristapsdz kristapsdz/lowdown,
    kristapsdz kristapsdz/sblg,
    kristapsdz kristapsdz/sqlite2mdoc,

```c
#include <sandbox.h> /* sandbox_init(3), etc. */
#include <stdio.h> /* puts(3) */

int
main(void)
{
    char    *er;
    if (sandbox_init(kSBXProfilePureComputation, SANDBOX_NAMED, &er) != 0)
        return 1;
    /* SECURE. */
    puts("Hello, world!");
    return 0;
}
```
