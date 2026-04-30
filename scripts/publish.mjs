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
	nextVersion = execSync('pnpm git-cliff --bumped-version', { encoding: 'utf-8' }).trim();
} else if (VALID_BUMPS.includes(override)) {
	nextVersion = execSync(`pnpm git-cliff --bump ${override} --bumped-version`, { encoding: 'utf-8' }).trim();
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

// Bump version and capture the new tag name
run(`pnpm version ${nextVersion}`);
const newTag = `v${nextVersion}`;

// Generate CHANGELOG.md for the new release
run(`pnpm git-cliff --tag ${newTag} --output CHANGELOG.md`);

// Amend the version commit to include the changelog
run('git add CHANGELOG.md');
run('git commit --amend --no-edit --no-verify');

// Re-tag on the amended commit
run(`git tag -f ${newTag}`);

run('git push --follow-tags');

console.log('\nTag pushed — GitHub Actions will build and deploy.');
