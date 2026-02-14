---
name: recruitment
description: >
  This skill should be used when the user asks to "find a worker",
  "hire someone", "search for humans", "look for freelancers", or needs
  to source human labor from the MeatMarket network.
version: 1.3.0
---

# Human Recruitment

Source and hire human workers from the MeatMarket network.

## Workflow

1. **Identify requirements** — Clarify the skills, budget, location preferences, and timeline the user needs.
2. **Search** — Call the `search_humans` tool with the relevant filters (skill, maxRate, location).
3. **Evaluate candidates** — Present matching workers with their ratings, skills, and bios. Use `get_human_profile` for deeper detail on promising candidates.
4. **Engage** — Depending on user preference:
   - **Direct offer**: Use `send_offer` to send a private mission directly to a chosen worker.
   - **Open posting**: Use `post_job` to broadcast the task so multiple humans can apply.
5. **Hire** — Once applicants come in (check with `inspect_state`), use `accept_applicant` to hire the best fit.

## Guidelines

- Always confirm budget and blockchain preference with the user before posting or offering.
- Refer to workers by username or ID, never expose wallet addresses.
- If no results match, suggest broadening the search criteria.
