# EscrowKit

> SDK and CLI for deploying milestone-based escrow contracts on Stellar Soroban.

EscrowKit lets developers and DAOs create trustless escrow contracts on Stellar without writing Soroban contracts from scratch. Define milestones, lock funds, and release payments automatically when work is approved.

## Why EscrowKit?

Milestone-based payments are the backbone of freelancing, grants, and DAO bounties. But building smart escrows from scratch requires deep Soroban knowledge. EscrowKit abstracts this into a clean SDK and CLI you can integrate in minutes.

## Use Cases

- Freelance platforms (pay on delivery)
- Grant programs with milestone gates (e.g. GrantFox campaigns)
- Hackathon prize distribution
- DAO contributor bounties
- Service agreements with on-chain verification

## Installation

```bash
npm install escrowkit

# Or use the CLI globally
npm install -g escrowkit
```

## SDK Quick Start

```ts
import { EscrowClient } from 'escrowkit';

const client = new EscrowClient({ network: 'testnet' });

// Create an escrow with 3 milestones
const escrow = await client.createEscrow({
  payer: payerKeypair,
  payee: 'GDESTINATION...',
  totalAmount: 1000, // XLM
  milestones: [
    { id: 'design', description: 'UI design complete', amount: 300 },
    { id: 'frontend', description: 'Frontend shipped', amount: 400 },
    { id: 'launch', description: 'Mainnet launch', amount: 300 },
  ],
});

console.log('Escrow ID:', escrow.id);
console.log('Contract:', escrow.contractAddress);
```

```ts
// Release a milestone payment
await client.releaseMilestone({
  escrowId: escrow.id,
  milestoneId: 'design',
  approverKeypair: payerKeypair,
});

// Dispute a milestone
await client.disputeMilestone({
  escrowId: escrow.id,
  milestoneId: 'frontend',
  reason: 'Work not completed as specified',
});
```

## CLI Usage

```bash
# Create a new escrow
escrowkit create \
  --payee GDESTINATION... \
  --amount 1000 \
  --milestones milestones.json \
  --network testnet

# List all escrows for your account
escrowkit list --account GYOURADDRESS...

# Release a milestone
escrowkit release --escrow ESC123 --milestone design

# Check escrow status
escrowkit status --escrow ESC123
```

## Milestone JSON format

```json
[
  { "id": "m1", "description": "Phase 1 complete", "amount": 500 },
  { "id": "m2", "description": "Phase 2 complete", "amount": 500 }
]
```

## Architecture

```
EscrowKit SDK / CLI
        ↓
Soroban Smart Contract (Rust)
  - lockFunds()
  - releaseMilestone()
  - disputeMilestone()
  - refund()
        ↓
Stellar Network (Testnet / Mainnet)
```

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) — all skill levels welcome!

Good first issues: `good-first-issue` label on GitHub.

## License

MIT
