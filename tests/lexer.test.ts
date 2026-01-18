import { describe, it, expect } from "vitest";
import { Lexer } from "../src/modules/lexer/index.js";
import { TokenType } from "../src/modules/lexer/types.js";

describe("Fax-lang Lexer", () => {
  it("should tokenize basic variables and numbers", () => {
    const input = `let x = 5; let y = 10.5;`;
    const lexer = new Lexer(input);

    const expectedTokens = [
      { type: TokenType.Let, literal: "let" },
      { type: TokenType.Identifier, literal: "x" },
      { type: TokenType.Equal, literal: "=" },
      { type: TokenType.Number, literal: "5" },
      { type: TokenType.Semicolon, literal: ";" },
      { type: TokenType.Let, literal: "let" },
      { type: TokenType.Identifier, literal: "y" },
      { type: TokenType.Equal, literal: "=" },
      { type: TokenType.Number, literal: "10.5" },
      { type: TokenType.Semicolon, literal: ";" },
      { type: TokenType.EOF, literal: "" },
    ];

    for (const expected of expectedTokens) {
      const token = lexer.nextToken();
      expect(token.type).toBe(expected.type);
      expect(token.literal).toBe(expected.literal);
    }
  });

  it("should tokenize state machine syntax", () => {
    const input = `
      state_machine Connection {
        state Closed { }
        any { }
      }
    `;
    const lexer = new Lexer(input);

    const expectedTokens = [
      { type: TokenType.StateMachine, literal: "state_machine" },
      { type: TokenType.Identifier, literal: "Connection" },
      { type: TokenType.LeftBrace, literal: "{" },
      { type: TokenType.State, literal: "state" },
      { type: TokenType.Identifier, literal: "Closed" },
      { type: TokenType.LeftBrace, literal: "{" },
      { type: TokenType.RightBrace, literal: "}" },
      { type: TokenType.Any, literal: "any" },
      { type: TokenType.LeftBrace, literal: "{" },
      { type: TokenType.RightBrace, literal: "}" },
      { type: TokenType.RightBrace, literal: "}" },
      { type: TokenType.EOF, literal: "" },
    ];

    for (const expected of expectedTokens) {
      const token = lexer.nextToken();
      expect(token.type).toBe(expected.type);
      expect(token.literal).toBe(expected.literal);
    }
  });

  it("should tokenize operators and ranges correctly", () => {
    const input = `match 1..=10 => true`;
    const lexer = new Lexer(input);

    const expectedTokens = [
      { type: TokenType.Match, literal: "match" },
      { type: TokenType.Number, literal: "1" },
      { type: TokenType.DotEqual, literal: "..=" },
      { type: TokenType.Number, literal: "10" },
      { type: TokenType.FatArrow, literal: "=>" },
      { type: TokenType.Identifier, literal: "true" }, // boolean literals are identifiers initially
    ];

    for (const expected of expectedTokens) {
      const token = lexer.nextToken();
      expect(token.type).toBe(expected.type);
      expect(token.literal).toBe(expected.literal);
    }
  });

  it("should ignore comments", () => {
    const input = `
      // Single line
      let x = 1; /* Multi
      line */
    `;
    const lexer = new Lexer(input);

    const expectedTokens = [
        { type: TokenType.Let, literal: "let" },
        { type: TokenType.Identifier, literal: "x" },
        { type: TokenType.Equal, literal: "=" },
        { type: TokenType.Number, literal: "1" },
        { type: TokenType.Semicolon, literal: ";" },
    ];

    for (const expected of expectedTokens) {
        const token = lexer.nextToken();
        expect(token.type).toBe(expected.type);
        expect(token.literal).toBe(expected.literal);
      }
  });
});
