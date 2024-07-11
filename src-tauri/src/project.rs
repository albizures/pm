use serde::Serialize;
use specta::Type;
use std::collections::{HashMap, HashSet};

use crate::error::MyError;
use crate::files;
use crate::javascript;

#[derive(Serialize, Type, PartialEq, Eq, Clone, Debug, Hash)]
pub enum ProjectType {
    Javascript,
    Rust,
    Elixir,
    Gleam,
    Python,
    Git,
    Erlang,
}

#[derive(Serialize, Type, Clone)]
pub struct ProjectEntry {
    pub name: String,
    pub path: String,
    pub created: u64,
    pub modified: u64,
    pub size: u64,
    pub deps_size: u64,
    pub types: Vec<ProjectType>,
}

pub fn find_projects(path: &str) -> Result<HashMap<String, ProjectEntry>, MyError> {
    let files = files::get_files_in_directory(path);

    let mut projects = HashMap::new();
    for file in files {
        let metadata = files::get_file_meta(&file)?;

        if !metadata.is_dir {
            continue;
        }

        let types = get_project_types(&file);

        if types.len() == 0 {
            let nested_projects = find_projects(file.as_str())?;
            projects.extend(nested_projects);
            // let's not add the directory itself as a project
            continue;
        }

        let deps_size = get_deps_size(path, &types)?;
        let name = get_project_name(&file, &types);

        projects.insert(
            file.clone(),
            ProjectEntry {
                name,
                path: String::from(file),
                created: metadata.created,
                modified: metadata.modified,
                size: metadata.size,
                deps_size,
                types,
            },
        );
    }

    Ok(projects)
}

pub fn get_project_types(path: &str) -> Vec<ProjectType> {
    let files = files::get_files_in_directory(path);

    let mut types = HashSet::new();
    for file in files {
        if file.ends_with("/package.json") {
            types.insert(ProjectType::Javascript);
        }
        if file.ends_with("/Cargo.toml") {
            types.insert(ProjectType::Rust);
        }
        if file.ends_with("/mix.exs") {
            types.insert(ProjectType::Elixir);
        }
        if file.ends_with("/gleam.toml") {
            types.insert(ProjectType::Gleam);
        }
        if file.ends_with("/.git") {
            types.insert(ProjectType::Git);
        }
        if file.ends_with("/rebar.config") {
            types.insert(ProjectType::Erlang);
        }

        if file.ends_with("/Pipfile") || file.contains("requirements.txt") {
            types.insert(ProjectType::Python);
        }
    }

    types.into_iter().collect()
}

pub fn get_deps_size(path: &str, types: &Vec<ProjectType>) -> Result<u64, MyError> {
    let files = files::get_files_in_directory(path);
    let mut size = 0;

    if types.contains(&ProjectType::Javascript) {
        size += javascript::get_project_deps_size(path, &files)
    }

    Ok(size)
}

pub fn get_project_name(path: &str, types: &Vec<ProjectType>) -> String {
    if types.contains(&ProjectType::Javascript) {
        return javascript::get_project_name(path);
    }

    let parts: Vec<&str> = path.split("/").collect();
    parts[parts.len() - 1].to_string()
}
