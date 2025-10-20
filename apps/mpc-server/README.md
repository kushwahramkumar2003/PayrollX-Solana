# PayrollX MPC Server

A Rust-based Multi-Party Computation (MPC) server for threshold signature generation and signing in the PayrollX system.

## Features

- **Threshold Signature Scheme**: Implements Ed25519 threshold signatures for Solana
- **Key Generation**: Generate wallet key shares with configurable threshold (default: 2-of-3)
- **Secure Signing**: Sign Solana transactions using threshold signatures
- **JWT Authentication**: Secure API endpoints with JWT validation
- **Automatic Cleanup**: Expired key shares are automatically cleaned up
- **High Performance**: Built with Actix-web for high concurrency

## Architecture

```
src/
├── main.rs                 # Server initialization and configuration
├── config.rs              # Configuration management
├── errors.rs              # Custom error types and handling
├── models/                # Data models and request/response types
│   └── mod.rs
├── services/              # Core business logic
│   ├── mod.rs
│   ├── mpc_engine.rs      # Threshold signature implementation
│   └── key_management.rs  # Key share storage and management
├── routes/                # HTTP route handlers
│   ├── mod.rs
│   ├── keygen.rs          # Key generation endpoint
│   ├── signing.rs         # Signing endpoint
│   └── health.rs          # Health check endpoint
└── middleware/            # HTTP middleware
    ├── mod.rs
    └── auth.rs            # JWT authentication middleware
```

## API Endpoints

### POST /api/mpc/keygen

Generate new wallet key shares with threshold signature support.

**Request:**

```json
{
  "threshold": 2,
  "total_shares": 3,
  "request_id": "uuid"
}
```

**Response:**

```json
{
  "wallet_id": "uuid",
  "public_key": "base58_pubkey",
  "share_ids": ["share_1", "share_2", "share_3"],
  "threshold": 2
}
```

### POST /api/mpc/sign

Sign a message using threshold signatures.

**Request:**

```json
{
  "wallet_id": "uuid",
  "message": "base64_encoded_transaction",
  "share_ids": ["share_1", "share_2"]
}
```

**Response:**

```json
{
  "signature": "base64_signature",
  "public_key": "base58_pubkey"
}
```

### GET /health

Health check endpoint.

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Configuration

Environment variables:

- `HOST`: Server host (default: 0.0.0.0)
- `PORT`: Server port (default: 8080)
- `JWT_SECRET`: JWT signing secret
- `SHARE_RETENTION_HOURS`: Key share retention period (default: 24)
- `LOG_LEVEL`: Logging level (default: info)

## Security Features

- **JWT Authentication**: All API endpoints (except /health) require valid JWT tokens
- **Key Isolation**: Key shares are stored in memory and never exposed in API responses
- **Automatic Cleanup**: Expired key shares are automatically removed
- **Signature Validation**: All generated signatures are verified before returning
- **Rate Limiting**: Built-in protection against abuse (configurable)

## Running the Server

### Development

```bash
cargo run
```

### Production

```bash
cargo run --release
```

### Docker

```bash
docker build -t payrollx-mpc-server .
docker run -p 8080:8080 --env-file .env payrollx-mpc-server
```

## Integration with PayrollX

The MPC server integrates with the PayrollX system through the wallet service:

1. **Key Generation**: Wallet service calls `/api/mpc/keygen` to create new employee wallets
2. **Transaction Signing**: During payroll execution, wallet service calls `/api/mpc/sign` to sign transactions
3. **Authentication**: All requests include JWT tokens for secure communication

## Error Handling

The server provides detailed error responses for common scenarios:

- `KEY_NOT_FOUND`: Requested wallet or key shares not found
- `INVALID_THRESHOLD`: Invalid threshold configuration
- `SIGNATURE_ERROR`: Signature generation or verification failed
- `AUTH_ERROR`: Authentication/authorization failed
- `INVALID_REQUEST`: Malformed request data

## Monitoring

- Health check endpoint for service monitoring
- Structured logging with correlation IDs
- Automatic cleanup metrics
- Request/response logging

## Development

### Prerequisites

- Rust 1.70+
- Cargo

### Building

```bash
cargo build
```

### Testing

```bash
cargo test
```

### Linting

```bash
cargo clippy
```

## License

This project is part of the PayrollX system and is proprietary software.
