/**
 * Merge Jan/Feb 2026 serviced customers from exported sources into name + phone CSV.
 *
 * Fastest workflow (no API keys):
 *   1. Google Calendar (admin@mobilecarbsmoketest.com) → print month view or export events → save CSV
 *   2. Invoice Simple → Settings → Export Invoice Summary → Jan–Feb 2026 → CSV
 *   3. Stripe Dashboard → Payments → Jan 1–Feb 28 2026 → Export
 *   4. NorCal / A+ Slack or WhatsApp → export chat → save as .txt or .csv
 *
 * Usage:
 *   npx tsx scripts/merge-jan-feb-retest-leads.ts \
 *     --calendar exports/calendar-jan-feb.csv \
 *     --invoice exports/invoice-simple-jan-feb.csv \
 *     --stripe exports/stripe-jan-feb.csv \
 *     --chat exports/norcal-aplus-chat.txt \
 *     --out retest-leads-jan-feb-2026.csv
 */
import fs from 'fs';
import path from 'path';

const START = new Date('2026-01-01T00:00:00-08:00');
const END = new Date('2026-02-28T23:59:59-08:00');

type Lead = {
  name: string;
  phone: string;
  source: string;
  serviceDate?: string;
};

function parseArgs(argv: string[]) {
  const args: Record<string, string> = {};
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
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
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
      if (row.some((cell) => cell.trim())) rows.push(row);
      row = [];
      field = '';
      continue;
    }
    field += ch;
  }

  if (field.length || row.length) {
    row.push(field);
    if (row.some((cell) => cell.trim())) rows.push(row);
  }

  return rows;
}

function inRange(dateText: string | undefined): boolean {
  if (!dateText) return true;
  const parsed = new Date(dateText);
  if (Number.isNaN(parsed.getTime())) return true;
  return parsed >= START && parsed <= END;
}

function headerIndex(headers: string[], candidates: string[]): number {
  const normalized = headers.map((h) => h.trim().toLowerCase());
  for (const candidate of candidates) {
    const idx = normalized.findIndex((h) => h === candidate || h.includes(candidate));
    if (idx >= 0) return idx;
  }
  return -1;
}

