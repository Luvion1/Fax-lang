state_machine Connection {
    state Closed {
        fn connect() -> Connecting {
            let x = 1;
        }
    }
    state Connecting {
        fn established() -> Connected {
            let x = 2;
        }
    }
    state Connected {
        fn disconnect() -> Closed {
            let x = 3;
        }
    }
    any {
        fn reset() -> Closed {
            let x = 0;
        }
    }
}
