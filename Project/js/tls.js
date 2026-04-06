// ═══════════════════════════════════════════════════
// TLS HANDSHAKE DEEP DIVE — tls-segment.js
// Scenarios: TLS 1.3, TLS 1.2, Session Resumption,
//            Certificate Validation, mTLS, Alerts
// Visual: Topology header + Wireshark ladder diagram
//         + Certificate Chain panel + Cipher Suite panel
// ═══════════════════════════════════════════════════

let tlsMode = 'tls13';
let tlsCurrentStep = 0, tlsPlaying = false, tlsPlayTimer = null;
let tlsRafId = null;
let tlsTimerId = null;
let tlsSpeedMode = 'normal';

// ─── Layout constants (match tcp-segment.js) ───
const TLS_CX   = 130;
const TLS_SX   = 630;
const TLS_HDR_H = 100;
const TLS_STEP_H = 72;

// ─── TLS State colour map ───
const TLS_STATE_COLORS = {
  'IDLE':           '#5a6080',
  'TCP_CONNECTED':  '#5b9cf6',
  'CLIENT_HELLO':   '#fbbf24',
  'SERVER_HELLO':   '#f97316',
  'NEGOTIATING':    '#a78bfa',
  'CERT_VERIFY':    '#38d9c0',
  'HANDSHAKING':    '#fbbf24',
  'SESSION_TICKET': '#a78bfa',
  'ESTABLISHED':    '#4ade80',
  'RESUMING':       '#38d9c0',
  'ALERT':          '#f87171',
  'CLOSED':         '#5a6080',
  'MUTUAL_AUTH':    '#f472b6',
};

// ─── Speed control ───
function tlsSetSpeed(s) {
  tlsSpeedMode = s;
  ['slow','normal','fast','manual'].forEach(x => {
    const el = document.getElementById('tls-speed-' + x);
    if (el) el.classList.toggle('active', x === s);
  });
}
function tlsGetSegDur()    { return {slow:2200, normal:1100, fast:480, manual:900}[tlsSpeedMode]; }
function tlsGetAutoDelay() { return {slow:5500, normal:2800, fast:1200, manual:999999}[tlsSpeedMode]; }

// ═══════════════════════════════════════════════════
// STEP DATA — 6 SCENARIOS
// ═══════════════════════════════════════════════════

