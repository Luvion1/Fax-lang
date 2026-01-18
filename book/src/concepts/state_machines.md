# State Machines (Contractual States)

Fax-lang treats state machines as first-class citizens (Rule 4).

## Definition

A state machine is defined using the `state_machine` keyword. Unlike simple enums, Fax-lang state machines enforce **valid transitions** at compile-time.

```fax
state_machine Connection {
    state Closed {
        fn connect() -> Connecting {
            // transition logic
        }
    }
    
    state Connecting {
        fn established() -> Connected { ... }
        fn timeout() -> Closed { ... }
    }
    
    state Connected {
        fn disconnect() -> Closed { ... }
    }
}
```

## The `any` Block

The `any` block allows you to define transitions that are valid from **any** state. This is useful for error handling or global resets.

```fax
any {
    fn emergency_shutdown() -> Closed {
        // cleanup
    }
}
```

## Compile-time Safety

The Fax-lang compiler ensures that you cannot call a transition function if the machine is not in the correct state.

```fax
let conn = Connection::Closed::new();
conn.established(); // ERROR: 'established' is only valid in 'Connecting' state.
```

This prevents a whole class of bugs related to illegal state transitions in systems programming.
