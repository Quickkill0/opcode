use axum::{
    extract::{Json, State},
    routing::{get, post},
    Router,
};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tauri::{AppHandle, Manager};
use tokio::sync::{oneshot, RwLock};

use crate::permission_storage::PermissionStorage;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PermissionRequest {
    pub id: String,
    pub session_id: String,
    pub tool: String,
    pub path: String,
    pub input: Option<serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PermissionDecision {
    pub decision: String, // "approve" or "deny"
}

#[derive(Clone)]
pub struct PermissionServerState {
    pub app_handle: AppHandle,
    pub pending_requests: Arc<RwLock<HashMap<String, oneshot::Sender<PermissionDecision>>>>,
}

/// Match a pattern against a request pattern
/// Supports wildcards: * matches anything except /, ** matches everything including /
pub fn match_pattern(pattern: &str, request: &str) -> bool {
    todo!("Implement wildcard pattern matching")
}

pub async fn start_permission_server(app: AppHandle, port: u16) -> Result<(), String> {
    todo!("Implement permission server startup")
}

async fn handle_permission_request(
    State(state): State<PermissionServerState>,
    Json(request): Json<PermissionRequest>,
) -> Json<PermissionDecision> {
    todo!("Implement permission request handling")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_match_pattern_exact() {
        assert!(match_pattern("Bash(git *)", "Bash(git *)"));
        assert!(match_pattern("Read(~/.zshrc)", "Read(~/.zshrc)"));
    }

    #[test]
    fn test_match_pattern_bash_wildcard() {
        assert!(match_pattern("Bash(git *)", "Bash(git push)"));
        assert!(match_pattern("Bash(git *)", "Bash(git pull origin main)"));
        assert!(match_pattern("Bash(npm *)", "Bash(npm install)"));
        assert!(match_pattern("Bash(npm run test:*)", "Bash(npm run test:unit)"));
    }

    #[test]
    fn test_match_pattern_bash_no_match() {
        assert!(!match_pattern("Bash(git *)", "Bash(npm install)"));
        assert!(!match_pattern("Bash(npm *)", "Bash(git push)"));
    }

    #[test]
    fn test_match_pattern_file_operations_single_star() {
        assert!(match_pattern("Read(src/*)", "Read(src/main.rs)"));
        assert!(match_pattern("Write(src/*)", "Write(src/lib.rs)"));
        assert!(!match_pattern("Read(src/*)", "Read(src/components/App.tsx)")); // * doesn't match /
    }

    #[test]
    fn test_match_pattern_file_operations_double_star() {
        assert!(match_pattern("Read(src/**)", "Read(src/main.rs)"));
        assert!(match_pattern("Read(src/**)", "Read(src/components/App.tsx)"));
        assert!(match_pattern("Write(**/*.rs)", "Write(src/main.rs)"));
        assert!(match_pattern("Write(**/*.rs)", "Write(tests/integration/test.rs)"));
    }

    #[test]
    fn test_match_pattern_file_operations_no_match() {
        assert!(!match_pattern("Read(src/**)", "Read(tests/test.rs)"));
        assert!(!match_pattern("Write(**/*.rs)", "Write(src/main.ts)"));
    }

    #[test]
    fn test_match_pattern_specific_file() {
        assert!(match_pattern("Read(~/.zshrc)", "Read(~/.zshrc)"));
        assert!(!match_pattern("Read(~/.zshrc)", "Read(~/.bashrc)"));
    }

    #[test]
    fn test_match_pattern_glob_and_grep() {
        assert!(match_pattern("Glob(**/*.tsx)", "Glob(**/*.tsx)"));
        assert!(match_pattern("Grep(src/**)", "Grep(src/**)"));
    }

    #[test]
    fn test_match_pattern_complex_paths() {
        assert!(match_pattern("Write(src/**)", "Write(src/components/ui/Button.tsx)"));
        assert!(match_pattern("Read(/etc/**)", "Read(/etc/nginx/nginx.conf)"));
    }

    #[test]
    fn test_match_pattern_case_sensitive() {
        assert!(!match_pattern("Bash(Git *)", "Bash(git push)"));
        assert!(!match_pattern("Read(SRC/**)", "Read(src/main.rs)"));
    }

    #[test]
    fn test_match_pattern_tool_name_matters() {
        assert!(!match_pattern("Read(src/**)", "Write(src/main.rs)"));
        assert!(!match_pattern("Bash(git *)", "Read(git status)"));
    }
}
