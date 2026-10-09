import { parseCSV, rowsToCSV } from './csv';
export interface PriceItem { item: string; price: number; unit: string; }
export interface PriceParseResult { items: PriceItem[]; skipped: string[]; csv: string; }

export function parsePriceList(text: string): PriceParseResult {
  const items: PriceItem[] = [];
  const skipped: string[] = [];
  // Parse the complete source, so quoted product names containing line breaks stay intact.
  // If the file itself has malformed quoting, return a visible skipped-line error.
  let rows: string[][];
  try { rows = parseCSV(text); }
  catch { return { items, skipped: text.trim() ? [text] : [], csv: rowsToCSV([], ['item','price','unit']) }; }
  for (const fields of rows) {
    if (fields.length === 1 && !fields[0].trim()) continue;
    if (fields.length < 2 || fields.length > 3) { skipped.push(fields.join(',')); continue; }
    const item = fields[0].trim();
    const priceStr = fields[1].trim().replace(/^[₹$]\s*/, '');
    const price = Number(priceStr);
    const unit = (fields[2] ?? 'each').trim() || 'each';
    if (!item || !priceStr || !Number.isFinite(price) || price < 0 || price > 1_000_000_000) {
      skipped.push(fields.join(',')); continue;
    }
    items.push({item, price, unit});
  }
  return { items, skipped, csv: rowsToCSV(items.map(x => ({...x})), ['item','price','unit']) };
}
