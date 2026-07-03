---
name: reconciling-divergent-git-branches
description: Diagnose and reconcile divergent local and remote git branches after pull failure
source: auto-skill
extracted_at: '2026-07-03T08:29:14.511Z'
---

# Diagnosing and Reconciling Divergent Git Branches

When `git pull` fails with "Need to specify how to reconcile divergent branches", it means local and remote have no common ancestor — they diverged at some point.

## Diagnosis

```bash
# Show the divergence
git status          # Shows "Your branch and 'origin/main' have diverged, and have X and Y different commits each"

# Visualize divergence
git log --oneline --all --graph -20

# Find the last common ancestor (merge base)
git merge-base HEAD origin/main
```

## Resolution options

| Option | Command | When to use |
|--------|---------|-------------|
| **Rebase** (recommended) | `git pull --rebase origin main` | Clean history; replays your commits on top of remote. Best when you trust remote history. |
| **Merge** | `git pull --no-rebase origin main` | Preserve both histories with a merge commit. Useful for team repos. |
| **Force push** | `git push --force origin main` | **Destructive.** Overwrites remote with local. Only if you want to discard remote changes. |

## Common flow after successful rebase

```bash
git pull --rebase origin main   # Reconcile branches
git push origin main            # Push reconciled state
```

## If push fails with auth error

"Invalid username or token" means the embedded PAT in the remote URL expired.

```bash
# Clean the remote URL (removes old embedded token)
git remote set-url origin https://github.com/<user>/<repo>.git

# gh CLI should handle auth automatically if already logged in
git push origin main
```
