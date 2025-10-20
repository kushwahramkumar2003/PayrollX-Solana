use actix_web::{post, web, HttpResponse, Responder};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use crate::services::mpc_engine::MpcEngine;

#[derive(Deserialize)]
pub struct SignRequest {
    pub wallet_id: String,
    pub message: String, // base64 encoded
    pub share_ids: Vec<String>,
}

#[derive(Serialize)]
pub struct SignResponse {
    pub signature: String, // base64 encoded
    pub public_key: String,
}

#[post("/sign")]
pub async fn sign(
    req: web::Json<SignRequest>,
    engine: web::Data<Arc<MpcEngine>>,
) -> impl Responder {
    let message = match base64::decode(&req.message) {
        Ok(m) => m,
        Err(e) => return HttpResponse::BadRequest().json(serde_json::json!({
            "error": format!("Invalid base64 message: {}", e)
        })),
    };

    match engine.sign_message(&req.wallet_id, &message, req.share_ids.clone()) {
        Ok(signature) => {
            HttpResponse::Ok().json(SignResponse {
                signature: base64::encode(signature.to_bytes()),
                public_key: req.wallet_id.clone(),
            })
        }
        Err(e) => HttpResponse::InternalServerError().json(serde_json::json!({
            "error": e
        })),
    }
}