# Build stage
FROM rust:1.85-alpine AS builder

WORKDIR /app

# Install dependencies
RUN apk add --no-cache musl-dev

# Copy Cargo manifest (Cargo.lock may not exist in dev)
COPY Cargo.toml ./

# Copy source code
COPY src ./src

# Build the application
RUN cargo build --release

# Runtime stage
FROM alpine:latest

WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache ca-certificates curl

# Copy the binary from builder stage
COPY --from=builder /app/target/release/mpc-server /app/mpc-server

# Expose port
EXPOSE 8080

# Run the application
CMD ["./mpc-server"]