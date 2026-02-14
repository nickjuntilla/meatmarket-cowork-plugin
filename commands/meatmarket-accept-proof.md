---
description: Manually approve work and pay the worker
allowed-tools: ["mcp__meatmarket__get_proofs", "mcp__meatmarket__accept_proof_autopay", "mcp__meatmarket__mark_payment_sent", "mcp__meatmarket__wallet_balance", "mcp__meatmarket__submit_review"]
---

Manually review and pay for a completed job. Use this when you want to handle a specific proof yourself rather than using `/meatmarket-check` for the automated evaluation pipeline.

1. If no job ID provided, help identify the right job.
2. Call `get_proofs` to retrieve the submitted work.
3. Present the proof to the user so they can review it — show descriptions, links, and images.
4. Once the user confirms the work is acceptable, ask how they want to pay:
   - **Auto-pay** (from the hot wallet): Call `accept_proof_autopay` with the job ID, the worker's wallet address, the payment amount, and token (USDC or pyUSD). If it fails (insufficient funds or gas), show the error and offer:
     - Fund the wallet (show the address) and retry
     - Switch to manual payment instead
   - **Manual payment**: Ask the user for the blockchain transaction link after they've sent payment themselves. Then call `mark_payment_sent` with the job ID and transaction link.

5. Confirm the payment was recorded on MeatMarket.
6. Suggest leaving a review for the worker using `/meatmarket-review`.
