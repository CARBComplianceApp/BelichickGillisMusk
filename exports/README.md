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

Each contact gets a **CRM row link** like:
`https://docs.google.com/spreadsheets/d/.../edit#gid=0&range=A{row}`

## Google Places enrichment (optional)

Set `GOOGLE_PLACES_API_KEY` to fill address, website, and Google Maps URL when missing.
