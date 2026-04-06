// ═══════════════════════════════════════════════════════════════════════════
// MTU / FRAGMENTATION DEEP DIVE — mtu.js
// CCIE / TAC-Level Coverage:
//   Scenarios: IP Fragmentation, Path MTU Discovery (PMTUD),
//              PMTUD Black Hole, GRE/Tunnel MTU Overhead
// Visual: Live topology SVG, Wireshark-style packet anatomy,
//         MTU Calculator, Cisco/Linux CLI reference
// Author: SubnetLab Pro — CCIE/TAC Engineering Reference
// ═══════════════════════════════════════════════════════════════════════════

let mtuMode         = 'frag';
let mtuCurrentStep  = 0;
let mtuPlaying      = false;
let mtuPlayTimer    = null;
let mtuAnimId       = null;
let mtuSpeedMode    = 'normal';
let mtuActiveNodes  = [];

// ─── Layout constants ───────────────────────────────────────────────────────
const MTU_SVG_W = 760;
const MTU_SVG_H = 290;

// ─── Speed control ───────────────────────────────────────────────────────────
function mtuSetSpeed(s) {
  mtuSpeedMode = s;
  ['slow','normal','fast','manual'].forEach(x => {
    const el = document.getElementById('mtu-speed-' + x);
    if (el) el.classList.toggle('active', x === s);
  });
}
function mtuGetSegDur()    { return {slow:2000, normal:1000, fast:440, manual:800}[mtuSpeedMode]; }
function mtuGetAutoDelay() { return {slow:5000, normal:2500, fast:1100, manual:999999}[mtuSpeedMode]; }

// ═══════════════════════════════════════════════════════════════════════════
// NODE POSITIONS  (per scenario)
// ═══════════════════════════════════════════════════════════════════════════
const MTU_NODES = {
  frag:      { pca:{x:80,  y:145}, rtr:{x:310, y:145}, pcb:{x:560, y:145} },
  pmtud:     { pca:{x:70,  y:145}, rtr1:{x:260, y:145}, rtr2:{x:490, y:145}, srv:{x:680, y:145} },
  blackhole: { pca:{x:70,  y:145}, fw:{x:270, y:145}, rtr:{x:490, y:145}, srv:{x:680, y:145} },
  tunnel:    { pca:{x:65,  y:145}, tin:{x:240, y:145}, tout:{x:510, y:145}, srv:{x:680, y:145} },
  mtuvsmss:  { pca:{x:80,  y:145}, rtr:{x:330, y:145}, srv:{x:580, y:145} },
};

// ═══════════════════════════════════════════════════════════════════════════
// ─── STEP DATA ───────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════════════

