// ANSI Color codes for zero-dependency logging
const colors = {
    gray: (s: string) => `\x1b[90m${s}\x1b[0m`,
    blue: (s: string) => `\x1b[34m${s}\x1b[0m`,
    yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
    red: (s: string) => `\x1b[31m${s}\x1b[0m`,
    green: (s: string) => `\x1b[32m${s}\x1b[0m`,
};

export const LogLevel = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    SILENT: 4
} as const;

export type LogLevel = typeof LogLevel[keyof typeof LogLevel];

export class Logger {
    private static level: LogLevel = LogLevel.INFO;

    static setLevel(level: LogLevel) {
        this.level = level;
    }

    static debug(message: string, context?: string) {
        if (this.level <= LogLevel.DEBUG) {
            console.log(colors.gray(`[DEBUG]${context ? ` [${context}]` : ''} ${message}`));
        }
    }

    static info(message: string, context?: string) {
        if (this.level <= LogLevel.INFO) {
            console.log(colors.blue(`[Fax]${context ? ` [${context}]` : ''} ${message}`));
        }
    }

    static warn(message: string, context?: string) {
        if (this.level <= LogLevel.WARN) {
            console.log(colors.yellow(`[WARN]${context ? ` [${context}]` : ''} ${message}`));
        }
    }

    static error(message: string, context?: string) {
        if (this.level <= LogLevel.ERROR) {
            console.error(colors.red(`[ERROR]${context ? ` [${context}]` : ''} ${message}`));
        }
    }

    static success(message: string) {
        if (this.level <= LogLevel.INFO) {
            console.log(colors.green(`✅ ${message}`));
        }
    }
}
