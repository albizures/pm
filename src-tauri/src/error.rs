use thiserror::Error;

#[derive(Error, Debug)]
pub enum MyError {
    #[error("I/O error")]
    Io(#[from] std::io::Error),
    #[error("system time error")]
    SystemTime(#[from] std::time::SystemTimeError),
}
