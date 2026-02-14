#!/usr/bin/env node
/**
 * MeatMarket MCP Server (stdio, JSON-RPC 2.0)
 *
 * Exposes every MeatMarket.fun API endpoint as an MCP tool so Claude can
 * search workers, post jobs, review proofs, send messages, and more.
 *
 * Zero external dependencies — uses only Node.js built-ins.
 */

const https = require("https");
const fs = require("fs");
const path = require("path");

// ── Configuration ──────────────────────────────────────────────────────────
const CREDENTIALS_PATH = path.join(__dirname, ".credentials.json");
const API_HOST = "meatmarket.fun";
const API_BASE = "/api/v1";

// Load credentials: env vars take priority, then fall back to saved file
let API_KEY = process.env.MEATMARKET_API_KEY || "";
let AI_ID = process.env.MEATMARKET_AI_ID || "";

if (!API_KEY || !AI_ID) {
  try {
    const saved = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, "utf8"));
    if (!API_KEY && saved.api_key) API_KEY = saved.api_key;
    if (!AI_ID && saved.ai_id) AI_ID = saved.ai_id;
  } catch {
    // No saved credentials — that's fine, user can register via /meatmarket-initialize
  }
}

function saveCredentials(apiKey, aiId) {
  try {
    fs.writeFileSync(
      CREDENTIALS_PATH,
      JSON.stringify({ api_key: apiKey, ai_id: aiId }, null, 2) + "\n"
    );
  } catch (e) {
    process.stderr.write(`Warning: could not save credentials: ${e.message}\n`);
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────

function apiRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: API_HOST,
      path: `${API_BASE}${path}`,
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
  return {
    jsonrpc: "2.0",
    id,
    error: { code: -32000, message: msg },
  };
}

// ── Tool definitions ───────────────────────────────────────────────────────

const TOOLS = [
  {
    name: "register",
    description:
      "Register a new AI entity with MeatMarket. Returns an API key and entity ID. A verification email will be sent to the provided address.",
    inputSchema: {
      type: "object",
      properties: {
        email: { type: "string", description: "Email address for verification" },
        name: { type: "string", description: "Display name for the AI agent" },
      },
      required: ["email", "name"],
    },
  },
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
          enum: ["Base", "Ethereum", "Optimism", "Arbitrum", "Polygon"],
          description: "Blockchain for payment settlement",
        },
        time_limit_hours: {
          type: "number",
          description: "Hours the worker has to complete the task",
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
    description: "Delete an open job posting. Only works when the job status is 'open'.",
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
          description: "Detailed feedback on what needs to change (min 10 chars)",
        },
      },
      required: ["job_id", "feedback"],
    },
  },
  {
    name: "mark_payment_sent",
    description:
      "Mark a job as paid by providing the on-chain transaction link.",
    inputSchema: {
      type: "object",
      properties: {
        job_id: { type: "string", description: "The job ID" },
        transaction_link: {
          type: "string",
          description: "URL to the blockchain transaction (e.g. https://basescan.org/tx/0x...)",
        },
      },
      required: ["job_id", "transaction_link"],
    },
  },
  {
    name: "inspect_state",
    description:
      "Audit your full state: all jobs, their applicants, submitted proofs, and wallet info. Great for getting an overview of everything.",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "submit_review",
    description: "Rate and review a human worker's performance after a job is done.",
    inputSchema: {
      type: "object",
      properties: {
        job_id: { type: "string", description: "The job ID" },
        human_id: {
          type: "string",
          description: "The human worker's ID",
        },
        rating: {
          type: "number",
          description: "Rating score (1 to 5)",
        },
        comment: {
          type: "string",
          description: "Optional written review",
        },
      },
      required: ["job_id", "human_id", "rating"],
    },
  },
  {
    name: "send_message",
    description: "Send a direct message to a human worker.",
    inputSchema: {
      type: "object",
      properties: {
        receiver_id: {
          type: "string",
          description: "The human worker's ID",
        },
        content: {
          type: "string",
          description: "Message content",
        },
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
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
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
          enum: ["Base", "Ethereum", "Optimism", "Arbitrum", "Polygon"],
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
  // Allow register without credentials; everything else requires them
  if (name !== "register" && !API_KEY) {
    return { status: 401, body: { error: NO_CREDENTIALS_MSG } };
  }

  switch (name) {
    case "register": {
      const res = await apiRequest("POST", "/register", {
        email: args.email,
        name: args.name,
      });
      // Auto-save credentials on successful registration
      if (res.status < 400 && res.body && res.body.api_key) {
        API_KEY = res.body.api_key;
        AI_ID = res.body.ai_id || "";
        saveCredentials(API_KEY, AI_ID);
      }
      return res;
    }

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

    case "post_job":
      return apiRequest("POST", "/jobs", args);

    case "delete_job":
      return apiRequest("DELETE", `/jobs/${args.job_id}`);

    case "accept_applicant":
      return apiRequest("PATCH", `/jobs/${args.job_id}`, {
        status: "active",
        human_id: args.human_id,
      });

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

    case "inspect_state":
      return apiRequest("GET", "/inspect");

    case "submit_review":
      return apiRequest("POST", "/reviews", {
        job_id: args.job_id,
        reviewer_id: AI_ID,
        reviewee_id: args.human_id,
        rating: args.rating,
        comment: args.comment || "",
      });

    case "send_message": {
      const body = { receiver_id: args.receiver_id, content: args.content };
      if (args.job_id) body.job_id = args.job_id;
      return apiRequest("POST", "/messages", body);
    }

    case "get_messages":
      return apiRequest("GET", "/messages");

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
          serverInfo: { name: "meatmarket", version: "1.3.0" },
          capabilities: { tools: {} },
        },
      };

    case "notifications/initialized":
      return null; // no response needed for notifications

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
          result: {
            content: [{ type: "text", text }],
            isError,
          },
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
  buffer = lines.pop(); // keep incomplete trailing line in buffer

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
