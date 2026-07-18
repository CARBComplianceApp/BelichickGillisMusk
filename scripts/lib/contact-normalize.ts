/**
 * Normalize messy calendar / invoice / Drive contact labels.
 * Examples: "OVI 250 ANITOCH", "obd 119 san diego", "HD-OBD FAIRFIELD - Mike"
 */

const CA_CITIES = [
  'antioch',
  'hayward',
  'fairfield',
  'stockton',
  'lodi',
  'tracy',
  'modesto',
  'sacramento',
  'roseville',
  'oakland',
  'fremont',
  'vallejo',
  'vacaville',
  'dixon',
  'davis',
  'livermore',
  'pleasanton',
  'concord',
  'brentwood',
  'fresno',
  'san diego',
  'chula vista',
  'escondido',
  'san jose',
  'san francisco',
  'palo alto',
  'novato',
  'san rafael',
  'patterson',
  'turlock',
  'manteca',
  'ripon',
];

export type ParsedWeirdLabel = {
  raw: string;
  isWeird: boolean;
  testType: string;
  price: string;
  city: string;
  contactName: string;
  company: string;
  phone: string;
  notes: string;
};

export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) return digits;
  if (digits.length === 11 && digits.startsWith('1')) return digits.slice(1);
  return null;
}

export function formatPhone(digits: string): string {
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function titleCaseWords(s: string): string {
  return s
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((w) => {
      if (/^\$?\d+/.test(w)) return w;
      if (w.length <= 2) return w.toUpperCase();
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    })
    .join(' ');
}

function findCity(text: string): string {
  const lower = text.toLowerCase().replace(/anitioch/g, 'antioch');
  const sorted = [...CA_CITIES].sort((a, b) => b.length - a.length);
  for (const city of sorted) {
    const re = new RegExp(`\\b${city.replace(/\s+/g, '\\s+')}\\b`, 'i');
    if (re.test(lower)) return titleCaseWords(city);
  }
  return '';
}

function looksLikeWeirdLabel(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (/^(obd|ovi|hd-?obd|smoke|motorhome|fleet|carb|test)\b/i.test(t)) return true;
  if (/\b(obd|ovi)\s+\$?\d{2,3}\b/i.test(t)) return true;
  if (/\$\d{2,3}\s+(obd|ovi)\b/i.test(t)) return true;
  return false;
}

function looksLikeRealName(text: string): boolean {
  const t = text.trim();
  if (!t || looksLikeWeirdLabel(t)) return false;
  if (/^\d+$/.test(t.replace(/\D/g, '')) && t.replace(/\D/g, '').length >= 10) return false;
  if (/\b(inc|llc|corp|trucking|construction|transport|fleet|school|district)\b/i.test(t)) return true;
  if (/^[A-Z][a-z]+(\s+[A-Z][a-z]+)+$/.test(t)) return true;
  if (t.split(/\s+/).length >= 2 && !/\d{3}/.test(t)) return true;
  return t.length > 4 && /[a-z]/i.test(t) && !/^(obd|ovi)\b/i.test(t);
}

/** Parse labels like "OVI 250 ANITOCH" into structured fields. */
export function parseWeirdLabel(raw: string): ParsedWeirdLabel {
  const text = raw.trim().replace(/\s+/g, ' ');
  const phoneMatch = text.match(/(?:\+?1[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}/);
  const phone = phoneMatch ? normalizePhone(phoneMatch[0]) || '' : '';
  let remainder = phoneMatch ? text.replace(phoneMatch[0], ' ').trim() : text;

  const isWeird = looksLikeWeirdLabel(remainder) || looksLikeWeirdLabel(text);

  const testMatch = remainder.match(/\b(HD-?OBD|OBD|OVI|SMOKE|MOTORHOME(?:\s+OBD|\s+OVI|\s+SMOKE)?|FLEET)\b/i);
  const testType = testMatch ? testMatch[1].toUpperCase().replace('HD-OBD', 'HD-OBD') : '';

  const priceMatch = remainder.match(/\$?(\d{2,3})\b/);
  const price = priceMatch ? priceMatch[1] : '';

  const city = findCity(remainder) || findCity(text);

  let contactName = '';
  const dashSplit = remainder.split(/\s+[-–—]\s+/);
  if (dashSplit.length > 1) {
    const tail = dashSplit.slice(1).join(' - ');
    if (looksLikeRealName(tail)) contactName = titleCaseWords(tail);
    remainder = dashSplit[0];
  }

  const company = isWeird
    ? [city, testType, price ? `$${price}` : ''].filter(Boolean).join(' — ') || titleCaseWords(remainder)
    : titleCaseWords(remainder);

  const displayCompany = isWeird
    ? city
      ? `${city} — ${testType || 'Test'}${price ? ` $${price}` : ''} (needs name)`
      : `${testType || 'Test'}${price ? ` $${price}` : ''} (needs name)`
    : company;

  const notes = isWeird
    ? [`Raw label: ${raw}`, testType && `Test: ${testType}`, price && `Price: $${price}`, city && `Area: ${city}`]
        .filter(Boolean)
        .join(' · ')
    : '';

  return {
    raw,
    isWeird,
    testType,
    price,
    city,
    contactName,
    company: displayCompany,
    phone,
    notes,
  };
}

export function rowToContactFields(row: Record<string, string>): {
  company: string;
  contactName: string;
  phone: string;
  email: string;
  city: string;
  notes: string;
  isWeird: boolean;
} {
  const candidates = [
    row.company,
    row.customer,
    row.name,
    row.title,
    row.subject,
    row.summary,
    row.description,
    row.event,
    row.label,
  ].filter(Boolean);

  const phoneRaw =
    row.phone || row.mobile || row.tel || row['phone number'] || candidates.join(' ');
  const phone = normalizePhone(phoneRaw) || '';
  const email = (row.email || row['e-mail'] || '').trim().toLowerCase();

  let company = '';
  let contactName = (row.contact || row['contact name'] || '').trim();
  let isWeird = false;
  let notes = (row.notes || row.note || '').trim();

  for (const c of candidates) {
    const parsed = parseWeirdLabel(c);
    if (parsed.isWeird) {
      isWeird = true;
      company = parsed.company;
      contactName = contactName || parsed.contactName;
      notes = [notes, parsed.notes].filter(Boolean).join(' · ');
      break;
    }
    if (looksLikeRealName(c)) {
      if (!company) company = titleCaseWords(c);
      break;
    }
  }

  if (!company && candidates[0]) {
    const parsed = parseWeirdLabel(candidates[0]);
    company = parsed.company;
    isWeird = parsed.isWeird;
    notes = [notes, parsed.notes].filter(Boolean).join(' · ');
  }

  const city = (row.city || findCity(candidates.join(' ')) || '').trim();

  return {
    company,
    contactName: titleCaseWords(contactName),
    phone: phone || parseWeirdLabel(candidates.join(' ')).phone,
    email,
    city: city ? titleCaseWords(city) : findCity(candidates.join(' ')),
    notes,
    isWeird,
  };
}
