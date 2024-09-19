lang: Perl
system: OpenBSD
system-link: https://openbsd.org
subsystem: pledge

```perl
use OpenBSD::Pledge;
pledge;
# SECURE
print "Hello, world!\n"
```
