lang: Python
system: FreeBSD
system-link: https://freebsd.org
subsystem: capsicum
notes: The sandbox itself doesn't handle forking, which I consider a resource
    we want to protect against.  I don't know how to disable this in Python,
    or if Python even actually does any forking.

```python
import pycapsicum as cap
cap.enter()
print("Hello, world!")
```
