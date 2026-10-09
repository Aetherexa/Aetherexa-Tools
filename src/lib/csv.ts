/** RFC4180-style CSV reader with support for quoted separators, newlines and escaped quotes. */
export function parseCSV(input: string, delimiter = ','): string[][] {
  if (delimiter.length !== 1) throw new Error('Delimiter must be one character.');
  const source = input.replace(/^\uFEFF/, '');
  if (source.length > 3_000_000) throw new Error('CSV exceeds the 3 MB processing limit.');
  if (!source.trim()) return [];
  const records: string[][] = [];
  let row: string[] = []; let cell = ''; let quoted = false; let afterQuote = false;
  for (let i = 0; i < source.length; i++) {
    const c = source[i];
    if (quoted) {
      if (c === '"' && source[i+1] === '"') { cell += '"'; i++; }
      else if (c === '"') { quoted = false; afterQuote = true; }
      else { cell += c; }
    } else if (afterQuote) {
      if (c === delimiter) { row.push(cell); cell = ''; afterQuote = false; }
      else if (c === '\n' || c === '\r') {
        row.push(cell); records.push(row); cell = ''; row = []; afterQuote = false;
        if (c === '\r' && source[i+1] === '\n') i++;
      } else if (c !== ' ' && c !== '\t') {
        throw new Error(`Unexpected character after closing quote near position ${i+1}.`);
      }
    } else if (c === '"') {
      if (cell.length) throw new Error(`Unexpected quote near position ${i+1}.`);
      cell = ''; quoted = true;
    } else if (c === delimiter) { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') {
      row.push(cell); records.push(row); cell = ''; row = [];
      if (c === '\r' && source[i+1] === '\n') i++;
    } else { cell += c; }
  }
  if (quoted) throw new Error('CSV contains an unclosed quoted field.');
  if (row.length || cell.length || afterQuote) { row.push(cell); records.push(row); }
  if (records.length > 100_000) throw new Error('CSV exceeds the 100,000 row limit.');
  return records;
}
export function stringifyCSV(rows: readonly (readonly (string | number)[])[], delimiter = ','): string {
  return rows.map(row => row.map(value => {
    const raw = String(value ?? '');
    // Mitigate spreadsheet formula injection when untrusted text is opened in Excel.
    const s = /^[\s]*[=+@-]/.test(raw) && !/^-\d+(?:\.\d+)?$/.test(raw) ? `\'${raw}` : raw;
    return /["\r\n]/.test(s) || s.includes(delimiter) || /^\s|\s$/.test(s)
      ? `"${s.replaceAll('"', '""')}"` : s;
  }).join(delimiter)).join('\r\n');
}
export function rowsToCSV(rows: Record<string, string | number>[], columns: string[]): string {
  return stringifyCSV([columns, ...rows.map(row => columns.map(key => row[key] ?? ''))]);
}
