#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { createInterface } from 'node:readline/promises';

const VALID_BUMPS = ['patch', 'minor', 'major'];
const override = process.argv[2]; // optional: patch|minor|major|x.y.z

if (override && !VALID_BUMPS.includes(override) && !/^\d+\.\d+\.\d+$/.test(override)) {
	console.error('Usage: pnpm release [patch|minor|major|x.y.z]');
	process.exit(1);
}

try {
	execSync('git diff --quiet && git diff --cached --quiet');
} catch {
	console.error('Error: uncommitted changes present. Commit or stash them first.');
	process.exit(1);
}

let nextVersion;
if (!override) {
	nextVersion = execSync('pnpm git-cliff --unreleased --bumped-version', { encoding: 'utf-8' }).trim();
} else if (VALID_BUMPS.includes(override)) {
	nextVersion = execSync(`pnpm git-cliff --unreleased--bump ${override} --bumped-version`, { encoding: 'utf-8' }).trim();
} else {
	nextVersion = override;
}

const rl = createInterface({ input: process.stdin, output: process.stdout });
const answer = await rl.question(`Release ${nextVersion}? [y/N] `);
rl.close();

if (answer.toLowerCase() !== 'y') {
	console.log('Aborted.');
	process.exit(0);
}

const run = cmd => execSync(cmd, { stdio: 'inherit' });

const newTag = `${nextVersion}`;

// Bump package.json only — no commit, no tag yet
run(`pnpm version --no-git-tag-version ${nextVersion}`);

// Prepend the new release section to CHANGELOG.md
run(`pnpm git-cliff --tag ${newTag} --unreleased --prepend CHANGELOG.md`);

// Single clean commit with both changed files
run('git add package.json CHANGELOG.md');
run(`git commit -m "chore(release): ${newTag}"`);

// Tag the clean commit (annotated so --follow-tags picks it up)
run(`git tag -a ${newTag} -m "Release ${newTag}"`);

run('git push --follow-tags');

console.log('\nTag pushed — GitHub Actions will build and deploy.');
