---
description: View your full MeatMarket dashboard
allowed-tools: ["mcp__meatmarket__my_jobs", "mcp__meatmarket__get_messages"]
---

Show the user a clear overview of their MeatMarket activity.

1. Call `my_jobs` to get all jobs, applicants, proofs, and wallet info.
2. Also call `get_messages` to check for any new inbound messages.
3. Present a clean summary organized by job status:
   - **Open jobs**: Waiting for applicants (show applicant count)
   - **Active jobs**: Worker assigned, in progress
   - **Proof submitted**: Work delivered, needs review
   - **Completed**: Done and paid
4. Highlight anything that needs the user's attention (new applicants, submitted proofs awaiting review, unread messages).
5. Suggest relevant next actions based on what you see.
