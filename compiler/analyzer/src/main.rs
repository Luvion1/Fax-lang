use serde::{Serialize, Deserialize};
use std::collections::HashMap;
use std::env;
use std::fs;

#[allow(non_snake_case)]
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(tag = "type")]
enum Node {
    Program { body: Vec<Node> },
    VariableDeclaration { identifier: String, dataType: String, initializer: Option<Box<Node>>, position: Option<Pos> },
    FunctionDeclaration { name: String, params: Vec<Param>, returnType: String, body: Box<Node> },
    BlockStatement { body: Vec<Node> },
    ExpressionStatement { expression: Box<Node> },
    AssignmentExpression { left: Box<Node>, right: Box<Node> },
    CallExpression { callee: Box<Node>, arguments: Vec<Node> },
    IfStatement { test: Box<Node>, consequent: Box<Node>, alternate: Option<Box<Node>> },
    WhileStatement { test: Box<Node>, body: Box<Node> },
    ForStatement { init: Option<Box<Node>>, test: Box<Node>, update: Option<Box<Node>>, body: Box<Node> },
    Identifier { name: String, position: Option<Pos> },
    Literal { value: serde_json::Value, position: Option<Pos> },
    ReturnStatement { argument: Option<Box<Node>>, position: Option<Pos> },
    #[serde(other)] Unknown,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Param { name: String, #[serde(rename = "type")] param_type: String }

#[derive(Debug, PartialEq, Clone)]
enum OwnershipState { Owned, Moved }

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Pos { line: usize, column: usize }

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Diagnostic {
    code: String, message: String,
    primary_span: Span, secondary_spans: Vec<Span>,
    suggestion: Option<serde_json::Value>, note: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Span { line: usize, column: usize, length: usize, label: String }

struct VarInfo {
    state: OwnershipState,
    dtype: String,
    defined_at: Pos,
}

struct BorrowChecker {
    scopes: Vec<HashMap<String, VarInfo>>,
}

impl BorrowChecker {
    fn new() -> Self { BorrowChecker { scopes: vec![HashMap::new()] } }
    fn is_copy_type(dtype: &str) -> bool { matches!(dtype, "int" | "float" | "bool") }

    fn enter_scope(&mut self) { self.scopes.push(HashMap::new()); }
    fn exit_scope(&mut self) { self.scopes.pop(); }

    fn get_var_mut(&mut self, name: &str) -> Option<&mut VarInfo> {
        for scope in self.scopes.iter_mut().rev() {
            if let Some(info) = scope.get_mut(name) { return Some(info); }
        }
        None
    }

    fn get_var(&self, name: &str) -> Option<&VarInfo> {
        for scope in self.scopes.iter().rev() {
            if let Some(info) = scope.get(name) { return Some(info); }
        }
        None
    }

    fn define_var(&mut self, name: String, info: VarInfo) {
        if let Some(scope) = self.scopes.last_mut() {
            scope.insert(name, info);
        }
    }

    fn report_error(&self, name: &str, pos: &Pos, msg: &str, label: &str) -> ! {
        let diag = Diagnostic {
            code: "E0382".to_string(),
            message: msg.to_string(),
            primary_span: Span { line: pos.line, column: pos.column, length: name.len(), label: label.to_string() },
            secondary_spans: vec![], suggestion: None, note: None,
        };
        eprintln!("{}", serde_json::to_string(&diag).unwrap());
        std::process::exit(1);
    }

    fn analyze(&mut self, node: &Node) {
        match node {
            Node::Program { body } => { for stmt in body { self.analyze(stmt); } }
            Node::VariableDeclaration { identifier, dataType, initializer, position, .. } => {
                if let Some(init) = initializer { self.analyze(init); }
                let pos = position.clone().unwrap_or(Pos { line: 0, column: 0 });
                self.define_var(identifier.clone(), VarInfo {
                    state: OwnershipState::Owned,
                    dtype: dataType.clone(),
                    defined_at: pos,
                });
            }
            Node::Identifier { name, position } => {
                if let Some(info) = self.get_var(name) {
                    if info.state == OwnershipState::Moved {
                        let pos = position.clone().unwrap_or(info.defined_at.clone());
                        self.report_error(name, &pos, &format!("use of moved value: `{}`", name), "value used here after move");
                    }
                }
            }
            Node::WhileStatement { test, body } => {
                self.analyze(test);
                self.analyze(body);
            }
            Node::CallExpression { arguments, .. } => {
                for arg in arguments {
                    if let Node::Identifier { name, position } = arg {
                        if let Some(info) = self.get_var_mut(name) {
                            if !BorrowChecker::is_copy_type(&info.dtype) {
                                if info.state == OwnershipState::Moved {
                                    let pos = position.clone().unwrap_or(info.defined_at.clone());
                                    self.report_error(name, &pos, &format!("cannot move already moved value `{}`", name), "attempt to move again");
                                }
                                info.state = OwnershipState::Moved;
                            }
                        }
                    } else { self.analyze(arg); }
                }
            }
            Node::FunctionDeclaration { body, .. } => {
                self.enter_scope();
                self.analyze(body);
                self.exit_scope();
            }
            Node::BlockStatement { body } => { 
                self.enter_scope();
                for stmt in body { self.analyze(stmt); } 
                self.exit_scope();
            }
            Node::IfStatement { test, consequent, alternate } => {
                self.analyze(test);
                self.analyze(consequent);
                if let Some(alt) = alternate { self.analyze(alt); }
            }
            Node::ExpressionStatement { expression } => self.analyze(expression),
            _ => {}
        }
    }
}

fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() < 2 { return; }
    let input = fs::read_to_string(&args[1]).expect("Failed to read AST");
    let ast: Node = serde_json::from_str(&input).expect("Failed to parse AST JSON");
    let mut checker = BorrowChecker::new();
    checker.analyze(&ast);
    println!("{}", input);
}
