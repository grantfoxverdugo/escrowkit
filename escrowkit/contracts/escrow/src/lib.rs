#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, token, vec,
    Address, Env, String, Symbol, Vec,
};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum MilestoneStatus {
    Pending,
    Released,
    Disputed,
}

#[contracttype]
#[derive(Clone)]
pub struct Milestone {
    pub id: Symbol,
    pub description: String,
    pub amount: i128,
    pub status: MilestoneStatus,
}

#[contracttype]
#[derive(Clone)]
pub struct EscrowState {
    pub payer: Address,
    pub payee: Address,
    pub token: Address,
    pub milestones: Vec<Milestone>,
    pub is_active: bool,
}

const STATE: Symbol = symbol_short!("STATE");

#[contract]
pub struct EscrowContract;

#[contractimpl]
impl EscrowContract {
    /// Initialize the escrow and lock funds
    pub fn initialize(
        env: Env,
        payer: Address,
        payee: Address,
        token: Address,
        milestones: Vec<Milestone>,
    ) {
        payer.require_auth();

        let total_amount: i128 = milestones.iter().map(|m| m.amount).sum();

        // Transfer total funds from payer to contract
        let token_client = token::Client::new(&env, &token);
        token_client.transfer(&payer, &env.current_contract_address(), &total_amount);

        let state = EscrowState {
            payer,
            payee,
            token,
            milestones,
            is_active: true,
        };

        env.storage().instance().set(&STATE, &state);
    }

    /// Release payment for an approved milestone
    pub fn release_milestone(env: Env, milestone_id: Symbol) {
        let mut state: EscrowState = env.storage().instance().get(&STATE).unwrap();
        state.payer.require_auth();

        let token_client = token::Client::new(&env, &state.token);

        for milestone in state.milestones.iter_mut() {
            if milestone.id == milestone_id {
                if milestone.status != MilestoneStatus::Pending {
                    panic!("Milestone already processed");
                }
                milestone.status = MilestoneStatus::Released;
                token_client.transfer(
                    &env.current_contract_address(),
                    &state.payee,
                    &milestone.amount,
                );
                break;
            }
        }

        env.storage().instance().set(&STATE, &state);
    }

    /// Raise a dispute on a milestone (freezes funds for arbitration)
    pub fn dispute_milestone(env: Env, milestone_id: Symbol) {
        let mut state: EscrowState = env.storage().instance().get(&STATE).unwrap();

        for milestone in state.milestones.iter_mut() {
            if milestone.id == milestone_id {
                if milestone.status != MilestoneStatus::Pending {
                    panic!("Milestone already processed");
                }
                milestone.status = MilestoneStatus::Disputed;
                break;
            }
        }

        env.storage().instance().set(&STATE, &state);
    }

    /// Refund all pending milestone funds back to payer
    pub fn refund(env: Env) {
        let mut state: EscrowState = env.storage().instance().get(&STATE).unwrap();
        state.payer.require_auth();

        let token_client = token::Client::new(&env, &state.token);

        let refund_amount: i128 = state
            .milestones
            .iter()
            .filter(|m| m.status == MilestoneStatus::Pending)
            .map(|m| m.amount)
            .sum();

        if refund_amount > 0 {
            token_client.transfer(
                &env.current_contract_address(),
                &state.payer,
                &refund_amount,
            );
        }

        state.is_active = false;
        env.storage().instance().set(&STATE, &state);
    }

    /// Get current escrow state
    pub fn get_state(env: Env) -> EscrowState {
        env.storage().instance().get(&STATE).unwrap()
    }
}
