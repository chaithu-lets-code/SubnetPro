// ═══════════════════════════════════════════════════
// BGP ASN LOOKUP — bgp-asn.js  (SubnetLab Pro)
// Queries RIPE Stat (free, no auth, CORS-enabled) to
// look up ASN details, announced prefixes, and IP→ASN
// mapping. Includes local well-known ASN database for
// instant recognition of major networks.
// ═══════════════════════════════════════════════════
(function () {
  'use strict';

  const RIPE = 'https://stat.ripe.net/data';

  // ── Well-known ASNs for instant labelling
  const WELL_KNOWN = {
    15169: 'Google LLC',            8075: 'Microsoft Corporation',
    16509: 'Amazon AWS',            14618: 'Amazon.com',
    32934: 'Facebook / Meta',       13335: 'Cloudflare Inc.',
    20940: 'Akamai Technologies',   16625: 'Akamai Technologies',
    22822: 'Akamai Technologies',   32787: 'Akamai Technologies',
    714:   'Apple Inc.',            2906: 'Netflix',
    15133: 'Edgecast / Verizon',    36351: 'SoftLayer / IBM Cloud',
    3356:  'Lumen / CenturyLink',   1239: 'Sprint',
    7018:  'AT&T Services',         7132: 'AT&T Internet',
    22394: 'Verizon Business',      701:  'Verizon (UUNET)',
    3320:  'Deutsche Telekom',      5511: 'Orange France',
    3215:  'Orange / France Telecom',3269:'Telecom Italia',
    1273:  'Vodafone UK',           5089: 'Virgin Media UK',
    9121:  'Türk Telekom',          4134: 'China Telecom',
    4837:  'China Unicom',          9808: 'China Mobile',
    4766:  'Korea Telecom',         2516: 'KDDI Japan',
    7545:  'TPG Telecom Australia', 1221: 'Telstra Australia',
    6939:  'Hurricane Electric',    6453: 'TATA Communications',
    3257:  'GTT Communications',    1299: 'Telia Company',
    174:   'Cogent Communications', 3549: 'Level3 / Lumen',
    2914:  'NTT America',           5650: 'Frontier Communications',
    6128:  'Cablevision / Altice',  7922: 'Comcast',
    20001: 'TWC / Charter',        11351: 'Time Warner Telecom',
    3580:  'Swisscom',             6805: 'Telefonica Germany',
    12322: 'Free SAS (France)',    1257: 'Tele2 Group',
  };

  // ── Helpers
  function asnFromInput(val) {
    const s = val.trim().replace(/^as/i, '');
    const n = parseInt(s);
    return isNaN(n) || n <= 0 || n > 4294967295 ? null : n;
  }

  function isIPv4(s) {
    return /^\d{1,3}(\.\d{1,3}){3}$/.test(s.trim());
  }

  function setLoading(msg) {
    const el = document.getElementById('asn-output');
    if (el) el.innerHTML = `
      <div style="padding:24px;text-align:center;font-family:var(--mono);font-size:12px;color:var(--muted);">
        <div style="margin-bottom:8px;font-size:20px;animation:pulse 1s infinite alternate;">⏳</div>${msg}
      </div>`;
  }

  function setError(msg) {
    const el = document.getElementById('asn-output');
    if (el) el.innerHTML = `
      <div style="color:var(--red);font-family:var(--mono);font-size:12px;padding:12px;background:rgba(248,113,113,0.08);border-radius:8px;margin-top:10px;">${msg}</div>`;
  }

  async function ripeGet(endpoint, params) {
    const url = `${RIPE}/${endpoint}/data.json?${new URLSearchParams(params)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.status !== 'ok') throw new Error(json.status_code || 'RIPE API error');
    return json.data;
  }

  // ── Render ASN result
  function renderASN(overview, prefixes, routing) {
    const el = document.getElementById('asn-output');
    if (!el) return;

    const asn      = overview.resource;
    const name     = overview.holder || WELL_KNOWN[parseInt(asn)] || '—';
    const block    = overview.block || {};
    const v4prefs  = (prefixes.prefixes || []).filter(p => !p.prefix.includes(':'));
    const v6prefs  = (prefixes.prefixes || []).filter(p =>  p.prefix.includes(':'));
    const routedV4 = routing?.ris_prefixes_originating?.v4 ?? '—';
    const routedV6 = routing?.ris_prefixes_originating?.v6 ?? '—';

    // Registry badge colour
    const regColors = { ARIN: 'var(--blue)', RIPE: 'var(--cyan)', APNIC: 'var(--green)', LACNIC: 'var(--amber)', AFRINIC: 'var(--purple)' };
    const registry = block.registry ? block.registry.toUpperCase() : '—';
    const regColor = regColors[registry] || 'var(--muted2)';

    const isWellKnown = WELL_KNOWN[parseInt(asn)];

    // ── Top summary card
    let html = `
      <div style="margin-top:14px;">
        <div style="background:var(--bg2);border-radius:12px;padding:18px;border:1px solid var(--border);margin-bottom:14px;">
          <div style="display:flex;align-items:flex-start;gap:16px;flex-wrap:wrap;">
            <div style="font-family:var(--mono);font-size:28px;font-weight:700;color:var(--cyan);">AS${asn}</div>
            <div style="flex:1;min-width:160px;">
              <div style="font-size:16px;font-weight:600;color:var(--text);margin-bottom:6px;">${name}</div>
              <div style="display:flex;gap:8px;flex-wrap:wrap;">
                <span class="step-tag" style="background:rgba(56,217,192,0.1);color:${regColor};">📋 ${registry}</span>
                ${block.country ? `<span class="step-tag" style="background:rgba(91,156,246,0.1);color:var(--blue);">🌍 ${block.country.toUpperCase()}</span>` : ''}
                ${isWellKnown ? `<span class="step-tag" style="background:rgba(74,222,128,0.1);color:var(--green);">✓ Well-known network</span>` : ''}
              </div>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;margin-top:14px;">
            ${[
              ['IPv4 Prefixes', v4prefs.length,  'var(--blue)'],
              ['IPv6 Prefixes', v6prefs.length,  'var(--purple)'],
              ['Routed v4',     routedV4,         'var(--cyan)'],
              ['Routed v6',     routedV6,         'var(--green)'],
            ].map(([k,v,c]) => `
              <div style="background:var(--bg3);border-radius:8px;padding:10px;text-align:center;border:1px solid var(--border);">
                <div style="font-family:var(--mono);font-size:9px;color:var(--muted);margin-bottom:4px;">${k.toUpperCase()}</div>
                <div style="font-family:var(--mono);font-size:16px;font-weight:700;color:${c};">${v}</div>
              </div>`).join('')}
          </div>
        </div>`;

    // ── IPv4 prefix list
    if (v4prefs.length) {
      html += `
        <div class="card" style="margin-bottom:14px;">
          <div class="card-hdr">📦 Announced IPv4 Prefixes (${v4prefs.length})</div>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:6px;max-height:280px;overflow-y:auto;padding-right:4px;">
            ${v4prefs.map(p => `
              <div style="background:var(--bg3);border-radius:6px;padding:7px 10px;border:1px solid var(--border);cursor:pointer;"
                onclick="asnLookupIP('${p.prefix.split('/')[0]}')">
                <div style="font-family:var(--mono);font-size:11px;color:var(--cyan);">${p.prefix}</div>
                ${p.inetnum ? `<div style="font-size:9px;color:var(--muted);margin-top:2px;">${p.inetnum}</div>` : ''}
              </div>`).join('')}
          </div>
          <div style="font-size:10px;color:var(--muted);margin-top:8px;font-family:var(--mono);">Click any prefix to look it up</div>
        </div>`;
    }

    // ── IPv6 prefix list
    if (v6prefs.length) {
      html += `
        <div class="card" style="margin-bottom:14px;">
          <div class="card-hdr">🌐 Announced IPv6 Prefixes (${v6prefs.length})</div>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:6px;max-height:200px;overflow-y:auto;">
            ${v6prefs.slice(0, 40).map(p => `
              <div style="background:var(--bg3);border-radius:6px;padding:7px 10px;border:1px solid var(--border);">
                <div style="font-family:var(--mono);font-size:10px;color:var(--purple);">${p.prefix}</div>
              </div>`).join('')}
            ${v6prefs.length > 40 ? `<div style="padding:8px;color:var(--muted);font-family:var(--mono);font-size:11px;">…and ${v6prefs.length - 40} more</div>` : ''}
          </div>
        </div>`;
    }

    // ── Quick actions
    html += `
        <div class="card">
          <div class="card-hdr">🔗 External Resources</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            ${[
              [`https://bgp.he.net/AS${asn}`,                     'Hurricane Electric'],
              [`https://www.peeringdb.com/asn/${asn}`,             'PeeringDB'],
              [`https://stat.ripe.net/S${asn}`,                    'RIPE Stat'],
              [`https://bgpview.io/asn/${asn}`,                    'BGPView'],
              [`https://radar.cloudflare.com/as${asn}`,            'Cloudflare Radar'],
            ].map(([url, label]) => `
              <a href="${url}" target="_blank" rel="noopener"
                style="background:var(--bg3);border:1px solid var(--border);color:var(--blue);padding:7px 13px;border-radius:7px;font-family:var(--mono);font-size:11px;text-decoration:none;">
                ↗ ${label}
              </a>`).join('')}
          </div>
        </div>
      </div>`;

    el.innerHTML = html;
  }

  // ── Render IP→ASN result
  function renderIPResult(data, ip) {
    const el = document.getElementById('asn-output');
    if (!el) return;

    const asns    = data.asns || [];
    const prefix  = data.block?.resource || data.resource || ip;
    const holder  = data.holder || (asns[0] ? WELL_KNOWN[asns[0]] : null) || '—';
    const country = data.block?.country || '—';

    let html = `
      <div style="margin-top:14px;">
        <div style="background:var(--bg2);border-radius:12px;padding:18px;border:1px solid var(--border);margin-bottom:14px;">
          <div style="font-family:var(--mono);font-size:10px;color:var(--muted);margin-bottom:4px;">IP ADDRESS LOOKUP</div>
          <div style="font-family:var(--mono);font-size:24px;font-weight:700;color:var(--text);margin-bottom:8px;">${ip}</div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;">
            ${[
              ['Prefix / Block', prefix,                        'var(--cyan)'],
              ['Originating ASN', asns.map(a=>`AS${a}`).join(', ') || '—', 'var(--green)'],
              ['Holder',         holder,                       'var(--text)'],
              ['Country',        country.toUpperCase(),        'var(--blue)'],
            ].map(([k,v,c]) => `
              <div style="background:var(--bg3);border-radius:8px;padding:10px;border:1px solid var(--border);">
                <div style="font-family:var(--mono);font-size:9px;color:var(--muted);margin-bottom:4px;">${k.toUpperCase()}</div>
                <div style="font-family:var(--mono);font-size:13px;font-weight:600;color:${c};word-break:break-all;">${v}</div>
              </div>`).join('')}
          </div>
          ${asns.length ? `
            <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;">
              ${asns.map(a => `<button onclick="asnLookup('${a}')"
                style="background:rgba(74,222,128,0.1);border:1px solid rgba(74,222,128,0.3);color:var(--green);padding:7px 14px;border-radius:7px;font-family:var(--mono);font-size:12px;cursor:pointer;">
                🔍 Look up AS${a}
              </button>`).join('')}
            </div>` : ''}
        </div>
      </div>`;
    el.innerHTML = html;
  }

  // ── Public lookup functions
  window.asnLookup = async function (asnInput) {
    const inp = document.getElementById('asn-input');
    const raw = asnInput !== undefined ? String(asnInput) : (inp ? inp.value : '');
    if (!raw.trim()) return;
    if (inp && asnInput !== undefined) inp.value = 'AS' + asnInput;

    // IP address lookup
    if (isIPv4(raw)) {
      setLoading(`Looking up ${raw.trim()} in routing table…`);
      try {
        const data = await ripeGet('prefix-overview', { resource: raw.trim() });
        renderIPResult(data, raw.trim());
      } catch (e) {
        setError(`Lookup failed: ${e.message}. Check your connection — data comes from RIPE Stat.`);
      }
      return;
    }

    // ASN lookup
    const asn = asnFromInput(raw);
    if (!asn) { setError('Invalid input. Enter an ASN (e.g. <code>AS15169</code> or <code>15169</code>) or an IPv4 address.'); return; }

    setLoading(`Querying RIPE Stat for AS${asn}…`);
    try {
      const [overview, prefixes, routing] = await Promise.all([
        ripeGet('as-overview',          { resource: `AS${asn}` }),
        ripeGet('announced-prefixes',   { resource: `AS${asn}` }),
        ripeGet('routing-status',       { resource: `AS${asn}` }).catch(() => null),
      ]);
      renderASN(overview, prefixes, routing);
    } catch (e) {
      setError(`Lookup failed: ${e.message}. Check your connection — data comes from RIPE Stat NCC.`);
    }
  };

  window.asnLookupIP = function (ip) {
    const inp = document.getElementById('asn-input');
    if (inp) inp.value = ip;
    window.asnLookup(ip);
  };

  window.asnKeydown = function (e) {
    if (e.key === 'Enter') window.asnLookup();
  };

  window.asnLoadExample = function (val) {
    const inp = document.getElementById('asn-input');
    if (inp) inp.value = val;
    window.asnLookup(val);
  };

  // ── INIT
  function asnInit() {
    const page = document.getElementById('page-bgp-asn');
    if (!page) return;

    const quickASNs = [
      ['15169', 'Google'],['8075', 'Microsoft'],['16509', 'AWS'],
      ['13335', 'Cloudflare'],['20940', 'Akamai'],['2914', 'NTT'],
      ['3356', 'Lumen'],['6939', 'HE.net'],
    ];

    const quickIPs = [
      ['8.8.8.8', 'Google DNS'],['1.1.1.1', 'Cloudflare'],
      ['208.67.222.222', 'OpenDNS'],['9.9.9.9', 'Quad9'],
    ];

    page.innerHTML = `
<div class="page-hdr">
  <div class="page-title">🔍 BGP ASN Lookup</div>
  <div class="page-sub">Look up ASN details, announced IPv4/IPv6 prefixes, and routing status via RIPE Stat. Also resolves any IPv4 address to its originating ASN. Live data — requires internet access.</div>
</div>

<div class="card">
  <div class="card-hdr">🔎 Search</div>
  <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px;">
    <input id="asn-input" type="text" autocomplete="off" spellcheck="false"
      placeholder="ASN (e.g. AS15169  or  15169)  ·  IPv4 address (e.g. 8.8.8.8)"
      onkeydown="asnKeydown(event)"
      style="flex:1;min-width:220px;background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:10px 14px;border-radius:8px;font-family:var(--mono);font-size:13px;outline:none;">
    <button onclick="asnLookup()" class="btn btn-primary" style="padding:10px 24px;">🔍 Lookup</button>
  </div>

  <div style="margin-bottom:6px;">
    <span style="font-family:var(--mono);font-size:9px;color:var(--muted);letter-spacing:1px;">QUICK — WELL-KNOWN ASNs</span>
  </div>
  <div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:12px;">
    ${quickASNs.map(([asn, name]) => `
      <button onclick="asnLoadExample('${asn}')"
        style="background:var(--bg3);border:1px solid var(--border);color:var(--cyan);padding:5px 12px;border-radius:7px;font-family:var(--mono);font-size:11px;cursor:pointer;">
        AS${asn} <span style="color:var(--muted);font-size:10px;">${name}</span>
      </button>`).join('')}
  </div>

  <div style="margin-bottom:6px;">
    <span style="font-family:var(--mono);font-size:9px;color:var(--muted);letter-spacing:1px;">QUICK — IP ADDRESS LOOKUP</span>
  </div>
  <div style="display:flex;flex-wrap:wrap;gap:5px;">
    ${quickIPs.map(([ip, name]) => `
      <button onclick="asnLoadExample('${ip}')"
        style="background:var(--bg3);border:1px solid var(--border);color:var(--amber);padding:5px 12px;border-radius:7px;font-family:var(--mono);font-size:11px;cursor:pointer;">
        ${ip} <span style="color:var(--muted);font-size:10px;">${name}</span>
      </button>`).join('')}
  </div>
</div>

<div id="asn-output">
  <div style="margin-top:14px;padding:24px;text-align:center;background:var(--bg2);border-radius:10px;border:1px dashed var(--border);">
    <div style="font-size:24px;margin-bottom:8px;">🔍</div>
    <div style="font-family:var(--mono);font-size:12px;color:var(--muted);">Enter an ASN or IP address above to look it up</div>
    <div style="font-family:var(--mono);font-size:11px;color:var(--muted);margin-top:4px;">Data source: RIPE NCC Stat API (free, no auth required)</div>
  </div>
</div>

<div class="card" style="margin-top:14px;">
  <div class="card-hdr">📚 BGP ASN Quick Reference</div>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:8px;font-size:11px;color:var(--muted2);">
    <div style="background:var(--bg3);border-radius:8px;padding:12px;">
      <div style="font-family:var(--mono);font-size:9px;font-weight:700;color:var(--cyan);margin-bottom:6px;">ASN RANGES</div>
      0–65535: 16-bit (original RFC 1771)<br>
      64512–65534: Private 16-bit (RFC 6996)<br>
      65535: Reserved<br>
      65536–4294967295: 32-bit (RFC 6793)<br>
      4200000000–4294967294: Private 32-bit
    </div>
    <div style="background:var(--bg3);border-radius:8px;padding:12px;">
      <div style="font-family:var(--mono);font-size:9px;font-weight:700;color:var(--amber);margin-bottom:6px;">REGISTRIES</div>
      ARIN: North America<br>
      RIPE NCC: Europe / Middle East / CIS<br>
      APNIC: Asia-Pacific<br>
      LACNIC: Latin America & Caribbean<br>
      AFRINIC: Africa
    </div>
    <div style="background:var(--bg3);border-radius:8px;padding:12px;">
      <div style="font-family:var(--mono);font-size:9px;font-weight:700;color:var(--green);margin-bottom:6px;">CISCO BGP COMMANDS</div>
      <code style="font-family:var(--mono);font-size:10px;line-height:1.9;">
        show bgp summary<br>
        show bgp neighbors<br>
        show bgp ipv4 unicast<br>
        show bgp ipv4 unicast regexp _15169_<br>
        show bgp ipv4 unicast community
      </code>
    </div>
    <div style="background:var(--bg3);border-radius:8px;padding:12px;">
      <div style="font-family:var(--mono);font-size:9px;font-weight:700;color:var(--purple);margin-bottom:6px;">JUNOS BGP COMMANDS</div>
      <code style="font-family:var(--mono);font-size:10px;line-height:1.9;">
        show bgp summary<br>
        show route protocol bgp aspath-regex .*15169.*<br>
        show bgp neighbor 1.2.3.4<br>
        show route receive-protocol bgp 1.2.3.4
      </code>
    </div>
  </div>
</div>`;
  }

  document.addEventListener('DOMContentLoaded', asnInit);
})();
