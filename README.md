# MeatMarket Plugin for Claude

Hire and manage human workers through [MeatMarket.fun](https://meatmarket.fun) directly from Claude, with an integrated EVM hot wallet for automatic payments and AI-powered evaluation of candidates and work.

## Setup

1. Run `/mm-initialize` to register, get your API credentials, and create your hot wallet.
2. Check your email for the verification link and click it.
3. (Optional) Fund your wallet and enable auto-pay with `/mm-settings`.
4. (Optional) Enable auto-accept candidates in `/mm-settings` if you want the AI to hire applicants automatically.

## Commands

| Command | Description |
|---------|-------------|
| `/mm-initialize` | Register with MeatMarket, create wallet, set up credentials |
| `/mm-search` | Search for human workers by skill, rate, or location |
| `/mm-post` | Post a new job to the workforce |
| `/mm-offer` | Send a direct offer to a specific worker |
| `/mm-accept` | Hire an applicant for an open job |
| `/mm-myjobs` | View your full dashboard (jobs, applicants, messages) |
| `/mm-check` | Poll for new activity — AI evaluates applicants and proofs, takes action |
| `/mm-review-proof` | Review submitted proof-of-work |
| `/mm-accept-proof` | Manually approve work and pay (auto or manual) |
| `/mm-request-revision` | Request changes on submitted work |
| `/mm-review` | Leave a rating for a worker |
| `/mm-message` | Send or read messages with workers |
| `/mm-wallet` | Check hot wallet balance and address |
| `/mm-settings` | Change chain, toggle auto-pay, toggle auto-accept candidates |
| `/mm-backup` | Download a backup file with your API key, wallet private key, and settings |

## Automation Pipeline

The `/mm-check` command (also runs automatically at session start) does a full sweep:

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

Run `/mm-backup` at any time to generate a downloadable backup file with your API key, wallet private key, and all settings. **Do this after initialization** — your wallet private key controls any funds in your hot wallet, and if you lose it, those funds are unrecoverable.

Credentials are also stored at `.claude/meatmarket/credentials.json` inside your Cowork workspace folder (the folder you selected when starting Cowork mode).

## Wallet & Payments

The plugin creates an EVM hot wallet during initialization. Supported chains: Ethereum, Base, Optimism, Arbitrum. Supported tokens: USDC, pyUSD.

**pyUSD & PayPal/Venmo**: When posting jobs or sending offers, choose **pyUSD** as the payment type to let workers accept payment via PayPal or Venmo — no crypto wallet needed on their end. This makes it easy to hire people who aren't crypto-native.

**Auto-pay**: When enabled, the AI sends payment from the hot wallet after verifying a proof meets all job requirements. Requires the wallet to have enough stablecoin (USDC/pyUSD) plus ETH for gas.

**Manual pay**: When auto-pay is off, you send payment yourself and provide the transaction link via `/mm-accept-proof`.

## Settings

| Setting | Default | Description |
|---------|---------|-------------|
| Chain | base | Which EVM chain for wallet operations |
| Default token | USDC | Payment token for new jobs/offers. Set to pyUSD for PayPal/Venmo compatibility |
| Auto-pay | off | Automatically pay for verified proofs from the hot wallet |
| Auto-accept candidates | off | Automatically hire the best-fit applicant for each job |

## API Coverage

This plugin covers the full MeatMarket API: registration, workforce search, job posting, direct offers, applicant management, proof verification, revision requests, payment recording, messaging, and reviews.
