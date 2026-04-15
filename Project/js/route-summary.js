// ═══════════════════════════════════════════════════
// ROUTE SUMMARIZATION CALCULATOR — route-summary.js
// Finds optimal summary routes for any list of IPv4
// prefixes. Trie-based algorithm with binary alignment
// visual — same logic routers use for BGP aggregation
// and OSPF area summarization.
// ═══════════════════════════════════════════════════
(function () {
  'use strict';

  // ── IP ↔ integer helpers
  function ipToInt(ip) {
    const parts = ip.split('.').map(Number);
    if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) return null;
    return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
  }

  function intToIp(n) {
    return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
  }

  function toBinary(n, bits) {
    return n.toString(2).padStart(bits, '0');
  }

  // ── Parse CIDR string → { net, prefix, addr }
  function parseCIDR(cidr) {
    const m = cidr.trim().match(/^(\d{1,3}(?:\.\d{1,3}){3})(?:\/(\d{1,2}))?$/);
    if (!m) return null;
    const prefix = m[2] !== undefined ? parseInt(m[2]) : 32;
    if (prefix < 0 || prefix > 32) return null;
    const addr = ipToInt(m[1]);
    if (addr === null) return null;
    const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
    const net  = (addr & mask) >>> 0;
    return { net, prefix, addr, original: cidr.trim() };
  }

  // ── Find longest common prefix among a set of network addresses
  function longestCommonPrefix(nets, prefixes) {
    if (!nets.length) return 0;
    let common = 32;
    for (let bit = 31; bit >= 0; bit--) {
      const mask = (1 << bit) >>> 0;
      const first = (nets[0] & mask) !== 0;
      for (let i = 1; i < nets.length; i++) {
        if (((nets[i] & mask) !== 0) !== first) {
          common = Math.min(common, 31 - bit);
          break;
        }
      }
    }
    // Can't summarize above the shortest input prefix
    const minPrefix = Math.min(...prefixes);
    return Math.min(common, minPrefix);
  }

  // ── Build prefix trie and extract minimal covering set
  function buildSummaries(entries) {
    // Sort by network address
    entries.sort((a, b) => a.net - b.net || a.prefix - b.prefix);

    const results = [];
    const used    = new Array(entries.length).fill(false);

    for (let i = 0; i < entries.length; i++) {
      if (used[i]) continue;
      // Collect all entries that share the same /N prefix as entries[i]
      let group = [entries[i]];
      used[i] = true;

      for (let j = i + 1; j < entries.length; j++) {
        if (used[j]) continue;
        // Try combining current group + entries[j]
        const candidate = [...group, entries[j]];
        const nets   = candidate.map(e => e.net);
        const prfxs  = candidate.map(e => e.prefix);
        const summPfx = longestCommonPrefix(nets, prfxs);
        const summNet = (nets[0] >> (32 - summPfx)) << (32 - summPfx);
        // Accept if all candidate entries are within the summary and none are outside
        const allIn = candidate.every(e => (e.net >>> (32 - summPfx)) === (summNet >>> (32 - summPfx)));
        if (allIn) {
          group.push(entries[j]);
          used[j] = true;
        }
      }

      const nets   = group.map(e => e.net);
      const prfxs  = group.map(e => e.prefix);
      const pfx    = longestCommonPrefix(nets, prfxs);
      const mask   = pfx === 0 ? 0 : (~0 << (32 - pfx)) >>> 0;
      const net    = (nets[0] & mask) >>> 0;
      const numHosts = pfx < 32 ? (1 << (32 - pfx)) - 2 : 0;
      const addrCnt  = 1 << (32 - pfx);

      results.push({
        summary: intToIp(net) + '/' + pfx,
        net, pfx, mask,
        group,
        addrCnt,
        numHosts,
        wildcardMask: intToIp(~mask >>> 0),
        subnetMask:   intToIp(mask),
      });
    }
    return results;
  }

  // ── Build binary alignment HTML — the key visual
  function buildBinaryTable(entries, summaries) {
    const allEntries = entries.slice().sort((a, b) => a.net - b.net);

    let html = `<div style="overflow-x:auto;">
      <table style="border-collapse:collapse;font-family:var(--mono);font-size:11px;width:100%;">
        <thead>
          <tr>
            <th style="text-align:left;padding:6px 10px;color:var(--muted);border-bottom:1px solid var(--border);">Prefix</th>
            <th style="text-align:left;padding:6px 10px;color:var(--muted);border-bottom:1px solid var(--border);">Network Address (32-bit binary)</th>
          </tr>
        </thead>
        <tbody>`;

    // Find which bits are "common" for each summary group
    summaries.forEach(s => {
      s.group.forEach(e => {
        const bin   = toBinary(e.net, 32);
        const commLen = s.pfx;

        // Build coloured binary string
        let binHtml = '';
        for (let i = 0; i < 32; i++) {
          if (i === commLen) binHtml += `<span style="opacity:0.3;">`;
          if (i > 0 && i % 8 === 0) binHtml += `<span style="color:var(--border);user-select:none;">.</span>`;
          const bit = bin[i];
          const inHost = i >= commLen;
          binHtml += `<span style="color:${inHost ? 'var(--muted)' : 'var(--cyan)'};background:${!inHost && i === commLen - 1 ? '' : ''};">${bit}</span>`;
        }
        if (commLen < 32) binHtml += `</span>`;

        html += `<tr style="border-bottom:1px solid rgba(255,255,255,0.04);">
          <td style="padding:5px 10px;color:var(--text);white-space:nowrap;">${e.original}</td>
          <td style="padding:5px 10px;white-space:nowrap;">${binHtml}</td>
        </tr>`;
      });

      // Summary row
      const sumBin  = toBinary(s.net, 32);
      let sumBinHtml = '';
      for (let i = 0; i < 32; i++) {
        if (i > 0 && i % 8 === 0) sumBinHtml += `<span style="color:var(--border);user-select:none;">.</span>`;
        const bit    = i < s.pfx ? sumBin[i] : 'x';
        const color  = i < s.pfx ? 'var(--green)' : 'var(--muted)';
        sumBinHtml += `<span style="color:${color};font-weight:${i < s.pfx ? '700' : '400'};">${bit}</span>`;
      }
      html += `<tr style="background:rgba(74,222,128,0.06);border-top:1px solid rgba(74,222,128,0.2);border-bottom:2px solid rgba(74,222,128,0.2);">
        <td style="padding:6px 10px;color:var(--green);font-weight:700;">→ ${s.summary}</td>
        <td style="padding:6px 10px;white-space:nowrap;">${sumBinHtml}
          <span style="color:var(--green);margin-left:10px;font-size:10px;">[${s.pfx} common bits]</span>
        </td>
      </tr><tr><td colspan="2" style="padding:3px;"></td></tr>`;
    });

    html += `</tbody></table>
      <div style="margin-top:6px;font-size:10px;color:var(--muted);">
        <span style="color:var(--cyan);font-weight:700;">Cyan</span> = matched (network) bits &nbsp;·&nbsp;
        <span style="color:var(--muted);">Dim</span> = host/variable bits &nbsp;·&nbsp;
        <span style="color:var(--green);font-weight:700;">Green</span> = summary prefix &nbsp;·&nbsp;
        <span style="color:var(--muted);">x</span> = wildcard
      </div>
    </div>`;
    return html;
  }

  // ── Check for wasted address space (supernet covers more than input)
  function buildWasteAnalysis(entries, summaries) {
    const inputCount   = entries.reduce((a, e) => a + (1 << (32 - e.prefix)), 0);
    const summaryCount = summaries.reduce((a, s) => a + s.addrCnt, 0);
    const waste        = summaryCount - inputCount;
    const wastePct     = ((waste / summaryCount) * 100).toFixed(1);
    return { inputCount, summaryCount, waste, wastePct };
  }

  // ── Main calculate function
  window.rsCalc = function () {
    const input = document.getElementById('rs-input');
    const out   = document.getElementById('rs-output');
    if (!input || !out) return;

    const lines   = input.value.trim().split(/[\n,]+/).map(l => l.trim()).filter(Boolean);
    const entries = [];
    const errors  = [];

    lines.forEach(l => {
      const parsed = parseCIDR(l);
      if (!parsed) errors.push(l);
      else entries.push(parsed);
    });

    if (errors.length) {
      out.innerHTML = `<div style="color:var(--red);font-family:var(--mono);font-size:12px;padding:10px 12px;background:rgba(248,113,113,0.08);border-radius:8px;">
        ✗ Invalid prefixes: ${errors.map(e => `<code>${e}</code>`).join(', ')}<br>
        <span style="color:var(--muted);font-size:11px;">Expected format: 192.168.1.0/24 — one per line or comma-separated</span>
      </div>`;
      return;
    }

    if (entries.length < 2) {
      out.innerHTML = `<div style="color:var(--amber);font-family:var(--mono);font-size:12px;padding:10px;">Enter at least 2 prefixes to summarize.</div>`;
      return;
    }

    const summaries = buildSummaries(entries);
    const waste     = buildWasteAnalysis(entries, summaries);
    const isSingle  = summaries.length === 1;

    // ── Summary result cards
    let sumCards = summaries.map(s => {
      const covers = s.group.map(e => `<code style="color:var(--blue);">${e.original}</code>`).join(' ');
      return `
        <div style="background:var(--bg2);border-radius:10px;padding:14px;border-left:3px solid var(--green);margin-bottom:10px;">
          <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;">
            <div style="font-family:var(--mono);font-size:20px;font-weight:700;color:var(--green);">${s.summary}</div>
            <div style="font-family:var(--mono);font-size:11px;color:var(--muted2);">
              Subnet Mask: <span style="color:var(--text);">${s.subnetMask}</span> &nbsp;·&nbsp;
              Wildcard: <span style="color:var(--amber);">${s.wildcardMask}</span> &nbsp;·&nbsp;
              Addresses: <span style="color:var(--cyan);">${s.addrCnt.toLocaleString()}</span>
            </div>
          </div>
          <div style="margin-top:8px;font-size:11px;color:var(--muted2);">Covers: ${covers}</div>
          <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap;">
            <div style="font-family:var(--mono);font-size:10px;padding:4px 10px;background:rgba(74,222,128,0.1);border-radius:6px;color:var(--green);">
              Cisco: ip route ${s.summary.replace('/',' ')} … &nbsp;|&nbsp; network ${intToIp(s.net)} ${s.wildcardMask}
            </div>
          </div>
        </div>`;
    }).join('');

    // ── Waste analysis
    const wasteHtml = `
      <div class="card" style="margin-top:14px;">
        <div class="card-hdr">📊 Address Space Analysis</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:8px;">
          ${[
            ['Input Prefixes',   entries.length,                 'var(--blue)'],
            ['Summary Routes',   summaries.length,               'var(--green)'],
            ['Input Addresses',  waste.inputCount.toLocaleString(), 'var(--cyan)'],
            ['Summary Covers',   waste.summaryCount.toLocaleString(), 'var(--amber)'],
            ['Extra (Waste)',    waste.waste.toLocaleString(),   waste.waste > 0 ? 'var(--amber)' : 'var(--green)'],
            ['Waste %',         waste.wastePct + '%',           parseFloat(waste.wastePct) > 25 ? 'var(--red)' : 'var(--amber)'],
          ].map(([k,v,c]) => `
            <div style="background:var(--bg3);border-radius:8px;padding:10px;text-align:center;border:1px solid var(--border);">
              <div style="font-family:var(--mono);font-size:9px;color:var(--muted);margin-bottom:4px;">${k.toUpperCase()}</div>
              <div style="font-family:var(--mono);font-size:16px;font-weight:700;color:${c};">${v}</div>
            </div>`).join('')}
        </div>
        ${waste.waste > 0 ? `<div style="margin-top:10px;font-size:11px;color:var(--amber);padding:8px 12px;background:rgba(251,191,36,0.08);border-radius:8px;">
          ⚠ Summary covers <strong>${waste.waste.toLocaleString()}</strong> extra addresses not in your input. 
          ${isSingle ? 'This is expected when input prefixes don\'t form a contiguous power-of-2 block.' : 'Consider splitting into multiple summary routes to reduce overreach.'}
        </div>` : `<div style="margin-top:10px;font-size:11px;color:var(--green);padding:8px 12px;background:rgba(74,222,128,0.08);border-radius:8px;">✓ Perfect aggregation — summary covers exactly the input address space.</div>`}
      </div>`;

    // ── Binary table
    const binHtml = `
      <div class="card" style="margin-top:14px;">
        <div class="card-hdr">🔢 Binary Alignment — Why This Summary Works</div>
        <p style="font-size:11px;color:var(--muted2);margin-bottom:12px;">The <strong style="color:var(--cyan);">common bits</strong> from the left determine the summary prefix length. All input routes share these bits — the router can represent them all with a single entry.</p>
        ${buildBinaryTable(entries, summaries)}
      </div>`;

    // ── Use-case configs
    const cfgHtml = summaries.map(s => `
      <div style="background:var(--bg3);border-radius:8px;padding:12px;border:1px solid var(--border);margin-bottom:8px;">
        <div style="font-family:var(--mono);font-size:9px;font-weight:700;color:var(--amber);margin-bottom:8px;">SUMMARY: ${s.summary}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          <div>
            <div style="font-size:9px;color:var(--muted);margin-bottom:4px;">OSPF Area Summary (ABR)</div>
            <code style="font-family:var(--mono);font-size:11px;color:var(--muted2);line-height:1.8;">
              router ospf 1<br>
              &nbsp;area 1 range ${s.summary}
            </code>
          </div>
          <div>
            <div style="font-size:9px;color:var(--muted);margin-bottom:4px;">BGP Aggregate (suppress-map)</div>
            <code style="font-family:var(--mono);font-size:11px;color:var(--muted2);line-height:1.8;">
              router bgp 65001<br>
              &nbsp;aggregate-address ${s.summary} summary-only
            </code>
          </div>
          <div>
            <div style="font-size:9px;color:var(--muted);margin-bottom:4px;">EIGRP Summary (interface)</div>
            <code style="font-family:var(--mono);font-size:11px;color:var(--muted2);line-height:1.8;">
              interface Gi0/0<br>
              &nbsp;ip summary-address eigrp 100 ${intToIp(s.net)} ${s.subnetMask}
            </code>
          </div>
          <div>
            <div style="font-size:9px;color:var(--muted);margin-bottom:4px;">Static Summary (null0 aggregate)</div>
            <code style="font-family:var(--mono);font-size:11px;color:var(--muted2);line-height:1.8;">
              ip route ${intToIp(s.net)} ${s.subnetMask} Null0<br>
              &nbsp;! Prevents routing loops
            </code>
          </div>
        </div>
      </div>`).join('');

    out.innerHTML = `
      <div style="margin-top:14px;">
        <div style="font-family:var(--mono);font-size:10px;font-weight:700;color:var(--muted);letter-spacing:1px;margin-bottom:8px;">
          RESULT — ${summaries.length} SUMMARY ROUTE${summaries.length > 1 ? 'S' : ''} FOR ${entries.length} INPUT PREFIXES
        </div>
        ${sumCards}
        ${wasteHtml}
        ${binHtml}
        <div class="card" style="margin-top:14px;">
          <div class="card-hdr">⚙️ Config Snippets</div>
          ${cfgHtml}
        </div>
      </div>`;
  };

  window.rsClear = function () {
    const inp = document.getElementById('rs-input');
    const out = document.getElementById('rs-output');
    if (inp) inp.value = '';
    if (out) out.innerHTML = '';
  };

  window.rsLoadExample = function (example) {
    const examples = {
      ospf: `192.168.0.0/24\n192.168.1.0/24\n192.168.2.0/24\n192.168.3.0/24`,
      bgp:  `10.10.0.0/24\n10.10.1.0/24\n10.10.2.0/24\n10.10.3.0/24\n10.10.4.0/24\n10.10.5.0/24\n10.10.6.0/24\n10.10.7.0/24`,
      mixed:`172.16.0.0/24\n172.16.1.0/24\n172.16.2.0/24\n172.16.4.0/24\n172.16.5.0/24`,
      ccie: `10.1.0.0/24\n10.1.1.0/24\n10.1.2.0/24\n10.1.3.0/24\n10.1.4.0/24\n10.1.5.0/24\n10.1.6.0/24\n10.1.7.0/24`,
    };
    const inp = document.getElementById('rs-input');
    if (inp && examples[example]) inp.value = examples[example];
  };

  // ── INIT
  function rsSummaryInit() {
    const page = document.getElementById('page-route-summary');
    if (!page) return;
    page.innerHTML = `
<div class="page-hdr">
  <div class="page-title">🔁 Route Summarization Calculator</div>
  <div class="page-sub">Find optimal summary routes for any list of IPv4 prefixes using binary alignment. Visualises why the summary works at the bit level — with OSPF, BGP, and EIGRP config output.</div>
</div>

<div class="card">
  <div class="card-hdr">📥 Input Prefixes</div>
  <p style="font-size:12px;color:var(--muted2);margin-bottom:10px;">Enter one prefix per line (CIDR notation). Comma-separated also works.</p>
  <textarea id="rs-input" rows="8" spellcheck="false" autocorrect="off"
    placeholder="192.168.0.0/24&#10;192.168.1.0/24&#10;192.168.2.0/24&#10;192.168.3.0/24"
    style="width:100%;box-sizing:border-box;background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:12px;border-radius:8px;font-family:var(--mono);font-size:13px;line-height:1.8;outline:none;resize:vertical;"></textarea>

  <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;align-items:center;">
    <button onclick="rsCalc()" class="btn btn-primary" style="padding:10px 24px;">🔁 Summarize</button>
    <button onclick="rsClear()" style="background:var(--bg3);border:1px solid var(--border);color:var(--muted2);padding:10px 14px;border-radius:8px;font-family:var(--mono);font-size:12px;cursor:pointer;">✕ Clear</button>
    <span style="font-family:var(--mono);font-size:10px;color:var(--muted);">Load example:</span>
    ${[['ospf','OSPF /22'],['bgp','BGP /21'],['mixed','Mixed (multi-summary)'],['ccie','CCIE Lab']].map(([k,l]) =>
      `<button onclick="rsLoadExample('${k}')" style="background:var(--bg3);border:1px solid var(--border);color:var(--cyan);padding:6px 12px;border-radius:7px;font-family:var(--mono);font-size:11px;cursor:pointer;">${l}</button>`
    ).join('')}
  </div>
</div>

<div id="rs-output"></div>

<div class="card" style="margin-top:14px;">
  <div class="card-hdr">📚 Summarization Rules</div>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;font-size:11px;color:var(--muted2);">
    <div style="background:var(--bg3);border-radius:8px;padding:12px;">
      <div style="font-family:var(--mono);font-size:9px;font-weight:700;color:var(--cyan);margin-bottom:6px;">RULE 1 — CONTIGUOUS BLOCK</div>
      Prefixes must form a contiguous power-of-2 block to summarize perfectly (e.g. .0–.3 → /22). Non-contiguous groups result in multiple summaries or extra address space.
    </div>
    <div style="background:var(--bg3);border-radius:8px;padding:12px;">
      <div style="font-family:var(--mono);font-size:9px;font-weight:700;color:var(--amber);margin-bottom:6px;">RULE 2 — SAME PREFIX LENGTH</div>
      Easiest to summarize same-length prefixes. Mixed lengths (e.g. /24 + /25) still work — the algorithm finds the longest common prefix across all network addresses.
    </div>
    <div style="background:var(--bg3);border-radius:8px;padding:12px;">
      <div style="font-family:var(--mono);font-size:9px;font-weight:700;color:var(--green);margin-bottom:6px;">RULE 3 — NULL0 ROUTE</div>
      Always add a static route to Null0 for the summary prefix to prevent routing loops: the router won't recurse to the default route if a more-specific route is missing.
    </div>
    <div style="background:var(--bg3);border-radius:8px;padding:12px;">
      <div style="font-family:var(--mono);font-size:9px;font-weight:700;color:var(--purple);margin-bottom:6px;">RULE 4 — WASTE TRADEOFF</div>
      Summarizing non-contiguous prefixes wastes address space. A /21 covers 2,048 addresses — if you only have 5×/24 (1,280 addrs), 768 are "over-advertised". Fine for internal; watch for BGP.
    </div>
  </div>
</div>`;
  }

  document.addEventListener('DOMContentLoaded', rsSummaryInit);
})();
