---
layout: none
---
{% raw %}
{% raw %}
📘 FAX LANGUAGE SYNTAX REFERENCE

📌 1. BASIC SYNTAX

Entry Point

```fax
fn main() {
    // Program starts here
}
```

Comments

```fax
// Single line comment

/* Multi-line
   comment */
```

Line Continuation

```fax
// Backslash for line continuation
let long_string = "This is a very long \
                   string that continues \
                   on multiple lines"

// Parentheses/brackets auto-continue
let array = [
    1, 2, 3,
    4, 5, 6
]
```

---

📌 2. VARIABLES & CONSTANTS

```fax
// Immutable (default)
let x = 10
let name = "Fax"

// Mutable
let mut counter = 0
counter += 1

// Constants (compile-time)
const MAX_SIZE: usize = 1024
const PI: f64 = 3.141592653589793

// Compile-time computed constants
const SQUARE_SIZE: usize = BLOCK_SIZE * BLOCK_SIZE

// Static variables (global, 'static lifetime)
static mut GLOBAL_COUNTER: i32 = 0
static VERSION: &str = "1.0.0"

// Deferred initialization
let message: String
if condition {
    message = "Yes"
} else {
    message = "No"
}
```

---

📌 3. DATA TYPES

Primitive Types

```fax
// Signed integers
let a: i8 = 127
let b: i16 = 32767
let c: i32 = 2_147_483_647
let d: i64 = 9_223_372_036_854_775_807
let e: i128 = 170_141_183_460_469_231_731_687_303_715_884_105_727
let f: isize = 9223372036854775807  // platform-dependent

// Unsigned integers
let g: u8 = 255
let h: u16 = 65535
let i: u32 = 4_294_967_295
let j: u64 = 18_446_744_073_709_551_615
let k: u128 = 340_282_366_920_938_463_463_374_607_431_768_211_455
let l: usize = 18446744073709551615  // platform-dependent

// Floating point
let m: f32 = 3.1415927
let n: f64 = 3.141592653589793

// Numeric literals
let binary = 0b1111_0000
let octal = 0o77
let hex = 0xff
let byte = b'A'  // u8: 65

// Boolean
let active: bool = true
let done = false

// Character (Unicode scalar value)
let ch: char = 'A'
let emoji: char = '🚀'
let unicode: char = '\u{1F680}'

// String slices (&str)
let text: &str = "Hello"
let multi = r#"Raw string with "quotes""#

// Byte strings
let bytes: &[u8] = b"ASCII bytes"
let raw_bytes = br#"raw bytes"#

// Never type (!) - diverging functions
fn panic() -> ! {
    std::process::exit(1)
}
```

Type Aliases

```fax
type UserId = u64
type Result<T> = std::result::Result<T, Error>
type Callback = fn(i32) -> i32
type Matrix = [[f64; 3]; 3]
```

Newtype Pattern

```fax
struct Email(String)
struct PhoneNumber(String)
struct Inches(i32)
struct Pounds(i32)

impl Email {
    fn new(s: String) -> Result<Self, &'static str> {
        if s.contains('@') {
            Ok(Email(s))
        } else {
            Err("Invalid email")
        }
    }
}
```

---

📌 4. FUNCTIONS

```fax
// Basic function
fn add(x: i32, y: i32) -> i32 {
    x + y  // implicit return
}

// Explicit return
fn multiply(x: i32, y: i32) -> i32 {
    return x * y;
}

// Unit return (default)
fn print_hello() {
    println!("Hello")
}

// Multiple parameters
fn calculate(x: i32, y: i32, z: i32) -> i32 {
    x + y * z
}

// Default parameters (using struct)
fn draw_circle(radius: f64, color: Option<Color>) {
    let color = color.unwrap_or(Color::Black)
    // ...
}

// Variadic functions (using slices)
fn sum(numbers: &[i32]) -> i32 {
    numbers.iter().sum()
}

// Higher-order functions
fn apply<F>(f: F, x: i32) -> i32 
where F: Fn(i32) -> i32 
{
    f(x)
}

// Closure parameters
fn process<F>(callback: F) 
where F: FnOnce() -> () 
{
    callback()
}

// Function pointers
fn operation(x: i32) -> i32 { x * 2 }
let func: fn(i32) -> i32 = operation;

// Const functions (compile-time evaluation)
const fn square(x: i32) -> i32 {
    x * x
}
const SQUARE_OF_FIVE: i32 = square(5)

// Async functions
async fn fetch_data(url: &str) -> Result<String, Error> {
    reqwest::get(url).await?.text().await
}

// Generator functions (using yield)
gen fn counter() -> i32 {
    let mut i = 0;
    loop {
        yield i;
        i += 1;
    }
}
```

---

📌 5. CONTROL FLOW

If Expressions

```fax
// Basic if
if x > 10 {
    println!("Large")
}

// If-else
if temperature > 30 {
    println!("Hot")
} else if temperature < 10 {
    println!("Cold")
} else {
    println!("Moderate")
}

// If as expression
let category = if age < 13 {
    "Child"
} else if age < 20 {
    "Teenager"
} else {
    "Adult"
}

// If-let pattern
if let Some(value) = option {
    println!("Got: {}", value)
}

// Guard clauses with pattern matching
if let Ok(result) = computation() && result > 0 {
    println!("Positive result: {}", result)
}
```

Match Expressions

```fax
// Basic match
match value {
    1 => println!("One"),
    2 => println!("Two"),
    _ => println!("Other")
}

// Match with ranges
match score {
    90..=100 => "A",
    80..=89 => "B",
    70..=79 => "C",
    60..=69 => "D",
    0..=59 => "F",
    _ => "Invalid"
}

// Match multiple patterns
match digit {
    0 | 2 | 4 | 6 | 8 => "Even",
    1 | 3 | 5 | 7 | 9 => "Odd",
    _ => "Not a digit"
}

// Match with bindings
match point {
    Point { x: 0, y } => format!("On y-axis at {}", y),
    Point { x, y: 0 } => format!("On x-axis at {}", x),
    Point { x, y } => format!("At ({}, {})", x, y)
}

// Match guards
match number {
    n if n < 0 => "Negative",
    n if n == 0 => "Zero",
    n if n > 0 => "Positive",
    _ => unreachable!()
}

// Match with @ bindings
match input {
    value @ 1..=10 => println!("Small: {}", value),
    value @ 11..=100 => println!("Medium: {}", value),
    value => println!("Large: {}", value)
}
```

Loops

```fax
// Infinite loop
loop {
    if should_exit { break }
    println!("Looping")
}

// Loop with value
let result = loop {
    counter += 1;
    if counter >= 10 {
        break counter * 2
    }
};

// While loop
while index < array.len() {
    println!("{}", array[index])
    index += 1
}

// While-let pattern
while let Some(item) = queue.pop() {
    process(item)
}

// For loop
for element in collection {
    println!("{}", element)
}

// For loop with range
for i in 0..10 {
    println!("{}", i)
}

for i in (0..10).rev() {
    println!("{}", i)  // 9, 8, ..., 0
}

// For loop with index
for (index, value) in array.iter().enumerate() {
    println!("{}: {}", index, value)
}

// For loop over HashMap
for (key, value) in &map {
    println!("{}: {}", key, value)
}

// Labeled loops
'outer: for x in 0..10 {
    'inner: for y in 0..10 {
        if x * y == 42 {
            break 'outer
        }
        if y == 5 {
            continue 'inner
        }
    }
}

// Loop control in nested loops
for x in 0..10 {
    for y in 0..10 {
        if x + y == 15 {
            break // breaks inner loop only
        }
    }
}
```

---

📌 6. STRUCTURES

Struct Definition

```fax
// Basic struct
struct Point {
    x: f64,
    y: f64
}

// Tuple struct
struct Color(u8, u8, u8)

// Unit struct
struct Marker;

// Struct with lifetime parameters
struct Text<'a> {
    content: &'a str
}

// Generic struct
struct Container<T> {
    value: T
}

// Const generic struct
struct Array<T, const N: usize> {
    data: [T; N]
}

// #[repr] for C compatibility
#[repr(C)]
struct CPoint {
    x: i32,
    y: i32
}

// Packed struct
#[repr(packed)]
struct PackedData {
    a: u8,
    b: u32
}
```

Struct Instantiation

