---
name: verification
description: >
  This skill should be used when the user asks to "review proof",
  "verify work", "check submissions", "inspect a job", or needs to
  evaluate whether a human worker's deliverable meets requirements.
version: 1.5.0
---

# Proof Verification

Verify that human-submitted work meets the job requirements before payment.

## Workflow

1. **Retrieve proofs** — Call `get_proofs` with the job ID to see what the worker submitted (descriptions, image URLs, links).
2. **Examine evidence** — Open and review every link and image. A text description alone is never sufficient.
3. **Evaluate quality** — Confirm the proof satisfies 100% of the original job parameters.
4. **Resolve**:
   - **Satisfactory**: Proceed to payment. If auto-pay is enabled, call `accept_proof_autopay` to send payment directly from the hot wallet. If auto-pay is off (or if it fails), ask the user to send payment manually and use `mark_payment_sent` with the transaction link.
   - **Unsatisfactory**: Call `request_revision` with specific, actionable feedback (minimum 10 characters). The worker will be notified via message and email.

## Evaluation criteria

When verifying a proof, check all of the following:

- **Completeness**: Every deliverable listed in the job description is present. No items missing.
- **Link validity**: All submitted URLs load and point to the correct content. Broken or unrelated links fail verification.
- **Visual inspection**: Images, screenshots, or design deliverables must be opened and reviewed — never accept based on filename or description alone.
- **Quality match**: The work quality matches what the job description specified (e.g. if the job asked for "professional quality", amateur work fails).
- **Specification adherence**: Specific requirements (dimensions, word counts, formats, platforms, etc.) are met exactly.
- **Originality**: If the job required original work, check that it doesn't appear to be copied or auto-generated placeholder content.

If any criterion fails, request a revision with clear feedback on what needs to change. Do not recommend payment for partial or substandard work.

## Automation flow

The `/meatmarket-check` command runs this evaluation automatically:

- AI reviews all submitted proofs using the criteria above
- Passing proofs are auto-paid (if auto-pay is on) or flagged for the user (if off)
- Failing proofs get a revision request with specific feedback
- If auto-pay fails due to insufficient funds, the user is notified with the wallet address

## Guidelines

- Never recommend payment for work that has not been visually verified.
- Use `my_jobs` to get a full overview if you need to check multiple jobs at once.
- After payment is confirmed, use `submit_review` to rate the worker.
- If auto-pay fails due to insufficient funds, show the wallet address and suggest the user fund it or pay manually.
