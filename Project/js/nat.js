// ═══════════════════════════════════════════════════
// NAT / PAT SIMULATOR — nat.js
// ═══════════════════════════════════════════════════

let natMode = 'static';
let natCurrentStep = 0, natAnimId = null, natPlaying = false, natPlayTimer = null;
let natActiveNodes = [], natSpeedMode = 'normal';
let natTable = [];

const NAT_NODES = {
  pc1:      { x:80,  y:140 },
  pc2:      { x:80,  y:265 },
  sw:       { x:235, y:200 },
  nat:      { x:400, y:200 },
  internet: { x:565, y:200 },
  server:   { x:695, y:200 },
};

function natSetSpeed(s) {
  natSpeedMode = s;
  ['slow','normal','fast','manual'].forEach(x => {
    const el = document.getElementById('nspeed-' + x);
    if (el) el.classList.toggle('active', x === s);
  });
}
function natGetSegDur()    { return { slow:2200, normal:1100, fast:480, manual:900 }[natSpeedMode]; }
function natGetAutoDelay() { return { slow:5200, normal:2600, fast:1200, manual:999999 }[natSpeedMode]; }


const NAT_STEPS = {

  // ────────────────────────────────────────
  // STATIC NAT
  // ────────────────────────────────────────
  static: [
    {
      step:1, title:'Step 1 — The Four NAT Address Types',
      tag:'NAT TERMS', tagColor:'var(--cyan)', tagBg:'rgba(56,217,192,0.12)',
      desc:'Before packets move, understand the four address types. <strong>Inside Local</strong> = private IP of inside host (10.0.0.10). <strong>Inside Global</strong> = public IP representing inside host on Internet (203.0.113.10). <strong>Outside Global</strong> = real public IP of outside server (8.8.8.8). <strong>Outside Local</strong> = how outside host appears to inside devices (usually same as Outside Global unless double-NAT).',
      from:'nat', to:'nat', via:[], pktColor:'#38d9c0', pktLabel:'TERMS',
      activeNodes:['nat'],
      pktCard:['NAT ADDRESS TYPES','Inside Local:   10.0.0.10','Inside Global:  203.0.113.10','Outside Global: 8.8.8.8','Outside Local:  8.8.8.8 (same)'],
      fields:[
        { k:'Inside Local',    v:'10.0.0.10  (private — real)',      c:'#5b9cf6' },
        { k:'Inside Global',   v:'203.0.113.10  (public — NATted)', c:'#38d9c0' },
        { k:'Outside Global',  v:'8.8.8.8  (server real IP)',        c:'#fbbf24' },
        { k:'Outside Local',   v:'8.8.8.8  (usually same as OG)' },
        { k:'Static NAT',      v:'Permanent 1:1 admin-configured mapping' },
        { k:'Cisco config',    v:'ip nat inside source static 10.0.0.10 203.0.113.10' },
        { k:'Use case',        v:'Exposing inside server to Internet' },
        { k:'Interfaces',      v:'ip nat inside  /  ip nat outside' },
      ],
      tableOp: null,
    },
    {
      step:2, title:'Step 2 — PC-A Sends Packet (Inside Local → NAT Router)',
      tag:'INSIDE → NAT', tagColor:'var(--blue)', tagBg:'rgba(91,156,246,0.12)',
      desc:'PC-A (Inside Local: <strong>10.0.0.10</strong>) sends a packet to server 8.8.8.8. It travels through the switch to the NAT router\'s <em>inside interface</em> (Gi0/0). The packet still carries the <strong>private source IP 10.0.0.10</strong> — translation happens at the router.',
      from:'pc1', to:'nat', via:['sw'], pktColor:'#5b9cf6', pktLabel:'IP PKT',
      activeNodes:['pc1','sw','nat'],
      pktCard:['PACKET — Before NAT','Src IP: 10.0.0.10  ← private!','Dst IP: 8.8.8.8','Src Port: 54321  Dst Port: 443','Router checks NAT table...'],
      fields:[
        { k:'Src IP',          v:'10.0.0.10  (Inside Local)',    c:'#5b9cf6' },
        { k:'Dst IP',          v:'8.8.8.8  (Outside Global)',    c:'#fbbf24' },
        { k:'Src Port',        v:'54321' },
        { k:'Dst Port',        v:'443  (HTTPS)' },
        { k:'Interface',       v:'Arrives on Gi0/0  (ip nat inside)' },
        { k:'NAT checks',      v:'Looks up 10.0.0.10 in static table' },
        { k:'Static map',      v:'10.0.0.10 ↔ 203.0.113.10  (configured)' },
        { k:'Action',          v:'Replace Src IP → 203.0.113.10' },
      ],
      tableOp: { insideLocal:'10.0.0.10', insideGlobal:'203.0.113.10', outsideLocal:'8.8.8.8', outsideGlobal:'8.8.8.8', proto:'TCP', port:'—', type:'Static', status:'active' },
    },
    {
      step:3, title:'Step 3 — NAT Rewrites Src IP: Inside Local → Inside Global',
      tag:'TRANSLATION', tagColor:'var(--amber)', tagBg:'rgba(251,191,36,0.12)',
      desc:'Router finds the static mapping: <strong>10.0.0.10 → 203.0.113.10</strong>. It rewrites the packet\'s <strong>Source IP from 10.0.0.10 to 203.0.113.10</strong>. IP and TCP checksums are recalculated. The private address is now completely hidden — the packet looks like it originated from a legitimate public IP.',
      from:'nat', to:'nat', via:[], pktColor:'#fbbf24', pktLabel:'XLATE',
      activeNodes:['nat'],
      pktCard:['NAT TRANSLATES','10.0.0.10 → 203.0.113.10','Src IP rewritten!','IP + TCP checksums recalculated','Forwarding to Internet...'],
      fields:[
        { k:'Src IP BEFORE',   v:'10.0.0.10  (private)',         c:'#f87171' },
        { k:'Src IP AFTER',    v:'203.0.113.10  (public ✓)',     c:'#4ade80' },
        { k:'Dst IP',          v:'8.8.8.8  (unchanged)' },
        { k:'IP checksum',     v:'Recalculated after rewrite' },
        { k:'TCP checksum',    v:'Recalculated (pseudo-header includes IP)' },
        { k:'Stateful',        v:'Router remembers mapping for reply' },
        { k:'ALG issue',       v:'FTP/SIP embed IP in payload — ALG needed' },
        { k:'Permanent',       v:'Static entry never times out' },
      ],
      tableOp: null,
    },
    {
      step:4, title:'Step 4 — Translated Packet Crosses Internet',
      tag:'INTERNET', tagColor:'var(--amber)', tagBg:'rgba(251,191,36,0.12)',
      desc:'The translated packet exits the NAT router\'s <em>outside interface</em> (Gi0/1) with <strong>Src IP = 203.0.113.10</strong>. The Internet routes it normally — it\'s a perfectly valid public IP packet. The server has no idea 10.0.0.10 exists behind a NAT.',
      from:'nat', to:'server', via:['internet'], pktColor:'#fbbf24', pktLabel:'PUBLIC\nPKT',
      activeNodes:['nat','internet','server'],
      pktCard:['PACKET — After NAT','Src IP: 203.0.113.10  ← public!','Dst IP: 8.8.8.8','10.0.0.10 completely hidden','Internet routes normally'],
      fields:[
        { k:'Src IP',          v:'203.0.113.10  (Inside Global)', c:'#fbbf24' },
        { k:'Dst IP',          v:'8.8.8.8',                       c:'#4ade80' },
        { k:'Private IP',      v:'10.0.0.10 — hidden from Internet' },
        { k:'RFC 1918',        v:'10.x / 172.16-31.x / 192.168.x not routed' },
        { k:'Server sees',     v:'Request from 203.0.113.10 only' },
        { k:'Security',        v:'Internal topology hidden' },
        { k:'Reply must go to',v:'203.0.113.10 → NAT reverses' },
        { k:'Exit interface',  v:'Gi0/1  (ip nat outside)' },
      ],
      tableOp: null,
    },
    {
      step:5, title:'Step 5 — Server Replies to Inside Global',
      tag:'SERVER REPLY', tagColor:'var(--green)', tagBg:'rgba(74,222,128,0.12)',
      desc:'Server (8.8.8.8) sends its reply to <strong>203.0.113.10</strong>. The packet arrives at the NAT router\'s outside interface. The router looks up 203.0.113.10 in the NAT table and finds the reverse mapping: 203.0.113.10 → 10.0.0.10. It rewrites the Destination IP.',
      from:'server', to:'nat', via:['internet'], pktColor:'#4ade80', pktLabel:'REPLY',
      activeNodes:['server','internet','nat'],
      pktCard:['SERVER REPLY','Src: 8.8.8.8','Dst: 203.0.113.10','NAT: .113.10 → 10.0.0.10','Reverse lookup automatic'],
      fields:[
        { k:'Src IP',          v:'8.8.8.8  (server)',             c:'#4ade80' },
        { k:'Dst IP',          v:'203.0.113.10  (Inside Global)' },
        { k:'NAT lookup',      v:'203.0.113.10 → 10.0.0.10',     c:'#38d9c0' },
        { k:'Action',          v:'Rewrite Dst IP → 10.0.0.10' },
        { k:'Stateful',        v:'Reverse entry auto-created on outbound' },
        { k:'No extra config', v:'Reverse NAT is automatic' },
        { k:'Interface',       v:'Arrives on Gi0/1  (ip nat outside)' },
        { k:'Next',            v:'Deliver to PC-A at 10.0.0.10' },
      ],
      tableOp: null,
    },
    {
      step:6, title:'Step 6 — NAT Reverses Reply → Delivers to PC-A ✓',
      tag:'REVERSE NAT ✓', tagColor:'var(--green)', tagBg:'rgba(74,222,128,0.12)',
      desc:'NAT rewrites Dst IP: <strong>203.0.113.10 → 10.0.0.10</strong> and forwards to PC-A on the inside interface. PC-A receives the reply as if it came directly from 8.8.8.8 — completely unaware of NAT. Static NAT: PC-B (10.0.0.20) needs its <em>own</em> separate 1:1 mapping — one public IP per host.',
      from:'nat', to:'pc1', via:['sw'], pktColor:'#4ade80', pktLabel:'REPLY\n→PC-A',
      activeNodes:['nat','sw','pc1'],
      pktCard:['REVERSE TRANSLATED ✓','Dst: 203.0.113.10 → 10.0.0.10','Delivered to PC-A!','PC-A unaware of NAT','Static NAT: COMPLETE ✓'],
      fields:[
        { k:'Dst IP BEFORE',   v:'203.0.113.10',                  c:'#fbbf24' },
        { k:'Dst IP AFTER',    v:'10.0.0.10  (PC-A ✓)',           c:'#4ade80' },
        { k:'Src IP',          v:'8.8.8.8  (unchanged)' },
        { k:'PC-A transparent',v:'Has no idea NAT happened' },
        { k:'PC-B needs',      v:'Own static: 10.0.0.20 ↔ 203.0.113.11' },
        { k:'Limitation',      v:'1 public IP consumed per inside host!' },
        { k:'Table entry',     v:'Stays permanently — no timeout' },
        { k:'Verify',          v:'show ip nat translations' },
      ],
      tableOp: null,
    },
  ],

  // ────────────────────────────────────────
  // DYNAMIC NAT
  // ────────────────────────────────────────
  dynamic: [
    {
      step:1, title:'Step 1 — Dynamic NAT Pool of Public IPs',
      tag:'NAT POOL', tagColor:'var(--purple)', tagBg:'rgba(167,139,250,0.12)',
      desc:'Dynamic NAT uses a <strong>pool of public IPs</strong> shared among inside hosts. When a host sends a packet, the router picks the first available pool IP and creates a <em>temporary</em> mapping. Pool: <strong>203.0.113.10 – 203.0.113.13</strong> = 4 addresses. Critical limitation: only 4 hosts can use the Internet simultaneously!',
      from:'nat', to:'nat', via:[], pktColor:'#a78bfa', pktLabel:'POOL',
      activeNodes:['nat'],
      pktCard:['DYNAMIC NAT POOL','Range: 203.0.113.10 – .13','4 public IPs available','First-come first-served','Times out after idle period'],
      fields:[
        { k:'Pool range',      v:'203.0.113.10 – 203.0.113.13',  c:'#a78bfa' },
        { k:'Pool size',       v:'4 public IP addresses' },
        { k:'Assignment',      v:'First available IP from pool' },
        { k:'Timeout TCP',     v:'86400s  (24h default Cisco)' },
        { k:'Timeout UDP',     v:'300s  (5 min)' },
        { k:'Hard limit',      v:'Only 4 simultaneous hosts!' },
        { k:'Cisco config',    v:'ip nat pool MYPOOL 203.0.113.10 203.0.113.13 prefix-length 24' },
        { k:'vs PAT',          v:'Dynamic: 1 IP per host  |  PAT: 1 IP for ALL' },
      ],
      tableOp: null,
    },
    {
      step:2, title:'Step 2 — PC-A Gets First Pool IP: 203.0.113.10',
      tag:'PC-A MAPPED', tagColor:'var(--blue)', tagBg:'rgba(91,156,246,0.12)',
      desc:'PC-A (10.0.0.10) sends the first packet. The NAT router picks <strong>203.0.113.10</strong> (first free) from the pool and creates a dynamic mapping. The pool IP is now <strong>reserved</strong> — no other host can use it until the mapping expires.',
      from:'pc1', to:'nat', via:['sw'], pktColor:'#5b9cf6', pktLabel:'PC-A\nPKT',
      activeNodes:['pc1','sw','nat'],
      pktCard:['PC-A → NAT Router','Src: 10.0.0.10','Pool assigns: 203.0.113.10','Dynamic entry created!','203.0.113.10 now RESERVED'],
      fields:[
        { k:'Inside Local',    v:'10.0.0.10  (PC-A)',             c:'#5b9cf6' },
        { k:'Inside Global',   v:'203.0.113.10  (assigned)',      c:'#4ade80' },
        { k:'Pool now',        v:'.10=USED  .11=free  .12=free  .13=free' },
        { k:'Entry type',      v:'Dynamic  (temporary)' },
        { k:'Timer starts',    v:'Expires after idle timeout' },
        { k:'Reserved',        v:'203.0.113.10 locked to PC-A only' },
        { k:'Next host',       v:'PC-B will get .11 from pool' },
        { k:'Verify',          v:'show ip nat translations' },
      ],
      tableOp: { insideLocal:'10.0.0.10', insideGlobal:'203.0.113.10', outsideLocal:'8.8.8.8', outsideGlobal:'8.8.8.8', proto:'TCP', port:'—', type:'Dynamic', status:'active' },
    },
    {
      step:3, title:'Step 3 — PC-B Gets Next Pool IP: 203.0.113.11',
      tag:'PC-B MAPPED', tagColor:'var(--blue)', tagBg:'rgba(91,156,246,0.12)',
      desc:'PC-B (10.0.0.20) sends a packet. The NAT router picks <strong>203.0.113.11</strong> (next free). Both PC-A and PC-B now have dedicated public IPs and communicate independently. Each host gets its own entire public IP — no port sharing. Two of four pool IPs are now consumed.',
      from:'pc2', to:'nat', via:['sw'], pktColor:'#5b9cf6', pktLabel:'PC-B\nPKT',
      activeNodes:['pc2','sw','nat'],
      pktCard:['PC-B → NAT Router','Src: 10.0.0.20','Pool assigns: 203.0.113.11','2nd dynamic entry created','2 of 4 pool IPs used'],
      fields:[
        { k:'Inside Local',    v:'10.0.0.20  (PC-B)',             c:'#5b9cf6' },
        { k:'Inside Global',   v:'203.0.113.11  (assigned)',      c:'#4ade80' },
        { k:'Pool now',        v:'.10=USED  .11=USED  .12=free  .13=free' },
        { k:'PC-A',            v:'Still using 203.0.113.10' },
        { k:'Remaining',       v:'2 pool IPs left (.12 and .13)' },
        { k:'5th host',        v:'POOL EXHAUSTED — packets dropped!',  c:'#f87171' },
        { k:'Solution',        v:'PAT — 65,000+ sessions on 1 IP',     c:'#38d9c0' },
        { k:'Error log',       v:'%IP-4-NOPERM: NAT pool exhausted' },
      ],
      tableOp: { insideLocal:'10.0.0.20', insideGlobal:'203.0.113.11', outsideLocal:'8.8.8.8', outsideGlobal:'8.8.8.8', proto:'TCP', port:'—', type:'Dynamic', status:'active' },
    },
    {
      step:4, title:'Step 4 — Both Sessions Active, Data Flows',
      tag:'DATA FLOWS', tagColor:'var(--green)', tagBg:'rgba(74,222,128,0.12)',
      desc:'Both hosts communicate through Internet using their assigned public IPs. The server sees two separate clients from 203.0.113.10 and 203.0.113.11. The NAT router translates all packets in both directions. Pool entries are active and reserved for the duration of the sessions.',
      from:'nat', to:'server', via:['internet'], pktColor:'#4ade80', pktLabel:'BOTH\nFLOW',
      activeNodes:['pc1','pc2','sw','nat','internet','server'],
      pktCard:['DYNAMIC NAT ACTIVE','203.0.113.10 → 8.8.8.8  (PC-A)','203.0.113.11 → 8.8.8.8  (PC-B)','Same dest, different src IPs','2 of 4 pool IPs in use'],
      fields:[
        { k:'PC-A session',    v:'10.0.0.10 ↔ 203.0.113.10',    c:'#5b9cf6' },
        { k:'PC-B session',    v:'10.0.0.20 ↔ 203.0.113.11',    c:'#5b9cf6' },
        { k:'Server sees',     v:'Two separate public IPs' },
        { k:'Pool used',       v:'2 of 4  (.10 and .11)' },
        { k:'No port sharing', v:'Each host gets entire public IP' },
        { k:'Waste',           v:'IP idle when host not sending' },
        { k:'Better option',   v:'PAT: 1 IP serves thousands' },
        { k:'Monitor',         v:'show ip nat translations verbose' },
      ],
      tableOp: null,
    },
    {
      step:5, title:'Step 5 — Entry Times Out → IP Returns to Pool',
      tag:'TIMEOUT', tagColor:'var(--amber)', tagBg:'rgba(251,191,36,0.12)',
      desc:'PC-A finishes. After the <strong>NAT timeout</strong> (24h TCP default), the dynamic entry is removed. <strong>203.0.113.10 returns to the pool</strong> and is available for the next host. This is the key difference from Static NAT — dynamic entries are temporary and self-managing.',
      from:'nat', to:'nat', via:[], pktColor:'#fbbf24', pktLabel:'TIMEOUT',
      activeNodes:['nat'],
      pktCard:['NAT ENTRY TIMED OUT','10.0.0.10 ↔ 203.0.113.10','Removed from table','203.0.113.10 back in pool!','Ready for next host'],
      fields:[
        { k:'Expired',         v:'10.0.0.10 ↔ 203.0.113.10',    c:'#fbbf24' },
        { k:'TCP timeout',     v:'86400s  (24h)' },
        { k:'UDP timeout',     v:'300s  (5 min)' },
        { k:'SYN timeout',     v:'60s  (half-open)' },
        { k:'Pool now',        v:'.10=FREE  .11=USED  .12=free  .13=free' },
        { k:'Override',        v:'ip nat translation timeout <seconds>' },
        { k:'Clear manually',  v:'clear ip nat translation *' },
        { k:'Verify',          v:'show ip nat translations verbose' },
      ],
      tableOp: { insideLocal:'10.0.0.10', insideGlobal:'203.0.113.10', outsideLocal:'—', outsideGlobal:'—', proto:'—', port:'—', type:'Dynamic', status:'expired' },
    },
  ],

  // ────────────────────────────────────────
  // PAT / NAT OVERLOAD
  // ────────────────────────────────────────
  pat: [
    {
      step:1, title:'Step 1 — PAT: Many Private IPs, ONE Public IP',
      tag:'PAT CONCEPT', tagColor:'var(--cyan)', tagBg:'rgba(56,217,192,0.12)',
      desc:'<strong>PAT (Port Address Translation)</strong> — also called NAT Overload — maps <em>thousands</em> of inside hosts to a <strong>single public IP</strong> using unique <strong>source port numbers</strong> as the differentiator. This is what every home router does. One ISP-assigned IP serves your entire office.',
      from:'nat', to:'nat', via:[], pktColor:'#38d9c0', pktLabel:'PAT\nOVLD',
      activeNodes:['nat'],
      pktCard:['PAT / NAT OVERLOAD','1 Public IP: 203.0.113.10','Thousands of private hosts!','Port numbers = session IDs','Standard home/enterprise NAT'],
      fields:[
        { k:'Public IP',       v:'203.0.113.10  (single IP!)',    c:'#38d9c0' },
        { k:'Differentiator',  v:'Source port number',            c:'#fbbf24' },
        { k:'Port range',      v:'1024–65535  (ephemeral)' },
        { k:'Max sessions',    v:'~64,511 per public IP (theoretical)' },
        { k:'Real limit',      v:'Memory/CPU  (~16k–65k typical)' },
        { k:'Cisco config',    v:'ip nat inside source list ACL int Gi0/1 overload' },
        { k:'vs Dynamic NAT',  v:'Dynamic: 1 IP/host  |  PAT: 1 IP for ALL' },
        { k:'Used by',         v:'99% of home and SMB routers worldwide' },
      ],
      tableOp: null,
    },
    {
      step:2, title:'Step 2 — PC-A Sends Packet (Src Port 54321)',
      tag:'PC-A :54321', tagColor:'var(--blue)', tagBg:'rgba(91,156,246,0.12)',
      desc:'PC-A (10.0.0.10) sends a packet with source port <strong>54321</strong> (randomly chosen by the OS). The NAT router will map this to the single public IP 203.0.113.10 and assign a translated port to uniquely track this session in the PAT table.',
      from:'pc1', to:'nat', via:['sw'], pktColor:'#5b9cf6', pktLabel:'PC-A\n:54321',
      activeNodes:['pc1','sw','nat'],
      pktCard:['PC-A PACKET — Before PAT','Src: 10.0.0.10:54321','Dst: 8.8.8.8:443','PAT will rewrite src IP AND port','New entry: .0.10:54321 → .113.10:10001'],
      fields:[
        { k:'Src IP',          v:'10.0.0.10  (private)',          c:'#5b9cf6' },
        { k:'Src Port',        v:'54321  (ephemeral, OS chosen)',  c:'#fbbf24' },
        { k:'Dst IP',          v:'8.8.8.8' },
        { k:'Dst Port',        v:'443  (HTTPS)' },
        { k:'NAT rewrites',    v:'BOTH Src IP AND Src Port' },
        { k:'New Src IP',      v:'203.0.113.10  (public)' },
        { k:'New Src Port',    v:'10001  (assigned by PAT router)' },
        { k:'Table entry',     v:'10.0.0.10:54321 ↔ 203.0.113.10:10001' },
      ],
      tableOp: { insideLocal:'10.0.0.10:54321', insideGlobal:'203.0.113.10:10001', outsideLocal:'8.8.8.8:443', outsideGlobal:'8.8.8.8:443', proto:'TCP', port:'10001', type:'PAT', status:'active' },
    },
    {
      step:3, title:'Step 3 — PC-B Also Uses Port 54321 (Conflict Handled!)',
      tag:'SAME PORT!', tagColor:'var(--amber)', tagBg:'rgba(251,191,36,0.12)',
      desc:'PC-B (10.0.0.20) <em>also</em> happens to use source port <strong>54321</strong>. With static/dynamic NAT this would collide — but PAT handles it: both sessions share public IP 203.0.113.10, but the router assigns PC-B port <strong>10002</strong>. The port differentiates the sessions!',
      from:'pc2', to:'nat', via:['sw'], pktColor:'#fbbf24', pktLabel:'PC-B\n:54321',
      activeNodes:['pc2','sw','nat'],
      pktCard:['PC-B — SAME PORT 54321!','Src: 10.0.0.20:54321  (clash!)','PAT assigns: port 10002','Same public IP 203.0.113.10','Port = session identifier!'],
      fields:[
        { k:'Src IP',          v:'10.0.0.20  (private)',          c:'#fbbf24' },
        { k:'Src Port',        v:'54321  (SAME as PC-A!)',        c:'#f87171' },
        { k:'PAT new port',    v:'10002  (unique — no clash!)',   c:'#4ade80' },
        { k:'Public IP',       v:'203.0.113.10  (shared)',        c:'#38d9c0' },
        { k:'No conflict',     v:'10001 (PC-A) vs 10002 (PC-B)' },
        { k:'Key insight',     v:'Port uniquely identifies each session', c:'#38d9c0' },
        { k:'Port collision',  v:'If port taken, NAT picks next free port' },
        { k:'RFC 3022',        v:'Traditional NAT (NAPT)' },
      ],
      tableOp: { insideLocal:'10.0.0.20:54321', insideGlobal:'203.0.113.10:10002', outsideLocal:'8.8.8.8:443', outsideGlobal:'8.8.8.8:443', proto:'TCP', port:'10002', type:'PAT', status:'active' },
    },
    {
      step:4, title:'Step 4 — Both Packets Exit Internet with Different Ports',
      tag:'INTERNET', tagColor:'var(--amber)', tagBg:'rgba(251,191,36,0.12)',
      desc:'Both translated packets travel the Internet from the same public IP <strong>203.0.113.10</strong> but with different source ports (10001 and 10002). The server differentiates them by the 5-tuple: (src IP, <strong>src port</strong>, dst IP, dst port, proto).',
      from:'nat', to:'server', via:['internet'], pktColor:'#fbbf24', pktLabel:'BOTH\n:10001\n:10002',
      activeNodes:['nat','internet','server'],
      pktCard:['TWO PAT SESSIONS OUT','203.0.113.10:10001  (PC-A)','203.0.113.10:10002  (PC-B)','Same IP, different ports!','Server sees 2 separate connections'],
      fields:[
        { k:'PC-A',            v:'203.0.113.10:10001 → 8.8.8.8:443', c:'#5b9cf6' },
        { k:'PC-B',            v:'203.0.113.10:10002 → 8.8.8.8:443', c:'#fbbf24' },
        { k:'Server sees',     v:'2 separate TCP connections' },
        { k:'5-tuple',         v:'src IP + src port + dst IP + dst port + proto' },
        { k:'Port is key',     v:'10001 ≠ 10002 — unique sessions',  c:'#38d9c0' },
        { k:'Ephemeral range', v:'OS picks 1024–65535 randomly' },
        { k:'Port exhaustion', v:'Many sessions same dest = limited ports' },
        { k:'ALG needed',      v:'FTP/SIP embed IPs in payload!' },
      ],
      tableOp: null,
    },
    {
      step:5, title:'Step 5 — Server Replies → PAT Demultiplexes by Port',
      tag:'REPLY DEMUX', tagColor:'var(--green)', tagBg:'rgba(74,222,128,0.12)',
      desc:'Server replies to <strong>203.0.113.10:10001</strong>. NAT looks up port 10001 → finds 10.0.0.10:54321 → rewrites Dst IP+Port → delivers to PC-A. The reply to port 10002 goes to PC-B. The <strong>port number is the demultiplexer</strong> — this is how PAT knows which host gets which reply.',
      from:'server', to:'nat', via:['internet'], pktColor:'#4ade80', pktLabel:'REPLY\n:10001',
      activeNodes:['server','internet','nat'],
      pktCard:['SERVER REPLY','Dst: 203.0.113.10:10001','PAT looks up port 10001','→ 10.0.0.10:54321  (PC-A!)',':10002 would go to PC-B'],
      fields:[
        { k:'Reply dst',       v:'203.0.113.10:10001' },
        { k:'PAT lookup',      v:'Port 10001 → 10.0.0.10:54321',  c:'#4ade80' },
        { k:'Rewrite dst',     v:'203.0.113.10:10001 → 10.0.0.10:54321' },
        { k:'Delivers to',     v:'PC-A  (10.0.0.10)',             c:'#5b9cf6' },
        { k:'Port 10002',      v:'→ PC-B  (10.0.0.20)',           c:'#fbbf24' },
        { k:'Demux key',       v:'Port number = session identifier' },
        { k:'NAPT',            v:'Network Address+Port Translation (formal)' },
        { k:'ALG issue',       v:'FTP active mode: IP in PORT command' },
      ],
      tableOp: null,
    },
    {
      step:6, title:'Step 6 — PAT Delivers to Correct Hosts ✓',
      tag:'DELIVERED ✓', tagColor:'var(--green)', tagBg:'rgba(74,222,128,0.12)',
      desc:'🎉 Both hosts get their correct replies. PC-A gets Dst=10.0.0.10:54321, PC-B gets Dst=10.0.0.20:54321. Both unaware of PAT. One public IP served two sessions — scale this to 65,000+ simultaneous sessions! This is why the entire Internet still works with IPv4.',
      from:'nat', to:'pc1', via:['sw'], pktColor:'#4ade80', pktLabel:'✓ PC-A\nDELIVER',
      activeNodes:['nat','sw','pc1','pc2'],
      pktCard:['PAT COMPLETE ✓','PC-A: 10.0.0.10:54321 ✓','PC-B: 10.0.0.20:54321 ✓','1 public IP served 2 sessions','Scale to 65,000+ sessions!'],
      fields:[
        { k:'PC-A receives',   v:'→ 10.0.0.10:54321  ✓',          c:'#4ade80' },
        { k:'PC-B receives',   v:'→ 10.0.0.20:54321  ✓',          c:'#4ade80' },
        { k:'Public IPs used', v:'1  (203.0.113.10)' },
        { k:'Sessions served', v:'2  (scale to 65,000+)' },
        { k:'ALG protocols',   v:'FTP, SIP, H.323, PPTP need helpers' },
        { k:'ip nat service',  v:'ftp / sip / h323  (Cisco ALG)' },
        { k:'IPv6 solution',   v:'Enough IPs — NAT unnecessary' },
        { k:'CGNAT',           v:'ISP-level PAT  (RFC 6598  100.64.0.0/10)' },
      ],
      tableOp: null,
    },
  ],

  // ────────────────────────────────────────
  // PORT FORWARDING (DNAT)
  // ────────────────────────────────────────
  portfwd: [
    {
      step:1, title:'Step 1 — Port Forwarding: Internet → Inside Server',
      tag:'PORT FWD', tagColor:'var(--purple)', tagBg:'rgba(167,139,250,0.12)',
      desc:'<strong>Port Forwarding</strong> (Destination NAT / DNAT) allows outside hosts to reach <em>inside private servers</em> through NAT. Without this, NAT blocks all inbound connections. Mapping: public <strong>203.0.113.10:80 → inside 10.0.0.10:8080</strong>. Only the specified port is exposed.',
      from:'nat', to:'nat', via:[], pktColor:'#a78bfa', pktLabel:'PORT\nFWD',
      activeNodes:['nat'],
      pktCard:['PORT FORWARDING (DNAT)','Outside → Inside','Public:  203.0.113.10:80','Private: 10.0.0.10:8080','Only port 80 exposed!'],
      fields:[
        { k:'Direction',       v:'Internet → Inside  (INBOUND)',  c:'#a78bfa' },
        { k:'Public IP:Port',  v:'203.0.113.10:80  (HTTP)',       c:'#a78bfa' },
        { k:'Forwards to',     v:'10.0.0.10:8080  (inside web svr)' },
        { k:'NAT type',        v:'Destination NAT  (DNAT)' },
        { k:'Cisco config',    v:'ip nat inside source static tcp 10.0.0.10 8080 203.0.113.10 80' },
        { k:'Use case',        v:'Web server, SSH, game server, cameras' },
        { k:'Security',        v:'Only port 80 exposed — all others blocked' },
        { k:'DMZ alternative', v:'DMZ forwards ALL ports to one host' },
      ],
      tableOp: { insideLocal:'10.0.0.10:8080', insideGlobal:'203.0.113.10:80', outsideLocal:'—', outsideGlobal:'—', proto:'TCP', port:'80→8080', type:'Port Fwd', status:'configured' },
    },
    {
      step:2, title:'Step 2 — Internet Client Sends SYN to Public IP:80',
      tag:'INBOUND SYN', tagColor:'var(--blue)', tagBg:'rgba(91,156,246,0.12)',
      desc:'An Internet client (5.5.5.5) sends SYN to <strong>203.0.113.10:80</strong>. It has no idea there\'s a private server behind NAT. The packet arrives on the router\'s outside interface. NAT checks if port 80 has a forwarding rule — it does!',
      from:'server', to:'nat', via:['internet'], pktColor:'#5b9cf6', pktLabel:'SYN\n→:80',
      activeNodes:['server','internet','nat'],
      pktCard:['INTERNET CLIENT → :80','Src: 5.5.5.5:44000','Dst: 203.0.113.10:80','NAT checks port 80 rule...','Port 80 forwarding rule FOUND!'],
      fields:[
        { k:'Src IP',          v:'5.5.5.5  (Internet client)' },
        { k:'Src Port',        v:'44000  (ephemeral)' },
        { k:'Dst IP',          v:'203.0.113.10  (public)',        c:'#5b9cf6' },
        { k:'Dst Port',        v:'80  (HTTP)',                    c:'#fbbf24' },
        { k:'NAT lookup',      v:'Port 80 → forwarding rule found!' },
        { k:'Rule',            v:'203.0.113.10:80 → 10.0.0.10:8080' },
        { k:'No rule',         v:'NAT drops packet — no inside match' },
        { k:'DMZ alt',         v:'DMZ: forward all ports to one host' },
      ],
      tableOp: null,
    },
    {
      step:3, title:'Step 3 — NAT Rewrites Dst IP AND Dst Port (DNAT)',
      tag:'DNAT REWRITE', tagColor:'var(--purple)', tagBg:'rgba(167,139,250,0.12)',
      desc:'NAT applies the DNAT rule: <strong>Dst IP 203.0.113.10 → 10.0.0.10</strong> AND <strong>Dst Port 80 → 8080</strong>. Both IP and port are rewritten. Packet forwarded on inside interface to the web server. Key difference from outbound PAT: here the <em>destination</em> is being translated.',
      from:'nat', to:'pc1', via:['sw'], pktColor:'#a78bfa', pktLabel:'FWD\n→:8080',
      activeNodes:['nat','sw','pc1'],
      pktCard:['DNAT APPLIED','Dst: 203.0.113.10:80','→ Dst: 10.0.0.10:8080','IP AND Port both rewritten!','Delivered to internal web server'],
      fields:[
        { k:'Dst IP BEFORE',   v:'203.0.113.10  (public)',        c:'#fbbf24' },
        { k:'Dst IP AFTER',    v:'10.0.0.10  (web server)',      c:'#4ade80' },
        { k:'Dst Port BEFORE', v:'80',                            c:'#fbbf24' },
        { k:'Dst Port AFTER',  v:'8080  (internal service port)', c:'#4ade80' },
        { k:'Src',             v:'5.5.5.5:44000  (unchanged)' },
        { k:'Server sees',     v:'Connection from 5.5.5.5:44000' },
        { k:'Src NATd?',       v:'No — only dst is rewritten here' },
        { k:'Firewall',        v:'Often combined with ACL permit rule' },
      ],
      tableOp: { insideLocal:'10.0.0.10:8080', insideGlobal:'203.0.113.10:80', outsideLocal:'5.5.5.5:44000', outsideGlobal:'5.5.5.5:44000', proto:'TCP', port:'80→8080', type:'Port Fwd', status:'active' },
    },
    {
      step:4, title:'Step 4 — Web Server Responds, NAT Reverses',
      tag:'SRV REPLY', tagColor:'var(--green)', tagBg:'rgba(74,222,128,0.12)',
      desc:'Web server (10.0.0.10) responds. Reply goes to NAT router (default gateway). Router reverses: <strong>Src 10.0.0.10:8080 → 203.0.113.10:80</strong>. The Internet client receives a reply from the public address — exactly what it expects.',
      from:'pc1', to:'nat', via:['sw'], pktColor:'#4ade80', pktLabel:'SRV\nRESP',
      activeNodes:['pc1','sw','nat'],
      pktCard:['WEB SERVER RESPONDS','Src: 10.0.0.10:8080','NAT reverses:','→ 203.0.113.10:80','Client gets reply from public IP!'],
      fields:[
        { k:'Server reply',    v:'10.0.0.10:8080 → 5.5.5.5:44000' },
        { k:'NAT reverses',    v:'Src: 10.0.0.10:8080 → 203.0.113.10:80', c:'#4ade80' },
        { k:'Client gets',     v:'Reply from 203.0.113.10:80  ✓' },
        { k:'Transparent',     v:'Client unaware of 10.0.0.10' },
        { k:'Hairpin NAT',     v:'Inside host accessing own server via public IP' },
        { k:'Loopback NAT',    v:'Add: ip nat inside rule on inside int too' },
        { k:'Show',            v:'show ip nat translations' },
        { k:'Debug',           v:'debug ip nat  (careful on production!)' },
      ],
      tableOp: null,
    },
    {
      step:5, title:'Step 5 — Internet Client Receives Response ✓',
      tag:'COMPLETE ✓', tagColor:'var(--green)', tagBg:'rgba(74,222,128,0.12)',
      desc:'🎉 The Internet client receives the HTTP response from 203.0.113.10:80. The entire exchange was transparent — the client connected to a public IP:port and the private server behind NAT responded. Only port 80 was ever exposed. The server\'s real IP (10.0.0.10) was never revealed.',
      from:'nat', to:'server', via:['internet'], pktColor:'#4ade80', pktLabel:'HTTP\nRESP ✓',
      activeNodes:['nat','internet','server'],
      pktCard:['PORT FORWARDING: COMPLETE ✓','Client connected to public :80','Served by private 10.0.0.10:8080','Real IP never revealed','Only port 80 was exposed!'],
      fields:[
        { k:'Client sees',     v:'Response from 203.0.113.10:80 ✓',  c:'#4ade80' },
        { k:'Real server',     v:'10.0.0.10:8080  (hidden)',          c:'#a78bfa' },
        { k:'Exposed',         v:'Only port 80 — all others blocked' },
        { k:'Multiple rules',  v:'Port 80→8080  AND  443→8443  etc.' },
        { k:'UPnP',            v:'Home routers auto-forward for gaming' },
        { k:'PCP',             v:'Port Control Protocol  (RFC 6887)' },
        { k:'STUN/TURN',       v:'WebRTC NAT traversal techniques' },
        { k:'IPv6 equiv',      v:'Firewall rules — no NAT in IPv6!' },
      ],
      tableOp: null,
    },
  ],
};


