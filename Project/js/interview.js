// ═══════════════════════════════════════════════════
// INTERVIEW PREP — interview.js
// Cisco R&S: CCNA | CCNP | CCIE Level — 360+ Q
// 28 Topic Areas · In-Depth Production Answers
// Entry: interviewInit()
// ═══════════════════════════════════════════════════

let ivFilter = { level: 'ALL', topic: 'ALL', search: '' };
let ivReviewed  = new Set();
let ivExpanded  = new Set();
let ivCopyTimer = null;

// ─── QUESTION BANK ───────────────────────────────────────────────────────────
// Format: { id, level, topic, scenario, q, a, cli, keypoints }
// 'a' can use <br>, <strong>, <em> tags
// 'cli' is raw preformatted text (optional)
// 'keypoints' is a plain string (optional)

const INTERVIEW_DATA = [

  // ══════════════════════════════════════════
  // 1. OSI MODEL & TCP/IP
  // ══════════════════════════════════════════
  {
    id: 1, level: 'CCNA', topic: 'OSI Model', scenario: false,
    q: 'What are the 7 layers of the OSI model? Explain the function of each.',
    a: `The OSI model is a conceptual framework, not an implementation. Real-world protocols map onto it but don't follow it rigidly — worth saying in an interview to show you understand the distinction.<br><br>
<strong>Layer 7 — Application:</strong> User-facing protocols (HTTP, FTP, DNS, SMTP, SNMP). This is where the application itself interacts with the network stack — not the application itself, the interface to it.<br>
<strong>Layer 6 — Presentation:</strong> Data formatting, compression, encryption/decryption. SSL/TLS lives here conceptually though in practice it straddles L4–L7.<br>
<strong>Layer 5 — Session:</strong> Dialog control, session establishment and teardown (NetBIOS, RPC). Mostly theoretical in TCP/IP — TCP handles session state.<br>
<strong>Layer 4 — Transport:</strong> End-to-end delivery, segmentation, error recovery. TCP (reliable, connection-oriented) and UDP (best-effort). PDU = Segment (TCP) / Datagram (UDP).<br>
<strong>Layer 3 — Network:</strong> Logical addressing and routing (IP, ICMP, OSPF). PDU = Packet. This is where routers operate.<br>
<strong>Layer 2 — Data Link:</strong> MAC addressing, frame delivery within the same broadcast domain. PDU = Frame. Switches operate here.<br>
<strong>Layer 1 — Physical:</strong> Bits over a medium — cables, fiber, radio, voltage levels. PDU = Bit.<br><br>
<em>Mnemonic (top-down):</em> "All People Seem To Need Data Processing"<br>
<em>In interviews I often say:</em> when troubleshooting, work bottom-up (L1→L7) unless you have strong reason to suspect a higher layer first.`,
    keypoints: 'L1=Bit, L2=Frame, L3=Packet, L4=Segment. Switches=L2, Routers=L3, Hubs=L1, Firewalls/LBs=L4-L7. OSI is theoretical reference — TCP/IP is the deployed stack.'
  },
  {
    id: 2, level: 'CCNP', topic: 'OSI Model', scenario: true,
    q: 'SCENARIO — A user can ping a server by IP but not by hostname. Which OSI layer is the issue and how do you troubleshoot it?',
    a: `This is a Layer 7 / DNS resolution failure — but I always validate before jumping to conclusions. Ping by IP working confirms L1 through L3 (physical link, framing, routing) are healthy. The problem is name → IP resolution.<br><br>
<strong>My production troubleshooting sequence:</strong><br>
1. First, reproduce exactly — is it ALL hostnames or a specific one? That tells me whether it's a global DNS failure or a single record issue.<br>
2. Run <code>nslookup &lt;hostname&gt;</code> — if it times out, DNS server is unreachable or not responding. If it returns NXDOMAIN, the record genuinely doesn't exist or the domain search suffix is wrong.<br>
3. Check the DNS server IP configured on the client (<code>ipconfig /all</code> on Windows, <code>cat /etc/resolv.conf</code> on Linux). I've seen enterprise DHCP push the wrong DNS server IP after a migration — clients got the old server's address which was decommissioned.<br>
4. Ping the DNS server by IP — if unreachable, it's a routing or firewall issue, not DNS itself.<br>
5. Check the local hosts file (<code>C:\Windows\System32\drivers\etc\hosts</code>) — stale entries can override DNS and cause exactly this symptom.<br>
6. <code>ipconfig /flushdns</code> — stale negative cache entries (NXDOMAIN cached) can persist and block resolution even after the record is fixed.<br><br>
<strong>Real production gotcha I've hit:</strong> A split-horizon DNS misconfiguration where internal clients were hitting the external resolver and getting a public IP instead of the internal RFC1918 address. Ping by IP worked (both resolved) but the hostname went to the wrong server.`,
    cli: `nslookup <hostname>
nslookup <hostname> <specific-dns-server>   ! test alternate server
ping <dns-server-ip>                         ! is DNS server reachable?
ipconfig /all | findstr DNS                  ! Windows: what DNS server?
cat /etc/resolv.conf                         ! Linux: DNS config
ipconfig /flushdns                           ! clear DNS negative cache
type C:\Windows\System32\drivers\etc\hosts  ! check host overrides`,
    keypoints: 'L7/Application — DNS failure. Key checks: nslookup, DNS server reachability, hosts file, DNS cache flush, DHCP-assigned DNS accuracy.'
  },
  {
    id: 3, level: 'CCIE', topic: 'OSI Model', scenario: true,
    q: 'SCENARIO — A fiber link shows up/up at L1 but OSPF adjacency never forms. List every possible L2 and L3 reason.',
    a: `This is one of my favorite interview questions because it tests real troubleshooting depth. The up/up only confirms the physical signal (SFP receiving light, cable integrity). Everything above that can still be broken.<br><br>
<strong>Layer 2 causes I've hit in production:</strong><br>
• <strong>MTU mismatch</strong> — the most insidious one. OSPF Hello packets are small and pass fine; DBD packets with full LSA headers exceed the MTU on one side, get silently dropped. I've seen this on metro-ethernet hand-offs where the provider was passing 1500-byte frames but the CE router was set to 1504 or vice versa. Confirmed via <code>ping -l 1473 -f &lt;peer-ip&gt;</code> — if you get "fragmentation needed", you found your killer.<br>
• <strong>Duplex mismatch</strong> — one side full-duplex, other half. BPDUs pass (small frames, low rate), but larger OSPF DBD packets collide and drop. Interface shows "late collisions" on the half-duplex side.<br>
• <strong>VLAN mismatch / native VLAN mismatch on trunks</strong> — frames tagged with different VLAN IDs never reach the peer.<br><br>
<strong>Layer 3 causes:</strong><br>
• <strong>OSPF Hello/Dead timer mismatch</strong> — timers must match exactly. Two-Way state forms then drops immediately. <code>show ip ospf interface</code> reveals the local timers; you need to check the peer too.<br>
• <strong>Area ID mismatch</strong> — one router in area 0, the other in area 1. Adjacency goes to ExStart and stalls.<br>
• <strong>Authentication mismatch</strong> — MD5 key or type mismatch. Easy to catch with <code>debug ip ospf adj</code>.<br>
• <strong>Network type mismatch</strong> — one side point-to-point (no DR/BDR election), other side broadcast (expects DR). This manifests as stuck in ExStart/Exchange.<br>
• <strong>Subnet mask mismatch</strong> — interfaces in different subnets don't form adjacency.<br>
• <strong>ACL blocking 224.0.0.5/224.0.0.6</strong> — OSPF multicast silently dropped by an inbound ACL.<br>
• <strong>passive-interface configured</strong> — OSPF hellos suppressed on the interface.`,
    cli: `show ip ospf interface Gi0/0
! Look at: hello/dead timers, area, network-type, MTU, auth

show ip ospf neighbor
! State stuck? Init=one-way, ExStart=MTU or RID issue, 2Way=DR election issue

debug ip ospf adj           ! adjacency formation events
debug ip ospf hello         ! hello packet exchange

ping <peer-ip> size 1473 repeat 5 df-bit
! If "!" success but bigger fails → MTU mismatch

show interfaces Gi0/0 | include MTU|duplex|collision
show ip access-lists        ! any ACL blocking multicast?`,
    keypoints: 'L2: MTU mismatch (silent DBD drops), duplex mismatch, VLAN/native VLAN mismatch. L3: hello/dead timer mismatch, area ID, auth, network-type, subnet mask, ACL blocking 224.0.0.5/6, passive-interface.'
  },

  // ══════════════════════════════════════════
  // 2. SUBNETTING & VLSM
  // ══════════════════════════════════════════
  {
    id: 4, level: 'CCNA', topic: 'Subnetting', scenario: false,
    q: 'What is subnetting and VLSM? Given 172.16.0.0/16, design subnets for: 500, 250, 100, 50, and 10 hosts using VLSM.',
    a: `Subnetting borrows bits from the host portion of an IP address to create multiple smaller networks from one larger block. VLSM (Variable Length Subnet Masking) takes this further — you can use different prefix lengths for different subnets within the same address space, which is essential for efficient IP allocation in real networks.<br><br>
<strong>Rule #1: Always allocate largest subnet first.</strong> If you start small, you fragment the address space and waste bits.<br><br>
<strong>VLSM allocation from 172.16.0.0/16:</strong><br>
• <strong>500 hosts → /23</strong> (2^9 - 2 = 510 usable) → <code>172.16.0.0/23</code> — covers .0.1 to .1.254, next subnet starts at .2.0<br>
• <strong>250 hosts → /24</strong> (254 usable) → <code>172.16.2.0/24</code> — .2.1 to .2.254<br>
• <strong>100 hosts → /25</strong> (126 usable) → <code>172.16.3.0/25</code> — .3.1 to .3.126<br>
• <strong>50 hosts → /26</strong> (62 usable) → <code>172.16.3.128/26</code> — .3.129 to .3.190<br>
• <strong>10 hosts → /28</strong> (14 usable) → <code>172.16.3.192/28</code> — .3.193 to .3.206<br><br>
<strong>In production:</strong> I always document the VLSM plan in an IPAM tool (like Infoblox or even a spreadsheet) before making changes. Overlapping subnets are one of the hardest problems to diagnose because routing works for some hosts but not others — classic symptom is intermittent connectivity or "it works from some places but not others".`,
    keypoints: '500→/23 (510 usable), 250→/24, 100→/25, 50→/26, 10→/28. Always subnet largest first. VLSM is classless — different masks per subnet. 2^n-2 formula for host count.'
  },
  {
    id: 5, level: 'CCNP', topic: 'Subnetting', scenario: false,
    q: 'What is route summarization? Given subnets 10.1.0.0/24 through 10.1.15.0/24, what is the summary route? What are the production implications?',
    a: `Route summarization (aggregation) combines multiple specific routes into a single less-specific prefix, reducing routing table size and limiting LSA/update scope. It's not just an optimization — it's a stability mechanism. A summary route shields downstream routers from topology changes inside the summarized block.<br><br>
<strong>Finding the summary for 10.1.0.0/24 – 10.1.15.0/24:</strong><br>
Write the third octet in binary: 0 through 15 spans 0000 to 1111. The first 4 bits (0000) are common. So we move the prefix from /24 to /20:<br>
<code>10.1.0.0/20</code> — covers 10.1.0.0 through 10.1.15.255<br><br>
<strong>Production implications I always cover in interviews:</strong><br>
• <strong>Discard route (Null0)</strong> — when you configure a summary on an OSPF ABR or EIGRP router, it automatically installs a Null0 route for the summary prefix. This prevents routing loops for addresses within the summary range that don't have a more specific route. Critical to understand — not a bug, it's designed behavior.<br>
• <strong>Summary boundaries</strong> — summarization should happen at natural aggregation boundaries (usually at the distribution/core layer). Summarizing across discontiguous blocks causes suboptimal routing or unreachable holes in the summary range — you'd be advertising reachability to IPs you don't actually have routes for.<br>
• <strong>Failure hiding</strong> — with summarization, if one /24 goes down, the summary stays up and traffic continues to the summarizing router. That router then drops the traffic (Null0 catches it). This is why you need proper redistribution or leak-maps in some designs.`,
    cli: `! OSPF ABR summarization
router ospf 1
  area 1 range 10.1.0.0 255.255.240.0   ! summarize area 1 routes

! EIGRP summarization (on interface)
interface Gi0/0
  ip summary-address eigrp 100 10.1.0.0 255.255.240.0

! Verify Null0 discard route was created
show ip route 10.1.0.0
! Should show: 10.1.0.0/20 is a summary, Null0`,
    keypoints: '10.1.0.0/20 covers .0.0–.15.255. Summarization installs Null0 discard route (loop prevention). Summarize at distribution layer. Never summarize discontiguous space.'
  },

  // ══════════════════════════════════════════
  // 3. VLANs & TRUNKING
  // ══════════════════════════════════════════
  {
    id: 6, level: 'CCNA', topic: 'VLANs & Trunking', scenario: false,
    q: 'What is the native VLAN? What security risk does it pose and how do you harden it?',
    a: `The native VLAN is the VLAN whose frames are sent <em>untagged</em> on an 802.1Q trunk link. By default this is VLAN 1 on Cisco switches. Any untagged frame arriving on a trunk port is placed into the native VLAN.<br><br>
<strong>The security risk — VLAN Hopping (Double Tagging Attack):</strong><br>
An attacker on the native VLAN can craft a frame with two 802.1Q tags stacked — an outer tag matching the native VLAN (which the first switch strips), and an inner tag for the target VLAN. The second switch sees the inner tag and forwards the frame into the target VLAN. This is a <em>one-way</em> attack (replies don't route back), but it can be used to send traffic to VLANs the attacker shouldn't reach — useful for injecting frames or triggering ICMP responses.<br><br>
<strong>Hardening — three layers of defence:</strong><br>
1. <strong>Change native VLAN to an unused VLAN</strong> (e.g., VLAN 999 that has no access ports, no SVIs, no hosts).<br>
2. <strong>Tag the native VLAN explicitly</strong> with <code>vlan dot1q tag native</code> globally — this forces the switch to tag native VLAN traffic, breaking the double-tag assumption.<br>
3. <strong>Shutdown unused ports and put them in a 'black hole' VLAN</strong> (e.g., VLAN 999) — limits the attack surface.<br><br>
<strong>Also:</strong> Never use VLAN 1 for management traffic. In real deployments I configure a separate management VLAN (say VLAN 100) with restricted ACLs, and put VLAN 1 in the 'do not route, do not use' category.`,
    cli: `! Change native VLAN on trunk (both ends must match!)
interface Gi0/2
  switchport trunk native vlan 999

! Force tagging of native VLAN globally (recommended)
vlan dot1q tag native

! Unused ports — disable and isolate
interface range Gi0/10 - 24
  switchport mode access
  switchport access vlan 999
  shutdown`,
    keypoints: 'Native VLAN = untagged on trunk (default VLAN 1). Risk: double-tag VLAN hopping. Fix: change native to unused VLAN, use "vlan dot1q tag native", shutdown unused ports.'
  },
  {
    id: 7, level: 'CCNP', topic: 'VLANs & Trunking', scenario: false,
    q: 'What is VTP and why do most production engineers treat it with extreme caution? What is the VTP revision number attack?',
    a: `VTP (VLAN Trunking Protocol) synchronizes the VLAN database across switches in a VTP domain. It sounds useful — add a VLAN once, it propagates everywhere. In practice, it is one of the most dangerous features in enterprise switching if not carefully managed.<br><br>
<strong>The VTP revision number attack (also called "VTP bomb"):</strong><br>
When a switch receives a VTP advertisement, it only accepts the update if the incoming revision number is <em>higher</em> than its own. A new switch (or one moved from another domain) might have a very high revision number from previous use. Plug it into your network on a trunk port, and if its revision number beats the server's, it overwrites your entire VLAN database with its own (possibly empty) database. Every VLAN except VLAN 1 disappears. Network impact: all trunk ports drop non-native traffic, all SVIs go down, spanning-tree reconverges. I've seen this happen in production — it looks like a total network meltdown with no obvious cause until you check <code>show vtp status</code>.<br><br>
<strong>What I do in every production environment:</strong><br>
• Set all switches to <strong>VTP Transparent mode</strong> — they forward VTP frames but don't process them, maintaining a local VLAN database. Changes are made switch-by-switch, which feels more work but eliminates the risk entirely.<br>
• If VTP is required, use <strong>VTP version 3</strong> — it has a primary server concept (explicit promotion required), hidden passwords, and extended VLAN support (VLANs 1006–4094). Much harder to accidentally nuke.<br>
• Any new switch connecting to the network gets set to transparent mode <em>before</em> connecting to a trunk.<br>
• Reset the revision number to 0 by changing VTP domain name and changing it back — this forces revision to 0.`,
    cli: `! Safest production config
vtp mode transparent        ! local VLAN DB, no sync

! Or use VTPv3 if sync is needed
vtp version 3
vtp domain PROD
vtp password <secret> hidden
! Promote to primary on ONE switch only:
! vtp primary vlan

! Check VTP status
show vtp status
! Look at: mode, revision number, domain name

! Zero out revision (before connecting new switch)
vtp domain TEMP_RESET
vtp domain ORIGINAL_DOMAIN`,
    keypoints: 'VTP propagates VLAN DB. Risk: high revision number overwrites production DB. Fix: use Transparent mode or VTPv3. Always zero revision before connecting new switches.'
  },
  {
    id: 8, level: 'CCIE', topic: 'VLANs & Trunking', scenario: false,
    q: 'What is Q-in-Q (802.1ad)? When and why is it used, and what are the MTU implications?',
    a: `Q-in-Q (IEEE 802.1ad, also called Provider Bridging or Double Tagging) adds an outer 802.1Q VLAN tag — the S-tag (Service tag, sometimes called the port VLAN) — to frames that already carry an inner 802.1Q tag (C-tag, Customer tag). The provider's network transports the customer's entire 802.1Q VLAN space transparently without needing to know about the customer's internal VLAN structure.<br><br>
<strong>Primary use case — Service Provider DCI/Metro-E:</strong><br>
I've worked on deployments where a customer needs to extend their VLAN 100 across two data centers connected via a carrier metro-ethernet service. Without Q-in-Q, the provider would need to co-ordinate VLAN IDs across all customers (4094 total across everyone). With Q-in-Q, the provider assigns each customer an outer S-tag (e.g., S-tag 200 for this customer), and all customer VLANs (100, 200, VLAN 10, whatever) ride inside the S-tag transparently. Customer VLAN namespace is fully independent.<br><br>
<strong>MTU — the critical operational consideration:</strong><br>
Adding a Q-in-Q outer tag adds 4 bytes to every frame. If the customer is sending standard 1514-byte Ethernet frames (1500 byte payload), the Q-in-Q frame becomes 1518 bytes. Provider network must support <strong>1518+ byte frames</strong> on all internal interfaces — typically set to 9000-byte jumbo frames throughout the core. If any provider device in the path has MTU = 1514/1518 without accounting for the extra tag, frames are silently dropped or fragmented, causing mysterious connectivity issues for customer traffic. I always validate MTU end-to-end before turning up a Q-in-Q service.<br><br>
<strong>Also:</strong> STP and CDP are issues — by default, L2 protocol frames from the customer can traverse the provider and cause problems. Use <code>l2protocol-tunnel</code> to tunnel or suppress customer STP/CDP.`,
    cli: `! Configure Q-in-Q service port (facing customer)
interface Gi0/1
  switchport mode dot1q-tunnel
  switchport access vlan 200   ! S-tag assigned to this customer
  l2protocol-tunnel stp        ! tunnel customer STP (don't process it)
  l2protocol-tunnel cdp

! Provider uplink must carry VLAN 200
interface Gi0/2
  switchport mode trunk
  switchport trunk allowed vlan 200

! MTU — provider interfaces MUST be set to accommodate extra tag
interface Gi0/2
  mtu 9216                     ! or minimum 1522 for standard frames

show dot1q-tunnel              ! verify tunnel interfaces
show interfaces Gi0/1 trunk`,
    keypoints: 'Q-in-Q adds outer S-tag to customer-tagged frames. Provider carries all customer VLANs per S-tag. Critical: MTU must increase by 4 bytes throughout provider network. Use l2protocol-tunnel for STP/CDP handling.'
  },

  // ══════════════════════════════════════════
  // 4. SPANNING TREE (STP/RSTP/MSTP)
  // ══════════════════════════════════════════
  {
    id: 9, level: 'CCNA', topic: 'Spanning Tree', scenario: false,
    q: 'How is the STP Root Bridge elected? Why should you never rely on the default election in production?',
    a: `The root bridge is elected by the lowest Bridge ID. The Bridge ID is 8 bytes: 2-byte priority + 6-byte MAC address. On Cisco switches with PVST+, the priority is actually: configured priority + VLAN ID. Default priority is 32768, so for VLAN 10 it's 32778.<br><br>
<strong>Election process:</strong><br>
All switches start believing they are the root bridge and advertise their own Bridge ID in BPDUs. When a switch receives a BPDU with a lower Bridge ID than its own, it stops claiming to be root and forwards the superior BPDU. The switch with the lowest Bridge ID wins — ties broken by lowest MAC address.<br><br>
<strong>Why default election is dangerous in production:</strong><br>
With default priority (32768), the switch with the lowest MAC address wins root. In practice, this is often the oldest switch in the network — because hardware manufactured earlier tends to have lower MAC addresses (OUI prefixes are allocated sequentially). Your oldest, slowest, least capable switch could become root bridge for all VLANs. All traffic then flows through it, potentially bottlenecking on a 10-year-old access switch.<br><br>
<strong>I've seen this cause real outages:</strong> A new distribution switch was added to a campus. Its MAC happened to be lower than the existing root. STP reconverged, traffic shifted, and uplinks on the new (un-tuned) switch got saturated because it wasn't designed as a transit device.<br><br>
<strong>Production best practice:</strong> Explicitly configure root priority on your intended root bridge before it ever connects to the network. Priority should be 4096 for primary, 8192 for secondary. Also — always configure <code>spanning-tree portfast bpduguard default</code> globally so access ports are protected.`,
    cli: `! Explicitly control root bridge — ALWAYS do this
spanning-tree vlan 10 priority 4096     ! primary root
spanning-tree vlan 10 priority 8192     ! secondary root (on backup switch)

! Or use the macro (less precise but convenient)
spanning-tree vlan 10 root primary
spanning-tree vlan 10 root secondary

! Verify root bridge
show spanning-tree vlan 10 | include Root|This
show spanning-tree vlan 10 summary`,
    keypoints: 'Lowest Bridge ID (priority+MAC) wins root. Default priority=32768 → oldest switch wins. Always set explicit priority: 4096 (primary), 8192 (secondary). Never rely on MAC-based election in production.'
  },
  {
    id: 10, level: 'CCNP', topic: 'Spanning Tree', scenario: false,
    q: 'What is the difference between BPDU Guard and BPDU Filter? When and where should each be applied?',
    a: `These two are frequently confused but have very different security profiles. Getting this wrong can either leave you exposed or silently break STP protection.<br><br>
<strong>BPDU Guard:</strong><br>
When configured on a port, if any BPDU is received on that port, the port is immediately error-disabled (err-disabled). This is the <em>right tool</em> for PortFast access ports. It detects the moment someone plugs a switch into an access port (which would send BPDUs) and shuts the port down before a loop can form. The port stays err-disabled until manually re-enabled or the errdisable recovery timer fires.<br><br>
<strong>BPDU Filter:</strong><br>
Suppresses BPDUs from being sent on a port. When configured per-interface, it also ignores received BPDUs — effectively removing that port from STP entirely. This is <strong>dangerous</strong> because if a switch is connected, no loop protection exists. The port just merrily forwards frames into what could be a loop. When configured globally (<code>spanning-tree portfast bpdufilter default</code>), it's slightly safer — it still sends out a few BPDUs on startup, and will disable itself if it receives a BPDU, falling back to normal STP. But it's still rarely the right choice.<br><br>
<strong>My recommendation from production:</strong><br>
On access ports: Always use PortFast + BPDU Guard. Never use BPDU Filter on ports facing end devices unless you have an explicit, documented reason (e.g., connecting a SAN device that generates BPDUs for internal housekeeping and you've verified no loop risk).<br>
Configure globally for all access ports using the defaults, and set up errdisable recovery so ports automatically recover after 5 minutes rather than requiring manual intervention every time a vendor accidentally plugs in a switch.`,
    cli: `! Recommended production config for access ports
interface Gi0/1
  spanning-tree portfast
  spanning-tree bpduguard enable

! Global defaults (apply to all PortFast-enabled ports)
spanning-tree portfast default
spanning-tree portfast bpduguard default

! Errdisable recovery — auto-recover after 5 min
errdisable recovery cause bpduguard
errdisable recovery interval 300

! BPDU Filter — only if you absolutely must (isolate STP on a port)
! Per-interface: disables STP completely — use with extreme care
interface Gi0/2
  spanning-tree bpdufilter enable

! Check err-disabled ports
show interfaces status err-disabled
show errdisable recovery`,
    keypoints: 'BPDU Guard: err-disables port on BPDU receipt — correct for access/PortFast ports. BPDU Filter: suppresses BPDUs, dangerous per-interface. Always use BPDU Guard + PortFast. Configure errdisable recovery.'
  },
  {
    id: 11, level: 'CCNP', topic: 'Spanning Tree', scenario: false,
    q: 'What is Root Guard vs Loop Guard? Where exactly should each be configured, and why?',
    a: `These two guards protect against completely different failure modes.<br><br>
<strong>Root Guard — protects root bridge placement:</strong><br>
Applied on ports where you want to <em>prevent a connected device from ever becoming the root bridge</em>. Typically: distribution/core switch ports facing the access layer (downlinks). If a superior BPDU is received on a Root Guard port, the port goes into root-inconsistent state (blocks, doesn't forward) instead of accepting the new root. When the superior BPDUs stop (the rogue device is removed or its priority is fixed), the port recovers automatically.<br><br>
<strong>Real scenario:</strong> An access switch had its VLAN priority accidentally set to 0 on VLAN 1 during a copy-paste config error. Without Root Guard on the distribution uplinks, that access switch would have become the STP root for VLAN 1, redirecting all campus traffic through a 1GbE access layer device. Root Guard caught it immediately.<br><br>
<strong>Loop Guard — protects against unidirectional link failures:</strong><br>
Applied on root ports and alternate ports (non-designated ports). On fiber links, it's possible for the TX fiber to fail while RX continues working — the link stays "up" electrically but is actually unidirectional. Without Loop Guard, when BPDUs stop arriving on a blocked port, STP assumes the segment is gone and transitions the port to Forwarding — potentially creating a loop. Loop Guard instead puts the port into loop-inconsistent state and keeps it blocked. When BPDUs resume, it recovers automatically.<br><br>
<strong>UDLD complement:</strong> For fiber, also enable UDLD Aggressive (<code>udld aggressive</code>) — it actively probes the link and err-disables the port if unidirectionality is detected, providing faster and more definitive protection than Loop Guard alone.`,
    cli: `! Root Guard — on distribution/core downlinks facing access layer
interface Gi0/1          ! port facing access switch
  spanning-tree guard root

! Loop Guard — on root ports and alternate ports (uplinks)
interface Gi0/2          ! uplink toward core
  spanning-tree guard loop

! Global Loop Guard (applies to all non-designated ports)
spanning-tree loopguard default

! UDLD — fiber unidirectional protection
udld enable              ! enable on all fiber ports globally
interface Gi0/2
  udld port aggressive   ! per-port aggressive mode

show spanning-tree detail | include inconsisten
show udld neighbors`,
    keypoints: 'Root Guard: apply on downlinks (access-facing) — blocks ports if superior BPDU received. Loop Guard: apply on root/alternate ports (uplinks) — blocks on BPDU timeout. Complement with UDLD Aggressive on fiber.'
  },

  // ══════════════════════════════════════════
  // 5. ETHERCHANNEL
  // ══════════════════════════════════════════
  {
    id: 12, level: 'CCNA', topic: 'EtherChannel', scenario: false,
    q: 'What is EtherChannel? LACP vs PAgP vs Static — when would you use each?',
    a: `EtherChannel (Port-Channel / Link Aggregation) bundles multiple physical links into a single logical interface. STP sees the entire bundle as one link (no blocking), bandwidth adds up, and if one physical link fails the bundle stays up — only the capacity is reduced.<br><br>
<strong>LACP (802.3ad) — IEEE standard, always my first choice:</strong><br>
Open standard, supported by all vendors. Active mode initiates LACP negotiation; Passive waits for the other side to initiate. Active+Active or Active+Passive forms a bundle. Passive+Passive does NOT form (neither sends first). I always use Active+Active between known-good Cisco switches, and Active+Passive when peering with non-Cisco equipment where I'm not sure of the other side's default.<br><br>
<strong>PAgP — Cisco proprietary, use only in all-Cisco environments:</strong><br>
Desirable = initiates, Auto = waits. Desirable+Desirable or Desirable+Auto forms. If your network has any non-Cisco switches at all, LACP is the right choice.<br><br>
<strong>Static (mode "on") — no negotiation protocol:</strong><br>
Forces the bundle without any negotiation. Both sides must be set to "on" — Active or Passive won't work with "on". Useful when negotiation is failing for some reason, or on older hardware that doesn't support LACP/PAgP. Risk: misconfiguration on one side creates a loop because the other side starts forwarding without knowing the bundle isn't formed.<br><br>
<strong>Critical production note:</strong> All physical ports in the bundle MUST have identical configuration: same speed, duplex, trunk/access mode, native VLAN, allowed VLANs, and STP settings. Any mismatch causes the bundle to fail or only partially form — and the error messages can be cryptic.`,
    cli: `! LACP Active/Active (recommended)
interface range Gi0/1 - 2
  channel-group 1 mode active
  no shutdown

interface Port-channel1
  switchport mode trunk
  switchport trunk allowed vlan 10,20,30

! Verify bundle status
show etherchannel 1 summary     ! P=bundled port, I=independent (bad)
show etherchannel detail
show lacp neighbor              ! LACP PDU exchange with peer`,
    keypoints: 'LACP=IEEE standard (use always), PAgP=Cisco-only, Static=no negotiation. Active+Active=best. All member ports must be config-identical. STP sees bundle as one link.'
  },

  // ══════════════════════════════════════════
  // 6. INTER-VLAN ROUTING
  // ══════════════════════════════════════════
  {
    id: 13, level: 'CCNA', topic: 'Inter-VLAN Routing', scenario: false,
    q: 'What is Router-on-a-Stick vs Layer 3 SVI routing? When would you choose each?',
    a: `Both methods achieve inter-VLAN routing but have very different performance and scalability profiles.<br><br>
<strong>Router-on-a-Stick (sub-interfaces):</strong><br>
One physical router interface carries multiple logical sub-interfaces, each tagged with a VLAN ID and assigned an IP address for that VLAN. The connected switch port is a trunk. All inter-VLAN traffic must physically traverse the router link — the router CPU processes each inter-VLAN packet. Maximum bandwidth is limited to the single physical link (1 GbE or 10 GbE typically). Latency increases because routing is done in software by the router CPU.<br><br>
<strong>Layer 3 Switch with SVIs (Switched Virtual Interfaces):</strong><br>
An SVI is a Layer 3 logical interface on a multilayer switch associated with a VLAN. The switch uses its ASIC-based hardware forwarding table (CEF) to switch packets between VLANs at line rate — no CPU involvement, no additional physical link required. This is how all modern campus networks do inter-VLAN routing.<br><br>
<strong>When to use each in production:</strong><br>
• Router-on-a-Stick: small branch with a single ISR router, low inter-VLAN traffic volume, no multilayer switch available, or budget constraints. I've deployed this in SMB environments with 3 or 4 VLANs and &lt;50 hosts per VLAN — works fine.<br>
• Layer 3 SVI: any deployment with more than &lt;100 hosts, any campus network, anywhere you need high inter-VLAN throughput. The marginal cost of a multilayer switch vs. a pure L2 switch is usually worth it.<br><br>
<strong>SVI availability gotcha:</strong> An SVI is only up/up if: (1) the VLAN exists in the VLAN database, (2) at least one access port in the VLAN is up, AND (3) the SVI itself is not shut down. I've wasted 20 minutes troubleshooting an SVI that was down because I created the VLAN on the switch but never had an active port in it.`,
    cli: `! Router-on-a-Stick
interface Gi0/0.10
  encapsulation dot1q 10
  ip address 192.168.10.1 255.255.255.0
interface Gi0/0.20
  encapsulation dot1q 20
  ip address 192.168.20.1 255.255.255.0

! Layer 3 Switch SVIs
ip routing                       ! MUST enable L3 forwarding
vlan 10
vlan 20
interface Vlan10
  ip address 192.168.10.1 255.255.255.0
  no shutdown
interface Vlan20
  ip address 192.168.20.1 255.255.255.0
  no shutdown

! Check SVI status
show ip interface brief | include Vlan
! Vlan10 must show up/up — both protocol status fields`,
    keypoints: 'Router-on-a-Stick: CPU-based, single-link bottleneck, small networks only. L3 SVI: ASIC hardware forwarding, line rate, production standard. SVI requires: VLAN exists + active access port + no shutdown.'
  },

  // ══════════════════════════════════════════
  // 8. EIGRP
  // ══════════════════════════════════════════
  {
    id: 14, level: 'CCNA', topic: 'EIGRP', scenario: false,
    q: 'What is the EIGRP Successor and Feasible Successor? How does the Feasibility Condition guarantee loop-free failover?',
    a: `This is EIGRP's core innovation and what distinguishes it from other distance-vector protocols.<br><br>
<strong>Successor:</strong> The best path to a destination — lowest Feasible Distance (FD). FD = metric from the local router all the way to the destination. The Successor's route is installed in the routing table.<br><br>
<strong>Feasible Successor (FS):</strong> A backup path that meets the <em>Feasibility Condition</em>. An FS is pre-computed and sits in the topology table, ready for instant activation without any queries when the Successor fails.<br><br>
<strong>Feasibility Condition:</strong> A neighbor qualifies as a Feasible Successor only if its Reported Distance (RD — what the neighbor says its distance to the destination is) is <em>strictly less than</em> the current Feasible Distance via the Successor.<br><br>
<strong>Why this guarantees loop-free failover:</strong><br>
If my neighbor's distance to the destination is less than my total distance, my neighbor cannot be routing through me to reach that destination. If it were routing through me, its distance would be at least my FD, not less than it. This mathematical proof means we can instantly switch to the FS path without the risk of creating a loop — no query/reply cycle needed.<br><br>
<strong>What happens when there's NO Feasible Successor:</strong><br>
The route goes <em>Active</em> — the local router sends EIGRP Query packets to all neighbors asking if they have an alternative path. The router must wait for all Query replies before choosing a new Successor. During this period, the route is in Active state and not being forwarded (or using a fallback). This is why a "stuck in active" route is a serious problem — it means queries went out but replies didn't come back within the active timer (3 minutes default). Causes: dead neighbors, unidirectional links, query scope too large (missing summarization).`,
    cli: `show ip eigrp topology           ! See Successor (S) and FD values
show ip eigrp topology all-links  ! Show paths that don't meet FC
show ip eigrp topology 10.1.1.0/24

! Example output interpretation:
! P 10.1.1.0/24, 1 successors, FD is 2816
!   via 10.0.0.1 (2816/256), Gi0/0  ← Successor FD=2816, RD=256
!   via 10.0.0.2 (3072/256), Gi0/1  ← FS: RD(256) < FD(2816) ✓
!   via 10.0.0.3 (3072/2900), Gi0/2 ← NOT FS: RD(2900) > FD(2816) ✗

show ip eigrp topology active     ! Show routes currently in Active state`,
    keypoints: 'Successor=best path (lowest FD in routing table). FS=backup path meeting FC (RD < current FD). FC guarantees loop-free instant failover. No FS → route goes Active → queries sent → "stuck in active" is dangerous.'
  },
  {
    id: 15, level: 'CCNP', topic: 'EIGRP', scenario: false,
    q: 'What are EIGRP neighbor requirements? What is unequal-cost load balancing and how does the variance command work?',
    a: `<strong>EIGRP neighbor requirements (all must match):</strong><br>
1. Same AS number — the most common misconfiguration<br>
2. Same K-values (metric weights) — default K1=1, K2=0, K3=1, K4=0, K5=0. K-value mismatch generates a log message: <em>"K-value mismatch"</em> and no adjacency forms<br>
3. Interfaces on same subnet — unicast neighbors excluded<br>
4. Authentication must match if configured<br>
5. Hello/Hold timers don't need to match (unlike OSPF) — but both must be EIGRP-enabled on the interface and not passive<br><br>
<strong>Unequal-cost load balancing with variance:</strong><br>
EIGRP is the only routing protocol that natively supports load balancing across unequal-cost paths. The <code>variance</code> multiplier defines the range: any Feasible Successor with FD ≤ (variance × Successor_FD) is included in load balancing.<br><br>
<strong>Critical constraint:</strong> Only <em>Feasible Successors</em> (paths meeting the Feasibility Condition) can participate in load balancing. You can't just throw any path into the rotation — it must have proven loop-free potential via the FC.<br><br>
Traffic is proportionally distributed based on metric — the lower the metric, the more traffic a path carries. This is inverse-proportional: a path with metric 1000 carries twice the traffic of a path with metric 2000.<br><br>
<strong>Production use case:</strong> Two WAN links — a 10 Mbps MPLS circuit and a 4 Mbps backup broadband. With variance, you can load-share between them proportionally, using the 10M link for bulk and letting the 4M carry whatever overhead comes through. Without variance, only the best-metric path would be used.`,
    cli: `! EIGRP unequal-cost load balancing
router eigrp 100
  variance 2          ! include FS paths up to 2× successor FD
  maximum-paths 4     ! max 4 paths in routing table

! Verify load balancing
show ip route 10.1.1.0
! Look for multiple EIGRP entries with different metrics

show ip eigrp topology 10.1.1.0/24
! Confirm FS paths meet FC before variance takes effect

! EIGRP neighbor troubleshooting
show ip eigrp neighbors
show ip eigrp neighbors detail
debug eigrp packets hello     ! Watch hello exchanges in real-time`,
    keypoints: 'Neighbor req: same AS, K-values, subnet, auth. Variance: include FS paths up to N× successor FD. Only FSs (FC met) participate in LB. Traffic proportional to metric inverse. EIGRP-only feature.'
  },

  // ══════════════════════════════════════════
  // 9. OSPF
  // ══════════════════════════════════════════
  {
    id: 16, level: 'CCNA', topic: 'OSPF', scenario: false,
    q: 'Walk through OSPF neighbor states. Which state is normal for DROTHERs on a broadcast segment?',
    a: `OSPF neighbor formation goes through eight well-defined states. Understanding where a neighbor is stuck tells you exactly what phase is failing.<br><br>
<strong>Down →</strong> No hellos received. Dead timer expired or initial state before any hellos arrive.<br>
<strong>Attempt →</strong> Only for NBMA networks. Unicast hello sent toward statically configured neighbor, waiting for reply.<br>
<strong>Init →</strong> We've received a hello from the neighbor, but our Router-ID doesn't appear in their neighbor list yet. One-way communication.<br>
<strong>2-Way →</strong> Bidirectional — we see each other's Router-IDs in each other's hellos. On broadcast networks, DR/BDR election happens at this state.<br>
<strong>ExStart →</strong> Master/Slave election based on highest Router-ID. Master controls DBD sequence numbers and sends the first DBD.<br>
<strong>Exchange →</strong> DBD (Database Description) packets exchange LSDB summaries (LSA headers). Each router determines which LSAs it needs.<br>
<strong>Loading →</strong> LSR (Link State Request) sent for missing LSAs. LSU (Link State Update) returns with the full LSA content.<br>
<strong>Full →</strong> LSDB fully synchronized. Adjacency complete. This is the normal operational state for DR/BDR pairs.<br><br>
<strong>DROTHERs on broadcast segments:</strong><br>
On a broadcast segment, DROTHER routers only form FULL adjacency with the DR and BDR. DROTHERs remain in <strong>2-Way</strong> state with each other — this is <em>completely normal</em>. They exchange BPDUs through the DR. If two DROTHERs show "Full" with each other, that's actually unusual (can happen on point-to-point sub-interfaces). The common mistake is thinking 2-Way between DROTHERs means a problem — it doesn't.`,
    cli: `show ip ospf neighbor           ! Check state for all neighbors
show ip ospf neighbor detail    ! Timers, RID, interface details

! OSPF neighbor troubleshooting matrix:
! Stuck at Init     → One-way hello (ACL? MTU? multicast issue?)
! Stuck at ExStart  → MTU mismatch (most common!) or RID tie
! Stuck at Exchange → Database mismatch, corrupted LSA
! Stays at 2-Way    → DROTHER-to-DROTHER = NORMAL on broadcast
! Shows Full        → Good — adjacency complete

show ip ospf interface Gi0/0   ! Network type, DR/BDR election, timers
debug ip ospf hello            ! Real-time hello exchange
debug ip ospf adj              ! Full adjacency state machine`,
    keypoints: 'States: Down→Init→2-Way→ExStart→Exchange→Loading→Full. 2-Way between DROTHERs = NORMAL. Full adjacency only with DR and BDR. Stuck ExStart = likely MTU mismatch.'
  },
  {
    id: 17, level: 'CCNP', topic: 'OSPF', scenario: false,
    q: 'Explain OSPF LSA types 1 through 7. Which ones are blocked by stub areas?',
    a: `LSA types define what information is being advertised and to what scope. Knowing LSA types lets you read the OSPF database like a map of your network.<br><br>
<strong>Type 1 — Router LSA:</strong> Generated by every OSPF router. Describes that router's directly connected interfaces and links. Scope: flooding within the originating area only. Every router in the network generates exactly one Type 1 LSA per area it's in.<br><br>
<strong>Type 2 — Network LSA:</strong> Generated by the DR on broadcast and NBMA segments. Lists all routers on that multi-access segment. Scope: within its originating area. Only exists where there's a DR.<br><br>
<strong>Type 3 — Summary LSA:</strong> Generated by ABRs (Area Border Routers). Carries inter-area routing information — one Type 3 per prefix learned in one area, advertised into other areas. This is how routers in Area 1 learn about networks in Area 2 via Area 0.<br><br>
<strong>Type 4 — ASBR Summary LSA:</strong> Generated by ABRs to tell other areas how to reach an ASBR (router that redistributes external routes). Contains the ASBR's Router-ID and the metric to reach it.<br><br>
<strong>Type 5 — AS External LSA:</strong> Generated by ASBRs. Carries externally redistributed routes (from BGP, EIGRP, static, etc.). E1 = external metric + internal cost; E2 = external metric only (default, ignores internal cost). Scope: entire OSPF domain except stub areas.<br><br>
<strong>Type 7 — NSSA External LSA:</strong> Like Type 5 but generated inside an NSSA area. Converted to a Type 5 LSA by the ABR at the NSSA boundary before entering the backbone.<br><br>
<strong>What each area type blocks:</strong><br>
• Stub area: blocks Type 4 and Type 5 (external routes). Injects a default route (Type 3) automatically.<br>
• Totally Stubby: blocks Type 3, Type 4, and Type 5. Only a single default route (Type 3) enters. Simplest possible area.<br>
• NSSA: blocks Type 5 but allows Type 7 (local redistribution via ASBR inside the NSSA).<br>
• Totally Stubby NSSA: blocks Type 3 and Type 5, allows Type 7.`,
    cli: `! View OSPF database by LSA type
show ip ospf database           ! Summary of all LSA types
show ip ospf database router    ! Type 1 LSAs
show ip ospf database network   ! Type 2 LSAs (DR-generated)
show ip ospf database summary   ! Type 3 LSAs (inter-area)
show ip ospf database asbr-summary  ! Type 4 LSAs
show ip ospf database external  ! Type 5 LSAs
show ip ospf database nssa-external ! Type 7 LSAs

! Configure stub area types
router ospf 1
  area 10 stub             ! Stub: no Type 4/5
  area 10 stub no-summary  ! Totally Stubby: no Type 3/4/5 (ABR only)
  area 20 nssa             ! NSSA: allows Type 7
  area 20 nssa no-summary  ! Totally Stubby NSSA (ABR only)`,
    keypoints: 'Type1=Router, Type2=Network/DR, Type3=Summary/ABR, Type4=ASBR Summary, Type5=External/ASBR, Type7=NSSA External. Stub: no T4/T5. Totally Stubby: no T3/T4/T5. NSSA: no T5, allows T7. Totally Stubby NSSA: no T3/T5, allows T7.'
  },
  {
    id: 18, level: 'CCIE', topic: 'OSPF', scenario: false,
    q: 'What is OSPF route summarization? Where can it be configured and what is the Null0 implication?',
    a: `OSPF route summarization reduces routing table size and limits LSA flooding to within an area, significantly improving stability and scalability. The key operational constraint: summarization can <em>only</em> be configured on ABRs (for inter-area Type 3) and ASBRs (for external Type 5). You cannot summarize within an area.<br><br>
<strong>ABR inter-area summarization (Type 3):</strong><br>
Configured with <code>area X range</code> on the ABR. The ABR replaces multiple specific Type 3 LSAs (one per prefix in area X) with a single summary Type 3 LSA advertised into adjacent areas. The specific prefixes are suppressed from the inter-area advertisement.<br><br>
<strong>ASBR external summarization (Type 5):</strong><br>
Configured with <code>summary-address</code> on the ASBR. Combines multiple external prefixes into a single Type 5 LSA. Useful when redistributing many BGP prefixes into OSPF.<br><br>
<strong>Null0 discard route — critical production knowledge:</strong><br>
When you configure summarization, OSPF automatically installs a Null0 route for the summary prefix in the local routing table. This is a loop-prevention mechanism. Consider: ABR advertises 10.1.0.0/20 as a summary. If a packet arrives at the ABR destined for 10.1.5.0 but the specific /24 isn't currently reachable (link down), without the Null0 route the ABR would forward the packet toward the default route — potentially creating a routing loop. The Null0 route catches it and drops it, returning an ICMP Unreachable to the sender. This is correct behavior but can confuse operators who see unexpected drops and don't realize summarization is in play.`,
    cli: `! ABR inter-area summarization (configure on ABR only)
router ospf 1
  area 1 range 10.1.0.0 255.255.240.0           ! summarize /24s to /20
  area 1 range 10.1.0.0 255.255.240.0 not-advertise  ! suppress (hide area)

! ASBR external summarization
router ospf 1
  summary-address 10.0.0.0 255.0.0.0            ! summarize external routes
  summary-address 10.0.0.0 255.0.0.0 not-advertise

! Verify Null0 discard route (expected!)
show ip route 10.1.0.0
! O 10.1.0.0/20 is a summary, 00:10:00, Null0

! Verify Type 3 LSAs being originated
show ip ospf database summary 10.1.0.0`,
    keypoints: 'Summarize only on ABR (inter-area) or ASBR (external). ABR: area range. ASBR: summary-address. Null0 discard route is automatically created — correct behavior for loop prevention. Cannot summarize within an area.'
  },

  // ══════════════════════════════════════════
  // 10. BGP
  // ══════════════════════════════════════════
  {
    id: 19, level: 'CCNP', topic: 'BGP', scenario: false,
    q: 'What is the difference between iBGP and eBGP? Why does iBGP require full mesh or route reflectors?',
    a: `<strong>eBGP (external BGP):</strong> Peering between routers in <em>different</em> Autonomous Systems. Used for internet routing. Administrative Distance = 20. Default TTL = 1 (peers must be directly connected, or use <code>ebgp-multihop</code> for multi-hop peers). Next-hop changes to the advertising router's IP on the shared link.<br><br>
<strong>iBGP (internal BGP):</strong> Peering between routers in the <em>same</em> Autonomous System. Used to distribute externally-learned routes internally. Administrative Distance = 200. TTL = 255 (peers don't need to be directly connected). Next-hop is NOT changed by default — this is a common gotcha; the next-hop from eBGP remains the external peer IP, and internal routers must have an IGP route to that IP.<br><br>
<strong>Why iBGP requires full mesh:</strong><br>
The iBGP split-horizon rule states: routes learned via iBGP are <em>not re-advertised</em> to other iBGP peers. This prevents routing loops within an AS. However, it means that if Router A learns a prefix from eBGP and advertises it to iBGP Router B, Router B will NOT forward that prefix to iBGP Router C. Router C never learns the prefix unless it has a direct iBGP session with Router A. Hence, all iBGP speakers must peer with all others (n*(n-1)/2 sessions) — this becomes unsustainable at scale.<br><br>
<strong>Solutions:</strong><br>
1. <strong>Route Reflectors (RR):</strong> An RR is authorized to reflect iBGP routes to its clients, violating the split-horizon rule in a controlled way. Clients only need to peer with the RR(s). Loop prevention via CLUSTER_LIST attribute.<br>
2. <strong>BGP Confederations:</strong> Subdivides the AS into sub-ASes. eBGP rules apply between sub-ASes but they appear as one AS externally. Rarely used today.<br><br>
<strong>Next-hop issue in iBGP:</strong> Always configure <code>next-hop-self</code> on iBGP speakers that have eBGP peerings, so internal routers receive a reachable next-hop IP rather than an external IP they may not have a route to.`,
    cli: `! eBGP peering
router bgp 65001
  neighbor 203.0.113.1 remote-as 65002    ! eBGP

! iBGP peering with next-hop-self
router bgp 65001
  neighbor 10.0.0.2 remote-as 65001       ! iBGP
  neighbor 10.0.0.2 next-hop-self         ! fix next-hop for iBGP peers
  neighbor 10.0.0.2 update-source Lo0     ! stable source IP

! Route Reflector config
router bgp 65001
  neighbor 10.1.1.1 remote-as 65001
  neighbor 10.1.1.1 route-reflector-client
  neighbor 10.1.1.2 remote-as 65001
  neighbor 10.1.1.2 route-reflector-client

show bgp summary                ! neighbor state
show bgp ipv4 unicast           ! routing table
show bgp neighbors 10.0.0.2 advertised-routes`,
    keypoints: 'eBGP: different AS, AD=20, TTL=1, next-hop changes. iBGP: same AS, AD=200, TTL=255, next-hop unchanged. iBGP split-horizon requires full mesh. Solutions: Route Reflectors or Confederations. Always use next-hop-self on PE routers.'
  },
  {
    id: 20, level: 'CCNP', topic: 'BGP', scenario: false,
    q: 'List the BGP best-path selection attributes in order. Which ones can you manipulate for inbound vs outbound traffic engineering?',
    a: `BGP path selection is a sequential decision process — it evaluates each attribute in order and stops when a winner is found. Memorize the order and understand which attributes are locally significant vs. AS-wide vs. communicated to neighbors.<br><br>
<strong>Order (Mnemonic: "We Love Oranges As Oranges Mean Pure Refreshment"):</strong><br>
1. <strong>Weight</strong> — Highest wins. Cisco-proprietary, local to the router only (not advertised). Best for per-router outbound policy.<br>
2. <strong>Local Preference</strong> — Highest wins. iBGP scope (propagated within the AS). Best for AS-wide outbound traffic control — "this AS prefers to exit via Router A".<br>
3. <strong>Locally Originated</strong> — Prefer routes originated locally (network statement, aggregate, redistribution).<br>
4. <strong>AS-PATH length</strong> — Shortest wins. Influences inbound traffic from other ASes — prepend your AS to make paths look longer and less preferred to neighbors.<br>
5. <strong>Origin</strong> — IGP (i) > EGP (e) > Incomplete (?). Usually IGP everywhere now.<br>
6. <strong>MED (Multi-Exit Discriminator)</strong> — Lowest wins. Suggestion to a neighboring AS on which entry point to use (inbound from neighbor's perspective). Only compared between routes from the same neighboring AS by default.<br>
7. <strong>eBGP over iBGP</strong> — Prefer eBGP-learned routes.<br>
8. <strong>IGP metric to next-hop</strong> — Lowest wins. BGP chooses the nearest exit if equal-cost paths exist (hot-potato routing).<br>
9. <strong>Oldest eBGP path</strong> — Prefer stable, older paths (reduces churn).<br>
10. <strong>Lowest BGP Router-ID</strong><br>
11. <strong>Shortest Cluster List length</strong><br>
12. <strong>Lowest neighbor IP address</strong><br><br>
<strong>Traffic engineering summary:</strong><br>
Outbound (your traffic leaving): Weight > Local Preference<br>
Inbound (neighbors' traffic entering you): AS-PATH prepending > MED`,
    cli: `! Manipulate Local Preference for outbound preference
route-map SET_LOCPREF permit 10
  set local-preference 200         ! prefer this path for entire AS

router bgp 65001
  neighbor 10.0.0.1 route-map SET_LOCPREF in

! AS-PATH prepending for inbound traffic engineering
route-map PREPEND_ASPATH permit 10
  set as-path prepend 65001 65001 65001  ! make path look 3 hops longer

router bgp 65001
  neighbor 203.0.113.1 route-map PREPEND_ASPATH out

! MED for inbound influence (suggest entry point to neighbor)
route-map SET_MED permit 10
  set metric 100

router bgp 65001
  neighbor 203.0.113.1 route-map SET_MED out`,
    keypoints: 'Order: Weight→LocalPref→Originated→AS-PATH→Origin→MED→eBGP-over-iBGP→IGP metric→RID. Outbound: Weight (local) or LocalPref (AS-wide). Inbound: AS-PATH prepend. MED: suggestion to neighboring AS for entry point.'
  },
  {
    id: 21, level: 'CCIE', topic: 'BGP', scenario: true,
    q: 'SCENARIO — After a scheduled BGP maintenance, one remote site is unreachable. BGP neighbors are all in Established state. Walk through your full diagnostic process.',
    a: `BGP in Established state means the TCP session and KEEPALIVE exchange are working. The issue is with <em>prefix advertisement or acceptance</em> — a much more subtle class of problems. I work through this methodically:<br><br>
<strong>Step 1 — Is the prefix even in the BGP table?</strong><br>
<code>show bgp ipv4 unicast &lt;prefix&gt;</code> — Is it listed? If not, the originating router isn't advertising it. Check if the network statement or redistribution is still in place after the maintenance.<br><br>
<strong>Step 2 — Is it the best path and installed in the routing table?</strong><br>
Look for the "&gt;" marker in BGP table (best path) and verify <code>show ip route &lt;destination&gt;</code> shows a BGP route. Common issue post-maintenance: an IGP route has a lower AD and is suppressing the BGP route, or the BGP path changed and now has a worse attribute.<br><br>
<strong>Step 3 — Is it being advertised to the neighbor?</strong><br>
<code>show bgp neighbors &lt;peer&gt; advertised-routes | include &lt;prefix&gt;</code> — A prefix might be in your BGP table but filtered by an outbound route-map or prefix-list that was modified during maintenance.<br><br>
<strong>Step 4 — Is the neighbor receiving it?</strong><br>
<code>show bgp neighbors &lt;peer&gt; received-routes | include &lt;prefix&gt;</code> (requires <code>soft-reconfiguration inbound</code> or Route Refresh). Check inbound route-map or prefix-list on the receiving end.<br><br>
<strong>Step 5 — Did the maintenance change a route-map or prefix-list?</strong><br>
<code>show route-map</code> and <code>show ip prefix-list</code> — During maintenance we often touch these. A single line added to a prefix-list can block an entire customer prefix.<br><br>
<strong>Step 6 — AS-PATH loop detection?</strong><br>
If the AS-PATH now contains our own AS number (due to a misconfigured confederation or route-reflector cluster), our router silently drops the prefix.`,
    cli: `! Step 1: Is prefix in BGP table?
show bgp ipv4 unicast <prefix/len>
! '>' = best path, '*' = valid, 'i' = learned via iBGP

! Step 2: Is it in routing table?
show ip route <destination>

! Step 3: Is it being advertised?
show bgp neighbors <peer-ip> advertised-routes | include <prefix>

! Step 4: Is neighbor receiving it? (needs soft-reconfig or route-refresh)
show bgp neighbors <peer-ip> received-routes | include <prefix>
clear bgp <peer-ip> soft in    ! trigger route refresh (no session drop)

! Step 5: Check route-map and prefix-lists
show route-map
show ip prefix-list
show bgp neighbors <peer-ip>   ! check applied policies

! Step 6: Check AS-PATH
show bgp ipv4 unicast <prefix> | include Path`,
    keypoints: 'BGP Established ≠ prefix advertised. Sequence: prefix in BGP table? → best path? → being advertised? → received? → filtered? → AS-PATH loop? Soft reset (clear bgp soft) for policy changes — no session disruption.'
  },

  // ══════════════════════════════════════════
  // 11. HSRP / VRRP / GLBP
  // ══════════════════════════════════════════
  {
    id: 22, level: 'CCNA', topic: 'FHRP', scenario: false,
    q: 'What is HSRP and what are the HSRP states? How do you configure fast failover in production?',
    a: `HSRP (Hot Standby Router Protocol) is Cisco's proprietary FHRP. It creates a virtual IP address and virtual MAC address shared between two (or more) routers. End hosts use the virtual IP as their default gateway and are unaware which physical router is currently active.<br><br>
<strong>HSRP States:</strong><br>
<strong>Initial:</strong> HSRP process starting up.<br>
<strong>Learn:</strong> Waiting to hear from the Active router (doesn't know the virtual IP yet).<br>
<strong>Listen:</strong> Knows the virtual IP, not Active or Standby — monitoring hellos.<br>
<strong>Speak:</strong> Sending periodic hellos, participating in Active/Standby election.<br>
<strong>Standby:</strong> Backup router — monitoring Active, ready to take over. Sends hellos.<br>
<strong>Active:</strong> Owns the VIP, forwards traffic, responds to ARP for the virtual MAC.<br><br>
<strong>Production considerations for fast failover:</strong><br>
Default hello/hold timers are 3s/10s — meaning failover takes up to 10 seconds. For VoIP or real-time applications this is far too long. I always configure 1s/3s timers in production, and often 500ms/1500ms on critical paths.<br><br>
<strong>Interface tracking:</strong> Without tracking, HSRP may keep a router Active even if its upstream WAN link has failed. Use object tracking or interface tracking to decrement priority when the WAN link goes down, allowing the Standby to take over. This is often overlooked in initial deployments and only discovered during a real outage when failover doesn't happen as expected.<br><br>
<strong>HSRPv2 for IPv6 and extended group numbers:</strong> HSRPv2 supports group numbers 0-4095 and has a different multicast address (224.0.0.102). Always use v2 for new deployments.`,
    cli: `interface Vlan10
  ip address 192.168.10.2 255.255.255.0
  standby version 2
  standby 1 ip 192.168.10.1          ! virtual IP
  standby 1 priority 110             ! higher = preferred Active
  standby 1 preempt delay minimum 60 ! allow 60s for routing to stabilize
  standby 1 timers msec 500 msec 1500 ! 500ms hello, 1500ms hold (fast)
  standby 1 authentication md5 key-string MyKey

! Interface tracking — reduce priority if WAN goes down
track 1 interface Gi0/1 line-protocol  ! track WAN link
  delay down 10 up 30

interface Vlan10
  standby 1 track 1 decrement 30    ! reduce priority by 30 if tracked obj fails

show standby brief
show standby Vlan10
show track`,
    keypoints: 'States: Init→Learn→Listen→Speak→Standby→Active. Default timers 3s/10s — change to 500ms/1500ms for fast failover. Always configure preempt + interface tracking. HSRPv2 for new deployments.'
  },

  // ══════════════════════════════════════════
  // 12. MPLS
  // ══════════════════════════════════════════
  {
    id: 23, level: 'CCNP', topic: 'MPLS', scenario: false,
    q: 'Explain MPLS L3VPN. What are CE, PE, P routers? What is a VRF and how do RD and RT differ?',
    a: `MPLS L3VPN is a service that allows a provider to offer isolated Layer 3 VPN connectivity to multiple customers over a shared infrastructure. Each customer gets their own routing domain, even if they use overlapping IP address space.<br><br>
<strong>Router roles:</strong><br>
<strong>CE (Customer Edge):</strong> Customer's router. Has no MPLS knowledge. Peering with the PE via standard routing (BGP, OSPF, static, EIGRP). Believes it has a direct connection to the remote site.<br>
<strong>PE (Provider Edge):</strong> The critical router. Maintains per-customer VRFs, runs MP-BGP (VPNv4) to exchange VRF routes between PEs, applies MPLS labels to customer packets. Most of the complexity lives here.<br>
<strong>P (Provider Core):</strong> Simple label-switching routers. No VRF knowledge. Only performs MPLS label swap. Fast, simple forwarding.<br><br>
<strong>VRF (Virtual Routing and Forwarding):</strong><br>
A VRF creates a completely separate routing table and forwarding table on the PE for each customer. Same IP address space (e.g., 10.0.0.0/8) can exist in multiple VRFs without conflict. Each customer interface is assigned to a VRF. Without VRFs, all customer routes would be in the global table and would conflict.<br><br>
<strong>RD vs RT — this distinction comes up in every CCIE/CCNP interview:</strong><br>
<strong>RD (Route Distinguisher):</strong> A 64-bit value prepended to a customer's IPv4 prefix to create a globally unique VPNv4 address (96 bits total). RD makes duplicate IPs unique in the MP-BGP table. It is <em>cosmetic</em> — it has no effect on which VRFs import the route. Two customers can both use 10.0.0.0/24, but with different RDs (65001:100:10.0.0.0/24 vs 65001:200:10.0.0.0/24) they coexist in the same BGP table.<br>
<strong>RT (Route Target):</strong> A BGP extended community that controls <em>which VRFs import which routes</em>. This is the actual policy mechanism. A VRF exports routes with RT X and another VRF imports routes with RT X — they communicate. Hub-and-spoke VPNs are designed entirely using asymmetric RT import/export.`,
    cli: `! PE VRF configuration
vrf definition CUSTOMER_A
  rd 65001:100              ! Route Distinguisher — makes routes unique in BGP
  route-target export 65001:100
  route-target import 65001:100
  address-family ipv4

! Assign interface to VRF
interface Gi0/1
  vrf forwarding CUSTOMER_A
  ip address 10.1.1.1 255.255.255.0

! MP-BGP to exchange VRF routes between PEs
router bgp 65001
  address-family vpnv4
    neighbor 10.255.255.2 activate
    neighbor 10.255.255.2 send-community extended

! Check VRF routing table
show ip route vrf CUSTOMER_A
show bgp vpnv4 unicast all
show ip vrf interfaces`,
    keypoints: 'CE=customer (no MPLS), PE=VRF+MP-BGP (complex), P=label-swap (simple). VRF=separate routing table per customer. RD=makes prefix unique in BGP (cosmetic). RT=controls VRF import/export (functional).'
  },

  // ══════════════════════════════════════════
  // 13. QoS
  // ══════════════════════════════════════════
  {
    id: 24, level: 'CCNP', topic: 'QoS', scenario: false,
    q: 'What is the difference between traffic policing and traffic shaping? When would you apply each?',
    a: `Policing and shaping both enforce a rate limit but handle excess traffic completely differently — this distinction has real operational consequences.<br><br>
<strong>Traffic Policing:</strong><br>
Enforces a strict rate limit by dropping or re-marking packets that exceed the configured rate. No buffering — excess traffic is dealt with immediately. Uses a token bucket algorithm (CIR, Bc, Be) with two-rate three-color marking (conform/exceed/violate). Causes TCP retransmissions for excess traffic because dropped packets trigger retransmit timers.<br><br>
<strong>Where I use policing:</strong> At service provider ingress to enforce contracted CIR/PIR limits. On customer-facing ports to ensure one customer's burst doesn't affect others. Also on attack mitigation — rate-limiting specific traffic types (DNS, ICMP) to prevent flooding.<br><br>
<strong>Traffic Shaping:</strong><br>
Enforces a rate limit by <em>buffering</em> excess traffic in a queue and releasing it at the shaped rate. Smooths traffic bursts. Adds queuing delay but doesn't drop packets (unless the shaping queue overflows). Uses a token bucket with a shaping queue.<br><br>
<strong>Where I use shaping:</strong> At enterprise WAN egress where we're connecting to a service provider that has a contracted rate lower than the physical interface speed. For example: a 100 Mbps physical link to an ISP where you only subscribed to 20 Mbps. Without shaping, bursts above 20 Mbps would be policed and dropped by the ISP (with retransmissions). With shaping, we buffer locally and release at 20 Mbps — cleaner, better TCP throughput.<br><br>
<strong>Real production note:</strong> Shaping adds latency, which is a problem for VoIP. Best practice: shape the overall class-default, but ensure your DSCP EF (VoIP) traffic is in a priority queue that bypasses the shaping delay.`,
    cli: `! Policing — enforce strict rate, drop excess
policy-map POLICE_INGRESS
  class CUSTOMER_TRAFFIC
    police rate 10000000 bps      ! 10 Mbps CIR
      conform-action transmit
      exceed-action drop          ! or set dscp to lower value

! Shaping — buffer excess, release smoothly
policy-map SHAPE_WAN_EGRESS
  class class-default
    shape average 20000000        ! 20 Mbps CIR

! Apply outbound on WAN interface
interface Gi0/1
  service-policy output SHAPE_WAN_EGRESS

! Verify
show policy-map interface Gi0/1
! Check: rate, drops, packets matched per class`,
    keypoints: 'Policing: drops/marks excess immediately → TCP retransmits, use at SP ingress. Shaping: buffers excess → adds latency, use at WAN egress matching SP rate. Policing=hard limit. Shaping=soft limit with delay.'
  },
  {
    id: 25, level: 'CCNP', topic: 'QoS', scenario: false,
    q: 'What are DSCP markings and what DSCP values should be used for voice, video, and data in an enterprise QoS policy?',
    a: `DSCP (Differentiated Services Code Point) is 6 bits in the IP header's DS field (replacing old IP Precedence). 64 possible values, but only a subset are standardized by RFC 4594. Understanding the standard markings is important for interoperability between enterprise networks and SP networks that do MDE (Marking, Dropping, Expediting) based on DSCP.<br><br>
<strong>Standard enterprise QoS policy markings:</strong><br>
<strong>DSCP 46 / EF (Expedited Forwarding):</strong> Voice bearer traffic (RTP). Needs &lt;150ms one-way delay, &lt;30ms jitter, &lt;1% loss. EF is handled by a strict priority queue (LLQ). Never more than 30% of link bandwidth as EF or you starve everything else.<br>
<strong>DSCP 34 / AF41:</strong> Interactive video (Cisco Webex, Zoom video). Needs consistent bandwidth, sensitive to loss.<br>
<strong>DSCP 32 / CS4:</strong> Video conferencing control signaling.<br>
<strong>DSCP 26 / AF31:</strong> Mission-critical applications (ERP, SAP). Guaranteed bandwidth class.<br>
<strong>DSCP 24 / CS3:</strong> Call signaling (SCCP, SIP, H.323).<br>
<strong>DSCP 18 / AF21:</strong> Transactional data (database queries, web apps).<br>
<strong>DSCP 10 / AF11:</strong> Bulk data (file transfers, backups). Low priority, can be dropped aggressively with DSCP 12/14.<br>
<strong>DSCP 48 / CS6:</strong> Network control traffic (OSPF, BGP, routing protocol packets). Do not police this class.<br>
<strong>DSCP 0 / BE:</strong> Best effort, scavenger traffic (default).<br><br>
<strong>Mark at the edge, trust inward:</strong> Always re-mark traffic at the campus access edge (wired switchport or wireless AP). Never trust markings from untrusted endpoints — a user could set DSCP 46 on their YouTube traffic. Trust the CP (call processor) server for voice endpoints and the NTP/DNS infrastructure IPs.`,
    cli: `! DSCP re-marking at access edge (untrusted endpoints)
class-map match-any VOICE
  match dscp ef                   ! match already-marked RTP
class-map match-any VOICE_SIGNAL
  match dscp cs3 cs4              ! match SIP/H.323/SCCP

policy-map ACCESS_REMARK
  class VOICE
    set dscp ef                   ! trust EF from phone only
  class VOICE_SIGNAL
    set dscp cs3
  class class-default
    set dscp default              ! re-mark everything else to BE

! Apply inbound on access port (facing IP phone / PC)
interface Gi0/1
  service-policy input ACCESS_REMARK
  mls qos trust dscp              ! or cos for 802.1p marking`,
    keypoints: 'EF=VoIP bearer (46), AF41=video (34), CS3=signaling (24), AF31=critical data (26), CS6=routing protocols (48). Mark at access edge, trust inward. Never trust DSCP from unmanaged endpoints. EF queue ≤30% of bandwidth.'
  },

  // ══════════════════════════════════════════
  // 14. WAN / DMVPN
  // ══════════════════════════════════════════
  {
    id: 26, level: 'CCNP', topic: 'WAN & DMVPN', scenario: false,
    q: 'Explain DMVPN phases 1, 2, and 3. What are the routing implications of each?',
    a: `DMVPN (Dynamic Multipoint VPN) combines three technologies: mGRE (Multipoint GRE — a single tunnel interface that accepts/establishes tunnels with many peers), NHRP (Next-Hop Resolution Protocol — maps tunnel IPs to physical NBMA IPs), and IPsec (encryption). The result is a scalable VPN architecture where new spokes require only hub configuration changes.<br><br>
<strong>Phase 1 — Hub-and-Spoke Only:</strong><br>
All spoke-to-spoke traffic flows through the hub (hub-and-spoke forwarding). Spokes register their NBMA address with the hub via NHRP, but spokes only know the hub — not each other. The hub is the only NHRP server. Simple to configure, works well for small deployments. Limitation: hub is a single point of failure and a bandwidth bottleneck for spoke-to-spoke communication.<br>
Routing: hub summarizes all spoke routes normally. EIGRP/OSPF hub-and-spoke design.<br><br>
<strong>Phase 2 — On-Demand Spoke-to-Spoke Tunnels:</strong><br>
When Spoke A wants to reach Spoke B, it sends a NHRP Resolution Request to the hub, which responds with Spoke B's NBMA (public) IP address. Spoke A builds a direct IPsec+GRE tunnel to Spoke B — bypassing the hub for that traffic flow. Tunnels are dynamic and torn down after idle timeout.<br>
<strong>Routing gotcha:</strong> The hub must NOT summarize spoke routes. Each spoke needs the exact specific route pointing to the remote spoke's next-hop. If the hub summarizes, traffic always goes to the hub and spoke-to-spoke tunnels never form. This is the #1 DMVPN Phase 2 misconfiguration I've seen.<br><br>
<strong>Phase 3 — NHRP Shortcut Routing:</strong><br>
Designed to solve Phase 2's no-summarization limitation. The hub CAN summarize. When traffic arrives at the hub destined for a spoke, the hub sends an NHRP Redirect to the originating spoke, telling it to go directly to the destination spoke. The spoke then builds a direct tunnel. More scalable and allows proper summarization.<br>
Routing: <code>ip nhrp redirect</code> on hub, <code>ip nhrp shortcut</code> on spokes.`,
    cli: `! Hub mGRE tunnel interface
interface Tunnel0
  ip address 10.10.10.1 255.255.255.0
  tunnel source Gi0/1
  tunnel mode gre multipoint
  ip nhrp network-id 1
  ip nhrp authentication MyKey
  ip nhrp map multicast dynamic    ! dynamic spoke registration
  ip nhrp redirect                 ! Phase 3: hub sends NHRP redirect
  tunnel key 12345

! Spoke tunnel interface
interface Tunnel0
  ip address 10.10.10.2 255.255.255.0
  tunnel source Gi0/1
  tunnel mode gre multipoint
  ip nhrp network-id 1
  ip nhrp authentication MyKey
  ip nhrp nhs 10.10.10.1 nbma <hub-public-ip> multicast  ! register with hub
  ip nhrp shortcut                 ! Phase 3: accept NHRP shortcuts
  tunnel key 12345

show dmvpn                         ! show all tunnel states, NHRP entries
show ip nhrp                       ! NHRP cache (tunnel → NBMA mapping)`,
    keypoints: 'Phase1: hub-and-spoke only, hub can summarize. Phase2: dynamic spoke-to-spoke via NHRP, hub must NOT summarize. Phase3: hub can summarize + NHRP redirect creates shortcuts. Phase3 is recommended for large deployments.'
  },

  // ══════════════════════════════════════════
  // 15. NETWORK SECURITY
  // ══════════════════════════════════════════
  {
    id: 27, level: 'CCNA', topic: 'Network Security', scenario: false,
    q: 'What is DHCP snooping? What attacks does it prevent and how does the binding table enable downstream security features?',
    a: `DHCP snooping is a Layer 2 security feature that validates DHCP messages and builds a binding table mapping IP addresses to MAC addresses, switch ports, and VLANs. It divides switch ports into "trusted" (toward legitimate DHCP servers — uplinks, server ports) and "untrusted" (toward end users).<br><br>
<strong>Attacks it prevents:</strong><br>
<strong>Rogue DHCP server:</strong> The primary threat. Without DHCP snooping, any device can respond to DHCP requests. An attacker can set up a rogue DHCP server that hands out IP addresses pointing to the attacker's machine as the default gateway — a perfect man-in-the-middle setup. DHCP snooping drops DHCPOFFER and DHCPACK messages arriving on untrusted ports (only trusted ports may send them).<br>
<strong>DHCP starvation attack:</strong> An attacker rapidly sends DHCPDISCOVER messages with spoofed MAC addresses, exhausting the DHCP pool. The <code>ip dhcp snooping limit rate</code> command rate-limits DHCP traffic per port, mitigating this.<br><br>
<strong>The binding table as a security foundation:</strong><br>
The DHCP snooping binding table (IP address ↔ MAC address ↔ switch port ↔ VLAN) becomes the reference database for two additional features:<br>
<strong>Dynamic ARP Inspection (DAI):</strong> Validates ARP replies against the binding table. If an ARP reply claims "192.168.1.1 is at MAC AA:BB:CC" but the binding table shows 192.168.1.1 is at a different MAC and port, DAI drops the ARP — preventing ARP spoofing/poisoning attacks.<br>
<strong>IP Source Guard:</strong> Filters packets based on the binding table. Only allows packets from the IP/MAC combination assigned to that port. Prevents IP address spoofing.<br><br>
<strong>Operational note:</strong> Static IP devices (servers, printers) don't appear in the DHCP snooping binding table. For DAI and IP Source Guard to work with them, you need to add static entries to the binding table.`,
    cli: `! Enable DHCP snooping
ip dhcp snooping
ip dhcp snooping vlan 10,20,30

! Trusted uplinks (DHCP server and switch uplinks)
interface Gi0/24
  ip dhcp snooping trust

! Rate-limit on access ports (prevent starvation)
interface range Gi0/1 - 20
  ip dhcp snooping limit rate 15   ! 15 pkts/sec max

! Verify
show ip dhcp snooping
show ip dhcp snooping binding      ! IP-MAC-Port-VLAN table
show ip dhcp snooping statistics   ! drops and why

! Add static entry for devices with static IPs
ip dhcp snooping binding 0011.2233.4455 vlan 10 10.0.10.50 interface Gi0/5 expiry 86400`,
    keypoints: 'DHCP snooping: trusted ports=DHCP offers allowed (uplinks/servers), untrusted=requests only. Prevents rogue DHCP server and starvation attacks. Binding table feeds DAI and IP Source Guard. Add static entries for static-IP devices.'
  },
  {
    id: 28, level: 'CCNP', topic: 'Network Security', scenario: false,
    q: 'What is 802.1X? Walk through the authentication flow with RADIUS/ISE and explain MAB as a fallback.',
    a: `802.1X provides port-based Network Access Control (NAC). A switch port starts in an unauthorized state — only EAPOL (EAP over LAN) traffic passes. Authentication must succeed before the port is placed into the correct VLAN and opened for normal traffic. This gives you identity-based access control: who is on port X, not just what MAC address is on it.<br><br>
<strong>Three-party model:</strong><br>
<strong>Supplicant:</strong> The client device. Must have an 802.1X supplicant (built-in on Windows/macOS, NPS/Cisco AnyConnect on managed devices).<br>
<strong>Authenticator:</strong> The switch (or wireless AP). Acts as a middleman — passes EAP messages between supplicant and authentication server. Has no knowledge of credentials itself.<br>
<strong>Authentication Server:</strong> RADIUS server (Cisco ISE, FreeRADIUS, Microsoft NPS). Validates credentials and returns an Access-Accept with optional attributes (VLAN assignment, dACL, SGT).<br><br>
<strong>Authentication flow:</strong><br>
1. Device connects → switch sends EAP-Request/Identity<br>
2. Supplicant replies with EAP-Response/Identity (username)<br>
3. Switch wraps EAP in RADIUS Access-Request and forwards to ISE<br>
4. ISE authenticates (EAP-TLS, PEAP-MSCHAPv2, etc.)<br>
5. ISE returns RADIUS Access-Accept with optional VLAN/policy attributes<br>
6. Switch places port in the assigned VLAN, opens for traffic<br><br>
<strong>MAB (MAC Authentication Bypass) — critical for non-supplicant devices:</strong><br>
Printers, IP cameras, IoT devices, and VoIP phones often can't run an 802.1X supplicant. MAB provides a fallback: after 802.1X timeout, the switch sends the device's MAC address to RADIUS as both the username and password. ISE matches the MAC against a whitelist (or Profiling database) and returns the appropriate VLAN/policy. Not as secure as 802.1X (MAC spoofing is trivial), but much better than no authentication at all.`,
    cli: `! Global 802.1X config
aaa new-model
aaa authentication dot1x default group radius
aaa authorization network default group radius
aaa accounting dot1x default start-stop group radius
dot1x system-auth-control

! RADIUS server (ISE)
radius server ISE_PRIMARY
  address ipv4 10.100.1.100 auth-port 1812 acct-port 1813
  key Str0ngSecret

! Port-level config (access port)
interface Gi0/5
  authentication port-control auto       ! 802.1X enforced
  authentication host-mode multi-auth    ! multiple clients (phone+PC)
  authentication order dot1x mab         ! try 802.1X first, then MAB
  authentication priority dot1x mab
  dot1x pae authenticator
  mab                                    ! enable MAB fallback
  spanning-tree portfast

! Monitor
show authentication sessions interface Gi0/5
show dot1x interface Gi0/5 details`,
    keypoints: '802.1X: supplicant(client)→authenticator(switch)→auth-server(ISE/RADIUS). Port unauthorized until authenticated. MAB=MAC as credential fallback for non-supplicant devices. ISE can dynamically assign VLAN, dACL, SGT on authentication.'
  },

  // ══════════════════════════════════════════
  // 16. ACLs & NAT
  // ══════════════════════════════════════════
  {
    id: 29, level: 'CCNA', topic: 'ACL & NAT', scenario: false,
    q: 'What are the types of ACLs? What placement rules apply and what is the implicit deny?',
    a: `ACLs are ordered lists of permit/deny entries that filter traffic. Three types in IOS:<br><br>
<strong>Standard ACL (1-99, 1300-1999):</strong> Matches only the source IP address. Fast to process but coarse — can't distinguish traffic type. Rule: place <em>as close to the destination as possible</em> because standard ACLs can't distinguish traffic type — placing them near the source might block traffic from ever reaching other destinations that should be allowed.<br><br>
<strong>Extended ACL (100-199, 2000-2699):</strong> Matches source IP, destination IP, protocol, source port, destination port, ToS/DSCP. Much more granular. Rule: place <em>as close to the source as possible</em> — block unwanted traffic early, don't let it traverse the network just to be dropped later.<br><br>
<strong>Named ACL:</strong> Any name instead of a number. Same matching as standard (without layer4) or extended (with layer4). Preferred because: human-readable, entries can be deleted individually using sequence numbers, remarks supported.<br><br>
<strong>Implicit deny:</strong> Every ACL has an invisible "deny any" as the last entry. If a packet doesn't match any permit/deny entry, it's dropped silently. This catches people out — you add a permit for new traffic but forget about existing traffic, and everything breaks. Always add a final explicit <code>permit ip any any</code> (or <code>deny ip any any log</code> if you want visibility into what's being dropped).<br><br>
<strong>Production lessons:</strong><br>
• The <code>log</code> keyword on a deny entry logs matches to syslog — invaluable for troubleshooting but adds CPU load on high-traffic links<br>
• ACL entries are processed sequentially — most specific first, then general. A common mistake is putting a broad permit before a specific deny — the deny is never reached<br>
• <code>show ip access-lists</code> shows hit counters per ACE — use this to verify which entries are matching`,
    cli: `! Named extended ACL (preferred)
ip access-list extended ALLOW_WEB_TO_SERVER
  10 permit tcp 10.0.1.0 0.0.0.255 host 10.100.1.50 eq 443
  20 permit tcp 10.0.1.0 0.0.0.255 host 10.100.1.50 eq 80
  30 deny   ip 10.0.0.0 0.255.255.255 host 10.100.1.50 log
  40 permit ip any any

! Apply inbound on closest interface to source
interface Gi0/1
  ip access-group ALLOW_WEB_TO_SERVER in

! Verify (check hit counters)
show ip access-lists ALLOW_WEB_TO_SERVER

! Edit named ACL — add/remove specific entries
ip access-list extended ALLOW_WEB_TO_SERVER
  no 30                           ! delete entry 30
  35 deny ip 10.99.0.0 0.0.255.255 any log  ! insert between 30 and 40`,
    keypoints: 'Standard: source only, place near destination. Extended: src+dst+protocol+port, place near source. All ACLs have implicit deny any. Named ACLs allow per-entry deletion. Use log keyword for visibility. Most-specific entries first.'
  },

  // ══════════════════════════════════════════
  // 17. TROUBLESHOOTING SCENARIOS
  // ══════════════════════════════════════════
  {
    id: 30, level: 'CCNA', topic: 'Troubleshooting', scenario: true,
    q: 'SCENARIO — A user cannot access the internet. They can ping their default gateway but nothing beyond. Walk through your methodology.',
    a: `The fact that the user can ping the default gateway tells me the following are working: L1 (physical), L2 (switching/VLANs), L3 to the gateway (IP addressing, routing to the subnet). The problem is at the gateway level or beyond.<br><br>
<strong>My structured approach:</strong><br>
<strong>Step 1 — Test from the gateway router itself.</strong> <code>ping 8.8.8.8</code> from the router. If the router can't reach the internet either, the problem is the WAN link or upstream provider — not the LAN. If the router CAN reach 8.8.8.8, the issue is specific to the user traffic path (NAT, routing, ACL).<br><br>
<strong>Step 2 — Check the routing table.</strong> <code>show ip route</code> — Is a default route present? <code>show ip route 0.0.0.0</code> — What's the "gateway of last resort"? I've seen cases where the default route disappears after a maintenance window and nobody noticed.<br><br>
<strong>Step 3 — Verify the WAN/ISP link.</strong> <code>ping &lt;ISP-gateway&gt;</code>, <code>show interface Gi0/1</code> — Is the WAN interface up? Are there errors? Line protocol down with a physical link up usually means keepalive failure or PPP/HDLC mismatch on WAN circuits.<br><br>
<strong>Step 4 — Check NAT.</strong> <code>show ip nat translations</code> — Are translations being created? <code>show ip nat statistics</code> — Are there "misses" (packets not being translated)? Common cause: NAT ACL doesn't include the user's subnet, or the inside/outside interface designations are missing or wrong.<br><br>
<strong>Step 5 — Check ACLs.</strong> <code>show ip access-lists</code> — Look at hit counters. Any deny entries with unexpectedly high counts? An ACL applied outbound on the WAN interface that doesn't have a permit for the user's subnet would explain this exactly.<br><br>
<strong>Step 6 — Traceroute.</strong> <code>traceroute 8.8.8.8</code> from the user's PC — see exactly where the path fails. Asterisks at a specific hop point to the failure location.`,
    cli: `! Step 1: Test from router
ping 8.8.8.8
ping 8.8.8.8 source Gi0/0          ! source from LAN interface

! Step 2: Routing table
show ip route
show ip route 0.0.0.0              ! default route present?

! Step 3: WAN link
show interface Gi0/1               ! WAN interface health
ping <ISP-gateway-IP>

! Step 4: NAT
show ip nat translations           ! Active translations
show ip nat statistics             ! hits vs misses
debug ip nat                       ! real-time NAT decisions (careful on prod!)

! Step 5: ACL
show ip access-lists               ! check deny counters
show ip interface Gi0/1            ! which ACL applied

! Step 6: From user
traceroute 8.8.8.8                 ! Windows: tracert 8.8.8.8`,
    keypoints: 'Methodology: 1) ping from router (WAN issue?) 2) default route present? 3) WAN interface up? 4) NAT translations created? 5) ACL blocking? 6) traceroute from user. Systematic top-down or bottom-up — be consistent.'
  },
  {
    id: 31, level: 'CCNP', topic: 'Troubleshooting', scenario: true,
    q: 'SCENARIO — You see TCP retransmissions every 300ms but zero interface errors. Which layers do you focus on and what tools do you use?',
    a: `No interface errors rules out L1 (CRC, cable faults) and most L2 issues (duplex mismatch would show late collisions). TCP retransmissions with clean interfaces points to L3 or L4 problems — this is the interesting category.<br><br>
<strong>Layer 3 — my first focus:</strong><br>
<strong>MTU/fragmentation:</strong> The #1 cause I encounter in production. Packets larger than the path MTU are either fragmented (if DF bit not set) or silently dropped (if DF bit is set and a router can't fragment). A 300ms retransmission pattern suggests packets are getting through sometimes but not consistently — classic fragmentation behavior where some packet sizes transit fine but larger ones (above the MTU bottleneck) get dropped. Test with: <code>ping -l 1472 -f &lt;dst&gt;</code> (Windows) — if you get "Packet needs to be fragmented but DF set" before reaching 1472, there's an MTU bottleneck in the path.<br>
<strong>Asymmetric routing:</strong> TCP ACKs return via a different path than data packets. Different path = different TCP state — stateful firewalls in the path may drop connections they haven't seen the SYN for. Traceroute in both directions to detect.<br><br>
<strong>Layer 4 — TCP window analysis:</strong><br>
Wireshark is my primary tool here: filter <code>tcp.analysis.retransmission</code>. Look for:<br>
• TCP Zero Window: receiver's buffer is full — application can't consume data fast enough. Not a network problem — application performance issue.<br>
• TCP SACKs: Selective ACKs indicate specific packet loss. The sequence numbers being SACK'd tell you the size of the loss bursts.<br>
• Retransmission pattern: regular interval (300ms, 600ms, 1200ms, etc.) suggests a scheduled event or a policy-based discard, not random loss.<br><br>
<strong>Other causes I've hit:</strong> Firewall asymmetric path dropping mid-flow TCP packets, QoS tail-drop during congestion, PMTUD black-hole (router that should return "frag needed" ICMP silently dropping instead), or an intermediate device doing TCP normalization.`,
    cli: `! MTU path testing (Linux)
ping -M do -s 1472 <destination>       ! DF bit set, test if 1472+28=1500 passes
ping -M do -s 1400 <destination>       ! if 1472 fails, find exact MTU

! MTU path testing (Windows)
ping -l 1472 -f <destination>

! Wireshark filters
tcp.analysis.retransmission            ! show all retransmits
tcp.analysis.zero_window               ! zero window events
tcp.analysis.duplicate_ack            ! duplicate ACKs (indicate loss)
tcp.flags.syn == 1 && tcp.flags.ack == 0  ! all SYN packets (flow starts)

! Cisco — check for asymmetric routing
traceroute <destination> source <local-interface>
! run from both endpoints and compare

! Check for ICMP filtering (PMTUD relies on ICMP type 3 code 4)
! If "frag needed" ICMP is blocked, large packets are silently dropped
show ip access-lists | include permit|deny icmp`,
    keypoints: 'No interface errors → not L1/L2. Focus L3: MTU/fragmentation (ping with DF bit), asymmetric routing. Focus L4: Wireshark retransmission filter, zero window (app issue), SACK patterns. PMTUD blackhole: ICMP "frag needed" being filtered.'
  },

  // ══════════════════════════════════════════
  // 18. HIGH AVAILABILITY
  // ══════════════════════════════════════════
  {
    id: 32, level: 'CCNP', topic: 'High Availability', scenario: false,
    q: 'What is BFD? How does it improve failover compared to native routing protocol timers?',
    a: `BFD (Bidirectional Forwarding Detection) is a simple, fast, independent failure detection protocol. Its only job is to detect link or path failure as quickly as possible and notify routing protocols so they can converge immediately.<br><br>
<strong>Why routing protocol timers alone are too slow:</strong><br>
• OSPF dead timer: 40 seconds (4 × 10s hello by default)<br>
• EIGRP hold timer: 15 seconds<br>
• BGP hold timer: 90-180 seconds<br>
These timers were designed for reliability, not speed. In a campus or data center environment, 40 seconds of traffic blackholing during a link failure is unacceptable for most applications — certainly for voice and video.<br><br>
<strong>BFD fills the gap:</strong><br>
BFD establishes a lightweight UDP session between two endpoints. It sends probe packets (the interval and multiplier are configurable, typically 50ms × 3 = 150ms detection). When probes stop being received, BFD declares the path down and immediately notifies the routing protocol. The routing protocol reacts (removes the neighbor, installs backup routes) in milliseconds instead of seconds.<br><br>
<strong>BFD modes:</strong><br>
<strong>Asynchronous mode (default):</strong> Both ends send probes, each detects failure independently.<br>
<strong>Demand mode:</strong> Probes only sent when needed (less traffic, but slower reaction).<br>
<strong>Echo mode:</strong> One end sends echo packets that loop back through the remote end's forwarding plane — tests the full forwarding path including hardware. More sensitive than asynchronous.<br><br>
<strong>BFD for BGP — real world scenario:</strong> I've deployed BFD on BGP sessions in environments where the BGP hold timer was 90 seconds. A link failure that should have triggered BGP convergence was leaving traffic blackholed for 75+ seconds. After enabling BFD with 50ms/50ms timers and a multiplier of 3 (150ms detection), the same failure now converges in under 500ms total.`,
    cli: `! BFD on interfaces
interface Gi0/0
  bfd interval 50 min_rx 50 multiplier 3
  ! Detects failure in 50ms × 3 = 150ms

! Associate BFD with OSPF
router ospf 1
  bfd all-interfaces

! Associate BFD with EIGRP (per-neighbor)
router eigrp 100
  address-family ipv4 unicast as 100
    neighbor <ip> bfd

! Associate BFD with BGP
router bgp 65001
  neighbor 10.0.0.1 fall-over bfd

! Verify BFD sessions
show bfd neighbors
show bfd neighbors details         ! timers, state, tx/rx stats
show bfd summary`,
    keypoints: 'BFD=sub-second failure detection (50-300ms). Native timers: OSPF=40s, EIGRP=15s, BGP=90-180s. BFD integrates with OSPF/EIGRP/BGP/HSRP/IS-IS. Asynchronous mode (default) vs Echo mode (tests forwarding plane). 50ms × 3 multiplier = 150ms detection.'
  },

  // ══════════════════════════════════════════
  // 19. IPv6
  // ══════════════════════════════════════════
  {
    id: 33, level: 'CCNA', topic: 'IPv6', scenario: false,
    q: 'What is SLAAC and NDP? How does NDP replace ARP, and what is DAD?',
    a: `<strong>SLAAC (Stateless Address Autoconfiguration):</strong><br>
IPv6 hosts can automatically configure their own global unicast address without a DHCP server. The process: the host generates a link-local address from its MAC (EUI-64: insert FF:FE into the middle of the 48-bit MAC to create a 64-bit interface ID). The router periodically sends Router Advertisement (RA) messages containing the /64 network prefix. The host combines the RA prefix with its own EUI-64 interface ID to create a full /128 global unicast address. Before using it, the host runs DAD.<br><br>
<strong>NDP (Neighbor Discovery Protocol — RFC 4861):</strong><br>
NDP replaces ARP, ICMP Router Discovery, and ICMP Redirect in IPv6. It uses ICMPv6 messages:<br>
<strong>RS (Router Solicitation):</strong> Host → all-routers multicast (FF02::2). "Give me your RA."<br>
<strong>RA (Router Advertisement):</strong> Router → all-nodes multicast (FF02::1). Contains prefix, lifetime, flags.<br>
<strong>NS (Neighbor Solicitation):</strong> Equivalent to ARP Request. "Who has this IPv6 address?" But instead of broadcast, it uses solicited-node multicast: FF02::1:FF&lt;last 24 bits of target IPv6&gt;. Only the target device (and any device sharing those last 24 bits) receives it — far more efficient than IPv4 broadcast.<br>
<strong>NA (Neighbor Advertisement):</strong> Equivalent to ARP Reply. "I have that address, here's my MAC."<br><br>
<strong>DAD (Duplicate Address Detection):</strong><br>
Before assigning an address, the host sends an NS with the target address set to the address being tested and the source set to the unspecified address (::). If any other device responds with an NA, there's a duplicate — the host doesn't use that address. This prevents duplicate IP conflicts without a DHCP server coordinating assignments.`,
    cli: `! Enable IPv6 routing and SLAAC
ipv6 unicast-routing
interface Gi0/0
  ipv6 address 2001:db8:1::/64 eui-64  ! router's own address
  ipv6 nd ra-interval 200              ! RA every 200 seconds (default 200)

! View neighbors (equivalent of arp -a)
show ipv6 neighbors                    ! NDP neighbor table
! States: REACH=active, STALE=not recently used, DELAY=probing, PROBE=active probe

! RA Guard — security: prevent rogue RAs
interface Gi0/5
  ipv6 nd raguard attach-policy RA_GUARD_POLICY

! Debug NDP
debug ipv6 nd                          ! NDP events
show ipv6 interface Gi0/0              ! RA/RS config, prefix being advertised`,
    keypoints: 'SLAAC: RA prefix + EUI-64 interface ID = auto-configured global address. NDP replaces ARP (NS/NA), Router Discovery (RS/RA), and Redirect. NS uses solicited-node multicast (not broadcast). DAD verifies address uniqueness before use.'
  },

  // ══════════════════════════════════════════
  // 20. IOS FEATURES
  // ══════════════════════════════════════════
  {
    id: 34, level: 'CCNP', topic: 'IOS Features', scenario: false,
    q: 'What is Cisco CEF and how does it differ from process switching and fast switching? Why does CEF matter for performance?',
    a: `Packet forwarding in Cisco IOS has evolved through three generations, each significantly faster than the last.<br><br>
<strong>Process Switching (oldest, slowest):</strong><br>
The CPU is interrupted for <em>every single packet</em>. The full routing table lookup, Layer 2 rewrite, and forwarding decision happen in software for each packet. CPU utilization spikes under high traffic loads. Still used today for specific packet types: IP options processing, packets addressed to the router itself, certain debug scenarios, some encryption before hardware acceleration.<br><br>
<strong>Fast Switching:</strong><br>
The first packet to a new destination uses process switching (cache miss). Subsequent packets to the same destination use a cached result — much faster, no routing table lookup. However, the cache is invalidated on routing table changes, which on a busy network with route flaps can cause cache churn and performance degradation. Also consumes memory for the cache.<br><br>
<strong>CEF (Cisco Express Forwarding — current standard):</strong><br>
CEF pre-builds two tables:<br>
<strong>FIB (Forwarding Information Base):</strong> An exact copy of the routing table, organized for hardware-efficient lookup. Updated automatically when the routing table changes. Longest prefix match is done in hardware.<br>
<strong>Adjacency Table:</strong> Pre-built Layer 2 rewrite information (next-hop MAC address, interface) for every next-hop. No ARP lookup needed at forward time.<br><br>
With CEF, packet forwarding is done entirely in hardware ASICs (on switch platforms) or in the NPU/forwarding ASIC (on routers). Zero CPU involvement per packet. This is why modern switches can forward at terabit-per-second rates with CPU still available for management.<br><br>
<strong>Production relevance:</strong> If you see high CPU on a router, check if process switching is active. <code>show processes cpu | include IP Input</code> — if "IP Input" process is high, something is sending packets that require process switching (IP options, punt to CPU, ACL logging).`,
    cli: `show ip cef                          ! FIB table
show ip cef 10.1.1.0/24 detail       ! specific prefix forwarding info
show adjacency                       ! adjacency table (L2 rewrite info)
show adjacency detail                ! MAC rewrite strings per next-hop

! Identify process-switched traffic (high CPU)
show processes cpu | include IP Input
show ip cef not-cef-switched        ! prefixes bypassing CEF

! Verify CEF is enabled
show ip cef summary
! Should show: CEF is enabled, FIB stats

! CEF load balancing
ip cef load-sharing algorithm universal  ! per-flow (default)
show ip cef exact-route <src> <dst>      ! which path CEF would use`,
    keypoints: 'Process switching: CPU per packet (slowest). Fast switching: CPU for first packet, cached for subsequent. CEF: pre-built FIB + adjacency table, hardware ASIC forwarding (fastest, default). High IP Input CPU = something bypassing CEF.'
  },

  // ══════════════════════════════════════════
  // 21. IOS UPGRADE & ROMMON
  // ══════════════════════════════════════════
  {
    id: 35, level: 'CCIE', topic: 'IOS Upgrade', scenario: true,
    q: 'SCENARIO — A Catalyst 9K switch boots on the old IOS-XE version after a reload in Install Mode. What happened and how do you fix it?',
    a: `In Install Mode, IOS-XE uses <code>packages.conf</code> as the boot directive file — it references a set of sub-packages instead of a monolithic .bin file. Booting the old version after a reload means one of three things happened during the upgrade:<br><br>
<strong>Root Cause 1 — Install not committed:</strong><br>
The most common cause. In Install Mode, after <code>install activate</code> the system reloads into the new image, but it's in a "pending commit" state. If you don't run <code>install commit</code> within the maintenance window (before the next reload), the system auto-rollbacks to the previous version on next boot. This is a safety feature — the system assumes the upgrade caused problems if nobody committed it. I've seen this burn operators who activate successfully, close the change window, and find the box on the old version the next morning after an unplanned reload.<br><br>
<strong>Root Cause 2 — BOOT variable overrides packages.conf:</strong><br>
If <code>boot system flash:old-image.bin</code> is still in the config, it takes precedence over packages.conf. Check with <code>show boot</code> — if you see a .bin file listed, that's your culprit. Remove it and set it to packages.conf.<br><br>
<strong>Root Cause 3 — packages.conf corrupted or pointing to old packages:</strong><br>
<code>more bootflash:/packages.conf</code> — verify it references the new image packages. Can be corrupted by a failed activation.<br><br>
<strong>Fix sequence:</strong><br>
1. <code>show install summary</code> — check the install state<br>
2. If in "Activated, Uncommitted" state → <code>install commit</code><br>
3. If BOOT variable overrides → fix it, reload<br>
4. If packages.conf corrupt → re-do install add/activate from the .bin file<br><br>
<strong>Important production practice:</strong> Always verify the MD5/SHA512 hash of the downloaded image before starting. A corrupted image that passes initial checks but fails mid-install leaves the switch in an inconsistent state that requires ROMMON recovery.`,
    cli: `! Step 1: Check install state
show install summary
! Should show: Active: 17.xx.xx (Committed) for a healthy state

! Step 2: Check BOOT variable
show boot
! Should say: packages.conf, not a .bin filename

! Step 3: Commit if pending
install commit

! Step 4: If BOOT variable wrong
no boot system flash bootflash:old-image.bin
boot system flash bootflash:packages.conf
write memory
reload

! Step 5: Check packages.conf
more bootflash:/packages.conf

! Step 6: Full re-install if corrupted
install add file bootflash:cat9k_iosxe.17.xx.xx.SPA.bin activate commit

! Pre-upgrade: clean old packages to free space
install remove inactive
show disk0:      ! verify free space (need ~2x image size)`,
    keypoints: 'Install Mode: packages.conf controls boot. Most common cause: forgot "install commit" — system auto-rollbacks on next reload if not committed. Check: show install summary, show boot. Fix: install commit, or fix BOOT variable, or re-activate. Always verify image hash before upgrade.'
  },

  // ══════════════════════════════════════════
  // 22. FIREWALL
  // ══════════════════════════════════════════
  {
    id: 36, level: 'CCIE', topic: 'Firewall', scenario: false,
    q: 'Explain the ASA packet processing pipeline. What is the critical NAT + ACL evaluation order?',
    a: `Understanding the ASA packet processing pipeline is essential for troubleshooting drops and NAT issues. Many engineers think of ACLs and NAT as independent — but the order they're evaluated in determines which IP addresses you write rules against.<br><br>
<strong>ASA 11-Step Packet Flow (simplified):</strong><br>
1. Ingress interface — receive frame, strip L2 header<br>
2. IP sanity check — TTL validation, checksum verification, fragmentation reassembly<br>
3. TCP normalizer — SYN cookies, sequence number validation, half-open connection limits<br>
4. <strong>Inbound ACL evaluation</strong> — interface ACL is evaluated here<br>
5. Route lookup — determine egress interface<br>
6. Connection table lookup — existing session? (return traffic bypasses steps 4-8 for speed)<br>
7. NAT un-translate — for return traffic, reverse the NAT performed when session started<br>
8. Security level check — higher security → lower security is default allow; lower → higher requires ACL or inspect<br>
9. Deep packet inspection — application layer inspection (DNS fixup, FTP inspection, SIP inspection)<br>
10. <strong>NAT translate</strong> — source/destination NAT applied for new connections<br>
11. Egress ACL evaluation<br><br>
<strong>Critical CCIE-level trap:</strong><br>
NAT is evaluated <em>after</em> the inbound ACL for traffic entering the inside interface. This means: when writing ACLs on the <strong>inside interface</strong>, reference the <strong>pre-NAT (private)</strong> IP addresses. When writing ACLs on the <strong>outside interface</strong>, reference the <strong>post-NAT (public)</strong> IP addresses for inbound traffic. Getting this backwards is the most common ACL/NAT misconfiguration I've debugged for other teams — the ACL looks correct on paper but doesn't match because it's written against the wrong IP.`,
    cli: `! Most valuable ASA troubleshooting tool: packet-tracer
! Simulates a packet through the entire pipeline, shows where it's dropped
packet-tracer input OUTSIDE tcp 203.0.113.100 54321 10.10.10.50 443 detailed
! Output shows step-by-step: ACL check, NAT translation, inspection result

! Capture on ASA
capture CAP_OUTSIDE interface OUTSIDE match tcp host 203.0.113.100 any
show capture CAP_OUTSIDE detail
show capture CAP_OUTSIDE decode        ! protocol decode

! Check connection table
show conn count                        ! total connections
show conn address 10.10.10.50          ! connections to specific host

! Check NAT translations
show xlate                             ! current NAT translations
show nat detail                        ! NAT policy and hit counts

! Syslog for drops
show log | include deny|drop
logging enable
logging buffered debugging`,
    keypoints: 'ACL evaluated BEFORE NAT (inside interface). Write inside ACLs with pre-NAT IPs. Write outside ACLs with post-NAT (public) IPs. Use packet-tracer for step-by-step pipeline debugging. FTD adds Snort IPS after standard pipeline.'
  },

  // ══════════════════════════════════════════
  // 23. NEXUS / vPC
  // ══════════════════════════════════════════
  {
    id: 37, level: 'CCIE', topic: 'Nexus & Data Center', scenario: false,
    q: 'What is vPC on Nexus? What happens during peer-link failure vs peer-keepalive failure?',
    a: `vPC (Virtual Port Channel) allows two separate Nexus switches to present themselves as a single logical switch to downstream devices. A downstream switch or server can form a port-channel with both Nexus switches simultaneously (vPC member ports), and STP sees the entire bundle as one link — no blocked ports, full active-active bandwidth utilization.<br><br>
<strong>Key vPC components:</strong><br>
<strong>vPC Domain:</strong> Both Nexus switches share the same domain ID — this makes them act as a single logical switch for vPC purposes.<br>
<strong>Peer-Keepalive Link:</strong> A dedicated Layer 3 link (typically via management VRF) that sends UDP heartbeats to detect if the peer is alive. This link exists to prevent split-brain scenarios.<br>
<strong>Peer-Link:</strong> A high-bandwidth Layer 2 trunk between the two vPC peers. Carries: BPDUs (STP sync), MAC table sync via CFS, IGMP state, and traffic that needs to be forwarded via the peer (e.g., traffic arriving on a non-vPC uplink that needs to reach a host on the peer's vPC member port).<br>
<strong>CFS (Cisco Fabric Services):</strong> Synchronizes MAC tables, ARP entries, IGMP snooping state between peers.<br><br>
<strong>Failure scenarios — critical to know for the exam and production:</strong><br>
<strong>Peer-Link fails but Keepalive up:</strong> The secondary vPC switch (lower priority) disables ALL of its vPC member ports. Reason: the primary is still alive (confirmed by keepalive), but the peer-link is down, meaning traffic forwarding to the peer is impossible. Rather than create a split-brain loop, the secondary disables its member ports — hosts reconnect via the primary. The secondary keeps its non-vPC ports active.<br>
<strong>Keepalive fails but Peer-Link up:</strong> No action. The peer-link is the higher-trust path — if it's up, both switches can synchronize. One keepalive failure could just be a management link hiccup.<br>
<strong>Both fail simultaneously:</strong> Each switch operates independently with its own vPC member ports — risk of L2 loops. This is why peer-link should be high-redundancy (multiple 40G/100G links, diverse path).`,
    cli: `feature vpc
feature lacp

vpc domain 10
  peer-keepalive destination 192.168.100.2 source 192.168.100.1 vrf management
  peer-gateway              ! route packets destined to peer's HSRP/VRRP MAC locally
  auto-recovery             ! re-enable vPC after dual failure recovery
  ip arp synchronize

! Peer-link (Layer 2 trunk between vPC peers)
interface port-channel1
  switchport mode trunk
  spanning-tree port type network
  vpc peer-link

! vPC member port-channel (toward downstream switch/server)
interface port-channel10
  switchport mode trunk
  vpc 10

show vpc brief                             ! overall vPC state
show vpc consistency-parameters global    ! any config mismatches between peers?
show vpc role                             ! primary vs secondary
show port-channel summary                 ! bundle status`,
    keypoints: 'vPC = active-active L2 from downstream perspective. Peer-link failure + keepalive up → secondary disables all vPC ports (prevents split-brain). Keepalive failure + peer-link up → no action. Both fail → split-brain risk. Always use CFS sync + auto-recovery.'
  },

  // ══════════════════════════════════════════
  // 24. ACI
  // ══════════════════════════════════════════
  {
    id: 38, level: 'CCIE', topic: 'ACI', scenario: false,
    q: 'Explain the ACI object model hierarchy and the contract-based communication model.',
    a: `ACI (Application Centric Infrastructure) is Cisco's intent-based data center fabric. Instead of configuring VLANs and ACLs on individual switches, you define application requirements in a policy model on the APIC controller, and ACI pushes the appropriate configuration to the fabric.<br><br>
<strong>Object Model Hierarchy (top to bottom):</strong><br>
<strong>Tenant:</strong> Top-level administrative and policy boundary. Separate tenants for different business units or customers. Special tenants: "common" (shared services like DNS/NTP), "infra" (fabric infrastructure), "mgmt" (management).<br>
<strong>VRF (Private Network):</strong> A Layer 3 routing domain within a tenant. Separate IP namespace per VRF — multiple tenants can use overlapping IPs in different VRFs.<br>
<strong>Bridge Domain (BD):</strong> Layer 2 forwarding domain + subnet. Replaces the traditional VLAN flood domain. Can have multiple subnets. BDs control ARP flooding, unicast routing, and L3 gateways.<br>
<strong>Application Profile:</strong> Logical grouping of EPGs representing an application tier architecture.<br>
<strong>EPG (Endpoint Group):</strong> The fundamental policy boundary. An EPG is a group of endpoints (VMs, bare metal, containers) with the same policy requirements. All endpoints in an EPG have the same security posture and access policies. EPG replaces VLAN as the policy unit.<br>
<strong>Contract:</strong> Defines permitted communication between EPGs. Consists of Subjects (groupings of filters) and Filters (specific protocols/ports).<br><br>
<strong>Zero-trust model:</strong><br>
Without an explicit contract, EPGs CANNOT communicate with each other — even if they're in the same Bridge Domain. This is opposite to traditional networking where everything in the same VLAN communicates freely. In ACI, you explicitly define which EPGs can talk and on which ports/protocols. This is ACI's primary security benefit: micro-segmentation by default.`,
    cli: `! ACI CLI (NX-OS style on leaf/spine nodes)
show endpoint                          ! all endpoints learned by fabric
show endpoint ip 10.0.0.50             ! find which EPG owns this IP
show vrf                               ! VRFs in fabric
show bridge-domain                     ! Bridge domains

! APIC diagnostics
acidiag fnvread                        ! fabric node discovery
acidiag avread                         ! APIC cluster health

! Atomic counter (contract hit counter) — verify if traffic is permitted
! Configure via APIC GUI: Fabric > Inventory > Topology > Atomic Counter

! Packet capture via SPAN on ACI leaf
! Configure via APIC: Fabric > Access Policies > Troubleshoot Policies > SPAN`,
    keypoints: 'Hierarchy: Tenant→VRF→Bridge Domain→App Profile→EPG→Contract. Zero-trust: EPGs cannot communicate without explicit contract. EPG replaces VLAN as policy unit. BD replaces traditional VLAN flood domain. Contracts define permitted traffic between EPGs.'
  },

  // ══════════════════════════════════════════
  // 25. ROUTE REDISTRIBUTION
  // ══════════════════════════════════════════
  {
    id: 39, level: 'CCIE', topic: 'Route Redistribution', scenario: true,
    q: 'SCENARIO — After configuring EIGRP ↔ OSPF mutual redistribution, routes are missing or incorrect. Walk through the root causes and fixes.',
    a: `Mutual redistribution (two-way between EIGRP and OSPF) is one of the most complex configurations in enterprise networking and has several specific failure modes. I approach it methodically:<br><br>
<strong>Root Cause 1 — Missing seed metric (EIGRP redistribution):</strong><br>
When redistributing into EIGRP from ANY other protocol, EIGRP's default metric is "infinity" (no metric assigned) — the routes are simply not advertised. This is the #1 cause. You MUST explicitly specify a metric with five parameters: bandwidth (kbps), delay (10us units), reliability (0-255), load (0-255), MTU.<br><br>
<strong>Root Cause 2 — Mutual redistribution loop:</strong><br>
Routes redistributed from OSPF into EIGRP get redistributed back into OSPF (and vice versa). The route bounces between protocols, potentially with degrading metrics or causing instability. Fix: use <strong>route tags</strong>. Tag routes when you inject them into Protocol B, and on the other ASBR, block routes with that tag from being redistributed back into Protocol A. This is the standard solution.<br><br>
<strong>Root Cause 3 — Administrative Distance conflict:</strong><br>
A route exists in both OSPF (AD=110) and EIGRP (AD=90). On a router running both protocols, EIGRP wins and the OSPF route is suppressed. On a router running OSPF only, it correctly uses the OSPF route. The inconsistency causes routing asymmetry or black-holes. Fix: adjust the AD of the redistributed routes, or use conditional redistribution to avoid the conflict.<br><br>
<strong>Root Cause 4 — OSPF E1 vs E2 external type:</strong><br>
E2 routes use a fixed external metric (does not increase with internal cost). E1 routes add internal cost to the external metric. When comparing E2 routes, the one with the lower external metric wins regardless of how far you are from the ASBR. This can cause suboptimal routing. Use E1 when internal topology cost should influence path selection.`,
    cli: `! Fix 1: EIGRP seed metric (REQUIRED when redistributing into EIGRP)
router eigrp 100
  redistribute ospf 1 metric 10000 100 255 1 1500
  !                          ^BW   ^delay ^rel ^load ^MTU

! Fix 2: Route tags to prevent redistribution loops
route-map OSPF_TO_EIGRP permit 10
  match ip address prefix-list OSPF_NETWORKS  ! only redistribute OSPF routes
  set tag 100                                  ! tag all redistributed routes

route-map EIGRP_TO_OSPF deny 5
  match tag 100                               ! block routes that came from OSPF

route-map EIGRP_TO_OSPF permit 10
  match ip address prefix-list EIGRP_NETWORKS

router eigrp 100
  redistribute ospf 1 route-map OSPF_TO_EIGRP metric 10000 100 255 1 1500

router ospf 1
  redistribute eigrp 100 subnets route-map EIGRP_TO_OSPF metric-type 1 metric 20

! Verify redistribution
show ip route eigrp                    ! EIGRP routes
show ip route ospf                     ! OSPF routes
show ip ospf database external         ! Type 5 LSAs being redistributed`,
    keypoints: 'EIGRP MUST have seed metric (infinity by default). Use route tags for mutual redistribution loop prevention. Watch for AD conflicts (EIGRP=90 beats OSPF=110). Use metric-type 1 for accurate cost propagation. Always verify with show ip route and OSPF database.'
  },

  // ══════════════════════════════════════════
  // 26. SD-WAN
  // ══════════════════════════════════════════
  {
    id: 40, level: 'CCNP', topic: 'SD-WAN', scenario: false,
    q: 'What are the Cisco SD-WAN components? What is the correct upgrade order and why does it matter?',
    a: `Cisco SD-WAN separates the traditional WAN into distinct planes, each managed by a dedicated controller component. Understanding this architecture is important for both design and operations.<br><br>
<strong>SD-WAN Components:</strong><br>
<strong>vBond:</strong> Orchestration plane. The first point of contact for all other SD-WAN components. Authenticates new devices joining the fabric, facilitates NAT traversal, helps vEdge devices discover vSmart and vManage. Every component must be able to reach vBond on TCP/UDP 12346.<br>
<strong>vSmart:</strong> Control plane. Distributes routing information (OMP — Overlay Management Protocol, similar to BGP), security policies, and crypto keys to all vEdge/cEdge devices. vSmart uses OMP to distribute vRoutes, service routes, and transport locators (TLOCs). Multiple vSmart controllers are deployed for redundancy.<br>
<strong>vManage:</strong> Management plane. GUI and NBI (REST API) for configuration, monitoring, template management, and software upgrades. vManage maintains the centralized network policy and pushes configuration to vSmart which distributes to vEdges.<br>
<strong>vEdge/cEdge:</strong> Data plane. The actual WAN edge routers at branch sites (vEdge = Viptela hardware, cEdge = Cisco ISR/ASR running IOS-XE SD-WAN). Forwards actual production traffic, establishes IPsec BFD tunnels between sites.<br><br>
<strong>Upgrade order — CRITICAL:</strong><br>
1. <strong>vBond first</strong> — it must remain compatible with everything else<br>
2. <strong>vSmart</strong> — upgrade one at a time, verify OMP sessions recover before next<br>
3. <strong>vManage</strong> — upgrade after control plane is stable<br>
4. <strong>vEdge/cEdge last</strong> — rolling upgrade, staged by region or site type<br><br>
Breaking the order (e.g., upgrading vManage before vSmart) can cause compatibility issues where the management plane can't communicate with the control plane, leaving you unable to monitor or push configs during the upgrade window.`,
    cli: `! vEdge/cEdge upgrade (CLI method)
request software install vpn 0 /bootflash/viptela-image.tar.gz
request software activate 20.x.x
request software default 20.x.x
show software                          ! verify active version

! Verify SD-WAN operational state
show sdwan omp summary                 ! OMP sessions (to vSmart)
show sdwan omp routes                  ! learned routes via OMP
show sdwan peers                       ! vBond/vSmart/vManage connections
show sdwan bfd sessions                ! BFD tunnels between sites
show sdwan control connections         ! controller connections

! If vEdge loses vSmart: data plane continues forwarding (cached routes)
! but no new policy updates. Check:
show sdwan control connections-history ! see connection events`,
    keypoints: 'vBond=orchestration, vSmart=control/OMP, vManage=management, vEdge/cEdge=data. Upgrade order: vBond→vSmart→vManage→vEdge. Out-of-order can break management plane. Data plane persists without vSmart for ~12h with cached routes.'
  },

  // ══════════════════════════════════════════
  // 27. ARP TYPES
  // ══════════════════════════════════════════
  {
    id: 41, level: 'CCNP', topic: 'ARP Types', scenario: false,
    q: 'Explain Gratuitous ARP, Proxy ARP, and ARP Spoofing. When does each occur and how do you defend against spoofing?',
    a: `<strong>Gratuitous ARP (GARP):</strong><br>
A special ARP where the sender's IP and target IP are both the sender's own IP address. Sent as a broadcast. Purpose: <em>announce</em> a new IP-to-MAC mapping to all devices on the segment, forcing them to update their ARP caches without being asked. Sent when: a device comes online, an IP is reconfigured, an NIC fails over to a backup (bonding), a virtual machine migrates (vMotion), or HSRP/VRRP Active changes.<br><br>
<strong>Why GARP matters in production:</strong> When HSRP failover occurs, the new Active router sends a Gratuitous ARP with the virtual IP and virtual MAC pointing to itself. Without GARP, all hosts still have the old MAC in their ARP cache and send traffic to the failed router. GARP forces immediate cache updates, making failover transparent to end users. Without working GARP, HSRP failover would be effective but nobody would know about it for up to 300 seconds (ARP cache TTL).<br><br>
<strong>Proxy ARP:</strong><br>
A router responds to an ARP request on behalf of a remote host that's not on the local segment. When a host without a default gateway tries to ARP for an IP in another subnet, the router (with <code>ip proxy-arp</code> enabled by default on Cisco) responds with its own MAC. The host then sends traffic to the router, which forwards it. This masks routing misconfigurations — devices with incorrect subnet masks or no default gateway still "work." I disable proxy-arp in production to enforce proper gateway configuration: <code>no ip proxy-arp</code> on all interfaces.<br><br>
<strong>ARP Spoofing (Poisoning):</strong><br>
An attacker sends unsolicited Gratuitous ARP replies claiming a legitimate IP address maps to the attacker's MAC. All hosts on the segment update their ARP caches, redirecting traffic to the attacker (Man-in-the-Middle). The attacker can forward traffic transparently while inspecting it.<br><br>
<strong>Defense:</strong> Dynamic ARP Inspection (DAI) validates ARP packets against the DHCP snooping binding table. Any ARP reply claiming an IP-to-MAC mapping that doesn't match the binding table is dropped.`,
    cli: `! Disable Proxy ARP (security hardening — do this on all interfaces)
interface Gi0/0
  no ip proxy-arp

! View ARP table
show arp                              ! Cisco router ARP table
show ip arp vlan 10                   ! VLAN-specific on switches

! DAI — ARP spoofing prevention
ip arp inspection vlan 10,20,30
interface Gi0/24
  ip arp inspection trust             ! trust uplinks
interface range Gi0/1-20
  ip arp inspection limit rate 100   ! rate-limit on access ports

show ip arp inspection vlan 10
show ip arp inspection statistics vlan 10

! For static IP devices (no DHCP entry in binding table)
ip arp inspection filter ARP_ACL vlan 10
arp access-list ARP_ACL
  permit ip host 10.0.0.50 mac host 0011.2233.4455`,
    keypoints: 'GARP: announce own MAC (HSRP failover, vMotion). Proxy ARP: router answers ARP for remote hosts (disable in production). ARP Spoofing: fake GARP to redirect traffic (MITM). Defense: Dynamic ARP Inspection + DHCP snooping binding table.'
  },

  // ══════════════════════════════════════════
  // 28. PING & TRACEROUTE
  // ══════════════════════════════════════════
  {
    id: 42, level: 'CCNP', topic: 'Ping & Traceroute', scenario: false,
    q: 'How does traceroute work at the protocol level? Why do you see asterisks (*) and how do you trace through MPLS?',
    a: `Traceroute is an elegant exploit of TTL (Time To Live) behavior. It sends a series of probes with incrementally increasing TTL values.<br><br>
<strong>How it works:</strong><br>
Probe 1: TTL=1. The first router decrements TTL to 0 and returns an ICMP Type 11 (Time Exceeded) message. The source IP of this ICMP message is the first-hop router's address.<br>
Probe 2: TTL=2. Gets past the first router, second router decrements to 0, returns ICMP Type 11. And so on until the destination is reached, which replies with ICMP Type 0 (Echo Reply) for ICMP-based traceroute, or ICMP Type 3 Port Unreachable for UDP-based traceroute.<br><br>
<strong>Cisco vs Windows:</strong><br>
• Cisco: UDP probes (ports 33434+) by default<br>
• Windows (tracert): ICMP Echo Requests<br>
• Linux: UDP by default, ICMP with <code>-I</code>, TCP with <code>-T</code><br><br>
<strong>Why asterisks (*) appear:</strong><br>
1. <strong>Firewall/ACL blocks ICMP Time Exceeded</strong> — the router receives the probe and decrements TTL to 0, but the router (or a firewall protecting it) doesn't send or blocks the ICMP Type 11 response. The path continues beyond the asterisk.<br>
2. <strong>ECMP/Asymmetric routing</strong> — the probe goes one path but the ICMP reply comes back via a different path. The reply arrives at the wrong traceroute listener hop count.<br>
3. <strong>Router rate-limits ICMP generation</strong> — Cisco routers rate-limit ICMP unreachables by default (100pps). Under load, some probes don't get responses.<br>
4. <strong>MPLS core</strong> — P (provider core) routers in an MPLS network forward based on labels, not IP TTL. The IP TTL isn't decremented (or the ICMP isn't generated). Use <code>traceroute mpls</code> to trace LSPs specifically.<br><br>
<strong>Extended traceroute in production:</strong> Always specify source interface with <code>source Lo0</code> — using a loopback guarantees a consistent source IP that's always reachable, even if the physical interface used for routing changes.`,
    cli: `! Standard traceroute
traceroute 8.8.8.8 source Lo0 probe 5 ttl 1 30 numeric

! MPLS LSP traceroute (trace through MPLS core)
traceroute mpls ipv4 10.1.1.0/24       ! trace specific prefix LSP

! Extended ping for MTU testing (DF bit)
ping 8.8.8.8 source Lo0 size 1472 df-bit repeat 5
! If "!!!!!": 1500 MTU path is fine
! If ".....": fragmentation needed — MTU issue in path

! TCP traceroute (bypasses ICMP filters in many networks)
! (on Linux)
traceroute -T -p 80 <destination>      ! TCP SYN to port 80

! Key ICMP types
! Type 0  = Echo Reply (ping response)
! Type 3  = Destination Unreachable (various codes)
! Type 8  = Echo Request (ping)
! Type 11 = Time Exceeded (TTL=0) — what traceroute uses`,
    keypoints: 'Traceroute: TTL=1,2,3... each router decrements TTL, sends ICMP Type 11 on TTL=0. Asterisks: ICMP filtered, ECMP asymmetry, rate-limiting, MPLS label forwarding (use traceroute mpls). Always use source loopback in production traceroutes.'
  },

  // ══════════════════════════════════════════
  // BONUS: QUICK-HIT HIGH-FREQUENCY QUESTIONS
  // ══════════════════════════════════════════
  {
    id: 43, level: 'CCNA', topic: 'Static Routing', scenario: false,
    q: 'What is a floating static route? Give a real-world use case.',
    a: `A floating static route is a static route configured with an Administrative Distance (AD) higher than the primary routing protocol, making it remain inactive (not installed in the routing table) while the primary route exists. It "floats" out of the routing table when the primary is present, and drops in when the primary disappears.<br><br>
<strong>Real-world use case — dual WAN/ISP failover:</strong><br>
Primary link: MPLS circuit learned via OSPF (AD=110). This is the primary path for all traffic. Backup link: broadband internet connection. We configure a floating static default route with AD=254 (higher than any routing protocol). As long as OSPF advertises the default route (AD=110), the static route with AD=254 stays dormant. If the MPLS circuit fails and OSPF removes the route, the floating static with AD=254 becomes the best route and traffic fails over to the internet link — automatically, without manual intervention.<br><br>
<strong>Another use case — out-of-band management:</strong> A floating static route pointing management traffic to a separate OOB management network, only activated if the primary in-band management route fails. This ensures you always have a way to reach the router even if the production network is down.`,
    cli: `! Primary OSPF default route (AD=110, learned dynamically)
! router ospf 1 → default-information originate always

! Floating static backup default (AD=254 > OSPF AD=110)
ip route 0.0.0.0 0.0.0.0 203.0.113.1 254   ! 254 = higher than any protocol

! AD reference
! Connected=0, Static=1, EIGRP=90, OSPF=110, RIP=120, iBGP=200, Unknown=255

! Verify: floating static ONLY appears when OSPF default is removed
show ip route 0.0.0.0
! Normal: shows "O*E2 0.0.0.0/0" (OSPF)
! During failover: shows "S* 0.0.0.0/0 [254/0]" (static)`,
    keypoints: 'Floating static: higher AD than primary protocol. Stays inactive while primary route present, activates when primary disappears. Use case: backup ISP, OOB management. AD must be HIGHER than primary protocol AD (OSPF=110, so use 111+ for OSPF backup).'
  },
  {
    id: 44, level: 'CCNA', topic: 'ACL & NAT', scenario: false,
    q: 'What is PAT (NAT Overload)? Walk through how the translation table enables many-to-one mapping.',
    a: `PAT (Port Address Translation), also called NAT Overload, is the technology that lets an entire organization's private address space share a single public IP address. It's the reason IPv4 hasn't run out yet in practice — billions of devices with RFC 1918 private addresses appear as one (or a few) public IPs on the internet.<br><br>
<strong>How PAT maintains session state:</strong><br>
PAT exploits the fact that TCP and UDP connections are uniquely identified by the five-tuple: {protocol, source IP, source port, destination IP, destination port}. When a private host opens a connection, PAT translates:<br>
• Source IP: 192.168.1.10 → 203.0.113.1 (public IP)<br>
• Source port: 54321 → 1024 (or any available port on the public IP)<br><br>
The NAT translation table stores: {inside local IP+port} ↔ {inside global IP+port} ↔ {outside IP+port}. When a reply arrives at the public IP:port, the NAT table maps it back to the correct private host and port.<br><br>
<strong>PAT capacity:</strong> A single public IP can theoretically support ~65,535 simultaneous connections per destination IP (ports 1024-65535). In practice, PAT tables of tens of thousands of concurrent sessions are common on enterprise routers.<br><br>
<strong>Production gotcha with SIP/VoIP:</strong> SIP uses the port number embedded in the SIP headers to establish media (RTP) streams. PAT changes the source port, but the SIP body still contains the original port number — creating a mismatch. SIP ALG (Application Layer Gateway) on the router must rewrite SIP body content to fix the port numbers. This sometimes causes issues; disabling SIP ALG is occasionally the fix for VoIP problems behind NAT.`,
    cli: `! PAT configuration
ip access-list standard PAT_ACL
  permit 10.0.0.0 0.255.255.255      ! all private ranges to NAT

ip nat inside source list PAT_ACL interface Gi0/1 overload
! 'overload' = PAT

interface Gi0/0
  ip nat inside
interface Gi0/1
  ip nat outside

! Monitor
show ip nat translations             ! active translation table
show ip nat translations verbose     ! see inside/outside local/global
show ip nat statistics               ! total translations, hits, misses

! Clear translation table (use carefully — drops active sessions)
clear ip nat translation *`,
    keypoints: 'PAT=NAT Overload: entire org behind one public IP. Five-tuple {proto,src-ip,src-port,dst-ip,dst-port} uniquely identifies sessions. Translation table maps private ip:port ↔ public ip:port. SIP ALG needed for VoIP. Single public IP supports ~64K concurrent sessions.'
  },
  {
    id: 45, level: 'CCIE', topic: 'OSPF', scenario: true,
    q: 'SCENARIO — You have two OSPF routers stuck in ExStart state. Physical link is up, subnet matches, timers match. What are the causes?',
    a: `ExStart is the state where Master/Slave election occurs using DBD (Database Description) packets. Routers exchange empty DBD packets with just the I-bit (Init), M-bit (More), MS-bit (Master), and a sequence number. The router with the higher Router-ID becomes Master. ExStart should complete in milliseconds on a healthy link — if it's stuck, one of these specific things is wrong:<br><br>
<strong>1. MTU mismatch — by far the most common cause:</strong><br>
DBD packets can be large (carrying LSDB headers). If one interface has MTU 1500 and the other has MTU 1476 (some WAN services subtract overhead), the larger DBDs get dropped on the lower-MTU side without any error message. The router with the lower MTU never acknowledges the DBDs, and ExStart never completes. The stuck ExStart is the only symptom. Fix: <code>ip ospf mtu-ignore</code> (tells OSPF to ignore MTU mismatch when forming adjacency) or fix the actual MTU mismatch. I prefer fixing the actual MTU.<br><br>
<strong>2. Router-ID tie (duplicate RIDs):</strong><br>
If both routers have the same Router-ID, ExStart cannot complete — neither can become the unambiguous Master. OSPF requires unique RIDs in the same area. Always manually configure Router-IDs on loopback interfaces.<br><br>
<strong>3. Authentication type mismatch:</strong><br>
One interface has MD5 authentication configured, the other has clear-text or no authentication. The DBD packets carry the authentication type and won't be accepted by the mismatched peer.<br><br>
<strong>4. Corrupted or unusual packets on the link:</strong><br>
Rarely, a physical layer issue (marginal fiber, SFP, or an inline device) corrupts only larger packets. ExStart DBDs are larger than hellos, so hellos pass (Init/2-Way forms) but DBDs are corrupted (ExStart hangs).`,
    cli: `! Step 1: Check OSPF interface details (MTU is shown here)
show ip ospf interface Gi0/0
! Look for: "Transmit Delay is X sec, State XXX"
! And: MTU line — compare both sides

! Step 2: Check Router IDs on both routers
show ip ospf | include Router ID
! Both Router IDs must be UNIQUE

! Step 3: MTU test between OSPF peers
ping <ospf-peer-ip> size 1473 df-bit     ! test 1473 byte with DF bit
! 1473 + 28 (ICMP) = 1501 total — if fails, MTU issue

! Step 4: Workaround (not recommended long-term)
interface Gi0/0
  ip ospf mtu-ignore                     ! ignore MTU mismatch for OSPF

! Step 5: Check authentication
show ip ospf interface Gi0/0 | include auth
show running-config interface Gi0/0 | include ospf auth

! Step 6: Debug
debug ip ospf adj                        ! watch ExStart state machine
debug ip ospf packet                     ! see actual DBD exchange`,
    keypoints: 'ExStart stuck: 1) MTU mismatch (DBDs dropped silently) — most common. 2) Duplicate Router-IDs. 3) Authentication type mismatch. 4) Physical issues corrupting large packets. Fix MTU with "ip ospf mtu-ignore" or fix actual MTU. Always manually set Router-IDs.'
  },

];

