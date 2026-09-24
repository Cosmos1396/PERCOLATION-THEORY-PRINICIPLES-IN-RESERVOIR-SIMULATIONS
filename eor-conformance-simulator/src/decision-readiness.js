const $ = id => document.getElementById(id);

function numberFromText(text) {
  const m = String(text ?? '').match(/-?\d+(?:\.\d+)?/);
  return m ? Number(m[0]) : Number.NaN;
}

function classify() {
  const bt = $('btKpi')?.textContent?.trim() ?? '—';
  const wc = numberFromText($('wcKpi')?.textContent);
  const mb = Math.abs(numberFromText($('mbKpi')?.textContent));
  const maturity = $('readinessMaturity');
  const balance = $('readinessBalance');
  const use = $('readinessUse');
  const note = $('readinessNote');
  if (!maturity || !balance || !use || !note) return;

  if (!Number.isFinite(wc) || bt === '—') {
    maturity.textContent = 'Run required';
    balance.textContent = '—';
    use.textContent = 'Research screening';
    note.textContent = 'Run the simulator before interpreting treatment performance.';
    return;
  }

  const breakthroughObserved = !bt.toLowerCase().includes('no breakthrough');
  maturity.textContent = breakthroughObserved ? 'Post-breakthrough response available' : 'Pre-breakthrough / insufficient horizon';
  balance.textContent = Number.isFinite(mb) ? `${mb.toExponential(2)} % PV` : '—';
  use.textContent = 'Reduced-order research only';

  if (!breakthroughObserved) {
    note.textContent = 'Do not claim conformance benefit from this run: producer breakthrough was not reached, so water-control effectiveness and incremental recovery are not decision-ready.';
  } else if (wc < 10) {
    note.textContent = 'Breakthrough occurred, but the final water cut remains modest. Compare an untreated case on identical geology before attributing benefit to treatment.';
  } else {
    note.textContent = 'The run contains a post-breakthrough response suitable for same-geology research comparison. It is still not a field-calibrated forecast.';
  }
}

const observer = new MutationObserver(classify);
for (const id of ['btKpi', 'wcKpi', 'mbKpi']) {
  const node = $(id);
  if (node) observer.observe(node, { childList: true, characterData: true, subtree: true });
}

document.addEventListener('DOMContentLoaded', classify);
classify();
