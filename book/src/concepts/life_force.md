# Memory Management: Life-Force

The most unique feature of Fax-lang is its **Life-Force** system (Rule 2).

## What is Life-Force?

Every variable in Fax-lang is born with a life-force of `1.0`. As you use the variable, its life-force decays.

- **Read Access**: Decays by `0.02`.
- **Write Access**: Decays by `0.08`.
- **Heavy Operations**: Decays by `0.15`.

When a variable's life-force reaches `0.0`, the variable is considered **exhausted** and can no longer be accessed.

## Why this system?

This system prevents "hot-spot" memory access from becoming bottlenecks and encourages efficient code. It also provides a unique way to handle cleanup: when life-force is depleted, the compiler can deterministically schedule memory reclamation.

## Boosting Life-Force

You can "boost" a variable's life-force through certain operations, representing the "feeding" of data back into the hot path of the application.

```fax
let x = 10;
// After many reads, x is low on energy.
// The compiler tracks this semantically.
```

## Compilation Errors

If you attempt to access a variable that the compiler determines *could* be exhausted, it will throw an `E002` error:

```text
error[E002]: variable `x` has been exhausted
  --> main.fx:10:5
   |
10 |     let y = x;
   |             ^~
   |
   = help: Energy depleted. Reading from this variable costs 0.02 Life-Force.
```
