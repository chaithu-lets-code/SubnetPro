// ═══════════════════════════════════════════════════════════════════════════
// ICMP / TRACEROUTE DEEP DIVE SIMULATOR
// Coverage: Beginner (CCNA) → TAC Engineer → CCIE Architect Level
// Modes: Ping · Traceroute · PMTUD · ICMP Types Reference
// RFC 792 (ICMPv4) · RFC 1122 · RFC 1191 (PMTUD) · RFC 4821 (PMTUD-II)
// ═══════════════════════════════════════════════════════════════════════════

// ─── SVG Topology Node Positions ─────────────────────────────────────────
const ICMP_NODES = {
    pc:  { x: 75,  y: 155 },
    sw:  { x: 220, y: 155 },
    r1:  { x: 385, y: 155 },
    r2:  { x: 535, y: 155 },
    r3:  { x: 685, y: 155 },
    srv: { x: 840, y: 155 },
  };
  
  // Subnet labels shown between nodes
  const ICMP_LINKS = [
    { a:'pc',  b:'sw',  label:'192.168.1.0/24', y: 175 },
    { a:'sw',  b:'r1',  label:'192.168.1.0/24', y: 175 },
    { a:'r1',  b:'r2',  label:'10.0.12.0/30',   y: 175 },
    { a:'r2',  b:'r3',  label:'10.0.23.0/30',   y: 175 },
    { a:'r3',  b:'srv', label:'10.0.34.0/30',   y: 175 },
  ];
  
  // ─── State ────────────────────────────────────────────────────────────────
  let icmpMode        = 'traceroute'; // 'ping' | 'traceroute' | 'pmtud'
  let icmpCurrentStep = 0;
  let icmpAnimId      = null;
  let icmpPlaying     = false;
  let icmpPlayTimer   = null;
  let icmpActiveNodes = [];
  let icmpSpeedMode   = 'normal';
  let icmpHopResults  = [];   // traceroute hop table rows
  
  // ─── Speed helpers ────────────────────────────────────────────────────────
  function icmpGetSegDur()    { return { slow:2200, normal:1100, fast:480 }[icmpSpeedMode]; }
  function icmpGetAutoDelay() { return { slow:5200, normal:2600, fast:1100 }[icmpSpeedMode]; }
  
  function icmpSetSpeed(s) {
    icmpSpeedMode = s;
    ['slow','normal','fast'].forEach(x => {
      const el = document.getElementById('icmp-speed-' + x);
      if (el) el.classList.toggle('active', x === s);
    });
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // STEP DATA — 3 MODES
  // Each step: beginner, tac, and ccie knowledge tiers baked into desc / fields
  // ═══════════════════════════════════════════════════════════════════════════
  
  // ─── MODE 1: PING ─────────────────────────────────────────────────────────
  const ICMP_PING_STEPS = [
    {
      step:1,
      title:'Step 1 — Host Issues ICMP Echo Request (Type 8, Code 0)',
      tag:'ECHO REQUEST', tagColor:'var(--blue)', tagBg:'rgba(91,156,246,0.12)',
      desc:`<strong>🟦 Beginner:</strong> When you run <code>ping 10.0.34.10</code>, your OS builds an ICMP Echo Request. This is a simple "are you there?" message. The destination host is expected to reply immediately.<br><br>
  <strong>🟨 TAC Engineer:</strong> The ICMP header (8 bytes) sits directly inside the IP packet (Protocol=1). Fields: Type=8, Code=0, Checksum (one's complement), Identifier (process/session ID), Sequence Number (increments per ping). The IP TTL is set by the OS — Linux defaults to 64, Cisco IOS to 255, Windows to 128.<br><br>
  <strong>🔴 CCIE Architect:</strong> In Cisco IOS, <em>self-generated</em> ICMP Echo Requests (from the router itself) are process-switched — they go through the IP process, not CEF. Packets <em>transiting</em> the router with ICMP are CEF-switched via the FIB adjacency table. Use <code>ip icmp rate-limit unreachable [ms]</code> to throttle generated ICMP. Extended ping (<code>ping [ip] repeat 1000 size 1472 df-bit source lo0</code>) is the TAC/CCIE workhorse.`,
      path:['pc','sw','r1','r2','r3','srv'], dir:'fwd',
      pktColor:'#5b9cf6', pktLabel:'Type 8\nEcho?',
      fields:[
        {k:'ICMP Type',   v:'8 (Echo Request)',           c:'#5b9cf6'},
        {k:'ICMP Code',   v:'0',                          c:'#8892b0'},
        {k:'Identifier',  v:'0x1A2B  (OS process ID)'},
        {k:'Sequence',    v:'1  (increments each ping)'},
        {k:'Checksum',    v:'One\'s complement of ICMP hdr'},
        {k:'IP Protocol', v:'1  (ICMP — no UDP/TCP)',    c:'#fbbf24'},
        {k:'IP TTL',      v:'64  (Linux default)'},
        {k:'Src IP',      v:'192.168.1.10  (PC)'},
        {k:'Dst IP',      v:'10.0.34.10  (Server)'},
        {k:'DF Bit',      v:'0  (fragmentation allowed)'},
        {k:'Pkt Size',    v:'84 bytes  (20 IP + 8 ICMP + 56 data)'},
        {k:'Cisco Cmd',   v:'ping 10.0.34.10 repeat 5', c:'#38d9c0'},
      ],
      wsOptions:[
        {num:'IP',   name:'Protocol',         val:'0x01 (ICMP)'},
        {num:'IP',   name:'TTL',              val:'64'},
        {num:'ICMP', name:'Type',             val:'8 (Echo Request)'},
        {num:'ICMP', name:'Code',             val:'0'},
        {num:'ICMP', name:'Checksum',         val:'0x4d57 (valid)'},
        {num:'ICMP', name:'Identifier (BE)',  val:'0x1a2b'},
        {num:'ICMP', name:'Sequence (BE)',    val:'0x0001'},
        {num:'Data', name:'Payload',          val:'abcdefghijklmnopqrstuvwxyz... (56 bytes)'},
      ],
      chain:1, totalChain:4,
      hopResultRow: null,
    },
    {
      step:2,
      title:'Step 2 — Routers Forward Packet; TTL Decrements at Each Hop',
      tag:'TRANSIT', tagColor:'var(--amber)', tagBg:'rgba(251,191,36,0.12)',
      desc:`<strong>🟦 Beginner:</strong> Each router along the path reduces the TTL by 1 before forwarding the packet. This prevents packets from looping forever. R1: TTL 64→63, R2: 63→62, R3: 62→61. If TTL reaches 0 a router discards the packet and sends ICMP Time Exceeded back — that's how <strong>traceroute</strong> works!<br><br>
  <strong>🟨 TAC Engineer:</strong> TTL decrement happens at L3 forwarding <em>before</em> the packet leaves the interface. On Cisco IOS, the CEF adjacency contains the pre-built L2 header. The FIB lookup determines next-hop, the adjacency stamps the new MAC header + decrements TTL + recalculates IP checksum. Verify with: <code>show ip cef 10.0.34.10 detail</code>, <code>show adjacency Gi0/1 detail</code>.<br><br>
  <strong>🔴 CCIE Architect:</strong> TTL scope matters in MPLS — when an IP packet enters an LSP, the IP TTL is copied into the MPLS TTL shim (default; can disable with <code>no mpls ip propagate-ttl</code> to hide core hops from traceroute). With Uniform Mode, TTL propagates end-to-end. With Pipe Mode, core hops are invisible. Also: CEF switching paths — process switch (software), fast switch (route cache, legacy), CEF (hardware FIB) — each has different TTL handling and performance implications.`,
      path:['pc','sw','r1','r2','r3','srv'], dir:'fwd',
      pktColor:'#fbbf24', pktLabel:'TTL 64\n→→→',
      fields:[
        {k:'At R1',       v:'TTL 64 → 63, checksum recalc',  c:'#fbbf24'},
        {k:'At R2',       v:'TTL 63 → 62, checksum recalc'},
        {k:'At R3',       v:'TTL 62 → 61, checksum recalc'},
        {k:'FIB Lookup',  v:'show ip cef 10.0.34.10 detail', c:'#38d9c0'},
        {k:'Adjacency',   v:'show adjacency Gi0/1 detail'},
        {k:'CEF Path',    v:'Hardware FIB → adjacency'},
        {k:'MPLS Note',   v:'TTL copied into MPLS shim label', c:'#a78bfa'},
        {k:'Pipe Mode',   v:'Hides core hops from traceroute'},
        {k:'IOS Debug',   v:'debug ip packet [acl] (careful!)'},
        {k:'Wireshark',   v:'ip.ttl < 10 to spot low-TTL pkts'},
      ],
      wsOptions:[
        {num:'IP',   name:'TTL at R1 egress',  val:'63'},
        {num:'IP',   name:'TTL at R2 egress',  val:'62'},
        {num:'IP',   name:'TTL at R3 egress',  val:'61'},
        {num:'IP',   name:'Checksum',          val:'Recalculated at every hop'},
        {num:'CEF',  name:'FIB entry',         val:'10.0.34.0/30 → GigE0/1'},
        {num:'CEF',  name:'Adjacency',         val:'MAC: aabb.cc00.0102 (pre-built)'},
      ],
      chain:2, totalChain:4,
      hopResultRow: null,
    },
    {
      step:3,
      title:'Step 3 — Server Receives Echo Request → Sends Echo Reply (Type 0)',
      tag:'ECHO REPLY', tagColor:'var(--green)', tagBg:'rgba(74,222,128,0.12)',
      desc:`<strong>🟦 Beginner:</strong> The server receives the Echo Request. It swaps source and destination IPs, changes Type 8 → 0 (Echo Reply), recalculates the checksum, and sends it back. The payload data is copied unchanged. This entire exchange proves two-way reachability.<br><br>
  <strong>🟨 TAC Engineer:</strong> The server copies the Identifier and Sequence Number from the request into the reply — this is how the sender matches replies to requests (multiple pings running simultaneously have different Identifiers). The OS ping command uses RTT (Round Trip Time) measured from send to receive. <code>show ip traffic</code> on Cisco shows ICMP echo/reply counts. Watch for <code>icmp rate-limited unreachable</code> — routers suppress ICMP to prevent CPU exhaustion.<br><br>
  <strong>🔴 CCIE Architect:</strong> ICMP Echo is used by IP SLA for probing: <code>ip sla 1 / icmp-echo 10.0.34.10 source-ip 192.168.1.10 / threshold 200 / frequency 10</code>. IP SLA results feed into <strong>Enhanced Object Tracking</strong> (EOT) to trigger route failover or HSRP state changes. Cisco ASA by default does NOT reply to ICMP unless <code>icmp permit any any echo-reply</code> is configured on the interface — common TAC issue. Also: ICMP "black holes" from stateful firewalls that allow Echo but block Reply on return path.`,
      path:['srv','r3','r2','r1','sw','pc'], dir:'fwd',
      pktColor:'#4ade80', pktLabel:'Type 0\nPong!',
      fields:[
        {k:'ICMP Type',   v:'0  (Echo Reply)',             c:'#4ade80'},
        {k:'ICMP Code',   v:'0'},
        {k:'Identifier',  v:'0x1A2B  (copied from request)'},
        {k:'Sequence',    v:'1  (copied from request)'},
        {k:'Src IP',      v:'10.0.34.10  (Server)'},
        {k:'Dst IP',      v:'192.168.1.10  (PC)'},
        {k:'TTL',         v:'64  (new TTL from server)'},
        {k:'IP SLA',      v:'ip sla 1 icmp-echo 10.0.34.10', c:'#38d9c0'},
        {k:'ASA Rule',    v:'icmp permit any any echo-reply', c:'#f87171'},
        {k:'show cmd',    v:'show ip traffic (ICMP stats)'},
      ],
      wsOptions:[
        {num:'IP',   name:'Src → Dst',       val:'10.0.34.10 → 192.168.1.10'},
        {num:'IP',   name:'Protocol',         val:'0x01 (ICMP)'},
        {num:'IP',   name:'TTL',              val:'64 (fresh from server)'},
        {num:'ICMP', name:'Type',             val:'0 (Echo Reply)'},
        {num:'ICMP', name:'Code',             val:'0'},
        {num:'ICMP', name:'Identifier',       val:'0x1a2b (matches request!)'},
        {num:'ICMP', name:'Sequence',         val:'0x0001 (matches request!)'},
        {num:'Data', name:'Payload',          val:'abcdefghij... (copied verbatim)'},
      ],
      chain:3, totalChain:4,
      hopResultRow: null,
    },
    {
      step:4,
      title:'Step 4 — PC Receives Echo Reply — Ping SUCCESS! 🎉',
      tag:'SUCCESS ✓', tagColor:'var(--cyan)', tagBg:'rgba(56,217,192,0.12)',
      desc:`<strong>🟦 Beginner:</strong> The PC receives the Echo Reply and displays: <code>64 bytes from 10.0.34.10: icmp_seq=1 ttl=61 time=4.2 ms</code>. The TTL shown is the received TTL (61 = 64-3 hops). RTT is measured from send to receive.<br><br>
  <strong>🟨 TAC Engineer:</strong> Success means bidirectional IP reachability AND ICMP processing at the destination. Ping failure modes: (1) No route to host → ICMP Destination Unreachable Type 3. (2) ACL blocking → silent drop or ICMP Unreachable depending on ACL config. (3) Firewall blocking return path → Echo sent, Reply blocked, ping times out. (4) MTU issue → ping passes small but fails at 1500. Always test with <code>ping size 1472 df-bit</code> to verify PMTUD path.<br><br>
  <strong>🔴 CCIE Architect:</strong> Extended ping options: <code>repeat</code>, <code>timeout</code>, <code>source [ip|interface]</code>, <code>type-of-service</code>, <code>df-bit</code>, <code>validate</code>, <code>sweep</code>. Sweep mode (<code>sweep-range start-size end-size step</code>) finds MTU black holes. For asymmetric routing analysis, ping from a specific source: <code>ping 10.0.34.10 source 192.168.1.10 repeat 100 timeout 2</code>. ICMP-based IP SLA with EOT enables sub-second failover without BGP reconvergence.`,
      path:['srv','r3','r2','r1','sw','pc'], dir:'fwd',
      pktColor:'#38d9c0', pktLabel:'RTT\n4.2ms',
      fields:[
        {k:'Result',      v:'Success — bidirectional reachable', c:'#4ade80'},
        {k:'RTT',         v:'4.2 ms  (round-trip time)'},
        {k:'Received TTL',v:'61  (64 - 3 hops)'},
        {k:'Loss',        v:'0%  (1/1 packets)'},
        {k:'Ext Ping',    v:'ping ip repeat 100 size 1472 df-bit', c:'#38d9c0'},
        {k:'Sweep',       v:'sweep-range 100 1500 100 (find MTU)'},
        {k:'IP SLA',      v:'ip sla 1 → track → ip route failover', c:'#a78bfa'},
        {k:'Failure Mode',v:'ACL drop? Firewall? No route?', c:'#f87171'},
      ],
      wsOptions:[
        {num:'Linux',  name:'Output',           val:'64 bytes from 10.0.34.10: icmp_seq=1 ttl=61 time=4.2ms'},
        {num:'Win',    name:'Output',           val:'Reply from 10.0.34.10: bytes=32 time=4ms TTL=61'},
        {num:'IOS',    name:'ping result',      val:'Success rate 100% (5/5), round-trip min/avg/max=2/4/6 ms'},
        {num:'Debug',  name:'show ip traffic',  val:'Rcvd: 1 echo, 1 echo reply'},
      ],
      chain:4, totalChain:4,
      hopResultRow: null,
    },
  ];
  
  // ─── MODE 2: TRACEROUTE ───────────────────────────────────────────────────
  const ICMP_TRACEROUTE_STEPS = [
    {
      step:1,
      title:'Step 1 — Probe 1 Sent: UDP/ICMP Probe with TTL=1',
      tag:'TTL=1 PROBE', tagColor:'#fbbf24', tagBg:'rgba(251,191,36,0.12)',
      desc:`<strong>🟦 Beginner:</strong> Traceroute deliberately sends packets with TTL=1. When R1 receives this, TTL decrements to 0 — the router cannot forward it. R1 drops the packet and sends back <strong>ICMP Time Exceeded (Type 11)</strong> from its incoming interface IP. This reveals Hop 1's IP address!<br><br>
  <strong>🟨 TAC Engineer:</strong> Unix/Linux traceroute uses <strong>UDP</strong> probes (ports 33434–33534). Windows tracert uses <strong>ICMP Echo Requests</strong>. Cisco IOS traceroute also uses UDP by default (can change to ICMP with <code>traceroute ip 10.0.34.10 probe 3</code>). Three probes per TTL measure RTT variance. A <code>* * *</code> (asterisk) means the ICMP Time Exceeded reply was blocked or the router has ICMP rate limiting.<br><br>
  <strong>🔴 CCIE Architect:</strong> Traceroute is blocked by ACLs that drop inbound ICMP Time Exceeded (many security policies block all ICMP). Also: some devices rate-limit ICMP generation — Cisco default is 500ms between unreachables (<code>ip icmp rate-limit unreachable 500</code>). In MPLS networks, traceroute shows LSR hops only if TTL propagation is enabled. <strong>MPLS LSP ping/traceroute</strong> (<code>ping mpls ipv4 10.0.34.10/32 repeat 5</code>) tests the LSP dataplane separately from the IP plane. CEF load-balancing can cause asymmetric trace paths — use <code>traceroute ip [ip] source [src] numeric</code> with fixed source to get consistent paths.`,
      path:['pc','sw','r1'], dir:'fwd',
      pktColor:'#fbbf24', pktLabel:'TTL=1\nUDP',
      fields:[
        {k:'Method (Unix)',   v:'UDP port 33434  (default)',      c:'#fbbf24'},
        {k:'Method (Win)',    v:'ICMP Echo Request Type 8'},
        {k:'Method (IOS)',    v:'UDP  (or icmp with -P icmp)'},
        {k:'Probes/Hop',      v:'3 probes  (default)'},
        {k:'TTL in packet',   v:'1  (deliberately low!)'},
        {k:'At R1',           v:'TTL 1 → 0 → DROP → ICMP reply',  c:'#f87171'},
        {k:'Rate Limit',      v:'ip icmp rate-limit unreachable 500ms'},
        {k:'MPLS Trace',      v:'ping mpls ipv4 10.0.34.10/32',   c:'#a78bfa'},
      ],
      wsOptions:[
        {num:'IP',   name:'Src → Dst',        val:'192.168.1.10 → 10.0.34.10'},
        {num:'IP',   name:'TTL',              val:'1  ← key field!'},
        {num:'IP',   name:'Protocol',         val:'0x11 (UDP)'},
        {num:'UDP',  name:'Src Port',         val:'49152  (random ephemeral)'},
        {num:'UDP',  name:'Dst Port',         val:'33434  (traceroute port)'},
        {num:'ICMP', name:'Action at R1',     val:'DROP + generate Time Exceeded'},
      ],
      chain:1, totalChain:8,
      hopResultRow:{hop:1, ip:'?', rtts:['—','—','—'], status:'probing'},
    },
    {
      step:2,
      title:'Step 2 — R1 Sends ICMP Time Exceeded (Type 11, Code 0) → PC',
      tag:'HOP 1 FOUND', tagColor:'#f87171', tagBg:'rgba(248,113,113,0.12)',
      desc:`<strong>🟦 Beginner:</strong> R1's IP on the LAN side is 192.168.1.1. It sends ICMP Type 11 (Time Exceeded) back to the PC. The ICMP packet includes the original IP header + first 8 bytes of the original payload — this lets the sender know which probe triggered it.<br><br>
  <strong>🟨 TAC Engineer:</strong> The ICMP Time Exceeded message is sourced from the <strong>incoming interface</strong> of the router (the interface that received the TTL=0 packet). This is why traceroute reveals router interface IPs, not loopbacks. R1's LAN interface IP is 192.168.1.1. The embedded original IP header helps the traceroute process match responses to the correct probe (via identifier/port in the embedded UDP header). RTT is measured from probe send to ICMP receipt.<br><br>
  <strong>🔴 CCIE Architect:</strong> The source IP of the ICMP Time Exceeded can be controlled on Cisco: <code>ip icmp source [ip]</code> makes all ICMP use a loopback — useful for management/NMS correlation. Without this, NMS tools may not map the ICMP source to a managed device. Also: <strong>ICMP Time Exceeded Code 1</strong> (vs Code 0) means "Fragment Reassembly Time Exceeded" — a different scenario where IP fragments don't all arrive within the reassembly timer.`,
      path:['r1','sw','pc'], dir:'fwd',
      pktColor:'#f87171', pktLabel:'Type11\n10.0.12.1',
      fields:[
        {k:'ICMP Type',    v:'11  (Time Exceeded)',            c:'#f87171'},
        {k:'ICMP Code',    v:'0  (TTL exceeded in transit)'},
        {k:'Code 1 means', v:'Fragment reassembly timeout'},
        {k:'Src IP',       v:'192.168.1.1  (R1 incoming iface)'},
        {k:'Dst IP',       v:'192.168.1.10  (PC)'},
        {k:'Embedded',     v:'Original IP hdr + first 8 bytes'},
        {k:'Hop 1 Result', v:'192.168.1.1  RTT ~1.2ms',        c:'#4ade80'},
        {k:'IOS Cmd',      v:'ip icmp source Loopback0',        c:'#38d9c0'},
        {k:'Wireshark',    v:'icmp.type==11  (filter)'},
      ],
      wsOptions:[
        {num:'IP',     name:'Src → Dst',        val:'192.168.1.1 → 192.168.1.10'},
        {num:'IP',     name:'Protocol',          val:'0x01 (ICMP)'},
        {num:'ICMP',   name:'Type',              val:'11 (Time Exceeded)'},
        {num:'ICMP',   name:'Code',              val:'0 (TTL exceeded in transit)'},
        {num:'ICMP',   name:'Embedded IP hdr',  val:'Src:192.168.1.10 Dst:10.0.34.10 TTL:0'},
        {num:'ICMP',   name:'Embedded UDP',     val:'Sport:49152 Dport:33434 (8 bytes)'},
      ],
      chain:2, totalChain:8,
      hopResultRow:{hop:1, ip:'192.168.1.1', rtts:['1.2ms','1.3ms','1.1ms'], status:'done'},
    },
    {
      step:3,
      title:'Step 3 — Probe 2 Sent: TTL=2 — Passes R1, Expires at R2',
      tag:'TTL=2 PROBE', tagColor:'#fbbf24', tagBg:'rgba(251,191,36,0.12)',
      desc:`<strong>🟦 Beginner:</strong> Now traceroute sends TTL=2. R1 decrements TTL to 1 and forwards it. R2 receives it with TTL=1, decrements to 0, drops it, and sends ICMP Time Exceeded back. Hop 2 is discovered!<br><br>
  <strong>🟨 TAC Engineer:</strong> R1 forwards because after decrement, TTL=1 (not zero). R2 drops because TTL would go to 0. The ICMP reply from R2 comes from R2's incoming interface: 10.0.12.2 (the interface facing R1). The traceroute process on the PC listens for the ICMP Time Exceeded and matches it to probe 2 via the embedded original packet header.<br><br>
  <strong>🔴 CCIE Architect:</strong> In load-balanced environments (ECMP, CEF per-flow or per-packet), consecutive traceroute probes may take different paths, showing different intermediate IPs or RTT variations. This is normal but confusing. Use <code>traceroute ip [ip] source [ip] numeric port [port]</code> with a fixed source port to pin the flow to one hash bucket. <strong>CEF load balancing hash</strong>: default is src-dst IP based — adding L4 ports changes the hash. <code>show ip cef exact-route [src] [dst]</code> shows the exact path for a given flow.`,
      path:['pc','sw','r1','r2'], dir:'fwd',
      pktColor:'#fbbf24', pktLabel:'TTL=2\nUDP',
      fields:[
        {k:'TTL sent',     v:'2'},
        {k:'At R1',        v:'TTL 2→1, forward to R2'},
        {k:'At R2',        v:'TTL 1→0, DROP → ICMP reply',    c:'#f87171'},
        {k:'R2 src IP',    v:'10.0.12.2  (incoming interface)'},
        {k:'ECMP Issue',   v:'Probes may take different paths!',c:'#fbbf24'},
        {k:'Fix ECMP',     v:'Use fixed src-port to pin flow'},
        {k:'CEF cmd',      v:'show ip cef exact-route [src] [dst]', c:'#38d9c0'},
      ],
      wsOptions:[
        {num:'IP',  name:'TTL',         val:'2'},
        {num:'IP',  name:'Protocol',    val:'0x11 (UDP)'},
        {num:'R1',  name:'Action',      val:'TTL→1, forward'},
        {num:'R2',  name:'Action',      val:'TTL→0, DROP + ICMP Type 11'},
      ],
      chain:3, totalChain:8,
      hopResultRow:{hop:2, ip:'?', rtts:['—','—','—'], status:'probing'},
    },
    {
      step:4,
      title:'Step 4 — R2 Sends ICMP Time Exceeded → PC (Hop 2 Found)',
      tag:'HOP 2 FOUND', tagColor:'#f87171', tagBg:'rgba(248,113,113,0.12)',
      desc:`<strong>🟦 Beginner:</strong> R2 at IP 10.0.12.2 sends ICMP Type 11 back to PC. The traceroute output now shows Hop 2's IP and RTT. The RTT includes travel to R2 and back — noticeably higher than Hop 1 since it's a WAN link.<br><br>
  <strong>🟨 TAC Engineer:</strong> RTT differences between hops reveal WAN link latency. If Hop 2 RTT is 50ms but Hop 3 RTT is also 50ms, the link between R2 and R3 adds 0ms (or R3 has ICMP rate limiting). If you see <code>* * *</code> for a hop but subsequent hops respond, it means that specific router blocks ICMP Time Exceeded but still forwards traffic. This is common with ISP core routers. The path still works — only the ICMP echo for that hop is blocked.<br><br>
  <strong>🔴 CCIE Architect:</strong> Latency spikes in traceroute don't always indicate congestion — ICMP processing is often done in software/process-switch even on CEF routers, meaning transit ICMP Time Exceeded may be rate-limited or delayed by CPU load. <strong>Don't diagnose congestion from traceroute RTT alone</strong> — use IP SLA with UDP-jitter for accurate measurements. Also: <code>traceroute mpls multipath ipv4 [prefix] [mask]</code> discovers all MPLS paths simultaneously (ECMP-aware MPLS trace).`,
      path:['r2','r1','sw','pc'], dir:'fwd',
      pktColor:'#f87171', pktLabel:'Type11\n10.0.12.2',
      fields:[
        {k:'ICMP Type',   v:'11  (Time Exceeded)',             c:'#f87171'},
        {k:'Src IP',      v:'10.0.12.2  (R2 incoming iface)'},
        {k:'Hop 2 RTT',   v:'~12ms  (WAN link latency)'},
        {k:'* * * means', v:'ICMP blocked, but traffic flows!', c:'#fbbf24'},
        {k:'ISP Practice',v:'Core routers often block ICMP gen'},
        {k:'IP SLA',      v:'udp-jitter for accurate latency',  c:'#38d9c0'},
        {k:'MPLS Trace',  v:'traceroute mpls multipath ipv4',  c:'#a78bfa'},
      ],
      wsOptions:[
        {num:'IP',   name:'Src → Dst',     val:'10.0.12.2 → 192.168.1.10'},
        {num:'ICMP', name:'Type',          val:'11 (Time Exceeded)'},
        {num:'ICMP', name:'Code',          val:'0'},
        {num:'Note', name:'* * * case',    val:'Router blocks ICMP, forwards data fine'},
      ],
      chain:4, totalChain:8,
      hopResultRow:{hop:2, ip:'10.0.12.2', rtts:['12ms','11ms','13ms'], status:'done'},
    },
    {
      step:5,
      title:'Step 5 — Probe 3 Sent: TTL=3 — Passes R1+R2, Expires at R3',
      tag:'TTL=3 PROBE', tagColor:'#fbbf24', tagBg:'rgba(251,191,36,0.12)',
      desc:`<strong>🟦 Beginner:</strong> With TTL=3, the probe passes R1 (TTL→2), then R2 (TTL→1), then arrives at R3 with TTL=1. R3 decrements to 0 and drops it, sending ICMP Type 11 back. Hop 3 discovered!<br><br>
  <strong>🟨 TAC Engineer:</strong> The R2→R3 link uses network 10.0.23.0/30. R3's incoming interface on this link is 10.0.23.2. Note: Each router replies from the <em>incoming</em> interface (not outgoing) — an important distinction for ACL troubleshooting. The probe traverses: PC (TTL=3) → R1 (TTL=2) → R2 (TTL=1) → R3 (TTL=0 → DROP → ICMP).<br><br>
  <strong>🔴 CCIE Architect:</strong> Policy-based routing (PBR) and VRF routing can make traceroute show unexpected paths — the probe follows the PBR policy or the VRF table, which may differ from the global routing table. When debugging: <code>debug ip policy</code> shows PBR decisions. Also: source-routed packets (IP options) are process-switched in IOS — a security risk (disable with <code>no ip source-route</code>). Loose Source Routing (LSR) and Strict Source Routing (SSR) ICMP options can be used for path exploration but are blocked by most modern devices.`,
      path:['pc','sw','r1','r2','r3'], dir:'fwd',
      pktColor:'#fbbf24', pktLabel:'TTL=3\nUDP',
      fields:[
        {k:'TTL sent',    v:'3'},
        {k:'At R1',       v:'TTL 3→2, forward'},
        {k:'At R2',       v:'TTL 2→1, forward'},
        {k:'At R3',       v:'TTL 1→0, DROP → ICMP Type 11',   c:'#f87171'},
        {k:'R3 interface',v:'10.0.23.2  (toward R2)'},
        {k:'PBR risk',    v:'PBR may alter trace path',         c:'#fbbf24'},
        {k:'VRF risk',    v:'VRF routing table may differ'},
        {k:'IOS cmd',     v:'debug ip policy  (PBR decisions)', c:'#38d9c0'},
      ],
      wsOptions:[
        {num:'IP', name:'TTL', val:'3'},
        {num:'R1', name:'Action', val:'TTL→2, forward'},
        {num:'R2', name:'Action', val:'TTL→1, forward'},
        {num:'R3', name:'Action', val:'TTL→0, DROP + ICMP Type 11 Code 0'},
      ],
      chain:5, totalChain:8,
      hopResultRow:{hop:3, ip:'?', rtts:['—','—','—'], status:'probing'},
    },
    {
      step:6,
      title:'Step 6 — R3 Sends ICMP Time Exceeded → PC (Hop 3 Found)',
      tag:'HOP 3 FOUND', tagColor:'#f87171', tagBg:'rgba(248,113,113,0.12)',
      desc:`<strong>🟦 Beginner:</strong> R3 replies from 10.0.23.2. RTT increases again (more hops = more latency). The traceroute output now shows 3 hops discovered. One more probe with TTL=4 will reach the destination server.<br><br>
  <strong>🟨 TAC Engineer:</strong> RTT to R3 might show asymmetric latency if the return path differs (asymmetric routing). Note that Hop 3 RTT includes: time to R3 (forward) + time for ICMP reply (reverse). If reverse path goes through different routers with different latency, RTT doesn't purely reflect forward path delay. For asymmetric routing detection: compare traceroute from both ends, or use IP SLA with UDP echo and <code>rtt-threshold</code> alarms.<br><br>
  <strong>🔴 CCIE Architect:</strong> At scale (ISP/DC), traceroute data is collected via <strong>iPerf + TWAMP (Two-Way Active Measurement Protocol, RFC 5357)</strong> for accurate OWD (one-way delay) measurements. TWAMP requires clock synchronization (NTP/PTP). For MPLS, <strong>RFC 4379 MPLS LSP Ping</strong> uses a UDP echo request with a special IP header (127.0.0.0/8 destination, Router Alert option) to test the LSP dataplane without relying on control plane routing.`,
      path:['r3','r2','r1','sw','pc'], dir:'fwd',
      pktColor:'#f87171', pktLabel:'Type11\n10.0.23.2',
      fields:[
        {k:'ICMP Type',   v:'11  (Time Exceeded)',              c:'#f87171'},
        {k:'Src IP',      v:'10.0.23.2  (R3 incoming iface)'},
        {k:'Hop 3 RTT',   v:'~25ms'},
        {k:'Asym Risk',   v:'Return path may differ!',          c:'#fbbf24'},
        {k:'TWAMP',       v:'RFC 5357 — one-way delay measure'},
        {k:'MPLS LSP',    v:'RFC 4379 — test LSP dataplane',   c:'#a78bfa'},
        {k:'NTP Req',     v:'PTP/NTP needed for OWD accuracy'},
      ],
      wsOptions:[
        {num:'IP',   name:'Src → Dst',   val:'10.0.23.2 → 192.168.1.10'},
        {num:'ICMP', name:'Type',        val:'11 (Time Exceeded)'},
        {num:'ICMP', name:'Embedded hdr',val:'Original probe IP header + UDP'},
      ],
      chain:6, totalChain:8,
      hopResultRow:{hop:3, ip:'10.0.23.2', rtts:['25ms','24ms','26ms'], status:'done'},
    },
    {
      step:7,
      title:'Step 7 — Final Probe: TTL=4 Reaches Destination Server',
      tag:'TTL=4 PROBE', tagColor:'#4ade80', tagBg:'rgba(74,222,128,0.12)',
      desc:`<strong>🟦 Beginner:</strong> Now TTL=4 — enough to traverse all 3 routers and reach the server. The probe arrives at the server with TTL=1. The server doesn't decrement TTL (it's the destination) — it processes the packet. Since it's a UDP probe to an unused high port (33434), the server replies with <strong>ICMP Port Unreachable (Type 3, Code 3)</strong>.<br><br>
  <strong>🟨 TAC Engineer:</strong> The ICMP Port Unreachable response from the server is what signals <em>trace complete</em>! The traceroute process sees Port Unreachable = "destination reached." Windows tracert works differently: it sends ICMP Echo Requests, so the final response is ICMP Echo Reply instead. Both methods achieve the same goal. Common TAC issue: destination server firewall drops UDP to port 33434 → traceroute shows <code>* * *</code> at the final hop even though the host is reachable via other ports.<br><br>
  <strong>🔴 CCIE Architect:</strong> <strong>ICMP Destination Unreachable (Type 3)</strong> has 16 codes covering all "can't deliver" scenarios: Code 0 (Net Unreach), Code 1 (Host Unreach), Code 2 (Protocol Unreach), Code 3 (Port Unreach), Code 4 (Frag Needed — PMTUD!), Code 5 (Source Route Failed), Code 9/10 (Admin Prohibited — ACL reject), Code 13 (Communication Administratively Prohibited — ASA). Cisco ACL with <code>deny ... log</code> generates ICMP Code 13. With <code>no ip unreachable</code> on interface, all ICMP Unreachable messages are suppressed — useful to hide topology but breaks PMTUD (type 4) — a common production misconfiguration.`,
      path:['pc','sw','r1','r2','r3','srv'], dir:'fwd',
      pktColor:'#4ade80', pktLabel:'TTL=4\n→ Dest!',
      fields:[
        {k:'TTL sent',    v:'4  (survives all 3 routers)'},
        {k:'At Server',   v:'TTL=1, but server is DEST → process!'},
        {k:'Server resp', v:'ICMP Type 3 Code 3 (Port Unreachable)', c:'#f87171'},
        {k:'Why Type 3?', v:'UDP probe hits closed port 33434'},
        {k:'Win tracert', v:'Uses ICMP Echo → gets Echo Reply'},
        {k:'Firewall issue',v:'Blocks UDP 33434 → * at last hop', c:'#fbbf24'},
        {k:'Type 3 codes', v:'Code 4=PMTUD, Code 9/10=ACL deny',  c:'#a78bfa'},
        {k:'IOS cmd',      v:'no ip unreachable → breaks PMTUD!',  c:'#f87171'},
      ],
      wsOptions:[
        {num:'IP',  name:'TTL at server',  val:'1 (just enough!)'},
        {num:'IP',  name:'Protocol',       val:'0x11 (UDP)'},
        {num:'UDP', name:'Dst Port',       val:'33434 (closed port)'},
        {num:'Srvr',name:'Action',         val:'ICMP Type 3 Code 3 (Port Unreachable)'},
      ],
      chain:7, totalChain:8,
      hopResultRow:{hop:4, ip:'?', rtts:['—','—','—'], status:'probing'},
    },
    {
      step:8,
      title:'Step 8 — Server Sends ICMP Port Unreachable → Trace Complete! 🎉',
      tag:'TRACE DONE ✓', tagColor:'var(--cyan)', tagBg:'rgba(56,217,192,0.12)',
      desc:`<strong>🟦 Beginner:</strong> The server (10.0.34.10) sends ICMP Type 3 Code 3 (Port Unreachable). When traceroute receives this, it knows the destination has been reached — traceroute is complete! Output shows all 4 hops with RTT times.<br><br>
  <strong>🟨 TAC Engineer:</strong> Full traceroute output:<br><code>1  192.168.1.1   1.2ms  1.3ms  1.1ms</code><br><code>2  10.0.12.2    12ms  11ms  13ms</code><br><code>3  10.0.23.2    25ms  24ms  26ms</code><br><code>4  10.0.34.10   30ms  29ms  31ms</code><br>The RTT progression shows approximately 1ms LAN + 11ms per WAN hop + 5ms server processing. Verify with: <code>show interfaces [iface] | include RTT</code>, or Cisco's IP SLA for ongoing RTT tracking.<br><br>
  <strong>🔴 CCIE Architect:</strong> Traceroute interpretation matrix: (1) Consistent RTT increase per hop = expected latency accumulation. (2) Sudden RTT spike at one hop = congestion or policing on that segment. (3) RTT drops after a high hop = ICMP deprioritization (management plane rate-limit) — traffic still flows fine. (4) All hops after a point show <code>*</code> = the network beyond that router is unreachable OR all ICMP is blocked. (5) Asymmetric hops = ECMP in either forward or return direction. (6) Same IP repeated = routing loop. (7) RFC 1918 IPs visible = NAT not applied, or traceroute is inside private space.`,
      path:['srv','r3','r2','r1','sw','pc'], dir:'fwd',
      pktColor:'#38d9c0', pktLabel:'Type3\nPort!',
      fields:[
        {k:'ICMP Type',    v:'3  (Destination Unreachable)',    c:'#38d9c0'},
        {k:'ICMP Code',    v:'3  (Port Unreachable)'},
        {k:'Trace done!',  v:'Dest reached — trace complete',   c:'#4ade80'},
        {k:'Hop 1',        v:'192.168.1.1   ~1ms  LAN'},
        {k:'Hop 2',        v:'10.0.12.2    ~12ms  WAN1'},
        {k:'Hop 3',        v:'10.0.23.2    ~25ms  WAN2'},
        {k:'Hop 4 (Dest)', v:'10.0.34.10   ~30ms  SERVER',     c:'#4ade80'},
        {k:'RTT spike',    v:'Spike ≠ congestion (ICMP deprio)'},
        {k:'Loop detect',  v:'Same IP twice → routing loop!',  c:'#f87171'},
      ],
      wsOptions:[
        {num:'IP',   name:'Src → Dst',     val:'10.0.34.10 → 192.168.1.10'},
        {num:'ICMP', name:'Type',          val:'3 (Destination Unreachable)'},
        {num:'ICMP', name:'Code',          val:'3 (Port Unreachable = trace done!)'},
        {num:'ICMP', name:'Embedded UDP',  val:'Dport:33434 (the original probe port)'},
        {num:'IOS',  name:'Trace result',  val:'4 hops, success rate 100%'},
      ],
      chain:8, totalChain:8,
      hopResultRow:{hop:4, ip:'10.0.34.10', rtts:['30ms','29ms','31ms'], status:'done'},
    },
  ];
  
  // ─── MODE 3: PMTUD (Path MTU Discovery) ──────────────────────────────────
  const ICMP_PMTUD_STEPS = [
    {
      step:1,
      title:'Step 1 — PC Sends Large IP Packet with DF=1 (Don\'t Fragment)',
      tag:'DF=1 LARGE PKT', tagColor:'#a78bfa', tagBg:'rgba(167,139,250,0.12)',
      desc:`<strong>🟦 Beginner:</strong> Every network link has a maximum packet size called <strong>MTU (Maximum Transmission Unit)</strong>. Standard Ethernet = 1500 bytes. When your PC sends a large TCP packet, it sets the <strong>DF (Don't Fragment) bit = 1</strong>, telling all routers: "do NOT break this packet into fragments — if it's too big, tell me!" This is Path MTU Discovery.<br><br>
  <strong>🟨 TAC Engineer:</strong> TCP sets DF=1 by default for all data packets. During the 3-way handshake, both sides announce their <strong>MSS (Maximum Segment Size)</strong> — typically 1460 bytes (1500 - 20 IP hdr - 20 TCP hdr). However, MSS only reflects the local link MTU — it doesn't account for smaller MTUs on intermediate links (tunnels, PPPoE, MPLS). This is where PMTUD matters. The PC sends a 1500-byte IP packet with DF=1 toward the server.<br><br>
  <strong>🔴 CCIE Architect:</strong> PMTUD relies on ICMP Type 3 Code 4 messages flowing back to the sender unrestricted. If ANY firewall or ACL in the path blocks ICMP, PMTUD fails silently — connections that work for small packets (ping, SYN/SYN-ACK) mysteriously hang for data transfers. This is the notorious <strong>"PMTUD Black Hole"</strong>. Detection: <code>ping [ip] size 1472 df-bit</code> works but ping with 1500-byte payload fails. Fix: <strong>TCP MSS Clamping</strong> (<code>ip tcp adjust-mss 1452</code> on interfaces) overrides the MSS at the router — doesn't require ICMP.`,
      path:['pc','sw','r1'], dir:'fwd',
      pktColor:'#a78bfa', pktLabel:'1500B\nDF=1',
      fields:[
        {k:'Packet Size',  v:'1500 bytes  (full Ethernet MTU)',  c:'#a78bfa'},
        {k:'DF Bit',       v:'1  (Do Not Fragment)',              c:'#fbbf24'},
        {k:'Protocol',     v:'TCP  (data segment)'},
        {k:'MSS announced',v:'1460 bytes  (SYN option)'},
        {k:'LAN MTU',      v:'1500 bytes  (PC → R1 OK)'},
        {k:'WAN MTU',      v:'1400 bytes  (R1 → R2 link!)',      c:'#f87171'},
        {k:'Black hole',   v:'ICMP blocked → PMTUD fails silently',c:'#f87171'},
        {k:'MSS Clamp',    v:'ip tcp adjust-mss 1452  (fix)',    c:'#38d9c0'},
      ],
      wsOptions:[
        {num:'IP', name:'Src → Dst',    val:'192.168.1.10 → 10.0.34.10'},
        {num:'IP', name:'Total Length', val:'1500 bytes'},
        {num:'IP', name:'DF Bit',       val:'1 (Don\'t Fragment set!)'},
        {num:'IP', name:'TTL',          val:'64'},
        {num:'TCP',name:'Flags',        val:'PSH ACK (data segment)'},
        {num:'TCP',name:'MSS',          val:'1460 bytes (negotiated in SYN)'},
      ],
      chain:1, totalChain:4,
      hopResultRow: null,
    },
    {
      step:2,
      title:'Step 2 — R1 Cannot Forward: WAN Link MTU=1400. Sends ICMP Frag Needed (Type 3, Code 4)',
      tag:'FRAG NEEDED', tagColor:'#f87171', tagBg:'rgba(248,113,113,0.12)',
      desc:`<strong>🟦 Beginner:</strong> The link between R1 and R2 has MTU=1400 bytes (a simulated tunnel or WAN link). R1 receives the 1500-byte packet but cannot forward it because: (1) The packet is too big for the link, AND (2) the DF bit is set (can't fragment). R1 <strong>drops the packet</strong> and sends back <strong>ICMP Destination Unreachable, Type 3, Code 4: Fragmentation Needed</strong> with the next-hop MTU embedded.<br><br>
  <strong>🟨 TAC Engineer:</strong> The ICMP Frag Needed message (RFC 1191) includes a crucial field: <strong>Next-Hop MTU</strong> in bytes. This tells the sender exactly what size to use for this link. Modern implementations use this value directly. Older implementations (pre-RFC 1191) set the MTU field to 0, forcing the sender to try progressively smaller sizes. Verify PMTUD issues: <code>debug ip icmp</code>, <code>show ip traffic | include Fragment</code>. MSS Clamping on Cisco: <code>ip tcp adjust-mss 1360</code> (leave room for tunnel overhead).<br><br>
  <strong>🔴 CCIE Architect:</strong> PMTUD Black Hole occurs when ICMP Type 3 Code 4 is blocked. RFC 4821 (PLPMTUD — Packetization Layer PMTUD) solves this at the transport layer using probing without relying on ICMP — used in QUIC and modern SCTP. In GRE tunnels: outer IP adds 24 bytes overhead (20 IP + 4 GRE). With IPsec (ESP transport): ~58 bytes overhead. MPLS adds 4 bytes per label. Always set MTU = physical_MTU - all_tunnel_overhead - 20 IP - headers. Formula for GRE over IPsec: MSS = 1500 - 20(outer IP) - 4(GRE) - 28(ESP+AH) - 20(inner IP) - 20(TCP) = <strong>1408 bytes</strong>. Use <code>ip tcp adjust-mss 1408</code> on tunnel interfaces.`,
      path:['r1','sw','pc'], dir:'fwd',
      pktColor:'#f87171', pktLabel:'Type3\nCode4!',
      fields:[
        {k:'ICMP Type',    v:'3  (Destination Unreachable)',      c:'#f87171'},
        {k:'ICMP Code',    v:'4  (Fragmentation Needed, DF set)'},
        {k:'Next-Hop MTU', v:'1400  (embedded in ICMP message)', c:'#fbbf24'},
        {k:'Packet dropped',v:'1500B packet DISCARDED at R1'},
        {k:'WAN link MTU', v:'1400 bytes  (R1↔R2 link)'},
        {k:'GRE overhead', v:'20 IP + 4 GRE = 24 bytes',        c:'#a78bfa'},
        {k:'IPsec ESP',    v:'~58 bytes overhead'},
        {k:'MSS Formula',  v:'physical MTU - all overhead - 40', c:'#38d9c0'},
        {k:'IOS fix',      v:'ip tcp adjust-mss 1408 (GRE/IPsec)'},
        {k:'RFC 4821',     v:'PLPMTUD — no ICMP needed (QUIC)'},
      ],
      wsOptions:[
        {num:'IP',   name:'Src → Dst',         val:'192.168.1.1 → 192.168.1.10'},
        {num:'IP',   name:'Protocol',          val:'0x01 (ICMP)'},
        {num:'ICMP', name:'Type',              val:'3 (Destination Unreachable)'},
        {num:'ICMP', name:'Code',              val:'4 (Fragmentation Needed)'},
        {num:'ICMP', name:'Next-Hop MTU',      val:'1400 bytes (from R1 egress iface)'},
        {num:'ICMP', name:'Embedded IP hdr',   val:'Src:192.168.1.10 Dst:10.0.34.10 DF=1'},
        {num:'ICMP', name:'Embedded 8 bytes',  val:'TCP flags, ports (first 8B of TCP hdr)'},
      ],
      chain:2, totalChain:4,
      hopResultRow: null,
    },
    {
      step:3,
      title:'Step 3 — PC Adjusts Path MTU to 1400, Resends Smaller Segment',
      tag:'PMTU ADJUSTED', tagColor:'#4ade80', tagBg:'rgba(74,222,128,0.12)',
      desc:`<strong>🟦 Beginner:</strong> The PC receives the ICMP Frag Needed message and sees the Next-Hop MTU is 1400. It updates its <strong>Path MTU cache</strong> for this destination and retransmits the TCP data in smaller segments that fit within 1400 bytes. This time the packet will fit!<br><br>
  <strong>🟨 TAC Engineer:</strong> The OS maintains a <strong>PMTU cache</strong> (per destination, with expiry timers — typically 10 minutes). TCP retransmits with the new MSS = 1400 - 20 (IP) - 20 (TCP) = 1360 bytes. <code>netstat -s | grep PMTU</code> on Linux shows PMTU events. On Windows: <code>netsh interface ipv4 show destinationcache</code>. If the PMTU cache expires, the OS tries 1500 again (with DF=1) to see if the path MTU has changed (adaptive PMTUD). Wireshark filter: <code>tcp.analysis.reused_ports or icmp.type==3</code>.<br><br>
  <strong>🔴 CCIE Architect:</strong> PMTU cache poisoning is a security concern — an attacker can forge ICMP Type 3 Code 4 messages to reduce a victim's PMTU, causing excessive fragmentation and performance degradation. Modern kernels validate the embedded original packet before accepting PMTU updates. In Cisco IOS, <code>ip tcp adjust-mss</code> works transparently regardless of ICMP — it modifies the MSS field in SYN/SYN-ACK packets at the router, preventing oversized segments from being sent in the first place. Best practice for any tunnel: <em>always</em> set <code>ip tcp adjust-mss</code> to physical MTU minus all overhead.`,
      path:['pc','sw','r1','r2','r3','srv'], dir:'fwd',
      pktColor:'#4ade80', pktLabel:'1360B\nDF=1 ✓',
      fields:[
        {k:'New PMTU',     v:'1400 bytes  (from ICMP msg)',       c:'#4ade80'},
        {k:'New MSS',      v:'1360 bytes  (1400 - 20IP - 20TCP)'},
        {k:'PMTU cache',   v:'OS caches per-dest, 10min timeout'},
        {k:'Linux cmd',    v:'netstat -s | grep PMTU'},
        {k:'Windows cmd',  v:'netsh int ipv4 show destcache'},
        {k:'Security',     v:'PMTU poisoning via forged ICMP!',   c:'#f87171'},
        {k:'Best practice',v:'ip tcp adjust-mss [val] on tunnels', c:'#38d9c0'},
        {k:'Wireshark',    v:'icmp.type==3 and icmp.code==4'},
      ],
      wsOptions:[
        {num:'IP',  name:'Total Length',  val:'1380 bytes (1360 TCP data + 40 hdr)'},
        {num:'IP',  name:'DF Bit',        val:'1 (still set)'},
        {num:'TCP', name:'Payload',       val:'1360 bytes (new MSS)'},
        {num:'R1',  name:'WAN link',      val:'1400 MTU — 1380 byte packet FITS ✓'},
      ],
      chain:3, totalChain:4,
      hopResultRow: null,
    },
    {
      step:4,
      title:'Step 4 — Smaller Packet Flows Through All Links — Transfer Succeeds! 🎉',
      tag:'PMTUD SUCCESS ✓', tagColor:'var(--cyan)', tagBg:'rgba(56,217,192,0.12)',
      desc:`<strong>🟦 Beginner:</strong> The 1360-byte TCP segment flows through all links without issues. The WAN link (MTU=1400) accepts 1380-byte packets (1360 data + 40 headers). PMTUD worked — the connection self-heals and data transfers resume automatically.<br><br>
  <strong>🟨 TAC Engineer:</strong> PMTUD is invisible to users when working correctly — connections auto-adjust. When PMTUD is broken (ICMP blocked), symptoms appear as: connections that work for small data but hang for large file transfers, HTTPS pages load but large downloads fail, SSH connects but file uploads hang. Classic troubleshooting: <code>ping [dst] size 1472 df-bit</code> succeeds? Good. <code>ping [dst] size 1452 df-bit</code>? Iteratively find the max size. Then fix with MSS clamping.<br><br>
  <strong>🔴 CCIE Architect:</strong> PMTUD failure matrix: (1) Tunnel without MSS clamp → large transfers fail. (2) ASA/firewall blocking ICMP Type 3 → silent black hole. (3) PPPoE (adds 8 bytes overhead) → effective MTU 1492, not 1500. (4) IPv6 (no IP-level fragmentation in transit) → PMTUD is mandatory! IPv6 routers never fragment — only the source can fragment. ICMPv6 Type 2 (Packet Too Big) replaces ICMP Type 3 Code 4. (5) QUIC bypasses PMTUD entirely using PLPMTUD at the application layer. Best practice checklist: <code>ip tcp adjust-mss</code> on all tunnel interfaces, <code>ip mtu [val]</code> on WAN interfaces, permit ICMP unreachable on firewall policies, monitor with IP SLA jitter probes.`,
      path:['pc','sw','r1','r2','r3','srv'], dir:'fwd',
      pktColor:'#38d9c0', pktLabel:'1360B\n→ OK! ✓',
      fields:[
        {k:'Status',       v:'Transfer succeeds!',                c:'#4ade80'},
        {k:'Effective MSS',v:'1360 bytes  (fits all links)'},
        {k:'PMTUD done',   v:'OS PMTU cache updated to 1400'},
        {k:'Fail symptom', v:'Large transfers hang, small OK',    c:'#f87171'},
        {k:'PPPoE',        v:'MTU=1492 (1500 - 8 PPPoE hdr)'},
        {k:'IPv6 note',    v:'ICMPv6 Type 2 = Packet Too Big',  c:'#a78bfa'},
        {k:'IPv6 rule',    v:'Routers NEVER fragment in IPv6!'},
        {k:'QUIC fix',     v:'PLPMTUD (RFC 4821) - no ICMP dep'},
        {k:'Best practice',v:'ip tcp adjust-mss on ALL tunnels', c:'#38d9c0'},
        {k:'IOS cmd',      v:'show ip tcp adjust-mss'},
      ],
      wsOptions:[
        {num:'IP',  name:'Total Length',  val:'1380 bytes — fits all links ✓'},
        {num:'TCP', name:'Transfer',      val:'Resumes — data flows normally'},
        {num:'OS',  name:'PMTU cache',    val:'10.0.34.10 → PMTU=1400 (10min)'},
        {num:'IPv6',name:'Equivalent',    val:'ICMPv6 Type 2 (Packet Too Big)'},
      ],
      chain:4, totalChain:4,
      hopResultRow: null,
    },
  ];
  
  // ─── ICMP Types Reference (for the reference panel) ───────────────────────
  const ICMP_TYPES_REF = [
    { type:'0',  code:'0',    name:'Echo Reply',                      use:'Ping response',                          color:'#4ade80', cisco:'ICMP type 0 code 0' },
    { type:'3',  code:'0',    name:'Dest Unreachable — Net',          use:'No route to network',                    color:'#f87171', cisco:'ip route null0 → generates' },
    { type:'3',  code:'1',    name:'Dest Unreachable — Host',         use:'No route to host',                       color:'#f87171', cisco:'ARP failure on last hop' },
    { type:'3',  code:'2',    name:'Dest Unreachable — Protocol',     use:'Protocol not running on dest',           color:'#f87171', cisco:'Port closed at transport' },
    { type:'3',  code:'3',    name:'Dest Unreachable — Port',         use:'UDP port unreachable (traceroute done)', color:'#fbbf24', cisco:'traceroute completion signal' },
    { type:'3',  code:'4',    name:'Fragmentation Needed (PMTUD)',     use:'DF=1 but packet too big for link',       color:'#a78bfa', cisco:'ip tcp adjust-mss to fix' },
    { type:'3',  code:'9/10', name:'Admin Prohibited',                use:'ACL deny with icmp-unreachable',         color:'#f87171', cisco:'ip access-list deny → code 9' },
    { type:'3',  code:'13',   name:'Comm Admin Prohibited',           use:'ASA/firewall drop with notification',    color:'#f87171', cisco:'ASA: icmp deny → code 13' },
    { type:'5',  code:'0-3',  name:'Redirect',                        use:'Better next-hop available',              color:'#38d9c0', cisco:'no ip redirects on interface' },
    { type:'8',  code:'0',    name:'Echo Request',                    use:'Ping probe sent',                        color:'#5b9cf6', cisco:'ping [ip] on IOS' },
    { type:'11', code:'0',    name:'Time Exceeded — TTL',             use:'TTL=0 in transit (traceroute)',          color:'#fbbf24', cisco:'ip icmp rate-limit unreachable' },
    { type:'11', code:'1',    name:'Time Exceeded — Fragment Reassem',use:'Fragment reassembly timeout',            color:'#fbbf24', cisco:'ip reassembly-timeout' },
    { type:'12', code:'0',    name:'Parameter Problem',               use:'Invalid IP header field',                color:'#8892b0', cisco:'Rare — malformed packet' },
    { type:'17', code:'0',    name:'Address Mask Request',            use:'Deprecated — BOOTP replaced',            color:'#5a6080', cisco:'Obsolete' },
  ];
  
  // ═══════════════════════════════════════════════════════════════════════════
  // HTML INJECTION — Page Layout
  // ═══════════════════════════════════════════════════════════════════════════
  
  function icmpBuildHTML() {
    return `
    <div class="page-header">
      <div class="page-title">ICMP & Traceroute — Internet Control Message Protocol</div>
      <div class="page-desc">RFC 792 (ICMPv4) · Ping · Traceroute · PMTUD · Type/Code Reference · CCNA → TAC → CCIE Level</div>
    </div>
  
    <!-- Legend -->
    <div class="legend">
      <div class="legend-item"><div class="legend-dot" style="background:#5b9cf6"></div>Echo Request (Type 8)</div>
      <div class="legend-item"><div class="legend-dot" style="background:#4ade80"></div>Echo Reply (Type 0)</div>
      <div class="legend-item"><div class="legend-dot" style="background:#f87171"></div>Time Exceeded (Type 11)</div>
      <div class="legend-item"><div class="legend-dot" style="background:#a78bfa"></div>Frag Needed (Type 3 Code 4)</div>
      <div class="legend-item"><div class="legend-dot" style="background:#fbbf24"></div>Probe / Transit</div>
    </div>
  
    <!-- Mode Tabs -->
    <div class="mode-tabs" id="icmp-mode-tabs">
      <button class="mode-tab" id="icmp-tab-ping"        onclick="icmpSetMode('ping')">📡 Ping</button>
      <button class="mode-tab active" id="icmp-tab-traceroute" onclick="icmpSetMode('traceroute')">🔍 Traceroute</button>
      <button class="mode-tab" id="icmp-tab-pmtud"       onclick="icmpSetMode('pmtud')">📏 PMTUD</button>
      <button class="mode-tab" id="icmp-tab-ref"         onclick="icmpSetMode('ref')">📚 Types Ref</button>
    </div>
  
    <!-- Reference Panel (hidden unless ref mode) -->
    <div id="icmp-ref-panel" style="display:none;">
      <div class="card">
        <div class="card-hdr">📚 ICMP Type / Code Reference — From Beginner to CCIE</div>
        <div class="tbl-wrap">
          <table class="tbl">
            <thead><tr><th>Type</th><th>Code</th><th>Name</th><th>Real-World Use</th><th>Cisco IOS Note</th></tr></thead>
            <tbody id="icmp-ref-tbody"></tbody>
          </table>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:0;">
        <div class="card" style="margin-bottom:0">
          <div class="card-hdr">🔴 CCIE — ICMP Rate Limiting & Security</div>
          <div style="font-family:var(--mono);font-size:11px;color:var(--muted2);line-height:2;">
            <div><span style="color:var(--amber)">ip icmp rate-limit unreachable 500</span> — throttle ICMP generation (ms)</div>
            <div><span style="color:var(--amber)">no ip unreachable</span> — disables all ICMP Unreachable on interface (breaks PMTUD!)</div>
            <div><span style="color:var(--amber)">no ip redirects</span> — disables ICMP Redirect (Type 5)</div>
            <div><span style="color:var(--amber)">ip icmp source Loopback0</span> — set ICMP source IP for NMS correlation</div>
            <div><span style="color:var(--green)">ip tcp adjust-mss 1452</span> — MSS clamp (PMTUD bypass)</div>
            <div><span style="color:var(--blue)">show ip traffic</span> — ICMP send/receive counters</div>
            <div><span style="color:var(--blue)">debug ip icmp</span> — per-packet ICMP events (use with ACL!)</div>
            <div><span style="color:var(--blue)">show ip icmp rate-limit</span> — see current rate limit settings</div>
          </div>
        </div>
        <div class="card" style="margin-bottom:0">
          <div class="card-hdr">🟨 TAC — ICMP Troubleshooting Checklist</div>
          <div style="font-family:var(--mono);font-size:11px;color:var(--muted2);line-height:2;">
            <div><span style="color:var(--cyan)">ping [ip] size 1472 df-bit</span> — test PMTUD path</div>
            <div><span style="color:var(--cyan)">traceroute ip [ip] source [ip] numeric</span> — control source</div>
            <div><span style="color:var(--cyan)">ping [ip] repeat 1000</span> — sustained reachability test</div>
            <div><span style="color:var(--cyan)">ping [ip] sweep-range [s] [e] [step]</span> — find MTU</div>
            <div><span style="color:var(--cyan)">show ip traffic</span> — check ICMP rate-limited counter</div>
            <div><span style="color:var(--cyan)">show ip route [ip]</span> — verify routing before ping</div>
            <div><span style="color:var(--red)">* * * at last hop?</span> — firewall blocks UDP 33434, not unreachable</div>
            <div><span style="color:var(--red)">Ping works, HTTPS hangs?</span> — classic PMTUD black hole</div>
          </div>
        </div>
      </div>
      <!-- IPv6 ICMP panel -->
      <div class="card" style="margin-top:16px;">
        <div class="card-hdr">🌐 ICMPv6 — IPv6 Uses ICMP for Everything (RFC 4443)</div>
        <div class="tbl-wrap">
          <table class="tbl">
            <thead><tr><th>ICMPv6 Type</th><th>Name</th><th>IPv4 Equivalent</th><th>Notes</th></tr></thead>
            <tbody>
              <tr><td>1</td><td style="color:var(--red)">Destination Unreachable</td><td>ICMP Type 3</td><td>Code 1=admin prohib, Code 4=port unreach</td></tr>
              <tr><td>2</td><td style="color:var(--amber)">Packet Too Big</td><td>ICMP Type 3 Code 4 (PMTUD)</td><td>IPv6 routers NEVER fragment — this is mandatory!</td></tr>
              <tr><td>3</td><td style="color:var(--amber)">Time Exceeded</td><td>ICMP Type 11</td><td>Used by IPv6 traceroute</td></tr>
              <tr><td>4</td><td style="color:var(--muted2)">Parameter Problem</td><td>ICMP Type 12</td><td>Malformed IPv6 header</td></tr>
              <tr><td>128</td><td style="color:var(--blue)">Echo Request</td><td>ICMP Type 8</td><td>ping6 / ping ipv6</td></tr>
              <tr><td>129</td><td style="color:var(--green)">Echo Reply</td><td>ICMP Type 0</td><td>Reply to Type 128</td></tr>
              <tr><td>133</td><td style="color:var(--cyan)">Router Solicitation (RS)</td><td>No IPv4 equiv</td><td>NDP — host asks for router info</td></tr>
              <tr><td>134</td><td style="color:var(--cyan)">Router Advertisement (RA)</td><td>No IPv4 equiv</td><td>NDP — router announces prefix, GW</td></tr>
              <tr><td>135</td><td style="color:var(--cyan)">Neighbor Solicitation (NS)</td><td>ARP Request</td><td>NDP — replaces ARP completely</td></tr>
              <tr><td>136</td><td style="color:var(--cyan)">Neighbor Advertisement (NA)</td><td>ARP Reply</td><td>NDP — MAC address resolution</td></tr>
              <tr><td>137</td><td style="color:var(--muted2)">Redirect</td><td>ICMP Type 5</td><td>Better next-hop notification</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  
    <!-- Simulator Panel (shown for ping/traceroute/pmtud) -->
    <div id="icmp-sim-panel">
      <!-- Topology -->
      <div class="topo-wrap">
        <div class="topo-label">Network Topology — PC → LAN → R1 → R2 → R3 → Server (Watch TTL & ICMP)</div>
        <svg id="icmp-svg" viewBox="0 0 930 310" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%;height:auto;"></svg>
      </div>
  
      <!-- Progress bar -->
      <div class="progress-bar"><div class="progress-fill" id="icmp-progress" style="width:0%"></div></div>
  
      <!-- Controls -->
      <div class="ctrl-bar">
        <button class="btn btn-primary" onclick="icmpStep(-1)">◀ Prev</button>
        <button class="btn btn-play"    id="icmp-play-btn" onclick="icmpTogglePlay()">▶ Play</button>
        <button class="btn btn-primary" onclick="icmpStep(1)">Next ▶</button>
        <button class="btn btn-reset"   onclick="icmpReset()">↺ Reset</button>
        <div class="speed-group">
          <span class="speed-label">Speed</span>
          <button class="speed-btn" id="icmp-speed-slow"   onclick="icmpSetSpeed('slow')">🐢 Slow</button>
          <button class="speed-btn active" id="icmp-speed-normal" onclick="icmpSetSpeed('normal')">⚡ Normal</button>
          <button class="speed-btn" id="icmp-speed-fast"   onclick="icmpSetSpeed('fast')">🚀 Fast</button>
        </div>
        <div class="step-counter">Step <span id="icmp-step-num">0</span> / <span id="icmp-step-total">8</span></div>
      </div>
  
      <!-- Chain indicator -->
      <div class="dns-chain" id="icmp-chain-bar"></div>
  
      <!-- Step info -->
      <div class="step-info" id="icmp-step-info">
        <div class="step-tag" style="background:rgba(91,156,246,0.12);color:var(--blue)">READY</div>
        <div class="step-title">Select a mode above and press ▶ Play or Next →</div>
        <div class="step-desc">
          <strong>🟦 Beginner:</strong> Learn how ICMP works — the backbone of ping and traceroute.<br>
          <strong>🟨 TAC Engineer:</strong> ICMP types/codes, TTL mechanics, PMTUD black holes, IOS commands.<br>
          <strong>🔴 CCIE Architect:</strong> CEF punt, ICMP rate limiting, MPLS traceroute, PLPMTUD, IP SLA.
        </div>
      </div>
  
      <!-- Main 2-column: Packet Fields + Side Panel -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
        <div class="card" style="margin-bottom:0">
          <div class="card-hdr">📦 ICMP / IP Packet Fields</div>
          <div id="icmp-pkt-fields">
            <div style="color:var(--muted);font-family:var(--mono);font-size:11px;">Start the animation to see packet field details…</div>
          </div>
        </div>
        <div>
          <div class="card" style="margin-bottom:10px;">
            <div class="card-hdr">🔬 Wireshark Dissection</div>
            <div id="icmp-ws-options">
              <div style="color:var(--muted);font-family:var(--mono);font-size:11px;">Packet dissection will appear here…</div>
            </div>
          </div>
          <!-- Traceroute hop table (shown in traceroute mode) -->
          <div id="icmp-hop-table-wrap" class="pool-wrap" style="margin-bottom:0;display:none;">
            <div class="pool-hdr">🗺️ Traceroute Output — Live</div>
            <table class="tbl" style="margin-top:6px;">
              <thead><tr><th>Hop</th><th>IP Address</th><th>RTT 1</th><th>RTT 2</th><th>RTT 3</th></tr></thead>
              <tbody id="icmp-hop-tbody"></tbody>
            </table>
          </div>
        </div>
      </div>
  
      <!-- Knowledge Level Tabs inside the info area -->
      <div class="card" style="margin-bottom:16px;">
        <div class="card-hdr">📖 ICMP Header Structure</div>
        <div style="overflow-x:auto;">
          <svg viewBox="0 0 720 110" xmlns="http://www.w3.org/2000/svg" style="display:block;width:100%;max-width:720px;height:auto;min-width:320px;">
            <!-- IP Header bar -->
            <rect x="10" y="8" width="700" height="22" rx="3" fill="rgba(91,156,246,0.12)" stroke="rgba(91,156,246,0.3)" stroke-width="1"/>
            <text x="360" y="23" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9" fill="#5b9cf6" font-weight="600">IP HEADER (20 bytes) — Protocol=1 (ICMP) · TTL · Src IP · Dst IP</text>
            <!-- ICMP header fields -->
            <rect x="10"  y="35" width="160" height="32" rx="3" fill="rgba(248,113,113,0.12)" stroke="rgba(248,113,113,0.3)" stroke-width="1"/>
            <text x="90"  y="50" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9" fill="#f87171" font-weight="700">TYPE</text>
            <text x="90"  y="62" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#5a6080">8 bits · Type 8=Req, 0=Reply</text>
            <rect x="175" y="35" width="160" height="32" rx="3" fill="rgba(251,191,36,0.12)" stroke="rgba(251,191,36,0.3)" stroke-width="1"/>
            <text x="255" y="50" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9" fill="#fbbf24" font-weight="700">CODE</text>
            <text x="255" y="62" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#5a6080">8 bits · Sub-type details</text>
            <rect x="340" y="35" width="180" height="32" rx="3" fill="rgba(56,217,192,0.12)" stroke="rgba(56,217,192,0.3)" stroke-width="1"/>
            <text x="430" y="50" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9" fill="#38d9c0" font-weight="700">CHECKSUM</text>
            <text x="430" y="62" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#5a6080">16 bits · One's complement</text>
            <rect x="525" y="35" width="185" height="32" rx="3" fill="rgba(167,139,250,0.12)" stroke="rgba(167,139,250,0.3)" stroke-width="1"/>
            <text x="617" y="50" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9" fill="#a78bfa" font-weight="700">ID + SEQUENCE</text>
            <text x="617" y="62" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#5a6080">16+16 bits · Echo match</text>
            <!-- Data section -->
            <rect x="10"  y="72" width="700" height="28" rx="3" fill="rgba(74,222,128,0.07)" stroke="rgba(74,222,128,0.2)" stroke-width="1" stroke-dasharray="4,3"/>
            <text x="360" y="90" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9" fill="#4ade80">VARIABLE DATA — Original IP hdr + 8B for Unreachable/Exceeded · Echo payload · Next-Hop MTU</text>
          </svg>
        </div>
      </div>
  
      <!-- Bottom reference cards -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:16px;">
        <div style="background:var(--bg3);border-radius:8px;padding:12px;border:1px solid var(--border)">
          <div style="font-family:var(--mono);font-size:10px;font-weight:700;color:var(--blue);margin-bottom:8px;">🟦 BEGINNER — KEY CONCEPTS</div>
          <div style="font-size:11px;color:var(--muted2);line-height:1.8;">
            • ICMP = IP error reporter (Protocol 1)<br>
            • Ping = Echo Request (Type 8) + Reply (Type 0)<br>
            • TTL decrements at each router hop<br>
            • Traceroute exploits TTL expiry<br>
            • ICMP is NOT a transport protocol
          </div>
        </div>
        <div style="background:var(--bg3);border-radius:8px;padding:12px;border:1px solid var(--border)">
          <div style="font-family:var(--mono);font-size:10px;font-weight:700;color:var(--amber);margin-bottom:8px;">🟨 TAC — TROUBLESHOOTING</div>
          <div style="font-size:11px;color:var(--muted2);line-height:1.8;font-family:var(--mono);">
            • ping size 1472 df-bit → PMTUD test<br>
            • * * * = ICMP blocked, not unreachable<br>
            • show ip traffic → ICMP stats<br>
            • ip icmp rate-limit unreachable [ms]<br>
            • no ip unreachable → BREAKS PMTUD!
          </div>
        </div>
        <div style="background:var(--bg3);border-radius:8px;padding:12px;border:1px solid var(--border)">
          <div style="font-family:var(--mono);font-size:10px;font-weight:700;color:var(--red);margin-bottom:8px;">🔴 CCIE — ARCHITECT LEVEL</div>
          <div style="font-size:11px;color:var(--muted2);line-height:1.8;font-family:var(--mono);">
            • ICMP self-gen = process-switched<br>
            • ip tcp adjust-mss on all tunnels<br>
            • MPLS: no mpls ip propagate-ttl<br>
            • IP SLA + EOT → route failover<br>
            • IPv6: ICMPv6 Type 2 = Pkt Too Big
          </div>
        </div>
      </div>
    </div>
    `;
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // SVG TOPOLOGY DRAW
  // ═══════════════════════════════════════════════════════════════════════════
  
  function icmpDrawTopo(showPkt, pktX, pktY, pktColor, pktLabel) {
    const svg = document.getElementById('icmp-svg');
    if (!svg) return;
    const N = ICMP_NODES;
    const aN = icmpActiveNodes;
  
    // Link colors
    function edgeActive(a, b) {
      const ia = aN.indexOf(a), ib = aN.indexOf(b);
      return ia >= 0 && ib >= 0 && Math.abs(ia - ib) === 1;
    }
  
    let html = `<defs>
      <marker id="rtr-arrow" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
        <path d="M1 1L7 4L1 7" fill="none" stroke="currentColor" stroke-width="1.5"/>
      </marker>
      <filter id="icmp-glow"><feGaussianBlur stdDeviation="3" result="b"/>
        <feComposite in="SourceGraphic" in2="b" operator="over"/></filter>
    </defs>`;
  
    // Draw edges
    html += svgEdge(N.pc.x,  N.pc.y,  N.sw.x,  N.sw.y,  edgeActive('pc','sw'),  '#5b9cf6');
    html += svgEdge(N.sw.x,  N.sw.y,  N.r1.x,  N.r1.y,  edgeActive('sw','r1'),  '#5b9cf6');
    html += svgEdge(N.r1.x,  N.r1.y,  N.r2.x,  N.r2.y,  edgeActive('r1','r2'),  '#fbbf24');
    html += svgEdge(N.r2.x,  N.r2.y,  N.r3.x,  N.r3.y,  edgeActive('r2','r3'),  '#fbbf24');
    html += svgEdge(N.r3.x,  N.r3.y,  N.srv.x, N.srv.y, edgeActive('r3','srv'), '#4ade80');
  
    // Subnet labels
    const subnetStyle = 'font-family="IBM Plex Mono,monospace" font-size="8" fill="#3d4560" text-anchor="middle"';
    html += `<text x="${(N.pc.x+N.sw.x)/2}"  y="182" ${subnetStyle}>192.168.1.0/24</text>`;
    html += `<text x="${(N.sw.x+N.r1.x)/2}"  y="182" ${subnetStyle}>192.168.1.0/24</text>`;
    html += `<text x="${(N.r1.x+N.r2.x)/2}"  y="182" ${subnetStyle}>10.0.12.0/30</text>`;
    html += `<text x="${(N.r2.x+N.r3.x)/2}"  y="182" ${subnetStyle}>10.0.23.0/30</text>`;
    html += `<text x="${(N.r3.x+N.srv.x)/2}" y="182" ${subnetStyle}>10.0.34.0/30</text>`;
  
    // IP labels under nodes
    const ipStyle = 'font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#3d4560" text-anchor="middle"';
    html += `<text x="${N.pc.x}"  y="215" ${ipStyle}>192.168.1.10</text>`;
    html += `<text x="${N.sw.x}"  y="215" ${ipStyle}>L2 Switch</text>`;
    html += `<text x="${N.r1.x}"  y="215" ${ipStyle}>R1: .1.1 / 10.0.12.1</text>`;
    html += `<text x="${N.r2.x}"  y="215" ${ipStyle}>R2: 10.0.12.2 / .23.1</text>`;
    html += `<text x="${N.r3.x}"  y="215" ${ipStyle}>R3: 10.0.23.2 / .34.1</text>`;
    html += `<text x="${N.srv.x}" y="215" ${ipStyle}>10.0.34.10</text>`;
  
    // MTU label for PMTUD mode
    if (icmpMode === 'pmtud') {
      html += `<rect x="${(N.r1.x+N.r2.x)/2 - 30}" y="190" width="60" height="14" rx="3" fill="rgba(248,113,113,0.12)" stroke="rgba(248,113,113,0.3)" stroke-width="1"/>`;
      html += `<text x="${(N.r1.x+N.r2.x)/2}" y="200" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#f87171" font-weight="600">MTU=1400</text>`;
      html += `<text x="${(N.pc.x+N.sw.x)/2}"  y="200" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#4ade80">MTU=1500</text>`;
      html += `<text x="${(N.sw.x+N.r1.x)/2}"  y="200" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#4ade80">MTU=1500</text>`;
      html += `<text x="${(N.r2.x+N.r3.x)/2}"  y="200" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#4ade80">MTU=1500</text>`;
      html += `<text x="${(N.r3.x+N.srv.x)/2}" y="200" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#4ade80">MTU=1500</text>`;
    }
  
    // Draw nodes
    html += svgPC(N.pc.x,  N.pc.y,  'pc',  'PC\n192.168.1.10',      aN.includes('pc'));
    html += svgSwitch(N.sw.x, N.sw.y, 'sw', 'SW',                    aN.includes('sw'));
    html += svgRouter(N.r1.x, N.r1.y, 'r1', 'R1\n192.168.1.1',       aN.includes('r1'));
    html += svgRouter(N.r2.x, N.r2.y, 'r2', 'R2\n10.0.12.2',         aN.includes('r2'));
    html += svgRouter(N.r3.x, N.r3.y, 'r3', 'R3\n10.0.23.2',         aN.includes('r3'));
    html += svgServer(N.srv.x, N.srv.y, 'srv', 'Server\n10.0.34.10', aN.includes('srv'), '#4ade80');
  
    // Animated packet
    if (showPkt && pktX !== undefined) {
      const lines = (pktLabel || '').split('\n');
      html += `<g filter="url(#icmp-glow)" transform="translate(${pktX},${pktY})">
        <rect x="-26" y="-18" width="52" height="36" rx="8" fill="${pktColor}" opacity="0.92"/>
        <text x="0" y="${lines.length > 1 ? '-4' : '5'}" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9" font-weight="700" fill="#07090f">${lines[0]}</text>
        ${lines[1] ? `<text x="0" y="10" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" font-weight="600" fill="#07090f">${lines[1]}</text>` : ''}
      </g>`;
    }
  
    svg.innerHTML = html;
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // ANIMATION ENGINE
  // ═══════════════════════════════════════════════════════════════════════════
  
  function icmpGetSteps() {
    if (icmpMode === 'ping')        return ICMP_PING_STEPS;
    if (icmpMode === 'traceroute')  return ICMP_TRACEROUTE_STEPS;
    if (icmpMode === 'pmtud')       return ICMP_PMTUD_STEPS;
    return [];
  }
  
  function icmpAnimateStep(stepIdx) {
    const steps = icmpGetSteps();
    if (stepIdx < 0 || stepIdx >= steps.length) return;
    const s = steps[stepIdx];
    const nodeKeys = s.path;
    const segDur   = icmpGetSegDur();
  
    // Build segment list from path
    const segments = [];
    for (let i = 0; i < nodeKeys.length - 1; i++) {
      segments.push({ from: ICMP_NODES[nodeKeys[i]], to: ICMP_NODES[nodeKeys[i+1]] });
    }
    if (segments.length === 0) {
      icmpActiveNodes = nodeKeys;
      icmpDrawTopo(false);
      return;
    }
  
    icmpActiveNodes = nodeKeys;
  
    let segIdx = 0, startTime = null;
  
    function anim(ts) {
      if (!startTime) startTime = ts;
      const elapsed = ts - startTime;
      const t = Math.min(elapsed / segDur, 1);
      const e = easeInOut(t);
      const seg = segments[segIdx];
      const px  = seg.from.x + (seg.to.x - seg.from.x) * e;
      const py  = seg.from.y + (seg.to.y - seg.from.y) * e;
      icmpDrawTopo(true, px, py, s.pktColor, s.pktLabel);
      if (t >= 1) {
        if (segIdx < segments.length - 1) {
          segIdx++; startTime = ts;
          icmpAnimId = requestAnimationFrame(anim);
        } else {
          icmpDrawTopo(true, seg.to.x, seg.to.y, s.pktColor, s.pktLabel);
          setTimeout(() => { icmpActiveNodes = []; icmpDrawTopo(false); }, 450);
        }
      } else {
        icmpAnimId = requestAnimationFrame(anim);
      }
    }
    icmpAnimId = requestAnimationFrame(anim);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // UI UPDATE
  // ═══════════════════════════════════════════════════════════════════════════
  
  function icmpUpdateChain(stepIdx, total) {
    const el = document.getElementById('icmp-chain-bar');
    if (!el) return;
    const steps = icmpGetSteps();
    let html = '';
    steps.forEach((s, i) => {
      const lbl = icmpMode === 'traceroute' ? [
        'Probe 1','Hop 1','Probe 2','Hop 2','Probe 3','Hop 3','Probe 4','Trace Done'
      ][i] : icmpMode === 'ping' ? [
        'Echo Req','Transit','Echo Reply','Success'
      ][i] : [
        'Large Pkt','Frag Needed','Adjusted','Success'
      ][i];
      let cls = 'dns-chain-step';
      if (stepIdx > i)      cls += ' done';
      else if (stepIdx === i) cls += ' active';
      html += `<div class="${cls}">${lbl}</div>`;
      if (i < steps.length - 1) html += `<div class="dns-chain-arrow">›</div>`;
    });
    el.innerHTML = html;
  }
  
  function icmpUpdateHopTable(stepIdx) {
    const wrap = document.getElementById('icmp-hop-table-wrap');
    const tbody = document.getElementById('icmp-hop-tbody');
    if (!wrap || !tbody) return;
  
    if (icmpMode !== 'traceroute') { wrap.style.display = 'none'; return; }
    wrap.style.display = '';
  
    // collect all hopResultRows up to current step
    const steps = ICMP_TRACEROUTE_STEPS;
    let rows = {};
    for (let i = 0; i <= stepIdx; i++) {
      const r = steps[i].hopResultRow;
      if (r) rows[r.hop] = r;
    }
  
    let html = '';
    for (let h = 1; h <= 4; h++) {
      const r = rows[h];
      if (!r) { html += `<tr><td style="color:var(--muted)">${h}</td><td style="color:var(--muted)">—</td><td>—</td><td>—</td><td>—</td></tr>`; continue; }
      if (r.status === 'probing') {
        html += `<tr><td style="color:var(--amber)">${h}</td><td style="color:var(--amber)">probing…</td><td colspan="3" style="color:var(--muted)">* * *</td></tr>`;
      } else {
        const ipColor = h === 4 ? 'var(--green)' : 'var(--cyan)';
        html += `<tr><td>${h}</td><td style="color:${ipColor}">${r.ip}</td><td style="color:var(--green)">${r.rtts[0]}</td><td style="color:var(--green)">${r.rtts[1]}</td><td style="color:var(--green)">${r.rtts[2]}</td></tr>`;
      }
    }
    tbody.innerHTML = html;
  }
  
  function icmpUpdateUI() {
    const stepIdx = icmpCurrentStep;
    const steps   = icmpGetSteps();
    const total   = steps.length;
  
    const numEl  = document.getElementById('icmp-step-num');
    const totEl  = document.getElementById('icmp-step-total');
    const prog   = document.getElementById('icmp-progress');
    if (numEl) numEl.textContent  = stepIdx + 1 <= total ? stepIdx + 1 : stepIdx;
    if (totEl) totEl.textContent  = total;
    if (prog)  prog.style.width   = ((icmpCurrentStep) / total * 100) + '%';
  
    icmpUpdateChain(stepIdx, total);
    icmpUpdateHopTable(stepIdx);
  
    const info = document.getElementById('icmp-step-info');
    if (stepIdx === 0 && icmpCurrentStep === 0) {
      if (info) info.innerHTML = `<div class="step-tag" style="background:rgba(91,156,246,0.12);color:var(--blue)">READY</div>
        <div class="step-title">Press ▶ Play or Next → to begin</div>
        <div class="step-desc">
          <strong>🟦 Beginner:</strong> Learn how ICMP works — the backbone of ping and traceroute.<br>
          <strong>🟨 TAC Engineer:</strong> ICMP types/codes, TTL mechanics, PMTUD black holes, IOS commands.<br>
          <strong>🔴 CCIE Architect:</strong> CEF punt, ICMP rate limiting, MPLS traceroute, PLPMTUD, IP SLA.
        </div>`;
      document.getElementById('icmp-pkt-fields').innerHTML = '<div style="color:var(--muted);font-family:var(--mono);font-size:11px;">Start the animation to see packet field details…</div>';
      document.getElementById('icmp-ws-options').innerHTML = '<div style="color:var(--muted);font-family:var(--mono);font-size:11px;">Packet dissection will appear here…</div>';
      return;
    }
  
    if (stepIdx < 0 || stepIdx > steps.length) return;
    const realIdx = Math.min(stepIdx, steps.length - 1);
    const s = steps[realIdx];
  
    if (info) info.innerHTML = `
      <div class="step-tag" style="background:${s.tagBg};color:${s.tagColor}">${s.tag}</div>
      <div class="step-title">${s.title}</div>
      <div class="step-desc">${s.desc}</div>`;
  
    // Packet fields
    const fieldsEl = document.getElementById('icmp-pkt-fields');
    if (fieldsEl && s.fields) {
      let fhtml = '<div class="pkt-fields">';
      s.fields.forEach(f => {
        fhtml += `<div class="pkt-field"><div class="pkt-field-key">${f.k}</div><div class="pkt-field-val" style="color:${f.c||'var(--text)'}">${f.v}</div></div>`;
      });
      fhtml += '</div>';
      fieldsEl.innerHTML = fhtml;
    }
  
    // Wireshark
    const wsEl = document.getElementById('icmp-ws-options');
    if (wsEl && s.wsOptions) {
      let whtml = `<div class="ws-options"><div style="font-family:var(--mono);font-size:9px;color:var(--muted2);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">▾ Frame Dissection (Wireshark view)</div>`;
      s.wsOptions.forEach(o => {
        whtml += `<div class="ws-option">
          <span class="ws-opt-arrow">▶</span>
          <span class="ws-opt-num">${o.num}</span>
          <span class="ws-opt-name">${o.name}</span>
          <span class="ws-opt-val">${o.val}</span>
        </div>`;
      });
      whtml += '</div>';
      wsEl.innerHTML = whtml;
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CONTROLS
  // ═══════════════════════════════════════════════════════════════════════════
  
  function icmpStep(dir) {
    if (icmpAnimId) { cancelAnimationFrame(icmpAnimId); icmpAnimId = null; }
    const steps = icmpGetSteps();
    const newStep = icmpCurrentStep + dir;
    if (newStep < 0 || newStep >= steps.length) return;
    icmpCurrentStep = newStep;
    icmpActiveNodes = [];
    icmpDrawTopo(false);
    icmpUpdateUI();
    icmpAnimateStep(newStep);
  }
  
  function icmpTogglePlay() {
    icmpPlaying = !icmpPlaying;
    const btn = document.getElementById('icmp-play-btn');
    if (btn) btn.textContent = icmpPlaying ? '⏸ Pause' : '▶ Play';
    if (icmpPlaying) icmpAutoPlay();
    else clearTimeout(icmpPlayTimer);
  }
  
  function icmpAutoPlay() {
    if (!icmpPlaying) return;
    const steps = icmpGetSteps();
    if (icmpCurrentStep >= steps.length - 1) {
      icmpPlaying = false;
      const btn = document.getElementById('icmp-play-btn');
      if (btn) btn.textContent = '▶ Play';
      return;
    }
    icmpStep(1);
    icmpPlayTimer = setTimeout(icmpAutoPlay, icmpGetAutoDelay());
  }
  
  function icmpReset() {
    icmpPlaying = false;
    clearTimeout(icmpPlayTimer);
    if (icmpAnimId) { cancelAnimationFrame(icmpAnimId); icmpAnimId = null; }
    const btn = document.getElementById('icmp-play-btn');
    if (btn) btn.textContent = '▶ Play';
    icmpCurrentStep = 0;
    icmpActiveNodes = [];
    icmpDrawTopo(false);
    icmpUpdateChain(0, icmpGetSteps().length);
    icmpUpdateUI();
    icmpUpdateHopTable(-1);
  }
  
  // ─── Mode switch ──────────────────────────────────────────────────────────
  function icmpSetMode(mode) {
    // Stop any animation
    icmpPlaying = false;
    clearTimeout(icmpPlayTimer);
    if (icmpAnimId) { cancelAnimationFrame(icmpAnimId); icmpAnimId = null; }
    const btn = document.getElementById('icmp-play-btn');
    if (btn) btn.textContent = '▶ Play';
  
    icmpMode = mode;
    icmpCurrentStep = 0;
    icmpActiveNodes = [];
  
    // Update tab styling
    ['ping','traceroute','pmtud','ref'].forEach(m => {
      const t = document.getElementById('icmp-tab-' + m);
      if (t) t.classList.toggle('active', m === mode);
    });
  
    // Show/hide panels
    const refPanel = document.getElementById('icmp-ref-panel');
    const simPanel = document.getElementById('icmp-sim-panel');
    if (mode === 'ref') {
      if (refPanel) refPanel.style.display = '';
      if (simPanel) simPanel.style.display = 'none';
      icmpBuildRefTable();
      return;
    }
    if (refPanel) refPanel.style.display = 'none';
    if (simPanel) simPanel.style.display = '';
  
    icmpDrawTopo(false);
    icmpUpdateUI();
    icmpUpdateHopTable(-1);
  
    const totEl = document.getElementById('icmp-step-total');
    if (totEl) totEl.textContent = icmpGetSteps().length;
  }
  
  function icmpBuildRefTable() {
    const tbody = document.getElementById('icmp-ref-tbody');
    if (!tbody) return;
    tbody.innerHTML = ICMP_TYPES_REF.map(r => `
      <tr>
        <td style="color:${r.color};font-weight:700">${r.type}</td>
        <td>${r.code}</td>
        <td style="color:var(--text);font-weight:600">${r.name}</td>
        <td>${r.use}</td>
        <td style="color:var(--cyan)">${r.cisco}</td>
      </tr>`).join('');
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // INIT
  // ═══════════════════════════════════════════════════════════════════════════
  
  function icmpInit() {
    const page = document.getElementById('page-icmp');
    if (!page) return;
  
    // Inject HTML if page is empty
    if (!document.getElementById('icmp-svg')) {
      page.innerHTML = icmpBuildHTML();
    }
  
    // Set default mode tabs
    ['ping','traceroute','pmtud','ref'].forEach(m => {
      const t = document.getElementById('icmp-tab-' + m);
      if (t) t.classList.toggle('active', m === icmpMode);
    });
  
    icmpReset();
    icmpDrawTopo(false);
    icmpUpdateUI();
  
    const totEl = document.getElementById('icmp-step-total');
    if (totEl) totEl.textContent = icmpGetSteps().length;
  }
  
  // DOMContentLoaded safety net
  document.addEventListener('DOMContentLoaded', function () {
    // init only if the page is active (skip heavy init otherwise)
    const pg = document.getElementById('page-icmp');
    if (pg && pg.classList.contains('active')) {
      icmpInit();
    }
  });