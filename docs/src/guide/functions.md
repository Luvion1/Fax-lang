# Functions

Functions are the primary building blocks of Fax-lang programs.

## Syntax

Functions are declared using the `fn` keyword.

```fax
fn add(a: i32, b: i32) -> i32 {
    return a + b;
}
```

## Parameters and Return Types

- **Parameters**: Must have explicit type annotations.
- **Return Type**: Specified after the `->` arrow.
- **Main Function**: The entry point of every program is `fn main()`.

## Life-Force in Functions

When you pass a variable to a function, its **Life-Force** continues to decay based on how it's used inside that function. Shadowing is often used to pass read-only views to functions without moving ownership.
