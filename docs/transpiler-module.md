# Transpiler Module Documentation

## Overview
The Transpiler module converts the AST to target language code (C++). It implements a visitor pattern to traverse the AST and generate equivalent C++ code.

## Architecture
The transpiler is implemented in Python for its flexibility and ease of string manipulation. It follows a visitor pattern to traverse the AST and generate code.

## API Reference

### `CppTranspiler` class
```python
class CppTranspiler:
    def __init__(self)
    def transpile(self, ast: Dict[str, Any]) -> str:  # Transpiles the entire AST to C++ code
    def visit_node(self, node: Dict[str, Any]) -> None:  # Visits a node and dispatches to appropriate handler
    def visit_program(self, node: Dict[str, Any]) -> None:  # Visits a program node
    def visit_variable_declaration(self, node: Dict[str, Any]) -> None:  # Visits a variable declaration node
    def visit_function_declaration(self, node: Dict[str, Any]) -> None:  # Visits a function declaration node
    def visit_expression_statement(self, node: Dict[str, Any]) -> None:  # Visits an expression statement node
    def visit_if_statement(self, node: Dict[str, Any]) -> None:  # Visits an if statement node
    def visit_while_statement(self, node: Dict[str, Any]) -> None:  # Visits a while statement node
    def visit_return_statement(self, node: Dict[str, Any]) -> None:  # Visits a return statement node
    def visit_binary_expression(self, node: Dict[str, Any]) -> None:  # Visits a binary expression node
    def visit_unary_expression(self, node: Dict[str, Any]) -> None:  # Visits a unary expression node
    def visit_call_expression(self, node: Dict[str, Any]) -> None:  # Visits a call expression node
    def visit_identifier(self, node: Dict[str, Any]) -> None:  # Visits an identifier node
    def visit_literal(self, node: Dict[str, Any]) -> None:  # Visits a literal node
    def visit_block_statement(self, node: Dict[str, Any]) -> None:  # Visits a block statement node
    def convert_type(self, fax_type: str) -> str:  # Converts Fax type to C++ type
    def convert_operator(self, op: str) -> str:  # Converts operators to C++ equivalents
    def evaluate_expression(self, node: Dict[str, Any]) -> str:  # Evaluates an expression node and returns its string representation
    def indent(self) -> str:  # Gets current indentation string
```

### `TranspilerError` class
```python
class TranspilerError(Exception):
    def __init__(self, message, line=None, col=None, position=None, error_type=TranspilerErrorType.GENERATION_ERROR)
```

### `TranspilerErrorType` enum
```python
class TranspilerErrorType(Enum):
    SYNTAX_ERROR = "SyntaxError"
    TYPE_ERROR = "TypeError"
    NAME_ERROR = "NameError"
    VALUE_ERROR = "ValueError"
    GENERATION_ERROR = "GenerationError"
```

## Implementation Details

### Type Conversion
The transpiler converts Fax types to equivalent C++ types:
- `int` → `int`
- `float` → `double`
- `bool` → `bool`
- `string` → `string`
- `char` → `char`
- `void` → `void`
- `auto` → `auto`

### Code Generation
The transpiler generates C++ code following these patterns:
- Variable declarations: `type name = value;`
- Function declarations: `return_type name(params) { body }`
- Control flow: Standard C++ if/while statements
- Expressions: Converted to equivalent C++ expressions

### Visitor Pattern
The transpiler uses a visitor pattern where each AST node type has a corresponding visit method. This allows for clean separation of concerns and easy extension.

## Error Handling
The transpiler provides detailed error information including line, column, position, and error type when encountering issues during code generation.

## Performance Considerations
- Uses efficient string concatenation for code generation
- Implements proper indentation tracking
- Minimizes redundant computations during traversal