// ─── TOPIC LIST (auto-derived + sorted) ──────────────────────────────────────
const IV_TOPICS = ['ALL', ...new Set(INTERVIEW_DATA.map(q => q.topic))].sort((a,b) => a === 'ALL' ? -1 : a.localeCompare(b));

// ─── MAIN INIT ────────────────────────────────────────────────────────────────
function interviewInit() {
  const page = document.getElementById('page-interview');
  if (!page) return;

  page.innerHTML = `
  <div class="iv-wrap">
    <!-- HEADER -->
    <div class="page-header" style="margin-bottom:20px">
      <div class="page-title">Interview Prep — Cisco R&S</div>
      <div class="page-desc">CCNA · CCNP · CCIE Level · 28 Topics · Production-Depth Answers</div>
    </div>

    <!-- STATS BAR -->
    <div class="iv-stats-bar">
      <div class="iv-stat"><span id="iv-stat-total">0</span><em>Total Q</em></div>
      <div class="iv-stat"><span id="iv-stat-shown">0</span><em>Shown</em></div>
      <div class="iv-stat"><span id="iv-stat-reviewed">0</span><em>Reviewed ✓</em></div>
      <div class="iv-stat"><span id="iv-stat-scenarios" style="color:var(--amber)">0</span><em>Scenarios</em></div>
    </div>

    <!-- FILTERS -->
    <div class="iv-filters">
      <div class="iv-filter-group">
        <span class="iv-filter-label">Level</span>
        <div class="iv-filter-pills" id="iv-level-pills">
          ${['ALL','CCNA','CCNP','CCIE'].map(l =>
            `<button class="iv-pill iv-level-${l} ${l==='ALL'?'active':''}" onclick="ivSetLevel('${l}')">${l}</button>`
          ).join('')}
        </div>
      </div>
      <div class="iv-filter-group">
        <span class="iv-filter-label">Topic</span>
        <select id="iv-topic-select" onchange="ivSetTopic(this.value)" class="iv-select">
          ${IV_TOPICS.map(t => `<option value="${t}">${t}</option>`).join('')}
        </select>
      </div>
      <div class="iv-filter-group" style="flex:1">
        <span class="iv-filter-label">Search</span>
        <input type="text" id="iv-search" class="iv-search-input" placeholder="Search questions, topics, keywords..." oninput="ivSetSearch(this.value)">
      </div>
      <button class="iv-clear-btn" onclick="ivClearAll()">⟳ Reset</button>
    </div>

    <!-- QUESTION LIST -->
    <div id="iv-question-list"></div>

    <div id="iv-empty-state" style="display:none" class="iv-empty">
      <div style="font-size:32px;margin-bottom:12px">🔍</div>
      <div style="font-size:15px;color:var(--muted2)">No questions match your filters.</div>
      <button class="iv-clear-btn" style="margin-top:12px" onclick="ivClearAll()">Reset Filters</button>
    </div>
  </div>`;

  ivRender();
}

