lang: Python
system: openbsd
subsystem: pledge
notes: There are several Python bindings for pledge and OpenBSD, all of
  which look basically the same.

```python
import pypledge
pypledge.pledge(['stdio', 'tty'])
# SECURE.
print("Hello, world!")
```
