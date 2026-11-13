# DINARO+ feature matrix (2026-11-13)
| Feature | Current implementation |
|---|---|
| Design 1.0 tokens, theme, glass, density | Code integrated in feature branch; CI pending |
| Lucide Icons | Existing and reused, whole-system audit pending |
| Dashboard | Existing detailed demo, synthetic data |
| Transaction form | In-memory only |
| Accounts, budgets, goals | Prototype views |
| API, ledger, bank connection, auth | Missing |
| AI, Academy, NPC, Pixel Art world | Missing |
| Accessibility | Partial keyboard/reduced-motion support |
| Arabic RTL, French, English | Arabic RTL existing; translations pending |
| Security/QA | Test workflow added; production hardening pending |


## Addendum — draft PR #3 (supersedes applicable earlier rows)

| Feature | Current code on PR #3 | Boundary |
|---|---|---|
| SQLite account/ledger persistence | Implemented with schema v1 | Development-only, local unencrypted file |
| Manual user login/session | Implemented with salted scrypt + hashed token storage | No verified identity, password recovery, TLS or production security |
| Wallet CRUD | Create/list implemented | No editing/deleting or account reconciliation |
| Income/expense/internal transfer | Atomic balanced manual ledger entries | No reversal yet; no bank synchronization |
| User isolation | Server-side checks and tests | No family spaces, ACL roles or full pentest |
| Local UI | Login, wallet, transfer and recent export preview | Separate from synthetic dashboard; device QA pending |
| Privacy data export | Latest 100 transactions only | Full export and deletion pending |
