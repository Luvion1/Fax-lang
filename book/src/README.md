# Introduction to Fax-lang

Welcome to the **Fax Programming Language** documentation.

Fax is a systems programming language designed for **extreme memory safety** and **deterministic state transitions** without a garbage collector or traditional borrow checker.

## Core Philosophy

Fax-lang is built on four fundamental pillars:

1.  **Contractual State Machines**: State transitions are first-class citizens and are verified at compile-time.
2.  **Life-Force Tracking**: Every variable has an "energy" level that decays with usage, preventing over-use and ensuring deterministic cleanup.
3.  **Shadow & Mirroring**: Data access is managed through read-only views (shadows) that lazily create mirrors for modifications.
4.  **Unified Memory Space**: The compiler automatically decides whether data lives on the stack, heap, or a hybrid of both based on access patterns.

## Why Fax?

Traditional languages either use garbage collection (which introduces latency) or manual memory management/borrow checking (which can be complex). Fax-lang introduces a **probabilistic yet deterministic** approach to memory safety through the concept of **Life-Force**.
