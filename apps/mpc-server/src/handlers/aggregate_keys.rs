use actix_web::{web, HttpResponse, Result};
use crate::models::*;
use crate::services::mpc_service::MpcService;

pub async fn aggregate_keys(
    service: web::Data<MpcService>,
    request: web::Json<AggregateKeysRequest>,
) -> Result<HttpResponse> {
    match service.aggregate_keys(request.into_inner()).await {
        Ok(response) => Ok(HttpResponse::Ok().json(response)),
        Err(e) => Ok(HttpResponse::BadRequest().json(serde_json::json!({
            "error": e.to_string()
        }))),
    }
}
