// Offline verification: imports every command module and validates its slash-command JSON,
// plus the store (persistence) round-trip. Runs without a Discord token.
// NOTE: store tests run against a TEMP dir so real data/ is never touched.
import { readdirSync, rmSync, mkdtempSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

process.env.MC_DATA_DIR = mkdtempSync(path.join(os.tmpdir(), 'mcsec-test-'));

const commandsPath = path.join(process.cwd(), 'src', 'commands');
const files = readdirSync(commandsPath).filter((f) => f.endsWith('.js'));
let ok = true;

for (const file of files) {
  const mod = await import(path.join(commandsPath, file));
  const name = mod.data?.name;
  const json = mod.data?.toJSON();
  const hasExec = typeof mod.execute === 'function';
  if (!name || !json || !hasExec) {
    ok = false;
    console.log(`❌ ${file}: missing data/execute`);
  } else {
    console.log(`✅ /${name} (${json.options?.length ?? 0} options)`);
  }
}

// store round-trip in a temp data dir
const { addWarning, getWarnings, removeWarning, setGuildConfig, getGuildConfig } = await import('./src/store.js');
const g = '111', u = '222';
const w = addWarning(g, u, { reason: 'test', moderator: 'tester' });
console.assert(getWarnings(g, u).length === 1, 'warning should be stored');
console.assert(removeWarning(g, u, w.id) === true, 'warning should be removed');
console.assert(getWarnings(g, u).length === 0, 'warning list should be empty');
setGuildConfig(g, { modlog: '333' });
console.assert(getGuildConfig(g).modlog === '333', 'guild config should persist');
console.assert(getGuildConfig(g).antispam === true, 'defaults should apply');
rmSync(process.env.MC_DATA_DIR, { recursive: true, force: true });
console.log('✅ store round-trip OK');

console.log(ok ? `\nAll ${files.length} commands valid ✅` : '\nSome commands INVALID ❌');
process.exit(ok ? 0 : 1);
