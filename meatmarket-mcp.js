#!/usr/bin/env node
/**
 * MeatMarket MCP Server (stdio, JSON-RPC 2.0)
 *
 * Exposes every MeatMarket.fun API endpoint as an MCP tool, plus an
 * integrated EVM hot wallet for optional automatic payment settlement.
 */

const https = require("https");
const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");

// ── Chain & token configuration ────────────────────────────────────────────

const CHAINS = {
  ethereum: {
    rpc: "https://eth.llamarpc.com",
    explorer: "https://etherscan.io",
    chainId: 1,
  },
  base: {
    rpc: "https://mainnet.base.org",
    explorer: "https://basescan.org",
    chainId: 8453,
  },
  optimism: {
    rpc: "https://mainnet.optimism.io",
    explorer: "https://optimistic.etherscan.io",
    chainId: 10,
  },
  arbitrum: {
    rpc: "https://arb1.arbitrum.io/rpc",
    explorer: "https://arbiscan.io",
    chainId: 42161,
  },
};

// USDC addresses per chain
const USDC = {
  ethereum: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  base: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  optimism: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
  arbitrum: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
};

// pyUSD addresses per chain (only on ethereum and base currently)
const PYUSD = {
  ethereum: "0x6c3ea9036406852006290770BeDFcAbA0e23A0e8",
  base: "0x6c3ea9036406852006290770BeDFcAbA0e23A0e8",
};

const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
];

// ── Credentials & wallet state ─────────────────────────────────────────────

// Save credentials to a writable location. Installed plugins may live in a
// read-only directory, so __dirname is not reliable for writes.  We prefer:
//   1. $MEATMARKET_DATA_DIR (if explicitly set)
//   2. ~/.meatmarket/ (user home — always writable)
const DATA_DIR = process.env.MEATMARKET_DATA_DIR ||
  path.join(process.env.HOME || process.env.USERPROFILE || "/tmp", ".meatmarket");
try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch { /* may already exist */ }
const CREDENTIALS_PATH = path.join(DATA_DIR, "credentials.json");
const API_HOST = "meatmarket.fun";
const API_BASE = "/api/v1";

let API_KEY = process.env.MEATMARKET_API_KEY || "";
let AI_ID = process.env.MEATMARKET_AI_ID || "";
let WALLET_KEY = "";
let WALLET_ADDRESS = "";
let CHAIN = "base";
let AUTO_PAY = false;
let AUTO_ACCEPT_CANDIDATES = false;

// Load saved state
try {
  const saved = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"));
  if (!API_KEY && saved.api_key) API_KEY = saved.api_key;
  if (!AI_ID && saved.ai_id) AI_ID = saved.ai_id;
  if (saved.wallet_private_key) WALLET_KEY = saved.wallet_private_key;
  if (saved.wallet_address) WALLET_ADDRESS = saved.wallet_address;
  if (saved.chain && CHAINS[saved.chain]) CHAIN = saved.chain;
  if (typeof saved.auto_pay === "boolean") AUTO_PAY = saved.auto_pay;
  if (typeof saved.auto_accept_candidates === "boolean") AUTO_ACCEPT_CANDIDATES = saved.auto_accept_candidates;
} catch {
  // No saved state yet
}

function saveState() {
  try {
    fs.writeFileSync(
      CREDENTIALS_PATH,
      JSON.stringify(
        {
          api_key: API_KEY,
          ai_id: AI_ID,
          wallet_private_key: WALLET_KEY,
          wallet_address: WALLET_ADDRESS,
          chain: CHAIN,
          auto_pay: AUTO_PAY,
          auto_accept_candidates: AUTO_ACCEPT_CANDIDATES,
        },
        null,
        2
      ) + "\n"
    );
  } catch (e) {
    process.stderr.write(`Warning: could not save state to ${CREDENTIALS_PATH}: ${e.message}\n`);
  }
}

function initWalletIfNeeded() {
  if (!WALLET_KEY) {
    const wallet = ethers.Wallet.createRandom();
    WALLET_KEY = wallet.privateKey;
    WALLET_ADDRESS = wallet.address;
    saveState();
    return { created: true, address: WALLET_ADDRESS };
  }
  return { created: false, address: WALLET_ADDRESS };
}

