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
    }
};

module.exports = ERROR_DATABASE;