const MTU_STEPS = {

  // ──────────────────────────────────────────────────────────────────────
  // SCENARIO 1 — IP FRAGMENTATION (DF=0 path)
  // Topology: PC-A (10.0.0.1) → Router (MTU 1000 on egress) → PC-B
  // ──────────────────────────────────────────────────────────────────────
  frag: [
    {
      step:1, title:'Step 1 — Host Builds 2000-Byte IP Datagram',
      tag:'TX', tagColor:'var(--blue)', tagBg:'rgba(91,156,246,0.12)',
      desc:'PC-A (10.0.0.1) hands a 2000-byte application payload to the IP layer. The IP layer prepends a <strong>20-byte header</strong>, producing a 2020-byte datagram. <strong>DF bit = 0</strong> (fragmentation allowed). Identification = 0x1A2B (unique per datagram). This will need to cross a 1000-byte MTU link.',
      from:'pca', to:'rtr', via:[], pktColor:'#5b9cf6', pktLabel:'2020B\nIP PKT',
      activeNodes:['pca'],
      fragBar:{ total:2020, frags:[] },
      fields:[
        {k:'Version / IHL',    v:'4 / 5  (IPv4, no options)',           c:'#5b9cf6'},
        {k:'DSCP / ECN',       v:'0x00 / 0 (best-effort, no ECN)'},
        {k:'Total Length',     v:'2020 bytes  (20 hdr + 2000 data)',    c:'#fbbf24'},
        {k:'Identification',   v:'0x1A2B  (unique per datagram)',       c:'#a78bfa'},
        {k:'Flags (3 bits)',   v:'DF=0  MF=0  (frag allowed!)',         c:'#4ade80'},
        {k:'Fragment Offset',  v:'0  (this is the first/only fragment)'},
        {k:'TTL',              v:'64  (Linux default)'},
        {k:'Protocol',         v:'0x06 TCP  (or 0x11 UDP, 0x01 ICMP)'},
        {k:'Header Checksum',  v:'Recalculated at EACH router hop'},
        {k:'Src IP',           v:'10.0.0.1  (PC-A)'},
        {k:'Dst IP',           v:'10.0.1.1  (PC-B)'},
        {k:'Why Fragment?',    v:'Egress link MTU is only 1000 bytes',  c:'#f87171'},
      ],
    },
    {
      step:2, title:'Step 2 — Router Checks Egress MTU — Fragmentation Required',
      tag:'MTU CHECK', tagColor:'var(--amber)', tagBg:'rgba(251,191,36,0.12)',
      desc:'The router receives the 2020-byte datagram. It checks the <strong>egress interface MTU = 1000 bytes</strong>. Packet size (2020) > MTU (1000). The router checks the DF bit: <strong>DF=0 → fragmentation is allowed</strong>. If DF=1, the router would DROP the packet and send ICMP Type 3 Code 4 instead.',
      from:'pca', to:'rtr', via:[], pktColor:'#fbbf24', pktLabel:'❓\n2020B',
      activeNodes:['pca','rtr'],
      fragBar:{ total:2020, frags:[] },
      fields:[
        {k:'Received Packet',  v:'2020 bytes',                          c:'#fbbf24'},
        {k:'Egress MTU',       v:'1000 bytes  ← constraint',           c:'#f87171'},
        {k:'Packet > MTU?',    v:'YES: 2020 > 1000  → must fragment',  c:'#f87171'},
        {k:'DF bit',           v:'0  → fragmentation ALLOWED ✓',       c:'#4ade80'},
        {k:'If DF=1',          v:'DROP + ICMP Type 3 Code 4 (PMTUD)',  c:'#f87171'},
        {k:'Max Data/Frag',    v:'1000 - 20 = 980 bytes (mult of 8)',  c:'#38d9c0'},
        {k:'Frags Needed',     v:'ceil(2000 / 980) = 3 fragments',     c:'#a78bfa'},
        {k:'Cisco verify',     v:'show interfaces Gi0/0 | incl MTU'},
      ],
    },
    {
      step:3, title:'Step 3 — Fragment 1 Sent  (offset=0, MF=1)',
      tag:'FRAG 1/3', tagColor:'#38d9c0', tagBg:'rgba(56,217,192,0.12)',
      desc:'<strong>Fragment 1:</strong> Router copies the original IP header, sets <strong>Fragment Offset = 0</strong>, sets <strong>MF (More Fragments) = 1</strong>, adjusts Total Length to 1000, and recalculates the header checksum. Carries the <strong>first 980 bytes</strong> of the original payload. All fragments share the same Identification field (0x1A2B).',
      from:'rtr', to:'pcb', via:[], pktColor:'#38d9c0', pktLabel:'FRAG1\n1000B',
      activeNodes:['rtr','pcb'],
      fragBar:{ total:2020, frags:[{bytes:980, pct:48.5, color:'#38d9c0', label:'F1: bytes 0–979'}] },
      fields:[
        {k:'IP Total Length',  v:'1000 bytes  (20 hdr + 980 payload)', c:'#38d9c0'},
        {k:'Identification',   v:'0x1A2B  (same as original!)',        c:'#a78bfa'},
        {k:'DF bit',           v:'0  (copied from original)',          },
        {k:'MF bit',           v:'1  (More Fragments coming!)',        c:'#fbbf24'},
        {k:'Frag Offset',      v:'0  (byte 0 of original payload)',   c:'#38d9c0'},
        {k:'Payload',          v:'bytes 0–979 of original data'},
        {k:'TTL',              v:'63  (decremented by router)',        },
        {k:'Header Checksum',  v:'Recalculated  (length changed!)',   c:'#fbbf24'},
        {k:'CRITICAL',         v:'Dst IP unchanged — same destination',c:'#4ade80'},
      ],
    },
    {
      step:4, title:'Step 4 — Fragment 2 Sent  (offset=980, MF=1)',
      tag:'FRAG 2/3', tagColor:'#a78bfa', tagBg:'rgba(167,139,250,0.12)',
      desc:'<strong>Fragment 2:</strong> Offset field = <strong>980 / 8 = 122</strong> (offsets are in 8-byte units!). This is a crucial fact: the Fragment Offset field is <em>13 bits wide</em> and measured in 8-byte blocks. MF is still 1 (more coming). Payload is bytes 980–1959 of original data.',
      from:'rtr', to:'pcb', via:[], pktColor:'#a78bfa', pktLabel:'FRAG2\n1000B',
      activeNodes:['rtr','pcb'],
      fragBar:{ total:2020, frags:[{bytes:980, pct:48.5, color:'#38d9c0', label:'F1'},{bytes:980, pct:48.5, color:'#a78bfa', label:'F2: bytes 980–1959'}] },
      fields:[
        {k:'IP Total Length',  v:'1000 bytes  (20 hdr + 980 payload)', c:'#a78bfa'},
        {k:'Identification',   v:'0x1A2B  (same Identification!)',      c:'#a78bfa'},
        {k:'MF bit',           v:'1  (More Fragments still!)',          c:'#fbbf24'},
        {k:'Frag Offset',      v:'122  (= 980 ÷ 8, in 8-byte units)', c:'#a78bfa'},
        {k:'Why ÷8?',          v:'Offset field is 13 bits → 8B aligned',c:'#f87171'},
        {k:'Frag Offset bits', v:'13 bits in IPv4 header (RFC 791)'},
        {k:'Max offset value', v:'8191 × 8 = 65528 bytes addressable'},
        {k:'Payload',          v:'bytes 980–1959 of original data'},
      ],
    },
    {
      step:5, title:'Step 5 — Fragment 3 (Last)  (offset=1960, MF=0)',
      tag:'FRAG 3/3', tagColor:'#4ade80', tagBg:'rgba(74,222,128,0.12)',
      desc:'<strong>Fragment 3 (Last):</strong> Offset = 1960/8 = 245. <strong>MF = 0</strong> — this signals "I am the last fragment." Total Length = 60 bytes (20 hdr + 40 remaining data). The destination knows to stop waiting for more fragments when it receives MF=0.',
      from:'rtr', to:'pcb', via:[], pktColor:'#4ade80', pktLabel:'FRAG3\n60B',
      activeNodes:['rtr','pcb'],
      fragBar:{ total:2020, frags:[{bytes:980, pct:48.5, color:'#38d9c0', label:'F1'},{bytes:980, pct:48.5, color:'#a78bfa', label:'F2'},{bytes:40, pct:2, color:'#4ade80', label:'F3: bytes 1960–1999 (MF=0)'}] },
      fields:[
        {k:'IP Total Length',  v:'60 bytes  (20 hdr + 40 remaining)',  c:'#4ade80'},
        {k:'Identification',   v:'0x1A2B  (matches all fragments!)',   c:'#a78bfa'},
        {k:'MF bit',           v:'0  ← LAST FRAGMENT signal',         c:'#4ade80'},
        {k:'Frag Offset',      v:'245  (= 1960 ÷ 8)',                 c:'#4ade80'},
        {k:'Payload',          v:'bytes 1960–1999 (last 40 bytes)'},
        {k:'Total sent',       v:'3 × 20B headers + 2000B data = overhead',c:'#f87171'},
        {k:'Frag overhead',    v:'+40 bytes (extra IP headers!)'},
      ],
    },
    {
      step:6, title:'Step 6 — Destination Reassembles  (ONLY here, NEVER at intermediate routers!)',
      tag:'REASSEMBLY', tagColor:'#4ade80', tagBg:'rgba(74,222,128,0.12)',
      desc:'<strong>🔑 Critical Rule:</strong> IPv4 reassembly ONLY happens at the <em>final destination</em>, NEVER at intermediate routers. PC-B uses <strong>Identification + Src IP</strong> to group fragments, sorts by Fragment Offset, and waits for MF=0. Reassembly Timer: 30–120 seconds. If a fragment is lost → ENTIRE datagram discarded (no partial delivery). TCP will then retransmit.',
      from:'pcb', to:'pcb', via:[], pktColor:'#4ade80', pktLabel:'✓ 2000B\nREASSEM',
      activeNodes:['pcb'],
      fragBar:{ total:2020, frags:[{bytes:980, pct:48.5, color:'#38d9c0', label:'F1'},{bytes:980, pct:48.5, color:'#a78bfa', label:'F2'},{bytes:40, pct:2, color:'#4ade80', label:'F3'}], complete:true },
      fields:[
        {k:'Reassembly key',   v:'Identification + Src IP + Protocol', c:'#4ade80'},
        {k:'Sort by',          v:'Fragment Offset (ascending)'},
        {k:'Complete when',    v:'MF=0 fragment received + no gaps',   c:'#4ade80'},
        {k:'Timer (RFC 791)',  v:'≥60 seconds (Linux: 30s, Windows: 120s)',c:'#fbbf24'},
        {k:'Fragment lost?',   v:'Whole datagram DISCARDED (no partial)',c:'#f87171'},
        {k:'TCP response',     v:'Sender detects loss → retransmit',   c:'#5b9cf6'},
        {k:'IPv6 difference',  v:'Routers NEVER fragment — src only',  c:'#a78bfa'},
        {k:'TAC tip',          v:'High frag rate = MTU/MSS misconfigured!',c:'#f87171'},
        {k:'Wireshark filter', v:'ip.flags.mf == 1 || ip.frag_offset > 0'},
      ],
    },
  ],

  // ──────────────────────────────────────────────────────────────────────
  // SCENARIO 2 — PATH MTU DISCOVERY  (RFC 1191 / RFC 8899)
  // Topology: PC-A → RTR-1 (MTU 1500) → RTR-2 (MTU 1400) → Server
  // ──────────────────────────────────────────────────────────────────────
  pmtud: [
    {
      step:1, title:'Step 1 — Host Sends 1500-Byte Packet with DF=1',
      tag:'DF=1', tagColor:'var(--blue)', tagBg:'rgba(91,156,246,0.12)',
      desc:'PC-A sends a 1500-byte IP datagram with <strong>DF (Don\'t Fragment) = 1</strong>. TCP sets DF=1 by default to enable PMTUD. The path has an MTU bottleneck: the link between RTR-1 and RTR-2 is only <strong>1400 bytes</strong>. This will trigger the PMTUD process. The initial MSS was 1460, TCP segment + headers = 1500.',
      from:'pca', to:'rtr1', via:[], pktColor:'#5b9cf6', pktLabel:'1500B\nDF=1',
      activeNodes:['pca','rtr1'],
      fragBar:null,
      fields:[
        {k:'Total Length',     v:'1500 bytes (MSS 1460 + 40B headers)', c:'#5b9cf6'},
        {k:'DF bit',           v:'1  (Don\'t Fragment — PMTUD)',        c:'#fbbf24'},
        {k:'Path MTU',         v:'PC→RTR1: 1500  RTR1→RTR2: 1400 ←!', c:'#f87171'},
        {k:'TCP MSS agreed',   v:'1460 bytes (SYN option negotiation)'},
        {k:'IP + TCP headers', v:'20 + 20 = 40 bytes overhead'},
        {k:'Linux TCP',        v:'Always sets DF=1 for PMTUD (RFC 4821)'},
        {k:'RFC 1191',         v:'IPv4 PMTUD (uses ICMP Type 3 Code 4)'},
        {k:'RFC 8899',         v:'Packetization Layer Path MTU Discovery'},
      ],
    },
    {
      step:2, title:'Step 2 — RTR-1 Cannot Forward — Packet Too Big!',
      tag:'TOO BIG', tagColor:'var(--red)', tagBg:'rgba(248,113,113,0.12)',
      desc:'RTR-1 receives the 1500-byte datagram and checks the egress interface toward RTR-2: <strong>MTU = 1400 bytes</strong>. Packet (1500) > MTU (1400) and <strong>DF=1</strong>. RTR-1 <em>CANNOT</em> fragment the packet. It must DROP the packet and notify the sender. It generates an <strong>ICMP Type 3 Code 4</strong> message — the engine of PMTUD.',
      from:'rtr1', to:'pca', via:[], pktColor:'#f87171', pktLabel:'ICMP\n3/4',
      activeNodes:['rtr1'],
      fragBar:null,
      fields:[
        {k:'RTR-1 action',     v:'DROP the 1500B datagram',            c:'#f87171'},
        {k:'Why?',             v:'DF=1 AND packet > egress MTU',       c:'#f87171'},
        {k:'ICMP Type',        v:'3  (Destination Unreachable)',       c:'#fbbf24'},
        {k:'ICMP Code',        v:'4  (Fragmentation Needed, DF Set)',  c:'#fbbf24'},
        {k:'ICMP payload',     v:'Original IP header + first 8 data bytes'},
        {k:'Next-Hop MTU',     v:'1400  (in ICMP Type 3 Code 4 field!)',c:'#38d9c0'},
        {k:'RFC 1191',         v:'Next-Hop MTU field added in 1990'},
        {k:'Cisco verify',     v:'debug ip icmp | debug ip packet detail'},
      ],
    },
    {
      step:3, title:'Step 3 — ICMP "Frag Needed" Travels Back to PC-A',
      tag:'ICMP 3/4', tagColor:'var(--amber)', tagBg:'rgba(251,191,36,0.12)',
      desc:'RTR-1 sends an <strong>ICMP Type 3 Code 4</strong> (Fragmentation Needed and Don\'t Fragment was Set) back to PC-A. The ICMP message includes: the Next-Hop MTU (1400) in the unused field (RFC 1191 update). PC-A\'s TCP/IP stack will receive this and update its PMTU cache for this destination.',
      from:'rtr1', to:'pca', via:[], pktColor:'#fbbf24', pktLabel:'ICMP\n←3/4',
      activeNodes:['rtr1','pca'],
      fragBar:null,
      fields:[
        {k:'ICMP Type 3',      v:'Destination Unreachable',           c:'#fbbf24'},
        {k:'ICMP Code 4',      v:'Fragmentation Needed, DF Set',      c:'#fbbf24'},
        {k:'Next-Hop MTU',     v:'1400 bytes  (key field — RFC 1191)', c:'#38d9c0'},
        {k:'ICMP payload',     v:'Bytes 0–27 of dropped packet header'},
        {k:'Src of ICMP',      v:'RTR-1\'s ingress IP address'},
        {k:'Dst of ICMP',      v:'PC-A (original packet source)'},
        {k:'Wireshark filter', v:'icmp.type==3 && icmp.code==4'},
        {k:'IPv6 equivalent',  v:'ICMPv6 Type 2 (Packet Too Big)',    c:'#a78bfa'},
      ],
    },
    {
      step:4, title:'Step 4 — PC-A Updates PMTU Cache → New MSS',
      tag:'PMTU CACHE', tagColor:'var(--cyan)', tagBg:'rgba(56,217,192,0.12)',
      desc:'PC-A\'s kernel receives the ICMP message. It updates its <strong>PMTU cache</strong> (per-destination, kernel routing table). New path MTU = <strong>1400 bytes</strong>. New effective MSS = 1400 - 40 = <strong>1360 bytes</strong>. The PMTU cache entry has a TTL — Linux defaults to <strong>10 minutes</strong>. After expiry, the host probes again.',
      from:'pca', to:'pca', via:[], pktColor:'#38d9c0', pktLabel:'CACHE\nUPD',
      activeNodes:['pca'],
      fragBar:null,
      fields:[
        {k:'PMTU Cache entry', v:'10.0.2.1 → PMTU=1400',             c:'#38d9c0'},
        {k:'New MSS',          v:'1400 - 20(IP) - 20(TCP) = 1360B',  c:'#38d9c0'},
        {k:'Cache TTL (Linux)',v:'600 seconds (10 minutes, RFC 1981)'},
        {k:'After TTL',        v:'Host probes again with larger packet',c:'#fbbf24'},
        {k:'Linux check',      v:'ip route get 10.0.2.1 | grep mtu'},
        {k:'Linux check 2',    v:'ss -tin dst 10.0.2.1 | grep pmtu'},
        {k:'Windows check',    v:'netsh interface ipv4 show destinationcache'},
        {k:'TCP adjusts',      v:'cwnd maintained, only segment size changes'},
      ],
    },
    {
      step:5, title:'Step 5 — PC-A Retransmits with 1360-Byte MSS Segments',
      tag:'RETRY', tagColor:'var(--green)', tagBg:'rgba(74,222,128,0.12)',
      desc:'PC-A retransmits using the new PMTU of 1400. TCP segments are now 1360 bytes of data (MSS=1360), and with headers = 1400 byte IP packet — exactly matching the bottleneck MTU. The packet now passes RTR-1\'s egress check and continues toward RTR-2.',
      from:'pca', to:'rtr2', via:['rtr1'], pktColor:'#4ade80', pktLabel:'1400B\nDF=1✓',
      activeNodes:['pca','rtr1','rtr2'],
      fragBar:null,
      fields:[
        {k:'New packet size',  v:'1400 bytes  (MSS 1360 + 40B hdrs)', c:'#4ade80'},
        {k:'DF bit',           v:'1  (still set — PMTUD ongoing)',     c:'#fbbf24'},
        {k:'RTR-1 check',      v:'1400 ≤ 1400 MTU ✓ — forward!',     c:'#4ade80'},
        {k:'Path clear?',      v:'RTR-2→Server link must be ≥1400',   c:'#fbbf24'},
        {k:'TCP SACK',         v:'Lost segment ack\'d, retransmit precise',c:'#5b9cf6'},
        {k:'TCP throughput',   v:'May briefly drop, then recovers'},
        {k:'Packetization',    v:'PMTUD adjusts at TCP layer — seamless'},
        {k:'UDP / QUIC',       v:'Must implement own PMTUD (RFC 8899)',c:'#a78bfa'},
      ],
    },
    {
      step:6, title:'Step 6 — PMTUD Complete ✓  Path MTU = 1400 Bytes',
      tag:'COMPLETE', tagColor:'var(--green)', tagBg:'rgba(74,222,128,0.12)',
      desc:'🎉 PMTUD succeeds. Packets traverse the full path. PMTU cache persists for 10 minutes. <strong>Key TAC insight:</strong> PMTUD is critically dependent on ICMP Type 3 Code 4 messages being <em>unrestricted</em> through the network. If a firewall blocks them — PMTUD Black Hole occurs (next scenario). Always allow ICMP Type 3 (Unreachable) and Type 11 (TTL Exceeded).',
      from:'rtr2', to:'srv', via:[], pktColor:'#4ade80', pktLabel:'1400B\n✓ OK',
      activeNodes:['rtr2','srv'],
      fragBar:null,
      fields:[
        {k:'Final path MTU',   v:'1400 bytes  (bottleneck = RTR1→RTR2)',c:'#4ade80'},
        {k:'TCP MSS in use',   v:'1360 bytes  (1400 - 40B headers)',    c:'#4ade80'},
        {k:'PMTU probe TTL',   v:'10 min → host re-probes with larger', c:'#fbbf24'},
        {k:'Firewall rule',    v:'MUST permit ICMP type 3 code 4',      c:'#f87171'},
        {k:'Cisco ACL',        v:'permit icmp any any unreachable',     c:'#38d9c0'},
        {k:'IPv6 PMTUD',       v:'RFC 1981 — ICMPv6 Type 2 mandatory', c:'#a78bfa'},
        {k:'tracepath',        v:'tracepath 8.8.8.8  (Linux PMTU probe)'},
        {k:'TAC golden rule',  v:'Never block ICMP unreachable/too-big',c:'#f87171'},
      ],
    },
  ],

  // ──────────────────────────────────────────────────────────────────────
  // SCENARIO 3 — PMTUD BLACK HOLE  (Firewall blocks ICMP Type 3 Code 4)
  // Topology: PC-A → Firewall → Router (MTU 1400 egress) → Server
  // ──────────────────────────────────────────────────────────────────────
  blackhole: [
    {
      step:1, title:'Step 1 — TCP Handshake Succeeds  (Small Packets — No Issue)',
      tag:'TCP SYN', tagColor:'var(--blue)', tagBg:'rgba(91,156,246,0.12)',
      desc:'TCP 3-way handshake packets (SYN, SYN-ACK, ACK) are small — typically 60–100 bytes. They easily pass through the MTU bottleneck. <strong>MSS is negotiated</strong> in the SYN as 1460 (default for 1500 MTU path). The handshake completes successfully — this is why Black Holes are so deceptive. Initial connectivity appears fine!',
      from:'pca', to:'srv', via:['fw','rtr'], pktColor:'#5b9cf6', pktLabel:'SYN\n60B OK',
      activeNodes:['pca','fw','rtr','srv'],
      fragBar:null,
      fields:[
        {k:'SYN size',         v:'~60 bytes  (easily clears any MTU)',  c:'#5b9cf6'},
        {k:'TCP SYN-ACK MSS',  v:'Server offers MSS=1460 (1500 path)', c:'#fbbf24'},
        {k:'MSS negotiated',   v:'MIN(1460, 1460) = 1460 bytes',       c:'#fbbf24'},
        {k:'Handshake cost',   v:'1.5 RTT (SYN + SYN-ACK + ACK)'},
        {k:'Problem',          v:'MSS doesn\'t account for path MTU!',  c:'#f87171'},
        {k:'Bottleneck MTU',   v:'RTR→Server link = 1400 bytes',       c:'#f87171'},
        {k:'DF=1',             v:'TCP always sets DF=1 for PMTUD',     c:'#fbbf24'},
        {k:'Deceptive',        v:'Ping works, SSH/HTTPS hangs → classic Black Hole!',c:'#f87171'},
      ],
    },
    {
      step:2, title:'Step 2 — Large TCP Data Segment Sent  (Hits MTU Bottleneck)',
      tag:'DATA TX', tagColor:'var(--amber)', tagBg:'rgba(251,191,36,0.12)',
      desc:'The TCP connection begins data transfer. PC-A sends a 1500-byte IP datagram (MSS=1460, DF=1). This hits the <strong>1400-byte bottleneck</strong> at the Router\'s egress. The router must drop the packet. Normally it would send ICMP Type 3 Code 4 back — but the Firewall will block it!',
      from:'pca', to:'rtr', via:['fw'], pktColor:'#fbbf24', pktLabel:'1500B\nDF=1 →',
      activeNodes:['pca','fw','rtr'],
      fragBar:null,
      fields:[
        {k:'TCP DATA size',    v:'1500 bytes  (MSS 1460 + headers)',   c:'#fbbf24'},
        {k:'DF bit',           v:'1  (set by TCP for PMTUD)',          c:'#fbbf24'},
        {k:'Router check',     v:'1500 > 1400 (egress MTU) → DROP',   c:'#f87171'},
        {k:'Router action',    v:'Drop packet + generate ICMP 3/4',   c:'#f87171'},
        {k:'ICMP direction',   v:'Router → Firewall → PC-A (should reach)',c:'#38d9c0'},
        {k:'Firewall rule',    v:'deny icmp any any  ← THE PROBLEM',   c:'#f87171'},
        {k:'ACK received?',    v:'No — packet dropped before server',  c:'#f87171'},
        {k:'TCP timer',        v:'RTO starts… 200ms → 400ms → 800ms…',c:'#f87171'},
      ],
    },
    {
      step:3, title:'Step 3 — Firewall SILENTLY DROPS ICMP Type 3 Code 4',
      tag:'BLOCKED!', tagColor:'var(--red)', tagBg:'rgba(248,113,113,0.12)',
      desc:'The Router generates the ICMP Type 3 Code 4 "Frag Needed" response and sends it back. The Firewall has a rule: <code>deny icmp any any</code> (or specifically drops Type 3). <strong>The ICMP is silently discarded.</strong> PC-A never learns about the path MTU constraint. This is the PMTUD Black Hole. The sender is flying blind.',
      from:'rtr', to:'fw', via:[], pktColor:'#f87171', pktLabel:'ICMP\n✗ DROP',
      activeNodes:['rtr','fw'],
      fragBar:null,
      fields:[
        {k:'Firewall rule',    v:'deny icmp any any unreachable',      c:'#f87171'},
        {k:'ICMP status',      v:'SILENTLY DROPPED at firewall',       c:'#f87171'},
        {k:'PC-A learns',      v:'NOTHING — no PMTU update',          c:'#f87171'},
        {k:'Symptom',          v:'Large data hangs; ping/handshake OK!',c:'#f87171'},
        {k:'Classic examples', v:'HTTPS loads, but large file stalls', c:'#f87171'},
        {k:'BGP example',      v:'BGP session drops with large UPDATE', c:'#f87171'},
        {k:'SSH example',      v:'SSH connects, ls works, tar.gz hangs!',c:'#f87171'},
        {k:'Diagnose',         v:'tcpdump on both sides — look for retrans',c:'#fbbf24'},
      ],
    },
    {
      step:4, title:'Step 4 — TCP Retransmits  →  Exponential Backoff  →  Timeout',
      tag:'TCP STUCK', tagColor:'var(--red)', tagBg:'rgba(248,113,113,0.12)',
      desc:'PC-A\'s TCP layer retransmits the 1500-byte segment. Each retransmission doubles the RTO: <strong>200ms → 400ms → 800ms → 1.6s → 3.2s…</strong> After ~15 retries (Linux) or ~3 retries (Windows default), the TCP connection is reset. The user sees the connection hang for seconds then die — the hallmark of PMTUD Black Hole.',
      from:'pca', to:'rtr', via:['fw'], pktColor:'#f87171', pktLabel:'RETRY\n×5 ✗',
      activeNodes:['pca','fw','rtr'],
      fragBar:null,
      fields:[
        {k:'TCP RTO start',    v:'~200ms (first retransmit)',          c:'#f87171'},
        {k:'Backoff',          v:'RTO doubles: 200→400→800→1600ms…',   c:'#f87171'},
        {k:'Linux retries',    v:'net.ipv4.tcp_retries2 = 15 default', c:'#f87171'},
        {k:'Windows retries',  v:'TcpMaxDataRetransmissions = 5',      c:'#f87171'},
        {k:'Total hang time',  v:'Can be 3–15+ minutes before RST',   c:'#f87171'},
        {k:'Wireshark sign',   v:'TCP retrans every doubling interval'},
        {k:'Wireshark filter', v:'tcp.analysis.retransmission'},
        {k:'User experience',  v:'Page partially loads then hangs',    c:'#f87171'},
      ],
    },
    {
      step:5, title:'Step 5 — Fix Option A  — Allow ICMP Type 3 Code 4',
      tag:'FIX A', tagColor:'var(--green)', tagBg:'rgba(74,222,128,0.12)',
      desc:'<strong>Best Fix:</strong> Update the firewall to permit ICMP Type 3 (Unreachable). This restores full PMTUD operation. Only Type 3 and Type 11 (TTL exceeded — needed for traceroute) need to be permitted. The blanket "deny icmp any any" is a misconfiguration that breaks many protocols.',
      from:'fw', to:'pca', via:[], pktColor:'#4ade80', pktLabel:'ICMP\n✓ PASS',
      activeNodes:['fw','pca'],
      fragBar:null,
      fields:[
        {k:'Cisco ACL',        v:'permit icmp any any unreachable',    c:'#4ade80'},
        {k:'Cisco ACL 2',      v:'permit icmp any any time-exceeded',  c:'#4ade80'},
        {k:'iptables (Linux)', v:'iptables -A INPUT -p icmp --icmp-type 3 -j ACCEPT',c:'#4ade80'},
        {k:'AWS Security Grp', v:'Allow Custom ICMP: Type 3 (Destination Unreachable)',c:'#4ade80'},
        {k:'Why still risky?', v:'ICMP flood/redirect exploits DO exist',c:'#fbbf24'},
        {k:'Best practice',    v:'Rate-limit ICMP, permit Type 3 + 11 only'},
        {k:'IPv6 mandatory',   v:'ICMPv6 Type 2 MUST be permitted (RFC 4890)',c:'#a78bfa'},
        {k:'Result',           v:'PMTUD works end-to-end — black hole gone!',c:'#4ade80'},
      ],
    },
    {
      step:6, title:'Step 6 — Fix Option B  — TCP MSS Clamping  (Router-side)',
      tag:'FIX B: MSS CLAMP', tagColor:'var(--cyan)', tagBg:'rgba(56,217,192,0.12)',
      desc:'<strong>Workaround Fix (Firewall rule cannot change):</strong> Configure <em>TCP MSS clamping</em> on the router interface facing the bottleneck. The router rewrites the TCP SYN/SYN-ACK MSS option to a safe value. This prevents large segments from being sent in the first place — bypassing the need for PMTUD entirely. Cisco: <code>ip tcp adjust-mss 1360</code>',
      from:'rtr', to:'pca', via:['fw'], pktColor:'#38d9c0', pktLabel:'MSS\nCLAMP',
      activeNodes:['rtr','fw','pca'],
      fragBar:null,
      fields:[
        {k:'Cisco command',    v:'ip tcp adjust-mss 1360',             c:'#38d9c0'},
        {k:'Where to apply',   v:'Ingress/egress of bottleneck link interface'},
        {k:'IOS-XE syntax',    v:'ip tcp adjust-mss <548–9216>',       c:'#38d9c0'},
        {k:'Linux equiv',      v:'iptables -A FORWARD -p tcp --tcp-flags SYN,RST SYN -j TCPMSS --set-mss 1360',c:'#38d9c0'},
        {k:'MSS calc',         v:'1400 - 20(IP) - 20(TCP) = 1360 bytes',c:'#fbbf24'},
        {k:'GRE tunnel',       v:'ip tcp adjust-mss 1436 (1500-24-40)',c:'#a78bfa'},
        {k:'Limitation',       v:'Only works for TCP — UDP/QUIC unaffected',c:'#f87171'},
        {k:'Combined fix',     v:'MSS clamp + permit ICMP Type 3 = gold',c:'#4ade80'},
      ],
    },
  ],

  // ──────────────────────────────────────────────────────────────────────
  // SCENARIO 4 — GRE / TUNNEL MTU OVERHEAD
  // Topology: PC-A → GRE-Ingress → [Cloud] → GRE-Egress → Server
  // ──────────────────────────────────────────────────────────────────────
  tunnel: [
    {
      step:1, title:'Step 1 — Host Sends 1500-Byte IP Packet Into GRE Tunnel',
      tag:'GRE INGRESS', tagColor:'var(--blue)', tagBg:'rgba(91,156,246,0.12)',
      desc:'PC-A sends a full 1500-byte IP packet (the inner packet) toward the GRE tunnel endpoint. This is the <strong>inner IP datagram</strong>. At the GRE ingress router, the packet must be encapsulated with additional headers. The underlay network has a standard MTU of <strong>1500 bytes</strong> — this will cause an immediate problem.',
      from:'pca', to:'tin', via:[], pktColor:'#5b9cf6', pktLabel:'1500B\nINNER',
      activeNodes:['pca','tin'],
      fragBar:null,
      fields:[
        {k:'Inner IP header',  v:'20 bytes',                           c:'#5b9cf6'},
        {k:'Inner payload',    v:'1480 bytes (e.g. TCP data)',         c:'#5b9cf6'},
        {k:'Total inner pkt',  v:'1500 bytes'},
        {k:'Underlay MTU',     v:'1500 bytes  (standard Ethernet)',    c:'#fbbf24'},
        {k:'GRE overhead',     v:'20B outer IP + 4B GRE = 24 bytes',  c:'#f87171'},
        {k:'After encap',      v:'1500 + 24 = 1524 bytes outer!',     c:'#f87171'},
        {k:'1524 > 1500?',     v:'YES → fragmentation or drop!',      c:'#f87171'},
        {k:'RFC 2784',         v:'Generic Routing Encapsulation (GRE)',c:'#a78bfa'},
      ],
    },
    {
      step:2, title:'Step 2 — GRE Encapsulation Adds 24 Bytes Overhead',
      tag:'ENCAP +24B', tagColor:'var(--amber)', tagBg:'rgba(251,191,36,0.12)',
      desc:'The GRE ingress router encapsulates the 1500-byte inner packet: adds a <strong>4-byte GRE header</strong> and a <strong>20-byte outer IP header</strong> (with the tunnel source/destination IPs). The resulting outer packet is <strong>1524 bytes</strong> — 24 bytes over the 1500-byte underlay MTU. This WILL fail.',
      from:'tin', to:'tout', via:[], pktColor:'#fbbf24', pktLabel:'1524B\n❌ OVER',
      activeNodes:['tin','tout'],
      fragBar:null,
      fields:[
        {k:'Outer IP header',  v:'20 bytes  (Src=Tun-IP, Dst=Remote-Tun)',c:'#fbbf24'},
        {k:'GRE header',       v:'4 bytes  (type 0x0800 → IPv4)',      c:'#fbbf24'},
        {k:'Total overhead',   v:'20 + 4 = 24 bytes per packet',       c:'#f87171'},
        {k:'Outer pkt size',   v:'1500 + 24 = 1524 bytes',            c:'#f87171'},
        {k:'GRE with Key',     v:'+4 bytes (Key field) = 28B overhead'},
        {k:'GRE with Seq',     v:'+4 bytes (Sequence No) = 28–32B overhead'},
        {k:'GRE + IPv6 inner', v:'Outer IP still 20B (IPv4 transport)'},
        {k:'GRE over IPv6',    v:'+40B outer IPv6 = 44B total overhead',c:'#a78bfa'},
      ],
    },
    {
      step:3, title:'Step 3 — Outer Packet Exceeds MTU  — Three Possible Outcomes',
      tag:'MTU CRISIS', tagColor:'var(--red)', tagBg:'rgba(248,113,113,0.12)',
      desc:'The 1524-byte outer packet hits the 1500-byte underlay link. Three outcomes depending on the outer DF bit: <strong>A)</strong> Outer DF=0 → outer packet is fragmented (ugly, common TAC issue). <strong>B)</strong> Outer DF=1 → outer packet dropped, ICMP to tunnel src → tunnel adjusts. <strong>C)</strong> Inner DF=1 propagated → ICMP Type 3/4 reaches the original sender.',
      from:'tin', to:'tout', via:[], pktColor:'#f87171', pktLabel:'1524B\n3 PATHS',
      activeNodes:['tin'],
      fragBar:null,
      fields:[
        {k:'Outcome A (DF=0)', v:'Outer fragmented at underlay router',c:'#fbbf24'},
        {k:'Outcome A issue',  v:'Reassembly overhead at GRE egress', c:'#f87171'},
        {k:'Outcome B (DF=1)', v:'Outer dropped → ICMP to GRE ingress',c:'#fbbf24'},
        {k:'Outcome B fix',    v:'GRE ingress lowers inner MTU → probe again',c:'#4ade80'},
        {k:'Outcome C',        v:'Inner DF=1 propagated through GRE',  c:'#a78bfa'},
        {k:'Outcome C fix',    v:'ICMP reaches original sender → PMTUD works',c:'#4ade80'},
        {k:'DF copy',          v:'Cisco tunnel: tunnel df-bit copy|clear|set'},
        {k:'Best practice',    v:'Set tunnel MTU to 1476 + MSS clamp', c:'#4ade80'},
      ],
    },
    {
      step:4, title:'Step 4 — Correct Fix  — Set Tunnel Interface MTU to 1476',
      tag:'FIX: MTU 1476', tagColor:'var(--green)', tagBg:'rgba(74,222,128,0.12)',
      desc:'<strong>Fix 1:</strong> Set the GRE tunnel interface MTU to <strong>1476 bytes</strong> (1500 − 24B GRE overhead). This tells the kernel/IP layer that the tunnel can only carry 1476-byte inner packets. Hosts using this tunnel as their gateway will learn an effective path MTU of ≤1476 via PMTUD, and TCP MSS will adjust accordingly.',
      from:'tin', to:'tout', via:[], pktColor:'#4ade80', pktLabel:'1476B\n✓ OK',
      activeNodes:['tin','tout'],
      fragBar:null,
      fields:[
        {k:'Cisco command',    v:'interface Tunnel0',                  c:'#38d9c0'},
        {k:'',                 v:' ip mtu 1476',                       c:'#38d9c0'},
        {k:'Linux command',    v:'ip link set dev tun0 mtu 1476',      c:'#38d9c0'},
        {k:'Result',           v:'IP layer limits inner packets to 1476B',c:'#4ade80'},
        {k:'GRE overhead',     v:'1476 + 24 = 1500  ✓ fits underlay!',c:'#4ade80'},
        {k:'TCP MSS adjust',   v:'ip tcp adjust-mss 1436  (1476-40)', c:'#38d9c0'},
        {k:'Verify Cisco',     v:'show interfaces Tunnel0 | incl MTU', c:'#fbbf24'},
        {k:'MTU formula',      v:'Tunnel MTU = Underlay MTU - GRE overhead',c:'#fbbf24'},
      ],
    },
    {
      step:5, title:'Step 5 — Overhead Comparison: GRE vs IPsec vs MPLS vs WireGuard',
      tag:'OVERHEAD TABLE', tagColor:'var(--purple)', tagBg:'rgba(167,139,250,0.12)',
      desc:'Different tunnel technologies impose different overheads. <strong>CCIE-level:</strong> You must be able to calculate the effective MTU for ANY tunnel type. IPsec ESP adds encryption overhead that varies by cipher block size and IV. MPLS adds 4 bytes per label (MPLS label stack). Always verify with captures when in doubt.',
      from:'tin', to:'tout', via:[], pktColor:'#a78bfa', pktLabel:'OVER\nHEAD',
      activeNodes:['tin','tout'],
      fragBar:null,
      fields:[
        {k:'Plain GRE',        v:'20(IP) + 4(GRE) = 24B → MTU 1476',  c:'#5b9cf6'},
        {k:'GRE + IPsec AH',   v:'24(GRE) + 24(AH) = 48B → MTU 1452',c:'#a78bfa'},
        {k:'IPsec ESP (AES)',   v:'20(IP)+8(ESP hdr)+16(IV)+20(TCP)+16(pad)+2+12(ICV) ≈ 73B',c:'#a78bfa'},
        {k:'IPsec Transport',  v:'~57B → MTU 1443  (Transport mode)', c:'#a78bfa'},
        {k:'MPLS (1 label)',    v:'4B per label → MTU 1496',           c:'#fbbf24'},
        {k:'MPLS (3 labels)',   v:'12B → MTU 1488  (e.g. L3VPN+LDP)', c:'#fbbf24'},
        {k:'VXLAN',            v:'50B (UDP+VXLAN hdr) → MTU 1450',    c:'#38d9c0'},
        {k:'WireGuard',        v:'~60B → MTU 1440 (recommended)',      c:'#38d9c0'},
      ],
    },
    {
      step:6, title:'Step 6 — Jumbo Frames & OSPF MTU Mismatch  (TAC Classics)',
      tag:'TAC CASES', tagColor:'var(--cyan)', tagBg:'rgba(56,217,192,0.12)',
      desc:'<strong>TAC Golden Topics:</strong> (1) Jumbo frames (MTU 9000) require end-to-end support — ONE switch without jumbo config = silent drops. (2) OSPF stuck in ExStart/Exchange = MTU mismatch between neighbors (DBD packets exceed one side\'s MTU). Fix: align MTUs or use <code>ip ospf mtu-ignore</code>. (3) BGP UPDATE drops = jumbo frames or MTU mismatch on underlay.',
      from:'tin', to:'tout', via:[], pktColor:'#38d9c0', pktLabel:'TAC\nFIX',
      activeNodes:['tin','tout','srv'],
      fragBar:null,
      fields:[
        {k:'Jumbo MTU',        v:'9000 bytes (datacenter / iSCSI/NFS)',c:'#38d9c0'},
        {k:'Jumbo requirement',v:'EVERY hop must support jumbo frames', c:'#f87171'},
        {k:'Jumbo Cisco',      v:'system mtu jumbo 9000  (switch global)',c:'#38d9c0'},
        {k:'OSPF ExStart',     v:'MTU mismatch → DBD dropped → stuck!',c:'#f87171'},
        {k:'OSPF fix temp',    v:'ip ospf mtu-ignore  (per interface)', c:'#4ade80'},
        {k:'OSPF fix perm',    v:'Align MTUs on both sides (correct fix)',c:'#4ade80'},
        {k:'BGP UPDATE drop',  v:'Large AS_PATH → packet > MTU → PMTUD black hole',c:'#f87171'},
        {k:'Baby Giants',      v:'1518+4=1522B (802.1Q), 1518+8=1526B (QinQ)',c:'#a78bfa'},
      ],
    },
  ],
  mtuvsmss: [
    {
      step:1, title:'Step 1 — The Layer 2 / Layer 3 Boundary',
      tag:'CONCEPTS', tagColor:'var(--blue)', tagBg:'rgba(91,156,246,0.12)',
      desc:'<strong>MTU</strong> is a Layer 2/3 property: the max size of an IP packet (including headers) that can fit in an Ethernet frame. <strong>MSS</strong> is a Layer 4 (TCP) property: the max amount of <em>actual data</em> a host can put in a single TCP segment.',
      from:'pca', to:'pca', via:[], pktColor:'#5b9cf6', pktLabel:'MTU vs\nMSS',
      activeNodes:['pca'],
      fields:[
        {k:'MTU', v:'Maximum Transmission Unit (L3 Packet)'},
        {k:'MSS', v:'Maximum Segment Size (L4 Data only)'},
        {k:'IPv4 Formula', v:'MSS = MTU - 20(IP) - 20(TCP)', c:'#4ade80'},
        {k:'Standard Ethernet', v:'MTU 1500 → MSS 1460'},
      ],
    },
    {
      step:2, title:'Step 2 — TCP SYN: Negotiating the MSS',
      tag:'HANDSHAKE', tagColor:'var(--amber)', tagBg:'rgba(251,191,36,0.12)',
      desc:'During the 3-way handshake, PC-A sends a SYN packet. It includes the <strong>MSS Option</strong> in the TCP header, telling the server: "Please do not send me segments larger than 1460 bytes."',
      from:'pca', to:'srv', via:['rtr'], pktColor:'#fbbf24', pktLabel:'SYN\nMSS:1460',
      activeNodes:['pca','rtr','srv'],
      fields:[
        {k:'TCP Option', v:'Kind 2, Length 4 (MSS)'},
        {k:'Value Sent', v:'1460 bytes', c:'#fbbf24'},
        {k:'Calculated as', v:'Interface MTU (1500) - 40'},
      ],
    },
    {
      step:3, title:'Step 3 — Server Responds with its MSS',
      tag:'SYN-ACK', tagColor:'var(--cyan)', tagBg:'rgba(56,217,192,0.12)',
      desc:'The Server replies with a SYN-ACK. It also includes its own MSS. If the Server had an MTU of 1400, it would announce an MSS of 1360. Both sides will use the <strong>LOWER</strong> of the two announced values.',
      from:'srv', to:'pca', via:['rtr'], pktColor:'#38d9c0', pktLabel:'SYN-ACK\nMSS:1460',
      activeNodes:['pca','rtr','srv'],
      fields:[
        {k:'Server MSS', v:'1460 bytes'},
        {k:'Agreed MSS', v:'1460 (Min of both sides)', c:'#4ade80'},
      ],
    },
    {
      step:4, title:'Step 4 — Data Transfer: Encapsulation Anatomy',
      tag:'DATA', tagColor:'var(--blue)', tagBg:'rgba(91,156,246,0.12)',
      desc:'When sending data, the Application hands 1460 bytes to TCP. TCP adds a 20B header (Total 1480). IP adds a 20B header (Total 1500). Ethernet adds its header/trailer. The final "on-the-wire" frame is 1518 or 1522 bytes.',
      from:'pca', to:'srv', via:[], pktColor:'#5b9cf6', pktLabel:'DATA\n1500B',
      activeNodes:['pca'],
      fields:[
        {k:'Payload', v:'1460 Bytes (The MSS)', c:'#4ade80'},
        {k:'TCP Header', v:'+ 20 Bytes'},
        {k:'IP Header', v:'+ 20 Bytes'},
        {k:'Total L3 Pkt', v:'1500 Bytes (The MTU)', c:'#fbbf24'},
      ],
    },
    {
      step:5, title:'Step 5 — How MSS Clamping Fixes MTU Issues',
      tag:'TCP ADJUST', tagColor:'var(--purple)', tagBg:'rgba(167,139,250,0.12)',
      desc:'If a router in the middle knows the path MTU is small (e.g., a VPN tunnel), it can intercept the SYN and <strong>rewrite</strong> the MSS value. This is called "MSS Clamping." It forces the hosts to send smaller packets, preventing fragmentation.',
      from:'rtr', to:'srv', via:[], pktColor:'#a78bfa', pktLabel:'REWRITE\nMSS',
      activeNodes:['rtr'],
      fields:[
        {k:'Original MSS', v:'1460'},
        {k:'Clamped MSS', v:'1360', c:'#f87171'},
        {k:'Cisco Command', v:'ip tcp adjust-mss 1360'},
      ],
    },
    {
      step:6, title:'Step 6 — Summary: MTU vs MSS',
      tag:'FINAL', tagColor:'var(--green)', tagBg:'rgba(74,222,128,0.12)',
      desc:'Remember: MTU is a <strong>hard limit</strong> of the wire. MSS is a <strong>negotiated limit</strong> of the TCP stack. If MSS is set correctly, IP Fragmentation should never be needed! UDP does not have MSS, which is why UDP often suffers more from MTU issues.',
      from:'pca', to:'srv', via:['rtr'], pktColor:'#4ade80', pktLabel:'OPTIMAL\nFLOW',
      activeNodes:['pca','rtr','srv'],
      fields:[
        {k:'Layer 3', v:'MTU (Max Packet)'},
        {k:'Layer 4', v:'MSS (Max Segment)'},
        {k:'Best Practice', v:'MSS = Path MTU - 40'},
        {k:'Result', v:'No Fragmentation, Peak Performance!'},
      ],
    },
  ],
};

