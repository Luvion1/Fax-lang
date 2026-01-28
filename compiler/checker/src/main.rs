use serde::{Serialize, Deserialize};
use std::collections::HashMap;
use std::env;
use std::fs;

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Diagnostic {
    code: String, message: String,
    primary_span: Span, secondary_spans: Vec<Span>,
    suggestion: Option<Suggestion>, note: Option<String>,
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
    VariableDeclaration { 
        identifier: String, 
        #[serde(rename = "dataType")] data_type: String, 
        #[serde(rename = "isConstant")] is_constant: Option<bool>, 
        initializer: Option<Box<Node>>, 
        position: Option<Pos> 
    },
    FunctionDeclaration { 
        name: String, 
        params: Vec<Param>, 
        #[serde(rename = "returnType")] return_type: String, 
        body: Box<Node>, 
        position: Option<Pos> 
    },
    StructDeclaration { name: String, fields: Vec<Field>, methods: Vec<Node>, position: Option<Pos> },
    BlockStatement { body: Vec<Node>, position: Option<Pos> },
    ExpressionStatement { expression: Box<Node> },
    AssignmentExpression { left: Box<Node>, right: Box<Node>, position: Option<Pos> },
    CallExpression { callee: Box<Node>, arguments: Vec<Node>, position: Option<Pos> },
    MemberExpression { object: Box<Node>, property: String, position: Option<Pos> },
    BinaryExpression { operator: String, left: Box<Node>, right: Box<Node>, position: Option<Pos> },
    IfStatement { test: Box<Node>, consequent: Box<Node>, alternate: Option<Box<Node>>, position: Option<Pos> },
    WhileStatement { test: Box<Node>, body: Box<Node>, position: Option<Pos> },
    ForStatement { init: Option<Box<Node>>, test: Option<Box<Node>>, update: Option<Box<Node>>, body: Box<Node>, position: Option<Pos> },
    UnaryExpression { operator: String, argument: Box<Node> },
    Identifier { name: String, position: Option<Pos> },
    Literal { value: serde_json::Value, position: Option<Pos> },
    ReturnStatement { argument: Option<Box<Node>>, position: Option<Pos> },
    BreakStatement { position: Option<Pos> },
    ContinueStatement { position: Option<Pos> },
    #[serde(other)] Unknown,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Field { name: String, #[serde(rename = "type")] field_type: String }

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Param { name: String, #[serde(rename = "type")] param_type: String }

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Pos { line: usize, column: usize }

struct StructInfo {
    fields: HashMap<String, String>,
}

struct SymbolTable {
    scopes: Vec<HashMap<String, String>>,
    functions: HashMap<String, (Vec<String>, String)>,
    structs: HashMap<String, StructInfo>,
}

impl SymbolTable {
    fn new() -> Self { SymbolTable { scopes: vec![HashMap::new()], functions: HashMap::new(), structs: HashMap::new() } }
    fn enter_scope(&mut self) { self.scopes.push(HashMap::new()); }
    fn exit_scope(&mut self) { self.scopes.pop(); }
    fn define(&mut self, name: String, dtype: String) {
        if let Some(scope) = self.scopes.last_mut() { scope.insert(name, dtype); }
    }
    fn lookup(&self, name: &str) -> Option<String> {
        for scope in self.scopes.iter().rev() {
            if let Some(dtype) = scope.get(name) { return Some(dtype.clone()); }
        }
        None
    }
}

fn report_error(diag: Diagnostic) -> ! {
    eprintln!("{}", serde_json::to_string(&diag).unwrap());
    std::process::exit(1);
}

fn get_type(node: &Node, symbols: &SymbolTable) -> String {
    match node {
        Node::Literal { value, .. } => {
            if value.is_i64() { "int".to_string() }
            else if value.is_f64() { "float".to_string() }
            else if value.is_boolean() { "bool".to_string() }
            else if value.is_string() { "string".to_string() }
            else { "unknown".to_string() }
        }
        Node::Identifier { name, .. } => symbols.lookup(name).unwrap_or("unknown".to_string()),
        Node::UnaryExpression { operator, argument } => {
            if operator == "&" { return format!("ptr<{}>", get_type(argument, symbols)); }
            if operator == "*" {
                let inner = get_type(argument, symbols);
                if inner.starts_with("ptr<") && inner.ends_with(">") {
                    return inner[4..inner.len()-1].to_string();
                }
            }
            get_type(argument, symbols)
        }
        Node::BinaryExpression { operator, left, right, .. } => {
            if matches!(operator.as_str(), "==" | "!=" | "<" | ">" | "<=" | ">=" | "&&" | "||") {
                return "bool".to_string();
            }
            let lt = get_type(left, symbols);
            let rt = get_type(right, symbols);
            if lt == "float" || rt == "float" { "float".to_string() }
            else if lt == "string" || rt == "string" { "string".to_string() }
            else { lt }
        }
        Node::CallExpression { callee, .. } => {
            if let Node::Identifier { name, .. } = &**callee {
                if let Some((_, ret)) = symbols.functions.get(name) { return ret.clone(); }
            }
            "unknown".to_string()
        }
        Node::MemberExpression { object, property, .. } => {
            let obj_type = get_type(object, symbols);
            if let Some(info) = symbols.structs.get(&obj_type) {
                if let Some(f_type) = info.fields.get(property) {
                    return f_type.clone();
                }
            }
            "unknown".to_string()
        }
        _ => "unknown".to_string(),
    }
}

fn check(node: &Node, symbols: &mut SymbolTable) {
    match node {
        Node::Program { body } => {
            for stmt in body {
                match stmt {
                    Node::FunctionDeclaration { name, params, return_type, .. } => {
                        let p_types = params.iter().map(|p| p.param_type.clone()).collect();
                        symbols.functions.insert(name.clone(), (p_types, return_type.clone()));
                    }
                    Node::StructDeclaration { name, fields, .. } => {
                        let mut field_map = HashMap::new();
                        for f in fields { field_map.insert(f.name.clone(), f.field_type.clone()); }
                        symbols.structs.insert(name.clone(), StructInfo { fields: field_map });
                    }
                    _ => {}
                }
            }
            for stmt in body { check(stmt, symbols); }
        }
        Node::FunctionDeclaration { params, body, .. } => {
            symbols.enter_scope();
            for p in params { symbols.define(p.name.clone(), p.param_type.clone()); }
            check(body, symbols);
            symbols.exit_scope();
        }
        Node::VariableDeclaration { identifier, data_type, initializer, position, .. } => {
            if let Some(init) = initializer {
                let init_type = get_type(init, symbols);
                if data_type != "auto" && init_type != "unknown" && data_type != &init_type {
                    let p = position.clone().unwrap_or(Pos { line: 0, column: 0 });
                    report_error(Diagnostic {
                        code: "E0308".to_string(), message: "mismatched types".to_string(),
                        primary_span: Span { line: p.line, column: p.column, length: identifier.len(), label: format!("expected `{}`, found `{}`", data_type, init_type) },
                        secondary_spans: vec![], suggestion: None, note: None,
                    });
                }
            }
            symbols.define(identifier.clone(), data_type.clone());
        }
        Node::AssignmentExpression { left, right, position } => {
            let var_type = get_type(left, symbols);
            let val_type = get_type(right, symbols);
            if var_type != "unknown" && val_type != "unknown" && var_type != val_type {
                let name = match &**left {
                    Node::Identifier { name, .. } => name.clone(),
                    Node::MemberExpression { property, .. } => property.clone(),
                    _ => "expression".to_string(),
                };
                let p = position.clone().unwrap_or(Pos { line: 0, column: 0 });
                report_error(Diagnostic {
                    code: "E0308".to_string(),
                    message: "mismatched types during assignment".to_string(),
                    primary_span: Span {
                        line: p.line, column: p.column, length: name.len(),
                        label: format!("expected `{}`, found `{}`", var_type, val_type),
                    },
                    secondary_spans: vec![], suggestion: None, note: None,
                });
            }
            check(left, symbols);
            check(right, symbols);
        }
        Node::CallExpression { callee, arguments, position } => {
            if let Node::Identifier { name, .. } = &**callee {
                if name == "println" { return; }
                if let Some((p_types, _)) = symbols.functions.get(name).cloned() {
                    if p_types.len() != arguments.len() {
                        let p = position.clone().unwrap_or(Pos { line: 0, column: 0 });
                        report_error(Diagnostic {
                            code: "E0061".to_string(),
                            message: format!("function `{}` expected {} arguments, got {}", name, p_types.len(), arguments.len()),
                            primary_span: Span { line: p.line, column: p.column, length: name.len(), label: format!("expected {} arguments", p_types.len()) },
                            secondary_spans: vec![], suggestion: None, note: None,
                        });
                    }
                    for (i, arg) in arguments.iter().enumerate() {
                        let arg_type = get_type(arg, symbols);
                        if arg_type != "unknown" && arg_type != p_types[i] {
                            let p = position.clone().unwrap_or(Pos { line: 0, column: 0 });
                            report_error(Diagnostic {
                                code: "E0308".to_string(),
                                message: format!("argument type mismatch in call to `{}`", name),
                                primary_span: Span { line: p.line, column: p.column, length: name.len(), label: format!("argument #{} expected `{}`, found `{}`", i+1, p_types[i], arg_type) },
                                secondary_spans: vec![], suggestion: None, note: None,
                            });
                        }
                    }
                }
            }
        }
        Node::BinaryExpression { operator, left, right, position } => {
            let lt = get_type(left, symbols);
            let rt = get_type(right, symbols);
            if lt != "unknown" && rt != "unknown" && lt != rt {
                if (lt == "string" && rt != "string") || (rt == "string" && lt != "string") {
                    let p = position.clone().unwrap_or(Pos { line: 0, column: 0 });
                    report_error(Diagnostic {
                        code: "E0308".to_string(),
                        message: "operator type mismatch".to_string(),
                        primary_span: Span { line: p.line, column: p.column, length: operator.len(), label: format!("cannot apply `{}` to `{}` and `{}`", operator, lt, rt) },
                        secondary_spans: vec![], suggestion: None, note: None,
                    });
                }
            }
            check(left, symbols);
            check(right, symbols);
        }
        Node::BlockStatement { body, .. } => {
            symbols.enter_scope();
            for stmt in body { check(stmt, symbols); }
            symbols.exit_scope();
        }
        Node::ExpressionStatement { expression } => check(expression, symbols),
        Node::IfStatement { test, consequent, alternate, .. } => {
            check(test, symbols);
            check(consequent, symbols);
            if let Some(alt) = alternate { check(alt, symbols); }
        }
        Node::WhileStatement { test, body, .. } => {
            check(test, symbols);
            check(body, symbols);
        }
        Node::ForStatement { init: f_init, test: f_test, update: f_update, body, .. } => {
            symbols.enter_scope();
            if let Some(ref i) = f_init { check(&*i, symbols); }
            if let Some(ref t) = f_test { check(&*t, symbols); }
            if let Some(ref u) = f_update { check(&*u, symbols); }
            check(body, symbols);
            symbols.exit_scope();
        }
        _ => {}
    }
}

fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() < 2 { return; }
    let input = fs::read_to_string(&args[1]).expect("Failed to read AST");
    let ast: Node = serde_json::from_str(&input).expect("Failed to parse AST JSON");
    let mut symbols = SymbolTable::new();
    check(&ast, &mut symbols);
    println!("{}", input);
}
