# Compiler Internals

The Fax-lang compiler is built with a modular architecture using TypeScript and LLVM.

## Compilation Pipeline

1.  **Lexer**: Tokenizes the source code.
2.  **Parser**: Generates an Abstract Syntax Tree (AST).
3.  **Semantic Checker**: Validates memory rules (Life-Force, State Transitions).
4.  **Code Generator**: Produces LLVM IR (`.ll` files).
5.  **LLVM Backend**: `llc` converts IR to object files, and `clang` links them to a native binary.

## Unique Checks

The **Semantic Checker** is the heart of Fax-lang. It maintains a metadata map of every variable to track its energy level and current state machine status at compile-time.
