use serde::{Serialize, Deserialize};
use std::collections::HashMap;
use std::env;
use std::fs;

#[allow(non_snake_case)]
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(tag = "type")]
enum Node {
    Program { body: Vec<Node> },
    VariableDeclaration { 
        identifier: String, 
        #[serde(rename = "dataType")] dataType: String, 
        #[serde(rename = "isConstant")] isConstant: Option<bool>, 
        initializer: Option<Box<Node>>, 
        position: Option<Pos> 
    },
    FunctionDeclaration { 
        name: String, 
        params: Vec<Param>, 
        #[serde(rename = "returnType")] returnType: String, 
        body: Box<Node>, 
        position: Option<Pos> 
    },
    BlockStatement { body: Vec<Node>, position: Option<Pos> },
    ExpressionStatement { expression: Box<Node> },
    AssignmentExpression { left: Box<Node>, right: Box<Node>, position: Option<Pos> },
    CallExpression { callee: Box<Node>, arguments: Vec<Node>, position: Option<Pos> },
    MemberExpression { object: Box<Node>, property: String, position: Option<Pos> },
    BinaryExpression { operator: String, left: Box<Node>, right: Box<Node>, position: Option<Pos> },
    IfStatement { test: Box<Node>, consequent: Box<Node>, alternate: Option<Box<Node>>, position: Option<Pos> },
    WhileStatement { test: Box<Node>, body: Box<Node>, position: Option<Pos> },
    ForStatement { init: Option<Box<Node>>, test: Option<Box<Node>>, update: Option<Box<Node>>, body: Box<Node>, position: Option<Pos> },
    BreakStatement { position: Option<Pos> },
    ContinueStatement { position: Option<Pos> },
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
    is_constant: bool,
    defined_at: Pos,
}

struct BorrowChecker {
    scopes: Vec<HashMap<String, VarInfo>>,
    functions: HashMap<String, Pos>,
}

