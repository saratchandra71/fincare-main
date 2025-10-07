
import Papa from 'papaparse'

export type CSVRow = Record<string, string>

export async function parseCSVFromUrl(url: string): Promise<CSVRow[]> {
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`)
  const text = await res.text()
  return new Promise((resolve, reject) => {
    Papa.parse<CSVRow>(text, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete: (results) => {
        resolve(results.data)
      },
      error: (err) => reject(err),
    })
  })
}
