use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct KeygenRequest {
    pub threshold: u32,
    pub total_shares: u32,
    pub request_id: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct KeygenResponse {
    pub wallet_id: String,
    pub public_key: String,
    pub share_ids: Vec<String>,
    pub threshold: u32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SignRequest {
    pub wallet_id: String,
    pub message: String, // base64 encoded transaction
    pub share_ids: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SignResponse {
    pub signature: String, // base64 encoded signature
    pub public_key: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct HealthResponse {
    pub status: String,
    pub timestamp: String,
}

#[derive(Debug, Clone)]
pub struct KeyShare {
    pub id: String,
    pub wallet_id: String,
    pub share_data: Vec<u8>,
    pub created_at: chrono::DateTime<chrono::Utc>,
    pub expires_at: chrono::DateTime<chrono::Utc>,
}

impl KeyShare {
    pub fn new(wallet_id: String, share_data: Vec<u8>, retention_hours: u64) -> Self {
        let now = chrono::Utc::now();
        Self {
            id: Uuid::new_v4().to_string(),
            wallet_id,
            share_data,
            created_at: now,
            expires_at: now + chrono::Duration::hours(retention_hours as i64),
        }
    }
    
    pub fn is_expired(&self) -> bool {
        chrono::Utc::now() > self.expires_at
    }
}

#[derive(Debug, Clone)]
pub struct WalletInfo {
    pub wallet_id: String,
    pub public_key: String,
    pub threshold: u32,
    pub total_shares: u32,
    pub created_at: chrono::DateTime<chrono::Utc>,
}