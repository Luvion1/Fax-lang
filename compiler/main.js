#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const c = {
    red: (t) => `\x1b[38;5;196m${t}\x1b[0m`,
    boldRed: (t) => `\x1b[1;38;5;196m${t}\x1b[0m`,
    info: (t) => `\x1b[38;5;33m${t}\x1b[0m`,
    success: (t) => `\x1b[1;32m${t}\x1b[0m`,
    bold: (t) => `\x1b[1m${t}\x1b[22m`,
    gray: (t) => `\x1b[90m${t}\x1b[0m`,
    gutter: (t) => `\x1b[38;5;33m${t}\x1b[0m`,
    yellow: (t) => `\x1b[38;5;214m${t}\x1b[0m`
};

class FaxCompiler {
    constructor(options = {}) {
        this.options = { inputFile: options.inputFile || '', outputFile: options.outputFile || 'output.cpp', ...options };
        this.tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fax-'));
    }

    explainError(code) {
        const ERROR_DB = require('./errors/database');
        const error = ERROR_DB[code];
        if (!error) {
            console.error(`${c.boldRed('error')}: code ${c.bold(code)} not found in diagnostic database.`);
            return;
        }

        console.log(`\n${c.boldRed('error[' + code + ']')}: ${c.bold(error.title)}`);
        console.log(`${c.gutter('  |')}`);
        
        // Render explanation with side bar
        const lines = error.explanation.split('\n');
        lines.forEach(line => {
            console.log(`${c.gutter('  |')} ${line}`);
        });

        console.log(`${c.gutter('  |')}`);
        console.log(`${c.info('  = ')}${c.bold('solution')}: ${error.solution}`);
        console.log(`${c.gutter('  |')}`);
        console.log(`${c.gray('  = note')}: for more deep dives, visit https://docs.fax-lang.org/error/${code}\n`);
    }

    renderSpan(source, span, isPrimary) {
        const lineIdx = span.line - 1;
        const lineContent = source[lineIdx] || "";
        const gutter = c.gutter(`${span.line.toString().padStart(3, ' ')} | `);
        console.error(gutter + lineContent);
        const pointerChar = isPrimary ? '^' : '-';
        const pointerColor = isPrimary ? c.boldRed : c.info;
        const pointer = ' '.repeat(span.column - 1) + pointerColor(pointerChar.repeat(span.length || 1));
        const label = span.label ? ` ${pointerColor(span.label)}` : '';
        console.error(c.gutter('    | ') + pointer + label);
    }

    reportDiagnostic(diag, sourcePath) {
        try {
            const source = fs.readFileSync(sourcePath, 'utf-8').split('\n');
            console.error(`\n${c.boldRed('error[' + diag.code + ']')}: ${c.bold(diag.message)}`);
            console.error(`${c.info('  -->')} ${sourcePath}:${diag.primary_span.line}:${diag.primary_span.column}`);
            console.error(c.gutter('    |'));
            if (diag.secondary_spans) diag.secondary_spans.forEach(s => this.renderSpan(source, s, false));
            this.renderSpan(source, diag.primary_span, true);
            console.error(c.gutter('    |'));
            if (diag.suggestion) {
                console.error(`${c.info('help')}: ${diag.suggestion.message}`);
                console.error(c.gutter('    |'));
                console.error(`${c.info('  + ')}${c.success(diag.suggestion.replacement)}`);
                console.error(c.gutter('    |'));
            }
            if (diag.note) console.error(`${c.info('  = note')}: ${diag.note}`);
            console.log(`\n${c.gray('For more information about this error, try `faxc --explain ' + diag.code + '`')}\n`);
        } catch (e) {
            console.error(c.boldRed('\n[DIAGNOSTIC RENDER ERROR]: ') + JSON.stringify(diag));
        }
    }

    runPhase(name, command) {
        try {
            return execSync(command, { stdio: ['pipe', 'pipe', 'pipe'] }).toString();
        } catch (err) {
            const output = err.stderr.toString().trim().split('\n');
            const lastLine = output[output.length - 1];
            if (lastLine.startsWith('{') && lastLine.endsWith('}')) {
                this.reportDiagnostic(JSON.parse(lastLine), this.options.inputFile);
                process.exit(1);
            } else {
                console.error(`${c.boldRed('error')}: compilation phase lexible${name}lexible failed`);
                console.error(c.gray(err.stderr.toString()));
                process.exit(1);
            }
        }
    }

    async compile() {
        const sourcePath = path.resolve(this.options.inputFile);
        const tokensPath = path.join(this.tmpDir, 'tokens.json');
        const astPath = path.join(this.tmpDir, 'ast.json');

        const tokens = this.runPhase('Lexer', `cargo run --quiet --manifest-path compiler/lexer/Cargo.toml -- "${sourcePath}"`);
        fs.writeFileSync(tokensPath, tokens);
        this.runPhase('Parser-Build', 'npx tsc -p compiler/parser/tsconfig.json');
        const ast = this.runPhase('Parser', `node compiler/parser/dist/index.js "${tokensPath}"`);
        fs.writeFileSync(astPath, ast);
        this.runPhase('Checker/Analyzer', `cargo run --quiet --manifest-path compiler/checker/Cargo.toml -- "${astPath}"`);
        const cppCode = this.runPhase('Transpiler', `python3 compiler/transpiler/main.py "${astPath}"`);
        fs.writeFileSync(this.options.outputFile, cppCode);
        fs.rmSync(this.tmpDir, { recursive: true, force: true });
        return this.options.outputFile;
    }
}

if (require.main === module) {
    const args = process.argv.slice(2);
    const compiler = new FaxCompiler();
    if (args.includes('--explain')) {
        const code = args[args.indexOf('--explain') + 1];
        compiler.explainError(code);
    } else if (args.length > 0) {
        compiler.options.inputFile = args[0];
        compiler.compile().then(out => {
            console.log(`${c.success('    Finished')} compilation successful: ${out}`);
        }).catch(e => {});
    } else {
        console.log(`\n${c.bold('Fax-lang Compiler (faxc)')}`);
        console.log(`Usage: faxc <file.fax> | faxc --explain <CODE>\n`);
    }
}

module.exports = FaxCompiler;