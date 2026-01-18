state_machine Connection {
    state Closed {
        fn connect() -> Connecting {
            let attempt = 1;
        }
    }
}
