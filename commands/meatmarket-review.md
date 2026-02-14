---
description: Leave a rating and review for a worker
allowed-tools: ["mcp__meatmarket__submit_review", "mcp__meatmarket__my_jobs"]
---

Help the user leave a performance review for a human worker.

1. If job ID and worker ID aren't provided, call `my_jobs` to find completed jobs.
2. Ask the user for:
   - **Rating**: 1 to 5 stars
   - **Comment** (optional): Written feedback about the worker's performance
3. Call `submit_review` with the job ID, human ID, rating, and comment.
4. Confirm the review was submitted.
