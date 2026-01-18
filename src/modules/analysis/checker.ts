import { MemoryManager } from "./memory-manager.ts";
import { NodeType } from "../parser/ast/nodes.ts";
import type { ASTNode } from "../parser/ast/nodes.ts";
import { CompilerError } from "../../shared/errors/compiler-error.ts";
import { Logger } from "../../shared/logger/index.ts";

export class SemanticChecker {
    private memManager: MemoryManager = new MemoryManager();
    private functions: Set<string> = new Set();

    check(ast: ASTNode) {
        Logger.info("Validating Fax-lang Memory Rules...");
        
        // Pre-collect functions
        for (const stmt of ast.statements) {
            if (stmt.type === NodeType.FunctionDeclaration) {
                this.functions.add(stmt.name.value);
            }
        }

        for (const stmt of ast.statements) {
            this.analyzeStatement(stmt);
        }
        Logger.success("All Memory Rules Satisfied.");
    }

    private analyzeStatement(stmt: ASTNode) {
        if (!stmt) return;

        switch (stmt.type) {
            case NodeType.LetStatement:
                const type = stmt.dataType || "i32";
                this.memManager.analyzePlacement(stmt.name.value, type, 32, false, stmt.isMut || false);
                this.analyzeExpression(stmt.value);
                break;

            case NodeType.FunctionDeclaration:
                this.memManager.enterScope();
                if (stmt.params) {
                    for (const p of stmt.params) {
                        const pType = p.dataType || "i32";
                        this.memManager.analyzePlacement(p.value, pType, 32, false, false);
                    }
                }
                this.analyzeStatement(stmt.body);
                this.memManager.exitScope();
                break;

            case "ShadowStatement":
                const source = stmt.value.value;
                const shadowName = stmt.name.value;

                if (source === shadowName) {
                    throw new CompilerError(
                        "E005",
                        `cannot shadow variable \`${source}\` with itself`,
                        stmt.token.line,
                        stmt.token.column,
                        undefined,
                        `Shadowing requires a new name to create a view. Try: \`shadow ${source}_view = ${source}\``
                    );
                }

                if (!this.memManager.getMetadata(source)) {
                    throw new CompilerError(
                        "E003",
                        `cannot shadow undefined variable \`${source}\``,
                        stmt.token.line,
                        stmt.token.column,
                        undefined,
                        `Variable \`${source}\` must be declared in the current scope before it can be shadowed.`
                    );
                }
                this.memManager.createShadow(source, stmt.name.value);
                break;

            case "ConstStatement":
                this.memManager.analyzePlacement(stmt.name.value, stmt.dataType || "i32", 32, true, false, true);
                break;

            case NodeType.BlockStatement:
                this.memManager.enterScope();
                for (const s of stmt.statements) {
                    this.analyzeStatement(s);
                }
                this.memManager.exitScope();
                break;

            case NodeType.StateMachine:
                const validStates = new Set(stmt.states.map((s: any) => s.name.value));
                
                const checkTransition = (t: any) => {
                    if (t.target && !validStates.has(t.target)) {
                        throw new CompilerError(
                            "E004",
                            `transition targets undefined state \`${t.target}\``,
                            t.token.line,
                            t.token.column,
                            undefined,
                            `The state machine \`${stmt.name.value}\` does not have a state named \`${t.target}\`.`
                        );
                    }
                    this.memManager.enterScope();
                    this.analyzeStatement(t.body);
                    this.memManager.exitScope();
                };

                stmt.states.forEach((state: any) => {
                    this.memManager.enterScope();
                    state.transitions.forEach((t: any) => checkTransition(t));
                    this.memManager.exitScope();
                });

                if (stmt.anyTransitions) {
                    stmt.anyTransitions.forEach((t: any) => checkTransition(t));
                }
                break;

            case NodeType.ReturnStatement:
                this.analyzeExpression(stmt.returnValue);
                break;

            case NodeType.ExpressionStatement:
                this.analyzeExpression(stmt.expression);
                break;

            case "WhileStatement":
                this.analyzeExpression(stmt.condition);
                this.analyzeStatement(stmt.body);
                break;
        }
    }

    private analyzeExpression(expr: ASTNode) {
        if (!expr) return;
        
        switch (expr.type) {
            case NodeType.Identifier:
                const meta = this.memManager.getMetadata(expr.value);
                if (!meta && !this.functions.has(expr.value)) {
                    throw new CompilerError(
                        "E002",
                        `use of exhausted or undefined variable \`${expr.value}\``,
                        expr.token.line,
                        expr.token.column,
                        undefined,
                        `Variable \`${expr.value}\` has no remaining Life-Force or is not defined in this scope.`
                    );
                }
                if (meta) {
                    // Rule 2: Adaptive Decay (Read is cheaper)
                    this.memManager.decay(expr.value, "read");
                    if (meta.lifeForce.current <= 0) {
                        throw new CompilerError(
                            "E002",
                            `variable \`${expr.value}\` has been exhausted`,
                            expr.token.line,
                            expr.token.column,
                            undefined,
                            "Energy depleted. Reading from this variable costs 0.02 Life-Force."
                        );
                    }
                }
                break;

            case "AssignmentExpression":
                const varName = expr.name.value;
                const targetMeta = this.memManager.getMetadata(varName);
                if (!targetMeta) {
                    throw new CompilerError("E002", `cannot assign to undefined variable \`${varName}\``, expr.token.line, expr.token.column);
                }
                if (!targetMeta.isMut) {
                    throw new CompilerError(
                        "E001",
                        `cannot assign twice to immutable variable \`${varName}\``,
                        expr.token.line,
                        expr.token.column,
                        undefined,
                        `Make this variable mutable by writing \`let mut ${varName}\` instead of \`let ${varName}\`.`
                    );
                }
                // Rule 2: Adaptive Decay (Write is expensive)
                this.memManager.decay(varName, "write");
                this.analyzeExpression(expr.value);
                break;

            case "IfExpression":
                this.analyzeExpression(expr.condition);
                this.analyzeStatement(expr.consequence);
                if (expr.alternative) {
                    if (expr.alternative.type === "IfExpression") {
                        this.analyzeExpression(expr.alternative);
                    } else {
                        this.analyzeStatement(expr.alternative);
                    }
                }
                break;

            case NodeType.InfixExpression:
                this.analyzeExpression(expr.left);
                this.analyzeExpression(expr.right);
                if (expr.operator === "&&" || expr.operator === "||") {
                    // Logic validation: In Fax, only boolean-equivalent results work here.
                }
                break;

            case NodeType.IntegerLiteral:
                break;
        }
    }
}
