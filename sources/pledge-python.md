lang: Python
system: OpenBSD
system-link: https://openbsd.org
subsystem: pledge
notes: There are several Python bindings for pledge and OpenBSD, all of
  which look basically the same.

```python
import pypledge
pypledge.pledge(['stdio', 'tty'])
# SECURE.
print("Hello, world!")
```
