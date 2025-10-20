use actix_web::{post, web, HttpResponse, Responder};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use crate::services::mpc_engine::MpcEngine;

#[derive(Deserialize)]
pub struct KeygenRequest {
    pub threshold: usize,
    pub total_shares: usize,
    pub request_id: String,
}

#[derive(Serialize)]
pub struct KeygenResponse {
    pub wallet_id: String,
    pub public_key: String,
    pub share_ids: Vec<String>,
    pub threshold: usize,
}

#[post("/keygen")]
pub async fn keygen(
    req: web::Json<KeygenRequest>,
    engine: web::Data<Arc<MpcEngine>>,
) -> impl Responder {
    match engine.generate_key(req.threshold, req.total_shares) {
        Ok(wallet) => {
            let response = KeygenResponse {
                wallet_id: wallet.wallet_id,
                public_key: base64::encode(wallet.public_key.as_bytes()),
                share_ids: wallet.shares.iter().map(|s| s.share_id.clone()).collect(),
                threshold: wallet.threshold,
            };
            HttpResponse::Ok().json(response)
        }
        Err(e) => HttpResponse::InternalServerError().json(serde_json::json!({
            "error": e
        })),
    }
}