/** Downloads rows as a CSV file. Values are quoted so commas in project titles survive. */
export function downloadCsv(filename: string, header: string[], rows: (string | number)[][]) {
  const quote = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = [header, ...rows].map((r) => r.map(quote).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
