# Shadow & Mirroring

Fax-lang implements **Rule 1: Shadow & Mirroring with Page-based Copy**.

## Shadows

A `shadow` is a read-only view of a variable. It shares the same **Life-Force** as the original variable.

```fax
let mut x = 100;
shadow y = x; // y is a read-only view of x
```

- Shadows are **read-only**.
- Shadows share the energy consumption of the source.

## Mirroring (Lazy Copy)

When data is modified through a shadow (in more complex data structures like structs), Fax-lang uses **Differential Mirroring**. Instead of copying the whole object, it only mirrors the "pages" or fields that have changed.

This is more efficient than traditional Copy-on-Write (CoW) because it operates at a more granular level and is tracked by the compiler's semantic engine.

## Use Cases

Shadowing is preferred when you want to pass a reference to a function for reading without giving it ownership or the ability to modify, while still keeping the energy cost tied to the original data source.
