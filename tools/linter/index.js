const fs = require('fs');
const path = require('path');

class FaxLinter {
    lint(filePath) {
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');
        const reports = [];

        lines.forEach((line, i) => {
            // Rule 1: No trailing semicolon (Fax style preference)
            if (line.trim().endsWith(';') && !line.includes('for')) {
                reports.push({ line: i + 1, message: "Unnecessary trailing semicolon" });
            }
            // Rule 2: Prefer 'let' over 'var'
            if (line.includes('var ')) {
                reports.push({ line: i + 1, message: "Use 'let' instead of 'var' for modern Fax-lang" });
            }
        });

        return reports;
    }
}

module.exports = FaxLinter;