function firstPhoneInText(text: string): string | null {
  const match = text.match(/(?:\+?1[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}/);
  return match ? normalizePhone(match[0]) : null;
}

function cleanName(raw: string): string {
  return raw
    .replace(/\s+/g, ' ')
    .replace(/[|•]/g, ' ')
    .replace(/\b(obd|ovi|hd-?obd|smoke|test|carb|clean truck check)\b/gi, '')
    .trim();
}

function addLead(leads: Lead[], lead: Lead) {
  const phone = normalizePhone(lead.phone);
  if (!phone || !lead.name.trim()) return;
  leads.push({ ...lead, phone });
}

function parseTabularFile(filePath: string, source: string): Lead[] {
  const text = fs.readFileSync(filePath, 'utf8');
  const rows = parseCsv(text);
  if (!rows.length) return [];

  const headers = rows[0];
  const nameIdx = headerIndex(headers, [
    'customer',
    'customer name',
    'client',
    'company',
    'company name',
    'name',
    'billing name',
    'description',
    'summary',
    'title',
    'subject',
  ]);
  const phoneIdx = headerIndex(headers, ['phone', 'phone number', 'customer phone', 'mobile', 'tel']);
  const dateIdx = headerIndex(headers, [
    'date',
    'service date',
    'invoice date',
    'created',
    'created (utc)',
    'start date',
    'start',
    'appointment date',
    'paid at',
  ]);

  const leads: Lead[] = [];

  for (const row of rows.slice(1)) {
    const name = nameIdx >= 0 ? cleanName(row[nameIdx] || '') : '';
    const phoneRaw = phoneIdx >= 0 ? row[phoneIdx] || '' : row.join(' ');
    const phone = normalizePhone(phoneRaw) || firstPhoneInText(row.join(' '));
    const serviceDate = dateIdx >= 0 ? row[dateIdx] : undefined;

    if (!inRange(serviceDate)) continue;

    const resolvedName =
      name ||
      cleanName(
        row.find((cell) => /[a-z]/i.test(cell) && !/\d{3}/.test(cell) && cell.length > 2) || ''
      );

    if (phone) {
      addLead(leads, { name: resolvedName || 'Unknown', phone, source, serviceDate });
    }
  }

  return leads;
}

function parseChatFile(filePath: string, source: string): Lead[] {
  const text = fs.readFileSync(filePath, 'utf8');
  const leads: Lead[] = [];

  for (const line of text.split(/\r?\n/)) {
    if (!/(aplus|a\+|danny|barbosa|norcal)/i.test(line) && !/\d{3}.*\d{4}/.test(line)) {
      continue;
    }

    const phone = firstPhoneInText(line);
    if (!phone) continue;

    const dateMatch = line.match(/\b(2026-0[12]-\d{2}|\d{1,2}\/\d{1,2}\/2026)\b/);
    if (dateMatch && !inRange(dateMatch[1])) continue;

    const nameMatch = line.match(
      /(?:company|customer|name|fleet|truck(?:ing)?)\s*[:=-]\s*([^,|]+)/i
    );
    const name = cleanName(nameMatch?.[1] || line.replace(/\d[\d\s().-]{8,}\d/g, '').slice(0, 80));

    addLead(leads, { name: name || 'Unknown', phone, source });
  }

  return leads;
}

function dedupe(leads: Lead[]): Lead[] {
  const byPhone = new Map<string, Lead>();

  for (const lead of leads) {
    const phone = normalizePhone(lead.phone);
    if (!phone) continue;
    const existing = byPhone.get(phone);
    if (!existing) {
      byPhone.set(phone, lead);
      continue;
    }
    if (existing.name === 'Unknown' && lead.name !== 'Unknown') {
      byPhone.set(phone, { ...lead, source: `${existing.source}+${lead.source}` });
    } else if (!existing.source.includes(lead.source)) {
      byPhone.set(phone, { ...existing, source: `${existing.source}+${lead.source}` });
    }
  }

  return [...byPhone.values()].sort((a, b) => a.name.localeCompare(b.name));
}

function main() {
  const args = parseArgs(process.argv);
  const inputs: Array<{ path: string; source: string; kind: 'table' | 'chat' }> = [];

  if (args.calendar) inputs.push({ path: args.calendar, source: 'calendar', kind: 'table' });
  if (args.invoice) inputs.push({ path: args.invoice, source: 'invoice-simple', kind: 'table' });
  if (args.stripe) inputs.push({ path: args.stripe, source: 'stripe', kind: 'table' });
  if (args.chat) inputs.push({ path: args.chat, source: 'norcal-chat', kind: 'chat' });

  if (!inputs.length) {
    console.error('Provide at least one input: --calendar, --invoice, --stripe, or --chat');
    process.exit(1);
  }

  const allLeads: Lead[] = [];

  for (const input of inputs) {
    if (!fs.existsSync(input.path)) {
      console.error(`Missing file: ${input.path}`);
      process.exit(1);
    }
    const parsed =
      input.kind === 'chat' ? parseChatFile(input.path, input.source) : parseTabularFile(input.path, input.source);
    console.error(`Loaded ${parsed.length} rows from ${path.basename(input.path)} (${input.source})`);
    allLeads.push(...parsed);
  }

  const merged = dedupe(allLeads);
  const outPath = args.out || 'retest-leads-jan-feb-2026.csv';
  const lines = ['name,phone,sources'];
  for (const lead of merged) {
    const phone = normalizePhone(lead.phone);
    if (!phone) continue;
    const escapedName = `"${lead.name.replace(/"/g, '""')}"`;
    lines.push(`${escapedName},${formatPhone(phone)},${lead.source}`);
  }

  fs.writeFileSync(outPath, `${lines.join('\n')}\n`);
  console.error(`Wrote ${merged.length} unique contacts to ${outPath}`);
  console.log(outPath);
}

main();
