# DINARO+ Engineering Baseline Audit — 2026-11-17

This document records an external working-artifact audit. **It is not an implemented change to GitHub main.**

## Source-of-truth discrepancy (P0)
GitHub main is an older ~11-file React demo. The separately delivered `DINARO-PLUS-SIGNATURE-BANKING-2.0.zip` contains the newer v0.3.0 BankingApp, local SQLite server, domain ledger, feature prototypes, tests and media assets. That ZIP is **not yet reconciled into the canonical repository**. Preserve all source and media when importing; do not overwrite main or delete old features without review.

## Financial architecture (P0)
- Server `server/store.mjs`: local-only Node 22 experimental SQLite, signed-minor-unit double-entry postings, prepared SQL, transactions, idempotency and user-scoped account selection.
- `src/domain/ledger.ts`: independent `bigint` posting model with balanced-entry checks.
- New ZIP `src/BankingApp.tsx`: separate localStorage-only demo, previously using floating-point DZD amounts.
- Missing: a single authenticated source-of-truth tying UI reads and writes to SQLite, family-user roles, production security design, immutable audit records and end-to-end tests.

## Locally implemented remedy in the delivered P0 artifact
A new file `src/domain/banking-finance.ts` and updates to `src/BankingApp.tsx` use decimal-string DZD centimes with `bigint` arithmetic; goal contributions, withdrawals, deletion and transactions validate against overdrafts and preserve total assets. Browser state advances to `dinaro.banking.studio.v3`; old `v2` state is read and migrated when precise and valid, without deleting the original key. Also added `src/domain/banking-finance.test.mjs` and registered tests.

## Execution evidence (local artifact only)
- 43/43 Node domain/component test cases passed.
- 3/3 SQLite/API tests passed.
- Isolated TypeScript check of financial module passed.
- **NOT VERIFIED:** full React TypeScript semantic check, Vite build, browser QA, mobile E2E. Registry dependency install unavailable at audit time.

## Blocking tasks
- ACH-5: reconcile v0.3 source/assets with canonical GitHub.
- ACH-6: connect UI to one authenticated double-entry backend.
- ACH-7: npm ci, build, regression tests and browser QA.
- ACH-8: household accounts, authorization roles and audit.

**No monetary transaction data or customer credentials were accessed or modified.** This branch contains audit documentation only, pending verified source reconciliation.
