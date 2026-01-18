fn main() {
    let mut x = 10;
    {
        shadow y = x;
        let z = y + 5;
    }
    // y should be exhausted here
    // x should still be alive because shadowing is a reference? 
    // In Fax-lang Rule 1: "Modify through shadow creates mirror of changed pages only".
    // This implies shadowing is a view.
    let a = x; 
}
