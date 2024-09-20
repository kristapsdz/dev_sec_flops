lang: Rust
system: OpenBSD
system-link: https://openbsd.org
subsystem: pledge
notes: There are lots of rust bindings for pledge and OpenBSD, all of
  which look basically the same.  This arbitrarily uses one with the
  openbsd namespace.

```rust
use openbsd::pledge;
fn main() {
    pledge!("stdio")?;
    // SECURE.
    println!("Hello, world!");
}
```
