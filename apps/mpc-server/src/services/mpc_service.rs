use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;
use chrono::Utc;
use solana_sdk::pubkey::Pubkey;
use solana_client::rpc_client::RpcClient;
use solana_sdk::signature::Signature;
use anyhow::Result;

use crate::models::*;

#[derive(Clone)]
pub struct MpcService {
    keys: Arc<RwLock<HashMap<Uuid, MpcKey>>>,
    signatures: Arc<RwLock<HashMap<Uuid, MpcSignature>>>,
    rpc_client: RpcClient,
}

impl MpcService {
    pub fn new() -> Self {
        let rpc_url = std::env::var("SOLANA_RPC_URL")
            .unwrap_or_else(|_| "https://api.devnet.solana.com".to_string());
        
        Self {
            keys: Arc::new(RwLock::new(HashMap::new())),
            signatures: Arc::new(RwLock::new(HashMap::new())),
            rpc_client: RpcClient::new(rpc_url),
        }
    }

    pub async fn generate_keys(&self, request: KeygenRequest) -> Result<KeygenResponse, Box<dyn std::error::Error>> {
        let key_id = Uuid::new_v4();
        
        // Generate individual key pairs for each participant
        let mut participant_keys = Vec::new();
        
        for i in 0..request.participant_count {
            let keypair = solana_sdk::signer::keypair::Keypair::new();
            let public_key = keypair.pubkey().to_string();
            let private_key = bs58::encode(keypair.to_bytes()).into_string();
            
            participant_keys.push(ParticipantKey {
                participant_id: i,
                public_key: public_key.clone(),
                private_key_share: private_key, // In production, this should be encrypted
            });
        }
        
        // Store the key set
        let mpc_key = MpcKey {
            id: key_id,
            organization_id: request.organization_id,
            public_key: Vec::new(), // Will be set after aggregation
            threshold: request.participant_count,
            total_participants: request.participant_count,
            created_at: Utc::now(),
        };
        
        {
            let mut keys = self.keys.write().await;
            keys.insert(key_id, mpc_key);
        }
        
        Ok(KeygenResponse {
            key_id: key_id.to_string(),
            aggregated_public_key: "".to_string(), // Will be set after aggregation
            participant_keys,
            created_at: Utc::now().to_rfc3339(),
        })
    }

    pub async fn aggregate_keys(&self, request: AggregateKeysRequest) -> Result<AggregateKeysResponse, Box<dyn std::error::Error>> {
        // Parse public keys
        let pubkeys: Result<Vec<Pubkey>, _> = request.participant_keys
            .iter()
            .map(|key_str| key_str.parse::<Pubkey>())
            .collect();
        
        let pubkeys = pubkeys?;
        
        // For n-of-n multisig, we need all participants to sign
        // The aggregated address is typically a Program Derived Address (PDA)
        // For simplicity, we'll use the first public key as the aggregated address
        // In a real implementation, you would derive a proper multisig address
        let aggregated_address = pubkeys[0].to_string();
        
        Ok(AggregateKeysResponse {
            aggregated_address,
            participant_count: pubkeys.len() as u32,
            created_at: Utc::now().to_rfc3339(),
        })
    }

    pub async fn sign_step_one(&self, request: SignStepOneRequest) -> Result<SignStepOneResponse, Box<dyn std::error::Error>> {
        let signature_id = Uuid::new_v4();
        
        // Create transaction data for signing
        let transaction_data = serde_json::to_string(&request)?;
        
        // Store the signature session
        let mpc_signature = MpcSignature {
            id: signature_id,
            key_id: Uuid::new_v4(), // This should be the actual key ID
            message: transaction_data.as_bytes().to_vec(),
            partial_signatures: Vec::new(),
            final_signature: None,
            status: SignatureStatus::Pending,
            created_at: Utc::now(),
        };
        
        {
            let mut signatures = self.signatures.write().await;
            signatures.insert(signature_id, mpc_signature);
        }
        
        Ok(SignStepOneResponse {
            signature_id: signature_id.to_string(),
            transaction_data,
            participant_id: 0, // This should be determined by the participant
            created_at: Utc::now().to_rfc3339(),
        })
    }

