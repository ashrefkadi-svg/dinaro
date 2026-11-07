# Initial Architecture

This document records the initial constraints. Specific technology choices remain open until the first implementation spike is verified.

## Proposed application boundaries

- **Presentation:** pages, reusable UI primitives, navigation, accessibility, and responsive behavior.
- **Application:** user workflows and orchestration (create account, record transaction, transfer funds, set budget).
- **Domain:** money, accounts, transactions, ledger rules, budgets, goals, spaces, and authorization policies.
- **Infrastructure:** persistence, authentication/session handling, external integrations, file processing, and observability.

## Financial data invariants

1. Every monetary amount has an explicit currency.
2. Amounts are represented without binary floating-point arithmetic.
3. A transfer is represented as a balanced movement between accounts, not as unrelated income and expense records.
4. Posted financial records are auditable; corrections use explicit reversal/adjustment flows rather than silently rewriting history.
5. Every record belongs to an authorized user or financial space.
6. Personal and family-space data must be isolated by server-side authorization, not merely hidden in the interface.

## Security baseline

- Hash passwords with a modern password-hashing algorithm and appropriate parameters.
- Protect sessions with secure, HTTP-only cookies in production.
- Apply server-side authorization to every private resource.
- Validate and normalize all input on the server.
- Rate-limit authentication and other abuse-sensitive endpoints.
- Keep secrets and real user data out of Git history.
- Use synthetic fixtures in development and tests.

## Frontend baseline

The UI should be responsive, keyboard accessible, RTL-ready for Arabic, and localization-ready. Motion must respect reduced-motion preferences. Components should be composed from a consistent design system rather than introducing unrelated visual styles.

## Delivery sequence

1. Verify the application toolchain and repository checks.
2. Establish design tokens, app shell, routing, and shared UI primitives.
3. Define and test the financial domain model.
4. Implement persistence and authenticated API boundaries.
5. Connect dashboard and transaction workflows to authoritative data.
6. Add budgets, goals, document-assisted entry, and family spaces.
7. Add end-to-end tests, deployment configuration, and operational documentation.