// ═══════════════════════════════════════════════════════════════════════════
// HTML INJECTION — Build the full page on first init
// ═══════════════════════════════════════════════════════════════════════════
function mtuBuildHTML() {
  const pg = document.getElementById('page-mtu');
  if (!pg || pg.innerHTML.trim()) return; // already built
  pg.innerHTML = `
  <div class="sim-page-inner" style="max-width:1200px;margin:0 auto;padding:20px;">

    <!-- ── HEADER ── -->
    <div style="margin-bottom:18px;">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:6px;">
        <div>
          <div style="font-family:var(--mono);font-size:10px;color:var(--blue);letter-spacing:1.5px;text-transform:uppercase;margin-bottom:4px;">📏 Network Fundamentals</div>
          <div style="font-size:22px;font-weight:800;color:var(--text);letter-spacing:-0.3px;">MTU / Fragmentation <span style="color:var(--cyan)">Deep Dive</span></div>
          <div style="font-size:13px;color:var(--muted2);margin-top:4px;">CCIE &amp; TAC-Level — IP Fragmentation · PMTUD · Black Hole Routing · Tunnel MTU Overhead</div>
        </div>
      </div>
    </div>

    <!-- ── SCENARIO TABS ── -->
    <div class="mode-tabs" id="mtu-mode-tabs" style="flex-wrap:wrap;">
      <div class="mode-tab active" onclick="mtuSetMode('frag',this)" id="mtutab-frag">🔪 IP Fragmentation</div>
      <div class="mode-tab" onclick="mtuSetMode('pmtud',this)" id="mtutab-pmtud">🔍 Path MTU Discovery</div>
      <div class="mode-tab" onclick="mtuSetMode('blackhole',this)" id="mtutab-blackhole">⚫ PMTUD Black Hole</div>
      <div class="mode-tab" onclick="mtuSetMode('tunnel',this)" id="mtutab-tunnel">🔗 Tunnel MTU / Overhead</div>
      <div class="mode-tab" onclick="mtuSetMode('mtuvsmss',this)" id="mtutab-mtuvsmss">⚖️ MTU vs MSS</div> </div>
    </div>

    <!-- ── BODY ── -->
    <div style="display:grid;grid-template-columns:1fr 380px;gap:16px;align-items:start;" id="mtu-body">

      <!-- LEFT: topology + controls -->
      <div>
        <!-- Topology SVG -->
        <div class="topo-wrap" style="margin-bottom:12px;">
          <div class="topo-label" id="mtu-topo-label">🔪 IP FRAGMENTATION — PC-A → Router (egress MTU 1000B) → PC-B</div>
          <svg id="mtu-svg" viewBox="0 0 760 290" style="display:block;width:100%;height:auto;min-height:200px;">
            <defs>
              <marker id="mtu-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 Z" fill="rgba(100,160,255,0.5)"/>
              </marker>
              <marker id="mtu-arrow-act" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 Z" fill="#5b9cf6"/>
              </marker>
            </defs>
            <text x="380" y="155" text-anchor="middle" fill="rgba(140,150,180,0.3)" font-family="IBM Plex Mono,monospace" font-size="13">Press ▶ Play to begin</text>
          </svg>
        </div>

        <!-- Fragment bar -->
        <div id="mtu-frag-bar-wrap" style="display:none;margin-bottom:12px;">
          <div style="font-family:var(--mono);font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">DATAGRAM FRAGMENTATION VIEW</div>
          <div id="mtu-frag-bar" style="height:36px;background:var(--bg2);border:1px solid var(--border);border-radius:8px;overflow:hidden;position:relative;display:flex;">
            <div id="mtu-frag-unfilled" style="flex:1;display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-size:10px;color:var(--muted);">awaiting fragmentation…</div>
          </div>
          <div id="mtu-frag-legend" style="display:flex;gap:12px;margin-top:6px;flex-wrap:wrap;"></div>
        </div>

        <!-- Step chain -->
        <div class="dns-chain" id="mtu-chain" style="margin-bottom:12px;"></div>

        <!-- Progress bar -->
        <div class="progress-bar" style="margin-bottom:10px;"><div class="progress-fill" id="mtu-progress" style="width:0%"></div></div>

        <!-- Controls -->
        <div class="ctrl-bar" style="margin-bottom:14px;">
          <button class="btn btn-play" onclick="mtuTogglePlay()" id="mtu-play-btn">▶ Play</button>
          <button class="btn btn-primary btn-sm" onclick="mtuStep(-1)">◀ Prev</button>
          <button class="btn btn-primary btn-sm" onclick="mtuStep(1)">Next ▶</button>
          <button class="btn btn-reset btn-sm" onclick="mtuReset()">⟳ Reset</button>
          <div class="step-counter">Step <span id="mtu-step-num">0</span> / <span id="mtu-step-total">6</span></div>
          <div style="flex:1"></div>
          <div class="speed-label">Speed:</div>
          <div class="speed-group">
            <button class="speed-btn" id="mtu-speed-slow"   onclick="mtuSetSpeed('slow')">Slow</button>
            <button class="speed-btn active" id="mtu-speed-normal" onclick="mtuSetSpeed('normal')">Normal</button>
            <button class="speed-btn" id="mtu-speed-fast"   onclick="mtuSetSpeed('fast')">Fast</button>
            <button class="speed-btn" id="mtu-speed-manual" onclick="mtuSetSpeed('manual')">Manual</button>
          </div>
        </div>

        <!-- Step info -->
        <div class="step-info" id="mtu-step-info">
          <div class="step-tag" style="background:rgba(91,156,246,0.12);color:var(--blue)">READY</div>
          <div class="step-title">Select a scenario above and press ▶ Play</div>
          <div class="step-desc">Follow the complete flow step-by-step — packet animation, fragmentation anatomy, and Wireshark-style field breakdown.</div>
        </div>

        <!-- MTU Calculator -->
        <div class="card" style="margin-top:0;">
          <div class="card-hdr">📐 MTU / MSS / Overhead Calculator</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
            <div>
              <div class="field-label">Underlay / Physical MTU (bytes)</div>
              <input type="number" id="mtu-calc-mtu" value="1500" min="576" max="65535" oninput="mtuCalcUpdate()">
            </div>
            <div>
              <div class="field-label">Tunnel Type</div>
              <select id="mtu-calc-tunnel" onchange="mtuCalcUpdate()">
                <option value="0">No Tunnel (native Ethernet)</option>
                <option value="24">GRE (IPv4 transport) — 24B</option>
                <option value="28">GRE + Key field — 28B</option>
                <option value="50">VXLAN (UDP) — 50B</option>
                <option value="44">GRE over IPv6 — 44B</option>
                <option value="57">IPsec ESP Transport (AES-128) — ~57B</option>
                <option value="73">IPsec ESP Tunnel (AES-128) — ~73B</option>
                <option value="4">MPLS (1 label) — 4B</option>
                <option value="8">MPLS (2 labels) — 8B</option>
                <option value="12">MPLS (3 labels) — 12B</option>
                <option value="60">WireGuard — ~60B</option>
                <option value="48">GRE + IPsec AH — 48B</option>
                <option value="4">802.1Q VLAN tag — 4B</option>
                <option value="8">QinQ / 802.1ad — 8B</option>
              </select>
            </div>
          </div>
          <div id="mtu-calc-out" style="background:var(--bg3);border-radius:8px;padding:12px;font-family:var(--mono);font-size:11.5px;line-height:2;color:var(--muted2);"></div>
        </div>
      </div>

      <!-- RIGHT: packet fields + reference -->
      <div>
        <!-- Packet fields -->
        <div class="card" style="margin-bottom:14px;">
          <div class="card-hdr">📋 Packet Field Breakdown  (Wireshark-Level)</div>
          <div id="mtu-pkt-fields">
            <div style="color:var(--muted);font-family:var(--mono);font-size:11px;">Start the animation to see packet field details…</div>
          </div>
        </div>

        <!-- Quick Reference: MTU values -->
        <div class="card" style="margin-bottom:14px;">
          <div class="card-hdr">🔢 MTU Values by Technology</div>
          <table class="cache-table" style="font-size:10.5px;">
            <thead><tr><th>Technology</th><th>MTU</th><th>Notes</th></tr></thead>
            <tbody>
              <tr><td style="color:var(--blue)">Ethernet (standard)</td><td style="color:var(--text)">1500B</td><td style="color:var(--muted)">IEEE 802.3 default</td></tr>
              <tr><td style="color:var(--green)">Jumbo Frames</td><td style="color:var(--text)">9000B</td><td style="color:var(--muted)">Datacenter / iSCSI</td></tr>
              <tr><td style="color:var(--amber)">PPPoE</td><td style="color:var(--text)">1492B</td><td style="color:var(--muted)">−8B PPPoE header</td></tr>
              <tr><td style="color:var(--purple)">GRE Tunnel</td><td style="color:var(--text)">1476B</td><td style="color:var(--muted)">1500−24B overhead</td></tr>
              <tr><td style="color:var(--cyan)">VXLAN</td><td style="color:var(--text)">1450B</td><td style="color:var(--muted)">1500−50B overhead</td></tr>
              <tr><td style="color:var(--red)">IPsec ESP Tunnel</td><td style="color:var(--text)">~1427B</td><td style="color:var(--muted)">Varies by cipher</td></tr>
              <tr><td style="color:var(--amber)">WireGuard</td><td style="color:var(--text)">1420B</td><td style="color:var(--muted)">Recommended default</td></tr>
              <tr><td style="color:var(--muted2)">802.1Q (VLAN)</td><td style="color:var(--text)">1504B</td><td style="color:var(--muted)">+4B tag (baby giant)</td></tr>
              <tr><td style="color:var(--muted2)">QinQ 802.1ad</td><td style="color:var(--text)">1508B</td><td style="color:var(--muted)">+8B double tag</td></tr>
              <tr><td style="color:var(--muted2)">IPv6 minimum</td><td style="color:var(--text)">1280B</td><td style="color:var(--muted)">RFC 2460 minimum</td></tr>
              <tr><td style="color:var(--muted2)">Loopback</td><td style="color:var(--text)">65536B</td><td style="color:var(--muted)">Linux lo interface</td></tr>
            </tbody>
          </table>
        </div>

        <!-- CLI Reference -->
        <div class="card" style="margin-bottom:14px;">
          <div class="card-hdr">🖥 CLI Reference  (Cisco &amp; Linux)</div>
          <div style="font-family:var(--mono);font-size:10.5px;line-height:1.85;color:var(--muted2);">
            <div style="color:var(--blue);margin-bottom:4px;">── Cisco IOS / IOS-XE ──</div>
            <div><span style="color:var(--green)">show interfaces Gi0/0</span> <span style="color:var(--muted)">| incl MTU</span></div>
            <div><span style="color:var(--green)">ip mtu 1476</span>  <span style="color:var(--muted)">← set IP MTU on tunnel</span></div>
            <div><span style="color:var(--green)">ip tcp adjust-mss 1436</span>  <span style="color:var(--muted)">← clamp MSS</span></div>
            <div><span style="color:var(--green)">ip ospf mtu-ignore</span>  <span style="color:var(--muted)">← ExStart fix (temp)</span></div>
            <div><span style="color:var(--green)">tunnel df-bit copy</span>  <span style="color:var(--muted)">← propagate DF bit</span></div>
            <div><span style="color:var(--green)">debug ip icmp</span>  <span style="color:var(--muted)">← see PMTUD ICMP msgs</span></div>
            <div style="color:var(--blue);margin:8px 0 4px;">── Linux ──</div>
            <div><span style="color:var(--cyan)">ip link set dev eth0 mtu 9000</span></div>
            <div><span style="color:var(--cyan)">ip route get 8.8.8.8</span>  <span style="color:var(--muted)">| grep mtu</span></div>
            <div><span style="color:var(--cyan)">tracepath -n 8.8.8.8</span>  <span style="color:var(--muted)">← PMTU probe</span></div>
            <div><span style="color:var(--cyan)">ping -M do -s 1472 8.8.8.8</span>  <span style="color:var(--muted)">← test DF=1</span></div>
            <div><span style="color:var(--cyan)">ss -tin dst 8.8.8.8</span>  <span style="color:var(--muted)">← see pmtu/rcv_space</span></div>
            <div style="color:var(--blue);margin:8px 0 4px;">── Wireshark Filters ──</div>
            <div><span style="color:var(--amber)">ip.flags.mf == 1 || ip.frag_offset > 0</span></div>
            <div><span style="color:var(--amber)">icmp.type==3 && icmp.code==4</span>  <span style="color:var(--muted)">← PMTUD</span></div>
            <div><span style="color:var(--amber)">tcp.analysis.retransmission</span>  <span style="color:var(--muted)">← black hole</span></div>
            <div><span style="color:var(--amber)">frame.len > 1500</span>  <span style="color:var(--muted)">← oversized frames</span></div>
          </div>
        </div>

        <!-- CCIE Q&A -->
        <div class="card">
          <div class="card-hdr">🎓 CCIE / TAC Interview Questions</div>
          <div style="display:flex;flex-direction:column;gap:8px;" id="mtu-qa">
            <div class="qa-item">
              <div class="qa-q" onclick="toggleQA(this)" style="font-size:12px;">Q: Why does ping work but HTTPS hang? What do you suspect first?<span class="qa-arrow">▶</span></div>
              <div class="qa-a" style="font-size:12px;"><strong>PMTUD Black Hole.</strong> Ping uses small ICMP packets (≤ MTU). TCP SYN/SYN-ACK are small (&lt;100B). Data segments with MSS=1460 hit the MTU bottleneck, get dropped — but ICMP Type 3 Code 4 is blocked by a firewall. TCP retransmits until timeout. Fix: permit <code>icmp unreachable</code> on firewall, or <code>ip tcp adjust-mss 1452</code> on router.</div>
            </div>
            <div class="qa-item">
              <div class="qa-q" onclick="toggleQA(this)" style="font-size:12px;">Q: Two OSPF routers are stuck in EXSTART. MTU mismatch is suspected — how do you confirm and fix?<span class="qa-arrow">▶</span></div>
              <div class="qa-a" style="font-size:12px;"><strong>Confirm:</strong> <code>show interfaces Gi0/0 | incl MTU</code> on both sides. If one shows 1500 and the other 1476 (due to GRE tunnel path), DBD packets from the 1500-side exceed the other's buffer → EXSTART loop. <code>debug ip ospf adj</code> will show "MTU mismatch detected." <strong>Fix:</strong> Align MTUs to match, OR use <code>ip ospf mtu-ignore</code> per interface (temporary workaround). Root fix is always to align MTUs end-to-end.</div>
            </div>
            <div class="qa-item">
              <div class="qa-q" onclick="toggleQA(this)" style="font-size:12px;">Q: Calculate the correct MSS for a GRE over IPsec (ESP AES-128) tunnel over a 1500-byte Ethernet path.<span class="qa-arrow">▶</span></div>
              <div class="qa-a" style="font-size:12px;"><strong>Overhead breakdown:</strong> Outer IP=20B, ESP header=8B, IV(AES-128)=16B, Inner IP=20B, TCP=20B, ESP trailer (padding+pad_len+next_hdr)=2–18B, ICV(HMAC-SHA1)=12B. Max overhead ≈ 20+8+16+18+12 = 74B (worst case). Some variants: 20+8+16+2+12=58B (best case). Conservative: MTU 1500 - 74 = 1426B IP inner. MSS = 1426 - 40 = <strong>1386 bytes</strong>. Always verify with a capture and adjust-mss accordingly.</div>
            </div>
            <div class="qa-item">
              <div class="qa-q" onclick="toggleQA(this)" style="font-size:12px;">Q: Why can't IPv6 routers fragment packets? How does this affect network design?<span class="qa-arrow">▶</span></div>
              <div class="qa-a" style="font-size:12px;">IPv6 by design (RFC 2460) prohibits fragmentation by routers — only the <strong>source host</strong> may fragment (using the Fragment Extension Header). This forces hosts to implement PMTUD (mandatory for IPv6). ICMPv6 Type 2 (Packet Too Big) must NEVER be blocked — it is operationally mandatory. Network impact: if a firewall blocks ICMPv6 Type 2, IPv6 connections silently fail for large packets. Minimum IPv6 MTU is 1280 bytes — all links must support at least this. In practice this improves router performance (no per-packet fragmentation at line rate) but places more burden on end hosts.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `;
}