```fax
// Regular struct
let point = Point { x: 10.0, y: 20.0 }

// Update syntax
let point2 = Point { x: 5.0, ..point }

// Tuple struct
let red = Color(255, 0, 0)

// Unit struct
let marker = Marker

// Field init shorthand
struct User {
    name: String,
    age: u32
}

let name = "Alice".to_string();
let age = 30;
let user = User { name, age }  // field names match variable names
```

Struct Methods

```fax
impl Point {
    // Associated function (constructor)
    fn new(x: f64, y: f64) -> Self {
        Point { x, y }
    }
    
    // Instance method (immutable self)
    fn distance(&self, other: &Point) -> f64 {
        ((self.x - other.x).powi(2) + (self.y - other.y).powi(2)).sqrt()
    }
    
    // Instance method (mutable self)
    fn translate(&mut self, dx: f64, dy: f64) {
        self.x += dx;
        self.y += dy;
    }
    
    // Consuming method (takes ownership)
    fn consume(self) -> f64 {
        self.x + self.y
    }
}

// Multiple impl blocks
impl Point {
    fn origin() -> Self {
        Point { x: 0.0, y: 0.0 }
    }
}

// Generic implementation
impl<T> Container<T> {
    fn new(value: T) -> Self {
        Container { value }
    }
    
    fn get(&self) -> &T {
        &self.value
    }
    
    fn set(&mut self, value: T) {
        self.value = value
    }
}

// Implementation for specific type
impl Container<String> {
    fn len(&self) -> usize {
        self.value.len()
    }
}
```

---

📌 7. ENUMERATIONS

```fax
// Basic enum
enum Direction {
    North,
    South,
    East,
    West
}

// Enum with data (ADT)
enum WebEvent {
    PageLoad,
    PageUnload,
    KeyPress(char),
    Paste(String),
    Click { x: i64, y: i64 }
}

// Generic enum
enum Result<T, E> {
    Ok(T),
    Err(E)
}

enum Option<T> {
    Some(T),
    None
}

// Recursive enum
enum List<T> {
    Cons(T, Box<List<T>>),
    Nil
}

// #[repr] for enums
#[repr(u8)]
enum Status {
    Ok = 0,
    Error = 1,
    Loading = 2
}
```

Enum Methods

```fax
impl<T> Option<T> {
    fn unwrap(self) -> T {
        match self {
            Some(val) => val,
            None => panic!("Called unwrap on None")
        }
    }
    
    fn unwrap_or(self, default: T) -> T {
        match self {
            Some(val) => val,
            None => default
        }
    }
    
    fn map<U, F>(self, f: F) -> Option<U>
    where F: FnOnce(T) -> U 
    {
        match self {
            Some(x) => Some(f(x)),
            None => None
        }
    }
    
    fn and_then<U, F>(self, f: F) -> Option<U>
    where F: FnOnce(T) -> Option<U>
    {
        match self {
            Some(x) => f(x),
            None => None
        }
    }
}

impl<T, E> Result<T, E> {
    fn is_ok(&self) -> bool {
        match self {
            Ok(_) => true,
            Err(_) => false
        }
    }
    
    fn map<U, F>(self, f: F) -> Result<U, E>
    where F: FnOnce(T) -> U
    {
        match self {
            Ok(t) => Ok(f(t)),
            Err(e) => Err(e)
        }
    }
}
```

Pattern Matching with Enums

```fax
match event {
    WebEvent::PageLoad => println!("page loaded"),
    WebEvent::PageUnload => println!("page unloaded"),
    WebEvent::KeyPress(c) => println!("pressed '{}'", c),
    WebEvent::Paste(s) => println!("pasted \"{}\"", s),
    WebEvent::Click { x, y } => println!("clicked at ({}, {})", x, y)
}

// If-let with enums
if let WebEvent::KeyPress(key) = event {
    println!("Key pressed: {}", key)
}

// While-let with enums
while let Some(item) = stack.pop() {
    process(item)
}
```

---

📌 8. STATE MACHINES (Contractual States)

```fax
// State machine definition with compile-time state tracking
state_machine Connection {
    // Internal data
    data {
        socket: TcpStream,
        buffer: Vec<u8>,
        address: SocketAddr
    }
    
    // State definitions with transitions
    state Closed {
        // Transition: Closed -> Connecting
        fn connect(self, addr: SocketAddr) -> Connecting {
            println!("Connecting to {}", addr);
            Connecting {
                socket: TcpStream::new(),
                buffer: Vec::new(),
                address: addr
            }
        }
    }
    
    state Connecting {
        // Transition: Connecting -> Connected
        fn established(self) -> Connected {
            println!("Connection established");
            Connected {
                socket: self.socket,
                buffer: self.buffer,
                address: self.address
            }
        }
        
        // Transition: Connecting -> Closed
        fn timeout(self) -> Closed {
            println!("Connection timeout");
            Closed {
                socket: TcpStream::new(),
                buffer: Vec::new(),
                address: self.address
            }
        }
    }
    
    state Connected {
        // Transition: Connected -> Reading
        fn start_reading(self) -> Reading {
            println!("Starting read operation");
            Reading {
                socket: self.socket,
                buffer: self.buffer,
                address: self.address
            }
        }
        
        // Transition: Connected -> Writing
        fn start_writing(self, data: &[u8]) -> Writing {
            println!("Starting write operation");
            Writing {
                socket: self.socket,
                buffer: data.to_vec(),
                address: self.address,
                bytes_written: 0
            }
        }
        
        // Transition: Connected -> Closed
        fn close(self) -> Closed {
            println!("Closing connection");
            Closed {
                socket: TcpStream::new(),
                buffer: Vec::new(),
                address: self.address
            }
        }
    }
    
    state Reading {
        // Method available only in Reading state
        fn read_chunk(&mut self, size: usize) -> Result<usize, IoError> {
            let mut chunk = vec![0; size];
            let bytes_read = self.socket.read(&mut chunk)?;
            self.buffer.extend_from_slice(&chunk[..bytes_read]);
            Ok(bytes_read)
        }
        
        // Transition: Reading -> Connected
        fn finish_reading(self) -> Connected {
            println!("Finished reading");
            Connected {
                socket: self.socket,
                buffer: self.buffer,
                address: self.address
            }
        }
    }
    
    state Writing {
        // Method available only in Writing state
        fn write_chunk(&mut self) -> Result<usize, IoError> {
            let bytes_written = self.socket.write(&self.buffer)?;
            self.bytes_written += bytes_written;
            Ok(bytes_written)
        }
        
        // Transition: Writing -> Connected
        fn finish_writing(self) -> Connected {
            println!("Finished writing {} bytes", self.bytes_written);
            Connected {
                socket: self.socket,
                buffer: Vec::new(),
                address: self.address
            }
        }
    }
    
    // Global error transition (from any state)
    any {
        fn error(self, err: &str) -> Closed {
            println!("Error in state {:?}: {}", self.current_state(), err);
            Closed {
                socket: TcpStream::new(),
                buffer: Vec::new(),
                address: self.address
            }
        }
    }
}

// Using the state machine
fn main() {
    // Starts in Closed state
    let conn = Connection::Closed::new();
    
    // Legal transitions (compile-time checked)
    let conn = conn.connect("127.0.0.1:8080".parse().unwrap());
    let conn = conn.established();
    let conn = conn.start_writing(b"Hello, world!");
    
    // Illegal transition (compile error)
    // conn.read_chunk(1024); // Error: not in Reading state
    
    let conn = conn.finish_writing();
    let conn = conn.close();
}
```

---

📌 9. TRAITS (Interfaces)

```fax
// Basic trait definition
trait Drawable {
    fn draw(&self);
    
    // Default implementation
    fn bounding_box(&self) -> Rectangle {
        Rectangle::default()
    }
}

// Trait with associated types
trait Iterator {
    type Item;
    
    fn next(&mut self) -> Option<Self::Item>;
    
    // Provided methods
    fn size_hint(&self) -> (usize, Option<usize>) {
        (0, None)
    }
}

// Trait with generic parameters
trait Converter<T> {
    fn convert(&self) -> T;
}

// Trait with const generic
trait ArrayLike<T, const N: usize> {
    fn get(&self, index: usize) -> Option<&T>;
    fn len(&self) -> usize { N }
}

// Supertrait (inheritance)
trait Clickable: Drawable {
    fn click(&mut self);
    fn is_clicked(&self) -> bool;
}

// Marker trait (no methods)
trait Send {}
trait Sync {}

// Auto trait (compiler-generated)
unsafe auto trait Send {}
auto trait Sync {}
```

