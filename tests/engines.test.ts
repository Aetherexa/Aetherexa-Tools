import { describe, expect, it } from 'vitest';
import { parseCSV, stringifyCSV } from '../src/lib/csv';
import { convertDate, fixCSVDateColumn } from '../src/lib/dates';
import { parseWhatsAppOrders } from '../src/lib/orders';
import { parsePriceList } from '../src/lib/prices';

describe('CSV reader', () => {
 it('round trips quotes, embedded commas and newlines', () => { const data = [['name','note'], ['Rice, premium','A "quoted"\nline']]; expect(parseCSV(stringifyCSV(data))).toEqual(data); });
 it('neutralizes spreadsheet formulas in exported text', () => expect(parseCSV(stringifyCSV([['=1+2']]))[0][0]).toMatch(/^'/));
 it('handles BOM and Windows line endings', () => expect(parseCSV('\uFEFFa,b\r\n1,2\r\n')).toEqual([['a','b'],['1','2']]));
 it('rejects broken quotes', () => expect(() => parseCSV('a,"oops')).toThrow(/unclosed/));
});
describe('Date fixer', () => {
 it('handles valid leap dates', () => expect(convertDate('29/02/2024','DMY','ISO')).toBe('2024-02-29'));
 it('rejects impossible dates', () => expect(convertDate('29/02/2025','DMY','ISO')).toBeNull());
 it('auto-converts mixed unambiguous dates', () => { const r=fixCSVDateColumn('name,date\nA,31/12/2025\nB,12/31/2025\nC,2026-10-09\nD,03/04/2026',1,'AUTO','ISO');expect(r.fixed).toBe(2);expect(r.unchanged).toBe(1);expect(r.ambiguous).toBe(1);expect(r.csv).toContain('D,03/04/2026'); });
 it('does not silently reinterpret ambiguous dates', () => { expect(convertDate('03/04/2026','DMY','ISO')).toBe('2026-04-03'); expect(convertDate('03/04/2026','MDY','ISO')).toBe('2026-03-04'); });
 it('preserves invalid rows for review', () => { const result = fixCSVDateColumn('name,date\nA,31/12/2025\nB,31/02/2025',1,'DMY','ISO'); expect(result.fixed).toBe(1); expect(result.invalid).toBe(1); expect(result.csv).toContain('B,31/02/2025'); });
});
describe('WhatsApp order extractor', () => {
 it('extracts prefix, suffix and x counts', () => { const result = parseWhatsAppOrders('2 kg rice\nSugar 1 kg\n3x soap\nhello'); expect(result.items.map(x=>x.quantity)).toEqual([2,1,3]); expect(result.skipped).toEqual(['hello']); });
 it('strips WhatsApp timestamps and senders', () => expect(parseWhatsAppOrders('[09/10/2026, 10:12 AM] Ravi: 2 kg rice').items[0]?.item).toBe('rice'));
 it('escapes commas in item names in downloaded CSV', () => expect(parseWhatsAppOrders('2x Rice, premium').csv).toContain('"Rice, premium"'));
});
describe('Price list parser', () => {
 it('reads prices and units', () => expect(parsePriceList('Rice,65,kg\nSoap,35,each').items).toHaveLength(2));
 it('does not accept malformed prices', () => expect(parsePriceList('Rice,free\nSoap,12').skipped).toEqual(['Rice,free']));
});
