// ═══════════════════════════════════════════════════════════════════════════
// EIGRP DUAL SIMULATOR — eigrp.js
// Scenarios:
//   0 — Neighborship Formation   (Hello → Init Update → Full Update → ADJACENT)
//   1 — DUAL Calculation         (Successor, Feasible Successor, FC math)
//   2 — Feasible Successor Failover (link fail → instant FS promotion, no query)
//   3 — DUAL Goes Active         (no FS → Query flood → Reply → PASSIVE)
// Page: page-eigrp  |  Entry: eigrpInit()  |  Resize: eigrpRedraw()
// ═══════════════════════════════════════════════════════════════════════════

'use strict';

// ─── State ──────────────────────────────────────────────────────────────────
let eigrp = {
  scenario:  0,
  step:      0,
  playing:   false,
  playTimer: null,
  animId:    null,
  speedMode: 'normal',
};

// ─── Speed helpers ───────────────────────────────────────────────────────────
function eigrpGetSegDur()    { return { slow:2200, normal:1050, fast:450 }[eigrp.speedMode]; }
function eigrpGetAutoDelay() { return { slow:5500, normal:2600, fast:1200 }[eigrp.speedMode]; }

function setEigrpSpeed(s) {
  eigrp.speedMode = s;
  ['slow','normal','fast'].forEach(x => {
    const el = document.getElementById('eigrp-spd-' + x);
    if (el) el.classList.toggle('active', x === s);
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// NODE POSITIONS — per scenario
// ═══════════════════════════════════════════════════════════════════════════
const EIGRP_NODES = {
  neighbor: {
    r1: { x: 140, y: 145 },
    r2: { x: 600, y: 145 },
  },
  dual: {
    r1:   { x: 110, y: 160 },
    r2:   { x: 380, y:  75 },
    r3:   { x: 380, y: 245 },
    dest: { x: 640, y: 160 },
  },
  failover: {
    r1:   { x: 110, y: 160 },
    r2:   { x: 380, y:  75 },
    r3:   { x: 380, y: 245 },
    dest: { x: 640, y: 160 },
  },
  active: {
    r1: { x: 110, y: 160 },
    r2: { x: 350, y:  85 },
    r3: { x: 350, y: 235 },
    r4: { x: 590, y: 235 },
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// SCENARIO DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════
const EIGRP_SCENARIOS = [

  // ─────────────────────────────────────────────────────────────────────
  // 0 — EIGRP NEIGHBOR ADJACENCY FORMATION
  // ─────────────────────────────────────────────────────────────────────
  {
    id: 'neighbor',
    title: 'Neighbor Adjacency Formation',
    badge: 'NEIGHBORSHIP', badgeColor: 'var(--blue)',
    desc: 'Watch how two EIGRP routers form a full adjacency — from multicast Hello to database exchange and bidirectional neighbor state.',
    topoLabel: 'R1 (10.1.0.1) ←──GigE──→ R2 (10.1.0.2) | AS 100 | K-values: 1,0,1,0,0',
    steps: [
      {
        title: 'Step 1 — R1 Sends EIGRP Hello (Multicast)',
        tag: 'HELLO', tagColor: 'var(--blue)', tagBg: 'rgba(91,156,246,0.12)',
        desc: 'R1 sends an <strong>EIGRP Hello packet</strong> to the multicast address <strong>224.0.0.10</strong> (All EIGRP Routers). Hello packets are sent every <strong>5 seconds</strong> on LAN interfaces (60s on NBMA). They carry: AS number, K-values, Hold Time, and the router\'s IP. Hellos are <em>unreliable</em> — no acknowledgement required.',
        from: 'r1', to: 'r2', pktColor: '#5b9cf6', pktLabel: 'HELLO',
        activeNodes: ['r1'],
        neighborState: { r1: 'DOWN', r2: 'DOWN' },
        topoTable: null,
        fields: [
          { k: 'EIGRP Opcode',     v: '5 — Hello',                              c: 'var(--blue)'   },
          { k: 'Destination',      v: '224.0.0.10 (multicast — EIGRP group)',    c: 'var(--cyan)'   },
          { k: 'AS Number',        v: '100 (must match neighbor)',               c: 'var(--amber)'  },
          { k: 'K-values',         v: 'K1=1, K2=0, K3=1, K4=0, K5=0',          c: 'var(--purple)' },
          { k: 'Hold Time',        v: '15 seconds (3× hello = default)',                            },
          { k: 'Router ID',        v: '1.1.1.1 (highest loopback or interface)'                    },
          { k: 'Auth?',            v: 'MD5 or SHA-256 (if configured)',          c: 'var(--muted2)' },
          { k: 'R1 State',         v: 'DOWN (no neighbors yet)',                 c: 'var(--red)'    },
        ],
      },
      {
        title: 'Step 2 — R2 Validates Hello & Checks Neighborship Requirements',
        tag: 'VALIDATE', tagColor: 'var(--amber)', tagBg: 'rgba(251,191,36,0.12)',
        desc: 'R2 receives R1\'s Hello and validates <strong>4 critical parameters</strong> that must match before adjacency forms: (1) <strong>Same AS number</strong>, (2) <strong>Same K-values</strong>, (3) <strong>Subnet match</strong> (primary IP same subnet), (4) <strong>Authentication</strong> (if configured). If any fail → no adjacency. If all pass → R2 adds R1 to its neighbor table.',
        from: 'r2', to: 'r1', pktColor: '#fbbf24', pktLabel: 'CHECK',
        activeNodes: ['r1', 'r2'],
        neighborState: { r1: 'DOWN', r2: 'INIT' },
        topoTable: null,
        fields: [
          { k: 'AS number match?', v: '100 = 100 ✓',                            c: 'var(--green)'  },
          { k: 'K-values match?',  v: '1,0,1,0,0 = 1,0,1,0,0 ✓',               c: 'var(--green)'  },
          { k: 'Same subnet?',     v: '10.1.0.1 & 10.1.0.2 in /30 ✓',          c: 'var(--green)'  },
          { k: 'Auth check',       v: 'Disabled → skip ✓',                      c: 'var(--green)'  },
          { k: 'R2 action',        v: 'Add R1 to neighbor table — send Hello',  c: 'var(--cyan)'   },
          { k: 'Hold Timer',       v: '15s countdown starts — reset on each Hello'                  },
          { k: 'Mismatch result',  v: 'Adjacency refused (log message emitted)', c: 'var(--red)'   },
          { k: 'R2 State',         v: 'INIT — awaiting bidirectional confirmation', c: 'var(--amber)' },
        ],
      },
      {
        title: 'Step 3 — R2 Sends Hello Reply + Init Update (Null Update)',
        tag: 'HELLO + INIT', tagColor: 'var(--purple)', tagBg: 'rgba(167,139,250,0.12)',
        desc: 'R2 sends a <strong>Hello back to R1</strong> (unicast), then immediately sends a <strong>NULL Update with the INIT bit set</strong>. The INIT bit signals "I\'m starting database exchange with you." The NULL update carries no routes yet — it\'s just a synchronisation handshake. R2\'s neighbor table now shows R1 as INIT.',
        from: 'r2', to: 'r1', pktColor: '#a78bfa', pktLabel: 'INIT\nUPDATE',
        activeNodes: ['r1', 'r2'],
        neighborState: { r1: 'INIT', r2: 'INIT' },
        topoTable: null,
        fields: [
          { k: 'EIGRP Opcode',     v: '1 — Update (with INIT bit set)',          c: 'var(--purple)' },
          { k: 'INIT bit',         v: '1 — "Begin database synchronisation"',    c: 'var(--amber)'  },
          { k: 'Route TLVs',       v: 'None (NULL update — no routes yet)',      c: 'var(--muted2)' },
          { k: 'Reliability',      v: 'RTP — Reliable Transport Protocol',       c: 'var(--cyan)'   },
          { k: 'Sequence #',       v: '1 (R2 → R1, must be ACKed by R1)',                          },
          { k: 'ACK required?',    v: 'YES — Update uses reliable delivery',     c: 'var(--amber)'  },
          { k: 'R1 State',         v: 'INIT (received Hello from R2)',            c: 'var(--amber)'  },
          { k: 'R2 State',         v: 'INIT (sent INIT Update)',                  c: 'var(--amber)'  },
        ],
      },
      {
        title: 'Step 4 — R1 Sends Full Topology Update to R2',
        tag: 'FULL UPDATE', tagColor: 'var(--cyan)', tagBg: 'rgba(56,217,192,0.12)',
        desc: 'R1 ACKs the INIT Update, then sends its <strong>full EIGRP topology</strong> to R2. This includes all routes R1 knows: connected networks (with metric), and any routes learned from other EIGRP neighbors. The Update uses <strong>RTP (Reliable Transport Protocol)</strong> — R2 must ACK each packet. This ensures zero topology loss during exchange.',
        from: 'r1', to: 'r2', pktColor: '#38d9c0', pktLabel: 'UPDATE\nRoutes',
        activeNodes: ['r1', 'r2'],
        neighborState: { r1: 'UP', r2: 'INIT' },
        topoTable: { show: true, state: 'partial', routes: [
          { prefix:'10.1.0.0/30', via:'Connected', fd:256,  rd:0,    state:'P', role:'local' },
        ]},
        fields: [
          { k: 'EIGRP Opcode',     v: '1 — Update (full routes)',                c: 'var(--cyan)'   },
          { k: 'INIT bit',         v: '0 — Full update (routes included)',        c: 'var(--green)'  },
          { k: 'TLVs included',    v: 'One per route: prefix, mask, metric',                        },
          { k: 'Composite Metric', v: '256×(BW+Delay) per route',                c: 'var(--amber)'  },
          { k: 'RTP Seq #',        v: '2 (increments per reliable packet)',                         },
          { k: '10.1.0.0/30',      v: 'Connected — Metric=256 (GigE)',           c: 'var(--green)'  },
          { k: '192.168.1.0/24',   v: 'Loopback — Metric=128',                  c: 'var(--green)'  },
          { k: 'R1 State',         v: 'UP — adjacency from R1\'s perspective',   c: 'var(--green)'  },
        ],
      },
      {
        title: 'Step 5 — R2 Sends Full Topology Update + ACK',
        tag: 'FULL UPDATE', tagColor: 'var(--cyan)', tagBg: 'rgba(56,217,192,0.12)',
        desc: 'R2 ACKs R1\'s Update, then sends its own <strong>full topology</strong> back to R1. The exchange is now <strong>bidirectional</strong>. Once R1 ACKs this last Update, both routers consider the adjacency <strong>FULL</strong>. They run <strong>DUAL</strong> on the combined topology database and install best routes.',
        from: 'r2', to: 'r1', pktColor: '#38d9c0', pktLabel: 'UPDATE\nRoutes',
        activeNodes: ['r1', 'r2'],
        neighborState: { r1: 'UP', r2: 'UP' },
        topoTable: { show: true, state: 'full', routes: [
          { prefix:'10.1.0.0/30',   via:'Connected',    fd:256,   rd:0,    state:'P', role:'local'     },
          { prefix:'10.2.0.0/24',   via:'10.1.0.2/R2', fd:28416, rd:28160, state:'P', role:'successor' },
          { prefix:'192.168.2.0/24',via:'10.1.0.2/R2', fd:28544, rd:28288, state:'P', role:'successor' },
        ]},
        fields: [
          { k: 'EIGRP Opcode',     v: '1 — Update (full routes from R2)',        c: 'var(--cyan)'   },
          { k: 'R2 routes',        v: '10.2.0.0/24, 192.168.2.0/24, ...',       c: 'var(--green)'  },
          { k: 'DUAL runs',        v: 'Both routers compute Successor/FS',       c: 'var(--amber)'  },
          { k: 'FD calc',          v: 'FD = local_link_cost + neighbor_RD',                         },
          { k: 'Adjacency',        v: 'FULL — both routers show each other UP',  c: 'var(--green)'  },
          { k: 'Route installed',  v: '10.2.0.0/24 → R2 (GigE link) in RIB',   c: 'var(--green)'  },
          { k: 'R1 State',         v: '✅ UP — ADJACENT',                        c: 'var(--green)'  },
          { k: 'R2 State',         v: '✅ UP — ADJACENT',                        c: 'var(--green)'  },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  // 1 — DUAL CALCULATION: Successor & Feasible Successor
  // ─────────────────────────────────────────────────────────────────────
  {
    id: 'dual',
    title: 'DUAL Calculation — Successor & Feasible Successor',
    badge: 'DUAL MATH', badgeColor: 'var(--cyan)',
    desc: 'R1 learns 10.2.0.0/24 from three neighbors. DUAL selects the <strong>Successor</strong> (best path) and identifies <strong>Feasible Successors</strong> using the Feasibility Condition: <em>RD &lt; FD</em>.',
    topoLabel: 'R1 computes DUAL for 10.2.0.0/24 → learned via R2, R3 | AS 100',
    steps: [
      {
        title: 'Step 1 — R1 Receives Updates from All Neighbors',
        tag: 'UPDATES IN', tagColor: 'var(--blue)', tagBg: 'rgba(91,156,246,0.12)',
        desc: 'R1 receives EIGRP Update packets from <strong>R2</strong> and <strong>R3</strong> for destination <strong>10.2.0.0/24</strong>. Each update contains the neighbor\'s own <strong>Feasible Distance (RD)</strong> to the destination — called the <strong>Reported Distance (RD)</strong> or <em>Advertised Distance (AD)</em> from R1\'s perspective. DUAL will use these RD values to select paths and check the Feasibility Condition.',
        from: 'r2', to: 'r1', pktColor: '#5b9cf6', pktLabel: 'UPDATE\n10.2/24',
        from2: 'r3', activeNodes: ['r1', 'r2', 'r3', 'dest'],
        topoTable: { show: true, state: 'receiving', routes: [
          { prefix:'10.2.0.0/24', via:'10.1.12.2/R2', fd:'?', rd:2000, state:'P', role:'?', note:'RD=2000 from R2' },
          { prefix:'10.2.0.0/24', via:'10.1.13.3/R3', fd:'?', rd:3000, state:'P', role:'?', note:'RD=3000 from R3' },
        ]},
        fields: [
          { k: 'Destination',      v: '10.2.0.0/24',                             c: 'var(--cyan)'   },
          { k: 'Update from R2',   v: 'RD = 2000 (R2\'s FD to 10.2.0.0/24)',    c: 'var(--blue)'   },
          { k: 'Update from R3',   v: 'RD = 3000 (R3\'s FD to 10.2.0.0/24)',    c: 'var(--purple)' },
          { k: 'Link cost R1→R2',  v: '1000 (FastEthernet 100Mbps, delay 1ms)',  c: 'var(--muted2)' },
          { k: 'Link cost R1→R3',  v: '1500 (FastEthernet, higher delay)',       c: 'var(--muted2)' },
          { k: 'RD = AD',          v: 'Reported Distance = neighbor\'s own FD',  c: 'var(--amber)'  },
          { k: 'DUAL will',        v: 'Compute FD = link_cost + RD for each path'                   },
          { k: 'State',            v: 'PASSIVE (P) — still computing',           c: 'var(--amber)'  },
        ],
      },
      {
        title: 'Step 2 — DUAL Computes Feasible Distance for Each Path',
        tag: 'FD CALC', tagColor: 'var(--amber)', tagBg: 'rgba(251,191,36,0.12)',
        desc: 'DUAL computes the <strong>Feasible Distance (FD)</strong> for each path:<br><br>→ <strong>Via R2:</strong> FD = R1→R2 link (1000) + R2\'s RD (2000) = <strong>3000</strong><br>→ <strong>Via R3:</strong> FD = R1→R3 link (1500) + R3\'s RD (3000) = <strong>4500</strong><br><br>The path with the <strong>lowest FD</strong> is selected as the <strong>Successor</strong>. FD is the total composite metric from THIS router to the destination.',
        from: 'r1', to: 'r1', pktColor: '#fbbf24', pktLabel: 'DUAL\nCALC',
        activeNodes: ['r1'],
        topoTable: { show: true, state: 'computing', routes: [
          { prefix:'10.2.0.0/24', via:'10.1.12.2/R2', fd:3000, rd:2000, state:'P', role:'best?',  note:'1000+2000=3000' },
          { prefix:'10.2.0.0/24', via:'10.1.13.3/R3', fd:4500, rd:3000, state:'P', role:'check?', note:'1500+3000=4500' },
        ]},
        fields: [
          { k: 'FD Formula',       v: 'FD = local_link_cost + neighbor_RD',      c: 'var(--amber)'  },
          { k: 'Via R2',           v: 'FD = 1000 + 2000 = 3000',                 c: 'var(--blue)'   },
          { k: 'Via R3',           v: 'FD = 1500 + 3000 = 4500',                 c: 'var(--purple)' },
          { k: 'Best FD?',         v: '3000 (via R2) < 4500 (via R3)',           c: 'var(--green)'  },
          { k: 'Successor',        v: 'R2 — lowest FD = 3000',                   c: 'var(--green)'  },
          { k: 'FD locked',        v: 'Best FD (3000) stored — used for FC check',c: 'var(--cyan)'  },
          { k: 'Real metric',      v: '256×(10^7/BW_kbps + delay/10) per link', c: 'var(--muted2)' },
          { k: 'PASSIVE state',    v: 'No queries sent — still local calculation',c: 'var(--green)'  },
        ],
      },
      {
        title: 'Step 3 — Feasibility Condition Check: Is R3 a Feasible Successor?',
        tag: 'FC CHECK', tagColor: 'var(--purple)', tagBg: 'rgba(167,139,250,0.12)',
        desc: 'For each non-Successor neighbor, DUAL checks the <strong>Feasibility Condition (FC)</strong>:<br><br><strong>FC: Neighbor\'s RD &lt; Successor\'s FD</strong><br><br>→ R3\'s RD = 3000. Successor FD = 3000.<br>→ 3000 &lt; 3000? <strong>NO — equal, not less!</strong> R3 does NOT meet FC.<br><br>The FC guarantees <strong>loop-free paths</strong>. A neighbor with RD ≥ FD might route through R1, creating a loop. Strict less-than is required.',
        from: 'r1', to: 'r1', pktColor: '#a78bfa', pktLabel: 'FC\nCHECK',
        activeNodes: ['r1', 'r3'],
        topoTable: { show: true, state: 'fc', routes: [
          { prefix:'10.2.0.0/24', via:'10.1.12.2/R2', fd:3000, rd:2000, state:'P', role:'Successor', note:'Lowest FD' },
          { prefix:'10.2.0.0/24', via:'10.1.13.3/R3', fd:4500, rd:3000, state:'P', role:'✗ Not FS',   note:'RD 3000 ≥ FD 3000' },
        ]},
        fields: [
          { k: 'Feasibility Cond', v: 'R3\'s RD < Successor FD',                 c: 'var(--purple)' },
          { k: 'R3\'s RD',         v: '3000',                                    c: 'var(--amber)'  },
          { k: 'Successor FD',     v: '3000',                                    c: 'var(--blue)'   },
          { k: 'FC result',        v: '3000 < 3000? NO (equal) → NOT a FS',     c: 'var(--red)'    },
          { k: 'Why strict <?',    v: 'Equal cost might loop through R1',        c: 'var(--red)'    },
          { k: 'Loop proof',       v: 'If RD ≥ FD, neighbor\'s path may go via R1', c: 'var(--muted2)' },
          { k: 'R3 status',        v: 'Non-Successor, Non-FS — stays in topo table', c: 'var(--muted2)' },
          { k: 'On R2 fail',       v: 'R3 is NOT FS → DUAL must go ACTIVE (queries!)', c: 'var(--red)' },
        ],
      },
      {
        title: 'Step 4 — Successor Installed: Route in RIB & FIB',
        tag: 'ROUTE UP ✅', tagColor: 'var(--green)', tagBg: 'rgba(74,222,128,0.12)',
        desc: 'DUAL is complete. The <strong>Successor (R2)</strong> is installed into the <strong>Routing Information Base (RIB)</strong> as the best path. The RIB programs the <strong>FIB (Forwarding Information Base / CEF table)</strong> for fast hardware forwarding. The route shows <code>D 10.2.0.0/24 [90/3000] via 10.1.12.2</code> in the routing table. State = <strong>PASSIVE</strong> (stable).',
        from: 'r1', to: 'dest', pktColor: '#4ade80', pktLabel: 'DATA\n→Dest',
        activeNodes: ['r1', 'r2', 'dest'],
        topoTable: { show: true, state: 'installed', routes: [
          { prefix:'10.2.0.0/24', via:'10.1.12.2/R2', fd:3000, rd:2000, state:'P', role:'Successor', note:'✅ In RIB/FIB' },
          { prefix:'10.2.0.0/24', via:'10.1.13.3/R3', fd:4500, rd:3000, state:'P', role:'Non-FS',    note:'In topo table only' },
        ]},
        fields: [
          { k: 'Route in RIB',     v: 'D 10.2.0.0/24 [90/3000] via 10.1.12.2', c: 'var(--green)'  },
          { k: 'AD/FD',            v: '[AD=90 / FD=3000] (EIGRP internal=90)',  c: 'var(--green)'  },
          { k: 'CEF entry',        v: '10.2.0.0/24 → GigE0/1 (next-hop R2)',   c: 'var(--cyan)'   },
          { k: 'DUAL State',       v: 'PASSIVE — no queries, topology stable',  c: 'var(--green)'  },
          { k: 'Topo table R3',    v: 'Kept — but NOT used for forwarding',     c: 'var(--muted2)' },
          { k: 'Verify cmd',       v: 'show ip eigrp topology 10.2.0.0/24',    c: 'var(--blue)'   },
          { k: 'Verify cmd 2',     v: 'show ip route eigrp',                   c: 'var(--blue)'   },
          { k: 'Verify cmd 3',     v: 'show ip cef 10.2.0.0/24 detail',        c: 'var(--blue)'   },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  // 2 — FEASIBLE SUCCESSOR FAILOVER (Fast Convergence)
  // ─────────────────────────────────────────────────────────────────────
  {
    id: 'failover',
    title: 'Feasible Successor Failover — Sub-Second Convergence',
    badge: 'FAST CONV', badgeColor: 'var(--green)',
    desc: 'R2 link fails. R3 is a <strong>Feasible Successor</strong> (RD=1500 &lt; FD=3000 ✓). DUAL promotes R3 <em>instantly</em> — no queries needed. Watch sub-second convergence.',
    topoLabel: 'R1 → R2 (Successor, FD=3000) + R3 (FS: RD=1500 < FD=3000 ✓) | 10.2.0.0/24',
    steps: [
      {
        title: 'Step 1 — Stable State: Successor R2, Feasible Successor R3',
        tag: 'STABLE', tagColor: 'var(--green)', tagBg: 'rgba(74,222,128,0.12)',
        desc: 'Starting state: R1 forwards 10.2.0.0/24 via <strong>R2 (Successor, FD=3000)</strong>. R3 qualifies as a <strong>Feasible Successor</strong> because its RD=1500 &lt; Successor FD=3000 — the Feasibility Condition is satisfied. R3 is in R1\'s topology table and ready for instant promotion if R2 fails.',
        from: 'r1', to: 'dest', pktColor: '#4ade80', pktLabel: 'DATA\n→ R2',
        activeNodes: ['r1', 'r2', 'dest'],
        topoTable: { show: true, state: 'stable', routes: [
          { prefix:'10.2.0.0/24', via:'10.1.12.2/R2', fd:3000, rd:2000, state:'P', role:'Successor', note:'✅ Active path' },
          { prefix:'10.2.0.0/24', via:'10.1.13.3/R3', fd:2500, rd:1500, state:'P', role:'FS ✓',      note:'RD 1500 < FD 3000' },
        ]},
        fields: [
          { k: 'Active path',      v: 'R2 (Successor) — FD=3000, RD=2000',      c: 'var(--green)'  },
          { k: 'Backup path',      v: 'R3 (FS) — FD=2500, RD=1500',             c: 'var(--cyan)'   },
          { k: 'FC verified',      v: 'R3 RD (1500) < Successor FD (3000) ✓',   c: 'var(--green)'  },
          { k: 'FS means',         v: 'Loop-free backup — no query needed',      c: 'var(--amber)'  },
          { k: 'State',            v: 'PASSIVE — both paths stable',             c: 'var(--green)'  },
          { k: 'DUAL guarantee',   v: 'FS is mathematically loop-free',          c: 'var(--cyan)'   },
          { k: 'Note',             v: 'R3 path is actually FASTER (FD=2500)',    c: 'var(--muted2)' },
          { k: 'Verify',           v: 'show ip eigrp topology 10.2.0.0/24',     c: 'var(--blue)'   },
        ],
      },
      {
        title: 'Step 2 — R2 Link Fails (Interface Down / Hold Timer Expires)',
        tag: 'LINK FAIL ⚡', tagColor: 'var(--red)', tagBg: 'rgba(248,113,113,0.12)',
        desc: 'The R1-R2 interface goes down (or R2\'s <strong>Hold Timer</strong> expires — 15 seconds of no Hellos). DUAL detects the Successor is lost. Before sending any queries, it scans the topology table: <strong>Does any other neighbor meet the Feasibility Condition?</strong> The answer determines whether convergence is instant (FS exists) or requires active querying.',
        from: 'r1', to: 'r1', pktColor: '#f87171', pktLabel: 'R2\nDOWN', drop: true,
        activeNodes: ['r1', 'r3'],
        linkFail: 'r2',
        topoTable: { show: true, state: 'fail', routes: [
          { prefix:'10.2.0.0/24', via:'10.1.12.2/R2', fd:3000, rd:2000, state:'P', role:'⚡ FAILED', note:'Interface down' },
          { prefix:'10.2.0.0/24', via:'10.1.13.3/R3', fd:2500, rd:1500, state:'P', role:'FS ✓',      note:'Checking FC...' },
        ]},
        fields: [
          { k: 'Event',            v: 'Gi0/1 toward R2 goes DOWN',               c: 'var(--red)'    },
          { k: 'Successor',        v: 'R2 — REMOVED from topology table',        c: 'var(--red)'    },
          { k: 'DUAL question',    v: 'Any neighbor with RD < old FD (3000)?',   c: 'var(--amber)'  },
          { k: 'Check R3',         v: 'RD=1500 < old FD=3000? YES ✓',           c: 'var(--green)'  },
          { k: 'FS found!',        v: 'R3 qualifies — promote immediately',      c: 'var(--green)'  },
          { k: 'Query needed?',    v: 'NO — FS exists → PASSIVE stays PASSIVE', c: 'var(--green)'  },
          { k: 'Detection time',   v: 'Interface down: ms | Hold timer: ~15s',  c: 'var(--muted2)' },
          { k: 'BFD accelerates',  v: 'BFD detection sub-second (sub-1s fail)', c: 'var(--cyan)'   },
        ],
      },
      {
        title: 'Step 3 — FS Promoted to Successor — No Queries Sent',
        tag: 'FS PROMOTE ⚡', tagColor: 'var(--green)', tagBg: 'rgba(74,222,128,0.12)',
        desc: 'DUAL promotes R3 from <strong>Feasible Successor → Successor</strong> <em>atomically</em>. No QUERY packets are sent to any neighbor. The route stays in <strong>PASSIVE state</strong> throughout. New FD is locked at <strong>2500</strong> (R3\'s path). The RIB is updated and CEF re-programmed. Total convergence time: <strong>sub-second</strong> on interface-down events.',
        from: 'r1', to: 'dest', pktColor: '#4ade80', pktLabel: 'DATA\n→ R3',
        activeNodes: ['r1', 'r3', 'dest'],
        topoTable: { show: true, state: 'promoted', routes: [
          { prefix:'10.2.0.0/24', via:'10.1.13.3/R3', fd:2500, rd:1500, state:'P', role:'Successor ✅', note:'Promoted from FS' },
        ]},
        fields: [
          { k: 'New Successor',    v: 'R3 — FD=2500, RD=1500',                  c: 'var(--green)'  },
          { k: 'State remained',   v: 'PASSIVE throughout — zero disruption',    c: 'var(--green)'  },
          { k: 'Queries sent?',    v: 'NONE — FS promotion requires no queries', c: 'var(--green)'  },
          { k: 'New FD locked',    v: '2500 (new best — used for future FC)',    c: 'var(--cyan)'   },
          { k: 'RIB updated',      v: 'D 10.2.0.0/24 [90/2500] via 10.1.13.3', c: 'var(--green)'  },
          { k: 'CEF updated',      v: '10.2.0.0/24 → Gi0/2 next-hop R3',       c: 'var(--cyan)'   },
          { k: 'Conv. time',       v: '< 1 second (interface down trigger)',     c: 'var(--green)'  },
          { k: 'vs OSPF',          v: 'OSPF needs SPF recalculation — slower',  c: 'var(--muted2)' },
        ],
      },
      {
        title: 'Step 4 — R1 Notifies Downstream Neighbors via Update',
        tag: 'UPDATE OUT', tagColor: 'var(--cyan)', tagBg: 'rgba(56,217,192,0.12)',
        desc: 'R1 sends a <strong>partial Update</strong> to its downstream neighbors informing them of the topology change. Neighbors who were using R1 as their next-hop to 10.2.0.0/24 will re-run DUAL locally. R1 also sends a <strong>Goodbye message (Metric=∞)</strong> for the R2 path — poisoning the stale route in neighbors\' tables.',
        from: 'r1', to: 'r3', pktColor: '#38d9c0', pktLabel: 'UPDATE\nPartial',
        activeNodes: ['r1', 'r3', 'dest'],
        topoTable: { show: true, state: 'promoted', routes: [
          { prefix:'10.2.0.0/24', via:'10.1.13.3/R3', fd:2500, rd:1500, state:'P', role:'Successor ✅', note:'Forwarding active' },
        ]},
        fields: [
          { k: 'Update type',      v: 'Partial Update (only changed routes)',    c: 'var(--cyan)'   },
          { k: 'Poison for R2',    v: 'Metric=0xFFFFFFFF (∞) — route retract', c: 'var(--red)'    },
          { k: 'New metric adv.',  v: 'R3 path metric advertised to downstream',c: 'var(--green)'  },
          { k: 'Downstream DUAL',  v: 'Neighbors re-run DUAL with new info',    c: 'var(--amber)'  },
          { k: 'Split horizon',    v: 'R1 does NOT advertise back to R3',       c: 'var(--muted2)' },
          { k: 'RTP delivery',     v: 'Reliable — ACK required from each nbr', c: 'var(--cyan)'   },
          { k: 'Traffic',          v: 'Already flowing via R3 (CEF updated)',   c: 'var(--green)'  },
          { k: 'TAC verify',       v: 'show ip eigrp topology | show ip route', c: 'var(--blue)'   },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────
  // 3 — DUAL GOES ACTIVE: Query / Reply / SIA
  // ─────────────────────────────────────────────────────────────────────
  {
    id: 'active',
    title: 'DUAL Goes Active — Query / Reply / SIA',
    badge: 'ACTIVE STATE', badgeColor: 'var(--red)',
    desc: 'R2 fails. No Feasible Successor exists (R3\'s RD ≥ FD). DUAL goes <strong>ACTIVE</strong> — queries flood outward. Watch the Query / Reply cycle and the dreaded <strong>Stuck-in-Active</strong> scenario.',
    topoLabel: 'R1 → R2 (Successor, FD=3000) | R3 only non-FS (RD=3500 ≥ FD=3000) | R4 behind R3',
    steps: [
      {
        title: 'Step 1 — R2 Fails: No Feasible Successor Found',
        tag: 'LINK FAIL', tagColor: 'var(--red)', tagBg: 'rgba(248,113,113,0.12)',
        desc: 'R2 (Successor) fails. DUAL scans the topology table for a Feasible Successor. R3 has <strong>RD=3500</strong>. Feasibility Condition: <em>RD &lt; FD</em> → 3500 &lt; 3000? <strong>NO — fails!</strong> R3 could have a path that routes through R1, creating a loop. No FS → DUAL <strong>must go ACTIVE</strong> and flood queries to all neighbors.',
        from: 'r1', to: 'r1', pktColor: '#f87171', pktLabel: 'R2\nDOWN',
        activeNodes: ['r1', 'r3'],
        linkFail: 'r2',
        topoTable: { show: true, state: 'no_fs', routes: [
          { prefix:'10.2.0.0/24', via:'R2', fd:3000, rd:2000, state:'A', role:'⚡ FAILED', note:'Successor gone' },
          { prefix:'10.2.0.0/24', via:'R3', fd:'?',  rd:3500, state:'A', role:'✗ Not FS', note:'RD 3500 ≥ FD 3000' },
        ]},
        fields: [
          { k: 'R2 failure',       v: 'Successor lost — route in ACTIVE state', c: 'var(--red)'    },
          { k: 'FC check R3',      v: 'RD=3500 < FD=3000? NO → NOT FS',        c: 'var(--red)'    },
          { k: 'No FS found',      v: 'DUAL must go ACTIVE (A state)',           c: 'var(--red)'    },
          { k: 'Active timer',     v: '3 minutes (180s) — SIA if expires',      c: 'var(--amber)'  },
          { k: 'DUAL state',       v: 'ACTIVE — route marked with (A) flag',    c: 'var(--red)'    },
          { k: 'Forwarding',       v: 'Traffic DROPS until new path found',     c: 'var(--red)'    },
          { k: 'Query scope',      v: 'All EIGRP neighbors will be queried',    c: 'var(--amber)'  },
          { k: 'Prevent this',     v: 'Use "eigrp stub" on spoke routers!',     c: 'var(--cyan)'   },
        ],
      },
      {
        title: 'Step 2 — R1 Floods QUERY to All Neighbors',
        tag: 'QUERY FLOOD', tagColor: 'var(--amber)', tagBg: 'rgba(251,191,36,0.12)',
        desc: 'R1 sends a <strong>QUERY packet</strong> for 10.2.0.0/24 to <em>every</em> EIGRP neighbor (here: R3). The QUERY asks: <em>"Do you have a path to this destination that is better than infinity?"</em> QUERYs are <strong>reliable (RTP)</strong> — R1 waits for a REPLY from each queried neighbor. If R3 doesn\'t know the route, it forwards the QUERY to its own neighbors (R4). This is the <em>QUERY boundary problem</em>.',
        from: 'r1', to: 'r3', pktColor: '#fbbf24', pktLabel: 'QUERY\n10.2/24',
        activeNodes: ['r1', 'r3'],
        topoTable: { show: true, state: 'querying', routes: [
          { prefix:'10.2.0.0/24', via:'?', fd:3000, rd:'∞', state:'A', role:'ACTIVE', note:'Query sent to R3' },
        ]},
        fields: [
          { k: 'EIGRP Opcode',     v: '3 — Query',                               c: 'var(--amber)'  },
          { k: 'Destination',      v: '10.2.0.0/24 (metric = ∞ = unreachable)',  c: 'var(--red)'    },
          { k: 'Query to',         v: 'R3 (all remaining EIGRP neighbors)',       c: 'var(--amber)'  },
          { k: 'Reliability',      v: 'RTP Reliable — R1 waits for REPLY',       c: 'var(--cyan)'   },
          { k: 'R1 active timer',  v: '3:00 countdown per queried neighbor',     c: 'var(--red)'    },
          { k: 'Retransmit',       v: 'Every 5 retries if no ACK received',      c: 'var(--muted2)' },
          { k: 'Query boundary',   v: 'Limit with stub routers or summarisation',c: 'var(--blue)'   },
          { k: 'State',            v: 'ACTIVE (A) — blocking new DUAL for dest', c: 'var(--red)'    },
        ],
      },
      {
        title: 'Step 3 — R3 Propagates QUERY to R4 (Query Boundary Expansion)',
        tag: 'QUERY PROP', tagColor: 'var(--amber)', tagBg: 'rgba(251,191,36,0.12)',
        desc: 'R3 receives R1\'s QUERY. R3 checks its own topology table — it had been using R1 as next-hop to 10.2.0.0/24 (R3\'s route goes through R1). So R3 goes ACTIVE too and <strong>floods its own QUERY to R4</strong>. This is the <em>query propagation</em> problem — in a large network, queries can spread thousands of routers deep, causing widespread ACTIVE state and potential Stuck-in-Active.',
        from: 'r3', to: 'r4', pktColor: '#fbbf24', pktLabel: 'QUERY\n10.2/24',
        activeNodes: ['r3', 'r4'],
        topoTable: { show: true, state: 'propagating', routes: [
          { prefix:'10.2.0.0/24', via:'?', fd:3000, rd:'∞', state:'A', role:'ACTIVE', note:'R1 waiting for R3...' },
        ]},
        fields: [
          { k: 'R3 situation',     v: 'R3 used R1 as next-hop → also goes ACTIVE', c: 'var(--amber)' },
          { k: 'R3 Query to R4',   v: 'R4 (R3\'s only other neighbor)',            c: 'var(--amber)'  },
          { k: 'Query scope',      v: 'Expands to entire EIGRP domain!',           c: 'var(--red)'    },
          { k: 'Hub-and-spoke',    v: 'Worst case: hub queries all spokes',        c: 'var(--red)'    },
          { k: 'SIA risk',         v: 'If R4 is slow/overloaded → SIA on R3',    c: 'var(--red)'    },
          { k: 'EIGRP Stub',       v: 'Stub routers reply immediately: NO ROUTE', c: 'var(--green)'  },
          { k: 'Stub config',      v: 'router eigrp 100 → eigrp stub connected',  c: 'var(--cyan)'   },
          { k: 'Summarisation',    v: 'Summary route limits query scope boundary', c: 'var(--cyan)'   },
        ],
      },
      {
        title: 'Step 4 — R4 Sends REPLY: No Route to 10.2.0.0/24',
        tag: 'REPLY', tagColor: 'var(--cyan)', tagBg: 'rgba(56,217,192,0.12)',
        desc: 'R4 has no path to 10.2.0.0/24 — it was always reachable via R3→R1→R2. R4 sends a <strong>REPLY packet</strong> with metric=∞ (unreachable). REPLY packets are <strong>unicast and reliable (RTP)</strong>. R3 receives R4\'s REPLY, concludes it has no path, and sends its own REPLY to R1.',
        from: 'r4', to: 'r3', pktColor: '#38d9c0', pktLabel: 'REPLY\n∞',
        activeNodes: ['r3', 'r4'],
        topoTable: { show: true, state: 'reply', routes: [
          { prefix:'10.2.0.0/24', via:'?', fd:3000, rd:'∞', state:'A', role:'ACTIVE', note:'R4 replied: NO ROUTE' },
        ]},
        fields: [
          { k: 'EIGRP Opcode',     v: '4 — Reply',                               c: 'var(--cyan)'   },
          { k: 'R4 metric',        v: '∞ (0xFFFFFFFF) — I have no path',        c: 'var(--red)'    },
          { k: 'Transport',        v: 'Unicast + Reliable (RTP)',                 c: 'var(--cyan)'   },
          { k: 'R3 action',        v: 'All my neighbors replied → I can answer', c: 'var(--amber)'  },
          { k: 'R3 reply to R1',   v: 'REPLY with metric=∞ (no path via R3)',   c: 'var(--cyan)'   },
          { k: 'Stuck-in-Active',  v: 'If R4 never replies: SIA after 3 minutes',c: 'var(--red)'   },
          { k: 'SIA consequence',  v: 'R3 adjacency RESET by R1 → full re-sync', c: 'var(--red)'   },
          { k: 'SIA debug',        v: 'debug eigrp packets query reply',         c: 'var(--blue)'   },
        ],
      },
      {
        title: 'Step 5 — R1 Receives All Replies → Route Unreachable, PASSIVE',
        tag: 'PASSIVE ✅', tagColor: 'var(--purple)', tagBg: 'rgba(167,139,250,0.12)',
        desc: 'R1 receives REPLY from R3 (metric=∞). All outstanding replies received — DUAL exits ACTIVE state and returns to <strong>PASSIVE</strong>. Since no neighbor has a valid path, R1 marks 10.2.0.0/24 as <strong>unreachable and removes it from the RIB</strong>. If R1 had an alternative found during queries, it would install that instead. The adjacency is preserved.',
        from: 'r3', to: 'r1', pktColor: '#a78bfa', pktLabel: 'REPLY\n∞',
        activeNodes: ['r1', 'r3'],
        topoTable: { show: true, state: 'passive_unreachable', routes: [
          { prefix:'10.2.0.0/24', via:'—', fd:'∞', rd:'∞', state:'P', role:'UNREACHABLE', note:'Removed from RIB' },
        ]},
        fields: [
          { k: 'R1 state',         v: 'PASSIVE — all replies received',          c: 'var(--purple)' },
          { k: 'Result',           v: '10.2.0.0/24 UNREACHABLE — removed',      c: 'var(--red)'    },
          { k: 'Active duration',  v: 'Time between R2 fail and last REPLY',    c: 'var(--amber)'  },
          { k: 'Adjacencies',      v: 'R1-R3 adjacency INTACT (no reset)',      c: 'var(--green)'  },
          { k: 'Recovery',         v: 'When R2 comes back → Update → DUAL',    c: 'var(--cyan)'   },
          { k: 'Prevention',       v: 'EIGRP stub + summarisation = key',       c: 'var(--green)'  },
          { k: 'Show topo cmd',    v: 'show ip eigrp topology active',          c: 'var(--blue)'   },
          { k: 'Show topo all',    v: 'show ip eigrp topology all-links',       c: 'var(--blue)'   },
        ],
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// SVG TOPOLOGY RENDERER
// ═══════════════════════════════════════════════════════════════════════════
function eigrpDrawTopo(stepObj) {
  const scId    = EIGRP_SCENARIOS[eigrp.scenario].id;
  const nodes   = EIGRP_NODES[scId];
  const active  = stepObj ? (stepObj.activeNodes || []) : [];
  const linkFail= stepObj ? stepObj.linkFail : null;

  const W = 760, H = 290;
  let svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg"
    style="display:block;width:100%;height:auto;" id="eigrp-svg">
    <defs>
      <marker id="ea" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
        <polygon points="0 0,8 3,0 6" fill="rgba(100,160,255,0.3)"/>
      </marker>
      <marker id="ea-b" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
        <polygon points="0 0,8 3,0 6" fill="#5b9cf6"/>
      </marker>
      <marker id="ea-g" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
        <polygon points="0 0,8 3,0 6" fill="#4ade80"/>
      </marker>
      <marker id="ea-r" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
        <polygon points="0 0,8 3,0 6" fill="#f87171"/>
      </marker>
      <filter id="eg"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>`;

  // ── Draw edges by scenario ──────────────────────────────────────────
  function edge(from, to, label, color, dashed, labelOffset) {
    if (!nodes[from] || !nodes[to]) return;
    const fx = nodes[from].x, fy = nodes[from].y;
    const tx = nodes[to].x,   ty = nodes[to].y;
    const mx = (fx + tx) / 2, my = (fy + ty) / 2;
    const isActive = active.includes(from) && active.includes(to);
    const isFail   = linkFail && (from === linkFail || to === linkFail);
    const c = isFail ? '#f8717155' : isActive ? (color||'#5b9cf6') : 'rgba(100,160,255,0.18)';
    const w = isActive && !isFail ? 2 : 1.5;
    const dash = dashed || isFail ? 'stroke-dasharray="6,5"' : '';
    const markerEnd = isActive && !isFail ? (color==='#4ade80'?'url(#ea-g)':color==='#f87171'?'url(#ea-r)':'url(#ea-b)') : 'url(#ea)';
    svg += `<line x1="${fx}" y1="${fy}" x2="${tx}" y2="${ty}"
      stroke="${c}" stroke-width="${w}" ${dash} marker-end="${markerEnd}" marker-start="${markerEnd}"/>`;
    if (label) {
      const lx = mx + (labelOffset ? labelOffset[0] : 0);
      const ly = my + (labelOffset ? labelOffset[1] : -10);
      svg += `<text x="${lx}" y="${ly}" text-anchor="middle"
        font-family="IBM Plex Mono,monospace" font-size="9"
        fill="${isFail?'#f87171':isActive?'#8892b0':'#3a4560'}">${label}</text>`;
    }
    if (isFail) {
      svg += `<text x="${mx}" y="${my+5}" text-anchor="middle" font-size="20"
        fill="#f87171" filter="url(#eg)">✕</text>`;
    }
  }

  if (scId === 'neighbor') {
    edge('r1','r2','GigE — AS 100','#5b9cf6',false,[0,-12]);
  }
  if (scId === 'dual' || scId === 'failover') {
    edge('r1','r2','link 1000','#5b9cf6',false,[-18,-10]);
    edge('r1','r3','link 1500','#5b9cf6',false,[-18, 10]);
    edge('r2','dest','link','#4ade80',false,[0,-10]);
    edge('r3','dest','link','#4ade80',false,[0, 10]);
  }
  if (scId === 'active') {
    edge('r1','r2','link 1000','#5b9cf6',false,[0,-10]);
    edge('r1','r3','link','#5b9cf6',false,[-20,0]);
    edge('r3','r4','link','#5b9cf6',false,[0,-10]);
  }

  // ── Draw nodes ─────────────────────────────────────────────────────
  function node(id, type, label1, label2) {
    if (!nodes[id]) return;
    const {x,y} = nodes[id];
    const isActive = active.includes(id);
    const isFail   = linkFail === id;
    if (isFail) {
      // Draw as red X'd out router
      svg += window.svgRouter(x, y, 'e-'+id, label1 + '\n' + label2, false);
      svg += `<text x="${x}" y="${y-26}" text-anchor="middle" font-size="18" fill="#f87171" filter="url(#eg)">✕</text>`;
      return;
    }
    if (type === 'router') svg += window.svgRouter(x, y, 'e-'+id, label1 + (label2?'\n'+label2:''), isActive);
    if (type === 'cloud')  svg += window.svgCloud (x, y, 'e-'+id, label1, isActive);
    if (type === 'server') svg += window.svgServer(x, y, 'e-'+id, label1 + (label2?'\n'+label2:''), isActive);
  }

  if (scId === 'neighbor') {
    const nbStep = EIGRP_SCENARIOS[0].steps[eigrp.step];
    const ns = nbStep ? nbStep.neighborState : { r1:'DOWN', r2:'DOWN' };
    const stateColor = s => s === 'UP' ? '#4ade80' : s === 'INIT' ? '#fbbf24' : '#f87171';
    node('r1', 'router', 'R1', '10.1.0.1');
    node('r2', 'router', 'R2', '10.1.0.2');
    if (ns) {
      [[nodes.r1,'r1',ns.r1],[nodes.r2,'r2',ns.r2]].forEach(([n,id,st]) => {
        svg += `<rect x="${n.x-22}" y="${n.y+34}" width="44" height="14" rx="3"
          fill="${stateColor(st)}22" stroke="${stateColor(st)}88" stroke-width="1"/>
          <text x="${n.x}" y="${n.y+44}" text-anchor="middle"
            font-family="IBM Plex Mono,monospace" font-size="8" font-weight="700"
            fill="${stateColor(st)}">${st}</text>`;
      });
    }
  }
  if (scId === 'dual') {
    node('r1',   'router', 'R1',   '10.1.0.1');
    node('r2',   'router', 'R2',   'RD=2000');
    node('r3',   'router', 'R3',   'RD=3000');
    node('dest', 'cloud',  '10.2.0.0/24', '');
  }
  if (scId === 'failover') {
    node('r1',   'router', 'R1',   '10.1.0.1');
    node('r2',   'router', 'R2',   'RD=2000 FS?');
    node('r3',   'router', 'R3',   'RD=1500 FS✓');
    node('dest', 'cloud',  '10.2.0.0/24', '');
    // FS badge on R3
    const sn = EIGRP_SCENARIOS[2].steps[eigrp.step];
    if (sn && sn.topoTable && sn.topoTable.routes) {
      const r3route = sn.topoTable.routes.find(r => r.via && r.via.includes('R3'));
      if (r3route && r3route.role && r3route.role.includes('FS')) {
        const n3 = nodes.r3;
        svg += `<rect x="${n3.x-20}" y="${n3.y-52}" width="40" height="14" rx="3"
          fill="rgba(74,222,128,0.2)" stroke="rgba(74,222,128,0.5)" stroke-width="1"/>
          <text x="${n3.x}" y="${n3.y-41}" text-anchor="middle"
            font-family="IBM Plex Mono,monospace" font-size="8" font-weight="700"
            fill="#4ade80">FS ✓</text>`;
      }
    }
  }
  if (scId === 'active') {
    node('r1', 'router', 'R1',   '10.1.0.1');
    node('r2', 'router', 'R2',   'FAILED');
    node('r3', 'router', 'R3',   'Querying...');
    node('r4', 'router', 'R4',   '10.1.34.4');
    // ACTIVE badge on R1
    const sActive = active.includes('r1');
    if (sActive) {
      const n1 = nodes.r1;
      svg += `<rect x="${n1.x-28}" y="${n1.y-60}" width="56" height="14" rx="3"
        fill="rgba(248,113,113,0.2)" stroke="rgba(248,113,113,0.5)" stroke-width="1"/>
        <text x="${n1.x}" y="${n1.y-49}" text-anchor="middle"
          font-family="IBM Plex Mono,monospace" font-size="8" font-weight="700"
          fill="#f87171">ACTIVE (A)</text>`;
    }
  }

  svg += `</svg>`;
  const el = document.getElementById('eigrp-topo');
  if (el) el.innerHTML = svg;
}

// ═══════════════════════════════════════════════════════════════════════════
// PACKET ANIMATION
// ═══════════════════════════════════════════════════════════════════════════
function eigrpAnimatePkt(stepObj) {
  const scId  = EIGRP_SCENARIOS[eigrp.scenario].id;
  const nodes = EIGRP_NODES[scId];
  if (!stepObj || !stepObj.from || !stepObj.to) return;
  const { from, to, pktColor, pktLabel } = stepObj;
  if (!nodes[from] || !nodes[to] || from === to) return;

  const svg = document.getElementById('eigrp-svg');
  if (!svg) return;
  svg.querySelectorAll('.eigrp-pkt').forEach(e => e.remove());

  const fx = nodes[from].x, fy = nodes[from].y;
  const tx = nodes[to].x,   ty = nodes[to].y;
  const dur = eigrpGetSegDur();
  const start = performance.now();
  if (eigrp.animId) cancelAnimationFrame(eigrp.animId);

  function frame(ts) {
    const t  = Math.min(1, (ts - start) / dur);
    const et = window.easeInOut ? window.easeInOut(t) : t;
    const cx = fx + (tx - fx) * et;
    const cy = fy + (ty - fy) * et;

    const svgEl = document.getElementById('eigrp-svg');
    if (!svgEl) return;
    svgEl.querySelectorAll('.eigrp-pkt').forEach(e => e.remove());

    const g = document.createElementNS('http://www.w3.org/2000/svg','g');
    g.setAttribute('class','eigrp-pkt');

    const lines = (pktLabel||'PKT').split('\n');
    const W2 = 46, H2 = lines.length > 1 ? 30 : 22;

    const rect = document.createElementNS('http://www.w3.org/2000/svg','rect');
    rect.setAttribute('x', cx - W2/2); rect.setAttribute('y', cy - H2/2 - 4);
    rect.setAttribute('width', W2); rect.setAttribute('height', H2);
    rect.setAttribute('rx','5'); rect.setAttribute('fill', pktColor);
    rect.setAttribute('opacity','0.92'); rect.setAttribute('filter','url(#eg)');
    g.appendChild(rect);

    lines.forEach((line, i) => {
      const txt = document.createElementNS('http://www.w3.org/2000/svg','text');
      txt.setAttribute('x', cx); txt.setAttribute('y', cy - H2/2 + 10 + i*12 - 4);
      txt.setAttribute('text-anchor','middle');
      txt.setAttribute('font-family','IBM Plex Mono,monospace');
      txt.setAttribute('font-size','7'); txt.setAttribute('font-weight','700');
      txt.setAttribute('fill', pktColor === '#fbbf24' ? '#07090f' : '#fff');
      txt.textContent = line;
      g.appendChild(txt);
    });

    svgEl.appendChild(g);
    if (t < 1) eigrp.animId = requestAnimationFrame(frame);
    else { g.remove(); eigrpDrawTopo(stepObj); }
  }
  eigrp.animId = requestAnimationFrame(frame);
}

// ═══════════════════════════════════════════════════════════════════════════
// EIGRP TOPOLOGY TABLE (show ip eigrp topology style)
// ═══════════════════════════════════════════════════════════════════════════
function eigrpRenderTopoTable(topoData) {
  if (!topoData || !topoData.show) {
    return `<div style="font-family:var(--mono);font-size:11px;color:var(--muted);padding:8px 0;">
      Topology table will populate as neighborship forms...</div>`;
  }

  const stateColors = {
    'Successor': '#4ade80',   'FS ✓': '#38d9c0',    'FS': '#38d9c0',
    'ACTIVE': '#f87171',      '⚡ FAILED': '#f87171', '✗ Not FS': '#f87171',
    'Non-FS': '#8892b0',      'UNREACHABLE': '#f87171',
    'local': '#5b9cf6',       '⚡ FAILED': '#f87171',
    'Successor ✅': '#4ade80', 'best?': '#fbbf24',    'check?': '#fbbf24',
    '✅ In RIB/FIB': '#4ade80',
  };

  let html = `<div style="font-family:var(--mono);font-size:9px;color:var(--muted);margin-bottom:8px;">
    R1# show ip eigrp topology</div>`;
  html += `<div style="font-family:var(--mono);font-size:9px;color:var(--muted2);margin-bottom:6px;line-height:1.6;">
    EIGRP-IPv4 Topology Table for AS(100)/ID(1.1.1.1)<br>
    Codes: P-Passive, A-Active, U-Update, Q-Query, R-Reply</div>`;

  if (!topoData.routes || !topoData.routes.length) {
    html += `<div style="color:var(--muted);font-size:10px;">(empty — no routes yet)</div>`;
    return html;
  }

  // Group by prefix
  const groups = {};
  topoData.routes.forEach(r => {
    if (!groups[r.prefix]) groups[r.prefix] = [];
    groups[r.prefix].push(r);
  });

  Object.entries(groups).forEach(([prefix, routes]) => {
    const stateChar = routes[0].state || 'P';
    const stateCol = stateChar === 'A' ? '#f87171' : '#4ade80';
    html += `<div style="margin-bottom:8px;background:var(--bg3);border-radius:7px;padding:9px 10px;border:1px solid var(--border);">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px;">
        <span style="font-weight:700;font-size:10px;color:var(--cyan);">${prefix}</span>
        <span style="font-size:9px;font-weight:700;color:${stateCol};padding:1px 6px;border-radius:3px;background:${stateCol}22;">${stateChar}</span>
        ${stateChar==='A'?'<span style="font-size:9px;color:var(--red);">⚠ ACTIVE — waiting for replies</span>':''}
      </div>`;
    routes.forEach(r => {
      const roleCol = stateColors[r.role] || 'var(--muted2)';
      const fdStr = typeof r.fd === 'number' ? r.fd.toLocaleString() : (r.fd || '?');
      const rdStr = typeof r.rd === 'number' ? r.rd.toLocaleString() : (r.rd || '?');
      html += `<div style="display:grid;grid-template-columns:1fr auto;align-items:start;padding:3px 0;border-top:1px solid rgba(255,255,255,0.04);">
        <div>
          <span style="font-size:10px;color:var(--muted2);">via </span>
          <span style="font-size:10px;color:var(--text);">${r.via||'?'}</span>
          <span style="font-size:9px;color:var(--muted);margin-left:6px;">(FD=${fdStr} / RD=${rdStr})</span>
          ${r.note?`<span style="font-size:9px;color:var(--muted);margin-left:6px;">— ${r.note}</span>`:''}
        </div>
        <span style="font-size:9px;font-weight:700;color:${roleCol};white-space:nowrap;margin-left:8px;">${r.role||''}</span>
      </div>`;
    });
    html += `</div>`;
  });

  return html;
}

// ═══════════════════════════════════════════════════════════════════════════
// CHAIN BAR
// ═══════════════════════════════════════════════════════════════════════════
function eigrpRenderChain() {
  const sc    = EIGRP_SCENARIOS[eigrp.scenario];
  const total = sc.steps.length;
  let html = '';
  for (let i = 0; i < total; i++) {
    const s    = sc.steps[i];
    const past = i < eigrp.step, cur = i === eigrp.step;
    const tag  = (s.tag||'Step '+(i+1)).split(' ').slice(0,2).join(' ');
    const isRed = s.tag && (s.tag.includes('FAIL') || s.tag.includes('ACTIVE') || s.tag.includes('SIA'));
    const isGreen = s.tag && (s.tag.includes('UP') || s.tag.includes('STABLE') || s.tag.includes('PASSIVE ✅') || s.tag.includes('ROUTE'));
    let bg  = past ? 'rgba(91,156,246,0.15)' : cur ? (isRed?'rgba(248,113,113,0.25)':isGreen?'rgba(74,222,128,0.2)':'rgba(91,156,246,0.3)') : 'rgba(30,36,56,0.6)';
    let col = past ? 'var(--blue)' : cur ? (isRed?'var(--red)':isGreen?'var(--green)':'#fff') : 'var(--muted)';
    let bdr = cur ? `1px solid ${isRed?'rgba(248,113,113,0.5)':isGreen?'rgba(74,222,128,0.5)':'rgba(91,156,246,0.6)'}` : '1px solid transparent';
    html += `<div style="background:${bg};border:${bdr};color:${col};font-family:var(--mono);font-size:9px;padding:4px 10px;border-radius:20px;white-space:nowrap;">${past?'✓ ':''}${tag}</div>`;
    if (i < total-1) html += `<div style="color:var(--muted);font-size:11px;margin:0 2px;">→</div>`;
  }
  return html;
}

// ═══════════════════════════════════════════════════════════════════════════
// RENDER FULL STEP
// ═══════════════════════════════════════════════════════════════════════════
function eigrpRenderStep(animate) {
  const sc = EIGRP_SCENARIOS[eigrp.scenario];
  const s  = sc.steps[eigrp.step];
  if (!s) return;

  // Topology
  eigrpDrawTopo(s);

  // Chain bar
  const chainEl = document.getElementById('eigrp-chain');
  if (chainEl) chainEl.innerHTML = eigrpRenderChain();

  // Progress
  const total = sc.steps.length;
  const pct   = total > 1 ? (eigrp.step / (total - 1)) * 100 : 0;
  const progEl = document.getElementById('eigrp-progress');
  if (progEl) progEl.style.width = pct + '%';

  // Step counter
  const snEl = document.getElementById('eigrp-step-num');   if (snEl) snEl.textContent = eigrp.step + 1;
  const stEl = document.getElementById('eigrp-step-total'); if (stEl) stEl.textContent = total;

  // Tag / Title / Desc
  const tagEl = document.getElementById('eigrp-step-tag');
  if (tagEl) { tagEl.textContent = s.tag||''; tagEl.style.background = s.tagBg||'rgba(91,156,246,0.12)'; tagEl.style.color = s.tagColor||'var(--blue)'; }
  const titEl = document.getElementById('eigrp-step-title'); if (titEl) titEl.textContent = s.title||'';
  const desEl = document.getElementById('eigrp-step-desc');  if (desEl) desEl.innerHTML  = s.desc ||'';

  // Topology table
  const ttEl = document.getElementById('eigrp-topo-table');
  if (ttEl) ttEl.innerHTML = eigrpRenderTopoTable(s.topoTable);

  // Packet fields
  const pfEl = document.getElementById('eigrp-pkt-fields');
  if (pfEl && s.fields) {
    pfEl.innerHTML = s.fields.map(f => `
      <div style="display:flex;gap:8px;align-items:flex-start;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
        <span style="font-family:var(--mono);font-size:10px;color:var(--muted2);min-width:96px;flex-shrink:0;">${f.k}</span>
        <span style="font-family:var(--mono);font-size:10px;color:${f.c||'var(--text)'};">${f.v}</span>
      </div>`).join('');
  }

  // Animate
  if (animate && s.from && s.to && s.from !== s.to) eigrpAnimatePkt(s);
}

// ═══════════════════════════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════════════════════════
function eigrpStep(dir) {
  const sc = EIGRP_SCENARIOS[eigrp.scenario];
  const next = eigrp.step + dir;
  if (next < 0 || next >= sc.steps.length) return;
  eigrp.step = next;
  eigrpRenderStep(true);
}

function eigrpTogglePlay() {
  if (eigrp.playing) { eigrpPause(); return; }
  eigrp.playing = true;
  const btn = document.getElementById('eigrp-play-btn');
  if (btn) btn.textContent = '⏸ Pause';
  _eigrpAutoNext();
}

function eigrpPause() {
  eigrp.playing = false;
  if (eigrp.playTimer) clearTimeout(eigrp.playTimer);
  const btn = document.getElementById('eigrp-play-btn');
  if (btn) btn.textContent = '▶ Play';
}

function _eigrpAutoNext() {
  if (!eigrp.playing) return;
  const sc = EIGRP_SCENARIOS[eigrp.scenario];
  if (eigrp.step >= sc.steps.length - 1) { eigrpPause(); return; }
  eigrpStep(1);
  eigrp.playTimer = setTimeout(_eigrpAutoNext, eigrpGetAutoDelay());
}

function eigrpReset() {
  eigrpPause();
  eigrp.step = 0;
  eigrpRenderStep(false);
}

function eigrpSetScenario(idx) {
  eigrpPause();
  eigrp.scenario = idx;
  eigrp.step     = 0;

  // Tab buttons
  EIGRP_SCENARIOS.forEach((_, i) => {
    const btn = document.getElementById('eigrp-sc-' + i);
    if (btn) btn.classList.toggle('active', i === idx);
  });

  const sc = EIGRP_SCENARIOS[idx];
  const badgeEl = document.getElementById('eigrp-sc-badge');
  const titleEl = document.getElementById('eigrp-sc-title');
  const descEl  = document.getElementById('eigrp-sc-desc');
  const topoLbl = document.getElementById('eigrp-topo-label');

  if (badgeEl) { badgeEl.textContent = sc.badge; badgeEl.style.color = sc.badgeColor; }
  if (titleEl) titleEl.textContent = sc.title;
  if (descEl)  descEl.innerHTML    = sc.desc;
  if (topoLbl) topoLbl.textContent = sc.topoLabel;

  eigrpRenderStep(false);
}

// Called on window resize (registered in app.js line 13)
function eigrpRedraw() {
  const sc = EIGRP_SCENARIOS[eigrp.scenario];
  eigrpDrawTopo(sc.steps[eigrp.step] || null);
}

// ═══════════════════════════════════════════════════════════════════════════
// REFERENCE CARDS
// ═══════════════════════════════════════════════════════════════════════════
function eigrpRefCards() {
  const cards = [
    {
      label: 'DUAL States', color: 'var(--blue)',
      body: `<strong style="color:var(--green);">PASSIVE (P):</strong> Route stable, Successor installed, no queries pending<br><br>
      <strong style="color:var(--red);">ACTIVE (A):</strong> Successor lost, no FS found, queries sent to all neighbors<br><br>
      <em>Key: Route stays PASSIVE if FS exists — instant switchover. Goes ACTIVE only when no FS meets FC.</em>`,
    },
    {
      label: 'Feasibility Condition', color: 'var(--purple)',
      body: `<strong style="color:var(--cyan);">FC: Neighbor's RD &lt; Successor's FD</strong><br><br>
      → RD (Reported/Advertised Distance) = neighbor's own FD to destination<br>
      → FD (Feasible Distance) = R1's total metric to destination via best path<br><br>
      <em>If FC is met: path is mathematically loop-free. If not: DUAL must query.</em>`,
    },
    {
      label: 'Composite Metric Formula', color: 'var(--amber)',
      body: `Metric = 256 × (K1×BW + K3×Delay)<br><br>
      Default K-values: <strong>K1=1, K2=0, K3=1, K4=0, K5=0</strong><br>
      <strong style="color:var(--cyan);">BW</strong> = 10<sup>7</sup> / min_BW_kbps<br>
      <strong style="color:var(--cyan);">Delay</strong> = sum(delays) / 10 (in 10μs units)<br><br>
      GigE: BW=10, delay=1 → per-link=2816<br>
      FastE: BW=100, delay=10 → per-link=28160`,
    },
    {
      label: 'EIGRP Packet Types', color: 'var(--cyan)',
      body: `<strong style="color:var(--blue);">Hello (5)</strong> — multicast 224.0.0.10, unreliable, neighbor discovery<br>
      <strong style="color:var(--green);">Update (1)</strong> — topology changes, reliable (RTP), unicast or multicast<br>
      <strong style="color:var(--amber);">Query (3)</strong> — ACTIVE state, reliable, "do you have a route?"<br>
      <strong style="color:var(--cyan);">Reply (4)</strong> — responds to Query, unicast, reliable<br>
      <strong style="color:var(--muted2);">Ack (5)</strong> — acknowledgment, unreliable unicast (piggyback on Hello)`,
    },
    {
      label: 'Neighborship Requirements', color: 'var(--green)',
      body: `All must match for adjacency to form:<br>
      ✓ <strong>Same AS number</strong><br>
      ✓ <strong>Same K-values</strong> (K1–K5 must be identical)<br>
      ✓ <strong>Primary IP in same subnet</strong><br>
      ✓ <strong>Authentication</strong> (MD5/SHA-256 if configured)<br><br>
      ⚠ K-value mismatch is the #1 EIGRP adjacency issue in TAC`,
    },
    {
      label: 'Stuck-in-Active & Prevention', color: 'var(--red)',
      body: `<strong style="color:var(--red);">SIA:</strong> If reply not received within active timer (3 min)<br>
      → Neighbor adjacency RESET → full topology re-exchange<br><br>
      <strong style="color:var(--green);">Prevention:</strong><br>
      • <code>eigrp stub connected summary</code> on spoke routers<br>
      • Route summarisation to limit query scope boundary<br>
      • <code>timers active-time 60</code> (reduce active timer)<br>
      • BFD for fast failure detection`,
    },
    {
      label: 'Key Show Commands', color: 'var(--blue)',
      body: `<code>show ip eigrp neighbors</code> — adjacency state + holdtime<br>
      <code>show ip eigrp topology</code> — successor + FS table<br>
      <code>show ip eigrp topology all-links</code> — all paths incl. non-FS<br>
      <code>show ip eigrp topology active</code> — routes in ACTIVE state<br>
      <code>show ip eigrp interfaces detail</code> — per-interface timers<br>
      <code>debug eigrp packets query reply</code> — live DUAL trace`,
    },
    {
      label: 'Unequal-Cost Load Balancing', color: 'var(--purple)',
      body: `EIGRP uniquely supports UCMP via <strong>variance</strong>:<br><br>
      <code>router eigrp 1</code><br>
      <code>&nbsp;variance 2</code><br><br>
      → Allows paths with FD ≤ <em>variance × Successor FD</em><br>
      → Alternate path MUST also be a Feasible Successor (FC!)<br>
      → Traffic split proportional to metric (inverse-ratio)<br>
      → <code>maximum-paths 4</code> sets ECMP limit`,
    },
  ];

  return cards.map(c => `
    <div style="background:var(--bg3);border-radius:8px;padding:12px;border:1px solid var(--border);">
      <div style="font-family:var(--mono);font-size:9px;font-weight:700;color:${c.color};margin-bottom:6px;text-transform:uppercase;letter-spacing:0.5px;">${c.label}</div>
      <div style="font-family:var(--mono);font-size:10px;color:var(--muted2);line-height:1.85;">${c.body}</div>
    </div>`).join('');
}

// ═══════════════════════════════════════════════════════════════════════════
// METRIC CALCULATOR
// ═══════════════════════════════════════════════════════════════════════════
function eigrpCalcMetric() {
  const bw    = parseFloat(document.getElementById('eigrp-calc-bw').value)    || 0;
  const delay = parseFloat(document.getElementById('eigrp-calc-delay').value) || 0;
  const k1    = parseFloat(document.getElementById('eigrp-calc-k1').value)    || 1;
  const k3    = parseFloat(document.getElementById('eigrp-calc-k3').value)    || 1;
  const resEl = document.getElementById('eigrp-calc-result');
  if (!resEl) return;
  if (!bw || !delay) { resEl.innerHTML = '<span style="color:var(--muted);">Enter values above</span>'; return; }

  const bwTerm    = bw    > 0 ? (1e7 / bw)  : 0;   // bw in kbps
  const delayTerm = delay / 10;                       // delay in μs → /10 for tens-of-μs
  const metric    = Math.round(256 * (k1 * bwTerm + k3 * delayTerm));

  resEl.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:4px;">
      <div style="background:var(--bg3);border-radius:6px;padding:8px;text-align:center;">
        <div style="font-size:9px;color:var(--muted);margin-bottom:2px;">BW term</div>
        <div style="font-family:var(--mono);font-size:12px;font-weight:700;color:var(--cyan);">${Math.round(bwTerm)}</div>
        <div style="font-size:9px;color:var(--muted);">10⁷ / ${bw}</div>
      </div>
      <div style="background:var(--bg3);border-radius:6px;padding:8px;text-align:center;">
        <div style="font-size:9px;color:var(--muted);margin-bottom:2px;">Delay term</div>
        <div style="font-family:var(--mono);font-size:12px;font-weight:700;color:var(--purple);">${delayTerm}</div>
        <div style="font-size:9px;color:var(--muted);">${delay}μs / 10</div>
      </div>
      <div style="background:var(--bg3);border-radius:6px;padding:8px;text-align:center;">
        <div style="font-size:9px;color:var(--muted);margin-bottom:2px;">Composite</div>
        <div style="font-family:var(--mono);font-size:14px;font-weight:700;color:var(--amber);">${metric.toLocaleString()}</div>
        <div style="font-size:9px;color:var(--muted);">256×(${Math.round(bwTerm)}+${delayTerm})</div>
      </div>
    </div>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// PAGE INIT
// ═══════════════════════════════════════════════════════════════════════════
function eigrpInit() {
  const page = document.getElementById('page-eigrp');
  if (!page) return;

  const scenTabs = EIGRP_SCENARIOS.map((sc, i) =>
    `<button id="eigrp-sc-${i}" class="speed-btn${i===0?' active':''}"
      onclick="eigrpSetScenario(${i})" style="font-size:11px;">
      <span style="color:${sc.badgeColor};font-weight:700;margin-right:4px;">[${sc.badge}]</span>${sc.title}
    </button>`).join('');

  page.innerHTML = `
<div class="page-header">
  <div class="page-title">EIGRP DUAL Simulator
    <span class="tag" style="background:rgba(167,139,250,0.12);color:var(--purple);font-size:11px;padding:3px 10px;border-radius:5px;font-weight:700;margin-left:8px;">CCIE Level</span>
  </div>
  <div class="page-desc">Step through EIGRP neighborship, DUAL metric calculation, Feasible Successor failover, and the Active/Query/Reply cycle — with live topology and Cisco IOS output</div>
</div>

<!-- Scenario selector -->
<div class="card" style="margin-bottom:14px;">
  <div class="card-hdr">📋 Scenario</div>
  <div class="speed-group" style="flex-wrap:wrap;gap:6px;margin-bottom:12px;">${scenTabs}</div>
  <div style="display:flex;align-items:flex-start;gap:10px;flex-wrap:wrap;">
    <span id="eigrp-sc-badge" style="font-family:var(--mono);font-size:9px;font-weight:700;padding:3px 10px;border-radius:5px;background:rgba(91,156,246,0.12);color:var(--blue);white-space:nowrap;margin-top:2px;">NEIGHBORSHIP</span>
    <div>
      <div id="eigrp-sc-title" style="font-family:var(--mono);font-size:13px;font-weight:700;color:var(--text);margin-bottom:3px;"></div>
      <div id="eigrp-sc-desc"  style="font-size:12px;color:var(--muted2);line-height:1.55;"></div>
    </div>
  </div>
</div>

<!-- Topology -->
<div class="topo-wrap" style="margin-bottom:14px;">
  <div class="topo-label" id="eigrp-topo-label">EIGRP Topology</div>
  <div id="eigrp-topo"></div>
</div>

<!-- Progress + Controls -->
<div class="progress-bar"><div class="progress-fill" id="eigrp-progress" style="width:0%"></div></div>
<div class="ctrl-bar" style="margin-bottom:14px;">
  <button class="btn btn-primary" onclick="eigrpStep(-1)">◀ Prev</button>
  <button class="btn btn-play"    id="eigrp-play-btn" onclick="eigrpTogglePlay()">▶ Play</button>
  <button class="btn btn-primary" onclick="eigrpStep(1)">Next ▶</button>
  <button class="btn btn-reset"   onclick="eigrpReset()">↺ Reset</button>
  <div class="speed-group">
    <span class="speed-label">Speed</span>
    <button class="speed-btn"        id="eigrp-spd-slow"   onclick="setEigrpSpeed('slow')">🐢 Slow</button>
    <button class="speed-btn active" id="eigrp-spd-normal" onclick="setEigrpSpeed('normal')">⚡ Normal</button>
    <button class="speed-btn"        id="eigrp-spd-fast"   onclick="setEigrpSpeed('fast')">🚀 Fast</button>
  </div>
  <div class="step-counter">Step <span id="eigrp-step-num">1</span> / <span id="eigrp-step-total">5</span></div>
</div>

<!-- Chain bar -->
<div class="dns-chain" id="eigrp-chain" style="margin-bottom:14px;"></div>

<!-- Step info -->
<div class="step-info" style="margin-bottom:14px;">
  <div class="step-tag" id="eigrp-step-tag" style="background:rgba(91,156,246,0.12);color:var(--blue);">READY</div>
  <div class="step-title" id="eigrp-step-title">Select a scenario and press ▶ Play</div>
  <div class="step-desc"  id="eigrp-step-desc">Four scenarios: Neighborship formation, DUAL calculation with FC math, Feasible Successor instant failover, and DUAL Active with Query/Reply/SIA.</div>
</div>

<!-- Two-column: Topology table + Packet fields -->
<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px;" id="eigrp-detail-grid">
  <div class="card" style="margin-bottom:0;">
    <div class="card-hdr">📊 EIGRP Topology Table</div>
    <div id="eigrp-topo-table" style="min-height:80px;"></div>
  </div>
  <div class="card" style="margin-bottom:0;">
    <div class="card-hdr">📦 Packet / Event Fields</div>
    <div id="eigrp-pkt-fields" style="min-height:80px;"></div>
  </div>
</div>

<!-- Metric Calculator -->
<div class="card" style="margin-bottom:14px;">
  <div class="card-hdr">🧮 EIGRP Composite Metric Calculator</div>
  <div style="font-family:var(--mono);font-size:10px;color:var(--muted2);margin-bottom:10px;">
    Metric = 256 × (K1 × 10⁷/BW<sub>min</sub> + K3 × Delay/10) &nbsp;—&nbsp; defaults: K1=1, K2=0, K3=1, K4=0, K5=0
  </div>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px;margin-bottom:10px;">
    <div class="field-group" style="margin-bottom:0;">
      <label class="field-label">Min BW (kbps)</label>
      <input type="number" id="eigrp-calc-bw" placeholder="100000" value="100000" oninput="eigrpCalcMetric()" style="font-family:var(--mono);">
    </div>
    <div class="field-group" style="margin-bottom:0;">
      <label class="field-label">Cumulative Delay (μs)</label>
      <input type="number" id="eigrp-calc-delay" placeholder="1100" value="1100" oninput="eigrpCalcMetric()" style="font-family:var(--mono);">
    </div>
    <div class="field-group" style="margin-bottom:0;">
      <label class="field-label">K1 (bandwidth)</label>
      <input type="number" id="eigrp-calc-k1" placeholder="1" value="1" oninput="eigrpCalcMetric()" step="1" style="font-family:var(--mono);">
    </div>
    <div class="field-group" style="margin-bottom:0;">
      <label class="field-label">K3 (delay)</label>
      <input type="number" id="eigrp-calc-k3" placeholder="1" value="1" oninput="eigrpCalcMetric()" step="1" style="font-family:var(--mono);">
    </div>
  </div>
  <div id="eigrp-calc-result" style="min-height:60px;"></div>
  <div style="margin-top:8px;font-family:var(--mono);font-size:9px;color:var(--muted);line-height:1.7;border-top:1px solid var(--border);padding-top:8px;">
    GigE=1000000kbps delay=10μs | FastE=100000kbps delay=100μs | T1=1544kbps delay=20000μs | 
    Serial=1544kbps delay=20000μs | <span style="color:var(--amber);">show interfaces → BW & DLY values</span>
  </div>
</div>

<!-- Reference cards -->
<div class="card">
  <div class="card-hdr">📚 EIGRP DUAL — CCIE/TAC Quick Reference</div>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px;">
    ${eigrpRefCards()}
  </div>
  <div style="margin-top:10px;font-family:var(--mono);font-size:9.5px;color:var(--muted);line-height:1.8;border-top:1px solid var(--border);padding-top:8px;">
    <span style="color:var(--blue);">EIGRP AD:</span> Internal=90 &nbsp;|&nbsp; External=170 &nbsp;|&nbsp;
    <span style="color:var(--cyan);">Multicast:</span> 224.0.0.10 (IPv4) · FF02::A (IPv6) &nbsp;|&nbsp;
    <span style="color:var(--amber);">Protocol:</span> IP Protocol 88 (directly over IP, not TCP/UDP) &nbsp;|&nbsp;
    <span style="color:var(--purple);">Named mode:</span> router eigrp ENTERPRISE → address-family ipv4 unicast autonomous-system 100
  </div>
</div>`;

  // Responsive grid collapse
  const grid = document.getElementById('eigrp-detail-grid');
  if (grid) {
    const check = () => { if (grid) grid.style.gridTemplateColumns = window.innerWidth < 860 ? '1fr' : '1fr 1fr'; };
    check();
    window.addEventListener('resize', check);
  }

  eigrpSetScenario(0);
  eigrpCalcMetric();
}