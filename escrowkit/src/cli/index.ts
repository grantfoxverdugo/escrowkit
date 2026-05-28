#!/usr/bin/env node
import { Command } from 'commander';
import { Keypair } from '@stellar/stellar-sdk';
import { EscrowClient } from '../sdk/EscrowClient';

const program = new Command();

program
  .name('escrowkit')
  .description('CLI for managing milestone-based escrows on Stellar Soroban')
  .version('0.1.0');

program
  .command('create')
  .description('Create a new escrow contract')
  .requiredOption('--payee <address>', 'Payee Stellar public key')
  .requiredOption('--amount <xlm>', 'Total escrow amount in XLM')
  .requiredOption('--milestones <file>', 'Path to milestones JSON file')
  .option('--network <network>', 'testnet or mainnet', 'testnet')
  .action(async (opts) => {
    const fs = await import('fs');
    const milestones = JSON.parse(fs.readFileSync(opts.milestones, 'utf-8'));
    const payer = Keypair.random(); // TODO: load from env or wallet

    const client = new EscrowClient({ network: opts.network });
    const escrow = await client.createEscrow({
      payer,
      payee: opts.payee,
      totalAmount: Number(opts.amount),
      milestones,
    });

    console.log('\n🎉 Escrow Created!');
    console.log('ID:       ', escrow.id);
    console.log('Contract: ', escrow.contractAddress);
    console.log('Amount:   ', escrow.totalAmount, 'XLM');
    console.log('Milestones:', escrow.milestones.length);
  });

program
  .command('release')
  .description('Release payment for a completed milestone')
  .requiredOption('--escrow <id>', 'Escrow ID')
  .requiredOption('--milestone <id>', 'Milestone ID')
  .option('--network <network>', 'testnet or mainnet', 'testnet')
  .action(async (opts) => {
    const approver = Keypair.random(); // TODO: load from env or wallet
    const client = new EscrowClient({ network: opts.network });
    const result = await client.releaseMilestone({
      escrowId: opts.escrow,
      milestoneId: opts.milestone,
      approverKeypair: approver,
    });
    console.log('✅ Milestone released! TX:', result.txHash);
  });

program
  .command('status')
  .description('Get current status of an escrow')
  .requiredOption('--escrow <id>', 'Escrow ID')
  .option('--network <network>', 'testnet or mainnet', 'testnet')
  .action(async (opts) => {
    const client = new EscrowClient({ network: opts.network });
    const escrow = await client.getEscrow(opts.escrow);
    if (!escrow) {
      console.log('❌ Escrow not found');
      return;
    }
    console.log('\n📋 Escrow Status');
    console.log('ID:     ', escrow.id);
    console.log('Status: ', escrow.status);
    console.log('Payer:  ', escrow.payer);
    console.log('Payee:  ', escrow.payee);
    console.log('Amount: ', escrow.totalAmount, 'XLM');
    console.log('\nMilestones:');
    escrow.milestones.forEach((m) => {
      console.log(`  [${m.status}] ${m.id}: ${m.description} (${m.amount} XLM)`);
    });
  });

program
  .command('dispute')
  .description('Raise a dispute on a milestone')
  .requiredOption('--escrow <id>', 'Escrow ID')
  .requiredOption('--milestone <id>', 'Milestone ID')
  .requiredOption('--reason <text>', 'Reason for dispute')
  .option('--network <network>', 'testnet or mainnet', 'testnet')
  .action(async (opts) => {
    const caller = Keypair.random(); // TODO: load from env
    const client = new EscrowClient({ network: opts.network });
    const result = await client.disputeMilestone({
      escrowId: opts.escrow,
      milestoneId: opts.milestone,
      reason: opts.reason,
      callerKeypair: caller,
    });
    console.log('⚠️  Dispute raised! TX:', result.txHash);
  });

program.parse();
