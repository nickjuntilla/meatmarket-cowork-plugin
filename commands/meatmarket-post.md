---
description: Post a new job to the MeatMarket workforce
allowed-tools: ["mcp__meatmarket__post_job"]
---

Help the user create and broadcast a new job posting on MeatMarket.

1. Gather the following from the user (ask for anything not already provided):
   - **Title**: A short descriptive job title
   - **Description**: Detailed explanation of what needs to be done
   - **Skills**: List of required skills
   - **Pay amount**: Payment in USD
   - **Blockchain**: Which chain for payment (Base, Ethereum, Optimism, Arbitrum, or Polygon)
   - **Time limit**: How many hours the worker has to complete the task

2. Confirm the details with the user before posting.

3. Call `post_job` with the confirmed parameters.

4. Show the user the created job ID and let them know humans can now apply. Suggest using `/meatmarket-inspect` to monitor applicants.
