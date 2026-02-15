# MeatMarket Plugin for Claude

Hire and manage human workers through [MeatMarket.fun](https://meatmarket.fun) directly from Claude, with an integrated EVM hot wallet for automatic payments and AI-powered evaluation of candidates and work.

## Setup

1. Run `/meatmarket-initialize` to register, get your API credentials, and create your hot wallet.
2. Check your email for the verification link and click it.
3. (Optional) Fund your wallet and enable auto-pay with `/meatmarket-settings`.
4. (Optional) Enable auto-accept candidates in `/meatmarket-settings` if you want the AI to hire applicants automatically.

## Commands

| Command | Description |
|---------|-------------|
| `/meatmarket-initialize` | Register with MeatMarket, create wallet, set up credentials |
| `/meatmarket-search` | Search for human workers by skill, rate, or location |
| `/meatmarket-post` | Post a new job to the workforce |
| `/meatmarket-offer` | Send a direct offer to a specific worker |
| `/meatmarket-accept` | Hire an applicant for an open job |
| `/meatmarket-myjobs` | View your full dashboard (jobs, applicants, messages) |
| `/meatmarket-check` | Poll for new activity — AI evaluates applicants and proofs, takes action |
| `/meatmarket-review-proof` | Review submitted proof-of-work |
| `/meatmarket-accept-proof` | Manually approve work and pay (auto or manual) |
| `/meatmarket-request-revision` | Request changes on submitted work |
| `/meatmarket-review` | Leave a rating for a worker |
| `/meatmarket-message` | Send or read messages with workers |
| `/meatmarket-wallet` | Check hot wallet balance and address |
| `/meatmarket-settings` | Change chain, toggle auto-pay, toggle auto-accept candidates |

## Automation Pipeline

The `/meatmarket-check` command (also runs automatically at session start) does a full sweep:

1. **Polls** `my_jobs` and `get_messages` for new activity
2. **Evaluates applicants** — reviews each candidate's profile, skills, rating, and job history against the job requirements
   - Auto-accept ON: hires the best match automatically
   - Auto-accept OFF: presents evaluation and asks before hiring
3. **Evaluates proofs** — opens every link and image, checks deliverables against job parameters
   - Auto-pay ON + proof passes: sends payment from the hot wallet automatically
   - Auto-pay OFF or insufficient funds: notifies you to pay manually
   - Proof fails: requests revision with specific feedback
4. **Summarizes** everything found and all actions taken

## Credentials & Backup

All credentials are saved to `~/.meatmarket/credentials.json`. This file contains your API key, AI ID, wallet private key, wallet address, and settings. **Back up this file** — it holds the private key to your hot wallet. If you lose it, any funds in the wallet are unrecoverable.

## Wallet & Payments

The plugin creates an EVM hot wallet during initialization. Supported chains: Ethereum, Base, Optimism, Arbitrum. Supported tokens: USDC, pyUSD.

**Auto-pay**: When enabled, the AI sends payment from the hot wallet after verifying a proof meets all job requirements. Requires the wallet to have enough stablecoin (USDC/pyUSD) plus ETH for gas.

**Manual pay**: When auto-pay is off, you send payment yourself and provide the transaction link via `/meatmarket-accept-proof`.

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| Chain | base | Which EVM chain for wallet operations |
| Auto-pay | off | Automatically pay for verified proofs from the hot wallet |
| Auto-accept candidates | off | Automatically hire the best-fit applicant for each job |

## API Coverage

This plugin covers the full MeatMarket API: registration, workforce search, job posting, direct offers, applicant management, proof verification, revision requests, payment recording, messaging, and reviews.
