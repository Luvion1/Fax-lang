import { TokenType } from "./types.ts";
import type { Token } from "./types.ts";
import { KEYWORDS } from "./constants/keywords.ts";
import { CompilerError } from "../../shared/errors/compiler-error.ts";

export class Lexer {
  private input: string;
  private position: number = 0;
  private readPosition: number = 0;
  private ch: string | null = null;
  private line: number = 1;
  private column: number = 0;

  constructor(input: string) {
    this.input = input;
    this.readChar();
  }

  public nextToken(): Token {
    this.skipWhitespace();

    let token: Token;
    const startCol = this.column;

    if (this.ch === null) {
      return this.newToken(TokenType.EOF, "", this.line, startCol);
    }

    switch (this.ch) {
      case "=":
        if (this.peekChar() === "=") {
          const ch = this.ch;
          this.readChar();
          token = this.newToken(TokenType.EqualEqual, ch + this.ch, this.line, startCol);
        } else if (this.peekChar() === ">") {
          const ch = this.ch;
          this.readChar();
          token = this.newToken(TokenType.FatArrow, ch + this.ch, this.line, startCol);
        } else {
          token = this.newToken(TokenType.Equal, this.ch, this.line, startCol);
        }
        break;
      case "+":
        if (this.peekChar() === "=") {
          const ch = this.ch;
          this.readChar();
          token = this.newToken(TokenType.PlusEqual, ch + this.ch, this.line, startCol);
        } else {
          token = this.newToken(TokenType.Plus, this.ch, this.line, startCol);
        }
        break;
      case "-":
        if (this.peekChar() === ">") {
          const ch = this.ch;
          this.readChar();
          token = this.newToken(TokenType.Arrow, ch + this.ch, this.line, startCol);
        } else if (this.peekChar() === "=") {
          const ch = this.ch;
          this.readChar();
          token = this.newToken(TokenType.MinusEqual, ch + this.ch, this.line, startCol);
        } else {
          token = this.newToken(TokenType.Minus, this.ch, this.line, startCol);
        }
        break;
      case "!":
        if (this.peekChar() === "=") {
          const ch = this.ch;
          this.readChar();
          token = this.newToken(TokenType.BangEqual, ch + this.ch, this.line, startCol);
        } else {
          token = this.newToken(TokenType.Bang, this.ch, this.line, startCol);
        }
        break;
      case "/":
        if (this.peekChar() === "/") {
          this.skipSingleLineComment();
          return this.nextToken();
        } else if (this.peekChar() === "*") {
          this.skipMultiLineComment();
          return this.nextToken();
        } else {
          token = this.newToken(TokenType.Slash, this.ch, this.line, startCol);
        }
        break;
      case "*":
        token = this.newToken(TokenType.Star, this.ch, this.line, startCol);
        break;
      case "<":
        if (this.peekChar() === "=") {
          const ch = this.ch;
          this.readChar();
          token = this.newToken(TokenType.LessEqual, ch + this.ch, this.line, startCol);
        } else {
          token = this.newToken(TokenType.Less, this.ch, this.line, startCol);
        }
        break;
      case ">":
        if (this.peekChar() === "=") {
          const ch = this.ch;
          this.readChar();
          token = this.newToken(TokenType.GreaterEqual, ch + this.ch, this.line, startCol);
        } else {
          token = this.newToken(TokenType.Greater, this.ch, this.line, startCol);
        }
        break;
      case ";":
        token = this.newToken(TokenType.Semicolon, this.ch, this.line, startCol);
        break;
      case ":":
        if (this.peekChar() === ":") {
          const ch = this.ch;
          this.readChar();
          token = this.newToken(TokenType.DoubleColon, ch + this.ch, this.line, startCol);
        } else {
          token = this.newToken(TokenType.Colon, this.ch, this.line, startCol);
        }
        break;
      case "(":
        token = this.newToken(TokenType.LeftParen, this.ch, this.line, startCol);
        break;
      case ")":
        token = this.newToken(TokenType.RightParen, this.ch, this.line, startCol);
        break;
      case ",":
        token = this.newToken(TokenType.Comma, this.ch, this.line, startCol);
        break;
      case "{":
        token = this.newToken(TokenType.LeftBrace, this.ch, this.line, startCol);
        break;
      case "}":
        token = this.newToken(TokenType.RightBrace, this.ch, this.line, startCol);
        break;
      case "[":
        token = this.newToken(TokenType.LeftBracket, this.ch, this.line, startCol);
        break;
      case "]":
        token = this.newToken(TokenType.RightBracket, this.ch, this.line, startCol);
        break;
      case "&":
        if (this.peekChar() === "&") {
          const ch = this.ch;
          this.readChar();
          token = this.newToken(TokenType.And, ch + this.ch, this.line, startCol);
        } else {
          token = this.newToken(TokenType.Ampersand, this.ch, this.line, startCol);
        }
        break;
      case "|":
        if (this.peekChar() === "|") {
          const ch = this.ch;
          this.readChar();
          token = this.newToken(TokenType.Or, ch + this.ch, this.line, startCol);
        } else {
          token = this.newToken(TokenType.Pipe, this.ch, this.line, startCol);
        }
        break;
      case ".":
        if (this.peekChar() === ".") {
          const ch = this.ch;
          this.readChar();
          if (this.peekChar() === "=") {
            const ch2 = this.ch;
            this.readChar();
            token = this.newToken(TokenType.DotEqual, ch + ch2 + this.ch, this.line, startCol);
          } else {
            token = this.newToken(TokenType.DoubleDot, ch + this.ch, this.line, startCol);
          }
        } else {
          token = this.newToken(TokenType.Dot, this.ch, this.line, startCol);
        }
        break;
      default:
        if (this.isLetter(this.ch)) {
          const literal = this.readIdentifier();
          
          // DETEKSI ELSE IF
          if (literal === "else") {
              const savedState = this.saveState();
              this.skipWhitespace();
              if (this.isLetter(this.ch)) {
                  const nextLiteral = this.readIdentifier();
                  if (nextLiteral === "if") {
                      return this.newToken(TokenType.ElseIf, "else if", this.line, startCol);
                  }
              }
              this.restoreState(savedState);
              return this.newToken(TokenType.Else, "else", this.line, startCol);
          }

          const type = KEYWORDS[literal] || TokenType.Identifier;
          return this.newToken(type, literal, this.line, startCol);
        } else if (this.isDigit(this.ch)) {
          return this.readNumber();
        } else {
          token = this.newToken(TokenType.Illegal, this.ch, this.line, startCol);
        }
    }

    this.readChar();
    return token;
  }

