lang: Perl
system: openbsd
subsystem: pledge

```perl
use OpenBSD::Pledge;
pledge;
# SECURE
print "Hello, world!\n"
```