// ─── Chain bar labels ───
const NAT_CHAINS = {
  static:  ['NAT Terms','IL→NAT','XLATE','Internet','Srv Reply','Reverse ✓'],
  dynamic: ['Pool Intro','PC-A Map','PC-B Map','Data Flows','Timeout'],
  pat:     ['PAT Concept','PC-A :54321','PC-B :54321','Internet','Reply Demux','Deliver ✓'],
  portfwd: ['Port Fwd','Inbound SYN','DNAT Rewrite','Srv Reply','Complete ✓'],
};

// ═══════════════════════════════════════════════════
// INIT & MODE SELECT
// ═══════════════════════════════════════════════════
function natInit() { natSetMode('static'); }

function natSetMode(mode) {
  natMode = mode;
  natReset();
  document.querySelectorAll('.nat-mode-tab').forEach(t => t.classList.remove('active'));
  const tab = document.getElementById('nat-tab-' + mode);
  if (tab) tab.classList.add('active');

  const descs = {
    static:  `<strong style="color:var(--blue)">Static NAT</strong> — Permanent 1:1 mapping. Learn the four NAT address types: Inside Local, Inside Global, Outside Local, Outside Global. One public IP consumed per inside host.`,
    dynamic: `<strong style="color:var(--purple)">Dynamic NAT</strong> — Pool of public IPs shared first-come-first-served. Mappings are temporary. Pool exhaustion means no Internet for additional hosts!`,
    pat:     `<strong style="color:var(--cyan)">PAT / NAT Overload</strong> — Thousands of inside hosts share <em>one</em> public IP. Source port numbers differentiate sessions. How every home router and enterprise edge NAT works.`,
    portfwd: `<strong style="color:var(--purple)">Port Forwarding (DNAT)</strong> — Allows outside Internet hosts to reach inside servers. Maps public IP:Port to private IP:Port. Only the configured port is exposed.`,
  };
  const descEl = document.getElementById('nat-mode-desc');
  if (descEl) descEl.innerHTML = descs[mode] || '';

  const totalEl = document.getElementById('nat-step-total');
  if (totalEl) totalEl.textContent = NAT_STEPS[mode].length;
}

