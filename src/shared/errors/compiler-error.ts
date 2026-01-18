export class CompilerError extends Error {
  public line: number;
  public column: number;
  public file?: string;
  public hint?: string;
  public code: string;

  constructor(
    code: string,
    message: string,
    line: number,
    column: number,
    file?: string,
    hint?: string
  ) {
    super(message);
    this.name = "CompilerError";
    this.code = code;
    this.line = line;
    this.column = column;
    this.file = file;
    this.hint = hint;
  }
}
