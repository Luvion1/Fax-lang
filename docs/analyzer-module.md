# Analyzer Module Documentation

## Overview
The Analyzer module performs deep analysis of code properties, including ownership and lifetime analysis. It implements Rust-style ownership semantics to ensure memory safety.

## Architecture
The analyzer is implemented in Rust for its advanced ownership system and memory safety features. It consists of two main analyzers: ownership analyzer and lifetime analyzer.

## API Reference

### `Analyzer` struct
```rust
pub struct Analyzer {
    ownership_analyzer: OwnershipAnalyzer,
    lifetime_analyzer: LifetimeAnalyzer,
}
```

#### Methods
- `new() -> Self`: Creates a new analyzer instance
- `analyze(&mut self, program: &Program) -> Result<(), AnalysisError>`: Performs analysis on the program

### `OwnershipAnalyzer` struct
```rust
pub struct OwnershipAnalyzer {
    ownership_map: HashMap<String, OwnershipState>,
    lifetime_map: HashMap<String, Lifetime>,
}
```

#### Methods
- `new() -> Self`: Creates a new ownership analyzer
- `analyze(&mut self, program: &Program) -> Result<(), AnalysisError>`: Performs ownership analysis

### `LifetimeAnalyzer` struct
```rust
pub struct LifetimeAnalyzer {
    lifetime_map: HashMap<String, Lifetime>,
    current_scope: usize,
}
```

#### Methods
- `new() -> Self`: Creates a new lifetime analyzer
- `analyze(&mut self, program: &Program) -> Result<(), AnalysisError>`: Performs lifetime analysis

### `AnalysisError` struct
```rust
pub struct AnalysisError {
    pub message: String,
    pub line: usize,
    pub column: usize,
    pub position: usize,
    pub error_type: AnalysisErrorType,
}
```

### `AnalysisErrorType` enum
```rust
pub enum AnalysisErrorType {
    OwnershipError,
    BorrowError,
    LifetimeError,
    MoveError,
    SyntaxError,
    TypeError,
}
```

### `OwnershipState` enum
```rust
pub enum OwnershipState {
    Owned,
    BorrowedShared,
    BorrowedMutable,
    Moved,
}
```

### `Lifetime` enum
```rust
pub enum Lifetime {
    Local(usize), // Scope ID
    Parameter,
    Return,
}
```

## Implementation Details

### Ownership Analysis
The ownership analyzer tracks the ownership state of each variable:
1. `Owned`: The variable owns the value
2. `BorrowedShared`: The value is borrowed immutably
3. `BorrowedMutable`: The value is borrowed mutably
4. `Moved`: The value has been moved to another variable

The analyzer ensures that:
- A value can only be borrowed immutably when it's owned
- A value can only be borrowed mutably when it's owned and not already borrowed
- A value can only be moved when it's owned and not borrowed
- A value that has been moved cannot be accessed again

### Lifetime Analysis
The lifetime analyzer tracks the lifetime of each variable:
1. `Local(scope_id)`: The variable is local to a specific scope
2. `Parameter`: The variable is a function parameter
3. `Return`: The variable is a return value

The analyzer ensures that:
- Local variables don't outlive their scope
- References don't outlive the values they refer to
- Return values have appropriate lifetimes

### Branch Analysis
The analyzer handles conditional branches by creating temporary analyzers for each branch and merging the results appropriately.

## Error Handling
The analyzer provides detailed error information including line, column, position, and error type when encountering ownership or lifetime violations.

## Performance Considerations
- Uses efficient HashMap lookups for ownership and lifetime tracking
- Implements proper scoping to minimize analysis overhead
- Uses temporary analyzers for branch analysis to avoid complex state management