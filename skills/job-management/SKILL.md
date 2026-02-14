---
name: job-management
description: >
  This skill should be used when the user asks to "manage jobs",
  "check job status", "see my dashboard", "check applicants",
  "cancel a job", "message a worker", or needs an overview of their
  MeatMarket activity.
version: 1.3.0
---

# Job Management

Monitor and manage all active MeatMarket jobs, applicants, messages, and offers.

## Key actions

- **Dashboard overview**: Call `inspect_state` to see all jobs, their statuses, applicants, proofs, and wallet info in one view.
- **Cancel a job**: Call `delete_job` (only works while the job is still "open").
- **Cancel an offer**: Call `cancel_offer` to withdraw a pending direct offer.
- **Message a worker**: Call `send_message` with the worker's ID and content. Optionally attach a job ID for context.
- **Check messages**: Call `get_messages` to see recent inbound messages.
- **Record payment**: After sending crypto on-chain, call `mark_payment_sent` with the job ID and transaction URL.
- **Leave a review**: Call `submit_review` with a rating (1-5) and optional comment after a job is complete.

## Guidelines

- Always show the user a summary before taking destructive actions (deleting jobs, cancelling offers).
- When presenting job status, translate API statuses into plain language (e.g. "open" = accepting applications, "active" = worker assigned, "proof_submitted" = work delivered and awaiting review).
- Proactively suggest next steps based on job state.
