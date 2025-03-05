use tauri_plugin_sql::{Migration, MigrationKind};

pub fn create_migrations() -> Vec<Migration> {
    vec![Migration {
        version: 1,
        description: "create_initial_tables",
        sql: "CREATE TABLE IF NOT EXISTS projects (
            id INTEGER PRIMARY KEY,
            name TEXT,
            path TEXT NOT NULL UNIQUE,
            description TEXT,
            tags TEXT,
            diskUsage INTEGER,
            hasChanges BOOLEAN,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        );",
        kind: MigrationKind::Up,
    }]
}
