/**
 * Build uniform contact files for phone + computer from Master CRM CSV (or JSON seed).
 * Optional Google Places enrichment when GOOGLE_PLACES_API_KEY is set.
 *
 * Outputs (in --out dir):
 *   norcal-contacts.vcf   — import to iPhone / Android / Google Contacts
 *   norcal-contacts.csv   — Excel, Sheets, CRM
 *   norcal-contacts.html  — tap-to-call + CRM links on phone or desktop
 *   norcal-contacts.json  — structured backup
 *
 * Usage:
 *   npx tsx scripts/export-uniform-contacts.ts --in exports/mastercrm.csv
 *   npx tsx scripts/export-uniform-contacts.ts --in exports/contacts-seed.json --enrich
 */
import fs from 'fs';
import path from 'path';

const MASTER_CRM_SHEET_ID = '1TdNnf7eLaPNN3anaBGpNdjo_unK04zWwZJ859ZDvIO4';
const MASTER_CRM_BASE = `https://docs.google.com/spreadsheets/d/${MASTER_CRM_SHEET_ID}/edit`;

export type UniformContact = {
  company: string;
  contactName: string;
  phone: string;
  phoneDisplay: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  website: string;
  mapsUrl: string;
  crmUrl: string;
  crmRow?: number;
  source: string;
  lastServiceDate: string;
  notes: string;
};

function parseArgs(argv: string[]) {
  const args: Record<string, string> = { out: 'exports/contacts' };
  for (let i = 2; i < argv.length; i += 1) {
    const key = argv[i];
    if (!key.startsWith('--')) continue;
    const value = argv[i + 1];
    if (!value || value.startsWith('--')) {
      args[key.slice(2)] = 'true';
      continue;
    }
    args[key.slice(2)] = value;
    i += 1;
  }
  return args;
}

function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) return digits;
  if (digits.length === 11 && digits.startsWith('1')) return digits.slice(1);
  return null;
}

function formatPhone(digits: string): string {
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function titleCase(s: string): string {
  return s
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((w) => (w.length <= 2 ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()))
    .join(' ');
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i += 1;
      } else if (ch === '"') inQuotes = false;
      else field += ch;
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === ',') {
      row.push(field);
      field = '';
      continue;
    }
    if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && next === '\n') i += 1;
      row.push(field);
      if (row.some((c) => c.trim())) rows.push(row);
      row = [];
      field = '';
      continue;
    }
    field += ch;
  }
  if (field.length || row.length) {
    row.push(field);
    if (row.some((c) => c.trim())) rows.push(row);
  }
  return rows;
}

function headerIndex(headers: string[], candidates: string[]): number {
  const n = headers.map((h) => h.trim().toLowerCase());
  for (const c of candidates) {
    const idx = n.findIndex((h) => h === c || h.includes(c));
    if (idx >= 0) return idx;
  }
  return -1;
}

function crmUrlForRow(row?: number, company?: string): string {
  if (row && row > 0) {
    return `${MASTER_CRM_BASE}#gid=0&range=A${row}`;
  }
  if (company?.trim()) {
    const q = encodeURIComponent(company.trim());
    return `${MASTER_CRM_BASE}#gid=0&q=${q}`;
  }
  return MASTER_CRM_BASE;
}

function buildContact(partial: Partial<UniformContact> & { phone?: string; company?: string }): UniformContact | null {
  const digits = partial.phone ? normalizePhone(partial.phone) : null;
  const company = titleCase(partial.company || '');
  const contactName = titleCase(partial.contactName || '');
  const displayCompany = company || contactName;
  if (!displayCompany) return null;

  const phone = digits || '';
  return {
    company: displayCompany,
    contactName,
    phone,
    phoneDisplay: phone ? formatPhone(phone) : '',
    email: (partial.email || '').trim().toLowerCase(),
    address: (partial.address || '').trim(),
    city: titleCase(partial.city || ''),
    state: (partial.state || 'CA').trim().toUpperCase(),
    zip: (partial.zip || '').trim(),
    website: (partial.website || '').trim(),
    mapsUrl: partial.mapsUrl || '',
      crmUrl: partial.crmUrl || crmUrlForRow(partial.crmRow, displayCompany),
    crmRow: partial.crmRow,
    source: partial.source || 'import',
    lastServiceDate: partial.lastServiceDate || '',
    notes: (partial.notes || '').trim(),
  };
}

