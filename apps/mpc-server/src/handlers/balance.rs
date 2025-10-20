use actix_web::{web, HttpResponse, Result};
use crate::models::*;
use crate::services::mpc_service::MpcService;

pub async fn get_balance(
    service: web::Data<MpcService>,
    request: web::Json<BalanceRequest>,
) -> Result<HttpResponse> {
    match service.get_balance(request.into_inner()).await {
        Ok(response) => Ok(HttpResponse::Ok().json(response)),
        Err(e) => Ok(HttpResponse::BadRequest().json(serde_json::json!({
            "error": e.to_string()
        }))),
    }
}
