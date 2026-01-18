; ModuleID = 'logic'
source_filename = "logic.fx"




define i32 @main() {
entry:
  %0 = alloca i32, align 4
  store i32 10, i32* %0, align 4
  %1 = alloca i32, align 4
  store i32 5, i32* %1, align 4
  %2 = load i32, i32* %0, align 4
  %3 = load i32, i32* %1, align 4
  %4 = mul i32 %2, %3
  %5 = add i32 %4, 2
  %6 = alloca i32, align 4
  store i32 %5, i32* %6, align 4
  %7 = load i32, i32* %6, align 4
  ret i32 %7
  ret i32 0
}