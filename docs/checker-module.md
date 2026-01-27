# Checker Module Documentation

## Overview
The Checker module performs static analysis and type checking on the AST. It verifies type correctness, variable declarations, and other semantic rules of the Fax language.

## Architecture
The checker is implemented in Go for its simplicity and strong standard library. It implements a visitor pattern to traverse the AST and perform type checking.

## API Reference

### `TypeChecker` struct
```go
type TypeChecker struct {
    Symbols map[string]Type          // Symbol table for variable and function declarations
    currentReturnType Type            // Current function return type for checking return statements
    errors []*CheckerError           // Error reporting
}
```

#### Methods
- `NewTypeChecker() *TypeChecker`: Creates a new type checker instance
- `Check(node Node) error`: Performs type checking on the provided AST node
- `AddError(msg string, pos ErrorPosition, errType ErrorType)`: Adds an error to the checker's error list
- `HasErrors() bool`: Returns true if there are errors
- `GetErrors() []*CheckerError`: Returns all collected errors

### AST Node Interfaces
```go
type Node interface {
    GetType() NodeType
    GetPos() (int, int)
}

type Statement interface {
    Node
    statementNode()
}

type Expression interface {
    Node
    expressionNode()
}
```

### Type System
```go
type Type string

const (
    IntType    Type = "int"
    FloatType  Type = "float"
    BoolType   Type = "bool"
    StringType Type = "string"
    VoidType   Type = "void"
    AnyType    Type = "any"
)
```

### `CheckerError` struct
```go
type CheckerError struct {
    Message   string
    Pos       ErrorPosition
    ErrorType ErrorType
}

func (e *CheckerError) Error() string
```

### `ErrorPosition` struct
```go
type ErrorPosition struct {
    Line int
    Col  int
    Pos  int // Absolute position in source
}
```

### `ErrorType` enum
```go
type ErrorType int

const (
    SyntaxError ErrorType = iota
    TypeError
    NameError
    ValueError
    RuntimeError
)
```

## Implementation Details

### Symbol Table
The checker maintains a symbol table to track variable and function declarations. It handles scoping by creating new symbol tables for function bodies and restoring the previous one after the function body is processed.

### Type Checking
The checker performs type checking by:
1. Inferring types from literal values
2. Checking type compatibility in assignments
3. Verifying function call arguments match parameter types
4. Ensuring return statements match function return type

### Scoping
The checker handles nested scopes by maintaining a stack of symbol tables. When entering a new scope (like a function or block), it creates a new symbol table and restores the previous one when exiting the scope.

## Error Handling
The checker collects all errors during the checking process and reports them together. This allows for more comprehensive error reporting rather than stopping at the first error.

## Performance Considerations
- Single-pass traversal of the AST
- Efficient symbol table lookups using hash maps
- Early termination of checking when errors are detected (optional)