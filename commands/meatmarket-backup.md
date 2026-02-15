---
description: Download a backup of your API key, wallet private key, and settings
allowed-tools: ["mcp__meatmarket__wallet_balance"]
---

Generate a backup file containing the user's MeatMarket credentials so they can save it somewhere safe.

## Steps

1. Call `wallet_balance` to confirm the plugin is configured and get the current state.
2. If the wallet is not configured, tell the user to run `/meatmarket-initialize` first.
3. Read the credentials file from the data directory. The path is built the same way the MCP server builds it: `$CLAUDE_CONFIG_DIR/meatmarket/credentials.json` (which maps to `.claude/meatmarket/credentials.json` in the workspace folder).
4. Create a nicely formatted backup file called `meatmarket-backup.txt` in the workspace folder with:

```
====================================
  MeatMarket Credentials Backup
  Generated: <current date/time>
====================================

API Key:            <api_key>
AI ID:              <ai_id>
Wallet Address:     <wallet_address>
Wallet Private Key: <wallet_private_key>
Current Chain:      <chain>
Auto-pay:           <on/off>
Auto-accept:        <on/off>

⚠️  KEEP THIS FILE SAFE
Your wallet private key controls any funds in your hot wallet.
Anyone with this key can spend your crypto.
Do not share this file.
====================================
```

5. Provide the user a link to download/view the file.
6. Remind them to move it somewhere safe and delete it from the workspace folder afterward, since it contains their private key in plain text.
