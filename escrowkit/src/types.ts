export interface Milestone {
  id: string;
  description: string;
  amount: number; // in XLM
  status?: 'pending' | 'released' | 'disputed';
}

export interface CreateEscrowOptions {
  payer: import('@stellar/stellar-sdk').Keypair;
  payee: string; // Stellar public key
  totalAmount: number; // in XLM
  milestones: Milestone[];
  expiresAt?: Date;
}

export interface EscrowRecord {
  id: string;
  contractAddress: string;
  payer: string;
  payee: string;
  totalAmount: number;
  milestones: Milestone[];
  status: 'active' | 'completed' | 'refunded' | 'disputed';
  createdAt: number;
}

export interface ReleaseMilestoneOptions {
  escrowId: string;
  milestoneId: string;
  approverKeypair: import('@stellar/stellar-sdk').Keypair;
}

export interface DisputeMilestoneOptions {
  escrowId: string;
  milestoneId: string;
  reason: string;
  callerKeypair: import('@stellar/stellar-sdk').Keypair;
}

export interface EscrowKitConfig {
  network: 'testnet' | 'mainnet';
  rpcUrl?: string;
  contractId?: string;
}
