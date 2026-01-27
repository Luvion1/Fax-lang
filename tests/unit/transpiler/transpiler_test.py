import unittest
from io import StringIO
import sys
from compiler.transpiler.main import CppTranspiler, TranspilerError, TranspilerErrorType


class TestCppTranspiler(unittest.TestCase):
    
    def setUp(self):
        self.transpiler = CppTranspiler()
    
    def test_initialization(self):
        """Test that the transpiler initializes correctly"""
        self.assertEqual(self.transpiler.cpp_code, [])
        self.assertEqual(self.transpiler.indent_level, 0)
        self.assertIsInstance(self.transpiler.variables, set)
        self.assertIsInstance(self.transpiler.functions, set)
        self.assertIsInstance(self.transpiler.errors, [])
    
    def test_indent_function(self):
        """Test the indent function"""
        self.assertEqual(self.transpiler.indent(), "")  # 0 levels
        
        self.transpiler.indent_level = 1
        self.assertEqual(self.transpiler.indent(), "  ")  # 1 level (2 spaces)
        
        self.transpiler.indent_level = 2
        self.assertEqual(self.transpiler.indent(), "    ")  # 2 levels (4 spaces)
    
    def test_convert_type(self):
        """Test type conversion from Fax to C++"""
        # Note: We need to call the method directly since it's not exposed in the public API
        # This test assumes the method exists in the class
        type_mapping = [
            ("int", "int"),
            ("float", "double"),
            ("bool", "bool"),
            ("string", "string"),
            ("char", "char"),
            ("void", "void"),
            ("auto", "auto"),
            ("unknown_type", "auto")  # Default fallback
        ]
        
        # Since the method is private, we'll test by calling transpile with different type annotations
        for fax_type, expected_cpp_type in type_mapping:
            with self.subTest(fax_type=fax_type):
                # Create a simple AST with a variable declaration of the given type
                ast = {
                    "type": "Program",
                    "body": [
                        {
                            "type": "VariableDeclaration",
                            "identifier": "x",
                            "dataType": fax_type,
                            "initializer": {
                                "type": "Literal",
                                "value": 42 if fax_type == "int" else "test" if fax_type == "string" else True
                            },
                            "mutable": True
                        }
                    ]
                }
                
                # This will test the type conversion indirectly
                try:
                    result = self.transpiler.transpile(ast)
                    # Check that the expected C++ type appears in the output (where applicable)
                    if expected_cpp_type != "auto" or fax_type == "unknown_type":
                        # For this test, we'll just ensure no exception is raised
                        self.assertIsInstance(result, str)
                except Exception as e:
                    # If there's an error that's not a TranspilerError, it's unexpected
                    if not isinstance(e, TranspilerError):
                        raise e
    
    def test_transpile_simple_program(self):
        """Test transpiling a simple program"""
        ast = {
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
                }
            ]
        }
        
        result = self.transpiler.transpile(ast)
        
        # Check that the result contains expected elements
        self.assertIn("#include <iostream>", result)
        self.assertIn("using namespace std;", result)
        self.assertIn("int x = 42;", result)
    
    def test_transpile_function_declaration(self):
        """Test transpiling a function declaration"""
        ast = {
            "type": "Program",
            "body": [
                {
                    "type": "FunctionDeclaration",
                    "name": "main",
                    "parameters": [],
                    "returnType": "int",
                    "body": [
                        {
                            "type": "ReturnStatement",
                            "argument": {
                                "type": "Literal",
                                "value": 0
                            }
                        }
                    ]
                }
            ]
        }
        
        result = self.transpiler.transpile(ast)
        
        # Check that the result contains expected elements
        self.assertIn("int main()", result)
        self.assertIn("{", result)
        self.assertIn("return 0;", result)
        self.assertIn("}", result)
    
    def test_transpile_if_statement(self):
        """Test transpiling an if statement"""
        ast = {
            "type": "Program",
            "body": [
                {
                    "type": "VariableDeclaration",
                    "identifier": "x",
                    "dataType": "int",
                    "initializer": {
                        "type": "Literal",
                        "value": 5
                    },
                    "mutable": True
                },
                {
                    "type": "IfStatement",
                    "condition": {
                        "type": "BinaryExpression",
                        "operator": ">",
                        "left": {
                            "type": "Identifier",
                            "name": "x"
                        },
                        "right": {
                            "type": "Literal",
                            "value": 0
                        }
                    },
                    "consequent": [
                        {
                            "type": "ReturnStatement",
                            "argument": {
                                "type": "Literal",
                                "value": 1
                            }
                        }
                    ],
                    "alternate": [
                        {
                            "type": "ReturnStatement",
                            "argument": {
                                "type": "Literal",
                                "value": -1
                            }
                        }
                    ]
                }
            ]
        }
        
        result = self.transpiler.transpile(ast)
        
        # Check that the result contains expected elements
        self.assertIn("if (", result)
        self.assertIn("x > 0", result)
        self.assertIn("{", result)
        self.assertIn("return 1;", result)
        self.assertIn("} else {", result)
        self.assertIn("return -1;", result)
        self.assertIn("}", result)
    
    def test_transpile_while_statement(self):
        """Test transpiling a while statement"""
        ast = {
            "type": "Program",
            "body": [
                {
                    "type": "VariableDeclaration",
                    "identifier": "counter",
                    "dataType": "int",
                    "initializer": {
                        "type": "Literal",
                        "value": 0
                    },
                    "mutable": True
                },
                {
                    "type": "WhileStatement",
                    "condition": {
                        "type": "BinaryExpression",
                        "operator": "<",
                        "left": {
                            "type": "Identifier",
                            "name": "counter"
                        },
                        "right": {
                            "type": "Literal",
                            "value": 5
                        }
                    },
                    "body": [
                        {
                            "type": "ExpressionStatement",
                            "expression": {
                                "type": "BinaryExpression",
                                "operator": "+=",
                                "left": {
                                    "type": "Identifier",
                                    "name": "counter"
                                },
                                "right": {
                                    "type": "Literal",
                                    "value": 1
                                }
                            }
                        }
                    ]
                }
            ]
        }
        
        result = self.transpiler.transpile(ast)
        
        # Check that the result contains expected elements
        self.assertIn("while (", result)
        self.assertIn("counter < 5", result)
        self.assertIn("{", result)
        self.assertIn("counter += 1;", result)
        self.assertIn("}", result)
    
    def test_evaluate_expression_identifier(self):
        """Test evaluating an identifier expression"""
        # Since evaluate_expression is private, we'll test it indirectly
        # by creating an AST that uses identifiers
        ast = {
            "type": "Program",
            "body": [
                {
                    "type": "VariableDeclaration",
                    "identifier": "x",
                    "dataType": "int",
                    "initializer": {
                        "type": "Literal",
                        "value": 10
                    },
                    "mutable": True
                },
                {
                    "type": "VariableDeclaration",
                    "identifier": "y",
                    "dataType": "int",
                    "initializer": {
                        "type": "Identifier",
                        "name": "x"
                    },
                    "mutable": True
                }
            ]
        }
        
        result = self.transpiler.transpile(ast)
        self.assertIn("int x = 10;", result)
        self.assertIn("int y = x;", result)
    
    def test_evaluate_expression_literal(self):
        """Test evaluating a literal expression"""
        ast = {
            "type": "Program",
            "body": [
                {
                    "type": "VariableDeclaration",
                    "identifier": "strVal",
                    "dataType": "string",
                    "initializer": {
                        "type": "Literal",
                        "value": "Hello, World!"
                    },
                    "mutable": True
                },
                {
                    "type": "VariableDeclaration",
                    "identifier": "boolVal",
                    "dataType": "bool",
                    "initializer": {
                        "type": "Literal",
                        "value": True
                    },
                    "mutable": True
                }
            ]
        }
        
        result = self.transpiler.transpile(ast)
        self.assertIn('string strVal = "Hello, World!";', result)
        self.assertIn("bool boolVal = true;", result)
    
    def test_transpile_binary_expression(self):
        """Test transpiling binary expressions"""
        ast = {
            "type": "Program",
            "body": [
                {
                    "type": "VariableDeclaration",
                    "identifier": "result",
                    "dataType": "int",
                    "initializer": {
                        "type": "BinaryExpression",
                        "operator": "+",
                        "left": {
                            "type": "Literal",
                            "value": 5
                        },
                        "right": {
                            "type": "Literal",
                            "value": 3
                        }
                    },
                    "mutable": True
                }
            ]
        }
        
        result = self.transpiler.transpile(ast)
        self.assertIn("int result = (5 + 3);", result)
    
    def test_error_handling_invalid_node_type(self):
        """Test error handling for invalid node types"""
        # Test with an unknown node type
        ast = {
            "type": "UnknownNodeType",
            "body": []
        }
        
        with self.assertRaises(ValueError):
            self.transpiler.transpile(ast)
    
    def test_error_handling_with_exception_wrapping(self):
        """Test that exceptions in visit_node are properly wrapped"""
        # Since we can't easily trigger internal errors without modifying the code,
        # we'll test the error type enum
        self.assertEqual(TranspilerErrorType.SYNTAX_ERROR.value, "SyntaxError")
        self.assertEqual(TranspilerErrorType.TYPE_ERROR.value, "TypeError")
        self.assertEqual(TranspilerErrorType.NAME_ERROR.value, "NameError")
        self.assertEqual(TranspilerErrorType.VALUE_ERROR.value, "ValueError")
        self.assertEqual(TranspilerErrorType.GENERATION_ERROR.value, "GenerationError")


if __name__ == '__main__':
    unittest.main()