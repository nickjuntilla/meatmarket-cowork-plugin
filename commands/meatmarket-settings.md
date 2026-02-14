---
description: Change chain, toggle auto-pay, or toggle auto-accept candidates
allowed-tools: ["mcp__meatmarket__set_chain", "mcp__meatmarket__set_auto_pay", "mcp__meatmarket__set_auto_accept_candidates", "mcp__meatmarket__wallet_balance", "AskUserQuestion"]
---

Help the user configure their MeatMarket plugin settings.

1. Ask what they'd like to change:
   - **Switch chain**: Choose between ethereum, base, optimism, or arbitrum. Call `set_chain` with their choice. This affects wallet balance lookups and where auto-pay transactions are sent.
   - **Toggle auto-pay**: Call `set_auto_pay` with true or false. When enabled, the AI will automatically send payment from the hot wallet after verifying a proof meets all job requirements. When disabled, the user pays manually and provides a transaction link.
   - **Toggle auto-accept candidates**: Call `set_auto_accept_candidates` with true or false. When enabled, the AI will evaluate applicants and automatically hire the best match. When disabled, the AI evaluates but asks the user before hiring.

2. After making changes, call `wallet_balance` to show the user their current state on the new chain (so they can see if they have funds there).

3. If they enabled auto-pay, remind them they need both:
   - Enough USDC or pyUSD to cover payments
   - Some ETH for gas fees

4. If they enabled auto-accept candidates, explain that the AI will review each applicant's profile, skills, rating, and history before hiring — it won't accept unqualified candidates.
