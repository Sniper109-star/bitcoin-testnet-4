const express = require('express');
const bitcoin = require('bitcoinjs-lib');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

const RPC_URL = process.env.RPC_URL;
const RPC_HOST = process.env.RPC_HOST || 'localhost';
const RPC_PORT = process.env.RPC_PORT || 19001;
const RPC_USER = process.env.RPC_USER;
const RPC_PASS = process.env.RPC_PASS;
const PAYOUT_AMOUNT = process.env.PAYOUT_AMOUNT || 1; // 1 BTC
const FAUCET_ADDRESS = process.env.FAUCET_ADDRESS;
const FAUCET_PRIVATE_KEY = process.env.FAUCET_PRIVATE_KEY;

// Determine if using public RPC URL or local node
const USE_PUBLIC_RPC = !!RPC_URL;

// Bitcoin RPC call - supports both local and public nodes
async function bitcoinRPC(method, params = []) {
  try {
    if (USE_PUBLIC_RPC) {
      // Public RPC endpoint (read-only, no auth)
      const response = await axios.post(RPC_URL, {
        jsonrpc: '1.0',
        id: 'faucet',
        method: method,
        params: params,
      });
      
      if (response.data.error) {
        throw new Error(response.data.error.message || 'RPC Error');
      }
      return response.data.result;
    } else {
      // Local node with authentication
      const response = await axios.post(`http://${RPC_HOST}:${RPC_PORT}/`, {
        jsonrpc: '1.0',
        id: 'faucet',
        method: method,
        params: params,
      }, {
        auth: {
          username: RPC_USER,
          password: RPC_PASS,
        }
      });
      
      if (response.data.error) {
        throw new Error(response.data.error.message || 'RPC Error');
      }
      return response.data.result;
    }
  } catch (error) {
    console.error('RPC Error:', error.message);
    throw error;
  }
}

// Faucet endpoint - UNLIMITED REQUESTS
app.post('/api/faucet', async (req, res) => {
  try {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({ error: 'Bitcoin address required' });
    }

    // Validate Bitcoin address
    try {
      bitcoin.address.toOutputScript(address);
    } catch (e) {
      return res.status(400).json({ error: 'Invalid Bitcoin address' });
    }

    // Send coins - NO LIMITS!
    const txid = await bitcoinRPC('sendfrom', ['', address, parseFloat(PAYOUT_AMOUNT)]);

    res.json({
      success: true,
      txid: txid,
      amount: PAYOUT_AMOUNT,
      address: address,
      message: `✅ Sent ${PAYOUT_AMOUNT} BTC to ${address}`
    });

  } catch (error) {
    res.status(500).json({ 
      error: 'Faucet error', 
      details: error.message 
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    faucet_running: true,
    using_public_rpc: USE_PUBLIC_RPC,
    rpc_endpoint: USE_PUBLIC_RPC ? RPC_URL : `http://${RPC_HOST}:${RPC_PORT}`
  });
});

// Stats
app.get('/api/stats', async (req, res) => {
  try {
    const info = await bitcoinRPC('getblockchaininfo');
    res.json({
      network_limit: 'UNLIMITED',
      cooldown: 'NONE',
      using_public_rpc: USE_PUBLIC_RPC,
      blockchain_info: {
        chain: info.chain,
        blocks: info.blocks,
        difficulty: info.difficulty
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Bitcoin Testnet4 Faucet running on http://localhost:${PORT}`);
  console.log(`📊 Payout per request: ${PAYOUT_AMOUNT} BTC`);
  console.log(`♾️  Request limit: UNLIMITED`);
  console.log(`🔌 RPC Endpoint: ${USE_PUBLIC_RPC ? RPC_URL : `http://${RPC_HOST}:${RPC_PORT}`}`);
});