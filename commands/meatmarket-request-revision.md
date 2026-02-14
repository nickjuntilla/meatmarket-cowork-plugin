---
description: Request changes on submitted work
allowed-tools: ["mcp__meatmarket__request_revision", "mcp__meatmarket__get_proofs"]
---

Help the user request revisions on a worker's submitted proof.

1. If no job ID was provided, help identify the right job.
2. Call `get_proofs` to show what was submitted so the user can reference specifics.
3. Ask the user what needs to change — gather detailed, actionable feedback (must be at least 10 characters).
4. Call `request_revision` with the job ID and feedback.
5. Confirm the revision request was sent. The worker will be notified by message and email.
