
# Agent Instructions — Workspace-wide

Purpose
-------
These instructions apply to any AI Agent interacting with this workspace. They specify how agents should record learnings, read commits (prefer remote), and produce concise, single-file commit summaries.

Scope
-----
- Applies to all files and interactions within this repository: the entire workspace root and subfolders.
- Intended for AI Agents and automation helpers that have access to the repository and the user's chat history.

Core Requirements (behavioral rules)
----------------------------------
1. Record Learnings
    - After meaningful interactions (design decisions, code changes, debugging), create or update a concise learning entry in the `discoveries` folder.
    - Learning entry format (Markdown):
       - Title: one-line summary
       - Date: ISO date
       - Context: one sentence
       - Learning: concise bullet list (1–5 bullets)
       - Evidence: links to files or chat excerpts (relative paths) and short code snippets if relevant
       - Actions: suggested follow-ups or TODOs
    - File naming: `YYYY-MM-DD-<short-topic>.md` (e.g., `2026-05-30-agent-instructions.md`).

2. Commit Summaries — single consolidated file (remote-first)
    - The canonical, human-facing artifact for commit summaries is `discoveries/commit-summary.md`.
    - Preferred behavior:
       - Read commits directly from the GitHub remote using authorized agent tools/APIs when possible.
       - For each relevant commit, extract: SHA, date, referenced issue (e.g., "#123"), and produce a concise AI summary (one sentence).
       - Add or update a single-line entry per commit in `discoveries/commit-summary.md` with the above fields.
    - Do NOT create many per-commit files in `discoveries/commits/` by default. Only create per-commit files if the user explicitly asks.

3. Handling New Commits (recommended flow)
    - Preferred flow using GitHub API/tools:
       1. Fetch commit list and diffs from the GitHub remote (using the user's token if required).
       2. Identify new/unprocessed commits relevant to this workspace.
       3. Extract referenced issue numbers from commit messages and compute a one-line AI summary for each commit.
       4. Update `discoveries/commit-summary.md` with entries for the new commits.
       5. Present the updated `discoveries/commit-summary.md` to the user and ask whether to commit it. Do NOT commit or push without explicit permission.
    - Fallback when remote access is unavailable: use local `git` to read commit history/diffs, then follow steps 2–5.

Operational details and best practices
-------------------------------------
- Keep entries concise: one-line AI summary per commit; learning items 3–8 bullets maximum.
- Use relative workspace paths for linking files so entries are clickable in editors.
- Avoid including long code excerpts; prefer referencing files and line ranges or at most one short snippet (≤ 10 lines) when necessary.
- When fetching from GitHub, prefer read-only `repo` scope; always explain the minimal scopes required when requesting a token.

Examples
--------
- Commit summary entry example:

   - `e8a6bf2 2026-05-10  Fix lint issues in view components  (issue #1)`

Privacy and safety
------------------
- Do not transmit private secrets, credentials, or API keys to external services unless explicitly authorized by the user.
- If the agent requests a GitHub token, it must explain required scopes (recommended: `repo` read-only), show where the token will be used, and must NOT store it in plaintext within the repository.

Questions & Clarifications
--------------------------
- The agent must ask before committing or pushing any generated summaries to the repository.
- If the user prefers per-commit files instead of a single file, the agent should ask and follow that preference.

Next steps for the user (suggested)
----------------------------------
1. Confirm you want `discoveries/commit-summary.md` as the canonical summaries file.
2. If you want agents to read GitHub directly, optionally provide a token when prompted (read-only `repo` scope recommended).
3. Tell the agent whether to create backups of any existing per-commit summary files before removing them.

Created: 2026-05-30
Questions & Clarifications
--------------------------
- If the user wants summaries to be automatically committed, the agent must ask for explicit permission before making git commits or pushing.
- Confirm the preferred summary depth (short, medium, long) if the user has a preference.

Created: 2026-05-30
