import { describe, expect, it } from 'vitest';
import { parseCSV, stringifyCSV, rowsToCSV } from '../src/lib/csv';
import { convertDate, fixCSVDateColumn, isAmbiguousDate } from '../src/lib/dates';
import { parseWhatsAppOrders } from '../src/lib/orders';
import { parsePriceList } from '../src/lib/prices';
import { validateImageOptions } from '../src/lib/image';
import { tools } from '../src/lib/registry';
import { toolContracts } from '../src/lib/tool-contracts';

describe('CSV safety and boundaries', () => {
  it('preserves empty trailing columns', () => expect(parseCSV('a,b,\nx,y,')).toEqual([['a','b',''],['x','y','']]));
  it('allows quoted multiline fields', () => expect(parseCSV('"a\nb",c')) .toEqual([['a\nb','c']]));
  it('rejects stray quotes inside fields', () => expect(() => parseCSV('abc"def,123')).toThrow('Unexpected quote'));
  it('rejects unexpected characters after a quote', () => expect(() => parseCSV('"abc"x,2')).toThrow('Unexpected character'));
  it('honors custom delimiters', () => expect(parseCSV('a;b\n1;2',';')).toEqual([['a','b'],['1','2']]));
  it('rejects invalid delimiter', () => expect(() => parseCSV('a','||')).toThrow('Delimiter'));
  it('escapes formula strings while preserving negative numbers', () => {
    const data = parseCSV(stringifyCSV([['=cmd','+cmd','@cmd','-cmd','-4.25', '\t=cmd']]));
    expect(data[0].slice(0,4).every(s=>s.startsWith("'"))).toBe(true);
    expect(data[0][4]).toBe('-4.25');
    expect(data[0][5]).toMatch(/^'/);
  });
  it('prevents formula-injection via record export', () => expect(rowsToCSV([{name:'=SUM(1,2)'}],['name'])).toContain("'=SUM"));
  it('protects against excessively large CSV inputs', () => expect(() => parseCSV('x'.repeat(3_000_001))).toThrow('3 MB'));
});

describe('date conversion edge cases', () => {
  it('accepts canonical ISO', () => expect(convertDate('2026-10-09','AUTO','ISO')).toBe('2026-10-09'));
  it('handles leap day in century years', () => { expect(convertDate('29/02/2000','DMY','ISO')).toBe('2000-02-29'); expect(convertDate('29/02/1900','DMY','ISO')).toBeNull(); });
  it('preserves ambiguous dates', () => expect(fixCSVDateColumn('date\n04/05/2026',0,'AUTO','ISO').ambiguous).toBe(1));
  it('does not flag impossible dates as merely ambiguous', () => expect(isAmbiguousDate('31/04/2026')).toBe(false));
  it('rejects invalid column indices', () => expect(() => fixCSVDateColumn('date\n1/1/2026',3,'AUTO','ISO')).toThrow('valid date column'));
  it('counts empty dates as unchanged', () => expect(fixCSVDateColumn('date\n\n2026-10-09',0,'AUTO','ISO').unchanged).toBeGreaterThanOrEqual(1));
  it('supports semicolon separated inputs', () => expect(fixCSVDateColumn('name;date\nA;31/12/2025',1,'AUTO','ISO',';').csv).toContain('A;2025-12-31'));
});

describe('order extraction edge cases', () => {
  it('accepts phone timestamp and preserves raw source', () => {
    const item = parseWhatsAppOrders('[09/10/2026, 10:12 AM] Rahul: 2 kg Rice').items[0];
    expect(item.item).toBe('Rice'); expect(item.source).toContain('Rahul:');
  });
  it('accepts sender timestamp with seconds', () => expect(parseWhatsAppOrders('[09/10/2026, 10:12:05] Rahul: Sugar 1 kg').items[0]?.item).toBe('Sugar'));
  it('accepts bullet list with units', () => expect(parseWhatsAppOrders('• 5 packets Biscuits').items[0]?.quantity).toBe(5));
  it('rejects negative and absurd quantities', () => expect(parseWhatsAppOrders('-1 kg Rice\n1000001 kg Sugar').skipped).toHaveLength(2));
  it('keeps unrecognized messages for review', () => expect(parseWhatsAppOrders('hello there').skipped).toEqual(['hello there']));
  it('does not crash on empty input', () => expect(parseWhatsAppOrders('').items).toEqual([]));
});

describe('price list input', () => {
  it('parses quoted commas', () => expect(parsePriceList('"Rice, premium",65,kg').items[0].item).toBe('Rice, premium'));
  it('parses quoted line breaks', () => expect(parsePriceList('"Blue\nSoap",12,each').items[0].item).toBe('Blue\nSoap'));
  it('accepts zero-cost promotional items', () => expect(parsePriceList('Sample,0').items[0].price).toBe(0));
  it('rejects negative prices', () => expect(parsePriceList('Broken,-5').skipped).toHaveLength(1));
  it('does not accept malformed quote', () => expect(parsePriceList('"bad,14').skipped).toHaveLength(1));
});

describe('image processing guardrails', () => {
  const opts = {width: 200, height: 230, maxKB: 50, fit: 'contain' as const};
  const file = {type:'image/png', size:123};
  it('accepts a valid source and target', () => expect(()=>validateImageOptions(file,opts)).not.toThrow());
  it('rejects SVG', () => expect(()=>validateImageOptions({...file,type:'image/svg+xml'},opts)).toThrow('SVG'));
  it('rejects excessive upload size', () => expect(()=>validateImageOptions({...file,size:16_000_000},opts)).toThrow('15 MB'));
  it('rejects invalid dimensions', () => expect(()=>validateImageOptions(file,{...opts,width:0})).toThrow('Dimensions'));
  it('rejects overly large output pixel area', () => expect(()=>validateImageOptions(file,{...opts,width:4000,height:4000})).toThrow('12 megapixel'));
  it('rejects fractional dimensions', () => expect(()=>validateImageOptions(file,{...opts,height:20.5})).toThrow('Dimensions'));
  it('rejects invalid target size', () => expect(()=>validateImageOptions(file,{...opts,maxKB:0})).toThrow('Target size'));
});

describe('tool registry integrity', () => {
  it('has five unique SEO slugs', () => expect(new Set(tools.map(t=>t.slug)).size).toBe(5));
  it('has matching future tool contracts', () => expect(toolContracts.map(t=>t.id).sort()).toEqual(tools.map(t=>t.slug).sort()));
});
