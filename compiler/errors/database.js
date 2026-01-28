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
    },
    "E0101": {
        "title": "Missing Semicolon",
        "explanation": "Fax-lang requires a semicolon ';' to terminate statements and expressions.\nThis helps the parser clearly distinguish between separate logical units of code.",
        "solution": "Add a semicolon ';' at the end of the line or expression."
    },
    "E0102": {
        "title": "Expected Specific Token",
        "explanation": "The parser encountered a token it didn't expect, or a required token (like a parenthesis or brace) is missing.",
        "solution": "Ensure all syntax elements like brackets, parentheses, and braces are correctly placed and balanced."
    },
    "E0103": {
        "title": "Missing Identifier",
        "explanation": "A name was expected for a variable, function, or struct, but none was found or the name provided is invalid.",
        "solution": "Provide a valid identifier name (starting with a letter or underscore)."
    },
    "E0104": {
        "title": "Unclosed Delimiter",
        "explanation": "A closing delimiter (like ')', ']', or '}') is missing.\nEvery opening delimiter must have a corresponding closing delimiter.",
        "solution": "Add the missing closing delimiter to balance the expression or block."
    },
    "E0105": {
        "title": "Invalid Type Name",
        "explanation": "The type name provided is not recognized by Fax-lang or is syntactically incorrect.",
        "solution": "Use a valid built-in type (int, float, bool, string, void) or a defined struct name."
    },
    "E0106": {
        "title": "Expected Literal",
        "explanation": "A literal value (like a string, number, or boolean) was expected in this context.",
        "solution": "Provide a valid literal value, for example, a quoted string for import paths."
    }
};

module.exports = ERROR_DATABASE;