const TLS_STEPS = {

  // ────────────────────────────────────────────────
  // SCENARIO 1: TLS 1.3 HANDSHAKE
  // ────────────────────────────────────────────────
  tls13: [
    {
      step:1, title:'Step 1 — TCP Connection Established (Foundation)',
      tag:'TCP', tagColor:'var(--blue)', tagBg:'rgba(91,156,246,0.12)',
      desc:'TLS always runs <strong>on top of TCP</strong>. Before any TLS message is sent, the 3-way TCP handshake must complete: SYN → SYN-ACK → ACK. This costs <strong>1 RTT</strong>. TLS 1.3 then adds <strong>1 more RTT</strong> for the handshake (vs TLS 1.2 which adds 2 RTT). Total: 2 RTT to first byte.',
      dir:'c2s', label:'TCP SYN / SYN-ACK / ACK', sub:'Port 443  TCP 3-way handshake complete  (1 RTT)',
      arrowColor:'#5b9cf6', clientState:'TCP_CONNECTED', serverState:'TCP_CONNECTED',
      cipher:null, cert:null,
      fields:[
        {k:'Transport',    v:'TCP port 443  (HTTPS)',           c:'#5b9cf6'},
        {k:'TCP cost',     v:'1 RTT  (SYN → SYN-ACK → ACK)'},
        {k:'TLS 1.3 total',v:'1 RTT TCP + 1 RTT TLS = 2 RTT',  c:'#4ade80'},
        {k:'TLS 1.2 total',v:'1 RTT TCP + 2 RTT TLS = 3 RTT',  c:'#f87171'},
        {k:'TLS 1.3 0-RTT',v:'Resumption: data in first flight!',c:'#38d9c0'},
        {k:'QUIC / HTTP3', v:'0 RTT handshake (UDP-based)'},
        {k:'Port 443',     v:'HTTPS / TLS default port'},
        {k:'Port 8443',    v:'Alternative HTTPS / dev / proxies'},
      ],
    },
    {
      step:2, title:'Step 2 — ClientHello (TLS 1.3)',
      tag:'ClientHello', tagColor:'var(--amber)', tagBg:'rgba(251,191,36,0.12)',
      desc:'Client sends <strong>ClientHello</strong> — the first TLS record. Key TLS 1.3 change: client immediately sends <strong>Key Share</strong> (public key for key exchange) along with supported cipher suites and extensions. This is what enables 1-RTT — the server can immediately derive keys without waiting.',
      dir:'c2s', label:'ClientHello', sub:'TLS 1.3  +  key_share  +  supported_groups  +  SNI',
      arrowColor:'#fbbf24', clientState:'CLIENT_HELLO', serverState:'TCP_CONNECTED',
      cipher:{ suite:'(negotiating)', kex:'x25519 key share sent', auth:'—', enc:'—', mac:'—' },
      cert:null,
      fields:[
        {k:'TLS Version',  v:'0x0303 (TLS 1.2 compat) + ext 0x0304',c:'#fbbf24'},
        {k:'Random',       v:'32 bytes  (nonce for key derivation)'},
        {k:'Key Share',    v:'x25519 public key  (ECDH)',           c:'#38d9c0'},
        {k:'Cipher Suites',v:'TLS_AES_256_GCM_SHA384, AES_128, CC20'},
        {k:'SNI',          v:'server_name extension → virtual hosting',c:'#a78bfa'},
        {k:'ALPN',         v:'h2, http/1.1  (protocol negotiation)'},
        {k:'Supported Groups',v:'x25519, secp256r1, secp384r1'},
        {k:'PSK Mode',     v:'psk_ke / psk_dhe  (for resumption)'},
      ],
    },
    {
      step:3, title:'Step 3 — ServerHello + Key Derivation',
      tag:'ServerHello', tagColor:'var(--green)', tagBg:'rgba(74,222,128,0.12)',
      desc:'Server replies with <strong>ServerHello</strong> containing its Key Share (x25519 public key). Both sides now independently perform <strong>ECDH key exchange</strong> and derive the same shared secret — without ever transmitting it! Keys are then expanded using <strong>HKDF</strong> into handshake traffic keys.',
      dir:'s2c', label:'ServerHello + KeyShare', sub:'Selected: TLS_AES_256_GCM_SHA384  +  x25519 key share',
      arrowColor:'#4ade80', clientState:'NEGOTIATING', serverState:'SERVER_HELLO',
      cipher:{ suite:'TLS_AES_256_GCM_SHA384', kex:'x25519 ECDH', auth:'(pending cert)', enc:'AES-256-GCM', mac:'SHA-384 (AEAD)' },
      cert:null,
      fields:[
        {k:'Cipher Suite', v:'TLS_AES_256_GCM_SHA384',            c:'#4ade80'},
        {k:'Key Share',    v:'Server x25519 public key',           c:'#38d9c0'},
        {k:'ECDH result',  v:'Both derive same shared secret!'},
        {k:'HKDF',         v:'Key derivation (RFC 5869)',          c:'#a78bfa'},
        {k:'Keys derived', v:'Client/Server handshake traffic keys'},
        {k:'Forward Secrecy',v:'✓ Ephemeral keys — PFS guaranteed', c:'#4ade80'},
        {k:'No RSA KEX',   v:'TLS 1.3 removed static RSA exchange', c:'#4ade80'},
        {k:'Encrypted from',v:'ALL subsequent records encrypted!',  c:'#38d9c0'},
      ],
    },
    {
      step:4, title:'Step 4 — EncryptedExtensions + Certificate (Encrypted!)',
      tag:'ENCRYPTED', tagColor:'var(--cyan)', tagBg:'rgba(56,217,192,0.12)',
      desc:'<strong>TLS 1.3 key improvement:</strong> The certificate is sent <em>encrypted</em> using handshake keys. In TLS 1.2, the certificate was sent in plaintext — exposing the server identity to passive observers. Now an attacker cannot even see which certificate is presented. SNI still leaks the hostname (ECH addresses this).',
      dir:'s2c', label:'EncryptedExts + Certificate', sub:'🔒 Encrypted with handshake keys  — cert hidden!',
      arrowColor:'#38d9c0', clientState:'NEGOTIATING', serverState:'CERT_VERIFY',
      cipher:{ suite:'TLS_AES_256_GCM_SHA384', kex:'x25519 ECDH ✓', auth:'RSA-PSS / ECDSA', enc:'AES-256-GCM', mac:'SHA-384 (AEAD)' },
      cert:{ subject:'*.example.com', issuer:'DigiCert TLS RSA SHA256 G2', valid:'2024-01-01 → 2025-01-01', san:'example.com, www.example.com', keysize:'RSA 2048 / EC P-256', chain:'Leaf → Intermediate → Root', ocsp:'Must-Staple enabled', ct:'Signed Certificate Timestamps ✓' },
      fields:[
        {k:'EncryptedExts', v:'ALPN result, server max fragment'},
        {k:'Certificate',   v:'X.509 DER-encoded  (encrypted!)',   c:'#38d9c0'},
        {k:'TLS 1.3 win',   v:'Cert is hidden from passive sniffers',c:'#4ade80'},
        {k:'TLS 1.2',       v:'Cert sent in plaintext — visible!',  c:'#f87171'},
        {k:'SNI leak',      v:'Hostname still visible in ClientHello'},
        {k:'ECH',           v:'Encrypted ClientHello  — hides SNI', c:'#a78bfa'},
        {k:'Cert type',     v:'RSA 2048, EC P-256, or Ed25519'},
        {k:'OCSP Staple',   v:'Revocation status bundled in handshake'},
      ],
    },
    {
      step:5, title:'Step 5 — CertificateVerify + Finished (Server)',
      tag:'CertVerify', tagColor:'var(--purple)', tagBg:'rgba(167,139,250,0.12)',
      desc:'Server sends <strong>CertificateVerify</strong>: a digital signature over the entire handshake transcript using its private key. This proves the server owns the certificate\'s private key. Then <strong>Finished</strong>: an HMAC over the transcript using handshake keys — proves key derivation integrity.',
      dir:'s2c', label:'CertVerify + Finished', sub:'Signature over transcript + HMAC Finished  (🔒 encrypted)',
      arrowColor:'#a78bfa', clientState:'NEGOTIATING', serverState:'HANDSHAKING',
      cipher:{ suite:'TLS_AES_256_GCM_SHA384', kex:'x25519 ECDH ✓', auth:'RSA-PSS ✓', enc:'AES-256-GCM', mac:'SHA-384 (AEAD)' },
      cert:{ subject:'*.example.com', issuer:'DigiCert TLS RSA SHA256 G2', valid:'2024-01-01 → 2025-01-01', san:'example.com, www.example.com', keysize:'RSA 2048 / EC P-256', chain:'Leaf → Intermediate → Root', ocsp:'Must-Staple ✓  (stapled in handshake)', ct:'SCTs ✓  (CT log verified)' },
      fields:[
        {k:'CertVerify',   v:'Signature(private_key, transcript)',  c:'#a78bfa'},
        {k:'Algorithm',    v:'RSA-PSS-RSAE-SHA256 or ECDSA'},
        {k:'Proves',       v:'Server owns the private key!',        c:'#4ade80'},
        {k:'Transcript',   v:'Hash of all messages so far'},
        {k:'Finished',     v:'HMAC(handshake_key, transcript)',     c:'#38d9c0'},
        {k:'Proves',       v:'Key derivation integrity',            c:'#4ade80'},
        {k:'No separate',  v:'TLS 1.3: no ChangeCipherSpec needed', c:'#4ade80'},
        {k:'Application',  v:'Server can now send app data early!'},
      ],
    },
    {
      step:6, title:'Step 6 — Client Finished → ESTABLISHED 🎉',
      tag:'Finished', tagColor:'var(--green)', tagBg:'rgba(74,222,128,0.12)',
      desc:'Client verifies server Finished, then sends its own <strong>Finished</strong> message. Both sides derive <strong>application traffic keys</strong> from the master secret using HKDF. The TLS 1.3 handshake is complete in <strong>1 RTT</strong>. The connection is now fully encrypted and authenticated.',
      dir:'c2s', label:'Finished', sub:'Client Finished → Application keys derived → ESTABLISHED',
      arrowColor:'#4ade80', clientState:'ESTABLISHED', serverState:'ESTABLISHED',
      cipher:{ suite:'TLS_AES_256_GCM_SHA384', kex:'x25519 ECDH ✓', auth:'RSA-PSS ✓', enc:'AES-256-GCM 🔒', mac:'SHA-384 AEAD ✓' },
      cert:{ subject:'*.example.com', issuer:'DigiCert TLS RSA SHA256 G2', valid:'2024-01-01 → 2025-01-01', san:'example.com, www.example.com', keysize:'RSA 2048 / EC P-256', chain:'Leaf → Intermediate → Root ✓', ocsp:'Revocation: OK ✓', ct:'CT log verified ✓' },
      fields:[
        {k:'Client Finished',v:'HMAC(handshake_key, transcript)',   c:'#4ade80'},
        {k:'App keys',      v:'Derived via HKDF from master secret',c:'#38d9c0'},
        {k:'TLS 1.3 cost',  v:'1 RTT  (vs 2 RTT in TLS 1.2)',      c:'#4ade80'},
        {k:'Record type',   v:'application_data (type 23)'},
        {k:'Key separation',v:'Client write ≠ Server write keys'},
        {k:'Session ticket',v:'Server may send NewSessionTicket now'},
        {k:'0-RTT ready',   v:'Resumption: send data immediately!', c:'#38d9c0'},
        {k:'SSLKEYLOGFILE', v:'Wireshark TLS decrypt via key log'},
      ],
    },
    {
      step:7, title:'Step 7 — NewSessionTicket (0-RTT Setup)',
      tag:'SESSION TICKET', tagColor:'var(--purple)', tagBg:'rgba(167,139,250,0.12)',
      desc:'After Finished, the server optionally sends a <strong>NewSessionTicket</strong>. This is a PSK (Pre-Shared Key) wrapped in a server-encrypted ticket. The client can use it on the next connection to skip the handshake entirely — sending application data in the <strong>first flight (0-RTT)</strong>. Risk: replay attacks.',
      dir:'s2c', label:'NewSessionTicket', sub:'PSK ticket for 0-RTT resumption  (encrypted)',
      arrowColor:'#a78bfa', clientState:'ESTABLISHED', serverState:'ESTABLISHED',
      cipher:{ suite:'TLS_AES_256_GCM_SHA384', kex:'x25519 ECDH ✓', auth:'RSA-PSS ✓', enc:'AES-256-GCM 🔒', mac:'SHA-384 AEAD ✓' },
      cert:{ subject:'*.example.com', issuer:'DigiCert TLS RSA SHA256 G2', valid:'2024-01-01 → 2025-01-01', san:'example.com, www.example.com', keysize:'RSA 2048 / EC P-256', chain:'Leaf → Intermediate → Root ✓', ocsp:'Revocation: OK ✓', ct:'CT log verified ✓' },
      fields:[
        {k:'NewSessionTicket',v:'Server-encrypted PSK blob',        c:'#a78bfa'},
        {k:'Ticket lifetime',v:'Typically 7 days max (RFC 8446)'},
        {k:'0-RTT use',      v:'Client sends data in first flight!', c:'#38d9c0'},
        {k:'0-RTT risk',     v:'Replay attacks on non-idempotent ops',c:'#f87171'},
        {k:'Replay defense', v:'Single-use tickets / time window'},
        {k:'Anti-replay',    v:'ClientHello.random + ticket age'},
        {k:'HTTP GET',       v:'Safe for 0-RTT  (idempotent)'},
        {k:'HTTP POST',      v:'Risky for 0-RTT  (not idempotent!)', c:'#fbbf24'},
      ],
    },
  ],

  // ────────────────────────────────────────────────
  // SCENARIO 2: TLS 1.2 HANDSHAKE
  // ────────────────────────────────────────────────
  tls12: [
    {
      step:1, title:'Step 1 — ClientHello (TLS 1.2)',
      tag:'ClientHello', tagColor:'var(--amber)', tagBg:'rgba(251,191,36,0.12)',
      desc:'Client sends <strong>ClientHello</strong> with TLS version 0x0303, a 32-byte random, session ID (if resuming), cipher suites list, and extensions. <strong>Key difference from TLS 1.3:</strong> No key material is sent yet — key exchange happens in a separate round trip. This is why TLS 1.2 costs 2 RTT.',
      dir:'c2s', label:'ClientHello', sub:'TLS 1.2  Seq of cipher suites  No key material yet',
      arrowColor:'#fbbf24', clientState:'CLIENT_HELLO', serverState:'TCP_CONNECTED',
      cipher:{ suite:'(negotiating)', kex:'RSA or ECDHE (TBD)', auth:'—', enc:'—', mac:'—' },
      cert:null,
      fields:[
        {k:'TLS Version',  v:'0x0303  (TLS 1.2)',                  c:'#fbbf24'},
        {k:'ClientRandom', v:'32 bytes  (time + random)'},
        {k:'Session ID',   v:'For resumption  (legacy)'},
        {k:'Cipher Suites',v:'TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384…'},
        {k:'No key share', v:'Unlike TLS 1.3 — keys come later',   c:'#f87171'},
        {k:'Extensions',   v:'SNI, ALPN, EC point formats, etc.'},
        {k:'Compression',  v:'Must be null  (CRIME attack killed it)',c:'#f87171'},
        {k:'Renegotiation',v:'RFC 5746 secure renegotiation ext'},
      ],
    },
    {
      step:2, title:'Step 2 — ServerHello + Certificate (Plaintext!)',
      tag:'ServerHello', tagColor:'var(--green)', tagBg:'rgba(74,222,128,0.12)',
      desc:'Server sends <strong>ServerHello</strong> (chosen cipher/version), then the <strong>Certificate</strong> in <em>plaintext</em>. Anyone intercepting the TLS handshake can read the certificate — including the server identity. This is a privacy concern addressed in TLS 1.3. The certificate chain must be validated next.',
      dir:'s2c', label:'ServerHello + Certificate', sub:'Cert sent in PLAINTEXT — server identity visible!',
      arrowColor:'#4ade80', clientState:'NEGOTIATING', serverState:'SERVER_HELLO',
      cipher:{ suite:'TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384', kex:'ECDHE (server params pending)', auth:'RSA', enc:'AES-256-GCM', mac:'SHA-384' },
      cert:{ subject:'*.example.com', issuer:'DigiCert TLS RSA SHA256 G2', valid:'2024-01-01 → 2025-01-01', san:'example.com, www.example.com', keysize:'RSA 2048', chain:'Leaf → Intermediate → Root', ocsp:'Must check separately', ct:'SCTs in extension' },
      fields:[
        {k:'ServerHello',  v:'Chosen cipher + version + ServerRandom'},
        {k:'Certificate',  v:'X.509 chain  IN PLAINTEXT!',          c:'#f87171'},
        {k:'TLS 1.2 leak', v:'Server identity exposed to passive tap',c:'#f87171'},
        {k:'TLS 1.3 fix',  v:'Certificate is encrypted',            c:'#4ade80'},
        {k:'Cert chain',   v:'Leaf → Intermediate → Root CA'},
        {k:'Client must',  v:'Validate chain up to trusted root'},
        {k:'CRL / OCSP',   v:'Revocation check (may be slow)'},
        {k:'Next',         v:'ServerKeyExchange + ServerHelloDone'},
      ],
    },
    {
      step:3, title:'Step 3 — ServerKeyExchange + ServerHelloDone',
      tag:'ServerKEX', tagColor:'var(--cyan)', tagBg:'rgba(56,217,192,0.12)',
      desc:'For ECDHE cipher suites, the server sends <strong>ServerKeyExchange</strong> with its ephemeral EC public key, signed with its certificate private key. This proves the server owns the key and enables <strong>Perfect Forward Secrecy (PFS)</strong>. Static RSA suites skip this message — but also lose PFS.',
      dir:'s2c', label:'ServerKeyExchange + HelloDone', sub:'ECDHE public key  +  signature  +  ServerHelloDone',
      arrowColor:'#38d9c0', clientState:'NEGOTIATING', serverState:'CERT_VERIFY',
      cipher:{ suite:'TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384', kex:'ECDHE secp256r1 ephemeral key', auth:'RSA signature ✓', enc:'AES-256-GCM', mac:'SHA-384' },
      cert:{ subject:'*.example.com', issuer:'DigiCert TLS RSA SHA256 G2', valid:'2024-01-01 → 2025-01-01', san:'example.com, www.example.com', keysize:'RSA 2048', chain:'Leaf → Intermediate → Root', ocsp:'Must check', ct:'SCTs ✓' },
      fields:[
        {k:'ServerKEX',    v:'ECDHE ephemeral public key',          c:'#38d9c0'},
        {k:'Signature',    v:'RSA sign(private_key, params)',        c:'#38d9c0'},
        {k:'Curve',        v:'secp256r1  (P-256) or x25519'},
        {k:'PFS',          v:'✓ Ephemeral key — old traffic safe',  c:'#4ade80'},
        {k:'Static RSA',   v:'No ServerKEX — but NO PFS!',          c:'#f87171'},
        {k:'FREAK',        v:'Attack on export RSA — patch now',    c:'#f87171'},
        {k:'LOGJAM',       v:'Weak DH (< 2048 bits) — also patch',  c:'#f87171'},
        {k:'ServerHelloDone',v:'Server finished sending — client\'s turn'},
      ],
    },
    {
      step:4, title:'Step 4 — ClientKeyExchange + ChangeCipherSpec',
      tag:'ClientKEX', tagColor:'var(--blue)', tagBg:'rgba(91,156,246,0.12)',
      desc:'Client sends <strong>ClientKeyExchange</strong> (its ECDHE public key or encrypted pre-master secret). Both sides independently compute the <strong>Pre-Master Secret → Master Secret → Session Keys</strong> using PRF. Then <strong>ChangeCipherSpec</strong> signals: "Switching to encrypted mode now."',
      dir:'c2s', label:'ClientKeyExchange + CCS', sub:'ECDHE pub key  →  Master Secret derived  →  CCS',
      arrowColor:'#5b9cf6', clientState:'HANDSHAKING', serverState:'CERT_VERIFY',
      cipher:{ suite:'TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384', kex:'ECDHE ✓ shared secret', auth:'RSA ✓', enc:'AES-256-GCM (switching)', mac:'SHA-384' },
      cert:{ subject:'*.example.com', issuer:'DigiCert TLS RSA SHA256 G2', valid:'2024-01-01 → 2025-01-01', san:'example.com, www.example.com', keysize:'RSA 2048', chain:'Leaf → Intermediate → Root ✓', ocsp:'Checked', ct:'SCTs ✓' },
      fields:[
        {k:'ClientKEX',    v:'Client ECDHE public key',             c:'#5b9cf6'},
        {k:'PMS',          v:'Pre-Master Secret  (ECDH result)'},
        {k:'Master Secret',v:'PRF(PMS, ClientRandom, ServerRandom)'},
        {k:'Keys derived', v:'Client/Server Write Key + IV + MAC'},
        {k:'PRF',          v:'Pseudo-Random Function  (SHA-256/384)'},
        {k:'CCS',          v:'ChangeCipherSpec — legacy TLS signal',c:'#fbbf24'},
        {k:'TLS 1.3',      v:'No CCS needed — removed',            c:'#4ade80'},
        {k:'Middlebox',    v:'CCS kept in TLS 1.3 for compat only'},
      ],
    },
    {
      step:5, title:'Step 5 — Client Finished + Server CCS + Finished',
      tag:'Finished', tagColor:'var(--green)', tagBg:'rgba(74,222,128,0.12)',
      desc:'Client sends <strong>Finished</strong> (PRF hash of handshake transcript — first encrypted message). Server responds with its own <strong>ChangeCipherSpec</strong> and <strong>Finished</strong>. When both Finished messages are verified, the handshake is complete. This is the <strong>end of RTT 2</strong>.',
      dir:'s2c', label:'Server CCS + Finished', sub:'Server Finished → ESTABLISHED  (end of RTT 2)',
      arrowColor:'#4ade80', clientState:'ESTABLISHED', serverState:'ESTABLISHED',
      cipher:{ suite:'TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384', kex:'ECDHE ✓', auth:'RSA ✓', enc:'AES-256-GCM 🔒', mac:'SHA-384 ✓' },
      cert:{ subject:'*.example.com', issuer:'DigiCert TLS RSA SHA256 G2', valid:'2024-01-01 → 2025-01-01', san:'example.com, www.example.com', keysize:'RSA 2048', chain:'Leaf → Intermediate → Root ✓', ocsp:'Revocation: OK ✓', ct:'CT log verified ✓' },
      fields:[
        {k:'Client Finished',v:'PRF(master_secret, "client finished", hash)',c:'#4ade80'},
        {k:'First encrypted',v:'Finished is the first encrypted record'},
        {k:'Server Finished',v:'PRF(master_secret, "server finished", hash)'},
        {k:'Total RTT',     v:'2 RTT  (1 TCP + 2 TLS)',             c:'#f87171'},
        {k:'TLS 1.3',       v:'1 RTT  (1 TCP + 1 TLS)',             c:'#4ade80'},
        {k:'Wireshark',     v:'Right-click → Protocol Preferences → TLS'},
        {k:'SSLKEYLOGFILE', v:'Export master secret for Wireshark decrypt'},
        {k:'Session cache', v:'Server may store session for resumption'},
      ],
    },
  ],

  // ────────────────────────────────────────────────
  // SCENARIO 3: SESSION RESUMPTION (TLS 1.3 0-RTT)
  // ────────────────────────────────────────────────
  resumption: [
    {
      step:1, title:'Step 1 — Client Has Ticket from Previous Session',
      tag:'HAS TICKET', tagColor:'var(--cyan)', tagBg:'rgba(56,217,192,0.12)',
      desc:'From a <strong>previous TLS 1.3 session</strong>, the client received a NewSessionTicket containing a PSK (Pre-Shared Key). The client stores this ticket. On reconnecting to the same server, the client can use this ticket to skip most of the handshake entirely.',
      dir:'none', label:'Client has PSK ticket  (from prior session)', arrowColor:'#38d9c0',
      clientState:'IDLE', serverState:'IDLE',
      cipher:null, cert:null,
      fields:[
        {k:'PSK',          v:'Pre-Shared Key  (from NewSessionTicket)',c:'#38d9c0'},
        {k:'Ticket',       v:'Server-encrypted blob  (opaque to client)'},
        {k:'Lifetime',     v:'7 days max  (RFC 8446)'},
        {k:'Storage',      v:'Client keeps: ticket + PSK + ticket age'},
        {k:'Server',       v:'Can rotate keys — ticket has age limit'},
        {k:'TLS 1.2 equiv',v:'Session ID  /  Session Ticket (RFC 5077)'},
        {k:'Benefit',      v:'0-RTT or 1-RTT resumption',            c:'#4ade80'},
        {k:'Risk',         v:'0-RTT has replay vulnerability',        c:'#f87171'},
      ],
    },
    {
      step:2, title:'Step 2 — ClientHello with PSK + Early Data (0-RTT!)',
      tag:'0-RTT!', tagColor:'var(--cyan)', tagBg:'rgba(56,217,192,0.12)',
      desc:'Client sends <strong>ClientHello with PSK extension</strong> and immediately sends <strong>early_data (0-RTT data)</strong> in the same flight. The application data (e.g. HTTP GET) is encrypted with the PSK-derived key — before the server even responds! This eliminates the handshake latency completely.',
      dir:'c2s', label:'ClientHello + PSK + 0-RTT Data', sub:'HTTP GET / encrypted in first flight  →  0 RTT!',
      arrowColor:'#38d9c0', clientState:'RESUMING', serverState:'IDLE',
      cipher:{ suite:'TLS_AES_256_GCM_SHA384 (from ticket)', kex:'PSK resumption', auth:'PSK (no cert needed)', enc:'AES-256-GCM (early keys)', mac:'SHA-384' },
      cert:null,
      fields:[
        {k:'PSK extension', v:'ticket + obfuscated_ticket_age',     c:'#38d9c0'},
        {k:'early_data',    v:'Application data in first flight!',  c:'#38d9c0'},
        {k:'Encrypted with',v:'Early traffic key  (PSK-derived)'},
        {k:'0-RTT latency', v:'Zero handshake RTT!',                c:'#4ade80'},
        {k:'Replay risk',   v:'Early data CAN be replayed by attacker',c:'#f87171'},
        {k:'Safe for',      v:'HTTP GET  (idempotent)'},
        {k:'Risky for',     v:'HTTP POST / payments / state change!',c:'#f87171'},
        {k:'Also sends',    v:'key_share for full 1-RTT fallback'},
      ],
    },
    {
      step:3, title:'Step 3 — Server Accepts / Rejects 0-RTT',
      tag:'SERVER ACCEPT', tagColor:'var(--green)', tagBg:'rgba(74,222,128,0.12)',
      desc:'Server finds the PSK in its ticket store, decrypts the ticket, and validates the ticket age. If valid, it sends <strong>ServerHello with PSK</strong>, signals <strong>early_data accepted</strong>, and immediately processes the 0-RTT application data. Full 1-RTT handshake still completes for forward secrecy.',
      dir:'s2c', label:'ServerHello + PSK accepted + early_data ✓', sub:'0-RTT accepted  Handshake continues for FS',
      arrowColor:'#4ade80', clientState:'RESUMING', serverState:'HANDSHAKING',
      cipher:{ suite:'TLS_AES_256_GCM_SHA384', kex:'PSK ✓', auth:'PSK ✓ (server verified)', enc:'AES-256-GCM 🔒', mac:'SHA-384 AEAD' },
      cert:null,
      fields:[
        {k:'PSK matched',  v:'Server decrypted + validated ticket',  c:'#4ade80'},
        {k:'early_data',   v:'accepted → 0-RTT data processed ✓',   c:'#4ade80'},
        {k:'Ticket age',   v:'Validated within allowed window'},
        {k:'If rejected',  v:'Client falls back to 1-RTT handshake'},
        {k:'Still does',   v:'Full handshake for new FS session keys'},
        {k:'End-of-early', v:'client signals EndOfEarlyData record'},
        {k:'Anti-replay',  v:'Single-use ticket + age check'},
        {k:'No cert',      v:'PSK resumption skips cert exchange!',  c:'#4ade80'},
      ],
    },
    {
      step:4, title:'Step 4 — ESTABLISHED with New Session Keys',
      tag:'ESTABLISHED', tagColor:'var(--green)', tagBg:'rgba(74,222,128,0.12)',
      desc:'The full TLS 1.3 handshake completes (Finished messages exchanged) and <strong>new application traffic keys</strong> are derived — separate from the PSK and the 0-RTT early keys. Future traffic uses these fresh keys. The server may issue a <strong>new ticket</strong> for the next resumption.',
      dir:'c2s', label:'Finished → New session keys', sub:'Full FS keys derived  New ticket issued  ESTABLISHED',
      arrowColor:'#4ade80', clientState:'ESTABLISHED', serverState:'ESTABLISHED',
      cipher:{ suite:'TLS_AES_256_GCM_SHA384', kex:'PSK + ECDHE (hybrid)', auth:'PSK ✓', enc:'AES-256-GCM 🔒', mac:'SHA-384 AEAD ✓' },
      cert:null,
      fields:[
        {k:'Total RTT',    v:'0 RTT for app data  (0-RTT path)',    c:'#4ade80'},
        {k:'New app keys', v:'Derived from PSK + handshake',        c:'#38d9c0'},
        {k:'PFS',          v:'✓  (ECDHE still done alongside PSK)',  c:'#4ade80'},
        {k:'New ticket',   v:'Server may issue fresh NewSessionTicket'},
        {k:'TLS 1.2 comp', v:'Session Ticket (RFC 5077) — similar idea'},
        {k:'TLS 1.2 diff', v:'No 0-RTT in TLS 1.2 resumption'},
        {k:'CDN/Load bal', v:'Distributed ticket stores needed at scale'},
        {k:'Debug',        v:'openssl s_client -sess_in / -sess_out'},
      ],
    },
  ],

  // ────────────────────────────────────────────────
  // SCENARIO 4: CERTIFICATE VALIDATION (Deep Dive)
  // ────────────────────────────────────────────────
  certvalidation: [
    {
      step:1, title:'Step 1 — What Is an X.509 Certificate?',
      tag:'X.509', tagColor:'var(--cyan)', tagBg:'rgba(56,217,192,0.12)',
      desc:'An <strong>X.509 certificate</strong> is a digitally signed data structure binding a <strong>public key</strong> to an <strong>identity</strong>. It contains: subject name, subject public key, issuer name, validity period, extensions (SAN, Key Usage, etc.), and the issuer\'s digital signature. Standardized in RFC 5280.',
      dir:'none', label:'X.509 Certificate Structure', arrowColor:'#38d9c0',
      clientState:'IDLE', serverState:'IDLE',
      cipher:null,
      cert:{ subject:'*.example.com', issuer:'DigiCert TLS RSA SHA256 G2', valid:'2024-01-01 → 2025-01-01', san:'example.com, www.example.com', keysize:'RSA 2048 / EC P-256', chain:'Leaf → Intermediate → Root', ocsp:'Must-Staple (RFC 7633)', ct:'Certificate Transparency required' },
      fields:[
        {k:'Version',      v:'X.509 v3  (RFC 5280)'},
        {k:'Serial',       v:'Unique per CA  (used in revocation)'},
        {k:'Subject',      v:'CN=*.example.com  (or SAN)'},
        {k:'SAN',          v:'Subject Alternative Name — real field!',c:'#38d9c0'},
        {k:'CN deprecated',v:'Browsers ignore CN if SAN present',   c:'#fbbf24'},
        {k:'Public Key',   v:'RSA 2048+  or  EC P-256+  or Ed25519'},
        {k:'Key Usage',    v:'digitalSignature, keyEncipherment'},
        {k:'Ext Key Usage',v:'serverAuth  (1.3.6.1.5.5.7.3.1)'},
      ],
    },
    {
      step:2, title:'Step 2 — Chain of Trust (Root → Intermediate → Leaf)',
      tag:'CHAIN', tagColor:'var(--purple)', tagBg:'rgba(167,139,250,0.12)',
      desc:'Certificates form a <strong>chain of trust</strong>. The <strong>Leaf cert</strong> (server) is signed by an <strong>Intermediate CA</strong>. The Intermediate is signed by a <strong>Root CA</strong>. The Root CA is self-signed and trusted by your OS/browser. Intermediates are online; Roots are kept offline (air-gapped) for security.',
      dir:'none', label:'Root → Intermediate → Leaf chain', arrowColor:'#a78bfa',
      clientState:'IDLE', serverState:'IDLE',
      cipher:null,
      cert:{ subject:'*.example.com  (Leaf)', issuer:'DigiCert TLS RSA SHA256 G2  (Intermediate)', valid:'2024-01-01 → 2025-01-01', san:'example.com, www.example.com', keysize:'RSA 2048 (leaf)  /  RSA 4096 (intermediate)', chain:'Leaf (1yr) → Intermediate (5yr) → Root (25yr)', ocsp:'OCSP URL in AIA extension', ct:'Signed Certificate Timestamps' },
      fields:[
        {k:'Root CA',      v:'Self-signed  25yr  air-gapped  trusted', c:'#4ade80'},
        {k:'Intermediate', v:'Signed by Root  5yr  online',            c:'#fbbf24'},
        {k:'Leaf cert',    v:'Signed by Intermediate  90d–1yr',        c:'#38d9c0'},
        {k:'Why chain?',   v:'Root offline = harder to compromise'},
        {k:'Trust store',  v:'OS / Browser: ~150 trusted Root CAs'},
        {k:'Path length',  v:'Intermediate can be constrained (pathLen)'},
        {k:'Missing inter',v:'Common TAC issue! Send full chain',      c:'#f87171'},
        {k:'AIA',          v:'Authority Info Access — download inter'},
      ],
    },
    {
      step:3, title:'Step 3 — Client Validates the Chain',
      tag:'VALIDATION', tagColor:'var(--green)', tagBg:'rgba(74,222,128,0.12)',
      desc:'Client performs <strong>path validation</strong> per RFC 5280: (1) Each certificate\'s signature is verified using the issuer\'s public key. (2) Validity dates checked. (3) Subject matches the hostname (SAN). (4) Key Usage / Extended Key Usage checked. (5) Certificate not revoked. All must pass.',
      dir:'s2c', label:'Certificate chain from server', sub:'Leaf + Intermediate sent  Client validates chain',
      arrowColor:'#4ade80', clientState:'CERT_VERIFY', serverState:'CERT_VERIFY',
      cipher:{ suite:'(handshake)', kex:'(pending)', auth:'RSA chain validation', enc:'(pending)', mac:'(pending)' },
      cert:{ subject:'*.example.com', issuer:'DigiCert TLS RSA SHA256 G2', valid:'2024-01-01 → 2025-01-01  ✓', san:'example.com ✓  www.example.com ✓', keysize:'RSA 2048 ✓', chain:'Leaf ✓ → Intermediate ✓ → Root ✓', ocsp:'Checking revocation…', ct:'SCTs verified ✓' },
      fields:[
        {k:'Check 1',      v:'Signature valid? (verify with issuer pub key)',c:'#4ade80'},
        {k:'Check 2',      v:'NotBefore ≤ now ≤ NotAfter  (dates)',   c:'#4ade80'},
        {k:'Check 3',      v:'SAN matches hostname (RFC 6125)',        c:'#4ade80'},
        {k:'Check 4',      v:'Key Usage: serverAuth present?'},
        {k:'Check 5',      v:'Revocation: CRL or OCSP check'},
        {k:'Check 6',      v:'CT: Signed Certificate Timestamps valid'},
        {k:'Fail = alert', v:'certificate_unknown / bad_certificate',  c:'#f87171'},
        {k:'Pinning',      v:'HPKP (deprecated) / cert pinning in apps'},
      ],
    },
    {
      step:4, title:'Step 4 — Revocation: CRL vs OCSP vs OCSP Stapling',
      tag:'REVOCATION', tagColor:'var(--red)', tagBg:'rgba(248,113,113,0.12)',
      desc:'Certificates can be <strong>revoked</strong> before expiry (key compromise, CA error). Methods: <strong>CRL</strong> (Certificate Revocation List — periodic, large download), <strong>OCSP</strong> (Online Certificate Status Protocol — real-time query, privacy leak, latency), <strong>OCSP Stapling</strong> (server fetches and attaches signed OCSP response — best option).',
      dir:'none', label:'CRL / OCSP / Stapling comparison', arrowColor:'#f87171',
      clientState:'CERT_VERIFY', serverState:'CERT_VERIFY',
      cipher:null,
      cert:{ subject:'*.example.com', issuer:'DigiCert TLS RSA SHA256 G2', valid:'2024-01-01 → 2025-01-01', san:'example.com, www.example.com', keysize:'RSA 2048', chain:'Leaf → Intermediate → Root', ocsp:'OCSP Stapling: Signed response in TLS handshake ✓', ct:'SCTs ✓' },
      fields:[
        {k:'CRL',          v:'Download list — up to 24hr stale',     c:'#fbbf24'},
        {k:'OCSP',         v:'Real-time query — leaks hostnames!',   c:'#f87171'},
        {k:'OCSP Staple',  v:'Server staples signed OCSP response',  c:'#4ade80'},
        {k:'Must-Staple',  v:'RFC 7633 — cert demands stapling',     c:'#4ade80'},
        {k:'Soft-fail',    v:'Browsers ignore OCSP errors (bad!)',   c:'#f87171'},
        {k:'Hard-fail',    v:'Reject if OCSP unavailable (strict)',  c:'#4ade80'},
        {k:'CA/B Forum',   v:'Max cert lifetime = 398 days (2020)',  c:'#38d9c0'},
        {k:'90-day trend', v:"Let's Encrypt / Google push 90d max"},
      ],
    },
    {
      step:5, title:'Step 5 — Certificate Transparency (CT)',
      tag:'CT LOGS', tagColor:'var(--purple)', tagBg:'rgba(167,139,250,0.12)',
      desc:'<strong>Certificate Transparency (RFC 6962)</strong> requires all publicly trusted certs to be logged in public CT logs before browsers accept them. This makes it impossible for a CA to secretly issue a rogue certificate without detection. Chrome requires ≥2 SCTs (Signed Certificate Timestamps).',
      dir:'none', label:'Certificate Transparency logs', arrowColor:'#a78bfa',
      clientState:'CERT_VERIFY', serverState:'ESTABLISHED',
      cipher:null,
      cert:{ subject:'*.example.com', issuer:'DigiCert TLS RSA SHA256 G2', valid:'2024-01-01 → 2025-01-01', san:'example.com, www.example.com', keysize:'RSA 2048', chain:'Leaf → Intermediate → Root', ocsp:'Must-Staple ✓', ct:'SCT: Google Xenon 2024 ✓  Cloudflare Nimbus 2024 ✓' },
      fields:[
        {k:'CT logs',      v:'Public append-only certificate logs',  c:'#a78bfa'},
        {k:'SCT',          v:'Signed Certificate Timestamp  (proof)', c:'#a78bfa'},
        {k:'Chrome req',   v:'≥2 SCTs from different log operators', c:'#fbbf24'},
        {k:'Delivery',     v:'In cert ext / TLS ext / OCSP response'},
        {k:'Monitors',     v:'Domain owners watch logs for rogue certs'},
        {k:'RFC 9162',     v:'CT v2  (current standard)'},
        {k:'DigiCert',     v:'All certs CT-logged by default'},
        {k:'Catch',        v:'mis-issuance detected within minutes!', c:'#4ade80'},
      ],
    },
  ],

  // ────────────────────────────────────────────────
  // SCENARIO 5: mTLS — MUTUAL TLS
  // ────────────────────────────────────────────────
  mtls: [
    {
      step:1, title:'Step 1 — Standard TLS vs mTLS',
      tag:'mTLS INTRO', tagColor:'var(--pink)', tagBg:'rgba(244,114,182,0.12)',
      desc:'In standard TLS, only the <strong>server</strong> presents a certificate. The client is anonymous. In <strong>mTLS (Mutual TLS)</strong>, <strong>both</strong> the client AND server present certificates and verify each other. Used in zero-trust architectures, service mesh (Istio), API gateways, and client certificate auth.',
      dir:'none', label:'mTLS: both sides authenticate', arrowColor:'#f472b6',
      clientState:'IDLE', serverState:'IDLE',
      cipher:null, cert:null,
      fields:[
        {k:'Standard TLS', v:'Only server cert verified by client',  c:'#fbbf24'},
        {k:'mTLS',         v:'Both sides present + verify certs',    c:'#f472b6'},
        {k:'Use cases',    v:'Zero trust, service mesh, client auth'},
        {k:'Istio',        v:'mTLS between all microservices by default'},
        {k:'API gateways', v:'Kong, AWS API GW — client cert auth'},
        {k:'VPN',          v:'IPsec IKEv2 / WireGuard — similar concept'},
        {k:'vs username/pw',v:'mTLS stronger — phishing resistant!',  c:'#4ade80'},
        {k:'RFC 5246',     v:'TLS 1.2 client auth spec'},
      ],
    },
    {
      step:2, title:'Step 2 — ClientHello (Same as Standard TLS)',
      tag:'ClientHello', tagColor:'var(--amber)', tagBg:'rgba(251,191,36,0.12)',
      desc:'The ClientHello is identical to standard TLS. The client does not yet know if the server will request mutual authentication — that comes in the next step with <strong>CertificateRequest</strong>. The client must be provisioned with a client certificate and private key before the session.',
      dir:'c2s', label:'ClientHello', sub:'Same as standard TLS  Client cert provisioned locally',
      arrowColor:'#fbbf24', clientState:'CLIENT_HELLO', serverState:'IDLE',
      cipher:{ suite:'(negotiating)', kex:'x25519 key share', auth:'mTLS — both sides', enc:'AES-256-GCM', mac:'SHA-384' },
      cert:null,
      fields:[
        {k:'ClientHello',  v:'Identical to standard TLS 1.3'},
        {k:'Client cert',  v:'Must be pre-provisioned by PKI/CA'},
        {k:'PKCS#12',      v:'.p12/.pfx — cert + private key bundle'},
        {k:'PEM',          v:'.crt + .key — separate files'},
        {k:'Provisioning', v:'Manual / ACME / SCEP / EST (RFC 7030)'},
        {k:'Zero trust',   v:'Every service has its own identity cert'},
        {k:'SPIFFE',       v:'Secure Production Identity Framework',  c:'#a78bfa'},
        {k:'SVID',         v:'SPIFFE Verifiable Identity Document'},
      ],
    },
    {
      step:3, title:'Step 3 — Server Sends CertificateRequest',
      tag:'CertRequest', tagColor:'var(--pink)', tagBg:'rgba(244,114,182,0.12)',
      desc:'This is the key mTLS difference: server sends a <strong>CertificateRequest</strong> message after its own certificate. It lists acceptable CA names and signature algorithms. The client must respond with its certificate. If the client has no cert, it sends an empty Certificate message — server decides whether to abort.',
      dir:'s2c', label:'ServerHello + Cert + CertificateRequest', sub:'Server demands client certificate  (mTLS!)',
      arrowColor:'#f472b6', clientState:'NEGOTIATING', serverState:'CERT_VERIFY',
      cipher:{ suite:'TLS_AES_256_GCM_SHA384', kex:'x25519 ECDH', auth:'mTLS — awaiting client cert', enc:'AES-256-GCM', mac:'SHA-384' },
      cert:{ subject:'api.example.com (Server)', issuer:'Internal CA', valid:'2024-01-01 → 2025-01-01', san:'api.example.com', keysize:'EC P-256', chain:'Server Leaf → Internal Intermediate → Internal Root', ocsp:'Internal OCSP responder', ct:'Private CA — no public CT' },
      fields:[
        {k:'CertRequest',  v:'Sent by server inside EncryptedExts',  c:'#f472b6'},
        {k:'Acceptable CAs',v:'List of trusted client CA issuers'},
        {k:'Sig algos',    v:'RSA-PSS, ECDSA — what server accepts'},
        {k:'Client has cert',v:'Must send Certificate + CertVerify'},
        {k:'Client no cert',v:'Sends empty Certificate message'},
        {k:'Server choice',v:'Abort with alert or allow anonymous'},
        {k:'Internal CA',  v:'Private CA for internal service certs',  c:'#a78bfa'},
        {k:'Cert rotation',v:'SPIFFE SVID rotated every 1hr (Istio)'},
      ],
    },
    {
      step:4, title:'Step 4 — Client Sends Certificate + CertificateVerify',
      tag:'Client Cert', tagColor:'var(--pink)', tagBg:'rgba(244,114,182,0.12)',
      desc:'Client sends its own <strong>Certificate</strong> (encrypted, in TLS 1.3) and a <strong>CertificateVerify</strong> signed with its private key over the full transcript. The server validates the client cert chain against its trusted CA store. If invalid — <strong>alert: certificate_unknown</strong> and connection aborted.',
      dir:'c2s', label:'Client Certificate + CertVerify', sub:'Client identity proven by cert + private key signature',
      arrowColor:'#f472b6', clientState:'MUTUAL_AUTH', serverState:'CERT_VERIFY',
      cipher:{ suite:'TLS_AES_256_GCM_SHA384', kex:'x25519 ECDH ✓', auth:'mTLS — client cert sent', enc:'AES-256-GCM 🔒', mac:'SHA-384' },
      cert:{ subject:'client-svc-A (Client)', issuer:'Internal CA', valid:'2024-01-01 → 2024-04-01 (90d)', san:'spiffe://cluster.local/ns/prod/sa/svc-a', keysize:'EC P-256', chain:'Client Leaf → Internal Root', ocsp:'Short-lived — no revocation needed', ct:'Private CA — internal trust only' },
      fields:[
        {k:'Client Cert',  v:'X.509 with client identity  (encrypted!)',c:'#f472b6'},
        {k:'SPIFFE SAN',   v:'spiffe://cluster.local/ns/…  (workload)', c:'#a78bfa'},
        {k:'CertVerify',   v:'Signature proves client owns private key'},
        {k:'Short-lived',  v:'90d or 1hr cert → no revocation needed', c:'#4ade80'},
        {k:'Server checks',v:'Chain valid? SAN matches policy? Revoked?'},
        {k:'Fail',         v:'alert: certificate_required (TLS 1.3)',  c:'#f87171'},
        {k:'Istio SVID',   v:'Rotated hourly  (very short lived)',     c:'#38d9c0'},
        {k:'ACME cert',    v:'Automated cert issuance (RFC 8555)'},
      ],
    },
    {
      step:5, title:'Step 5 — Both Sides ESTABLISHED (Zero Trust!)',
      tag:'MUTUAL AUTH ✓', tagColor:'var(--pink)', tagBg:'rgba(244,114,182,0.12)',
      desc:'Both Finished messages are exchanged. Both sides have verified each other\'s identities via certificates and private key proofs. <strong>Zero-trust principle achieved</strong>: every connection is authenticated regardless of network location — no implicit trust from being "inside" the network perimeter.',
      dir:'s2c', label:'Server Finished → MUTUAL AUTH', sub:'Both identities verified  Zero trust established ✓',
      arrowColor:'#f472b6', clientState:'ESTABLISHED', serverState:'ESTABLISHED',
      cipher:{ suite:'TLS_AES_256_GCM_SHA384', kex:'x25519 ECDH ✓', auth:'mTLS — both verified ✓', enc:'AES-256-GCM 🔒', mac:'SHA-384 AEAD ✓' },
      cert:{ subject:'client-svc-A ↔ api.example.com', issuer:'Internal CA (both sides)', valid:'Both valid ✓', san:'SPIFFE IDs verified ✓', keysize:'EC P-256 (both)', chain:'Both chains verified ✓', ocsp:'Short-lived: no CRL needed ✓', ct:'Internal CA: CT not required' },
      fields:[
        {k:'Both verified', v:'Client identity + Server identity ✓',  c:'#f472b6'},
        {k:'Zero trust',   v:'No implicit trust from network position', c:'#4ade80'},
        {k:'SPIFFE',       v:'Workload identity standard  (CNCF)',     c:'#a78bfa'},
        {k:'Istio Envoy',  v:'Sidecar proxy handles mTLS automatically'},
        {k:'Cert rotation',v:'Automated — no manual cert management'},
        {k:'Wireshark',    v:'Can see client cert in TLS 1.2 capture'},
        {k:'TLS 1.3',      v:'Client cert is encrypted  (privacy ✓)',  c:'#4ade80'},
        {k:'Policy',       v:'Server can enforce cert attributes/OUs'},
      ],
    },
  ],

  // ────────────────────────────────────────────────
  // SCENARIO 6: TLS ALERTS & ERRORS
  // ────────────────────────────────────────────────
  alerts: [
    {
      step:1, title:'Step 1 — TLS Alert Protocol Overview',
      tag:'ALERTS', tagColor:'var(--red)', tagBg:'rgba(248,113,113,0.12)',
      desc:'<strong>TLS Alert Protocol</strong> is a sub-protocol of TLS for signaling errors and warnings. Every Alert has a <strong>Level</strong> (warning or fatal) and a <strong>Description</strong> (specific error code). A <strong>fatal</strong> alert immediately terminates the connection. After a fatal alert, no more records are sent.',
      dir:'none', label:'Alert protocol: Level + Description', arrowColor:'#f87171',
      clientState:'IDLE', serverState:'IDLE',
      cipher:null, cert:null,
      fields:[
        {k:'Alert Level',  v:'warning (1) or fatal (2)',              c:'#fbbf24'},
        {k:'Fatal',        v:'Connection terminated immediately',     c:'#f87171'},
        {k:'Warning',      v:'Connection may continue (close_notify)'},
        {k:'close_notify', v:'Graceful TLS shutdown  (must send!)',   c:'#4ade80'},
        {k:'Record type',  v:'0x15  (21 decimal) — Alert record'},
        {k:'TLS 1.3',      v:'All alerts are fatal except close_notify'},
        {k:'TLS 1.2',      v:'Some warnings allowed  (deprecated use)'},
        {k:'Wireshark',    v:'Filter: tls.alert_message.desc'},
      ],
    },
    {
      step:2, title:'Step 2 — certificate_unknown / bad_certificate',
      tag:'CERT ERROR', tagColor:'var(--red)', tagBg:'rgba(248,113,113,0.12)',
      desc:'<strong>Most common TLS alert in the field.</strong> Causes: (1) Self-signed cert not in trust store. (2) Missing intermediate CA. (3) Expired certificate. (4) Hostname mismatch (SAN doesn\'t match). (5) Revoked certificate. TAC engineers see this constantly — always check the chain first.',
      dir:'s2c', label:'Alert: certificate_unknown (46)', sub:'Fatal — connection aborted  Cert chain validation failed',
      arrowColor:'#f87171', clientState:'ALERT', serverState:'ALERT',
      cipher:null,
      cert:{ subject:'example.com (INVALID)', issuer:'Unknown / Self-signed', valid:'EXPIRED or UNTRUSTED', san:'MISMATCH or missing', keysize:'Unknown', chain:'INCOMPLETE — missing intermediate!', ocsp:'Cannot check — chain broken', ct:'Cannot verify' },
      fields:[
        {k:'Alert code',   v:'46 — certificate_unknown',            c:'#f87171'},
        {k:'Cause 1',      v:'Self-signed / not in trust store',    c:'#f87171'},
        {k:'Cause 2',      v:'Missing intermediate CA  (most common!)',c:'#f87171'},
        {k:'Cause 3',      v:'Certificate expired',                  c:'#f87171'},
        {k:'Cause 4',      v:'SAN mismatch (hostname ≠ cert SAN)',   c:'#f87171'},
        {k:'Cause 5',      v:'Revoked certificate  (OCSP/CRL)'},
        {k:'Debug',        v:'openssl s_client -connect host:443 -showcerts'},
        {k:'Fix',          v:'Send full chain: leaf + intermediates', c:'#4ade80'},
      ],
    },
    {
      step:3, title:'Step 3 — handshake_failure (40)',
      tag:'HANDSHAKE FAIL', tagColor:'var(--red)', tagBg:'rgba(248,113,113,0.12)',
      desc:'<strong>handshake_failure (40)</strong> means no common cipher suite, TLS version, or key exchange algorithm could be agreed upon. Common in: old clients (no TLS 1.3 support), misconfigured servers (too restrictive cipher list), or FIPS-mode systems rejecting non-compliant algorithms.',
      dir:'c2s', label:'Alert: handshake_failure (40)', sub:'Fatal — no common cipher / version / group agreed',
      arrowColor:'#f87171', clientState:'ALERT', serverState:'ALERT',
      cipher:{ suite:'NONE — no agreement!', kex:'Failed', auth:'Failed', enc:'Failed', mac:'Failed' },
      cert:null,
      fields:[
        {k:'Alert code',   v:'40 — handshake_failure',              c:'#f87171'},
        {k:'Cause 1',      v:'No common cipher suite',              c:'#f87171'},
        {k:'Cause 2',      v:'TLS version mismatch  (e.g. TLS 1.0 disabled)'},
        {k:'Cause 3',      v:'No common EC group / key share'},
        {k:'Cause 4',      v:'FIPS mode — non-compliant algo rejected'},
        {k:'Debug',        v:'openssl s_client -tls1_2 -cipher ALL'},
        {k:'Cisco IOS',    v:'debug ssl  /  show ssl'},
        {k:'Fix',          v:'Align cipher/version on both sides',  c:'#4ade80'},
      ],
    },
    {
      step:4, title:'Step 4 — decrypt_error + record_overflow',
      tag:'CRYPTO ERROR', tagColor:'var(--red)', tagBg:'rgba(248,113,113,0.12)',
      desc:'<strong>decrypt_error (51)</strong>: decryption or signature verification failed — wrong keys, corrupted record, or an active attacker tampered with the ciphertext. AEAD authentication tag mismatch triggers this. <strong>record_overflow (22)</strong>: TLS record larger than 16384+256 bytes — possible attack or bug.',
      dir:'none', label:'decrypt_error / record_overflow', arrowColor:'#f87171',
      clientState:'ALERT', serverState:'ALERT',
      cipher:null, cert:null,
      fields:[
        {k:'decrypt_error',v:'51 — AEAD tag mismatch / bad signature', c:'#f87171'},
        {k:'Causes',       v:'Key mismatch / tampering / replay'},
        {k:'AEAD',         v:'Auth tag covers ciphertext — tamper evident',c:'#4ade80'},
        {k:'record_overflow',v:'22 — record > 16384 + 256 bytes',    c:'#f87171'},
        {k:'BEAST',        v:'TLS 1.0 CBC + chosen plaintext — historic'},
        {k:'POODLE',       v:'SSL 3.0 CBC padding oracle — disable SSL3',c:'#f87171'},
        {k:'LUCKY13',      v:'CBC timing side-channel — use AEAD',    c:'#f87171'},
        {k:'Modern',       v:'AEAD (GCM/ChaCha20-Poly1305) immune ✓', c:'#4ade80'},
      ],
    },
    {
      step:5, title:'Step 5 — close_notify (Graceful Shutdown)',
      tag:'CLOSE_NOTIFY', tagColor:'var(--green)', tagBg:'rgba(74,222,128,0.12)',
      desc:'<strong>close_notify</strong> is the graceful TLS shutdown alert. Each side must send close_notify before closing the TCP connection — otherwise the peer cannot distinguish a legitimate end-of-data from a <strong>truncation attack</strong> (attacker injecting TCP FIN to cut data short). Failure to send is a TLS bug.',
      dir:'c2s', label:'Alert: close_notify (0)', sub:'Graceful TLS shutdown  →  TCP FIN follows',
      arrowColor:'#4ade80', clientState:'CLOSED', serverState:'CLOSED',
      cipher:{ suite:'TLS_AES_256_GCM_SHA384', kex:'x25519 ✓', auth:'RSA-PSS ✓', enc:'AES-256-GCM (final record)', mac:'SHA-384 AEAD' },
      cert:null,
      fields:[
        {k:'Alert code',   v:'0 — close_notify  (warning level)',   c:'#4ade80'},
        {k:'Must send',    v:'Both sides required to send it',       c:'#4ade80'},
        {k:'Truncation',   v:'Without it: attacker can inject FIN!', c:'#f87171'},
        {k:'Then',         v:'TCP FIN/FIN-ACK follows after'},
        {k:'Half-close',   v:'Can close write side while reading'},
        {k:'App bug',      v:'Not sending close_notify = security flaw'},
        {k:'Wireshark',    v:'Encrypted Alert — level=warning desc=0'},
        {k:'RFC 8446',     v:'§6.1 — closure alerts mandatory'},
      ],
    },
    {
      step:6, title:'Step 6 — CCIE Level: TLS Attacks Reference',
      tag:'CCIE LEVEL', tagColor:'var(--purple)', tagBg:'rgba(167,139,250,0.12)',
      desc:'<strong>TAC / CCIE-level attack knowledge:</strong> Understanding historical TLS attacks explains why certain features were removed or added. BEAST (CBC+TLS1.0), POODLE (SSL3 CBC padding), HEARTBLEED (OpenSSL buffer over-read), DROWN (SSLv2 oracle), ROBOT (RSA PKCS#1 v1.5 oracle), LOGJAM (weak DH export).',
      dir:'none', label:'TLS attack history  (CCIE reference)', arrowColor:'#a78bfa',
      clientState:'CLOSED', serverState:'CLOSED',
      cipher:null, cert:null,
      fields:[
        {k:'BEAST 2011',   v:'TLS 1.0 CBC — use TLS 1.2+ or RC4 (bad)'},
        {k:'CRIME 2012',   v:'TLS compression oracle — disabled now',  c:'#4ade80'},
        {k:'HEARTBLEED 14',v:'OpenSSL buf over-read — patch OpenSSL!', c:'#f87171'},
        {k:'POODLE 2014',  v:'SSL 3.0 CBC padding — disable SSL3',     c:'#f87171'},
        {k:'FREAK 2015',   v:'Export RSA downgrade — disable export',  c:'#f87171'},
        {k:'LOGJAM 2015',  v:'Weak DH < 2048 bit — use 2048+',        c:'#f87171'},
        {k:'DROWN 2016',   v:'SSLv2 oracle — disable SSLv2 fully',     c:'#f87171'},
        {k:'ROBOT 2017',   v:'RSA PKCS#1 padding oracle — use ECDHE',  c:'#4ade80'},
      ],
    },
  ],
};

