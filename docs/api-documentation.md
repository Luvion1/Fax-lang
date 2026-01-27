# Fax-lang Compiler API Documentation

## Table of Contents
1. [Lexer Module (Rust)](#lexer-module-rust)
2. [Parser Module (TypeScript)](#parser-module-typescript)
3. [Checker Module (Go)](#checker-module-go)
4. [Analyzer Module (Rust)](#analyzer-module-rust)
5. [Transpiler Module (Python)](#transpiler-module-python)
6. [Plugin System (JavaScript)](#plugin-system-javascript)
7. [Logging System (JavaScript)](#logging-system-javascript)
8. [Build System (JavaScript)](#build-system-javascript)

## Lexer Module (Rust)

The Lexer module is responsible for converting source code into a stream of tokens.

### Public API

#### `Lexer` struct
- `new(input: &str) -> Lexer`: Creates a new lexer instance with the provided input string
- `next_token(&mut self) -> Result<Token, LexerError>`: Returns the next token from the input
- `tokenize(&mut self) -> Result<Vec<Token>, LexerError>`: Tokenizes the entire input and returns a vector of tokens

#### `TokenType` enum
Represents the different types of tokens:
- `Let`, `Var`, `Const`, `Fn`, `Struct`, etc. (keywords)
- `Identifier(String)` - variable/function names
- `IntegerLiteral(i64)`, `FloatLiteral(f64)`, `StringLiteral(String)`, etc. (literals)
- `Plus`, `Minus`, `Multiply`, `Divide`, etc. (operators)
- `LeftParen`, `RightParen`, `LeftBrace`, etc. (punctuation)
- `Eof` - end of file marker

#### `Token` struct
Contains:
- `token_type: TokenType` - the type of the token
- `value: String` - the string value of the token
- `line: usize` - line number in the source
- `column: usize` - column number in the source
- `position: usize` - absolute position in the source

#### `LexerError` struct
Contains:
- `message: String` - error message
- `line: usize` - line where error occurred
- `column: usize` - column where error occurred
- `position: usize` - absolute position where error occurred
- `error_type: LexerErrorType` - type of the error

#### `LexerErrorType` enum
- `InvalidCharacter` - invalid character in source
- `UnterminatedString` - unterminated string literal
- `InvalidNumber` - invalid number format
- `UnexpectedEof` - unexpected end of file
- `IoError` - IO error during lexing

### Example Usage

```rust
use lexer::{Lexer, Token};

let input = "let x = 42;";
let mut lexer = Lexer::new(input);
let tokens = lexer.tokenize().expect("Failed to tokenize");

for token in tokens {
    println!("{:?}", token);
}
```

## Parser Module (TypeScript)

The Parser module converts a stream of tokens into an Abstract Syntax Tree (AST).

### Public API

#### `Parser` class
- `constructor(tokens: Token[])`: Creates a new parser with the provided tokens
- `parse(): Program`: Parses the tokens and returns the AST root node

#### AST Node Types
- `Program`: Root of the AST
- `VariableDeclaration`: Variable declarations
- `FunctionDeclaration`: Function declarations
- `ExpressionStatement`: Expression statements
- `IfStatement`: If statements
- `WhileStatement`: While loops
- `ReturnStatement`: Return statements
- `Identifier`: Variable identifiers
- `Literal`: Literal values
- `BinaryExpression`: Binary operations
- `UnaryExpression`: Unary operations
- `CallExpression`: Function calls
- `MemberExpression`: Member access

#### Token Types
Same as defined in the lexer module but represented as TypeScript types.

#### `ParserError` class
Extends JavaScript Error with:
- `line: number` - line number where error occurred
- `column: number` - column number where error occurred
- `position?: number` - absolute position where error occurred
- `errorType: ErrorType` - type of the error

#### `ErrorType` enum
- `SyntaxError` - syntax errors
- `TypeError` - type errors
- `NameError` - name errors
- `ValueError` - value errors
- `RuntimeError` - runtime errors

### Example Usage

```typescript
import { Parser, Token, TokenType } from './parser';

const tokens: Token[] = [
  { tokenType: 'Let', value: 'let', line: 1, column: 1 },
  { tokenType: 'Identifier', value: 'x', line: 1, column: 5 },
  { tokenType: 'Assign', value: '=', line: 1, column: 7 },
  { tokenType: 'IntegerLiteral', value: '42', line: 1, column: 9 },
  { tokenType: 'Semicolon', value: ';', line: 1, column: 11 },
  { tokenType: 'Eof', value: '', line: 1, column: 12 }
];

const parser = new Parser(tokens);
const ast = parser.parse();
console.log(JSON.stringify(ast, null, 2));
```

## Checker Module (Go)

The Checker module performs static analysis and type checking on the AST.

### Public API

#### `TypeChecker` struct
- `NewTypeChecker() *TypeChecker`: Creates a new type checker instance
- `Check(node Node) error`: Performs type checking on the provided AST node
- `AddError(msg string, pos ErrorPosition, errType ErrorType)`: Adds an error to the checker's error list
- `HasErrors() bool`: Returns true if there are errors
- `GetErrors() []*CheckerError`: Returns all collected errors

#### AST Node Interfaces
- `Node`: Base interface for all AST nodes
- `Statement`: Interface for statement nodes
- `Expression`: Interface for expression nodes

#### Type System
- `Type`: Represents a data type in the language
- Constants: `IntType`, `FloatType`, `BoolType`, `StringType`, `VoidType`, `AnyType`

#### `CheckerError` struct
Contains:
- `Message string`: Error message
- `Pos ErrorPosition`: Position information
- `ErrorType ErrorType`: Type of the error

#### `ErrorPosition` struct
Contains:
- `Line int`: Line number
- `Col int`: Column number
- `Pos int`: Absolute position in source

#### `ErrorType` enum
- `SyntaxError`
- `TypeError`
- `NameError`
- `ValueError`
- `RuntimeError`

### Example Usage

```go
package main

import (
    "fmt"
    "./checker"
)

func main() {
    checker := NewTypeChecker()
    
    // Create a simple variable declaration for testing
    varDecl := createTestVariableDeclaration("x", "int", true)
    
    // Perform type checking
    err := checker.Check(varDecl)
    if err != nil {
        fmt.Printf("Type checking error: %v\n", err)
    } else {
        fmt.Println("Type checking passed!")
    }
}
```

## Analyzer Module (Rust)

The Analyzer module performs deep analysis of code properties, including ownership and lifetime analysis.

### Public API

#### `Analyzer` struct
- `new() -> Analyzer`: Creates a new analyzer instance
- `analyze(&mut self, program: &Program) -> Result<(), AnalysisError>`: Performs analysis on the program

#### `OwnershipAnalyzer` struct
- `new() -> OwnershipAnalyzer`: Creates a new ownership analyzer
- `analyze(&mut self, program: &Program) -> Result<(), AnalysisError>`: Performs ownership analysis

#### `LifetimeAnalyzer` struct
- `new() -> LifetimeAnalyzer`: Creates a new lifetime analyzer
- `analyze(&mut self, program: &Program) -> Result<(), AnalysisError>`: Performs lifetime analysis

#### `AnalysisError` struct
Contains:
- `message: String`: Error message
- `line: usize`: Line number where error occurred
- `column: usize`: Column number where error occurred
- `position: usize`: Absolute position where error occurred
- `error_type: AnalysisErrorType`: Type of the analysis error

#### `AnalysisErrorType` enum
- `OwnershipError`: Ownership-related error
- `BorrowError`: Borrowing-related error
- `LifetimeError`: Lifetime-related error
- `MoveError`: Move-related error
- `SyntaxError`: Syntax error
- `TypeError`: Type error

#### `OwnershipState` enum
- `Owned`: Value is owned
- `BorrowedShared`: Value is borrowed immutably
- `BorrowedMutable`: Value is borrowed mutably
- `Moved`: Value has been moved

#### `Lifetime` enum
- `Local(usize)`: Local to a specific scope
- `Parameter`: Function parameter
- `Return`: Return value

### Example Usage

```rust
use analyzer::{Analyzer, Program};

let mut analyzer = Analyzer::new();
let program = /* your program AST */;

match analyzer.analyze(&program) {
    Ok(()) => println!("Analysis completed successfully"),
    Err(e) => println!("Analysis error: {}", e),
}
```

## Transpiler Module (Python)

The Transpiler module converts the AST to target language code (C++).

### Public API

#### `CppTranspiler` class
- `__init__()`: Creates a new transpiler instance
- `transpile(self, ast: dict) -> str`: Converts the AST to C++ code
- `visit_node(self, node: dict)`: Visits and processes a single AST node
- `convert_type(self, fax_type: str) -> str`: Converts Fax type to C++ type
- `evaluate_expression(self, node: dict) -> str`: Evaluates an expression node

#### `TranspilerError` class
Extends Python Exception with:
- `message: str`: Error message
- `line: int`: Line number where error occurred
- `col: int`: Column number where error occurred
- `position: int`: Absolute position where error occurred
- `error_type: TranspilerErrorType`: Type of the error

#### `TranspilerErrorType` enum
- `SYNTAX_ERROR`: Syntax error
- `TYPE_ERROR`: Type error
- `NAME_ERROR`: Name error
- `VALUE_ERROR`: Value error
- `GENERATION_ERROR`: Code generation error

### Example Usage

```python
from transpiler.main import CppTranspiler

# Example AST for: let x = 42; fn main() { return x; }
example_ast = {
    "type": "Program",
    "body": [
        {
            "type": "VariableDeclaration",
            "identifier": "x",
            "dataType": "int",
            "initializer": {
                "type": "Literal",
                "value": 42
            },
            "mutable": True
        },
        {
            "type": "FunctionDeclaration",
            "name": "main",
            "parameters": [],
            "returnType": "int",
            "body": [
                {
                    "type": "ReturnStatement",
                    "argument": {
                        "type": "Identifier",
                        "name": "x"
                    }
                }
            ]
        }
    ]
}

transpiler = CppTranspiler()
cpp_code = transpiler.transpile(example_ast)
print(cpp_code)
```

## Plugin System (JavaScript)

The Plugin System allows extending the compiler with additional functionality.

### Public API

#### `PluginManager` class
- `constructor(options: Object)`: Creates a new plugin manager
- `loadPlugins()`: Loads plugins from specified directories
- `activatePlugin(pluginName: string)`: Activates a specific plugin
- `activateAllPlugins()`: Activates all loaded plugins
- `deactivatePlugin(pluginName: string)`: Deactivates a specific plugin
- `executeHook(hookName: string, ...args)`: Executes a specific hook across all active plugins
- `getLoadedPlugins()`: Returns list of loaded plugins
- `getActivePlugins()`: Returns list of active plugins
- `getPluginInfo(pluginName: string)`: Returns information about a plugin

#### `Plugin` class
Base class for creating plugins:
- `registerHook(hookName: string, callback: Function)`: Registers a hook
- `activate()`: Activation function
- `deactivate()`: Deactivation function

#### `PluginError` class
Extends JavaScript Error for plugin-specific errors.

### Example Plugin

```javascript
// Plugin name and version are required
exports.name = 'example-plugin';
exports.version = '1.0.0';
exports.description = 'An example plugin demonstrating plugin functionality';

// Hooks that this plugin registers
exports.hooks = {
  // Called before tokenization
  'before-tokenize': async function(sourceCode) {
    console.log('[Example Plugin] Processing source code before tokenization');
    return sourceCode;
  },

  // Called after parsing
  'after-parse': async function(ast) {
    console.log(`[Example Plugin] Parsed AST with ${ast.body.length} statements`);
    return ast;
  }
};

// Activation function
exports.activate = async function() {
  console.log('[Example Plugin] Activated');
};

// Deactivation function
exports.deactivate = async function() {
  console.log('[Example Plugin] Deactivated');
};
```

## Logging System (JavaScript)

The Logging System provides centralized logging for debugging and monitoring.

### Public API

#### `Logger` class
- `constructor(moduleName: string, logLevel: LogLevel, logFile: string)`: Creates a new logger
- `debug(message: string)`: Logs a debug message
- `info(message: string)`: Logs an info message
- `warn(message: string)`: Logs a warning message
- `error(message: string)`: Logs an error message
- `fatal(message: string)`: Logs a fatal message

#### `LogManager` class
- `getLogger(moduleName: string, logLevel: LogLevel, logFile: string)`: Gets or creates a logger instance
- `setGlobalLogLevel(level: LogLevel)`: Sets the global log level
- `setGlobalLogFile(filePath: string)`: Sets the global log file

#### `LogLevel` enum
- `DEBUG`: 0
- `INFO`: 1
- `WARN`: 2
- `ERROR`: 3
- `FATAL`: 4

### Example Usage

```javascript
const { logManager, LogLevel } = require('./utils/logger');

// Get a logger for a specific module
const logger = logManager.getLogger('MyModule', LogLevel.DEBUG);

// Log messages
logger.info('Application started');
logger.warn('This is a warning');
logger.error('An error occurred');
```

## Build System (JavaScript)

The Build System manages the compilation and building of the entire compiler.

### Public API

#### `BuildSystem` class
- `constructor(configPath: string)`: Creates a new build system with the specified config
- `addTarget(name: string, config: Object)`: Adds a build target
- `addDependency(target: string, dependency: string)`: Adds a dependency relationship
- `needsRebuild(targetName: string)`: Checks if a target needs rebuilding
- `buildTarget(targetName: string)`: Builds a specific target
- `buildAll()`: Builds all targets
- `clean()`: Cleans build artifacts
- `runTests(testType: string)`: Runs tests
- `runLint(lang: string)`: Runs linting
- `runFormat(lang: string)`: Runs formatting
- `buildCompiler()`: Builds the entire compiler

### Example Usage

```javascript
const BuildSystem = require('./utils/build-system');

const buildSystem = new BuildSystem('./build.config.js');

// Build the entire compiler
await buildSystem.buildCompiler();

// Run tests
await buildSystem.runTests('unit');

// Run linting
await buildSystem.runLint('all');
```