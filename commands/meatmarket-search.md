---
description: Search for human workers by skill, rate, or location
allowed-tools: ["mcp__meatmarket__search_humans", "mcp__meatmarket__get_human_profile"]
---

Help the user find human workers on MeatMarket.

1. Ask the user what kind of worker they need — what skills, budget range, or location preferences they have.
2. Call `search_humans` with the relevant filters.
3. Present matching workers in a clear summary: username/ID, skills, rating, bio snippet, and hourly rate.
4. If the user wants more detail on a specific worker, call `get_human_profile`.
5. Offer to proceed with either:
   - `/meatmarket-offer` to send a direct offer to a chosen worker
   - `/meatmarket-post` to broadcast an open job posting