// ─── Chain bar labels per scenario ───
const TLS_CHAINS = {
  tls13:         ['TCP','ClientHello','ServerHello','Cert 🔒','CertVerify','Finished','Ticket'],
  tls12:         ['ClientHello','ServerHello+Cert','ServerKEX','ClientKEX+CCS','Finished ✓'],
  resumption:    ['Has Ticket','0-RTT Send','Server Accept','Established ✓'],
  certvalidation:['X.509 Struct','Chain','Validate','Revocation','CT Logs'],
  mtls:          ['Intro','ClientHello','CertRequest','Client Cert','Mutual ✓'],
  alerts:        ['Alert Proto','Cert Error','Shake Fail','Crypto Err','close_notify','CCIE Ref'],
};

// ═══════════════════════════════════════════════════
// INIT & MODE SELECT
// ═══════════════════════════════════════════════════
function tlsSegInit() {
  tlsSetMode('tls13');
}

function tlsSegRedraw() {
  tlsDrawLadder();
}

function tlsSetMode(mode) {
  tlsMode = mode;
  tlsReset();
  document.querySelectorAll('.tls-mode-tab').forEach(t => t.classList.remove('active'));
  const tab = document.getElementById('tls-tab-' + mode);
  if (tab) tab.classList.add('active');

  const totalEl = document.getElementById('tls-step-total');
  if (totalEl) totalEl.textContent = TLS_STEPS[mode].length;

  const descs = {
    tls13:          `<strong style="color:var(--amber)">TLS 1.3 Handshake</strong> — 1 RTT. ClientHello with key share, encrypted certificate, PFS by default, 0-RTT session tickets. The modern standard.`,
    tls12:          `<strong style="color:var(--blue)">TLS 1.2 Handshake</strong> — 2 RTT. Cert in plaintext, explicit ChangeCipherSpec, RSA or ECDHE key exchange. Still widely deployed.`,
    resumption:     `<strong style="color:var(--cyan)">Session Resumption</strong> — 0-RTT. PSK ticket from prior session, early data in first flight, replay attack tradeoffs. CDN and browser optimization.`,
    certvalidation: `<strong style="color:var(--purple)">Certificate Validation</strong> — X.509 chain of trust, path validation, CRL vs OCSP vs stapling, Certificate Transparency. TAC cert debugging.`,
    mtls:           `<strong style="color:var(--pink)">Mutual TLS (mTLS)</strong> — Both sides authenticate. Zero-trust, service mesh (Istio/SPIFFE), CertificateRequest, client cert provisioning. CCIE level.`,
    alerts:         `<strong style="color:var(--red)">TLS Alerts & Errors</strong> — Alert protocol, certificate_unknown, handshake_failure, decrypt_error, close_notify, and CCIE-level attack history.`,
  };
  const descEl = document.getElementById('tls-mode-desc');
  if (descEl) descEl.innerHTML = descs[mode] || '';
}

