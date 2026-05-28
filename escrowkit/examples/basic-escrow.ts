import { EscrowClient } from '../src';
import { Keypair } from '@stellar/stellar-sdk';

async function main() {
  const client = new EscrowClient({ network: 'testnet' });

  const payer = Keypair.random();
  const payeeAddress = 'GDESTINATIONADDRESSHERE';

  // Create a 3-milestone escrow for a dev project
  const escrow = await client.createEscrow({
    payer,
    payee: payeeAddress,
    totalAmount: 1500,
    milestones: [
      { id: 'design', description: 'UI/UX design delivered', amount: 300 },
      { id: 'mvp', description: 'MVP frontend shipped', amount: 700 },
      { id: 'launch', description: 'Production launch complete', amount: 500 },
    ],
  });

  console.log('Escrow created:', escrow.id);
  console.log('Contract address:', escrow.contractAddress);

  // Later: payer approves the design milestone
  const release = await client.releaseMilestone({
    escrowId: escrow.id,
    milestoneId: 'design',
    approverKeypair: payer,
  });
  console.log('Design milestone released! TX:', release.txHash);

  // Check full escrow status
  const status = await client.getEscrow(escrow.id);
  console.log('Current status:', status);
}

main().catch(console.error);
