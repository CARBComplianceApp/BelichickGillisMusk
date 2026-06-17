/**
 * Scan Google Drive folders for contact lists (CSV, Sheets, vCard, txt).
 * Normalizes weird calendar-style labels like "OVI 250 ANITOCH" (no company name).
 *
 * Requires:
 *   GOOGLE_SERVICE_ACCOUNT_KEY + GOOGLE_IMPERSONATE_USER
 *   (Workspace domain-wide delegation with drive.readonly scope)
 *
 * Usage:
 *   npx tsx scripts/pull-drive-contacts.ts
 *   npx tsx scripts/pull-drive-contacts.ts --local exports/drive-samples
 */
import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import { parseWeirdLabel, rowToContactFields, normalizePhone } from './lib/contact-normalize.js';

const DRIVE_FOLDERS: Record<string, string> = {
  RAW_UPLOADS: '1lO0xjCn3hnCubFFVnuNPQ8c0Y8lGt_bg',
  OUTPUT: '1BNfRFl3EH4cL61UEDBVCEyXgC6F1-oQO',
  CLAUDE_INBOX: '16mCOT2phrIwclsr3NGufopyIcp4Kyb8t',
};

const CONTACT_QUERY =
  "fullText contains 'contact' or fullText contains 'phone' or fullText contains 'ovi' or fullText contains 'obd' or fullText contains 'customer' or fullText contains 'fleet' or fullText contains 'carb'";

const CONTACT_MIME = new Set([
  'text/csv',
  'text/plain',
  'application/vnd.google-apps.spreadsheet',
  'text/vcard',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

type RawContact = {
  company: string;
  contactName: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  notes: string;
  source: string;
  driveFileId?: string;
  driveFileName?: string;
  isWeird: boolean;
};

function parseArgs(argv: string[]) {
  const args: Record<string, string> = { out: 'exports/drive-pulled.json' };
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

function parseContactsFromText(text: string, source: string, meta?: { id?: string; name?: string }): RawContact[] {
  const contacts: RawContact[] = [];
  const trimmed = text.trim();

  if (trimmed.includes('BEGIN:VCARD')) {
    const cards = trimmed.split(/END:VCARD/i);
    for (const card of cards) {
      const fn = card.match(/^FN:(.+)$/m)?.[1]?.trim();
      const tel = card.match(/^TEL[^:]*:(.+)$/m)?.[1]?.trim();
      const email = card.match(/^EMAIL[^:]*:(.+)$/m)?.[1]?.trim();
      if (!fn && !tel) continue;
      const parsed = parseWeirdLabel(fn || '');
      contacts.push({
        company: parsed.isWeird ? parsed.company : fn || '',
        contactName: parsed.contactName,
        phone: normalizePhone(tel || '') || parsed.phone,
        email: email || '',
        city: parsed.city,
        state: 'CA',
        notes: parsed.notes,
        source,
        driveFileId: meta?.id,
        driveFileName: meta?.name,
        isWeird: parsed.isWeird,
      });
    }
    return contacts;
  }

  if (trimmed.includes(',') && trimmed.split('\n').length > 1) {
    const rows = parseCsv(trimmed);
    if (!rows.length) return contacts;
    const headers = rows[0].map((h) => h.trim().toLowerCase());
    for (const row of rows.slice(1)) {
      const record: Record<string, string> = {};
      headers.forEach((h, i) => {
        record[h] = row[i] || '';
      });
      const fields = rowToContactFields(record);
      if (!fields.company && !fields.phone && !fields.email) continue;
      contacts.push({
        company: fields.company,
        contactName: fields.contactName,
        phone: fields.phone,
        email: fields.email,
        city: fields.city,
        state: 'CA',
        notes: fields.notes,
        source,
        driveFileId: meta?.id,
        driveFileName: meta?.name,
        isWeird: fields.isWeird,
      });
    }
    return contacts;
  }

  for (const line of trimmed.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const phone = normalizePhone(t);
    const parsed = parseWeirdLabel(t.replace(/\d{3}.*\d{4}/, '').trim() || t);
    if (phone || parsed.isWeird || parsed.company) {
      contacts.push({
        company: parsed.company || t,
        contactName: parsed.contactName,
        phone: phone || parsed.phone,
        email: '',
        city: parsed.city,
        state: 'CA',
        notes: parsed.notes || (parsed.isWeird ? `Raw: ${t}` : ''),
        source,
        driveFileId: meta?.id,
        driveFileName: meta?.name,
        isWeird: parsed.isWeird,
      });
    }
  }
  return contacts;
}

async function getDriveClient() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.trim();
  const user = process.env.GOOGLE_IMPERSONATE_USER?.trim();
  if (!raw || !user) {
    throw new Error(
      'Set GOOGLE_SERVICE_ACCOUNT_KEY and GOOGLE_IMPERSONATE_USER (e.g. admin@mobilecarbsmoketest.com)'
    );
  }
  const key = raw.startsWith('{') ? JSON.parse(raw) : JSON.parse(fs.readFileSync(raw, 'utf8'));
  const auth = new JWT({
    email: key.client_email,
    key: key.private_key,
    scopes: [
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/spreadsheets.readonly',
    ],
    subject: user,
  });
  return google.drive({ version: 'v3', auth });
}

async function listFolderFiles(
  drive: ReturnType<typeof google.drive>,
  folderId: string,
  folderLabel: string
) {
  const files: Array<{ id: string; name: string; mimeType: string; folder: string }> = [];
  let pageToken: string | undefined;

  do {
    const res = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: 'nextPageToken, files(id, name, mimeType)',
      pageSize: 100,
      pageToken,
    });
    for (const f of res.data.files || []) {
      if (!f.id || !f.name) continue;
      files.push({ id: f.id, name: f.name, mimeType: f.mimeType || '', folder: folderLabel });
    }
    pageToken = res.data.nextPageToken || undefined;
  } while (pageToken);

  return files;
}