function tlsUpdateChain(step) {
  const chainEl = document.getElementById('tls-chain-bar');
  if (!chainEl) return;
  const labels = TLS_CHAINS[tlsMode] || [];
  let html = '';
  labels.forEach((lbl, i) => {
    const idx = i + 1;
    let cls = 'dns-chain-step';
    if (step > idx) cls += ' done';
    else if (step === idx) cls += ' active';
    html += `<div class="${cls}">${lbl}</div>`;
    if (i < labels.length - 1) html += `<div class="dns-chain-arrow">›</div>`;
  });
  chainEl.innerHTML = html;
}

// ═══════════════════════════════════════════════════
// LADDER DIAGRAM DRAWING
// ═══════════════════════════════════════════════════
function tlsDrawLadder(animT) {
  const svg = document.getElementById('tls-svg');
  if (!svg) return;

  const steps = TLS_STEPS[tlsMode];
  const totalH = TLS_HDR_H + steps.length * TLS_STEP_H + 50;
  svg.setAttribute('viewBox', `0 0 760 ${totalH}`);
  svg.style.width = '100%';
  svg.style.height = 'auto';

  const curS = tlsCurrentStep > 0 ? steps[tlsCurrentStep - 1] : null;
  const cState = curS ? curS.clientState : 'IDLE';
  const sState = curS ? curS.serverState : 'IDLE';
  const cColor = TLS_STATE_COLORS[cState] || '#5a6080';
  const sColor = TLS_STATE_COLORS[sState] || '#5a6080';
  const isEstab = cState === 'ESTABLISHED' && sState === 'ESTABLISHED';

  let html = `<defs>
    <marker id="tls-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </marker>
  </defs>`;

  // ── Topology header ──
  html += `<rect x="55" y="8" width="150" height="80" rx="10" fill="rgba(91,156,246,0.06)" stroke="rgba(91,156,246,0.2)" stroke-width="1"/>`;
  html += svgPC(TLS_CX, 38, 'tls-cli', 'CLIENT\nBrowser/App', tlsCurrentStep > 0);
  html += `<rect x="${TLS_CX-40}" y="65" width="80" height="17" rx="4" fill="${cColor}22" stroke="${cColor}" stroke-width="1"/>`;
  html += `<text x="${TLS_CX}" y="77" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" font-weight="700" fill="${cColor}">${cState}</text>`;

  html += `<rect x="555" y="8" width="150" height="80" rx="10" fill="rgba(74,222,128,0.06)" stroke="rgba(74,222,128,0.2)" stroke-width="1"/>`;
  html += svgServer(TLS_SX, 38, 'tls-srv', 'SERVER\n:443 TLS', tlsCurrentStep > 0, '#4ade80');
  html += `<rect x="${TLS_SX-40}" y="65" width="80" height="17" rx="4" fill="${sColor}22" stroke="${sColor}" stroke-width="1"/>`;
  html += `<text x="${TLS_SX}" y="77" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" font-weight="700" fill="${sColor}">${sState}</text>`;

  // TLS lock icon when established
  const connColor = isEstab ? '#4ade8033' : 'rgba(100,120,180,0.12)';
  const connDash  = isEstab ? '' : 'stroke-dasharray="6,4"';
  html += `<line x1="205" y1="38" x2="555" y2="38" stroke="${connColor}" stroke-width="${isEstab?2:1}" ${connDash}/>`;
  if (isEstab) {
    html += `<text x="380" y="32" text-anchor="middle" font-size="16">🔒</text>`;
  }

  // ── Timeline lines ──
  const tlY = TLS_HDR_H;
  const tlEnd = totalH - 25;
  html += `<line x1="${TLS_CX}" y1="${tlY}" x2="${TLS_CX}" y2="${tlEnd}" stroke="rgba(91,156,246,0.2)" stroke-width="1.5" stroke-dasharray="5,5"/>`;
  html += `<line x1="${TLS_SX}" y1="${tlY}" x2="${TLS_SX}" y2="${tlEnd}" stroke="rgba(74,222,128,0.2)" stroke-width="1.5" stroke-dasharray="5,5"/>`;
  html += `<text x="${TLS_CX}" y="${tlY+13}" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="rgba(91,156,246,0.5)">CLIENT</text>`;
  html += `<text x="${TLS_SX}" y="${tlY+13}" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="rgba(74,222,128,0.5)">SERVER</text>`;

  // ── Draw arrows ──
  steps.forEach((s, i) => {
    const stepNum  = i + 1;
    const isCur    = stepNum === tlsCurrentStep;
    const isPast   = stepNum < tlsCurrentStep;
    const isFuture = stepNum > tlsCurrentStep;
    if (isFuture) return;

    const y = TLS_HDR_H + 28 + i * TLS_STEP_H;

    if (s.dir === 'none') {
      const midX = (TLS_CX + TLS_SX) / 2;
      const color = isPast ? '#2a3050' : (s.arrowColor || '#5b9cf6');
      const opacity = isPast ? 0.5 : 1;
      html += `<rect x="${midX-120}" y="${y-11}" width="240" height="24" rx="5" fill="${color}${isPast?'0d':'1a'}" stroke="${color}${isPast?'33':'55'}" stroke-width="${isPast?0.5:1}"/>`;
      html += `<text x="${midX}" y="${y+5}" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="${isPast?8:9}" font-weight="700" fill="${color}" opacity="${opacity}">${s.label}</text>`;
      html += `<text x="${TLS_CX-20}" y="${y+5}" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#3a4060" opacity="${isPast?0.4:0.7}">${stepNum}</text>`;
      return;
    }

    const fromX = s.dir === 'c2s' ? TLS_CX : TLS_SX;
    const toX   = s.dir === 'c2s' ? TLS_SX : TLS_CX;
    const fromY = y;
    const toY   = y + 24;
    const color = isPast ? '#2a3558' : s.arrowColor;
    const lw    = isPast ? 1 : 2;
    const opacity = isPast ? 0.45 : 1;

    html += `<line x1="${fromX}" y1="${fromY}" x2="${toX}" y2="${toY}" stroke="${color}" stroke-width="${lw}" opacity="${opacity}" marker-end="url(#tls-arr)"/>`;

    const badgeX = s.dir === 'c2s' ? TLS_CX - 20 : TLS_SX + 20;
    html += `<text x="${badgeX}" y="${fromY+4}" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="${isPast?'#2a3050':'#5a6080'}" opacity="${opacity}">${stepNum}</text>`;

    const midX = (fromX + toX) / 2;
    const midY = (fromY + toY) / 2;

    if (isCur) {
      const pw = Math.min(s.label.length * 7.5 + 20, 220);
      html += `<rect x="${midX-pw/2}" y="${midY-23}" width="${pw}" height="18" rx="4" fill="${color}22" stroke="${color}55" stroke-width="0.8"/>`;
    }
    html += `<text x="${midX}" y="${midY-9}" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="${isPast?8:10}" font-weight="${isPast?'400':'700'}" fill="${color}" opacity="${opacity}">${s.label}</text>`;

    if (s.sub) {
      const sub = isPast ? s.sub.split('  ')[0] : s.sub;
      html += `<text x="${midX}" y="${midY+22}" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="${isPast?7:8}" fill="${isPast?'#1e2438':'#8892b0'}" opacity="${isPast?0.5:1}">${sub}</text>`;
    }

    if (isCur && animT !== undefined && animT >= 0) {
      const dotX = fromX + (toX - fromX) * animT;
      const dotY = fromY + (toY - fromY) * animT;
      html += `<circle cx="${dotX}" cy="${dotY}" r="13" fill="${color}12" stroke="${color}44" stroke-width="1"/>`;
      html += `<circle cx="${dotX}" cy="${dotY}" r="7" fill="${color}40" stroke="${color}" stroke-width="2"/>`;
      html += `<circle cx="${dotX}" cy="${dotY}" r="3.5" fill="${color}"/>`;
    }
  });

  svg.innerHTML = html;
}