function getWallet() {
  if (!WALLET_KEY) return null;
  const chainCfg = CHAINS[CHAIN];
  const provider = new ethers.JsonRpcProvider(chainCfg.rpc, chainCfg.chainId);
  return new ethers.Wallet(WALLET_KEY, provider);
}

// ── HTTP helpers ───────────────────────────────────────────────────────────

function apiRequest(method, apiPath, body) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: API_HOST,
      path: `${API_BASE}${apiPath}`,
      method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    };
    if (API_KEY) options.headers["x-api-key"] = API_KEY;

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function err(id, msg) {
  return { jsonrpc: "2.0", id, error: { code: -32000, message: msg } };
}

// ── Tool definitions ───────────────────────────────────────────────────────

const TOOLS = [
  // ─ Account ─
  {
    name: "register",
    description:
      "Register a new AI entity with MeatMarket. Returns an API key and entity ID. Also generates an EVM hot wallet. A verification email will be sent.",
    inputSchema: {
      type: "object",
      properties: {
        email: { type: "string", description: "Email address for verification" },
        name: { type: "string", description: "Display name for the AI agent" },
      },
      required: ["email", "name"],
    },
  },

  // ─ Wallet & settings ─
  {
    name: "wallet_balance",
    description:
      "Show the hot wallet's public address and balances (ETH, USDC, pyUSD) on the current chain.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "set_chain",
    description:
      "Switch the active blockchain. Affects wallet balance lookups and auto-pay transactions.",
    inputSchema: {
      type: "object",
      properties: {
        chain: {
          type: "string",
          enum: ["ethereum", "base", "optimism", "arbitrum"],
          description: "The chain to switch to",
        },
      },
      required: ["chain"],
    },
  },
  {
    name: "set_auto_pay",
    description:
      "Toggle automatic payment. When enabled, accepting a proof will automatically send the payment from the hot wallet. When disabled, you must pay manually and provide a transaction link.",
    inputSchema: {
      type: "object",
      properties: {
        enabled: {
          type: "boolean",
          description: "true to enable auto-pay, false to disable",
        },
      },
      required: ["enabled"],
    },
  },
  {
    name: "set_auto_accept_candidates",
    description:
      "Toggle automatic candidate acceptance. When enabled, the AI will evaluate applicants and automatically hire the best match. When disabled, the AI evaluates but asks the user before hiring.",
    inputSchema: {
      type: "object",
      properties: {
        enabled: {
          type: "boolean",
          description: "true to auto-accept candidates, false to require manual approval",
        },
      },
      required: ["enabled"],
    },
  },

  // ─ Workforce ─
  {
    name: "search_humans",
    description:
      "Search the MeatMarket workforce by skill, max hourly rate, or location.",
    inputSchema: {
      type: "object",
      properties: {
        skill: { type: "string", description: "Skill to search for" },
        maxRate: { type: "number", description: "Maximum hourly rate in USD" },
        location: { type: "string", description: "Geographic location filter" },
      },
    },
  },
  {
    name: "get_human_profile",
    description: "Retrieve a specific human worker's full profile by their ID.",
    inputSchema: {
      type: "object",
      properties: {
        human_id: { type: "string", description: "The human worker's ID" },
      },
      required: ["human_id"],
    },
  },

  // ─ Jobs ─
  {
    name: "post_job",
    description:
      "Broadcast a new task to the MeatMarket workforce. Humans can then apply for it.",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Job title" },
        description: { type: "string", description: "Detailed task description" },
        skills: {
          type: "array",
          items: { type: "string" },
          description: "Required skills",
        },
        pay_amount: { type: "number", description: "Payment amount in USD" },
        blockchain: {
          type: "string",
          enum: ["Base", "Ethereum", "Optimism", "Arbitrum"],
          description: "Blockchain for payment settlement",
        },
        time_limit_hours: {
          type: "number",
          description: "Hours the worker has to complete the task",
        },
        type: {
          type: "string",
          enum: ["USDC", "pyUSD"],
          description:
            "Payment token type (default: USDC). Use pyUSD for PayPal/Venmo compatibility.",
        },
      },
      required: [
        "title",
        "description",
        "skills",
        "pay_amount",
        "blockchain",
        "time_limit_hours",
      ],
    },
  },
  {
    name: "delete_job",
    description:
      "Delete an open job posting. Only works when the job status is 'open'.",
    inputSchema: {
      type: "object",
      properties: {
        job_id: { type: "string", description: "The job ID to delete" },
      },
      required: ["job_id"],
    },
  },
  {
    name: "accept_applicant",
    description: "Hire a specific human who applied for a job.",
    inputSchema: {
      type: "object",
      properties: {
        job_id: { type: "string", description: "The job ID" },
        human_id: {
          type: "string",
          description: "The human applicant's ID to hire",
        },
      },
      required: ["job_id", "human_id"],
    },
  },

  // ─ Proofs & payment ─
  {
    name: "get_proofs",
    description: "Retrieve submitted proof-of-work for a specific job.",
    inputSchema: {
      type: "object",
      properties: {
        job_id: { type: "string", description: "The job ID" },
      },
      required: ["job_id"],
    },
  },
  {
    name: "request_revision",
    description:
      "Request changes on a submitted proof. The worker is notified via message and email. Feedback must be at least 10 characters.",
    inputSchema: {
      type: "object",
      properties: {
        job_id: { type: "string", description: "The job ID" },
        feedback: {
          type: "string",
          description:
            "Detailed feedback on what needs to change (min 10 chars)",
        },
      },
      required: ["job_id", "feedback"],
    },
  },
  {
    name: "mark_payment_sent",
    description:
      "Mark a job as paid by providing the on-chain transaction link. Use this for manual payments.",
    inputSchema: {
      type: "object",
      properties: {
        job_id: { type: "string", description: "The job ID" },
        transaction_link: {
          type: "string",
          description:
            "URL to the blockchain transaction (e.g. https://basescan.org/tx/0x...)",
        },
      },
      required: ["job_id", "transaction_link"],
    },
  },
  {
    name: "accept_proof_autopay",
    description:
      "Send payment from the hot wallet after the AI has verified a proof meets all job requirements. Sends a USDC or pyUSD transfer on the current chain to the worker's wallet, then records the transaction link on MeatMarket. Called by the /meatmarket-check evaluation pipeline — not directly by users. Returns an error if the wallet has insufficient funds or gas.",
    inputSchema: {
      type: "object",
      properties: {
        job_id: { type: "string", description: "The job ID to pay" },
        worker_wallet: {
          type: "string",
          description: "The worker's EVM wallet address (0x...)",
        },
        amount: {
          type: "number",
          description: "Payment amount in token units (e.g. 50 for 50 USDC)",
        },
        token: {
          type: "string",
          enum: ["USDC", "pyUSD"],
          description: "Which stablecoin to pay with (default: USDC)",
        },
      },
      required: ["job_id", "worker_wallet", "amount"],
    },
  },

  // ─ Dashboard ─
  {
    name: "my_jobs",
    description:
      "Audit your full state: all jobs, their applicants, submitted proofs, and wallet info. Great for getting an overview of everything.",
    inputSchema: { type: "object", properties: {} },
  },

  // ─ Reviews ─
  {
    name: "submit_review",
    description:
      "Rate and review a human worker's performance after a job is done.",
    inputSchema: {
      type: "object",
      properties: {
        job_id: { type: "string", description: "The job ID" },
        human_id: { type: "string", description: "The human worker's ID" },
        rating: { type: "number", description: "Rating score (1 to 5)" },
        comment: { type: "string", description: "Optional written review" },
      },
      required: ["job_id", "human_id", "rating"],
    },
  },

  // ─ Messaging ─
  {
    name: "send_message",
    description: "Send a direct message to a human worker.",
    inputSchema: {
      type: "object",
      properties: {
        receiver_id: { type: "string", description: "The human worker's ID" },
        content: { type: "string", description: "Message content" },
        job_id: {
          type: "string",
          description: "Optional job ID for context",
        },
      },
      required: ["receiver_id", "content"],
    },
  },
  {
    name: "get_messages",
    description: "Retrieve your recent inbound messages from human workers.",
    inputSchema: { type: "object", properties: {} },
  },

  // ─ Direct offers ─
  {
    name: "send_offer",
    description:
      "Send a direct mission offer to a specific human worker, bypassing the open job board.",
    inputSchema: {
      type: "object",
      properties: {
        human_id: { type: "string", description: "Target human worker's ID" },
        title: { type: "string", description: "Offer title" },
        description: { type: "string", description: "Task description" },
        pay_amount: { type: "number", description: "Payment amount in USD" },
        blockchain: {
          type: "string",
          enum: ["Base", "Ethereum", "Optimism", "Arbitrum"],
          description: "Blockchain for payment",
        },
        time_limit_hours: {
          type: "number",
          description: "Hours to complete the task",
        },
        expires_in_hours: {
          type: "number",
          description: "Hours before the offer expires if not accepted",
        },
        type: {
          type: "string",
          enum: ["USDC", "pyUSD"],
          description:
            "Payment token type (default: USDC). Use pyUSD for PayPal/Venmo compatibility.",
        },
      },
      required: [
        "human_id",
        "title",
        "description",
        "pay_amount",
        "blockchain",
        "time_limit_hours",
      ],
    },
  },
  {
    name: "cancel_offer",
    description: "Cancel a pending direct offer you previously sent.",
    inputSchema: {
      type: "object",
      properties: {
        offer_id: { type: "string", description: "The offer ID to cancel" },
      },
      required: ["offer_id"],
    },
  },
];

