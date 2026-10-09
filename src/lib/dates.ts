import { parseCSV, stringifyCSV } from './csv';
export type DateFormat = 'AUTO' | 'DMY' | 'MDY' | 'YMD';
export type DateOutput = 'ISO' | 'DMY' | 'MDY';
function validDate(year: number, month: number, day: number): boolean {
  if (!Number.isInteger(year) || year < 1000 || year > 9999 || month < 1 || month > 12 || day < 1 || day > 31) return false;
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}
const pad = (value: number) => String(value).padStart(2, '0');
function detectDateFormat(value: string): Exclude<DateFormat,'AUTO'> | null {
  const trimmed = value.trim();
  const match = trimmed.match(/^(\d{1,4})[\/-](\d{1,2})[\/-](\d{1,4})$/);
  if (!match) return null;
  const [, a, b, c] = match;
  if (a.length === 4 && c.length <= 2) return 'YMD';
  if (c.length !== 4) return null;
  const first = Number(a); const second = Number(b);
  if (first > 12 && second >= 1 && second <= 12) return 'DMY';
  if (second > 12 && first >= 1 && first <= 12) return 'MDY';
  // Dates like 03/04/2026 are not safe to infer; retain unchanged.
  return null;
}
export function isAmbiguousDate(value: string): boolean {
  const match = value.trim().match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
  if (!match) return false;
  const [, a, b, c] = match;
  return Number(a) <= 12 && Number(b) <= 12 && Number(a) >= 1 && Number(b) >= 1 && validDate(Number(c),Number(a),Number(b)) && validDate(Number(c),Number(b),Number(a));
}
export function convertDate(value: string, input: DateFormat, output: DateOutput): string | null {
  const format = input === 'AUTO' ? detectDateFormat(value) : input;
  if (!format) return null;
  const match = value.trim().match(/^(\d{1,4})[\/-](\d{1,2})[\/-](\d{1,4})$/);
  if (!match) return null;
  const [, a, b, c] = match; const p = [Number(a), Number(b), Number(c)];
  const [year, month, day] = format === 'YMD' ? [p[0],p[1],p[2]] : format === 'DMY' ? [p[2],p[1],p[0]] : [p[2],p[0],p[1]];
  if (String(year).length !== 4 || !validDate(year, month, day)) return null;
  if (output === 'ISO') return `${year}-${pad(month)}-${pad(day)}`;
  return output === 'DMY' ? `${pad(day)}/${pad(month)}/${year}` : `${pad(month)}/${pad(day)}/${year}`;
}
export interface DateFixResult { headers: string[]; rows: string[][]; fixed: number; invalid: number; ambiguous: number; unchanged: number; csv: string; }
export function fixCSVDateColumn(text: string, column: number, input: DateFormat, output: DateOutput, delimiter = ','): DateFixResult {
  const records = parseCSV(text, delimiter);
  if (!records.length) throw new Error('Paste or upload a CSV file first.');
  const [headers, ...data] = records;
  if (column < 0 || column >= headers.length) throw new Error('Select a valid date column.');
  let fixed = 0; let invalid = 0; let unchanged = 0; let ambiguous = 0;
  const rows = data.map(row => {
    const result = [...row]; const original = result[column] ?? '';
    if (!original.trim()) { unchanged++; return result; }
    const converted = convertDate(original, input, output);
    if (converted === null) {
      if (input === 'AUTO' && isAmbiguousDate(original)) ambiguous++;
      else invalid++;
      return result;
    }
    if (original === converted) unchanged++; else fixed++;
    result[column] = converted;
    return result;
  });
  return { headers, rows, fixed, invalid, ambiguous, unchanged, csv: stringifyCSV([headers, ...rows], delimiter) };
}