Trait Implementation

```fax
struct Circle {
    radius: f64,
    center: Point
}

impl Drawable for Circle {
    fn draw(&self) {
        println!("Drawing circle with radius {}", self.radius);
    }
    
    // Override default implementation
    fn bounding_box(&self) -> Rectangle {
        Rectangle {
            x: self.center.x - self.radius,
            y: self.center.y - self.radius,
            width: self.radius * 2.0,
            height: self.radius * 2.0
        }
    }
}

impl Iterator for Counter {
    type Item = u32;
    
    fn next(&mut self) -> Option<Self::Item> {
        // ...
    }
}

// Blanket implementation
impl<T> ToString for T 
where T: Display 
{
    fn to_string(&self) -> String {
        format!("{}", self)
    }
}

// Multiple trait implementation
impl Drawable for Button {}
impl Clickable for Button {
    fn click(&mut self) { /* ... */ }
    fn is_clicked(&self) -> bool { /* ... */ }
}
```

Trait Objects (Dynamic Dispatch)

```fax
// Using dyn keyword
let drawables: Vec<Box<dyn Drawable>> = vec![
    Box::new(Circle::new(10.0)),
    Box::new(Rectangle::new(20.0, 30.0)),
    Box::new(Triangle::new(10.0, 20.0, 15.0))
];

for drawable in &drawables {
    drawable.draw();
}

// Trait object with associated types
let iterators: Vec<Box<dyn Iterator<Item = i32>>> = vec![
    Box::new(vec![1, 2, 3].into_iter()),
    Box::new((0..10).into_iter())
];

// Object-safe traits only
trait ObjectSafe {
    fn method(&self);
    // Cannot have:
    // - Generic methods
    // - Self in return position (except Self: Sized)
    // - Associated constants without default
}
```

---

📌 10. GENERICS

```fax
// Generic struct
struct Pair<T, U> {
    first: T,
    second: U
}

// Generic enum
enum Result<T, E> {
    Ok(T),
    Err(E)
}

// Generic function
fn identity<T>(x: T) -> T {
    x
}

// Generic method
impl<T, U> Pair<T, U> {
    fn new(first: T, second: U) -> Self {
        Pair { first, second }
    }
    
    fn swap(self) -> Pair<U, T> {
        Pair {
            first: self.second,
            second: self.first
        }
    }
}

// Const generics
struct Buffer<T, const SIZE: usize> {
    data: [T; SIZE]
}

impl<T, const SIZE: usize> Buffer<T, SIZE> {
    fn new() -> Self where T: Default + Copy {
        Buffer { data: [T::default(); SIZE] }
    }
    
    fn len(&self) -> usize {
        SIZE
    }
}

// Generic traits
trait Container<T> {
    fn contains(&self, item: &T) -> bool;
    fn add(&mut self, item: T);
}

// Where clauses for complex bounds
fn process<T, U>(item: T, transform: U) -> T::Output
where
    T: Processable,
    U: Fn(T) -> T::Output,
    T::Output: Debug + Clone
{
    // ...
}

// Generic associated types (GATs)
trait StreamingIterator {
    type Item<'a> where Self: 'a;
    
    fn next<'a>(&'a mut self) -> Option<Self::Item<'a>>;
}

// Default generic parameters
struct Matrix<T = f64> {
    data: Vec<Vec<T>>
}

impl<T> Matrix<T> {
    fn new() -> Matrix<T> where T: Default {
        Matrix { data: Vec::new() }
    }
}
```

---

📌 11. LIFETIMES

```fax
// Explicit lifetime annotation
struct Book<'a> {
    title: &'a str,
    author: &'a str
}

// Multiple lifetimes
struct TwoStrings<'a, 'b> {
    first: &'a str,
    second: &'b str
}

// Lifetime in functions
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}

// Lifetime elision rules (compiler infers)
fn first_word(s: &str) -> &str {  // Elided: fn first_word<'a>(s: &'a str) -> &'a str
    let bytes = s.as_bytes();
    for (i, &item) in bytes.iter().enumerate() {
        if item == b' ' {
            return &s[0..i];
        }
    }
    &s[..]
}

// 'static lifetime
let static_string: &'static str = "I live forever";
const MAX_VALUE: i32 = 100;  // Implicit 'static

// Lifetime bounds
struct Ref<'a, T: 'a> {
    reference: &'a T
}

// Higher-ranked trait bounds (HRTB)
fn call_on_ref_zero<F>(f: F) where
    F: for<'a> Fn(&'a i32)
{
    let zero = 0;
    f(&zero);
}

// Lifetime in trait bounds
trait Process<'a> {
    type Output;
    fn process(&'a self) -> Self::Output;
}
```

---

📌 12. COLLECTIONS

Arrays

```fax
// Fixed-size array
let array: [i32; 5] = [1, 2, 3, 4, 5];
let zeros = [0; 10];  // [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

// Array methods
let len = array.len();
let first = array[0];
let slice = &array[1..4];  // [2, 3, 4]

// Multi-dimensional array
let matrix: [[i32; 3]; 3] = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
];

// Array iteration
for element in &array {
    println!("{}", element);
}

for (i, element) in array.iter().enumerate() {
    println!("{}: {}", i, element);
}
```

Vectors (Dynamic Arrays)

```fax
// Creation
let mut vec = Vec::new();
vec.push(1);
vec.push(2);
vec.push(3);

let vec2 = vec![1, 2, 3, 4, 5];
let vec3 = Vec::with_capacity(10);

// Access
let first = vec[0];  // Panics if out of bounds
let first = vec.get(0);  // Returns Option<&T>

// Methods
vec.insert(1, 99);  // Insert at index
let removed = vec.remove(1);  // Remove at index
let last = vec.pop();  // Remove last

vec.extend([6, 7, 8].iter().copied());
vec.append(&mut vec2);  // Move elements

vec.retain(|&x| x > 2);  // Keep elements satisfying predicate
vec.dedup();  // Remove consecutive duplicates

// Sorting
vec.sort();  // Ascending
vec.sort_by(|a, b| b.cmp(a));  // Descending
vec.sort_by_key(|x| x.abs());  // By key

// Slicing
let slice: &[i32] = &vec[1..4];

// Capacity management
vec.shrink_to_fit();  // Reduce capacity to size
vec.reserve(100);  // Reserve capacity
vec.reserve_exact(50);  // Reserve exact capacity
```

HashMaps

```fax
use std::collections::HashMap;

let mut scores = HashMap::new();

// Insertion
scores.insert("Alice", 100);
scores.insert("Bob", 85);

// Access
let alice_score = scores.get("Alice");
let bob_score = scores["Bob"];  // Panics if not present

// Update
scores.insert("Alice", 95);  // Overwrite
scores.entry("Charlie").or_insert(70);  // Insert if not exists

// Iteration
for (name, score) in &scores {
    println!("{}: {}", name, score);
}

// Methods
scores.remove("Bob");
scores.clear();
let contains = scores.contains_key("Alice");

// HashMap with custom key
#[derive(Hash, Eq, PartialEq)]
struct CustomKey {
    id: u32,
    name: String
}

let mut map = HashMap::new();
map.insert(CustomKey { id: 1, name: "A".to_string() }, "Value");
```

HashSets

```fax
use std::collections::HashSet;

let mut set = HashSet::new();

set.insert(1);
set.insert(2);
set.insert(3);
set.insert(2);  // Duplicate, ignored

// Check membership
let contains = set.contains(&2);

// Set operations
let set_a: HashSet<_> = [1, 2, 3].iter().copied().collect();
let set_b: HashSet<_> = [3, 4, 5].iter().copied().collect();

let union: HashSet<_> = set_a.union(&set_b).copied().collect();
let intersection: HashSet<_> = set_a.intersection(&set_b).copied().collect();
let difference: HashSet<_> = set_a.difference(&set_b).copied().collect();
let symmetric_difference: HashSet<_> = set_a.symmetric_difference(&set_b).copied().collect();

// Subset checks
let is_subset = set_a.is_subset(&set_b);
let is_disjoint = set_a.is_disjoint(&set_b);
```

BinaryHeaps (Priority Queues)

