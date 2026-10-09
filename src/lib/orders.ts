import { rowsToCSV } from './csv';

export interface OrderItem { item: string; quantity: number; unit: string; source: string; }
export interface OrderParseResult { items: OrderItem[]; skipped: string[]; csv: string; }

const number = '(\\d+(?:\\.\\d+)?)';
const unit = '(kg|kgs|g|gm|grams?|ltr|litres?|liters?|l|ml|pcs?|pieces?|packets?|packs?|dozen|nos?|units?)';
const prefixUnit = new RegExp(`^${number}\\s*${unit}\\s+(.+)$`, 'i');
const suffixUnit = new RegExp(`^(.+?)\\s*[-–:]?\\s*${number}\\s*${unit}$`, 'i');
const prefixCount = new RegExp(`^${number}\\s*[x×]\\s*(.+)$`, 'i');
const suffixCount = new RegExp(`^(.+?)\\s*[-–:]?\\s*[x×]\\s*${number}$`, 'i');
// WhatsApp's most common copy format is "[dd/mm/yyyy, hh:mm] Sender: message".
// A second line may omit the timestamp/sender, and must still be parsed.
const whatsappPrefix = /^\[\d{1,2}[\/.\-]\d{1,2}[\/.\-]\d{2,4},?\s+\d{1,2}:\d{2}(?::\d{2})?(?:\s?(?:AM|PM))?\]\s*[^:]{1,80}:\s*/i;
const unbracketedPrefix = /^\d{1,2}[\/.\-]\d{1,2}[\/.\-]\d{2,4},?\s+\d{1,2}:\d{2}(?::\d{2})?(?:\s?(?:AM|PM))?\s*[-–]\s*[^:]{1,80}:\s*/i;
const bullet = /^(?:\s*[-*•]\s+|\s*\d+[.)]\s+)/;

function cleanMessage(value: string): string {
  return value.replace(whatsappPrefix, '').replace(unbracketedPrefix, '').replace(bullet, '').trim();
}

export function parseWhatsAppOrders(text: string): OrderParseResult {
  const items: OrderItem[] = [];
  const skipped: string[] = [];
  for (const originalLine of text.split(/\r?\n/)) {
    const line = cleanMessage(originalLine);
    if (!line) continue;
    let match = line.match(prefixUnit);
    let item: string | undefined; let quantity = 0; let measure = 'pcs';
    if (match) { [, , measure, item] = match; quantity = Number(match[1]); }
    else if ((match = line.match(suffixUnit))) { [, item, , measure] = match; quantity = Number(match[2]); }
    else if ((match = line.match(prefixCount))) { [, , item] = match; quantity = Number(match[1]); }
    else if ((match = line.match(suffixCount))) { [, item] = match; quantity = Number(match[2]); }
    if (!item?.trim() || !Number.isFinite(quantity) || quantity <= 0 || quantity > 1_000_000) {
      skipped.push(originalLine);
      continue;
    }
    items.push({ item: item.trim(), quantity, unit: measure.toLowerCase(), source: originalLine.trim() });
  }
  return { items, skipped, csv: rowsToCSV(items.map(item => ({...item})), ['item','quantity','unit','source']) };
}