impl BorrowChecker {
    fn new() -> Self { BorrowChecker { scopes: vec![HashMap::new()], functions: HashMap::new() } }
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
        if self.functions.contains_key(&name) {
            let diag = Diagnostic {
                code: "E0128".to_string(),
                message: format!("name conflict: `{}` is already defined as a function", name),
                primary_span: Span { line: info.defined_at.line, column: info.defined_at.column, length: name.len(), label: "conflicts with function here".to_string() },
                secondary_spans: vec![], suggestion: None, note: None,
            };
            eprintln!("{}", serde_json::to_string(&diag).unwrap());
            std::process::exit(1);
        }
        if let Some(scope) = self.scopes.last_mut() {
            if scope.contains_key(&name) {
                // In a real implementation we would call report_error here.
                // For mass fixes, we will use a new error code E0128.
                let diag = Diagnostic {
                    code: "E0128".to_string(),
                    message: format!("re-definition of variable `{}`", name),
                    primary_span: Span { line: info.defined_at.line, column: info.defined_at.column, length: name.len(), label: "already defined in this scope".to_string() },
                    secondary_spans: vec![], suggestion: None, note: None,
                };
                eprintln!("{}", serde_json::to_string(&diag).unwrap());
                std::process::exit(1);
            }
            scope.insert(name, info);
        }
    }

    fn define_fn(&mut self, name: String, pos: Pos) {
        if self.get_var(&name).is_some() {
            let diag = Diagnostic {
                code: "E0128".to_string(),
                message: format!("name conflict: `{}` is already defined as a variable", name),
                primary_span: Span { line: pos.line, column: pos.column, length: name.len(), label: "conflicts with variable here".to_string() },
                secondary_spans: vec![], suggestion: None, note: None,
            };
            eprintln!("{}", serde_json::to_string(&diag).unwrap());
            std::process::exit(1);
        }
        if self.functions.contains_key(&name) {
            let diag = Diagnostic {
                code: "E0128".to_string(),
                message: format!("re-definition of function `{}`", name),
                primary_span: Span { line: pos.line, column: pos.column, length: name.len(), label: "already defined".to_string() },
                secondary_spans: vec![], suggestion: None, note: None,
            };
            eprintln!("{}", serde_json::to_string(&diag).unwrap());
            std::process::exit(1);
        }
        self.functions.insert(name, pos);
    }

    fn report_error(&self, name: &str, pos: &Pos, msg: &str, label: &str, code: &str) -> ! {
        let diag = Diagnostic {
            code: code.to_string(),
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
            Node::VariableDeclaration { identifier, dataType, isConstant, initializer, position, .. } => {
                if let Some(init) = initializer { self.analyze(init); }
                let pos = position.clone().unwrap_or(Pos { line: 0, column: 0 });
                self.define_var(identifier.clone(), VarInfo {
                    state: OwnershipState::Owned,
                    dtype: dataType.clone(),
                    is_constant: isConstant.unwrap_or(false),
                    defined_at: pos,
                });
            }
            Node::AssignmentExpression { left, right, position } => {
                self.analyze(right);
                if let Node::Identifier { name, .. } = &**left {
                    if let Some(info) = self.get_var(name) {
                        if info.is_constant {
                            let pos = position.clone().unwrap_or(info.defined_at.clone());
                            self.report_error(name, &pos, &format!("cannot assign to constant variable `{}`", name), "re-assignment of constant", "E0384");
                        }
                    }
                }
                self.analyze(left);
            }
            Node::Identifier { name, position } => {
                if let Some(info) = self.get_var(name) {
                    if info.state == OwnershipState::Moved {
                        let pos = position.clone().unwrap_or(info.defined_at.clone());
                        self.report_error(name, &pos, &format!("use of moved value: `{}`", name), "value used here after move", "E0382");
                    }
                }
            }
            Node::WhileStatement { test, body, .. } => {
                self.analyze(test);
                self.analyze(body);
            }
            Node::ForStatement { init, test, update, body, .. } => {
                self.enter_scope();
                if let Some(ref i) = init { self.analyze(&*i); }
                if let Some(ref t) = test { self.analyze(&*t); }
                if let Some(ref u) = update { self.analyze(&*u); }
                self.analyze(body);
                self.exit_scope();
            }
            Node::CallExpression { callee, arguments, .. } => {
                let is_println = if let Node::Identifier { name, .. } = &**callee { name == "println" } else { false };
                for arg in arguments {
                    if let Node::Identifier { name, position } = arg {
                        if let Some(info) = self.get_var_mut(name) {
                            if !BorrowChecker::is_copy_type(&info.dtype) {
                                if info.state == OwnershipState::Moved {
                                    let pos = position.clone().unwrap_or(info.defined_at.clone());
                                    self.report_error(name, &pos, &format!("cannot move already moved value `{}`", name), "attempt to move again", "E0382");
                                }
                                if !is_println {
                                    info.state = OwnershipState::Moved;
                                }
                            }
                        }
                    } else { self.analyze(arg); }
                }
            }
            Node::FunctionDeclaration { name, body, position, .. } => {
                let pos = position.clone().unwrap_or(Pos { line: 0, column: 0 });
                self.define_fn(name.clone(), pos);
                self.enter_scope();
                self.analyze(body);
                self.exit_scope();
            }
            Node::BlockStatement { body, .. } => { 
                self.enter_scope();
                for stmt in body { self.analyze(stmt); } 
                self.exit_scope();
            }
            Node::IfStatement { test, consequent, alternate, .. } => {
                self.analyze(test);
                
                // Capture states before branching
                let before_states: Vec<HashMap<String, OwnershipState>> = self.scopes.iter()
                    .map(|s| s.iter().map(|(k, v)| (k.clone(), v.state.clone())).collect())
                    .collect();

                self.analyze(consequent);
                
                // Capture states after consequent
                let after_consequent: Vec<HashMap<String, OwnershipState>> = self.scopes.iter()
                    .map(|s| s.iter().map(|(k, v)| (k.clone(), v.state.clone())).collect())
                    .collect();

                // Reset to before state for alternate
                for (i, scope_states) in before_states.iter().enumerate() {
                    for (name, state) in scope_states {
                        if let Some(info) = self.scopes[i].get_mut(name) {
                            info.state = state.clone();
                        }
                    }
                }

                if let Some(alt) = alternate {
                    self.analyze(alt);
                }

                // Merge states: if moved in EITHER branch, it's moved
                for (i, scope_states) in after_consequent.iter().enumerate() {
                    for (name, state) in scope_states {
                        if *state == OwnershipState::Moved {
                            if let Some(info) = self.scopes[i].get_mut(name) {
                                info.state = OwnershipState::Moved;
                            }
                        }
                    }
                }
            }
            Node::ExpressionStatement { expression } => self.analyze(expression),
            Node::ReturnStatement { argument, .. } => {
                if let Some(ref arg) = argument { self.analyze(&*arg); }
            }
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
