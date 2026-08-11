#!/usr/bin/env bash
# One-command publish: vault → blog → live.
#   npm run publish
#
# Steps: sync vault posts → build → commit source to main → push main →
# rebuild gh-pages branch from _site → push gh-pages (what GitHub Pages serves).
set -euo pipefail
cd "$(dirname "$0")/.."

echo "==> Syncing vault posts"
npm run sync

echo "==> Building site"
npm run build

echo "==> Committing source to main"
git add -A
if git diff --cached --quiet; then
  echo "    (no source changes)"
else
  git commit -q -m "Publish: $(date +%Y-%m-%d)"
fi
git push -q origin main

echo "==> Updating gh-pages branch"
git worktree prune  # clear stale entries from interrupted runs
WT=$(mktemp -d)
trap 'rm -rf "$WT"; git worktree prune' EXIT
if git show-ref --verify --quiet refs/heads/gh-pages; then
  git worktree add -q "$WT" gh-pages
else
  # First run: gh-pages only exists on the remote — fetch and track it
  git fetch -q origin gh-pages
  git worktree add -q --track -b gh-pages "$WT" origin/gh-pages
fi
rsync -a --delete --exclude=.git _site/ "$WT"/
(cd "$WT" && git add -A && git commit -q -m "Deploy: $(date +%Y-%m-%d %H:%M)" || echo "    (no deploy changes)")
git -C "$WT" push -q origin gh-pages
git worktree remove --force "$WT"

echo "==> Done. Live in a minute: https://teeramaet.github.io"