```fax
use std::collections::BinaryHeap;

let mut heap = BinaryHeap::new();

heap.push(5);
heap.push(1);
heap.push(10);
heap.push(3);

while let Some(max) = heap.pop() {
    println!("{}", max);  // 10, 5, 3, 1
}

// Min-heap using Reverse
use std::cmp::Reverse;
let mut min_heap = BinaryHeap::new();
min_heap.push(Reverse(5));
min_heap.push(Reverse(1));
min_heap.push(Reverse(10));

while let Some(Reverse(min)) = min_heap.pop() {
    println!("{}", min);  // 1, 5, 10
}
```

VecDeque (Double-ended Queue)

```fax
use std::collections::VecDeque;

let mut deque = VecDeque::new();

deque.push_back(1);  // Add to back
deque.push_front(2); // Add to front
deque.push_back(3);

let front = deque.pop_front();  // Remove from front: Some(2)
let back = deque.pop_back();    // Remove from back: Some(3)

// Access both ends
let first = deque.front();      // Peek front
let last = deque.back();        // Peek back

// Rotate
deque.rotate_left(1);   // Move first element to back
deque.rotate_right(1);  // Move last element to front
```

BTreeMap and BTreeSet (Sorted Collections)

```fax
use std::collections::{BTreeMap, BTreeSet};

// BTreeMap (sorted by keys)
let mut map = BTreeMap::new();
map.insert(3, "c");
map.insert(1, "a");
map.insert(2, "b");

for (key, value) in &map {
    println!("{}: {}", key, value);  // 1: a, 2: b, 3: c
}

// Range queries
let range = map.range(2..=3);  // Keys from 2 to 3 inclusive

// BTreeSet (sorted set)
let mut set = BTreeSet::new();
set.insert(3);
set.insert(1);
set.insert(2);

for value in &set {
    println!("{}", value);  // 1, 2, 3
}
```

---

📌 13. ERROR HANDLING

Result Type

```fax
enum Result<T, E> {
    Ok(T),
    Err(E)
}

// Creating results
let ok: Result<i32, &str> = Ok(42);
let err: Result<i32, &str> = Err("Something went wrong");

// Pattern matching
match result {
    Ok(value) => println!("Got: {}", value),
    Err(error) => println!("Error: {}", error)
}

// Unwrap methods
let value = ok_result.unwrap();  // Panics on Err
let value = ok_result.unwrap_or(0);  // Default on Err
let value = ok_result.unwrap_or_else(|err| err.len() as i32);  // Compute default

// Propagating errors with ?
fn read_file() -> Result<String, io::Error> {
    let mut file = File::open("file.txt")?;
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;
    Ok(contents)
}

// Try blocks (alternative to ? for complex logic)
let result = try {
    let x = parse_input(input)?;
    let y = validate(x)?;
    process(y)?
};

// Converting between error types
fn string_to_int(s: &str) -> Result<i32, ParseIntError> {
    s.parse()
}

fn process_string(s: &str) -> Result<i32, Box<dyn Error>> {
    let n = string_to_int(s)?;  // Converts ParseIntError to Box<dyn Error>
    Ok(n * 2)
}

// Combining errors
fn read_config() -> Result<Config, Error> {
    let file1 = read_file("config1.toml");
    let file2 = read_file("config2.toml");
    
    // Return first error, or combine them
    match (file1, file2) {
        (Ok(c1), Ok(c2)) => Ok(Config::merge(c1, c2)),
        (Err(e), _) | (_, Err(e)) => Err(e)
    }
}
```

Option Type

```fax
enum Option<T> {
    Some(T),
    None
}

// Creating options
let some: Option<i32> = Some(42);
let none: Option<i32> = None;

// Pattern matching
match option {
    Some(value) => println!("Got: {}", value),
    None => println!("Got nothing")
}

// Common methods
let value = some_value.unwrap();  // Panics on None
let value = some_value.unwrap_or(0);
let value = some_value.unwrap_or_else(|| calculate_default());

// Chaining operations
let result = get_user()
    .map(|user| user.email)
    .filter(|email| email.contains('@'))
    .map(|email| email.to_uppercase());

// And/Or combinators
let a = Some(1);
let b = Some(2);
let c: Option<i32> = None;

a.and(b);  // Some(2)
a.or(c);   // Some(1)

// Transforming with map/and_then
let doubled = Some(21).map(|x| x * 2);  // Some(42)
let parsed = Some("42").and_then(|s| s.parse().ok());  // Some(42)

// Converting to Result
let result: Result<i32, &str> = Some(42).ok_or("Missing value");
let result: Result<i32, String> = Some(42).ok_or_else(|| "Missing".to_string());
```

Custom Error Types

```fax
// Define error type
#[derive(Debug)]
enum AppError {
    Io(io::Error),
    Parse(ParseIntError),
    Custom(String)
}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            AppError::Io(err) => write!(f, "IO error: {}", err),
            AppError::Parse(err) => write!(f, "Parse error: {}", err),
            AppError::Custom(msg) => write!(f, "Custom error: {}", msg)
        }
    }
}

impl Error for AppError {
    fn source(&self) -> Option<&(dyn Error + 'static)> {
        match self {
            AppError::Io(err) => Some(err),
            AppError::Parse(err) => Some(err),
            AppError::Custom(_) => None
        }
    }
}

// From trait for error conversion
impl From<io::Error> for AppError {
    fn from(err: io::Error) -> Self {
        AppError::Io(err)
    }
}

impl From<ParseIntError> for AppError {
    fn from(err: ParseIntError) -> Self {
        AppError::Parse(err)
    }
}

// Using the error type
fn process_file() -> Result<String, AppError> {
    let content = std::fs::read_to_string("file.txt")?;  // Converts io::Error to AppError
    let number: i32 = content.trim().parse()?;  // Converts ParseIntError to AppError
    Ok(number.to_string())
}
```

Panic Handling

```fax
// Panic macro
panic!("This is a panic!");
panic!("Value {} is invalid", value);

// Unreachable code
unreachable!("This code should never be reached");

// Assertions
assert!(value > 0, "Value must be positive");
assert_eq!(actual, expected, "Values don't match");
assert_ne!(a, b, "Values should be different");

// Debug assertions (only in debug builds)
debug_assert!(condition);
debug_assert_eq!(a, b);

// Catching panics (for FFI or recovery)
let result = std::panic::catch_unwind(|| {
    panic!("This panic will be caught");
});

match result {
    Ok(_) => println!("No panic"),
    Err(_) => println!("Panic was caught")
}

// Custom panic hook
std::panic::set_hook(Box::new(|panic_info| {
    println!("Custom panic handler: {:?}", panic_info);
}));
```

---

📌 14. MEMORY MANAGEMENT SYSTEM

Shadow & Mirroring System

```fax
// Rule 1: Shadow & Mirroring with Page-based Copy
struct BigData {
    // Large data structure
    pages: Vec<Page<4096>>,  // 4KB pages
    metadata: Metadata
}

impl BigData {
    // Create a shadow (read-only view)
    fn shadow(&self) -> Shadow<Self> {
        Shadow::new(self)
    }
    
    // Modify through shadow creates mirror of changed pages only
    fn modify_through_shadow(&mut self, shadow: Shadow<Self>) {
        // Only modified pages are copied (lazy copy-on-access)
        for page in shadow.modified_pages() {
            self.pages[page.index] = page.clone();
        }
    }
}

// Page-based access tracking
struct PageTracker<T> {
    data: T,
    accessed_pages: BitSet,
    modified_pages: BitSet
}

impl<T> PageTracker<T> {
    fn access_page(&mut self, page: usize) -> &Page {
        self.accessed_pages.insert(page);
        &self.data.pages[page]
    }
    
    fn modify_page(&mut self, page: usize) -> &mut Page {
        self.modified_pages.insert(page);
        &mut self.data.pages[page]
    }
}

// Automatic page merging
fn merge_pages(master: &mut BigData, mirror: Mirror<BigData>) {
    for (page_idx, page) in mirror.pages {
        if mirror.is_page_modified(page_idx) {
            // Only merge modified pages
            master.pages[page_idx] = page;
        }
    }
}
```

Life-Force Tracking

