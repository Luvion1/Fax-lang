use serde::{Serialize, Deserialize};
use std::collections::HashMap;
use std::env;
use std::fs;

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Span {
    line: usize,
    column: usize,
    length: usize,
    label: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Diagnostic {
    code: String,
    message: String,
    primary_span: Span,
    secondary_spans: Vec<Span>,
    suggestion: Option<Suggestion>,
    note: Option<String>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Suggestion {
    message: String,
    replacement: String,
}

#[allow(non_snake_case)]
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(tag = "type")]
enum Node {
    Program { body: Vec<Node> },
    VariableDeclaration { identifier: String, dataType: String, initializer: Option<Box<Node>>, position: Option<Pos> },
    FunctionDeclaration { name: String, params: Vec<serde_json::Value>, returnType: String, body: Box<Node> },
    ExpressionStatement { expression: Box<Node> },
    CallExpression { callee: Box<Node>, arguments: Vec<Node> },
    Identifier { name: String, position: Option<Pos> },
    BlockStatement { body: Vec<Node> },
    #[serde(other)]
    Unknown,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Pos { line: usize, column: usize }

struct State {
    is_moved: bool,
    defined_at: Span,
}

fn report_error(diag: Diagnostic) -> ! {
    eprintln!("{}", serde_json::to_string(&diag).unwrap());
    std::process::exit(1);
}

fn analyze_node(node: &Node, registry: &mut HashMap<String, State>) {
    match node {
        Node::Program { body } => { for n in body { analyze_node(n, registry); } }
        Node::VariableDeclaration { identifier, position, .. } => {
            let pos = position.as_ref().unwrap_or(&Pos { line: 0, column: 0 });
            registry.insert(identifier.clone(), State {
                is_moved: false,
                defined_at: Span {
                    line: pos.line,
                    column: pos.column,
                    length: identifier.len(),
                    label: "variable defined here".to_string(),
                }
            });
        }
        Node::CallExpression { arguments, .. } => {
            for arg in arguments {
                if let Node::Identifier { name, position } = arg {
                    if let Some(state) = registry.get_mut(name) {
                        if state.is_moved {
                            let pos = position.as_ref().unwrap_or(&Pos { line: 0, column: 0 });
                            report_error(Diagnostic {
                                code: "E0382".to_string(),
                                message: format!("use of moved value: `{}`", name),
                                primary_span: Span {
                                    line: pos.line,
                                    column: pos.column,
                                    length: name.len(),
                                    label: "value used here after move".to_string(),
                                },
                                secondary_spans: vec![state.defined_at.clone()],
                                suggestion: None,
                                note: Some("move occurs because variables are moved by default in Fax-lang".to_string()),
                            });
                        }
                        state.is_moved = true; // Mark as moved
                    }
                }
            }
        }
        Node::BlockStatement { body } => { for n in body { analyze_node(n, registry); } }
        Node::FunctionDeclaration { body, .. } => { analyze_node(body, registry); }
        Node::ExpressionStatement { expression } => { analyze_node(expression, registry); }
        _ => {}
    }
}

fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() < 2 { return; }
    let input = fs::read_to_string(&args[1]).expect("Failed to read AST");
    let ast: Node = serde_json::from_str(&input).expect("Failed to parse AST");
    
    let mut registry = HashMap::new();
    analyze_node(&ast, &mut registry);
    
    println!("{}", input);
}