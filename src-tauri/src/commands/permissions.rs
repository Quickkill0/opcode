use tauri::{command, State};
use crate::permission_server::{PermissionServerState, PermissionDecision};
use crate::permission_storage::PermissionStorage;

#[command]
pub async fn respond_to_permission(
    state: State<'_, PermissionServerState>,
    request_id: String,
    allowed: bool,
    always_allow: bool,
    always_deny: bool,
    tool: String,
    path: String,
    input: Option<serde_json::Value>,
) -> Result<(), String> {
    // Save to ~/.claude/settings.local.json if user chose "remember"
    if always_allow {
        let pattern = PermissionStorage::format_pattern(&tool, &path, input.as_ref());
        PermissionStorage::add_allow_rule(pattern)?;
    } else if always_deny {
        let pattern = PermissionStorage::format_pattern(&tool, &path, input.as_ref());
        PermissionStorage::add_deny_rule(pattern)?;
    }

    // Respond to the waiting HTTP request
    let mut pending = state.pending_requests.write().await;
    if let Some(tx) = pending.remove(&request_id) {
        let decision = PermissionDecision {
            decision: if allowed { "approve" } else { "deny" }.to_string(),
        };
        let _ = tx.send(decision);
    }

    Ok(())
}

#[command]
pub fn get_permission_rules() -> Result<crate::permission_storage::PermissionRules, String> {
    PermissionStorage::load_permissions()
}

#[command]
pub fn add_permission_allow_rule(pattern: String) -> Result<(), String> {
    PermissionStorage::add_allow_rule(pattern)
}

#[command]
pub fn add_permission_deny_rule(pattern: String) -> Result<(), String> {
    PermissionStorage::add_deny_rule(pattern)
}

#[command]
pub fn remove_permission_rule(pattern: String) -> Result<(), String> {
    PermissionStorage::remove_rule(pattern)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_get_permission_rules() {
        let result = get_permission_rules();
        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn test_add_permission_allow_rule() {
        let result = add_permission_allow_rule("Bash(git *)".to_string());
        assert!(result.is_ok());

        let rules = get_permission_rules().unwrap();
        assert!(rules.allow.contains(&"Bash(git *)".to_string()));
    }

    #[tokio::test]
    async fn test_add_permission_deny_rule() {
        let result = add_permission_deny_rule("Write(/etc/**)".to_string());
        assert!(result.is_ok());

        let rules = get_permission_rules().unwrap();
        assert!(rules.deny.contains(&"Write(/etc/**)".to_string()));
    }

    #[tokio::test]
    async fn test_remove_permission_rule() {
        // First add a rule
        add_permission_allow_rule("Bash(npm *)".to_string()).unwrap();

        // Verify it's there
        let rules = get_permission_rules().unwrap();
        assert!(rules.allow.contains(&"Bash(npm *)".to_string()));

        // Remove it
        let result = remove_permission_rule("Bash(npm *)".to_string());
        assert!(result.is_ok());

        // Verify it's gone
        let rules = get_permission_rules().unwrap();
        assert!(!rules.allow.contains(&"Bash(npm *)".to_string()));
    }

    #[tokio::test]
    async fn test_remove_permission_rule_from_deny() {
        // First add a deny rule
        add_permission_deny_rule("Read(/private/**)".to_string()).unwrap();

        // Verify it's there
        let rules = get_permission_rules().unwrap();
        assert!(rules.deny.contains(&"Read(/private/**)".to_string()));

        // Remove it
        let result = remove_permission_rule("Read(/private/**)".to_string());
        assert!(result.is_ok());

        // Verify it's gone
        let rules = get_permission_rules().unwrap();
        assert!(!rules.deny.contains(&"Read(/private/**)".to_string()));
    }
}
