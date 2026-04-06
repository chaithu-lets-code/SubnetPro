// ═══════════════════════════════════════════════════
// ARP SIMULATOR — arp.js
// Scenarios: Basic Request/Reply, GARP, ARP Spoofing, Proxy ARP
// ═══════════════════════════════════════════════════

let arpMode = 'basic';
let arpCurrentStep = 0, arpAnimId = null, arpPlaying = false, arpPlayTimer = null;
let arpActiveNodes = [], arpSpeedMode = 'normal';

// Per-device ARP caches (ip → {mac, type, ttl})
let arpCachePCA = {}, arpCachePCB = {}, arpCacheGW = {};

// ─── Node coordinates per scenario ───
const ARP_NODES_MAP = {
  basic: {
    pca: {x:90,  y:180},
    sw:  {x:310, y:180},
    pcb: {x:540, y:100},
    pcc: {x:540, y:260},
  },
  garp: {
    pca: {x:90,  y:180},
    sw:  {x:310, y:180},
    pcb: {x:540, y:100},
    pcc: {x:540, y:260},
  },
  spoof: {
    pca:      {x:90,  y:195},
    sw:       {x:310, y:195},
    gw:       {x:540, y:80},
    attacker: {x:540, y:310},
  },
  proxy: {
    pca:    {x:60,  y:180},
    sw:     {x:220, y:180},
    rtr:    {x:410, y:180},
    remote: {x:620, y:180},
  },
};
function arpGetNodes() { return ARP_NODES_MAP[arpMode]; }

// ─── Speed control ───
function arpSetSpeed(s) {
  arpSpeedMode = s;
  ['slow','normal','fast','manual'].forEach(x => {
    const el = document.getElementById('aspeed-' + x);
    if (el) el.classList.toggle('active', x === s);
  });
}
function arpGetSegDur()    { return {slow:2200, normal:1100, fast:480, manual:900}[arpSpeedMode]; }
function arpGetAutoDelay() { return {slow:5200, normal:2600, fast:1200, manual:999999}[arpSpeedMode]; }

// ═══════════════════════════════════════════════════
// STEP DATA — 4 SCENARIOS
// ═══════════════════════════════════════════════════

