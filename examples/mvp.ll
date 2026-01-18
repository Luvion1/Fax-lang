; ModuleID = 'mvp'
source_filename = "mvp.fx"




define i32 @main() {
entry:
  %1 = alloca i32, align 4
  store i32 42, ptr %1, align 4
  %2 = alloca i32, align 4
  store i32 10, ptr %2, align 4
  %3 = load i32, ptr %1, align 4
  ret i32 %3
  ret i32 0
}