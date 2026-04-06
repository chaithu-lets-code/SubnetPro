// ═══════════════════════════════════════════════════════════════════
// ACL SIMULATOR — acl-advanced.js  (v2 — Enhanced Edition)
// Features added:
//   • Custom Packet Builder (live rule evaluation)
//   • ACL Rule Editor (add / remove / reorder rules)
//   • Hit Counter Dashboard (per-rule match tracking)
//   • Quiz / Challenge Mode (predict before reveal)
//   • Packet Log / History (scrollable verdict feed)
//   • 3 new scenarios: Named ACL, Time-Based ACL, IPv6 ACL
// Original scenarios 0–3 preserved and extended.
// ═══════════════════════════════════════════════════════════════════

let aclSim = {
  scenario: 0,
  step: 0,
  playing: false,
  playTimer: null,
  speedMode: 'normal',
  animId: null,
  // ── new state ──
  hitCounters: {},      // { "scenIdx-ruleIdx": count }
  packetLog: [],        // [{ src, dst, proto, port, verdict, rule, ts }]
  quizMode: false,
  quizRevealed: false,
  activeTab: 'sim',     // 'sim' | 'builder' | 'editor' | 'quiz' | 'log'
  customRules: null,    // null = use scenario rules; array = editor override
};

// ─── Speed helpers ───────────────────────────────────────────────
function aclSimGetSegDur()    { return { slow:2000, normal:1000, fast:450  }[aclSim.speedMode]; }
function aclSimGetAutoDelay() { return { slow:5000, normal:2500, fast:1200 }[aclSim.speedMode]; }

function setAclSimSpeed(s) {
  aclSim.speedMode = s;
  ['slow','normal','fast'].forEach(x => {
    const el = document.getElementById('acl-spd-' + x);
    if (el) el.classList.toggle('active', x === s);
  });
}

// ═══════════════════════════════════════════════════════════════════
// TOPOLOGY NODES
// ═══════════════════════════════════════════════════════════════════
const ACLS_NODES = {
  pca:    { x: 85,  y: 130 },
  rtr:    { x: 360, y: 130 },
  server: { x: 640, y: 130 },
};

