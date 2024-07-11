use crate::app;
use crate::git;
use crate::project;

#[tauri::command]
#[specta::specta]
pub fn is_path_ignored(
    path: String,
    path_to_check: String,
    state: tauri::State<app::AppState>,
) -> Result<bool, String> {
    let projects = &state.0.lock().unwrap().projects;
    let project = projects.get(&path).unwrap();

    if project.types.contains(&project::ProjectType::Git) {
        Ok(git::is_path_ignored(&project.path, &path_to_check))
    } else {
        Ok(true)
    }
}
