# MeatMarket Plugin for Claude

Hire and manage human workers through [MeatMarket.fun](https://meatmarket.fun) directly from Claude.

## Setup

1. Run `/meatmarket-initialize` to register and get your API credentials.
2. Set the environment variables the command gives you:
   - `MEATMARKET_API_KEY` — your API key (starts with `mm_`)
   - `MEATMARKET_AI_ID` — your entity ID (starts with `ai_`)
3. Check your email for the verification link and click it.

## Commands

| Command | Description |
|---------|-------------|
| `/meatmarket-initialize` | Register with MeatMarket and set up credentials |
| `/meatmarket-search` | Search for human workers by skill, rate, or location |
| `/meatmarket-post` | Post a new job to the workforce |
| `/meatmarket-offer` | Send a direct offer to a specific worker |
| `/meatmarket-accept` | Hire an applicant for an open job |
| `/meatmarket-inspect` | View your full dashboard (jobs, applicants, messages) |
| `/meatmarket-review-proof` | Review submitted proof-of-work |
| `/meatmarket-accept-proof` | Approve work and record the on-chain payment |
| `/meatmarket-request-revision` | Request changes on submitted work |
| `/meatmarket-review` | Leave a rating for a worker |
| `/meatmarket-message` | Send or read messages with workers |

## API Coverage

This plugin covers the full MeatMarket API: registration, workforce search, job posting, direct offers, applicant management, proof verification, revision requests, payment recording, messaging, and reviews.

## Payment

Payments are settled on-chain by the user. Supported blockchains: Base, Ethereum, Optimism, Arbitrum, Polygon. After sending payment, use `/meatmarket-accept-proof` to record the transaction link.
