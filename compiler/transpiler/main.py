import json
import sys
import os
from datetime import datetime

class Transpiler:
    def __init__(self, ast):
        self.ast = ast
        self.indent_size = 4
        self.current_indent = 0
        self.cpp_keywords = {
            "alignas", "alignof", "and", "and_eq", "asm", "atomic_cancel", "atomic_commit", 
            "atomic_noexcept", "auto", "bitand", "bitor", "bool", "break", "case", "catch", 
            "char", "char8_t", "char16_t", "char32_t", "class", "compl", "concept", "const", 
            "consteval", "constexpr", "constinit", "const_cast", "continue", "co_await", 
            "co_return", "co_yield", "decltype", "default", "delete", "do", "double", 
            "dynamic_cast", "else", "enum", "explicit", "export", "extern", "false", "float", 
            "for", "friend", "goto", "if", "inline", "int", "long", "mutable", "namespace", 
            "new", "noexcept", "not", "not_eq", "nullptr", "operator", "or", "or_eq", 
            "private", "protected", "public", "reflexpr", "register", "reinterpret_cast", 
            "requires", "return", "short", "signed", "sizeof", "static", "static_assert", 
            "static_cast", "struct", "switch", "synchronized", "template", "this", 
            "thread_local", "throw", "true", "try", "typedef", "typeid", "typename", 
            "union", "unsigned", "using", "virtual", "void", "volatile", "wchar_t", 
            "while", "xor", "xor_eq"
        }
        self.user_symbols = set()
        for stmt in ast["body"]:
            if stmt["type"] == "FunctionDeclaration": self.user_symbols.add(self.mangle(stmt["name"]))
            if stmt["type"] == "VariableDeclaration": self.user_symbols.add(self.mangle(stmt["identifier"]))
            if stmt["type"] == "StructDeclaration": self.user_symbols.add(self.mangle(stmt["name"]))
        self.local_scopes = []

    def enter_scope(self): self.local_scopes.append(set())
    def exit_scope(self): self.local_scopes.pop()
    def add_local(self, name):
        if self.local_scopes: self.local_scopes[-1].add(self.mangle(name))
    def is_local(self, name):
        m = self.mangle(name)
        for s in reversed(self.local_scopes):
            if m in s: return True
        return False
    def mangle(self, name): return name + "_" if name in self.cpp_keywords else name
    def get_indent(self): return " " * (self.current_indent * self.indent_size)

    def generate(self, node, level=None, no_paren=False):
        if not node: return ""
        if level is not None: self.current_indent = level
        t = node.get("type")
        
        if t == "Program": return self.gen_program(node)
        if t == "FunctionDeclaration": return self.gen_function(node)
        if t == "VariableDeclaration": return self.gen_variable(node)
        if t == "BlockStatement": return self.gen_block(node)
        if t == "ExpressionStatement": return self.get_indent() + self.generate(node['expression'], no_paren=True) + ";"
        if t == "IfStatement": return self.gen_if(node)
        if t == "WhileStatement": return self.gen_while(node)
        if t == "ForStatement": return self.gen_for(node)
        if t == "BreakStatement": return self.get_indent() + "break;"
        if t == "ContinueStatement": return self.get_indent() + "continue;"
        if t == "ReturnStatement":
            arg = self.generate(node.get("argument"), no_paren=True)
            return self.get_indent() + f"return {arg};"
        if t == "AssignmentExpression": 
            return f"{self.generate(node['left'], no_paren=True)} = {self.generate(node['right'], no_paren=True)}"
        if t == "BinaryExpression": 
            l, r, op = self.generate(node['left']), self.generate(node['right']), node['operator']
            if op == "%=": return f"std::fmod({l}, {r})"
            res = f"{l} {op} {r}"
            return f"({res})" if not no_paren else res
        if t == "UnaryExpression":
            op, arg = node['operator'], self.generate(node['argument'], no_paren=True)
            if op == "&": return f"&({arg})"
            return f"{op}{arg}"
        if t == "CallExpression": return self.gen_call(node)
        if t == "MemberExpression": 
            obj = self.generate(node['object'], no_paren=True)
            if node['object']['type'] in ["BinaryExpression", "UnaryExpression"]:
                obj = "(" + obj + ")"
            return f"{obj}.{self.mangle(node['property'])}"
        if t == "IndexExpression": 
            obj = self.generate(node['object'], no_paren=True)
            if node['object']['type'] in ["BinaryExpression", "UnaryExpression"]:
                obj = "(" + obj + ")"
            return f"{obj}[{self.generate(node['index'], no_paren=True)} ]"
        if t == "SliceExpression": 
            obj = self.generate(node['object'], no_paren=True)
            start = self.generate(node['start'], no_paren=True)
            end = self.generate(node['end'], no_paren=True)
            return f"fax_std::Array<decltype({obj})::value_type>({obj}.begin() + {start}, {obj}.begin() + {end})"
        if t == "Literal": return self.gen_literal(node)
        if t == "Identifier":
            if node["name"] == "self": return "(*this)"
            m = self.mangle(node["name"])
            if self.is_local(node["name"]): return m
            if m in self.user_symbols and self.current_indent >= 2: return f"fax_app::{m}"
            return m
        if t == "ArrayLiteral": 
            elems = ", ".join([self.generate(e, no_paren=True) for e in node["elements"]])
            return "{" + elems + "}"
        if t == "StructDeclaration": return self.gen_struct(node)
        if t == "ImportStatement": return f'#include "{node["path"]}.hpp"'
        return f"/* Unknown Node: {t} */"

    def gen_import(self, node):
        return f'#include "{node["path"]}.hpp"'

    def gen_literal(self, node):
        val = node["value"]
        if isinstance(val, str):
            escaped = val.replace('\\', '\\').replace('"', '\"').replace('\n', '\n').replace('\t', '\t')
            return f'"{escaped}"'
        return "true" if val is True else "false" if val is False else str(val)

    def gen_program(self, node):
        header = "/**\n * @file output.cpp\n * @brief Generated by Fax-lang Polyglot Compiler\n */\n\n"
        header += '#include "fax_runtime.hpp"\n#include <cmath>\n'
        imported = set()
        for stmt in node["body"]:
            if stmt["type"] == "ImportStatement":
                p = stmt["path"]
                if p not in imported:
                    header += self.gen_import(stmt) + "\n"
                    imported.add(p)
        header += "\nnamespace fax_app {\n"
        decls = ""
        for stmt in node["body"]:
            if stmt["type"] in ["FunctionDeclaration", "StructDeclaration", "VariableDeclaration"]:
                decls += self.generate(stmt, 1) + "\n"
        header += decls + "\n} // namespace fax_app\n\nint main(int argc, char* argv[]) {\n    try {\n"
        self.current_indent = 2
        body = ""
        for stmt in node["body"]:
            if stmt["type"] not in ["FunctionDeclaration", "StructDeclaration", "ImportStatement", "VariableDeclaration"]:
                if stmt["type"] == "ExpressionStatement" and \
                   stmt["expression"]["type"] == "CallExpression" and \
                   stmt["expression"].get("callee")["name"] == "main": continue
                body += self.generate(stmt) + "\n"
        if "main" in self.user_symbols: body += "        fax_app::main();\n"
        footer = "        return 0;\n    } catch (const std::exception& e) {\n"
        footer += "        std::cerr << \"[FATAL]: \" << e.what() << std::endl;\n"
        footer += "        return 1;\n    }\n}"
        return header + body + footer

    def gen_struct(self, node):
        code = f"\n{self.get_indent()}struct {self.mangle(node['name'])} {{\n"
        self.current_indent += 1
        for f in node["fields"]:
            ft = f.get('type') or f.get('field_type')
            code += f"{self.get_indent()}{self.map_type(ft)} {self.mangle(f['name'])};\n"
        for m in node.get("methods", []): code += self.generate(m) + "\n"
        self.current_indent -= 1
        return code + f"{self.get_indent()}}};"

    def gen_function(self, node):
        rt = node.get("returnType") or node.get("return_type", "void")
        name = self.mangle(node["name"])
        self.enter_scope()
        for p in node["params"]:
            self.add_local(p["name"])
        params = ", ".join([f"{self.map_type(p.get('type') or p.get('param_type'))} {self.mangle(p['name'])}" 
                           for p in node["params"] if p.get('type') != "self"])
        code = f"\n{self.get_indent()}/** @brief {name} */\n{self.get_indent()}{self.map_type(rt)} {name}({params}) "
        code += self.generate(node["body"], self.current_indent)
        self.exit_scope()
        return code

    def gen_block(self, node):
        self.enter_scope()
        code = "{\n"
        self.current_indent += 1
        for s in node["body"]: code += self.generate(s) + "\n"
        self.current_indent -= 1
        self.exit_scope()
        return code + self.get_indent() + "}"

    def gen_variable(self, node):
        self.add_local(node["identifier"])
        dt = node.get("dataType") or node.get("data_type", "auto")
        prefix = "const " if node.get("isConstant") or node.get("is_constant") else ""
        init = f" = {self.generate(node['initializer'], no_paren=True)}" if node.get("initializer") else ""
        return f"{self.get_indent()}{prefix}{self.map_type(dt)} {self.mangle(node['identifier'])}{init};"

    def gen_if(self, node):
        test = self.generate(node['test'], no_paren=True)
        cons = self.generate(node["consequent"], self.current_indent).strip()
        alt = f' else {self.generate(node["alternate"], self.current_indent).strip()}' if node.get("alternate") else ""
        return f"{self.get_indent()}if ({test}) {cons}{alt}"

    def gen_while(self, node):
        test = self.generate(node['test'], no_paren=True)
        return f"{self.get_indent()}while ({test}) {self.generate(node['body'], self.current_indent).strip()}"

    def gen_for(self, node):
        i = self.generate(node["init"], no_paren=True).strip().replace(";", "") if node.get("init") else ""
        t = self.generate(node["test"], no_paren=True) if node.get("test") else ""
        u = self.generate(node["update"], no_paren=True) if node.get("update") else ""
        return f"{self.get_indent()}for ({i}; {t}; {u}) {self.generate(node['body'], self.current_indent).strip()}"

    def gen_call(self, node):
        callee = self.generate(node["callee"], no_paren=True)
        args = [self.generate(a, no_paren=True) for a in node["arguments"]]
        if callee == "println": return f"fax_std::println({', '.join(args)})"
        if callee in self.user_symbols and self.current_indent >= 2: return f"fax_app::{callee}({', '.join(args)})"
        return f"{callee}({', '.join(args)})"

    def map_type(self, t):
        if not t: return "auto"
        t = t.strip()
        if t.endswith("[]"): return f"fax_std::Array<{self.map_type(t[:-2])}>"
        if t.startswith("ptr<") and t.endswith(">"): return f"fax_std::Ptr<{self.map_type(t[4:-1])}>"
        if t.startswith("ref<") and t.endswith(">"): return f"{self.map_type(t[4:-1])}&"
        mapping = {"int": "int", "float": "float", "bool": "bool", "string": "std::string", "void": "void"}
        m = self.mangle(t)
        return f"fax_app::{m}" if m in self.user_symbols else mapping.get(t, m)

if __name__ == "__main__":
    if len(sys.argv) < 2: sys.exit(1)
    with open(sys.argv[1], 'r') as f:
        ast = json.load(f)
    print(Transpiler(ast).generate(ast))
