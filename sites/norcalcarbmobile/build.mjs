#!/usr/bin/env node
/**
 * NorCal CARB Mobile — Static Site Builder
 * Builds to dist/ for Cloudflare Pages deployment.
 */
import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;
const DIST = join(ROOT, 'dist');

const site = JSON.parse(readFileSync(join(ROOT, 'data/site.json'), 'utf8'));
const nav = JSON.parse(readFileSync(join(ROOT, 'data/nav.json'), 'utf8'));
const serviceAreas = JSON.parse(readFileSync(join(ROOT, 'data/service-areas.json'), 'utf8'));
const blogPosts = JSON.parse(readFileSync(join(ROOT, 'data/blog-posts.json'), 'utf8'));
const { redirects } = JSON.parse(readFileSync(join(ROOT, 'data/redirects.json'), 'utf8'));
const layout = readFileSync(join(ROOT, 'templates/layout.html'), 'utf8');

const phoneRaw = site.phone.replace(/-/g, '');

function render(template, vars) {
  let out = template;
  for (const [key, value] of Object.entries(vars)) {
    out = out.replaceAll(`{{${key}}}`, value ?? '');
  }
  return out;
}

function buildNav(rootPath) {
  return nav.map((item) => `<a href="${rootPath}${item.href.replace(/^\//, '')}">${item.label}</a>`).join('\n        ');
}

function localBusinessSchema(area) {
  return `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "NorCal CARB Mobile — ${area.name}",
  "description": "${area.description.replace(/"/g, '\\"')}",
  "url": "${site.domain}/service-area/${area.slug}/",
  "telephone": "+1-${site.phone}",
  "priceRange": "$75-$300",
  "areaServed": {
    "@type": "GeoCircle",
    "geoMidpoint": {
      "@type": "GeoCoordinates",
      "latitude": ${area.geo.lat},
      "longitude": ${area.geo.lng}
    },
    "geoRadius": "80000"
  },
  "serviceType": ["CARB Clean Truck Check", "OBD Emissions Testing", "SAE J1667 Smoke Opacity Testing"],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "5",
    "reviewCount": "${site.reviewCount}"
  }
}
</script>`;
}

function orgSchema() {
  return `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "NorCal CARB Mobile",
  "description": "Mobile CARB Clean Truck Check testing across Northern California. OBD $75, OVI $199. We come to your fleet.",
  "url": "${site.domain}/",
  "telephone": "+1-${site.phone}",
  "priceRange": "$75-$300",
  "areaServed": [
    "Sacramento County", "Solano County", "Alameda County", "Butte County",
    "San Joaquin County", "Santa Clara County", "Fresno County", "San Diego County"
  ],
  "serviceType": ["CARB Clean Truck Check", "OBD Emissions Testing", "SAE J1667 Smoke Opacity Testing"],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "5",
    "reviewCount": "${site.reviewCount}"
  }
}
</script>`;
}

function pageHtml({ title, description, canonical, content, root = '', schema = '' }) {
  return render(layout, {
    title,
    description,
    canonical,
    content,
    root,
    schema,
    nav: buildNav(root),
    phone: site.phone,
    phoneRaw,
    reviewCount: String(site.reviewCount),
    year: String(new Date().getFullYear()),
    'social.facebook': site.social.facebook,
    'social.instagram': site.social.instagram,
  });
}

function writePage(relPath, html) {
  const fullPath = join(DIST, relPath);
  mkdirSync(dirname(fullPath), { recursive: true });
  writeFileSync(fullPath, html, 'utf8');
}

// Clean dist
if (existsSync(DIST)) {
  cpSync(DIST, join(ROOT, '.dist-backup'), { recursive: true, force: true });
}
mkdirSync(join(DIST, 'css'), { recursive: true });
cpSync(join(ROOT, 'src/css/styles.css'), join(DIST, 'css/styles.css'));

