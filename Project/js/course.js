/**
 * course.js — Courses HTML content for SubnetLab Pro
 * Contains: CCNA Course, CCNP Course, CCIE Course, Interview Prep
 * Extracted from index.html for maintainability.
 * Linked via: <script src="Project/js/course.js"></script>
 */

(function () {

  /* ─── CCNA ─────────────────────────────────────────────────────── */
  const ccnaHTML = `
<!-- ══════ PAGE: CCNA ══════ -->
<div class="page fade-up" id="page-ccna">
  <div class="page-header" style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:10px">
    <div>
      <div class="page-title">📘 CCNA Course</div>
      <div class="page-desc">Cisco Certified Network Associate — CCIE-depth packet analysis, real Wireshark captures, EVE-NG labs, 30-min deep dives per topic</div>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px">
      <span style="font-family:var(--mono);font-size:10px;padding:5px 12px;border-radius:20px;background:rgba(91,156,246,0.15);border:1px solid rgba(91,156,246,0.3);color:var(--blue)">16 Modules</span>
      <span style="font-family:var(--mono);font-size:10px;padding:5px 12px;border-radius:20px;background:rgba(74,222,128,0.12);border:1px solid rgba(74,222,128,0.3);color:var(--green)">~8 Hours</span>
    </div>
  </div>

  <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:18px;padding:4px;background:var(--bg2);border-radius:12px;border:1px solid var(--border)">
    <button class="course-tab active" id="ccna-tab-0" onclick="showTopic('ccna',0)">🧱 OSI &amp; TCP/IP</button>
    <button class="course-tab" id="ccna-tab-1" onclick="showTopic('ccna',1)">🔗 Ethernet &amp; ARP</button>
    <button class="course-tab" id="ccna-tab-2" onclick="showTopic('ccna',2)">🔀 Switching &amp; STP</button>
    <button class="course-tab" id="ccna-tab-3" onclick="showTopic('ccna',3)">🗺️ IP Routing</button>
    <button class="course-tab" id="ccna-tab-4" onclick="showTopic('ccna',4)">🔌 TCP &amp; UDP</button>
    <button class="course-tab" id="ccna-tab-5" onclick="showTopic('ccna',5)">🌐 DHCP &amp; DNS</button>
    <button class="course-tab" id="ccna-tab-6" onclick="showTopic('ccna',6)">🏷️ ACLs &amp; Filtering</button>
    <button class="course-tab" id="ccna-tab-7" onclick="showTopic('ccna',7)">🔁 OSPF</button>
    <button class="course-tab" id="ccna-tab-8" onclick="showTopic('ccna',8)">🔄 NAT &amp; PAT</button>
    <button class="course-tab" id="ccna-tab-9" onclick="showTopic('ccna',9)">📡 Wireless LAN</button>
    <button class="course-tab" id="ccna-tab-10" onclick="showTopic('ccna',10)">🔃 HSRP/VRRP/GLBP</button>
    <button class="course-tab" id="ccna-tab-11" onclick="showTopic('ccna',11)">🔒 Network Security</button>
    <button class="course-tab" id="ccna-tab-12" onclick="showTopic('ccna',12)">⛓️ EtherChannel</button>
    <button class="course-tab" id="ccna-tab-13" onclick="showTopic('ccna',13)">⚡ EIGRP</button>
    <button class="course-tab" id="ccna-tab-14" onclick="showTopic('ccna',14)">🌍 IPv6</button>
    <button class="course-tab" id="ccna-tab-15" onclick="showTopic('ccna',15)">🌐 WAN &amp; Distance Vector</button>
  </div>
<!-- ═══ CCNA TAB 0: OSI & TCP/IP — 30-MINUTE DEEP DIVE ═══ -->
<div id="ccna-topic-0" class="topic-panel active-panel">
  <div class="topic-hero" style="border-left:4px solid var(--blue)">
    <div class="topic-title">🧱 OSI Model &amp; TCP/IP — Every Layer, Every Header, Every Bit</div>
    <div class="topic-sub">Packet encapsulation from application to wire · PDU names · protocol mapping · real Wireshark field values · CCIE-level interview traps</div>
  </div>

  <!-- Part 1: The 7-layer model with full detail -->
  <div class="card">
    <div class="card-hdr">OSI 7-Layer Model — Complete Reference with Protocols, PDUs &amp; Real Examples</div>
    <div class="callout callout-info" style="margin-bottom:12px">💡 The OSI model was created by ISO in 1984. Real networks use TCP/IP stack, but OSI is the <strong>language of troubleshooting</strong>. Every vendor, every exam, every NOC uses "Layer 2 issue" or "Layer 3 problem" — this is why you must know it cold.</div>
    <div class="tbl-wrap"><table class="tbl">
      <tr>
        <th style="width:40px">#</th>
        <th>Layer Name</th>
        <th>PDU Name</th>
        <th>Key Protocols</th>
        <th>Addressing</th>
        <th>Devices</th>
        <th>Real-World Job</th>
      </tr>
      <tr>
        <td style="color:var(--red);font-weight:700;font-size:13px">7</td>
        <td style="color:var(--red)">Application</td>
        <td style="font-family:var(--mono);color:var(--red)">Data</td>
        <td>HTTP/S, DNS, FTP, SMTP, SSH, Telnet, SNMP, NTP, DHCP</td>
        <td>URL / hostname</td>
        <td>Hosts, servers</td>
        <td>User-facing data exchange. WHERE the data is born and consumed.</td>
      </tr>
      <tr>
        <td style="color:var(--red);font-weight:700">6</td>
        <td style="color:var(--red)">Presentation</td>
        <td style="font-family:var(--mono);color:var(--red)">Data</td>
        <td>TLS/SSL, JPEG, MPEG, ASCII, EBCDIC, XDR</td>
        <td>—</td>
        <td>Hosts</td>
        <td>Translate, encrypt, compress data. TLS lives HERE — not in Application.</td>
      </tr>
      <tr>
        <td style="color:var(--red);font-weight:700">5</td>
        <td style="color:var(--red)">Session</td>
        <td style="font-family:var(--mono);color:var(--red)">Data</td>
        <td>NetBIOS, RPC, PPTP, SQL sessions, NFS</td>
        <td>Session ID</td>
        <td>Hosts</td>
        <td>Open / maintain / close sessions. Half-duplex vs full-duplex control.</td>
      </tr>
      <tr>
        <td style="color:var(--amber);font-weight:700">4</td>
        <td style="color:var(--amber)">Transport</td>
        <td style="font-family:var(--mono);color:var(--amber)">Segment (TCP) / Datagram (UDP)</td>
        <td>TCP (reliable), UDP (fast), SCTP</td>
        <td>Port number (16-bit: 0-65535)</td>
        <td>Hosts, firewalls</td>
        <td>End-to-end delivery. Multiplexing apps via ports. Reliability (TCP) or speed (UDP).</td>
      </tr>
      <tr>
        <td style="color:var(--blue);font-weight:700">3</td>
        <td style="color:var(--blue)">Network</td>
        <td style="font-family:var(--mono);color:var(--blue)">Packet</td>
        <td>IP (v4/v6), ICMP, IGMP, OSPF, BGP, EIGRP, IS-IS</td>
        <td>IP address (32-bit IPv4 / 128-bit IPv6)</td>
        <td>Routers, L3 switches</td>
        <td>Logical addressing + path selection (routing). INTER-network delivery.</td>
      </tr>
      <tr>
        <td style="color:var(--cyan);font-weight:700">2</td>
        <td style="color:var(--cyan)">Data Link</td>
        <td style="font-family:var(--mono);color:var(--cyan)">Frame</td>
        <td>Ethernet, Wi-Fi (802.11), PPP, HDLC, Frame-Relay, ARP, STP</td>
        <td>MAC address (48-bit)</td>
        <td>Switches, bridges, NICs, APs</td>
        <td>INTRA-network delivery. MAC addressing. Frame delimiting. CRC error detection.</td>
      </tr>
      <tr>
        <td style="color:var(--green);font-weight:700">1</td>
        <td style="color:var(--green)">Physical</td>
        <td style="font-family:var(--mono);color:var(--green)">Bits</td>
        <td>Ethernet (cable spec), Wi-Fi (RF), RS-232, USB, Fiber (SONET/SDH)</td>
        <td>No addressing (raw bits)</td>
        <td>Hubs, repeaters, cables, fiber, NICs (PHY chip)</td>
        <td>Bits to signal conversion. Voltage levels, timing, connectors, wavelengths.</td>
      </tr>
    </table></div>
    <div class="callout callout-warn" style="margin-top:12px">⚠️ <strong>CCIE Trap:</strong> ARP operates at Layer 2 (MAC addresses in payload) but resolves Layer 3 (IP) addresses. It's typically classified as a Layer 2/2.5 protocol. Interviewers LOVE this question. Also: OSPF is a Layer 3 protocol that runs DIRECTLY over IP (protocol number 89) — not over TCP or UDP.</div>
  </div>

  <!-- Part 2: Encapsulation deep dive with real byte counts -->
  <div class="grid-2" style="margin-top:14px">
    <div>
      <div class="card">
        <div class="card-hdr">Encapsulation — What Happens to Data at Each Layer</div>
        <div class="callout callout-info" style="margin-bottom:12px">Imagine you're sending "Hello" (5 bytes) via HTTP over Ethernet. By the time it leaves the NIC as bits, it's carrying 68+ bytes of headers. This is what Wireshark shows you — headers wrapping headers wrapping your data.</div>
        <svg viewBox="0 0 430 290" width="100%" style="display:block">
          <rect x="0" y="0" width="430" height="290" rx="8" fill="#0d1117" stroke="rgba(91,156,246,0.15)" stroke-width="1"/>
          <text x="12" y="15" font-family="IBM Plex Mono,monospace" font-size="8" fill="rgba(91,156,246,0.4)">ENCAPSULATION — TOP TO BOTTOM</text>
          <!-- L7 Application -->
          <rect x="10" y="22" width="410" height="32" rx="5" fill="rgba(248,113,113,0.12)" stroke="rgba(248,113,113,0.4)" stroke-width="1"/>
          <text x="16" y="36" font-family="IBM Plex Mono,monospace" font-size="9" font-weight="700" fill="#f87171">L7 APPLICATION</text>
          <text x="16" y="48" font-family="IBM Plex Mono,monospace" font-size="8.5" fill="rgba(248,113,113,0.7)">HTTP GET /index.html HTTP/1.1\\r\\nHost: example.com\\r\\n  ← your "data"</text>
          <!-- L4 TCP Segment -->
          <rect x="10" y="60" width="410" height="36" rx="5" fill="rgba(251,191,36,0.1)" stroke="rgba(251,191,36,0.4)" stroke-width="1"/>
          <text x="16" y="74" font-family="IBM Plex Mono,monospace" font-size="9" font-weight="700" fill="#fbbf24">L4 TRANSPORT — TCP HEADER (20 bytes min)</text>
          <text x="16" y="88" font-family="IBM Plex Mono,monospace" font-size="8" fill="rgba(251,191,36,0.7)">[ SrcPort:52431 | DstPort:80 | Seq:1001 | Ack:501 | Flags:PSH,ACK | Win:64240 | Checksum | ] + HTTP Data</text>
          <!-- L3 IP Packet -->
          <rect x="10" y="102" width="410" height="36" rx="5" fill="rgba(91,156,246,0.1)" stroke="rgba(91,156,246,0.4)" stroke-width="1"/>
          <text x="16" y="116" font-family="IBM Plex Mono,monospace" font-size="9" font-weight="700" fill="#5b9cf6">L3 NETWORK — IP HEADER (20 bytes min)</text>
          <text x="16" y="130" font-family="IBM Plex Mono,monospace" font-size="8" fill="rgba(91,156,246,0.7)">[ Ver:4 | IHL:5 | TOS:0 | TotLen | ID | Flags | FragOff | TTL:64 | Proto:6(TCP) | Chk | SrcIP | DstIP ] + TCP Seg</text>
          <!-- L2 Ethernet Frame -->
          <rect x="10" y="144" width="410" height="36" rx="5" fill="rgba(56,217,192,0.1)" stroke="rgba(56,217,192,0.4)" stroke-width="1"/>
          <text x="16" y="158" font-family="IBM Plex Mono,monospace" font-size="9" font-weight="700" fill="#38d9c0">L2 DATA LINK — ETHERNET FRAME</text>
          <text x="16" y="172" font-family="IBM Plex Mono,monospace" font-size="8" fill="rgba(56,217,192,0.7)">[ Preamble(7B)+SFD(1B) | DstMAC(6B) | SrcMAC(6B) | EtherType(2B):0x0800 | IP Packet | FCS(4B) ]</text>
          <!-- L1 Bits -->
          <rect x="10" y="186" width="410" height="26" rx="5" fill="rgba(74,222,128,0.08)" stroke="rgba(74,222,128,0.3)" stroke-width="1"/>
          <text x="16" y="200" font-family="IBM Plex Mono,monospace" font-size="9" font-weight="700" fill="#4ade80">L1 PHYSICAL — BITS (Manchester/NRZ/PAM4 encoding on copper/fiber)</text>
          <text x="16" y="210" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(74,222,128,0.5)">01000101 00000000 00000000 ... (every 0 and 1 transmitted as voltage or light pulse)</text>
          <!-- Byte count breakdown -->
          <rect x="10" y="220" width="410" height="62" rx="5" fill="rgba(0,0,0,0.4)" stroke="rgba(255,255,255,0.05)"/>
          <text x="16" y="234" font-family="IBM Plex Mono,monospace" font-size="8.5" fill="#a78bfa">BYTE COUNT for "Hello" (5 bytes payload):</text>
          <text x="16" y="248" font-family="IBM Plex Mono,monospace" font-size="8" fill="rgba(140,150,180,0.7)">  Preamble+SFD: 8B  |  Eth header: 14B  |  IP header: 20B  |  TCP header: 20B  |  Data: 5B  |  FCS: 4B</text>
          <text x="16" y="261" font-family="IBM Plex Mono,monospace" font-size="8" fill="rgba(140,150,180,0.7)">  Total on wire: 71 bytes  =  568 bits   (94% overhead for 5-byte payload!)</text>
          <text x="16" y="275" font-family="IBM Plex Mono,monospace" font-size="8" fill="rgba(74,222,128,0.6)">  This is WHY large file transfers are efficient (1460B data / 1514B frame = 96.4% useful)</text>
        </svg>
      </div>
    </div>
    <div>
      <div class="card">
        <div class="card-hdr">TCP/IP 4-Layer vs OSI 7-Layer Mapping</div>
        <svg viewBox="0 0 390 200" width="100%" style="display:block">
          <rect x="0" y="0" width="390" height="200" rx="8" fill="#0d1117" stroke="rgba(140,150,180,0.1)"/>
          <!-- OSI left -->
          <text x="85" y="16" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="10" font-weight="700" fill="rgba(140,150,180,0.7)">OSI MODEL</text>
          <rect x="10" y="22" width="150" height="23" rx="4" fill="rgba(248,113,113,0.12)" stroke="rgba(248,113,113,0.3)" stroke-width="1"/>
          <text x="85" y="37" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9" fill="#f87171">7 Application</text>
          <rect x="10" y="48" width="150" height="23" rx="4" fill="rgba(248,113,113,0.1)" stroke="rgba(248,113,113,0.25)" stroke-width="1"/>
          <text x="85" y="63" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9" fill="#f87171">6 Presentation</text>
          <rect x="10" y="74" width="150" height="23" rx="4" fill="rgba(248,113,113,0.08)" stroke="rgba(248,113,113,0.2)" stroke-width="1"/>
          <text x="85" y="89" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9" fill="#f87171">5 Session</text>
          <rect x="10" y="100" width="150" height="23" rx="4" fill="rgba(251,191,36,0.12)" stroke="rgba(251,191,36,0.35)" stroke-width="1"/>
          <text x="85" y="115" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9" fill="#fbbf24">4 Transport</text>
          <rect x="10" y="126" width="150" height="23" rx="4" fill="rgba(91,156,246,0.12)" stroke="rgba(91,156,246,0.35)" stroke-width="1"/>
          <text x="85" y="141" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9" fill="#5b9cf6">3 Network</text>
          <rect x="10" y="152" width="150" height="23" rx="4" fill="rgba(56,217,192,0.12)" stroke="rgba(56,217,192,0.35)" stroke-width="1"/>
          <text x="85" y="167" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9" fill="#38d9c0">2 Data Link</text>
          <rect x="10" y="178" width="150" height="18" rx="4" fill="rgba(74,222,128,0.12)" stroke="rgba(74,222,128,0.3)" stroke-width="1"/>
          <text x="85" y="190" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9" fill="#4ade80">1 Physical</text>
          <!-- TCP/IP right -->
          <text x="305" y="16" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="10" font-weight="700" fill="rgba(140,150,180,0.7)">TCP/IP MODEL</text>
          <rect x="230" y="22" width="150" height="75" rx="4" fill="rgba(248,113,113,0.1)" stroke="rgba(248,113,113,0.35)" stroke-width="1.5"/>
          <text x="305" y="60" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="700" fill="#f87171">Application</text>
          <text x="305" y="76" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="rgba(248,113,113,0.5)">(OSI 5+6+7)</text>
          <rect x="230" y="100" width="150" height="23" rx="4" fill="rgba(251,191,36,0.12)" stroke="rgba(251,191,36,0.4)" stroke-width="1.5"/>
          <text x="305" y="115" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="700" fill="#fbbf24">Transport</text>
          <rect x="230" y="126" width="150" height="23" rx="4" fill="rgba(91,156,246,0.12)" stroke="rgba(91,156,246,0.4)" stroke-width="1.5"/>
          <text x="305" y="141" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="700" fill="#5b9cf6">Internet</text>
          <rect x="230" y="152" width="150" height="44" rx="4" fill="rgba(56,217,192,0.1)" stroke="rgba(56,217,192,0.4)" stroke-width="1.5"/>
          <text x="305" y="177" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="700" fill="#38d9c0">Network Access</text>
          <text x="305" y="190" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="rgba(56,217,192,0.5)">(OSI 1+2)</text>
          <!-- Arrows -->
          <line x1="160" y1="58" x2="230" y2="58" stroke="rgba(248,113,113,0.3)" stroke-width="1" stroke-dasharray="4 2"/>
          <line x1="160" y1="111" x2="230" y2="111" stroke="rgba(251,191,36,0.3)" stroke-width="1" stroke-dasharray="4 2"/>
          <line x1="160" y1="137" x2="230" y2="137" stroke="rgba(91,156,246,0.3)" stroke-width="1" stroke-dasharray="4 2"/>
          <line x1="160" y1="165" x2="230" y2="165" stroke="rgba(56,217,192,0.3)" stroke-width="1" stroke-dasharray="4 2"/>
        </svg>
        <div class="card-hdr" style="margin-top:14px;margin-bottom:8px">Protocol Numbers You Must Know</div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>IP Protocol #</th><th>Protocol</th><th>Port(s)</th><th>Transport</th></tr>
          <tr><td style="color:var(--amber);font-weight:700">6</td><td>TCP</td><td>80,443,22,23,25,21,53</td><td>—</td></tr>
          <tr><td style="color:var(--amber);font-weight:700">17</td><td>UDP</td><td>53,67,68,69,123,161,514</td><td>—</td></tr>
          <tr><td style="color:var(--blue)">1</td><td>ICMP</td><td>—</td><td>Directly over IP</td></tr>
          <tr><td style="color:var(--blue)">89</td><td>OSPF</td><td>—</td><td>Directly over IP</td></tr>
          <tr><td style="color:var(--blue)">88</td><td>EIGRP</td><td>—</td><td>Directly over IP</td></tr>
          <tr><td style="color:var(--cyan)">47</td><td>GRE</td><td>—</td><td>Directly over IP</td></tr>
          <tr><td style="color:var(--cyan)">50</td><td>ESP (IPSec)</td><td>—</td><td>Directly over IP</td></tr>
          <tr><td style="color:var(--cyan)">51</td><td>AH (IPSec)</td><td>—</td><td>Directly over IP</td></tr>
          <tr><td style="color:var(--green)">58</td><td>ICMPv6</td><td>—</td><td>Directly over IPv6</td></tr>
        </table></div>
      </div>
    </div>
  </div>

  <!-- Part 3: IPv4 Header - every single field -->
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">IPv4 Header — Every Field Explained (20 bytes minimum, 60 bytes maximum)</div>
    <div class="callout callout-info" style="margin-bottom:12px">This is the most important diagram in all of networking. The IPv4 header has 13 fields. Each CCIE candidate must know what every field does, its size in bits, and what goes wrong when it's misconfigured.</div>
    <svg viewBox="0 0 700 200" width="100%" style="display:block">
      <rect x="0" y="0" width="700" height="200" rx="8" fill="#0d1117" stroke="rgba(91,156,246,0.2)" stroke-width="1"/>
      <text x="10" y="14" font-family="IBM Plex Mono,monospace" font-size="8" fill="rgba(91,156,246,0.5)">IPv4 HEADER — RFC 791 — 32-bit (4-byte) words, minimum 5 words = 20 bytes</text>
      <!-- Row 1: Ver, IHL, DSCP, ECN, Total Length -->
      <rect x="10" y="20" width="50" height="35" rx="3" fill="rgba(91,156,246,0.12)" stroke="rgba(91,156,246,0.4)" stroke-width="1"/>
      <text x="35" y="33" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#5b9cf6">Version</text>
      <text x="35" y="45" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(91,156,246,0.5)">4 bits</text>
      <text x="35" y="55" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(91,156,246,0.4)">4=IPv4</text>
      <rect x="63" y="20" width="50" height="35" rx="3" fill="rgba(91,156,246,0.12)" stroke="rgba(91,156,246,0.4)" stroke-width="1"/>
      <text x="88" y="33" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#5b9cf6">IHL</text>
      <text x="88" y="45" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(91,156,246,0.5)">4 bits</text>
      <text x="88" y="55" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(91,156,246,0.4)">5=20B</text>
      <rect x="116" y="20" width="70" height="35" rx="3" fill="rgba(56,217,192,0.1)" stroke="rgba(56,217,192,0.35)" stroke-width="1"/>
      <text x="151" y="33" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#38d9c0">DSCP</text>
      <text x="151" y="45" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(56,217,192,0.5)">6 bits</text>
      <text x="151" y="55" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(56,217,192,0.4)">QoS mark</text>
      <rect x="189" y="20" width="35" height="35" rx="3" fill="rgba(56,217,192,0.08)" stroke="rgba(56,217,192,0.25)" stroke-width="1"/>
      <text x="206" y="33" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="#38d9c0">ECN</text>
      <text x="206" y="45" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(56,217,192,0.5)">2 bits</text>
      <rect x="227" y="20" width="100" height="35" rx="3" fill="rgba(251,191,36,0.12)" stroke="rgba(251,191,36,0.4)" stroke-width="1"/>
      <text x="277" y="33" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#fbbf24">Total Length</text>
      <text x="277" y="45" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(251,191,36,0.5)">16 bits</text>
      <text x="277" y="55" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(251,191,36,0.4)">Max 65535 bytes</text>
      <!-- Row 2: Identification, Flags, Fragment Offset -->
      <rect x="10" y="60" width="160" height="35" rx="3" fill="rgba(167,139,250,0.1)" stroke="rgba(167,139,250,0.35)" stroke-width="1"/>
      <text x="90" y="73" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#a78bfa">Identification (ID)</text>
      <text x="90" y="85" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(167,139,250,0.5)">16 bits — same across all fragments of one datagram</text>
      <text x="90" y="93" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(167,139,250,0.35)">Wireshark: ip.id field</text>
      <rect x="173" y="60" width="60" height="35" rx="3" fill="rgba(248,113,113,0.12)" stroke="rgba(248,113,113,0.4)" stroke-width="1"/>
      <text x="203" y="70" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#f87171">Flags</text>
      <text x="203" y="80" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(248,113,113,0.6)">3 bits:</text>
      <text x="203" y="90" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(248,113,113,0.5)">Rsvd|DF|MF</text>
      <rect x="236" y="60" width="91" height="35" rx="3" fill="rgba(248,113,113,0.1)" stroke="rgba(248,113,113,0.3)" stroke-width="1"/>
      <text x="281" y="73" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#f87171">Fragment Offset</text>
      <text x="281" y="85" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(248,113,113,0.5)">13 bits (×8 bytes)</text>
      <text x="281" y="93" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(248,113,113,0.35)">0=first frag</text>
      <!-- Row 3: TTL, Protocol, Header Checksum -->
      <rect x="10" y="100" width="70" height="35" rx="3" fill="rgba(74,222,128,0.12)" stroke="rgba(74,222,128,0.4)" stroke-width="1"/>
      <text x="45" y="113" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#4ade80">TTL</text>
      <text x="45" y="125" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(74,222,128,0.5)">8 bits</text>
      <text x="45" y="133" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(74,222,128,0.4)">Linux:64 Win:128</text>
      <rect x="83" y="100" width="80" height="35" rx="3" fill="rgba(74,222,128,0.1)" stroke="rgba(74,222,128,0.35)" stroke-width="1"/>
      <text x="123" y="113" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#4ade80">Protocol</text>
      <text x="123" y="125" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(74,222,128,0.5)">8 bits</text>
      <text x="123" y="133" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(74,222,128,0.4)">6=TCP 17=UDP 89=OSPF</text>
      <rect x="166" y="100" width="161" height="35" rx="3" fill="rgba(74,222,128,0.08)" stroke="rgba(74,222,128,0.25)" stroke-width="1"/>
      <text x="246" y="113" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#4ade80">Header Checksum</text>
      <text x="246" y="125" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(74,222,128,0.5)">16 bits — covers IP header ONLY</text>
      <text x="246" y="133" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(74,222,128,0.35)">Recalculated at every router (TTL decremented)</text>
      <!-- Row 4: Source IP -->
      <rect x="10" y="140" width="320" height="25" rx="3" fill="rgba(56,217,192,0.1)" stroke="rgba(56,217,192,0.35)" stroke-width="1"/>
      <text x="170" y="156" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#38d9c0">Source IP Address — 32 bits (4 bytes)    e.g. 192.168.1.1 → 0xC0A80101</text>
      <!-- Row 5: Dest IP -->
      <rect x="10" y="169" width="320" height="25" rx="3" fill="rgba(56,217,192,0.1)" stroke="rgba(56,217,192,0.35)" stroke-width="1"/>
      <text x="170" y="185" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#38d9c0">Destination IP Address — 32 bits (4 bytes)    e.g. 8.8.8.8 → 0x08080808</text>
      <!-- Options note -->
      <rect x="335" y="60" width="355" height="134" rx="5" fill="rgba(0,0,0,0.35)" stroke="rgba(255,255,255,0.04)"/>
      <text x="343" y="76" font-family="IBM Plex Mono,monospace" font-size="8" fill="rgba(167,139,250,0.7)">CCIE KEY FACTS:</text>
      <text x="343" y="92" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(140,150,180,0.6)">• IHL: header length in 32-bit words</text>
      <text x="343" y="106" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(140,150,180,0.6)">  IHL=5 → 5×4=20 bytes (minimum)</text>
      <text x="343" y="120" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(140,150,180,0.6)">  IHL=15 → 60 bytes (maximum with options)</text>
      <text x="343" y="134" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(248,113,113,0.7)">• DF flag=1 + route needs fragmentation</text>
      <text x="343" y="148" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(248,113,113,0.7)">  → router DROPS packet + sends ICMP Type3 Code4</text>
      <text x="343" y="162" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(248,113,113,0.5)">  "Fragmentation Needed and DF set"</text>
      <text x="343" y="177" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(74,222,128,0.6)">• TTL starts at 64 (Linux) or 128 (Windows)</text>
      <text x="343" y="191" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(74,222,128,0.6)">  Decremented by 1 at each router hop</text>
    </svg>
  </div>

  <!-- Part 4: IP Fragmentation - Full worked example -->
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">🔬 IP Fragmentation — Complete Worked Example (From Gate Smashers + RFC 791)</div>
    <div class="callout callout-info" style="margin-bottom:12px">Fragmentation happens when a packet is larger than the MTU of the next link. The router SPLITS the IP payload into fragments, each with its own IP header. <strong>Reassembly ALWAYS happens at the destination host — NEVER at intermediate routers.</strong> This is a critical point!</div>
    <div class="grid-2">
      <div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:14px;font-family:var(--mono);font-size:11px;line-height:2">
          <div style="color:var(--amber);font-weight:700;margin-bottom:8px">WORKED PROBLEM (Gate Smashers style):</div>
          <div style="color:var(--text)">Original IP datagram: <span style="color:var(--blue)">4000 bytes</span> total</div>
          <div style="color:var(--text)">  └─ IP Header: 20 bytes</div>
          <div style="color:var(--text)">  └─ Data: 3980 bytes</div>
          <div style="color:var(--muted)">Link MTU: <span style="color:var(--amber)">1500 bytes</span></div>
          <div style="color:var(--muted)">Max data per fragment: 1500 - 20 = <span style="color:var(--amber)">1480 bytes</span></div>
          <div style="color:var(--muted);margin-bottom:6px">Must be multiple of 8: <span style="color:var(--amber)">1480 ÷ 8 = 185 ✅ (already OK)</span></div>
          <div style="color:var(--cyan)">Fragment 1:</div>
          <div style="color:var(--green)">  Total = 1500B | Data = 1480B | Offset = 0 | MF = 1</div>
          <div style="color:var(--cyan)">Fragment 2:</div>
          <div style="color:var(--green)">  Total = 1500B | Data = 1480B | Offset = 1480/8 = <span style="color:var(--amber)">185</span> | MF = 1</div>
          <div style="color:var(--cyan)">Fragment 3 (last):</div>
          <div style="color:var(--green)">  Total = 1040B | Data = 1020B | Offset = 2960/8 = <span style="color:var(--amber)">370</span> | MF = <span style="color:var(--red)">0</span></div>
          <div style="color:var(--muted);margin-top:6px">ID field: SAME value in all 3 fragments</div>
          <div style="color:var(--muted)">Destination reassembles using: ID + Offset + MF flag</div>
        </div>
      </div>
      <div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>Field</th><th>Frag 1</th><th>Frag 2</th><th>Frag 3</th></tr>
          <tr><td>ID</td><td style="color:var(--cyan)">0x1234</td><td style="color:var(--cyan)">0x1234</td><td style="color:var(--cyan)">0x1234</td></tr>
          <tr><td>DF flag</td><td style="color:var(--green)">0</td><td style="color:var(--green)">0</td><td style="color:var(--green)">0</td></tr>
          <tr><td>MF flag</td><td style="color:var(--amber)">1</td><td style="color:var(--amber)">1</td><td style="color:var(--red)">0</td></tr>
          <tr><td>Offset (÷8)</td><td>0</td><td style="color:var(--amber)">185</td><td style="color:var(--amber)">370</td></tr>
          <tr><td>Data</td><td>1480B</td><td>1480B</td><td>1020B</td></tr>
          <tr><td>Total</td><td>1500B</td><td>1500B</td><td>1040B</td></tr>
        </table></div>
        <div class="callout callout-warn" style="margin-top:10px">⚠️ <strong>Path MTU Discovery (PMTUD):</strong> Modern TCP sets the DF bit=1 on all packets, then uses ICMP "Frag Needed" messages to discover the smallest MTU along the path. This avoids fragmentation entirely. If a firewall BLOCKS ICMP Type 3 Code 4, PMTUD breaks — a very common production issue called "black hole routing."</div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:6px;padding:10px;font-family:var(--mono);font-size:10.5px;line-height:1.8;margin-top:8px">
          <div style="color:var(--cyan)">! Detect MTU issues with Wireshark:</div>
          <div style="color:var(--blue)">ip.flags.df == 1 and icmp.type==3 and icmp.code==4</div>
          <div style="color:var(--cyan);margin-top:6px">! Linux: test PMTUD manually</div>
          <div style="color:var(--green)">ping -M do -s 1472 8.8.8.8  ← 1472+28=1500 byte packet with DF</div>
          <div style="color:var(--green)">tracepath 8.8.8.8           ← discovers path MTU</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Part 5: Packet walk through real network -->
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">🏗️ EVE-NG Lab — Packet Walk: PC → Internet Step by Step</div>
    <svg viewBox="0 0 700 150" width="100%" style="display:block">
      <rect x="0" y="0" width="700" height="150" rx="8" fill="#0d1117" stroke="rgba(140,150,180,0.08)"/>
      <!-- PC -->
      <rect x="10" y="50" width="60" height="50" rx="6" fill="#1a2236" stroke="rgba(56,217,192,0.5)" stroke-width="1.5"/>
      <text x="40" y="72" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#38d9c0">PC-A</text>
      <text x="40" y="83" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(56,217,192,0.4)">192.168.1.10</text>
      <text x="40" y="92" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(56,217,192,0.3)">MAC:AA:BB</text>
      <!-- SW -->
      <rect x="110" y="50" width="60" height="50" rx="6" fill="#1a2236" stroke="rgba(251,191,36,0.5)" stroke-width="1.5"/>
      <text x="140" y="72" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#fbbf24">SW-1</text>
      <text x="140" y="83" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(251,191,36,0.4)">L2 Switch</text>
      <text x="140" y="92" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(251,191,36,0.3)">MAC Table</text>
      <!-- R1 -->
      <rect x="210" y="50" width="70" height="50" rx="6" fill="#1a2236" stroke="rgba(91,156,246,0.5)" stroke-width="1.5"/>
      <text x="245" y="68" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#5b9cf6">R1 (GW)</text>
      <text x="245" y="79" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(91,156,246,0.4)">192.168.1.1</text>
      <text x="245" y="89" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(91,156,246,0.3)">MAC:CC:DD</text>
      <text x="245" y="99" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(91,156,246,0.2)">TTL decrement</text>
      <!-- ISP -->
      <rect x="320" y="50" width="60" height="50" rx="6" fill="#1a2236" stroke="rgba(167,139,250,0.4)" stroke-width="1.5"/>
      <text x="350" y="72" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#a78bfa">ISP-R</text>
      <text x="350" y="83" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(167,139,250,0.4)">200.0.0.1</text>
      <!-- Internet -->
      <rect x="420" y="50" width="60" height="50" rx="8" fill="rgba(74,222,128,0.06)" stroke="rgba(74,222,128,0.3)" stroke-width="1"/>
      <text x="450" y="78" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#4ade80">INTERNET</text>
      <!-- Server -->
      <rect x="520" y="50" width="65" height="50" rx="6" fill="#1a2236" stroke="rgba(248,113,113,0.4)" stroke-width="1.5"/>
      <text x="552" y="68" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#f87171">Server</text>
      <text x="552" y="79" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(248,113,113,0.4)">8.8.8.8</text>
      <text x="552" y="90" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(248,113,113,0.3)">Port 80</text>
      <!-- Lines -->
      <line x1="70" y1="75" x2="110" y2="75" stroke="rgba(56,217,192,0.4)" stroke-width="1.5"/>
      <line x1="170" y1="75" x2="210" y2="75" stroke="rgba(251,191,36,0.4)" stroke-width="1.5"/>
      <line x1="280" y1="75" x2="320" y2="75" stroke="rgba(91,156,246,0.4)" stroke-width="1.5"/>
      <line x1="380" y1="75" x2="420" y2="75" stroke="rgba(167,139,250,0.4)" stroke-width="1.5"/>
      <line x1="480" y1="75" x2="520" y2="75" stroke="rgba(74,222,128,0.4)" stroke-width="1.5"/>
      <!-- Step labels -->
      <text x="90" y="45" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(56,217,192,0.6)">①ARP</text>
      <text x="190" y="45" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(251,191,36,0.6)">②Frame</text>
      <text x="300" y="45" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(91,156,246,0.6)">③Route</text>
      <text x="400" y="45" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(167,139,250,0.6)">④NAT</text>
      <text x="500" y="45" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(74,222,128,0.6)">⑤TCP</text>
      <!-- Bottom detail -->
      <rect x="10" y="108" width="680" height="35" rx="4" fill="rgba(0,0,0,0.4)" stroke="rgba(255,255,255,0.03)"/>
      <text x="16" y="120" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(56,217,192,0.6)">PC-A→SW: SrcMAC=AA:BB DstMAC=CC:DD SrcIP=192.168.1.10 DstIP=8.8.8.8 TTL=64</text>
      <text x="16" y="132" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(91,156,246,0.6)">R1→ISP: L2 CHANGES (new MACs for next hop) · IP unchanged · TTL=63 · NAT: SrcIP→200.0.0.1</text>
      <text x="16" y="143" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(248,113,113,0.5)">KEY: IP addresses preserved end-to-end · MAC addresses change at EVERY hop · TTL decrements at every router</text>
    </svg>
  </div>

  <!-- Part 6: CCIE Interview Q&A -->
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">🎯 CCIE-Level Interview Q&amp;A — OSI &amp; IPv4</div>
    <div class="qa-list">
      <div class="qa-item">
        <div class="qa-q" onclick="toggleQA(this)">Q: A router receives a packet with TTL=1. What happens, step by step?<span class="qa-arrow">▶</span></div>
        <div class="qa-a">The router decrements TTL from 1 to 0. When TTL reaches 0, the router DISCARDS the packet — it does NOT forward it. Then it sends an ICMP Type 11 Code 0 (Time Exceeded) message back to the original source IP. This is exactly how <strong>traceroute</strong> works — it sends packets with incrementally increasing TTLs (1, 2, 3...) to collect the ICMP Time Exceeded responses from each hop. One critical exception: if the packet is destined FOR the router itself (e.g., a management packet), the router DOES process it even with TTL=1. TTL decrements only when FORWARDING, not when receiving packets addressed to yourself.</div>
      </div>
      <div class="qa-item">
        <div class="qa-q" onclick="toggleQA(this)">Q: What's in the IP header that changes at every hop vs. what stays the same?<span class="qa-arrow">▶</span></div>
        <div class="qa-a"><strong>Changes at every hop:</strong> TTL (decremented by 1), Header Checksum (must be recalculated because TTL changed). <strong>Stays the same:</strong> Source IP, Destination IP, Protocol, Identification, Flags, Fragment Offset, DSCP. <strong>L2 frame (always changes):</strong> Source MAC, Destination MAC — completely rewritten at every router hop. This is the fundamental difference between routing (L3, IP addresses stable) and switching (L2, MACs change at each hop). In Wireshark you can verify this by capturing on multiple interfaces along the path — IP header fields (except TTL+checksum) will be identical.</div>
      </div>
      <div class="qa-item">
        <div class="qa-q" onclick="toggleQA(this)">Q: Explain the difference between MTU, MSS, and PMTUD. When does each matter?<span class="qa-arrow">▶</span></div>
        <div class="qa-a"><strong>MTU (Maximum Transmission Unit):</strong> The maximum IP packet size a link can carry. Ethernet = 1500 bytes. This is a Layer 2/3 boundary concept. <strong>MSS (Maximum Segment Size):</strong> The maximum amount of DATA in a TCP segment — NOT including TCP or IP headers. Default MSS = MTU - IP header (20B) - TCP header (20B) = 1500-40 = <strong>1460 bytes</strong>. MSS is exchanged as a TCP option in the SYN/SYN-ACK handshake. <strong>PMTUD (Path MTU Discovery):</strong> The mechanism where a TCP sender sets DF=1 on all packets, then uses ICMP Frag-Needed messages (Type 3 Code 4) to discover the smallest MTU along the entire path, and adjusts its MSS accordingly. <strong>Classic production problem:</strong> If a firewall blocks ICMP Type 3 Code 4 messages, PMTUD fails. Large TCP connections (HTTPS, FTP, etc.) fail silently — the handshake works (small packets) but data transfers hang. Fix: TCP MSS clamping on the router — <code>ip tcp adjust-mss 1452</code></div>
      </div>
      <div class="qa-item">
        <div class="qa-q" onclick="toggleQA(this)">Q: What is the difference between unicast, multicast, broadcast, and anycast? Give IP range examples for each.<span class="qa-arrow">▶</span></div>
        <div class="qa-a"><strong>Unicast:</strong> One sender, one specific receiver. IP: any standard address (1.0.0.0-223.255.255.255 except multicast/broadcast ranges). <strong>Broadcast:</strong> One sender, ALL receivers on segment. IP: 255.255.255.255 (limited broadcast, stays on subnet) or x.x.x.255 (directed broadcast, routable). MAC: FF:FF:FF:FF:FF:FF. OSPF Hello uses 224.0.0.5, NOT broadcast. <strong>Multicast:</strong> One sender, SUBSCRIBED receivers only. IP: 224.0.0.0 - 239.255.255.255 (Class D). MAC: 01:00:5E:xx:xx:xx (lower 23 bits from IP multicast). IGMP manages group membership. <strong>Anycast:</strong> One sender, NEAREST receiver (in routing terms). Used in IPv6, DNS root servers (all 13 root server IPs are anycasted to hundreds of physical locations). A single IP is announced from multiple locations — BGP routing chooses nearest. Very common in CDN architecture — Akamai uses this extensively!</div>
      </div>
    </div>
  </div>
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">🔬 IP Header — Complete Field-by-Field Analysis</div>
    <div class="grid-2">
      <div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:14px;font-family:var(--mono);font-size:10px;line-height:2">
          <div style="color:var(--amber);font-weight:700">IPv4 HEADER (20 bytes min, 60 bytes max with options):</div>
          <div style="color:var(--cyan)">Bits 0-3:   Version (4 = IPv4, 6 = IPv6)</div>
          <div style="color:var(--cyan)">Bits 4-7:   IHL — Header Length in 32-bit words (min=5=20B)</div>
          <div style="color:var(--blue)">Bits 8-15:  DSCP/ECN — QoS marking (formerly ToS field)</div>
          <div style="color:var(--text)">Bits 16-31: Total Length — header + data (max 65535 bytes)</div>
          <div style="color:var(--amber)">Bits 32-47: Identification — fragment group ID (random)</div>
          <div style="color:var(--amber)">Bits 48-50: Flags: reserved | DF (Don't Fragment) | MF (More Fragments)</div>
          <div style="color:var(--amber)">Bits 51-63: Fragment Offset — fragment position × 8 bytes</div>
          <div style="color:var(--red)">Bits 64-71: TTL — each router decrements by 1; 0 = ICMP TTL-Exceeded + drop</div>
          <div style="color:var(--green)">Bits 72-79: Protocol — 1=ICMP 6=TCP 17=UDP 89=OSPF 47=GRE 50=ESP</div>
          <div style="color:var(--muted2)">Bits 80-95: Header Checksum — covers IP header ONLY (not data)</div>
          <div style="color:var(--blue)">Bits 96-127:  Source IP (32 bits)</div>
          <div style="color:var(--blue)">Bits 128-159: Destination IP (32 bits)</div>
        </div>
      </div>
      <div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:14px;font-family:var(--mono);font-size:10px;line-height:2">
          <div style="color:var(--red);font-weight:700">TTL DEEP DIVE:</div>
          <div style="color:var(--muted2)">Windows default: 128. Linux/macOS: 64. Cisco IOS: 255.</div>
          <div style="color:var(--muted2)">traceroute exploits TTL — sends packets with TTL=1,2,3…N</div>
          <div style="color:var(--muted2)">Each router that drops due to TTL=0 sends ICMP Type 11 back.</div>
          <div style="color:var(--muted2)">You can fingerprint the OS from the TTL in ping replies!</div>
          <div style="color:var(--blue);font-weight:700;margin-top:6px">DF BIT — DON'T FRAGMENT:</div>
          <div style="color:var(--muted2)">TCP sets DF=1. If packet > link MTU → router DROPS it and sends</div>
          <div style="color:var(--muted2)">ICMP Type 3 Code 4 "Fragmentation Needed, DF set".</div>
          <div style="color:var(--muted2)">TCP uses this for PMTUD (Path MTU Discovery).</div>
          <div style="color:var(--red)">⚠️ If firewalls block ICMP Type 3 → TCP Black Hole!</div>
          <div style="color:var(--amber);font-weight:700;margin-top:6px">DSCP QoS MARKING:</div>
          <div style="color:var(--muted2)">EF (46): VoIP. AF41(34): Video. CS0(0): Best effort.</div>
          <div style="color:var(--muted2)">CS6/CS7 (48/56): Reserved for routing protocol traffic.</div>
          <div style="color:var(--muted2)">DSCP is set by edge devices; honored (or re-marked) by core.</div>
        </div>
      </div>
    </div>
  </div>
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">🔬 Layer-by-Layer Troubleshooting (OSI as Diagnostic Tool)</div>
    <div class="callout callout-info">Every Cisco TAC engineer uses OSI bottom-up or top-down methodology. Never skip layers — L1 issues mask L2 issues, which mask L3 issues.</div>
    <div class="tbl-wrap"><table class="tbl">
      <tr><th>Layer</th><th>Question</th><th>Key Command</th><th>Red Flag</th></tr>
      <tr><td style="color:var(--green)">L1 Physical</td><td>Is link physically UP?</td><td>show interfaces Gi0/0 | inc line</td><td>"line protocol is down" = no L2 frames</td></tr>
      <tr><td style="color:var(--cyan)">L2 Data Link</td><td>MAC learning correct? Duplex match?</td><td>show mac address-table · show interfaces</td><td>CRC errors, late collisions = duplex mismatch</td></tr>
      <tr><td style="color:var(--blue)">L3 Network</td><td>Route in table? Next-hop reachable?</td><td>show ip route · ping next-hop</td><td>Missing route, wrong mask, recursive loop</td></tr>
      <tr><td style="color:var(--amber)">L4 Transport</td><td>Port open? ACL blocking? NAT failing?</td><td>telnet IP PORT · show ip access-lists</td><td>ACL hit counter increasing, port refused</td></tr>
      <tr><td style="color:var(--red)">L7 Application</td><td>Service running? DNS resolving? Cert valid?</td><td>ping · traceroute · nslookup</td><td>Intermittent, works for some not others</td></tr>
    </table></div>
    <div class="callout callout-warn" style="margin-top:10px">⚠️ <strong>Classic trap: Speed/Duplex Mismatch.</strong> One side auto-negotiates full-duplex, other hard-coded to half-duplex. Link stays UP at L1. You see late collisions on the HD side + input errors on both. Throughput is 10-30% of expected. Fix: always hard-code speed and duplex on switch ports to servers: <code>speed 1000 / duplex full</code>. Test with large packets: <code>ping 8.8.8.8 size 1472 df-bit repeat 100</code></div>
  </div>
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">🎯 Additional OSI Interview Q&A</div>
    <div class="qa-list">
      <div class="qa-item"><div class="qa-q" onclick="toggleQA(this)">Q: A packet's TTL reaches 0 at a router. Walk through every step including the exact ICMP message generated.<span class="qa-arrow">▶</span></div><div class="qa-a">Step 1: Router receives IP packet. Step 2: Router reads TTL field — it is 1. Step 3: Router decrements TTL to 0. Step 4: Router checks TTL BEFORE forwarding. TTL=0 means packet cannot be forwarded. Step 5: Router drops the packet and generates ICMP Time Exceeded (Type 11, Code 0 = "TTL exceeded in transit"). Step 6: ICMP is sent to ORIGINAL source IP (not destination). Step 7: ICMP packet contains: Type=11, Code=0, Checksum, + first 28 bytes of the dropped packet (original IP header + first 8 data bytes — lets source identify which packet was dropped). Step 8: New IP header: Source=router IP, Destination=original sender, TTL=255 (fresh start). This is exactly how traceroute works: TTL=1 → ICMP from hop 1, TTL=2 → ICMP from hop 2, etc. Note: TTL decrements only when forwarding (L3 lookup). A router processing packets destined FOR ITSELF (OSPF hellos, BGP sessions, SSH to router) does NOT decrement TTL — those packets go to the CPU for process switching.</div></div>
      <div class="qa-item"><div class="qa-q" onclick="toggleQA(this)">Q: What is TCP Black Hole and how does PMTUD break?<span class="qa-arrow">▶</span></div><div class="qa-a">PMTUD (Path MTU Discovery) allows TCP to find the smallest MTU along a path and avoid fragmentation. Here's how it works and breaks: Normal operation: TCP sends packets with DF=1 (Don't Fragment). If a router needs to fragment but DF=1, it drops the packet and sends ICMP Type 3 Code 4 "Fragmentation Needed, DF set" back to the sender. The sender reduces its MSS and retransmits. How it breaks — TCP Black Hole: A firewall or ACL drops ALL ICMP packets (common security misconfiguration — "just block ICMP" is wrong). Now: sender transmits large packets, DF=1. A router along the path needs to fragment. It drops the packet but the ICMP Type 3 Code 4 message is blocked by the firewall. The sender never learns the path MTU is smaller. It keeps retransmitting the same size packet. TCP session appears to work for small packets (ACKs, SYN/SYN-ACK = small) but hangs for any data transfer. Effect: SSH connects, but scp freezes. Web pages load partially. FTP gets "stuck" after banner. Diagnosis: ping with DF bit and decreasing size until success. Fix: permit ICMP Type 3 unreachable at firewalls. Or use TCP MSS clamping: ip tcp adjust-mss 1452 on tunnel interfaces.</div></div>
    </div>
  </div>


</div>

<!-- ═══ CCNA TAB 1: ETHERNET & ARP DEEP DIVE ═══ -->
<div id="ccna-topic-1" class="topic-panel">
  <div class="topic-hero" style="border-left:4px solid var(--cyan)">
    <div class="topic-title">🔗 Ethernet &amp; ARP — Frames, MACs, Collisions, Gratuitous ARP</div>
    <div class="topic-sub">Ethernet II frame field-by-field · ARP request/reply Wireshark · Proxy ARP · GARP · RARP · MAC address structure · EtherType values</div>
  </div>
  <div class="grid-2">
    <div>
      <div class="card">
        <div class="card-hdr">Ethernet II Frame Format — Every Byte</div>
        <svg viewBox="0 0 400 175" width="100%" style="display:block">
          <rect x="0" y="0" width="400" height="175" rx="8" fill="#0d1117" stroke="rgba(56,217,192,0.15)"/>
          <text x="8" y="14" font-family="IBM Plex Mono,monospace" font-size="8" fill="rgba(56,217,192,0.4)">ETHERNET II FRAME — IEEE 802.3</text>
          <!-- Preamble -->
          <rect x="5" y="20" width="55" height="40" rx="3" fill="rgba(140,150,180,0.07)" stroke="rgba(140,150,180,0.2)" stroke-width="1"/>
          <text x="32" y="35" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(140,150,180,0.6)">Preamble</text>
          <text x="32" y="46" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(140,150,180,0.4)">7 bytes</text>
          <text x="32" y="56" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(140,150,180,0.3)">0xAA×7</text>
          <!-- SFD -->
          <rect x="63" y="20" width="35" height="40" rx="3" fill="rgba(140,150,180,0.07)" stroke="rgba(140,150,180,0.2)" stroke-width="1"/>
          <text x="80" y="35" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(140,150,180,0.6)">SFD</text>
          <text x="80" y="46" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(140,150,180,0.4)">1 byte</text>
          <text x="80" y="56" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(140,150,180,0.3)">0xAB</text>
          <!-- Dst MAC -->
          <rect x="101" y="20" width="65" height="40" rx="3" fill="rgba(248,113,113,0.12)" stroke="rgba(248,113,113,0.4)" stroke-width="1"/>
          <text x="133" y="33" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#f87171">Dst MAC</text>
          <text x="133" y="44" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(248,113,113,0.5)">6 bytes</text>
          <text x="133" y="55" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(248,113,113,0.35)">FF:FF:FF:FF:FF:FF</text>
          <!-- Src MAC -->
          <rect x="169" y="20" width="65" height="40" rx="3" fill="rgba(56,217,192,0.12)" stroke="rgba(56,217,192,0.4)" stroke-width="1"/>
          <text x="201" y="33" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#38d9c0">Src MAC</text>
          <text x="201" y="44" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(56,217,192,0.5)">6 bytes</text>
          <text x="201" y="55" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(56,217,192,0.35)">AA:BB:CC:DD:EE:FF</text>
          <!-- EtherType -->
          <rect x="237" y="20" width="55" height="40" rx="3" fill="rgba(251,191,36,0.12)" stroke="rgba(251,191,36,0.4)" stroke-width="1"/>
          <text x="264" y="33" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#fbbf24">EtherType</text>
          <text x="264" y="44" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(251,191,36,0.5)">2 bytes</text>
          <text x="264" y="55" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(251,191,36,0.35)">0x0800=IPv4</text>
          <!-- Payload -->
          <rect x="295" y="20" width="65" height="40" rx="3" fill="rgba(91,156,246,0.1)" stroke="rgba(91,156,246,0.35)" stroke-width="1"/>
          <text x="327" y="33" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#5b9cf6">Payload</text>
          <text x="327" y="44" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(91,156,246,0.5)">46-1500B</text>
          <text x="327" y="55" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(91,156,246,0.35)">IP pkt etc</text>
          <!-- FCS -->
          <rect x="363" y="20" width="33" height="40" rx="3" fill="rgba(74,222,128,0.1)" stroke="rgba(74,222,128,0.3)" stroke-width="1"/>
          <text x="379" y="33" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="#4ade80">FCS</text>
          <text x="379" y="44" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(74,222,128,0.4)">4 bytes</text>
          <text x="379" y="55" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(74,222,128,0.3)">CRC32</text>
          <!-- Byte counts -->
          <rect x="5" y="68" width="393" height="14" rx="2" fill="rgba(0,0,0,0.4)"/>
          <text x="32" y="78" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(140,150,180,0.3)">7B</text>
          <text x="80" y="78" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(140,150,180,0.3)">1B</text>
          <text x="133" y="78" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(248,113,113,0.4)">6B</text>
          <text x="201" y="78" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(56,217,192,0.4)">6B</text>
          <text x="264" y="78" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(251,191,36,0.4)">2B</text>
          <text x="327" y="78" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(91,156,246,0.4)">46-1500B</text>
          <text x="379" y="78" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(74,222,128,0.4)">4B</text>
          <!-- EtherType table -->
          <rect x="5" y="88" width="393" height="80" rx="4" fill="rgba(0,0,0,0.3)" stroke="rgba(255,255,255,0.03)"/>
          <text x="10" y="101" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(251,191,36,0.6)">EtherType values  |  0x0800=IPv4  |  0x0806=ARP  |  0x86DD=IPv6  |  0x8100=802.1Q VLAN tag</text>
          <text x="10" y="115" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(56,217,192,0.5)">802.1Q VLAN tag adds 4 bytes: 0x8100 + PCP(3b)+DEI(1b)+VID(12b)</text>
          <text x="10" y="129" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(140,150,180,0.4)">MAC structure: 3B OUI (vendor) + 3B NIC-specific  |  OUI 00:00:0C = Cisco</text>
          <text x="10" y="143" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(248,113,113,0.5)">Bit 0 of first byte: 0=unicast, 1=multicast  |  Bit 1: 0=global, 1=locally administered</text>
          <text x="10" y="157" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(140,150,180,0.3)">Min frame: 64B (FCS included) — smaller frames are runts. Max: 1518B (1522B with 802.1Q)</text>
          <text x="10" y="168" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(140,150,180,0.3)">Wireshark does NOT show Preamble/SFD — captured after NIC strips them</text>
        </svg>
      </div>
    </div>
    <div>
      <div class="card">
        <div class="card-hdr">ARP — Address Resolution Protocol (RFC 826)</div>
        <div class="callout callout-info" style="margin-bottom:8px">ARP resolves Layer 3 (IP) to Layer 2 (MAC). It is broadcast on the local segment. ARP is encapsulated directly in Ethernet (EtherType 0x0806) — not in IP!</div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>Field</th><th>ARP Request</th><th>ARP Reply</th></tr>
          <tr><td>Eth Dst MAC</td><td style="color:var(--red)">FF:FF:FF:FF:FF:FF (broadcast)</td><td style="color:var(--green)">AA:BB:CC:DD:EE:FF (requester)</td></tr>
          <tr><td>Eth Src MAC</td><td style="color:var(--cyan)">AA:BB:CC:DD:EE:FF (requester)</td><td style="color:var(--cyan)">11:22:33:44:55:66 (responder)</td></tr>
          <tr><td>ARP Opcode</td><td style="color:var(--blue)">1 (Request)</td><td style="color:var(--green)">2 (Reply)</td></tr>
          <tr><td>Sender MAC</td><td>AA:BB:CC:DD:EE:FF</td><td>11:22:33:44:55:66</td></tr>
          <tr><td>Sender IP</td><td>192.168.1.10</td><td>192.168.1.1</td></tr>
          <tr><td>Target MAC</td><td style="color:var(--muted2)">00:00:00:00:00:00 (unknown!)</td><td style="color:var(--green)">AA:BB:CC:DD:EE:FF</td></tr>
          <tr><td>Target IP</td><td>192.168.1.1 (who has this?)</td><td>192.168.1.1</td></tr>
        </table></div>
        <div class="card-hdr" style="margin-top:12px;margin-bottom:6px">ARP Types You Must Know</div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>Type</th><th>Purpose</th><th>When Seen</th></tr>
          <tr><td style="color:var(--blue)">ARP Request</td><td>"Who has IP X? Tell Y"</td><td>New L3 communication</td></tr>
          <tr><td style="color:var(--green)">ARP Reply</td><td>"X is at MAC Y"</td><td>Response to request</td></tr>
          <tr><td style="color:var(--amber)">Gratuitous ARP</td><td>Sender=Target IP, announce own MAC</td><td>Host boot, IP change, HSRP failover</td></tr>
          <tr><td style="color:var(--cyan)">Proxy ARP</td><td>Router responds with ITS own MAC for IPs on another subnet</td><td>When clients have no default gateway set</td></tr>
          <tr><td style="color:var(--red)">ARP Poisoning</td><td>MITM: send fake ARP replies to poison cache</td><td>Attack — Dynamic ARP Inspection prevents this</td></tr>
        </table></div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:10px;font-family:var(--mono);font-size:10.5px;line-height:1.9;margin-top:8px">
          <div style="color:var(--cyan)">! ARP verification commands</div>
          <div style="color:var(--blue)">show arp                     ← router ARP table</div>
          <div style="color:var(--blue)">show ip arp 192.168.1.1      ← specific ARP entry</div>
          <div style="color:var(--blue)">clear arp-cache              ← flush ARP table</div>
          <div style="color:var(--blue)">arp -a                       ← Windows/Linux ARP table</div>
          <div style="color:var(--amber)">ip arp inspection vlan 10    ← Dynamic ARP Inspection</div>
        </div>
      </div>
    </div>
  </div>
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">🎯 Interview Q&amp;A — Ethernet &amp; ARP</div>
    <div class="qa-list">
      <div class="qa-item"><div class="qa-q" onclick="toggleQA(this)">Q: A host sends an ARP request but receives no reply. What are the possible causes?<span class="qa-arrow">▶</span></div><div class="qa-a">①Target host is DOWN or unreachable at L1/L2. ②Target IP doesn't exist on the local subnet. ③Proxy ARP disabled on the router — host has wrong/no gateway configured. ④Firewall blocking ARP (rare but possible in some environments). ⑤VLAN mismatch — host is in VLAN 10 but target is in VLAN 20, and inter-VLAN routing not configured. ⑥IP conflict — if the IP is statically assigned to another device, that device may ignore ARP requests to avoid conflict. Diagnosis: <code>ping 192.168.1.X</code> → if fails, <code>show arp</code> on the local switch — if no entry, the target is unreachable at L2. Use Wireshark to confirm ARP request goes out and verify no reply comes back.</div></div>
      <div class="qa-item"><div class="qa-q" onclick="toggleQA(this)">Q: What is a Gratuitous ARP and what are its uses in enterprise networking?<span class="qa-arrow">▶</span></div><div class="qa-a">A Gratuitous ARP is an ARP reply (or request) where the sender and target IP fields are BOTH set to the sender's own IP. There's no request preceding it — it's "unsolicited." Uses: ①Host boot — announces its MAC to update neighbors' ARP caches. ②IP conflict detection — if another device sends a GARP reply for the same IP, a conflict exists. ③HSRP/VRRP/GLBP failover — when a new Active router takes over, it sends GARP to update all hosts' ARP caches with the virtual MAC, without hosts needing to ARP again. ④Virtual machine migration (vMotion) — when a VM moves to a new hypervisor host, a GARP updates the physical switch MAC table so traffic goes to the new location. In Wireshark: filter <code>arp.isgratuitous == 1</code></div></div>
    </div>
  </div>

  <!-- PART 2: Ethernet Standards & Speeds -->
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">Ethernet Standards — Physical Layer Deep Dive</div>
    <div class="grid-2">
      <div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>Standard</th><th>Speed</th><th>Cable</th><th>Max Distance</th><th>Signal</th></tr>
          <tr><td style="color:var(--muted2)">10BASE-T</td><td>10 Mbps</td><td>Cat3/Cat5</td><td>100m</td><td>Manchester encoding</td></tr>
          <tr><td style="color:var(--muted2)">100BASE-TX</td><td>100 Mbps</td><td>Cat5e</td><td>100m</td><td>MLT-3, 4B5B</td></tr>
          <tr><td style="color:var(--blue)">1000BASE-T</td><td>1 Gbps</td><td>Cat5e/Cat6</td><td>100m</td><td>PAM-5, all 4 pairs</td></tr>
          <tr><td style="color:var(--cyan)">10GBASE-T</td><td>10 Gbps</td><td>Cat6a/Cat7</td><td>100m</td><td>PAM-16 (DSQ128)</td></tr>
          <tr><td style="color:var(--amber)">1000BASE-SX</td><td>1 Gbps</td><td>MMF (OM1-OM4)</td><td>550m</td><td>850nm laser, fiber</td></tr>
          <tr><td style="color:var(--amber)">1000BASE-LX</td><td>1 Gbps</td><td>SMF / MMF</td><td>10km (SMF)</td><td>1310nm laser</td></tr>
          <tr><td style="color:var(--green)">10GBASE-SR</td><td>10 Gbps</td><td>MMF OM3/OM4</td><td>300m OM4</td><td>850nm VCSEL</td></tr>
          <tr><td style="color:var(--green)">10GBASE-LR</td><td>10 Gbps</td><td>SMF</td><td>10km</td><td>1310nm DFB laser</td></tr>
          <tr><td style="color:var(--red)">100GBASE-SR4</td><td>100 Gbps</td><td>MMF OM4</td><td>100m</td><td>4-lane, 25G per lane</td></tr>
        </table></div>
        <div class="callout callout-warn" style="margin-top:8px">⚠️ <strong>Auto-negotiation failure = duplex mismatch:</strong> One side sets 100/full-duplex manually, the other auto-negotiates and falls back to half-duplex. Half-duplex side sees collisions, generates runts and CRC errors. Symptoms: <code>show interface</code> shows high input errors, CRC, runts. Fix: always hard-code both sides or leave both on auto.</div>
      </div>
      <div>
        <div class="card-hdr" style="margin-bottom:8px">CSMA/CD — Why It Matters for Legacy Networks</div>
        <div class="callout callout-info" style="margin-bottom:8px">CSMA/CD (Carrier Sense Multiple Access / Collision Detection) was the original Ethernet MAC method for shared hubs. Modern switches use full-duplex point-to-point links — NO collisions possible. But half-duplex legacy connections (hub, old switch ports) still use CSMA/CD.</div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10.5px;line-height:1.9">
          <div style="color:var(--cyan)">CSMA/CD Process:</div>
          <div style="color:var(--text)">1. Carrier Sense: listen before transmitting</div>
          <div style="color:var(--text)">2. Multiple Access: all devices share the medium</div>
          <div style="color:var(--text)">3. Collision Detect: detect if two sent simultaneously</div>
          <div style="color:var(--red)">4. Jam signal: 32-bit jam sent to alert all</div>
          <div style="color:var(--amber)">5. Backoff: wait random time (binary exponential)</div>
          <div style="color:var(--green)">6. Retry: attempt retransmission</div>
          <div style="color:var(--muted);margin-top:6px">Slot time = 512 bits (64 bytes) = min frame size reason</div>
          <div style="color:var(--muted)">A frame must be at least 64 bytes so the sender is</div>
          <div style="color:var(--muted)">still transmitting when a collision propagates back.</div>
          <div style="color:var(--muted)">Frames &lt; 64 bytes = runts (collision fragment).</div>
        </div>
        <div class="card-hdr" style="margin-top:12px;margin-bottom:8px">Interface Error Counters — What Each Means</div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>Counter</th><th>Root Cause</th><th>Fix</th></tr>
          <tr><td style="color:var(--red)">Runts</td><td>Frames &lt;64B — collision fragments or duplex mismatch</td><td>Fix duplex/speed; check cable</td></tr>
          <tr><td style="color:var(--red)">Giants</td><td>Frames &gt;1518B — misconfigured MTU or jumbo frames</td><td>Enable jumbo frames or fix MTU</td></tr>
          <tr><td style="color:var(--amber)">CRC errors</td><td>Bit errors in frame — bad cable, duplex mismatch, EMI</td><td>Replace cable; fix duplex</td></tr>
          <tr><td style="color:var(--amber)">Input errors</td><td>Sum of runts+giants+CRC+frame+overrun</td><td>Investigate sub-counters</td></tr>
          <tr><td style="color:var(--cyan)">Output drops</td><td>Egress queue full — link too slow for traffic rate</td><td>QoS queuing; upgrade link</td></tr>
          <tr><td style="color:var(--muted2)">Collisions</td><td>Normal on half-duplex; never on full-duplex</td><td>If on full-duplex: duplex mismatch!</td></tr>
        </table></div>
      </div>
    </div>
  </div>

  <!-- PART 3: ARP - full deep dive -->
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">ARP Deep Dive — Process, Cache, Proxy, Security</div>
    <div class="grid-2">
      <div>
        <div class="card-hdr" style="margin-bottom:8px">Complete ARP Process — What Happens When PC-A Pings 192.168.1.1</div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10.5px;line-height:2">
          <div style="color:var(--cyan)">PC-A (192.168.1.10) → ping 192.168.1.1</div>
          <div style="color:var(--text)">Step 1: Is 192.168.1.1 on my subnet? YES (/24)</div>
          <div style="color:var(--text)">Step 2: Check ARP cache → not found</div>
          <div style="color:var(--blue)">Step 3: Send ARP Request (broadcast):</div>
          <div style="color:var(--muted)">  Eth Dst: FF:FF:FF:FF:FF:FF</div>
          <div style="color:var(--muted)">  "Who has 192.168.1.1? Tell 192.168.1.10"</div>
          <div style="color:var(--green)">Step 4: R1 receives, replies (unicast):</div>
          <div style="color:var(--muted)">  "192.168.1.1 is at AA:BB:CC:DD:EE:FF"</div>
          <div style="color:var(--text)">Step 5: PC-A caches: 192.168.1.1 → AA:BB...</div>
          <div style="color:var(--text)">Step 6: PC-A sends ICMP Echo in Eth frame</div>
          <div style="color:var(--amber);margin-top:4px">What if destination is on DIFFERENT subnet?</div>
          <div style="color:var(--muted)">PC-A ARPs for the DEFAULT GATEWAY (not the dst)</div>
          <div style="color:var(--muted)">IP layer says "not local" → use gateway IP</div>
          <div style="color:var(--muted)">Router forwards at L3, rewrites L2 each hop</div>
        </div>
      </div>
      <div>
        <div class="card-hdr" style="margin-bottom:8px">ARP Cache Behavior & Security</div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>Behavior</th><th>Detail</th></tr>
          <tr><td style="color:var(--blue)">Cache timeout</td><td>Windows: 2min dynamic, 10min for active entries. Cisco IOS: 4 hours. Linux: 60s reachable, garbage collect after 30s stale.</td></tr>
          <tr><td style="color:var(--cyan)">Unsolicited update</td><td>Routers update ARP cache even from unrequested ARP replies — this is the vulnerability exploited in ARP poisoning.</td></tr>
          <tr><td style="color:var(--amber)">Dynamic ARP Inspection</td><td>Switch validates ARP packets against DHCP snooping binding table (MAC+IP+port+VLAN). Drops ARP replies with mismatched IP/MAC.</td></tr>
          <tr><td style="color:var(--red)">ARP poisoning (MITM)</td><td>Attacker sends GARP replies: "192.168.1.1 is at ATTACKER:MAC". Victims send traffic to attacker, who forwards to real gateway. Wireshark filter: <code>arp.duplicate-address-detected</code></td></tr>
          <tr><td style="color:var(--green)">Static ARP entry</td><td><code>arp 192.168.1.1 AA:BB:CC:DD:EE:FF arpa</code> — permanent, cannot be poisoned. Used for critical devices.</td></tr>
        </table></div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:10px;font-family:var(--mono);font-size:10.5px;line-height:1.8;margin-top:8px">
          <div style="color:var(--cyan)">! Wireshark ARP filters</div>
          <div style="color:var(--blue)">arp                          ← all ARP</div>
          <div style="color:var(--blue)">arp.opcode == 1              ← ARP requests only</div>
          <div style="color:var(--blue)">arp.opcode == 2              ← ARP replies only</div>
          <div style="color:var(--amber)">arp.isgratuitous == 1        ← Gratuitous ARP</div>
          <div style="color:var(--red)">arp.duplicate-address-detected ← MITM warning</div>
          <div style="color:var(--cyan);margin-top:6px">! Cisco show commands</div>
          <div style="color:var(--green)">show arp                     ← full ARP table</div>
          <div style="color:var(--green)">show ip arp 192.168.1.1      ← specific IP</div>
          <div style="color:var(--red)">clear arp-cache              ← flush all</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Q&A extra -->
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">🎯 Advanced Interview Q&amp;A — Ethernet &amp; ARP</div>
    <div class="qa-list">
      <div class="qa-item">
        <div class="qa-q" onclick="toggleQA(this)">Q: You see high CRC errors on an interface but no duplex mismatch. What else do you check?<span class="qa-arrow">▶</span></div>
        <div class="qa-a">CRC errors = frame arrived with bad checksum. Duplex mismatch is the #1 cause, but if that's ruled out: ①<strong>Physical cable:</strong> Cable too long (>100m copper), damaged cable, bent fiber, wrong fiber type (SMF vs MMF connector mismatch). Test with <code>show interfaces detail | include CRC|error</code>. ②<strong>Bad SFP/transceiver:</strong> Dirty fiber connector, wrong wavelength SFP. Clean connectors with fiber cleaner pen. ③<strong>EMI/RFI interference:</strong> Unshielded cable near electrical equipment (motors, generators, fluorescent lights). Use shielded STP cable. ④<strong>Speed mismatch:</strong> One side 100M half, other 1G full — while not strictly "duplex," auto-negotiation failure can cause framing errors that show as CRC. ⑤<strong>Flapping NIC:</strong> <code>show log</code> for link up/down messages. If NIC is resetting mid-frame, you get partial frames → CRC errors. Key metric: CRC errors incrementing on INPUT only suggest cable/layer1 issue. CRC errors on both in/out suggest something at the software or buffer level.</div>
      </div>
      <div class="qa-item">
        <div class="qa-q" onclick="toggleQA(this)">Q: What is Proxy ARP and when can it cause problems in production?<span class="qa-arrow">▶</span></div>
        <div class="qa-a">Proxy ARP is when a router responds to an ARP request on behalf of a host on another network — it replies with its OWN MAC address for the target IP, essentially "proxying" the ARP. This lets hosts communicate without a configured default gateway. The router accepts the traffic and routes it normally. <strong>When it's dangerous:</strong> ①Route summarization errors — if a router has a summary route 10.0.0.0/8 but is on the 192.168.1.0/24 segment, it may proxy ARP for IPs in 10.0.0.0/8 that don't actually exist behind it, causing blackholing. ②Security — an attacker can proxy ARP for any IP to become a MITM. ③Excessive ARP traffic — hosts without gateways send constant ARPs; if the proxy router is processing all of them, it adds CPU load. ④Host migration — if you move a host to a new subnet but forget to update its gateway, proxy ARP can mask the misconfiguration for weeks. Best practice: disable proxy ARP (<code>no ip proxy-arp</code> on interfaces) and always configure default gateways correctly. Cisco enables proxy ARP by default on all IOS interfaces.</div>
      </div>
    </div>
  </div>
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">🔬 Ethernet Frame Anatomy — Every Byte Explained</div>
    <div class="grid-2">
      <div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:14px;font-family:var(--mono);font-size:10px;line-height:2">
          <div style="color:var(--amber);font-weight:700">802.3 ETHERNET FRAME (min 64B, max 1518B standard / 1522B with 802.1Q):</div>
          <div style="color:var(--muted)">Preamble:   7 bytes — 10101010×7 (receiver clock synchronization)</div>
          <div style="color:var(--muted)">SFD:        1 byte  — 10101011 (Start Frame Delimiter — frame begins)</div>
          <div style="color:var(--cyan)">Dst MAC:    6 bytes — who receives this frame (L2 destination)</div>
          <div style="color:var(--cyan)">Src MAC:    6 bytes — who sent this frame (learned by switch)</div>
          <div style="color:var(--blue)">EtherType:  2 bytes — 0x0800=IPv4  0x86DD=IPv6  0x0806=ARP  0x8100=802.1Q</div>
          <div style="color:var(--green)">Data:       46–1500 bytes — L3 PDU (IP packet or other)</div>
          <div style="color:var(--red)">FCS:        4 bytes — CRC-32 error detection (covers Dst+Src+Type+Data)</div>
          <div style="margin-top:8px;color:var(--amber);font-weight:700">802.1Q VLAN TAG (adds 4 bytes, max frame = 1522B):</div>
          <div style="color:var(--purple)">TPID: 0x8100 (2B) + TCI: PCP(3b)+DEI(1b)+VID(12b) (2B)</div>
          <div style="color:var(--muted)">VID = VLAN ID 0-4095. VLANs 0, 1, 4095 are reserved.</div>
          <div style="color:var(--muted)">Native VLAN traffic is sent UNTAGGED (stripped at trunk port)</div>
          <div style="margin-top:8px;color:var(--red);font-weight:700">WHY MINIMUM 64 BYTES?</div>
          <div style="color:var(--muted)">CSMA/CD collision detection (half-duplex). A frame must still</div>
          <div style="color:var(--muted)">be transmitting when collision signal returns. Worst case on</div>
          <div style="color:var(--muted)">100m 10Mbps cable: round-trip = 51.2μs = 512 bits = 64 bytes.</div>
          <div style="color:var(--red)">Frames &lt; 64B = runts = errors (logged, dropped by switch)</div>
        </div>
      </div>
      <div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:14px;font-family:var(--mono);font-size:10px;line-height:2">
          <div style="color:var(--amber);font-weight:700">MAC ADDRESS DEEP DIVE (48 bits / 6 bytes):</div>
          <div style="color:var(--cyan)">Format: OUI (3B) : Device-ID (3B)</div>
          <div style="color:var(--muted2)">Example: 00:1B:D4:AA:BB:CC</div>
          <div style="color:var(--muted2)">00:1B:D4 = OUI → Cisco (registered with IEEE)</div>
          <div style="color:var(--muted2)">AA:BB:CC = Unique device ID assigned by Cisco</div>
          <div style="margin-top:6px;color:var(--red)">FF:FF:FF:FF:FF:FF = Broadcast (ALL devices on segment)</div>
          <div style="color:var(--amber)">01:00:5E:xx:xx:xx = IPv4 multicast (bit 0 of byte 0 = 1)</div>
          <div style="color:var(--amber)">33:33:xx:xx:xx:xx = IPv6 multicast</div>
          <div style="color:var(--green)">00:00:0C:07:AC:XX = HSRP virtual MAC (XX=group)</div>
          <div style="color:var(--blue)">00:00:5E:00:01:XX = VRRP virtual MAC</div>
          <div style="margin-top:6px;color:var(--cyan)">Bit 0 byte 0: 0=Unicast 1=Multicast/Broadcast</div>
          <div style="color:var(--cyan)">Bit 1 byte 0: 0=Global (OUI) 1=Locally administered</div>
          <div style="margin-top:6px;color:var(--amber)">show interfaces Gi0/0 | inc Hardware  → see burned-in MAC</div>
          <div style="color:var(--amber)">show arp  /  show ip arp              → IP-to-MAC mapping</div>
          <div style="color:var(--amber)">clear arp-cache                        → force re-ARP</div>
        </div>
      </div>
    </div>
  </div>
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">🔬 ARP Packet Structure & Security — Byte-Level with Wireshark Fields</div>
    <div class="callout callout-warn">⚠️ ARP has ZERO authentication. Any device can send a Gratuitous ARP claiming any IP→MAC mapping. This enables ARP poisoning (Man-in-the-Middle). In production networks, DHCP Snooping + DAI are mandatory security features.</div>
    <div class="grid-2">
      <div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--cyan);font-weight:700">ARP REQUEST (Wireshark exact fields):</div>
          <div style="color:var(--muted2)">Hardware type:    0x0001 (Ethernet)</div>
          <div style="color:var(--muted2)">Protocol type:    0x0800 (IPv4)</div>
          <div style="color:var(--muted2)">Hardware length:  6 (MAC = 6 bytes)</div>
          <div style="color:var(--muted2)">Protocol length:  4 (IPv4 = 4 bytes)</div>
          <div style="color:var(--blue)">Opcode:           1 = REQUEST  /  2 = REPLY</div>
          <div style="color:var(--green)">Sender MAC:       AA:BB:CC:11:22:33 (my MAC)</div>
          <div style="color:var(--green)">Sender IP:        192.168.1.10 (my IP)</div>
          <div style="color:var(--red)">Target MAC:       00:00:00:00:00:00 (I DON'T KNOW!)</div>
          <div style="color:var(--red)">Target IP:        192.168.1.1 ("Who has this IP?")</div>
          <div style="margin-top:6px;color:var(--amber)">Ethernet wrapper: Dst=FF:FF:FF:FF:FF:FF (BROADCAST)</div>
          <div style="margin-top:8px;color:var(--cyan);font-weight:700">ARP REPLY (unicast back to requester):</div>
          <div style="color:var(--muted2)">Opcode: 2 = REPLY</div>
          <div style="color:var(--green)">Target MAC: AA:BB:CC:11:22:33 (now filled in!)</div>
          <div style="color:var(--muted2)">Ethernet Dst: AA:BB:CC:11:22:33 (unicast reply)</div>
        </div>
      </div>
      <div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--red);font-weight:700">ARP POISONING ATTACK:</div>
          <div style="color:var(--muted2)">Attacker sends UNSOLICITED ARP Replies:</div>
          <div style="color:var(--red)"> "192.168.1.1 (Gateway) is at ATTACKER_MAC"</div>
          <div style="color:var(--red)"> → victim updates cache → traffic goes to attacker!</div>
          <div style="color:var(--green)">MITIGATIONS:</div>
          <div style="color:var(--green)">• DAI (Dynamic ARP Inspection) — validate vs DHCP snooping table</div>
          <div style="color:var(--green)">• Static ARP entries (impractical at scale)</div>
          <div style="color:var(--green)">• Private VLANs (hosts can't talk to each other directly)</div>
          <div style="color:var(--green)">• 802.1X port authentication</div>
          <div style="margin-top:8px;color:var(--cyan);font-weight:700">GRATUITOUS ARP (GARP):</div>
          <div style="color:var(--muted2)">Device ARPs for its OWN IP address.</div>
          <div style="color:var(--muted2)">Purpose 1: DAD — if anyone replies, IP conflict exists!</div>
          <div style="color:var(--muted2)">Purpose 2: Update neighbor caches after failover</div>
          <div style="color:var(--muted2)">           HSRP/VRRP sends GARP when active router changes</div>
          <div style="margin-top:6px;color:var(--amber)">Proxy ARP: Router replies on behalf of hosts in other subnets</div>
          <div style="color:var(--red)">Disable Proxy ARP: no ip proxy-arp (security best practice)</div>
        </div>
      </div>
    </div>
  </div>


</div>


<!-- ═══ CCNA TAB 2: SWITCHING & STP ═══ -->
<div id="ccna-topic-2" class="topic-panel">
  <div class="topic-hero" style="border-left:4px solid var(--amber)">
    <div class="topic-title">🔀 Spanning Tree Protocol — STP, PVST+, RSTP &amp; MSTP</div>
    <div class="topic-sub">Why loops destroy networks · BPDU frame structure · Root Bridge election step-by-step with real MAC addresses · Root Port / Designated Port / Blocked Port with network diagrams · Port states &amp; 30s timer · Full show spanning-tree decoded line-by-line · Changing cost &amp; port-priority · PVST+ load balancing per VLAN · PortFast &amp; BPDU Guard · Rapid-PVST+ vs classic STP · MSTP</div>
  </div>

  <!-- WHY STP EXISTS -->
  <div class="card">
    <div class="card-hdr">Why Spanning Tree Exists — Ethernet Loops Are Fatal</div>
    <p>In a switched network we need redundancy so one cable failure does not kill the network. But adding redundant links between switches creates loops. Unlike IP packets, Ethernet frames have <strong>no TTL field</strong> — a broadcast frame caught in a loop circulates forever, consuming all bandwidth and crashing every switch within seconds.</p>
    <div class="grid-2">
      <div>
        <svg viewBox="0 0 340 185" width="100%" style="display:block;margin-bottom:8px">
          <rect x="0" y="0" width="340" height="185" fill="#0d1117" rx="8" stroke="rgba(248,113,113,0.2)"/>
          <text x="12" y="13" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(248,113,113,0.4)">THE LOOP PROBLEM — NO TTL IN ETHERNET FRAMES</text>
          <rect x="120" y="22" width="100" height="36" rx="6" fill="rgba(74,222,128,0.1)" stroke="#4ade80" stroke-width="1.5"/>
          <text x="170" y="37" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9" font-weight="700" fill="#4ade80">SwitchA</text>
          <text x="170" y="50" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(74,222,128,0.4)">Int1         Int2</text>
          <rect x="30" y="115" width="100" height="36" rx="6" fill="rgba(91,156,246,0.1)" stroke="#5b9cf6" stroke-width="1.5"/>
          <text x="80" y="133" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9" font-weight="700" fill="#5b9cf6">SwitchB</text>
          <rect x="210" y="115" width="100" height="36" rx="6" fill="rgba(56,217,192,0.1)" stroke="#38d9c0" stroke-width="1.5"/>
          <text x="260" y="133" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9" font-weight="700" fill="#38d9c0">SwitchC</text>
          <line x1="142" y1="58" x2="80" y2="115" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"/>
          <line x1="198" y1="58" x2="260" y2="115" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"/>
          <line x1="130" y1="133" x2="210" y2="133" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"/>
          <path d="M122 50 Q20 83 62 113" stroke="#f87171" stroke-width="2" fill="none" stroke-dasharray="6,3"/>
          <path d="M218 113 Q320 83 218 50" stroke="#f87171" stroke-width="2" fill="none" stroke-dasharray="6,3"/>
          <path d="M130 140 Q170 155 210 140" stroke="#f87171" stroke-width="2" fill="none" stroke-dasharray="6,3"/>
          <text x="170" y="100" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="11" font-weight="700" fill="#f87171">LOOP!</text>
          <rect x="20" y="158" width="300" height="22" rx="3" fill="rgba(248,113,113,0.08)" stroke="rgba(248,113,113,0.2)"/>
          <text x="170" y="167" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(248,113,113,0.7)">1. Computer A sends ARP broadcast</text>
          <text x="170" y="177" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(248,113,113,0.6)">2. Both switches flood it out all ports 3. Loop forms — switches crash!</text>
        </svg>
        <div class="callout callout-warn">
          <strong>Broadcast storm — what actually happens:</strong><br>
          1. Computer A sends ARP broadcast looking for Computer B<br>
          2. SwitchA floods it out ALL ports except the source<br>
          3. SwitchB and SwitchC both receive it and flood again<br>
          4. SwitchA receives the frame back — and floods again<br>
          5. Repeats infinitely — no TTL to stop it<br>
          6. Switches crash from CPU overload within seconds
        </div>
      </div>
      <div>
        <svg viewBox="0 0 340 185" width="100%" style="display:block;margin-bottom:8px">
          <rect x="0" y="0" width="340" height="185" fill="#0d1117" rx="8" stroke="rgba(74,222,128,0.2)"/>
          <text x="12" y="13" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(74,222,128,0.4)">STP FIX — BLOCK ONE PORT, KEEP REDUNDANCY</text>
          <rect x="110" y="22" width="120" height="40" rx="6" fill="rgba(251,191,36,0.15)" stroke="#fbbf24" stroke-width="2.5"/>
          <text x="170" y="37" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9" font-weight="700" fill="#fbbf24">SwitchA ROOT</text>
          <text x="140" y="66" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" font-weight="700" fill="#4ade80">D</text>
          <text x="200" y="66" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" font-weight="700" fill="#4ade80">D</text>
          <rect x="25" y="120" width="105" height="40" rx="6" fill="rgba(91,156,246,0.1)" stroke="#5b9cf6" stroke-width="1.5"/>
          <text x="77" y="138" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8.5" font-weight="700" fill="#5b9cf6">SwitchB</text>
          <text x="77" y="151" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(91,156,246,0.4)">NON-ROOT</text>
          <rect x="210" y="120" width="105" height="40" rx="6" fill="rgba(56,217,192,0.1)" stroke="#38d9c0" stroke-width="1.5"/>
          <text x="262" y="138" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8.5" font-weight="700" fill="#38d9c0">SwitchC</text>
          <text x="262" y="151" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(56,217,192,0.4)">NON-ROOT</text>
          <line x1="140" y1="62" x2="77" y2="120" stroke="#4ade80" stroke-width="2.5"/>
          <line x1="200" y1="62" x2="262" y2="120" stroke="#4ade80" stroke-width="2.5"/>
          <text x="96" y="100" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" font-weight="700" fill="#4ade80">R</text>
          <text x="244" y="100" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" font-weight="700" fill="#4ade80">R</text>
          <line x1="130" y1="140" x2="210" y2="140" stroke="rgba(255,255,255,0.1)" stroke-width="1.5"/>
          <text x="155" y="134" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" font-weight="700" fill="#4ade80">D</text>
          <text x="188" y="134" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" font-weight="700" fill="#f87171">ND</text>
          <rect x="175" y="153" width="22" height="14" rx="3" fill="rgba(248,113,113,0.2)" stroke="#f87171"/>
          <text x="186" y="163" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#f87171">BLK</text>
          <rect x="8" y="168" width="324" height="13" rx="3" fill="rgba(20,25,40,0.5)"/>
          <text x="170" y="177" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(74,222,128,0.6)">D=Designated FWD  |  R=Root FWD  |  ND=Non-Designated BLOCKED</text>
        </svg>
        <div class="callout callout-info">STP blocks exactly ONE port to break the loop while keeping all switches reachable. If the active link fails STP automatically unblocks the blocked port — redundancy is preserved.</div>
      </div>
    </div>
  </div>

  <!-- BPDU -->
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">BPDU — Bridge Protocol Data Unit (The Message STP Uses)</div>
    <p>All switches exchange special frames called <strong>BPDUs</strong> every 2 seconds. Each switch starts by claiming to be the Root Bridge — it puts its own Bridge ID in the Root Bridge ID field. When it receives a BPDU with a <em>better (lower)</em> Bridge ID, it stops claiming root and forwards the better BPDU instead. After convergence, consensus forms around the one switch with the best Bridge ID.</p>
    <div class="grid-2">
      <div>
        <svg viewBox="0 0 340 155" width="100%" style="display:block">
          <rect x="0" y="0" width="340" height="155" fill="#0d1117" rx="8" stroke="rgba(56,217,192,0.15)"/>
          <text x="12" y="13" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(56,217,192,0.4)">BPDU FRAME STRUCTURE</text>
          <rect x="8" y="20" width="48" height="28" rx="3" fill="rgba(91,156,246,0.1)" stroke="#5b9cf6" stroke-width="1"/>
          <text x="32" y="32" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="#5b9cf6">Protocol</text>
          <text x="32" y="42" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="#5b9cf6">ID</text>
          <rect x="60" y="20" width="38" height="28" rx="3" fill="rgba(91,156,246,0.1)" stroke="#5b9cf6" stroke-width="1"/>
          <text x="79" y="32" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="#5b9cf6">Version</text>
          <rect x="102" y="20" width="38" height="28" rx="3" fill="rgba(91,156,246,0.1)" stroke="#5b9cf6" stroke-width="1"/>
          <text x="121" y="32" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="#5b9cf6">BPDU</text>
          <text x="121" y="42" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="#5b9cf6">Type</text>
          <rect x="144" y="20" width="28" height="28" rx="3" fill="rgba(91,156,246,0.1)" stroke="#5b9cf6" stroke-width="1"/>
          <text x="158" y="35" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="#5b9cf6">Flags</text>
          <!-- Root Bridge ID - most important -->
          <rect x="8" y="54" width="175" height="32" rx="3" fill="rgba(251,191,36,0.15)" stroke="#fbbf24" stroke-width="1.5"/>
          <text x="95" y="67" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" font-weight="700" fill="#fbbf24">Root Bridge ID (8 bytes)</text>
          <text x="95" y="79" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(251,191,36,0.6)">Priority (2B) + MAC Address (6B)</text>
          <rect x="187" y="54" width="70" height="32" rx="3" fill="rgba(74,222,128,0.1)" stroke="#4ade80" stroke-width="1"/>
          <text x="222" y="67" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="#4ade80">Root Path</text>
          <text x="222" y="79" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(74,222,128,0.5)">Cost</text>
          <rect x="261" y="54" width="72" height="32" rx="3" fill="rgba(74,222,128,0.1)" stroke="#4ade80" stroke-width="1"/>
          <text x="297" y="67" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="#4ade80">Bridge ID</text>
          <text x="297" y="79" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(74,222,128,0.5)">(sender)</text>
          <rect x="8" y="92" width="55" height="26" rx="3" fill="rgba(167,139,250,0.1)" stroke="#a78bfa" stroke-width="1"/>
          <text x="35" y="108" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="#a78bfa">Port ID</text>
          <rect x="68" y="92" width="60" height="26" rx="3" fill="rgba(167,139,250,0.1)" stroke="#a78bfa" stroke-width="1"/>
          <text x="98" y="108" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="#a78bfa">Msg Age</text>
          <rect x="133" y="92" width="50" height="26" rx="3" fill="rgba(167,139,250,0.1)" stroke="#a78bfa" stroke-width="1"/>
          <text x="158" y="108" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="#a78bfa">Max Age</text>
          <rect x="188" y="92" width="68" height="26" rx="3" fill="rgba(167,139,250,0.1)" stroke="#a78bfa" stroke-width="1"/>
          <text x="222" y="108" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="#a78bfa">Hello Time</text>
          <rect x="261" y="92" width="72" height="26" rx="3" fill="rgba(167,139,250,0.1)" stroke="#a78bfa" stroke-width="1"/>
          <text x="297" y="108" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="#a78bfa">Fwd Delay</text>
          <text x="12" y="130" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(251,191,36,0.8)">★ Root Bridge ID = key field. Lower Bridge ID wins the election.</text>
          <text x="12" y="142" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(74,222,128,0.7)">★ Bridge ID = Priority (2 bytes) + MAC Address (6 bytes)</text>
          <text x="12" y="152" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(167,139,250,0.6)">★ Sent every Hello Time (default 2s) out every active port</text>
        </svg>
      </div>
      <div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>BPDU Timer</th><th>Default</th><th>Purpose</th></tr>
          <tr><td>Hello Time</td><td style="color:var(--green)">2 sec</td><td>How often BPDUs are sent out each port</td></tr>
          <tr><td>Max Age</td><td style="color:var(--amber)">20 sec</td><td>If no BPDU received for 20s → topology change detected</td></tr>
          <tr><td>Forward Delay</td><td style="color:var(--blue)">15 sec</td><td>Time spent in Listening AND Learning states each</td></tr>
        </table></div>
        <div class="callout callout-info" style="margin-top:10px">
          <strong>How the election happens step by step:</strong><br><br>
          1. Every switch sends BPDUs claiming "I am the Root Bridge" with its own Bridge ID<br>
          2. Switch receives a BPDU with a <em>lower</em> Bridge ID → stops claiming root<br>
          3. Switch forwards the better BPDU out all other ports<br>
          4. After BPDUs propagate: ONE switch has the lowest Bridge ID — it wins<br>
          5. All others become non-root bridges<br><br>
          <strong>Bridge ID = Priority + MAC Address</strong><br>
          Default priority = 32768 on all switches<br>
          → MAC address is the tiebreaker (lowest wins)
        </div>
      </div>
    </div>
  </div>

  <!-- ROOT BRIDGE ELECTION -->
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">Step 1 — Root Bridge Election: Lowest Bridge ID Wins</div>
    <div class="grid-2">
      <div>
        <svg viewBox="0 0 340 220" width="100%" style="display:block">
          <rect x="0" y="0" width="340" height="220" fill="#0d1117" rx="8" stroke="rgba(251,191,36,0.15)"/>
          <text x="12" y="13" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(251,191,36,0.4)">ROOT BRIDGE ELECTION — ALL DEFAULT PRIORITY 32768</text>
          <!-- SwitchA -->
          <rect x="115" y="20" width="110" height="52" rx="6" fill="rgba(74,222,128,0.08)" stroke="#4ade80" stroke-width="1.5"/>
          <text x="170" y="37" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9" font-weight="700" fill="#4ade80">SwitchA</text>
          <text x="170" y="50" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(74,222,128,0.5)">Priority: 32768</text>
          <text x="170" y="62" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(74,222,128,0.5)">MAC: 0011.bb0b.3600</text>
          <!-- SwitchB -->
          <rect x="20" y="130" width="110" height="52" rx="6" fill="rgba(91,156,246,0.08)" stroke="#5b9cf6" stroke-width="1.5"/>
          <text x="75" y="147" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9" font-weight="700" fill="#5b9cf6">SwitchB</text>
          <text x="75" y="160" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(91,156,246,0.5)">Priority: 32768</text>
          <text x="75" y="172" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(91,156,246,0.5)">MAC: 0019.569d.5700</text>
          <!-- SwitchC = ROOT -->
          <rect x="210" y="130" width="110" height="52" rx="6" fill="rgba(248,113,113,0.12)" stroke="#f87171" stroke-width="2.5"/>
          <text x="265" y="147" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9" font-weight="700" fill="#f87171">SwitchC ROOT</text>
          <text x="265" y="160" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(248,113,113,0.6)">Priority: 32768</text>
          <text x="265" y="172" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" font-weight="700" fill="#f87171">MAC: 000f.34ca.1000</text>
          <!-- Links -->
          <line x1="142" y1="72" x2="75" y2="130" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/>
          <line x1="198" y1="72" x2="265" y2="130" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/>
          <line x1="130" y1="156" x2="210" y2="156" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/>
          <!-- Crown -->
          <text x="265" y="122" text-anchor="middle" font-size="16">👑</text>
          <!-- Comparison box -->
          <rect x="8" y="192" width="324" height="22" rx="4" fill="rgba(248,113,113,0.08)" stroke="rgba(248,113,113,0.25)"/>
          <text x="170" y="202" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(248,113,113,0.8)">Compare MACs:  000f &lt; 0011 &lt; 0019  →  SwitchC wins the election</text>
          <text x="170" y="211" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(140,150,180,0.4)">Same priority everywhere → MAC address is the tiebreaker → lowest wins</text>
        </svg>
      </div>
      <div>
        <div class="card-hdr" style="margin-bottom:8px">Force a Specific Switch to be Root</div>
        <p>Never leave root bridge election to chance. Your oldest switch has the lowest burned-in MAC and will become root by default — likely the worst candidate. Always set priority manually.</p>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--cyan)">! Method 1: macro (auto-sets priority below current root)</div>
          <div style="color:var(--green)">SwitchA(config)#spanning-tree vlan 1 root primary</div>
          <div style="color:var(--muted2)">! Sets priority to 24576 automatically</div>
          <div> </div>
          <div style="color:var(--cyan)">! Method 2: manual priority (must be multiple of 4096)</div>
          <div style="color:var(--green)">SwitchA(config)#spanning-tree vlan 1 priority 4096</div>
          <div style="color:var(--muted2)">! Valid: 0, 4096, 8192, 12288, 16384... 61440</div>
          <div> </div>
          <div style="color:var(--cyan)">! Secondary root (will take over if primary fails)</div>
          <div style="color:var(--green)">SwitchB(config)#spanning-tree vlan 1 root secondary</div>
          <div style="color:var(--muted2)">! Sets priority to 28672</div>
          <div> </div>
          <div style="color:var(--amber)">SwitchA#show spanning-tree vlan 1</div>
          <div style="color:var(--green)">Root ID  Priority 4097</div>
          <div style="color:var(--green)">         Address  0011.bb0b.3600</div>
          <div style="color:var(--green)">         This bridge is the root</div>
        </div>
        <div class="callout callout-warn" style="margin-top:8px">⚠️ Priority shown in output = base priority + VLAN number. Priority 32768 on VLAN 1 shows as <strong>32769</strong>. The "sys-id-ext" is the VLAN number added automatically by Cisco's Extended System ID feature.</div>
      </div>
    </div>
  </div>

  <!-- PORT ROLES -->
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">Steps 2 &amp; 3 — Root Ports, Designated Ports, and the Blocked Port</div>
    <p>Once the Root Bridge is elected, every non-root switch finds its best (lowest cost) path to root — that port becomes the <strong>Root Port</strong>. On each link segment, the switch closer to root has the <strong>Designated Port</strong>. The remaining port loses the tiebreaker and becomes <strong>Non-Designated (Blocked)</strong> — the loop is broken.</p>
    <div class="grid-2">
      <div>
        <svg viewBox="0 0 340 240" width="100%" style="display:block">
          <rect x="0" y="0" width="340" height="240" fill="#0d1117" rx="8" stroke="rgba(56,217,192,0.15)"/>
          <text x="12" y="13" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(56,217,192,0.4)">COMPLETE STP TOPOLOGY — REAL PORT ROLES</text>
          <!-- SwitchC ROOT at top centre -->
          <rect x="110" y="20" width="120" height="52" rx="6" fill="rgba(251,191,36,0.15)" stroke="#fbbf24" stroke-width="2.5"/>
          <text x="170" y="36" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8.5" font-weight="700" fill="#fbbf24">SwitchC   👑</text>
          <text x="170" y="48" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#fbbf24">ROOT BRIDGE</text>
          <text x="170" y="60" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(251,191,36,0.5)">MAC: 000f.34ca.1000</text>
          <!-- D labels on root ports (both are D) -->
          <rect x="128" y="70" width="18" height="15" rx="3" fill="rgba(74,222,128,0.25)" stroke="#4ade80" stroke-width="1"/>
          <text x="137" y="81" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" font-weight="700" fill="#4ade80">D</text>
          <rect x="194" y="70" width="18" height="15" rx="3" fill="rgba(74,222,128,0.25)" stroke="#4ade80" stroke-width="1"/>
          <text x="203" y="81" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" font-weight="700" fill="#4ade80">D</text>
          <!-- SwitchA NON-ROOT bottom-left -->
          <rect x="18" y="158" width="118" height="52" rx="6" fill="rgba(74,222,128,0.08)" stroke="#4ade80" stroke-width="1.5"/>
          <text x="77" y="175" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8.5" font-weight="700" fill="#4ade80">SwitchA</text>
          <text x="77" y="187" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(74,222,128,0.4)">NON-ROOT</text>
          <text x="77" y="198" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(74,222,128,0.4)">MAC: 0011.bb0b.3600</text>
          <!-- SwitchB NON-ROOT bottom-right -->
          <rect x="204" y="158" width="118" height="52" rx="6" fill="rgba(91,156,246,0.08)" stroke="#5b9cf6" stroke-width="1.5"/>
          <text x="263" y="175" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8.5" font-weight="700" fill="#5b9cf6">SwitchB</text>
          <text x="263" y="187" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(91,156,246,0.4)">NON-ROOT</text>
          <text x="263" y="198" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(91,156,246,0.4)">MAC: 0019.569d.5700</text>
          <!-- Links root to non-root -->
          <line x1="137" y1="85" x2="77" y2="158" stroke="#4ade80" stroke-width="2.5"/>
          <line x1="203" y1="85" x2="263" y2="158" stroke="#5b9cf6" stroke-width="2.5"/>
          <!-- R labels -->
          <rect x="65" y="143" width="18" height="15" rx="3" fill="rgba(74,222,128,0.25)" stroke="#4ade80" stroke-width="1"/>
          <text x="74" y="154" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" font-weight="700" fill="#4ade80">R</text>
          <rect x="251" y="143" width="18" height="15" rx="3" fill="rgba(91,156,246,0.25)" stroke="#5b9cf6" stroke-width="1"/>
          <text x="260" y="154" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" font-weight="700" fill="#5b9cf6">R</text>
          <!-- cost labels -->
          <text x="96" y="125" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(74,222,128,0.4)">cost 19</text>
          <text x="242" y="125" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(91,156,246,0.4)">cost 19</text>
          <!-- Link between A-B -->
          <line x1="136" y1="184" x2="204" y2="184" stroke="rgba(255,255,255,0.1)" stroke-width="1.5"/>
          <!-- D and ND labels on A-B link -->
          <rect x="148" y="174" width="18" height="15" rx="3" fill="rgba(74,222,128,0.25)" stroke="#4ade80" stroke-width="1"/>
          <text x="157" y="185" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" font-weight="700" fill="#4ade80">D</text>
          <rect x="176" y="174" width="22" height="15" rx="3" fill="rgba(248,113,113,0.25)" stroke="#f87171" stroke-width="1"/>
          <text x="187" y="185" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" font-weight="700" fill="#f87171">ND</text>
          <text x="170" y="205" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="#f87171">BLOCKED — SwitchB has higher MAC</text>
          <!-- legend -->
          <rect x="8" y="216" width="324" height="19" rx="3" fill="rgba(20,25,40,0.5)" stroke="rgba(140,150,180,0.1)"/>
          <text x="30" y="228" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(74,222,128,0.7)">D = Designated FWD</text>
          <text x="145" y="228" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(91,156,246,0.7)">R = Root FWD</text>
          <text x="225" y="228" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(248,113,113,0.7)">ND = Non-Designated BLOCKED</text>
        </svg>
      </div>
      <div>
        <div class="card-hdr" style="margin-bottom:8px">Port Cost — Speed Determines Path</div>
        <div class="tbl-wrap" style="margin-bottom:10px"><table class="tbl">
          <tr><th>Link Speed</th><th>STP Cost</th></tr>
          <tr><td>10 Mbit (Ethernet)</td><td style="color:var(--red)">100</td></tr>
          <tr><td>100 Mbit (FastEthernet)</td><td style="color:var(--amber)">19</td></tr>
          <tr><td>1 Gbit (GigabitEthernet)</td><td style="color:var(--green)">4</td></tr>
          <tr><td>10 Gbit</td><td style="color:var(--green)">2</td></tr>
        </table></div>
        <div class="card-hdr" style="margin-bottom:8px">Three Port Roles</div>
        <div class="tbl-wrap" style="margin-bottom:10px"><table class="tbl">
          <tr><th>Role</th><th>State</th><th>Where it appears</th></tr>
          <tr><td style="color:var(--green)">Designated</td><td style="color:var(--green)">Forwarding</td><td>All ports on Root Bridge; best port on each segment toward root</td></tr>
          <tr><td style="color:var(--blue)">Root Port</td><td style="color:var(--blue)">Forwarding</td><td>One per non-root switch — lowest cost path to root</td></tr>
          <tr><td style="color:var(--red)">Non-Designated</td><td style="color:var(--red)">Blocking 🔴</td><td>The port that loses the tiebreaker — breaks the loop</td></tr>
        </table></div>
        <div class="callout callout-info">💡 <strong>Tiebreaker order</strong> when costs are equal:<br>1. Lowest Root Bridge ID<br>2. Lowest Sender Bridge ID<br>3. Lowest Sender Port Priority<br>4. Lowest Sender Port Number</div>
      </div>
    </div>
  </div>

  <!-- PORT STATES -->
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">STP Port States — Why Your Switch LED is Orange for 30 Seconds</div>
    <div class="grid-2">
      <div>
        <svg viewBox="0 0 340 175" width="100%" style="display:block">
          <rect x="0" y="0" width="340" height="175" fill="#0d1117" rx="8" stroke="rgba(56,217,192,0.15)"/>
          <text x="12" y="13" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(56,217,192,0.4)">STP PORT STATES — PLUG IN CABLE → 30s BEFORE DATA FLOWS</text>
          <!-- State boxes -->
          <rect x="8" y="22" width="62" height="38" rx="4" fill="rgba(248,113,113,0.12)" stroke="#f87171" stroke-width="1.5"/>
          <text x="39" y="37" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" font-weight="700" fill="#f87171">Blocking</text>
          <text x="39" y="49" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(248,113,113,0.5)">Max Age 20s</text>
          <path d="M70 41 L84 41" stroke="rgba(255,255,255,0.3)" stroke-width="1.5" fill="none"/>
          <rect x="84" y="22" width="72" height="38" rx="4" fill="rgba(251,191,36,0.12)" stroke="#fbbf24" stroke-width="1.5"/>
          <text x="120" y="35" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" font-weight="700" fill="#fbbf24">Listening</text>
          <text x="120" y="47" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(251,191,36,0.5)">15 seconds</text>
          <text x="120" y="56" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(251,191,36,0.4)">BPDUs only</text>
          <path d="M156 41 L170 41" stroke="rgba(255,255,255,0.3)" stroke-width="1.5" fill="none"/>
          <rect x="170" y="22" width="72" height="38" rx="4" fill="rgba(91,156,246,0.12)" stroke="#5b9cf6" stroke-width="1.5"/>
          <text x="206" y="35" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" font-weight="700" fill="#5b9cf6">Learning</text>
          <text x="206" y="47" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(91,156,246,0.5)">15 seconds</text>
          <text x="206" y="56" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(91,156,246,0.4)">BPDUs + MACs</text>
          <path d="M242 41 L256 41" stroke="rgba(255,255,255,0.3)" stroke-width="1.5" fill="none"/>
          <rect x="256" y="22" width="76" height="38" rx="4" fill="rgba(74,222,128,0.15)" stroke="#4ade80" stroke-width="2"/>
          <text x="294" y="35" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" font-weight="700" fill="#4ade80">Forwarding</text>
          <text x="294" y="47" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(74,222,128,0.6)">Data flows!</text>
          <!-- 30s brace -->
          <rect x="84" y="66" width="162" height="12" rx="3" fill="rgba(248,113,113,0.08)" stroke="rgba(248,113,113,0.2)"/>
          <text x="165" y="75" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#f87171">30 seconds total (15 + 15)</text>
          <!-- Detail rows -->
          <rect x="8" y="84" width="324" height="85" rx="4" fill="rgba(20,25,40,0.5)" stroke="rgba(140,150,180,0.1)"/>
          <text x="18" y="98" font-family="IBM Plex Mono,monospace" font-size="7.5" font-weight="700" fill="rgba(248,113,113,0.8)">Blocking:</text>
          <text x="72" y="98" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(140,150,180,0.7)">Receives BPDUs only. No MAC learning. No data. Loop prevention.</text>
          <text x="18" y="112" font-family="IBM Plex Mono,monospace" font-size="7.5" font-weight="700" fill="rgba(251,191,36,0.8)">Listening:</text>
          <text x="73" y="112" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(140,150,180,0.7)">Sends AND receives BPDUs. Participates in STP election. No data.</text>
          <text x="18" y="126" font-family="IBM Plex Mono,monospace" font-size="7.5" font-weight="700" fill="rgba(91,156,246,0.8)">Learning:</text>
          <text x="72" y="126" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(140,150,180,0.7)">BPDUs + learns MAC addresses into CAM table. Still no data frames.</text>
          <text x="18" y="140" font-family="IBM Plex Mono,monospace" font-size="7.5" font-weight="700" fill="rgba(74,222,128,0.8)">Forwarding:</text>
          <text x="80" y="140" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(140,150,180,0.7)">Full operation. BPDUs + MAC learning + data forwarding. Active.</text>
          <text x="18" y="155" font-family="IBM Plex Mono,monospace" font-size="7.5" font-weight="700" fill="rgba(140,150,180,0.5)">Disabled:</text>
          <text x="70" y="155" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(140,150,180,0.4)">Admin shutdown. Not part of STP.</text>
          <text x="18" y="164" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(251,191,36,0.5)">💡 Cisco LED: AMBER = Listening/Learning state   GREEN = Forwarding state</text>
        </svg>
      </div>
      <div>
        <div class="card-hdr" style="margin-bottom:8px">PortFast — Skip 30 Seconds for Access Ports</div>
        <p>Ports connected to PCs or servers never send BPDUs. There is no reason to run through 30 seconds of Listening/Learning. PortFast jumps straight to Forwarding. It does <strong>NOT</strong> disable STP — if the port receives a BPDU it immediately reverts to normal STP operation.</p>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--cyan)">! Enable PortFast on one interface</div>
          <div style="color:var(--green)">SwitchA(config)#interface fa0/1</div>
          <div style="color:var(--amber)">SwitchA(config-if)#spanning-tree portfast</div>
          <div style="color:var(--muted2)">%Warning: portfast should only be enabled on ports</div>
          <div style="color:var(--muted2)">connected to a single host. Use with CAUTION</div>
          <div> </div>
          <div style="color:var(--cyan)">! Enable PortFast on ALL access ports globally</div>
          <div style="color:var(--green)">SwitchB(config)#spanning-tree portfast default</div>
          <div> </div>
          <div style="color:var(--cyan)">! BPDU Guard — err-disable port if any BPDU arrives</div>
          <div style="color:var(--green)">SwitchA(config-if)#spanning-tree bpduguard enable</div>
          <div> </div>
          <div style="color:var(--cyan)">! Enable BPDU Guard globally for all PortFast ports</div>
          <div style="color:var(--green)">SwitchB(config)#spanning-tree portfast bpduguard default</div>
          <div> </div>
          <div style="color:var(--red)">! If err-disabled: fix root cause then:</div>
          <div style="color:var(--amber)">SwitchA(config-if)#shutdown</div>
          <div style="color:var(--amber)">SwitchA(config-if)#no shutdown</div>
        </div>
        <div class="callout callout-warn" style="margin-top:8px">⚠️ <strong>Never</strong> enable PortFast on a port connected to another switch. The 30-second delay exists precisely to prevent loops during topology changes on switch-to-switch links.</div>
      </div>
    </div>
  </div>

  <!-- SHOW SPANNING-TREE -->
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">show spanning-tree — Real Output from All 3 Switches, Every Field Decoded</div>
    <div class="grid-2">
      <div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.8;margin-bottom:10px">
          <div style="color:var(--amber)">SwitchA#show spanning-tree</div>
          <div style="color:var(--cyan)">VLAN0001</div>
          <div style="color:var(--muted2)">Spanning tree enabled protocol ieee</div>
          <div style="color:var(--cyan)">Root ID  Priority  32769</div>
          <div style="color:var(--muted2)">         Address   000f.34ca.1000</div>
          <div style="color:var(--muted2)">         Cost      19</div>
          <div style="color:var(--muted2)">         Port      19 (FastEthernet0/17)</div>
          <div style="color:var(--muted2)">         Hello 2s  Max Age 20s  Fwd Delay 15s</div>
          <div style="color:var(--cyan)">Bridge ID Priority  32769 (priority 32768 sys-id-ext 1)</div>
          <div style="color:var(--muted2)">          Address   0011.bb0b.3600</div>
          <div style="color:var(--cyan)">Interface  Role  Sts  Cost  Prio.Nbr  Type</div>
          <div style="color:var(--green)">Fa0/14     Desg  FWD  19    128.16    P2p</div>
          <div style="color:var(--green)">Fa0/17     Root  FWD  19    128.19    P2p</div>
        </div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.8">
          <div style="color:var(--amber)">SwitchB#show spanning-tree</div>
          <div style="color:var(--cyan)">VLAN0001</div>
          <div style="color:var(--muted2)">Spanning tree enabled protocol ieee</div>
          <div style="color:var(--cyan)">Root ID  Priority  32769</div>
          <div style="color:var(--muted2)">         Address   000f.34ca.1000</div>
          <div style="color:var(--muted2)">         Cost      19</div>
          <div style="color:var(--muted2)">         Port      18 (FastEthernet0/16)</div>
          <div style="color:var(--cyan)">Bridge ID Priority  32769 (priority 32768 sys-id-ext 1)</div>
          <div style="color:var(--muted2)">          Address   0019.569d.5700</div>
          <div style="color:var(--cyan)">Interface  Role  Sts  Cost  Prio.Nbr  Type</div>
          <div style="color:var(--red)">Fa0/14     Altn  BLK  19    128.16    P2p</div>
          <div style="color:var(--green)">Fa0/16     Root  FWD  19    128.18    P2p</div>
        </div>
      </div>
      <div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.8;margin-bottom:10px">
          <div style="color:var(--amber)">SwitchC#show spanning-tree</div>
          <div style="color:var(--cyan)">VLAN0001</div>
          <div style="color:var(--muted2)">Spanning tree enabled protocol ieee</div>
          <div style="color:var(--green)">Root ID  Priority  32769</div>
          <div style="color:var(--green)">         Address   000f.34ca.1000</div>
          <div style="color:var(--green)">         This bridge is the root</div>
          <div style="color:var(--cyan)">Bridge ID Priority  32769 (priority 32768 sys-id-ext 1)</div>
          <div style="color:var(--muted2)">          Address   000f.34ca.1000</div>
          <div style="color:var(--cyan)">Interface  Role  Sts  Cost  Prio.Nbr  Type</div>
          <div style="color:var(--green)">Fa0/14     Desg  FWD  19    128.14    P2p</div>
          <div style="color:var(--green)">Fa0/16     Desg  FWD  19    128.16    P2p</div>
          <div style="color:var(--muted2)">! Root bridge: ALL ports are Designated</div>
        </div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>Output Field</th><th>Meaning</th></tr>
          <tr><td><code>This bridge is the root</code></td><td style="color:var(--green)">This switch IS the root bridge ✅</td></tr>
          <tr><td><code>Priority 32769</code></td><td>32768 + VLAN 1 = 32769 (sys-id-ext)</td></tr>
          <tr><td><code>Cost 19</code></td><td>FastEthernet cost to reach root bridge</td></tr>
          <tr><td><code>Port 19 (Fa0/17)</code></td><td>Which local port is the Root Port</td></tr>
          <tr><td><code>Desg FWD</code></td><td style="color:var(--green)">Designated, Forwarding ✅</td></tr>
          <tr><td><code>Root FWD</code></td><td style="color:var(--blue)">Root Port, Forwarding ✅</td></tr>
          <tr><td><code>Altn BLK</code></td><td style="color:var(--red)">Alternate (blocked) 🔴</td></tr>
          <tr><td><code>Prio.Nbr 128.16</code></td><td>Port priority 128, port number 16</td></tr>
        </table></div>
      </div>
    </div>
  </div>

  <!-- MANIPULATING STP -->
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">Manipulating STP — Changing Cost and Port Priority</div>
    <div class="grid-2">
      <div>
        <div class="card-hdr" style="margin-bottom:8px">Change Port Cost to Force a Different Root Port</div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--muted2)">! SwitchB currently uses fa0/14 as root port (cost 19)</div>
          <div style="color:var(--muted2)">! Force it to use fa0/16 instead via SwitchC</div>
          <div style="color:var(--green)">SwitchB(config)#interface fa0/14</div>
          <div style="color:var(--amber)">SwitchB(config-if)#spanning-tree cost 500</div>
          <div> </div>
          <div style="color:var(--amber)">SwitchB#show spanning-tree | begin Interface</div>
          <div style="color:var(--red)">Fa0/14  Altn  BLK  500  128.16  P2p  ← blocked!</div>
          <div style="color:var(--green)">Fa0/16  Root  FWD   19  128.18  P2p  ← new root port</div>
          <div> </div>
          <div style="color:var(--amber)">SwitchB#show spanning-tree</div>
          <div style="color:var(--muted2)">Root ID  Cost  38  ← 19+19 (now via SwitchC)</div>
          <div> </div>
          <div style="color:var(--cyan)">! Remove the cost change</div>
          <div style="color:var(--green)">SwitchB(config-if)#no spanning-tree cost 500</div>
        </div>
      </div>
      <div>
        <div class="card-hdr" style="margin-bottom:8px">Change Port Priority (Set on the UPSTREAM Switch)</div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--muted2)">! SwitchB has 2 links to SwitchA: fa0/13 and fa0/14</div>
          <div style="color:var(--muted2)">! Same cost → tiebreak on port number → fa0/13 wins</div>
          <div style="color:var(--muted2)">! To make fa0/14 win: lower priority on SwitchA fa0/14</div>
          <div style="color:var(--cyan)">! KEY: change port-priority on the NEIGHBOR not local!</div>
          <div style="color:var(--green)">SwitchA(config)#interface fa0/14</div>
          <div style="color:var(--amber)">SwitchA(config-if)#spanning-tree port-priority 16</div>
          <div style="color:var(--muted2)">! Default = 128. Lower = better. Must be multiples of 16.</div>
          <div> </div>
          <div style="color:var(--amber)">SwitchB#show spanning-tree | begin Interface</div>
          <div style="color:var(--red)">Fa0/13  Altn  BLK  19  128.15  P2p  ← now blocked</div>
          <div style="color:var(--green)">Fa0/14  Root  FWD  19   16.16  P2p  ← new root port!</div>
          <div> </div>
          <div style="color:var(--amber)">SwitchA#show spanning-tree | begin Interface</div>
          <div style="color:var(--muted2)">Fa0/13  Desg  FWD  19  128.15  P2p</div>
          <div style="color:var(--green)">Fa0/14  Desg  FWD  19   16.16  P2p  ← priority changed</div>
        </div>
      </div>
    </div>
  </div>

  <!-- PVST+ -->
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">PVST+ — Per-VLAN Spanning Tree Plus (Load Balance Your Uplinks)</div>
    <p>Classic STP runs ONE instance for all VLANs. PVST+ runs a <strong>separate STP instance per VLAN</strong> and lets you have a different Root Bridge per VLAN. This means uplinks that would otherwise be blocked can carry traffic for different VLANs — true load balancing.</p>
    <div class="grid-2">
      <div>
        <svg viewBox="0 0 340 215" width="100%" style="display:block">
          <rect x="0" y="0" width="340" height="215" fill="#0d1117" rx="8" stroke="rgba(91,156,246,0.15)"/>
          <text x="12" y="13" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(91,156,246,0.4)">PVST+ — DIFFERENT ROOT PER VLAN = BOTH LINKS ACTIVE</text>
          <!-- Top description -->
          <rect x="8" y="18" width="324" height="36" rx="4" fill="rgba(20,25,40,0.5)" stroke="rgba(140,150,180,0.1)"/>
          <text x="170" y="32" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(74,222,128,0.7)">Without PVST+: ONE root → one uplink blocked → 50% wasted</text>
          <text x="170" y="46" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(91,156,246,0.7)">With PVST+: VLAN10 uses left link, VLAN20 uses right → both 100%!</text>
          <!-- SwitchA left = Root VLAN10 -->
          <rect x="15" y="62" width="100" height="52" rx="6" fill="rgba(74,222,128,0.12)" stroke="#4ade80" stroke-width="2"/>
          <text x="65" y="80" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" font-weight="700" fill="#4ade80">SwitchA</text>
          <text x="65" y="92" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" font-weight="700" fill="#4ade80">Root VLAN10</text>
          <text x="65" y="104" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(74,222,128,0.5)">priority 4096</text>
          <!-- SwitchB right = Root VLAN20 -->
          <rect x="225" y="62" width="100" height="52" rx="6" fill="rgba(91,156,246,0.12)" stroke="#5b9cf6" stroke-width="2"/>
          <text x="275" y="80" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" font-weight="700" fill="#5b9cf6">SwitchB</text>
          <text x="275" y="92" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" font-weight="700" fill="#5b9cf6">Root VLAN20</text>
          <text x="275" y="104" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(91,156,246,0.5)">priority 4096</text>
          <!-- SwitchC bottom centre = non-root -->
          <rect x="120" y="158" width="100" height="52" rx="6" fill="rgba(56,217,192,0.08)" stroke="#38d9c0" stroke-width="1.5"/>
          <text x="170" y="177" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" font-weight="700" fill="#38d9c0">SwitchC</text>
          <text x="170" y="190" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(56,217,192,0.4)">Non-Root both VLANs</text>
          <!-- A-B link: VLAN10 left→right, VLAN20 right→left -->
          <line x1="115" y1="88" x2="225" y2="88" stroke="rgba(255,255,255,0.1)" stroke-width="1.5"/>
          <path d="M115 82 L225 82" stroke="#4ade80" stroke-width="2.5" fill="none" stroke-dasharray="8,4"/>
          <text x="170" y="76" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="#4ade80">VLAN10 traffic (FWD)</text>
          <path d="M225 96 L115 96" stroke="#5b9cf6" stroke-width="2.5" fill="none" stroke-dasharray="8,4"/>
          <text x="170" y="110" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="#5b9cf6">VLAN20 traffic (FWD)</text>
          <!-- Links to SwitchC -->
          <line x1="65" y1="114" x2="140" y2="158" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/>
          <line x1="275" y1="114" x2="200" y2="158" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/>
          <text x="88" y="145" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(74,222,128,0.5)">R VLAN10</text>
          <text x="251" y="145" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(91,156,246,0.5)">R VLAN20</text>
        </svg>
      </div>
      <div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--cyan)">! Create VLANs on all switches</div>
          <div style="color:var(--green)">SwitchA(config)#vlan 10</div>
          <div style="color:var(--green)">SwitchA(config-vlan)#vlan 20</div>
          <div style="color:var(--green)">SwitchA(config-vlan)#vlan 30</div>
          <div style="color:var(--muted2)">! Repeat on SwitchB and SwitchC</div>
          <div> </div>
          <div style="color:var(--cyan)">! Set inter-switch links to trunk</div>
          <div style="color:var(--green)">SwitchA(config)#interface fa0/14</div>
          <div style="color:var(--amber)">SwitchA(config-if)#switchport trunk encapsulation dot1q</div>
          <div style="color:var(--amber)">SwitchA(config-if)#switchport mode trunk</div>
          <div style="color:var(--muted2)">! Repeat for all inter-switch interfaces</div>
          <div> </div>
          <div style="color:var(--cyan)">! Make each switch root for a different VLAN</div>
          <div style="color:var(--green)">SwitchA(config)#spanning-tree vlan 10 priority 4096</div>
          <div style="color:var(--green)">SwitchB(config)#spanning-tree vlan 20 priority 4096</div>
          <div style="color:var(--green)">SwitchC(config)#spanning-tree vlan 30 priority 4096</div>
          <div> </div>
          <div style="color:var(--cyan)">! Verify per-VLAN</div>
          <div style="color:var(--amber)">SwitchA#show spanning-tree vlan 10 | include root</div>
          <div style="color:var(--green)">This bridge is the root</div>
          <div> </div>
          <div style="color:var(--amber)">SwitchA#show spanning-tree summary | begin Name</div>
          <div style="color:var(--cyan)">Name      Blocking  Listening  Learning  Forwarding</div>
          <div style="color:var(--muted2)">VLAN0010       0          0         0          2</div>
          <div style="color:var(--muted2)">VLAN0020       1          0         0          1</div>
          <div style="color:var(--muted2)">VLAN0030       1          0         0          1</div>
        </div>
      </div>
    </div>
  </div>

  <!-- RSTP + MSTP -->
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">RSTP (Rapid-PVST+) and MSTP — Faster Convergence &amp; Scaling</div>
    <div class="grid-2">
      <div>
        <svg viewBox="0 0 340 200" width="100%" style="display:block">
          <rect x="0" y="0" width="340" height="200" fill="#0d1117" rx="8" stroke="rgba(74,222,128,0.15)"/>
          <text x="12" y="13" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(74,222,128,0.4)">STP vs RSTP — PORT STATE COMPARISON</text>
          <text x="83" y="30" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" font-weight="700" fill="rgba(248,113,113,0.8)">Classic STP (802.1D)</text>
          <rect x="10" y="35" width="145" height="22" rx="3" fill="rgba(140,150,180,0.06)" stroke="rgba(140,150,180,0.2)"/>
          <text x="82" y="49" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(140,150,180,0.5)">Disabled</text>
          <rect x="10" y="62" width="145" height="22" rx="3" fill="rgba(248,113,113,0.12)" stroke="#f87171" stroke-width="1"/>
          <text x="82" y="76" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#f87171">Blocking (20s max age)</text>
          <rect x="10" y="89" width="145" height="22" rx="3" fill="rgba(251,191,36,0.12)" stroke="#fbbf24" stroke-width="1"/>
          <text x="82" y="103" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#fbbf24">Listening (15s)</text>
          <rect x="10" y="116" width="145" height="22" rx="3" fill="rgba(91,156,246,0.12)" stroke="#5b9cf6" stroke-width="1"/>
          <text x="82" y="130" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#5b9cf6">Learning (15s)</text>
          <rect x="10" y="143" width="145" height="22" rx="3" fill="rgba(74,222,128,0.15)" stroke="#4ade80" stroke-width="1"/>
          <text x="82" y="157" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#4ade80">Forwarding</text>
          <rect x="10" y="170" width="145" height="22" rx="3" fill="rgba(248,113,113,0.08)" stroke="rgba(248,113,113,0.3)"/>
          <text x="82" y="184" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#f87171">Convergence: 30–50 sec</text>
          <!-- RSTP -->
          <text x="255" y="30" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" font-weight="700" fill="rgba(74,222,128,0.8)">Rapid-PVST+ (802.1w)</text>
          <rect x="188" y="35" width="144" height="49" rx="3" fill="rgba(140,150,180,0.06)" stroke="rgba(140,150,180,0.2)"/>
          <text x="260" y="55" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(140,150,180,0.5)">Discarding</text>
          <text x="260" y="70" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(140,150,180,0.3)">(= Disabled + Blocking merged)</text>
          <path d="M155 73 L188 57" stroke="rgba(248,113,113,0.3)" stroke-width="1" stroke-dasharray="3,2" fill="none"/>
          <path d="M155 100 L188 57" stroke="rgba(251,191,36,0.3)" stroke-width="1" stroke-dasharray="3,2" fill="none"/>
          <rect x="188" y="89" width="144" height="22" rx="3" fill="rgba(91,156,246,0.12)" stroke="#5b9cf6" stroke-width="1"/>
          <text x="260" y="103" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#5b9cf6">Learning (brief)</text>
          <rect x="188" y="116" width="144" height="22" rx="3" fill="rgba(74,222,128,0.15)" stroke="#4ade80" stroke-width="2"/>
          <text x="260" y="130" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" font-weight="700" fill="#4ade80">Forwarding (&lt;1 second!)</text>
          <rect x="188" y="143" width="144" height="22" rx="3" fill="rgba(74,222,128,0.1)" stroke="rgba(74,222,128,0.4)"/>
          <text x="260" y="157" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(74,222,128,0.7)">Proposal/Agreement handshake</text>
          <rect x="188" y="170" width="144" height="22" rx="3" fill="rgba(74,222,128,0.12)" stroke="#4ade80" stroke-width="1"/>
          <text x="260" y="184" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" font-weight="700" fill="#4ade80">Convergence: &lt;1 second!</text>
        </svg>
      </div>
      <div>
        <div class="card-hdr" style="margin-bottom:8px">Enable Rapid-PVST+ (One Command Per Switch)</div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--cyan)">! Enable Rapid-PVST+ on ALL switches</div>
          <div style="color:var(--green)">SwitchA(config)#spanning-tree mode rapid-pvst</div>
          <div style="color:var(--green)">SwitchB(config)#spanning-tree mode rapid-pvst</div>
          <div style="color:var(--green)">SwitchC(config)#spanning-tree mode rapid-pvst</div>
          <div style="color:var(--muted2)">! Must enable on ALL switches together</div>
          <div> </div>
          <div style="color:var(--amber)">SwitchA#show spanning-tree</div>
          <div style="color:var(--green)">Spanning tree enabled protocol rstp</div>
          <div> </div>
          <div style="color:var(--amber)">SwitchA#show spanning-tree summary</div>
          <div style="color:var(--green)">Switch is in rapid-pvst mode</div>
        </div>
        <div class="card-hdr" style="margin-bottom:8px;margin-top:10px">MSTP — Group VLANs into Instances</div>
        <div class="callout callout-info">MSTP (802.1s) maps multiple VLANs to a single STP instance. If you have 500 VLANs but only 2 physical topologies, PVST+ wastes CPU on 500 calculations. MSTP does it in 2.<br><br>Assign VLANs 1-250 → Instance 1, VLANs 251-500 → Instance 2. Each instance can have its own root bridge for load balancing.</div>
        <div class="tbl-wrap" style="margin-top:8px"><table class="tbl">
          <tr><th>Version</th><th>Instances</th><th>Speed</th><th>Use</th></tr>
          <tr><td>PVST+ (default)</td><td>1 per VLAN</td><td style="color:var(--red)">30–50s</td><td>Legacy</td></tr>
          <tr><td style="color:var(--green)">Rapid-PVST+</td><td>1 per VLAN</td><td style="color:var(--green)">&lt;1s</td><td style="color:var(--green)">Recommended</td></tr>
          <tr><td>MSTP (802.1s)</td><td>Groups of VLANs</td><td style="color:var(--green)">&lt;1s</td><td>Large DC/SP</td></tr>
        </table></div>
      </div>
    </div>
  </div>

  <!-- Q&A -->
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">🎯 Interview Q&amp;A — STP, PVST+, RSTP &amp; MSTP</div>
    <div class="qa-list">
      <div class="qa-item"><div class="qa-q" onclick="toggleQA(this)">Q: Walk me through STP step by step in a 3-switch triangle — which port gets blocked and why?<span class="qa-arrow">▶</span></div><div class="qa-a">Step 1 — Root Bridge election: All switches start sending BPDUs claiming "I am root" with their Bridge ID (Priority+MAC). When a switch receives a BPDU with a lower Bridge ID, it stops claiming root. After BPDUs propagate, the switch with lowest Bridge ID wins. Priority is compared first (lower = better). If tied (default 32768 everywhere), the lowest MAC address wins. In our example SwitchC wins with MAC 000f.34ca.1000. Step 2 — Root Ports: Every non-root switch finds its lowest-cost path to root. That port becomes the Root Port (Forwarding). Link cost: 10M=100, 100M=19, 1G=4. If costs tie, compare sender Bridge ID, then port priority, then port number. SwitchA's fa0/17 leads directly to SwitchC (cost 19) → Root Port. SwitchB's fa0/16 leads directly to SwitchC (cost 19) → Root Port. Step 3 — Designated Ports: On each segment, the switch closest to root becomes Designated. Root bridge has all ports Designated. On the SwitchA–SwitchB link: both are equal distance from root (cost 19 each). Tiebreak on Bridge ID → SwitchA (lower MAC 0011 vs 0019) wins → SwitchA fa0/14 = Designated, SwitchB fa0/14 = Non-Designated (BLOCKED). Loop broken.</div></div>
      <div class="qa-item"><div class="qa-q" onclick="toggleQA(this)">Q: What is the difference between PVST+ and Rapid-PVST+? Which should you use?<span class="qa-arrow">▶</span></div><div class="qa-a">PVST+ runs one classic STP (802.1D) instance per VLAN. Convergence = 30-50 seconds (15s Listening + 15s Learning + up to 20s Max Age). It relies entirely on timers — the network waits even if the topology change is already complete. Rapid-PVST+ runs 802.1w RSTP per VLAN. Convergence is under 1 second. Instead of waiting for timers, it uses a Proposal/Agreement handshake: a designated port sends a Proposal BPDU, the neighbor immediately syncs (blocks its own non-edge ports) and replies with Agreement. The port transitions to Forwarding immediately. RSTP also generates its own BPDUs every 2 seconds rather than just forwarding the root's BPDUs, so a failure is detected in 6 seconds (3 missed hellos) instead of 20 seconds. Always use Rapid-PVST+ on modern networks. Command: spanning-tree mode rapid-pvst on every switch. It is backward compatible — if one switch still runs classic STP, RSTP detects this and falls back to classic STP behavior on just that port.</div></div>
      <div class="qa-item"><div class="qa-q" onclick="toggleQA(this)">Q: What is PortFast and BPDU Guard? Why do you need both and what happens if you enable PortFast on a switch-to-switch link?<span class="qa-arrow">▶</span></div><div class="qa-a">PortFast makes a port skip Listening and Learning and jump straight to Forwarding the moment the link comes up. It does NOT disable STP — STP is still active on PortFast ports. If a BPDU arrives on a PortFast port the switch immediately exits PortFast and returns to normal STP. Use it on access ports connected to PCs, servers, printers — devices that never send BPDUs and never need the 30-second wait. BPDU Guard is a safety mechanism that goes with PortFast. If any BPDU arrives on a PortFast port, BPDU Guard immediately err-disables (shuts down) that port. This prevents a rogue switch from being plugged into a PC port and disrupting the STP topology or causing a loop. You need both because: PortFast alone means the port goes straight to forwarding but stays up even if a switch is plugged in — the rogue switch can then start sending BPDUs and potentially become root. BPDU Guard closes that loophole completely. If you enable PortFast on a switch-to-switch link: the port jumps to Forwarding immediately, skipping the 30-second check. If STP has not yet blocked the redundant path, a temporary loop forms — this can cause a broadcast storm lasting 30+ seconds. Never do this on trunk ports.</div></div>
    </div>
  </div>
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">🔬 RSTP (802.1w) vs STP (802.1D) — Rapid Convergence Mechanics</div>
    <div class="callout callout-info">RSTP converges in 1-2 seconds vs 802.1D STP's 30-50 seconds. The key improvement: RSTP uses explicit proposal/agreement handshakes between bridges instead of relying on timers.</div>
    <div class="grid-2">
      <div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>Feature</th><th>802.1D (Classic STP)</th><th>802.1w (RSTP)</th></tr>
          <tr><td>Convergence</td><td style="color:var(--red)">30–50 seconds</td><td style="color:var(--green)">1–2 seconds</td></tr>
          <tr><td>Port States</td><td>5: Disabled/Blocking/Listening/Learning/Forwarding</td><td>3: Discarding/Learning/Forwarding</td></tr>
          <tr><td>Port Roles</td><td>Root/Designated/Blocked</td><td>Root/Designated/Alternate/Backup</td></tr>
          <tr><td>BPDU generation</td><td>Only Root generates; others relay</td><td>Every bridge generates every 2s</td></tr>
          <tr><td>Failure detection</td><td>Max-age 20s + 2× forward-delay</td><td>3 missed hellos = 6s → neighbor dead</td></tr>
          <tr><td>Edge ports</td><td>PortFast (Cisco extension)</td><td>Edge Port (built-in standard)</td></tr>
        </table></div>
        <div class="callout callout-info" style="margin-top:10px"><strong>RSTP Proposal/Agreement handshake:</strong> When a new link comes up, Bridge A sends BPDU with Proposal flag. Bridge B puts all non-edge ports in Discarding (sync — prevents any loop). Bridge B sends Agreement. Bridge A immediately transitions to Forwarding! Total: milliseconds vs 30s.</div>
      </div>
      <div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--amber);font-weight:700">RSTP PORT ROLES:</div>
          <div style="color:var(--green)">Root Port (RP): Best path to root. ONE per non-root switch. Forwarding.</div>
          <div style="color:var(--blue)">Designated Port (DP): Best port on each segment. ONE per segment. Forwarding.</div>
          <div style="color:var(--amber)">Alternate Port: Alternate path to root (backup RP). Discarding.</div>
          <div style="color:var(--cyan)">Backup Port: Backup DP on same segment (hub scenario, rare). Discarding.</div>
          <div style="margin-top:8px;color:var(--amber);font-weight:700">CISCO PVST+ / RAPID-PVST+ CONFIG:</div>
          <div style="color:var(--green)">spanning-tree mode rapid-pvst        ← recommended (per-VLAN RSTP)</div>
          <div style="color:var(--amber)">spanning-tree vlan 10 priority 4096  ← force root for VLAN 10</div>
          <div style="color:var(--muted)">spanning-tree vlan 10 root primary   ← Cisco macro (sets priority)</div>
          <div style="margin-top:6px;color:var(--cyan)">! Per-interface STP features:</div>
          <div style="color:var(--green)">interface Gi0/1</div>
          <div style="color:var(--amber)"> spanning-tree portfast        ← edge port (no TC on link-up)</div>
          <div style="color:var(--amber)"> spanning-tree bpduguard enable ← err-disable if BPDU received!</div>
          <div style="color:var(--amber)"> spanning-tree guard root       ← block superior BPDUs</div>
          <div style="color:var(--blue)">show spanning-tree vlan 10 detail  ← full STP info per VLAN</div>
          <div style="color:var(--blue)">show spanning-tree inconsistentports ← BPDU guard violations</div>
        </div>
      </div>
    </div>
  </div>
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">🔬 VLAN Internals — 802.1Q Trunking, VTP Risks & VLAN Hopping Attack</div>
    <div class="grid-2">
      <div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--amber);font-weight:700">TRUNK PORT CONFIGURATION:</div>
          <div style="color:var(--green)">interface GigabitEthernet0/1</div>
          <div style="color:var(--amber)"> switchport mode trunk</div>
          <div style="color:var(--amber)"> switchport trunk encapsulation dot1q   ← Layer 3 switches only</div>
          <div style="color:var(--amber)"> switchport trunk native vlan 999       ← never use VLAN 1!</div>
          <div style="color:var(--amber)"> switchport trunk allowed vlan 10,20,30 ← whitelist</div>
          <div style="color:var(--blue)">show interfaces trunk                   ← verify all trunks</div>
          <div style="margin-top:8px;color:var(--red);font-weight:700">VLAN DOUBLE-TAGGING ATTACK:</div>
          <div style="color:var(--muted2)">1. Attacker (on native VLAN) sends frame with TWO 802.1Q tags</div>
          <div style="color:var(--muted2)">2. First switch: strips OUTER tag (it's the native VLAN)</div>
          <div style="color:var(--muted2)">3. Inner tag (victim's VLAN) is now the only tag remaining</div>
          <div style="color:var(--red)">4. Frame delivered to VICTIM'S VLAN — VLAN isolation bypassed!</div>
          <div style="color:var(--green)">FIX: Use unused VLAN (e.g., 999) as native VLAN everywhere</div>
          <div style="color:var(--green)">     No user ports in VLAN 999. No access to VLAN 999.</div>
        </div>
      </div>
      <div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--red);font-weight:700">⚠️ VTP DANGER — REVISION NUMBER ATTACK:</div>
          <div style="color:var(--muted2)">VTP (VLAN Trunking Protocol) syncs VLAN database across domain.</div>
          <div style="color:var(--muted2)">The switch with HIGHEST revision number WINS and overwrites all.</div>
          <div style="color:var(--red)">SCENARIO: You add a used switch to your network.</div>
          <div style="color:var(--red)">If its revision number is higher → it OVERWRITES your VLAN DB!</div>
          <div style="color:var(--red)">All VLANs deleted → all trunk ports go to VLAN 1 → OUTAGE!</div>
          <div style="color:var(--green)">PREVENTION:</div>
          <div style="color:var(--green)">1. Reset revision: change domain name twice on new switches</div>
          <div style="color:var(--green)">2. Use VTP Transparent mode (local VLANs, forwards VTP but ignores)</div>
          <div style="color:var(--green)">3. Use VTP Version 3 (MD5 password, primary server concept)</div>
          <div style="color:var(--green)">4. Best: VTP Off (do not participate at all)</div>
          <div style="margin-top:6px;color:var(--blue)">show vtp status             ← version, domain, revision, mode</div>
          <div style="color:var(--blue)">show vlan brief             ← all VLANs + assigned ports</div>
        </div>
      </div>
    </div>
  </div>


</div>

<!-- ═══ CCNA TAB 3: IP ROUTING ═══ -->
<div id="ccna-topic-3" class="topic-panel">
  <div class="topic-hero" style="border-left:4px solid var(--blue)">
    <div class="topic-title">🗺️ IP Routing — Subnetting, Static Routes, Dynamic Protocols &amp; Packet Forwarding</div>
    <div class="topic-sub">VLSM subnetting with full binary math · Administrative Distance · Longest Prefix Match · Static routes · CEF forwarding · Route redistribution · CCIE-level interview traps</div>
  </div>

  <!-- PART 1: Subnetting from first principles -->
  <div class="card">
    <div class="card-hdr">🔢 Subnetting from First Principles — Binary Math You Must Own</div>
    <div class="callout callout-info" style="margin-bottom:12px">Subnetting is dividing a large IP block into smaller networks by borrowing bits from the host portion. The subnet mask tells routers and hosts which part of the address is network and which is host. Every networking interview at CCIE level will test this under time pressure — you need it instant.</div>
    <div class="grid-2">
      <div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:14px;font-family:var(--mono);font-size:11px;line-height:2">
          <div style="color:var(--amber);font-weight:700">THE FORMULA:</div>
          <div style="color:var(--text)">Subnets  = 2<sup>n</sup>  where n = bits borrowed</div>
          <div style="color:var(--text)">Hosts    = 2<sup>h</sup> - 2  where h = host bits remaining</div>
          <div style="color:var(--text)">(-2 for network address + broadcast address)</div>
          <div style="margin-top:8px;color:var(--cyan)">CIDR QUICK REFERENCE TABLE:</div>
          <div style="color:var(--muted)">/24 → 256 addr  · 254 hosts  · mask: 255.255.255.0</div>
          <div style="color:var(--muted)">/25 → 128 addr  · 126 hosts  · mask: 255.255.255.128</div>
          <div style="color:var(--muted)">/26 → 64 addr   · 62 hosts   · mask: 255.255.255.192</div>
          <div style="color:var(--muted)">/27 → 32 addr   · 30 hosts   · mask: 255.255.255.224</div>
          <div style="color:var(--muted)">/28 → 16 addr   · 14 hosts   · mask: 255.255.255.240</div>
          <div style="color:var(--muted)">/29 → 8 addr    · 6 hosts    · mask: 255.255.255.248</div>
          <div style="color:var(--muted)">/30 → 4 addr    · 2 hosts    · mask: 255.255.255.252</div>
          <div style="color:var(--amber)">/31 → 2 addr    · 2 hosts    · RFC3021 point-to-point</div>
          <div style="color:var(--red)">/32 → 1 addr    · 0 hosts    · host route (loopback)</div>
        </div>
      </div>
      <div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:14px;font-family:var(--mono);font-size:10.5px;line-height:2">
          <div style="color:var(--amber);font-weight:700">WORKED EXAMPLE — INTERVIEW STYLE:</div>
          <div style="color:var(--cyan)">Q: Given 172.16.0.0/16, create subnets</div>
          <div style="color:var(--cyan)">   for 500, 200, 100, 50 hosts. Use VLSM.</div>
          <div style="margin-top:6px;color:var(--text)">Step 1: Sort LARGEST to SMALLEST first!</div>
          <div style="color:var(--green)">500 hosts → need 9 bits (2^9-2=510≥500) → /23</div>
          <div style="color:var(--green)">  172.16.0.0/23   hosts: .0.1–.1.254</div>
          <div style="color:var(--green)">200 hosts → need 8 bits (2^8-2=254≥200) → /24</div>
          <div style="color:var(--green)">  172.16.2.0/24   hosts: .2.1–.2.254</div>
          <div style="color:var(--green)">100 hosts → need 7 bits (2^7-2=126≥100) → /25</div>
          <div style="color:var(--green)">  172.16.3.0/25   hosts: .3.1–.3.126</div>
          <div style="color:var(--green)"> 50 hosts → need 6 bits (2^6-2=62≥50) → /26</div>
          <div style="color:var(--green)">  172.16.3.128/26  hosts: .3.129–.3.190</div>
          <div style="color:var(--amber);margin-top:4px">VLSM = no wasted space. /30s for router links.</div>
          <div style="color:var(--green)">  Router link: 172.16.3.192/30  (.193 &amp; .194)</div>
        </div>
      </div>
    </div>

    <!-- Binary subnet math SVG -->
    <div class="card-hdr" style="margin-top:14px;margin-bottom:8px">Binary Math — What the Subnet Mask Actually Means</div>
    <svg viewBox="0 0 700 160" width="100%" style="display:block">
      <rect x="0" y="0" width="700" height="160" rx="8" fill="#0d1117" stroke="rgba(91,156,246,0.15)"/>
      <text x="10" y="14" font-family="IBM Plex Mono,monospace" font-size="8" fill="rgba(91,156,246,0.4)">IP ADDRESS 192.168.10.130 / 26 — BINARY BREAKDOWN</text>
      <!-- Header row -->
      <text x="10" y="30" font-family="IBM Plex Mono,monospace" font-size="8" fill="rgba(140,150,180,0.5)">Octet 1          Octet 2          Octet 3          Octet 4</text>
      <!-- IP address in binary -->
      <text x="10" y="48" font-family="IBM Plex Mono,monospace" font-size="9" fill="rgba(56,217,192,0.5)">IP:   </text>
      <text x="52" y="48" font-family="IBM Plex Mono,monospace" font-size="9" fill="#38d9c0">1 1 0 0 0 0 0 0</text>
      <text x="198" y="48" font-family="IBM Plex Mono,monospace" font-size="9" fill="#38d9c0">1 0 1 0 1 0 0 0</text>
      <text x="344" y="48" font-family="IBM Plex Mono,monospace" font-size="9" fill="#38d9c0">0 0 0 0 1 0 1 0</text>
      <!-- Octet 4 - split between network and host -->
      <text x="453" y="48" font-family="IBM Plex Mono,monospace" font-size="9" fill="#5b9cf6">1 0</text>
      <text x="476" y="48" font-family="IBM Plex Mono,monospace" font-size="9" fill="#f87171">0 0 0 0 1 0</text>
      <!-- Mask -->
      <text x="10" y="68" font-family="IBM Plex Mono,monospace" font-size="9" fill="rgba(251,191,36,0.5)">Mask: </text>
      <text x="52" y="68" font-family="IBM Plex Mono,monospace" font-size="9" fill="#fbbf24">1 1 1 1 1 1 1 1</text>
      <text x="198" y="68" font-family="IBM Plex Mono,monospace" font-size="9" fill="#fbbf24">1 1 1 1 1 1 1 1</text>
      <text x="344" y="68" font-family="IBM Plex Mono,monospace" font-size="9" fill="#fbbf24">1 1 1 1 1 1 1 1</text>
      <text x="453" y="68" font-family="IBM Plex Mono,monospace" font-size="9" fill="#fbbf24">1 1</text>
      <text x="476" y="68" font-family="IBM Plex Mono,monospace" font-size="9" fill="rgba(248,113,113,0.4)">0 0 0 0 0 0</text>
      <!-- AND result -->
      <text x="10" y="90" font-family="IBM Plex Mono,monospace" font-size="9" fill="rgba(74,222,128,0.5)">AND→ </text>
      <text x="52" y="90" font-family="IBM Plex Mono,monospace" font-size="9" fill="#4ade80">1 1 0 0 0 0 0 0</text>
      <text x="198" y="90" font-family="IBM Plex Mono,monospace" font-size="9" fill="#4ade80">1 0 1 0 1 0 0 0</text>
      <text x="344" y="90" font-family="IBM Plex Mono,monospace" font-size="9" fill="#4ade80">0 0 0 0 1 0 1 0</text>
      <text x="453" y="90" font-family="IBM Plex Mono,monospace" font-size="9" fill="#4ade80">1 0</text>
      <text x="476" y="90" font-family="IBM Plex Mono,monospace" font-size="9" fill="rgba(74,222,128,0.4)">0 0 0 0 0 0</text>
      <!-- Labels -->
      <rect x="440" y="96" width="28" height="14" rx="2" fill="rgba(91,156,246,0.15)" stroke="rgba(91,156,246,0.4)" stroke-width="1"/>
      <text x="454" y="106" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="#5b9cf6">NET</text>
      <rect x="472" y="96" width="80" height="14" rx="2" fill="rgba(248,113,113,0.12)" stroke="rgba(248,113,113,0.4)" stroke-width="1"/>
      <text x="512" y="106" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="#f87171">HOST PORTION</text>
      <!-- Result -->
      <rect x="5" y="118" width="690" height="36" rx="4" fill="rgba(0,0,0,0.4)"/>
      <text x="12" y="132" font-family="IBM Plex Mono,monospace" font-size="9" fill="rgba(74,222,128,0.7)">Network address: 192.168.10.128/26  |  Broadcast: 192.168.10.191  |  Host range: .129 – .190</text>
      <text x="12" y="148" font-family="IBM Plex Mono,monospace" font-size="8.5" fill="rgba(91,156,246,0.6)">/26 = 26 network bits (all 1s in mask) + 6 host bits = 2^6 = 64 addresses, 62 usable</text>
    </svg>
  </div>

  <!-- PART 2: Administrative Distance deep dive -->
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">Administrative Distance — When Multiple Protocols Know the Same Route</div>
    <div class="callout callout-info" style="margin-bottom:12px">AD is ONLY relevant when two different routing protocols both have a route to the same destination. The router installs the one from the protocol with the lowest AD. If both have the same AD, the metric (cost) breaks the tie. AD is local to the router — it is NOT advertised to neighbors.</div>
    <div class="grid-2">
      <div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>Route Source</th><th>AD</th><th>Why This Value</th></tr>
          <tr><td style="color:var(--green)">Connected interface</td><td style="color:var(--green);font-weight:700">0</td><td>You are physically on this network — most trusted possible</td></tr>
          <tr><td style="color:var(--green)">Static route</td><td style="color:var(--green);font-weight:700">1</td><td>Admin explicitly configured — almost as trusted as connected</td></tr>
          <tr><td style="color:var(--blue)">EIGRP summary route</td><td style="color:var(--blue)">5</td><td>Cisco auto-summary route — very specific, highly trusted</td></tr>
          <tr><td style="color:var(--blue)">eBGP</td><td style="color:var(--blue)">20</td><td>External BGP — ISP routes, highly preferred for internet routing</td></tr>
          <tr><td style="color:var(--cyan)">EIGRP internal</td><td style="color:var(--cyan)">90</td><td>Cisco proprietary, fast convergence, metric includes BW+delay</td></tr>
          <tr><td style="color:var(--cyan)">IGRP</td><td style="color:var(--cyan)">100</td><td>Legacy Cisco protocol (obsolete)</td></tr>
          <tr><td style="color:var(--amber)">OSPF</td><td style="color:var(--amber)">110</td><td>Open standard, link-state, most common IGP in enterprise</td></tr>
          <tr><td style="color:var(--amber)">IS-IS</td><td style="color:var(--amber)">115</td><td>Preferred by ISPs (runs on L2, not IP — survives IP failures)</td></tr>
          <tr><td style="color:var(--amber)">RIP v1/v2</td><td style="color:var(--amber)">120</td><td>Distance vector, hop count only — no bandwidth awareness</td></tr>
          <tr><td style="color:var(--amber)">EIGRP external</td><td style="color:var(--amber)">170</td><td>Route redistributed INTO EIGRP from another protocol</td></tr>
          <tr><td style="color:var(--red)">iBGP</td><td style="color:var(--red)">200</td><td>Internal BGP — trusted less than IGPs to prevent routing loops</td></tr>
          <tr><td style="color:var(--red)">Unreachable</td><td style="color:var(--red)">255</td><td>Never installed. Used internally by IOS.</td></tr>
        </table></div>
      </div>
      <div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:14px;font-family:var(--mono);font-size:10.5px;line-height:2">
          <div style="color:var(--amber);font-weight:700">AD CONFLICT EXAMPLE:</div>
          <div style="color:var(--muted)">Both OSPF and EIGRP know 10.1.1.0/24:</div>
          <div style="color:var(--blue)">EIGRP internal: 10.1.1.0/24 [90/...]</div>
          <div style="color:var(--amber)">OSPF:          10.1.1.0/24 [110/...]</div>
          <div style="color:var(--green)">→ EIGRP wins (AD 90 &lt; AD 110)</div>
          <div style="color:var(--muted)">  OSPF route sits in background — "backup"</div>
          <div style="margin-top:8px;color:var(--amber);font-weight:700">FLOATING STATIC ROUTE TRICK:</div>
          <div style="color:var(--cyan)">ip route 0.0.0.0 0.0.0.0 10.1.1.1 1      ← primary</div>
          <div style="color:var(--cyan)">ip route 0.0.0.0 0.0.0.0 10.2.2.1 5      ← backup</div>
          <div style="color:var(--muted)">Both have same prefix but AD 1 vs 5.</div>
          <div style="color:var(--muted)">AD-5 route only installs if AD-1 disappears.</div>
          <div style="color:var(--green)">Use AD 5–254 for floating static (above primary)</div>
          <div style="margin-top:8px;color:var(--amber);font-weight:700">FLOATING STATIC BEHIND DYNAMIC ROUTING:</div>
          <div style="color:var(--cyan)">ip route 10.0.0.0 255.0.0.0 Null0 254</div>
          <div style="color:var(--muted)">AD 254 — only installs if ALL dynamic routes</div>
          <div style="color:var(--muted)">to 10.x.x.x are gone. Prevents black holes.</div>
        </div>
        <div class="callout callout-warn" style="margin-top:8px">⚠️ <strong>AD vs Metric:</strong> AD decides WHICH protocol's route wins. Metric decides WHICH PATH within the same protocol wins. You cannot compare OSPF metric (110) to EIGRP metric (90) — those numbers mean completely different things.</div>
      </div>
    </div>
  </div>

  <!-- PART 3: Longest Prefix Match deep dive -->
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">Longest Prefix Match — The Fundamental Routing Algorithm</div>
    <div class="callout callout-info" style="margin-bottom:12px">When a router receives a packet, it compares the destination IP against every route in its table using bitwise AND. The route with the most matching bits (longest prefix = highest /N) wins. This is how specific routes override general routes, and how default routes work as a catch-all.</div>
    <div class="grid-2">
      <div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:14px;font-family:var(--mono);font-size:10.5px;line-height:1.9;margin-bottom:10px">
          <div style="color:var(--cyan)">Routing table (show ip route):</div>
          <div>C    <span style="color:var(--green)">192.168.1.0/24</span>   directly connected Gi0/0</div>
          <div>S    <span style="color:var(--blue)">10.0.0.0/8</span>       [1/0] via 192.168.1.254</div>
          <div>O    <span style="color:var(--amber)">10.10.0.0/16</span>    [110/20] via 192.168.1.2</div>
          <div>O    <span style="color:var(--amber)">10.10.10.0/24</span>   [110/30] via 192.168.1.3</div>
          <div>S    <span style="color:var(--cyan)">10.10.10.5/32</span>   [1/0] via 192.168.1.4</div>
          <div>S*   <span style="color:var(--muted2)">0.0.0.0/0</span>        [1/0] via 192.168.1.1</div>
        </div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>Packet Dst</th><th>Matches</th><th>Best Match</th><th>Next Hop</th></tr>
          <tr><td style="color:var(--cyan)">10.10.10.5</td><td>/8, /16, /24, /32</td><td style="color:var(--green)">/32 ← most specific</td><td>192.168.1.4</td></tr>
          <tr><td style="color:var(--cyan)">10.10.10.99</td><td>/8, /16, /24</td><td style="color:var(--green)">/24</td><td>192.168.1.3</td></tr>
          <tr><td style="color:var(--cyan)">10.10.50.1</td><td>/8, /16</td><td style="color:var(--green)">/16</td><td>192.168.1.2</td></tr>
          <tr><td style="color:var(--cyan)">10.99.0.1</td><td>/8 only</td><td style="color:var(--green)">/8</td><td>192.168.1.254</td></tr>
          <tr><td style="color:var(--cyan)">8.8.8.8</td><td>/0 only (default)</td><td style="color:var(--green)">/0 (default)</td><td>192.168.1.1</td></tr>
          <tr><td style="color:var(--red)">172.16.0.1</td><td>none (no default if removed)</td><td style="color:var(--red)">no match → DROP</td><td>ICMP Unreachable</td></tr>
        </table></div>
      </div>
      <div>
        <div class="card-hdr" style="margin-bottom:8px">CEF — Cisco Express Forwarding (How It Actually Happens)</div>
        <div class="callout callout-info" style="margin-bottom:8px">Process switching (original): every packet interrupts the CPU. Route-cache switching: first packet CPU, rest fast-switch. <strong>CEF (default since IOS 12.x):</strong> pre-builds two tables in hardware — FIB (Forwarding Information Base) mirrors routing table, Adjacency Table has pre-built L2 headers for each next-hop. Packets never touch the CPU.</div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>Table</th><th>Contains</th><th>Built From</th></tr>
          <tr><td style="color:var(--blue)">FIB</td><td>Dest prefix → next-hop IP + outgoing interface</td><td>Routing table (RIB)</td></tr>
          <tr><td style="color:var(--cyan)">Adjacency Table</td><td>Next-hop IP → pre-built L2 header (src+dst MAC)</td><td>ARP table</td></tr>
        </table></div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:10px;font-family:var(--mono);font-size:10.5px;line-height:1.8;margin-top:8px">
          <div style="color:var(--cyan)">! CEF verification</div>
          <div style="color:var(--blue)">show ip cef                     ← FIB table</div>
          <div style="color:var(--blue)">show ip cef 10.10.10.0 detail   ← specific prefix</div>
          <div style="color:var(--blue)">show adjacency detail            ← pre-built L2 headers</div>
          <div style="color:var(--blue)">show ip cef exact-route src dst  ← trace exact path</div>
          <div style="color:var(--amber);margin-top:6px">! If CEF disabled (troubleshoot high CPU):</div>
          <div style="color:var(--red)">show ip interface | include CEF  ← check per-interface</div>
          <div style="color:var(--amber)">ip cef                          ← enable globally</div>
          <div style="color:var(--amber)">ip route-cache cef              ← enable per-interface</div>
        </div>
      </div>
    </div>
  </div>

  <!-- PART 4: Static Routes - complete -->
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">Static Routes — Every Type with When to Use Each</div>
    <div class="grid-2">
      <div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>Type</th><th>Syntax</th><th>Use Case</th><th>Risk</th></tr>
          <tr><td style="color:var(--blue)">Standard static</td><td style="font-family:var(--mono);font-size:9px">ip route 10.0.0.0 255.0.0.0 192.168.1.1</td><td>Small networks, specific path</td><td>No auto-failover</td></tr>
          <tr><td style="color:var(--cyan)">Recursive static</td><td style="font-family:var(--mono);font-size:9px">ip route 10.0.0.0 255.0.0.0 1.2.3.4</td><td>Next-hop not directly connected</td><td>Recursive lookup overhead</td></tr>
          <tr><td style="color:var(--amber)">Directly attached</td><td style="font-family:var(--mono);font-size:9px">ip route 10.0.0.0 255.0.0.0 Gi0/0</td><td>Point-to-point links only</td><td>On Ethernet: sends ARP for every destination IP!</td></tr>
          <tr><td style="color:var(--amber)">Fully specified</td><td style="font-family:var(--mono);font-size:9px">ip route 10.0.0.0 255.0.0.0 Gi0/0 192.168.1.1</td><td>Best practice on Ethernet</td><td>None — specify both interface AND next-hop</td></tr>
          <tr><td style="color:var(--green)">Default route</td><td style="font-family:var(--mono);font-size:9px">ip route 0.0.0.0 0.0.0.0 192.168.1.1</td><td>Gateway of last resort</td><td>All unknown traffic goes this way</td></tr>
          <tr><td style="color:var(--red)">Null route (blackhole)</td><td style="font-family:var(--mono);font-size:9px">ip route 10.0.0.0 255.0.0.0 Null0</td><td>Drop traffic, prevent routing loops</td><td>Silently drops — no ICMP unreachable by default</td></tr>
          <tr><td style="color:var(--muted2)">Floating static</td><td style="font-family:var(--mono);font-size:9px">ip route 0.0.0.0 0.0.0.0 10.2.2.1 200</td><td>Backup path when primary fails</td><td>AD must be higher than primary protocol</td></tr>
        </table></div>
        <div class="callout callout-warn" style="margin-top:8px">⚠️ <strong>CCIE trap — directly attached static on Ethernet:</strong> <code>ip route 10.0.0.0/8 Gi0/0</code> causes the router to send an ARP request for EVERY destination IP in 10.0.0.0/8 — the ARP table explodes (called an "ARP flooding" or "proxy ARP storm"). Always use fully specified static routes on multi-access Ethernet segments.</div>
      </div>
      <div>
        <div class="card-hdr" style="margin-bottom:8px">Route Redistribution — Moving Routes Between Protocols</div>
        <div class="callout callout-info" style="margin-bottom:8px">Redistribution injects routes from one routing protocol into another. Common at network boundaries — e.g. redistributing OSPF routes into BGP for Internet advertisement, or RIP into OSPF when migrating legacy networks.</div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10.5px;line-height:1.9">
          <div style="color:var(--cyan)">! Redistribute connected routes into OSPF</div>
          <div style="color:var(--green)">router ospf 1</div>
          <div style="color:var(--green)"> redistribute connected subnets</div>
          <div style="color:var(--cyan);margin-top:6px">! Redistribute OSPF into BGP (for advertisement)</div>
          <div style="color:var(--green)">router bgp 65001</div>
          <div style="color:var(--green)"> redistribute ospf 1 route-map OSPF_TO_BGP</div>
          <div style="color:var(--cyan);margin-top:6px">! Redistribute with metric — EIGRP requires 5-tuple</div>
          <div style="color:var(--green)">router eigrp 1</div>
          <div style="color:var(--green)"> redistribute ospf 1 metric 10000 100 255 1 1500</div>
          <div style="color:var(--muted)">                   ↑BW  ↑delay ↑rel ↑load ↑MTU</div>
          <div style="color:var(--cyan);margin-top:6px">! Check redistributed routes</div>
          <div style="color:var(--blue)">show ip route | include E (EIGRP ext = EX)</div>
          <div style="color:var(--blue)">show ip route | include E 2 (OSPF ext E2)</div>
        </div>
        <div class="callout callout-warn" style="margin-top:8px">⚠️ <strong>Redistribution loop danger:</strong> If you redistribute OSPF→EIGRP on Router A and EIGRP→OSPF on Router B, routes can bounce back and forth infinitely. Always use route-maps with tags to mark redistributed routes and filter them from being redistributed back.</div>
      </div>
    </div>
  </div>

  <!-- PART 5: show ip route full decode -->
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">Reading <code>show ip route</code> — Every Field Decoded</div>
    <svg viewBox="0 0 700 200" width="100%" style="display:block">
      <rect x="0" y="0" width="700" height="200" rx="8" fill="#0d1117" stroke="rgba(74,222,128,0.12)"/>
      <text x="10" y="16" font-family="IBM Plex Mono,monospace" font-size="9" fill="rgba(74,222,128,0.5)">Router# show ip route</text>
      <!-- Codes -->
      <text x="10" y="33" font-family="IBM Plex Mono,monospace" font-size="8" fill="rgba(140,150,180,0.4)">Codes: C=Connected  S=Static  O=OSPF  B=BGP  R=RIP  D=EIGRP  i=IS-IS  * =default  E2=OSPF ext type2</text>
      <!-- Route lines with annotations -->
      <text x="10" y="55" font-family="IBM Plex Mono,monospace" font-size="9" fill="#4ade80">C</text>
      <text x="24" y="55" font-family="IBM Plex Mono,monospace" font-size="9" fill="#38d9c0">192.168.1.0/24</text>
      <text x="160" y="55" font-family="IBM Plex Mono,monospace" font-size="9" fill="rgba(140,150,180,0.6)">is directly connected, GigabitEthernet0/0</text>
      <text x="10" y="67" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(74,222,128,0.4)">↑code                 ↑no AD/metric shown for connected routes</text>

      <text x="10" y="88" font-family="IBM Plex Mono,monospace" font-size="9" fill="#5b9cf6">S</text>
      <text x="24" y="88" font-family="IBM Plex Mono,monospace" font-size="9" fill="#38d9c0">10.0.0.0/8</text>
      <text x="125" y="88" font-family="IBM Plex Mono,monospace" font-size="9" fill="#fbbf24">[1/0]</text>
      <text x="165" y="88" font-family="IBM Plex Mono,monospace" font-size="9" fill="rgba(140,150,180,0.6)">via 192.168.1.254</text>
      <text x="10" y="100" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(91,156,246,0.4)">↑Static          ↑AD=1, Metric=0 ↑next-hop IP</text>

      <text x="10" y="120" font-family="IBM Plex Mono,monospace" font-size="9" fill="#fbbf24">O</text>
      <text x="24" y="120" font-family="IBM Plex Mono,monospace" font-size="9" fill="#38d9c0">10.10.10.0/24</text>
      <text x="147" y="120" font-family="IBM Plex Mono,monospace" font-size="9" fill="#fbbf24">[110/20]</text>
      <text x="200" y="120" font-family="IBM Plex Mono,monospace" font-size="9" fill="rgba(140,150,180,0.6)">via 192.168.1.2,</text>
      <text x="320" y="120" font-family="IBM Plex Mono,monospace" font-size="9" fill="rgba(56,217,192,0.5)">00:05:43,</text>
      <text x="390" y="120" font-family="IBM Plex Mono,monospace" font-size="9" fill="rgba(167,139,250,0.6)">GigabitEthernet0/0</text>
      <text x="10" y="132" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(251,191,36,0.4)">↑OSPF           ↑AD=110, Cost=20  ↑next-hop        ↑age (h:m:s)  ↑egress interface</text>

      <text x="10" y="152" font-family="IBM Plex Mono,monospace" font-size="9" fill="#f87171">O E2</text>
      <text x="40" y="152" font-family="IBM Plex Mono,monospace" font-size="9" fill="#38d9c0">0.0.0.0/0</text>
      <text x="130" y="152" font-family="IBM Plex Mono,monospace" font-size="9" fill="#fbbf24">[110/1]</text>
      <text x="175" y="152" font-family="IBM Plex Mono,monospace" font-size="9" fill="rgba(140,150,180,0.6)">via 192.168.1.1, 00:01:10, GigabitEthernet0/0</text>
      <text x="10" y="164" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(248,113,113,0.4)">↑OSPF External Type2 ← cost stays fixed no matter how many hops inside OSPF domain</text>

      <text x="10" y="184" font-family="IBM Plex Mono,monospace" font-size="9" fill="#5b9cf6">S*</text>
      <text x="32" y="184" font-family="IBM Plex Mono,monospace" font-size="9" fill="#38d9c0">0.0.0.0/0</text>
      <text x="128" y="184" font-family="IBM Plex Mono,monospace" font-size="9" fill="#fbbf24">[1/0]</text>
      <text x="160" y="184" font-family="IBM Plex Mono,monospace" font-size="9" fill="rgba(140,150,180,0.6)">via 192.168.1.1  ← S* = static default route (candidate default)</text>
    </svg>
  </div>

  <!-- PART 6: EVE-NG Lab -->
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">🔬 EVE-NG Lab — Multi-Router Topology with Static + OSPF</div>
    <svg viewBox="0 0 700 175" width="100%" style="display:block">
      <rect x="0" y="0" width="700" height="175" rx="8" fill="#0d1117" stroke="rgba(91,156,246,0.1)"/>
      <text x="10" y="14" font-family="IBM Plex Mono,monospace" font-size="8" fill="rgba(91,156,246,0.4)">LAB TOPOLOGY — STATIC + OSPF + REDISTRIBUTION</text>
      <!-- PC -->
      <rect x="5" y="60" width="60" height="45" rx="5" fill="rgba(56,217,192,0.1)" stroke="rgba(56,217,192,0.3)" stroke-width="1"/>
      <text x="35" y="78" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#38d9c0">PC-A</text>
      <text x="35" y="89" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(56,217,192,0.4)">10.1.1.10/24</text>
      <text x="35" y="99" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(56,217,192,0.3)">GW: 10.1.1.1</text>
      <!-- R1 -->
      <rect x="100" y="50" width="90" height="60" rx="6" fill="rgba(91,156,246,0.1)" stroke="rgba(91,156,246,0.4)" stroke-width="1.5"/>
      <text x="145" y="68" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#5b9cf6">R1</text>
      <text x="145" y="80" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(91,156,246,0.5)">Gi0/0: 10.1.1.1/24</text>
      <text x="145" y="91" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(91,156,246,0.5)">Gi0/1: 12.12.12.1/30</text>
      <text x="145" y="101" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(251,191,36,0.4)">OSPF Area 0</text>
      <!-- R2 -->
      <rect x="280" y="50" width="100" height="60" rx="6" fill="rgba(74,222,128,0.1)" stroke="rgba(74,222,128,0.4)" stroke-width="1.5"/>
      <text x="330" y="68" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#4ade80">R2</text>
      <text x="330" y="80" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(74,222,128,0.5)">Gi0/0: 12.12.12.2/30</text>
      <text x="330" y="91" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(74,222,128,0.5)">Gi0/1: 23.23.23.1/30</text>
      <text x="330" y="101" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(251,191,36,0.4)">OSPF Area 0</text>
      <!-- R3 -->
      <rect x="475" y="50" width="100" height="60" rx="6" fill="rgba(251,191,36,0.1)" stroke="rgba(251,191,36,0.4)" stroke-width="1.5"/>
      <text x="525" y="68" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#fbbf24">R3</text>
      <text x="525" y="80" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(251,191,36,0.5)">Gi0/0: 23.23.23.2/30</text>
      <text x="525" y="91" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(251,191,36,0.5)">Gi0/1: 10.3.3.1/24</text>
      <text x="525" y="101" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(251,191,36,0.4)">OSPF Area 0</text>
      <!-- PC-B -->
      <rect x="615" y="60" width="80" height="45" rx="5" fill="rgba(248,113,113,0.1)" stroke="rgba(248,113,113,0.3)" stroke-width="1"/>
      <text x="655" y="78" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#f87171">PC-B</text>
      <text x="655" y="89" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(248,113,113,0.4)">10.3.3.10/24</text>
      <text x="655" y="99" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(248,113,113,0.3)">GW: 10.3.3.1</text>
      <!-- Links -->
      <line x1="65" y1="82" x2="100" y2="82" stroke="rgba(56,217,192,0.4)" stroke-width="1.5"/>
      <line x1="190" y1="80" x2="280" y2="80" stroke="rgba(91,156,246,0.5)" stroke-width="1.5"/>
      <text x="235" y="72" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(140,150,180,0.4)">12.12.12.0/30</text>
      <line x1="380" y1="80" x2="475" y2="80" stroke="rgba(74,222,128,0.5)" stroke-width="1.5"/>
      <text x="427" y="72" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(140,150,180,0.4)">23.23.23.0/30</text>
      <line x1="575" y1="82" x2="615" y2="82" stroke="rgba(248,113,113,0.4)" stroke-width="1.5"/>
      <!-- Config box -->
      <rect x="5" y="122" width="690" height="48" rx="4" fill="rgba(0,0,0,0.4)"/>
      <text x="10" y="136" font-family="IBM Plex Mono,monospace" font-size="8.5" fill="rgba(91,156,246,0.6)">R1 config:  router ospf 1  |  network 12.12.12.0 0.0.0.3 area 0  |  network 10.1.1.0 0.0.0.255 area 0</text>
      <text x="10" y="150" font-family="IBM Plex Mono,monospace" font-size="8.5" fill="rgba(74,222,128,0.6)">PC-A can ping PC-B once OSPF converges. Verify: show ip ospf neighbor | show ip route | traceroute 10.3.3.10</text>
      <text x="10" y="164" font-family="IBM Plex Mono,monospace" font-size="8.5" fill="rgba(251,191,36,0.5)">R1 sees: O 10.3.3.0/24 [110/3] via 12.12.12.2   ← cost = 1 (R1-R2) + 1 (R2-R3) + 1 (R3-LAN) = 3</text>
    </svg>
  </div>

  <!-- PART 7: CCIE Q&A -->
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">🎯 CCIE-Level Interview Q&amp;A — IP Routing</div>
    <div class="qa-list">
      <div class="qa-item">
        <div class="qa-q" onclick="toggleQA(this)">Q: What is the difference between the routing table (RIB), the forwarding table (FIB), and the CEF adjacency table? Why does Cisco separate them?<span class="qa-arrow">▶</span></div>
        <div class="qa-a"><strong>RIB (Routing Information Base) = show ip route:</strong> The full routing table maintained by the control plane. Contains routes from all protocols, organized by AD and metric. Multiple routes to the same prefix may exist (e.g. OSPF and EIGRP both have 10.0.0.0/8) — only the best is installed. This runs on the route processor (RP) CPU. <strong>FIB (Forwarding Information Base) = show ip cef:</strong> A compiled, hardware-optimized copy of the best routes from the RIB. Built for fast lookup — uses a trie (prefix tree) structure for O(log n) or O(1) lookup. Lives in line card ASICs or shared memory, not the CPU. Updated whenever RIB changes. <strong>Adjacency Table = show adjacency:</strong> Contains pre-built Layer 2 headers (src MAC, dst MAC, EtherType) for each next-hop. When CEF forwards a packet, it looks up the FIB for the outgoing interface and next-hop, then stamps the pre-built L2 header from the adjacency table onto the packet — no ARP lookup needed. <strong>Why separate:</strong> Decoupling control plane (RIB, routing protocols, CPU) from data plane (FIB, ASIC forwarding) is fundamental to modern networking. Route processor can be busy running BGP but packets still forward at line rate. This is also the foundation of SDN — you can centralize the control plane while keeping distributed forwarding.</div>
      </div>
      <div class="qa-item">
        <div class="qa-q" onclick="toggleQA(this)">Q: R1 has two routes to 10.0.0.0/8 — one via OSPF (AD 110) and one via EIGRP (AD 90). EIGRP wins and is installed. Now a more specific OSPF route 10.10.0.0/16 appears. Which route is used for 10.10.5.1?<span class="qa-arrow">▶</span></div>
        <div class="qa-a">For destination 10.10.5.1, the router performs longest prefix match first — before considering AD. It has two candidate routes: EIGRP 10.0.0.0/8 (/8 = 8 matching bits) and OSPF 10.10.0.0/16 (/16 = 16 matching bits). The OSPF /16 route wins because it is MORE SPECIFIC — it matches more bits of the destination address. AD is only compared between routes of the SAME prefix length. So even though EIGRP has AD 90 and OSPF has AD 110, the OSPF /16 route wins because longest prefix match happens FIRST, before AD comparison. This is a critical distinction: prefix length always beats AD. The EIGRP /8 route is still used for 10.99.x.x destinations (where only /8 matches).</div>
      </div>
      <div class="qa-item">
        <div class="qa-q" onclick="toggleQA(this)">Q: How do you verify that a packet from 192.168.1.10 to 8.8.8.8 is taking the expected path through your router? Walk me through the commands.<span class="qa-arrow">▶</span></div>
        <div class="qa-a">Step-by-step verification: ①<code>show ip route 8.8.8.8</code> — identifies which route matches (longest prefix). Shows next-hop IP and egress interface. ②<code>show ip cef 8.8.8.8 detail</code> — shows the FIB entry and which adjacency is being used for forwarding. ③<code>show adjacency [interface] detail</code> — shows the pre-built L2 header (which MAC addresses will be stamped on the outgoing frame). ④<code>traceroute 8.8.8.8 source 192.168.1.10</code> — verifies the actual hop-by-hop path and round-trip times. ⑤<code>show ip cef exact-route 192.168.1.10 8.8.8.8</code> — the most specific command, shows exact FIB lookup for this src→dst pair (useful with load balancing). ⑥<code>debug ip packet detail</code> — last resort in production, shows per-packet forwarding decisions. Use with access-list filter to limit output, and always <code>undebug all</code> after.</div>
      </div>
      <div class="qa-item">
        <div class="qa-q" onclick="toggleQA(this)">Q: What is a null route and why is it used in production networks? Give two real-world use cases.<span class="qa-arrow">▶</span></div>
        <div class="qa-a">A null route (<code>ip route x.x.x.x y.y.y.y Null0</code>) sends matching traffic to Null0 — a virtual interface that silently drops packets. No ICMP unreachable is generated by default (though you can enable it with <code>ip icmp rate-limit unreachable</code>). <strong>Use case 1 — Summary route black-holing:</strong> If R1 advertises a summary 10.0.0.0/8 to neighbors but only has specific /24 routes internally, what happens for 10.99.0.1 (a hole in the summary)? Without a null route, R1 has no specific route, falls through to default, which may send the packet back toward the neighbor — a routing loop. Solution: <code>ip route 10.0.0.0 255.0.0.0 Null0 254</code>. Any destination not matched by a specific route inside 10.0.0.0/8 hits the null route and is dropped, preventing the loop. <strong>Use case 2 — DDoS mitigation (RTBH):</strong> Remotely Triggered Black Hole filtering. When under DDoS attack on IP 1.2.3.4, inject a /32 null route for 1.2.3.4 via BGP community to all edge routers. Traffic destined for that IP is dropped at the network edge instead of overwhelming your server. Akamai and all major ISPs use this technique operationally.</div>
      </div>
    </div>
  </div>
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">🔬 CEF (Cisco Express Forwarding) — How Routers Forward at Line Rate</div>
    <div class="callout callout-info">Process switching, fast switching, and CEF are three forwarding mechanisms. CEF pre-computes ALL forwarding decisions so the CPU is not involved in the data plane at all.</div>
    <div class="grid-2">
      <div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--red);font-weight:700">PROCESS SWITCHING (oldest, slowest):</div>
          <div style="color:var(--muted2)">Every packet → CPU interrupt → routing table lookup → forward</div>
          <div style="color:var(--muted2)">CPU processes each packet individually. Used for exception traffic:</div>
          <div style="color:var(--muted2)">TTL expired, IP options, first ICMP to self, etc.</div>
          <div style="color:var(--amber);font-weight:700;margin-top:6px">FAST SWITCHING (route cache):</div>
          <div style="color:var(--muted2)">First packet of each flow → process switch → result cached.</div>
          <div style="color:var(--muted2)">Subsequent packets → cache lookup (much faster).</div>
          <div style="color:var(--muted2)">Cache invalidated when routing table changes.</div>
          <div style="color:var(--green);font-weight:700;margin-top:6px">CEF — CISCO EXPRESS FORWARDING (default):</div>
          <div style="color:var(--cyan)">Two pre-built hardware tables:</div>
          <div style="color:var(--text)">FIB (Forwarding Information Base):</div>
          <div style="color:var(--muted2)">  Exact mirror of routing table in TCAM format</div>
          <div style="color:var(--muted2)">  O(1) longest-prefix-match lookup in hardware</div>
          <div style="color:var(--text)">Adjacency Table:</div>
          <div style="color:var(--muted2)">  Pre-built L2 rewrite headers (dst MAC, src MAC, EtherType)</div>
          <div style="color:var(--muted2)">  One entry per directly connected next-hop</div>
          <div style="color:var(--green)">Result: packets forwarded in hardware at LINE RATE. No CPU!</div>
        </div>
      </div>
      <div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--amber);font-weight:700">ADMINISTRATIVE DISTANCE (AD) — Route Preference:</div>
          <div style="color:var(--green)">Connected:     0   ← most trusted (directly attached)</div>
          <div style="color:var(--green)">Static:        1</div>
          <div style="color:var(--cyan)">EIGRP Summary: 5</div>
          <div style="color:var(--cyan)">EBGP:         20</div>
          <div style="color:var(--blue)">EIGRP:        90</div>
          <div style="color:var(--blue)">OSPF:        110</div>
          <div style="color:var(--amber)">IS-IS:       115</div>
          <div style="color:var(--amber)">RIP:         120</div>
          <div style="color:var(--red)">IBGP:        200</div>
          <div style="color:var(--red)">Unknown:     255  ← never used for forwarding</div>
          <div style="margin-top:8px;color:var(--cyan);font-weight:700">CEF ADJACENCY TYPES:</div>
          <div style="color:var(--green)">Normal:   next-hop in ARP table, L2 header ready</div>
          <div style="color:var(--amber)">Glean:    destination is local subnet, ARP needed first</div>
          <div style="color:var(--red)">Drop:     no route, L3 ACL deny → null adjacency</div>
          <div style="color:var(--red)">Punt:     requires CPU (TTL=1, IP options, etc.)</div>
          <div style="margin-top:6px;color:var(--blue)">show ip cef 10.0.0.0/24      ← FIB entry</div>
          <div style="color:var(--blue)">show adjacency detail          ← pre-built L2 headers</div>
          <div style="color:var(--blue)">show ip cef exact-route src dst ← which path for flow</div>
        </div>
      </div>
    </div>
  </div>
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">🔬 Policy-Based Routing (PBR) & Floating Static Routes</div>
    <div class="grid-2">
      <div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--cyan);font-weight:700">PBR — route by SOURCE IP (not destination):</div>
          <div style="color:var(--muted2)">Use case: Finance (192.168.10/24) → ISP1, all others → ISP2</div>
          <div style="color:var(--green)">ip access-list standard FINANCE</div>
          <div style="color:var(--amber)"> permit 192.168.10.0 0.0.0.255</div>
          <div style="color:var(--green)">route-map PBR permit 10</div>
          <div style="color:var(--amber)"> match ip address FINANCE</div>
          <div style="color:var(--amber)"> set ip next-hop 10.0.0.1        ← ISP1 gateway</div>
          <div style="color:var(--green)">route-map PBR permit 20          ← all others: normal routing</div>
          <div style="color:var(--green)">interface GigabitEthernet0/0     ← LAN ingress!</div>
          <div style="color:var(--amber)"> ip policy route-map PBR</div>
          <div style="color:var(--blue)">show ip policy                   ← verify PBR active</div>
          <div style="color:var(--blue)">show route-map PBR               ← hit counters</div>
        </div>
      </div>
      <div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--amber);font-weight:700">FLOATING STATIC ROUTES (backup routes):</div>
          <div style="color:var(--muted2)">A static route with higher AD than the primary protocol.</div>
          <div style="color:var(--muted2)">Hidden while primary route exists. Appears on primary failure.</div>
          <div style="color:var(--green)">! Primary via OSPF (AD 110):</div>
          <div style="color:var(--muted2)">O  10.10.10.0/24 [110/2] via 192.168.1.1</div>
          <div style="color:var(--green)">! Floating static (AD 200 > 110 → hidden):</div>
          <div style="color:var(--amber)">ip route 10.10.10.0 255.255.255.0 192.168.2.1 200</div>
          <div style="color:var(--muted2)">! OSPF route gone → static activates automatically</div>
          <div style="margin-top:8px;color:var(--cyan);font-weight:700">IP SLA + TRACKING for reliable static:</div>
          <div style="color:var(--green)">ip sla 1</div>
          <div style="color:var(--amber)"> icmp-echo 8.8.8.8 source-interface Gi0/0</div>
          <div style="color:var(--amber)"> frequency 10</div>
          <div style="color:var(--green)">ip sla schedule 1 life forever start-time now</div>
          <div style="color:var(--green)">track 1 ip sla 1 reachability</div>
          <div style="color:var(--amber)">ip route 0.0.0.0 0.0.0.0 10.0.0.1 track 1</div>
          <div style="color:var(--muted)">! Route removed if 8.8.8.8 unreachable → failover!</div>
        </div>
      </div>
    </div>
  </div>


</div>

<div id="ccna-topic-6" class="topic-panel">
  <div class="topic-hero" style="border-left:4px solid var(--red)">
    <div class="topic-title">🏷️ ACLs &amp; Route Filtering — Prefix Lists, Route-Maps &amp; Traffic Policy</div>
    <div class="topic-sub">Standard vs Extended ACLs · Named ACLs · Prefix Lists with ge/le · Route-maps · BGP community · PBR · real production examples</div>
  </div>
  <div class="grid-2">
    <div>
      <div class="card">
        <div class="card-hdr">ACL Types — Complete Comparison</div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>Type</th><th>Number Range</th><th>Match On</th><th>Granularity</th></tr>
          <tr><td style="color:var(--blue)">Standard IP</td><td>1-99, 1300-1999</td><td>Source IP only</td><td>Low</td></tr>
          <tr><td style="color:var(--amber)">Extended IP</td><td>100-199, 2000-2699</td><td>Src+Dst IP, Port, Protocol</td><td>High</td></tr>
          <tr><td style="color:var(--green)">Named Standard</td><td>Any name</td><td>Source IP only</td><td>Low</td></tr>
          <tr><td style="color:var(--green)">Named Extended</td><td>Any name</td><td>Full 5-tuple</td><td>High</td></tr>
        </table></div>
        <div class="callout callout-info" style="margin-top:8px;margin-bottom:8px">📌 <strong>ACL Placement Rule:</strong> Standard ACLs: place CLOSE TO DESTINATION (they match only src IP — placing near source blocks too much). Extended ACLs: place CLOSE TO SOURCE (they match src+dst — more specific, don't need to cross network).</div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10.5px;line-height:1.9">
          <div style="color:var(--cyan)">! Standard ACL example</div>
          <div style="color:var(--green)">access-list 10 permit 192.168.1.0 0.0.0.255</div>
          <div style="color:var(--red)">access-list 10 deny   any                    ← implicit deny already at end</div>
          <div style="color:var(--cyan);margin-top:6px">! Extended ACL — permit HTTP only from .1 to server</div>
          <div style="color:var(--green)">ip access-list extended PERMIT_WEB</div>
          <div style="color:var(--green)"> permit tcp 192.168.1.0 0.0.0.255 host 10.0.0.10 eq 80</div>
          <div style="color:var(--green)"> permit tcp 192.168.1.0 0.0.0.255 host 10.0.0.10 eq 443</div>
          <div style="color:var(--red)"> deny ip any any log          ← explicit deny with log</div>
          <div style="color:var(--cyan);margin-top:6px">! Apply to interface</div>
          <div style="color:var(--green)">interface Gi0/0</div>
          <div style="color:var(--green)"> ip access-group PERMIT_WEB in   ← inbound</div>
        </div>
      </div>
    </div>
    <div>
      <div class="card">
        <div class="card-hdr">Prefix Lists — More Powerful than ACLs for Routes</div>
        <div class="callout callout-info" style="margin-bottom:8px">Prefix lists match IP prefixes by exact or range match using ge/le operators. They are processed in sequence order — first match wins. Implicit deny all at end.</div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10.5px;line-height:1.9;margin-bottom:8px">
          <div style="color:var(--cyan)">! Prefix list operators:</div>
          <div style="color:var(--amber)">ge = "greater than or equal to" (prefix length)</div>
          <div style="color:var(--amber)">le = "less than or equal to" (prefix length)</div>
          <div style="color:var(--cyan);margin-top:6px">! Examples:</div>
          <div style="color:var(--green)">ip prefix-list EXACT seq 5 permit 10.0.0.0/8</div>
          <div style="color:var(--muted)">  ← matches ONLY 10.0.0.0/8 exactly</div>
          <div style="color:var(--green)">ip prefix-list HOSTS seq 5 permit 10.0.0.0/8 ge 32</div>
          <div style="color:var(--muted)">  ← matches /32 host routes inside 10.0.0.0/8</div>
          <div style="color:var(--green)">ip prefix-list SUBNETS seq 5 permit 10.0.0.0/8 ge 24 le 28</div>
          <div style="color:var(--muted)">  ← matches /24, /25, /26, /27, /28 within 10.x</div>
          <div style="color:var(--green)">ip prefix-list DEFAULT seq 5 permit 0.0.0.0/0</div>
          <div style="color:var(--muted)">  ← matches ONLY the default route 0.0.0.0/0</div>
          <div style="color:var(--green)">ip prefix-list ALL seq 5 permit 0.0.0.0/0 le 32</div>
          <div style="color:var(--muted)">  ← matches ALL prefixes (any length)</div>
        </div>
        <div class="card-hdr" style="margin-bottom:8px">Route-Maps — Match + Set Logic</div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>Component</th><th>Purpose</th><th>Example</th></tr>
          <tr><td style="color:var(--blue)">match</td><td>Define what to select</td><td>match ip address prefix-list MYLIST</td></tr>
          <tr><td style="color:var(--green)">set</td><td>What action to take</td><td>set local-preference 200</td></tr>
          <tr><td style="color:var(--amber)">permit</td><td>Apply set actions</td><td>Route-map clause permits = applies policy</td></tr>
          <tr><td style="color:var(--red)">deny</td><td>Reject matching routes</td><td>Route-map clause deny = drop route</td></tr>
          <tr><td style="color:var(--muted2)">No match</td><td>If no match clause</td><td>permit=ALL routes match; deny=NO routes match</td></tr>
        </table></div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:10px;font-family:var(--mono);font-size:10.5px;line-height:1.9;margin-top:8px">
          <div style="color:var(--cyan)">! Route-map for BGP local-preference</div>
          <div style="color:var(--green)">route-map SET_LOCALPREF permit 10</div>
          <div style="color:var(--green)"> match ip address prefix-list PREFERRED</div>
          <div style="color:var(--green)"> set local-preference 200</div>
          <div style="color:var(--green)">route-map SET_LOCALPREF permit 20</div>
          <div style="color:var(--muted)"> ← empty = match all, set nothing (pass through)</div>
          <div style="color:var(--cyan);margin-top:6px">! AND/OR logic:</div>
          <div style="color:var(--muted)">Multiple match statements in ONE clause = AND</div>
          <div style="color:var(--muted)">Multiple route-map clauses with same name = OR</div>
        </div>
      </div>
    </div>
  </div>
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">🎯 Interview Q&amp;A — ACLs &amp; Route Filtering</div>
    <div class="qa-list">
      <div class="qa-item"><div class="qa-q" onclick="toggleQA(this)">Q: What is the difference between an ACL, a prefix list, and a route-map? When do you use each?<span class="qa-arrow">▶</span></div><div class="qa-a"><strong>ACL:</strong> Used primarily to FILTER TRAFFIC (permit/deny packets based on headers). Can be used for traffic filtering (interface in/out), NAT, VPN crypto maps, QoS class-maps, or for matching routes in redistribution/route-maps. When used to filter routes, they match only on the network address portion. <strong>Prefix List:</strong> Designed SPECIFICALLY for route matching/filtering. More efficient than ACLs for routes. Supports ge/le operators for flexible prefix length matching. Used in BGP neighbor filtering, OSPF distribute-lists, redistribution. Cannot filter traffic — only route prefixes. <strong>Route-Map:</strong> A swiss-army knife — it can MATCH routes using ACLs, prefix-lists, community lists, AS-path, and then SET attributes (local-pref, MED, next-hop, community, weight). Used for BGP policy, redistribution manipulation, Policy-Based Routing (PBR). A route-map WITHOUT a match clause matches everything. A route-map deny clause drops matched routes.</div></div>
    </div>
  </div>

  <div class="card" style="margin-top:14px">
    <div class="card-hdr">ACL Processing — How the Router Evaluates Each Entry</div>
    <div class="grid-2">
      <div>
        <div class="callout callout-info" style="margin-bottom:10px">ACL entries are processed TOP TO BOTTOM, FIRST MATCH WINS. The router stops evaluating as soon as it finds a match. Every ACL has an invisible <strong>implicit deny all</strong> at the end — if nothing matches, the packet is dropped. This means: always put more specific entries before less specific ones.</div>
        <svg viewBox="0 0 370 230" width="100%" style="display:block">
          <rect x="0" y="0" width="370" height="230" rx="8" fill="#0d1117" stroke="rgba(248,113,113,0.15)"/>
          <text x="10" y="14" font-family="IBM Plex Mono,monospace" font-size="8" fill="rgba(248,113,113,0.4)">ACL PROCESSING FLOWCHART</text>
          <!-- Packet -->
          <rect x="135" y="20" width="100" height="28" rx="5" fill="rgba(56,217,192,0.1)" stroke="rgba(56,217,192,0.4)" stroke-width="1.5"/>
          <text x="185" y="38" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8.5" fill="#38d9c0">Packet arrives</text>
          <!-- ACE 1 -->
          <line x1="185" y1="48" x2="185" y2="60" stroke="rgba(140,150,180,0.3)" stroke-width="1"/>
          <rect x="100" y="60" width="170" height="28" rx="4" fill="rgba(91,156,246,0.1)" stroke="rgba(91,156,246,0.3)" stroke-width="1"/>
          <text x="185" y="76" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#5b9cf6">seq 10: match? (first ACE)</text>
          <!-- Yes/No branches for ACE 1 -->
          <line x1="100" y1="74" x2="50" y2="100" stroke="rgba(74,222,128,0.5)" stroke-width="1"/>
          <text x="60" y="90" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(74,222,128,0.5)">YES</text>
          <rect x="5" y="100" width="80" height="40" rx="4" fill="rgba(74,222,128,0.1)" stroke="rgba(74,222,128,0.4)" stroke-width="1.5"/>
          <text x="45" y="116" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#4ade80">PERMIT</text>
          <text x="45" y="128" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(74,222,128,0.5)">→ forward</text>
          <line x1="270" y1="74" x2="320" y2="100" stroke="rgba(248,113,113,0.4)" stroke-width="1"/>
          <text x="305" y="90" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(248,113,113,0.4)">NO</text>
          <!-- ACE 2 -->
          <line x1="185" y1="88" x2="185" y2="108" stroke="rgba(140,150,180,0.3)" stroke-width="1"/>
          <rect x="100" y="108" width="170" height="28" rx="4" fill="rgba(91,156,246,0.1)" stroke="rgba(91,156,246,0.3)" stroke-width="1"/>
          <text x="185" y="124" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#5b9cf6">seq 20: match? (next ACE)</text>
          <line x1="100" y1="122" x2="50" y2="148" stroke="rgba(74,222,128,0.5)" stroke-width="1"/>
          <text x="60" y="140" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(74,222,128,0.5)">YES</text>
          <rect x="5" y="148" width="80" height="40" rx="4" fill="rgba(248,113,113,0.1)" stroke="rgba(248,113,113,0.4)" stroke-width="1.5"/>
          <text x="45" y="164" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#f87171">DENY</text>
          <text x="45" y="176" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(248,113,113,0.5)">→ drop</text>
          <line x1="270" y1="122" x2="270" y2="148" stroke="rgba(248,113,113,0.4)" stroke-width="1"/>
          <!-- Implicit deny -->
          <line x1="185" y1="136" x2="185" y2="160" stroke="rgba(140,150,180,0.3)" stroke-width="1"/>
          <rect x="95" y="160" width="180" height="32" rx="4" fill="rgba(248,113,113,0.15)" stroke="rgba(248,113,113,0.5)" stroke-width="1.5" stroke-dasharray="5 3"/>
          <text x="185" y="174" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#f87171">implicit deny any any</text>
          <text x="185" y="185" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(248,113,113,0.5)">(invisible — always at end)</text>
          <rect x="95" y="200" width="180" height="25" rx="3" fill="rgba(248,113,113,0.1)"/>
          <text x="185" y="216" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#f87171">DENY all unmatched</text>
        </svg>
      </div>
      <div>
        <div class="card-hdr" style="margin-bottom:8px">Wildcard Mask — The Inverse of Subnet Mask</div>
        <div class="callout callout-info" style="margin-bottom:8px">Wildcard mask (used in ACLs, OSPF network statements): 0 = must match, 1 = ignore. It's the INVERSE of the subnet mask. Quick calculation: 255.255.255.255 - subnet mask = wildcard mask.</div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>Subnet Mask</th><th>Wildcard Mask</th><th>What It Matches</th></tr>
          <tr><td>255.255.255.255</td><td style="color:var(--green)">0.0.0.0</td><td>Exact host match (host keyword)</td></tr>
          <tr><td>255.255.255.0</td><td style="color:var(--blue)">0.0.0.255</td><td>Entire /24 subnet</td></tr>
          <tr><td>255.255.255.192</td><td style="color:var(--cyan)">0.0.0.63</td><td>Entire /26 subnet</td></tr>
          <tr><td>255.255.0.0</td><td style="color:var(--amber)">0.0.255.255</td><td>Entire /16 block</td></tr>
          <tr><td>0.0.0.0</td><td style="color:var(--red)">255.255.255.255</td><td>Any IP (any keyword)</td></tr>
          <tr><td>255.255.255.0 (odd trick)</td><td style="color:var(--muted2)">0.0.0.254</td><td>All EVEN IPs in subnet (unusual)</td></tr>
        </table></div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10.5px;line-height:1.9;margin-top:8px">
          <div style="color:var(--cyan)">! Verify ACL hits in real time</div>
          <div style="color:var(--blue)">show ip access-lists PERMIT_WEB</div>
          <div style="color:var(--muted)">→ shows each ACE with match count</div>
          <div style="color:var(--blue)">show ip interface Gi0/0 | include access</div>
          <div style="color:var(--muted)">→ shows which ACL applied in/out</div>
          <div style="color:var(--amber)">ip access-list extended PERMIT_WEB</div>
          <div style="color:var(--amber)"> 10 permit tcp any host 10.0.0.1 eq 443</div>
          <div style="color:var(--amber)"> 20 deny   ip  any any log</div>
          <div style="color:var(--muted)">→ "log" keyword: generates syslog per match</div>
          <div style="color:var(--red)">! NEVER add "log" to high-traffic deny rules</div>
          <div style="color:var(--red)">! in production — logs flood the buffer</div>
        </div>
      </div>
    </div>
  </div>

  <div class="card" style="margin-top:14px">
    <div class="card-hdr">Extended ACL — Every Match Condition with Real Examples</div>
    <div class="tbl-wrap"><table class="tbl">
      <tr><th>Match Field</th><th>Keyword</th><th>Example</th><th>Notes</th></tr>
      <tr><td style="color:var(--blue)">Protocol</td><td>tcp / udp / icmp / ip / ospf / eigrp</td><td>permit tcp ...</td><td>"ip" matches ALL protocols</td></tr>
      <tr><td style="color:var(--blue)">Source IP</td><td>host X.X.X.X / network wildcard / any</td><td>10.1.1.0 0.0.0.255</td><td>host = exact IP, any = 0.0.0.0 255.255.255.255</td></tr>
      <tr><td style="color:var(--cyan)">Source Port</td><td>eq / lt / gt / range / neq</td><td>eq 1024 / range 1024 65535</td><td>TCP/UDP only</td></tr>
      <tr><td style="color:var(--cyan)">Dest IP</td><td>same as source</td><td>host 8.8.8.8</td><td>—</td></tr>
      <tr><td style="color:var(--amber)">Dest Port</td><td>eq / lt / gt / range</td><td>eq 80 / eq www / eq 443</td><td>Named ports: www=80, domain=53, ssh=22</td></tr>
      <tr><td style="color:var(--amber)">TCP Flags</td><td>established / syn / fin / rst / ack</td><td>permit tcp any any established</td><td>established = ACK or RST bit set (return traffic)</td></tr>
      <tr><td style="color:var(--green)">ICMP Type</td><td>echo / echo-reply / unreachable / traceroute</td><td>permit icmp any any echo-reply</td><td>Permits return pings without opening full ICMP</td></tr>
      <tr><td style="color:var(--muted2)">DSCP</td><td>dscp value</td><td>permit ip any any dscp ef</td><td>Match QoS-marked traffic (EF=46)</td></tr>
    </table></div>
    <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10.5px;line-height:1.9;margin-top:10px">
      <div style="color:var(--amber);font-weight:700">REAL-WORLD ACL SCENARIO — Stateless Firewall:</div>
      <div style="color:var(--cyan)">! Allow internal hosts to browse web, block everything else</div>
      <div style="color:var(--cyan)">! Applied OUTBOUND on the external interface (toward internet)</div>
      <div style="color:var(--green)">ip access-list extended OUTBOUND_INTERNET</div>
      <div style="color:var(--green)"> permit tcp 192.168.0.0 0.0.255.255 any eq 80</div>
      <div style="color:var(--green)"> permit tcp 192.168.0.0 0.0.255.255 any eq 443</div>
      <div style="color:var(--green)"> permit udp 192.168.0.0 0.0.255.255 any eq 53</div>
      <div style="color:var(--green)"> deny   ip any any log</div>
      <div style="color:var(--cyan);margin-top:6px">! Applied INBOUND — allow return traffic (established TCP)</div>
      <div style="color:var(--green)">ip access-list extended INBOUND_INTERNET</div>
      <div style="color:var(--green)"> permit tcp any 192.168.0.0 0.0.255.255 established</div>
      <div style="color:var(--green)"> permit udp any 192.168.0.0 0.0.255.255 gt 1023</div>
      <div style="color:var(--amber)"> permit icmp any any echo-reply      ← allow ping replies back</div>
      <div style="color:var(--amber)"> permit icmp any any unreachable     ← allow PMTUD ICMP</div>
      <div style="color:var(--red)"> deny ip any any log</div>
    </div>
    <div class="callout callout-warn" style="margin-top:8px">⚠️ <strong>Stateless vs Stateful:</strong> IOS ACLs are STATELESS — they don't track TCP connection state. The <code>established</code> keyword only checks the ACK/RST bit, which can be spoofed. Cisco ASA/Firepower uses stateful inspection — automatically permits return traffic for established sessions. For production firewalls, always use stateful inspection.</div>
  </div>

  <div class="card" style="margin-top:14px">
    <div class="card-hdr">🎯 Advanced Interview Q&amp;A — ACLs</div>
    <div class="qa-list">
      <div class="qa-item">
        <div class="qa-q" onclick="toggleQA(this)">Q: You apply an ACL inbound on Gi0/0 and all traffic stops, even traffic you expected to permit. What happened?<span class="qa-arrow">▶</span></div>
        <div class="qa-a">Most common causes: ①<strong>Implicit deny hit before your permit:</strong> Your ACL has the correct permit statement but it's ordered BELOW a broader deny. Remember: first match wins. Run <code>show ip access-lists [name]</code> — look at match counts. If your permit has 0 matches and the deny above it has matches, the deny is too broad and is catching your traffic first. Reorder: put specific permits before general denies. ②<strong>Wrong direction:</strong> Applied inbound but traffic flows outbound (or vice versa). Inbound = traffic entering the interface FROM outside. Outbound = traffic leaving the interface. Run <code>show ip interface Gi0/0 | include access</code> to confirm direction. ③<strong>ACL applied to wrong interface:</strong> You put it on Gi0/0 but traffic enters via Gi0/1. ④<strong>Forgot to permit return traffic:</strong> Outbound HTTP is permitted but return traffic (established TCP) has no permit rule — use <code>permit tcp any any established</code> for inbound. ⑤<strong>Routing protocol traffic blocked:</strong> OSPF hello uses 224.0.0.5 multicast — if your ACL doesn't explicitly permit <code>permit ospf any any</code>, OSPF adjacencies drop when ACL is applied to a router interface participating in OSPF.</div>
      </div>
      <div class="qa-item">
        <div class="qa-q" onclick="toggleQA(this)">Q: What is the difference between an ACL applied inbound vs outbound, and how does it affect performance?<span class="qa-arrow">▶</span></div>
        <div class="qa-a"><strong>Inbound ACL:</strong> Evaluated BEFORE the routing lookup. If the packet is denied, it's dropped immediately — no routing table lookup, no CEF lookup, no L2 rewrite. This is the most CPU-efficient placement for blocking traffic. The packet never enters the router's forwarding path. <strong>Outbound ACL:</strong> Evaluated AFTER the routing lookup, just before the packet leaves the interface. The router has already done the full FIB lookup, found the egress interface, looked up the adjacency, prepared the L2 header — THEN the ACL check happens. If denied, all that work was wasted. Use inbound ACLs when you want to filter at the entry point (edge filtering). Use outbound when you need to filter based on routing decisions (e.g., "don't send certain routes out this specific interface" — though for routes, use distribute-lists or route-maps instead). <strong>Performance:</strong> Modern Cisco platforms implement ACLs in TCAM (Ternary Content Addressable Memory) — hardware lookup at line rate regardless of ACL size. On software-forwarded platforms, inbound ACLs are slightly faster because no routing lookup overhead for dropped packets.</div>
      </div>
    </div>
  </div>
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">🔬 ACL Wildcard Mask Binary Math & Named ACL Editing</div>
    <div class="callout callout-info">Wildcard mask: 0 = match this bit exactly, 1 = don't care (opposite of subnet mask). Mastering wildcard math enables writing precise ACLs for any IP range or subset.</div>
    <div class="grid-2">
      <div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--amber);font-weight:700">WILDCARD MASK EXAMPLES:</div>
          <div style="color:var(--cyan)">Match exactly 192.168.1.10:</div>
          <div style="color:var(--green)">permit ip host 192.168.1.10 any</div>
          <div style="color:var(--muted2)">! = 192.168.1.10 0.0.0.0 (all bits must match)</div>
          <div style="color:var(--cyan)">Match 10.0.0.0/24 (256 hosts):</div>
          <div style="color:var(--green)">permit ip 10.0.0.0 0.0.0.255 any</div>
          <div style="color:var(--muted2)">! 0.0.0.255 = match first 24 bits, any last 8</div>
          <div style="color:var(--cyan)">Match EVEN hosts only in 10.0.0.0/24:</div>
          <div style="color:var(--green)">permit ip 10.0.0.0 0.0.0.254 any</div>
          <div style="color:var(--muted2)">! 254 = 11111110 = last bit must be 0 = even IPs!</div>
          <div style="color:var(--cyan)">Match 10.0.0.0–10.0.3.255 (a /22):</div>
          <div style="color:var(--green)">permit ip 10.0.0.0 0.0.3.255 any</div>
          <div style="color:var(--muted2)">! 0.0.3.255 = match first 22 bits</div>
          <div style="color:var(--cyan)">Match any (all IPs):</div>
          <div style="color:var(--green)">permit ip any any  or  0.0.0.0 255.255.255.255</div>
        </div>
      </div>
      <div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--amber);font-weight:700">NAMED ACL EDITING WITH SEQUENCE NUMBERS:</div>
          <div style="color:var(--green)">ip access-list extended FIREWALL</div>
          <div style="color:var(--amber)"> 10 permit tcp 10.0.0.0 0.0.0.255 any eq 80</div>
          <div style="color:var(--amber)"> 20 permit tcp 10.0.0.0 0.0.0.255 any eq 443</div>
          <div style="color:var(--amber)"> 30 deny ip any any log</div>
          <div> </div>
          <div style="color:var(--cyan)">! Insert between 10 and 20:</div>
          <div style="color:var(--green)">ip access-list extended FIREWALL</div>
          <div style="color:var(--amber)"> 15 permit tcp 10.0.0.0 0.0.0.255 any eq 8080</div>
          <div> </div>
          <div style="color:var(--cyan)">! Delete entry 30:</div>
          <div style="color:var(--green)">ip access-list extended FIREWALL</div>
          <div style="color:var(--red)"> no 30</div>
          <div> </div>
          <div style="color:var(--cyan)">! Resequence (renumber) entries:</div>
          <div style="color:var(--amber)">ip access-list resequence FIREWALL 100 10</div>
          <div style="color:var(--muted2)">! Starts at 100, increments by 10</div>
          <div> </div>
          <div style="color:var(--blue)">show ip access-lists FIREWALL   ← entries + hit counts</div>
          <div style="color:var(--amber)">clear ip access-list counters FIREWALL</div>
          <div style="color:var(--red)">⚠️ ACL direction: IN = before routing, OUT = after routing!</div>
        </div>
      </div>
    </div>
  </div>


</div>

<!-- ═══ CCNP MPLS EXPANDED ═══ -->

<!-- ═══ CCNA TAB 7: OSPF ═══ -->
<div id="ccna-topic-7" class="topic-panel">
  <div class="topic-hero" style="border-left:4px solid var(--green)">
    <div class="topic-title">🔁 OSPF — Complete Reference: Neighbors, DR/BDR, LSAs &amp; Troubleshooting</div>
    <div class="topic-sub">Neighbor states · DR/BDR election · LSA types · area types · cost calculation · multi-vendor config · troubleshooting workflow</div>
  </div>
  <div class="grid-2">
    <div>
      <div class="card">
        <div class="card-hdr">OSPF Neighbor States — The 8-State Machine</div>
        <div class="callout callout-info" style="margin-bottom:8px">Neighbors must go through all states to reach FULL adjacency. Only FULL neighbors exchange LSAs and build the LSDB. 2-WAY is acceptable for DROther routers on multi-access segments.</div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>#</th><th>State</th><th>What's happening</th><th>Stuck here = problem</th></tr>
          <tr><td>1</td><td style="color:var(--muted2)">Down</td><td>No hellos received. Initial state.</td><td>Dead interval expired (4× hello)</td></tr>
          <tr><td>2</td><td style="color:var(--muted2)">Attempt</td><td>Sending Hello to configured neighbor (NBMA)</td><td>NBMA neighbor unreachable</td></tr>
          <tr><td>3</td><td style="color:var(--red)">Init</td><td>Hello received but MY router-id not in it</td><td>Hello heard but not bidirectional — check firewall blocking 224.0.0.5</td></tr>
          <tr><td>4</td><td style="color:var(--amber)">2-Way</td><td>MY router-id IS in neighbor's Hello. DR/BDR election happens here.</td><td>Normal for DROther↔DROther on broadcast segments</td></tr>
          <tr><td>5</td><td style="color:var(--amber)">ExStart</td><td>Master/Slave election by Router-ID. Negotiating DBD sequence numbers.</td><td>MTU MISMATCH — most common cause! Check: show int, ip ospf mtu-ignore</td></tr>
          <tr><td>6</td><td style="color:var(--amber)">Exchange</td><td>Exchanging DBD (Database Description) packets with LSDB summary</td><td>Corrupt DBD packets, authentication mismatch</td></tr>
          <tr><td>7</td><td style="color:var(--cyan)">Loading</td><td>Requesting full LSAs via LSR (Link State Request)</td><td>LSA database inconsistency</td></tr>
          <tr><td>8</td><td style="color:var(--green);font-weight:700">Full</td><td>LSDB synchronized. Only state with working adjacency.</td><td>N/A — this is the goal!</td></tr>
        </table></div>
      </div>
    </div>
    <div>
      <div class="card">
        <div class="card-hdr">OSPF DR/BDR Election</div>
        <div class="callout callout-info" style="margin-bottom:8px">DR/BDR election happens on BROADCAST and NBMA networks to reduce OSPF traffic. On a 5-router segment, without DR: 10 adjacencies. With DR: 4 adjacencies (each router to DR+BDR only). DR floods LSAs so others don't have to.</div>
        <svg viewBox="0 0 370 180" width="100%" style="display:block">
          <rect x="0" y="0" width="370" height="180" rx="6" fill="#0d1117" stroke="rgba(74,222,128,0.1)"/>
          <text x="8" y="14" font-family="IBM Plex Mono,monospace" font-size="8" fill="rgba(74,222,128,0.4)">OSPF DR/BDR ELECTION — BROADCAST SEGMENT</text>
          <!-- Shared segment -->
          <line x1="30" y1="90" x2="340" y2="90" stroke="rgba(56,217,192,0.3)" stroke-width="2"/>
          <!-- R1 = DR -->
          <rect x="10" y="55" width="55" height="35" rx="15" fill="rgba(74,222,128,0.12)" stroke="#4ade80" stroke-width="2"/>
          <text x="37" y="70" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#4ade80">R1</text>
          <text x="37" y="80" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(74,222,128,0.5)">1.1.1.1 DR</text>
          <!-- R2 = BDR -->
          <rect x="80" y="55" width="55" height="35" rx="15" fill="rgba(56,217,192,0.1)" stroke="#38d9c0" stroke-width="1.5"/>
          <text x="107" y="70" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#38d9c0">R2</text>
          <text x="107" y="80" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(56,217,192,0.5)">2.2.2.2 BDR</text>
          <!-- R3,R4,R5 = DROther -->
          <rect x="155" y="55" width="50" height="35" rx="15" fill="rgba(140,150,180,0.06)" stroke="rgba(140,150,180,0.3)" stroke-width="1"/>
          <text x="180" y="70" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="rgba(140,150,180,0.6)">R3</text>
          <text x="180" y="80" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(140,150,180,0.3)">DROther</text>
          <rect x="220" y="55" width="50" height="35" rx="15" fill="rgba(140,150,180,0.06)" stroke="rgba(140,150,180,0.3)" stroke-width="1"/>
          <text x="245" y="70" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="rgba(140,150,180,0.6)">R4</text>
          <text x="245" y="80" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(140,150,180,0.3)">DROther</text>
          <rect x="285" y="55" width="50" height="35" rx="15" fill="rgba(140,150,180,0.06)" stroke="rgba(140,150,180,0.3)" stroke-width="1"/>
          <text x="310" y="70" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="rgba(140,150,180,0.6)">R5</text>
          <text x="310" y="80" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(140,150,180,0.3)">DROther</text>
          <!-- Multicast addresses -->
          <rect x="5" y="100" width="360" height="70" rx="4" fill="rgba(0,0,0,0.4)"/>
          <text x="10" y="116" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(74,222,128,0.6)">224.0.0.5 AllOSPFRouters: DROthers → DR/BDR  (LSU sent to this)</text>
          <text x="10" y="130" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(56,217,192,0.6)">224.0.0.6 AllDRouters:   DR/BDR only receive · DR floods back to 224.0.0.5</text>
          <text x="10" y="144" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(251,191,36,0.5)">DR Election: ① Highest OSPF priority (1-255, default 1, 0=never DR) → ② Highest Router-ID</text>
          <text x="10" y="158" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(248,113,113,0.5)">DR is NON-PREEMPTIVE: changing priority won't replace existing DR — must reset neighbor</text>
          <text x="10" y="170" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(140,150,180,0.3)">Wireshark: ip.dst == 224.0.0.6 → shows DR/BDR traffic</text>
        </svg>
      </div>
    </div>
  </div>
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">OSPF Troubleshooting — Structured Diagnostic Workflow</div>
    <div class="tbl-wrap"><table class="tbl">
      <tr><th>Symptom</th><th>Root Cause</th><th>Command to Verify</th><th>Fix</th></tr>
      <tr><td style="color:var(--red)">Neighbor stuck INIT</td><td>Unidirectional hello (firewall blocking 224.0.0.5, wrong area)</td><td>show ip ospf neighbor; debug ip ospf hello</td><td>Fix firewall; verify same area; check network statement</td></tr>
      <tr><td style="color:var(--red)">Neighbor stuck EXSTART</td><td>MTU mismatch (most common)</td><td>show interfaces — compare MTU both sides</td><td>ip ospf mtu-ignore OR fix MTU to match</td></tr>
      <tr><td style="color:var(--amber)">Neighbor flapping</td><td>Hello/Dead timer mismatch OR unstable link</td><td>show ip ospf interface — verify timers</td><td>Align timers (must match on both sides)</td></tr>
      <tr><td style="color:var(--amber)">No adjacency at 2-WAY</td><td>Network type mismatch (e.g. broadcast vs p2p)</td><td>show ip ospf interface — check "Network Type"</td><td>ip ospf network broadcast/point-to-point</td></tr>
      <tr><td style="color:var(--amber)">Routes missing</td><td>Summarization filtering, area type restriction, redistribute missing</td><td>show ip ospf database; show ip route ospf</td><td>Check LSA types for area type; add redistribution</td></tr>
      <tr><td style="color:var(--muted2)">Wrong DR elected</td><td>Priority not set; pre-existing DR (non-preemptive)</td><td>show ip ospf neighbor; show ip ospf interface</td><td>Set priority, clear ospf process on segment</td></tr>
    </table></div>
  </div>
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">🎯 CCIE Interview Q&amp;A — OSPF</div>
    <div class="qa-list">
      <div class="qa-item"><div class="qa-q" onclick="toggleQA(this)">Q: Two OSPF routers are neighbors but stuck in EXSTART. You've verified timers and authentication match. What else do you check?<span class="qa-arrow">▶</span></div><div class="qa-a">EXSTART is where Master/Slave election happens using DBD packets. If stuck here: ①<strong>MTU mismatch</strong> (most common): Run <code>show interfaces Gi0/0</code> on both routers — if MTUs differ (e.g. 1500 vs 1476 due to tunnel), DBD packets are dropped. Fix: <code>ip ospf mtu-ignore</code> as temporary fix, or align MTU. ②<strong>Duplicate Router-IDs</strong>: Two routers with same router-id — check <code>show ip ospf | include Router ID</code> on both. ③<strong>DBD options mismatch</strong>: E-bit (external capability) differences — rare but check with <code>debug ip ospf adj</code>. ④<strong>Authentication type mismatch</strong>: One side uses MD5, other uses clear text. Verify with <code>show ip ospf interface detail | include auth</code>. The debug command <code>debug ip ospf adj</code> will show the exact error message causing the EXSTART loop.</div></div>
      <div class="qa-item"><div class="qa-q" onclick="toggleQA(this)">Q: Explain OSPF cost and why you must change the reference bandwidth for modern networks.<span class="qa-arrow">▶</span></div><div class="qa-a">OSPF cost = Reference Bandwidth / Interface Bandwidth (bps). Default reference bandwidth = 100 Mbps (100,000,000 bps). This gives: FastEthernet = 100M/100M = 1, and Gigabit = 100M/1000M = 0.1 → rounded to 1. GigE and FastEthernet have the SAME cost = 1! OSPF can't distinguish between them. For 10GbE: 100M/10000M = 0.01 → rounded to 1. Same cost again. Fix: <code>auto-cost reference-bandwidth 10000</code> (in Mbps = 10 Gbps reference). Now: FE=1000, GbE=100, 10GbE=10, 100GbE=1. ALWAYS set this consistently on ALL OSPF routers — inconsistent reference bandwidth leads to suboptimal routing because costs won't be comparable across the domain. Cost table with default 100M reference: FE=1, Eth=10, E1=64, T1=64, 64K=1562.</div></div>
    </div>
  </div>
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">🔬 OSPF Adjacency State Machine — Full Debug Analysis</div>
    <div class="callout callout-info">OSPF has 8 neighbor states. Most production issues involve routers stuck at EXSTART (MTU mismatch), EXCHANGE (auth failure), or permanently at 2-WAY (normal for DROthers but confusing if unexpected).</div>
    <div class="grid-2">
      <div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>State</th><th>What's Happening</th><th>Stuck Here = Problem</th></tr>
          <tr><td style="color:var(--muted2)">Down</td><td>No hellos received</td><td>No connectivity / wrong IP / passive-interface</td></tr>
          <tr><td style="color:var(--muted2)">Attempt</td><td>Unicast hello sent (NBMA only)</td><td>Neighbor not responding (NBMA config issue)</td></tr>
          <tr><td style="color:var(--amber)">Init</td><td>Hello received but our RID not in it</td><td>One-way hello — L2 issue, VLAN mismatch</td></tr>
          <tr><td style="color:var(--amber)">2-Way</td><td>Bidirectional. DR/BDR elected here.</td><td>NORMAL for DROthers. Problem if P2P expected.</td></tr>
          <tr><td style="color:var(--red)">ExStart</td><td>Negotiate master/slave + initial seq#</td><td style="color:var(--red)">MTU MISMATCH (most common!)</td></tr>
          <tr><td style="color:var(--red)">Exchange</td><td>Exchanging DBD (Database Descriptor) packets</td><td>MTU mismatch or authentication failure</td></tr>
          <tr><td style="color:var(--cyan)">Loading</td><td>LSR/LSU/LSAck — exchanging missing LSAs</td><td>LSA corruption, mismatched area types</td></tr>
          <tr><td style="color:var(--green)">Full</td><td>LSDB synchronized, routes computed</td><td>← TARGET STATE</td></tr>
        </table></div>
      </div>
      <div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--red);font-weight:700">STUCK AT EXSTART — MTU MISMATCH FIX:</div>
          <div style="color:var(--muted2)">ExStart must exchange DBD packets in large IP packets.</div>
          <div style="color:var(--muted2)">If R1 MTU=1500, R2 MTU=1476 (GRE tunnel overhead):</div>
          <div style="color:var(--muted2)">R1 sends 1500B DBD → R2 drops (too large for tunnel MTU)</div>
          <div style="color:var(--red)">Adjacency NEVER reaches Exchange state!</div>
          <div style="color:var(--green)">Fix 1: interface GigabitEthernet0/0</div>
          <div style="color:var(--green)">        ip mtu 1476  (match tunnel MTU)</div>
          <div style="color:var(--green)">Fix 2: interface Tunnel0</div>
          <div style="color:var(--green)">        ip ospf mtu-ignore  (bypass MTU check)</div>
          <div style="margin-top:8px;color:var(--amber);font-weight:700">OSPF DEBUG COMMANDS:</div>
          <div style="color:var(--blue)">debug ip ospf hello         ← hello send/receive + why mismatched</div>
          <div style="color:var(--blue)">debug ip ospf adj           ← all adjacency state transitions</div>
          <div style="color:var(--blue)">debug ip ospf events        ← all OSPF events</div>
          <div style="color:var(--red)">undebug all  ← ALWAYS after debugging!</div>
          <div style="color:var(--amber)">show ip ospf neighbor detail ← all parameters per neighbor</div>
        </div>
      </div>
    </div>
  </div>
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">🔬 OSPF Route Types — O, O IA, O E1, O E2 Explained</div>
    <div class="tbl-wrap"><table class="tbl">
      <tr><th>Code</th><th>Route Type</th><th>Source</th><th>Metric includes internal cost?</th><th>Preference</th></tr>
      <tr><td style="color:var(--green);font-weight:700">O</td><td>Intra-area</td><td>Same OSPF area</td><td>Yes</td><td style="color:var(--green)">Highest (1st)</td></tr>
      <tr><td style="color:var(--cyan);font-weight:700">O IA</td><td>Inter-area</td><td>Different area via ABR Type-3 LSA</td><td>Yes</td><td>2nd</td></tr>
      <tr><td style="color:var(--amber);font-weight:700">O E1</td><td>External Type 1</td><td>Redistributed — metric grows through topology</td><td>Yes (int+ext)</td><td>3rd</td></tr>
      <tr><td style="color:var(--red);font-weight:700">O E2</td><td>External Type 2</td><td>Redistributed — flat metric everywhere</td><td>No (ext only)</td><td>4th (default)</td></tr>
      <tr><td style="color:var(--blue);font-weight:700">O N1</td><td>NSSA External Type 1</td><td>ASBR inside NSSA, Type-7 LSA</td><td>Yes</td><td>Same as E1</td></tr>
      <tr><td style="color:var(--purple);font-weight:700">O N2</td><td>NSSA External Type 2</td><td>ASBR inside NSSA, Type-7 LSA</td><td>No</td><td>Same as E2</td></tr>
    </table></div>
    <div class="callout callout-info" style="margin-top:10px">Preference: O &gt; O IA &gt; O E1 = O N1 &gt; O E2 = O N2. Intra-area routes ALWAYS beat inter-area, regardless of metric. E1 accumulates internal cost as traffic traverses OSPF topology — better for large multi-area designs. E2 has flat external metric — all routers see same cost (default, simpler). <strong>Key interview trap:</strong> An O route of metric 1000 beats an O IA of metric 10 — type preference trumps metric!</div>
  </div>


</div>

<!-- ═══ CCNA TAB 4: TCP & UDP DEEP DIVE ═══ -->
<div id="ccna-topic-4" class="topic-panel">
  <div class="topic-hero" style="border-left:4px solid var(--amber)">
    <div class="topic-title">🔌 TCP &amp; UDP — Complete Packet-Level Deep Dive</div>
    <div class="topic-sub">Every TCP header field · 3-way handshake with real sequence numbers · SACK · FIN vs RST · Wireshark filters · connection states · common interview traps</div>
  </div>

  <!-- TCP Header - every field -->
  <div class="card">
    <div class="card-hdr">TCP Header — All 10 Fields at the Bit Level (20 bytes minimum)</div>
    <div class="callout callout-info" style="margin-bottom:12px">TCP is defined in RFC 793 (1981) and updated by many RFCs. The header is 20 bytes minimum (with no options), up to 60 bytes max. Every reliable connection you've ever made on the internet has had this header — your browser, SSH sessions, BGP peers — all TCP.</div>
    <svg viewBox="0 0 700 230" width="100%" style="display:block">
      <rect x="0" y="0" width="700" height="230" rx="8" fill="#0d1117" stroke="rgba(251,191,36,0.2)" stroke-width="1"/>
      <text x="10" y="14" font-family="IBM Plex Mono,monospace" font-size="8" fill="rgba(251,191,36,0.5)">TCP HEADER — RFC 793 — 32-bit rows, minimum 5 rows = 20 bytes</text>
      <!-- Row 1: SrcPort, DstPort -->
      <rect x="10" y="20" width="330" height="34" rx="4" fill="rgba(91,156,246,0.12)" stroke="rgba(91,156,246,0.4)" stroke-width="1"/>
      <text x="175" y="33" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8.5" fill="#5b9cf6">Source Port  (16 bits)  —  e.g. ephemeral 52431</text>
      <text x="175" y="48" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(91,156,246,0.5)">Client randomly picks from 49152-65535 (IANA ephemeral range)</text>
      <rect x="345" y="20" width="345" height="34" rx="4" fill="rgba(91,156,246,0.1)" stroke="rgba(91,156,246,0.35)" stroke-width="1"/>
      <text x="517" y="33" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8.5" fill="#5b9cf6">Destination Port  (16 bits)  —  e.g. 80, 443, 22</text>
      <text x="517" y="48" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(91,156,246,0.5)">Well-known: 0-1023 · Registered: 1024-49151 · Ephemeral: 49152-65535</text>
      <!-- Row 2: Sequence Number -->
      <rect x="10" y="58" width="680" height="26" rx="4" fill="rgba(248,113,113,0.12)" stroke="rgba(248,113,113,0.4)" stroke-width="1"/>
      <text x="350" y="68" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8.5" fill="#f87171">Sequence Number  (32 bits)  —  byte number of FIRST byte in this segment</text>
      <text x="350" y="79" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(248,113,113,0.5)">ISN: randomly chosen at connection start (security). Wireshark shows RELATIVE seq numbers (starts at 0)</text>
      <!-- Row 3: Ack Number -->
      <rect x="10" y="88" width="680" height="26" rx="4" fill="rgba(74,222,128,0.1)" stroke="rgba(74,222,128,0.35)" stroke-width="1"/>
      <text x="350" y="99" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8.5" fill="#4ade80">Acknowledgment Number  (32 bits)  —  NEXT byte expected from sender</text>
      <text x="350" y="110" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(74,222,128,0.5)">ACK=SEQ+len means "I received everything, send me byte SEQ+len next"</text>
      <!-- Row 4: Data Offset, Reserved, Flags, Window -->
      <rect x="10" y="118" width="70" height="34" rx="4" fill="rgba(56,217,192,0.12)" stroke="rgba(56,217,192,0.4)" stroke-width="1"/>
      <text x="45" y="131" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#38d9c0">Data Off.</text>
      <text x="45" y="143" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(56,217,192,0.5)">4 bits ×4=B</text>
      <rect x="83" y="118" width="50" height="34" rx="4" fill="rgba(140,150,180,0.05)" stroke="rgba(140,150,180,0.15)" stroke-width="1"/>
      <text x="108" y="135" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(140,150,180,0.4)">Rsvd 3b</text>
      <!-- Flags breakdown -->
      <rect x="136" y="118" width="260" height="34" rx="4" fill="rgba(167,139,250,0.12)" stroke="rgba(167,139,250,0.4)" stroke-width="1"/>
      <text x="180" y="130" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" font-weight="700" fill="#a78bfa">CWR</text>
      <text x="205" y="130" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" font-weight="700" fill="#a78bfa">ECE</text>
      <text x="230" y="130" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" font-weight="700" fill="#a78bfa">URG</text>
      <text x="255" y="130" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" font-weight="700" fill="#f87171">ACK</text>
      <text x="280" y="130" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" font-weight="700" fill="#fbbf24">PSH</text>
      <text x="305" y="130" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" font-weight="700" fill="#f87171">RST</text>
      <text x="330" y="130" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" font-weight="700" fill="#5b9cf6">SYN</text>
      <text x="355" y="130" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" font-weight="700" fill="#4ade80">FIN</text>
      <text x="248" y="145" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(167,139,250,0.5)">← 9 Control Flags (each 1 bit) →</text>
      <!-- Window -->
      <rect x="399" y="118" width="291" height="34" rx="4" fill="rgba(251,191,36,0.12)" stroke="rgba(251,191,36,0.4)" stroke-width="1"/>
      <text x="544" y="131" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8.5" fill="#fbbf24">Window Size  (16 bits)</text>
      <text x="544" y="145" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(251,191,36,0.5)">Max recv buffer before ACK needed. Scaled by Win Scale TCP option.</text>
      <!-- Row 5: Checksum, Urgent -->
      <rect x="10" y="156" width="340" height="26" rx="4" fill="rgba(56,217,192,0.08)" stroke="rgba(56,217,192,0.25)" stroke-width="1"/>
      <text x="175" y="170" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#38d9c0">Checksum  (16 bits)  —  covers TCP header + data + pseudo-header (src/dst IP)</text>
      <rect x="354" y="156" width="336" height="26" rx="4" fill="rgba(140,150,180,0.06)" stroke="rgba(140,150,180,0.15)" stroke-width="1"/>
      <text x="522" y="170" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="rgba(140,150,180,0.5)">Urgent Pointer  (16 bits)  —  only valid when URG=1 (rarely used)</text>
      <!-- Row 6: Options -->
      <rect x="10" y="186" width="680" height="26" rx="4" fill="rgba(167,139,250,0.08)" stroke="rgba(167,139,250,0.25)" stroke-width="1" stroke-dasharray="5 3"/>
      <text x="350" y="197" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="rgba(167,139,250,0.6)">Options (variable, 0-40 bytes, padded to 4-byte boundary):</text>
      <text x="350" y="208" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(167,139,250,0.4)">MSS (kind=2) · SACK Permitted (kind=4) · SACK (kind=5) · Timestamps (kind=8) · Window Scale (kind=3)</text>
    </svg>
  </div>

  <!-- 3-way handshake with REAL numbers -->
  <div class="grid-2" style="margin-top:14px">
    <div>
      <div class="card">
        <div class="card-hdr">🤝 TCP 3-Way Handshake — With Real Sequence Number Math</div>
        <div class="callout callout-info" style="margin-bottom:10px">
          Scenario: Browser (Client 192.168.1.10:52431) connecting to Web Server (93.184.216.34:80). Real ISNs are 32-bit random numbers — Wireshark shows relative (0-based) for readability.
        </div>
        <svg viewBox="0 0 390 270" width="100%" style="display:block">
          <rect x="0" y="0" width="390" height="270" rx="8" fill="#0d1117" stroke="rgba(251,191,36,0.15)"/>
          <text x="10" y="14" font-family="IBM Plex Mono,monospace" font-size="8" fill="rgba(251,191,36,0.4)">TCP 3-WAY HANDSHAKE — REAL NUMBERS</text>
          <!-- Client column -->
          <rect x="5" y="20" width="90" height="35" rx="5" fill="rgba(56,217,192,0.1)" stroke="rgba(56,217,192,0.4)" stroke-width="1.5"/>
          <text x="50" y="33" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#38d9c0">CLIENT</text>
          <text x="50" y="44" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(56,217,192,0.4)">192.168.1.10:52431</text>
          <!-- Server column -->
          <rect x="295" y="20" width="90" height="35" rx="5" fill="rgba(248,113,113,0.1)" stroke="rgba(248,113,113,0.4)" stroke-width="1.5"/>
          <text x="340" y="33" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#f87171">SERVER</text>
          <text x="340" y="44" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(248,113,113,0.4)">93.184.216.34:80</text>
          <!-- Timeline lines -->
          <line x1="50" y1="60" x2="50" y2="265" stroke="rgba(56,217,192,0.2)" stroke-width="1" stroke-dasharray="3 3"/>
          <line x1="340" y1="60" x2="340" y2="265" stroke="rgba(248,113,113,0.2)" stroke-width="1" stroke-dasharray="3 3"/>
          <!-- STEP 1: SYN -->
          <line x1="50" y1="80" x2="340" y2="105" stroke="rgba(91,156,246,0.7)" stroke-width="1.5"/>
          <polygon points="340,105 328,100 330,110" fill="rgba(91,156,246,0.7)"/>
          <rect x="100" y="68" width="185" height="32" rx="4" fill="rgba(91,156,246,0.1)" stroke="rgba(91,156,246,0.3)" stroke-width="1"/>
          <text x="192" y="80" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" font-weight="700" fill="#5b9cf6">① SYN</text>
          <text x="192" y="91" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(91,156,246,0.6)">Flags=SYN, Seq=0 (ISN:2605483508)</text>
          <text x="192" y="100" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(91,156,246,0.4)">Ack=0, Win=64240, MSS=1460</text>
          <!-- Client state -->
          <text x="50" y="118" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(56,217,192,0.4)">SYN_SENT</text>
          <!-- STEP 2: SYN-ACK -->
          <line x1="340" y1="135" x2="50" y2="160" stroke="rgba(74,222,128,0.7)" stroke-width="1.5"/>
          <polygon points="50,160 62,155 60,165" fill="rgba(74,222,128,0.7)"/>
          <rect x="100" y="122" width="185" height="38" rx="4" fill="rgba(74,222,128,0.1)" stroke="rgba(74,222,128,0.3)" stroke-width="1"/>
          <text x="192" y="134" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" font-weight="700" fill="#4ade80">② SYN-ACK</text>
          <text x="192" y="145" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(74,222,128,0.6)">Flags=SYN+ACK, Seq=0 (ISN:877776654)</text>
          <text x="192" y="155" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(74,222,128,0.4)">Ack=1 (client ISN+1), Win=65535, MSS=1460</text>
          <!-- States after SYN-ACK -->
          <text x="340" y="155" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(248,113,113,0.4)">SYN_RCVD</text>
          <!-- STEP 3: ACK -->
          <line x1="50" y1="178" x2="340" y2="203" stroke="rgba(251,191,36,0.7)" stroke-width="1.5"/>
          <polygon points="340,203 328,198 330,208" fill="rgba(251,191,36,0.7)"/>
          <rect x="100" y="165" width="185" height="32" rx="4" fill="rgba(251,191,36,0.08)" stroke="rgba(251,191,36,0.3)" stroke-width="1"/>
          <text x="192" y="177" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" font-weight="700" fill="#fbbf24">③ ACK</text>
          <text x="192" y="188" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(251,191,36,0.6)">Flags=ACK, Seq=1, Ack=1 (server ISN+1)</text>
          <text x="192" y="198" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(251,191,36,0.4)">No data yet. Connection ESTABLISHED.</text>
          <!-- Established state -->
          <text x="50" y="218" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(74,222,128,0.6)">ESTABLISHED</text>
          <text x="340" y="218" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(74,222,128,0.6)">ESTABLISHED</text>
          <!-- Data transfer arrow -->
          <line x1="50" y1="232" x2="340" y2="250" stroke="rgba(140,150,180,0.3)" stroke-width="1" stroke-dasharray="5 2"/>
          <text x="192" y="244" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(140,150,180,0.4)">Data transfer begins (HTTP GET...)</text>
          <text x="192" y="260" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(140,150,180,0.3)">Seq increments by bytes sent, Ack by bytes received</text>
        </svg>
      </div>
    </div>
    <div>
      <div class="card">
        <div class="card-hdr">Why Is the Initial Sequence Number (ISN) Random?</div>
        <div class="callout callout-info">The ISN is randomly generated (RFC 6528) for security. If predictable, an attacker could inject spoofed TCP segments into an existing connection — a "TCP session hijacking" attack. The random ISN makes it computationally infeasible to guess valid sequence numbers.</div>
        <div class="card-hdr" style="margin-top:12px;margin-bottom:8px">TCP Options Exchanged in SYN/SYN-ACK</div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>Option (Kind)</th><th>Size</th><th>Purpose</th><th>SYN only?</th></tr>
          <tr><td style="color:var(--blue)">MSS (2)</td><td>4B</td><td>Tell peer max segment size to send me. Default = 1460 for Ethernet.</td><td style="color:var(--amber)">Yes</td></tr>
          <tr><td style="color:var(--cyan)">SACK-Permitted (4)</td><td>2B</td><td>I support Selective ACKs.</td><td style="color:var(--amber)">Yes</td></tr>
          <tr><td style="color:var(--amber)">Window Scale (3)</td><td>3B</td><td>Multiply window size by 2^n. Needed for fast networks (high BDP)</td><td style="color:var(--amber)">Yes</td></tr>
          <tr><td style="color:var(--green)">Timestamps (8)</td><td>10B</td><td>RTT measurement + PAWS (protect against old segments)</td><td>No</td></tr>
          <tr><td style="color:var(--muted2)">SACK (5)</td><td>Variable</td><td>Selective ACK: "I got bytes 1-500 and 800-1000, missing 501-799"</td><td>No</td></tr>
        </table></div>
        <div class="card-hdr" style="margin-top:12px;margin-bottom:8px">Window Size &amp; Flow Control — Why It Matters</div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10.5px;line-height:1.9">
          <div style="color:var(--cyan)">Window Size = receive buffer size</div>
          <div style="color:var(--text)">SYN shows Win=64240 bytes (typical Linux default)</div>
          <div style="color:var(--text)">With Win Scale option 2^7=128: actual window = 64240 × 128 = <span style="color:var(--amber)">8,222,720 bytes</span> (~8MB)</div>
          <div style="color:var(--muted);margin-top:6px">This means the sender can have 8MB of data "in flight"</div>
          <div style="color:var(--muted)">before needing an ACK — critical for high-latency links</div>
          <div style="color:var(--cyan);margin-top:8px">! Zero Window = receive buffer full — sender STOPS</div>
          <div style="color:var(--red)">Wireshark: [TCP ZeroWindow] alert = receiver overwhelmed</div>
          <div style="color:var(--muted)">Fix: check application processing speed on receiver</div>
        </div>
      </div>
      <div class="card" style="margin-top:14px">
        <div class="card-hdr">TCP SACK — Selective Acknowledgment Explained</div>
        <div class="callout callout-info" style="margin-bottom:8px">Without SACK: if packet 5 is lost in a sequence 1-10, receiver must re-send ALL 10 packets. With SACK: receiver says "I have 1-4 and 6-10, only resend 5."</div>
        <svg viewBox="0 0 380 100" width="100%" style="display:block">
          <rect x="0" y="0" width="380" height="100" rx="6" fill="#0d1117" stroke="rgba(74,222,128,0.1)"/>
          <text x="8" y="14" font-family="IBM Plex Mono,monospace" font-size="8" fill="rgba(140,150,180,0.5)">SACK — receiver tells sender exactly what arrived</text>
          <!-- Packets -->
          <rect x="8" y="20" width="32" height="28" rx="3" fill="rgba(74,222,128,0.15)" stroke="rgba(74,222,128,0.4)" stroke-width="1"/>
          <text x="24" y="37" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#4ade80">1</text>
          <rect x="44" y="20" width="32" height="28" rx="3" fill="rgba(74,222,128,0.15)" stroke="rgba(74,222,128,0.4)" stroke-width="1"/>
          <text x="60" y="37" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#4ade80">2</text>
          <rect x="80" y="20" width="32" height="28" rx="3" fill="rgba(74,222,128,0.15)" stroke="rgba(74,222,128,0.4)" stroke-width="1"/>
          <text x="96" y="37" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#4ade80">3</text>
          <rect x="116" y="20" width="32" height="28" rx="3" fill="rgba(248,113,113,0.15)" stroke="rgba(248,113,113,0.5)" stroke-width="1.5" stroke-dasharray="3 2"/>
          <text x="132" y="37" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#f87171">4✗</text>
          <rect x="152" y="20" width="32" height="28" rx="3" fill="rgba(74,222,128,0.15)" stroke="rgba(74,222,128,0.4)" stroke-width="1"/>
          <text x="168" y="37" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#4ade80">5</text>
          <rect x="188" y="20" width="32" height="28" rx="3" fill="rgba(74,222,128,0.15)" stroke="rgba(74,222,128,0.4)" stroke-width="1"/>
          <text x="204" y="37" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#4ade80">6</text>
          <rect x="224" y="20" width="32" height="28" rx="3" fill="rgba(74,222,128,0.15)" stroke="rgba(74,222,128,0.4)" stroke-width="1"/>
          <text x="240" y="37" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#4ade80">7</text>
          <!-- Labels -->
          <text x="8" y="62" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(74,222,128,0.6)">ACK=4 (cumulative: 1-3 OK)</text>
          <text x="8" y="75" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(56,217,192,0.6)">SACK Block: [5-7] received</text>
          <text x="8" y="88" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(248,113,113,0.6)">Sender: only retransmit packet 4</text>
          <text x="245" y="35" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(140,150,180,0.4)">Without SACK:</text>
          <text x="245" y="47" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(248,113,113,0.5)">retransmit 4,5,6,7</text>
          <text x="245" y="59" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(74,222,128,0.5)">With SACK:</text>
          <text x="245" y="71" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(74,222,128,0.7)">retransmit only 4</text>
        </svg>
      </div>
    </div>
  </div>

  <!-- FIN vs RST -->
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">🔚 TCP Connection Teardown — FIN vs RST</div>
    <div class="grid-2">
      <div>
        <div class="card-hdr" style="margin-bottom:8px">FIN — Graceful 4-Way Teardown</div>
        <svg viewBox="0 0 360 220" width="100%" style="display:block">
          <rect x="0" y="0" width="360" height="220" rx="6" fill="#0d1117" stroke="rgba(74,222,128,0.15)"/>
          <text x="8" y="14" font-family="IBM Plex Mono,monospace" font-size="8" fill="rgba(74,222,128,0.5)">GRACEFUL FIN TEARDOWN</text>
          <line x1="60" y1="20" x2="60" y2="215" stroke="rgba(56,217,192,0.15)" stroke-width="1" stroke-dasharray="3 3"/>
          <line x1="300" y1="20" x2="300" y2="215" stroke="rgba(248,113,113,0.15)" stroke-width="1" stroke-dasharray="3 3"/>
          <text x="60" y="20" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#38d9c0">CLIENT</text>
          <text x="300" y="20" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#f87171">SERVER</text>
          <!-- FIN 1 -->
          <line x1="60" y1="45" x2="300" y2="65" stroke="rgba(74,222,128,0.7)" stroke-width="1.5"/>
          <polygon points="300,65 288,60 290,70" fill="rgba(74,222,128,0.7)"/>
          <text x="180" y="52" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#4ade80">FIN+ACK  (Seq=M)</text>
          <text x="60" y="78" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(56,217,192,0.5)">FIN_WAIT_1</text>
          <!-- ACK -->
          <line x1="300" y1="85" x2="60" y2="105" stroke="rgba(251,191,36,0.5)" stroke-width="1.5"/>
          <polygon points="60,105 72,100 70,110" fill="rgba(251,191,36,0.5)"/>
          <text x="180" y="92" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#fbbf24">ACK  (Ack=M+1)</text>
          <text x="60" y="115" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(56,217,192,0.5)">FIN_WAIT_2</text>
          <text x="300" y="100" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(248,113,113,0.5)">CLOSE_WAIT</text>
          <!-- Server FIN -->
          <line x1="300" y1="130" x2="60" y2="150" stroke="rgba(74,222,128,0.7)" stroke-width="1.5"/>
          <polygon points="60,150 72,145 70,155" fill="rgba(74,222,128,0.7)"/>
          <text x="180" y="138" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#4ade80">FIN+ACK  (Seq=N)</text>
          <text x="300" y="162" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(248,113,113,0.5)">LAST_ACK</text>
          <!-- Final ACK -->
          <line x1="60" y1="168" x2="300" y2="188" stroke="rgba(251,191,36,0.5)" stroke-width="1.5"/>
          <polygon points="300,188 288,183 290,193" fill="rgba(251,191,36,0.5)"/>
          <text x="180" y="175" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#fbbf24">ACK  (Ack=N+1)</text>
          <text x="60" y="200" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(56,217,192,0.5)">TIME_WAIT (2×MSL)</text>
          <text x="300" y="200" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(74,222,128,0.5)">CLOSED</text>
          <text x="60" y="213" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(56,217,192,0.3)">→ CLOSED</text>
        </svg>
        <div class="callout callout-info" style="margin-top:8px">⏳ <strong>TIME_WAIT (2×MSL = 60–240s):</strong> After sending final ACK, client waits in TIME_WAIT to handle any delayed packets. Prevents old segment from interfering with a new connection on same 5-tuple. High-traffic servers can exhaust ports due to TIME_WAIT — fix with <code>SO_REUSEADDR</code>.</div>
      </div>
      <div>
        <div class="card-hdr" style="margin-bottom:8px">RST — Abrupt Reset</div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>RST scenario</th><th>Who sends it?</th><th>Wireshark alert</th></tr>
          <tr><td style="color:var(--red)">Port not listening</td><td>Server kernel (OS)</td><td>[TCP RST, ACK]</td></tr>
          <tr><td style="color:var(--red)">Firewall block</td><td>Firewall or load-balancer</td><td>[TCP RST]</td></tr>
          <tr><td style="color:var(--red)">Connection timeout</td><td>Sender times out</td><td>[TCP RST]</td></tr>
          <tr><td style="color:var(--red)">Invalid segment</td><td>Either side</td><td>[TCP RST]</td></tr>
          <tr><td style="color:var(--amber)">App crash</td><td>OS on behalf of app</td><td>[TCP RST, ACK]</td></tr>
        </table></div>
        <div class="card-hdr" style="margin-top:12px;margin-bottom:8px">TCP vs UDP Comparison</div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>Feature</th><th style="color:var(--blue)">TCP</th><th style="color:var(--amber)">UDP</th></tr>
          <tr><td>Connection</td><td>Connection-oriented (3WHS)</td><td>Connectionless</td></tr>
          <tr><td>Reliability</td><td>Guaranteed delivery + ordering</td><td>Best effort, no ordering</td></tr>
          <tr><td>Header Size</td><td>20-60 bytes</td><td>8 bytes fixed</td></tr>
          <tr><td>Flow Control</td><td>Window size mechanism</td><td>None</td></tr>
          <tr><td>Congestion</td><td>Slow start, AIMD, CUBIC</td><td>None (app responsible)</td></tr>
          <tr><td>Use Cases</td><td>HTTP, HTTPS, FTP, SSH, BGP, SMTP</td><td>DNS, DHCP, VoIP, gaming, SNMP</td></tr>
          <tr><td>Latency</td><td>Higher (handshake + ACK overhead)</td><td>Lower (fire and forget)</td></tr>
        </table></div>
        <div class="card-hdr" style="margin-top:12px;margin-bottom:8px">Wireshark TCP Filters Cheat Sheet</div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:10px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--cyan)">tcp.flags.syn==1 and tcp.flags.ack==0  ← SYN only</div>
          <div style="color:var(--cyan)">tcp.flags.reset==1                      ← all RSTs</div>
          <div style="color:var(--cyan)">tcp.flags.fin==1                        ← all FINs</div>
          <div style="color:var(--amber)">tcp.analysis.retransmission             ← retransmits</div>
          <div style="color:var(--amber)">tcp.analysis.zero_window                ← zero window</div>
          <div style="color:var(--amber)">tcp.analysis.dup_ack                    ← duplicate ACKs</div>
          <div style="color:var(--red)">tcp.analysis.lost_segment               ← gaps in stream</div>
          <div style="color:var(--blue)">tcp.port==80 or tcp.port==443           ← HTTP/HTTPS</div>
        </div>
      </div>
    </div>
  </div>

  <!-- CCIE Interview Q&A -->
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">🎯 CCIE-Level Interview Q&amp;A — TCP Deep Dive</div>
    <div class="qa-list">
      <div class="qa-item">
        <div class="qa-q" onclick="toggleQA(this)">Q: Explain TCP slow start and congestion avoidance. What happens when a packet is lost?<span class="qa-arrow">▶</span></div>
        <div class="qa-a"><strong>Slow Start:</strong> When a new TCP connection starts, the sender's Congestion Window (CWND) begins at 1 MSS (or 10 MSS on modern systems per RFC 6928). After each ACK, CWND doubles — exponential growth. This continues until: (a) CWND reaches Slow Start Threshold (ssthresh), OR (b) a packet loss is detected. <strong>Congestion Avoidance:</strong> Once CWND ≥ ssthresh, growth becomes linear: +1 MSS per RTT (Additive Increase). <strong>On packet loss:</strong> If loss detected by 3 duplicate ACKs (fast retransmit): ssthresh = CWND/2, CWND = ssthresh (TCP Reno) or ssthresh only (TCP CUBIC). If loss by timeout: ssthresh = CWND/2, CWND = 1 MSS (severe back-off). <strong>TCP CUBIC</strong> (default Linux kernel): uses a cubic function for CWND growth — less aggressive than Reno, optimized for high-BDP networks (long-fat pipes like Akamai CDN connections).</div>
      </div>
      <div class="qa-item">
        <div class="qa-q" onclick="toggleQA(this)">Q: You see TCP RSTs in Wireshark. How do you determine the root cause?<span class="qa-arrow">▶</span></div>
        <div class="qa-a">First question: <strong>WHO sent the RST?</strong> Check the source IP in the RST packet. Then determine WHAT triggered it: ①RST immediately after SYN → port closed/not listening on server. ②RST after SYN from a different IP than server → firewall/proxy is sending RSTs. ③RST in mid-stream → application crash, idle timeout, stateful firewall asymmetric routing issue. ④RST with out-of-window sequence number → security appliance injecting RSTs (IDS/IPS, load balancer). <strong>Commands to investigate on Cisco:</strong> <code>show conn</code> (ASA) to see connection table, <code>show tcp brief</code>, <code>debug ip tcp transactions</code>. In production at Akamai scale: RSTs from edge routers usually indicate MSS mismatch or asymmetric routing where the return path goes through a different device that doesn't have connection state.</div>
      </div>
      <div class="qa-item">
        <div class="qa-q" onclick="toggleQA(this)">Q: What is the difference between TCP FIN and TCP RST at the application and protocol level?<span class="qa-arrow">▶</span></div>
        <div class="qa-a"><strong>FIN (Graceful close):</strong> Initiated by application calling close() or shutdown(). Means "I'm done SENDING, but I can still RECEIVE." The 4-way handshake allows the other side to finish sending data before it also closes. Half-close is possible (one side closes TX, other side can still send). All data already in-flight is delivered before connection closes. <strong>RST (Abrupt close):</strong> Either an error condition or deliberate abort. When sent: connection immediately terminates — no more data delivery guaranteed, any pending data is DISCARDED. The receiver's application gets an error (connection reset by peer). No TIME_WAIT state needed. <strong>Application-level difference:</strong> FIN = HTTP response sent completely, then graceful close. RST = connection aborted mid-response — client browser shows "connection reset" error. In Wireshark: FIN has FIN flag set (usually FIN+ACK). RST has RST flag set (often RST+ACK in response to data, or plain RST for port-closed).</div>
      </div>
    </div>
  </div>
  <!-- PART 2: TCP congestion control deep dive -->
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">TCP Congestion Control — Slow Start, AIMD, CUBIC, BBR</div>
    <div class="callout callout-info" style="margin-bottom:12px">TCP congestion control is how the Internet avoids collapse. Without it, every sender would transmit at maximum speed until routers drop everything. RFC 5681 defines the modern algorithms. Understanding this is critical for diagnosing slow file transfers, VPN throughput issues, and CDN performance.</div>
    <div class="grid-2">
      <div>
        <svg viewBox="0 0 380 210" width="100%" style="display:block">
          <rect x="0" y="0" width="380" height="210" rx="8" fill="#0d1117" stroke="rgba(91,156,246,0.15)"/>
          <text x="8" y="13" font-family="IBM Plex Mono,monospace" font-size="8" fill="rgba(91,156,246,0.4)">TCP CWND GROWTH — SLOW START vs CONGESTION AVOIDANCE</text>
          <!-- Axes -->
          <line x1="35" y1="180" x2="370" y2="180" stroke="rgba(140,150,180,0.3)" stroke-width="1"/>
          <line x1="35" y1="20" x2="35" y2="180" stroke="rgba(140,150,180,0.3)" stroke-width="1"/>
          <text x="200" y="198" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(140,150,180,0.4)">Time (RTTs)</text>
          <text x="8" y="100" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(140,150,180,0.4)" transform="rotate(-90,8,100)">CWND (MSS)</text>
          <!-- ssthresh line -->
          <line x1="35" y1="110" x2="370" y2="110" stroke="rgba(251,191,36,0.3)" stroke-width="1" stroke-dasharray="4 3"/>
          <text x="340" y="106" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(251,191,36,0.5)">ssthresh</text>
          <!-- Slow start phase - exponential -->
          <polyline points="35,175 60,165 85,145 110,115" stroke="#5b9cf6" stroke-width="2" fill="none"/>
          <text x="70" y="140" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(91,156,246,0.7)">Slow Start</text>
          <text x="55" y="151" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(91,156,246,0.4)">(×2/RTT)</text>
          <!-- Congestion avoidance - linear -->
          <polyline points="110,115 145,108 180,101 215,94 250,87 280,80" stroke="#4ade80" stroke-width="2" fill="none"/>
          <text x="180" y="96" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(74,222,128,0.7)">Congestion Avoidance (+1MSS/RTT)</text>
          <!-- Loss event -->
          <circle cx="280" cy="80" r="5" fill="rgba(248,113,113,0.4)" stroke="#f87171" stroke-width="1.5"/>
          <text x="285" y="75" font-family="IBM Plex Mono,monospace" font-size="7" fill="#f87171">Loss!</text>
          <!-- Recovery - drop to ssthresh/2 -->
          <line x1="280" y1="80" x2="295" y2="140" stroke="rgba(248,113,113,0.6)" stroke-width="1.5" stroke-dasharray="3 2"/>
          <text x="297" y="135" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(248,113,113,0.5)">ssthresh=CWND/2</text>
          <!-- New slow start then CA -->
          <polyline points="295,140 315,125 335,118 355,112" stroke="#fbbf24" stroke-width="2" fill="none"/>
          <text x="310" y="115" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(251,191,36,0.6)">New CA</text>
          <!-- Labels -->
          <rect x="35" y="183" width="335" height="22" rx="3" fill="rgba(0,0,0,0.4)"/>
          <text x="38" y="193" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(91,156,246,0.5)">Slow Start: CWND doubles each RTT</text>
          <text x="195" y="193" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(74,222,128,0.5)">Cong. Avoid: +1 MSS per RTT (AIMD)</text>
          <text x="38" y="202" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(248,113,113,0.4)">Loss (3 dup ACKs): ssthresh=CWND/2, Fast Retransmit</text>
          <text x="250" y="202" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(248,113,113,0.3)">Timeout: CWND=1</text>
        </svg>
      </div>
      <div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>Algorithm</th><th>OS/Version</th><th>How It Grows CWND</th><th>Best For</th></tr>
          <tr><td style="color:var(--blue)">Reno</td><td>Classic</td><td>+1 MSS/RTT in CA. On loss: CWND=ssthresh (halved)</td><td>Low BDP, high-loss paths</td></tr>
          <tr><td style="color:var(--cyan)">NewReno</td><td>RFC 6582</td><td>Reno + better recovery from multiple losses in one window</td><td>General</td></tr>
          <tr><td style="color:var(--amber)">CUBIC</td><td>Linux default since 2.6.19</td><td>Cubic function — aggressive on fast links, conservative near loss point</td><td>High-BDP (WAN, CDN)</td></tr>
          <tr><td style="color:var(--green)">BBR</td><td>Google 2016, Linux 4.9+</td><td>Model-based: measures BtlBW and RTprop, ignores queue delay</td><td>Long-fat pipes, lossy wifi</td></tr>
          <tr><td style="color:var(--muted2)">RACK</td><td>RFC 8985</td><td>Time-based loss detection instead of dup-ACK counting</td><td>Reordered packets</td></tr>
        </table></div>
        <div class="callout callout-info" style="margin-top:8px;margin-bottom:8px"><strong>BBR vs CUBIC — Key Difference:</strong> CUBIC reacts to packet loss (a queue signal). BBR measures actual bottleneck bandwidth and minimum RTT directly — it doesn't wait for loss. BBR fills the pipe at exactly the bottleneck rate without building large queues. This is why Google sees 2–25× better throughput on lossy paths with BBR. Akamai and most CDNs use BBR for origin-to-edge delivery.</div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:10px;font-family:var(--mono);font-size:10px;line-height:1.8">
          <div style="color:var(--cyan)">! Check TCP congestion algorithm (Linux)</div>
          <div style="color:var(--green)">sysctl net.ipv4.tcp_congestion_control</div>
          <div style="color:var(--green)">cat /proc/sys/net/ipv4/tcp_available_congestion_control</div>
          <div style="color:var(--cyan);margin-top:4px">! Set BBR globally</div>
          <div style="color:var(--green)">sysctl -w net.ipv4.tcp_congestion_control=bbr</div>
          <div style="color:var(--cyan);margin-top:4px">! Wireshark: see congestion in action</div>
          <div style="color:var(--blue)">tcp.analysis.retransmission   ← loss events</div>
          <div style="color:var(--blue)">tcp.analysis.dup_ack          ← 3 dup ACKs = fast retransmit trigger</div>
          <div style="color:var(--amber)">Statistics → TCP Stream Graph → Time-Sequence (tcptrace)</div>
        </div>
      </div>
    </div>
  </div>

  <!-- PART 3: TCP connection states full machine -->
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">TCP Connection State Machine — All 11 States</div>
    <div class="grid-2">
      <div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>State</th><th>Side</th><th>Meaning</th><th>Transition</th></tr>
          <tr><td style="color:var(--muted2)">CLOSED</td><td>Both</td><td>No connection</td><td>→ LISTEN (server) or SYN_SENT (client)</td></tr>
          <tr><td style="color:var(--blue)">LISTEN</td><td>Server</td><td>Waiting for SYN</td><td>→ SYN_RCVD on SYN received</td></tr>
          <tr><td style="color:var(--blue)">SYN_SENT</td><td>Client</td><td>SYN sent, awaiting SYN-ACK</td><td>→ ESTABLISHED on SYN-ACK</td></tr>
          <tr><td style="color:var(--blue)">SYN_RCVD</td><td>Server</td><td>SYN received, SYN-ACK sent</td><td>→ ESTABLISHED on ACK</td></tr>
          <tr><td style="color:var(--green);font-weight:700">ESTABLISHED</td><td>Both</td><td>Data flowing. Normal state.</td><td>→ FIN_WAIT_1 (active close)</td></tr>
          <tr><td style="color:var(--amber)">FIN_WAIT_1</td><td>Active close</td><td>FIN sent, waiting for ACK</td><td>→ FIN_WAIT_2</td></tr>
          <tr><td style="color:var(--amber)">FIN_WAIT_2</td><td>Active close</td><td>ACK received, waiting for FIN</td><td>→ TIME_WAIT on FIN</td></tr>
          <tr><td style="color:var(--amber)">CLOSE_WAIT</td><td>Passive close</td><td>FIN received, app still has data</td><td>→ LAST_ACK when app closes</td></tr>
          <tr><td style="color:var(--amber)">LAST_ACK</td><td>Passive close</td><td>FIN sent, waiting for final ACK</td><td>→ CLOSED</td></tr>
          <tr><td style="color:var(--red)">TIME_WAIT</td><td>Active close</td><td>Waiting 2×MSL (60–240s)</td><td>→ CLOSED after 2MSL timeout</td></tr>
          <tr><td style="color:var(--cyan)">CLOSING</td><td>Simultaneous close</td><td>Both sides FIN at same time</td><td>→ TIME_WAIT</td></tr>
        </table></div>
      </div>
      <div>
        <div class="card-hdr" style="margin-bottom:8px">TIME_WAIT — Why It Exists &amp; Production Impact</div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10.5px;line-height:1.9">
          <div style="color:var(--cyan)">Why 2×MSL wait? (MSL = Maximum Segment Lifetime = 30s)</div>
          <div style="color:var(--text)">Reason 1: Final ACK might be lost → server resends FIN</div>
          <div style="color:var(--text)">  Client must still be able to re-send the final ACK</div>
          <div style="color:var(--text)">Reason 2: Old duplicate segments from this connection</div>
          <div style="color:var(--text)">  must expire before new connection uses same 5-tuple</div>
          <div style="color:var(--amber);margin-top:6px">Production problem: High-traffic web servers (Nginx,</div>
          <div style="color:var(--amber)">HAProxy) accumulate thousands of TIME_WAIT sockets.</div>
          <div style="color:var(--amber)">Port range 49152-65535 = 16,383 ephemeral ports.</div>
          <div style="color:var(--amber)">If all ports in TIME_WAIT → "cannot bind" errors!</div>
          <div style="color:var(--cyan);margin-top:6px">! Linux fixes:</div>
          <div style="color:var(--green)">net.ipv4.tcp_tw_reuse = 1   ← reuse TW sockets for outbound</div>
          <div style="color:var(--green)">net.ipv4.ip_local_port_range = 1024 65535  ← wider port range</div>
          <div style="color:var(--green)">SO_REUSEADDR socket option in server apps</div>
          <div style="color:var(--cyan);margin-top:6px">! Diagnose on Linux</div>
          <div style="color:var(--blue)">ss -s                        ← socket statistics summary</div>
          <div style="color:var(--blue)">ss -tan | grep TIME-WAIT | wc -l   ← count TW sockets</div>
          <div style="color:var(--blue)">netstat -an | grep TIME_WAIT</div>
        </div>
      </div>
    </div>
  </div>

  <!-- PART 4: UDP deep dive -->
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">UDP — When Simplicity Wins</div>
    <div class="grid-2">
      <div>
        <div class="card-hdr" style="margin-bottom:8px">UDP Header — 8 Bytes Total</div>
        <svg viewBox="0 0 380 90" width="100%" style="display:block">
          <rect x="0" y="0" width="380" height="90" rx="6" fill="#0d1117" stroke="rgba(251,191,36,0.15)"/>
          <text x="8" y="13" font-family="IBM Plex Mono,monospace" font-size="8" fill="rgba(251,191,36,0.4)">UDP HEADER — RFC 768 — 8 bytes fixed (no options!)</text>
          <rect x="8" y="20" width="170" height="30" rx="4" fill="rgba(91,156,246,0.1)" stroke="rgba(91,156,246,0.35)" stroke-width="1"/>
          <text x="93" y="32" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#5b9cf6">Source Port  (16 bits)</text>
          <text x="93" y="43" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(91,156,246,0.4)">0 if not needed (one-way)</text>
          <rect x="182" y="20" width="190" height="30" rx="4" fill="rgba(91,156,246,0.1)" stroke="rgba(91,156,246,0.35)" stroke-width="1"/>
          <text x="277" y="32" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#5b9cf6">Destination Port  (16 bits)</text>
          <text x="277" y="43" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(91,156,246,0.4)">53=DNS  67=DHCP  69=TFTP  161=SNMP</text>
          <rect x="8" y="54" width="170" height="30" rx="4" fill="rgba(251,191,36,0.1)" stroke="rgba(251,191,36,0.3)" stroke-width="1"/>
          <text x="93" y="66" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#fbbf24">Length  (16 bits)</text>
          <text x="93" y="77" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(251,191,36,0.4)">Header + Data (min 8)</text>
          <rect x="182" y="54" width="190" height="30" rx="4" fill="rgba(74,222,128,0.08)" stroke="rgba(74,222,128,0.25)" stroke-width="1"/>
          <text x="277" y="66" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#4ade80">Checksum  (16 bits)</text>
          <text x="277" y="77" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(74,222,128,0.3)">Optional in IPv4, mandatory in IPv6</text>
        </svg>
        <div class="callout callout-info" style="margin-top:8px">UDP has NO: sequence numbers, ACKs, flow control, congestion control, connection state. It just stamps src/dst port + length + optional checksum and fires. The application layer handles reliability if needed (e.g., QUIC, SCTP, custom protocols).</div>
      </div>
      <div>
        <div class="card-hdr" style="margin-bottom:8px">Why UDP is the Right Choice for These Protocols</div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>Protocol</th><th>Why UDP not TCP?</th></tr>
          <tr><td style="color:var(--blue)">DNS</td><td>Single query/response fits in one packet. TCP overhead (3WHS) for every DNS lookup would be catastrophically slow. DNS uses TCP only for large responses (&gt;512B) or zone transfers.</td></tr>
          <tr><td style="color:var(--amber)">DHCP</td><td>Client has no IP yet — can't establish TCP session. UDP broadcast allows server discovery without pre-existing connection.</td></tr>
          <tr><td style="color:var(--green)">VoIP (RTP)</td><td>Retransmitting late audio is useless — a retransmitted packet arriving 200ms late creates worse artifacts than no packet. UDP + jitter buffer gives better results than TCP retransmits.</td></tr>
          <tr><td style="color:var(--cyan)">SNMP</td><td>Polling-based monitoring. Lost poll = just miss one data point. TCP overhead per poll unnecessary. SNMP traps are fire-and-forget by design.</td></tr>
          <tr><td style="color:var(--red)">QUIC (HTTP/3)</td><td>UDP-based but adds reliability, ordering, and multiplexing at the application layer — best of both worlds. Avoids TCP head-of-line blocking.</td></tr>
          <tr><td style="color:var(--muted2)">TFTP</td><td>Simple file transfer used for router/switch IOS upgrades. Implements its own basic ACK mechanism over UDP.</td></tr>
        </table></div>
      </div>
    </div>
  </div>

  <!-- TCP Q&A expansion -->
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">🎯 Advanced TCP Interview Q&amp;A</div>
    <div class="qa-list">
      <div class="qa-item">
        <div class="qa-q" onclick="toggleQA(this)">Q: A large file transfer between two servers is running at only 10 Mbps on a 1 Gbps link. Both servers show no errors. What do you investigate?<span class="qa-arrow">▶</span></div>
        <div class="qa-a">10 Mbps on a 1G link with no errors is a TCP throughput problem, not a physical layer issue. Investigate in order: ①<strong>TCP Window Size / BDP:</strong> Max throughput = Window Size / RTT. If window = 64KB and RTT = 50ms: 65536B / 0.05s = 1.3 Mbps theoretical max. Check <code>ss -tin dst [server_ip]</code> — look at "rcvbuf" and "sndbuf". On Linux, auto-tuning should handle this but may be misconfigured. ②<strong>TCP Window Scaling disabled:</strong> If window scale option was not negotiated (older OS, firewall stripping TCP options), window stays at 64KB. Run Wireshark — check SYN/SYN-ACK for Window Scale option (Kind=3). If missing, max throughput is limited. ③<strong>Firewall/middlebox stripping TCP options:</strong> Some firewalls strip all TCP options including SACK and Window Scale. Bypass the firewall and test directly. ④<strong>Jumbo frames mismatch:</strong> Servers may have jumbo frames (MTU 9000) enabled but intermediate switches don't. This causes fragmentation or PMTUD failure → TCP falls back to tiny MSS. ⑤<strong>CPU bottleneck:</strong> Check CPU on both servers — high CPU (especially softirq/kernel network processing) can rate-limit TCP. ⑥<strong>Nagle's algorithm + delayed ACK interaction:</strong> For many small writes, Nagle + 200ms delayed ACK can cause 200ms delays per RTT. Disable with TCP_NODELAY on the application socket. ⑦<code>netstat -s | grep -i retransmit</code> — even low retransmit rates (1%) can halve throughput with some congestion algorithms.</div>
      </div>
      <div class="qa-item">
        <div class="qa-q" onclick="toggleQA(this)">Q: What is TCP head-of-line blocking and how does HTTP/3 solve it?<span class="qa-arrow">▶</span></div>
        <div class="qa-a">In TCP, all data is delivered in-order. If packet N is lost, ALL subsequent packets (N+1, N+2...) are buffered and withheld from the application until N is retransmitted and received — even if those later packets arrived perfectly. This is TCP head-of-line blocking. In HTTP/2 over TCP, multiple streams are multiplexed over ONE TCP connection. If a single packet is lost, ALL streams stall waiting for retransmission — even streams that have no data loss. A single 0.01% packet loss rate can cause significant performance degradation across all browser resources. HTTP/3 (RFC 9114) is built on QUIC which runs over UDP. QUIC implements its own reliable delivery PER STREAM. If stream 3's packet is lost, streams 1,2,4,5 continue flowing — QUIC only blocks stream 3 until retransmission. No head-of-line blocking across streams. QUIC also combines TLS 1.3 handshake with connection establishment (0-RTT or 1-RTT connection vs TCP+TLS which needs 3WHS + TLS handshake = 3 round trips). This is especially impactful on mobile networks with 2–5% packet loss.</div>
      </div>
    </div>
  </div>
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">🔬 TCP State Machine & Connection Lifecycle</div>
    <div class="callout callout-info">TCP has 11 states. Understanding the full state machine is essential for diagnosing connection hangs, TIME_WAIT exhaustion, SYN floods, and half-open connections. Wireshark shows these states in detail.</div>
    <div class="grid-2">
      <div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>State</th><th>Side</th><th>Description</th></tr>
          <tr><td style="color:var(--muted2)">CLOSED</td><td>Both</td><td>No connection</td></tr>
          <tr><td style="color:var(--amber)">LISTEN</td><td>Server</td><td>Waiting for incoming SYN</td></tr>
          <tr><td style="color:var(--blue)">SYN_SENT</td><td>Client</td><td>SYN sent, waiting for SYN-ACK</td></tr>
          <tr><td style="color:var(--blue)">SYN_RECEIVED</td><td>Server</td><td>SYN received, SYN-ACK sent</td></tr>
          <tr><td style="color:var(--green)">ESTABLISHED</td><td>Both</td><td>Connection active — data flows here</td></tr>
          <tr><td style="color:var(--amber)">FIN_WAIT_1</td><td>Closer</td><td>FIN sent, waiting for ACK</td></tr>
          <tr><td style="color:var(--amber)">FIN_WAIT_2</td><td>Closer</td><td>FIN ACKed, waiting for peer FIN</td></tr>
          <tr><td style="color:var(--cyan)">CLOSE_WAIT</td><td>Peer</td><td>FIN received, app needs to close</td></tr>
          <tr><td style="color:var(--cyan)">LAST_ACK</td><td>Peer</td><td>FIN sent, waiting for final ACK</td></tr>
          <tr><td style="color:var(--red)">TIME_WAIT</td><td>Closer</td><td>2×MSL wait prevents stale segments (60-240s)</td></tr>
        </table></div>
      </div>
      <div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--red);font-weight:700">TIME_WAIT EXHAUSTION (production issue):</div>
          <div style="color:var(--muted2)">After active closer sends last ACK: waits 2×MSL (120s on Linux).</div>
          <div style="color:var(--muted2)">High-traffic servers can have thousands of TIME_WAIT sockets</div>
          <div style="color:var(--red)">exhausting ephemeral ports (32768-60999) → new connections fail!</div>
          <div style="color:var(--green)">Linux fix: SO_REUSEADDR + net.ipv4.tcp_tw_reuse=1</div>
          <div style="margin-top:8px;color:var(--amber);font-weight:700">SYN FLOOD DDoS ATTACK:</div>
          <div style="color:var(--muted2)">Attacker sends thousands of SYN packets (spoofed src IP)</div>
          <div style="color:var(--muted2)">Server → SYN-ACK → no ACK returns → half-open connections</div>
          <div style="color:var(--red)">Backlog queue fills → new LEGITIMATE connections refused!</div>
          <div style="color:var(--green)">Mitigations: SYN cookies (stateless), rate limiting,</div>
          <div style="color:var(--green)">Cisco: ip tcp intercept, anycast scrubbing services</div>
          <div style="margin-top:8px;color:var(--blue);font-weight:700">TCP KEEPALIVE vs APPLICATION KEEPALIVE:</div>
          <div style="color:var(--muted2)">TCP keepalive: OS-level. Default 2 hours (linux/windows).</div>
          <div style="color:var(--muted2)">Application keepalive: BGP (60s), OSPF (10s hellos) — much faster.</div>
          <div style="color:var(--muted2)">BGP uses TCP keepalive separately from its own hello mechanism.</div>
        </div>
      </div>
    </div>
  </div>
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">🔬 TCP Windowing, Flow Control & Congestion Control</div>
    <div class="grid-2">
      <div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--amber);font-weight:700">FLOW CONTROL (Receiver controls sender):</div>
          <div style="color:var(--muted2)">Receiver advertises Window Size in every ACK.</div>
          <div style="color:var(--muted2)">Window = bytes sender can have in-flight without ACK.</div>
          <div style="color:var(--muted2)">If receiver buffer fills → window=0 → sender stops.</div>
          <div style="color:var(--cyan)">Window Scale Option (RFC 7323): up to 2^14 multiplier</div>
          <div style="color:var(--cyan)">→ max window ~1 GB! Critical for satellite/10G WAN links.</div>
          <div style="margin-top:8px;color:var(--blue);font-weight:700">CONGESTION CONTROL (Network-triggered):</div>
          <div style="color:var(--muted2)">TCP detects congestion via:</div>
          <div style="color:var(--red)">1. Packet loss (retransmit timeout or 3 duplicate ACKs)</div>
          <div style="color:var(--red)">2. ECN marks (if ECN-capable router marks instead of drops)</div>
          <div style="color:var(--cyan)">CWND (Congestion Window) limits sender transmit rate.</div>
          <div style="color:var(--cyan)">Effective window = min(receiver_window, CWND)</div>
        </div>
      </div>
      <div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--green);font-weight:700">TCP SLOW START → CONGESTION AVOIDANCE:</div>
          <div style="color:var(--muted2)">Start: CWND = 1 MSS (1460 bytes typical)</div>
          <div style="color:var(--muted2)">Slow Start: CWND doubles every RTT → 1→2→4→8→16...</div>
          <div style="color:var(--muted2)">When CWND = ssthresh: switch to Congestion Avoidance</div>
          <div style="color:var(--muted2)">Cong. Avoidance: +1 MSS per RTT (linear, not exponential)</div>
          <div style="color:var(--red)">On loss: ssthresh = CWND/2, CWND = 1, restart slow start</div>
          <div style="margin-top:8px;color:var(--cyan);font-weight:700">MODERN ALGORITHMS:</div>
          <div style="color:var(--muted2)">TCP CUBIC (Linux default): cubic function for recovery</div>
          <div style="color:var(--muted2)">TCP BBR (Google): estimates bottleneck BW + RTT</div>
          <div style="color:var(--green)">BBR achieves 2-25× higher throughput on lossy/high-BDP links!</div>
          <div style="color:var(--muted2)">BBR ignores loss — uses bandwidth estimation instead</div>
          <div style="margin-top:8px;color:var(--amber);font-weight:700">NAGLE ALGORITHM:</div>
          <div style="color:var(--muted2)">Buffers small writes until ACK received or buffer full</div>
          <div style="color:var(--muted2)">Reduces "tiny packet" problem. Can cause latency in interactive apps.</div>
          <div style="color:var(--green)">Disable with TCP_NODELAY socket option (SSH, Telnet, gaming)</div>
        </div>
      </div>
    </div>
  </div>


</div>

<!-- ═══ CCNA TAB 5: DHCP & DNS DEEP DIVE ═══ -->
<div id="ccna-topic-5" class="topic-panel">
  <div class="topic-hero" style="border-left:4px solid var(--amber)">
    <div class="topic-title">🌐 DHCP &amp; DNS — Every Packet Field, Every Option, Every State</div>
    <div class="topic-sub">DHCP DORA process with real Wireshark field values · All DHCP options · DHCP relay · DNS hierarchy · recursive vs iterative · record types · Wireshark analysis</div>
  </div>

  <!-- DHCP Header format -->
  <div class="card">
    <div class="card-hdr">DHCP Packet Format — Built on BOOTP (RFC 2131/2132)</div>
    <div class="callout callout-info" style="margin-bottom:12px">DHCP uses UDP — server port <strong>67</strong>, client port <strong>68</strong>. It's built on top of BOOTP (Bootstrap Protocol). In Wireshark, filter with <code>bootp</code> or <code>dhcp</code>. All 4 DORA messages are UDP broadcasts or unicasts — no TCP!</div>
    <div class="tbl-wrap"><table class="tbl">
      <tr><th>Field</th><th>Size</th><th>Discover Value</th><th>Offer Value</th><th>Request Value</th><th>ACK Value</th></tr>
      <tr><td style="color:var(--blue);font-weight:700">OP (Op Code)</td><td>1 byte</td><td style="color:var(--cyan)">1 (BOOTREQUEST)</td><td style="color:var(--amber)">2 (BOOTREPLY)</td><td style="color:var(--cyan)">1 (BOOTREQUEST)</td><td style="color:var(--amber)">2 (BOOTREPLY)</td></tr>
      <tr><td style="color:var(--blue)">HTYPE</td><td>1 byte</td><td colspan="4" style="color:var(--muted2)">1 = Ethernet (all 4 messages)</td></tr>
      <tr><td style="color:var(--blue)">HLEN</td><td>1 byte</td><td colspan="4" style="color:var(--muted2)">6 = MAC address length (all 4 messages)</td></tr>
      <tr><td style="color:var(--blue)">HOPS</td><td>1 byte</td><td>0</td><td>0</td><td>0 (or N if relayed)</td><td>0</td></tr>
      <tr><td style="color:var(--amber);font-weight:700">XID (Transaction ID)</td><td>4 bytes</td><td style="color:var(--green)">0x3903F326 *</td><td style="color:var(--green)">0x3903F326 *</td><td style="color:var(--green)">0x3903F326 *</td><td style="color:var(--green)">0x3903F326 *</td></tr>
      <tr><td style="color:var(--blue)">SECS</td><td>2 bytes</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
      <tr><td style="color:var(--blue)">FLAGS</td><td>2 bytes</td><td>0x8000 (broadcast)</td><td>0x0000</td><td>0x8000 (broadcast)</td><td>0x0000</td></tr>
      <tr><td style="color:var(--red);font-weight:700">CIADDR (Client IP)</td><td>4 bytes</td><td style="color:var(--muted2)">0.0.0.0 (no IP yet)</td><td style="color:var(--muted2)">0.0.0.0</td><td style="color:var(--muted2)">0.0.0.0</td><td style="color:var(--green)">192.168.1.100</td></tr>
      <tr><td style="color:var(--green);font-weight:700">YIADDR (Your IP)</td><td>4 bytes</td><td style="color:var(--muted2)">0.0.0.0</td><td style="color:var(--green)">192.168.1.100</td><td style="color:var(--muted2)">0.0.0.0</td><td style="color:var(--green)">192.168.1.100</td></tr>
      <tr><td style="color:var(--blue)">SIADDR (Server IP)</td><td>4 bytes</td><td>0.0.0.0</td><td>192.168.1.1</td><td>0.0.0.0</td><td>192.168.1.1</td></tr>
      <tr><td style="color:var(--cyan)">CHADDR (Client MAC)</td><td>16 bytes</td><td colspan="4" style="color:var(--cyan)">00:0c:29:xx:xx:xx (client MAC, same in all 4)</td></tr>
      <tr><td style="color:var(--muted2)">SNAME</td><td>64 bytes</td><td colspan="4" style="color:var(--muted2)">Server hostname (usually empty)</td></tr>
      <tr><td style="color:var(--muted2)">FILE</td><td>128 bytes</td><td colspan="4" style="color:var(--muted2)">Boot filename (used for PXE boot)</td></tr>
      <tr><td style="color:var(--purple,#a78bfa);font-weight:700">OPTIONS</td><td>Variable</td><td>Magic cookie + Option 53 (Discover)</td><td>Opt 53(Offer)+54+51+1+3+6</td><td>Opt 53(Request)+54+50</td><td>Opt 53(ACK)+54+51+1+3+6</td></tr>
    </table></div>
    <div style="font-size:10.5px;color:var(--muted2);margin-top:6px">* XID is identical across all 4 DORA packets — links the transaction end-to-end</div>
  </div>

  <!-- DORA Step by Step -->
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">🔬 DORA Process — Step-by-Step with Real Field Values</div>
    <div class="grid-2">
      <div>
        <svg viewBox="0 0 370 380" width="100%" style="display:block">
          <rect x="0" y="0" width="370" height="380" rx="8" fill="#0d1117" stroke="rgba(251,191,36,0.15)"/>
          <text x="10" y="14" font-family="IBM Plex Mono,monospace" font-size="8" fill="rgba(251,191,36,0.4)">DHCP DORA — REAL FIELD VALUES</text>
          <!-- Client -->
          <rect x="5" y="20" width="80" height="35" rx="5" fill="rgba(56,217,192,0.1)" stroke="rgba(56,217,192,0.4)" stroke-width="1.5"/>
          <text x="45" y="35" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#38d9c0">CLIENT</text>
          <text x="45" y="46" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(56,217,192,0.4)">00:0c:29:xx</text>
          <!-- Server -->
          <rect x="285" y="20" width="80" height="35" rx="5" fill="rgba(248,113,113,0.1)" stroke="rgba(248,113,113,0.4)" stroke-width="1.5"/>
          <text x="325" y="35" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#f87171">DHCP SERVER</text>
          <text x="325" y="46" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(248,113,113,0.4)">192.168.1.1</text>
          <!-- Timeline -->
          <line x1="45" y1="58" x2="45" y2="375" stroke="rgba(56,217,192,0.15)" stroke-width="1" stroke-dasharray="3 3"/>
          <line x1="325" y1="58" x2="325" y2="375" stroke="rgba(248,113,113,0.15)" stroke-width="1" stroke-dasharray="3 3"/>
          <!-- DISCOVER -->
          <line x1="45" y1="75" x2="325" y2="95" stroke="rgba(91,156,246,0.8)" stroke-width="2"/>
          <polygon points="325,95 313,90 315,100" fill="rgba(91,156,246,0.8)"/>
          <rect x="80" y="60" width="200" height="45" rx="4" fill="rgba(91,156,246,0.1)" stroke="rgba(91,156,246,0.35)" stroke-width="1"/>
          <text x="180" y="73" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8.5" font-weight="700" fill="#5b9cf6">① DISCOVER</text>
          <text x="180" y="84" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(91,156,246,0.6)">SrcIP:0.0.0.0  DstIP:255.255.255.255</text>
          <text x="180" y="94" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(91,156,246,0.5)">SrcMAC:00:0c:29  DstMAC:FF:FF:FF:FF:FF:FF</text>
          <text x="45" y="112" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(56,217,192,0.4)">XID:3903F326</text>
          <!-- OFFER -->
          <line x1="325" y1="130" x2="45" y2="150" stroke="rgba(74,222,128,0.8)" stroke-width="2"/>
          <polygon points="45,150 57,145 55,155" fill="rgba(74,222,128,0.8)"/>
          <rect x="80" y="113" width="200" height="50" rx="4" fill="rgba(74,222,128,0.08)" stroke="rgba(74,222,128,0.3)" stroke-width="1"/>
          <text x="180" y="125" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8.5" font-weight="700" fill="#4ade80">② OFFER</text>
          <text x="180" y="136" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(74,222,128,0.6)">SrcIP:192.168.1.1  DstIP:255.255.255.255</text>
          <text x="180" y="146" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(74,222,128,0.5)">YIADDR: 192.168.1.100 (offered IP)</text>
          <text x="180" y="156" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(74,222,128,0.4)">Opt51:86400s · Opt3:192.168.1.1 · Opt6:8.8.8.8</text>
          <!-- REQUEST -->
          <line x1="45" y1="185" x2="325" y2="205" stroke="rgba(251,191,36,0.8)" stroke-width="2"/>
          <polygon points="325,205 313,200 315,210" fill="rgba(251,191,36,0.8)"/>
          <rect x="80" y="170" width="200" height="45" rx="4" fill="rgba(251,191,36,0.08)" stroke="rgba(251,191,36,0.3)" stroke-width="1"/>
          <text x="180" y="182" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8.5" font-weight="700" fill="#fbbf24">③ REQUEST</text>
          <text x="180" y="193" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(251,191,36,0.6)">SrcIP:0.0.0.0  DstIP:255.255.255.255 (!)  </text>
          <text x="180" y="203" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(251,191,36,0.5)">Opt50: 192.168.1.100 (I want this IP)</text>
          <text x="180" y="213" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(251,191,36,0.4)">Opt54: 192.168.1.1 (server identifier)</text>
          <!-- ACK -->
          <line x1="325" y1="240" x2="45" y2="260" stroke="rgba(167,139,250,0.8)" stroke-width="2"/>
          <polygon points="45,260 57,255 55,265" fill="rgba(167,139,250,0.8)"/>
          <rect x="80" y="222" width="200" height="50" rx="4" fill="rgba(167,139,250,0.08)" stroke="rgba(167,139,250,0.3)" stroke-width="1"/>
          <text x="180" y="235" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8.5" font-weight="700" fill="#a78bfa">④ ACK</text>
          <text x="180" y="246" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(167,139,250,0.6)">YIADDR: 192.168.1.100 (confirmed)</text>
          <text x="180" y="256" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(167,139,250,0.5)">Opt51: 86400s (lease time = 24 hrs)</text>
          <text x="180" y="266" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(167,139,250,0.4)">Opt6: 8.8.8.8, 8.8.4.4 (DNS servers)</text>
          <!-- Established note -->
          <rect x="5" y="284" width="358" height="28" rx="4" fill="rgba(74,222,128,0.08)" stroke="rgba(74,222,128,0.2)"/>
          <text x="182" y="298" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(74,222,128,0.6)">Client now has: IP 192.168.1.100/? · GW 192.168.1.1 · DNS 8.8.8.8</text>
          <text x="182" y="308" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(74,222,128,0.4)">Client broadcasts Gratuitous ARP to check for IP conflicts</text>
          <!-- Key question note -->
          <rect x="5" y="318" width="358" height="55" rx="4" fill="rgba(248,113,113,0.06)" stroke="rgba(248,113,113,0.2)"/>
          <text x="182" y="332" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(248,113,113,0.6)">❓INTERVIEW Q: Why is REQUEST still a broadcast?</text>
          <text x="182" y="344" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(140,150,180,0.5)">Multiple DHCP servers may have responded to DISCOVER.</text>
          <text x="182" y="356" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(140,150,180,0.5)">Broadcasting REQUEST lets ALL servers know which offer</text>
          <text x="182" y="368" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(140,150,180,0.5)">was accepted. Others release their reserved IPs.</text>
        </svg>
      </div>
      <div>
        <div class="card">
          <div class="card-hdr">Key DHCP Options — Complete Reference (RFC 2132)</div>
          <div class="tbl-wrap"><table class="tbl">
            <tr><th>Option #</th><th>Name</th><th>Sent in</th><th>Example Value</th></tr>
            <tr><td style="color:var(--amber);font-weight:700">53</td><td>DHCP Message Type</td><td>All</td><td>1=Disc 2=Offer 3=Req 5=ACK 6=NAK</td></tr>
            <tr><td style="color:var(--blue)">54</td><td>Server Identifier</td><td>Offer, ACK</td><td>192.168.1.1 (DHCP server IP)</td></tr>
            <tr><td style="color:var(--green)">51</td><td>IP Lease Time</td><td>Offer, ACK</td><td>86400 = 24 hours</td></tr>
            <tr><td style="color:var(--green)">58</td><td>Renewal Time (T1)</td><td>ACK</td><td>43200 = 50% of lease (12hrs)</td></tr>
            <tr><td style="color:var(--green)">59</td><td>Rebinding Time (T2)</td><td>ACK</td><td>75600 = 87.5% of lease (21hrs)</td></tr>
            <tr><td style="color:var(--cyan)">1</td><td>Subnet Mask</td><td>Offer, ACK</td><td>255.255.255.0</td></tr>
            <tr><td style="color:var(--cyan)">3</td><td>Default Gateway</td><td>Offer, ACK</td><td>192.168.1.1</td></tr>
            <tr><td style="color:var(--cyan)">6</td><td>DNS Servers</td><td>Offer, ACK</td><td>8.8.8.8, 8.8.4.4</td></tr>
            <tr><td style="color:var(--cyan)">15</td><td>Domain Name</td><td>Offer, ACK</td><td>example.com</td></tr>
            <tr><td style="color:var(--muted2)">50</td><td>Requested IP</td><td>Discover, Request</td><td>192.168.1.100 (client prefers)</td></tr>
            <tr><td style="color:var(--muted2)">55</td><td>Parameter Request List</td><td>Discover</td><td>List of options client wants (1,3,6,15...)</td></tr>
            <tr><td style="color:var(--muted2)">82</td><td>Relay Agent Info</td><td>Discover, Request</td><td>Circuit-ID, Remote-ID (added by relay)</td></tr>
          </table></div>
        </div>
        <div class="card" style="margin-top:14px">
          <div class="card-hdr">DHCP Relay — How It Works Across Subnets</div>
          <div class="callout callout-info" style="margin-bottom:8px">DHCP broadcasts don't cross router boundaries. DHCP Relay Agent (ip helper-address) converts the local broadcast into a unicast to the DHCP server and adds Option 82.</div>
          <svg viewBox="0 0 370 135" width="100%" style="display:block">
            <rect x="0" y="0" width="370" height="135" rx="6" fill="#0d1117" stroke="rgba(56,217,192,0.1)"/>
            <text x="8" y="12" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(56,217,192,0.4)">DHCP RELAY — ip helper-address</text>
            <!-- Client -->
            <rect x="5" y="18" width="60" height="40" rx="5" fill="rgba(56,217,192,0.1)" stroke="rgba(56,217,192,0.35)" stroke-width="1"/>
            <text x="35" y="35" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="#38d9c0">CLIENT</text>
            <text x="35" y="45" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6" fill="rgba(56,217,192,0.4)">10.1.1.10</text>
            <!-- Router/Relay -->
            <rect x="115" y="18" width="80" height="50" rx="5" fill="rgba(91,156,246,0.1)" stroke="rgba(91,156,246,0.4)" stroke-width="1.5"/>
            <text x="155" y="35" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="#5b9cf6">RELAY ROUTER</text>
            <text x="155" y="46" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(91,156,246,0.5)">Gi0/0: 10.1.1.1</text>
            <text x="155" y="57" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(91,156,246,0.5)">ip helper-address</text>
            <text x="155" y="66" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(91,156,246,0.5)">192.168.1.200</text>
            <!-- Server -->
            <rect x="255" y="18" width="110" height="40" rx="5" fill="rgba(248,113,113,0.1)" stroke="rgba(248,113,113,0.35)" stroke-width="1"/>
            <text x="310" y="35" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="#f87171">DHCP SERVER</text>
            <text x="310" y="46" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6" fill="rgba(248,113,113,0.4)">192.168.1.200</text>
            <!-- Arrows -->
            <line x1="65" y1="38" x2="115" y2="38" stroke="rgba(56,217,192,0.5)" stroke-width="1.5"/>
            <polygon points="115,38 103,33 105,43" fill="rgba(56,217,192,0.5)"/>
            <text x="90" y="32" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(56,217,192,0.5)">broadcast</text>
            <line x1="195" y1="43" x2="255" y2="43" stroke="rgba(91,156,246,0.6)" stroke-width="1.5"/>
            <polygon points="255,43 243,38 245,48" fill="rgba(91,156,246,0.6)"/>
            <text x="225" y="37" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(91,156,246,0.5)">unicast</text>
            <!-- Config -->
            <rect x="5" y="76" width="360" height="55" rx="4" fill="rgba(0,0,0,0.4)" stroke="rgba(255,255,255,0.03)"/>
            <text x="12" y="90" font-family="IBM Plex Mono,monospace" font-size="9" fill="rgba(91,156,246,0.6)">Router config:</text>
            <text x="12" y="103" font-family="IBM Plex Mono,monospace" font-size="9" fill="rgba(74,222,128,0.7)">interface GigabitEthernet0/0</text>
            <text x="12" y="115" font-family="IBM Plex Mono,monospace" font-size="9" fill="rgba(74,222,128,0.7)"> ip address 10.1.1.1 255.255.255.0</text>
            <text x="12" y="127" font-family="IBM Plex Mono,monospace" font-size="9" fill="rgba(74,222,128,0.7)"> ip helper-address 192.168.1.200</text>
          </svg>
        </div>
      </div>
    </div>
  </div>

  <!-- DNS Deep Dive -->
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">🌍 DNS — Domain Name System Complete Deep Dive</div>
    <div class="callout callout-info" style="margin-bottom:12px">DNS uses UDP port 53 for queries (≤512 bytes), TCP port 53 for responses &gt;512 bytes or zone transfers. DNS over HTTPS (DoH) and DNS over TLS (DoT) use port 443/853 respectively. There are <strong>13 root server clusters</strong> (a.root-servers.net through m.root-servers.net) — actually hundreds of physical servers using anycast.</div>
    <div class="grid-2">
      <div>
        <div class="card-hdr" style="margin-bottom:8px">DNS Hierarchy</div>
        <svg viewBox="0 0 380 235" width="100%" style="display:block">
          <rect x="0" y="0" width="380" height="235" rx="6" fill="#0d1117" stroke="rgba(56,217,192,0.1)"/>
          <text x="10" y="14" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(56,217,192,0.4)">DNS HIERARCHY — from root to authoritative</text>
          <!-- Root level -->
          <rect x="135" y="20" width="110" height="30" rx="5" fill="rgba(248,113,113,0.12)" stroke="rgba(248,113,113,0.4)" stroke-width="1.5"/>
          <text x="190" y="33" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8.5" font-weight="700" fill="#f87171">ROOT " . "</text>
          <text x="190" y="44" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(248,113,113,0.5)">13 clusters (a-m.root-servers.net)</text>
          <!-- TLD level -->
          <line x1="140" y1="50" x2="80" y2="78" stroke="rgba(251,191,36,0.3)" stroke-width="1"/>
          <line x1="190" y1="50" x2="190" y2="78" stroke="rgba(251,191,36,0.3)" stroke-width="1"/>
          <line x1="240" y1="50" x2="300" y2="78" stroke="rgba(251,191,36,0.3)" stroke-width="1"/>
          <rect x="30" y="78" width="70" height="26" rx="4" fill="rgba(251,191,36,0.1)" stroke="rgba(251,191,36,0.35)" stroke-width="1"/>
          <text x="65" y="93" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#fbbf24">.com TLD</text>
          <rect x="150" y="78" width="70" height="26" rx="4" fill="rgba(251,191,36,0.1)" stroke="rgba(251,191,36,0.35)" stroke-width="1"/>
          <text x="185" y="93" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#fbbf24">.org TLD</text>
          <rect x="265" y="78" width="70" height="26" rx="4" fill="rgba(251,191,36,0.1)" stroke="rgba(251,191,36,0.35)" stroke-width="1"/>
          <text x="300" y="93" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#fbbf24">.net TLD</text>
          <!-- Auth DNS level -->
          <line x1="65" y1="104" x2="65" y2="132" stroke="rgba(91,156,246,0.3)" stroke-width="1"/>
          <line x1="65" y1="104" x2="185" y2="132" stroke="rgba(91,156,246,0.3)" stroke-width="1"/>
          <line x1="185" y1="104" x2="295" y2="132" stroke="rgba(91,156,246,0.3)" stroke-width="1"/>
          <rect x="5" y="132" width="115" height="28" rx="4" fill="rgba(91,156,246,0.1)" stroke="rgba(91,156,246,0.35)" stroke-width="1"/>
          <text x="62" y="146" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#5b9cf6">ns1.google.com Auth</text>
          <text x="62" y="156" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(91,156,246,0.4)">Has A records for *.google.com</text>
          <rect x="130" y="132" width="115" height="28" rx="4" fill="rgba(91,156,246,0.1)" stroke="rgba(91,156,246,0.35)" stroke-width="1"/>
          <text x="187" y="146" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#5b9cf6">ns1.cisco.com Auth</text>
          <text x="187" y="156" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(91,156,246,0.4)">Has A records for *.cisco.com</text>
          <rect x="255" y="132" width="115" height="28" rx="4" fill="rgba(91,156,246,0.1)" stroke="rgba(91,156,246,0.35)" stroke-width="1"/>
          <text x="312" y="146" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#5b9cf6">ns1.akamai.com Auth</text>
          <text x="312" y="156" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(91,156,246,0.4)">Has A,AAAA,CNAME records</text>
          <!-- Recursive resolver -->
          <line x1="50" y1="170" x2="150" y2="184" stroke="rgba(56,217,192,0.2)" stroke-width="1" stroke-dasharray="3 2"/>
          <line x1="200" y1="160" x2="200" y2="184" stroke="rgba(56,217,192,0.2)" stroke-width="1" stroke-dasharray="3 2"/>
          <rect x="100" y="184" width="175" height="30" rx="4" fill="rgba(56,217,192,0.1)" stroke="rgba(56,217,192,0.35)" stroke-width="1.5"/>
          <text x="187" y="197" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#38d9c0">Recursive Resolver</text>
          <text x="187" y="208" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(56,217,192,0.4)">8.8.8.8 or 1.1.1.1 (caches results)</text>
          <!-- Client -->
          <rect x="150" y="222" width="75" height="10" rx="3" fill="rgba(140,150,180,0.1)" stroke="rgba(140,150,180,0.2)"/>
          <text x="187" y="229" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(140,150,180,0.5)">Your PC/phone</text>
          <line x1="187" y1="214" x2="187" y2="222" stroke="rgba(140,150,180,0.2)" stroke-width="1"/>
        </svg>
      </div>
      <div>
        <div class="card-hdr" style="margin-bottom:8px">Recursive vs Iterative Resolution</div>
        <div class="callout callout-info" style="margin-bottom:8px"><strong>Client → Resolver: RECURSIVE</strong> ("don't come back until you have the answer")<br><strong>Resolver → Root/TLD/Auth: ITERATIVE</strong> ("give me the next hop or the final answer")</div>
        <svg viewBox="0 0 380 200" width="100%" style="display:block">
          <rect x="0" y="0" width="380" height="200" rx="6" fill="#0d1117" stroke="rgba(91,156,246,0.1)"/>
          <text x="10" y="14" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(91,156,246,0.4)">www.google.com resolution flow</text>
          <!-- Boxes -->
          <rect x="5" y="20" width="60" height="28" rx="3" fill="rgba(56,217,192,0.1)" stroke="rgba(56,217,192,0.3)" stroke-width="1"/>
          <text x="35" y="37" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="#38d9c0">PC</text>
          <rect x="85" y="20" width="70" height="28" rx="3" fill="rgba(91,156,246,0.1)" stroke="rgba(91,156,246,0.3)" stroke-width="1"/>
          <text x="120" y="37" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="#5b9cf6">Resolver 8.8.8.8</text>
          <rect x="175" y="20" width="60" height="28" rx="3" fill="rgba(248,113,113,0.1)" stroke="rgba(248,113,113,0.3)" stroke-width="1"/>
          <text x="205" y="37" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="#f87171">Root ".'"</text>
          <rect x="255" y="20" width="60" height="28" rx="3" fill="rgba(251,191,36,0.1)" stroke="rgba(251,191,36,0.3)" stroke-width="1"/>
          <text x="285" y="37" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="#fbbf24">.com TLD</text>
          <rect x="325" y="20" width="50" height="28" rx="3" fill="rgba(74,222,128,0.1)" stroke="rgba(74,222,128,0.3)" stroke-width="1"/>
          <text x="350" y="37" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="#4ade80">Auth NS</text>
          <!-- Step arrows -->
          <line x1="65" y1="34" x2="85" y2="34" stroke="rgba(56,217,192,0.6)" stroke-width="1.5"/>
          <polygon points="85,34 73,29 75,39" fill="rgba(56,217,192,0.6)"/>
          <text x="75" y="28" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(56,217,192,0.5)">①Recursive</text>
          <!-- Resolver iterative queries -->
          <line x1="155" y1="48" x2="175" y2="58" stroke="rgba(91,156,246,0.5)" stroke-width="1"/>
          <text x="165" y="56" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(91,156,246,0.5)">②Iter</text>
          <line x1="205" y1="68" x2="155" y2="80" stroke="rgba(248,113,113,0.5)" stroke-width="1" stroke-dasharray="3 2"/>
          <text x="175" y="72" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(248,113,113,0.5)">"Ask .com TLD"</text>
          <line x1="155" y1="90" x2="255" y2="80" stroke="rgba(91,156,246,0.5)" stroke-width="1"/>
          <text x="205" y="78" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(91,156,246,0.5)">③Iter</text>
          <line x1="285" y1="90" x2="155" y2="105" stroke="rgba(251,191,36,0.5)" stroke-width="1" stroke-dasharray="3 2"/>
          <text x="220" y="100" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(251,191,36,0.5)">"Ask ns1.google.com"</text>
          <line x1="155" y1="115" x2="325" y2="105" stroke="rgba(91,156,246,0.5)" stroke-width="1"/>
          <text x="240" y="113" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(91,156,246,0.5)">④Iter</text>
          <line x1="350" y1="115" x2="155" y2="130" stroke="rgba(74,222,128,0.7)" stroke-width="1.5" stroke-dasharray="3 2"/>
          <text x="255" y="128" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(74,222,128,0.6)">"142.250.80.14" ← FINAL ANSWER</text>
          <!-- Final response to PC -->
          <line x1="85" y1="140" x2="65" y2="140" stroke="rgba(74,222,128,0.8)" stroke-width="2"/>
          <polygon points="65,140 77,135 75,145" fill="rgba(74,222,128,0.8)"/>
          <text x="120" y="135" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(74,222,128,0.6)">⑤ Recursive response: 142.250.80.14</text>
          <!-- Notes -->
          <rect x="5" y="155" width="370" height="40" rx="4" fill="rgba(0,0,0,0.4)"/>
          <text x="10" y="168" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(56,217,192,0.5)">Caching: Resolver caches ALL responses for TTL duration. Next lookup = instant from cache.</text>
          <text x="10" y="180" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(91,156,246,0.5)">Resolver checks cache first → root hints last. Typical resolution: &lt;100ms. Cached: &lt;5ms.</text>
          <text x="10" y="192" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(140,150,180,0.4)">dig +trace www.google.com → shows all iterative steps above</text>
        </svg>
      </div>
    </div>
  </div>

  <!-- DNS Record Types -->
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">DNS Record Types — Complete Reference</div>
    <div class="grid-2">
      <div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>Record</th><th>Full Name</th><th>Purpose</th><th>Example</th></tr>
          <tr><td style="color:var(--blue);font-weight:700">A</td><td>Address</td><td>Hostname → IPv4</td><td>www.cisco.com → 72.163.4.185</td></tr>
          <tr><td style="color:var(--blue);font-weight:700">AAAA</td><td>IPv6 Address</td><td>Hostname → IPv6</td><td>www.google.com → 2607:f8b0::200e</td></tr>
          <tr><td style="color:var(--cyan)">CNAME</td><td>Canonical Name</td><td>Alias → another hostname</td><td>www.example.com → example.com</td></tr>
          <tr><td style="color:var(--amber)">MX</td><td>Mail Exchange</td><td>Email server for domain</td><td>@cisco.com → mail.cisco.com (prio 10)</td></tr>
          <tr><td style="color:var(--green)">PTR</td><td>Pointer</td><td>Reverse DNS: IP → hostname</td><td>8.8.8.8 → dns.google</td></tr>
          <tr><td style="color:var(--amber)">NS</td><td>Name Server</td><td>Authoritative NS for zone</td><td>google.com → ns1.google.com</td></tr>
          <tr><td style="color:var(--red)">SOA</td><td>Start of Auth.</td><td>Zone metadata, primary NS, serial</td><td>Zone's master record</td></tr>
          <tr><td style="color:var(--muted2)">TXT</td><td>Text</td><td>SPF, DKIM, DMARC, domain verification</td><td>v=spf1 include:google.com</td></tr>
          <tr><td style="color:var(--muted2)">SRV</td><td>Service</td><td>Service location (SIP, LDAP)</td><td>_sip._tcp.example.com</td></tr>
          <tr><td style="color:var(--muted2)">CAA</td><td>Cert Authority Auth.</td><td>Which CAs can issue certs</td><td>issue "letsencrypt.org"</td></tr>
        </table></div>
      </div>
      <div>
        <div class="card-hdr" style="margin-bottom:8px">DNS Wireshark Analysis — What to Look For</div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10.5px;line-height:1.9">
          <div style="color:var(--cyan)">! Wireshark DNS filter</div>
          <div style="color:var(--blue)">dns                         ← all DNS</div>
          <div style="color:var(--blue)">dns.flags.response == 0     ← queries only</div>
          <div style="color:var(--blue)">dns.flags.response == 1     ← responses only</div>
          <div style="color:var(--amber)">dns.flags.rcode != 0        ← errors (NXDOMAIN etc)</div>
          <div style="color:var(--cyan);margin-top:6px">! DNS response codes (RCODE):</div>
          <div style="color:var(--green)">0 = NOERROR    ← success</div>
          <div style="color:var(--red)">1 = FORMERR    ← bad query format</div>
          <div style="color:var(--red)">2 = SERVFAIL   ← server failure</div>
          <div style="color:var(--red)">3 = NXDOMAIN   ← name doesn't exist</div>
          <div style="color:var(--amber)">5 = REFUSED    ← policy refuse</div>
          <div style="color:var(--cyan);margin-top:6px">! CLI verification:</div>
          <div style="color:var(--green)">nslookup www.google.com       ← basic lookup</div>
          <div style="color:var(--green)">dig www.google.com A          ← specific record</div>
          <div style="color:var(--green)">dig +trace www.google.com     ← full resolution trace</div>
          <div style="color:var(--green)">dig -x 8.8.8.8               ← reverse lookup (PTR)</div>
          <div style="color:var(--green)">dig @8.8.8.8 www.cisco.com   ← query specific server</div>
        </div>
        <div class="callout callout-warn" style="margin-top:8px">⚠️ <strong>DNS TTL Interview Trap:</strong> A low DNS TTL (e.g. 60s) means frequent re-resolution — more DNS traffic but faster failover. A high TTL (e.g. 86400s=24hr) means faster responses (caching) but slow failover if IP changes. Akamai CDN uses low TTLs (1-20s) for traffic steering and fast geographic failover.</div>
      </div>
    </div>
  </div>

  <div class="card" style="margin-top:14px">
    <div class="card-hdr">🎯 CCIE Interview Q&amp;A — DHCP &amp; DNS</div>
    <div class="qa-list">
      <div class="qa-item">
        <div class="qa-q" onclick="toggleQA(this)">Q: Why does a DHCP client broadcast the REQUEST even though it already received an OFFER from one server?<span class="qa-arrow">▶</span></div>
        <div class="qa-a">In a real network, multiple DHCP servers may respond to the DISCOVER broadcast — each one reserves an IP address and waits. The client broadcasts REQUEST because it needs to: ①Inform ALL servers which server's offer it accepted. ②Allow the servers whose offers were NOT chosen to release the reserved IPs back to their pools. If the REQUEST were unicast to the chosen server only, the other servers would hold those IPs reserved indefinitely (until a timeout). The broadcast ensures all servers on the segment see the selection. Only the selected server sends a DHCP ACK. This is also why Option 54 (Server Identifier = server's IP) is critical in the REQUEST — it tells all servers which one won.</div>
      </div>
      <div class="qa-item">
        <div class="qa-q" onclick="toggleQA(this)">Q: DHCP snooping — what is it and why does it matter?<span class="qa-arrow">▶</span></div>
        <div class="qa-a">DHCP snooping is a Layer 2 security feature on switches that prevents "rogue DHCP server" attacks. Without it: an attacker can plug in their own device running a DHCP server, and legitimate clients get fake gateway/DNS IPs pointing to the attacker (MITM attack). <strong>How it works:</strong> Switch ports are configured as "trusted" (uplink to real DHCP server) or "untrusted" (client ports). DHCP OFFER and ACK messages arriving on untrusted ports are DROPPED — only trusted ports can send offers. Additionally, snooping builds a binding table (MAC → IP → port → VLAN) used by Dynamic ARP Inspection (DAI) and IP Source Guard for further validation. <strong>Config:</strong> <code>ip dhcp snooping</code> globally, <code>ip dhcp snooping vlan 10</code>, <code>ip dhcp snooping trust</code> on uplink ports only. CRITICAL: Don't forget to configure rate-limit on untrusted ports to prevent DHCP exhaustion attacks.</div>
      </div>
      <div class="qa-item">
        <div class="qa-q" onclick="toggleQA(this)">Q: What is DNSSEC and why is it important? What problem does it solve?<span class="qa-arrow">▶</span></div>
        <div class="qa-a">DNS by default has NO authentication — a resolver accepts any response. This enables <strong>DNS cache poisoning (Kaminsky attack)</strong>: an attacker floods a resolver with fake responses, eventually getting one accepted and cached. The resolver then returns the attacker's IP for a legitimate domain. DNSSEC adds cryptographic signatures (RSA or ECDSA) to DNS records. The chain of trust: IANA signs the root zone with a root KSK → TLD zones sign with their KSK → authoritative zones sign their records. A validating resolver checks the chain before accepting responses. <strong>Limitations:</strong> DNSSEC only validates authenticity — it does NOT encrypt DNS traffic (DNSSEC responses are public). For privacy, DNS over TLS (DoT) port 853 or DNS over HTTPS (DoH) port 443 are used. Many CDNs including Akamai support both DNSSEC and DoH.</div>
      </div>
    </div>
  </div>
</div>


<div id="ccna-topic-8" class="topic-panel">
  <div class="topic-hero" style="border-left:4px solid var(--cyan)">
    <div class="topic-title">🔄 NAT &amp; PAT — Network Address Translation Deep Dive</div>
    <div class="topic-sub">Static · Dynamic · PAT/Overload · NAT table mechanics · NAT64 · Troubleshooting · ALG · NAT-T for VPN</div>
  </div>
  <div class="card">
    <div class="card-hdr">NAT Types — Complete Comparison</div>
    <div class="callout callout-info">NAT (RFC 3022) was invented as a stopgap for IPv4 exhaustion. It maps private RFC 1918 addresses to public routable addresses. Every enterprise uses NAT — understanding it at packet level is mandatory for CCNA through CCIE.</div>
    <div class="tbl-wrap"><table class="tbl">
      <tr><th>Type</th><th>Mapping</th><th>Use Case</th><th>Ports Translated?</th><th>Config Command</th></tr>
      <tr><td style="color:var(--blue)">Static NAT</td><td>1 private ↔ 1 public (fixed)</td><td>Servers needing permanent public IP (web, mail)</td><td>No</td><td>ip nat inside source static 10.1.1.1 203.0.113.1</td></tr>
      <tr><td style="color:var(--cyan)">Dynamic NAT</td><td>1 private → 1 pool public (rotates)</td><td>Pools of users needing temporary public IPs</td><td>No</td><td>ip nat inside source list 1 pool MYPOOL</td></tr>
      <tr><td style="color:var(--amber)">PAT / Overload</td><td>Many private → 1 public (port-differentiated)</td><td>Typical home/enterprise internet access</td><td>YES — TCP/UDP port</td><td>ip nat inside source list 1 interface Gi0/0 overload</td></tr>
      <tr><td style="color:var(--green)">Static PAT</td><td>1 private:port ↔ 1 public:port</td><td>Port forwarding (e.g. DMZ web server)</td><td>YES — static mapping</td><td>ip nat inside source static tcp 10.1.1.10 80 203.0.113.1 80</td></tr>
      <tr><td style="color:var(--pink)">NAT64</td><td>IPv6 client → IPv4 server</td><td>IPv6-only clients reaching IPv4 internet</td><td>Optional</td><td>nat64 prefix stateful 64:ff9b::/96</td></tr>
    </table></div>
  </div>
  <div class="grid-2" style="margin-top:14px">
    <div>
      <div class="card">
        <div class="card-hdr">PAT Mechanics — How Overload Really Works</div>
        <div class="callout callout-info" style="margin-bottom:10px">PAT (Port Address Translation) is the reason one public IP can serve 65,535 simultaneous connections. The router adds a unique source port to differentiate sessions.</div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10.5px;line-height:1.9">
          <div style="color:var(--cyan)">OUTBOUND (private → public):</div>
          <div style="color:var(--text)">PC-A (10.1.1.10:1024) sends to 8.8.8.8:53</div>
          <div style="color:var(--blue)">Router translates: 10.1.1.10:1024 → 203.0.113.1:10001</div>
          <div style="color:var(--text)">PC-B (10.1.1.20:1024) sends to 8.8.8.8:53</div>
          <div style="color:var(--blue)">Router translates: 10.1.1.20:1024 → 203.0.113.1:10002</div>
          <div style="margin-top:8px;color:var(--cyan)">NAT TABLE ENTRY:</div>
          <div style="color:var(--green)">Proto  Inside Local     Inside Global    Outside Global</div>
          <div style="color:var(--green)">UDP    10.1.1.10:1024  203.0.113.1:10001  8.8.8.8:53</div>
          <div style="color:var(--green)">UDP    10.1.1.20:1024  203.0.113.1:10002  8.8.8.8:53</div>
          <div style="margin-top:8px;color:var(--cyan)">INBOUND (public → private):</div>
          <div style="color:var(--text)">8.8.8.8:53 replies to 203.0.113.1:10001</div>
          <div style="color:var(--blue)">Router looks up 10001 → translates BACK to 10.1.1.10:1024</div>
          <div style="color:var(--amber);margin-top:6px">Key: same public IP, DIFFERENT ports = different sessions</div>
        </div>
        <div class="callout callout-warn" style="margin-top:8px">⚠️ <strong>CCIE trap:</strong> PAT runs out of ports at ~65,535 simultaneous sessions per public IP. With NAT pool + overload, each pool IP gets its own 65K port space. CGNAT (Carrier-Grade NAT) stacks multiple public IPs.</div>
      </div>
      <div class="card" style="margin-top:14px">
        <div class="card-hdr">NAT Configuration — Full Cisco IOS</div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--cyan)">! Step 1: Define inside/outside interfaces</div>
          <div style="color:var(--green)">interface GigabitEthernet0/0</div>
          <div style="color:var(--green)"> ip address 10.1.1.1 255.255.255.0</div>
          <div style="color:var(--blue)"> ip nat inside              ← mark as inside</div>
          <div style="color:var(--green)">interface GigabitEthernet0/1</div>
          <div style="color:var(--green)"> ip address 203.0.113.1 255.255.255.252</div>
          <div style="color:var(--blue)"> ip nat outside             ← mark as outside</div>
          <div style="margin-top:6px;color:var(--cyan)">! Step 2: Define what to translate (ACL)</div>
          <div style="color:var(--green)">ip access-list standard NAT-INSIDE</div>
          <div style="color:var(--green)"> permit 10.1.1.0 0.0.0.255</div>
          <div style="margin-top:6px;color:var(--cyan)">! Step 3: PAT (overload on outside interface)</div>
          <div style="color:var(--amber)">ip nat inside source list NAT-INSIDE interface Gi0/1 overload</div>
          <div style="margin-top:6px;color:var(--cyan)">! Or Dynamic NAT with a pool</div>
          <div style="color:var(--green)">ip nat pool MYPOOL 203.0.113.2 203.0.113.10 netmask 255.255.255.0</div>
          <div style="color:var(--amber)">ip nat inside source list NAT-INSIDE pool MYPOOL overload</div>
          <div style="margin-top:6px;color:var(--cyan)">! Static port forward (DMZ web server)</div>
          <div style="color:var(--amber)">ip nat inside source static tcp 10.1.1.100 80 203.0.113.1 80</div>
          <div style="margin-top:6px;color:var(--cyan)">! Verification</div>
          <div style="color:var(--blue)">show ip nat translations        ← active sessions</div>
          <div style="color:var(--blue)">show ip nat statistics          ← hit/miss counters</div>
          <div style="color:var(--red)">debug ip nat                    ← per-packet (use carefully!)</div>
          <div style="color:var(--blue)">clear ip nat translation *      ← flush all entries</div>
        </div>
      </div>
    </div>
    <div>
      <div class="card">
        <div class="card-hdr">NAT Translation Table — Four Address Types</div>
        <div class="callout callout-info" style="margin-bottom:10px">Cisco uses four specific terms. Confusing them is the #1 NAT exam mistake.</div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>Term</th><th>Meaning</th><th>Example</th></tr>
          <tr><td style="color:var(--blue)">Inside Local</td><td>Private IP of inside host (as seen inside)</td><td>10.1.1.10:1024</td></tr>
          <tr><td style="color:var(--cyan)">Inside Global</td><td>Public IP of inside host (as seen outside)</td><td>203.0.113.1:10001</td></tr>
          <tr><td style="color:var(--amber)">Outside Global</td><td>Public IP of outside server (as seen outside)</td><td>8.8.8.8:53</td></tr>
          <tr><td style="color:var(--green)">Outside Local</td><td>IP of outside server as seen by inside hosts (same as Outside Global unless Twice NAT)</td><td>8.8.8.8:53</td></tr>
        </table></div>
        <div class="callout callout-warn" style="margin-top:8px">⚠️ Twice NAT (double NAT): translates BOTH source AND destination. Used when two overlapping IP spaces communicate (e.g. two merged companies with same RFC 1918 range). Extremely complex to troubleshoot.</div>
      </div>
      <div class="card" style="margin-top:14px">
        <div class="card-hdr">NAT ALG — Protocol-Specific Helpers</div>
        <div class="callout callout-info" style="margin-bottom:8px">Some protocols embed IP addresses INSIDE the payload (not just headers). NAT must inspect and rewrite the payload too — this is the ALG (Application Layer Gateway) function.</div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>Protocol</th><th>Problem</th><th>ALG Action</th></tr>
          <tr><td style="color:var(--blue)">FTP (Active mode)</td><td>Client sends private IP in PORT command</td><td>NAT rewrites PORT command payload with public IP</td></tr>
          <tr><td style="color:var(--cyan)">SIP/VoIP</td><td>Private IP in SDP body (media RTP address)</td><td>NAT rewrites SDP c= and m= lines</td></tr>
          <tr><td style="color:var(--amber)">H.323</td><td>Private IP embedded in H.323 PDUs</td><td>H.323 ALG rewrites gatekeeper registrations</td></tr>
          <tr><td style="color:var(--green)">PPTP</td><td>GRE protocol has no ports — NAT-T needed</td><td>NAT tracks GRE call IDs instead of ports</td></tr>
          <tr><td style="color:var(--red)">IPSec ESP (tunnel)</td><td>Encrypted — NAT can't see ports. Breaks ESP.</td><td>NAT-T: encapsulate ESP in UDP 4500</td></tr>
        </table></div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:10px;font-family:var(--mono);font-size:10px;line-height:1.8;margin-top:8px">
          <div style="color:var(--cyan)">! NAT-T for IPSec (critical for site-to-site VPN behind NAT)</div>
          <div style="color:var(--green)">crypto isakmp nat-traversal 20    ← enable NAT-T, keepalive 20s</div>
          <div style="color:var(--muted)">IKE detects NAT in path via RFC 3947 vendor ID</div>
          <div style="color:var(--muted)">If NAT detected: switch from UDP 500 → UDP 4500</div>
          <div style="color:var(--muted)">ESP wrapped in UDP 4500 — PAT can track it</div>
        </div>
      </div>
      <div class="card" style="margin-top:14px">
        <div class="card-hdr">🎯 NAT/PAT Interview Q&amp;A</div>
        <div class="qa-list">
          <div class="qa-item"><div class="qa-q" onclick="toggleQA(this)">Q: A user can ping 8.8.8.8 but cannot browse to google.com. NAT is configured. What do you check?<span class="qa-arrow">▶</span></div><div class="qa-a">DNS is UDP/TCP port 53. If ping works, ICMP translation is fine. The issue is likely DNS. Check: ①<strong>show ip nat translations</strong> — do you see UDP:53 entries? If no DNS entries, the DNS packet is not being NATted. ②Check ACL — does the NAT ACL permit the DNS server's response path? The ACL is checked on the inside interface for outbound traffic. ③Check if DNS server is reachable (try nslookup from a PC). ④If using PAT with overload, check <strong>show ip nat statistics</strong> for "misses" — misses mean no translation was found (packet dropped). ⑤Check if ip nat inside / ip nat outside are on the correct interfaces — common mistake is putting ip nat inside on the wrong interface. ⑥If using an ACL that only permits the internal subnet, verify the DNS server IP isn't being used as a source (shouldn't be, but check). Fix attempt: clear ip nat translation * and retry.</div></div>
          <div class="qa-item"><div class="qa-q" onclick="toggleQA(this)">Q: What happens to an IPSec VPN tunnel when both sides are behind NAT?<span class="qa-arrow">▶</span></div><div class="qa-a">Without NAT-T: IKE (UDP 500) works fine through PAT, but ESP (protocol 50) has NO ports — it cannot be tracked by PAT. The ESP packets are dropped by the NAT device. With NAT-T (RFC 3948): ①Both peers send vendor ID payloads during IKE Phase 1 to signal NAT-T support. ②Each peer detects NAT in path using RFC 3947 (hashes of IP:port compared — if they mismatch, NAT is present). ③If NAT detected: IKE moves from UDP 500 to UDP 4500 for all subsequent IKE and ESP traffic. ④ESP is encapsulated inside UDP 4500 — PAT can now track it using port numbers. ⑤NAT keepalives (typically every 20s) maintain the PAT entry. Without keepalives, the PAT timer expires and the tunnel breaks silently. CCIE note: if you have two VPN devices behind the same PAT router, they both try to use UDP 4500 — the PAT router differentiates by assigning different outside ports. This works for most but some ISPs do Deep Packet Inspection and break it.</div></div>
        </div>
      </div>
    </div>
  </div>
</div>

<div id="ccna-topic-9" class="topic-panel">
  <div class="topic-hero" style="border-left:4px solid var(--green)">
    <div class="topic-title">📡 Wireless LAN — 802.11 Standards, RF, Security &amp; Enterprise Wi-Fi</div>
    <div class="topic-sub">802.11ax/Wi-Fi 6 · 2.4/5/6GHz RF · WPA3/SAE · 4-way handshake · CAPWAP · Roaming (802.11r/k/v) · Channel planning</div>
  </div>
  <div class="card">
    <div class="card-hdr">802.11 Standards Evolution — Speed, Frequency &amp; Technology</div>
    <div class="tbl-wrap"><table class="tbl">
      <tr><th>Standard</th><th>Wi-Fi Name</th><th>Max Speed</th><th>Frequency</th><th>Key Technology</th><th>Year</th></tr>
      <tr><td style="color:var(--muted2)">802.11b</td><td>—</td><td>11 Mbps</td><td>2.4 GHz</td><td>DSSS, 3 non-overlapping channels</td><td>1999</td></tr>
      <tr><td style="color:var(--muted2)">802.11a</td><td>—</td><td>54 Mbps</td><td>5 GHz</td><td>OFDM, 23 non-overlapping channels</td><td>1999</td></tr>
      <tr><td style="color:var(--muted2)">802.11g</td><td>—</td><td>54 Mbps</td><td>2.4 GHz</td><td>OFDM, backward compat with b</td><td>2003</td></tr>
      <tr><td style="color:var(--blue)">802.11n</td><td>Wi-Fi 4</td><td>600 Mbps</td><td>2.4 + 5 GHz</td><td>MIMO (4×4), channel bonding (40MHz), STBC</td><td>2009</td></tr>
      <tr><td style="color:var(--cyan)">802.11ac</td><td>Wi-Fi 5</td><td>6.9 Gbps</td><td>5 GHz only</td><td>MU-MIMO (DL), 8 spatial streams, 80/160MHz, 256-QAM</td><td>2013</td></tr>
      <tr><td style="color:var(--green)">802.11ax</td><td>Wi-Fi 6</td><td>9.6 Gbps</td><td>2.4 + 5 GHz</td><td>OFDMA, MU-MIMO (UL+DL), BSS Coloring, TWT, 1024-QAM</td><td>2019</td></tr>
      <tr><td style="color:var(--amber)">802.11ax</td><td>Wi-Fi 6E</td><td>9.6 Gbps</td><td>2.4+5+6 GHz</td><td>Adds 6GHz band (1.2GHz spectrum), 14 new 80MHz channels</td><td>2021</td></tr>
      <tr><td style="color:var(--pink)">802.11be</td><td>Wi-Fi 7</td><td>46 Gbps</td><td>2.4+5+6 GHz</td><td>320MHz channels, 4K-QAM, Multi-Link Operation</td><td>2024</td></tr>
    </table></div>
    <div class="callout callout-warn" style="margin-top:8px">⚠️ <strong>CCIE trap:</strong> 802.11ac is 5GHz ONLY — it cannot connect 2.4GHz devices. Many enterprises run 802.11n on 2.4GHz for legacy IoT devices. Wi-Fi 6 supports both bands simultaneously via dual-band concurrent radios.</div>
  </div>
  <div class="grid-2" style="margin-top:14px">
    <div>
      <div class="card">
        <div class="card-hdr">WPA2 4-Way Handshake — Byte-Level Detail</div>
        <div class="callout callout-info" style="margin-bottom:8px">The 4-way handshake derives the PTK (Pairwise Transient Key) used to encrypt unicast traffic. It uses EAPOL (EAP over LAN) frames on top of 802.11.</div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:2">
          <div style="color:var(--blue);font-weight:700">PRE-REQUISITE: PMK (Pairwise Master Key)</div>
          <div style="color:var(--text)">WPA2-Personal: PMK = PBKDF2(passphrase, SSID, 4096 iterations)</div>
          <div style="color:var(--text)">WPA2-Enterprise: PMK derived from 802.1X EAP authentication</div>
          <div style="margin-top:8px;color:var(--amber);font-weight:700">MESSAGE 1: AP → Client (ANonce)</div>
          <div style="color:var(--text)">AP sends: ANonce (AP Nonce — random 256-bit value)</div>
          <div style="color:var(--muted)">Client now has: ANonce + own SNonce + PMK → derives PTK</div>
          <div style="margin-top:6px;color:var(--cyan);font-weight:700">MESSAGE 2: Client → AP (SNonce + MIC)</div>
          <div style="color:var(--text)">Client sends: SNonce + RSNE (security capabilities) + MIC</div>
          <div style="color:var(--muted)">MIC = HMAC-SHA1 of msg2 using KCK (part of PTK)</div>
          <div style="color:var(--muted)">AP verifies MIC → confirms client has correct PMK</div>
          <div style="margin-top:6px;color:var(--green);font-weight:700">MESSAGE 3: AP → Client (Install PTK + GTK)</div>
          <div style="color:var(--text)">AP sends: Encrypted GTK (group key for broadcast) + MIC</div>
          <div style="color:var(--muted)">Client installs PTK, prepares to use it</div>
          <div style="margin-top:6px;color:var(--pink);font-weight:700">MESSAGE 4: Client → AP (ACK)</div>
          <div style="color:var(--text)">Client confirms: "PTK installed, GTK installed"</div>
          <div style="color:var(--muted)">AP installs PTK → encrypted data can now flow</div>
          <div style="margin-top:8px;color:var(--red)">PTK = PRF-512(PMK + "Pairwise key expansion" + min(AA,SA) + max(AA,SA) + min(ANonce,SNonce) + max(ANonce,SNonce))</div>
          <div style="color:var(--muted)">PTK split into: KCK(128b) + KEK(128b) + TK(128b) = 384 bits</div>
        </div>
      </div>
      <div class="card" style="margin-top:14px">
        <div class="card-hdr">WPA3 &amp; SAE — Why WPA2 Was Broken</div>
        <div class="callout callout-warn" style="margin-bottom:8px">WPA2 has KRACK vulnerability (2017) — Key Reinstallation Attack. Attacker replays message 3 to reset nonce counters, enabling decryption. WPA3-SAE eliminates this.</div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>Feature</th><th>WPA2</th><th>WPA3</th></tr>
          <tr><td>Key exchange</td><td>PSK (pre-shared key direct)</td><td>SAE (Dragonfly handshake — perfect forward secrecy)</td></tr>
          <tr><td>Offline dict attack</td><td style="color:var(--red)">Vulnerable — capture 4-way, crack offline</td><td style="color:var(--green)">Not possible — each auth needs online interaction</td></tr>
          <tr><td>PMF (Mgmt Frame Protection)</td><td>Optional</td><td>Mandatory — prevents deauth/disassoc flooding</td></tr>
          <tr><td>Open network encryption</td><td>None</td><td>OWE (Opportunistic Wireless Encryption)</td></tr>
          <tr><td>Enterprise</td><td>802.1X + RADIUS</td><td>192-bit security suite (GCMP-256)</td></tr>
        </table></div>
      </div>
    </div>
    <div>
      <div class="card">
        <div class="card-hdr">Enterprise Wi-Fi — WLC, CAPWAP &amp; Autonomous vs Lightweight APs</div>
        <div class="callout callout-info" style="margin-bottom:8px">Enterprise Wi-Fi uses a split-MAC architecture: lightweight APs (LAPs) handle real-time 802.11 functions, the WLC (Wireless LAN Controller) handles management and forwarding decisions.</div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>Function</th><th>Autonomous AP</th><th>Lightweight AP (CAPWAP)</th></tr>
          <tr><td>Configuration</td><td>Per-AP (CLI/web)</td><td>Centralized on WLC</td></tr>
          <tr><td>802.11 beacons/probe</td><td>Local</td><td>Local (real-time)</td></tr>
          <tr><td>Client auth</td><td>Local</td><td>Forwarded to WLC</td></tr>
          <tr><td>Data forwarding</td><td>Local bridging</td><td>CAPWAP tunnel to WLC (or FlexConnect local)</td></tr>
          <tr><td>Roaming</td><td>Manual re-assoc</td><td>Seamless Layer 2 / Layer 3 roaming via WLC</td></tr>
          <tr><td>Updates</td><td>Per-device</td><td>Mass push from WLC</td></tr>
        </table></div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:10px;font-family:var(--mono);font-size:10px;line-height:1.8;margin-top:8px">
          <div style="color:var(--cyan)">CAPWAP (RFC 5415) — Control and Provisioning of WAPs</div>
          <div style="color:var(--text)">UDP 5246 (control) + UDP 5247 (data)</div>
          <div style="color:var(--text)">DTLS (Datagram TLS) encrypts control plane by default</div>
          <div style="color:var(--muted)">AP discovery: broadcast → multicast → DHCP option 43 → DNS</div>
          <div style="color:var(--muted)">AP state machine: Discovery → DTLS Setup → Join → Config → Run</div>
          <div style="margin-top:6px;color:var(--amber)">FlexConnect: AP can forward locally when WLC unreachable</div>
          <div style="color:var(--amber)">Connected mode: CAPWAP tunnel active, WLC centralized</div>
          <div style="color:var(--amber)">Standalone mode: AP uses cached config, local switching</div>
        </div>
      </div>
      <div class="card" style="margin-top:14px">
        <div class="card-hdr">Channel Planning &amp; RF Fundamentals</div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--blue);font-weight:700">2.4 GHz — 11 channels (US), only 3 non-overlapping:</div>
          <div style="color:var(--text)">Ch 1:  2.412 GHz ←── 22 MHz wide</div>
          <div style="color:var(--text)">Ch 6:  2.437 GHz ←── does NOT overlap ch1 or ch11</div>
          <div style="color:var(--text)">Ch 11: 2.462 GHz ←── does NOT overlap ch1 or ch6</div>
          <div style="color:var(--red)">Ch 2-5, 7-10: OVERLAP → co-channel interference!</div>
          <div style="margin-top:8px;color:var(--cyan);font-weight:700">5 GHz — 25 non-overlapping 20MHz channels (US):</div>
          <div style="color:var(--text)">UNII-1: 36,40,44,48  UNII-2: 52-64  UNII-3: 149-165</div>
          <div style="color:var(--muted)">DFS channels (52-144): radar detection req'd, can cause disruption</div>
          <div style="margin-top:8px;color:var(--green);font-weight:700">RF Path Loss fundamentals:</div>
          <div style="color:var(--text)">Free Space Path Loss = 20log(d) + 20log(f) + 32.44 (dB)</div>
          <div style="color:var(--muted)">2× distance = +6dB loss · 2× frequency = +6dB loss</div>
          <div style="color:var(--muted)">Walls: drywall ~3dB · concrete ~15dB · elevator ~20dB</div>
          <div style="margin-top:8px;color:var(--amber)">RSSI thresholds (practical):</div>
          <div style="color:var(--green)">≥ -65 dBm  = Excellent (HD video, VoIP)</div>
          <div style="color:var(--amber)">-65 to -75  = Good (normal browsing)</div>
          <div style="color:var(--red)">≤ -80 dBm  = Poor (connection drops likely)</div>
        </div>
      </div>
    </div>
  </div>
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">802.11 Roaming — Fast BSS Transition (802.11r/k/v)</div>
    <div class="grid-2">
      <div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>Standard</th><th>Name</th><th>What it does</th></tr>
          <tr><td style="color:var(--blue)">802.11r</td><td>Fast BSS Transition (FT)</td><td>Pre-authenticates client to target AP BEFORE roam. Reduces roam time from ~400ms to &lt;50ms — critical for VoIP</td></tr>
          <tr><td style="color:var(--cyan)">802.11k</td><td>Radio Resource Management</td><td>Client requests neighbor report — AP provides list of nearby APs + their channel/RSSI → client can make informed roam decision</td></tr>
          <tr><td style="color:var(--amber)">802.11v</td><td>BSS Transition Management</td><td>AP can suggest or force client to roam to a better AP — critical for load balancing and sticky client management</td></tr>
        </table></div>
      </div>
      <div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:10px;font-family:var(--mono);font-size:10px;line-height:1.8">
          <div style="color:var(--cyan)">STICKY CLIENT PROBLEM:</div>
          <div style="color:var(--muted)">Client stays associated to far-away AP (-80dBm)</div>
          <div style="color:var(--muted)">when a closer AP (-55dBm) is available.</div>
          <div style="color:var(--muted)">Clients control roaming — APs can only deauthenticate.</div>
          <div style="margin-top:6px;color:var(--cyan)">SOLUTIONS:</div>
          <div style="color:var(--amber)">1. 802.11v BSS Transition Management Request → ask nicely</div>
          <div style="color:var(--red)">2. Deauthenticate client (forceful — causes brief disconnect)</div>
          <div style="color:var(--green)">3. Band steering → move to 5GHz (less congested)</div>
          <div style="margin-top:6px;color:var(--cyan)">Layer 3 roaming (different subnet):</div>
          <div style="color:var(--muted)">WLC uses mobility tunnel to maintain client IP address</div>
          <div style="color:var(--muted)">Anchor WLC holds the client IP, foreign WLC tunnels traffic</div>
        </div>
      </div>
    </div>
  </div>
</div>

<div id="ccna-topic-10" class="topic-panel">
  <div class="topic-hero" style="border-left:4px solid var(--amber)">
    <div class="topic-title">🔃 HSRP / VRRP / GLBP — First Hop Redundancy Protocols</div>
    <div class="topic-sub">Virtual IP/MAC · Active/Standby election · Preemption · Object tracking · GARP on failover · GLBP load balancing</div>
  </div>
  <div class="card">
    <div class="card-hdr">FHRP Comparison — HSRP vs VRRP vs GLBP</div>
    <div class="tbl-wrap"><table class="tbl">
      <tr><th>Feature</th><th>HSRP v1/v2</th><th>VRRP v2/v3</th><th>GLBP</th></tr>
      <tr><td>Standard</td><td style="color:var(--red)">Cisco proprietary</td><td style="color:var(--green)">RFC 3768 / RFC 5798</td><td style="color:var(--red)">Cisco proprietary</td></tr>
      <tr><td>Roles</td><td>Active / Standby / Listen</td><td>Master / Backup</td><td>AVG + AVF (up to 4)</td></tr>
      <tr><td>Virtual MAC</td><td>0000.0c07.acXX (v1)<br/>0000.0c9f.fXXX (v2)</td><td>0000.5e00.01XX</td><td>0007.b400.XXYY</td></tr>
      <tr><td>Multicast addr</td><td>224.0.0.2 (v1) / 224.0.0.102 (v2)</td><td>224.0.0.18</td><td>224.0.0.102</td></tr>
      <tr><td>Load balancing</td><td style="color:var(--red)">No (only failover)</td><td style="color:var(--red)">No (only failover)</td><td style="color:var(--green)">YES — round-robin, weighted, host-dependent</td></tr>
      <tr><td>Preemption</td><td>Off by default</td><td>On by default</td><td>Off by default (AVG)</td></tr>
      <tr><td>Auth support</td><td>Plain text / MD5</td><td>Plain text (v2) / None (v3)</td><td>MD5</td></tr>
      <tr><td>IPv6 support</td><td>HSRPv2 only</td><td>VRRPv3</td><td>Yes</td></tr>
    </table></div>
  </div>
  <div class="grid-2" style="margin-top:14px">
    <div>
      <div class="card">
        <div class="card-hdr">HSRP State Machine — All 6 States</div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>State</th><th>Role</th><th>Behavior</th></tr>
          <tr><td style="color:var(--muted2)">Initial</td><td>Starting up</td><td>HSRP process just started, no hellos sent yet</td></tr>
          <tr><td style="color:var(--muted2)">Learn</td><td>Discovering</td><td>Waiting for hello from Active to learn virtual IP</td></tr>
          <tr><td style="color:var(--blue)">Listen</td><td>Passive</td><td>Knows virtual IP, not Active/Standby, monitors hellos</td></tr>
          <tr><td style="color:var(--cyan)">Speak</td><td>Candidate</td><td>Sending hellos, participating in election</td></tr>
          <tr><td style="color:var(--amber)">Standby</td><td>Backup</td><td>Monitoring Active, ready to take over in holddown timer</td></tr>
          <tr><td style="color:var(--green)">Active</td><td>Forwarding</td><td>Responding to virtual MAC, forwarding packets</td></tr>
        </table></div>
        <div class="callout callout-info" style="margin-top:8px">Election: highest priority wins (default 100). Tie → highest real IP wins. Preemption must be explicitly enabled for a higher-priority router to take over when it recovers.</div>
      </div>
      <div class="card" style="margin-top:14px">
        <div class="card-hdr">HSRP/VRRP Configuration with Object Tracking</div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--cyan)">! HSRP v2 with preemption and tracking</div>
          <div style="color:var(--green)">interface GigabitEthernet0/0</div>
          <div style="color:var(--green)"> ip address 192.168.1.2 255.255.255.0</div>
          <div style="color:var(--green)"> standby version 2</div>
          <div style="color:var(--amber)"> standby 1 ip 192.168.1.1         ← virtual IP</div>
          <div style="color:var(--amber)"> standby 1 priority 110           ← higher = preferred</div>
          <div style="color:var(--amber)"> standby 1 preempt delay minimum 30  ← wait 30s after recovery</div>
          <div style="color:var(--amber)"> standby 1 authentication md5 key-string SECRET</div>
          <div style="color:var(--red)"> standby 1 track 10 decrement 20  ← if WAN fails, priority -20</div>
          <div style="margin-top:6px;color:var(--cyan)">! Track object for WAN uplink</div>
          <div style="color:var(--green)">track 10 interface GigabitEthernet0/1 line-protocol</div>
          <div style="margin-top:6px;color:var(--cyan)">! Verification</div>
          <div style="color:var(--blue)">show standby brief     ← Active/Standby state + priority</div>
          <div style="color:var(--blue)">show standby          ← detailed: timers, virtual MAC</div>
          <div style="color:var(--blue)">debug standby events  ← election/failover events</div>
        </div>
      </div>
    </div>
    <div>
      <div class="card">
        <div class="card-hdr">GARP on Failover — Why It's Critical</div>
        <div class="callout callout-info" style="margin-bottom:8px">When a Standby router becomes Active, it sends a Gratuitous ARP (GARP) for the virtual IP. This updates all hosts' ARP caches and the upstream switch's MAC table to point to the new Active router's physical port.</div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--amber)">FAILOVER SEQUENCE:</div>
          <div style="color:var(--muted)">1. Active router fails (link down / process crash)</div>
          <div style="color:var(--muted)">2. Standby doesn't receive hellos for holdtime (3× hello = 10s)</div>
          <div style="color:var(--muted)">3. Standby transitions Speak → Active</div>
          <div style="color:var(--cyan)">4. New Active sends GARP (ARP reply, src=virtual IP, src MAC=virtual MAC)</div>
          <div style="color:var(--muted)">5. All hosts update ARP cache: VIP → virtual MAC (unchanged!)</div>
          <div style="color:var(--muted)">6. Switch updates CAM: virtual MAC → new physical port</div>
          <div style="color:var(--green)">7. Traffic resumes — hosts never changed their default gateway IP/MAC!</div>
          <div style="margin-top:8px;color:var(--amber)">WHY VIRTUAL MAC MATTERS:</div>
          <div style="color:var(--muted)">If we used the physical MAC as virtual MAC, hosts would need to</div>
          <div style="color:var(--muted)">re-ARP after failover (slow). With a fixed virtual MAC (0000.0c07.acXX),</div>
          <div style="color:var(--muted)">hosts never re-ARP — only the switch CAM needs updating via the GARP.</div>
          <div style="margin-top:8px;color:var(--red)">FAILOVER TIMING:</div>
          <div style="color:var(--muted)">Default hello: 3s · Default holdtime: 10s → ~10s failover</div>
          <div style="color:var(--green)">Tuned: hello 200ms · holdtime 600ms → &lt;1s failover</div>
          <div style="color:var(--muted)">BFD integration: sub-100ms detection (HSRP over BFD)</div>
        </div>
      </div>
      <div class="card" style="margin-top:14px">
        <div class="card-hdr">GLBP — Load Balancing Across Multiple Gateways</div>
        <div class="callout callout-info" style="margin-bottom:8px">GLBP is unique: one virtual IP, but multiple virtual MACs. Each gateway (AVF) answers ARP requests with a DIFFERENT virtual MAC. Hosts get load-balanced at the gateway level without knowing it.</div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--cyan)">GLBP ROLES:</div>
          <div style="color:var(--blue)">AVG (Active Virtual Gateway): ONE per group</div>
          <div style="color:var(--muted)"> → Answers ARP requests, distributes virtual MACs</div>
          <div style="color:var(--blue)">AVF (Active Virtual Forwarder): UP TO 4 per group</div>
          <div style="color:var(--muted)"> → Each assigned a unique virtual MAC (0007.b400.XXYY)</div>
          <div style="color:var(--muted)"> → Forwards traffic for hosts assigned its virtual MAC</div>
          <div style="margin-top:6px;color:var(--cyan)">ARP RESPONSE DISTRIBUTION (default: round-robin):</div>
          <div style="color:var(--muted)">Host-A ARPs for 192.168.1.1 → gets 0007.b400.0101 (R1 MAC)</div>
          <div style="color:var(--muted)">Host-B ARPs for 192.168.1.1 → gets 0007.b400.0102 (R2 MAC)</div>
          <div style="color:var(--muted)">Host-C ARPs for 192.168.1.1 → gets 0007.b400.0101 (R1 MAC)</div>
          <div style="color:var(--green)">Result: traffic split between R1 and R2 — true load balancing!</div>
          <div style="margin-top:6px;color:var(--cyan)">LOAD BALANCING METHODS:</div>
          <div style="color:var(--muted)">round-robin  : default, rotates MAC responses equally</div>
          <div style="color:var(--muted)">weighted     : based on weight value (higher = more traffic)</div>
          <div style="color:var(--muted)">host-dependent: same host always gets same gateway MAC</div>
        </div>
      </div>
    </div>
  </div>
</div>

<div id="ccna-topic-11" class="topic-panel">
  <div class="topic-hero" style="border-left:4px solid var(--red)">
    <div class="topic-title">🔒 Network Security — Layer 2 Attacks &amp; Defenses</div>
    <div class="topic-sub">Port security · DHCP snooping · Dynamic ARP Inspection · IP Source Guard · 802.1X · VLAN hopping · Private VLANs · Storm control</div>
  </div>
  <div class="card">
    <div class="card-hdr">Layer 2 Attack Vectors — What Attackers Do &amp; How to Stop Them</div>
    <div class="tbl-wrap"><table class="tbl">
      <tr><th>Attack</th><th>Method</th><th>Impact</th><th>Defense</th></tr>
      <tr><td style="color:var(--red)">MAC flooding</td><td>Send millions of frames with fake MACs to fill switch CAM table</td><td>Switch fails open → floods ALL frames → attacker sees all traffic (like a hub)</td><td>Port security (max MAC per port)</td></tr>
      <tr><td style="color:var(--red)">ARP poisoning</td><td>Send gratuitous ARPs with attacker's MAC for victim's IP</td><td>MITM: all traffic for victim IP goes to attacker</td><td>Dynamic ARP Inspection (DAI)</td></tr>
      <tr><td style="color:var(--red)">DHCP starvation</td><td>Send thousands of DISCOVER with fake MACs to exhaust pool</td><td>Legitimate clients can't get IP — DoS</td><td>DHCP snooping + rate limiting</td></tr>
      <tr><td style="color:var(--red)">Rogue DHCP</td><td>Attacker runs own DHCP server → gives clients attacker as gateway</td><td>MITM for all new clients</td><td>DHCP snooping (trusted ports only)</td></tr>
      <tr><td style="color:var(--red)">VLAN hopping (double-tag)</td><td>Attacker sends 802.1Q frame with outer VLAN=native VLAN → switch strips it, forwards inner VLAN tag to target VLAN</td><td>Access VLAN you're not supposed to be in</td><td>Change native VLAN to unused VLAN 999</td></tr>
      <tr><td style="color:var(--red)">STP attack</td><td>Attacker sends superior BPDUs to become root bridge</td><td>Traffic redirected through attacker → MITM or loop</td><td>BPDU Guard + Root Guard</td></tr>
    </table></div>
  </div>
  <div class="grid-2" style="margin-top:14px">
    <div>
      <div class="card">
        <div class="card-hdr">Port Security — Configuration &amp; Violation Modes</div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--cyan)">! Basic port security</div>
          <div style="color:var(--green)">interface GigabitEthernet0/1</div>
          <div style="color:var(--green)"> switchport mode access</div>
          <div style="color:var(--green)"> switchport access vlan 10</div>
          <div style="color:var(--amber)"> switchport port-security</div>
          <div style="color:var(--amber)"> switchport port-security maximum 2       ← max 2 MACs</div>
          <div style="color:var(--amber)"> switchport port-security mac-address sticky ← auto-learn</div>
          <div style="color:var(--red)"> switchport port-security violation restrict  ← violation mode</div>
          <div style="margin-top:6px;color:var(--cyan)">! VIOLATION MODES (critical for exam):</div>
          <div style="color:var(--green)">shutdown   ← port goes err-disabled (default) — MOST SECURE</div>
          <div style="color:var(--amber)">restrict   ← drops violating frames, logs, increments counter</div>
          <div style="color:var(--muted2)">protect    ← silently drops violating frames, NO log</div>
          <div style="margin-top:6px;color:var(--cyan)">! Recovery from err-disabled</div>
          <div style="color:var(--blue)">show interfaces Gi0/1 status     ← err-disabled?</div>
          <div style="color:var(--blue)">show port-security interface Gi0/1</div>
          <div style="color:var(--green)">errdisable recovery cause psecure-violation</div>
          <div style="color:var(--green)">errdisable recovery interval 300</div>
        </div>
      </div>
      <div class="card" style="margin-top:14px">
        <div class="card-hdr">DHCP Snooping — Building the Binding Table</div>
        <div class="callout callout-info" style="margin-bottom:8px">DHCP snooping builds a binding table: MAC → IP → VLAN → Interface → Lease time. This table is used by DAI and IP Source Guard. Only trusted ports can send DHCP OFFER/ACK.</div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--cyan)">! Enable DHCP snooping</div>
          <div style="color:var(--amber)">ip dhcp snooping</div>
          <div style="color:var(--amber)">ip dhcp snooping vlan 10,20,30</div>
          <div style="color:var(--muted)">no ip dhcp snooping information option  ← if no option 82 relay</div>
          <div style="margin-top:6px;color:var(--cyan)">! Mark uplink to real DHCP server as trusted</div>
          <div style="color:var(--green)">interface GigabitEthernet0/24     ← uplink to DHCP server</div>
          <div style="color:var(--green)"> ip dhcp snooping trust</div>
          <div style="color:var(--cyan)">! Rate-limit client ports (anti-starvation)</div>
          <div style="color:var(--green)">interface range GigabitEthernet0/1-20</div>
          <div style="color:var(--amber)"> ip dhcp snooping limit rate 15    ← 15 DHCP pkts/sec max</div>
          <div style="margin-top:6px;color:var(--cyan)">! Verify binding table</div>
          <div style="color:var(--blue)">show ip dhcp snooping binding</div>
          <div style="color:var(--blue)">show ip dhcp snooping statistics</div>
        </div>
      </div>
    </div>
    <div>
      <div class="card">
        <div class="card-hdr">Dynamic ARP Inspection (DAI) — ARP Packet Validation</div>
        <div class="callout callout-info" style="margin-bottom:8px">DAI intercepts all ARP requests and replies on untrusted ports and validates them against the DHCP snooping binding table. If IP:MAC don't match → drop the ARP → ARP poisoning impossible.</div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--cyan)">! Enable DAI on VLANs</div>
          <div style="color:var(--amber)">ip arp inspection vlan 10,20,30</div>
          <div style="color:var(--cyan)">! Trust uplink ports (switch-to-switch links)</div>
          <div style="color:var(--green)">interface GigabitEthernet0/24</div>
          <div style="color:var(--green)"> ip arp inspection trust</div>
          <div style="color:var(--cyan)">! Add rate limiting on untrusted ports</div>
          <div style="color:var(--green)">interface range Gi0/1-20</div>
          <div style="color:var(--amber)"> ip arp inspection limit rate 100 burst interval 1</div>
          <div style="color:var(--cyan)">! Static ARP ACL for hosts with static IPs (no DHCP binding)</div>
          <div style="color:var(--green)">arp access-list STATIC-HOSTS</div>
          <div style="color:var(--green)"> permit ip host 192.168.1.100 mac host aabb.ccdd.eeff</div>
          <div style="color:var(--amber)">ip arp inspection filter STATIC-HOSTS vlan 10</div>
          <div style="margin-top:6px;color:var(--cyan)">! Verification</div>
          <div style="color:var(--blue)">show ip arp inspection vlan 10</div>
          <div style="color:var(--blue)">show ip arp inspection statistics</div>
          <div style="color:var(--muted)">Dropped ARPs listed — attacker activity visible here</div>
        </div>
      </div>
      <div class="card" style="margin-top:14px">
        <div class="card-hdr">802.1X Port Authentication — EAP, RADIUS &amp; NAC</div>
        <div class="callout callout-info" style="margin-bottom:8px">802.1X creates a three-party authentication: Supplicant (client), Authenticator (switch), Authentication Server (RADIUS). The port stays in an unauthorized state until authentication succeeds.</div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>Role</th><th>Device</th><th>Protocol</th></tr>
          <tr><td style="color:var(--blue)">Supplicant</td><td>End device (PC, phone)</td><td>EAP over LAN (EAPOL)</td></tr>
          <tr><td style="color:var(--cyan)">Authenticator</td><td>Switch / WAP</td><td>EAPOL (toward supplicant) + RADIUS (toward server)</td></tr>
          <tr><td style="color:var(--green)">Auth Server</td><td>RADIUS (Cisco ISE, FreeRADIUS)</td><td>RADIUS (UDP 1812/1813)</td></tr>
        </table></div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:10px;font-family:var(--mono);font-size:10px;line-height:1.8;margin-top:8px">
          <div style="color:var(--cyan)">! 802.1X switch config</div>
          <div style="color:var(--green)">aaa new-model</div>
          <div style="color:var(--green)">aaa authentication dot1x default group radius</div>
          <div style="color:var(--green)">dot1x system-auth-control</div>
          <div style="color:var(--green)">radius-server host 10.0.0.1 key SECRET</div>
          <div style="color:var(--green)">interface Gi0/1</div>
          <div style="color:var(--amber)"> dot1x port-control auto    ← requires auth</div>
          <div style="color:var(--amber)"> authentication host-mode multi-auth ← multiple devices</div>
          <div style="color:var(--amber)"> authentication order dot1x mab    ← try 802.1X first, then MAB</div>
          <div style="color:var(--muted)">MAB (MAC Auth Bypass): for IoT devices without 802.1X supplicant</div>
        </div>
      </div>
    </div>
  </div>
</div>
<!-- ═══ CCNA TAB 12: ETHERCHANNEL ═══ -->
<div id="ccna-topic-12" class="topic-panel">
  <div class="topic-hero" style="border-left:4px solid var(--cyan)">
    <div class="topic-title">⛓️ EtherChannel (Link Aggregation)</div>
    <div class="topic-sub">Why EtherChannel · PAgP Cisco modes &amp; compatibility · LACP IEEE modes · Full real-router configurations · show etherchannel outputs · Load balancing — the router MAC problem solved</div>
  </div>

  <div class="card">
    <div class="card-hdr">The Problem — Bandwidth Bottleneck &amp; Why More Cables Don't Help</div>
    <div class="callout callout-info" style="margin-bottom:14px">💡 Two switches, computers connected at 1000 Mbit each, but the inter-switch link is only 100 Mbit. Adding more cables hits a wall: STP (Spanning Tree Protocol) detects the extra links as potential loops and <strong>blocks all but one</strong>. Four cables, four times the cost — but still only 100 Mbit. EtherChannel is the solution: bundle all physical links into ONE logical link. STP sees one fat pipe and never blocks anything.</div>
    <div class="grid-2">
      <div>
        <svg viewBox="0 0 360 155" width="100%" style="display:block;margin-bottom:8px">
          <rect x="0" y="0" width="360" height="155" fill="#0d1117" rx="8" stroke="rgba(248,113,113,0.2)"/>
          <text x="12" y="13" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(248,113,113,0.5)">WITHOUT ETHERCHANNEL — STP BLOCKS 3 OF 4 LINKS</text>
          <rect x="8" y="22" width="65" height="24" rx="4" fill="rgba(91,156,246,0.1)" stroke="#5b9cf6" stroke-width="1"/>
          <text x="40" y="33" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#5b9cf6">ComputerA</text>
          <text x="40" y="42" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(91,156,246,0.4)">1000 Mbit</text>
          <rect x="8" y="108" width="65" height="24" rx="4" fill="rgba(91,156,246,0.1)" stroke="#5b9cf6" stroke-width="1"/>
          <text x="40" y="119" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#5b9cf6">ComputerB</text>
          <text x="40" y="128" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(91,156,246,0.4)">1000 Mbit</text>
          <rect x="100" y="58" width="62" height="38" rx="5" fill="rgba(74,222,128,0.1)" stroke="#4ade80" stroke-width="1.5"/>
          <text x="131" y="76" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9" font-weight="700" fill="#4ade80">SwitchA</text>
          <rect x="198" y="58" width="62" height="38" rx="5" fill="rgba(74,222,128,0.1)" stroke="#4ade80" stroke-width="1.5"/>
          <text x="229" y="76" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9" font-weight="700" fill="#4ade80">SwitchB</text>
          <rect x="288" y="22" width="65" height="24" rx="4" fill="rgba(91,156,246,0.1)" stroke="#5b9cf6" stroke-width="1"/>
          <text x="320" y="33" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#5b9cf6">ComputerC</text>
          <rect x="288" y="108" width="65" height="24" rx="4" fill="rgba(91,156,246,0.1)" stroke="#5b9cf6" stroke-width="1"/>
          <text x="320" y="119" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#5b9cf6">ComputerD</text>
          <line x1="73" y1="34" x2="100" y2="68" stroke="#5b9cf6" stroke-width="1"/>
          <line x1="73" y1="120" x2="100" y2="88" stroke="#5b9cf6" stroke-width="1"/>
          <line x1="288" y1="34" x2="260" y2="68" stroke="#5b9cf6" stroke-width="1"/>
          <line x1="288" y1="120" x2="260" y2="88" stroke="#5b9cf6" stroke-width="1"/>
          <line x1="162" y1="74" x2="198" y2="74" stroke="#4ade80" stroke-width="3"/>
          <text x="180" y="69" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" font-weight="700" fill="#4ade80">FWD 100M</text>
          <line x1="162" y1="82" x2="198" y2="82" stroke="#f87171" stroke-width="1.5" stroke-dasharray="5,3"/>
          <line x1="162" y1="88" x2="198" y2="88" stroke="#f87171" stroke-width="1.5" stroke-dasharray="5,3"/>
          <line x1="162" y1="94" x2="198" y2="94" stroke="#f87171" stroke-width="1.5" stroke-dasharray="5,3"/>
          <text x="180" y="108" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#f87171">BLK × 3 (STP)</text>
          <text x="180" y="143" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(140,150,180,0.5)">4 cables added → STP blocks 3 → still only 100 Mbit</text>
        </svg>
        <svg viewBox="0 0 360 120" width="100%" style="display:block">
          <rect x="0" y="0" width="360" height="120" fill="#0d1117" rx="8" stroke="rgba(74,222,128,0.2)"/>
          <text x="12" y="13" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(74,222,128,0.4)">WITH ETHERCHANNEL — 4 LINKS BUNDLED = 400 Mbit LOGICAL PIPE</text>
          <rect x="8" y="22" width="65" height="22" rx="4" fill="rgba(91,156,246,0.1)" stroke="#5b9cf6" stroke-width="1"/>
          <text x="40" y="36" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#5b9cf6">ComputerA</text>
          <rect x="8" y="76" width="65" height="22" rx="4" fill="rgba(91,156,246,0.1)" stroke="#5b9cf6" stroke-width="1"/>
          <text x="40" y="90" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#5b9cf6">ComputerB</text>
          <rect x="100" y="44" width="65" height="36" rx="5" fill="rgba(74,222,128,0.1)" stroke="#4ade80" stroke-width="1.5"/>
          <text x="132" y="60" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8.5" fill="#4ade80">SwitchA</text>
          <text x="132" y="73" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(74,222,128,0.5)">Port-channel 1</text>
          <rect x="195" y="44" width="65" height="36" rx="5" fill="rgba(74,222,128,0.1)" stroke="#4ade80" stroke-width="1.5"/>
          <text x="227" y="60" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8.5" fill="#4ade80">SwitchB</text>
          <text x="227" y="73" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(74,222,128,0.5)">Port-channel 1</text>
          <rect x="288" y="22" width="65" height="22" rx="4" fill="rgba(91,156,246,0.1)" stroke="#5b9cf6" stroke-width="1"/>
          <text x="320" y="36" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#5b9cf6">ComputerC</text>
          <rect x="288" y="76" width="65" height="22" rx="4" fill="rgba(91,156,246,0.1)" stroke="#5b9cf6" stroke-width="1"/>
          <text x="320" y="90" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#5b9cf6">ComputerD</text>
          <line x1="73" y1="33" x2="100" y2="54" stroke="#5b9cf6" stroke-width="1"/>
          <line x1="73" y1="87" x2="100" y2="72" stroke="#5b9cf6" stroke-width="1"/>
          <line x1="288" y1="33" x2="260" y2="54" stroke="#5b9cf6" stroke-width="1"/>
          <line x1="288" y1="87" x2="260" y2="72" stroke="#5b9cf6" stroke-width="1"/>
          <line x1="165" y1="54" x2="195" y2="54" stroke="rgba(74,222,128,0.5)" stroke-width="2"/>
          <line x1="165" y1="60" x2="195" y2="60" stroke="rgba(74,222,128,0.5)" stroke-width="2"/>
          <line x1="165" y1="66" x2="195" y2="66" stroke="rgba(74,222,128,0.5)" stroke-width="2"/>
          <line x1="165" y1="72" x2="195" y2="72" stroke="rgba(74,222,128,0.5)" stroke-width="2"/>
          <rect x="164" y="78" width="32" height="13" rx="3" fill="rgba(74,222,128,0.25)" stroke="#4ade80"/>
          <text x="180" y="87.5" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" font-weight="700" fill="#4ade80">400Mbit</text>
          <text x="180" y="110" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(74,222,128,0.6)">STP sees ONE link · 1 link fails = 300Mbit, no STP reconvergence!</text>
        </svg>
      </div>
      <div>
        <div class="callout callout-info" style="margin-bottom:10px">
          <strong>Why EtherChannel works where extra cables don't:</strong><br><br>
          The cool thing about EtherChannel is that it bundles all physical links into a logical link with the combined bandwidth. By combining 4×100 Mbit I now have a <strong>400 Mbit link</strong>.<br><br>
          EtherChannel does load balancing among the different physical links, and it takes care of redundancy — once one link fails it keeps working using the remaining links. Maximum: <strong>8 physical interfaces</strong> per EtherChannel.
        </div>
        <div class="callout callout-warn" style="margin-bottom:10px">
          <strong>Requirements — ALL ports MUST match or EtherChannel fails:</strong><br>
          • Same duplex (full/half)<br>
          • Same speed<br>
          • Same native VLAN<br>
          • Same allowed VLANs list<br>
          • Same switchport mode (all access OR all trunk)<br><br>
          PAgP and LACP verify these automatically. Static "on" does NOT check — silent failure possible.
        </div>
        <div class="card-hdr" style="margin-bottom:8px">Two Negotiation Protocols</div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>Protocol</th><th>Standard</th><th>Use When</th></tr>
          <tr><td style="color:var(--red)">PAgP</td><td style="color:var(--red)">Cisco proprietary</td><td style="color:var(--red)">Cisco-to-Cisco ONLY</td></tr>
          <tr><td style="color:var(--green)">LACP (802.3ad)</td><td style="color:var(--green)">IEEE standard</td><td style="color:var(--green)">Any vendor combination</td></tr>
        </table></div>
      </div>
    </div>
  </div>

  <div class="card" style="margin-top:14px">
    <div class="card-hdr">PAgP — Port Aggregation Protocol (Cisco Proprietary)</div>
    <p>PAgP can only form EtherChannels between Cisco devices. If you want to configure PAgP you have a number of options to choose from per interface:</p>
    <div class="grid-2">
      <div>
        <div class="tbl-wrap" style="margin-bottom:10px"><table class="tbl">
          <tr><th>Mode</th><th>What It Does</th></tr>
          <tr><td style="color:var(--green)">Desirable</td><td>Interface actively asks the other side to become an EtherChannel. It initiates PAgP negotiation.</td></tr>
          <tr><td style="color:var(--blue)">Auto</td><td>Interface waits passively for the other side to ask. It will respond but never initiate.</td></tr>
          <tr><td style="color:var(--amber)">On</td><td>Interface becomes a member of the EtherChannel but does NOT negotiate. Other side must also be On.</td></tr>
          <tr><td style="color:var(--muted2)">Off</td><td>No EtherChannel configured on this interface.</td></tr>
        </table></div>
        <div class="card-hdr" style="margin-bottom:6px">PAgP Compatibility Matrix</div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>Side A \\ Side B</th><th>On</th><th>Desirable</th><th>Auto</th><th>Off</th></tr>
          <tr><td style="color:var(--amber)">On</td><td style="color:var(--green)">✅</td><td style="color:var(--red)">❌ Err</td><td style="color:var(--red)">❌ Err</td><td style="color:var(--red)">❌</td></tr>
          <tr><td style="color:var(--green)">Desirable</td><td style="color:var(--red)">❌ Err</td><td style="color:var(--green)">✅</td><td style="color:var(--green)">✅</td><td style="color:var(--red)">❌</td></tr>
          <tr><td style="color:var(--blue)">Auto</td><td style="color:var(--red)">❌ Err</td><td style="color:var(--green)">✅</td><td style="color:var(--red)">❌ No</td><td style="color:var(--red)">❌</td></tr>
          <tr><td style="color:var(--muted2)">Off</td><td style="color:var(--red)">❌</td><td style="color:var(--red)">❌</td><td style="color:var(--red)">❌</td><td style="color:var(--red)">❌</td></tr>
        </table></div>
        <div class="callout callout-warn" style="margin-top:8px">⚠️ <strong>On + Desirable = ERROR</strong>. "On" uses no negotiation. The other side sends PAgP packets which "On" ignores. Both sides end up confused. Only use "On" when BOTH sides are "On".</div>
      </div>
      <div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--cyan)">! === SwitchA: PAgP Desirable (actively negotiates) ===</div>
          <div style="color:var(--green)">SwitchA(config)#interface fa0/13</div>
          <div style="color:var(--amber)">SwitchA(config-if)#channel-group 1 mode desirable</div>
          <div style="color:var(--muted2)">Creating a port-channel interface Port-channel 1</div>
          <div style="color:var(--green)">SwitchA(config)#interface fa0/14</div>
          <div style="color:var(--amber)">SwitchA(config-if)#channel-group 1 mode desirable</div>
          <div> </div>
          <div style="color:var(--cyan)">! === SwitchB: PAgP Auto (waits passively) ===</div>
          <div style="color:var(--green)">SwitchB(config)#interface fa0/13</div>
          <div style="color:var(--amber)">SwitchB(config-if)#channel-group 1 mode auto</div>
          <div style="color:var(--green)">SwitchB(config)#interface fa0/14</div>
          <div style="color:var(--amber)">SwitchB(config-if)#channel-group 1 mode auto</div>
          <div> </div>
          <div style="color:var(--muted2)">! Both switches show:</div>
          <div style="color:var(--cyan)">%LINK-3-UPDOWN: Interface Port-channel1, changed state to up</div>
          <div> </div>
          <div style="color:var(--cyan)">! === Configure the port-channel interface ===</div>
          <div style="color:var(--green)">SwitchA(config)#interface port-channel 1</div>
          <div style="color:var(--amber)">SwitchA(config-if)#switchport trunk encapsulation dot1q</div>
          <div style="color:var(--amber)">SwitchA(config-if)#switchport mode trunk</div>
          <div style="color:var(--green)">SwitchB(config)#interface port-channel 1</div>
          <div style="color:var(--amber)">SwitchB(config-if)#switchport trunk encapsulation dot1q</div>
          <div style="color:var(--amber)">SwitchB(config-if)#switchport mode trunk</div>
          <div> </div>
          <div style="color:var(--muted2)">! The port-channel interface is what you configure —</div>
          <div style="color:var(--muted2)">! VLANs, mode, etc. Physical ports inherit these settings</div>
        </div>
      </div>
    </div>
  </div>

  <div class="card" style="margin-top:14px">
    <div class="card-hdr">LACP — Link Aggregation Control Protocol (IEEE 802.3ad)</div>
    <p>LACP is the IEEE standard, identical in function to PAgP but works between <em>any</em> vendor. PAgP can only be used between Cisco devices while LACP works with Cisco, HP, Aruba, Juniper, and any 802.3ad-compliant switch. The modes mirror PAgP but use different names:</p>
    <div class="grid-2">
      <div>
        <div class="tbl-wrap" style="margin-bottom:10px"><table class="tbl">
          <tr><th>LACP Mode</th><th>PAgP Equivalent</th><th>What It Does</th></tr>
          <tr><td style="color:var(--green)">Active</td><td>Desirable</td><td>Actively sends LACP PDUs, initiates the EtherChannel</td></tr>
          <tr><td style="color:var(--blue)">Passive</td><td>Auto</td><td>Waits for LACP PDUs, responds but never initiates</td></tr>
          <tr><td style="color:var(--amber)">On</td><td>On</td><td>Static — no LACP negotiation, no verification</td></tr>
        </table></div>
        <div class="card-hdr" style="margin-bottom:6px">LACP Compatibility Matrix</div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>Side A \\ Side B</th><th>On</th><th>Active</th><th>Passive</th><th>Off</th></tr>
          <tr><td style="color:var(--amber)">On</td><td style="color:var(--green)">✅</td><td style="color:var(--red)">❌</td><td style="color:var(--red)">❌</td><td style="color:var(--red)">❌</td></tr>
          <tr><td style="color:var(--green)">Active</td><td style="color:var(--red)">❌</td><td style="color:var(--green)">✅</td><td style="color:var(--green)">✅</td><td style="color:var(--red)">❌</td></tr>
          <tr><td style="color:var(--blue)">Passive</td><td style="color:var(--red)">❌</td><td style="color:var(--green)">✅</td><td style="color:var(--red)">❌</td><td style="color:var(--red)">❌</td></tr>
          <tr><td style="color:var(--muted2)">Off</td><td style="color:var(--red)">❌</td><td style="color:var(--red)">❌</td><td style="color:var(--red)">❌</td><td style="color:var(--red)">❌</td></tr>
        </table></div>
        <div class="callout callout-warn" style="margin-top:8px">⚠️ Passive + Passive = no channel. Neither side initiates. Always have at least ONE side as Active. Best practice: <strong>Active/Active on both</strong> — self-healing if one side loses configuration.</div>
      </div>
      <div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--cyan)">! First clean up any existing PAgP config:</div>
          <div style="color:var(--green)">SwitchA(config)#default interface fa0/13</div>
          <div style="color:var(--muted2)">Interface FastEthernet0/13 set to default configuration</div>
          <div style="color:var(--green)">SwitchA(config)#default interface fa0/14</div>
          <div style="color:var(--green)">SwitchA(config)#no interface port-channel1</div>
          <div style="color:var(--green)">SwitchB(config)#default interface fa0/13</div>
          <div style="color:var(--green)">SwitchB(config)#default interface fa0/14</div>
          <div style="color:var(--green)">SwitchB(config)#no interface port-channel1</div>
          <div> </div>
          <div style="color:var(--cyan)">! === SwitchA: LACP Active ===</div>
          <div style="color:var(--green)">SwitchA(config-if)#interface fa0/13</div>
          <div style="color:var(--amber)">SwitchA(config-if)#channel-group 1 mode active</div>
          <div style="color:var(--muted2)">Creating a port-channel interface Port-channel 1</div>
          <div style="color:var(--green)">SwitchA(config-if)#interface fa0/14</div>
          <div style="color:var(--amber)">SwitchA(config-if)#channel-group 1 mode active</div>
          <div> </div>
          <div style="color:var(--cyan)">! === SwitchB: LACP Passive ===</div>
          <div style="color:var(--green)">SwitchB(config)#interface fa0/13</div>
          <div style="color:var(--amber)">SwitchB(config-if)#channel-group 1 mode passive</div>
          <div style="color:var(--green)">SwitchB(config)#interface fa0/14</div>
          <div style="color:var(--amber)">SwitchB(config-if)#channel-group 1 mode passive</div>
        </div>
      </div>
    </div>
  </div>

  <div class="card" style="margin-top:14px">
    <div class="card-hdr">Verification — Real show etherchannel Output Decoded</div>
    <div class="grid-2">
      <div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.8">
          <div style="color:var(--amber)">SwitchA#show etherchannel 1 port-channel</div>
          <div style="color:var(--muted2)">Port-channels in the group:</div>
          <div style="color:var(--muted2)">Port-channel: Po1    (Primary Aggregator)</div>
          <div style="color:var(--muted2)">Age of the Port-channel   = 0d:00h:03m:04s</div>
          <div style="color:var(--muted2)">Logical slot/port         = 2/1</div>
          <div style="color:var(--muted2)">Number of ports = 2</div>
          <div style="color:var(--muted2)">HotStandBy port = null</div>
          <div style="color:var(--muted2)">Port state      = Port-channel Ag-Inuse</div>
          <div style="color:var(--green)">Protocol        =    LACP</div>
          <div style="color:var(--muted2)">Port security   = Disabled</div>
          <div style="color:var(--cyan)">Ports in the Port-channel:</div>
          <div style="color:var(--cyan)">Index  Load   Port    EC state    No of bits</div>
          <div style="color:var(--cyan)">-------+------+--------+--------+----------</div>
          <div style="color:var(--muted2)">  0     00     Fa0/13   Active        0</div>
          <div style="color:var(--muted2)">  0     00     Fa0/14   Active        0</div>
          <div style="color:var(--muted2)">Time since last port bundled: 0d:00h:00m:54s</div>
        </div>
      </div>
      <div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.8">
          <div style="color:var(--amber)">SwitchA#show etherchannel summary</div>
          <div style="color:var(--muted2)">Flags:  D - down      P - bundled in port-channel</div>
          <div style="color:var(--muted2)">        I - stand-alone    s - suspended</div>
          <div style="color:var(--muted2)">        H - Hot-standby (LACP only)</div>
          <div style="color:var(--muted2)">        R - Layer3    S - Layer2</div>
          <div style="color:var(--muted2)">        U - in use    f - failed to alloc aggregator</div>
          <div style="color:var(--muted2)">        M - not in use, min links not met</div>
          <div style="color:var(--muted2)">        u - unsuitable for bundling</div>
          <div style="color:var(--muted2)">        w - waiting to be aggregated</div>
          <div style="color:var(--muted2)">        d - default port</div>
          <div style="color:var(--muted2)">Number of channel-groups in use: 1</div>
          <div style="color:var(--cyan)">Group  Port-channel  Protocol    Ports</div>
          <div style="color:var(--cyan)">------+-------------+-----------+-----</div>
          <div style="color:var(--green)">1      Po1(SU)       LACP        Fa0/13(P) Fa0/14(P)</div>
          <div> </div>
          <div style="color:var(--amber)">! Decode flags:</div>
          <div style="color:var(--muted2)">SU = S(Layer2) U(in-use) → channel is active ✅</div>
          <div style="color:var(--muted2)">P  = port is bundled in channel ✅</div>
          <div style="color:var(--red)">D  = port is down → check physical layer</div>
          <div style="color:var(--red)">s  = suspended → config mismatch detected!</div>
        </div>
      </div>
    </div>
  </div>

  <div class="card" style="margin-top:14px">
    <div class="card-hdr">Load Balancing — The Router MAC Problem &amp; How to Fix It</div>
    <p>EtherChannel load balancing is NOT round-robin per packet. It hashes a key attribute (src/dst MAC or IP) and always sends the same conversation down the same physical link — this preserves TCP packet ordering. The default is <strong>source MAC address</strong>. This works well when you have many source MACs, but creates a problem when one side has only one device:</p>
    <div class="grid-2">
      <div>
        <svg viewBox="0 0 340 170" width="100%" style="display:block">
          <rect x="0" y="0" width="340" height="170" fill="#0d1117" rx="8" stroke="rgba(251,191,36,0.15)"/>
          <text x="12" y="13" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(251,191,36,0.4)">LOAD BALANCING — DEFAULT src-mac PROBLEM</text>
          <rect x="8" y="22" width="55" height="18" rx="3" fill="rgba(91,156,246,0.1)" stroke="#5b9cf6" stroke-width="1"/>
          <text x="35" y="34" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="#5b9cf6">MAC: AAA</text>
          <rect x="8" y="45" width="55" height="18" rx="3" fill="rgba(91,156,246,0.1)" stroke="#5b9cf6" stroke-width="1"/>
          <text x="35" y="57" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="#5b9cf6">MAC: BBB</text>
          <rect x="8" y="68" width="55" height="18" rx="3" fill="rgba(91,156,246,0.1)" stroke="#5b9cf6" stroke-width="1"/>
          <text x="35" y="80" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="#5b9cf6">MAC: CCC</text>
          <rect x="8" y="91" width="55" height="18" rx="3" fill="rgba(91,156,246,0.1)" stroke="#5b9cf6" stroke-width="1"/>
          <text x="35" y="103" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="#5b9cf6">MAC: DDD</text>
          <rect x="88" y="45" width="60" height="65" rx="5" fill="rgba(74,222,128,0.1)" stroke="#4ade80" stroke-width="1.5"/>
          <text x="118" y="67" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#4ade80">SwitchA</text>
          <text x="118" y="80" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(74,222,128,0.4)">4 src MACs</text>
          <text x="118" y="90" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(74,222,128,0.5)">→ balanced ✅</text>
          <rect x="178" y="45" width="60" height="65" rx="5" fill="rgba(74,222,128,0.1)" stroke="#4ade80" stroke-width="1.5"/>
          <text x="208" y="67" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#4ade80">SwitchB</text>
          <rect x="262" y="65" width="65" height="22" rx="4" fill="rgba(248,113,113,0.1)" stroke="#f87171" stroke-width="1.2"/>
          <text x="294" y="78" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="#f87171">MAC: EEE</text>
          <text x="294" y="95" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(248,113,113,0.5)">(1 router)</text>
          <line x1="63" y1="31" x2="88" y2="58" stroke="#5b9cf6" stroke-width="1"/>
          <line x1="63" y1="54" x2="88" y2="68" stroke="#5b9cf6" stroke-width="1"/>
          <line x1="63" y1="77" x2="88" y2="80" stroke="#5b9cf6" stroke-width="1"/>
          <line x1="63" y1="100" x2="88" y2="95" stroke="#5b9cf6" stroke-width="1"/>
          <line x1="148" y1="63" x2="178" y2="63" stroke="rgba(74,222,128,0.5)" stroke-width="1.8"/>
          <line x1="148" y1="71" x2="178" y2="71" stroke="rgba(74,222,128,0.5)" stroke-width="1.8"/>
          <line x1="148" y1="79" x2="178" y2="79" stroke="rgba(74,222,128,0.5)" stroke-width="1.8"/>
          <line x1="148" y1="87" x2="178" y2="87" stroke="rgba(74,222,128,0.5)" stroke-width="1.8"/>
          <line x1="238" y1="77" x2="262" y2="77" stroke="#f87171" stroke-width="1.5"/>
          <text x="170" y="125" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(74,222,128,0.6)">SwitchA: 4 src MACs → uses both Fa0/13 and Fa0/14 ✅</text>
          <text x="170" y="137" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(248,113,113,0.7)">SwitchB: 1 src MAC (EEE) → ALL traffic on ONE link ❌</text>
          <text x="170" y="149" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(248,113,113,0.5)">Fix: port-channel load-balance dst-mac on SwitchB</text>
          <text x="170" y="161" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(248,113,113,0.4)">(multiple dst MACs AAA/BBB/CCC/DDD = spread across links)</text>
        </svg>
      </div>
      <div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--amber)">SwitchA#show etherchannel load-balance</div>
          <div style="color:var(--cyan)">EtherChannel Load-Balancing Configuration:</div>
          <div style="color:var(--muted2)">    src-mac    ← DEFAULT</div>
          <div style="color:var(--muted2)">Non-IP: Source MAC address</div>
          <div style="color:var(--muted2)">IPv4:   Source MAC address</div>
          <div style="color:var(--muted2)">IPv6:   Source MAC address</div>
          <div> </div>
          <div style="color:var(--amber)">SwitchA(config)#port-channel load-balance ?</div>
          <div style="color:var(--muted2)">  dst-ip      Dst IP Addr</div>
          <div style="color:var(--muted2)">  dst-mac     Dst Mac Addr</div>
          <div style="color:var(--muted2)">  src-dst-ip  Src XOR Dst IP Addr</div>
          <div style="color:var(--muted2)">  src-dst-mac Src XOR Dst Mac Addr</div>
          <div style="color:var(--muted2)">  src-ip      Src IP Addr</div>
          <div style="color:var(--muted2)">  src-mac     Src Mac Addr</div>
          <div> </div>
          <div style="color:var(--cyan)">! Fix SwitchB: 1 router sending to 4 computers</div>
          <div style="color:var(--cyan)">! Use dst-mac so different computer MACs go to different links</div>
          <div style="color:var(--amber)">SwitchB(config)#port-channel load-balance dst-mac</div>
        </div>
        <div class="tbl-wrap" style="margin-top:10px"><table class="tbl">
          <tr><th>Method</th><th>Best Scenario</th></tr>
          <tr><td style="color:var(--green)">src-dst-ip</td><td>Layer 3 routed — many unique IP flows (best general choice)</td></tr>
          <tr><td style="color:var(--amber)">src-mac</td><td>Many source devices (computers → switch)</td></tr>
          <tr><td style="color:var(--cyan)">dst-mac</td><td>One source device, many destinations (router → computers)</td></tr>
          <tr><td style="color:var(--blue)">src-dst-mac</td><td>Mixed L2 traffic, many unique pairs</td></tr>
        </table></div>
      </div>
    </div>
  </div>

  <div class="card" style="margin-top:14px">
    <div class="card-hdr">🎯 Interview Q&amp;A — EtherChannel</div>
    <div class="qa-list">
      <div class="qa-item"><div class="qa-q" onclick="toggleQA(this)">Q: What is EtherChannel and what problem does it solve? Why can't you just add extra cables between switches?<span class="qa-arrow">▶</span></div><div class="qa-a">EtherChannel bundles multiple physical links into one logical port-channel, combining bandwidth and providing link-level redundancy. The problem with adding extra cables without EtherChannel is Spanning Tree Protocol — STP detects the extra links as potential loops and blocks all but one. You could have 4×100 Mbit cables but only 1 is active. EtherChannel makes STP see ONE logical link so it never blocks any physical member. The result: 4×100 Mbit = 400 Mbit aggregate bandwidth, all links active. If one fails, the port-channel stays up and traffic redistributes across the remaining links — no 30-50 second STP reconvergence delay. Max 8 physical interfaces per EtherChannel. The port-channel interface itself is what you configure (VLANs, trunking) and physical ports inherit those settings.</div></div>
      <div class="qa-item"><div class="qa-q" onclick="toggleQA(this)">Q: When would you choose LACP over PAgP? Is there ever a reason to use static "On" mode?<span class="qa-arrow">▶</span></div><div class="qa-a">Use LACP in any environment with non-Cisco equipment (HP/Aruba switches, data center ToR switches from other vendors) since LACP is the IEEE 802.3ad standard that every vendor implements. Even in all-Cisco environments, LACP is the better choice because it is future-proof and supports 16-link bundles (8 active + 8 hot-standby). LACP Active/Active on both sides is the recommended best practice — both sides actively negotiate and if one side loses its config, the other detects the failure immediately. Static "On" mode should only be used when you need to form an EtherChannel with a device that doesn't support PAgP or LACP negotiation, or in specific lab/testing scenarios. The risk: "On" skips configuration verification — speed, duplex, or VLAN mismatches won't be detected and will cause silent traffic drops or flapping.</div></div>
    </div>
  </div>
</div>
<!-- ═══ CCNA TAB 13: EIGRP ═══ -->
<div id="ccna-topic-13" class="topic-panel">
  <div class="topic-hero" style="border-left:4px solid var(--green)">
    <div class="topic-title">⚡ EIGRP — Enhanced Interior Gateway Routing Protocol</div>
    <div class="topic-sub">Why EIGRP is called hybrid · 3-table architecture · Advertised Distance vs Feasible Distance · Successor &amp; Feasible Successor worked step-by-step · DUAL loop-free guarantee · 4-router full lab config · Real show command output decoded · Variance for unequal load balancing · Summarization with Null0 · MD5 authentication</div>
  </div>

  <div class="card">
    <div class="card-hdr">What is EIGRP and Why is it Called a "Hybrid" Protocol?</div>
    <p>EIGRP stands for Enhanced Interior Gateway Routing Protocol and is a routing protocol created by Cisco. It is called a <strong>hybrid or advanced distance vector protocol</strong> — it behaves like a distance vector (only shares routes with directly-connected neighbors) but uses the DUAL algorithm which gives it link-state-like properties: loop-free paths, fast convergence, and topology awareness.</p>
    <p>The same loop-prevention rules from distance vector apply to EIGRP: split horizon, route poisoning, and poison reverse. But unlike RIP, EIGRP only sends <strong>triggered updates</strong> when something changes — no periodic 30-second floods of the full routing table.</p>
    <div class="grid-2">
      <div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>Feature</th><th>EIGRP Value</th></tr>
          <tr><td>Protocol type</td><td style="color:var(--green)">Hybrid (Advanced Distance Vector)</td></tr>
          <tr><td>Algorithm</td><td>DUAL — Diffusing Update Algorithm</td></tr>
          <tr><td>Metric</td><td>Composite: Bandwidth + Delay (by default)</td></tr>
          <tr><td>Administrative Distance</td><td>90 (internal) / 170 (external)</td></tr>
          <tr><td>Transport</td><td>IP Protocol 88 (not TCP or UDP)</td></tr>
          <tr><td>Multicast address</td><td>224.0.0.10</td></tr>
          <tr><td>Updates</td><td style="color:var(--green)">Triggered ONLY — no 30s periodic floods</td></tr>
          <tr><td>Load balancing</td><td style="color:var(--green)">Equal AND unequal cost (unique!)</td></tr>
          <tr><td>Vendor support</td><td>Cisco (opened in RFC 7868 in 2016)</td></tr>
        </table></div>
      </div>
      <div>
        <svg viewBox="0 0 300 200" width="100%" style="display:block">
          <rect x="0" y="0" width="300" height="200" fill="#0d1117" rx="8" stroke="rgba(74,222,128,0.15)"/>
          <text x="12" y="13" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(74,222,128,0.4)">EIGRP 3-TABLE ARCHITECTURE</text>
          <rect x="10" y="20" width="130" height="48" rx="5" fill="rgba(91,156,246,0.1)" stroke="#5b9cf6" stroke-width="1.5"/>
          <text x="75" y="37" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8.5" font-weight="700" fill="#5b9cf6">Neighbor Table</text>
          <text x="75" y="50" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(91,156,246,0.6)">Directly connected EIGRP routers</text>
          <text x="75" y="61" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(91,156,246,0.4)">show ip eigrp neighbors</text>
          <line x1="75" y1="68" x2="75" y2="82" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>
          <text x="82" y="78" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(140,150,180,0.4)">exchanges routes</text>
          <rect x="10" y="82" width="130" height="60" rx="5" fill="rgba(251,191,36,0.1)" stroke="#fbbf24" stroke-width="1.5"/>
          <text x="75" y="99" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8.5" font-weight="700" fill="#fbbf24">Topology Table</text>
          <text x="75" y="112" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(251,191,36,0.6)">ALL routes from ALL neighbors</text>
          <text x="75" y="123" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(251,191,36,0.5)">Successor + Feasible Successors</text>
          <text x="75" y="134" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(251,191,36,0.4)">show ip eigrp topology</text>
          <line x1="75" y1="142" x2="75" y2="156" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>
          <text x="82" y="152" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(140,150,180,0.4)">best routes copied</text>
          <rect x="10" y="156" width="130" height="28" rx="5" fill="rgba(74,222,128,0.1)" stroke="#4ade80" stroke-width="1.5"/>
          <text x="75" y="170" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8.5" font-weight="700" fill="#4ade80">Routing Table</text>
          <text x="75" y="180" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(74,222,128,0.5)">show ip route eigrp</text>
          <rect x="158" y="20" width="132" height="170" rx="5" fill="rgba(20,25,40,0.5)" stroke="rgba(140,150,180,0.15)"/>
          <text x="224" y="36" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" font-weight="700" fill="rgba(200,210,230,0.7)">How It Works:</text>
          <text x="163" y="52" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(91,156,246,0.7)">1. Send hello packets</text>
          <text x="163" y="63" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(91,156,246,0.7)">   → become neighbors</text>
          <text x="163" y="82" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(251,191,36,0.7)">2. Exchange routing info</text>
          <text x="163" y="93" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(251,191,36,0.7)">   → topology table built</text>
          <text x="163" y="112" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(251,191,36,0.6)">3. DUAL runs, picks</text>
          <text x="163" y="123" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(251,191,36,0.6)">   Successor + backups</text>
          <text x="163" y="142" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(74,222,128,0.7)">4. Best route → routing</text>
          <text x="163" y="153" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(74,222,128,0.7)">   table</text>
          <text x="163" y="168" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(74,222,128,0.5)">5. Only TRIGGERED updates</text>
          <text x="163" y="179" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(74,222,128,0.4)">   (no 30s periodic floods)</text>
        </svg>
      </div>
    </div>
  </div>

  <div class="card" style="margin-top:14px">
    <div class="card-hdr">Advertised Distance and Feasible Distance — Step by Step</div>
    <p>This is the core concept of EIGRP. Every student struggles with this at first. Let's walk through it exactly as it works using simple numbers. Three routers: <strong>KingKong</strong>, <strong>Ann</strong>, and <strong>Carl</strong>. We want to find the best path to the <em>destination</em> behind Carl.</p>
    <div class="callout callout-info" style="margin-bottom:12px">💡 <strong>Two terms to memorize:</strong><br>
    <strong>Advertised Distance (AD):</strong> How far the destination is for YOUR NEIGHBOR — they tell you this.<br>
    <strong>Feasible Distance (FD):</strong> YOUR total distance to the destination — AD + cost of your link to that neighbor.</div>
    <div class="grid-2">
      <div>
        <svg viewBox="0 0 320 280" width="100%" style="display:block">
          <rect x="0" y="0" width="320" height="280" fill="#0d1117" rx="8" stroke="rgba(56,217,192,0.15)"/>
          <text x="12" y="13" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(56,217,192,0.4)">STEP-BY-STEP — KingKong, Ann, Carl topology</text>
          <rect x="248" y="18" width="62" height="28" rx="4" fill="rgba(167,139,250,0.1)" stroke="#a78bfa" stroke-width="1.2"/>
          <text x="279" y="33" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8.5" fill="#a78bfa">Dest.</text>
          <rect x="165" y="18" width="62" height="28" rx="4" fill="rgba(74,222,128,0.1)" stroke="#4ade80" stroke-width="1.2"/>
          <text x="196" y="33" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8.5" fill="#4ade80">Carl</text>
          <rect x="78" y="18" width="62" height="28" rx="4" fill="rgba(91,156,246,0.1)" stroke="#5b9cf6" stroke-width="1.5"/>
          <text x="109" y="33" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8.5" fill="#5b9cf6">Ann</text>
          <rect x="5" y="18" width="58" height="28" rx="4" fill="rgba(251,191,36,0.1)" stroke="#fbbf24" stroke-width="1.5"/>
          <text x="34" y="30" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#fbbf24">King</text>
          <text x="34" y="41" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="#fbbf24">Kong</text>
          <line x1="227" y1="32" x2="248" y2="32" stroke="#a78bfa" stroke-width="1.5"/>
          <text x="237" y="28" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9" font-weight="700" fill="#a78bfa">5</text>
          <line x1="140" y1="32" x2="165" y2="32" stroke="rgba(74,222,128,0.6)" stroke-width="1.5"/>
          <text x="152" y="28" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9" font-weight="700" fill="#4ade80">10</text>
          <line x1="63" y1="32" x2="78" y2="32" stroke="rgba(91,156,246,0.6)" stroke-width="1.5"/>
          <text x="70" y="28" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9" font-weight="700" fill="#5b9cf6">5</text>
          <text x="160" y="68" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" font-weight="700" fill="rgba(200,210,230,0.7)">Step 1: Carl tells Ann his cost to Dest = 5 (AD)</text>
          <rect x="5" y="75" width="135" height="38" rx="4" fill="rgba(91,156,246,0.08)" stroke="rgba(91,156,246,0.3)"/>
          <text x="72" y="89" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#5b9cf6">Ann's Topology Table:</text>
          <text x="72" y="103" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(91,156,246,0.7)">AD = 5  (Carl's cost)  FD = 5+10 = 15</text>
          <text x="160" y="130" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" font-weight="700" fill="rgba(200,210,230,0.7)">Step 2: Ann tells KingKong her FD = 15 (becomes KK's AD)</text>
          <rect x="5" y="137" width="175" height="38" rx="4" fill="rgba(251,191,36,0.08)" stroke="rgba(251,191,36,0.3)"/>
          <text x="87" y="151" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#fbbf24">KingKong's Topology Table:</text>
          <text x="87" y="165" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(251,191,36,0.7)">AD = 15  (Ann's FD)    FD = 15+5 = 20</text>
          <text x="160" y="195" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" font-weight="700" fill="rgba(200,210,230,0.7)">Definitions in plain English:</text>
          <rect x="5" y="200" width="305" height="72" rx="4" fill="rgba(20,25,40,0.5)" stroke="rgba(140,150,180,0.15)"/>
          <text x="15" y="216" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(56,217,192,0.8)">AD (Advertised Distance):</text>
          <text x="15" y="228" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(140,150,180,0.7)">  How far the destination is for your NEIGHBOR.</text>
          <text x="15" y="240" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(140,150,180,0.5)">  Your neighbor tells you this value.</text>
          <text x="15" y="254" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(251,191,36,0.8)">FD (Feasible Distance):</text>
          <text x="15" y="266" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(140,150,180,0.7)">  Your TOTAL distance to the destination = AD + your link cost.</text>
        </svg>
      </div>
      <div>
        <div class="card-hdr" style="margin-bottom:8px">Successor &amp; Feasible Successor — The Full Worked Example</div>
        <p>Now let's find the Successor (best path) and check if we have any Feasible Successors (backup paths). We are on the unnamed router on the left. Link costs: to KingKong=5, to Ann=5, to Carl=100.</p>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--cyan)">! ======================================</div>
          <div style="color:var(--cyan)">! Topology: our router has 3 neighbors</div>
          <div style="color:var(--cyan)">! ======================================</div>
          <div style="color:var(--muted2)">           link cost  AD from neighbor   FD = AD + link</div>
          <div style="color:var(--muted2)">KingKong:      5           10             10 + 5  = 15</div>
          <div style="color:var(--green)">Ann:           5            5              5 + 5  = 10 ← LOWEST FD</div>
          <div style="color:var(--muted2)">Carl:        100            9              9 + 100 = 109</div>
          <div> </div>
          <div style="color:var(--green)">SUCCESSOR = Ann (FD = 10, lowest total cost)</div>
          <div style="color:var(--muted2)">→ Goes into routing table</div>
          <div> </div>
          <div style="color:var(--cyan)">! Feasibility Condition check:</div>
          <div style="color:var(--cyan)">! AD of candidate &lt; FD of Successor</div>
          <div> </div>
          <div style="color:var(--red)">KingKong: AD=10, Successor FD=10 → 10 is NOT &lt; 10 → FAIL</div>
          <div style="color:var(--red)">KingKong is NOT a Feasible Successor</div>
          <div> </div>
          <div style="color:var(--green)">Carl: AD=9, Successor FD=10 → 9 IS &lt; 10 → PASS ✅</div>
          <div style="color:var(--green)">Carl IS a Feasible Successor (backup path)</div>
          <div> </div>
          <div style="color:var(--amber)">! Note: Carl's FD=109 is FAR worse than KingKong's FD=15</div>
          <div style="color:var(--amber)">! Yet Carl is the backup, not KingKong. Why?</div>
          <div style="color:var(--amber)">! Because AD=9 &lt; 10 mathematically PROVES Carl has</div>
          <div style="color:var(--amber)">! an independent path — it cannot be routing via us!</div>
        </div>
        <div class="callout callout-info" style="margin-top:8px">💡 <strong>Why the Feasibility Condition guarantees loop-free:</strong> If Carl's cost to reach the destination is 9 (less than my total path of 10), then Carl cannot be reaching it by going through me. If it were routing via me, Carl's cost would be at least 10+100=110, not 9. The math proves Carl has a separate, independent path.</div>
      </div>
    </div>
  </div>

  <div class="card" style="margin-top:14px">
    <div class="card-hdr">Full Configuration — 4-Router EIGRP Lab</div>
    <p>Let's configure EIGRP on 4 routers: <strong>KingKong</strong>, <strong>Ann</strong>, <strong>Carl</strong>, and <strong>Preston</strong>. All links are FastEthernet except KingKong↔Carl which is Ethernet (10 Mbit). Preston has a loopback 4.4.4.0/24 behind it.</p>
    <div class="grid-2">
      <div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--cyan)">! AS number MUST match on ALL routers!</div>
          <div style="color:var(--cyan)">! no auto-summary prevents classful behavior</div>
          <div> </div>
          <div style="color:var(--green)">KingKong(config)#router eigrp 1</div>
          <div style="color:var(--amber)">KingKong(config-router)#no auto-summary</div>
          <div style="color:var(--amber)">KingKong(config-router)#network 192.168.12.0</div>
          <div style="color:var(--amber)">KingKong(config-router)#network 192.168.13.0</div>
          <div> </div>
          <div style="color:var(--green)">Carl(config)#router eigrp 1</div>
          <div style="color:var(--amber)">Carl(config-router)#no auto-summary</div>
          <div style="color:var(--amber)">Carl(config-router)#network 192.168.12.0</div>
          <div style="color:var(--amber)">Carl(config-router)#network 192.168.24.0</div>
          <div> </div>
          <div style="color:var(--green)">Ann(config)#router eigrp 1</div>
          <div style="color:var(--amber)">Ann(config-router)#no auto-summary</div>
          <div style="color:var(--amber)">Ann(config-router)#network 192.168.13.0</div>
          <div style="color:var(--amber)">Ann(config-router)#network 192.168.34.0</div>
          <div> </div>
          <div style="color:var(--green)">Preston(config)#router eigrp 1</div>
          <div style="color:var(--amber)">Preston(config-router)#no auto-summary</div>
          <div style="color:var(--amber)">Preston(config-router)#network 192.168.24.0</div>
          <div style="color:var(--amber)">Preston(config-router)#network 192.168.34.0</div>
          <div style="color:var(--amber)">Preston(config-router)#network 4.0.0.0</div>
          <div> </div>
          <div style="color:var(--muted2)">! After config you will see:</div>
          <div style="color:var(--cyan)">%DUAL-5-NBRCHANGE: IP-EIGRP(0) 1:</div>
          <div style="color:var(--cyan)"> Neighbor 192.168.13.3 (FastEthernet0/0)</div>
          <div style="color:var(--cyan)"> is up: new adjacency</div>
        </div>
      </div>
      <div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.8">
          <div style="color:var(--amber)">KingKong#show ip eigrp neighbors</div>
          <div style="color:var(--cyan)">IP-EIGRP neighbors for process 1</div>
          <div style="color:var(--cyan)">H  Address        Interface  Hold Uptime   SRTT  RTO</div>
          <div style="color:var(--muted2)">1  192.168.12.2   Et1/0      14  00:20:08   12   200</div>
          <div style="color:var(--muted2)">0  192.168.13.3   Fa0/0      11  00:43:34  428  2568</div>
          <div> </div>
          <div style="color:var(--amber)">KingKong#show ip route eigrp</div>
          <div style="color:var(--muted2)">4.0.0.0/24 is subnetted, 1 subnets</div>
          <div style="color:var(--green)">D  4.4.4.0 [90/158720] via 192.168.13.3, Fa0/0</div>
          <div style="color:var(--green)">D  192.168.24.0 [90/33280] via 192.168.13.3, Fa0/0</div>
          <div style="color:var(--green)">D  192.168.34.0 [90/30720] via 192.168.13.3, Fa0/0</div>
          <div> </div>
          <div style="color:var(--amber)">! Decode: D  4.4.4.0 [90/158720] via 192.168.13.3</div>
          <div style="color:var(--muted2)">D       = EIGRP (D = DUAL, E was taken by old EGP)</div>
          <div style="color:var(--muted2)">90      = Administrative Distance</div>
          <div style="color:var(--muted2)">158720  = Metric (the Feasible Distance)</div>
          <div style="color:var(--muted2)">via ... = next hop (= Ann router)</div>
          <div> </div>
          <div style="color:var(--amber)">KingKong#show ip eigrp topology</div>
          <div style="color:var(--cyan)">P 4.4.4.0/24, 1 successors, FD is 158720</div>
          <div style="color:var(--green)"> via 192.168.13.3 (158720/156160), Fa0/0 ← SUCCESSOR</div>
          <div style="color:var(--amber)"> via 192.168.12.2 (412160/156160), Et1/0 ← FEASIBLE S.</div>
          <div> </div>
          <div style="color:var(--muted2)">! (158720/156160) = (FD / AD)</div>
          <div style="color:var(--muted2)">! Carl's AD=156160 &lt; Successor FD=158720 → FC met! ✅</div>
          <div style="color:var(--muted2)">! P = Passive (stable), A = Active (querying neighbors)</div>
        </div>
      </div>
    </div>
  </div>

  <div class="card" style="margin-top:14px">
    <div class="card-hdr">Variance — Unequal Load Balancing (EIGRP's Unique Feature)</div>
    <p>OSPF can only load balance on equal-cost paths. EIGRP can load balance over <strong>unequal-cost</strong> paths using the <strong>variance</strong> multiplier. A Feasible Successor is included in the routing table for load balancing if its FD ≤ (Successor FD × variance).</p>
    <div class="grid-2">
      <div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--cyan)">! From topology table:</div>
          <div style="color:var(--muted2)">Successor FD (Ann):           158720</div>
          <div style="color:var(--muted2)">Feasible Successor FD (Carl): 412160</div>
          <div> </div>
          <div style="color:var(--cyan)">! Try variance 2:</div>
          <div style="color:var(--muted2)">158720 × 2 = 317440</div>
          <div style="color:var(--red)">412160 &gt; 317440 → NOT load balanced</div>
          <div> </div>
          <div style="color:var(--cyan)">! Try variance 3:</div>
          <div style="color:var(--muted2)">158720 × 3 = 476160</div>
          <div style="color:var(--green)">412160 &lt; 476160 → LOAD BALANCED ✅</div>
          <div> </div>
          <div style="color:var(--green)">KingKong(config)#router eigrp 1</div>
          <div style="color:var(--amber)">KingKong(config-router)#variance 3</div>
          <div> </div>
          <div style="color:var(--amber)">KingKong#show ip route eigrp</div>
          <div style="color:var(--green)">D  4.4.4.0 [90/158720] via 192.168.13.3, Fa0/0</div>
          <div style="color:var(--green)">           [90/412160] via 192.168.12.2, Et1/0</div>
          <div> </div>
          <div style="color:var(--muted2)">! Both entries in routing table!</div>
          <div style="color:var(--muted2)">! Traffic proportionally distributed:</div>
          <div style="color:var(--muted2)">! Ann carries ~2.6× more than Carl</div>
        </div>
      </div>
      <div>
        <div class="card-hdr" style="margin-bottom:8px">Summarization &amp; MD5 Authentication</div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.8">
          <div style="color:var(--cyan)">! === EIGRP Summarization ===</div>
          <div style="color:var(--muted2)">! Spade has 172.16.0.0/24 and 172.16.1.0/24</div>
          <div style="color:var(--muted2)">! Summarize to /23 on the outgoing interface</div>
          <div style="color:var(--green)">Spade(config)#interface fastEthernet 2/0</div>
          <div style="color:var(--amber)">Spade(config-if)#ip summary-address eigrp 1 172.16.0.0 255.255.254.0</div>
          <div> </div>
          <div style="color:var(--muted2)">! Hearts now sees one /23 instead of two /24s</div>
          <div style="color:var(--red)">! Spade gets: D 172.16.0.0/23 is a summary → Null0</div>
          <div style="color:var(--red)">! Null0 = loop prevention. Traffic for unknown</div>
          <div style="color:var(--red)">! sub-prefixes dropped, not looped.</div>
          <div> </div>
          <div style="color:var(--cyan)">! === MD5 Authentication ===</div>
          <div style="color:var(--green)">KingKong(config)#key chain MYCHAIN</div>
          <div style="color:var(--green)">KingKong(config-keychain)#key 1</div>
          <div style="color:var(--amber)">KingKong(config-keychain-key)#key-string BANANA</div>
          <div> </div>
          <div style="color:var(--green)">Ann(config)#key chain MYCHAIN</div>
          <div style="color:var(--green)">Ann(config-keychain)#key 1</div>
          <div style="color:var(--amber)">Ann(config-keychain-key)#key-string BANANA</div>
          <div> </div>
          <div style="color:var(--cyan)">! Apply to interface on both routers:</div>
          <div style="color:var(--green)">KingKong(config)#interface fastEthernet 0/0</div>
          <div style="color:var(--amber)">KingKong(config-if)#ip authentication mode eigrp 1 md5</div>
          <div style="color:var(--amber)">KingKong(config-if)#ip authentication key-chain eigrp 1 MYCHAIN</div>
          <div> </div>
          <div style="color:var(--muted2)">! Note: key chain NAME can differ per router</div>
          <div style="color:var(--muted2)">! key NUMBER (1) MUST match on both routers</div>
          <div style="color:var(--muted2)">! key-string (BANANA) MUST match on both routers</div>
        </div>
      </div>
    </div>
  </div>

  <div class="card" style="margin-top:14px">
    <div class="card-hdr">🎯 Interview Q&amp;A — EIGRP</div>
    <div class="qa-list">
      <div class="qa-item"><div class="qa-q" onclick="toggleQA(this)">Q: Decode this topology table entry: P 4.4.4.0/24, 1 successors, FD is 158720 / via 192.168.13.3 (158720/156160), Fa0/0 / via 192.168.12.2 (412160/156160), Et1/0<span class="qa-arrow">▶</span></div><div class="qa-a">P = Passive state — the route is stable, no active queries being sent. If it showed A (Active), the router lost its Successor and is querying all neighbors for an alternative path. 4.4.4.0/24 = destination network. 1 successors = one best path exists. FD is 158720 = the total Feasible Distance from this router to 4.4.4.0/24. First entry via 192.168.13.3 (158720/156160): this is the Successor through Ann. 158720 = FD (total distance), 156160 = AD (what Ann told us her cost is to reach 4.4.4.0/24). Fa0/0 = outgoing interface. Second entry via 192.168.12.2 (412160/156160): this is a Feasible Successor through Carl on the slow Ethernet link. 412160 = Carl's FD. 156160 = Carl's AD. Why is Carl a Feasible Successor? Because Carl's AD (156160) is strictly less than the Successor's FD (158720) — the Feasibility Condition is met. This mathematically proves Carl has a loop-free backup path. If Ann's link fails, EIGRP instantly promotes Carl to Successor without any queries — sub-second convergence.</div></div>
      <div class="qa-item"><div class="qa-q" onclick="toggleQA(this)">Q: What does it mean when an EIGRP route goes Active? How do you prevent it?<span class="qa-arrow">▶</span></div><div class="qa-a">Active state means the router lost its Successor AND has no Feasible Successor available. EIGRP sends QUERY packets to ALL neighbors asking if they have a path to the destination. Every neighbor must reply. If a neighbor doesn't reply within the SIA (Stuck-in-Active) timer (default 90 seconds), EIGRP tears down the neighbor relationship to that router. Active state is EIGRP's convergence worst-case. Prevention strategies: (1) Ensure you have Feasible Successors by designing redundant topologies where the Feasibility Condition can be met. (2) Use route summarization to limit query scope — when a query hits a summary boundary, the router replies immediately rather than propagating the query further. (3) Use stub routing on spoke sites — stub routers advertise they have no alternative paths, so the hub never queries them. To diagnose: show ip eigrp topology active, debug eigrp fsm.</div></div>
    </div>
  </div>
</div>
<!-- ═══ CCNA TAB 14: IPv6 ═══ -->
<div id="ccna-topic-14" class="topic-panel">
  <div class="topic-hero" style="border-left:4px solid var(--blue)">
    <div class="topic-title">🌍 IPv6 — 128-bit Addressing, EUI-64, NDP &amp; Routing</div>
    <div class="topic-sub">Why IPv4 ran out · Address format &amp; 3 shortening rules with examples · Prefix calculation including binary math · Global unicast hierarchy IANA→ISP→Customer · Unique local · Link-local · Multicast · EUI-64 step by step · Full config &amp; show output · NDP replaces ARP · DAD debug output · SLAAC explained · DHCPv6 relay · IPv6 routing table decoded</div>
  </div>

  <div class="card">
    <div class="card-hdr">Why IPv6? — The IPv4 Address Exhaustion Problem</div>
    <div class="grid-2">
      <div>
        <p>IPv4 has 32 bits which gives us 4,294,967,296 IP addresses. When the Internet was born companies received entire Class A (16 million addresses), B (65,535 addresses), or C (256 addresses) networks. Large companies like Apple, Microsoft, IBM got one or more Class A networks — but did they really need 16 million IP addresses? Many were just wasted.</p>
        <p>We started using VLSM so we could create smaller subnets, and we have NAT/PAT so many private IP addresses can hide behind a single public IP. Nevertheless, the Internet grew in a way nobody expected. Despite VLSM and NAT/PAT we ran out of IPv4 addresses and IPv6 was born.</p>
        <p><strong>What happened to IPv5?</strong> IP version 5 was used for an experimental project called "Internet Stream Protocol" (RFC 1819). It was never deployed as a general-purpose protocol, so we went straight from IPv4 to IPv6.</p>
        <p>IPv6 has <strong>128-bit</strong> addresses compared to 32-bit IPv4. Every additional bit doubles the number of addresses:</p>
        <div class="callout callout-info">
          IPv6 gives us: <strong>340,282,366,920,938,463,463,374,607,431,768,211,456</strong><br>
          That's 340 undecillion addresses — enough for every device on Earth, the Moon, Mars, and the rest of the universe.
        </div>
      </div>
      <div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>Feature</th><th>IPv4</th><th>IPv6</th></tr>
          <tr><td>Address size</td><td>32 bits</td><td style="color:var(--green)">128 bits</td></tr>
          <tr><td>Total addresses</td><td>~4.3 billion</td><td style="color:var(--green)">340 undecillion (2¹²⁸)</td></tr>
          <tr><td>Format</td><td>Decimal dotted</td><td>8 groups of hex</td></tr>
          <tr><td>Broadcast</td><td>Yes</td><td style="color:var(--green)">No — use multicast</td></tr>
          <tr><td>ARP</td><td>Yes</td><td style="color:var(--green)">No — replaced by NDP</td></tr>
          <tr><td>DHCP</td><td>DHCPv4</td><td>DHCPv6 or SLAAC (new!)</td></tr>
          <tr><td>Header size</td><td>Variable 20-60 bytes</td><td style="color:var(--green)">Fixed 40 bytes</td></tr>
          <tr><td>OSPF version</td><td>OSPFv2</td><td>OSPFv3</td></tr>
          <tr><td>RIP version</td><td>RIPv1/v2</td><td>RIPng</td></tr>
          <tr><td>BGP</td><td>BGP-4</td><td>MP-BGP4</td></tr>
          <tr><td>EIGRP</td><td>EIGRP</td><td>EIGRPv6</td></tr>
        </table></div>
        <div class="callout callout-warn" style="margin-top:8px">⚠️ IPv4 and IPv6 are NOT compatible. Running both on the same network is called <strong>dual stack</strong>. You need separate routing protocol instances for IPv4 and IPv6. The migration is happening now but will take years to complete.</div>
      </div>
    </div>
  </div>

  <div class="card" style="margin-top:14px">
    <div class="card-hdr">IPv6 Address Format — Hex, 8 Groups, and the 3 Shortening Rules</div>
    <p>IPv6 addresses are written in hexadecimal with 8 groups of 4 hex characters separated by colons: <code>2041:0000:140F:0000:0000:0000:875B:131B</code>. Typing this is painful, so there are three rules to shorten it.</p>
    <div class="grid-2">
      <div>
        <div class="card-hdr" style="margin-bottom:8px">Hex Reference Table</div>
        <div class="tbl-wrap" style="margin-bottom:12px"><table class="tbl">
          <tr><th>Hex</th><th>Binary</th><th>Dec</th><th>Hex</th><th>Binary</th><th>Dec</th></tr>
          <tr><td>0</td><td>0000</td><td>0</td><td>8</td><td>1000</td><td>8</td></tr>
          <tr><td>1</td><td>0001</td><td>1</td><td>9</td><td>1001</td><td>9</td></tr>
          <tr><td>2</td><td>0010</td><td>2</td><td style="color:var(--amber)">A</td><td>1010</td><td style="color:var(--amber)">10</td></tr>
          <tr><td>3</td><td>0011</td><td>3</td><td style="color:var(--amber)">B</td><td>1011</td><td style="color:var(--amber)">11</td></tr>
          <tr><td>4</td><td>0100</td><td>4</td><td style="color:var(--amber)">C</td><td>1100</td><td style="color:var(--amber)">12</td></tr>
          <tr><td>5</td><td>0101</td><td>5</td><td style="color:var(--amber)">D</td><td>1101</td><td style="color:var(--amber)">13</td></tr>
          <tr><td>6</td><td>0110</td><td>6</td><td style="color:var(--amber)">E</td><td>1110</td><td style="color:var(--amber)">14</td></tr>
          <tr><td>7</td><td>0111</td><td>7</td><td style="color:var(--amber)">F</td><td>1111</td><td style="color:var(--amber)">15</td></tr>
        </table></div>
        <div class="card-hdr" style="margin-bottom:8px">The 3 Shortening Rules</div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>#</th><th>Rule</th><th>Before</th><th>After</th></tr>
          <tr><td style="color:var(--green)">1</td><td>Replace the longest consecutive run of all-zero groups with :: (only ONCE)</td><td>2041:0000:140F:<strong>0000:0000:0000</strong>:875B:131B</td><td>2041:0000:140F::<strong>875B:131B</strong></td></tr>
          <tr><td style="color:var(--blue)">2</td><td>Remove 4-zero groups leaving a single zero</td><td>2041:<strong>0000</strong>:140F::875B:131B</td><td>2041:<strong>0</strong>:140F::875B:131B</td></tr>
          <tr><td style="color:var(--amber)">3</td><td>Remove leading zeros within any group</td><td>2001:<strong>0001:0002:0003</strong>::1</td><td>2001:<strong>1:2:3</strong>::1</td></tr>
        </table></div>
        <div class="callout callout-warn" style="margin-top:8px">⚠️ You can only use :: ONCE per address. The device expands it by counting how many groups are missing to reach 8 total. Two :: would make this ambiguous — the device can't know how many zeros each represents. Invalid example: 2001::1::2</div>
      </div>
      <div>
        <div class="card-hdr" style="margin-bottom:8px">Prefix Calculation — Including Binary Math for /53</div>
        <p>IPv6 uses prefix length (/64 etc.) like CIDR, not subnet masks. When the prefix length is a multiple of 16, it's easy — the boundary falls exactly on a group separator. When it's not (like /53), you need binary.</p>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--cyan)">! Easy example: /64</div>
          <div style="color:var(--muted2)">Address: 2001:1234:5678:1234:5678:ABCD:EF12:1234/64</div>
          <div style="color:var(--muted2)">First 16 hex chars = first 64 bits = prefix:</div>
          <div style="color:var(--green)">Prefix: 2001:1234:5678:1234::/64</div>
          <div> </div>
          <div style="color:var(--cyan)">! Hard example: /53</div>
          <div style="color:var(--muted2)">Address: 2001:1234:abcd:5678:9877:3322:5541:aabb/53</div>
          <div style="color:var(--muted2)">53 ÷ 16 = 3 full groups (48 bits) + 5 more bits</div>
          <div style="color:var(--muted2)">53rd bit is in the 4th group (5678):</div>
          <div> </div>
          <div style="color:var(--amber)">5678 in binary: 0101 0110 0111 1000</div>
          <div style="color:var(--amber)">53rd bit = 5th bit of this group (counting from left)</div>
          <div style="color:var(--amber)">Split at bit 5:  01010 | 110 0111 1000</div>
          <div style="color:var(--amber)">Host bits → zero: 0101 0000 0000 0000</div>
          <div style="color:var(--amber)">= 5000 in hex</div>
          <div> </div>
          <div style="color:var(--green)">Result: 2001:1234:abcd:5000::/53</div>
        </div>
      </div>
    </div>
  </div>

  <div class="card" style="margin-top:14px">
    <div class="card-hdr">IPv6 Address Types — Global Unicast, Unique Local, Link-Local, Multicast</div>
    <p>IANA reserved certain IPv6 ranges for specific purposes. There are no "classes" like IPv4 had, but there are well-defined scopes:</p>
    <div class="tbl-wrap"><table class="tbl">
      <tr><th>Type</th><th>Prefix</th><th>Routable?</th><th>Description</th></tr>
      <tr><td style="color:var(--green)">Global Unicast</td><td>2000::/3<br>(starts 2 or 3)</td><td style="color:var(--green)">Yes</td><td>IPv6 public addresses. IANA → Regional Registry → ISP → Customer → /64 subnets. Everyone can get a prefix.</td></tr>
      <tr><td style="color:var(--amber)">Unique Local</td><td>FC00::/7<br>(FD prefix)</td><td style="color:var(--red)">No</td><td>Like RFC1918 private. FD + 40-bit Global ID + 16-bit Subnet + 64-bit Interface ID. Make Global ID unique in case you ever merge networks.</td></tr>
      <tr><td style="color:var(--blue)">Link-Local</td><td>FE80::/10<br>(FE80-FEBF)</td><td style="color:var(--red)">No — link only</td><td>Auto-generated on EVERY IPv6 interface. Used by NDP, routing protocol adjacencies, and as next-hop. Always FE80::0000:0000:0000 prefix + interface ID.</td></tr>
      <tr><td style="color:var(--muted2)">Loopback</td><td>::1/128</td><td>No</td><td>Same as IPv4 127.0.0.1</td></tr>
      <tr><td style="color:var(--red)">Multicast</td><td>FF00::/8</td><td>Scope-dependent</td><td>Replaces ALL broadcast. FF02::1=all nodes, FF02::2=all routers, FF02::5=OSPF, FF02::A=EIGRP, FF02::1:2=all DHCP agents</td></tr>
    </table></div>
    <div class="callout callout-info" style="margin-top:8px">💡 <strong>Global Unicast hierarchy example:</strong> IANA assigns 2001:800::/23 to RIPE (Europe). RIPE gives ISP 2001:828::/32. ISP gives customer 2001:828:105::/48. Customer subnets that into /64s: 2001:828:105:0000::/64, 2001:828:105:0001::/64 etc. — 65,536 possible subnets from that /48!</div>
  </div>

  <div class="card" style="margin-top:14px">
    <div class="card-hdr">EUI-64 — Generating Interface ID from MAC Address</div>
    <p>Instead of manually typing all 128 bits, you can give the router just the 64-bit prefix and let it generate the 64-bit interface ID from its MAC address automatically. A MAC address is 48 bits, interface ID is 64 bits — we need 16 more bits.</p>
    <div class="grid-2">
      <div>
        <svg viewBox="0 0 310 195" width="100%" style="display:block">
          <rect x="0" y="0" width="310" height="195" fill="#0d1117" rx="8" stroke="rgba(251,191,36,0.15)"/>
          <text x="12" y="13" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(251,191,36,0.4)">EUI-64 STEP BY STEP</text>
          <text x="12" y="30" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(200,210,230,0.7)">Start: MAC Address</text>
          <rect x="60" y="33" width="185" height="14" rx="3" fill="rgba(251,191,36,0.1)" stroke="#fbbf24" stroke-width="1.2"/>
          <text x="152" y="43" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8.5" font-weight="700" fill="#fbbf24">1234 . 5678 . ABCD</text>
          <text x="12" y="66" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(200,210,230,0.7)">Step 1 — Split in two halves:</text>
          <rect x="55" y="69" width="88" height="14" rx="3" fill="rgba(91,156,246,0.12)" stroke="#5b9cf6" stroke-width="1.2"/>
          <text x="99" y="79" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#5b9cf6">12 34 56</text>
          <rect x="165" y="69" width="88" height="14" rx="3" fill="rgba(74,222,128,0.12)" stroke="#4ade80" stroke-width="1.2"/>
          <text x="209" y="79" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#4ade80">78 AB CD</text>
          <text x="12" y="102" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(200,210,230,0.7)">Step 2 — Insert FF:FE in middle:</text>
          <rect x="25" y="105" width="55" height="14" rx="3" fill="rgba(91,156,246,0.1)" stroke="#5b9cf6" stroke-width="1"/>
          <text x="52" y="115" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#5b9cf6">1234:56</text>
          <rect x="84" y="105" width="55" height="14" rx="3" fill="rgba(248,113,113,0.2)" stroke="#f87171" stroke-width="1.5"/>
          <text x="111" y="115" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" font-weight="700" fill="#f87171">FF:FE</text>
          <rect x="143" y="105" width="55" height="14" rx="3" fill="rgba(74,222,128,0.1)" stroke="#4ade80" stroke-width="1"/>
          <text x="170" y="115" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#4ade80">78:ABCD</text>
          <text x="202" y="115" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(140,150,180,0.5)">= 1234:56FF:FE78:ABCD</text>
          <text x="12" y="140" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(200,210,230,0.7)">Step 3 — Invert the 7th bit of first byte:</text>
          <text x="12" y="155" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(140,150,180,0.6)">12 hex = 0001 0010 binary</text>
          <text x="12" y="167" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(140,150,180,0.6)">7th bit (U/L bit): 0 → flip to 1</text>
          <text x="12" y="179" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(251,191,36,0.7)">Result: 0001 0000 = 10 hex</text>
          <text x="12" y="191" font-family="IBM Plex Mono,monospace" font-size="8" font-weight="700" fill="#4ade80">Final Interface ID: 1034:56FF:FE78:ABCD</text>
        </svg>
      </div>
      <div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--cyan)">! === Configure EUI-64 ===</div>
          <div style="color:var(--muted2)">! Give only the /64 prefix — router generates interface ID</div>
          <div style="color:var(--green)">Router(config)#interface fastEthernet 0/0</div>
          <div style="color:var(--amber)">Router(config-if)#ipv6 address 2001:1234:5678:abcd::/64 eui-64</div>
          <div> </div>
          <div style="color:var(--amber)">Router#show interfaces fa0/0 | include Hardware</div>
          <div style="color:var(--muted2)">Hardware is Gt96k FE, address is c200.185c.0000</div>
          <div> </div>
          <div style="color:var(--amber)">Router#show ipv6 interface fa0/0</div>
          <div style="color:var(--muted2)">IPv6 is enabled, link-local address is FE80::C000:18FF:FE5C:0</div>
          <div style="color:var(--muted2)">Global unicast address(es):</div>
          <div style="color:var(--green)">  2001:1234:5678:ABCD:C000:18FF:FE5C:0, [EUI]</div>
          <div style="color:var(--muted2)">  subnet is 2001:1234:5678:ABCD::/64</div>
          <div> </div>
          <div style="color:var(--cyan)">! === Manual IPv6 address ===</div>
          <div style="color:var(--amber)">Router(config-if)#ipv6 address 2001:1234:5678:abcd::1/64</div>
          <div> </div>
          <div style="color:var(--cyan)">! === MUST enable IPv6 routing! ===</div>
          <div style="color:var(--red)">Router(config)#ipv6 unicast-routing</div>
          <div style="color:var(--muted2)">! Without this, router won't forward IPv6 packets</div>
          <div style="color:var(--muted2)">! or build an IPv6 routing table!</div>
          <div> </div>
          <div style="color:var(--cyan)">! === Enable IPv6 on interface (creates link-local) ===</div>
          <div style="color:var(--amber)">Router(config-if)#ipv6 enable</div>
        </div>
      </div>
    </div>
  </div>

  <div class="card" style="margin-top:14px">
    <div class="card-hdr">NDP — Neighbor Discovery Protocol (Replaces ARP and More)</div>
    <p>NDP (Neighbor Discovery Protocol) uses ICMPv6. It replaces IPv4 ARP completely and adds several new features that IPv4 didn't have. There are no broadcasts in IPv6 — NDP uses multicast to only reach relevant devices.</p>
    <div class="tbl-wrap" style="margin-bottom:12px"><table class="tbl">
      <tr><th>NDP Message</th><th>ICMPv6</th><th>IPv4 Equivalent</th><th>Purpose</th></tr>
      <tr><td style="color:var(--blue)">Router Solicitation (RS)</td><td>Type 133</td><td>No equivalent</td><td>Host asks "Any routers here?" to FF02::2 (all routers multicast)</td></tr>
      <tr><td style="color:var(--green)">Router Advertisement (RA)</td><td>Type 134</td><td>No equivalent</td><td>Router announces: its link-local address, subnet prefix, MTU. Sent periodically to FF02::1 (all nodes) and on demand to RS sender.</td></tr>
      <tr><td style="color:var(--amber)">Neighbor Solicitation (NS)</td><td>Type 135</td><td>ARP Request</td><td>Who has this IPv6 address? Sent to Solicited-Node multicast (FF02::1:FF + last 24 bits of target address)</td></tr>
      <tr><td style="color:var(--cyan)">Neighbor Advertisement (NA)</td><td>Type 136</td><td>ARP Reply</td><td>Here's my MAC address! Also used for DAD response.</td></tr>
      <tr><td style="color:var(--red)">Redirect</td><td>Type 137</td><td>ICMP Redirect</td><td>Router tells host to use a better first hop for a destination</td></tr>
    </table></div>
    <div class="grid-2">
      <div>
        <div class="card-hdr" style="margin-bottom:8px">DAD — Duplicate Address Detection (with debug output)</div>
        <p>Before using ANY IPv6 address (link-local or global unicast), every host performs DAD — it sends a Neighbor Solicitation for its own tentative address. If anyone replies, the address is already taken.</p>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.8">
          <div style="color:var(--amber)">R1#debug ipv6 nd</div>
          <div style="color:var(--muted2)">ICMP Neighbor Discovery events debugging is on</div>
          <div> </div>
          <div style="color:var(--green)">R1(config)#interface fa0/0</div>
          <div style="color:var(--amber)">R1(config-if)#ipv6 address autoconfig</div>
          <div> </div>
          <div style="color:var(--muted2)">! DAD for link-local address:</div>
          <div style="color:var(--cyan)">ICMPv6-ND: Sending NS for FE80::C000:6FF:FE7C:0 on Fa0/0</div>
          <div style="color:var(--green)">ICMPv6-ND: DAD: FE80::C000:6FF:FE7C:0 is unique.</div>
          <div> </div>
          <div style="color:var(--muted2)">! RS/RA exchange for SLAAC:</div>
          <div style="color:var(--cyan)">ICMPv6-ND: Sending RS on FastEthernet0/0</div>
          <div style="color:var(--muted2)">ICMPv6-ND: Received RS on Fa0/0 from FE80::C000:6FF:FE7C:0</div>
          <div style="color:var(--cyan)">ICMPv6-ND: Sending solicited RA on FastEthernet0/0</div>
          <div style="color:var(--muted2)">ICMPv6-ND:  prefix = 2001:2:3:4::/64 onlink autoconfig</div>
          <div style="color:var(--cyan)">ICMPv6-ND: Received RA from FE80::C001:6FF:FE7C:0 on Fa0/0</div>
          <div style="color:var(--cyan)">ICMPv6-ND: Selected new default router FE80::C001:6FF:FE7C:0</div>
          <div> </div>
          <div style="color:var(--muted2)">! DAD for global unicast address:</div>
          <div style="color:var(--cyan)">ICMPv6-ND: Sending NS for 2001:2:3:4:C000:6FF:FE7C:0</div>
          <div style="color:var(--green)">ICMPv6-ND: Autoconfiguring 2001:2:3:4:C000:6FF:FE7C:0 on Fa0/0</div>
          <div style="color:var(--green)">ICMPv6-ND: DAD: 2001:2:3:4:C000:6FF:FE7C:0 is unique.</div>
        </div>
      </div>
      <div>
        <div class="card-hdr" style="margin-bottom:8px">SLAAC + DHCPv6 Relay</div>
        <div class="callout callout-info" style="margin-bottom:8px">
          <strong>SLAAC (Stateless Address Autoconfiguration):</strong><br>
          1. Host sends RS to FF02::2 (all routers)<br>
          2. Router replies with RA containing subnet prefix<br>
          3. Host combines prefix + EUI-64 or random interface ID<br>
          4. Host runs DAD to verify uniqueness<br>
          5. Host has address + default gateway — no DHCP server needed!<br><br>
          <strong>What SLAAC is missing:</strong> DNS server. Use stateless DHCPv6 just for DNS info.
        </div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--cyan)">! === DHCPv6 Relay Configuration ===</div>
          <div style="color:var(--muted2)">! Client sends Solicit to FF02::1:2 (link-local multicast)</div>
          <div style="color:var(--muted2)">! Router on fa0/0 must relay to DHCPv6 server:</div>
          <div> </div>
          <div style="color:var(--green)">Router(config)#interface fa0/0</div>
          <div style="color:var(--amber)">Router(config-if)#ipv6 dhcp relay destination 2001:5:6:7::2</div>
          <div> </div>
          <div style="color:var(--muted2)">! Router forwards using its fa1/0 address as SOURCE</div>
          <div style="color:var(--muted2)">! (unlike IPv4 relay which uses receiving interface address)</div>
          <div> </div>
          <div style="color:var(--cyan)">! === IPv6 Routing Table ===</div>
          <div style="color:var(--amber)">Router#show ipv6 route</div>
          <div style="color:var(--green)">C  2001:2:3:4::/64 [0/0] via ::, FastEthernet0/0</div>
          <div style="color:var(--muted2)">L  2001:2:3:4::1/128 [0/0] via ::, FastEthernet0/0  ← host route</div>
          <div style="color:var(--green)">C  2001:5:6:7::/64 [0/0] via ::, FastEthernet0/1</div>
          <div style="color:var(--muted2)">L  2001:5:6:7::1/128 [0/0] via ::, FastEthernet0/1</div>
          <div style="color:var(--muted2)">L  FF00::/8 [0/0] via ::, Null0  ← multicast</div>
          <div> </div>
          <div style="color:var(--amber)">! IPv6 static route:</div>
          <div style="color:var(--amber)">ipv6 route 2001:5:6:7::/64 2001:2:3:4::2</div>
          <div style="color:var(--amber)">! Default route:</div>
          <div style="color:var(--amber)">ipv6 route ::/0 FE80::1 fa0/0  ← use link-local next-hop!</div>
          <div> </div>
          <div style="color:var(--cyan)">! Neighbor table (replaces ARP table):</div>
          <div style="color:var(--amber)">Router#show ipv6 neighbors</div>
          <div style="color:var(--muted2)">FE80::C000:6FF:FE7C:0  21  c200.067c.0000  STALE  Fa0/0</div>
        </div>
      </div>
    </div>
  </div>

  <div class="card" style="margin-top:14px">
    <div class="card-hdr">🎯 Interview Q&amp;A — IPv6</div>
    <div class="qa-list">
      <div class="qa-item"><div class="qa-q" onclick="toggleQA(this)">Q: IPv6 removes broadcasts entirely. How does it handle what IPv4 used broadcasts for — ARP, DHCP discover, routing hellos?<span class="qa-arrow">▶</span></div><div class="qa-a">IPv6 replaces all broadcasts with targeted multicast. For MAC address resolution (ARP in IPv4): NDP sends a Neighbor Solicitation to the Solicited-Node multicast address FF02::1:FF + last 24 bits of the target IPv6 address. Only devices sharing those 24 bits process it — typically just 1-2 devices instead of the entire subnet waking up. For DHCP: DHCPv6 Solicit goes to FF02::1:2 (all DHCP agents), not a broadcast. Only DHCP servers/relays process it. For router discovery: Router Solicitation goes to FF02::2 (all routers). Routing protocol hellos: OSPF uses FF02::5 and FF02::6. EIGRP uses FF02::A. The efficiency gain is significant — an IPv4 ARP broadcast interrupts every host's CPU on the subnet; a Solicited-Node multicast typically interrupts only 1-2 hosts.</div></div>
      <div class="qa-item"><div class="qa-q" onclick="toggleQA(this)">Q: What is SLAAC? What can it provide and what does it need DHCPv6 for?<span class="qa-arrow">▶</span></div><div class="qa-a">SLAAC (Stateless Address Autoconfiguration) lets a host configure its own IPv6 address with zero DHCP server infrastructure. Process: Host sends RS to FF02::2. Router replies with RA containing subnet prefix (e.g., 2001:DB8:1::/64). Host combines prefix + EUI-64 or random 64-bit interface ID = unique 128-bit address. Host runs DAD. Host uses router's link-local address as default gateway. SLAAC provides: IPv6 address, subnet prefix, default gateway, MTU. What SLAAC cannot provide: DNS server address. You still need either stateless DHCPv6 (provides only options like DNS, no address assignment — no state kept) or stateful DHCPv6 (full assignment like IPv4 DHCP). The RA includes M flag (Managed — use stateful DHCPv6) and O flag (Other info — use stateless DHCPv6 for DNS). No flags = pure SLAAC only. Running both SLAAC and DHCP together is valid and common.</div></div>
    </div>
  </div>
</div>
<!-- ═══ CCNA TAB 15: WAN & DISTANCE VECTOR ═══ -->
<div id="ccna-topic-15" class="topic-panel">
  <div class="topic-hero" style="border-left:4px solid var(--amber)">
    <div class="topic-title">🌐 WAN Technologies &amp; Distance Vector Routing</div>
    <div class="topic-sub">Distance vector concept — routing table exchange every 30s · Counting to infinity problem step by step with routing tables · Split horizon · Route poisoning &amp; poison reverse · Hold-down timer 180s · RIPv1 vs v2 classful/classless difference · Full RIP config with real show outputs · debug ip rip · HDLC vs PPP · PAP vs CHAP configuration</div>
  </div>

  <div class="card">
    <div class="card-hdr">Distance Vector — Routing by Rumor</div>
    <p>Distance vector routing protocols work like signs on a road. You only know the direction (vector) and how far away (distance) a destination is. Routers share their <em>entire routing table</em> with directly-connected neighbors at regular intervals. You only know what your neighbors tell you — like hearing news second or third hand.</p>
    <div class="grid-2">
      <div>
        <svg viewBox="0 0 330 195" width="100%" style="display:block">
          <rect x="0" y="0" width="330" height="195" fill="#0d1117" rx="8" stroke="rgba(251,191,36,0.15)"/>
          <text x="12" y="13" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(251,191,36,0.4)">RIP — ROUTERS EXCHANGE FULL ROUTING TABLE EVERY 30 SECONDS</text>
          <rect x="5" y="20" width="55" height="32" rx="4" fill="rgba(248,113,113,0.1)" stroke="#f87171" stroke-width="1.2"/>
          <text x="32" y="34" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8.5" fill="#f87171">Spade</text>
          <text x="32" y="45" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(248,113,113,0.4)">1.1.1.0</text>
          <rect x="135" y="20" width="55" height="32" rx="4" fill="rgba(74,222,128,0.1)" stroke="#4ade80" stroke-width="1.2"/>
          <text x="162" y="34" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8.5" fill="#4ade80">Hearts</text>
          <text x="162" y="45" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(74,222,128,0.4)">middle</text>
          <rect x="268" y="20" width="57" height="32" rx="4" fill="rgba(56,217,192,0.1)" stroke="#38d9c0" stroke-width="1.2"/>
          <text x="296" y="34" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8.5" fill="#38d9c0">Clubs</text>
          <text x="296" y="45" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(56,217,192,0.4)">3.3.3.0</text>
          <line x1="60" y1="36" x2="135" y2="36" stroke="rgba(255,255,255,0.1)" stroke-width="1.5"/>
          <text x="97" y="31" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(140,150,180,0.4)">192.168.12.0</text>
          <line x1="190" y1="36" x2="268" y2="36" stroke="rgba(255,255,255,0.1)" stroke-width="1.5"/>
          <text x="229" y="31" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(140,150,180,0.4)">192.168.23.0</text>
          <path d="M60 40 L135 40" stroke="rgba(255,200,0,0.6)" stroke-width="1.5" fill="none"/>
          <text x="97" y="50" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(255,200,0,0.6)">full table →</text>
          <path d="M268 42 L190 42" stroke="rgba(255,200,0,0.6)" stroke-width="1.5" fill="none"/>
          <text x="229" y="50" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(255,200,0,0.6)">← full table</text>
          <rect x="5" y="62" width="90" height="60" rx="3" fill="rgba(248,113,113,0.05)" stroke="rgba(248,113,113,0.2)"/>
          <text x="50" y="75" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(248,113,113,0.6)">Spade's Table</text>
          <text x="10" y="88" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(248,113,113,0.5)">1.1.1.0   Fa0/0  0</text>
          <text x="10" y="99" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(248,113,113,0.5)">.12.0     Fa1/0  0</text>
          <text x="10" y="110" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(248,113,113,0.5)">.23.0     Fa1/0  1</text>
          <text x="10" y="121" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(248,113,113,0.5)">3.3.3.0   Fa1/0  2</text>
          <rect x="120" y="62" width="90" height="60" rx="3" fill="rgba(74,222,128,0.05)" stroke="rgba(74,222,128,0.2)"/>
          <text x="165" y="75" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(74,222,128,0.6)">Hearts's Table</text>
          <text x="125" y="88" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(74,222,128,0.5)">.12.0     Fa0/0  0</text>
          <text x="125" y="99" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(74,222,128,0.5)">.23.0     Fa1/0  0</text>
          <text x="125" y="110" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(74,222,128,0.5)">1.1.1.0   Fa0/0  1</text>
          <text x="125" y="121" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(74,222,128,0.5)">3.3.3.0   Fa1/0  1</text>
          <rect x="235" y="62" width="90" height="60" rx="3" fill="rgba(56,217,192,0.05)" stroke="rgba(56,217,192,0.2)"/>
          <text x="280" y="75" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(56,217,192,0.6)">Clubs's Table</text>
          <text x="240" y="88" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(56,217,192,0.5)">.23.0     Fa1/0  0</text>
          <text x="240" y="99" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(56,217,192,0.5)">3.3.3.0   Fa0/0  0</text>
          <text x="240" y="110" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(56,217,192,0.5)">.12.0     Fa1/0  1</text>
          <text x="240" y="121" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(56,217,192,0.5)">1.1.1.0   Fa1/0  2</text>
          <text x="165" y="145" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(140,150,180,0.5)">Metric = hop count. RIP max = 15 hops. 16 = unreachable.</text>
          <text x="165" y="157" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(140,150,180,0.4)">Every 30s: full table sent. 180s no update = invalid. 240s = flushed.</text>
          <text x="165" y="170" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(251,191,36,0.5)">RIPv1: classful — NO subnet mask in updates</text>
          <text x="165" y="182" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(74,222,128,0.5)">RIPv2: classless — includes subnet mask (VLSM support)</text>
          <text x="165" y="192" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(74,222,128,0.4)">RIPv2 uses multicast 224.0.0.9 (not broadcast)</text>
        </svg>
      </div>
      <div>
        <div class="card-hdr" style="margin-bottom:8px">Full RIPv2 Configuration with Real Output</div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--green)">Spade(config)#router rip</div>
          <div style="color:var(--amber)">Spade(config-router)#version 2</div>
          <div style="color:var(--red)">Spade(config-router)#no auto-summary  ← CRITICAL for VLSM!</div>
          <div style="color:var(--amber)">Spade(config-router)#network 192.168.12.0</div>
          <div style="color:var(--amber)">Spade(config-router)#network 172.16.1.0</div>
          <div> </div>
          <div style="color:var(--green)">Hearts(config)#router rip</div>
          <div style="color:var(--amber)">Hearts(config-router)#version 2</div>
          <div style="color:var(--amber)">Hearts(config-router)#no auto-summary</div>
          <div style="color:var(--amber)">Hearts(config-router)#network 192.168.12.0</div>
          <div style="color:var(--amber)">Hearts(config-router)#network 192.168.23.0</div>
          <div> </div>
          <div style="color:var(--amber)">Spade#show ip route rip</div>
          <div style="color:var(--green)">R  192.168.23.0/24 [120/1] via 192.168.12.2, Fa1/0</div>
          <div style="color:var(--green)">R  172.16.2.0/24  [120/2] via 192.168.12.2, Fa1/0</div>
          <div> </div>
          <div style="color:var(--cyan)">! Decode: R  192.168.23.0/24 [120/1] via 192.168.12.2</div>
          <div style="color:var(--muted2)">R      = Learned via RIP</div>
          <div style="color:var(--muted2)">120    = Administrative Distance for RIP</div>
          <div style="color:var(--muted2)">1      = metric (hop count — 1 hop away)</div>
          <div style="color:var(--muted2)">via... = next hop IP address</div>
          <div> </div>
          <div style="color:var(--amber)">Hearts#debug ip rip</div>
          <div style="color:var(--cyan)">RIP: received v2 update from 192.168.12.1 on Fa0/0</div>
          <div style="color:var(--muted2)">    172.16.1.0/24 via 0.0.0.0 in 1 hops</div>
          <div style="color:var(--cyan)">RIP: sending v2 update to 224.0.0.9 via Fa0/0</div>
          <div style="color:var(--muted2)">    172.16.2.0/24 via 0.0.0.0, metric 2, tag 0</div>
        </div>
      </div>
    </div>
  </div>

  <div class="card" style="margin-top:14px">
    <div class="card-hdr">Counting to Infinity — Why Distance Vector Causes Routing Loops</div>
    <p>This is the fundamental weakness of distance vector protocols. When a network goes down, routers may actually <em>increase</em> the hop count indefinitely until they hit the maximum (16 for RIP = unreachable). This causes a routing loop where packets bounce between routers until their TTL expires.</p>
    <div class="grid-2">
      <div>
        <svg viewBox="0 0 330 240" width="100%" style="display:block">
          <rect x="0" y="0" width="330" height="240" fill="#0d1117" rx="8" stroke="rgba(248,113,113,0.15)"/>
          <text x="12" y="13" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(248,113,113,0.4)">COUNTING TO INFINITY — 3.3.3.0 GOES DOWN ON CLUBS</text>
          <rect x="5" y="20" width="55" height="28" rx="4" fill="rgba(248,113,113,0.1)" stroke="#f87171" stroke-width="1"/>
          <text x="32" y="37" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#f87171">Spade</text>
          <rect x="135" y="20" width="55" height="28" rx="4" fill="rgba(74,222,128,0.1)" stroke="#4ade80" stroke-width="1"/>
          <text x="162" y="37" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#4ade80">Hearts</text>
          <rect x="265" y="20" width="60" height="28" rx="4" fill="rgba(56,217,192,0.1)" stroke="#38d9c0" stroke-width="1"/>
          <text x="295" y="31" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#38d9c0">Clubs</text>
          <text x="295" y="43" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(248,113,113,0.6)">3.3.3.0 ↓ DOWN</text>
          <line x1="60" y1="34" x2="135" y2="34" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
          <line x1="190" y1="34" x2="265" y2="34" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
          <text x="165" y="70" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(200,210,230,0.7)">1. 3.3.3.0 interface on Clubs goes DOWN</text>
          <text x="165" y="82" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(200,210,230,0.7)">2. Before Clubs sends update, Hearts sends its 30s update:</text>
          <text x="165" y="93" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(200,210,230,0.7)">   "I can reach 3.3.3.0 in 1 hop" → Clubs receives this</text>
          <rect x="5" y="100" width="315" height="55" rx="4" fill="rgba(248,113,113,0.08)" stroke="rgba(248,113,113,0.25)"/>
          <text x="162" y="115" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#f87171">3. Clubs thinks "Hearts has an alternate path!" and updates to 2 hops</text>
          <text x="162" y="127" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#f87171">4. Hearts receives from Clubs: "3.3.3.0 = 2 hops" → updates to 3</text>
          <text x="162" y="139" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#f87171">5. Clubs updates to 4 hops, Hearts to 5, Clubs to 6...</text>
          <text x="162" y="151" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(248,113,113,0.6)">ROUTING LOOP! Hearts→Clubs→Hearts→Clubs for 3.3.3.0</text>
          <rect x="5" y="165" width="315" height="35" rx="3" fill="rgba(248,113,113,0.05)" stroke="rgba(248,113,113,0.2)"/>
          <text x="162" y="180" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(248,113,113,0.7)">Hearts:  3.3.3.0 → Fa0/0 (towards Clubs), metric 3</text>
          <text x="162" y="191" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(248,113,113,0.7)">Clubs:   3.3.3.0 → Fa0/0 (towards Hearts), metric 2</text>
          <text x="162" y="210" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" font-weight="700" fill="#f87171">This increments until metric reaches 16 = UNREACHABLE</text>
          <text x="162" y="224" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(248,113,113,0.5)">IP packets loop, TTL decrements, eventually dropped by every router</text>
          <text x="162" y="235" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(248,113,113,0.4)">This process is called "counting to infinity"</text>
        </svg>
      </div>
      <div>
        <div class="card-hdr" style="margin-bottom:8px">5 Loop Prevention Mechanisms</div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>Mechanism</th><th>How It Works</th></tr>
          <tr><td style="color:var(--red)">Maximum hop count</td><td>RIP: metric 16 = unreachable. Caps the counting at 15 max hops. Limits damage but doesn't prevent the loop from forming.</td></tr>
          <tr><td style="color:var(--amber)">Split Horizon</td><td>"Don't advertise a route back out the interface you learned it on." Hearts learned 3.3.3.0 from Clubs via fa1/0 — split horizon prevents Hearts from advertising it back out fa1/0. Like telling someone a joke they just told you.</td></tr>
          <tr><td style="color:var(--green)">Route Poisoning</td><td>When 3.3.3.0 goes down on Clubs, Clubs immediately sends a triggered update (doesn't wait 30s) with metric=16 (infinity). Faster convergence — neighbors know immediately, don't wait for timeout.</td></tr>
          <tr><td style="color:var(--cyan)">Poison Reverse</td><td>When Hearts receives the poison (metric=16), it immediately sends metric=16 back to Clubs. Overrides split horizon. Ensures Clubs knows Hearts agrees the route is dead — no stale helpful-but-wrong update possible.</td></tr>
          <tr><td style="color:var(--blue)">Hold-down Timer<br>(180 seconds)</td><td>After learning 3.3.3.0 is down, Hearts ignores any update claiming 3.3.3.0 is reachable with same or worse metric for 180 seconds. Prevents accepting stale "good news" from routers that haven't converged yet. Only a clearly BETTER metric from a new path stops the timer.</td></tr>
        </table></div>
      </div>
    </div>
  </div>

  <div class="card" style="margin-top:14px">
    <div class="card-hdr">WAN Technologies — Serial Links, HDLC, PPP, and Modern WAN</div>
    <div class="callout callout-info" style="margin-bottom:12px">💡 WAN connects geographically dispersed sites using a service provider's infrastructure. Unlike a LAN where you own all the cables, WAN uses leased lines, MPLS circuits, or the Internet. The encapsulation type on serial interfaces determines frame formatting.</div>
    <div class="tbl-wrap" style="margin-bottom:12px"><table class="tbl">
      <tr><th>Technology</th><th>Standard</th><th>Layer</th><th>Key Facts</th></tr>
      <tr><td style="color:var(--blue)">HDLC</td><td style="color:var(--red)">Cisco proprietary</td><td>L2</td><td>Default on Cisco serial interfaces. Cisco added a proprietary "type" field — incompatible with non-Cisco. No authentication. Both sides must be Cisco for HDLC to work.</td></tr>
      <tr><td style="color:var(--green)">PPP</td><td style="color:var(--green)">IETF (RFC 1661)</td><td>L2</td><td>Multi-vendor compatible. Supports PAP/CHAP authentication, compression, multilink. Use when Cisco connects to non-Cisco.</td></tr>
      <tr><td style="color:var(--amber)">PPPoE</td><td>Standard</td><td>L2+L2</td><td>PPP over Ethernet — used by DSL providers. Home router connects to ISP via PPPoE.</td></tr>
      <tr><td style="color:var(--cyan)">MPLS</td><td>Standard</td><td>L2.5</td><td>Provider WAN. Label-switched (not IP-routed). Fast, QoS support, private. Customer traffic isolated in VRFs. Provider-managed.</td></tr>
      <tr><td style="color:var(--muted2)">Frame Relay</td><td>Standard (legacy)</td><td>L2</td><td>Packet-switched legacy. PVCs identified by DLCI numbers. LMI keepalives. Mostly replaced by MPLS and internet VPNs.</td></tr>
      <tr><td style="color:var(--green)">Internet VPN</td><td>Various</td><td>L3+</td><td>Use internet as WAN transport. Cost-effective. GRE, IPSec, SSL VPN. No guaranteed SLA. Dominant in modern enterprise.</td></tr>
    </table></div>
    <div class="grid-2">
      <div>
        <div class="card-hdr" style="margin-bottom:8px">PAP vs CHAP Authentication</div>
        <div class="callout callout-warn" style="margin-bottom:8px">⚠️ Cisco's HDLC default is NOT compatible with non-Cisco devices because of the proprietary type field. When connecting to any non-Cisco device, change to PPP: <code>encapsulation ppp</code></div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>Feature</th><th style="color:var(--red)">PAP</th><th style="color:var(--green)">CHAP (preferred)</th></tr>
          <tr><td>Password</td><td style="color:var(--red)">Sent in plaintext!</td><td style="color:var(--green)">MD5 hash — never sent</td></tr>
          <tr><td>Handshake</td><td>2-way</td><td>3-way (challenge/response/ACK)</td></tr>
          <tr><td>Re-authentication</td><td>One-time at startup</td><td style="color:var(--green)">Periodic during session</td></tr>
          <tr><td>Replay attacks</td><td style="color:var(--red)">Vulnerable</td><td style="color:var(--green)">Protected (random challenge)</td></tr>
        </table></div>
      </div>
      <div>
        <div class="card-hdr" style="margin-bottom:8px">Full PPP CHAP Configuration</div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--cyan)">! CHAP uses the router's HOSTNAME to authenticate</div>
          <div style="color:var(--cyan)">! Username on each side = hostname of the OTHER router</div>
          <div> </div>
          <div style="color:var(--green)">RouterA(config)#username RouterB password cisco</div>
          <div style="color:var(--green)">RouterA(config)#interface Serial0/0</div>
          <div style="color:var(--amber)">RouterA(config-if)#encapsulation ppp</div>
          <div style="color:var(--amber)">RouterA(config-if)#ppp authentication chap</div>
          <div> </div>
          <div style="color:var(--green)">RouterB(config)#username RouterA password cisco</div>
          <div style="color:var(--green)">RouterB(config)#interface Serial0/0</div>
          <div style="color:var(--amber)">RouterB(config-if)#encapsulation ppp</div>
          <div style="color:var(--amber)">RouterB(config-if)#ppp authentication chap</div>
          <div> </div>
          <div style="color:var(--muted2)">! Both sides MUST have the same password</div>
          <div style="color:var(--muted2)">! RouterA's hostname MUST match RouterB's username entry</div>
          <div> </div>
          <div style="color:var(--cyan)">! Verify:</div>
          <div style="color:var(--blue)">show interfaces Serial0/0</div>
          <div style="color:var(--muted2)">  Encapsulation PPP, LCP Open, multilink Open</div>
          <div style="color:var(--blue)">debug ppp authentication   ← watch CHAP handshake</div>
        </div>
      </div>
    </div>
  </div>

  <div class="card" style="margin-top:14px">
    <div class="card-hdr">🎯 Interview Q&amp;A — WAN &amp; Distance Vector</div>
    <div class="qa-list">
      <div class="qa-item"><div class="qa-q" onclick="toggleQA(this)">Q: Explain counting to infinity step by step and describe how each loop prevention mechanism individually helps.<span class="qa-arrow">▶</span></div><div class="qa-a">Counting to infinity: Router Clubs has 3.3.3.0 directly connected. The interface goes down. Before Clubs can send a triggered update, it is Hearts' turn to send its regular 30-second update. Hearts advertises "I can reach 3.3.3.0 in 1 hop" (via Clubs). Clubs receives this and thinks "Hearts has an alternate path!" and updates to 2 hops via Hearts. Hearts then receives from Clubs "3.3.3.0 is 2 hops" and updates to 3 hops. They increment each other — Hearts says 3, Clubs says 4, Hearts says 5, indefinitely — this is a routing loop. IP packets bounce between Hearts and Clubs, TTL decrements at each hop, eventually all dropped. Split Horizon prevents this specific scenario: Hearts learned 3.3.3.0 FROM Clubs (via fa1/0). Split horizon prevents Hearts from advertising it BACK out fa1/0. If split horizon had been active, Hearts would never advertise 3.3.3.0 toward Clubs, so Clubs would never get the "alternative path" update. Route Poisoning: When Clubs detects 3.3.3.0 is down, it immediately sends a triggered update (not waiting 30s) advertising 3.3.3.0 with metric=16 (infinity). Hearts hears this fast, before its own 30s update fires. Poison Reverse: Hearts receives metric=16 from Clubs. Even though split horizon would normally prevent Hearts from advertising this back, Poison Reverse overrides split horizon: Hearts sends metric=16 back to Clubs, confirming "I also have no path to 3.3.3.0." Hold-down Timer: Both routers start a 180-second timer. During this time, any update claiming 3.3.3.0 is reachable at the same or worse metric is IGNORED. This prevents a third router (Spade) from accidentally advertising a stale route to 3.3.3.0 and causing partial reconvergence.</div></div>
      <div class="qa-item"><div class="qa-q" onclick="toggleQA(this)">Q: Why does Cisco's default HDLC not interoperate with other vendors, and what do you change?<span class="qa-arrow">▶</span></div><div class="qa-a">Standard HDLC (ISO 13239) has no field to identify the payload protocol. Cisco modified HDLC to add a proprietary 2-byte type field after the address field that identifies whether the payload is IP, IPX, or another protocol. A non-Cisco device (Juniper, Checkpoint, Linux) receiving a Cisco HDLC frame cannot parse this extra field and drops all frames. The serial interface comes up at Layer 1 (you see "Serial0/0 is up") but Layer 2 never opens ("line protocol is down"). Fix: change encapsulation to PPP on both sides using encapsulation ppp. PPP is defined in RFC 1661, implemented identically across all vendors. PPP also provides benefits HDLC lacks: authentication (CHAP or PAP), compression, multilink bundling, and LCP/NCP negotiation for protocol options. Verify success: show interfaces Serial0/0 should show "Encapsulation PPP, LCP Open" — LCP Open means Layer 2 PPP negotiation succeeded.</div></div>
    </div>
  </div>
</div>

</div><!-- /page-ccna -->
`;

  /* ─── CCNP ─────────────────────────────────────────────────────── */
  const ccnpHTML = `
<!-- ══════ PAGE: CCNP ══════ -->
<!-- ══════ PAGE: CCNP ══════ -->
<div class="page fade-up" id="page-ccnp">
  <div class="page-header" style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:10px">
    <div>
      <div class="page-title">📗 CCNP Course</div>
      <div class="page-desc">Cisco Certified Network Professional — Advanced topics with CCIE-depth packet analysis</div>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px">
      <span style="font-family:var(--mono);font-size:10px;padding:5px 12px;border-radius:20px;background:rgba(74,222,128,0.1);border:1px solid rgba(74,222,128,0.3);color:var(--green)">8 Modules</span>
      <span style="font-family:var(--mono);font-size:10px;padding:5px 12px;border-radius:20px;background:rgba(167,139,250,0.1);border:1px solid rgba(167,139,250,0.3);color:#a78bfa">CCIE Level</span>
    </div>
  </div>

  <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:18px;padding:4px;background:var(--bg2);border-radius:12px;border:1px solid var(--border)">
    <button class="course-tab active" id="ccnp-tab-0" onclick="showTopic('ccnp',0)">🔁 Advanced OSPF</button>
    <button class="course-tab" id="ccnp-tab-1" onclick="showTopic('ccnp',1)">🌍 BGP Deep Dive</button>
    <button class="course-tab" id="ccnp-tab-2" onclick="showTopic('ccnp',2)">🔧 BGP Troubleshooting</button>
    <button class="course-tab" id="ccnp-tab-3" onclick="showTopic('ccnp',3)">🏷️ MPLS</button>
    <button class="course-tab" id="ccnp-tab-4" onclick="showTopic('ccnp',4)">📊 QoS</button>
    <button class="course-tab" id="ccnp-tab-5" onclick="showTopic('ccnp',5)">🛡️ IPSec VPN</button>
    <button class="course-tab" id="ccnp-tab-6" onclick="showTopic('ccnp',6)">⚙️ SD-WAN &amp; SDN</button>
    <button class="course-tab" id="ccnp-tab-7" onclick="showTopic('ccnp',7)">🔬 Troubleshooting</button>
  </div>


<div id="ccnp-topic-0" class="topic-panel active-panel">
    <div class="topic-hero" style="border-left:4px solid var(--green)">
      <div class="topic-title">🔁 Advanced OSPF — LSA Types, Areas, Redistribution &amp; OSPFv3</div>
      <div class="topic-sub">Complete OSPF reference — multi-area, LSAs 1-7, vendor configs, OSPFv3</div>
    </div>

  <div class="card" style="margin-top:14px">
    <div class="card-hdr">OSPF Hello Packet — What's Inside &amp; Why It Matters</div>
    <div class="callout callout-info" style="margin-bottom:10px">The OSPF Hello packet is how routers find each other and maintain adjacencies. It is sent to the multicast address 224.0.0.5 (AllOSPFRouters) every Hello Interval (default 10s on broadcast links, 30s on NBMA). If a neighbor's Hello is not received for the Dead Interval (4× Hello = 40s), the neighbor is declared down and routes are recalculated.</div>
    <div class="grid-2">
      <div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>Hello Field</th><th>Must Match?</th><th>Value/Purpose</th></tr>
          <tr><td style="color:var(--red)">Area ID</td><td style="color:var(--red)">YES</td><td>Both routers must be in same area</td></tr>
          <tr><td style="color:var(--red)">Authentication</td><td style="color:var(--red)">YES</td><td>Type + password must match exactly</td></tr>
          <tr><td style="color:var(--red)">Hello Interval</td><td style="color:var(--red)">YES</td><td>Default 10s broadcast, 30s NBMA</td></tr>
          <tr><td style="color:var(--red)">Dead Interval</td><td style="color:var(--red)">YES</td><td>Default 40s (4× hello)</td></tr>
          <tr><td style="color:var(--red)">Subnet mask</td><td style="color:var(--red)">YES (broadcast)</td><td>Must match on same segment</td></tr>
          <tr><td style="color:var(--amber)">Stub area flag</td><td style="color:var(--amber)">YES</td><td>Both must agree on stub area</td></tr>
          <tr><td style="color:var(--blue)">Router ID</td><td>No (unique)</td><td>Identifies this router — must be unique!</td></tr>
          <tr><td style="color:var(--cyan)">DR / BDR</td><td>No</td><td>Current DR/BDR IPs on this segment</td></tr>
          <tr><td style="color:var(--green)">Neighbor list</td><td>No</td><td>IPs of routers this router has seen — used for 2-way check</td></tr>
          <tr><td style="color:var(--muted2)">Options (E bit)</td><td>No (but noted)</td><td>E=1: external routing capable (cleared in stub areas)</td></tr>
        </table></div>
        <div class="callout callout-warn" style="margin-top:8px">⚠️ <strong>Router ID Selection (automatic):</strong> ①Highest loopback IP, ②Highest interface IP (if no loopback). Problem: if a loopback comes up AFTER OSPF starts, the Router ID doesn't change — restarting OSPF process is needed. Best practice: always manually set: <code>router-id 1.1.1.1</code></div>
      </div>
      <div>
        <div class="card-hdr" style="margin-bottom:8px">OSPF Network Types — Critical for Adjacency Formation</div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>Network Type</th><th>DR/BDR?</th><th>Default on</th><th>Hello/Dead</th></tr>
          <tr><td style="color:var(--blue)">Broadcast</td><td style="color:var(--green)">YES</td><td>Ethernet</td><td>10/40s</td></tr>
          <tr><td style="color:var(--cyan)">Point-to-Point</td><td style="color:var(--red)">NO</td><td>Serial (HDLC/PPP), GRE tunnels</td><td>10/40s</td></tr>
          <tr><td style="color:var(--amber)">NBMA</td><td style="color:var(--green)">YES</td><td>Frame Relay hub-spoke</td><td>30/120s</td></tr>
          <tr><td style="color:var(--amber)">Point-to-Multipoint</td><td style="color:var(--red)">NO</td><td>Frame Relay (manual)</td><td>30/120s</td></tr>
          <tr><td style="color:var(--muted2)">Loopback</td><td style="color:var(--red)">NO</td><td>Loopback interface</td><td>Advertised as /32</td></tr>
        </table></div>
        <div class="callout callout-warn" style="margin-bottom:8px;margin-top:8px">⚠️ <strong>Classic production issue:</strong> Connecting two routers via an Ethernet link but the far side uses a GRE tunnel. Ethernet defaults to Broadcast network type (needs DR), but GRE defaults to Point-to-Point (no DR). They're on different network types → adjacency forms at 2-WAY but never reaches FULL. Fix: manually set matching network type: <code>ip ospf network point-to-point</code> on the Ethernet side.</div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:10px;font-family:var(--mono);font-size:10px;line-height:1.8">
          <div style="color:var(--cyan)">! Key OSPF show commands</div>
          <div style="color:var(--blue)">show ip ospf neighbor                ← state + DR/BDR</div>
          <div style="color:var(--blue)">show ip ospf interface brief         ← type, cost, state</div>
          <div style="color:var(--blue)">show ip ospf interface Gi0/0         ← detailed: timers, DR, cost</div>
          <div style="color:var(--blue)">show ip ospf database                ← LSDB summary</div>
          <div style="color:var(--blue)">show ip ospf database router 1.1.1.1 ← specific LSA</div>
          <div style="color:var(--amber)">debug ip ospf hello                  ← hello send/receive</div>
          <div style="color:var(--amber)">debug ip ospf adj                    ← adjacency events</div>
        </div>
      </div>
    </div>
  </div>

  <div class="card" style="margin-top:14px">
    <div class="card-hdr">OSPF Cost Calculation — End-to-End Path Selection</div>
    <div class="grid-2">
      <div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:14px;font-family:var(--mono);font-size:10.5px;line-height:2">
          <div style="color:var(--amber);font-weight:700">OSPF COST FORMULA:</div>
          <div style="color:var(--text)">Cost = Reference Bandwidth / Interface Bandwidth</div>
          <div style="color:var(--text)">Default Reference BW = 100 Mbps</div>
          <div style="margin-top:8px;color:var(--cyan)">DEFAULT COSTS (problematic for modern networks!):</div>
          <div style="color:var(--red)">GigabitEthernet : 100M/1000M = 0.1 → rounded to 1</div>
          <div style="color:var(--red)">FastEthernet    : 100M/100M  = 1.0 → 1</div>
          <div style="color:var(--red)">GbE = FE = same cost! OSPF can't distinguish!</div>
          <div style="color:var(--muted)">Ethernet (10M)  : 100M/10M = 10</div>
          <div style="color:var(--muted)">T1 (1.544M)     : 100M/1.544M = 64</div>
          <div style="color:var(--muted)">64 Kbps         : 100M/0.064M = 1562</div>
          <div style="margin-top:8px;color:var(--green)">FIX: auto-cost reference-bandwidth 10000 (= 10G)</div>
          <div style="color:var(--green)">10GbE  : 10000M/10000M  = 1</div>
          <div style="color:var(--green)">1GbE   : 10000M/1000M   = 10</div>
          <div style="color:var(--green)">100Mbps: 10000M/100M    = 100</div>
          <div style="color:var(--green)">10Mbps : 10000M/10M     = 1000</div>
          <div style="color:var(--amber);margin-top:8px">MUST set on ALL OSPF routers or costs are inconsistent!</div>
        </div>
      </div>
      <div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10.5px;line-height:1.9">
          <div style="color:var(--cyan)">PATH COST EXAMPLE (corrected reference-bandwidth):</div>
          <div style="color:var(--text)">R1 --[GbE,cost 10]-- R2 --[GbE,cost 10]-- R3</div>
          <div style="color:var(--text)">R1 --[100M,cost 100]------------- R3</div>
          <div style="color:var(--text)">Total cost via R2: 10+10 = 20</div>
          <div style="color:var(--text)">Total cost direct: 100</div>
          <div style="color:var(--green)">→ OSPF prefers R1→R2→R3 (cost 20 &lt; 100)</div>
          <div style="color:var(--muted);margin-top:6px">This is correct — GbE path is faster!</div>
          <div style="color:var(--red);margin-top:6px">Without fix (all cost=1):</div>
          <div style="color:var(--red)">Both paths = cost 2. OSPF picks arbitrarily.</div>
          <div style="color:var(--cyan);margin-top:8px">! Override per-interface cost</div>
          <div style="color:var(--green)">interface Gi0/0</div>
          <div style="color:var(--green)"> ip ospf cost 50    ← manual override</div>
          <div style="color:var(--muted)">Useful for traffic engineering</div>
        </div>
        <div class="callout callout-info" style="margin-top:8px">OSPF uses Dijkstra's SPF algorithm (Shortest Path First) on the LSDB. Every router runs SPF independently. The LSDB must be IDENTICAL on all routers in an area — if routers have different LSDBs, they compute different topologies → routing loops or black holes. <code>show ip ospf database</code> on two routers should show identical output.</div>
      </div>
    </div>
  </div>

  <div class="card" style="margin-top:14px">
    <div class="card-hdr">🎯 Advanced CCNA OSPF Interview Q&amp;A</div>
    <div class="qa-list">
      <div class="qa-item">
        <div class="qa-q" onclick="toggleQA(this)">Q: Two routers are connected and OSPF is configured but you see neighbors stuck at 2-WAY instead of FULL. Neither is the DR. What is the issue?<span class="qa-arrow">▶</span></div>
        <div class="qa-a">2-WAY is the NORMAL and expected state between two DROther routers on a broadcast segment. DROther routers only form FULL adjacency with the DR and BDR — NOT with each other. So if you have 5 routers on a segment and 3 are DROthers, those 3 will all show 2-WAY with each other, and FULL only with the DR and BDR. This is by design — it reduces the number of adjacencies from n(n-1)/2 to 2(n-2). If you expect FULL between two specific routers, verify: (a) Is one of them the DR or BDR? (b) Is the network type point-to-point? On a P2P link, there's no DR election and both sides go directly to FULL. (c) If these are the only two routers on the segment, one MUST be DR and one MUST be BDR — they should reach FULL. Check: <code>show ip ospf neighbor</code> — the state column will show 2WAY or FULL plus their role (DR/BDR/DROTHER). If two routers that should be DR/BDR are showing 2-WAY, check that the interface network type matches on both sides.</div>
      </div>
      <div class="qa-item">
        <div class="qa-q" onclick="toggleQA(this)">Q: What is OSPF summarization and where can you configure it? What are the risks?<span class="qa-arrow">▶</span></div>
        <div class="qa-a">OSPF summarization reduces LSA flooding by replacing multiple specific routes with a single summary route. Two points where it can be configured: ①<strong>ABR (Area Border Router) — inter-area summarization:</strong> <code>area 1 range 10.1.0.0 255.255.0.0</code> under <code>router ospf</code>. This summarizes all routes from Area 1 into a single Type-3 LSA advertised into Area 0. ②<strong>ASBR — external route summarization:</strong> <code>summary-address 10.0.0.0 255.0.0.0</code> under <code>router ospf</code>. Summarizes redistributed external routes. <strong>Risks:</strong> (a) Discontiguous subnets — if you summarize 10.1.0.0/16 but 10.1.50.0/24 doesn't actually exist behind the ABR, traffic for that subnet hits the summary, the ABR has no specific route, falls to default or drops → black hole. Fix: the ABR automatically installs a Null0 route for the summary to prevent this. (b) Suboptimal routing — a summary hides topology detail. A remote router may see one path to 10.1.0.0/16 but the optimal path to 10.1.50.0/24 might be different. (c) Slow convergence — if a component subnet fails, the summary stays up, and traffic keeps going to the ABR until the ABR notices the specific prefix is gone.</div>
      </div>
    </div>
  </div>
    <div class="grid-2">
      <div>
        <div class="card">
          <div class="card-hdr">OSPF LSA Types — Complete Reference</div>
          <div class="tbl-wrap"><table class="tbl">
            <tr><th>Type</th><th>Name</th><th>Generated by</th><th>Scope</th><th>Areas</th></tr>
            <tr><td style="color:var(--blue);font-weight:700">1</td><td>Router LSA</td><td>Every router</td><td>Intra-area</td><td>All</td></tr>
            <tr><td style="color:var(--blue);font-weight:700">2</td><td>Network LSA</td><td>DR only</td><td>Intra-area</td><td>All</td></tr>
            <tr><td style="color:var(--cyan);font-weight:700">3</td><td>Network Summary</td><td>ABR</td><td>Inter-area</td><td>All except stub</td></tr>
            <tr><td style="color:var(--cyan);font-weight:700">4</td><td>ASBR Summary</td><td>ABR</td><td>Inter-area</td><td>All except stub</td></tr>
            <tr><td style="color:var(--amber);font-weight:700">5</td><td>External LSA</td><td>ASBR</td><td>AS-wide</td><td>Not stub/NSSA</td></tr>
            <tr><td style="color:var(--amber);font-weight:700">6</td><td>Multicast LSA</td><td>MOSPF router</td><td>Intra-area</td><td>—</td></tr>
            <tr><td style="color:var(--red);font-weight:700">7</td><td>NSSA External</td><td>ASBR in NSSA</td><td>NSSA only</td><td>NSSA; converted to Type5 at ABR</td></tr>
          </table></div>
          <div class="card-hdr" style="margin-top:14px;margin-bottom:8px">OSPF Area Types — LSA Flood Scope</div>
          <div class="tbl-wrap"><table class="tbl">
            <tr><th>Area Type</th><th>LSAs Allowed</th><th>Has ASBR?</th><th>Config</th></tr>
            <tr><td style="color:var(--blue)">Backbone Area 0</td><td>1,2,3,4,5</td><td>✅ Yes</td><td>#area 0</td></tr>
            <tr><td style="color:var(--cyan)">Standard/Normal</td><td>1,2,3,4,5</td><td>✅ Yes</td><td>#area N</td></tr>
            <tr><td style="color:var(--amber)">Stub Area</td><td>1,2,3</td><td>❌ No</td><td>#area N stub</td></tr>
            <tr><td style="color:var(--amber)">Totally Stub (Cisco)</td><td>1,2</td><td>❌ No</td><td>#area N stub nosummary</td></tr>
            <tr><td style="color:var(--green)">NSSA</td><td>1,2,3,7</td><td>✅ Yes (LSA7)</td><td>#area N nssa</td></tr>
            <tr><td style="color:var(--green)">Totally NSSA</td><td>1,2,7</td><td>✅ Yes</td><td>#area N nssa no-summary</td></tr>
          </table></div>
        </div>
        <div class="card" style="margin-top:14px">
          <div class="card-hdr">🔬 Multi-Area OSPF — EVE-NG Lab Topology</div>
          <svg viewBox="0 0 420 230" width="100%" style="display:block">
            <rect x="0" y="0" width="420" height="230" rx="8" fill="#0d1117" stroke="rgba(74,222,128,0.2)" stroke-width="1"/>
            <text x="10" y="14" font-family="IBM Plex Mono,monospace" font-size="8" fill="rgba(74,222,128,0.5)">EVE-NG MULTI-AREA OSPF LAB</text>
            <!-- Area 0 backbone -->
            <rect x="130" y="22" width="160" height="90" rx="8" fill="rgba(91,156,246,0.06)" stroke="rgba(91,156,246,0.4)" stroke-width="1.5" stroke-dasharray="6 3"/>
            <text x="210" y="38" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="10" font-weight="700" fill="#5b9cf6">Area 0 — Backbone</text>
            <!-- Core routers in Area 0 -->
            <rect x="145" y="45" width="55" height="35" rx="18" fill="#1a2236" stroke="#5b9cf6" stroke-width="1.5"/>
            <text x="172" y="60" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#5b9cf6">ABR-1</text>
            <text x="172" y="72" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(91,156,246,0.5)">1.1.1.1</text>
            <rect x="225" y="45" width="55" height="35" rx="18" fill="#1a2236" stroke="#5b9cf6" stroke-width="1.5"/>
            <text x="252" y="60" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#5b9cf6">ABR-2</text>
            <text x="252" y="72" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(91,156,246,0.5)">2.2.2.2</text>
            <line x1="200" y1="62" x2="225" y2="62" stroke="rgba(91,156,246,0.5)" stroke-width="1.5"/>
            <text x="212" y="58" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(91,156,246,0.4)">10.0.0.0/30</text>
            <!-- Area 1 left -->
            <rect x="5" y="30" width="120" height="75" rx="8" fill="rgba(56,217,192,0.05)" stroke="rgba(56,217,192,0.35)" stroke-width="1.5" stroke-dasharray="6 3"/>
            <text x="65" y="46" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" font-weight="700" fill="#38d9c0">Area 1</text>
            <rect x="15" y="50" width="50" height="32" rx="16" fill="#1a2236" stroke="#38d9c0" stroke-width="1"/>
            <text x="40" y="64" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#38d9c0">IR-1</text>
            <text x="40" y="75" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(56,217,192,0.5)">3.3.3.3</text>
            <rect x="75" y="50" width="42" height="32" rx="16" fill="#1a2236" stroke="#38d9c0" stroke-width="1"/>
            <text x="96" y="64" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#38d9c0">IR-2</text>
            <text x="96" y="75" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(56,217,192,0.5)">4.4.4.4</text>
            <line x1="65" y1="66" x2="75" y2="66" stroke="rgba(56,217,192,0.4)" stroke-width="1"/>
            <line x1="125" y1="62" x2="145" y2="62" stroke="rgba(56,217,192,0.5)" stroke-width="1.5"/>
            <text x="135" y="56" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(56,217,192,0.5)">Type 3</text>
            <text x="135" y="64" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(56,217,192,0.5)">LSA</text>
            <!-- Area 2 right -->
            <rect x="295" y="30" width="120" height="75" rx="8" fill="rgba(167,139,250,0.05)" stroke="rgba(167,139,250,0.35)" stroke-width="1.5" stroke-dasharray="6 3"/>
            <text x="355" y="46" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" font-weight="700" fill="#a78bfa">Area 2 — Stub</text>
            <rect x="305" y="50" width="48" height="32" rx="16" fill="#1a2236" stroke="#a78bfa" stroke-width="1"/>
            <text x="329" y="64" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#a78bfa">IR-3</text>
            <text x="329" y="75" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(167,139,250,0.5)">5.5.5.5</text>
            <rect x="365" y="50" width="42" height="32" rx="16" fill="#1a2236" stroke="#a78bfa" stroke-width="1"/>
            <text x="386" y="64" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#a78bfa">IR-4</text>
            <text x="386" y="75" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(167,139,250,0.5)">6.6.6.6</text>
            <line x1="280" y1="62" x2="295" y2="62" stroke="rgba(167,139,250,0.5)" stroke-width="1.5"/>
            <text x="285" y="56" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(167,139,250,0.5)">Type 3</text>
            <text x="285" y="64" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="rgba(167,139,250,0.5)">default</text>
            <!-- NSSA Area 3 bottom -->
            <rect x="90" y="130" width="240" height="70" rx="8" fill="rgba(251,191,36,0.05)" stroke="rgba(251,191,36,0.35)" stroke-width="1.5" stroke-dasharray="6 3"/>
            <text x="210" y="147" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" font-weight="700" fill="#fbbf24">Area 3 — NSSA</text>
            <rect x="110" y="152" width="55" height="35" rx="18" fill="#1a2236" stroke="#fbbf24" stroke-width="1.5"/>
            <text x="137" y="167" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#fbbf24">ASBR</text>
            <text x="137" y="178" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(251,191,36,0.5)">7.7.7.7</text>
            <rect x="200" y="155" width="48" height="30" rx="15" fill="#1a2236" stroke="#fbbf24" stroke-width="1"/>
            <text x="224" y="173" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#fbbf24">IR-5</text>
            <!-- ASBR to Internet -->
            <rect x="10" y="170" width="75" height="28" rx="5" fill="rgba(74,222,128,0.08)" stroke="rgba(74,222,128,0.3)" stroke-width="1"/>
            <text x="47" y="188" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#4ade80">Internet</text>
            <line x1="85" y1="169" x2="110" y2="169" stroke="rgba(74,222,128,0.4)" stroke-width="1.5" stroke-dasharray="4 2"/>
            <text x="97" y="163" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(74,222,128,0.5)">LSA7→5</text>
            <!-- Area 3 connects to backbone -->
            <line x1="172" y1="112" x2="172" y2="130" stroke="rgba(251,191,36,0.5)" stroke-width="1.5"/>
            <!-- Legend -->
            <text x="10" y="214" font-family="IBM Plex Mono,monospace" font-size="8" fill="rgba(56,217,192,0.6)">ABR = Area Border Router  ·  ASBR = AS Boundary Router</text>
            <text x="10" y="226" font-family="IBM Plex Mono,monospace" font-size="8" fill="rgba(140,150,180,0.4)">LSA7 (NSSA External) generated at ASBR, converted to LSA5 by ABR</text>
          </svg>
        </div>
      </div>
      <div>
        <div class="card">
          <div class="card-hdr">OSPF Configuration — Multi-Vendor</div>
          <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10.5px;line-height:1.9;margin-bottom:10px">
            <div style="color:var(--cyan)">! Cisco IOS — Basic OSPF</div>
            <div style="color:var(--green)">R1(config)#router ospf 1</div>
            <div style="color:var(--green)">R1(config-router)#router-id 1.1.1.1</div>
            <div style="color:var(--green)">R1(config-router)#network 1.1.1.1 255.255.255.255 area 0</div>
            <div style="color:var(--green)">R1(config-router)#network 12.12.12.0 0.0.0.255 area 0</div>
            <div style="color:var(--amber)">R1(config-router)#auto-cost reference-bandwidth 1000  ← FIX GbE cost!</div>
            <div style="color:var(--cyan);margin-top:8px">! Area type configs</div>
            <div style="color:var(--green)">area 2 stub                    ← Stub area</div>
            <div style="color:var(--green)">area 2 stub no-summary         ← Totally Stub (Cisco only)</div>
            <div style="color:var(--green)">area 3 nssa                    ← NSSA</div>
            <div style="color:var(--green)">area 3 nssa no-summary         ← Totally NSSA</div>
            <div style="color:var(--cyan);margin-top:8px">! Summarization at ABR</div>
            <div style="color:var(--green)">area 1 range 10.0.0.0 255.0.0.0  ← summarize area 1 routes</div>
            <div style="color:var(--cyan);margin-top:8px">! Verification</div>
            <div style="color:var(--blue)">show ip ospf neighbor</div>
            <div style="color:var(--blue)">show ip ospf interface</div>
            <div style="color:var(--blue)">show ip route ospf</div>
            <div style="color:var(--blue)">show ip ospf database</div>
            <div style="color:var(--blue)">show ip ospf database router    ← Type 1 LSAs</div>
            <div style="color:var(--blue)">show ip ospf database summary   ← Type 3 LSAs</div>
            <div style="color:var(--blue)">show ip ospf database external  ← Type 5 LSAs</div>
          </div>
          <div class="card-hdr" style="margin-bottom:8px">OSPFv3 vs OSPFv2 (IPv6) — Key Differences</div>
          <div class="tbl-wrap"><table class="tbl">
            <tr><th>Feature</th><th>OSPFv2</th><th>OSPFv3</th></tr>
            <tr><td>IP Version</td><td>IPv4</td><td style="color:var(--cyan)">IPv6 (RFC5340)</td></tr>
            <tr><td>Adjacency Address</td><td>IPv4 address</td><td style="color:var(--cyan)">IPv6 Link-Local (FE80::/10)</td></tr>
            <tr><td>All OSPF Routers</td><td>224.0.0.5</td><td style="color:var(--cyan)">FF02::5</td></tr>
            <tr><td>All DR Routers</td><td>224.0.0.6</td><td style="color:var(--cyan)">FF02::6</td></tr>
            <tr><td>Header Size</td><td>24 bytes</td><td style="color:var(--cyan)">16 bytes</td></tr>
            <tr><td>Auth</td><td>MD5/clear text</td><td style="color:var(--green)">IPv6 IPSec</td></tr>
            <tr><td>Per-link support</td><td>Per-subnet</td><td style="color:var(--cyan)">Per-link</td></tr>
          </table></div>
        </div>
      </div>
    </div>
    <div class="card" style="margin-top:14px">
      <div class="card-hdr">🎯 CCIE Interview Questions — Advanced OSPF</div>
      <div class="qa-list">
        <div class="qa-item"><div class="qa-q" onclick="toggleQA(this)">Q: What is the difference between E1 and E2 external routes and when do you use each?<span class="qa-arrow">▶</span></div><div class="qa-a"><strong>E2 (default):</strong> The metric is ONLY the external cost set at the ASBR — it does NOT accumulate internal OSPF cost as the route propagates through the domain. All routers see the same E2 metric. <strong>E1:</strong> Metric = external cost + internal OSPF cost to reach the ASBR. More accurate for path selection. Use E1 when you have multiple ASBRs redistributing the same external routes — E1 allows routers to pick the ASBR that's closest internally. With E2, all paths to the same external destination look identical (same external cost) and the tie-breaker becomes the cost to the ASBR, which may give suboptimal results. Production rule: E1 for multi-ASBR scenarios; E2 when only one ASBR.</div></div>
        <div class="qa-item"><div class="qa-q" onclick="toggleQA(this)">Q: OSPF neighbor is stuck in EXSTART/EXCHANGE. How do you diagnose?<span class="qa-arrow">▶</span></div><div class="qa-a">EXSTART/EXCHANGE is almost always an MTU mismatch. Diagnosis: <code>show interfaces Gi0/0</code> on both sides → compare MTU values. Fix: <code>ip ospf mtu-ignore</code> (temporary) or align MTUs (permanent). EXSTART is where Master/Slave election happens based on Router ID. If MTU mismatch exists, the larger MTU side sends DBD packets that exceed the smaller MTU side's buffer → packets dropped → EXSTART stuck in loop. Debug: <code>debug ip ospf adj</code> → you'll see "Mismatched MTU" messages. Other EXSTART causes: duplicate Router IDs (rare), corrupted packets.</div></div>
      </div>
    </div>
  

  <div class="card" style="margin-top:14px">
    <div class="card-hdr">OSPF LSA Deep Dive — Type 1 through Type 7 with Real Examples</div>
    <div class="callout callout-info" style="margin-bottom:10px">LSAs are the building blocks of the OSPF LSDB. Every router builds its own view of the network topology by collecting and analyzing LSAs. Understanding exactly which router generates which LSA type, and which area types restrict which LSAs, is a core CCIE topic.</div>
    <div class="grid-2">
      <div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:14px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--blue);font-weight:700">LSA TYPE 1 — Router LSA:</div>
          <div style="color:var(--text)">• Generated by: EVERY router in the area</div>
          <div style="color:var(--text)">• Flooded within: the originating area only</div>
          <div style="color:var(--text)">• Contains: Router ID, all interface states, costs,</div>
          <div style="color:var(--text)">  connected subnets, link types (p2p/broadcast/stub)</div>
          <div style="color:var(--muted)">• Key: R flag = ABR, B flag = ASBR in Type 1</div>
          <div style="color:var(--blue);font-weight:700;margin-top:8px">LSA TYPE 2 — Network LSA:</div>
          <div style="color:var(--text)">• Generated by: DR only (on multi-access segments)</div>
          <div style="color:var(--text)">• Flooded within: the area only</div>
          <div style="color:var(--text)">• Contains: All routers attached to the segment,</div>
          <div style="color:var(--text)">  subnet mask. Represents the multi-access link.</div>
          <div style="color:var(--muted)">• If no DR (P2P link): no Type 2 generated</div>
          <div style="color:var(--cyan);font-weight:700;margin-top:8px">LSA TYPE 3 — Network Summary LSA:</div>
          <div style="color:var(--text)">• Generated by: ABR for routes from one area to another</div>
          <div style="color:var(--text)">• Flooded: between areas (NOT the originating area)</div>
          <div style="color:var(--text)">• Contains: Destination network + cost to reach it</div>
          <div style="color:var(--muted)">• Blocked by: Stub areas (no Type 3 except default)</div>
          <div style="color:var(--cyan);font-weight:700;margin-top:8px">LSA TYPE 4 — ASBR Summary LSA:</div>
          <div style="color:var(--text)">• Generated by: ABR when ASBR is in a different area</div>
          <div style="color:var(--text)">• Purpose: Tells routers in other areas HOW to reach</div>
          <div style="color:var(--text)">  the ASBR (so they can reach external routes)</div>
          <div style="color:var(--muted)">• Not needed if ASBR is in same area as the router</div>
        </div>
      </div>
      <div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:14px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--amber);font-weight:700">LSA TYPE 5 — External LSA:</div>
          <div style="color:var(--text)">• Generated by: ASBR for redistributed external routes</div>
          <div style="color:var(--text)">• Flooded: AS-wide (all OSPF areas)</div>
          <div style="color:var(--text)">• Contains: External network, metric (E1 or E2), fwd addr</div>
          <div style="color:var(--red)">• BLOCKED by: Stub areas, Totally Stub, NSSA</div>
          <div style="color:var(--amber);font-weight:700;margin-top:8px">LSA TYPE 7 — NSSA External LSA:</div>
          <div style="color:var(--text)">• Generated by: ASBR inside an NSSA area</div>
          <div style="color:var(--text)">• Flooded within: NSSA area only</div>
          <div style="color:var(--text)">• At ABR: converted to Type 5 and flooded into backbone</div>
          <div style="color:var(--text)">• Why: allows external routes in area that blocks Type 5</div>
          <div style="color:var(--green);font-weight:700;margin-top:8px">AREA TYPE SUMMARY — What LSAs Are Allowed:</div>
          <div style="color:var(--text)">Backbone/Standard: 1,2,3,4,5  (all types)</div>
          <div style="color:var(--text)">Stub:              1,2,3       (no external: 4,5)</div>
          <div style="color:var(--text)">Totally Stub:      1,2         (no summary 3, no external)</div>
          <div style="color:var(--text)">  → ABR injects ONE Type 3 default route (0.0.0.0/0)</div>
          <div style="color:var(--text)">NSSA:              1,2,3,7     (has LSA7 instead of 5)</div>
          <div style="color:var(--text)">Totally NSSA:      1,2,7       (LSA7 only, default via ABR)</div>
        </div>
        <div class="callout callout-warn" style="margin-top:8px">⚠️ <strong>Verify LSA database:</strong><br><code>show ip ospf database router</code> → Type 1<br><code>show ip ospf database network</code> → Type 2<br><code>show ip ospf database summary</code> → Type 3<br><code>show ip ospf database asbr-summary</code> → Type 4<br><code>show ip ospf database external</code> → Type 5<br><code>show ip ospf database nssa-external</code> → Type 7</div>
      </div>
    </div>
  </div>

  <div class="card" style="margin-top:14px">
    <div class="card-hdr">OSPF Authentication &amp; Virtual Links</div>
    <div class="grid-2">
      <div>
        <div class="card-hdr" style="margin-bottom:8px">OSPF Authentication Types</div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>Type</th><th>Security</th><th>Config</th></tr>
          <tr><td style="color:var(--red)">Type 0 — None</td><td>No auth (default)</td><td>Default</td></tr>
          <tr><td style="color:var(--amber)">Type 1 — Clear text</td><td>Password in plain text — sniffable!</td><td>ip ospf authentication<br>ip ospf authentication-key PASS</td></tr>
          <tr><td style="color:var(--green)">Type 2 — MD5</td><td>HMAC-MD5 hash — recommended</td><td>ip ospf authentication message-digest<br>ip ospf message-digest-key 1 md5 KEY</td></tr>
          <tr><td style="color:var(--blue)">SHA (IOS 15.4+)</td><td>HMAC-SHA256/SHA512 — best</td><td>ospf authentication ipsec spi ... or key-chain</td></tr>
        </table></div>
        <div class="callout callout-warn" style="margin-top:8px">⚠️ Common mistake: Auth configured on the AREA but not the interface — or vice versa. Interface auth overrides area auth. Always verify with <code>show ip ospf interface detail | include auth</code>. Mismatched auth = neighbor stays at Init state.</div>
      </div>
      <div>
        <div class="card-hdr" style="margin-bottom:8px">OSPF Virtual Links — Connecting a Discontiguous Area</div>
        <div class="callout callout-info" style="margin-bottom:8px">OSPF Rule: ALL non-backbone areas MUST connect to Area 0 directly. Virtual links allow an area that doesn't physically touch Area 0 to connect through a transit area. They create a logical link through the transit area.</div>
        <svg viewBox="0 0 370 140" width="100%" style="display:block">
          <rect x="0" y="0" width="370" height="140" rx="6" fill="#0d1117" stroke="rgba(167,139,250,0.1)"/>
          <text x="8" y="13" font-family="IBM Plex Mono,monospace" font-size="8" fill="rgba(167,139,250,0.4)">OSPF VIRTUAL LINK — Area 2 not touching Area 0</text>
          <rect x="5" y="20" width="80" height="45" rx="6" fill="rgba(91,156,246,0.08)" stroke="rgba(91,156,246,0.35)" stroke-width="1.5" stroke-dasharray="5 3"/>
          <text x="45" y="40" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#5b9cf6">Area 0</text>
          <text x="45" y="52" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(91,156,246,0.4)">Backbone</text>
          <rect x="25" y="28" width="40" height="25" rx="10" fill="#1a2236" stroke="#5b9cf6" stroke-width="1"/>
          <text x="45" y="44" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="#5b9cf6">ABR1</text>
          <rect x="130" y="20" width="110" height="45" rx="6" fill="rgba(251,191,36,0.06)" stroke="rgba(251,191,36,0.35)" stroke-width="1.5" stroke-dasharray="5 3"/>
          <text x="185" y="40" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#fbbf24">Area 1 (transit)</text>
          <rect x="135" y="28" width="40" height="25" rx="10" fill="#1a2236" stroke="#fbbf24" stroke-width="1"/>
          <text x="155" y="44" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="#fbbf24">ABR1</text>
          <rect x="195" y="28" width="40" height="25" rx="10" fill="#1a2236" stroke="#fbbf24" stroke-width="1"/>
          <text x="215" y="44" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="#fbbf24">ABR2</text>
          <rect x="280" y="20" width="85" height="45" rx="6" fill="rgba(167,139,250,0.06)" stroke="rgba(167,139,250,0.35)" stroke-width="1.5" stroke-dasharray="5 3"/>
          <text x="322" y="40" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#a78bfa">Area 2</text>
          <text x="322" y="52" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(167,139,250,0.4)">no direct Area0</text>
          <rect x="300" y="28" width="40" height="25" rx="10" fill="#1a2236" stroke="#a78bfa" stroke-width="1"/>
          <text x="320" y="44" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="#a78bfa">ABR2</text>
          <!-- Physical links -->
          <line x1="65" y1="40" x2="135" y2="40" stroke="rgba(251,191,36,0.4)" stroke-width="1.5"/>
          <line x1="155" y1="40" x2="195" y2="40" stroke="rgba(251,191,36,0.4)" stroke-width="1.5"/>
          <line x1="235" y1="40" x2="300" y2="40" stroke="rgba(167,139,250,0.4)" stroke-width="1.5"/>
          <!-- Virtual link -->
          <line x1="155" y1="55" x2="215" y2="55" stroke="rgba(74,222,128,0.7)" stroke-width="2" stroke-dasharray="6 3"/>
          <text x="185" y="70" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(74,222,128,0.6)">Virtual Link (logical Area 0 extension)</text>
          <!-- Config -->
          <rect x="5" y="85" width="360" height="48" rx="4" fill="rgba(0,0,0,0.4)"/>
          <text x="10" y="99" font-family="IBM Plex Mono,monospace" font-size="8.5" fill="rgba(91,156,246,0.6)">On ABR1: router ospf 1 → area 1 virtual-link [ABR2-router-id]</text>
          <text x="10" y="113" font-family="IBM Plex Mono,monospace" font-size="8.5" fill="rgba(167,139,250,0.6)">On ABR2: router ospf 1 → area 1 virtual-link [ABR1-router-id]</text>
          <text x="10" y="127" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(140,150,180,0.4)">Virtual link traverses Area 1 — Area 1 CANNOT be a stub/NSSA!</text>
        </svg>
      </div>
    </div>
  </div>

  <div class="card" style="margin-top:14px">
    <div class="card-hdr">🎯 CCNP Advanced OSPF Interview Q&amp;A</div>
    <div class="qa-list">
      <div class="qa-item">
        <div class="qa-q" onclick="toggleQA(this)">Q: You have an OSPF network where all routers have full adjacency, but some routers are missing certain routes from their routing table. The LSDB appears complete. What do you check?<span class="qa-arrow">▶</span></div>
        <div class="qa-a">Full adjacency + complete LSDB + missing routes = SPF calculation issue or route filtering. Check in order: ①<strong>Distribute-list filtering:</strong> <code>show run | include distribute-list</code> — a distribute-list can filter routes from being installed in the routing table even if they're in the LSDB. ②<strong>Summarization black hole:</strong> An ABR summary is covering a hole — traffic to a subnet covered by the summary but not actually existing hits the Null0 route at the ABR. Check <code>show ip route | include Null</code>. ③<strong>Route type preference:</strong> OSPF intra-area (O) &gt; inter-area (O IA) &gt; external (O E1) &gt; (O E2). If a router has both an intra-area and inter-area path to the same destination, OSPF prefers intra-area even if the inter-area path is lower cost. ④<strong>Passive interface:</strong> If the interface toward the destination is passive (<code>passive-interface Gi0/1</code>), OSPF won't advertise it but it also won't send/receive Hellos → no adjacency. But check if the SUBNET is missing from the LSDB. ⑤<strong>network statement missing:</strong> The specific subnet isn't covered by any <code>network</code> statement under OSPF → not advertised. ⑥<strong>Area mismatch for redistribution:</strong> External routes (Type 5) don't enter stub areas — routers in stub areas only have a default route for external destinations.</div>
      </div>
      <div class="qa-item">
        <div class="qa-q" onclick="toggleQA(this)">Q: What is OSPF graceful restart (NSF/NSR) and why does it matter in production?<span class="qa-arrow">▶</span></div>
        <div class="qa-a">Graceful restart allows a router to survive a control-plane restart (OSPF process crash, RP failover, software upgrade) without losing its forwarding state or causing neighbors to reconverge. Without graceful restart: when the OSPF process restarts, all adjacencies drop → neighbors flood LSAs advertising the links are down → entire domain reconverges → traffic is blackholed or rerouted for 30–60 seconds. <strong>Cisco NSF (Non-Stop Forwarding):</strong> Works with hardware redundancy (dual supervisors). During RP switchover, the standby RP takes over control plane while the forwarding ASICs continue forwarding using cached CEF tables. OSPF neighbors are told the router is restarting via a "grace LSA" and they maintain the neighbor relationship for a grace period (typically 120s). <strong>NSR (Non-Stop Routing):</strong> More advanced — both RPs maintain synchronized OSPF state. Switchover is transparent to neighbors. They don't even know a switchover happened. <strong>Why it matters:</strong> In carrier/enterprise networks, any routing reconvergence causes packet loss. For 100G+ links with thousands of prefixes, even a 5-second reconvergence can drop millions of packets. NSF/NSR enables maintenance windows (software upgrades) without service interruption.</div>
      </div>
    </div>
  </div>

<!-- ═══ CCNP TOPIC 1: BGP Deep Dive ═══ -->
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">🔬 OSPF Fast Convergence — BFD, Fast Hello & SPF Throttling</div>
    <div class="callout callout-info">Standard OSPF convergence: 40+ seconds (dead timer default). Modern carrier networks need sub-second failure detection. These techniques achieve &lt;1 second convergence.</div>
    <div class="grid-2">
      <div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--green);font-weight:700">BFD — BIDIRECTIONAL FORWARDING DETECTION:</div>
          <div style="color:var(--muted2)">Independent lightweight hello protocol — runs in hardware.</div>
          <div style="color:var(--muted2)">Hello every 50–300ms (vs OSPF's 10s). Detects in 3× interval.</div>
          <div style="color:var(--muted2)">When BFD detects failure → immediately notifies OSPF → adj down</div>
          <div style="color:var(--muted2)">→ SPF runs → new route installed. Total: ~300ms!</div>
          <div style="color:var(--cyan)">Config:</div>
          <div style="color:var(--green)">interface GigabitEthernet0/0</div>
          <div style="color:var(--amber)"> bfd interval 100 min_rx 100 multiplier 3</div>
          <div style="color:var(--muted2)">! 100ms interval, 3 misses = 300ms detection</div>
          <div style="color:var(--green)">router ospf 1</div>
          <div style="color:var(--amber)"> bfd all-interfaces</div>
          <div style="color:var(--blue)">show bfd neighbors details   ← BFD session state</div>
          <div style="margin-top:8px;color:var(--amber);font-weight:700">SPF THROTTLE TIMERS:</div>
          <div style="color:var(--green)">router ospf 1</div>
          <div style="color:var(--amber)"> timers throttle spf 50 200 5000</div>
          <div style="color:var(--muted2)">! 50ms initial delay, 200ms min between SPFs (doubles), 5s max</div>
          <div style="color:var(--amber)"> timers throttle lsa 50 200 5000</div>
          <div style="color:var(--amber)"> timers lsa arrival 100   ← min gap between same LSA</div>
        </div>
      </div>
      <div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--blue);font-weight:700">FAST HELLO — SUB-SECOND HELLO TIMERS:</div>
          <div style="color:var(--green)">interface GigabitEthernet0/0</div>
          <div style="color:var(--amber)"> ip ospf dead-interval minimal hello-multiplier 3</div>
          <div style="color:var(--muted2)">! Hello every 333ms, dead = 1 second total</div>
          <div style="color:var(--red)">⚠️ MUST match on both sides of link!</div>
          <div style="margin-top:8px;color:var(--amber);font-weight:700">OSPFv3 (IPv6) CONFIGURATION:</div>
          <div style="color:var(--green)">ipv6 unicast-routing                    ← REQUIRED!</div>
          <div style="color:var(--green)">ipv6 router ospf 1</div>
          <div style="color:var(--amber)"> router-id 1.1.1.1                     ← must set manually if no IPv4</div>
          <div style="color:var(--green)">interface GigabitEthernet0/0</div>
          <div style="color:var(--amber)"> ipv6 address 2001:DB8:1::1/64</div>
          <div style="color:var(--amber)"> ipv6 ospf 1 area 0                    ← per-interface (no network cmd)</div>
          <div style="color:var(--blue)">show ipv6 ospf neighbor               ← adjacency (uses link-local!)</div>
          <div style="color:var(--blue)">show ipv6 ospf database               ← LSDB</div>
          <div style="color:var(--blue)">show ipv6 route ospf                  ← routes</div>
          <div style="color:var(--muted)">Note: OSPFv3 neighbors form via FE80:: link-local addresses!</div>
        </div>
      </div>
    </div>
  </div>


</div>
<div id="ccnp-topic-1" class="topic-panel">
    <div class="topic-hero" style="border-left:4px solid var(--blue)">
      <div class="topic-title">🌍 BGP — Complete Deep Dive</div>
      <div class="topic-sub">BGP Finite State Machine, path selection (13 steps), UPDATE packets &amp; attributes</div>
    </div>
    <div class="grid-2">
      <div>
        <div class="card">
          <div class="card-hdr">BGP Finite State Machine — 6 States</div>
          <div class="tbl-wrap"><table class="tbl">
            <tr><th>State</th><th>What's happening</th><th>Interview Line</th></tr>
            <tr><td style="color:var(--muted2);font-weight:700">1. Idle</td><td>BGP process starts, no TCP yet. Verifies neighbor IP reachable, AS configured.</td><td style="color:var(--amber)">"Idle = initialized, no TCP session"</td></tr>
            <tr><td style="color:var(--red);font-weight:700">2. Connect</td><td>Attempting TCP 3-way handshake to port 179. SYN sent.</td><td style="color:var(--amber)">"Connect = trying to establish TCP"</td></tr>
            <tr><td style="color:var(--red);font-weight:700">3. Active</td><td>TCP failed, retrying. Listens for incoming TCP from peer. NOT "working"!</td><td style="color:var(--amber)">"Active = retrying, NOT working"</td></tr>
            <tr><td style="color:var(--amber);font-weight:700">4. OpenSent</td><td>TCP up. OPEN message sent with: version, AS#, Hold Time, BGP Router ID.</td><td style="color:var(--amber)">"OpenSent = TCP up, params exchanged"</td></tr>
            <tr><td style="color:var(--cyan);font-weight:700">5. OpenConfirm</td><td>Both OPENs received. KEEPALIVE sent/received to confirm agreement.</td><td style="color:var(--amber)">"OpenConfirm = both sides agreed"</td></tr>
            <tr><td style="color:var(--green);font-weight:700">6. Established</td><td>Session FULLY operational. UPDATE messages (routes) exchanged. KEEPALIVEs maintain session.</td><td style="color:var(--green)">"Established = ONLY state with routes!"</td></tr>
          </table></div>
          <div class="card-hdr" style="margin-top:14px;margin-bottom:8px">BGP State → Troubleshooting Map</div>
          <div class="tbl-wrap"><table class="tbl">
            <tr><th>Stuck in State</th><th>Root Cause</th><th>Verify</th></tr>
            <tr><td style="color:var(--muted2)">Idle</td><td>No route to neighbor, BGP shut</td><td>ping neighbor-IP, show bgp neighbors</td></tr>
            <tr><td style="color:var(--red)">Active (long)</td><td>ACL blocking TCP 179, wrong IP, firewall</td><td>telnet neighbor-IP 179</td></tr>
            <tr><td style="color:var(--amber)">OpenSent</td><td>Wrong remote-AS, auth failure, version mismatch</td><td>show running | section bgp</td></tr>
            <tr><td style="color:var(--cyan)">OpenConfirm</td><td>Capability mismatch (address family)</td><td>debug ip bgp events</td></tr>
            <tr><td style="color:var(--green)">Established (no routes)</td><td>Policy filtering, next-hop unreachable</td><td>show ip bgp, show ip bgp summary</td></tr>
          </table></div>
        </div>
      </div>
      <div>
        <div class="card">
          <div class="card-hdr">BGP Best Path Selection — All 13 Steps</div>
          <div style="font-size:11px;color:var(--muted2);margin-bottom:8px">Prerequisite: <strong style="color:var(--text)">Next-Hop must be reachable</strong> via IGP. If not, route is discarded immediately.</div>
          <div class="tbl-wrap"><table class="tbl">
            <tr><th>#</th><th>Attribute</th><th>Prefer</th><th>Scope</th></tr>
            <tr><td style="color:var(--red)">0</td><td>Next-Hop Reachability</td><td>Must be reachable</td><td>Prerequisite</td></tr>
            <tr><td style="color:var(--blue);font-weight:700">1</td><td>Weight (Cisco proprietary)</td><td>Highest</td><td>Local router only</td></tr>
            <tr><td style="color:var(--blue);font-weight:700">2</td><td>Local Preference</td><td>Highest</td><td>Within AS (iBGP)</td></tr>
            <tr><td style="color:var(--cyan);font-weight:700">3</td><td>Locally Originated</td><td>Prefer local</td><td>network/redistribute</td></tr>
            <tr><td style="color:var(--cyan);font-weight:700">4</td><td>Shortest AIGP</td><td>Lowest</td><td>Multi-AS (optional)</td></tr>
            <tr><td style="color:var(--amber);font-weight:700">5</td><td>Shortest AS-PATH</td><td>Shortest</td><td>Loop prevention</td></tr>
            <tr><td style="color:var(--amber);font-weight:700">6</td><td>Origin (i &gt; e &gt; ?)</td><td>IGP &gt; EGP &gt; ?</td><td>How route entered BGP</td></tr>
            <tr><td style="color:var(--amber);font-weight:700">7</td><td>Lowest MED</td><td>Lowest</td><td>Hint to neighbor AS</td></tr>
            <tr><td style="color:var(--green);font-weight:700">8</td><td>eBGP over iBGP</td><td>eBGP</td><td>Peer type</td></tr>
            <tr><td style="color:var(--green);font-weight:700">9</td><td>Lowest IGP metric to Next-Hop</td><td>Lowest</td><td>Internal cost</td></tr>
            <tr><td style="color:var(--muted2)">10</td><td>Oldest eBGP path (stability)</td><td>Oldest</td><td>Cisco stability mech</td></tr>
            <tr><td style="color:var(--muted2)">11</td><td>Lowest Router-ID</td><td>Lowest</td><td>Tiebreaker</td></tr>
            <tr><td style="color:var(--muted2)">12</td><td>Min Cluster-List Length</td><td>Shortest</td><td>Route Reflector only</td></tr>
            <tr><td style="color:var(--muted2)">13</td><td>Lowest Neighbor IP</td><td>Lowest</td><td>Final tiebreaker</td></tr>
          </table></div>
          <div class="callout callout-info" style="margin-top:8px">💡 Memory trick: <strong>W</strong>e <strong>L</strong>ove <strong>O</strong>rangutans <strong>A</strong>nd <strong>M</strong>ore <strong>E</strong>xciting <strong>I</strong>nteresting <strong>R</strong>easoning</div>
        </div>
      </div>
    </div>
    <!-- BGP Transit Config -->
    <div class="card" style="margin-top:14px">
      <div class="card-hdr">🔬 Transit BGP Turn-Up Process</div>
      <div class="callout callout-info" style="margin-bottom:12px">In an interview context, they are testing whether you understand what information and coordination is required between two Autonomous Systems before turning up transit BGP. A solid answer focuses on information exchange, policy agreement, and validation — not just commands.</div>
      <div class="grid-2">
        <div>
          <div class="tbl-wrap"><table class="tbl">
            <tr><th>Phase</th><th>What You Coordinate</th><th>Why It Matters</th></tr>
            <tr><td style="color:var(--blue);font-weight:700">1. BGP Info Exchange</td><td>ASN, peering IPs, eBGP single-hop vs multihop, address families (IPv4/v6)</td><td>Session can't form without matching config on both sides</td></tr>
            <tr><td style="color:var(--cyan);font-weight:700">2. Routing Policy</td><td>What prefixes you advertise, what they send (full table vs default), prefix limits, communities, Local Preference expectations</td><td>Prevents route leaks and asymmetric routing</td></tr>
            <tr><td style="color:var(--amber);font-weight:700">3. Auth &amp; Security</td><td>MD5 password, TTL security (GTSM), max-prefix limits + warning thresholds, RPKI validation</td><td>Interviewers like hearing you think about failure containment</td></tr>
            <tr><td style="color:var(--green);font-weight:700">4. Filtering &amp; Validation</td><td>IRR route objects for your prefixes, which IRR databases they check, RPKI ROA validity enforcement</td><td>Shows operational maturity — real-world transit requirement</td></tr>
            <tr><td style="color:var(--pink);font-weight:700">5. Operational Details</td><td>NOC contacts, maintenance windows, escalation procedures, expected turn-up steps</td><td>BGP is an operational relationship, not just a protocol</td></tr>
            <tr><td style="color:var(--muted2);font-weight:700">6. Testing &amp; Turn-Up</td><td>Bring up in restricted state, verify prefix counts, AS paths, traffic symmetry, monitor for flaps/leaks</td><td>Only after validation is session production-ready</td></tr>
          </table></div>
        </div>
        <div>
          <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10.5px;line-height:1.9">
            <div style="color:var(--cyan)">! Transit BGP Configuration</div>
            <div style="color:var(--green)">router bgp 65001</div>
            <div style="color:var(--green)"> bgp router-id 1.1.1.1</div>
            <div style="color:var(--green)"> neighbor 203.0.113.1 remote-as 65002</div>
            <div style="color:var(--green)"> neighbor 203.0.113.1 description TRANSIT-ISP1</div>
            <div style="color:var(--amber)"> neighbor 203.0.113.1 password SECRETKEY</div>
            <div style="color:var(--amber)"> neighbor 203.0.113.1 ttl-security hops 1</div>
            <div style="color:var(--red)"> neighbor 203.0.113.1 maximum-prefix 500 80</div>
            <div style="color:var(--green)"> neighbor 203.0.113.1 prefix-list MY_PREFIXES out</div>
            <div style="color:var(--green)"> neighbor 203.0.113.1 prefix-list TRANSIT_IN in</div>
            <div style="color:var(--cyan);margin-top:6px">! What to advertise to transit (your prefixes only)</div>
            <div style="color:var(--green)">ip prefix-list MY_PREFIXES seq 10 permit 203.0.113.0/24</div>
            <div style="color:var(--red)">ip prefix-list MY_PREFIXES seq 999 deny 0.0.0.0/0 le 32</div>
            <div style="color:var(--cyan);margin-top:6px">! Verification after turn-up</div>
            <div style="color:var(--blue)">show ip bgp summary</div>
            <div style="color:var(--blue)">show ip bgp neighbors 203.0.113.1 advertised-routes</div>
            <div style="color:var(--blue)">show ip bgp neighbors 203.0.113.1 received-routes</div>
          </div>
          <div class="callout callout-info" style="margin-top:8px">💡 <strong>One-line interview summary:</strong> "When configuring transit BGP, I coordinate ASN and IP details, agree on routing and security policies, validate filtering requirements, exchange operational contacts, and perform controlled testing before full production turn-up."</div>
        </div>
      </div>
    </div>
    <div class="card" style="margin-top:14px">
      <div class="card-hdr">🎯 CCIE Interview Questions — BGP</div>
      <div class="qa-list">
        <div class="qa-item"><div class="qa-q" onclick="toggleQA(this)">Q: BGP is in Active state for a long time. Walk through your troubleshooting steps.<span class="qa-arrow">▶</span></div><div class="qa-a">Active state = TCP connection failing repeatedly. Steps: ①<code>ping neighbor-IP</code> — verify basic reachability. ②<code>telnet neighbor-IP 179</code> — test if TCP 179 reaches the neighbor. ③<code>show tcp brief | include neighbor-IP</code> — check for half-open TCP connections. ④Check ACLs: <code>show access-lists</code> — look for denies on port 179. ⑤Check interface: <code>show ip interface brief</code> — confirm interface used for peering is up. ⑥Verify configuration: <code>show running | section router bgp</code> — correct remote-AS, correct neighbor IP, correct update-source if using loopback. ⑦If using loopback: verify ebgp-multihop is configured (TTL=1 by default drops multihop eBGP). "Active does NOT mean working — it means retrying."</div></div>
        <div class="qa-item"><div class="qa-q" onclick="toggleQA(this)">Q: Explain BGP Weight vs Local Preference vs MED — scope and use case.<span class="qa-arrow">▶</span></div><div class="qa-a"><strong>Weight</strong> (Cisco only, not advertised): Local to the router. Set per neighbor. Used to prefer one neighbor's routes over another on a SINGLE router. Higher=better. <strong>Local Preference:</strong> Shared within the AS via iBGP. Controls which exit point the ENTIRE AS uses to reach external destinations. Higher=better. Set on inbound eBGP routes. <strong>MED:</strong> Sent to eBGP neighbors to influence how traffic ENTERS your AS. The remote AS may or may not honor it. Lower=better. Only compared between paths from the same AS by default (bgp always-compare-med changes this). Analogy: Weight = personal preference (just you), Local Pref = company policy (whole AS), MED = suggestion to your ISP (may be ignored).</div></div>
      </div>
    </div>

  <div class="card" style="margin-top:14px">
    <div class="card-hdr">🔬 BGP Route Reflectors — Solving iBGP Full-Mesh Scaling</div>
    <div class="callout callout-info">iBGP requires full mesh (n×(n-1)/2 sessions). 100 routers = 4,950 sessions! Route Reflectors break iBGP split-horizon so a single RR can redistribute routes to all clients.</div>
    <div class="grid-2">
      <div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--red);font-weight:700">IBGP SPLIT-HORIZON PROBLEM:</div>
          <div style="color:var(--muted2)">Routes from iBGP peer CANNOT be re-advertised to another iBGP peer.</div>
          <div style="color:var(--red)">100 routers = 4,950 TCP BGP sessions = not scalable!</div>
          <div style="margin-top:8px;color:var(--green);font-weight:700">RR SOLUTION (RFC 4456):</div>
          <div style="color:var(--muted2)">From Client    → RR → other Clients + Non-Clients + eBGP</div>
          <div style="color:var(--muted2)">From Non-Client → RR → Clients only</div>
          <div style="color:var(--muted2)">From eBGP      → RR → all iBGP peers</div>
          <div style="margin-top:8px;color:var(--amber);font-weight:700">LOOP PREVENTION ATTRIBUTES:</div>
          <div style="color:var(--muted2)">ORIGINATOR_ID: set to originating router's RID. Ignored if own RID seen.</div>
          <div style="color:var(--muted2)">CLUSTER_LIST: list of RR cluster IDs traversed. Ignored if own cluster seen.</div>
          <div style="margin-top:8px;color:var(--cyan);font-weight:700">CONFIG:</div>
          <div style="color:var(--green)">router bgp 65001</div>
          <div style="color:var(--amber)"> bgp cluster-id 1.1.1.1</div>
          <div style="color:var(--amber)"> neighbor 2.2.2.2 remote-as 65001</div>
          <div style="color:var(--amber)"> neighbor 2.2.2.2 route-reflector-client</div>
          <div style="color:var(--amber)"> neighbor 3.3.3.3 remote-as 65001</div>
          <div style="color:var(--amber)"> neighbor 3.3.3.3 route-reflector-client</div>
          <div style="color:var(--muted)">! Redundant RRs: same cluster-id, clients peer with both</div>
        </div>
      </div>
      <div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--amber);font-weight:700">BGP COMMUNITIES — Standard, Extended & Large:</div>
          <div style="color:var(--red)">NO_EXPORT (0xFFFFFF01): Keep inside AS only</div>
          <div style="color:var(--amber)">NO_ADVERTISE (0xFFFFFF02): Don't advertise anywhere</div>
          <div style="color:var(--green)">BLACKHOLE (65535:666): RTBH null-route for DDoS</div>
          <div style="margin-top:8px;color:var(--red);font-weight:700">! MUST enable or communities are NOT propagated:</div>
          <div style="color:var(--amber)">neighbor 10.0.0.1 send-community both</div>
          <div style="margin-top:8px;color:var(--cyan);font-weight:700">BGP ADD-PATH (RFC 7911):</div>
          <div style="color:var(--muted2)">RR normally sends only the BEST path per prefix.</div>
          <div style="color:var(--muted2)">Add-Path: advertise MULTIPLE paths → clients can failover instantly.</div>
          <div style="color:var(--green)">neighbor 2.2.2.2 additional-paths send receive</div>
          <div style="color:var(--green)">bgp additional-paths select all</div>
          <div style="margin-top:8px;color:var(--blue)">show bgp ipv4 unicast 10.0.0.0</div>
          <div style="color:var(--muted2)">  Originator: 4.4.4.4        ← who originated route</div>
          <div style="color:var(--muted2)">  Cluster list: 1.1.1.1     ← RRs traversed</div>
        </div>
      </div>
    </div>
  </div>

  </div>

  <!-- CCNP TOPIC 2: BGP Troubleshooting -->
  <div id="ccnp-topic-2" class="topic-panel">
    <div class="topic-hero" style="border-left:4px solid var(--red)">
      <div class="topic-title">🔧 BGP Troubleshooting — Structured Methodology</div>
      <div class="topic-sub">Complete structured troubleshooting methodology — BGP and OSPF</div>
    </div>
    <div class="grid-2">
      <div>
        <div class="card">
          <div class="card-hdr">BGP Troubleshooting — Step-by-Step</div>
          <div class="tbl-wrap"><table class="tbl">
            <tr><th>Step</th><th>Command</th><th>What to verify</th></tr>
            <tr><td style="color:var(--blue);font-weight:700">1. Neighbor Status</td><td style="font-family:var(--mono);font-size:10px;color:var(--cyan)">show ip bgp summary</td><td>State = Established. Any other state = issue.</td></tr>
            <tr><td style="color:var(--blue);font-weight:700">2. IP Connectivity</td><td style="font-family:var(--mono);font-size:10px;color:var(--cyan)">ping [neighbor-ip]<br>traceroute [neighbor-ip]</td><td>Basic reachability to peer IP.</td></tr>
            <tr><td style="color:var(--cyan);font-weight:700">3. TCP Session</td><td style="font-family:var(--mono);font-size:10px;color:var(--cyan)">show tcp brief | include [ip]<br>telnet [ip] 179</td><td>TCP port 179 must be reachable.</td></tr>
            <tr><td style="color:var(--cyan);font-weight:700">4. BGP Config</td><td style="font-family:var(--mono);font-size:10px;color:var(--cyan)">show run | section router bgp</td><td>Correct neighbor IP, remote-AS, update-source.</td></tr>
            <tr><td style="color:var(--amber);font-weight:700">5. Interface Status</td><td style="font-family:var(--mono);font-size:10px;color:var(--cyan)">show ip interface brief<br>show interfaces [int]</td><td>Interface up/up. Check error counters.</td></tr>
            <tr><td style="color:var(--amber);font-weight:700">6. BGP Timers</td><td style="font-family:var(--mono);font-size:10px;color:var(--cyan)">show ip bgp neighbors [ip]</td><td>Hold time &amp; keepalive must match both sides.</td></tr>
            <tr><td style="color:var(--amber);font-weight:700">7. Authentication</td><td style="font-family:var(--mono);font-size:10px;color:var(--cyan)">show run | include neighbor.*password</td><td>MD5 keys must match exactly (case-sensitive).</td></tr>
            <tr><td style="color:var(--green);font-weight:700">8. ACL/Firewall</td><td style="font-family:var(--mono);font-size:10px;color:var(--cyan)">show access-lists</td><td>No ACL blocking TCP 179.</td></tr>
            <tr><td style="color:var(--green);font-weight:700">9. Route Policies</td><td style="font-family:var(--mono);font-size:10px;color:var(--cyan)">show ip bgp neighbors [ip] route-map</td><td>No policy blocking session establishment.</td></tr>
            <tr><td style="color:var(--muted2);font-weight:700">10. Debug (last resort)</td><td style="font-family:var(--mono);font-size:10px;color:var(--red)">debug ip bgp [ip] events<br>debug ip tcp transactions</td><td>Use only in production with caution — verbose!</td></tr>
          </table></div>
        </div>
      </div>
      <div>
        <div class="card">
          <div class="card-hdr">🔬 BGP Troubleshooting EVE-NG Topology</div>
          <svg viewBox="0 0 390 200" width="100%" style="display:block">
            <rect x="0" y="0" width="390" height="200" rx="8" fill="#0d1117" stroke="rgba(248,113,113,0.2)" stroke-width="1"/>
            <text x="10" y="14" font-family="IBM Plex Mono,monospace" font-size="8" fill="rgba(248,113,113,0.5)">EVE-NG BGP TROUBLESHOOTING LAB</text>
            <!-- AS 65001 -->
            <rect x="5" y="25" width="165" height="130" rx="8" fill="rgba(91,156,246,0.05)" stroke="rgba(91,156,246,0.3)" stroke-width="1" stroke-dasharray="5 3"/>
            <text x="87" y="42" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" fill="#5b9cf6">AS 65001</text>
            <rect x="20" y="50" width="60" height="40" rx="20" fill="#1a2236" stroke="#5b9cf6" stroke-width="1.5"/>
            <text x="50" y="68" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#5b9cf6">R1</text>
            <text x="50" y="80" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(91,156,246,0.5)">1.1.1.1</text>
            <rect x="110" y="50" width="50" height="40" rx="20" fill="#1a2236" stroke="#5b9cf6" stroke-width="1.5"/>
            <text x="135" y="68" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#5b9cf6">R2</text>
            <text x="135" y="80" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(91,156,246,0.5)">2.2.2.2</text>
            <line x1="80" y1="70" x2="110" y2="70" stroke="rgba(91,156,246,0.4)" stroke-width="1.5"/>
            <text x="95" y="64" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(91,156,246,0.4)">iBGP</text>
            <text x="87" y="108" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(91,156,246,0.6)">Loopbacks: 10.0.0.0/8</text>
            <text x="87" y="120" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(91,156,246,0.6)">OSPF internal routing</text>
            <text x="87" y="132" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(91,156,246,0.6)">update-source Loopback0</text>
            <text x="87" y="144" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(91,156,246,0.6)">ebgp-multihop 2</text>
            <!-- eBGP link with problem indicators -->
            <rect x="175" y="55" width="40" height="30" rx="5" fill="rgba(248,113,113,0.15)" stroke="rgba(248,113,113,0.5)" stroke-width="1.5"/>
            <text x="195" y="67" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#f87171">ACL?</text>
            <text x="195" y="79" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#f87171">TCP 179</text>
            <line x1="160" y1="70" x2="175" y2="70" stroke="#f87171" stroke-width="1.5" stroke-dasharray="4 2"/>
            <line x1="215" y1="70" x2="230" y2="70" stroke="#f87171" stroke-width="1.5" stroke-dasharray="4 2"/>
            <!-- AS 65002 -->
            <rect x="220" y="25" width="165" height="130" rx="8" fill="rgba(74,222,128,0.05)" stroke="rgba(74,222,128,0.3)" stroke-width="1" stroke-dasharray="5 3"/>
            <text x="302" y="42" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" fill="#4ade80">AS 65002</text>
            <rect x="230" y="50" width="55" height="40" rx="20" fill="#1a2236" stroke="#4ade80" stroke-width="1.5"/>
            <text x="257" y="68" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#4ade80">R3</text>
            <text x="257" y="80" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(74,222,128,0.5)">3.3.3.3</text>
            <rect x="305" y="50" width="55" height="40" rx="20" fill="#1a2236" stroke="#4ade80" stroke-width="1.5"/>
            <text x="332" y="68" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#4ade80">R4</text>
            <text x="332" y="80" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(74,222,128,0.5)">4.4.4.4</text>
            <line x1="285" y1="70" x2="305" y2="70" stroke="rgba(74,222,128,0.4)" stroke-width="1.5"/>
            <text x="295" y="64" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(74,222,128,0.4)">iBGP</text>
            <!-- Common failure indicators -->
            <rect x="5" y="165" width="380" height="30" rx="4" fill="rgba(0,0,0,0.3)" stroke="rgba(255,255,255,0.05)"/>
            <text x="10" y="178" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(248,113,113,0.8)">Common failures: ① wrong remote-AS ② ACL blocking 179 ③ MD5 mismatch ④ no route to peer</text>
            <text x="10" y="190" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(140,150,180,0.4)">⑤ missing ebgp-multihop (loopback peer) ⑥ wrong update-source ⑦ prefix-list too strict</text>
          </svg>
          <div class="card-hdr" style="margin-top:14px;margin-bottom:8px">After Session is Established — Routes Missing?</div>
          <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10.5px;line-height:1.9">
            <div style="color:var(--cyan)">! Check what's being advertised/received</div>
            <div style="color:var(--blue)">show ip bgp neighbors [ip] advertised-routes</div>
            <div style="color:var(--blue)">show ip bgp neighbors [ip] received-routes</div>
            <div style="color:var(--blue)">show ip bgp                   ← full BGP table</div>
            <div style="color:var(--blue)">show ip bgp [prefix]          ← specific prefix path</div>
            <div style="color:var(--cyan);margin-top:6px">! Soft reset without tearing down session</div>
            <div style="color:var(--green)">clear ip bgp * soft           ← request route-refresh</div>
            <div style="color:var(--green)">clear ip bgp [neighbor] soft in  ← inbound only</div>
            <div style="color:var(--amber);margin-top:6px">! Hard reset — tears down session</div>
            <div style="color:var(--red)">clear ip bgp * ← use only when necessary!</div>
          </div>
        </div>
      </div>
    </div>
    <div class="card" style="margin-top:14px">
      <div class="card-hdr">🎯 Interview Questions — BGP Troubleshooting</div>
      <div class="qa-list">
        <div class="qa-item"><div class="qa-q" onclick="toggleQA(this)">Q: BGP neighbor is established but routes are not appearing. What do you check?<span class="qa-arrow">▶</span></div><div class="qa-a">Established = session is up, but routes may be filtered or invalid. Checklist: ①<code>show ip bgp summary</code> → PfxRcd column shows 0 = neighbor not sending routes. ②<code>show ip bgp neighbors [ip] received-routes</code> → if empty, peer is not advertising. ③<code>show ip bgp neighbors [ip] advertised-routes</code> → check what WE are sending. ④Check route-maps: <code>show ip bgp neighbors [ip] route-map</code>. ⑤Check next-hop: if iBGP, next-hop may not be reachable — need <code>next-hop-self</code>. ⑥Check <code>network</code> commands — prefix must exist in routing table exactly. ⑦<code>show ip bgp [prefix]</code> → look for "not advertised to any peer" messages with reason. ROUTE-REFRESH: use <code>clear ip bgp * soft</code> after changing policy — avoids hard reset.</div></div>
      </div>
    </div>
  

  <div class="card" style="margin-top:14px">
    <div class="card-hdr">BGP Route Policy Troubleshooting — Routes Present but Not Advertised</div>
    <div class="callout callout-info" style="margin-bottom:10px">The hardest BGP problems are not session failures — they're policy bugs. Session is up, routes are received, but something in your outbound policy is silently dropping them. This section covers the full diagnostic workflow.</div>
    <div class="grid-2">
      <div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:14px;font-family:var(--mono);font-size:10.5px;line-height:1.9">
          <div style="color:var(--amber);font-weight:700">SCENARIO: BGP session up, route 10.0.0.0/8 in</div>
          <div style="color:var(--amber)">your table, but NOT reaching the neighbor.</div>
          <div style="color:var(--cyan);margin-top:8px">Step 1: Check if route is being advertised</div>
          <div style="color:var(--blue)">show ip bgp neighbors [IP] advertised-routes</div>
          <div style="color:var(--muted)">→ If 10.0.0.0/8 not here: policy blocking it</div>
          <div style="color:var(--cyan);margin-top:6px">Step 2: Check what BGP "thinks" about the route</div>
          <div style="color:var(--blue)">show ip bgp 10.0.0.0/8</div>
          <div style="color:var(--muted)">→ Look for: best path marker (*&gt;)</div>
          <div style="color:var(--muted)">→ "not advertised to any peer" message</div>
          <div style="color:var(--muted)">→ Next-hop: 0.0.0.0 = locally originated</div>
          <div style="color:var(--cyan);margin-top:6px">Step 3: Check outbound route-map</div>
          <div style="color:var(--blue)">show ip bgp neighbors [IP] | include route-map</div>
          <div style="color:var(--blue)">show route-map [NAME]</div>
          <div style="color:var(--muted)">→ Is your prefix matching the permit clause?</div>
          <div style="color:var(--cyan);margin-top:6px">Step 4: Check prefix-list if applied</div>
          <div style="color:var(--blue)">show ip prefix-list [NAME]</div>
          <div style="color:var(--muted)">→ Does 10.0.0.0/8 match a permit entry?</div>
          <div style="color:var(--cyan);margin-top:6px">Step 5: Check if iBGP next-hop issue</div>
          <div style="color:var(--blue)">show ip bgp 10.0.0.0/8 | include Next Hop</div>
          <div style="color:var(--muted)">→ iBGP: next-hop not changed unless next-hop-self</div>
          <div style="color:var(--red)">→ If neighbor can't reach next-hop: route unusable!</div>
          <div style="color:var(--green)">Fix: neighbor [IP] next-hop-self</div>
        </div>
      </div>
      <div>
        <div class="card-hdr" style="margin-bottom:8px">BGP Route Not Being Installed — Reasons</div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>Symptom in BGP table</th><th>Meaning</th><th>Fix</th></tr>
          <tr><td style="font-family:var(--mono);font-size:9px;color:var(--muted2)">r 10.0.0.0/8 via 1.2.3.4</td><td>r = RIB failure. Route was rejected by routing table (lower AD route exists)</td><td>Check AD conflict with another protocol for same prefix</td></tr>
          <tr><td style="font-family:var(--mono);font-size:9px;color:var(--amber)">* 10.0.0.0/8 (not &gt;)</td><td>Valid but not best path selected</td><td>Check best path selection — weight, local-pref, AS-path, etc.</td></tr>
          <tr><td style="font-family:var(--mono);font-size:9px;color:var(--red)">10.0.0.0/8 inaccessible</td><td>Next-hop IP not reachable via IGP</td><td>Add next-hop to IGP or use next-hop-self</td></tr>
          <tr><td style="font-family:var(--mono);font-size:9px;color:var(--red)">No entry at all</td><td>Route not received OR filtered on inbound</td><td>Check neighbor received-routes; check inbound filter</td></tr>
          <tr><td style="font-family:var(--mono);font-size:9px;color:var(--cyan)">h 10.0.0.0/8</td><td>h = history. Was valid, now withdrawn</td><td>Peer withdrew it — check peer's routing table</td></tr>
          <tr><td style="font-family:var(--mono);font-size:9px;color:var(--muted2)">d 10.0.0.0/8</td><td>d = damped. Route flapped, currently suppressed</td><td>Route dampening active — wait for half-life or clear</td></tr>
        </table></div>
        <div class="card-hdr" style="margin-top:12px;margin-bottom:8px">BGP Soft Reset vs Hard Reset</div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:10px;font-family:var(--mono);font-size:10px;line-height:1.8">
          <div style="color:var(--cyan)">! Soft reset — does NOT drop the session</div>
          <div style="color:var(--green)">clear ip bgp [ip] soft           ← both directions</div>
          <div style="color:var(--green)">clear ip bgp [ip] soft in        ← inbound only (re-apply in policy)</div>
          <div style="color:var(--green)">clear ip bgp [ip] soft out       ← outbound (re-advertise to peer)</div>
          <div style="color:var(--muted)">Uses ROUTE-REFRESH capability (RFC 2918)</div>
          <div style="color:var(--muted)">Peer must support it (virtually all modern routers do)</div>
          <div style="color:var(--cyan);margin-top:6px">! Hard reset — DROPS the TCP session and all routes</div>
          <div style="color:var(--red)">clear ip bgp [ip]                ← hard reset one peer</div>
          <div style="color:var(--red)">clear ip bgp *                   ← hard reset ALL peers</div>
          <div style="color:var(--amber)">Use hard reset only when soft reset fails or for complete</div>
          <div style="color:var(--amber)">re-negotiation (capability change, auth key change)</div>
        </div>
      </div>
    </div>
  </div>

  <div class="card" style="margin-top:14px">
    <div class="card-hdr">BGP Route Reflector &amp; Confederation — iBGP Scalability</div>
    <div class="callout callout-info" style="margin-bottom:10px">iBGP has a full-mesh requirement: every iBGP router must peer with every other. For 100 routers: 100×99/2 = 4950 sessions. Route Reflectors solve this by allowing one router to re-advertise iBGP routes to other iBGP peers (which is normally not allowed).</div>
    <div class="grid-2">
      <div>
        <svg viewBox="0 0 380 195" width="100%" style="display:block">
          <rect x="0" y="0" width="380" height="195" rx="6" fill="#0d1117" stroke="rgba(56,217,192,0.1)"/>
          <text x="8" y="13" font-family="IBM Plex Mono,monospace" font-size="8" fill="rgba(56,217,192,0.4)">ROUTE REFLECTOR — ELIMINATES FULL MESH REQUIREMENT</text>
          <!-- Without RR -->
          <text x="8" y="28" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(248,113,113,0.5)">WITHOUT RR: 6 routers = 15 sessions</text>
          <circle cx="55" cy="60" r="8" fill="#1a2236" stroke="#f87171" stroke-width="1"/>
          <text x="55" y="63" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="#f87171">R1</text>
          <circle cx="95" cy="45" r="8" fill="#1a2236" stroke="#f87171" stroke-width="1"/>
          <text x="95" y="48" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="#f87171">R2</text>
          <circle cx="130" cy="55" r="8" fill="#1a2236" stroke="#f87171" stroke-width="1"/>
          <text x="130" y="58" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="#f87171">R3</text>
          <circle cx="125" cy="85" r="8" fill="#1a2236" stroke="#f87171" stroke-width="1"/>
          <text x="125" y="88" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="#f87171">R4</text>
          <circle cx="85" cy="95" r="8" fill="#1a2236" stroke="#f87171" stroke-width="1"/>
          <text x="85" y="98" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="#f87171">R5</text>
          <circle cx="50" cy="85" r="8" fill="#1a2236" stroke="#f87171" stroke-width="1"/>
          <text x="50" y="88" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="#f87171">R6</text>
          <!-- Full mesh lines (messy) -->
          <line x1="55" y1="60" x2="95" y2="45" stroke="rgba(248,113,113,0.25)" stroke-width="0.8"/>
          <line x1="55" y1="60" x2="130" y2="55" stroke="rgba(248,113,113,0.25)" stroke-width="0.8"/>
          <line x1="55" y1="60" x2="125" y2="85" stroke="rgba(248,113,113,0.25)" stroke-width="0.8"/>
          <line x1="55" y1="60" x2="85" y2="95" stroke="rgba(248,113,113,0.25)" stroke-width="0.8"/>
          <line x1="55" y1="60" x2="50" y2="85" stroke="rgba(248,113,113,0.25)" stroke-width="0.8"/>
          <line x1="95" y1="45" x2="130" y2="55" stroke="rgba(248,113,113,0.25)" stroke-width="0.8"/>
          <line x1="95" y1="45" x2="125" y2="85" stroke="rgba(248,113,113,0.25)" stroke-width="0.8"/>
          <line x1="95" y1="45" x2="85" y2="95" stroke="rgba(248,113,113,0.25)" stroke-width="0.8"/>
          <line x1="95" y1="45" x2="50" y2="85" stroke="rgba(248,113,113,0.25)" stroke-width="0.8"/>
          <line x1="130" y1="55" x2="125" y2="85" stroke="rgba(248,113,113,0.25)" stroke-width="0.8"/>
          <line x1="130" y1="55" x2="85" y2="95" stroke="rgba(248,113,113,0.25)" stroke-width="0.8"/>
          <line x1="130" y1="55" x2="50" y2="85" stroke="rgba(248,113,113,0.25)" stroke-width="0.8"/>
          <line x1="125" y1="85" x2="85" y2="95" stroke="rgba(248,113,113,0.25)" stroke-width="0.8"/>
          <line x1="125" y1="85" x2="50" y2="85" stroke="rgba(248,113,113,0.25)" stroke-width="0.8"/>
          <line x1="85" y1="95" x2="50" y2="85" stroke="rgba(248,113,113,0.25)" stroke-width="0.8"/>
          <!-- With RR -->
          <text x="200" y="28" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(74,222,128,0.5)">WITH RR: 6 routers = 5 sessions</text>
          <circle cx="280" cy="70" r="13" fill="rgba(74,222,128,0.12)" stroke="#4ade80" stroke-width="2"/>
          <text x="280" y="68" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="#4ade80">RR</text>
          <text x="280" y="78" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6" fill="rgba(74,222,128,0.5)">server</text>
          <circle cx="230" cy="42" r="8" fill="#1a2236" stroke="rgba(74,222,128,0.5)" stroke-width="1"/>
          <text x="230" y="45" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="#4ade80">C1</text>
          <circle cx="335" cy="42" r="8" fill="#1a2236" stroke="rgba(74,222,128,0.5)" stroke-width="1"/>
          <text x="335" y="45" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="#4ade80">C2</text>
          <circle cx="210" cy="80" r="8" fill="#1a2236" stroke="rgba(74,222,128,0.5)" stroke-width="1"/>
          <text x="210" y="83" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="#4ade80">C3</text>
          <circle cx="355" cy="80" r="8" fill="#1a2236" stroke="rgba(74,222,128,0.5)" stroke-width="1"/>
          <text x="355" y="83" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="#4ade80">C4</text>
          <circle cx="280" cy="108" r="8" fill="#1a2236" stroke="rgba(74,222,128,0.5)" stroke-width="1"/>
          <text x="280" y="111" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="6.5" fill="#4ade80">C5</text>
          <line x1="280" y1="57" x2="230" y2="50" stroke="rgba(74,222,128,0.5)" stroke-width="1.2"/>
          <line x1="280" y1="57" x2="335" y2="50" stroke="rgba(74,222,128,0.5)" stroke-width="1.2"/>
          <line x1="267" y1="72" x2="218" y2="80" stroke="rgba(74,222,128,0.5)" stroke-width="1.2"/>
          <line x1="293" y1="72" x2="347" y2="80" stroke="rgba(74,222,128,0.5)" stroke-width="1.2"/>
          <line x1="280" y1="83" x2="280" y2="100" stroke="rgba(74,222,128,0.5)" stroke-width="1.2"/>
          <!-- Config -->
          <rect x="5" y="120" width="370" height="68" rx="4" fill="rgba(0,0,0,0.4)"/>
          <text x="10" y="135" font-family="IBM Plex Mono,monospace" font-size="8.5" fill="rgba(56,217,192,0.6)">RR Server config:  neighbor [client-ip] route-reflector-client</text>
          <text x="10" y="149" font-family="IBM Plex Mono,monospace" font-size="8.5" fill="rgba(74,222,128,0.5)">RR adds: ORIGINATOR_ID (who first sent) + CLUSTER_LIST (loop prevention)</text>
          <text x="10" y="163" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(140,150,180,0.4)">Client does NOT need special config — just normal iBGP peer with RR server</text>
          <text x="10" y="177" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(251,191,36,0.4)">Best practice: 2 RR servers per cluster for redundancy (clients peer with both)</text>
          <text x="10" y="188" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(248,113,113,0.4)">Cluster list length = tiebreaker #12 in BGP best path (shorter = preferred)</text>
        </svg>
      </div>
      <div>
        <div class="card-hdr" style="margin-bottom:8px">Common BGP Misconfigurations &amp; Fixes</div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>Problem</th><th>Symptom</th><th>Root Cause &amp; Fix</th></tr>
          <tr><td style="color:var(--red)">AS-path loop</td><td>Route received but not installed; BGP drops it</td><td>Own AS number appears in AS-path. Normal for loop prevention. If intentional (AS override): <code>neighbor X allowas-in</code></td></tr>
          <tr><td style="color:var(--amber)">Sync issue</td><td>iBGP route not installed (legacy IOS)</td><td>Old synchronization rule: iBGP route must also exist in IGP. Fix: <code>no synchronization</code> (default off now)</td></tr>
          <tr><td style="color:var(--blue)">Missing network statement</td><td>Route not advertised to eBGP peer</td><td><code>network 10.0.0.0 mask 255.0.0.0</code> — prefix must match routing table EXACTLY (including mask)</td></tr>
          <tr><td style="color:var(--cyan)">Max-prefix exceeded</td><td>Session drops with notification</td><td>Peer sent more prefixes than configured limit. Increase: <code>neighbor X maximum-prefix 1000</code></td></tr>
          <tr><td style="color:var(--muted2)">Hold-timer expire</td><td>Session drops every 90s</td><td>Keepalives not reaching peer (congestion, CPU). Default hold 90s, keepalive 30s. Both sides must agree.</td></tr>
        </table></div>
        <div class="card-hdr" style="margin-top:12px;margin-bottom:8px">BGP Attributes Summary — What You Can Manipulate</div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>Attribute</th><th>Type</th><th>To influence</th><th>Higher or lower?</th></tr>
          <tr><td style="color:var(--blue)">Weight</td><td>Cisco local</td><td>Outbound path from this router</td><td>Higher wins</td></tr>
          <tr><td style="color:var(--blue)">Local-Pref</td><td>Well-known discretionary</td><td>Exit point for your entire AS</td><td>Higher wins</td></tr>
          <tr><td style="color:var(--amber)">AS-Path prepend</td><td>Well-known mandatory</td><td>Make path look longer → less preferred</td><td>Shorter wins</td></tr>
          <tr><td style="color:var(--amber)">MED</td><td>Optional non-transitive</td><td>Influence how traffic ENTERS your AS</td><td>Lower wins</td></tr>
          <tr><td style="color:var(--green)">Community</td><td>Optional transitive</td><td>Tag routes for policy — no routing impact alone</td><td>Depends on peer policy</td></tr>
        </table></div>
      </div>
    </div>
  </div>

  <div class="card" style="margin-top:14px">
    <div class="card-hdr">🎯 Advanced BGP Troubleshooting Q&amp;A</div>
    <div class="qa-list">
      <div class="qa-item">
        <div class="qa-q" onclick="toggleQA(this)">Q: You're advertising a /24 to an eBGP peer but they're receiving a /23 instead. You have no summarization configured. Why might this happen?<span class="qa-arrow">▶</span></div>
        <div class="qa-a">Several causes for unexpected summarization: ①<strong>Auto-summary:</strong> On older IOS or if <code>auto-summary</code> is enabled under BGP (legacy feature, disabled by default since IOS 12.3), BGP summarizes classful boundaries. A 10.1.1.0/24 might be summarized to 10.0.0.0/8. Fix: <code>no auto-summary</code>. ②<strong>Aggregate-address command:</strong> Check for <code>aggregate-address</code> statements: <code>show run | include aggregate</code>. If <code>aggregate-address 10.1.0.0 255.255.254.0</code> exists, it generates a /23 summary AND may suppress the specific /24 (depends on <code>summary-only</code> keyword). ③<strong>BGP network statement:</strong> The <code>network</code> statement with the wrong mask — <code>network 10.1.0.0 mask 255.255.254.0</code> directly advertises a /23. ④<strong>Peer is doing summarization:</strong> Your peer's router is summarizing on their end before you see it — their ISP may have <code>aggregate-address</code>. ⑤<strong>Route received from another peer:</strong> Another upstream is advertising the /23 and your peer prefers that over your /24. BGP prefers longer prefix (more specific), so your /24 should win — unless the /23 is also being advertised and something is filtering your /24. Verify with <code>show ip bgp [peer-ip] advertised-routes</code> to confirm exactly what you're sending.</div>
      </div>
    </div>
  </div>

<!-- ═══ CCNP TOPIC 3: MPLS ═══ -->
</div>
<div id="ccnp-topic-3" class="topic-panel">
    <div class="topic-hero" style="border-left:4px solid var(--amber)">
      <div class="topic-title">🏷️ MPLS — Multiprotocol Label Switching</div>
    </div>
    <div class="grid-2">
      <div><div class="card">
        <div class="card-hdr">MPLS Label Stack</div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>Role</th><th>Device</th><th>Action</th></tr>
          <tr><td style="color:var(--blue)">Ingress</td><td>LER</td><td>PUSH label onto IP packet</td></tr>
          <tr><td style="color:var(--amber)">Transit</td><td>LSR</td><td>SWAP incoming label with new label</td></tr>
          <tr><td style="color:var(--green)">Egress</td><td>LER</td><td>POP label, forward as IP</td></tr>
          <tr><td style="color:var(--muted2)">PHP</td><td>Penultimate hop</td><td>POP early to reduce egress work</td></tr>
        </table></div>
        <div class="card-hdr" style="margin-top:12px;margin-bottom:8px">MPLS Label Format (32 bits)</div>
        <svg viewBox="0 0 390 55" width="100%" style="display:block">
          <rect x="5" y="10" width="220" height="35" rx="4" fill="rgba(251,191,36,0.12)" stroke="rgba(251,191,36,0.5)" stroke-width="1.2"/>
          <text x="115" y="28" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9" font-weight="700" fill="#fbbf24">Label Value (20 bits)</text>
          <text x="115" y="40" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(251,191,36,0.6)">Values 0-15 reserved  ·  16+ user-defined</text>
          <rect x="230" y="10" width="40" height="35" rx="4" fill="rgba(56,217,192,0.12)" stroke="rgba(56,217,192,0.4)" stroke-width="1.2"/>
          <text x="250" y="28" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#38d9c0">EXP</text>
          <text x="250" y="40" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(56,217,192,0.5)">3b QoS</text>
          <rect x="275" y="10" width="25" height="35" rx="4" fill="rgba(248,113,113,0.12)" stroke="rgba(248,113,113,0.4)" stroke-width="1.2"/>
          <text x="287" y="28" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#f87171">S</text>
          <text x="287" y="40" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(248,113,113,0.5)">BoS</text>
          <rect x="305" y="10" width="80" height="35" rx="4" fill="rgba(167,139,250,0.1)" stroke="rgba(167,139,250,0.35)" stroke-width="1.2"/>
          <text x="345" y="28" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9" fill="#a78bfa">TTL (8 bits)</text>
          <text x="345" y="40" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(167,139,250,0.5)">decremented at each LSR</text>
        </svg>
      </div></div>
      <div><div class="card">
        <div class="card-hdr">MPLS L3VPN — Terms</div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>Term</th><th>Meaning</th></tr>
          <tr><td style="color:var(--blue)">CE</td><td>Customer Edge — customer router at PE</td></tr>
          <tr><td style="color:var(--cyan)">PE</td><td>Provider Edge — imports routes into VRF, two-label stack</td></tr>
          <tr><td style="color:var(--amber)">P</td><td>Provider core — label swap only, no VRF</td></tr>
          <tr><td style="color:var(--green)">VRF</td><td>Virtual Routing/Forwarding — per-customer routing table</td></tr>
          <tr><td style="color:var(--pink)">RD</td><td>Route Distinguisher — makes VPN prefixes unique in MP-BGP</td></tr>
          <tr><td style="color:var(--muted2)">RT</td><td>Route Target — controls import/export between VRFs</td></tr>
        </table></div>
      </div></div>
    </div>
    <div class="card" style="margin-top:14px">
      <div class="card-hdr">🎯 MPLS Interview Questions</div>
      <div class="qa-list">
        <div class="qa-item"><div class="qa-q" onclick="toggleQA(this)">Q: What is Penultimate Hop Popping and why is it done?<span class="qa-arrow">▶</span></div><div class="qa-a">PHP is where the second-to-last LSR pops the outer MPLS label before forwarding to the egress LER. This saves the egress PE from doing two lookups (MPLS + IP/VPN) — it only needs the IP/VPN lookup. The penultimate router signals PHP by advertising label 3 (implicit null). Without PHP: egress PE receives labeled packet → MPLS lookup → IP lookup → forward (two lookups). With PHP: penultimate LSR pops label → egress PE receives unlabeled IP packet → one lookup → forward. Critical for high-throughput PE routers.</div></div>
      </div>
    </div>
  

  
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">MPLS — Label Distribution Protocol &amp; L3VPN Deep Dive</div>
    <div class="grid-2">
      <div>
        <div class="card-hdr" style="margin-bottom:8px">How MPLS Forwarding Works — Step by Step</div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10.5px;line-height:2">
          <div style="color:var(--amber);font-weight:700">PACKET JOURNEY: CE-A → PE1 → P1 → P2 → PE2 → CE-B</div>
          <div style="color:var(--cyan);margin-top:6px">CE-A sends plain IP packet to PE1:</div>
          <div style="color:var(--text)">  Src: 10.1.1.10  Dst: 10.2.2.10  TTL: 64</div>
          <div style="color:var(--blue);margin-top:4px">PE1 (Ingress LER) — PUSH TWO labels:</div>
          <div style="color:var(--text)">  Outer label: 300 (transport/LDP label to PE2)</div>
          <div style="color:var(--text)">  Inner label: 24  (VPN/service label for VRF)</div>
          <div style="color:var(--text)">  Stack: [300 | 24 | IP Header | Data]</div>
          <div style="color:var(--cyan);margin-top:4px">P1 (Transit LSR) — SWAP outer label:</div>
          <div style="color:var(--text)">  300 → 400  (LDP next-hop label swap)</div>
          <div style="color:var(--text)">  Stack: [400 | 24 | IP Header | Data]</div>
          <div style="color:var(--amber);margin-top:4px">P2 (Penultimate hop) — POP outer label (PHP):</div>
          <div style="color:var(--text)">  Removes transport label 400</div>
          <div style="color:var(--text)">  Stack: [24 | IP Header | Data]</div>
          <div style="color:var(--green);margin-top:4px">PE2 (Egress LER) — POP VPN label, lookup VRF:</div>
          <div style="color:var(--text)">  Inner label 24 → VRF CUSTOMER_A</div>
          <div style="color:var(--text)">  Forward plain IP packet to CE-B</div>
        </div>
      </div>
      <div>
        <div class="card-hdr" style="margin-bottom:8px">LDP — Label Distribution Protocol</div>
        <div class="callout callout-info" style="margin-bottom:8px">LDP automatically distributes labels for all prefixes in the routing table. Two MPLS routers form an LDP session (TCP port 646) and exchange label-to-prefix bindings. Every prefix gets a locally significant label — the LFIB (Label Forwarding Information Base) maps incoming labels to outgoing labels.</div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>LDP Step</th><th>Process</th></tr>
          <tr><td style="color:var(--blue)">Discovery</td><td>Multicast Hello on 224.0.0.2 UDP 646 — finds LDP neighbors on links</td></tr>
          <tr><td style="color:var(--cyan)">Session</td><td>TCP 646 session established, LDP-ID exchanged</td></tr>
          <tr><td style="color:var(--amber)">Label binding</td><td>Each router assigns local label per FIB prefix, advertises to all LDP peers</td></tr>
          <tr><td style="color:var(--green)">LFIB building</td><td>Incoming label + outgoing label + next-hop installed in hardware LFIB</td></tr>
        </table></div>
        <div class="tbl-wrap" style="margin-top:10px"><table class="tbl">
          <tr><th>MPLS Command</th><th>Shows</th></tr>
          <tr><td style="font-family:var(--mono);font-size:9px;color:var(--blue)">show mpls forwarding-table</td><td>LFIB — local label, outgoing label, next-hop, interface</td></tr>
          <tr><td style="font-family:var(--mono);font-size:9px;color:var(--blue)">show mpls ldp neighbor</td><td>LDP peers, session state, local/remote LDP-ID</td></tr>
          <tr><td style="font-family:var(--mono);font-size:9px;color:var(--blue)">show mpls ldp bindings</td><td>Label bindings for all prefixes</td></tr>
          <tr><td style="font-family:var(--mono);font-size:9px;color:var(--blue)">show ip vrf</td><td>All VRFs, associated interfaces, RD</td></tr>
          <tr><td style="font-family:var(--mono);font-size:9px;color:var(--blue)">show ip route vrf CUST_A</td><td>Routing table for specific VRF</td></tr>
          <tr><td style="font-family:var(--mono);font-size:9px;color:var(--blue)">ping vrf CUST_A 10.2.2.10</td><td>Test connectivity within a VRF</td></tr>
        </table></div>
      </div>
    </div>
    <div class="card-hdr" style="margin-top:14px;margin-bottom:8px">MPLS L3VPN — VRF Configuration (PE Router)</div>
    <div class="grid-2">
      <div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10.5px;line-height:1.9">
          <div style="color:var(--cyan)">! Step 1: Create VRF on PE router</div>
          <div style="color:var(--green)">ip vrf CUSTOMER_A</div>
          <div style="color:var(--green)"> rd 65001:100</div>
          <div style="color:var(--green)"> route-target export 65001:100</div>
          <div style="color:var(--green)"> route-target import 65001:100</div>
          <div style="color:var(--cyan);margin-top:6px">! Step 2: Assign CE-facing interface to VRF</div>
          <div style="color:var(--green)">interface GigabitEthernet0/1</div>
          <div style="color:var(--green)"> ip vrf forwarding CUSTOMER_A</div>
          <div style="color:var(--green)"> ip address 10.1.1.1 255.255.255.0</div>
          <div style="color:var(--cyan);margin-top:6px">! Step 3: BGP with MP-BGP VPNv4 address family</div>
          <div style="color:var(--green)">router bgp 65001</div>
          <div style="color:var(--green)"> address-family vpnv4</div>
          <div style="color:var(--green)">  neighbor 2.2.2.2 activate</div>
          <div style="color:var(--green)">  neighbor 2.2.2.2 send-community extended</div>
        </div>
      </div>
      <div>
        <div class="callout callout-info" style="margin-bottom:8px"><strong>RD vs RT — The Key Difference:</strong><br>
        <strong>RD (Route Distinguisher):</strong> Makes routes globally unique in the BGP table. Two customers can both use 10.0.0.0/8 — RD makes them distinct: 65001:100:10.0.0.0/8 vs 65001:200:10.0.0.0/8. It's just a prefix tag — it has no import/export policy meaning.<br><br>
        <strong>RT (Route Target):</strong> Controls WHICH VRFs import which routes. If Customer A's VRF exports with RT 65001:100, any PE VRF with <code>route-target import 65001:100</code> will import those routes. This is how extranet VPNs (shared services) work — a shared services VRF exports with a RT that many customer VRFs import.</div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>Reserved Labels</th><th>Value</th><th>Used For</th></tr>
          <tr><td style="color:var(--red)">Implicit Null</td><td>3</td><td>PHP signal — penultimate router pops outer label</td></tr>
          <tr><td style="color:var(--amber)">Explicit Null</td><td>0</td><td>Keep label stack but with null value (preserve EXP bits for QoS)</td></tr>
          <tr><td style="color:var(--muted2)">Router Alert</td><td>1</td><td>Punt to route processor (RSVP, OAM)</td></tr>
          <tr><td style="color:var(--muted2)">OAM Alert</td><td>14</td><td>MPLS OAM functions</td></tr>
        </table></div>
      </div>
    </div>
  </div>
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">🎯 MPLS Interview Q&amp;A</div>
    <div class="qa-list">
      <div class="qa-item">
        <div class="qa-q" onclick="toggleQA(this)">Q: Two MPLS L3VPN customers both use 10.0.0.0/8 internally. How does the PE router tell their routes apart?<span class="qa-arrow">▶</span></div>
        <div class="qa-a">The Route Distinguisher (RD) makes them globally unique. Customer A's 10.0.0.0/8 becomes VPN prefix 65001:100:10.0.0.0/8 and Customer B's becomes 65001:200:10.0.0.0/8. These are completely separate entries in the MP-BGP VPNv4 table. The PE router stores both, and the Route Target (RT) controls which prefixes get imported into which VRF: when PE2 receives both prefixes via BGP, it looks at the RT extended community. Customer A's VRF has <code>route-target import 65001:100</code> — it imports only the :100 prefixed route. Customer B's VRF imports :200. Both customers' 10.0.0.0/8 routes exist on the same PE router but in completely separate VRF routing tables, with separate forwarding tables and separate CEF tables per VRF. They can never reach each other unless explicitly configured with extranet VPN (cross-importing each other's RTs).</div>
      </div>
    </div>
  </div>
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">🔬 MPLS L3VPN — VRF, Route Distinguisher & Route Target Architecture</div>
    <div class="callout callout-info">MPLS L3VPN is the dominant enterprise WAN service technology. Understanding VRF, RD, and RT is the foundation for all SP networking and mandatory for CCIE Enterprise/SP.</div>
    <div class="grid-2">
      <div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--amber);font-weight:700">VRF — VIRTUAL ROUTING AND FORWARDING:</div>
          <div style="color:var(--muted2)">A separate routing table instance per customer.</div>
          <div style="color:var(--muted2)">Customer A's 10.0.0.0/8 + Customer B's 10.0.0.0/8 coexist!</div>
          <div style="color:var(--cyan);font-weight:700;margin-top:6px">RD vs RT — CRITICAL DISTINCTION:</div>
          <div style="color:var(--green)">RD (Route Distinguisher): makes route GLOBALLY UNIQUE in BGP</div>
          <div style="color:var(--muted2)">CustA 10.0.0.0/8 + RD 65001:100 = "65001:100:10.0.0.0/8"</div>
          <div style="color:var(--muted2)">CustB 10.0.0.0/8 + RD 65001:200 = "65001:200:10.0.0.0/8"</div>
          <div style="color:var(--muted2)">RD has NO policy meaning — purely a unique tag.</div>
          <div style="color:var(--amber)">RT (Route Target): BGP extended community — controls WHERE routes go</div>
          <div style="color:var(--muted2)">Export RT: attached to route when leaving PE into MP-BGP</div>
          <div style="color:var(--muted2)">Import RT: route imported into VRF only if RT matches</div>
          <div style="margin-top:8px;color:var(--cyan);font-weight:700">HUB-AND-SPOKE VPN WITH RTs:</div>
          <div style="color:var(--muted2)">Hub VRF:   export 65001:1000, import 65001:2000</div>
          <div style="color:var(--muted2)">Spoke VRF: export 65001:2000, import 65001:1000</div>
          <div style="color:var(--green)">Result: Spoke→Hub OK. Spoke→Spoke DENIED. Perfect topology!</div>
        </div>
      </div>
      <div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--cyan);font-weight:700">VRF CONFIGURATION ON PE ROUTER:</div>
          <div style="color:var(--green)">vrf definition CUSTOMER-A</div>
          <div style="color:var(--amber)"> rd 65001:100</div>
          <div style="color:var(--amber)"> route-target export 65001:100</div>
          <div style="color:var(--amber)"> route-target import 65001:100</div>
          <div style="color:var(--amber)"> address-family ipv4</div>
          <div style="color:var(--amber)"> exit-address-family</div>
          <div> </div>
          <div style="color:var(--green)">interface GigabitEthernet0/1   ← CE-facing</div>
          <div style="color:var(--amber)"> vrf forwarding CUSTOMER-A</div>
          <div style="color:var(--amber)"> ip address 192.168.1.1 255.255.255.0</div>
          <div> </div>
          <div style="color:var(--green)">router bgp 65001</div>
          <div style="color:var(--amber)"> address-family vpnv4</div>
          <div style="color:var(--amber)">  neighbor 2.2.2.2 activate</div>
          <div style="color:var(--amber)">  neighbor 2.2.2.2 send-community extended</div>
          <div> </div>
          <div style="color:var(--blue)">show bgp vpnv4 unicast all          ← all VPN routes</div>
          <div style="color:var(--blue)">show bgp vpnv4 unicast vrf CUSTOMER-A ← customer routes</div>
          <div style="color:var(--blue)">show ip route vrf CUSTOMER-A        ← VRF routing table</div>
          <div style="color:var(--blue)">show mpls forwarding-table          ← LFIB labels</div>
        </div>
      </div>
    </div>
  </div>


</div>

<!-- ═══ CCNP QoS EXPANDED ═══ -->

<div id="ccnp-topic-4" class="topic-panel">
    <div class="topic-hero" style="border-left:4px solid var(--cyan)">
      <div class="topic-title">📊 QoS — Quality of Service</div>
    </div>
    <div class="grid-2">
      <div><div class="card">
        <div class="card-hdr">DSCP Markings — IP Header Bits</div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>DSCP</th><th>PHB</th><th>Use Case</th><th>Queue</th></tr>
          <tr><td style="color:var(--red);font-weight:700">EF (46)</td><td>Expedited Fwd</td><td>VoIP RTP</td><td>Priority queue (LLQ)</td></tr>
          <tr><td style="color:var(--pink)">CS7 (56)</td><td>Net Control</td><td>Routing protocols</td><td>High priority</td></tr>
          <tr><td style="color:var(--amber)">AF41 (34)</td><td>Assured Fwd 4-1</td><td>Video conferencing</td><td>Bandwidth guarantee</td></tr>
          <tr><td style="color:var(--blue)">AF31 (26)</td><td>Assured Fwd 3-1</td><td>Call signaling</td><td>Bandwidth guarantee</td></tr>
          <tr><td style="color:var(--muted2)">BE (0)</td><td>Best Effort</td><td>Default / internet</td><td>FIFO, lowest priority</td></tr>
        </table></div>
      </div></div>
      <div><div class="card">
        <div class="card-hdr">Policing vs Shaping vs Queuing</div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>Tool</th><th>Excess action</th><th>Adds delay?</th><th>Direction</th></tr>
          <tr><td style="color:var(--red)">Policing</td><td>Drop or re-mark</td><td>❌</td><td>Ingress or Egress</td></tr>
          <tr><td style="color:var(--amber)">Shaping</td><td>Buffer &amp; delay</td><td>✅</td><td>Egress only</td></tr>
          <tr><td style="color:var(--blue)">CBWFQ</td><td>Guaranteed BW per class</td><td>Minimal</td><td>Egress</td></tr>
          <tr><td style="color:var(--green)">LLQ</td><td>Strict priority + CBWFQ</td><td>Minimal</td><td>Egress (VoIP)</td></tr>
        </table></div>
      </div></div>
    </div>
  

  
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">QoS — End-to-End Quality of Service Architecture</div>
    <div class="grid-2">
      <div>
        <div class="card-hdr" style="margin-bottom:8px">QoS Tools — Classification, Marking, Queuing, Policing, Shaping</div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>Tool</th><th>Where in pipeline</th><th>What it does</th></tr>
          <tr><td style="color:var(--blue)">Classification</td><td>Entry point</td><td>Identify traffic type (ACL, NBAR, DSCP, CoS)</td></tr>
          <tr><td style="color:var(--blue)">Marking</td><td>Entry point</td><td>Set DSCP bits in IP header for downstream handling</td></tr>
          <tr><td style="color:var(--amber)">Policing</td><td>Ingress or Egress</td><td>Enforce rate limit — exceed = drop or re-mark</td></tr>
          <tr><td style="color:var(--amber)">Shaping</td><td>Egress only</td><td>Buffer excess — smooth traffic to conform to rate</td></tr>
          <tr><td style="color:var(--green)">Queuing (CBWFQ/LLQ)</td><td>Egress</td><td>Schedule which queue transmits during congestion</td></tr>
          <tr><td style="color:var(--cyan)">Congestion avoidance (WRED)</td><td>Queue</td><td>Drop packets early before queue fills — avoid TCP sync</td></tr>
        </table></div>
        <div class="card-hdr" style="margin-top:12px;margin-bottom:8px">DSCP → PHB Mapping</div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>DSCP Value</th><th>PHB</th><th>Traffic Type</th><th>Drop Behavior</th></tr>
          <tr><td style="color:var(--red);font-weight:700">EF (46)</td><td>Expedited Forwarding</td><td>VoIP RTP media</td><td>Priority queue — never dropped if within rate</td></tr>
          <tr><td style="color:var(--amber)">CS6 (48)</td><td>Network Control</td><td>OSPF, BGP, routing</td><td>High — protect routing protocol traffic</td></tr>
          <tr><td style="color:var(--amber)">CS5 (40)</td><td>—</td><td>Signaling (SIP, H.323)</td><td>Medium-high</td></tr>
          <tr><td style="color:var(--blue)">AF41 (34)</td><td>Assured Fwd 4-1</td><td>Video conferencing</td><td>Low drop probability in class 4</td></tr>
          <tr><td style="color:var(--blue)">AF42 (36)</td><td>Assured Fwd 4-2</td><td>Video streaming</td><td>Medium drop probability</td></tr>
          <tr><td style="color:var(--blue)">AF43 (38)</td><td>Assured Fwd 4-3</td><td>Video burst</td><td>High drop probability</td></tr>
          <tr><td style="color:var(--cyan)">AF31 (26)</td><td>Assured Fwd 3-1</td><td>Call signaling</td><td>Low drop in class 3</td></tr>
          <tr><td style="color:var(--green)">AF21 (18)</td><td>Assured Fwd 2-1</td><td>Business critical data</td><td>Low drop in class 2</td></tr>
          <tr><td style="color:var(--muted2)">CS1 (8)</td><td>Scavenger</td><td>Bulk/P2P</td><td>Drop first during congestion</td></tr>
          <tr><td style="color:var(--muted2)">BE / CS0 (0)</td><td>Best Effort</td><td>Default internet</td><td>FIFO, no guarantee</td></tr>
        </table></div>
      </div>
      <div>
        <div class="card-hdr" style="margin-bottom:8px">MQC — Modular QoS CLI (Cisco Standard)</div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--cyan)">! Step 1: Classify traffic (class-map)</div>
          <div style="color:var(--green)">class-map match-any VOIP_TRAFFIC</div>
          <div style="color:var(--green)"> match dscp ef          ← already marked EF</div>
          <div style="color:var(--green)"> match protocol rtp     ← NBAR RTP detection</div>
          <div style="color:var(--green)">class-map match-any VIDEO</div>
          <div style="color:var(--green)"> match dscp af41 af42</div>
          <div style="color:var(--cyan);margin-top:6px">! Step 2: Define policy (policy-map)</div>
          <div style="color:var(--green)">policy-map WAN_POLICY</div>
          <div style="color:var(--green)"> class VOIP_TRAFFIC</div>
          <div style="color:var(--green)">  priority 512        ← LLQ: 512 kbps strict</div>
          <div style="color:var(--green)"> class VIDEO</div>
          <div style="color:var(--green)">  bandwidth percent 30 ← CBWFQ: 30% guaranteed</div>
          <div style="color:var(--green)">  queue-limit 64      ← max queue depth</div>
          <div style="color:var(--green)"> class class-default</div>
          <div style="color:var(--green)">  fair-queue          ← WFQ for remainder</div>
          <div style="color:var(--cyan);margin-top:6px">! Step 3: Apply (service-policy)</div>
          <div style="color:var(--green)">interface Serial0/0</div>
          <div style="color:var(--green)"> service-policy output WAN_POLICY</div>
          <div style="color:var(--cyan);margin-top:6px">! Verify</div>
          <div style="color:var(--blue)">show policy-map interface Serial0/0</div>
          <div style="color:var(--blue)">show policy-map interface Serial0/0 output class VOIP</div>
        </div>
        <div class="callout callout-warn" style="margin-top:8px">⚠️ <strong>LLQ (Low Latency Queuing):</strong> The <code>priority</code> command creates a strict priority queue — VOIP traffic is ALWAYS dequeued first, regardless of other class demands. Risk: if VoIP exceeds its configured rate, excess is dropped (policed). Too much priority traffic can starve other classes. Always set a bandwidth cap on the priority class.</div>
      </div>
    </div>
    <div class="card-hdr" style="margin-top:14px;margin-bottom:8px">Policing vs Shaping — Deep Comparison</div>
    <div class="tbl-wrap"><table class="tbl">
      <tr><th>Feature</th><th style="color:var(--red)">Policing</th><th style="color:var(--amber)">Shaping</th></tr>
      <tr><td>Excess action</td><td>Drop or re-mark immediately</td><td>Buffer (delay) excess packets in queue</td></tr>
      <tr><td>Adds delay?</td><td>No — drop is instant</td><td>Yes — queuing delay increases</td></tr>
      <tr><td>Direction</td><td>Ingress OR Egress</td><td>Egress ONLY</td></tr>
      <tr><td>Traffic profile</td><td>Hard limit — exceed = action</td><td>Smooth bursty traffic to average rate</td></tr>
      <tr><td>TCP behavior</td><td>Drops cause TCP retransmits → oscillation</td><td>Buffers → TCP window reduces gracefully</td></tr>
      <tr><td>Use case</td><td>ISP rate enforcement, DDoS mitigation</td><td>WAN link rate matching (DSL, Frame Relay CIR)</td></tr>
      <tr><td>Cisco keyword</td><td>police rate / police percent</td><td>shape average / shape peak</td></tr>
    </table></div>
  </div>
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">🎯 QoS Interview Q&amp;A</div>
    <div class="qa-list">
      <div class="qa-item">
        <div class="qa-q" onclick="toggleQA(this)">Q: Your VoIP calls are choppy and experiencing jitter. You have QoS configured. Walk through your troubleshooting process.<span class="qa-arrow">▶</span></div>
        <div class="qa-a">VoIP quality issues: ①<strong>Is traffic being classified correctly?</strong> <code>show policy-map interface [int] output class VOIP</code> — check if the VoIP class has packet hits. If 0 hits, traffic isn't matching the class-map. Verify DSCP markings: <code>show interfaces [int] | include DSCP</code> or use Wireshark to check EF bit. ②<strong>Is priority queue being policed/dropped?</strong> Same <code>show policy-map</code> output — look for "drops" in the priority class. If VoIP exceeds its configured priority rate, excess is dropped. Either increase the priority bandwidth or find what's generating excess VoIP traffic. ③<strong>Check interface for congestion:</strong> <code>show interfaces [int]</code> — check output queue drops (not just errors). High output drops mean the interface is congested even WITH QoS. ④<strong>Path MTU / fragmentation:</strong> Large packets ahead of VoIP packets in the queue cause serialization delay. On slow WAN links, enable LFI (Link Fragmentation and Interleaving) — fragments large packets so VoIP can interleave. ⑤<strong>Jitter buffer at endpoint:</strong> Some jitter is at the phone/codec, not network. Check endpoint statistics. ⑥<strong>DSCP remarking midpath:</strong> Some ISPs zero out DSCP bits. Verify EF markings are preserved end-to-end with Wireshark captures at multiple points.</div>
      </div>
    </div>
  </div>
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">🔬 LLQ, DSCP Marking & MQC Deep Configuration</div>
    <div class="callout callout-info">LLQ (Low Latency Queuing) = CBWFQ + Strict Priority Queue. It's the gold standard for voice/video QoS. The MQC (Modular QoS CLI) framework — class-maps + policy-maps + service-policy — is used for ALL Cisco QoS configuration.</div>
    <div class="grid-2">
      <div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--amber);font-weight:700">COMPLETE LLQ CONFIGURATION:</div>
          <div style="color:var(--cyan)">Step 1: Class-maps (match traffic)</div>
          <div style="color:var(--green)">class-map match-any VOICE</div>
          <div style="color:var(--amber)"> match dscp ef                  ← DSCP 46</div>
          <div style="color:var(--green)">class-map match-any VIDEO</div>
          <div style="color:var(--amber)"> match dscp af41 af42 af43</div>
          <div style="color:var(--green)">class-map match-any CRITICAL</div>
          <div style="color:var(--amber)"> match dscp af31 af32 af33</div>
          <div style="color:var(--cyan)">Step 2: Policy-map (what to do)</div>
          <div style="color:var(--green)">policy-map WAN-EGRESS</div>
          <div style="color:var(--green)"> class VOICE</div>
          <div style="color:var(--amber)">  priority 512           ← LLQ! Strict priority 512kbps</div>
          <div style="color:var(--green)"> class VIDEO</div>
          <div style="color:var(--amber)">  bandwidth percent 30   ← guaranteed 30% during congestion</div>
          <div style="color:var(--green)"> class CRITICAL</div>
          <div style="color:var(--amber)">  bandwidth percent 20</div>
          <div style="color:var(--green)"> class class-default</div>
          <div style="color:var(--amber)">  fair-queue</div>
          <div style="color:var(--cyan)">Step 3: Apply to interface</div>
          <div style="color:var(--amber)">interface Serial0/0</div>
          <div style="color:var(--amber)"> service-policy output WAN-EGRESS</div>
          <div style="color:var(--blue)">show policy-map interface Serial0/0 ← stats + drops</div>
        </div>
      </div>
      <div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--amber);font-weight:700">DSCP MARKING REFERENCE (RFC 4594):</div>
          <div style="color:var(--red)">EF   (101110 = 46): Voice bearer RTP</div>
          <div style="color:var(--red)">CS5  (101000 = 40): Voice signaling SIP/H.323</div>
          <div style="color:var(--amber)">AF41 (100010 = 34): Interactive video (videoconf)</div>
          <div style="color:var(--amber)">AF42 (100100 = 36): Streaming video</div>
          <div style="color:var(--blue)">AF31 (011010 = 26): Business-critical data</div>
          <div style="color:var(--blue)">AF21 (010010 = 18): Transactional data</div>
          <div style="color:var(--green)">AF11 (001010 = 10): Bulk data (FTP/backup)</div>
          <div style="color:var(--muted2)">CS0  (000000 = 0 ): Best effort (default)</div>
          <div style="color:var(--muted)">CS6/CS7 (48/56): Network control (OSPF/BGP) — reserved!</div>
          <div style="margin-top:8px;color:var(--cyan);font-weight:700">POLICING vs SHAPING:</div>
          <div class="tbl-wrap"><table class="tbl" style="font-size:9px">
            <tr><th>Feature</th><th>Policing</th><th>Shaping</th></tr>
            <tr><td>Excess action</td><td style="color:var(--red)">DROP immediately</td><td style="color:var(--amber)">QUEUE (delay)</td></tr>
            <tr><td>Packet loss</td><td style="color:var(--red)">Yes</td><td style="color:var(--green)">No (unless full)</td></tr>
            <tr><td>Direction</td><td>In or Out</td><td>Out only</td></tr>
            <tr><td>Best for</td><td>ISP enforcement, ingress</td><td>WAN egress, CIR matching</td></tr>
          </table></div>
        </div>
      </div>
    </div>
  </div>


</div>

<!-- ═══ CCNP IPSec VPN EXPANDED ═══ -->

<div id="ccnp-topic-5" class="topic-panel">
    <div class="topic-hero" style="border-left:4px solid var(--red)">
      <div class="topic-title">🛡️ IPSec VPN</div>
    </div>
    <div class="grid-2">
      <div><div class="card">
        <div class="card-hdr">Tunnel Mode vs Transport Mode</div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>Mode</th><th>New IP Hdr?</th><th>Protects</th><th>Used for</th></tr>
          <tr><td style="color:var(--cyan)">Tunnel</td><td>✅ Added</td><td>Entire original packet</td><td>Site-to-site VPN</td></tr>
          <tr><td style="color:var(--amber)">Transport</td><td>❌ Original kept</td><td>IP payload only</td><td>Host-to-host</td></tr>
        </table></div>
      </div></div>
      <div><div class="card">
        <div class="card-hdr">IKE Phase 1 &amp; 2</div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>Phase</th><th>Result</th><th>Negotiates</th></tr>
          <tr><td style="color:var(--blue)">IKE Phase 1</td><td>ISAKMP SA (bidir)</td><td>Encryption, Hash, DH group, Auth, Lifetime</td></tr>
          <tr><td style="color:var(--green)">IKE Phase 2</td><td>IPSec SA (unidir×2)</td><td>ESP/AH, encryption, PFS, traffic selectors</td></tr>
        </table></div>
      </div></div>
    </div>
  

  
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">IPSec VPN — IKE Phases, ESP vs AH, Site-to-Site Config</div>
    <div class="grid-2">
      <div>
        <div class="card-hdr" style="margin-bottom:8px">IKE Phase 1 — Building the Management Tunnel</div>
        <div class="callout callout-info" style="margin-bottom:8px">IKE Phase 1 creates a secure, authenticated channel (ISAKMP SA) used to negotiate IPSec parameters. It uses UDP port 500 (or 4500 for NAT traversal). Two modes: Main Mode (6 messages, identity protected) or Aggressive Mode (3 messages, faster but identity exposed).</div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>IKE Phase 1 Parameter</th><th>Options (must match both sides)</th></tr>
          <tr><td style="color:var(--blue)">Encryption</td><td>AES-128, AES-256, 3DES (deprecated), DES (never use)</td></tr>
          <tr><td style="color:var(--cyan)">Hash (Integrity)</td><td>SHA-256, SHA-384, SHA-512, MD5 (deprecated)</td></tr>
          <tr><td style="color:var(--amber)">Authentication</td><td>Pre-shared key (PSK), RSA signature (certificates), ECDSA</td></tr>
          <tr><td style="color:var(--amber)">DH Group</td><td>Group 14 (2048-bit), Group 19/20 (ECDH 256/384-bit). Groups 1,2,5 = insecure</td></tr>
          <tr><td style="color:var(--green)">Lifetime</td><td>Default 86400s (24hrs). SA re-keyed before expiry.</td></tr>
        </table></div>
        <div class="card-hdr" style="margin-top:12px;margin-bottom:8px">IKE Phase 2 — IPSec SA (The Actual Data Tunnel)</div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>Phase 2 Parameter</th><th>Options</th><th>Notes</th></tr>
          <tr><td style="color:var(--blue)">Protocol</td><td>ESP (50) or AH (51)</td><td>Use ESP — AH can't traverse NAT</td></tr>
          <tr><td style="color:var(--cyan)">Encryption</td><td>AES-256-GCM, AES-256-CBC</td><td>GCM provides auth+encrypt in one pass</td></tr>
          <tr><td style="color:var(--amber)">Integrity</td><td>SHA-256 HMAC, SHA-512</td><td>Not needed if using GCM (built-in)</td></tr>
          <tr><td style="color:var(--green)">PFS</td><td>Enabled (any DH group) or Disabled</td><td>Perfect Forward Secrecy — new DH each Phase 2</td></tr>
          <tr><td style="color:var(--muted2)">Lifetime</td><td>3600s (default), or bytes-based</td><td>SA re-keyed before expiry</td></tr>
        </table></div>
      </div>
      <div>
        <div class="card-hdr" style="margin-bottom:8px">ESP vs AH — What's Protected</div>
        <svg viewBox="0 0 370 140" width="100%" style="display:block">
          <rect x="0" y="0" width="370" height="140" rx="6" fill="#0d1117" stroke="rgba(91,156,246,0.1)"/>
          <text x="8" y="14" font-family="IBM Plex Mono,monospace" font-size="8" fill="rgba(91,156,246,0.4)">ESP vs AH COVERAGE (tunnel mode)</text>
          <!-- ESP row -->
          <text x="8" y="32" font-family="IBM Plex Mono,monospace" font-size="8" font-weight="700" fill="#5b9cf6">ESP:</text>
          <rect x="38" y="22" width="55" height="18" rx="2" fill="rgba(140,150,180,0.06)" stroke="rgba(140,150,180,0.2)" stroke-width="1"/>
          <text x="65" y="34" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(140,150,180,0.4)">New IP Hdr</text>
          <rect x="96" y="22" width="40" height="18" rx="2" fill="rgba(91,156,246,0.15)" stroke="rgba(91,156,246,0.4)" stroke-width="1"/>
          <text x="116" y="34" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="#5b9cf6">ESP Hdr</text>
          <rect x="139" y="22" width="55" height="18" rx="2" fill="rgba(74,222,128,0.15)" stroke="rgba(74,222,128,0.4)" stroke-width="1"/>
          <text x="166" y="34" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="#4ade80">Orig IP Hdr</text>
          <rect x="197" y="22" width="80" height="18" rx="2" fill="rgba(74,222,128,0.15)" stroke="rgba(74,222,128,0.4)" stroke-width="1"/>
          <text x="237" y="34" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="#4ade80">Data (encrypted)</text>
          <rect x="280" y="22" width="55" height="18" rx="2" fill="rgba(74,222,128,0.12)" stroke="rgba(74,222,128,0.3)" stroke-width="1"/>
          <text x="307" y="34" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="#4ade80">ESP Trailer</text>
          <rect x="338" y="22" width="27" height="18" rx="2" fill="rgba(91,156,246,0.12)" stroke="rgba(91,156,246,0.3)" stroke-width="1"/>
          <text x="351" y="34" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="#5b9cf6">ICV</text>
          <text x="8" y="52" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(74,222,128,0.5)">← ESP encrypts everything from Orig IP Hdr through ESP Trailer</text>
          <text x="8" y="63" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(91,156,246,0.4)">← ESP authenticates from ESP Hdr through ESP Trailer (ICV)</text>
          <!-- AH row -->
          <text x="8" y="82" font-family="IBM Plex Mono,monospace" font-size="8" font-weight="700" fill="#f87171">AH:</text>
          <rect x="38" y="72" width="55" height="18" rx="2" fill="rgba(248,113,113,0.12)" stroke="rgba(248,113,113,0.3)" stroke-width="1"/>
          <text x="65" y="84" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="#f87171">New IP Hdr</text>
          <rect x="96" y="72" width="35" height="18" rx="2" fill="rgba(248,113,113,0.15)" stroke="rgba(248,113,113,0.4)" stroke-width="1"/>
          <text x="113" y="84" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="#f87171">AH Hdr</text>
          <rect x="134" y="72" width="55" height="18" rx="2" fill="rgba(140,150,180,0.08)" stroke="rgba(140,150,180,0.2)" stroke-width="1"/>
          <text x="161" y="84" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(140,150,180,0.5)">Orig IP Hdr</text>
          <rect x="192" y="72" width="80" height="18" rx="2" fill="rgba(140,150,180,0.08)" stroke="rgba(140,150,180,0.2)" stroke-width="1"/>
          <text x="232" y="84" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(140,150,180,0.5)">Data (NOT encrypted)</text>
          <text x="8" y="104" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(248,113,113,0.5)">← AH authenticates EVERYTHING including new IP header (mutable fields excluded)</text>
          <text x="8" y="116" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(248,113,113,0.4)">← AH provides NO encryption — data is in cleartext!</text>
          <text x="8" y="130" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(248,113,113,0.3)">← AH includes IP header in auth → FAILS with NAT (NAT changes IP → auth breaks)</text>
        </svg>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:10px;font-family:var(--mono);font-size:10px;line-height:1.8;margin-top:8px">
          <div style="color:var(--cyan)">! Site-to-site IPSec troubleshooting</div>
          <div style="color:var(--blue)">show crypto isakmp sa         ← Phase 1 SAs (should be QM_IDLE)</div>
          <div style="color:var(--blue)">show crypto ipsec sa           ← Phase 2 SAs + packet counters</div>
          <div style="color:var(--blue)">show crypto isakmp peers       ← IKE peers</div>
          <div style="color:var(--amber)">debug crypto isakmp            ← Phase 1 negotiation</div>
          <div style="color:var(--amber)">debug crypto ipsec             ← Phase 2 negotiation</div>
          <div style="color:var(--red)">! If Phase 1 fails: check PSK, encryption/hash mismatch</div>
          <div style="color:var(--red)">! If Phase 2 fails: check crypto ACL mismatch (must mirror)</div>
        </div>
      </div>
    </div>
  </div>
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">🎯 IPSec Interview Q&amp;A</div>
    <div class="qa-list">
      <div class="qa-item">
        <div class="qa-q" onclick="toggleQA(this)">Q: IPSec tunnel comes up (Phase 1 QM_IDLE) but no traffic passes. What do you check?<span class="qa-arrow">▶</span></div>
        <div class="qa-a">Phase 1 up but no traffic = Phase 2 not establishing or traffic not matching. ①<code>show crypto ipsec sa</code> — check if Phase 2 SAs exist. If not, Phase 2 failed. ②<strong>Crypto ACL mismatch</strong> (most common): The "interesting traffic" ACL must be a MIRROR on both sides. Site A: permit ip 10.1.0.0/24 10.2.0.0/24. Site B must have: permit ip 10.2.0.0/24 10.1.0.0/24. If they don't match exactly, Phase 2 negotiations fail (proxy ID mismatch). ③<strong>Phase 2 parameter mismatch:</strong> Encryption/hash/PFS settings must match. Check with <code>debug crypto ipsec</code> for "no matching transforms" errors. ④<strong>If Phase 2 SAs exist but packets = 0:</strong> Traffic isn't matching the crypto ACL. Verify routing — the packets must hit the interface where the crypto map is applied. ⑤<strong>NAT conflict:</strong> If NAT is also configured, NAT happens before crypto ACL evaluation on outbound. Traffic gets NATted and no longer matches the crypto ACL (10.1.0.0 becomes public IP). Fix: <code>ip nat inside source list ... route-map ... no-nat</code> to exclude VPN traffic from NAT. ⑥<code>show crypto ipsec sa</code> → look at "pkts encrypt" and "pkts decrypt" counters — if encrypting but not decrypting, the remote end may be dropping or not decrypting properly.</div>
      </div>
    </div>
  </div>
</div>


<div id="ccnp-topic-6" class="topic-panel">
    <div class="topic-hero" style="border-left:4px solid var(--blue)">
      <div class="topic-title">⚙️ SD-WAN &amp; SDN</div>
    </div>
    <div class="card">
      <div class="card-hdr">Traditional vs SDN Architecture</div>
      <div class="tbl-wrap"><table class="tbl">
        <tr><th>Aspect</th><th>Traditional</th><th>SDN</th></tr>
        <tr><td>Control Plane</td><td>Distributed (each device)</td><td>Centralized (controller)</td></tr>
        <tr><td>Config</td><td>Per-device CLI</td><td>Centralized API/GUI</td></tr>
        <tr><td>Protocol</td><td>OSPF, BGP, EIGRP</td><td>OpenFlow, NETCONF/YANG</td></tr>
      </table></div>
    </div>
    <div class="card" style="margin-top:14px">
      <div class="card-hdr">Cisco SD-WAN Components</div>
      <div class="tbl-wrap"><table class="tbl">
        <tr><th>Component</th><th>Role</th></tr>
        <tr><td style="color:var(--blue)">vManage</td><td>Management plane — GUI, policy, monitoring</td></tr>
        <tr><td style="color:var(--cyan)">vSmart</td><td>Control plane — distributes OMP routes to vEdges</td></tr>
        <tr><td style="color:var(--amber)">vBond</td><td>Orchestrator — initial auth, NAT traversal</td></tr>
        <tr><td style="color:var(--green)">vEdge</td><td>Data plane — forwards traffic, enforces policy</td></tr>
      </table></div>
    </div>
  

  <!-- ═══ SD-WAN DEEP EXPANSION ═══ -->
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">Cisco SD-WAN (Viptela) — Architecture Deep Dive</div>
    <div class="callout callout-info" style="margin-bottom:10px">Cisco SD-WAN separates the control plane (vSmart), management plane (vManage), and orchestration (vBond) from the data plane (vEdge/cEdge). This allows centralized policy with distributed forwarding — the core SDN principle applied to WAN.</div>
    <div class="grid-2">
      <div>
        <svg viewBox="0 0 380 210" width="100%" style="display:block">
          <rect x="0" y="0" width="380" height="210" rx="8" fill="#0d1117" stroke="rgba(91,156,246,0.15)"/>
          <text x="8" y="14" font-family="IBM Plex Mono,monospace" font-size="8" fill="rgba(91,156,246,0.4)">CISCO SD-WAN ARCHITECTURE</text>
          <!-- Management Plane -->
          <rect x="130" y="18" width="120" height="40" rx="6" fill="rgba(74,222,128,0.1)" stroke="rgba(74,222,128,0.4)" stroke-width="1.5"/>
          <text x="190" y="33" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8.5" font-weight="700" fill="#4ade80">vManage</text>
          <text x="190" y="45" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(74,222,128,0.5)">GUI + REST API + policies</text>
          <!-- Control Plane -->
          <rect x="30" y="90" width="120" height="40" rx="6" fill="rgba(56,217,192,0.1)" stroke="rgba(56,217,192,0.4)" stroke-width="1.5"/>
          <text x="90" y="105" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8.5" font-weight="700" fill="#38d9c0">vSmart</text>
          <text x="90" y="118" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(56,217,192,0.5)">OMP routes + policy dist.</text>
          <!-- Orchestration -->
          <rect x="230" y="90" width="120" height="40" rx="6" fill="rgba(251,191,36,0.1)" stroke="rgba(251,191,36,0.4)" stroke-width="1.5"/>
          <text x="290" y="105" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8.5" font-weight="700" fill="#fbbf24">vBond</text>
          <text x="290" y="118" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(251,191,36,0.5)">Auth + NAT traversal</text>
          <!-- Data Plane -->
          <rect x="80" y="163" width="95" height="38" rx="5" fill="rgba(167,139,250,0.1)" stroke="rgba(167,139,250,0.4)" stroke-width="1.5"/>
          <text x="127" y="178" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" font-weight="700" fill="#a78bfa">vEdge 1</text>
          <text x="127" y="190" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(167,139,250,0.5)">Branch A</text>
          <rect x="205" y="163" width="95" height="38" rx="5" fill="rgba(167,139,250,0.1)" stroke="rgba(167,139,250,0.4)" stroke-width="1.5"/>
          <text x="252" y="178" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" font-weight="700" fill="#a78bfa">vEdge 2</text>
          <text x="252" y="190" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(167,139,250,0.5)">Branch B</text>
          <!-- Lines: mgmt to control/orch -->
          <line x1="170" y1="58" x2="110" y2="90" stroke="rgba(74,222,128,0.3)" stroke-width="1" stroke-dasharray="4 2"/>
          <line x1="210" y1="58" x2="270" y2="90" stroke="rgba(74,222,128,0.3)" stroke-width="1" stroke-dasharray="4 2"/>
          <line x1="150" y1="58" x2="90" y2="90" stroke="rgba(74,222,128,0.25)" stroke-width="0.8"/>
          <!-- vSmart to vEdge (OMP) -->
          <line x1="90" y1="130" x2="127" y2="163" stroke="rgba(56,217,192,0.5)" stroke-width="1.5"/>
          <line x1="110" y1="130" x2="252" y2="163" stroke="rgba(56,217,192,0.5)" stroke-width="1.5"/>
          <text x="140" y="150" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(56,217,192,0.5)">OMP (DTLS)</text>
          <!-- vEdge IPSec tunnel -->
          <line x1="175" y1="182" x2="205" y2="182" stroke="rgba(248,113,113,0.6)" stroke-width="2" stroke-dasharray="5 2"/>
          <text x="190" y="196" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(248,113,113,0.5)">IPSec Data Plane</text>
          <!-- Labels -->
          <text x="8" y="168" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(91,156,246,0.5)">NETCONF/HTTPS → vManage</text>
          <text x="8" y="180" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(56,217,192,0.4)">OMP = Overlay Mgmt Protocol (DTLS/TLS)</text>
          <text x="8" y="192" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(251,191,36,0.4)">vBond = first contact for new vEdges</text>
          <text x="8" y="204" font-family="IBM Plex Mono,monospace" font-size="7" fill="rgba(167,139,250,0.4)">Data plane: IPSec/GRE tunnels directly between vEdges</text>
        </svg>
      </div>
      <div>
        <div class="card-hdr" style="margin-bottom:8px">SD-WAN Components — Deep Dive</div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>Component</th><th>Plane</th><th>What It Does in Detail</th></tr>
          <tr><td style="color:var(--green)">vManage</td><td>Management</td><td>Single-pane-of-glass GUI. Pushes configs via NETCONF/RESTCONF. Stores templates (device + feature templates). Generates certificates. Real-time monitoring, alerts, dashboards. REST API for automation.</td></tr>
          <tr><td style="color:var(--cyan)">vSmart</td><td>Control</td><td>Runs OMP (Overlay Management Protocol) — SD-WAN's BGP equivalent. Distributes routes, policy, and security info to all vEdges. Centralized route reflector for the overlay. Two vSmarts for HA.</td></tr>
          <tr><td style="color:var(--amber)">vBond</td><td>Orchestration</td><td>First point of contact for newly deployed vEdges. Authenticates devices using certificates. Facilitates NAT traversal so vEdges behind NAT can reach vSmart. Acts as STUN server for NAT detection.</td></tr>
          <tr><td style="color:var(--blue)">vEdge/cEdge</td><td>Data</td><td>Physical or virtual router at branch/DC/cloud. Builds IPSec tunnels to other vEdges. Implements QoS, application-aware routing, policy enforcement. cEdge = Cisco IOS-XE router running SD-WAN software.</td></tr>
        </table></div>
        <div class="card-hdr" style="margin-top:12px;margin-bottom:8px">OMP — Overlay Management Protocol</div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:10px;font-family:var(--mono);font-size:10.5px;line-height:1.9">
          <div style="color:var(--cyan)">OMP carries three types of routes:</div>
          <div style="color:var(--green)">OMP routes:  vEdge LAN-side prefixes (like BGP NLRI)</div>
          <div style="color:var(--green)">TLOCs:       Transport Locators — public IP + color + encap</div>
          <div style="color:var(--green)">Service routes: VPN/service chaining info</div>
          <div style="color:var(--cyan);margin-top:6px">TLOC = the physical WAN interface identifier:</div>
          <div style="color:var(--text)">  System-IP: 1.1.1.1</div>
          <div style="color:var(--text)">  Color: mpls (or biz-internet, lte, public-internet)</div>
          <div style="color:var(--text)">  Encapsulation: IPSec or GRE</div>
          <div style="color:var(--muted)">vEdge uses TLOC to build direct IPSec tunnels</div>
          <div style="color:var(--muted)">to other vEdges — vSmart is NOT in data path</div>
        </div>
      </div>
    </div>
  </div>

  <div class="card" style="margin-top:14px">
    <div class="card-hdr">Application-Aware Routing &amp; Policies — SD-WAN's Key Feature</div>
    <div class="grid-2">
      <div>
        <div class="callout callout-info" style="margin-bottom:8px">Traditional WAN: all traffic uses the same link regardless of type. SD-WAN application-aware routing measures link quality (loss, latency, jitter) in real-time and steers each application to the best available transport.</div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>App / Traffic Type</th><th>Preferred Transport</th><th>Metric Threshold</th></tr>
          <tr><td style="color:var(--red)">VoIP (RTP)</td><td>MPLS (low latency)</td><td>Jitter &lt;30ms, Loss &lt;1%</td></tr>
          <tr><td style="color:var(--amber)">Video conf (Webex)</td><td>MPLS or broadband</td><td>Latency &lt;150ms</td></tr>
          <tr><td style="color:var(--blue)">SaaS (Microsoft 365)</td><td>Direct Internet (DIA)</td><td>Optimal path to Microsoft cloud</td></tr>
          <tr><td style="color:var(--green)">Backup/bulk transfer</td><td>LTE / cheaper link</td><td>No real-time requirement</td></tr>
          <tr><td style="color:var(--muted2)">Guest WiFi</td><td>Internet only, isolated</td><td>Segmented from corp</td></tr>
        </table></div>
      </div>
      <div>
        <div class="card-hdr" style="margin-bottom:8px">SD-WAN vs Traditional WAN vs MPLS</div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>Feature</th><th>MPLS</th><th>SD-WAN</th></tr>
          <tr><td>Transport</td><td>Private MPLS circuits</td><td>Any: MPLS + broadband + LTE + cloud</td></tr>
          <tr><td>Config</td><td>Per-device CLI, manual</td><td>Centralized templates, zero-touch</td></tr>
          <tr><td>Visibility</td><td>Limited, per-device</td><td>Application-level, real-time</td></tr>
          <tr><td>Failover</td><td>Minutes (BGP reconverge)</td><td>Seconds (SLA-based steering)</td></tr>
          <tr><td>Cost</td><td>High (private circuits)</td><td>Lower (commodity internet)</td></tr>
          <tr><td>Security</td><td>Layer 2/3 isolation</td><td>IPSec everywhere + segmentation policies</td></tr>
          <tr><td>Cloud access</td><td>Via datacenter backhauling</td><td>Direct Internet Access per branch</td></tr>
        </table></div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:10px;font-family:var(--mono);font-size:10px;line-height:1.8;margin-top:8px">
          <div style="color:var(--cyan)">! SD-WAN troubleshooting commands (vEdge)</div>
          <div style="color:var(--blue)">show sdwan omp peers              ← OMP sessions to vSmart</div>
          <div style="color:var(--blue)">show sdwan omp routes             ← overlay routes from vSmart</div>
          <div style="color:var(--blue)">show sdwan bfd sessions           ← IPSec tunnel health (BFD)</div>
          <div style="color:var(--blue)">show sdwan app-route statistics   ← SLA metrics per TLOC</div>
          <div style="color:var(--amber)">show sdwan policy access-list-log ← policy hit counters</div>
          <div style="color:var(--blue)">show sdwan control connections    ← vSmart/vManage/vBond status</div>
        </div>
      </div>
    </div>
  </div>

  <div class="card" style="margin-top:14px">
    <div class="card-hdr">SDN — Software Defined Networking Fundamentals</div>
    <div class="grid-2">
      <div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>Plane</th><th>Traditional</th><th>SDN</th></tr>
          <tr><td style="color:var(--blue)">Control Plane</td><td>Distributed — OSPF/BGP runs on every device</td><td>Centralized SDN Controller (ONOS, OpenDaylight, Cisco APIC)</td></tr>
          <tr><td style="color:var(--amber)">Data Plane</td><td>Hardware ASIC forwarding (CEF, LFIB)</td><td>Programmable via OpenFlow or P4 instructions from controller</td></tr>
          <tr><td style="color:var(--green)">Management Plane</td><td>Per-device CLI, SNMP, syslog</td><td>Centralized REST API, NETCONF/YANG, streaming telemetry</td></tr>
        </table></div>
        <div class="callout callout-info" style="margin-top:8px"><strong>OpenFlow:</strong> Protocol between SDN controller and switch. Controller pushes flow entries (match-action rules) to switch hardware. Switch forwards packets based on those rules — no local routing decision. Used in data center fabrics, Google B4 WAN.</div>
      </div>
      <div>
        <div class="card-hdr" style="margin-bottom:8px">NETCONF / YANG — Modern Network Automation</div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>Technology</th><th>Purpose</th><th>vs. Old Way</th></tr>
          <tr><td style="color:var(--blue)">NETCONF</td><td>Protocol for device config/state (RFC 6241). Uses SSH transport, XML encoding</td><td>Replaces CLI/SNMP for config. Transactional — commit or rollback.</td></tr>
          <tr><td style="color:var(--cyan)">YANG</td><td>Data modeling language — defines structure of config data</td><td>Like a schema for network config. "What fields can a BGP neighbor have?"</td></tr>
          <tr><td style="color:var(--amber)">RESTCONF</td><td>HTTP/JSON version of NETCONF (RFC 8040)</td><td>Same as NETCONF but REST API — easier for developers</td></tr>
          <tr><td style="color:var(--green)">gNMI/gRPC</td><td>Google's high-speed streaming telemetry + config</td><td>Replaces SNMP polling — push-based real-time stats</td></tr>
          <tr><td style="color:var(--muted2)">Ansible/Python</td><td>Automation layer using above protocols</td><td>Replace manual CLI — deploy configs to 1000 devices in seconds</td></tr>
        </table></div>
      </div>
    </div>
  </div>

  <div class="card" style="margin-top:14px">
    <div class="card-hdr">🎯 SD-WAN &amp; SDN Interview Q&amp;A</div>
    <div class="qa-list">
      <div class="qa-item">
        <div class="qa-q" onclick="toggleQA(this)">Q: A branch vEdge router can't connect to the internet even though its SD-WAN control connections to vBond and vSmart are up. What do you check?<span class="qa-arrow">▶</span></div>
        <div class="qa-a">Control connections up but no internet = data plane problem, not control plane. ①<code>show sdwan bfd sessions</code> — BFD (Bidirectional Forwarding Detection) monitors the IPSec tunnels to all remote vEdges. If BFD sessions are down, tunnel is down. Check for: link flapping, high packet loss, firewall blocking UDP 12346 (DTLS) or 4500 (IKE/IPSec NAT-T). ②<code>show sdwan app-route statistics</code> — shows measured latency/loss/jitter per transport. If SLA thresholds are exceeded, traffic is steered away from that transport. If ALL transports are bad, traffic may have nowhere to go. ③<strong>Data policy:</strong> Check if a centralized data policy is blocking traffic. <code>show sdwan policy access-list-log</code> for drops. ④<strong>Service VPN routing:</strong> The vEdge has separate VPNs (VPN 0 = transport/management, VPN 1+ = service/user traffic). Check if a default route exists in the service VPN: <code>show ip route vrf 1</code>. If no default route, user traffic has nowhere to go. ⑤<strong>DIA (Direct Internet Access):</strong> If this branch uses DIA, the internet-facing interface must have the right route. NAT must be configured for the DIA interface: check <code>show sdwan interface</code> for NAT status. ⑥<strong>DNS:</strong> Even if routing works, if DNS is broken, users see "no internet" — test with <code>ping 8.8.8.8</code> vs <code>ping google.com</code> to distinguish DNS from routing failure.</div>
      </div>
      <div class="qa-item">
        <div class="qa-q" onclick="toggleQA(this)">Q: What is the difference between NETCONF, RESTCONF, gNMI, and traditional SNMP? When would you use each?<span class="qa-arrow">▶</span></div>
        <div class="qa-a"><strong>SNMP (traditional):</strong> Polling-based — NMS sends GET requests, device responds. SNMP traps for alerts. Limited to pre-defined MIB variables. Unreliable (UDP), difficult to program against, limited granularity. Use only for legacy monitoring where modern alternatives aren't available. <strong>NETCONF (RFC 6241):</strong> Configuration management protocol over SSH with XML data. Supports YANG data models, transactional commits (all-or-nothing), rollback on error, candidate configuration datastores. Use for programmatic device configuration — Ansible playbooks, Python scripts, CI/CD pipelines. <strong>RESTCONF (RFC 8040):</strong> HTTP/JSON-based NETCONF — same data models (YANG) but accessible via standard REST API calls (GET/POST/PUT/DELETE). Use when you prefer JSON over XML or are integrating with web-based automation tools. <strong>gNMI/gRPC:</strong> Google's modern approach — uses Protocol Buffers (binary, faster than XML/JSON), supports streaming telemetry (subscribe and get pushed real-time stats vs poll every 5 minutes). Use for high-frequency monitoring (per-second interface counters, BGP route change events) where SNMP polling latency is unacceptable. Cisco, Juniper, Arista all support gNMI. At Akamai scale: gNMI streaming telemetry to Kafka → real-time dashboards without polling.</div>
      </div>
    </div>
  </div>

</div>
<div id="ccnp-topic-7" class="topic-panel">
    <div class="topic-hero" style="border-left:4px solid var(--amber)">
      <div class="topic-title">🔬 Network Troubleshooting Methodology</div>
    </div>
    <div class="card">
      <div class="card-hdr">Essential Cisco Show Commands</div>
      <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:11px;line-height:1.9">
        <div style="color:var(--cyan)">show ip interface brief</div><div style="color:var(--muted);margin-bottom:4px"> → Interface status + IP — FIRST command always</div>
        <div style="color:var(--cyan)">show ip route [prefix]</div><div style="color:var(--muted);margin-bottom:4px"> → Routing table — verify routing decisions</div>
        <div style="color:var(--cyan)">show ip ospf neighbor</div><div style="color:var(--muted);margin-bottom:4px"> → Neighbor state — FULL = working</div>
        <div style="color:var(--cyan)">show ip bgp summary</div><div style="color:var(--muted);margin-bottom:4px"> → BGP peers state + prefix counts</div>
        <div style="color:var(--cyan)">show interfaces [name]</div><div style="color:var(--muted);margin-bottom:4px"> → Input/output errors, CRC, resets, duplex</div>
        <div style="color:var(--cyan)">show ip arp</div><div style="color:var(--muted);margin-bottom:4px"> → ARP table — verify L2 reachability</div>
        <div style="color:var(--cyan)">show mac address-table</div><div style="color:var(--muted);margin-bottom:4px"> → Switch MAC table — L2 forwarding</div>
        <div style="color:var(--cyan)">show processes cpu sorted</div><div style="color:var(--muted)"> → High CPU → debug still on? CEF disabled?</div>
      </div>
    </div>
    <div class="card" style="margin-top:14px">
      <div class="card-hdr">Common Failures Quick Reference</div>
      <div class="tbl-wrap"><table class="tbl">
        <tr><th>Symptom</th><th>Likely Cause</th><th>First Check</th></tr>
        <tr><td>OSPF stuck Init</td><td>Hello not received back (firewall blocking 224.0.0.5)</td><td>show ip ospf interface</td></tr>
        <tr><td>OSPF stuck ExStart</td><td>MTU mismatch</td><td>show interfaces — compare MTU</td></tr>
        <tr><td>BGP neighbor Active</td><td>ACL blocking TCP 179</td><td>telnet neighbor-IP 179</td></tr>
        <tr><td>Route missing from table</td><td>AD conflict / distribute-list filter</td><td>show ip route — check code</td></tr>
        <tr><td>Intermittent packet loss</td><td>Duplex mismatch — half duplex collisions</td><td>show interfaces — check runts/collisions</td></tr>
        <tr><td>VLAN not working</td><td>Not in trunk allowed list</td><td>show interfaces trunk</td></tr>
        <tr><td>High CPU on router</td><td>CEF off / debug left on</td><td>show processes cpu sorted</td></tr>
      </table></div>
    </div>
  </div>

</div><!-- /page-ccnp -->
`;

  /* ─── CCIE ─────────────────────────────────────────────────────── */
  const ccieHTML = `
<!-- ══════ PAGE: CCIE ══════ -->
<div class="page fade-up" id="page-ccie">
  <div class="page-header" style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:10px">
    <div>
      <div class="page-title">🏆 CCIE Course</div>
      <div class="page-desc">Cisco Certified Internetwork Expert — Expert-level routing, switching, automation &amp; service provider technologies</div>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px">
      <span style="font-family:var(--mono);font-size:10px;padding:5px 12px;border-radius:20px;background:rgba(244,114,182,0.12);border:1px solid rgba(244,114,182,0.3);color:var(--pink)">10 Modules</span>
      <span style="font-family:var(--mono);font-size:10px;padding:5px 12px;border-radius:20px;background:rgba(248,113,113,0.1);border:1px solid rgba(248,113,113,0.3);color:var(--red)">CCIE Level</span>
    </div>
  </div>
  <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:18px;padding:4px;background:var(--bg2);border-radius:12px;border:1px solid var(--border)">
    <button class="course-tab active" id="ccie-tab-0" onclick="showTopic('ccie',0)">⚡ EIGRP &amp; DUAL</button>
    <button class="course-tab" id="ccie-tab-1" onclick="showTopic('ccie',1)">🌍 BGP Path Selection</button>
    <button class="course-tab" id="ccie-tab-2" onclick="showTopic('ccie',2)">🌐 Multicast</button>
    <button class="course-tab" id="ccie-tab-3" onclick="showTopic('ccie',3)">🔀 Route Redistribution</button>
    <button class="course-tab" id="ccie-tab-4" onclick="showTopic('ccie',4)">🏷️ Segment Routing</button>
    <button class="course-tab" id="ccie-tab-5" onclick="showTopic('ccie',5)">🏢 EVPN &amp; VXLAN</button>
    <button class="course-tab" id="ccie-tab-6" onclick="showTopic('ccie',6)">🤖 Network Automation</button>
    <button class="course-tab" id="ccie-tab-7" onclick="showTopic('ccie',7)">📡 IS-IS</button>
    <button class="course-tab" id="ccie-tab-8" onclick="showTopic('ccie',8)">🔧 Advanced BGP</button>
    <button class="course-tab" id="ccie-tab-9" onclick="showTopic('ccie',9)">🚦 MPLS Traffic Eng</button>
  </div>

<!-- ═══ CCIE TAB 0: EIGRP & DUAL ═══ -->
<div id="ccie-topic-0" class="topic-panel active-panel">
  <div class="topic-hero" style="border-left:4px solid var(--pink)">
    <div class="topic-title">⚡ EIGRP &amp; DUAL — Diffusing Update Algorithm</div>
    <div class="topic-sub">DUAL convergence · Feasibility Condition · Stuck-in-Active · Named mode · UCMP with variance · Stub routing · OTP</div>
  </div>
  <div class="card">
    <div class="card-hdr">EIGRP Composite Metric — The Full Formula</div>
    <div class="grid-2">
      <div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:14px;font-family:var(--mono);font-size:10.5px;line-height:2">
          <div style="color:var(--amber);font-weight:700">CLASSIC METRIC (K-values K1-K5):</div>
          <div style="color:var(--text)">Metric = [K1×BW + (K2×BW)/(256-Load) + K3×Delay] × [K5/(Reliability+K4)]</div>
          <div style="color:var(--muted)">Default: K1=1, K2=0, K3=1, K4=0, K5=0</div>
          <div style="color:var(--cyan);margin-top:6px">SIMPLIFIED (default K-values):</div>
          <div style="color:var(--text)">Metric = (10^7 / BW_kbps) + Sum_of_delays_in_10us_units</div>
          <div style="color:var(--muted)">BW = minimum bandwidth on path (kbps)</div>
          <div style="color:var(--muted)">Delay = cumulative delay on ALL interfaces on path (×10 usec)</div>
          <div style="color:var(--cyan);margin-top:8px">EXAMPLE (R1→R2, GbE 1ns delay):</div>
          <div style="color:var(--text)">BW = 10^7 / 1000000 kbps = 10</div>
          <div style="color:var(--text)">Delay = 10 (GbE default 10usec × 1 hop) = 10</div>
          <div style="color:var(--green)">Metric = (10 + 10) × 256 = 5120</div>
          <div style="color:var(--cyan);margin-top:8px">WIDE METRIC (EIGRP named mode):</div>
          <div style="color:var(--text)">Metric = Throughput + Latency  (64-bit, supports 100GbE+)</div>
          <div style="color:var(--muted)">Classic metric maxes at 1GbE (all higher = same metric)</div>
          <div style="color:var(--muted)">Wide metric: 10^13 / throughput_bps + latency_in_picoseconds</div>
        </div>
      </div>
      <div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>Interface</th><th>BW (kbps)</th><th>Delay (usec)</th><th>Classic Metric contribution</th></tr>
          <tr><td>Serial T1</td><td>1544</td><td>20000 (20ms)</td><td>BW=6476, Delay=2000</td></tr>
          <tr><td>FastEthernet</td><td>100000</td><td>100</td><td>BW=100, Delay=10</td></tr>
          <tr><td>GigabitEthernet</td><td>1000000</td><td>10</td><td style="color:var(--red)">BW=10, Delay=1 (SAME AS 10GbE!)</td></tr>
          <tr><td>10GigabitEthernet</td><td>10000000</td><td>10</td><td style="color:var(--red)">BW=1 (rounded), Delay=1 (SAME!)</td></tr>
        </table></div>
        <div class="callout callout-warn" style="margin-top:8px">⚠️ <strong>CCIE trap:</strong> EIGRP classic metric cannot distinguish GbE from 10GbE. This causes EQUAL-COST paths where UCMP would be more appropriate. Fix: use EIGRP Named Mode with Wide Metrics.</div>
      </div>
    </div>
  </div>
  <div class="grid-2" style="margin-top:14px">
    <div>
      <div class="card">
        <div class="card-hdr">DUAL Algorithm — Feasibility Condition &amp; Loop Prevention</div>
        <div class="callout callout-info" style="margin-bottom:8px">DUAL (Diffusing Update Algorithm) guarantees loop-free convergence. The key insight: a neighbor's path is loop-free IF its distance to the destination is LESS than your current best distance.</div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--amber);font-weight:700">TERMINOLOGY:</div>
          <div style="color:var(--cyan)">FD  (Feasible Distance)  = best metric from THIS router to destination</div>
          <div style="color:var(--cyan)">RD  (Reported Distance)  = neighbor's metric to destination (what they report)</div>
          <div style="color:var(--cyan)">Successor               = current best path (lowest FD)</div>
          <div style="color:var(--cyan)">Feasible Successor (FS) = backup path meeting Feasibility Condition</div>
          <div style="margin-top:6px;color:var(--green);font-weight:700">FEASIBILITY CONDITION:</div>
          <div style="color:var(--green)">RD_of_neighbor &lt; FD_of_current_successor</div>
          <div style="color:var(--muted)">If this is true → neighbor cannot have a loop through us</div>
          <div style="color:var(--muted)">because their path is SHORTER than our current best</div>
          <div style="margin-top:6px;color:var(--blue)">EXAMPLE TOPOLOGY:</div>
          <div style="color:var(--text)">R1 → Dest: FD=30 (via R2)</div>
          <div style="color:var(--text)">R3 → Dest: RD=20 (R3 reports metric 20)</div>
          <div style="color:var(--green)">FC: 20 &lt; 30 ✓ → R3 is a Feasible Successor!</div>
          <div style="color:var(--text)">R4 → Dest: RD=35 (R4 reports metric 35)</div>
          <div style="color:var(--red)">FC: 35 &lt; 30 ✗ → R4 is NOT a FS (could create loop)</div>
          <div style="margin-top:6px;color:var(--amber);font-weight:700">CONVERGENCE WITH FS:</div>
          <div style="color:var(--muted)">Successor fails → instantly promote FS → NO query needed</div>
          <div style="color:var(--muted)">No FS → go Active, send Query to all neighbors</div>
          <div style="color:var(--red)">Stuck-in-Active: neighbor doesn't reply to Query in 3 min → reset adjacency</div>
        </div>
      </div>
    </div>
    <div>
      <div class="card">
        <div class="card-hdr">EIGRP Named Mode + UCMP with Variance</div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--cyan)">! EIGRP Named Mode (modern, preferred)</div>
          <div style="color:var(--green)">router eigrp MYNET</div>
          <div style="color:var(--green)"> address-family ipv4 unicast autonomous-system 1</div>
          <div style="color:var(--green)">  af-interface GigabitEthernet0/0</div>
          <div style="color:var(--amber)">   summary-address 10.0.0.0/8         ← per-interface summary</div>
          <div style="color:var(--amber)">   authentication mode md5</div>
          <div style="color:var(--green)">  topology base</div>
          <div style="color:var(--amber)">   variance 2                          ← UCMP!</div>
          <div style="color:var(--amber)">   maximum-paths 4</div>
          <div style="margin-top:6px;color:var(--cyan)">VARIANCE AND UCMP (Unequal-Cost Multi-Path):</div>
          <div style="color:var(--muted)">variance N: routes with FD ≤ N × best_FD are installed</div>
          <div style="color:var(--text)">Path 1: FD=100 (Successor)</div>
          <div style="color:var(--text)">Path 2: FD=180 (FS)</div>
          <div style="color:var(--text)">Path 3: FD=210 (FS)</div>
          <div style="color:var(--muted)">variance 2: install paths with FD ≤ 200</div>
          <div style="color:var(--green)">→ Path 1 + Path 2 installed (210 &gt; 200, Path 3 excluded)</div>
          <div style="color:var(--cyan)">Traffic split proportionally: Path1 gets 180/280, Path2 gets 100/280</div>
          <div style="margin-top:6px;color:var(--amber)">STUB ROUTING (hub-spoke):</div>
          <div style="color:var(--green)">eigrp stub connected summary  ← advertise connected+summary only</div>
          <div style="color:var(--muted)">Hub never queries stub routers (no Query propagation)</div>
          <div style="color:var(--muted)">Prevents Stuck-in-Active in large hub-spoke networks</div>
        </div>
      </div>
      <div class="card" style="margin-top:14px">
        <div class="card-hdr">🎯 EIGRP CCIE Interview Q&amp;A</div>
        <div class="qa-list">
          <div class="qa-item"><div class="qa-q" onclick="toggleQA(this)">Q: EIGRP neighbor is Stuck-in-Active. What exactly is happening and how do you resolve it?<span class="qa-arrow">▶</span></div><div class="qa-a">Stuck-in-Active (SIA) occurs when a router loses its Successor, has no Feasible Successor, and sends a Query to neighbors. If a neighbor doesn't reply within the Active timer (default 3 minutes), the querying router declares that neighbor SIA and resets the adjacency. <strong>Root causes:</strong> ①Neighbor is overloaded — CPU/memory too high to process queries. ②Query propagation to a far end — a stub router at the edge of the network gets a query and can't answer (no route). ③Unidirectional link — router sends query but reply gets lost. ④Large network with excessive Query propagation. <strong>Solutions:</strong> ①EIGRP stub routing on spoke routers — hub never queries stubs. ②Route summarization at distribution layer — limits Query scope (summarized routes don't propagate queries beyond the summarizing router). ③Increase Active timer: <code>timers active-time 5</code> (5 minutes) — buys time on slow links. ④Check <code>show ip eigrp topology active</code> — shows which queries are outstanding and to which neighbors. Fix the underlying cause, not just the timer.</div></div>
        </div>
      </div>
    </div>
  </div>
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">🔬 BGP Confederations & BGP Add-Path — Scaling Beyond Route Reflectors</div>
    <div class="callout callout-info">Confederations split one AS into multiple sub-ASes with eBGP-like behavior between them but iBGP attribute preservation. Add-Path allows RRs to advertise multiple best paths instead of just one.</div>
    <div class="grid-2">
      <div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--amber);font-weight:700">CONFEDERATION CONFIGURATION:</div>
          <div style="color:var(--muted2)">External AS (visible to internet): 65001</div>
          <div style="color:var(--muted2)">Sub-AS 1 (internal): 65510</div>
          <div style="color:var(--muted2)">Sub-AS 2 (internal): 65520</div>
          <div style="color:var(--green)">router bgp 65510              ← LOCAL sub-AS number</div>
          <div style="color:var(--amber)"> bgp confederation identifier 65001  ← true external AS</div>
          <div style="color:var(--amber)"> bgp confederation peers 65520       ← other sub-ASes</div>
          <div style="color:var(--amber)"> neighbor 10.0.0.2 remote-as 65510   ← iBGP within sub-AS</div>
          <div style="color:var(--amber)"> neighbor 10.0.1.1 remote-as 65520   ← confed eBGP peer</div>
          <div style="color:var(--muted)">! External peers only see AS 65001 in AS_PATH</div>
          <div style="color:var(--muted)">! Internal sub-AS numbers stripped at border routers</div>
          <div style="margin-top:8px;color:var(--cyan);font-weight:700">BGP ADD-PATH (RFC 7911):</div>
          <div style="color:var(--muted2)">RR only sends BEST path by default.</div>
          <div style="color:var(--muted2)">Add-Path: RR advertises MULTIPLE paths per prefix.</div>
          <div style="color:var(--green)">neighbor 2.2.2.2 additional-paths send receive</div>
          <div style="color:var(--green)">bgp additional-paths select all</div>
          <div style="color:var(--muted)">→ clients get backup paths immediately on failure!</div>
        </div>
      </div>
      <div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--cyan);font-weight:700">RR vs CONFEDERATION COMPARISON:</div>
          <div class="tbl-wrap"><table class="tbl" style="font-size:9px">
            <tr><th>Feature</th><th>Route Reflector</th><th>Confederation</th></tr>
            <tr><td>Complexity</td><td style="color:var(--green)">Lower</td><td style="color:var(--red)">Higher</td></tr>
            <tr><td>Path visibility</td><td style="color:var(--red)">Hidden by RR</td><td style="color:var(--green)">Better</td></tr>
            <tr><td>Deployment</td><td style="color:var(--green)">Most common</td><td style="color:var(--red)">Rare (legacy)</td></tr>
            <tr><td>Standards</td><td>RFC 4456</td><td>RFC 5065</td></tr>
          </table></div>
          <div style="margin-top:8px;color:var(--red);font-weight:700">BGP FLOWSPEC (RFC 5575) — DDoS Mitigation:</div>
          <div style="color:var(--muted2)">Distributes ACL-like rules via BGP UPDATE messages.</div>
          <div style="color:var(--muted2)">Rules pushed from controller → ALL edge routers simultaneously.</div>
          <div style="color:var(--muted2)">Can match: dst/src prefix, protocol, port, TCP flags, pkt-length, DSCP.</div>
          <div style="color:var(--muted2)">Actions: drop (rate 0), rate-limit, redirect to scrubber VRF, re-mark.</div>
          <div style="color:var(--green)">Result: network-wide DDoS mitigation in &lt;10 seconds!</div>
          <div style="color:var(--blue)">show bgp ipv4 flowspec detail  ← active FlowSpec rules</div>
          <div style="color:var(--blue)">show flowspec afi-all          ← counters per rule</div>
        </div>
      </div>
    </div>
  </div>


</div>

<!-- ═══ CCIE TAB 1: BGP PATH SELECTION ═══ -->
<div id="ccie-topic-1" class="topic-panel">
  <div class="topic-hero" style="border-left:4px solid var(--blue)">
    <div class="topic-title">🌍 BGP Path Selection — All 13 Attributes in Order</div>
    <div class="topic-sub">Weight → Local Pref → Locally originated → AS-PATH → Origin → MED → eBGP/iBGP → IGP metric → oldest → Router ID → Cluster list → Neighbor IP</div>
  </div>
  <div class="card">
    <div class="card-hdr">BGP Path Selection — The Complete Decision Process</div>
    <div class="callout callout-info">BGP never installs ALL paths — it selects ONE best path per prefix. The decision process is sequential: if a step produces a clear winner, stop. Only proceed to the next step if paths tie at that step. Memorize the order — CCIE lab asks you to manipulate specific steps.</div>
    <div class="tbl-wrap"><table class="tbl">
      <tr><th>#</th><th>Attribute</th><th>Winner</th><th>Scope</th><th>How to Manipulate</th></tr>
      <tr><td style="color:var(--red);font-weight:700">1</td><td style="color:var(--red)">Weight</td><td>Highest</td><td>Cisco only, local router (not advertised)</td><td>route-map set weight N on neighbor</td></tr>
      <tr><td style="color:var(--amber);font-weight:700">2</td><td style="color:var(--amber)">Local Preference</td><td>Highest</td><td>Within AS (iBGP only, advertised)</td><td>set local-preference N in route-map</td></tr>
      <tr><td style="color:var(--blue);font-weight:700">3</td><td style="color:var(--blue)">Locally originated</td><td>Prefer local</td><td>Local router — network/redistribute wins over aggregate wins over iBGP</td><td>Redistribute vs network command</td></tr>
      <tr><td style="color:var(--cyan);font-weight:700">4</td><td style="color:var(--cyan)">AS-PATH length</td><td>Shortest</td><td>Advertised globally</td><td>as-path prepend (add fake AS hops)</td></tr>
      <tr><td style="color:var(--green);font-weight:700">5</td><td style="color:var(--green)">Origin code</td><td>IGP &gt; EGP &gt; ?</td><td>Advertised globally</td><td>set origin igp/incomplete in route-map</td></tr>
      <tr><td style="color:var(--blue);font-weight:700">6</td><td style="color:var(--blue)">MED</td><td>Lowest</td><td>Between eBGP peers in same AS (complex rules)</td><td>set metric N in route-map</td></tr>
      <tr><td style="color:var(--amber);font-weight:700">7</td><td style="color:var(--amber)">eBGP over iBGP</td><td>eBGP preferred</td><td>Route source type</td><td>bgp bestpath as-path multipath-relax</td></tr>
      <tr><td style="color:var(--cyan);font-weight:700">8</td><td style="color:var(--cyan)">IGP metric to next-hop</td><td>Lowest</td><td>Local routing table cost to BGP next-hop</td><td>Adjust IGP costs</td></tr>
      <tr><td style="color:var(--muted2);font-weight:700">9</td><td style="color:var(--muted2)">Oldest eBGP path</td><td>Oldest</td><td>Prefer most stable path (less churn)</td><td>bgp bestpath compare-routerid (disables)</td></tr>
      <tr><td style="color:var(--muted2);font-weight:700">10</td><td style="color:var(--muted2)">BGP Router ID</td><td>Lowest</td><td>Originating router's RID</td><td>bgp router-id</td></tr>
      <tr><td style="color:var(--muted2);font-weight:700">11</td><td style="color:var(--muted2)">Cluster list length</td><td>Shortest</td><td>Route reflector path</td><td>RR topology design</td></tr>
      <tr><td style="color:var(--muted2);font-weight:700">12</td><td style="color:var(--muted2)">Neighbor IP address</td><td>Lowest</td><td>Final tiebreaker</td><td>Change neighbor IP (not practical)</td></tr>
    </table></div>
  </div>
  <div class="grid-2" style="margin-top:14px">
    <div>
      <div class="card">
        <div class="card-hdr">Weight vs Local Preference vs MED — Critical Differences</div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--red);font-weight:700">WEIGHT — Cisco proprietary, LOCAL only:</div>
          <div style="color:var(--muted)">• Not advertised to ANY peer (not even iBGP)</div>
          <div style="color:var(--muted)">• Set on THIS router only — affects THIS router's decision</div>
          <div style="color:var(--muted)">• Use case: prefer path for outbound traffic on THIS router</div>
          <div style="color:var(--green)">neighbor 10.1.1.1 route-map SET-WEIGHT in</div>
          <div style="color:var(--green)">route-map SET-WEIGHT permit 10 ; set weight 200</div>
          <div style="margin-top:8px;color:var(--amber);font-weight:700">LOCAL PREFERENCE — iBGP scope:</div>
          <div style="color:var(--muted)">• Advertised to ALL iBGP peers within the AS</div>
          <div style="color:var(--muted)">• Affects ALL routers in AS → consistent exit point</div>
          <div style="color:var(--muted)">• Use case: define preferred exit AS for the ENTIRE AS</div>
          <div style="color:var(--green)">bgp default local-preference 100  ← change default</div>
          <div style="color:var(--green)">route-map SET-LP ; set local-preference 200</div>
          <div style="margin-top:8px;color:var(--blue);font-weight:700">MED — Inter-AS metric hint:</div>
          <div style="color:var(--muted)">• Sent to eBGP peers — they CAN use it (optional)</div>
          <div style="color:var(--muted)">• Only compared between paths from SAME AS (normally)</div>
          <div style="color:var(--muted)">• Use case: tell neighboring AS which link to prefer for INBOUND</div>
          <div style="color:var(--red)">bgp always-compare-med  ← compare MED across different ASes (non-standard)</div>
          <div style="color:var(--red)">bgp bestpath med confed  ← compare within confederation</div>
        </div>
      </div>
    </div>
    <div>
      <div class="card">
        <div class="card-hdr">BGP Policy Lab — Controlling Traffic In &amp; Out</div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--cyan)">OUTBOUND TRAFFIC CONTROL (how our AS reaches others):</div>
          <div style="color:var(--muted)">Use Weight (local) or Local Preference (AS-wide)</div>
          <div style="color:var(--text)">AS 100 has two eBGP peers: ISP-A and ISP-B</div>
          <div style="color:var(--text)">Goal: prefer ISP-A for all outbound traffic</div>
          <div style="color:var(--green)">router bgp 100</div>
          <div style="color:var(--green)"> neighbor ISP-A route-map PREFER-A in</div>
          <div style="color:var(--green)">route-map PREFER-A permit 10</div>
          <div style="color:var(--amber)"> set local-preference 200  ← higher = preferred</div>
          <div style="color:var(--muted)">(ISP-B default local-pref = 100 → ISP-A wins)</div>
          <div style="margin-top:8px;color:var(--cyan)">INBOUND TRAFFIC CONTROL (how others reach our AS):</div>
          <div style="color:var(--muted)">Use AS-PATH prepend (make one path look longer)</div>
          <div style="color:var(--muted)">Or use MED to signal preference to neighbor AS</div>
          <div style="color:var(--text)">Goal: make ISP-B prefer sending traffic via ISP-A link</div>
          <div style="color:var(--green)">neighbor ISP-B route-map PREPEND out</div>
          <div style="color:var(--green)">route-map PREPEND permit 10</div>
          <div style="color:var(--amber)"> set as-path prepend 100 100 100  ← 3× prepend = longer path</div>
          <div style="color:var(--muted)">ISP-B sees our AS-PATH as 100 100 100 100 (4 hops)</div>
          <div style="color:var(--muted)">vs ISP-A path showing 100 (1 hop) → ISP-B prefers ISP-A</div>
        </div>
      </div>
      <div class="card" style="margin-top:14px">
        <div class="card-hdr">🎯 BGP CCIE Interview Q&amp;A</div>
        <div class="qa-list">
          <div class="qa-item"><div class="qa-q" onclick="toggleQA(this)">Q: MED is set to 50 on one path and 100 on another, but BGP is not choosing the lower MED. Why?<span class="qa-arrow">▶</span></div><div class="qa-a">MED is only compared between routes that come from the SAME autonomous system. If path 1 (MED=50) came from AS 200 and path 2 (MED=100) came from AS 300, BGP will NOT compare the MEDs — they're from different neighbors. It will skip step 6 and proceed to step 7 (eBGP vs iBGP). If you want to always compare MED regardless of source AS: <code>bgp always-compare-med</code>. This is non-standard behavior and some networks disable it. Also check: if either path has no MED attribute at all, Cisco treats it as MED=0 by default (<code>bgp bestpath missing-as-worst</code> makes missing MED = 4294967295 instead). Another trap: if the same prefix is coming from two different ASBR routers within your AS via iBGP, MED comparison works because they're from the same external AS — this is the normal use case for MED.</div></div>
        </div>
      </div>
    </div>
  </div>
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">🔬 IS-IS Detailed — NET Address, Level Hierarchy & TLV Extensions</div>
    <div class="callout callout-info">IS-IS is the IGP of choice for large SP cores. It runs directly on L2 (not over IP), uses NET (NSAP) addressing, and carries both IPv4 and IPv6 in a single process via TLV extensions.</div>
    <div class="grid-2">
      <div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--amber);font-weight:700">IS-IS NET ADDRESS FORMAT:</div>
          <div style="color:var(--text)">49.0001.1921.6800.0001.00</div>
          <div style="color:var(--cyan)">49     = Area ID prefix (locally assigned)</div>
          <div style="color:var(--cyan)">0001   = Area number within the prefix</div>
          <div style="color:var(--green)">1921.6800.0001 = System ID (derived from router IP)</div>
          <div style="color:var(--muted2)">192.168.0.1 → 1921.6800.0001 (pad each octet to 3 digits)</div>
          <div style="color:var(--blue)">00     = NSEL (always 00 for a router)</div>
          <div style="margin-top:8px;color:var(--amber);font-weight:700">IS-IS CONFIGURATION (IOS-XE):</div>
          <div style="color:var(--green)">router isis</div>
          <div style="color:var(--amber)"> net 49.0001.0001.0001.0001.00</div>
          <div style="color:var(--amber)"> is-type level-2-only         ← backbone router</div>
          <div style="color:var(--amber)"> metric-style wide            ← required for TE extensions!</div>
          <div style="color:var(--amber)"> address-family ipv4 unicast</div>
          <div style="color:var(--amber)"> address-family ipv6 unicast  ← dual-stack in ONE process!</div>
          <div style="color:var(--green)">interface GigabitEthernet0/0</div>
          <div style="color:var(--amber)"> ip router isis</div>
          <div style="color:var(--amber)"> ipv6 router isis</div>
          <div style="color:var(--amber)"> isis metric 10 level-2</div>
          <div style="color:var(--blue)">show isis neighbors              ← adjacencies</div>
          <div style="color:var(--blue)">show isis database detail        ← LSP content + TLVs</div>
          <div style="color:var(--blue)">show isis route                  ← routes</div>
        </div>
      </div>
      <div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>Feature</th><th>OSPF</th><th>IS-IS</th></tr>
          <tr><td>Protocol base</td><td>IP protocol 89</td><td style="color:var(--green)">Runs on L2 directly</td></tr>
          <tr><td>IPv4+v6</td><td>Two separate processes</td><td style="color:var(--green)">Single process, both in LSPs</td></tr>
          <tr><td>Area design</td><td>Backbone Area 0 required</td><td>L1 areas + L2 backbone</td></tr>
          <tr><td>SPF efficiency</td><td>Moderate (LSA types 1-7)</td><td style="color:var(--green)">Better (TLV-based LSPs)</td></tr>
          <tr><td>TE support</td><td>Opaque LSA Type 10</td><td>TE TLVs (222, 223, 135)</td></tr>
          <tr><td>Segment Routing</td><td>SR-OSPF</td><td style="color:var(--green)">SR-ISIS (preferred in SP)</td></tr>
          <tr><td>Deployment</td><td>Enterprise default</td><td style="color:var(--green)">SP/large DC preferred</td></tr>
        </table></div>
        <div class="callout callout-info" style="margin-top:10px"><strong>Why SP prefer IS-IS:</strong> (1) Runs on L2 — not affected by IP misconfiguration (you can't accidentally route IS-IS packets wrong). (2) Single process for IPv4+IPv6 — half the operational complexity. (3) TLV-based LSPs are extensible — adding new features (SR, FlexAlgo) requires only new TLV types, no protocol redesign. (4) Historically proven at scale — Internet backbone OSes (Cisco, Juniper, Nokia) all use IS-IS for their own core networks.</div>
      </div>
    </div>
  </div>


</div>

<!-- ═══ CCIE TAB 2: MULTICAST ═══ -->
<div id="ccie-topic-2" class="topic-panel">
  <div class="topic-hero" style="border-left:4px solid var(--green)">
    <div class="topic-title">🌐 IP Multicast — IGMP, PIM-SM, RP, RPT vs SPT</div>
    <div class="topic-sub">IGMP v1/v2/v3 · PIM-SM Join/Prune · Rendezvous Point (Auto-RP/BSR/Anycast) · Shared tree vs Source tree · SSM · MSDP</div>
  </div>
  <div class="card">
    <div class="card-hdr">Multicast Address Space &amp; Group Model</div>
    <div class="grid-2">
      <div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>Range</th><th>Type</th><th>Use</th></tr>
          <tr><td style="color:var(--blue)">224.0.0.0/24</td><td>Link-Local</td><td>Routing protocols (OSPF=224.0.0.5/6, EIGRP=224.0.0.10, HSRP=224.0.0.2)</td></tr>
          <tr><td style="color:var(--cyan)">224.0.1.0-238.255.255.255</td><td>Global ASM</td><td>Any-Source Multicast — IANA assigned + user</td></tr>
          <tr><td style="color:var(--amber)">232.0.0.0/8</td><td>SSM range</td><td>Source-Specific Multicast (IGMPv3 required)</td></tr>
          <tr><td style="color:var(--green)">233.0.0.0/8</td><td>GLOP</td><td>RFC 2770: embed AS number into multicast group</td></tr>
          <tr><td style="color:var(--pink)">239.0.0.0/8</td><td>Admin Scoped</td><td>Private/enterprise use — like RFC 1918 for multicast</td></tr>
          <tr><td style="color:var(--red)">FF00::/8</td><td>IPv6 Multicast</td><td>FF02::1=all-nodes, FF02::2=all-routers, FF02::5=OSPFv3</td></tr>
        </table></div>
      </div>
      <div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--amber);font-weight:700">MULTICAST MAC ADDRESS MAPPING:</div>
          <div style="color:var(--text)">Multicast IP → MAC: 01:00:5e:XX:XX:XX</div>
          <div style="color:var(--muted)">Low 23 bits of IP group → last 23 bits of MAC</div>
          <div style="color:var(--text)">224.1.2.3 → 01:00:5e:01:02:03</div>
          <div style="color:var(--red)">OVERLAP: 224.1.2.3 and 225.1.2.3 and 226.1.2.3 map to SAME MAC!</div>
          <div style="color:var(--muted)">(High bit differs but gets dropped in mapping)</div>
          <div style="color:var(--muted)">→ L2 switch delivers both groups to same port even if only one subscribed</div>
          <div style="color:var(--cyan);margin-top:6px">IGMP SNOOPING resolves this at L2:</div>
          <div style="color:var(--muted)">Switch tracks per-port group membership → targeted delivery</div>
          <div style="color:var(--muted)">show ip igmp snooping groups</div>
        </div>
      </div>
    </div>
  </div>
  <div class="grid-2" style="margin-top:14px">
    <div>
      <div class="card">
        <div class="card-hdr">PIM-SM — Shared Tree (RPT) vs Source Tree (SPT)</div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--blue);font-weight:700">PHASE 1: SHARED TREE (RPT) — (*,G) entries</div>
          <div style="color:var(--muted)">1. Receiver sends IGMPv2 Membership Report for group G</div>
          <div style="color:var(--muted)">2. DR on receiver LAN sends PIM Join (*,G) toward RP</div>
          <div style="color:var(--muted)">3. Each router on path creates (*,G) state and joins RPT</div>
          <div style="color:var(--muted)">4. Source starts sending → Register to RP (unicast encap)</div>
          <div style="color:var(--muted)">5. RP decapsulates, forwards down shared tree</div>
          <div style="margin-top:6px;color:var(--amber);font-weight:700">PHASE 2: SPT SWITCHOVER — (S,G) entries</div>
          <div style="color:var(--muted)">When traffic rate exceeds SPT threshold (default 0 kbps = immediate):</div>
          <div style="color:var(--cyan)">6. DR near receiver sends PIM Join (S,G) toward SOURCE</div>
          <div style="color:var(--muted)">7. (S,G) state created along shortest path to source</div>
          <div style="color:var(--muted)">8. Once SPT data arrives at receiver DR, it sends Prune (*,G) toward RP</div>
          <div style="color:var(--muted)">9. RP prunes its tree if no other receivers on that branch</div>
          <div style="color:var(--green)">Result: receiver now on optimal SPT (shortest source→receiver path)</div>
          <div style="margin-top:6px;color:var(--red)">ip pim spt-threshold infinity ← stay on RPT forever (saves state)</div>
          <div style="color:var(--muted)">Used when source is far — SPT isn't actually shorter</div>
        </div>
      </div>
      <div class="card" style="margin-top:14px">
        <div class="card-hdr">IGMP Version Comparison</div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>Feature</th><th>IGMPv1</th><th>IGMPv2</th><th>IGMPv3</th></tr>
          <tr><td>Leave group</td><td style="color:var(--red)">No (wait for timeout)</td><td style="color:var(--green)">Leave Group message</td><td style="color:var(--green)">Leave + source filtering</td></tr>
          <tr><td>Source filtering</td><td>No</td><td>No</td><td style="color:var(--green)">YES (INCLUDE/EXCLUDE)</td></tr>
          <tr><td>SSM support</td><td>No</td><td>No</td><td style="color:var(--green)">YES</td></tr>
          <tr><td>Querier election</td><td>No (DR is querier)</td><td>Lowest IP wins</td><td>Lowest IP wins</td></tr>
          <tr><td>RFC</td><td>RFC 1112</td><td>RFC 2236</td><td>RFC 3376</td></tr>
        </table></div>
      </div>
    </div>
    <div>
      <div class="card">
        <div class="card-hdr">RP Discovery — Auto-RP, BSR, Anycast RP</div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--blue);font-weight:700">AUTO-RP (Cisco proprietary):</div>
          <div style="color:var(--cyan)">ip pim send-rp-announce Lo0 scope 16  ← candidate RP</div>
          <div style="color:var(--cyan)">ip pim send-rp-discovery Lo1 scope 16  ← RP mapping agent</div>
          <div style="color:var(--muted)">Candidate RPs announce to 224.0.1.39 (CISCO-RP-ANNOUNCE)</div>
          <div style="color:var(--muted)">Mapping Agent listens, elects RP, announces to 224.0.1.40 (CISCO-RP-DISCOVERY)</div>
          <div style="color:var(--red)">CHICKEN-AND-EGG: How do routers join 224.0.1.39/40 if they don't know the RP?</div>
          <div style="color:var(--amber)">Fix: ip pim autorp listener OR sparse-dense-mode on interfaces</div>
          <div style="margin-top:8px;color:var(--blue);font-weight:700">BSR (RFC standard — PIMv2):</div>
          <div style="color:var(--cyan)">ip pim bsr-candidate Lo0 32           ← BSR candidate</div>
          <div style="color:var(--cyan)">ip pim rp-candidate Lo0 group-list ALL ← RP candidate</div>
          <div style="color:var(--muted)">BSR floods RP info in BSR messages (hop-by-hop)</div>
          <div style="color:var(--muted)">No chicken-and-egg problem — flooded via PIM hello</div>
          <div style="margin-top:8px;color:var(--blue);font-weight:700">ANYCAST RP (RFC 4610):</div>
          <div style="color:var(--muted)">Multiple RPs share same IP address (e.g. 10.0.0.1)</div>
          <div style="color:var(--muted)">Sources register to nearest RP → MSDP syncs state between RPs</div>
          <div style="color:var(--green)">Provides RP redundancy + load balancing across RPs</div>
        </div>
      </div>
      <div class="card" style="margin-top:14px">
        <div class="card-hdr">PIM Config — Complete Router Setup</div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:10px;font-family:var(--mono);font-size:10px;line-height:1.8">
          <div style="color:var(--cyan)">ip multicast-routing                   ← enable globally</div>
          <div style="color:var(--green)">interface GigabitEthernet0/0</div>
          <div style="color:var(--amber)"> ip pim sparse-mode               ← PIM-SM (most common)</div>
          <div style="color:var(--amber)"> ip igmp version 3                ← IGMPv3 for SSM</div>
          <div style="color:var(--cyan)">! Static RP (simplest)</div>
          <div style="color:var(--green)">ip pim rp-address 10.0.0.1 override  ← override Auto-RP</div>
          <div style="color:var(--cyan)">! Verification</div>
          <div style="color:var(--blue)">show ip mroute                    ← multicast routing table</div>
          <div style="color:var(--blue)">show ip pim neighbor              ← PIM adjacencies</div>
          <div style="color:var(--blue)">show ip igmp groups               ← IGMP group membership</div>
          <div style="color:var(--blue)">show ip pim rp mapping            ← RP for each group</div>
          <div style="color:var(--blue)">mrinfo 10.0.0.1                   ← query multicast router</div>
        </div>
      </div>
    </div>
  </div>
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">🔬 PIM-SM Complete — RP Discovery, SPT Switchover & SSM</div>
    <div class="callout callout-info">PIM-SM uses a Rendezvous Point (RP) to bootstrap multicast trees. Understanding (*,G) shared tree vs (S,G) shortest-path tree and the SPT switchover process is essential for CCIE multicast.</div>
    <div class="grid-2">
      <div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--amber);font-weight:700">PIM-SM COMPLETE FLOW:</div>
          <div style="color:var(--cyan)">Phase 1: Source registers with RP</div>
          <div style="color:var(--muted2)">1. Source → multicast packet → FHR encapsulates in PIM Register</div>
          <div style="color:var(--muted2)">2. RP decapsulates, joins source tree: (S,G) entry created</div>
          <div style="color:var(--muted2)">3. RP sends Register-Stop when native traffic arrives</div>
          <div style="color:var(--cyan)">Phase 2: Receivers join via RP (shared tree)</div>
          <div style="color:var(--muted2)">4. Receiver sends IGMP Report for group G</div>
          <div style="color:var(--muted2)">5. LHR sends PIM Join toward RP → (*,G) state hop by hop</div>
          <div style="color:var(--muted2)">6. Traffic: Source → RP → all Receivers (shared tree)</div>
          <div style="color:var(--cyan)">Phase 3: SPT Switchover (threshold = 0 bps default)</div>
          <div style="color:var(--muted2)">7. LHR receives first packet from RP</div>
          <div style="color:var(--muted2)">8. LHR sends PIM Join DIRECTLY to source → (S,G) entry</div>
          <div style="color:var(--muted2)">9. LHR sends PIM Prune to RP (stop via shared tree)</div>
          <div style="color:var(--green)">Result: shortest-path tree from source to each receiver!</div>
        </div>
      </div>
      <div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--cyan);font-weight:700">PIM-SM CONFIGURATION:</div>
          <div style="color:var(--green)">ip multicast-routing</div>
          <div style="color:var(--green)">! Static RP:</div>
          <div style="color:var(--amber)">ip pim rp-address 10.0.0.1</div>
          <div style="color:var(--green)">! Auto-RP (Cisco proprietary):</div>
          <div style="color:var(--amber)">ip pim send-rp-announce Lo0 scope 10    ← RP candidate</div>
          <div style="color:var(--amber)">ip pim send-rp-discovery Lo0 scope 10   ← mapping agent</div>
          <div style="color:var(--green)">! BSR (Bootstrap Router — RFC standard):</div>
          <div style="color:var(--amber)">ip pim bsr-candidate Loopback0 30</div>
          <div style="color:var(--amber)">ip pim rp-candidate Loopback0</div>
          <div style="color:var(--green)">interface GigabitEthernet0/0</div>
          <div style="color:var(--amber)"> ip pim sparse-mode</div>
          <div style="color:var(--amber)"> ip igmp version 3             ← IGMPv3 for SSM!</div>
          <div style="color:var(--cyan)">SSM (Source-Specific Multicast):</div>
          <div style="color:var(--muted2)">Receivers specify (S,G) not just (*,G). No RP needed!</div>
          <div style="color:var(--amber)">ip pim ssm default             ← use 232.0.0.0/8 for SSM</div>
          <div style="color:var(--blue)">show ip mroute                 ← multicast routing table</div>
          <div style="color:var(--blue)">show ip pim rp mapping         ← active RP assignments</div>
          <div style="color:var(--blue)">show ip igmp groups            ← receiver group memberships</div>
        </div>
      </div>
    </div>
  </div>


</div>

<!-- ═══ CCIE TAB 3: ROUTE REDISTRIBUTION ═══ -->
<div id="ccie-topic-3" class="topic-panel">
  <div class="topic-hero" style="border-left:4px solid var(--amber)">
    <div class="topic-title">🔀 Route Redistribution — Metrics, Loops &amp; Policy</div>
    <div class="topic-sub">Default metrics · Seed metrics · Route tagging · Mutual redistribution loops · Administrative distance manipulation · Conditional redistribution</div>
  </div>
  <div class="grid-2">
    <div>
      <div class="card">
        <div class="card-hdr">Redistribution Default Metrics</div>
        <div class="callout callout-warn" style="margin-bottom:8px">⚠️ If you redistribute without setting a metric, some protocols use a default metric (which may be usable) while others use an infinite metric (route is installed but unreachable). Always set explicit metrics.</div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>Redistributing INTO</th><th>Default metric if unset</th><th>Recommended</th></tr>
          <tr><td style="color:var(--blue)">RIP</td><td style="color:var(--red)">Infinity (∞) — unusable</td><td>default-metric 5 (or set in route-map)</td></tr>
          <tr><td style="color:var(--cyan)">OSPF</td><td style="color:var(--amber)">20 (E2 external)</td><td>default-metric 100 + metric-type 1</td></tr>
          <tr><td style="color:var(--amber)">EIGRP</td><td style="color:var(--red)">Infinity — unusable without metric</td><td>default-metric 10000 100 255 1 1500</td></tr>
          <tr><td style="color:var(--green)">BGP</td><td style="color:var(--muted2)">0 (IGP metric)</td><td>Set MED via route-map</td></tr>
          <tr><td style="color:var(--pink)">IS-IS</td><td style="color:var(--amber)">0</td><td>Set explicit metric</td></tr>
        </table></div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:10px;font-family:var(--mono);font-size:10px;line-height:1.8;margin-top:8px">
          <div style="color:var(--cyan)">! Redistribute OSPF into EIGRP with full metric</div>
          <div style="color:var(--green)">router eigrp 1</div>
          <div style="color:var(--amber)"> redistribute ospf 1 metric 10000 100 255 1 1500</div>
          <div style="color:var(--muted)">             BW(kbps) delay(us) reliability load MTU</div>
          <div style="color:var(--cyan)">! Redistribute EIGRP into OSPF</div>
          <div style="color:var(--green)">router ospf 1</div>
          <div style="color:var(--amber)"> redistribute eigrp 1 subnets metric 100 metric-type 1</div>
          <div style="color:var(--muted)">subnets: redistribute all subnets (not just classful)</div>
        </div>
      </div>
      <div class="card" style="margin-top:14px">
        <div class="card-hdr">Mutual Redistribution Loop — Formation &amp; Prevention</div>
        <div class="callout callout-warn" style="margin-bottom:8px">⚠️ The most dangerous redistribution scenario: two routers doing mutual redistribution between OSPF and EIGRP. Routes can loop back and form sub-optimal or infinite routing loops.</div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--red)">LOOP SCENARIO:</div>
          <div style="color:var(--text)">Router A redistributes OSPF→EIGRP on left side</div>
          <div style="color:var(--text)">Router B redistributes EIGRP→OSPF on right side</div>
          <div style="color:var(--red)">Problem: OSPF route on Router A leaks into EIGRP</div>
          <div style="color:var(--red)">Router B takes it, puts it back into OSPF with E2 metric</div>
          <div style="color:var(--red)">Now two OSPF routes for same prefix — possibly the WRONG one wins!</div>
          <div style="margin-top:6px;color:var(--green)">SOLUTION 1: Route Tagging</div>
          <div style="color:var(--amber)">! On Router A (OSPF → EIGRP): tag routes from OSPF</div>
          <div style="color:var(--green)">route-map OSPF-TO-EIGRP permit 10</div>
          <div style="color:var(--amber)"> set tag 100</div>
          <div style="color:var(--cyan)">! On Router B (EIGRP → OSPF): deny routes with tag 100</div>
          <div style="color:var(--green)">route-map EIGRP-TO-OSPF deny 10</div>
          <div style="color:var(--amber)"> match tag 100  ← block routes that came from OSPF originally</div>
          <div style="color:var(--green)">route-map EIGRP-TO-OSPF permit 20</div>
          <div style="margin-top:6px;color:var(--green)">SOLUTION 2: Administrative Distance Manipulation</div>
          <div style="color:var(--muted)">Make EIGRP internal routes preferred over OSPF external:</div>
          <div style="color:var(--amber)">distance ospf external 200  ← OSPF external AD = 200 (high)</div>
          <div style="color:var(--muted)">EIGRP internal (90) &lt; OSPF external (200) → EIGRP always wins</div>
        </div>
      </div>
    </div>
    <div>
      <div class="card">
        <div class="card-hdr">Administrative Distance — Full Table &amp; Manipulation</div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>Source</th><th>Default AD</th><th>Notes</th></tr>
          <tr><td>Connected</td><td style="color:var(--green)">0</td><td>Always preferred</td></tr>
          <tr><td>Static</td><td style="color:var(--green)">1</td><td>Overrides everything except connected</td></tr>
          <tr><td>EIGRP Summary</td><td style="color:var(--blue)">5</td><td>Summary routes only</td></tr>
          <tr><td>eBGP</td><td style="color:var(--cyan)">20</td><td>eBGP preferred over IGP</td></tr>
          <tr><td>EIGRP Internal</td><td style="color:var(--cyan)">90</td><td>Best IGP for Cisco</td></tr>
          <tr><td>IGRP</td><td style="color:var(--muted2)">100</td><td>Legacy</td></tr>
          <tr><td>OSPF</td><td style="color:var(--amber)">110</td><td>Standard choice after EIGRP</td></tr>
          <tr><td>IS-IS</td><td style="color:var(--amber)">115</td><td>Service provider default</td></tr>
          <tr><td>RIP</td><td style="color:var(--amber)">120</td><td>Legacy distance vector</td></tr>
          <tr><td>EIGRP External</td><td style="color:var(--red)">170</td><td>Redistributed into EIGRP</td></tr>
          <tr><td>iBGP</td><td style="color:var(--red)">200</td><td>Lowest trust among dynamic</td></tr>
        </table></div>
        <div class="callout callout-warn" style="margin-top:8px">⚠️ <strong>Floating static route:</strong> <code>ip route 0.0.0.0 0.0.0.0 10.0.0.1 200</code> — AD 200 means it's only used if iBGP (AD=200) fails. Wait — iBGP is also AD 200! First installed wins. Better to use AD 210: <code>ip route 0.0.0.0 0.0.0.0 backup 210</code>.</div>
      </div>
      <div class="card" style="margin-top:14px">
        <div class="card-hdr">🎯 Redistribution Interview Q&amp;A</div>
        <div class="qa-list">
          <div class="qa-item"><div class="qa-q" onclick="toggleQA(this)">Q: What is the difference between OSPF E1 and E2 external routes, and why does it matter during redistribution?<span class="qa-arrow">▶</span></div><div class="qa-a"><strong>E2 (Type 2 External)</strong>: The metric is the cost set at the ASBR and does NOT increase as the route travels through the OSPF domain. If 3 routers are between you and the ASBR, each with cost 10, your total cost to the external network is still just the ASBR's set cost (e.g., 20). This is the DEFAULT. <strong>E1 (Type 1 External)</strong>: The metric is the set cost AT the ASBR plus the OSPF path cost TO the ASBR. As the route travels further from the ASBR, the metric grows. <strong>Why it matters:</strong> If you have two ASBRs redistributing the same external prefix (dual-homed OSPF domain), E2 routes always prefer the ASBR with the lower seed metric — regardless of how far away it is. This can cause suboptimal routing: a router might choose a distant ASBR with metric 100 over a nearby ASBR with metric 110, even though the nearby one has a total path of 110+5=115 vs the distant one's 100+50=150. E1 accounts for the intra-domain cost, giving more realistic path selection for multi-ASBR scenarios. Best practice: use E1 when you have redundant redistribution points. Use E2 when you have only one ASBR (simpler, lower overhead).</div></div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- ═══ CCIE TAB 4: SEGMENT ROUTING ═══ -->
<div id="ccie-topic-4" class="topic-panel">
  <div class="topic-hero" style="border-left:4px solid var(--pink)">
    <div class="topic-title">🏷️ Segment Routing — SR-MPLS, SRv6 &amp; TI-LFA</div>
    <div class="topic-sub">SRGB · Node-SID · Adjacency-SID · SR-TE · TI-LFA for sub-50ms FRR · SRv6 with SRH · PCEP integration</div>
  </div>
  <div class="card">
    <div class="card-hdr">Segment Routing vs Traditional MPLS — Why SR Wins</div>
    <div class="tbl-wrap"><table class="tbl">
      <tr><th>Feature</th><th>Traditional MPLS (LDP/RSVP)</th><th>Segment Routing</th></tr>
      <tr><td>Label distribution</td><td>LDP (per-prefix, every hop)</td><td>Distributed via IGP (OSPF/IS-IS extensions)</td></tr>
      <tr><td>TE signaling</td><td>RSVP-TE (complex, stateful)</td><td>SR-TE (source-routed, stateless)</td></tr>
      <tr><td>Per-router state</td><td style="color:var(--red)">High — LDP/RSVP state on every node</td><td style="color:var(--green)">Low — only head-end knows path</td></tr>
      <tr><td>Fast reroute</td><td>RSVP FRR (50ms, complex)</td><td>TI-LFA (50ms, automatically computed from IGP)</td></tr>
      <tr><td>Scale</td><td>Limited by per-LSP state</td><td>Scales to 100K+ paths (stateless mid-points)</td></tr>
      <tr><td>Programmability</td><td>Limited (static config)</td><td>PCE/PCEP, YANG/NETCONF, SRv6 service chaining</td></tr>
    </table></div>
  </div>
  <div class="grid-2" style="margin-top:14px">
    <div>
      <div class="card">
        <div class="card-hdr">SR-MPLS Segment Types — SID Taxonomy</div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10.5px;line-height:2">
          <div style="color:var(--blue);font-weight:700">SRGB (Segment Routing Global Block):</div>
          <div style="color:var(--text)">Default: labels 16000-23999 (8000 labels)</div>
          <div style="color:var(--text)">Node-SID = SRGB_start + SID_index</div>
          <div style="color:var(--text)">Router A: index 1 → label 16001</div>
          <div style="color:var(--text)">Router B: index 2 → label 16002</div>
          <div style="margin-top:8px;color:var(--cyan);font-weight:700">NODE-SID (Prefix-SID):</div>
          <div style="color:var(--muted)">• Globally unique index assigned to a router's loopback</div>
          <div style="color:var(--muted)">• Distributed via IGP (OSPF SR-extension TLV, IS-IS TLV 135)</div>
          <div style="color:var(--muted)">• Behavior: CONTINUE — forward toward that router via SPF</div>
          <div style="color:var(--green)">segment-routing mpls ; connected-prefix-sid-map ; address-family ipv4 ; 10.0.0.1/32 index 1 range 1</div>
          <div style="margin-top:8px;color:var(--amber);font-weight:700">ADJACENCY-SID (Adj-SID):</div>
          <div style="color:var(--muted)">• Locally significant (not global)</div>
          <div style="color:var(--muted)">• Represents a specific link to a neighbor</div>
          <div style="color:var(--muted)">• Behavior: NEXT — forward out this specific interface</div>
          <div style="color:var(--muted)">• Used for TE (explicit path via specific links)</div>
          <div style="color:var(--muted)">• Auto-allocated from dynamic range (not SRGB)</div>
          <div style="margin-top:8px;color:var(--pink);font-weight:700">SERVICE-SID (for SRv6/VPN):</div>
          <div style="color:var(--muted)">• VPN labels, service function indicators</div>
          <div style="color:var(--muted)">• BGP distributes these for VPN services</div>
        </div>
      </div>
      <div class="card" style="margin-top:14px">
        <div class="card-hdr">TI-LFA — Topology Independent Loop-Free Alternate</div>
        <div class="callout callout-info" style="margin-bottom:8px">TI-LFA provides sub-50ms FRR protection using SR labels without any TE signaling. The IGP computes a post-convergence path to the destination ASSUMING the protected link/node is down, then encodes that path as a segment list.</div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:10px;font-family:var(--mono);font-size:10px;line-height:1.8">
          <div style="color:var(--cyan)">TI-LFA operation:</div>
          <div style="color:var(--muted)">1. IGP computes P-space (nodes reachable without failed link)</div>
          <div style="color:var(--muted)">2. Computes Q-space (nodes that can reach destination without failed link)</div>
          <div style="color:var(--muted)">3. Finds P-Q node (intersection = repair node)</div>
          <div style="color:var(--muted)">4. Installs pre-computed repair path in FIB</div>
          <div style="color:var(--cyan)">When primary link fails:</div>
          <div style="color:var(--muted)">5. Router immediately pushes SR labels for repair path</div>
          <div style="color:var(--muted)">6. Traffic follows pre-computed path to repair node</div>
          <div style="color:var(--green)">7. Repair node routes normally → traffic reaches destination</div>
          <div style="color:var(--muted)">8. IGP reconverges (~100-500ms) → primary path restored</div>
          <div style="margin-top:6px;color:var(--cyan)">Config:</div>
          <div style="color:var(--amber)">router ospf 1 ; segment-routing mpls ; fast-reroute per-prefix enable ; fast-reroute ti-lfa</div>
        </div>
      </div>
    </div>
    <div>
      <div class="card">
        <div class="card-hdr">SRv6 — Segment Routing over IPv6</div>
        <div class="callout callout-info" style="margin-bottom:8px">SRv6 encodes the segment list directly in the IPv6 header using a Segment Routing Header (SRH). No MPLS labels needed — pure IPv6.</div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--amber);font-weight:700">SRv6 SID FORMAT:</div>
          <div style="color:var(--text)">128-bit SID = Locator (64b) + Function (16b) + Arguments (48b)</div>
          <div style="color:var(--text)">Example: 2001:db8:100::/48 = locator for Node A</div>
          <div style="color:var(--text)">2001:db8:100::1    = End (node SID, like Node-SID in SR-MPLS)</div>
          <div style="color:var(--text)">2001:db8:100::2    = End.X (adj-SID to neighbor)</div>
          <div style="color:var(--text)">2001:db8:100::4    = End.DT4 (VPNv4 decap + lookup)</div>
          <div style="margin-top:8px;color:var(--cyan);font-weight:700">SRH (Segment Routing Header):</div>
          <div style="color:var(--muted)">IPv6 Next Header: 43 (Routing Extension Header)</div>
          <div style="color:var(--muted)">Routing Type: 4 (SRH)</div>
          <div style="color:var(--muted)">Segments Left: counter, decremented at each segment endpoint</div>
          <div style="color:var(--muted)">Segment List[0..n]: ordered SID list (last SID = destination)</div>
          <div style="color:var(--muted)">IPv6 DA = current active SID (changed at each hop)</div>
          <div style="margin-top:6px;color:var(--green)">SRv6 advantage: native IPv6 encap — works across IPv6 internet</div>
          <div style="color:var(--green)">No MPLS label stack limit — supports deep service chains</div>
          <div style="color:var(--red)">SRv6 overhead: 40B IPv6 + 8B SRH base + 16B × n segments</div>
        </div>
      </div>
      <div class="card" style="margin-top:14px">
        <div class="card-hdr">🎯 Segment Routing Interview Q&amp;A</div>
        <div class="qa-list">
          <div class="qa-item"><div class="qa-q" onclick="toggleQA(this)">Q: How does SR-TE differ from RSVP-TE and why are SPs migrating to SR?<span class="qa-arrow">▶</span></div><div class="qa-a"><strong>RSVP-TE:</strong> Every router along the TE tunnel must maintain per-LSP state (PATH/RESV messages). For 10,000 TE tunnels, every transit router has 10,000 RSVP states. Soft-state requires periodic refresh. Any topology change requires RSVP re-signaling. Head-end must do CSPF to find path. <strong>SR-TE:</strong> Only the head-end router knows the explicit path (encoded as segment list). Transit routers are completely stateless — they just forward based on the top label. No RSVP, no per-path state in the network. A path change only requires updating the head-end's segment list. <strong>Why SPs migrate:</strong> ①Massive scale — SR-TE can support millions of paths with zero transit state. ②Simplification — no RSVP, no LDP needed (single protocol). ③PCE integration — a centralized PCE can compute and push segment lists via PCEP, enabling real-time TE. ④TI-LFA automatically protects every SR-TE path using the same SR labels — no separate FRR config. ⑤Gradual migration — SR can coexist with existing LDP/RSVP.</div></div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- ═══ CCIE TAB 5: EVPN/VXLAN ═══ -->
<div id="ccie-topic-5" class="topic-panel">
  <div class="topic-hero" style="border-left:4px solid var(--cyan)">
    <div class="topic-title">🏢 EVPN &amp; VXLAN — Data Center Fabric</div>
    <div class="topic-sub">VXLAN encapsulation · BGP EVPN control plane · VTEP · Type 2/3/5 routes · Symmetric IRB · ARP suppression · DCI</div>
  </div>
  <div class="card">
    <div class="card-hdr">VXLAN Encapsulation — 50-Byte Overhead Explained</div>
    <div class="grid-2">
      <div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--amber);font-weight:700">VXLAN PACKET FORMAT (inner L2 frame):</div>
          <div style="color:var(--muted2)">Outer Ethernet Header    : 14 bytes</div>
          <div style="color:var(--muted2)">Outer IP Header          : 20 bytes</div>
          <div style="color:var(--muted2)">Outer UDP Header         : 8 bytes  (UDP dst=4789)</div>
          <div style="color:var(--cyan)">VXLAN Header             : 8 bytes  (VNI = 24-bit segment ID)</div>
          <div style="color:var(--text)">Inner Ethernet Header    : 14 bytes (original L2 frame)</div>
          <div style="color:var(--text)">Inner IP + Payload       : variable</div>
          <div style="color:var(--red)">Total overhead           : 50 bytes minimum</div>
          <div style="margin-top:8px;color:var(--cyan)">VNI (VXLAN Network Identifier):</div>
          <div style="color:var(--muted)">24-bit field → 16 million VNIs (vs 4096 VLANs)</div>
          <div style="color:var(--muted)">L2 VNI: maps to a VLAN (bridge domain) — same subnet</div>
          <div style="color:var(--muted)">L3 VNI: maps to a VRF — enables inter-VLAN routing</div>
          <div style="margin-top:8px;color:var(--amber)">VTEP (VXLAN Tunnel Endpoint):</div>
          <div style="color:var(--muted)">Physical device performing VXLAN encap/decap</div>
          <div style="color:var(--muted)">Usually: ToR (Top of Rack) switch or hypervisor vSwitch</div>
          <div style="color:var(--muted)">Identified by its loopback IP in the underlay network</div>
        </div>
      </div>
      <div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>BGP EVPN Route Type</th><th>Name</th><th>Carries</th><th>Purpose</th></tr>
          <tr><td style="color:var(--blue)">Type 1</td><td>Ethernet Auto-Discovery</td><td>ESI (Ethernet Segment ID)</td><td>Multi-homing, mass withdrawal</td></tr>
          <tr><td style="color:var(--cyan)">Type 2</td><td>MAC/IP Advertisement</td><td>MAC + IP + VNI + VTEP IP</td><td>L2 host learning (replaces flood-learn)</td></tr>
          <tr><td style="color:var(--green)">Type 3</td><td>Inclusive Multicast</td><td>VTEP IP + L2 VNI</td><td>VTEP discovery + BUM handling</td></tr>
          <tr><td style="color:var(--amber)">Type 4</td><td>Ethernet Segment</td><td>ESI + DF election</td><td>Designated Forwarder election</td></tr>
          <tr><td style="color:var(--pink)">Type 5</td><td>IP Prefix</td><td>IP prefix + L3 VNI + VTEP</td><td>Inter-subnet routing, DCI</td></tr>
        </table></div>
        <div class="callout callout-info" style="margin-top:8px">Type 2 routes replace the flood-and-learn behavior of traditional VXLAN. Instead of flooding ARP requests across all VTEPs, the BGP control plane distributes MAC/IP bindings. ARP requests are suppressed at the local VTEP — the VTEP answers ARPs itself using the BGP-learned table.</div>
      </div>
    </div>
  </div>
  <div class="grid-2" style="margin-top:14px">
    <div>
      <div class="card">
        <div class="card-hdr">Symmetric vs Asymmetric IRB</div>
        <div class="callout callout-warn" style="margin-bottom:8px">IRB = Integrated Routing and Bridging. This is how VXLAN handles inter-VLAN (inter-subnet) routing.</div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--red);font-weight:700">ASYMMETRIC IRB (simpler, but doesn't scale):</div>
          <div style="color:var(--muted)">• Local VTEP routes to destination subnet using its SVI</div>
          <div style="color:var(--muted)">• Switches to destination VNI, forwards as L2</div>
          <div style="color:var(--muted)">• Remote VTEP receives as L2 in correct VNI — no routing needed</div>
          <div style="color:var(--red)">Problem: ALL VTEPs must have ALL VLANs/SVIs configured</div>
          <div style="color:var(--red)">In large fabrics: 1000 VLANs × 100 VTEPs = 100K SVIs</div>
          <div style="margin-top:8px;color:var(--green);font-weight:700">SYMMETRIC IRB (scalable — recommended):</div>
          <div style="color:var(--muted)">• Uses L3 VNI (per VRF) for inter-subnet routing</div>
          <div style="color:var(--muted)">• Source VTEP: route in VRF, encap with L3 VNI, forward</div>
          <div style="color:var(--muted)">• Transit: forward based on outer IP (underlay)</div>
          <div style="color:var(--muted)">• Dest VTEP: decap L3 VNI, look up in VRF, switch to L2 VNI</div>
          <div style="color:var(--green)">Only need: SVIs for LOCAL subnets + 1 L3 VNI per VRF</div>
          <div style="color:var(--cyan)">Scales to any number of VLANs — remote VTEPs only need L3 VNI</div>
        </div>
      </div>
    </div>
    <div>
      <div class="card">
        <div class="card-hdr">BGP EVPN Configuration Skeleton</div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--cyan)">! Underlay (spine/leaf IGP or eBGP)</div>
          <div style="color:var(--green)">router bgp 65001</div>
          <div style="color:var(--green)"> bgp router-id 10.0.0.1</div>
          <div style="color:var(--green)"> no bgp default ipv4-unicast</div>
          <div style="color:var(--cyan)"> ! iBGP to spine (route reflector)</div>
          <div style="color:var(--green)"> neighbor 10.0.0.100 remote-as 65001</div>
          <div style="color:var(--green)"> neighbor 10.0.0.100 update-source Loopback0</div>
          <div style="color:var(--amber)"> neighbor 10.0.0.100 send-community extended</div>
          <div style="color:var(--cyan)"> ! Enable L2VPN EVPN address family</div>
          <div style="color:var(--amber)"> address-family l2vpn evpn</div>
          <div style="color:var(--amber)">  neighbor 10.0.0.100 activate</div>
          <div style="color:var(--amber)">  neighbor 10.0.0.100 send-community extended</div>
          <div style="color:var(--cyan)">! VNI to VLAN mapping (NX-OS style)</div>
          <div style="color:var(--green)">vlan 10</div>
          <div style="color:var(--amber)"> vn-segment 10010  ← L2 VNI for VLAN 10</div>
          <div style="color:var(--green)">vrf context TENANT-A</div>
          <div style="color:var(--amber)"> vni 50001         ← L3 VNI for this VRF</div>
          <div style="color:var(--amber)"> rd auto ; address-family ipv4 unicast ; route-target both auto evpn</div>
          <div style="color:var(--cyan)">! VTEP (NVE interface)</div>
          <div style="color:var(--green)">interface nve1</div>
          <div style="color:var(--amber)"> no shutdown ; source-interface loopback0</div>
          <div style="color:var(--amber)"> member vni 10010 ; suppress-arp ; ingress-replication protocol bgp</div>
          <div style="color:var(--amber)"> member vni 50001 associate-vrf</div>
        </div>
      </div>
    </div>
  </div>
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">🔬 Control Plane Protection — CoPP Configuration Deep Dive</div>
    <div class="callout callout-info">Without CoPP, a simple ping flood to any router IP can overwhelm the CPU, dropping routing protocol packets and causing network-wide outages. CoPP is mandatory in production networks.</div>
    <div class="grid-2">
      <div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--red);font-weight:700">WHY CONTROL PLANE NEEDS PROTECTION:</div>
          <div style="color:var(--muted2)">Data plane: ASICs forward at 100G+ line rate</div>
          <div style="color:var(--muted2)">Control plane: CPU processes at much lower rate</div>
          <div style="color:var(--red)">Attack: 1 Mpps ICMP to router IP → CPU 100% → OSPF hellos dropped</div>
          <div style="color:var(--red)">→ adjacencies down → routes removed → network collapse!</div>
          <div style="margin-top:8px;color:var(--cyan);font-weight:700">COPP CONFIGURATION:</div>
          <div style="color:var(--green)">ip access-list extended ROUTING</div>
          <div style="color:var(--amber)"> permit ospf any any</div>
          <div style="color:var(--amber)"> permit tcp any any eq 179   ← BGP</div>
          <div style="color:var(--amber)"> permit udp any any eq 646   ← LDP</div>
          <div style="color:var(--green)">ip access-list extended MGMT</div>
          <div style="color:var(--amber)"> permit tcp 10.0.0.0 0.0.0.255 any eq 22   ← SSH</div>
          <div style="color:var(--amber)"> permit udp 10.0.0.0 0.0.0.255 any eq 161  ← SNMP</div>
          <div style="color:var(--green)">ip access-list extended ICMP</div>
          <div style="color:var(--amber)"> permit icmp any any</div>
        </div>
      </div>
      <div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--cyan);font-weight:700">COPP POLICY-MAP + APPLY:</div>
          <div style="color:var(--green)">class-map match-all ROUTING</div>
          <div style="color:var(--amber)"> match access-group name ROUTING</div>
          <div style="color:var(--green)">class-map match-all MGMT</div>
          <div style="color:var(--amber)"> match access-group name MGMT</div>
          <div style="color:var(--green)">class-map match-all ICMP</div>
          <div style="color:var(--amber)"> match access-group name ICMP</div>
          <div> </div>
          <div style="color:var(--green)">policy-map COPP-POLICY</div>
          <div style="color:var(--green)"> class ROUTING</div>
          <div style="color:var(--amber)">  police rate 128000 bps</div>
          <div style="color:var(--amber)">   conform-action transmit</div>
          <div style="color:var(--amber)">   exceed-action drop</div>
          <div style="color:var(--green)"> class MGMT</div>
          <div style="color:var(--amber)">  police rate 32000 bps</div>
          <div style="color:var(--green)"> class ICMP</div>
          <div style="color:var(--amber)">  police rate 8000 bps</div>
          <div style="color:var(--green)"> class class-default</div>
          <div style="color:var(--amber)">  police rate 10000 bps</div>
          <div> </div>
          <div style="color:var(--green)">control-plane</div>
          <div style="color:var(--amber)"> service-policy input COPP-POLICY</div>
          <div> </div>
          <div style="color:var(--blue)">show policy-map control-plane  ← hit counts + drops</div>
        </div>
      </div>
    </div>
  </div>


</div>

<!-- ═══ CCIE TAB 6: NETWORK AUTOMATION ═══ -->
<div id="ccie-topic-6" class="topic-panel">
  <div class="topic-hero" style="border-left:4px solid var(--green)">
    <div class="topic-title">🤖 Network Automation — Python, NETCONF, YANG &amp; Ansible</div>
    <div class="topic-sub">Netmiko · NAPALM · nornir · YANG data models · RESTCONF/NETCONF · Ansible for networks · Jinja2 · gRPC telemetry · GitOps</div>
  </div>
  <div class="card">
    <div class="card-hdr">Automation Stack — SSH vs NETCONF vs gRPC</div>
    <div class="tbl-wrap"><table class="tbl">
      <tr><th>Method</th><th>Transport</th><th>Data Format</th><th>Use Case</th><th>CCIE Relevance</th></tr>
      <tr><td style="color:var(--blue)">SSH/CLI (Netmiko)</td><td>SSH</td><td>Screen scraping (regex)</td><td>Legacy devices, quick scripts</td><td>Understand limitations — not reliable for structured data</td></tr>
      <tr><td style="color:var(--cyan)">NETCONF</td><td>SSH port 830</td><td>XML (YANG-modeled)</td><td>Config management, transactions</td><td>IOS-XE/XR support, candidate datastore, rollback</td></tr>
      <tr><td style="color:var(--green)">RESTCONF</td><td>HTTPS</td><td>JSON or XML</td><td>REST API, programmable controllers</td><td>Easier than NETCONF for developers — same YANG models</td></tr>
      <tr><td style="color:var(--amber)">gRPC/gNMI</td><td>HTTP/2</td><td>Protobuf</td><td>Streaming telemetry, high-performance</td><td>OpenConfig, replacing SNMP for monitoring</td></tr>
      <tr><td style="color:var(--pink)">SNMP</td><td>UDP</td><td>ASN.1/BER</td><td>Legacy monitoring</td><td>Being replaced by gRPC telemetry</td></tr>
    </table></div>
  </div>
  <div class="grid-2" style="margin-top:14px">
    <div>
      <div class="card">
        <div class="card-hdr">Python Automation — Netmiko, NAPALM &amp; nornir</div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--blue);font-weight:700">NETMIKO — SSH, screen scraping:</div>
          <div style="color:var(--green)">from netmiko import ConnectHandler</div>
          <div style="color:var(--green)">device = {</div>
          <div style="color:var(--green)">    "device_type": "cisco_ios",</div>
          <div style="color:var(--green)">    "host": "192.168.1.1",</div>
          <div style="color:var(--green)">    "username": "admin",</div>
          <div style="color:var(--green)">    "password": "secret",</div>
          <div style="color:var(--green)">}</div>
          <div style="color:var(--amber)">with ConnectHandler(**device) as net_connect:</div>
          <div style="color:var(--amber)">    output = net_connect.send_command("show ip route")</div>
          <div style="color:var(--amber)">    net_connect.send_config_set(["interface Gi0/0", "description WAN"])</div>
          <div style="margin-top:8px;color:var(--cyan);font-weight:700">NAPALM — Multi-vendor structured data:</div>
          <div style="color:var(--green)">import napalm</div>
          <div style="color:var(--green)">driver = napalm.get_network_driver("ios")</div>
          <div style="color:var(--green)">device = driver("192.168.1.1", "admin", "secret")</div>
          <div style="color:var(--amber)">device.open()</div>
          <div style="color:var(--amber)">bgp_neighbors = device.get_bgp_neighbors()    ← structured dict!</div>
          <div style="color:var(--amber)">device.load_merge_candidate(config="...")</div>
          <div style="color:var(--amber)">diff = device.compare_config()               ← see diffs before pushing</div>
          <div style="color:var(--amber)">device.commit_config()                       ← atomic commit</div>
          <div style="margin-top:8px;color:var(--pink);font-weight:700">NORNIR — Parallel automation framework:</div>
          <div style="color:var(--muted)">Manages inventory, threading, task execution</div>
          <div style="color:var(--muted)">Run same task against 1000 devices in parallel</div>
          <div style="color:var(--green)">nr = InitNornir(config_file="config.yaml")</div>
          <div style="color:var(--amber)">result = nr.run(task=netmiko_send_command, command_string="show ver")</div>
        </div>
      </div>
      <div class="card" style="margin-top:14px">
        <div class="card-hdr">Jinja2 Templates — Config Generation at Scale</div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--cyan)">! Template: interfaces.j2</div>
          <div style="color:var(--text)">{% for intf in interfaces %}</div>
          <div style="color:var(--text)">interface {{ intf.name }}</div>
          <div style="color:var(--text)"> description {{ intf.description }}</div>
          <div style="color:var(--text)"> ip address {{ intf.ip }} {{ intf.mask }}</div>
          <div style="color:var(--text)"> {% if intf.ospf %}ip ospf 1 area {{ intf.ospf_area }}{% endif %}</div>
          <div style="color:var(--text)"> no shutdown</div>
          <div style="color:var(--text)">{% endfor %}</div>
          <div style="margin-top:8px;color:var(--cyan)">! Render in Python:</div>
          <div style="color:var(--green)">from jinja2 import Environment, FileSystemLoader</div>
          <div style="color:var(--green)">env = Environment(loader=FileSystemLoader("templates/"))</div>
          <div style="color:var(--green)">template = env.get_template("interfaces.j2")</div>
          <div style="color:var(--amber)">config = template.render(interfaces=my_data)</div>
          <div style="margin-top:6px;color:var(--muted)">my_data loaded from YAML/JSON inventory</div>
          <div style="color:var(--muted)">Same template → consistent configs across 1000 devices</div>
        </div>
      </div>
    </div>
    <div>
      <div class="card">
        <div class="card-hdr">YANG &amp; NETCONF — Structured Configuration</div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--amber);font-weight:700">YANG Model Hierarchy:</div>
          <div style="color:var(--muted)">OpenConfig   → vendor-neutral (Google-led initiative)</div>
          <div style="color:var(--muted)">Native YANG  → Cisco IOS-XE / IOS-XR native models</div>
          <div style="color:var(--muted)">IETF YANG    → RFC standard models (interfaces, routing)</div>
          <div style="margin-top:8px;color:var(--cyan);font-weight:700">NETCONF Get config via Python:</div>
          <div style="color:var(--green)">from ncclient import manager</div>
          <div style="color:var(--green)">with manager.connect(host="192.168.1.1", port=830,</div>
          <div style="color:var(--green)">                     username="admin", password="secret",</div>
          <div style="color:var(--green)">                     hostkey_verify=False) as m:</div>
          <div style="color:var(--amber)">    result = m.get_config(source="running",</div>
          <div style="color:var(--amber)">        filter=("xpath", "/native/interface"))</div>
          <div style="color:var(--amber)">    print(result.xml)</div>
          <div style="margin-top:8px;color:var(--cyan);font-weight:700">RESTCONF GET BGP config:</div>
          <div style="color:var(--green)">GET https://router/restconf/data/Cisco-IOS-XE-native:native/router/bgp</div>
          <div style="color:var(--green)">Headers: Accept: application/yang-data+json</div>
          <div style="color:var(--muted)">Returns JSON — parse with Python json module</div>
          <div style="margin-top:8px;color:var(--cyan);font-weight:700">gNMI Streaming Telemetry:</div>
          <div style="color:var(--muted)">Subscribe to interface counters every 30s:</div>
          <div style="color:var(--amber)">gnmic subscribe --path "openconfig:interfaces/interface[name=Gi0/0]/state/counters" --stream-mode sample --sample-interval 30s</div>
        </div>
      </div>
      <div class="card" style="margin-top:14px">
        <div class="card-hdr">Ansible for Networks — Idempotent Config Management</div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--cyan)">! inventory.yml</div>
          <div style="color:var(--text)">all:</div>
          <div style="color:var(--text)">  hosts:</div>
          <div style="color:var(--text)">    router1:</div>
          <div style="color:var(--text)">      ansible_host: 192.168.1.1</div>
          <div style="color:var(--text)">      ansible_network_os: ios</div>
          <div style="color:var(--text)">      ansible_user: admin</div>
          <div style="color:var(--cyan)">! playbook.yml — configure OSPF on all routers</div>
          <div style="color:var(--text)">- name: Configure OSPF</div>
          <div style="color:var(--text)">  hosts: all</div>
          <div style="color:var(--text)">  gather_facts: no</div>
          <div style="color:var(--text)">  tasks:</div>
          <div style="color:var(--amber)">    - name: Configure OSPF process</div>
          <div style="color:var(--amber)">      cisco.ios.ios_ospfv2:</div>
          <div style="color:var(--amber)">        config:</div>
          <div style="color:var(--amber)">          processes:</div>
          <div style="color:var(--amber)">            - process_id: 1</div>
          <div style="color:var(--amber)">              router_id: "{{ router_id }}"</div>
          <div style="color:var(--amber)">              network:</div>
          <div style="color:var(--amber)">                - address: 10.0.0.0</div>
          <div style="color:var(--amber)">                  wildcard_bits: 0.255.255.255</div>
          <div style="color:var(--amber)">                  area: 0</div>
          <div style="color:var(--amber)">        state: merged     ← idempotent!</div>
          <div style="color:var(--muted)">Run: ansible-playbook -i inventory.yml playbook.yml</div>
        </div>
      </div>
    </div>
  </div>
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">🔬 DMVPN Phase 2 vs Phase 3 — Spoke-to-Spoke Dynamic Tunnels</div>
    <div class="callout callout-info">DMVPN enables spokes to build dynamic IPSec tunnels directly to each other without hub involvement after initial NHRP resolution. Phase 3 adds NHRP Redirect, allowing hub-side summarization while still enabling direct spoke-to-spoke paths.</div>
    <div class="grid-2">
      <div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>Feature</th><th>Phase 1</th><th>Phase 2</th><th>Phase 3</th></tr>
          <tr><td>Spoke-to-Spoke</td><td style="color:var(--red)">No</td><td style="color:var(--green)">Yes</td><td style="color:var(--green)">Yes</td></tr>
          <tr><td>Hub summarization</td><td>Yes</td><td style="color:var(--red)">No</td><td style="color:var(--green)">Yes</td></tr>
          <tr><td>Scalability</td><td>Good</td><td>Medium</td><td style="color:var(--green)">Best</td></tr>
          <tr><td>Key feature</td><td>Simple hub+spoke</td><td>Direct S2S</td><td>NHRP Redirect</td></tr>
        </table></div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9;margin-top:10px">
          <div style="color:var(--amber);font-weight:700">PHASE 3 NHRP REDIRECT FLOW:</div>
          <div style="color:var(--muted2)">1. Spoke1 sends traffic for Spoke2 → Hub (normal)</div>
          <div style="color:var(--muted2)">2. Hub forwards to Spoke2 AND sends NHRP Redirect to Spoke1</div>
          <div style="color:var(--muted2)">   "Go directly to Spoke2 NBMA IP: x.x.x.x"</div>
          <div style="color:var(--muted2)">3. Spoke1 sends NHRP Resolution Request to Spoke2</div>
          <div style="color:var(--muted2)">4. Spoke2 replies with its public IP</div>
          <div style="color:var(--green)">5. Spoke1 builds direct IPSec tunnel to Spoke2!</div>
          <div style="color:var(--green)">6. All future Spoke1↔Spoke2 traffic: direct path</div>
        </div>
      </div>
      <div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--cyan);font-weight:700">DMVPN PHASE 3 FULL CONFIG:</div>
          <div style="color:var(--green)">! ── HUB ──</div>
          <div style="color:var(--green)">interface Tunnel0</div>
          <div style="color:var(--amber)"> ip address 10.0.0.1 255.255.255.0</div>
          <div style="color:var(--amber)"> tunnel source GigabitEthernet0/0</div>
          <div style="color:var(--amber)"> tunnel mode gre multipoint</div>
          <div style="color:var(--amber)"> ip nhrp network-id 1</div>
          <div style="color:var(--amber)"> ip nhrp authentication SECRET</div>
          <div style="color:var(--amber)"> ip nhrp map multicast dynamic</div>
          <div style="color:var(--amber)"> ip nhrp redirect               ← PHASE 3!</div>
          <div> </div>
          <div style="color:var(--green)">! ── SPOKE ──</div>
          <div style="color:var(--green)">interface Tunnel0</div>
          <div style="color:var(--amber)"> ip address 10.0.0.2 255.255.255.0</div>
          <div style="color:var(--amber)"> tunnel source GigabitEthernet0/0</div>
          <div style="color:var(--amber)"> tunnel mode gre multipoint</div>
          <div style="color:var(--amber)"> ip nhrp network-id 1</div>
          <div style="color:var(--amber)"> ip nhrp nhs 1.2.3.4            ← hub WAN IP</div>
          <div style="color:var(--amber)"> ip nhrp map 10.0.0.1 1.2.3.4  ← overlay→underlay</div>
          <div style="color:var(--amber)"> ip nhrp map multicast 1.2.3.4</div>
          <div style="color:var(--amber)"> ip nhrp shortcut               ← PHASE 3!</div>
          <div> </div>
          <div style="color:var(--blue)">show dmvpn detail               ← tunnel state + NHRP</div>
          <div style="color:var(--blue)">show ip nhrp                    ← NHRP mappings</div>
        </div>
      </div>
    </div>
  </div>


</div>

<!-- ═══ CCIE TAB 7: IS-IS ═══ -->
<div id="ccie-topic-7" class="topic-panel">
  <div class="topic-hero" style="border-left:4px solid var(--amber)">
    <div class="topic-title">📡 IS-IS — Intermediate System to Intermediate System</div>
    <div class="topic-sub">OSI NSAP/NET addressing · PDU types · L1/L2/L1L2 routers · Route leaking · DIS election · TLV extensibility · Multi-topology</div>
  </div>
  <div class="card">
    <div class="card-hdr">IS-IS vs OSPF — Why Service Providers Prefer IS-IS</div>
    <div class="tbl-wrap"><table class="tbl">
      <tr><th>Feature</th><th>OSPF</th><th>IS-IS</th><th>IS-IS Advantage</th></tr>
      <tr><td>Runs on top of</td><td style="color:var(--amber)">IP (protocol 89)</td><td style="color:var(--green)">L2 directly (OSI CLNP)</td><td>IP routing problem can't break IS-IS — it runs under IP!</td></tr>
      <tr><td>Area hierarchy</td><td>Area + backbone area 0</td><td>L1 area + L2 backbone</td><td>Simpler — L2 IS IS the backbone</td></tr>
      <tr><td>Adjacency on segment</td><td>DR/BDR only go FULL</td><td>All form adjacency (DIS replaces DR)</td><td>No BDR — DIS handles LSP flooding</td></tr>
      <tr><td>Extensibility</td><td>Opaque LSAs (awkward)</td><td>New TLVs — just add (no version change)</td><td>SR, TE, IPv6 all added via TLVs</td></tr>
      <tr><td>IPv6</td><td>OSPFv3 (separate process)</td><td>Multi-topology (same process!)</td><td>MT-IS-IS: one adjacency, two topologies</td></tr>
      <tr><td>Large network scale</td><td>Limited (SPF complexity)</td><td>Preferred for SP backbone (flat L2)</td><td>T-Systems, Level3, AT&amp;T use IS-IS</td></tr>
    </table></div>
  </div>
  <div class="grid-2" style="margin-top:14px">
    <div>
      <div class="card">
        <div class="card-hdr">IS-IS Addressing — NSAP and NET</div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10.5px;line-height:2">
          <div style="color:var(--amber);font-weight:700">NET (Network Entity Title) FORMAT:</div>
          <div style="color:var(--text)">49.0001.0100.0000.0001.00</div>
          <div style="color:var(--cyan)">├── 49      ← AFI (Authority Format Identifier): 49 = private</div>
          <div style="color:var(--cyan)">├── 0001    ← Area ID (variable length, 1-13 bytes)</div>
          <div style="color:var(--cyan)">├── 0100.0000.0001 ← System ID (6 bytes — like a MAC address)</div>
          <div style="color:var(--cyan)">└── 00      ← NSEL (always 00 for routers)</div>
          <div style="margin-top:8px;color:var(--muted)">Practical System ID: use router loopback</div>
          <div style="color:var(--text)">Loopback: 10.0.0.1 → System ID: 0100.0000.0001</div>
          <div style="color:var(--text)">Loopback: 10.0.0.2 → System ID: 0100.0000.0002</div>
          <div style="color:var(--cyan)">! Cisco IOS-XR config:</div>
          <div style="color:var(--green)">router isis CORE</div>
          <div style="color:var(--amber)"> net 49.0001.0100.0000.0001.00</div>
          <div style="color:var(--amber)"> is-type level-2-only        ← backbone router (SP)</div>
          <div style="color:var(--green)"> interface GigabitEthernet0/0</div>
          <div style="color:var(--amber)">  isis circuit-type level-2-only</div>
          <div style="color:var(--amber)">  isis metric 10</div>
        </div>
      </div>
      <div class="card" style="margin-top:14px">
        <div class="card-hdr">L1/L2 Router Types &amp; Route Leaking</div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>Type</th><th>Adjacency</th><th>LSDB</th><th>Use</th></tr>
          <tr><td style="color:var(--blue)">L1 (L1-only)</td><td>L1 same area only</td><td>L1 LSDB</td><td>Edge router in area</td></tr>
          <tr><td style="color:var(--cyan)">L2 (L2-only)</td><td>L2 any area</td><td>L2 LSDB</td><td>Backbone router</td></tr>
          <tr><td style="color:var(--amber)">L1L2 (ABR equiv)</td><td>Both L1+L2</td><td>Both LSDBs</td><td>Area border router</td></tr>
        </table></div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:10px;font-family:var(--mono);font-size:10px;line-height:1.8;margin-top:8px">
          <div style="color:var(--red)">L1 routers know their area topology + default route to L1L2</div>
          <div style="color:var(--red)">L1 routers do NOT know inter-area routes (like OSPF totally stub)</div>
          <div style="color:var(--cyan)">ROUTE LEAKING (L2→L1): inject specific L2 routes into L1</div>
          <div style="color:var(--amber)">address-family ipv4 unicast</div>
          <div style="color:var(--amber)"> propagate-level { 2 into 1 } route-policy LEAK-TO-L1</div>
          <div style="color:var(--muted)">Use case: leak specific prefixes to L1 for more precise routing</div>
          <div style="color:var(--muted)">instead of just a default route</div>
        </div>
      </div>
    </div>
    <div>
      <div class="card">
        <div class="card-hdr">IS-IS PDU Types &amp; TLV Architecture</div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>PDU</th><th>Full Name</th><th>Purpose</th></tr>
          <tr><td style="color:var(--blue)">IIH</td><td>IS-IS Hello</td><td>Neighbor discovery, adjacency maintenance (LAN vs P2P IIH)</td></tr>
          <tr><td style="color:var(--cyan)">LSP</td><td>Link State PDU</td><td>Carries topology (like OSPF LSA). L1-LSP and L2-LSP separate.</td></tr>
          <tr><td style="color:var(--green)">CSNP</td><td>Complete Sequence Number PDU</td><td>Sent by DIS — describes entire LSDB. Used for sync.</td></tr>
          <tr><td style="color:var(--amber)">PSNP</td><td>Partial Sequence Number PDU</td><td>Acknowledge LSP receipt OR request missing LSPs</td></tr>
        </table></div>
        <div class="callout callout-info" style="margin-top:8px"><strong>TLV extensibility — IS-IS's biggest advantage:</strong> IS-IS PDUs carry information as TLVs (Type-Length-Value). New protocols just add new TLVs — no version change needed. SR-MPLS added TLV 22/23 for adj-SID, TLV 135 for prefix-SID. IPv6 added TLV 232. OSPF required separate opaque LSAs and eventually a new version (OSPFv3) for IPv6. IS-IS just added a TLV.</div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:10px;font-family:var(--mono);font-size:10px;line-height:1.8;margin-top:8px">
          <div style="color:var(--cyan)">DIS (Designated IS) vs OSPF DR:</div>
          <div style="color:var(--muted)">IS-IS: ALL routers form adjacency with each other on LAN</div>
          <div style="color:var(--muted)">DIS sends CSNPs to keep all routers in sync</div>
          <div style="color:var(--muted)">NO backup DIS (unlike OSPF BDR)</div>
          <div style="color:var(--muted)">DIS preemption: higher priority IMMEDIATELY becomes DIS</div>
          <div style="color:var(--muted)">Election: priority (highest) → MAC address (highest)</div>
        </div>
      </div>
      <div class="card" style="margin-top:14px">
        <div class="card-hdr">🎯 IS-IS Interview Q&amp;A</div>
        <div class="qa-list">
          <div class="qa-item"><div class="qa-q" onclick="toggleQA(this)">Q: Why does IS-IS run on top of L2 while OSPF runs on top of IP, and why does that matter?<span class="qa-arrow">▶</span></div><div class="qa-a">IS-IS was designed as part of the OSI protocol suite. It uses OSI's CLNP (Connectionless Network Protocol) addressing and runs directly over Layer 2. This gives IS-IS a critical operational advantage: if the IP routing table is empty or broken, IS-IS can still run and rebuild the routing table, because it doesn't depend on IP for its own transport. OSPF, by contrast, runs as IP protocol number 89 — if you have a routing problem severe enough to break all IP forwarding, OSPF packets can't travel either. This was a significant concern in large SP networks during network reconvergence events. In practice, both protocols usually converge fine, but IS-IS's immunity to IP-level problems is why major Internet backbone operators (AT&T, Deutsche Telekom, etc.) chose IS-IS over OSPF. The second advantage is that IS-IS uses binary encoding (TLVs) and doesn't rely on IP headers, making it slightly more efficient and easier to extend. For IPv6: IS-IS just adds new TLVs in the same process (Multi-Topology IS-IS) — one process, one adjacency, two topologies. OSPFv3 is a completely separate process from OSPFv2.</div></div>
        </div>
      </div>
    </div>
  </div>
  <div class="card" style="margin-top:14px">
    <div class="card-hdr">🔬 Segment Routing — SR-MPLS vs SRv6 Architecture</div>
    <div class="callout callout-info">Segment Routing replaces LDP, RSVP-TE, and BGP-LU with a single, simplified architecture. Traffic engineering is encoded in the packet itself (segment list), not in per-flow state on every transit router.</div>
    <div class="grid-2">
      <div>
        <div class="tbl-wrap"><table class="tbl">
          <tr><th>Feature</th><th>Traditional MPLS</th><th>SR-MPLS</th><th>SRv6</th></tr>
          <tr><td>Signaling</td><td>LDP + RSVP-TE</td><td style="color:var(--green)">IGP only</td><td style="color:var(--green)">IGP only</td></tr>
          <tr><td>Transit state</td><td>Per-flow RSVP</td><td style="color:var(--green)">Stateless</td><td style="color:var(--green)">Stateless</td></tr>
          <tr><td>Header</td><td>MPLS label stack</td><td>MPLS stack</td><td style="color:var(--blue)">IPv6 SRH</td></tr>
          <tr><td>TE</td><td>RSVP-TE (complex)</td><td style="color:var(--green)">SR Policy (simple)</td><td style="color:var(--green)">SR Policy</td></tr>
          <tr><td>IPv6 native</td><td>No</td><td>No</td><td style="color:var(--green)">Yes</td></tr>
          <tr><td>Deployment</td><td>Mature</td><td style="color:var(--green)">Growing rapidly</td><td style="color:var(--amber)">IPv6 core req'd</td></tr>
        </table></div>
      </div>
      <div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--cyan);font-weight:700">SR-MPLS CONFIGURATION (IOS-XE):</div>
          <div style="color:var(--green)">! Enable SR on OSPF:</div>
          <div style="color:var(--amber)">router ospf 1</div>
          <div style="color:var(--amber)"> segment-routing mpls</div>
          <div> </div>
          <div style="color:var(--green)">! Assign node SID (prefix SID):</div>
          <div style="color:var(--amber)">router ospf 1</div>
          <div style="color:var(--amber)"> prefix-sid index 100        ← router's unique SID</div>
          <div> </div>
          <div style="color:var(--green)">! Create SR Traffic Engineering Policy:</div>
          <div style="color:var(--amber)">segment-routing traffic-eng</div>
          <div style="color:var(--amber)"> policy EXPLICIT-PATH</div>
          <div style="color:var(--amber)">  color 100 end-point 5.5.5.5</div>
          <div style="color:var(--amber)">  candidate-paths</div>
          <div style="color:var(--amber)">   preference 100</div>
          <div style="color:var(--amber)">    explicit segment-list R1-R2-R4</div>
          <div> </div>
          <div style="color:var(--blue)">show segment-routing mpls connected-prefix-sid-map</div>
          <div style="color:var(--blue)">show segment-routing traffic-eng policy</div>
          <div style="color:var(--blue)">show mpls forwarding-table labels 16100</div>
        </div>
      </div>
    </div>
  </div>


</div>

<!-- ═══ CCIE TAB 8: ADVANCED BGP ═══ -->
<div id="ccie-topic-8" class="topic-panel">
  <div class="topic-hero" style="border-left:4px solid var(--blue)">
    <div class="topic-title">🔧 Advanced BGP — Route Reflectors, Communities &amp; PIC</div>
    <div class="topic-sub">RR cluster architecture · Confederations · BGP communities · AS-PATH manipulation · BGP PIC · Graceful Restart · BGP Add-Paths · FlowSpec</div>
  </div>
  <div class="grid-2">
    <div>
      <div class="card">
        <div class="card-hdr">Route Reflectors — Scaling iBGP Without Full Mesh</div>
        <div class="callout callout-info" style="margin-bottom:8px">iBGP requires full mesh (every iBGP router peers with every other). In a 100-router AS: 100×99/2 = 4,950 peerings. Route Reflectors eliminate the full mesh.</div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--amber);font-weight:700">RR REFLECTION RULES:</div>
          <div style="color:var(--cyan)">RR receives from eBGP peer → reflects to ALL iBGP clients + non-clients</div>
          <div style="color:var(--cyan)">RR receives from RR Client → reflects to eBGP + other clients + non-clients</div>
          <div style="color:var(--cyan)">RR receives from non-client iBGP → reflects to RR clients ONLY</div>
          <div style="color:var(--red)">RR does NOT change NEXT_HOP when reflecting (unlike eBGP)</div>
          <div style="color:var(--red)">Clients must have IGP reachability to all next-hops!</div>
          <div style="margin-top:8px;color:var(--amber);font-weight:700">LOOP PREVENTION ATTRIBUTES:</div>
          <div style="color:var(--muted)">ORIGINATOR_ID: RID of the first RR that reflected this route</div>
          <div style="color:var(--muted)">→ If received back (routing loop), discard based on matching own RID</div>
          <div style="color:var(--muted)">CLUSTER_LIST: list of cluster IDs the route passed through</div>
          <div style="color:var(--muted)">→ If own cluster ID seen, discard (loop prevention between RRs)</div>
          <div style="margin-top:8px;color:var(--cyan)">! RR Config:</div>
          <div style="color:var(--green)">router bgp 65000</div>
          <div style="color:var(--green)"> neighbor 10.0.0.2 remote-as 65000</div>
          <div style="color:var(--amber)"> neighbor 10.0.0.2 route-reflector-client</div>
          <div style="color:var(--amber)"> bgp cluster-id 1   ← needed when 2+ RRs in same cluster</div>
        </div>
      </div>
      <div class="card" style="margin-top:14px">
        <div class="card-hdr">BGP Communities — Tagging for Policy</div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--blue);font-weight:700">WELL-KNOWN COMMUNITIES (RFC 1997):</div>
          <div style="color:var(--red)">NO_EXPORT (0xFFFFFF01)   ← don't advertise to eBGP peers</div>
          <div style="color:var(--red)">NO_ADVERTISE (0xFFFFFF02) ← don't advertise to ANY peer</div>
          <div style="color:var(--amber)">LOCAL_AS (0xFFFFFF03)    ← don't advertise outside confederation sub-AS</div>
          <div style="margin-top:8px;color:var(--cyan);font-weight:700">REGULAR COMMUNITIES (AS:VALUE format):</div>
          <div style="color:var(--text)">65000:100 ← "this prefix belongs to customer 100"</div>
          <div style="color:var(--text)">65000:666 ← "blackhole this prefix" (ISP convention)</div>
          <div style="color:var(--text)">65000:200 ← "set local-pref 200 on receive"</div>
          <div style="margin-top:8px;color:var(--green);font-weight:700">LARGE COMMUNITIES (RFC 8092 — 4-byte ASN support):</div>
          <div style="color:var(--text)">131072:100:200 ← Global Admin : Local Data 1 : Local Data 2</div>
          <div style="margin-top:8px;color:var(--cyan)">! Set and match communities:</div>
          <div style="color:var(--green)">route-map TAG-CUSTOMER permit 10</div>
          <div style="color:var(--amber)"> set community 65000:100 additive</div>
          <div style="color:var(--green)">route-map PROCESS-COMMUNITY permit 10</div>
          <div style="color:var(--amber)"> match community COMM-LIST-100</div>
          <div style="color:var(--amber)"> set local-preference 200</div>
          <div style="color:var(--green)">ip community-list standard COMM-LIST-100 permit 65000:100</div>
          <div style="color:var(--muted)">neighbor X send-community both ← required to send communities!</div>
        </div>
      </div>
    </div>
    <div>
      <div class="card">
        <div class="card-hdr">BGP PIC — Prefix Independent Convergence</div>
        <div class="callout callout-info" style="margin-bottom:8px">Traditional BGP convergence: when primary next-hop fails, BGP withdraws route, installs backup — takes 100ms-5s. BGP PIC pre-installs backup paths in FIB, enabling sub-50ms failover.</div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--cyan)">PIC EDGE (external BGP failover):</div>
          <div style="color:var(--muted)">Two eBGP paths: Path-A (primary) + Path-B (backup)</div>
          <div style="color:var(--muted)">PIC pre-installs Path-B in FIB as backup</div>
          <div style="color:var(--muted)">When Path-A NH fails: FIB switches to Path-B instantly</div>
          <div style="color:var(--muted)">BGP convergence still happens in background (slower)</div>
          <div style="color:var(--green)">bgp additional-paths install</div>
          <div style="color:var(--green)">bgp additional-paths select best 2</div>
          <div style="margin-top:8px;color:var(--cyan)">PIC CORE (iBGP PE failover in MPLS VPN):</div>
          <div style="color:var(--muted)">PE router has two paths to same VPN prefix (via two remote PEs)</div>
          <div style="color:var(--muted)">Pre-installed in FIB → PE failure = instant switchover</div>
          <div style="margin-top:8px;color:var(--amber)">BGP ADD-PATHS (RFC 7911):</div>
          <div style="color:var(--muted)">Normally BGP advertises only ONE best path per prefix</div>
          <div style="color:var(--muted)">Add-Paths: advertise MULTIPLE paths for same prefix</div>
          <div style="color:var(--muted)">RR clients get backup paths pre-loaded → PIC Edge</div>
          <div style="color:var(--green)">neighbor X additional-paths send ; additional-paths receive</div>
          <div style="color:var(--green)">address-family ipv4 ; bgp additional-paths select best 3</div>
        </div>
      </div>
      <div class="card" style="margin-top:14px">
        <div class="card-hdr">BGP Graceful Restart &amp; Long-Lived Graceful Restart</div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:10px;font-family:var(--mono);font-size:10px;line-height:1.8">
          <div style="color:var(--cyan)">GRACEFUL RESTART (RFC 4724):</div>
          <div style="color:var(--muted)">BGP process restarts but forwarding plane continues</div>
          <div style="color:var(--muted)">Restarting router: signals GR capability in OPEN message</div>
          <div style="color:var(--muted)">Helper routers: keep forwarding for restart time (default 120s)</div>
          <div style="color:var(--muted)">Restarting router: re-establishes session, re-syncs table</div>
          <div style="color:var(--green)">bgp graceful-restart</div>
          <div style="color:var(--green)">bgp graceful-restart restart-time 120</div>
          <div style="color:var(--green)">bgp graceful-restart stalepath-time 360</div>
          <div style="margin-top:6px;color:var(--cyan)">LLGR (Long-Lived Graceful Restart, RFC 9494):</div>
          <div style="color:var(--muted)">Extends GR to hours/days — for planned maintenance</div>
          <div style="color:var(--muted)">Stale routes marked with LLGR_STALE community</div>
          <div style="color:var(--muted)">Only used as last resort — proper paths preferred</div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- ═══ CCIE TAB 9: MPLS-TE ═══ -->
<div id="ccie-topic-9" class="topic-panel">
  <div class="topic-hero" style="border-left:4px solid var(--red)">
    <div class="topic-title">🚦 MPLS Traffic Engineering — RSVP-TE, CSPF &amp; Fast Reroute</div>
    <div class="topic-sub">RSVP PATH/RESV messages · ERO · CSPF algorithm · Bandwidth reservation · FRR one-to-one vs facility backup · TE tunnel interaction with IGP</div>
  </div>
  <div class="card">
    <div class="card-hdr">MPLS-TE Architecture — Why TE Exists</div>
    <div class="callout callout-info">IP routing follows shortest paths (lowest cost). MPLS-TE forces traffic onto SPECIFIC paths regardless of IGP costs — enabling bandwidth guarantees, optimizing link utilization, and providing guaranteed backup paths. Critical for SP voice/video SLAs.</div>
    <div class="tbl-wrap"><table class="tbl">
      <tr><th>Component</th><th>Role</th><th>Protocol</th></tr>
      <tr><td style="color:var(--blue)">CSPF (Constrained Shortest Path First)</td><td>Compute path meeting constraints (BW, affinity, SRLG)</td><td>Runs on head-end, uses TE-extended LSDB</td></tr>
      <tr><td style="color:var(--cyan)">RSVP-TE (Resource Reservation Protocol)</td><td>Signal and establish the LSP along computed path</td><td>PATH (head→tail) + RESV (tail→head)</td></tr>
      <tr><td style="color:var(--amber)">OSPF-TE / IS-IS-TE</td><td>Flood bandwidth + TE metric in LSAs/LSPs</td><td>OSPF Opaque Type 10 / IS-IS TE TLVs</td></tr>
      <tr><td style="color:var(--green)">FRR (Fast Reroute)</td><td>Pre-signal backup bypass tunnel for sub-50ms failover</td><td>RSVP-TE with detour/facility signaling</td></tr>
    </table></div>
  </div>
  <div class="grid-2" style="margin-top:14px">
    <div>
      <div class="card">
        <div class="card-hdr">RSVP-TE Signaling — PATH &amp; RESV Deep Dive</div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--blue);font-weight:700">PATH MESSAGE (head-end → tail-end):</div>
          <div style="color:var(--muted)">Carries: Session (tunnel endpoint + ID) + PHOP (previous hop)</div>
          <div style="color:var(--cyan)">ERO (Explicit Route Object): list of hops to follow</div>
          <div style="color:var(--text)"> {Strict: 10.0.1.1, Strict: 10.0.2.1, Loose: 10.0.3.1}</div>
          <div style="color:var(--muted)">Strict = must go through that exact next-hop</div>
          <div style="color:var(--muted)">Loose = go toward that destination (IGP decides)</div>
          <div style="color:var(--muted)">LABEL_REQUEST: request a label from tail</div>
          <div style="color:var(--muted)">SESSION_ATTRIBUTE: priority, preemption, affinity bits</div>
          <div style="margin-top:6px;color:var(--green);font-weight:700">RESV MESSAGE (tail-end → head-end):</div>
          <div style="color:var(--muted)">Carries: FLOWSPEC (requested BW) + LABEL (assigned label)</div>
          <div style="color:var(--cyan)">Each router allocates BW + assigns label → upstream</div>
          <div style="color:var(--muted)">RECORD_ROUTE: records actual path taken</div>
          <div style="color:var(--muted)">Soft state: PATH/RESV refreshed every 30s (default)</div>
          <div style="color:var(--red)">If refresh stops: reservation times out after 3.5× refresh</div>
          <div style="margin-top:6px;color:var(--amber)">! Head-end config (IOS-XE):</div>
          <div style="color:var(--green)">interface Tunnel1</div>
          <div style="color:var(--amber)"> ip unnumbered Loopback0</div>
          <div style="color:var(--amber)"> tunnel mode mpls traffic-eng</div>
          <div style="color:var(--amber)"> tunnel destination 10.0.0.5</div>
          <div style="color:var(--amber)"> tunnel mpls traffic-eng bandwidth 100000   ← 100Mbps reserved</div>
          <div style="color:var(--amber)"> tunnel mpls traffic-eng path-option 10 dynamic  ← CSPF</div>
          <div style="color:var(--amber)"> tunnel mpls traffic-eng path-option 20 explicit name BACKUP</div>
          <div style="color:var(--amber)"> tunnel mpls traffic-eng fast-reroute</div>
        </div>
      </div>
    </div>
    <div>
      <div class="card">
        <div class="card-hdr">FRR — One-to-One vs Facility Backup</div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:12px;font-family:var(--mono);font-size:10px;line-height:1.9">
          <div style="color:var(--red);font-weight:700">ONE-TO-ONE (DETOUR) BACKUP:</div>
          <div style="color:var(--muted)">Each protected LSP has its OWN detour LSP</div>
          <div style="color:var(--muted)">10 protected LSPs = 10 detour LSPs</div>
          <div style="color:var(--muted)">Detour merges back into primary after the failure point</div>
          <div style="color:var(--red)">State per protected LSP = doesn't scale (1000 LSPs = 1000 detours)</div>
          <div style="margin-top:8px;color:var(--green);font-weight:700">FACILITY BACKUP (BYPASS TUNNEL) — RECOMMENDED:</div>
          <div style="color:var(--muted)">ONE bypass tunnel protects ALL LSPs on a given link/node</div>
          <div style="color:var(--muted)">PLR (Point of Local Repair): router upstream of failure</div>
          <div style="color:var(--muted)">MP (Merge Point): router downstream of failure</div>
          <div style="color:var(--cyan)">On failure: PLR pushes BYPASS tunnel label on ALL affected LSPs</div>
          <div style="color:var(--cyan)">Bypass carries them around the failure → MP pops bypass label</div>
          <div style="color:var(--green)">1000 LSPs protected by 1 bypass = massive state savings</div>
          <div style="margin-top:8px;color:var(--amber)">! PLR bypass tunnel config:</div>
          <div style="color:var(--green)">interface Tunnel100           ← bypass tunnel</div>
          <div style="color:var(--amber)"> tunnel mpls traffic-eng path-option 10 dynamic</div>
          <div style="color:var(--amber)"> tunnel mpls traffic-eng bandwidth 500000</div>
          <div style="color:var(--amber)"> tunnel mpls traffic-eng fast-reroute</div>
          <div style="color:var(--amber)">mpls traffic-eng fast-reroute</div>
          <div style="color:var(--amber)">interface GigabitEthernet0/0</div>
          <div style="color:var(--amber)"> mpls traffic-eng backup-path Tunnel100  ← protect this link</div>
        </div>
      </div>
      <div class="card" style="margin-top:14px">
        <div class="card-hdr">🎯 MPLS-TE Interview Q&amp;A</div>
        <div class="qa-list">
          <div class="qa-item"><div class="qa-q" onclick="toggleQA(this)">Q: MPLS-TE tunnel is up but traffic is not going through it. What are the possible causes?<span class="qa-arrow">▶</span></div><div class="qa-a">A common misunderstanding: a TE tunnel being UP (RSVP established, label assigned) does NOT automatically mean traffic uses it. Traffic only enters the tunnel if: ①<strong>Autoroute announce:</strong> <code>tunnel mpls traffic-eng autoroute announce</code> makes the tunnel appear as an IGP next-hop. Without this, the routing table doesn't see the tunnel as a path. ②<strong>Autoroute metric:</strong> If autoroute is configured but the tunnel metric is higher than the regular IGP path, IGP still wins. Set <code>tunnel mpls traffic-eng autoroute metric absolute 1</code> to force preference. ③<strong>Forwarding adjacency:</strong> Advertises the tunnel as a link into the IGP LSDB — more powerful than autoroute, allows SPF to compute paths across the tunnel. ④<strong>Static route or PBR:</strong> Explicitly route traffic into the tunnel with <code>ip route x.x.x.x y.y.y.y Tunnel1</code>. ⑤Check: <code>show mpls traffic-eng tunnels brief</code> — look at "Admin: up Oper: up" AND "Inuse". "Inuse" means traffic is actually flowing. Debug: <code>debug mpls traffic-eng events</code>.</div></div>
        </div>
      </div>
    </div>
  </div>
</div>

</div><!-- /page-ccie -->
`;

  /* ─── Inject all course pages into #content ───────────────────── */
  function injectCourses() {
    // Inject HTML into placeholder divs if they exist and are empty
    function inject(id, html) {
      const el = document.getElementById(id);
      if (el && el.innerHTML.trim() === '') {
        el.outerHTML = html;
      }
    }

    inject('page-ccna',  ccnaHTML);
    inject('page-ccnp',  ccnpHTML);
    inject('page-ccie',  ccieHTML);
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectCourses);
  } else {
    injectCourses();
  }

})();