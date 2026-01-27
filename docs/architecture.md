# Fax-lang Architecture

## Overview
This document describes the modular architecture of the Fax-lang compiler and ecosystem. The architecture follows a microservices-like approach where each component has a well-defined responsibility and interface. The design features multiple levels of granularity to enable ultimate specialization and maintainability.

## Multi-Language Compiler Architecture

### 1. Zig - Tokenization and Parsing
- Responsible for tokenizing source code
- Parses basic syntax structure
- Outputs token representation for next stage
- Leverages Zig's speed and low-level control
- Used in the Lexer and Parser modules

### 2. Go - Static Checking and Safety Analysis
- Performs common error checking
- Validates code structure
- Conducts basic safety analysis
- Leverages Go's concurrency and speed
- Used in the Checker module

### 3. Rust - Deep Analysis and Validation
- Performs deep analysis of code
- Checks complex issues like lifetimes and ownership
- Ensures memory safety before transpilation
- Leverages Rust's ownership system and memory safety
- Used in the Analyzer module

### 4. C++ - Target Language
- Final destination of transpilation process
- Generates efficient, optimal code
- Leverages high-performance capabilities of C++
- Used in the Transpiler module

### 5. Python - Orchestration and Testing
- Orchestrates the entire compiler pipeline
- Provides user interface
- Used for testing and debugging
- NOT part of main compiler system, only for development
- Used in the Transpiler module for code generation

## Compiler Pipeline

1. Input: .fax file
2. Tokenization: Zig parses into tokens
3. Static Check: Go checks for common errors
4. Deep Analysis: Rust checks for complex issues
5. Transpilation: Coordinated conversion to C++
6. Output: .cpp file ready for compilation
7. Compilation: GCC produces executable

## Compiler Modules

### 1. Lexer Module (`/compiler/lexer`)
Converts source code into tokens.
- **Language**: Zig
- **Purpose**: Tokenization of source code

#### Components:
- `tokens/`: Different token types
  - `keyword/`: Language keywords
  - `punctuation/`: Punctuation marks
  - `identifier/`: Variable and function names
  - `literal/`: Numeric, string, and boolean values
  - `operator/`: Arithmetic and logical operators
- `utils/`: Helper functions
- `errors/`: Error handling

### 2. Parser Module (`/compiler/parser`)
Converts tokens into Abstract Syntax Tree (AST).
- **Language**: Zig
- **Purpose**: Parsing token stream into AST

#### Components:
- `nodes/`: AST node definitions
  - `expression/`: Expression nodes
  - `statement/`: Statement nodes
  - `declaration/`: Declaration nodes
  - `type/`: Type annotation nodes
- `grammar/`: Grammar rules
- `errors/`: Error handling
- `utils/`: Helper functions

### 3. Checker Module (`/compiler/checker`)
Performs static analysis and type checking.
- **Language**: Go
- **Purpose**: Static analysis and safety validation

#### Components:
- `type_checker/`: Type checking
  - `primitives/`: Primitive type checking
  - `functions/`: Function type checking
  - `structures/`: Struct/class type checking
- `safety_analyzer/`: Safety analysis
  - `memory/`: Memory safety checks
  - `threads/`: Thread safety checks
- `errors/`: Error handling
- `utils/`: Helper functions

### 4. Analyzer Module (`/compiler/analyzer`)
Deep analysis of code properties.
- **Language**: Rust
- **Purpose**: Deep analysis including ownership and lifetime validation

#### Components:
- `ownership/`: Ownership analysis
  - `borrowing/`: Borrow checking
  - `moves/`: Move semantics
- `lifetime/`: Lifetime analysis
- `validation/`: Validation routines
- `errors/`: Error handling
- `utils/`: Helper functions

### 5. Transpiler Module (`/compiler/transpiler`)
Converts AST to C++ code.
- **Language**: Python (orchestration), C++ (target)
- **Purpose**: Convert AST to optimized C++ code

#### Components:
- `generators/`: Code generators
  - `expressions/`: Expression code generation
  - `statements/`: Statement code generation
  - `declarations/`: Declaration code generation
- `cpp/`: C++-specific logic
- `output/`: Output formatting
- `errors/`: Error handling
- `utils/`: Helper functions

## Standard Library (`/src`)

### Core Components:
- `core/`: Basic language features
  - `types/`: Type definitions
  - `values/`: Value manipulation
  - `operators/`: Operators
  - `control_flow/`: Control flow
- `io/`: Input/output
  - `console/`: Console I/O
  - `file/`: File I/O
  - `network/`: Network I/O
- `mem/`: Memory management
  - `allocator/`: Memory allocators
  - `smart_pointers/`: Smart pointers
- `math/`: Math operations
  - `basic/`: Basic arithmetic
  - `trigonometry/`: Trigonometric functions
- `string/`: String operations
  - `manipulation/`: String manipulation
  - `regex/`: Regular expressions
- `container/`: Data structures
  - `array/`: Arrays
  - `vector/`: Dynamic arrays
  - `map/`: Maps
  - `set/`: Sets
- `concurrency/`: Concurrency
  - `threading/`: Threading
  - `async/`: Async operations

## Testing Framework (`/tests`)

### Test Types:
- `unit/`: Individual module tests
  - `lexer/`: Lexer tests
  - `parser/`: Parser tests
  - `checker/`: Checker tests
  - `analyzer/`: Analyzer tests
  - `transpiler/`: Transpiler tests
- `integration/`: Integration tests
- `e2e/`: End-to-end tests
- `performance/`: Performance benchmarks

## Examples (`/examples`)

### Example Types:
- `basic/`: Basic features
  - `hello_world/`: Hello world
  - `variables/`: Variables
  - `control_flow/`: Control flow
  - `functions/`: Functions
- `advanced/`: Advanced features
  - `data_structures/`: Data structures
  - `error_handling/`: Error handling
- `interop/`: Interoperability
  - `c_integration/`: C integration

## Developer Tools (`/tools`)

### Tool Types:
- `formatter/`: Code formatting
- `linter/`: Code analysis
- `debugger/`: Debugging
- `profiler/`: Performance profiling
- `generator/`: Code generation

## Advantages of This Approach

- Each language used for its strengths
- Modular system simplifies development and maintenance
- Maximum performance from each component
- Comprehensive validation before generating target code
- Ultimate specialization through granular module structure
- Independent development of specific language features
- Fine-grained reusability of components
- Scalable maintenance with issue isolation