// ── Homepage ──
writePage('index.html', pageHtml({
  title: 'Mobile CARB Clean Truck Check — NorCal CARB Mobile | OBD & OVI Testing at Your Yard',
  description: 'Mobile CARB Clean Truck Check testing across Northern California. OBD $75, OVI $199. We come to your fleet yard. Same-week and Saturday appointments.',
  canonical: `${site.domain}/`,
  schema: orgSchema(),
  content: `
    <section class="hero">
      <div class="container">
        <p class="stars-badge"><span class="stars">★★★★★</span> ${site.reviewRating} · ${site.reviewCount} Google reviews</p>
        <h1>Mobile CARB Clean Truck Check — we come to your yard.</h1>
        <p class="hero-lead">Fast, professional OBD &amp; OVI Clean Truck Check testing across Northern California. No waiting rooms, no hold music — we test your fleet on-site, often the same week.</p>
        <div class="hero-actions">
          <a href="${site.bookingUrl}" class="btn btn-primary">Book a Test</a>
          <a href="tel:${phoneRaw}" class="btn btn-secondary">Call ${site.phone}</a>
        </div>
        <p class="service-area-line">Serving ${site.serviceAreaLine}</p>
      </div>
    </section>

    <section class="content-section">
      <div class="container">
        <h2 class="section-title-center">Simple, upfront pricing</h2>
        <p class="section-intro">No surprise fees. The price you see is the price you pay — per vehicle, at your location.</p>
        <div class="pricing-grid">
          <div class="price-card">
            <h3>OBD Test</h3>
            <div class="amount">$${site.prices.obd}</div>
            <div class="unit">/ vehicle</div>
            <p style="margin-top:1rem;font-size:0.9375rem;color:var(--color-text-muted)">On-board diagnostic Clean Truck Check for most 2013+ trucks.</p>
            <a href="${site.bookingUrl}" class="btn btn-primary" style="width:100%;margin-top:1rem">Book OBD</a>
          </div>
          <div class="price-card">
            <h3>OVI (Smoke) Test</h3>
            <div class="amount">$${site.prices.ovi}</div>
            <div class="unit">/ vehicle</div>
            <p style="margin-top:1rem;font-size:0.9375rem;color:var(--color-text-muted)">Opacity / smoke test for older or non-OBD vehicles and motorhomes.</p>
            <a href="${site.bookingUrl}" class="btn btn-primary" style="width:100%;margin-top:1rem">Book OVI</a>
          </div>
          <div class="price-card">
            <h3>Motorhome</h3>
            <div class="amount">$${site.prices.motorhomeObd}</div>
            <div class="unit">OBD / $${site.prices.motorhomeOvi} OVI</div>
            <p style="margin-top:1rem;font-size:0.9375rem;color:var(--color-text-muted)">Specialized motorhome and RV CARB smoke testing at your location.</p>
            <a href="${site.bookingUrl}" class="btn btn-primary" style="width:100%;margin-top:1rem">Book Motorhome</a>
          </div>
          <div class="price-card price-card-featured">
            <h3>Switch &amp; Save</h3>
            <div class="amount">50% off</div>
            <div class="unit">1st test</div>
            <p style="margin-top:1rem;font-size:0.9375rem;color:var(--color-text-muted)">Already use another tester? Switch to NorCal and your first test is half off.</p>
            <a href="/contact/" class="btn btn-secondary" style="width:100%;margin-top:1rem">Claim offer</a>
          </div>
        </div>
        <p class="price-note">Fleet &amp; multi-truck discounts available — ask for a quote.</p>
        <p class="price-note">San Diego area: OBD $${site.prices.sanDiegoObd} · OVI $${site.prices.sanDiegoOvi}</p>
        <p class="price-disclaimer">Pricing is always subject to change due to matters out of our control.</p>
      </div>
    </section>

    <section class="steps-section">
      <div class="container">
        <h2 class="section-title-center">How mobile testing works</h2>
        <p class="section-intro">Three steps and you're compliant — usually within the week.</p>
        <div class="steps-grid">
          <div class="step-card">
            <div class="step-number">1</div>
            <h3>Book in minutes</h3>
            <p>Call or send a request with your location and how many trucks need testing.</p>
          </div>
          <div class="step-card">
            <div class="step-number">2</div>
            <h3>We come to you</h3>
            <p>Our certified tester arrives at your yard or jobsite — Sacramento to the Bay Area — including Saturdays.</p>
          </div>
          <div class="step-card">
            <div class="step-number">3</div>
            <h3>Pass &amp; paperwork</h3>
            <p>You get your result on the spot and we handle the CARB Clean Truck Check submission.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="reviews-section">
      <div class="container">
        <div class="reviews-header">
          <h2>Trusted by NorCal fleets</h2>
          <p class="stars-badge" style="justify-content:center"><span class="stars">★★★★★</span> ${site.reviewRating} stars · ${site.reviewCount} Google reviews</p>
        </div>
        <div class="review-grid">
          <div class="review-card">
            <div class="stars">★★★★★</div>
            <blockquote>"Tested all six trucks in under two hours. Very professional."</blockquote>
            <cite>— Google review</cite>
          </div>
          <div class="review-card">
            <div class="stars">★★★★★</div>
            <blockquote>"Fair price, no upselling, no waiting."</blockquote>
            <cite>— Google review</cite>
          </div>
          <div class="review-card">
            <div class="stars">★★★★★</div>
            <blockquote>"Came out on a Saturday before our DMV deadline. Highly recommend."</blockquote>
            <cite>— Google review</cite>
          </div>
        </div>
        <a href="${site.social.facebook}" class="reviews-link">★ Read all ${site.reviewCount} reviews on Google</a>
      </div>
    </section>

    <section class="full-care-section">
      <div class="container">
        <h2>Rather not deal with CARB at all?</h2>
        <p><strong>NorCal Family — Full Care.</strong> We register your vehicles, watch your CTC-VIS deadlines, send reminders, and perform your mobile tests — so you never call CARB.</p>
        <p>CARB's annual compliance fee (paid through CTC-VIS, per vehicle) + $40/year to us. Testing still OBD $${site.prices.obd} · OVI $${site.prices.ovi} · Motorhome $${site.prices.motorhomeObd}/$${site.prices.motorhomeOvi} per visit.</p>
        <a href="/contact/" class="btn btn-primary">Ask about Full Care</a>
      </div>
    </section>

    <section class="cta-band">
      <div class="container">
        <h2>Ready to get your trucks tested?</h2>
        <p>Book mobile Clean Truck Check testing anywhere in Northern California. Same-week and Saturday appointments available.</p>
        <div class="hero-actions" style="justify-content:center;margin-top:1.5rem">
          <a href="${site.bookingUrl}" class="btn btn-primary">Book a Test</a>
          <a href="tel:${phoneRaw}" class="btn btn-secondary" style="background:transparent;color:#fff;border-color:#fff">Call ${site.phone}</a>
        </div>
      </div>
    </section>
  `,
}));

