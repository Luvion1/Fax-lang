# Variables & Mutability

Variables in Fax-lang are declared with the `let` keyword.

## Immutability by Default

By default, all variables in Fax-lang are immutable.

```fax
let x = 10;
x = 20; // ERROR: cannot assign twice to immutable variable
```

## Mutability

To make a variable mutable, use the `mut` keyword.

```fax
let mut counter = 0;
counter = counter + 1; // Valid
```

## Constants

Constants are declared with `const`. They must have a value that can be determined at compile-time.

```fax
const MAX_BUFFER_SIZE = 1024;
```

Constants have **infinite Life-Force** and do not decay when read.

## Shadowing

Shadowing creates a read-only view of an existing variable.

```fax
let mut data = 50;
shadow view = data;
```
