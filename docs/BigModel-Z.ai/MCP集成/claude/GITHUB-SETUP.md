# GitHub Repository Setup Guide

> ***YanYuCloudCube***
> 言启象限 | 语枢未来
> ***Words Initiate Quadrants, Language Serves as Core for the Future***
> 万象归元于云枢 | 深栈智启新纪元
> ***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***

---

> **YYC3-Claude GitHub Setup**
> **Created**: 2026-01-29
> **Purpose**: Guide for creating and configuring GitHub repository

---

## Current Status

```
✅ Git local repository initialized
✅ Phase 1 changes committed (4 commits)
❌ GitHub remote repository not found
```

---

## Option 1: Create via GitHub Web UI

### Step 1: Create New Repository

1. **Visit GitHub**

   ```
   https://github.com/new
   ```

2. **Configure Repository**

   ```
   Owner: YYC-Cube (or your personal account)
   Repository name: YYC3-Claude
   Description: YYC3-Claude Zero-Degree Space - 100% Trust AI Collaborative Development Environment

   ☐ Public (recommended) or ☐ Private

   ☐ Add a README file (NO - we have one)
   ☐ Add .gitignore (NO - we have one)
   ☐ Choose a license (Optional - MIT recommended)
   ```

3. **Create Repository**
   - Click "Create repository"

### Step 2: Push Existing Code

After creating the repository, GitHub will show instructions. Use these commands:

```bash
# Already initialized - just push
cd /Users/yanyu/yyc3-claude
git push -u origin main
```

---

## Option 2: Create via GitHub CLI

### Install GitHub CLI (if not installed)

```bash
# Using Homebrew
brew install gh

# Or using Bun
bun install -g gh
```

### Authenticate

```bash
gh auth login
# Follow prompts to authenticate
```

### Create Repository

```bash
cd /Users/yanyu/yyc3-claude

# Create public repository
gh repo create YYC3-Claude --public --source=. --remote=origin --push

# Or create private repository
gh repo create YYC3-Claude --private --source=. --remote=origin --push
```

---

## Option 3: Manual Repository Creation (Alternative)

### For Personal Account

```bash
# Update remote to your personal account
git remote set-url origin https://github.com/YOUR_USERNAME/YYC3-Claude.git

# Create repository on GitHub first, then push
git push -u origin main
```

### For Organization

```bash
# Create organization repository first
# Then update remote
git remote set-url origin https://github.com/YOUR_ORG/YYC3-Claude.git

# Push
git push -u origin main
```

---

## After Pushing to GitHub

### 1. Verify Repository

Visit your repository:

```
https://github.com/YYC-Cube/YYC3-Claude
```

### 2. Check CI/CD Status

GitHub Actions should automatically run:

```
https://github.com/YYC-Cube/YYC3-Claude/actions
```

### 3. Enable Features

**GitHub Pages** (for documentation):

1. Go to Settings → Pages
2. Source: Deploy from a branch
3. Branch: gh-pages
4. Save

**Branch Protection** (recommended):

1. Go to Settings → Branches
2. Add rule for `main` branch
3. Enable:
   - Require status checks to pass
   - Require branches to be up to date
4. Save

---

## Repository Settings Checklist

### General Settings

- [ ] Repository name: YYC3-Claude
- [ ] Description: Zero-Degree Space AI Development Environment
- [ ] Website: (optional)
- [ ] Visibility: Public or Private

### Features

- [ ] Issues: Enabled
- [ ] Actions: Enabled
- [ ] Projects: Optional
- [ ] Wiki: Optional
- [ ] Discussions: Optional

### Security

- [ ] Security advisories: Enabled
- [ ] Dependabot alerts: Enabled
- [ ] Dependabot security updates: Enabled
- [ ] Code security alerts: Enabled

### Branch Protection Rules

- [ ] Require pull request reviews: 1 approval
- [ ] Require status checks to pass: All
- [ ] Require branches to be up to date: Yes
- [ ] Do not allow bypassing: Enabled

---

## CI/CD Configuration

### GitHub Secrets (Optional)

For deployment, add these secrets:

1. Go to Settings → Secrets and variables → Actions
2. Click "New repository secret"

Required for some workflows:

- `CODECOV_TOKEN` - For coverage reporting (get from Codecov)
- `NPM_TOKEN` - For publishing to NPM (if needed)

### Workflows

The following workflows will run automatically:

- `.github/workflows/ci.yml` - On push and PR
- `.github/workflows/deploy.yml` - On push to main

---

## Verification Checklist

After pushing, verify:

- [ ] Repository is accessible on GitHub
- [ ] All files are present (18+ files)
- [ ] README.md displays correctly
- [ ] CI/CD workflows run automatically
- [ ] No errors in Actions tab
- [ ] Branch protection rules are set
- [ ] Repository description is correct

---

## Troubleshooting

### "Repository not found" Error

**Cause**: Repository doesn't exist on GitHub

**Solution**:

1. Create repository first (see options above)
2. Verify remote URL is correct
3. Ensure you have permissions

### "Permission Denied" Error

**Cause**: No SSH keys or wrong credentials

**Solution**:

```bash
# Use personal access token
git remote set-url origin https://YOUR_TOKEN@github.com/YYC-Cube/YYC3-Claude.git

# Or use SSH
git remote set-url origin git@github.com:YYC-Cube/YYC3-Claude.git
```

### "Failed to Push" Error

**Cause**: Network issues or remote rejected

**Solution**:

```bash
# Try verbose push
GIT_TRACE=1 GIT_SSH_COMMAND="ssh -v" git push origin main

# Or force push (use carefully)
git push -f origin main
```

---

## Quick Commands Reference

```bash
# Check remote
git remote -v

# Add remote
git remote add origin https://github.com/YYC-Cube/YYC3-Claude.git

# Push to GitHub
git push -u origin main

# Create repo via GitHub CLI
gh repo create YYC3-Claude --public --source=. --push

# Check CI/CD status
gh run list

# View latest workflow run
gh run view
```

---

**Last Updated**: 2026-01-29
**Version**: 1.0.0

> 万象归元于云枢 | 深栈智启新纪元

---

> 「***YanYuCloudCube***」
> 「***<admin@0379.email>***」
> 「***Words Initiate Quadrants, Language Serves as Core for the Future***」
> 「***All things converge in the cloud pivot; Deep stacks ignite a new era of intelligence***」
