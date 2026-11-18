# DINARO+ Live Personal Accounts — Local database milestone (2026-11-17)

## What is live

The default React entrypoint renders `src/RealBankingApp.tsx`, not the stand-alone Banking Signature demo. Users can register an email/password, sign in, and keep an HttpOnly session cookie. Every wallet, ledger entry, financial goal and budget limit displayed by this new UI is read from the authenticated SQLite database.

- `server/store.mjs` schema version 2 adds `goals` and `budgets` **without deleting or changing existing tables**. The migration is transactional and can reopen an existing v1 database. Before upgrading an on-disk v1 database the server checkpoints the WAL and writes a timestamped `.backup` file; it aborts instead if that backup fails. These backup files contain sensitive account data and must be stored securely.
- Goal savings are **asset accounts**: creating a goal creates a linked asset account; saving and withdrawing are ordinary balanced journal transfers with server-side ownership, idempotency and no-overdraft checks.
- `GET/POST /api/goals`, `GET/POST /api/budgets`, registered/login/logout, accounts and cursor-paginated transaction history support the actual dashboard.
- Export includes full user-owned ledger, goal metadata and budget limits in JSON, and is explicitly **not a restore-ready backup**.
- The old Signature Banking demo, Academy components and other prototype source files remain in the project and are not used for users' financial balances.

## Requirements and Windows PowerShell

Install Node.js 22.x. From the extracted `DINARO-PLUS` folder, in **two separate PowerShell windows**. On Windows PowerShell, explicitly use `npm.cmd` instead of `npm`: PowerShell may block `C:\\Program Files\\nodejs\\npm.ps1` under the machine's script execution policy. Calling the `.cmd` executable works without relaxing that policy, without administrator access, and without changing system security settings.

First PowerShell window (leave it running):

```powershell
npm.cmd install --no-audit --no-fund
npm.cmd run dev:api
```

Second PowerShell window, from the **same project folder**:

```powershell
npm.cmd run dev
```

`npm cmd install` (with a space) is **not** equivalent to `npm.cmd install` (with a dot). If `npm.cmd` is not recognized, verify Node.js installation and PATH with `node --version` and `where.exe npm`. If a command fails, keep its full error output for diagnosis. Avoid globally changing the PowerShell execution policy just to install this app.

Open `http://localhost:5173` on the same PC. Choose **Create account**; then create a wallet, add a manual opening balance, create a goal and transfer a contribution. Refresh or restart the server: records stay in `.local-data/dinaro.sqlite` and your session remains valid until logout/expiry. This folder is gitignored and should not be shared.

Before updating an existing local database, **stop the server**, back up the entire `.local-data` directory to a secure location, then start the updated server. The v2 migration also makes a timestamped `.backup` beside the SQLite database. Database schema upgrades are additive, but rollback of a schema upgrade requires restoring an offline backup securely (and ensuring that WAL/SHM files are handled as part of a cold restore).

## Tests

```powershell
npm.cmd run test:api
npm.cmd run test
npm.cmd run build
```

Use `npm install` (no lockfile in this archive), then keep a generated `package-lock.json` for reproducible builds before deployment. Production deployment has **not** been configured or verified.

## Security and scope boundaries

This milestone is a **functional local-account application**, not a public multi-device SaaS nor a bank. It runs on `127.0.0.1`, refuses production-mode startup, and intentionally requires a local Vite proxy. Account emails need not be verified, password reset and backups are not hosted, the SQLite file is not encrypted, and server password hashing is synchronous. There is no TLS, independently audited authorization, cloud deployment, family sharing or real bank connectivity. Do not enter reused passwords, bank credentials or sensitive real-world customer data. Never forward the local API port to the Internet.

For public account registration across devices: replace the loopback-only server architecture with an intentionally deployed service (TLS, environment-managed secrets, verified email and account recovery, server-side security controls, managed backups and monitoring) and complete independent security and financial integrity reviews. This is a separate release milestone, not something this local build claims.
