package main

import (
	"testing"
)

// Helper function to create a simple variable declaration for testing
func createTestVariableDeclaration(identifier string, dataType string, hasInitializer bool) *VariableDeclaration {
	baseNode := BaseNode{
		Type: VariableDeclaration,
		Line: 1,
		Col:  1,
	}

	var initializer Expression
	if hasInitializer {
		// Create a simple literal as initializer
		initializer = &Literal{
			BaseNode: BaseNode{Type: LiteralNode, Line: 1, Col: 1},
			Value:    42, // Using int as default
		}
	}

	return &VariableDeclaration{
		BaseNode:    baseNode,
		Identifier:  identifier,
		DataType:    dataType,
		Initializer: initializer,
		Mutable:     true,
	}
}

// Helper function to create a simple function declaration for testing
func createTestFunctionDeclaration(name string, returnType string) *FunctionDeclaration {
	baseNode := BaseNode{
		Type: FunctionDeclaration,
		Line: 1,
		Col:  1,
	}

	return &FunctionDeclaration{
		BaseNode:   baseNode,
		Name:       name,
		Parameters: []Parameter{},
		ReturnType: returnType,
		Body:       []Statement{},
	}
}

func TestVariableDeclaration(t *testing.T) {
	checker := NewTypeChecker()

	// Test 1: Variable with correct type and initializer
	decl1 := createTestVariableDeclaration("x", "int", true)
	err := checker.Check(decl1)
	if err != nil {
		t.Errorf("Expected no error for valid variable declaration, got: %v", err)
	}

	// Test 2: Variable without type annotation but with initializer (should infer type)
	decl2 := createTestVariableDeclaration("y", "", true)
	err = checker.Check(decl2)
	if err != nil {
		t.Errorf("Expected no error for variable with initializer but no type, got: %v", err)
	}

	// Test 3: Variable without type annotation and without initializer (should error)
	decl3 := createTestVariableDeclaration("z", "", false)
	err = checker.Check(decl3)
	if err == nil {
		t.Error("Expected error for variable without type and initializer, got none")
	}

	// Test 4: Type mismatch (would require more complex setup to actually test)
	// For now, we'll just verify the checker can process declarations
}

func TestFunctionDeclaration(t *testing.T) {
	checker := NewTypeChecker()

	// Test: Simple function declaration
	funcDecl := createTestFunctionDeclaration("testFunc", "int")
	err := checker.Check(funcDecl)
	if err != nil {
		t.Errorf("Expected no error for valid function declaration, got: %v", err)
	}

	// Verify function was added to symbol table
	if _, exists := checker.Symbols["testFunc"]; !exists {
		t.Error("Function was not added to symbol table")
	}
}

func TestIdentifierLookup(t *testing.T) {
	checker := NewTypeChecker()

	// Add a variable to the symbol table
	checker.Symbols["testVar"] = IntType

	// Create an identifier node
	identNode := &Identifier{
		BaseNode: BaseNode{Type: IdentifierNode, Line: 1, Col: 1},
		Name:     "testVar",
	}

	// Check that the identifier exists
	resultType, err := checker.checkExpression(identNode)
	if err != nil {
		t.Errorf("Unexpected error when checking known identifier: %v", err)
	}

	if resultType != IntType {
		t.Errorf("Expected type %v, got %v", IntType, resultType)
	}

	// Test unknown identifier
	unknownIdent := &Identifier{
		BaseNode: BaseNode{Type: IdentifierNode, Line: 1, Col: 1},
		Name:     "unknownVar",
	}

	_, err = checker.checkExpression(unknownIdent)
	if err == nil {
		t.Error("Expected error for unknown identifier, got none")
	}
}

func TestLiteralTypeChecking(t *testing.T) {
	checker := NewTypeChecker()

	// Test integer literal
	intLit := &Literal{
		BaseNode: BaseNode{Type: LiteralNode, Line: 1, Col: 1},
		Value:    42,
	}

	resultType, err := checker.checkExpression(intLit)
	if err != nil {
		t.Errorf("Unexpected error when checking integer literal: %v", err)
	}

	if resultType != IntType {
		t.Errorf("Expected type %v for integer literal, got %v", IntType, resultType)
	}

	// Test float literal
	floatLit := &Literal{
		BaseNode: BaseNode{Type: LiteralNode, Line: 1, Col: 1},
		Value:    3.14,
	}

	resultType, err = checker.checkExpression(floatLit)
	if err != nil {
		t.Errorf("Unexpected error when checking float literal: %v", err)
	}

	if resultType != FloatType {
		t.Errorf("Expected type %v for float literal, got %v", FloatType, resultType)
	}

	// Test boolean literal
	boolLit := &Literal{
		BaseNode: BaseNode{Type: LiteralNode, Line: 1, Col: 1},
		Value:    true,
	}

	resultType, err = checker.checkExpression(boolLit)
	if err != nil {
		t.Errorf("Unexpected error when checking boolean literal: %v", err)
	}

	if resultType != BoolType {
		t.Errorf("Expected type %v for boolean literal, got %v", BoolType, resultType)
	}

	// Test string literal
	stringLit := &Literal{
		BaseNode: BaseNode{Type: LiteralNode, Line: 1, Col: 1},
		Value:    "hello",
	}

	resultType, err = checker.checkExpression(stringLit)
	if err != nil {
		t.Errorf("Unexpected error when checking string literal: %v", err)
	}

	if resultType != StringType {
		t.Errorf("Expected type %v for string literal, got %v", StringType, resultType)
	}
}

func TestBinaryExpressionTypeChecking(t *testing.T) {
	checker := NewTypeChecker()

	// Test arithmetic expression with matching types
	left := &Literal{
		BaseNode: BaseNode{Type: LiteralNode, Line: 1, Col: 1},
		Value:    5,
	}
	right := &Literal{
		BaseNode: BaseNode{Type: LiteralNode, Line: 1, Col: 3},
		Value:    3,
	}
	binExpr := &BinaryExpression{
		BaseNode: BaseNode{Type: BinaryExpressionNode, Line: 1, Col: 2},
		Operator: "+",
		Left:     left,
		Right:    right,
	}

	resultType, err := checker.checkExpression(binExpr)
	if err != nil {
		t.Errorf("Unexpected error when checking binary expression: %v", err)
	}

	if resultType != IntType {
		t.Errorf("Expected type %v for arithmetic expression, got %v", IntType, resultType)
	}

	// Test comparison expression
	compExpr := &BinaryExpression{
		BaseNode: BaseNode{Type: BinaryExpressionNode, Line: 1, Col: 2},
		Operator: "==",
		Left:     left,
		Right:    right,
	}

	resultType, err = checker.checkExpression(compExpr)
	if err != nil {
		t.Errorf("Unexpected error when checking comparison expression: %v", err)
	}

	if resultType != BoolType {
		t.Errorf("Expected type %v for comparison expression, got %v", BoolType, resultType)
	}

	// Test error case: mismatched types in arithmetic
	floatLeft := &Literal{
		BaseNode: BaseNode{Type: LiteralNode, Line: 1, Col: 1},
		Value:    5.5,
	}
	mismatchExpr := &BinaryExpression{
		BaseNode: BaseNode{Type: BinaryExpressionNode, Line: 1, Col: 2},
		Operator: "+",
		Left:     floatLeft,
		Right:    right, // This is an int
	}

	_, err = checker.checkExpression(mismatchExpr)
	if err == nil {
		t.Error("Expected error for mismatched types in arithmetic expression, got none")
	}
}