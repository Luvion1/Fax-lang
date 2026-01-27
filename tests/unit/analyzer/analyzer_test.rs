#[cfg(test)]
mod analyzer_tests {
    use crate::{Analyzer, OwnershipAnalyzer, LifetimeAnalyzer, Program, BaseNode, Statement, Expression, NodeType};
    use std::collections::HashMap;

    // Helper functions to create test AST nodes
    fn create_test_program(body: Vec<Statement>) -> Program {
        Program {
            base: BaseNode {
                node_type: NodeType::Program,
                line: 1,
                column: 1,
            },
            body,
        }
    }

    #[test]
    fn test_analyzer_creation() {
        let analyzer = Analyzer::new();
        assert!(true); // Just test that it compiles and can be created
    }

    #[test]
    fn test_ownership_analyzer_creation() {
        let ownership_analyzer = OwnershipAnalyzer::new();
        assert_eq!(ownership_analyzer.ownership_map.len(), 0);
        assert_eq!(ownership_analyzer.lifetime_map.len(), 0);
    }

    #[test]
    fn test_lifetime_analyzer_creation() {
        let lifetime_analyzer = LifetimeAnalyzer::new();
        assert_eq!(lifetime_analyzer.lifetime_map.len(), 0);
        assert_eq!(lifetime_analyzer.current_scope, 0);
    }

    #[test]
    fn test_empty_program_analysis() {
        let program = create_test_program(vec![]);
        let mut analyzer = Analyzer::new();
        
        let result = analyzer.analyze(&program);
        assert!(result.is_ok());
    }

    #[test]
    fn test_ownership_state_transitions() {
        let mut analyzer = OwnershipAnalyzer::new();
        
        // Initially, a variable should not be in the ownership map
        assert!(!analyzer.ownership_map.contains_key("x"));
        
        // Add a variable as owned
        analyzer.ownership_map.insert("x".to_string(), crate::OwnershipState::Owned);
        assert!(matches!(analyzer.ownership_map.get("x"), Some(crate::OwnershipState::Owned)));
        
        // Change to moved
        analyzer.ownership_map.insert("x".to_string(), crate::OwnershipState::Moved);
        assert!(matches!(analyzer.ownership_map.get("x"), Some(crate::OwnershipState::Moved)));
    }

    #[test]
    fn test_lifetime_tracking() {
        let mut analyzer = LifetimeAnalyzer::new();
        
        // Initially, no variables should be tracked
        assert_eq!(analyzer.lifetime_map.len(), 0);
        
        // Add a variable with local lifetime
        analyzer.lifetime_map.insert("x".to_string(), crate::Lifetime::Local(1));
        assert!(matches!(analyzer.lifetime_map.get("x"), Some(crate::Lifetime::Local(1))));
        
        // Change scope
        analyzer.current_scope = 2;
        analyzer.lifetime_map.insert("y".to_string(), crate::Lifetime::Local(analyzer.current_scope));
        assert!(matches!(analyzer.lifetime_map.get("y"), Some(crate::Lifetime::Local(2))));
    }

    #[test]
    fn test_clone_for_branch() {
        let mut original = OwnershipAnalyzer::new();
        original.ownership_map.insert("x".to_string(), crate::OwnershipState::Owned);
        original.lifetime_map.insert("x".to_string(), crate::Lifetime::Local(1));

        let branch_analyzer = original.clone_for_branch();
        
        // The branch should have the same initial state
        assert!(matches!(branch_analyzer.ownership_map.get("x"), Some(crate::OwnershipState::Owned)));
        assert!(matches!(branch_analyzer.lifetime_map.get("x"), Some(crate::Lifetime::Local(1))));
        
        // Modifications to the branch shouldn't affect the original
        let mut branch_analyzer = original.clone_for_branch();
        branch_analyzer.ownership_map.insert("y".to_string(), crate::OwnershipState::BorrowedShared);
        
        assert!(!original.ownership_map.contains_key("y"));
        assert!(branch_analyzer.ownership_map.contains_key("y"));
    }

    #[test]
    fn test_error_display() {
        use std::fmt::Write;
        
        let error = crate::AnalysisError::new(
            "Test error message".to_string(),
            10,
            5,
            100,
            crate::AnalysisErrorType::TypeError
        );
        
        let mut output = String::new();
        write!(&mut output, "{}", error).unwrap();
        
        assert!(output.contains("AnalysisError"));
        assert!(output.contains("TypeError"));
        assert!(output.contains("10:5"));
        assert!(output.contains("pos=100"));
        assert!(output.contains("Test error message"));
    }

    #[test]
    fn test_error_types() {
        // Test each error type
        let ownership_error = crate::AnalysisError::ownership_error(
            "Ownership issue".to_string(),
            1,
            1,
            0
        );
        assert!(matches!(ownership_error.error_type, crate::AnalysisErrorType::OwnershipError));
        
        let borrow_error = crate::AnalysisError::borrow_error(
            "Borrow issue".to_string(),
            1,
            1,
            0
        );
        assert!(matches!(borrow_error.error_type, crate::AnalysisErrorType::BorrowError));
        
        let lifetime_error = crate::AnalysisError::lifetime_error(
            "Lifetime issue".to_string(),
            1,
            1,
            0
        );
        assert!(matches!(lifetime_error.error_type, crate::AnalysisErrorType::LifetimeError));
        
        let move_error = crate::AnalysisError::move_error(
            "Move issue".to_string(),
            1,
            1,
            0
        );
        assert!(matches!(move_error.error_type, crate::AnalysisErrorType::MoveError));
    }
}