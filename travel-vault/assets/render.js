/*
 * Travel Vault — render helpers.
 * Pure functions that turn VAULT (from data.js) into DOM.
 * Each public render*() takes the element id (or element) it should fill.
 */

const INR_LOCALE = 'en-IN';
const fmtINR = n => Math.round(n).toLocaleString(INR_LOCALE);
const fmtINRDecimal = n => n.toLocaleString(INR_LOCALE, { maximumFractionDigits: 2 });

function catSlug(cat) {
  const c = cat.toLowerCase();
  if (c.startsWith('stay') || c.startsWith('accom')) return 'stay';
  if (c.startsWith('transport')) return 'transport';
  if (c.startsWith('food')) return 'food';
  return 'shopping';
}

function escHtml(s) {
  const d = document.createElement('div');
  d.textContent = s == null ? '' : String(s);
  return d.innerHTML;
}

// ===========================================================
// Landing page renders
// ===========================================================

function renderLandingStats(elId) {
  const el = document.getElementById(elId);
  const stayShare = VAULT.categorySplit.find(c => c.category.startsWith('Accommodation')).share;
  el.innerHTML = `
    <div class="stat">
      <div class="stat-label">Lifetime Capex</div>
      <div class="stat-value"><span class="currency">₹</span>${fmtINR(VAULT.lifetimeTotal)}</div>
      <div class="stat-sub">across ${VAULT.trips.length} audited expeditions</div>
    </div>
    <div class="stat">
      <div class="stat-label">Expeditions</div>
      <div class="stat-value">${VAULT.trips.length}</div>
      <div class="stat-sub">geographic regions captured</div>
    </div>
    <div class="stat">
      <div class="stat-label">Stay Anchor</div>
      <div class="stat-value">${stayShare.toFixed(1)}%</div>
      <div class="stat-sub">premium-tier flagship lodging</div>
    </div>
    <div class="stat">
      <div class="stat-label">As of</div>
      <div class="stat-value" style="font-size:24px;line-height:1.3">${VAULT.asOf}</div>
      <div class="stat-sub">verified portfolio snapshot</div>
    </div>
  `;
}

function renderDashboardTable(elId) {
  const el = document.getElementById(elId);
  const rows = VAULT.trips.map(t => `
    <tr>
      <td>
        <div class="dest-cell">
          <div class="glyph">${t.emoji}</div>
          <div>
            <div class="dest-name">${escHtml(t.name)}</div>
            <div class="dest-vibe">${escHtml(t.vibe)}</div>
          </div>
        </div>
      </td>
      <td>${escHtml(t.region)}</td>
      <td class="num">₹${fmtINRDecimal(t.total)}</td>
      <td class="num">
        <span class="share-bar"><span style="width:${t.sharePct}%"></span></span>${t.sharePct.toFixed(1)}%
      </td>
    </tr>
  `).join('');
  el.innerHTML = `
    <div class="dash-table-wrap">
      <table class="dash-table">
        <thead>
          <tr>
            <th>Destination</th>
            <th>Region / Type</th>
            <th class="num">Total Spent (INR)</th>
            <th class="num">% Share</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
        <tfoot>
          <tr>
            <td class="label" colspan="2">Lifetime Cumulative Total</td>
            <td class="num">₹${fmtINRDecimal(VAULT.lifetimeTotal)}</td>
            <td class="num">100.0%</td>
          </tr>
        </tfoot>
      </table>
    </div>
  `;
}

function renderBehavioralProfile(elId) {
  const el = document.getElementById(elId);
  el.innerHTML = VAULT.behavioralProfile.map((p, i) => `
    <div class="profile-card">
      <div class="pf-num">${String(i+1).padStart(2,'0')}</div>
      <h4>${escHtml(p.title)}</h4>
      <p>${escHtml(p.body)}</p>
    </div>
  `).join('');
}

