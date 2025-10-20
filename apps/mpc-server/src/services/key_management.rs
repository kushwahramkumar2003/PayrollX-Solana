use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use crate::models::{KeyShare, WalletInfo};

#[allow(dead_code)]
#[derive(Debug, Clone)]
pub struct KeyManager {
    shares: Arc<RwLock<HashMap<String, Vec<KeyShare>>>>, // wallet_id -> shares
    wallets: Arc<RwLock<HashMap<String, WalletInfo>>>, // wallet_id -> wallet_info
}

impl KeyManager {
    #[allow(dead_code)]
    pub fn new() -> Self {
        Self {
            shares: Arc::new(RwLock::new(HashMap::new())),
            wallets: Arc::new(RwLock::new(HashMap::new())),
        }
    }
    
    #[allow(dead_code)]
    pub async fn store_wallet(&self, wallet_info: WalletInfo) {
        let mut wallets = self.wallets.write().await;
        wallets.insert(wallet_info.wallet_id.clone(), wallet_info);
    }
    
    #[allow(dead_code)]
    pub async fn get_wallet(&self, wallet_id: &str) -> Option<WalletInfo> {
        let wallets = self.wallets.read().await;
        wallets.get(wallet_id).cloned()
    }
    
    #[allow(dead_code)]
    pub async fn store_shares(&self, wallet_id: String, shares: Vec<KeyShare>) {
        let mut shares_map = self.shares.write().await;
        shares_map.insert(wallet_id, shares);
    }
    
    #[allow(dead_code)]
    pub async fn get_shares(&self, wallet_id: &str) -> Option<Vec<KeyShare>> {
        let shares_map = self.shares.read().await;
        shares_map.get(wallet_id).cloned()
    }
    
    #[allow(dead_code)]
    pub async fn get_shares_by_ids(&self, wallet_id: &str, share_ids: &[String]) -> Option<Vec<KeyShare>> {
        let shares_map = self.shares.read().await;
        if let Some(all_shares) = shares_map.get(wallet_id) {
            let filtered_shares: Vec<KeyShare> = all_shares
                .iter()
                .filter(|share| share_ids.contains(&share.id))
                .cloned()
                .collect();
            
            if filtered_shares.len() == share_ids.len() {
                Some(filtered_shares)
            } else {
                None
            }
        } else {
            None
        }
    }
    
    #[allow(dead_code)]
    pub async fn cleanup_expired_keys(&self) {
        let mut shares_map = self.shares.write().await;
        let mut wallets_map = self.wallets.write().await;
        
        // Remove expired shares
        for (_wallet_id, shares) in shares_map.iter_mut() {
            shares.retain(|share| !share.is_expired());
        }
        
        // Remove wallets with no shares
        let expired_wallets: Vec<String> = shares_map
            .iter()
            .filter(|(_, shares)| shares.is_empty())
            .map(|(wallet_id, _)| wallet_id.clone())
            .collect();
        
        for wallet_id in expired_wallets {
            shares_map.remove(&wallet_id);
            wallets_map.remove(&wallet_id);
        }
        
        log::info!("Cleaned up expired keys. Remaining wallets: {}", wallets_map.len());
    }
    
    #[allow(dead_code)]
    pub async fn remove_wallet(&self, wallet_id: &str) {
        let mut shares_map = self.shares.write().await;
        let mut wallets_map = self.wallets.write().await;
        
        shares_map.remove(wallet_id);
        wallets_map.remove(wallet_id);
    }
}

