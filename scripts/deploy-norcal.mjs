#!/usr/bin/env node
/**
 * Deploy norcalcarbmobile.com static site to Cloudflare Pages.
 *
 * Auth: Cursor Cloud Agent secret `CF DEPLOY` (same slot as other deploy tokens).
 * Maps to CLOUDFLARE_API_TOKEN for wrangler.
 */
import { spawnSync, execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const siteDir = path.join(root, 'sites/norcalcarbmobile');
function getDeployToken() {
  const fromEnv =
    process.env['CF DEPLOY']?.trim() ||
    process.env.CF_DEPLOY?.trim() ||
    process.env.CLOUDFLARE_API_TOKEN?.trim();
  if (fromEnv) return fromEnv;
  try {
    return execSync("printenv 'CF DEPLOY'", { encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
}

const token = getDeployToken();

if (!token) {
  console.error(
    'Missing CF DEPLOY.\n' +
      'Set it in Cursor Cloud Agent secrets (same place as other deploy tokens).\n' +
      'Token needs Cloudflare Pages → Edit permission on the account.'
  );
  process.exit(1);
}

const build = spawnSync('npm', ['run', 'build'], { cwd: siteDir, stdio: 'inherit', shell: true });
if (build.status !== 0) process.exit(build.status ?? 1);

const env = {
  ...process.env,
  CLOUDFLARE_API_TOKEN: token,
};

const deploy = spawnSync(
  'npx',
  ['--yes', 'wrangler@latest', 'pages', 'deploy', 'dist', '--project-name=norcalcarbmobile', '--commit-dirty=true'],
  { cwd: siteDir, stdio: 'inherit', env, shell: true }
);

process.exit(deploy.status ?? 1);