```fax
// Rule 2: Life-Force with probabilistic cleanup
struct LifeForce<T> {
    data: T,
    force: f32,  // 0.0 to 1.0
    usage_graph: UsageGraph,
    predicted_expiry: Option<Instant>
}

impl<T> LifeForce<T> {
    fn new(data: T) -> Self {
        LifeForce {
            data,
            force: 1.0,
            usage_graph: UsageGraph::new(),
            predicted_expiry: None
        }
    }
    
    fn decay(&mut self, rate: f32) {
        self.force *= 1.0 - rate;
        if self.force < 0.01 {  // Threshold
            self.schedule_cleanup();
        }
    }
    
    fn boost(&mut self, usage: UsagePattern) {
        // Extend life based on usage pattern
        match usage {
            UsagePattern::Frequent => self.force = 1.0,
            UsagePattern::Sporadic => self.force += 0.3,
            UsagePattern::Rare => {}  // No boost
        }
    }
    
    fn schedule_cleanup(&mut self) {
        // Schedule for deterministic cleanup
        self.predicted_expiry = Some(Instant::now() + Duration::from_secs(1));
    }
}

// Usage graph for tracking access patterns
struct UsageGraph {
    nodes: Vec<UsageNode>,
    edges: Vec<UsageEdge>,
    access_pattern: AccessPattern
}

enum AccessPattern {
    Sequential,
    Random,
    Strided(usize),
    Cluster(usize)  // Cluster size
}
```

Unified Memory Space

```fax
// Rule 3: Context-Agnostic Allocation
enum MemoryLocation {
    Stack,
    Heap,
    Hybrid { hot: StackPart, cold: HeapPart }
}

struct UnifiedAllocator {
    // Tracks data relationships for topology optimization
    access_graph: AccessGraph,
    placement_strategy: PlacementStrategy
}

impl UnifiedAllocator {
    fn allocate<T>(&mut self, value: T) -> Allocated<T> {
        // Analyze access patterns and relationships
        let strategy = self.analyze_placement::<T>();
        
        match strategy {
            Placement::Stack => {
                // Small, short-lived, frequently accessed
                Allocated::stack(value)
            }
            Placement::Heap => {
                // Large, long-lived, infrequently accessed
                Allocated::heap(value)
            }
            Placement::Hybrid { hot_size } => {
                // Split between stack and heap
                Allocated::hybrid(value, hot_size)
            }
            Placement::Custom(layout) => {
                // Custom memory layout for cache optimization
                Allocated::custom(value, layout)
            }
        }
    }
    
    fn analyze_placement<T>(&self) -> Placement {
        // Consider:
        // 1. Size of T
        // 2. Expected lifetime
        // 3. Access frequency
        // 4. Relationship with other data
        // 5. Cache line size (typically 64 bytes)
        
        if size_of::<T>() <= 64 && self.is_frequently_accessed::<T>() {
            Placement::Stack
        } else if size_of::<T>() > 1024 {
            Placement::Heap
        } else {
            // Analyze data relationships for cache locality
            let related_data = self.find_related_data::<T>();
            if !related_data.is_empty() {
                // Place near related data
                Placement::Custom(self.optimize_layout(related_data))
            } else {
                Placement::Heap
            }
        }
    }
}
```

State Machine Memory Management

```fax
// Rule 4: State-based cleanup
state_machine Resource {
    data {
        ptr: *mut u8,
        size: usize,
        state: ResourceState
    }
    
    state Uninitialized {
        fn allocate(self, size: usize) -> Allocated {
            let ptr = unsafe { libc::malloc(size) };
            Allocated {
                ptr,
                size,
                state: ResourceState::Allocated
            }
        }
    }
    
    state Allocated {
        fn use_resource(&mut self) -> Result<(), &'static str> {
            if self.state.can_use() {
                // Use the resource
                Ok(())
            } else {
                Err("Resource not in usable state")
            }
        }
        
        fn deallocate(self) -> Deallocated {
            unsafe { libc::free(self.ptr) };
            Deallocated {
                ptr: std::ptr::null_mut(),
                size: 0,
                state: ResourceState::Deallocated
            }
        }
    }
    
    state Deallocated {
        // Terminal state - automatic cleanup
        fn drop(self) {
            // Memory already freed
            // Any other cleanup
        }
    }
    
    any {
        fn emergency_cleanup(self) -> Deallocated {
            // Force cleanup from any state
            unsafe { libc::free(self.ptr) };
            Deallocated {
                ptr: std::ptr::null_mut(),
                size: 0,
                state: ResourceState::Deallocated
            }
        }
    }
}

// Compiler-enforced state transitions
impl Resource {
    // Compile-time check: can only call use_resource in Allocated state
    fn example_usage() {
        let resource = Resource::Uninitialized::new();
        let resource = resource.allocate(1024);  // Now in Allocated state
        resource.use_resource().unwrap();        // Valid
        // resource.deallocate();                // Would move to Deallocated
        // resource.use_resource();              // Compile error: wrong state
    }
}
```

Page-based Mirroring (Different from Cow)

```fax
// Page-based Differential Mirroring System
struct PageMirror<T> {
    master: Arc<T>,
    modified_pages: HashMap<usize, Page>,
    page_size: usize,
    access_tracker: AccessTracker
}

impl<T> PageMirror<T> {
    fn new(master: Arc<T>) -> Self {
        PageMirror {
            master,
            modified_pages: HashMap::new(),
            page_size: 4096,  // 4KB pages
            access_tracker: AccessTracker::new()
        }
    }
    
    // Read operation: track accessed pages
    fn read(&mut self, offset: usize, size: usize) -> &[u8] {
        let start_page = offset / self.page_size;
        let end_page = (offset + size - 1) / self.page_size;
        
        for page in start_page..=end_page {
            self.access_tracker.mark_accessed(page);
            
            if self.modified_pages.contains_key(&page) {
                // Read from modified page in mirror
                return &self.modified_pages[&page];
            }
        }
        
        // Read from master
        &self.master.as_slice()[offset..offset + size]
    }
    
    // Write operation: copy-on-first-write per page
    fn write(&mut self, offset: usize, data: &[u8]) {
        let page = offset / self.page_size;
        
        if !self.modified_pages.contains_key(&page) {
            // First write to this page - create copy
            let page_data = self.copy_page_from_master(page);
            self.modified_pages.insert(page, page_data);
        }
        
        // Write to the copied page
        let page_offset = offset % self.page_size;
        self.modified_pages.get_mut(&page).unwrap()
            [page_offset..page_offset + data.len()].copy_from_slice(data);
        
        self.access_tracker.mark_modified(page);
    }
    
    // Merge only modified pages back to master
    fn merge_to_master(self, master: &mut T) -> usize {
        let mut pages_merged = 0;
        
        for (page_idx, page_data) in self.modified_pages {
            if self.access_tracker.was_modified(page_idx) {
                // Copy modified page back to master
                master.copy_page(page_idx, &page_data);
                pages_merged += 1;
            }
        }
        
        pages_merged
    }
    
    // Lazy page copying
    fn copy_page_from_master(&self, page: usize) -> Page {
        let start = page * self.page_size;
        let end = start + self.page_size;
        
        // Only copy if page is "hot" (frequently accessed)
        if self.access_tracker.is_hot_page(page) {
            Page::copy(&self.master.as_slice()[start..end])
        } else {
            // For cold pages, use zero-copy reference until modified
            Page::reference(&self.master.as_slice()[start..end])
        }
    }
}

// Access tracking for intelligent page management
struct AccessTracker {
    page_access_count: Vec<u32>,
    page_modification_bitmap: BitVec,
    access_pattern: Vec<AccessTime>
}

impl AccessTracker {
    fn is_hot_page(&self, page: usize) -> bool {
        // Page is "hot" if accessed more than threshold
        self.page_access_count[page] > HOT_PAGE_THRESHOLD
    }
    
    fn mark_accessed(&mut self, page: usize) {
        self.page_access_count[page] += 1;
        self.access_pattern.push(AccessTime {
            page,
            timestamp: Instant::now()
        });
    }
    
    fn predict_next_access(&self, page: usize) -> Option<Duration> {
        // Predict when page will be accessed next based on pattern
        let pattern = self.analyze_access_pattern(page);
        pattern.predict_next()
    }
}
```

---

📌 15. CONCURRENCY & PARALLELISM

Threads

