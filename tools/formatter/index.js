const fs = require('fs');

class FaxFormatter {
    format(filePath) {
        const content = fs.readFileSync(filePath, 'utf-8');
        let formatted = content
            .replace(/\s*=\s*/g, ' = ') // Space around equals
            .replace(/\s*{\s*/g, ' {')  // Space before brace
            .replace(/{\n\s*/g, '{\n    '); // Simple indent check
        
        fs.writeFileSync(filePath, formatted);
        return true;
    }
}

module.exports = FaxFormatter;