// ── Service Area Index ──
writePage('service-area/index.html', pageHtml({
  title: 'CARB Testing Service Areas | NorCal CARB Mobile',
  description: 'Mobile CARB Clean Truck Check testing service areas across Northern California, Central Valley, and San Diego County.',
  canonical: `${site.domain}/service-area/`,
  content: `
    <div class="page-header"><div class="container">
      <nav class="breadcrumb"><a href="/">Home</a> / Service Areas</nav>
      <h1>Mobile CARB Testing Service Areas</h1>
      <p>We bring certified Clean Truck Check testing to your fleet — wherever you operate in California.</p>
    </div></div>
    <section class="content-section"><div class="container">
      <h2>Phase 1 — Sacramento &amp; NorCal Stronghold</h2>
      <div class="area-grid">${serviceAreas.filter((a) => a.phase === 1).map((a) => `
        <a href="/service-area/${a.slug}/" class="area-card"><strong>${a.name}</strong><span>${a.cities.slice(0, 3).join(', ')}…</span></a>`).join('')}</div>
      <h2>Phase 2 — Central Valley Expansion</h2>
      <div class="area-grid">${serviceAreas.filter((a) => a.phase === 2).map((a) => `
        <a href="/service-area/${a.slug}/" class="area-card"><strong>${a.name}</strong><span>Agricultural &amp; fleet depot service</span></a>`).join('')}</div>
      <h2>Phase 3 — San Diego County</h2>
      <div class="area-grid">${serviceAreas.filter((a) => a.phase === 3).map((a) => `
        <a href="/service-area/${a.slug}/" class="area-card"><strong>${a.name}</strong><span>Port compliance &amp; rapid response</span></a>`).join('')}</div>
    </div></section>
  `,
}));

