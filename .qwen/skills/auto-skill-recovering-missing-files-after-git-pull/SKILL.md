---
name: recovering-missing-files-after-git-pull
description: Recover files that were deleted or modified by remote during rebase/pull operations
source: auto-skill
extracted_at: '2026-07-03T08:29:14.511Z'
---

# Recovering Missing Files After Git Pull/Rebase

When `git pull --rebase` is followed by push, the remote may have deleted or drastically changed files that your local branch still needs (e.g., `package.json` removed in commit `4fc0ab5` while local branches expect it).

## Diagnosis

```bash
# Confirm the file is missing
ls -la package.json

# Check if it exists in git history
git log --oneline --all -- package.json

# Check if it exists in current HEAD tree
git show HEAD:package.json

# Check if it existed before your commits
git show HEAD~1:package.json
```

## Recovery procedure

1. **Find the last commit where the file existed** in your local history:
   ```bash
   git show <commit-sha>:package.json | head -5
   ```
   Use `git log --oneline --all -- package.json` to identify the relevant commit (the one before the remote removed it).

2. **Restore the file from that commit**:
   ```bash
   git checkout <commit-sha> -- package.json
   ```

3. **Commit and push the restoration**:
   ```bash
   git add package.json
   git commit -m "restore: recover package.json removed by remote"
   git push origin main
   ```

## Prevention

When pulling from a remote you don't fully own, consider:
- `git fetch && git log HEAD..origin/main --name-only` to preview what's changing before rebasing
- If files are being deleted upstream, contact the owner or fork the branch
