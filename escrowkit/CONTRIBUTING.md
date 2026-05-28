# Contributing to EscrowKit

Thanks for your interest in EscrowKit! Here's how to get involved.

## Areas to Contribute

- **Soroban Contracts** — improve the Rust escrow contract (`contracts/escrow/`)
- **TypeScript SDK** — build out `EscrowClient` methods and type safety
- **CLI** — add new commands or improve UX with better output formatting
- **Tests** — write unit and integration tests
- **Docs** — improve examples, guides, and API reference
- **Adapters** — build framework adapters (Next.js, NestJS)

## Getting Started

1. Fork and clone the repo
2. Install dependencies: `npm install`
3. Build: `npm run build`
4. Run tests: `npm test`
5. Try the CLI: `npm run cli -- --help`

## For Soroban / Rust Contributions

You'll need the Stellar CLI and Rust toolchain:

```bash
# Install Rust
curl https://sh.rustup.rs -sSf | sh

# Install Stellar CLI
cargo install --locked stellar-cli

# Build contracts
cd contracts/escrow
stellar contract build
```

## Submitting a PR

- Branch from `main`
- Keep PRs focused — one change per PR
- Write tests for new functionality
- Update `CHANGELOG.md` if relevant

## Code Style

- TypeScript: strict mode, ESLint enforced
- Rust: `cargo fmt` and `cargo clippy` before committing

## Questions?

Open a GitHub Discussion or drop a comment on an issue.
