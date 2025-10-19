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
    /// Get the path to settings.local.json
    fn get_settings_path() -> Result<PathBuf, String> {
        dirs::home_dir()
            .ok_or_else(|| "Could not find home directory".to_string())
            .map(|home| home.join(".claude").join("settings.local.json"))
    }

    /// Format a permission pattern for storage
    /// Examples:
    /// - Bash: format_pattern("Bash", "git push", Some(...)) -> "Bash(git *)"
    /// - Read: format_pattern("Read", "~/.zshrc", None) -> "Read(~/.zshrc)"
    /// - Write: format_pattern("Write", "src/main.rs", None) -> "Write(src/**)"
    pub fn format_pattern(tool: &str, path: &str, input: Option<&serde_json::Value>) -> String {
        match tool {
            "Bash" => {
                // For Bash, extract base command from input
                if let Some(input_val) = input {
                    if let Some(command) = input_val.get("command").and_then(|v| v.as_str()) {
                        let base_cmd = command.split_whitespace().next().unwrap_or(command);
                        format!("Bash({} *)", base_cmd)
                    } else {
                        format!("Bash({})", path)
                    }
                } else {
                    format!("Bash({})", path)
                }
            }
            "Read" | "Write" | "Edit" | "Glob" | "Grep" => {
                // For file operations, add ** if it's a specific file
                if path.contains('*') {
                    // Already has wildcards, use as-is
                    format!("{}({})", tool, path)
                } else if path.starts_with("~/") || path.starts_with('/') || path.starts_with("C:\\") || path.starts_with("D:\\") {
                    // Absolute paths or home paths - use as-is if they're specific files
                    format!("{}({})", tool, path)
                } else if path.contains('.') && !path.ends_with('/') {
                    // Specific file in a relative path, add ** to parent directory
                    let parent = std::path::Path::new(path)
                        .parent()
                        .and_then(|p| p.to_str())
                        .unwrap_or(path);
                    format!("{}({}/**)", tool, parent)
                } else {
                    // Directory or other pattern, use as-is
                    format!("{}({})", tool, path)
                }
            }
            _ => format!("{}({})", tool, path)
        }
    }

    pub fn load_permissions() -> Result<PermissionRules, String> {
        let settings_path = Self::get_settings_path()?;

        if !settings_path.exists() {
            // Return empty rules if file doesn't exist
            return Ok(PermissionRules::default());
        }

        let content = fs::read_to_string(&settings_path)
            .map_err(|e| format!("Failed to read settings file: {}", e))?;

        let settings: PermissionSettings = serde_json::from_str(&content)
            .map_err(|e| format!("Failed to parse settings file: {}", e))?;

        Ok(settings.permissions)
    }

    pub fn add_allow_rule(pattern: String) -> Result<(), String> {
        let settings_path = Self::get_settings_path()?;

        // Ensure .claude directory exists
        if let Some(parent) = settings_path.parent() {
            fs::create_dir_all(parent)
                .map_err(|e| format!("Failed to create .claude directory: {}", e))?;
        }

        let mut rules = Self::load_permissions().unwrap_or_default();

        if !rules.allow.contains(&pattern) {
            rules.allow.push(pattern);
        }

        let settings = PermissionSettings { permissions: rules };
        let content = serde_json::to_string_pretty(&settings)
            .map_err(|e| format!("Failed to serialize settings: {}", e))?;

        fs::write(&settings_path, content)
            .map_err(|e| format!("Failed to write settings file: {}", e))?;

        Ok(())
    }

    pub fn add_deny_rule(pattern: String) -> Result<(), String> {
        let settings_path = Self::get_settings_path()?;

        // Ensure .claude directory exists
        if let Some(parent) = settings_path.parent() {
            fs::create_dir_all(parent)
                .map_err(|e| format!("Failed to create .claude directory: {}", e))?;
        }

        let mut rules = Self::load_permissions().unwrap_or_default();

        if !rules.deny.contains(&pattern) {
            rules.deny.push(pattern);
        }

        let settings = PermissionSettings { permissions: rules };
        let content = serde_json::to_string_pretty(&settings)
            .map_err(|e| format!("Failed to serialize settings: {}", e))?;

        fs::write(&settings_path, content)
            .map_err(|e| format!("Failed to write settings file: {}", e))?;

        Ok(())
    }

    pub fn remove_rule(pattern: String) -> Result<(), String> {
        let settings_path = Self::get_settings_path()?;

        let mut rules = Self::load_permissions().unwrap_or_default();

        // Remove from both allow and deny lists
        rules.allow.retain(|p| p != &pattern);
        rules.deny.retain(|p| p != &pattern);

        let settings = PermissionSettings { permissions: rules };
        let content = serde_json::to_string_pretty(&settings)
            .map_err(|e| format!("Failed to serialize settings: {}", e))?;

        fs::write(&settings_path, content)
            .map_err(|e| format!("Failed to write settings file: {}", e))?;

        Ok(())
    }

    /// Generate hook configuration JSON for --settings flag
    /// This is passed at runtime and NOT saved to disk
    pub fn generate_hook_settings(hook_path: &str, port: u16) -> Result<String, String> {
        let settings = serde_json::json!({
            "hooks": {
                "PreToolUse": [{
                    "matcher": "*",
                    "hooks": [{
                        "type": "command",
                        "command": format!("python {} {}", hook_path, port),
                        "timeout": 300
                    }]
                }]
            }
        });

        serde_json::to_string(&settings)
            .map_err(|e| format!("Failed to serialize hook settings: {}", e))
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
        // Clear any existing rules first
        let existing_rules = PermissionStorage::load_permissions().unwrap_or_default();
        for rule in existing_rules.allow {
            let _ = PermissionStorage::remove_rule(rule);
        }
        for rule in existing_rules.deny {
            let _ = PermissionStorage::remove_rule(rule);
        }

        // Now test loading empty permissions
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
