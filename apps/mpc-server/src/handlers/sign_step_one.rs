use actix_web::{web, HttpResponse, Result};
use crate::models::*;
use crate::services::mpc_service::MpcService;

pub async fn sign_step_one(
    service: web::Data<MpcService>,
    request: web::Json<SignStepOneRequest>,
) -> Result<HttpResponse> {
    match service.sign_step_one(request.into_inner()).await {
        Ok(response) => Ok(HttpResponse::Ok().json(response)),
        Err(e) => Ok(HttpResponse::BadRequest().json(serde_json::json!({
            "error": e.to_string()
        }))),
    }
}
