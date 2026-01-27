# 📠 Fax-lang Syntax Reference

This document defines the official syntax of **Fax-lang**, a language that combines the power of C++ with modern safety and conciseness.

## 1. Variables & Constants
Fax uses type inference but remains very strict about data types. Semicolons `;` are optional.

```rust
let name = "Fax"          // Immutable constant
mut health = 100          // Mutable variable
let age: i32 = 25         // Explicit type annotation

health = 90               // OK
// name = "New"           // ERROR: let is immutable
```

## 2. Pointer & Reference System (The Checker's Heart)
To minimize C++ memory errors, Fax uses wrapper types verified by the Checker.

```rust
let value = 42
let p: ptr<i32> = ptr(value)  // Safe pointer
let r: ref<i32> = ref(value)  // Safe reference

// Checker guarantees that the lifetime of p and r doesn't exceed value.
// Pointer access:
let data = p.unwrap()
```

## 3. Functions
Functions are defined with `fn` in a concise style.

```rust
fn add(a: i32, b: i32) -> i32 {
    a + b  // Last expression without return becomes the return value
}

// Function with modern error handling
fn divide(a: f32, b: f32) -> Result<f32, String> {
    if b == 0.0 {
        return Error("Division by zero")
    }
    Ok(a / b)
}
```

## 4. Data Structures & Classes
Fax combines C++'s `struct` and `class` into one modern concept.

```rust
struct User {
    pub name: String
    priv id: u64

    // Constructor using 'init' keyword
    init(name: String, id: u64) {
        self.name = name
        self.id = id
    }

    pub fn display(self) {
        println("User: {self.name}")
    }
}
```

## 5. Control Flow
Cleaner syntax without unnecessary parentheses when not needed.

```rust
if health > 50 {
    println("Healthy")
} else {
    println("Warning")
}

// Match (Pattern Matching) - Stronger replacement for C++ switch
match health {
    100 => println("Full Health")
    0 => println("Game Over")
    _ => println("In Game")
}
```

## 6. Modern Error Handling
No slow `try-catch`. Fax uses `Result` and `Option`.

```rust
let file = open_file("config.txt")

// Using '?' operator for error propagation (like Rust/Swift)
let content = file?

// Or strict manual checking
if let Ok(data) = file {
    process(data)
}
```

## 7. C++ Interop (Modern FFI)
Import C++ libraries with Fax safety standards.

```rust
import_cpp "iostream" {
    namespace std {
        fn cout(data: any)
        let endl: any
    }
}

fn main() {
    std::cout("Hello Industrial World") << std::endl
}
```