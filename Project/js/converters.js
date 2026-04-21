/**
 * converters.js — Network Unit Converters for SubnetLab Pro
 * 10 converters: Data Size, Bandwidth, Transfer Time, BDP,
 *                MTU/Packet, Binary/Hex/Dec, Number Base,
 *                QoS Bandwidth, Throughput/Goodput, Protocol Timers
 * Drop into: Project/js/converters.js
 * Add to index.html: <script src="Project/js/converters.js"></script>
 * Add nav button + <div id="page-converters" class="page"></div>
 */

(function () {

    /* ── HTML ───────────────────────────────────────────────────────────────── */
    const convertersHTML = `
    <div class="page fade-up" id="page-converters">
    
      <div class="page-header" style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:10px">
        <div>
          <div class="page-title">⚡ Network Unit Converters</div>
          <div class="page-desc">10 real-time converters — Data Size · Bandwidth · Transfer Time · BDP · MTU · Binary/Hex · QoS · Goodput · Timers · Number Base</div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:4px">
          <span style="font-family:var(--mono);font-size:10px;padding:5px 12px;border-radius:20px;background:rgba(56,217,192,0.12);border:1px solid rgba(56,217,192,0.3);color:var(--cyan)">10 Converters</span>
          <span style="font-family:var(--mono);font-size:10px;padding:5px 12px;border-radius:20px;background:rgba(91,156,246,0.12);border:1px solid rgba(91,156,246,0.3);color:var(--blue)">Real-time</span>
        </div>
      </div>
    
      <!-- Tab bar -->
      <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:18px;padding:4px;background:var(--bg2);border-radius:12px;border:1px solid var(--border)">
        <button class="course-tab active" id="conv-tab-0" onclick="showConverter(0)">📦 Data Size</button>
        <button class="course-tab" id="conv-tab-1" onclick="showConverter(1)">🚀 Bandwidth</button>
        <button class="course-tab" id="conv-tab-2" onclick="showConverter(2)">⏱️ Transfer Time</button>
        <button class="course-tab" id="conv-tab-3" onclick="showConverter(3)">🌐 BDP</button>
        <button class="course-tab" id="conv-tab-4" onclick="showConverter(4)">📏 MTU / Packet</button>
        <button class="course-tab" id="conv-tab-5" onclick="showConverter(5)">🔢 Binary / Hex</button>
        <button class="course-tab" id="conv-tab-6" onclick="showConverter(6)">🔣 Number Base</button>
        <button class="course-tab" id="conv-tab-7" onclick="showConverter(7)">📊 QoS Bandwidth</button>
        <button class="course-tab" id="conv-tab-8" onclick="showConverter(8)">📈 Throughput</button>
        <button class="course-tab" id="conv-tab-9" onclick="showConverter(9)">⏲️ Protocol Timers</button>
      </div>
    
      <!-- ══ TAB 0: DATA SIZE ══════════════════════════════════════════════ -->
      <div id="conv-panel-0" class="topic-panel active-panel">
        <div class="topic-hero" style="border-left:4px solid var(--cyan)">
          <div class="topic-title">📦 Data Size Converter</div>
          <div class="topic-sub">Bits · Bytes · KB · MB · GB · TB · PB — Decimal (SI) and Binary (IEC) side-by-side</div>
        </div>
    
        <div class="card">
          <div class="card-hdr">Enter a value to convert</div>
          <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:18px">
            <input id="ds-input" type="number" value="1" min="0" step="any"
              oninput="calcDataSize()"
              style="width:160px;padding:10px 14px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-family:var(--mono);font-size:15px;outline:none">
            <select id="ds-unit" onchange="calcDataSize()"
              style="padding:10px 14px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-family:var(--mono);font-size:13px;outline:none">
              <option value="bit">Bits (b)</option>
              <option value="B">Bytes (B)</option>
              <option value="KB">Kilobytes (KB)</option>
              <option value="MB">Megabytes (MB)</option>
              <option value="GB" selected>Gigabytes (GB)</option>
              <option value="TB">Terabytes (TB)</option>
              <option value="PB">Petabytes (PB)</option>
              <option value="EB">Exabytes (EB)</option>
              <option value="KiB">Kibibytes (KiB)</option>
              <option value="MiB">Mebibytes (MiB)</option>
              <option value="GiB">Gibibytes (GiB)</option>
              <option value="TiB">Tebibytes (TiB)</option>
            </select>
            <button onclick="document.getElementById('ds-input').value=1;calcDataSize()"
              style="padding:10px 16px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;color:var(--muted2);font-family:var(--mono);font-size:11px;cursor:pointer">↺ Reset</button>
          </div>
    
          <!-- Quick presets -->
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px">
            <span style="font-family:var(--mono);font-size:10px;color:var(--muted);margin-right:4px;align-self:center">Presets:</span>
            ${[['1 KB','1','KB'],['1 MB','1','MB'],['1 GB','1','GB'],['1 TB','1','TB'],['1 GiB','1','GiB'],['650 MB (CD)','650','MB'],['4.7 GB (DVD)','4.7','GB'],['25 GB (Blu-ray)','25','GB'],['1 PB','1','PB']].map(([label,v,u])=>
              `<button onclick="setDS(${v},'${u}')" style="padding:5px 10px;background:rgba(56,217,192,0.08);border:1px solid rgba(56,217,192,0.2);border-radius:6px;color:var(--cyan);font-family:var(--mono);font-size:10px;cursor:pointer">${label}</button>`
            ).join('')}
          </div>
    
          <div class="grid-2" style="gap:16px">
            <!-- Decimal SI -->
            <div>
              <div style="font-family:var(--mono);font-size:10px;font-weight:700;color:var(--blue);margin-bottom:10px;text-transform:uppercase;letter-spacing:1px">📐 Decimal (SI) — Powers of 1000</div>
              <div id="ds-si" style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;overflow:hidden"></div>
              <div style="font-size:10px;color:var(--muted);margin-top:6px">1 KB = 1,000 B · 1 MB = 1,000,000 B · 1 GB = 1,000,000,000 B</div>
            </div>
            <!-- Binary IEC -->
            <div>
              <div style="font-family:var(--mono);font-size:10px;font-weight:700;color:var(--amber);margin-bottom:10px;text-transform:uppercase;letter-spacing:1px">🔢 Binary (IEC) — Powers of 1024</div>
              <div id="ds-iec" style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;overflow:hidden"></div>
              <div style="font-size:10px;color:var(--muted);margin-top:6px">1 KiB = 1,024 B · 1 MiB = 1,048,576 B · 1 GiB = 1,073,741,824 B</div>
            </div>
          </div>
    
          <div class="callout callout-info" style="margin-top:14px">
            💡 <strong>Why two systems?</strong> Storage manufacturers use SI (1 GB = 10⁹ bytes) while OS and memory use IEC (1 GiB = 2³⁰ bytes). A "1 TB" hard drive = 0.909 TiB — that's why Windows shows less than the box says!
          </div>
        </div>
      </div>
    
      <!-- ══ TAB 1: BANDWIDTH ═══════════════════════════════════════════════ -->
      <div id="conv-panel-1" class="topic-panel">
        <div class="topic-hero" style="border-left:4px solid var(--green)">
          <div class="topic-title">🚀 Bandwidth / Speed Converter</div>
          <div class="topic-sub">bps · Kbps · Mbps · Gbps · Tbps — and Bytes-per-second equivalents</div>
        </div>
    
        <div class="card">
          <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:18px">
            <input id="bw-input" type="number" value="1" min="0" step="any" oninput="calcBandwidth()"
              style="width:160px;padding:10px 14px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-family:var(--mono);font-size:15px;outline:none">
            <select id="bw-unit" onchange="calcBandwidth()"
              style="padding:10px 14px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-family:var(--mono);font-size:13px;outline:none">
              <option value="bps">bps</option>
              <option value="Kbps">Kbps</option>
              <option value="Mbps" selected>Mbps</option>
              <option value="Gbps">Gbps</option>
              <option value="Tbps">Tbps</option>
              <option value="Bps">Bps (Bytes/s)</option>
              <option value="KBps">KBps</option>
              <option value="MBps">MBps</option>
              <option value="GBps">GBps</option>
            </select>
          </div>
    
          <!-- Common presets -->
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px">
            <span style="font-family:var(--mono);font-size:10px;color:var(--muted);align-self:center">Presets:</span>
            ${[['T1','1.544','Mbps'],['E1','2.048','Mbps'],['T3/DS3','44.736','Mbps'],['OC-3','155.52','Mbps'],['OC-12','622.08','Mbps'],['100M','100','Mbps'],['1 Gbps','1','Gbps'],['10 Gbps','10','Gbps'],['100 Gbps','100','Gbps'],['400 Gbps','400','Gbps']].map(([l,v,u])=>
              `<button onclick="setBW(${v},'${u}')" style="padding:5px 10px;background:rgba(74,222,128,0.08);border:1px solid rgba(74,222,128,0.2);border-radius:6px;color:var(--green);font-family:var(--mono);font-size:10px;cursor:pointer">${l}</button>`
            ).join('')}
          </div>
    
          <div class="grid-2" style="gap:16px">
            <div>
              <div style="font-family:var(--mono);font-size:10px;font-weight:700;color:var(--green);margin-bottom:10px">BITS PER SECOND</div>
              <div id="bw-bits" style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;overflow:hidden"></div>
            </div>
            <div>
              <div style="font-family:var(--mono);font-size:10px;font-weight:700;color:var(--cyan);margin-bottom:10px">BYTES PER SECOND</div>
              <div id="bw-bytes" style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;overflow:hidden"></div>
            </div>
          </div>
    
          <div class="callout callout-warn" style="margin-top:14px">
            ⚠️ <strong>Common confusion:</strong> ISPs advertise in <strong>bits</strong> (Mbps). Download managers show <strong>bytes</strong> (MBps). A 100 Mbps connection → max ~12.5 MBps download speed. Always divide by 8 to convert!
          </div>
        </div>
      </div>
    
      <!-- ══ TAB 2: TRANSFER TIME ═══════════════════════════════════════════ -->
      <div id="conv-panel-2" class="topic-panel">
        <div class="topic-hero" style="border-left:4px solid var(--amber)">
          <div class="topic-title">⏱️ Transfer Time Calculator</div>
          <div class="topic-sub">How long to transfer X GB over Y Mbps — with protocol overhead accounted for</div>
        </div>
    
        <div class="card">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:16px">
            <div>
              <div style="font-family:var(--mono);font-size:11px;color:var(--muted);margin-bottom:8px">FILE / DATA SIZE</div>
              <div style="display:flex;gap:8px">
                <input id="tt-size" type="number" value="1" min="0" step="any" oninput="calcTransfer()"
                  style="flex:1;padding:10px 14px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-family:var(--mono);font-size:14px;outline:none">
                <select id="tt-sunit" onchange="calcTransfer()"
                  style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-family:var(--mono);font-size:12px;outline:none">
                  <option value="MB">MB</option>
                  <option value="GB" selected>GB</option>
                  <option value="TB">TB</option>
                  <option value="MiB">MiB</option>
                  <option value="GiB">GiB</option>
                </select>
              </div>
            </div>
            <div>
              <div style="font-family:var(--mono);font-size:11px;color:var(--muted);margin-bottom:8px">LINK SPEED</div>
              <div style="display:flex;gap:8px">
                <input id="tt-speed" type="number" value="100" min="0.001" step="any" oninput="calcTransfer()"
                  style="flex:1;padding:10px 14px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-family:var(--mono);font-size:14px;outline:none">
                <select id="tt-spunit" onchange="calcTransfer()"
                  style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-family:var(--mono);font-size:12px;outline:none">
                  <option value="Kbps">Kbps</option>
                  <option value="Mbps" selected>Mbps</option>
                  <option value="Gbps">Gbps</option>
                </select>
              </div>
            </div>
          </div>
    
          <div style="margin-bottom:16px">
            <div style="font-family:var(--mono);font-size:11px;color:var(--muted);margin-bottom:8px">PROTOCOL OVERHEAD</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              ${[['None (0%)','0'],['TCP (~5%)','5'],['HTTP/S (~8%)','8'],['FTPS (~10%)','10'],['SFTP (~15%)','15'],['Custom','custom']].map(([l,v])=>
                `<button onclick="setTTOverhead(this,'${v}')" class="tt-ovhd" data-val="${v}"
                  style="padding:6px 12px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--muted2);font-family:var(--mono);font-size:11px;cursor:pointer">${l}</button>`
              ).join('')}
              <input id="tt-custom-ovhd" type="number" value="5" min="0" max="90" style="width:70px;padding:6px 10px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);font-family:var(--mono);font-size:11px;display:none;outline:none" oninput="calcTransfer()"> <span id="tt-custom-pct" style="display:none;font-family:var(--mono);font-size:11px;color:var(--muted);align-self:center">%</span>
            </div>
          </div>
    
          <div id="tt-result" style="background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:20px"></div>
    
          <div class="callout callout-info" style="margin-top:14px">
            💡 <strong>Real-world note:</strong> Theoretical max = file size ÷ link speed. Actual throughput is typically 60–80% due to TCP overhead, retransmissions, protocol handshakes, and router/switch processing delays.
          </div>
        </div>
      </div>
    
      <!-- ══ TAB 3: BDP ══════════════════════════════════════════════════════ -->
      <div id="conv-panel-3" class="topic-panel">
        <div class="topic-hero" style="border-left:4px solid var(--blue)">
          <div class="topic-title">🌐 Bandwidth-Delay Product (BDP) Calculator</div>
          <div class="topic-sub">Optimal TCP window size for your link · Critical for WAN and satellite tuning</div>
        </div>
    
        <div class="card">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px">
            <div>
              <div style="font-family:var(--mono);font-size:11px;color:var(--muted);margin-bottom:8px">LINK BANDWIDTH</div>
              <div style="display:flex;gap:8px">
                <input id="bdp-bw" type="number" value="1000" min="0.001" step="any" oninput="calcBDP()"
                  style="flex:1;padding:10px 14px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-family:var(--mono);font-size:14px;outline:none">
                <select id="bdp-bwunit" onchange="calcBDP()"
                  style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-family:var(--mono);font-size:12px;outline:none">
                  <option value="Mbps" selected>Mbps</option>
                  <option value="Gbps">Gbps</option>
                  <option value="Kbps">Kbps</option>
                </select>
              </div>
            </div>
            <div>
              <div style="font-family:var(--mono);font-size:11px;color:var(--muted);margin-bottom:8px">ROUND-TRIP TIME (RTT)</div>
              <div style="display:flex;gap:8px">
                <input id="bdp-rtt" type="number" value="50" min="0.01" step="any" oninput="calcBDP()"
                  style="flex:1;padding:10px 14px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-family:var(--mono);font-size:14px;outline:none">
                <select id="bdp-rttunit" onchange="calcBDP()"
                  style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-family:var(--mono);font-size:12px;outline:none">
                  <option value="ms" selected>ms</option>
                  <option value="s">seconds</option>
                </select>
              </div>
            </div>
          </div>
    
          <!-- RTT presets -->
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px">
            <span style="font-family:var(--mono);font-size:10px;color:var(--muted);align-self:center">RTT presets:</span>
            ${[['LAN 1ms','1'],['Metro 5ms','5'],['National 30ms','30'],['Intercontinental 80ms','80'],['Trans-Pacific 150ms','150'],['Satellite 600ms','600']].map(([l,v])=>
              `<button onclick="document.getElementById('bdp-rtt').value=${v};document.getElementById('bdp-rttunit').value='ms';calcBDP()"
                style="padding:5px 10px;background:rgba(91,156,246,0.08);border:1px solid rgba(91,156,246,0.2);border-radius:6px;color:var(--blue);font-family:var(--mono);font-size:10px;cursor:pointer">${l}</button>`
            ).join('')}
          </div>
    
          <div id="bdp-result" style="background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:20px"></div>
    
          <div class="callout callout-warn" style="margin-top:14px">
            ⚠️ <strong>TCP Window too small?</strong> Default TCP window = 64 KB. On a 1 Gbps link with 100ms RTT, BDP = 12.5 MB. If your window is 64 KB, you're only using 0.5% of the link! Enable TCP Window Scaling (RFC 7323) for high-BDP paths.
          </div>
        </div>
      </div>
    
      <!-- ══ TAB 4: MTU / PACKET ════════════════════════════════════════════ -->
      <div id="conv-panel-4" class="topic-panel">
        <div class="topic-hero" style="border-left:4px solid var(--red)">
          <div class="topic-title">📏 MTU & Packet Size Calculator</div>
          <div class="topic-sub">Header overhead breakdown · Tunnel MTU · MSS calculation · Fragmentation analysis</div>
        </div>
    
        <div class="card">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:16px">
            <div>
              <div style="font-family:var(--mono);font-size:11px;color:var(--muted);margin-bottom:8px">PHYSICAL MTU (bytes)</div>
              <input id="mtu-val" type="number" value="1500" min="68" max="9216" oninput="calcMTU()"
                style="width:100%;padding:10px 14px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-family:var(--mono);font-size:14px;outline:none;box-sizing:border-box">
              <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">
                ${[['Ethernet','1500'],['Jumbo','9000'],['PPPoE','1492'],['802.11','2304']].map(([l,v])=>
                  `<button onclick="document.getElementById('mtu-val').value=${v};calcMTU()"
                    style="padding:4px 10px;background:rgba(248,113,113,0.08);border:1px solid rgba(248,113,113,0.2);border-radius:5px;color:var(--red);font-family:var(--mono);font-size:10px;cursor:pointer">${l} (${v})</button>`
                ).join('')}
              </div>
            </div>
            <div>
              <div style="font-family:var(--mono);font-size:11px;color:var(--muted);margin-bottom:8px">ENCAPSULATION / TUNNEL TYPE</div>
              <select id="mtu-encap" onchange="calcMTU()"
                style="width:100%;padding:10px 14px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-family:var(--mono);font-size:12px;outline:none;box-sizing:border-box">
                <option value="0">None (plain Ethernet)</option>
                <option value="8">PPPoE (+8B)</option>
                <option value="24" selected>GRE (+24B)</option>
                <option value="50">IPSec ESP Transport (+50B)</option>
                <option value="73">IPSec ESP Tunnel (+73B)</option>
                <option value="50">VXLAN (+50B)</option>
                <option value="54">MPLS 1 label (+4B) + IP+TCP</option>
                <option value="40">IPv6 over IPv4 (+20B outer IP)</option>
                <option value="8">L2TP (+8B)</option>
                <option value="16">GRE + IPSec (+16B extra)</option>
              </select>
            </div>
          </div>
    
          <div id="mtu-result"></div>
    
          <div class="callout callout-info" style="margin-top:14px">
            💡 <strong>MSS Clamping:</strong> When tunneling, add <code>ip tcp adjust-mss 1452</code> on the tunnel interface. This tells TCP to use a smaller segment size to fit inside the tunnel MTU. Prevents fragmentation without needing to change MTU everywhere.
          </div>
        </div>
      </div>
    
      <!-- ══ TAB 5: BINARY / HEX IP CONVERTER ══════════════════════════════ -->
      <div id="conv-panel-5" class="topic-panel">
        <div class="topic-hero" style="border-left:4px solid var(--purple)">
          <div class="topic-title">🔢 Binary / Hex / IP Converter</div>
          <div class="topic-sub">IPv4 address in all representations · Subnet mask binary visualization · MAC address formatter</div>
        </div>
    
        <div class="card">
          <div style="margin-bottom:20px">
            <div style="font-family:var(--mono);font-size:11px;color:var(--muted);margin-bottom:8px">IPv4 ADDRESS</div>
            <input id="bh-ip" type="text" value="192.168.1.100" oninput="calcBinHex()"
              placeholder="192.168.1.100"
              style="width:260px;padding:10px 14px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-family:var(--mono);font-size:14px;outline:none">
            <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">
              ${[['192.168.1.1'],['10.0.0.1'],['172.16.0.1'],['255.255.255.0'],['255.255.255.128'],['0.0.0.255']].map(([ip])=>
                `<button onclick="document.getElementById('bh-ip').value='${ip}';calcBinHex()"
                  style="padding:4px 10px;background:rgba(167,139,250,0.08);border:1px solid rgba(167,139,250,0.2);border-radius:5px;color:#a78bfa;font-family:var(--mono);font-size:10px;cursor:pointer">${ip}</button>`
              ).join('')}
            </div>
          </div>
    
          <div id="bh-ip-result" style="margin-bottom:20px"></div>
    
          <hr style="border:none;border-top:1px solid var(--border);margin:16px 0">
    
          <div style="font-family:var(--mono);font-size:11px;color:var(--muted);margin-bottom:8px">MAC ADDRESS FORMATTER</div>
          <input id="bh-mac" type="text" value="aabb.ccdd.eeff" oninput="calcMAC()"
            placeholder="aabb.ccdd.eeff or aa:bb:cc:dd:ee:ff"
            style="width:300px;padding:10px 14px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-family:var(--mono);font-size:13px;outline:none">
          <div id="bh-mac-result" style="margin-top:12px"></div>
        </div>
      </div>
    
      <!-- ══ TAB 6: NUMBER BASE CONVERTER ══════════════════════════════════ -->
      <div id="conv-panel-6" class="topic-panel">
        <div class="topic-hero" style="border-left:4px solid var(--amber)">
          <div class="topic-title">🔣 Number Base Converter</div>
          <div class="topic-sub">Decimal ↔ Binary ↔ Hexadecimal ↔ Octal — type in any field to convert all others</div>
        </div>
    
        <div class="card">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">
            ${[
              ['dec','Decimal (Base 10)','var(--green)','0-9'],
              ['bin','Binary (Base 2)','var(--blue)','0-1'],
              ['hex','Hexadecimal (Base 16)','var(--amber)','0-9, A-F'],
              ['oct','Octal (Base 8)','var(--cyan)','0-7']
            ].map(([id,label,col,hint])=>`
            <div>
              <div style="font-family:var(--mono);font-size:11px;color:${col};margin-bottom:6px;font-weight:700">${label}</div>
              <div style="font-size:10px;color:var(--muted);margin-bottom:4px">Digits: ${hint}</div>
              <input id="nb-${id}" type="text" oninput="calcBase('${id}')"
                style="width:100%;padding:10px 14px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-family:var(--mono);font-size:14px;outline:none;box-sizing:border-box"
                placeholder="Enter ${label.split(' ')[0].toLowerCase()} number">
            </div>`).join('')}
          </div>
    
          <!-- Quick reference table -->
          <div style="font-family:var(--mono);font-size:10px;font-weight:700;color:var(--muted);margin-bottom:8px">QUICK REFERENCE TABLE (0-15)</div>
          <div class="tbl-wrap">
            <table class="tbl" style="font-family:var(--mono);font-size:11px">
              <tr>
                <th style="color:var(--green)">Dec</th><th style="color:var(--blue)">Bin</th><th style="color:var(--amber)">Hex</th><th style="color:var(--cyan)">Oct</th>
                <th style="color:var(--green)">Dec</th><th style="color:var(--blue)">Bin</th><th style="color:var(--amber)">Hex</th><th style="color:var(--cyan)">Oct</th>
              </tr>
              ${[0,1,2,3,4,5,6,7].map(n=>`<tr>
                <td>${n}</td><td>${n.toString(2).padStart(4,'0')}</td><td>${n.toString(16).toUpperCase()}</td><td>${n.toString(8)}</td>
                <td>${n+8}</td><td>${(n+8).toString(2).padStart(4,'0')}</td><td>${(n+8).toString(16).toUpperCase()}</td><td>${(n+8).toString(8)}</td>
              </tr>`).join('')}
            </table>
          </div>
    
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px">
            <span style="font-family:var(--mono);font-size:10px;color:var(--muted);align-self:center">Try:</span>
            ${[['255','dec'],['11111111','bin'],['FF','hex'],['377','oct'],['1024','dec'],['10000000000','bin']].map(([v,t])=>
              `<button onclick="document.getElementById('nb-${t}').value='${v}';calcBase('${t}')"
                style="padding:5px 10px;background:rgba(251,191,36,0.08);border:1px solid rgba(251,191,36,0.2);border-radius:6px;color:var(--amber);font-family:var(--mono);font-size:10px;cursor:pointer">${v} (${t})</button>`
            ).join('')}
          </div>
        </div>
      </div>
    
      <!-- ══ TAB 7: QOS BANDWIDTH PLANNER ══════════════════════════════════ -->
      <div id="conv-panel-7" class="topic-panel">
        <div class="topic-hero" style="border-left:4px solid var(--red)">
          <div class="topic-title">📊 QoS Bandwidth Planner</div>
          <div class="topic-sub">Allocate link capacity across traffic classes · LLQ voice budget · Verify class totals</div>
        </div>
    
        <div class="card">
          <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:20px">
            <div>
              <div style="font-family:var(--mono);font-size:11px;color:var(--muted);margin-bottom:6px">TOTAL LINK BANDWIDTH</div>
              <div style="display:flex;gap:8px">
                <input id="qos-total" type="number" value="100" min="1" step="any" oninput="calcQoS()"
                  style="width:120px;padding:10px 14px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-family:var(--mono);font-size:14px;outline:none">
                <select id="qos-unit" onchange="calcQoS()"
                  style="padding:10px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-family:var(--mono);font-size:12px;outline:none">
                  <option value="Kbps">Kbps</option>
                  <option value="Mbps" selected>Mbps</option>
                  <option value="Gbps">Gbps</option>
                </select>
              </div>
            </div>
            <div style="align-self:flex-end">
              <button onclick="resetQoS()"
                style="padding:10px 16px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;color:var(--muted2);font-family:var(--mono);font-size:11px;cursor:pointer">↺ Reset to defaults</button>
            </div>
          </div>
    
          <!-- Traffic classes -->
          <div id="qos-classes">
            <!-- rendered by JS -->
          </div>
    
          <div id="qos-result" style="margin-top:16px"></div>
    
          <div class="callout callout-info" style="margin-top:14px">
            💡 <strong>Voice (LLQ) rule:</strong> Never allocate more than 33% of link to voice priority queue. Over-allocation starves other traffic and defeats the purpose of QoS. Voice (G.711) needs ~87 Kbps per call including headers.
          </div>
        </div>
      </div>
    
      <!-- ══ TAB 8: THROUGHPUT / GOODPUT ═══════════════════════════════════ -->
      <div id="conv-panel-8" class="topic-panel">
        <div class="topic-hero" style="border-left:4px solid var(--cyan)">
          <div class="topic-title">📈 Throughput vs Goodput Calculator</div>
          <div class="topic-sub">Raw link speed vs actual application data — packet loss · overhead · retransmits</div>
        </div>
    
        <div class="card">
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:20px;flex-wrap:wrap">
            <div>
              <div style="font-family:var(--mono);font-size:11px;color:var(--muted);margin-bottom:6px">LINK SPEED</div>
              <div style="display:flex;gap:6px">
                <input id="gp-speed" type="number" value="1000" min="0.001" step="any" oninput="calcGoodput()"
                  style="flex:1;padding:10px 12px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-family:var(--mono);font-size:13px;outline:none">
                <select id="gp-spunit" onchange="calcGoodput()"
                  style="padding:10px 8px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-family:var(--mono);font-size:11px;outline:none">
                  <option value="Mbps" selected>Mbps</option>
                  <option value="Gbps">Gbps</option>
                  <option value="Kbps">Kbps</option>
                </select>
              </div>
            </div>
            <div>
              <div style="font-family:var(--mono);font-size:11px;color:var(--muted);margin-bottom:6px">PACKET LOSS (%)</div>
              <input id="gp-loss" type="number" value="0.1" min="0" max="100" step="0.01" oninput="calcGoodput()"
                style="width:100%;padding:10px 12px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-family:var(--mono);font-size:13px;outline:none;box-sizing:border-box">
            </div>
            <div>
              <div style="font-family:var(--mono);font-size:11px;color:var(--muted);margin-bottom:6px">PROTOCOL OVERHEAD (%)</div>
              <input id="gp-overhead" type="number" value="5" min="0" max="90" step="0.1" oninput="calcGoodput()"
                style="width:100%;padding:10px 12px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-family:var(--mono);font-size:13px;outline:none;box-sizing:border-box">
            </div>
          </div>
    
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:18px">
            <span style="font-family:var(--mono);font-size:10px;color:var(--muted);align-self:center">Loss presets:</span>
            ${[['0% (perfect)','0'],['0.01% (great)','0.01'],['0.1% (good)','0.1'],['1% (poor)','1'],['5% (bad)','5'],['10% (terrible)','10']].map(([l,v])=>
              `<button onclick="document.getElementById('gp-loss').value=${v};calcGoodput()"
                style="padding:5px 10px;background:rgba(56,217,192,0.08);border:1px solid rgba(56,217,192,0.2);border-radius:6px;color:var(--cyan);font-family:var(--mono);font-size:10px;cursor:pointer">${l}</button>`
            ).join('')}
          </div>
    
          <div id="gp-result"></div>
    
          <div class="callout callout-warn" style="margin-top:14px">
            ⚠️ <strong>TCP and packet loss:</strong> TCP interprets loss as congestion signal — CWND halves on every loss event. With 1% random loss, TCP throughput can drop to ~6× less than the link capacity. UDP-based protocols (video streaming, QUIC) handle loss more gracefully.
          </div>
        </div>
      </div>
    
      <!-- ══ TAB 9: PROTOCOL TIMERS ════════════════════════════════════════ -->
      <div id="conv-panel-9" class="topic-panel">
        <div class="topic-hero" style="border-left:4px solid var(--green)">
          <div class="topic-title">⏲️ Protocol Timer Reference & Converter</div>
          <div class="topic-sub">ms ↔ seconds ↔ minutes — OSPF · BGP · EIGRP · STP · BFD · RIP · HSRP timer reference</div>
        </div>
    
        <div class="card">
          <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-bottom:20px">
            <div>
              <div style="font-family:var(--mono);font-size:11px;color:var(--muted);margin-bottom:6px">VALUE</div>
              <input id="tm-val" type="number" value="10" min="0" step="any" oninput="calcTimers()"
                style="width:140px;padding:10px 14px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-family:var(--mono);font-size:14px;outline:none">
            </div>
            <div>
              <div style="font-family:var(--mono);font-size:11px;color:var(--muted);margin-bottom:6px">UNIT</div>
              <select id="tm-unit" onchange="calcTimers()"
                style="padding:10px 14px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;color:var(--text);font-family:var(--mono);font-size:12px;outline:none">
                <option value="ms">milliseconds (ms)</option>
                <option value="s" selected>seconds (s)</option>
                <option value="min">minutes (min)</option>
                <option value="hr">hours (hr)</option>
              </select>
            </div>
          </div>
    
          <div id="tm-result" style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:16px;margin-bottom:20px"></div>
    
          <!-- Protocol timer reference -->
          <div style="font-family:var(--mono);font-size:10px;font-weight:700;color:var(--muted);margin-bottom:10px;text-transform:uppercase;letter-spacing:1px">📋 Protocol Timer Reference</div>
          <div class="tbl-wrap"><table class="tbl">
            <tr><th>Protocol</th><th>Timer</th><th>Default</th><th>Formula / Notes</th></tr>
            <tr><td style="color:var(--blue)">OSPF</td><td>Hello</td><td style="color:var(--green)">10s (broadcast) / 30s (NBMA)</td><td>Sent to 224.0.0.5</td></tr>
            <tr><td style="color:var(--blue)">OSPF</td><td>Dead</td><td style="color:var(--amber)">40s (4× Hello)</td><td>Dead = 4× Hello always</td></tr>
            <tr><td style="color:var(--blue)">OSPF</td><td>LSA Retransmit</td><td>5s</td><td>Resend unacknowledged LSA</td></tr>
            <tr><td style="color:var(--blue)">OSPF</td><td>Max-Age</td><td>3600s (1 hour)</td><td>LSA flushed after max-age</td></tr>
            <tr><td style="color:var(--green)">BGP</td><td>Keepalive</td><td style="color:var(--green)">60s</td><td>Default = ⅓ of Hold Time</td></tr>
            <tr><td style="color:var(--green)">BGP</td><td>Hold Time</td><td style="color:var(--amber)">180s</td><td>Session down if no keepalive</td></tr>
            <tr><td style="color:var(--green)">BGP</td><td>Connect Retry</td><td>120s</td><td>Wait before TCP retry</td></tr>
            <tr><td style="color:var(--cyan)">EIGRP</td><td>Hello</td><td style="color:var(--green)">5s (LAN) / 60s (WAN)</td><td>WAN = NBMA links</td></tr>
            <tr><td style="color:var(--cyan)">EIGRP</td><td>Hold</td><td style="color:var(--amber)">15s (LAN) / 180s (WAN)</td><td>Hold = 3× Hello</td></tr>
            <tr><td style="color:var(--amber)">RIP</td><td>Update</td><td style="color:var(--amber)">30s</td><td>Full table every 30s</td></tr>
            <tr><td style="color:var(--amber)">RIP</td><td>Invalid</td><td style="color:var(--red)">180s</td><td>No update → invalid</td></tr>
            <tr><td style="color:var(--amber)">RIP</td><td>Flush</td><td style="color:var(--red)">240s</td><td>Route removed from table</td></tr>
            <tr><td style="color:var(--amber)">RIP</td><td>Holddown</td><td>180s</td><td>Ignore worse updates</td></tr>
            <tr><td style="color:var(--red)">STP (802.1D)</td><td>Hello</td><td>2s</td><td>BPDU interval</td></tr>
            <tr><td style="color:var(--red)">STP (802.1D)</td><td>Forward Delay</td><td>15s</td><td>Listening + Learning each</td></tr>
            <tr><td style="color:var(--red)">STP (802.1D)</td><td>Max Age</td><td style="color:var(--amber)">20s</td><td>Total convergence: 50s!</td></tr>
            <tr><td style="color:var(--red)">RSTP (802.1w)</td><td>Hello</td><td>2s</td><td>Every bridge generates</td></tr>
            <tr><td style="color:var(--red)">RSTP (802.1w)</td><td>Convergence</td><td style="color:var(--green)">1-2s</td><td>Proposal/Agreement handshake</td></tr>
            <tr><td style="color:var(--purple)">HSRP v2</td><td>Hello</td><td>3s</td><td>Sent to 224.0.0.102</td></tr>
            <tr><td style="color:var(--purple)">HSRP v2</td><td>Hold</td><td style="color:var(--amber)">10s</td><td>Active declared dead</td></tr>
            <tr><td style="color:var(--purple)">VRRP</td><td>Advertisement</td><td>1s</td><td>Master sends to 224.0.0.18</td></tr>
            <tr><td style="color:var(--green)">BFD</td><td>Hello (typical)</td><td style="color:var(--green)">50-300ms</td><td>Hardware-assisted detection</td></tr>
            <tr><td style="color:var(--green)">BFD</td><td>Detection</td><td style="color:var(--green)">150-900ms</td><td>3× hello multiplier default</td></tr>
            <tr><td style="color:var(--muted2)">NTP</td><td>Poll interval</td><td>64-1024s</td><td>Adaptive, powers of 2</td></tr>
            <tr><td style="color:var(--muted2)">LACP</td><td>Fast timeout</td><td>1s PDU / 3s dead</td><td>Short period</td></tr>
            <tr><td style="color:var(--muted2)">LACP</td><td>Slow timeout</td><td>30s PDU / 90s dead</td><td>Long period (default)</td></tr>
          </table></div>
        </div>
      </div>
    
    </div><!-- /page-converters -->
    `;
    
    /* ── JAVASCRIPT ENGINE ──────────────────────────────────────────────────── */
    
    // ── Helpers ──────────────────────────────────────────────────────────────
    
    function fmt(n, decimals = 4) {
      if (n === 0) return '0';
      if (!isFinite(n) || isNaN(n)) return '—';
      if (n >= 1e15) return (n / 1e15).toPrecision(6) + 'e15';
      // Auto-precision based on magnitude
      if (Math.abs(n) >= 1000) return Number(n.toPrecision(8)).toLocaleString('en-US', { maximumFractionDigits: 4 });
      if (Math.abs(n) < 0.0001) return n.toExponential(4);
      return Number(n.toPrecision(8)).toLocaleString('en-US', { maximumFractionDigits: decimals });
    }
    
    function fmtTime(seconds) {
      if (seconds < 0.001) return (seconds * 1000).toFixed(3) + ' ms';
      if (seconds < 60) return seconds.toFixed(2) + ' s';
      if (seconds < 3600) { const m = Math.floor(seconds/60), s = Math.round(seconds%60); return `${m}m ${s}s`; }
      if (seconds < 86400) { const h = Math.floor(seconds/3600), m = Math.floor((seconds%3600)/60); return `${h}h ${m}m`; }
      const d = Math.floor(seconds/86400), h = Math.floor((seconds%86400)/3600); return `${d}d ${h}h`;
    }
    
    function rowHTML(label, value, unit, color = 'var(--text)', highlight = false) {
      return `<div style="display:flex;justify-content:space-between;align-items:center;padding:9px 14px;${highlight?'background:rgba(56,217,192,0.06);':''}border-bottom:1px solid var(--border)">
        <span style="font-family:var(--mono);font-size:11px;color:var(--muted2)">${label}</span>
        <span style="font-family:var(--mono);font-size:13px;font-weight:600;color:${color}">${value}<span style="font-size:10px;color:var(--muted);margin-left:4px">${unit}</span></span>
      </div>`;
    }
    
    function copyRow(value) {
      return `<button onclick="navigator.clipboard.writeText('${value}')"
        style="padding:2px 8px;background:var(--bg3);border:1px solid var(--border);border-radius:4px;color:var(--muted);font-family:var(--mono);font-size:9px;cursor:pointer;margin-left:8px">copy</button>`;
    }
    
    // ── Tab switching ─────────────────────────────────────────────────────────
    window.showConverter = function(idx) {
      document.querySelectorAll('[id^="conv-panel-"]').forEach(p => p.classList.remove('active-panel'));
      document.querySelectorAll('[id^="conv-tab-"]').forEach(t => t.classList.remove('active'));
      const panel = document.getElementById('conv-panel-' + idx);
      const tab   = document.getElementById('conv-tab-'   + idx);
      if (panel) panel.classList.add('active-panel');
      if (tab)   tab.classList.add('active');
    };
    
    // ── TAB 0: DATA SIZE ─────────────────────────────────────────────────────
    
    const DS_FACTORS = {
      bit: 1,
      B:   8,
      KB:  8e3,    MB:  8e6,    GB:  8e9,    TB:  8e12,   PB:  8e15,   EB:  8e18,
      KiB: 8*1024, MiB: 8*1024**2, GiB: 8*1024**3, TiB: 8*1024**4
    };
    
    window.setDS = function(v, u) {
      document.getElementById('ds-input').value = v;
      document.getElementById('ds-unit').value  = u;
      calcDataSize();
    };
    
    window.calcDataSize = function() {
      const val  = parseFloat(document.getElementById('ds-input').value) || 0;
      const unit = document.getElementById('ds-unit').value;
      const bits = val * (DS_FACTORS[unit] || 1);
      const bytes = bits / 8;
    
      const SI = [
        ['Bits',      bits,       'b',   'var(--cyan)'],
        ['Bytes',     bytes,      'B',   'var(--text)'],
        ['Kilobytes', bytes/1e3,  'KB',  'var(--text)'],
        ['Megabytes', bytes/1e6,  'MB',  'var(--green)'],
        ['Gigabytes', bytes/1e9,  'GB',  'var(--blue)'],
        ['Terabytes', bytes/1e12, 'TB',  'var(--amber)'],
        ['Petabytes', bytes/1e15, 'PB',  'var(--red)'],
        ['Exabytes',  bytes/1e18, 'EB',  'var(--muted2)'],
      ];
    
      const IEC = [
        ['Bits',       bits,             'b',   'var(--cyan)'],
        ['Bytes',      bytes,            'B',   'var(--text)'],
        ['Kibibytes',  bytes/1024,       'KiB', 'var(--text)'],
        ['Mebibytes',  bytes/1024**2,    'MiB', 'var(--green)'],
        ['Gibibytes',  bytes/1024**3,    'GiB', 'var(--blue)'],
        ['Tebibytes',  bytes/1024**4,    'TiB', 'var(--amber)'],
        ['Pebibytes',  bytes/1024**5,    'PiB', 'var(--red)'],
      ];
    
      const render = rows => rows.map(([l,v,u,c]) => rowHTML(l, fmt(v), u, c)).join('');
      document.getElementById('ds-si').innerHTML  = render(SI);
      document.getElementById('ds-iec').innerHTML = render(IEC);
    };
    
    // ── TAB 1: BANDWIDTH ──────────────────────────────────────────────────────
    
    const BW_TO_BPS = { bps:1, Kbps:1e3, Mbps:1e6, Gbps:1e9, Tbps:1e12, Bps:8, KBps:8e3, MBps:8e6, GBps:8e9 };
    
    window.setBW = function(v, u) {
      document.getElementById('bw-input').value = v;
      document.getElementById('bw-unit').value  = u;
      calcBandwidth();
    };
    
    window.calcBandwidth = function() {
      const val  = parseFloat(document.getElementById('bw-input').value) || 0;
      const unit = document.getElementById('bw-unit').value;
      const bps  = val * (BW_TO_BPS[unit] || 1);
      const Bps  = bps / 8;
    
      const BITS = [
        ['bps',  bps,     'bps',  'var(--text)'],
        ['Kbps', bps/1e3, 'Kbps', 'var(--cyan)'],
        ['Mbps', bps/1e6, 'Mbps', 'var(--green)'],
        ['Gbps', bps/1e9, 'Gbps', 'var(--blue)'],
        ['Tbps', bps/1e12,'Tbps', 'var(--amber)'],
      ];
      const BYTES = [
        ['Bps',  Bps,     'Bps',  'var(--text)'],
        ['KBps', Bps/1e3, 'KBps', 'var(--cyan)'],
        ['MBps', Bps/1e6, 'MBps', 'var(--green)'],
        ['GBps', Bps/1e9, 'GBps', 'var(--blue)'],
        ['TBps', Bps/1e12,'TBps', 'var(--amber)'],
      ];
    
      document.getElementById('bw-bits').innerHTML  = BITS.map(([l,v,u,c]) => rowHTML(l, fmt(v), u, c)).join('');
      document.getElementById('bw-bytes').innerHTML = BYTES.map(([l,v,u,c]) => rowHTML(l, fmt(v), u, c)).join('');
    };
    
    // ── TAB 2: TRANSFER TIME ──────────────────────────────────────────────────
    
    let _ttOverhead = 5;
    window.setTTOverhead = function(btn, val) {
      document.querySelectorAll('.tt-ovhd').forEach(b => {
        b.style.background = 'var(--bg3)'; b.style.color = 'var(--muted2)'; b.style.borderColor = 'var(--border)';
      });
      btn.style.background = 'rgba(251,191,36,0.15)'; btn.style.color = 'var(--amber)'; btn.style.borderColor = 'rgba(251,191,36,0.4)';
      const custom = document.getElementById('tt-custom-ovhd');
      const pct    = document.getElementById('tt-custom-pct');
      if (val === 'custom') {
        custom.style.display = 'block'; pct.style.display = 'block';
        _ttOverhead = parseFloat(custom.value) || 5;
      } else {
        custom.style.display = 'none'; pct.style.display = 'none';
        _ttOverhead = parseFloat(val);
      }
      calcTransfer();
    };
    
    const SIZE_BYTES = { MB: 1e6, GB: 1e9, TB: 1e12, MiB: 1024**2, GiB: 1024**3 };
    const SPEED_BPS  = { Kbps: 1e3, Mbps: 1e6, Gbps: 1e9 };
    
    window.calcTransfer = function() {
      const size  = parseFloat(document.getElementById('tt-size').value)  || 0;
      const sunit = document.getElementById('tt-sunit').value;
      const spd   = parseFloat(document.getElementById('tt-speed').value) || 0;
      const spunit= document.getElementById('tt-spunit').value;
      const ovhd  = _ttOverhead;
    
      if (document.getElementById('tt-custom-ovhd').style.display !== 'none') {
        _ttOverhead = parseFloat(document.getElementById('tt-custom-ovhd').value) || 0;
      }
    
      const bytes  = size * (SIZE_BYTES[sunit] || 1e9);
      const bps    = spd  * (SPEED_BPS[spunit] || 1e6);
      const effBps = bps  * (1 - ovhd / 100);
    
      const theoretical = (bytes * 8) / bps;
      const realistic   = (bytes * 8) / effBps;
    
      const el = document.getElementById('tt-result');
      if (bps <= 0 || bytes <= 0) { el.innerHTML = '<div style="color:var(--muted);font-family:var(--mono);font-size:12px;padding:12px">Enter file size and link speed above</div>'; return; }
    
      el.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
          <div style="background:var(--bg3);border:1px solid rgba(74,222,128,0.3);border-radius:10px;padding:16px;text-align:center">
            <div style="font-family:var(--mono);font-size:10px;color:var(--muted);margin-bottom:6px">⚡ THEORETICAL MAX</div>
            <div style="font-family:var(--mono);font-size:22px;font-weight:700;color:var(--green)">${fmtTime(theoretical)}</div>
            <div style="font-family:var(--mono);font-size:10px;color:var(--muted);margin-top:4px">0% overhead · perfect conditions</div>
          </div>
          <div style="background:var(--bg3);border:1px solid rgba(251,191,36,0.3);border-radius:10px;padding:16px;text-align:center">
            <div style="font-family:var(--mono);font-size:10px;color:var(--muted);margin-bottom:6px">🌐 REALISTIC ESTIMATE</div>
            <div style="font-family:var(--mono);font-size:22px;font-weight:700;color:var(--amber)">${fmtTime(realistic)}</div>
            <div style="font-family:var(--mono);font-size:10px;color:var(--muted);margin-top:4px">${ovhd}% overhead accounted for</div>
          </div>
        </div>
        <div style="margin-top:14px;background:var(--bg2);border:1px solid var(--border);border-radius:8px;overflow:hidden">
          ${rowHTML('File size', fmt(bytes/1e9), 'GB', 'var(--text)')}
          ${rowHTML('Link speed', fmt(bps/1e6), 'Mbps', 'var(--text)')}
          ${rowHTML('Effective speed after overhead', fmt(effBps/1e6), 'Mbps', 'var(--cyan)')}
          ${rowHTML('Data in bits', fmt(bytes*8/1e9), 'Gbits', 'var(--muted2)')}
          ${rowHTML('Overhead applied', ovhd + '%', '→ ' + fmt(bps*ovhd/100/1e6) + ' Mbps lost', 'var(--red)')}
        </div>
      `;
    };
    
    // ── TAB 3: BDP ────────────────────────────────────────────────────────────
    
    window.calcBDP = function() {
      const bw    = parseFloat(document.getElementById('bdp-bw').value)  || 0;
      const bwU   = document.getElementById('bdp-bwunit').value;
      const rtt   = parseFloat(document.getElementById('bdp-rtt').value) || 0;
      const rttU  = document.getElementById('bdp-rttunit').value;
    
      const bps      = bw  * (SPEED_BPS[bwU] || 1e6);
      const rttSecs  = rttU === 'ms' ? rtt/1000 : rtt;
    
      const bdpBits  = bps * rttSecs;
      const bdpBytes = bdpBits / 8;
      const bdpKB    = bdpBytes / 1024;
      const bdpMB    = bdpBytes / (1024*1024);
    
      const defWindow = 65536; // bytes
      const efficiency = defWindow / bdpBytes * 100;
      const needed64   = bdpBytes <= 65536;
    
      const el = document.getElementById('bdp-result');
      el.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:16px">
          <div style="background:var(--bg3);border:1px solid rgba(91,156,246,0.3);border-radius:10px;padding:14px;text-align:center">
            <div style="font-family:var(--mono);font-size:10px;color:var(--muted);margin-bottom:4px">BDP IN BITS</div>
            <div style="font-family:var(--mono);font-size:18px;font-weight:700;color:var(--blue)">${fmt(bdpBits/1e6)} Mb</div>
            <div style="font-family:var(--mono);font-size:10px;color:var(--muted)">${fmt(bdpBits)} bits</div>
          </div>
          <div style="background:var(--bg3);border:1px solid rgba(56,217,192,0.3);border-radius:10px;padding:14px;text-align:center">
            <div style="font-family:var(--mono);font-size:10px;color:var(--muted);margin-bottom:4px">BDP IN BYTES</div>
            <div style="font-family:var(--mono);font-size:18px;font-weight:700;color:var(--cyan)">${fmt(bdpMB)} MB</div>
            <div style="font-family:var(--mono);font-size:10px;color:var(--muted)">${fmt(bdpKB)} KiB</div>
          </div>
          <div style="background:var(--bg3);border:1px solid ${needed64?'rgba(74,222,128,0.3)':'rgba(248,113,113,0.3)'};border-radius:10px;padding:14px;text-align:center">
            <div style="font-family:var(--mono);font-size:10px;color:var(--muted);margin-bottom:4px">DEFAULT 64KB WINDOW</div>
            <div style="font-family:var(--mono);font-size:18px;font-weight:700;color:${needed64?'var(--green)':'var(--red)'}">${Math.min(100,efficiency).toFixed(1)}%</div>
            <div style="font-family:var(--mono);font-size:10px;color:var(--muted)">${needed64?'✅ sufficient':'❌ too small!'}</div>
          </div>
        </div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;overflow:hidden">
          ${rowHTML('Required TCP window size', fmt(bdpMB), 'MB', 'var(--cyan)', true)}
          ${rowHTML('Default TCP window', '64', 'KB', needed64?'var(--green)':'var(--red)')}
          ${rowHTML('Window scale factor needed', Math.ceil(Math.log2(Math.max(1,bdpBytes/65536))).toString(), '× (bits to shift)', 'var(--amber)')}
          ${rowHTML('Max window with scaling', fmt(65536 * Math.pow(2,14) / (1024*1024)), 'MB (2^14 shift max)', 'var(--muted2)')}
          ${rowHTML('Link utilization w/ 64KB', Math.min(100,efficiency).toFixed(2) + '%', '(lower = wasted capacity)', efficiency<90?'var(--red)':'var(--green)')}
        </div>
        ${!needed64 ? '<div class="callout callout-warn" style="margin-top:10px">❌ 64 KB window is too small! Enable TCP Window Scaling RFC 7323 or you\'re only using ' + efficiency.toFixed(1) + '% of this link.</div>' : '<div class="callout callout-info" style="margin-top:10px">✅ Default 64 KB window is sufficient for this BDP. No tuning required.</div>'}
      `;
    };
    
    // ── TAB 4: MTU ────────────────────────────────────────────────────────────
    
    window.calcMTU = function() {
      const mtu   = parseInt(document.getElementById('mtu-val').value)   || 1500;
      const encap = parseInt(document.getElementById('mtu-encap').value) || 0;
    
      const innerMTU = mtu - encap;
      const ipHdr    = 20, tcpHdr = 20, udpHdr = 8, ethHdr = 14, ethFCS = 4;
      const tcpPayload = innerMTU - ipHdr - tcpHdr;
      const udpPayload = innerMTU - ipHdr - udpHdr;
      const mss        = tcpPayload;
    
      document.getElementById('mtu-result').innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:14px">
          <div>
            <div style="font-family:var(--mono);font-size:10px;font-weight:700;color:var(--blue);margin-bottom:8px">PACKET SIZE BREAKDOWN</div>
            <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;overflow:hidden">
              ${rowHTML('Physical MTU', mtu, 'B', 'var(--text)', true)}
              ${encap > 0 ? rowHTML('Tunnel/Encap overhead', encap, 'B', 'var(--red)') : ''}
              ${rowHTML('Inner IP MTU', innerMTU, 'B', 'var(--cyan)', encap>0)}
              ${rowHTML('IP header', ipHdr, 'B', 'var(--muted2)')}
              ${rowHTML('TCP header (min)', tcpHdr, 'B', 'var(--muted2)')}
              ${rowHTML('TCP payload / MSS', mss > 0 ? mss : 'ERR', 'B', mss > 0 ? 'var(--green)' : 'var(--red)', true)}
              ${rowHTML('UDP header', udpHdr, 'B', 'var(--muted2)')}
              ${rowHTML('UDP payload', udpPayload > 0 ? udpPayload : 'ERR', 'B', udpPayload > 0 ? 'var(--amber)' : 'var(--red)')}
              ${rowHTML('Ethernet header (L2)', ethHdr, 'B', 'var(--muted2)')}
              ${rowHTML('Ethernet FCS', ethFCS, 'B', 'var(--muted2)')}
            </div>
          </div>
          <div>
            <div style="font-family:var(--mono);font-size:10px;font-weight:700;color:var(--amber);margin-bottom:8px">EFFICIENCY & RECOMMENDATIONS</div>
            <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;overflow:hidden">
              ${rowHTML('Header overhead', fmt((ipHdr+tcpHdr+encap)/mtu*100,1)+'%', 'of MTU', 'var(--amber)')}
              ${rowHTML('Payload efficiency', fmt(mss/mtu*100,1)+'%', 'TCP', 'var(--green)', true)}
              ${rowHTML('ip tcp adjust-mss', mss > 0 ? mss : '—', 'B ← use this value', 'var(--cyan)')}
              ${rowHTML('ip mtu (inner)', innerMTU, 'B ← set on tunnel if', 'var(--blue)')}
            </div>
            <div style="background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:12px;margin-top:10px;font-family:var(--mono);font-size:10px;line-height:1.9">
              <div style="color:var(--cyan)">! Cisco IOS config:</div>
              <div style="color:var(--amber)">interface Tunnel0</div>
              <div style="color:var(--amber)"> ip mtu ${innerMTU}</div>
              <div style="color:var(--amber)"> ip tcp adjust-mss ${mss > 0 ? mss : 1400}</div>
              <div style="color:var(--muted)">! Test: ping x.x.x.x size ${innerMTU-28} df-bit</div>
            </div>
          </div>
        </div>
        ${mss <= 0 ? '<div class="callout callout-warn">⚠️ MTU too small for headers! Increase MTU or reduce encapsulation overhead.</div>' : ''}
      `;
    };
    
    // ── TAB 5: BINARY / HEX IP ───────────────────────────────────────────────
    
    function ipToNum(ip) {
      const parts = ip.trim().split('.').map(Number);
      if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) return null;
      return (parts[0]<<24>>>0) + (parts[1]<<16) + (parts[2]<<8) + parts[3];
    }
    
    function numToBin(n) {
      return [(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255]
        .map(b=>b.toString(2).padStart(8,'0')).join('.');
    }
    
    window.calcBinHex = function() {
      const ip  = document.getElementById('bh-ip').value.trim();
      const num = ipToNum(ip);
      const el  = document.getElementById('bh-ip-result');
      if (num === null) { el.innerHTML = '<div style="color:var(--red);font-family:var(--mono);font-size:12px">Invalid IPv4 address</div>'; return; }
    
      const binStr  = numToBin(num);
      const hexStr  = num.toString(16).padStart(8,'0').toUpperCase();
      const hexDot  = hexStr.match(/.{2}/g).join('.');
      const decimal = (num>>>0).toString();
      const octets  = ip.split('.');
      const binOcts = octets.map(o=>parseInt(o).toString(2).padStart(8,'0'));
    
      // Check if mask
      const isMask = (((~num)>>>0) & ((~num)>>>0)+1) === 0 || num === 0 || num === 0xFFFFFFFF;
      const hostBits = isMask ? (num >>> 0).toString(2).replace(/1/g,'').length : null;
    
      el.innerHTML = `
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;overflow:hidden;margin-bottom:12px">
          ${rowHTML('Dotted Decimal', ip, '', 'var(--text)', true)}
          ${rowHTML('Decimal (32-bit)', decimal, '', 'var(--cyan)')}
          ${rowHTML('Hexadecimal', '0x' + hexStr, '(' + hexDot + ')', 'var(--amber)')}
          ${rowHTML('Binary (dotted)', binStr, '', 'var(--blue)')}
          ${isMask ? rowHTML('Prefix length', '/' + (32 - hostBits), '(' + hostBits + ' host bits)', 'var(--green)') : ''}
          ${isMask ? rowHTML('Wildcard mask', hostBits === 0 ? '0.0.0.0' : (0xFFFFFFFF >>> (32-hostBits) & 0xFF) + ' ..auto', '', 'var(--amber)') : ''}
        </div>
        <div style="font-family:var(--mono);font-size:10px;font-weight:700;color:var(--muted);margin-bottom:6px">OCTET-BY-OCTET BREAKDOWN</div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;overflow:hidden">
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:0">
            ${octets.map((o,i)=>`
              <div style="padding:10px;border-right:${i<3?'1px solid var(--border)':'none'};text-align:center">
                <div style="font-family:var(--mono);font-size:18px;font-weight:700;color:var(--blue)">${o}</div>
                <div style="font-family:var(--mono);font-size:10px;color:var(--green);margin-top:4px">${binOcts[i]}</div>
                <div style="font-family:var(--mono);font-size:10px;color:var(--amber);margin-top:2px">0x${parseInt(o).toString(16).toUpperCase().padStart(2,'0')}</div>
              </div>`).join('')}
          </div>
        </div>
      `;
    };
    
    function normMAC(input) {
      const cleaned = input.replace(/[^0-9a-fA-F]/g, '');
      if (cleaned.length !== 12) return null;
      const pairs = cleaned.match(/.{2}/g);
      return {
        cisco:   pairs.reduce((a,b,i)=> i%2===0 && i>0 ? a+'.'+pairs[i-1]+b : a, pairs[0]+pairs[1]) + (pairs.length>2?'.'+pairs[2]+pairs[3]+(pairs.length>4?'.'+pairs[4]+pairs[5]:''):''),
        unix:    pairs.join(':').toLowerCase(),
        windows: pairs.join('-').toUpperCase(),
        raw:     cleaned.toUpperCase(),
        oui:     pairs.slice(0,3).join(':').toUpperCase()
      };
    }
    
    window.calcMAC = function() {
      const input = document.getElementById('bh-mac').value;
      const el    = document.getElementById('bh-mac-result');
      const m     = normMAC(input);
      if (!m) { el.innerHTML = '<div style="color:var(--red);font-family:var(--mono);font-size:12px">Invalid MAC (need 12 hex digits)</div>'; return; }
    
      const firstOctet = parseInt(m.raw.slice(0,2), 16);
      const isMulticast = (firstOctet & 1) === 1;
      const isLocal     = (firstOctet & 2) === 2;
    
      el.innerHTML = `
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;overflow:hidden">
          ${rowHTML('Cisco format',    m.cisco,    '', 'var(--blue)',  true)}
          ${rowHTML('Unix/Linux',      m.unix,     '', 'var(--green)')}
          ${rowHTML('Windows',         m.windows,  '', 'var(--cyan)')}
          ${rowHTML('Raw / No delim',  m.raw,      '', 'var(--muted2)')}
          ${rowHTML('OUI (Vendor ID)', m.oui,      '', 'var(--amber)')}
          ${rowHTML('Multicast bit',   isMulticast ? 'SET (bit 0 = 1)' : 'Clear (bit 0 = 0)', isMulticast?'→ multicast/broadcast':'→ unicast', isMulticast?'var(--red)':'var(--green)')}
          ${rowHTML('Local admin bit', isLocal ? 'SET (bit 1 = 1)' : 'Clear (bit 1 = 0)', isLocal?'→ locally assigned':'→ globally unique (OUI)', isLocal?'var(--amber)':'var(--text)')}
        </div>
      `;
    };
    
    // ── TAB 6: NUMBER BASE ───────────────────────────────────────────────────
    
    window.calcBase = function(from) {
      const inputs = { dec:'nb-dec', bin:'nb-bin', hex:'nb-hex', oct:'nb-oct' };
      const val = document.getElementById(inputs[from]).value.trim();
      if (!val) { ['dec','bin','hex','oct'].filter(k=>k!==from).forEach(k=>document.getElementById(inputs[k]).value=''); return; }
    
      let num;
      try {
        if (from==='dec') num = parseInt(val, 10);
        else if (from==='bin') num = parseInt(val, 2);
        else if (from==='hex') num = parseInt(val, 16);
        else if (from==='oct') num = parseInt(val, 8);
      } catch(e) { return; }
    
      if (isNaN(num) || num < 0) { document.getElementById(inputs[from]).style.borderColor='var(--red)'; return; }
      document.getElementById(inputs[from]).style.borderColor='var(--border)';
    
      if (from!=='dec') document.getElementById('nb-dec').value = num.toString(10);
      if (from!=='bin') document.getElementById('nb-bin').value = num.toString(2);
      if (from!=='hex') document.getElementById('nb-hex').value = num.toString(16).toUpperCase();
      if (from!=='oct') document.getElementById('nb-oct').value = num.toString(8);
    };
    
    // ── TAB 7: QOS BANDWIDTH ──────────────────────────────────────────────────
    
    const QOS_DEFAULTS = [
      { name:'Voice (EF)',       dscp:'EF',   color:'var(--red)',    pct:10 },
      { name:'Video (AF41)',     dscp:'AF41', color:'var(--amber)',  pct:20 },
      { name:'Critical (AF31)', dscp:'AF31', color:'var(--blue)',   pct:15 },
      { name:'Scavenger (CS1)', dscp:'CS1',  color:'var(--muted2)', pct:5  },
      { name:'Default (BE)',    dscp:'CS0',  color:'var(--muted)',  pct:0  },
    ];
    
    let qosClasses = JSON.parse(JSON.stringify(QOS_DEFAULTS));
    
    window.resetQoS = function() {
      qosClasses = JSON.parse(JSON.stringify(QOS_DEFAULTS));
      renderQoSClasses();
      calcQoS();
    };
    
    function renderQoSClasses() {
      const el = document.getElementById('qos-classes');
      el.innerHTML = qosClasses.map((c,i) => `
        <div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)">
          <div style="width:130px;font-family:var(--mono);font-size:11px;color:${c.color};font-weight:600">${c.name}</div>
          <div style="font-family:var(--mono);font-size:10px;color:var(--muted);width:40px">${c.dscp}</div>
          <input type="range" min="0" max="100" value="${c.pct}" oninput="qosClasses[${i}].pct=parseInt(this.value);calcQoS(this)"
            style="flex:1;accent-color:${c.color.replace('var(--','').replace(')','')==='red'?'#f87171':c.color.replace('var(--','').replace(')','')==='amber'?'#fbbf24':c.color.replace('var(--','').replace(')','')==='blue'?'#5b9cf6':'#4ade80'}">
          <input type="number" min="0" max="100" value="${c.pct}" oninput="qosClasses[${i}].pct=Math.min(100,parseInt(this.value)||0);calcQoS()"
            style="width:55px;padding:6px 8px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;color:var(--text);font-family:var(--mono);font-size:12px;text-align:right;outline:none">
          <span style="font-family:var(--mono);font-size:11px;color:var(--muted);width:12px">%</span>
        </div>
      `).join('');
    }
    
    window.calcQoS = function(slider) {
      if (slider) {
        // Sync slider → number input
        const idx = parseInt(slider.getAttribute('oninput').match(/\[(\d+)\]/)[1]);
        const row = slider.closest('div');
        row.querySelector('input[type=number]').value = qosClasses[idx].pct;
      }
    
      const total   = parseFloat(document.getElementById('qos-total').value) || 100;
      const unit    = document.getElementById('qos-unit').value;
      const linkBps = total * (SPEED_BPS[unit] || 1e6);
    
      const allocated = qosClasses.reduce((s,c)=>s+c.pct,0);
      const remaining = 100 - allocated;
      const voicePct  = qosClasses[0].pct;
    
      const el = document.getElementById('qos-result');
      el.innerHTML = `
        <!-- Bar chart -->
        <div style="margin-bottom:14px">
          <div style="font-family:var(--mono);font-size:10px;color:var(--muted);margin-bottom:6px">BANDWIDTH ALLOCATION</div>
          <div style="height:32px;border-radius:8px;overflow:hidden;display:flex;background:var(--bg2);border:1px solid var(--border)">
            ${qosClasses.map(c=>`
              <div style="width:${c.pct}%;background:${c.color.includes('red')?'rgba(248,113,113,0.5)':c.color.includes('amber')?'rgba(251,191,36,0.5)':c.color.includes('blue')?'rgba(91,156,246,0.5)':'rgba(140,150,180,0.3)'};transition:width 0.3s;position:relative;overflow:hidden">
                ${c.pct>5?`<span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-size:9px;color:rgba(255,255,255,0.8)">${c.pct}%</span>`:''}
              </div>`).join('')}
            <div style="flex:1;background:rgba(74,222,128,0.15);position:relative">
              ${remaining>3?`<span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-size:9px;color:rgba(74,222,128,0.8)">BE ${remaining}%</span>`:''}
            </div>
          </div>
        </div>
    
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
          <div style="background:var(--bg2);border:1px solid ${allocated>100?'rgba(248,113,113,0.5)':allocated===100?'rgba(74,222,128,0.4)':'var(--border)'};border-radius:8px;padding:14px;text-align:center">
            <div style="font-family:var(--mono);font-size:10px;color:var(--muted)">TOTAL ALLOCATED</div>
            <div style="font-family:var(--mono);font-size:24px;font-weight:700;color:${allocated>100?'var(--red)':allocated===100?'var(--green)':'var(--amber)'}">${allocated}%</div>
            <div style="font-family:var(--mono);font-size:10px;color:var(--muted)">${allocated>100?'❌ OVER 100%!':remaining>0?'✅ ' + remaining + '% → default class':'✅ exactly 100%'}</div>
          </div>
          <div style="background:var(--bg2);border:1px solid ${voicePct>33?'rgba(248,113,113,0.5)':'var(--border)'};border-radius:8px;padding:14px;text-align:center">
            <div style="font-family:var(--mono);font-size:10px;color:var(--muted)">VOICE (LLQ)</div>
            <div style="font-family:var(--mono);font-size:24px;font-weight:700;color:${voicePct>33?'var(--red)':'var(--red)'}">${voicePct}%</div>
            <div style="font-family:var(--mono);font-size:10px;color:${voicePct>33?'var(--red)':'var(--muted)'}">${voicePct>33?'⚠️ >33% — too high!':'Max G.711 calls: ~' + Math.floor(linkBps * voicePct/100 / 87000)}</div>
          </div>
        </div>
    
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;overflow:hidden">
          <div style="padding:8px 14px;background:var(--bg3);border-bottom:1px solid var(--border);font-family:var(--mono);font-size:10px;font-weight:700;color:var(--muted)">CLASS BANDWIDTH DETAIL</div>
          ${qosClasses.map(c=>`
            ${rowHTML(c.name + ' (' + c.dscp + ')', fmt(linkBps*c.pct/100/1000), 'Kbps = ' + fmt(linkBps*c.pct/100/1e6) + ' Mbps', c.color)}
          `).join('')}
          ${rowHTML('Default / Best-Effort', fmt(linkBps*remaining/100/1e6), 'Mbps (' + remaining + '%)', 'var(--muted2)', true)}
        </div>
      `;
    };
    
    // ── TAB 8: THROUGHPUT / GOODPUT ───────────────────────────────────────────
    
    window.calcGoodput = function() {
      const speed  = parseFloat(document.getElementById('gp-speed').value)    || 0;
      const spunit = document.getElementById('gp-spunit').value;
      const loss   = parseFloat(document.getElementById('gp-loss').value)     || 0;
      const ovhd   = parseFloat(document.getElementById('gp-overhead').value) || 0;
    
      const bps       = speed * (SPEED_BPS[spunit] || 1e6);
      const goodput   = bps * (1 - ovhd/100) * (1 - loss/100);
      // TCP throughput model: ~1/(RTT * sqrt(loss)) — simplified Mathis formula estimate
      const tcpEff    = loss > 0 ? Math.min(1, 1.22 / Math.sqrt(loss/100)) : 1;
      const tcpGoodput= bps * tcpEff * (1 - ovhd/100);
    
      const el = document.getElementById('gp-result');
      el.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:16px">
          <div style="background:var(--bg3);border:1px solid rgba(74,222,128,0.3);border-radius:10px;padding:14px;text-align:center">
            <div style="font-family:var(--mono);font-size:10px;color:var(--muted);margin-bottom:4px">LINK SPEED</div>
            <div style="font-family:var(--mono);font-size:18px;font-weight:700;color:var(--green)">${fmt(bps/1e6)}</div>
            <div style="font-family:var(--mono);font-size:10px;color:var(--muted)">Mbps</div>
          </div>
          <div style="background:var(--bg3);border:1px solid rgba(91,156,246,0.3);border-radius:10px;padding:14px;text-align:center">
            <div style="font-family:var(--mono);font-size:10px;color:var(--muted);margin-bottom:4px">GOODPUT (UDP)</div>
            <div style="font-family:var(--mono);font-size:18px;font-weight:700;color:var(--blue)">${fmt(goodput/1e6)}</div>
            <div style="font-family:var(--mono);font-size:10px;color:var(--muted)">Mbps = ${(goodput/bps*100).toFixed(1)}%</div>
          </div>
          <div style="background:var(--bg3);border:1px solid ${loss>1?'rgba(248,113,113,0.3)':'rgba(251,191,36,0.3)'};border-radius:10px;padding:14px;text-align:center">
            <div style="font-family:var(--mono);font-size:10px;color:var(--muted);margin-bottom:4px">TCP GOODPUT</div>
            <div style="font-family:var(--mono);font-size:18px;font-weight:700;color:${loss>1?'var(--red)':'var(--amber)'}">${fmt(tcpGoodput/1e6)}</div>
            <div style="font-family:var(--mono);font-size:10px;color:var(--muted)">Mbps = ${(tcpGoodput/bps*100).toFixed(1)}%</div>
          </div>
        </div>
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;overflow:hidden">
          ${rowHTML('Raw link speed', fmt(bps/1e6), 'Mbps', 'var(--green)')}
          ${rowHTML('After protocol overhead (' + ovhd + '%)', fmt(bps*(1-ovhd/100)/1e6), 'Mbps', 'var(--cyan)')}
          ${rowHTML('After packet loss (' + loss + '%)', fmt(goodput/1e6), 'Mbps (UDP)', 'var(--blue)')}
          ${rowHTML('TCP goodput (Mathis model)', fmt(tcpGoodput/1e6), 'Mbps', loss>1?'var(--red)':'var(--amber)', true)}
          ${rowHTML('Effective loss ratio', fmt(100-goodput/bps*100,2) + '%', 'bandwidth lost', loss>1?'var(--red)':'var(--muted2)')}
          ${rowHTML('Bytes wasted per second', fmt((bps-goodput)/8/1e6), 'MB/s', 'var(--muted2)')}
        </div>
        ${loss>=1?'<div class="callout callout-warn" style="margin-top:10px">⚠️ '+loss+'% loss severely degrades TCP! Mathis formula: TCP goodput ≈ MSS / (RTT × √loss). At 1% loss, TCP may only achieve ~6% of link capacity.</div>':''}
      `;
    };
    
    // ── TAB 9: PROTOCOL TIMERS ────────────────────────────────────────────────
    
    window.calcTimers = function() {
      const val  = parseFloat(document.getElementById('tm-val').value) || 0;
      const unit = document.getElementById('tm-unit').value;
    
      let secs;
      if (unit === 'ms')  secs = val / 1000;
      else if (unit==='s') secs = val;
      else if (unit==='min') secs = val * 60;
      else if (unit==='hr') secs = val * 3600;
    
      const ms  = secs * 1000;
      const min = secs / 60;
      const hr  = secs / 3600;
    
      document.getElementById('tm-result').innerHTML = `
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px">
          ${[
            ['Milliseconds', fmt(ms,2),  'ms',  'var(--cyan)'],
            ['Seconds',      fmt(secs,4),'s',   'var(--blue)'],
            ['Minutes',      fmt(min,4), 'min', 'var(--amber)'],
            ['Hours',        fmt(hr,6),  'hr',  'var(--green)'],
          ].map(([l,v,u,c])=>`
            <div style="background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:12px;text-align:center">
              <div style="font-family:var(--mono);font-size:10px;color:var(--muted);margin-bottom:4px">${l}</div>
              <div style="font-family:var(--mono);font-size:16px;font-weight:700;color:${c}">${v}</div>
              <div style="font-family:var(--mono);font-size:10px;color:var(--muted)">${u}</div>
            </div>`).join('')}
        </div>
      `;
    };
    
    /* ── INJECT PAGE & INIT ─────────────────────────────────────────────────── */
    
    function injectConverters() {
      const placeholder = document.getElementById('page-converters');
      if (placeholder && placeholder.innerHTML.trim() === '') {
        placeholder.outerHTML = convertersHTML;
      }
    
      // Wait for DOM then init all calculators
      setTimeout(() => {
        calcDataSize();
        calcBandwidth();
        calcTransfer();
        calcBDP();
        calcMTU();
        calcBinHex();
        calcMAC();
        calcBase('dec');
        document.getElementById('nb-dec').value = '42';
        calcBase('dec');
        renderQoSClasses();
        calcQoS();
        calcGoodput();
        calcTimers();
    
        // Set default Transfer Time overhead button
        const ovhdBtns = document.querySelectorAll('.tt-ovhd');
        if (ovhdBtns[1]) { // TCP 5%
          ovhdBtns[1].style.background = 'rgba(251,191,36,0.15)';
          ovhdBtns[1].style.color = 'var(--amber)';
          ovhdBtns[1].style.borderColor = 'rgba(251,191,36,0.4)';
        }
      }, 50);
    }
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', injectConverters);
    } else {
      injectConverters();
    }
    
    })();