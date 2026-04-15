// ═══════════════════════════════════════════════════
// PING & LATENCY ANALYZER — ping.js  (SubnetLab Pro)
// Simulates ICMP echo with realistic RTT profiles,
// live terminal output, SVG latency graph, jitter,
// packet loss %, and Cisco-style ping statistics.
// Note: browsers cannot send raw ICMP — this tool
// models real-world ping behaviour for education.
// ═══════════════════════════════════════════════════
(function () {
  'use strict';

  // ── State
  const PS = {
    running: false,
    timer: null,
    results: [],       // { seq, rtt, lost }
    target: '',
    count: 0,
    sent: 0,
    profile: 'wan',
    size: 32,
    stopped: false
  };

  // ── RTT profiles (base_ms, jitter_ms, loss_pct)
  const PROFILES = {
    lan:     { label: 'LAN  (Gigabit)',          base: 0.4,  jitter: 0.3,  loss: 0.0,  ttl: 64,  note: 'Same-subnet Ethernet' },
    vlan:    { label: 'VLAN Hop  (L3 switch)',    base: 1.2,  jitter: 0.5,  loss: 0.0,  ttl: 63,  note: 'Single inter-VLAN routed hop' },
    wan:     { label: 'WAN  (MPLS / Leased)',     base: 18,   jitter: 4,    loss: 0.2,  ttl: 58,  note: 'Typical enterprise WAN circuit' },
    inet:    { label: 'Internet  (Regional)',     base: 35,   jitter: 8,    loss: 0.5,  ttl: 55,  note: 'Regional ISP — same continent' },
    lte:     { label: '4G / LTE  (Mobile)',       base: 55,   jitter: 20,   loss: 1.5,  ttl: 53,  note: 'Mobile data — typical urban' },
    sat:     { label: 'Satellite  (GEO)',         base: 620,  jitter: 40,   loss: 3.0,  ttl: 48,  note: 'Geostationary — ~35,786 km orbit' },
    inter:   { label: 'Intercontinental',         base: 180,  jitter: 12,   loss: 0.3,  ttl: 50,  note: 'Trans-Pacific / Trans-Atlantic' },
    congested:{ label: 'Congested  (High Loss)', base: 90,   jitter: 60,   loss: 15,   ttl: 52,  note: 'Overloaded link — packet loss scenario' },
  };

  // ── Generate one RTT sample with realistic gaussian-like jitter
  function sampleRTT(profile) {
    const p = PROFILES[profile];
    if (Math.random() * 100 < p.loss) return null; // dropped
    // Box-Muller for gaussian jitter
    const u1 = Math.random(), u2 = Math.random();
    const gauss = Math.sqrt(-2 * Math.log(u1 + 0.0001)) * Math.cos(2 * Math.PI * u2);
    const rtt = p.base + gauss * p.jitter;
    return Math.max(0.1, rtt);
  }

  // ── Statistics helpers
  function calcStats(results) {
    const rtts = results.filter(r => !r.lost).map(r => r.rtt);
    if (!rtts.length) return null;
    const min  = Math.min(...rtts);
    const max  = Math.max(...rtts);
    const avg  = rtts.reduce((a, b) => a + b, 0) / rtts.length;
    const mdev = Math.sqrt(rtts.map(r => (r - avg) ** 2).reduce((a, b) => a + b, 0) / rtts.length);
    const lost  = results.filter(r => r.lost).length;
    const lossPct = ((lost / results.length) * 100).toFixed(1);
    return { min, max, avg, mdev, lost, lossPct, count: rtts.length };
  }

  function fmtMs(ms) {
    if (ms === null) return '—';
    return ms < 10 ? ms.toFixed(2) + ' ms' : ms.toFixed(1) + ' ms';
  }

  // ── Render terminal line
  function appendLine(html) {
    const term = document.getElementById('ping-terminal');
    if (!term) return;
    const line = document.createElement('div');
    line.innerHTML = html;
    term.appendChild(line);
    term.scrollTop = term.scrollHeight;
  }

  function clearTerminal() {
    const term = document.getElementById('ping-terminal');
    if (term) term.innerHTML = '';
  }

  // ── SVG latency graph
  function renderGraph() {
    const svg = document.getElementById('ping-graph');
    if (!svg || !PS.results.length) return;
    const W = 560, H = 110, PAD = 36;
    const drawn = PS.results.slice(-60); // last 60 samples
    const rtts  = drawn.filter(r => !r.lost).map(r => r.rtt);
    if (!rtts.length) { svg.innerHTML = ''; return; }

    const maxR = Math.max(...rtts) * 1.15;
    const minR = 0;
    const range = maxR - minR || 1;
    const gW = W - PAD * 2, gH = H - 28;

    const toX = i  => PAD + (i / (drawn.length - 1 || 1)) * gW;
    const toY = ms => (H - 14) - ((ms - minR) / range) * gH;

    // Build polyline points (skip lost)
    let path = '';
    drawn.forEach((r, i) => {
      if (!r.lost) {
        const cmd = path === '' ? 'M' : 'L';
        path += `${cmd}${toX(i).toFixed(1)},${toY(r.rtt).toFixed(1)} `;
      }
    });

    // Grid lines
    const ticks = 4;
    let gridLines = '';
    for (let t = 0; t <= ticks; t++) {
      const y = (H - 14) - (t / ticks) * gH;
      const val = ((t / ticks) * maxR).toFixed(t === 0 ? 0 : 1);
      gridLines += `<line x1="${PAD}" y1="${y.toFixed(1)}" x2="${W - PAD}" y2="${y.toFixed(1)}" stroke="var(--border)" stroke-width="0.5"/>
        <text x="${PAD - 4}" y="${(y + 3).toFixed(1)}" text-anchor="end" font-size="8" fill="var(--muted)" font-family="var(--mono)">${val}</text>`;
    }

    // Dots for lost packets
    let lostDots = drawn.map((r, i) =>
      r.lost ? `<circle cx="${toX(i).toFixed(1)}" cy="${(H - 14 - gH / 2).toFixed(1)}" r="3" fill="var(--red)" opacity="0.7"/>` : ''
    ).join('');

    // Avg line
    const st = calcStats(PS.results);
    const avgY = toY(st ? st.avg : 0).toFixed(1);

    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.innerHTML = `
      ${gridLines}
      <line x1="${PAD}" y1="0" x2="${PAD}" y2="${H - 14}" stroke="var(--border)" stroke-width="0.8"/>
      <line x1="${PAD}" y1="${H - 14}" x2="${W - PAD}" y2="${H - 14}" stroke="var(--border)" stroke-width="0.8"/>
      ${st ? `<line x1="${PAD}" y1="${avgY}" x2="${W - PAD}" y2="${avgY}" stroke="var(--amber)" stroke-width="0.8" stroke-dasharray="4,3" opacity="0.6"/>
              <text x="${W - PAD + 3}" y="${(parseFloat(avgY) + 3).toFixed(1)}" font-size="8" fill="var(--amber)" font-family="var(--mono)">avg</text>` : ''}
      <polyline points="${path.trim().replace(/[ML]/g, '').trim()}" fill="none" stroke="var(--cyan)" stroke-width="1.5" stroke-linejoin="round"/>
      ${lostDots}
      <text x="${W / 2}" y="${H - 2}" text-anchor="middle" font-size="8" fill="var(--muted)" font-family="var(--mono)">Sequence →   (● = packet lost)</text>`;
  }

  // ── Render live stats panel
  function renderStats() {
    const el = document.getElementById('ping-stats');
    if (!el || !PS.results.length) return;
    const st = calcStats(PS.results);
    const sent = PS.results.length;
    const recv = st ? st.count : 0;

    el.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:8px;">
        ${[
          ['Transmitted', sent,                                   'var(--blue)'],
          ['Received',    recv,                                   'var(--green)'],
          ['Lost',        sent - recv,                            sent - recv > 0 ? 'var(--red)' : 'var(--muted2)'],
          ['Loss %',      (st ? st.lossPct : '100') + '%',       parseFloat(st?.lossPct || 100) > 5 ? 'var(--red)' : 'var(--green)'],
          ['Min RTT',     st ? fmtMs(st.min) : '—',              'var(--green)'],
          ['Avg RTT',     st ? fmtMs(st.avg) : '—',              'var(--cyan)'],
          ['Max RTT',     st ? fmtMs(st.max) : '—',              'var(--amber)'],
          ['Jitter',      st ? fmtMs(st.mdev) : '—',             'var(--purple)'],
        ].map(([k, v, c]) => `
          <div style="background:var(--bg2);border-radius:8px;padding:10px;text-align:center;border:1px solid var(--border);">
            <div style="font-family:var(--mono);font-size:9px;color:var(--muted);margin-bottom:4px;">${k.toUpperCase()}</div>
            <div style="font-family:var(--mono);font-size:15px;font-weight:700;color:${c};">${v}</div>
          </div>`).join('')}
      </div>`;
  }

  // ── Render Cisco-style summary at end
  function renderCiscoSummary() {
    const st = calcStats(PS.results);
    const p  = PROFILES[PS.profile];
    const sent = PS.results.length, recv = st ? st.count : 0;
    const successPct = Math.round((recv / sent) * 100);
    const bar = '!'.repeat(recv) + '.'.repeat(sent - recv);
    let quality = '', qColor = 'var(--green)';
    if (successPct < 50) { quality = '⛔ Very High Loss — Check link / route'; qColor = 'var(--red)'; }
    else if (successPct < 90) { quality = '⚠ Packet Loss Detected — Investigate'; qColor = 'var(--amber)'; }
    else if (st && st.mdev > st.avg * 0.4) { quality = '⚠ High Jitter — QoS / buffer issue'; qColor = 'var(--amber)'; }
    else { quality = '✓ Link looks healthy'; qColor = 'var(--green)'; }

    appendLine(`<span style="color:var(--muted);">---</span>`);
    appendLine(`<span style="color:var(--green);">${bar}</span>`);
    appendLine(`<span style="color:var(--text);">Success rate is <strong style="color:${qColor}">${successPct} percent</strong> (${recv}/${sent})</span>`);
    if (st) appendLine(`<span style="color:var(--muted2);">round-trip min/avg/max/stddev = ${fmtMs(st.min)} / ${fmtMs(st.avg)} / ${fmtMs(st.max)} / ${fmtMs(st.mdev)}</span>`);
    appendLine(`<br><span style="color:${qColor};font-weight:600;">${quality}</span>`);
    appendLine(`<span style="color:var(--muted);font-size:11px;">Profile: ${p.label} — ${p.note} · TTL returned: ${p.ttl}</span>`);
  }

  // ── Main run loop
  window.pingRun = function () {
    if (PS.running) return;
    const targetEl  = document.getElementById('ping-target');
    const target    = targetEl ? targetEl.value.trim() : '';
    if (!target) { pingSetStatus('Enter a target IP or hostname first.', 'var(--red)'); return; }

    // Read count
    const cEl = document.getElementById('ping-count-val');
    PS.count   = parseInt(cEl ? cEl.textContent : '10');
    PS.target  = target;
    PS.results = [];
    PS.sent    = 0;
    PS.stopped = false;
    PS.running = true;

    clearTerminal();
    document.getElementById('ping-graph-wrap').style.display = 'block';
    document.getElementById('ping-stats-wrap').style.display = 'block';

    const p = PROFILES[PS.profile];
    const size = PS.size;
    appendLine(`<span style="color:var(--cyan);">PING ${target} ${size} bytes of data.  [Profile: ${p.label}]</span>`);
    appendLine(`<span style="color:var(--muted);font-size:10px;">Note: browser security prevents raw ICMP — RTT values are modelled on real-world ${p.note.toLowerCase()} characteristics.</span><br>`);

    pingSetStatus('Running…', 'var(--amber)');
    document.getElementById('ping-run-btn').disabled  = true;
    document.getElementById('ping-stop-btn').disabled = false;

    const interval = parseInt(document.getElementById('ping-interval-val')?.textContent || '1000');

    function sendOne() {
      if (PS.stopped || PS.sent >= PS.count) {
        finishPing();
        return;
      }
      PS.sent++;
      const seq = PS.sent;
      const rtt = sampleRTT(PS.profile);
      const lost = rtt === null;
      PS.results.push({ seq, rtt, lost });

      if (lost) {
        appendLine(`<span style="color:var(--red);">Request timeout for icmp_seq ${seq}</span>`);
      } else {
        const color = rtt < 5 ? 'var(--green)' : rtt < 50 ? 'var(--cyan)' : rtt < 200 ? 'var(--amber)' : 'var(--red)';
        appendLine(`<span style="color:var(--muted2);">${size} bytes from ${target}: icmp_seq=${seq} ttl=${p.ttl} time=<strong style="color:${color}">${fmtMs(rtt)}</strong></span>`);
      }

      renderGraph();
      renderStats();

      if (PS.sent < PS.count && !PS.stopped) {
        PS.timer = setTimeout(sendOne, interval);
      } else {
        finishPing();
      }
    }

    PS.timer = setTimeout(sendOne, 100);
  };

  function finishPing() {
    PS.running = false;
    renderCiscoSummary();
    renderGraph();
    renderStats();
    pingSetStatus('Complete', 'var(--green)');
    const runBtn  = document.getElementById('ping-run-btn');
    const stopBtn = document.getElementById('ping-stop-btn');
    if (runBtn)  runBtn.disabled  = false;
    if (stopBtn) stopBtn.disabled = true;
  }

  window.pingStop = function () {
    PS.stopped = true;
    if (PS.timer) clearTimeout(PS.timer);
    PS.running = false;
    appendLine(`<br><span style="color:var(--amber);">--- Interrupted by user ---</span>`);
    renderCiscoSummary();
    renderGraph();
    renderStats();
    pingSetStatus('Stopped', 'var(--amber)');
    const runBtn  = document.getElementById('ping-run-btn');
    const stopBtn = document.getElementById('ping-stop-btn');
    if (runBtn)  runBtn.disabled  = false;
    if (stopBtn) stopBtn.disabled = true;
  };

  window.pingClear = function () {
    if (PS.running) return;
    PS.results = [];
    clearTerminal();
    document.getElementById('ping-graph-wrap').style.display = 'none';
    document.getElementById('ping-stats-wrap').style.display = 'none';
    pingSetStatus('Ready', 'var(--muted)');
  };

  window.pingSetProfile = function (p) {
    PS.profile = p;
    document.querySelectorAll('.ping-profile-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.profile === p);
    });
  };

  window.pingSetCount = function (n) {
    const el = document.getElementById('ping-count-val');
    if (el) el.textContent = n;
    document.querySelectorAll('.ping-count-btn').forEach(b => b.classList.toggle('active', b.dataset.n === String(n)));
  };

  window.pingSetInterval = function (ms) {
    const el = document.getElementById('ping-interval-val');
    if (el) el.textContent = ms;
    document.querySelectorAll('.ping-intv-btn').forEach(b => b.classList.toggle('active', b.dataset.ms === String(ms)));
  };

  window.pingSetSize = function (s) {
    PS.size = s;
    document.querySelectorAll('.ping-size-btn').forEach(b => b.classList.toggle('active', b.dataset.s === String(s)));
  };

  function pingSetStatus(msg, color) {
    const el = document.getElementById('ping-status');
    if (el) { el.textContent = msg; el.style.color = color; }
  }

  // ── INIT
  function pingInit() {
    const page = document.getElementById('page-ping');
    if (!page) return;

    const profileBtns = Object.entries(PROFILES).map(([k, v]) =>
      `<button class="ping-profile-btn speed-btn${k === 'wan' ? ' active' : ''}" data-profile="${k}" onclick="pingSetProfile('${k}')" style="margin:2px;">${v.label}</button>`
    ).join('');

    page.innerHTML = `
<div class="page-hdr">
  <div class="page-title">📡 Ping & Latency Analyzer</div>
  <div class="page-sub">Simulate ICMP echo requests across 8 real-world network profiles. Analyse RTT, jitter, packet loss, and get Cisco-style ping statistics with a live latency graph.</div>
</div>

<div class="card">
  <div class="card-hdr">🎯 Target & Options</div>

  <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px;">
    <input id="ping-target" type="text" autocomplete="off" spellcheck="false"
      placeholder="e.g.  8.8.8.8  ·  192.168.1.1  ·  vpn.example.com"
      style="flex:1;min-width:200px;background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:10px 14px;border-radius:8px;font-family:var(--mono);font-size:13px;outline:none;">
    <button id="ping-run-btn"  onclick="pingRun()"  class="btn btn-primary" style="padding:10px 22px;">▶ Ping</button>
    <button id="ping-stop-btn" onclick="pingStop()" disabled
      style="background:rgba(248,113,113,0.08);border:1px solid rgba(248,113,113,0.4);color:var(--red);padding:10px 18px;border-radius:8px;font-family:var(--mono);font-size:12px;cursor:pointer;opacity:0.5">⏹ Stop</button>
    <button onclick="pingClear()"
      style="background:var(--bg3);border:1px solid var(--border);color:var(--muted2);padding:10px 14px;border-radius:8px;font-family:var(--mono);font-size:12px;cursor:pointer;">✕ Clear</button>
  </div>

  <!-- Network Profile -->
  <div style="margin-bottom:12px;">
    <div style="font-family:var(--mono);font-size:9px;font-weight:700;color:var(--amber);letter-spacing:1px;margin-bottom:6px;">NETWORK PROFILE</div>
    <div style="display:flex;flex-wrap:wrap;gap:4px;">${profileBtns}</div>
  </div>

  <div style="display:flex;flex-wrap:wrap;gap:20px;">
    <!-- Packet Count -->
    <div>
      <div style="font-family:var(--mono);font-size:9px;font-weight:700;color:var(--cyan);letter-spacing:1px;margin-bottom:6px;">COUNT <span id="ping-count-val" style="color:var(--text);">10</span></div>
      <div class="speed-group">
        ${[5,10,20,50,100].map(n => `<button class="ping-count-btn speed-btn${n===10?' active':''}" data-n="${n}" onclick="pingSetCount(${n})">${n}</button>`).join('')}
      </div>
    </div>
    <!-- Interval -->
    <div>
      <div style="font-family:var(--mono);font-size:9px;font-weight:700;color:var(--purple);letter-spacing:1px;margin-bottom:6px;">INTERVAL (ms) <span id="ping-interval-val" style="color:var(--text);">500</span></div>
      <div class="speed-group">
        ${[200,500,1000,2000].map((ms,i) => `<button class="ping-intv-btn speed-btn${i===1?' active':''}" data-ms="${ms}" onclick="pingSetInterval(${ms})">${ms}</button>`).join('')}
      </div>
    </div>
    <!-- Packet Size -->
    <div>
      <div style="font-family:var(--mono);font-size:9px;font-weight:700;color:var(--green);letter-spacing:1px;margin-bottom:6px;">SIZE (bytes)</div>
      <div class="speed-group">
        ${[[32,'32'],[64,'64'],[128,'128'],[1400,'1400 (near-MTU)']].map(([s,l],i) => `<button class="ping-size-btn speed-btn${i===0?' active':''}" data-s="${s}" onclick="pingSetSize(${s})">${l}</button>`).join('')}
      </div>
    </div>
  </div>

  <div style="margin-top:10px;font-family:var(--mono);font-size:10px;color:var(--muted);">
    Status: <span id="ping-status" style="color:var(--muted);">Ready</span>
  </div>
</div>

<!-- Terminal Output -->
<div class="card" style="margin-top:14px;">
  <div class="card-hdr">🖥️ Terminal Output</div>
  <div id="ping-terminal"
    style="background:#0a0c14;border-radius:8px;padding:14px;font-family:var(--mono);font-size:12px;line-height:1.9;min-height:120px;max-height:340px;overflow-y:auto;border:1px solid var(--border);color:var(--muted2);">
    <span style="color:var(--muted);">Enter a target above and press ▶ Ping to begin…</span>
  </div>
</div>

<!-- Latency Graph -->
<div id="ping-graph-wrap" class="card" style="margin-top:14px;display:none;">
  <div class="card-hdr">📈 RTT Graph  <span style="font-size:10px;color:var(--muted);font-weight:400;">— cyan line = RTT  ·  amber dashed = avg  ·  red dot = lost</span></div>
  <svg id="ping-graph" style="width:100%;height:auto;" preserveAspectRatio="xMidYMid meet"></svg>
</div>

<!-- Stats Panel -->
<div id="ping-stats-wrap" style="display:none;margin-top:14px;">
  <div class="card">
    <div class="card-hdr">📊 Statistics</div>
    <div id="ping-stats"></div>
  </div>
</div>

<!-- Reference Card -->
<div class="card" style="margin-top:14px;">
  <div class="card-hdr">📚 RTT Interpretation Guide</div>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px;">
    ${[
      ['< 1 ms',   'var(--green)',  'LAN / Same switch',      'Normal for Ethernet — anything higher suggests a problem'],
      ['1–10 ms',  'var(--green)',  'LAN / L3 routed',        'Healthy inter-VLAN or router hop — sub-10ms is fine'],
      ['10–50 ms', 'var(--cyan)',   'Metro / Regional WAN',   'Good WAN — acceptable for real-time apps with QoS'],
      ['50–150ms', 'var(--amber)',  'National / LTE',         'VoIP starts degrading above 150ms one-way (MOS impact)'],
      ['150–300ms','var(--amber)',  'Intercontinental',       'Acceptable for data — voice needs G.722/Opus + QoS'],
      ['> 300 ms', 'var(--red)',    'Satellite / Congested',  'VoIP/video unusable — check for congestion, routing loop'],
    ].map(([rtt,c,label,desc]) => `
      <div style="background:var(--bg3);border-radius:8px;padding:10px;border-left:3px solid ${c};">
        <div style="font-family:var(--mono);font-size:11px;font-weight:700;color:${c};">${rtt}</div>
        <div style="font-size:11px;color:var(--text);margin:3px 0;">${label}</div>
        <div style="font-size:10px;color:var(--muted);">${desc}</div>
      </div>`).join('')}
  </div>
  <div style="margin-top:10px;font-family:var(--mono);font-size:10px;color:var(--muted);line-height:1.9;border-top:1px solid var(--border);padding-top:8px;">
    <span style="color:var(--amber)">Jitter:</span> Variation in RTT — high jitter (>30ms) causes voice/video quality issues even if avg latency is acceptable &nbsp;|&nbsp;
    <span style="color:var(--red)">Packet Loss:</span> > 1% impacts TCP throughput; > 5% breaks real-time apps &nbsp;|&nbsp;
    <span style="color:var(--cyan)">Cisco:</span> ping [ip] repeat 100 timeout 2 size 1400 — extended ping checks MTU path
  </div>
</div>`;
  }

  document.addEventListener('DOMContentLoaded', pingInit);
})();
