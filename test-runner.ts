import { Lexer } from "./src/modules/lexer/index.ts";
import { Parser } from "./src/modules/parser/index.ts";
import { NodeType } from "./src/modules/parser/ast/nodes.ts";

function runTests() {
  console.log("Running FAX-LANG System Tests...\n");
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, msg: string) {
    if (condition) {
      console.log(`✅ PASS: ${msg}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${msg}`);
      failed++;
    }
  }

  // TEST 1: Lexer Basic
  try {
    const l = new Lexer(`let x = 5;`);
    const t = l.nextToken();
    assert(t.literal === "let", "Lexer basic");
  } catch (e) { failed++; console.error(e); }

  // TEST 2: Parser - Let Statement
  try {
    const input = `let x = 5; let y = 10;`;
    const l = new Lexer(input);
    const p = new Parser(l);
    const program = p.parseProgram();

    assert(program.statements.length === 2, "Parser should find 2 statements");
    
    const stmt1 = program.statements[0];
    assert(stmt1.type === NodeType.LetStatement, "Statement 1 is LetStatement");
    assert(stmt1.name.value === "x", "Ident is x");
    assert(stmt1.value.value === 5, "Value is 5");
  } catch (e) { failed++; console.error(e); }

  // TEST 3: Parser - State Machine
  try {
    const input = `
      state_machine Connection {
          state Closed {
              fn connect() -> Connecting { }
          }
          state Connecting {}
      }
    `;
    const l = new Lexer(input);
    const p = new Parser(l);
    const program = p.parseProgram();
    
    // Debug output if needed
    // console.log(JSON.stringify(program, null, 2));

    const sm = program.statements[0];
    assert(sm.type === NodeType.StateMachine, "Parse StateMachine Node");
    assert(sm.name.value === "Connection", "StateMachine name is Connection");
    assert(sm.states.length === 2, "Found 2 states");
    
    const closedState = sm.states[0];
    assert(closedState.name.value === "Closed", "First state is Closed");
    assert(closedState.transitions.length === 1, "Closed has 1 transition");
    assert(closedState.transitions[0].target === "Connecting", "Transition target is Connecting");

  } catch (e) { failed++; console.error(e); }

  console.log(`\nResults: ${passed} Passed, ${failed} Failed.`);
  if (failed > 0) process.exit(1);
}

runTests();