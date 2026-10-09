export function downloadBlob(blob: Blob, filename: string): void {
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url; link.download = filename;
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function downloadText(text: string, filename: string, type = 'text/csv;charset=utf-8'): void {
  downloadBlob(new Blob(['\uFEFF', text], {type}), filename);
}