```fax
// Spawning threads
let handle = std::thread::spawn(|| {
    println!("Hello from thread!");
    42
});

let result = handle.join().unwrap();

// Thread with move closure
let data = vec![1, 2, 3];
let handle = std::thread::spawn(move || {
    println!("Data: {:?}", data);
});

// Thread builder for configuration
let builder = std::thread::Builder::new()
    .name("worker".into())
    .stack_size(32 * 1024);  // 32KB stack

let handle = builder.spawn(|| {
    // Thread work
}).unwrap();

// Scoped threads (borrow data from parent)
let array = [1, 2, 3, 4, 5];
std::thread::scope(|s| {
    for i in 0..array.len() {
        s.spawn(|| {
            println!("{}", array[i]);
        });
    }
});

// Thread sleep
std::thread::sleep(Duration::from_millis(100));

// Thread parking
std::thread::park();
std::thread::current().unpark();

// Thread-local storage
thread_local! {
    static COUNTER: RefCell<u32> = RefCell::new(0);
}

COUNTER.with(|counter| {
    *counter.borrow_mut() += 1;
});
```

Channels

```fax
use std::sync::mpsc;  // Multi-producer, single-consumer

// Basic channel
let (tx, rx) = mpsc::channel();

// Sending
tx.send("Hello").unwrap();
tx.send(42).unwrap();

// Receiving
let msg = rx.recv().unwrap();  // Blocking
let msg = rx.try_recv();       // Non-blocking

// Multiple producers
let (tx, rx) = mpsc::channel();
let tx1 = tx.clone();
let tx2 = tx.clone();

tx1.send("from tx1").unwrap();
tx2.send("from tx2").unwrap();

// Iterating over received values
for received in rx {
    println!("Got: {}", received);
}

// Bounded channel (with buffer)
let (tx, rx) = mpsc::sync_channel(3);  // Buffer size 3

// Crossbeam channels (alternative)
use crossbeam::channel;

let (s, r) = channel::unbounded();
let (s, r) = channel::bounded(10);

// Select from multiple channels
select! {
    recv(r1) -> msg => println!("r1: {:?}", msg),
    recv(r2) -> msg => println!("r2: {:?}", msg),
    default(Duration::from_millis(100)) => println!("timeout")
}
```

Mutexes and Locks

```fax
use std::sync::{Mutex, Arc};

// Basic mutex
let m = Mutex::new(5);

{
    let mut num = m.lock().unwrap();
    *num = 6;
}  // Lock released here

// Mutex with Arc for sharing between threads
let counter = Arc::new(Mutex::new(0));
let mut handles = vec![];

for _ in 0..10 {
    let counter = Arc::clone(&counter);
    let handle = std::thread::spawn(move || {
        let mut num = counter.lock().unwrap();
        *num += 1;
    });
    handles.push(handle);
}

for handle in handles {
    handle.join().unwrap();
}

// Try lock (non-blocking)
let lock = m.try_lock();
match lock {
    Ok(mut guard) => *guard += 1,
    Err(_) => println!("Couldn't get lock")
}

// RwLock for multiple readers
use std::sync::RwLock;

let lock = RwLock::new(5);

// Multiple readers
{
    let r1 = lock.read().unwrap();
    let r2 = lock.read().unwrap();
    println!("Readers: {}, {}", r1, r2);
}

// Single writer
{
    let mut w = lock.write().unwrap();
    *w += 1;
}

// Deadlock prevention with lock ordering
fn transfer(from: &Mutex<i32>, to: &Mutex<i32>, amount: i32) {
    // Always lock in same order
    let mut from_lock = from.lock().unwrap();
    let mut to_lock = to.lock().unwrap();
    
    *from_lock -= amount;
    *to_lock += amount;
}
```

Atomic Operations

```fax
use std::sync::atomic::{AtomicBool, AtomicI32, AtomicUsize, Ordering};

let atomic_bool = AtomicBool::new(true);
let atomic_int = AtomicI32::new(0);
let atomic_usize = AtomicUsize::new(0);

// Load and store
atomic_int.store(42, Ordering::SeqCst);
let value = atomic_int.load(Ordering::SeqCst);

// Compare and swap (CAS)
let current = atomic_int.compare_and_swap(
    42, 
    100, 
    Ordering::SeqCst
);

// Fetch and modify operations
let prev = atomic_int.fetch_add(10, Ordering::SeqCst);  // Atomic add
let prev = atomic_int.fetch_sub(5, Ordering::SeqCst);   // Atomic subtract
let prev = atomic_int.fetch_and(0xFF, Ordering::SeqCst); // Atomic AND
let prev = atomic_int.fetch_or(0x01, Ordering::SeqCst);  // Atomic OR
let prev = atomic_int.fetch_xor(0x0F, Ordering::SeqCst); // Atomic XOR
let prev = atomic_int.fetch_max(100, Ordering::SeqCst);  // Atomic max
let prev = atomic_int.fetch_min(50, Ordering::SeqCst);   // Atomic min

// Memory ordering
// Relaxed: No ordering constraints
// Release: All previous operations happen before this store
// Acquire: This load happens before all subsequent operations
// AcqRel: Combination of Acquire and Release
// SeqCst: Sequential consistency (strongest)

// Atomic pointers
use std::sync::atomic::{AtomicPtr, Ordering};
let ptr = AtomicPtr::new(Box::into_raw(Box::new(42)));
```

Async/Await

```fax
// Async function
async fn fetch_url(url: &str) -> Result<String, reqwest::Error> {
    reqwest::get(url).await?.text().await
}

// Async block
let future = async {
    let result1 = fetch_url("http://example.com").await;
    let result2 = fetch_url("http://example.org").await;
    (result1, result2)
};

// Spawning async tasks
let handle = tokio::spawn(async {
    // Async work
    "result"
});

let result = handle.await.unwrap();

// Joining multiple futures
let (a, b) = tokio::join!(
    fetch_url("http://a.com"),
    fetch_url("http://b.com")
);

// Selecting between futures
tokio::select! {
    result = fetch_url("http://fast.com") => {
        println!("Fast completed first: {:?}", result);
    }
    result = fetch_url("http://slow.com") => {
        println!("Slow completed first: {:?}", result);
    }
}

// Async streams
use tokio_stream::StreamExt;

async fn process_stream(mut stream: impl Stream<Item = i32>) {
    while let Some(value) = stream.next().await {
        println!("Received: {}", value);
    }
}

// Async mutex
use tokio::sync::Mutex;
let mutex = Mutex::new(0);

let mut lock = mutex.lock().await;
*lock += 1;

// Async channels
use tokio::sync::mpsc;

let (tx, mut rx) = mpsc::channel(32);

tokio::spawn(async move {
    tx.send("hello").await.unwrap();
});

while let Some(message) = rx.recv().await {
    println!("Got: {}", message);
}
```

Parallel Iterators

```fax
use rayon::prelude::*;

// Parallel iteration
let sum = numbers.par_iter().sum::<i32>();
let doubled: Vec<_> = numbers.par_iter().map(|x| x * 2).collect();

// Parallel for_each
numbers.par_iter().for_each(|n| {
    process(*n);
});

// Parallel reduce
let max = numbers.par_iter().reduce(|| 0, |a, b| a.max(*b));

// Parallel filter and map
let evens: Vec<_> = numbers
    .par_iter()
    .filter(|&n| n % 2 == 0)
    .map(|&n| n * 2)
    .collect();

// Parallel sort
let mut data = vec![5, 3, 1, 4, 2];
data.par_sort();
data.par_sort_unstable();  // Faster but not stable

// Custom parallel tasks
rayon::scope(|s| {
    for i in 0..10 {
        s.spawn(|_| {
            // Parallel work
        });
    }
});

// Thread pool configuration
let pool = rayon::ThreadPoolBuilder::new()
    .num_threads(4)
    .build()
    .unwrap();

pool.install(|| {
    // Work using this thread pool
});
```

---

📌 16. METAPROGRAMMING & MACROS

Declarative Macros

```fax
// Basic macro
macro_rules! say_hello {
    () => {
        println!("Hello!");
    };
}

// Macro with parameters
macro_rules! create_function {
    ($func_name:ident) => {
        fn $func_name() {
            println!("You called {}", stringify!($func_name));
        }
    };
}

// Repetition patterns
macro_rules! vector {
    ($($element:expr),*) => {
        {
            let mut v = Vec::new();
            $(v.push($element);)*
            v
        }
    };
    ($element:expr; $count:expr) => {
        {
            let mut v = Vec::new();
            for _ in 0..$count {
                v.push($element.clone());
            }
            v
        }
    };
}

// Matching different patterns
macro_rules! test {
    ($left:expr, and $right:expr) => {
        println!("{} and {}", $left, $right);
    };
    ($left:expr, or $right:expr) => {
        println!("{} or {}", $left, $right);
    };
}

// Advanced macro with TT muncher
macro_rules! calculate {
    (eval $e:expr) => {{
        let val: usize = $e;
        println!("{} = {}", stringify!($e), val);
    }};
    
    // Recursively process expressions
    (eval $e:expr, $(eval $es:expr),+) => {{
        calculate!(eval $e);
        calculate!($(eval $es),+);
    }};
}
```

