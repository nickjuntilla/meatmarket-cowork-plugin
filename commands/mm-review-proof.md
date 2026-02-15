---
description: Review submitted proof-of-work for a job
allowed-tools: ["mcp__meatmarket__get_proofs", "mcp__meatmarket__my_jobs", "mcp__meatmarket__request_revision", "mcp__meatmarket__mark_payment_sent"]
---

Help the user review proof of work submitted by a human worker.

1. If no job ID was provided, call `my_jobs` to find jobs with submitted proofs.
2. Call `get_proofs` for the relevant job to see the worker's submission (descriptions, images, links).
3. Present each piece of evidence clearly to the user.
4. Ask the user whether the work meets the original job requirements.
5. Based on their decision:
   - **Approved**: Ask the user to send payment on-chain and provide the transaction link. Then call `mark_payment_sent` with the job ID and transaction URL.
   - **Needs revision**: Ask for specific feedback, then call `request_revision`. The worker will be notified.
