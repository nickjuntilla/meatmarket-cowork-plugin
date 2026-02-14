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

4. Tell the user:
   - Their credentials and wallet have been saved automatically.
   - Show them their **wallet address** so they can fund it if they want to use auto-pay.
   - They must check their email for a **verification link** from MeatMarket and click it.
   - They can change their chain with `/meatmarket-settings` and check their balance with `/meatmarket-wallet`.
   - Auto-pay is off by default. They can enable it in `/meatmarket-settings` once they've funded the wallet.

5. Suggest they try `/meatmarket-search` or `/meatmarket-myjobs` to get started.
