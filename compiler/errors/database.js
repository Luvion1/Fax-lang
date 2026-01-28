const ERROR_DATABASE = {
    "E001": {
        "title": "Forbidden Identifier Name",
        "explanation": "You are using an identifier name that is reserved by the compiler.\nThe name 'err' is restricted because it is used internally for the error reporting system and diagnostic piping.",
        "solution": "Change the variable name to something more descriptive, e.g., 'status_code' or 'result_val'."
    },
    "E002": {
        "title": "Invalid Type 'void' for Variable",
        "explanation": "The 'void' type represents the absence of a value and can only be used as a function return type.\nVariables must hold a concrete value, which 'void' cannot provide.",
        "solution": "Use a concrete type like 'int', 'float', 'string', or 'bool' instead."
    },
    "E0382": {
        "title": "Use of Moved Value",
        "explanation": "This variable has been moved to another location (e.g., passed into a function or assigned to another variable).\nFax-lang uses strict move semantics for non-primitive types to ensure memory safety without a garbage collector.",
        "solution": "Avoid using the variable after it has been moved, or use primitive types which are copied by default."
    },
    "E0308": {
        "title": "Mismatched Types",
        "explanation": "You tried to assign a value of one type to a variable or parameter of a different type.\nFax-lang is statically typed and does not allow implicit type conversion for most operations.",
        "solution": "Ensure that the value matches the declared type, or use 'auto' for type inference."
    },
    "E0061": {
        "title": "Wrong Number of Arguments",
        "explanation": "The number of arguments provided in the function call does not match the number of parameters in the function definition.",
        "solution": "Check the function signature and provide the correct number of arguments."
    }
};

module.exports = ERROR_DATABASE;