function renderTripCards(elId) {
  const el = document.getElementById(elId);
  el.innerHTML = VAULT.trips.map(t => `
    <article class="trip-card" style="--th:${t.palette.hero};--ta:${t.palette.accent}">
      <a class="cover-link" href="trips/${t.slug}.html">Read more</a>
      <div class="trip-hero">
        <div class="trip-share"><strong>${t.sharePct.toFixed(1)}%</strong>of lifetime spend</div>
        <div class="trip-glyph">${t.emoji}</div>
      </div>
      <div class="trip-body">
        <div class="vibe-chip">${escHtml(t.vibe)}</div>
        <h3>${escHtml(t.name)}</h3>
        <div class="trip-region">${escHtml(t.region)} · ${escHtml(t.dateRange)}</div>
        <p class="trip-headline">${escHtml(t.headline)}</p>
        <div class="trip-foot">
          <div>
            <div class="trip-total"><span class="currency">₹</span>${fmtINR(t.total)}</div>
            <div class="trip-dates">${t.nights} ${t.nights === 1 ? 'night' : 'nights'} · ${escHtml(t.regionType)}</div>
          </div>
          <div class="trip-cta">Read expedition</div>
        </div>
      </div>
    </article>
  `).join('');
}

// ===========================================================
// Journey map + timeline
// ===========================================================

// Natural Earth 1:110m India outline (public domain), stored locally so
// decrypted locations never trigger requests to a third-party map service.
const INDIA_OUTLINE = [[97.327114,28.261583],[97.402561,27.882536],[97.051989,27.699059],[97.133999,27.083774],[96.419366,27.264589],[95.124768,26.573572],[95.155153,26.001307],[94.603249,25.162495],[94.552658,24.675238],[94.106742,23.850741],[93.325188,24.078556],[93.286327,23.043658],[93.060294,22.703111],[93.166128,22.27846],[92.672721,22.041239],[92.146035,23.627499],[91.869928,23.624346],[91.706475,22.985264],[91.158963,23.503527],[91.46773,24.072639],[91.915093,24.130414],[92.376202,24.976693],[91.799596,25.147432],[90.872211,25.132601],[89.920693,25.26975],[89.832481,25.965082],[89.355094,26.014407],[88.563049,26.446526],[88.209789,25.768066],[88.931554,25.238692],[88.306373,24.866079],[88.084422,24.501657],[88.69994,24.233715],[88.52977,23.631142],[88.876312,22.879146],[89.031961,22.055708],[88.888766,21.690588],[88.208497,21.703172],[86.975704,21.495562],[87.033169,20.743308],[86.499351,20.151638],[85.060266,19.478579],[83.941006,18.30201],[83.189217,17.671221],[82.192792,17.016636],[82.191242,16.556664],[81.692719,16.310219],[80.791999,15.951972],[80.324896,15.899185],[80.025069,15.136415],[80.233274,13.835771],[80.286294,13.006261],[79.862547,12.056215],[79.857999,10.357275],[79.340512,10.308854],[78.885345,9.546136],[79.18972,9.216544],[78.277941,8.933047],[77.941165,8.252959],[77.539898,7.965535],[76.592979,8.899276],[76.130061,10.29963],[75.746467,11.308251],[75.396101,11.781245],[74.864816,12.741936],[74.616717,13.992583],[74.443859,14.617222],[73.534199,15.990652],[73.119909,17.92857],[72.820909,19.208234],[72.824475,20.419503],[72.630533,21.356009],[71.175273,20.757441],[70.470459,20.877331],[69.16413,22.089298],[69.644928,22.450775],[69.349597,22.84318],[68.176645,23.691965],[68.842599,24.359134],[71.04324,24.356524],[70.844699,25.215102],[70.282873,25.722229],[70.168927,26.491872],[69.514393,26.940966],[70.616496,27.989196],[71.777666,27.91318],[72.823752,28.961592],[73.450638,29.976413],[74.42138,30.979815],[74.405929,31.692639],[75.258642,32.271105],[74.451559,32.7649],[74.104294,33.441473],[73.749948,34.317699],[74.240203,34.748887],[75.757061,34.504923],[76.871722,34.653544],[77.837451,35.49401],[78.912269,34.321936],[78.811086,33.506198],[79.208892,32.994395],[79.176129,32.48378],[78.458446,32.618164],[78.738894,31.515906],[79.721367,30.882715],[81.111256,30.183481],[80.476721,29.729865],[80.088425,28.79447],[81.057203,28.416095],[81.999987,27.925479],[83.304249,27.364506],[84.675018,27.234901],[85.251779,26.726198],[86.024393,26.630985],[87.227472,26.397898],[88.060238,26.414615],[88.174804,26.810405],[88.043133,27.445819],[88.120441,27.876542],[88.730326,28.086865],[88.814248,27.299316],[88.835643,27.098966],[89.744528,26.719403],[90.373275,26.875724],[91.217513,26.808648],[92.033484,26.83831],[92.103712,27.452614],[91.696657,27.771742],[92.503119,27.896876],[93.413348,28.640629],[94.56599,29.277438],[95.404802,29.031717],[96.117679,29.452802],[96.586591,28.83098],[96.248833,28.411031],[97.327114,28.261583]];