function natUpdateChain(step) {
  const chainEl = document.getElementById('nat-chain-bar');
  if (!chainEl) return;
  const labels = NAT_CHAINS[natMode] || [];
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
function natDrawTopo(hasAnim, pktX, pktY, pktColor, pktLabel, pktCard) {
  const svg = document.getElementById('nat-svg');
  if (!svg) return;
  const N  = NAT_NODES;
  const aN = natActiveNodes;
  const showPC2 = ['static','dynamic','pat'].includes(natMode);

  let html = `<defs>
    <marker id="rtr-arrow" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
      <path d="M1 1L7 4L1 7" fill="none" stroke="currentColor" stroke-width="1.5"/>
    </marker>
  </defs>`;

  // Edges — inside LAN
  html += svgEdge(N.pc1.x, N.pc1.y, N.sw.x, N.sw.y, aN.includes('pc1')||aN.includes('sw'), '#5b9cf6');
  if (showPC2) html += svgEdge(N.pc2.x, N.pc2.y, N.sw.x, N.sw.y, aN.includes('pc2')||aN.includes('sw'), '#5b9cf6');
  html += svgEdge(N.sw.x, N.sw.y, N.nat.x, N.nat.y, aN.includes('sw')||aN.includes('nat'), '#5b9cf6');

  // NAT boundary
  html += `<line x1="${N.nat.x}" y1="28" x2="${N.nat.x}" y2="365" stroke="rgba(251,191,36,0.3)" stroke-width="1.5" stroke-dasharray="8,4"/>`;
  html += `<text x="${N.nat.x}" y="24" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="rgba(251,191,36,0.55)">NAT BOUNDARY</text>`;
  html += `<text x="${N.nat.x-55}" y="378" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="rgba(91,156,246,0.5)">INSIDE  (Private)</text>`;
  html += `<text x="${N.nat.x+65}" y="378" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="rgba(251,191,36,0.5)">OUTSIDE  (Public)</text>`;

  // Edges — outside
  html += svgEdge(N.nat.x, N.nat.y, N.internet.x, N.internet.y, aN.includes('nat')||aN.includes('internet'), '#fbbf24');
  html += svgEdge(N.internet.x, N.internet.y, N.server.x, N.server.y, aN.includes('internet')||aN.includes('server'), '#fbbf24');

  // Interface labels
  html += `<text x="${N.nat.x-32}" y="${N.nat.y+52}" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#3a4070">Gi0/0 inside</text>`;
  html += `<text x="${N.nat.x+32}" y="${N.nat.y+52}" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#6a5a20">Gi0/1 outside</text>`;

  // Subnet label
  html += `<rect x="40" y="312" width="165" height="18" rx="4" fill="rgba(91,156,246,0.06)" stroke="rgba(91,156,246,0.15)" stroke-width="0.8"/>`;
  html += `<text x="123" y="324" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#5a6080">10.0.0.0/24  (RFC 1918)</text>`;

  // Nodes
  const pc1Label = natMode === 'portfwd' ? 'Web Server\n10.0.0.10' : 'PC-A\n10.0.0.10';
  html += svgPC(N.pc1.x, N.pc1.y, 'pc1', pc1Label, aN.includes('pc1'));
  if (showPC2) html += svgPC(N.pc2.x, N.pc2.y, 'pc2', 'PC-B\n10.0.0.20', aN.includes('pc2'));
  html += svgSwitch(N.sw.x, N.sw.y, 'sw', 'Switch', aN.includes('sw'));

  const pubLabel = natMode === 'dynamic' ? 'NAT Router\n.10–.13 pool' : 'NAT Router\n203.0.113.10';
  html += svgRouter(N.nat.x, N.nat.y, 'nat', pubLabel, aN.includes('nat'));
  html += svgCloud(N.internet.x, N.internet.y, 'inet', 'Internet', aN.includes('internet'));

  const svrLabel = natMode === 'portfwd' ? 'Internet\nClient 5.5.5.5' : 'Server\n8.8.8.8';
  html += svgServer(N.server.x, N.server.y, 'server', svrLabel, aN.includes('server'), '#fbbf24');

  // Packet
  if (pktX !== undefined) {
    const lines = (pktLabel || '').split('\n');
    html += `<circle cx="${pktX}" cy="${pktY}" r="18" fill="${pktColor}18" stroke="${pktColor}" stroke-width="2.5"/>`;
    html += `<circle cx="${pktX}" cy="${pktY}" r="9"  fill="${pktColor}99"/>`;
    lines.forEach((l, i) => {
      html += `<text x="${pktX}" y="${pktY - 4 + i*10}" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" font-weight="700" fill="#fff">${l}</text>`;
    });
    if (pktCard && pktCard.length) {
      const cx = Math.max(115, Math.min(pktX, 650));
      const cy = pktY - 96;
      const cw = 222, ch = 14 + pktCard.length * 14;
      html += `<rect x="${cx-cw/2}" y="${cy}" width="${cw}" height="${ch}" rx="5" fill="rgba(7,9,15,0.95)" stroke="${pktColor}" stroke-width="1.2"/>`;
      html += `<line x1="${pktX}" y1="${pktY-18}" x2="${cx}" y2="${cy+ch}" stroke="${pktColor}" stroke-width="0.8" stroke-dasharray="3,2" opacity="0.6"/>`;
      pktCard.forEach((line, i) => {
        const fc = i===0 ? pktColor : (i===1 ? '#c8d0e0' : '#8892b0');
        const fw = i===0 ? '700' : '400';
        html += `<text x="${cx}" y="${cy+12+i*14}" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="${i===0?9.5:8.5}" font-weight="${fw}" fill="${fc}">${line}</text>`;
      });
    }
  }
  svg.innerHTML = html;
}

// ═══════════════════════════════════════════════════
// NAT TABLE
// ═══════════════════════════════════════════════════
function natRenderTable() {
  const tbody = document.getElementById('nat-table-body');
  if (!tbody) return;
  if (!natTable.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="color:var(--muted);font-size:10px;padding:8px 10px;font-family:var(--mono);text-align:center;">Translation table empty — start simulation</td></tr>`;
    return;
  }
  tbody.innerHTML = natTable.map(e => {
    const isExp  = e.status === 'expired';
    const tcolor = e.type==='PAT' ? '#38d9c0' : e.type==='Port Fwd' ? '#a78bfa' : e.type==='Static' ? '#5b9cf6' : '#fbbf24';
    const scolor = isExp ? '#f87171' : '#4ade80';
    return `<tr style="opacity:${isExp?0.45:1}">
      <td style="font-family:var(--mono);font-size:10px;padding:5px 8px;color:#5b9cf6;">${e.insideLocal}</td>
      <td style="font-family:var(--mono);font-size:10px;padding:5px 8px;color:#38d9c0;">${e.insideGlobal}</td>
      <td style="font-family:var(--mono);font-size:10px;padding:5px 8px;color:var(--muted2);">${e.outsideLocal}</td>
      <td style="font-family:var(--mono);font-size:10px;padding:5px 8px;color:var(--muted2);">${e.outsideGlobal}</td>
      <td style="font-family:var(--mono);font-size:10px;padding:5px 8px;color:${tcolor};font-weight:700;">${e.type}</td>
      <td style="font-family:var(--mono);font-size:10px;padding:5px 8px;color:${scolor};">${isExp?'⏱ expired':'✓ '+e.status}</td>
    </tr>`;
  }).join('');
}

// ═══════════════════════════════════════════════════
// ANIMATION ENGINE
// ═══════════════════════════════════════════════════
function natAnimateStep(step) {
  const steps = NAT_STEPS[natMode];
  const s = steps[step - 1];
  if (!s) return;
  const N = NAT_NODES;
  const path = [s.from, ...s.via, s.to];
  const uniq = path.filter((n,i) => i===0 || n!==path[i-1]);
  natActiveNodes = s.activeNodes || uniq;

  if (s.from === s.to) {
    const node = N[s.from];
    if (!node) { natFinalizeStep(s); return; }
    natDrawTopo(true, node.x, node.y - 18, s.pktColor, s.pktLabel, s.pktCard);
    natAnimId = setTimeout(() => { natFinalizeStep(s); }, natGetSegDur() * 1.2);
    return;
  }

  const segs = [];
  for (let i = 0; i < uniq.length - 1; i++) {
    const fn = N[uniq[i]], tn = N[uniq[i+1]];
    if (fn && tn) segs.push({ from:fn, to:tn });
  }
  if (!segs.length) { natFinalizeStep(s); return; }

  let segIdx = 0, startTime = null;
  const segDur = natGetSegDur();

  function anim(ts) {
    if (!startTime) startTime = ts;
    const t = Math.min((ts - startTime) / segDur, 1);
    const e = easeInOut(t);
    const seg = segs[segIdx];
    const px = seg.from.x + (seg.to.x - seg.from.x) * e;
    const py = seg.from.y + (seg.to.y - seg.from.y) * e;
    natDrawTopo(true, px, py, s.pktColor, s.pktLabel, s.pktCard);
    if (t >= 1) {
      if (segIdx < segs.length - 1) {
        segIdx++; startTime = ts; natAnimId = requestAnimationFrame(anim);
      } else {
        natDrawTopo(true, seg.to.x, seg.to.y, s.pktColor, s.pktLabel, s.pktCard);
        setTimeout(() => { natDrawTopo(false); natFinalizeStep(s); }, 420);
      }
    } else {
      natAnimId = requestAnimationFrame(anim);
    }
  }
  natAnimId = requestAnimationFrame(anim);
}

function natFinalizeStep(s) {
  if (s.tableOp) {
    natTable = natTable.filter(e => !(e.insideLocal === s.tableOp.insideLocal && e.type === s.tableOp.type));
    natTable.push(s.tableOp);
  }
  natRenderTable();
  natUpdateUI();
}

// ═══════════════════════════════════════════════════
// UI UPDATE
// ═══════════════════════════════════════════════════
function natUpdateUI() {
  const steps = NAT_STEPS[natMode];
  const step  = natCurrentStep;
  const numEl = document.getElementById('nat-step-num');
  const prog  = document.getElementById('nat-progress');
  const info  = document.getElementById('nat-step-info');
  if (numEl) numEl.textContent = step;
  if (prog)  prog.style.width = (step / steps.length * 100) + '%';
  natUpdateChain(step);

  if (step === 0) {
    if (info) info.innerHTML = `<div class="step-tag" style="background:rgba(91,156,246,0.12);color:var(--blue)">READY</div>
      <div class="step-title">Select a scenario and press ▶ Play to begin</div>
      <div class="step-desc">Watch packets transform at the NAT boundary. The live translation table updates in real time — exactly like Cisco's <code>show ip nat translations</code>.</div>`;
    const f = document.getElementById('nat-pkt-fields');
    if (f) f.innerHTML = '<div style="color:var(--muted);font-family:var(--mono);font-size:11px;">Start the animation to see how NAT rewrites packet fields…</div>';
    return;
  }

  const s = steps[step - 1];
  if (info) info.innerHTML = `<div class="step-tag" style="background:${s.tagBg};color:${s.tagColor}">${s.tag}</div>
    <div class="step-title">${s.title}</div>
    <div class="step-desc">${s.desc}</div>`;

  const fieldsEl = document.getElementById('nat-pkt-fields');
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
function natStep(dir) {
  if (natAnimId) { cancelAnimationFrame(natAnimId); clearTimeout(natAnimId); natAnimId = null; }
  const steps = NAT_STEPS[natMode];
  const newStep = natCurrentStep + dir;
  if (newStep < 0 || newStep > steps.length) return;
  natCurrentStep = newStep;
  natActiveNodes = [];
  natDrawTopo(false);
  natUpdateUI();
  if (newStep > 0) natAnimateStep(newStep);
}

function natTogglePlay() {
  if (natSpeedMode === 'manual') { natStep(1); return; }
  natPlaying = !natPlaying;
  const btn = document.getElementById('nat-play-btn');
  if (btn) btn.textContent = natPlaying ? '⏸ Pause' : '▶ Play';
  if (natPlaying) natAutoPlay();
  else clearTimeout(natPlayTimer);
}

function natAutoPlay() {
  if (!natPlaying) return;
  const steps = NAT_STEPS[natMode];
  if (natCurrentStep >= steps.length) {
    natPlaying = false;
    const btn = document.getElementById('nat-play-btn');
    if (btn) btn.textContent = '▶ Play';
    return;
  }
  natStep(1);
  natPlayTimer = setTimeout(natAutoPlay, natGetAutoDelay());
}

function natReset() {
  natPlaying = false;
  clearTimeout(natPlayTimer);
  if (natAnimId) { cancelAnimationFrame(natAnimId); clearTimeout(natAnimId); natAnimId = null; }
  const btn = document.getElementById('nat-play-btn');
  if (btn) btn.textContent = '▶ Play';
  natCurrentStep = 0;
  natActiveNodes = [];
  natTable = [];
  natDrawTopo(false);
  natUpdateUI();
  natRenderTable();
  natUpdateChain(0);
}

document.addEventListener('DOMContentLoaded', function () {
  natSetMode('static');
});