// ── Individual Service Area Pages ──
for (const area of serviceAreas) {
  writePage(`service-area/${area.slug}/index.html`, pageHtml({
    title: area.title,
    description: area.description,
    canonical: `${site.domain}/service-area/${area.slug}/`,
    schema: localBusinessSchema(area),
    content: `
      <div class="page-header"><div class="container">
        <nav class="breadcrumb"><a href="/">Home</a> / <a href="/service-area/">Service Areas</a> / ${area.name}</nav>
        <h1>${area.headline}</h1>
        <p>${area.subheadline}</p>
      </div></div>
      <section class="content-section"><div class="container prose">
        <p>${area.intro}</p>
        <h2>Industries We Serve in ${area.name}</h2>
        <ul>${area.industries.map((i) => `<li>${i}</li>`).join('')}</ul>
        <h2>Cities &amp; Communities Served</h2>
        <p>${area.cities.join(', ')}, and surrounding communities.</p>
        <h2>Pricing</h2>
        <p>OBD Testing: <strong>$${site.prices.obd}</strong> · OVI (Smoke): <strong>$${site.prices.ovi}</strong> · Motorhomes: <strong>$${site.prices.motorhomeObd} OBD / $${site.prices.motorhomeOvi} OVI</strong></p>
        <p>Text "${area.smsKeyword}" to ${site.sms} · Call ${site.phone}</p>
      </div></section>
      <section class="cta-band"><div class="container">
        <h2>Book Your ${area.name} Appointment</h2>
        <p>Same-week scheduling, fleet pricing, and flexible hours — evenings and weekends available.</p>
        <div class="hero-actions" style="justify-content:center;margin-top:1.5rem">
          <a href="tel:${phoneRaw}" class="btn btn-primary">Call ${site.phone}</a>
          <a href="/contact/" class="btn btn-secondary" style="background:transparent;color:#fff;border-color:#fff">Book Online</a>
        </div>
      </div></section>
    `,
  }));
}

