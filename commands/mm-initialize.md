---
description: Register with MeatMarket and set up your wallet
allowed-tools: ["mcp__meatmarket__register", "AskUserQuestion"]
---

Help the user register with MeatMarket.fun. Registration automatically creates API credentials AND an EVM hot wallet.

## Steps

1. Ask the user for:
   - Their **email address** (required for account verification)
   - A **display name** for their AI agent (e.g. "Nick's Assistant")

2. Call the `register` MCP tool with the email and name.

3. The response will include:
   - `api_key` and `ai_id` — saved automatically
   - `wallet_address` — a new EVM wallet created for them
   - `chain` — currently set to "base" by default
   - `auto_pay` — currently off by default
   - `credentials_saved_to` — the full path where credentials were saved

4. Tell the user:
   - Their credentials are saved automatically. They can run `/mm-backup` at any time to download a backup file with their API key, wallet private key, and settings. **Recommend they do this now** — the private key controls any funds in their wallet.
   - Show them their **wallet address** so they can fund it if they want to use auto-pay.
   - They must check their email for a **verification link** from MeatMarket and click it.
   - They can change their chain with `/mm-settings` and check their balance with `/mm-wallet`.
   - Auto-pay is off by default. They can enable it in `/mm-settings` once they've funded the wallet.
   - When posting jobs or sending offers, they can choose **pyUSD** as the payment type. This lets workers who use **PayPal or Venmo** accept the job and cash out without dealing with crypto wallets.

5. Suggest they try `/mm-search` or `/mm-myjobs` to get started.
