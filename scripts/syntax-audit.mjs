// Offline syntax-only validation. Real TypeScript and Astro semantic checks run in CI.
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { readFile, readdir } from 'node:fs/promises';
import { join, extname } from 'node:path';
const require = createRequire(import.meta.url);
const globalModules = execFileSync('npm', ['root', '-g'], {encoding:'utf8'}).trim();
let ts;
try { ts = require(join(globalModules, 'typescript')); }
catch { console.warn('Global TypeScript unavailable; run npm run typecheck after install.'); process.exit(0); }
let total = 0;
const errors = [];
async function walk(folder) {
  for (const entry of await readdir(folder,{withFileTypes:true})) {
    const path = join(folder,entry.name);
    if (entry.isDirectory()) {await walk(path);continue;}
    const ext = extname(path);
    if (!['.ts','.tsx','.astro','.mjs'].includes(ext)) continue;
    let content = await readFile(path,'utf8');
    if (ext === '.astro') {
      const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      if (!match) {errors.push(`${path}: missing Astro frontmatter`);continue;}
      content=match[1];
    }
    if (ext === '.mjs') continue;
    const res = ts.transpileModule(content,{fileName:ext === '.astro'?`${path}.ts`:path,compilerOptions:{jsx:ts.JsxEmit.ReactJSX, target:ts.ScriptTarget.ES2022},reportDiagnostics:true});
    for (const diag of res.diagnostics ?? []) if(diag.category === ts.DiagnosticCategory.Error) errors.push(`${path}: ${ts.flattenDiagnosticMessageText(diag.messageText,' ')}`);
    total++;
  }
}
for (const dir of ['src','tests','e2e','scripts']) await walk(dir);
if (errors.length) {console.error(errors.join('\n'));process.exitCode=1;}
else console.log('Offline TypeScript and Astro frontmatter syntax check passed for',total,'files');
