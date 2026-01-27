use serde::{Serialize, Deserialize};
use std::env;
use std::fs;

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
struct Span { line: usize, column: usize, length: usize, label: String }

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Suggestion { message: String, replacement: String }

#[allow(non_snake_case)]
#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(tag = "type")]
enum Node {
    Program { body: Vec<Node> },
    FunctionDeclaration { name: String, params: Vec<serde_json::Value>, returnType: String, body: Box<Node> },
    VariableDeclaration { identifier: String, dataType: String, initializer: Option<Box<Node>>, position: Option<Pos> },
    BlockStatement { body: Vec<Node> },
    ExpressionStatement { expression: Box<Node> },
    #[serde(other)] Unknown,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Pos { line: usize, column: usize }

fn report_error(diag: Diagnostic) -> ! {
    eprintln!("{}", serde_json::to_string(&diag).unwrap());
    std::process::exit(1);
}

fn walk(node: &Node) {
    match node {
        Node::Program { body } => { for n in body { walk(n); } }
        Node::FunctionDeclaration { body, .. } => { walk(body); }
        Node::BlockStatement { body } => { for n in body { walk(n); } }
        Node::VariableDeclaration { identifier, dataType, position, .. } => {
            if identifier == "err" {
                report_error(Diagnostic {
                    code: "E001".to_string(),
                    message: "forbidden identifier name".to_string(),
                    primary_span: Span {
                        line: position.as_ref().map(|p| p.line).unwrap_or(0),
                        column: position.as_ref().map(|p| p.column).unwrap_or(0),
                        length: identifier.len(),
                        label: "this name is reserved by the compiler".to_string(),
                    },
                    secondary_spans: vec![],
                    suggestion: Some(Suggestion {
                        message: "try using a different name".to_string(),
                        replacement: format!("let result_val: {}", dataType),
                    }),
                    note: Some("identifiers named 'err' interfere with internal diagnostic piping".to_string()),
                });
            }
            if dataType == "void" {
                let pos = position.clone().unwrap_or(Pos { line: 0, column: 0 });
                report_error(Diagnostic {
                    code: "E002".to_string(),
                    message: "invalid type for variable".to_string(),
                    primary_span: Span {
                        line: pos.line,
                        column: pos.column,
                        length: 3, 
                        label: format!("variable `{}` cannot have type 'void'", identifier),
                    },
                    secondary_spans: vec![],
                    suggestion: Some(Suggestion {
                        message: "consider using `int` instead".to_string(),
                        replacement: format!("let {}: int", identifier),
                    }),
                    note: Some("the 'void' type represents the absence of a value".to_string()),
                });
            }
        }
        _ => {}
    }
}

fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() < 2 { return; }
    let input = fs::read_to_string(&args[1]).expect("Failed to read AST");
    let ast: Node = serde_json::from_str(&input).expect("Failed to parse AST");
    walk(&ast);
    println!("{}", input);
}
