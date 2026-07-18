# NorCal uniform contact exports

Phone + computer contact files with **CRM links** on every record.

## Quick start (seed data until Master CRM CSV is exported)

```bash
npm run contacts:export
```

Outputs in `exports/contacts/`:

| File | Use on |
|------|--------|
| `norcal-contacts.vcf` | **iPhone** (AirDrop/email → Open in Contacts), **Android** (Contacts → Import), **Mac/PC** (Outlook, Apple Contacts, Google Contacts import) |
| `norcal-contacts.html` | **Phone browser** or desktop — tap Call, Email, **Open in CRM** |
| `norcal-contacts.csv` | Excel, Google Sheets, re-import to CRM |
| `norcal-contacts.json` | Scripts / backups |

## Full Master CRM export

1. Open [Master CRM](https://docs.google.com/spreadsheets/d/1TdNnf7eLaPNN3anaBGpNdjo_unK04zWwZJ859ZDvIO4/edit)
2. File → Download → CSV
3. Save as `exports/mastercrm.csv`
4. Run:

```bash
GOOGLE_PLACES_API_KEY=your_key npx tsx scripts/export-uniform-contacts.ts \
  --in exports/mastercrm.csv \
  --enrich \
  --out exports/contacts
```

## Google Drive contact lists (weird labels like `OVI 250 ANITOCH`)

Scans these folders when credentials are set:

| Folder | Drive ID |
|--------|----------|
| RAW_UPLOADS | `1lO0xjCn3hnCubFFVnuNPQ8c0Y8lGt_bg` |
| OUTPUT | `1BNfRFl3EH4cL61UEDBVCEyXgC6F1-oQO` |
| CLAUDE_INBOX | `16mCOT2phrIwclsr3NGufopyIcp4Kyb8t` |

Labels like **OVI 250 ANITOCH** (test type + price + city, no name) are normalized to:
`Antioch — OVI $250 (needs name)` with notes preserving the raw label.

**Live Drive pull** (needs `GOOGLE_SERVICE_ACCOUNT_KEY` + `GOOGLE_IMPERSONATE_USER`):

```bash
npm run contacts:drive:live
```

**Offline test** with sample messy files:

```bash
npm run contacts:drive
```

Each contact gets a **CRM row link** like:
`https://docs.google.com/spreadsheets/d/.../edit#gid=0&range=A{row}`

## Google Places enrichment (optional)

Set `GOOGLE_PLACES_API_KEY` to fill address, website, and Google Maps URL when missing.
