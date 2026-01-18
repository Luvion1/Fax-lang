# Shadow & Mirroring

Fax-lang implements **Rule 1: Shadow & Mirroring with Page-based Copy**. This is a high-performance alternative to traditional Copy-on-Write (CoW).

## Shadows

A `shadow` is a read-only view of a variable. It shares the same **Life-Force** as the original variable.

```fax
let mut x = BigData::new();
shadow y = x; // y is a read-only view of x
```

- Shadows are **read-only**.
- Shadows share the energy consumption of the source.
- Shadows do not move or copy data upon creation.

## Mirroring (Differential Copy)

When data is modified through a shadow (in more complex data structures like structs), Fax-lang uses **Differential Mirroring**.

Unlike traditional CoW which might copy an entire object or large buffer, Fax-lang's mirroring works on a **page-level** (typically 4KB).

1. **Access Tracking**: The compiler tracks which segments of the data are accessed through the shadow.
2. **Lazy Mirroring**: Only when a segment is actually modified does the compiler create a "Mirror" of that specific page.
3. **Reconciliation**: When the shadow is merged back or the original data is updated, only the mirrored pages are synchronized.

This optimization ensures that even with massive data structures, small updates remain constant-time and cache-friendly.

## Why not just use References?

References in other languages often require complex lifetime tracking (like Rust) or garbage collection (like Java). Shadows provide a middle ground: they are safe, read-only views that are semantically tied to the original data's life-cycle, without the overhead of tracking every pointer's validity.