const ARP_STEPS = {

  // ──────────────────────────────────────────────
  // SCENARIO 1: BASIC ARP REQUEST / REPLY — 6 steps
  // ──────────────────────────────────────────────
  basic: [
    {
      step:1, title:'Step 1 — ARP Cache Miss on PC-A',
      tag:'CACHE MISS', tagColor:'var(--red)', tagBg:'rgba(248,113,113,0.12)',
      desc:'PC-A (192.168.1.10) wants to send data to <strong>192.168.1.20</strong>. Before building the Ethernet frame, it checks its ARP cache for the MAC address of 192.168.1.20. The cache is empty — <strong>MISS!</strong> PC-A must send an ARP Request to resolve the MAC.',
      from:'pca', to:'pca', via:[], pktColor:'#f87171', pktLabel:'MISS',
      activeNodes:['pca'],
      pktCard:['ARP CACHE LOOKUP','Target: 192.168.1.20','Cache result: ❌ MISS','Must broadcast ARP Request','to find target MAC address'],
      fields:[
        {k:'Lookup Target',  v:'192.168.1.20',                   c:'#f87171'},
        {k:'Cache Result',   v:'❌ MISS — no entry found'},
        {k:'PC-A IP',        v:'192.168.1.10'},
        {k:'PC-A MAC',       v:'AA:AA:AA:AA:AA:AA',              c:'#fbbf24'},
        {k:'Next Action',    v:'Broadcast ARP Request',          c:'#fbbf24'},
        {k:'Why ARP?',       v:'Need MAC to build Ethernet frame'},
      ],
      cacheOp: null,
    },
    {
      step:2, title:'Step 2 — PC-A Broadcasts ARP Request',
      tag:'ARP REQUEST', tagColor:'var(--amber)', tagBg:'rgba(251,191,36,0.12)',
      desc:'PC-A constructs an <strong>ARP Request</strong>. Target MAC is set to all zeros (unknown). The Ethernet frame uses destination <strong>FF:FF:FF:FF:FF:FF</strong> (broadcast) — every device on the segment receives this frame. The switch floods it to all ports.',
      from:'pca', to:'sw', via:[], pktColor:'#fbbf24', pktLabel:'ARP\nREQ',
      activeNodes:['pca','sw'],
      pktCard:['ARP REQUEST (Broadcast)','Opcode: 1 (Request)','Sender: AA:AA:AA:AA:AA:AA / .1.10','Target: 00:00:00:00:00:00 / .1.20','Dst Eth: FF:FF:FF:FF:FF:FF'],
      fields:[
        {k:'Opcode',         v:'1 (REQUEST)',                    c:'#fbbf24'},
        {k:'Sender MAC',     v:'AA:AA:AA:AA:AA:AA',             c:'#fbbf24'},
        {k:'Sender IP',      v:'192.168.1.10'},
        {k:'Target MAC',     v:'00:00:00:00:00:00 (unknown!)',   c:'#f87171'},
        {k:'Target IP',      v:'192.168.1.20',                  c:'#38d9c0'},
        {k:'Dst Eth Frame',  v:'FF:FF:FF:FF:FF:FF (broadcast)'},
        {k:'EtherType',      v:'0x0806 (ARP)'},
        {k:'Protocol',       v:'IPv4 (0x0800)'},
      ],
      cacheOp: null,
    },
    {
      step:3, title:'Step 3 — Switch FLOODS to ALL Ports',
      tag:'FLOODING', tagColor:'var(--purple)', tagBg:'rgba(167,139,250,0.12)',
      desc:'The switch receives the broadcast frame. Since the destination is <strong>FF:FF:FF:FF:FF:FF</strong>, the switch <em>floods</em> it out every port except the incoming one. Both PC-B (192.168.1.20) and PC-C (192.168.1.30) receive the ARP Request.',
      from:'sw', to:'pcb', via:[], floodTargets:['pcb','pcc'], pktColor:'#a78bfa', pktLabel:'FLOOD',
      floodDecline: { accept:{node:'pcb',label:'✓ MATCH',color:'#4ade80',reason:['Target IP 192.168.1.20','= My IP → PROCESS!','Sending ARP Reply...']}, reject:{node:'pcc',label:'✗ IGNORE',color:'#f87171',reason:['Target IP 192.168.1.20','≠ My IP 192.168.1.30','Silently DISCARD frame']} },
      activeNodes:['sw','pcb','pcc'],
      pktCard:['SWITCH FLOODS','Dst: FF:FF:FF:FF:FF:FF','Action: Flood all ports','PC-B receives → processes','PC-C receives → ignores (not .20)'],
      fields:[
        {k:'Switch Action',  v:'FLOOD — broadcast frame',       c:'#a78bfa'},
        {k:'Ports flooded',  v:'All except incoming port'},
        {k:'PC-B receives',  v:'✓ Target IP matches!',          c:'#4ade80'},
        {k:'PC-C receives',  v:'✗ Target IP does not match',    c:'#f87171'},
        {k:'PC-C action',    v:'Silently discard frame'},
        {k:'SW MAC table',   v:'Learns AA:AA port → pca'},
      ],
      cacheOp: null,
    },
    {
      step:4, title:'Step 4 — PC-B Sends ARP Reply (Unicast)',
      tag:'ARP REPLY', tagColor:'var(--green)', tagBg:'rgba(74,222,128,0.12)',
      desc:'PC-B sees its own IP (192.168.1.20) in the target IP field. It replies with a <strong>unicast ARP Reply</strong> directly to PC-A\'s MAC. Note: ARP Replies are unicast — only the requester needs the answer! PC-B also caches PC-A\'s MAC from the request.',
      from:'pcb', to:'pca', via:['sw'], pktColor:'#4ade80', pktLabel:'ARP\nREPLY',
      activeNodes:['pcb','sw','pca'],
      pktCard:['ARP REPLY (Unicast)','Opcode: 2 (Reply)','Sender: BB:BB:BB:BB:BB:BB / .1.20','Target: AA:AA:AA:AA:AA:AA / .1.10','Dst Eth: AA:AA:AA:AA:AA:AA (unicast!)'],
      fields:[
        {k:'Opcode',         v:'2 (REPLY)',                      c:'#4ade80'},
        {k:'Sender MAC',     v:'BB:BB:BB:BB:BB:BB',             c:'#4ade80'},
        {k:'Sender IP',      v:'192.168.1.20'},
        {k:'Target MAC',     v:'AA:AA:AA:AA:AA:AA (PC-A)'},
        {k:'Target IP',      v:'192.168.1.10'},
        {k:'Dst Eth Frame',  v:'AA:AA:AA:AA:AA:AA (unicast ✓)', c:'#38d9c0'},
        {k:'EtherType',      v:'0x0806 (ARP)'},
        {k:'PC-B caches',    v:'192.168.1.10 → AA:AA (bonus!)'},
      ],
      cacheOp: {device:'pcb', ip:'192.168.1.10', mac:'AA:AA:AA:AA:AA:AA', type:'Dynamic', ttl:'300s'},
    },
    {
      step:5, title:'Step 5 — PC-A ARP Cache Updated ✓',
      tag:'CACHE HIT', tagColor:'var(--cyan)', tagBg:'rgba(56,217,192,0.12)',
      desc:'PC-A receives the ARP Reply and stores the mapping: <strong>192.168.1.20 → BB:BB:BB:BB:BB:BB</strong> in its ARP cache. This dynamic entry is valid for ~300 seconds (Windows) or ~1200s (Linux, varies by OS). No more ARP needed until it expires!',
      from:'pca', to:'pca', via:[], pktColor:'#38d9c0', pktLabel:'✓ HIT',
      activeNodes:['pca'],
      pktCard:['ARP CACHE UPDATED','192.168.1.20 → BB:BB:BB:BB:BB:BB','Type: Dynamic','TTL: 300s (Windows default)','Next: Build Ethernet frame!'],
      fields:[
        {k:'Cache Entry',    v:'192.168.1.20 → BB:BB:BB:BB:BB:BB', c:'#38d9c0'},
        {k:'Entry Type',     v:'Dynamic (auto-learned)'},
        {k:'TTL Windows',    v:'~300s (ipconfig /all)'},
        {k:'TTL Linux',      v:'~1200s (ip neigh show)'},
        {k:'Check Windows',  v:'arp -a'},
        {k:'Check Linux',    v:'arp -n  OR  ip neigh'},
      ],
      cacheOp: {device:'pca', ip:'192.168.1.20', mac:'BB:BB:BB:BB:BB:BB', type:'Dynamic', ttl:'300s'},
    },
    {
      step:6, title:'Step 6 — Ethernet Frame Sent! ARP Complete 🎉',
      tag:'DATA FLOWS', tagColor:'var(--green)', tagBg:'rgba(74,222,128,0.12)',
      desc:'🎉 With the MAC resolved, PC-A builds the Ethernet frame: <strong>Src MAC = AA:AA:AA:AA:AA:AA, Dst MAC = BB:BB:BB:BB:BB:BB</strong>. The IP packet is encapsulated and sent. All future packets to 192.168.1.20 use the cached MAC — no ARP needed until TTL expires.',
      from:'pca', to:'pcb', via:['sw'], pktColor:'#4ade80', pktLabel:'DATA\nFRAME',
      activeNodes:['pca','sw','pcb'],
      pktCard:['ETHERNET FRAME → PC-B','Src MAC: AA:AA:AA:AA:AA:AA','Dst MAC: BB:BB:BB:BB:BB:BB','No more ARP needed (TTL 300s)','ARP Resolution: COMPLETE ✓'],
      fields:[
        {k:'Src MAC',        v:'AA:AA:AA:AA:AA:AA (PC-A)',       c:'#fbbf24'},
        {k:'Dst MAC',        v:'BB:BB:BB:BB:BB:BB (PC-B ✓)',     c:'#4ade80'},
        {k:'EtherType',      v:'0x0800 (IPv4)'},
        {k:'Src IP',         v:'192.168.1.10'},
        {k:'Dst IP',         v:'192.168.1.20'},
        {k:'ARP Cache',      v:'Valid for 300s — no re-ARP',     c:'#38d9c0'},
      ],
      cacheOp: null,
    },
  ],

  // ──────────────────────────────────────────────
  // SCENARIO 2: GRATUITOUS ARP — 5 steps
  // ──────────────────────────────────────────────
  garp: [
    {
      step:1, title:'Step 1 — PC-A IP Changes / Interface Comes Up',
      tag:'IP CHANGE', tagColor:'var(--cyan)', tagBg:'rgba(56,217,192,0.12)',
      desc:'PC-A\'s IP address has just changed to <strong>192.168.1.50</strong> (DHCP lease renewal, manual change, or HSRP/VRRP failover). Other devices may have a stale ARP cache entry pointing to a different MAC for this IP. PC-A will send a <strong>Gratuitous ARP</strong> to update everyone.',
      from:'pca', to:'pca', via:[], pktColor:'#38d9c0', pktLabel:'NEW\nIP',
      activeNodes:['pca'],
      pktCard:['IP CHANGE DETECTED','New IP: 192.168.1.50','MAC: AA:AA:AA:AA:AA:AA','Stale caches on network!','Sending Gratuitous ARP...'],
      fields:[
        {k:'PC-A New IP',    v:'192.168.1.50',                  c:'#38d9c0'},
        {k:'PC-A MAC',       v:'AA:AA:AA:AA:AA:AA'},
        {k:'Problem',        v:'Others may have wrong ARP entry', c:'#f87171'},
        {k:'Solution',       v:'Gratuitous ARP broadcast'},
        {k:'Use cases',      v:'DHCP, HSRP failover, IP change'},
        {k:'RFC',            v:'RFC 826 — ARP specification'},
      ],
      cacheOp: null,
    },
    {
      step:2, title:'Step 2 — Gratuitous ARP Broadcast Sent',
      tag:'GARP SENT', tagColor:'var(--amber)', tagBg:'rgba(251,191,36,0.12)',
      desc:'PC-A sends a <strong>Gratuitous ARP</strong>: Sender IP = Target IP = <strong>192.168.1.50</strong> (its own IP). Target MAC = 00:00:00:00:00:00. Nobody will reply to this — it\'s an unsolicited announcement. The switch floods it to all ports.',
      from:'pca', to:'sw', via:[], pktColor:'#fbbf24', pktLabel:'GARP',
      activeNodes:['pca','sw'],
      pktCard:['GRATUITOUS ARP','Opcode: 1 (Request — no reply!)','Sender IP: 192.168.1.50 ← own IP','Target IP:  192.168.1.50 ← SAME!','Target MAC: 00:00:00:00:00:00'],
      fields:[
        {k:'Opcode',         v:'1 (Request — no reply expected)', c:'#fbbf24'},
        {k:'Sender MAC',     v:'AA:AA:AA:AA:AA:AA',              c:'#fbbf24'},
        {k:'Sender IP',      v:'192.168.1.50 ← own IP!',        c:'#38d9c0'},
        {k:'Target MAC',     v:'00:00:00:00:00:00 (not asking)'},
        {k:'Target IP',      v:'192.168.1.50 ← SAME as sender!', c:'#38d9c0'},
        {k:'Dst Eth Frame',  v:'FF:FF:FF:FF:FF:FF (broadcast)'},
        {k:'Key point',      v:'Sender IP = Target IP = GARP!',  c:'#fbbf24'},
      ],
      cacheOp: null,
    },
    {
      step:3, title:'Step 3 — Switch Floods to All Ports',
      tag:'FLOODING', tagColor:'var(--purple)', tagBg:'rgba(167,139,250,0.12)',
      desc:'Switch floods the GARP broadcast to every port. <strong>Both PC-B and PC-C receive and process the frame</strong> — unlike a normal ARP Request, no device discards a GARP. Every host updates (or creates) an ARP cache entry for 192.168.1.50 → AA:AA:AA:AA:AA:AA, whether or not they had a prior entry.',
      from:'sw', to:'pcb', via:[], floodTargets:['pcb','pcc'], pktColor:'#a78bfa', pktLabel:'FLOOD',
      floodDecline: { accept:{node:'pcb',label:'✓ UPDATE',color:'#4ade80',reason:['Sender IP 192.168.1.50','ALL devices process GARP','192.168.1.50 → AA:AA']}, reject:{node:'pcc',label:'✓ UPDATE',color:'#4ade80',reason:['Sender IP 192.168.1.50','ALL devices process GARP','192.168.1.50 → AA:AA']} },
      activeNodes:['sw','pcb','pcc'],
      pktCard:['SWITCH FLOODS GARP','All ports receive the GARP','PC-B → update ARP cache ✓','PC-C → update ARP cache ✓','Unlike normal ARP: nobody discards!'],
      fields:[
        {k:'Switch Action',  v:'FLOOD — broadcast frame',       c:'#a78bfa'},
        {k:'PC-B receives',  v:'✓ Processes GARP (update cache)', c:'#4ade80'},
        {k:'PC-C receives',  v:'✓ Processes GARP (update cache)', c:'#4ade80'},
        {k:'Key difference', v:'GARP: ALL hosts update — no discard', c:'#fbbf24'},
        {k:'Cache update',   v:'192.168.1.50 → AA:AA:AA:AA:AA:AA'},
        {k:'No reply',       v:'GARP requests expect no reply'},
      ],
      cacheOp: null,
    },
    {
      step:4, title:'Step 4 — All Devices Update ARP Caches',
      tag:'CACHE UPDATE', tagColor:'var(--green)', tagBg:'rgba(74,222,128,0.12)',
      desc:'PC-B and PC-C each <strong>independently</strong> update their own ARP cache — there is no packet between them. If they already have an entry for 192.168.1.50 it gets <strong>overwritten</strong> with the new MAC; if no entry exists, a new one is created. This is exactly how HSRP/VRRP failover propagates a new active router\'s MAC to the entire LAN in under a millisecond.',
      from:'pca', to:'pca', via:[], pktColor:'#4ade80', pktLabel:'✓ UPD',
      activeNodes:['pcb','pcc'],
      pktCard:['ARP CACHES UPDATED (local)','No packet between PC-B and PC-C!','PC-B: 192.168.1.50 → AA:AA...','PC-C: 192.168.1.50 → AA:AA...','Each device acts independently'],
      fields:[
        {k:'PC-B Cache',     v:'192.168.1.50 → AA:AA:AA:AA:AA:AA', c:'#4ade80'},
        {k:'PC-C Cache',     v:'192.168.1.50 → AA:AA:AA:AA:AA:AA', c:'#4ade80'},
        {k:'How?',           v:'Each host processed the GARP itself', c:'#fbbf24'},
        {k:'Stale entries',  v:'Overwritten automatically'},
        {k:'HSRP use case',  v:'New active router GARPs on failover'},
        {k:'Result',         v:'Entire LAN updated in <1 ms!',      c:'#38d9c0'},
      ],
      cacheOps: [
        {device:'pcb', ip:'192.168.1.50', mac:'AA:AA:AA:AA:AA:AA', type:'Dynamic (GARP)', ttl:'300s'},
        {device:'pca', ip:'192.168.1.50', mac:'AA:AA:AA:AA:AA:AA', type:'Dynamic (GARP)', ttl:'300s'},
      ],
      cacheOp: {device:'pcb', ip:'192.168.1.50', mac:'AA:AA:AA:AA:AA:AA', type:'Dynamic (GARP)', ttl:'300s'},
    },
    {
      step:5, title:'Step 5 — ⚠️ Duplicate IP Detection (If Conflict)',
      tag:'IP CONFLICT', tagColor:'var(--red)', tagBg:'rgba(248,113,113,0.12)',
      desc:'If PC-C <em>also</em> has IP 192.168.1.50 configured, it detects the GARP came from a <strong>different MAC</strong> — an IP conflict! Per <strong>RFC 5227</strong>, PC-C defends its address by broadcasting its <em>own</em> GARP announcement (not a unicast reply). PC-A receives it and both devices raise a conflict alert. In normal operation without conflict, this step is completely silent.',
      from:'pcc', to:'pca', via:['sw'], pktColor:'#f87171', pktLabel:'⚠️\nCONFLICT',
      activeNodes:['pcc','sw','pca'],
      pktCard:['⚠️ DUPLICATE IP CONFLICT!','PC-C also has 192.168.1.50!','PC-C sends own GARP (RFC 5227)','Both devices detect the conflict','Windows: Event ID 4199'],
      fields:[
        {k:'Conflict',       v:'PC-C also has 192.168.1.50!',        c:'#f87171'},
        {k:'PC-C action',    v:'Broadcasts own GARP (RFC 5227 §2.4)', c:'#f87171'},
        {k:'Why GARP?',      v:'Defends IP — not a unicast reply'},
        {k:'PC-A detects',   v:'Two different MACs for same IP!',     c:'#f87171'},
        {k:'Windows alert',  v:'Event ID 4199 in System log'},
        {k:'Linux alert',    v:'kernel: ARPCOLLISION in dmesg'},
        {k:'Resolution',     v:'One device must change its IP'},
      ],
      cacheOp: null,
    },
  ],

  // ──────────────────────────────────────────────
  // SCENARIO 3: ARP SPOOFING / POISONING — 7 steps
  // ──────────────────────────────────────────────
  spoof: [
    {
      step:1, title:'Step 1 — Normal Network State',
      tag:'NORMAL STATE', tagColor:'var(--green)', tagBg:'rgba(74,222,128,0.12)',
      desc:'The network is operating normally. PC-A has the correct ARP cache entry: Gateway 192.168.1.1 → GW:MA:CA:DD:RE:SS. All traffic flows correctly. An attacker (192.168.1.99) is silently connected to the same switch, monitoring the network.',
      from:'pca', to:'pca', via:[], pktColor:'#4ade80', pktLabel:'NORMAL',
      activeNodes:['pca','gw'],
      pktCard:['NORMAL ARP STATE','PC-A cache (correct):','192.168.1.1 → GW:MA:CA:DD:RE:SS','Traffic flows normally','Attacker lurking silently...'],
      fields:[
        {k:'PC-A cache',     v:'192.168.1.1 → GW:MA:CA:DD:RE:SS', c:'#4ade80'},
        {k:'GW cache',       v:'192.168.1.10 → AA:AA:AA:AA:AA:AA', c:'#4ade80'},
        {k:'Traffic path',   v:'PC-A → Gateway (correct)'},
        {k:'Attacker MAC',   v:'CC:CC:CC:CC:CC:CC',               c:'#f87171'},
        {k:'Attacker IP',    v:'192.168.1.99'},
        {k:'Attacker status',v:'Silent — observing',              c:'#f87171'},
      ],
      // Both devices start with correct entries — show the healthy before-state
      cacheOps: [
        {device:'pca', ip:'192.168.1.1',  mac:'GW:MA:CA:DD:RE:SS',  type:'Dynamic', ttl:'300s'},
        {device:'gw',  ip:'192.168.1.10', mac:'AA:AA:AA:AA:AA:AA',  type:'Dynamic', ttl:'300s'},
      ],
      cacheOp: {device:'pca', ip:'192.168.1.1', mac:'GW:MA:CA:DD:RE:SS', type:'Dynamic', ttl:'300s'},
    },
    {
      step:2, title:'Step 2 — Attacker Sends Fake ARP Reply to PC-A',
      tag:'⚠️ FAKE ARP', tagColor:'var(--red)', tagBg:'rgba(248,113,113,0.12)',
      desc:'The attacker sends an <strong>unsolicited ARP Reply</strong> to PC-A: <em>"I am the Gateway (192.168.1.1) and my MAC is CC:CC:CC:CC:CC:CC (Attacker MAC)"</em>. PC-A never asked — but <strong>ARP has zero authentication</strong>. It blindly accepts any ARP Reply it receives!',
      from:'attacker', to:'pca', via:['sw'], pktColor:'#f87171', pktLabel:'⚠️\nFAKE',
      activeNodes:['attacker','sw','pca'],
      pktCard:['⚠️ FAKE ARP REPLY (Unsolicited!)','Opcode: 2 (Reply)','Sender: CC:CC:CC:CC:CC:CC (Attacker!)','Claiming: 192.168.1.1 = CC:CC...','PC-A never asked! No authentication!'],
      fields:[
        {k:'Opcode',         v:'2 (Reply — UNSOLICITED!)',        c:'#f87171'},
        {k:'Sender MAC',     v:'CC:CC:CC:CC:CC:CC (Attacker!)',   c:'#f87171'},
        {k:'Sender IP',      v:'192.168.1.1 (FAKE — GW IP!)',     c:'#f87171'},
        {k:'Target MAC',     v:'AA:AA:AA:AA:AA:AA (PC-A)'},
        {k:'Target IP',      v:'192.168.1.10 (PC-A)'},
        {k:'ARP auth?',      v:'❌ NONE — ARP is unauthenticated', c:'#f87171'},
      ],
      cacheOp: null,
    },
    {
      step:3, title:'Step 3 — PC-A ARP Cache POISONED! 💀',
      tag:'CACHE POISONED', tagColor:'var(--red)', tagBg:'rgba(248,113,113,0.12)',
      desc:'PC-A <strong>blindly overwrites</strong> its ARP cache: 192.168.1.1 now maps to the Attacker\'s MAC (CC:CC:CC:CC:CC:CC). PC-A has no way to verify this. All traffic destined for the Gateway will now be delivered to the Attacker\'s machine!',
      from:'pca', to:'pca', via:[], pktColor:'#f87171', pktLabel:'💀\nPOISON',
      activeNodes:['pca'],
      pktCard:['PC-A CACHE POISONED!','192.168.1.1 → CC:CC:CC:CC:CC:CC','(Was: GW:MA:CA:DD:RE:SS)','All gateway traffic → Attacker','PC-A has no idea!'],
      fields:[
        {k:'Cache BEFORE',   v:'192.168.1.1 → GW:MA:CA:DD:RE:SS', c:'#4ade80'},
        {k:'Cache AFTER',    v:'192.168.1.1 → CC:CC:CC:CC:CC:CC',  c:'#f87171'},
        {k:'PC-A knows?',    v:'❌ No — ARP has no verification'},
        {k:'Effect',         v:'All GW-bound traffic → Attacker'},
        {k:'Defense',        v:'Dynamic ARP Inspection (DAI)'},
        {k:'Also',           v:'Static ARP entries for GW'},
      ],
      cacheOp: {device:'pca', ip:'192.168.1.1', mac:'CC:CC:CC:CC:CC:CC', type:'⚠️ POISONED', ttl:'—'},
    },
    {
      step:4, title:'Step 4 — Attacker Also Poisons the Gateway',
      tag:'⚠️ GW POISONED', tagColor:'var(--red)', tagBg:'rgba(248,113,113,0.12)',
      desc:'To create a <strong>full Man-in-the-Middle</strong>, the attacker also sends a fake ARP to the Gateway: <em>"PC-A (192.168.1.10) is at CC:CC:CC:CC:CC:CC (Attacker MAC)"</em>. Now traffic flowing in BOTH directions passes through the attacker.',
      from:'attacker', to:'gw', via:['sw'], pktColor:'#f87171', pktLabel:'⚠️\nFAKE',
      activeNodes:['attacker','sw','gw'],
      pktCard:['⚠️ FAKE ARP REPLY → GATEWAY','Sender: CC:CC:CC:CC:CC:CC (Attacker!)','Claiming: 192.168.1.10 = CC:CC...','Gateway never asked either!','Both caches now poisoned!'],
      fields:[
        {k:'Opcode',         v:'2 (Reply — UNSOLICITED!)',        c:'#f87171'},
        {k:'Sender MAC',     v:'CC:CC:CC:CC:CC:CC (Attacker!)',   c:'#f87171'},
        {k:'Sender IP',      v:'192.168.1.10 (FAKE — PC-A IP!)',  c:'#f87171'},
        {k:'Target',         v:'Gateway 192.168.1.1'},
        {k:'GW auth?',       v:'❌ None — Gateway also vulnerable'},
        {k:'Result',         v:'GW → PC-A traffic → Attacker'},
      ],
      cacheOp: {device:'gw', ip:'192.168.1.10', mac:'CC:CC:CC:CC:CC:CC', type:'⚠️ POISONED', ttl:'—'},
    },
    {
      step:5, title:'Step 5 — Full MITM Position Established 🚨',
      tag:'MITM ACTIVE', tagColor:'var(--red)', tagBg:'rgba(248,113,113,0.12)',
      desc:'Both caches are poisoned. PC-A tries to send traffic to the Gateway but the frame carries <strong>Attacker\'s MAC as the destination</strong> — so the switch delivers it straight to the attacker. The attacker reads every byte, then silently relays it to the real gateway so the connection appears normal. Neither side suspects anything.',
      from:'pca', to:'attacker', via:['sw'], pktColor:'#f87171', pktLabel:'MITM\n🚨',
      activeNodes:['pca','sw','attacker','gw'],
      pktCard:['MITM FLOW: PC-A → ATTACKER','Dst MAC: CC:CC (Attacker!)','PC-A thinks it\'s the gateway','Attacker reads, then relays to GW','Neither side detects the intercept'],
      fields:[
        {k:'PC-A Dst MAC',   v:'CC:CC:CC:CC:CC:CC (Attacker!)',  c:'#f87171'},
        {k:'PC-A thinks',    v:'Sending to 192.168.1.1 (GW)'},
        {k:'Attacker sees',  v:'Full plaintext — reads every byte', c:'#f87171'},
        {k:'Attacker next',  v:'Relays to real GW (see Step 6)'},
        {k:'Keep-alive',     v:'Re-ARPs every ~30s (cache TTL)'},
        {k:'Defense',        v:'DAI + HTTPS/TLS'},
      ],
      cacheOp: null,
    },
    {
      step:6, title:'Step 6 — Attacker Relays to Real Gateway',
      tag:'RELAY', tagColor:'var(--red)', tagBg:'rgba(248,113,113,0.12)',
      desc:'After reading (and optionally modifying) the packet, the attacker <strong>forwards it to the real Gateway</strong> using the gateway\'s correct MAC. The gateway sees the packet as coming from CC:CC (Attacker) — its poisoned cache entry for PC-A. The connection stays alive; neither side times out or notices anything wrong.',
      from:'attacker', to:'gw', via:['sw'], pktColor:'#f87171', pktLabel:'📬\nRELAY',
      activeNodes:['attacker','sw','gw'],
      pktCard:['ATTACKER RELAYS TO GATEWAY','Src MAC: CC:CC (Attacker)','Dst MAC: GW:MA:CA (real GW)','GW accepts — its cache says CC:CC=PC-A','Connection stays alive — no timeout!'],
      fields:[
        {k:'Src MAC',        v:'CC:CC:CC:CC:CC:CC (Attacker)'},
        {k:'Dst MAC',        v:'GW:MA:CA:DD:RE:SS (real GW)',     c:'#fbbf24'},
        {k:'GW cache',       v:'192.168.1.10 → CC:CC (poisoned)', c:'#f87171'},
        {k:'GW accepts?',    v:'Yes — src MAC matches its cache'},
        {k:'Why relay?',     v:'Drop = connection dies = detected!'},
        {k:'Result',         v:'Invisible intercept maintained',   c:'#f87171'},
      ],
      cacheOp: null,
    },
    {
      step:7, title:'Step 7 — Reverse Path: Gateway Reply Also Intercepted 🚨',
      tag:'INTERCEPTED', tagColor:'var(--red)', tagBg:'rgba(248,113,113,0.12)',
      desc:'The Gateway sends its reply back — but its ARP cache says PC-A\'s MAC is CC:CC (Attacker). So the reply frame is also delivered to the attacker! The attacker reads it, then relays it to PC-A. <strong>Every byte in both directions is exposed.</strong> Defenses: DAI on the switch, static ARP for the gateway, and always use TLS/HTTPS so captured data is useless.',
      from:'gw', to:'attacker', via:['sw'], pktColor:'#f87171', pktLabel:'📬\nSTOLEN',
      activeNodes:['gw','sw','attacker','pca'],
      pktCard:['GW REPLY → ATTACKER!','GW Dst MAC: CC:CC (Attacker)','GW thinks CC:CC = PC-A','Both directions fully intercepted 🚨','Defense: DAI + TLS — always!'],
      fields:[
        {k:'GW Dst MAC',     v:'CC:CC:CC:CC:CC:CC (Attacker!)',   c:'#f87171'},
        {k:'GW thinks',      v:'Replying to PC-A (192.168.1.10)'},
        {k:'Attacker sees',  v:'Reply payload — passwords, tokens', c:'#f87171'},
        {k:'Attacker relay', v:'Forwards to PC-A → stays invisible'},
        {k:'Switch DAI',     v:'ip arp inspection vlan X'},
        {k:'Also defend',    v:'TLS — encrypted data = useless to attacker'},
      ],
      cacheOp: null,
    },
  ],

  // ──────────────────────────────────────────────
  // SCENARIO 4: PROXY ARP — 6 steps
  // ──────────────────────────────────────────────
  proxy: [
    {
      step:1, title:'Step 1 — PC-A Wants to Reach 192.168.2.10 (Remote Subnet)',
      tag:'REMOTE TARGET', tagColor:'var(--blue)', tagBg:'rgba(91,156,246,0.12)',
      desc:'PC-A (192.168.1.10/<strong>8</strong>) has a wrong subnet mask — it thinks 192.168.2.10 is on the <em>same</em> local network. Or, no default gateway is configured. Either way, PC-A tries to ARP for the remote IP directly instead of routing through the gateway!',
      from:'pca', to:'pca', via:[], pktColor:'#5b9cf6', pktLabel:'ARP?\n.2.10',
      activeNodes:['pca'],
      pktCard:['PC-A WANTS REMOTE HOST','Target: 192.168.2.10','PC-A mask: /8 (wrong) or no GW','PC-A thinks .2.10 is local!','Sending ARP for remote IP...'],
      fields:[
        {k:'PC-A IP',        v:'192.168.1.10/8 (misconfigured)'},
        {k:'PC-A Mask',      v:'/8 → thinks .2.x is local!',     c:'#f87171'},
        {k:'Target IP',      v:'192.168.2.10 (remote subnet)'},
        {k:'Normal behavior',v:'Should route via GW (ARP for GW)'},
        {k:'Actual behavior',v:'ARP Request for 192.168.2.10!',  c:'#fbbf24'},
        {k:'Router config',  v:'ip proxy-arp (enabled by default)'},
      ],
      cacheOp: null,
    },
    {
      step:2, title:'Step 2 — PC-A Broadcasts ARP for Remote IP!',
      tag:'ARP REQUEST', tagColor:'var(--amber)', tagBg:'rgba(251,191,36,0.12)',
      desc:'PC-A sends an ARP Request for <strong>192.168.2.10</strong> — a remote subnet IP. Normally hosts would never do this. The broadcast travels to the switch, then to the Router\'s LAN interface. The remote host (192.168.2.10) cannot receive broadcasts — only the router can intercept.',
      from:'pca', to:'rtr', via:['sw'], pktColor:'#fbbf24', pktLabel:'ARP\n.2.10?',
      activeNodes:['pca','sw','rtr'],
      pktCard:['ARP REQUEST (Unusual!)','Who has 192.168.2.10?','Sender: AA:AA / 192.168.1.10','Target: 00:00:00:00:00:00 / .2.10','Dst Eth: FF:FF:FF:FF:FF:FF'],
      fields:[
        {k:'ARP for',        v:'192.168.2.10 (REMOTE IP!)',       c:'#f87171'},
        {k:'Opcode',         v:'1 (Request)'},
        {k:'Sender MAC',     v:'AA:AA:AA:AA:AA:AA'},
        {k:'Sender IP',      v:'192.168.1.10'},
        {k:'Target MAC',     v:'00:00:00:00:00:00 (unknown)'},
        {k:'Dst Eth Frame',  v:'FF:FF:FF:FF:FF:FF (broadcast)',   c:'#fbbf24'},
        {k:'Router receives',v:'On its 192.168.1.x interface'},
      ],
      cacheOp: null,
    },
    {
      step:3, title:'Step 3 — Router Checks Routing Table for .2.10',
      tag:'ROUTING TABLE', tagColor:'var(--purple)', tagBg:'rgba(167,139,250,0.12)',
      desc:'The Router receives the ARP Request on its 192.168.1.x interface. It checks its routing table: it has a connected route to <strong>192.168.2.0/24</strong> on another interface! Since <code>ip proxy-arp</code> is enabled (Cisco default), the router will answer on behalf of 192.168.2.10.',
      from:'rtr', to:'rtr', via:[], pktColor:'#a78bfa', pktLabel:'ROUTE\nCHECK',
      activeNodes:['rtr'],
      pktCard:['ROUTER CHECKS ROUTE TABLE','ARP for: 192.168.2.10','Route: 192.168.2.0/24 → Gi0/1','ip proxy-arp: ENABLED (default)','→ Will reply with own MAC!'],
      fields:[
        {k:'ARP received for', v:'192.168.2.10'},
        {k:'Route lookup',     v:'192.168.2.0/24 via Gi0/1',    c:'#a78bfa'},
        {k:'Route type',       v:'Any — connected, static, OSPF/BGP'},
        {k:'ip proxy-arp',     v:'Enabled (Cisco default)',       c:'#4ade80'},
        {k:'Decision',         v:'Reply with my own MAC!',        c:'#fbbf24'},
        {k:'Disable with',     v:'no ip proxy-arp (on interface)'},
      ],
      cacheOp: null,
    },
    {
      step:4, title:'Step 4 — Router Sends Proxy ARP Reply with ITS MAC',
      tag:'PROXY REPLY', tagColor:'var(--purple)', tagBg:'rgba(167,139,250,0.12)',
      desc:'Router sends an ARP Reply: <em>"192.168.2.10 is at ROUTER-MAC"</em> — using the <strong>router\'s own MAC</strong>, not the remote host\'s MAC! PC-A has no idea this is a proxy reply. It will now address all frames to ROUTER-MAC, and the router handles the actual routing.',
      from:'rtr', to:'pca', via:['sw'], pktColor:'#a78bfa', pktLabel:'PROXY\nARP',
      activeNodes:['rtr','sw','pca'],
      pktCard:['PROXY ARP REPLY (Router)','Sender: RTRR:OUUT:ERMA:CCCC (Router!)','Claiming: 192.168.2.10 = ROUTER-MAC','PC-A → Router-MAC for remote host','Router routes it to .2.10!'],
      fields:[
        {k:'Opcode',         v:'2 (Reply)',                       c:'#a78bfa'},
        {k:'Sender MAC',     v:'RTRR:OUUT:ERMA:CCCC (ROUTER!)',  c:'#a78bfa'},
        {k:'Sender IP',      v:'192.168.2.10 (proxy on behalf!)', c:'#a78bfa'},
        {k:'Target MAC',     v:'AA:AA:AA:AA:AA:AA (PC-A)'},
        {k:'PC-A will cache',v:'192.168.2.10 → ROUTER-MAC'},
        {k:'Real host',      v:'192.168.2.10 never involved!'},
      ],
      cacheOp: {device:'pca', ip:'192.168.2.10', mac:'RTRR:OUUT:ERMA:CCCC', type:'Proxy ARP', ttl:'300s'},
    },
    {
      step:5, title:'Step 5 — PC-A Sends Frame to Router (Forward Path)',
      tag:'DATA FLOWS', tagColor:'var(--green)', tagBg:'rgba(74,222,128,0.12)',
      desc:'PC-A caches 192.168.2.10 → ROUTER-MAC and sends its Ethernet frame addressed to the router. The router receives it on Gi0/0, strips the L2 header, and looks up the destination IP (192.168.2.10) in its routing table. Before forwarding, the router must ARP for 192.168.2.10\'s MAC on its Gi0/1 interface — a normal ARP on the remote segment. Then it delivers the packet.',
      from:'pca', to:'remote', via:['sw','rtr'], pktColor:'#4ade80', pktLabel:'DATA\n→.2.10',
      activeNodes:['pca','sw','rtr','remote'],
      pktCard:['PC-A → ROUTER → REMOTE','Dst MAC: ROUTER-MAC (Ethernet)','Router does L3 lookup → Gi0/1','Router ARPs for .2.10 on remote seg','Remote host receives routed packet!'],
      fields:[
        {k:'PC-A Dst MAC',   v:'RTRR:OUUT:ERMA:CCCC (Router)',   c:'#a78bfa'},
        {k:'PC-A Dst IP',    v:'192.168.2.10 (real destination)', c:'#4ade80'},
        {k:'Router strips',  v:'L2 header, looks up Dst IP'},
        {k:'Hidden ARP',     v:'Router ARPs for .2.10 on Gi0/1',  c:'#fbbf24'},
        {k:'Then delivers',  v:'New Ethernet frame to .2.10 MAC'},
        {k:'PC-A knows?',    v:'Never crossed a router!'},
      ],
      cacheOp: null,
    },
    {
      step:6, title:'Step 6 — Return Path: Remote Replies via Router 🎉',
      tag:'RETURN PATH', tagColor:'var(--cyan)', tagBg:'rgba(56,217,192,0.12)',
      desc:'192.168.2.10 replies to PC-A (192.168.1.10). It sends the frame to its default gateway (the router\'s Gi0/1 MAC). The router receives it, routes it back to the 192.168.1.0 subnet, and delivers it to PC-A via the switch. PC-A receives the reply as if the remote host were local. Proxy ARP is fully transparent — and that\'s also its risk: it <strong>hides subnet boundaries</strong>. Use <code>no ip proxy-arp</code> unless specifically needed.',
      from:'remote', to:'pca', via:['rtr','sw'], pktColor:'#38d9c0', pktLabel:'REPLY\n←.2.10',
      activeNodes:['remote','rtr','sw','pca'],
      pktCard:['REMOTE → ROUTER → PC-A','Remote sends reply to its GW','Router routes back to .1.0/24','Delivered to PC-A via switch','Full round-trip: Proxy ARP ✓'],
      fields:[
        {k:'Remote Dst IP',  v:'192.168.1.10 (PC-A)'},
        {k:'Remote Dst MAC', v:'Router Gi0/1 MAC (its gateway)'},
        {k:'Router routes',  v:'192.168.1.0/24 → Gi0/0 → PC-A'},
        {k:'PC-A receives',  v:'Reply — thinks host was local!',   c:'#38d9c0'},
        {k:'Proxy ARP risk', v:'Hides subnet boundaries',          c:'#f87171'},
        {k:'Disable with',   v:'int Gi0/0 → no ip proxy-arp',     c:'#f87171'},
      ],
      cacheOp: null,
    },
  ],
};

