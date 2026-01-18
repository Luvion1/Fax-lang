state_machine Conn {
    state Closed {}
    state Opened {}
}
const BASE = 10;
let status = 1;
let res = if status == 0 {
    BASE
} else if status == 1 {
    BASE * 2
} else {
    BASE * 3
};
return res;