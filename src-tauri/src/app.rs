use std::{collections::HashMap, sync::Mutex};

use crate::project;
pub struct AppState(pub Mutex<App>);

type ProjectMap = HashMap<String, project::ProjectEntry>;

impl AppState {
    pub fn new(projects: ProjectMap) -> Self {
        Self(Mutex::new(App { projects }))
    }

    pub fn get(&self) -> std::sync::MutexGuard<App> {
        self.0.lock().unwrap()
    }
}

pub struct App {
    pub projects: ProjectMap,
}
