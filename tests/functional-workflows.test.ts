import { describe, expect, it } from 'vitest';
import { parseCSV } from '../src/lib/csv';
import { parseWhatsAppOrders } from '../src/lib/orders';
import { fixCSVDateColumn } from '../src/lib/dates';
import { parsePriceList } from '../src/lib/prices';

describe('WhatsApp export workflow', () => {
  it('preserves different senders and timestamps across multiline chat exports', () => {
    const chat = '[16/10/2026, 9:00 PM] Anita: 2 kg Rice\n3x Soap\n16/10/2026, 21:03 - Ravi: Sugar 1 kg\nPlease deliver tomorrow';
    const result = parseWhatsAppOrders(chat);
    expect(result.items).toHaveLength(3);
    expect(result.items.map(item => item.customer)).toEqual(['Anita','Anita','Ravi']);
    expect(result.items[2].date).toBe('16/10/2026, 21:03');
    expect(result.skipped).toEqual(['Please deliver tomorrow']);
    const csv = parseCSV(result.csv);
    expect(csv[0]).toEqual(['customer','date','item','quantity','unit','source']);
    expect(csv[1][0]).toBe('Anita');
    expect(csv[3][0]).toBe('Ravi');
  });
  it('supports unmarked piece counts but does not invent quantities for text-only chat', () => {
    const result = parseWhatsAppOrders('2 Soap\nPlease deliver soon\n5 packets Biscuits');
    expect(result.items.map(item => item.quantity)).toEqual([2,5]);
    expect(result.skipped).toEqual(['Please deliver soon']);
  });
  it('rejects oversized imports safely', () => {
    const result = parseWhatsAppOrders('x'.repeat(2_000_001));
    expect(result.items).toEqual([]);
    expect(result.skipped[0]).toMatch(/limit/);
  });
});

describe('CSV and price list workflows', () => {
  it('exports tab-separated corrected dates without modifying non-date columns', () => {
    const result = fixCSVDateColumn('name\tdate\tqty\nAsha\t31/12/2025\t7',1,'AUTO','ISO','\t');
    expect(parseCSV(result.csv,'\t')[1]).toEqual(['Asha','2025-12-31','7']);
  });
  it('accepts previously exported price CSV with its header row', () => {
    const result = parsePriceList('item,price,unit\nRice,65,kg\nSoap,35,each');
    expect(result.items).toHaveLength(2);
    expect(result.skipped).toEqual([]);
  });
  it('reports malformed prices instead of exporting them as valid products', () => {
    const result = parsePriceList('Rice,65,kg\nSoap,hello,each');
    expect(result.items).toHaveLength(1);
    expect(result.skipped).toHaveLength(1);
  });
});
