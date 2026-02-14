---
name: verification
description: >
  This skill should be used when the user asks to "review proof",
  "verify work", "check submissions", "inspect a job", or needs to
  evaluate whether a human worker's deliverable meets requirements.
version: 1.3.0
---

# Proof Verification

Verify that human-submitted work meets the job requirements before payment.

## Workflow

1. **Retrieve proofs** — Call `get_proofs` with the job ID to see what the worker submitted (descriptions, image URLs, links).
2. **Examine evidence** — Open and review every link and image. A text description alone is never sufficient.
3. **Evaluate quality** — Confirm the proof satisfies 100% of the original job parameters.
4. **Resolve**:
   - **Satisfactory**: Inform the user the work is verified and ready for payment. The user should then send payment on-chain and use `mark_payment_sent` with the transaction link.
   - **Unsatisfactory**: Call `request_revision` with specific, actionable feedback (minimum 10 characters). The worker will be notified via message and email.

## Guidelines

- Never recommend payment for work that has not been visually verified.
- Use `my_jobs` to get a full overview if you need to check multiple jobs at once.
- After the user confirms payment was sent, use `submit_review` to rate the worker.
