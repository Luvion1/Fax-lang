# Fax-lang Architecture

Fax is an industrial-strength programming language designed as a safety layer for C++. It serves as an aggressive type checker that transpiles code into 100% safe, efficient C++ that is free of memory bugs.

## Modular Polyglot Architecture

The Fax compiler follows a modular architecture where each phase is implemented in the language best suited for its task, ensuring high performance and maintainability.

### 1. Lexer (Rust)
- **Location**: `compiler/lexer`
- **Purpose**: Tokenizes raw source code into a stream of JSON tokens.
- **Why Rust?**: Provides extreme performance and memory safety for low-level string processing.

### 2. Parser (TypeScript)
- **Location**: `compiler/parser`
- **Purpose**: Converts the token stream into a high-level Abstract Syntax Tree (AST).
- **Why TypeScript?**: Offers excellent tooling for complex tree structures and grammar rules.

### 3. Checker (Rust)
- **Location**: `compiler/checker`
- **Purpose**: Performs static type checking and semantic validation.
- **Why Rust?**: Ensures the checker itself is robust and can handle complex symbol tables efficiently.

### 4. Analyzer (Rust)
- **Location**: `compiler/analyzer`
- **Purpose**: Implements the **Borrow Checker** and **Move Semantics** analysis.
- **Why Rust?**: Leveraging Rust's own safety philosophy to enforce similar guarantees in Fax code.

### 5. Transpiler (Python)
- **Location**: `compiler/transpiler`
- **Purpose**: Converts the analyzed AST into optimized, corporate-standard C++ code.
- **Why Python?**: Ideal for complex string manipulation and template-based code generation.

## Communication Protocol

Modules communicate through a standardized **JSON-based AST protocol**. This allows each module to be developed and tested independently.

### Unified Diagnostic System
All modules utilize a unified JSON schema for error reporting:
- `code`: Unique error identifier (e.g., `E0382`).
- `message`: High-level error summary.
- `primary_span`: Location of the main error.
- `secondary_spans`: Contextual locations (e.g., where a variable was first defined).
- `suggestion`: Automated fix suggestions.

## Development Workflow

The compiler orchestration is managed by `compiler/main.js` (Node.js), which coordinates the data flow between modules:
1. `Lexer` -> `tokens.json`
2. `Parser` -> `ast.json`
3. `Checker/Analyzer` -> `analyzed_ast.json`
4. `Transpiler` -> `output.cpp`

## Standards & Conventions

- **C++ Output**: Adheres to modern C++ standards (C++11/14/17+), uses namespaces (`fax_app`), and includes industrial-grade error handling.
- **Error Messages**: Modeled after Rust's rich diagnostics for maximum developer productivity.
