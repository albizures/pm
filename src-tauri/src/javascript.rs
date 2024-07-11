use std::{fs::File, io::BufReader, path::PathBuf};

use serde::Deserialize;

use crate::files;

#[derive(Debug, Deserialize)]
struct PkgJson {
    name: Option<String>,
}

pub fn get_project_name(path: &str) -> String {
    let parts: Vec<&str> = path.split("/").collect();
    let default = parts[parts.len() - 1].to_string();

    let mut file = PathBuf::from(path);

    file.push("package.json");

    if let Ok(file) = File::open(file) {
        let reader = BufReader::new(file);
        let pkg: PkgJson = serde_json::from_reader(reader)
            .expect(format!("Error while reading package.json in {}", path).as_str());
        return pkg.name.unwrap_or(default).to_string();
    };

    default
}

pub fn get_project_deps_size(_path: &str, files: &Vec<String>) -> u64 {
    let mut size = 0;

    for file in files {
        if file.contains("node_modules") {
            let meta = files::get_file_meta(&file).unwrap_or(files::FileMeta::empty());
            size += meta.size
        }
    }

    size
}
