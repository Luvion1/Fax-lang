#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const FaxCompiler = require('./main');
const FaxLinter = require('../tools/linter');
const FaxFormatter = require('../tools/formatter');
const BuildSystem = require('../utils/build-system');

const COLORS = {
    bold: (t) => `\x1b[1m${t}\x1b[22m`,
    green: (t) => `\x1b[1;32m${t}\x1b[0m`,
    red: (t) => `\x1b[1;31m${t}\x1b[0m`,
    blue: (t) => `\x1b[1;34m${t}\x1b[0m`,
    gray: (t) => `\x1b[90m${t}\x1b[0m`
};

async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    const target = args[1];

    switch (command) {
        case 'run':
            if (!target) return console.error(COLORS.red("error: no input file provided"));
            const compiler = new FaxCompiler({ inputFile: target });
            console.log(`${COLORS.green('   Compiling')} ${target}...`);
            try {
                // Check if g++ is installed
                try {
                    execSync('g++ --version');
                } catch (e) {
                    console.error(COLORS.red("error: g++ not found."), "Please install GCC to run Fax-lang programs.");
                    process.exit(1);
                }

                const cppFile = await compiler.compile();
                const runtimeSource = path.join(__dirname, 'transpiler', 'cpp', 'fax_runtime.hpp');
                const targetDir = path.dirname(path.resolve(cppFile));
                const runtimeTarget = path.join(targetDir, 'fax_runtime.hpp');
                
                if (!fs.existsSync(runtimeTarget)) {
                    fs.copyFileSync(runtimeSource, runtimeTarget);
                }

                const binaryName = "./fax_app.out";
                console.log(`${COLORS.green('    Linking')} C++ to binary...`);
                execSync(`g++ -O3 -I${targetDir} ${cppFile} -o ${binaryName}`);
                
                console.log(`${COLORS.green('    Running')} executable...\n${COLORS.gray('--------------------------------------------------')}`);
                const output = execSync(binaryName).toString();
                console.log(output);
                console.log(`${COLORS.gray('--------------------------------------------------')}`);
                
                if (fs.existsSync(binaryName)) fs.unlinkSync(binaryName);
            } catch (e) {
                console.error(COLORS.error("\n[RUN FAILED]"), e.message);
            }
            break;

        case 'lint':
            if (!target) return console.error(COLORS.red("error: no file to lint"));
            const linter = new FaxLinter();
            const reports = linter.lint(target);
            if (reports.length === 0) {
                console.log(`${COLORS.green('Success:')} No issues found in ${target}`);
            } else {
                reports.forEach(r => console.log(`${COLORS.red('lint:')} ${target}:${r.line} - ${r.message}`));
            }
            break;

        case 'fmt':
            if (!target) return console.error(COLORS.red("error: no file to format"));
            const formatter = new FaxFormatter();
            formatter.format(target);
            console.log(`${COLORS.green('Formatted')} ${target}`);
            break;

        case 'build':
            const bs = new BuildSystem();
            await bs.buildAll();
            break;

        case 'clean':
            new BuildSystem().clean();
            break;

        case '--version':
            console.log("Fax-lang CLI v0.1.0");
            break;

        default:
            console.log(`${COLORS.bold('Fax-lang Toolchain')}`);
            console.log(`Usage:`);
            console.log(`  fax run <file.fax>   Compile and execute`);
            console.log(`  fax lint <file.fax>  Check code style`);
            console.log(`  fax fmt <file.fax>   Format source code`);
            console.log(`  fax build            Build the compiler modules`);
            console.log(`  fax clean            Remove build artifacts`);
    }
}

main();