// ═══════════════════════════════════════════════════════════════════════════
// TOPOLOGY DRAWING
// ═══════════════════════════════════════════════════════════════════════════
function mtuDrawTopo(animated) {
  const svg = document.getElementById('mtu-svg');
  if (!svg) return;
  const nodes = MTU_NODES[mtuMode];
  const W = MTU_SVG_W, H = MTU_SVG_H;
  const active = mtuActiveNodes;

  let out = `<defs>
    <marker id="mtu-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 Z" fill="rgba(100,160,255,0.3)"/>
    </marker>
    <marker id="mtu-arrow-act" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 Z" fill="#5b9cf6"/>
    </marker>
  </defs>`;

  const isAct = (n) => active.includes(n);

  if (mtuMode === 'frag') {
    const {pca, rtr, pcb} = nodes;
    // Edges
    const e1act = isAct('pca') && isAct('rtr');
    const e2act = isAct('rtr') && isAct('pcb');
    out += mtuEdge(pca.x+32, pca.y, rtr.x-32, rtr.y, e1act, '#5b9cf6');
    out += mtuEdge(rtr.x+32, rtr.y, pcb.x-30, pcb.y, e2act, e2act ? '#f87171' : undefined);
    // MTU labels on links
    out += mtuLinkLabel((pca.x+rtr.x)/2, pca.y - 22, '1500B MTU', e1act ? '#5b9cf6' : '#3a4060');
    out += mtuLinkLabel((rtr.x+pcb.x)/2, rtr.y - 22, '1000B MTU ←bottleneck', e2act ? '#f87171' : '#3a4060');
    out += svgPC(pca.x, pca.y, 'pca', 'PC-A\n10.0.0.1', isAct('pca'));
    out += svgRouter(rtr.x, rtr.y, 'rtr', 'RTR-A\nfrag here', isAct('rtr'));
    out += svgPC(pcb.x, pcb.y, 'pcb', 'PC-B\n10.0.1.1', isAct('pcb'));
  } else if (mtuMode === 'pmtud') {
    const {pca, rtr1, rtr2, srv} = nodes;
    const e1a = isAct('pca') && isAct('rtr1');
    const e2a = isAct('rtr1') && isAct('rtr2');
    const e3a = isAct('rtr2') && isAct('srv');
    out += mtuEdge(pca.x+32, pca.y, rtr1.x-32, rtr1.y, e1a);
    out += mtuEdge(rtr1.x+32, rtr1.y, rtr2.x-32, rtr2.y, e2a, e2a ? '#f87171' : undefined, true);
    out += mtuEdge(rtr2.x+32, rtr2.y, srv.x-28, srv.y, e3a);
    out += mtuLinkLabel((pca.x+rtr1.x)/2, pca.y-22, '1500B', e1a ? '#5b9cf6' : '#3a4060');
    out += mtuLinkLabel((rtr1.x+rtr2.x)/2, rtr1.y-22, '1400B bottleneck', e2a ? '#f87171' : '#3a4060');
    out += mtuLinkLabel((rtr2.x+srv.x)/2, rtr2.y-22, '1500B', e3a ? '#5b9cf6' : '#3a4060');
    out += svgPC(pca.x, pca.y, 'pca', 'PC-A\n10.0.0.1', isAct('pca'));
    out += svgRouter(rtr1.x, rtr1.y, 'rtr1', 'RTR-1\n10.1.1.1', isAct('rtr1'));
    out += svgRouter(rtr2.x, rtr2.y, 'rtr2', 'RTR-2\n10.2.2.1', isAct('rtr2'));
    out += svgServer(srv.x, srv.y, 'srv', 'Server\n10.3.3.1', isAct('srv'));
  } else if (mtuMode === 'blackhole') {
    const {pca, fw, rtr, srv} = nodes;
    const e1a = isAct('pca') && isAct('fw');
    const e2a = isAct('fw') && isAct('rtr');
    const e3a = isAct('rtr') && isAct('srv');
    out += mtuEdge(pca.x+32, pca.y, fw.x-28, fw.y, e1a);
    out += mtuEdge(fw.x+28, fw.y, rtr.x-32, rtr.y, e2a);
    out += mtuEdge(rtr.x+32, rtr.y, srv.x-28, srv.y, e3a, e3a ? '#f87171' : undefined, true);
    out += mtuLinkLabel((pca.x+fw.x)/2, pca.y-22, '1500B', e1a ? '#5b9cf6' : '#3a4060');
    out += mtuLinkLabel((fw.x+rtr.x)/2, fw.y-22, '1500B', e2a ? '#5b9cf6' : '#3a4060');
    out += mtuLinkLabel((rtr.x+srv.x)/2, rtr.y-22, '1400B bottleneck', e3a ? '#f87171' : '#3a4060');
    out += svgPC(pca.x, pca.y, 'pca', 'PC-A\n10.0.0.1', isAct('pca'));
    out += mtuFirewallNode(fw.x, fw.y, 'fw', isAct('fw'));
    out += svgRouter(rtr.x, rtr.y, 'rtr', 'RTR\n10.2.0.1', isAct('rtr'));
    out += svgServer(srv.x, srv.y, 'srv', 'Server\n10.3.0.1', isAct('srv'));
  } else if (mtuMode === 'tunnel') {
    const {pca, tin, tout, srv} = nodes;
    const e1a = isAct('pca') && isAct('tin');
    const e2a = isAct('tin') && isAct('tout');
    const e3a = isAct('tout') && isAct('srv');
    // Tunnel cloud between ingress and egress
    const cloudX = (tin.x + tout.x) / 2;
    out += mtuEdge(pca.x+32, pca.y, tin.x-28, tin.y, e1a);
    out += mtuTunnelLine(tin.x+28, tin.y, tout.x-28, tout.y, e2a);
    out += mtuEdge(tout.x+28, tout.y, srv.x-28, srv.y, e3a);
    out += mtuLinkLabel((pca.x+tin.x)/2, pca.y-20, 'Inner', e1a ? '#5b9cf6' : '#3a4060');
    out += mtuLinkLabel(cloudX, tin.y-28, 'GRE Tunnel  (+24B overhead)', e2a ? '#a78bfa' : '#3a4060');
    out += mtuLinkLabel((tout.x+srv.x)/2, tout.y-20, '1500B Ethernet', e3a ? '#5b9cf6' : '#3a4060');
    out += svgCloud(cloudX, tin.y + 60, 'cloud', 'Underlay\n1500B MTU', e2a);
    out += svgPC(pca.x, pca.y, 'pca', 'PC-A\n192.168.1.1', isAct('pca'));
    out += svgRouter(tin.x, tin.y, 'tin', 'GRE\nIngress', isAct('tin'));
    out += svgRouter(tout.x, tout.y, 'tout', 'GRE\nEgress', isAct('tout'));
    out += svgServer(srv.x, srv.y, 'srv', 'Server\n10.0.0.1', isAct('srv'));
  } else if (mtuMode === 'mtuvsmss') {
    const {pca, rtr, srv} = nodes;
    const e1a = isAct('pca') && isAct('rtr');
    const e2a = isAct('rtr') && isAct('srv');
    
    // Draw the connections (Edges)
    out += mtuEdge(pca.x+32, pca.y, rtr.x-32, rtr.y, e1a, '#5b9cf6');
    out += mtuEdge(rtr.x+32, rtr.y, srv.x-28, srv.y, e2a, e2a ? '#4ade80' : undefined);
    
    // Draw the link labels
    out += mtuLinkLabel((pca.x+rtr.x)/2, pca.y - 22, '1500B MTU', e1a ? '#5b9cf6' : '#3a4060');
    out += mtuLinkLabel((rtr.x+srv.x)/2, rtr.y - 22, '1500B MTU', e2a ? '#4ade80' : '#3a4060');
    
    // Draw the actual icons
    out += svgPC(pca.x, pca.y, 'pca', 'PC-A\n10.0.0.1', isAct('pca'));
    out += svgRouter(rtr.x, rtr.y, 'rtr', 'RTR\nClamp', isAct('rtr'));
    out += svgServer(srv.x, srv.y, 'srv', 'Server\n10.0.0.1', isAct('srv'));
  }

  svg.innerHTML = out;
}

