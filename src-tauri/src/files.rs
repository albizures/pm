use crate::error::MyError;
use std::fs;
use std::time::UNIX_EPOCH;

pub struct FileMeta {
    pub modified: u64,
    pub created: u64,
    pub size: u64,
    pub is_dir: bool,
}

impl FileMeta {
    pub fn empty() -> Self {
        Self {
            modified: 0,
            created: 0,
            size: 0,
            is_dir: false,
        }
    }
}

pub fn get_file_meta(path: &str) -> Result<FileMeta, MyError> {
    let metadata = fs::metadata(path)?;

    Ok(FileMeta {
        modified: metadata.modified()?.duration_since(UNIX_EPOCH)?.as_secs(),
        created: metadata.created()?.duration_since(UNIX_EPOCH)?.as_secs(),
        size: metadata.len(),
        is_dir: metadata.is_dir(),
    })
}

pub fn get_files_in_directory(path: &str) -> Vec<String> {
    let paths =
        fs::read_dir(path).expect(format!("Error while reading directory: {}", path).as_str());

    let mut files = Vec::new();
    for path in paths {
        files.push(path.unwrap().path().display().to_string());
    }

    files
}
