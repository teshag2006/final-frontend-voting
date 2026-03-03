import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const appDir = path.join(root, 'app');

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      out.push(...walk(full));
    } else if (full.endsWith('.ts') || full.endsWith('.tsx')) {
      out.push(full);
    }
  }
  return out;
}

const files = walk(appDir);
const offenders = [];

for (const file of files) {
  const src = readFileSync(file, 'utf8');
  if (
    src.includes('/mock') ||
    src.includes('-mock') ||
    src.includes('mock-data-generator')
  ) {
    offenders.push(path.relative(root, file));
  }
}

if (offenders.length > 0) {
  console.error('Mock references detected in app pages/routes:');
  for (const file of offenders) {
    console.error(` - ${file}`);
  }
  process.exit(1);
}

console.log('No mock references found in app pages/routes.');
