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
    renderLandingCharts();
  } else if (window.PAGE_KIND === 'trip') {
    const slug = window.TRIP_SLUG;
    renderTripHero(slug);
    renderTripStats(slug);
    renderTripDonut(slug);
    renderTripLedgerOrSummary(slug);
  }
});
