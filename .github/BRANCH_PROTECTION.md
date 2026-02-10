# Branch Protection Setup Guide

This document explains how to enable branch protection rules for the main branch to ensure code quality and security.

## Why Branch Protection?

Branch protection ensures:
- ✅ All code is reviewed before merge
- ✅ Automated checks pass (tests, lint, build)
- ✅ No force pushes or deletions
- ✅ Consistent code quality
- ✅ Reduced security risks

## Setup via GitHub UI

### Step 1: Navigate to Branch Protection Settings

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Click **Branches** in left sidebar
4. Click **Add Rule** under "Branch protection rules"

### Step 2: Configure Branch Pattern

1. Enter branch name pattern: `main`
2. Check: "Include administrators"

### Step 3: Require Pull Request Reviews

- ✅ **Require a pull request before merging**
  - Minimum number of approvals: `1`
  - ✅ Dismiss stale pull request approvals when new commits are pushed
  - ✅ Require approval of the most recent reviewable push

### Step 4: Require Status Checks

- ✅ **Require status checks to pass before merging**
  - ✅ Require branches to be up to date before merging

**Required status checks to pass:**
- `Lint & Type Check`
- `Build`
- `Tests`
- `Security Audit`

### Step 5: Restrict Who Can Push

- ✅ **Restrict who can push to matching branches**
  - Limit to: Administrators and specified people/teams

### Step 6: Additional Rules

- ✅ **Require linear history** (prevents merge commits)
- ✅ **Allow force pushes** - Select "Dismiss"
- ✅ **Allow deletions** - Select "Dismiss"

### Step 7: Save Rules

Click **Create** to save the branch protection rule.

---

## Setup via GitHub CLI

If you have GitHub CLI installed, you can automate this:

```bash
# Install GitHub CLI if needed
# macOS: brew install gh
# Windows: choco install gh
# Linux: Follow https://github.com/cli/cli/blob/trunk/docs/install.md

# Login to GitHub
gh auth login

# Create branch protection rule
gh repo rule create \
  --require-approvals=1 \
  --require-status-checks=true \
  --require-status-checks="Lint & Type Check" \
  --require-status-checks="Build" \
  --require-status-checks="Tests" \
  --require-status-checks="Security Audit" \
  --require-linear-history=true \
  --require-linear-history=true \
  --restrict-dismissals=true \
  --restrict-force-push=true \
  --restrict-delete=true
```

---

## Using branch Protection

### For Developers

**You cannot push directly to `main`.**

Instead:

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature
   ```

2. Make your changes and commit:
   ```bash
   git add .
   git commit -m "feat: your change"
   ```

3. Push to your branch:
   ```bash
   git push origin feature/your-feature
   ```

4. Open a Pull Request on GitHub
5. Wait for:
   - ✅ CI checks to pass
   - ✅ Code review approval
6. Merge via GitHub UI

### For Code Reviewers

1. Review the code for:
   - Code quality
   - Security issues
   - Test coverage
   - Documentation

2. Approve the PR if satisfied:
   ```
   Click "Approve" on the PR
   ```

3. If changes needed:
   ```
   Request changes with comments
   ```

### For Administrators

Administrators can override protection if absolutely necessary:

1. Click **Merge without waiting** (if enabled)
2. Or force push (not recommended):
   ```bash
   git push --force-with-lease origin feature/your-feature
   ```

---

## Troubleshooting

### "Branch protection rule cannot be created"

**Possible causes:**
- You don't have admin access to the repository
- Branch doesn't exist (create it first)
- Invalid branch name pattern

**Solution:** Ask repository owner to set up the rule

### "CI checks failing, cannot merge"

**Steps:**
1. View the failed check details on the PR
2. Fix the issues locally
3. Push new commits
4. CI reruns automatically
5. Merge when all checks pass

### "Need approval but can't get one"

**Options:**
1. Request review from a code owner
2. Ask in team chat/email
3. If urgent, contact repository admin

### "Want to merge but CI not done yet"

**Wait for:**
- Lint & Type Check: ~2 minutes
- Build: ~3-5 minutes
- Tests: ~2 minutes
- Security Audit: ~2 minutes

**Total time:** ~5-12 minutes

---

## Best Practices

### For Maintainers

1. **Review PRs promptly** (within 24 hours ideally)
2. **Run checks locally before requesting changes**
3. **Provide clear feedback** on what needs fixing
4. **Approve when satisfied** and all checks pass

### For Contributors

1. **Make small, focused PRs** (easier to review)
2. **Ensure local build passes**: `npm run build`
3. **Run linter locally**: `npm run lint`
4. **Write descriptive PR titles and descriptions**
5. **Respond to feedback promptly**

### For Teams

1. **Define code owners** in `.github/CODEOWNERS`
2. **Establish review SLA** (e.g., within 24 hours)
3. **Document approval process** in CONTRIBUTING.md
4. **Rotate reviewer responsibilities**

---

## Disabling (If Needed)

To disable branch protection (not recommended):

1. Go to **Settings → Branches**
2. Click the trash icon next to the rule
3. Confirm deletion

**Warning:** This removes all protection. Re-enable as soon as the issue is resolved.

---

## Additional Resources

- [GitHub Branch Protection Guide](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/managing-a-branch-protection-rule)
- [GitHub CLI Branch Protection Docs](https://cli.github.com/manual/gh_repo_rule)
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Development workflow
- [LAUNCH.md](../LAUNCH.md) - Deployment procedures

---

Last Updated: 2026-02-10