// ═══════════════════════════════════════════════════
// ANIMATION ENGINE
// ═══════════════════════════════════════════════════
function tlsCancelAll() {
  if (tlsRafId)   { cancelAnimationFrame(tlsRafId); tlsRafId = null; }
  if (tlsTimerId) { clearTimeout(tlsTimerId);        tlsTimerId = null; }
}

function tlsAnimateStep(step) {
  const steps = TLS_STEPS[tlsMode];
  const s = steps[step - 1];
  if (!s) return;

  const animatingStep = step;

  if (s.dir === 'none') {
    tlsDrawLadder(1);
    tlsTimerId = setTimeout(() => {
      tlsTimerId = null;
      if (tlsCurrentStep !== animatingStep) return;
      tlsDrawLadder();
      tlsFinalizeStep(s);
    }, tlsGetSegDur() * 1.1);
    return;
  }

  let startTime = null;
  const dur = tlsGetSegDur();

  function frame(ts) {
    if (tlsCurrentStep !== animatingStep) { tlsRafId = null; return; }
    if (!startTime) startTime = ts;
    const t = Math.min((ts - startTime) / dur, 1);
    tlsDrawLadder(easeInOut(t));
    if (t < 1) {
      tlsRafId = requestAnimationFrame(frame);
    } else {
      tlsRafId = null;
      tlsTimerId = setTimeout(() => {
        tlsTimerId = null;
        if (tlsCurrentStep !== animatingStep) return;
        tlsDrawLadder();
        tlsFinalizeStep(s);
      }, 320);
    }
  }
  tlsRafId = requestAnimationFrame(frame);
}

