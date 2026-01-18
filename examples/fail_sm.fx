state_machine Connection {
    state Closed {
        fn connect(addr: String) -> Connecting {
            let x = 10;
        }
    }
}