    pub async fn sign_step_two(&self, request: SignStepTwoRequest) -> Result<SignStepTwoResponse, Box<dyn std::error::Error>> {
        let signature_id = Uuid::parse_str(&request.signature_id)?;
        
        // Get the signature session
        let mut signature = {
            let mut signatures = self.signatures.write().await;
            signatures.get_mut(&signature_id).ok_or("Signature session not found")?.clone()
        };
        
        // Decode the private key share
        let private_key_bytes = bs58::decode(&request.private_key_share).into_vec()?;
        let keypair = solana_sdk::signer::keypair::Keypair::from_bytes(&private_key_bytes)?;
        
        // Create a simple transaction for signing (in real implementation, this would be more complex)
        let transaction_data = request.transaction_data.as_bytes();
        let signature_bytes = keypair.sign_message(transaction_data);
        
        // Store the partial signature
        signature.partial_signatures.push(PartialSignatureData {
            participant_id: request.participant_id,
            signature: signature_bytes.to_bytes().to_vec(),
            created_at: Utc::now(),
        });
        
        signature.status = SignatureStatus::Partial;
        
        {
            let mut signatures = self.signatures.write().await;
            signatures.insert(signature_id, signature);
        }
        
        Ok(SignStepTwoResponse {
            signature_id: signature_id.to_string(),
            partial_signature: bs58::encode(signature_bytes.to_bytes()).into_string(),
            participant_id: request.participant_id,
            created_at: Utc::now().to_rfc3339(),
        })
    }

    pub async fn aggregate_signatures(&self, request: AggregateSignaturesRequest) -> Result<AggregateSignaturesResponse, Box<dyn std::error::Error>> {
        let signature_id = Uuid::parse_str(&request.signature_id)?;
        
        // Get the signature session
        let mut signature = {
            let mut signatures = self.signatures.write().await;
            signatures.get_mut(&signature_id).ok_or("Signature session not found")?.clone()
        };
        
        // For n-of-n multisig, we need all signatures
        if request.partial_signatures.len() != signature.partial_signatures.len() {
            return Err("Not all participants have signed".into());
        }
        
        // In a real implementation, you would properly aggregate the signatures
        // For now, we'll use the first signature as the final signature
        let final_signature = if let Some(first_sig) = request.partial_signatures.first() {
            bs58::decode(&first_sig.signature).into_vec()?
        } else {
            return Err("No signatures to aggregate".into());
        };
        
        // Update signature status
        signature.final_signature = Some(final_signature.clone());
        signature.status = SignatureStatus::Completed;
        
        {
            let mut signatures = self.signatures.write().await;
            signatures.insert(signature_id, signature);
        }
        
        // In a real implementation, you would broadcast the transaction here
        let transaction_id = "mock_transaction_id".to_string();
        
        Ok(AggregateSignaturesResponse {
            signature_id: signature_id.to_string(),
            final_signature: bs58::encode(&final_signature).into_string(),
            transaction_id,
            created_at: Utc::now().to_rfc3339(),
        })
    }

    pub async fn get_balance(&self, request: BalanceRequest) -> Result<BalanceResponse, Box<dyn std::error::Error>> {
        let address = request.address.parse::<Pubkey>()?;
        let balance = self.rpc_client.get_balance(&address)?;
        
        Ok(BalanceResponse {
            address: request.address,
            balance,
            lamports: balance,
            sol: balance as f64 / 1_000_000_000.0, // Convert lamports to SOL
        })
    }

    pub async fn request_airdrop(&self, request: AirdropRequest) -> Result<AirdropResponse, Box<dyn std::error::Error>> {
        let address = request.address.parse::<Pubkey>()?;
        let amount = request.amount.unwrap_or(1_000_000_000); // Default to 1 SOL
        
        let signature = self.rpc_client.request_airdrop(&address, amount)?;
        
        Ok(AirdropResponse {
            address: request.address,
            amount,
            transaction_id: signature.to_string(),
            created_at: Utc::now().to_rfc3339(),
        })
    }
}