  private saveState() {
      return {
          pos: this.position,
          readPos: this.readPosition,
          line: this.line,
          col: this.column,
          ch: this.ch
      };
  }

  private restoreState(s: any) {
      this.position = s.pos;
      this.readPosition = s.readPos;
      this.line = s.line;
      this.column = s.col;
      this.ch = s.ch;
  }

  private readChar() {
    if (this.readPosition >= this.input.length) {
      this.ch = null;
    } else {
      this.ch = this.input[this.readPosition];
    }
    if (this.ch === "\n") {
        this.line++;
        this.column = 0;
    } else {
        this.column++;
    }
    this.position = this.readPosition;
    this.readPosition++;
  }

  private peekChar(): string | null {
    if (this.readPosition >= this.input.length) return null;
    return this.input[this.readPosition];
  }

  private readIdentifier(): string {
    const position = this.position;
    while (this.ch !== null && (this.isLetter(this.ch) || this.isDigit(this.ch))) {
      this.readChar();
    }
    return this.input.slice(position, this.position);
  }

  private readNumber(): Token {
    const position = this.position;
    const startCol = this.column;
    while (this.ch !== null && (this.isDigit(this.ch) || this.ch === ".")) {
      if (this.ch === "." && this.peekChar() === ".") break;
      this.readChar();
    }
    const literal = this.input.slice(position, this.position);
    return this.newToken(TokenType.Number, literal, this.line, startCol);
  }

  private skipWhitespace() {
    while (this.ch === " " || this.ch === "\t" || this.ch === "\n" || this.ch === "\r") {
      this.readChar();
    }
  }

  private skipSingleLineComment() {
    while (this.ch !== "\n" && this.ch !== null) this.readChar();
    this.skipWhitespace();
  }

  private skipMultiLineComment() {
    this.readChar(); // *
    while (true) {
        if (this.ch === "*" && this.peekChar() === "/") {
            this.readChar(); this.readChar(); break;
        }
        if (this.ch === null) throw new Error("Unterminated comment");
        this.readChar();
    }
    this.skipWhitespace();
  }

  private newToken(type: TokenType, literal: string, line: number, column: number): Token {
    return { type, literal, line, column };
  }

  private isLetter(ch: string | null): boolean {
    if (!ch) return false;
    return ("a" <= ch && ch <= "z") || ("A" <= ch && ch <= "Z") || ch === "_";
  }

  private isDigit(ch: string | null): boolean {
    if (!ch) return false;
    return "0" <= ch && ch <= "9";
  }
}