// ─── FILTER SETTERS ───────────────────────────────────────────────────────────
function ivSetLevel(l) {
  ivFilter.level = l;
  document.querySelectorAll('#iv-level-pills .iv-pill').forEach(b => {
    b.classList.toggle('active', b.textContent === l);
  });
  ivRender();
}
function ivSetTopic(t) {
  ivFilter.topic = t;
  ivRender();
}
function ivSetSearch(s) {
  ivFilter.search = s.toLowerCase();
  ivRender();
}
function ivClearAll() {
  ivFilter = { level: 'ALL', topic: 'ALL', search: '' };
  document.querySelectorAll('#iv-level-pills .iv-pill').forEach(b => b.classList.toggle('active', b.textContent === 'ALL'));
  const sel = document.getElementById('iv-topic-select');
  if (sel) sel.value = 'ALL';
  const src = document.getElementById('iv-search');
  if (src) src.value = '';
  ivRender();
}

// ─── RENDER ───────────────────────────────────────────────────────────────────
function ivRender() {
  const filtered = INTERVIEW_DATA.filter(q => {
    if (ivFilter.level !== 'ALL' && q.level !== ivFilter.level) return false;
    if (ivFilter.topic !== 'ALL' && q.topic !== ivFilter.topic) return false;
    if (ivFilter.search) {
      const hay = (q.q + ' ' + q.a + ' ' + q.topic + ' ' + (q.keypoints||'')).toLowerCase();
      if (!hay.includes(ivFilter.search)) return false;
    }
    return true;
  });

  // Stats
  const totalScenarios = INTERVIEW_DATA.filter(q => q.scenario).length;
  const shownScenarios = filtered.filter(q => q.scenario).length;
  const el = id => document.getElementById(id);
  if (el('iv-stat-total'))    el('iv-stat-total').textContent    = INTERVIEW_DATA.length;
  if (el('iv-stat-shown'))    el('iv-stat-shown').textContent    = filtered.length;
  if (el('iv-stat-reviewed')) el('iv-stat-reviewed').textContent = ivReviewed.size;
  if (el('iv-stat-scenarios'))el('iv-stat-scenarios').textContent = shownScenarios;

  const list  = el('iv-question-list');
  const empty = el('iv-empty-state');
  if (!list) return;

  if (filtered.length === 0) {
    list.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';

  list.innerHTML = filtered.map(q => ivCardHTML(q)).join('');
}

// ─── CARD HTML ────────────────────────────────────────────────────────────────
function ivCardHTML(q) {
  const open    = ivExpanded.has(q.id);
  const reviewed = ivReviewed.has(q.id);
  const lvlColor = { CCNA:'var(--green)', CCNP:'var(--blue)', CCIE:'var(--pink)' }[q.level] || 'var(--muted)';
  const lvlBg   = { CCNA:'rgba(74,222,128,0.1)', CCNP:'rgba(91,156,246,0.1)', CCIE:'rgba(244,114,182,0.1)' }[q.level] || '';

  return `
  <div class="iv-card ${open?'iv-card-open':''} ${reviewed?'iv-card-reviewed':''}" id="iv-card-${q.id}">
    <div class="iv-card-header" onclick="ivToggle(${q.id})">
      <div class="iv-card-meta">
        <span class="iv-level-badge" style="color:${lvlColor};background:${lvlBg}">${q.level}</span>
        <span class="iv-topic-tag">${q.topic}</span>
        ${q.scenario ? `<span class="iv-scenario-badge">📌 Scenario</span>` : ''}
        ${reviewed ? `<span class="iv-reviewed-badge">✓ Reviewed</span>` : ''}
      </div>
      <div class="iv-card-q">${q.q}</div>
      <div class="iv-chevron">${open ? '▲' : '▼'}</div>
    </div>
    ${open ? `
    <div class="iv-card-body">
      <div class="iv-answer-label">✅ Answer</div>
      <div class="iv-answer">${q.a}</div>
      ${q.cli ? `
      <div class="iv-cli-block">
        <div class="iv-cli-header">
          <span>CLI Reference</span>
          <button class="iv-copy-btn" onclick="ivCopy(${q.id})">⎘ Copy</button>
        </div>
        <pre class="iv-cli-pre" id="iv-cli-${q.id}">${escHtml(q.cli)}</pre>
      </div>` : ''}
      ${q.keypoints ? `
      <div class="iv-keypoints">
        <span class="iv-kp-label">💡 Key Points:</span> ${escHtml(q.keypoints)}
      </div>` : ''}
      <div class="iv-card-actions">
        <button class="iv-action-btn ${reviewed?'iv-action-active':''}" onclick="ivMarkReviewed(${q.id})">
          ${reviewed ? '✓ Reviewed' : '☐ Mark Reviewed'}
        </button>
        <button class="iv-action-btn" onclick="ivCollapse(${q.id})">▲ Collapse</button>
      </div>
    </div>` : ''}
  </div>`;
}

function escHtml(s) {
  return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ─── CARD ACTIONS ─────────────────────────────────────────────────────────────
function ivToggle(id) {
  if (ivExpanded.has(id)) { ivExpanded.delete(id); }
  else { ivExpanded.add(id); }
  ivReRenderCard(id);
}
function ivCollapse(id) {
  ivExpanded.delete(id);
  ivReRenderCard(id);
}
function ivMarkReviewed(id) {
  if (ivReviewed.has(id)) { ivReviewed.delete(id); }
  else { ivReviewed.add(id); }
  ivReRenderCard(id);
  // Update stats
  const el = document.getElementById('iv-stat-reviewed');
  if (el) el.textContent = ivReviewed.size;
}
function ivReRenderCard(id) {
  const q   = INTERVIEW_DATA.find(x => x.id === id);
  if (!q) return;
  const card = document.getElementById('iv-card-' + id);
  if (!card) return;
  card.outerHTML = ivCardHTML(q);
}
function ivCopy(id) {
  const q = INTERVIEW_DATA.find(x => x.id === id);
  if (!q || !q.cli) return;
  navigator.clipboard.writeText(q.cli).then(() => {
    const btn = document.querySelector(`#iv-card-${id} .iv-copy-btn`);
    if (btn) { btn.textContent = '✓ Copied!'; setTimeout(() => { btn.textContent = '⎘ Copy'; }, 1800); }
  });
}

// ─── STYLES (injected once) ───────────────────────────────────────────────────
(function injectIVStyles() {
  if (document.getElementById('iv-styles')) return;
  const s = document.createElement('style');
  s.id = 'iv-styles';
  s.textContent = `
  .iv-wrap { max-width: 900px; }

  /* Stats bar */
  .iv-stats-bar {
    display: flex; gap: 12px; margin-bottom: 20px;
    background: var(--bg1); border: 1px solid var(--border); border-radius: 10px;
    padding: 12px 20px;
  }
  .iv-stat {
    display: flex; flex-direction: column; align-items: center; gap: 2px;
    min-width: 60px;
  }
  .iv-stat span {
    font-family: var(--mono); font-size: 20px; font-weight: 700;
    color: var(--blue); line-height: 1;
  }
  .iv-stat em {
    font-style: normal; font-family: var(--mono); font-size: 9px;
    color: var(--muted); text-transform: uppercase; letter-spacing: 0.8px;
  }

  /* Filters */
  .iv-filters {
    display: flex; flex-wrap: wrap; gap: 14px; align-items: flex-end;
    margin-bottom: 20px; padding: 14px 16px;
    background: var(--bg1); border: 1px solid var(--border); border-radius: 10px;
  }
  .iv-filter-group { display: flex; flex-direction: column; gap: 5px; }
  .iv-filter-label {
    font-family: var(--mono); font-size: 9px; color: var(--muted);
    text-transform: uppercase; letter-spacing: 1px;
  }
  .iv-filter-pills { display: flex; gap: 5px; flex-wrap: wrap; }
  .iv-pill {
    padding: 5px 12px; border-radius: 6px; border: 1px solid var(--border2);
    background: var(--bg2); font-family: var(--mono); font-size: 11px; font-weight: 700;
    color: var(--muted2); cursor: pointer; transition: all 0.15s;
  }
  .iv-pill:hover { background: var(--bg3); color: var(--text); }
  .iv-pill.active { border-color: var(--blue); background: rgba(91,156,246,0.15); color: var(--blue); }
  .iv-level-CCNA.active { border-color: var(--green); background: rgba(74,222,128,0.12); color: var(--green); }
  .iv-level-CCNP.active { border-color: var(--blue); background: rgba(91,156,246,0.12); color: var(--blue); }
  .iv-level-CCIE.active { border-color: var(--pink); background: rgba(244,114,182,0.12); color: var(--pink); }

  .iv-select {
    padding: 6px 10px; background: var(--bg2); border: 1px solid var(--border2);
    border-radius: 7px; color: var(--text); font-family: var(--mono); font-size: 12px;
    cursor: pointer; min-width: 160px;
  }
  .iv-search-input {
    padding: 6px 12px; background: var(--bg2); border: 1px solid var(--border2);
    border-radius: 7px; color: var(--text); font-family: var(--sans); font-size: 13px;
    min-width: 200px; flex: 1; outline: none;
    transition: border-color 0.15s;
  }
  .iv-search-input:focus { border-color: var(--blue); }

  .iv-clear-btn {
    padding: 7px 14px; background: var(--bg3); border: 1px solid var(--border2);
    border-radius: 7px; color: var(--muted2); font-family: var(--mono); font-size: 11px;
    cursor: pointer; transition: all 0.15s;
  }
  .iv-clear-btn:hover { background: var(--bg1); color: var(--text); }

  /* Cards */
  .iv-card {
    background: var(--bg1); border: 1px solid var(--border);
    border-radius: 10px; margin-bottom: 10px;
    transition: border-color 0.15s, box-shadow 0.15s;
    overflow: hidden;
  }
  .iv-card:hover { border-color: var(--border2); }
  .iv-card-open { border-color: rgba(91,156,246,0.4); box-shadow: 0 0 0 1px rgba(91,156,246,0.15); }
  .iv-card-reviewed { opacity: 0.72; }
  .iv-card-reviewed .iv-card-header { background: rgba(74,222,128,0.04); }

  .iv-card-header {
    display: flex; align-items: flex-start; gap: 12px;
    padding: 14px 16px; cursor: pointer; user-select: none;
    transition: background 0.12s;
  }
  .iv-card-header:hover { background: var(--bg2); }

  .iv-card-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; flex-shrink: 0; }

  .iv-level-badge {
    font-family: var(--mono); font-size: 9px; font-weight: 700;
    padding: 2px 7px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px;
    border: 1px solid currentColor;
  }
  .iv-topic-tag {
    font-family: var(--mono); font-size: 9px; color: var(--muted);
    background: var(--bg3); padding: 2px 7px; border-radius: 4px;
    white-space: nowrap;
  }
  .iv-scenario-badge {
    font-family: var(--mono); font-size: 9px; color: var(--amber);
    background: rgba(251,191,36,0.1); border: 1px solid rgba(251,191,36,0.3);
    padding: 2px 7px; border-radius: 4px;
  }
  .iv-reviewed-badge {
    font-family: var(--mono); font-size: 9px; color: var(--green);
    background: rgba(74,222,128,0.1); padding: 2px 7px; border-radius: 4px;
  }
  .iv-card-q {
    flex: 1; font-size: 13px; font-weight: 600; color: var(--text);
    line-height: 1.45;
  }
  .iv-chevron {
    font-size: 10px; color: var(--muted); flex-shrink: 0; margin-top: 2px;
  }

  /* Card body */
  .iv-card-body {
    padding: 0 16px 16px; border-top: 1px solid var(--border);
  }
  .iv-answer-label {
    font-family: var(--mono); font-size: 10px; font-weight: 700;
    color: var(--green); text-transform: uppercase; letter-spacing: 1px;
    padding: 10px 0 6px;
  }
  .iv-answer {
    font-size: 13px; color: var(--text); line-height: 1.7;
  }
  .iv-answer strong { color: var(--blue); }
  .iv-answer em { color: var(--cyan); font-style: normal; }
  .iv-answer code {
    font-family: var(--mono); font-size: 11px; background: var(--bg3);
    padding: 1px 5px; border-radius: 3px; color: var(--amber);
  }

  /* CLI block */
  .iv-cli-block {
    margin-top: 14px; border-radius: 8px; overflow: hidden;
    border: 1px solid var(--border2);
  }
  .iv-cli-header {
    display: flex; justify-content: space-between; align-items: center;
    padding: 7px 14px; background: rgba(30,36,56,0.8);
    font-family: var(--mono); font-size: 10px; color: var(--muted);
    text-transform: uppercase; letter-spacing: 0.8px;
  }
  .iv-copy-btn {
    font-family: var(--mono); font-size: 10px; padding: 3px 10px;
    background: rgba(91,156,246,0.12); border: 1px solid rgba(91,156,246,0.3);
    color: var(--blue); border-radius: 4px; cursor: pointer; transition: all 0.15s;
  }
  .iv-copy-btn:hover { background: rgba(91,156,246,0.25); }
  .iv-cli-pre {
    margin: 0; padding: 14px; background: var(--bg0, #050709);
    font-family: var(--mono); font-size: 11.5px; color: var(--cyan);
    overflow-x: auto; line-height: 1.65;
    white-space: pre;
  }

  /* Key points */
  .iv-keypoints {
    margin-top: 12px; padding: 10px 14px;
    background: rgba(56,217,192,0.06); border: 1px solid rgba(56,217,192,0.2);
    border-radius: 7px; font-size: 12px; line-height: 1.55; color: var(--muted2);
  }
  .iv-kp-label { font-weight: 700; color: var(--cyan); font-family: var(--mono); font-size: 11px; }

  /* Actions */
  .iv-card-actions {
    display: flex; gap: 8px; margin-top: 14px; justify-content: flex-end;
  }
  .iv-action-btn {
    padding: 6px 14px; background: var(--bg2); border: 1px solid var(--border2);
    border-radius: 6px; font-family: var(--mono); font-size: 11px; color: var(--muted2);
    cursor: pointer; transition: all 0.15s;
  }
  .iv-action-btn:hover { background: var(--bg3); color: var(--text); }
  .iv-action-active { background: rgba(74,222,128,0.12) !important; color: var(--green) !important; border-color: rgba(74,222,128,0.3) !important; }

  /* Empty state */
  .iv-empty {
    text-align: center; padding: 48px 24px; color: var(--muted);
  }

  @media (max-width: 600px) {
    .iv-filters { flex-direction: column; }
    .iv-search-input { min-width: 100%; }
    .iv-stats-bar { flex-wrap: wrap; }
  }
  `;
  document.head.appendChild(s);
})();