function tlsFinalizeStep(s) {
  tlsUpdateUI();
}

// ═══════════════════════════════════════════════════
// UI UPDATE
// ═══════════════════════════════════════════════════
function tlsUpdateUI() {
  const steps = TLS_STEPS[tlsMode];
  const step  = tlsCurrentStep;
  const numEl = document.getElementById('tls-step-num');
  const prog  = document.getElementById('tls-progress');
  const info  = document.getElementById('tls-step-info');
  if (numEl) numEl.textContent = step;
  if (prog)  prog.style.width = (step / steps.length * 100) + '%';
  tlsUpdateChain(step);

  if (step === 0) {
    if (info) info.innerHTML = `<div class="step-tag" style="background:rgba(91,156,246,0.12);color:var(--blue)">READY</div>
      <div class="step-title">Select a scenario above and press ▶ Play to begin TLS deep dive</div>
      <div class="step-desc">Ladder diagram shows every TLS record — past steps dimmed, current animated. Certificate chain panel and cipher suite panel update live with each step.</div>`;
    const f = document.getElementById('tls-pkt-fields');
    if (f) f.innerHTML = '<div style="color:var(--muted);font-family:var(--mono);font-size:11px;">Start the animation to see TLS record field details…</div>';
    tlsUpdateCipherPanel(null);
    tlsUpdateCertPanel(null);
    return;
  }

  const s = steps[step - 1];
  if (info) info.innerHTML = `<div class="step-tag" style="background:${s.tagBg};color:${s.tagColor}">${s.tag}</div>
    <div class="step-title">${s.title}</div>
    <div class="step-desc">${s.desc}</div>`;

  const fieldsEl = document.getElementById('tls-pkt-fields');
  if (fieldsEl && s.fields) {
    let fhtml = '<div class="pkt-fields">';
    s.fields.forEach(f => {
      fhtml += `<div class="pkt-field"><div class="pkt-field-key">${f.k}</div><div class="pkt-field-val" style="color:${f.c||'var(--text)'}"> ${f.v}</div></div>`;
    });
    fhtml += '</div>';
    fieldsEl.innerHTML = fhtml;
  }

  tlsUpdateCipherPanel(s.cipher);
  tlsUpdateCertPanel(s.cert);
}

