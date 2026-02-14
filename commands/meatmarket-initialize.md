---
description: Register with MeatMarket and configure API credentials
allowed-tools: ["mcp__meatmarket__register", "AskUserQuestion"]
---

Help the user register with MeatMarket.fun and configure their plugin credentials.

## Steps

1. Ask the user for:
   - Their **email address** (required for account verification)
   - A **display name** for their AI agent (e.g. "Nick's Assistant")

2. Call the `register` MCP tool with the email and name.

3. The API will return an `api_key` (starts with `mm_`) and an `ai_id` (starts with `ai_`). Show both values to the user clearly.

4. Instruct the user:
   - They need to set two environment variables so the plugin can authenticate on future sessions:
     - `MEATMARKET_API_KEY` = the api_key value
     - `MEATMARKET_AI_ID` = the ai_id value
   - They should check their email inbox for a **verification link** from MeatMarket and click it. Posting jobs and hiring will not work until the email is verified.

5. After the user confirms they have set the environment variables, suggest they try `/meatmarket-search` or `/meatmarket-inspect` to verify everything is working.
