// ═══════════════════════════════════════════════════════════════════════
// VPN KEY GENERATOR — vpn.js  (SubnetLab Pro) — Enhanced Edition v2
// WireGuard Curve25519 (X25519) · PSK · Config Builder · CIDR · QR ·
// Validator · Hex↔B64 · Peer Pairing · History · Auto-Blur · Download
// Pure browser-side BigInt (RFC 7748) — zero external requests for keys.
// ═══════════════════════════════════════════════════════════════════════
(function () {
  'use strict';

  // ──────────────────────────────────────────────────────────────
  // GLOBAL STATE
  // ──────────────────────────────────────────────────────────────
  const S = {
    priv: '', pub: '', psk: '',
    privVisible: false,
    privFp: '', pubFp: '',
    generatedAt: null,
    history: [],           // max 10 entries [{priv,pub,psk,ts}]
    inactivityTimer: null,
    activeTab: 'generate',
    peerCounter: 0,
    cfg: {
      mode: 'server',
      address: '10.0.0.1/24',
      listenPort: '51820',
      dns: '1.1.1.1',
      mtu: '',
      peers: []
    }
  };

  // ──────────────────────────────────────────────────────────────
  // CURVE25519 — RFC 7748 X25519 scalar multiplication
  // ──────────────────────────────────────────────────────────────
  function curve25519(privateBytes) {
    const p   = (1n << 255n) - 19n;
    const a24 = 121665n;
    const mod = n => ((n % p) + p) % p;
    const add = (a, b) => mod(a + b);
    const sub = (a, b) => mod(a - b);
    const mul = (a, b) => mod(a * b);
    const sq  = a => mul(a, a);
    function mpow(base, exp) {
      let r = 1n, b = mod(base);
      for (let e = exp; e > 0n; e >>= 1n) {
        if (e & 1n) r = mul(r, b);
        b = mul(b, b);
      }
      return r;
    }
    const inv = x => mpow(x, p - 2n);
    const k = new Uint8Array(privateBytes);
    k[0] &= 248; k[31] &= 127; k[31] |= 64;
    let scalar = 0n;
    for (let i = 0; i < 32; i++) scalar |= BigInt(k[i]) << BigInt(8 * i);
    const u = 9n, x1 = u;
    let x2 = 1n, z2 = 0n, x3 = u, z3 = 1n, swap = 0n;
    for (let t = 254; t >= 0; t--) {
      const kt = (scalar >> BigInt(t)) & 1n;
      swap ^= kt;
      if (swap) { [x2, x3] = [x3, x2]; [z2, z3] = [z3, z2]; }
      swap = kt;
      const A = add(x2, z2), AA = sq(A), B = sub(x2, z2), BB = sq(B);
      const E = sub(AA, BB), C = add(x3, z3), D = sub(x3, z3);
      const DA = mul(D, A), CB = mul(C, B);
      x3 = sq(add(DA, CB));
      z3 = mul(x1, sq(sub(DA, CB)));
      x2 = mul(AA, BB);
      z2 = mul(E, add(AA, mul(a24, E)));
    }
    if (swap) { [x2, x3] = [x3, x2]; [z2, z3] = [z3, z2]; }
    const result = mul(x2, inv(z2));
    const out = new Uint8Array(32);
    for (let i = 0; i < 32; i++) out[i] = Number((result >> BigInt(8 * i)) & 0xffn);
    return out;
  }

  // ──────────────────────────────────────────────────────────────
  // BASE64 / HEX HELPERS
  // ──────────────────────────────────────────────────────────────
  function bytesToBase64(bytes) {
    return btoa(String.fromCharCode(...bytes));
  }
  function base64ToBytes(b64) {
    try {
      const bin = atob(b64.trim());
      const out = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
      return out;
    } catch { return null; }
  }
  function bytesToHex(bytes) {
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  function hexToBytes(hex) {
    hex = hex.trim().replace(/\s/g, '');
    if (hex.length !== 64 || !/^[0-9a-fA-F]+$/.test(hex)) return null;
    const out = new Uint8Array(32);
    for (let i = 0; i < 32; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
    return out;
  }

  // ──────────────────────────────────────────────────────────────
  // SHA-256 FINGERPRINT (async — crypto.subtle)
  // ──────────────────────────────────────────────────────────────
  async function sha256Fp(b64) {
    const bytes = base64ToBytes(b64);
    if (!bytes) return '—';
    const buf = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(buf)).slice(0, 8)
      .map(b => b.toString(16).padStart(2, '0')).join(':');
  }

  // ──────────────────────────────────────────────────────────────
  // FLASH HELPER — momentary button feedback
  // ──────────────────────────────────────────────────────────────
  function flashBtn(id, label, color) {
    const btn = document.getElementById(id);
    if (!btn) return;
    const orig = btn.innerHTML, origColor = btn.style.color;
    btn.innerHTML = label;
    btn.style.color = color || 'var(--green)';
    setTimeout(() => { btn.innerHTML = orig; btn.style.color = origColor; }, 1600);
  }

  // ──────────────────────────────────────────────────────────────
  // INACTIVITY AUTO-BLUR (30s)
  // ──────────────────────────────────────────────────────────────
  function resetInactivityTimer() {
    if (S.inactivityTimer) clearTimeout(S.inactivityTimer);
    S.inactivityTimer = setTimeout(() => {
      if (S.privVisible) {
        S.privVisible = false;
        const disp = document.getElementById('vpn-priv-display');
        const eye  = document.getElementById('vpn-eye-btn');
        if (disp) disp.textContent = '••••••••••••••••••••••••••••••••••••••••••••';
        if (eye)  eye.textContent  = '👁 Show';
      }
      const pskVis = document.getElementById('vpn-psk-visible');
      if (pskVis && pskVis.dataset.visible === '1') {
        pskVis.dataset.visible = '0';
        const pd = document.getElementById('vpn-psk-display');
        const pb = document.getElementById('vpn-eye-psk-btn');
        if (pd && S.psk) pd.textContent = '••••••••••••••••••••••••••••••••••••••••••••';
        if (pb) pb.textContent = '👁 Show';
      }
    }, 30000);
  }

  // ──────────────────────────────────────────────────────────────
  // TAB SWITCHING
  // ──────────────────────────────────────────────────────────────
  window.vpnSwitchTab = function (tab) {
    S.activeTab = tab;
    ['generate', 'config', 'tools', 'history'].forEach(t => {
      const el  = document.getElementById('vpn-tab-' + t);
      const btn = document.getElementById('vpn-tabbar-' + t);
      if (el)  el.style.display    = t === tab ? 'block' : 'none';
      if (btn) {
        btn.style.color       = t === tab ? 'var(--green)' : 'var(--muted)';
        btn.style.borderBottom = t === tab ? '2px solid var(--green)' : '2px solid transparent';
      }
    });
    if (tab === 'history') vpnRenderHistory();
    if (tab === 'config')  { vpnRenderPeers(); vpnUpdateConfigPreview(); }
  };

  // ──────────────────────────────────────────────────────────────
  // KEY HISTORY
  // ──────────────────────────────────────────────────────────────
  function addToHistory(priv, pub, psk) {
    S.history.unshift({ priv, pub, psk: psk || '', ts: Date.now() });
    if (S.history.length > 10) S.history.pop();
  }

  function formatAge(ts) {
    const diff = Date.now() - ts;
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
    return Math.floor(diff / 3600000) + 'h ago';
  }

  function vpnRenderHistory() {
    const el = document.getElementById('vpn-history-list');
    if (!el) return;
    if (!S.history.length) {
      el.innerHTML = `<div style="color:var(--muted);font-size:12px;text-align:center;padding:24px;">No keys generated this session yet.</div>`;
      return;
    }
    el.innerHTML = S.history.map((entry, i) => `
      <div style="background:var(--bg3);border-radius:10px;padding:12px 14px;border:1px solid var(--border);margin-bottom:10px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:6px;">
          <div style="font-family:var(--mono);font-size:10px;font-weight:700;color:var(--cyan);">PAIR #${S.history.length - i}</div>
          <div style="font-family:var(--mono);font-size:10px;color:var(--muted);">${formatAge(entry.ts)}</div>
          <button onclick="vpnRestoreFromHistory(${i})" style="background:var(--bg2);border:1px solid var(--green);color:var(--green);padding:3px 10px;border-radius:6px;font-size:10px;font-family:var(--mono);cursor:pointer;">↺ Restore</button>
        </div>
        <div style="font-family:var(--mono);font-size:10px;color:var(--muted2);margin-bottom:3px;">PRIV: <span style="color:var(--amber);">${entry.priv.substring(0, 20)}…</span></div>
        <div style="font-family:var(--mono);font-size:10px;color:var(--muted2);">PUB:  <span style="color:var(--green);">${entry.pub.substring(0, 20)}…</span></div>
        ${entry.psk ? `<div style="font-family:var(--mono);font-size:10px;color:var(--muted2);margin-top:3px;">PSK:  <span style="color:var(--cyan);">${entry.psk.substring(0, 20)}…</span></div>` : ''}
      </div>
    `).join('');
  }

  window.vpnRestoreFromHistory = function (i) {
    const entry = S.history[i];
    if (!entry) return;
    S.priv = entry.priv;
    S.pub  = entry.pub;
    S.psk  = entry.psk || '';
    S.privVisible = false;
    S.generatedAt = entry.ts;
    vpnRenderKeys();
    if (S.psk) vpnRenderPsk();
    vpnUpdateConfigPreview();
    vpnSwitchTab('generate');
  };

  // ──────────────────────────────────────────────────────────────
  // GENERATE — new key pair from CSPRNG
  // ──────────────────────────────────────────────────────────────
  window.vpnGenerate = function () {
    const btn = document.getElementById('vpn-gen-btn');
    if (btn) { btn.disabled = true; btn.textContent = '⏳ Generating…'; }
    setTimeout(async () => {
      try {
        const privRaw = new Uint8Array(32);
        crypto.getRandomValues(privRaw);
        const pubRaw = curve25519(privRaw);
        privRaw[0] &= 248; privRaw[31] &= 127; privRaw[31] |= 64;
        S.priv = bytesToBase64(privRaw);
        S.pub  = bytesToBase64(pubRaw);
        S.privVisible = false;
        S.generatedAt = Date.now();
        // Async fingerprints
        [S.privFp, S.pubFp] = await Promise.all([sha256Fp(S.priv), sha256Fp(S.pub)]);
        vpnRenderKeys();
        addToHistory(S.priv, S.pub, S.psk);
        vpnUpdateConfigPreview();
        resetInactivityTimer();
      } catch (err) {
        vpnShowError('Key generation failed: ' + err.message);
      }
      if (btn) { btn.disabled = false; btn.textContent = '⚡ Generate New Key Pair'; }
    }, 20);
  };

  // ──────────────────────────────────────────────────────────────
  // DERIVE — compute public key from pasted private key
  // ──────────────────────────────────────────────────────────────
  window.vpnDerive = function () {
    const input = document.getElementById('vpn-priv-input');
    if (!input) return;
    const val = input.value.trim();
    if (!val) { vpnShowError('Please paste a base64-encoded WireGuard private key.'); return; }
    const bytes = base64ToBytes(val);
    if (!bytes || bytes.length !== 32) {
      vpnShowError('Invalid key — must be a 32-byte base64-encoded WireGuard private key (44 characters, e.g. output of <code>wg genkey</code>).');
      return;
    }
    try {
      S.priv = val;
      S.pub  = bytesToBase64(curve25519(bytes));
      S.privVisible = false;
      S.generatedAt = Date.now();
      sha256Fp(S.priv).then(fp => { S.privFp = fp; vpnRenderKeys(); });
      sha256Fp(S.pub).then(fp  => { S.pubFp  = fp; vpnRenderKeys(); });
      vpnRenderKeys();
      addToHistory(S.priv, S.pub, '');
      vpnUpdateConfigPreview();
      const errEl = document.getElementById('vpn-derive-error');
      if (errEl) errEl.innerHTML = '';
      resetInactivityTimer();
    } catch (err) { vpnShowError('Derivation error: ' + err.message); }
  };

  // Real-time format validation on derive input
  window.vpnValidatePrivInput = function (input) {
    const ind = document.getElementById('vpn-priv-input-indicator');
    if (!ind) return;
    const val = input.value.trim();
    if (!val) { ind.textContent = ''; return; }
    const bytes = base64ToBytes(val);
    if (bytes && bytes.length === 32) {
      ind.textContent = '✓ Valid'; ind.style.color = 'var(--green)';
    } else {
      ind.textContent = '✗ Invalid'; ind.style.color = 'var(--red)';
    }
  };

  // ──────────────────────────────────────────────────────────────
  // WIPE KEYS
  // ──────────────────────────────────────────────────────────────
  window.vpnWipeKeys = function () {
    if (!confirm('Wipe all current keys from memory and clear the display? This cannot be undone.')) return;
    S.priv = ''; S.pub = ''; S.psk = '';
    S.privFp = ''; S.pubFp = '';
    S.privVisible = false;
    S.generatedAt = null;
    const keysOut = document.getElementById('vpn-keys-out');
    if (keysOut) keysOut.innerHTML = `<div style="color:var(--muted);font-size:12px;text-align:center;padding:20px;font-family:var(--mono);">Keys wiped. Generate a new pair above.</div>`;
    const pd = document.getElementById('vpn-psk-display');
    if (pd) pd.textContent = 'Generate a PSK above.';
    vpnUpdateConfigPreview();
  };

  // ──────────────────────────────────────────────────────────────
  // RENDER key pair output panel
  // ──────────────────────────────────────────────────────────────
  function vpnRenderKeys() {
    const outEl = document.getElementById('vpn-keys-out');
    if (!outEl || !S.priv) return;
    const age = S.generatedAt ? formatAge(S.generatedAt) : '';
    outEl.innerHTML = `
      <div style="margin-top:14px;display:flex;flex-direction:column;gap:12px;">

        <!-- Private Key -->
        <div style="background:var(--bg3);border-radius:10px;padding:14px;border-left:3px solid var(--amber);">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:6px;">
            <div style="font-family:var(--mono);font-size:10px;font-weight:700;color:var(--amber);">🔒 PRIVATE KEY — Keep Absolutely Secret</div>
            <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">
              ${age ? `<div style="font-family:var(--mono);font-size:9px;color:var(--muted);">${age}</div>` : ''}
              <button id="vpn-eye-btn" onclick="vpnTogglePriv()" style="background:var(--bg2);border:1px solid var(--border);color:var(--muted2);padding:4px 11px;border-radius:6px;font-size:11px;cursor:pointer;">👁 Show</button>
              <button id="vpn-copy-priv-btn" onclick="vpnCopyPriv()" style="background:var(--bg2);border:1px solid var(--border);color:var(--text);padding:4px 11px;border-radius:6px;font-size:11px;font-family:var(--mono);cursor:pointer;">📋 Copy</button>
            </div>
          </div>
          <div id="vpn-priv-display" style="font-family:var(--mono);font-size:13px;color:var(--amber);word-break:break-all;letter-spacing:0.5px;">••••••••••••••••••••••••••••••••••••••••••••</div>
          ${S.privFp ? `<div style="font-family:var(--mono);font-size:9px;color:var(--muted);margin-top:6px;">SHA-256 fingerprint (first 8 bytes): <span style="color:var(--muted2);">${S.privFp}</span></div>` : ''}
        </div>

        <!-- Public Key -->
        <div style="background:var(--bg3);border-radius:10px;padding:14px;border-left:3px solid var(--green);">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:6px;">
            <div style="font-family:var(--mono);font-size:10px;font-weight:700;color:var(--green);">🔓 PUBLIC KEY — Share With Peers</div>
            <button id="vpn-copy-pub-btn" onclick="vpnCopyPub()" style="background:var(--bg2);border:1px solid var(--border);color:var(--text);padding:4px 11px;border-radius:6px;font-size:11px;font-family:var(--mono);cursor:pointer;">📋 Copy</button>
          </div>
          <div style="font-family:var(--mono);font-size:13px;color:var(--green);word-break:break-all;letter-spacing:0.5px;">${S.pub}</div>
          ${S.pubFp ? `<div style="font-family:var(--mono);font-size:9px;color:var(--muted);margin-top:6px;">SHA-256 fingerprint (first 8 bytes): <span style="color:var(--muted2);">${S.pubFp}</span></div>` : ''}
        </div>

        <!-- Action Buttons -->
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button onclick="vpnSwitchTab('tools');setTimeout(()=>vpnShowQR('pub'),80);" style="background:var(--bg3);border:1px solid var(--border);color:var(--cyan);padding:7px 13px;border-radius:7px;font-size:11px;font-family:var(--mono);cursor:pointer;">📱 QR: Public Key</button>
          <button onclick="vpnSwitchTab('config');setTimeout(()=>{vpnRenderPeers();vpnUpdateConfigPreview();},80);" style="background:var(--bg3);border:1px solid var(--border);color:var(--green);padding:7px 13px;border-radius:7px;font-size:11px;font-family:var(--mono);cursor:pointer;">⚙️ Config Builder</button>
          <button onclick="vpnWipeKeys()" style="background:rgba(248,113,113,0.08);border:1px solid rgba(248,113,113,0.4);color:var(--red,#f87171);padding:7px 13px;border-radius:7px;font-size:11px;font-family:var(--mono);cursor:pointer;">🗑 Wipe Keys</button>
        </div>
      </div>`;
  }

  window.vpnTogglePriv = function () {
    S.privVisible = !S.privVisible;
    const disp = document.getElementById('vpn-priv-display');
    const eye  = document.getElementById('vpn-eye-btn');
    if (disp) disp.textContent = S.privVisible ? S.priv : '••••••••••••••••••••••••••••••••••••••••••••';
    if (eye)  eye.textContent  = S.privVisible ? '🙈 Hide' : '👁 Show';
    if (S.privVisible) resetInactivityTimer();
  };
  window.vpnCopyPriv = function () {
    if (!S.priv) return;
    navigator.clipboard.writeText(S.priv).then(() => flashBtn('vpn-copy-priv-btn', '✓ Copied!'));
  };
  window.vpnCopyPub = function () {
    if (!S.pub) return;
    navigator.clipboard.writeText(S.pub).then(() => flashBtn('vpn-copy-pub-btn', '✓ Copied!'));
  };
  window.vpnCopyConfig = function () {
    const el = document.getElementById('vpn-config-pre');
    if (el) navigator.clipboard.writeText(el.textContent).then(() => flashBtn('vpn-config-copy-btn', '✓ Copied!'));
  };

  function vpnShowError(msg) {
    const el = document.getElementById('vpn-derive-error');
    if (el) el.innerHTML = `<div style="color:var(--red,#f87171);font-family:var(--mono);font-size:12px;padding:10px 12px;background:rgba(248,113,113,0.08);border-radius:8px;margin-top:10px;">${msg}</div>`;
  }

  // ──────────────────────────────────────────────────────────────
  // PSK GENERATOR
  // ──────────────────────────────────────────────────────────────
  window.vpnGenPsk = function () {
    const raw = new Uint8Array(32);
    crypto.getRandomValues(raw);
    S.psk = bytesToBase64(raw);
    vpnRenderPsk();
    flashBtn('vpn-gen-psk-btn', '✓ Generated!', 'var(--green)');
  };

  function vpnRenderPsk() {
    const el  = document.getElementById('vpn-psk-display');
    const vis = document.getElementById('vpn-psk-visible');
    if (!el) return;
    const isVisible = vis && vis.dataset.visible === '1';
    el.textContent = isVisible ? S.psk : '••••••••••••••••••••••••••••••••••••••••••••';
    el.style.color = 'var(--cyan)';
  }

  window.vpnTogglePsk = function () {
    const vis = document.getElementById('vpn-psk-visible');
    const btn = document.getElementById('vpn-eye-psk-btn');
    const el  = document.getElementById('vpn-psk-display');
    if (!vis || !el || !S.psk) return;
    const now = vis.dataset.visible === '1';
    vis.dataset.visible = now ? '0' : '1';
    el.textContent = (!now) ? S.psk : '••••••••••••••••••••••••••••••••••••••••••••';
    if (btn) btn.textContent = (!now) ? '🙈 Hide' : '👁 Show';
    if (!now) resetInactivityTimer();
  };
  window.vpnCopyPsk = function () {
    if (!S.psk) return;
    navigator.clipboard.writeText(S.psk).then(() => flashBtn('vpn-copy-psk-btn', '✓ Copied!'));
  };

  // ──────────────────────────────────────────────────────────────
  // CONFIG BUILDER
  // ──────────────────────────────────────────────────────────────
  function buildConfigText() {
    if (!S.priv) return '# Generate or derive a key pair first on the ⚡ Generate tab.';
    const c = S.cfg;
    const lines = [];
    lines.push('[Interface]');
    lines.push('PrivateKey = ' + S.priv);
    lines.push('Address    = ' + (c.address || '10.0.0.1/24'));
    if (c.mode === 'server' && c.listenPort) lines.push('ListenPort = ' + c.listenPort);
    if (c.dns)  lines.push('DNS        = ' + c.dns);
    if (c.mtu)  lines.push('MTU        = ' + c.mtu);
    if (!c.peers.length) {
      lines.push('');
      lines.push('# Add a [Peer] block for each remote peer:');
      lines.push('[Peer]');
      lines.push('PublicKey           = <paste-peer-public-key>');
      if (c.mode === 'client') {
        lines.push('AllowedIPs          = 0.0.0.0/0, ::/0');
        lines.push('Endpoint            = vpn.example.com:51820');
        lines.push('PersistentKeepalive = 25');
      } else {
        lines.push('AllowedIPs          = 10.0.0.2/32');
      }
    } else {
      c.peers.forEach((p, i) => {
        lines.push('');
        lines.push('# Peer ' + (i + 1) + (p.name ? ': ' + p.name : ''));
        lines.push('[Peer]');
        lines.push('PublicKey           = ' + (p.pubkey || '<paste-peer-public-key>'));
        if (p.psk) lines.push('PresharedKey        = ' + p.psk);
        lines.push('AllowedIPs          = ' + (p.allowedips || (c.mode === 'client' ? '0.0.0.0/0, ::/0' : '10.0.0.' + (i + 2) + '/32')));
        if (p.endpoint)  lines.push('Endpoint            = ' + p.endpoint);
        if (p.keepalive) lines.push('PersistentKeepalive = ' + p.keepalive);
      });
    }
    return lines.join('\n');
  }

  function vpnUpdateConfigPreview() {
    const el = document.getElementById('vpn-config-pre');
    if (el) el.textContent = buildConfigText();
  }

  window.vpnSetConfigMode = function (mode) {
    S.cfg.mode = mode;
    document.querySelectorAll('.vpn-mode-btn').forEach(b => {
      const active = b.dataset.mode === mode;
      b.style.background   = active ? 'var(--green)' : 'var(--bg3)';
      b.style.color        = active ? '#000' : 'var(--muted2)';
      b.style.borderColor  = active ? 'var(--green)' : 'var(--border)';
    });
    vpnUpdateConfigPreview();
  };

  window.vpnCfgField = function (field, value) {
    S.cfg[field] = value;
    vpnUpdateConfigPreview();
  };

  window.vpnAddPeer = function () {
    S.peerCounter++;
    S.cfg.peers.push({ id: S.peerCounter, name: '', pubkey: '', allowedips: '', endpoint: '', psk: '', keepalive: '' });
    vpnRenderPeers();
    vpnUpdateConfigPreview();
  };

  window.vpnRemovePeer = function (id) {
    S.cfg.peers = S.cfg.peers.filter(p => p.id !== id);
    vpnRenderPeers();
    vpnUpdateConfigPreview();
  };

  window.vpnPeerField = function (id, field, value) {
    const peer = S.cfg.peers.find(p => p.id === id);
    if (peer) { peer[field] = value; vpnUpdateConfigPreview(); }
  };

  window.vpnAutoFillPsk = function (id) {
    const peer = S.cfg.peers.find(p => p.id === id);
    if (!peer) return;
    const raw = new Uint8Array(32);
    crypto.getRandomValues(raw);
    peer.psk = bytesToBase64(raw);
    const inp = document.getElementById('vpn-peer-psk-' + id);
    if (inp) inp.value = peer.psk;
    vpnUpdateConfigPreview();
  };

  function cfgInput(id, label, value, oninput, placeholder) {
    return `<div>
      <div style="font-family:var(--mono);font-size:9px;color:var(--muted);margin-bottom:4px;text-transform:uppercase;">${label}</div>
      <input id="${id}" type="text" value="${value || ''}" placeholder="${placeholder}" oninput="${oninput}" autocomplete="off" spellcheck="false"
        style="width:100%;box-sizing:border-box;background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:8px 10px;border-radius:7px;font-family:var(--mono);font-size:11px;outline:none;">
    </div>`;
  }

  function vpnRenderPeers() {
    const el = document.getElementById('vpn-peers-list');
    if (!el) return;
    if (!S.cfg.peers.length) {
      el.innerHTML = `<div style="color:var(--muted);font-size:12px;text-align:center;padding:14px 0;font-family:var(--mono);">No peers added. Click "+ Add Peer" below.</div>`;
      return;
    }
    el.innerHTML = S.cfg.peers.map(p => `
      <div style="background:var(--bg2);border-radius:10px;padding:14px;border:1px solid var(--border);margin-bottom:10px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
          <div style="font-family:var(--mono);font-size:10px;font-weight:700;color:var(--cyan);">PEER ${p.id}</div>
          <button onclick="vpnRemovePeer(${p.id})" style="background:rgba(248,113,113,0.1);border:1px solid rgba(248,113,113,0.4);color:var(--red,#f87171);padding:3px 10px;border-radius:6px;font-size:10px;font-family:var(--mono);cursor:pointer;">✕ Remove</button>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">
          ${cfgInput('vpn-peer-pk-' + p.id,  'Public Key',  p.pubkey,    'vpnPeerField(' + p.id + ',"pubkey",this.value)',    'wg pubkey output (44 chars base64)')}
          ${cfgInput('vpn-peer-ep-' + p.id,  'Endpoint',    p.endpoint,  'vpnPeerField(' + p.id + ',"endpoint",this.value)',  'vpn.example.com:51820')}
          ${cfgInput('vpn-peer-ai-' + p.id,  'AllowedIPs',  p.allowedips,'vpnPeerField(' + p.id + ',"allowedips",this.value)','0.0.0.0/0, ::/0  or  10.0.0.2/32')}
          ${cfgInput('vpn-peer-ka-' + p.id,  'Keepalive',   p.keepalive, 'vpnPeerField(' + p.id + ',"keepalive",this.value)', '25  (seconds)')}
        </div>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
          <input id="vpn-peer-psk-${p.id}" type="text" value="${p.psk || ''}" placeholder="PresharedKey (optional — 32-byte base64)"
            oninput="vpnPeerField(${p.id},'psk',this.value)" autocomplete="off" spellcheck="false"
            style="flex:1;min-width:180px;background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:8px 10px;border-radius:7px;font-family:var(--mono);font-size:11px;outline:none;">
          <button onclick="vpnAutoFillPsk(${p.id})" style="background:var(--bg3);border:1px solid var(--border);color:var(--cyan);padding:7px 12px;border-radius:7px;font-size:10px;font-family:var(--mono);cursor:pointer;white-space:nowrap;">⚡ Auto PSK</button>
        </div>
      </div>`
    ).join('');
  }

  window.vpnDownloadConfig = function () {
    const text = buildConfigText();
    if (!S.priv) { alert('Generate or derive a key pair first.'); return; }
    const blob = new Blob([text], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'wg0.conf'; a.click();
    URL.revokeObjectURL(url);
    flashBtn('vpn-download-cfg-btn', '✓ Downloaded!', 'var(--green)');
  };

  // ──────────────────────────────────────────────────────────────
  // CIDR / SUBNET CALCULATOR
  // ──────────────────────────────────────────────────────────────
  function parseCIDR(cidr) {
    const m = cidr.trim().match(/^(\d{1,3}(?:\.\d{1,3}){3})\/(\d{1,2})$/);
    if (!m) return null;
    const parts = m[1].split('.').map(Number);
    if (parts.some(p => p > 255)) return null;
    const prefix = parseInt(m[2]);
    if (prefix > 32) return null;
    const ip      = ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
    const mask    = prefix === 0 ? 0 : ((~0 << (32 - prefix)) >>> 0);
    const network = (ip & mask) >>> 0;
    const bcast   = (network | (~mask >>> 0)) >>> 0;
    function toIP(n) { return [(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255].join('.'); }
    const total   = Math.pow(2, 32 - prefix);
    const hosts   = prefix >= 31 ? total : Math.max(0, total - 2);
    return {
      ip: m[1], prefix,
      mask:      toIP(mask),
      network:   toIP(network),
      broadcast: toIP(bcast),
      first:     prefix < 31 ? toIP(network + 1) : toIP(network),
      last:      prefix < 31 ? toIP(bcast - 1)   : toIP(bcast),
      hosts, total
    };
  }

  window.vpnCalcCIDR = function () {
    const input = document.getElementById('vpn-cidr-input');
    const out   = document.getElementById('vpn-cidr-out');
    if (!input || !out) return;
    const r = parseCIDR(input.value);
    if (!r) {
      out.innerHTML = `<div style="color:var(--red,#f87171);font-family:var(--mono);font-size:12px;padding:8px;margin-top:8px;">Invalid CIDR. Example: 10.0.0.0/24</div>`;
      return;
    }
    const rows = [
      ['IP Address',       r.ip + '/' + r.prefix],
      ['Network Address',  r.network],
      ['Subnet Mask',      r.mask],
      ['Broadcast',        r.broadcast],
      ['First Host',       r.first],
      ['Last Host',        r.last],
      ['Usable Hosts',     r.hosts.toLocaleString()],
      ['Total Addresses',  r.total.toLocaleString()],
    ];
    out.innerHTML = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:10px;">
      ${rows.map(([k, v]) => `
        <div style="background:var(--bg2);border-radius:7px;padding:8px 10px;border:1px solid var(--border);">
          <div style="font-family:var(--mono);font-size:9px;color:var(--muted);margin-bottom:3px;">${k.toUpperCase()}</div>
          <div style="font-family:var(--mono);font-size:12px;color:var(--green);">${v}</div>
        </div>`).join('')}
    </div>`;
  };

  // ──────────────────────────────────────────────────────────────
  // HEX ↔ BASE64 CONVERTER
  // ──────────────────────────────────────────────────────────────
  window.vpnHexToB64 = function () {
    const input = document.getElementById('vpn-hex-input');
    const out   = document.getElementById('vpn-hex-out');
    if (!input || !out) return;
    const bytes = hexToBytes(input.value);
    if (!bytes) {
      out.innerHTML = `<div style="color:var(--red,#f87171);font-family:var(--mono);font-size:11px;margin-top:6px;">Invalid — must be exactly 64 hex characters (32 bytes).</div>`;
      return;
    }
    const b64 = bytesToBase64(bytes);
    out.innerHTML = `<div style="display:flex;align-items:center;gap:8px;margin-top:8px;">
      <div style="font-family:var(--mono);font-size:12px;color:var(--green);word-break:break-all;background:var(--bg2);padding:8px 10px;border-radius:7px;border:1px solid var(--border);flex:1;">${b64}</div>
      <button onclick="navigator.clipboard.writeText('${b64}').then(()=>flashBtn('vpn-copy-hex-out','✓'))" id="vpn-copy-hex-out" style="background:var(--bg2);border:1px solid var(--border);color:var(--muted2);padding:6px 10px;border-radius:6px;font-size:11px;cursor:pointer;white-space:nowrap;">📋 Copy</button>
    </div>`;
  };

  window.vpnB64ToHex = function () {
    const input = document.getElementById('vpn-b64-input');
    const out   = document.getElementById('vpn-b64-out');
    if (!input || !out) return;
    const bytes = base64ToBytes(input.value);
    if (!bytes || bytes.length !== 32) {
      out.innerHTML = `<div style="color:var(--red,#f87171);font-family:var(--mono);font-size:11px;margin-top:6px;">Invalid — must decode to 32 bytes (44-char base64 key).</div>`;
      return;
    }
    const hex = bytesToHex(bytes);
    out.innerHTML = `<div style="display:flex;align-items:center;gap:8px;margin-top:8px;">
      <div style="font-family:var(--mono);font-size:12px;color:var(--green);word-break:break-all;background:var(--bg2);padding:8px 10px;border-radius:7px;border:1px solid var(--border);flex:1;">${hex}</div>
      <button onclick="navigator.clipboard.writeText('${hex}').then(()=>flashBtn('vpn-copy-b64-out','✓'))" id="vpn-copy-b64-out" style="background:var(--bg2);border:1px solid var(--border);color:var(--muted2);padding:6px 10px;border-radius:6px;font-size:11px;cursor:pointer;white-space:nowrap;">📋 Copy</button>
    </div>`;
  };

  // ──────────────────────────────────────────────────────────────
  // CONFIG VALIDATOR
  // ──────────────────────────────────────────────────────────────
  function parseWgConf(text) {
    const sections = [];
    let cur = null;
    for (const raw of text.split('\n')) {
      const line = raw.trim();
      if (!line || line.startsWith('#')) continue;
      const secMatch = line.match(/^\[(\w+)\]$/);
      if (secMatch) {
        if (cur) sections.push(cur);
        cur = { type: secMatch[1], fields: {} };
      } else if (cur && line.includes('=')) {
        const idx = line.indexOf('=');
        cur.fields[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
      }
    }
    if (cur) sections.push(cur);
    return sections;
  }

  window.vpnValidateConfig = function () {
    const input = document.getElementById('vpn-validate-input');
    const out   = document.getElementById('vpn-validate-out');
    if (!input || !out) return;
    const text = input.value.trim();
    if (!text) { out.innerHTML = `<div style="color:var(--muted);font-size:12px;">Paste a WireGuard .conf file above, then click Validate.</div>`; return; }

    const sections = parseWgConf(text);
    const issues = [], info = [];
    const iface  = sections.find(s => s.type === 'Interface');
    const peers  = sections.filter(s => s.type === 'Peer');

    if (!iface) {
      issues.push('Missing [Interface] section');
    } else {
      if (!iface.fields.PrivateKey) {
        issues.push('[Interface] missing PrivateKey');
      } else {
        const b = base64ToBytes(iface.fields.PrivateKey);
        if (!b || b.length !== 32) issues.push('[Interface] PrivateKey is not a valid 32-byte base64 key');
        else info.push('[Interface] PrivateKey — valid format');
      }
      if (!iface.fields.Address) issues.push('[Interface] missing Address field');
      else {
        const cidr = parseCIDR(iface.fields.Address.split(',')[0].trim());
        if (!cidr) issues.push('[Interface] Address does not appear to be valid CIDR');
        else info.push('[Interface] Address = ' + iface.fields.Address);
      }
      if (iface.fields.DNS)        info.push('[Interface] DNS = ' + iface.fields.DNS);
      if (!iface.fields.ListenPort) info.push('[Interface] ListenPort not set (normal for client configs)');
      else                          info.push('[Interface] ListenPort = ' + iface.fields.ListenPort);
    }

    if (!peers.length) {
      issues.push('No [Peer] sections found');
    } else {
      info.push('Found ' + peers.length + ' peer(s)');
      peers.forEach((peer, i) => {
        const n = i + 1;
        if (!peer.fields.PublicKey) {
          issues.push('[Peer #' + n + '] missing PublicKey');
        } else {
          const b = base64ToBytes(peer.fields.PublicKey);
          if (!b || b.length !== 32) issues.push('[Peer #' + n + '] PublicKey is not a valid 32-byte base64 key');
          else info.push('[Peer #' + n + '] PublicKey — valid format');
        }
        if (!peer.fields.AllowedIPs) {
          issues.push('[Peer #' + n + '] missing AllowedIPs');
        } else {
          const ai = peer.fields.AllowedIPs;
          if (ai.includes('0.0.0.0/0')) info.push('[Peer #' + n + '] AllowedIPs — full-tunnel (all traffic via VPN)');
          else info.push('[Peer #' + n + '] AllowedIPs = ' + ai);
        }
        if (peer.fields.PresharedKey) {
          const b = base64ToBytes(peer.fields.PresharedKey);
          if (!b || b.length !== 32) issues.push('[Peer #' + n + '] PresharedKey is not a valid 32-byte base64 key');
          else info.push('[Peer #' + n + '] PresharedKey — present and valid (post-quantum hardening active)');
        }
        if (!peer.fields.Endpoint && !iface) info.push('[Peer #' + n + '] Endpoint not set (passive/server side)');
      });
    }

    const ok = issues.length === 0;
    out.innerHTML = `
      <div style="margin-top:10px;padding:12px 14px;border-radius:9px;background:var(--bg2);border:1px solid var(--border);">
        <div style="font-family:var(--mono);font-size:13px;font-weight:700;color:${ok ? 'var(--green)' : 'var(--red,#f87171)'};margin-bottom:10px;">
          ${ok ? '✓ Config looks valid' : '✗ ' + issues.length + ' issue(s) found'}
        </div>
        ${issues.map(i => `<div style="font-family:var(--mono);font-size:11px;color:var(--red,#f87171);padding:2px 0;">✗ ${i}</div>`).join('')}
        ${issues.length && info.length ? '<div style="border-top:1px solid var(--border);margin:8px 0;"></div>' : ''}
        ${info.map(i => `<div style="font-family:var(--mono);font-size:11px;color:var(--green);padding:2px 0;">✓ ${i}</div>`).join('')}
      </div>`;
  };

  // ──────────────────────────────────────────────────────────────
  // QR CODE EXPORT
  // ──────────────────────────────────────────────────────────────
  window.vpnShowQR = function (which) {
    const data = which === 'pub' ? S.pub : which === 'psk' ? S.psk : '';
    const container = document.getElementById('vpn-qr-container');
    if (!container) return;
    if (!data) {
      container.innerHTML = `<div style="color:var(--muted);font-size:12px;font-family:var(--mono);padding:10px;">Generate a key pair first.</div>`;
      return;
    }
    container.innerHTML = '';
    function makeQR() {
      try {
        new QRCode(container, {
          text: data, width: 180, height: 180,
          colorDark: '#00e87a', colorLight: '#1a1a2e',
          correctLevel: QRCode.CorrectLevel.M
        });

        // Label
        const label = document.createElement('div');
        label.style.cssText = 'font-family:var(--mono);font-size:9px;color:var(--muted);margin-top:8px;text-align:center;';
        label.textContent = which === 'pub' ? 'PUBLIC KEY' : 'PRE-SHARED KEY';
        container.appendChild(label);

        // Download button — qrcodejs renders a <canvas> then hides it and shows an <img>.
        // We read from the canvas (most reliable data source) with a small delay so the
        // library has time to finish drawing before we capture it.
        const dlBtn = document.createElement('button');
        dlBtn.id = 'vpn-qr-download-btn';
        dlBtn.textContent = '⬇ Download QR';
        dlBtn.style.cssText = [
          'display:block', 'margin:10px auto 0', 'background:var(--bg2)',
          'border:1px solid var(--green)', 'color:var(--green)',
          'padding:6px 16px', 'border-radius:7px', 'font-family:var(--mono)',
          'font-size:11px', 'cursor:pointer', 'letter-spacing:0.5px'
        ].join(';');

        dlBtn.onclick = function () {
          // Prefer the canvas (has the pixel data); fall back to the img src
          const canvas = container.querySelector('canvas');
          const img    = container.querySelector('img');
          let dataUrl  = '';

          if (canvas) {
            dataUrl = canvas.toDataURL('image/png');
          } else if (img && img.src) {
            dataUrl = img.src; // already a data-URL when generated by qrcodejs
          }

          if (!dataUrl) {
            dlBtn.textContent = '⚠ Nothing to save';
            setTimeout(() => { dlBtn.textContent = '⬇ Download QR'; }, 2000);
            return;
          }

          const filename = (which === 'pub' ? 'wireguard-public-key' : 'wireguard-psk') + '-qr.png';
          const a = document.createElement('a');
          a.href     = dataUrl;
          a.download = filename;
          a.click();

          // Flash feedback
          dlBtn.textContent  = '✓ Saved!';
          dlBtn.style.color  = 'var(--green)';
          setTimeout(() => { dlBtn.textContent = '⬇ Download QR'; }, 1800);
        };

        container.appendChild(dlBtn);

      } catch (e) {
        container.innerHTML = `<div style="color:var(--muted);font-size:11px;font-family:var(--mono);">QR render failed: ${e.message}</div>`;
      }
    }
    if (typeof QRCode !== 'undefined') {
      makeQR();
    } else {
      container.innerHTML = `<div style="color:var(--muted);font-size:11px;font-family:var(--mono);padding:8px;">Loading QR library…</div>`;
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
      s.onload = () => { container.innerHTML = ''; makeQR(); };
      s.onerror = () => { container.innerHTML = `<div style="color:var(--muted);font-size:11px;font-family:var(--mono);padding:8px;">QR library unavailable. Copy the key manually.</div>`; };
      document.head.appendChild(s);
    }
  };

  // ──────────────────────────────────────────────────────────────
  // PEER PAIRING HELPER
  // ──────────────────────────────────────────────────────────────
  const PP = { privA: '', pubA: '', privB: '', pubB: '' };

  function genSide(side) {
    const raw = new Uint8Array(32);
    crypto.getRandomValues(raw);
    raw[0] &= 248; raw[31] &= 127; raw[31] |= 64;
    PP['pub' + side]  = bytesToBase64(curve25519(raw));
    PP['priv' + side] = bytesToBase64(raw);
    vpnRenderPairing();
  }
  window.vpnGenPairSideA = () => genSide('A');
  window.vpnGenPairSideB = () => genSide('B');

  function vpnRenderPairing() {
    const pskLine = S.psk ? 'PresharedKey = ' + S.psk : '# PresharedKey = (generate on ⚡ Generate tab)';
    const cfgA = PP.privA
      ? `[Interface]
PrivateKey = ${PP.privA}
Address    = 10.0.0.1/24
ListenPort = 51820

[Peer] # Side B (Client)
PublicKey  = ${PP.pubB || '<generate Side B first>'}
AllowedIPs = 10.0.0.2/32
${pskLine}`
      : '# Generate Side A keys first';

    const cfgB = PP.privB
      ? `[Interface]
PrivateKey = ${PP.privB}
Address    = 10.0.0.2/24

[Peer] # Side A (Server)
PublicKey           = ${PP.pubA || '<generate Side A first>'}
AllowedIPs          = 0.0.0.0/0, ::/0
Endpoint            = vpn.example.com:51820
PersistentKeepalive = 25
${pskLine}`
      : '# Generate Side B keys first';

    const elA = document.getElementById('vpn-pair-cfg-a');
    const elB = document.getElementById('vpn-pair-cfg-b');
    if (elA) elA.textContent = cfgA;
    if (elB) elB.textContent = cfgB;
  }

  window.vpnCopyPairA = function () {
    const el = document.getElementById('vpn-pair-cfg-a');
    if (el) navigator.clipboard.writeText(el.textContent).then(() => flashBtn('vpn-copy-pair-a', '✓ Copied!'));
  };
  window.vpnCopyPairB = function () {
    const el = document.getElementById('vpn-pair-cfg-b');
    if (el) navigator.clipboard.writeText(el.textContent).then(() => flashBtn('vpn-copy-pair-b', '✓ Copied!'));
  };

  // ──────────────────────────────────────────────────────────────
  // INIT — inject page HTML
  // ──────────────────────────────────────────────────────────────
  function vpnInit() {
    const page = document.getElementById('page-vpn');
    if (!page) return;

    page.innerHTML = `
<div class="page-hdr">
  <div class="page-title">🔑 WireGuard Key Generator</div>
  <div class="page-sub">Curve25519 key pairs · PSK · Config builder · CIDR calc · Config validator · QR export · Peer pairing — 100% browser-side, zero external requests for cryptographic operations.</div>
</div>

<!-- ── TAB BAR ── -->
<div style="display:flex;border-bottom:1px solid var(--border);margin-bottom:16px;overflow-x:auto;gap:0;">
  <button id="vpn-tabbar-generate" onclick="vpnSwitchTab('generate')" style="background:none;border:none;border-bottom:2px solid var(--green);color:var(--green);padding:10px 18px;font-family:var(--mono);font-size:12px;cursor:pointer;white-space:nowrap;">⚡ Generate</button>
  <button id="vpn-tabbar-config"   onclick="vpnSwitchTab('config')"   style="background:none;border:none;border-bottom:2px solid transparent;color:var(--muted);padding:10px 18px;font-family:var(--mono);font-size:12px;cursor:pointer;white-space:nowrap;">⚙️ Config Builder</button>
  <button id="vpn-tabbar-tools"    onclick="vpnSwitchTab('tools')"    style="background:none;border:none;border-bottom:2px solid transparent;color:var(--muted);padding:10px 18px;font-family:var(--mono);font-size:12px;cursor:pointer;white-space:nowrap;">🔧 Tools</button>
  <button id="vpn-tabbar-history"  onclick="vpnSwitchTab('history')"  style="background:none;border:none;border-bottom:2px solid transparent;color:var(--muted);padding:10px 18px;font-family:var(--mono);font-size:12px;cursor:pointer;white-space:nowrap;">📜 History</button>
</div>

<!-- ══════════════════════════════════════════════════════ -->
<!--  TAB: GENERATE                                         -->
<!-- ══════════════════════════════════════════════════════ -->
<div id="vpn-tab-generate">

  <!-- Generate New Key Pair -->
  <div class="card">
    <div class="card-hdr">⚡ Generate New Key Pair</div>
    <p style="font-size:12px;color:var(--muted2);line-height:1.7;margin-bottom:14px;">
      Uses <code>crypto.getRandomValues()</code> as entropy source and Curve25519 scalar multiplication (RFC 7748) to derive the public key.
      SHA-256 fingerprints are computed for identity verification. Private key auto-blurs after <strong>30 seconds</strong> of inactivity.
    </p>
    <button id="vpn-gen-btn" onclick="vpnGenerate()" class="btn btn-primary" style="width:100%;padding:12px 0;font-size:14px;">
      ⚡ Generate New Key Pair
    </button>
    <div id="vpn-keys-out"></div>
  </div>

  <!-- Derive Public Key -->
  <div class="card" style="margin-top:14px;">
    <div class="card-hdr">🔄 Derive Public Key from Existing Private Key</div>
    <p style="font-size:12px;color:var(--muted2);line-height:1.7;margin-bottom:12px;">
      Paste a WireGuard private key (base64, 44 chars) to derive its matching public key.
      Real-time format validation shown as you type.
    </p>
    <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
      <div style="flex:1;position:relative;min-width:200px;">
        <input type="text" id="vpn-priv-input" autocomplete="off" spellcheck="false"
          placeholder="Paste base64 WireGuard private key (44 characters, output of: wg genkey)…"
          oninput="vpnValidatePrivInput(this)"
          style="width:100%;box-sizing:border-box;background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:10px 70px 10px 14px;border-radius:8px;font-family:var(--mono);font-size:12px;outline:none;">
        <span id="vpn-priv-input-indicator" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);font-family:var(--mono);font-size:11px;font-weight:700;pointer-events:none;"></span>
      </div>
      <button onclick="vpnDerive()" class="btn btn-primary" style="white-space:nowrap;padding:10px 18px;">🔄 Derive</button>
    </div>
    <div id="vpn-derive-error"></div>
  </div>

  <!-- PSK Generator -->
  <div class="card" style="margin-top:14px;">
    <div class="card-hdr">🛡 Pre-Shared Key (PSK) Generator</div>
    <p style="font-size:12px;color:var(--muted2);line-height:1.7;margin-bottom:12px;">
      Optional 32-byte symmetric key added to the WireGuard Noise handshake for post-quantum resistance.
      Equivalent to <code>wg genpsk</code>. Add it as <code>PresharedKey</code> in <em>both</em> peers' <code>[Peer]</code> blocks.
    </p>
    <button id="vpn-gen-psk-btn" onclick="vpnGenPsk()" class="btn btn-primary" style="padding:9px 20px;">⚡ Generate PSK</button>
    <div style="margin-top:12px;background:var(--bg3);border-radius:10px;padding:14px;border-left:3px solid var(--cyan);">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;flex-wrap:wrap;gap:6px;">
        <div style="font-family:var(--mono);font-size:10px;font-weight:700;color:var(--cyan);">🔑 PRE-SHARED KEY (PSK)</div>
        <div style="display:flex;gap:6px;">
          <span id="vpn-psk-visible" data-visible="0" style="display:none;"></span>
          <button id="vpn-eye-psk-btn" onclick="vpnTogglePsk()" style="background:var(--bg2);border:1px solid var(--border);color:var(--muted2);padding:4px 11px;border-radius:6px;font-size:11px;cursor:pointer;">👁 Show</button>
          <button id="vpn-copy-psk-btn" onclick="vpnCopyPsk()" style="background:var(--bg2);border:1px solid var(--border);color:var(--text);padding:4px 11px;border-radius:6px;font-size:11px;font-family:var(--mono);cursor:pointer;">📋 Copy</button>
        </div>
      </div>
      <div id="vpn-psk-display" style="font-family:var(--mono);font-size:12px;color:var(--muted);word-break:break-all;letter-spacing:0.5px;">Generate a PSK above.</div>
    </div>
  </div>

  <!-- Algorithm Reference -->
  <div class="card" style="margin-top:14px;">
    <div class="card-hdr">🔐 Curve25519 Algorithm Reference</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px;">
      <div style="background:var(--bg3);border-radius:8px;padding:12px;">
        <div style="font-family:var(--mono);font-size:9px;font-weight:700;color:var(--green);margin-bottom:6px;">KEY GENERATION</div>
        <div style="font-size:11px;color:var(--muted2);line-height:1.8;">
          1. Generate 32 random bytes<br>
          2. Clamp: byte[0] &amp;= 248 (clear bits 0–2)<br>
          3. Clamp: byte[31] &amp;= 127 (clear bit 255)<br>
          4. Clamp: byte[31] |= 64 (set bit 254)<br>
          5. Public = X25519(private, base_point=9)
        </div>
      </div>
      <div style="background:var(--bg3);border-radius:8px;padding:12px;">
        <div style="font-family:var(--mono);font-size:9px;font-weight:700;color:var(--cyan);margin-bottom:6px;">ALGORITHM DETAILS</div>
        <div style="font-size:11px;color:var(--muted2);line-height:1.8;">
          Curve: Curve25519 (Montgomery)<br>
          Function: X25519 scalar multiplication<br>
          Field prime: 2<sup>255</sup> − 19<br>
          Base point: u = 9<br>
          Key size: 32 bytes (256-bit)<br>
          Standard: RFC 7748
        </div>
      </div>
      <div style="background:var(--bg3);border-radius:8px;padding:12px;">
        <div style="font-family:var(--mono);font-size:9px;font-weight:700;color:var(--blue,#60a5fa);margin-bottom:6px;">WG CLI COMMANDS</div>
        <div style="font-family:var(--mono);font-size:11px;color:var(--muted2);line-height:1.9;">
          wg genkey<br>
          wg genkey | tee priv | wg pubkey<br>
          wg genpsk<br>
          wg show<br>
          sudo wg-quick up wg0<br>
          sudo wg-quick down wg0
        </div>
      </div>
      <div style="background:var(--bg3);border-radius:8px;padding:12px;border:1px solid rgba(251,191,36,0.2);">
        <div style="font-family:var(--mono);font-size:9px;font-weight:700;color:var(--amber);margin-bottom:6px;">⚠ SECURITY GUIDANCE</div>
        <div style="font-size:11px;color:var(--muted2);line-height:1.8;">
          For <strong>production</strong>, generate keys <em>on the WireGuard host</em> using <code>wg genkey</code> so the private key never leaves that device. This tool is intended for <strong>learning, labs, and config prototyping</strong> only.
        </div>
      </div>
    </div>
    <div style="margin-top:10px;font-family:var(--mono);font-size:10px;color:var(--muted);line-height:1.9;border-top:1px solid var(--border);padding-top:8px;">
      <span style="color:var(--green)">WireGuard handshake:</span> Noise_IKpsk2 · Initiator sends ephemeral public key · X25519 + ChaCha20-Poly1305 + BLAKE2s &nbsp;|&nbsp;
      <span style="color:var(--cyan)">PSK:</span> Optional post-quantum layer via 32-byte symmetric key · wg genpsk
    </div>
  </div>
</div><!-- /tab-generate -->

<!-- ══════════════════════════════════════════════════════ -->
<!--  TAB: CONFIG BUILDER                                   -->
<!-- ══════════════════════════════════════════════════════ -->
<div id="vpn-tab-config" style="display:none;">
  <div class="card">
    <div class="card-hdr">⚙️ Interactive Config Builder</div>
    <p style="font-size:12px;color:var(--muted2);line-height:1.7;margin-bottom:14px;">
      Fill in the fields — the config template updates live. Generate or derive a key pair on the ⚡ Generate tab first.
    </p>

    <!-- Mode Toggle -->
    <div style="display:flex;gap:8px;align-items:center;margin-bottom:16px;">
      <div style="font-family:var(--mono);font-size:10px;color:var(--muted);white-space:nowrap;">MODE:</div>
      <button class="vpn-mode-btn" data-mode="server" onclick="vpnSetConfigMode('server')"
        style="background:var(--green);color:#000;border:1px solid var(--green);padding:6px 18px;border-radius:7px;font-family:var(--mono);font-size:11px;font-weight:700;cursor:pointer;">🖥 Server</button>
      <button class="vpn-mode-btn" data-mode="client" onclick="vpnSetConfigMode('client')"
        style="background:var(--bg3);color:var(--muted2);border:1px solid var(--border);padding:6px 18px;border-radius:7px;font-family:var(--mono);font-size:11px;cursor:pointer;">💻 Client</button>
    </div>

    <!-- Interface Fields -->
    <div style="font-family:var(--mono);font-size:9px;font-weight:700;color:var(--green);letter-spacing:1px;margin-bottom:10px;">[INTERFACE]</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px;margin-bottom:18px;">
      <div>
        <div style="font-family:var(--mono);font-size:9px;color:var(--muted);margin-bottom:4px;">ADDRESS</div>
        <input type="text" value="10.0.0.1/24" oninput="vpnCfgField('address',this.value)" placeholder="10.0.0.1/24" autocomplete="off" spellcheck="false"
          style="width:100%;box-sizing:border-box;background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:8px 10px;border-radius:7px;font-family:var(--mono);font-size:11px;outline:none;">
      </div>
      <div>
        <div style="font-family:var(--mono);font-size:9px;color:var(--muted);margin-bottom:4px;">LISTEN PORT <span style="opacity:0.5;">(server)</span></div>
        <input type="text" value="51820" oninput="vpnCfgField('listenPort',this.value)" placeholder="51820" autocomplete="off"
          style="width:100%;box-sizing:border-box;background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:8px 10px;border-radius:7px;font-family:var(--mono);font-size:11px;outline:none;">
      </div>
      <div>
        <div style="font-family:var(--mono);font-size:9px;color:var(--muted);margin-bottom:4px;">DNS</div>
        <input type="text" value="1.1.1.1" oninput="vpnCfgField('dns',this.value)" placeholder="1.1.1.1" autocomplete="off"
          style="width:100%;box-sizing:border-box;background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:8px 10px;border-radius:7px;font-family:var(--mono);font-size:11px;outline:none;">
      </div>
      <div>
        <div style="font-family:var(--mono);font-size:9px;color:var(--muted);margin-bottom:4px;">MTU <span style="opacity:0.5;">(optional)</span></div>
        <input type="text" oninput="vpnCfgField('mtu',this.value)" placeholder="1420" autocomplete="off"
          style="width:100%;box-sizing:border-box;background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:8px 10px;border-radius:7px;font-family:var(--mono);font-size:11px;outline:none;">
      </div>
    </div>

    <!-- Peers -->
    <div style="font-family:var(--mono);font-size:9px;font-weight:700;color:var(--cyan);letter-spacing:1px;margin-bottom:10px;">[PEERS]</div>
    <div id="vpn-peers-list"></div>
    <button onclick="vpnAddPeer()" style="width:100%;background:var(--bg3);border:1px dashed var(--border);color:var(--cyan);padding:10px 0;border-radius:8px;font-family:var(--mono);font-size:12px;cursor:pointer;margin-bottom:18px;letter-spacing:0.5px;">+ Add Peer</button>

    <!-- Config Preview -->
    <div style="font-family:var(--mono);font-size:9px;font-weight:700;color:var(--amber);letter-spacing:1px;margin-bottom:8px;">CONFIG PREVIEW</div>
    <pre id="vpn-config-pre" style="background:var(--bg3);border-radius:8px;padding:14px;font-family:var(--mono);font-size:12px;color:var(--muted2);line-height:1.9;overflow-x:auto;border:1px solid var(--border);white-space:pre;max-height:340px;overflow-y:auto;"></pre>
    <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;">
      <button id="vpn-config-copy-btn" onclick="vpnCopyConfig()" style="background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:8px 16px;border-radius:7px;font-size:11px;font-family:var(--mono);cursor:pointer;">📋 Copy Config</button>
      <button id="vpn-download-cfg-btn" onclick="vpnDownloadConfig()" style="background:var(--bg3);border:1px solid var(--green);color:var(--green);padding:8px 16px;border-radius:7px;font-size:11px;font-family:var(--mono);cursor:pointer;">⬇ Download wg0.conf</button>
    </div>
  </div>
</div><!-- /tab-config -->

<!-- ══════════════════════════════════════════════════════ -->
<!--  TAB: TOOLS                                            -->
<!-- ══════════════════════════════════════════════════════ -->
<div id="vpn-tab-tools" style="display:none;">

  <!-- Config Validator -->
  <div class="card">
    <div class="card-hdr">✅ Config Validator</div>
    <p style="font-size:12px;color:var(--muted2);line-height:1.7;margin-bottom:10px;">
      Paste an existing WireGuard <code>.conf</code> file to check for missing fields, malformed keys, tunnel mode, and PSK presence.
    </p>
    <textarea id="vpn-validate-input" rows="9" spellcheck="false"
      placeholder="[Interface]&#10;PrivateKey = ...&#10;Address    = 10.0.0.1/24&#10;ListenPort = 51820&#10;&#10;[Peer]&#10;PublicKey  = ...&#10;AllowedIPs = 0.0.0.0/0, ::/0"
      style="width:100%;box-sizing:border-box;background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:12px;border-radius:8px;font-family:var(--mono);font-size:11px;line-height:1.8;outline:none;resize:vertical;"></textarea>
    <button onclick="vpnValidateConfig()" class="btn btn-primary" style="margin-top:10px;padding:9px 22px;">✅ Validate Config</button>
    <div id="vpn-validate-out" style="margin-top:8px;"></div>
  </div>

  <!-- CIDR Calculator -->
  <div class="card" style="margin-top:14px;">
    <div class="card-hdr">🌐 CIDR / Subnet Calculator</div>
    <p style="font-size:12px;color:var(--muted2);line-height:1.7;margin-bottom:10px;">
      Calculate network address, subnet mask, broadcast, usable host range, and IP count for any CIDR block.
    </p>
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
      <input type="text" id="vpn-cidr-input" value="10.0.0.0/24" spellcheck="false" autocomplete="off"
        placeholder="e.g. 192.168.1.0/24"
        style="flex:1;min-width:160px;background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:9px 12px;border-radius:7px;font-family:var(--mono);font-size:13px;outline:none;">
      <button onclick="vpnCalcCIDR()" class="btn btn-primary" style="white-space:nowrap;padding:9px 20px;">Calculate</button>
    </div>
    <div id="vpn-cidr-out"></div>
  </div>

  <!-- Hex ↔ Base64 Converter -->
  <div class="card" style="margin-top:14px;">
    <div class="card-hdr">🔁 Hex ↔ Base64 Key Converter</div>
    <p style="font-size:12px;color:var(--muted2);line-height:1.7;margin-bottom:12px;">
      Convert WireGuard keys between raw hex (64 hex chars) and base64 (44 chars) formats — useful when integrating with tools that expect a specific encoding.
    </p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
      <div>
        <div style="font-family:var(--mono);font-size:9px;font-weight:700;color:var(--green);margin-bottom:6px;letter-spacing:1px;">HEX → BASE64</div>
        <input type="text" id="vpn-hex-input" placeholder="64 hex characters (32 bytes)…" autocomplete="off" spellcheck="false"
          style="width:100%;box-sizing:border-box;background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:9px 10px;border-radius:7px;font-family:var(--mono);font-size:11px;outline:none;">
        <button onclick="vpnHexToB64()" class="btn btn-primary" style="margin-top:8px;padding:7px 16px;font-size:11px;">Convert →</button>
        <div id="vpn-hex-out"></div>
      </div>
      <div>
        <div style="font-family:var(--mono);font-size:9px;font-weight:700;color:var(--cyan);margin-bottom:6px;letter-spacing:1px;">BASE64 → HEX</div>
        <input type="text" id="vpn-b64-input" placeholder="44-char base64 key…" autocomplete="off" spellcheck="false"
          style="width:100%;box-sizing:border-box;background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:9px 10px;border-radius:7px;font-family:var(--mono);font-size:11px;outline:none;">
        <button onclick="vpnB64ToHex()" class="btn btn-primary" style="margin-top:8px;padding:7px 16px;font-size:11px;">Convert →</button>
        <div id="vpn-b64-out"></div>
      </div>
    </div>
  </div>

  <!-- QR Code Export -->
  <div class="card" style="margin-top:14px;">
    <div class="card-hdr">📱 QR Code Export</div>
    <p style="font-size:12px;color:var(--muted2);line-height:1.7;margin-bottom:12px;">
      Scan the QR code from a mobile WireGuard app for quick key import. Generate keys first on the ⚡ Generate tab.
    </p>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;">
      <button onclick="vpnShowQR('pub')" style="background:var(--bg3);border:1px solid var(--green);color:var(--green);padding:7px 14px;border-radius:7px;font-size:11px;font-family:var(--mono);cursor:pointer;">QR: Public Key</button>
      <button onclick="vpnShowQR('psk')" style="background:var(--bg3);border:1px solid var(--cyan);color:var(--cyan);padding:7px 14px;border-radius:7px;font-size:11px;font-family:var(--mono);cursor:pointer;">QR: PSK</button>
    </div>
    <div id="vpn-qr-container" style="background:var(--bg3);border-radius:10px;padding:16px;display:inline-block;border:1px solid var(--border);min-width:60px;min-height:40px;">
      <div style="color:var(--muted);font-size:11px;font-family:var(--mono);">Click a button above to generate a QR code.</div>
    </div>
  </div>

  <!-- Peer Pairing Helper -->
  <div class="card" style="margin-top:14px;">
    <div class="card-hdr">🤝 Peer Pairing Helper</div>
    <p style="font-size:12px;color:var(--muted2);line-height:1.7;margin-bottom:14px;">
      Generate independent key pairs for both ends of a WireGuard tunnel and get two complete, pre-filled config files — ready to copy and deploy.
      If you've generated a PSK on the ⚡ Generate tab, it will appear in both configs automatically.
    </p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
      <div style="background:var(--bg3);border-radius:10px;padding:14px;border-left:3px solid var(--green);">
        <div style="font-family:var(--mono);font-size:10px;font-weight:700;color:var(--green);margin-bottom:10px;">SIDE A — SERVER</div>
        <button onclick="vpnGenPairSideA()" class="btn btn-primary" style="width:100%;padding:8px 0;font-size:12px;margin-bottom:10px;">⚡ Generate A Keys</button>
        <pre id="vpn-pair-cfg-a" style="font-family:var(--mono);font-size:10px;color:var(--muted2);line-height:1.7;background:var(--bg2);border-radius:7px;padding:10px;overflow-x:auto;white-space:pre;border:1px solid var(--border);max-height:220px;overflow-y:auto;"># Generate Side A first</pre>
        <button id="vpn-copy-pair-a" onclick="vpnCopyPairA()" style="margin-top:8px;background:var(--bg2);border:1px solid var(--border);color:var(--text);padding:6px 12px;border-radius:6px;font-size:10px;font-family:var(--mono);cursor:pointer;">📋 Copy A Config</button>
      </div>
      <div style="background:var(--bg3);border-radius:10px;padding:14px;border-left:3px solid var(--cyan);">
        <div style="font-family:var(--mono);font-size:10px;font-weight:700;color:var(--cyan);margin-bottom:10px;">SIDE B — CLIENT</div>
        <button onclick="vpnGenPairSideB()" class="btn btn-primary" style="width:100%;padding:8px 0;font-size:12px;margin-bottom:10px;">⚡ Generate B Keys</button>
        <pre id="vpn-pair-cfg-b" style="font-family:var(--mono);font-size:10px;color:var(--muted2);line-height:1.7;background:var(--bg2);border-radius:7px;padding:10px;overflow-x:auto;white-space:pre;border:1px solid var(--border);max-height:220px;overflow-y:auto;"># Generate Side B first</pre>
        <button id="vpn-copy-pair-b" onclick="vpnCopyPairB()" style="margin-top:8px;background:var(--bg2);border:1px solid var(--border);color:var(--text);padding:6px 12px;border-radius:6px;font-size:10px;font-family:var(--mono);cursor:pointer;">📋 Copy B Config</button>
      </div>
    </div>
  </div>

</div><!-- /tab-tools -->

<!-- ══════════════════════════════════════════════════════ -->
<!--  TAB: HISTORY                                          -->
<!-- ══════════════════════════════════════════════════════ -->
<div id="vpn-tab-history" style="display:none;">
  <div class="card">
    <div class="card-hdr">📜 Key Generation History</div>
    <p style="font-size:12px;color:var(--muted2);line-height:1.7;margin-bottom:14px;">
      Last 10 key pairs generated this session. Stored in memory only — cleared on page refresh.
      Click <strong>↺ Restore</strong> to load any pair back into the Generate tab.
    </p>
    <div id="vpn-history-list">
      <div style="color:var(--muted);font-size:12px;text-align:center;padding:24px;font-family:var(--mono);">No keys generated this session yet.</div>
    </div>
  </div>
</div><!-- /tab-history -->
`;

    // Initialize Config Builder preview
    vpnRenderPeers();
    vpnUpdateConfigPreview();
  }

  document.addEventListener('DOMContentLoaded', vpnInit);

})();