Procedural Macros

```fax
// Attribute macro
#[proc_macro_attribute]
pub fn route(attr: TokenStream, item: TokenStream) -> TokenStream {
    // Transform the item
    item
}

// Derive macro
#[proc_macro_derive(HelloMacro)]
pub fn hello_macro_derive(input: TokenStream) -> TokenStream {
    // Generate implementation
    TokenStream::new()
}

// Function-like macro
#[proc_macro]
pub fn make_answer(_item: TokenStream) -> TokenStream {
    "fn answer() -> u32 { 42 }".parse().unwrap()
}

// Using procedural macros
#[derive(Serialize, Deserialize, Debug, Clone)]
struct Point {
    x: f64,
    y: f64
}

#[route(GET, "/api/point")]
fn get_point() -> Point {
    Point { x: 10.0, y: 20.0 }
}

let answer = make_answer!();
```

Compile-time Evaluation

```fax
// Const functions
const fn square(x: i32) -> i32 {
    x * x
}

const SQUARE_OF_FIVE: i32 = square(5);

// Const generics
struct Array<T, const N: usize> {
    data: [T; N]
}

impl<T, const N: usize> Array<T, N> {
    const LEN: usize = N;
    
    const fn new() -> Self where T: Default + Copy {
        Array { data: [T::default(); N] }
    }
}

// Const blocks
const VALUE: i32 = {
    let x = 10;
    let y = 20;
    x + y
};

// Const if
const VALUE2: i32 = if true { 1 } else { 0 };

// Const match
const VALUE3: i32 = match 2 + 2 {
    4 => 100,
    _ => 0
};

// Compile-time assertions
const _: () = assert!(std::mem::size_of::<i32>() == 4);
```

Macro Hygiene

```fax
// Hygienic macros (default)
macro_rules! hygienic {
    () => {
        let x = 42;
        println!("x = {}", x);
    };
}

// Export macro to caller's scope
macro_rules! export {
    ($name:ident, $value:expr) => {
        #[macro_export]
        macro_rules! $name {
            () => { $value };
        }
    };
}

// Import macros from other crates
#[macro_use]
extern crate log;

// Scoped macro imports
use std::vec as std_vec;

// Macro debugging
macro_rules! debug_print {
    ($($t:tt)*) => {
        #[cfg(debug_assertions)]
        println!($($t)*);
    };
}
```

---

📌 17. FFI (FOREIGN FUNCTION INTERFACE)

C Interoperability

```fax
// Import C functions
extern "C" {
    fn strlen(s: *const c_char) -> usize;
    fn printf(format: *const c_char, ...) -> i32;
    fn malloc(size: usize) -> *mut c_void;
    fn free(ptr: *mut c_void);
}

// Export Fax functions to C
#[no_mangle]
pub extern "C" fn fax_function(x: i32, y: i32) -> i32 {
    x + y
}

// C-compatible struct
#[repr(C)]
pub struct CPoint {
    x: f64,
    y: f64
}

// C-compatible enum
#[repr(C)]
pub enum CStatus {
    Ok = 0,
    Error = 1
}

// Callbacks from C
type Callback = extern "C" fn(data: *mut c_void, len: usize) -> i32;

extern "C" {
    fn register_callback(cb: Callback);
}

extern "C" fn my_callback(data: *mut c_void, len: usize) -> i32 {
    // Process data
    0
}
```

Safe Wrappers

```fax
// Safe wrapper around C string
pub struct CString {
    ptr: *mut c_char,
    owned: bool
}

impl CString {
    pub fn new(s: &str) -> Result<Self, std::ffi::NulError> {
        let c_str = std::ffi::CString::new(s)?;
        let ptr = c_str.into_raw();
        Ok(CString { ptr, owned: true })
    }
    
    pub unsafe fn from_raw(ptr: *mut c_char) -> Self {
        CString { ptr, owned: false }
    }
    
    pub fn as_ptr(&self) -> *const c_char {
        self.ptr
    }
}

impl Drop for CString {
    fn drop(&mut self) {
        if self.owned {
            unsafe {
                std::ffi::CString::from_raw(self.ptr);
            }
        }
    }
}

// Safe wrapper for C arrays
pub struct CArray<T> {
    ptr: *mut T,
    len: usize,
    capacity: usize
}

impl<T> CArray<T> {
    pub unsafe fn from_raw_parts(ptr: *mut T, len: usize, capacity: usize) -> Self {
        CArray { ptr, len, capacity }
    }
    
    pub fn as_slice(&self) -> &[T] {
        unsafe { std::slice::from_raw_parts(self.ptr, self.len) }
    }
    
    pub fn as_mut_slice(&mut self) -> &mut [T] {
        unsafe { std::slice::from_raw_parts_mut(self.ptr, self.len) }
    }
}

impl<T> Drop for CArray<T> {
    fn drop(&mut self) {
        unsafe {
            std::alloc::dealloc(
                self.ptr as *mut u8,
                std::alloc::Layout::array::<T>(self.capacity).unwrap()
            );
        }
    }
}
```

Memory Safety in FFI

```fax
// Guard for FFI calls
pub struct FfiGuard<T> {
    data: T,
    guard: Arc<FfiSafetyGuard>
}

impl<T> FfiGuard<T> {
    pub fn new(data: T) -> Self {
        FfiGuard {
            data,
            guard: Arc::new(FfiSafetyGuard::new())
        }
    }
    
    pub fn with_foreign<F, R>(&self, f: F) -> R
    where
        F: FnOnce(*const c_void) -> R
    {
        self.guard.enter_ffi_zone();
        let ptr = &self.data as *const _ as *const c_void;
        let result = f(ptr);
        self.guard.exit_ffi_zone();
        result
    }
}

// Life-Force extension for FFI
impl<T> FfiGuard<T> {
    pub fn extend_life_force(&self, duration: Duration) {
        self.guard.extend_life_force(duration);
    }
    
    pub fn life_force_remaining(&self) -> Duration {
        self.guard.life_force_remaining()
    }
}

// FFI error handling
#[derive(Debug)]
pub enum FfiError {
    NullPointer,
    InvalidUtf8,
    LifeForceExpired,
    StateViolation,
    MemoryCorruption
}

impl From<std::ffi::NulError> for FfiError {
    fn from(_: std::ffi::NulError) -> Self {
        FfiError::NullPointer
    }
}

impl From<std::str::Utf8Error> for FfiError {
    fn from(_: std::str::Utf8Error) -> Self {
        FfiError::InvalidUtf8
    }
}
```

Calling Convention

```fax
// Different calling conventions
extern "C" {
    fn cdecl_func() -> i32;           // C calling convention
}

extern "stdcall" {
    fn stdcall_func() -> i32;         // stdcall (Windows)
}

extern "fastcall" {
    fn fastcall_func() -> i32;        // fastcall
}

extern "system" {
    fn system_func() -> i32;          // C on Unix, stdcall on Windows
}

// Vectorcall (fast passing of SIMD vectors)
extern "vectorcall" {
    fn vectorcall_func() -> i32;
}

// Custom calling convention
#[repr(transparent)]
struct CustomAbi;

impl std::ops::FnOnce<()> for CustomAbi {
    type Output = i32;
    
    extern "C" fn call_once(self, _args: ()) -> i32 {
        // Custom ABI implementation
        42
    }
}
```

---

📌 18. BUILT-IN ATTRIBUTES

Compilation Control

```fax
// Conditional compilation
#[cfg(target_os = "linux")]
fn linux_only() {}

#[cfg(any(unix, windows))]
fn unix_or_windows() {}

#[cfg(all(feature = "serde", not(debug_assertions)))]
fn production_with_serde() {}

#[cfg_attr(feature = "serde", derive(Serialize, Deserialize))]
struct Config {
    value: i32
}

// Feature flags
#[cfg(feature = "advanced")]
mod advanced {
    // Advanced functionality
}

// Debug vs release
#[cfg(debug_assertions)]
fn debug_only() {}

#[cfg(not(debug_assertions))]
fn release_only() {}
```

