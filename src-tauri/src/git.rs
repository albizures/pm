use std::collections::HashMap;

use git2::{Error, Repository, RepositoryState, StatusOptions};
use serde::Serialize;
use specta::{functions, Type};

use crate::project;

#[derive(Serialize, Type)]
enum GitStatus {
    Untracked,
    Modified,
    Deleted,
    Renamed,
    Conflicted,
}

#[derive(Serialize, Type)]
pub struct GitStatusEntry {
    file: String,
    status: GitStatus,
}

#[derive(Serialize, Type)]
pub struct GitProjectEntry {
    pub project: project::ProjectEntry,
    pub changes: Vec<GitStatusEntry>,
}

#[derive(Serialize, Type)]
pub struct ProjectGitData {
    #[serde(rename = "remoteOrigin")]
    pub remote_origin: Option<String>,
    pub changes: Vec<GitStatusEntry>,
    pub branches: Vec<String>,
    #[serde(rename = "currentBranch")]
    pub current_branch: Option<String>,
    #[serde(rename = "commitCount")]
    pub commit_count: u64,
    #[serde(rename = "lastCommitDate")]
    pub last_commit_date: i64,
}

impl ProjectGitData {
    pub fn empty() -> ProjectGitData {
        ProjectGitData {
            remote_origin: None,
            changes: Vec::new(),
            branches: Vec::new(),
            current_branch: None,
            commit_count: 0,
            last_commit_date: 0,
        }
    }
}

pub fn get_git_project(path: &str) -> Result<Repository, Error> {
    Repository::open(path)
}

pub fn get_git_state(repo: &Repository) -> String {
    let state: RepositoryState = repo.state();

    let state_name = match state {
        RepositoryState::Clean => "Clean",
        RepositoryState::Merge => "Merge",
        RepositoryState::Revert => "Revert",
        RepositoryState::RevertSequence => "RevertSequence",
        RepositoryState::CherryPick => "CherryPick",
        RepositoryState::CherryPickSequence => "CherryPickSequence",
        RepositoryState::Bisect => "Bisect",
        RepositoryState::Rebase => "Rebase",
        RepositoryState::RebaseInteractive => "RebaseInteractive",
        RepositoryState::RebaseMerge => "RebaseMerge",
        RepositoryState::ApplyMailbox => "ApplyMailbox",
        RepositoryState::ApplyMailboxOrRebase => "ApplyMailboxOrRebase",
    };

    String::from(state_name)
}

pub fn get_git_status(repo: &Repository) -> Vec<GitStatusEntry> {
    let mut opts = StatusOptions::new();

    opts.include_untracked(true);
    opts.recurse_untracked_dirs(true);

    let statuses = repo
        .statuses(Some(&mut opts))
        .expect("Error while getting statuses");

    let mut files = Vec::<GitStatusEntry>::new();

    // let mut output = String::new();
    for entry in statuses.iter() {
        let path = entry.path().unwrap();
        let status = entry.status();
        let file_status = match status {
            git2::Status::WT_NEW | git2::Status::INDEX_NEW => GitStatusEntry {
                file: path.to_string(),
                status: GitStatus::Untracked,
            },
            git2::Status::INDEX_MODIFIED | git2::Status::WT_MODIFIED => GitStatusEntry {
                file: path.to_string(),
                status: GitStatus::Modified,
            },
            git2::Status::WT_DELETED | git2::Status::INDEX_DELETED => GitStatusEntry {
                file: path.to_string(),
                status: GitStatus::Deleted,
            },
            git2::Status::WT_RENAMED | git2::Status::INDEX_RENAMED => GitStatusEntry {
                file: path.to_string(),
                status: GitStatus::Renamed,
            },
            git2::Status::CONFLICTED => GitStatusEntry {
                file: path.to_string(),
                status: GitStatus::Conflicted,
            },
            _ => {
                if (status.is_index_new() && status.is_wt_modified())
                    || (status.is_index_modified() && status.is_wt_modified())
                {
                    GitStatusEntry {
                        file: path.to_string(),
                        status: GitStatus::Modified,
                    }
                } else if status.is_index_new() && status.is_wt_deleted() {
                    GitStatusEntry {
                        file: path.to_string(),
                        status: GitStatus::Deleted,
                    }
                } else {
                    println!("{}:  {:?} skipped", path, status);
                    continue;
                }
            }
        };

        files.push(file_status);
    }

    files
}

pub fn get_projects_with_uncommitted_changes(
    projects: &HashMap<String, project::ProjectEntry>,
) -> Vec<GitProjectEntry> {
    let mut projects_with_changes = Vec::new();

    for (_, project) in projects.iter() {
        if project.types.contains(&project::ProjectType::Git) {
            if let Ok(repo) = get_git_project(&project.path) {
                let changes = get_git_status(&repo);
                if changes.len() > 0 {
                    projects_with_changes.push(GitProjectEntry {
                        project: project.clone(),
                        changes,
                    });
                }
            }
        }
    }

    projects_with_changes
}

pub fn get_project_git_data(path: &str) -> ProjectGitData {
    let repo = get_git_project(path).unwrap();
    let remote_origin = get_project_remote_origin(&repo);
    let changes = get_git_status(&repo);
    let branches: Vec<String> = repo
        .branches(Some(git2::BranchType::Local))
        .unwrap()
        .map(|branch| {
            let (branch, _) = branch.unwrap();
            branch.name().unwrap().unwrap().to_string()
        })
        .collect();
    let head_result = repo.head();

    if head_result.is_err() {
        return ProjectGitData {
            remote_origin,
            changes,
            branches,
            current_branch: None,
            commit_count: 0,
            last_commit_date: 0,
        };
    }

    let head = repo.head().unwrap();
    let current_branch = head.name().map(|b| b.to_string());

    let last_commit = repo
        .revparse_single("HEAD")
        .unwrap()
        .peel_to_commit()
        .unwrap();
    let commit_count = count_commit(&repo);
    let last_commit_date = last_commit.time().seconds();

    ProjectGitData {
        remote_origin,
        changes,
        branches,
        current_branch,
        commit_count,
        last_commit_date,
    }
}

pub fn get_project_remote_url(repo: &Repository, name: &str) -> Option<String> {
    let remote = repo.find_remote(name).ok()?;
    let url = remote.url()?;
    Some(url.to_string())
}

pub fn get_project_remote_origin(project: &Repository) -> Option<String> {
    get_project_remote_url(project, "origin")
}

pub fn is_path_ignored(path: &str, path_to_check: &str) -> bool {
    let repo = get_git_project(path);

    if repo.is_err() {
        return false;
    }

    let repo = repo.unwrap();

    repo.is_path_ignored(path_to_check).unwrap_or(false)
}

fn count_commit(repo: &Repository) -> u64 {
    let mut revwalk = repo.revwalk().unwrap();
    revwalk.push_head().unwrap();
    revwalk.count() as u64
}
