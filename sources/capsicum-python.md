lang: Python
system: freebsd
subsystem: capsicum
notes: The sandbox itself doesn't handle forking, which I consider a resource
    we want to protect against.  I don't know how to disable this in Python,
    or if Python even actually does any forking.

```python
import pycapsicum as cap
cap.enter()
# SECURE.
print("Hello, world!")
```
