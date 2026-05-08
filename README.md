# Bitcoin Testnet4 Faucet

A complete Bitcoin Testnet4 environment with unlimited faucet access.

## Features
- ✅ Private Bitcoin Testnet4 nodes
- ✅ Unlimited faucet requests
- ✅ No authentication required
- ✅ Docker support for 24/7 hosting
- ✅ Simple REST API

## Quick Start

```bash
# Clone
git clone https://github.com/Sniper109-star/bitcoin-testnet-4.git
cd bitcoin-testnet-4

# Configure
cp faucet-app/.env.example faucet-app/.env
nano faucet-app/.env

# Run
docker-compose up -d
```

## Faucet API

**Request coins:**
```bash
curl -X POST http://localhost:5000/api/faucet \
  -H "Content-Type: application/json" \
  -d '{"address": "your_testnet_address"}'
```

**Response:**
```json
{
  "success": true,
  "txid": "abc123...",
  "amount": 1,
  "address": "your_testnet_address",
  "message": "✅ Sent 1 BTC to your_testnet_address"
}
```

## For 24/7 Cloud Hosting

Deploy to any cloud with Docker:
- AWS EC2
- DigitalOcean
- Google Cloud
- Azure

```bash
docker-compose up -d --build
```