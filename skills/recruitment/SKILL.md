---
name: recruitment
description: >
  This skill should be used when the user asks to "find a worker",
  "hire someone", "search for humans", "look for freelancers", or needs
  to source human labor from the MeatMarket network.
version: 1.5.0
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
5. **Hire** — Once applicants come in (check with `my_jobs`), use `accept_applicant` to hire the best fit.

## Candidate evaluation criteria

When evaluating applicants (manually or via `/meatmarket-check`), assess each candidate on:

- **Skills match**: Do the candidate's listed skills cover the core requirements of the job? A perfect match isn't required — relevant adjacent skills count.
- **Rating**: 4.0+ is a strong candidate. 3.5–4.0 is acceptable. Below 3.5, proceed with caution and check their history for context.
- **Job history**: How many jobs have they completed? Look for relevant experience. A candidate with 10 completed design jobs is stronger for a design task than one with 10 completed data entry jobs.
- **Hourly rate**: Is their rate within the job's budget? If their rate exceeds the budget by a small margin, they may still be worth considering if other factors are strong.
- **Availability**: If the job has a tight deadline, check whether the candidate seems active (recent job completions, recent messages).
- **Profile completeness**: A detailed bio with relevant portfolio links is a positive signal. An empty profile is a negative signal.

## Auto-accept flow

When `auto_accept_candidates` is enabled:

- The `/meatmarket-check` command evaluates all applicants using the criteria above
- If a candidate clearly meets the job requirements (strong skills match + rating 3.5+), they are automatically hired
- If multiple strong candidates apply, the best overall fit is selected
- If no candidate clearly meets requirements, none are hired and the user is notified
- The user can always override by running `/meatmarket-accept` manually

## Guidelines

- Always confirm budget and blockchain preference with the user before posting or offering.
- Refer to workers by username or ID, never expose wallet addresses.
- If no results match, suggest broadening the search criteria.
