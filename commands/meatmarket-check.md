---
description: Poll for new applicants, proofs, and messages — evaluate and act
allowed-tools: ["mcp__meatmarket__my_jobs", "mcp__meatmarket__get_messages", "mcp__meatmarket__get_human_profile", "mcp__meatmarket__accept_applicant", "mcp__meatmarket__get_proofs", "mcp__meatmarket__accept_proof_autopay", "mcp__meatmarket__mark_payment_sent", "mcp__meatmarket__request_revision", "mcp__meatmarket__wallet_balance", "mcp__meatmarket__submit_review", "AskUserQuestion", "WebFetch"]
---

Run a full sweep of all MeatMarket activity, evaluate what needs attention, and take action.

## Step 1 — Gather state

1. Call `my_jobs` to get every job and its current status, applicants, and proofs.
2. Call `get_messages` to see if any new messages came in from workers.

## Step 2 — Evaluate applicants (for jobs with status "open" that have applicants)

For each applicant on an open job:

1. Call `get_human_profile` with the applicant's ID.
2. Evaluate the candidate against the job requirements:
   - Do their listed skills match what the job asks for?
   - Is their rating acceptable (3.5+ is good, 4+ is strong)?
   - Do they have relevant completed jobs in their history?
   - Is their hourly rate within the job's budget?
3. Rank the applicants from best to worst fit.
4. **If `auto_accept_candidates` is ON** and a candidate is a strong match (meets all core requirements): call `accept_applicant` to hire them automatically. Briefly note which candidate was hired and why.
5. **If `auto_accept_candidates` is OFF**: present the evaluation to the user with a clear recommendation. Ask whether to hire the top candidate or wait for more applicants.

## Step 3 — Evaluate proofs (for jobs with status "proof_submitted")

For each job with a submitted proof:

1. Call `get_proofs` with the job ID.
2. **Examine every piece of evidence thoroughly**:
   - Open and review all submitted links using WebFetch.
   - Review any image URLs by examining them visually.
   - Read all text descriptions carefully.
   - A text description alone is NEVER sufficient — you must verify the actual deliverables.
3. Check the proof against 100% of the original job parameters:
   - Does the deliverable match what was requested?
   - Is the quality acceptable?
   - Are all required items present?
4. **If the proof PASSES verification**:
   - If `auto_pay` is ON: call `accept_proof_autopay` with the job ID, worker's wallet address, payment amount, and token. If it fails (insufficient funds/gas), notify the user with the wallet address and suggest funding or manual payment.
   - If `auto_pay` is OFF: tell the user the proof looks good, show the job details, and ask them to send payment manually. Once they provide a transaction link, call `mark_payment_sent`.
5. **If the proof FAILS verification**: call `request_revision` with specific, actionable feedback explaining exactly what needs to change (minimum 10 characters).

## Step 4 — Messages

If there are new messages from workers, summarize them grouped by job (if a job ID is attached) or by sender.

## Step 5 — Summary

Present a clear summary of everything found and all actions taken or recommended:

- Jobs checked
- Applicants evaluated (hired / recommended / none)
- Proofs reviewed (paid / revision requested / pending user action)
- Messages received
- Any issues (e.g. insufficient wallet funds, failed payments)

If nothing needs attention, say so briefly.
