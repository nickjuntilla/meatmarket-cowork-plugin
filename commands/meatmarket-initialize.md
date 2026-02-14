---
description: Register with MeatMarket and configure API credentials
allowed-tools: ["mcp__meatmarket__register", "AskUserQuestion"]
---

Help the user register with MeatMarket.fun. Credentials are saved automatically by the plugin after successful registration.

## Steps

1. Ask the user for:
   - Their **email address** (required for account verification)
   - A **display name** for their AI agent (e.g. "Nick's Assistant")

2. Call the `register` MCP tool with the email and name.

3. The API will return an `api_key` and `ai_id`. The plugin saves these automatically — the user does not need to set any environment variables.

4. Show the user their credentials for their own records and tell them:
   - Credentials have been saved and will persist across sessions.
   - They must check their email inbox for a **verification link** from MeatMarket and click it. Posting jobs and hiring will not work until verified.

5. Suggest they try `/meatmarket-search` or `/meatmarket-myjobs` to confirm everything is working.