function chronologicalTrips() {
  return VAULT.trips
    .map((trip, index) => ({ trip, index }))
    .sort((a, b) => (a.trip.startDate || '9999').localeCompare(b.trip.startDate || '9999') || a.index - b.index)
    .map(({ trip }) => trip);
}

function journeyPoints(trips) {
  return trips.flatMap(trip => (trip.locationPoints || [])
    .filter(point => Number.isFinite(point.latitude) && Number.isFinite(point.longitude))
    .map(point => ({ ...point, trip })));
}

function geoProject(longitude, latitude) {
  const left = 44;
  const top = 28;
  const width = 492;
  const height = 464;
  const x = left + ((longitude - 67.5) / (98.5 - 67.5)) * width;
  const y = top + ((36.5 - latitude) / (36.5 - 6.5)) * height;
  return [x, y];
}

function spreadMapMarkers(projected) {
  const occupied = [];
  const offsets = [[0,0],[20,-18],[-20,18],[24,18],[-24,-18],[34,0],[-34,0],[0,34],[0,-34]];
  return projected.map(entry => {
    const [x, y] = entry.xy;
    const [dx, dy] = offsets.find(([ox, oy]) =>
      occupied.every(([px, py]) => Math.hypot(x + ox - px, y + oy - py) >= 24)
    ) || offsets[offsets.length - 1];
    const display = [x + dx, y + dy];
    occupied.push(display);
    return { ...entry, display };
  });
}