Optimization Hints

```fax
// Inline hints
#[inline]
fn small_function() {}

#[inline(always)]
fn critical_function() {}

#[inline(never)]
fn never_inline() {}

// Cold functions (unlikely to be called)
#[cold]
fn error_handler() {}

// Optimization barriers
#[inline(never)]
fn optimization_barrier() {
    std::sync::atomic::compiler_fence(std::sync::atomic::Ordering::SeqCst);
}

// Likely/unlikely branches
fn process(value: i32) {
    if value > 0 {
        // Likely branch
        #[likely]
        positive_case();
    } else {
        // Unlikely branch
        #[unlikely]
        non_positive_case();
    }
}
```

Safety Attributes

```fax
// Unsafe code requirements
unsafe trait UnsafeTrait {
    unsafe fn dangerous(&self);
}

unsafe impl UnsafeTrait for MyType {
    unsafe fn dangerous(&self) {
        // Unsafe operations
    }
}

// Memory safety
#[repr(transparent)]
struct Wrapper<T>(T);

#[repr(packed)]
struct PackedData {
    a: u8,
    b: u32
}

#[repr(align(64))]
struct CacheAligned {
    data: [u8; 64]
}

// No panic guarantee
#[no_panic]
fn cannot_panic(x: i32) -> i32 {
    x.wrapping_add(1)
}
```

Documentation

```fax
/// This is a documentation comment
/// 
/// # Examples
/// 
/// ```
/// let x = 5;
/// assert_eq!(x, 5);
/// ```
fn documented_function() {}

// Module documentation
//! # My Crate
//! 
//! This is my awesome crate.

// Documentation attributes
#[doc = "Alternative documentation"]
#[doc(hidden)]  // Hide from documentation
#[doc(alias = "alias_name")]  // Search alias
#[doc(include = "path/to/doc.md")]  // Include external file
```

---

📌 19. COMPILER DIRECTIVES

```fax
// Feature flags at crate level
#![feature(async_closure)]
#![feature(const_generics)]
#![feature(specialization)]

// Crate attributes
#![crate_name = "my_crate"]
#![crate_type = "lib"]
#![deny(warnings)]
#![allow(unused_variables)]
#![warn(missing_docs)]

// Edition specification
#![edition = "2024"]

// Entry point override
#![no_main]  // No standard main function
#![no_std]   // No standard library

// Linker directives
#[link(name = "mylib", kind = "static")]
extern "C" {
    fn external_function();
}

// Module inclusion
#[path = "custom_path/mod.rs"]
mod special_module;

// Inline assembly
asm!(
    "mov {0}, {1}",
    out(reg) result,
    in(reg) input
);

// Global assembly
global_asm!(
    ".global my_label",
    "my_label:",
    "  ret"
);
```

---

📌 20. COMPREHENSIVE EXAMPLE

```fax
// Complete Fax program demonstrating all features
#![allow(unused_variables)]

use std::fmt;
use std::error::Error;

// Custom error type
#[derive(Debug)]
enum AppError {
    Io(std::io::Error),
    Parse(std::num::ParseIntError),
    Custom(String),
}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            AppError::Io(e) => write!(f, "IO error: {}", e),
            AppError::Parse(e) => write!(f, "Parse error: {}", e),
            AppError::Custom(s) => write!(f, "Error: {}", s),
        }
    }
}

impl Error for AppError {
    fn source(&self) -> Option<&(dyn Error + 'static)> {
        match self {
            AppError::Io(e) => Some(e),
            AppError::Parse(e) => Some(e),
            AppError::Custom(_) => None,
        }
    }
}

impl From<std::io::Error> for AppError {
    fn from(e: std::io::Error) -> Self {
        AppError::Io(e)
    }
}

impl From<std::num::ParseIntError> for AppError {
    fn from(e: std::num::ParseIntError) -> Self {
        AppError::Parse(e)
    }
}

// Generic struct with const generic
struct Buffer<T, const CAPACITY: usize> {
    data: [T; CAPACITY],
    len: usize,
}

impl<T, const CAPACITY: usize> Buffer<T, CAPACITY> 
where
    T: Default + Copy,
{
    fn new() -> Self {
        Buffer {
            data: [T::default(); CAPACITY],
            len: 0,
        }
    }
    
    fn push(&mut self, item: T) -> Result<(), &'static str> {
        if self.len >= CAPACITY {
            return Err("Buffer full");
        }
        self.data[self.len] = item;
        self.len += 1;
        Ok(())
    }
    
    fn pop(&mut self) -> Option<T> {
        if self.len == 0 {
            None
        } else {
            self.len -= 1;
            Some(self.data[self.len])
        }
    }
}

// State machine for a connection
state_machine Connection {
    data {
        socket: Option<std::net::TcpStream>,
        buffer: Vec<u8>,
        address: std::net::SocketAddr,
    }
    
    state Disconnected {
        fn connect(mut self, addr: std::net::SocketAddr) 
            -> Result<Connecting, std::io::Error> 
        {
            let socket = std::net::TcpStream::connect(addr)?;
            Ok(Connecting {
                socket: Some(socket),
                buffer: Vec::new(),
                address: addr,
            })
        }
    }
    
    state Connecting {
        fn established(self) -> Connected {
            Connected {
                socket: self.socket,
                buffer: self.buffer,
                address: self.address,
            }
        }
    }
    
    state Connected {
        fn send(&mut self, data: &[u8]) -> Result<usize, std::io::Error> {
            if let Some(ref mut socket) = self.socket {
                socket.write(data)
            } else {
                Err(std::io::Error::new(
                    std::io::ErrorKind::NotConnected,
                    "Socket not connected"
                ))
            }
        }
        
        fn receive(&mut self, buf: &mut [u8]) -> Result<usize, std::io::Error> {
            if let Some(ref mut socket) = self.socket {
                socket.read(buf)
            } else {
                Err(std::io::Error::new(
                    std::io::ErrorKind::NotConnected,
                    "Socket not connected"
                ))
            }
        }
        
        fn disconnect(self) -> Disconnected {
            Disconnected {
                socket: None,
                buffer: Vec::new(),
                address: self.address,
            }
        }
    }
}

// Async function using the state machine
async fn async_connection_example() -> Result<(), AppError> {
    let mut conn = Connection::Disconnected::new();
    
    // Connect to server
    conn = conn.connect("127.0.0.1:8080".parse()?)?;
    conn = conn.established();
    
    // Send data
    let data = b"Hello, server!";
    let bytes_sent = conn.send(data)?;
    println!("Sent {} bytes", bytes_sent);
    
    // Receive response
    let mut buffer = [0u8; 1024];
    let bytes_received = conn.receive(&mut buffer)?;
    println!("Received {} bytes", bytes_received);
    
    // Disconnect
    conn = conn.disconnect();
    
    Ok(())
}

// Main function with error handling
fn main() -> Result<(), AppError> {
    // Create a buffer
    let mut buf = Buffer::<i32, 10>::new();
    
    // Fill the buffer
    for i in 0..10 {
        buf.push(i * 2)?;
    }
    
    // Process items
    while let Some(item) = buf.pop() {
        println!("Processing: {}", item);
    }
    
    // Run async example
    let runtime = tokio::runtime::Runtime::new()?;
    runtime.block_on(async_connection_example())?;
    
    Ok(())
}

// Tests
#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_buffer() {
        let mut buf = Buffer::<i32, 5>::new();
        assert!(buf.push(1).is_ok());
        assert!(buf.push(2).is_ok());
        assert!(buf.push(3).is_ok());
        assert!(buf.push(4).is_ok());
        assert!(buf.push(5).is_ok());
        assert!(buf.push(6).is_err());  // Buffer full
        
        assert_eq!(buf.pop(), Some(5));
        assert_eq!(buf.pop(), Some(4));
    }
    
    #[test]
    #[should_panic(expected = "Buffer full")]
    fn test_buffer_overflow() {
        let mut buf = Buffer::<i32, 2>::new();
        buf.push(1).unwrap();
        buf.push(2).unwrap();
        buf.push(3).unwrap();  // Should panic
    }
}
```

{% endraw %}
{% endraw %}
