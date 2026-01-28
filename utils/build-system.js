const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class BuildSystem {
    constructor() {
        this.root = path.resolve(__dirname, '..');
    }

    log(msg) {
        console.log(`\x1b[34m[BUILD]\x1b[0m ${msg}`);
    }

    async buildAll() {
        this.log("Starting full workspace build...");
        this.buildLexer();
        this.buildParser();
        this.buildChecker();
        this.buildAnalyzer();
        this.log("Build completed successfully.");
    }

    buildLexer() {
        this.log("Building Rust Lexer...");
        execSync('cargo build --release --manifest-path compiler/lexer/Cargo.toml');
    }

    buildParser() {
        this.log("Building TypeScript Parser...");
        execSync('npx tsc -p compiler/parser/tsconfig.json');
    }

    buildChecker() {
        this.log("Building Rust Checker...");
        execSync('cargo build --release --manifest-path compiler/checker/Cargo.toml');
    }

    buildAnalyzer() {
        this.log("Building Rust Analyzer...");
        execSync('cargo build --release --manifest-path compiler/analyzer/Cargo.toml');
    }

    clean() {
        this.log("Cleaning artifacts...");
        const targets = [
            'compiler/lexer/target',
            'compiler/parser/dist',
            'compiler/checker/target',
            'compiler/analyzer/target'
        ];
        targets.forEach(t => {
            const p = path.join(this.root, t);
            if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
        });
    }
}

if (require.main === module) {
    new BuildSystem().buildAll();
}

module.exports = BuildSystem;
