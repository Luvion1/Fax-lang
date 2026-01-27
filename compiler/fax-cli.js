#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const FaxCompiler = require('./main');

const COLORS = {
    bold: (t) => `\x1b[1m${t}\x1b[22m`,
    green: (t) => `\x1b[1;32m${t}\x1b[0m`,
    error: (t) => `\x1b[1;31m${t}\x1b[0m`,
    gray: (t) => `\x1b[90m${t}\x1b[0m`
};

async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    const fileName = args[1];

    if (command === 'run' && fileName) {
        // Handle if FaxCompiler is the default export or the object itself
        const CompilerClass = typeof FaxCompiler === 'function' ? FaxCompiler : FaxCompiler.FaxCompiler;
        const compiler = new CompilerClass({ inputFile: fileName });
        
        console.log(`${COLORS.green('   Compiling')} ${fileName}...`);
        try {
            const cppFile = await compiler.compile();
            const binaryName = fileName.replace('.fax', '').replace(/[/\\]/g, '_');
            
            console.log(`${COLORS.green('    Linking')} C++ to binary...`);
            execSync(`g++ -O3 ${cppFile} -o ${binaryName}`);
            
            console.log(`${COLORS.green('    Running')} ${binaryName}...\n${COLORS.gray('--------------------------------------------------')}`);
            const output = execSync(`./${binaryName}`).toString();
            console.log(output);
            console.log(`${COLORS.gray('--------------------------------------------------')}`);
            
            if (fs.existsSync(binaryName)) fs.unlinkSync(binaryName);
        } catch (err) {
            // Errors are handled by the compiler's diagnostic system
        }
    } else {
        console.log(`${COLORS.bold('Fax-lang CLI Tools')}`);
        console.log(`Usage: fax run <file.fax>`);
    }
}

main();