// ═══════════════════════════════════════════════════
// CIPHER SUITE PANEL
// ═══════════════════════════════════════════════════
function tlsUpdateCipherPanel(cipher) {
  const el = document.getElementById('tls-cipher-panel');
  if (!el) return;
  if (!cipher) {
    el.innerHTML = '<div style="color:var(--muted);font-family:var(--mono);font-size:11px;">Cipher suite details appear here during the handshake…</div>';
    return;
  }

  const stateColor = s => {
    if (!s || s === '—') return 'var(--muted)';
    if (s.includes('✓') || s.includes('🔒')) return 'var(--green)';
    if (s.includes('negotiating') || s.includes('pending') || s.includes('switching')) return 'var(--amber)';
    if (s.includes('Failed') || s.includes('NONE')) return 'var(--red)';
    return 'var(--cyan)';
  };

  const rows = [
    { label:'Cipher Suite',      value: cipher.suite,  icon:'🔐' },
    { label:'Key Exchange (KEX)',  value: cipher.kex,    icon:'🔑' },
    { label:'Authentication',     value: cipher.auth,   icon:'🪪' },
    { label:'Encryption',         value: cipher.enc,    icon:'🔒' },
    { label:'MAC / Integrity',    value: cipher.mac,    icon:'✅' },
  ];

  el.innerHTML = rows.map(r => `
    <div style="display:flex;align-items:flex-start;gap:8px;padding:7px 0;border-bottom:1px solid var(--border);">
      <span style="font-size:14px;flex-shrink:0;margin-top:1px;">${r.icon}</span>
      <div style="flex:1;min-width:0;">
        <div style="font-family:var(--mono);font-size:9px;color:var(--muted);margin-bottom:2px;">${r.label}</div>
        <div style="font-family:var(--mono);font-size:11px;font-weight:600;color:${stateColor(r.value)};word-break:break-word;">${r.value || '—'}</div>
      </div>
    </div>`).join('');
}

