# DINARO+ Local Manual Ledger — Development Preview

Status: implemented in draft PR #3; **not production-ready**. This is a local, manually entered record-keeping sandbox. It is not a bank integration, money-transfer service, or production-secured fintech backend.

## Run on your computer

Requirements: Node.js 22 (uses experimental built-in node:sqlite). Use only fictional sample data.

Terminal 1:
    npm install
    npm run dev:api

Terminal 2:
    npm run dev

Open http://localhost:5173 and select **دفتر محلي**. Register with a unique test password (12+ chars). Create a manual wallet and test income, expenses and transfer between two wallets.

The UI calls /api through Vite's proxy. The API listens only on 127.0.0.1:8787, and refuses production-mode startup. Data is stored at .local-data/dinaro.sqlite, which Git ignores.

## Endpoints

All POST requests require Content-Type application/json and x-dinaro-request header equal to 1. Auth requires a session cookie obtained through registration/login.

| Method | Path | Purpose |
|---|---|---|
| GET | /api/health | Local server check |
| POST | /api/auth/register | Create user |
| POST | /api/auth/login | Login |
| POST | /api/auth/logout | Revoke current session |
| GET | /api/me | Authenticated user |
| GET | /api/accounts | Own manually entered wallets and balances |
| POST | /api/accounts | Create wallet with requestId idempotency |
| GET | /api/transactions | Last 100 entries |
| POST | /api/transactions | Atomic manual ledger event |
| GET | /api/export | Wallets and most recent 100 transactions, not full history |

Financial amounts are decimal strings of DZD **minor units**: for example "12345" represents 123.45 DZD. Do not submit floating-point amounts. Every write needs a unique requestId; if retrying a failed response, reuse the same requestId with the identical payload. Different payloads for the same requestId are rejected.

Wallet creation: POST name, openingMinor, requestId. Expense: kind=expense, fromAccountId, amountMinor, requestId. Income: kind=income, toAccountId, amountMinor, requestId. Transfer: kind=transfer and both wallet IDs. These are manual bookkeeping records, not payments.

## Verification and safeguards

- SQLite schema version 1, foreign keys, WAL journaling and parameterized SQL.
- All wallet, transaction and session queries are user-scoped server-side.
- Salted scrypt password hashes; random session secrets stored only as SHA-256 digests.
- HttpOnly SameSite=Strict cookie at /api; local POST requests require a custom header and allowed-Origin checks.
- Balanced postings for opening amounts, income, expenses and transfers inside atomic transactions.
- Duplicate write requests are idempotent; insufficient balance and cross-user wallet references are rejected.
- Automated tests for reopening persisted database, exact balances, transfers, idempotency, login/logout, authorization and CSRF protections.

## What is NOT implemented or assured

**Never expose this service publicly or enter actual bank credentials or sensitive statements.** Data on the device is **not encrypted at rest**. There is no TLS deployment, email verification, secure account recovery, audited incident handling, production-scale rate limiting, backups, device management or completed penetration test. The Node SQLite API is experimental, and password derivation is synchronous, suitable only for this local spike.

No production currency conversion, real bank sync, family permissions, automatic recurring operations or formal financial audit. The export includes only the latest 100 transactions, so it is not a complete data portability feature. No journal reversal/adjustment API yet. The current DINARO main dashboard uses separate synthetic in-memory figures and is not tied to this stored ledger.

## Tests

    npm run test
    npm run test:api
    npm run build
    npm run check

CI runs both test suites and the production bundle check. Passing those tests does not replace real browser testing, security verification, or deployment readiness.

## Next engineering milestones

Production-class database and migrations, asynchronous password verification, vetted TLS session controls, backup/restore, full audit trail, reversal flows, complete export/deletion, multi-account permissions, threat-model review, property-based financial testing and device QA. This document is not a compliance certificate.
