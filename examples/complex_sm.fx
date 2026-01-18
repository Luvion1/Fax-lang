state_machine Connection {
    state Closed {
        fn connect(addr) -> Connecting {
            let x = 10;
        }
    }
}