// ═══════════════════════════════════════════════════
// CHAIN BAR LABELS
// ═══════════════════════════════════════════════════
const ARP_CHAINS = {
  basic: ['Cache Miss','ARP Request','Switch Floods','ARP Reply','Cache Updated','Data Flows ✓'],
  garp:  ['IP Change','GARP Sent','Switch Floods','Cache Updated','Conflict Check'],
  spoof: ['Normal State','Fake → PC-A','PC-A Poisoned','Fake → GW','MITM: PC-A→ATK','Relay: ATK→GW','Reply Stolen ✓'],
  proxy: ['Remote Target','ARP Request','Route Lookup','Proxy Reply','Forward→Remote','Return→PC-A ✓'],
};

// ═══════════════════════════════════════════════════
// INIT & MODE SELECT
// ═══════════════════════════════════════════════════
function arpInit() {
  arpDrawTopo(false);
  arpRenderCache();
  arpUpdateUI();
  arpUpdateChain(0);
}

function arpSetMode(mode) {
  arpMode = mode;
  arpReset();
  document.querySelectorAll('.arp-mode-tab').forEach(t => t.classList.remove('active'));
  const tab = document.getElementById('arp-tab-' + mode);
  if (tab) tab.classList.add('active');

  const descEl = document.getElementById('arp-mode-desc');
  const descs = {
    basic: `<strong style="color:var(--amber)">Basic ARP</strong> — The fundamental L2/L3 glue. A client broadcasts "Who has IP X?" and the target replies with its MAC address. Without ARP, IP packets cannot be delivered on Ethernet networks.`,
    garp:  `<strong style="color:var(--cyan)">Gratuitous ARP</strong> — An unsolicited ARP where Sender IP = Target IP. Used to announce IP changes, update stale caches, and detect duplicate IPs. Critical for HSRP/VRRP failover.`,
    spoof: `<strong style="color:var(--red)">ARP Spoofing</strong> — An attacker sends fake ARP Replies to poison caches. Since ARP has no authentication, any device can claim any IP. Defense: Dynamic ARP Inspection (DAI) on managed switches.`,
    proxy: `<strong style="color:var(--purple)">Proxy ARP</strong> — A router answers ARP requests on behalf of remote hosts, using its own MAC. Allows misconfigured hosts (wrong mask / no gateway) to reach remote subnets. Cisco enables this by default.`,
  };
  if (descEl) descEl.innerHTML = descs[mode] || '';

  const totalEl = document.getElementById('arp-step-total');
  if (totalEl) totalEl.textContent = ARP_STEPS[mode].length;
}

