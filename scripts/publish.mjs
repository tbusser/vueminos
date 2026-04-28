#!/usr/bin/env node
import { execSync } from 'node:child_process';

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

const run = cmd => execSync(cmd, { stdio: 'inherit' });

run(`pnpm version ${bump}`);
run('git push --follow-tags');

console.log('\nTag pushed — GitHub Actions will build and deploy.');
