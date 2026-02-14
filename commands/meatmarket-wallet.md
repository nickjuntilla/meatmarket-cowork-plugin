---
description: Check your hot wallet balance and address
allowed-tools: ["mcp__meatmarket__wallet_balance"]
---

Show the user their MeatMarket hot wallet status.

1. Call `wallet_balance` to get the address, current chain, and balances (ETH, USDC, pyUSD).
2. Present the information clearly:
   - Wallet address (so they can send funds to it)
   - Current chain
   - ETH balance (needed for gas fees)
   - USDC balance
   - pyUSD balance (if available on the current chain)
   - Whether auto-pay is currently on or off
3. If balances are low and auto-pay is enabled, suggest the user fund the wallet.
4. Include the block explorer link so they can view the wallet on-chain.