// ── Services ──
const services = [
  {
    slug: 'clean-truck-check',
    title: 'Clean Truck Check (OBD Testing) $75 | NorCal CARB Mobile',
    h1: 'Clean Truck Check — OBD Emissions Testing',
    description: 'On-site CARB Clean Truck Check OBD testing for heavy-duty diesel trucks. $75 per vehicle. Results uploaded to CTC-VIS.',
    body: `<p>California's Clean Truck Check (HD I/M) program requires most diesel and alternative-fuel heavy-duty trucks over 14,000 lbs GVWR to undergo regular emissions checks. For vehicles with 2013+ engine model years, this means an OBD plug-in test.</p>
    <h2>What's Included</h2>
    <ul><li>On-site OBD plug-in emissions check at your location</li><li>CARB-certified equipment and technicians</li><li>Results submitted directly to CARB's CTC-VIS portal</li><li>Same-day and next-day scheduling available</li></ul>`,
  },
  {
    slug: 'smoke-opacity-test',
    title: 'Smoke Opacity Test (J1667) $250 | NorCal CARB Mobile',
    h1: 'SAE J1667 Smoke Opacity Testing',
    description: 'Mobile J1667 smoke opacity testing for pre-2013 diesel engines. $250 per vehicle. Certified snap-acceleration method.',
    body: `<p>Vehicles with pre-2013 engine model year diesels require OVI (Opacity/Visual Inspection) testing using the SAE J1667 snap-acceleration method. NorCal CARB Mobile brings certified J1667 testing to your yard.</p>
    <h2>Why Mobile J1667 Testing?</h2>
    <ul><li>No trips to distant testing stations</li><li>Test during off-hours or while trucks are loading</li><li>Fleet efficiency — test your entire fleet in one visit</li><li>Certified equipment calibrated to CARB standards</li></ul>`,
  },
  {
    slug: 'motorhome-testing',
    title: 'Motorhome CARB Testing $300 | NorCal CARB Mobile',
    h1: 'Motorhome Clean Truck Check Testing',
    description: 'Specialized mobile CARB emissions testing for Class A motorhomes and RVs. $300 per vehicle.',
    body: `<p>Class A motorhomes and large RVs with diesel engines require CARB Clean Truck Check compliance. NorCal CARB Mobile provides specialized testing at your storage location or residence.</p>`,
  },
  {
    slug: 'agricultural-vehicles',
    title: 'Agricultural Vehicle CARB Testing | NorCal CARB Mobile',
    h1: 'Agricultural Vehicle Clean Truck Check',
    description: 'Mobile CARB emissions testing for agricultural vehicles, farm equipment, and rural diesel fleets across Northern California.',
    body: `<p>Agricultural operations across the Central Valley and rural NorCal face unique compliance challenges. NorCal CARB Mobile reaches farms, ranches, and rural equipment yards with both OBD and J1667 testing.</p>`,
  },
];

writePage('services/index.html', pageHtml({
  title: 'CARB Testing Services | NorCal CARB Mobile',
  description: 'Mobile CARB Clean Truck Check services: OBD testing, J1667 smoke opacity, motorhome testing, and agricultural vehicle compliance.',
  canonical: `${site.domain}/services/`,
  content: `
    <div class="page-header"><div class="container">
      <nav class="breadcrumb"><a href="/">Home</a> / Services</nav>
      <h1>Mobile CARB Testing Services</h1>
      <p>Certified HD I/M compliance testing — we come to your fleet.</p>
    </div></div>
    <section class="content-section"><div class="container">
      <div class="area-grid">${services.map((s) => `
        <a href="/services/${s.slug}/" class="area-card"><strong>${s.h1}</strong><span>${s.description.slice(0, 80)}…</span></a>`).join('')}</div>
    </div></section>
  `,
}));

for (const svc of services) {
  writePage(`services/${svc.slug}/index.html`, pageHtml({
    title: svc.title,
    description: svc.description,
    canonical: `${site.domain}/services/${svc.slug}/`,
    content: `
      <div class="page-header"><div class="container">
        <nav class="breadcrumb"><a href="/">Home</a> / <a href="/services/">Services</a> / ${svc.h1}</nav>
        <h1>${svc.h1}</h1>
        <p>${svc.description}</p>
      </div></div>
      <section class="content-section"><div class="container prose">${svc.body}</div></section>
      <section class="cta-band"><div class="container">
        <h2>Schedule Mobile Testing</h2>
        <p>Call ${site.phone} or book online. Fleet discounts available.</p>
        <div class="hero-actions" style="justify-content:center;margin-top:1.5rem">
          <a href="tel:${phoneRaw}" class="btn btn-primary">Call ${site.phone}</a>
          <a href="/contact/" class="btn btn-secondary" style="background:transparent;color:#fff;border-color:#fff">Book Online</a>
        </div>
      </div></section>
    `,
  }));
}

