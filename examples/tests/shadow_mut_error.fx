fn main() {
    let mut x = 10;
    shadow y = x;
    y = 20; // Should fail
}
