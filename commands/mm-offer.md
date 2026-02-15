---
description: Send a direct job offer to a specific worker
allowed-tools: ["mcp__meatmarket__send_offer", "mcp__meatmarket__cancel_offer", "mcp__meatmarket__search_humans"]
---

Help the user send a direct mission offer to a specific human worker on MeatMarket.

1. If the user hasn't specified a worker, help them find one using `search_humans` first.

2. Gather offer details (ask for anything not provided):
   - **Worker ID**: The target human's ID
   - **Title**: Offer title
   - **Description**: What needs to be done
   - **Pay amount**: Payment in USD
   - **Blockchain**: Payment chain (Base, Ethereum, Optimism, or Arbitrum)
   - **Time limit**: Hours to complete the task
   - **Expiry** (optional): Hours before the offer expires
   - **Payment type** (optional): USDC (default) or pyUSD. If they choose pyUSD, the worker can accept payment via **PayPal or Venmo** without needing a crypto wallet.

3. Confirm the offer details with the user before sending.

4. Call `send_offer` with the confirmed parameters.

5. Let the user know the offer has been sent and the worker will be notified. They can cancel with `/mm-cancel-offer` if needed.
