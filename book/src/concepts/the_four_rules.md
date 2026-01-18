# The Four Rules of Fax-lang

Fax-lang is built upon four fundamental rules that govern memory, state, and execution. These rules ensure performance and safety without a traditional garbage collector or complex borrow checker.

## Rule 1: Shadow & Mirroring (Differential Copy)
Data access is managed through read-only **Shadows**. When a modification is requested, instead of copying the entire data structure, the compiler creates a **Mirror** of only the modified segments (pages).

## Rule 2: Life-Force (Adaptive Decay)
Every variable has an energy level called **Life-Force**.
- Accessing data consumes Life-Force.
- When Life-Force reaches zero, the variable is exhausted.
- This enforces efficient access patterns and enables deterministic cleanup.

## Rule 3: Unified Memory Space (Context-Agnostic Allocation)
The compiler, not the developer, decides where data lives (Stack, Heap, or Hybrid). This decision is based on the data's size, lifetime, and access frequency, optimizing for cache locality automatically.

## Rule 4: Contractual States (State Machines)
State machines are first-class citizens. Transitions are checked at compile-time, ensuring that a resource can only be used when it is in a valid state. This replaces many runtime checks and complex error handling logic.