// ── Blog ──
writePage('blog/index.html', pageHtml({
  title: 'CARB Clean Truck Check Blog | NorCal CARB Mobile',
  description: 'CARB compliance guides, Clean Truck Check news, and mobile emissions testing tips for California fleet owners.',
  canonical: `${site.domain}/blog/`,
  content: `
    <div class="page-header"><div class="container">
      <nav class="breadcrumb"><a href="/">Home</a> / Blog</nav>
      <h1>CARB Compliance Blog</h1>
      <p>Guides, news, and tips for California fleet owners navigating Clean Truck Check requirements.</p>
    </div></div>
    <section class="content-section"><div class="container">
      <ul class="blog-list">${blogPosts.map((p) => `
        <li><a href="/blog/${p.slug}/">${p.title}</a><div class="meta">${p.date} · ${p.excerpt}</div></li>`).join('')}</ul>
    </div></section>
  `,
}));

for (const post of blogPosts) {
  writePage(`blog/${post.slug}/index.html`, pageHtml({
    title: `${post.title} | NorCal CARB Mobile Blog`,
    description: post.description,
    canonical: `${site.domain}/blog/${post.slug}/`,
    content: `
      <div class="page-header"><div class="container">
        <nav class="breadcrumb"><a href="/">Home</a> / <a href="/blog/">Blog</a></nav>
        <h1>${post.title}</h1>
        <p>${post.date}</p>
      </div></div>
      <section class="content-section"><div class="container prose">
        <p>${post.excerpt}</p>
        <p>For mobile CARB Clean Truck Check testing in your area, call <a href="tel:${phoneRaw}">${site.phone}</a> or <a href="/contact/">book online</a>.</p>
      </div></section>
    `,
  }));
}

// ── Static pages ──
const staticPages = [
  { slug: 'rates', title: 'CARB Testing Rates & Pricing', h1: 'Clean Truck Check Rates', desc: 'Transparent pricing for mobile CARB testing. OBD $75, J1667 smoke opacity $250, motorhomes $300. Fleet discounts available.' },
  { slug: 'contact', title: 'Book Mobile CARB Testing', h1: 'Book a Mobile Visit', desc: 'Schedule on-site CARB Clean Truck Check testing. Call, text, or book online.' },
  { slug: 'faq', title: 'CARB Clean Truck Check FAQ', h1: 'Frequently Asked Questions', desc: 'Answers to common questions about CARB Clean Truck Check, testing frequency, and compliance requirements.' },
  { slug: 'reviews', title: 'Customer Reviews', h1: '150+ Five-Star Reviews', desc: 'See why fleet owners across Northern California trust NorCal CARB Mobile for Clean Truck Check compliance.' },
  { slug: 'resources', title: 'CARB Compliance Resources', h1: 'CARB Resources & Guides', desc: 'Helpful links and resources for CARB Clean Truck Check compliance.' },
  { slug: 'app', title: 'CARB Compliance App', h1: 'Download the CARB Compliance App', desc: 'Track your fleet compliance status with the CARB Compliance App.' },
];

