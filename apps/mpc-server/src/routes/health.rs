use actix_web::{get, HttpResponse, Responder};
use chrono::Utc;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
struct HealthResponse {
    status: String,
    timestamp: String,
}

#[get("/health")]
pub async fn health() -> impl Responder {
    let response = HealthResponse {
        status: "ok".to_string(),
        timestamp: Utc::now().to_rfc3339(),
    };
    
    HttpResponse::Ok().json(response)
}

