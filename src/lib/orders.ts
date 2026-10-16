import { rowsToCSV } from './csv';

export interface OrderItem {
  item: string;
  quantity: number;
  unit: string;
  source: string;
  customer: string;
  date: string;
}
export interface OrderParseResult { items: OrderItem[]; skipped: string[]; csv: string; }

// Require a positive quantity and recognizable unit/count marker to avoid
// incorrectly treating conversation and delivery instructions as orders.
const number = '(\\d+(?:\\.\\d+)?)';
const unit = '(kilograms?|kgs?|grams?|gm|g|litres?|liters?|ltr|ml|l|pieces?|pcs?|packets?|packs?|dozens?|nos?|units?)';
const prefixUnit = new RegExp('^' + number + '\\s*' + unit + '\\s+(.+)$', 'i');
const suffixUnit = new RegExp('^(.+?)\\s*[-–:]?\\s*' + number + '\\s*' + unit + '$', 'i');
const prefixCount = new RegExp('^' + number + '\\s*[x×]\\s*(.+)$', 'i');
const suffixCount = new RegExp('^(.+?)\\s*[-–:]?\\s*[x×]\\s*' + number + '$', 'i');
const prefixPieces = new RegExp('^' + number + '\\s+(.+)$', 'i');
const timestamp = '(?:\\d{1,2}[/.-]\\d{1,2}[/.-]\\d{2,4}),?\\s+\\d{1,2}:\\d{2}(?::\\d{2})?(?:\\s?(?:AM|PM))?';
const bracketMessage = new RegExp('^\\[(' + timestamp + ')\\]\\s*([^:]{1,80}):\\s*(.*)$', 'i');
const lineMessage = new RegExp('^(' + timestamp + ')\\s*[-–]\\s*([^:]{1,80}):\\s*(.*)$', 'i');
const bullet = /^(?:[-*•]\s+|\d+[.)]\s+)/;

function parseItem(line: string): Pick<OrderItem, 'item' | 'quantity' | 'unit'> | null {
  const clean = line.trim().replace(bullet, '').trim();
  if (!clean) return null;
  let match = clean.match(prefixUnit);
  let product: string | undefined;
  let quantity = 0;
  let measure = 'pcs';
  if (match) { quantity = Number(match[1]); measure = match[2]; product = match[3]; }
  else if ((match = clean.match(suffixUnit))) { product = match[1]; quantity = Number(match[2]); measure = match[3]; }
  else if ((match = clean.match(prefixCount))) { quantity = Number(match[1]); product = match[2]; }
  else if ((match = clean.match(suffixCount))) { product = match[1]; quantity = Number(match[2]); }
  else if ((match = clean.match(prefixPieces))) { quantity = Number(match[1]); product = match[2]; }
  else return null;
  product = product?.trim().replace(/\s*[,;.]$/, '').trim();
  if (!product || !Number.isFinite(quantity) || quantity <= 0 || quantity > 1_000_000 || !/[\p{L}]/u.test(product)) return null;
  if (/^(?:https?:\/\/|www\.)/i.test(product)) return null;
  return { item: product, quantity, unit: measure.toLowerCase() };
}

export function parseWhatsAppOrders(text: string): OrderParseResult {
  const items: OrderItem[] = [];
  const skipped: string[] = [];
  let customer = '';
  let date = '';
  if (text.length > 2_000_000) {
    return { items, skipped: ['Input exceeds the 2 million-character limit. Import a smaller chat export.'], csv: rowsToCSV([], ['customer','date','item','quantity','unit','source']) };
  }
  for (const originalLine of text.split(/\r?\n/)) {
    let line = originalLine.trim();
    if (!line) continue;
    const chat = line.match(bracketMessage) ?? line.match(lineMessage);
    if (chat) {
      date = chat[1];
      customer = chat[2].trim();
      line = chat[3].trim();
      if (!line) continue;
    }
    const item = parseItem(line);
    if (item) items.push({ ...item, customer, date, source: originalLine.trim() });
    else skipped.push(originalLine.trim());
  }
  return { items, skipped, csv: rowsToCSV(items.map(item => ({...item})), ['customer','date','item','quantity','unit','source']) };
}