for (const pg of staticPages) {
  let extra = '';
  if (pg.slug === 'rates') {
    extra = `<div class="pricing-grid">
      <div class="price-card"><div class="amount">$${site.prices.obd}</div><div class="unit">OBD Testing</div></div>
      <div class="price-card"><div class="amount">$${site.prices.ovi}</div><div class="unit">OVI (Smoke Opacity)</div></div>
      <div class="price-card"><div class="amount">$${site.prices.motorhomeObd}</div><div class="unit">Motorhome OBD / $${site.prices.motorhomeOvi} OVI</div></div>
    </div><p>Fleet discounts and member program pricing available. Contact us for a quote.</p>`;
  }
  if (pg.slug === 'contact') {
    extra = `<p><strong>Phone:</strong> <a href="tel:${phoneRaw}">${site.phone}</a></p>
    <p><strong>Alt:</strong> <a href="tel:${site.phoneAlt.replace(/-/g, '')}">${site.phoneAlt}</a></p>
    <p><strong>Email:</strong> <a href="mailto:${site.email}">${site.email}</a></p>
    <p><a href="${site.bookingUrl}" class="btn btn-primary">Book Online via Cal.com</a></p>`;
  }
  if (pg.slug === 'faq') {
    extra = `<h2>What is the Clean Truck Check?</h2><p>California's HD I/M program requires regular emissions testing for diesel trucks over 14,000 lbs GVWR.</p>
    <h2>How much does testing cost?</h2><p>OBD testing is $${site.prices.obd}, OVI smoke opacity is $${site.prices.ovi}, and motorhomes are $${site.prices.motorhomeObd} OBD / $${site.prices.motorhomeOvi} OVI.</p>
    <h2>Do you come to my location?</h2><p>Yes. We are 100% mobile and test at your fleet yard, job site, or warehouse.</p>`;
  }
  if (pg.slug === 'app') {
    extra = `<p><a href="https://carbcleantruckcheck.app" class="btn btn-primary">Open CARB Compliance App</a></p>`;
  }

  writePage(`${pg.slug}/index.html`, pageHtml({
    title: `${pg.title} | NorCal CARB Mobile`,
    description: pg.desc,
    canonical: `${site.domain}/${pg.slug}/`,
    content: `
      <div class="page-header"><div class="container">
        <nav class="breadcrumb"><a href="/">Home</a> / ${pg.h1}</nav>
        <h1>${pg.h1}</h1>
        <p>${pg.desc}</p>
      </div></div>
      <section class="content-section"><div class="container prose">${extra}</div></section>
    `,
  }));
}

writePage('resources/penalties-deadlines/index.html', pageHtml({
  title: 'CARB Penalties & Deadlines | NorCal CARB Mobile',
  description: 'CARB Clean Truck Check penalties, deadlines, and compliance requirements for California fleet owners.',
  canonical: `${site.domain}/resources/penalties-deadlines/`,
  content: `
    <div class="page-header"><div class="container">
      <nav class="breadcrumb"><a href="/">Home</a> / <a href="/resources/">Resources</a> / Penalties &amp; Deadlines</nav>
      <h1>CARB Penalties &amp; Deadlines</h1>
      <p>Stay ahead of CARB compliance deadlines to avoid fines and registration holds.</p>
    </div></div>
    <section class="content-section"><div class="container prose">
      <p>Non-compliant vehicles face DMV registration holds, CARB fines, and potential out-of-service orders. Schedule your mobile Clean Truck Check today to stay compliant.</p>
      <p><a href="/contact/" class="btn btn-primary">Book Testing Now</a></p>
    </div></section>
  `,
}));

// ── Redirects (Cloudflare Pages _redirects format) ──
const redirectLines = redirects.map((r) => `${r.from} ${r.to} 301`);
writeFileSync(join(DIST, '_redirects'), redirectLines.join('\n') + '\n', 'utf8');

// ── robots.txt ──
writeFileSync(join(DIST, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${site.domain}/sitemap.xml\n`, 'utf8');

// ── sitemap.xml ──
const urls = [
  '/',
  '/service-area/',
  ...serviceAreas.map((a) => `/service-area/${a.slug}/`),
  '/services/',
  ...services.map((s) => `/services/${s.slug}/`),
  '/blog/',
  ...blogPosts.map((p) => `/blog/${p.slug}/`),
  ...staticPages.map((p) => `/${p.slug}/`),
  '/resources/penalties-deadlines/',
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${site.domain}${u}</loc></url>`).join('\n')}
</urlset>`;
writeFileSync(join(DIST, 'sitemap.xml'), sitemap, 'utf8');

console.log(`Built ${urls.length} pages to dist/`);
console.log(`Generated ${redirects.length} 301 redirects`);
