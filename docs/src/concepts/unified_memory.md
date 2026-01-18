# Unified Memory Space

Fax-lang employs **Rule 3: Context-Agnostic Allocation**.

## The Concept

In traditional systems languages, the developer must explicitly choose between the Stack and the Heap. Fax-lang removes this cognitive load by analyzing data usage patterns at compile-time.

## How it Works

The compiler builds an **Access Graph** for every variable:

1.  **Stack Placement**: Small data (≤ 64 bytes) with short lifetimes and high-frequency access.
2.  **Heap Placement**: Large data structures or variables that must persist beyond the current scope.
3.  **Hybrid Placement**: A unique Fax-lang feature where "hot" parts of a structure stay on the stack for speed, while "cold" or large parts are transparently moved to the heap.

## Topology Optimization

The Unified Allocator also considers cache locality. If two variables are frequently accessed together, the compiler will attempt to place them in adjacent memory locations to minimize cache misses.
