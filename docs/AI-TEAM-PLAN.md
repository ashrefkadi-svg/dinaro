# DINARO+ Autonomous AI Engineering Team

## Status

Planning baseline only. This document does not install dependencies, execute generated code, or change the production application.

- Repository: `ashrefkadi-svg/dinaro`
- Protected baseline: `main`
- Isolated setup branch: `ai-team/bootstrap`
- Initial objective: build a local-first agent workspace that can inspect, plan, implement, test, and report changes without writing directly to `main`.

## Architecture decision

Use a separate Node.js + TypeScript workspace under `tools/ai-team/`. Keep it outside the production React/Vite runtime.

Initial orchestration:
- LangGraph.js supervisor for explicit delegation and workflow state.
- Ollama as the local model runtime, through `@langchain/ollama`.
- A single configured local model may serve several role-specialized agents initially. Separate model processes are not required.
- All model names and runtime settings are configurable; do not hard-code a model until the developer machine's RAM, CPU, and GPU are known.

Why local-first:
- No per-token API bill for locally hosted models.
- Project source can remain on the developer's machine.
- Performance and model quality depend on local hardware and model size.
- No claim of unlimited or zero-cost compute: electricity, disk space, and hardware are still required.

## Initial agent roles

1. **Supervisor / Planner** — decomposes a task, selects specialists, maintains task state, and produces the final report.
2. **Repository Architect** — reads the repository, maps dependencies and boundaries, and proposes the smallest safe change.
3. **Implementation Agent** — works only on explicitly assigned files and a task branch/worktree.
4. **QA / Security Reviewer** — reviews the diff, runs approved checks, and reports failures or risks.

Add dedicated Frontend, Backend/Database, UI/UX, and Security agents only after the first workflow is reliable. Initially, role prompts can share one local model.

## Execution safety

- Never write directly to `main`.
- Work only in a dedicated task branch or isolated Git worktree.
- Restrict file operations to the configured project root.
- Begin with read-only repository tools; enable writes only for assigned tasks.
- Use an explicit command allowlist for checks such as install, typecheck, test, and build.
- Do not let an agent run arbitrary shell or PowerShell commands.
- Do not expose `.env`, credentials, private keys, session tokens, or real financial records to model context.
- Require human approval before destructive database operations, dependency upgrades, pushing changes, merging PRs, deployments, or changing production secrets.
- Always show a diff and test report before accepting a task.
- Keep a clean rollback path using Git.

## Initial workflow

1. Receive a task and create a task plan.
2. Inspect relevant files and current Git state.
3. Ask the architect role to review scope and risks.
4. Delegate implementation to the relevant specialist role.
5. Run formatting, type checks, tests, and production build through the allowlist.
6. Ask QA/security to inspect the diff and test output.
7. If checks pass, prepare a commit or pull request for human review.
8. Never merge or deploy automatically in the initial release.

## Repository baseline discovered

The connected `main` branch currently documents a React 19 + Vite frontend prototype. Its README and design-system notes explicitly describe demonstration data and no persistent financial API integration in that snapshot. The agent workspace must not assume that this is identical to any newer local DINARO+ copy. Compare local and remote Git state before syncing or applying application changes.

## Setup gates before implementation

Collect:
- Windows version.
- Installed RAM.
- CPU model.
- GPU model and dedicated VRAM (if any).
- Available disk space.
- Exact local DINARO+ folder path.
- Whether the local folder has uncommitted changes.

Then:
1. Confirm which copy is authoritative.
2. Install/configure Ollama and select a model sized for the machine.
3. Create the agent workspace and lockfile separately from the app.
4. Add read-only repository tools and a dry-run mode.
5. Add guarded write tools and command allowlists.
6. Test on a documentation-only task before allowing application code changes.

## Acceptance criteria for v1

- The supervisor can delegate to at least two specialist roles.
- Agents can inspect files but cannot escape the project root.
- Writes are limited to a task branch/worktree.
- Commands are allowlisted and logged.
- A task produces a plan, changed-file list, diff, test output, and review report.
- No automatic merge, deployment, or production database mutation.
