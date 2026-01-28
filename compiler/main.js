#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const toml = require('smol-toml');
const { PluginManager } = require('../utils/plugin-system');

const c = {
    red: (t) => `\x1b[38;5;196m${t}\x1b[0m`,
    boldRed: (t) => `\x1b[1;38;5;196m${t}\x1b[0m`,
    info: (t) => `\x1b[38;5;33m${t}\x1b[0m`,
    success: (t) => `\x1b[1;32m${t}\x1b[0m`,
    bold: (t) => `\x1b[1m${t}\x1b[22m`,
    gray: (t) => `\x1b[90m${t}\x1b[0m`,
    gutter: (t) => `\x1b[38;5;33m${t}\x1b[0m`
};

class FaxCompiler {
    constructor(options = {}) {
        this.config = this.loadConfig();
        this.options = { 
            inputFile: options.inputFile || '', 
            outputFile: options.outputFile || (this.config.build.output_name + '.cpp'),
            ...options 
        };
        this.tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fax-'));
        this.pluginManager = new PluginManager();
    }

    loadConfig() {
        const configPath = path.resolve(process.cwd(), 'fax.toml');
        const defaultConfig = { project: { name: 'fax_project' }, build: { output_name: 'fax_app' }, safety: {} };
        if (fs.existsSync(configPath)) {
            try {
                const parsed = toml.parse(fs.readFileSync(configPath, 'utf-8'));
                return {
                    project: { ...defaultConfig.project, ...parsed.project },
                    build: { ...defaultConfig.build, ...parsed.build },
                    safety: { ...defaultConfig.safety, ...parsed.safety }
                };
            } catch (e) {
                return defaultConfig;
            }
        }
        return defaultConfig;
    }

    renderSpan(source, span, isPrimary) {
        if (!span || span.line === 0) return;
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
            const code = diag.code;
            console.log(`\n${c.gray('For more information about this error, try `faxc --explain ' + code + '`')}\n`);
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
                console.error(`${c.boldRed('error')}: compilation phase "${name}" failed`);
                console.error(c.gray(err.stderr.toString()));
                process.exit(1);
            }
        }
    }

    async compile() {
        const startTime = Date.now();
        const sourcePath = path.resolve(this.options.inputFile);
        const tokensPath = path.join(this.tmpDir, 'tokens.json');
        const astPath = path.join(this.tmpDir, 'ast.json');

        await this.pluginManager.loadPlugins();
        await this.pluginManager.activateAllPlugins();

        // 1. Lexer (Rust)
        const tokens = this.runPhase('Lexer', `cargo run --quiet --manifest-path compiler/lexer/Cargo.toml -- "${sourcePath}"`);
        fs.writeFileSync(tokensPath, tokens);

        // 2. Parser (TypeScript)
        if (!fs.existsSync(path.join(__dirname, 'parser/dist/index.js'))) {
            this.runPhase('Parser-Build', 'npx tsc -p compiler/parser/tsconfig.json');
        }
        const ast = this.runPhase('Parser', `node compiler/parser/dist/index.js "${tokensPath}"`);
        fs.writeFileSync(astPath, ast);

        // 3. Checker (Rust)
        const checkedAst = this.runPhase('Checker', `cargo run --quiet --manifest-path compiler/checker/Cargo.toml -- "${astPath}"`);
        fs.writeFileSync(astPath, checkedAst);

        // 4. Analyzer (Rust)
        const analyzedAst = this.runPhase('Analyzer', `cargo run --quiet --manifest-path compiler/analyzer/Cargo.toml -- "${astPath}"`);
        fs.writeFileSync(astPath, analyzedAst);

        // 5. Transpiler (Python)
        const cppCode = this.runPhase('Transpiler', `python3 compiler/transpiler/main.py "${astPath}"`);
        fs.writeFileSync(this.options.outputFile, cppCode);

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`${c.success('    Finished')} compilation in ${duration}s`);

        fs.rmSync(this.tmpDir, { recursive: true, force: true });
        return this.options.outputFile;
    }
}

if (require.main === module) {
    const args = process.argv.slice(2);
    const compiler = new FaxCompiler();
    if (args.includes('--explain')) {
        const ERROR_DB = require('./errors/database');
        const code = args[args.indexOf('--explain') + 1];
        const error = ERROR_DB[code];
        if (error) {
            console.log(`\n${c.info(c.bold(code))} - ${c.bold(error.title)}`);
            console.log(`${c.gutter('  |')}`);
            error.explanation.split('\n').forEach(line => console.log(`${c.gutter('  |')} ${line}`));
            console.log(`${c.gutter('  |')}`);
            console.log(`${c.info('  = ')}${c.bold('solution')}: ${error.solution}`);
            console.log(`${c.gutter('  |')}\n`);
        } else {
            console.error(`${c.red('error:')} code ${code} not found`);
        }
    } else if (args.length > 0) {
        compiler.options.inputFile = args[0];
        compiler.compile().then(out => {
            // Already logged finished duration
        });
    } else {
        console.log(`\n${c.bold('Fax-lang Compiler (faxc)')}`);
        console.log(`Usage: faxc <file.fax> | faxc --explain <CODE>\n`);
    }
}

module.exports = FaxCompiler;