// ═══════════════════════════════════════════════════════════════════
// SCENARIOS (original 0-3 + 3 new)
// ═══════════════════════════════════════════════════════════════════
const ACL_SIM_SCENARIOS = [

  // ── 0: Standard — Permit Host ──────────────────────────────────
  {
    title: 'Standard ACL — Permit Host',
    badge: 'STANDARD', badgeColor: 'var(--purple)',
    desc: 'ACL 10 applied <strong>inbound</strong> on Gi0/0. Permits only <em>host 192.168.1.100</em> — all other sources hit the implicit deny.',
    aclLabel: 'ACL 10 — Standard (Numbered)',
    aclApply:  'interface Gi0/0 → ip access-group 10 in',
    rules: [
      { seq: 10,   action: 'permit', text: 'permit host 192.168.1.100',   color: 'var(--green)', bg: 'rgba(74,222,128,0.08)'   },
      { seq: null, action: 'deny',   text: '(implicit) deny any',         color: 'var(--red)',   bg: 'rgba(248,113,113,0.06)', italic: true },
    ],
    packet: { src: '192.168.1.100', dst: '10.0.0.1', proto: 'IP', port: '—', srcMAC: 'AA:BB:CC:11:22:33', dstMAC: 'FF:00:01:00:00:01' },
    steps: [
      {
        title: 'Step 1 — Packet Arrives at Router Interface',
        tag: 'INBOUND', tagColor: 'var(--blue)', tagBg: 'rgba(91,156,246,0.12)',
        desc: 'PC-A (192.168.1.100) sends a packet towards server 10.0.0.1. The packet arrives on the router\'s <strong>Gi0/0</strong> interface. Before forwarding, the router checks any ACL applied <strong>inbound</strong> on that interface.',
        animate: { from: 'pca', to: 'rtr', pktColor: '#5b9cf6', pktLabel: 'PKT' },
        activeNodes: ['pca', 'rtr'], ruleHit: null, verdict: null,
        fields: [
          { k: 'Interface',   v: 'Gi0/0 (inbound)',               c: 'var(--blue)'   },
          { k: 'ACL Applied', v: 'ACL 10 → ip access-group 10 in',c: 'var(--purple)' },
          { k: 'Src IP',      v: '192.168.1.100',                  c: 'var(--cyan)'   },
          { k: 'Dst IP',      v: '10.0.0.1'                                           },
          { k: 'Protocol',    v: 'IP (any)'                                            },
          { k: 'Next Action', v: 'Evaluate ACL top-down',          c: 'var(--amber)'  },
        ],
      },
      {
        title: 'Step 2 — Evaluate Rule 10: permit host 192.168.1.100',
        tag: 'RULE EVAL', tagColor: 'var(--amber)', tagBg: 'rgba(251,191,36,0.12)',
        desc: 'The router evaluates <strong>Rule 10</strong>: <code>permit host 192.168.1.100</code>. The <em>host</em> keyword translates to wildcard mask <strong>0.0.0.0</strong> — must match exactly. Packet source is 192.168.1.100 → <strong>exact match!</strong>',
        animate: null, activeNodes: ['rtr'], ruleHit: 0, verdict: null,
        fields: [
          { k: 'Rule',       v: '10 — permit host 192.168.1.100',            c: 'var(--green)'  },
          { k: 'Match Type', v: 'host (wildcard 0.0.0.0 = /32)'                                 },
          { k: 'Packet Src', v: '192.168.1.100'                                                  },
          { k: 'Network',    v: '192.168.1.100 & ~0.0.0.0 = 192.168.1.100'                     },
          { k: 'Src Match?', v: '192.168.1.100 = 192.168.1.100 ✓',          c: 'var(--green)'  },
          { k: 'Result',     v: '⚡ FIRST MATCH → PERMIT',                  c: 'var(--green)'  },
        ],
      },
      {
        title: 'Step 3 — PERMIT — Packet Forwarded to Server',
        tag: 'PERMIT ✅', tagColor: 'var(--green)', tagBg: 'rgba(74,222,128,0.14)',
        desc: 'Rule 10 matched. The <strong>first-match-wins</strong> logic stops evaluation immediately. Action is <strong>permit</strong> — the router forwards the packet out the appropriate interface toward server <strong>10.0.0.1</strong>.',
        animate: { from: 'rtr', to: 'server', pktColor: '#4ade80', pktLabel: 'FWD' },
        activeNodes: ['rtr', 'server'], ruleHit: 0, verdict: 'permit',
        fields: [
          { k: 'Verdict',      v: '✅ PERMIT',                        c: 'var(--green)'  },
          { k: 'Matched Rule', v: '10 — permit host 192.168.1.100',   c: 'var(--green)'  },
          { k: 'Action',       v: 'Packet forwarded to next-hop'                          },
          { k: 'Dst IP',       v: '10.0.0.1 → server'                                    },
          { k: 'Implicit deny',v: 'NOT reached (first match wins)',   c: 'var(--muted2)' },
          { k: 'Cisco debug',  v: 'debug ip packet detail',           c: 'var(--blue)'   },
        ],
      },
    ],
  },

  // ── 1: Standard — Block Subnet ─────────────────────────────────
  {
    title: 'Standard ACL — Block Subnet',
    badge: 'STANDARD', badgeColor: 'var(--purple)',
    desc: 'ACL 20 <strong>denies</strong> all traffic from 192.168.2.0/24 (Guest VLAN) and permits everything else. Packet from 192.168.2.50 walks the list.',
    aclLabel: 'ACL 20 — Standard (Numbered)',
    aclApply:  'interface Gi0/1 → ip access-group 20 in',
    rules: [
      { seq: 10,   action: 'deny',   text: 'deny   192.168.2.0 0.0.0.255', color: 'var(--red)',   bg: 'rgba(248,113,113,0.08)'  },
      { seq: 20,   action: 'permit', text: 'permit any',                    color: 'var(--green)', bg: 'rgba(74,222,128,0.08)'   },
      { seq: null, action: 'deny',   text: '(implicit) deny any',           color: 'var(--red)',   bg: 'rgba(248,113,113,0.06)', italic: true },
    ],
    packet: { src: '192.168.2.50', dst: '10.0.0.5', proto: 'IP', port: '—', srcMAC: 'CC:DD:EE:22:33:44', dstMAC: 'FF:00:01:00:00:02' },
    steps: [
      {
        title: 'Step 1 — Guest Host Sends Packet',
        tag: 'INBOUND', tagColor: 'var(--blue)', tagBg: 'rgba(91,156,246,0.12)',
        desc: 'A host from the <strong>Guest VLAN</strong> (192.168.2.50) attempts to reach server 10.0.0.5. The packet hits the router on Gi0/1. ACL 20 is applied inbound — evaluation begins top-down.',
        animate: { from: 'pca', to: 'rtr', pktColor: '#a78bfa', pktLabel: 'PKT' },
        activeNodes: ['pca', 'rtr'], ruleHit: null, verdict: null,
        fields: [
          { k: 'Interface',   v: 'Gi0/1 (inbound)',                c: 'var(--blue)'   },
          { k: 'ACL Applied', v: 'ACL 20 → ip access-group 20 in', c: 'var(--purple)' },
          { k: 'Src IP',      v: '192.168.2.50',                   c: 'var(--amber)'  },
          { k: 'Src Subnet',  v: '192.168.2.0/24 (Guest VLAN)'                        },
          { k: 'Dst IP',      v: '10.0.0.5'                                            },
          { k: 'Next Action', v: 'Evaluate ACL 20 top-down',       c: 'var(--amber)'  },
        ],
      },
      {
        title: 'Step 2 — Evaluate Rule 10: deny 192.168.2.0 0.0.0.255',
        tag: 'RULE EVAL', tagColor: 'var(--amber)', tagBg: 'rgba(251,191,36,0.12)',
        desc: 'Rule 10 checks if the source IP falls within <strong>192.168.2.0 / wildcard 0.0.0.255</strong>. 192.168.2.50 is in 192.168.2.0/24 → <strong>MATCH!</strong>',
        animate: null, activeNodes: ['rtr'], ruleHit: 0, verdict: null,
        fields: [
          { k: 'Rule',        v: '10 — deny 192.168.2.0 0.0.0.255',c: 'var(--red)'   },
          { k: 'Wildcard',    v: '0.0.0.255 = last 8 bits are "don\'t care"'          },
          { k: 'Network bits',v: '192.168.2.x — first 24 bits must match'             },
          { k: 'Packet Src',  v: '192.168.2.50'                                       },
          { k: 'Check',       v: '192.168.2.50 in 192.168.2.0/24? YES', c: 'var(--red)'   },
          { k: 'Result',      v: '⚡ FIRST MATCH → DENY',              c: 'var(--red)'   },
        ],
      },
      {
        title: 'Step 3 — DENY — Packet Dropped',
        tag: 'DENY 🚫', tagColor: 'var(--red)', tagBg: 'rgba(248,113,113,0.14)',
        desc: 'Rule 10 matched and the action is <strong>deny</strong>. The router <strong>drops</strong> the packet. Rule 20 (permit any) is <em>never evaluated</em> — first-match-wins stops processing immediately.',
        animate: { from: 'rtr', to: 'rtr', pktColor: '#f87171', pktLabel: 'DROP', drop: true },
        activeNodes: ['rtr'], ruleHit: 0, verdict: 'deny',
        fields: [
          { k: 'Verdict',      v: '🚫 DENY',                           c: 'var(--red)'    },
          { k: 'Matched Rule', v: '10 — deny 192.168.2.0 0.0.0.255',  c: 'var(--red)'    },
          { k: 'Action',       v: 'Packet silently dropped'                                },
          { k: 'Rule 20',      v: 'permit any — NOT reached',          c: 'var(--muted2)' },
          { k: 'ICMP reply?',  v: 'No — deny does not send unreachable by default'         },
          { k: 'Debug cmd',    v: 'show ip access-lists 20',           c: 'var(--blue)'   },
        ],
      },
    ],
  },

  // ── 2: Extended — Block HTTP ────────────────────────────────────
  {
    title: 'Extended ACL — Block HTTP',
    badge: 'EXTENDED', badgeColor: 'var(--amber)',
    desc: 'ACL 100 blocks <strong>TCP port 80</strong> from the 192.168.1.0/24 LAN to any destination. All other traffic is permitted. Packet: TCP/80 from 192.168.1.50.',
    aclLabel: 'ACL 100 — Extended (Numbered)',
    aclApply:  'interface Gi0/0 → ip access-group 100 in',
    rules: [
      { seq: 10,   action: 'deny',   text: 'deny tcp 192.168.1.0 0.0.0.255 any eq 80', color: 'var(--red)',   bg: 'rgba(248,113,113,0.08)'  },
      { seq: 20,   action: 'permit', text: 'permit ip any any',                         color: 'var(--green)', bg: 'rgba(74,222,128,0.08)'   },
      { seq: null, action: 'deny',   text: '(implicit) deny any',                       color: 'var(--red)',   bg: 'rgba(248,113,113,0.06)', italic: true },
    ],
    packet: { src: '192.168.1.50', dst: '203.0.113.10', proto: 'TCP', port: '80 (HTTP)', srcMAC: 'AA:11:22:33:44:55', dstMAC: 'FF:00:01:AB:CD:EF' },
    steps: [
      {
        title: 'Step 1 — HTTP Request Arrives on Router',
        tag: 'INBOUND', tagColor: 'var(--blue)', tagBg: 'rgba(91,156,246,0.12)',
        desc: 'A LAN host (192.168.1.50) sends an <strong>HTTP request</strong> (TCP destination port 80) to an internet server. The packet arrives inbound on Gi0/0 where <strong>ACL 100</strong> is applied.',
        animate: { from: 'pca', to: 'rtr', pktColor: '#5b9cf6', pktLabel: 'HTTP' },
        activeNodes: ['pca', 'rtr'], ruleHit: null, verdict: null,
        fields: [
          { k: 'Interface',   v: 'Gi0/0 (inbound)',      c: 'var(--blue)'  },
          { k: 'ACL Applied', v: 'ACL 100 (Extended)',    c: 'var(--amber)' },
          { k: 'Src IP',      v: '192.168.1.50',          c: 'var(--cyan)'  },
          { k: 'Dst IP',      v: '203.0.113.10 (internet)'                  },
          { k: 'Protocol',    v: 'TCP'                                       },
          { k: 'Dst Port',    v: '80 (HTTP)',              c: 'var(--amber)' },
        ],
      },
      {
        title: 'Step 2 — Check 5-Tuple Against Rule 10',
        tag: 'RULE EVAL', tagColor: 'var(--amber)', tagBg: 'rgba(251,191,36,0.12)',
        desc: 'Extended ACLs check all <strong>5 fields</strong>: Protocol, Src IP, Src Port, Dst IP, Dst Port. Rule 10 specifies <em>deny tcp</em> from <em>192.168.1.0/24</em> to <em>any</em> eq <em>80</em>.',
        animate: null, activeNodes: ['rtr'], ruleHit: 0, verdict: null,
        fields: [
          { k: 'Rule',      v: '10 — deny tcp 192.168.1.0/24 any eq 80',c: 'var(--red)'   },
          { k: 'Protocol?', v: 'Rule: tcp  |  Packet: tcp → ✓',        c: 'var(--green)' },
          { k: 'Src IP?',   v: '192.168.1.50 in 192.168.1.0/24 → ✓',  c: 'var(--green)' },
          { k: 'Dst IP?',   v: 'Rule: any → ✓ (matches everything)',   c: 'var(--green)' },
          { k: 'Dst Port?', v: 'Rule: eq 80  |  Packet: 80 → ✓',      c: 'var(--green)' },
          { k: 'All fields?',v: 'ALL MATCH → DENY',                    c: 'var(--red)'   },
        ],
      },
      {
        title: 'Step 3 — DENY — HTTP Blocked at Router',
        tag: 'DENY 🚫', tagColor: 'var(--red)', tagBg: 'rgba(248,113,113,0.14)',
        desc: 'All five tuple fields matched Rule 10. Action = <strong>deny</strong>. The HTTP packet is dropped at the router — it never reaches the internet.',
        animate: { from: 'rtr', to: 'rtr', pktColor: '#f87171', pktLabel: 'DROP', drop: true },
        activeNodes: ['rtr'], ruleHit: 0, verdict: 'deny',
        fields: [
          { k: 'Verdict',      v: '🚫 DENY',                                 c: 'var(--red)'    },
          { k: 'Matched Rule', v: '10 — deny tcp 192.168.1.0/24 any eq 80', c: 'var(--red)'    },
          { k: 'Rule 20',      v: 'permit ip any any — NOT reached',        c: 'var(--muted2)' },
          { k: 'Tip',          v: 'Use eq 443 to also block HTTPS'                              },
          { k: 'Placement',    v: 'Extended ACL → place close to SOURCE',   c: 'var(--blue)'   },
          { k: 'Show cmd',     v: 'show ip access-lists 100',               c: 'var(--cyan)'   },
        ],
      },
    ],
  },

  // ── 3: Extended — Multi-Rule Walk ──────────────────────────────
  {
    title: 'Extended ACL — Multi-Rule Walk',
    badge: 'EXTENDED', badgeColor: 'var(--amber)',
    desc: 'ACL 110 permits FTP (21), denies Telnet (23), permits everything else. A <strong>Telnet packet</strong> walks all rules.',
    aclLabel: 'ACL 110 — Extended (Numbered)',
    aclApply:  'interface Gi0/0 → ip access-group 110 in',
    rules: [
      { seq: 10,   action: 'permit', text: 'permit tcp any any eq 21 (FTP)',   color: 'var(--green)', bg: 'rgba(74,222,128,0.08)'  },
      { seq: 20,   action: 'deny',   text: 'deny   tcp any any eq 23 (Telnet)',color: 'var(--red)',   bg: 'rgba(248,113,113,0.08)' },
      { seq: 30,   action: 'permit', text: 'permit ip  any any',               color: 'var(--green)', bg: 'rgba(74,222,128,0.08)'  },
      { seq: null, action: 'deny',   text: '(implicit) deny any',              color: 'var(--red)',   bg: 'rgba(248,113,113,0.06)', italic: true },
    ],
    packet: { src: '192.168.1.20', dst: '10.0.0.2', proto: 'TCP', port: '23 (Telnet)', srcMAC: 'BB:CC:DD:44:55:66', dstMAC: 'FF:00:01:00:11:22' },
    steps: [
      {
        title: 'Step 1 — Telnet Packet Arrives at Router',
        tag: 'INBOUND', tagColor: 'var(--blue)', tagBg: 'rgba(91,156,246,0.12)',
        desc: 'A host (192.168.1.20) initiates a <strong>Telnet session</strong> (TCP/23). ACL 110 is applied inbound on Gi0/0. Top-down evaluation begins with Rule 10.',
        animate: { from: 'pca', to: 'rtr', pktColor: '#a78bfa', pktLabel: 'TELN' },
        activeNodes: ['pca', 'rtr'], ruleHit: null, verdict: null,
        fields: [
          { k: 'Interface', v: 'Gi0/0 (inbound)',  c: 'var(--blue)'  },
          { k: 'ACL',       v: 'ACL 110 (Extended)',c: 'var(--amber)' },
          { k: 'Src IP',    v: '192.168.1.20',      c: 'var(--cyan)'  },
          { k: 'Dst IP',    v: '10.0.0.2'                              },
          { k: 'Protocol',  v: 'TCP'                                   },
          { k: 'Dst Port',  v: '23 (Telnet)',        c: 'var(--amber)' },
        ],
      },
      {
        title: 'Step 2 — Rule 10: permit tcp any any eq 21 — NO MATCH',
        tag: 'NO MATCH', tagColor: 'var(--muted2)', tagBg: 'rgba(90,96,128,0.10)',
        desc: 'Rule 10 permits <strong>FTP (TCP/21)</strong>. The packet\'s destination port is <strong>23</strong>, not 21. <em>Port check fails</em> — this rule does NOT match.',
        animate: null, activeNodes: ['rtr'], ruleHit: 0, verdict: null, noMatch: true,
        fields: [
          { k: 'Rule',      v: '10 — permit tcp any any eq 21',  c: 'var(--green)'  },
          { k: 'Protocol?', v: 'Rule: tcp | Packet: tcp → ✓',   c: 'var(--green)'  },
          { k: 'Src IP?',   v: 'Rule: any → ✓',                 c: 'var(--green)'  },
          { k: 'Dst IP?',   v: 'Rule: any → ✓',                 c: 'var(--green)'  },
          { k: 'Dst Port?', v: 'Rule: eq 21 | Packet: 23 → ✗', c: 'var(--red)'    },
          { k: 'Result',    v: 'NOT all fields match → SKIP',   c: 'var(--muted2)' },
        ],
      },
      {
        title: 'Step 3 — Rule 20: deny tcp any any eq 23 — MATCH!',
        tag: 'RULE EVAL', tagColor: 'var(--amber)', tagBg: 'rgba(251,191,36,0.12)',
        desc: 'Rule 20 denies <strong>Telnet (TCP/23)</strong>. All fields match: tcp ✓, any src ✓, any dst ✓, port 23 ✓. <strong>First matching rule</strong>.',
        animate: null, activeNodes: ['rtr'], ruleHit: 1, verdict: null,
        fields: [
          { k: 'Rule',      v: '20 — deny tcp any any eq 23',    c: 'var(--red)'   },
          { k: 'Protocol?', v: 'Rule: tcp | Packet: tcp → ✓',   c: 'var(--green)' },
          { k: 'Src IP?',   v: 'Rule: any → ✓',                 c: 'var(--green)' },
          { k: 'Dst IP?',   v: 'Rule: any → ✓',                 c: 'var(--green)' },
          { k: 'Dst Port?', v: 'Rule: eq 23 | Packet: 23 → ✓', c: 'var(--green)' },
          { k: 'Result',    v: '⚡ FIRST MATCH → DENY',         c: 'var(--red)'   },
        ],
      },
      {
        title: 'Step 4 — DENY — Telnet Blocked',
        tag: 'DENY 🚫', tagColor: 'var(--red)', tagBg: 'rgba(248,113,113,0.14)',
        desc: 'Rule 20 matched. The Telnet packet is <strong>dropped</strong>. Rules 30 (permit ip any any) and the implicit deny are <em>never evaluated</em>.',
        animate: { from: 'rtr', to: 'rtr', pktColor: '#f87171', pktLabel: 'DROP', drop: true },
        activeNodes: ['rtr'], ruleHit: 1, verdict: 'deny',
        fields: [
          { k: 'Verdict',      v: '🚫 DENY',                           c: 'var(--red)'    },
          { k: 'Matched Rule', v: '20 — deny tcp any any eq 23',       c: 'var(--red)'    },
          { k: 'Rule 30',      v: 'permit ip any any — NOT reached',   c: 'var(--muted2)' },
          { k: 'Best practice',v: 'Replace Telnet with SSH (port 22)', c: 'var(--blue)'   },
          { k: 'Verify',       v: 'show ip access-lists 110',          c: 'var(--cyan)'   },
          { k: 'Hit counter',  v: 'ACL match increments per-rule counter'                  },
        ],
      },
    ],
  },

  // ── 4: Named ACL — NEW ─────────────────────────────────────────
  {
    title: 'Named ACL — PERMIT_WEB',
    badge: 'NAMED', badgeColor: 'var(--cyan)',
    desc: 'Named Extended ACL <strong>PERMIT_WEB</strong> allows only HTTPS (443) from the Corp LAN. All other traffic — including HTTP (80) — is denied. Named ACLs allow editing individual lines without rewriting the entire list.',
    aclLabel: 'ip access-list extended PERMIT_WEB',
    aclApply:  'interface Gi0/0 → ip access-group PERMIT_WEB in',
    rules: [
      { seq: 10,   action: 'permit', text: 'permit tcp 10.10.0.0 0.0.255.255 any eq 443',color: 'var(--green)', bg: 'rgba(74,222,128,0.08)'   },
      { seq: 20,   action: 'deny',   text: 'deny   tcp any any eq 80',                   color: 'var(--red)',   bg: 'rgba(248,113,113,0.08)'  },
      { seq: 30,   action: 'permit', text: 'permit tcp any any eq 22 (SSH)',              color: 'var(--green)', bg: 'rgba(74,222,128,0.08)'   },
      { seq: null, action: 'deny',   text: '(implicit) deny any',                         color: 'var(--red)',   bg: 'rgba(248,113,113,0.06)', italic: true },
    ],
    packet: { src: '10.10.5.22', dst: '8.8.8.8', proto: 'TCP', port: '443 (HTTPS)', srcMAC: 'DE:AD:BE:EF:00:01', dstMAC: 'FF:01:02:03:04:05' },
    steps: [
      {
        title: 'Step 1 — Corp Host Sends HTTPS Request',
        tag: 'INBOUND', tagColor: 'var(--blue)', tagBg: 'rgba(91,156,246,0.12)',
        desc: 'A corporate host (10.10.5.22) opens an HTTPS connection to Google DNS (8.8.8.8:443). The packet arrives on Gi0/0 and triggers evaluation of <strong>PERMIT_WEB</strong>.',
        animate: { from: 'pca', to: 'rtr', pktColor: '#22d3ee', pktLabel: 'HTTPS' },
        activeNodes: ['pca', 'rtr'], ruleHit: null, verdict: null,
        fields: [
          { k: 'Interface',   v: 'Gi0/0 (inbound)',                   c: 'var(--blue)'  },
          { k: 'ACL',         v: 'PERMIT_WEB (Named Extended)',        c: 'var(--cyan)'  },
          { k: 'Src IP',      v: '10.10.5.22',                         c: 'var(--cyan)'  },
          { k: 'Dst IP',      v: '8.8.8.8 (Google DNS)'                                  },
          { k: 'Protocol',    v: 'TCP'                                                    },
          { k: 'Dst Port',    v: '443 (HTTPS)',                        c: 'var(--green)' },
        ],
      },
      {
        title: 'Step 2 — Rule 10: permit tcp 10.10.0.0/16 any eq 443 — MATCH!',
        tag: 'RULE EVAL', tagColor: 'var(--amber)', tagBg: 'rgba(251,191,36,0.12)',
        desc: 'Rule 10 permits HTTPS from the 10.10.0.0/16 corp range. Source 10.10.5.22 falls within 10.10.0.0 wildcard 0.0.255.255 → ✓. Protocol TCP ✓. Port 443 ✓. All fields match on first rule!',
        animate: null, activeNodes: ['rtr'], ruleHit: 0, verdict: null,
        fields: [
          { k: 'Rule',      v: '10 — permit tcp 10.10.0.0/16 any eq 443', c: 'var(--green)' },
          { k: 'Protocol?', v: 'TCP = TCP → ✓',                           c: 'var(--green)' },
          { k: 'Src IP?',   v: '10.10.5.22 in 10.10.0.0/16 → ✓',        c: 'var(--green)' },
          { k: 'Dst IP?',   v: 'any → ✓',                                 c: 'var(--green)' },
          { k: 'Dst Port?', v: '443 = 443 → ✓',                           c: 'var(--green)' },
          { k: 'Result',    v: '⚡ FIRST MATCH → PERMIT',                 c: 'var(--green)' },
        ],
      },
      {
        title: 'Step 3 — PERMIT — HTTPS Allowed, HTTP Would Be Denied',
        tag: 'PERMIT ✅', tagColor: 'var(--green)', tagBg: 'rgba(74,222,128,0.14)',
        desc: 'HTTPS traffic is forwarded. Note: if the same host tried <strong>HTTP (port 80)</strong>, Rule 10 would NOT match (wrong port), and Rule 20 would catch it and deny. Named ACLs give you <strong>surgical control</strong>.',
        animate: { from: 'rtr', to: 'server', pktColor: '#4ade80', pktLabel: 'FWD' },
        activeNodes: ['rtr', 'server'], ruleHit: 0, verdict: 'permit',
        fields: [
          { k: 'Verdict',      v: '✅ PERMIT',                        c: 'var(--green)'  },
          { k: 'Matched Rule', v: '10 — permit tcp 10.10.0.0/16 eq 443',c: 'var(--green)'},
          { k: 'Named ACL tip',v: 'Add seq 15 without rewriting the whole list',         },
          { k: 'Edit syntax',  v: 'ip access-list extended PERMIT_WEB → no 20',          },
          { k: 'SSH allowed?', v: 'Yes — Rule 30 permits TCP/22',     c: 'var(--cyan)'   },
          { k: 'HTTP?',        v: 'Rule 20 would deny TCP/80',        c: 'var(--red)'    },
        ],
      },
    ],
  },

  // ── 5: Time-Based ACL — NEW ────────────────────────────────────
  {
    title: 'Time-Based ACL — Business Hours Only',
    badge: 'TIME-BASED', badgeColor: 'var(--blue)',
    desc: 'ACL 120 uses a <strong>time-range</strong> called BUSINESS_HOURS (Mon–Fri 08:00–18:00). YouTube (TCP/443 to 208.65.0.0/14) is blocked during work hours. Packet arrives at 14:30 on a Wednesday.',
    aclLabel: 'ACL 120 — Extended + time-range BUSINESS_HOURS',
    aclApply:  'interface Gi0/0 → ip access-group 120 in',
    rules: [
      { seq: 10,   action: 'deny',   text: 'deny tcp any 208.65.0.0 0.0.255.255 eq 443 time-range BUSINESS_HOURS', color: 'var(--red)',   bg: 'rgba(248,113,113,0.08)'  },
      { seq: 20,   action: 'permit', text: 'permit ip any any',                                                     color: 'var(--green)', bg: 'rgba(74,222,128,0.08)'   },
      { seq: null, action: 'deny',   text: '(implicit) deny any',                                                   color: 'var(--red)',   bg: 'rgba(248,113,113,0.06)', italic: true },
    ],
    packet: { src: '10.0.1.55', dst: '208.65.153.238', proto: 'TCP', port: '443 (YouTube)', srcMAC: 'CA:FE:BA:BE:00:01', dstMAC: 'FF:EE:DD:CC:BB:AA' },
    steps: [
      {
        title: 'Step 1 — User Attempts YouTube at 14:30 Wed',
        tag: 'INBOUND', tagColor: 'var(--blue)', tagBg: 'rgba(91,156,246,0.12)',
        desc: 'A user (10.0.1.55) tries to stream YouTube (208.65.153.238:443). The current time is <strong>14:30 on Wednesday</strong> — well within the BUSINESS_HOURS time range (Mon–Fri 08:00–18:00). ACL 120 begins evaluation.',
        animate: { from: 'pca', to: 'rtr', pktColor: '#f97316', pktLabel: 'YT' },
        activeNodes: ['pca', 'rtr'], ruleHit: null, verdict: null,
        fields: [
          { k: 'Interface',    v: 'Gi0/0 (inbound)',              c: 'var(--blue)'   },
          { k: 'ACL',          v: 'ACL 120 (Extended + time)',    c: 'var(--blue)'   },
          { k: 'Src IP',       v: '10.0.1.55'                                        },
          { k: 'Dst IP',       v: '208.65.153.238 (YouTube)',     c: 'var(--red)'    },
          { k: 'Dst Port',     v: '443 (HTTPS/YouTube)',          c: 'var(--amber)'  },
          { k: 'Current Time', v: 'Wed 14:30 — IN business hours',c: 'var(--amber)'  },
        ],
      },
      {
        title: 'Step 2 — Rule 10: Check dst IP + Port + Time-Range',
        tag: 'RULE EVAL', tagColor: 'var(--amber)', tagBg: 'rgba(251,191,36,0.12)',
        desc: 'Rule 10 has an additional constraint: the <strong>time-range BUSINESS_HOURS</strong>. The router checks: (1) IP & port match? (2) Is the time-range currently active? Both must be true for the rule to fire.',
        animate: null, activeNodes: ['rtr'], ruleHit: 0, verdict: null,
        fields: [
          { k: 'Rule',         v: '10 — deny ... time-range BUSINESS_HOURS',c: 'var(--red)' },
          { k: 'Protocol?',    v: 'TCP = TCP → ✓',                         c: 'var(--green)'},
          { k: 'Dst IP?',      v: '208.65.153.238 in 208.65.0.0/14 → ✓',  c: 'var(--green)'},
          { k: 'Dst Port?',    v: '443 = 443 → ✓',                         c: 'var(--green)'},
          { k: 'Time-range?',  v: 'Wed 14:30 in Mon-Fri 08:00-18:00 → ✓', c: 'var(--green)'},
          { k: 'Result',       v: '⚡ ALL MATCH (incl. time) → DENY',      c: 'var(--red)' },
        ],
      },
      {
        title: 'Step 3 — DENY — YouTube Blocked During Work Hours',
        tag: 'DENY 🚫', tagColor: 'var(--red)', tagBg: 'rgba(248,113,113,0.14)',
        desc: 'Time-range is ACTIVE and all fields match. YouTube is blocked. <strong>After 18:00 or on weekends</strong>, the time-range becomes inactive — Rule 10 is skipped and Rule 20 (permit ip any any) forwards the packet.',
        animate: { from: 'rtr', to: 'rtr', pktColor: '#f87171', pktLabel: 'DROP', drop: true },
        activeNodes: ['rtr'], ruleHit: 0, verdict: 'deny',
        fields: [
          { k: 'Verdict',      v: '🚫 DENY (time-range active)',   c: 'var(--red)'    },
          { k: 'Matched Rule', v: '10 — deny ... BUSINESS_HOURS', c: 'var(--red)'    },
          { k: 'After 18:00?', v: 'time-range inactive → Rule 10 SKIPPED',            },
          { k: 'Weekend?',     v: 'PERMIT via Rule 20',            c: 'var(--green)'  },
          { k: 'NTP required', v: 'Router must sync time for accuracy',c: 'var(--blue)'},
          { k: 'Verify',       v: 'show time-range BUSINESS_HOURS', c: 'var(--cyan)'  },
        ],
      },
    ],
  },

  // ── 6: IPv6 ACL — NEW ──────────────────────────────────────────
  {
    title: 'IPv6 ACL — Block ICMPv6 Redirect',
    badge: 'IPv6', badgeColor: 'var(--green)',
    desc: 'IPv6 uses <strong>named ACLs only</strong> (<code>ipv6 access-list</code>). ACL BLOCK_REDIRECT denies ICMPv6 type 137 (Redirect) — a common attack vector — and permits all other IPv6 traffic.',
    aclLabel: 'ipv6 access-list BLOCK_REDIRECT',
    aclApply:  'interface Gi0/0 → ipv6 traffic-filter BLOCK_REDIRECT in',
    rules: [
      { seq: 10,   action: 'deny',   text: 'deny icmp any any 137 (Redirect)',         color: 'var(--red)',   bg: 'rgba(248,113,113,0.08)'  },
      { seq: 20,   action: 'deny',   text: 'deny icmp any any 138 (Router Advert)',    color: 'var(--red)',   bg: 'rgba(248,113,113,0.08)'  },
      { seq: 30,   action: 'permit', text: 'permit ipv6 any any',                      color: 'var(--green)', bg: 'rgba(74,222,128,0.08)'   },
      { seq: null, action: 'deny',   text: '(implicit) deny ipv6 any any',             color: 'var(--red)',   bg: 'rgba(248,113,113,0.06)', italic: true },
    ],
    packet: { src: '2001:db8::1', dst: 'FF02::1', proto: 'ICMPv6', port: 'Type 137 (Redirect)', srcMAC: '02:42:AC:11:00:02', dstMAC: '33:33:00:00:00:01' },
    steps: [
      {
        title: 'Step 1 — ICMPv6 Redirect Arrives on Gi0/0',
        tag: 'INBOUND', tagColor: 'var(--blue)', tagBg: 'rgba(91,156,246,0.12)',
        desc: 'A device sends an <strong>ICMPv6 Type 137 Redirect</strong> message — possibly a rogue device trying to redirect traffic. The packet arrives on Gi0/0 where <strong>BLOCK_REDIRECT</strong> is applied with <code>ipv6 traffic-filter</code>.',
        animate: { from: 'pca', to: 'rtr', pktColor: '#4ade80', pktLabel: 'ICMPv6' },
        activeNodes: ['pca', 'rtr'], ruleHit: null, verdict: null,
        fields: [
          { k: 'Interface',   v: 'Gi0/0 (inbound)',              c: 'var(--blue)'  },
          { k: 'IPv6 ACL',    v: 'BLOCK_REDIRECT',               c: 'var(--green)' },
          { k: 'Src IPv6',    v: '2001:db8::1',                  c: 'var(--cyan)'  },
          { k: 'Dst IPv6',    v: 'FF02::1 (all-nodes multicast)'                   },
          { k: 'Protocol',    v: 'ICMPv6'                                           },
          { k: 'ICMP Type',   v: '137 (Redirect)',               c: 'var(--red)'   },
        ],
      },
      {
        title: 'Step 2 — Rule 10: deny icmp any any 137 — MATCH!',
        tag: 'RULE EVAL', tagColor: 'var(--amber)', tagBg: 'rgba(251,191,36,0.12)',
        desc: 'Rule 10 targets <strong>ICMPv6 type 137</strong>. The packet is ICMPv6 ✓ and the type is 137 ✓. Note: IPv6 ACLs use <code>icmp</code> to match ICMPv6 (the keyword implies v6 context in an ipv6 access-list).',
        animate: null, activeNodes: ['rtr'], ruleHit: 0, verdict: null,
        fields: [
          { k: 'Rule',        v: '10 — deny icmp any any 137',       c: 'var(--red)'   },
          { k: 'Protocol?',   v: 'ICMPv6 = icmp (IPv6 context) → ✓',c: 'var(--green)' },
          { k: 'Src addr?',   v: 'any → ✓',                          c: 'var(--green)' },
          { k: 'Dst addr?',   v: 'any → ✓',                          c: 'var(--green)' },
          { k: 'ICMP type?',  v: '137 = 137 → ✓',                   c: 'var(--green)' },
          { k: 'Result',      v: '⚡ FIRST MATCH → DENY',            c: 'var(--red)'   },
        ],
      },
      {
        title: 'Step 3 — DENY — Rogue Redirect Blocked',
        tag: 'DENY 🚫', tagColor: 'var(--red)', tagBg: 'rgba(248,113,113,0.14)',
        desc: 'The ICMPv6 Redirect is <strong>dropped</strong> — protecting hosts from being redirected to a rogue gateway. Rule 20 (type 138 block) also hardens against Router Advertisement floods. Only legitimate IPv6 traffic passes via Rule 30.',
        animate: { from: 'rtr', to: 'rtr', pktColor: '#f87171', pktLabel: 'DROP', drop: true },
        activeNodes: ['rtr'], ruleHit: 0, verdict: 'deny',
        fields: [
          { k: 'Verdict',      v: '🚫 DENY',                           c: 'var(--red)'   },
          { k: 'Matched Rule', v: '10 — deny icmp any any 137',        c: 'var(--red)'   },
          { k: 'Security',     v: 'Prevents rogue gateway attacks'                        },
          { k: 'Rule 20',      v: 'Also blocks RA floods (type 138)', c: 'var(--amber)'  },
          { k: 'Normal IPv6',  v: 'Rule 30 permits all other traffic', c: 'var(--green)' },
          { k: 'Verify',       v: 'show ipv6 access-list BLOCK_REDIRECT',c: 'var(--blue)'},
        ],
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════
// HIT COUNTER HELPERS
// ═══════════════════════════════════════════════════════════════════
function aclHitKey(scenIdx, ruleIdx) { return `${scenIdx}-${ruleIdx}`; }

function aclIncrHit(scenIdx, ruleIdx) {
  const k = aclHitKey(scenIdx, ruleIdx);
  aclSim.hitCounters[k] = (aclSim.hitCounters[k] || 0) + 1;
}

function aclGetHit(scenIdx, ruleIdx) {
  return aclSim.hitCounters[aclHitKey(scenIdx, ruleIdx)] || 0;
}

// ═══════════════════════════════════════════════════════════════════
// PACKET LOG HELPERS
// ═══════════════════════════════════════════════════════════════════
function aclLogPacket(src, dst, proto, port, verdict, ruleTxt) {
  aclSim.packetLog.unshift({
    src, dst, proto, port, verdict, ruleTxt,
    ts: new Date().toLocaleTimeString(),
  });
  if (aclSim.packetLog.length > 50) aclSim.packetLog.pop();
}

// ═══════════════════════════════════════════════════════════════════
// CUSTOM PACKET EVALUATOR
// Evaluates a custom packet against the current scenario's rules.
// Returns { verdict, ruleIdx, ruleTxt }
// ═══════════════════════════════════════════════════════════════════
function aclEvaluatePacket(srcIP, dstIP, proto, dstPort, scenRules) {
  // Very simple IP-in-subnet + port match (adequate for simulation)
  function ipInRange(ip, ruleNet, wildcard) {
    if (ruleNet === 'any' || ruleNet === '::') return true;
    if (ruleNet.startsWith('host ')) return ip === ruleNet.slice(5);
    // Parse CIDR or wildcard
    const [net, wc] = wildcard ? [ruleNet, wildcard] : ruleNet.split('/');
    if (!net) return false;
    const ipParts  = ip.split('.').map(Number);
    const netParts = net.split('.').map(Number);
    const wcParts  = wc
      ? (wc.includes('.') ? wc.split('.').map(Number) : Array(4).fill(parseInt(wc)))
      : (() => { const m = 0xFFFFFFFF >> parseInt(wc); return [(m>>24)&0xFF,(m>>16)&0xFF,(m>>8)&0xFF,m&0xFF]; })();
    for (let i = 0; i < 4; i++) {
      if ((ipParts[i] & ~wcParts[i]) !== (netParts[i] & ~wcParts[i])) return false;
    }
    return true;
  }

  for (let i = 0; i < scenRules.length; i++) {
    const r = scenRules[i];
    if (r.seq === null) { // implicit deny
      return { verdict: 'deny', ruleIdx: i, ruleTxt: r.text };
    }
    // Parse rule text (simplified)
    const txt = r.text.toLowerCase();
    // Protocol check
    let protoMatch = true;
    if (txt.includes('tcp') && proto !== 'TCP') protoMatch = false;
    if (txt.includes('udp') && proto !== 'UDP') protoMatch = false;
    if (txt.includes('icmp') && !proto.startsWith('ICMP')) protoMatch = false;
    if (!protoMatch) continue;
    // Port check (eq X)
    const portMatch = txt.match(/eq\s+(\d+)/);
    if (portMatch) {
      if (parseInt(portMatch[1]) !== parseInt(dstPort)) continue;
    }
    // Match everything else (simplified: assume any on src/dst for custom builder)
    return { verdict: r.action, ruleIdx: i, ruleTxt: r.text };
  }
  return { verdict: 'deny', ruleIdx: -1, ruleTxt: '(implicit) deny any' };
}

// ═══════════════════════════════════════════════════════════════════
// TAB SWITCHER
// ═══════════════════════════════════════════════════════════════════
function aclSetTab(tab) {
  aclSim.activeTab = tab;
  ['sim','builder','editor','quiz','log'].forEach(t => {
    const btn = document.getElementById('acl-tab-' + t);
    const pnl = document.getElementById('acl-panel-' + t);
    if (btn) btn.classList.toggle('active', t === tab);
    if (pnl) pnl.style.display = t === tab ? '' : 'none';
  });
  if (tab === 'log')     aclRenderLog();
  if (tab === 'builder') aclRenderBuilder();
  if (tab === 'editor')  aclRenderEditor();
  if (tab === 'quiz')    aclRenderQuiz();
}

// ═══════════════════════════════════════════════════════════════════
// PACKET LOG RENDER
// ═══════════════════════════════════════════════════════════════════
function aclRenderLog() {
  const el = document.getElementById('acl-log-body');
  if (!el) return;
  if (aclSim.packetLog.length === 0) {
    el.innerHTML = `<div style="text-align:center;color:var(--muted);font-family:var(--mono);font-size:12px;padding:24px;">No packets tested yet. Use the simulator or Packet Builder.</div>`;
    return;
  }
  el.innerHTML = aclSim.packetLog.map((p, i) => `
    <div style="display:grid;grid-template-columns:60px 1fr 1fr 70px 90px 1fr 80px;gap:6px;align-items:center;
      padding:7px 10px;border-radius:6px;margin-bottom:4px;
      background:${p.verdict==='permit'?'rgba(74,222,128,0.06)':'rgba(248,113,113,0.06)'};
      border:1px solid ${p.verdict==='permit'?'rgba(74,222,128,0.15)':'rgba(248,113,113,0.15)'};">
      <span style="font-family:var(--mono);font-size:9px;color:var(--muted);">${p.ts}</span>
      <span style="font-family:var(--mono);font-size:10px;color:var(--cyan);">${p.src}</span>
      <span style="font-family:var(--mono);font-size:10px;color:var(--muted2);">${p.dst}</span>
      <span style="font-family:var(--mono);font-size:10px;color:var(--amber);">${p.proto}</span>
      <span style="font-family:var(--mono);font-size:10px;color:var(--muted2);">${p.port}</span>
      <span style="font-family:var(--mono);font-size:9px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${p.ruleTxt}</span>
      <span style="font-family:var(--mono);font-size:10px;font-weight:700;color:${p.verdict==='permit'?'var(--green)':'var(--red)'};text-align:right;">
        ${p.verdict==='permit'?'✅ PERMIT':'🚫 DENY'}
      </span>
    </div>`).join('');
}

// ═══════════════════════════════════════════════════════════════════
// CUSTOM PACKET BUILDER RENDER
// ═══════════════════════════════════════════════════════════════════
function aclRenderBuilder() {
  const el = document.getElementById('acl-builder-body');
  if (!el) return;
  const sc = ACL_SIM_SCENARIOS[aclSim.scenario];
  el.innerHTML = `
    <div style="font-family:var(--mono);font-size:11px;color:var(--muted2);margin-bottom:12px;">
      Testing against: <span style="color:var(--cyan);">${sc.aclLabel}</span>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:10px;margin-bottom:14px;">
      ${[
        ['acl-bld-src','Src IP','192.168.1.100','text'],
        ['acl-bld-dst','Dst IP','10.0.0.1','text'],
        ['acl-bld-proto','Protocol','TCP','select:IP,TCP,UDP,ICMP,ICMPv6'],
        ['acl-bld-port','Dst Port','80','number'],
      ].map(([id,label,ph,type]) => `
        <div>
          <div style="font-family:var(--mono);font-size:9px;color:var(--muted);text-transform:uppercase;margin-bottom:4px;">${label}</div>
          ${type.startsWith('select') ? `
            <select id="${id}" style="width:100%;background:var(--bg3);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:7px 8px;font-family:var(--mono);font-size:11px;">
              ${type.split(':')[1].split(',').map(o=>`<option value="${o}">${o}</option>`).join('')}
            </select>` : `
            <input id="${id}" type="${type}" placeholder="${ph}" value="${ph}"
              style="width:100%;box-sizing:border-box;background:var(--bg3);border:1px solid var(--border);color:var(--text);border-radius:6px;padding:7px 8px;font-family:var(--mono);font-size:11px;">`}
        </div>`).join('')}
    </div>
    <button onclick="aclRunBuilder()" class="btn btn-primary" style="margin-bottom:14px;">▶ Test Packet Against ACL</button>
    <div id="acl-bld-result"></div>
  `;
}

function aclRunBuilder() {
  const src   = document.getElementById('acl-bld-src').value.trim();
  const dst   = document.getElementById('acl-bld-dst').value.trim();
  const proto = document.getElementById('acl-bld-proto').value;
  const port  = document.getElementById('acl-bld-port').value.trim();
  const sc    = ACL_SIM_SCENARIOS[aclSim.scenario];

  const { verdict, ruleIdx, ruleTxt } = aclEvaluatePacket(src, dst, proto, port, sc.rules);

  // Increment hit counter
  if (ruleIdx >= 0) aclIncrHit(aclSim.scenario, ruleIdx);

  // Log the packet
  aclLogPacket(src, dst, proto, port || '—', verdict, ruleTxt);

  const isPermit = verdict === 'permit';
  document.getElementById('acl-bld-result').innerHTML = `
    <div style="border-radius:8px;padding:14px 16px;background:${isPermit?'rgba(74,222,128,0.1)':'rgba(248,113,113,0.1)'};
      border:1px solid ${isPermit?'rgba(74,222,128,0.4)':'rgba(248,113,113,0.4)'};margin-bottom:10px;">
      <div style="font-family:var(--mono);font-size:18px;font-weight:700;color:${isPermit?'var(--green)':'var(--red)'};margin-bottom:6px;">
        ${isPermit ? '✅ PERMIT' : '🚫 DENY'}
      </div>
      <div style="font-family:var(--mono);font-size:11px;color:var(--muted2);">
        Matched: <span style="color:${isPermit?'var(--green)':'var(--red)'};">${ruleTxt}</span>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
      ${[
        ['Src IP', src, 'var(--cyan)'],
        ['Dst IP', dst, 'var(--muted2)'],
        ['Protocol', proto, 'var(--amber)'],
        ['Dst Port', port || '—', 'var(--amber)'],
        ['Matched Rule', ruleIdx >= 0 ? `seq ${sc.rules[ruleIdx]?.seq || 'implicit'}` : 'implicit deny', isPermit?'var(--green)':'var(--red)'],
        ['Hit Counter', `Rule now has ${aclGetHit(aclSim.scenario, ruleIdx)} hits`, 'var(--blue)'],
      ].map(([k,v,c]) => `
        <div style="background:var(--bg3);border-radius:5px;padding:7px 10px;border:1px solid var(--border);">
          <div style="font-family:var(--mono);font-size:8px;color:var(--muted);margin-bottom:2px;">${k}</div>
          <div style="font-family:var(--mono);font-size:11px;font-weight:600;color:${c};">${v}</div>
        </div>`).join('')}
    </div>`;
}

// ═══════════════════════════════════════════════════════════════════
// ACL RULE EDITOR
// ═══════════════════════════════════════════════════════════════════
function aclRenderEditor() {
  const el = document.getElementById('acl-editor-body');
  if (!el) return;
  const sc    = ACL_SIM_SCENARIOS[aclSim.scenario];
  const rules = aclSim.customRules || sc.rules.filter(r => r.seq !== null);

  el.innerHTML = `
    <div style="font-family:var(--mono);font-size:11px;color:var(--muted2);margin-bottom:10px;">
      Editing: <span style="color:var(--cyan);">${sc.aclLabel}</span>
      ${aclSim.customRules ? '<span style="color:var(--amber);margin-left:8px;">⚠ Custom rules active</span>' : ''}
    </div>
    <div id="acl-editor-rules">
      ${rules.map((r, i) => `
        <div id="acl-erule-${i}" style="display:flex;align-items:center;gap:8px;padding:8px;border-radius:6px;margin-bottom:6px;
          background:${r.bg||'rgba(30,36,56,0.5)'};border:1px solid var(--border);">
          <span style="font-family:var(--mono);font-size:10px;color:var(--muted);min-width:30px;">${r.seq || '—'}</span>
          <select onchange="aclEditorChangeAction(${i},this.value)" style="background:var(--bg3);border:1px solid var(--border);color:${r.action==='permit'?'var(--green)':'var(--red)'};border-radius:4px;padding:4px 6px;font-family:var(--mono);font-size:10px;">
            <option value="permit" ${r.action==='permit'?'selected':''}>permit</option>
            <option value="deny"   ${r.action==='deny'  ?'selected':''}>deny</option>
          </select>
          <input value="${r.text}" onchange="aclEditorChangeText(${i},this.value)"
            style="flex:1;background:var(--bg3);border:1px solid var(--border);color:var(--text);border-radius:4px;padding:4px 8px;font-family:var(--mono);font-size:10px;">
          <button onclick="aclEditorMoveUp(${i})"   style="background:var(--bg3);border:1px solid var(--border);color:var(--muted2);border-radius:4px;padding:3px 7px;cursor:pointer;font-size:11px;">↑</button>
          <button onclick="aclEditorMoveDown(${i})" style="background:var(--bg3);border:1px solid var(--border);color:var(--muted2);border-radius:4px;padding:3px 7px;cursor:pointer;font-size:11px;">↓</button>
          <button onclick="aclEditorDelete(${i})"   style="background:rgba(248,113,113,0.1);border:1px solid rgba(248,113,113,0.3);color:var(--red);border-radius:4px;padding:3px 8px;cursor:pointer;font-size:11px;">✕</button>
        </div>`).join('')}
    </div>
    <div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;">
      <button onclick="aclEditorAddRule()" class="btn btn-primary">+ Add Rule</button>
      <button onclick="aclEditorApply()"   class="btn btn-primary" style="background:rgba(74,222,128,0.15);border-color:rgba(74,222,128,0.4);color:var(--green);">✓ Apply to Simulator</button>
      <button onclick="aclEditorReset()"   class="btn btn-reset">↺ Reset to Original</button>
    </div>
    <div id="acl-editor-msg" style="margin-top:10px;font-family:var(--mono);font-size:11px;"></div>
  `;
}

function _getEditableRules() {
  const sc = ACL_SIM_SCENARIOS[aclSim.scenario];
  return aclSim.customRules ? [...aclSim.customRules] : sc.rules.filter(r => r.seq !== null).map(r => ({...r}));
}

function aclEditorChangeAction(i, val) {
  const rules = _getEditableRules();
  rules[i].action = val;
  rules[i].color  = val === 'permit' ? 'var(--green)' : 'var(--red)';
  rules[i].bg     = val === 'permit' ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)';
  aclSim.customRules = rules;
  aclRenderEditor();
}

function aclEditorChangeText(i, val) {
  const rules = _getEditableRules();
  rules[i].text = val;
  aclSim.customRules = rules;
}

function aclEditorMoveUp(i) {
  const rules = _getEditableRules();
  if (i === 0) return;
  [rules[i-1], rules[i]] = [rules[i], rules[i-1]];
  aclSim.customRules = rules;
  aclRenderEditor();
}

function aclEditorMoveDown(i) {
  const rules = _getEditableRules();
  if (i >= rules.length - 1) return;
  [rules[i+1], rules[i]] = [rules[i], rules[i+1]];
  aclSim.customRules = rules;
  aclRenderEditor();
}

function aclEditorDelete(i) {
  const rules = _getEditableRules();
  rules.splice(i, 1);
  aclSim.customRules = rules;
  aclRenderEditor();
}

function aclEditorAddRule() {
  const rules = _getEditableRules();
  const nextSeq = (rules.length > 0 ? (rules[rules.length-1].seq || 0) : 0) + 10;
  rules.push({ seq: nextSeq, action: 'permit', text: 'permit ip any any', color: 'var(--green)', bg: 'rgba(74,222,128,0.08)' });
  aclSim.customRules = rules;
  aclRenderEditor();
}

function aclEditorApply() {
  const rules = _getEditableRules();
  aclSim.customRules = rules;
  const msg = document.getElementById('acl-editor-msg');
  if (msg) { msg.style.color = 'var(--green)'; msg.textContent = '✓ Custom rules applied. Switch to Packet Builder to test them.'; }
}

function aclEditorReset() {
  aclSim.customRules = null;
  aclRenderEditor();
  const msg = document.getElementById('acl-editor-msg');
  if (msg) { msg.style.color = 'var(--amber)'; msg.textContent = '↺ Rules reset to scenario defaults.'; }
}

// ═══════════════════════════════════════════════════════════════════
// QUIZ MODE
// ═══════════════════════════════════════════════════════════════════
const ACL_QUIZ_QUESTIONS = [
  {
    question: 'Standard ACL 10: <code>permit host 10.0.0.1</code> / implicit deny<br>Packet from <strong>10.0.0.2</strong>. Verdict?',
    answer: 'deny',
    explanation: '10.0.0.2 does NOT match the host 10.0.0.1 rule (wildcard 0.0.0.0 = exact match only). It falls through to the implicit deny.',
  },
  {
    question: 'Extended ACL: <code>deny tcp any any eq 23</code> / <code>permit ip any any</code><br>Packet: UDP/53. Verdict?',
    answer: 'permit',
    explanation: 'Rule 1 is deny TCP port 23 (Telnet). The packet is UDP, not TCP — protocol mismatch, rule is skipped. Rule 2 permits all IP → PERMIT.',
  },
  {
    question: 'ACL: <code>deny 192.168.0.0 0.0.255.255</code> / <code>permit any</code><br>Packet from <strong>192.168.99.200</strong>. Verdict?',
    answer: 'deny',
    explanation: '192.168.99.200 falls within 192.168.0.0 wildcard 0.0.255.255 (= any 192.168.x.x). First rule matches → DENY.',
  },
  {
    question: 'ACL: <code>permit tcp any any eq 443</code> / implicit deny<br>Packet: TCP/80. Verdict?',
    answer: 'deny',
    explanation: 'Rule 1 only permits TCP/443 (HTTPS). Packet is TCP/80 (HTTP) — port 80 ≠ 443, rule skipped. Implicit deny → DENY.',
  },
  {
    question: 'Named ACL applied <strong>outbound</strong> on Gi0/1: <code>deny icmp any any</code> / <code>permit ip any any</code><br>ICMP ping packet. Verdict?',
    answer: 'deny',
    explanation: 'Outbound ACL checks packets leaving Gi0/1. ICMP matches the first rule → deny. The ICMP ping is dropped.',
  },
];

let aclQuizIdx = 0;
let aclQuizScore = { correct: 0, total: 0 };

function aclRenderQuiz() {
  const el = document.getElementById('acl-quiz-body');
  if (!el) return;
  const q = ACL_QUIZ_QUESTIONS[aclQuizIdx % ACL_QUIZ_QUESTIONS.length];
  el.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
      <div style="font-family:var(--mono);font-size:11px;color:var(--muted);">
        Question <span style="color:var(--text);">${(aclQuizIdx % ACL_QUIZ_QUESTIONS.length) + 1}</span> / ${ACL_QUIZ_QUESTIONS.length}
      </div>
      <div style="font-family:var(--mono);font-size:11px;">
        Score: <span style="color:var(--green);">${aclQuizScore.correct}</span> / <span style="color:var(--text);">${aclQuizScore.total}</span>
        ${aclQuizScore.total > 0 ? `<span style="color:var(--muted);"> (${Math.round(aclQuizScore.correct/aclQuizScore.total*100)}%)</span>` : ''}
      </div>
    </div>
    <div style="background:var(--bg3);border-radius:8px;padding:16px;border:1px solid var(--border);margin-bottom:14px;">
      <div style="font-family:var(--mono);font-size:13px;color:var(--text);line-height:1.8;">${q.question}</div>
    </div>
    <div id="acl-quiz-answer" style="display:flex;gap:10px;margin-bottom:14px;">
      <button onclick="aclQuizAnswer('permit')" class="btn btn-primary" style="flex:1;background:rgba(74,222,128,0.12);border-color:rgba(74,222,128,0.4);color:var(--green);font-size:13px;padding:12px;">✅ PERMIT</button>
      <button onclick="aclQuizAnswer('deny')"   class="btn btn-primary" style="flex:1;background:rgba(248,113,113,0.12);border-color:rgba(248,113,113,0.4);color:var(--red);font-size:13px;padding:12px;">🚫 DENY</button>
    </div>
    <div id="acl-quiz-feedback"></div>
  `;
}

function aclQuizAnswer(guess) {
  const q = ACL_QUIZ_QUESTIONS[aclQuizIdx % ACL_QUIZ_QUESTIONS.length];
  const correct = guess === q.answer;
  aclQuizScore.total++;
  if (correct) aclQuizScore.correct++;

  document.getElementById('acl-quiz-answer').innerHTML = '';
  document.getElementById('acl-quiz-feedback').innerHTML = `
    <div style="border-radius:8px;padding:14px;margin-bottom:12px;
      background:${correct?'rgba(74,222,128,0.1)':'rgba(248,113,113,0.1)'};
      border:1px solid ${correct?'rgba(74,222,128,0.4)':'rgba(248,113,113,0.4)'};">
      <div style="font-family:var(--mono);font-size:16px;font-weight:700;color:${correct?'var(--green)':'var(--red)'};margin-bottom:8px;">
        ${correct ? '✅ Correct!' : `❌ Wrong — Answer was ${q.answer.toUpperCase()}`}
      </div>
      <div style="font-family:var(--mono);font-size:11px;color:var(--muted2);line-height:1.7;">${q.explanation}</div>
    </div>
    <button onclick="aclQuizNext()" class="btn btn-primary">Next Question →</button>
  `;
}

function aclQuizNext() {
  aclQuizIdx++;
  aclRenderQuiz();
}

// ═══════════════════════════════════════════════════════════════════
// HIT COUNTER DASHBOARD RENDER (inline in sim tab)
// ═══════════════════════════════════════════════════════════════════
function aclRenderHitCounters() {
  const el = document.getElementById('acls-hit-counters');
  if (!el) return;
  const sc = ACL_SIM_SCENARIOS[aclSim.scenario];
  const maxHits = Math.max(1, ...sc.rules.map((r, i) => aclGetHit(aclSim.scenario, i)));
  el.innerHTML = `
    <div style="font-family:var(--mono);font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Hit Counters (this session)</div>
    ${sc.rules.map((r, i) => {
      const hits = aclGetHit(aclSim.scenario, i);
      const pct  = Math.round((hits / maxHits) * 100);
      return `
        <div style="margin-bottom:6px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:2px;">
            <span style="font-family:var(--mono);font-size:9px;color:${r.color};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:200px;">${r.text}</span>
            <span style="font-family:var(--mono);font-size:9px;color:var(--text);font-weight:700;margin-left:8px;">${hits}</span>
          </div>
          <div style="height:4px;background:var(--bg3);border-radius:2px;overflow:hidden;">
            <div style="height:100%;width:${pct}%;background:${r.color};border-radius:2px;transition:width 0.4s;"></div>
          </div>
        </div>`;
    }).join('')}
  `;
}

// ═══════════════════════════════════════════════════════════════════
// SVG RENDER HELPERS (unchanged from original)
// ═══════════════════════════════════════════════════════════════════
function aclSimSVGDefs() {
  return `<defs>
    <marker id="acls-arr" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="rgba(100,160,255,0.35)"/>
    </marker>
    <marker id="acls-arr-active" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#5b9cf6"/>
    </marker>
    <marker id="acls-arr-green" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#4ade80"/>
    </marker>
    <marker id="acls-arr-red" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#f87171"/>
    </marker>
    <filter id="acls-glow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>`;
}

function aclSimRenderTopology(step) {
  const sc = ACL_SIM_SCENARIOS[aclSim.scenario];
  const s  = sc.steps[step] || sc.steps[0];
  const n  = ACLS_NODES;
  const active = s.activeNodes || [];
  const rtrActive = active.includes('rtr');

  let svg = `<svg id="acls-svg" viewBox="0 0 740 260" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%;height:auto;">
  ${aclSimSVGDefs()}`;

  const pcaRtrActive  = active.includes('pca') && active.includes('rtr');
  const rtrSrvActive  = active.includes('rtr') && active.includes('server') && s.verdict === 'permit';
  const rtrDropActive = s.verdict === 'deny';

  svg += `<line x1="${n.pca.x+55}" y1="${n.pca.y}" x2="${n.rtr.x-32}" y2="${n.rtr.y}"
    stroke="${pcaRtrActive ? '#5b9cf6' : 'rgba(100,160,255,0.15)'}"
    stroke-width="${pcaRtrActive ? 2 : 1.5}"
    marker-end="url(#acls-arr${pcaRtrActive ? '-active' : ''})"/>`;

  svg += `<line x1="${n.rtr.x+32}" y1="${n.rtr.y}" x2="${n.server.x-40}" y2="${n.server.y}"
    stroke="${rtrSrvActive ? '#4ade80' : rtrDropActive ? 'rgba(248,113,113,0.2)' : 'rgba(100,160,255,0.15)'}"
    stroke-width="${rtrSrvActive ? 2 : 1.5}"
    ${rtrDropActive ? 'stroke-dasharray="5,5"' : ''}
    marker-end="url(#acls-arr${rtrSrvActive ? '-green' : rtrDropActive ? '-red' : ''})"/>`;

  if (rtrDropActive) {
    const mx = (n.rtr.x + 32 + n.server.x - 40) / 2;
    svg += `<text x="${mx}" y="${n.rtr.y + 5}" text-anchor="middle" font-size="22" fill="#f87171" filter="url(#acls-glow)">✕</text>`;
  }

  if (rtrActive) {
    svg += `<rect x="${n.rtr.x - 28}" y="${n.rtr.y - 62}" width="56" height="18" rx="4"
      fill="rgba(167,139,250,0.18)" stroke="rgba(167,139,250,0.5)" stroke-width="1"/>
    <text x="${n.rtr.x}" y="${n.rtr.y - 49}" text-anchor="middle"
      font-family="IBM Plex Mono,monospace" font-size="8" font-weight="700" fill="#a78bfa">ACL ACTIVE</text>`;
  }

  svg += `<text x="${(n.pca.x + 55 + n.rtr.x - 32) / 2}" y="${n.pca.y - 14}"
    text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="${pcaRtrActive ? '#5b9cf6' : '#3a4560'}">
    Gi0/0 (inbound)</text>`;
  svg += `<text x="${(n.rtr.x + 32 + n.server.x - 40) / 2}" y="${n.rtr.y - 14}"
    text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="${rtrSrvActive ? '#4ade80' : '#3a4560'}">
    Gi0/1 (egress)</text>`;

  svg += window.svgPC     (n.pca.x,    n.pca.y,    'acls-pca', 'PC-A\n' + sc.packet.src,           active.includes('pca'));
  svg += window.svgRouter (n.rtr.x,    n.rtr.y,    'acls-rtr', 'R1\n'  + sc.aclLabel.slice(0,12), rtrActive);
  svg += window.svgServer (n.server.x, n.server.y, 'acls-srv', 'Server\n' + sc.packet.dst,         active.includes('server'));

  // Static packet dot intentionally omitted here — the animated dot
  // in aclSimAnimatePkt() handles rendering during forward navigation.
  // On backward navigation (Prev) we show no dot, matching real-world
  // "packet has not yet arrived" semantics.

  if (s.verdict === 'permit') {
    svg += `<rect x="${n.server.x - 36}" y="${n.server.y + 30}" width="72" height="20" rx="4"
      fill="rgba(74,222,128,0.2)" stroke="rgba(74,222,128,0.5)" stroke-width="1"/>
    <text x="${n.server.x}" y="${n.server.y + 44}" text-anchor="middle"
      font-family="IBM Plex Mono,monospace" font-size="9" font-weight="700" fill="#4ade80">✅ PERMITTED</text>`;
  }
  if (s.verdict === 'deny') {
    svg += `<rect x="${n.rtr.x - 34}" y="${n.rtr.y + 30}" width="68" height="20" rx="4"
      fill="rgba(248,113,113,0.2)" stroke="rgba(248,113,113,0.5)" stroke-width="1"/>
    <text x="${n.rtr.x}" y="${n.rtr.y + 44}" text-anchor="middle"
      font-family="IBM Plex Mono,monospace" font-size="9" font-weight="700" fill="#f87171">🚫 DROPPED</text>`;
  }

  svg += `</svg>`;
  return svg;
}

function _aclSimPktPos(s) {
  const n = ACLS_NODES;
  if (!s.animate) return null;
  const { from, to, pktColor, pktLabel } = s.animate;
  if (from === 'pca' && to === 'rtr')    return { x: (n.pca.x + 55 + n.rtr.x - 32) / 2,    y: n.pca.y,    color: pktColor, label: pktLabel };
  if (from === 'rtr' && to === 'server') return { x: (n.rtr.x + 32 + n.server.x - 40) / 2, y: n.rtr.y,    color: pktColor, label: pktLabel };
  if (from === 'rtr' && to === 'rtr')    return { x: n.rtr.x,                                y: n.rtr.y+12, color: pktColor, label: pktLabel };
  return null;
}

function aclSimAnimatePkt(stepObj) {
  if (!stepObj.animate) return;
  // Cancel any in-flight animation immediately
  if (aclSim.animId) { cancelAnimationFrame(aclSim.animId); aclSim.animId = null; }

  // Defer one rAF so the freshly-injected SVG is guaranteed to be painted in the DOM
  aclSim.animId = requestAnimationFrame(function() {
    const svg = document.getElementById('acls-svg');
    if (!svg) return;

    const { from, to, pktColor, pktLabel, drop } = stepObj.animate;
    const n = ACLS_NODES;

    svg.querySelectorAll('.acls-pkt-dot').forEach(el => el.remove());
    const dur = aclSimGetSegDur();

    // ── DROP animation (rtr->rtr): pulse/expand/fade at router ──
    if (drop || (from === 'rtr' && to === 'rtr')) {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', 'acls-pkt-dot');
      const circ = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circ.setAttribute('cx', n.rtr.x); circ.setAttribute('cy', n.rtr.y);
      circ.setAttribute('r', '9'); circ.setAttribute('fill', pktColor);
      circ.setAttribute('filter', 'url(#acls-glow)'); circ.setAttribute('opacity', '0.92');
      const lbl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      lbl.setAttribute('x', n.rtr.x); lbl.setAttribute('y', (n.rtr.y + 4).toString());
      lbl.setAttribute('text-anchor', 'middle');
      lbl.setAttribute('font-family', 'IBM Plex Mono,monospace');
      lbl.setAttribute('font-size', '6'); lbl.setAttribute('font-weight', '700');
      lbl.setAttribute('fill', '#07090f'); lbl.textContent = pktLabel;
      g.appendChild(circ); g.appendChild(lbl);
      svg.appendChild(g);
      const dropStart = performance.now();
      function dropFrame(ts) {
        const t = Math.min((ts - dropStart) / dur, 1);
        circ.setAttribute('r', (9 + t * 18).toFixed(1));
        circ.setAttribute('opacity', (0.92 * (1 - t)).toFixed(3));
        lbl.setAttribute('opacity', (1 - t).toFixed(3));
        if (t < 1) { aclSim.animId = requestAnimationFrame(dropFrame); }
        else { g.remove(); aclSim.animId = null; }
      }
      aclSim.animId = requestAnimationFrame(dropFrame);
      return;
    }

    // ── TRAVEL animation (pca->rtr or rtr->server) ──
    let x1, y1, x2, y2;
    if (from === 'pca' && to === 'rtr')         { x1 = n.pca.x+55;  y1 = n.pca.y;  x2 = n.rtr.x-32;    y2 = n.rtr.y; }
    else if (from === 'rtr' && to === 'server') { x1 = n.rtr.x+32;  y1 = n.rtr.y;  x2 = n.server.x-40; y2 = n.server.y; }
    else return;

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'acls-pkt-dot');
    const circ = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circ.setAttribute('cx', x1); circ.setAttribute('cy', y1);
    circ.setAttribute('r', '9'); circ.setAttribute('fill', pktColor);
    circ.setAttribute('filter', 'url(#acls-glow)'); circ.setAttribute('opacity', '0.92');
    const lbl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    lbl.setAttribute('x', x1); lbl.setAttribute('y', (y1+4).toString());
    lbl.setAttribute('text-anchor', 'middle');
    lbl.setAttribute('font-family', 'IBM Plex Mono,monospace');
    lbl.setAttribute('font-size', '6'); lbl.setAttribute('font-weight', '700');
    lbl.setAttribute('fill', '#07090f'); lbl.textContent = pktLabel;
    g.appendChild(circ); g.appendChild(lbl);
    svg.appendChild(g);

    const travelStart = performance.now();
    function frame(ts) {
      const t  = Math.min((ts - travelStart) / dur, 1);
      // Inline easeInOut fallback in case window.easeInOut is not defined
      const et = window.easeInOut ? window.easeInOut(t) : (t < 0.5 ? 2*t*t : -1+(4-2*t)*t);
      const cx = x1 + (x2 - x1) * et;
      const cy = y1 + (y2 - y1) * et;
      circ.setAttribute('cx', cx); circ.setAttribute('cy', cy);
      lbl.setAttribute('x', cx); lbl.setAttribute('y', (cy+4).toString());
      if (t < 1) { aclSim.animId = requestAnimationFrame(frame); }
      else { g.remove(); aclSim.animId = null; }
    }
    aclSim.animId = requestAnimationFrame(frame);
  });
}

// ═══════════════════════════════════════════════════════════════════
// CHAIN BAR
// ═══════════════════════════════════════════════════════════════════
function aclSimRenderChain(sc, currentStep) {
  const total = sc.steps.length;
  let html = '';
  for (let i = 0; i < total; i++) {
    const s = sc.steps[i];
    const past    = i < currentStep;
    const current = i === currentStep;
    const tag     = s.tag || ('Step ' + (i+1));
    const tagShort = tag.split(' ')[0];
    let bg  = past ? 'rgba(91,156,246,0.15)' : current ? 'rgba(91,156,246,0.3)' : 'rgba(30,36,56,0.6)';
    let col = past ? 'var(--blue)' : current ? '#fff' : 'var(--muted)';
    let bdr = current ? '1px solid rgba(91,156,246,0.6)' : '1px solid transparent';
    if (current && s.verdict === 'permit') { bg = 'rgba(74,222,128,0.25)'; col = 'var(--green)'; bdr = '1px solid rgba(74,222,128,0.5)'; }
    if (current && s.verdict === 'deny')   { bg = 'rgba(248,113,113,0.2)'; col = 'var(--red)';   bdr = '1px solid rgba(248,113,113,0.5)'; }
    html += `<div class="dns-step-node" style="background:${bg};border:${bdr};color:${col};font-family:var(--mono);font-size:9px;padding:4px 10px;border-radius:20px;white-space:nowrap;">${past?'✓ ':''}${tagShort}</div>`;
    if (i < total - 1) html += `<div style="color:var(--muted);font-size:10px;margin:0 2px;">→</div>`;
  }
  return html;
}

// ═══════════════════════════════════════════════════════════════════
// ACL RULES PANEL
// ═══════════════════════════════════════════════════════════════════
function aclSimRenderRules(sc, step) {
  const s      = sc.steps[step];
  const hitIdx = (s && s.ruleHit !== null && s.ruleHit !== undefined) ? s.ruleHit : -1;
  const noMatch = s && s.noMatch;

  let html = `<div style="font-family:var(--mono);font-size:9px;color:var(--muted2);margin-bottom:6px;letter-spacing:1px;text-transform:uppercase;">${sc.aclLabel}</div>`;
  html += `<div style="font-family:var(--mono);font-size:9px;color:var(--muted);margin-bottom:10px;">${sc.aclApply}</div>`;

  sc.rules.forEach((r, i) => {
    const isHit     = i === hitIdx;
    const isNoMatch = i === hitIdx && noMatch;
    const isPast    = !noMatch && hitIdx > -1 && i < hitIdx;
    const hits      = aclGetHit(aclSim.scenario, i);

    let bg     = r.bg;
    let border = '1px solid var(--border)';
    let opacity = '1';
    if (isHit && !isNoMatch) { bg = r.action === 'permit' ? 'rgba(74,222,128,0.18)' : 'rgba(248,113,113,0.18)'; border = `1px solid ${r.color}`; }
    else if (isNoMatch)      { bg = 'rgba(90,96,128,0.08)'; border = '1px dashed rgba(90,96,128,0.3)'; }
    else if (isPast)         { opacity = '0.4'; }

    const seqLabel = r.seq
      ? `<span style="color:var(--muted);min-width:24px;display:inline-block;">${r.seq}</span>`
      : `<span style="min-width:24px;display:inline-block;"></span>`;

    const hitBadge = isHit && !isNoMatch
      ? `<span style="margin-left:auto;font-size:9px;font-weight:700;padding:2px 8px;border-radius:4px;background:${r.action==='permit'?'rgba(74,222,128,0.2)':'rgba(248,113,113,0.2)'};color:${r.color}">⚡ MATCH</span>`
      : isNoMatch
        ? `<span style="margin-left:auto;font-size:9px;color:var(--muted);padding:2px 8px;">✗ skip</span>`
        : hits > 0
          ? `<span style="margin-left:auto;font-size:8px;color:var(--blue);padding:2px 6px;background:rgba(91,156,246,0.1);border-radius:4px;">${hits} hits</span>`
          : '';

    html += `<div style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:6px;margin-bottom:5px;background:${bg};border:${border};opacity:${opacity};transition:all 0.3s;">
      ${seqLabel}
      <span style="font-family:var(--mono);font-size:11px;color:${r.color};flex:1;${r.italic?'font-style:italic;':''}font-weight:${isHit&&!isNoMatch?'700':'400'};">${r.text}</span>
      ${hitBadge}
    </div>`;
  });
  return html;
}

// ═══════════════════════════════════════════════════════════════════
// PACKET FIELDS
// ═══════════════════════════════════════════════════════════════════
function aclSimRenderPacketFields(sc, step) {
  const s = sc.steps[step];
  const p = sc.packet;
  let html = `<div style="font-family:var(--mono);font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Test Packet — 5-Tuple</div>`;
  html += `<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:10px;">`;
  [['Src IP', p.src, 'var(--cyan)'], ['Dst IP', p.dst, 'var(--muted2)'], ['Protocol', p.proto, 'var(--amber)'], ['Dst Port', p.port, 'var(--amber)']].forEach(([k,v,c]) => {
    html += `<div style="background:var(--bg3);border-radius:5px;padding:5px 8px;">
      <div style="font-family:var(--mono);font-size:8px;color:var(--muted);margin-bottom:1px;">${k}</div>
      <div style="font-family:var(--mono);font-size:10px;font-weight:700;color:${c||'var(--text)'};">${v}</div>
    </div>`;
  });
  html += `</div>`;
  if (s && s.fields && s.fields.length) {
    html += `<div style="font-family:var(--mono);font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Rule Evaluation</div>`;
    s.fields.forEach(f => {
      html += `<div style="display:flex;gap:8px;align-items:flex-start;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
        <span style="font-family:var(--mono);font-size:10px;color:var(--muted2);min-width:88px;flex-shrink:0;">${f.k}</span>
        <span style="font-family:var(--mono);font-size:10px;color:${f.c||'var(--text)'};">${f.v}</span>
      </div>`;
    });
  }
  return html;
}

// ═══════════════════════════════════════════════════════════════════
// RENDER FULL SIM STEP
// ═══════════════════════════════════════════════════════════════════
function aclSimRenderStep(animate) {
  const sc = ACL_SIM_SCENARIOS[aclSim.scenario];
  const si = aclSim.step;
  const s  = sc.steps[si];
  if (!s) return;

  document.getElementById('acls-topo').innerHTML    = aclSimRenderTopology(si);
  document.getElementById('acls-chain').innerHTML   = aclSimRenderChain(sc, si);

  const pct = sc.steps.length > 1 ? (si / (sc.steps.length - 1)) * 100 : 0;
  document.getElementById('acls-progress').style.width = pct + '%';
  document.getElementById('acls-step-num').textContent   = si + 1;
  document.getElementById('acls-step-total').textContent  = sc.steps.length;

  document.getElementById('acls-step-tag').textContent        = s.tag || '';
  document.getElementById('acls-step-tag').style.background   = s.tagBg    || 'rgba(91,156,246,0.12)';
  document.getElementById('acls-step-tag').style.color        = s.tagColor || 'var(--blue)';
  document.getElementById('acls-step-title').textContent      = s.title || '';
  document.getElementById('acls-step-desc').innerHTML         = s.desc  || '';
  document.getElementById('acls-rules-panel').innerHTML       = aclSimRenderRules(sc, si);
  document.getElementById('acls-pkt-fields').innerHTML        = aclSimRenderPacketFields(sc, si);

  // Verdict banner + log packet on final verdict step
  const vBanner = document.getElementById('acls-verdict');
  if (s.verdict === 'permit') {
    vBanner.style.display = ''; vBanner.style.background = 'rgba(74,222,128,0.12)';
    vBanner.style.border = '1px solid rgba(74,222,128,0.35)'; vBanner.style.color = 'var(--green)';
    vBanner.innerHTML = '✅ &nbsp;PERMIT — Packet forwarded to destination';
    if (animate) {
      aclIncrHit(aclSim.scenario, s.ruleHit);
      aclLogPacket(sc.packet.src, sc.packet.dst, sc.packet.proto, sc.packet.port, 'permit', sc.rules[s.ruleHit]?.text || '');
    }
  } else if (s.verdict === 'deny') {
    vBanner.style.display = ''; vBanner.style.background = 'rgba(248,113,113,0.12)';
    vBanner.style.border = '1px solid rgba(248,113,113,0.35)'; vBanner.style.color = 'var(--red)';
    vBanner.innerHTML = '🚫 &nbsp;DENY — Packet dropped (first match = deny)';
    if (animate) {
      aclIncrHit(aclSim.scenario, s.ruleHit);
      aclLogPacket(sc.packet.src, sc.packet.dst, sc.packet.proto, sc.packet.port, 'deny', sc.rules[s.ruleHit]?.text || '(implicit) deny any');
    }
  } else {
    vBanner.style.display = 'none';
  }

  aclRenderHitCounters();
  if (animate && s.animate) aclSimAnimatePkt(s);
}

// ═══════════════════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════════════════
function aclSimStep(dir) {
  const sc    = ACL_SIM_SCENARIOS[aclSim.scenario];
  const total = sc.steps.length;
  const next  = aclSim.step + dir;
  if (next < 0 || next >= total) return;
  aclSim.step = next;
  // Only animate when stepping forward; going backward shows static state
  aclSimRenderStep(dir > 0);
}

function aclSimTogglePlay() {
  if (aclSim.playing) { aclSimPause(); return; }
  aclSim.playing = true;
  document.getElementById('acls-play-btn').textContent = '⏸ Pause';
  _aclSimAutoNext();
}

function aclSimPause() {
  aclSim.playing = false;
  if (aclSim.playTimer) clearTimeout(aclSim.playTimer);
  document.getElementById('acls-play-btn').textContent = '▶ Play';
}

function _aclSimAutoNext() {
  if (!aclSim.playing) return;
  const sc    = ACL_SIM_SCENARIOS[aclSim.scenario];
  const total = sc.steps.length;
  // Animate the current step first, then schedule the advance
  aclSimRenderStep(true);
  if (aclSim.step >= total - 1) { aclSimPause(); return; }
  aclSim.playTimer = setTimeout(function() {
    if (!aclSim.playing) return;
    aclSim.step += 1;
    _aclSimAutoNext();
  }, aclSimGetAutoDelay());
}

function aclSimSetScenario(idx) {
  aclSimPause();
  aclSim.scenario    = idx;
  aclSim.step        = 0;
  aclSim.customRules = null;

  for (let i = 0; i < ACL_SIM_SCENARIOS.length; i++) {
    const btn = document.getElementById('acls-sc-' + i);
    if (btn) btn.classList.toggle('active', i === idx);
  }

  const sc = ACL_SIM_SCENARIOS[idx];
  
  // 1. Update Scenario Info Header
  const badgeEl = document.getElementById('acls-sc-badge');
  if (badgeEl) {
    badgeEl.textContent = sc.badge;
    badgeEl.style.color = sc.badgeColor;
    // Extract color for faint background if using css vars like var(--blue)
    badgeEl.style.background = 'rgba(100, 116, 139, 0.15)'; 
  }
  
  if (document.getElementById('acls-sc-title')) document.getElementById('acls-sc-title').textContent = sc.title;
  if (document.getElementById('acls-sc-desc'))  document.getElementById('acls-sc-desc').innerHTML    = sc.desc;

  // 2. Dynamically Generate CLI Config with Syntax Highlighting
  let cliHtml = `<span style="color:var(--muted)">! ${sc.aclLabel}</span><br>`;
  sc.rules.forEach(r => {
    if (r.seq !== null) {
      let text = r.text
        .replace(/\bpermit\b/g, '<span style="color:var(--green);font-weight:700">permit</span>')
        .replace(/\bdeny\b/g, '<span style="color:var(--red);font-weight:700">deny</span>')
        .replace(/\b(tcp|udp|icmp|ip|ipv6)\b/g, '<span style="color:var(--purple)">$1</span>')
        .replace(/\beq \d+\b/g, match => `<span style="color:var(--amber)">${match}</span>`);
      cliHtml += `${r.seq ? '<span style="color:var(--muted);min-width:20px;display:inline-block;">'+r.seq+'</span> ' : ''}${text}<br>`;
    }
  });
  cliHtml += `<span style="color:var(--muted)">!</span><br>`;
  
  // Parse the "interface → ip access-group" syntax to look like CLI
  const applyParts = sc.aclApply.split('→');
  if (applyParts.length > 1) {
    cliHtml += `<span style="color:var(--blue)">${applyParts[0].trim()}</span><br>`;
    cliHtml += `&nbsp;<span style="color:var(--cyan)">${applyParts[1].trim()}</span>`;
  } else {
    cliHtml += `<span style="color:var(--blue)">${sc.aclApply}</span>`;
  }
  
  if (document.getElementById('acls-cli-code')) document.getElementById('acls-cli-code').innerHTML = cliHtml;

  // 3. Populate Test Packet Header Data
  const p = sc.packet;
  if (document.getElementById('acls-pkt-header')) {
    document.getElementById('acls-pkt-header').innerHTML = `
      <div class="pkt-row"><span class="pkt-label">SRC IP</span><span class="pkt-val" style="color:var(--cyan)">${p.src}</span></div>
      <div class="pkt-row"><span class="pkt-label">DST IP</span><span class="pkt-val">${p.dst}</span></div>
      <div class="pkt-row"><span class="pkt-label">PROTOCOL</span><span class="pkt-val" style="color:var(--purple)">${p.proto}</span></div>
      <div class="pkt-row"><span class="pkt-label">DST PORT</span><span class="pkt-val" style="color:var(--amber)">${p.port}</span></div>
      ${p.srcMAC ? `<div class="pkt-row"><span class="pkt-label">SRC MAC</span><span class="pkt-val" style="font-size:9px;color:var(--muted2)">${p.srcMAC}</span></div>` : ''}
      ${p.dstMAC ? `<div class="pkt-row"><span class="pkt-label">DST MAC</span><span class="pkt-val" style="font-size:9px;color:var(--muted2)">${p.dstMAC}</span></div>` : ''}
    `;
  }

  // Re-render active tab
  if (aclSim.activeTab === 'builder') aclRenderBuilder();
  if (aclSim.activeTab === 'editor')  aclRenderEditor();
  aclSimRenderStep(true);
}

function aclSimReset() {
  aclSimPause();
  aclSim.step = 0;
  aclSimRenderStep(false);
}

// ═══════════════════════════════════════════════════════════════════
// REFERENCE CARDS
// ═══════════════════════════════════════════════════════════════════
function aclSimRefCards() {
  const cards = [
    {
      label: 'Wildcard Mask Logic', color: 'var(--cyan)',
      content: `0 = must match that bit<br>1 = "don't care" (any value)<br><br>
        <span style="color:var(--cyan);">host X</span> → 0.0.0.0 wildcard (/32)<br>
        <span style="color:var(--cyan);">any</span>   → 255.255.255.255 wildcard<br>
        /24 network → 0.0.0.255 wildcard<br>
        /16 network → 0.0.255.255 wildcard`,
    },
    {
      label: 'Standard vs Extended', color: 'var(--amber)',
      content: `<span style="color:var(--purple);">Standard (1–99/1300–1999):</span><br>
        Filter on Source IP only<br>Place close to <em>destination</em><br><br>
        <span style="color:var(--amber);">Extended (100–199/2000–2699):</span><br>
        5-tuple: Proto, Src, SrcPort, Dst, DstPort<br>
        Place close to <em>source</em>`,
    },
    {
      label: 'Evaluation Rules', color: 'var(--green)',
      content: `→ <strong>Top-down</strong> evaluation<br>
        → <strong>First match wins</strong> — stop immediately<br>
        → <strong>Implicit deny</strong> at end (if no match)<br>
        → No match = packet DROPPED<br>
        → Order of rules is CRITICAL`,
    },
    {
      label: 'Cisco IOS Syntax', color: 'var(--blue)',
      content: `<span style="color:var(--blue);">Standard:</span><br>
        access-list 10 permit host 192.168.1.1<br>
        access-list 10 deny 10.0.0.0 0.255.255.255<br><br>
        <span style="color:var(--amber);">Extended:</span><br>
        access-list 101 deny tcp any any eq 23<br>
        access-list 101 permit ip any any`,
    },
    {
      label: 'Named & Time-Based', color: 'var(--cyan)',
      content: `<span style="color:var(--cyan);">Named:</span><br>
        ip access-list extended PERMIT_WEB<br>
        &nbsp;10 permit tcp any any eq 443<br><br>
        <span style="color:var(--blue);">Time-based:</span><br>
        time-range BUSINESS_HOURS<br>
        &nbsp;periodic weekdays 08:00 to 18:00`,
    },
    {
      label: 'Apply to Interface', color: 'var(--purple)',
      content: `interface GigabitEthernet0/0<br>
        &nbsp;ip access-group 10 <span style="color:var(--green);">in</span><br>
        &nbsp;ip access-group 20 <span style="color:var(--red);">out</span><br><br>
        <span style="color:var(--muted);">IPv6:</span><br>
        ipv6 traffic-filter BLOCK_REDIRECT in<br>
        <span style="color:var(--muted);">Verify:</span> show ip access-lists`,
    },
    {
      label: 'TAC Troubleshooting', color: 'var(--red)',
      content: `show ip access-lists → hit counters<br>
        debug ip packet detail → per-packet<br>
        show ip interface Gi0/0 → ACL attached?<br><br>
        <span style="color:var(--red);">Common mistakes:</span><br>
        Wrong interface direction (in vs out)<br>
        Standard ACL too close to source`,
    },
  ];
  return cards.map(c => `
    <div style="background:var(--bg3);border-radius:8px;padding:12px;border:1px solid var(--border);">
      <div style="font-family:var(--mono);font-size:9px;font-weight:700;color:${c.color};margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px;">${c.label}</div>
      <div style="font-family:var(--mono);font-size:10px;color:var(--muted2);line-height:1.8;">${c.content}</div>
    </div>`).join('');
}

// ═══════════════════════════════════════════════════════════════════
// PAGE INIT
// ═══════════════════════════════════════════════════════════════════
function aclSimInit() {
  const page = document.getElementById('page-acl-sim');
  if (!page) return;

  const scenTabs = ACL_SIM_SCENARIOS.map((sc, i) =>
    `<button id="acls-sc-${i}" class="speed-btn${i===0?' active':''}" onclick="aclSimSetScenario(${i})" style="font-size:11px;">
      <span style="color:${sc.badgeColor};font-weight:700;margin-right:4px;">[${sc.badge}]</span>${sc.title}
    </button>`
  ).join('');

  // Tab bar CSS
  const tabStyle = `background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:6px 14px;
    font-family:var(--mono);font-size:11px;cursor:pointer;color:var(--muted2);transition:all 0.2s;`;
  const tabActiveStyle = `background:rgba(91,156,246,0.15);border:1px solid rgba(91,156,246,0.4);color:var(--blue);`;

  page.innerHTML = `
<style>
  .acl-tab-btn { ${tabStyle} }
  .acl-tab-btn.active { ${tabActiveStyle} }
  
  /* Layout Updates for Scenario Info Concept */
  .main-grid { display: grid; grid-template-columns: 1fr 340px; gap: 14px; align-items: start; }
  @media(max-width:950px){ .main-grid { grid-template-columns: 1fr; } }
  
  /* Scenario Info Block Styles */
  .acl-code {
    background: rgba(10, 15, 30, 0.4); border: 1px solid var(--border); border-radius: 6px;
    padding: 12px 14px; font-family: var(--mono); font-size: 11px;
    line-height: 1.8; margin-bottom: 12px; overflow-x: auto;
  }
  .pkt-header {
    background: rgba(10, 15, 30, 0.4); border: 1px solid var(--border); border-radius: 6px;
    padding: 10px 14px; font-family: var(--mono); font-size: 10px; margin-bottom: 12px;
  }
  .pkt-row { display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px solid rgba(255,255,255,0.03); }
  .pkt-row:last-child { border-bottom: none; }
  .pkt-label { color: var(--muted); }
  .pkt-val { color: var(--text); font-weight: 600; text-align: right; }
</style>

<div class="page-header">
  <div class="page-title">ACL Simulator
    <span class="tag" style="background:rgba(74,222,128,0.12);color:var(--green);font-size:11px;padding:3px 10px;border-radius:5px;font-weight:700;margin-left:8px;">v2 Enhanced</span>
  </div>
  <div class="page-desc">Step through ACL evaluation · Build custom packets · Edit rules · Take the quiz · Track hit counters</div>
</div>

<div class="card" style="margin-bottom:14px;">
  <div class="card-hdr">📋 Select Scenario</div>
  <div class="speed-group" style="flex-wrap:wrap;gap:6px;padding:12px 16px;">${scenTabs}</div>
</div>

<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;">
  <button id="acl-tab-sim"     class="acl-tab-btn active" onclick="aclSetTab('sim')">🎬 Simulator</button>
  <button id="acl-tab-builder" class="acl-tab-btn"        onclick="aclSetTab('builder')">🛠 Packet Builder</button>
  <button id="acl-tab-editor"  class="acl-tab-btn"        onclick="aclSetTab('editor')">✏️ Rule Editor</button>
  <button id="acl-tab-quiz"    class="acl-tab-btn"        onclick="aclSetTab('quiz')">🧠 Quiz Mode</button>
  <button id="acl-tab-log"     class="acl-tab-btn"        onclick="aclSetTab('log')">📜 Packet Log</button>
</div>

<div id="acl-panel-sim">
  <div class="main-grid">
  
    <div class="sim-left">
      <div class="topo-wrap" style="margin-bottom:14px;">
        <div class="topo-label">Network Topology — Router with inbound ACL applied on Gi0/0</div>
        <div id="acls-topo"></div>
      </div>

      <div class="progress-bar"><div class="progress-fill" id="acls-progress" style="width:0%"></div></div>
      <div class="ctrl-bar" style="margin-bottom:14px;">
        <button class="btn btn-primary" onclick="aclSimStep(-1)">◀ Prev</button>
        <button class="btn btn-play" id="acls-play-btn" onclick="aclSimTogglePlay()">▶ Play</button>
        <button class="btn btn-primary" onclick="aclSimStep(1)">Next ▶</button>
        <button class="btn btn-reset"   onclick="aclSimReset()">↺ Reset</button>
        <div class="speed-group">
          <span class="speed-label">Speed</span>
          <button class="speed-btn" id="acl-spd-slow"   onclick="setAclSimSpeed('slow')">🐢</button>
          <button class="speed-btn active" id="acl-spd-normal" onclick="setAclSimSpeed('normal')">⚡</button>
          <button class="speed-btn" id="acl-spd-fast"   onclick="setAclSimSpeed('fast')">🚀</button>
        </div>
        <div class="step-counter">Step <span id="acls-step-num">1</span> / <span id="acls-step-total">3</span></div>
      </div>

      <div class="dns-chain" id="acls-chain" style="margin-bottom:14px;"></div>

      <div class="step-info" style="margin-bottom:14px;">
        <div class="step-tag" id="acls-step-tag" style="background:rgba(91,156,246,0.12);color:var(--blue);">READY</div>
        <div class="step-title" id="acls-step-title">Select a scenario and press ▶ Play</div>
        <div class="step-desc"  id="acls-step-desc">Watch how the router evaluates each ACL rule top-down, stops at the first match, and applies permit or deny.</div>
      </div>

      <div id="acls-verdict" style="display:none;border-radius:8px;padding:12px 16px;margin-bottom:14px;font-family:var(--mono);font-weight:700;font-size:13px;text-align:center;"></div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px;">
        <div class="card" style="margin-bottom:0;">
          <div class="card-hdr">📄 ACL Rules (top-down evaluation)</div>
          <div id="acls-rules-panel"></div>
        </div>
        <div class="card" style="margin-bottom:0;">
          <div class="card-hdr">📦 Packet Fields &amp; Match Result</div>
          <div id="acls-pkt-fields"></div>
        </div>
      </div>

      <div class="card" style="margin-bottom:14px;">
        <div class="card-hdr">📊 Hit Counter Dashboard — <span style="color:var(--muted);font-size:10px;">show ip access-lists equivalent</span></div>
        <div id="acls-hit-counters"></div>
      </div>
    </div>
    
    <div class="sim-right">
      <div class="card">
        <div class="card-hdr">🗂 Scenario Info</div>
        <div style="padding:16px;">
          <span id="acls-sc-badge" style="font-family:var(--mono);font-size:9px;font-weight:700;padding:3px 10px;border-radius:5px;display:inline-block;margin-bottom:10px;border:1px solid currentColor;">STANDARD</span>
          <div id="acls-sc-title" style="font-size:15px;font-weight:700;color:var(--text);margin-bottom:6px;"></div>
          <div id="acls-sc-desc" style="font-size:12px;color:var(--muted2);line-height:1.5;margin-bottom:16px;"></div>

          <div class="card-hdr" style="background:none;border:none;padding:0 0 6px 0;">CLI Config</div>
          <div class="acl-code" id="acls-cli-code"></div>

          <div class="card-hdr" style="background:none;border:none;padding:0 0 6px 0;">Test Packet</div>
          <div class="pkt-header" id="acls-pkt-header"></div>
        </div>
      </div>
    </div>
    
  </div>
</div>

<div id="acl-panel-builder" style="display:none;">
  <div class="card">
    <div class="card-hdr">🛠 Custom Packet Builder — Test Any Packet Against Current ACL</div>
    <div id="acl-builder-body"></div>
  </div>
</div>

<div id="acl-panel-editor" style="display:none;">
  <div class="card">
    <div class="card-hdr">✏️ ACL Rule Editor — Modify, Reorder &amp; Add Rules</div>
    <div id="acl-editor-body"></div>
  </div>
</div>

<div id="acl-panel-quiz" style="display:none;">
  <div class="card">
    <div class="card-hdr">🧠 Quiz Mode — Predict the Verdict</div>
    <div id="acl-quiz-body"></div>
  </div>
</div>

<div id="acl-panel-log" style="display:none;">
  <div class="card">
    <div class="card-hdr">📜 Packet Log — Session History
      <button onclick="aclSim.packetLog=[];aclRenderLog();" style="margin-left:auto;background:rgba(248,113,113,0.1);border:1px solid rgba(248,113,113,0.3);color:var(--red);border-radius:4px;padding:2px 8px;font-family:var(--mono);font-size:9px;cursor:pointer;">Clear Log</button>
    </div>
    <div style="font-family:var(--mono);font-size:9px;color:var(--muted);margin-bottom:8px;display:grid;grid-template-columns:60px 1fr 1fr 70px 90px 1fr 80px;gap:6px;padding:4px 10px;">
      <span>TIME</span><span>SRC IP</span><span>DST IP</span><span>PROTO</span><span>PORT</span><span>MATCHED RULE</span><span style="text-align:right;">VERDICT</span>
    </div>
    <div id="acl-log-body"></div>
  </div>
</div>

<div class="card" style="margin-top:14px;">
  <div class="card-hdr">📚 ACL Quick Reference — TAC Engineer Level</div>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;">
    ${aclSimRefCards()}
  </div>
  <div style="margin-top:10px;font-family:var(--mono);font-size:9.5px;color:var(--muted);line-height:1.8;border-top:1px solid var(--border);padding-top:8px;">
    <span style="color:var(--blue);">show ip access-lists</span> — see hit counters per rule &nbsp;|&nbsp;
    <span style="color:var(--amber);">debug ip packet</span> — live per-packet match trace &nbsp;|&nbsp;
    <span style="color:var(--cyan);">access-list sequence reorder:</span> ip access-list resequence &lt;name&gt; 10 10
  </div>
</div>
`;

  aclSimSetScenario(0);
  aclSetTab('sim');
}