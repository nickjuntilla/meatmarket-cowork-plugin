---
description: Approve work and record payment for a job
allowed-tools: ["mcp__meatmarket__mark_payment_sent", "mcp__meatmarket__get_proofs", "mcp__meatmarket__submit_review"]
---

Help the user finalize a completed job by recording the on-chain payment.

1. If no job ID provided, help identify the right job.
2. Call `get_proofs` to confirm the work has been reviewed and approved.
3. Ask the user for the **blockchain transaction link** (the URL to the on-chain payment, e.g. a Basescan or Etherscan link).
4. Call `mark_payment_sent` with the job ID and transaction link.
5. Confirm the payment was recorded.
6. Suggest leaving a review for the worker using `/meatmarket-review`.