async function searchContactFiles(drive: ReturnType<typeof google.drive>) {
  const res = await drive.files.list({
    q: CONTACT_QUERY,
    fields: 'files(id, name, mimeType, parents)',
    pageSize: 50,
    corpora: 'user',
  });
  return (res.data.files || [])
    .filter((f) => f.id && f.name)
    .map((f) => ({
      id: f.id!,
      name: f.name!,
      mimeType: f.mimeType || '',
      folder: 'search',
    }));
}

async function downloadFile(
  drive: ReturnType<typeof google.drive>,
  file: { id: string; name: string; mimeType: string }
): Promise<string> {
  if (file.mimeType === 'application/vnd.google-apps.spreadsheet') {
    const res = await drive.files.export({ fileId: file.id, mimeType: 'text/csv' }, { responseType: 'text' });
    return res.data as string;
  }
  const res = await drive.files.get({ fileId: file.id, alt: 'media' }, { responseType: 'text' });
  return res.data as string;
}

function parseLocalDir(dir: string): RawContact[] {
  const all: RawContact[] = [];
  if (!fs.existsSync(dir)) return all;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (!fs.statSync(full).isFile()) continue;
    if (!/\.(csv|txt|vcf|tsv)$/i.test(name)) continue;
    const text = fs.readFileSync(full, 'utf8');
    all.push(...parseContactsFromText(text, `local:${name}`, { name }));
  }
  return all;
}

function dedupe(contacts: RawContact[]): RawContact[] {
  const map = new Map<string, RawContact>();
  for (const c of contacts) {
    const key = c.phone || c.email || `${c.company}|${c.city}`.toLowerCase();
    const existing = map.get(key);
    if (!existing) {
      map.set(key, c);
      continue;
    }
    map.set(key, {
      ...existing,
      contactName: existing.contactName || c.contactName,
      phone: existing.phone || c.phone,
      email: existing.email || c.email,
      notes: [existing.notes, c.notes].filter(Boolean).join(' | '),
      source: existing.source.includes(c.source) ? existing.source : `${existing.source}+${c.source}`,
      isWeird: existing.isWeird && c.isWeird,
    });
  }
  return [...map.values()].sort((a, b) => a.company.localeCompare(b.company));
}

async function main() {
  const args = parseArgs(process.argv);
  let contacts: RawContact[] = [];
  const scanned: string[] = [];

  if (args.local) {
    contacts = parseLocalDir(args.local);
    scanned.push(`local:${args.local}`);
  } else {
    const drive = await getDriveClient();

    for (const [label, folderId] of Object.entries(DRIVE_FOLDERS)) {
      const files = await listFolderFiles(drive, folderId, label);
      scanned.push(`${label} (${files.length} files)`);
      for (const file of files) {
        const nameLower = file.name.toLowerCase();
        const looksContact =
          CONTACT_MIME.has(file.mimeType) ||
          /contact|phone|customer|fleet|crm|ovi|obd|carb|list/.test(nameLower);
        if (!looksContact && file.mimeType !== 'application/vnd.google-apps.spreadsheet') continue;
        try {
          const text = await downloadFile(drive, file);
          contacts.push(
            ...parseContactsFromText(text, `drive:${label}/${file.name}`, {
              id: file.id,
              name: file.name,
            })
          );
        } catch (err) {
          console.error(`Skip ${file.name}: ${err instanceof Error ? err.message : err}`);
        }
      }
    }

    const searched = await searchContactFiles(drive);
    scanned.push(`drive-search (${searched.length} hits)`);
    for (const file of searched) {
      if (contacts.some((c) => c.driveFileId === file.id)) continue;
      try {
        const text = await downloadFile(drive, file);
        contacts.push(
          ...parseContactsFromText(text, `drive:search/${file.name}`, { id: file.id, name: file.name })
        );
      } catch {
        /* skip binary or unsupported */
      }
    }
  }

  contacts = dedupe(contacts);
  const weird = contacts.filter((c) => c.isWeird);

  const outPath = args.out || 'exports/drive-pulled.json';
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, `${JSON.stringify({ scanned, count: contacts.length, weirdCount: weird.length, contacts }, null, 2)}\n`);

  console.error(`Scanned: ${scanned.join('; ')}`);
  console.error(`Contacts: ${contacts.length} (${weird.length} weird labels normalized)`);
  console.error(`Wrote ${outPath}`);
  console.log(outPath);
}

main().catch((err) => {
  if (err instanceof Error && err.message.includes('GOOGLE_SERVICE_ACCOUNT_KEY')) {
    console.error(err.message);
    console.error('\nOffline test with sample weird labels:');
    console.error('  npx tsx scripts/pull-drive-contacts.ts --local exports/drive-samples');
    process.exit(1);
  }
  console.error(err);
  process.exit(1);
});
