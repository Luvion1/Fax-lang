# Getting Started

Fax-lang is designed to be familiar yet powerful. This guide will help you write your first Fax program.

## Your First Program

Create a file named `hello.fx`:

```fax
fn main() {
    let message = "Hello, Fax-lang!";
    // Energy decay starts here!
    println(message);
}
```

## Running the Compiler

Use the `fax` tool (once installed) or run via npm:

```bash
npm run dev build hello.fx
./hello
```

## What's Next?

Learn about [Variables & Mutability](./variables.md) or dive into [Life-Force](./../concepts/life_force.md).
