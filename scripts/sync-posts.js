#!/usr/bin/env node
/**
 * Vault → Blog sync
 *
 * Copies markdown posts from ~/vault/posts/ into content/blog/ so the vault
 * is the single source of truth and publishing = writing in the vault.
 *
 * Frontmatter normalization:
 *   - tags: merges "posts" in (per-file tags would otherwise override the
 *     directory-level tags: ["posts"] and drop the post from the homepage)
 *   - status: draft  → draft: true (Eleventy skips drafts in production builds)
 *   - date: falls back to generated.at, then file mtime
 *   - title: falls back to the filename
 *   - strips OKF book-vault noise (type, sources) from blog output
 *
 * Usage: npm run sync   (from the blog directory)
 */

import { readdirSync, readFileSync, writeFileSync, unlinkSync, statSync, existsSync } from "node:fs";
import { join, basename } from "node:path";
import { homedir } from "node:os";
import YAML from "yaml";

const VAULT_DIR = join(homedir(), "vault", "posts");
const BLOG_DIR = join(process.cwd(), "content", "blog");

const SKIP_PREFIX = "_";          // _README.md, _template.md etc. never sync
const RESERVED = new Set(["index.md", "log.md"]); // OKF reserved filenames
const STRIP_KEYS = ["type", "sources"];           // OKF book-vault noise

function parseFrontmatter(content) {
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { data: {}, body: content };
  let data = {};
  try { data = YAML.parse(m[1]) || {}; } catch { data = {}; }
  return { data, body: content.slice(m[0].length) };
}

function serialize(frontmatter, body) {
  const fm = YAML.stringify(frontmatter).trimEnd();
  return `---\n${fm}\n---\n\n${body.trimStart()}`;
}

function normalizeTags(data) {
  let tags = Array.isArray(data.tags) ? data.tags
    : typeof data.tags === "string" ? data.tags.split(/[\s,]+/)
    : [];
  tags = tags.map(t => String(t).trim()).filter(Boolean);
  if (!tags.includes("posts")) tags.unshift("posts");
  return [...new Set(tags)];
}

function resolveDate(data, filePath) {
  if (data.date) return String(data.date).slice(0, 10);
  if (data.generated?.at) return String(data.generated.at).slice(0, 10);
  return new Date(statSync(filePath).mtime).toISOString().slice(0, 10);
}

function isSyncable(file) {
  return file.endsWith(".md") && !file.startsWith(SKIP_PREFIX) && !RESERVED.has(file);
}

const vaultFiles = readdirSync(VAULT_DIR).filter(isSyncable);
const synced = new Set();

for (const file of vaultFiles) {
  const vaultPath = join(VAULT_DIR, file);
  const raw = readFileSync(vaultPath, "utf8");
  const { data, body } = parseFrontmatter(raw);

  const fm = { ...data };
  for (const k of STRIP_KEYS) delete fm[k];
  delete fm.status; // consumed below

  if (data.status === "draft" || data.draft === true) fm.draft = true;
  fm.title = data.title || basename(file, ".md").replace(/[-_]/g, " ");
  fm.date = resolveDate(data, vaultPath);
  fm.tags = normalizeTags(data);

  writeFileSync(join(BLOG_DIR, file), serialize(fm, body));
  synced.add(file);
  console.log(`synced  ${file}`);
}

// Remove blog posts whose vault source disappeared (vault is source of truth)
let removed = 0;
if (existsSync(BLOG_DIR)) {
  for (const file of readdirSync(BLOG_DIR)) {
    if (isSyncable(file) && !synced.has(file)) {
      unlinkSync(join(BLOG_DIR, file));
      console.log(`removed ${file} (not in vault)`);
      removed++;
    }
  }
}

console.log(`\n${synced.size} synced, ${removed} removed.`);
if (synced.size === 0) console.log("Tip: drop a .md file into ~/vault/posts/ and rerun.");