function parseMasterCrmCsv(filePath: string): UniformContact[] {
  const rows = parseCsv(fs.readFileSync(filePath, 'utf8'));
  if (!rows.length) return [];

  const headers = rows[0];
  const companyIdx = headerIndex(headers, ['company', 'company name', 'customer', 'business']);
  const nameIdx = headerIndex(headers, ['contact', 'contact name', 'name', 'owner']);
  const phoneIdx = headerIndex(headers, ['phone', 'phone number', 'mobile', 'tel']);
  const emailIdx = headerIndex(headers, ['email', 'e-mail']);
  const addrIdx = headerIndex(headers, ['address', 'street']);
  const cityIdx = headerIndex(headers, ['city']);
  const stateIdx = headerIndex(headers, ['state']);
  const zipIdx = headerIndex(headers, ['zip', 'postal']);
  const dateIdx = headerIndex(headers, ['test date', 'service date', 'last test', 'date']);
  const notesIdx = headerIndex(headers, ['notes', 'note']);
  const rowIdx = headerIndex(headers, ['row', 'crm row', '#']);

  const contacts: UniformContact[] = [];

  rows.slice(1).forEach((row, i) => {
    const crmRow = rowIdx >= 0 ? Number(row[rowIdx]) || i + 2 : i + 2;
    const c = buildContact({
      company: companyIdx >= 0 ? row[companyIdx] : row[nameIdx],
      contactName: nameIdx >= 0 ? row[nameIdx] : '',
      phone: phoneIdx >= 0 ? row[phoneIdx] : '',
      email: emailIdx >= 0 ? row[emailIdx] : '',
      address: addrIdx >= 0 ? row[addrIdx] : '',
      city: cityIdx >= 0 ? row[cityIdx] : '',
      state: stateIdx >= 0 ? row[stateIdx] : 'CA',
      zip: zipIdx >= 0 ? row[zipIdx] : '',
      lastServiceDate: dateIdx >= 0 ? row[dateIdx] : '',
      notes: notesIdx >= 0 ? row[notesIdx] : '',
      crmRow,
      crmUrl: crmUrlForRow(crmRow, companyIdx >= 0 ? row[companyIdx] : undefined),
      source: 'master-crm',
    });
    if (c) contacts.push(c);
  });

  return contacts;
}

function parseSeedJson(filePath: string): UniformContact[] {
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf8')) as Array<Partial<UniformContact> & { phone?: string }>;
  return raw.map((r, i) =>
    buildContact({
      ...r,
      crmRow: r.crmRow ?? i + 2,
      crmUrl: r.crmUrl || crmUrlForRow(r.crmRow ?? i + 2, r.company),
      source: r.source || 'seed',
    })
  ).filter((c): c is UniformContact => c !== null);
}

function dedupe(contacts: UniformContact[]): UniformContact[] {
  const byKey = new Map<string, UniformContact>();
  for (const c of contacts) {
    const key = c.phone || c.email || c.company.toLowerCase();
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, c);
      continue;
    }
    byKey.set(key, {
      ...existing,
      contactName: existing.contactName || c.contactName,
      email: existing.email || c.email,
      address: existing.address || c.address,
      city: existing.city || c.city,
      website: existing.website || c.website,
      mapsUrl: existing.mapsUrl || c.mapsUrl,
      notes: [existing.notes, c.notes].filter(Boolean).join(' | '),
      source: existing.source.includes(c.source) ? existing.source : `${existing.source}+${c.source}`,
    });
  }
  return [...byKey.values()].sort((a, b) => a.company.localeCompare(b.company));
}

