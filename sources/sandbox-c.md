lang: C/C++
system: Mac OS X
subsystem: sandbox
deprecated: true

```c
#include <sandbox.h> /* sandbox_init(3), etc. */
#include <stdio.h> /* puts(3) */

int
main(void)
{
    char    *er;
    if (sandbox_init(kSBXProfilePureComputation, SANDBOX_NAMED, &er) != 0)
        return 1;
    puts("Hello, world!");
    return 0;
}
```
