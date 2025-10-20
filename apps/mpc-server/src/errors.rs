use actix_web::{HttpResponse, ResponseError};
use serde::{Deserialize, Serialize};
use std::fmt;

#[derive(Debug, thiserror::Error)]
pub enum MpcError {
    #[error("Key not found: {0}")]
    KeyNotFound(String),
    
    #[error("Invalid threshold: {0}")]
    InvalidThreshold(String),
    
    #[error("Signature error: {0}")]
    SignatureError(String),
    
    #[error("Authentication error: {0}")]
    AuthError(String),
    
    #[error("Internal server error: {0}")]
    InternalError(String),
    
    #[error("Invalid request: {0}")]
    InvalidRequest(String),
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ErrorResponse {
    pub error: String,
    pub message: String,
    pub code: String,
}

impl ResponseError for MpcError {
    fn error_response(&self) -> HttpResponse {
        let (status, code) = match self {
            MpcError::KeyNotFound(_) => (actix_web::http::StatusCode::NOT_FOUND, "KEY_NOT_FOUND"),
            MpcError::InvalidThreshold(_) => (actix_web::http::StatusCode::BAD_REQUEST, "INVALID_THRESHOLD"),
            MpcError::SignatureError(_) => (actix_web::http::StatusCode::INTERNAL_SERVER_ERROR, "SIGNATURE_ERROR"),
            MpcError::AuthError(_) => (actix_web::http::StatusCode::UNAUTHORIZED, "AUTH_ERROR"),
            MpcError::InvalidRequest(_) => (actix_web::http::StatusCode::BAD_REQUEST, "INVALID_REQUEST"),
            MpcError::InternalError(_) => (actix_web::http::StatusCode::INTERNAL_SERVER_ERROR, "INTERNAL_ERROR"),
        };

        HttpResponse::build(status).json(ErrorResponse {
            error: code.to_string(),
            message: self.to_string(),
            code: code.to_string(),
        })
    }
}

impl From<anyhow::Error> for MpcError {
    fn from(err: anyhow::Error) -> Self {
        MpcError::InternalError(err.to_string())
    }
}