async function enrichWithPlaces(contacts: UniformContact[], apiKey: string): Promise<UniformContact[]> {
  const out: UniformContact[] = [];
  for (const c of contacts) {
    const query = [c.company, c.city, c.state].filter(Boolean).join(' ');
    if (!query.trim()) {
      out.push(c);
      continue;
    }

    try {
      const searchUrl = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
      searchUrl.searchParams.set('query', query);
      searchUrl.searchParams.set('key', apiKey);

      const searchRes = await fetch(searchUrl);
      const searchData = (await searchRes.json()) as {
        status: string;
        results?: Array<{ place_id: string; formatted_address?: string }>;
      };

      if (searchData.status !== 'OK' || !searchData.results?.length) {
        out.push(c);
        await sleep(120);
        continue;
      }

      const placeId = searchData.results[0].place_id;
      const detailsUrl = new URL('https://maps.googleapis.com/maps/api/place/details/json');
      detailsUrl.searchParams.set('place_id', placeId);
      detailsUrl.searchParams.set(
        'fields',
        'formatted_phone_number,formatted_address,website,url,name'
      );
      detailsUrl.searchParams.set('key', apiKey);

      const detailsRes = await fetch(detailsUrl);
      const detailsData = (await detailsRes.json()) as {
        status: string;
        result?: {
          formatted_phone_number?: string;
          formatted_address?: string;
          website?: string;
          url?: string;
          name?: string;
        };
      };

      const r = detailsData.result;
      if (detailsData.status === 'OK' && r) {
        const phoneDigits = r.formatted_phone_number ? normalizePhone(r.formatted_phone_number) : null;
        out.push({
          ...c,
          phone: c.phone || phoneDigits || '',
          phoneDisplay: c.phoneDisplay || (phoneDigits ? formatPhone(phoneDigits) : ''),
          address: c.address || r.formatted_address || '',
          website: c.website || r.website || '',
          mapsUrl: r.url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
          company: titleCase(c.company || r.name || ''),
        });
      } else {
        out.push({
          ...c,
          mapsUrl: c.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`,
        });
      }
    } catch {
      out.push(c);
    }

    await sleep(200);
  }
  return out;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function escapeVcard(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/\n/g, '\\n');
}

function toVcard(contacts: UniformContact[]): string {
  const cards = contacts.map((c) => {
    const lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${escapeVcard(c.company)}`,
      c.contactName ? `N:;${escapeVcard(c.contactName)};;;` : '',
      `ORG:${escapeVcard(c.company)}`,
      c.phone ? `TEL;TYPE=CELL:+1${c.phone}` : '',
      c.email ? `EMAIL;TYPE=INTERNET:${c.email}` : '',
      c.address ? `ADR:;;${escapeVcard(c.address)};${escapeVcard(c.city)};${c.state};${c.zip};` : '',
      c.website ? `URL:${c.website}` : '',
      c.mapsUrl ? `URL;TYPE=WORK:${c.mapsUrl}` : '',
      `URL;TYPE=OTHER:${c.crmUrl}`,
      `NOTE:CRM ${c.crmUrl}${c.lastServiceDate ? ` | Last service ${c.lastServiceDate}` : ''}${c.notes ? ` | ${c.notes}` : ''}`,
      'END:VCARD',
    ];
    return lines.filter(Boolean).join('\r\n');
  });
  return `${cards.join('\r\n')}\r\n`;
}

function toCsv(contacts: UniformContact[]): string {
  const headers = [
    'Company',
    'Contact Name',
    'Phone',
    'Email',
    'Address',
    'City',
    'State',
    'ZIP',
    'Website',
    'Google Maps',
    'CRM Link',
    'CRM Row',
    'Last Service',
    'Source',
    'Notes',
  ];
  const rows = contacts.map((c) =>
    [
      c.company,
      c.contactName,
      c.phoneDisplay,
      c.email,
      c.address,
      c.city,
      c.state,
      c.zip,
      c.website,
      c.mapsUrl,
      c.crmUrl,
      c.crmRow ?? '',
      c.lastServiceDate,
      c.source,
      c.notes,
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(',')
  );
  return `${headers.join(',')}\n${rows.join('\n')}\n`;
}

function toHtml(contacts: UniformContact[]): string {
  const cards = contacts
    .map(
      (c) => `
    <article class="card">
      <h2>${esc(c.company)}</h2>
      ${c.contactName ? `<p class="contact">${esc(c.contactName)}</p>` : ''}
      <div class="actions">
        ${c.phone ? `<a class="btn primary" href="tel:+1${c.phone}">Call ${esc(c.phoneDisplay)}</a>` : ''}
        ${c.email ? `<a class="btn" href="mailto:${esc(c.email)}">Email</a>` : ''}
        <a class="btn crm" href="${esc(c.crmUrl)}" target="_blank" rel="noopener">Open in CRM</a>
        ${c.mapsUrl ? `<a class="btn" href="${esc(c.mapsUrl)}" target="_blank" rel="noopener">Maps</a>` : ''}
      </div>
      <dl>
        ${c.address ? `<div><dt>Address</dt><dd>${esc(c.address)}</dd></div>` : ''}
        ${c.city ? `<div><dt>Area</dt><dd>${esc([c.city, c.state, c.zip].filter(Boolean).join(', '))}</dd></div>` : ''}
        ${c.lastServiceDate ? `<div><dt>Last service</dt><dd>${esc(c.lastServiceDate)}</dd></div>` : ''}
        ${c.notes ? `<div><dt>Notes</dt><dd>${esc(c.notes)}</dd></div>` : ''}
      </dl>
    </article>`
    )
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>NorCal CARB Mobile — Contacts</title>
  <style>
    :root { --bg:#0f1419; --card:#1a2332; --text:#e8edf5; --muted:#8b9cb3; --accent:#ffc425; --crm:#4da3ff; }
    * { box-sizing: border-box; }
    body { margin:0; font-family: system-ui, -apple-system, sans-serif; background:var(--bg); color:var(--text); padding:16px; }
    header { max-width:720px; margin:0 auto 20px; }
    h1 { font-size:1.25rem; margin:0 0 6px; }
    .meta { color:var(--muted); font-size:.9rem; }
    .grid { max-width:720px; margin:0 auto; display:grid; gap:12px; }
    .card { background:var(--card); border:1px solid #2a3548; border-radius:12px; padding:16px; }
    .card h2 { margin:0 0 4px; font-size:1.1rem; }
    .contact { margin:0 0 12px; color:var(--muted); }
    .actions { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:12px; }
    .btn { display:inline-block; padding:10px 14px; border-radius:8px; text-decoration:none; font-weight:600; font-size:.9rem; background:#2a3548; color:var(--text); }
    .btn.primary { background:var(--accent); color:#1a1200; }
    .btn.crm { background:#1e3a5f; color:var(--crm); border:1px solid var(--crm); }
    dl { margin:0; font-size:.85rem; }
    dl div { margin-bottom:6px; }
    dt { color:var(--muted); display:inline; }
    dt::after { content:': '; }
    dd { display:inline; margin:0; }
  </style>
</head>
<body>
  <header>
    <h1>NorCal CARB Mobile Contacts</h1>
    <p class="meta">${contacts.length} contacts · tap Call on phone · Open in CRM for sheet row</p>
  </header>
  <main class="grid">
    ${cards}
  </main>
</body>
</html>`;
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function main() {
  const args = parseArgs(process.argv);
  const inPath = args.in;
  if (!inPath || !fs.existsSync(inPath)) {
    console.error(`Input file required: --in path (csv or json). Example: exports/contacts-seed.json`);
    process.exit(1);
  }

  const ext = path.extname(inPath).toLowerCase();
  let contacts =
    ext === '.json' ? parseSeedJson(inPath) : parseMasterCrmCsv(inPath);

  contacts = dedupe(contacts);

  const placesKey = process.env.GOOGLE_PLACES_API_KEY?.trim();
  if (args.enrich === 'true' && placesKey) {
    console.error(`Enriching ${contacts.length} contacts via Google Places...`);
    contacts = await enrichWithPlaces(contacts, placesKey);
  } else if (args.enrich === 'true') {
    console.error('Skipping Places enrichment — set GOOGLE_PLACES_API_KEY');
    contacts = contacts.map((c) => ({
      ...c,
      mapsUrl:
        c.mapsUrl ||
        (c.company
          ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([c.company, c.city, c.state].filter(Boolean).join(' '))}`
          : ''),
    }));
  }

  const outDir = args.out || 'exports/contacts';
  fs.mkdirSync(outDir, { recursive: true });

  const vcfPath = path.join(outDir, 'norcal-contacts.vcf');
  const csvPath = path.join(outDir, 'norcal-contacts.csv');
  const htmlPath = path.join(outDir, 'norcal-contacts.html');
  const jsonPath = path.join(outDir, 'norcal-contacts.json');

  fs.writeFileSync(vcfPath, toVcard(contacts));
  fs.writeFileSync(csvPath, toCsv(contacts));
  fs.writeFileSync(htmlPath, toHtml(contacts));
  fs.writeFileSync(jsonPath, `${JSON.stringify(contacts, null, 2)}\n`);

  console.error(`Wrote ${contacts.length} contacts to ${outDir}/`);
  console.log(JSON.stringify({ vcf: vcfPath, csv: csvPath, html: htmlPath, json: jsonPath, count: contacts.length }));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
