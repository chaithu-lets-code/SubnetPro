// ═══════════════════════════════════════════════════
// MAC ADDRESS CONVERTER — mac.js  (SubnetLab Pro)
// Converts between all 4 MAC address formats with
// uppercase/lowercase toggle, OUI vendor lookup,
// IEEE 802 bit analysis, and random MAC generator.
// ═══════════════════════════════════════════════════

(function () {
    'use strict';
  
    let macCase = 'upper';
    let macCurrentBytes = null; // last successfully parsed byte array
  
    // ─────────────────────────────────────────────────
    // PARSING  — auto-detect format from raw input
    // ─────────────────────────────────────────────────
    function macParse(raw) {
      const s = raw.trim().replace(/\s+/g, '');
  
      // Colon: AA:BB:CC:DD:EE:FF
      if (/^([0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}$/.test(s))
        return { bytes: s.split(':'), detected: 'Colon  ·  EUI-48 Standard' };
  
      // Hyphen: AA-BB-CC-DD-EE-FF
      if (/^([0-9a-fA-F]{2}-){5}[0-9a-fA-F]{2}$/.test(s))
        return { bytes: s.split('-'), detected: 'Hyphen  ·  Windows / Microsoft' };
  
      // Cisco dot: AABB.CCDD.EEFF
      if (/^[0-9a-fA-F]{4}\.[0-9a-fA-F]{4}\.[0-9a-fA-F]{4}$/.test(s)) {
        const g = s.split('.');
        const bytes = [];
        g.forEach(p => bytes.push(p.slice(0, 2), p.slice(2, 4)));
        return { bytes, detected: 'Cisco Dot  ·  IOS / NX-OS' };
      }
  
      // Plain 12 hex: AABBCCDDEEFF
      if (/^[0-9a-fA-F]{12}$/.test(s)) {
        const bytes = [];
        for (let i = 0; i < 12; i += 2) bytes.push(s.slice(i, i + 2));
        return { bytes, detected: 'Plain  ·  No Separator' };
      }
  
      return null;
    }
  
    // ─────────────────────────────────────────────────
    // FORMAT BUILDER  — apply case and produce all 4
    // ─────────────────────────────────────────────────
    function macBuild(bytes) {
      const b = bytes.map(x => macCase === 'upper' ? x.toUpperCase() : x.toLowerCase());
      return {
        colon:  b.join(':'),
        hyphen: b.join('-'),
        cisco:  b[0] + b[1] + '.' + b[2] + b[3] + '.' + b[4] + b[5],
        plain:  b.join(''),
      };
    }
  
    // ─────────────────────────────────────────────────
    // OUI LOOKUP — common networking hardware vendors
    // ─────────────────────────────────────────────────
    const OUI = {
      '00:00:0C': 'Cisco Systems',       '00:E0:4F': 'Cisco Systems',
      'FC:FB:FB': 'Cisco Systems',       'A4:4C:11': 'Cisco Systems',
      'B4:A4:E3': 'Cisco Systems',       '00:1A:A1': 'Cisco Systems',
      '88:F0:77': 'Cisco Meraki',        'DC:A6:32': 'Cisco Meraki',
      '00:50:56': 'VMware',              '00:0C:29': 'VMware',
      '00:5E:1B': 'VMware',              '08:00:27': 'VirtualBox (Oracle)',
      '52:54:00': 'QEMU / KVM',          '00:15:5D': 'Microsoft Hyper-V',
      '00:03:FF': 'Microsoft Corp.',     '3C:D9:2B': 'HP Inc.',
      '00:25:B3': 'HP Inc.',             '3C:A8:2A': 'HP Inc.',
      'B4:99:BA': 'Dell Inc.',           '14:FE:B5': 'Dell Inc.',
      '00:14:22': 'Dell Inc.',           '00:26:B9': 'Dell Inc.',
      'F0:1F:AF': 'Juniper Networks',    '00:10:DB': 'Juniper Networks',
      'DC:38:E1': 'Juniper Networks',    '78:19:F7': 'Juniper Networks',
      '00:1B:17': 'Palo Alto Networks',  '00:D0:D3': 'Fortinet',
      'A8:57:4E': 'Aruba / HPE',         '94:B4:0F': 'Aruba / HPE',
      'F4:CE:46': 'Arista Networks',     '74:83:EF': 'Arista Networks',
      '00:1C:73': 'Arista Networks',     '04:01:05': 'Ubiquiti',
      '78:8A:20': 'Ubiquiti',            '24:A4:3C': 'Ubiquiti',
      'E8:65:D4': 'Intel Corp.',         '8C:8D:28': 'Intel Corp.',
      'F4:4D:30': 'Intel Corp.',         'AC:CF:85': 'Apple Inc.',
      '00:17:F2': 'Apple Inc.',          'F0:18:98': 'Apple Inc.',
    };
  
    function ouiLookup(bytes) {
      const key = bytes.slice(0, 3).map(b => b.toUpperCase()).join(':');
      return OUI[key] || null;
    }
  
    // ─────────────────────────────────────────────────
    // RENDER  — called on every keystroke
    // ─────────────────────────────────────────────────
    function macRender() {
      const input   = document.getElementById('mac-input');
      if (!input) return;
      const val     = input.value;
      const detectEl = document.getElementById('mac-detect');
      const ouiEl    = document.getElementById('mac-oui');
      const outEl    = document.getElementById('mac-outputs');
      const bitsEl   = document.getElementById('mac-bits');
  
      // ── Empty state
      if (!val.trim()) {
        macCurrentBytes = null;
        if (detectEl) detectEl.innerHTML = '';
        if (ouiEl)    ouiEl.innerHTML = '';
        if (outEl)    outEl.innerHTML = `<div style="color:var(--muted);font-family:var(--mono);font-size:12px;text-align:center;padding:28px 0;">Enter any MAC address format above to convert…</div>`;
        if (bitsEl)   bitsEl.innerHTML = `<div style="color:var(--muted);font-family:var(--mono);font-size:11px;">Enter a MAC address to see IEEE 802 bit analysis…</div>`;
        return;
      }
  
      const parsed = macParse(val);
  
      // ── Invalid
      if (!parsed) {
        macCurrentBytes = null;
        if (detectEl) detectEl.innerHTML = `<span class="step-tag" style="background:rgba(248,113,113,0.12);color:var(--red)">⚠ Unrecognised format</span>`;
        if (ouiEl)    ouiEl.innerHTML = '';
        if (outEl)    outEl.innerHTML = `<div style="color:var(--red);font-family:var(--mono);font-size:12px;padding:12px 0;">Not a valid MAC address. Accepted formats: <br>AA:BB:CC:DD:EE:FF  ·  AA-BB-CC-DD-EE-FF  ·  AABB.CCDD.EEFF  ·  AABBCCDDEEFF</div>`;
        if (bitsEl)   bitsEl.innerHTML = '';
        return;
      }
  
      const { bytes, detected } = parsed;
      macCurrentBytes = bytes;
      const fmt    = macBuild(bytes);
      const vendor = ouiLookup(bytes);
      const ouiHex = bytes.slice(0, 3).map(b => b.toUpperCase()).join(':');
  
      // ── Detected badge
      if (detectEl) detectEl.innerHTML = `<span class="step-tag" style="background:rgba(74,222,128,0.12);color:var(--green)">✓ Detected: ${detected}</span>`;
  
      // ── OUI / Vendor banner
      if (ouiEl) {
        ouiEl.innerHTML = `
          <div style="display:flex;align-items:center;gap:12px;padding:10px 14px;background:var(--bg3);border-radius:8px;margin-bottom:14px;">
            <span style="font-size:20px;">🏭</span>
            <div style="flex:1;min-width:0;">
              <div style="font-size:10px;color:var(--muted);font-family:var(--mono);margin-bottom:2px;">OUI VENDOR  ·  ${ouiHex}</div>
              <div style="font-weight:600;font-size:13px;color:${vendor ? 'var(--cyan)' : 'var(--muted2)'};">${vendor || 'Unknown — not in local OUI database'}</div>
            </div>
          </div>`;
      }
  
      // ── 4 output format rows
      const rows = [
        { label: 'Colon  (EUI-48 / Linux / Wireshark)', icon: '🐧', val: fmt.colon,  key: 'colon',  color: 'var(--blue)',   desc: 'Linux · macOS · Wireshark · ARP tables · RFC standard' },
        { label: 'Hyphen  (Windows / Microsoft)',        icon: '🪟', val: fmt.hyphen, key: 'hyphen', color: 'var(--cyan)',   desc: 'ipconfig /all · arp -a · SNMP MIBs · Active Directory' },
        { label: 'Cisco Dot  (IOS / NX-OS / ASA)',       icon: '🔀', val: fmt.cisco,  key: 'cisco',  color: 'var(--amber)',  desc: 'show mac address-table · CDP · EIGRP · STP BPDUs' },
        { label: 'Plain  (No separator)',                icon: '📄', val: fmt.plain,  key: 'plain',  color: 'var(--purple)', desc: 'Database storage · REST APIs · grep filtering · OUI lookups' },
      ];
  
      if (outEl) {
        outEl.innerHTML = rows.map(r => `
          <div style="display:flex;align-items:center;gap:14px;padding:12px 14px;background:var(--bg3);border-radius:10px;border-left:3px solid ${r.color};">
            <span style="font-size:18px;flex-shrink:0;">${r.icon}</span>
            <div style="flex:1;min-width:0;overflow:hidden;">
              <div style="font-size:10px;color:var(--muted);font-family:var(--mono);margin-bottom:3px;">${r.label}</div>
              <div style="font-family:var(--mono);font-size:17px;font-weight:600;color:${r.color};letter-spacing:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${r.val}</div>
              <div style="font-size:10px;color:var(--muted);margin-top:2px;">${r.desc}</div>
            </div>
            <button id="mac-btn-${r.key}" onclick="macCopyFmt('${r.key}')"
              style="flex-shrink:0;background:var(--bg2);border:1px solid var(--border);color:var(--text);padding:6px 13px;border-radius:7px;font-size:11px;font-family:var(--mono);cursor:pointer;">
              📋 Copy
            </button>
          </div>`).join('');
      }
  
      // ── IEEE 802 bit analysis
      if (bitsEl) {
        const b0         = parseInt(bytes[0], 16);
        const isMulticast = (b0 & 1) === 1;
        const isLocal     = (b0 & 2) === 2;
        const isBcast     = bytes.every(b => parseInt(b, 16) === 0xFF);
        bitsEl.innerHTML = `
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
            <div style="background:var(--bg3);border-radius:8px;padding:12px;">
              <div style="font-family:var(--mono);font-size:9px;font-weight:700;color:var(--amber);margin-bottom:8px;">BYTE 1 — 0x${bytes[0].toUpperCase()}  (8 bits)</div>
              <div style="font-family:var(--mono);font-size:14px;color:var(--text);letter-spacing:3px;margin-bottom:8px;">${b0.toString(2).padStart(8, '0')}</div>
              <div style="font-size:11px;color:var(--muted2);line-height:1.9;">
                Bit 0 (I/G): <strong style="color:${isMulticast ? 'var(--amber)' : 'var(--green)'}">${isMulticast ? '1 — Group / Multicast' : '0 — Individual / Unicast'}</strong><br>
                Bit 1 (U/L): <strong style="color:${isLocal ? 'var(--cyan)' : 'var(--green)'}">${isLocal ? '1 — Locally Administered' : '0 — Universally Administered'}</strong>
              </div>
            </div>
            <div style="background:var(--bg3);border-radius:8px;padding:12px;">
              <div style="font-family:var(--mono);font-size:9px;font-weight:700;color:var(--cyan);margin-bottom:8px;">ADDRESS CLASSIFICATION</div>
              <div style="font-size:12px;color:var(--muted2);line-height:2.2;">
                <span style="color:${isBcast ? 'var(--red)' : isMulticast ? 'var(--amber)' : 'var(--green)'}">
                  ${isBcast ? '🔴 Broadcast  (FF:FF:FF:FF:FF:FF)' : isMulticast ? '🟡 Multicast  (I/G bit = 1)' : '🟢 Unicast  (I/G bit = 0)'}
                </span><br>
                <span style="color:${isLocal ? 'var(--cyan)' : 'var(--green)'}">
                  ${isLocal ? '🔵 Locally Administered  (LAA / U/L bit = 1)' : '🟢 Universally Administered  (burned-in OUI)'}
                </span>
              </div>
            </div>
          </div>
          <div style="margin-top:10px;font-family:var(--mono);font-size:10px;color:var(--muted);line-height:1.8;padding:8px 12px;background:var(--bg3);border-radius:8px;">
            <span style="color:var(--amber)">I/G bit:</span> Odd first byte → multicast/broadcast (e.g. 01:00:5E:xx:xx:xx = IPv4 multicast, 33:33:xx… = IPv6 multicast) &nbsp;|&nbsp;
            <span style="color:var(--cyan)">U/L bit:</span> LAA used by VMs, VRRP, docker0, and manually assigned MACs (VMware 00:50:56, HSRP 00:00:0C:07:AC:xx)
          </div>`;
      }
    }
  
    // ─────────────────────────────────────────────────
    // COPY — reads from macCurrentBytes, no inline args
    // ─────────────────────────────────────────────────
    window.macCopyFmt = function (key) {
      if (!macCurrentBytes) return;
      const text = macBuild(macCurrentBytes)[key];
      if (!text) return;
      navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById('mac-btn-' + key);
        if (btn) {
          const orig = btn.innerHTML;
          btn.innerHTML = '✓ Copied!';
          btn.style.color = 'var(--green)';
          setTimeout(() => { btn.innerHTML = orig; btn.style.color = ''; }, 1500);
        }
      });
    };
  
    // ─────────────────────────────────────────────────
    // CONTROLS
    // ─────────────────────────────────────────────────
    window.macSetCase = function (c) {
      macCase = c;
      ['upper', 'lower'].forEach(x => {
        const el = document.getElementById('mac-case-' + x);
        if (el) el.classList.toggle('active', x === c);
      });
      macRender();
    };
  
    window.macClear = function () {
      const el = document.getElementById('mac-input');
      if (el) { el.value = ''; el.focus(); macRender(); }
    };
  
    // Random locally-administered unicast MAC (useful for test scenarios)
    window.macRandom = function () {
      const b = Array.from({ length: 6 }, () => Math.floor(Math.random() * 256));
      b[0] = (b[0] & 0xFE) | 0x02; // clear I/G (unicast), set U/L (locally administered)
      const hex = b.map(x => x.toString(16).padStart(2, '0'));
      const el = document.getElementById('mac-input');
      if (el) { el.value = hex.join(':'); macRender(); }
    };
  
    // ─────────────────────────────────────────────────
    // INIT — inject page HTML then wire event
    // ─────────────────────────────────────────────────
    function macInit() {
      const page = document.getElementById('page-mac');
      if (!page) return;
  
      page.innerHTML = `
  <div class="page-hdr">
    <div class="page-title">🔢 MAC Address Converter</div>
    <div class="page-sub">Convert between all MAC address formats instantly — colon (EUI-48), hyphen, Cisco dot notation, and plain hex. Includes OUI vendor lookup and IEEE 802 bit analysis.</div>
  </div>
  
  <div class="card">
    <div class="card-hdr">🔡 Input — Paste Any Format</div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:10px;">
      <input type="text" id="mac-input" autocomplete="off" autocorrect="off" spellcheck="false"
        placeholder="AA:BB:CC:DD:EE:FF  ·  AA-BB-CC-DD-EE-FF  ·  AABB.CCDD.EEFF  ·  AABBCCDDEEFF"
        style="flex:1;min-width:200px;background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:10px 14px;border-radius:8px;font-family:var(--mono);font-size:13px;outline:none;">
      <button onclick="macRandom()"
        style="background:var(--bg3);border:1px solid var(--border);color:var(--muted2);padding:10px 14px;border-radius:8px;cursor:pointer;font-size:12px;font-family:var(--mono);white-space:nowrap;"
        title="Insert a random locally-administered unicast MAC">🎲 Random</button>
      <button onclick="macClear()"
        style="background:var(--bg3);border:1px solid var(--border);color:var(--muted2);padding:10px 14px;border-radius:8px;cursor:pointer;font-size:12px;font-family:var(--mono);">✕ Clear</button>
    </div>
    <div id="mac-detect" style="min-height:28px;margin-bottom:10px;"></div>
    <div class="speed-group" style="margin-bottom:0;">
      <span class="speed-label">Case:</span>
      <button class="speed-btn active" id="mac-case-upper" onclick="macSetCase('upper')">ABC Uppercase</button>
      <button class="speed-btn"        id="mac-case-lower" onclick="macSetCase('lower')">abc Lowercase</button>
    </div>
  </div>
  
  <div class="card" style="margin-top:14px;">
    <div class="card-hdr">🔄 All Formats</div>
    <div id="mac-oui"></div>
    <div id="mac-outputs" style="display:flex;flex-direction:column;gap:10px;">
      <div style="color:var(--muted);font-family:var(--mono);font-size:12px;text-align:center;padding:28px 0;">Enter any MAC address above to convert it…</div>
    </div>
  </div>
  
  <div class="card" style="margin-top:14px;">
    <div class="card-hdr">🔬 IEEE 802 Bit Analysis</div>
    <div id="mac-bits" style="color:var(--muted);font-family:var(--mono);font-size:11px;">Enter a MAC address to see bit-level analysis…</div>
  </div>
  
  <div class="card" style="margin-top:14px;">
    <div class="card-hdr">📚 Format Reference</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;">
      <div style="background:var(--bg3);border-radius:8px;padding:12px;border-left:3px solid var(--blue);">
        <div style="font-family:var(--mono);font-size:9px;font-weight:700;color:var(--blue);margin-bottom:6px;">COLON — AA:BB:CC:DD:EE:FF</div>
        <div style="font-size:11px;color:var(--muted2);">IEEE EUI-48 standard. Linux, macOS, Wireshark, ARP/NDP tables, DHCP bindings, and most protocol documentation.</div>
        <div style="font-family:var(--mono);font-size:10px;color:var(--muted);margin-top:6px;">ip neigh  ·  arp -n  ·  eth.addr == …</div>
      </div>
      <div style="background:var(--bg3);border-radius:8px;padding:12px;border-left:3px solid var(--cyan);">
        <div style="font-family:var(--mono);font-size:9px;font-weight:700;color:var(--cyan);margin-bottom:6px;">HYPHEN — AA-BB-CC-DD-EE-FF</div>
        <div style="font-size:11px;color:var(--muted2);">Windows default. ipconfig /all, arp -a, Microsoft AD, SNMP MIBs, and some older HP/IBM vendor configs.</div>
        <div style="font-family:var(--mono);font-size:10px;color:var(--muted);margin-top:6px;">ipconfig /all  ·  arp -a  ·  SNMP</div>
      </div>
      <div style="background:var(--bg3);border-radius:8px;padding:12px;border-left:3px solid var(--amber);">
        <div style="font-family:var(--mono);font-size:9px;font-weight:700;color:var(--amber);margin-bottom:6px;">CISCO DOT — AABB.CCDD.EEFF</div>
        <div style="font-size:11px;color:var(--muted2);">Cisco IOS, NX-OS, ASA. Groups bytes in pairs of 4. Appears in show mac address-table, STP, CDP, and EIGRP.</div>
        <div style="font-family:var(--mono);font-size:10px;color:var(--muted);margin-top:6px;">show mac address-table  ·  show cdp</div>
      </div>
      <div style="background:var(--bg3);border-radius:8px;padding:12px;border-left:3px solid var(--purple);">
        <div style="font-family:var(--mono);font-size:9px;font-weight:700;color:var(--purple);margin-bottom:6px;">PLAIN — AABBCCDDEEFF</div>
        <div style="font-size:11px;color:var(--muted2);">No separator. Database storage, REST API payloads, grep/regex filtering, and programmatic OUI lookups.</div>
        <div style="font-family:var(--mono);font-size:10px;color:var(--muted);margin-top:6px;">grep -i "aabbcc" syslog  ·  REST APIs</div>
      </div>
    </div>
    <div style="margin-top:10px;font-family:var(--mono);font-size:10px;color:var(--muted);line-height:1.9;border-top:1px solid var(--border);padding-top:8px;">
      <span style="color:var(--amber)">Wireshark filter:</span> eth.addr == aa:bb:cc:dd:ee:ff  ·  eth.src contains aa:bb  &nbsp;|&nbsp;
      <span style="color:var(--blue)">Cisco:</span> show mac address-table address AABB.CCDD.EEFF  &nbsp;|&nbsp;
      <span style="color:var(--cyan)">Linux:</span> ip link show  ·  cat /sys/class/net/eth0/address
    </div>
  </div>`;
  
      const inp = document.getElementById('mac-input');
      if (inp) inp.addEventListener('input', macRender);
    }
  
    document.addEventListener('DOMContentLoaded', macInit);
  
  })();