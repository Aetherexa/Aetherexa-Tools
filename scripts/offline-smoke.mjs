/** Dependency-free regression checks for restricted development environments (Node 22+).
 * Official CI uses Vitest + Playwright; this is a limited independent fallback.
 */
import { mkdtemp, cp, readFile, writeFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
const dir = await mkdtemp(join(tmpdir(), 'aetherexa-offline-'));
try {
  await cp('src/lib', join(dir, 'lib'), {recursive: true});
  for (const file of await readdir(join(dir,'lib'))) {
    if (!file.endsWith('.ts')) continue;
    const path = join(dir,'lib',file);
    const content = await readFile(path,'utf8');
    await writeFile(path, content.replace(/(from\s+['"]\.\/[^'".]+)(['"])/g, '$1.ts$2'));
  }
  await writeFile(join(dir,'package.json'),JSON.stringify({type:'module'}));
  await writeFile(join(dir,'verify.mjs'), `
import assert from 'node:assert/strict';
import {parseCSV, stringifyCSV} from './lib/csv.ts';
import {convertDate,fixCSVDateColumn} from './lib/dates.ts';
import {parseWhatsAppOrders} from './lib/orders.ts';
import {parsePriceList} from './lib/prices.ts';
import {validateImageOptions} from './lib/image.ts';
import {tools} from './lib/registry.ts';
import {toolContracts} from './lib/tool-contracts.ts';
const checks = [];
const check = (name, fn) => {fn();checks.push(name);};
check('round-trip CSV multiline quotes',()=>assert.deepEqual(parseCSV(stringifyCSV([['A, B','C"D\\nE']])),[['A, B','C"D\\nE']]));
check('BOM',()=>assert.deepEqual(parseCSV('\\uFEFFa,b\\r\\n1,2'),[['a','b'],['1','2']]));
check('trailing CSV fields',()=>assert.deepEqual(parseCSV('a,b,\\n1,2,'),[['a','b',''],['1','2','']]));
check('broken quote',()=>assert.throws(()=>parseCSV('"abc'),/unclosed/));
check('stray quote',()=>assert.throws(()=>parseCSV('x"y'),/Unexpected quote/));
check('injection prevention',()=>assert.ok(parseCSV(stringifyCSV([['=1+2']]))[0][0].startsWith("'")));
check('negative numeric',()=>assert.equal(parseCSV(stringifyCSV([[-123]]))[0][0],'-123'));
check('oversized input',()=>assert.throws(()=>parseCSV('x'.repeat(3000001)),/3 MB/));
check('leap day',()=>assert.equal(convertDate('29/02/2024','DMY','ISO'),'2024-02-29'));
check('invalid leap day',()=>assert.equal(convertDate('29/02/2025','DMY','ISO'),null));
check('ISO support',()=>assert.equal(convertDate('2026-10-09','AUTO','ISO'),'2026-10-09'));
check('ambiguous dates reported',()=>assert.equal(fixCSVDateColumn('date\\n03/04/2026',0,'AUTO','ISO').ambiguous,1));
check('unambiguous mix',()=>assert.equal(fixCSVDateColumn('date\\n31/12/2025\\n12/31/2025',0,'AUTO','ISO').fixed,2));
check('semicolon date conversion',()=>assert.ok(fixCSVDateColumn('name;date\\nA;31/12/2025',1,'AUTO','ISO',';').csv.includes('2025-12-31')));
check('orders 3 formats',()=>assert.equal(parseWhatsAppOrders('2 kg rice\\nSugar 1 kg\\n3x soap').items.length,3));
check('WhatsApp name removed',()=>assert.equal(parseWhatsAppOrders('[09/10/2026, 10:12 AM] Ravi: 2 kg rice').items[0].item,'rice'));
check('bullet input',()=>assert.equal(parseWhatsAppOrders('• 5 packets Biscuits').items[0].quantity,5));
check('reject unparsed lines',()=>assert.equal(parseWhatsAppOrders('unknown line').skipped.length,1));
check('reject massive quantity',()=>assert.equal(parseWhatsAppOrders('1000001 kg rice').skipped.length,1));
check('basic prices',()=>assert.equal(parsePriceList('Rice,65,kg').items.length,1));
check('quoted comma price',()=>assert.equal(parsePriceList('"Rice, premium",65,kg').items[0].item,'Rice, premium'));
check('multiline quoted price',()=>assert.equal(parsePriceList('"Blue\\nSoap",12').items[0].item,'Blue\\nSoap'));
check('invalid prices',()=>assert.equal(parsePriceList('Rice,free').skipped.length,1));
check('valid image options',()=>assert.doesNotThrow(()=>validateImageOptions({type:'image/png',size:300},{width:200,height:230,maxKB:50,fit:'contain'})));
check('reject SVG',()=>assert.throws(()=>validateImageOptions({type:'image/svg+xml',size:300},{width:200,height:230,maxKB:50,fit:'contain'}),/SVG/));
check('reject huge output',()=>assert.throws(()=>validateImageOptions({type:'image/png',size:300},{width:4000,height:4000,maxKB:50,fit:'contain'}),/12 megapixel/));
check('five distinct tools',()=>assert.equal(new Set(tools.map(t=>t.slug)).size,5));
check('MCP contracts match tools',()=>assert.deepEqual(toolContracts.map(t=>t.id).sort(),tools.map(t=>t.slug).sort()));
console.log('OFFLINE REGRESSIONS PASS:',checks.length,'checks');
`);
  const result = spawnSync(process.execPath,['--experimental-strip-types','--no-warnings',join(dir,'verify.mjs')], {encoding:'utf8'});
  process.stdout.write(result.stdout);process.stderr.write(result.stderr);
  if (result.status !== 0) process.exitCode = 1;
} finally {await rm(dir,{recursive:true,force:true});}