function renderJourneyMap(elId) {
  const el = document.getElementById(elId);
  const trips = chronologicalTrips();
  const points = journeyPoints(trips);
  const countEl = document.getElementById('map-point-count');
  countEl.textContent = `${points.length} ${points.length === 1 ? 'point' : 'points'}`;

  if (!points.length) {
    el.innerHTML = '<p class="journey-empty">No verified location points yet.</p>';
    return;
  }

  const outlinePath = INDIA_OUTLINE.map(([lng, lat], i) => {
    const [x, y] = geoProject(lng, lat);
    return `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ') + ' Z';
  const projected = spreadMapMarkers(points.map(point => ({ point, xy: geoProject(point.longitude, point.latitude) })));
  const route = projected.map(({ xy }) => xy.map(n => n.toFixed(1)).join(',')).join(' ');
  const markers = projected.map(({ point, xy, display }, index) => `
    ${Math.hypot(display[0] - xy[0], display[1] - xy[1]) > 1 ? `<line class="map-marker-leader" x1="${xy[0].toFixed(1)}" y1="${xy[1].toFixed(1)}" x2="${display[0].toFixed(1)}" y2="${display[1].toFixed(1)}"></line>` : ''}
    <g class="map-marker" transform="translate(${display[0].toFixed(1)} ${display[1].toFixed(1)})">
      <circle class="map-marker-halo" r="12"></circle>
      <circle class="map-marker-dot" r="8"></circle>
      <text text-anchor="middle" dy="3.5">${index + 1}</text>
      <title>${escHtml(point.name)} · ${escHtml(point.trip.dateRange)}${point.approximate ? ' · approximate point' : ''}</title>
    </g>
  `).join('');

  el.innerHTML = `
    <svg class="journey-map" viewBox="0 0 580 520" role="img" aria-label="Map of recorded travel locations in chronological order">
      <path class="india-outline" d="${outlinePath}"></path>
      ${projected.length > 1 ? `<polyline class="journey-route" points="${route}"></polyline>` : ''}
      ${markers}
      <g class="map-north" transform="translate(552 38)"><path d="M0 18 L0 -5 M0 -5 L-4 3 M0 -5 L4 3"></path><text y="30" text-anchor="middle">N</text></g>
    </svg>
    <p class="map-note">Numbers follow the timeline. Dashed segments show sequence, not the route travelled; close markers may be offset with leader lines.</p>
  `;
}

function renderJourneyTimeline(elId) {
  const el = document.getElementById(elId);
  const trips = chronologicalTrips();
  let pointNumber = 0;
  el.innerHTML = trips.map(trip => {
    const mapped = (trip.locationPoints || []).filter(point => Number.isFinite(point.latitude) && Number.isFinite(point.longitude));
    const numbers = mapped.map(() => ++pointNumber);
    const pointNames = mapped.map(point => `${escHtml(point.name)}${point.approximate ? ' <span class="approx">approx.</span>' : ''}`).join(' · ');
    return `
      <article class="timeline-entry">
        <div class="timeline-marker">${numbers.length ? numbers.join('–') : '—'}</div>
        <div class="timeline-copy">
          <div class="timeline-date">${escHtml(trip.dateRange)}</div>
          <h4><a href="trips/${trip.slug}.html">${escHtml(trip.name)}</a></h4>
          <p>${pointNames || 'Location not mapped'}</p>
        </div>
      </article>
    `;
  }).join('');
}

// ===========================================================
// Chart.js helpers (donut)
// ===========================================================

const CHART_COLORS = ['#1a2238', '#b6894a', '#3c5a73', '#c97b5a', '#4a6b4a', '#7b7363', '#d4a84b'];

function buildDonut(canvasId, labels, values, opts = {}) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: labels.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
        borderColor: '#faf6ef',
        borderWidth: 3,
        hoverOffset: 10,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '62%',
      plugins: {
        legend: {
          position: 'right',
          labels: {
            color: '#1a2238',
            font: { family: 'Inter', size: 12 },
            padding: 14,
            boxWidth: 12,
            boxHeight: 12,
            generateLabels: (chart) => {
              const data = chart.data;
              const total = data.datasets[0].data.reduce((a,b)=>a+b,0);
              return data.labels.map((label, i) => {
                const v = data.datasets[0].data[i];
                const pct = total ? ((v / total) * 100).toFixed(1) : '0.0';
                return {
                  text: `${label} — ${pct}%`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  strokeStyle: data.datasets[0].backgroundColor[i],
                  lineWidth: 0,
                  index: i,
                };
              });
            },
          },
        },
        tooltip: {
          backgroundColor: '#1a2238',
          titleFont: { family: 'Playfair Display', size: 14, weight: '700' },
          bodyFont: { family: 'Inter', size: 13 },
          padding: 12,
          cornerRadius: 2,
          displayColors: false,
          callbacks: {
            label: (c) => {
              const total = c.dataset.data.reduce((a,b)=>a+b,0);
              const pct = total ? ((c.parsed / total) * 100).toFixed(1) : '0.0';
              return `₹${fmtINR(c.parsed)}  ·  ${pct}%`;
            },
          },
        },
      },
      animation: { animateRotate: true, duration: 900, easing: 'easeOutQuart' },
      ...opts,
    },
  });
}

function renderLandingCharts() {
  // By destination
  buildDonut(
    'chart-destinations',
    VAULT.trips.map(t => t.name.replace(/ (Expedition|Getaway|Forest Circuit|Nature Retreat)$/, '')),
    VAULT.trips.map(t => t.total),
  );
  // By category
  buildDonut(
    'chart-categories',
    VAULT.categorySplit.map(c => c.category),
    VAULT.categorySplit.map(c => c.amount),
  );
}

// ===========================================================
// Trip subpage renders
// ===========================================================

function findTrip(slug) {
  return VAULT.trips.find(t => t.slug === slug);
}

function renderTripHero(slug) {
  const t = findTrip(slug);
  if (!t) return;
  document.title = `${t.name} · Travel Vault`;
  const hero = document.getElementById('trip-hero');
  hero.style.setProperty('--th', t.palette.hero);
  hero.style.setProperty('--ta', t.palette.accent);
  document.getElementById('trip-glyph').textContent = t.emoji;
  document.getElementById('trip-vibe').textContent = t.vibe;
  document.getElementById('trip-name').textContent = t.name;
  document.getElementById('trip-headline').textContent = t.headline;
  document.getElementById('meta-dates').textContent = t.dateRange;
  document.getElementById('meta-region').textContent = t.region;
  document.getElementById('meta-nights').textContent = `${t.nights} ${t.nights === 1 ? 'night' : 'nights'}`;
  document.getElementById('meta-vibe').textContent = t.vibe;
}

function renderTripStats(slug) {
  const t = findTrip(slug);
  if (!t) return;
  const el = document.getElementById('trip-stats');
  const lineItems = t.ledger.length || (t.categorySummary ? t.categorySummary.length : 0);
  el.innerHTML = `
    <div class="ts-cell">
      <div class="ts-label">Audited Total</div>
      <div class="ts-value"><span class="currency">₹</span>${fmtINR(t.total)}</div>
    </div>
    <div class="ts-cell">
      <div class="ts-label">% of Lifetime</div>
      <div class="ts-value">${t.sharePct.toFixed(1)}%</div>
    </div>
    <div class="ts-cell">
      <div class="ts-label">Nights</div>
      <div class="ts-value">${t.nights}</div>
    </div>
    <div class="ts-cell">
      <div class="ts-label">Line Items</div>
      <div class="ts-value">${lineItems}</div>
    </div>
  `;
}

function renderTripDonut(slug) {
  const t = findTrip(slug);
  if (!t) return;
  const entries = Object.entries(t.categoryTotals).filter(([, v]) => v > 0);
  buildDonut(
    'trip-donut',
    entries.map(([k]) => k),
    entries.map(([, v]) => v),
  );
}

function renderTripLedgerOrSummary(slug) {
  const t = findTrip(slug);
  if (!t) return;
  const el = document.getElementById('trip-content');
  if (t.ledger && t.ledger.length) {
    // Dated ledger
    let prevDate = null;
    const rows = t.ledger.map(r => {
      const breakRow = r.date !== prevDate;
      prevDate = r.date;
      const slug = catSlug(r.category);
      return `
        <tr class="${breakRow ? 'date-break-start' : ''}">
          <td class="date">${breakRow ? escHtml(r.date) : ''}</td>
          <td>${escHtml(r.item)}</td>
          <td><span class="cat-pill cat-${slug}">${escHtml(r.category)}</span></td>
          <td class="num">₹${fmtINRDecimal(r.amount)}</td>
        </tr>
      `;
    }).join('');
    el.innerHTML = `
      <div class="ledger-wrap">
        <table class="ledger">
          <thead>
            <tr>
              <th>Date</th>
              <th>Item / Activity</th>
              <th>Category</th>
              <th class="num">Amount (INR)</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
          <tfoot>
            <tr>
              <td colspan="3">Segment Archive Total</td>
              <td class="num">₹${fmtINRDecimal(t.total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    `;
  } else if (t.categorySummary) {
    // Summary card grid
    el.innerHTML = `
      <div class="cat-summary-grid">
        ${t.categorySummary.map(c => `
          <div class="cat-summary-card">
            <div class="cs-cat">${escHtml(c.category)}</div>
            <div class="cs-ctx">${escHtml(c.context)}</div>
            <div class="cs-amt"><span class="currency">₹</span>${fmtINR(c.amount)}</div>
          </div>
        `).join('')}
      </div>
    `;
  }
}

// ===========================================================
// Boot — only run page-specific render after unlock.
// Each page sets window.PAGE_KIND and (for trips) window.TRIP_SLUG.
// ===========================================================

document.addEventListener('vault:unlocked', () => {
  if (window.PAGE_KIND === 'landing') {
    renderLandingStats('landing-stats');
    renderDashboardTable('landing-dashboard');
    renderBehavioralProfile('landing-profile');
    renderTripCards('landing-trips');
    renderJourneyMap('journey-map');
    renderJourneyTimeline('journey-timeline');
    renderLandingCharts();
  } else if (window.PAGE_KIND === 'trip') {
    const slug = window.TRIP_SLUG;
    renderTripHero(slug);
    renderTripStats(slug);
    renderTripDonut(slug);
    renderTripLedgerOrSummary(slug);
  }
});
