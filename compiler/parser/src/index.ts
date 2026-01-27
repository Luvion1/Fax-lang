import * as fs from 'fs';

enum TokenType {
    LET = "LET", VAR = "VAR", CONST = "CONST", FN = "FN", STRUCT = "STRUCT",
    IF = "IF", ELSE = "ELSE", WHILE = "WHILE", FOR = "FOR", RETURN = "RETURN",
    INT = "INT", FLOAT = "FLOAT", BOOL = "BOOL", STRING = "STRING", VOID = "VOID",
    TRUE = "TRUE", FALSE = "FALSE", IDENTIFIER = "IDENTIFIER",
    INTEGER_LITERAL = "INTEGER_LITERAL", FLOAT_LITERAL = "FLOAT_LITERAL",
    STRING_LITERAL = "STRING_LITERAL", PLUS = "PLUS", MINUS = "MINUS",
    MULTIPLY = "MULTIPLY", DIVIDE = "DIVIDE", MODULO = "MODULO",
    ASSIGN = "ASSIGN", EQUAL = "EQUAL", NOT_EQUAL = "NOT_EQUAL",
    LESS_THAN = "LESS_THAN", GREATER_THAN = "GREATER_THAN",
    LESS_EQUAL = "LESS_EQUAL", GREATER_EQUAL = "GREATER_EQUAL",
    LOGICAL_NOT = "LOGICAL_NOT",
    LEFT_PAREN = "LEFT_PAREN", RIGHT_PAREN = "RIGHT_PAREN",
    LEFT_BRACE = "LEFT_BRACE", RIGHT_BRACE = "RIGHT_BRACE",
    LEFT_BRACKET = "LEFT_BRACKET", RIGHT_BRACKET = "RIGHT_BRACKET",
    SEMICOLON = "SEMICOLON", COMMA = "COMMA", DOT = "DOT",
    COLON = "COLON", ARROW = "ARROW", EOF = "EOF"
}

interface Token {
    type: TokenType;
    value: string;
    position: { line: number, column: number };
}

class Parser {
    private tokens: Token[];
    private pos: number = 0;

    constructor(tokens: Token[]) {
        this.tokens = tokens;
    }

    private peek() { return this.tokens[this.pos]; }
    private advance() { return this.tokens[this.pos++]; }

    private reportError(message: string, label: string, code: string = "E000"): never {
        const token = this.peek();
        const diagnostic = {
            code: code,
            message: message,
            primary_span: {
                line: token.position.line,
                column: token.position.column,
                length: token.value.length || 1,
                label: label
            }
        };
        process.stderr.write(JSON.stringify(diagnostic));
        process.exit(1);
    }

    private expect(type: TokenType, label: string = `expected ${type}`) {
        if (this.peek().type === type) return this.advance();
        this.reportError(`unexpected token: 
${this.peek().value}
`, label);
    }

    private match(type: TokenType) {
        if (this.peek()?.type === type) {
            this.advance();
            return true;
        }
        return false;
    }

    parse() {
        const body = [];
        while (this.peek().type !== TokenType.EOF) {
            body.push(this.parseStatement());
        }
        return { type: "Program", body };
    }

    private parseStatement(): any {
        const token = this.peek();
        switch (token.type) {
            case TokenType.LET: return this.parseVariableDeclaration();
            case TokenType.FN: return this.parseFunctionDeclaration();
            case TokenType.RETURN: return this.parseReturnStatement();
            case TokenType.IF: return this.parseIfStatement();
            case TokenType.WHILE: return this.parseWhileStatement();
            case TokenType.FOR: return this.parseForStatement();
            case TokenType.LEFT_BRACE: return this.parseBlock();
            default:
                const expr = this.parseExpression();
                this.expect(TokenType.SEMICOLON, "expected semicolon at the end of this expression");
                return { type: "ExpressionStatement", expression: expr };
        }
    }

    private parseVariableDeclaration() {
        const token = this.peek();
        this.advance(); // let
        const id = this.expect(TokenType.IDENTIFIER, "expected a variable name after `let`").value;
        let dataType = "auto";
        if (this.match(TokenType.COLON)) {
            dataType = this.parseType();
        }
        let initializer = null;
        if (this.match(TokenType.ASSIGN)) {
            initializer = this.parseExpression();
        }
        this.expect(TokenType.SEMICOLON, "variable declarations must end with a semicolon");
        return { 
            type: "VariableDeclaration", 
            identifier: id, 
            dataType, 
            initializer,
            position: { line: token.position.line, column: token.position.column }
        };
    }

    private parseType(): string {
        const token = this.peek();
        if ([TokenType.IDENTIFIER, TokenType.INT, TokenType.FLOAT, TokenType.STRING, TokenType.BOOL, TokenType.VOID].includes(token.type)) {
            let type = this.advance().value;
            while (this.match(TokenType.LEFT_BRACKET)) {
                this.expect(TokenType.RIGHT_BRACKET, "expected closing `]` for array type");
                type += "[]";
            }
            return type;
        }
        this.reportError("invalid type name", "expected a type like `int` or `string` here");
    }

    private parseFunctionDeclaration() {
        this.advance(); // fn
        const name = this.expect(TokenType.IDENTIFIER).value;
        this.expect(TokenType.LEFT_PAREN);
        const params: any[] = [];
        if (this.peek().type !== TokenType.RIGHT_PAREN) {
            do {
                const pName = this.expect(TokenType.IDENTIFIER).value;
                this.expect(TokenType.COLON);
                const pType = this.parseType();
                params.push({ name: pName, type: pType });
            } while (this.match(TokenType.COMMA));
        }
        this.expect(TokenType.RIGHT_PAREN);
        let returnType = "void";
        if (this.match(TokenType.ARROW)) returnType = this.parseType();
        const body = this.parseBlock();
        return { type: "FunctionDeclaration", name, params, returnType, body };
    }