function mtuEdge(x1, y1, x2, y2, active, color, dashed) {
  const c = active ? (color || '#5b9cf6') : 'rgba(100,160,255,0.12)';
  const w = active ? 2 : 1;
  const dash = dashed ? 'stroke-dasharray="6,4"' : '';
  const marker = active ? 'url(#mtu-arrow-act)' : 'url(#mtu-arrow)';
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" ${dash} marker-end="${marker}"/>`;
}

function mtuTunnelLine(x1, y1, x2, y2, active) {
  const c = active ? '#a78bfa' : 'rgba(167,139,250,0.12)';
  const w = active ? 2.5 : 1;
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" stroke-dasharray="8,5" marker-end="url(#mtu-arrow-act)"/>`;
}

function mtuLinkLabel(x, y, text, color) {
  return `<text x="${x}" y="${y}" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9" fill="${color || '#3a4060'}" font-weight="600">${text}</text>`;
}

function mtuFirewallNode(x, y, id, active) {
  const c = active ? '#f87171' : '#1e2438';
  const bc = active ? '#f87171' : '#2a3550';
  return `<g id="node-${id}" transform="translate(${x},${y})">
    <rect x="-28" y="-26" width="56" height="52" rx="5" fill="${c}22" stroke="${bc}" stroke-width="${active?2:1.5}"/>
    ${active ? `<rect x="-28" y="-26" width="56" height="52" rx="5" fill="none" stroke="${c}" stroke-width="1.5" opacity="0.5"/>` : ''}
    <rect x="-18" y="-18" width="36" height="10" rx="2" fill="${active?'#f8717133':'#1f2937'}" stroke="${bc}" stroke-width="0.8"/>
    <rect x="-18" y="-4" width="36" height="10" rx="2" fill="${active?'#f8717133':'#1f2937'}" stroke="${bc}" stroke-width="0.8"/>
    <rect x="-18" y="10" width="36" height="10" rx="2" fill="${active?'#f8717133':'#1f2937'}" stroke="${bc}" stroke-width="0.8"/>
    <line x1="-8" y1="-18" x2="-8" y2="20" stroke="${bc}" stroke-width="0.6"/>
    <text x="0" y="36" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" font-weight="700" fill="${active?'#f87171':'#8892b0'}">FIREWALL</text>
    <text x="0" y="46" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="${active?'#f87171':'#5a6080'}">${active?'deny icmp!':''}</text>
  </g>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// PACKET ANIMATION
// ═══════════════════════════════════════════════════════════════════════════
function mtuAnimateStep(stepNum) {
  const s = MTU_STEPS[mtuMode][stepNum - 1];
  if (!s) return;

  const nodes = MTU_NODES[mtuMode];
  const nodeList = Object.keys(nodes);
  const fromIdx = nodeList.indexOf(s.from);
  const toIdx   = nodeList.indexOf(s.to);

  if (fromIdx < 0 || toIdx < 0 || fromIdx === toIdx) {
    mtuFinalizeStep(s); return;
  }

  mtuActiveNodes = [s.from];
  mtuDrawTopo(true);

  // Build waypoints
  const waypoints = [];
  const path = s.via ? [s.from, ...s.via, s.to] : [s.from, s.to];
  for (let i = 0; i < path.length - 1; i++) {
    const fn = nodes[path[i]];
    const tn = nodes[path[i+1]];
    if (fn && tn) waypoints.push({fx:fn.x, fy:fn.y, tx:tn.x, ty:tn.y});
  }

  mtuActiveNodes = path.filter(n => nodes[n]);
  mtuDrawTopo(true);

  let seg = 0;
  const totalSegs = waypoints.length;
  const dur = mtuGetSegDur();

  function animSeg(segIdx) {
    if (segIdx >= totalSegs) { mtuFinalizeStep(s); return; }
    const {fx, fy, tx, ty} = waypoints[segIdx];
    const startT = performance.now();

    function frame(now) {
      const t = Math.min(1, (now - startT) / dur);
      const et = window.easeInOut ? window.easeInOut(t) : t;
      const cx = fx + (tx - fx) * et;
      const cy = fy + (ty - fy) * et;

      const svg = document.getElementById('mtu-svg');
      if (!svg) return;

      // Remove old packet
      const old = svg.getElementById('mtu-pkt');
      if (old) old.remove();

      // Draw packet blob
      const g = document.createElementNS('http://www.w3.org/2000/svg','g');
      g.id = 'mtu-pkt';
      const pktColor = s.pktColor || '#5b9cf6';
      const lines = (s.pktLabel || '').split('\n');

      const pktW = 44, pktH = 30;
      const rect = document.createElementNS('http://www.w3.org/2000/svg','rect');
      rect.setAttribute('x', cx - pktW/2);
      rect.setAttribute('y', cy - pktH/2 - 4);
      rect.setAttribute('width', pktW);
      rect.setAttribute('height', pktH);
      rect.setAttribute('rx', '5');
      rect.setAttribute('fill', pktColor + '22');
      rect.setAttribute('stroke', pktColor);
      rect.setAttribute('stroke-width', '1.5');
      g.appendChild(rect);

      lines.forEach((line, li) => {
        const txt = document.createElementNS('http://www.w3.org/2000/svg','text');
        txt.setAttribute('x', cx);
        txt.setAttribute('y', cy - pktH/2 + 9 + li * 11 - 4);
        txt.setAttribute('text-anchor', 'middle');
        txt.setAttribute('font-family', 'IBM Plex Mono,monospace');
        txt.setAttribute('font-size', '8');
        txt.setAttribute('font-weight', '700');
        txt.setAttribute('fill', pktColor);
        txt.textContent = line;
        g.appendChild(txt);
      });

      svg.appendChild(g);

      if (t < 1) mtuAnimId = requestAnimationFrame(frame);
      else { if (old) old.remove(); animSeg(segIdx + 1); }
    }
    mtuAnimId = requestAnimationFrame(frame);
  }

  animSeg(0);
}

function mtuFinalizeStep(s) {
  mtuActiveNodes = s.activeNodes || [];
  mtuDrawTopo(false);
  mtuUpdateUI();
  mtuUpdateFragBar(s);
}

// ═══════════════════════════════════════════════════════════════════════════
// FRAGMENT BAR
// ═══════════════════════════════════════════════════════════════════════════
function mtuUpdateFragBar(s) {
  const wrap = document.getElementById('mtu-frag-bar-wrap');
  const bar  = document.getElementById('mtu-frag-bar');
  const legend = document.getElementById('mtu-frag-legend');
  if (!wrap || !bar || !legend) return;

  if (!s || !s.fragBar) { wrap.style.display = 'none'; return; }
  wrap.style.display = 'block';

  const fb = s.fragBar;
  if (!fb.frags || fb.frags.length === 0) {
    bar.innerHTML = `<div style="flex:1;display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-size:10px;color:var(--muted);">Original datagram: ${fb.total} bytes — intact</div>`;
    legend.innerHTML = '';
    return;
  }

  const frags = fb.frags;
  const totalPct = frags.reduce((a,f) => a + (f.pct||0), 0);
  const remainPct = Math.max(0, 100 - totalPct);

  let barHTML = frags.map(f => `
    <div style="flex:${f.pct};background:${f.color}33;border-right:2px solid ${f.color};display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-size:9px;font-weight:700;color:${f.color};overflow:hidden;white-space:nowrap;padding:0 4px;">
      ${f.bytes}B
    </div>`).join('');

  if (remainPct > 1 && !fb.complete) {
    barHTML += `<div style="flex:${remainPct};background:rgba(90,96,128,0.1);display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-size:9px;color:var(--muted);">pending…</div>`;
  }
  bar.innerHTML = barHTML;

  legend.innerHTML = frags.map(f =>
    `<div style="display:flex;align-items:center;gap:6px;font-family:var(--mono);font-size:9.5px;color:var(--muted2);">
      <div style="width:10px;height:10px;background:${f.color}44;border:1px solid ${f.color};border-radius:2px;flex-shrink:0;"></div>
      ${f.label}
    </div>`
  ).join('');

  if (fb.complete) {
    setTimeout(() => {
      bar.style.background = 'rgba(74,222,128,0.08)';
      bar.style.border = '1px solid rgba(74,222,128,0.3)';
    }, 200);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP CHAIN (breadcrumb)
// ═══════════════════════════════════════════════════════════════════════════
function mtuUpdateChain(step) {
  const chain = document.getElementById('mtu-chain');
  if (!chain) return;
  const steps = MTU_STEPS[mtuMode];
  let html = '';
  steps.forEach((s, i) => {
    const n = i + 1;
    let cls = 'dns-chain-step';
    if (n < step) cls += ' done';
    else if (n === step) cls += ' active';
    html += `<div class="${cls}">${n}</div>`;
    if (i < steps.length - 1) html += '<div class="dns-chain-arrow">›</div>';
  });
  chain.innerHTML = html;
}

// ═══════════════════════════════════════════════════════════════════════════
// UI UPDATE
// ═══════════════════════════════════════════════════════════════════════════
function mtuUpdateUI() {
  const steps = MTU_STEPS[mtuMode];
  const step  = mtuCurrentStep;
  const numEl = document.getElementById('mtu-step-num');
  const totEl = document.getElementById('mtu-step-total');
  const prog  = document.getElementById('mtu-progress');
  const info  = document.getElementById('mtu-step-info');
  if (numEl) numEl.textContent = step;
  if (totEl) totEl.textContent = steps.length;
  if (prog)  prog.style.width = (step / steps.length * 100) + '%';
  mtuUpdateChain(step);

  if (step === 0) {
    if (info) info.innerHTML = `<div class="step-tag" style="background:rgba(91,156,246,0.12);color:var(--blue)">READY</div>
      <div class="step-title">Select a scenario above and press ▶ Play to begin</div>
      <div class="step-desc">Watch the complete MTU flow step-by-step — packet animation, fragmentation anatomy, and Wireshark-style field breakdown.</div>`;
    const f = document.getElementById('mtu-pkt-fields');
    if (f) f.innerHTML = '<div style="color:var(--muted);font-family:var(--mono);font-size:11px;">Start the animation to see packet field details…</div>';
    return;
  }

  const s = steps[step - 1];
  if (info) info.innerHTML = `<div class="step-tag" style="background:${s.tagBg};color:${s.tagColor}">${s.tag}</div>
    <div class="step-title">${s.title}</div>
    <div class="step-desc">${s.desc}</div>`;

  const fieldsEl = document.getElementById('mtu-pkt-fields');
  if (fieldsEl && s.fields) {
    let html = '<div class="pkt-fields">';
    s.fields.forEach(f => {
      html += `<div class="pkt-field"><div class="pkt-field-key">${f.k}</div><div class="pkt-field-val" style="color:${f.c||'var(--text)'};">${f.v}</div></div>`;
    });
    html += '</div>';
    fieldsEl.innerHTML = html;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PLAYBACK CONTROLS
// ═══════════════════════════════════════════════════════════════════════════
function mtuStep(dir) {
  if (mtuAnimId) { cancelAnimationFrame(mtuAnimId); clearTimeout(mtuAnimId); mtuAnimId = null; }
  const steps = MTU_STEPS[mtuMode];
  const newStep = mtuCurrentStep + dir;
  if (newStep < 0 || newStep > steps.length) return;
  mtuCurrentStep = newStep;
  mtuActiveNodes = [];
  mtuDrawTopo(false);
  mtuUpdateUI();
  if (newStep === 0) mtuUpdateFragBar(null);
  if (newStep > 0) mtuAnimateStep(newStep);
}

function mtuTogglePlay() {
  if (mtuSpeedMode === 'manual') { mtuStep(1); return; }
  mtuPlaying = !mtuPlaying;
  const btn = document.getElementById('mtu-play-btn');
  if (btn) btn.textContent = mtuPlaying ? '⏸ Pause' : '▶ Play';
  if (mtuPlaying) mtuAutoPlay();
  else clearTimeout(mtuPlayTimer);
}

function mtuAutoPlay() {
  if (!mtuPlaying) return;
  const steps = MTU_STEPS[mtuMode];
  if (mtuCurrentStep >= steps.length) {
    mtuPlaying = false;
    const btn = document.getElementById('mtu-play-btn');
    if (btn) btn.textContent = '▶ Play';
    return;
  }
  mtuStep(1);
  mtuPlayTimer = setTimeout(mtuAutoPlay, mtuGetAutoDelay());
}

function mtuReset() {
  mtuPlaying = false;
  clearTimeout(mtuPlayTimer);
  if (mtuAnimId) { cancelAnimationFrame(mtuAnimId); clearTimeout(mtuAnimId); mtuAnimId = null; }
  const btn = document.getElementById('mtu-play-btn');
  if (btn) btn.textContent = '▶ Play';
  mtuCurrentStep = 0;
  mtuActiveNodes = [];
  mtuDrawTopo(false);
  mtuUpdateUI();
  mtuUpdateFragBar(null);
}

// ═══════════════════════════════════════════════════════════════════════════
// SCENARIO SWITCHING
// ═══════════════════════════════════════════════════════════════════════════
function mtuSetMode(mode, tabEl) {
  mtuReset();
  mtuMode = mode;

  // Update tabs
  document.querySelectorAll('#mtu-mode-tabs .mode-tab').forEach(t => t.classList.remove('active'));
  const activeTab = tabEl || document.getElementById('mtutab-' + mode);
  if (activeTab) activeTab.classList.add('active');

  // Update topo label
  const labels = {
    frag:      '🔪 IP FRAGMENTATION — PC-A → Router (egress MTU 1000B) → PC-B',
    pmtud:     '🔍 PATH MTU DISCOVERY — DF=1 Packet + ICMP Type 3 Code 4 Flow',
    blackhole: '⚫ PMTUD BLACK HOLE — Firewall Blocks ICMP → TCP Hangs',
    tunnel:    '🔗 GRE TUNNEL MTU — 24-Byte Overhead + MSS Clamping Fix',
    mtuvsmss:  '⚖️ MTU vs MSS — Layer 3 vs Layer 4 Relationship',
  };
  const lbl = document.getElementById('mtu-topo-label');
  if (lbl) lbl.textContent = labels[mode] || '';

  mtuUpdateUI();
  mtuDrawTopo(false);
}

// ═══════════════════════════════════════════════════════════════════════════
// MTU CALCULATOR
// ═══════════════════════════════════════════════════════════════════════════
function mtuCalcUpdate() {
  const physMTU = parseInt(document.getElementById('mtu-calc-mtu')?.value) || 1500;
  const overhead = parseInt(document.getElementById('mtu-calc-tunnel')?.value) || 0;
  const out = document.getElementById('mtu-calc-out');
  if (!out) return;

  const effMTU = physMTU - overhead;
  const mss    = effMTU - 40; // IP(20) + TCP(20)
  const mssSafe = mss - 12;   // add 12B for options safety margin
  const udpPay  = effMTU - 28; // IP(20) + UDP(8)

  let warn = '';
  if (effMTU < 576) warn = `<div style="color:var(--red);margin-top:4px;">⚠️ Effective MTU ${effMTU}B below IPv4 minimum (576B) — RFC 791</div>`;
  if (effMTU < 1280 && effMTU >= 576) warn = `<div style="color:var(--amber);margin-top:4px;">⚠️ Effective MTU ${effMTU}B below IPv6 minimum (1280B) — RFC 2460</div>`;

  out.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 16px;">
      <div style="color:var(--muted)">Physical / Underlay MTU:</div>  <div style="color:var(--text);font-weight:700;">${physMTU} bytes</div>
      <div style="color:var(--muted)">Tunnel/Encap overhead:</div>    <div style="color:${overhead?'#f87171':'var(--muted2)'};">${overhead} bytes</div>
      <div style="color:var(--cyan)">Effective inner MTU:</div>       <div style="color:var(--cyan);font-weight:700;">${effMTU} bytes</div>
      <div style="color:var(--green)">TCP MSS (optimal):</div>         <div style="color:var(--green);font-weight:700;">${mss} bytes  (MTU − 40B)</div>
      <div style="color:var(--amber)">TCP MSS (safe/clamped):</div>   <div style="color:var(--amber);">${mssSafe} bytes  (MTU − 52B)</div>
      <div style="color:var(--muted)">Max UDP payload:</div>           <div style="color:var(--text);">${udpPay} bytes  (MTU − 28B)</div>
      <div style="color:var(--muted)">Cisco adjust-mss cmd:</div>     <div style="color:var(--cyan);">ip tcp adjust-mss ${mss}</div>
    </div>
    ${warn}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// RESIZE HANDLER
// ═══════════════════════════════════════════════════════════════════════════
function mtuRedraw() {
  if (mtuMode) mtuDrawTopo(false);
}

// ═══════════════════════════════════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════════════════════════════════
function mtuInit() {
  mtuBuildHTML();
  mtuMode = 'frag';
  mtuCurrentStep = 0;
  mtuActiveNodes = [];
  mtuPlaying = false;

  // Reset tab state
  document.querySelectorAll('#mtu-mode-tabs .mode-tab').forEach(t => t.classList.remove('active'));
  const ft = document.getElementById('mtutab-frag');
  if (ft) ft.classList.add('active');

  const lbl = document.getElementById('mtu-topo-label');
  if (lbl) lbl.textContent = '🔪 IP FRAGMENTATION — PC-A → Router (egress MTU 1000B) → PC-B';

  mtuDrawTopo(false);
  mtuUpdateUI();
  mtuUpdateFragBar(null);
  mtuCalcUpdate();

  // Responsive: stack columns on narrow screens
  const body = document.getElementById('mtu-body');
  function checkWidth() {
    if (!body) return;
    body.style.gridTemplateColumns = window.innerWidth < 900 ? '1fr' : '1fr 380px';
  }
  checkWidth();
  window.addEventListener('resize', checkWidth);
}

