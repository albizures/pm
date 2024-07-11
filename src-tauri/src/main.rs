// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod app;
mod commands;
mod error;
mod files;
mod git;
mod javascript;
mod project;

use project::find_projects;
use specta::collect_types;
use specta::ts::{BigIntExportBehavior, ExportConfiguration};
use tauri_specta::ts;

fn main() {
    #[cfg(debug_assertions)]
    ts::export_with_cfg(
        collect_types![
            get_git_status,
            get_projects_with_uncommitted_changes,
            get_project_git_data,
            commands::is_path_ignored
        ]
        .unwrap(),
        ExportConfiguration::new().bigint(BigIntExportBehavior::Number),
        //  {
        //     bigint: BigIntExportBehavior::Number..Default::default(),
        // },
        "../src/bindings.ts",
    )
    .unwrap();

    let mut root = tauri::api::path::home_dir().expect("error while getting home directory");
    root.push("projects");
    let root = root
        .to_str()
        .expect("error while converting path to string");

    let projects = find_projects(root).expect("error while finding projects");

    for (_, project) in projects.iter() {
        print!("Project: {} | ", project.path);
        for project_type in project.types.iter() {
            print!(" {:?}", project_type);
        }
        println!("");
    }

    tauri::Builder::default()
        .manage(app::AppState::new(projects))
        .invoke_handler(tauri::generate_handler![
            get_git_status,
            get_projects_with_uncommitted_changes,
            get_project_git_data,
            commands::is_path_ignored
        ])
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .plugin(tauri_plugin_fs_extra::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
#[specta::specta]
fn get_git_status(path: String) -> Result<Vec<git::GitStatusEntry>, String> {
    let result = git::get_git_project(&path);

    match result {
        Ok(repo) => Ok(git::get_git_status(&repo)),
        Err(e) => {
            return Err(format!("Error: {}", e));
        }
    }
}

#[tauri::command]
#[specta::specta]
fn get_projects_with_uncommitted_changes(
    state: tauri::State<app::AppState>,
) -> Vec<git::GitProjectEntry> {
    git::get_projects_with_uncommitted_changes(&state.get().projects)
}

#[tauri::command]
#[specta::specta]
fn get_project_git_data(path: String, state: tauri::State<app::AppState>) -> git::ProjectGitData {
    let projects = &state.get().projects;
    let project = projects.get(&path).unwrap();

    if project.types.contains(&project::ProjectType::Git) {
        git::get_project_git_data(&project.path)
    } else {
        git::ProjectGitData::empty()
    }
}
