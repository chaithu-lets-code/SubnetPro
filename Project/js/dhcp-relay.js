// ═══════════════════════════════════════════════════
// DHCP RELAY AGENT SIMULATOR — dhcp-relay.js
// Scenarios: Basic Relay, Option 82, Multi-server,
//            Relay Renewal, Relay Decline/NAK
// Matches dhcp.js topology style exactly
// ═══════════════════════════════════════════════════

// ─── Node positions (two subnets separated by router/relay) ───
const RELAY_NODES = {
    pc:     { x: 90,  y: 140 },
    sw:     { x: 270, y: 140 },
    relay:  { x: 450, y: 140 },
    dhcp:   { x: 650, y: 140 },
  };
  
  // ─── Speed control ───
  let relaySpeedMode = 'normal';
  function setRelaySpeed(s) {
    relaySpeedMode = s;
    ['slow','normal','fast'].forEach(x => {
      const el = document.getElementById('relay-speed-' + x);
      if (el) el.classList.toggle('active', x === s);
    });
  }
  function relayGetSegDur()    { return { slow: 2400, normal: 1500, fast: 700 }[relaySpeedMode]; }
  function relayGetAutoDelay() { return { slow: 5800, normal: 3000, fast: 1400 }[relaySpeedMode]; }
  
  // ─── Scenario mode ───
  let relayMode = 'basic';
  let relayCurrentStep = 0, relayRafId = null, relayTimerId = null;
  let relayPlaying = false, relayPlayTimer = null;
  let relayActiveNodes = [];
  
  // ═══════════════════════════════════════════════════
  // STEP DATA — 5 SCENARIOS
  // ═══════════════════════════════════════════════════
  
  const RELAY_STEPS = {
  
    // ────────────────────────────────────────────────
    // SCENARIO 1: BASIC RELAY (DORA across subnets)
    // ────────────────────────────────────────────────
    basic: [
      {
        step: 1,
        title: 'Step 1 — PC Broadcasts DHCPDISCOVER (Subnet A)',
        tag: 'DISCOVER', tagColor: 'var(--amber)', tagBg: 'rgba(251,191,36,0.12)',
        desc: 'PC boots with no IP (<strong>0.0.0.0</strong>) and broadcasts DHCPDISCOVER to 255.255.255.255 on UDP port 67. The broadcast is <em>scoped to subnet 10.1.1.0/24</em> only — routers normally drop broadcasts. The DHCP server is on a different subnet (10.2.2.0/24) and would never see this without a relay agent.',
        from: 'pc', to: 'relay', via: ['sw'],
        pktColor: '#fbbf24', pktLabel: 'DISC',
        pktCard: ['DHCPDISCOVER (Broadcast)', 'Src: 0.0.0.0 → 255.255.255.255', 'UDP 68 → 67', 'giaddr: 0.0.0.0 (not relayed yet)'],
        wsOptions: [
          { num: '(53)', name: 'Message Type',      val: 'DISCOVER' },
          { num: '(61)', name: 'Client Identifier', val: 'AA:BB:CC:DD:EE:FF' },
          { num: '(50)', name: 'Requested IP',       val: '(none)' },
          { num: '(12)', name: 'Host Name',          val: 'CLIENT-PC' },
          { num: '(55)', name: 'Parameter Request',  val: 'Mask,GW,DNS,Domain' },
          { num: '(255)',name: 'End',                val: '—' },
        ],
        fields: [
          { k: 'Src IP',      v: '0.0.0.0  (no IP yet)',         c: '#f87171' },
          { k: 'Dst IP',      v: '255.255.255.255  (broadcast)',  c: '#fbbf24' },
          { k: 'Src Port',    v: '68  (DHCP Client)' },
          { k: 'Dst Port',    v: '67  (DHCP Server)' },
          { k: 'Client MAC',  v: 'AA:BB:CC:DD:EE:FF' },
          { k: 'giaddr',      v: '0.0.0.0  (not relayed yet)',   c: '#f87171' },
          { k: 'Hop Count',   v: '0' },
          { k: 'Subnet',      v: '10.1.1.0/24  (client subnet)' },
        ],
        relayState: 'idle', poolState: { offered: null, leased: null },
      },
      {
        step: 2,
        title: 'Step 2 — Relay Agent Intercepts & Unicasts to DHCP Server',
        tag: 'RELAY FWD', tagColor: 'var(--purple)', tagBg: 'rgba(167,139,250,0.12)',
        desc: 'The <strong>DHCP Relay Agent</strong> (router interface on 10.1.1.1) intercepts the broadcast. It sets <strong>giaddr = 10.1.1.1</strong> (its own IP on the client subnet) and increments <strong>hops = 1</strong>. It then <em>unicasts</em> the modified packet to the DHCP server at 10.2.2.1 on UDP port 67. The DHCP server uses giaddr to know which pool to assign from.',
        from: 'relay', to: 'dhcp', via: [],
        pktColor: '#a78bfa', pktLabel: 'RELAY→',
        pktCard: ['DHCPDISCOVER (Unicast)', 'giaddr: 10.1.1.1  ← KEY FIELD', 'Src: 10.1.1.1 → 10.2.2.1', 'Hops: 1  UDP 67 → 67'],
        wsOptions: [
          { num: '(53)', name: 'Message Type',      val: 'DISCOVER  (unchanged)' },
          { num: '(61)', name: 'Client Identifier', val: 'AA:BB:CC:DD:EE:FF' },
          { num: '(12)', name: 'Host Name',          val: 'CLIENT-PC' },
          { num: '(255)',name: 'End',                val: '—' },
        ],
        fields: [
          { k: 'Src IP',      v: '10.1.1.1  (relay interface)',  c: '#a78bfa' },
          { k: 'Dst IP',      v: '10.2.2.1  (DHCP server)',      c: '#a78bfa' },
          { k: 'giaddr',      v: '10.1.1.1  ← server uses this!',c: '#fbbf24' },
          { k: 'Hops',        v: '1  (incremented by relay)',     c: '#fbbf24' },
          { k: 'Src Port',    v: '67  (relay uses server port)' },
          { k: 'Dst Port',    v: '67  (DHCP server)' },
          { k: 'Why giaddr?', v: 'Server picks pool matching giaddr',c: '#38d9c0' },
          { k: 'Cisco cmd',   v: 'ip helper-address 10.2.2.1' },
        ],
        relayState: 'forwarding', poolState: { offered: null, leased: null },
      },
      {
        step: 3,
        title: 'Step 3 — Server Sends DHCPOFFER Unicast to Relay',
        tag: 'OFFER', tagColor: 'var(--green)', tagBg: 'rgba(74,222,128,0.12)',
        desc: 'DHCP server receives the Discover. It reads <strong>giaddr = 10.1.1.1</strong> and knows the client is on the <strong>10.1.1.0/24</strong> subnet. It selects an IP from the pool for that subnet (<strong>10.1.1.100</strong>) and unicasts the OFFER directly back to the relay agent at 10.1.1.1. The client\'s MAC is in the payload.',
        from: 'dhcp', to: 'relay', via: [],
        pktColor: '#4ade80', pktLabel: 'OFFER',
        pktCard: ['DHCPOFFER (Unicast to relay)', 'yiaddr: 10.1.1.100  (offered)', 'Src: 10.2.2.1 → 10.1.1.1', 'Opt 54: Server 10.2.2.1'],
        wsOptions: [
          { num: '(53)', name: 'Message Type',  val: 'OFFER' },
          { num: '(54)', name: 'Server ID',      val: '10.2.2.1' },
          { num: '(51)', name: 'Lease Time',     val: '86400s  (24h)' },
          { num: '(1)',  name: 'Subnet Mask',    val: '255.255.255.0' },
          { num: '(3)',  name: 'Router',         val: '10.1.1.1  (relay = GW)' },
          { num: '(6)',  name: 'DNS Server',     val: '8.8.8.8' },
          { num: '(255)',name: 'End',            val: '—' },
        ],
        fields: [
          { k: 'Src IP',      v: '10.2.2.1  (DHCP server)',      c: '#4ade80' },
          { k: 'Dst IP',      v: '10.1.1.1  (relay giaddr)',     c: '#4ade80' },
          { k: 'yiaddr',      v: '10.1.1.100  (offered IP)',     c: '#38d9c0' },
          { k: 'Pool used',   v: '10.1.1.x  (matched via giaddr)',c: '#fbbf24' },
          { k: 'Client MAC',  v: 'AA:BB:CC:DD:EE:FF  (in payload)' },
          { k: 'Lease',       v: '86400s = 24 hours' },
          { k: 'Router opt',  v: '10.1.1.1  (relay is the GW!)', c: '#a78bfa' },
          { k: 'DNS',         v: '8.8.8.8' },
        ],
        relayState: 'relaying-back', poolState: { offered: '10.1.1.100', leased: null },
      },
      {
        step: 4,
        title: 'Step 4 — Relay Broadcasts OFFER to Client',
        tag: 'RELAY BACK', tagColor: 'var(--purple)', tagBg: 'rgba(167,139,250,0.12)',
        desc: 'Relay agent receives the Offer unicast from server. Since the client has no IP yet, the relay <strong>broadcasts</strong> it on the client subnet (255.255.255.255) — or unicasts to the client MAC if the client set the broadcast bit to 0 in Flags. The client recognises the reply via its XID (transaction ID) matching.',
        from: 'relay', to: 'pc', via: ['sw'],
        pktColor: '#a78bfa', pktLabel: '←RELAY',
        pktCard: ['DHCPOFFER (Broadcast to client)', 'yiaddr: 10.1.1.100', 'Src: 10.1.1.1 → 255.255.255.255', 'Client matches on XID'],
        wsOptions: [
          { num: '(53)', name: 'Message Type', val: 'OFFER  (relayed)' },
          { num: '(54)', name: 'Server ID',    val: '10.2.2.1  (remote server)' },
          { num: '(51)', name: 'Lease Time',   val: '86400s' },
          { num: '(3)',  name: 'Router',       val: '10.1.1.1' },
          { num: '(6)',  name: 'DNS',          val: '8.8.8.8' },
          { num: '(255)',name: 'End',          val: '—' },
        ],
        fields: [
          { k: 'Src IP',      v: '10.1.1.1  (relay interface)',  c: '#a78bfa' },
          { k: 'Dst IP',      v: '255.255.255.255  (bcast)',     c: '#fbbf24' },
          { k: 'yiaddr',      v: '10.1.1.100  (for the client)' },
          { k: 'Client ID',   v: 'Matched by XID = 0x3D1D8C6A' },
          { k: 'Bcast flag',  v: '0x8000 = force broadcast',    c: '#38d9c0' },
          { k: 'Relay role',  v: 'Just forwarding — not modifying' },
          { k: 'Client sees', v: 'Offer from 10.2.2.1 (server ID)' },
          { k: 'Next',        v: 'Client sends REQUEST broadcast' },
        ],
        relayState: 'relaying-back', poolState: { offered: '10.1.1.100', leased: null },
      },
      {
        step: 5,
        title: 'Step 5 — Client Broadcasts REQUEST → Relay Forwards',
        tag: 'REQUEST', tagColor: 'var(--blue)', tagBg: 'rgba(91,156,246,0.12)',
        desc: 'Client broadcasts DHCPREQUEST (still 0.0.0.0 → 255.255.255.255) accepting the offered IP. The relay intercepts again, sets <strong>giaddr = 10.1.1.1</strong>, and unicasts to the DHCP server. The server sees the REQUEST and prepares the final ACK.',
        from: 'pc', to: 'dhcp', via: ['sw', 'relay'],
        pktColor: '#5b9cf6', pktLabel: 'REQ',
        pktCard: ['DHCPREQUEST (Broadcast)', '→ Relay intercepts → Unicast', 'Opt 50: Req 10.1.1.100', 'Opt 54: Server 10.2.2.1'],
        wsOptions: [
          { num: '(53)', name: 'Message Type',  val: 'REQUEST' },
          { num: '(50)', name: 'Requested IP',  val: '10.1.1.100' },
          { num: '(54)', name: 'Server ID',     val: '10.2.2.1' },
          { num: '(61)', name: 'Client ID',     val: 'AA:BB:CC:DD:EE:FF' },
          { num: '(255)',name: 'End',           val: '—' },
        ],
        fields: [
          { k: 'Src IP',      v: '0.0.0.0  (still no IP)',       c: '#f87171' },
          { k: 'Dst IP',      v: '255.255.255.255  (bcast)',     c: '#fbbf24' },
          { k: 'Relay adds',  v: 'giaddr = 10.1.1.1  hops = 1', c: '#a78bfa' },
          { k: 'Req IP',      v: '10.1.1.100  (from offer)',     c: '#38d9c0' },
          { k: 'Server ID',   v: '10.2.2.1  (picked this server)' },
          { k: 'Other srvrs', v: 'See REQUEST → release reservation' },
          { k: 'Cisco',       v: 'ip helper-address handles this too' },
          { k: 'Next',        v: 'Server sends ACK → relay → client' },
        ],
        relayState: 'forwarding', poolState: { offered: '10.1.1.100', leased: null },
      },
      {
        step: 6,
        title: 'Step 6 — Server ACKs → Relay Delivers → Client LEASED 🎉',
        tag: 'ACK ✓', tagColor: 'var(--cyan)', tagBg: 'rgba(56,217,192,0.12)',
        desc: '🎉 Server sends DHCPACK unicast to relay (giaddr). Relay broadcasts it to the client subnet. Client receives ACK, configures its NIC with <strong>10.1.1.100/24</strong>, gateway <strong>10.1.1.1</strong>, DNS <strong>8.8.8.8</strong>. Lease timer begins. The relay agent enabled DHCP to cross the subnet boundary with just one command on the router.',
        from: 'dhcp', to: 'pc', via: ['relay', 'sw'],
        pktColor: '#38d9c0', pktLabel: 'ACK ✓',
        pktCard: ['DHCPACK → Relay → Client', 'Assigned: 10.1.1.100/24', 'GW: 10.1.1.1  DNS: 8.8.8.8', 'Lease: 86400s  T1: 43200s'],
        wsOptions: [
          { num: '(53)', name: 'Message Type',   val: 'ACK' },
          { num: '(54)', name: 'Server ID',       val: '10.2.2.1' },
          { num: '(51)', name: 'Lease Time',      val: '86400s  (24h)' },
          { num: '(58)', name: 'Renewal T1',      val: '43200s  (50%)' },
          { num: '(59)', name: 'Rebinding T2',    val: '75600s  (87.5%)' },
          { num: '(1)',  name: 'Subnet Mask',     val: '255.255.255.0' },
          { num: '(3)',  name: 'Router',          val: '10.1.1.1' },
          { num: '(6)',  name: 'DNS',             val: '8.8.8.8' },
          { num: '(255)',name: 'End',             val: '—' },
        ],
        fields: [
          { k: 'Assigned IP',  v: '10.1.1.100 ✓',               c: '#4ade80' },
          { k: 'Subnet Mask',  v: '255.255.255.0' },
          { k: 'Gateway',      v: '10.1.1.1  (the relay itself!)',c: '#a78bfa' },
          { k: 'DNS',          v: '8.8.8.8' },
          { k: 'Lease',        v: '86400s = 24 hours' },
          { k: 'T1 Renew',     v: '43200s  (at 50%)' },
          { k: 'T2 Rebind',    v: '75600s  (at 87.5%)' },
          { k: 'Cisco cmd',    v: 'ip helper-address 10.2.2.1  ✓',c: '#4ade80' },
        ],
        relayState: 'done', poolState: { offered: null, leased: '10.1.1.100' },
      },
    ],
  
    // ────────────────────────────────────────────────
    // SCENARIO 2: OPTION 82 (Relay Agent Information)
    // ────────────────────────────────────────────────
    option82: [
      {
        step: 1,
        title: 'Step 1 — What Is DHCP Option 82?',
        tag: 'OPTION 82', tagColor: 'var(--cyan)', tagBg: 'rgba(56,217,192,0.12)',
        desc: '<strong>DHCP Option 82</strong> (Relay Agent Information — RFC 3046) allows the relay agent to insert subscriber identity information into DHCP packets before forwarding to the server. The server uses this to assign specific IPs, apply policies, or log which physical port a client is on. Critical for ISPs and enterprise campus networks.',
        from: 'pc', to: 'relay', via: ['sw'],
        pktColor: '#38d9c0', pktLabel: 'DISC',
        pktCard: ['DHCPDISCOVER arrives at relay', 'Relay will INSERT Option 82', 'Circuit-ID + Remote-ID', 'Before forwarding to server'],
        wsOptions: [
          { num: '(53)', name: 'Message Type', val: 'DISCOVER' },
          { num: '(61)', name: 'Client ID',    val: 'AA:BB:CC:DD:EE:FF' },
          { num: '(55)', name: 'Param Request',val: 'Mask,GW,DNS' },
          { num: '(255)',name: 'End',          val: '—' },
        ],
        fields: [
          { k: 'Use case',    v: 'ISP / Campus access layer',     c: '#38d9c0' },
          { k: 'Option 82',   v: 'RFC 3046  Relay Agent Info',    c: '#38d9c0' },
          { k: 'Sub-option 1',v: 'Circuit-ID  (port/VLAN info)',  c: '#fbbf24' },
          { k: 'Sub-option 2',v: 'Remote-ID  (relay MAC/hostname)',c: '#fbbf24' },
          { k: 'Sub-option 5',v: 'Link Selection  (giaddr alt.)', c: '#a78bfa' },
          { k: 'Sub-option 9',v: 'Vendor-Specific  (VSI)',        c: '#a78bfa' },
          { k: 'Cisco',       v: 'ip dhcp relay information option'},
          { k: 'Trust',       v: 'ip dhcp snooping trust  (uplinks)' },
        ],
        relayState: 'idle', poolState: { offered: null, leased: null },
      },
      {
        step: 2,
        title: 'Step 2 — Relay Inserts Option 82 and Forwards',
        tag: 'OPT 82 INSERT', tagColor: 'var(--cyan)', tagBg: 'rgba(56,217,192,0.12)',
        desc: 'The relay agent inserts <strong>Option 82</strong> sub-options into the DHCP packet before forwarding. <strong>Circuit-ID</strong>: identifies the physical port/VLAN the client is connected to (e.g. Gi0/1:VLAN10). <strong>Remote-ID</strong>: identifies the relay device itself (typically its MAC or hostname). The DHCP server can use these to enforce policies.',
        from: 'relay', to: 'dhcp', via: [],
        pktColor: '#38d9c0', pktLabel: '82→',
        pktCard: ['DHCPDISCOVER + Option 82', 'Circuit-ID: Gi0/1:VLAN10', 'Remote-ID: relay-mac', 'giaddr: 10.1.1.1  Hops: 1'],
        wsOptions: [
          { num: '(53)', name: 'Message Type', val: 'DISCOVER' },
          { num: '(82)', name: 'Relay Agent Info ← INSERTED', val: '' },
          { num: '  Sub1', name: 'Circuit-ID',  val: '"Gi0/1:VLAN10"' },
          { num: '  Sub2', name: 'Remote-ID',   val: 'AA:BB:CC:00:00:01  (relay MAC)' },
          { num: '(255)', name: 'End',          val: '—' },
        ],
        fields: [
          { k: 'Circuit-ID',  v: '"Gi0/1:VLAN10"  (port+VLAN)',  c: '#38d9c0' },
          { k: 'Remote-ID',   v: 'AA:BB:CC:00:00:01  (relay MAC)',c: '#38d9c0' },
          { k: 'Server use',  v: 'Assign IP based on port/VLAN',  c: '#fbbf24' },
          { k: 'Policy',      v: 'Block unknown circuits',        c: '#f87171' },
          { k: 'Logging',     v: 'Track IP→port in DHCP server',  c: '#4ade80' },
          { k: 'giaddr',      v: '10.1.1.1  (relay IP, as always)' },
          { k: 'IOS cmd',     v: 'ip dhcp relay information option'},
          { k: 'IOS cmd',     v: 'ip dhcp relay information policy replace' },
        ],
        relayState: 'forwarding', poolState: { offered: null, leased: null },
      },
      {
        step: 3,
        title: 'Step 3 — Server Reads Option 82 → Policy Decision',
        tag: 'POLICY', tagColor: 'var(--purple)', tagBg: 'rgba(167,139,250,0.12)',
        desc: 'The DHCP server reads the Option 82 fields and can: (1) Assign a <strong>specific IP</strong> based on Circuit-ID (static-like binding). (2) Apply <strong>different lease times</strong> per VLAN. (3) <strong>Reject</strong> requests from unknown circuits. (4) Log the port-to-IP mapping for network management. The server strips Option 82 from the reply (or the relay strips it).',
        from: 'dhcp', to: 'relay', via: [],
        pktColor: '#a78bfa', pktLabel: 'OFFER',
        pktCard: ['DHCPOFFER to relay', 'yiaddr: 10.1.1.100', 'Policy applied via Opt 82', 'Option 82 stripped from reply'],
        wsOptions: [
          { num: '(53)', name: 'Message Type', val: 'OFFER' },
          { num: '(54)', name: 'Server ID',    val: '10.2.2.1' },
          { num: '(51)', name: 'Lease Time',   val: '86400s' },
          { num: '(1)',  name: 'Subnet Mask',  val: '255.255.255.0' },
          { num: '(3)',  name: 'Router',       val: '10.1.1.1' },
          { num: '(255)',name: 'End',          val: '— (no Opt 82 in reply)' },
        ],
        fields: [
          { k: 'Policy applied',v: 'Circuit Gi0/1:VLAN10 → .100', c: '#a78bfa' },
          { k: 'Static binding', v: 'Circuit-ID maps to fixed IP', c: '#4ade80' },
          { k: 'Opt 82 strip',   v: 'Server or relay strips on reply' },
          { k: 'RFC 3046',       v: 'Strip on reply (default behaviour)'},
          { k: 'Lease time',     v: 'Can differ per VLAN/circuit',  c: '#38d9c0' },
          { k: 'Reject unknown', v: 'If circuit not in server policy',c: '#f87171' },
          { k: 'ISP use',        v: 'PPPoE + DHCP over DSL/GPON',   c: '#a78bfa' },
          { k: 'Next',           v: 'Relay delivers OFFER to client' },
        ],
        relayState: 'relaying-back', poolState: { offered: '10.1.1.100', leased: null },
      },
      {
        step: 4,
        title: 'Step 4 — DHCP Snooping + Option 82 (Security)',
        tag: 'SNOOPING', tagColor: 'var(--red)', tagBg: 'rgba(248,113,113,0.12)',
        desc: '<strong>DHCP Snooping</strong> works hand-in-hand with Option 82. Only <em>trusted</em> ports (uplinks to real DHCP servers) can send DHCP replies. Untrusted ports (client access) that send OFFER/ACK are blocked — preventing rogue DHCP servers. Option 82 adds subscriber identity so the server can enforce per-port policy.',
        from: 'relay', to: 'pc', via: ['sw'],
        pktColor: '#f87171', pktLabel: 'SNOOP',
        pktCard: ['DHCP Snooping on Switch', 'Trusted: uplink to relay', 'Untrusted: client ports', 'Rogue DHCP server = BLOCKED'],
        wsOptions: [
          { num: 'Trust', name: 'Uplink port',        val: 'gi0/24 — TRUSTED' },
          { num: 'Drop',  name: 'Rogue OFFER on gi0/1',val: 'BLOCKED by snooping' },
          { num: 'Log',   name: 'DHCP binding table',  val: 'IP→MAC→Port→VLAN' },
          { num: 'Opt',   name: 'ip dhcp snooping',    val: 'vlan 10,20' },
          { num: 'Opt',   name: 'no ip dhcp snooping', val: 'information option (if no relay)' },
        ],
        fields: [
          { k: 'Snooping',    v: 'ip dhcp snooping  (global)',    c: '#f87171' },
          { k: 'VLAN scope',  v: 'ip dhcp snooping vlan 10',      c: '#f87171' },
          { k: 'Trusted port',v: 'ip dhcp snooping trust',        c: '#4ade80' },
          { k: 'Binding tbl', v: 'IP + MAC + Port + VLAN + Lease',c: '#38d9c0' },
          { k: 'Rate limit',  v: 'ip dhcp snooping limit rate 15' },
          { k: 'Rogue srvr',  v: 'OFFER on untrusted → dropped!', c: '#f87171' },
          { k: 'DAI',         v: 'Dynamic ARP Inspection uses table',c: '#a78bfa' },
          { k: 'IP Source Gd',v: 'Source Guard also uses table',   c: '#a78bfa' },
        ],
        relayState: 'done', poolState: { offered: null, leased: '10.1.1.100' },
      },
    ],
  
    // ────────────────────────────────────────────────
    // SCENARIO 3: MULTI-SERVER (Redundant DHCP)
    // ────────────────────────────────────────────────
    multiserver: [
      {
        step: 1,
        title: 'Step 1 — Relay Configured with Two DHCP Servers',
        tag: 'REDUNDANT', tagColor: 'var(--amber)', tagBg: 'rgba(251,191,36,0.12)',
        desc: 'A Cisco router can have <strong>multiple ip helper-address</strong> statements on one interface. When the relay receives a DHCPDISCOVER, it forwards a copy to <strong>each</strong> DHCP server listed. Both servers receive the request and may both respond with offers — the client accepts the first offer and the other reservation expires.',
        from: 'pc', to: 'relay', via: ['sw'],
        pktColor: '#fbbf24', pktLabel: 'DISC',
        pktCard: ['DHCPDISCOVER arrives', 'Relay has 2 helper addresses', 'Primary: 10.2.2.1', 'Secondary: 10.2.2.2'],
        wsOptions: [
          { num: '(53)', name: 'Message Type', val: 'DISCOVER' },
          { num: '(61)', name: 'Client ID',    val: 'AA:BB:CC:DD:EE:FF' },
          { num: '(255)',name: 'End',          val: '—' },
        ],
        fields: [
          { k: 'IOS cmd 1',   v: 'ip helper-address 10.2.2.1',    c: '#fbbf24' },
          { k: 'IOS cmd 2',   v: 'ip helper-address 10.2.2.2',    c: '#fbbf24' },
          { k: 'Behaviour',   v: 'Relay forwards to BOTH servers', c: '#38d9c0' },
          { k: 'Both reply',  v: 'Client gets 2 offers → takes first' },
          { k: 'Split pools', v: 'Each server has non-overlapping ranges!' },
          { k: 'SRV1 pool',   v: '10.1.1.100–150  (primary)' },
          { k: 'SRV2 pool',   v: '10.1.1.151–200  (secondary)' },
          { k: 'Failover',    v: 'ISC DHCP failover / Windows DHCP HA' },
        ],
        relayState: 'idle', poolState: { offered: null, leased: null },
      },
      {
        step: 2,
        title: 'Step 2 — Relay Forwards to Both Servers Simultaneously',
        tag: 'DUAL FWD', tagColor: 'var(--purple)', tagBg: 'rgba(167,139,250,0.12)',
        desc: 'The relay forwards the DISCOVER to <strong>both</strong> helper addresses as separate unicast packets. Each server independently checks its pool for giaddr 10.1.1.x, picks an IP, and sends an OFFER back to the relay. This provides redundancy: if server 1 is down, server 2 still responds.',
        from: 'relay', to: 'dhcp', via: [],
        pktColor: '#a78bfa', pktLabel: '→ ×2',
        pktCard: ['2× DHCPDISCOVER unicasts', '→ 10.2.2.1  (primary)', '→ 10.2.2.2  (secondary)', 'Same giaddr: 10.1.1.1'],
        wsOptions: [
          { num: 'Copy 1', name: '→ Server 10.2.2.1', val: 'DISCOVER (giaddr 10.1.1.1)' },
          { num: 'Copy 2', name: '→ Server 10.2.2.2', val: 'DISCOVER (giaddr 10.1.1.1)' },
          { num: 'XID',    name: 'Transaction ID',     val: '0x3D1D8C6A  (same in both)' },
        ],
        fields: [
          { k: 'Copy 1 dst',  v: '10.2.2.1  (primary server)',    c: '#4ade80' },
          { k: 'Copy 2 dst',  v: '10.2.2.2  (secondary server)',  c: '#38d9c0' },
          { k: 'Same XID',    v: '0x3D1D8C6A in both copies',     c: '#fbbf24' },
          { k: 'Same giaddr', v: '10.1.1.1  in both copies' },
          { k: 'Server 1',    v: 'Offers 10.1.1.100  (if alive)' },
          { k: 'Server 2',    v: 'Offers 10.1.1.151  (if srv1 down)' },
          { k: 'Client',      v: 'Accepts FIRST offer received' },
          { k: 'Winner',      v: 'Usually primary (lower latency)' },
        ],
        relayState: 'forwarding', poolState: { offered: null, leased: null },
      },
      {
        step: 3,
        title: 'Step 3 — Primary Server Offers First → Client Accepts',
        tag: 'PRIMARY WINS', tagColor: 'var(--green)', tagBg: 'rgba(74,222,128,0.12)',
        desc: 'Primary server responds first with OFFER for 10.1.1.100. Client broadcasts REQUEST specifying <strong>Server ID = 10.2.2.1</strong>. When the secondary server sees the REQUEST with a different Server ID, it knows its offer was not accepted and <strong>releases its reservation</strong> automatically. No configuration needed.',
        from: 'dhcp', to: 'pc', via: ['relay', 'sw'],
        pktColor: '#4ade80', pktLabel: 'OFFER',
        pktCard: ['Primary OFFER wins!', 'yiaddr: 10.1.1.100', 'Client REQUESTs Server 10.2.2.1', 'Secondary releases reservation'],
        wsOptions: [
          { num: '(53)', name: 'Message Type', val: 'OFFER  (from 10.2.2.1)' },
          { num: '(54)', name: 'Server ID',    val: '10.2.2.1  (primary)' },
          { num: '(51)', name: 'Lease Time',   val: '86400s' },
          { num: '(1)',  name: 'Subnet Mask',  val: '255.255.255.0' },
          { num: '(3)',  name: 'Router',       val: '10.1.1.1' },
          { num: '(255)',name: 'End',          val: '—' },
        ],
        fields: [
          { k: 'Primary offer',  v: '10.1.1.100  from 10.2.2.1',  c: '#4ade80' },
          { k: 'Secondary offer',v: '10.1.1.151  from 10.2.2.2',  c: '#38d9c0' },
          { k: 'Client picks',   v: 'First offer = primary',       c: '#4ade80' },
          { k: 'REQUEST bcast',  v: 'Server ID = 10.2.2.1' },
          { k: 'Secondary sees', v: 'Different Server ID → releases!' },
          { k: 'Pool overlap',   v: 'Must use non-overlapping ranges!',c: '#f87171' },
          { k: 'DHCP failover',  v: 'ISC / Windows for synchronized HA',c: '#a78bfa' },
          { k: 'Final result',   v: '10.1.1.100 leased from primary ✓', c: '#4ade80' },
        ],
        relayState: 'done', poolState: { offered: null, leased: '10.1.1.100' },
      },
    ],
  
    // ────────────────────────────────────────────────
    // SCENARIO 4: LEASE RENEWAL VIA RELAY
    // ────────────────────────────────────────────────
    renewal: [
      {
        step: 1,
        title: 'Step 1 — T1 Timer Expires (50% of Lease) → Client Unicasts',
        tag: 'T1 RENEWAL', tagColor: 'var(--blue)', tagBg: 'rgba(91,156,246,0.12)',
        desc: 'At <strong>T1 (50% of lease, typically 12h)</strong> the client attempts renewal by <strong>unicasting</strong> DHCPREQUEST directly to the server IP — <em>not broadcasting</em>. The client already has an IP (10.1.1.100) and knows the server address (10.2.2.1). A relay is <strong>not needed</strong> for unicast renewal — the packet routes normally.',
        from: 'pc', to: 'dhcp', via: ['sw', 'relay'],
        pktColor: '#5b9cf6', pktLabel: 'RENEW',
        pktCard: ['DHCPREQUEST (Unicast)', 'Src: 10.1.1.100 → 10.2.2.1', 'ciaddr: 10.1.1.100', 'No relay needed — routed!'],
        wsOptions: [
          { num: '(53)', name: 'Message Type', val: 'REQUEST  (Renewal)' },
          { num: '(61)', name: 'Client ID',    val: 'AA:BB:CC:DD:EE:FF' },
          { num: '(55)', name: 'Param Request',val: 'Mask,GW,DNS,Domain' },
          { num: '(255)',name: 'End',          val: '—  (no Opt 50/54 in unicast renew)' },
        ],
        fields: [
          { k: 'Src IP',      v: '10.1.1.100  (client has IP now)', c: '#4ade80' },
          { k: 'Dst IP',      v: '10.2.2.1  (server — unicast!)',   c: '#5b9cf6' },
          { k: 'ciaddr',      v: '10.1.1.100  (current IP)',        c: '#38d9c0' },
          { k: 'T1',          v: '43200s  (50% of 86400s lease)' },
          { k: 'No relay',    v: 'Unicast routes — relay not invoked',c: '#4ade80' },
          { k: 'No giaddr',   v: '0.0.0.0  (relay not involved)' },
          { k: 'No Opt 50/54',v: 'Not needed in unicast renewal' },
          { k: 'If denied',   v: 'Client waits until T2 to rebind' },
        ],
        relayState: 'idle', poolState: { offered: null, leased: '10.1.1.100' },
      },
      {
        step: 2,
        title: 'Step 2 — Server Renews → ACK Unicast Back to Client',
        tag: 'RENEWED ✓', tagColor: 'var(--green)', tagBg: 'rgba(74,222,128,0.12)',
        desc: 'DHCP server receives the unicast renewal REQUEST. It validates the lease, resets the timer to another full 86400 seconds, and <strong>unicasts DHCPACK</strong> directly to the client at 10.1.1.100. No relay involved — this is a direct server-to-client exchange once the client has a routable IP.',
        from: 'dhcp', to: 'pc', via: ['relay', 'sw'],
        pktColor: '#4ade80', pktLabel: 'ACK ✓',
        pktCard: ['DHCPACK (Unicast)', 'Src: 10.2.2.1 → 10.1.1.100', 'Lease reset: 86400s', 'T1, T2 timers reset'],
        wsOptions: [
          { num: '(53)', name: 'Message Type', val: 'ACK' },
          { num: '(54)', name: 'Server ID',    val: '10.2.2.1' },
          { num: '(51)', name: 'Lease Time',   val: '86400s  (reset!)' },
          { num: '(58)', name: 'T1',           val: '43200s  (reset)' },
          { num: '(59)', name: 'T2',           val: '75600s  (reset)' },
          { num: '(1)',  name: 'Subnet Mask',  val: '255.255.255.0' },
          { num: '(3)',  name: 'Router',       val: '10.1.1.1' },
          { num: '(255)',name: 'End',          val: '—' },
        ],
        fields: [
          { k: 'Lease reset',  v: 'Full 86400s renewed ✓',         c: '#4ade80' },
          { k: 'Src IP',       v: '10.2.2.1  (server direct)',      c: '#4ade80' },
          { k: 'Dst IP',       v: '10.1.1.100  (client direct)' },
          { k: 'T1 reset',     v: '43200s from now' },
          { k: 'T2 reset',     v: '75600s from now' },
          { k: 'Relay not used',v: 'Direct routed unicast',        c: '#4ade80' },
          { k: 'If T1 fails',  v: 'Client waits for T2 (87.5%)' },
          { k: 'If T2 fails',  v: 'Client broadcasts (rebind any server)' },
        ],
        relayState: 'done', poolState: { offered: null, leased: '10.1.1.100' },
      },
      {
        step: 3,
        title: 'Step 3 — T2 Rebind: Client Broadcasts (Relay Needed Again)',
        tag: 'T2 REBIND', tagColor: 'var(--amber)', tagBg: 'rgba(251,191,36,0.12)',
        desc: 'If the server did not respond during T1 renewal, at <strong>T2 (87.5% of lease)</strong> the client transitions to <strong>REBINDING</strong> state and <strong>broadcasts</strong> DHCPREQUEST — hoping <em>any</em> DHCP server can renew the lease. Now the relay is needed again since this is a broadcast. Any server can respond, not just the original one.',
        from: 'pc', to: 'dhcp', via: ['sw', 'relay'],
        pktColor: '#fbbf24', pktLabel: 'REBND',
        pktCard: ['DHCPREQUEST (Broadcast)', 'T2 Rebind — any server OK!', 'Src: 10.1.1.100 → 255.255.255.255', 'Relay re-invoked for broadcast'],
        wsOptions: [
          { num: '(53)', name: 'Message Type', val: 'REQUEST  (Rebinding)' },
          { num: '(61)', name: 'Client ID',    val: 'AA:BB:CC:DD:EE:FF' },
          { num: '(55)', name: 'Param Request',val: 'Mask,GW,DNS,Domain' },
          { num: '(255)',name: 'End',          val: '—' },
        ],
        fields: [
          { k: 'State',       v: 'REBINDING  (T2 expired)',        c: '#fbbf24' },
          { k: 'Src IP',      v: '10.1.1.100  (still has lease)',  c: '#4ade80' },
          { k: 'Dst IP',      v: '255.255.255.255  (any server)',  c: '#fbbf24' },
          { k: 'Relay',       v: 'Re-invoked — broadcast again',   c: '#a78bfa' },
          { k: 'ciaddr',      v: '10.1.1.100  (current)' },
          { k: 'Any server',  v: 'Not bound to original server' },
          { k: 'If denied',   v: 'Lease expires → lose IP  (INIT)',c: '#f87171' },
          { k: 'Risk',        v: 'Disruption if no server responds',c: '#f87171' },
        ],
        relayState: 'forwarding', poolState: { offered: null, leased: '10.1.1.100' },
      },
    ],
  
    // ────────────────────────────────────────────────
    // SCENARIO 5: DECLINE & NAK
    // ────────────────────────────────────────────────
    decline: [
      {
        step: 1,
        title: 'Step 1 — Client ARP-Probes Offered IP → Conflict!',
        tag: 'ARP PROBE', tagColor: 'var(--red)', tagBg: 'rgba(248,113,113,0.12)',
        desc: 'After receiving a DHCPOFFER for 10.1.1.100, the client performs an <strong>ARP probe</strong> (RFC 2131 §2.2) — it sends a gratuitous ARP "Who has 10.1.1.100?" to check if the IP is already in use. If another device replies to the ARP, the IP is already taken and the client must <strong>DECLINE</strong> the offer.',
        from: 'pc', to: 'sw', via: [],
        pktColor: '#f87171', pktLabel: 'ARP?',
        pktCard: ['ARP Probe (Gratuitous)', 'Who has 10.1.1.100?', 'Src: 0.0.0.0  (probing)', 'Another device replies → CONFLICT!'],
        wsOptions: [
          { num: 'ARP',  name: 'Opcode',        val: '1  (Request)' },
          { num: 'ARP',  name: 'Sender IP',      val: '0.0.0.0  (probing — no IP yet)' },
          { num: 'ARP',  name: 'Target IP',      val: '10.1.1.100  (offered)' },
          { num: 'ARP',  name: 'Result',         val: 'REPLY received → CONFLICT!' },
        ],
        fields: [
          { k: 'ARP Probe',   v: 'RFC 2131 §2.2 — mandatory!',    c: '#f87171' },
          { k: 'Sender IP',   v: '0.0.0.0  (not yet configured)' },
          { k: 'Target IP',   v: '10.1.1.100  (offered by server)' },
          { k: 'If reply',    v: 'IP already in use → DECLINE!',   c: '#f87171' },
          { k: 'If no reply', v: 'Safe to use → send REQUEST',     c: '#4ade80' },
          { k: 'Time',        v: 'Wait ~1-2s for any ARP reply' },
          { k: 'Windows',     v: 'Performs ARP probe by default' },
          { k: 'Linux',       v: 'arping / gratuitous ARP on config' },
        ],
        relayState: 'idle', poolState: { offered: '10.1.1.100', leased: null },
      },
      {
        step: 2,
        title: 'Step 2 — Client Sends DHCPDECLINE via Relay',
        tag: 'DECLINE', tagColor: 'var(--red)', tagBg: 'rgba(248,113,113,0.12)',
        desc: 'Client sends <strong>DHCPDECLINE</strong> to the server — informing it that the offered IP (10.1.1.100) is already in use and should be <strong>quarantined</strong>. The server marks this IP as conflicted and removes it from the pool for a configurable period. The client then starts the DORA process from scratch to get a different IP.',
        from: 'pc', to: 'dhcp', via: ['sw', 'relay'],
        pktColor: '#f87171', pktLabel: 'DECL',
        pktCard: ['DHCPDECLINE', 'IP 10.1.1.100 = CONFLICT!', 'Opt 50: 10.1.1.100', 'Server marks as quarantined'],
        wsOptions: [
          { num: '(53)', name: 'Message Type', val: 'DECLINE' },
          { num: '(50)', name: 'Requested IP',  val: '10.1.1.100  (conflicted!)' },
          { num: '(54)', name: 'Server ID',     val: '10.2.2.1' },
          { num: '(61)', name: 'Client ID',     val: 'AA:BB:CC:DD:EE:FF' },
          { num: '(56)', name: 'Message',       val: '"IP already in use"' },
          { num: '(255)',name: 'End',           val: '—' },
        ],
        fields: [
          { k: 'Msg Type',    v: '4 = DHCPDECLINE',               c: '#f87171' },
          { k: 'Offered IP',  v: '10.1.1.100  (ARP conflict!)',   c: '#f87171' },
          { k: 'Server action',v: 'Mark .100 as quarantined',     c: '#fbbf24' },
          { k: 'Quarantine',  v: 'Configurable conflict period' },
          { k: 'IOS',         v: 'ip dhcp conflict logging',       c: '#38d9c0' },
          { k: 'IOS',         v: 'clear ip dhcp conflict *',       c: '#38d9c0' },
          { k: 'Client next', v: 'Restart DORA from DISCOVER',    c: '#5b9cf6' },
          { k: 'New offer',   v: 'Server will offer .101 instead' },
        ],
        relayState: 'forwarding', poolState: { offered: null, leased: null },
      },
      {
        step: 3,
        title: 'Step 3 — Server Sends DHCPNAK (Invalid REQUEST)',
        tag: 'NAK', tagColor: 'var(--red)', tagBg: 'rgba(248,113,113,0.12)',
        desc: '<strong>DHCPNAK</strong> (Negative Acknowledgement) is sent by the server when it <em>rejects</em> a DHCPREQUEST. Reasons: (1) Client moved subnets (IP is wrong for this subnet). (2) Lease expired and IP was reassigned. (3) Client is requesting an IP not in this server\'s pool. The client must restart DORA.',
        from: 'dhcp', to: 'pc', via: ['relay', 'sw'],
        pktColor: '#f87171', pktLabel: 'NAK',
        pktCard: ['DHCPNAK — Request Denied!', 'Opt 53: NAK (6)', 'Client must restart DORA', 'Common: moved subnets'],
        wsOptions: [
          { num: '(53)', name: 'Message Type', val: 'NAK  (6)' },
          { num: '(54)', name: 'Server ID',    val: '10.2.2.1' },
          { num: '(56)', name: 'Message',      val: '"Client on wrong subnet"' },
          { num: '(255)',name: 'End',          val: '—' },
        ],
        fields: [
          { k: 'Msg Type',    v: '6 = DHCPNAK',                   c: '#f87171' },
          { k: 'NAK cause 1', v: 'Wrong subnet (client moved)',    c: '#f87171' },
          { k: 'NAK cause 2', v: 'Lease expired → IP reassigned', c: '#f87171' },
          { k: 'NAK cause 3', v: 'IP not in server pool',         c: '#f87171' },
          { k: 'Client action',v: 'Must restart DORA!',           c: '#fbbf24' },
          { k: 'Broadcast',   v: 'NAK always broadcast',          c: '#fbbf24' },
          { k: 'Relay',       v: 'Relay delivers NAK broadcast' },
          { k: 'Wireshark',   v: 'bootp.option.dhcp == 6' },
        ],
        relayState: 'done', poolState: { offered: null, leased: null },
      },
    ],
  };
  
  // ─── Chain bar labels per scenario ───
  const RELAY_CHAINS = {
    basic:       ['DISC →','Relay Fwd','← OFFER','Relay Back','REQ →','← ACK ✓'],
    option82:    ['DISC arrives','Opt82 INSERT','Server Policy','Snooping'],
    multiserver: ['DISC →','Relay ×2','Primary Wins ✓'],
    renewal:     ['T1 Unicast','← ACK ✓','T2 Rebind Bcast'],
    decline:     ['ARP Probe','DECLINE →','← NAK'],
  };
  
  // ═══════════════════════════════════════════════════
  // TOPOLOGY DRAW
  // ═══════════════════════════════════════════════════
  function relayDrawTopo(pktX, pktY, pktColor, pktLabel, pktCard) {
    const svg = document.getElementById('relay-svg');
    if (!svg) return;
    const N = RELAY_NODES;
    const aNodes = relayActiveNodes;
  
    let html = `<defs>
      <marker id="rtr-arrow-r" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
        <path d="M1 1L7 4L1 7" fill="none" stroke="currentColor" stroke-width="1.5"/>
      </marker>
      <filter id="glow-r"><feGaussianBlur stdDeviation="3" result="b"/><feComposite in="SourceGraphic" in2="b" operator="over"/></filter>
    </defs>`;
  
    // Subnet labels
    html += `<rect x="30" y="185" width="290" height="18" rx="4" fill="rgba(251,191,36,0.06)" stroke="rgba(251,191,36,0.15)" stroke-width="0.8"/>`;
    html += `<text x="175" y="197" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#a07820">Subnet A — 10.1.1.0/24  (Client subnet)</text>`;
    html += `<rect x="430" y="185" width="290" height="18" rx="4" fill="rgba(74,222,128,0.06)" stroke="rgba(74,222,128,0.15)" stroke-width="0.8"/>`;
    html += `<text x="575" y="197" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#3a7a50">Subnet B — 10.2.2.0/24  (Server subnet)</text>`;
  
    // Edges
    const pcSwActive   = aNodes.includes('pc')   || aNodes.includes('sw');
    const swRelActive  = aNodes.includes('sw')   || aNodes.includes('relay');
    const relSrvActive = aNodes.includes('relay') || aNodes.includes('dhcp');
  
    html += svgEdge(N.pc.x,    N.pc.y,    N.sw.x,   N.sw.y,   pcSwActive,   '#5b9cf6');
    html += svgEdge(N.sw.x,    N.sw.y,    N.relay.x, N.relay.y, swRelActive, '#5b9cf6');
    html += svgEdge(N.relay.x, N.relay.y, N.dhcp.x,  N.dhcp.y, relSrvActive,'#4ade80');
  
    // Subnet divider
    html += `<line x1="${N.relay.x}" y1="60" x2="${N.relay.x}" y2="180" stroke="rgba(167,139,250,0.3)" stroke-width="1" stroke-dasharray="6,4"/>`;
    html += `<text x="${N.relay.x}" y="56" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#a78bfa">Subnet Boundary</text>`;
  
    // Nodes
    html += svgPC(N.pc.x, N.pc.y, 'relay-pc', 'PC Client\n10.1.1.x', aNodes.includes('pc'));
    html += svgSwitch(N.sw.x, N.sw.y, 'relay-sw', 'L2 Switch\nVLAN 10', aNodes.includes('sw'));
    html += svgRouter(N.relay.x, N.relay.y, 'relay-rtr', 'Relay Agent\n10.1.1.1', aNodes.includes('relay'));
    html += svgServer(N.dhcp.x, N.dhcp.y, 'relay-dhcp', 'DHCP Server\n10.2.2.1', aNodes.includes('dhcp'), '#38d9c0');
  
    // Labels
    html += `<text x="${N.relay.x}" y="${N.relay.y + 56}" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#8892b0">ip helper-address</text>`;
    html += `<text x="${N.relay.x}" y="${N.relay.y + 66}" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#a78bfa">10.2.2.1</text>`;
    html += `<text x="${N.dhcp.x}" y="${N.dhcp.y + 56}" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#5a7060">Pool: 10.1.1.100–.200</text>`;
  
    // Animated packet + floating info card
    if (pktX !== undefined) {
      html += `<circle cx="${pktX}" cy="${pktY}" r="16" fill="${pktColor}18" stroke="${pktColor}" stroke-width="2.5"/>`;
      html += `<circle cx="${pktX}" cy="${pktY}" r="9" fill="${pktColor}99"/>`;
      html += `<text x="${pktX}" y="${pktY + 3}" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" font-weight="700" fill="#fff">${pktLabel}</text>`;
  
      if (pktCard && pktCard.length) {
        const cx = Math.max(96, Math.min(pktX, 720 - 96));
        const cy = pktY - 90;
        const cw = 210, ch = 14 + pktCard.length * 14;
        html += `<rect x="${cx - cw/2}" y="${cy}" width="${cw}" height="${ch}" rx="5" fill="rgba(7,9,15,0.94)" stroke="${pktColor}" stroke-width="1.2"/>`;
        html += `<line x1="${pktX}" y1="${pktY - 16}" x2="${cx}" y2="${cy + ch}" stroke="${pktColor}" stroke-width="0.8" stroke-dasharray="3,2" opacity="0.6"/>`;
        pktCard.forEach((line, i) => {
          const fc = i === 0 ? pktColor : (i === 1 ? '#c8d0e0' : '#8892b0');
          const fw = i === 0 ? '700' : '400';
          html += `<text x="${cx}" y="${cy + 12 + i * 14}" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="${i === 0 ? 9 : 8}" font-weight="${fw}" fill="${fc}">${line}</text>`;
        });
      }
    }
  
    svg.innerHTML = html;
  }
  
  // ═══════════════════════════════════════════════════
  // ANIMATION ENGINE
  // ═══════════════════════════════════════════════════
  function relayCancelAll() {
    if (relayRafId)   { cancelAnimationFrame(relayRafId); relayRafId = null; }
    if (relayTimerId) { clearTimeout(relayTimerId);        relayTimerId = null; }
  }
  
  function relayAnimateStep(stepIdx) {
    const s = RELAY_STEPS[relayMode][stepIdx - 1];
    if (!s) return;
  
    const animatingStep = stepIdx;
    const nodes = RELAY_NODES;
    const path = [s.from, ...(s.via || []), s.to];
    const segments = [];
    for (let i = 0; i < path.length - 1; i++) {
      segments.push({ from: nodes[path[i]], to: nodes[path[i + 1]] });
    }
  
    relayActiveNodes = path;
    relayUpdateChain(stepIdx);
  
    let segIdx = 0, startTime = null;
    const segDur = relayGetSegDur();
  
    function frame(ts) {
      if (relayCurrentStep !== animatingStep) { relayRafId = null; return; }
      if (!startTime) startTime = ts;
      const elapsed = ts - startTime;
      const t = Math.min(elapsed / segDur, 1);
      const e = easeInOut(t);
      const seg = segments[segIdx];
      const px = seg.from.x + (seg.to.x - seg.from.x) * e;
      const py = seg.from.y + (seg.to.y - seg.from.y) * e;
      relayDrawTopo(px, py, s.pktColor, s.pktLabel, s.pktCard);
  
      if (t >= 1) {
        if (segIdx < segments.length - 1) {
          segIdx++;
          startTime = ts;
          relayRafId = requestAnimationFrame(frame);
        } else {
          relayRafId = null;
          relayTimerId = setTimeout(() => {
            relayTimerId = null;
            if (relayCurrentStep !== animatingStep) return;
            relayActiveNodes = [];
            relayDrawTopo();
            relayUpdateUI();
          }, 500);
        }
      } else {
        relayRafId = requestAnimationFrame(frame);
      }
    }
    relayRafId = requestAnimationFrame(frame);
  }
  
  // ═══════════════════════════════════════════════════
  // UI UPDATE
  // ═══════════════════════════════════════════════════
  function relayUpdateUI() {
    const steps = RELAY_STEPS[relayMode];
    const step  = relayCurrentStep;
    const numEl = document.getElementById('relay-step-num');
    const prog  = document.getElementById('relay-progress');
    const info  = document.getElementById('relay-step-info');
    if (numEl) numEl.textContent = step;
    if (prog)  prog.style.width = (step / steps.length * 100) + '%';
    relayUpdateChain(step);
  
    // Update total
    const totalEl = document.getElementById('relay-step-total');
    if (totalEl) totalEl.textContent = steps.length;
  
    if (step === 0) {
      if (info) info.innerHTML = `<div class="step-tag" style="background:rgba(91,156,246,0.12);color:var(--blue)">READY</div>
        <div class="step-title">Select a scenario above and press ▶ Play</div>
        <div class="step-desc">Watch how DHCP Relay Agent (ip helper-address) enables DHCP across subnets, with Option 82 subscriber identity, multi-server redundancy, lease renewal, and error handling.</div>`;
      const f = document.getElementById('relay-pkt-fields');
      if (f) f.innerHTML = '<div style="color:var(--muted);font-family:var(--mono);font-size:11px;">Start the animation to see packet fields & DHCP options…</div>';
      const ws = document.getElementById('relay-ws-options');
      if (ws) ws.innerHTML = '';
      relayRenderPool({ offered: null, leased: null });
      return;
    }
  
    const s = steps[step - 1];
    if (info) info.innerHTML = `<div class="step-tag" style="background:${s.tagBg};color:${s.tagColor}">${s.tag}</div>
      <div class="step-title">${s.title}</div>
      <div class="step-desc">${s.desc}</div>`;
  
    const fieldsEl = document.getElementById('relay-pkt-fields');
    if (fieldsEl && s.fields) {
      let fhtml = '<div class="pkt-fields">';
      s.fields.forEach(f => {
        fhtml += `<div class="pkt-field"><div class="pkt-field-key">${f.k}</div><div class="pkt-field-val" style="color:${f.c || 'var(--text)'}">${f.v}</div></div>`;
      });
      fhtml += '</div>';
      fieldsEl.innerHTML = fhtml;
    }
  
    const wsEl = document.getElementById('relay-ws-options');
    if (wsEl && s.wsOptions) {
      let whtml = `<div class="ws-options" style="margin-top:12px;"><div style="font-family:var(--mono);font-size:9px;color:var(--muted2);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">▾ DHCP Options (Wireshark view)</div>`;
      s.wsOptions.forEach(o => {
        whtml += `<div class="ws-option">
          <span class="ws-opt-arrow">▶</span>
          <span class="ws-opt-num">Opt ${o.num}</span>
          <span class="ws-opt-name">${o.name}</span>
          <span class="ws-opt-val">${o.val}</span>
        </div>`;
      });
      whtml += '</div>';
      wsEl.innerHTML = whtml;
    } else if (wsEl) {
      wsEl.innerHTML = '';
    }
  
    relayRenderPool(s.poolState || { offered: null, leased: null });
  }
  
  function relayRenderPool(state) {
    const pool = document.getElementById('relay-pool');
    const leaseInfo = document.getElementById('relay-lease-info');
    if (!pool) return;
    let html = '';
    for (let i = 100; i <= 110; i++) {
      const ip = '10.1.1.' + i;
      if (state.leased === ip)       html += `<div class="pool-ip ip-leased">10.1.1.${i} ✓</div>`;
      else if (state.offered === ip) html += `<div class="pool-ip ip-offered">10.1.1.${i} ⏳</div>`;
      else                           html += `<div class="pool-ip ip-free">10.1.1.${i}</div>`;
    }
    pool.innerHTML = html;
    if (leaseInfo) {
      if (state.leased)       leaseInfo.innerHTML = `<span style="color:var(--green)">✓ LEASED:</span> ${state.leased} → AA:BB:CC:DD:EE:FF<br>Gateway: 10.1.1.1 | DNS: 8.8.8.8 | Lease: 24h`;
      else if (state.offered) leaseInfo.innerHTML = `<span style="color:var(--amber)">⏳ OFFERED:</span> ${state.offered} temporarily reserved…`;
      else                    leaseInfo.innerHTML = `Waiting for lease negotiation…`;
    }
  }
  
  function relayUpdateChain(step) {
    const chainEl = document.getElementById('relay-chain-bar');
    if (!chainEl) return;
    const labels = RELAY_CHAINS[relayMode] || [];
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
  // MODE SELECT
  // ═══════════════════════════════════════════════════
  function relaySetMode(mode) {
    relayMode = mode;
    relayReset();
    document.querySelectorAll('.relay-mode-tab').forEach(t => t.classList.remove('active'));
    const tab = document.getElementById('relay-tab-' + mode);
    if (tab) tab.classList.add('active');
  
    const totalEl = document.getElementById('relay-step-total');
    if (totalEl) totalEl.textContent = RELAY_STEPS[mode].length;
  
    const descs = {
      basic:       `<strong style="color:var(--amber)">Basic Relay</strong> — DORA across subnets. How ip helper-address works, giaddr field, relay unicast to server, server pool selection. The core concept.`,
      option82:    `<strong style="color:var(--cyan)">Option 82</strong> — RFC 3046 Relay Agent Information. Circuit-ID, Remote-ID, DHCP snooping integration. ISP and campus subscriber identity.`,
      multiserver: `<strong style="color:var(--purple)">Multi-Server</strong> — Redundant DHCP with multiple ip helper-address entries. How the relay forwards to both, non-overlapping pools, server selection.`,
      renewal:     `<strong style="color:var(--blue)">Lease Renewal</strong> — T1 unicast renewal (no relay needed), T2 rebind broadcast (relay re-invoked). Renewal vs rebind states explained.`,
      decline:     `<strong style="color:var(--red)">DECLINE & NAK</strong> — ARP probe conflict detection, DHCPDECLINE, DHCPNAK causes. Error flows TAC engineers see every day.`,
    };
    const descEl = document.getElementById('relay-mode-desc');
    if (descEl) descEl.innerHTML = descs[mode] || '';
  }
  
  // ═══════════════════════════════════════════════════
  // PLAYBACK CONTROLS
  // ═══════════════════════════════════════════════════
  function relayStep(dir) {
    relayCancelAll();
    const steps = RELAY_STEPS[relayMode];
    const newStep = relayCurrentStep + dir;
    if (newStep < 0 || newStep > steps.length) return;
    relayCurrentStep = newStep;
    relayActiveNodes = [];
    relayDrawTopo();
    relayUpdateUI();
    if (newStep > 0) relayAnimateStep(newStep);
  }
  
  function relayTogglePlay() {
    relayPlaying = !relayPlaying;
    const btn = document.getElementById('relay-play-btn');
    if (btn) btn.textContent = relayPlaying ? '⏸ Pause' : '▶ Play';
    if (relayPlaying) relayAutoPlay();
    else clearTimeout(relayPlayTimer);
  }
  
  function relayAutoPlay() {
    if (!relayPlaying) return;
    const steps = RELAY_STEPS[relayMode];
    if (relayCurrentStep >= steps.length) {
      relayPlaying = false;
      const btn = document.getElementById('relay-play-btn');
      if (btn) btn.textContent = '▶ Play';
      return;
    }
    relayStep(1);
    relayPlayTimer = setTimeout(relayAutoPlay, relayGetAutoDelay());
  }
  
  function relayReset() {
    relayPlaying = false;
    clearTimeout(relayPlayTimer);
    relayCancelAll();
    const btn = document.getElementById('relay-play-btn');
    if (btn) btn.textContent = '▶ Play';
    relayCurrentStep = 0;
    relayActiveNodes = [];
    relayDrawTopo();
    relayUpdateUI();
    relayUpdateChain(0);
  }
  
  // ─── Init ───
  function dhcpRelayInit() {
    relaySetMode('basic');
    relayDrawTopo();
    relayRenderPool({ offered: null, leased: null });
    relayUpdateChain(0);
  }
  
  /* ── Add this to components.css ──
  .relay-mode-tab.active {
    background: rgba(91,156,246,0.12) !important;
    color: var(--blue) !important;
    border-color: var(--blue) !important;
  }
  Also add to app.js resize handler:
    if (document.getElementById('page-dhcp-relay').classList.contains('active')) relayDrawTopo();
  */