use actix_web::{web, HttpResponse, Result};
use crate::models::*;
use crate::services::mpc_service::MpcService;

pub async fn generate_keys(
    service: web::Data<MpcService>,
    request: web::Json<KeygenRequest>,
) -> Result<HttpResponse> {
    match service.generate_keys(request.into_inner()).await {
        Ok(response) => Ok(HttpResponse::Ok().json(response)),
        Err(e) => Ok(HttpResponse::BadRequest().json(serde_json::json!({
            "error": e.to_string()
        }))),
    }
}
