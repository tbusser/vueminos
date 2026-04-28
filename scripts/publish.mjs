#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createInterface } from 'node:readline/promises';

const VALID_BUMPS = ['patch', 'minor', 'major'];
const bump = process.argv[2] ?? 'patch';

if (!VALID_BUMPS.includes(bump)) {
	console.error(`Usage: pnpm run publish [${VALID_BUMPS.join('|')}]`);
	process.exit(1);
}

try {
	execSync('git diff --quiet && git diff --cached --quiet');
} catch {
	console.error('Error: uncommitted changes present. Commit or stash them first.');
	process.exit(1);
}

const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf-8'));
const [major, minor, patch] = version.split('.').map(Number);
const nextVersion = bump === 'major' ? `${major + 1}.0.0`
	: bump === 'minor' ? `${major}.${minor + 1}.0`
	: `${major}.${minor}.${patch + 1}`;

const rl = createInterface({ input: process.stdin, output: process.stdout });
const answer = await rl.question(`Release v${nextVersion} (${bump})? [y/N] `);
rl.close();

if (answer.toLowerCase() !== 'y') {
	console.log('Aborted.');
	process.exit(0);
}

const run = cmd => execSync(cmd, { stdio: 'inherit' });

run(`pnpm version ${bump}`);
run('git push --follow-tags');

console.log('\nTag pushed — GitHub Actions will build and deploy.');