// ── Tool dispatch ──────────────────────────────────────────────────────────

const NO_CREDENTIALS_MSG =
  "MeatMarket is not set up yet. Run /meatmarket-initialize first to register and save your API credentials.";

async function callTool(name, args) {
  // Allow register and wallet_balance without API key
  const NO_AUTH_TOOLS = ["register", "wallet_balance", "set_chain", "set_auto_pay", "set_auto_accept_candidates"];
  if (!NO_AUTH_TOOLS.includes(name) && !API_KEY) {
    return { status: 401, body: { error: NO_CREDENTIALS_MSG } };
  }

  switch (name) {
    // ── Account ──────────────────────────────────────────────────────────
    case "register": {
      const res = await apiRequest("POST", "/register", {
        email: args.email,
        name: args.name,
      });
      if (res.status < 400 && res.body && res.body.api_key) {
        API_KEY = res.body.api_key;
        AI_ID = res.body.ai_id || "";
        const walletInfo = initWalletIfNeeded();
        saveState();
        res.body.wallet_address = WALLET_ADDRESS;
        res.body.wallet_created = walletInfo.created;
        res.body.chain = CHAIN;
        res.body.auto_pay = AUTO_PAY;
      }
      return res;
    }

    // ── Wallet & settings ────────────────────────────────────────────────
    case "wallet_balance": {
      if (!WALLET_KEY) {
        return {
          status: 200,
          body: {
            error: "No wallet configured. Run /meatmarket-initialize to create one.",
          },
        };
      }

      const wallet = getWallet();
      const chainCfg = CHAINS[CHAIN];
      const result = {
        address: WALLET_ADDRESS,
        chain: CHAIN,
        explorer: `${chainCfg.explorer}/address/${WALLET_ADDRESS}`,
        auto_pay: AUTO_PAY,
        balances: {},
      };

      try {
        const ethBal = await wallet.provider.getBalance(WALLET_ADDRESS);
        result.balances.ETH = ethers.formatEther(ethBal);
      } catch (e) {
        result.balances.ETH = `error: ${e.message}`;
      }

      // USDC
      if (USDC[CHAIN]) {
        try {
          const usdc = new ethers.Contract(USDC[CHAIN], ERC20_ABI, wallet.provider);
          const bal = await usdc.balanceOf(WALLET_ADDRESS);
          const dec = await usdc.decimals();
          result.balances.USDC = ethers.formatUnits(bal, dec);
        } catch (e) {
          result.balances.USDC = `error: ${e.message}`;
        }
      } else {
        result.balances.USDC = "not available on this chain";
      }

      // pyUSD
      if (PYUSD[CHAIN]) {
        try {
          const py = new ethers.Contract(PYUSD[CHAIN], ERC20_ABI, wallet.provider);
          const bal = await py.balanceOf(WALLET_ADDRESS);
          const dec = await py.decimals();
          result.balances.pyUSD = ethers.formatUnits(bal, dec);
        } catch (e) {
          result.balances.pyUSD = `error: ${e.message}`;
        }
      } else {
        result.balances.pyUSD = "not available on this chain";
      }

      return { status: 200, body: result };
    }

    case "set_chain": {
      const chain = args.chain?.toLowerCase();
      if (!CHAINS[chain]) {
        return {
          status: 400,
          body: {
            error: `Invalid chain "${args.chain}". Must be one of: ${Object.keys(CHAINS).join(", ")}`,
          },
        };
      }
      CHAIN = chain;
      saveState();
      return {
        status: 200,
        body: {
          success: true,
          chain: CHAIN,
          message: `Switched to ${CHAIN}. Wallet balance lookups and auto-pay will now use this chain.`,
        },
      };
    }

    case "set_auto_pay": {
      AUTO_PAY = !!args.enabled;
      saveState();
      return {
        status: 200,
        body: {
          success: true,
          auto_pay: AUTO_PAY,
          message: AUTO_PAY
            ? "Auto-pay enabled. When you accept a proof, the plugin will automatically send payment from the hot wallet."
            : "Auto-pay disabled. You will need to send payment manually and provide the transaction link.",
        },
      };
    }

    case "set_auto_accept_candidates": {
      AUTO_ACCEPT_CANDIDATES = !!args.enabled;
      saveState();
      return {
        status: 200,
        body: {
          success: true,
          auto_accept_candidates: AUTO_ACCEPT_CANDIDATES,
          message: AUTO_ACCEPT_CANDIDATES
            ? "Auto-accept candidates enabled. The AI will evaluate applicants and automatically hire the best match for each job."
            : "Auto-accept candidates disabled. The AI will evaluate applicants but ask you before hiring anyone.",
        },
      };
    }

    // ── Auto-pay proof acceptance ────────────────────────────────────────
    case "accept_proof_autopay": {
      if (!WALLET_KEY) {
        return {
          status: 400,
          body: {
            error:
              "No wallet configured. Run /meatmarket-initialize first, then fund your wallet.",
          },
        };
      }

      const token = (args.token || "USDC").toUpperCase();
      const tokenAddresses = token === "PYUSD" ? PYUSD : USDC;
      const tokenAddress = tokenAddresses[CHAIN];

      if (!tokenAddress) {
        return {
          status: 400,
          body: {
            error: `${token} is not available on ${CHAIN}. Switch chains with set_chain or pay manually.`,
          },
        };
      }

      const wallet = getWallet();
      const chainCfg = CHAINS[CHAIN];

      try {
        const contract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);
        const decimals = await contract.decimals();
        const amountUnits = ethers.parseUnits(args.amount.toString(), decimals);

        // Check balance before sending
        const balance = await contract.balanceOf(WALLET_ADDRESS);
        if (balance < amountUnits) {
          const balFormatted = ethers.formatUnits(balance, decimals);
          return {
            status: 400,
            body: {
              error: `Insufficient ${token} balance. Wallet has ${balFormatted} ${token} but the payment requires ${args.amount} ${token}. Fund the wallet at ${WALLET_ADDRESS} on ${CHAIN}, or pay manually.`,
              wallet_address: WALLET_ADDRESS,
              chain: CHAIN,
              current_balance: balFormatted,
              required: args.amount.toString(),
            },
          };
        }

        // Send the transfer
        const tx = await contract.transfer(args.worker_wallet, amountUnits);
        const receipt = await tx.wait();
        const txLink = `${chainCfg.explorer}/tx/${receipt.hash}`;

        // Record on MeatMarket
        const apiRes = await apiRequest("PATCH", `/jobs/${args.job_id}`, {
          status: "payment_sent",
          transaction_link: txLink,
        });

        return {
          status: 200,
          body: {
            success: true,
            tx_hash: receipt.hash,
            tx_link: txLink,
            amount: args.amount,
            token,
            chain: CHAIN,
            worker_wallet: args.worker_wallet,
            api_recorded: apiRes.status < 400,
            message: `Payment of ${args.amount} ${token} sent successfully on ${CHAIN}.`,
          },
        };
      } catch (e) {
        const msg = e.message || String(e);
        // Detect common failure modes
        let advice = "Fund the wallet or pay manually instead.";
        if (msg.includes("insufficient funds")) {
          advice = `The wallet doesn't have enough ETH for gas fees on ${CHAIN}. Send some ETH to ${WALLET_ADDRESS} and try again, or pay manually.`;
        }
        return {
          status: 500,
          body: {
            error: `Auto-pay failed: ${msg}`,
            advice,
            wallet_address: WALLET_ADDRESS,
            chain: CHAIN,
          },
        };
      }
    }

    // ── Workforce ────────────────────────────────────────────────────────
    case "search_humans": {
      const params = new URLSearchParams();
      if (args.skill) params.set("skill", args.skill);
      if (args.maxRate) params.set("maxRate", String(args.maxRate));
      if (args.location) params.set("location", args.location);
      const qs = params.toString();
      return apiRequest("GET", `/humans/search${qs ? "?" + qs : ""}`);
    }

    case "get_human_profile":
      return apiRequest("GET", `/humans/${args.human_id}`);

    // ── Jobs ─────────────────────────────────────────────────────────────
    case "post_job":
      return apiRequest("POST", "/jobs", args);

    case "delete_job":
      return apiRequest("DELETE", `/jobs/${args.job_id}`);

    case "accept_applicant":
      return apiRequest("PATCH", `/jobs/${args.job_id}`, {
        status: "active",
        human_id: args.human_id,
      });

    // ── Proofs & manual payment ──────────────────────────────────────────
    case "get_proofs":
      return apiRequest("GET", `/jobs/${args.job_id}/proofs`);

    case "request_revision":
      return apiRequest("POST", `/jobs/${args.job_id}/request-revision`, {
        feedback: args.feedback,
      });

    case "mark_payment_sent":
      return apiRequest("PATCH", `/jobs/${args.job_id}`, {
        status: "payment_sent",
        transaction_link: args.transaction_link,
      });

    // ── Dashboard ────────────────────────────────────────────────────────
    case "my_jobs":
      return apiRequest("GET", "/myjobs");

    // ── Reviews ──────────────────────────────────────────────────────────
    case "submit_review":
      return apiRequest("POST", "/reviews", {
        job_id: args.job_id,
        reviewer_id: AI_ID,
        reviewee_id: args.human_id,
        rating: args.rating,
        comment: args.comment || "",
      });

    // ── Messaging ────────────────────────────────────────────────────────
    case "send_message": {
      const body = { receiver_id: args.receiver_id, content: args.content };
      if (args.job_id) body.job_id = args.job_id;
      return apiRequest("POST", "/messages", body);
    }

    case "get_messages":
      return apiRequest("GET", "/messages");

    // ── Offers ───────────────────────────────────────────────────────────
    case "send_offer":
      return apiRequest("POST", "/offers", args);

    case "cancel_offer":
      return apiRequest("PATCH", `/offers/${args.offer_id}`, {
        status: "canceled",
      });

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

// ── JSON-RPC 2.0 / MCP message handler ────────────────────────────────────

async function handleMessage(msg) {
  const { id, method, params } = msg;

  switch (method) {
    case "initialize":
      return {
        jsonrpc: "2.0",
        id,
        result: {
          protocolVersion: "2024-11-05",
          serverInfo: { name: "meatmarket", version: "1.5.0" },
          capabilities: { tools: {} },
        },
      };

    case "notifications/initialized":
      return null;

    case "tools/list":
      return { jsonrpc: "2.0", id, result: { tools: TOOLS } };

    case "tools/call": {
      const toolName = params?.name;
      const toolArgs = params?.arguments || {};
      try {
        const res = await callTool(toolName, toolArgs);
        const text =
          typeof res.body === "string"
            ? res.body
            : JSON.stringify(res.body, null, 2);
        const isError = res.status >= 400;
        return {
          jsonrpc: "2.0",
          id,
          result: { content: [{ type: "text", text }], isError },
        };
      } catch (e) {
        return err(id, e.message);
      }
    }

    default:
      if (id !== undefined) {
        return {
          jsonrpc: "2.0",
          id,
          error: { code: -32601, message: `Method not found: ${method}` },
        };
      }
      return null;
  }
}

// ── stdio transport ────────────────────────────────────────────────────────

let buffer = "";

process.stdin.setEncoding("utf8");
process.stdin.on("data", async (chunk) => {
  buffer += chunk;
  const lines = buffer.split("\n");
  buffer = lines.pop();

  for (const line of lines) {
    if (!line.trim()) continue;
    try {
      const msg = JSON.parse(line);
      const response = await handleMessage(msg);
      if (response) {
        process.stdout.write(JSON.stringify(response) + "\n");
      }
    } catch (e) {
      // malformed JSON — skip
    }
  }
});
