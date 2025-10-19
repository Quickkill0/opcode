use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::fs;

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct PermissionSettings {
    #[serde(default)]
    pub permissions: PermissionRules,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default, PartialEq)]
pub struct PermissionRules {
    #[serde(default)]
    pub allow: Vec<String>,
    #[serde(default)]
    pub deny: Vec<String>,
}

pub struct PermissionStorage;

impl PermissionStorage {
    /// Format a permission pattern for storage
    /// Examples:
    /// - Bash: format_pattern("Bash", "git push", Some(...)) -> "Bash(git *)"
    /// - Read: format_pattern("Read", "~/.zshrc", None) -> "Read(~/.zshrc)"
    /// - Write: format_pattern("Write", "src/main.rs", None) -> "Write(src/**)"
    pub fn format_pattern(tool: &str, path: &str, input: Option<&serde_json::Value>) -> String {
        todo!("Implement pattern formatting")
    }

    pub fn load_permissions() -> Result<PermissionRules, String> {
        todo!("Implement loading permissions from ~/.claude/settings.local.json")
    }

    pub fn add_allow_rule(pattern: String) -> Result<(), String> {
        todo!("Implement adding allow rule to settings.local.json")
    }

    pub fn add_deny_rule(pattern: String) -> Result<(), String> {
        todo!("Implement adding deny rule to settings.local.json")
    }

    pub fn remove_rule(pattern: String) -> Result<(), String> {
        todo!("Implement removing rule from settings.local.json")
    }

    /// Generate hook configuration JSON for --settings flag
    /// This is passed at runtime and NOT saved to disk
    pub fn generate_hook_settings(hook_path: &str, port: u16) -> Result<String, String> {
        todo!("Implement hook settings generation")
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;
    use std::env;

    #[test]
    fn test_format_pattern_bash_with_command() {
        let input = json!({"command": "git push origin main"});
        let pattern = PermissionStorage::format_pattern("Bash", "git push origin main", Some(&input));
        assert_eq!(pattern, "Bash(git *)");
    }

    #[test]
    fn test_format_pattern_bash_npm_run() {
        let input = json!({"command": "npm run test:unit"});
        let pattern = PermissionStorage::format_pattern("Bash", "npm run test:unit", Some(&input));
        assert_eq!(pattern, "Bash(npm *)");
    }

    #[test]
    fn test_format_pattern_read_specific_file() {
        let pattern = PermissionStorage::format_pattern("Read", "~/.zshrc", None);
        assert_eq!(pattern, "Read(~/.zshrc)");
    }

    #[test]
    fn test_format_pattern_read_file_in_directory() {
        let pattern = PermissionStorage::format_pattern("Read", "src/main.rs", None);
        assert_eq!(pattern, "Read(src/**)");
    }

    #[test]
    fn test_format_pattern_write_directory() {
        let pattern = PermissionStorage::format_pattern("Write", "src/components/new-file.tsx", None);
        assert_eq!(pattern, "Write(src/components/**)");
    }

    #[test]
    fn test_format_pattern_edit_with_wildcard() {
        let pattern = PermissionStorage::format_pattern("Edit", "**/*.rs", None);
        assert_eq!(pattern, "Edit(**/*.rs)");
    }

    #[test]
    fn test_load_permissions_empty_file() {
        // This test will need a temp directory
        let result = PermissionStorage::load_permissions();
        assert!(result.is_ok());
        let rules = result.unwrap();
        assert_eq!(rules.allow.len(), 0);
        assert_eq!(rules.deny.len(), 0);
    }

    #[test]
    fn test_add_allow_rule() {
        let result = PermissionStorage::add_allow_rule("Bash(git *)".to_string());
        assert!(result.is_ok());

        let rules = PermissionStorage::load_permissions().unwrap();
        assert!(rules.allow.contains(&"Bash(git *)".to_string()));
    }

    #[test]
    fn test_add_deny_rule() {
        let result = PermissionStorage::add_deny_rule("Write(/etc/**)".to_string());
        assert!(result.is_ok());

        let rules = PermissionStorage::load_permissions().unwrap();
        assert!(rules.deny.contains(&"Write(/etc/**)".to_string()));
    }

    #[test]
    fn test_remove_rule() {
        // First add a rule
        PermissionStorage::add_allow_rule("Bash(npm *)".to_string()).unwrap();

        // Then remove it
        let result = PermissionStorage::remove_rule("Bash(npm *)".to_string());
        assert!(result.is_ok());

        let rules = PermissionStorage::load_permissions().unwrap();
        assert!(!rules.allow.contains(&"Bash(npm *)".to_string()));
    }

    #[test]
    fn test_generate_hook_settings() {
        let hook_path = "/path/to/permission-proxy.py";
        let port = 8765;

        let result = PermissionStorage::generate_hook_settings(hook_path, port);
        assert!(result.is_ok());

        let settings_json = result.unwrap();
        let settings: serde_json::Value = serde_json::from_str(&settings_json).unwrap();

        // Verify structure
        assert!(settings.get("hooks").is_some());
        assert!(settings["hooks"].get("PreToolUse").is_some());

        let pre_tool_use = settings["hooks"]["PreToolUse"].as_array().unwrap();
        assert_eq!(pre_tool_use.len(), 1);

        let hook_config = &pre_tool_use[0];
        assert_eq!(hook_config["matcher"], "*");
        assert!(hook_config["hooks"].is_array());

        let hooks = hook_config["hooks"].as_array().unwrap();
        assert_eq!(hooks.len(), 1);
        assert_eq!(hooks[0]["type"], "command");
        assert_eq!(hooks[0]["command"], format!("python {} {}", hook_path, port));
        assert_eq!(hooks[0]["timeout"], 300);
    }

    #[test]
    fn test_load_permissions_with_existing_rules() {
        // First add some rules
        PermissionStorage::add_allow_rule("Bash(git *)".to_string()).unwrap();
        PermissionStorage::add_allow_rule("Read(**/*.rs)".to_string()).unwrap();
        PermissionStorage::add_deny_rule("Write(/etc/**)".to_string()).unwrap();

        // Load and verify
        let rules = PermissionStorage::load_permissions().unwrap();
        assert!(rules.allow.contains(&"Bash(git *)".to_string()));
        assert!(rules.allow.contains(&"Read(**/*.rs)".to_string()));
        assert!(rules.deny.contains(&"Write(/etc/**)".to_string()));
    }

    #[test]
    fn test_format_pattern_bash_without_input() {
        let pattern = PermissionStorage::format_pattern("Bash", "git status", None);
        assert_eq!(pattern, "Bash(git status)");
    }

    #[test]
    fn test_format_pattern_glob() {
        let pattern = PermissionStorage::format_pattern("Glob", "**/*.tsx", None);
        assert_eq!(pattern, "Glob(**/*.tsx)");
    }

    #[test]
    fn test_format_pattern_grep() {
        let pattern = PermissionStorage::format_pattern("Grep", "src/**/*.rs", None);
        assert_eq!(pattern, "Grep(src/**/*.rs)");
    }
}
