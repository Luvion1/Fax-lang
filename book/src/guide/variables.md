# Variables & Mutability

In Fax-lang, variables are declared using the `let` keyword.

## Immutability by Default

To ensure safety and predictability, variables are immutable by default.

```fax
let x = 10;
x = 20; // ERROR: cannot assign twice to immutable variable
```

## Mutability

If you need to change a value, you must explicitly mark the variable as mutable using the `mut` keyword.

```fax
let mut counter = 0;
counter = counter + 1; // Valid
```

## Constants

Constants are declared with `const`. They are evaluated at compile-time and are inherently immutable.

```fax
const MAX_BUFFER_SIZE = 1024;
```

**Note:** Constants have **Infinite Life-Force**; they do not decay when accessed.

## Shadowing

Shadowing creates a **read-only view** of an existing variable. It is a powerful way to share data without granting modification rights.

```fax
let mut data = 50;
shadow view = data; // 'view' can read 'data' but cannot change it
```