    private parseIfStatement() {
        this.advance(); // if
        this.expect(TokenType.LEFT_PAREN);
        const test = this.parseExpression();
        this.expect(TokenType.RIGHT_PAREN);
        const consequent = this.parseStatement();
        let alternate = null;
        if (this.match(TokenType.ELSE)) {
            alternate = this.parseStatement();
        }
        return { type: "IfStatement", test, consequent, alternate };
    }

    private parseWhileStatement() {
        this.advance(); // while
        this.expect(TokenType.LEFT_PAREN);
        const test = this.parseExpression();
        this.expect(TokenType.RIGHT_PAREN);
        const body = this.parseStatement();
        return { type: "WhileStatement", test, body };
    }

    private parseForStatement() {
        this.advance(); // for
        this.expect(TokenType.LEFT_PAREN);
        const init = this.peek().type === TokenType.SEMICOLON ? null : this.parseStatement();
        const test = this.peek().type === TokenType.SEMICOLON ? null : this.parseExpression();
        if (test) this.expect(TokenType.SEMICOLON);
        const update = this.peek().type === TokenType.RIGHT_PAREN ? null : this.parseExpression();
        this.expect(TokenType.RIGHT_PAREN);
        const body = this.parseStatement();
        return { type: "ForStatement", init, test, update, body };
    }

    private parseReturnStatement() {
        this.advance();
        let argument = null;
        if (this.peek().type !== TokenType.SEMICOLON) argument = this.parseExpression();
        this.expect(TokenType.SEMICOLON);
        return { type: "ReturnStatement", argument };
    }

    private parseBlock() {
        this.expect(TokenType.LEFT_BRACE);
        const body = [];
        while (this.peek().type !== TokenType.RIGHT_BRACE && this.peek().type !== TokenType.EOF) {
            body.push(this.parseStatement());
        }
        this.expect(TokenType.RIGHT_BRACE);
        return { type: "BlockStatement", body };
    }

    private parseExpression(): any {
        return this.parseAssignment();
    }

    private parseAssignment(): any {
        const left = this.parseComparison();
        if (this.match(TokenType.ASSIGN)) {
            return { type: "AssignmentExpression", left, right: this.parseExpression() };
        }
        return left;
    }

    private parseComparison(): any {
        let left = this.parseAdditive();
        while ([TokenType.EQUAL, TokenType.NOT_EQUAL, TokenType.LESS_THAN, TokenType.GREATER_THAN, TokenType.LESS_EQUAL, TokenType.GREATER_EQUAL].includes(this.peek().type)) {
            const operator = this.advance().value;
            left = { type: "BinaryExpression", operator, left, right: this.parseAdditive() };
        }
        return left;
    }

    private parseAdditive(): any {
        let left = this.parseMultiplicative();
        while ([TokenType.PLUS, TokenType.MINUS].includes(this.peek().type)) {
            const operator = this.advance().value;
            left = { type: "BinaryExpression", operator, left, right: this.parseMultiplicative() };
        }
        return left;
    }

    private parseMultiplicative(): any {
        let left = this.parseCall();
        while ([TokenType.MULTIPLY, TokenType.DIVIDE, TokenType.MODULO].includes(this.peek().type)) {
            const operator = this.advance().value;
            left = { type: "BinaryExpression", operator, left, right: this.parseCall() };
        }
        return left;
    }

    private parseCall(): any {
        let expr = this.parsePrimary();
        while (true) {
            if (this.match(TokenType.LEFT_PAREN)) {
                const args = [];
                if (this.peek().type !== TokenType.RIGHT_PAREN) {
                    do { args.push(this.parseExpression()); } while (this.match(TokenType.COMMA));
                }
                this.expect(TokenType.RIGHT_PAREN);
                expr = { type: "CallExpression", callee: expr, arguments: args };
            } else if (this.match(TokenType.LEFT_BRACKET)) {
                const index = this.parseExpression();
                this.expect(TokenType.RIGHT_BRACKET);
                expr = { type: "IndexExpression", object: expr, index };
            } else if (this.match(TokenType.DOT)) {
                const property = this.expect(TokenType.IDENTIFIER).value;
                expr = { type: "MemberExpression", object: expr, property };
            } else break;
        }
        return expr;
    }

    private parsePrimary(): any {
        const token = this.peek();
        if (this.match(TokenType.INTEGER_LITERAL)) return { type: "Literal", value: parseInt(token.value), position: token.position };
        if (this.match(TokenType.FLOAT_LITERAL)) return { type: "Literal", value: parseFloat(token.value), position: token.position };
        if (this.match(TokenType.STRING_LITERAL)) return { type: "Literal", value: token.value, position: token.position };
        if (this.match(TokenType.TRUE)) return { type: "Literal", value: true, position: token.position };
        if (this.match(TokenType.FALSE)) return { type: "Literal", value: false, position: token.position };
        if (this.match(TokenType.IDENTIFIER)) return { type: "Identifier", name: token.value, position: token.position };
        this.reportError("expected expression", "found this instead");
    }
}

const inputPath = process.argv[2];
const tokens = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
const parser = new Parser(tokens);
console.log(JSON.stringify(parser.parse()));