// ═══════════════════════════════════════════════════
// CERTIFICATE CHAIN PANEL
// ═══════════════════════════════════════════════════
function tlsUpdateCertPanel(cert) {
  const el = document.getElementById('tls-cert-panel');
  if (!el) return;
  if (!cert) {
    el.innerHTML = '<div style="color:var(--muted);font-family:var(--mono);font-size:11px;">Certificate details appear when a certificate is present in this step…</div>';
    return;
  }

  const ok  = v => v && (v.includes('✓') || v.includes('OK') || v.includes('valid') || v.includes('verified'));
  const bad = v => v && (v.includes('✗') || v.includes('INVALID') || v.includes('EXPIRED') || v.includes('MISMATCH') || v.includes('INCOMPLETE') || v.includes('UNTRUSTED') || v.includes('broken'));
  const col = v => bad(v) ? 'var(--red)' : ok(v) ? 'var(--green)' : 'var(--text)';

  const chainStr = cert.chain || '';
  const chainParts = chainStr.split('→').map(p => p.trim());

  let chainHtml = '';
  if (chainParts.length > 1) {
    chainHtml = `<div style="display:flex;align-items:center;gap:4px;flex-wrap:wrap;margin-bottom:10px;padding:8px;background:var(--bg3);border-radius:8px;border:1px solid var(--border);">`;
    chainParts.forEach((part, i) => {
      const isBad = bad(chainStr);
      const isGood = ok(chainStr) || part.includes('✓');
      const partColor = isBad ? 'var(--red)' : isGood ? 'var(--green)' : (i === 0 ? 'var(--cyan)' : i === chainParts.length - 1 ? 'var(--purple)' : 'var(--amber)');
      const partBg   = isBad ? 'rgba(248,113,113,0.12)' : isGood ? 'rgba(74,222,128,0.12)' : (i === 0 ? 'rgba(56,217,192,0.12)' : i === chainParts.length-1 ? 'rgba(167,139,250,0.12)' : 'rgba(251,191,36,0.12)');
      chainHtml += `<div style="font-family:var(--mono);font-size:9px;font-weight:700;color:${partColor};background:${partBg};padding:3px 8px;border-radius:5px;border:1px solid ${partColor}55;">${part}</div>`;
      if (i < chainParts.length - 1) chainHtml += `<span style="color:var(--muted);font-size:12px;">→</span>`;
    });
    chainHtml += `</div>`;
  }

  const rows = [
    { k:'Subject',   v: cert.subject },
    { k:'Issuer',    v: cert.issuer },
    { k:'Valid',     v: cert.valid },
    { k:'SAN',       v: cert.san },
    { k:'Key',       v: cert.keysize },
    { k:'OCSP/CRL',  v: cert.ocsp },
    { k:'CT',        v: cert.ct },
  ];

  el.innerHTML = chainHtml + rows.map(r => `
    <div style="display:flex;gap:8px;padding:4px 0;border-bottom:1px solid var(--border);">
      <div style="font-family:var(--mono);font-size:9px;color:var(--muted);min-width:60px;flex-shrink:0;padding-top:1px;">${r.k}</div>
      <div style="font-family:var(--mono);font-size:10px;font-weight:600;color:${col(r.v)};word-break:break-word;">${r.v || '—'}</div>
    </div>`).join('');
}

// ═══════════════════════════════════════════════════
// PLAYBACK CONTROLS
// ═══════════════════════════════════════════════════
function tlsStep(dir) {
  tlsCancelAll();
  const steps = TLS_STEPS[tlsMode];
  const newStep = tlsCurrentStep + dir;
  if (newStep < 0 || newStep > steps.length) return;
  tlsCurrentStep = newStep;
  tlsDrawLadder();
  tlsUpdateUI();
  if (newStep > 0) tlsAnimateStep(newStep);
}

function tlsTogglePlay() {
  if (tlsSpeedMode === 'manual') { tlsStep(1); return; }
  tlsPlaying = !tlsPlaying;
  const btn = document.getElementById('tls-play-btn');
  if (btn) btn.textContent = tlsPlaying ? '⏸ Pause' : '▶ Play';
  if (tlsPlaying) tlsAutoPlay();
  else clearTimeout(tlsPlayTimer);
}

function tlsAutoPlay() {
  if (!tlsPlaying) return;
  const steps = TLS_STEPS[tlsMode];
  if (tlsCurrentStep >= steps.length) {
    tlsPlaying = false;
    const btn = document.getElementById('tls-play-btn');
    if (btn) btn.textContent = '▶ Play';
    return;
  }
  tlsStep(1);
  tlsPlayTimer = setTimeout(tlsAutoPlay, tlsGetAutoDelay());
}

function tlsReset() {
  tlsPlaying = false;
  clearTimeout(tlsPlayTimer);
  tlsCancelAll();
  const btn = document.getElementById('tls-play-btn');
  if (btn) btn.textContent = '▶ Play';
  tlsCurrentStep = 0;
  tlsDrawLadder();
  tlsUpdateUI();
  tlsUpdateChain(0);
}

// ─── Auto-init ───
document.addEventListener('DOMContentLoaded', function () {
  tlsSetMode('tls13');
});