use actix_web::{web, App, HttpServer, middleware::Logger};
use dotenv::dotenv;
use std::sync::Arc;

mod routes;
mod services;
mod models;
mod middleware;
mod config;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    env_logger::init_from_env(env_logger::Env::new().default_filter_or("info"));

    let config = config::Config::from_env();
    let host = config.host.clone();
    let port = config.port;

    log::info!("Starting MPC server on {host}:{port}");

    // Create MPC engine
    let mpc_engine = Arc::new(services::mpc_engine::MpcEngine::new());

    HttpServer::new(move || {
        App::new()
            .wrap(Logger::default())
            .wrap(actix_cors::Cors::permissive())
            .app_data(web::Data::new(config.clone()))
            .app_data(web::Data::new(mpc_engine.clone()))
            .service(
                web::scope("/api/mpc")
                    .service(routes::keygen::keygen)
                    .service(routes::signing::sign)
            )
            .service(routes::health::health)
    })
    .bind((host.as_str(), port))?
    .run()
    .await
}