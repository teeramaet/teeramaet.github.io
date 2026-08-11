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
WT=$(mktemp -d)
trap 'rm -rf "$WT"' EXIT
git worktree add -q "$WT" gh-pages
rsync -a --delete _site/ "$WT"/
(cd "$WT" && git add -A && git commit -q -m "Deploy: $(date +%Y-%m-%d %H:%M)" || echo "    (no deploy changes)")
git -C "$WT" push -q origin gh-pages
git worktree remove "$WT"

echo "==> Done. Live in a minute: https://teeramaet.github.io"
