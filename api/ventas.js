const DEFAULT_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRZhG16c6gNzf_76m8fnRuDOnFbYdnDDvr-9PnoEiQOVQLL30TvE44RYisrBVXTUeuZFXvD6Mtqt7ht/pub?output=csv';
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  if (req.method !== 'GET') return res.status(405).json({error:'Método no permitido'});
  try {
    const source = process.env.SHEET_CSV_URL || DEFAULT_URL;
    const u = new URL(source);
    if (u.protocol !== 'https:' || !['docs.google.com','drive.google.com'].includes(u.hostname)) throw new Error('La fuente debe ser una URL HTTPS de Google Sheets');
    const response = await fetch(u, {signal: AbortSignal.timeout(8000), headers:{'Accept':'text/csv,text/plain'}});
    if (!response.ok) throw new Error('Google Sheets respondió ' + response.status);
    const csv = await response.text();
    if (!csv.includes('Fecha') || !csv.includes('Monto')) throw new Error('La hoja no contiene los encabezados esperados');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    return res.status(200).send(csv);
  } catch (e) { return res.status(502).json({error:'No fue posible consultar Google Sheets',detail:String(e.message)}); }
}
