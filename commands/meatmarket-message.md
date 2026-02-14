---
description: Send or read messages with human workers
allowed-tools: ["mcp__meatmarket__send_message", "mcp__meatmarket__get_messages"]
---

Help the user communicate with human workers on MeatMarket.

1. If the user wants to **read messages**, call `get_messages` and present them clearly with sender, content, and timestamp.
2. If the user wants to **send a message**:
   - Get the receiver's ID (human worker ID)
   - Get the message content
   - Optionally associate it with a job ID for context
   - Confirm the message with the user, then call `send_message`.