function arpUpdateChain(step) {
  const chainEl = document.getElementById('arp-chain-bar');
  if (!chainEl) return;
  const labels = ARP_CHAINS[arpMode] || [];
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
// TOPOLOGY DRAWING
// ═══════════════════════════════════════════════════
function arpDrawTopo(hasAnim, pktX, pktY, pktColor, pktLabel, pktCard) {
  const svg = document.getElementById('arp-svg');
  if (!svg) return;
  const N = arpGetNodes();
  const aN = arpActiveNodes;

  let html = `<defs>
    <marker id="rtr-arrow" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
      <path d="M1 1L7 4L1 7" fill="none" stroke="currentColor" stroke-width="1.5"/>
    </marker>
  </defs>`;

  // ─── Draw per scenario ───
  if (arpMode === 'basic' || arpMode === 'garp') {
    html += svgEdge(N.pca.x, N.pca.y, N.sw.x, N.sw.y, aN.includes('pca')||aN.includes('sw'), '#5b9cf6');
    html += svgEdge(N.sw.x, N.sw.y, N.pcb.x, N.pcb.y, aN.includes('sw')||aN.includes('pcb'), '#5b9cf6');
    html += svgEdge(N.sw.x, N.sw.y, N.pcc.x, N.pcc.y, aN.includes('sw')||aN.includes('pcc'), '#5b9cf6');
    // subnet label
    html += `<rect x="170" y="195" width="170" height="18" rx="4" fill="rgba(91,156,246,0.06)" stroke="rgba(91,156,246,0.15)" stroke-width="0.8"/>
      <text x="255" y="207" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#5a6080">192.168.1.0/24</text>`;
    html += svgPC(N.pca.x, N.pca.y, 'pca', 'PC-A\n192.168.1.10', aN.includes('pca'));
    html += svgSwitch(N.sw.x, N.sw.y, 'sw', 'L2 Switch', aN.includes('sw'));
    html += svgPC(N.pcb.x, N.pcb.y, 'pcb', 'PC-B\n192.168.1.20', aN.includes('pcb'));
    const pccLabel = arpMode === 'garp' ? 'PC-C\n192.168.1.50' : 'PC-C\n192.168.1.30';
    html += svgPC(N.pcc.x, N.pcc.y, 'pcc', pccLabel, aN.includes('pcc'));
    // MAC labels
    html += `<text x="${N.pca.x}" y="${N.pca.y+52}" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#4a5568">AA:AA:AA:AA:AA:AA</text>`;
    html += `<text x="${N.pcb.x}" y="${N.pcb.y+52}" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#4a5568">BB:BB:BB:BB:BB:BB</text>`;
    html += `<text x="${N.pcc.x}" y="${N.pcc.y+52}" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#4a5568">CC:CC:CC:CC:CC:CC</text>`;
  }

  if (arpMode === 'spoof') {
    html += svgEdge(N.pca.x, N.pca.y, N.sw.x, N.sw.y, aN.includes('pca')||aN.includes('sw'), '#5b9cf6');
    html += svgEdge(N.sw.x, N.sw.y, N.gw.x, N.gw.y, aN.includes('sw')||aN.includes('gw'), '#38d9c0');
    html += svgEdge(N.sw.x, N.sw.y, N.attacker.x, N.attacker.y, aN.includes('sw')||aN.includes('attacker'), '#f87171');
    html += `<rect x="165" y="210" width="165" height="18" rx="4" fill="rgba(91,156,246,0.06)" stroke="rgba(91,156,246,0.15)" stroke-width="0.8"/>
      <text x="248" y="222" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#5a6080">192.168.1.0/24</text>`;
    html += svgPC(N.pca.x, N.pca.y, 'pca', 'PC-A\n192.168.1.10', aN.includes('pca'));
    html += svgSwitch(N.sw.x, N.sw.y, 'sw', 'L2 Switch', aN.includes('sw'));
    html += svgRouter(N.gw.x, N.gw.y, 'gw', 'Gateway\n192.168.1.1', aN.includes('gw'));
    // Attacker node (red PC)
    const ac = aN.includes('attacker') ? '#f87171' : '#1e2438';
    const abc = aN.includes('attacker') ? '#f87171' : '#2a3550';
    const atc = aN.includes('attacker') ? '#fff' : '#8892b0';
    html += `<g id="node-attacker" transform="translate(${N.attacker.x},${N.attacker.y})">
      <rect x="-34" y="-30" width="68" height="48" rx="6" fill="${ac}22" stroke="${abc}" stroke-width="${aN.includes('attacker')?2:1.5}"/>
      <rect x="-20" y="-24" width="40" height="26" rx="3" fill="${aN.includes('attacker')?'#2a0a0a':'#111827'}" stroke="${abc}" stroke-width="1"/>
      <text x="0" y="-6" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="14" fill="${aN.includes('attacker')?'#f87171':'#5a6080'}">☠</text>
      <rect x="-9" y="6" width="18" height="3" rx="1" fill="${abc}"/>
      <rect x="-15" y="9" width="30" height="3" rx="1" fill="${abc}"/>
      <text x="0" y="26" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" font-weight="700" fill="${atc}">ATTACKER</text>
      <text x="0" y="36" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="${aN.includes('attacker')?'#f87171':'#5a6080'}">192.168.1.99</text>
    </g>`;
    html += `<text x="${N.pca.x}" y="${N.pca.y+54}" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#4a5568">AA:AA:AA:AA:AA:AA</text>`;
    html += `<text x="${N.attacker.x}" y="${N.attacker.y+54}" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="${aN.includes('attacker')?'#f87171':'#4a5568'}">CC:CC:CC:CC:CC:CC</text>`;
    html += `<text x="${N.gw.x}" y="${N.gw.y+54}" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#4a5568">GW:MA:CA:DD:RE:SS</text>`;
  }

  if (arpMode === 'proxy') {
    html += svgEdge(N.pca.x, N.pca.y, N.sw.x, N.sw.y, aN.includes('pca')||aN.includes('sw'), '#5b9cf6');
    html += svgEdge(N.sw.x, N.sw.y, N.rtr.x, N.rtr.y, aN.includes('sw')||aN.includes('rtr'), '#5b9cf6');
    html += svgEdge(N.rtr.x, N.rtr.y, N.remote.x, N.remote.y, aN.includes('rtr')||aN.includes('remote'), '#a78bfa');
    // Subnet labels
    html += `<rect x="30" y="200" width="155" height="18" rx="4" fill="rgba(91,156,246,0.06)" stroke="rgba(91,156,246,0.15)" stroke-width="0.8"/>
      <text x="108" y="212" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#5a6080">192.168.1.0/24</text>`;
    html += `<rect x="460" y="200" width="155" height="18" rx="4" fill="rgba(167,139,250,0.06)" stroke="rgba(167,139,250,0.15)" stroke-width="0.8"/>
      <text x="538" y="212" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#6a5a90">192.168.2.0/24</text>`;
    html += svgPC(N.pca.x, N.pca.y, 'pca', 'PC-A\n.1.10/8(!)', aN.includes('pca'));
    html += svgSwitch(N.sw.x, N.sw.y, 'sw', 'Switch', aN.includes('sw'));
    html += svgRouter(N.rtr.x, N.rtr.y, 'rtr', 'Router\nProxy ARP', aN.includes('rtr'));
    html += svgServer(N.remote.x, N.remote.y, 'remote', 'Remote PC\n.2.10', aN.includes('remote'), '#a78bfa');
    html += `<text x="${N.pca.x}" y="${N.pca.y+52}" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#4a5568">AA:AA:AA:AA:AA:AA</text>`;
    html += `<text x="${N.rtr.x}" y="${N.rtr.y+52}" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#4a5568">RTRR:OUUT:ERMA:CCCC</text>`;
  }

  // ─── Animated packet ───
  if (pktX !== undefined) {
    const lines = (pktLabel || '').split('\n');
    html += `<circle cx="${pktX}" cy="${pktY}" r="18" fill="${pktColor}18" stroke="${pktColor}" stroke-width="2.5"/>`;
    html += `<circle cx="${pktX}" cy="${pktY}" r="9"  fill="${pktColor}99"/>`;
    lines.forEach((l, i) => {
      html += `<text x="${pktX}" y="${pktY - 3 + i * 10}" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" font-weight="700" fill="#fff">${l}</text>`;
    });

    // Floating info card
    if (pktCard && pktCard.length) {
      const cx = Math.max(100, Math.min(pktX, 660));
      const cy = pktY - 95;
      const cw = 210, ch = 14 + pktCard.length * 14;
      html += `<rect x="${cx-cw/2}" y="${cy}" width="${cw}" height="${ch}" rx="5" fill="rgba(7,9,15,0.94)" stroke="${pktColor}" stroke-width="1.2"/>`;
      html += `<line x1="${pktX}" y1="${pktY-18}" x2="${cx}" y2="${cy+ch}" stroke="${pktColor}" stroke-width="0.8" stroke-dasharray="3,2" opacity="0.6"/>`;
      pktCard.forEach((line, i) => {
        const fc = i === 0 ? pktColor : (i === 1 ? '#c8d0e0' : '#8892b0');
        const fw = i === 0 ? '700' : '400';
        html += `<text x="${cx}" y="${cy+12+i*14}" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="${i===0?9.5:8.5}" font-weight="${fw}" fill="${fc}">${line}</text>`;
      });
    }
  }

  svg.innerHTML = html;
}

// ═══════════════════════════════════════════════════
// ANIMATION ENGINE
// ═══════════════════════════════════════════════════
function arpAnimateStep(step) {
    const steps = ARP_STEPS[arpMode];
    const s = steps[step - 1];
    if (!s) return;
    const N = arpGetNodes();
    const path = [s.from, ...s.via, s.to];
    const uniq = path.filter((n, i) => i === 0 || n !== path[i-1]);
    arpActiveNodes = s.activeNodes || uniq;
  
    // ── Flash animation for self-referencing steps (cache ops) ──
    if (s.from === s.to) {
      const node = N[s.from];
      if (!node) { arpFinalizeStep(s); return; }
      const px = node.x, py = node.y - 18;
      arpDrawTopo(true, px, py, s.pktColor, s.pktLabel, s.pktCard);
      arpAnimId = setTimeout(() => { arpFinalizeStep(s); }, arpGetSegDur() * 1.2);
      return;
    }
  
    // ── FLOOD animation — multiple simultaneous packets ──
    if (s.floodTargets && s.floodTargets.length > 0) {
      const origin = N[s.from];
      if (!origin) { arpFinalizeStep(s); return; }
      let startTime = null;
      const segDur = arpGetSegDur();
  
      function animFlood(ts) {
        if (!startTime) startTime = ts;
        const t = Math.min((ts - startTime) / segDur, 1);
        const e = easeInOut(t);
  
        // Draw base topo with first packet (includes the info card)
        const tgt0 = N[s.floodTargets[0]];
        const px0 = origin.x + (tgt0.x - origin.x) * e;
        const py0 = origin.y + (tgt0.y - origin.y) * e;
        arpDrawTopo(true, px0, py0, s.pktColor, s.pktLabel, t < 0.6 ? s.pktCard : null);
  
        // Append extra packets for remaining targets directly into SVG
        const svg = document.getElementById('arp-svg');
        if (svg) {
          for (let i = 1; i < s.floodTargets.length; i++) {
            const tgt = N[s.floodTargets[i]];
            if (!tgt) continue;
            const px = origin.x + (tgt.x - origin.x) * e;
            const py = origin.y + (tgt.y - origin.y) * e;
  
            const ns = 'http://www.w3.org/2000/svg';
  
            const c1 = document.createElementNS(ns, 'circle');
            c1.setAttribute('cx', px); c1.setAttribute('cy', py);
            c1.setAttribute('r', '18');
            c1.setAttribute('fill', s.pktColor + '18');
            c1.setAttribute('stroke', s.pktColor);
            c1.setAttribute('stroke-width', '2.5');
            svg.appendChild(c1);
  
            const c2 = document.createElementNS(ns, 'circle');
            c2.setAttribute('cx', px); c2.setAttribute('cy', py);
            c2.setAttribute('r', '9');
            c2.setAttribute('fill', s.pktColor + '99');
            svg.appendChild(c2);
  
            (s.pktLabel || '').split('\n').forEach((l, li) => {
              const txt = document.createElementNS(ns, 'text');
              txt.setAttribute('x', px);
              txt.setAttribute('y', py - 3 + li * 10);
              txt.setAttribute('text-anchor', 'middle');
              txt.setAttribute('font-family', 'IBM Plex Mono,monospace');
              txt.setAttribute('font-size', '8');
              txt.setAttribute('font-weight', '700');
              txt.setAttribute('fill', '#fff');
              txt.textContent = l;
              svg.appendChild(txt);
            });
          }
        }
  
        if (t < 1) {
          arpAnimId = requestAnimationFrame(animFlood);
        } else {
            if (s.floodDecline) {
              arpShowFloodResult(s, 0);
            } else {
              setTimeout(() => { arpDrawTopo(false); arpFinalizeStep(s); }, 420);
            }
          }
      }
      arpAnimId = requestAnimationFrame(animFlood);
      return;
    }
  
    // ── Normal single-path animation ──
    const segments = [];
    for (let i = 0; i < uniq.length - 1; i++) {
      const fn = N[uniq[i]], tn = N[uniq[i+1]];
      if (fn && tn) segments.push({from: fn, to: tn});
    }
    if (!segments.length) { arpFinalizeStep(s); return; }
  
    let segIdx = 0, startTime = null;
    const segDur = arpGetSegDur();
  
    function anim(ts) {
      if (!startTime) startTime = ts;
      const elapsed = ts - startTime;
      const t = Math.min(elapsed / segDur, 1);
      const e = easeInOut(t);
      const seg = segments[segIdx];
      const px = seg.from.x + (seg.to.x - seg.from.x) * e;
      const py = seg.from.y + (seg.to.y - seg.from.y) * e;
      arpDrawTopo(true, px, py, s.pktColor, s.pktLabel, s.pktCard);
      if (t >= 1) {
        if (segIdx < segments.length - 1) {
          segIdx++; startTime = ts;
          arpAnimId = requestAnimationFrame(anim);
        } else {
          arpDrawTopo(true, seg.to.x, seg.to.y, s.pktColor, s.pktLabel, s.pktCard);
          setTimeout(() => { arpFinalizeStep(s); }, 420);
        }
      } else {
        arpAnimId = requestAnimationFrame(anim);
      }
    }
    arpAnimId = requestAnimationFrame(anim);
  }

  function arpShowFloodResult(s, flashCount) {
    const N = arpGetNodes();
    const svg = document.getElementById('arp-svg');
    if (!svg || !s.floodDecline) { arpDrawTopo(false); arpFinalizeStep(s); return; }
    const { accept, reject } = s.floodDecline;
    const maxFlashes = 5;
    const flashInterval = arpGetSegDur() * 0.22;
    arpDrawTopo(false);
    const ns = 'http://www.w3.org/2000/svg';
  
    function addResultCard(nodeKey, label, color, lines) {
      const node = N[nodeKey];
      if (!node) return;
      const ring = document.createElementNS(ns, 'circle');
      ring.setAttribute('cx', node.x); ring.setAttribute('cy', node.y); ring.setAttribute('r', '38');
      ring.setAttribute('fill', 'none'); ring.setAttribute('stroke', color); ring.setAttribute('stroke-width', '2');
      ring.setAttribute('opacity', flashCount % 2 === 0 ? '0.85' : '0.35'); ring.setAttribute('stroke-dasharray', '6,3');
      svg.appendChild(ring);
      const badgeW = 64, badgeH = 16, bx = node.x - badgeW/2, by = node.y - 56;
      const badge = document.createElementNS(ns, 'rect');
      badge.setAttribute('x', bx); badge.setAttribute('y', by); badge.setAttribute('width', badgeW); badge.setAttribute('height', badgeH);
      badge.setAttribute('rx', '4'); badge.setAttribute('fill', color+'22'); badge.setAttribute('stroke', color); badge.setAttribute('stroke-width', '1.2');
      svg.appendChild(badge);
      const badgeTxt = document.createElementNS(ns, 'text');
      badgeTxt.setAttribute('x', node.x); badgeTxt.setAttribute('y', by+11); badgeTxt.setAttribute('text-anchor', 'middle');
      badgeTxt.setAttribute('font-family', 'IBM Plex Mono,monospace'); badgeTxt.setAttribute('font-size', '9'); badgeTxt.setAttribute('font-weight', '700'); badgeTxt.setAttribute('fill', color);
      badgeTxt.textContent = label; svg.appendChild(badgeTxt);
      if (lines && lines.length) { // always show card — never hide during flash loop
        const cw = 190, ch = 14 + lines.length * 13;
        const cx = node.x > 400 ? Math.min(node.x + 10, 650) : node.x;
        const cy = node.y - 105;
        const cardRect = document.createElementNS(ns, 'rect');
        cardRect.setAttribute('x', cx-cw/2); cardRect.setAttribute('y', cy); cardRect.setAttribute('width', cw); cardRect.setAttribute('height', ch);
        cardRect.setAttribute('rx', '5'); cardRect.setAttribute('fill', 'rgba(7,9,15,0.96)'); cardRect.setAttribute('stroke', color); cardRect.setAttribute('stroke-width', '1.2');
        svg.appendChild(cardRect);
        const conn = document.createElementNS(ns, 'line');
        conn.setAttribute('x1', cx); conn.setAttribute('y1', cy+ch); conn.setAttribute('x2', node.x); conn.setAttribute('y2', node.y-38);
        conn.setAttribute('stroke', color); conn.setAttribute('stroke-width', '0.8'); conn.setAttribute('stroke-dasharray', '3,2'); conn.setAttribute('opacity', '0.7');
        svg.appendChild(conn);
        lines.forEach((line, i) => {
          const lt = document.createElementNS(ns, 'text');
          lt.setAttribute('x', cx); lt.setAttribute('y', cy+12+i*13); lt.setAttribute('text-anchor', 'middle');
          lt.setAttribute('font-family', 'IBM Plex Mono,monospace'); lt.setAttribute('font-size', i===0?'9.5':'8.5'); lt.setAttribute('font-weight', i===0?'700':'400');
          lt.setAttribute('fill', i===0?color:(i===1?'#c8d0e0':'#8892b0')); lt.textContent = line; svg.appendChild(lt);
        });
      }
    }
  
    addResultCard(accept.node, accept.label, accept.color, accept.reason);
    addResultCard(reject.node, reject.label, reject.color, reject.reason);
  
    if (flashCount < maxFlashes) {
      arpAnimId = setTimeout(() => arpShowFloodResult(s, flashCount + 1), flashInterval);
    } else {
      setTimeout(() => { arpDrawTopo(false); arpFinalizeStep(s); }, arpGetSegDur() * 0.8);
    }
  }
  
  function arpFinalizeStep(s) {
    // Support both a single cacheOp and a cacheOps array for multi-device updates
    if (s.cacheOps) s.cacheOps.forEach(op => arpApplyCacheOp(op));
    else if (s.cacheOp) arpApplyCacheOp(s.cacheOp);
    arpRenderCache();
    arpUpdateUI();
  }



// ═══════════════════════════════════════════════════
// ARP CACHE MANAGEMENT
// ═══════════════════════════════════════════════════
function arpApplyCacheOp(op) {
  if (!op) return;
  const entry = {mac: op.mac, type: op.type, ttl: op.ttl};
  if (op.device === 'pca')  arpCachePCA[op.ip] = entry;
  if (op.device === 'pcb')  arpCachePCB[op.ip] = entry;
  if (op.device === 'gw')   arpCacheGW[op.ip]  = entry;
}

function arpRenderCache() {
  const tbl = document.getElementById('arp-cache-table');
  if (!tbl) return;

  function buildRows(cache, label, color) {
    const entries = Object.entries(cache);
    if (!entries.length) return `<tr><td colspan="4" style="color:var(--muted);font-size:10px;padding:6px 10px;">${label}: empty</td></tr>`;
    return entries.map(([ip, e]) => `
      <tr>
        <td style="color:${color};font-weight:700;padding:5px 10px;font-size:10px;">${label}</td>
        <td style="color:var(--text);padding:5px 8px;font-size:10px;">${ip}</td>
        <td style="color:${e.type.includes('POISONED')||e.type.includes('⚠️')?'#f87171':e.type.includes('Proxy')?'#a78bfa':'#38d9c0'};padding:5px 8px;font-size:10px;">${e.mac}</td>
        <td style="color:${e.type.includes('POISONED')||e.type.includes('⚠️')?'#f87171':'var(--muted2)'};padding:5px 8px;font-size:10px;">${e.type}</td>
      </tr>`).join('');
  }

  const color = {pca:'#5b9cf6', pcb:'#4ade80', gw:'#38d9c0'};
  const labelMap = {basic:{pca:'PC-A',pcb:'PC-B',gw:'GW'}, garp:{pca:'PC-A',pcb:'PC-B',gw:'GW'}, spoof:{pca:'PC-A',pcb:'PC-B',gw:'Gateway'}, proxy:{pca:'PC-A',pcb:'PC-B',gw:'Router'}};
  const lm = labelMap[arpMode] || labelMap.basic;

  tbl.innerHTML = buildRows(arpCachePCA, lm.pca, color.pca)
    + buildRows(arpCachePCB, lm.pcb, color.pcb)
    + buildRows(arpCacheGW, lm.gw, color.gw);
}

// ═══════════════════════════════════════════════════
// UI UPDATE
// ═══════════════════════════════════════════════════
function arpUpdateUI() {
  const steps = ARP_STEPS[arpMode];
  const step = arpCurrentStep;
  const info = document.getElementById('arp-step-info');
  const numEl = document.getElementById('arp-step-num');
  const prog = document.getElementById('arp-progress');
  if (numEl) numEl.textContent = step;
  if (prog)  prog.style.width = (step / steps.length * 100) + '%';
  arpUpdateChain(step);

  if (step === 0) {
    if (info) info.innerHTML = `<div class="step-tag" style="background:rgba(91,156,246,0.12);color:var(--blue)">READY</div>
      <div class="step-title">Select a scenario above and press ▶ Play to begin</div>
      <div class="step-desc">Watch the complete ARP flow step by step — packet animation, ARP cache updates, and Wireshark-style field breakdown for every message.</div>`;
    const f = document.getElementById('arp-pkt-fields');
    if (f) f.innerHTML = '<div style="color:var(--muted);font-family:var(--mono);font-size:11px;">Start the animation to see packet field details…</div>';
    return;
  }

  const s = steps[step - 1];
  if (info) info.innerHTML = `<div class="step-tag" style="background:${s.tagBg};color:${s.tagColor}">${s.tag}</div>
    <div class="step-title">${s.title}</div>
    <div class="step-desc">${s.desc}</div>`;

  const fieldsEl = document.getElementById('arp-pkt-fields');
  if (fieldsEl && s.fields) {
    let fhtml = '<div class="pkt-fields">';
    s.fields.forEach(f => {
      fhtml += `<div class="pkt-field"><div class="pkt-field-key">${f.k}</div><div class="pkt-field-val" style="color:${f.c||'var(--text)'}"> ${f.v}</div></div>`;
    });
    fhtml += '</div>';
    fieldsEl.innerHTML = fhtml;
  }
}

// ═══════════════════════════════════════════════════
// PLAYBACK CONTROLS
// ═══════════════════════════════════════════════════
function arpStep(dir) {
  if (arpAnimId) { cancelAnimationFrame(arpAnimId); clearTimeout(arpAnimId); arpAnimId = null; }
  const steps = ARP_STEPS[arpMode];
  const newStep = arpCurrentStep + dir;
  if (newStep < 0 || newStep > steps.length) return;
  arpCurrentStep = newStep;
  arpActiveNodes = [];
  arpDrawTopo(false);
  arpUpdateUI();
  if (newStep > 0) arpAnimateStep(newStep);
}

function arpTogglePlay() {
  if (arpSpeedMode === 'manual') {
    // In manual mode, Play/Next both step forward
    arpStep(1);
    return;
  }
  arpPlaying = !arpPlaying;
  const btn = document.getElementById('arp-play-btn');
  if (btn) btn.textContent = arpPlaying ? '⏸ Pause' : '▶ Play';
  if (arpPlaying) arpAutoPlay();
  else clearTimeout(arpPlayTimer);
}

function arpAutoPlay() {
  if (!arpPlaying) return;
  const steps = ARP_STEPS[arpMode];
  if (arpCurrentStep >= steps.length) {
    arpPlaying = false;
    const btn = document.getElementById('arp-play-btn');
    if (btn) btn.textContent = '▶ Play';
    return;
  }
  arpStep(1);
  arpPlayTimer = setTimeout(arpAutoPlay, arpGetAutoDelay());
}

function arpReset() {
  arpPlaying = false;
  clearTimeout(arpPlayTimer);
  if (arpAnimId) { cancelAnimationFrame(arpAnimId); clearTimeout(arpAnimId); arpAnimId = null; }
  const btn = document.getElementById('arp-play-btn');
  if (btn) btn.textContent = '▶ Play';
  arpCurrentStep = 0;
  arpActiveNodes = [];
  arpCachePCA = {}; arpCachePCB = {}; arpCacheGW = {};
  arpDrawTopo(false);
  arpUpdateUI();
  arpRenderCache();
  arpUpdateChain(0);
}

// ─── Auto-init on DOM ready ───
document.addEventListener('DOMContentLoaded', function () {
  arpSetMode('basic');
});
