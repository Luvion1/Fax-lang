export class ErrorReporter {
  static report(error: any, source?: string, filePath?: string) {
    const code = error.code || "EXXX";
    const line = error.line || 0;
    const col = error.column || 0;
    const message = error.message || "Unknown error";
    const hint = error.hint;

    const red = (s: string) => `\x1b[31m${s}\x1b[0m`;
    const redBold = (s: string) => `\x1b[31;1m${s}\x1b[0m`;
    const whiteBold = (s: string) => `\x1b[37;1m${s}\x1b[0m`;
    const blue = (s: string) => `\x1b[34m${s}\x1b[0m`;
    const gray = (s: string) => `\x1b[90m${s}\x1b[0m`;
    const cyanBold = (s: string) => `\x1b[36;1m${s}\x1b[0m`;
    const yellow = (s: string) => `\x1b[33m${s}\x1b[0m`;

    console.error(`\n${redBold("error")}${whiteBold(`[${code}]`)}: ${whiteBold(message)}`);
    console.error(`${blue("  -->")} ${white(filePath || "unknown")}:${yellow(line.toString())}:${yellow(col.toString())}`);
    
    if (source && line > 0) {
      const lines = source.split('\n');
      const start = Math.max(0, line - 2);
      const end = Math.min(lines.length, line + 1);

      console.error(blue("   |"));
      for (let i = start; i < end; i++) {
        const isErrorLine = i === line - 1;
        const lineNum = (i + 1).toString().padStart(3);
        const gutter = isErrorLine ? blue(`${lineNum} | `) : gray(`${lineNum} | `);
        
        console.error(gutter + lines[i]);

        if (isErrorLine) {
            const padding = " ".repeat(col - 1);
            const marker = redBold("^" + "~".repeat(Math.max(0, 1)));
            console.error(blue("   | ") + padding + marker);
        }
      }
      console.error(blue("   |"));
    }

    if (hint) {
      console.error(`${cyanBold("   = help")}: ${white(hint)}`);
    }
    
    console.error(""); 
  }
}

function white(s: string) { return `\x1b[37m${s}\x1b[0m`; }
