# Control Flow

Fax-lang provides standard control flow structures, but many of them function as **expressions**.

## If Expressions

In Fax-lang, `if` is an expression, meaning it returns a value.

```fax
let x = 10;
let y = 20;

let result = if x > y {
    x
} else {
    y
};
```

## Loops

### While Loop
The `while` loop continues as long as a condition is met. Note that every operation inside the loop consumes **Life-Force** from the involved variables.

```fax
let mut i = 0;
while i < 10 {
    i = i + 1;
}
```

## Match Expressions (Experimental)

> **Note:** `match` expressions are currently in the experimental phase and may not be fully supported by all backends.

`match` provides powerful pattern matching, especially useful when working with **State Machines** or Enums.

```fax
match connection_state {
    Closed => println("Retry?"),
    Connected => println("Online"),
    _ => println("Unknown")
}
```
