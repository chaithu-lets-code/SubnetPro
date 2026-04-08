  // ═══════════════════════════════════════════════════
  // INIT
  // ═══════════════════════════════════════════════════

  
  window.addEventListener('resize', () => {
    if (document.getElementById('page-dhcp').classList.contains('active')) dhcpDrawTopo(false);
    if (document.getElementById('page-dns').classList.contains('active')) dnsDrawTopo(false);
    if (document.getElementById('page-arp').classList.contains('active'))        arpDrawTopo(false);
    if (document.getElementById('page-nat').classList.contains('active'))        natDrawTopo(false);
    if (document.getElementById('page-tcp-seg').classList.contains('active'))    tcpSegRedraw();
    if (document.getElementById('page-mtu').classList.contains('active'))        mtuRedraw();
    if (document.getElementById('page-eigrp').classList.contains('active'))      eigrpRedraw();
    if (document.getElementById('page-tls').classList.contains('active'))        tlsDrawTopo(false);
    if (document.getElementById('page-icmp').classList.contains('active'))       icmpDrawTopo(false);
    if (document.getElementById('page-dhcp-relay').classList.contains('active')) relayDrawTopo();

  });
 



// ─── NAVIGATION ──────────────────────────────────────────────────────────
function gotoPage(id, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  history.replaceState(null, '', '#' + id);
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const pg = $('page-'+id);
  if(pg) { pg.classList.add('active'); void pg.offsetWidth; pg.classList.add('fade-up'); }
  if(btn) btn.classList.add('active');
  if(window.innerWidth <= 700) closeMob();
  // init pages
  if(id==='binary') { initPB(); dec2bin(); calcAND(); }
  if(id==='masks') { updateMask(); }
  if(id==='cidr') { cidrExplain(); }
  if(id==='classes') { lookupClass(); }
  if(id==='quiz') { if(!qLoaded) { resetQuiz(); qLoaded=true; } }
  if(id==='tools') { calcWC(); findPrefix(); convertAll('dec'); }
  if(id==='ipv6') { analyzeV6(); calcEUI64(); v6Compress(); buildPTR(); validateV6List(); v6Classify(); buildSNM(); renderMcastTable(); renderAddrTypes(); renderDHCPCompare(); renderTransCompare(); calcDualStack(); calc6to4(); calcNAT64(); calcV6Subnet(); v6Hierarchy(); }
  if(id==='vlsm') initVLSM();
  if(id==='subnet-tree') vstInit();
  if(id==='tracer') ptInit();
  if(id==='about') { setTimeout(aboutNetAnim,100); /* static — no init needed */ }
  if(id==='ccna') { setTimeout(()=>initCourse('ccna'),0); }
  if(id==='ccnp') { setTimeout(()=>initCourse('ccnp'),0); }
  if(id==='ccie') { setTimeout(()=>initCourse('ccie'),0); }
  if(id==='interview') { setTimeout(()=>interviewInit(), 100); }
  if(id==='bgp-regex') { setTimeout(()=>bgpRegexInit(), 100); }
  if(id==='ospf-canvas') { setTimeout(()=>ospfCanvasInit(),100); }
  if(id==='mpls-walker') { setTimeout(()=>mplsInit(),100); }
  if(id==='conv-calc') { setTimeout(()=>{ ccBuildInputs(); convCalcUpdate(); },100); }
  if(id==='lsa-explorer') { setTimeout(()=>lsaExplorerInit(),100); }
  if(id==='broken-configs') { setTimeout(()=>bcInit(),100); }
  if(id==='route-parser') { rpClear(); }
  if(id==='show-interp') { }
  if(id==='net-design') { setTimeout(()=>ndRender(),100); }
  if(id==='bgp-hijack') { setTimeout(()=>hijackInit(),100); }
  if(id==='tunnel-builder') { tbRender(); }
  if(id==='stp-sim') { setTimeout(()=>stpSimInit(),120); }
  if(id==='vlan-viz') { setTimeout(()=>vlanVizInit(),100); }
  if(id==='tcp-anim') { setTimeout(()=>tcpAnimInit(),100); }
  if(id==='pfx-builder') { setTimeout(()=>pfxBuilderInit(),100); }
  if(id==='dhcp') { setTimeout(()=>{dhcpDrawTopo(false); dhcpRenderPool({offered:null,leased:null}); updateDoraChain(0);}, 100); }
  if(id==='dns')  { setTimeout(()=>{dnsSetMode(dnsMode||'recursive');}, 100); }
  if(id==='arp')        { setTimeout(()=>arpInit(), 100); }
  if(id==='nat')        { setTimeout(()=>natInit(), 100); }
  if(id==='tcp-seg')    { setTimeout(()=>tcpSegInit(), 100); }
  if(id==='acl-sim')    { setTimeout(()=>aclSimInit(), 100); }
  if(id==='dhcp-relay') { setTimeout(()=>dhcpRelayInit(), 100); }
  if(id==='mtu')        { setTimeout(()=>mtuInit(), 100); }
  if(id==='eigrp')      { setTimeout(()=>eigrpInit(), 100); }
  if(id==='tls')        { setTimeout(()=>tlsInit(), 100); }
  if(id==='qos')        { setTimeout(()=>qosInit(), 100); }
  if(id==='icmp')       { setTimeout(()=>icmpInit(), 100); }
  if(id==='bgp-anim') { setTimeout(()=>{ if(!BA.canvas) bgpAnimInit(); },100); }
  if(id==='bgp-anim') { setTimeout(()=>{ if(!BA.canvas) bgpAnimInit(); },100); }
  if(history && history.pushState) history.pushState(null,'','#'+id);
}
function toggleMob() {
  document.getElementById("sidebar").classList.toggle("open");
}
function closeMob() { $('sidebar').classList.remove('open'); }

// ─── MAIN CALC ────────────────────────────────────────────────────────────
function liveCalc() { calculate(); }

function setExample(ip, pfx) {
  $('ip-in').value = ip;
  $('pfx-in').value = pfx;
  liveCalc();
}

function calculate() {
  const rawIP = $('ip-in').value.trim();
  const rawPfx = $('pfx-in').value.trim();
  const ipOk = validateIP(rawIP);
  const pfxOk = validatePrefix(rawPfx);

  $('ip-in').className = rawIP ? (ipOk ? 'ok' : 'error') : '';
  $('pfx-in').className = rawPfx ? (pfxOk ? 'ok' : 'error') : '';
  $('ip-err').className = 'err-msg' + (!ipOk && rawIP ? ' show' : '');
  $('pfx-err').className = 'err-msg' + (!pfxOk && rawPfx ? ' show' : '');

  if(!ipOk || !pfxOk) return;

  const prefix = getPrefix(rawPfx);
  const mask = maskFromP(prefix);
  const wild = (~mask) >>> 0;
  const ipNum = ip2n(rawIP);
  const network = (ipNum & mask) >>> 0;
  const broadcast = (network | wild) >>> 0;
  const totalIPs = Math.pow(2, 32-prefix);
  const hosts = prefix >= 31 ? totalIPs : totalIPs - 2;
  const first = prefix === 32 ? network : network + 1;
  const last = prefix === 32 ? broadcast : broadcast - 1;

  const oct1 = parseInt(rawIP.split('.')[0]);
  let cls = '—';
  if(oct1 < 128) cls='A'; else if(oct1<192) cls='B'; else if(oct1<224) cls='C';
  else if(oct1<240) cls='D (Multicast)'; else cls='E (Reserved)';

  $('r-net').textContent = n2ip(network);
  $('r-bc').textContent = n2ip(broadcast);
  $('r-first').textContent = n2ip(first);
  $('r-last').textContent = n2ip(last);
  $('r-hosts').textContent = hosts.toLocaleString();
  $('r-total').textContent = totalIPs.toLocaleString();
  $('r-mask').textContent = n2ip(mask);
  $('r-wild').textContent = n2ip(wild);
  $('r-class').textContent = cls;
  $('r-cidr').textContent = n2ip(network) + '/' + prefix;
  $('r-netbin').textContent = n2ip(network).split('.').map(toBin8).join('.');
  $('r-maskbin').textContent = n2ip(mask).split('.').map(toBin8).join('.');

  renderBitmap($('bm-bits'), $('bm-labels'), ipNum, prefix);
  renderSteps(rawIP, prefix, mask, network, broadcast, first, last, hosts, totalIPs);
}

function renderBitmapSVG(svgId, ipNum, prefix) {
  var svg = document.getElementById(svgId);
  if(!svg) return;

  var bits = ipNum.toString(2).padStart(32,'0').split('');
  var octets = [ bits.slice(0,8), bits.slice(8,16), bits.slice(16,24), bits.slice(24,32) ];
  var ipStr = octets.map(function(o){ return parseInt(o.join(''),2); });

  var W = 560, cellW = 12, cellH = 22, cellGap = 1;
  var octW = 8 * (cellW + cellGap) - cellGap;
  var octGap = 10;
  var totalRow = 4 * octW + 3 * octGap;
  var startX = (W - totalRow) / 2;
  var labelY = 12, bitY = 28, octLabelY = 62, dividerY = 72, barY = 80, barH = 16, octNameY = 108;
  var octColors = ['#5b9cf6','#38d9c0','#a78bfa','#fb923c'];

  var out = '';

  octets.forEach(function(oct, oi) {
    var ox = startX + oi * (octW + octGap);
    var cx = ox + octW / 2;

    // Bracket line under bits
    out += '<line x1="'+ox+'" y1="'+dividerY+'" x2="'+(ox+octW)+'" y2="'+dividerY+'" stroke="rgba(100,120,180,0.2)" stroke-width="1"/>';
    out += '<line x1="'+ox+'" y1="'+(dividerY)+'" x2="'+ox+'" y2="'+(dividerY-5)+'" stroke="rgba(100,120,180,0.2)" stroke-width="1"/>';
    out += '<line x1="'+(ox+octW)+'" y1="'+(dividerY)+'" x2="'+(ox+octW)+'" y2="'+(dividerY-5)+'" stroke="rgba(100,120,180,0.2)" stroke-width="1"/>';

    // Octet decimal value
    out += '<text x="'+cx+'" y="'+octLabelY+'" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="11" font-weight="700" fill="'+octColors[oi]+'">'+ipStr[oi]+'</text>';

    // "Octet N" label
    out += '<text x="'+cx+'" y="'+octNameY+'" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="9" fill="rgba(140,150,180,0.6)">Octet '+(oi+1)+'</text>';

    // Bit cells
    oct.forEach(function(bit, bi) {
      var globalBit = oi * 8 + bi;
      var isNet = globalBit < prefix;
      var bx = ox + bi * (cellW + cellGap);
      var fill   = isNet ? 'rgba(91,156,246,0.22)' : 'rgba(56,217,192,0.1)';
      var stroke = isNet ? 'rgba(91,156,246,0.5)'  : 'rgba(56,217,192,0.28)';
      out += '<rect x="'+bx+'" y="'+bitY+'" width="'+cellW+'" height="'+cellH+'" rx="2" fill="'+fill+'" stroke="'+stroke+'" stroke-width="0.7"/>';
      var tc = bit==='1' ? (isNet?'#7db3ff':'#5ee8d4') : 'rgba(140,150,180,0.4)';
      out += '<text x="'+(bx+cellW/2)+'" y="'+(bitY+cellH/2+1)+'" text-anchor="middle" dominant-baseline="central" font-family="IBM Plex Mono,monospace" font-size="9" font-weight="700" fill="'+tc+'">'+bit+'</text>';
      // Bit index label every 4 bits
      if(bi===0||bi===4) {
        out += '<text x="'+(bx+cellW/2)+'" y="'+labelY+'" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="rgba(140,150,180,0.45)">'+(globalBit+1)+'</text>';
      }
    });

    // Colour bar per octet
    var netN = Math.min(8, Math.max(0, prefix - oi*8));
    if(netN > 0) {
      var bw = netN*(cellW+cellGap)-cellGap;
      out += '<rect x="'+ox+'" y="'+barY+'" width="'+bw+'" height="'+barH+'" rx="3" fill="rgba(91,156,246,0.22)" stroke="rgba(91,156,246,0.4)" stroke-width="0.7"/>';
    }
    if(netN < 8) {
      var hs = ox + netN*(cellW+cellGap);
      var hw = (8-netN)*(cellW+cellGap)-cellGap;
      out += '<rect x="'+hs+'" y="'+barY+'" width="'+hw+'" height="'+barH+'" rx="3" fill="rgba(56,217,192,0.1)" stroke="rgba(56,217,192,0.28)" stroke-width="0.7"/>';
    }
  });

  // Net/host boundary marker
  if(prefix > 0 && prefix < 32) {
    var bOct = Math.floor(prefix/8), bBit = prefix%8;
    var bx = startX + bOct*(octW+octGap) + bBit*(cellW+cellGap) - 2;
    out += '<line x1="'+bx+'" y1="'+(bitY-5)+'" x2="'+bx+'" y2="'+(bitY+cellH+5)+'" stroke="#fbbf24" stroke-width="1.5" stroke-dasharray="3 2"/>';
    out += '<text x="'+bx+'" y="'+(bitY-8)+'" text-anchor="middle" font-family="DM Sans,sans-serif" font-size="8" font-weight="700" fill="#fbbf24">/'+prefix+'</text>';
  }

  svg.innerHTML = out;
}

function renderBitmap(gridEl, labelsEl, ipNum, prefix) {
  renderBitmapSVG('bm-svg', ipNum, prefix);
  if(gridEl) gridEl.innerHTML = '';
  if(labelsEl) labelsEl.innerHTML = '';
}

function renderSteps(ip, prefix, mask, network, broadcast, first, last, hosts, total) {
  const ipBin = ip.split('.').map(o => toBin8(parseInt(o))).join('.');
  const maskBin = n2ip(mask).split('.').map(toBin8).join('.');
  const netBin = n2ip(network).split('.').map(toBin8).join('.');

  const steps = [
    { n:'Step 1 — Identify the prefix', b:`Your IP is <code>${ip}</code> with prefix <code>/${prefix}</code>. This means the first <span class="hl">${prefix} bits</span> are the network portion and the remaining <span class="hl2">${32-prefix} bits</span> are the host portion.` },
    { n:'Step 2 — Convert IP to binary', b:`<code>${ip}</code><br>= <code>${ipBin}</code>` },
    { n:'Step 3 — Write the subnet mask', b:`Prefix /${prefix} → all 1s for first ${prefix} bits, all 0s for rest<br>= <code>${n2ip(mask)}</code><br>= <code>${maskBin}</code>` },
    { n:'Step 4 — AND operation → Network Address', b:`IP AND Mask = Network<br><code>${ipBin}</code><br>AND <code>${maskBin}</code><br>= <code>${netBin}</code><br>= <span class="hl">${n2ip(network)}</span>` },
    { n:'Step 5 — Broadcast Address', b:`Set all host bits to 1:<br>Network <code>${n2ip(network)}</code> with /${prefix}<br>→ Broadcast = <span class="hl">${n2ip(broadcast)}</span>` },
    { n:'Step 6 — Usable Host Range', b:`First host = network + 1 = <span class="hl2">${n2ip(first)}</span><br>Last host = broadcast - 1 = <span class="hl2">${n2ip(last)}</span><br>Formula: 2<sup>${32-prefix}</sup>${prefix<=30?' − 2':''} = <span class="hl">${hosts.toLocaleString()} usable hosts</span>` }
  ];

  $('steps-box').innerHTML = steps.map((s,i) => `
    <div class="step-item" id="si${i}" style="transition-delay:${i*0.07}s">
      <div class="step-num">${s.n}</div>
      <div class="step-body">${s.b}</div>
    </div>`).join('');
  setTimeout(() => document.querySelectorAll('.step-item').forEach(s => s.classList.add('vis')), 30);
}

function checkIP() {
  const ip = $('check-ip').value.trim();
  if(!validateIP(ip)) { $('check-result').innerHTML = '<div class="callout callout-err">Invalid IP address</div>'; return; }
  const rawIP = $('ip-in').value.trim();
  const rawPfx = $('pfx-in').value.trim();
  if(!validateIP(rawIP)||!validatePrefix(rawPfx)) { $('check-result').innerHTML = '<div class="callout callout-warn">Calculate a subnet first</div>'; return; }
  const prefix = getPrefix(rawPfx);
  const mask = maskFromP(prefix);
  const network = (ip2n(rawIP) & mask)>>>0;
  const broadcast = (network|(~mask>>>0))>>>0;
  const testNum = ip2n(ip);
  const inNet = testNum >= network && testNum <= broadcast;
  const isNet = testNum === network;
  const isBC = testNum === broadcast;
  let msg = '', cls = '';
  if(!inNet) { msg = `❌ ${ip} is NOT in ${n2ip(network)}/${prefix}`; cls = 'callout-err'; }
  else if(isNet) { msg = `⚠️ ${ip} is the NETWORK address — not usable as a host`; cls = 'callout-warn'; }
  else if(isBC) { msg = `⚠️ ${ip} is the BROADCAST address — not usable as a host`; cls = 'callout-warn'; }
  else { msg = `✅ ${ip} is a valid HOST in ${n2ip(network)}/${prefix}`; cls = 'callout-ok'; }
  $('check-result').innerHTML = `<div class="callout ${cls}">${msg}</div>`;
}

// ─── VLSM ────────────────────────────────────────────────────────────────
let vlsmCount = 3;
function initVLSM() {
  if($('vlsm-rows').children.length) return;
  [50,20,10].forEach((h,i) => addVLSMRow(h, 'Subnet '+(i+1)));
}
function addVLSMRow(defVal='', defName='') {
  vlsmCount++;
  const d = document.createElement('div');
  d.className = 'inline-row';
  d.style.marginBottom = '8px';
  const n = $('vlsm-rows').children.length + 1;
  d.innerHTML = `
    <div class="field-group" style="flex:1;margin-bottom:0">
      <label class="field-label">${defName||'Subnet '+n} Name</label>
      <input type="text" value="${defName||'Subnet '+n}" placeholder="VLAN name">
    </div>
    <div class="field-group" style="flex:1;margin-bottom:0">
      <label class="field-label">Hosts Needed</label>
      <input type="number" value="${defVal||''}" placeholder="e.g. 50" min="1">
    </div>
    <button class="btn-ghost btn-sm" style="margin-top:22px;color:var(--red);border-color:rgba(248,113,113,0.3)" onclick="this.parentElement.remove()">✕</button>
  `;
  $('vlsm-rows').appendChild(d);
}
function resetVLSM() { $('vlsm-rows').innerHTML=''; vlsmCount=0; $('vlsm-result').innerHTML='<div style="font-family:var(--mono);font-size:12px;color:var(--muted)">Fill in requirements...</div>'; initVLSM(); }

function calcVLSM() {
  const base = $('v-base').value.trim();
  const pfxStr = $('v-pfx').value.trim();
  const baseOk = validateIP(base);
  const pfxOk = validatePrefix(pfxStr);
  $('v-base').className = baseOk ? 'ok' : 'error';
  $('v-pfx').className = pfxOk ? 'ok' : 'error';
  $('v-base-err').className = 'err-msg' + (!baseOk ? ' show' : '');
  $('v-pfx-err').className = 'err-msg' + (!pfxOk ? ' show' : '');
  if(!baseOk||!pfxOk) return;

  const prefix = getPrefix(pfxStr);
  const rows = [...$('vlsm-rows').querySelectorAll('.inline-row')];
  const needs = rows.map(r => {
    const inputs = r.querySelectorAll('input');
    return { name: inputs[0].value || 'Subnet', hosts: parseInt(inputs[1].value) || 0 };
  }).filter(n => n.hosts > 0).sort((a,b) => b.hosts - a.hosts);

  if(!needs.length) { $('vlsm-result').innerHTML = '<div class="callout callout-warn">Add at least one subnet with hosts &gt; 0</div>'; return; }

  const totalAvail = Math.pow(2, 32-prefix);
  let totalNeeded = needs.reduce((a,n) => { let b=1; while(Math.pow(2,b)<n.hosts+2)b++; return a+Math.pow(2,b); }, 0);
  if(totalNeeded > totalAvail) { $('vlsm-result').innerHTML = `<div class="callout callout-err">Not enough space! Need ${totalNeeded.toLocaleString()} IPs but base /${prefix} only has ${totalAvail.toLocaleString()}</div>`; return; }

  let current = ip2n(base);
  const results = [];
  const colors = ['#5b9cf6','#38d9c0','#4ade80','#fbbf24','#f472b6','#f87171','#a78bfa','#fb923c'];

  for(const n of needs) {
    let bits = 1;
    while(Math.pow(2,bits) < n.hosts+2) bits++;
    const pfx = 32-bits;
    const m = maskFromP(pfx);
    const net = (current & m) >>> 0;
    const bc = (net|(~m>>>0)) >>> 0;
    results.push({ name:n.name, need:n.hosts, pfx, net:n2ip(net), bc:n2ip(bc), first:n2ip(net+1), last:n2ip(bc-1), total:Math.pow(2,bits), usable:Math.pow(2,bits)-2, mask:n2ip(m) });
    current = bc+1;
  }

  const totalUsed = results.reduce((a,r) => a+r.total, 0);
  const pct = (results.map((r,i) => ({ w:(r.total/totalAvail*100).toFixed(1), c:colors[i%colors.length], n:r.name }))).map(s => `<div class="vlsm-seg" style="width:${s.w}%;background:${s.c}22;border-right:1px solid ${s.c}55;color:${s.c};padding:0 4px;overflow:hidden;white-space:nowrap">${s.n}</div>`).join('');

  $('vlsm-result').innerHTML = `
    <div style="margin-bottom:12px">
      <div class="r-label">Address Space Usage</div>
      <div class="vlsm-bar">${pct}<div class="vlsm-seg" style="flex:1;background:var(--bg3);color:var(--muted)">free</div></div>
      <div style="font-family:var(--mono);font-size:11px;color:var(--muted)">${totalUsed.toLocaleString()} used / ${totalAvail.toLocaleString()} total</div>
    </div>
    <div class="tbl-wrap">
      <table class="tbl">
        <tr><th>Subnet</th><th>Network</th><th>Prefix</th><th>Mask</th><th>First Host</th><th>Last Host</th><th>Broadcast</th><th>Usable</th></tr>
        ${results.map((r,i) => `<tr><td style="color:${colors[i%colors.length]}">${r.name}</td><td>${r.net}</td><td>/${r.pfx}</td><td>${r.mask}</td><td style="color:var(--green)">${r.first}</td><td style="color:var(--green)">${r.last}</td><td style="color:var(--pink)">${r.bc}</td><td style="color:var(--amber)">${r.usable.toLocaleString()}</td></tr>`).join('')}
      </table>
    </div>`;
}

// ─── IPv6 ─────────────────────────────────────────────────────────────────
function expandV6(addr) {
  let a = addr.trim();
  if(a.includes('::')) {
    const sides = a.split('::');
    const L = sides[0] ? sides[0].split(':') : [];
    const R = sides[1] ? sides[1].split(':') : [];
    const fill = 8 - L.length - R.length;
    a = [...L, ...Array(fill).fill('0'), ...R].join(':');
  }
  return a.split(':').map(g => g.padStart(4,'0')).join(':');
}
function compressV6(expanded) {
  let compressed = expanded.replace(/\b0+(\w)/g,'$1');
  let best = '', cur = '', bestLen = 0;
  compressed.split(':').forEach((g,i,arr) => {
    if(g==='0') { cur += (cur?':':'')+'0'; if(cur.length > bestLen) { bestLen=cur.length; best=cur; } }
    else cur='';
  });
  if(best) compressed = compressed.replace(new RegExp(best.split(':').join(':(?:0:)*')),'::').replace(/:{3,}/,'::');
  return compressed;
}
function isValidV6(addr) {
  const a = addr.trim();
  if(a === '::') return true;
  if((a.match(/::/g)||[]).length > 1) return false;
  const full = expandV6(a);
  const parts = full.split(':');
  return parts.length === 8 && parts.every(p => /^[0-9a-fA-F]{1,4}$/.test(p));
}

// ─── OVERLAP CHECKER ──────────────────────────────────────────────────────
function checkOverlaps() {
  const lines = $('ov-nets').value.trim().split('\n').filter(l=>l.trim());
  const nets = [];
  const errs = [];
  lines.forEach((l,i) => {
    const p = l.trim().split('/');
    if(p.length!==2||!validateIP(p[0])||!validatePrefix('/'+p[1])) { errs.push(`Line ${i+1}: "${l.trim()}" is invalid`); return; }
    const prefix = parseInt(p[1]);
    const mask = maskFromP(prefix);
    const net = (ip2n(p[0])&mask)>>>0;
    const bc = (net|(~mask>>>0))>>>0;
    nets.push({ cidr:l.trim(), net, bc, prefix });
  });
  if(errs.length) { $('ov-result').innerHTML = errs.map(e=>`<div class="callout callout-err">${e}</div>`).join(''); return; }
  if(nets.length < 2) { $('ov-result').innerHTML = '<div class="callout callout-warn">Enter at least 2 networks to compare</div>'; return; }

  const overlaps = [];
  for(let i=0;i<nets.length;i++) for(let j=i+1;j<nets.length;j++) {
    if(nets[i].net<=nets[j].bc && nets[j].net<=nets[i].bc) {
      const cont = nets[i].net<=nets[j].net && nets[i].bc>=nets[j].bc;
      overlaps.push({ a:nets[i].cidr, b:nets[j].cidr, contained:cont });
    }
  }

  if(!overlaps.length) {
    $('ov-result').innerHTML = `<div class="callout callout-ok">✅ No overlaps detected — all ${nets.length} networks are in separate address spaces.</div>
    <div class="tbl-wrap"><table class="tbl"><tr><th>Network</th><th>Range</th><th>Status</th></tr>
    ${nets.map(n=>`<tr><td>${n.cidr}</td><td>${n2ip(n.net)} – ${n2ip(n.bc)}</td><td style="color:var(--green)">✓ Clean</td></tr>`).join('')}
    </table></div>`;
  } else {
    $('ov-result').innerHTML = `<div class="callout callout-err">⚠️ ${overlaps.length} overlap${overlaps.length>1?'s':''} detected!</div>
    ${overlaps.map(o=>`<div class="callout callout-err">${o.a} ${o.contained?'contains':'overlaps with'} ${o.b}</div>`).join('')}
    <div class="tbl-wrap"><table class="tbl"><tr><th>Network</th><th>Range</th><th>Status</th></tr>
    ${nets.map(n=>{ const bad=overlaps.some(o=>o.a===n.cidr||o.b===n.cidr); return `<tr><td>${n.cidr}</td><td>${n2ip(n.net)} – ${n2ip(n.bc)}</td><td style="color:${bad?'var(--red)':'var(--green)'}">${bad?'⚠ Overlap':'✓ OK'}</td></tr>`; }).join('')}
    </table></div>`;
  }
}

// ─── SUPERNET ─────────────────────────────────────────────────────────────
function calcSupernet() {
  const lines = $('sn-nets').value.trim().split('\n').filter(l=>l.trim());
  const nets = [];
  lines.forEach(l => {
    const p = l.trim().split('/');
    if(p.length!==2||!validateIP(p[0])||!validatePrefix('/'+p[1])) return;
    const pfx = parseInt(p[1]), mask = maskFromP(pfx);
    nets.push({ cidr:l.trim(), net:(ip2n(p[0])&mask)>>>0, pfx });
  });
  if(nets.length < 2) { $('sn-result').innerHTML='<div class="callout callout-warn">Enter at least 2 valid CIDR blocks</div>'; return; }
  nets.sort((a,b) => a.net - b.net);
  let pfx = nets[0].pfx, first = nets[0].net;
  for(const n of nets) {
    while(pfx>0 && (first & maskFromP(pfx)) !== (n.net & maskFromP(pfx))) pfx--;
    if(pfx<=0) break;
  }
  const summaryNet = (first & maskFromP(pfx)) >>> 0;
  const totalCovered = Math.pow(2, 32-pfx);
  $('sn-result').innerHTML = `
    <div class="callout callout-ok">Summary route covers all ${nets.length} networks:</div>
    <div class="mono-big cyan">${n2ip(summaryNet)}/${pfx}</div>
    <div class="results-grid" style="margin-top:12px">
      <div class="r-card"><div class="r-label">Prefix</div><div class="r-val blue">/${pfx}</div></div>
      <div class="r-card"><div class="r-label">Total IPs Covered</div><div class="r-val amber">${totalCovered.toLocaleString()}</div></div>
      <div class="r-card"><div class="r-label">Networks Aggregated</div><div class="r-val green">${nets.length}</div></div>
    </div>
    <div style="font-family:var(--mono);font-size:12px;color:var(--muted);margin-top:12px">
      Routes summarized:<br>${nets.map(n=>`<span style="color:var(--cyan)"> • ${n.cidr}</span>`).join('<br>')}
    </div>`;
}

// ─── BINARY BASICS ────────────────────────────────────────────────────────
const W8 = [128,64,32,16,8,4,2,1];
let pbVals = Array(8).fill(0);

function dec2bin() {
  let v = parseInt($('dec-in').value);
  if(isNaN(v)) return;
  v = Math.max(0,Math.min(255,v));
  const bin = v.toString(2).padStart(8,'0');
  $('bin-in').value = bin;
  updateDBView(v, bin);
}
function bin2dec() {
  const b = $('bin-in').value.trim();
  if(!/^[01]{1,8}$/.test(b)) { $('bin-in').className='error'; return; }
  $('bin-in').className='ok';
  const v = parseInt(b.padStart(8,'0'),2);
  $('dec-in').value = v;
  updateDBView(v, b.padStart(8,'0'));
}
function updateDBView(v, bin) {
  const bits = bin.split('');
  $('db-bits').innerHTML = bits.map((b,i)=>`<div class="bit ${b==='1'?'net':'host'}" style="cursor:default">${b}</div>`).join('');
  $('db-weights').innerHTML = W8.map(w=>`<span class="pbit-weight">${w}</span>`).join('');
  const parts = bits.map((b,i)=>b==='1'?W8[i]:0).filter(x=>x>0);
  $('db-explain').textContent = parts.length ? `${parts.join(' + ')} = ${v}` : '= 0';
}

function initPB() {
  if($('pb-bits').children.length) return;
  pbVals = Array(8).fill(0);
  $('pb-weights').innerHTML = W8.map(w=>`<span class="pbit-weight">${w}</span>`).join('');
  $('pb-bits').innerHTML = '';
  W8.forEach((w,i) => {
    const b = document.createElement('div');
    b.className = 'pbit'; b.textContent = '0'; b.dataset.i = i;
    b.onclick = () => { pbVals[i]^=1; b.className='pbit'+(pbVals[i]?' on':''); b.textContent=pbVals[i]?'1':'0'; $('pb-val').textContent=pbVals.reduce((a,v,j)=>a+v*W8[j],0); };
    $('pb-bits').appendChild(b);
  });
}
function pbSet(arr) {
  pbVals = arr;
  const bits = $('pb-bits').querySelectorAll('.pbit');
  bits.forEach((b,i) => { b.className='pbit'+(arr[i]?' on':''); b.textContent=arr[i]?'1':'0'; });
  $('pb-val').textContent = arr.reduce((a,v,i)=>a+v*W8[i],0);
}

function calcAND() {
  const ip = $('and-ip').value.trim();
  const mask = $('and-mask').value.trim();
  if(!validateIP(ip)||!validateIP(mask)) { $('and-result').textContent='—'; $('and-visual').innerHTML=''; return; }
  const result = (ip2n(ip) & ip2n(mask)) >>> 0;
  $('and-result').textContent = n2ip(result);
  const ipParts = ip.split('.').map(Number);
  const mParts = mask.split('.').map(Number);
  const rParts = n2ip(result).split('.').map(Number);
  $('and-visual').innerHTML = [
    `IP:      <span style="color:var(--blue)">${ipParts.map(toBin8).join(' ')}</span>`,
    `Mask:    <span style="color:var(--cyan)">${mParts.map(toBin8).join(' ')}</span>`,
    `         ${'─'.repeat(35)}`,
    `Network: <span style="color:var(--green)">${rParts.map(toBin8).join(' ')}</span>  =  ${n2ip(result)}`
  ].join('\n');
}

// ─── MASKS ────────────────────────────────────────────────────────────────
function updateMask() {
  const p = parseInt($('mask-sl').value);
  $('mask-sl-val').textContent = '/'+p;
  const mask = maskFromP(p);
  $('mask-val').textContent = n2ip(mask);
  const hostBits = 32-p;
  const total = Math.pow(2, hostBits);
  $('m-hbits').textContent = hostBits;
  $('m-total').textContent = total.toLocaleString();
  $('m-usable').textContent = (p>=31 ? total : total-2).toLocaleString();
  // Use SVG renderer for mask bitmap
  renderBitmapSVG('mask-svg', ip2n(n2ip(mask)), p);
  $('mask-explain').innerHTML = [
    `Prefix: <span style="color:var(--blue)">/${p}</span>`,
    `Network bits: <span style="color:var(--blue)">${p}</span> (fixed — identify the network)`,
    `Host bits: <span style="color:var(--cyan)">${hostBits}</span> (flexible — identify individual hosts)`,
    `Block size: <span style="color:var(--amber)">${total}</span> (how many IPs in each subnet)`,
    `Usable hosts: <span style="color:var(--green)">${p>=31?total:total-2}</span>${p>=31?' (point-to-point)':`  [2^${hostBits}${p<=30?' − 2':''}]`}`,
    `Wildcard mask: <span style="color:var(--amber)">${n2ip((~mask)>>>0)}</span>`,
  ].map(l=>`<div style="margin-bottom:4px">${l}</div>`).join('');
}

// ─── CIDR ─────────────────────────────────────────────────────────────────
function cidrExplain() {
  const val = $('cidr-in').value.trim();
  if(!val.includes('/')) { $('cidr-result').innerHTML='<div class="callout callout-warn">Enter as IP/prefix e.g. 172.16.0.0/12</div>'; return; }
  const [ip, pfxStr] = val.split('/');
  const pfx = parseInt(pfxStr);
  if(!validateIP(ip)||isNaN(pfx)||pfx<0||pfx>32) { $('cidr-result').innerHTML='<div class="callout callout-err">Invalid CIDR notation</div>'; return; }
  const mask = maskFromP(pfx), wild = (~mask)>>>0;
  const net = (ip2n(ip)&mask)>>>0, bc = (net|wild)>>>0;
  const hosts = pfx>=31 ? Math.pow(2,32-pfx) : Math.pow(2,32-pfx)-2;
  $('cidr-result').innerHTML = `
    <div class="results-grid">
      <div class="r-card"><div class="r-label">Network</div><div class="r-val blue">${n2ip(net)}</div></div>
      <div class="r-card"><div class="r-label">Broadcast</div><div class="r-val pink">${n2ip(bc)}</div></div>
      <div class="r-card"><div class="r-label">Mask</div><div class="r-val">${n2ip(mask)}</div></div>
      <div class="r-card"><div class="r-label">Usable Hosts</div><div class="r-val green">${hosts.toLocaleString()}</div></div>
    </div>`;
}

function calcDivide() {
  const base = $('div-base').value.trim();
  const intoStr = $('div-into').value.trim();
  if(!base.includes('/')||!validatePrefix(intoStr)) { $('div-result').innerHTML='<div class="callout callout-warn">Enter valid base network and target prefix</div>'; return; }
  const [bip, bpfxStr] = base.split('/');
  const bpfx = parseInt(bpfxStr), tpfx = getPrefix(intoStr);
  if(!validateIP(bip)||bpfx>tpfx) { $('div-result').innerHTML='<div class="callout callout-err">Target prefix must be larger (longer) than base</div>'; return; }
  const count = Math.pow(2, tpfx-bpfx);
  const blockSize = Math.pow(2, 32-tpfx);
  const baseMask = maskFromP(bpfx);
  const baseNet = (ip2n(bip)&baseMask)>>>0;
  const show = Math.min(count, 8);
  let subnets = [];
  for(let i=0;i<show;i++) subnets.push(n2ip(baseNet + i*blockSize) + '/' + tpfx);
  $('div-result').innerHTML = `
    <div class="callout callout-ok">/${bpfx} divides into <strong>${count.toLocaleString()} × /${tpfx}</strong> subnets (${blockSize} IPs each)</div>
    <div class="tbl-wrap"><table class="tbl">
      <tr><th>#</th><th>Subnet</th><th>Network Range</th></tr>
      ${subnets.map((s,i)=>`<tr><td>${i+1}</td><td>${s}</td><td>${n2ip(ip2n(s.split('/')[0]))} – ${n2ip((ip2n(s.split('/')[0])&maskFromP(tpfx)|((~maskFromP(tpfx))>>>0))>>>0)}</td></tr>`).join('')}
      ${count>8?`<tr><td colspan="3" style="color:var(--muted);text-align:center">... and ${(count-8).toLocaleString()} more</td></tr>`:''}
    </table></div>`;
}

// ─── CLASS LOOKUP ─────────────────────────────────────────────────────────
function lookupClass() {
  const ip = $('cls-in').value.trim();
  if(!validateIP(ip)) { $('cls-result').innerHTML=''; return; }
  const oct = parseInt(ip.split('.')[0]);
  let cls, bits, range, mask, priv='None';
  if(oct<128) { cls='A'; bits='0xxx xxxx'; range='1.0.0.0 – 126.255.255.255'; mask='/8 (255.0.0.0)'; if(oct===10) priv='Yes — 10.x.x.x'; }
  else if(oct<192) { cls='B'; bits='10xx xxxx'; range='128.0.0.0 – 191.255.255.255'; mask='/16 (255.255.0.0)'; if(oct>=172&&oct<=175) priv='Yes — 172.16–31.x.x'; }
  else if(oct<224) { cls='C'; bits='110x xxxx'; range='192.0.0.0 – 223.255.255.255'; mask='/24 (255.255.255.0)'; if(oct===192&&parseInt(ip.split('.')[1])===168) priv='Yes — 192.168.x.x'; }
  else if(oct<240) { cls='D'; bits='1110 xxxx'; range='224.0.0.0 – 239.255.255.255'; mask='N/A'; }
  else { cls='E'; bits='1111 xxxx'; range='240.0.0.0 – 255.255.255.255'; mask='N/A'; }
  if(oct===127) { $('cls-result').innerHTML='<div class="callout callout-ok">127.x.x.x — Loopback address (not routable)</div>'; return; }
  if(oct===169&&parseInt(ip.split('.')[1])===254) { $('cls-result').innerHTML='<div class="callout callout-warn">169.254.x.x — APIPA / Link-local (no DHCP response)</div>'; return; }
  $('cls-result').innerHTML = `
    <div class="results-grid" style="margin-top:12px">
      <div class="r-card"><div class="r-label">Class</div><div class="r-val blue">${cls}</div></div>
      <div class="r-card"><div class="r-label">First Octet Bits</div><div class="r-val cyan">${bits}</div></div>
      <div class="r-card"><div class="r-label">Default Mask</div><div class="r-val">${mask}</div></div>
      <div class="r-card"><div class="r-label">Private?</div><div class="r-val" style="color:${priv!=='None'?'var(--green)':'var(--muted2)'}">${priv}</div></div>
    </div>`;
}

// ─── QUIZ ─────────────────────────────────────────────────────────────────
const ALL_Q = [
  { t:'beg', q:'What is the subnet mask for /24?', opts:['255.255.255.0','255.255.0.0','255.0.0.0','255.255.255.128'], a:0, exp:'A /24 prefix means 24 network bits. 24 ones = 11111111.11111111.11111111.00000000 = 255.255.255.0' },
  { t:'beg', q:'How many usable hosts does a /28 provide?', opts:['14','16','12','30'], a:0, exp:'2^4 = 16 total IPs minus network and broadcast = 14 usable hosts' },
  { t:'beg', q:'Which IP class does 172.31.0.1 belong to?', opts:['Class A','Class B','Class C','Class D'], a:1, exp:'172.x.x.x falls in 128–191 range — Class B. Default mask is /16.' },
  { t:'beg', q:'What is the loopback address?', opts:['192.168.0.1','10.0.0.1','127.0.0.1','0.0.0.0'], a:2, exp:'127.0.0.1 (or any 127.x.x.x) is the loopback. Packets go to the same machine.' },
  { t:'beg', q:'What does CIDR stand for?', opts:['Classless Inter-Domain Routing','Class IP Domain Range','Core Internet Data Routing','Classified IP Destination Registry'], a:0, exp:'CIDR = Classless Inter-Domain Routing, introduced in 1993 to replace classful addressing.' },
  { t:'beg', q:'Which private range is 10.5.0.1 in?', opts:['10.0.0.0/8','172.16.0.0/12','192.168.0.0/16','Not private'], a:0, exp:'10.0.0.0/8 covers the entire 10.x.x.x space — all 16.7 million addresses.' },
  { t:'int', q:'What is the network address of 192.168.1.200/26?', opts:['192.168.1.192','192.168.1.128','192.168.1.200','192.168.1.0'], a:0, exp:'/26 mask = 255.255.255.192. 200 AND 192 = 192. Network = 192.168.1.192' },
  { t:'int', q:'How many /27 subnets fit in a /24?', opts:['4','8','16','2'], a:1, exp:'2^(27-24) = 2^3 = 8 subnets. Each /27 has 30 usable hosts.' },
  { t:'int', q:'What is the broadcast of 10.0.0.0/30?', opts:['10.0.0.1','10.0.0.2','10.0.0.3','10.0.0.4'], a:2, exp:'/30 block size = 4. 10.0.0.0 – 10.0.0.3. Last = broadcast = 10.0.0.3' },
  { t:'int', q:'What wildcard mask matches 192.168.1.0/24?', opts:['0.0.0.255','255.255.255.0','0.0.255.255','255.0.0.0'], a:0, exp:'Wildcard = inverse of mask. 255.255.255.0 inverted = 0.0.0.255' },
  { t:'int', q:'A /25 divides a /24 into how many subnets?', opts:['2','4','8','16'], a:0, exp:'2^(25-24) = 2. A /24 splits into exactly 2 subnets of /25, each with 126 usable hosts.' },
  { t:'int', q:'What prefix is needed for exactly 100 hosts?', opts:['/25','/26','/27','/24'], a:0, exp:'2^7=128 → 126 usable. /25 provides 126 hosts. /26 only gives 62 — not enough.' },
  { t:'exp', q:'What is the summary route for 192.168.0.0/24 through 192.168.3.0/24?', opts:['192.168.0.0/22','192.168.0.0/23','192.168.0.0/21','192.168.0.0/24'], a:0, exp:'4 contiguous /24s aggregate into /22 (2^2=4). 192.168.0.0/22 covers all four.' },
  { t:'exp', q:'How many bits are in an IPv6 address?', opts:['64','128','32','256'], a:1, exp:'IPv6 = 128 bits, written as 8 groups of 16-bit hex. Provides 2^128 addresses.' },
  { t:'exp', q:'What does EUI-64 insert in the middle of a MAC address?', opts:['FF:FE','00:00','FF:FF','00:FE'], a:0, exp:'EUI-64: split MAC in half, insert FF:FE, then flip the 7th bit (U/L bit) of the first byte.' },
  { t:'exp', q:'Which IPv6 prefix is reserved for link-local?', opts:['fe80::/10','fc00::/7','ff00::/8','2000::/3'], a:0, exp:'fe80::/10 is link-local — auto-configured, not routed beyond local segment.' },
  { t:'exp', q:'VLSM is used for...', opts:['Different sized subnets in one block','Equal-size subnet division','IPv6 addressing only','Class-based routing'], a:0, exp:'VLSM = Variable Length Subnet Masking. Allocate subnets of different sizes from one block to minimize waste.' },
  { t:'exp', q:'What is the minimum prefix for a point-to-point link?', opts:['/30','/31','/32','/29'], a:1, exp:'/31 provides 2 IPs for P2P links (RFC 3021). /30 was the classic way but wastes 2 addresses.' },
];

let qIdx=0, qScore=0, qStreak=0, qTotal=0, qAnswered=false, qLoaded=false, qPool=[];

function resetQuiz() {
  const level = $('q-level').value;
  qPool = level==='all' ? [...ALL_Q] : ALL_Q.filter(q=>q.t===level);
  qPool.sort(()=>Math.random()-0.5);
  qIdx=0; qScore=0; qStreak=0; qTotal=0; qAnswered=false;
  $('qs-score').textContent=0; $('qs-streak').textContent=0; $('qs-total').textContent=0; $('qs-acc').textContent='—';
  $('q-prog').style.width='0%';
  loadQ();
}

function loadQ() {
  if(!qPool.length) return;
  qAnswered = false;
  const q = qPool[qIdx % qPool.length];
  $('q-next').style.display='none';
  $('q-fb').className='quiz-fb';
  $('q-hdr').textContent = `Question ${qTotal+1}`;
  const colors = {beg:'var(--green)',int:'var(--blue)',exp:'var(--pink)'};
  const labels = {beg:'Beginner',int:'Intermediate',exp:'Expert'};
  $('q-diff-tag').innerHTML = `<span class="tag" style="background:${colors[q.t]}22;color:${colors[q.t]}">${labels[q.t]}</span>`;
  $('q-text').textContent = q.q;
  $('q-opts').innerHTML = q.opts.map((o,i)=>`<button class="quiz-opt" onclick="answerQ(${i})">${o}</button>`).join('');
}

function answerQ(i) {
  if(qAnswered) return;
  qAnswered=true;
  const q = qPool[qIdx % qPool.length];
  document.querySelectorAll('.quiz-opt')[i].classList.add(i===q.a?'correct':'wrong');
  document.querySelectorAll('.quiz-opt')[q.a].classList.add('correct');
  const ok = i===q.a;
  if(ok){qScore++;qStreak++;} else qStreak=0;
  qTotal++;
  $('qs-score').textContent=qScore;
  $('qs-streak').textContent=qStreak;
  $('qs-total').textContent=qTotal;
  $('qs-acc').textContent=Math.round(qScore/qTotal*100)+'%';
  $('q-prog').style.width=(qTotal/qPool.length*100)+'%';
  const fb = $('q-fb');
  fb.className='quiz-fb show '+(ok?'ok':'fail');
  fb.textContent=(ok?'✓ Correct! ':'✗ Incorrect. ')+q.exp;
  $('q-next').style.display='block';
}

function nextQ() {
  qIdx++;
  if(qIdx >= qPool.length) {
    $('q-text').textContent = `Quiz complete! Score: ${qScore}/${qPool.length} (${Math.round(qScore/qPool.length*100)}%)`;
    $('q-opts').innerHTML='';
    $('q-fb').className='quiz-fb';
    $('q-next').style.display='none';
    $('q-diff-tag').innerHTML='';
    return;
  }
  loadQ();
}

// ─── TOOLS ────────────────────────────────────────────────────────────────
function calcWC() {
  let val = $('wc-in').value.trim();
  let pfx;
  if(val.startsWith('/')) pfx = parseInt(val.slice(1));
  else if(val.includes('.') && validateIP(val)) pfx = prefixFromMask(val);
  else pfx = parseInt(val);
  if(isNaN(pfx)||pfx<0||pfx>32) { $('wc-result').innerHTML='<div class="callout callout-warn">Enter a subnet mask (255.255.255.0) or prefix (/24)</div>'; return; }
  const mask = maskFromP(pfx), wild=(~mask)>>>0;
  $('wc-result').innerHTML=`
    <div class="results-grid" style="margin-top:12px">
      <div class="r-card"><div class="r-label">Subnet Mask</div><div class="r-val blue">${n2ip(mask)}</div></div>
      <div class="r-card"><div class="r-label">Wildcard Mask</div><div class="r-val amber">${n2ip(wild)}</div></div>
      <div class="r-card"><div class="r-label">Prefix</div><div class="r-val">/${pfx}</div></div>
      <div class="r-card"><div class="r-label">ACL Use</div><div class="r-val cyan">permit any ${n2ip(wild)}</div></div>
    </div>`;
}

function listHosts() {
  const val = $('hr-in').value.trim();
  if(!val.includes('/')) { $('hr-result').innerHTML='<div class="callout callout-warn">Enter CIDR e.g. 192.168.1.0/28</div>'; return; }
  const [ip, pfxStr] = val.split('/');
  const pfx = parseInt(pfxStr);
  if(!validateIP(ip)||isNaN(pfx)||pfx<24) { $('hr-result').innerHTML='<div class="callout callout-warn">Use /24 or smaller (e.g. /26, /28, /30)</div>'; return; }
  const mask=maskFromP(pfx), net=(ip2n(ip)&mask)>>>0, bc=(net|(~mask>>>0))>>>0;
  const hosts=[];
  for(let i=net+1;i<bc;i++) hosts.push(n2ip(i));
  if(!hosts.length) { $('hr-result').innerHTML='<div class="callout callout-warn">No usable hosts (network or broadcast only)</div>'; return; }
  var hRows = hosts.map(function(h,i){ var c=(i===0||i===hosts.length-1)?'var(--cyan)':'var(--muted2)'; return '<div style="font-family:var(--mono);font-size:13px;color:'+c+'">'+h+'</div>'; }).join('');
  $('hr-result').innerHTML = '<div style="font-family:var(--mono);font-size:11px;color:var(--muted);margin-bottom:8px">'+hosts.length+' usable hosts:</div>'+hRows;
}

function convertAll(src) {
  try {
    let v;
    if(src==='dec') v = parseInt($('cv-dec').value);
    else if(src==='hex') v = parseInt($('cv-hex').value,16);
    else v = parseInt($('cv-bin').value,2);
    if(isNaN(v)||v<0||v>4294967295) return;
    if(src!=='dec') $('cv-dec').value=v;
    if(src!=='hex') $('cv-hex').value=v.toString(16).toUpperCase();
    if(src!=='bin') $('cv-bin').value=v.toString(2);
    $('cv-info').textContent = `${v.toLocaleString()} decimal · 0x${v.toString(16).toUpperCase()} hex · ${v.toString(2).length} bits`;
  } catch(e){}
}

function findPrefix() {
  const n = parseInt($('hn-in').value);
  if(isNaN(n)||n<1) { $('hn-result').innerHTML=''; return; }
  let bits=1;
  while(Math.pow(2,bits) < n+2) bits++;
  const pfx=32-bits, total=Math.pow(2,bits), usable=bits>1?total-2:total;
  $('hn-result').innerHTML=`
    <div class="results-grid" style="margin-top:12px">
      <div class="r-card"><div class="r-label">Recommended Prefix</div><div class="r-val blue">/${pfx}</div></div>
      <div class="r-card"><div class="r-label">Total IPs</div><div class="r-val">${total}</div></div>
      <div class="r-card"><div class="r-label">Usable Hosts</div><div class="r-val green">${usable}</div></div>
      <div class="r-card"><div class="r-label">Subnet Mask</div><div class="r-val cyan">${n2ip(maskFromP(pfx))}</div></div>
    </div>`;
}


// ─── IPv6 SUB-TAB NAV ─────────────────────────────────────────────────────
function v6Tab(id, btn) {
  document.querySelectorAll('.v6-sub').forEach(s => s.style.display='none');
  document.querySelectorAll('#v6-subtabs .tab').forEach(b => b.classList.remove('active'));
  var el = document.getElementById('v6s-'+id);
  if(el) el.style.display='block';
  if(btn) btn.classList.add('active');
  if(id==='types') { renderMcastTable(); renderAddrTypes(); v6Classify(); buildSNM(); }
  if(id==='eui64') { calcEUI64(); renderDHCPCompare(); }
  if(id==='transition') { calcDualStack(); calc6to4(); calcNAT64(); renderTransCompare(); }
  if(id==='subnet') { calcV6Subnet(); v6Hierarchy(); }
  if(id==='analyzer') { analyzeV6(); v6Compress(); buildPTR(); validateV6List(); }
}

// ─── IPv6 CORE HELPERS ────────────────────────────────────────────────────
function expandV6Full(addr) {
  var a = addr.trim().toLowerCase();
  if(a === '::') return '0000:0000:0000:0000:0000:0000:0000:0000';
  if(a.includes('::')) {
    var sides = a.split('::');
    var L = sides[0] ? sides[0].split(':') : [];
    var R = sides[1] ? sides[1].split(':') : [];
    var fill = 8 - L.length - R.length;
    if(fill < 0) return null;
    a = L.concat(Array(fill).fill('0')).concat(R).join(':');
  }
  var parts = a.split(':');
  if(parts.length !== 8) return null;
  if(!parts.every(function(p){ return /^[0-9a-f]{0,4}$/.test(p); })) return null;
  return parts.map(function(g){ return g.padStart(4,'0'); }).join(':');
}

function compressV6Full(expanded) {
  var parts = expanded.split(':');
  // Remove leading zeros per group
  var short = parts.map(function(g){ return g.replace(/^0+/,'') || '0'; });
  // Find longest run of zeros
  var bestStart=-1, bestLen=0, curStart=-1, curLen=0;
  short.forEach(function(g,i){
    if(g==='0'){ if(curStart===-1)curStart=i; curLen++; if(curLen>bestLen){bestLen=curLen;bestStart=curStart;} }
    else { curStart=-1; curLen=0; }
  });
  if(bestLen >= 2) {
    var left = short.slice(0,bestStart).join(':');
    var right = short.slice(bestStart+bestLen).join(':');
    return (left?left:'') + '::' + (right?right:'');
  }
  return short.join(':');
}

function isValidV6Full(addr) {
  if(!addr || !addr.trim()) return false;
  var a = addr.trim().toLowerCase();
  if(a === '::') return true;
  if((a.match(/::/g)||[]).length > 1) return false;
  var expanded = expandV6Full(a);
  return expanded !== null;
}

function v6ToWords(expanded) {
  return expanded.split(':').map(function(g){ return parseInt(g,16); });
}

function classifyV6(addr) {
  var exp = expandV6Full(addr);
  if(!exp) return null;
  var w = v6ToWords(exp);
  if(exp === '0000:0000:0000:0000:0000:0000:0000:0001') return {type:'Loopback',scope:'Host',color:'var(--green)',desc:'Equivalent to 127.0.0.1. Packets never leave the device.',rfc:'RFC 4291'};
  if(exp === '0000:0000:0000:0000:0000:0000:0000:0000') return {type:'Unspecified',scope:'N/A',color:'var(--muted2)',desc:'Used as source before an address is assigned. Never forwarded.',rfc:'RFC 4291'};
  if(w[0]===0&&w[1]===0&&w[2]===0&&w[3]===0&&w[4]===0&&w[5]===0xffff) return {type:'IPv4-Mapped',scope:'N/A',color:'var(--muted2)',desc:'Represents an IPv4 address in an IPv6 socket. Format ::ffff:x.x.x.x',rfc:'RFC 4291'};
  if(w[0]===0&&w[1]===0&&w[2]===0&&w[3]===0&&w[4]===0&&w[5]===0) return {type:'IPv4-Compatible (deprecated)',scope:'N/A',color:'var(--muted2)',desc:'Old tunneling method. Deprecated by RFC 4291.',rfc:'RFC 4291'};
  if((w[0]&0xff00)===0xff00) {
    var flags = (w[0]>>8)&0x0f;
    var scope = w[0]&0x0f;
    var scopeNames = {1:'Interface',2:'Link',4:'Admin',5:'Site',8:'Org',14:'Global'};
    return {type:'Multicast',scope:scopeNames[scope]||'Scope '+scope,color:'var(--pink)',desc:'One packet → many receivers. Scope '+scope+' ('+( scopeNames[scope]||'?')+'-local). Flags: '+flags,rfc:'RFC 4291'};
  }
  if((w[0]&0xffc0)===0xfe80) return {type:'Link-Local Unicast',scope:'Link',color:'var(--cyan)',desc:'Auto-assigned on every IPv6 interface. Never routed beyond the local link. fe80::/10',rfc:'RFC 4291'};
  if((w[0]&0xffc0)===0xfec0) return {type:'Site-Local (deprecated)',scope:'Site',color:'var(--muted2)',desc:'Old private addressing. Replaced by ULA (fc00::/7). Deprecated.',rfc:'RFC 3879'};
  if((w[0]&0xfe00)===0xfc00) return {type:'Unique Local Address (ULA)',scope:'Global-ID',color:'var(--amber)',desc:'Private addressing, not globally routable. fc00::/7 (fd = locally assigned). Like RFC 1918.',rfc:'RFC 4193'};
  if(w[0]===0x2002) return {type:'6to4',scope:'Global',color:'var(--muted2)',desc:'Automatic tunneling. Embeds IPv4 address in bits 16-47. 2002:IPv4::/48. Deprecated.',rfc:'RFC 3056'};
  if(w[0]===0&&w[1]===0&&w[2]===0&&w[3]===0&&w[4]===0x0064&&w[5]===0xff9b) return {type:'NAT64',scope:'Global',color:'var(--amber)',desc:'64:ff9b::/96 — used by NAT64 gateways to represent IPv4 addresses to IPv6 hosts.',rfc:'RFC 6052'};
  if((w[0]&0xe000)===0x2000) return {type:'Global Unicast',scope:'Global',color:'var(--blue)',desc:'Publicly routable. IANA currently assigns from 2000::/3. Equivalent to public IPv4.',rfc:'RFC 4291'};
  return {type:'Reserved / Unknown',scope:'—',color:'var(--muted2)',desc:'Not in a well-known range.',rfc:'—'};
}

// ─── ANALYZE V6 ───────────────────────────────────────────────────────────
function analyzeV6() {
  var raw = ($('v6-in')||{value:''}).value.trim();
  if(!raw) return;
  var ok = isValidV6Full(raw);
  if($('v6-err')) $('v6-err').className = 'err-msg' + (!ok&&raw?' show':'');
  if($('v6-in')) $('v6-in').className = raw?(ok?'ok':'error'):'';
  if(!ok) { if($('v6-results')) $('v6-results').innerHTML=''; return; }
  var expanded = expandV6Full(raw);
  var compressed = compressV6Full(expanded);
  var info = classifyV6(raw);
  if($('v6-results')) {
    $('v6-results').innerHTML = '<div class="results-grid">'
      +'<div class="r-card" style="grid-column:span 2"><div class="r-label">Expanded (Full)</div><div class="r-val" style="color:var(--pink);font-size:11px">'+expanded+'</div></div>'
      +'<div class="r-card" style="grid-column:span 2"><div class="r-label">Compressed (RFC 5952)</div><div class="r-val" style="color:var(--pink)">'+compressed+'</div></div>'
      +'<div class="r-card"><div class="r-label">Type</div><div class="r-val" style="color:'+info.color+'">'+info.type+'</div></div>'
      +'<div class="r-card"><div class="r-label">Scope</div><div class="r-val cyan">'+info.scope+'</div></div>'
      +'<div class="r-card"><div class="r-label">RFC</div><div class="r-val amber">'+info.rfc+'</div></div>'
      +'<div class="r-card"><div class="r-label">Bits</div><div class="r-val">128</div></div>'
      +'</div>'
      +'<div class="callout callout-info" style="margin-top:10px;font-size:12px">'+info.desc+'</div>';
  }
  // Bitmap
  if($('v6-bitmap')) {
    var hex = expanded.replace(/:/g,'');
    var bits = '';
    for(var i=0;i<hex.length;i++) bits += parseInt(hex[i],16).toString(2).padStart(4,'0');
    // Render as 8 rows of 16 bits each, each row scrollable if needed
    var html = '<div style="overflow-x:auto">';
    for(var row=0;row<8;row++){
      html += '<div style="display:flex;gap:2px;margin-bottom:2px;min-width:0">';
      html += '<div style="font-family:var(--mono);font-size:9px;color:var(--muted);width:30px;flex-shrink:0;line-height:22px">G'+(row+1)+'</div>';
      for(var b=row*16;b<row*16+16;b++){
        var cls = b<64?'net':'host';
        html += '<div class="bit '+cls+'" style="min-width:18px;width:18px;height:18px;font-size:9px;flex-shrink:0">'+bits[b]+'</div>';
      }
      html += '</div>';
    }
    html += '</div>';
    html += '<div class="bit-legend" style="margin-top:8px"><div class="bit-legend-item"><div class="bit-legend-dot" style="background:rgba(91,156,246,0.3);border:1px solid rgba(91,156,246,0.5)"></div>Network prefix (bits 0–63)</div><div class="bit-legend-item"><div class="bit-legend-dot" style="background:rgba(244,114,182,0.15);border:1px solid rgba(244,114,182,0.3)"></div>Interface ID (bits 64–127)</div></div>';
    $('v6-bitmap').innerHTML = html;
  }
  // Group boxes
  if($('v6-groups')) {
    var groups = expanded.split(':');
    var ghtml = '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,90px),1fr));gap:6px;margin-bottom:8px">';
    groups.forEach(function(g,i){
      ghtml += '<div style="background:var(--bg3);border:1px solid '+(i<4?'rgba(91,156,246,0.3)':'rgba(56,217,192,0.25)')+';border-radius:8px;padding:8px 6px;font-family:var(--mono);font-size:12px;font-weight:600;color:'+(i<4?'var(--blue)':'var(--cyan)')+';text-align:center"><div style="font-size:9px;color:var(--muted);margin-bottom:3px">G'+(i+1)+'</div>'+g+'<div style="font-size:9px;color:var(--muted);margin-top:2px">'+parseInt(g,16)+'</div></div>';
    });
    ghtml += '</div><div style="font-family:var(--mono);font-size:11px;color:var(--muted)">Blue (G1–G4) = Network prefix · Teal (G5–G8) = Interface ID</div>';
    $('v6-groups').innerHTML = ghtml;
  }
}

function setV6(addr) { if($('v6-in')) { $('v6-in').value=addr; analyzeV6(); } }

// ─── COMPRESSOR ───────────────────────────────────────────────────────────
function v6Compress() {
  var raw = ($('v6c-in')||{value:''}).value.trim();
  if(!raw||!$('v6c-result')) return;
  if(!isValidV6Full(raw)) { $('v6c-result').innerHTML='<div class="callout callout-err">Invalid IPv6 address</div>'; return; }
  var expanded = expandV6Full(raw);
  var compressed = compressV6Full(expanded);
  var steps = [
    {n:'Step 1 — Expand all groups to 4 digits',b:'<code>'+expanded+'</code>'},
    {n:'Step 2 — Remove leading zeros per group',b:'<code>'+expanded.split(':').map(function(g){return g.replace(/^0+/,'')||'0';}).join(':')+'</code>'},
    {n:'Step 3 — Replace longest zero-run with ::',b:'<code>'+compressed+'</code> (RFC 5952 canonical form)'}
  ];
  $('v6c-result').innerHTML = steps.map(function(s,i){
    return '<div class="step-item vis" style="transition-delay:'+i*0.08+'s"><div class="step-num">'+s.n+'</div><div class="step-body">'+s.b+'</div></div>';
  }).join('');
}

// ─── PTR BUILDER ──────────────────────────────────────────────────────────
function buildPTR() {
  var raw = ($('ptr-in')||{value:''}).value.trim();
  if(!raw||!$('ptr-result')) return;
  if(!isValidV6Full(raw)) { $('ptr-result').innerHTML='<div class="callout callout-err">Invalid IPv6 address</div>'; return; }
  var expanded = expandV6Full(raw);
  var hex = expanded.replace(/:/g,'');
  var reversed = hex.split('').reverse().join('.');
  var ptr = reversed + '.ip6.arpa';
  $('ptr-result').innerHTML = '<div class="results-grid" style="margin-top:10px">'
    +'<div class="r-card" style="grid-column:span 2"><div class="r-label">PTR Record Name</div><div class="r-val" style="color:var(--cyan);font-size:11px;word-break:break-all">'+ptr+'</div></div>'
    +'<div class="r-card" style="grid-column:span 2"><div class="r-label">Zone File Entry</div><div class="r-val" style="color:var(--muted2);font-size:11px">'+ptr+'. IN PTR hostname.example.com.</div></div>'
    +'</div>'
    +'<div style="font-family:var(--mono);font-size:11px;color:var(--muted);margin-top:8px">Every hex nibble reversed individually, separated by dots, + .ip6.arpa</div>';
}

// ─── VALIDATOR ────────────────────────────────────────────────────────────
function validateV6List() {
  var lines = (($('v6v-in')||{value:''}).value||'').trim().split('\n');
  if(!$('v6v-result')) return;
  $('v6v-result').innerHTML = lines.map(function(l){
    var t = l.trim(); if(!t) return '';
    var ok = isValidV6Full(t);
    var info = ok ? classifyV6(t) : null;
    return '<div style="display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid var(--border);font-family:var(--mono);font-size:12px">'
      +'<span style="color:'+(ok?'var(--green)':'var(--red)')+';">'+(ok?'✓':'✗')+'</span>'
      +'<span style="color:var(--pink);flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+t+'</span>'
      +(ok?'<span style="color:'+info.color+';font-size:11px;white-space:nowrap">'+info.type+'</span>':'<span style="color:var(--red);font-size:11px">Invalid</span>')
      +'</div>';
  }).join('');
}

// ─── V6 SCOPE CLASSIFIER ──────────────────────────────────────────────────
function v6Classify() {
  var raw = ($('v6sc-in')||{value:''}).value.trim();
  if(!raw||!$('v6sc-result')) return;
  if(!isValidV6Full(raw)) { $('v6sc-result').innerHTML='<div class="callout callout-err">Invalid IPv6 address</div>'; return; }
  var info = classifyV6(raw);
  var expanded = expandV6Full(raw);
  var compressed = compressV6Full(expanded);
  $('v6sc-result').innerHTML = '<div class="results-grid" style="margin-top:10px">'
    +'<div class="r-card"><div class="r-label">Type</div><div class="r-val" style="color:'+info.color+'">'+info.type+'</div></div>'
    +'<div class="r-card"><div class="r-label">Scope</div><div class="r-val cyan">'+info.scope+'</div></div>'
    +'<div class="r-card"><div class="r-label">Reference</div><div class="r-val amber">'+info.rfc+'</div></div>'
    +'<div class="r-card" style="grid-column:span 2"><div class="r-label">Canonical Form</div><div class="r-val" style="color:var(--pink)">'+compressed+'</div></div>'
    +'</div>'
    +'<div class="callout callout-info" style="margin-top:10px;font-size:12px">'+info.desc+'</div>';
}

// ─── SOLICITED-NODE MULTICAST ─────────────────────────────────────────────
function buildSNM() {
  var raw = ($('snm-in')||{value:''}).value.trim();
  if(!raw||!$('snm-result')) return;
  if(!isValidV6Full(raw)) { $('snm-result').innerHTML='<div class="callout callout-err">Invalid IPv6 address</div>'; return; }
  var expanded = expandV6Full(raw);
  var hex = expanded.replace(/:/g,'');
  var last24 = hex.slice(-6);
  var snm = 'ff02::1:ff'+last24.slice(0,2)+':'+last24.slice(2);
  $('snm-result').innerHTML = '<div class="results-grid" style="margin-top:10px">'
    +'<div class="r-card" style="grid-column:span 2"><div class="r-label">Solicited-Node Multicast</div><div class="r-val" style="color:var(--pink)">'+snm+'</div></div>'
    +'<div class="r-card"><div class="r-label">Last 24 bits</div><div class="r-val blue">'+last24+'</div></div>'
    +'<div class="r-card"><div class="r-label">Multicast MAC</div><div class="r-val cyan">33:33:ff:'+last24.slice(0,2)+':'+last24.slice(2,4)+':'+last24.slice(4)+'</div></div>'
    +'</div>'
    +'<div style="font-family:var(--mono);font-size:11px;color:var(--muted);margin-top:8px">Used by NDP Neighbor Solicitation instead of ARP broadcasts. Only the last 24 bits vary.</div>';
}

// ─── MULTICAST TABLE ──────────────────────────────────────────────────────
function renderMcastTable() {
  if(!$('mcast-table')) return;
  var rows = [
    ['ff02::1','All Nodes','Link','All IPv6 nodes on this link'],
    ['ff02::2','All Routers','Link','All IPv6 routers on this link'],
    ['ff02::5','OSPFv3 Routers','Link','All OSPFv3 routers'],
    ['ff02::6','OSPFv3 DR','Link','OSPFv3 designated routers'],
    ['ff02::9','RIPng','Link','All RIPng routers'],
    ['ff02::a','EIGRP','Link','All EIGRP routers'],
    ['ff02::d','PIM','Link','PIM routers'],
    ['ff02::1:2','DHCPv6','Link','DHCP relay agents & servers'],
    ['ff02::1:3','LLMNR','Link','Link-local multicast name resolution'],
    ['ff05::2','All Routers','Site','All routers, site scope'],
    ['ff0e::1','All Nodes','Global','Global scope all nodes'],
  ];
  $('mcast-table').innerHTML = '<div class="tbl-wrap"><table class="tbl"><tr><th>Address</th><th>Name</th><th>Scope</th><th>Description</th></tr>'
    + rows.map(function(r){ return '<tr><td style="color:var(--pink)">'+r[0]+'</td><td style="color:var(--text)">'+r[1]+'</td><td style="color:var(--cyan)">'+r[2]+'</td><td>'+r[3]+'</td></tr>'; }).join('')
    + '</table></div>';
}

function renderAddrTypes() {
  if(!$('addrtype-table')) return;
  var rows = [
    ['Unicast','One → One','Global, Link-Local, ULA'],
    ['Multicast','One → Many','ff00::/8 range'],
    ['Anycast','One → Nearest One','Any unicast prefix, special config'],
  ];
  $('addrtype-table').innerHTML = '<div class="tbl-wrap"><table class="tbl"><tr><th>Type</th><th>Delivery</th><th>Range / Note</th></tr>'
    + rows.map(function(r){ return '<tr><td style="color:var(--blue)">'+r[0]+'</td><td style="color:var(--cyan)">'+r[1]+'</td><td>'+r[2]+'</td></tr>'; }).join('')
    + '</table></div>'
    + '<div class="callout callout-info" style="margin-top:10px;font-size:12px">⚠️ IPv6 has NO broadcast. Broadcast is replaced by multicast (e.g. ff02::1 for all-nodes).</div>';
}

// ─── EUI-64 ───────────────────────────────────────────────────────────────
function calcEUI64() {
  var mac = (($('mac-in')||{value:''}).value||'').trim().replace(/[:\-\. ]/g,'').toLowerCase();
  if(!$('eui64-result')) return;
  if(mac.length!==12||!/^[0-9a-f]+$/.test(mac)){
    $('eui64-result').innerHTML='<div class="callout callout-warn">Enter a valid MAC: 00:1A:2B:3C:4D:5E</div>'; return;
  }
  var m = mac.match(/.{2}/g);
  var orig = parseInt(m[0],16);
  var flipped = (orig ^ 0x02).toString(16).padStart(2,'0');
  var iid = flipped+m[1]+':'+m[2]+'ff:fe'+m[3]+':'+m[4]+m[5];
  $('eui64-result').innerHTML = '<div class="results-grid" style="margin-top:10px">'
    +'<div class="r-card" style="grid-column:span 2"><div class="r-label">Interface Identifier (EUI-64)</div><div class="r-val" style="color:var(--cyan)">'+iid+'</div></div>'
    +'<div class="r-card" style="grid-column:span 2"><div class="r-label">Link-Local Address</div><div class="r-val" style="color:var(--blue)">fe80::'+iid+'</div></div>'
    +'<div class="r-card"><div class="r-label">FF:FE inserted</div><div class="r-val green">Between byte 3 & 4</div></div>'
    +'<div class="r-card"><div class="r-label">Bit 7 (U/L) flipped</div><div class="r-val amber">'+m[0]+' → '+flipped+'</div></div>'
    +'</div>'
    +'<div style="font-family:var(--mono);font-size:11px;color:var(--muted);margin-top:8px;line-height:1.8">'
    +'Split: <span style="color:var(--blue)">'+m[0]+':'+m[1]+':'+m[2]+'</span> | FF:FE | <span style="color:var(--pink)">'+m[3]+':'+m[4]+':'+m[5]+'</span><br>'
    +'Flip U/L bit: <span style="color:var(--amber)">'+m[0]+' ('+orig.toString(2).padStart(8,'0')+') → '+flipped+' ('+(orig^2).toString(2).padStart(8,'0')+')</span>'
    +'</div>';
}

// ─── PRIVACY EXTENSION ────────────────────────────────────────────────────
function genPrivacy() {
  var pfxRaw = ($('priv-in')||{value:''}).value.trim();
  if(!$('priv-result')) return;
  var match = pfxRaw.match(/^([0-9a-f:]+)(?:\/(\d+))?/i);
  if(!match){ $('priv-result').innerHTML='<div class="callout callout-err">Enter a valid /64 prefix</div>'; return; }
  var pfx = parseInt(match[2]||'64');
  var addr = match[1].replace(/::?$/,'');
  if(pfx!==64){ $('priv-result').innerHTML='<div class="callout callout-warn">Privacy extensions require a /64 prefix (SLAAC)</div>'; return; }
  // Generate random IID
  var iid = Array(4).fill(0).map(function(){ return Math.floor(Math.random()*65536).toString(16).padStart(4,'0'); }).join(':');
  var full = addr+'::'+iid;
  var exp = expandV6Full(full);
  var compressed = exp ? compressV6Full(exp) : full;
  $('priv-result').innerHTML = '<div class="results-grid">'
    +'<div class="r-card" style="grid-column:span 2"><div class="r-label">Privacy Address (temporary)</div><div class="r-val" style="color:var(--pink)">'+compressed+'</div></div>'
    +'<div class="r-card" style="grid-column:span 2"><div class="r-label">Random IID</div><div class="r-val cyan">'+iid+'</div></div>'
    +'</div>'
    +'<div style="font-family:var(--mono);font-size:11px;color:var(--muted);margin-top:8px">Each new connection can use a different temporary address (RFC 4941). Hides device identity.</div>'
    +'<button class="btn-ghost btn-sm" style="margin-top:8px" onclick="genPrivacy()">Generate Another →</button>';
}

// ─── SLAAC SIMULATOR ──────────────────────────────────────────────────────
function runSLAAC() {
  var pfxRaw = ($('slaac-pfx')||{value:''}).value.trim();
  var mac = (($('slaac-mac')||{value:''}).value||'').trim().replace(/[:\-]/g,'').toLowerCase();
  if(!$('slaac-result')) return;
  if(mac.length!==12||!/^[0-9a-f]+$/.test(mac)){ $('slaac-result').innerHTML='<div class="callout callout-err">Invalid MAC address</div>'; return; }
  var m = mac.match(/.{2}/g);
  var flipped = (parseInt(m[0],16)^0x02).toString(16).padStart(2,'0');
  var iid = flipped+m[1]+':'+m[2]+'ff:fe'+m[3]+':'+m[4]+m[5];
  var pfxClean = pfxRaw.replace(/::$/,'').replace(/:*$/,'');
  var slaacAddr = pfxClean+'::'+iid;
  var exp = expandV6Full(slaacAddr);
  var compressed = exp ? compressV6Full(exp) : slaacAddr;
  var linkLocal = 'fe80::'+iid;
  var steps = [
    {n:'Step 1 — Interface initializes',b:'Device enables IPv6 on its network interface. No address yet — source is <code>::</code> (unspecified).'},
    {n:'Step 2 — Generate Link-Local Address',b:'EUI-64 from MAC <code>'+m.join(':')+'</code>:<br>Insert FF:FE, flip U/L bit → IID: <code>'+iid+'</code><br>Link-Local: <code style="color:var(--cyan)">'+linkLocal+'</code>'},
    {n:'Step 3 — Duplicate Address Detection (DAD)',b:'Send Neighbor Solicitation to <code>ff02::1:ff'+iid.split(':').pop().slice(-4)+'/104</code><br>Wait 1 second. If no Neighbor Advertisement received → address is unique.'},
    {n:'Step 4 — Router Solicitation (RS)',b:'Send RS to <code>ff02::2</code> (all-routers multicast). <code>ICMPv6 type 133</code>.<br>Source: link-local <code>'+linkLocal+'</code>'},
    {n:'Step 5 — Router Advertisement (RA)',b:'Router replies with RA from its link-local. Contains:<br>• Prefix: <code style="color:var(--pink)">'+pfxRaw+'/64</code><br>• Flags: M=0 (no DHCPv6), O=0 (no other config)<br>• Valid/preferred lifetime'},
    {n:'Step 6 — Build Global Address',b:'Combine router prefix <code>'+pfxClean+'::</code> + IID <code>'+iid+'</code><br>→ <code style="color:var(--blue)">'+compressed+'</code>'},
    {n:'Step 7 — DAD on Global Address',b:'Send NS to solicited-node multicast for new address. If no conflict → address assigned and ready.'},
  ];
  $('slaac-result').innerHTML = steps.map(function(s,i){
    return '<div class="slaac-step" id="ss'+i+'" style="transition-delay:'+i*0.1+'s"><div class="step-num">'+s.n+'</div><div class="step-body">'+s.b+'</div></div>';
  }).join('');
  setTimeout(function(){ document.querySelectorAll('.slaac-step').forEach(function(s){ s.classList.add('vis'); }); }, 50);
}

function renderDHCPCompare() {
  if(!$('dhcp-compare')) return;
  $('dhcp-compare').innerHTML = '<div class="tbl-wrap"><table class="tbl">'
    +'<tr><th>Feature</th><th style="color:var(--blue)">SLAAC</th><th style="color:var(--cyan)">Stateless DHCPv6</th><th style="color:var(--amber)">Stateful DHCPv6</th></tr>'
    +'<tr><td>Address source</td><td style="color:var(--blue)">Router prefix + EUI-64</td><td style="color:var(--cyan)">Router prefix + EUI-64</td><td style="color:var(--amber)">DHCPv6 server</td></tr>'
    +'<tr><td>DNS / options</td><td>RA RDNSS option</td><td style="color:var(--cyan)">DHCPv6 server</td><td style="color:var(--amber)">DHCPv6 server</td></tr>'
    +'<tr><td>State kept</td><td style="color:var(--green)">None</td><td style="color:var(--green)">None</td><td style="color:var(--red)">Full lease DB</td></tr>'
    +'<tr><td>RA M-flag</td><td>0</td><td>0</td><td style="color:var(--amber)">1</td></tr>'
    +'<tr><td>RA O-flag</td><td>0</td><td style="color:var(--cyan)">1</td><td style="color:var(--amber)">1</td></tr>'
    +'<tr><td>Privacy</td><td>RFC 4941 extensions</td><td>RFC 4941 extensions</td><td>Assigned by admin</td></tr>'
    +'</table></div>';
}

// ─── V6 SUBNETTING ────────────────────────────────────────────────────────
function calcV6Subnet() {
  var raw = ($('v6s-in')||{value:''}).value.trim();
  if(!raw||!$('v6s-result')) return;
  if(!raw.includes('/')) { $('v6s-result').innerHTML='<div class="callout callout-warn">Enter as prefix/length e.g. 2001:db8::/32</div>'; return; }
  var parts = raw.split('/');
  var pfx = parseInt(parts[1]);
  if(isNaN(pfx)||pfx<0||pfx>128){ $('v6s-result').innerHTML='<div class="callout callout-err">Prefix must be 0–128</div>'; return; }
  var hostBits = 128-pfx;
  var typical = pfx<=24?'RIR allocation':pfx<=32?'ISP block (/32 minimum)':pfx<=48?'Customer site (/48 standard)':pfx<=56?'Small site (/56)':pfx<=64?'LAN segment (/64 — SLAAC required)':pfx<=127?'Sub-/64 (breaks SLAAC)':'/128 single host';
  var subs64 = pfx<=64 ? Math.pow(2,64-pfx) : 'N/A (longer than /64)';
  var subs48 = pfx<=48 ? Math.pow(2,48-pfx)+' × /48 sites' : 'N/A';
  $('v6s-result').innerHTML = '<div class="results-grid" style="margin-top:10px">'
    +'<div class="r-card"><div class="r-label">Prefix Length</div><div class="r-val blue">/'+pfx+'</div></div>'
    +'<div class="r-card"><div class="r-label">Host Bits</div><div class="r-val cyan">'+hostBits+'</div></div>'
    +'<div class="r-card"><div class="r-label">/64 Subnets</div><div class="r-val green">'+(typeof subs64==='number'?subs64.toLocaleString():subs64)+'</div></div>'
    +'<div class="r-card"><div class="r-label">/48 Sites</div><div class="r-val amber">'+subs48+'</div></div>'
    +'<div class="r-card" style="grid-column:span 2"><div class="r-label">Typical Use</div><div class="r-val" style="color:var(--text)">'+typical+'</div></div>'
    +'</div>';
}

function v6Divide() {
  var base = ($('v6d-base')||{value:''}).value.trim();
  var into = ($('v6d-into')||{value:''}).value.trim();
  if(!$('v6d-result')) return;
  if(!base.includes('/') || !into.includes('/')) { $('v6d-result').innerHTML='<div class="callout callout-warn">Enter e.g. 2001:db8::/48 and /64</div>'; return; }
  var bpfx = parseInt(base.split('/')[1]);
  var tpfx = parseInt(into.replace('/',''));
  if(isNaN(bpfx)||isNaN(tpfx)||tpfx<=bpfx||tpfx>128){ $('v6d-result').innerHTML='<div class="callout callout-err">Target prefix must be longer than base (e.g. /64 into /48)</div>'; return; }
  var count = Math.pow(2, tpfx-bpfx);
  $('v6d-result').innerHTML = '<div class="callout callout-ok" style="margin-top:10px">A /'+bpfx+' divides into <strong>'+count.toLocaleString()+' × /'+tpfx+'</strong> subnets</div>'
    +'<div style="font-family:var(--mono);font-size:12px;color:var(--muted2);margin-top:8px">2^('+(tpfx)+' − '+bpfx+') = 2^'+(tpfx-bpfx)+' = '+count.toLocaleString()+'</div>';
}

function v6Hierarchy() {
  var raw = ($('v6h-in')||{value:''}).value.trim();
  if(!raw||!$('v6h-result')) return;
  if(!raw.includes('/')) { $('v6h-result').innerHTML='<div class="callout callout-warn">Enter ISP prefix e.g. 2001:db8::/32</div>'; return; }
  var bpfx = parseInt(raw.split('/')[1]);
  if(isNaN(bpfx)||bpfx>48){ $('v6h-result').innerHTML='<div class="callout callout-warn">Enter a /32 or larger ISP block (smaller prefix number)</div>'; return; }
  var levels = [
    {pfx:bpfx, label:'ISP Block', color:'var(--blue)', count:1},
    {pfx:48, label:'Customer Sites (/48)', color:'var(--cyan)', count:Math.pow(2,48-bpfx)},
    {pfx:56, label:'Building/Dept (/56)', color:'var(--amber)', count:Math.pow(2,56-bpfx)},
    {pfx:64, label:'LAN Segments (/64)', color:'var(--green)', count:Math.pow(2,64-bpfx)},
    {pfx:128, label:'Single Hosts (/128)', color:'var(--pink)', count:'2^'+(128-bpfx)+' (astronomical)'},
  ];
  $('v6h-result').innerHTML = levels.map(function(l,i){
    var indent = i*16;
    return '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;padding-left:'+indent+'px">'
      +'<div style="width:3px;height:40px;background:'+l.color+';border-radius:2px;flex-shrink:0"></div>'
      +'<div style="background:var(--bg3);border:1px solid var(--border);border-radius:var(--r);padding:10px 14px;flex:1">'
      +'<div style="font-family:var(--mono);font-size:12px;font-weight:700;color:'+l.color+'">'+l.label+'</div>'
      +'<div style="font-family:var(--mono);font-size:11px;color:var(--muted2);margin-top:2px">/'+ l.pfx+' — '+(typeof l.count==='number'?l.count.toLocaleString():l.count)+' available</div>'
      +'</div></div>';
  }).join('');
}

function v6Aggregate() {
  var lines = (($('v6agg-in')||{value:''}).value||'').trim().split('\n').filter(function(l){return l.trim();});
  if(!$('v6agg-result')) return;
  if(lines.length<2){ $('v6agg-result').innerHTML='<div class="callout callout-warn">Enter at least 2 prefixes</div>'; return; }
  // Find common prefix length by comparing hex strings
  var expanded = [];
  for(var i=0;i<lines.length;i++){
    var l = lines[i].trim(); var pfxPart = l.includes('/')?parseInt(l.split('/')[1]):128;
    var addrPart = l.split('/')[0];
    if(!isValidV6Full(addrPart)){ $('v6agg-result').innerHTML='<div class="callout callout-err">Invalid address: '+addrPart+'</div>'; return; }
    expanded.push({hex:expandV6Full(addrPart).replace(/:/g,''), pfx:pfxPart, cidr:l});
  }
  // Find common bits
  var refHex = expanded[0].hex;
  var commonBits = 0;
  outer: for(var b=0;b<128;b++){
    var byteIdx = Math.floor(b/4); var bitIdx = 3-(b%4);
    var refBit = (parseInt(refHex[byteIdx],16)>>bitIdx)&1;
    for(var j=1;j<expanded.length;j++){
      var bit = (parseInt(expanded[j].hex[byteIdx],16)>>bitIdx)&1;
      if(bit!==refBit) break outer;
    }
    commonBits++;
  }
  // Build summary
  var summaryHex = refHex.slice(0, Math.ceil(commonBits/4)).padEnd(32,'0');
  var summaryGroups = summaryHex.match(/.{4}/g).join(':');
  var summary = compressV6Full(summaryGroups)+'/'+commonBits;
  $('v6agg-result').innerHTML = '<div class="callout callout-ok">Summary route: <strong>'+summary+'</strong></div>'
    +'<div style="font-family:var(--mono);font-size:12px;color:var(--muted2);margin-top:8px">Common prefix bits: '+commonBits+' — aggregates '+lines.length+' routes into 1</div>';
}

// ─── TRANSITION TOOLS ─────────────────────────────────────────────────────
function calcDualStack() {
  var ip4 = ($('ds-ipv4')||{value:''}).value.trim();
  if(!$('ds-result')) return;
  if(!validateIP(ip4)){ $('ds-result').innerHTML='<div class="callout callout-warn">Enter a valid IPv4 address</div>'; return; }
  var octs = ip4.split('.').map(Number);
  var hex1 = octs[0].toString(16).padStart(2,'0')+octs[1].toString(16).padStart(2,'0');
  var hex2 = octs[2].toString(16).padStart(2,'0')+octs[3].toString(16).padStart(2,'0');
  var mapped = '::ffff:'+hex1+':'+hex2;
  var compat = '::'+hex1+':'+hex2;
  $('ds-result').innerHTML = '<div class="results-grid" style="margin-top:10px">'
    +'<div class="r-card" style="grid-column:span 2"><div class="r-label">IPv4-Mapped (::ffff:x.x.x.x) — Active</div><div class="r-val" style="color:var(--cyan)">'+mapped+'</div></div>'
    +'<div class="r-card" style="grid-column:span 2"><div class="r-label">Dotted-quad notation</div><div class="r-val" style="color:var(--muted2)">'+('::ffff:'+ip4)+'</div></div>'
    +'<div class="r-card" style="grid-column:span 2"><div class="r-label">IPv4-Compatible (deprecated)</div><div class="r-val" style="color:var(--muted)">'+compat+'</div></div>'
    +'</div>'
    +'<div style="font-family:var(--mono);font-size:11px;color:var(--muted);margin-top:8px">IPv4-mapped used by dual-stack sockets (e.g. accept() in Linux). The IPv4-compatible form is deprecated (RFC 4291).</div>';
}

function calc6to4() {
  var val = ($('6to4-in')||{value:''}).value.trim();
  if(!$('6to4-result')) return;
  var ip4 = null;
  if(validateIP(val)){
    ip4 = val;
  } else if(isValidV6Full(val)){
    var exp = expandV6Full(val);
    if(exp && exp.startsWith('2002')){
      var hex = exp.replace(/:/g,'').slice(4,8);
      var a = parseInt(hex.slice(0,2),16), b=parseInt(hex.slice(2,4),16);
      var c = parseInt(hex.slice(4,6),16), d=parseInt(hex.slice(6,8),16);
      ip4 = a+'.'+b+'.'+c+'.'+d;
    }
  }
  if(!ip4){ $('6to4-result').innerHTML='<div class="callout callout-warn">Enter an IPv4 address or 6to4 IPv6 prefix</div>'; return; }
  var octs = ip4.split('.').map(Number);
  var h1 = octs[0].toString(16).padStart(2,'0')+octs[1].toString(16).padStart(2,'0');
  var h2 = octs[2].toString(16).padStart(2,'0')+octs[3].toString(16).padStart(2,'0');
  var prefix = '2002:'+h1+':'+h2+'::/48';
  $('6to4-result').innerHTML = '<div class="results-grid" style="margin-top:10px">'
    +'<div class="r-card"><div class="r-label">IPv4 Address</div><div class="r-val blue">'+ip4+'</div></div>'
    +'<div class="r-card"><div class="r-label">Hex</div><div class="r-val cyan">'+h1+':'+h2+'</div></div>'
    +'<div class="r-card" style="grid-column:span 2"><div class="r-label">6to4 Prefix (/48)</div><div class="r-val" style="color:var(--pink)">'+prefix+'</div></div>'
    +'</div>'
    +'<div class="callout callout-warn" style="margin-top:10px;font-size:12px">⚠️ 6to4 (RFC 3056) is deprecated. Use native IPv6 or 6in4 tunnels instead.</div>';
}

function calcNAT64() {
  var ip4 = ($('nat64-in')||{value:''}).value.trim();
  if(!$('nat64-result')) return;
  if(!validateIP(ip4)){ $('nat64-result').innerHTML='<div class="callout callout-warn">Enter a valid IPv4 address</div>'; return; }
  var octs = ip4.split('.').map(Number);
  var h1 = octs[0].toString(16).padStart(2,'0')+octs[1].toString(16).padStart(2,'0');
  var h2 = octs[2].toString(16).padStart(2,'0')+octs[3].toString(16).padStart(2,'0');
  var nat64 = '64:ff9b::'+h1+':'+h2;
  var exp = expandV6Full(nat64);
  var comp = exp ? compressV6Full(exp) : nat64;
  $('nat64-result').innerHTML = '<div class="results-grid" style="margin-top:10px">'
    +'<div class="r-card"><div class="r-label">IPv4 Address</div><div class="r-val blue">'+ip4+'</div></div>'
    +'<div class="r-card"><div class="r-label">Embedded Hex</div><div class="r-val cyan">'+h1+':'+h2+'</div></div>'
    +'<div class="r-card" style="grid-column:span 2"><div class="r-label">NAT64 Address (64:ff9b::/96)</div><div class="r-val" style="color:var(--pink)">'+comp+'</div></div>'
    +'</div>'
    +'<div style="font-family:var(--mono);font-size:11px;color:var(--muted);margin-top:8px">IPv6-only hosts send to this address. The NAT64 gateway translates to '+ip4+' and forwards to the IPv4 internet.</div>';
}

function renderTransCompare() {
  if(!$('trans-compare')) return;
  $('trans-compare').innerHTML = '<div class="tbl-wrap"><table class="tbl">'
    +'<tr><th>Mechanism</th><th>How</th><th>Status</th></tr>'
    +'<tr><td style="color:var(--blue)">Dual-Stack</td><td>Both IPv4+IPv6 run simultaneously</td><td style="color:var(--green)">Preferred</td></tr>'
    +'<tr><td style="color:var(--cyan)">NAT64+DNS64</td><td>IPv6-only hosts reach IPv4 via gateway</td><td style="color:var(--green)">Current</td></tr>'
    +'<tr><td style="color:var(--amber)">6in4 Tunnel</td><td>IPv6 encapsulated in IPv4 manually</td><td style="color:var(--cyan)">Current</td></tr>'
    +'<tr><td style="color:var(--muted2)">6to4 (2002::)</td><td>Auto tunnel using public IPv4 in prefix</td><td style="color:var(--red)">Deprecated</td></tr>'
    +'<tr><td style="color:var(--muted2)">Teredo</td><td>UDP tunnel through NAT for IPv6</td><td style="color:var(--red)">Deprecated</td></tr>'
    +'<tr><td style="color:var(--muted2)">ISATAP</td><td>Embeds IPv4 in lower 32 bits of IID</td><td style="color:var(--red)">Deprecated</td></tr>'
    +'</table></div>';
}


liveCalc();
initVLSM();
calcEUI64();
// ══════════════════════════════════════════════════════════
// ACL BUILDER
// ══════════════════════════════════════════════════════════
var aclEntries = [];
var aclCurrentMode = 'standard';
var aclCurrentVendor = 'cisco';

// ── VENDOR TOGGLE ──
function aclSetVendor(v) {
  aclCurrentVendor = v;
  document.getElementById('vendor-btn-cisco').classList.toggle('active', v === 'cisco');
  document.getElementById('vendor-btn-juniper').classList.toggle('active', v === 'juniper');
  document.getElementById('apply-cisco').style.display   = v === 'cisco'    ? '' : 'none';
  document.getElementById('apply-juniper').style.display = v === 'juniper'  ? '' : 'none';
  aclRender();
}

// ── JUNIPER HELPERS ──
function aclWildcardToPrefix(wildcard) {
  return 32 - wildcard.split('.').map(Number).reduce(function(acc, oct) {
    var b = 0, n = oct; while (n) { b += n & 1; n >>= 1; } return acc + b;
  }, 0);
}

function aclSrcToJuniper(srcStr) {
  if (srcStr === 'any') return '0.0.0.0/0';
  if (srcStr.indexOf('host ') === 0) return srcStr.slice(5) + '/32';
  var parts = srcStr.split(' ');
  return parts[0] + '/' + aclWildcardToPrefix(parts[1]);
}

function aclPortToJuniper(op, val) {
  var v = val.trim();
  if (op === 'eq')    return v;
  if (op === 'neq')   return '';   // not natively supported; skip
  if (op === 'lt')    return '0-' + (parseInt(v) - 1);
  if (op === 'gt')    return (parseInt(v) + 1) + '-65535';
  if (op === 'range') { var ps = v.split(/\s+/); return ps[0] + '-' + (ps[1] || ps[0]); }
  return v;
}

function aclIcmpToJuniper(t) {
  return { echo:'echo-request', 'echo-reply':'echo-reply', unreachable:'unreachable',
           'time-exceeded':'time-exceeded', redirect:'redirect' }[t] || t;
}

function aclJuniperFilterName(ident) {
  return ident.named ? ident.id : 'ACL-' + ident.id;
}

// ── JUNIPER CONFIG BUILDER ──
function aclBuildJuniperConfig() {
  if (!aclEntries.length) return '';

  // Group entries by filter name (same ACL number/name → same filter)
  var filters = {};
  aclEntries.forEach(function(e) {
    var fname = aclJuniperFilterName(e.ident);
    if (!filters[fname]) filters[fname] = [];
    filters[fname].push(e);
  });

  var lines = [];
  Object.keys(filters).forEach(function(fname) {
    var terms = filters[fname];
    var termIdx = 0;
    terms.forEach(function(e) {
      if (e.action === 'remark') {
        lines.push('# ' + e.remark);
        return;
      }
      termIdx++;
      var termName = 'TERM-' + termIdx;
      var pfx = 'set firewall family inet filter ' + fname + ' term ' + termName;

      if (e.mode === 'standard') {
        if (e.src !== 'any') lines.push(pfx + ' from source-address ' + aclSrcToJuniper(e.src));
      } else {
        // extended
        if (e.src !== 'any') lines.push(pfx + ' from source-address '      + aclSrcToJuniper(e.src));
        if (e.dst !== 'any') lines.push(pfx + ' from destination-address ' + aclSrcToJuniper(e.dst));
        if (e.proto && e.proto !== 'ip') lines.push(pfx + ' from protocol ' + e.proto);
        if (e.portOp && e.portVal) {
          var jp = aclPortToJuniper(e.portOp, e.portVal);
          if (jp) lines.push(pfx + ' from destination-port ' + jp);
        }
        if (e.icmpType) lines.push(pfx + ' from icmp-type ' + aclIcmpToJuniper(e.icmpType));
      }

      // then clause
      lines.push(pfx + ' then ' + (e.action === 'permit' ? 'accept' : 'reject'));
      lines.push('');
    });

    // implicit deny term
    lines.push('set firewall family inet filter ' + fname + ' term DENY-ALL then reject');
    lines.push('');
  });

  return lines.join('\n').trim();
}

function aclSetMode(mode) {
  aclCurrentMode = mode;
  document.getElementById('acl-tab-standard').classList.toggle('active', mode === 'standard');
  document.getElementById('acl-tab-extended').classList.toggle('active', mode === 'extended');
  document.getElementById('acl-standard-form').style.display = mode === 'standard' ? '' : 'none';
  document.getElementById('acl-extended-form').style.display = mode === 'extended' ? '' : 'none';
  aclRender();
}

function aclToggleNameType(prefix, type) {
  document.getElementById(prefix + '-num-group').style.display = type === 'numbered' ? '' : 'none';
  document.getElementById(prefix + '-name-group').style.display = type === 'named' ? '' : 'none';
}

function aclStdSrcType() {
  var t = document.getElementById('std-src-type').value;
  document.getElementById('std-src-ip-group').style.display = t === 'any' ? 'none' : '';
  document.getElementById('std-wildcard-group').style.display = t === 'network' ? '' : 'none';
}

function aclExtSrcType() {
  var t = document.getElementById('ext-src-type').value;
  document.getElementById('ext-src-ip-group').style.display = t === 'any' ? 'none' : '';
  document.getElementById('ext-src-wild-group').style.display = t === 'network' ? '' : 'none';
}

function aclExtDstType() {
  var t = document.getElementById('ext-dst-type').value;
  document.getElementById('ext-dst-ip-group').style.display = t === 'any' ? 'none' : '';
  document.getElementById('ext-dst-wild-group').style.display = t === 'network' ? '' : 'none';
}

function aclExtProtoChange() {
  var p = document.getElementById('ext-protocol').value;
  document.getElementById('ext-port-group').style.display = (p === 'tcp' || p === 'udp') ? '' : 'none';
  document.getElementById('ext-icmp-group').style.display = p === 'icmp' ? '' : 'none';
}

function aclExtActionChange() {
  var a = document.getElementById('ext-action').value;
  document.getElementById('ext-remark-group').style.display = a === 'remark' ? '' : 'none';
  document.getElementById('ext-main-group').style.display = a === 'remark' ? 'none' : '';
}

function aclShowError(msg) {
  var el = document.getElementById('acl-error');
  el.textContent = '⚠ ' + msg;
  el.style.display = '';
  setTimeout(function(){ el.style.display = 'none'; }, 3500);
}

function aclValidateIP(ip) {
  var parts = ip.trim().split('.');
  if (parts.length !== 4) return false;
  return parts.every(function(p){ var n = parseInt(p); return !isNaN(n) && n >= 0 && n <= 255; });
}

function aclBuildSrcStr(typeId, ipId, wildId) {
  var type = document.getElementById(typeId).value;
  if (type === 'any') return 'any';
  var ip = document.getElementById(ipId).value.trim();
  if (!ip) return null;
  if (!aclValidateIP(ip)) return null;
  if (type === 'host') return 'host ' + ip;
  var wild = document.getElementById(wildId).value.trim();
  if (!wild || !aclValidateIP(wild)) return null;
  return ip + ' ' + wild;
}

function aclGetIdentifier(prefix) {
  var isNamed = document.querySelector('input[name="' + prefix + '-acl-type"]:checked').value === 'named';
  if (isNamed) {
    var n = document.getElementById(prefix + '-acl-name').value.trim();
    return n ? { named: true, id: n } : null;
  } else {
    var num = parseInt(document.getElementById(prefix + '-acl-num').value);
    return isNaN(num) ? null : { named: false, id: num };
  }
}

function aclAddEntry(mode) {
  var entry = { mode: mode, seq: aclEntries.length + 1 };

  if (mode === 'standard') {
    var ident = aclGetIdentifier('std');
    if (!ident) return aclShowError('Enter a valid ACL number or name.');
    entry.ident = ident;
    var action = document.getElementById('std-action').value;
    entry.action = action;
    if (action === 'remark') {
      var r = document.getElementById('std-remark-text').value.trim();
      if (!r) return aclShowError('Enter remark text.');
      entry.remark = r;
    } else {
      var src = aclBuildSrcStr('std-src-type', 'std-src-ip', 'std-wildcard');
      if (!src) return aclShowError('Enter a valid source IP address.');
      entry.src = src;
    }
  } else {
    var identE = aclGetIdentifier('ext');
    if (!identE) return aclShowError('Enter a valid ACL number or name.');
    entry.ident = identE;
    var actionE = document.getElementById('ext-action').value;
    entry.action = actionE;
    if (actionE === 'remark') {
      var rE = document.getElementById('ext-remark-text').value.trim();
      if (!rE) return aclShowError('Enter remark text.');
      entry.remark = rE;
    } else {
      var proto = document.getElementById('ext-protocol').value;
      entry.proto = proto;
      var srcE = aclBuildSrcStr('ext-src-type', 'ext-src-ip', 'ext-src-wild');
      if (!srcE) return aclShowError('Enter a valid source IP / address.');
      entry.src = srcE;
      var dstE = aclBuildSrcStr('ext-dst-type', 'ext-dst-ip', 'ext-dst-wild');
      if (!dstE) return aclShowError('Enter a valid destination IP / address.');
      entry.dst = dstE;
      if (proto === 'tcp' || proto === 'udp') {
        var portOp = document.getElementById('ext-port-op').value;
        if (portOp) {
          var portVal = document.getElementById('ext-port-val').value.trim();
          if (!portVal) return aclShowError('Enter a port number or name for the operator.');
          entry.portOp = portOp;
          entry.portVal = portVal;
        }
      }
      if (proto === 'icmp') {
        var icmpT = document.getElementById('ext-icmp-type').value;
        if (icmpT) entry.icmpType = icmpT;
      }
    }
  }

  aclEntries.push(entry);
  aclRender();
}

function aclDeleteEntry(idx) {
  aclEntries.splice(idx, 1);
  aclEntries.forEach(function(e, i){ e.seq = i + 1; });
  aclRender();
}

function aclEntryToCommand(e) {
  var ident = e.ident;
  var idStr = ident.named ? '' : e.ident.id + ' ';
  if (e.action === 'remark') {
    return (ident.named ? '' : 'access-list ') + idStr + 'remark ' + e.remark;
  }
  if (e.mode === 'standard') {
    return 'access-list ' + idStr + e.action + ' ' + e.src;
  } else {
    var cmd = 'access-list ' + idStr + e.action + ' ' + e.proto + ' ' + e.src + ' ' + e.dst;
    if (e.portOp) cmd += ' ' + e.portOp + ' ' + e.portVal;
    if (e.icmpType) cmd += ' ' + e.icmpType;
    return cmd;
  }
}

function aclEntryToNamedCommand(e) {
  if (e.action === 'remark') return ' remark ' + e.remark;
  if (e.mode === 'standard') return ' ' + e.action + ' ' + e.src;
  var cmd = ' ' + e.action + ' ' + e.proto + ' ' + e.src + ' ' + e.dst;
  if (e.portOp) cmd += ' ' + e.portOp + ' ' + e.portVal;
  if (e.icmpType) cmd += ' ' + e.icmpType;
  return cmd;
}

function aclBuildConfig() {
  if (!aclEntries.length) return '';
  var lines = [];
  var namedGroups = {};
  var numberedEntries = [];

  aclEntries.forEach(function(e) {
    if (e.ident.named) {
      var key = (e.mode === 'standard' ? 'standard' : 'extended') + '|' + e.ident.id;
      if (!namedGroups[key]) namedGroups[key] = { mode: e.mode, name: e.ident.id, cmds: [] };
      namedGroups[key].cmds.push(aclEntryToNamedCommand(e));
    } else {
      numberedEntries.push(e);
    }
  });

  numberedEntries.forEach(function(e){ lines.push(aclEntryToCommand(e)); });
  Object.values(namedGroups).forEach(function(g) {
    lines.push('ip access-list ' + g.mode + ' ' + g.name);
    g.cmds.forEach(function(c){ lines.push(c); });
  });
  return lines.join('\n');
}

function aclActionColor(action) {
  if (action === 'permit') return 'var(--green)';
  if (action === 'deny')   return 'var(--red)';
  return 'var(--muted2)';
}

function aclRender() {
  var isEmpty = aclEntries.length === 0;
  document.getElementById('acl-empty-state').style.display   = isEmpty ? '' : 'none';
  document.getElementById('acl-entries-wrap').style.display  = isEmpty ? 'none' : '';

  var list = document.getElementById('acl-entries-list');
  list.innerHTML = '';
  aclEntries.forEach(function(e, i) {
    var cmd = e.ident.named ? aclEntryToNamedCommand(e) : aclEntryToCommand(e);
    var actionColor = aclActionColor(e.action);
    var row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:flex-start;gap:10px;padding:8px 10px;background:var(--bg3);border-radius:6px;margin-bottom:5px;border:1px solid var(--border);';
    row.innerHTML =
      '<span style="font-family:var(--mono);font-size:10px;color:var(--muted);min-width:20px;text-align:right;margin-top:1px;">' + e.seq + '</span>' +
      '<div style="flex:1;min-width:0;">' +
      (e.ident.named ? '<span style="font-family:var(--mono);font-size:9px;color:var(--purple);display:block;margin-bottom:2px;">Named: ' + e.ident.id + ' (' + e.mode + ')</span>' : '') +
      '<span style="font-family:var(--mono);font-size:11px;color:' + actionColor + ';word-break:break-all;">' + cmd + '</span>' +
      '</div>' +
      '<button onclick="aclDeleteEntry(' + i + ')" style="background:transparent;border:none;color:var(--red);cursor:pointer;font-size:14px;padding:0 4px;flex-shrink:0;" title="Delete">✕</button>';
    list.appendChild(row);
  });

  // Build config for active vendor
  var cfg = aclCurrentVendor === 'juniper' ? aclBuildJuniperConfig() : aclBuildConfig();
  var cfgEl    = document.getElementById('acl-config-output');
  var cfgEmpty = document.getElementById('acl-config-empty');
  if (cfg) {
    cfgEl.style.display   = '';
    cfgEmpty.style.display = 'none';
    cfgEl.style.color = aclCurrentVendor === 'juniper' ? 'var(--amber)' : 'var(--cyan)';
    cfgEl.textContent = cfg;
  } else {
    cfgEl.style.display   = 'none';
    cfgEmpty.style.display = '';
  }
}

function aclCopyConfig() {
  var cfg = aclCurrentVendor === 'juniper' ? aclBuildJuniperConfig() : aclBuildConfig();
  if (!cfg) return aclShowError('No entries to copy. Add at least one ACL rule first.');
  if (navigator.clipboard) {
    navigator.clipboard.writeText(cfg).then(function() {
      document.querySelectorAll('[onclick="aclCopyConfig()"]').forEach(function(btn) {
        var orig = btn.innerHTML;
        btn.innerHTML = '✓ Copied!';
        setTimeout(function(){ btn.innerHTML = orig; }, 1500);
      });
    });
  } else {
    var ta = document.createElement('textarea');
    ta.value = cfg; document.body.appendChild(ta); ta.select();
    document.execCommand('copy'); document.body.removeChild(ta);
  }
}

function aclClearAll() {
  aclEntries = [];
  aclRender();
}
// ══════════════════════════════════════════════════════
// EXPORT AS .TXT
// ══════════════════════════════════════════════════════
function aclExportTxt() {
  var cfg = aclCurrentVendor === 'juniper' ? aclBuildJuniperConfig() : aclBuildConfig();
  if (!cfg) return aclShowError('No entries to export. Add at least one ACL rule first.');
  var vendor = aclCurrentVendor === 'juniper' ? 'juniper' : 'cisco';
  var filename = 'acl-config-' + vendor + '-' + new Date().toISOString().slice(0,10) + '.txt';
  var blob = new Blob([cfg], { type: 'text/plain' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
}

// ══════════════════════════════════════════════════════
// WILDCARD MASK CALCULATOR
// ══════════════════════════════════════════════════════
var wcCurrentMode = 'mask';

function wcSetMode(m) {
  wcCurrentMode = m;
  ['mask','wild','cidr'].forEach(function(t){
    document.getElementById('wc-tab-' + t).classList.toggle('active', t === m);
    document.getElementById('wc-form-' + t).style.display = t === m ? '' : 'none';
  });
  document.getElementById('wc-result').style.display = 'none';
  document.getElementById('wc-error').style.display = 'none';
}

function wcIPtoInt(ip) {
  var p = ip.trim().split('.').map(Number);
  if (p.length !== 4 || p.some(function(x){ return isNaN(x)||x<0||x>255; })) return null;
  return ((p[0]<<24)|(p[1]<<16)|(p[2]<<8)|p[3]) >>> 0;
}

function wcIntToIP(n) {
  return [n>>>24, (n>>>16)&255, (n>>>8)&255, n&255].join('.');
}

function wcIntToBinary(n) {
  var b = (n >>> 0).toString(2).padStart(32,'0');
  return b.slice(0,8)+'.'+b.slice(8,16)+'.'+b.slice(16,24)+'.'+b.slice(24);
}

function wcPrefixToMask(p) { return p===0 ? 0 : (0xFFFFFFFF << (32-p)) >>> 0; }

function wcCountOnes(n) {
  var c=0; n = n>>>0;
  while(n){ c += n&1; n>>>=1; }
  return c;
}

function wcIsContiguous(mask) {
  // A valid subnet mask: all 1s then all 0s
  var inv = (~mask) >>> 0;
  return ((inv & (inv+1)) === 0);
}

function wcRender(subnetInt, wildcardInt, prefix) {
  document.getElementById('wc-out-subnet').textContent = wcIntToIP(subnetInt);
  document.getElementById('wc-out-wild').textContent   = wcIntToIP(wildcardInt);
  document.getElementById('wc-out-cidr').textContent   = '/' + prefix;
  document.getElementById('wc-out-bin').textContent    = wcIntToBinary(wildcardInt);
  // Tip
  var wild = wcIntToIP(wildcardInt);
  var tip = 'Wildcard 0-bits = must match exactly. 1-bits = don\'t care (any value allowed).\n';
  tip += 'Cisco: access-list 10 permit 192.168.1.0 ' + wild;
  document.getElementById('wc-tip').textContent = tip;
  document.getElementById('wc-result').style.display = '';
  document.getElementById('wc-error').style.display = 'none';
}

function wcShowError(msg) {
  document.getElementById('wc-error').textContent = '⚠ ' + msg;
  document.getElementById('wc-error').style.display = '';
  document.getElementById('wc-result').style.display = 'none';
}

function wcCalc() {
  var mode = wcCurrentMode;
  if (mode === 'mask') {
    var val = document.getElementById('wc-input-mask').value.trim();
    if (!val) { document.getElementById('wc-result').style.display='none'; return; }
    var n = wcIPtoInt(val);
    if (n === null) return wcShowError('Enter a valid dotted-decimal subnet mask.');
    if (!wcIsContiguous(n)) return wcShowError('Not a valid contiguous subnet mask.');
    var wild = (~n) >>> 0;
    var prefix = wcCountOnes(n);
    wcRender(n, wild, prefix);
  } else if (mode === 'wild') {
    var val2 = document.getElementById('wc-input-wild').value.trim();
    if (!val2) { document.getElementById('wc-result').style.display='none'; return; }
    var w = wcIPtoInt(val2);
    if (w === null) return wcShowError('Enter a valid dotted-decimal wildcard mask.');
    var mask = (~w) >>> 0;
    var prefix2 = wcCountOnes(mask);
    wcRender(mask, w, prefix2);
  } else {
    var val3 = parseInt(document.getElementById('wc-input-cidr').value);
    if (isNaN(val3)) { document.getElementById('wc-result').style.display='none'; return; }
    if (val3 < 0 || val3 > 32) return wcShowError('CIDR prefix must be 0–32.');
    var m = wcPrefixToMask(val3);
    var w2 = (~m) >>> 0;
    wcRender(m, w2, val3);
  }
}

// ══════════════════════════════════════════════════════
// ACL SIMULATOR
// ══════════════════════════════════════════════════════
function simIPtoInt(ip) {
  var p = ip.trim().split('.').map(Number);
  if (p.length!==4 || p.some(function(x){return isNaN(x)||x<0||x>255;})) return null;
  return ((p[0]<<24)|(p[1]<<16)|(p[2]<<8)|p[3]) >>> 0;
}

function simMatchIP(packetIPStr, aclSrcStr) {
  if (!aclSrcStr || aclSrcStr === 'any') return { match:true, reason:'any → matches everything' };
  if (aclSrcStr.indexOf('host ') === 0) {
    var host = aclSrcStr.slice(5).trim();
    var m = packetIPStr.trim() === host;
    return { match:m, reason:'host ' + host + (m ? ' ✓ exact match' : ' ✗ no match') };
  }
  var parts = aclSrcStr.split(' ');
  var net = simIPtoInt(parts[0]);
  var wild = simIPtoInt(parts[1]);
  var pkt = simIPtoInt(packetIPStr.trim());
  if (net===null||wild===null||pkt===null) return { match:false, reason:'invalid address' };
  var matched = ((pkt ^ net) & ~wild) === 0;
  return {
    match: matched,
    reason: parts[0] + ' ' + parts[1] + (matched ? ' ✓ wildcard match' : ' ✗ wildcard no match')
  };
}

function simMatchPort(packetPort, op, val) {
  if (!op) return { match:true, reason:'no port constraint' };
  var p = parseInt(packetPort);
  if (isNaN(p)) return { match:false, reason:'packet port unknown' };
  if (op === 'eq') {
    var named = {'http':80,'https':443,'ftp':21,'ssh':22,'telnet':23,'dns':53,'smtp':25,'pop3':110,'snmp':161};
    var v = named[val] !== undefined ? named[val] : parseInt(val);
    return { match: p===v, reason:'eq '+v+' → port '+(p===v?'✓ matches':'✗ no match') };
  }
  if (op === 'neq') { var v2=parseInt(val); return {match:p!==v2, reason:'neq '+v2}; }
  if (op === 'lt')  { var v3=parseInt(val); return {match:p<v3,  reason:'lt '+v3}; }
  if (op === 'gt')  { var v4=parseInt(val); return {match:p>v4,  reason:'gt '+v4}; }
  if (op === 'range') {
    var ps=val.split(/\s+/); var lo=parseInt(ps[0]),hi=parseInt(ps[1]||ps[0]);
    return {match:p>=lo&&p<=hi, reason:'range '+lo+'-'+hi};
  }
  return { match:true, reason:'unknown op' };
}

function aclSimulate() {
  var srcIP  = document.getElementById('sim-src-ip').value.trim();
  var dstIP  = document.getElementById('sim-dst-ip').value.trim();
  var proto  = document.getElementById('sim-protocol').value;
  var dstPort= document.getElementById('sim-dst-port').value.trim();

  var errEl = document.getElementById('sim-error');
  errEl.style.display = 'none';

  if (!srcIP) { errEl.textContent='⚠ Enter a Source IP.'; errEl.style.display=''; return; }
  if (simIPtoInt(srcIP)===null) { errEl.textContent='⚠ Invalid Source IP.'; errEl.style.display=''; return; }
  if (aclEntries.filter(function(e){return e.action!=='remark';}).length === 0) {
    document.getElementById('sim-empty').style.display='';
    document.getElementById('sim-output').style.display='none';
    errEl.textContent='⚠ No ACL entries to evaluate. Add rules first.';
    errEl.style.display=''; return;
  }

  document.getElementById('sim-empty').style.display='none';
  document.getElementById('sim-output').style.display='';

  var stepsEl = document.getElementById('sim-steps');
  stepsEl.innerHTML = '';
  var verdictEl = document.getElementById('sim-verdict');
  var implicitEl = document.getElementById('sim-implicit-deny');
  implicitEl.style.display = 'none';

  var matched = false;
  var matchedAction = null;

  aclEntries.forEach(function(e, idx) {
    var row = document.createElement('div');
    row.style.cssText = 'margin-bottom:6px;border-radius:7px;overflow:hidden;border:1px solid var(--border);';

    if (e.action === 'remark') {
      row.innerHTML = '<div style="padding:7px 12px;background:var(--bg3);font-family:var(--mono);font-size:10px;color:var(--muted);">! remark — ' + (e.remark||'') + '</div>';
      stepsEl.appendChild(row);
      return;
    }

    var result = { srcMatch:null, dstMatch:null, protoMatch:null, portMatch:null, overall:false };

    // Source IP check
    result.srcMatch = simMatchIP(srcIP, e.src);

    if (e.mode === 'extended') {
      // Destination IP check
      result.dstMatch = e.dst ? simMatchIP(dstIP, e.dst) : { match:true, reason:'any' };
      // Protocol check
      if (e.proto && e.proto !== 'ip') {
        result.protoMatch = { match: proto === e.proto, reason: e.proto + (proto===e.proto?' ✓':' ✗ packet is '+proto) };
      } else {
        result.protoMatch = { match:true, reason:'ip (any protocol) ✓' };
      }
      // Port check
      if ((e.proto==='tcp'||e.proto==='udp') && e.portOp) {
        result.portMatch = simMatchPort(dstPort, e.portOp, e.portVal);
      } else {
        result.portMatch = { match:true, reason:'no port filter' };
      }
      result.overall = result.srcMatch.match && result.dstMatch.match && result.protoMatch.match && result.portMatch.match;
    } else {
      result.overall = result.srcMatch.match;
    }

    if (result.overall && !matched) {
      matched = true;
      matchedAction = e.action;
    }

    var isHit  = result.overall && matchedAction === e.action && stepsEl.querySelectorAll('.sim-hit').length === 0;
    var isDimmed = matched && !isHit;

    var bg = isHit
      ? (e.action==='permit' ? 'rgba(74,222,128,0.10)' : 'rgba(248,113,113,0.10)')
      : isDimmed ? 'rgba(90,96,128,0.06)' : 'var(--bg3)';
    var border = isHit
      ? (e.action==='permit' ? '1px solid rgba(74,222,128,0.4)' : '1px solid rgba(248,113,113,0.4)')
      : '1px solid var(--border)';

    var actionCol = e.action==='permit' ? 'var(--green)' : 'var(--red)';
    var cmd = e.ident && e.ident.named ? aclEntryToNamedCommand(e) : aclEntryToCommand(e);

    // Build check rows
    var checks = '';
    function chk(label, res) {
      if (!res) return '';
      var icon = res.match ? '✓' : '✗';
      var col  = res.match ? 'var(--green)' : 'var(--red)';
      return '<div style="display:flex;gap:8px;padding:2px 0;font-family:var(--mono);font-size:10px;">'
        +'<span style="color:'+col+';font-weight:700;min-width:12px;">'+icon+'</span>'
        +'<span style="color:var(--muted2);">'+label+':</span>'
        +'<span style="color:var(--text);">'+res.reason+'</span>'
        +'</div>';
    }
    checks += chk('Src IP', result.srcMatch);
    if (e.mode==='extended') {
      checks += chk('Dst IP', result.dstMatch);
      checks += chk('Protocol', result.protoMatch);
      if (result.portMatch && e.portOp) checks += chk('Port', result.portMatch);
    }

    var hitBadge = isHit
      ? '<span style="font-family:var(--mono);font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;background:'+(e.action==='permit'?'rgba(74,222,128,0.2)':'rgba(248,113,113,0.2)')+';color:'+(e.action==='permit'?'var(--green)':'var(--red)')+';margin-left:auto;">⚡ MATCH</span>'
      : (isDimmed ? '<span style="font-family:var(--mono);font-size:10px;color:var(--muted);margin-left:auto;">skipped</span>' : '');

    row.className = isHit ? 'sim-hit' : '';
    row.style.cssText = 'margin-bottom:6px;border-radius:7px;overflow:hidden;border:'+border+';opacity:'+(isDimmed?'0.45':'1')+';';
    row.innerHTML =
      '<div style="padding:8px 12px;background:'+bg+';display:flex;align-items:center;gap:8px;flex-wrap:wrap;">'
        +'<span style="font-family:var(--mono);font-size:10px;color:var(--muted);min-width:18px;">'+(idx+1)+'</span>'
        +'<span style="font-family:var(--mono);font-size:11px;color:'+actionCol+';font-weight:700;flex:1;word-break:break-all;">'+cmd+'</span>'
        +hitBadge
      +'</div>'
      +(isHit||!isDimmed
        ? '<div style="padding:6px 12px 8px 12px;background:rgba(0,0,0,0.15);">'+checks+'</div>'
        : '');

    stepsEl.appendChild(row);
  });

  // Verdict
  if (matched) {
    implicitEl.style.display = 'none';
    var isPermit = matchedAction === 'permit';
    verdictEl.style.cssText = 'border-radius:8px;padding:14px 16px;margin-bottom:12px;font-family:var(--mono);font-weight:700;font-size:14px;text-align:center;'
      +'background:'+(isPermit?'rgba(74,222,128,0.12)':'rgba(248,113,113,0.12)')+';'
      +'border:1px solid '+(isPermit?'rgba(74,222,128,0.4)':'rgba(248,113,113,0.4)')+';'
      +'color:'+(isPermit?'var(--green)':'var(--red)')+';';
    verdictEl.innerHTML = isPermit
      ? '✅ PERMIT — Packet ALLOWED to pass'
      : '🚫 DENY — Packet DROPPED';
  } else {
    verdictEl.style.cssText = 'border-radius:8px;padding:14px 16px;margin-bottom:12px;font-family:var(--mono);font-weight:700;font-size:14px;text-align:center;background:rgba(248,113,113,0.12);border:1px solid rgba(248,113,113,0.4);color:var(--red);';
    verdictEl.innerHTML = '🚫 IMPLICIT DENY — No rule matched. Packet DROPPED.';
    implicitEl.style.display = 'flex';
  }
}

function aclSimReset() {
  document.getElementById('sim-src-ip').value   = '';
  document.getElementById('sim-dst-ip').value   = '';
  document.getElementById('sim-dst-port').value = '';
  document.getElementById('sim-protocol').value = 'ip';
  document.getElementById('sim-output').style.display = 'none';
  document.getElementById('sim-error').style.display  = 'none';
  document.getElementById('sim-empty').style.display  = '';
}

  // ─── THEME TOGGLE ────────────────────────────────────────────────────────
  var isLight = false;
  function toggleTheme() {
    isLight = !isLight;
    var r = document.documentElement.style;
    if (isLight) {
      r.setProperty('--bg','#f0f2f8'); r.setProperty('--bg1','#e8eaf2');
      r.setProperty('--bg2','#dde0ee'); r.setProperty('--bg3','#d4d8ea');
      r.setProperty('--bg4','#c8cde0'); r.setProperty('--text','#1a1d2e');
      r.setProperty('--muted','#7a80a0'); r.setProperty('--muted2','#4a5070');
      r.setProperty('--border','rgba(80,100,180,0.15)');
      r.setProperty('--border2','rgba(80,100,180,0.3)');
      r.setProperty('--border3','rgba(80,100,180,0.5)');
      document.getElementById('theme-btn').textContent = '☀️';
    } else {
      r.setProperty('--bg','#07090f'); r.setProperty('--bg1','#0c0f1a');
      r.setProperty('--bg2','#111520'); r.setProperty('--bg3','#181d2e');
      r.setProperty('--bg4','#1e2438'); r.setProperty('--text','#e8eaf0');
      r.setProperty('--muted','#5a6080'); r.setProperty('--muted2','#8892b0');
      r.setProperty('--border','rgba(100,160,255,0.12)');
      r.setProperty('--border2','rgba(100,160,255,0.25)');
      r.setProperty('--border3','rgba(100,160,255,0.4)');
      document.getElementById('theme-btn').textContent = '🌙';
    }
  }
  
  
  // ─── TOAST ───────────────────────────────────────────────────────────────
  function showToast(msg) {
    var t = document.getElementById('sl-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'sl-toast';
      t.style.cssText = 'position:fixed;bottom:28px;left:50%;transform:translateX(-50%);'
        + 'background:var(--bg3);border:1px solid var(--border2);color:var(--text);'
        + 'font-family:IBM Plex Mono,monospace;font-size:13px;padding:10px 22px;border-radius:12px;'
        + 'z-index:9999;transition:opacity 0.35s;pointer-events:none;white-space:nowrap';
      document.body.appendChild(t);
    }
    t.textContent = msg; t.style.opacity = '1';
    clearTimeout(t._timer);
    t._timer = setTimeout(function(){ t.style.opacity = '0'; }, 2600);
  }
  
  // ─── SHAREABLE URL ───────────────────────────────────────────────────────
  function shareURL() {
    var ip  = (document.getElementById('ip-in')  || {value:''}).value.trim();
    var pfx = (document.getElementById('pfx-in') || {value:''}).value.trim();
    var base = window.location.href.split('?')[0].split('#')[0];
    var url  = base + '?ip=' + encodeURIComponent(ip) + '&pfx=' + encodeURIComponent(pfx) + '#calc';
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function(){ showToast('🔗 Link copied to clipboard!'); });
    } else {
      prompt('Copy this shareable link:', url);
    }
  }
  
  function loadFromURL() {
    try {
      var p = new URLSearchParams(window.location.search);
      if (p.get('ip') && p.get('pfx')) {
        document.getElementById('ip-in').value  = p.get('ip');
        document.getElementById('pfx-in').value = p.get('pfx');
        setTimeout(liveCalc, 150);
      }
      var hash = (window.location.hash||'').replace('#','');
      if (hash && hash !== 'calc') {
        var nb = document.querySelector('.nav-btn[onclick*="\'' + hash + '\'"]');
        gotoPage(hash, nb);
      }
    } catch(e) {}
  }
  
  // ─── PDF EXPORT ──────────────────────────────────────────────────────────
  function exportPDF() {
    var ip  = (document.getElementById('ip-in')  || {value:'—'}).value || '—';
    var pfx = (document.getElementById('pfx-in') || {value:''}).value  || '';
    var rows = [];
    document.querySelectorAll('#page-calc .r-card').forEach(function(c) {
      var lbl = c.querySelector('.r-label');
      var val = c.querySelector('.r-val');
      if (lbl && val) rows.push([lbl.textContent.trim(), val.textContent.trim()]);
    });
    if (!rows.length) { showToast('⚠️ Calculate a subnet first'); return; }
    var tbody = rows.map(function(r){
      return '<tr><td class="f">'+r[0]+'</td><td class="v">'+r[1]+'</td></tr>';
    }).join('');
    var w = window.open('','_blank');
    if (!w) { showToast('⚠️ Allow pop-ups to export PDF'); return; }
    w.document.write('<!DOCTYPE html><html><head><meta charset="utf-8"><title>SubnetLab '+ip+pfx+'</title><style>'
      +'*{box-sizing:border-box;margin:0;padding:0}'
      +'body{font-family:Arial,sans-serif;padding:36px;color:#1a1d30;max-width:680px;margin:0 auto}'
      +'h1{font-size:22px;color:#1a2a6c;margin-bottom:6px}'
      +'.sub{font-size:12px;color:#777;margin-bottom:24px}'
      +'table{width:100%;border-collapse:collapse;border:1px solid #dde;border-radius:8px;overflow:hidden}'
      +'th{background:#1a2a6c;color:#fff;padding:9px 14px;text-align:left;font-size:12px;letter-spacing:.3px}'
      +'tr:nth-child(even){background:#f7f8fc}'
      +'td{padding:8px 14px;border-bottom:1px solid #eef;font-size:13px}'
      +'.f{color:#555;font-weight:600;width:42%}'
      +'.v{font-family:monospace;color:#1a2a6c}'
      +'.footer{margin-top:22px;font-size:10px;color:#bbb;border-top:1px solid #eee;padding-top:12px}'
      +'@media print{.pbtn{display:none}}'
      +'</style></head><body>'
      +'<h1>SubnetLab Pro — Subnet Report</h1>'
      +'<p class="sub">Generated: '+new Date().toLocaleString()+' &nbsp;·&nbsp; Network: <strong>'+ip+pfx+'</strong></p>'
      +'<table><thead><tr><th>Field</th><th>Value</th></tr></thead><tbody>'+tbody+'</tbody></table>'
      +'<p class="footer">SubnetLab Pro</p>'
      +'<br><button class="pbtn" onclick="window.print()" style="background:#1a2a6c;color:#fff;border:none;padding:10px 24px;border-radius:6px;font-size:14px;cursor:pointer;margin-top:10px">🖨️ Print / Save as PDF</button>'
      +'</body></html>');
    w.document.close();
  }
  
  // ─── VISUAL SUBNET TREE ──────────────────────────────────────────────────
  var vstNodes  = [];
  var vstNextId = 0;
  var vstDepthColors = ['#5b9cf6','#38d9c0','#a78bfa','#fb923c','#f472b6','#4ade80','#fbbf24'];
  
  function vstLoad(val) {
    document.getElementById('vst-input').value = val;
    vstInit();
  }
  
  function vstInit() {
    var el  = document.getElementById('vst-input');
    var raw = el ? el.value.trim() : '';
    if (!raw.includes('/')) { showToast('Enter as IP/prefix e.g. 192.168.0.0/24'); return; }
    var parts = raw.split('/');
    var pfx   = parseInt(parts[1]);
    if (!validateIP(parts[0]) || isNaN(pfx) || pfx < 0 || pfx > 30) {
      showToast('Use a valid network with prefix /0 – /30'); return;
    }
    var mask = maskFromP(pfx);
    var net  = (ip2n(parts[0]) & mask) >>> 0;
    vstNodes  = [];
    vstNextId = 0;
    vstNodes.push({ id: vstNextId++, net: net, prefix: pfx, parentId: null, depth: 0, divided: false });
    vstRender();
  }
  
  function vstReset() {
    vstNodes = [];
    var tw = document.getElementById('vst-table-wrap');
    var tb = document.getElementById('vst-tbody');
    if (tw) tw.style.display = 'none';
    if (tb) tb.innerHTML = '';
  }
  
  function vstDivide(id) {
    var node = vstNodes.find(function(n){ return n.id === id; });
    if (!node || node.divided || node.prefix >= 30) { showToast('Cannot divide beyond /30'); return; }
    var newPfx = node.prefix + 1;
    var half   = Math.pow(2, 32 - newPfx) >>> 0;
    vstNodes.push({ id: vstNextId++, net: node.net,             prefix: newPfx, parentId: id, depth: node.depth+1, divided: false });
    vstNodes.push({ id: vstNextId++, net: (node.net+half)>>>0,  prefix: newPfx, parentId: id, depth: node.depth+1, divided: false });
    node.divided = true;
    vstRender();
  }
  
  function vstJoin(parentId) {
    var parent = vstNodes.find(function(n){ return n.id === parentId; });
    if (!parent) return;
    function removeDesc(nid) {
      vstNodes.filter(function(n){ return n.parentId === nid; }).forEach(function(c){ removeDesc(c.id); });
      vstNodes = vstNodes.filter(function(n){ return n.id !== nid; });
    }
    vstNodes.filter(function(n){ return n.parentId === parentId; }).forEach(function(c){ removeDesc(c.id); });
    parent.divided = false;
    vstRender();
  }
  
  function vstRender() {
    var tbody = document.getElementById('vst-tbody');
    var tw    = document.getElementById('vst-table-wrap');
    if (!tbody || !tw) return;
    tw.style.display = 'block';
  
    var dividedIds = {};
    vstNodes.forEach(function(n){ if (n.divided) dividedIds[n.id] = true; });
    var leaves = vstNodes.filter(function(n){ return !dividedIds[n.id]; });
    leaves.sort(function(a,b){ return a.net - b.net; });
  
    var root = vstNodes.find(function(n){ return n.parentId === null; });
    var html = '';
  
    leaves.forEach(function(node) {
      var mask  = maskFromP(node.prefix);
      var bc    = (node.net | (~mask>>>0)) >>> 0;
      var first = node.net + 1;
      var last  = bc - 1;
      var total = Math.pow(2, 32 - node.prefix);
      var hosts = node.prefix <= 30 ? total - 2 : (node.prefix === 31 ? 2 : 1);
      var usable = node.prefix <= 30
        ? n2ip(first) + ' – ' + n2ip(last)
        : (node.prefix === 31 ? n2ip(node.net)+' – '+n2ip(bc) : 'Host only');
      var color  = vstDepthColors[node.depth % vstDepthColors.length];
      var indent = node.depth * 16;
  
      html += '<tr>'
        + '<td style="white-space:nowrap">'
          + '<span style="display:inline-block;width:'+indent+'px"></span>'
          + (node.depth > 0 ? '<span style="color:var(--muted);margin-right:4px">└─</span>' : '')
          + '<span style="font-family:var(--mono);font-weight:700;color:'+color+'">'+n2ip(node.net)+'/'+node.prefix+'</span>'
        + '</td>'
        + '<td style="font-family:var(--mono);color:var(--muted2);font-size:12px">'+n2ip(mask)+'</td>'
        + '<td style="font-family:var(--mono);font-size:11px">'+n2ip(node.net)+' – '+n2ip(bc)+'</td>'
        + '<td style="font-family:var(--mono);font-size:11px;color:var(--cyan)">'+usable+'</td>'
        + '<td style="font-family:var(--mono);color:var(--amber)">'+hosts.toLocaleString()+'</td>'
        + '<td>'+(node.prefix < 30
            ? '<button class="btn-ghost btn-sm" style="padding:4px 12px;font-size:11px" onclick="vstDivide('+node.id+')">÷ Divide</button>'
            : '<span style="color:var(--muted);font-size:11px">/30 min</span>')
        + '</td>'
        + '<td>'+(node.parentId !== null
            ? '<button class="btn-ghost btn-sm" style="padding:4px 12px;font-size:11px;color:var(--amber);border-color:rgba(251,191,36,0.3)" onclick="vstJoin('+node.parentId+')">⊕ Join</button>'
            : '<span style="color:var(--muted);font-size:11px">Root</span>')
        + '</td>'
        + '</tr>';
    });
  
    tbody.innerHTML = html;
    var cnt = document.getElementById('vst-count');
    var cov = document.getElementById('vst-covered');
    if (cnt) cnt.textContent = leaves.length;
    if (cov && root) {
      var rm = maskFromP(root.prefix);
      var rb = (root.net|(~rm>>>0))>>>0;
      cov.textContent = n2ip(root.net)+' – '+n2ip(rb)+' (/'+root.prefix+')';
    }
  }
  
  // ─── PACKET TRACER ───────────────────────────────────────────────────────
  var ptRouterCount = 0;
  
  function ptInit() {
    var cont = document.getElementById('pt-routers');
    if (!cont) return;
    if (cont.children.length === 0) {
      ptAddRouter('Router A', '192.168.1.1', '192.168.1.0/24\n10.0.0.1/8');
      ptAddRouter('Router B', '10.0.0.254',  '10.0.0.0/8\n172.16.0.0/16');
    }
    ptDrawDiagram();
  }
  
  function ptAddRouter(name, gw, nets) {
    var id  = ptRouterCount++;
    var div = document.createElement('div');
    div.id  = 'ptr-'+id;
    div.style.cssText = 'background:var(--bg3);border:1px solid var(--border);border-radius:var(--r);padding:12px;margin-bottom:10px';
    div.innerHTML =
      '<div style="display:flex;gap:8px;align-items:flex-start;flex-wrap:wrap">'
      +'<div class="field-group" style="flex:1;min-width:100px">'
        +'<label class="field-label">Router Name</label>'
        +'<input type="text" value="'+(name||'Router '+id)+'" oninput="ptDrawDiagram()" style="color:var(--blue)">'
      +'</div>'
      +'<div class="field-group" style="flex:1;min-width:100px">'
        +'<label class="field-label">Gateway IP</label>'
        +'<input type="text" value="'+(gw||'')+'" oninput="ptDrawDiagram()" style="color:var(--cyan)">'
      +'</div>'
      +'<div class="field-group" style="flex:2;min-width:160px">'
        +'<label class="field-label">Connected Networks (one per line) use networks and Routing protocols</label>'
        +'<textarea rows="3" oninput="ptDrawDiagram()" style="color:var(--amber)">'+(nets||'')+'</textarea>'
      +'</div>'
      +'<button onclick="this.closest(\'[id^=ptr-]\').remove();ptDrawDiagram()" '
      +'style="background:transparent;border:none;color:var(--muted);cursor:pointer;font-size:18px;padding:0;margin-top:18px">✕</button>'
      +'</div>';
    document.getElementById('pt-routers').appendChild(div);
  }
  
  function ptGetRouters() {
    var out = [];
    document.querySelectorAll('[id^="ptr-"]').forEach(function(div) {
      var ins = div.querySelectorAll('input');
      var ta  = div.querySelector('textarea');
      var name = ins[0] ? ins[0].value.trim() : '';
      var gw   = ins[1] ? ins[1].value.trim() : '';
      var nets = ta ? ta.value.trim().split('\n').map(function(l){ return l.trim(); }).filter(Boolean) : [];
      if (name) out.push({ name:name, gw:gw, nets:nets });
    });
    return out;
  }
  
  function ptFindRouter(ip, routers) {
    for (var i=0; i<routers.length; i++) {
      var r = routers[i];
      for (var j=0; j<r.nets.length; j++) {
        var n = r.nets[j];
        if (!n.includes('/')) continue;
        var pts = n.split('/');
        var pfx = parseInt(pts[1]);
        if (!validateIP(pts[0]) || isNaN(pfx)) continue;
        var mask = maskFromP(pfx);
        var net  = (ip2n(pts[0]) & mask) >>> 0;
        var bc   = (net|(~mask>>>0)) >>> 0;
        if (ip2n(ip) >= net && ip2n(ip) <= bc) return { router:r, network:n };
      }
    }
    return null;
  }
  
  function ptTrace() {
    var src = (document.getElementById('pt-src')||{value:''}).value.trim();
    var dst = (document.getElementById('pt-dst')||{value:''}).value.trim();
    var res = document.getElementById('pt-result');
    if (!res) return;
    if (!validateIP(src)||!validateIP(dst)) {
      res.innerHTML='<div class="callout callout-err">Enter valid source and destination IPs</div>'; return;
    }
    var routers  = ptGetRouters();
    if (!routers.length) { res.innerHTML='<div class="callout callout-warn">Add at least one router</div>'; return; }
    var srcInfo  = ptFindRouter(src, routers);
    var dstInfo  = ptFindRouter(dst, routers);
    var steps    = [];
  
    steps.push({ icon:'📤', text:'<strong>Source:</strong> '+src+(srcInfo?' — subnet <strong>'+srcInfo.network+'</strong> on <strong>'+srcInfo.router.name+'</strong>':' — not in any configured subnet') });
  
    if (src === dst) {
      steps.push({ icon:'✅', text:'Source and destination are the same — no forwarding needed' });
    } else if (srcInfo && dstInfo) {
      if (srcInfo.router.name === dstInfo.router.name) {
        steps.push({ icon:'🔄', text:'Same router (<strong>'+srcInfo.router.name+'</strong>) — direct layer-3 delivery' });
        steps.push({ icon:'✅', text:'Packet delivered to '+dst+' via '+dstInfo.network });
      } else {
        steps.push({ icon:'🔀', text:'<strong>'+srcInfo.router.name+'</strong> checks routing table for '+dst });
        var shared = null;
        srcInfo.router.nets.forEach(function(sn){ dstInfo.router.nets.forEach(function(dn){ if(sn===dn) shared=sn; }); });
        if (shared) {
          steps.push({ icon:'🔗', text:'Shared link found: <strong>'+shared+'</strong> between <strong>'+srcInfo.router.name+'</strong> and <strong>'+dstInfo.router.name+'</strong>' });
          steps.push({ icon:'➡️', text:'Packet forwarded: '+srcInfo.router.gw+' → '+dstInfo.router.gw });
        } else {
          steps.push({ icon:'⚠️', text:'No direct path — needs static route or default gateway between routers' });
        }
        steps.push({ icon:'📥', text:'<strong>'+dstInfo.router.name+'</strong> delivers to '+dst+' on '+dstInfo.network });
        steps.push({ icon:'✅', text:shared ? 'Delivery successful' : 'Delivery requires additional routing configuration' });
      }
    } else if (!srcInfo) {
      steps.push({ icon:'❌', text:'Source '+src+' not found in any subnet — packet dropped' });
    } else {
      steps.push({ icon:'⚠️', text:'Destination '+dst+' unknown — forwarded to default gateway (if configured)' });
    }
  
    res.innerHTML = steps.map(function(s,i){
      return '<div style="display:flex;gap:12px;align-items:flex-start;padding:10px 0;border-bottom:1px solid var(--border);opacity:0;transform:translateY(8px);animation:fadeUp 0.3s ease '+(i*0.09)+'s forwards">'
        +'<span style="font-size:18px;flex-shrink:0;line-height:1.5">'+s.icon+'</span>'
        +'<div style="font-family:var(--mono);font-size:12px;line-height:1.8;color:var(--muted2)">'+s.text+'</div></div>';
    }).join('');
    ptDrawDiagram(src, dst, srcInfo, dstInfo);
  }
  
  function ptDrawDiagram(src, dst, srcInfo, dstInfo) {
    var svg = document.getElementById('pt-svg');
    if (!svg) return;
    var routers = ptGetRouters();
    if (!routers.length) { svg.innerHTML=''; return; }
    var W=480, rW=100, rH=46, yR=80;
    var gap = Math.max(20, Math.floor((W - routers.length*rW - 20) / Math.max(routers.length-1,1)));
    var totalW = routers.length*rW + Math.max(0,routers.length-1)*gap;
    var sx = Math.max(10, (W-totalW)/2);
    var out = '<defs><marker id="ptarr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M2,2L8,5L2,8" fill="none" stroke="rgba(251,191,36,0.8)" stroke-width="1.5"/></marker></defs>';
    if (src && dst) {
      out += '<line x1="14" y1="24" x2="'+(W-14)+'" y2="24" stroke="rgba(251,191,36,0.35)" stroke-width="1.5" stroke-dasharray="6 3" marker-end="url(#ptarr)"/>';
      out += '<text x="14" y="16" font-family="IBM Plex Mono,monospace" font-size="9" fill="rgba(91,156,246,0.9)">'+src+'</text>';
      out += '<text x="'+(W-14)+'" y="16" text-anchor="end" font-family="IBM Plex Mono,monospace" font-size="9" fill="rgba(56,217,192,0.9)">'+dst+'</text>';
    }
    routers.forEach(function(r,i) {
      var x  = sx+i*(rW+gap), cx = x+rW/2;
      var iS = srcInfo && srcInfo.router.name===r.name;
      var iD = dstInfo && dstInfo.router.name===r.name;
      var fill = iS?'rgba(91,156,246,0.22)':iD?'rgba(56,217,192,0.15)':'rgba(30,36,56,0.5)';
      var strk = iS?'rgba(91,156,246,0.6)':iD?'rgba(56,217,192,0.5)':'rgba(100,120,180,0.25)';
      out += '<rect x="'+x+'" y="'+yR+'" width="'+rW+'" height="'+rH+'" rx="8" fill="'+fill+'" stroke="'+strk+'" stroke-width="1.5"/>';
      out += '<text x="'+cx+'" y="'+(yR+16)+'" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="10" font-weight="700" fill="'+(iS?'#7db3ff':iD?'#5ee8d4':'#8892b0')+'">'+r.name+'</text>';
      out += '<text x="'+cx+'" y="'+(yR+30)+'" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="rgba(140,150,180,0.6)">'+r.gw+'</text>';
      r.nets.slice(0,2).forEach(function(n,j){
        var ny=yR+rH+10+j*20;
        out += '<rect x="'+(x+3)+'" y="'+ny+'" width="'+(rW-6)+'" height="16" rx="4" fill="rgba(56,217,192,0.07)" stroke="rgba(56,217,192,0.18)" stroke-width="0.8"/>';
        out += '<text x="'+cx+'" y="'+(ny+11)+'" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="rgba(56,217,192,0.75)">'+n+'</text>';
      });
      out += '<line x1="'+cx+'" y1="'+(yR+rH)+'" x2="'+cx+'" y2="'+(yR+rH+8)+'" stroke="rgba(56,217,192,0.15)" stroke-width="0.8" stroke-dasharray="3 2"/>';
      if (i>0) {
        var px=sx+(i-1)*(rW+gap)+rW, midY=yR+rH/2;
        out += '<line x1="'+px+'" y1="'+midY+'" x2="'+x+'" y2="'+midY+'" stroke="rgba(91,156,246,0.25)" stroke-width="1.5"/>';
        out += '<circle cx="'+((px+x)/2)+'" cy="'+midY+'" r="3" fill="rgba(91,156,246,0.4)"/>';
      }
    });
    svg.innerHTML = out;
  }
  
  loadFromURL();
  
  
  // ─── COURSE ENGINE ────────────────────────────────────────────────────
  function initCourse(which) {
    showTopic(which, 0);
  }
  
  function showTopic(which, idx) {
    // Hide all panels
    document.querySelectorAll('#page-' + which + ' .topic-panel').forEach(p => {
      p.classList.remove('active-panel');
    });
    // Deactivate all tabs
    document.querySelectorAll('#page-' + which + ' .course-tab').forEach(t => {
      t.classList.remove('active');
    });
    // Show selected
    const panel = document.getElementById(which + '-topic-' + idx);
    const tab = document.getElementById(which + '-tab-' + idx);
    if (panel) panel.classList.add('active-panel');
    if (tab) tab.classList.add('active');
    // Init demos for first load
    if (which === 'ccna') {
      if (idx === 0) { osiStep(0); }
      if (idx === 1) { arpStep(0); }
      if (idx === 2) { switchStep(0); }
      if (idx === 4) { tcpStep(0); }
    }
  }
  
  function toggleQA(el) {
    el.classList.toggle('open');
    const ans = el.nextElementSibling;
    if (ans) ans.classList.toggle('open');
  }
  
  function setActiveBtn(btn) {
    const parent = btn.parentElement;
    parent.querySelectorAll('.osi-step-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }
  
  // ─── OSI INTERACTIVE DEMO ─────────────────────────────────────────────
  const osiSteps = [
    {
      label: 'L7 Application — Your browser initiates the request',
      text: `<span style="color:var(--blue)">Layer 7 — Application</span>
  Your browser (Chrome/Firefox) needs to fetch http://example.com/index.html
  
  <span style="color:var(--muted)">Action:</span> HTTP protocol builds a GET request message:
  <span style="color:var(--cyan)">GET /index.html HTTP/1.1
  Host: example.com
  User-Agent: Mozilla/5.0
  Accept: text/html</span>
  
  <span style="color:var(--muted)">PDU at this layer:</span> <span style="color:var(--green)">DATA</span>
  No headers added yet — just the raw application data.
  This is passed down to Layer 4 (Transport).`
    },
    {
      label: 'L4 Transport — TCP segment created',
      text: `<span style="color:var(--green)">Layer 4 — Transport (TCP)</span>
  OS picks an ephemeral source port (e.g., 54321) and targets port 80 (HTTP).
  
  <span style="color:var(--muted)">TCP header added:</span>
  <span style="color:var(--cyan)">Source Port : 54321       (random, >1024)
  Dest Port   : 80          (HTTP service)
  Seq Number  : 100         (ISN from 3-way handshake)
  ACK Number  : 0
  Flags       : PSH + ACK   (push data, acknowledge)
  Window      : 65535       (receive buffer available)</span>
  
  <span style="color:var(--muted)">PDU:</span> <span style="color:var(--green)">SEGMENT</span>  (TCP header + HTTP data)
  Passed down to Layer 3.`
    },
    {
      label: 'L3 Network — IP packet created',
      text: `<span style="color:var(--cyan)">Layer 3 — Network (IP)</span>
  OS looks up the routing table. example.com resolves to 93.184.216.34.
  Your PC IP is 192.168.1.10. Default gateway: 192.168.1.1.
  
  <span style="color:var(--muted)">IP header added:</span>
  <span style="color:var(--cyan)">Version     : 4          (IPv4)
  IHL         : 5          (20 bytes, no options)
  DSCP        : 0          (best effort)
  Total Len   : 560 bytes
  TTL         : 64         (decremented at each router)
  Protocol    : 6          (TCP)
  Src IP      : 192.168.1.10
  Dst IP      : 93.184.216.34</span>
  
  <span style="color:var(--muted)">PDU:</span> <span style="color:var(--green)">PACKET</span>  (IP header + TCP segment)
  Passed down to Layer 2.`
    },
    {
      label: 'L2 Data Link — Ethernet frame created',
      text: `<span style="color:var(--blue)">Layer 2 — Data Link (Ethernet)</span>
  NIC needs the MAC of the default gateway (192.168.1.1).
  ARP is used if not cached: "Who has 192.168.1.1? Tell 192.168.1.10"
  Gateway replies with its MAC: aa:bb:cc:11:22:33
  
  <span style="color:var(--muted)">Ethernet frame header added:</span>
  <span style="color:var(--cyan)">Dst MAC     : aa:bb:cc:11:22:33  (default gateway)
  Src MAC     : 11:22:33:44:55:66  (your NIC)
  EtherType   : 0x0800             (IPv4 payload)
  [IP Packet as payload]
  FCS/CRC     : 0xA3F20C1B         (error check)</span>
  
  <span style="color:var(--muted)">PDU:</span> <span style="color:var(--green)">FRAME</span>  (Eth header + IP packet + FCS)
  Passed down to Layer 1.`
    },
    {
      label: 'L1 Physical — Bits on the wire',
      text: `<span style="color:rgba(140,150,180,0.7)">Layer 1 — Physical</span>
  NIC serializes the frame into electrical signals (copper) or light pulses (fiber).
  
  <span style="color:var(--muted)">Frame in binary:</span>
  <span style="color:var(--cyan)">10101010 10101010 10101010 10101010   ← Preamble (sync)
  10101011                               ← SFD (Start Frame Delimiter)
  10101010 11001100 10111011 00010001   ← Dst MAC bytes
  00010001 00100010 00110011 01000100   ← Src MAC bytes
  10001000 00000000                     ← EtherType 0x0800
  [560 bytes of IP+TCP+HTTP data]
  ... 10100011 11110010 00001100 00011011  ← FCS</span>
  
  <span style="color:var(--muted)">On 1 Gbps Ethernet: this 580B frame takes ~4.6 microseconds to transmit.</span>`
    },
    {
      label: '→ At a Router — What happens at each hop',
      text: `<span style="color:var(--amber)">At the Router (Default Gateway 192.168.1.1)</span>
  The router processes up to Layer 3 ONLY.
  
  <span style="color:var(--muted)">Step by step:</span>
  <span style="color:var(--cyan)">1. NIC receives bits → reconstructs Ethernet frame (L1→L2)
  2. Checks Dst MAC = its own MAC ✓ → accepts frame
  3. Strips Ethernet header (L2 decapsulation)
  4. Reads IP Dst: 93.184.216.34 → performs routing lookup
  5. Matches default route 0.0.0.0/0 → next-hop: ISP router
  6. Decrements TTL: 64 → 63  (drop if reaches 0)
  7. ARP for next-hop MAC (or uses cached entry)
  8. Builds NEW Ethernet frame:
     Src MAC: router's outbound interface MAC
     Dst MAC: ISP router's MAC
  9. Transmits on WAN interface</span>
  
  <span style="color:var(--green)">Key: IP src/dst addresses UNCHANGED. Only L2 MACs change at every hop.</span>`
    },
    {
      label: '→ At Destination — Decapsulation',
      text: `<span style="color:var(--green)">At example.com Server (93.184.216.34)</span>
  Packet arrives after N router hops. Decapsulation happens bottom-up:
  
  <span style="color:var(--cyan)">L1: Bits → frame reconstructed by NIC
  L2: Dst MAC matches server's NIC → accept. Strip Eth header.
  L3: Dst IP 93.184.216.34 = our IP ✓. Protocol=6 (TCP). Strip IP header.
  L4: Dst Port 80 → pass to HTTP listener process. Strip TCP header.
  L7: HTTP request received!
      "GET /index.html HTTP/1.1" → serve the file</span>
  
  <span style="color:var(--muted)">Server builds response:</span>
  <span style="color:var(--cyan)">HTTP/1.1 200 OK
  Content-Type: text/html
  Content-Length: 1256
  [HTML content]</span>
  
  <span style="color:var(--green)">Response travels back the same way in reverse — full encapsulation again.</span>
  <span style="color:var(--muted)">Total round-trip for a typical request: 5–50ms depending on distance.</span>`
    }
  ];
  
  function osiStep(idx) {
    const demo = document.getElementById('osi-demo');
    if (!demo) return;
    const s = osiSteps[idx];
    if (!s) return;
    demo.innerHTML = `<div style="color:var(--blue);margin-bottom:8px;font-weight:700">▶ ${s.label}</div>${s.text}`;
    const btns = document.querySelectorAll('#ccna-topic-0 .osi-step-btn');
    btns.forEach((b, i) => b.classList.toggle('active', i === idx));
  }
  
  // ─── ARP INTERACTIVE DEMO ─────────────────────────────────────────────
  const arpSteps = [
    {
      label: 'Step 1: PC needs to send to 192.168.1.1 — checks ARP cache',
      text: `<span style="color:var(--blue)">PC (192.168.1.10) wants to send a packet to 192.168.1.1 (gateway)</span>
  
  <span style="color:var(--muted)">PC checks ARP cache:</span>
  <span style="color:var(--cyan)">arp -a
    Interface: 192.168.1.10
    No entry found for 192.168.1.1 ← cache miss!</span>
  
  <span style="color:var(--muted)">PC cannot send the Ethernet frame without a destination MAC.
  It must use ARP to discover the MAC address.
  ARP Request will be broadcast to all devices on the segment.</span>`
    },
    {
      label: 'Step 2: ARP Request broadcast — "Who has 192.168.1.1?"',
      text: `<span style="color:var(--amber)">ARP Request — Sent as Ethernet Broadcast</span>
  
  <span style="color:var(--muted)">Ethernet Frame:</span>
  <span style="color:var(--cyan)">Dst MAC   : ff:ff:ff:ff:ff:ff  ← BROADCAST (all devices receive)
  Src MAC   : 11:22:33:44:55:66  ← PC's MAC
  EtherType : 0x0806             ← ARP</span>
  
  <span style="color:var(--muted)">ARP Payload:</span>
  <span style="color:var(--cyan)">HW Type   : 1      (Ethernet)
  Proto Type: 0x0800 (IPv4)
  Operation : 1      (Request)
  Sender MAC: 11:22:33:44:55:66  ← PC's MAC
  Sender IP : 192.168.1.10       ← PC's IP
  Target MAC: 00:00:00:00:00:00  ← unknown (what we want!)
  Target IP : 192.168.1.1        ← who we're asking about</span>
  
  <span style="color:var(--green)">Every device on the segment receives this frame.
  Only 192.168.1.1 will respond.</span>`
    },
    {
      label: 'Step 3: Gateway replies — "192.168.1.1 is at aa:bb:cc:11:22:33"',
      text: `<span style="color:var(--green)">ARP Reply — Unicast from Gateway to PC</span>
  
  <span style="color:var(--muted)">Ethernet Frame:</span>
  <span style="color:var(--cyan)">Dst MAC   : 11:22:33:44:55:66  ← PC's MAC (unicast reply)
  Src MAC   : aa:bb:cc:11:22:33  ← Gateway's MAC
  EtherType : 0x0806             ← ARP</span>
  
  <span style="color:var(--muted)">ARP Payload:</span>
  <span style="color:var(--cyan)">Operation : 2      (Reply)
  Sender MAC: aa:bb:cc:11:22:33  ← Gateway's MAC ← THIS IS THE ANSWER
  Sender IP : 192.168.1.1        ← Gateway's IP
  Target MAC: 11:22:33:44:55:66  ← PC's MAC
  Target IP : 192.168.1.10       ← PC's IP</span>
  
  <span style="color:var(--amber)">Note: ARP Reply is unicast (not broadcast) — only PC receives it.</span>`
    },
    {
      label: 'Step 4: PC updates ARP cache',
      text: `<span style="color:var(--cyan)">PC stores the mapping in its ARP cache</span>
  
  <span style="color:var(--muted)">ARP cache after update:</span>
  <span style="color:var(--cyan)">arp -a
    Interface: 192.168.1.10
    Internet Address    Physical Address    Type
    192.168.1.1         aa-bb-cc-11-22-33   dynamic  ← just learned!
    192.168.1.254       dd-ee-ff-00-11-22   dynamic</span>
  
  <span style="color:var(--muted)">Cache entry lifetime:</span>
  <span style="color:var(--cyan)">Windows: ~2 minutes (refreshes if used)
  Linux  : ~60 seconds (arp_base_reachable_time)
  Cisco  : ~4 hours (ip arp timeout 14400)</span>
  
  <span style="color:var(--green)">No more ARP broadcasts for 192.168.1.1 until cache expires.</span>`
    },
    {
      label: 'Step 5: PC now sends the original Ethernet frame',
      text: `<span style="color:var(--green)">ARP complete — original packet can now be sent!</span>
  
  <span style="color:var(--muted)">The Ethernet frame that was waiting:</span>
  <span style="color:var(--cyan)">Dst MAC   : aa:bb:cc:11:22:33  ← Gateway MAC (from ARP cache)
  Src MAC   : 11:22:33:44:55:66  ← PC's MAC
  EtherType : 0x0800             ← IPv4
  [IP Packet: 192.168.1.10 → 93.184.216.34]
  FCS       : 0xA3F20C1B</span>
  
  <span style="color:var(--muted)">Subsequent packets to same destination:</span>
  <span style="color:var(--cyan)">1. Check ARP cache → hit! ✓
  2. Build frame immediately — no ARP needed
  3. Send directly</span>
  
  <span style="color:var(--amber)">Total ARP overhead for first packet: 2 extra frames (Request + Reply).
  All subsequent packets: 0 overhead until cache expires.</span>`
    }
  ];
  
  function arpStep(idx) {
    const demo = document.getElementById('arp-demo');
    if (!demo) return;
    const s = arpSteps[idx];
    if (!s) return;
    demo.innerHTML = `<div style="color:var(--cyan);margin-bottom:8px;font-weight:700">▶ ${s.label}</div>${s.text}`;
    const btns = document.querySelectorAll('#ccna-topic-1 .osi-step-btn');
    btns.forEach((b, i) => b.classList.toggle('active', i === idx));
  }
  
  // ─── SWITCH DEMO ──────────────────────────────────────────────────────
  const switchSteps = [
    {
      label: 'Unknown Unicast — switch floods',
      text: `<span style="color:var(--amber)">Frame arrives: Src=AA:BB, Dst=CC:DD</span>
  
  <span style="color:var(--muted)">Switch actions:</span>
  <span style="color:var(--cyan)">1. LEARN: Add AA:BB → Port 1 to MAC table
  2. LOOKUP: Search for CC:DD in MAC table
  3. RESULT: CC:DD NOT FOUND ← Unknown Unicast
  4. ACTION: FLOOD — copy frame out ALL ports except Port 1
  
     Port 1 (source) : ← (no, don't send back)
     Port 2          : → CC:DD frame sent
     Port 3          : → CC:DD frame sent
     Port 4          : → CC:DD frame sent</span>
  
  <span style="color:var(--green)">The real CC:DD device will respond, teaching the switch its port.
  Unknown unicast = temporary; broadcast is always flooded.</span>`
    },
    {
      label: 'MAC Table Learning — how switches learn',
      text: `<span style="color:var(--blue)">MAC Table after several frames:</span>
  
  <span style="color:var(--cyan)">MAC Address        VLAN    Port      Age
  ─────────────────────────────────────────
  aa:bb:cc:11:22:33   1      Gi0/1     45s   ← learned from frame
  11:22:33:44:55:66   1      Gi0/2     12s
  dd:ee:ff:00:11:22   10     Gi0/3     2s
  ff:ff:ff:ff:ff:ff   —      (all)     —     ← broadcast, always flood</span>
  
  <span style="color:var(--muted)">MAC aging timer:</span>
  <span style="color:var(--cyan)">Default: 300 seconds (5 minutes) on Cisco
  If no frame with that src MAC arrives in 300s → entry deleted
  Config: mac address-table aging-time 120</span>
  
  <span style="color:var(--amber)">A switch with a full MAC table will drop new entries (oldest out)
  or flood — this is exploited in MAC flooding attacks.
  Mitigation: port security (switchport port-security maximum 2)</span>`
    },
    {
      label: 'Known Unicast — forwarded only to correct port',
      text: `<span style="color:var(--green)">Known Unicast — most efficient forwarding</span>
  
  <span style="color:var(--muted)">Frame arrives: Src=AA:BB (Port 1), Dst=DD:EE (in MAC table → Port 3)</span>
  <span style="color:var(--cyan)">1. LEARN: AA:BB → Port 1 (refresh timer)
  2. LOOKUP: DD:EE → found in MAC table → Port 3
  3. ACTION: FORWARD — send ONLY out Port 3
  
     Port 1 (source) : ← blocked (no hairpin)
     Port 2          : ✗ not sent (different dst)
     Port 3          : ✓ FORWARDED ← correct destination
     Port 4          : ✗ not sent</span>
  
  <span style="color:var(--green)">This is why switches reduce collisions vs hubs.
  Each port is a separate collision domain — full duplex possible.</span>`
    },
    {
      label: 'Broadcast — flooded everywhere in the VLAN',
      text: `<span style="color:var(--red)">Broadcast Frame: Dst = ff:ff:ff:ff:ff:ff</span>
  
  <span style="color:var(--muted)">Broadcast frames are ALWAYS flooded — no MAC table lookup needed:</span>
  <span style="color:var(--cyan)">Frame: Src=AA:BB, Dst=FF:FF:FF:FF:FF:FF (ARP Request)
  
  1. LEARN: AA:BB → Port 1
  2. LOOKUP: FF:FF... = broadcast, skip lookup
  3. ACTION: FLOOD to ALL ports in same VLAN except source
  
     Port 1 (source) : ← blocked
     Port 2 (VLAN 1) : → broadcast sent
     Port 3 (VLAN 1) : → broadcast sent
     Port 4 (VLAN 10): ✗ different VLAN — NOT sent</span>
  
  <span style="color:var(--amber)">This is why VLANs are valuable — they contain broadcast domains.
  A broadcast storm = infinite looping broadcasts = network failure.
  STP prevents loops; storm-control limits broadcast rate.</span>`
    }
  ];
  
  function switchStep(idx) {
    const demo = document.getElementById('switch-demo');
    if (!demo) return;
    const s = switchSteps[idx];
    if (!s) return;
    demo.innerHTML = `<div style="color:var(--amber);margin-bottom:8px;font-weight:700">▶ ${s.label}</div>${s.text}`;
    const btns = document.querySelectorAll('#ccna-topic-2 .osi-step-btn');
    btns.forEach((b, i) => b.classList.toggle('active', i === idx));
  }
  
  // ─── TCP DEMO ─────────────────────────────────────────────────────────
  const tcpSteps = [
    {
      label: 'Step 1: SYN — Client initiates connection',
      text: `<span style="color:var(--blue)">Client → Server: SYN</span>
  Client wants to connect to 93.184.216.34:80
  
  <span style="color:var(--cyan)">TCP Segment:
    Src Port : 54321        ← random ephemeral
    Dst Port : 80           ← HTTP
    Seq Num  : 1000         ← Initial Sequence Number (ISN), random
    ACK Num  : 0            ← not yet acknowledged anything
    Flags    : SYN=1        ← only SYN set
    Window   : 65535        ← receive buffer size</span>
  
  <span style="color:var(--muted)">Client enters SYN_SENT state. ISN is random (security — prevents spoofing).
  Server receives SYN, checks if port 80 is listening...
  If yes → responds with SYN-ACK. If no → RST.</span>`
    },
    {
      label: 'Step 2: SYN-ACK — Server accepts and synchronizes',
      text: `<span style="color:var(--green)">Server → Client: SYN-ACK</span>
  Server acknowledges client's SYN and sends its own SYN.
  
  <span style="color:var(--cyan)">TCP Segment:
    Src Port : 80           ← server
    Dst Port : 54321        ← back to client
    Seq Num  : 5000         ← Server's ISN (different, random)
    ACK Num  : 1001         ← Client ISN + 1 (1000+1) ← "got your SYN"
    Flags    : SYN=1, ACK=1 ← both set
    Window   : 28960        ← server's receive buffer</span>
  
  <span style="color:var(--muted)">Server enters SYN_RECEIVED state.
  Client must now send ACK to complete the handshake.
  After this the server allocates connection resources (TCB).</span>`
    },
    {
      label: 'Step 3: ACK — Client completes handshake',
      text: `<span style="color:var(--green)">Client → Server: ACK — Connection ESTABLISHED ✓</span>
  
  <span style="color:var(--cyan)">TCP Segment:
    Src Port : 54321
    Dst Port : 80
    Seq Num  : 1001         ← ISN + 1 (SYN consumed 1 byte)
    ACK Num  : 5001         ← Server ISN + 1 (5000+1) ← "got your SYN"
    Flags    : ACK=1        ← only ACK
    Window   : 65535</span>
  
  <span style="color:var(--green)">Both sides now in ESTABLISHED state.
  Data transfer can begin immediately after this.
  Total overhead: 3 packets, ~1.5 × RTT latency before first data byte.</span>
  
  <span style="color:var(--muted)">TCP Fast Open (TFO) can send data in the SYN itself on repeat connections.</span>`
    },
    {
      label: 'Data Transfer — Reliable, ordered delivery',
      text: `<span style="color:var(--cyan)">Data Transfer Phase</span>
  
  <span style="color:var(--muted)">Client sends HTTP GET (cumulative ACK example):</span>
  <span style="color:var(--cyan)">Client→Server: Seq=1001, Len=200  [HTTP GET request]
  Server→Client: ACK=1201           [ACKs all 200 bytes]
  Server→Client: Seq=5001, Len=1400 [HTTP Response part 1]
  Client→Server: ACK=6401           [ACKs 1400 bytes]
  Server→Client: Seq=6401, Len=1400 [HTTP Response part 2]
  Server→Client: Seq=7801, Len=1400 [HTTP Response part 3]
  Client→Server: ACK=9201           [ACKs parts 2 and 3 together ← delayed ACK]</span>
  
  <span style="color:var(--muted)">Sliding Window — how throughput scales:</span>
  <span style="color:var(--cyan)">Window=65535 → can have 65535 unACKed bytes in flight
  Throughput = Window / RTT = 65535 / 0.05s = ~10 Mbps
  TCP Scaling extends to 1GB+ windows for high-speed links</span>`
    },
    {
      label: 'FIN-ACK — Connection teardown (4-way)',
      text: `<span style="color:var(--pink)">Connection Close — 4-Way FIN Handshake</span>
  
  <span style="color:var(--cyan)">Client→Server: FIN, Seq=1201    ← "I'm done sending"
  Server→Client: ACK, Ack=1202    ← "Got your FIN"
  Server→Client: FIN, Seq=6801    ← "I'm done too"
  Client→Server: ACK, Ack=6802    ← "Got your FIN"</span>
  
  <span style="color:var(--muted)">States after FIN:</span>
  <span style="color:var(--cyan)">Client: FIN_WAIT_1 → FIN_WAIT_2 → TIME_WAIT → CLOSED
  Server: CLOSE_WAIT → LAST_ACK → CLOSED</span>
  
  <span style="color:var(--amber)">TIME_WAIT (2×MSL = ~60-120s):
  Ensures the final ACK is delivered. Prevents old duplicate
  segments from a closed connection being mistaken as new data.
  MSL = Maximum Segment Lifetime (typically 30-60 seconds)</span>
  
  <span style="color:var(--muted)">RST (Reset): Immediate close — no graceful teardown.
  Used for: refused connections, crashed processes, firewall resets.</span>`
    }
  ];
  
  function tcpStep(idx) {
    const demo = document.getElementById('tcp-demo');
    if (!demo) return;
    const s = tcpSteps[idx];
    if (!s) return;
    demo.innerHTML = `<div style="color:var(--pink);margin-bottom:8px;font-weight:700">▶ ${s.label}</div>${s.text}`;
    const btns = document.querySelectorAll('#ccna-topic-4 .osi-step-btn');
    btns.forEach((b, i) => b.classList.toggle('active', i === idx));
  }
  
  
  // ══════════════════════════════════════════
  
  // ══════════════════════════════════════════════════════════
  // ═══════════════════════════════════════════════════════════
  // BGP PATH SELECTOR  v3
  // ═══════════════════════════════════════════════════════════
  var BGP_N = 2;
  var BGP_COLORS  = ['#3b82f6','#f59e0b','#22c55e','#e879f9'];
  var BGP_BG      = ['rgba(59,130,246,0.12)','rgba(245,158,11,0.12)','rgba(34,197,94,0.12)','rgba(232,121,249,0.12)'];
  var BGP_LETTERS = ['A','B','C','D'];
  
  var BGP_ATTRS = [
    {id:'wt',  name:'Weight',       sym:'①', higher:true,  max:65535,   tip:'<b>Cisco-only. Local router only — never advertised anywhere.</b> Highest wins. Set via: <code>neighbor x weight 200</code> or route-map. Use to prefer a path on THIS router without affecting the rest of the AS.',                                                            ios:function(v,n){ var l=[]; for(var i=0;i<n;i++) if(v[i][0]!==100) l.push('neighbor 192.0.2.'+(i+1)+' weight '+v[i][0]); return l.length?l:['! Weight is 100 (default) for all paths']; }},
    {id:'lp',  name:'Local Pref',   sym:'②', higher:true,  max:65535,   tip:'<b>Shared within the entire AS via iBGP.</b> Highest wins. Default = 100. Set on eBGP ingress. Allows ALL routers in your AS to consistently use the same exit. <code>route-map SET-LP ; set local-preference 200</code>',                                                       ios:function(v,n){ var l=['route-map SET-LP permit 10']; for(var i=0;i<n;i++) if(v[i][1]!==100) l.push(' set local-preference '+v[i][1]); l.push('neighbor 192.0.2.1 route-map SET-LP in'); return l; }},
    {id:'lo',  name:'Locally Orig', sym:'③', higher:true,  max:1,       tip:'Routes originated locally (network/redistribute) beat iBGP-learned routes. Values: 1 = originated here, 0 = received via iBGP.',                                                                                                                                                  ios:function(){ return ['network 10.0.0.0 mask 255.0.0.0  ! locally originated = 1']; }},
    {id:'ap',  name:'AS-PATH len',  sym:'④', higher:false, max:20,      tip:'<b>Shorter AS-PATH wins.</b> Each time a route crosses an AS boundary, that AS number is prepended. Manipulate with: <code>set as-path prepend 65001 65001</code> to artificially lengthen — used to influence INBOUND traffic from neighboring ASes.',                              ios:function(v,n){ var l=[]; for(var i=0;i<n;i++) if(v[i][3]>0) l.push('route-map PREPEND-'+'ABCD'[i]+' permit 10\n set as-path prepend '+Array(v[i][3]).fill(65001).join(' ')); return l.length?l:['! No prepend configured']; }},
    {id:'or',  name:'Origin',       sym:'⑤', higher:false, max:2,       tip:'<b>IGP (0) &gt; EGP (1) &gt; Incomplete/? (2).</b> IGP = learned via <code>network</code> command. Incomplete = redistributed into BGP. EGP is historical and rarely used. Set: <code>set origin igp</code> in route-map.',                                                       ios:function(){ return ['route-map FIX-ORIGIN permit 10',' set origin igp  ! 0=IGP, 2=incomplete']; }},
    {id:'md',  name:'MED',          sym:'⑥', higher:false, max:65535,   tip:'<b>Lowest wins. Only compared between paths from the same neighboring AS.</b> Use MED to tell a neighbor AS which of YOUR links they should use for inbound traffic. <code>route-map SET-MED ; set metric 50</code> applied outbound. Enable cross-AS: <code>bgp always-compare-med</code>', ios:function(v,n){ var l=['route-map SET-MED permit 10',' set metric '+v[0][5],'neighbor 192.0.2.1 route-map SET-MED out']; return l; }},
    {id:'sr',  name:'eBGP>iBGP',    sym:'⑦', higher:false, max:1,       tip:'eBGP (0) is preferred over iBGP (1). External routes are considered more specific and reliable. Cannot be manually manipulated — reflects the actual peer type.',                                                                                                                    ios:function(){ return ['! Reflects peering type only — cannot be changed directly']; }},
    {id:'ig',  name:'IGP metric',   sym:'⑧', higher:false, max:65535,   tip:'<b>Lowest IGP cost to reach the BGP next-hop wins.</b> Tune with interface cost: <code>ip ospf cost 5</code>. This determines which ASBR the local router uses to exit the AS when multiple equal BGP paths exist.',                                                               ios:function(){ return ['interface GigabitEthernet0/0',' ip ospf cost 5  ! lowers IGP metric to this NH']; }},
    {id:'ri',  name:'Router ID',    sym:'⑩', higher:false, max:99,      tip:'<b>Lowest BGP Router ID wins.</b> Last real tiebreaker (before neighbor IP). Rarely deciding in production. Set: <code>bgp router-id 1.1.1.1</code>. Better to control earlier attributes.',                                                                                      ios:function(){ return ['bgp router-id 1.1.1.1  ! set explicitly']; }}
  ];
  
  // Default values [A,B,C,D] for each attr
  var BGP_DEFAULTS = [
    [100,100,100,100], // weight
    [100,100,100,100], // lp
    [0,0,0,0],         // locally orig
    [2,3,2,3],         // aspath
    [0,0,0,0],         // origin
    [50,100,50,50],    // MED
    [0,0,0,0],         // src
    [10,20,10,20],     // igp
    [1,2,3,4]          // rid
  ];
  
  var bgpDeepIdx = -1;
  
  function bgpSetPaths(n, btn) {
    BGP_N = n;
    document.querySelectorAll('.tool-pill[id^="bgp-m"]').forEach(function(b){ b.classList.remove('active'); });
    btn.classList.add('active');
    bgpBuild();
  }
  
  function bgpBuild() {
    var colW = Math.floor(100 / (BGP_N + 1));
    // Header
    var hdr = '<div style="display:grid;grid-template-columns:' + colW + '% repeat(' + BGP_N + ',1fr);gap:8px;align-items:center">';
    hdr += '<div style="font-family:var(--mono);font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:1px">Attribute</div>';
    for (var i = 0; i < BGP_N; i++) {
      hdr += '<div style="text-align:center;font-family:var(--mono);font-size:12px;font-weight:700;color:' + BGP_COLORS[i] + ';padding:4px 0">Path ' + BGP_LETTERS[i] + '</div>';
    }
    hdr += '</div>';
    document.getElementById('bgp-col-hdr').innerHTML = hdr;
  
    // Rows
    var rows = '';
    BGP_ATTRS.forEach(function(attr, ai) {
      var cols = 'grid-template-columns:' + colW + '% repeat(' + BGP_N + ',1fr)';
      rows += '<div class="bgp-attr-row" style="display:grid;' + cols + ';gap:8px">';
      rows += '<div style="font-family:var(--mono);font-size:11px;color:var(--text)">' + attr.sym + ' ' + attr.name + '</div>';
      for (var i = 0; i < BGP_N; i++) {
        var def = BGP_DEFAULTS[ai] ? BGP_DEFAULTS[ai][i] : 0;
        rows += '<input type="number" class="bgp-inp" id="bgpi-' + ai + '-' + i + '" value="' + def + '" min="0" max="' + attr.max + '" oninput="bgpCalcAll()" style="border-color:' + BGP_COLORS[i] + '33">';
      }
      rows += '</div>';
    });
    document.getElementById('bgp-attr-body').innerHTML = rows;
    bgpDeepIdx = -1;
    document.getElementById('bgp-deep').style.display = 'none';
    bgpCalcAll();
  }
  
  function bgpGetVals() {
    var vals = [];
    for (var i = 0; i < BGP_N; i++) {
      var row = [];
      BGP_ATTRS.forEach(function(_, ai) {
        var el = document.getElementById('bgpi-' + ai + '-' + i);
        row.push(el ? (parseFloat(el.value) || 0) : 0);
      });
      vals.push(row);
    }
    return vals;
  }
  
  function bgpCalcAll() {
    var vals = bgpGetVals();
    var live = vals.map(function(_, i){ return i; });
    var steps = [];
    BGP_ATTRS.forEach(function(attr, ai) {
      if (live.length <= 1) { steps.push({attr:attr, ai:ai, status:'skip', live:live.slice(), vals:vals}); return; }
      var cur = live.map(function(ri){ return vals[ri][ai]; });
      var best = attr.higher ? Math.max.apply(null,cur) : Math.min.apply(null,cur);
      var winners = live.filter(function(ri){ return vals[ri][ai] === best; });
      var tie = winners.length === live.length;
      steps.push({attr:attr, ai:ai, status: tie ? 'tie' : 'decided', live:live.slice(), winners:winners, vals:vals});
      if (!tie) live = winners;
    });
    var allTie = live.length === vals.length;
    var winnerIdx = live[0];
  
    // ── DECISION RESULT panel ──
    var drPanel = document.getElementById('bgp-decision-result');
    var winColor = BGP_COLORS[winnerIdx] || '#22c55e';
    var deciding = steps.find(function(s){ return s.status === 'decided'; });
    drPanel.style.background = allTie ? 'rgba(34,197,94,0.07)' : BGP_BG[winnerIdx] || BGP_BG[0];
    drPanel.style.borderColor = allTie ? 'rgba(34,197,94,0.4)' : (winColor + '55');
  
    document.getElementById('bgp-winner-name').textContent = allTie ? 'ECMP' : 'Path ' + BGP_LETTERS[winnerIdx];
    document.getElementById('bgp-winner-name').style.color = allTie ? '#22c55e' : winColor;
  
    var reasonHtml = '';
    if (allTie) {
      reasonHtml = '<span style="color:#22c55e;font-weight:700">All paths equal</span><br>All ' + BGP_N + ' paths are eligible for ECMP. Use <code>bgp maximum-paths ' + BGP_N + '</code> to enable load balancing.';
    } else if (deciding) {
      reasonHtml = '<span style="color:' + winColor + ';font-weight:700">Winner: Path ' + BGP_LETTERS[winnerIdx] + '</span><br>';
      reasonHtml += 'Decided at <b>step ' + (steps.indexOf(deciding)+1) + '</b> — ' + deciding.attr.sym + ' ' + deciding.attr.name + '<br>';
      reasonHtml += '<span style="color:var(--muted)">Steps ' + (steps.indexOf(deciding)+2) + '–' + steps.length + ' skipped (not needed)</span>';
    }
    document.getElementById('bgp-winner-reason').innerHTML = reasonHtml;
  
    // Path chips
    var chips = '';
    for (var i = 0; i < BGP_N; i++) {
      var isW = !allTie && live.indexOf(i) !== -1;
      chips += '<div class="bgp-pchip" style="background:' + BGP_BG[i] + ';border-color:' + BGP_COLORS[i] + (isW?'99':'33') + ';color:' + BGP_COLORS[i] + (isW?';border-width:2px':'') + ';opacity:' + (isW?'1':'0.45') + '">';
      chips += (isW ? '✓ ' : '✗ ') + 'Path ' + BGP_LETTERS[i] + '</div>';
    }
    document.getElementById('bgp-winner-chips').innerHTML = chips;
  
    // Per-path summary cards
    var summaryHtml = 'grid-template-columns:repeat(' + BGP_N + ',1fr)';
    document.getElementById('bgp-path-summary').style.gridTemplateColumns = 'repeat(' + BGP_N + ',1fr)';
    var summaryCards = '';
    for (var i = 0; i < BGP_N; i++) {
      var isW = !allTie && live.indexOf(i) !== -1;
      summaryCards += '<div style="border-radius:10px;padding:12px 14px;border:2px solid ' + BGP_COLORS[i] + (isW?'88':'33') + ';background:' + BGP_BG[i] + ';opacity:' + (isW?'1':'0.6') + '">';
      summaryCards += '<div style="font-family:var(--mono);font-weight:800;font-size:13px;color:' + BGP_COLORS[i] + ';margin-bottom:8px">Path ' + BGP_LETTERS[i] + (isW?' ✓':'') + '</div>';
      BGP_ATTRS.forEach(function(attr, ai) {
        var v = vals[i][ai];
        summaryCards += '<div style="display:flex;justify-content:space-between;font-family:var(--mono);font-size:10px;padding:2px 0;border-bottom:1px solid ' + BGP_COLORS[i] + '22"><span style="color:var(--muted2)">' + attr.sym + ' ' + attr.name + '</span><span style="color:' + BGP_COLORS[i] + ';font-weight:700">' + v + '</span></div>';
      });
      summaryCards += '</div>';
    }
    document.getElementById('bgp-path-summary').innerHTML = summaryCards;
  
    // Step rows — detailed decision walkthrough
    var stepsHtml = '';
    var foundDecision = false;
    steps.forEach(function(s, si) {
      var isDecided = s.status === 'decided';
      var isTie     = s.status === 'tie';
      var isSkip    = s.status === 'skip';
      if (isSkip) return; // hide skipped (already decided)
      if (foundDecision) return; // stop after first winner
  
      // Build per-path values string
      var pathVals = s.live.map(function(ri) {
        return '<span style="color:' + BGP_COLORS[ri] + ';font-weight:700">' + BGP_LETTERS[ri] + '=' + s.vals[ri][s.ai] + '</span>';
      }).join('<span style="color:var(--muted2)">  </span>');
  
      // Outcome badge
      var outcome, outcomeCol;
      if (isTie) {
        outcome = '⬌ TIE — proceed to next step';
        outcomeCol = 'var(--muted2)';
      } else {
        var wLetter = BGP_LETTERS[s.winners[0]];
        var wCol    = BGP_COLORS[s.winners[0]];
        outcome = '▶ PATH ' + wLetter + ' WINS';
        outcomeCol = wCol;
        foundDecision = true;
      }
  
      // Explanation text — strip HTML tags from tip for plain text
      var explanation = s.attr.tip.replace(/<[^>]+>/g, '').replace(/&gt;/g,'>').replace(/&lt;/g,'<').replace(/&amp;/g,'&');
  
      stepsHtml += '<div class="bgp-step-row' + (isDecided?' decided':'') + '" onclick="bgpDeep(' + si + ',' + JSON.stringify(s.ai) + ')" style="flex-direction:column;align-items:stretch;padding:12px 14px;gap:0">';
  
      // Top row: step number + name + per-path values + outcome
      stepsHtml += '<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">';
      stepsHtml += '<span style="font-family:var(--mono);font-size:13px;font-weight:700;color:var(--text)">' + s.attr.sym + ' ' + s.attr.name + '</span>';
      stepsHtml += '<span style="font-family:var(--mono);font-size:12px">' + pathVals + '</span>';
      stepsHtml += '<span style="font-family:var(--mono);font-size:11px;font-weight:700;color:' + outcomeCol + ';margin-left:auto;white-space:nowrap">→ ' + outcome + '</span>';
      stepsHtml += '</div>';
  
      // Explanation text below
      stepsHtml += '<div style="font-family:var(--mono);font-size:10px;color:var(--muted2);line-height:1.7;margin-top:7px;padding-top:7px;border-top:1px solid var(--border)">' + explanation + '</div>';
      stepsHtml += '</div>';
    });
  
    // Trophy banner at the bottom
    if (!allTie) {
      stepsHtml += '<div style="margin-top:10px;background:' + (BGP_BG[winnerIdx]||'rgba(34,197,94,0.1)') + ';border:2px solid ' + (BGP_COLORS[winnerIdx]||'#22c55e') + '55;border-radius:12px;padding:14px 18px;display:flex;align-items:center;gap:14px">';
      stepsHtml += '<span style="font-size:26px">🏆</span>';
      stepsHtml += '<div>';
      stepsHtml += '<div style="font-family:var(--mono);font-size:13px;font-weight:900;color:' + (BGP_COLORS[winnerIdx]||'#22c55e') + '">BEST PATH: PATH ' + BGP_LETTERS[winnerIdx] + '</div>';
      if (deciding) {
        var stepNum = steps.indexOf(deciding)+1;
        stepsHtml += '<div style="font-family:var(--mono);font-size:10px;color:var(--muted2);margin-top:3px">Decision made at step ' + stepNum + ' (' + deciding.attr.sym + ' ' + deciding.attr.name + '). Steps ' + (stepNum+1) + '–' + steps.length + ' not evaluated.</div>';
      }
      stepsHtml += '</div></div>';
    } else {
      stepsHtml += '<div style="margin-top:10px;background:rgba(34,197,94,0.08);border:2px solid rgba(34,197,94,0.35);border-radius:12px;padding:14px 18px;display:flex;align-items:center;gap:14px">';
      stepsHtml += '<span style="font-size:22px">⬌</span>';
      stepsHtml += '<div style="font-family:var(--mono);font-size:12px;font-weight:700;color:#22c55e">ECMP — All ' + BGP_N + ' paths are equal<br><span style="font-weight:400;font-size:10px;color:var(--muted2)">Use bgp maximum-paths ' + BGP_N + ' to enable load balancing.</span></div>';
      stepsHtml += '</div>';
    }
  
    document.getElementById('bgp-step-list').innerHTML = stepsHtml;
  
    // Bars
    bgpBars(vals);
    bgpIOS(vals, steps);
  }
  
  function bgpDeep(si, ai) {
    var panel = document.getElementById('bgp-deep');
    if (bgpDeepIdx === si) { panel.style.display = 'none'; bgpDeepIdx = -1; return; }
    bgpDeepIdx = si;
    var attr = BGP_ATTRS[ai];
    var vals = bgpGetVals();
    var iosLines = attr.ios ? attr.ios(vals, BGP_N) : [];
    panel.style.display = 'block';
    panel.innerHTML = '<div style="color:var(--blue);font-weight:700;font-size:13px;margin-bottom:8px">' + attr.sym + ' ' + attr.name + ' — deep dive</div>' +
      '<div style="color:var(--text);line-height:1.9;margin-bottom:10px">' + attr.tip + '</div>' +
      '<div style="font-family:var(--mono);font-size:10px;text-transform:uppercase;letter-spacing:1px;color:var(--muted);margin-bottom:6px">Cisco IOS commands for this attribute</div>' +
      '<div class="bgp-ios-box">' + iosLines.join('\n') + '</div>';
  }
  
  function bgpBars(vals) {
    var html = '';
    BGP_ATTRS.forEach(function(attr, ai) {
      var pathVals = [];
      for (var i = 0; i < BGP_N; i++) pathVals.push(vals[i][ai]);
      var maxVal = Math.max.apply(null, pathVals.concat([1]));
      html += '<div class="bgp-bar-group">';
      html += '<div class="bgp-bar-label-row"><span>' + attr.sym + ' ' + attr.name + '</span><div style="display:flex;gap:12px">';
      for (var i = 0; i < BGP_N; i++) {
        html += '<span style="color:' + BGP_COLORS[i] + '">' + BGP_LETTERS[i] + ':' + pathVals[i] + '</span>';
      }
      html += '</div></div><div class="bgp-bar-track">';
      for (var i = 0; i < BGP_N; i++) {
        var pct = maxVal > 0 ? Math.round(pathVals[i] / maxVal * 100) : 0;
        html += '<div class="bgp-bar-seg" style="width:' + pct + '%;background:' + BGP_COLORS[i] + ';flex:none"></div>';
      }
      html += '</div></div>';
    });
    document.getElementById('bgp-bars').innerHTML = html;
  }
  
  function bgpIOS(vals, steps) {
    var decided = steps.find(function(s){ return s.status === 'decided'; });
    if (!decided) { document.getElementById('bgp-ios').textContent = '! All paths equal — consider bgp maximum-paths ' + BGP_N; return; }
    var ai = decided.ai; var attr = BGP_ATTRS[ai];
    var lines = attr.ios ? attr.ios(vals, BGP_N) : [];
    document.getElementById('bgp-ios').textContent = lines.join('\n');
  }
  
  function bgpPreset(name) {
    if (!name) return;
    var presets = {
      lp:     { defaults: [[100,200,0,2,0,50,0,10,1],[100,100,0,2,0,50,0,10,2],[100,100,0,2,0,50,0,10,3],[100,100,0,2,0,50,0,10,4]] },
      aspath: { defaults: [[100,100,0,2,0,50,0,10,1],[100,100,0,4,0,50,0,10,2],[100,100,0,6,0,50,0,10,3],[100,100,0,3,0,50,0,10,4]] },
      med:    { defaults: [[100,100,0,2,0,30,0,10,1],[100,100,0,2,0,90,0,10,2],[100,100,0,2,0,60,0,10,3],[100,100,0,2,0,20,0,10,4]] },
      ibgp:   { defaults: [[100,100,0,2,0,50,0,10,1],[100,100,0,2,0,50,1,10,2],[100,100,0,2,0,50,0,10,3],[100,100,0,2,0,50,1,10,4]] },
      ecmp:   { defaults: [[100,100,0,2,0,50,0,10,1],[100,100,0,2,0,50,0,10,1],[100,100,0,2,0,50,0,10,1],[100,100,0,2,0,50,0,10,1]] },
      weight: { defaults: [[200,100,0,2,0,50,0,10,1],[100,200,0,2,0,50,0,10,2],[150,100,0,2,0,50,0,10,3],[100,100,0,2,0,50,0,10,4]] }
    };
    var p = presets[name];
    if (!p) return;
    for (var i = 0; i < BGP_N; i++) {
      BGP_ATTRS.forEach(function(_, ai) {
        var el = document.getElementById('bgpi-' + ai + '-' + i);
        if (el && p.defaults[i]) el.value = p.defaults[i][ai] || 0;
      });
    }
    bgpCalcAll();
  }
  
  // Init
  bgpBuild();
  
  
  // ═══════════════════════════════════════════════════════════
  // PROTOCOL SIMULATOR  v3
  // ═══════════════════════════════════════════════════════════
  var SPR = {
    proto: 'ospf',
    state: '',
    scenario: [],
    scenIdx: -1,
    playing: false,
    playTimer: null,
    speed: 900,
    log: []
  };
  
  var SPR_PROTOS = {
    ospf: {
      name:'OSPF Neighbor',
      context:'OSPFv2 forms adjacencies through a 7-state machine. Runs over IP (proto 89). DR/BDR election happens in 2WAY — DROther pairs stop here.',
      init:'DOWN',
      states:{
        DOWN:     {color:'#ef4444',bg:'rgba(239,68,68,0.13)',  desc:'No Hello packets received. Starting point.'},
        INIT:     {color:'#f97316',bg:'rgba(249,115,22,0.13)', desc:'Hello received — but our Router ID is not yet in their Hello. One-way.'},
        '2WAY':   {color:'#eab308',bg:'rgba(234,179,8,0.13)',  desc:'Bidirectional confirmed. DR/BDR elected here. DROther pairs stop at 2WAY.'},
        EXSTART:  {color:'#3b82f6',bg:'rgba(59,130,246,0.13)', desc:'Master/Slave DBD negotiation. Highest Router ID = Master.'},
        EXCHANGE: {color:'#6366f1',bg:'rgba(99,102,241,0.13)', desc:'Exchanging Database Description (DBD) packets — LSA header summaries.'},
        LOADING:  {color:'#8b5cf6',bg:'rgba(139,92,246,0.13)', desc:'Sending LSR (Link State Request). Waiting for LSU replies to fill gaps.'},
        FULL:     {color:'#22c55e',bg:'rgba(34,197,94,0.13)',  desc:'LSDB fully synchronized. Adjacency complete. SPF runs now.'}
      },
      layout:{DOWN:{x:300,y:28},INIT:{x:130,y:90},'2WAY':{x:470,y:90},EXSTART:{x:130,y:175},EXCHANGE:{x:470,y:175},LOADING:{x:300,y:245},FULL:{x:300,y:265}},
      edges:[
        {f:'DOWN',    t:'INIT',     lb:'Hello rcvd',       c:'#22c55e'},
        {f:'INIT',    t:'2WAY',     lb:'Own RID seen',     c:'#22c55e'},
        {f:'2WAY',    t:'EXSTART',  lb:'Need adjacency',   c:'#3b82f6'},
        {f:'EXSTART', t:'EXCHANGE', lb:'Master/Slave done',c:'#3b82f6'},
        {f:'EXCHANGE',t:'LOADING',  lb:'DBD done',         c:'#6366f1'},
        {f:'LOADING', t:'FULL',     lb:'All LSAs recvd',   c:'#22c55e'},
        {f:'FULL',    t:'DOWN',     lb:'Dead timer',       c:'#ef4444', dash:true},
        {f:'INIT',    t:'DOWN',     lb:'Dead timer',       c:'#ef4444', dash:true},
        {f:'EXSTART', t:'DOWN',     lb:'MTU error',        c:'#f97316', dash:true}
      ],
      trans:{
        DOWN:     {hello:'INIT'},
        INIT:     {bidir:'2WAY', dead:'DOWN'},
        '2WAY':   {adj:'EXSTART', dead:'DOWN'},
        EXSTART:  {dbd:'EXCHANGE', mtu:'DOWN', dead:'DOWN'},
        EXCHANGE: {lsreq:'LOADING', dead:'DOWN'},
        LOADING:  {sync:'FULL', dead:'DOWN'},
        FULL:     {dead:'DOWN', hello:'FULL'}
      },
      events:[
        {id:'hello', icon:'📨', label:'Hello Received',   sub:'OSPF Hello with Hello/Dead intervals', err:false},
        {id:'bidir', icon:'👁', label:'Bidirectional',    sub:'Our Router ID appears in neighbor Hello', err:false},
        {id:'adj',   icon:'🔗', label:'Start Adjacency',  sub:'DR/BDR relationship or P2P link', err:false},
        {id:'dbd',   icon:'📋', label:'DBD Negotiated',   sub:'Master/Slave + first DBD exchanged', err:false},
        {id:'lsreq', icon:'📥', label:'LSRs Sent',        sub:'Requested missing LSAs from neighbor', err:false},
        {id:'sync',  icon:'✅', label:'LSDB Synchronized', sub:'All LSA requests satisfied', err:false},
        {id:'dead',  icon:'💀', label:'Dead Timer Fired', sub:'No Hello in dead-interval', err:true},
        {id:'mtu',   icon:'⚠', label:'MTU Mismatch',    sub:'DBD rejected — fix: ip ospf mtu-ignore', err:true}
      ],
      trouble:{
        DOWN:['ip ospf X area Y on interface?','Area IDs match both sides?','Hello/dead timers match?','Auth type and key match?','Check: ip ospf network type'],
        INIT:['One-way link? Check L1/L2','debug ip ospf hello — check for your RID in received Hellos','Multicast blocked? 224.0.0.5/6'],
        '2WAY':['DROther↔DROther is NORMAL — stays 2WAY','For full adjacency: one must be DR or BDR','ip ospf priority 0 to force non-DR'],
        EXSTART:['MTU mismatch most common! add ip ospf mtu-ignore','debug ip ospf adj — show DBD sequence','show ip ospf neighbor — EXSTART state'],
        EXCHANGE:['Check for retransmissions','Verify LSA checksum integrity','show ip ospf statistics'],
        LOADING:['Large LSDB? May take time','Check for duplicate Router-IDs in area','show ip ospf flood-list'],
        FULL:['Healthy ✓','Monitor: show ip ospf neighbor','Watch for flapping — check dead timer tuning','SPF: show ip ospf statistics']
      },
      cmds:{
        DOWN:['show ip ospf neighbor','show ip ospf interface','debug ip ospf hello'],
        INIT:['debug ip ospf hello','show ip ospf neighbor','show ip ospf interface brief'],
        '2WAY':['show ip ospf neighbor','show ip ospf interface','show ip ospf database'],
        EXSTART:['debug ip ospf adj','show ip ospf neighbor','show interfaces — check MTU'],
        EXCHANGE:['show ip ospf statistics','debug ip ospf adj','show ip ospf neighbor detail'],
        LOADING:['show ip ospf flood-list','show ip ospf database','debug ip ospf lsa-generation'],
        FULL:['show ip ospf neighbor','show ip ospf database summary','show ip route ospf']
      },
      packets:{
        hello:{name:'OSPF Hello',color:'#22c55e',fields:[{n:'OSPF Type',v:'1 (Hello)'},{n:'Router ID',v:'1.1.1.1'},{n:'Area ID',v:'0.0.0.0 (Area 0)'},{n:'Auth Type',v:'0 (None)'},{n:'Network Mask',v:'255.255.255.0'},{n:'Hello Interval',v:'10 seconds'},{n:'Dead Interval',v:'40 seconds'},{n:'Options',v:'E-bit set (external LSAs allowed)'},{n:'DR',v:'0.0.0.0 (not elected yet)'},{n:'BDR',v:'0.0.0.0'},{n:'Active Neighbors',v:'[ ] empty on first Hello → includes us after INIT'}]},
        dbd:{name:'OSPF DBD',color:'#3b82f6',fields:[{n:'OSPF Type',v:'2 (Database Description)'},{n:'Interface MTU',v:'1500 bytes  ← mismatch causes EXSTART stall'},{n:'Flags',v:'I=1 M=1 MS=1 (Init, More, Master claimed)'},{n:'DD Sequence',v:'12345 (Master sets initial seq number)'},{n:'LSA Headers',v:'Type-1 Router LSA, RID 1.1.1.1, seq 0x80000001'},{n:'Note',v:'Only headers sent — actual LSAs requested via LSR'}]},
        sync:{name:'LSR / LSU Exchange',color:'#8b5cf6',fields:[{n:'LSR Type',v:'3 (Link State Request)'},{n:'Requesting',v:'LS-Type 1, LSID 2.2.2.2, AdvRtr 2.2.2.2'},{n:'LSU Type',v:'4 (Link State Update)'},{n:'LSA count',v:'3 LSAs included'},{n:'LSA 1',v:'Type-1 Router LSA, 2.2.2.2'},{n:'LSA 2',v:'Type-2 Network LSA, 192.168.1.2'},{n:'LSA 3',v:'Type-3 Summary LSA, 10.0.0.0/8'},{n:'LSAck',v:'Type 5 (ACK) — confirms each LSU received'}]},
        dead:{name:'Dead Timer Expired',color:'#ef4444',fields:[{n:'Event',v:'No Hello for dead-interval (40s default)'},{n:'Effect',v:'Neighbor removed from neighbor table'},{n:'Routing',v:'All routes via this neighbor withdrawn immediately'},{n:'SPF',v:'Re-run triggered across the area'},{n:'Debug',v:'debug ip ospf hello — watch for gaps'}]},
        mtu:{name:'MTU Mismatch',color:'#f97316',fields:[{n:'Problem',v:'Our MTU=1500, neighbor MTU=9000 (jumbo frames)'},{n:'DBD',v:'Router rejects DBD with wrong MTU → EXSTART stalls'},{n:'Symptom',v:'show ip ospf neighbor → EXSTART/— for minutes'},{n:'Fix',v:'ip ospf mtu-ignore on one or both sides'},{n:'Verify',v:'show ip ospf interface — displays MTU value'}]}
      },
      scenarios:[
        {id:'normal',   label:'✓ Normal P2P adjacency',      steps:['hello','bidir','adj','dbd','lsreq','sync']},
        {id:'droother', label:'⬖ DROther stops at 2WAY',     steps:['hello','bidir']},
        {id:'mtu',      label:'✗ MTU mismatch failure',       steps:['hello','bidir','adj','mtu']},
        {id:'deadtimer',label:'✗ Neighbor dead — flap',      steps:['hello','bidir','adj','dbd','lsreq','sync','dead','hello','bidir']}
      ]
    },
  
    bgp: {
      name:'BGP Session',
      context:'BGP uses a 6-state FSM over TCP port 179. Pre-TCP: IDLE/CONNECT/ACTIVE. Negotiation: OPENSENT/OPENCONFIRM. Operational: ESTABLISHED.',
      init:'IDLE',
      states:{
        IDLE:        {color:'#ef4444',bg:'rgba(239,68,68,0.13)',  desc:'Not started. BGP backing off after error, or never started.'},
        CONNECT:     {color:'#f97316',bg:'rgba(249,115,22,0.13)', desc:'Attempting TCP connection to neighbor port 179.'},
        ACTIVE:      {color:'#eab308',bg:'rgba(234,179,8,0.13)',  desc:'TCP failed. BGP retrying connection aggressively.'},
        OPENSENT:    {color:'#3b82f6',bg:'rgba(59,130,246,0.13)', desc:'TCP up. OPEN message sent. Waiting for neighbor OPEN.'},
        OPENCONFIRM: {color:'#8b5cf6',bg:'rgba(139,92,246,0.13)', desc:'Both OPENs exchanged and validated. Awaiting KEEPALIVE.'},
        ESTABLISHED: {color:'#22c55e',bg:'rgba(34,197,94,0.13)',  desc:'Session operational. Exchanging UPDATES and KEEPALIVEs.'}
      },
      layout:{IDLE:{x:300,y:25},CONNECT:{x:120,y:110},ACTIVE:{x:480,y:110},OPENSENT:{x:120,y:210},OPENCONFIRM:{x:480,y:210},ESTABLISHED:{x:300,y:265}},
      edges:[
        {f:'IDLE',       t:'CONNECT',     lb:'BGP start',      c:'#22c55e'},
        {f:'CONNECT',    t:'OPENSENT',    lb:'TCP success',    c:'#22c55e'},
        {f:'CONNECT',    t:'ACTIVE',      lb:'TCP fail',       c:'#f97316'},
        {f:'ACTIVE',     t:'OPENSENT',    lb:'TCP retry OK',   c:'#22c55e'},
        {f:'ACTIVE',     t:'IDLE',        lb:'Retry timeout',  c:'#ef4444',dash:true},
        {f:'OPENSENT',   t:'OPENCONFIRM', lb:'OPEN received',  c:'#3b82f6'},
        {f:'OPENCONFIRM',t:'ESTABLISHED', lb:'KEEPALIVE',      c:'#22c55e'},
        {f:'OPENSENT',   t:'IDLE',        lb:'NOTIFICATION',   c:'#ef4444',dash:true},
        {f:'OPENCONFIRM',t:'IDLE',        lb:'NOTIFICATION',   c:'#ef4444',dash:true},
        {f:'ESTABLISHED',t:'IDLE',        lb:'Error/Hold exp', c:'#ef4444',dash:true}
      ],
      trans:{
        IDLE:        {start:'CONNECT'},
        CONNECT:     {'tcp-ok':'OPENSENT','tcp-fail':'ACTIVE'},
        ACTIVE:      {'tcp-ok':'OPENSENT','retry-fail':'IDLE'},
        OPENSENT:    {'open-rcvd':'OPENCONFIRM', notif:'IDLE', hold:'IDLE'},
        OPENCONFIRM: {ka:'ESTABLISHED', notif:'IDLE', hold:'IDLE'},
        ESTABLISHED: {notif:'IDLE', hold:'IDLE', update:'ESTABLISHED'}
      },
      events:[
        {id:'start',     icon:'▶', label:'BGP Start',         sub:'Process started / clear ip bgp issued',   err:false},
        {id:'tcp-ok',    icon:'🔌',label:'TCP Connected',      sub:'3-way handshake to port 179 succeeded',   err:false},
        {id:'open-rcvd', icon:'📬',label:'OPEN Received',      sub:'Peer BGP OPEN message validated OK',      err:false},
        {id:'ka',        icon:'💓',label:'KEEPALIVE Received', sub:'Session confirmed — routes will flow',    err:false},
        {id:'update',    icon:'📦',label:'UPDATE Received',    sub:'Route advertisements / withdrawals',      err:false},
        {id:'tcp-fail',  icon:'❌',label:'TCP Failed',         sub:'Connection refused or unreachable',       err:true},
        {id:'retry-fail',icon:'⏱',label:'Retry Timeout',      sub:'ConnectRetry exhausted',                  err:true},
        {id:'notif',     icon:'⚠',label:'NOTIFICATION',       sub:'BGP error — AS mismatch / auth fail / hold exp', err:true},
        {id:'hold',      icon:'⌛',label:'Hold Timer Expired', sub:'No KEEPALIVE/UPDATE in hold-time',        err:true}
      ],
      trouble:{
        IDLE:['BGP running? show bgp summary','neighbor X remote-as Y configured?','Check for admin shutdown: neighbor X shutdown','clear ip bgp * to restart'],
        CONNECT:['Can you ping neighbor? (check routing)','telnet neighbor-ip 179 — port reachable?','ACL blocking TCP 179?','update-source for loopback peering?','ebgp-multihop if not directly connected'],
        ACTIVE:['Neighbor not accepting TCP','Wrong source IP? ip bgp-community new-format; update-source','Firewall blocking port 179 inbound on neighbor','Check neighbor BGP config — do they have us?'],
        OPENSENT:['show bgp neighbors → check error in NOTIFICATION','AS number mismatch most common','MD5 authentication mismatch','Capability conflict — 4-byte AS?'],
        OPENCONFIRM:['Hold time too short (must be 0 or ≥3s)','Duplicate BGP Router ID in the AS!','MD5 password mismatch','debug ip bgp X events — see NOTIFICATION'],
        ESTABLISHED:['show bgp summary → Prefixes received?','show bgp neighbors X advertised-routes','Route not advertised? check network/redistribute','Filter? show ip bgp X regexp / show route-map']
      },
      cmds:{
        IDLE:['show bgp summary','show bgp neighbors x','debug ip bgp events'],
        CONNECT:['telnet neighbor 179','show ip route neighbor','show ip bgp summary'],
        ACTIVE:['debug ip bgp x events','show ip bgp summary','show interface — source IP?'],
        OPENSENT:['debug ip bgp x','show bgp neighbors x','show ip bgp summary'],
        OPENCONFIRM:['debug ip bgp x events','show bgp neighbors x','show log — NOTIFICATION reason'],
        ESTABLISHED:['show bgp summary','show bgp neighbors x advertised-routes','show bgp neighbors x received-routes','show ip route bgp']
      },
      packets:{
        start:{name:'BGP Start / TCP SYN',color:'#22c55e',fields:[{n:'Source',v:'update-source IP (or best local)'},{n:'Destination',v:'neighbor-ip:179'},{n:'TCP flags',v:'SYN → SYN-ACK ← ACK'},{n:'BGP OPEN immediately after',v:'Type=1, Ver=4, My-AS=65001'},{n:'Hold Time',v:'180s (negotiated — minimum wins)'},{n:'BGP Identifier',v:'1.1.1.1 (Router ID)'}]},
        'open-rcvd':{name:'BGP OPEN Message',color:'#3b82f6',fields:[{n:'Type',v:'1 (OPEN)'},{n:'Version',v:'4'},{n:'My AS',v:'65002 (peer AS)'},{n:'Hold Time',v:'180s (we use minimum of both)'},{n:'BGP Identifier',v:'2.2.2.2 (peer Router ID)'},{n:'Optional Params',v:'Cap: 4-byte-AS, Route-Refresh, ADD-PATH, GR'},{n:'Validation',v:'AS match? RID unique? Hold Time OK? Auth?'}]},
        ka:{name:'BGP KEEPALIVE',color:'#22c55e',fields:[{n:'Type',v:'4 (KEEPALIVE)'},{n:'Length',v:'19 bytes (header only)'},{n:'Meaning',v:'Confirms OPEN accepted → go ESTABLISHED'},{n:'Sent every',v:'keepalive-interval (default 60s)'},{n:'Hold timer reset',v:'Yes — every KEEPALIVE or UPDATE resets it'},{n:'Silence for hold-time',v:'→ NOTIFICATION Hold Timer Expired'}]},
        update:{name:'BGP UPDATE',color:'#6366f1',fields:[{n:'Type',v:'2 (UPDATE)'},{n:'Withdrawn Routes',v:'Length + prefixes being removed'},{n:'Path Attributes',v:'ORIGIN, AS_PATH, NEXT_HOP, LOCAL_PREF, MED...'},{n:'NLRI',v:'New prefixes being advertised'},{n:'Example',v:'NLRI: 10.0.0.0/8, NH: 192.0.2.1, LP: 200, AS_PATH: 65002'}]},
        notif:{name:'BGP NOTIFICATION (error)',color:'#ef4444',fields:[{n:'Type',v:'3 (NOTIFICATION) — kills session'},{n:'Error Code 1',v:'Message Header Error'},{n:'Error Code 2',v:'OPEN Message Error (sub 2 = Bad Peer AS)'},{n:'Error Code 3',v:'UPDATE Message Error'},{n:'Error Code 4',v:'Hold Timer Expired'},{n:'Error Code 6',v:'Cease (admin reset / max-prefix)'},{n:'Effect',v:'TCP closed → IDLE + exponential backoff (8→16→32→64→120s)'}]}
      },
      scenarios:[
        {id:'normal',    label:'✓ Normal BGP establishment',    steps:['start','tcp-ok','open-rcvd','ka']},
        {id:'tcp-retry', label:'✗ TCP fail → retry → success',  steps:['start','tcp-fail','tcp-ok','open-rcvd','ka']},
        {id:'notif',     label:'✗ NOTIFICATION — AS mismatch', steps:['start','tcp-ok','notif']},
        {id:'hold',      label:'✗ Hold timer expiry',           steps:['start','tcp-ok','open-rcvd','ka','hold']},
        {id:'updates',   label:'✓ Active session with updates', steps:['start','tcp-ok','open-rcvd','ka','update','update']}
      ]
    },
  
    isis: {
      name:'IS-IS Adjacency',
      context:'IS-IS runs directly on Layer 2 (not over IP). Simpler than OSPF — 3 states only. L1 neighbors must share area; L2 can cross areas.',
      init:'DOWN',
      states:{
        DOWN:{color:'#ef4444',bg:'rgba(239,68,68,0.13)', desc:'No IIH (IS-IS Hello) received from this neighbor.'},
        INIT:{color:'#eab308',bg:'rgba(234,179,8,0.13)',  desc:'IIH received. We are not yet in their neighbor list.'},
        UP:  {color:'#22c55e',bg:'rgba(34,197,94,0.13)',  desc:'Bidirectional adjacency confirmed. TLV 6 shows our MAC/SNPA.'}
      },
      layout:{DOWN:{x:300,y:50},INIT:{x:130,y:190},UP:{x:470,y:190}},
      edges:[
        {f:'DOWN',t:'INIT',lb:'IIH received',    c:'#22c55e'},
        {f:'INIT',t:'UP',  lb:'Seen in IIH',     c:'#22c55e'},
        {f:'UP',  t:'DOWN',lb:'Hold timer',      c:'#ef4444',dash:true},
        {f:'INIT',t:'DOWN',lb:'Hold / area err', c:'#ef4444',dash:true}
      ],
      trans:{
        DOWN:{iih:'INIT'},
        INIT:{bidir:'UP', hold:'DOWN', area:'DOWN'},
        UP:  {hold:'DOWN', iih:'UP'}
      },
      events:[
        {id:'iih',   icon:'📨',label:'IIH Received',      sub:'IS-IS Hello PDU with TLVs',             err:false},
        {id:'bidir', icon:'👁', label:'Seen in Neighbor TLV', sub:'Our SNPA/MAC in neighbor TLV 6',    err:false},
        {id:'hold',  icon:'⏱', label:'Hold Timer Expired', sub:'No IIH in hold-time (30s LAN)',        err:true},
        {id:'area',  icon:'⚠', label:'Area Mismatch',     sub:'L1 neighbors must share Area ID',       err:true}
      ],
      trouble:{
        DOWN:['IS-IS enabled: isis circuit-type level-2-only','NET configured: net 49.0001.0100.0000.0001.00','Interface not passive?','Auth mismatch?'],
        INIT:['One-way link?','show isis neighbors — INIT means we heard them','Area ID mismatch (L1 only)'],
        UP:['Healthy ✓','show isis neighbors','show isis database','show isis route']
      },
      cmds:{
        DOWN:['show isis neighbors','show isis interface','debug isis adj-packets'],
        INIT:['show isis neighbors','debug isis adj-packets','show clns neighbors'],
        UP:['show isis neighbors','show isis database','show ip route isis','show isis spf-log']
      },
      packets:{
        iih:{name:'IS-IS IIH (Hello PDU)',color:'#22c55e',fields:[{n:'PDU Type',v:'LAN L1/L2 IIH (type 15/16)'},{n:'System ID',v:'0100.0000.0001 (6 bytes, from loopback)'},{n:'Circuit Type',v:'L1L2 (both levels supported)'},{n:'Hold Time',v:'30s (3× hello interval on LAN)'},{n:'Priority',v:'64 — DIS election (highest wins, tie → highest MAC)'},{n:'TLV 1',v:'Area Addresses: [49.0001]'},{n:'TLV 6',v:'IS Neighbors: [MAC of sending interface] ← bidirectionality check'},{n:'TLV 129',v:'Protocols Supported: IPv4 (0xCC), IPv6 (0x8E)'},{n:'TLV 232',v:'IPv6 Interface Address: 2001:db8::1'}]},
        hold:{name:'Hold Timer Expired',color:'#ef4444',fields:[{n:'Event',v:'No IIH received for hold-time'},{n:'Action',v:'Adjacency removed from IS-IS LSDB'},{n:'LSP',v:'New LSP generated (neighbor removed)'},{n:'SPF',v:'Re-run across all routers in area'},{n:'Debug',v:'debug isis adj-packets'}]}
      },
      scenarios:[
        {id:'normal',   label:'✓ Normal adjacency',      steps:['iih','bidir']},
        {id:'area-fail',label:'✗ Area mismatch',          steps:['iih','area']},
        {id:'hold',     label:'✗ Hold timer expiry',      steps:['iih','bidir','hold','iih','bidir']}
      ]
    }
  };
  
  function sprSwitch(proto, btn) {
    document.querySelectorAll('.tool-pill[id^="spr-"]').forEach(function(b){ b.classList.remove('active'); });
    btn.classList.add('active');
    SPR.proto = proto;
    sprReset();
  }
  
  function sprReset() {
    var p = SPR_PROTOS[SPR.proto];
    SPR.state = p.init;
    SPR.scenario = [];
    SPR.scenIdx = -1;
    clearTimeout(SPR.playTimer);
    SPR.playing = false;
    SPR.log = [];
    document.getElementById('spr-play').innerHTML = '&#9654;';
    document.getElementById('spr-timeline').innerHTML = '<div style="font-family:var(--mono);font-size:11px;color:var(--muted)">Load a scenario or fire events manually</div>';
    document.getElementById('spr-progress').textContent = '0/0';
    document.getElementById('spr-log').innerHTML = '';
    document.getElementById('spr-pkt-content').textContent = 'Fire an event to see packet fields.';
    // Update scenarios dropdown
    var sel = document.getElementById('spr-scen-sel');
    sel.innerHTML = '<option value="">Scenario…</option>';
    p.scenarios.forEach(function(s){ sel.innerHTML += '<option value="'+s.id+'">'+s.label+'</option>'; });
    sprRenderAll();
  }
  
  function sprLoadScenario(id) {
    var p = SPR_PROTOS[SPR.proto];
    var s = p.scenarios.find(function(x){ return x.id === id; });
    if (!s) return;
    clearTimeout(SPR.playTimer);
    SPR.playing = false;
    document.getElementById('spr-play').innerHTML = '&#9654;';
    // Reset state
    SPR.state = p.init;
    SPR.log = [];
    SPR.scenario = s.steps.slice();
    SPR.scenIdx = -1;
    sprBuildTimeline();
    sprRenderAll();
    document.getElementById('spr-scen-sel').value = '';
  }
  
  function sprBuildTimeline() {
    var p = SPR_PROTOS[SPR.proto];
    var html = '';
    SPR.scenario.forEach(function(evtId, i) {
      var evt = p.events.find(function(e){ return e.id === evtId; });
      var past   = i < SPR.scenIdx;
      var active = i === SPR.scenIdx;
      var dotCls = active ? 'sim-tl-dot active' : past ? 'sim-tl-dot past' : (evt && evt.err ? 'sim-tl-dot error' : 'sim-tl-dot');
      html += '<div class="sim-tl-step" onclick="sprJumpTo('+i+')">';
      html += '<div class="'+dotCls+'">'+(evt ? evt.icon : '?')+'</div>';
      html += '<div class="sim-tl-lbl">'+(evt ? evt.label.substring(0,10) : evtId)+'</div>';
      html += '</div>';
    });
    document.getElementById('spr-timeline').innerHTML = html || '<div style="font-family:var(--mono);font-size:11px;color:var(--muted)">No scenario loaded</div>';
    document.getElementById('spr-progress').textContent = Math.max(0,SPR.scenIdx+1) + '/' + SPR.scenario.length;
  }
  
  function sprJumpTo(idx, fromPlay) {
    var p = SPR_PROTOS[SPR.proto];
    if (!fromPlay) {
      clearTimeout(SPR.playTimer);
      SPR.playing = false;
      document.getElementById('spr-play').innerHTML = '&#9654;';
    }
    // Replay from start to idx
    SPR.state = p.init;
    SPR.log = [];
    for (var i = 0; i <= idx; i++) {
      var evtId = SPR.scenario[i];
      var trans = p.trans[SPR.state];
      if (trans && trans[evtId]) {
        var prev = SPR.state;
        SPR.state = trans[evtId];
        SPR.log.unshift({t: new Date().toLocaleTimeString(), from: prev, evt: evtId, to: SPR.state});
      }
    }
    SPR.scenIdx = idx;
    sprShowPacket(SPR.scenario[idx]);
    sprRenderAll();
  }
  
  function sprStep(dir) {
    var targetIdx = SPR.scenIdx + dir;
    if (SPR.scenario.length === 0) {
      // Manual step — fire next available valid event
      return;
    }
    if (targetIdx < 0 || targetIdx >= SPR.scenario.length) return;
    sprJumpTo(targetIdx);
  }
  
  function sprTogglePlay() {
    if (SPR.scenario.length === 0) return;
    // If at end, restart from beginning
    if (!SPR.playing && SPR.scenIdx >= SPR.scenario.length - 1) {
      SPR.scenIdx = -1;
      var p = SPR_PROTOS[SPR.proto];
      SPR.state = p.init;
      SPR.log = [];
      sprRenderAll();
    }
    SPR.playing = !SPR.playing;
    document.getElementById('spr-play').innerHTML = SPR.playing ? '&#9646;&#9646;' : '&#9654;';
    if (SPR.playing) sprPlayNext();
  }
  
  function sprPlayNext() {
    if (!SPR.playing) return;
    var nextIdx = SPR.scenIdx + 1;
    if (nextIdx >= SPR.scenario.length) {
      SPR.playing = false;
      document.getElementById('spr-play').innerHTML = '&#9654;';
      return;
    }
    sprJumpTo(nextIdx, true);
    SPR.playTimer = setTimeout(sprPlayNext, SPR.speed);
  }
  
  function sprUpdateSpeed() {
    var v = parseInt(document.getElementById('spr-speed').value);
    SPR.speed = v;
    document.getElementById('spr-speed-lbl').textContent = (v/1000).toFixed(1)+'s';
  }
  
  function sprFireManual(evtId) {
    var p = SPR_PROTOS[SPR.proto];
    var trans = p.trans[SPR.state];
    var time = new Date().toLocaleTimeString();
    if (!trans || !trans[evtId]) {
      SPR.log.unshift({t:time, from:SPR.state, evt:evtId, to:null});
    } else {
      var prev = SPR.state;
      SPR.state = trans[evtId];
      SPR.log.unshift({t:time, from:prev, evt:evtId, to:SPR.state});
      sprShowPacket(evtId);
    }
    sprRenderAll();
  }
  
  function sprShowPacket(evtId) {
    var p = SPR_PROTOS[SPR.proto];
    var pkt = p.packets ? p.packets[evtId] : null;
    if (!pkt) {
      document.getElementById('spr-pkt-content').textContent = 'No packet data for this event.';
      return;
    }
    var html = '<div style="color:'+pkt.color+';font-weight:700;font-size:13px;margin-bottom:10px">'+pkt.name+'</div>';
    pkt.fields.forEach(function(f){
      html += '<div class="sim-pkt-field"><span class="sim-pkt-key">'+f.n+'</span><span class="sim-pkt-val">'+f.v+'</span></div>';
    });
    document.getElementById('spr-pkt-content').innerHTML = html;
  }
  
  function sprRenderAll() {
    var p = SPR_PROTOS[SPR.proto];
    var state = SPR.state || p.init;
    var si = p.states[state] || {};
  
    // State badge
    var badge = document.getElementById('spr-state-badge');
    badge.textContent = state;
    badge.style.color = si.color || 'var(--text)';
    badge.style.background = si.bg || 'var(--bg3)';
    badge.style.borderColor = (si.color || 'transparent') + '55';
    document.getElementById('spr-state-desc').textContent = si.desc || '';
  
    // Timeline
    sprBuildTimeline();
  
    // Event buttons
    var trans = p.trans[state] || {};
    var evHtml = '';
    p.events.forEach(function(evt) {
      var valid = !!trans[evt.id];
      evHtml += '<button class="sim-ev-btn'+(evt.err?' ev-error':'')+'"'+((!valid)?' disabled':'')+' onclick="sprFireManual(\''+evt.id+'\')">';
      evHtml += '<span style="font-size:14px">'+evt.icon+'</span>';
      evHtml += '<div style="flex:1"><div style="font-weight:600">'+evt.label+'</div><div style="font-size:9px;color:var(--muted);margin-top:1px">'+evt.sub+'</div></div>';
      evHtml += '</button>';
    });
    document.getElementById('spr-evt-btns').innerHTML = evHtml;
  
    // Trouble
    var tr = p.trouble ? (p.trouble[state] || []) : [];
    document.getElementById('spr-trouble').innerHTML = tr.map(function(t){ return '<div style="padding:2px 0;border-bottom:1px solid var(--border)">• '+t+'</div>'; }).join('') || '—';
  
    // Commands
    var cmds = p.cmds ? (p.cmds[state] || []) : [];
    document.getElementById('spr-cmds').innerHTML = cmds.map(function(c){ return '<div>'+c+'</div>'; }).join('') || '—';
  
    // Log
    var logHtml = SPR.log.slice(0,30).map(function(entry){
      if (!entry.to) return '<div class="sim-log-entry"><span style="color:var(--muted2)">'+entry.t+'</span> <span style="color:var(--red)">✗ '+entry.evt+' invalid in '+entry.from+'</span></div>';
      return '<div class="sim-log-entry"><span style="color:var(--muted2)">'+entry.t+'</span> <span style="color:var(--amber)">'+entry.from+'</span> <span style="color:var(--muted)">→['+entry.evt+']→</span> <span style="color:var(--green)">'+entry.to+'</span></div>';
    }).join('');
    document.getElementById('spr-log').innerHTML = logHtml || '<div style="font-family:var(--mono);font-size:11px;color:var(--muted)">No events yet</div>';
  
    // SVG diagram
    sprDrawSVG(p, state);
  }
  
  function sprDrawSVG(p, activeState) {
    var svg = document.getElementById('spr-svg');
    if (!svg || !p.layout) return;
    var R = 28;
    var defs = '<defs><marker id="am" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M2 2L8 5L2 8" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round"/></marker></defs>';
    var edgesHtml = '';
    var nodesHtml = '';
  
    (p.edges || []).forEach(function(e) {
      var from = p.layout[e.f], to = p.layout[e.t];
      if (!from || !to) return;
      var dx = to.x - from.x, dy = to.y - from.y;
      var dist = Math.sqrt(dx*dx+dy*dy);
      if (dist < 1) return;
      var ux = dx/dist, uy = dy/dist;
      var sx = from.x + ux*(R+2), sy = from.y + uy*(R+2);
      var ex = to.x - ux*(R+2),   ey = to.y - uy*(R+2);
      var ox = -uy*10, oy = ux*10;
      var isActive = e.f === activeState || e.t === activeState;
      var color = isActive ? e.c : '#555';
      var opacity = isActive ? '1' : '0.3';
      var dash = e.dash ? 'stroke-dasharray="6 4"' : '';
      var mx = (sx+ex)/2+ox, my = (sy+ey)/2+oy;
      edgesHtml += '<path d="M'+(sx+ox)+','+(sy+oy)+' Q'+mx+','+my+' '+(ex+ox)+','+(ey+oy)+'" stroke="'+color+'" stroke-width="'+(isActive?2:1.2)+'" fill="none" '+dash+' opacity="'+opacity+'" marker-end="url(#am)"/>';
      if (isActive) {
        edgesHtml += '<text x="'+mx+'" y="'+(my-5)+'" text-anchor="middle" font-family="var(--mono)" font-size="8" fill="'+color+'">'+e.lb+'</text>';
      }
    });
  
    Object.keys(p.layout).forEach(function(sName) {
      var pos = p.layout[sName];
      var si = p.states[sName] || {};
      var isActive = sName === activeState;
      var r = isActive ? R+4 : R;
      var fill = isActive ? si.color : 'var(--bg3)';
      var stroke = isActive ? si.color : '#444';
      var textFill = isActive ? '#fff' : (si.color || '#aaa');
      var sw = isActive ? 3 : 1.5;
      nodesHtml += '<g>';
      nodesHtml += '<circle cx="'+pos.x+'" cy="'+pos.y+'" r="'+r+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+sw+'" opacity="'+(isActive?1:0.75)+'"/>';
      // Word-wrap long state names
      var words = sName.split('/');
      if (sName.length > 9) {
        var mid = Math.ceil(sName.length/2);
        var l1 = sName.substring(0,mid), l2 = sName.substring(mid);
        nodesHtml += '<text x="'+pos.x+'" y="'+(pos.y-5)+'" text-anchor="middle" dominant-baseline="central" font-family="var(--mono)" font-size="'+(isActive?9:8)+'" font-weight="700" fill="'+textFill+'">'+l1+'</text>';
        nodesHtml += '<text x="'+pos.x+'" y="'+(pos.y+7)+'" text-anchor="middle" dominant-baseline="central" font-family="var(--mono)" font-size="'+(isActive?9:8)+'" fill="'+textFill+'">'+l2+'</text>';
      } else {
        nodesHtml += '<text x="'+pos.x+'" y="'+pos.y+'" text-anchor="middle" dominant-baseline="central" font-family="var(--mono)" font-size="'+(isActive?10:9)+'" font-weight="700" fill="'+textFill+'">'+sName+'</text>';
      }
      nodesHtml += '</g>';
    });
  
    svg.innerHTML = defs + edgesHtml + nodesHtml;
  }
  
  // init both tools
  sprReset();
  
  
  // FLASHCARD ENGINE
  // ══════════════════════════════════════════
  var fcDecks = {
    ccna: [
      {cat:'CCNA — Subnetting', q:'What is the subnet mask for /26?', a:'255.255.255.192 — 64 addresses, 62 usable. Block size = 64. Subnets: .0, .64, .128, .192 in each /24 octet.'},
      {cat:'CCNA — OSI Model', q:'At which OSI layer does a router operate?', a:'Layer 3 (Network). Routers make forwarding decisions based on IP addresses. Switches operate at Layer 2 (Data Link) using MAC addresses. Layer 4 is Transport (TCP/UDP). Layer 7 is Application.'},
      {cat:'CCNA — STP', q:'What are the three STP port states in classic 802.1D?', a:'Blocking (receive BPDUs only) → Listening (send/receive BPDUs, no learning) → Learning (learning MACs, not forwarding) → Forwarding (fully active). Also: Disabled. Total time from Blocking to Forwarding: 50 seconds (15s listening + 15s learning).'},
      {cat:'CCNA — OSPF', q:'What is the default OSPF hello interval and dead interval on a broadcast network?', a:'Hello: 10 seconds. Dead: 40 seconds (4× hello). On NBMA networks: Hello=30s, Dead=120s. Mismatching these is one of the most common OSPF neighbor failure causes.'},
      {cat:'CCNA — TCP', q:'What is the TCP 3-way handshake sequence?', a:'SYN (client→server, random ISN) → SYN-ACK (server→client, server ISN, ACK=client_ISN+1) → ACK (client→server, ACK=server_ISN+1). Connection established. ISN is random to prevent sequence prediction attacks.'},
      {cat:'CCNA — VLANs', q:'What is the native VLAN and why is it a security risk?', a:'The native VLAN is the VLAN for untagged 802.1Q frames on a trunk (default VLAN 1). Security risk: VLAN hopping attack. Attacker sends a double-tagged frame with outer tag = native VLAN. Switch strips outer tag, forwards inner tag to target VLAN. Fix: change native VLAN to an unused VLAN (e.g., 999) and tag it explicitly: vlan dot1q tag native.'},
      {cat:'CCNA — NAT', q:'What is the difference between Inside Local and Inside Global in NAT?', a:'Inside Local: the private IP address assigned to the inside host (e.g., 10.1.1.10). Inside Global: the public IP address that represents the inside host on the outside network (e.g., 203.0.113.5). PAT translates the Inside Local to Inside Global with a unique source port.'},
      {cat:'CCNA — ACL', q:'What is the difference between standard and extended ACLs, and where should each be placed?', a:'Standard ACL: matches source IP only (no port, no destination). Extended ACL: matches source IP, destination IP, protocol, source port, destination port. Placement: Standard ACLs close to DESTINATION (they can only match source, so place near dest to avoid blocking too early). Extended ACLs close to SOURCE (match everything, so filter early before traffic traverses the network).'},
      {cat:'CCNA — DHCP', q:'What are the 4 steps in the DHCP DORA process?', a:'Discover (client broadcasts, src=0.0.0.0, dst=255.255.255.255) → Offer (server unicasts/broadcasts offered IP) → Request (client broadcasts to confirm — important: broadcast so other DHCP servers know this offer was accepted) → Acknowledge (server confirms, sends lease time, default gateway, DNS). All 4 steps use UDP: client port 68, server port 67.'},
      {cat:'CCNA — Wireless', q:'What is the WPA2 4-way handshake used for?', a:'The 4-way handshake derives the PTK (Pairwise Transient Key) used for encrypting unicast traffic. It uses the PMK (from the passphrase or 802.1X auth) + ANonce (AP random) + SNonce (client random) to create the PTK. The PMK never travels over the air — only the nonces do. This prevents offline dictionary attacks against the passphrase (WPA2 vulnerability — fixed in WPA3 with SAE).'}
    ],
    ccnp: [
      {cat:'CCNP — BGP', q:'In what order does BGP evaluate path selection attributes? Name the first 4.', a:'① Weight (highest wins, Cisco only, local) → ② Local Preference (highest wins, AS-wide via iBGP) → ③ Locally Originated (prefer local network/redistribute over iBGP) → ④ AS-PATH length (shortest wins). Full order: W-L-L-A-O-M-E-I-A-R-C-N (Weight, LP, Locally-orig, AS-path, Origin, MED, eBGP/iBGP, IGP metric, Age, RID, Cluster, Neighbor IP).'},
      {cat:'CCNP — OSPF', q:'What are OSPF LSA Types 1 through 5? Which crosses area boundaries?', a:'Type 1 (Router LSA): each router generates, stays within area. Type 2 (Network LSA): DR generates for multi-access segments, stays within area. Type 3 (Summary LSA): ABR generates, crosses areas (inter-area routes). Type 4 (ASBR Summary): ABR tells other areas where the ASBR is. Type 5 (External LSA): ASBR generates for redistributed routes, floods everywhere except stub areas. Type 7 (NSSA External): used in NSSA areas, converted to Type 5 at ABR.'},
      {cat:'CCNP — MPLS', q:'What is the difference between LDP and RSVP-TE label distribution?', a:'LDP (Label Distribution Protocol): distributes labels for all IGP routes automatically, hop-by-hop, one label per prefix. No traffic engineering. RSVP-TE: signals explicit paths with bandwidth reservations. Creates Label Switched Paths (LSPs) following a specific route computed by CSPF. Per-LSP state on every router. RSVP-TE is being replaced by Segment Routing (SR-TE) which is stateless on transit nodes.'},
      {cat:'CCNP — QoS', q:'What are the three QoS models? Which is used in enterprise networks?', a:'Best Effort: no QoS, default (FIFO queuing). IntServ (Integrated Services): per-flow reservation using RSVP. Guarantees bandwidth but doesn\'t scale. DiffServ (Differentiated Services): marks packets with DSCP (6 bits), applies per-hop behaviors (PHBs). Scales to any size. DiffServ is used in enterprise and SP networks. Key PHBs: EF (Expedited Forwarding, DSCP 46) for voice, AF (Assured Forwarding) for important data, CS (Class Selector) for compatibility with old IP Precedence.'},
      {cat:'CCNP — SD-WAN', q:'What are the four components of Cisco SD-WAN (Viptela)?', a:'vManage: centralized management GUI and REST API. vSmart: control plane — distributes routing policy via OMP (Overlay Management Protocol). vBond: orchestrator — authenticates new devices, provides NAT traversal info. vEdge/WAN Edge: data plane routers at branches. OMP (Overlay Management Protocol) is a BGP-like control plane protocol that distributes routes, policies, and service information between vSmart and edge devices.'},
      {cat:'CCNP — IPSec', q:'What is the difference between IKEv1 Phase 1 Main Mode and Aggressive Mode?', a:'Main Mode (6 messages): ①②Policy proposal/selection ③④DH exchange ⑤⑥Identity exchange (encrypted). More secure — identities are encrypted. Aggressive Mode (3 messages): combines steps, identities sent in cleartext (not encrypted). Faster but less secure — identity visible to eavesdroppers, susceptible to offline dictionary attack against PSK. IKEv2 (RFC 7296) replaces both with a 4-message exchange (IKE_SA_INIT + IKE_AUTH) — simpler and more secure.'}
    ],
    ccie: [
      {cat:'CCIE — EIGRP', q:'What is the Feasibility Condition and why does it prevent routing loops?', a:'FC: RD (Reported Distance) of a neighbor < FD (Feasible Distance) of the current successor. If a neighbor\'s distance to the destination is LESS than your current best distance, they cannot have a path through you — because if they did, their cost would be at least your FD + the link cost to you. This mathematically guarantees the neighbor\'s path is loop-free. A Feasible Successor meeting the FC can be installed instantly as a backup with no queries needed.'},
      {cat:'CCIE — BGP Communities', q:'What are the three well-known BGP communities and their meanings?', a:'NO_EXPORT (0xFFFFFF01): Do not advertise to any eBGP peer. Keep within the AS or confederation. NO_ADVERTISE (0xFFFFFF02): Do not advertise to ANY peer (iBGP or eBGP). LOCAL_AS (0xFFFFFF03): Do not advertise outside the local confederation sub-AS. Important: communities are NOT sent by default. Must configure: neighbor X send-community (or send-community both for standard+extended).'},
      {cat:'CCIE — Segment Routing', q:'What is the difference between a Node-SID and an Adjacency-SID?', a:'Node-SID (Prefix-SID): globally unique index within the SRGB. Assigned to a router\'s loopback. Behavior: CONTINUE — forward toward that node via IGP shortest path. Distributed via IGP (OSPF/IS-IS TLVs). Adjacency-SID (Adj-SID): locally significant only. Represents a specific physical link to a neighbor. Behavior: NEXT — forward out this specific interface immediately, ignoring IGP metrics. Used for SR-TE explicit paths. Auto-allocated from dynamic label range (not SRGB).'},
      {cat:'CCIE — EVPN', q:'What is the purpose of BGP EVPN Type 2 and Type 5 routes?', a:'Type 2 (MAC/IP Advertisement): advertises a MAC address (with optional IP binding) for a host. Enables ARP suppression — VTEP answers ARP requests locally using BGP-distributed bindings instead of flooding. Eliminates flood-and-learn. Type 5 (IP Prefix): advertises IP prefixes (subnets) for inter-subnet routing (L3 VNI). Carries: prefix, L3 VNI, gateway MAC, VTEP IP. Enables distributed anycast gateway — same SVI MAC/IP on all VTEPs, so VMs can move without ARP flushes.'},
      {cat:'CCIE — IS-IS', q:'Why do ISPs prefer IS-IS over OSPF for large-scale backbones?', a:'①IS-IS runs directly on L2 (not over IP) — immune to IP routing problems during convergence. ②TLV extensibility: new capabilities (SR, TE, IPv6) added as TLVs without version changes. OSPF needed Opaque LSAs and a whole new version (OSPFv3) for IPv6. IS-IS supports MT (Multi-Topology) for IPv6 in the same process. ③Flat L2 backbone — simpler hierarchy than OSPF\'s area 0 requirement. ④Historical: larger SP operator community with IS-IS expertise and proven scale at 10,000+ node deployments.'},
      {cat:'CCIE — Multicast', q:'Explain the difference between PIM-SM shared tree (RPT) and source tree (SPT) and when the switchover happens.', a:'RPT (*,G): traffic flows source→RP→receivers. Uses Rendezvous Point as meeting point. Higher latency, suboptimal path, but simple for many sources. SPT (S,G): traffic flows source directly to receivers via shortest path. Switchover trigger: when traffic rate exceeds spt-threshold (default 0 = immediate). Process: ①DR near receiver sends PIM Join (S,G) toward source. ②(S,G) state built on shortest path. ③When SPT traffic arrives at receiver DR, it sends Prune (*,G) toward RP. ④RP prunes if no other receivers. Result: optimal path, no RP in forwarding path. ip pim spt-threshold infinity: stay on RPT forever (saves router state in RP-heavy designs).'},
      {cat:'CCIE — BGP PIC', q:'What is BGP Prefix Independent Convergence (PIC) and how does it achieve sub-50ms failover?', a:'Traditional BGP failover: primary path fails → BGP withdraws route → RIB updated → FIB programmed → 100ms-5s downtime. BGP PIC Edge: pre-installs a backup path directly in FIB (not just RIB). When primary next-hop fails (detected by BFD or interface down), FIB switches to pre-installed backup immediately without waiting for BGP to reconverge. Requires: bgp additional-paths select best 2, neighbor X additional-paths send. BGP PIC Core: for MPLS VPN, pre-installs backup PE path. Combined with BFD (sub-10ms detection) → total failover under 50ms.'}
    ]
  };
  fcDecks.all = [...fcDecks.ccna, ...fcDecks.ccnp, ...fcDecks.ccie];
  var fcCurrent = [];
  var fcIndex = 0;
  var fcCorrect = 0;
  var fcWrong = 0;
  var fcFlipped = false;
  
  function fcDeck(which) {
    fcCurrent = JSON.parse(JSON.stringify(fcDecks[which] || []));
    fcIndex = 0; fcCorrect = 0; fcWrong = 0; fcFlipped = false;
    fcUpdateStats();
    fcShow();
  }
  function fcShuffle() {
    for (var i = fcCurrent.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = fcCurrent[i]; fcCurrent[i] = fcCurrent[j]; fcCurrent[j] = tmp;
    }
    fcIndex = 0; fcFlipped = false; fcShow();
  }
  function fcShow() {
    if (!fcCurrent.length) { document.getElementById('fc-question').textContent = 'Select a deck above to begin'; return; }
    if (fcIndex >= fcCurrent.length) {
      var pct = Math.round(fcCorrect / (fcCorrect + fcWrong) * 100) || 0;
      document.getElementById('fc-question').innerHTML = '🎉 Deck complete! Score: ' + pct + '%<br><span style="font-size:14px;color:var(--muted)">Press Shuffle or select another deck to continue.</span>';
      document.getElementById('fc-category').textContent = 'COMPLETE';
      document.getElementById('fc-answer').style.display = 'none';
      document.getElementById('fc-buttons').style.display = 'none';
      return;
    }
    var card = fcCurrent[fcIndex];
    document.getElementById('fc-category').textContent = card.cat;
    document.getElementById('fc-question').textContent = card.q;
    document.getElementById('fc-answer').style.display = 'none';
    document.getElementById('fc-answer').textContent = card.a;
    document.getElementById('fc-buttons').style.display = 'none';
    fcFlipped = false;
    document.getElementById('fc-card').style.borderColor = '';
    fcUpdateStats();
  }
  function fcFlip() {
    if (fcFlipped || !fcCurrent.length || fcIndex >= fcCurrent.length) return;
    fcFlipped = true;
    document.getElementById('fc-answer').style.display = 'block';
    document.getElementById('fc-buttons').style.display = 'flex';
  }
  function fcMark(correct) {
    if (correct) fcCorrect++; else fcWrong++;
    fcIndex++;
    fcUpdateStats();
    fcShow();
  }
  function fcNext() { fcIndex++; fcShow(); }
  function fcUpdateStats() {
    document.getElementById('fc-correct').textContent = fcCorrect;
    document.getElementById('fc-wrong').textContent = fcWrong;
    document.getElementById('fc-remaining').textContent = Math.max(0, fcCurrent.length - fcIndex);
    var total = fcCorrect + fcWrong;
    document.getElementById('fc-pct').textContent = total ? Math.round(fcCorrect/total*100) + '%' : '0%';
  }
  
  // ══════════════════════════════════════════
  // PACKET DECODER (WIRESHARK)
  // ══════════════════════════════════════════
  var wsSamples = {
    tcp: 'ff ff ff ff ff ff 00 50 56 c0 00 01 08 00 45 00 00 3c 1f 5e 40 00 40 06 00 00 c0 a8 01 02 08 08 08 08 00 50 cf 3a e1 2b 34 56 00 00 00 00 a0 02 72 10 00 00 00 00 02 04 05 b4 04 02 08 0a 00 12 34 56 00 00 00 00 01 03 03 07',
    icmp: 'ff ff ff ff ff ff 00 11 22 33 44 55 08 00 45 00 00 3c 00 01 00 00 40 01 f3 74 c0 a8 01 01 08 08 08 08 08 00 4d 5a 00 01 00 01 61 62 63 64 65 66 67 68 69 6a 6b 6c 6d 6e 6f 70',
    ospf: 'ff ff ff ff ff ff 00 11 22 33 44 55 08 00 45 c0 00 4c 00 00 00 00 01 59 73 9e c0 a8 01 01 e0 00 00 05 02 01 00 3c 01 01 01 01 00 00 00 00 00 00 00 00 ff ff ff 00 00 0a 00 28 00 00 00 00 00 00 00 00 c0 a8 01 01 00 00 00 00 00 00 00 00',
    arp: 'ff ff ff ff ff ff 00 50 56 ab cd ef 08 06 00 01 08 00 06 04 00 01 00 50 56 ab cd ef c0 a8 01 01 00 00 00 00 00 00 c0 a8 01 fe',
    dhcp: 'ff ff ff ff ff ff 00 0c 29 12 34 56 08 00 45 00 01 48 00 01 00 00 80 11 39 a6 00 00 00 00 ff ff ff ff 00 44 00 43 01 34 00 00 01 01 06 00 56 78 9a bc 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 0c 29 12 34 56'
  };
  function wsLoad(proto) {
    document.getElementById('ws-hex').value = wsSamples[proto] || '';
    wsDecode();
  }
  function wsDecode() {
    var raw = document.getElementById('ws-hex').value.trim().replace(/\s+/g,' ').split(' ');
    var bytes = raw.map(function(h){ return parseInt(h,16); }).filter(function(n){ return !isNaN(n); });
    if (bytes.length < 14) {
      document.getElementById('ws-output').innerHTML = '<span style="color:var(--muted)">Need at least 14 bytes for Ethernet header.</span>';
      return;
    }
    var out = [];
    var colorMap = {};
    function field(name, start, len, fmt, color) {
      var val = bytes.slice(start, start+len);
      var hex = val.map(function(b){ return b.toString(16).padStart(2,'0'); }).join(' ');
      var disp = fmt ? fmt(val) : hex;
      for (var i = start; i < start+len; i++) colorMap[i] = color || 'var(--blue)';
      out.push('<div style="padding:4px 0;border-bottom:1px solid var(--border);display:flex;gap:10px"><span style="color:' + (color||'var(--blue)') + ';min-width:200px;font-weight:600">' + name + '</span><span style="color:var(--cyan);min-width:140px">' + hex + '</span><span style="color:var(--text)">' + disp + '</span></div>');
    }
    function hex2(val){ return val.map(function(b){ return b.toString(16).padStart(2,'0').toUpperCase(); }).join(':'); }
    function ip(val){ return val.join('.'); }
    function dec(val){ var n=0; val.forEach(function(b){ n=(n<<8)|b; }); return n>>>0; }
    function str(val){ return val.map(function(b){ return String.fromCharCode(b); }).join(''); }
  
    out.push('<div style="color:var(--amber);font-weight:700;padding:6px 0;font-size:11px;text-transform:uppercase;letter-spacing:1px">— Ethernet II Header (14 bytes) —</div>');
    field('Destination MAC', 0, 6, hex2, 'var(--amber)');
    field('Source MAC', 6, 6, hex2, 'var(--amber)');
    var ethertype = (bytes[12]<<8)|bytes[13];
    field('EtherType', 12, 2, function(){ return '0x' + ethertype.toString(16).toUpperCase() + ' (' + ({0x0800:'IPv4',0x0806:'ARP',0x86DD:'IPv6',0x8100:'802.1Q VLAN',0x8847:'MPLS unicast'}[ethertype]||'Unknown') + ')'; }, 'var(--pink)');
  
    if (ethertype === 0x0806 && bytes.length >= 28) {
      out.push('<div style="color:var(--cyan);font-weight:700;padding:6px 0;font-size:11px;text-transform:uppercase;letter-spacing:1px">— ARP Header (28 bytes) —</div>');
      field('Hardware Type', 14, 2, function(val){ return dec(val)===1?'Ethernet (1)':'Type '+dec(val); }, 'var(--blue)');
      field('Protocol Type', 16, 2, function(val){ return dec(val)===0x0800?'IPv4 (0x0800)':'0x'+dec(val).toString(16); }, 'var(--blue)');
      field('HW Addr Length', 18, 1, function(val){ return val[0]+' bytes'; }, 'var(--muted2)');
      field('Proto Addr Length',19,1,function(val){ return val[0]+' bytes'; },'var(--muted2)');
      field('Operation', 20, 2, function(val){ return dec(val)===1?'Request (1)':dec(val)===2?'Reply (2)':'Op '+dec(val); }, 'var(--green)');
      field('Sender MAC', 22, 6, hex2, 'var(--amber)');
      field('Sender IP', 28, 4, ip, 'var(--cyan)');
      field('Target MAC', 32, 6, hex2, 'var(--amber)');
      field('Target IP', 38, 4, ip, 'var(--cyan)');
    } else if (ethertype === 0x0800 && bytes.length >= 34) {
      out.push('<div style="color:var(--green);font-weight:700;padding:6px 0;font-size:11px;text-transform:uppercase;letter-spacing:1px">— IPv4 Header —</div>');
      field('Version / IHL', 14, 1, function(val){ return 'Version: '+(val[0]>>4)+', IHL: '+(val[0]&0xf)+' (='+(val[0]&0xf)*4+' bytes)'; }, 'var(--green)');
      field('DSCP / ECN', 15, 1, function(val){ return 'DSCP: '+(val[0]>>2)+', ECN: '+(val[0]&3); }, 'var(--green)');
      field('Total Length', 16, 2, function(val){ return dec(val)+' bytes'; }, 'var(--green)');
      field('Identification', 18, 2, function(val){ return '0x'+dec(val).toString(16).toUpperCase()+' ('+dec(val)+')'; }, 'var(--muted2)');
      field('Flags / Fragment Offset', 20, 2, function(val){ var n=dec(val); var flags=(n>>13)&7; var off=(n&0x1fff)*8; return 'DF:'+(flags>>1&1)+' MF:'+(flags&1)+' Offset:'+off; }, 'var(--muted2)');
      field('TTL', 22, 1, function(val){ return val[0]+' hops'; }, 'var(--blue)');
      var proto = bytes[23];
      field('Protocol', 23, 1, function(){ return proto+' ('+({1:'ICMP',6:'TCP',17:'UDP',89:'OSPF',47:'GRE',50:'ESP',51:'AH'}[proto]||'Unknown')+')'; }, 'var(--pink)');
      field('Header Checksum', 24, 2, function(val){ return '0x'+dec(val).toString(16).toUpperCase(); }, 'var(--muted2)');
      field('Source IP', 26, 4, ip, 'var(--cyan)');
      field('Destination IP', 30, 4, ip, 'var(--cyan)');
      var ihl = (bytes[14]&0xf)*4;
      var l4off = 14 + ihl;
      if (proto === 6 && bytes.length > l4off+19) {
        out.push('<div style="color:var(--blue);font-weight:700;padding:6px 0;font-size:11px;text-transform:uppercase;letter-spacing:1px">— TCP Header —</div>');
        field('Source Port', l4off, 2, function(val){ return dec(val); }, 'var(--blue)');
        field('Destination Port', l4off+2, 2, function(val){ var p=dec(val); return p+' ('+({80:'HTTP',443:'HTTPS',22:'SSH',23:'Telnet',25:'SMTP',53:'DNS',179:'BGP',830:'NETCONF'}[p]||'Unknown')+')'; }, 'var(--blue)');
        field('Sequence Number', l4off+4, 4, function(val){ return dec(val); }, 'var(--cyan)');
        field('Acknowledgment', l4off+8, 4, function(val){ return dec(val); }, 'var(--cyan)');
        var flags2 = bytes[l4off+13];
        field('Data Offset / Flags', l4off+12, 2, function(){ return 'Flags: '+(flags2&1?'FIN ':'')+((flags2>>1&1)?'SYN ':'')+((flags2>>2&1)?'RST ':'')+((flags2>>3&1)?'PSH ':'')+((flags2>>4&1)?'ACK ':'')+((flags2>>5&1)?'URG ':''); }, 'var(--pink)');
        field('Window Size', l4off+14, 2, function(val){ return dec(val)+' bytes'; }, 'var(--muted2)');
        field('Checksum', l4off+16, 2, function(val){ return '0x'+dec(val).toString(16).toUpperCase(); }, 'var(--muted2)');
      } else if (proto === 17 && bytes.length > l4off+7) {
        out.push('<div style="color:var(--amber);font-weight:700;padding:6px 0;font-size:11px;text-transform:uppercase;letter-spacing:1px">— UDP Header —</div>');
        field('Source Port', l4off, 2, function(val){ return dec(val); }, 'var(--amber)');
        field('Destination Port', l4off+2, 2, function(val){ var p=dec(val); return p+' ('+({53:'DNS',67:'DHCP Server',68:'DHCP Client',69:'TFTP',161:'SNMP',500:'IKE',4789:'VXLAN',5246:'CAPWAP Control',5247:'CAPWAP Data'}[p]||'Unknown')+')'; }, 'var(--amber)');
        field('Length', l4off+4, 2, function(val){ return dec(val)+' bytes'; }, 'var(--muted2)');
        field('Checksum', l4off+6, 2, function(val){ return '0x'+dec(val).toString(16).toUpperCase(); }, 'var(--muted2)');
      } else if (proto === 1 && bytes.length > l4off+7) {
        out.push('<div style="color:var(--green);font-weight:700;padding:6px 0;font-size:11px;text-transform:uppercase;letter-spacing:1px">— ICMP Header —</div>');
        var icmpType = bytes[l4off];
        field('Type', l4off, 1, function(){ return icmpType+' ('+({0:'Echo Reply',8:'Echo Request',3:'Destination Unreachable',11:'Time Exceeded',5:'Redirect'}[icmpType]||'Unknown')+')'; }, 'var(--green)');
        field('Code', l4off+1, 1, function(val){ return val[0]; }, 'var(--green)');
        field('Checksum', l4off+2, 2, function(val){ return '0x'+dec(val).toString(16).toUpperCase(); }, 'var(--muted2)');
        field('Identifier', l4off+4, 2, function(val){ return dec(val); }, 'var(--cyan)');
        field('Sequence Number', l4off+6, 2, function(val){ return dec(val); }, 'var(--cyan)');
      } else if (proto === 89 && bytes.length > l4off+23) {
        out.push('<div style="color:var(--pink);font-weight:700;padding:6px 0;font-size:11px;text-transform:uppercase;letter-spacing:1px">— OSPF Header —</div>');
        field('Version', l4off, 1, function(val){ return 'OSPFv'+val[0]; }, 'var(--pink)');
        var ospfType = bytes[l4off+1];
        field('Type', l4off+1, 1, function(){ return ospfType+' ('+({1:'Hello',2:'DBD',3:'LSR',4:'LSU',5:'LSAck'}[ospfType]||'Unknown')+')'; }, 'var(--pink)');
        field('Packet Length', l4off+2, 2, function(val){ return dec(val)+' bytes'; }, 'var(--muted2)');
        field('Router ID', l4off+4, 4, ip, 'var(--cyan)');
        field('Area ID', l4off+8, 4, ip, 'var(--cyan)');
        field('Checksum', l4off+12, 2, function(val){ return '0x'+dec(val).toString(16).toUpperCase(); }, 'var(--muted2)');
        field('Auth Type', l4off+14, 2, function(val){ return dec(val)===0?'None':dec(val)===1?'Simple Password':dec(val)===2?'MD5':'Unknown'; }, 'var(--muted2)');
        if (ospfType === 1 && bytes.length > l4off+43) {
          out.push('<div style="color:var(--pink);font-size:11px;padding:4px 0;color:var(--muted)">— OSPF Hello —</div>');
          field('Network Mask', l4off+24, 4, ip, 'var(--blue)');
          field('Hello Interval', l4off+28, 2, function(val){ return dec(val)+' seconds'; }, 'var(--blue)');
          field('Options', l4off+30, 1, function(val){ return '0x'+val[0].toString(16).toUpperCase(); }, 'var(--muted2)');
          field('Router Priority', l4off+31, 1, function(val){ return val[0]; }, 'var(--blue)');
          field('Dead Interval', l4off+32, 4, function(val){ return dec(val)+' seconds'; }, 'var(--blue)');
          field('DR', l4off+36, 4, ip, 'var(--amber)');
          field('BDR', l4off+40, 4, ip, 'var(--amber)');
        }
      }
    }
    document.getElementById('ws-output').innerHTML = out.join('');
    buildByteMap(bytes, colorMap);
  }
  function buildByteMap(bytes, colorMap) {
    var html = '';
    bytes.forEach(function(b, i) {
      var color = colorMap[i] || 'var(--muted2)';
      html += '<span style="display:inline-block;padding:2px 3px;margin:1px;border-radius:3px;background:rgba(255,255,255,0.05);color:' + color + ';cursor:default" title="Byte ' + i + ': 0x' + b.toString(16).toUpperCase() + '">' + b.toString(16).padStart(2,'0').toUpperCase() + '</span>';
    });
    document.getElementById('ws-byte-map').innerHTML = html;
    document.getElementById('ws-raw-view').style.display = '';
  }
  
  
  
  // ═══════════════════════════════════════════════════════════
  // OSPF TOPOLOGY CANVAS
  // ═══════════════════════════════════════════════════════════
  
  // ═══════════════════════════════════════════════════════════
  // OSPF TOPOLOGY CANVAS — Full Network Lab
  // ═══════════════════════════════════════════════════════════
  var OC = {
    nodes:[], links:[], areas:{},
    tool:'router', selNode:null, selLink:null,
    dragging:null, linkStart:null,
    canvas:null, ctx:null, W:0, H:0,
    ridCounter:1, activeTab:'routes',
    spfAnim:{running:false,step:0,timer:null,steps:[]},
    areaColors:{'0':'#5b9cf6','1':'#4ade80','2':'#fbbf24','3':'#f472b6','4':'#38d9c0','5':'#a78bfa'}
  };
  
  var OC_NODE_COLORS = {IR:'#3b82f6',ABR:'#f59e0b',ASBR:'#ef4444',DR:'#8b5cf6'};
  var OC_TYPE_LABELS = {IR:'IR',ABR:'ABR',ASBR:'ASBR',DR:'DR'};
  
  function ospfCanvasInit() {
    var wrap = document.getElementById('oc-canvas-wrap');
    var canvas = document.getElementById('oc-canvas');
    if (!canvas) return;
    OC.canvas = canvas; OC.ctx = canvas.getContext('2d');
    function resize() {
      OC.W = wrap.clientWidth; OC.H = Math.max(380, wrap.clientHeight || 400);
      canvas.width = OC.W; canvas.height = OC.H; ocDraw();
    }
    resize();
    window.addEventListener('resize', resize);
    canvas.addEventListener('mousedown', ocMouseDown);
    canvas.addEventListener('mousemove', ocMouseMove);
    canvas.addEventListener('mouseup', ocMouseUp);
    canvas.addEventListener('dblclick', ocDblClick);
    canvas.addEventListener('contextmenu', function(e){ e.preventDefault(); ocContextMenu(e); });
    ocUpdateRight();
  }
  
  function ocSetTool(t, btn) {
    OC.tool = t; OC.linkStart = null;
    document.querySelectorAll('.tool-pill[id^="oc-tool"]').forEach(b=>b.classList.remove('active'));
    if(btn) btn.classList.add('active');
    var hints = {
      router:'Click canvas to place a router (right-click to delete)',
      link:'Click source router, then destination router to connect',
      select:'Click to select and drag — edit RID/area/type in panel',
      fail:'Click a link to toggle failure state (red = failed)',
      area:'Click a router to cycle its area assignment'
    };
    document.getElementById('oc-hint').textContent = hints[t]||'';
  }
  
  function ocRightTab(tab, btn) {
    OC.activeTab = tab;
    ['routes','lsdb','config','log'].forEach(function(t){
      var b=document.getElementById('oc-rtab-'+t);
      if(b){ b.classList.toggle('active',t===tab); b.style.borderBottom=t===tab?'2px solid var(--blue)':'none'; }
    });
    ocUpdateRight();
  }
  
  function ocNodeAt(x,y){ return OC.nodes.find(n=>Math.hypot(n.x-x,n.y-y)<24); }
  function ocLinkNear(x,y){
    return OC.links.find(function(l){
      var a=OC.nodes.find(n=>n.id===l.a), b=OC.nodes.find(n=>n.id===l.b);
      if(!a||!b) return false;
      var dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1;
      var t=((x-a.x)*dx+(y-a.y)*dy)/(len*len);
      t=Math.max(0,Math.min(1,t));
      return Math.hypot(x-(a.x+t*dx),y-(a.y+t*dy))<12;
    });
  }
  
  function ocMouseDown(e){
    var r=OC.canvas.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
    if(OC.tool==='router'){
      var n={id:OC.ridCounter,x:x,y:y,rid:'R'+OC.ridCounter,area:'0',type:'IR',failed:false};
      OC.ridCounter++; OC.nodes.push(n);
      ocLog('Added <span style="color:var(--blue)">'+n.rid+'</span> at ('+Math.round(x)+','+Math.round(y)+')');
      ocUpdateRight(); ocDraw();
    } else if(OC.tool==='link'){
      var nd=ocNodeAt(x,y);
      if(nd){
        if(!OC.linkStart){ OC.linkStart=nd; ocDraw(); }
        else if(OC.linkStart.id!==nd.id){
          if(!OC.links.find(l=>(l.a===OC.linkStart.id&&l.b===nd.id)||(l.a===nd.id&&l.b===OC.linkStart.id))){
            var cost = ocDefaultCost(OC.linkStart,nd);
            OC.links.push({a:OC.linkStart.id,b:nd.id,cost:cost,failed:false});
            ocLog('Linked <span style="color:var(--green)">'+OC.linkStart.rid+'↔'+nd.rid+'</span> cost='+cost);
            ocUpdateRight();
          }
          OC.linkStart=null; ocDraw();
        }
      }
    } else if(OC.tool==='select'){
      var nd=ocNodeAt(x,y); var lk=nd?null:ocLinkNear(x,y);
      OC.selNode=nd; OC.selLink=lk; OC.dragging=nd;
      ocUpdateSelPanel(); ocDraw();
    } else if(OC.tool==='fail'){
      var lk=ocLinkNear(x,y);
      if(lk){ lk.failed=!lk.failed; ocLog('Link '+lk.a+'↔'+lk.b+(lk.failed?' <span style="color:var(--red)">FAILED</span>':' <span style="color:var(--green)">restored</span>')); ocUpdateRight(); ocDraw(); }
      var nd=ocNodeAt(x,y);
      if(nd){ nd.failed=!nd.failed; ocLog('Router <span style="color:'+(nd.failed?'var(--red)':'var(--green)')+'">'+nd.rid+(nd.failed?' FAILED':' restored')+'</span>'); ocUpdateRight(); ocDraw(); }
    } else if(OC.tool==='area'){
      var nd=ocNodeAt(x,y);
      if(nd){
        var areas=Object.keys(OC.areaColors);
        var cur=areas.indexOf(nd.area||'0');
        nd.area=areas[(cur+1)%areas.length];
        // Auto-set ABR if router has interfaces in multiple areas
        ocAutoSetABR();
        ocLog(nd.rid+' → Area '+nd.area);
        ocUpdateRight(); ocDraw();
      }
    }
  }
  
  function ocDefaultCost(a,b){
    // Default cost based on distance heuristic (100Mbps = cost 1)
    return 1;
  }
  
  function ocAutoSetABR(){
    OC.nodes.forEach(function(n){
      if(n.type==='IR'||n.type==='ABR'){
        // Check if this node has links to nodes in different areas
        var connectedAreas = new Set([n.area||'0']);
        OC.links.forEach(function(l){
          if(l.a===n.id){ var nb=OC.nodes.find(x=>x.id===l.b); if(nb) connectedAreas.add(nb.area||'0'); }
          if(l.b===n.id){ var nb=OC.nodes.find(x=>x.id===l.a); if(nb) connectedAreas.add(nb.area||'0'); }
        });
        if(connectedAreas.size>1 && n.type!=='ASBR') n.type='ABR';
        else if(connectedAreas.size===1 && n.type==='ABR') n.type='IR';
      }
    });
  }
  
  function ocMouseMove(e){
    if(OC.dragging&&OC.tool==='select'){
      var r=OC.canvas.getBoundingClientRect();
      OC.dragging.x=Math.max(24,Math.min(OC.W-24,e.clientX-r.left));
      OC.dragging.y=Math.max(24,Math.min(OC.H-24,e.clientY-r.top));
      ocUpdateRight(); ocDraw();
    }
  }
  
  function ocMouseUp(){ OC.dragging=null; }
  
  function ocDblClick(e){
    var r=OC.canvas.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
    var nd=ocNodeAt(x,y);
    if(nd&&OC.tool==='select'){
      OC.nodes.splice(OC.nodes.indexOf(nd),1);
      OC.links=OC.links.filter(l=>l.a!==nd.id&&l.b!==nd.id);
      if(OC.selNode===nd){OC.selNode=null; ocUpdateSelPanel();}
      ocAutoSetABR(); ocLog('Deleted <span style="color:var(--red)">'+nd.rid+'</span>');
      ocUpdateRight(); ocDraw();
    }
    var lk=nd?null:ocLinkNear(x,y);
    if(lk&&OC.tool==='select'){
      OC.links.splice(OC.links.indexOf(lk),1);
      ocAutoSetABR(); ocLog('Deleted link '+lk.a+'↔'+lk.b);
      ocUpdateRight(); ocDraw();
    }
  }
  
  function ocContextMenu(e){
    var r=OC.canvas.getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top;
    var nd=ocNodeAt(x,y);
    if(nd){ OC.nodes.splice(OC.nodes.indexOf(nd),1); OC.links=OC.links.filter(l=>l.a!==nd.id&&l.b!==nd.id); ocAutoSetABR(); ocUpdateRight(); ocDraw(); }
  }
  
  function ocUpdateSelPanel(){
    var ri=document.getElementById('oc-router-ctrl'), ci=document.getElementById('oc-cost-ctrl');
    var si=document.getElementById('oc-selected-info');
    if(OC.selNode){
      si.innerHTML='<span style="color:var(--blue);font-weight:700">'+OC.selNode.rid+'</span> — Area '+OC.selNode.area+' — <span style="color:'+(OC_NODE_COLORS[OC.selNode.type]||'#3b82f6')+'">'+OC.selNode.type+'</span>';
      ri.style.display='block'; ci.style.display='none';
      document.getElementById('oc-rid-inp').value=OC.selNode.rid;
      document.getElementById('oc-area-inp').value=OC.selNode.area||'0';
      document.getElementById('oc-rtype-sel').value=OC.selNode.type||'IR';
    } else if(OC.selLink){
      var na=OC.nodes.find(n=>n.id===OC.selLink.a), nb=OC.nodes.find(n=>n.id===OC.selLink.b);
      si.innerHTML='Link <span style="color:var(--cyan)">'+(na?na.rid:OC.selLink.a)+'↔'+(nb?nb.rid:OC.selLink.b)+'</span> — cost <span style="color:var(--amber)">'+OC.selLink.cost+'</span>'+(OC.selLink.failed?' <span style="color:var(--red)">[FAILED]</span>':'');
      ri.style.display='none'; ci.style.display='block';
      document.getElementById('oc-cost-inp').value=OC.selLink.cost;
    } else {
      si.innerHTML='<span style="color:var(--muted)">Nothing selected</span>';
      ri.style.display='none'; ci.style.display='none';
    }
  }
  
  function ocUpdateRID(v){ if(OC.selNode){ OC.selNode.rid=v||OC.selNode.rid; ocUpdateRight(); ocDraw(); } }
  function ocUpdateArea(v){ if(OC.selNode){ OC.selNode.area=v||'0'; ocAutoSetABR(); ocUpdateRight(); ocDraw(); } }
  function ocUpdateRType(v){ if(OC.selNode){ OC.selNode.type=v; ocUpdateRight(); ocDraw(); } }
  function ocUpdateCost(v){ if(OC.selLink){ OC.selLink.cost=parseInt(v)||1; ocUpdateRight(); ocDraw(); } }
  
  // ─── DRAW ─────────────────────────────────────────────────
  function ocDraw(){
    var ctx=OC.ctx; if(!ctx) return;
    ctx.clearRect(0,0,OC.W,OC.H);
  
    // Grid dots
    ctx.fillStyle='rgba(100,160,255,0.04)';
    for(var gx=20;gx<OC.W;gx+=30) for(var gy=20;gy<OC.H;gy+=30){
      ctx.beginPath(); ctx.arc(gx,gy,1.2,0,Math.PI*2); ctx.fill();
    }
  
    // Area background zones
    var areaNodeMap={};
    OC.nodes.forEach(function(n){ var a=n.area||'0'; if(!areaNodeMap[a]) areaNodeMap[a]=[]; areaNodeMap[a].push(n); });
    Object.keys(areaNodeMap).forEach(function(a){
      if(areaNodeMap[a].length<1) return;
      var col=OC.areaColors[a]||'#888';
      var nodes=areaNodeMap[a];
      if(nodes.length===1){
        ctx.save(); ctx.beginPath(); ctx.arc(nodes[0].x,nodes[0].y,38,0,Math.PI*2);
        ctx.fillStyle=col+'12'; ctx.fill();
        ctx.strokeStyle=col+'30'; ctx.lineWidth=1.5; ctx.setLineDash([4,3]); ctx.stroke();
        ctx.setLineDash([]); ctx.restore();
      } else {
        // Convex-hull-like bounding box
        var minX=Math.min.apply(null,nodes.map(n=>n.x))-44, maxX=Math.max.apply(null,nodes.map(n=>n.x))+44;
        var minY=Math.min.apply(null,nodes.map(n=>n.y))-44, maxY=Math.max.apply(null,nodes.map(n=>n.y))+44;
        ctx.save(); ctx.beginPath();
        var pad=10,rx=minX-pad,ry=minY-pad,rw=maxX-minX+2*pad,rh=maxY-minY+2*pad,rr=18;
        ctx.moveTo(rx+rr,ry); ctx.lineTo(rx+rw-rr,ry); ctx.quadraticCurveTo(rx+rw,ry,rx+rw,ry+rr);
        ctx.lineTo(rx+rw,ry+rh-rr); ctx.quadraticCurveTo(rx+rw,ry+rh,rx+rw-rr,ry+rh);
        ctx.lineTo(rx+rr,ry+rh); ctx.quadraticCurveTo(rx,ry+rh,rx,ry+rh-rr);
        ctx.lineTo(rx,ry+rr); ctx.quadraticCurveTo(rx,ry,rx+rr,ry); ctx.closePath();
        ctx.fillStyle=col+'0f'; ctx.fill();
        ctx.strokeStyle=col+'35'; ctx.lineWidth=1.5; ctx.setLineDash([5,4]); ctx.stroke();
        ctx.setLineDash([]);
        ctx.font='bold 10px IBM Plex Mono,monospace'; ctx.fillStyle=col+'88';
        ctx.textAlign='left'; ctx.textBaseline='top';
        ctx.fillText('Area '+a, rx+8, ry+5);
        ctx.restore();
      }
    });
  
    // SPF animation highlight
    var spfVisited={}, spfEdges={};
    if(OC.spfAnim.running && OC.spfAnim.steps.length){
      var curStep=OC.spfAnim.steps[Math.min(OC.spfAnim.step,OC.spfAnim.steps.length-1)];
      if(curStep){ (curStep.visited||[]).forEach(function(id){spfVisited[id]=true;}); (curStep.edges||[]).forEach(function(e){spfEdges[e]=true;}); }
    }
  
    // Links
    OC.links.forEach(function(l){
      var a=OC.nodes.find(n=>n.id===l.a), b=OC.nodes.find(n=>n.id===l.b);
      if(!a||!b) return;
      var edgeKey=Math.min(l.a,l.b)+'-'+Math.max(l.a,l.b);
      var inSPF=spfEdges[edgeKey];
      ctx.save();
      ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y);
      if(l.failed){ ctx.strokeStyle='rgba(239,68,68,0.6)'; ctx.lineWidth=2; ctx.setLineDash([6,4]); }
      else if(inSPF){ ctx.strokeStyle='#4ade80'; ctx.lineWidth=3; ctx.setLineDash([]); }
      else { ctx.strokeStyle='rgba(100,160,255,0.3)'; ctx.lineWidth=2; ctx.setLineDash([]); }
      ctx.stroke(); ctx.setLineDash([]);
      // Cost label
      var mx=(a.x+b.x)/2, my=(a.y+b.y)/2;
      var sel=OC.selLink===l;
      ctx.fillStyle=sel?'rgba(91,156,246,0.25)':'rgba(12,15,26,0.75)';
      ctx.beginPath(); ctx.roundRect?ctx.roundRect(mx-12,my-8,24,14,4):ctx.rect(mx-12,my-8,24,14);
      ctx.fill();
      ctx.font='bold 9px IBM Plex Mono,monospace'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillStyle=l.failed?'#f87171':inSPF?'#4ade80':'rgba(200,220,255,0.8)';
      ctx.fillText(l.cost,mx,my+1);
      if(l.failed){
        ctx.font='11px sans-serif'; ctx.fillText('✗',(a.x+b.x)/2,(a.y+b.y)/2+14);
      }
      ctx.restore();
    });
  
    // Link-start indicator
    if(OC.linkStart){
      ctx.save(); ctx.beginPath(); ctx.arc(OC.linkStart.x,OC.linkStart.y,30,0,Math.PI*2);
      ctx.strokeStyle='rgba(255,255,255,0.4)'; ctx.lineWidth=2; ctx.setLineDash([4,3]); ctx.stroke(); ctx.setLineDash([]); ctx.restore();
    }
  
    // Nodes
    OC.nodes.forEach(function(n){
      var isSel=OC.selNode&&OC.selNode.id===n.id;
      var isVisited=spfVisited[n.id];
      var isLinkStart=OC.linkStart&&OC.linkStart.id===n.id;
      var baseCol=OC_NODE_COLORS[n.type]||'#3b82f6';
      var aCol=OC.areaColors[n.area||'0']||'#5b9cf6';
  
      ctx.save();
      // Glow ring
      if(isSel||isVisited||isLinkStart){
        ctx.beginPath(); ctx.arc(n.x,n.y,28,0,Math.PI*2);
        ctx.strokeStyle=isSel?'#22c55e':isLinkStart?'#fff':'#4ade80';
        ctx.lineWidth=2.5; ctx.globalAlpha=0.6; ctx.stroke();
        ctx.globalAlpha=1;
      }
      // Area color ring
      ctx.beginPath(); ctx.arc(n.x,n.y,24,0,Math.PI*2);
      ctx.strokeStyle=aCol; ctx.lineWidth=1.5; ctx.globalAlpha=0.4; ctx.stroke();
      ctx.globalAlpha=1;
      // Body
      ctx.beginPath(); ctx.arc(n.x,n.y,20,0,Math.PI*2);
      var grad=ctx.createRadialGradient(n.x-6,n.y-6,2,n.x,n.y,20);
      grad.addColorStop(0, n.failed?'#7f1d1d':baseCol+'cc');
      grad.addColorStop(1, n.failed?'#450a0a':baseCol+'44');
      ctx.fillStyle=grad; ctx.fill();
      ctx.strokeStyle=n.failed?'#f87171':isSel?'#22c55e':baseCol;
      ctx.lineWidth=isSel?2.5:1.5; ctx.stroke();
      // Router icon lines
      ctx.strokeStyle='rgba(255,255,255,0.5)'; ctx.lineWidth=1;
      for(var li=-1;li<=1;li++){
        ctx.beginPath(); ctx.moveTo(n.x-9,n.y+li*4); ctx.lineTo(n.x+9,n.y+li*4); ctx.stroke();
      }
      // RID label
      ctx.font='bold 9px IBM Plex Mono,monospace'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillStyle=n.failed?'rgba(255,100,100,0.9)':'rgba(255,255,255,0.95)';
      ctx.fillText(n.rid,n.x,n.y-5);
      // Type badge
      ctx.font='7px IBM Plex Mono,monospace';
      ctx.fillStyle=baseCol;
      ctx.fillText(OC_TYPE_LABELS[n.type]||'IR',n.x,n.y+7);
      ctx.restore();
    });
  
    // Area legend
    var legend='';
    var areas=Object.keys(areaNodeMap);
    areas.forEach(function(a){
      var col=OC.areaColors[a]||'#888';
      legend+='<div style="display:flex;align-items:center;gap:4px;font-family:var(--mono);font-size:9px;color:'+col+';background:rgba(0,0,0,0.55);padding:2px 6px;border-radius:4px;border:1px solid '+col+'44">'+
        '<div style="width:8px;height:8px;border-radius:2px;background:'+col+'44;border:1px solid '+col+'88"></div>Area '+a+'</div>';
    });
    var el=document.getElementById('oc-area-legend');
    if(el) el.innerHTML=legend;
  }
  
  // ─── SPF + ROUTING TABLES ─────────────────────────────────
  function ocRunSPF(){
    var results={};
    var liveNodes=OC.nodes.filter(n=>!n.failed);
    liveNodes.forEach(function(src){
      var dist={}, prev={};
      OC.nodes.forEach(n=>{dist[n.id]=Infinity; prev[n.id]=null;});
      dist[src.id]=0;
      var Q=liveNodes.map(n=>n.id).slice();
      while(Q.length){
        Q.sort((a,b)=>dist[a]-dist[b]);
        var u=Q.shift(); if(dist[u]===Infinity) break;
        OC.links.filter(l=>!l.failed&&(l.a===u||l.b===u)).forEach(function(l){
          var v=l.a===u?l.b:l.a;
          var nbNode=OC.nodes.find(n=>n.id===v);
          if(!nbNode||nbNode.failed) return;
          var alt=dist[u]+l.cost;
          if(alt<dist[v]){ dist[v]=alt; prev[v]=u; }
        });
      }
      results[src.id]={dist,prev};
    });
    return results;
  }
  
  function ocBuildSPFAnimSteps(srcId){
    var steps=[];
    var liveNodes=OC.nodes.filter(n=>!n.failed);
    var dist={}, prev={}, visited={};
    OC.nodes.forEach(n=>{dist[n.id]=Infinity; prev[n.id]=null;});
    dist[srcId]=0;
    var Q=liveNodes.map(n=>n.id).slice();
    while(Q.length){
      Q.sort((a,b)=>dist[a]-dist[b]);
      var u=Q.shift(); if(dist[u]===Infinity) break;
      visited[u]=true;
      var relaxed=[], edges=[];
      OC.links.filter(l=>!l.failed&&(l.a===u||l.b===u)).forEach(function(l){
        var v=l.a===u?l.b:l.a;
        var nb=OC.nodes.find(n=>n.id===v); if(!nb||nb.failed) return;
        var alt=dist[u]+l.cost;
        if(alt<dist[v]){ dist[v]=alt; prev[v]=u; relaxed.push({node:v,cost:alt}); }
        if(visited[v]){ edges.push(Math.min(u,v)+'-'+Math.max(u,v)); }
      });
      // collect all SPT edges
      var sptEdges=[];
      Object.keys(prev).forEach(function(id){ if(prev[id]!==null){ sptEdges.push(Math.min(parseInt(id),prev[id])+'-'+Math.max(parseInt(id),prev[id])); }});
      steps.push({settled:u, visited:Object.keys(visited).map(Number), edges:sptEdges, dist:Object.assign({},dist), relaxed:relaxed});
    }
    return steps;
  }
  
  function ocRunSPFAnimation(){
    if(OC.nodes.length<2){ ocLog('<span style="color:var(--amber)">Need at least 2 routers to animate SPF</span>'); return; }
    var src=OC.nodes.find(n=>!n.failed);
    if(!src) return;
    OC.spfAnim.steps=ocBuildSPFAnimSteps(src.id);
    OC.spfAnim.step=0; OC.spfAnim.running=true;
    ocLog('<span style="color:var(--green)">▶ Animating SPF from '+src.rid+'</span>');
    ocRightTab('routes',document.getElementById('oc-rtab-routes'));
    function tick(){
      ocDraw(); ocUpdateRight();
      if(OC.spfAnim.step<OC.spfAnim.steps.length-1){
        OC.spfAnim.step++;
        OC.spfAnim.timer=setTimeout(tick,700);
      } else {
        setTimeout(function(){ OC.spfAnim.running=false; ocDraw(); ocUpdateRight(); ocLog('<span style="color:var(--green)">✓ SPF complete</span>'); },800);
      }
    }
    tick();
  }
  
  // ─── RIGHT PANEL ──────────────────────────────────────────
  function ocUpdateRight(){
    var el=document.getElementById('oc-right-content'); if(!el) return;
    if(OC.activeTab==='routes') ocRenderRoutes(el);
    else if(OC.activeTab==='lsdb') ocRenderLSDB(el);
    else if(OC.activeTab==='config') ocRenderConfig(el);
    else ocRenderLog(el);
  }
  
  function ocRenderRoutes(el){
    if(OC.nodes.length===0){ el.innerHTML='<span style="color:var(--muted)">Add routers and links to compute OSPF routing tables.</span>'; return; }
    var results=ocRunSPF(); var html='';
    var spfStep=OC.spfAnim.running?OC.spfAnim.steps[Math.min(OC.spfAnim.step,OC.spfAnim.steps.length-1)]:null;
    OC.nodes.forEach(function(src){
      if(src.failed) return;
      var col=OC_NODE_COLORS[src.type]||'#3b82f6';
      html+='<div style="margin-bottom:12px;padding:8px;background:var(--bg3);border-radius:8px;border-left:2px solid '+col+'">';
      html+='<div style="font-weight:700;color:'+col+';margin-bottom:5px">'+src.rid+' <span style="font-size:9px;color:var(--muted)">('+src.type+', Area '+src.area+')</span></div>';
      var hasRoute=false;
      OC.nodes.forEach(function(dst){
        if(dst.id===src.id||dst.failed) return;
        var d=results[src.id].dist[dst.id];
        if(d===Infinity){ html+='<div style="color:var(--red);font-size:10px">✗ '+dst.rid+': unreachable</div>'; return; }
        var cur=dst.id, nh=dst.id;
        while(results[src.id].prev[cur]!==null&&results[src.id].prev[cur]!==src.id) cur=results[src.id].prev[cur];
        nh=cur;
        var nhNode=OC.nodes.find(x=>x.id===nh);
        var isNew=spfStep&&spfStep.relaxed&&spfStep.relaxed.find(r=>r.node===dst.id);
        html+='<div style="font-size:10px;color:'+(isNew?'var(--green)':'var(--muted2)')+'">O '+dst.rid+' [110/<span style="color:var(--cyan)">'+d+'</span>] via '+(nhNode?nhNode.rid:'?')+'</div>';
        hasRoute=true;
      });
      if(!hasRoute) html+='<div style="font-size:10px;color:var(--muted)">No neighbors reachable</div>';
      html+='</div>';
    });
    if(OC.spfAnim.running&&spfStep){
      html='<div style="background:rgba(74,222,128,0.08);border:1px solid rgba(74,222,128,0.25);border-radius:8px;padding:8px;margin-bottom:10px;font-size:10px">'+
        '<span style="color:var(--green)">⚡ SPF Step '+(OC.spfAnim.step+1)+'/'+OC.spfAnim.steps.length+'</span> — Settling <span style="color:var(--amber)">'+(OC.nodes.find(n=>n.id===spfStep.settled)||{rid:'?'}).rid+'</span>'+
        '</div>'+html;
    }
    el.innerHTML=html||'<span style="color:var(--muted)">No routes computed yet.</span>';
  }
  
  function ocRenderLSDB(el){
    if(OC.nodes.length===0){ el.innerHTML='<span style="color:var(--muted)">Add routers to populate LSDB.</span>'; return; }
    var html='<div style="font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Link State Database (LSDB)</div>';
    // Type 1 LSAs
    html+='<div style="color:var(--blue);font-size:10px;font-weight:700;margin-bottom:4px">Type 1 — Router LSAs</div>';
    OC.nodes.forEach(function(n){
      var links=OC.links.filter(l=>!l.failed&&(l.a===n.id||l.b===n.id));
      html+='<div style="background:var(--bg3);border-radius:6px;padding:6px 8px;margin-bottom:4px">';
      html+='<div style="font-size:10px"><span style="color:var(--blue)">LSA T1</span> from <span style="color:var(--text);font-weight:700">'+n.rid+'</span> Area <span style="color:var(--amber)">'+n.area+'</span>'+(n.type==='ASBR'?' <span style="color:var(--red)">[E-bit=1 ASBR]</span>':n.type==='ABR'?' <span style="color:var(--amber)">[B-bit=1 ABR]</span>':'')+'</div>';
      links.forEach(function(l){
        var nb=OC.nodes.find(x=>x.id===(l.a===n.id?l.b:l.a));
        if(!nb) return;
        html+='<div style="font-size:9px;color:var(--muted2);padding-left:8px">→ '+nb.rid+' cost='+l.cost+' type=p2p</div>';
      });
      html+='</div>';
    });
    // Type 3 LSAs (inter-area)
    var abrNodes=OC.nodes.filter(n=>n.type==='ABR');
    if(abrNodes.length){
      html+='<div style="color:var(--green);font-size:10px;font-weight:700;margin:8px 0 4px">Type 3 — Summary LSAs (from ABRs)</div>';
      abrNodes.forEach(function(abr){
        var abrAreas=new Set([abr.area]);
        OC.links.filter(l=>l.a===abr.id||l.b===abr.id).forEach(function(l){
          var nb=OC.nodes.find(n=>n.id===(l.a===abr.id?l.b:l.a));
          if(nb) abrAreas.add(nb.area);
        });
        abrAreas.forEach(function(targetArea){
          OC.nodes.filter(n=>n.area!==targetArea&&!n.failed).forEach(function(dst){
            html+='<div style="background:var(--bg3);border-radius:6px;padding:5px 8px;margin-bottom:3px;font-size:9px">';
            html+='<span style="color:var(--green)">LSA T3</span> '+abr.rid+' → Area '+targetArea+' : <span style="color:var(--cyan)">'+dst.rid+'/32</span> [inter-area]</div>';
          });
        });
      });
    }
    // Type 5 LSAs (ASBR)
    var asbrNodes=OC.nodes.filter(n=>n.type==='ASBR');
    if(asbrNodes.length){
      html+='<div style="color:var(--red);font-size:10px;font-weight:700;margin:8px 0 4px">Type 5 — AS External LSAs</div>';
      asbrNodes.forEach(function(asbr){
        html+='<div style="background:var(--bg3);border-radius:6px;padding:5px 8px;margin-bottom:3px;font-size:9px">';
        html+='<span style="color:var(--red)">LSA T5</span> from <span style="color:var(--text)">'+asbr.rid+'</span> : <span style="color:var(--cyan)">0.0.0.0/0</span> E2 metric=1 <span style="color:var(--muted)">(external default)</span></div>';
      });
    }
    el.innerHTML=html;
  }
  
  function ocRenderConfig(el){
    if(OC.nodes.length===0){ el.innerHTML='<span style="color:var(--muted)">Add routers to generate Cisco IOS configuration.</span>'; return; }
    var lines=[];
    OC.nodes.forEach(function(n){
      lines.push('! ── '+n.rid+' ('+n.type+', Area '+n.area+') ──────────');
      lines.push('hostname '+n.rid);
      lines.push('!');
      lines.push('router ospf 1');
      lines.push(' router-id '+n.rid+'.'+n.rid.replace(/\D/g,'')+(n.rid.replace(/\D/g,'').length<2?'.1':'')+'.1');
      if(n.type==='ASBR') lines.push(' redistribute connected subnets');
      // Interfaces
      var ifNum=0;
      OC.links.filter(l=>l.a===n.id||l.b===n.id).forEach(function(l){
        var nb=OC.nodes.find(x=>x.id===(l.a===n.id?l.b:l.a));
        if(!nb) return;
        ifNum++;
        var area=n.area||'0';
        lines.push('!');
        lines.push('interface GigabitEthernet0/'+ifNum);
        lines.push(' description To-'+nb.rid);
        lines.push(' ip address 10.'+n.id+'.'+nb.id+'.1 255.255.255.252');
        lines.push(' ip ospf '+1+' area '+area);
        lines.push(' ip ospf cost '+l.cost);
        lines.push(' no shutdown');
      });
      lines.push('!');
      lines.push('');
    });
    el.innerHTML='<pre style="font-family:var(--mono);font-size:9px;color:var(--cyan);line-height:1.7;white-space:pre-wrap">'+lines.join('\n')+'</pre>'+
      '<button onclick="navigator.clipboard.writeText(document.querySelector(\'#oc-right-content pre\').textContent)" style="margin-top:6px;padding:4px 10px;border-radius:6px;border:1px solid var(--border2);background:transparent;color:var(--muted2);font-family:var(--mono);font-size:10px;cursor:pointer">📋 Copy</button>';
  }
  
  var ocLogEntries=[];
  function ocRenderLog(el){
    el.innerHTML=ocLogEntries.length?ocLogEntries.join(''):'<span style="color:var(--muted)">Event log — actions appear here.</span>';
  }
  function ocLog(msg){
    var t=new Date().toLocaleTimeString();
    ocLogEntries.unshift('<div style="padding:2px 0;border-bottom:1px solid rgba(255,255,255,0.04);font-size:10px"><span style="color:var(--muted)">'+t+'</span> '+msg+'</div>');
    if(ocLogEntries.length>30) ocLogEntries.pop();
    if(OC.activeTab==='log') ocUpdateRight();
  }
  
  function ocExportConfig(){
    var el=document.getElementById('oc-right-content');
    ocRightTab('config',document.getElementById('oc-rtab-config'));
    setTimeout(function(){ var pre=el.querySelector('pre'); if(pre) navigator.clipboard.writeText(pre.textContent); ocLog('<span style="color:var(--green)">Config copied to clipboard</span>'); },100);
  }
  
  function ocLoadPreset(name){
    if(!name) return;
    OC.nodes=[]; OC.links=[]; OC.ridCounter=1; OC.selNode=null; OC.selLink=null;
    var W=document.getElementById('oc-canvas-wrap').clientWidth||600;
    var H=Math.max(380,document.getElementById('oc-canvas-wrap').clientHeight||400);
    document.getElementById('oc-preset-sel').value='';
  
    if(name==='triangle'){
      OC.nodes=[
        {id:1,x:W/2,y:60,rid:'R1',area:'0',type:'IR',failed:false},
        {id:2,x:W/4,y:H-80,rid:'R2',area:'0',type:'IR',failed:false},
        {id:3,x:3*W/4,y:H-80,rid:'R3',area:'0',type:'IR',failed:false}
      ];
      OC.links=[{a:1,b:2,cost:10,failed:false},{a:2,b:3,cost:5,failed:false},{a:1,b:3,cost:20,failed:false}];
      OC.ridCounter=4;
    } else if(name==='hub-spoke'){
      OC.nodes=[
        {id:1,x:W/2,y:H/2,rid:'HUB',area:'0',type:'DR',failed:false},
        {id:2,x:W/4,y:80,rid:'R2',area:'0',type:'IR',failed:false},
        {id:3,x:3*W/4,y:80,rid:'R3',area:'0',type:'IR',failed:false},
        {id:4,x:80,y:H/2,rid:'R4',area:'0',type:'IR',failed:false},
        {id:5,x:W-80,y:H/2,rid:'R5',area:'0',type:'IR',failed:false}
      ];
      OC.links=[{a:1,b:2,cost:5,failed:false},{a:1,b:3,cost:5,failed:false},{a:1,b:4,cost:10,failed:false},{a:1,b:5,cost:10,failed:false}];
      OC.ridCounter=6;
    } else if(name==='ring'){
      var n=5,r=Math.min(W,H)/2-60;
      for(var i=0;i<n;i++) OC.nodes.push({id:i+1,x:W/2+r*Math.cos(2*Math.PI*i/n-Math.PI/2),y:H/2+r*Math.sin(2*Math.PI*i/n-Math.PI/2),rid:'R'+(i+1),area:'0',type:'IR',failed:false});
      for(var i=0;i<n;i++) OC.links.push({a:i+1,b:((i+1)%n)+1,cost:10,failed:false});
      OC.ridCounter=n+1;
    } else if(name==='multi-area'){
      var cx=W/2,cy=H/2;
      OC.nodes=[
        {id:1,x:cx,y:cy-80,rid:'ABR1',area:'0',type:'ABR',failed:false},
        {id:2,x:cx+120,y:cy+40,rid:'ABR2',area:'0',type:'ABR',failed:false},
        {id:3,x:cx-120,y:cy+40,rid:'ABR3',area:'0',type:'ABR',failed:false},
        {id:4,x:cx,y:50,rid:'R4',area:'0',type:'IR',failed:false},
        {id:5,x:cx+200,y:cy-40,rid:'R5',area:'1',type:'IR',failed:false},
        {id:6,x:cx+240,y:cy+80,rid:'R6',area:'1',type:'IR',failed:false},
        {id:7,x:cx-200,y:cy-40,rid:'R7',area:'2',type:'IR',failed:false},
        {id:8,x:cx-220,y:cy+80,rid:'ASBR',area:'2',type:'ASBR',failed:false},
      ];
      OC.links=[
        {a:1,b:2,cost:5,failed:false},{a:2,b:3,cost:5,failed:false},{a:3,b:1,cost:5,failed:false},
        {a:1,b:4,cost:10,failed:false},
        {a:2,b:5,cost:10,failed:false},{a:2,b:6,cost:15,failed:false},{a:5,b:6,cost:5,failed:false},
        {a:3,b:7,cost:10,failed:false},{a:3,b:8,cost:15,failed:false},{a:7,b:8,cost:5,failed:false},
      ];
      OC.ridCounter=9;
    } else if(name==='redundant'){
      var cx=W/2,cy=H/2;
      OC.nodes=[
        {id:1,x:cx-160,y:cy-80,rid:'CORE1',area:'0',type:'IR',failed:false},
        {id:2,x:cx+160,y:cy-80,rid:'CORE2',area:'0',type:'IR',failed:false},
        {id:3,x:cx-160,y:cy+80,rid:'DIST1',area:'0',type:'IR',failed:false},
        {id:4,x:cx+160,y:cy+80,rid:'DIST2',area:'0',type:'IR',failed:false},
        {id:5,x:cx-280,y:cy,rid:'ACCESS1',area:'0',type:'IR',failed:false},
        {id:6,x:cx+280,y:cy,rid:'ACCESS2',area:'0',type:'IR',failed:false},
      ];
      OC.links=[
        {a:1,b:2,cost:1,failed:false},{a:3,b:4,cost:1,failed:false},
        {a:1,b:3,cost:4,failed:false},{a:2,b:4,cost:4,failed:false},
        {a:1,b:4,cost:5,failed:false},{a:2,b:3,cost:5,failed:false},
        {a:3,b:5,cost:10,failed:false},{a:4,b:6,cost:10,failed:false},
      ];
      OC.ridCounter=7;
    } else if(name==='stub'){
      var cx=W/2,cy=H/2;
      OC.nodes=[
        {id:1,x:cx-120,y:cy,rid:'ABR',area:'0',type:'ABR',failed:false},
        {id:2,x:cx-280,y:cy,rid:'CORE',area:'0',type:'IR',failed:false},
        {id:3,x:cx+80,y:cy-60,rid:'STUB1',area:'1',type:'IR',failed:false},
        {id:4,x:cx+80,y:cy+60,rid:'STUB2',area:'1',type:'IR',failed:false},
        {id:5,x:cx+220,y:cy,rid:'STUB3',area:'1',type:'IR',failed:false},
      ];
      OC.links=[
        {a:1,b:2,cost:10,failed:false},
        {a:1,b:3,cost:5,failed:false},{a:1,b:4,cost:5,failed:false},
        {a:3,b:5,cost:10,failed:false},{a:4,b:5,cost:10,failed:false},
      ];
      OC.ridCounter=6;
    }
  
    ocAutoSetABR();
    ocLog('<span style="color:var(--blue)">Loaded preset: '+name+'</span>');
    ocUpdateRight(); ocDraw();
    document.getElementById('oc-hint').textContent='Preset loaded — select a tool to edit';
  }
  
  function ocClear(){
    OC.nodes=[]; OC.links=[]; OC.ridCounter=1; OC.selNode=null; OC.selLink=null;
    OC.spfAnim.running=false; clearTimeout(OC.spfAnim.timer);
    ocUpdateSelPanel(); ocUpdateRight(); ocDraw();
    ocLog('Canvas cleared');
  }
  
  
  
  // ═══════════════════════════════════════════════════════════
  // MPLS LABEL STACK WALKER
  // ═══════════════════════════════════════════════════════════
  var MPLS = { topo:null, step:0, playing:false, timer:null, speed:900 };
  var MPLS_TOPOS = {
    basic: {
      name:'Basic 3-hop LSP',
      nodes:['CE-A','PE1','P1','PE2','CE-B'],
      coords:[{x:60},{x:170},{x:295},{x:420},{x:530}],
      steps:[
        {node:0,op:'IP',  label:[],              stack:[],          action:'IP packet originated. No MPLS labels.',detail:'CE-A sends IP packet (src 10.1.1.1, dst 10.2.2.2). It has a default route pointing to PE1.',lfib:'(not an LSR)'},
        {node:1,op:'PUSH', label:[16003],        stack:[16003],     action:'LER: PUSH label 16003 (FEC: 10.2.2.0/24)',detail:'PE1 is the ingress LER. It looks up the destination 10.2.2.0/24 in its LFIB, assigns label 16003 and pushes it. Packet now has label stack: [16003].',lfib:'In: IP fwd 10.2.2.0/24\nOut: PUSH 16003 → P1 (Gi0/1)'},
        {node:2,op:'SWAP', label:[16003,16008],  stack:[16008],     action:'LSR: SWAP 16003 → 16008',detail:'P1 receives label 16003. Looks up in LFIB: swap 16003 for 16008 and forward to PE2. Label 16003 is removed, 16008 pushed.',lfib:'In:  label 16003\nOut: SWAP 16008 → PE2 (Gi0/2)'},
        {node:3,op:'POP',  label:[16008],        stack:[],          action:'PHP: POP label 16008 (penultimate hop)',detail:'PE2 performs Penultimate Hop Popping (PHP). It removes the last label before forwarding to CE-B, so CE-B receives a pure IP packet. This reduces processing at the egress PE.',lfib:'In:  label 16008\nOut: POP → CE-B (Gi1/0) [PHP]'},
        {node:4,op:'IP',   label:[],             stack:[],          action:'Pure IP packet delivered to CE-B',detail:'CE-B receives the IP packet with no MPLS labels. The LSP is complete. Total labels swapped: 2 (PE1→P1→PE2).',lfib:'(not an LSR)'}
      ]
    },
    vpn: {
      name:'MPLS L3VPN',
      nodes:['CE-A','PE1','P-Core','PE2','CE-B'],
      coords:[{x:60},{x:170},{x:295},{x:420},{x:530}],
      steps:[
        {node:0,op:'IP',   label:[],                  stack:[],          action:'VPN customer IP packet',detail:'CE-A (VPN customer) sends packet to 192.168.2.10. PE1 is the provider edge for VRF CUSTOMER-A.',lfib:'(customer router)'},
        {node:1,op:'PUSH', label:[16005,100],          stack:[100,16005], action:'PE1: PUSH inner VPN label 100 + outer transport label 16005',detail:'PE1 looks up 192.168.2.10 in VRF CUSTOMER-A. Finds route via remote PE2, with VPN label 100. Then adds transport label 16005 (LSP to PE2). Stack: [inner:100, outer:16005].',lfib:'VRF CUSTOMER-A: 192.168.2.0/24\nPUSH VPN=100, TRANSPORT=16005\nOut → P-Core Gi0/0'},
        {node:2,op:'SWAP', label:[16005,100],          stack:[100,16003], action:'P-Core: SWAP outer transport label 16005 → 16003',detail:'P-Core only sees the outer transport label (16005). It swaps to 16003 and forwards. The inner VPN label 100 is invisible to core nodes — only PE-to-PE.',lfib:'In:  label 16005 (outer)\nOut: SWAP 16003 → PE2 Gi0/1\n(inner VPN label untouched)'},
        {node:3,op:'POP',  label:[16003,100],          stack:[100],       action:'PE2: POP outer transport label (PHP), process inner VPN label 100',detail:'PE2 first pops the transport label (PHP). Then it processes inner label 100: looks up in its VRF mapping — label 100 belongs to VRF CUSTOMER-A on interface Gi1/0 toward CE-B.',lfib:'In:  label 16003 (transport, PHP)\ninner 100 → VRF CUSTOMER-A\n→ CE-B Gi1/0'},
        {node:4,op:'IP',   label:[],                  stack:[],          action:'CE-B receives native IP packet in its VRF',detail:'CE-B receives the original IP packet. The MPLS VPN was completely transparent — CE-B sees a normal IP packet from 192.168.1.10.',lfib:'(customer router)'}
      ]
    },
    penultimate: {
      name:'Penultimate Hop Pop',
      nodes:['Ingress','LSR-1','LSR-2 (PHP)','Egress'],
      coords:[{x:80},{x:210},{x:350},{x:480}],
      steps:[
        {node:0,op:'IP',   label:[],       stack:[],      action:'IP packet entering MPLS network',detail:'Packet enters the MPLS network at the ingress LER.',lfib:'(IP ingress)'},
        {node:1,op:'PUSH', label:[16010],  stack:[16010], action:'PUSH label 16010',detail:'Ingress LER pushes label 16010 for destination prefix.',lfib:'In: IP 10.0.0.0/8\nOut: PUSH 16010 → LSR-1'},
        {node:2,op:'SWAP', label:[16010],  stack:[3],     action:'LSR-2 SWAP 16010 → label 3 (implicit null)',detail:'LSR-2 is the penultimate hop. It swaps 16010 for label 3 (Implicit NULL = signal PHP to next hop). The egress will pop without needing a separate POP operation.',lfib:'In:  16010\nOut: SWAP 3 (implicit null)\n→ Egress [PHP signal]'},
        {node:3,op:'POP',  label:[3],      stack:[],      action:'Egress pops label 3, routes as IP',detail:'Egress sees label 3 (Implicit NULL). It pops and performs IP lookup. PHP saved one lookup — egress did not need to check "is this my label?" first.',lfib:'In:  label 3 (implicit null)\nAction: POP → IP lookup\n→ 10.0.0.x next-hop'}
      ]
    },
    stackrsvp: {
      name:'RSVP-TE Tunnel',
      nodes:['Head-End','R2','R3 (bypass)','R4','Tail-End'],
      coords:[{x:60},{x:170},{x:295},{x:420},{x:530}],
      steps:[
        {node:0,op:'PUSH', label:[16100],      stack:[16100],       action:'PUSH RSVP-TE tunnel label 16100',detail:'Head-end router pushes RSVP-TE LSP label 16100. This label was signaled by RSVP PATH message with ERO specifying exact path.',lfib:'RSVP LSP to Tail-End\nBandwidth: 100 Mbps reserved\nPUSH 16100 → R2 Gi0/0'},
        {node:1,op:'SWAP', label:[16100],      stack:[16050],       action:'R2: SWAP 16100 → 16050',detail:'R2 swaps to next tunnel label. It also has a pre-computed FRR bypass tunnel ready — if Gi0/1 (toward R4) fails, it immediately uses bypass via R3.',lfib:'In:  16100\nOut: SWAP 16050 → R4 Gi0/1\nFRR backup: SWAP 16099 → R3 (bypass)'},
        {node:2,op:'SWAP', label:[16099],      stack:[16050],       action:'FRR bypass via R3 (link R2→R4 failed)',detail:'Simulating FRR: R2→R4 link failed. R2 immediately (sub-50ms) switches to bypass tunnel via R3. R3 does not need RSVP state — it just swaps the bypass label.',lfib:'In:  16099 (bypass label)\nOut: SWAP 16050 → R4 Gi0/2\n[bypass tunnel, no per-LSP state]'},
        {node:3,op:'SWAP', label:[16050],      stack:[16001],       action:'R4: SWAP 16050 → 16001',detail:'R4 resumes normal LSP forwarding (merge point). Swaps to final hop label.',lfib:'In:  16050\nOut: SWAP 16001 → Tail-End\n[FRR merge point]'},
        {node:4,op:'POP',  label:[16001],      stack:[],            action:'Tail-End pops label, delivers IP',detail:'Tail-end LER pops the RSVP-TE label and routes the packet normally. LSP complete with FRR protection demonstrated.',lfib:'In:  16001\nOut: POP → IP route\n→ destination network'}
      ]
    }
  };
  
  function mplsInit() { mplsLoadTopo('basic'); }
  function mplsLoadTopo(name) {
    MPLS.topo = MPLS_TOPOS[name] || MPLS_TOPOS.basic;
    MPLS.step = 0; mplsStopPlay();
    mplsRenderTimeline(); mplsRenderStep(); mplsDrawTopo();
  }
  function mplsReset() { MPLS.step=0; mplsStopPlay(); mplsRenderTimeline(); mplsRenderStep(); mplsDrawTopo(); }
  function mplsStep(dir) { var ns=MPLS.step+dir; if(ns<0||ns>=MPLS.topo.steps.length) return; MPLS.step=ns; mplsStopPlay(); mplsRenderTimeline(); mplsRenderStep(); mplsDrawTopo(); }
  function mplsTogglePlay() {
    MPLS.playing=!MPLS.playing;
    document.getElementById('mpls-play-btn').innerHTML=MPLS.playing?'&#9646;&#9646;':'&#9654;';
    if(MPLS.playing) mplsPlayNext();
  }
  function mplsStopPlay() { MPLS.playing=false; clearTimeout(MPLS.timer); document.getElementById('mpls-play-btn').innerHTML='&#9654;'; }
  function mplsPlayNext() {
    if(!MPLS.playing) return;
    if(MPLS.step>=MPLS.topo.steps.length-1){ mplsStopPlay(); return; }
    MPLS.step++; mplsRenderTimeline(); mplsRenderStep(); mplsDrawTopo();
    MPLS.timer=setTimeout(mplsPlayNext, parseInt(document.getElementById('mpls-speed').value)||900);
  }
  
  function mplsRenderStep() {
    var s=MPLS.topo.steps[MPLS.step];
    // Stack visualization
    var opColors={PUSH:'#22c55e',SWAP:'#f59e0b',POP:'#ec4899',IP:'#3b82f6'};
    var stackHtml='';
    s.stack.forEach(function(lbl,i){
      stackHtml+='<div style="background:rgba(59,130,246,0.2);border:2px solid #3b82f6;border-radius:8px;padding:8px 20px;font-family:var(--mono);font-size:14px;font-weight:700;color:#3b82f6;text-align:center;min-width:80px">';
      stackHtml+='<div style="font-size:9px;color:var(--muted);margin-bottom:2px">'+(i===0?'TOP':'inner')+'</div>'+lbl+'</div>';
    });
    if(!s.stack.length) stackHtml='<div style="font-family:var(--mono);font-size:12px;color:var(--muted);padding:16px">No MPLS labels (native IP)</div>';
    document.getElementById('mpls-stack-vis').innerHTML=stackHtml;
    // Op badge + detail
    var col=opColors[s.op]||'#888';
    document.getElementById('mpls-hop-detail').innerHTML=
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">'+
      '<span style="background:'+col+'22;border:1.5px solid '+col+';color:'+col+';font-family:var(--mono);font-weight:800;font-size:14px;padding:5px 16px;border-radius:20px">'+s.op+'</span>'+
      '<span style="font-family:var(--mono);font-size:12px;color:var(--text);font-weight:600">'+s.action+'</span></div>'+
      '<div style="font-family:var(--mono);font-size:11px;line-height:1.9;color:var(--muted2)">'+s.detail+'</div>';
    // LFIB
    document.getElementById('mpls-lfib').innerHTML=s.lfib||'—';
  }
  
  function mplsRenderTimeline() {
    var html='';
    MPLS.topo.steps.forEach(function(s,i){
      var active=i===MPLS.step, past=i<MPLS.step;
      var col={PUSH:'#22c55e',SWAP:'#f59e0b',POP:'#ec4899',IP:'#3b82f6'}[s.op]||'#888';
      html+='<div onclick="MPLS.step='+i+';mplsRenderTimeline();mplsRenderStep();mplsDrawTopo()" style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:8px;cursor:pointer;background:'+(active?'rgba(59,130,246,0.1)':'transparent')+';border:1px solid '+(active?'rgba(59,130,246,0.4)':'transparent')+'">'+
        '<div style="width:28px;height:28px;border-radius:50%;background:'+(active?col:past?'#555':'#333')+';display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-size:10px;font-weight:700;color:#fff;flex-shrink:0">'+(active?'●':past?'✓':i+1)+'</div>'+
        '<div style="flex:1"><div style="font-family:var(--mono);font-size:10px;font-weight:600;color:'+(active?'var(--text)':'var(--muted2)')+'">'+(MPLS.topo.nodes[s.node]||'?')+'</div>'+
        '<div style="font-family:var(--mono);font-size:9px;color:var(--muted)">'+s.op+(s.label.length?' ['+s.label.join(', ')+']':'')+'</div></div></div>';
    });
    document.getElementById('mpls-timeline').innerHTML=html;
  }
  
  function mplsDrawTopo() {
    var svg=document.getElementById('mpls-topo-svg');
    if(!svg) return;
    var t=MPLS.topo, W=560, H=200, nodeR=26;
    var html='<defs><marker id="ma" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M2 2L8 5L2 8" fill="none" stroke="context-stroke" stroke-width="1.5"/></marker></defs>';
    var y=H/2;
    // edges
    var nodes=t.nodes, coords=t.coords;
    for(var i=0;i<nodes.length-1;i++){
      var x1=coords[i].x, x2=coords[i+1].x;
      var active=i<=MPLS.step;
      html+='<line x1="'+(x1+nodeR)+'" y1="'+y+'" x2="'+(x2-nodeR)+'" y2="'+y+'" stroke="'+(active?'#3b82f6':'#555')+'" stroke-width="'+(active?2.5:1.5)+'" marker-end="url(#ma)"/>';
    }
    // packet indicator
    var curStep=MPLS.topo.steps[MPLS.step];
    var px=coords[curStep.node].x, py=y;
    html+='<circle cx="'+px+'" cy="'+(py-42)+'" r="10" fill="#f59e0b" opacity="0.9"/>';
    html+='<text x="'+px+'" y="'+(py-38)+'" text-anchor="middle" dominant-baseline="central" font-family="var(--mono)" font-size="9" fill="#000" font-weight="700">PKT</text>';
    // nodes
    nodes.forEach(function(name,i){
      var active=i===curStep.node, past=i<curStep.node;
      var col=active?'#3b82f6':past?'#1e3a5f':'#333';
      var tc=active?'#fff':'#aaa';
      html+='<rect x="'+(coords[i].x-nodeR)+'" y="'+(y-nodeR)+'" width="'+(nodeR*2)+'" height="'+(nodeR*2)+'" rx="6" fill="'+col+'" stroke="'+(active?'#60a5fa':'#555')+'" stroke-width="'+(active?2:1)+'"/>';
      html+='<text x="'+coords[i].x+'" y="'+y+'" text-anchor="middle" dominant-baseline="central" font-family="var(--mono)" font-size="9" font-weight="700" fill="'+tc+'">'+name.replace('PE','PE\n')+'</text>';
      html+='<text x="'+coords[i].x+'" y="'+(y+nodeR+14)+'" text-anchor="middle" font-family="var(--mono)" font-size="8" fill="#666">'+name+'</text>';
    });
    svg.innerHTML=html;
  }
  
  
  // ═══════════════════════════════════════════════════════════
  // TUNNEL ENCAPSULATION BUILDER
  // ═══════════════════════════════════════════════════════════
  var TB_TYPE='ipip';
  var TB_DEFS = {
    ipip:{name:'IP-in-IP (RFC 2003)',overhead:20,layers:[
      {n:'Outer IPv4 Header',bytes:20,color:'#3b82f6',fields:[{f:'Version',v:'4'},{f:'IHL',v:'5 (20 bytes)'},{f:'Protocol',v:'4 (IP-in-IP)'},{f:'Source IP',v:'TUNNEL_SRC'},{f:'Destination IP',v:'TUNNEL_DST'},{f:'TTL',v:'64'}]},
      {n:'Inner IPv4 Header',bytes:20,color:'#6366f1',fields:[{f:'Version',v:'4'},{f:'Protocol',v:'6 (TCP) / 17 (UDP)'},{f:'Source IP',v:'INNER_SRC'},{f:'Destination IP',v:'INNER_DST'}]},
      {n:'Payload',bytes:0,color:'#374151',fields:[{f:'Application data',v:'variable'}]}
    ],info:'Simplest tunnel — just adds an outer IP header. No encryption. Protocol 4 in outer IP header signals IP-in-IP. Used for: test tunnels, protocol independence.'},
    gre:{name:'GRE (RFC 2784)',overhead:24,layers:[
      {n:'Outer IPv4 Header',bytes:20,color:'#3b82f6',fields:[{f:'Protocol',v:'47 (GRE)'},{f:'Source',v:'TUNNEL_SRC'},{f:'Destination',v:'TUNNEL_DST'}]},
      {n:'GRE Header',bytes:4,color:'#f59e0b',fields:[{f:'Flags',v:'0x0000'},{f:'Protocol Type',v:'0x0800 (IPv4) / 0x86DD (IPv6) / 0x8100 (VLAN)'},{f:'Optional: Key',v:'4 bytes (if K=1)'},{f:'Optional: Seq',v:'4 bytes (if S=1)'}]},
      {n:'Inner Payload',bytes:0,color:'#374151',fields:[{f:'Any L3 protocol',v:'IPv4, IPv6, MPLS, etc.'}]}
    ],info:'GRE can encapsulate ANY L3 protocol — not just IP. Protocol 47 in outer header. Used for: non-IP tunnels, Cisco DMVPN, multicast over unicast-only WAN.'},
    ipsec:{name:'IPSec ESP Tunnel Mode',overhead:66,layers:[
      {n:'Outer IPv4 Header',bytes:20,color:'#3b82f6',fields:[{f:'Protocol',v:'50 (ESP)'},{f:'Source',v:'TUNNEL_SRC'},{f:'Destination',v:'TUNNEL_DST'}]},
      {n:'ESP Header',bytes:8,color:'#ef4444',fields:[{f:'SPI',v:'4 bytes (Security Parameter Index)'},{f:'Sequence Number',v:'4 bytes (anti-replay)'}]},
      {n:'IV (AES-CBC)',bytes:16,color:'#dc2626',fields:[{f:'Initialization Vector',v:'16 bytes (random per packet)'}]},
      {n:'Encrypted payload',bytes:0,color:'#374151',fields:[{f:'Inner IPv4 header + data',v:'[ENCRYPTED]'},{f:'ESP Trailer',v:'padding + next-header'},{f:'ICV (SHA-256)',v:'16 bytes integrity check'}]}
    ],info:'ESP tunnel mode encrypts AND authenticates the entire inner packet. Protocol 50. Requires IKE negotiation first. CANNOT traverse NAT without NAT-T (UDP 4500 wrapper).'},
    vxlan:{name:'VXLAN (RFC 7348)',overhead:50,layers:[
      {n:'Outer Ethernet',bytes:14,color:'#7c3aed',fields:[{f:'Src MAC',v:'VTEP_SRC_MAC'},{f:'Dst MAC',v:'VTEP_DST_MAC'},{f:'EtherType',v:'0x0800 (IPv4)'}]},
      {n:'Outer IPv4',bytes:20,color:'#3b82f6',fields:[{f:'Source IP',v:'VTEP_SRC'},{f:'Destination IP',v:'VTEP_DST (unicast or multicast)'},{f:'Protocol',v:'17 (UDP)'}]},
      {n:'Outer UDP',bytes:8,color:'#2563eb',fields:[{f:'Source Port',v:'hash of inner header (entropy)'},{f:'Destination Port',v:'4789 (VXLAN)'},{f:'Length',v:'payload + 8'}]},
      {n:'VXLAN Header',bytes:8,color:'#0891b2',fields:[{f:'Flags',v:'0x08000000 (I-flag set)'},{f:'VNI',v:'24-bit Virtual Network ID (16M segments)'},{f:'Reserved',v:'8 bits'}]},
      {n:'Inner Ethernet',bytes:14,color:'#374151',fields:[{f:'Original L2 frame',v:'preserved completely'}]}
    ],info:'VXLAN extends L2 over L3. 24-bit VNI = 16M segments (vs 4096 VLANs). UDP encap means it works over any IP network. Used for: data center fabric, VM mobility, multi-tenant cloud.'},
    mpls:{name:'MPLS L3VPN',overhead:30,layers:[
      {n:'Outer IP Header',bytes:20,color:'#3b82f6',fields:[{f:'Protocol',v:'17 (UDP) or routing'},{f:'Source',v:'PE_SRC'},{f:'Destination',v:'PE_DST'}]},
      {n:'Transport Label',bytes:4,color:'#f59e0b',fields:[{f:'Label',v:'16003 (32 bits total)'},{f:'TC bits',v:'3 bits (QoS marking)'},{f:'S-bit',v:'0 (not bottom of stack)'},{f:'TTL',v:'8 bits'}]},
      {n:'VPN Label',bytes:4,color:'#22c55e',fields:[{f:'Label',v:'100 (VRF identifier)'},{f:'S-bit',v:'1 (bottom of stack)'},{f:'TC',v:'3 bits (inherited from CE)'}]},
      {n:'Inner IP + Payload',bytes:0,color:'#374151',fields:[{f:'Customer IP packet',v:'unmodified (private address OK)'}]}
    ],info:'MPLS VPN uses 2-label stack. Outer = transport LSP label (PE-to-PE). Inner = VPN label (identifies the VRF/customer). Core P routers only see transport label — customer prefixes invisible to core.'},
    srv6:{name:'SRv6 (RFC 8754)',overhead:80,layers:[
      {n:'Outer IPv6 Header',bytes:40,color:'#3b82f6',fields:[{f:'Version',v:'6'},{f:'Next Header',v:'43 (Routing Extension Header)'},{f:'Source',v:'SRC_NODE_SID'},{f:'Destination',v:'CURRENT_ACTIVE_SID (changes per hop)'}]},
      {n:'SRH (Routing Hdr)',bytes:24,color:'#8b5cf6',fields:[{f:'Next Header',v:'41 (IPv6) or 4 (IPv4)'},{f:'Hdr Ext Length',v:'variable'},{f:'Routing Type',v:'4 (SRH)'},{f:'Segments Left',v:'counter decremented at each SID endpoint'},{f:'Last Entry',v:'index of last SID in list'},{f:'Segment List[0]',v:'End SID of node 3'},{f:'Segment List[1]',v:'End SID of node 2'}]},
      {n:'Inner payload',bytes:0,color:'#374151',fields:[{f:'Original IP packet',v:'IPv4 or IPv6'}]}
    ],info:'SRv6 encodes the segment list directly in IPv6 Extension Header. No MPLS needed. Each SID is a full 128-bit IPv6 address. SRv6 works natively over IPv6 internet. Higher overhead than SR-MPLS but more flexible.'}
  };
  
  var TB_ACTIVE_LAYER=-1;
  function tbSet(t,btn){
    TB_TYPE=t; TB_ACTIVE_LAYER=-1;
    document.querySelectorAll('.tool-pill[id^="tb-"]').forEach(b=>b.classList.remove('active'));
    if(btn) btn.classList.add('active');
    tbRender();
  }
  function tbRender(){
    var d=TB_DEFS[TB_TYPE]; if(!d) return;
    var src=document.getElementById('tb-src').value||'10.1.1.1';
    var dst=document.getElementById('tb-dst').value||'10.2.2.2';
    var payload=parseInt(document.getElementById('tb-payload').value)||1000;
    // Build packet visualization
    var html='<div style="display:flex;flex-direction:column;gap:3px">';
    d.layers.forEach(function(l,i){
      var active=i===TB_ACTIVE_LAYER;
      var bytes=l.bytes||payload;
      var barlabel=l.bytes?l.bytes+' B':'~'+payload+' B';
      html+='<div onclick="tbSelectLayer('+i+')" style="border-radius:8px;padding:10px 14px;background:'+l.color+(active?'dd':'44')+';border:2px solid '+l.color+(active?'':'66')+';cursor:pointer;transition:all .15s;display:flex;align-items:center;justify-content:space-between">'+
        '<div style="font-family:var(--mono);font-weight:700;font-size:12px;color:#fff">'+l.n+'</div>'+
        '<div style="font-family:var(--mono);font-size:11px;color:rgba(255,255,255,0.75)">'+barlabel+'</div></div>';
    });
    html+='</div>';
    document.getElementById('tb-packet-vis').innerHTML=html;
    // Overhead
    var total=d.overhead+payload;
    var pct=Math.round(d.overhead/total*100);
    document.getElementById('tb-overhead').innerHTML=
      '<div style="font-family:var(--mono);font-size:11px;line-height:2">'+
      '<div style="display:flex;justify-content:space-between"><span style="color:var(--muted2)">Payload</span><span>'+payload+' bytes</span></div>'+
      '<div style="display:flex;justify-content:space-between"><span style="color:var(--red)">Tunnel overhead</span><span style="color:var(--red)">'+d.overhead+' bytes</span></div>'+
      '<div style="display:flex;justify-content:space-between;border-top:1px solid var(--border);padding-top:4px;font-weight:700"><span>Total wire size</span><span>'+total+' bytes</span></div>'+
      '<div style="margin-top:8px;height:10px;background:var(--bg3);border-radius:5px;overflow:hidden"><div style="height:100%;width:'+pct+'%;background:var(--red);border-radius:5px"></div></div>'+
      '<div style="font-size:10px;color:var(--muted)">'+pct+'% overhead | Effective MTU for inner payload: '+(1500-d.overhead)+' bytes</div>'+
      '</div>';
    // Info
    document.getElementById('tb-info').innerHTML='<div style="color:var(--muted2)">'+d.info+'</div>';
    tbSelectLayer(0);
  }
  function tbSelectLayer(i){
    TB_ACTIVE_LAYER=i;
    var d=TB_DEFS[TB_TYPE]; if(!d||!d.layers[i]) return;
    var l=d.layers[i];
    var html='<div style="color:'+l.color+';font-weight:700;margin-bottom:10px">'+l.n+'</div>';
    l.fields.forEach(function(f){
      html+='<div style="display:flex;gap:10px;padding:5px 0;border-bottom:1px solid var(--border)"><span style="color:var(--muted2);min-width:160px">'+f.f+'</span><span style="color:var(--text)">'+f.v+'</span></div>';
    });
    document.getElementById('tb-layer-detail').innerHTML=html;
    tbRender();
  }
  
  // ═══════════════════════════════════════════════════════════
  // BGP HIJACK SIMULATOR
  // ═══════════════════════════════════════════════════════════
  var HJ = { type:'exact', step:-1, playing:false, timer:null };
  var HJ_SCENARIOS = {
    exact:{
      title:'Exact-prefix BGP hijack',
      nodes:[{id:'victim',x:280,y:60,label:'AS 65001\nVictim',color:'#22c55e'},{id:'isp1',x:100,y:170,label:'AS 100\nISP-1',color:'#3b82f6'},{id:'isp2',x:460,y:170,label:'AS 200\nISP-2',color:'#3b82f6'},{id:'attacker',x:280,y:280,label:'AS 666\nAttacker',color:'#ef4444'},{id:'user',x:460,y:60,label:'AS 300\nUser',color:'#888'}],
      edges:[[0,1],[0,2],[1,3],[2,3],[0,4],[2,4]],
      prefix:'192.168.1.0/24',
      steps:[
        {explain:'Normal state: AS 65001 (victim) advertises 192.168.1.0/24 legitimately. AS 300 (user) correctly sends traffic to AS 65001 via AS 200.',active:[],traffic:['user→isp2','isp2→victim'],tables:'AS 300 routing: 192.168.1.0/24 via AS 200 → AS 65001 ✓'},
        {explain:'Attack begins: AS 666 (attacker) originates the same prefix 192.168.1.0/24 with a forged BGP UPDATE. ISP-1 and ISP-2 receive two paths for the same prefix.',active:['attacker→isp1','attacker→isp2'],traffic:[],tables:'AS 100: sees 192.168.1.0/24 from AS 65001 AND from AS 666\nAS 200: sees 192.168.1.0/24 from AS 65001 AND from AS 666'},
        {explain:'BGP path selection: With SAME prefix length, path selection runs. If AS 666 has shorter AS-PATH or higher Local-Pref at ISP, it may WIN. ISP-1 prefers attacker path.',active:['attacker→isp1'],traffic:[],tables:'AS 100 selects: 192.168.1.0/24 via AS 666 (shorter AS-PATH!)\nAS 200 still selects: 192.168.1.0/24 via AS 65001'},
        {explain:'Traffic misdirection: Traffic from AS 300 and anyone using ISP-1 now goes to the ATTACKER, not the victim. AS 666 can inspect, modify, or drop the traffic (man-in-the-middle).',active:[],traffic:['user→isp2','isp2→victim','isp1→attacker'],tables:'AS 300 → AS 200 → AS 65001 (victim) ✓ (ISP-2 path intact)\nISP-1 customers → AS 666 (attacker) ✗ HIJACKED'},
        {explain:'RPKI Protection: If AS 65001 had published an ROA (Route Origin Authorization) for 192.168.1.0/24 with origin AS 65001, any router doing route origin validation would REJECT AS 666\'s announcement.',active:[],traffic:['user→isp2','isp2→victim'],tables:'ROA: 192.168.1.0/24 maxLength 24, origin AS 65001\nAS 666 origin validation: INVALID → route REJECTED\nNormal routing restored ✓'}
      ],
      prevention:'• Publish RPKI ROA for all your prefixes\n• Use BGP maximum-prefix on peerings\n• Subscribe to BGP monitoring (Cloudflare Radar, RIPE stat)\n• Peer with Internet exchanges for visibility\n• Use AS-PATH filters: deny routes with your own ASN'
    },
    specific:{
      title:'More-specific prefix hijack',
      nodes:[{id:'victim',x:280,y:60,label:'AS 65001\nVictim',color:'#22c55e'},{id:'isp1',x:100,y:170,label:'AS 100\nISP',color:'#3b82f6'},{id:'attacker',x:460,y:170,label:'AS 666\nAttacker',color:'#ef4444'},{id:'user',x:280,y:290,label:'AS 300\nUser',color:'#888'}],
      edges:[[0,1],[0,3],[1,2],[1,3],[2,3]],
      prefix:'10.0.0.0/8',
      steps:[
        {explain:'Victim AS 65001 advertises 10.0.0.0/8 (a /8 summarized prefix). All traffic destined to any 10.x.x.x address goes to the victim.',active:[],traffic:['user→isp1','isp1→victim'],tables:'All ASes: 10.0.0.0/8 via AS 65001 ✓'},
        {explain:'Attacker hijack: AS 666 announces a more-specific: 10.1.0.0/16. This is a subset of the victim\'s /8. BGP ALWAYS prefers longer (more-specific) prefix.',active:['attacker→isp1'],traffic:[],tables:'ISP receives: 10.0.0.0/8 via AS 65001\nISP receives: 10.1.0.0/16 via AS 666\nLongest match: /16 wins for 10.1.x.x'},
        {explain:'Selective hijack: Traffic to 10.1.0.0/16 goes to attacker. Traffic to all other 10.x.x.x goes to victim. Difficult to detect — victim sees no traffic loss on most of their /8.',active:[],traffic:['user→attacker','isp1→victim'],tables:'10.1.0.0/16 → AS 666 (HIJACKED) ✗\n10.0.0.0/8 (other ranges) → AS 65001 ✓\nPartial hijack — victim may not notice quickly!'},
        {explain:'RPKI with maxLength: Victim publishes ROA: prefix 10.0.0.0/8, maxLength /16, origin AS 65001. This explicitly allows more-specifics — but ONLY from AS 65001.',active:[],traffic:['user→isp1','isp1→victim'],tables:'ROA: 10.0.0.0/8, maxLength=/16, origin=AS65001\nAS 666 announces /16 with origin AS 666 → INVALID\nTraffic restored to victim ✓'}
      ],
      prevention:'• Use RPKI ROA with appropriate maxLength\n• Be specific: /8 with maxLength /24 allows any more-specific from YOUR AS only\n• Avoid advertising overly broad aggregates\n• Implement BGP Monitoring to detect sub-prefix announcements'
    },
    leak:{
      title:'Route leak',
      nodes:[{id:'customerA',x:120,y:60,label:'AS 100\nCustomer A',color:'#22c55e'},{id:'provider',x:280,y:170,label:'AS 200\nProvider',color:'#3b82f6'},{id:'customerB',x:460,y:60,label:'AS 300\nCustomer B',color:'#22c55e'},{id:'transit',x:280,y:290,label:'AS 400\nTransit',color:'#888'}],
      edges:[[0,1],[1,2],[1,3],[0,3]],
      prefix:'Customer routes',
      steps:[
        {explain:'Normal: Provider AS 200 has both customers. Customer A (AS 100) sends its routes to the provider. Customer B (AS 300) sends its routes to the provider. Provider routes traffic between them.',active:[],traffic:['customerA→provider','customerB→provider'],tables:'AS 200: learns AS 100 customer routes\nAS 200: learns AS 300 customer routes\nNormal customer-provider relationships'},
        {explain:'Route leak origin: AS 100 accidentally re-advertises routes learned from AS 200 (provider routes) to AS 400 (transit). This violates the customer-provider relationship.',active:['customerA→transit'],traffic:[],tables:'AS 100 sends to AS 400: "I can reach AS 300 via AS 200"\nAS 400 may prefer this as a shorter path!\nAS 100 has become an unwanted transit'},
        {explain:'Traffic through the leak: AS 400 sends traffic for AS 300 via AS 100, which passes it to AS 200. AS 100 is now carrying provider traffic — overloading a customer link not designed for it.',active:[],traffic:['transit→customerA','customerA→provider','provider→customerB'],tables:'AS 400: uses AS 100 as transit to AS 300 ✗\nAS 100 link congested — not designed for transit traffic\nAS 200 loses revenue on traffic going around them'},
        {explain:'Prevention: BGP communities can mark routes. "no-export" community prevents propagation. Route-maps can filter: only advertise your OWN prefixes to transit/provider peers.',active:[],traffic:['customerA→provider','customerB→provider'],tables:'Fix 1: AS 100 applies "no-export" to all received routes\nFix 2: AS 100 uses prefix-filter: only own /24s to AS 400\nFix 3: AS 200 uses BGP communities (Route Leak Prevention RFC 9234)'}
      ],
      prevention:'• Apply "no-export" community to all routes received from providers\n• Use explicit prefix-lists: only advertise your own prefixes to transit\n• Implement BGP Role (RFC 9234) for provider/customer marking\n• Monitor BGP announcements for unexpected transit traffic'
    },
    rpki:{
      title:'RPKI protection demonstration',
      nodes:[{id:'legit',x:160,y:80,label:'AS 65001\nLegit Owner',color:'#22c55e'},{id:'rpki',x:400,y:80,label:'RPKI\nRepository',color:'#6366f1'},{id:'isp',x:160,y:230,label:'AS 100\nISP (RPKI-valid)',color:'#3b82f6'},{id:'attacker',x:400,y:230,label:'AS 666\nAttacker',color:'#ef4444'}],
      edges:[[0,2],[0,1],[3,2],[1,2]],
      prefix:'203.0.113.0/24',
      steps:[
        {explain:'Setup: AS 65001 owns 203.0.113.0/24. They publish an ROA (Route Origin Authorization) to the RPKI repository: prefix=203.0.113.0/24, maxLength=24, AS=65001.',active:['legit→rpki'],traffic:[],tables:'ROA published:\nPrefix: 203.0.113.0/24\nMax length: /24\nOrigin AS: 65001\nSigned by: AS 65001 (ARIN/RIPE resource cert)'},
        {explain:'Normal advertisement: AS 65001 advertises 203.0.113.0/24. ISP validates: ROA exists, origin AS matches → VALID. Route accepted and preferred.',active:['legit→isp'],traffic:[],tables:'AS 65001 → ISP: 203.0.113.0/24 AS-PATH: 65001\nRPKI check: ROA found, origin AS 65001 matches → VALID ✓\nRoute accepted, installed in BGP table'},
        {explain:'Attack attempt: AS 666 tries to hijack by originating 203.0.113.0/24. ISP does RPKI validation: prefix exists in ROA but origin AS 666 doesn\'t match ROA origin AS 65001.',active:['attacker→isp'],traffic:[],tables:'AS 666 → ISP: 203.0.113.0/24 AS-PATH: 666\nRPKI check: ROA found, origin AS 666 ≠ ROA AS 65001 → INVALID ✗\nRoute DROPPED by ISP — never enters BGP table!'},
        {explain:'Result: RPKI-validating routers reject the attacker\'s route. Traffic continues flowing correctly to AS 65001. RPKI ROV (Route Origin Validation) is the most effective BGP hijack defense available today.',active:[],traffic:['legit→isp'],tables:'AS 65001 route: VALID → installed\nAS 666 route: INVALID → dropped\nProtection: route-map rpki-policy deny INVALID\nbgp rpki server 10.0.0.1 port 3323 refresh 600'}
      ],
      prevention:'• Enable RPKI on all BGP routers (free via Cloudflare/RIPE validator)\n• Publish ROAs for ALL your IP blocks\n• Start with "prefer valid" mode before "drop invalid"\n• Check: https://rpki.cloudflare.com\n• bgp rpki server <validator-ip> port 3323'
    }
  };
  
  function hijackInit() { hjSetType('exact', null); }
  function hjSetType(t, btn) {
    HJ.type=t; HJ.step=-1; clearTimeout(HJ.timer); HJ.playing=false;
    document.getElementById('hj-play-btn').innerHTML='&#9654;';
    document.querySelectorAll('.tool-pill[id^="hj-"]').forEach(b=>b.classList.remove('active'));
    if(btn) btn.classList.add('active');
    else { var b=document.getElementById('hj-'+t); if(b) b.classList.add('active'); }
    hjRenderTimeline(); hjRenderStep(); hjDrawSVG();
  }
  function hjReset(){ HJ.step=-1; clearTimeout(HJ.timer); HJ.playing=false; document.getElementById('hj-play-btn').innerHTML='&#9654;'; hjRenderTimeline(); hjRenderStep(); hjDrawSVG(); }
  function hjStep(dir){ var sc=HJ_SCENARIOS[HJ.type]; if(!sc) return; var ns=HJ.step+dir; if(ns<0||ns>=sc.steps.length) return; HJ.step=ns; clearTimeout(HJ.timer); HJ.playing=false; document.getElementById('hj-play-btn').innerHTML='&#9654;'; hjRenderTimeline(); hjRenderStep(); hjDrawSVG(); }
  function hjTogglePlay(){
    var sc=HJ_SCENARIOS[HJ.type]; if(!sc) return;
    HJ.playing=!HJ.playing;
    document.getElementById('hj-play-btn').innerHTML=HJ.playing?'&#9646;&#9646;':'&#9654;';
    if(HJ.playing){ if(HJ.step>=sc.steps.length-1){ HJ.step=-1; } hjPlayNext(); }
  }
  function hjPlayNext(){
    if(!HJ.playing) return;
    var sc=HJ_SCENARIOS[HJ.type];
    if(HJ.step>=sc.steps.length-1){ HJ.playing=false; document.getElementById('hj-play-btn').innerHTML='&#9654;'; return; }
    HJ.step++;
    hjRenderTimeline(); hjRenderStep(); hjDrawSVG();
    HJ.timer=setTimeout(hjPlayNext,1400);
  }
  function hjRenderTimeline(){
    var sc=HJ_SCENARIOS[HJ.type]; if(!sc) return;
    var html='';
    sc.steps.forEach(function(s,i){
      var active=i===HJ.step;
      html+='<div onclick="HJ.step='+i+';hjRenderTimeline();hjRenderStep();hjDrawSVG()" style="display:flex;gap:8px;padding:8px 10px;border-radius:8px;cursor:pointer;background:'+(active?'rgba(59,130,246,0.1)':'transparent')+';border:1px solid '+(active?'rgba(59,130,246,0.4)':'transparent')+';margin-bottom:3px">'+
        '<div style="width:20px;height:20px;border-radius:50%;background:'+(active?'#3b82f6':i<HJ.step?'#555':'#333')+';display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-size:9px;color:#fff;flex-shrink:0">'+(i+1)+'</div>'+
        '<div style="font-family:var(--mono);font-size:10px;color:'+(active?'var(--text)':'var(--muted2)')+';line-height:1.5">'+(s.explain.substring(0,60))+'…</div></div>';
    });
    document.getElementById('hj-timeline').innerHTML=html;
    var sc2=HJ_SCENARIOS[HJ.type];
    document.getElementById('hj-prevention').innerHTML='<div style="color:var(--green)">'+sc2.prevention.replace(/\n/g,'<br>')+'</div>';
  }
  function hjRenderStep(){
    var sc=HJ_SCENARIOS[HJ.type]; if(!sc) return;
    if(HJ.step<0){ document.getElementById('hj-explanation').textContent='Press play or use step buttons to walk through the scenario.'; document.getElementById('hj-tables').textContent='—'; return; }
    var s=sc.steps[HJ.step];
    document.getElementById('hj-explanation').innerHTML='<span style="color:var(--amber);font-weight:700">Step '+(HJ.step+1)+' / '+sc.steps.length+'</span><br><br>'+s.explain;
    document.getElementById('hj-tables').innerHTML=s.tables.replace(/\n/g,'<br>').replace(/✓/g,'<span style="color:var(--green)">✓</span>').replace(/✗/g,'<span style="color:var(--red)">✗</span>');
  }
  function hjDrawSVG(){
    var sc=HJ_SCENARIOS[HJ.type]; if(!sc) return;
    var svg=document.getElementById('hj-svg'); if(!svg) return;
    var html='<defs><marker id="hja" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M2 2L8 5L2 8" fill="none" stroke="context-stroke" stroke-width="1.5"/></marker></defs>';
    var step=HJ.step>=0?sc.steps[HJ.step]:null;
    var activeEdges=step?step.active:[];
    var trafficEdges=step?step.traffic:[];
    // draw edges
    sc.edges.forEach(function(e){
      var a=sc.nodes[e[0]], b=sc.nodes[e[1]];
      var edgeId=a.id+'→'+b.id, edgeIdR=b.id+'→'+a.id;
      var isActive=activeEdges.indexOf(edgeId)>-1||activeEdges.indexOf(edgeIdR)>-1;
      var isTraffic=trafficEdges.indexOf(edgeId)>-1||trafficEdges.indexOf(edgeIdR)>-1;
      var col=isTraffic?'#f59e0b':isActive?'#ef4444':'#555';
      var w=isTraffic||isActive?2.5:1;
      html+='<line x1="'+a.x+'" y1="'+a.y+'" x2="'+b.x+'" y2="'+b.y+'" stroke="'+col+'" stroke-width="'+w+'" marker-end="url(#hja)" opacity="'+(isTraffic||isActive?1:0.4)+'"/>';
    });
    // nodes
    sc.nodes.forEach(function(n){
      var isActive=step&&(step.active.some(function(e){ return e.startsWith(n.id)||e.endsWith(n.id); })||step.traffic.some(function(e){ return e.startsWith(n.id)||e.endsWith(n.id); }));
      var r=28;
      html+='<circle cx="'+n.x+'" cy="'+n.y+'" r="'+r+'" fill="'+n.color+(isActive?'dd':'44')+'" stroke="'+n.color+'" stroke-width="'+(isActive?3:1.5)+'" opacity="'+(isActive?1:0.7)+'"/>';
      var lines=n.label.split('\n');
      lines.forEach(function(l,i){ html+='<text x="'+n.x+'" y="'+(n.y-5+(i*13))+'" text-anchor="middle" dominant-baseline="central" font-family="var(--mono)" font-size="9" font-weight="700" fill="#fff">'+l+'</text>'; });
    });
    // prefix label
    html+='<text x="280" y="20" text-anchor="middle" font-family="var(--mono)" font-size="11" fill="#888">Prefix under attack: '+sc.prefix+'</text>';
    svg.innerHTML=html;
  }
  
  
  // ═══════════════════════════════════════════════════════════
  // ROUTE TABLE PARSER + LPM
  // ═══════════════════════════════════════════════════════════
  var RP_ROUTES=[];
  var RP_SAMPLES = {
    ospf:`Gateway of last resort is 10.0.0.1 to network 0.0.0.0
  O*E2  0.0.0.0/0 [110/1] via 10.0.0.1, 01:23:45, GigabitEthernet0/0
        10.0.0.0/8 is variably subnetted, 6 subnets, 2 masks
  C        10.0.0.0/30 is directly connected, GigabitEthernet0/0
  L        10.0.0.2/32 is directly connected, GigabitEthernet0/0
  O        10.1.1.0/24 [110/20] via 10.0.0.1, 00:01:23, GigabitEthernet0/0
  O        10.2.2.0/24 [110/30] via 10.0.0.1, 00:01:23, GigabitEthernet0/0
  O IA     10.3.3.0/24 [110/40] via 10.0.0.1, 00:00:45, GigabitEthernet0/0
  O E2     172.16.0.0/16 [110/20] via 10.0.0.1, 00:00:12, GigabitEthernet0/0
        192.168.1.0/24 is variably subnetted, 2 subnets, 2 masks
  C        192.168.1.0/30 is directly connected, GigabitEthernet0/1
  L        192.168.1.1/32 is directly connected, GigabitEthernet0/1`,
    bgp:`BGP table version is 42, local router ID is 1.1.1.1
  Status codes: s suppressed, d damped, h history, * valid, > best, i - internal
       Network          Next Hop            Metric LocPrf Weight Path
   *>  10.0.0.0/8       192.168.1.2              0    100      0 65002 i
   *>  172.16.0.0/12    192.168.1.2              0    100      0 65002 65003 i
   *>i 10.1.0.0/24      192.168.2.1              0    200      0 i
   *   192.168.0.0      10.0.0.1                 0             0 65004 i
   *>  192.168.0.0      10.0.0.2                 0             0 65005 i
   *>  0.0.0.0/0        10.0.0.1                             0 65001 i`,
    mixed:`Codes: C - connected, S - static, R - RIP, M - mobile, B - BGP
         D - EIGRP, EX - EIGRP external, O - OSPF, IA - OSPF inter area
         N1 - OSPF NSSA external type 1, N2 - OSPF NSSA external type 2
         E1 - OSPF external type 1, E2 - OSPF external type 2
         i - IS-IS, su - IS-IS summary, L1 - IS-IS level-1, L2 - IS-IS level-2
  Gateway of last resort is 203.0.113.1 to network 0.0.0.0
  B*    0.0.0.0/0 [20/0] via 203.0.113.1, 1d02h
        10.0.0.0/8 is variably subnetted
  C     10.10.0.0/24 is directly connected, GigabitEthernet0/0
  L     10.10.0.1/32 is directly connected, GigabitEthernet0/0
  O     10.20.0.0/24 [110/20] via 10.10.0.2, 00:45:12, GigabitEthernet0/0
  D     10.30.0.0/24 [90/3072] via 10.10.0.3, 00:30:00, GigabitEthernet0/1
  D EX  10.40.0.0/24 [170/3072] via 10.10.0.3, 00:30:00, GigabitEthernet0/1
  S     172.16.0.0/16 [1/0] via 203.0.113.1
  B     203.0.113.0/24 [20/0] via 203.0.113.1, 1d02h`
  };
  function rpLoadSample(t){ document.getElementById('rp-input').value=RP_SAMPLES[t]||''; rpParse(); }
  function rpClear(){ document.getElementById('rp-input').value=''; RP_ROUTES=[]; document.getElementById('rp-parsed-table').innerHTML=''; document.getElementById('rp-stats').textContent='Paste a routing table to analyze.'; document.getElementById('rp-proto-breakdown').innerHTML=''; document.getElementById('rp-anomalies').textContent='—'; document.getElementById('rp-lpm-result').innerHTML=''; }
  
  var PROTO_INFO={
    C:{name:'Connected',ad:0,color:'#22c55e',desc:'Directly attached interface network'},
    L:{name:'Local',ad:0,color:'#22c55e',desc:'Exact address of local interface'},
    S:{name:'Static',ad:1,color:'#6366f1',desc:'Manually configured route'},
    O:{name:'OSPF',ad:110,color:'#3b82f6',desc:'OSPF intra-area route'},
    'O IA':{name:'OSPF Inter-Area',ad:110,color:'#2563eb',desc:'OSPF Type 3 LSA (Summary)'},
    'O E2':{name:'OSPF External T2',ad:110,color:'#1d4ed8',desc:'Redistributed external, fixed metric'},
    'O E1':{name:'OSPF External T1',ad:110,color:'#1d4ed8',desc:'Redistributed external, cumulative metric'},
    'O*E2':{name:'OSPF Default (E2)',ad:110,color:'#1d4ed8',desc:'OSPF external default route'},
    'B':{name:'BGP',ad:20,color:'#f59e0b',desc:'eBGP route (AD 20)'},
    'B*':{name:'BGP Default',ad:20,color:'#f59e0b',desc:'BGP default route'},
    'D':{name:'EIGRP',ad:90,color:'#8b5cf6',desc:'EIGRP internal route'},
    'D EX':{name:'EIGRP External',ad:170,color:'#7c3aed',desc:'Redistributed into EIGRP'},
    'R':{name:'RIP',ad:120,color:'#ef4444',desc:'RIP route'}
  };
  
  function rpParse(){
    var lines=document.getElementById('rp-input').value.split('\n');
    RP_ROUTES=[];
    var routeRe=/^\s*([A-Z*][A-Z0-9 ]*?)\s+([\d.:\/]+(?:\/\d+)?)\s+(?:\[(\d+)\/(\d+)\])?\s*(?:via\s+([\d.]+))?/;
    var connRe=/^\s*(C|L)\s+([\d.]+\/\d+)\s+is directly connected,\s+(\S+)/;
    lines.forEach(function(line){
      var m=line.match(connRe);
      if(m){ RP_ROUTES.push({proto:m[1],prefix:m[2],ad:0,metric:0,nh:'directly connected',iface:m[3],raw:line.trim()}); return; }
      m=line.match(routeRe);
      if(m&&m[2]&&m[2].indexOf('/')>-1){
        var proto=m[1].trim(); var pi=PROTO_INFO[proto]||{ad:parseInt(m[3])||0};
        RP_ROUTES.push({proto:proto,prefix:m[2],ad:parseInt(m[3])||pi.ad,metric:parseInt(m[4])||0,nh:m[5]||'',raw:line.trim()});
      }
    });
    rpRenderTable(); rpRenderStats(); rpLookup();
  }
  function rpRenderTable(){
    if(!RP_ROUTES.length){ document.getElementById('rp-parsed-table').innerHTML='<div style="font-family:var(--mono);font-size:11px;color:var(--muted);padding:16px">No routes parsed. Check input format.</div>'; return; }
    var html='<table style="width:100%;border-collapse:collapse;font-family:var(--mono);font-size:11px">';
    html+='<tr style="border-bottom:2px solid var(--border)"><th style="text-align:left;padding:6px 8px;color:var(--muted)">Proto</th><th style="text-align:left;padding:6px 8px;color:var(--muted)">Prefix</th><th style="text-align:right;padding:6px 8px;color:var(--muted)">AD</th><th style="text-align:right;padding:6px 8px;color:var(--muted)">Metric</th><th style="text-align:left;padding:6px 8px;color:var(--muted)">Next-Hop</th></tr>';
    RP_ROUTES.forEach(function(r){
      var pi=PROTO_INFO[r.proto]||{color:'#888',name:r.proto};
      html+='<tr style="border-bottom:1px solid var(--border)">'+
        '<td style="padding:5px 8px"><span style="background:'+pi.color+'22;color:'+pi.color+';border:1px solid '+pi.color+'44;border-radius:4px;padding:1px 6px;font-size:10px">'+r.proto+'</span></td>'+
        '<td style="padding:5px 8px;color:var(--text);font-weight:600">'+r.prefix+'</td>'+
        '<td style="padding:5px 8px;text-align:right;color:var(--muted2)">'+r.ad+'</td>'+
        '<td style="padding:5px 8px;text-align:right;color:var(--muted2)">'+r.metric+'</td>'+
        '<td style="padding:5px 8px;color:var(--muted2)">'+r.nh+'</td></tr>';
    });
    html+='</table>';
    document.getElementById('rp-parsed-table').innerHTML=html;
  }
  function rpRenderStats(){
    var total=RP_ROUTES.length, protos={};
    RP_ROUTES.forEach(function(r){ protos[r.proto]=(protos[r.proto]||0)+1; });
    document.getElementById('rp-stats').innerHTML=
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">'+
      '<div style="background:var(--bg3);border-radius:8px;padding:10px;text-align:center"><div style="font-size:22px;font-weight:700;color:var(--text)">'+total+'</div><div style="font-size:10px;color:var(--muted)">Total routes</div></div>'+
      '<div style="background:var(--bg3);border-radius:8px;padding:10px;text-align:center"><div style="font-size:22px;font-weight:700;color:var(--text)">'+Object.keys(protos).length+'</div><div style="font-size:10px;color:var(--muted)">Protocols</div></div>'+
      '</div>';
    var pbHtml='';
    Object.keys(protos).forEach(function(p){
      var pi=PROTO_INFO[p]||{color:'#888',name:p};
      var pct=Math.round(protos[p]/total*100);
      pbHtml+='<div style="margin-bottom:8px"><div style="display:flex;justify-content:space-between;font-family:var(--mono);font-size:10px;color:var(--muted2);margin-bottom:3px"><span style="color:'+pi.color+'">'+p+' ('+pi.name+')</span><span>'+protos[p]+' ('+pct+'%)</span></div>'+
        '<div style="height:8px;background:var(--bg3);border-radius:4px"><div style="height:100%;width:'+pct+'%;background:'+pi.color+';border-radius:4px"></div></div></div>';
    });
    document.getElementById('rp-proto-breakdown').innerHTML=pbHtml;
    // Anomalies
    var anom=[];
    RP_ROUTES.forEach(function(r){ if(r.ad===170) anom.push('<span style="color:var(--amber)">'+r.prefix+'</span> — EIGRP External (AD 170, redistributed route)'); });
    RP_ROUTES.forEach(function(r){ if(r.ad===20) anom.push('<span style="color:var(--amber)">'+r.prefix+'</span> — eBGP route (AD 20, verify no iBGP mismatch)'); });
    document.getElementById('rp-anomalies').innerHTML=anom.length?anom.join('<br>'):'No anomalies detected ✓';
  }
  function rpLookup(){
    var q=document.getElementById('rp-lookup').value.trim(); if(!q||!RP_ROUTES.length){ document.getElementById('rp-lpm-result').innerHTML=''; return; }
    var qn=ipToNum(q);
    var best=null, bestLen=-1;
    RP_ROUTES.forEach(function(r){
      var parts=r.prefix.split('/'); if(parts.length<2) return;
      var net=ipToNum(parts[0]), len=parseInt(parts[1]);
      var mask=(0xffffffff<<(32-len))>>>0;
      if((qn&mask)===net && len>bestLen){ best=r; bestLen=len; }
    });
    if(!best){ document.getElementById('rp-lpm-result').innerHTML='<span style="color:var(--red)">No route found for '+q+'</span>'; return; }
    var pi=PROTO_INFO[best.proto]||{color:'#22c55e',name:best.proto};
    document.getElementById('rp-lpm-result').innerHTML='<div style="background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.3);border-radius:8px;padding:10px 14px">'+
      '<div style="font-weight:700;color:#22c55e;margin-bottom:4px">LPM match: '+best.prefix+'</div>'+
      '<div style="font-family:var(--mono);font-size:10px;line-height:1.9;color:var(--muted2)">Protocol: <span style="color:'+pi.color+'">'+best.proto+' ('+pi.name+')</span><br>Next-hop: '+best.nh+'<br>AD/Metric: '+best.ad+'/'+best.metric+'</div></div>';
  }
  function ipToNum(ip){ var p=ip.split('.'); if(p.length!==4) return 0; return ((+p[0]<<24)|(+p[1]<<16)|(+p[2]<<8)|(+p[3]))>>>0; }
  
  // ═══════════════════════════════════════════════════════════
  // SHOW COMMAND INTERPRETER
  // ═══════════════════════════════════════════════════════════
  var SI_PATTERNS=[
    {name:'show ip ospf neighbor',re:/Neighbor ID.*Dead Time|State.*DR|State.*FULL/i,parser:siParseOspfNbr},
    {name:'show bgp summary',re:/BGP router identifier|Neighbor.*AS.*MsgRcvd|State.*Up.*Down.*InQ/i,parser:siParseBgpSum},
    {name:'show ip eigrp topology',re:/EIGRP-IPv4 Topology|Codes:.*P.*Active|Composite metric/i,parser:siParseEigrpTop},
    {name:'show isis neighbors',re:/IS-IS.*Neighbor|System Id.*Interface.*State/i,parser:siParseIsisNbr},
    {name:'show mpls forwarding',re:/Local.*Out.*Prefix.*Next Hop|Outgoing.*Prefix|label.*tag/i,parser:siParseMpls}
  ];
  var SI_SAMPLES = {
    'ospf-nbr':`Neighbor ID     Pri   State           Dead Time   Address         Interface
  1.1.1.1           1   FULL/DR         00:00:34    192.168.1.1     GigabitEthernet0/0
  2.2.2.2           1   FULL/BDR        00:00:39    192.168.1.2     GigabitEthernet0/0
  3.3.3.3           1   2WAY/DROTHER    00:00:36    192.168.1.3     GigabitEthernet0/0
  4.4.4.4           0   INIT/-          00:00:31    10.0.0.4        GigabitEthernet0/1`,
    'bgp-sum':`BGP router identifier 1.1.1.1, local AS number 65001
  BGP table version is 42, main routing table version 42
  Neighbor        V           AS MsgRcvd MsgSent   TblVer  InQ OutQ Up/Down  State/PfxRcd
  192.168.1.2     4        65002    1234    1200       42    0    0 1d02h          15
  192.168.1.3     4        65003     100     120       42    0    0 02:30:00        8
  10.0.0.1        4        65001      45      50       42    0    0 00:15:00       22
  10.0.0.2        4        65001       0       0        0    0    0 00:01:00 Active`,
    'eigrp-top':`EIGRP-IPv4 Topology Table for AS(1)/ID(1.1.1.1)
  Codes: P - Passive, A - Active, U - Update, Q - Query, R - Reply,
         r - reply Status, s - sia Status
  P 10.1.0.0/24, 1 successors, FD is 3072
          via 10.0.0.2 (3072/2816), GigabitEthernet0/0
  P 10.2.0.0/24, 1 successors, FD is 5120
          via 10.0.0.2 (5120/4864), GigabitEthernet0/0
          via 10.0.0.3 (6144/4864), GigabitEthernet0/1
  A 10.3.0.0/24, 1 successors, FD is Inaccessible
          via 10.0.0.4 (Inaccessible/Inaccessible)`,
    'isis-nbr':`IS-IS Level-1 Link State Database
  System Id       Interface   L  State        Holdtime  SNPA
  0100.0000.0002  Gi0/0      1  UP           29        aabb.ccdd.0001
  0100.0000.0003  Gi0/1      2  UP           27        aabb.ccdd.0002
  0100.0000.0004  Gi0/2      1  INIT         28        aabb.ccdd.0003`,
    'mpls-lfib':`Local      Outgoing   Prefix           Bytes Label   Outgoing   Next Hop
  Label      Label      or Tunnel Id   Switched         interface
  16000      Pop Label  1.1.1.1/32       0           Gi0/0      10.0.0.1
  16001      16008      10.1.0.0/24    45234         Gi0/1      10.0.1.1
  16002      16012      10.2.0.0/24    12890         Gi0/1      10.0.1.1
  16003      No Label   172.16.0.0/12      0         Gi0/2      10.0.2.1`
  };
  
  function siLoad(n){ document.getElementById('si-input').value=SI_SAMPLES[n]||''; siParse(); }
  function siParse(){
    var txt=document.getElementById('si-input').value;
    if(!txt.trim()){ document.getElementById('si-cmd-detected').textContent='—'; return; }
    var matched=null;
    for(var i=0;i<SI_PATTERNS.length;i++){ if(SI_PATTERNS[i].re.test(txt)){ matched=SI_PATTERNS[i]; break; } }
    if(!matched){ document.getElementById('si-cmd-detected').textContent='Unknown — paste a supported show output'; document.getElementById('si-field-explain').textContent='Could not detect command type.'; return; }
    document.getElementById('si-cmd-detected').textContent=matched.name;
    matched.parser(txt);
  }
  function siField(k,v,note,anomaly){ return '<div style="padding:6px 0;border-bottom:1px solid var(--border)"><div style="display:flex;gap:8px"><span style="color:var(--muted2);min-width:180px;flex-shrink:0">'+k+'</span><span style="color:var(--text);font-weight:600">'+v+'</span></div>'+(note?'<div style="font-size:10px;color:var(--muted);margin-top:2px;padding-left:188px">'+note+'</div>':'')+(anomaly?'<div style="font-size:10px;color:var(--red);margin-top:2px;padding-left:188px">⚠ '+anomaly+'</div>':'')+'</div>'; }
  function siParseOspfNbr(txt){
    var lines=txt.split('\n').filter(l=>/\d+\.\d+\.\d+\.\d+/.test(l)&&!/^Neighbor/.test(l));
    var anomalies=[], html='';
    lines.forEach(function(l){
      var p=l.trim().split(/\s+/);
      var id=p[0],pri=p[1],state=p[2],dead=p[3],addr=p[4],iface=p[5]||'';
      var anom='';
      if(state.startsWith('INIT')) anom='INIT = one-way communication. Check L1/L2, hello mismatch, or MTU issue.';
      if(state.startsWith('2WAY')) anom='2WAY/DROTHER = DROther adjacency. Normal for non-DR/BDR pairs.';
      if(state.startsWith('EXSTART')) anom='EXSTART = stuck. Most likely MTU mismatch. Add ip ospf mtu-ignore.';
      html+=siField('Neighbor: '+id,'State: '+state+' ('+dead+')','Interface: '+iface+' | Address: '+addr+' | Priority: '+pri,anom);
      if(anom) anomalies.push(id+': '+anom);
    });
    document.getElementById('si-field-explain').innerHTML=html||'No neighbors found.';
    document.getElementById('si-anomalies').innerHTML=anomalies.length?anomalies.map(a=>'<div style="color:var(--red);padding:3px 0">⚠ '+a+'</div>').join(''):'No anomalies detected ✓';
    document.getElementById('si-next-cmds').innerHTML='show ip ospf interface detail<br>debug ip ospf hello<br>show ip ospf neighbor detail<br>show ip ospf database';
  }
  function siParseBgpSum(txt){
    var lines=txt.split('\n').filter(l=>/^\d+\.\d+\.\d+\.\d+/.test(l.trim()));
    var anomalies=[], html='';
    lines.forEach(function(l){
      var p=l.trim().split(/\s+/);
      var nbr=p[0],v=p[1],as=p[2],rcvd=p[3],sent=p[4],tbl=p[5],updown=p[7],state=p[8];
      var anom='';
      if(state==='Active') anom='Active = TCP connection failed. Check reachability, ACLs, port 179.';
      if(state==='Idle') anom='Idle = BGP not started or in backoff. Check neighbor config.';
      if(rcvd==='0') anom='No messages received — session may be new or stalled.';
      html+=siField('Neighbor: '+nbr,'AS '+as+' | Up/Down: '+updown+' | Prefixes: '+(state||'?'),'Messages: rcvd='+rcvd+' sent='+sent,anom);
      if(anom) anomalies.push(nbr+': '+anom);
    });
    document.getElementById('si-field-explain').innerHTML=html||'No BGP neighbors found.';
    document.getElementById('si-anomalies').innerHTML=anomalies.length?anomalies.map(a=>'<div style="color:var(--red);padding:3px 0">⚠ '+a+'</div>').join(''):'All sessions established ✓';
    document.getElementById('si-next-cmds').innerHTML='show bgp neighbors X<br>show bgp neighbors X advertised-routes<br>show bgp neighbors X received-routes<br>debug ip bgp X events';
  }
  function siParseEigrpTop(txt){
    var lines=txt.split('\n');
    var routes=[], cur=null, anomalies=[], html='';
    lines.forEach(function(l){
      var m=l.match(/^([PA])\s+([\d.\/]+),\s+(\d+) successor/);
      if(m){ if(cur) routes.push(cur); cur={state:m[1],prefix:m[2],succs:m[3],paths:[]}; return; }
      var m2=l.match(/via ([\d.]+) \((\S+)\/(\S+)\)/);
      if(m2&&cur) cur.paths.push({nh:m2[1],fd:m2[2],rd:m2[3]});
    });
    if(cur) routes.push(cur);
    routes.forEach(function(r){
      var anom='';
      if(r.state==='A') anom='ACTIVE = Stuck-in-Active risk! No Feasible Successor found. Sending Queries.';
      if(r.paths.length>1){ var fs=r.paths.slice(1).map(p=>'FS via '+p.nh+' RD='+p.rd); anom=(anom?anom+' | ':'')+'Feasible Successors: '+fs.join(', '); }
      html+=siField((r.state==='A'?'⚠ ':'✓ ')+r.prefix,'State: '+(r.state==='P'?'Passive (stable)':'ACTIVE')+' | Successors: '+r.succs,r.paths.map(p=>'via '+p.nh+' FD='+p.fd+' RD='+p.rd).join(' | '),r.state==='A'?anom:'');
      if(r.state==='A') anomalies.push(r.prefix+': ACTIVE — '+anom);
    });
    document.getElementById('si-field-explain').innerHTML=html||'No routes parsed.';
    document.getElementById('si-anomalies').innerHTML=anomalies.length?anomalies.map(a=>'<div style="color:var(--red);padding:3px 0">⚠ '+a+'</div>').join(''):'All routes Passive (stable) ✓';
    document.getElementById('si-next-cmds').innerHTML='show ip eigrp topology active<br>show ip eigrp topology all-links<br>debug eigrp packets query reply<br>show ip eigrp neighbors';
  }
  function siParseIsisNbr(txt){
    var lines=txt.split('\n').filter(l=>/\d{4}\.\d{4}\.\d{4}/.test(l));
    var anomalies=[], html='';
    lines.forEach(function(l){
      var p=l.trim().split(/\s+/);
      var sysid=p[0],iface=p[1],level=p[2],state=p[3],hold=p[4];
      var anom='';
      if(state==='INIT') anom='INIT = one-way. Check area ID (L1), authentication, IIH being received.';
      if(state==='DOWN') anom='DOWN = no IIH received. Check cable, interface, IS-IS enabled on interface.';
      html+=siField('System: '+sysid,'L'+level+' | State: '+state+' | Hold: '+hold,'Interface: '+iface,anom);
      if(anom) anomalies.push(sysid+': '+anom);
    });
    document.getElementById('si-field-explain').innerHTML=html||'No IS-IS neighbors.';
    document.getElementById('si-anomalies').innerHTML=anomalies.length?anomalies.map(a=>'<div style="color:var(--red);padding:3px 0">⚠ '+a+'</div>').join(''):'All adjacencies UP ✓';
    document.getElementById('si-next-cmds').innerHTML='show isis neighbors detail<br>debug isis adj-packets<br>show clns neighbors<br>show isis database';
  }
  function siParseMpls(txt){
    var lines=txt.split('\n').filter(l=>/^\d+/.test(l.trim()));
    var html='', anomalies=[];
    lines.forEach(function(l){
      var p=l.trim().split(/\s+/);
      var lbl=p[0],out=p[1],prefix=p[2],bytes=p[3],iface=p[4]||'',nh=p[5]||'';
      var anom='';
      if(out==='No') anom='No outgoing label — this is the egress LER, routing by IP.';
      if(out==='Pop') anom='PHP (Penultimate Hop Pop) — next hop is egress LER.';
      html+=siField('Label: '+lbl,'Op: '+out+' → '+prefix,'Interface: '+iface+' | Next-hop: '+nh+' | Bytes: '+bytes,anom);
    });
    document.getElementById('si-field-explain').innerHTML=html||'No LFIB entries found.';
    document.getElementById('si-anomalies').innerHTML='No anomalies detected ✓';
    document.getElementById('si-next-cmds').innerHTML='show mpls forwarding-table detail<br>show mpls ldp neighbor<br>show mpls traffic-eng tunnels<br>traceroute mpls ipv4 <prefix>';
  }
  
  
  // ═══════════════════════════════════════════════════════════
  // CONVERGENCE CALCULATOR
  // ═══════════════════════════════════════════════════════════
  var CC_PROTO='ospf';
  var CC_VALS={
    ospf:{helloInterval:10,deadInterval:40,spfInitialDelay:50,spfMinDelay:200,spfMaxDelay:5000,lsaMinArrival:1000,lsaRefresh:30000,ribInstall:50,fibProgram:10},
    bgp:{keepalive:60,holdTime:180,connectRetry:120,minRouteAdv:30,ribInstall:100,fibProgram:15},
    eigrp:{helloInterval:5,holdTime:15,queryDelay:100,activeTime:180000,ribInstall:30,fibProgram:10},
    bfd:{txInterval:300,rxInterval:300,multiplier:3,ribInstall:20,fibProgram:5}
  };
  var CC_PRESETS={
    default:{ospf:{helloInterval:10,deadInterval:40,spfInitialDelay:50,spfMinDelay:200,spfMaxDelay:5000,lsaMinArrival:1000,lsaRefresh:30000,ribInstall:50,fibProgram:10},bgp:{keepalive:60,holdTime:180,connectRetry:120,minRouteAdv:30,ribInstall:100,fibProgram:15},eigrp:{helloInterval:5,holdTime:15,queryDelay:100,activeTime:180000,ribInstall:30,fibProgram:10},bfd:{txInterval:300,rxInterval:300,multiplier:3,ribInstall:20,fibProgram:5}},
    fast:{ospf:{helloInterval:1,deadInterval:3,spfInitialDelay:50,spfMinDelay:100,spfMaxDelay:1000,lsaMinArrival:100,lsaRefresh:30000,ribInstall:30,fibProgram:5},bgp:{keepalive:3,holdTime:9,connectRetry:30,minRouteAdv:1,ribInstall:50,fibProgram:10},eigrp:{helloInterval:1,holdTime:3,queryDelay:50,activeTime:60000,ribInstall:20,fibProgram:5},bfd:{txInterval:100,rxInterval:100,multiplier:3,ribInstall:20,fibProgram:5}},
    ultra:{ospf:{helloInterval:0.5,deadInterval:1.5,spfInitialDelay:10,spfMinDelay:50,spfMaxDelay:200,lsaMinArrival:50,lsaRefresh:30000,ribInstall:10,fibProgram:2},bgp:{keepalive:1,holdTime:3,connectRetry:10,minRouteAdv:0,ribInstall:20,fibProgram:5},eigrp:{helloInterval:0.5,holdTime:1.5,queryDelay:20,activeTime:30000,ribInstall:10,fibProgram:3},bfd:{txInterval:50,rxInterval:50,multiplier:3,ribInstall:5,fibProgram:2}}
  };
  function ccSetProto(p,btn){ CC_PROTO=p; document.querySelectorAll('.tool-pill[id^="cc-"]').forEach(b=>b.classList.remove('active')); if(btn) btn.classList.add('active'); ccBuildInputs(); convCalcUpdate(); }
  function ccPreset(n){ var pre=CC_PRESETS[n]; if(!pre) return; CC_VALS=JSON.parse(JSON.stringify(pre)); ccBuildInputs(); convCalcUpdate(); }
  
  function ccBuildInputs(){
    var v=CC_VALS[CC_PROTO], html='';
    var fields={
      ospf:[{k:'helloInterval',label:'Hello interval (s)',tip:'Default: 10s on broadcast. Minimum: 250ms (sub-second with BFD-like timers).'},{k:'deadInterval',label:'Dead interval (s)',tip:'Default: 40s (4× hello). Detection time = dead interval.'},{k:'spfInitialDelay',label:'SPF initial delay (ms)',tip:'Delay before first SPF run after topology change. Default: 50ms.'},{k:'spfMinDelay',label:'SPF min delay (ms)',tip:'Minimum delay between SPF runs. Prevents CPU overload on flapping.'},{k:'ribInstall',label:'RIB install time (ms)',tip:'Time for FIB to program hardware tables after SPF.'},{k:'fibProgram',label:'FIB program time (ms)',tip:'ASIC/hardware forwarding table update time.'}],
      bgp:[{k:'keepalive',label:'Keepalive interval (s)',tip:'Default: 60s. Sent every interval to maintain session.'},{k:'holdTime',label:'Hold time (s)',tip:'Default: 180s (3× keepalive). Session drops if no msg received.'},{k:'minRouteAdv',label:'Min route advertisement (s)',tip:'Minimum wait between UPDATE bursts. Default: 30s eBGP.'},{k:'ribInstall',label:'RIB install time (ms)',tip:'Time to install new best path in routing table.'},{k:'fibProgram',label:'FIB program time (ms)',tip:'Hardware forwarding table update.'}],
      eigrp:[{k:'helloInterval',label:'Hello interval (s)',tip:'Default: 5s LAN, 60s WAN (NBMA). Hold = 3× hello.'},{k:'holdTime',label:'Hold time (s)',tip:'Default: 15s. Neighbor declared down if no hello received.'},{k:'queryDelay',label:'Query delay (ms)',tip:'Delay before sending queries on active route.'},{k:'ribInstall',label:'RIB install time (ms)',tip:'FS promotion or query response install time.'},{k:'fibProgram',label:'FIB program time (ms)',tip:'Hardware update time.'}],
      bfd:[{k:'txInterval',label:'TX interval (ms)',tip:'Default: 300ms. How often BFD control packets are sent.'},{k:'rxInterval',label:'RX interval (ms)',tip:'Negotiated with peer — minimum of both used.'},{k:'multiplier',label:'Detect multiplier',tip:'Default: 3. Detection time = rx × multiplier (900ms default).'},{k:'ribInstall',label:'RIB install (ms)',tip:'Time from BFD notification to route removal from RIB.'},{k:'fibProgram',label:'FIB program (ms)',tip:'Hardware update after route removed.'}]
    };
    (fields[CC_PROTO]||[]).forEach(function(f){
      html+='<div style="margin-bottom:14px"><div style="display:flex;justify-content:space-between;margin-bottom:4px"><label style="font-family:var(--mono);font-size:11px;color:var(--text)">'+f.label+'</label><span style="font-family:var(--mono);font-size:11px;font-weight:700;color:var(--blue)" id="cc-lbl-'+f.k+'">'+v[f.k]+'</span></div>'+
        '<input type="range" min="0" max="'+(f.k.includes('Delay')?'1000':f.k.includes('Interval')||f.k.includes('Time')||f.k==='holdTime'?'180':f.k==='multiplier'?'10':'200')+'" step="'+(f.k.includes('Interval')||f.k.includes('Time')&&!f.k.includes('min')&&!f.k.includes('max')&&!f.k.includes('Initial')?'0.5':'1')+'" value="'+v[f.k]+'" style="width:100%" oninput="CC_VALS[CC_PROTO][\''+f.k+'\']=parseFloat(this.value);document.getElementById(\'cc-lbl-'+f.k+'\').textContent=this.value;convCalcUpdate()">'+
        '<div style="font-family:var(--mono);font-size:9px;color:var(--muted);margin-top:3px">'+f.tip+'</div></div>';
    });
    document.getElementById('cc-inputs').innerHTML=html;
  }
  
  function convCalcUpdate(){
    var v=CC_VALS[CC_PROTO]||{};
    var phases=[], totalMs=0;
    if(CC_PROTO==='ospf'){
      var detect=v.deadInterval*1000;
      var spf=v.spfInitialDelay+v.spfMinDelay;
      var rib=v.ribInstall;
      var fib=v.fibProgram;
      phases=[
        {name:'Failure detection',ms:detect,color:'#ef4444',desc:'Dead interval: '+v.deadInterval+'s × 1000 = '+detect+'ms'},
        {name:'SPF scheduling',ms:v.spfInitialDelay,color:'#f59e0b',desc:'SPF initial delay: '+v.spfInitialDelay+'ms'},
        {name:'SPF computation',ms:v.spfMinDelay,color:'#3b82f6',desc:'SPF run time: ~'+v.spfMinDelay+'ms'},
        {name:'RIB update',ms:rib,color:'#6366f1',desc:'Route install in RIB: '+rib+'ms'},
        {name:'FIB programming',ms:fib,color:'#22c55e',desc:'Hardware FIB update: '+fib+'ms'}
      ];
      totalMs=detect+v.spfInitialDelay+v.spfMinDelay+rib+fib;
    } else if(CC_PROTO==='bgp'){
      var detect=v.holdTime*1000;
      phases=[
        {name:'Hold timer expiry',ms:detect,color:'#ef4444',desc:'Hold time: '+v.holdTime+'s'},
        {name:'Best-path recalc',ms:100,color:'#f59e0b',desc:'BGP decision process: ~100ms'},
        {name:'Route advertisement',ms:v.minRouteAdv*1000,color:'#3b82f6',desc:'Min route advertisement: '+v.minRouteAdv+'s'},
        {name:'RIB update',ms:v.ribInstall,color:'#6366f1',desc:'RIB install: '+v.ribInstall+'ms'},
        {name:'FIB programming',ms:v.fibProgram,color:'#22c55e',desc:'FIB update: '+v.fibProgram+'ms'}
      ];
      totalMs=detect+100+(v.minRouteAdv*1000)+v.ribInstall+v.fibProgram;
    } else if(CC_PROTO==='eigrp'){
      var detect=v.holdTime*1000;
      phases=[
        {name:'Hold timer expiry',ms:detect,color:'#ef4444',desc:'Hold time: '+v.holdTime+'s'},
        {name:'FS promotion / query',ms:v.queryDelay,color:'#f59e0b',desc:'Query delay: '+v.queryDelay+'ms (if FS exists: instant)'},
        {name:'RIB update',ms:v.ribInstall,color:'#6366f1',desc:'EIGRP RIB install: '+v.ribInstall+'ms'},
        {name:'FIB programming',ms:v.fibProgram,color:'#22c55e',desc:'FIB update: '+v.fibProgram+'ms'}
      ];
      totalMs=detect+v.queryDelay+v.ribInstall+v.fibProgram;
    } else if(CC_PROTO==='bfd'){
      var neg=Math.min(v.txInterval,v.rxInterval);
      var detect=neg*v.multiplier;
      phases=[
        {name:'BFD detection',ms:detect,color:'#ef4444',desc:'Negotiated interval × multiplier: '+neg+'ms × '+v.multiplier+' = '+detect+'ms'},
        {name:'Protocol notification',ms:5,color:'#f59e0b',desc:'BFD notifies routing protocol: ~5ms'},
        {name:'RIB update',ms:v.ribInstall,color:'#6366f1',desc:'RIB install: '+v.ribInstall+'ms'},
        {name:'FIB programming',ms:v.fibProgram,color:'#22c55e',desc:'FIB update: '+v.fibProgram+'ms'}
      ];
      totalMs=detect+5+v.ribInstall+v.fibProgram;
    }
    // Timeline visualization
    var tlHtml='<div style="background:var(--bg3);border-radius:10px;padding:16px;margin-bottom:14px">';
    tlHtml+='<div style="display:flex;justify-content:space-between;font-family:var(--mono);font-size:11px;color:var(--muted);margin-bottom:12px"><span>0ms</span><span style="font-size:14px;font-weight:700;color:var(--text)">Total: '+(totalMs>1000?(totalMs/1000).toFixed(2)+'s':totalMs+'ms')+'</span></div>';
    tlHtml+='<div style="display:flex;height:28px;border-radius:6px;overflow:hidden;margin-bottom:8px">';
    phases.forEach(function(p){ if(p.ms>0) tlHtml+='<div style="width:'+Math.max(2,(p.ms/totalMs*100)).toFixed(1)+'%;background:'+p.color+';transition:width .4s" title="'+p.name+': '+p.ms+'ms"></div>'; });
    tlHtml+='</div>';
    // SLA line
    var slaMs=[50,200,500,1000,3000];
    var slaLine='<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">';
    slaMs.forEach(function(s){ slaLine+='<div style="font-family:var(--mono);font-size:9px;padding:2px 8px;border-radius:10px;background:'+(totalMs<=s?'rgba(34,197,94,0.15)':'rgba(239,68,68,0.1)')+';border:1px solid '+(totalMs<=s?'rgba(34,197,94,0.3)':'rgba(239,68,68,0.3)')+';color:'+(totalMs<=s?'var(--green)':'var(--muted)')+'">'+s+'ms SLA: '+(totalMs<=s?'✓ PASS':'✗')+'</div>'; });
    slaLine+='</div>'; tlHtml+=slaLine+'</div>';
    document.getElementById('cc-timeline-vis').innerHTML=tlHtml;
    // Phase table
    var ptHtml='';
    phases.forEach(function(p){ ptHtml+='<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border);font-family:var(--mono);font-size:11px"><span style="display:flex;align-items:center;gap:6px"><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:'+p.color+'"></span>'+p.name+'</span><span style="color:var(--text);font-weight:600">'+(p.ms>=1000?(p.ms/1000).toFixed(1)+'s':p.ms+'ms')+'</span></div><div style="font-size:10px;color:var(--muted);padding:2px 0 6px 14px">'+p.desc+'</div>'; });
    document.getElementById('cc-phase-table').innerHTML=ptHtml;
    // Recommendations
    var recs=[];
    if(CC_PROTO==='ospf'){
      if(v.deadInterval>10) recs.push('Reduce dead interval to 3× hello for faster detection. Current: '+v.deadInterval+'s → try 3s');
      if(v.spfInitialDelay>50) recs.push('Lower SPF initial delay. Current: '+v.spfInitialDelay+'ms. Default 50ms is good.');
      if(totalMs>3000) recs.push('Consider BFD for sub-second detection. BFD can detect in 300ms vs '+totalMs+'ms.');
    } else if(CC_PROTO==='bgp'){
      if(v.holdTime>9) recs.push('Reduce hold time. Current: '+v.holdTime+'s. With BFD, set hold=9s (keepalive=3s).');
      if(v.minRouteAdv>1) recs.push('Reduce min-route-advertisement. iBGP: 0s. eBGP: 1s for faster withdrawal propagation.');
    } else if(CC_PROTO==='bfd'){
      if(v.txInterval>300) recs.push('Standard BFD: 300ms×3=900ms. For carrier-grade: try 50ms×3=150ms.');
      recs.push('Combined: BFD '+Math.min(v.txInterval,v.rxInterval)*v.multiplier+'ms detection → notify OSPF/BGP → '+v.ribInstall+'+'+v.fibProgram+'ms = '+(Math.min(v.txInterval,v.rxInterval)*v.multiplier+5+v.ribInstall+v.fibProgram)+'ms total');
    }
    document.getElementById('cc-recs').innerHTML=recs.length?recs.map(r=>'<div style="padding:5px 0;border-bottom:1px solid var(--border)">• '+r+'</div>').join(''):'Timers are well configured ✓';
  }
  
  
  // ═══════════════════════════════════════════════════════════════════════
  // OSPF LSA DEEP DIVE — ALL 11 TYPES WITH BYTE OFFSETS + LSDB BUILDER
  // ═══════════════════════════════════════════════════════════════════════
  var LSA_ACTIVE_TYPE = 1;
  var LSA_ACTIVE_TAB  = 'detail';
  
  // ── colour palette per type ──────────────────────────────────────────
  var LSA_COLORS = {
    1:'#3b82f6', 2:'#6366f1', 3:'#22c55e', 4:'#f59e0b',
    5:'#ef4444', 6:'#ec4899', 7:'#d97706', 8:'#8b5cf6',
    9:'#06b6d4', 10:'#0891b2', 11:'#7c3aed'
  };
  
  // ── full 11-type data ────────────────────────────────────────────────
  var LSA_DATA = {
    1:{
      type:1, name:'Router LSA', rfc:'RFC 2328 §12.4.1',
      generated:'Every OSPF router, one per area it participates in',
      flooded:'Within the originating area only (intra-area)',
      blocked_in:'Nothing — present in all area types including stub, NSSA, totally-stubby',
      triggers:[
        'Interface up / down / cost change',
        'DR / BDR election outcome changes',
        'Neighbor state reaches or leaves FULL',
        'LSA refresh (every 30 min)',
        'Router role change (becomes ABR / ASBR)'
      ],
      purpose:'Describes every link (interface) of the originating router within the area. This is the raw material SPF uses to build the topology graph. Each link entry contributes one vertex and one weighted edge to the graph.',
      spf_role:'Primary input to Dijkstra. Router LSAs + Network LSAs together form the intra-area topology graph.',
      ioscmd:'show ip ospf database router [adv-router <rid>]',
      example_output:`OSPF Router with ID (1.1.1.1) (Process ID 1)
      Router Link States (Area 0)
  
    LS age: 312
    Options: (No TOS-capability, DC)
    LS Type: Router Links
    Link State ID: 1.1.1.1
    Advertising Router: 1.1.1.1
    LS Seq Number: 80000003
    Checksum: 0x4321
    Length: 60
    Number of Links: 2
  
     Link connected to: a Transit Network
      (Link ID) DR IP Address: 192.168.1.1
      (Link Data) Router Interface address: 192.168.1.2
       Number of MTID metrics: 0
       TOS 0 Metrics: 1
  
     Link connected to: a Stub Network
      (Link ID) Network/subnet number: 10.1.1.0
      (Link Data) Network Mask: 255.255.255.0
       TOS 0 Metrics: 1`,
      header_fields:[
        {off:'0-1',  bits:16, name:'LS Age',         desc:'Seconds since origination. Aged to 3600 (MaxAge) then flushed.', val:'e.g. 0x0138 = 312s'},
        {off:'2',    bits:8,  name:'Options',         desc:'Capability bits: E=external routing, N=NSSA, DC=demand circuit', val:'0x22 typical'},
        {off:'3',    bits:8,  name:'LS Type',         desc:'Always 0x01 for Router LSA', val:'0x01'},
        {off:'4-7',  bits:32, name:'Link State ID',   desc:'For Type-1: Router ID of the originating router', val:'e.g. 1.1.1.1'},
        {off:'8-11', bits:32, name:'Adv Router',      desc:'Always same as Link State ID for Router LSAs', val:'e.g. 1.1.1.1'},
        {off:'12-15',bits:32, name:'LS Seq Number',   desc:'Wrapping sequence. Higher = newer. First = 0x80000001', val:'0x80000003'},
        {off:'16-17',bits:16, name:'Checksum',        desc:'Fletcher checksum over LSA excluding LS Age', val:'0x4321'},
        {off:'18-19',bits:16, name:'Length',          desc:'Total LSA length in bytes including header (20 bytes)', val:'e.g. 60'},
      ],
      body_fields:[
        {off:'20',   bits:8,  name:'Flags (V/E/B)',   desc:'V=1 virtual-link endpoint, E=1 ASBR, B=1 ABR', val:'0x00 for plain router'},
        {off:'21',   bits:8,  name:'Zero',            desc:'Reserved, must be zero', val:'0x00'},
        {off:'22-23',bits:16, name:'# Links',         desc:'Number of router link entries following', val:'e.g. 0x0002 = 2 links'},
        {off:'24-27',bits:32, name:'Link ID',         desc:'P2P: neighbor RID; Transit: DR IP; Stub: network; Virtual: neighbor RID', val:'varies'},
        {off:'28-31',bits:32, name:'Link Data',       desc:'P2P/transit: interface IP; Stub: subnet mask', val:'varies'},
        {off:'32',   bits:8,  name:'Link Type',       desc:'1=P2P, 2=transit (broadcast), 3=stub, 4=virtual', val:'1,2,3 or 4'},
        {off:'33',   bits:8,  name:'# TOS',           desc:'Always 0 in modern OSPF (TOS deprecated)', val:'0x00'},
        {off:'34-35',bits:16, name:'TOS 0 Metric',    desc:'Interface cost for this link (OSPF metric)', val:'e.g. 0x0001'},
      ],
      area_impact:{
        stub:'Present — every router still generates Type-1',
        nssa:'Present — every router still generates Type-1',
        totally:'Present — every router still generates Type-1',
        backbone:'Present — this is the backbone topology'
      }
    },
    2:{
      type:2, name:'Network LSA', rfc:'RFC 2328 §12.4.2',
      generated:'DR (Designated Router) only — one per broadcast/NBMA segment with FULL adjacencies',
      flooded:'Within the originating area only',
      blocked_in:'Not generated on P2P or P2MP links (no DR election on those)',
      triggers:[
        'DR wins election and first adjacency goes FULL',
        'Any router joins or leaves the broadcast segment (adj state changes)',
        'DR changes (old DR flushes, new DR originates fresh)',
        'LSA refresh (every 30 min)'
      ],
      purpose:'Represents the multi-access segment as a virtual "pseudo-node" in the topology graph. Without it, you\'d need N² links between N routers on a segment. With it, all routers connect to one virtual node (the segment). Critical for correct SPF on Ethernet.',
      spf_role:'Creates the pseudo-node vertex. All routers on segment have edge to this node; SPF traverses through it for intra-segment paths.',
      ioscmd:'show ip ospf database network [adv-router <dr-rid>]',
      example_output:`  Network Link States (Area 0)
  
    LS age: 88
    LS Type: Network Links
    Link State ID: 192.168.1.1 (address of DR)
    Advertising Router: 1.1.1.1
    LS Seq Number: 80000001
    Checksum: 0xABCD
    Length: 32
    Network Mask: /24
      Attached Router: 1.1.1.1  (DR)
      Attached Router: 2.2.2.2
      Attached Router: 3.3.3.3`,
      header_fields:[
        {off:'0-1',  bits:16, name:'LS Age',       desc:'Seconds since origination', val:''},
        {off:'2',    bits:8,  name:'Options',       desc:'E-bit must match area type', val:'0x22'},
        {off:'3',    bits:8,  name:'LS Type',       desc:'Always 0x02', val:'0x02'},
        {off:'4-7',  bits:32, name:'Link State ID', desc:'IP address of DR\'s interface on the segment', val:'e.g. 192.168.1.1'},
        {off:'8-11', bits:32, name:'Adv Router',    desc:'Router ID of DR', val:'e.g. 1.1.1.1'},
        {off:'12-19',bits:64, name:'Seq/Cksum/Len', desc:'Standard LSA header fields', val:''},
      ],
      body_fields:[
        {off:'20-23',bits:32, name:'Network Mask',     desc:'Subnet mask of the broadcast segment', val:'e.g. 255.255.255.0'},
        {off:'24-27',bits:32, name:'Attached Router 1',desc:'RID of first router on segment (usually DR itself)', val:'e.g. 1.1.1.1'},
        {off:'28-31',bits:32, name:'Attached Router 2',desc:'RID of next router (FULL adjacency required)', val:'e.g. 2.2.2.2'},
        {off:'...',  bits:32, name:'Attached Router N',desc:'One entry per router with FULL adj on segment', val:'repeats'},
      ],
      area_impact:{stub:'Present',nssa:'Present',totally:'Present',backbone:'Primary LSA for Ethernet segments'}
    },
    3:{
      type:3, name:'Summary LSA (Network)', rfc:'RFC 2328 §12.4.3',
      generated:'ABR (Area Border Router) — one per inter-area route per target area',
      flooded:'Into every area EXCEPT the area where the route originates',
      blocked_in:'Stub areas receive only a default route Type-3. Totally-stubby areas receive NO Type-3 except the default.',
      triggers:[
        'ABR learns new intra-area route from another area',
        'Cost to destination changes in source area',
        'Intra-area route disappears (ABR withdraws by setting age=MaxAge)',
        'Manual summarization changes (summary-address)',
        'LSA refresh (every 30 min)'
      ],
      purpose:'Inter-area routing. When a prefix in Area 1 needs to be reachable from Area 2, the ABR originates a Type-3 into Area 2 describing that prefix and the cost to reach it via this ABR. The receiving area treats it as a "distance vector" hop to the ABR.',
      spf_role:'Not used in SPF graph construction. Used in the second phase: after SPF determines cost to ABR, routers add the Type-3 metric to get total inter-area cost.',
      ioscmd:'show ip ospf database summary',
      example_output:`  Summary Net Link States (Area 0)
  
    LS age: 512
    LS Type: Summary Links(Network)
    Link State ID: 10.2.0.0 (summary Network Number)
    Advertising Router: 2.2.2.2
    Length: 28
    Network Mask: /24
      MTID: 0   Metric: 20`,
      header_fields:[
        {off:'0-1',  bits:16, name:'LS Age',       desc:'', val:''},
        {off:'2',    bits:8,  name:'Options',       desc:'', val:''},
        {off:'3',    bits:8,  name:'LS Type',       desc:'Always 0x03', val:'0x03'},
        {off:'4-7',  bits:32, name:'Link State ID', desc:'Network address of the summarized prefix', val:'e.g. 10.2.0.0'},
        {off:'8-11', bits:32, name:'Adv Router',    desc:'ABR\'s Router ID (may differ from Link State ID)', val:'e.g. 2.2.2.2'},
        {off:'12-19',bits:64, name:'Seq/Cksum/Len', desc:'Standard', val:''},
      ],
      body_fields:[
        {off:'20-23',bits:32, name:'Network Mask',  desc:'Subnet mask of prefix. Combined with Link State ID gives full prefix.', val:'e.g. 255.255.255.0 = /24'},
        {off:'24',   bits:8,  name:'Zero/TOS',      desc:'Always 0 (TOS deprecated)', val:'0x00'},
        {off:'25-27',bits:24, name:'Metric',        desc:'Cost from ABR to the summarized network', val:'e.g. 0x000014 = 20'},
      ],
      area_impact:{stub:'Default only (0.0.0.0/0)',nssa:'Default + intra-area summaries',totally:'Default only',backbone:'Full inter-area summaries'}
    },
    4:{
      type:4, name:'ASBR Summary LSA', rfc:'RFC 2328 §12.4.3',
      generated:'ABR — originated into all areas that need to reach the ASBR',
      flooded:'All areas except the area containing the ASBR',
      blocked_in:'Stub and NSSA areas (no external routes anyway; totally-stubby also)',
      triggers:[
        'ABR learns ASBR exists in one area (via Type-1 with E-bit set)',
        'ASBR\'s reachability cost changes',
        'ASBR becomes unreachable',
        'LSA refresh'
      ],
      purpose:'Without Type-4, routers in Area 2 receiving a Type-5 external LSA don\'t know HOW to reach the ASBR that originated it (since Type-5 only has ASBR RID, not a path). Type-4 provides the "how to get to ASBR" routing information.',
      spf_role:'Used in external route calculation. After SPF + inter-area path selection, routers look up the ASBR via Type-4 to find the actual forwarding path.',
      ioscmd:'show ip ospf database asbr-summary',
      example_output:`  Summary ASB Link States (Area 0)
  
    LS Type: Summary Links(AS Boundary Router)
    Link State ID: 3.3.3.3 (ASBR Router ID)
    Advertising Router: 2.2.2.2  (ABR)
    Network Mask: /0
    Metric: 30`,
      header_fields:[
        {off:'3',   bits:8,  name:'LS Type',       desc:'Always 0x04', val:'0x04'},
        {off:'4-7', bits:32, name:'Link State ID', desc:'Router ID of the ASBR (not a network address!)', val:'e.g. 3.3.3.3'},
        {off:'8-11',bits:32, name:'Adv Router',    desc:'ABR Router ID (re-originator)', val:'e.g. 2.2.2.2'},
      ],
      body_fields:[
        {off:'20-23',bits:32, name:'Network Mask',  desc:'Always 0.0.0.0 — Type-4 is a host route to ASBR RID', val:'0x00000000'},
        {off:'24',   bits:8,  name:'Zero',          desc:'TOS = 0', val:'0x00'},
        {off:'25-27',bits:24, name:'Metric',        desc:'Cost from ABR to ASBR', val:'e.g. 30'},
      ],
      area_impact:{stub:'Blocked (stub areas reject external info)',nssa:'Blocked',totally:'Blocked',backbone:'Generated here; flooded to other areas'}
    },
    5:{
      type:5, name:'AS External LSA', rfc:'RFC 2328 §12.4.4',
      generated:'ASBR (Autonomous System Boundary Router) only',
      flooded:'Entire OSPF domain — every area in the AS except stub/NSSA/totally-stubby',
      blocked_in:'Stub areas, NSSA areas (Type-7 used instead), totally-stubby areas',
      triggers:[
        'Redistribution into OSPF from BGP, EIGRP, static, connected, RIP, etc.',
        'External route metric or attribute changes',
        'External route disappears',
        'Forwarding address change',
        'Route tag change',
        'LSA refresh'
      ],
      purpose:'Carries routes external to the OSPF domain. E1 type: metric accumulates OSPF cost as packet traverses the domain. E2 type: metric stays fixed regardless of where in domain you are (simpler but less precise).',
      spf_role:'Processed AFTER SPF. Routers first find path to ASBR via Type-1/2/3/4, then add external metric (E1 cumulative, E2 fixed) to compute total cost.',
      ioscmd:'show ip ospf database external',
      example_output:`  Type-5 AS External Link States
  
    LS Type: AS External Link
    Link State ID: 172.16.0.0 (External Network Number)
    Advertising Router: 3.3.3.3
    Checksum: 0x1234
    Length: 36
    Network Mask: /16
      Metric Type: 2 (Larger than any link state path)
      MTID: 0
      Metric: 20
      Forward Address: 0.0.0.0
      External Route Tag: 0`,
      header_fields:[
        {off:'3',    bits:8,  name:'LS Type',       desc:'Always 0x05', val:'0x05'},
        {off:'4-7',  bits:32, name:'Link State ID', desc:'External network address', val:'e.g. 172.16.0.0'},
        {off:'8-11', bits:32, name:'Adv Router',    desc:'ASBR Router ID', val:'e.g. 3.3.3.3'},
      ],
      body_fields:[
        {off:'20-23',bits:32, name:'Network Mask',     desc:'Mask of external prefix', val:'e.g. 255.255.0.0'},
        {off:'24',   bits:1,  name:'E bit',            desc:'0=Type-1 (cumulative cost), 1=Type-2 (fixed cost at boundary)', val:'0 or 1'},
        {off:'24',   bits:7,  name:'TOS zero',         desc:'Upper 7 bits: TOS=0, always', val:'0'},
        {off:'25-27',bits:24, name:'Metric',           desc:'External metric value at ASBR', val:'e.g. 0x000014'},
        {off:'28-31',bits:32, name:'Forwarding Addr',  desc:'Usually 0.0.0.0. Non-zero: route traffic to this addr instead of ASBR (used in NSSA Type-7→5 translation)', val:'0.0.0.0 typical'},
        {off:'32-35',bits:32, name:'Ext Route Tag',    desc:'Policy tag — 32-bit value passed unchanged, not used by SPF. Used by route-maps for policy.', val:'0x00000000 typical'},
      ],
      area_impact:{stub:'BLOCKED — routers in stub only get default Type-3',nssa:'BLOCKED — ASBR uses Type-7 instead',totally:'BLOCKED',backbone:'Flooded through backbone'}
    },
    6:{
      type:6, name:'Group Membership LSA', rfc:'RFC 1584 (MOSPF)',
      generated:'MOSPF-capable routers for multicast group members',
      flooded:'Within originating area',
      blocked_in:'Non-MOSPF networks (obsolete — rarely seen today)',
      triggers:[
        'IGMP group join/leave on an interface',
        'Multicast group membership change'
      ],
      purpose:'Used by MOSPF (Multicast OSPF). Advertises which multicast groups have receivers on each router\'s local interfaces. The shortest path multicast trees are computed using this information. Largely obsolete — PIM-SM replaced MOSPF.',
      spf_role:'Not used by standard SPF. MOSPF uses it to build source-based multicast trees.',
      ioscmd:'show ip ospf database type-6  (rarely seen)',
      example_output:'Type-6 LSAs are rarely seen in modern networks.\nMOSPF (RFC 1584) is obsolete — PIM-SM is used instead.\nCisco IOS does not generate Type-6 LSAs.',
      header_fields:[
        {off:'3',bits:8,name:'LS Type',desc:'0x06',val:'0x06'},
        {off:'4-7',bits:32,name:'Link State ID',desc:'Multicast group address',val:'e.g. 224.0.0.5'},
      ],
      body_fields:[
        {off:'20+',bits:32,name:'Vertex type',desc:'Identifies the vertex (router/network) with group membership',val:'varies'},
        {off:'+4', bits:32,name:'Vertex ID',  desc:'RID or DR IP of vertex',val:'varies'},
      ],
      area_impact:{stub:'N/A',nssa:'N/A',totally:'N/A',backbone:'Obsolete — not used in modern deployments'}
    },
    7:{
      type:7, name:'NSSA External LSA', rfc:'RFC 3101',
      generated:'ASBR located within a Not-So-Stubby Area (NSSA)',
      flooded:'Within the NSSA only. ABR optionally translates to Type-5 for backbone.',
      blocked_in:'Non-NSSA areas. Regular stub/totally-stubby areas use neither Type-5 nor Type-7.',
      triggers:[
        'Route redistributed into OSPF in an NSSA area',
        'External route changes or disappears',
        'P-bit set: ABR detects it should translate to Type-5',
        'LSA refresh'
      ],
      purpose:'Allows redistribution in areas that cannot receive Type-5 (stub-like areas). An NSSA area blocks Type-5 flooding IN, but allows the ASBR inside to originate Type-7 for LOCAL distribution. The ABR may translate to Type-5 for the rest of the domain.',
      spf_role:'Same as Type-5 within NSSA. ABR translation to Type-5 extends reach to other areas.',
      ioscmd:'show ip ospf database nssa-external',
      example_output:`  Type-7 AS External Link States (Area 1)
  
    LS Type: AS External Link (NSSA)
    Link State ID: 192.168.100.0
    Advertising Router: 4.4.4.4  (ASBR in NSSA)
    Network Mask: /24
      Metric Type: 2
      Metric: 100
      Forward Address: 10.1.1.4   ← MUST be non-zero
      External Route Tag: 65000`,
      header_fields:[
        {off:'3',   bits:8,  name:'LS Type',       desc:'Always 0x07', val:'0x07'},
        {off:'4-7', bits:32, name:'Link State ID', desc:'External network address', val:'e.g. 192.168.100.0'},
      ],
      body_fields:[
        {off:'20-23',bits:32, name:'Network Mask',      desc:'Prefix mask', val:''},
        {off:'24',   bits:1,  name:'P bit (propagate)', desc:'1=ABR should translate this to Type-5. 0=keep in NSSA only.', val:'1 typical'},
        {off:'24',   bits:1,  name:'E bit',             desc:'0=E1, 1=E2 metric type', val:''},
        {off:'25-27',bits:24, name:'Metric',            desc:'External metric', val:''},
        {off:'28-31',bits:32, name:'Forwarding Address',desc:'MUST be non-zero in NSSA! Must be a reachable address within the NSSA area. This tells NSSA routers where to actually forward packets.', val:'Non-zero required'},
        {off:'32-35',bits:32, name:'Route Tag',         desc:'Same as Type-5 route tag', val:''},
      ],
      area_impact:{stub:'Cannot coexist — area is either stub OR NSSA',nssa:'This is the NSSA-specific LSA',totally:'Variant: totally-NSSA = area nssa no-summary',backbone:'Type-7 translated to Type-5 by ABR if P-bit set'}
    },
    8:{
      type:8, name:'External Attributes LSA', rfc:'RFC 1403 (BGP/OSPF Interaction)',
      generated:'ASBR redistributing BGP routes into OSPF',
      flooded:'Domain-wide (same scope as Type-5)',
      blocked_in:'Stub/NSSA areas, and effectively obsolete in modern networks',
      triggers:[
        'BGP route redistributed into OSPF',
        'BGP attribute change on redistributed route'
      ],
      purpose:'Carries BGP attributes (AS-PATH, COMMUNITY, etc.) for routes redistributed from BGP into OSPF. Allows an OSPF router to reconstruct the BGP attributes if it needs to redistribute BACK into BGP. Rarely implemented in modern routers.',
      spf_role:'No SPF role. Informational only for BGP attribute preservation.',
      ioscmd:'show ip ospf database type-8  (rarely seen in practice)',
      example_output:'Type-8 LSAs are extremely rare in modern networks.\nMost deployments simply re-originate routes without BGP attribute preservation.\nCisco IOS support is limited.',
      header_fields:[
        {off:'3',bits:8,name:'LS Type',desc:'0x08',val:'0x08'},
        {off:'4-7',bits:32,name:'Link State ID',desc:'Same as accompanying Type-5 LSA',val:''},
      ],
      body_fields:[
        {off:'20+',bits:0,name:'BGP Attributes',desc:'Variable-length BGP path attributes (AS-PATH, ORIGIN, COMMUNITY, etc.) in BGP wire format',val:'variable'},
      ],
      area_impact:{stub:'Blocked',nssa:'Blocked',totally:'Blocked',backbone:'Theoretically domain-wide but obsolete'}
    },
    9:{
      type:9, name:'Opaque LSA (Link-local)', rfc:'RFC 5250',
      generated:'Any OSPF router needing to distribute link-local extension data',
      flooded:'Single link only — NOT forwarded by any router',
      blocked_in:'Not applicable — never leaves the link',
      triggers:[
        'MPLS TE link attribute change',
        'Graceful restart signaling',
        'Application-specific extension events'
      ],
      purpose:'Extension mechanism for OSPF. Type-9 carries data relevant only to directly connected neighbors (link-local scope). Most common use: MPLS Traffic Engineering sub-TLVs describing link bandwidth, TE metric, SRLG memberships.',
      spf_role:'No direct SPF role. TE uses these to populate the TE database for CSPF (Constrained SPF).',
      ioscmd:'show ip ospf database opaque-link',
      example_output:`  Type-9 Opaque Link States
  
    Opaque Type: 1 (Traffic Engineering)
    Opaque ID: 0
    Advertising Router: 1.1.1.1
    Length: 116
  
    TLV Type: 2 (Link)
      Sub-TLV Type: 1 (Link type): 1 (Point-to-point)
      Sub-TLV Type: 3 (Local addr): 10.0.0.1
      Sub-TLV Type: 4 (Remote addr): 10.0.0.2
      Sub-TLV Type: 5 (TE metric): 10
      Sub-TLV Type: 6 (Max BW): 1000000000 bps
      Sub-TLV Type: 7 (Max reservable BW): 750000000 bps`,
      header_fields:[
        {off:'3',   bits:8,  name:'LS Type',      desc:'0x09 for link-local. 0x0A for area scope. 0x0B for AS scope.', val:'0x09'},
        {off:'4',   bits:8,  name:'Opaque Type',  desc:'Application: 1=TE, 2=Grace LSA (GR), 4=Router Info, 7=OSPFv3 ext', val:'1 for TE'},
        {off:'5-7', bits:24, name:'Opaque ID',    desc:'Instance number within that opaque type. Usually 0.', val:'0x000000'},
        {off:'8-11',bits:32, name:'Adv Router',   desc:'Originating Router ID', val:''},
      ],
      body_fields:[
        {off:'20-21',bits:16, name:'TLV Type',    desc:'1=Router Address TLV, 2=Link TLV', val:'2 for Link'},
        {off:'22-23',bits:16, name:'TLV Length',  desc:'Length of TLV value in bytes', val:'varies'},
        {off:'24+',  bits:0,  name:'TLV Value',   desc:'Sub-TLVs: link type, local/remote addr, TE metric, max BW, max reservable BW, unreserved BW, color/affinity, SRLG', val:'variable'},
      ],
      area_impact:{stub:'Link-local only, not affected by area type',nssa:'Same',totally:'Same',backbone:'TE uses these for RSVP-TE path computation'}
    },
    10:{
      type:10, name:'Opaque LSA (Area-scope)', rfc:'RFC 5250',
      generated:'Any OSPF router needing area-wide extension distribution',
      flooded:'Within originating area (same scope as Type-1)',
      blocked_in:'Does not cross area boundaries',
      triggers:[
        'Segment Routing Node-SID advertisement',
        'MPLS TE topology information',
        'Router capabilities advertisement',
        'OSPFv2 Extended Prefix/Link attributes (RFC 7684)'
      ],
      purpose:'Area-scoped opaque data. Key modern use: Segment Routing. SR-MPLS uses Type-10 to advertise Node-SIDs (prefix SIDs), Adj-SIDs, and SR capabilities. Also used for Extended Link/Prefix attributes that don\'t fit in Type-1.',
      spf_role:'No SPF role. SR uses these to build the SRGB and compute SR label stacks.',
      ioscmd:'show ip ospf database opaque-area',
      example_output:`  Type-10 Opaque Area Link States (Area 0)
  
    Opaque Type: 7 (Extended Prefix)
    Advertising Router: 1.1.1.1
  
    Extended Prefix TLV: Length 20
      Route-type: 1 (Intra-area)
      AF: 0 (IPv4)
      Flags: 0x40 (N-flag: Node SID)
      Prefix: 1.1.1.1/32
  
      Prefix SID sub-TLV: Length 8
        Flags: 0x40 (No-PHP)
        MTID: 0
        Algorithm: 0 (SPF)
        SID/Index: 101   ← This router's Node-SID`,
      header_fields:[
        {off:'3',   bits:8,  name:'LS Type',     desc:'0x0A for area-scope', val:'0x0A'},
        {off:'4',   bits:8,  name:'Opaque Type', desc:'4=Router Info, 7=Extended Prefix (SR), 8=Extended Link (SR)', val:'4,7,8'},
        {off:'5-7', bits:24, name:'Opaque ID',   desc:'Instance number', val:'0'},
      ],
      body_fields:[
        {off:'20-21',bits:16, name:'TLV Type',    desc:'Extended Prefix TLV (7) or Extended Link TLV (8)', val:'7 or 8'},
        {off:'22-23',bits:16, name:'TLV Length',  desc:'', val:''},
        {off:'24',   bits:8,  name:'Route type',  desc:'1=intra-area, 3=inter-area, 5=E1, 7=E2', val:'1'},
        {off:'25',   bits:8,  name:'AF',          desc:'Address family: 0=IPv4', val:'0'},
        {off:'26',   bits:8,  name:'Flags',       desc:'N-flag=node SID, A-flag=anycast, E-flag=explicit-null', val:'0x40'},
        {off:'27',   bits:8,  name:'Reserved',    desc:'', val:'0'},
        {off:'28-31',bits:32, name:'Prefix',      desc:'IPv4 prefix (for Extended Prefix TLV)', val:'e.g. 1.1.1.1'},
        {off:'+sub', bits:0,  name:'Prefix SID sub-TLV', desc:'Flags, MTID, Algorithm, SID Index/Label', val:''},
      ],
      area_impact:{stub:'Present',nssa:'Present',totally:'Present',backbone:'Used for SR-MPLS Node-SID distribution'}
    },
    11:{
      type:11, name:'Opaque LSA (AS-scope)', rfc:'RFC 5250',
      generated:'Any OSPF router needing domain-wide extension distribution',
      flooded:'Entire OSPF domain (same scope as Type-5)',
      blocked_in:'Stub, NSSA, totally-stubby areas block Type-11 flooding',
      triggers:[
        'Router capabilities that apply domain-wide',
        'Domain-wide Segment Routing information',
        'BFD capabilities advertisement'
      ],
      purpose:'AS-scoped opaque data. Used for capabilities and information that need to reach the entire OSPF domain. Examples: Router Information LSA advertising SR-MPLS capabilities (SRGB range), BFD capabilities, PCE address.',
      spf_role:'No SPF role. Used by control-plane extensions.',
      ioscmd:'show ip ospf database opaque-as',
      example_output:`  Type-11 Opaque AS Link States
  
    Opaque Type: 4 (Router Information)
    Advertising Router: 1.1.1.1
  
    Router Information TLV: Length 4
      Capabilities: 0x40000000
        SR-MPLS Capable
  
    SR Algorithm TLV: Length 2
      Algorithm: 0 (SPF), 1 (Strict SPF)
  
    SR Local Block TLV: Length 12
      Flags: 0x00
      SRGB Range 1:
        Range Size: 1000
        SID/Label: 16000   ← SRGB: labels 16000-16999`,
      header_fields:[
        {off:'3',   bits:8,  name:'LS Type',     desc:'0x0B for AS-scope', val:'0x0B'},
        {off:'4',   bits:8,  name:'Opaque Type', desc:'4=Router Information, others application-specific', val:'4'},
      ],
      body_fields:[
        {off:'20-21',bits:16, name:'Router Info TLV',  desc:'Type 1 = informational capabilities', val:'0x0001'},
        {off:'22-23',bits:16, name:'Length',           desc:'', val:'4'},
        {off:'24-27',bits:32, name:'Capabilities',     desc:'Bit flags: SR-capable, TE-capable, GR-capable, etc.', val:'0x40000000'},
        {off:'+',    bits:0,  name:'SRGB TLV',         desc:'Segment Routing Global Block: base label + range size. All routers must use same SRGB for interop.', val:'base=16000, range=1000'},
      ],
      area_impact:{stub:'BLOCKED — same rule as Type-5',nssa:'BLOCKED',totally:'BLOCKED',backbone:'Flooded domain-wide'}
    }
  };
  
  // ── LSDB example scenario ────────────────────────────────────────────
  var LSDB_SCENARIO = {
    desc:'A 3-area OSPF network: Area 0 (backbone) with R1+R2, Area 1 with R3 (ABR=R2), Area 2 with R4+ASBR R5 (ABR=R1). R5 redistributes a BGP route 203.0.113.0/24.',
    topology: [
      {id:'R1', area:'0', role:'ABR', x:200, y:120, rid:'1.1.1.1'},
      {id:'R2', area:'0', role:'ABR', x:380, y:120, rid:'2.2.2.2'},
      {id:'R3', area:'1', role:'IR',  x:470, y:240, rid:'3.3.3.3'},
      {id:'R4', area:'2', role:'IR',  x:110, y:240, rid:'4.4.4.4'},
      {id:'R5', area:'2', role:'ASBR',x:200, y:320, rid:'5.5.5.5'}
    ],
    links:[
      {a:'R1',b:'R2',area:'0',cost:10},
      {a:'R2',b:'R3',area:'1',cost:5},
      {a:'R1',b:'R4',area:'2',cost:10},
      {a:'R4',b:'R5',area:'2',cost:5}
    ],
    lsdb:[
      {type:1,orig:'R1',area:'0',id:'1.1.1.1',desc:'R1 links in Area 0: → R2 (cost 10), stub 10.0.1.0/30'},
      {type:1,orig:'R2',area:'0',id:'2.2.2.2',desc:'R2 links in Area 0: → R1 (cost 10), stub 10.0.1.0/30'},
      {type:1,orig:'R2',area:'1',id:'2.2.2.2',desc:'R2 links in Area 1: → R3 (cost 5)'},
      {type:1,orig:'R3',area:'1',id:'3.3.3.3',desc:'R3 links in Area 1: → R2 (cost 5), stub 10.1.0.0/24'},
      {type:1,orig:'R1',area:'2',id:'1.1.1.1',desc:'R1 links in Area 2: → R4 (cost 10)'},
      {type:1,orig:'R4',area:'2',id:'4.4.4.4',desc:'R4 links in Area 2: → R1 (cost 10), → R5 (cost 5)'},
      {type:1,orig:'R5',area:'2',id:'5.5.5.5',desc:'R5 links in Area 2: → R4 (cost 5) [E-bit=1: ASBR]'},
      {type:3,orig:'R1',area:'0',id:'10.2.0.0',desc:'R1 summarizes Area 2 into Area 0: 10.2.0.0/24, cost 20'},
      {type:3,orig:'R2',area:'0',id:'10.1.0.0',desc:'R2 summarizes Area 1 into Area 0: 10.1.0.0/24, cost 15'},
      {type:3,orig:'R2',area:'1',id:'10.0.1.0',desc:'R2 injects Area 0 backbone into Area 1: 10.0.1.0/30, cost 10'},
      {type:3,orig:'R2',area:'1',id:'10.2.0.0',desc:'R2 injects Area 2 prefix into Area 1 via Area 0: 10.2.0.0/24, cost 35'},
      {type:3,orig:'R1',area:'2',id:'10.0.1.0',desc:'R1 injects Area 0 into Area 2: 10.0.1.0/30, cost 10'},
      {type:3,orig:'R1',area:'2',id:'10.1.0.0',desc:'R1 injects Area 1 prefix into Area 2 via Area 0: 10.1.0.0/24, cost 25'},
      {type:4,orig:'R1',area:'0',id:'5.5.5.5',desc:'R1 tells Area 0: ASBR 5.5.5.5 is reachable via me (cost 20)'},
      {type:4,orig:'R2',area:'1',id:'5.5.5.5',desc:'R2 tells Area 1: ASBR 5.5.5.5 reachable via Area 0 (cost 30)'},
      {type:5,orig:'R5',area:'ALL',id:'203.0.113.0',desc:'ASBR R5 redistributes BGP route 203.0.113.0/24 E2 metric 20, FA=0.0.0.0'},
    ]
  };
  
  // ═══════════════════════════════════════════════════════════
  // INIT & TAB SWITCHING
  // ═══════════════════════════════════════════════════════════
  function lsaExplorerInit() {
    // Build type selector buttons
    var btns = '';
    Object.keys(LSA_DATA).forEach(function(t) {
      var d = LSA_DATA[t];
      btns += '<button class="tool-pill" onclick="lsaSelectType('+t+',this)" id="lsa-btn-'+t+'" '+
              'style="padding:4px 10px;font-size:11px">T'+t+'</button>';
    });
    document.getElementById('lsa-type-btns').innerHTML = btns;
    lsaSelectType(1, document.getElementById('lsa-btn-1'));
  }
  
  function lsaTab(tab, btn) {
    LSA_ACTIVE_TAB = tab;
    ['detail','bytes','lsdb','matrix','neighbor','drbdr','areas','spf'].forEach(function(t) {
      var b = document.getElementById('lsa-tab-'+t);
      if (b) b.classList.toggle('active', t===tab);
    });
    lsaRender();
  }
  
  function lsaSelectType(t, btn) {
    LSA_ACTIVE_TYPE = t;
    document.querySelectorAll('[id^="lsa-btn-"]').forEach(function(b) {
      b.classList.remove('active');
      var n = parseInt(b.id.replace('lsa-btn-',''));
      b.style.borderColor = LSA_DATA[n] ? LSA_COLORS[n]+'66' : '';
      b.style.color = LSA_DATA[n] ? LSA_COLORS[n] : '';
    });
    if (btn) { btn.classList.add('active'); btn.style.background = LSA_COLORS[t]+'33'; }
    lsaRender();
  }
  
  function lsaRender() {
    if (LSA_ACTIVE_TAB === 'detail')    lsaRenderDetail();
    else if (LSA_ACTIVE_TAB === 'bytes')    lsaRenderBytes();
    else if (LSA_ACTIVE_TAB === 'lsdb')     lsaRenderLSDB();
    else if (LSA_ACTIVE_TAB === 'matrix')   lsaRenderMatrix();
    else if (LSA_ACTIVE_TAB === 'neighbor') lsaRenderNeighbor();
    else if (LSA_ACTIVE_TAB === 'drbdr')    lsaRenderDRBDR();
    else if (LSA_ACTIVE_TAB === 'areas')    lsaRenderAreas();
    else if (LSA_ACTIVE_TAB === 'spf')      lsaRenderSPF();
  }
  
  // ═══════════════════════════════════════════════════════════
  // TAB 1: DETAIL VIEW
  // ═══════════════════════════════════════════════════════════
  function lsaRenderDetail() {
    var d = LSA_DATA[LSA_ACTIVE_TYPE]; if (!d) return;
    var col = LSA_COLORS[d.type];
  
    // Main pane
    var html = '';
  
    // Header card
    html += '<div style="background:'+col+'18;border:2px solid '+col+'55;border-radius:14px;padding:20px;margin-bottom:18px">';
    html += '<div style="display:flex;align-items:center;gap:14px;margin-bottom:14px">';
    html += '<div style="width:56px;height:56px;border-radius:12px;background:'+col+';display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-size:22px;font-weight:900;color:#fff;flex-shrink:0">T'+d.type+'</div>';
    html += '<div><div style="font-size:19px;font-weight:700;color:var(--text)">'+d.name+'</div>';
    html += '<div style="font-family:var(--mono);font-size:11px;color:var(--muted);margin-top:2px">'+d.rfc+'</div></div></div>';
    html += '<div style="font-family:var(--mono);font-size:12px;line-height:1.85;color:var(--muted2)">'+d.purpose+'</div>';
    html += '</div>';
  
    // Metadata grid
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:18px">';
    [
      ['Generated by', d.generated],
      ['Flooded to',   d.flooded],
      ['Blocked in',   d.blocked_in],
      ['SPF role',     d.spf_role]
    ].forEach(function(pair) {
      html += '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:12px">';
      html += '<div style="font-family:var(--mono);font-size:9px;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);margin-bottom:5px">'+pair[0]+'</div>';
      html += '<div style="font-family:var(--mono);font-size:11px;line-height:1.7;color:var(--text)">'+pair[1]+'</div>';
      html += '</div>';
    });
    html += '</div>';
  
    // Trigger events
    html += '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:14px;margin-bottom:18px">';
    html += '<div style="font-family:var(--mono);font-size:9px;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);margin-bottom:10px">What triggers this LSA</div>';
    d.triggers.forEach(function(t) {
      html += '<div style="display:flex;gap:8px;padding:5px 0;border-bottom:1px solid var(--border);font-family:var(--mono);font-size:11px;color:var(--muted2)">';
      html += '<span style="color:'+col+';flex-shrink:0">→</span>'+t+'</div>';
    });
    html += '</div>';
  
    // IOS show command + example
    html += '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:14px;margin-bottom:18px">';
    html += '<div style="font-family:var(--mono);font-size:9px;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);margin-bottom:8px">IOS verification command</div>';
    html += '<div style="font-family:var(--mono);font-size:12px;color:var(--cyan);margin-bottom:12px">'+d.ioscmd+'</div>';
    html += '<div style="font-family:var(--mono);font-size:10px;color:var(--muted2);white-space:pre-wrap;line-height:1.8">'+d.example_output+'</div>';
    html += '</div>';
  
    // Area behavior matrix
    html += '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:14px">';
    html += '<div style="font-family:var(--mono);font-size:9px;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);margin-bottom:10px">Area type behavior</div>';
    var areaColors = {stub:'#f59e0b',nssa:'#8b5cf6',totally:'#ef4444',backbone:'#3b82f6'};
    html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">';
    ['backbone','stub','nssa','totally'].forEach(function(a) {
      var v = d.area_impact ? d.area_impact[a] : 'N/A';
      var blocked = /BLOCK|N\/A|obsolete/i.test(v);
      html += '<div style="background:'+(blocked?'rgba(239,68,68,0.08)':'rgba(34,197,94,0.08)')+';border:1px solid '+(blocked?'rgba(239,68,68,0.3)':'rgba(34,197,94,0.25)')+';border-radius:8px;padding:10px">';
      html += '<div style="font-family:var(--mono);font-size:9px;color:'+areaColors[a]+';font-weight:700;margin-bottom:4px">'+a.toUpperCase()+'</div>';
      html += '<div style="font-family:var(--mono);font-size:10px;line-height:1.6;color:'+(blocked?'var(--red)':'var(--muted2)')+'">'+v+'</div>';
      html += '</div>';
    });
    html += '</div></div>';
  
    document.getElementById('lsa-main-pane').innerHTML = html;
    lsaRenderSide();
  }
  
  // ─── Side pane: header + body field tables ────────────────────────────
  function lsaRenderSide() {
    var d = LSA_DATA[LSA_ACTIVE_TYPE]; if (!d) return;
    var col = LSA_COLORS[d.type];
    var html = '';
  
    html += '<div style="font-family:var(--mono);font-size:9px;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);margin-bottom:10px">LSA common header (20 bytes)</div>';
    (d.header_fields||[]).forEach(function(f) {
      html += '<div style="padding:6px 0;border-bottom:1px solid var(--border)">';
      html += '<div style="display:flex;justify-content:space-between;gap:6px">';
      html += '<span style="font-family:var(--mono);font-size:10px;font-weight:600;color:var(--text)">'+f.name+'</span>';
      html += '<span style="font-family:var(--mono);font-size:9px;color:'+col+';background:'+col+'18;padding:1px 6px;border-radius:8px;white-space:nowrap">@'+f.off+'</span>';
      html += '</div>';
      html += '<div style="font-family:var(--mono);font-size:10px;color:var(--muted2);margin-top:2px">'+f.desc+'</div>';
      if (f.val) html += '<div style="font-family:var(--mono);font-size:9px;color:var(--cyan);margin-top:1px">e.g. '+f.val+'</div>';
      html += '</div>';
    });
  
    if (d.body_fields && d.body_fields.length) {
      html += '<div style="font-family:var(--mono);font-size:9px;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);margin:16px 0 10px">LSA-specific body</div>';
      d.body_fields.forEach(function(f) {
        html += '<div style="padding:6px 0;border-bottom:1px solid var(--border)">';
        html += '<div style="display:flex;justify-content:space-between;gap:6px">';
        html += '<span style="font-family:var(--mono);font-size:10px;font-weight:600;color:var(--text)">'+f.name+'</span>';
        html += '<span style="font-family:var(--mono);font-size:9px;color:'+col+';background:'+col+'18;padding:1px 6px;border-radius:8px;white-space:nowrap">@'+f.off+'</span>';
        html += '</div>';
        html += '<div style="font-family:var(--mono);font-size:10px;color:var(--muted2);margin-top:2px">'+f.desc+'</div>';
        if (f.val) html += '<div style="font-family:var(--mono);font-size:9px;color:var(--cyan);margin-top:1px">'+f.val+'</div>';
        html += '</div>';
      });
    }
  
    document.getElementById('lsa-side-pane').innerHTML = html;
  }
  
  // ═══════════════════════════════════════════════════════════
  // TAB 2: BYTE LAYOUT
  // ═══════════════════════════════════════════════════════════
  function lsaRenderBytes() {
    var d = LSA_DATA[LSA_ACTIVE_TYPE]; if (!d) return;
    var col = LSA_COLORS[d.type];
  
    // Build a visual byte-map: 4 bytes per row, labeled cells
    var byteMap = [
      // Row 0: bytes 0-3
      [{n:'LS Age (2B)',      bytes:2, color:'#3b82f6', desc:'Seconds since orig. MaxAge=3600'},
       {n:'Options (1B)',     bytes:1, color:'#6366f1', desc:'E N DC ... capability bits'},
       {n:'LS Type (1B)',     bytes:1, color:col,       desc:'Type '+d.type+' = 0x0'+d.type.toString(16).toUpperCase()}],
      // Row 1: bytes 4-7
      [{n:'Link State ID (4B)',bytes:4, color:'#22c55e', desc:d.type<=2?'Router ID':'Network or Router ID'}],
      // Row 2: bytes 8-11
      [{n:'Advertising Router (4B)',bytes:4, color:'#f59e0b', desc:'Originator Router ID'}],
      // Row 3: bytes 12-15
      [{n:'LS Sequence Number (4B)',bytes:4, color:'#8b5cf6', desc:'Monotonic. First=0x80000001'}],
      // Row 4: bytes 16-19
      [{n:'Checksum (2B)', bytes:2, color:'#ef4444',  desc:'Fletcher checksum excl. Age'},
       {n:'Length (2B)',   bytes:2, color:'#ec4899',  desc:'Total LSA bytes incl. header'}],
    ];
  
    // Type-specific body rows
    var bodyRows = {
      1:[
        [{n:'Flags (1B)',bytes:1,color:col,desc:'V/E/B bits'},{n:'Zero (1B)',bytes:1,color:'#555',desc:'Reserved'},{n:'# Links (2B)',bytes:2,color:col,desc:'Count of link entries'}],
        [{n:'Link ID (4B)',bytes:4,color:col,desc:'P2P:NbrRID | Transit:DR-IP | Stub:Net'}],
        [{n:'Link Data (4B)',bytes:4,color:col,desc:'P2P/transit:IfIP | Stub:Mask'}],
        [{n:'Type(1B)',bytes:1,color:col,desc:'1-4'},{n:'#TOS(1B)',bytes:1,color:'#555',desc:'=0'},{n:'TOS0 Metric(2B)',bytes:2,color:col,desc:'Interface cost'}],
        [{n:'... repeats for each link ...',bytes:4,color:'#444',desc:''}],
      ],
      2:[
        [{n:'Network Mask (4B)',bytes:4,color:col,desc:'Subnet mask of segment'}],
        [{n:'Attached Router 1 RID (4B)',bytes:4,color:col,desc:'DR Router ID'}],
        [{n:'Attached Router 2 RID (4B)',bytes:4,color:col,desc:'Next router on segment'}],
        [{n:'... one per attached router ...',bytes:4,color:'#444',desc:''}],
      ],
      3:[
        [{n:'Network Mask (4B)',bytes:4,color:col,desc:'Mask for prefix in Link State ID'}],
        [{n:'TOS=0 (1B)',bytes:1,color:'#555',desc:'0'},{n:'Metric (3B)',bytes:3,color:col,desc:'Cost from ABR to prefix'}],
      ],
      4:[
        [{n:'Network Mask = 0.0.0.0 (4B)',bytes:4,color:col,desc:'Always zero — host route to ASBR'}],
        [{n:'TOS=0 (1B)',bytes:1,color:'#555',desc:'0'},{n:'Metric (3B)',bytes:3,color:col,desc:'Cost from ABR to ASBR'}],
      ],
      5:[
        [{n:'Network Mask (4B)',bytes:4,color:col,desc:'External prefix mask'}],
        [{n:'E|TOS (1B)',bytes:1,color:col,desc:'E=1 Type-2 metric'},{n:'Metric (3B)',bytes:3,color:col,desc:'External metric value'}],
        [{n:'Forwarding Address (4B)',bytes:4,color:col,desc:'0.0.0.0 or explicit FWD'}],
        [{n:'External Route Tag (4B)',bytes:4,color:'#6b7280',desc:'Policy tag, not used by SPF'}],
      ],
      7:[
        [{n:'Network Mask (4B)',bytes:4,color:col,desc:'External prefix mask'}],
        [{n:'P|E|TOS (1B)',bytes:1,color:col,desc:'P=propagate to Type-5'},{n:'Metric (3B)',bytes:3,color:col,desc:'External metric'}],
        [{n:'Forwarding Address (4B)',bytes:4,color:'#ef4444',desc:'MUST be non-zero in NSSA!'}],
        [{n:'Route Tag (4B)',bytes:4,color:'#6b7280',desc:'Policy tag'}],
      ],
      9:[
        [{n:'Opaque Type (1B)',bytes:1,color:col,desc:'1=TE link'},{n:'Opaque ID (3B)',bytes:3,color:col,desc:'Instance'}],
        [{n:'TLV Type (2B)',bytes:2,color:col,desc:'2=Link TLV'},{n:'TLV Length (2B)',bytes:2,color:col,desc:'Bytes'}],
        [{n:'Sub-TLVs (variable)',bytes:4,color:'#444',desc:'Link type, addr, BW, TE metric...'}],
      ],
      10:[
        [{n:'Opaque Type (1B)',bytes:1,color:col,desc:'7=Ext Prefix, 8=Ext Link'},{n:'Opaque ID (3B)',bytes:3,color:col,desc:''}],
        [{n:'TLV Type (2B)',bytes:2,color:col,desc:'Extended Prefix/Link TLV'},{n:'TLV Length (2B)',bytes:2,color:col,desc:''}],
        [{n:'Prefix SID Sub-TLV (variable)',bytes:4,color:col,desc:'Flags, Algorithm, Node-SID index'}],
      ],
      11:[
        [{n:'Opaque Type (1B)',bytes:1,color:col,desc:'4=Router Info'},{n:'Opaque ID (3B)',bytes:3,color:col,desc:''}],
        [{n:'Router Info TLV (2B)',bytes:2,color:col,desc:'0x0001'},{n:'Length (2B)',bytes:2,color:col,desc:'4'}],
        [{n:'Capabilities (4B)',bytes:4,color:col,desc:'SR/TE/GR capability flags'}],
        [{n:'SRGB TLV: Range (3B)',bytes:3,color:col,desc:'1000 labels'},{n:'Start label (3B)',bytes:3,color:col,desc:'16000'}],
      ]
    };
  
    var allRows = byteMap.concat(bodyRows[d.type]||[
      [{n:'Body varies — see detail tab',bytes:4,color:'#444',desc:''}]
    ]);
  
    var TOTAL_W = 480, ROW_H = 48, PAD = 12;
    var svgH = allRows.length * (ROW_H + 4) + 80;
  
    var svg = '<svg width="100%" viewBox="0 0 '+TOTAL_W+' '+svgH+'" style="font-family:var(--mono)">';
    svg += '<defs><style>.byt{font-family:monospace;font-size:10px;} .byts{font-family:monospace;font-size:8px;}</style></defs>';
  
    // Byte offset labels column
    var byteOffset = 0;
    var y0 = 20;
  
    // Header row labels
    svg += '<text x="4" y="'+(y0-6)+'" font-family="monospace" font-size="9" fill="#666">BYTE</text>';
    svg += '<text x="4" y="'+(y0+4)+'" font-family="monospace" font-size="9" fill="#666">OFFSET</text>';
  
    // Draw header divider line
    var headerSep = byteMap.length * (ROW_H + 4) + y0 - 2;
  
    allRows.forEach(function(row, ri) {
      var isHeader = ri < byteMap.length;
      var y = y0 + ri * (ROW_H + 4);
      var bOff = byteOffset;
  
      // Offset label
      svg += '<text x="4" y="'+(y+ROW_H/2+4)+'" font-family="monospace" font-size="10" fill="#555" text-anchor="start">+'+bOff+'</text>';
  
      // Draw cells
      var xCursor = 50;
      var totalBytes = row.reduce(function(s,c){ return s+(c.bytes||1); },0);
      var availW = TOTAL_W - 50 - 8;
  
      row.forEach(function(cell) {
        var cw = Math.round((cell.bytes / 4) * availW) - 2;
        if (cell.bytes >= 4) cw = Math.round((cell.bytes / Math.max(4, totalBytes)) * availW) - 2;
        cw = Math.max(cw, 28);
  
        // Box
        svg += '<rect x="'+xCursor+'" y="'+y+'" width="'+cw+'" height="'+ROW_H+'" rx="5" fill="'+cell.color+'28" stroke="'+cell.color+'88" stroke-width="1.5"/>';
  
        // Name (truncate if needed)
        var name = cell.n;
        var maxChars = Math.floor(cw / 6.5);
        if (name.length > maxChars) name = name.substring(0, maxChars-1) + '…';
        svg += '<text x="'+(xCursor+cw/2)+'" y="'+(y+18)+'" text-anchor="middle" dominant-baseline="central" font-family="monospace" font-size="10" font-weight="600" fill="'+cell.color+'">'+name+'</text>';
  
        // Desc
        var desc = cell.desc||'';
        if (desc.length > Math.floor(cw/6)) desc = desc.substring(0,Math.floor(cw/6))+'…';
        svg += '<text x="'+(xCursor+cw/2)+'" y="'+(y+34)+'" text-anchor="middle" dominant-baseline="central" font-family="monospace" font-size="8" fill="#888">'+desc+'</text>';
  
        // Bits label bottom
        if (cell.bytes) svg += '<text x="'+(xCursor+3)+'" y="'+(y+ROW_H-3)+'" font-family="monospace" font-size="7" fill="'+cell.color+'88">'+cell.bytes*8+'b</text>';
  
        xCursor += cw + 2;
        byteOffset += cell.bytes;
      });
    });
  
    // Dashed separator after header
    svg += '<line x1="48" y1="'+headerSep+'" x2="'+TOTAL_W+'" y2="'+headerSep+'" stroke="#555" stroke-width="1" stroke-dasharray="4 3"/>';
    svg += '<text x="51" y="'+(headerSep-3)+'" font-family="monospace" font-size="8" fill="#555">← 20-byte common header</text>';
    svg += '<text x="51" y="'+(headerSep+9)+'" font-family="monospace" font-size="8" fill="'+col+'">↓ LSA-specific body</text>';
  
    svg += '</svg>';
  
    var mainHtml = '<div style="font-family:var(--mono);font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);margin-bottom:12px">Packet byte layout — Type '+d.type+' ('+d.name+')</div>';
    mainHtml += '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:16px;overflow-x:auto">'+svg+'</div>';
  
    // Bit-field detail for interesting fields
    mainHtml += '<div style="margin-top:18px;font-family:var(--mono);font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);margin-bottom:12px">Critical bit fields</div>';
    mainHtml += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">';
  
    // Options byte breakdown
    mainHtml += '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:12px">';
    mainHtml += '<div style="font-family:var(--mono);font-size:10px;font-weight:700;color:#6366f1;margin-bottom:8px">Options byte (offset 2)</div>';
    mainHtml += lsaBitField([
      {bit:7,name:'DN',color:'#6366f1',desc:'Down bit — VPN loop prevention'},
      {bit:6,name:'O',color:'#3b82f6',desc:'Opaque LSA support capable'},
      {bit:5,name:'DC',color:'#22c55e',desc:'Demand circuit — suppress hellos'},
      {bit:4,name:'EA',color:'#f59e0b',desc:'External attribute LSA support'},
      {bit:3,name:'NP',color:'#8b5cf6',desc:'N/P — NSSA-capable'},
      {bit:2,name:'MC',color:'#ec4899',desc:'Multicast OSPF capable'},
      {bit:1,name:'E',color:'#ef4444',desc:'External routing capable'},
      {bit:0,name:'MT',color:'#6b7280',desc:'Multi-topology capable'},
    ]);
    mainHtml += '</div>';
  
    // Type-1 flags or Type-5 E-bit depending on current type
    if (d.type === 1) {
      mainHtml += '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:12px">';
      mainHtml += '<div style="font-family:var(--mono);font-size:10px;font-weight:700;color:'+col+';margin-bottom:8px">Type-1 flags byte (offset 20)</div>';
      mainHtml += lsaBitField([
        {bit:7,name:'reserved',color:'#444',desc:'Must be 0'},
        {bit:6,name:'reserved',color:'#444',desc:''},
        {bit:5,name:'reserved',color:'#444',desc:''},
        {bit:4,name:'reserved',color:'#444',desc:''},
        {bit:3,name:'reserved',color:'#444',desc:''},
        {bit:2,name:'Nt',color:'#8b5cf6',desc:'NSSA-specific ABR'},
        {bit:1,name:'V',color:'#3b82f6',desc:'Virtual-link endpoint'},
        {bit:0,name:'E',color:'#ef4444',desc:'ASBR (has external routes)'},
      ]);
      mainHtml += '</div>';
    } else if (d.type === 5 || d.type === 7) {
      mainHtml += '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:12px">';
      mainHtml += '<div style="font-family:var(--mono);font-size:10px;font-weight:700;color:'+col+';margin-bottom:8px">Type-5 flags byte (offset 24)</div>';
      mainHtml += lsaBitField([
        {bit:7,name:'E',color:'#ef4444',desc:'E=0: Type-1 metric | E=1: Type-2 metric'},
        {bit:6,name:'P',color:'#8b5cf6',desc:'(Type-7) Propagate — translate to Type-5'},
        {bit:5,name:'F',color:'#22c55e',desc:'Forwarding address present'},
        {bit:4,name:'T',color:'#f59e0b',desc:'Route tag present'},
        {bit:3,name:'0',color:'#444',desc:'Reserved'},
        {bit:2,name:'0',color:'#444',desc:''},
        {bit:1,name:'0',color:'#444',desc:''},
        {bit:0,name:'TOS',color:'#6b7280',desc:'TOS value (always 0 today)'},
      ]);
      mainHtml += '</div>';
    } else {
      mainHtml += '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:12px">';
      mainHtml += '<div style="font-family:var(--mono);font-size:10px;font-weight:700;color:'+col+';margin-bottom:8px">LS Sequence Number</div>';
      mainHtml += '<div style="font-family:var(--mono);font-size:10px;line-height:1.9;color:var(--muted2)">First value: 0x80000001 (InitialSequenceNumber)<br>Increments by 1 each origination<br>Wraps: 0x7FFFFFFF → 0x80000001<br>MaxSequenceNumber = 0x7FFFFFFF<br><br>Higher sequence = newer. Stale LSA has lower sequence. Two LSAs with same seq: higher checksum wins.</div>';
      mainHtml += '</div>';
    }
    mainHtml += '</div>';
  
    document.getElementById('lsa-main-pane').innerHTML = mainHtml;
  
    // Side: aging + database mechanics
    var sideHtml = '';
    sideHtml += '<div style="font-family:var(--mono);font-size:9px;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);margin-bottom:10px">LSA aging mechanics</div>';
    var agingItems = [
      ['MinLSArrival',  '1000ms', 'Min time between same LSA from same originator'],
      ['MinLSInterval', '5000ms', 'Min time between router re-originating an LSA'],
      ['LSRefreshTime', '30 min', 'Periodic refresh — prevents premature expiry'],
      ['MaxAge',        '60 min', 'LSA flushed when LS Age reaches this value'],
      ['MaxAgeDiff',    '15 min', 'Two copies of same LSA can differ in age by this much'],
      ['LSAMaxSeq',     '0x7FFFFFFF', 'Sequence number wraps after this'],
    ];
    agingItems.forEach(function(a) {
      sideHtml += '<div style="padding:5px 0;border-bottom:1px solid var(--border)">';
      sideHtml += '<div style="display:flex;justify-content:space-between"><span style="font-family:var(--mono);font-size:10px;color:var(--text)">'+a[0]+'</span><span style="font-family:var(--mono);font-size:10px;color:var(--cyan)">'+a[1]+'</span></div>';
      sideHtml += '<div style="font-family:var(--mono);font-size:9px;color:var(--muted)">'+a[2]+'</div></div>';
    });
    sideHtml += '<div style="margin-top:14px;font-family:var(--mono);font-size:9px;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);margin-bottom:10px">Freshness comparison</div>';
    sideHtml += '<div style="font-family:var(--mono);font-size:10px;line-height:1.9;color:var(--muted2)">When two copies of same LSA arrive, OSPF picks the fresher one using this order:<br><br><span style="color:var(--text)">1.</span> Higher LS Seq Number wins<br><span style="color:var(--text)">2.</span> If same seq: higher checksum wins<br><span style="color:var(--text)">3.</span> If same checksum: age=MaxAge wins (flush request)<br><span style="color:var(--text);">4.</span> If one is MaxAge-15min older, newer wins<br><span style="color:var(--text);">5.</span> Otherwise: treat as identical (same copy)</div>';
    document.getElementById('lsa-side-pane').innerHTML = sideHtml;
  }
  
  function lsaBitField(bits) {
    var html = '<div style="display:flex;margin-bottom:8px">';
    bits.forEach(function(b) {
      html += '<div style="flex:1;border:1px solid '+b.color+'66;background:'+b.color+'18;text-align:center;padding:4px 2px">';
      html += '<div style="font-family:var(--mono);font-size:9px;font-weight:700;color:'+b.color+'">'+b.name+'</div>';
      html += '<div style="font-family:var(--mono);font-size:8px;color:#777">'+b.bit+'</div>';
      html += '</div>';
    });
    html += '</div>';
    html += '<div style="font-family:var(--mono);font-size:9px;line-height:1.8;color:var(--muted2)">';
    bits.filter(function(b){ return b.desc; }).forEach(function(b) {
      html += '<span style="color:'+b.color+'">'+b.name+'</span>: '+b.desc+'<br>';
    });
    html += '</div>';
    return html;
  }
  
  // ═══════════════════════════════════════════════════════════
  // TAB 3: LSDB BUILDER
  // ═══════════════════════════════════════════════════════════
  var LSDB_FILTER = 'all';
  
  function lsaRenderLSDB() {
    var sc = LSDB_SCENARIO;
  
    // Topology SVG
    var W = 560, H = 380;
    var routers = {};
    sc.topology.forEach(function(r){ routers[r.id]=r; });
    var areaColors = {'0':'#3b82f6','1':'#22c55e','2':'#f59e0b'};
  
    var svg = '<svg width="100%" viewBox="0 0 '+W+' '+H+'" style="display:block;overflow:visible">';
    svg += '<defs><marker id="lsarr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M2 2L8 5L2 8" fill="none" stroke="context-stroke" stroke-width="1.5"/></marker></defs>';
  
    // Area regions
    var areas = [
      {id:'0',label:'Area 0 (backbone)',x:140,y:50,w:290,h:150,color:'#3b82f6'},
      {id:'1',label:'Area 1',x:380,y:170,w:160,h:120,color:'#22c55e'},
      {id:'2',label:'Area 2',x:50,y:170,w:220,h:180,color:'#f59e0b'},
    ];
    areas.forEach(function(a) {
      svg += '<rect x="'+a.x+'" y="'+a.y+'" width="'+a.w+'" height="'+a.h+'" rx="12" fill="'+a.color+'0a" stroke="'+a.color+'44" stroke-width="1.5" stroke-dasharray="6 3"/>';
      svg += '<text x="'+(a.x+10)+'" y="'+(a.y+14)+'" font-family="monospace" font-size="10" font-weight="700" fill="'+a.color+'88">'+a.label+'</text>';
    });
  
    // Internet cloud for Type-5
    svg += '<ellipse cx="480" cy="320" rx="55" ry="30" fill="rgba(239,68,68,0.06)" stroke="rgba(239,68,68,0.3)" stroke-width="1.5" stroke-dasharray="5 3"/>';
    svg += '<text x="480" y="315" text-anchor="middle" font-family="monospace" font-size="9" fill="#ef444488">BGP Internet</text>';
    svg += '<text x="480" y="328" text-anchor="middle" font-family="monospace" font-size="9" fill="#ef444488">203.0.113.0/24</text>';
  
    // Links
    sc.links.forEach(function(l) {
      var a=routers[l.a], b=routers[l.b];
      var col = areaColors[l.area.toString()]||'#888';
      svg += '<line x1="'+a.x+'" y1="'+a.y+'" x2="'+b.x+'" y2="'+b.y+'" stroke="'+col+'99" stroke-width="2" marker-end="url(#lsarr)"/>';
      var mx=(a.x+b.x)/2+4, my=(a.y+b.y)/2-4;
      svg += '<text x="'+mx+'" y="'+my+'" font-family="monospace" font-size="9" fill="'+col+'cc">'+l.cost+'</text>';
    });
  
    // BGP link R5→internet
    svg += '<line x1="200" y1="320" x2="435" y2="320" stroke="#ef444477" stroke-width="1.5" stroke-dasharray="5 3" marker-end="url(#lsarr)"/>';
    svg += '<text x="320" y="314" text-anchor="middle" font-family="monospace" font-size="8" fill="#ef444499">redistribute BGP</text>';
  
    // Routers
    sc.topology.forEach(function(r) {
      var col = areaColors[r.area]||'#888';
      var roleColors={ABR:'#f59e0b',ASBR:'#ef4444',IR:'#3b82f6'};
      var rc = roleColors[r.role]||col;
      svg += '<circle cx="'+r.x+'" cy="'+r.y+'" r="20" fill="'+rc+'33" stroke="'+rc+'" stroke-width="2"/>';
      svg += '<text x="'+r.x+'" y="'+(r.y-1)+'" text-anchor="middle" dominant-baseline="central" font-family="monospace" font-size="11" font-weight="700" fill="'+rc+'">'+r.id+'</text>';
      svg += '<text x="'+r.x+'" y="'+(r.y+31)+'" text-anchor="middle" font-family="monospace" font-size="8" fill="'+rc+'aa">'+r.rid+'</text>';
      if (r.role!=='IR') svg += '<text x="'+r.x+'" y="'+(r.y+41)+'" text-anchor="middle" font-family="monospace" font-size="8" fill="'+rc+'bb">['+r.role+']</text>';
    });
  
    svg += '</svg>';
  
    // Filter buttons
    var fbtns = '<div style="display:flex;gap:5px;flex-wrap:wrap;margin:12px 0">';
    ['all','1','2','3','4','5','7'].forEach(function(t) {
      var col2 = t==='all'?'#888':LSA_COLORS[parseInt(t)]||'#888';
      var active = LSDB_FILTER===t;
      fbtns += '<button onclick="LSDB_FILTER=\''+t+'\';lsaRenderLSDB()" style="font-family:var(--mono);font-size:10px;padding:3px 10px;border-radius:12px;border:1px solid '+col2+(active?'':'44')+';background:'+col2+(active?'33':'11')+';color:'+col2+';cursor:pointer">'+(t==='all'?'All types':'T'+t+'</button>');
    });
    fbtns += '</div>';
  
    // LSDB table
    var filtered = LSDB_FILTER==='all' ? sc.lsdb : sc.lsdb.filter(function(e){ return e.type===parseInt(LSDB_FILTER); });
    var table = '<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-family:var(--mono);font-size:10px">';
    table += '<tr style="border-bottom:2px solid var(--border)">';
    table += '<th style="padding:6px 8px;text-align:left;color:var(--muted);white-space:nowrap">Type</th>';
    table += '<th style="padding:6px 8px;text-align:left;color:var(--muted)">Area</th>';
    table += '<th style="padding:6px 8px;text-align:left;color:var(--muted)">Orig</th>';
    table += '<th style="padding:6px 8px;text-align:left;color:var(--muted)">Link State ID</th>';
    table += '<th style="padding:6px 8px;text-align:left;color:var(--muted)">Description</th>';
    table += '</tr>';
    filtered.forEach(function(e) {
      var col2 = LSA_COLORS[e.type]||'#888';
      table += '<tr style="border-bottom:1px solid var(--border)">';
      table += '<td style="padding:5px 8px"><span style="background:'+col2+'22;color:'+col2+';border:1px solid '+col2+'44;border-radius:6px;padding:1px 7px;font-weight:700">T'+e.type+'</span></td>';
      table += '<td style="padding:5px 8px;color:var(--muted2)">'+(e.area==='ALL'?'<span style="color:#ef4444">ALL</span>':e.area)+'</td>';
      table += '<td style="padding:5px 8px;color:var(--cyan)">'+e.orig+'</td>';
      table += '<td style="padding:5px 8px;color:var(--text);font-weight:600">'+e.id+'</td>';
      table += '<td style="padding:5px 8px;color:var(--muted2)">'+e.desc+'</td>';
      table += '</tr>';
    });
    table += '</table></div>';
  
    var mainHtml = '<div style="font-family:var(--mono);font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);margin-bottom:10px">Network topology</div>';
    mainHtml += '<div style="background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:14px;margin-bottom:14px">'+svg+'</div>';
    mainHtml += '<div style="font-family:var(--mono);font-size:11px;color:var(--muted2);margin-bottom:4px">'+sc.desc+'</div>';
    mainHtml += fbtns;
    mainHtml += '<div style="font-family:var(--mono);font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);margin-bottom:8px">LSDB contents ('+filtered.length+' entries)</div>';
    mainHtml += table;
  
    document.getElementById('lsa-main-pane').innerHTML = mainHtml;
  
    // Side pane: LSDB construction sequence
    var sideHtml = '<div style="font-family:var(--mono);font-size:9px;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);margin-bottom:10px">How LSDB is built</div>';
    var steps = [
      {n:'1. Adjacency forms',  col:'#3b82f6', d:'Routers exchange DBD, LSR, LSU packets. All LSAs in neighbor\'s LSDB are flooded.'},
      {n:'2. Type-1 flooded',   col:'#3b82f6', d:'Every router generates Router LSA. Flooded within area. Forms topology graph.'},
      {n:'3. Type-2 flooded',   col:'#6366f1', d:'DR generates Network LSA per broadcast segment. All routers on segment add it.'},
      {n:'4. ABR generates T3', col:'#22c55e', d:'ABR summarizes intra-area routes as Type-3 into adjacent areas.'},
      {n:'5. ABR generates T4', col:'#f59e0b', d:'ABR originates ASBR Summary LSA into areas that need external routes.'},
      {n:'6. ASBR originates T5',col:'#ef4444',d:'ASBR floods external routes AS-wide (except stub/NSSA).'},
      {n:'7. SPF runs',         col:'#8b5cf6', d:'Each router runs Dijkstra on its area\'s Type-1/2 LSAs to build shortest-path tree.'},
      {n:'8. Inter-area routes',col:'#22c55e', d:'Type-3 LSAs processed: cost = ABR-path-cost + T3-metric.'},
      {n:'9. External routes',  col:'#ef4444', d:'Type-4 gives path to ASBR; Type-5 gives external metric. Total = T4+T5.'},
    ];
    steps.forEach(function(s) {
      sideHtml += '<div style="display:flex;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)">';
      sideHtml += '<div style="width:6px;border-radius:3px;background:'+s.col+';flex-shrink:0;margin-top:2px"></div>';
      sideHtml += '<div><div style="font-family:var(--mono);font-size:10px;font-weight:700;color:var(--text)">'+s.n+'</div>';
      sideHtml += '<div style="font-family:var(--mono);font-size:9px;color:var(--muted2)">'+s.d+'</div></div></div>';
    });
    document.getElementById('lsa-side-pane').innerHTML = sideHtml;
  }
  
  // ═══════════════════════════════════════════════════════════
  // TAB 4: TYPE MATRIX
  // ═══════════════════════════════════════════════════════════
  function lsaRenderMatrix() {
    var types = Object.values(LSA_DATA);
  
    var mainHtml = '<div style="font-family:var(--mono);font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);margin-bottom:12px">All 11 LSA types — click any row to explore</div>';
  
    // Summary table — full width
    mainHtml += '<table style="width:100%;border-collapse:collapse;font-family:var(--mono);font-size:11px">';
    mainHtml += '<tr style="border-bottom:2px solid var(--border)">';
    ['Type','Name','Generated by','Scope','Blocked in','SPF role'].forEach(function(h) {
      mainHtml += '<th style="padding:8px 10px;text-align:left;color:var(--muted);white-space:nowrap;font-weight:600">'+h+'</th>';
    });
    mainHtml += '</tr>';
  
    types.forEach(function(d) {
      var col = LSA_COLORS[d.type];
      var blocked = /stub|nssa|N\/A|obsolete/i.test(d.blocked_in) ? d.blocked_in.substring(0,25) : '—';
      var spfShort = {
        1:'Primary SPF graph',2:'Pseudo-node in SPF',3:'Inter-area (post-SPF)',
        4:'ASBR reachability',5:'External (post-SPF)',6:'MOSPF only (obsolete)',
        7:'NSSA external',8:'BGP attr (obsolete)',9:'TE link data (CSPF)',
        10:'SR Node-SID (CSPF)',11:'Domain caps'
      }[d.type]||'—';
      mainHtml += '<tr onclick="lsaSelectType('+d.type+',null);lsaTab(\'detail\',document.getElementById(\'lsa-tab-detail\'))" style="border-bottom:1px solid var(--border);cursor:pointer" onmouseover="this.style.background=\'rgba(255,255,255,0.03)\'" onmouseout="this.style.background=\'\'">'+
        '<td style="padding:8px 10px"><span style="background:'+col+'22;color:'+col+';border:1px solid '+col+'44;border-radius:6px;padding:2px 9px;font-weight:700">T'+d.type+'</span></td>'+
        '<td style="padding:8px 10px;font-weight:600;color:var(--text)">'+d.name+'</td>'+
        '<td style="padding:8px 10px;color:var(--muted2)">'+d.generated.substring(0,40)+(d.generated.length>40?'…':'')+'</td>'+
        '<td style="padding:8px 10px;color:var(--muted2)">'+d.flooded.substring(0,35)+(d.flooded.length>35?'…':'')+'</td>'+
        '<td style="padding:8px 10px;color:'+(blocked==='—'?'var(--muted)':'var(--red)')+'">'+(blocked)+'</td>'+
        '<td style="padding:8px 10px;color:var(--cyan)">'+spfShort+'</td>'+
      '</tr>';
    });
    mainHtml += '</table>';
  
    // Area type grid
    mainHtml += '<div style="margin-top:22px;font-family:var(--mono);font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);margin-bottom:12px">LSA presence in each area type</div>';
    var areaTypes = ['backbone','stub','totally-stubby','nssa','totally-nssa'];
    var presence = {
      1: {backbone:'✓',stub:'✓',     'totally-stubby':'✓',   nssa:'✓',     'totally-nssa':'✓'},
      2: {backbone:'✓',stub:'✓',     'totally-stubby':'✓',   nssa:'✓',     'totally-nssa':'✓'},
      3: {backbone:'✓',stub:'default only','totally-stubby':'none',nssa:'✓','totally-nssa':'default only'},
      4: {backbone:'✓',stub:'✗',     'totally-stubby':'✗',   nssa:'✗',     'totally-nssa':'✗'},
      5: {backbone:'✓',stub:'✗',     'totally-stubby':'✗',   nssa:'✗',     'totally-nssa':'✗'},
      6: {backbone:'obsolete',stub:'obsolete','totally-stubby':'obsolete',nssa:'obsolete','totally-nssa':'obsolete'},
      7: {backbone:'✗',stub:'✗',     'totally-stubby':'✗',   nssa:'✓',     'totally-nssa':'✓'},
      8: {backbone:'✓',stub:'✗',     'totally-stubby':'✗',   nssa:'✗',     'totally-nssa':'✗'},
      9: {backbone:'link-local',stub:'link-local','totally-stubby':'link-local',nssa:'link-local','totally-nssa':'link-local'},
      10:{backbone:'✓',stub:'✓',     'totally-stubby':'✓',   nssa:'✓',     'totally-nssa':'✓'},
      11:{backbone:'✓',stub:'✗',     'totally-stubby':'✗',   nssa:'✗',     'totally-nssa':'✗'},
    };
  
    mainHtml += '<div style="overflow-x:auto"><table style="border-collapse:collapse;font-family:var(--mono);font-size:10px">';
    mainHtml += '<tr><th style="padding:6px 10px;text-align:left;color:var(--muted)">Type</th>';
    areaTypes.forEach(function(a) {
      mainHtml += '<th style="padding:6px 12px;color:var(--muted);white-space:nowrap">'+a+'</th>';
    });
    mainHtml += '</tr>';
  
    types.forEach(function(d) {
      var col = LSA_COLORS[d.type];
      mainHtml += '<tr style="border-bottom:1px solid var(--border)">';
      mainHtml += '<td style="padding:5px 10px"><span style="background:'+col+'22;color:'+col+';border:1px solid '+col+'44;border-radius:5px;padding:1px 7px;font-weight:700">T'+d.type+'</span></td>';
      areaTypes.forEach(function(a) {
        var v = (presence[d.type]||{})[a]||'?';
        var isOk = v==='✓'||v==='link-local';
        var isNo = v==='✗'||v==='obsolete';
        var bgc = isOk?'rgba(34,197,94,0.1)':isNo?'rgba(239,68,68,0.07)':'rgba(245,158,11,0.08)';
        var tc = isOk?'var(--green)':isNo?'var(--red)':'#f59e0b';
        mainHtml += '<td style="padding:5px 12px;text-align:center;background:'+bgc+';color:'+tc+';font-size:10px;border:1px solid var(--border)">'+v+'</td>';
      });
      mainHtml += '</tr>';
    });
    mainHtml += '</table></div>';
  
    document.getElementById('lsa-main-pane').innerHTML = mainHtml;
  
    // Side: quick facts
    var sideHtml = '<div style="font-family:var(--mono);font-size:9px;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);margin-bottom:10px">Key exam facts</div>';
    var facts = [
      {col:'#3b82f6',t:'Types 1 & 2',d:'Only types used directly in Dijkstra SPF. Everything else is post-SPF processing.'},
      {col:'#22c55e',t:'Type 3 at ABR',d:'ABR does NOT flood Type-1 across areas. It summarizes as Type-3. This is distance-vector behavior.'},
      {col:'#f59e0b',t:'Type 4 purpose',d:'Routers in other areas need Type-4 to know HOW to reach the ASBR from Type-5.'},
      {col:'#ef4444',t:'Type 5 vs Type 7',d:'Type-5 floods everywhere except stub/NSSA. Type-7 stays inside NSSA. ABR translates 7→5.'},
      {col:'#8b5cf6',t:'Forwarding Address',d:'Type-7 MUST have non-zero FA. Type-5 usually 0.0.0.0. Non-zero FA means: don\'t send to ASBR, send to FA directly.'},
      {col:'#ec4899',t:'E1 vs E2',d:'E1: external metric + OSPF cost = total. E2: external metric only, OSPF cost ignored. E1 preferred if equal E2 cost.'},
      {col:'#06b6d4',t:'Opaque 9/10/11',d:'MPLS TE uses Type-9/10. SR-MPLS uses Type-10 for Node-SIDs. Type-11 for SRGB range advertisement.'},
      {col:'#0891b2',t:'Stub area rules',d:'No Type-4, Type-5. Receives Type-3 default route from ABR. Routers cannot be ASBR.'},
    ];
    facts.forEach(function(f) {
      sideHtml += '<div style="padding:7px 0;border-bottom:1px solid var(--border)">';
      sideHtml += '<div style="font-family:var(--mono);font-size:10px;font-weight:700;color:'+f.col+';margin-bottom:3px">'+f.t+'</div>';
      sideHtml += '<div style="font-family:var(--mono);font-size:10px;line-height:1.6;color:var(--muted2)">'+f.d+'</div>';
      sideHtml += '</div>';
    });
    document.getElementById('lsa-side-pane').innerHTML = sideHtml;
  }
  
  // ═══════════════════════════════════════════════════════════
  // TAB 5: OSPF NEIGHBOR STATES
  // ═══════════════════════════════════════════════════════════
  var NEIGHBOR_STEP = 0;
  var NEIGHBOR_STATES = [
    {
      name:'DOWN', color:'#f87171', icon:'💀',
      what:'No Hello packets received from neighbor. Either neighbor is unreachable, interface is down, or OSPF not configured.',
      packets:'None sent yet (or last Hello timed out)',
      timers:'Dead interval expired (4× hello = 40s default)',
      cisco_show:'Neighbor 10.0.0.2 is DOWN — never seen',
      ccie_trap:'A neighbor in DOWN for a known IP usually means Hello received but dead interval expired. Check: ip ospf dead-interval, network statement, passive-interface.',
      common_fix:'Check interface state, OSPF network statement, ACLs blocking 224.0.0.5'
    },
    {
      name:'INIT', color:'#fb923c', icon:'👋',
      what:'Hello packet received from neighbor, but our Router-ID is NOT yet listed in that Hello\'s neighbor list. One-way communication only.',
      packets:'Received: Hello from neighbor (missing our RID in neighbor list)\nSent: Hello with neighbor\'s RID listed',
      timers:'Hello interval (10s broadcast, 30s NBMA)',
      cisco_show:'Neighbor 10.0.0.2, state INIT',
      ccie_trap:'INIT usually means the neighbor received OUR hello and listed us, but we haven\'t seen THEIR hello list OUR RID yet. Common cause: multicast issue (neighbor only hears us, not vice versa — asymmetric link or ACL dropping one direction).',
      common_fix:'Check: ip ospf hello-interval match, same area, same subnet mask, authentication match'
    },
    {
      name:'2-WAY', color:'#fbbf24', icon:'🤝',
      what:'Bidirectional communication established. Both routers see each other in Hello neighbor lists. This is the STABLE state for DROther routers on broadcast segments.',
      packets:'Hellos exchanged with both RIDs in neighbor lists',
      timers:'Hello keepalives continue every 10s',
      cisco_show:'Neighbor 2.2.2.2, state 2WAY/DROTHER',
      ccie_trap:'On Ethernet, DROther routers stay at 2-WAY with each other permanently — they only go FULL with DR and BDR. This is BY DESIGN, not a problem. If you need full adjacency between all routers, use point-to-point or point-to-multipoint network type.',
      common_fix:'Normal state for DROther. To force FULL: ip ospf network point-to-point (loses DR/BDR)'
    },
    {
      name:'EXSTART', color:'#a78bfa', icon:'🗳️',
      what:'Master/Slave election using Router-ID. Higher RID becomes Master. Master sets initial DBD sequence number. This initiates the database exchange.',
      packets:'Empty DBD (Database Description) packets with I-bit, M-bit, MS-bit\nHigher RID wins Master role',
      timers:'Retransmit interval (5s default) if no DBD ack',
      cisco_show:'Neighbor 2.2.2.2, state EXSTART',
      ccie_trap:'STUCK IN EXSTART = MTU MISMATCH (95% of cases). One side sends DBD, other drops it silently because packet exceeds its IP MTU. Fix: "ip ospf mtu-ignore" on both interfaces, or match MTU. Also check: duplicate Router IDs — two routers with same RID both think they\'re Master.',
      common_fix:'ip ospf mtu-ignore OR match ip mtu on both sides. Check: show ip ospf neighbor detail → look for DBD retransmissions'
    },
    {
      name:'EXCHANGE', color:'#38d9c0', icon:'📦',
      what:'Routers exchange full DBD (Database Description) packets listing all LSA headers in their LSDB. Each router builds a "request list" of LSAs it doesn\'t have.',
      packets:'DBD packets with LSA headers (Type, ID, Age, Seq#, Checksum)\nDD Seq numbers acknowledged\nLS Request packets queued',
      timers:'Retransmit interval for unacked DBDs',
      cisco_show:'Neighbor 2.2.2.2, state EXCHANGE',
      ccie_trap:'STUCK IN EXCHANGE: Usually authentication mismatch (Type 1 simple vs Type 2 MD5), or one side has corrupted LSA that causes checksum failure on receipt. Check: debug ip ospf adj — look for authentication errors.',
      common_fix:'Check authentication type and password match. Verify: show ip ospf interface, show ip ospf neighbor detail'
    },
    {
      name:'LOADING', color:'#4ade80', icon:'⬇️',
      what:'Router sends LS Request packets for LSAs listed in its request list. Neighbor responds with LS Update containing the actual LSA data. LSDB is being synchronized.',
      packets:'LS Request → LSA headers we need\nLS Update ← full LSA data from neighbor\nLS Ack → acknowledge each received LSA',
      timers:'RxmtInterval (5s): retransmit unacked LS Requests',
      cisco_show:'Neighbor 2.2.2.2, state LOADING',
      ccie_trap:'STUCK IN LOADING: Almost always a bad/corrupted LSA. One router has an LSA the other keeps requesting but the LS Update arrives corrupt (bad checksum). OSPF will retry indefinitely. Fix: "clear ip ospf process" on one or both routers. In rare cases, a bug causes phantom LSAs.',
      common_fix:'clear ip ospf process (non-disruptive in lab, carefully in production). Check: debug ip ospf packet'
    },
    {
      name:'FULL', color:'#5b9cf6', icon:'✅',
      what:'LSDB fully synchronized. Both routers have identical Link State Databases. SPF can now run. Adjacency is complete. This is the ONLY state where OSPF routes are installed.',
      packets:'Hello keepalives only (every 10s)\nLS Updates for topology changes\nLS Ack for all updates',
      timers:'Hello: 10s, Dead: 40s, LSA refresh: 30min, MaxAge: 60min',
      cisco_show:'Neighbor 2.2.2.2, state FULL/DR',
      ccie_trap:'Routes disappear suddenly from FULL neighbor: Check for LSA MaxAge (3600s). If LSA reaches MaxAge without refresh, it\'s flushed. Also: OSPF process ID is LOCAL significance only — R1 "router ospf 1" can neighbor with R2 "router ospf 99". Process IDs don\'t need to match.',
      common_fix:'Normal desired state. If dropping from FULL: check dead interval, link stability, CPU/memory on routers'
    }
  ];
  
  function lsaRenderNeighbor() {
    var s = NEIGHBOR_STEP;
    var cur = NEIGHBOR_STATES[s];
  
    // Build SVG state machine
    var svgW = 660, svgH = 100;
    var svg = '<svg viewBox="0 0 '+svgW+' '+svgH+'" style="width:100%;display:block;margin-bottom:18px" xmlns="http://www.w3.org/2000/svg">';
    var states = NEIGHBOR_STATES;
    var slotW = svgW / states.length;
    states.forEach(function(st, i) {
      var cx = slotW*i + slotW/2, cy = 50, r = 28;
      var active = i === s;
      var done = i < s;
      var col = done ? '#4ade80' : active ? st.color : '#1e2438';
      var tcol = done ? '#07090f' : active ? '#07090f' : '#5a6080';
      var stroke = done ? '#4ade80' : active ? st.color : '#2d3450';
      svg += '<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="'+col+'" stroke="'+stroke+'" stroke-width="'+(active?2.5:1.5)+'"/>';
      svg += '<text x="'+cx+'" y="'+(cy-8)+'" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" font-weight="700" fill="'+tcol+'">'+st.name+'</text>';
      svg += '<text x="'+cx+'" y="'+(cy+6)+'" text-anchor="middle" font-size="14">'+st.icon+'</text>';
      // Arrow
      if (i < states.length-1) {
        var ax = cx+r+2, ay = cy;
        svg += '<line x1="'+ax+'" y1="'+ay+'" x2="'+(cx+slotW-r-2)+'" y2="'+ay+'" stroke="'+(done?'#4ade8066':'#2d345088')+'" stroke-width="1.5" marker-end="url(#arr)"/>';
      }
    });
    svg += '<defs><marker id="arr" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#4ade8066"/></marker></defs>';
    svg += '</svg>';
  
    var html = '<div style="font-family:var(--mono);font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);margin-bottom:12px">OSPF Neighbor State Machine — 7 States (RFC 2328)</div>';
    html += svg;
  
    // Navigation
    html += '<div style="display:flex;gap:8px;align-items:center;margin-bottom:16px">';
    html += '<button onclick="ospfNeighStep(-1)" style="padding:5px 16px;border-radius:7px;border:1px solid var(--border2);background:transparent;color:var(--muted2);font-family:var(--mono);font-size:11px;cursor:pointer">◀ Prev</button>';
    for (var i=0;i<NEIGHBOR_STATES.length;i++) {
      var active=(i===s);
      html+='<div onclick="ospfNeighStep('+(i-s)+')" style="width:9px;height:9px;border-radius:50%;background:'+(active?NEIGHBOR_STATES[i].color:'#2d3450')+';cursor:pointer;border:1px solid '+(active?NEIGHBOR_STATES[i].color:'#3a4060')+'"></div>';
    }
    html += '<button onclick="ospfNeighStep(1)" style="padding:5px 16px;border-radius:7px;border:none;background:'+cur.color+';color:#07090f;font-family:var(--mono);font-size:11px;font-weight:700;cursor:pointer">Next ▶</button>';
    html += '<span style="margin-left:auto;font-family:var(--mono);font-size:10px;color:var(--muted)">State '+(s+1)+' of '+NEIGHBOR_STATES.length+'</span>';
    html += '</div>';
  
    // State detail card
    html += '<div style="background:var(--bg3);border:1.5px solid '+cur.color+'44;border-radius:12px;padding:16px;margin-bottom:14px">';
    html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">';
    html += '<span style="font-size:24px">'+cur.icon+'</span>';
    html += '<div><div style="font-family:var(--mono);font-size:16px;font-weight:700;color:'+cur.color+'">'+cur.name+'</div>';
    html += '<div style="font-family:var(--mono);font-size:10px;color:var(--muted)">State '+(s+1)+'/7 of OSPF neighbor formation</div></div>';
    html += '</div>';
    html += '<div style="font-size:12px;color:var(--text);line-height:1.8;margin-bottom:12px">'+cur.what+'</div>';
  
    // Packets
    html += '<div style="background:var(--bg2);border-radius:8px;padding:10px;margin-bottom:10px">';
    html += '<div style="font-family:var(--mono);font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:5px">📦 Packets exchanged</div>';
    html += '<div style="font-family:var(--mono);font-size:11px;color:var(--cyan);white-space:pre-line;line-height:1.7">'+cur.packets+'</div>';
    html += '</div>';
  
    // IOS output
    html += '<div style="background:var(--bg);border-radius:8px;padding:10px;margin-bottom:10px;border:1px solid rgba(91,156,246,0.15)">';
    html += '<div style="font-family:var(--mono);font-size:9px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:5px">💻 show ip ospf neighbor</div>';
    html += '<div style="font-family:var(--mono);font-size:11px;color:var(--green)">'+cur.cisco_show+'</div>';
    html += '</div>';
  
    // CCIE trap
    html += '<div style="background:rgba(251,191,36,0.07);border:1px solid rgba(251,191,36,0.3);border-radius:8px;padding:10px">';
    html += '<div style="font-family:var(--mono);font-size:9px;color:var(--amber);text-transform:uppercase;letter-spacing:1px;margin-bottom:5px">⚠️ CCIE Trap / Stuck State Cause</div>';
    html += '<div style="font-family:var(--mono);font-size:11px;color:var(--muted2);line-height:1.7">'+cur.ccie_trap+'</div>';
    html += '</div>';
    html += '</div>';
  
    // Timers reference
    html += '<div style="background:var(--bg3);border-radius:10px;padding:12px;margin-bottom:14px">';
    html += '<div style="font-family:var(--mono);font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">⏱ Timers at this state</div>';
    html += '<div style="font-family:var(--mono);font-size:11px;color:var(--blue)">'+cur.timers+'</div>';
    html += '</div>';
  
    // Full troubleshooting table
    html += '<div style="font-family:var(--mono);font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">🔧 Quick Reference — All Stuck States</div>';
    html += '<table style="width:100%;border-collapse:collapse;font-family:var(--mono);font-size:10px">';
    html += '<tr style="border-bottom:1px solid var(--border)"><th style="padding:5px 8px;text-align:left;color:var(--muted)">Stuck State</th><th style="padding:5px 8px;text-align:left;color:var(--muted)">Top Cause</th><th style="padding:5px 8px;text-align:left;color:var(--muted)">Fix</th></tr>';
    [
      ['INIT','ACL blocking 224.0.0.5, wrong area','Fix ACL, verify network stmt'],
      ['2-WAY','Normal for DROther (not a problem)','Use p2p network type if FULL needed'],
      ['EXSTART','MTU mismatch (most common)','ip ospf mtu-ignore or match MTU'],
      ['EXCHANGE','Auth mismatch, duplicate RID','Match auth type/key, check RIDs'],
      ['LOADING','Corrupt LSA in LSDB','clear ip ospf process'],
      ['FULL→DOWN','Dead interval expiry, link flap','Check physical, hello timers'],
    ].forEach(function(r) {
      html += '<tr style="border-bottom:1px solid rgba(255,255,255,0.04)">';
      html += '<td style="padding:5px 8px;color:var(--amber)">'+r[0]+'</td>';
      html += '<td style="padding:5px 8px;color:var(--muted2)">'+r[1]+'</td>';
      html += '<td style="padding:5px 8px;color:var(--cyan)">'+r[2]+'</td>';
      html += '</tr>';
    });
    html += '</table>';
  
    document.getElementById('lsa-main-pane').innerHTML = html;
  
    // Side: packet types reference
    var side = '<div style="font-family:var(--mono);font-size:9px;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);margin-bottom:10px">OSPF Packet Types</div>';
    [
      {t:'1',n:'Hello',col:'#5b9cf6',d:'Discover neighbors, elect DR/BDR, keepalive. Sent to 224.0.0.5 every 10s (broadcast) or 30s (NBMA).'},
      {t:'2',n:'DBD',col:'#38d9c0',d:'Database Description. Lists LSA headers in LSDB. Used in EXSTART and EXCHANGE states.'},
      {t:'3',n:'LSR',col:'#4ade80',d:'Link State Request. "Give me LSA X." Sent in LOADING state for LSAs we don\'t have.'},
      {t:'4',n:'LSU',col:'#fbbf24',d:'Link State Update. Contains actual LSA data. Response to LSR, also used for topology changes.'},
      {t:'5',n:'LSAck',col:'#f472b6',d:'Acknowledgment for received LSAs. Sent for every LSU received. Without ack, LSU is retransmitted.'},
    ].forEach(function(p) {
      side += '<div style="padding:7px 0;border-bottom:1px solid var(--border)">';
      side += '<div style="font-family:var(--mono);font-size:10px;font-weight:700;margin-bottom:3px"><span style="background:'+p.col+'22;color:'+p.col+';border:1px solid '+p.col+'44;border-radius:4px;padding:1px 6px">Type '+p.t+'</span> <span style="color:var(--text)">'+p.n+'</span></div>';
      side += '<div style="font-family:var(--mono);font-size:10px;line-height:1.6;color:var(--muted2)">'+p.d+'</div>';
      side += '</div>';
    });
    side += '<div style="margin-top:14px;padding:10px;background:var(--bg3);border-radius:8px">';
    side += '<div style="font-family:var(--mono);font-size:9px;color:var(--muted);margin-bottom:6px;text-transform:uppercase">MULTICAST ADDRESSES</div>';
    side += '<div style="font-family:var(--mono);font-size:11px;line-height:1.8"><span style="color:var(--cyan)">224.0.0.5</span> <span style="color:var(--muted2)">All OSPF Routers</span><br>';
    side += '<span style="color:var(--amber)">224.0.0.6</span> <span style="color:var(--muted2)">DR/BDR only</span></div>';
    side += '</div>';
    document.getElementById('lsa-side-pane').innerHTML = side;
  }
  
  function ospfNeighStep(delta) {
    NEIGHBOR_STEP = Math.max(0, Math.min(NEIGHBOR_STATES.length-1, NEIGHBOR_STEP+delta));
    lsaRenderNeighbor();
  }
  
  // ═══════════════════════════════════════════════════════════
  // TAB 6: DR/BDR ELECTION
  // ═══════════════════════════════════════════════════════════
  var DRBDR_ROUTERS = [
    {id:'R1', priority:1,  rid:'1.1.1.1', iface:'10.0.0.1', role:''},
    {id:'R2', priority:255,rid:'2.2.2.2', iface:'10.0.0.2', role:''},
    {id:'R3', priority:1,  rid:'3.3.3.3', iface:'10.0.0.3', role:''},
    {id:'R4', priority:0,  rid:'4.4.4.4', iface:'10.0.0.4', role:''},
    {id:'R5', priority:1,  rid:'5.5.5.5', iface:'10.0.0.5', role:''},
  ];
  var DRBDR_ELECTED = false;
  
  function lsaRenderDRBDR() {
    var html = '<div style="font-family:var(--mono);font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);margin-bottom:14px">DR/BDR Election Simulator — Multi-Access Ethernet Segment</div>';
  
    // Callout
    html += '<div style="background:rgba(56,217,192,0.07);border:1px solid rgba(56,217,192,0.25);border-radius:10px;padding:12px;margin-bottom:14px;font-family:var(--mono);font-size:11px;line-height:1.8;color:var(--muted2)">';
    html += '<strong style="color:var(--cyan)">Why DR/BDR?</strong> On a broadcast segment with N routers, without DR you need N×(N-1)/2 adjacencies. With DR, each router forms adjacency only with DR and BDR. For 5 routers: <span style="color:var(--red)">10 adjacencies</span> → <span style="color:var(--green)">4 adjacencies</span>. DR collects and floods LSAs on behalf of the segment, using multicast 224.0.0.6 (DR/BDR-only) and 224.0.0.5 (all routers).';
    html += '</div>';
  
    // Router table - editable
    html += '<div style="margin-bottom:14px">';
    html += '<div style="font-family:var(--mono);font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Configure routers on the Ethernet segment:</div>';
    html += '<table style="width:100%;border-collapse:collapse;font-family:var(--mono);font-size:11px">';
    html += '<tr style="border-bottom:1px solid var(--border)"><th style="padding:6px 8px;text-align:left;color:var(--muted)">Router</th><th style="padding:6px 8px;color:var(--muted)">Priority (0–255)</th><th style="padding:6px 8px;color:var(--muted)">Router-ID</th><th style="padding:6px 8px;color:var(--muted)">Iface IP</th><th style="padding:6px 8px;color:var(--muted)">Role</th></tr>';
    DRBDR_ROUTERS.forEach(function(r,i) {
      var roleCol = r.role==='DR'?'#fbbf24':r.role==='BDR'?'#38d9c0':r.role==='DROTHER'?'#5a6080':'#5a6080';
      var roleBg  = r.role==='DR'?'rgba(251,191,36,0.15)':r.role==='BDR'?'rgba(56,217,192,0.1)':'transparent';
      html += '<tr style="border-bottom:1px solid rgba(255,255,255,0.04);background:'+roleBg+'">';
      html += '<td style="padding:6px 8px;font-weight:700;color:var(--text)">'+r.id+'</td>';
      html += '<td style="padding:6px 8px;text-align:center"><input type="number" min="0" max="255" value="'+r.priority+'" onchange="drbdrSetPriority('+i+',this.value)" style="width:60px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:3px 6px;font-family:var(--mono);font-size:11px;color:var(--cyan);text-align:center;outline:none"></td>';
      html += '<td style="padding:6px 8px;text-align:center"><input type="text" value="'+r.rid+'" onchange="drbdrSetRID('+i+',this.value)" style="width:90px;background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:3px 6px;font-family:var(--mono);font-size:11px;color:var(--blue);text-align:center;outline:none"></td>';
      html += '<td style="padding:6px 8px;color:var(--muted2);text-align:center">'+r.iface+'</td>';
      html += '<td style="padding:6px 8px;text-align:center"><span style="font-family:var(--mono);font-size:10px;font-weight:700;color:'+roleCol+';background:'+roleBg+';padding:2px 8px;border-radius:4px">'+(r.role||'—')+'</span></td>';
      html += '</tr>';
    });
    html += '</table>';
    html += '</div>';
  
    // Buttons
    html += '<div style="display:flex;gap:8px;margin-bottom:16px">';
    html += '<button onclick="drbdrRunElection()" style="padding:9px 20px;border-radius:8px;border:none;background:var(--amber);color:#07090f;font-family:var(--mono);font-size:12px;font-weight:700;cursor:pointer">▶ Run Election</button>';
    html += '<button onclick="drbdrReset()" style="padding:9px 14px;border-radius:8px;border:1px solid var(--border2);background:transparent;color:var(--muted2);font-family:var(--mono);font-size:11px;cursor:pointer">↺ Reset</button>';
    html += '</div>';
  
    // Result area
    html += '<div id="drbdr-result"></div>';
  
    // Election rules
    html += '<div style="background:var(--bg3);border-radius:10px;padding:14px;margin-bottom:14px">';
    html += '<div style="font-family:var(--mono);font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">📋 Election Rules (RFC 2328 §9.4)</div>';
    [
      ['Step 1','Priority = 0','Router is INELIGIBLE. Cannot become DR or BDR. Becomes DROther permanently.','#f87171'],
      ['Step 2','Highest Priority wins DR','Range 1–255. Default is 1. Set with: ip ospf priority <0-255>','#fbbf24'],
      ['Step 3','Priority tie','Highest Router-ID wins. RID = highest loopback IP, else highest active interface IP.','#38d9c0'],
      ['Step 4','No preemption','Once elected, DR/BDR keep their role even if a higher-priority router joins later. Must clear ospf process to re-elect.','#a78bfa'],
      ['Step 5','BDR election','Same process applied to remaining routers (excluding DR). BDR promotes to DR if DR fails.','#5b9cf6'],
    ].forEach(function(r) {
      html += '<div style="display:flex;gap:10px;align-items:flex-start;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.04)">';
      html += '<span style="font-family:var(--mono);font-size:9px;padding:2px 7px;border-radius:4px;background:'+r[3]+'22;color:'+r[3]+';white-space:nowrap;flex-shrink:0">'+r[0]+'</span>';
      html += '<div><div style="font-family:var(--mono);font-size:11px;font-weight:700;color:var(--text);margin-bottom:2px">'+r[1]+'</div>';
      html += '<div style="font-family:var(--mono);font-size:10px;color:var(--muted2)">'+r[2]+'</div></div>';
      html += '</div>';
    });
    html += '</div>';
  
    // Adjacency comparison
    html += '<div style="background:var(--bg3);border-radius:10px;padding:14px">';
    html += '<div style="font-family:var(--mono);font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">Adjacency Count Comparison</div>';
    html += '<table style="width:100%;border-collapse:collapse;font-family:var(--mono);font-size:11px">';
    html += '<tr style="border-bottom:1px solid var(--border)"><th style="padding:5px 8px;text-align:left;color:var(--muted)">Routers</th><th style="padding:5px 8px;color:var(--muted)">Without DR (full mesh)</th><th style="padding:5px 8px;color:var(--muted)">With DR/BDR</th><th style="padding:5px 8px;color:var(--muted)">Savings</th></tr>';
    [2,3,4,5,6,8,10].forEach(function(n) {
      var full = n*(n-1)/2;
      var dr = 2*(n-2)+(n>=2?2:0);
      if (n===2) dr=1;
      var save = Math.max(0,full-dr);
      html += '<tr style="border-bottom:1px solid rgba(255,255,255,0.03)">';
      html += '<td style="padding:4px 8px;color:var(--text)">'+n+' routers</td>';
      html += '<td style="padding:4px 8px;text-align:center;color:var(--red)">'+full+'</td>';
      html += '<td style="padding:4px 8px;text-align:center;color:var(--green)">'+dr+'</td>';
      html += '<td style="padding:4px 8px;text-align:center;color:var(--amber)">'+save+' saved</td>';
      html += '</tr>';
    });
    html += '</table>';
    html += '</div>';
  
    document.getElementById('lsa-main-pane').innerHTML = html;
  
    // Side pane
    var side = '<div style="font-family:var(--mono);font-size:9px;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);margin-bottom:10px">Network Types & DR Election</div>';
    [
      {n:'Broadcast',dr:'Yes',ex:'Ethernet, Token Ring',col:'#4ade80'},
      {n:'NBMA',dr:'Yes',ex:'Frame Relay multipoint',col:'#fbbf24'},
      {n:'Point-to-Point',dr:'No',ex:'Serial, GRE tunnel, PPP',col:'#5b9cf6'},
      {n:'Point-to-Multipoint',dr:'No',ex:'Frame Relay spoke',col:'#38d9c0'},
      {n:'Loopback',dr:'No',ex:'Loopback interface',col:'#a78bfa'},
    ].forEach(function(t) {
      side += '<div style="padding:7px 0;border-bottom:1px solid var(--border)">';
      side += '<div style="font-family:var(--mono);font-size:10px;font-weight:700;color:'+t.col+';margin-bottom:2px">'+t.n+'</div>';
      side += '<div style="font-family:var(--mono);font-size:10px;color:var(--muted2)">DR election: <span style="color:'+(t.dr==='Yes'?'#fbbf24':'#5a6080')+'">'+t.dr+'</span></div>';
      side += '<div style="font-family:var(--mono);font-size:9px;color:var(--muted)">'+t.ex+'</div>';
      side += '</div>';
    });
    side += '<div style="margin-top:14px;padding:10px;background:var(--bg3);border-radius:8px">';
    side += '<div style="font-family:var(--mono);font-size:9px;color:var(--muted);margin-bottom:6px;text-transform:uppercase">IOS Commands</div>';
    [
      ['show ip ospf neighbor','See DR/BDR/DROTHER roles'],
      ['show ip ospf interface Gi0/0','See priority, DR, BDR'],
      ['ip ospf priority 255','Set highest priority (DR)'],
      ['ip ospf priority 0','Never become DR/BDR'],
      ['clear ip ospf process','Force re-election'],
    ].forEach(function(c) {
      side += '<div style="padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.04)">';
      side += '<div style="font-family:var(--mono);font-size:9px;color:var(--cyan)">'+c[0]+'</div>';
      side += '<div style="font-family:var(--mono);font-size:9px;color:var(--muted)">'+c[1]+'</div>';
      side += '</div>';
    });
    side += '</div>';
    document.getElementById('lsa-side-pane').innerHTML = side;
  }
  
  function drbdrSetPriority(i,v){DRBDR_ROUTERS[i].priority=parseInt(v)||0;DRBDR_ELECTED=false;}
  function drbdrSetRID(i,v){DRBDR_ROUTERS[i].rid=v.trim();DRBDR_ELECTED=false;}
  function drbdrReset(){DRBDR_ROUTERS.forEach(function(r){r.role='';});DRBDR_ELECTED=false;lsaRenderDRBDR();}
  
  function ridToNum(rid) {
    return rid.split('.').reduce(function(a,b){return a*256+(parseInt(b)||0);},0);
  }
  
  function drbdrRunElection() {
    var eligible = DRBDR_ROUTERS.filter(function(r){return r.priority>0;});
    var ineligible = DRBDR_ROUTERS.filter(function(r){return r.priority===0;});
    DRBDR_ROUTERS.forEach(function(r){r.role='DROTHER';});
  
    if (eligible.length === 0) {
      document.getElementById('drbdr-result').innerHTML = '<div style="color:var(--red);font-family:var(--mono);font-size:12px;padding:10px;background:rgba(248,113,113,0.08);border-radius:8px;border:1px solid rgba(248,113,113,0.3)">⚠ No eligible routers (all have priority 0). No DR/BDR can be elected!</div>';
      return;
    }
  
    // Sort: highest priority first, then highest RID
    var sorted = eligible.slice().sort(function(a,b){
      if(b.priority !== a.priority) return b.priority - a.priority;
      return ridToNum(b.rid) - ridToNum(a.rid);
    });
  
    var dr = sorted[0];
    var bdr = sorted.length>1 ? sorted[1] : null;
  
    DRBDR_ROUTERS.forEach(function(r){
      if(r===dr) r.role='DR';
      else if(r===bdr) r.role='BDR';
      else r.role='DROTHER';
    });
  
    var steps = '<div style="background:rgba(251,191,36,0.07);border:1px solid rgba(251,191,36,0.3);border-radius:10px;padding:14px;margin-bottom:14px">';
    steps += '<div style="font-family:var(--mono);font-size:10px;color:var(--amber);text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">Election Walkthrough</div>';
  
    steps += '<div style="font-family:var(--mono);font-size:11px;line-height:2;color:var(--muted2)">';
    steps += '① <span style="color:var(--red)">Ineligible (priority 0): </span>'+(ineligible.map(function(r){return r.id;}).join(', ')||'none')+'<br>';
    steps += '② Eligible routers ranked by priority then RID:<br>';
    sorted.forEach(function(r,i){
      steps += '&nbsp;&nbsp;<span style="color:var(--text)">'+r.id+'</span> — priority <span style="color:var(--cyan)">'+r.priority+'</span>, RID <span style="color:var(--blue)">'+r.rid+'</span>'+(i===0?' → <span style="color:var(--amber);font-weight:700">DR ✓</span>':i===1?' → <span style="color:var(--cyan);font-weight:700">BDR ✓</span>':'')+' <br>';
    });
    steps += '③ <span style="color:var(--amber)">DR = '+dr.id+' ('+dr.rid+')</span> — adjacency to ALL on segment<br>';
    steps += '④ <span style="color:var(--cyan)">BDR = '+(bdr?bdr.id+' ('+bdr.rid+')':'none (only 1 eligible)')+'</span> — adjacency to ALL, monitors DR<br>';
    steps += '⑤ <span style="color:var(--muted)">DROther routers form adjacency ONLY with DR and BDR (2-WAY with each other)</span>';
    steps += '</div>';
    steps += '</div>';
  
    DRBDR_ELECTED = true;
    document.getElementById('drbdr-result').innerHTML = steps;
    lsaRenderDRBDR();
    // Re-run after re-render
    setTimeout(function(){
      var el = document.getElementById('drbdr-result');
      if(el) el.innerHTML = steps;
    },50);
  }
  
  // ═══════════════════════════════════════════════════════════
  // TAB 7: OSPF AREA TYPES
  // ═══════════════════════════════════════════════════════════
  function lsaRenderAreas() {
    var html = '<div style="font-family:var(--mono);font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);margin-bottom:14px">OSPF Area Types — LSA Filtering &amp; Design Rules</div>';
  
    var areas = [
      {
        name:'Backbone Area 0', icon:'🏛️', color:'#5b9cf6',
        desc:'The center of every OSPF domain. All other areas must connect to Area 0 directly or via virtual links. ALL LSA types (1–5, 7 translated to 5) are present.',
        lsas:{1:'✓',2:'✓',3:'✓ (all prefixes)',4:'✓',5:'✓',7:'✗ (not generated here)'},
        config:'router ospf 1\n network 10.0.0.0 0.0.0.255 area 0',
        rules:['All inter-area traffic must pass through Area 0','ABRs connect non-backbone areas to Area 0','Virtual links used when Area 0 is disconnected'],
        why:'Prevents routing loops in a hierarchical design. Forces all inter-area routes through a single hub.',
        ccie:'Discontiguous Area 0 can use virtual-link as a temporary fix but not recommended long-term. Better: re-design or use OSPF sham-links with MPLS.',
      },
      {
        name:'Stub Area', icon:'🔒', color:'#4ade80',
        desc:'Blocks Type-4 and Type-5 LSAs (external routes). ABR injects a single Type-3 default route (0.0.0.0/0). Routers use default for all external destinations.',
        lsas:{1:'✓',2:'✓',3:'✓ default + intra-area summaries',4:'✗ blocked',5:'✗ blocked',7:'✗ not applicable'},
        config:'router ospf 1\n area 1 stub\n! (ALL routers in area 1 must have this)',
        rules:['No ASBR allowed in stub area','No virtual links through stub area','ABR automatically generates default Type-3'],
        why:'Reduces LSDB size on low-memory branch routers. One default route replaces thousands of external routes.',
        ccie:'ALL routers including ABR must have "area X stub". If one router is missing it, OSPF adjacency forms but area type mismatch causes the N-bit (Options field) check to fail — neighbors won\'t exchange LSAs properly.',
      },
      {
        name:'Totally Stubby Area', icon:'🔐', color:'#38d9c0',
        desc:'Cisco proprietary extension. Blocks Type-3, Type-4, and Type-5 LSAs. ONLY receives a single default route (0.0.0.0/0 as Type-3). Minimal LSDB.',
        lsas:{1:'✓',2:'✓',3:'✗ (only default 0.0.0.0/0)',4:'✗ blocked',5:'✗ blocked',7:'✗'},
        config:'On ABR only:\n area 1 stub no-summary\nOn all other routers:\n area 1 stub',
        rules:['"no-summary" keyword only on ABR — NOT on internal routers','Internal routers just need "area X stub"','Smallest possible LSDB — good for hub routers with 1 uplink'],
        why:'Maximum LSDB reduction. Branch office with single uplink to HQ has no use for inter-area summaries — just needs a default route.',
        ccie:'"no-summary" is only configured on the ABR. If you put it on an internal router, it\'s accepted but has no effect. Common exam trap: asking which routers need no-summary.',
      },
      {
        name:'NSSA (Not-So-Stubby Area)', icon:'🔀', color:'#fbbf24',
        desc:'Like a stub area BUT allows an ASBR inside it to redistribute external routes as Type-7 LSAs. ABR translates Type-7 → Type-5 for the rest of the OSPF domain.',
        lsas:{1:'✓',2:'✓',3:'✓ inter-area summaries',4:'✗ (ASBR is local, no Type-4 needed)',5:'✗ (external routes arrive as Type-7)',7:'✓ generated by ASBR here'},
        config:'router ospf 1\n area 2 nssa\n! ABR for translation:\n area 2 nssa default-information-originate',
        rules:['Type-7 stays within NSSA boundaries','ABR with highest RID performs 7→5 translation','Forwarding Address in Type-7 must be non-zero'],
        why:'Branch site with its own internet breakout (ASBR) but still wants OSPF stub behavior for backbone routes.',
        ccie:'Type-7 FA (Forwarding Address) must be reachable in the OSPF domain — if not, Type-5 generated from it will be ignored. The ABR that translates is the one with the highest RID (unless you override with area X nssa translate type7 always).',
      },
      {
        name:'Totally NSSA', icon:'🔀🔐', color:'#f472b6',
        desc:'NSSA + no inter-area summaries. ASBR can redistribute externals (Type-7), but NO Type-3 summaries from backbone. Only default route + local Type-7s.',
        lsas:{1:'✓',2:'✓',3:'✗ (only default)',4:'✗',5:'✗',7:'✓'},
        config:'On ABR only:\n area 2 nssa no-summary\nOn all other area routers:\n area 2 nssa',
        rules:['Best of both worlds: external redistribution + minimal LSDB','ABR still translates 7→5 for backbone','Default route auto-generated when no-summary used'],
        why:'Branch with local internet breakout AND limited routing table capacity.',
        ccie:'Totally NSSA is Cisco proprietary (like totally stub). Standard OSPF implementations only support regular NSSA per RFC 3101.',
      },
    ];
  
    areas.forEach(function(a) {
      html += '<div style="background:var(--bg3);border:1px solid '+a.color+'33;border-radius:12px;padding:16px;margin-bottom:14px">';
      html += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">';
      html += '<span style="font-size:22px">'+a.icon+'</span>';
      html += '<div><div style="font-family:var(--mono);font-size:14px;font-weight:700;color:'+a.color+'">'+a.name+'</div></div>';
      html += '</div>';
      html += '<div style="font-size:12px;color:var(--muted2);line-height:1.8;margin-bottom:10px">'+a.desc+'</div>';
  
      // LSA grid
      html += '<div style="display:flex;gap:5px;flex-wrap:wrap;margin-bottom:10px">';
      ['1','2','3','4','5','7'].forEach(function(t) {
        var v = a.lsas[t]||'✗';
        var ok = v.startsWith('✓');
        var partial = v.includes('only') || v.includes('default');
        var col = ok?(partial?'#fbbf24':'#4ade80'):'#5a6080';
        var bg = ok?(partial?'rgba(251,191,36,0.1)':'rgba(74,222,128,0.1)'):'rgba(90,96,128,0.1)';
        html += '<div style="font-family:var(--mono);font-size:10px;padding:4px 8px;border-radius:6px;background:'+bg+';border:1px solid '+col+'44;color:'+col+'">T'+t+': '+(ok?'✓':'✗')+'</div>';
      });
      html += '</div>';
  
      // Config
      html += '<div style="background:var(--bg);border-radius:8px;padding:10px;margin-bottom:8px;font-family:var(--mono);font-size:10px;color:var(--cyan);white-space:pre-line;line-height:1.7">'+a.config+'</div>';
  
      // CCIE trap
      html += '<div style="background:rgba(251,191,36,0.06);border-left:3px solid '+a.color+';padding:8px 12px;border-radius:0 6px 6px 0;font-family:var(--mono);font-size:10px;color:var(--muted2);line-height:1.6">';
      html += '<span style="color:'+a.color+'">⚡ CCIE:</span> '+a.ccie;
      html += '</div>';
      html += '</div>';
    });
  
    document.getElementById('lsa-main-pane').innerHTML = html;
  
    // Side pane: comparison table
    var side = '<div style="font-family:var(--mono);font-size:9px;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);margin-bottom:10px">Quick Comparison</div>';
    side += '<table style="width:100%;border-collapse:collapse;font-family:var(--mono);font-size:9px">';
    side += '<tr style="border-bottom:1px solid var(--border)"><th style="padding:4px;text-align:left;color:var(--muted)">Area</th><th style="padding:4px;color:var(--muted)">T3</th><th style="padding:4px;color:var(--muted)">T5</th><th style="padding:4px;color:var(--muted)">T7</th><th style="padding:4px;color:var(--muted)">ASBR</th></tr>';
    [
      ['Backbone','✓','✓','✗','✓'],
      ['Stub','def','✗','✗','✗'],
      ['Totally Stub','def','✗','✗','✗'],
      ['NSSA','✓','✗','✓','✓'],
      ['Totally NSSA','def','✗','✓','✓'],
    ].forEach(function(r) {
      var c = r[0]==='Backbone'?'#5b9cf6':r[0]==='Stub'?'#4ade80':r[0].includes('Totally S')?'#38d9c0':r[0]==='NSSA'?'#fbbf24':'#f472b6';
      side += '<tr style="border-bottom:1px solid rgba(255,255,255,0.04)">';
      side += '<td style="padding:4px;color:'+c+';white-space:nowrap">'+r[0]+'</td>';
      [r[1],r[2],r[3],r[4]].forEach(function(v) {
        var ok=v==='✓', no=v==='✗';
        side += '<td style="padding:4px;text-align:center;color:'+(ok?'#4ade80':no?'#5a6080':'#fbbf24')+'">'+v+'</td>';
      });
      side += '</tr>';
    });
    side += '</table>';
    side += '<div style="margin-top:14px;font-family:var(--mono);font-size:9px;color:var(--muted);line-height:1.7"><span style="color:var(--green)">✓</span> = present &nbsp; <span style="color:var(--muted)">✗</span> = blocked &nbsp; <span style="color:var(--amber)">def</span> = default only</div>';
  
    side += '<div style="margin-top:14px;padding:10px;background:var(--bg3);border-radius:8px">';
    side += '<div style="font-family:var(--mono);font-size:9px;color:var(--muted);text-transform:uppercase;margin-bottom:6px">OSPF Router Types</div>';
    [
      {t:'IR',n:'Internal Router',d:'All interfaces in same area'},
      {t:'ABR',n:'Area Border Router',d:'Interfaces in 2+ areas. Generates Type-3 & Type-4'},
      {t:'ASBR',n:'AS Boundary Router',d:'Redistributes external routes. Generates Type-5/7'},
      {t:'BR',n:'Backbone Router',d:'At least one interface in Area 0'},
    ].forEach(function(r) {
      side += '<div style="padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.04)">';
      side += '<span style="font-family:var(--mono);font-size:9px;color:var(--cyan);font-weight:700">'+r.t+'</span> <span style="font-family:var(--mono);font-size:9px;color:var(--text)">'+r.n+'</span><br>';
      side += '<span style="font-family:var(--mono);font-size:9px;color:var(--muted)">'+r.d+'</span>';
      side += '</div>';
    });
    side += '</div>';
    document.getElementById('lsa-side-pane').innerHTML = side;
  }
  
  // ═══════════════════════════════════════════════════════════
  // TAB 8: SPF WALKTHROUGH (DIJKSTRA)
  // ═══════════════════════════════════════════════════════════
  var SPF_STEP = 0;
  var SPF_TOPO = {
    nodes: [
      {id:'R1',x:80, y:150,color:'#5b9cf6',rid:'1.1.1.1'},
      {id:'R2',x:220,y:60, color:'#38d9c0',rid:'2.2.2.2'},
      {id:'R3',x:220,y:240,color:'#4ade80',rid:'3.3.3.3'},
      {id:'R4',x:360,y:150,color:'#fbbf24',rid:'4.4.4.4'},
      {id:'R5',x:480,y:80, color:'#f472b6',rid:'5.5.5.5'},
      {id:'R6',x:480,y:240,color:'#a78bfa',rid:'6.6.6.6'},
    ],
    edges:[
      {a:'R1',b:'R2',cost:10},
      {a:'R1',b:'R3',cost:5},
      {a:'R2',b:'R4',cost:15},
      {a:'R3',b:'R4',cost:20},
      {a:'R3',b:'R2',cost:12},
      {a:'R4',b:'R5',cost:8},
      {a:'R4',b:'R6',cost:10},
      {a:'R5',b:'R6',cost:5},
    ]
  };
  
  function spfDijkstra(topo, src) {
    var dist = {}, prev = {}, visited = {}, steps = [];
    topo.nodes.forEach(function(n){ dist[n.id]=Infinity; prev[n.id]=null; });
    dist[src] = 0;
  
    var unvisited = topo.nodes.map(function(n){return n.id;});
  
    while (unvisited.length > 0) {
      // Find min dist unvisited
      unvisited.sort(function(a,b){return dist[a]-dist[b];});
      var u = unvisited.shift();
      if (dist[u] === Infinity) break;
      visited[u] = true;
  
      var neighbors = [];
      topo.edges.forEach(function(e) {
        var v = null;
        if (e.a===u) v=e.b;
        else if (e.b===u) v=e.a;
        if (!v || visited[v]) return;
        var nd = dist[u]+e.cost;
        if (nd < dist[v]) {
          var old=dist[v];
          dist[v]=nd; prev[v]=u;
          neighbors.push({node:v,via:u,cost:nd,old:old,edgeCost:e.cost});
        }
      });
  
      steps.push({settled:u, dist:JSON.parse(JSON.stringify(dist)), prev:JSON.parse(JSON.stringify(prev)), relaxed:neighbors, visited:JSON.parse(JSON.stringify(visited))});
    }
    return {dist:dist, prev:prev, steps:steps};
  }
  
  var SPF_RESULT = null;
  
  function lsaRenderSPF() {
    if (!SPF_RESULT) { SPF_RESULT = spfDijkstra(SPF_TOPO, 'R1'); }
    var step = Math.min(SPF_STEP, SPF_RESULT.steps.length-1);
    var cur = SPF_RESULT.steps[step] || SPF_RESULT.steps[0];
  
    var html = '<div style="font-family:var(--mono);font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);margin-bottom:12px">Dijkstra SPF Algorithm — Step-by-Step from R1</div>';
  
    // Topology SVG
    var svgW=580, svgH=320;
    var svg='<svg viewBox="0 0 '+svgW+' '+svgH+'" style="width:100%;display:block;background:var(--bg);border-radius:10px;margin-bottom:14px;border:1px solid var(--border)" xmlns="http://www.w3.org/2000/svg">';
  
    // Draw edges
    SPF_TOPO.edges.forEach(function(e) {
      var na=SPF_TOPO.nodes.find(function(n){return n.id===e.a;});
      var nb=SPF_TOPO.nodes.find(function(n){return n.id===e.b;});
      // Is this edge in SPT?
      var inSPT = cur.prev[e.b]===e.a || cur.prev[e.a]===e.b;
      var bothVisited = cur.visited[e.a] && cur.visited[e.b];
      var col = (inSPT && bothVisited) ? '#4ade80' : 'rgba(100,160,255,0.15)';
      var w = (inSPT && bothVisited) ? 2.5 : 1.5;
      svg += '<line x1="'+na.x+'" y1="'+na.y+'" x2="'+nb.x+'" y2="'+nb.y+'" stroke="'+col+'" stroke-width="'+w+'" stroke-dasharray="'+(inSPT&&bothVisited?'none':'4,3')+'"/>';
      // Cost label
      var mx=(na.x+nb.x)/2, my=(na.y+nb.y)/2;
      svg += '<rect x="'+(mx-10)+'" y="'+(my-8)+'" width="20" height="13" rx="3" fill="rgba(7,9,15,0.8)"/>';
      svg += '<text x="'+mx+'" y="'+(my+3)+'" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8.5" fill="'+(inSPT&&bothVisited?'#4ade80':'rgba(100,160,255,0.5)')+'">'+e.cost+'</text>';
    });
  
    // Draw nodes
    SPF_TOPO.nodes.forEach(function(n) {
      var d = cur.dist[n.id];
      var vis = cur.visited[n.id];
      var settled = cur.settled === n.id;
      var fill = settled ? n.color : vis ? n.color+'66' : 'rgba(18,21,32,0.95)';
      var stroke = settled ? n.color : vis ? n.color+'88' : n.color+'44';
      var sw = settled ? 2.5 : vis ? 2 : 1.5;
      if (settled) { svg += '<circle cx="'+n.x+'" cy="'+n.y+'" r="27" fill="'+n.color+'22" stroke="'+n.color+'" stroke-width="1" opacity="0.5"/>'; }
      svg += '<circle cx="'+n.x+'" cy="'+n.y+'" r="22" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+sw+'"/>';
      svg += '<text x="'+n.x+'" y="'+(n.y-6)+'" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9" font-weight="700" fill="'+(vis?'#07090f':'var(--text,#e8eaf0)')+'">'+n.id+'</text>';
      var label = d===Infinity ? '∞' : d;
      svg += '<text x="'+n.x+'" y="'+(n.y+8)+'" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9" fill="'+(vis?(settled?'#07090f':'#07090f66'):(d<Infinity?'#fbbf24':'#5a6080'))+'">'+label+'</text>';
    });
  
    svg += '</svg>';
    html += svg;
  
    // Step navigation
    html += '<div style="display:flex;gap:8px;align-items:center;margin-bottom:14px">';
    html += '<button onclick="spfStep(-1)" style="padding:5px 16px;border-radius:7px;border:1px solid var(--border2);background:transparent;color:var(--muted2);font-family:var(--mono);font-size:11px;cursor:pointer">◀ Prev</button>';
    for (var i=0;i<SPF_RESULT.steps.length;i++) {
      var a=(i===step);
      html+='<div onclick="spfGoto('+i+')" style="width:9px;height:9px;border-radius:50%;background:'+(a?'#4ade80':'#2d3450')+';cursor:pointer;border:1px solid '+(a?'#4ade80':'#3a4060')+'"></div>';
    }
    html += '<button onclick="spfStep(1)" style="padding:5px 16px;border-radius:7px;border:none;background:#4ade80;color:#07090f;font-family:var(--mono);font-size:11px;font-weight:700;cursor:pointer">Next ▶</button>';
    html += '<span style="margin-left:auto;font-family:var(--mono);font-size:10px;color:var(--muted)">Step '+(step+1)+' / '+SPF_RESULT.steps.length+'</span>';
    html += '</div>';
  
    // Step explanation
    html += '<div style="background:rgba(74,222,128,0.07);border:1px solid rgba(74,222,128,0.25);border-radius:10px;padding:14px;margin-bottom:14px">';
    html += '<div style="font-family:var(--mono);font-size:10px;color:var(--green);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Step '+(step+1)+' — Settling '+cur.settled+'</div>';
    html += '<div style="font-family:var(--mono);font-size:11px;color:var(--text);margin-bottom:8px">✅ <strong>'+cur.settled+'</strong> has the smallest tentative distance. It is now <span style="color:var(--green)">permanently settled</span> (added to SPT).</div>';
  
    if (cur.relaxed.length > 0) {
      html += '<div style="font-family:var(--mono);font-size:10px;color:var(--muted);margin-bottom:5px">Relaxing neighbors:</div>';
      cur.relaxed.forEach(function(r) {
        html += '<div style="font-family:var(--mono);font-size:11px;color:var(--muted2);padding:3px 0">→ <span style="color:var(--cyan)">'+r.node+'</span>: old cost = <span style="color:var(--red)">'+(r.old===Infinity?'∞':r.old)+'</span>, new cost = '+r.via+'+'+r.edgeCost+' = <span style="color:var(--green)">'+r.cost+'</span> ✓</div>';
      });
    } else {
      html += '<div style="font-family:var(--mono);font-size:11px;color:var(--muted)">No neighbors to relax (all already settled or no improvement).</div>';
    }
    html += '</div>';
  
    // Distance table
    html += '<div style="font-family:var(--mono);font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Current distance table (from R1)</div>';
    html += '<table style="width:100%;border-collapse:collapse;font-family:var(--mono);font-size:11px">';
    html += '<tr style="border-bottom:1px solid var(--border)"><th style="padding:5px 8px;text-align:left;color:var(--muted)">Router</th><th style="padding:5px 8px;color:var(--muted)">Cost</th><th style="padding:5px 8px;color:var(--muted)">Via</th><th style="padding:5px 8px;color:var(--muted)">Status</th></tr>';
    SPF_TOPO.nodes.forEach(function(n) {
      var d=cur.dist[n.id], vis=cur.visited[n.id], settled=cur.settled===n.id;
      var path=[];var node=n.id;
      while(cur.prev[node]){path.unshift(node);node=cur.prev[node];}
      if(path.length) path.unshift('R1');
      html+='<tr style="border-bottom:1px solid rgba(255,255,255,0.04);background:'+(settled?'rgba(74,222,128,0.07)':'')+'">';
      html+='<td style="padding:5px 8px"><span style="color:'+n.color+'">'+n.id+'</span></td>';
      html+='<td style="padding:5px 8px;text-align:center;color:'+(d===Infinity?'#5a6080':settled?'#4ade80':'#fbbf24')+'font-weight:'+(settled?'700':'400')+'">'+(d===Infinity?'∞':d)+'</td>';
      html+='<td style="padding:5px 8px;color:var(--muted2)">'+(cur.prev[n.id]||'—')+'</td>';
      html+='<td style="padding:5px 8px"><span style="font-family:var(--mono);font-size:9px;padding:1px 6px;border-radius:4px;background:'+(settled?'rgba(74,222,128,0.15)':vis?'rgba(91,156,246,0.1)':'rgba(90,96,128,0.08)')+';color:'+(settled?'#4ade80':vis?'var(--blue)':'#5a6080')+'">'+(settled?'SETTLED':vis?'settled':'tentative')+'</span></td>';
      html+='</tr>';
    });
    html+='</table>';
  
    // After all steps: show routing table
    if (step === SPF_RESULT.steps.length-1) {
      html += '<div style="margin-top:14px;background:var(--bg3);border-radius:10px;padding:12px">';
      html += '<div style="font-family:var(--mono);font-size:10px;color:var(--green);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">🎉 SPF Complete — R1 Routing Table (OSPF routes)</div>';
      SPF_TOPO.nodes.forEach(function(n) {
        if(n.id==='R1') return;
        var d=SPF_RESULT.dist[n.id];
        var p=[],node=n.id;
        while(SPF_RESULT.prev[node]){p.unshift(node);node=SPF_RESULT.prev[node];}
        p.unshift('R1');
        html+='<div style="font-family:var(--mono);font-size:10px;color:var(--muted2);padding:2px 0">';
        html+='<span style="color:var(--amber)">O</span> '+n.rid+'/32 [110/<span style="color:var(--cyan)">'+d+'</span>] via <span style="color:var(--blue)">'+SPF_RESULT.prev[n.id]+'</span> &nbsp; Path: '+p.join(' → ')+'</div>';
      });
      html += '</div>';
    }
  
    document.getElementById('lsa-main-pane').innerHTML = html;
  
    // Side: algorithm explanation
    var side = '<div style="font-family:var(--mono);font-size:9px;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);margin-bottom:10px">Dijkstra Algorithm</div>';
    side += '<div style="font-family:var(--mono);font-size:10px;color:var(--muted2);line-height:1.8;margin-bottom:12px">SPF builds a Shortest Path Tree (SPT) from this router as root using all Type-1 and Type-2 LSAs in the LSDB.</div>';
    [
      {s:'Initialize',d:'Set source cost=0, all others=∞. All nodes are "tentative".','c':'#5b9cf6'},
      {s:'Pick Min',d:'Select unvisited node with lowest tentative cost. This node is permanently SETTLED.','c':'#38d9c0'},
      {s:'Relax',d:'For each unsettled neighbor: if current_cost + edge_cost < neighbor_cost → update neighbor cost and set prev pointer.','c':'#4ade80'},
      {s:'Repeat',d:'Repeat Pick Min + Relax until all nodes are settled.','c':'#fbbf24'},
      {s:'Build Routes',d:'Trace prev[] pointers from each node back to root to find best path. Install in RIB.','c':'#f472b6'},
    ].forEach(function(s,i) {
      side += '<div style="padding:7px 0;border-bottom:1px solid var(--border)">';
      side += '<div style="font-family:var(--mono);font-size:10px;font-weight:700;color:'+s.c+';margin-bottom:3px">'+(i+1)+'. '+s.s+'</div>';
      side += '<div style="font-family:var(--mono);font-size:10px;color:var(--muted2);line-height:1.6">'+s.d+'</div>';
      side += '</div>';
    });
    side += '<div style="margin-top:14px;padding:10px;background:var(--bg3);border-radius:8px">';
    side += '<div style="font-family:var(--mono);font-size:9px;color:var(--muted);text-transform:uppercase;margin-bottom:6px">CCIE Level Notes</div>';
    [
      'SPF runs per-area. Type-1/2 are area-scoped.',
      'O(V²) or O(E·log V) complexity. Large areas = more CPU.',
      'LSA change triggers partial SPF (iSPF) or full SPF.',
      'Throttle SPF: timers throttle spf 10 100 5000',
      'show ip ospf | include SPF — see SPF run count',
      'Type-3/4/5/7 processed AFTER SPF (not in graph)',
    ].forEach(function(n) {
      side += '<div style="font-family:var(--mono);font-size:9px;color:var(--muted2);padding:3px 0;border-bottom:1px solid rgba(255,255,255,0.04)">• '+n+'</div>';
    });
    side += '</div>';
    document.getElementById('lsa-side-pane').innerHTML = side;
  }
  
  function spfStep(d){ SPF_STEP=Math.max(0,Math.min((SPF_RESULT?SPF_RESULT.steps.length-1:0),SPF_STEP+d)); lsaRenderSPF(); }
  function spfGoto(i){ SPF_STEP=i; lsaRenderSPF(); }
  
  
  // ═══════════════════════════════════════════════════════════
  // BROKEN CONFIG CHALLENGES
  // ═══════════════════════════════════════════════════════════
  var BC_CHALLENGES=[
    {id:1,proto:'ospf',title:'OSPF neighbors stuck in INIT',difficulty:'CCNA',scenario:'Two routers R1 and R2 are connected. R1 shows "INIT" state for R2 forever. Find the bug.',
     configs:['R1:\ninterface GigabitEthernet0/0\n ip address 192.168.1.1 255.255.255.0\n ip ospf 1 area 0\n ip ospf hello-interval 5\n!\nrouter ospf 1\n router-id 1.1.1.1','R2:\ninterface GigabitEthernet0/0\n ip address 192.168.1.2 255.255.255.0\n ip ospf 1 area 0\n ip ospf hello-interval 10\n!\nrouter ospf 1\n router-id 2.2.2.2'],
     bug:'Hello/dead timer mismatch. R1 hello=5s, R2 hello=10s. OSPF requires matching hello AND dead intervals on both sides of a link.',
     fix:'R1: ip ospf hello-interval 10 (match R2)\nOR\nR2: ip ospf hello-interval 5 (match R1)\nBoth routers must use identical values.',
     hint:'Check per-interface timers — they override process-level timers'},
    {id:2,proto:'ospf',title:'OSPF neighbors in EXSTART',difficulty:'CCNP',scenario:'R1 and R2 are stuck in EXSTART. They progress to INIT → 2WAY → EXSTART then stop.',
     configs:['R1:\ninterface GigabitEthernet0/0\n ip address 10.0.0.1 255.255.255.252\n ip ospf 1 area 0\n ip mtu 9000\n!\nrouter ospf 1\n router-id 1.1.1.1','R2:\ninterface GigabitEthernet0/0\n ip address 10.0.0.2 255.255.255.252\n ip ospf 1 area 0\n!\nrouter ospf 1\n router-id 2.2.2.2'],
     bug:'MTU mismatch. R1 has jumbo frames (9000), R2 uses default (1500). OSPF checks MTU in DBD packets and rejects if they don\'t match.',
     fix:'Option 1 (fix the MTU): Set R2 ip mtu 9000\nOption 2 (workaround): Add to both interfaces:\n ip ospf mtu-ignore\nNote: Workaround may cause fragmentation issues in production.',
     hint:'What happens in EXSTART? Database description (DBD) exchange. What does DBD carry that OSPF validates?'},
    {id:3,proto:'ospf',title:'Route missing from OSPF area 1',difficulty:'CCNP',scenario:'R1 is in area 0. R3 is in area 1. R3 cannot reach the 10.5.0.0/24 network. R2 is the ABR.',
     configs:['R2 (ABR):\nrouter ospf 1\n router-id 2.2.2.2\n area 1 stub\n network 10.0.0.0 0.0.0.255 area 0\n network 10.1.0.0 0.0.0.255 area 1\n!','R3 (area 1):\nrouter ospf 1\n router-id 3.3.3.3\n area 1 stub no-summary'],
     bug:'Stub area misconfiguration. R2 has "area 1 stub" (regular stub), but R3 has "area 1 stub no-summary" (totally stubby). They disagree on the stub type. In a totally stubby area, the ABR must also use no-summary.',
     fix:'On R2 (ABR): Change "area 1 stub" to "area 1 stub no-summary"\nOR on R3: Change to just "area 1 stub"\nBoth must agree on whether it\'s stub or totally-stubby.',
     hint:'What is the difference between "stub" and "stub no-summary"? Who generates Type-3 LSAs?'},
    {id:4,proto:'bgp',title:'BGP session stuck in Active',difficulty:'CCNA',scenario:'R1 and R2 are on the same subnet. BGP is configured but R1 shows R2 as "Active" permanently.',
     configs:['R1:\nrouter bgp 65001\n neighbor 192.168.1.2 remote-as 65002\n!\ninterface GigabitEthernet0/0\n ip address 192.168.1.1 255.255.255.0','R2:\nrouter bgp 65002\n neighbor 192.168.1.10 remote-as 65001\n!\ninterface GigabitEthernet0/0\n ip address 192.168.1.2 255.255.255.0'],
     bug:'Neighbor address mismatch. R1 tries to peer with 192.168.1.2 (correct), but R2 tries to peer with 192.168.1.10 (wrong — R1 is .1). R2 is not accepting the TCP connection from .1 because it expects .10.',
     fix:'On R2: Change "neighbor 192.168.1.10" to "neighbor 192.168.1.1"\nVerify: show ip bgp summary → should show ESTABLISHED',
     hint:'BGP is symmetric — both sides must configure the other\'s IP as the neighbor address.'},
    {id:5,proto:'bgp',title:'BGP route not advertised',difficulty:'CCNP',scenario:'R1 has BGP configured with R2. R1 has 10.1.1.0/24 in its routing table but R2 never receives it.',
     configs:['R1:\nrouter bgp 65001\n neighbor 192.168.1.2 remote-as 65002\n network 10.1.0.0\n!\nip route 10.1.1.0 255.255.255.0 Null0'],
     bug:'The "network" command specifies 10.1.0.0 (classful /8 boundary assumed for class A) but the actual route is 10.1.1.0/24. In BGP, "network" must EXACTLY match a route in the routing table — prefix AND mask.',
     fix:'R1: Change to: network 10.1.1.0 mask 255.255.255.0\nThe mask keyword is required for non-classful networks.',
     hint:'BGP "network" is NOT like OSPF "network" — it does an exact lookup, not a wildcard match.'},
    {id:6,proto:'bgp',title:'iBGP routes not propagating',difficulty:'CCNP',scenario:'R1-R2-R3 are in AS 65001. R1 has a route from eBGP peer. R2 sees it but R3 (peered only with R2) does not.',
     configs:['iBGP peers:\nR1 ←→ R2 (iBGP)\nR2 ←→ R3 (iBGP)\nR1 ←→ External (eBGP)\n\nR2: No route-reflector or confederation configured.'],
     bug:'iBGP split-horizon. Routes learned from an iBGP peer are NOT advertised to other iBGP peers. R2 receives from R1 (iBGP) but won\'t send to R3 (iBGP). Full mesh or route reflector required.',
     fix:'Option 1 (Route Reflector on R2):\nrouter bgp 65001\n neighbor R1 route-reflector-client\n neighbor R3 route-reflector-client\n\nOption 2 (Full mesh):\nAdd R1 ←→ R3 iBGP peering directly.',
     hint:'What does "iBGP split horizon" mean? Why does it exist (loop prevention)? How is it solved at scale?'},
    {id:7,proto:'eigrp',title:'EIGRP stuck-in-active',difficulty:'CCNP',scenario:'R1 shows a route in ACTIVE state for over 3 minutes. Eventually the neighbor resets.',
     configs:['Topology: Hub-and-spoke\nR1 (hub) ←→ R2, R3, R4, R5 (spokes)\n\nR2-R5 config:\nrouter eigrp 1\n network 10.0.0.0\n ! No stub configuration'],
     bug:'Spoke routers are not configured as EIGRP stubs. When R1 loses a route, it queries ALL neighbors including all spokes. Spokes then query their other neighbors. The flood of queries causes Stuck-in-Active when any query takes too long.',
     fix:'On ALL spoke routers (R2-R5):\nrouter eigrp 1\n eigrp stub connected summary\n\nThis tells R1: "Don\'t query these routers — they only have connected/summary routes."',
     hint:'What does eigrp stub do? Why do spokes generate queries they can\'t answer?'},
    {id:8,proto:'security',title:'Port security violation not blocking',difficulty:'CCNA',scenario:'An attacker is flooding the switch with fake MACs. Port security is configured but the switch is still flooding all traffic (acting like a hub).',
     configs:['Switch:\ninterface GigabitEthernet0/1\n switchport mode access\n switchport access vlan 10\n switchport port-security\n switchport port-security maximum 5\n switchport port-security violation protect'],
     bug:'"protect" mode silently drops violating frames but does NOT send a log or shut down. The real vulnerability is maximum=5 is too high — allowing 5 MACs per port, attacker can use 5 fake MACs. Also, protect mode gives no visibility.',
     fix:'Change violation mode to shutdown:\n switchport port-security violation shutdown\nReduce maximum:\n switchport port-security maximum 1\nAdd sticky learning:\n switchport port-security mac-address sticky',
     hint:'What are the 3 violation modes? Which one shuts the port? Which is most secure?'},
    {id:9,proto:'security',title:'DAI not working — ARP poisoning succeeds',difficulty:'CCNP',scenario:'Dynamic ARP Inspection is enabled but hosts are still getting poisoned ARPs.',
     configs:['Switch:\nip arp inspection vlan 10\n!\ninterface GigabitEthernet0/1  (uplink to router)\n ! No trust configured\ninterface GigabitEthernet0/24 (DHCP server port)\n ip dhcp snooping trust'],
     bug:'The uplink to the router (Gi0/1) is not marked as trusted. The router\'s ARPs will be validated against the DHCP snooping binding table — but the router may have static IPs not in the table. DAI drops legitimate router ARPs.',
     fix:'interface GigabitEthernet0/1\n ip arp inspection trust\n\nMark all uplinks (inter-switch links and router connections) as trusted. Only access ports (user devices) should be untrusted.',
     hint:'DAI trusted ports bypass validation. What ports should be trusted? What\'s the risk of over-trusting?'},
    {id:10,proto:'ospf',title:'OSPF cost not matching expected path',difficulty:'CCNP',scenario:'Traffic is taking a 100Mbps path instead of a 10Gbps path. Both are OSPF paths to the same destination.',
     configs:['R1:\ninterface GigabitEthernet0/0   (10Gbps)\n ip ospf cost 1   ← manually set\ninterface TenGigabitEthernet0/0  (also 10Gbps)\n ! No manual cost\n ! auto-cost reference-bandwidth 100 (default)'],
     bug:'auto-cost reference-bandwidth is 100 Mbps (default). For 10Gbps, OSPF calculates cost = 100/10000 = 0, which rounds to 1. Same as the manually set cost. For any link faster than 100Mbps, the default reference-bandwidth gives the same cost=1.',
     fix:'On ALL OSPF routers (must be consistent):\nrouter ospf 1\n auto-cost reference-bandwidth 10000\n\nNow 10Gbps = 10000/10000 = 1, 1Gbps = 10000/1000 = 10, 100Mbps = 10000/100 = 100',
     hint:'What is the OSPF cost formula? What happens when multiple interfaces compute to the same minimum cost?'},
    {id:11,proto:'bgp',title:'BGP communities not propagated',difficulty:'CCIE',scenario:'R1 sets community 65001:100 on a prefix. R2 is a route reflector. R3 never receives the community.',
     configs:['R1:\nroute-map SET-COMM permit 10\n set community 65001:100\n!\nrouter bgp 65001\n neighbor R2 route-map SET-COMM out\n neighbor R2 remote-as 65001','R2 (Route Reflector):\nrouter bgp 65001\n neighbor R1 remote-as 65001\n neighbor R1 route-reflector-client\n neighbor R3 remote-as 65001\n neighbor R3 route-reflector-client'],
     bug:'Missing "send-community" on both R1→R2 and R2→R3 sessions. BGP communities are optional attributes — they are NOT sent unless explicitly configured with "neighbor X send-community".',
     fix:'R1:\nrouter bgp 65001\n neighbor R2 send-community both\n\nR2:\nrouter bgp 65001\n neighbor R1 send-community both\n neighbor R3 send-community both\n\n"both" sends standard AND extended communities.',
     hint:'Communities are optional BGP attributes. What needs to be configured to send optional attributes?'},
    {id:12,proto:'ospf',title:'Type 7 NSSA LSA not translating to Type 5',difficulty:'CCIE',scenario:'NSSA area has a redistributing ASBR. Routes appear in area 1 but NOT in area 0.',
     configs:['ASBR (in NSSA area 1):\nrouter ospf 1\n redistribute static metric 100 metric-type 1 subnets\n area 1 nssa\n!\nABR:\nrouter ospf 1\n area 1 nssa no-redistribution'],
     bug:'"no-redistribution" on the ABR prevents Type-7 to Type-5 translation. This keyword stops the ABR from importing redistributed routes into the backbone area.',
     fix:'On ABR: Remove "no-redistribution" keyword:\nrouter ospf 1\n area 1 nssa\n\nThe ABR will now translate Type-7 LSAs to Type-5 and flood them into area 0.',
     hint:'What does the P-bit in Type-7 LSA do? What does no-redistribution change about ABR behavior?'},
    {id:13,proto:'eigrp',title:'EIGRP unequal-cost load balancing not working',difficulty:'CCNP',scenario:'R1 has two paths to 10.2.0.0/24: via R2 (FD=1000) and via R3 (FD=1800). Only the R2 path is in the routing table.',
     configs:['R1:\nrouter eigrp 1\n variance 1\n maximum-paths 2'],
     bug:'variance 1 means only equal-cost paths are installed (1× the best FD). To allow the R3 path (FD=1800), variance must be ≥ 1800/1000 = 1.8, so at least 2.',
     fix:'R1:\nrouter eigrp 1\n variance 2\n\nThis allows paths with FD ≤ 2 × 1000 = 2000. Since R3 FD=1800 ≤ 2000, it gets installed. Note: R3 must also meet the Feasibility Condition (RD < FD of successor).',
     hint:'What is the variance multiplier formula? What additional condition must be met (feasibility condition)?'},
    {id:14,proto:'security',title:'BGP max-prefix not protecting from route table explosion',difficulty:'CCIE',scenario:'ISP peering went down due to receiving 900,000 routes. max-prefix was configured but didn\'t help.',
     configs:['router bgp 65001\n neighbor 203.0.113.1 remote-as 65000\n neighbor 203.0.113.1 maximum-prefix 500000\n ! Default behavior: warning-only not set'],
     bug:'maximum-prefix 500000 will RESET the BGP session when 500,000 prefixes are exceeded. But the router accepted 500,000 routes first — this still caused a memory spike and potential instability. Also, 500,000 is too high for a full table.',
     fix:'Better approach:\nneighbor 203.0.113.1 maximum-prefix 850000 80 restart 5\n• 850000 = max routes (current full BGP table ~900K)\n• 80 = warn at 80% (680,000 routes)\n• restart 5 = auto-restart after 5 minutes\n\nFor non-full-table peers: much lower value (e.g. 1000 for a customer).',
     hint:'What are the three behaviors of max-prefix? (threshold warning, session reset, restart timer)'},
    {id:15,proto:'bgp',title:'AS-PATH filter denying good routes',difficulty:'CCIE',scenario:'R1 has an AS-path filter to block routes from AS 65100. But it\'s also blocking routes from AS 65200 that transit through AS 65100.',
     configs:['R1:\nip as-path access-list 1 deny _65100_\nip as-path access-list 1 permit .*\n!\nrouter bgp 65001\n neighbor R2 filter-list 1 in'],
     bug:'"_65100_" uses word-boundary regex — it matches 65100 anywhere in the AS-PATH. Routes from AS 65200 via AS 65100 have AS-PATH like "65200 65100" which contains 65100 → denied.\n\nIf goal is only to deny routes ORIGINATED by 65100, use "^65100$" instead.',
     fix:'If you want to block ONLY routes originating from 65100:\nip as-path access-list 1 deny ^65100$\nip as-path access-list 1 permit .*\n\nIf you want to block all routes passing through 65100:\nip as-path access-list 1 deny _65100_  ← current config is correct\n\nConfirm goal first!',
     hint:'How do the AS-PATH regex anchors ^ and $ work? What does _65100_ match vs ^65100$?'}
  ];
  
  var BC_FILTER='all', BC_CURRENT=null, BC_REVEALED={}, BC_SCORE=0;
  function bcInit(){ bcFilter('all',document.getElementById('bc-all-btn')); }
  function bcFilter(f,btn){
    BC_FILTER=f;
    document.querySelectorAll('.tool-pill[id^="bc-"]').forEach(b=>b.classList.remove('active'));
    if(btn) btn.classList.add('active');
    bcRenderList();
  }
  function bcRenderList(){
    var list=BC_FILTER==='all'?BC_CHALLENGES:BC_CHALLENGES.filter(c=>c.proto===BC_FILTER);
    document.getElementById('bc-total').textContent=list.length;
    var scored=list.filter(c=>BC_REVEALED[c.id]).length;
    document.getElementById('bc-score').textContent=scored;
    var html='';
    list.forEach(function(c){
      var done=BC_REVEALED[c.id];
      var dCol={CCNA:'#22c55e',CCNP:'#3b82f6',CCIE:'#ec4899'}[c.difficulty]||'#888';
      html+='<div onclick="bcShow('+c.id+')" style="padding:10px 12px;border-radius:8px;cursor:pointer;margin-bottom:4px;border:1px solid '+(BC_CURRENT===c.id?'var(--blue)':'var(--border)')+';background:'+(BC_CURRENT===c.id?'rgba(59,130,246,0.1)':'transparent')+'">'+
        '<div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">'+
        '<span style="font-size:9px;padding:1px 6px;border-radius:10px;background:'+dCol+'22;color:'+dCol+';border:1px solid '+dCol+'44">'+c.difficulty+'</span>'+
        '<span style="font-size:9px;color:var(--muted)">'+c.proto.toUpperCase()+'</span>'+
        (done?'<span style="font-size:9px;color:var(--green);margin-left:auto">✓</span>':'')+'</div>'+
        '<div style="font-family:var(--mono);font-size:11px;color:'+(BC_CURRENT===c.id?'var(--text)':'var(--muted2)')+';font-weight:600">'+c.title+'</div></div>';
    });
    document.getElementById('bc-challenge-list').innerHTML=html;
  }
  function bcShow(id){
    var c=BC_CHALLENGES.find(x=>x.id===id); if(!c) return;
    BC_CURRENT=c.id;
    bcRenderList();
    var html='<div style="font-family:var(--mono);font-size:10px;text-transform:uppercase;letter-spacing:1px;color:var(--muted);margin-bottom:12px">'+c.proto.toUpperCase()+' — '+c.difficulty+'</div>'+
      '<div style="font-size:17px;font-weight:700;color:var(--text);margin-bottom:10px">'+c.title+'</div>'+
      '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:14px;margin-bottom:14px;font-family:var(--mono);font-size:11px;line-height:1.9;color:var(--muted2)">'+c.scenario+'</div>'+
      '<div style="font-family:var(--mono);font-size:10px;text-transform:uppercase;letter-spacing:1px;color:var(--muted);margin-bottom:8px">Router configurations</div>';
    c.configs.forEach(function(cfg,i){
      html+='<div style="background:var(--bg3);border-radius:8px;padding:12px;margin-bottom:8px;font-family:var(--mono);font-size:10px;line-height:1.8;color:var(--cyan);white-space:pre-wrap">'+cfg+'</div>';
    });
    html+='<div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap">'+
      '<button onclick="bcReveal('+id+',\'hint\')" class="tool-pill">💡 Show hint</button>'+
      '<button onclick="bcReveal('+id+',\'bug\')" class="tool-pill" style="color:var(--amber)">🐛 Reveal bug</button>'+
      '<button onclick="bcReveal('+id+',\'fix\')" class="tool-pill" style="color:var(--green)">✅ Show fix</button></div>'+
      '<div id="bc-reveal-area-'+id+'" style="margin-top:12px"></div>';
    document.getElementById('bc-challenge-view').innerHTML=html;
  }
  function bcReveal(id,what){
    var c=BC_CHALLENGES.find(x=>x.id===id); if(!c) return;
    var el=document.getElementById('bc-reveal-area-'+id); if(!el) return;
    if(!BC_REVEALED[id]){ BC_REVEALED[id]=true; var l=BC_CHALLENGES.filter(x=>BC_REVEALED[x.id]).length; document.getElementById('bc-score').textContent=l; }
    var existing=el.innerHTML;
    if(what==='hint') el.innerHTML+='<div style="background:rgba(59,130,246,0.08);border:1px solid rgba(59,130,246,0.3);border-radius:8px;padding:12px;margin-bottom:8px;font-family:var(--mono);font-size:11px;line-height:1.9"><div style="color:var(--blue);font-weight:700;margin-bottom:4px">Hint</div>'+c.hint+'</div>';
    else if(what==='bug') el.innerHTML+='<div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.3);border-radius:8px;padding:12px;margin-bottom:8px;font-family:var(--mono);font-size:11px;line-height:1.9"><div style="color:var(--red);font-weight:700;margin-bottom:4px">The Bug</div>'+c.bug+'</div>';
    else if(what==='fix') el.innerHTML+='<div style="background:rgba(34,197,94,0.08);border:1px solid rgba(34,197,94,0.3);border-radius:8px;padding:12px;margin-bottom:8px;font-family:var(--mono);font-size:11px;line-height:1.9;white-space:pre-wrap"><div style="color:var(--green);font-weight:700;margin-bottom:4px">The Fix</div>'+c.fix+'</div>';
  }
  
  // ═══════════════════════════════════════════════════════════
  // NETWORK DESIGN WIZARD
  // ═══════════════════════════════════════════════════════════
  var ND_STEP=1, ND_DATA={};
  var ND_STEPS=[
    {title:'Network size',q:'How many sites does this network have?',field:'sites',options:[{v:1,l:'Single site (campus / HQ)'},{v:2,l:'2–5 sites (small WAN)'},{v:10,l:'6–20 sites (medium WAN)'},{v:50,l:'20+ sites (large enterprise)'}]},
    {title:'Routing protocol',q:'Primary interior routing protocol?',field:'proto',options:[{v:'ospf',l:'OSPF — most common enterprise IGP'},{v:'eigrp',l:'EIGRP — Cisco-only, fast convergence'},{v:'bgp',l:'BGP — large scale / service provider / internet'},{v:'isis',l:'IS-IS — SP backbone, data-center fabric'}]},
    {title:'WAN redundancy',q:'WAN redundancy requirement?',field:'redundancy',options:[{v:'none',l:'No redundancy (single link, lowest cost)'},{v:'dual',l:'Dual uplinks (same ISP, ECMP)'},{v:'multipath',l:'Dual ISP (full redundancy with IP SLA tracking)'},{v:'sdwan',l:'SD-WAN (intelligent multipath / application-aware)'}]},
    {title:'IP addressing',q:'IPv6 required?',field:'ipv6',options:[{v:'ipv4',l:'IPv4 only'},{v:'dual',l:'Dual-stack IPv4 + IPv6'},{v:'ipv6',l:'IPv6 only (future-proof)'}]},
    {title:'BGP security',q:'BGP / routing security posture?',field:'security',options:[{v:'basic',l:'Basic — MD5 session authentication only'},{v:'standard',l:'Standard — MD5 + prefix-lists + max-prefix'},{v:'rpki',l:'Full — RPKI + communities + max-prefix + TTL security'}]}
  ];
  
  // Store option values indexed as "stepIdx_optIdx" to avoid quote escaping in onclick
  var _ndOptVals = {};
  
  function ndRender(){
    var step=ND_STEPS[ND_STEP-1]; if(!step) return;
    var stepEl = document.getElementById('nd-step-num');
    if(stepEl) stepEl.textContent=ND_STEP;
  
    // Build option value registry (avoids inline onclick with string quoting)
    _ndOptVals = {};
    step.options.forEach(function(o,oi){ _ndOptVals['o'+oi] = o.v; });
  
    var html = '<div style="font-family:var(--mono);font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);margin-bottom:10px">Step '+ND_STEP+' of '+ND_STEPS.length+'</div>';
    html += '<div style="font-size:18px;font-weight:700;color:var(--text);margin-bottom:6px">'+step.title+'</div>';
    html += '<div style="font-family:var(--mono);font-size:12px;color:var(--muted2);margin-bottom:18px">'+step.q+'</div>';
  
    step.options.forEach(function(o,oi){
      var sel = ND_DATA[step.field]===o.v;
      html += '<div class="_nd-opt" data-oi="'+oi+'" style="display:flex;align-items:center;gap:12px;padding:12px 16px;border-radius:10px;cursor:pointer;margin-bottom:8px;';
      html += 'border:2px solid '+(sel?'var(--blue)':'var(--border)')+';background:'+(sel?'rgba(59,130,246,0.1)':'var(--bg3)')+'">';
      html += '<div style="width:18px;height:18px;border-radius:50%;border:2px solid '+(sel?'var(--blue)':'var(--border)')+';background:'+(sel?'var(--blue)':'transparent')+';flex-shrink:0;transition:all .15s"></div>';
      html += '<div><div style="font-family:var(--mono);font-size:12px;color:var(--text);font-weight:'+(sel?'700':'400')+'">'+o.l+'</div>';
      if(sel) html += '<div style="font-family:var(--mono);font-size:10px;color:var(--blue);margin-top:2px">Selected ✓</div>';
      html += '</div></div>';
    });
  
    // Navigation buttons
    html += '<div style="display:flex;gap:8px;margin-top:18px;align-items:center">';
    if(ND_STEP>1) html += '<button class="_nd-back tool-pill">← Back</button>';
    html += '<div style="flex:1"></div>';
    if(ND_STEP<ND_STEPS.length){
      var hasSelection = ND_DATA[step.field]!==undefined;
      html += '<button class="_nd-next tool-pill active" style="opacity:'+(hasSelection?'1':'0.4')+';cursor:'+(hasSelection?'pointer':'not-allowed')+'">';
      html += 'Next → '+(hasSelection?'':'(select an option first)')+'</button>';
    } else {
      html += '<button class="_nd-generate tool-pill active" style="background:var(--green);border-color:var(--green);color:#fff">Generate full config ✓</button>';
    }
    html += '</div>';
  
    // Progress bar
    html += '<div style="margin-top:16px;display:flex;gap:3px">';
    for(var i=0;i<ND_STEPS.length;i++){
      var done = i<ND_STEP, cur = i===ND_STEP-1;
      html += '<div style="flex:1;height:3px;border-radius:2px;background:'+(done?'var(--blue)':cur?'rgba(59,130,246,0.4)':'var(--bg3)')+'"></div>';
    }
    html += '</div>';
  
    var cont = document.getElementById('nd-step-content');
    if(!cont) return;
    cont.innerHTML = html;
  
    // Attach events via event delegation (no inline onclick quoting needed)
    cont.querySelectorAll('._nd-opt').forEach(function(el){
      el.addEventListener('click', function(){
        var oi = el.getAttribute('data-oi');
        var val = _ndOptVals['o'+oi];
        ND_DATA[step.field] = val;
        ndRender();
        ndGenerate();
      });
    });
    var backBtn = cont.querySelector('._nd-back');
    if(backBtn) backBtn.addEventListener('click', function(){ ND_STEP--; ndRender(); });
    var nextBtn = cont.querySelector('._nd-next');
    if(nextBtn) nextBtn.addEventListener('click', function(){
      if(ND_DATA[step.field]!==undefined){ ND_STEP++; ndRender(); ndGenerate(); }
    });
    var genBtn = cont.querySelector('._nd-generate');
    if(genBtn) genBtn.addEventListener('click', function(){ ndGenerate(); });
  
    ndGenerate();
  }
  function ndSelect(field,val){ ND_DATA[field]=val; ndRender(); }
  function ndGenerate(){
    var d=ND_DATA; var lines=[];
    var proto=d.proto||'ospf', sites=d.sites||1, redund=d.redundancy||'none';
    var ipv6mode=d.ipv6||'ipv4', sec=d.security||'basic';
  
    lines.push('! ═════════════════════════════════════════════════════');
    lines.push('! SubnetLab Pro — Network Design Wizard');
    lines.push('! Protocol: '+proto.toUpperCase()+'  Sites: '+sites+'  Redundancy: '+redund);
    lines.push('! IPv6: '+ipv6mode+'  Security: '+sec);
    lines.push('! ═════════════════════════════════════════════════════');
    lines.push('! Adjust hostnames, interface names, IPs, and ASNs.');
    lines.push('');
  
    // ── Global settings ──
    lines.push('! ── Global ─────────────────────────────────────────');
    lines.push('hostname ROUTER-1   ! Change per device');
    lines.push('ip routing');
    if(ipv6mode!=='ipv4'){ lines.push('ipv6 unicast-routing'); lines.push('ipv6 cef'); }
    lines.push('no ip source-route');
    lines.push('ip tcp synwait-time 10');
    lines.push('service tcp-keepalives-in');
    lines.push('service tcp-keepalives-out');
    lines.push('');
  
    // ── Loopback ──
    lines.push('! ── Loopback (stable router ID) ───────────────────');
    lines.push('interface Loopback0');
    lines.push(' ip address 1.1.1.1 255.255.255.255   ! Change per router');
    if(ipv6mode!=='ipv4') lines.push(' ipv6 address 2001:db8::1/128');
    lines.push(' no shutdown');
    lines.push('');
  
    // ── WAN interface ──
    lines.push('! ── WAN interface ──────────────────────────────────');
    lines.push('interface GigabitEthernet0/0');
    lines.push(' description WAN-UPLINK-PRIMARY');
    lines.push(' ip address 10.0.0.1 255.255.255.252   ! /30 P2P');
    if(ipv6mode!=='ipv4') lines.push(' ipv6 address 2001:db8:1::1/64');
    lines.push(' no ip proxy-arp');
    lines.push(' no shutdown');
    if(redund==='multipath'||redund==='dual'){
      lines.push('!');
      lines.push('interface GigabitEthernet0/1');
      lines.push(' description WAN-UPLINK-SECONDARY');
      lines.push(' ip address 10.0.1.1 255.255.255.252');
      lines.push(' no ip proxy-arp');
      lines.push(' no shutdown');
    }
    lines.push('');
  
    // ── Routing protocol ──
    lines.push('! ── Routing protocol: '+proto.toUpperCase()+' ────────────────────────');
    if(proto==='ospf'){
      lines.push('router ospf 1');
      lines.push(' router-id 1.1.1.1');
      lines.push(' auto-cost reference-bandwidth 10000   ! 10Gbps baseline');
      if(sites>5){ lines.push(' timers throttle spf 50 100 5000'); lines.push(' timers throttle lsa 10 100 5000'); }
      if(sites>1) lines.push(' area 0 authentication message-digest');
      lines.push(' passive-interface default');
      lines.push(' no passive-interface GigabitEthernet0/0');
      if(redund!=='none') lines.push(' no passive-interface GigabitEthernet0/1');
      if(redund==='multipath') lines.push(' maximum-paths 4');
      lines.push(' network 1.1.1.1 0.0.0.0 area 0      ! loopback');
      lines.push(' network 10.0.0.0 0.0.0.3 area 0     ! WAN link');
      lines.push('!');
      lines.push('! Interface-level OSPF (preferred over network cmd):');
      lines.push('! interface GigabitEthernet0/0');
      lines.push('!  ip ospf 1 area 0');
      lines.push('!  ip ospf authentication message-digest');
      lines.push('!  ip ospf message-digest-key 1 md5 OSPF-SECRET');
    } else if(proto==='eigrp'){
      lines.push('router eigrp ENTERPRISE');
      lines.push(' !');
      lines.push(' address-family ipv4 unicast autonomous-system 100');
      lines.push('  !');
      lines.push('  af-interface default');
      lines.push('   authentication mode hmac-sha-256 EIGRP-SECRET');
      lines.push('   passive-interface');
      lines.push('  !');
      lines.push('  af-interface GigabitEthernet0/0');
      lines.push('   no passive-interface');
      if(sites>2){ lines.push('   hello-interval 1'); lines.push('   hold-time 3'); }
      lines.push('  !');
      if(redund!=='none'){ lines.push('  af-interface GigabitEthernet0/1'); lines.push('   no passive-interface'); lines.push('  !'); }
      lines.push('  topology base');
      if(redund==='multipath'){ lines.push('   variance 2'); lines.push('   maximum-paths 4'); }
      lines.push('  !');
      lines.push('  network 1.1.1.1 0.0.0.0     ! loopback');
      lines.push('  network 10.0.0.0 0.0.0.3    ! WAN');
      lines.push('  eigrp router-id 1.1.1.1');
      if(sites>10) lines.push('  eigrp stub connected summary  ! for spoke sites');
      lines.push(' !');
    } else if(proto==='bgp'){
      lines.push('router bgp 65001   ! Change AS number');
      lines.push(' bgp router-id 1.1.1.1');
      lines.push(' bgp log-neighbor-changes');
      lines.push(' no bgp default ipv4-unicast');
      lines.push(' bgp bestpath as-path multipath-relax   ! for ECMP');
      lines.push('!');
      lines.push(' ! eBGP peer (ISP/upstream)');
      lines.push(' neighbor 10.0.0.2 remote-as 65000     ! ISP AS');
      lines.push(' neighbor 10.0.0.2 description ISP-PRIMARY');
      lines.push(' neighbor 10.0.0.2 update-source Loopback0');
      if(sec!=='basic') lines.push(' neighbor 10.0.0.2 password BGP-SECRET');
      if(sec!=='basic') lines.push(' neighbor 10.0.0.2 maximum-prefix 850000 80 restart 5');
      if(sec==='rpki'){
        lines.push(' neighbor 10.0.0.2 ttl-security hops 1');
      }
      if(redund!=='none'){
        lines.push(' neighbor 10.0.1.2 remote-as 65001     ! Secondary (change AS if dual-ISP)');
        lines.push(' neighbor 10.0.1.2 description ISP-SECONDARY');
        if(sec!=='basic') lines.push(' neighbor 10.0.1.2 password BGP-SECRET');
      }
      lines.push('!');
      lines.push(' address-family ipv4 unicast');
      lines.push('  neighbor 10.0.0.2 activate');
      lines.push('  neighbor 10.0.0.2 route-map RM-ISP-IN in');
      lines.push('  neighbor 10.0.0.2 route-map RM-ADVERTISE out');
      lines.push('  neighbor 10.0.0.2 soft-reconfiguration inbound');
      if(redund!=='none'){
        lines.push('  neighbor 10.0.1.2 activate');
        lines.push('  neighbor 10.0.1.2 route-map RM-ISP-IN in');
        lines.push('  neighbor 10.0.1.2 route-map RM-ADVERTISE out');
      }
      lines.push('  maximum-paths 2   ! ECMP for dual uplinks');
      lines.push(' !');
      lines.push('!');
      lines.push('! Prefix-list: only advertise your own space');
      lines.push('ip prefix-list PL-MY-PREFIXES permit 10.0.0.0/8 le 24');
      lines.push('!');
      lines.push('route-map RM-ADVERTISE permit 10');
      lines.push(' match ip address prefix-list PL-MY-PREFIXES');
      lines.push('route-map RM-ISP-IN permit 10');
      lines.push(' set local-preference 200   ! prefer primary ISP');
      if(redund!=='none'){ lines.push('route-map RM-ISP-IN permit 20'); lines.push(' set local-preference 100   ! secondary ISP fallback'); }
      if(sec==='rpki'){
        lines.push('!');
        lines.push('! RPKI Route Origin Validation');
        lines.push('bgp rpki server 10.0.0.254 port 3323 refresh 600');
        lines.push('bgp rpki authentication none');
        lines.push('route-map RM-ISP-IN deny 5');
        lines.push(' match rpki invalid');
      }
    } else if(proto==='isis'){
      lines.push('router isis CORE');
      lines.push(' net 49.0001.0000.0000.0001.00   ! Change NET per router');
      lines.push(' is-type level-2-only');
      lines.push(' metric-style wide');
      lines.push(' log-adjacency-changes');
      lines.push(' auto-cost reference-bandwidth 100000   ! 100Gbps');
      if(sites>5){ lines.push(' spf-interval 5 50 200'); lines.push(' prc-interval 5 50 200'); }
      lines.push(' segment-routing mpls   ! Enable SR-MPLS');
      lines.push(' segment-routing prefix-sid-map advertise-local');
      lines.push('!');
      lines.push('interface GigabitEthernet0/0');
      lines.push(' ip router isis CORE');
      if(ipv6mode!=='ipv4') lines.push(' ipv6 router isis CORE');
      lines.push(' isis metric 10');
      lines.push(' isis circuit-type level-2-only');
      lines.push(' isis authentication mode md5');
      lines.push(' isis authentication key-chain IS-IS-KEY');
    }
    lines.push('');
  
    // ── IPv6 additions ──
    if(ipv6mode==='dual'||ipv6mode==='ipv6'){
      lines.push('! ── IPv6 OSPFv3 (if OSPF selected) ────────────────');
      lines.push('ipv6 router ospf 1');
      lines.push(' router-id 1.1.1.1');
      lines.push(' area 0 authentication ipsec spi 500 sha1 0 DEADBEEF01');
      lines.push('interface GigabitEthernet0/0');
      lines.push(' ipv6 ospf 1 area 0');
      lines.push('');
    }
  
    // ── Redundancy extras ──
    if(redund==='multipath'&&proto!=='bgp'){
      lines.push('! ── Dual-ISP IP SLA tracking ───────────────────────');
      lines.push('ip sla 1');
      lines.push(' icmp-echo 8.8.8.8 source-interface GigabitEthernet0/0');
      lines.push(' frequency 5');
      lines.push(' timeout 2000');
      lines.push('ip sla schedule 1 life forever start-time now');
      lines.push('!');
      lines.push('track 1 ip sla 1 reachability');
      lines.push('ip route 0.0.0.0 0.0.0.0 10.0.0.2 track 1   ! primary');
      lines.push('ip route 0.0.0.0 0.0.0.0 10.0.1.2 10          ! backup (AD=10)');
      lines.push('');
    }
  
    // ── BFD ──
    if(sites>1&&redund!=='none'){
      lines.push('! ── BFD for sub-second failure detection ───────────');
      lines.push('bfd interval 300 min_rx 300 multiplier 3');
      lines.push('interface GigabitEthernet0/0');
      if(proto==='ospf')  lines.push(' ip ospf bfd');
      if(proto==='eigrp') lines.push(' bfd template FAST-BFD');
      if(proto==='bgp')   lines.push(' ! neighbor 10.0.0.2 fall-over bfd');
      lines.push('');
    }
  
    // ── Security hardening ──
    lines.push('! ── Security hardening ─────────────────────────────');
    lines.push('no ip http server');
    lines.push('no ip http secure-server');
    lines.push('no cdp run');
    lines.push('no ip finger');
    lines.push('no service pad');
    if(sec==='standard'||sec==='rpki'){
      lines.push('!');
      lines.push('key chain ROUTE-AUTH');
      lines.push(' key 1');
      lines.push('  key-string STRONG-PASSPHRASE-HERE');
      lines.push('  cryptographic-algorithm hmac-sha-256');
    }
    lines.push('');
    lines.push('! ── End of generated configuration ─────────────────');
    lines.push('! Review and adapt before applying to production.');
  
    var el=document.getElementById('nd-config-output');
    if(el) el.textContent=lines.join('\n');
  }
  // ndRender called via gotoPage init
  
  /* ═══════════════════════════════════════════════════════════
     STP / RSTP TOPOLOGY SIMULATOR
  ═══════════════════════════════════════════════════════════ */
  var stpSwitches=[], stpLinks=[], stpPorts=[];
  var stpRootId=-1, stpPhase=0, stpTimer=null, stpLogTime=0;
  var stpDrag=null, stpBpduParticles=[];
  var stpCanvas=null, stpCtx=null;
  var stpNumSw=4, stpProto='stp', stpDefaultCost=19;
  
  // Step mode state
  var stpStepActive=false, stpCurrentStep=0;
  var STP_TOTAL_STEPS=6;
  
  var STP_COLORS=['#5b9cf6','#38d9c0','#4ade80','#fbbf24','#f472b6','#a78bfa'];
  var STP_PORT_COL={root:'#5b9cf6',designated:'#4ade80',alternate:'#fbbf24',backup:'#f472b6',disabled:'#f87171',none:'#5a6080'};
  
  // Step-by-step descriptions (HTML rich text)
  function stpGetStepContent(step, proto){
    var p = proto==='rstp';
    var steps=[
      // Step 0: Intro
      '<div style="color:var(--text);font-size:13px;font-weight:700;margin-bottom:8px">📡 Step 1 of 6 — BPDU Exchange &amp; Initial State</div>'
      +'<div style="margin-bottom:8px">Every switch starts by <span style="color:var(--cyan)">assuming it is the Root Bridge</span>. Each switch sends Hello BPDUs (Bridge Protocol Data Units) out all ports every <span style="color:var(--amber)">2 seconds</span>.</div>'
      +'<div style="background:var(--bg3);border-radius:8px;padding:10px;margin-bottom:8px;font-size:11px">'
      +'<div style="color:var(--blue);margin-bottom:4px;font-weight:700">BPDU Contents (IEEE 802.1D frame):</div>'
      +'<div>• <span style="color:var(--amber)">Root BID</span> = My own Bridge ID (I think I\'m root)</div>'
      +'<div>• <span style="color:var(--amber)">Root Path Cost</span> = 0 (I\'m directly connected to root — me!)</div>'
      +'<div>• <span style="color:var(--amber)">Sender BID</span> = My Bridge ID</div>'
      +'<div>• <span style="color:var(--amber)">Port ID</span> = Port this BPDU is sent from</div></div>'
      +'<div style="color:var(--muted2);font-size:11px">'+( p?'<span style="color:var(--cyan)">RSTP:</span> Proposal flag is set in initial BPDUs — triggers Proposal/Agreement handshake for rapid port transitions.':'<span style="color:var(--blue)">STP:</span> After sending BPDUs, ports enter <span style="color:var(--amber)">Blocking (20s Max Age)</span> → Listening (15s) → Learning (15s) → Forwarding. Total: ~50 sec.')+'</div>',
  
      // Step 1: Root Bridge Election
      '<div style="color:var(--text);font-size:13px;font-weight:700;margin-bottom:8px">👑 Step 2 of 6 — Root Bridge Election</div>'
      +'<div style="margin-bottom:8px">Switches compare received BPDUs. The switch with the <span style="color:var(--green)">lowest Bridge ID (BID)</span> wins and becomes the Root Bridge.</div>'
      +'<div style="background:var(--bg3);border-radius:8px;padding:10px;margin-bottom:8px;font-size:11px">'
      +'<div style="color:var(--blue);margin-bottom:4px;font-weight:700">Bridge ID = Priority (16-bit) + MAC Address (48-bit)</div>'
      +'<div>• Default priority = <span style="color:var(--amber)">32768</span></div>'
      +'<div>• Tie on priority → lower MAC wins</div>'
      +'<div>• Priority must be in increments of <span style="color:var(--cyan)">4096</span></div>'
      +'<div>• Range: 0 (lowest = wins) to 61440</div></div>'
      +'<div style="background:rgba(74,222,128,0.08);border:1px solid rgba(74,222,128,0.25);border-radius:8px;padding:8px 12px;font-size:11px">✅ <strong style="color:var(--green)">All ports on the Root Bridge become Designated Ports (DP)</strong> and are immediately put in Forwarding state.</div>',
  
      // Step 2: Root Port Selection
      '<div style="color:var(--text);font-size:13px;font-weight:700;margin-bottom:8px">🔵 Step 3 of 6 — Root Port Selection</div>'
      +'<div style="margin-bottom:8px">Every <span style="color:var(--cyan)">non-root switch</span> elects exactly <span style="color:var(--amber)">one Root Port (RP)</span> — the port with the best (lowest cost) path back to the Root Bridge.</div>'
      +'<div style="background:var(--bg3);border-radius:8px;padding:10px;margin-bottom:8px;font-size:11px">'
      +'<div style="color:var(--blue);margin-bottom:4px;font-weight:700">Tiebreakers (in order):</div>'
      +'<div>① Lowest <span style="color:var(--cyan)">Root Path Cost</span> (cumulative cost to root)</div>'
      +'<div>② Lowest <span style="color:var(--cyan)">Upstream Bridge ID</span> (neighbor\'s BID)</div>'
      +'<div>③ Lowest <span style="color:var(--cyan)">Upstream Port ID</span> (neighbor\'s port priority.number)</div>'
      +'<div>④ Lowest <span style="color:var(--cyan)">Local Port ID</span> (own port priority.number)</div></div>'
      +'<div style="background:var(--bg3);border-radius:8px;padding:10px;font-size:11px"><div style="color:var(--amber);margin-bottom:4px;font-weight:700">IEEE 802.1D-2004 Port Costs:</div>'
      +'<div>10 Mbps = <span style="color:var(--blue)">100</span> &nbsp;·&nbsp; 100 Mbps = <span style="color:var(--blue)">19</span> &nbsp;·&nbsp; 1 Gbps = <span style="color:var(--blue)">4</span> &nbsp;·&nbsp; 10 Gbps = <span style="color:var(--blue)">2</span></div></div>',
  
      // Step 3: Designated Port Election
      '<div style="color:var(--text);font-size:13px;font-weight:700;margin-bottom:8px">🟢 Step 4 of 6 — Designated Port Election</div>'
      +'<div style="margin-bottom:8px">For every <span style="color:var(--cyan)">network segment (link)</span>, exactly one switch wins the Designated Port (DP) role. The DP is the switch that can reach the Root Bridge with the <span style="color:var(--green)">lowest cost</span>.</div>'
      +'<div style="background:var(--bg3);border-radius:8px;padding:10px;margin-bottom:8px;font-size:11px">'
      +'<div style="color:var(--blue);margin-bottom:4px;font-weight:700">DP Election per segment:</div>'
      +'<div>① Root Bridge always wins DP on its own segments</div>'
      +'<div>② Compare Root Path Cost of both ends of the link</div>'
      +'<div>③ Tie → lower Bridge ID wins</div>'
      +'<div>④ Tie again → lower Port ID wins</div></div>'
      +'<div style="color:var(--muted2);font-size:11px">💡 <strong>Key insight:</strong> If a port is not Root Port AND not Designated Port → it becomes Alternate/Backup and is <span style="color:var(--amber)">Blocked</span> to prevent loops.</div>',
  
      // Step 4: Blocking
      '<div style="color:var(--text);font-size:13px;font-weight:700;margin-bottom:8px">🟡 Step 5 of 6 — Blocking Redundant Ports</div>'
      +'<div style="margin-bottom:8px">Any port that lost the DP election and is NOT a Root Port is placed in <span style="color:var(--amber)">Blocking / Discarding state</span>. This breaks loops while keeping the topology fully connected.</div>'
      +'<div style="background:var(--bg3);border-radius:8px;padding:10px;margin-bottom:8px;font-size:11px">'
      +'<div style="color:var(--blue);margin-bottom:4px;font-weight:700">Port Roles:</div>'
      +'<div>🔵 <span style="color:var(--blue)">Root Port (RP)</span> — Best path to Root Bridge</div>'
      +'<div>🟢 <span style="color:var(--green)">Designated Port (DP)</span> — Best on this segment toward root</div>'
      +'<div>🟡 <span style="color:var(--amber)">Alternate Port (AP)</span> — Blocked; alternate path to root</div>'
      +'<div>🩷 <span style="color:var(--pink)">Backup Port (BP)</span> — Blocked; redundant on same segment</div></div>'
      +'<div style="background:rgba(251,191,36,0.07);border:1px solid rgba(251,191,36,0.25);border-radius:8px;padding:8px 12px;font-size:11px"><span style="color:var(--amber)">⚠️ Backup Port</span> only occurs when two ports on the <em>same switch</em> connect to the same segment (e.g., parallel cables to same switch). The lower Port ID wins DP; the other is Backup.</div>',
  
      // Step 5: Convergence
      '<div style="color:var(--text);font-size:13px;font-weight:700;margin-bottom:8px">✅ Step 6 of 6 — Convergence &amp; Topology Change</div>'
      +'<div style="margin-bottom:8px">STP has converged! The network is loop-free. Now lets understand <span style="color:var(--cyan)">how convergence differs between STP and RSTP</span>:</div>'
      +'<div style="background:var(--bg3);border-radius:8px;padding:10px;margin-bottom:8px;font-size:11px">'
      +(p?
        '<div style="color:var(--cyan);font-weight:700;margin-bottom:4px">RSTP 802.1w — Rapid Convergence (&lt;1 sec)</div>'
        +'<div>① DP sends BPDU with <span style="color:var(--green)">Proposal</span> flag to downstream switch</div>'
        +'<div>② Downstream switch blocks all non-edge ports → sends <span style="color:var(--green)">Agreement</span></div>'
        +'<div>③ DP immediately transitions to Forwarding — no timers!</div>'
        +'<div>④ Process repeats toward leaves — wave of rapid transitions</div>'
        +'<div style="margin-top:6px;color:var(--amber)">RSTP port states: Discarding → Learning → Forwarding</div>'
        +'<div style="color:var(--muted2)">No Listening/Blocking states. Edge ports (PortFast) go directly to Forwarding.</div>'
        :
        '<div style="color:var(--blue);font-weight:700;margin-bottom:4px">STP 802.1D — Timer-based (~30–50 sec)</div>'
        +'<div>Blocking (20s Max Age) → Listening (15s) → Learning (15s) → Forwarding</div>'
        +'<div style="margin-top:6px">On topology change: TCN BPDU sent to root → root floods TC BPDU → all switches reduce MAC table age to Forward Delay (15s) to flush stale entries</div>'
        +'<div style="margin-top:6px;color:var(--amber)">Use PortFast + BPDU Guard on access ports to avoid 30s delays for end hosts!</div>'
      )
      +'</div>'
      +'<div style="background:rgba(74,222,128,0.08);border:1px solid rgba(74,222,128,0.25);border-radius:8px;padding:8px 12px;font-size:11px">🎉 <strong style="color:var(--green)">Topology converged successfully!</strong> Try failing a link (⚡ Force Link Failure) to see STP re-converge.</div>'
    ];
    return steps[Math.min(step, steps.length-1)];
  }
  
  function stpSimInit(){
    stpCanvas=document.getElementById('stp-canvas');
    if(!stpCanvas) return;
    var wrap=document.getElementById('stp-canvas-wrap');
    stpCanvas.width=wrap ? wrap.clientWidth : 600;
    stpCanvas.height=420;
    stpCtx=stpCanvas.getContext('2d');
    stpBuildCountBtns();
    stpInitSwitches();
    stpBuildSWConfigs();
    stpAutoLayout();
    stpDraw();
    stpLogMsg('STP/RSTP Simulator ready. Press ▶ Run Election or 👣 Step-by-Step Mode.','info');
  
    stpCanvas.addEventListener('mousemove',stpOnMouseMove);
    stpCanvas.addEventListener('mousedown',stpOnMouseDown);
    stpCanvas.addEventListener('mouseup',function(){stpDrag=null;});
    stpCanvas.addEventListener('mouseleave',function(){stpDrag=null;});
    stpCanvas.addEventListener('contextmenu',stpOnRightClick);
    stpBuildLinkSelectors();
    stpBuildStepDots();
  }
  
  function stpBuildLinkSelectors(){
    var fromEl=document.getElementById('stp-link-from');
    var toEl=document.getElementById('stp-link-to');
    if(!fromEl||!toEl) return;
    fromEl.innerHTML=''; toEl.innerHTML='';
    stpSwitches.forEach(function(sw){
      fromEl.innerHTML+='<option value="'+sw.id+'">'+sw.name+'</option>';
      toEl.innerHTML+='<option value="'+sw.id+'">'+sw.name+'</option>';
    });
    if(stpSwitches.length>1) toEl.value='1';
  }
  
  function stpAddCustomLink(){
    var fromEl=document.getElementById('stp-link-from');
    var toEl=document.getElementById('stp-link-to');
    var costEl=document.getElementById('stp-link-cost-input');
    if(!fromEl||!toEl||!costEl) return;
    var a=parseInt(fromEl.value), b=parseInt(toEl.value);
    var cost=parseInt(costEl.value)||19;
    if(a===b){stpLogMsg('Cannot link a switch to itself','warn');return;}
    stpLinks.push({a:a,b:b,cost:cost,failed:false,custom:true});
    stpBuildPorts();
    stpLogMsg('Added link: '+stpSwitches[a].name+'↔'+stpSwitches[b].name+' cost='+cost,'ok');
    if(stpPhase>0) stpRunElection();
    else stpDraw();
  }
  
  function stpBuildCountBtns(){
    var el=document.getElementById('stp-count-btns'); if(!el) return;
    el.innerHTML='';
    for(var n=3;n<=6;n++){
      (function(num){
        var b=document.createElement('button');
        b.textContent=num;
        b.style.cssText='width:36px;height:28px;border-radius:6px;border:1px solid var(--border2);background:'+(num===stpNumSw?'rgba(91,156,246,0.2)':'transparent')+';color:'+(num===stpNumSw?'var(--blue)':'var(--muted2)')+';font-family:var(--mono);font-size:12px;font-weight:700;cursor:pointer;transition:all .15s';
        b.onclick=function(){stpNumSw=num;stpResetAll();};
        el.appendChild(b);
      })(n);
    }
  }
  
  function stpSetProto(p){
    stpProto=p;
    var bs=document.getElementById('stp-btn-stp'), br=document.getElementById('stp-btn-rstp');
    if(bs){bs.style.background=p==='stp'?'var(--blue)':'transparent';bs.style.color=p==='stp'?'#07090f':'var(--muted2)';}
    if(br){br.style.background=p==='rstp'?'var(--blue)':'transparent';br.style.color=p==='rstp'?'#07090f':'var(--muted2)';}
    var badge=document.getElementById('stp-proto-badge');
    if(badge){badge.textContent=p==='stp'?'STP 802.1D':'RSTP 802.1w';badge.style.background=p==='stp'?'rgba(91,156,246,0.15)':'rgba(56,217,192,0.15)';badge.style.color=p==='stp'?'var(--blue)':'var(--cyan)';}
    if(stpPhase>0) stpRunElection();
    if(stpStepActive) stpUpdateStepPanel();
  }
  
  function stpInitSwitches(){
    stpSwitches=[];stpLinks=[];stpPorts=[];stpRootId=-1;stpPhase=0;
    for(var i=0;i<stpNumSw;i++){
      var mac='00:0A:0B:0C:0D:'+('0'+(i+1)).slice(-2);
      stpSwitches.push({id:i,name:'SW'+(i+1),priority:32768,mac:mac,x:200+i*120,y:200,color:STP_COLORS[i],isRoot:false});
    }
    // Ring topology
    for(var i=0;i<stpNumSw;i++) stpLinks.push({a:i,b:(i+1)%stpNumSw,cost:stpDefaultCost,failed:false});
    // Extra cross links for redundancy
    if(stpNumSw===4) stpLinks.push({a:0,b:2,cost:stpDefaultCost,failed:false});
    if(stpNumSw>=5){stpLinks.push({a:0,b:2,cost:stpDefaultCost,failed:false});stpLinks.push({a:1,b:3,cost:stpDefaultCost,failed:false});}
    if(stpNumSw===6){stpLinks.push({a:0,b:3,cost:stpDefaultCost,failed:false});stpLinks.push({a:2,b:5,cost:stpDefaultCost,failed:false});}
    stpBuildPorts();
  }
  
  function stpBuildPorts(){
    stpPorts=[];
    stpLinks.forEach(function(lk,li){
      stpPorts.push({swId:lk.a,neighborId:lk.b,linkIdx:li,role:'none',state:'-'});
      stpPorts.push({swId:lk.b,neighborId:lk.a,linkIdx:li,role:'none',state:'-'});
    });
  }
  
  function stpBuildSWConfigs(){
    var el=document.getElementById('stp-sw-configs'); if(!el) return;
    el.innerHTML='';
    stpSwitches.forEach(function(sw){
      var d=document.createElement('div');
      d.style.cssText='background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:8px 10px;margin-bottom:6px';
      var opts=[0,4096,8192,12288,16384,20480,24576,28672,32768,36864,40960,45056,49152,53248,57344,61440].map(function(p){
        return '<option value="'+p+'"'+(p===sw.priority?' selected':'')+'>'+p+'</option>';
      }).join('');
      d.innerHTML='<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px"><div style="width:8px;height:8px;border-radius:50%;background:'+sw.color+'"></div><span style="font-family:var(--mono);font-size:11px;font-weight:700;color:var(--text)">'+sw.name+'</span>'+(sw.isRoot?'<span style="margin-left:auto;font-family:var(--mono);font-size:9px;padding:1px 5px;border-radius:3px;background:rgba(91,156,246,0.15);color:var(--blue)">ROOT</span>':'')+'</div>'
        +'<span style="font-family:var(--mono);font-size:9px;color:var(--muted);display:block;margin-bottom:3px">BRIDGE PRIORITY</span>'
        +'<select onchange="stpSetPriority('+sw.id+',this.value)" style="width:100%;background:var(--bg1);border:1px solid var(--border);border-radius:6px;padding:4px 8px;font-family:var(--mono);font-size:11px;color:var(--text);outline:none">'+opts+'</select>'
        +'<div style="font-family:var(--mono);font-size:9px;color:var(--muted);margin-top:4px">MAC: '+sw.mac+'</div>'
        +'<div style="font-family:var(--mono);font-size:9px;color:var(--muted2)">BID: '+(sw.priority*0x1000+(parseInt(sw.mac.replace(/:/g,''),16)&0xFFF))+'</div>';
      el.appendChild(d);
    });
  }
  
  function stpSetPriority(id,val){
    stpSwitches[id].priority=parseInt(val);
    if(stpPhase>0) stpRunElection();
    else stpBuildSWConfigs();
  }
  
  function stpAutoLayout(){
    if(!stpCanvas) return;
    var cx=stpCanvas.width/2, cy=stpCanvas.height/2-10;
    var r=Math.min(stpCanvas.width,stpCanvas.height)*0.30;
    stpSwitches.forEach(function(sw,i){
      var angle=(i/stpNumSw)*2*Math.PI-Math.PI/2;
      sw.x=cx+r*Math.cos(angle); sw.y=cy+r*Math.sin(angle);
    });
    stpDraw();
  }
  
  function stpBID(sw){
    var macVal=parseInt(sw.mac.replace(/:/g,''),16)&0xFFF;
    return sw.priority*0x1000+macVal;
  }
  
  // ── Step-by-Step Mode ──
  function stpStepMode(){
    stpStepActive=true;
    stpCurrentStep=0;
    // Reset election state for fresh walk
    stpPorts.forEach(function(p){p.role='none';p.state='-';});
    stpSwitches.forEach(function(sw){sw.isRoot=false;});
    stpRootId=-1; stpPhase=0;
    var cb=document.getElementById('stp-conv-badge'); if(cb) cb.style.display='none';
    stpSetPhase('Step-by-Step Mode: Step 1/6',1/6);
    stpBuildSWConfigs();
    stpDraw();
    stpUpdateStepPanel();
    stpAnimBPDU(function(){});
    stpLogMsg('Step-by-Step mode started. Use Next ▶ to advance.','info');
    var panel=document.getElementById('stp-step-panel');
    if(panel) panel.scrollIntoView({behavior:'smooth',block:'nearest'});
  }
  
  function stpStepNext(){
    if(stpCurrentStep<STP_TOTAL_STEPS-1){
      stpCurrentStep++;
      stpApplyStep(stpCurrentStep);
      stpUpdateStepPanel();
    }
  }
  
  function stpStepPrev(){
    if(stpCurrentStep>0){
      stpCurrentStep--;
      // Re-run up to this step from scratch
      stpPorts.forEach(function(p){p.role='none';p.state='-';});
      stpSwitches.forEach(function(sw){sw.isRoot=false;});
      stpRootId=-1;
      for(var s=0;s<=stpCurrentStep;s++) stpApplyStep(s);
      stpUpdateStepPanel();
    }
  }
  
  function stpApplyStep(step){
    if(step===0){
      stpPorts.forEach(function(p){p.role='none';p.state='-';});
      stpSwitches.forEach(function(sw){sw.isRoot=false;});
      stpRootId=-1;
      stpAnimBPDU(function(){});
      stpSetPhase('Phase 1: BPDU Exchange',1/6);
      stpLogMsg('Phase 1: All switches flood Hello BPDUs claiming to be Root Bridge','info');
    } else if(step===1){
      // Root election
      var minBid=Infinity;
      stpSwitches.forEach(function(sw){var bid=stpBID(sw);if(bid<minBid){minBid=bid;stpRootId=sw.id;}});
      stpSwitches.forEach(function(sw){sw.isRoot=(sw.id===stpRootId);});
      stpBuildSWConfigs();
      stpSetPhase('Phase 2: Root Bridge Elected',2/6);
      stpLogMsg('Root elected: '+stpSwitches[stpRootId].name+' (BID='+minBid+')','ok');
      stpDraw();
    } else if(step===2){
      // Root ports
      var dist=stpDijkstra(); var parent=stpParentMap();
      stpSwitches.forEach(function(sw){
        if(sw.id===stpRootId) return;
        var pli=parent[sw.id]; if(pli<0) return;
        var lk=stpLinks[pli]; var nbId=(lk.a===sw.id)?lk.b:lk.a;
        var port=stpPorts.find(function(p){return p.swId===sw.id&&p.neighborId===nbId&&p.linkIdx===pli;});
        if(port){port.role='root';port.state='Forwarding';stpLogMsg(sw.name+': Root Port → '+stpSwitches[nbId].name+' (cost='+dist[sw.id]+')','info');}
      });
      stpSetPhase('Phase 3: Root Ports Selected',3/6);
      stpDraw();
    } else if(step===3){
      // Designated ports
      var dist=stpDijkstra();
      stpLinks.forEach(function(lk,li){
        if(lk.failed) return;
        var pA=stpPorts.find(function(p){return p.swId===lk.a&&p.linkIdx===li;}),
            pB=stpPorts.find(function(p){return p.swId===lk.b&&p.linkIdx===li;});
        if(!pA||!pB) return;
        if(pA.role==='root'){pB.role='designated';pB.state='Forwarding';return;}
        if(pB.role==='root'){pA.role='designated';pA.state='Forwarding';return;}
        if(lk.a===stpRootId){pA.role='designated';pA.state='Forwarding';return;}
        if(lk.b===stpRootId){pB.role='designated';pB.state='Forwarding';return;}
        var ca=dist[lk.a]+lk.cost, cb=dist[lk.b]+lk.cost;
        var win=(ca<cb||(ca===cb&&stpBID(stpSwitches[lk.a])<stpBID(stpSwitches[lk.b])))?'A':'B';
        if(win==='A'){pA.role='designated';pA.state='Forwarding';stpLogMsg(stpSwitches[lk.a].name+'↔'+stpSwitches[lk.b].name+': '+stpSwitches[lk.a].name+' wins DP (cost '+ca+'<'+cb+')','info');}
        else{pB.role='designated';pB.state='Forwarding';stpLogMsg(stpSwitches[lk.a].name+'↔'+stpSwitches[lk.b].name+': '+stpSwitches[lk.b].name+' wins DP (cost '+cb+'<'+ca+')','info');}
      });
      stpSetPhase('Phase 4: Designated Ports',4/6);
      stpDraw();
    } else if(step===4){
      // Block remaining
      var state=stpProto==='stp'?'Blocking':'Discarding';
      stpPorts.forEach(function(port){
        if(port.role==='none'){
          var twins=stpPorts.filter(function(p){return p.swId===port.swId&&p.neighborId===port.neighborId&&p!==port;});
          port.role=twins.some(function(t){return t.role==='designated';})?'backup':'alternate';
          port.state=state;
          stpLogMsg(stpSwitches[port.swId].name+' → '+stpSwitches[port.neighborId].name+': '+port.role.toUpperCase()+' ('+state+')','warn');
        }
      });
      stpSetPhase('Phase 5: Ports Blocked',5/6);
      stpDraw();
    } else if(step===5){
      stpPhase=6;
      var blocked=stpPorts.filter(function(p){return p.role==='alternate'||p.role==='backup';});
      var cb=document.getElementById('stp-conv-badge'); if(cb) cb.style.display='';
      stpSetPhase('✓ Converged',1);
      stpLogMsg('✓ Converged! Root: '+stpSwitches[stpRootId].name+' | Blocked ports: '+blocked.length,'ok');
      if(stpProto==='stp') stpLogMsg('STP convergence time ~30-50 seconds in production','info');
      else stpLogMsg('RSTP convergence: <1 second via Proposal/Agreement handshake','info');
      stpBuildSWConfigs(); stpBuildFailPanel(); stpDraw();
    }
  }
  
  function stpUpdateStepPanel(){
    var content=document.getElementById('stp-step-content');
    var counter=document.getElementById('stp-step-counter');
    if(content) content.innerHTML=stpGetStepContent(stpCurrentStep, stpProto);
    if(counter) counter.textContent='Step '+(stpCurrentStep+1)+' / '+STP_TOTAL_STEPS;
    stpBuildStepDots();
    // Update prev/next buttons
    var prev=document.getElementById('stp-prev-btn'), next=document.getElementById('stp-next-btn');
    if(prev){prev.disabled=(stpCurrentStep===0);prev.style.opacity=stpCurrentStep===0?'0.4':'1';}
    if(next){
      next.textContent=stpCurrentStep===STP_TOTAL_STEPS-1?'✓ Done':'Next ▶';
      next.disabled=(stpCurrentStep===STP_TOTAL_STEPS-1);
      next.style.opacity=stpCurrentStep===STP_TOTAL_STEPS-1?'0.4':'1';
    }
  }
  
  function stpBuildStepDots(){
    var el=document.getElementById('stp-step-dots'); if(!el) return;
    el.innerHTML='';
    var labels=['BPDU','Root','RP','DP','Block','Done'];
    for(var i=0;i<STP_TOTAL_STEPS;i++){
      var active=(i===stpCurrentStep&&stpStepActive);
      var done=(i<stpCurrentStep&&stpStepActive);
      var dot=document.createElement('div');
      dot.style.cssText='display:flex;align-items:center;gap:3px;cursor:pointer;padding:2px 6px;border-radius:12px;border:1px solid '
        +(active?'rgba(56,217,192,0.5)':done?'rgba(74,222,128,0.3)':'var(--border)')
        +';background:'+(active?'rgba(56,217,192,0.12)':done?'rgba(74,222,128,0.08)':'transparent');
      dot.innerHTML='<span style="font-family:var(--mono);font-size:9px;color:'+(active?'var(--cyan)':done?'var(--green)':'var(--muted)')+'">'+( done?'✓ ':'')+labels[i]+'</span>';
      (function(idx){ dot.onclick=function(){if(stpStepActive){stpCurrentStep=idx;stpPorts.forEach(function(p){p.role='none';p.state='-';});stpSwitches.forEach(function(sw){sw.isRoot=false;});stpRootId=-1;for(var s=0;s<=idx;s++)stpApplyStep(s);stpUpdateStepPanel();}}; })(i);
      el.appendChild(dot);
    }
  }
  
  function stpRunElection(){
    stpStepActive=false;
    clearTimeout(stpTimer);
    stpPhase=1;stpLogTime=0;
    stpPorts.forEach(function(p){p.role='none';p.state='-';});
    stpSwitches.forEach(function(sw){sw.isRoot=false;});
    var cb=document.getElementById('stp-conv-badge'); if(cb) cb.style.display='none';
    stpBuildSWConfigs();
    stpSetPhase('Phase 1: BPDU Exchange',1/6);
    stpLogMsg('Starting '+(stpProto==='stp'?'STP 802.1D':'RSTP 802.1w')+' election with '+stpNumSw+' switches, '+stpLinks.filter(function(l){return !l.failed;}).length+' active links','info');
    stpAnimBPDU(function(){
      stpTimer=setTimeout(function(){ stpPhase2auto(); },400);
    });
  }
  
  function stpPhase2auto(){
    stpSetPhase('Phase 2: Root Bridge Election',2/6);
    var minBid=Infinity;
    stpSwitches.forEach(function(sw){var bid=stpBID(sw);if(bid<minBid){minBid=bid;stpRootId=sw.id;}});
    stpSwitches.forEach(function(sw){sw.isRoot=(sw.id===stpRootId);});
    var root=stpSwitches[stpRootId];
    stpLogMsg('Root elected: '+root.name+' (priority='+root.priority+', BID='+stpBID(root)+')','ok');
    stpBuildSWConfigs(); stpDraw();
    stpTimer=setTimeout(stpPhase3auto,500);
  }
  
  function stpPhase3auto(){
    stpSetPhase('Phase 3: Root Port Selection',3/6);
    var dist=stpDijkstra();
    var parent=stpParentMap();
    stpSwitches.forEach(function(sw){
      if(sw.id===stpRootId) return;
      var pli=parent[sw.id]; if(pli<0) return;
      var lk=stpLinks[pli];
      var nbId=(lk.a===sw.id)?lk.b:lk.a;
      var port=stpPorts.find(function(p){return p.swId===sw.id&&p.neighborId===nbId&&p.linkIdx===pli;});
      if(port){port.role='root';port.state='Forwarding';stpLogMsg(sw.name+' → '+stpSwitches[nbId].name+' = ROOT PORT (cost '+dist[sw.id]+')','info');}
    });
    stpDraw();stpTimer=setTimeout(stpPhase4auto,500);
  }
  
  function stpPhase4auto(){
    stpSetPhase('Phase 4: Designated Ports',4/6);
    var dist=stpDijkstra();
    stpLinks.forEach(function(lk,li){
      if(lk.failed) return;
      var pA=stpPorts.find(function(p){return p.swId===lk.a&&p.linkIdx===li;}),
          pB=stpPorts.find(function(p){return p.swId===lk.b&&p.linkIdx===li;});
      if(!pA||!pB) return;
      if(pA.role==='root'){pB.role='designated';pB.state='Forwarding';return;}
      if(pB.role==='root'){pA.role='designated';pA.state='Forwarding';return;}
      if(lk.a===stpRootId){pA.role='designated';pA.state='Forwarding';return;}
      if(lk.b===stpRootId){pB.role='designated';pB.state='Forwarding';return;}
      var ca=dist[lk.a]+lk.cost, cb=dist[lk.b]+lk.cost;
      var win=(ca<cb||(ca===cb&&stpBID(stpSwitches[lk.a])<stpBID(stpSwitches[lk.b])))?'A':'B';
      if(win==='A'){pA.role='designated';pA.state='Forwarding';stpLogMsg('Link '+stpSwitches[lk.a].name+'↔'+stpSwitches[lk.b].name+': '+stpSwitches[lk.a].name+' is DP','info');}
      else{pB.role='designated';pB.state='Forwarding';stpLogMsg('Link '+stpSwitches[lk.a].name+'↔'+stpSwitches[lk.b].name+': '+stpSwitches[lk.b].name+' is DP','info');}
    });
    stpDraw();stpTimer=setTimeout(stpPhase5auto,500);
  }
  
  function stpPhase5auto(){
    stpSetPhase('Phase 5: Blocking Ports',5/6);
    var state=stpProto==='stp'?'Blocking':'Discarding';
    stpPorts.forEach(function(port){
      if(port.role==='none'){
        var twins=stpPorts.filter(function(p){return p.swId===port.swId&&p.neighborId===port.neighborId&&p!==port;});
        port.role=twins.some(function(t){return t.role==='designated';})?'backup':'alternate';
        port.state=state;
        stpLogMsg(stpSwitches[port.swId].name+' → '+stpSwitches[port.neighborId].name+' = '+port.role.toUpperCase()+' ('+state+')','warn');
      }
    });
    stpDraw();stpTimer=setTimeout(stpPhase6auto,500);
  }
  
  function stpPhase6auto(){
    stpPhase=6;stpSetPhase('✓ Converged',1);
    var blocked=stpPorts.filter(function(p){return p.role==='alternate'||p.role==='backup';});
    var cb=document.getElementById('stp-conv-badge'); if(cb) cb.style.display='';
    stpLogMsg('Topology converged. Root: '+stpSwitches[stpRootId].name+' | Blocked ports: '+blocked.length,'ok');
    if(stpProto==='stp') stpLogMsg('STP convergence: ~30-50 seconds in production','info');
    else stpLogMsg('RSTP convergence: <1 second via Proposal/Agreement','info');
    var dist=stpDijkstra();
    stpSwitches.forEach(function(sw){if(sw.id!==stpRootId) stpLogMsg(sw.name+' root path cost = '+dist[sw.id],'info');});
    stpBuildSWConfigs();stpBuildFailPanel();stpDraw();
  }
  
  // ── Keep backward compat names ──
  function stpPhase2(){ stpPhase2auto(); }
  function stpPhase3(){ stpPhase3auto(); }
  function stpPhase4(){ stpPhase4auto(); }
  function stpPhase5(){ stpPhase5auto(); }
  function stpPhase6(){ stpPhase6auto(); }
  
  function stpDijkstra(){
    var dist=new Array(stpNumSw).fill(Infinity);
    dist[stpRootId]=0;
    var pq=[[0,stpRootId]];
    while(pq.length){
      pq.sort(function(a,b){return a[0]-b[0];});
      var cur=pq.shift(),cost=cur[0],u=cur[1];
      if(cost>dist[u]) continue;
      stpLinks.forEach(function(lk){
        if(lk.failed) return;
        var v=-1;
        if(lk.a===u) v=lk.b; else if(lk.b===u) v=lk.a;
        if(v>=0&&dist[u]+lk.cost<dist[v]){dist[v]=dist[u]+lk.cost;pq.push([dist[v],v]);}
      });
    }
    return dist;
  }
  
  function stpParentMap(){
    var dist=new Array(stpNumSw).fill(Infinity),parent=new Array(stpNumSw).fill(-1);
    dist[stpRootId]=0;var pq=[[0,stpRootId]];
    while(pq.length){
      pq.sort(function(a,b){return a[0]-b[0];});
      var cur=pq.shift(),cost=cur[0],u=cur[1];
      if(cost>dist[u]) continue;
      stpLinks.forEach(function(lk,li){
        if(lk.failed) return;
        var v=-1;
        if(lk.a===u) v=lk.b; else if(lk.b===u) v=lk.a;
        if(v>=0&&dist[u]+lk.cost<dist[v]){dist[v]=dist[u]+lk.cost;parent[v]=li;pq.push([dist[v],v]);}
      });
    }
    return parent;
  }
  
  function stpAnimBPDU(cb){
    stpBpduParticles=[];
    stpLinks.forEach(function(lk){
      if(lk.failed) return;
      var a=stpSwitches[lk.a],b=stpSwitches[lk.b];
      stpBpduParticles.push({x:a.x,y:a.y,tx:b.x,ty:b.y,t:0,color:a.color});
      stpBpduParticles.push({x:b.x,y:b.y,tx:a.x,ty:a.y,t:0,color:b.color});
    });
    function tick(){
      stpBpduParticles.forEach(function(p){p.t+=0.04;});
      stpBpduParticles=stpBpduParticles.filter(function(p){return p.t<1;});
      stpDraw();
      if(stpBpduParticles.length) requestAnimationFrame(tick); else if(cb) cb();
    }
    tick();
  }
  
  function stpBuildFailPanel(){
    var el=document.getElementById('stp-fail-links'); if(!el) return;
    el.innerHTML='';
    stpLinks.forEach(function(lk,li){
      var btn=document.createElement('button');
      btn.style.cssText='padding:5px 8px;border-radius:6px;border:1px solid '+(lk.failed?'rgba(248,113,113,0.5)':'var(--border)')+';background:'+(lk.failed?'rgba(248,113,113,0.1)':'var(--bg3)')+';color:'+(lk.failed?'var(--red)':'var(--muted2)')+';font-family:var(--mono);font-size:10px;cursor:pointer;text-align:left;width:100%';
      btn.textContent=(lk.failed?'✗ FAILED':'✓ Active')+' '+stpSwitches[lk.a].name+'↔'+stpSwitches[lk.b].name+(lk.cost!==stpDefaultCost?' [cost='+lk.cost+']':'');
      btn.onclick=function(){stpToggleLink(li);};
      el.appendChild(btn);
      // Remove link button (for custom links)
      if(lk.custom){
        var rm=document.createElement('button');
        rm.style.cssText='margin-left:4px;padding:3px 7px;border-radius:5px;border:1px solid rgba(248,113,113,0.3);background:rgba(248,113,113,0.08);color:var(--red);font-family:var(--mono);font-size:9px;cursor:pointer;float:right';
        rm.textContent='✕ Remove';
        rm.onclick=function(e){e.stopPropagation();stpRemoveLink(li);};
        btn.appendChild(rm);
      }
    });
  }
  
  function stpRemoveLink(li){
    var lk=stpLinks[li];
    stpLogMsg('Removed link: '+stpSwitches[lk.a].name+'↔'+stpSwitches[lk.b].name,'warn');
    stpLinks.splice(li,1);
    stpBuildPorts();
    if(stpPhase>0) stpRunElection();
    else {stpBuildFailPanel();stpDraw();}
  }
  
  function stpToggleLink(li){
    stpLinks[li].failed=!stpLinks[li].failed;
    var lk=stpLinks[li];
    if(lk.failed) stpLogMsg('Link FAILED: '+stpSwitches[lk.a].name+'↔'+stpSwitches[lk.b].name,'warn');
    else stpLogMsg('Link RESTORED: '+stpSwitches[lk.a].name+'↔'+stpSwitches[lk.b].name,'ok');
    stpBuildPorts();stpRunElection();
  }
  
  function stpToggleFailPanel(){
    var p=document.getElementById('stp-fail-panel'); if(!p) return;
    if(p.style.display==='none'){
      if(stpPhase<6){stpLogMsg('Run election first!','warn');return;}
      stpBuildFailPanel();p.style.display='';
    } else p.style.display='none';
  }
  
  function stpResetAll(){
    clearTimeout(stpTimer);stpPhase=0;stpLogTime=0;stpStepActive=false;stpCurrentStep=0;
    var cb=document.getElementById('stp-conv-badge'); if(cb) cb.style.display='none';
    var logEl=document.getElementById('stp-log'); if(logEl) logEl.innerHTML='';
    stpSetPhase('Idle — press Run Election',0);
    var sc=document.getElementById('stp-step-content');
    if(sc) sc.innerHTML='<div style="color:var(--muted);font-size:11px">Press <strong style="color:var(--cyan)">👣 Step-by-Step Mode</strong> to start the guided walkthrough, or <strong style="color:var(--blue)">▶ Run Election</strong> to auto-animate.</div>';
    var counter=document.getElementById('stp-step-counter'); if(counter) counter.textContent='Step 0 / 6';
    stpInitSwitches();stpBuildSWConfigs();stpBuildCountBtns();stpAutoLayout();stpBuildLinkSelectors();stpBuildStepDots();stpDraw();
  }
  
  function stpSetPhase(txt,pct){
    var el=document.getElementById('stp-phase-text'); if(el) el.textContent=txt;
    var fill=document.getElementById('stp-timer-fill'); if(fill) fill.style.width=(pct*100)+'%';
  }
  
  function stpClearLog(){var el=document.getElementById('stp-log');if(el)el.innerHTML='';}
  
  function stpLogMsg(msg,type){
    var el=document.getElementById('stp-log'); if(!el) return;
    var colors={info:'var(--muted2)',ok:'var(--green)',warn:'var(--amber)',err:'var(--red)'};
    var icons={info:'›',ok:'✓',warn:'⚠',err:'✗'};
    var d=document.createElement('div');
    d.style.cssText='color:'+(colors[type]||'var(--muted2)')+';padding:1px 0;border-bottom:1px solid rgba(255,255,255,0.03)';
    var t=new Date(); var ts=(('0'+t.getHours()).slice(-2)+':'+('0'+t.getMinutes()).slice(-2)+':'+('0'+t.getSeconds()).slice(-2));
    d.textContent=(icons[type]||'›')+' ['+ts+'] '+msg;
    el.appendChild(d);
    el.scrollTop=el.scrollHeight;
  }
  
  function stpDraw(){
    if(!stpCtx||!stpCanvas) return;
    var ctx=stpCtx, W=stpCanvas.width, H=stpCanvas.height;
    ctx.clearRect(0,0,W,H);
  
    // Count parallel links between each pair
    var linkCount={};
    stpLinks.forEach(function(lk,li){
      var key=Math.min(lk.a,lk.b)+'-'+Math.max(lk.a,lk.b);
      linkCount[key]=(linkCount[key]||0)+1;
    });
    var linkIndex={};
  
    // Draw links
    stpLinks.forEach(function(lk,li){
      var a=stpSwitches[lk.a],b=stpSwitches[lk.b];
      var pA=stpPorts.find(function(p){return p.swId===lk.a&&p.linkIdx===li;});
      var pB=stpPorts.find(function(p){return p.swId===lk.b&&p.linkIdx===li;});
  
      // Determine parallel offset
      var key=Math.min(lk.a,lk.b)+'-'+Math.max(lk.a,lk.b);
      var total=linkCount[key]||1;
      linkIndex[key]=(linkIndex[key]||0);
      var idx=linkIndex[key]; linkIndex[key]++;
      var offset=0;
      if(total>1){ offset=(idx-(total-1)/2)*14; }
  
      // Perpendicular offset
      var dx=b.x-a.x, dy=b.y-a.y, len=Math.sqrt(dx*dx+dy*dy)||1;
      var ox=-dy/len*offset, oy=dx/len*offset;
      var ax=a.x+ox, ay=a.y+oy, bx=b.x+ox, by=b.y+oy;
  
      // Color based on port roles
      var roleA=pA?pA.role:'none', roleB=pB?pB.role:'none';
      var isActive=roleA!=='none'||roleB!=='none';
      var isBlocked=(roleA==='alternate'||roleA==='backup'||roleB==='alternate'||roleB==='backup');
      var isFailed=lk.failed;
  
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(ax,ay); ctx.lineTo(bx,by);
      if(isFailed){
        ctx.strokeStyle='rgba(248,113,113,0.5)'; ctx.lineWidth=2;
        ctx.setLineDash([6,4]);
      } else if(isBlocked){
        ctx.strokeStyle='rgba(251,191,36,0.4)'; ctx.lineWidth=2;
        ctx.setLineDash([5,5]);
      } else if(isActive){
        ctx.strokeStyle='rgba(74,222,128,0.6)'; ctx.lineWidth=2.5;
        ctx.setLineDash([]);
      } else {
        ctx.strokeStyle='rgba(100,160,255,0.2)'; ctx.lineWidth=1.5;
        ctx.setLineDash([]);
      }
      ctx.stroke();
      ctx.restore();
  
      // Cost label
      var mx=(ax+bx)/2, my=(ay+by)/2;
      ctx.save();
      ctx.font='bold 9px IBM Plex Mono,monospace';
      ctx.fillStyle=isFailed?'rgba(248,113,113,0.7)':'rgba(100,160,255,0.6)';
      ctx.textAlign='center'; ctx.textBaseline='middle';
      var pad=3;
      ctx.fillStyle='rgba(7,9,15,0.7)';
      ctx.fillRect(mx-12,my-7,24,14);
      ctx.fillStyle=isFailed?'#f87171':isBlocked?'#fbbf24':'rgba(100,160,255,0.8)';
      ctx.fillText(lk.cost,mx,my);
      ctx.restore();
  
      // Port role indicators — small circles on link ends
      function drawPortDot(px,py,role){
        if(role==='none') return;
        var col=STP_PORT_COL[role]||'#5a6080';
        // offset dot toward center
        var ddx=px===ax?bx-ax:ax-bx, ddy=py===ay?by-ay:ay-by;
        var dl=Math.sqrt(ddx*ddx+ddy*ddy)||1;
        var dotX=px+ddx/dl*22, dotY=py+ddy/dl*22;
        ctx.save();
        ctx.beginPath(); ctx.arc(dotX,dotY,5,0,Math.PI*2);
        ctx.fillStyle=col; ctx.fill();
        ctx.strokeStyle='rgba(7,9,15,0.9)'; ctx.lineWidth=1.5; ctx.stroke();
        ctx.font='bold 8px IBM Plex Mono,monospace';
        ctx.fillStyle=col; ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText(role==='root'?'RP':role==='designated'?'DP':role==='alternate'?'AP':'BP',dotX,dotY+14);
        ctx.restore();
      }
      if(!isFailed){
        drawPortDot(ax,ay,roleA);
        drawPortDot(bx,by,roleB);
      }
  
      // Fail X mark
      if(isFailed){
        ctx.save();
        ctx.font='bold 13px sans-serif'; ctx.fillStyle='#f87171';
        ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText('✗',(ax+bx)/2,(ay+by)/2+0);
        ctx.restore();
      }
    });
  
    // BPDU particles
    stpBpduParticles.forEach(function(p){
      var px=p.x+(p.tx-p.x)*p.t, py=p.y+(p.ty-p.y)*p.t;
      ctx.save();
      ctx.beginPath(); ctx.arc(px,py,4,0,Math.PI*2);
      ctx.fillStyle=p.color; ctx.globalAlpha=1-p.t*0.8; ctx.fill();
      ctx.restore();
    });
  
    // Draw switches
    stpSwitches.forEach(function(sw){
      var x=sw.x, y=sw.y, r=26;
      ctx.save();
      // Glow for root
      if(sw.isRoot){
        ctx.shadowColor=sw.color; ctx.shadowBlur=18;
      }
      // Outer ring
      ctx.beginPath(); ctx.arc(x,y,r+3,0,Math.PI*2);
      ctx.strokeStyle=sw.isRoot?sw.color:'rgba(100,160,255,0.15)';
      ctx.lineWidth=sw.isRoot?2:1; ctx.stroke();
      // Body
      ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2);
      var grad=ctx.createRadialGradient(x-8,y-8,2,x,y,r);
      grad.addColorStop(0,sw.isRoot?sw.color+'44':'rgba(30,36,56,0.97)');
      grad.addColorStop(1,'rgba(12,15,26,0.97)');
      ctx.fillStyle=grad; ctx.fill();
      ctx.strokeStyle=sw.color; ctx.lineWidth=sw.isRoot?2.5:1.5; ctx.stroke();
      ctx.restore();
  
      // Switch icon lines
      ctx.save();
      for(var i=-1;i<=1;i++){
        ctx.beginPath(); ctx.moveTo(x-12,y+i*5); ctx.lineTo(x+12,y+i*5);
        ctx.strokeStyle=sw.color+'99'; ctx.lineWidth=1.5; ctx.stroke();
      }
      ctx.restore();
  
      // Name
      ctx.save();
      ctx.font='bold 10px IBM Plex Mono,monospace';
      ctx.fillStyle=sw.isRoot?sw.color:'var(--text,#e8eaf0)';
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(sw.name,x,y-12);
      ctx.restore();
  
      // Priority label
      ctx.save();
      ctx.font='9px IBM Plex Mono,monospace';
      ctx.fillStyle='rgba(200,210,230,0.5)';
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('P:'+sw.priority,x,y+12);
      ctx.restore();
  
      // ROOT badge
      if(sw.isRoot){
        ctx.save();
        ctx.font='bold 8px IBM Plex Mono,monospace';
        ctx.fillStyle='#07090f';
        var bw=30,bh=13;
        ctx.fillStyle=sw.color;
        ctx.beginPath();
        var rx=x-bw/2, ry=y-r-20, rr=3;
        ctx.moveTo(rx+rr,ry); ctx.lineTo(rx+bw-rr,ry); ctx.quadraticCurveTo(rx+bw,ry,rx+bw,ry+rr);
        ctx.lineTo(rx+bw,ry+bh-rr); ctx.quadraticCurveTo(rx+bw,ry+bh,rx+bw-rr,ry+bh);
        ctx.lineTo(rx+rr,ry+bh); ctx.quadraticCurveTo(rx,ry+bh,rx,ry+bh-rr);
        ctx.lineTo(rx,ry+rr); ctx.quadraticCurveTo(rx,ry,rx+rr,ry); ctx.closePath();
        ctx.fill();
        ctx.fillStyle='#07090f';
        ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillText('ROOT',x,y-r-14);
        ctx.restore();
      }
    });
  }
  
  function stpOnMouseMove(e){
    var rect=stpCanvas.getBoundingClientRect(),scaleX=stpCanvas.width/rect.width;
    var mx=(e.clientX-rect.left)*scaleX,my=(e.clientY-rect.top)*scaleX;
    if(stpDrag){stpSwitches[stpDrag.id].x=mx-stpDrag.ox;stpSwitches[stpDrag.id].y=my-stpDrag.oy;stpDraw();}
  }
  
  function stpOnMouseDown(e){
    var rect=stpCanvas.getBoundingClientRect(),scaleX=stpCanvas.width/rect.width;
    var mx=(e.clientX-rect.left)*scaleX,my=(e.clientY-rect.top)*scaleX;
    for(var i=0;i<stpSwitches.length;i++){
      var sw=stpSwitches[i],dx=mx-sw.x,dy=my-sw.y;
      if(dx*dx+dy*dy<32*32){stpDrag={id:i,ox:dx,oy:dy};return;}
    }
    if(stpPhase>=6){
      for(var li=0;li<stpLinks.length;li++){
        var lk=stpLinks[li],a=stpSwitches[lk.a],b=stpSwitches[lk.b];
        if(stpDistSeg(mx,my,a.x,a.y,b.x,b.y)<12){stpToggleLink(li);return;}
      }
    }
  }
  
  function stpOnRightClick(e){
    e.preventDefault();
    var rect=stpCanvas.getBoundingClientRect(),scaleX=stpCanvas.width/rect.width;
    var mx=(e.clientX-rect.left)*scaleX,my=(e.clientY-rect.top)*scaleX;
    for(var li=0;li<stpLinks.length;li++){
      var lk=stpLinks[li];
      if(!lk.custom) continue;
      var a=stpSwitches[lk.a],b=stpSwitches[lk.b];
      if(stpDistSeg(mx,my,a.x,a.y,b.x,b.y)<12){
        stpRemoveLink(li);return;
      }
    }
  }
  
  function stpDistSeg(px,py,ax,ay,bx,by){
    var dx=bx-ax,dy=by-ay,l2=dx*dx+dy*dy;
    if(!l2) return Math.hypot(px-ax,py-ay);
    var t=Math.max(0,Math.min(1,((px-ax)*dx+(py-ay)*dy)/l2));
    return Math.hypot(px-(ax+t*dx),py-(ay+t*dy));
  }
  
  /* ═══════════════════════════════════════════════════════════
     VLAN 802.1Q VISUALIZER
  ═══════════════════════════════════════════════════════════ */
  var vlanVlans=[], vlanPorts=[], vlanAnimId=null;
  var vlanCanvas=null, vlanCtx=null;
  var VLAN_COLORS=['#5b9cf6','#4ade80','#fbbf24','#f472b6','#38d9c0','#a78bfa'];
  
  function vlanVizInit(){
    vlanCanvas=document.getElementById('vlan-canvas');
    if(!vlanCanvas) return;
    vlanCanvas.width=vlanCanvas.offsetWidth||520;
    vlanCtx=vlanCanvas.getContext('2d');
    // Default VLANs
    if(!vlanVlans.length){
      vlanVlans=[{id:10,name:'MGMT',color:VLAN_COLORS[0]},{id:20,name:'DATA',color:VLAN_COLORS[1]},{id:30,name:'VOICE',color:VLAN_COLORS[2]}];
      vlanPorts=[
        {id:'SW1-Fa0/1',sw:0,type:'access',vlan:10,native:1},
        {id:'SW1-Fa0/2',sw:0,type:'access',vlan:20,native:1},
        {id:'SW1-Gi0/1',sw:0,type:'trunk',vlan:0,native:1},
        {id:'SW2-Fa0/1',sw:1,type:'access',vlan:10,native:1},
        {id:'SW2-Fa0/2',sw:1,type:'access',vlan:30,native:1},
        {id:'SW2-Gi0/1',sw:1,type:'trunk',vlan:0,native:1},
      ];
    }
    vlanRenderConfig();vlanDrawStatic(null);vlanUpdatePortSelects();
  }
  
  function vlanAddVlan(){
    if(vlanVlans.length>=6){alert('Max 6 VLANs');return;}
    var id=vlanVlans.length>0?Math.max.apply(null,vlanVlans.map(function(v){return v.id;}))+10:10;
    vlanVlans.push({id:id,name:'VLAN'+id,color:VLAN_COLORS[vlanVlans.length%6]});
    vlanRenderConfig();
  }
  
  function vlanRenderConfig(){
    var el=document.getElementById('vlan-list'); if(!el) return;
    el.innerHTML='';
    vlanVlans.forEach(function(v,i){
      var row=document.createElement('div');
      row.style.cssText='display:flex;align-items:center;gap:6px;background:var(--bg3);border-radius:8px;padding:8px 10px';
      row.innerHTML='<div style="width:12px;height:12px;border-radius:3px;background:'+v.color+';flex-shrink:0"></div>'
        +'<input type="number" value="'+v.id+'" min="1" max="4094" onchange="vlanSetId('+i+',this.value)" style="width:60px;background:var(--bg1);border:1px solid var(--border);border-radius:6px;padding:3px 6px;font-family:var(--mono);font-size:11px;color:var(--text);outline:none">'
        +'<input type="text" value="'+v.name+'" onchange="vlanSetName('+i+',this.value)" style="flex:1;background:var(--bg1);border:1px solid var(--border);border-radius:6px;padding:3px 6px;font-family:var(--mono);font-size:11px;color:var(--text);outline:none">'
        +'<button onclick="vlanDelVlan('+i+')" style="padding:3px 8px;border-radius:5px;border:1px solid rgba(248,113,113,0.3);background:rgba(248,113,113,0.08);color:var(--red);font-family:var(--mono);font-size:10px;cursor:pointer">✕</button>';
      el.appendChild(row);
    });
  
    var tc=document.getElementById('vlan-topo-config'); if(!tc) return;
    tc.innerHTML='<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">'
      +vlanRenderSwConfig(0,'Switch 1 (SW1)')+vlanRenderSwConfig(1,'Switch 2 (SW2)')+'</div>';
    vlanUpdatePortSelects();vlanDrawStatic(null);
  }
  
  function vlanRenderSwConfig(swIdx,label){
    var swPorts=vlanPorts.filter(function(p){return p.sw===swIdx;});
    var rows=swPorts.map(function(p,i){
      var realIdx=vlanPorts.indexOf(p);
      var vlanOpts=vlanVlans.map(function(v){return '<option value="'+v.id+'"'+(p.vlan===v.id?' selected':'')+'>VLAN '+v.id+' – '+v.name+'</option>';}).join('');
      return '<div style="background:var(--bg3);border-radius:6px;padding:7px 8px;margin-bottom:4px">'
        +'<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">'
        +'<span style="font-family:var(--mono);font-size:10px;color:var(--blue)">'+p.id+'</span>'
        +'<select onchange="vlanSetPortType('+realIdx+',this.value)" style="margin-left:auto;background:var(--bg1);border:1px solid var(--border);border-radius:5px;padding:2px 6px;font-family:var(--mono);font-size:10px;color:var(--text);outline:none">'
        +'<option value="access"'+(p.type==='access'?' selected':'')+'>Access</option>'
        +'<option value="trunk"'+(p.type==='trunk'?' selected':'')+'>Trunk</option>'
        +'</select></div>'
        +(p.type==='access'?'<select onchange="vlanSetPortVlan('+realIdx+',this.value)" style="width:100%;background:var(--bg1);border:1px solid var(--border);border-radius:5px;padding:3px 6px;font-family:var(--mono);font-size:10px;color:var(--text);outline:none">'+vlanOpts+'</select>':'<span style="font-family:var(--mono);font-size:10px;color:var(--muted2)">All VLANs | Native: <input type="number" value="'+p.native+'" min="1" max="4094" onchange="vlanSetNative('+realIdx+',this.value)" style="width:44px;background:var(--bg1);border:1px solid var(--border);border-radius:4px;padding:1px 4px;font-family:var(--mono);font-size:10px;color:var(--text);outline:none"></span>')
        +'</div>';
    }).join('');
    return '<div><div style="font-family:var(--mono);font-size:10px;font-weight:700;color:var(--cyan);margin-bottom:6px">'+label+'</div>'+rows+'</div>';
  }
  
  function vlanSetId(i,v){vlanVlans[i].id=parseInt(v);vlanRenderConfig();}
  function vlanSetName(i,v){vlanVlans[i].name=v;vlanRenderConfig();}
  function vlanDelVlan(i){vlanVlans.splice(i,1);vlanRenderConfig();}
  function vlanSetPortType(i,v){vlanPorts[i].type=v;vlanRenderConfig();}
  function vlanSetPortVlan(i,v){vlanPorts[i].vlan=parseInt(v);vlanUpdatePortSelects();}
  function vlanSetNative(i,v){vlanPorts[i].native=parseInt(v);vlanCheckMismatch();}
  
  function vlanUpdatePortSelects(){
    ['vlan-src-port','vlan-dst-port'].forEach(function(id){
      var el=document.getElementById(id); if(!el) return;
      var cur=el.value;el.innerHTML='';
      vlanPorts.filter(function(p){return p.type==='access';}).forEach(function(p){
        var opt=document.createElement('option');opt.value=p.id;opt.textContent=p.id+' (VLAN '+(p.type==='access'?p.vlan:'trunk')+')';
        el.appendChild(opt);
      });
      if(cur) el.value=cur;
    });
    vlanCheckMismatch();
  }
  
  function vlanCheckMismatch(){
    var t1=vlanPorts.find(function(p){return p.sw===0&&p.type==='trunk';}),
        t2=vlanPorts.find(function(p){return p.sw===1&&p.type==='trunk';});
    var wa=document.getElementById('vlan-warn-area'); if(!wa) return;
    if(t1&&t2&&t1.native!==t2.native){
      wa.innerHTML='<div style="background:rgba(248,113,113,0.1);border:1px solid rgba(248,113,113,0.3);border-radius:8px;padding:8px 12px;font-family:var(--mono);font-size:11px;color:var(--red)">⚠ Native VLAN mismatch! SW1 trunk native='+t1.native+' vs SW2 trunk native='+t2.native+'. Untagged frames will land in wrong VLAN — Cisco will generate CDP err-disabled warnings.</div>';
    } else {
      wa.innerHTML='<div style="font-family:var(--mono);font-size:10px;color:var(--muted)">Native VLAN consistent ✓</div>';
    }
  }
  
  function vlanAnimate(){
    var srcId=document.getElementById('vlan-src-port').value;
    var dstId=document.getElementById('vlan-dst-port').value;
    var src=vlanPorts.find(function(p){return p.id===srcId;});
    var dst=vlanPorts.find(function(p){return p.id===dstId;});
    if(!src||!dst){return;}
    if(src.vlan!==dst.vlan){
      vlanLogMsg('❌ VLAN mismatch: '+srcId+' is VLAN '+src.vlan+', '+dstId+' is VLAN '+dst.vlan+' — frame dropped','#f87171');
      vlanShowFrameDetail(src.vlan,false,'VLAN mismatch — frame dropped');
      return;
    }
    var vlan=vlanVlans.find(function(v){return v.id===src.vlan;})||{id:src.vlan,name:'VLAN'+src.vlan,color:'#5b9cf6'};
    vlanLogMsg('→ Frame from '+srcId+' (VLAN '+vlan.id+' '+vlan.name+') to '+dstId,'#4ade80');
    vlanAnimateFrame(src,dst,vlan);
    vlanShowFrameDetail(vlan.id,true,'');
  }
  
  function vlanAnimateFrame(src,dst,vlan){
    if(vlanAnimId) cancelAnimationFrame(vlanAnimId);
    var W=vlanCanvas.width,H=vlanCanvas.height;
    // Positions: SW1 left, SW2 right, trunk in middle
    var sw1x=W*0.25,sw2x=W*0.75,swy=H*0.5,trunkX=W*0.5;
    var srcX=(src.sw===0)?W*0.1:W*0.9,dstX=(dst.sw===0)?W*0.1:W*0.9;
  
    var steps=[
      {t:0,x:srcX,y:swy,tagged:false,label:'Untagged frame'},
      {t:0.3,x:(src.sw===0)?sw1x:sw2x,y:swy,tagged:false,label:'Entering access port'},
      {t:0.45,x:(src.sw===0)?sw1x:sw2x,y:swy,tagged:true,label:'802.1Q tag inserted ← TPID+TCI'},
      {t:0.7,x:(dst.sw===0)?sw1x:sw2x,y:swy,tagged:true,label:'Traversing trunk link'},
      {t:0.85,x:(dst.sw===0)?sw1x:sw2x,y:swy,tagged:false,label:'Tag stripped at egress port'},
      {t:1.0,x:dstX,y:swy,tagged:false,label:'Frame delivered untagged'},
    ];
  
    var startTime=null;var dur=1800;
    function frame(ts){
      if(!startTime) startTime=ts;
      var prog=Math.min((ts-startTime)/dur,1);
      var si=0;
      for(var i=1;i<steps.length;i++){if(steps[i].t<=prog) si=i;}
      var stp0=steps[si],stp1=si<steps.length-1?steps[si+1]:steps[si];
      var lt=(stp1.t>stp0.t)?(prog-stp0.t)/(stp1.t-stp0.t):1;
      lt=Math.max(0,Math.min(1,lt));
      var cx=stp0.x+(stp1.x-stp0.x)*lt,cy=stp0.y+(stp1.y-stp0.y)*lt;
      var tagged=stp0.tagged;
  
      vlanDrawStatic({x:cx,y:cy,tagged:tagged,color:vlan.color,label:stp0.label,vlanId:vlan.id});
      if(prog<1) vlanAnimId=requestAnimationFrame(frame);
      else{ vlanDrawStatic(null);vlanLogMsg('✓ Frame delivered to '+dst.id,'#4ade80');}
    }
    vlanAnimId=requestAnimationFrame(frame);
  }
  
  function vlanDrawStatic(frame){
    if(!vlanCtx) return;
    var W=vlanCanvas.width,H=vlanCanvas.height;
    vlanCtx.clearRect(0,0,W,H);
    var sw1x=W*0.25,sw2x=W*0.75,swy=H*0.5;
  
    // Trunk line
    vlanCtx.strokeStyle='rgba(91,156,246,0.4)';vlanCtx.lineWidth=3;
    vlanCtx.setLineDash([]);
    vlanCtx.beginPath();vlanCtx.moveTo(sw1x,swy);vlanCtx.lineTo(sw2x,swy);vlanCtx.stroke();
    vlanCtx.font='9px IBM Plex Mono,monospace';vlanCtx.fillStyle='rgba(91,156,246,0.6)';vlanCtx.textAlign='center';
    vlanCtx.fillText('802.1Q TRUNK',W/2,swy-10);
  
    // Access ports
    vlanPorts.filter(function(p){return p.type==='access';}).forEach(function(p){
      var swx=p.sw===0?sw1x:sw2x;
      var vlan=vlanVlans.find(function(v){return v.id===p.vlan;})||{id:p.vlan,name:'',color:'#5a6080'};
      vlanCtx.strokeStyle=vlan.color+'88';vlanCtx.lineWidth=2;vlanCtx.setLineDash([4,4]);
      var endX=p.sw===0?W*0.07:W*0.93;
      vlanCtx.beginPath();vlanCtx.moveTo(swx,swy);vlanCtx.lineTo(endX,swy);vlanCtx.stroke();
      vlanCtx.setLineDash([]);
      vlanCtx.fillStyle=vlan.color;vlanCtx.font='9px IBM Plex Mono,monospace';vlanCtx.textAlign=p.sw===0?'right':'left';
      vlanCtx.fillText(p.id+' VLAN'+p.vlan,p.sw===0?endX-4:endX+4,swy-8);
    });
  
    // Draw switches
    [[sw1x,'SW1'],[sw2x,'SW2']].forEach(function(s){
      var sx=s[0],lbl=s[1];
      vlanCtx.fillStyle='#0c0f1a';vlanCtx.strokeStyle='rgba(91,156,246,0.4)';vlanCtx.lineWidth=2;
      vlanCtx.beginPath();vlanCtx.roundRect(sx-30,swy-20,60,40,8);vlanCtx.fill();vlanCtx.stroke();
      vlanCtx.fillStyle='rgba(91,156,246,0.7)';vlanCtx.fillRect(sx-20,swy-10,40,12);
      for(var pi=0;pi<4;pi++){vlanCtx.fillStyle='var(--blue)';vlanCtx.fillRect(sx-18+pi*10,swy-14,6,4);}
      vlanCtx.fillStyle='#e8eaf0';vlanCtx.font='bold 10px IBM Plex Mono,monospace';vlanCtx.textAlign='center';vlanCtx.textBaseline='middle';
      vlanCtx.fillText(lbl,sx,swy+14);
    });
  
    // Animated frame
    if(frame){
      var fw=frame.tagged?90:60,fh=22,fx=frame.x-fw/2,fy=frame.y-fh/2-35;
      vlanCtx.fillStyle=frame.color+'33';vlanCtx.strokeStyle=frame.color;vlanCtx.lineWidth=2;
      vlanCtx.beginPath();vlanCtx.roundRect(fx,fy,fw,fh,5);vlanCtx.fill();vlanCtx.stroke();
      if(frame.tagged){
        vlanCtx.fillStyle=frame.color+'66';vlanCtx.fillRect(fx+4,fy+2,22,fh-4);
        vlanCtx.font='bold 7px IBM Plex Mono,monospace';vlanCtx.fillStyle='#fff';vlanCtx.textAlign='center';vlanCtx.textBaseline='middle';
        vlanCtx.fillText('0x8100',fx+15,fy+fh/2-5);vlanCtx.fillText('VID:'+frame.vlanId,fx+15,fy+fh/2+5);
      }
      vlanCtx.fillStyle=frame.color;vlanCtx.font='bold 9px IBM Plex Mono,monospace';vlanCtx.textAlign='center';vlanCtx.textBaseline='middle';
      vlanCtx.fillText(frame.tagged?'Tagged':'Payload',frame.tagged?fx+fw-25:frame.x,fy+fh/2);
      // Arrow + label
      vlanCtx.beginPath();vlanCtx.arc(frame.x,frame.y,5,0,Math.PI*2);vlanCtx.fillStyle=frame.color;vlanCtx.fill();
      vlanCtx.fillStyle='rgba(232,234,240,0.85)';vlanCtx.font='10px IBM Plex Mono,monospace';vlanCtx.textAlign='center';
      vlanCtx.fillText(frame.label,frame.x,frame.y+22);
    }
  }
  
  function vlanShowFrameDetail(vlanId,tagged,note){
    var el=document.getElementById('vlan-frame-detail'); if(!el) return;
    if(!tagged){el.innerHTML='<span style="color:var(--red)">'+note+'</span>';return;}
    var vlan=vlanVlans.find(function(v){return v.id===vlanId;})||{id:vlanId,name:'VLAN'+vlanId,color:'#5b9cf6'};
    el.innerHTML='<div style="background:var(--bg3);border-radius:8px;padding:10px 12px">'
      +'<div style="color:var(--blue);font-weight:700;margin-bottom:8px">802.1Q Tag (4 bytes added to Ethernet frame)</div>'
      +'<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:4px;text-align:center;margin-bottom:10px">'
      +'<div style="background:rgba(91,156,246,0.15);border-radius:4px;padding:5px 3px"><div style="font-size:9px;color:var(--muted)">TPID</div><div style="color:var(--blue);font-weight:700;font-size:11px">0x8100</div><div style="font-size:8px;color:var(--muted)">2 bytes</div></div>'
      +'<div style="background:rgba(74,222,128,0.1);border-radius:4px;padding:5px 3px"><div style="font-size:9px;color:var(--muted)">PCP</div><div style="color:var(--green);font-weight:700;font-size:11px">000</div><div style="font-size:8px;color:var(--muted)">3 bits</div></div>'
      +'<div style="background:rgba(251,191,36,0.1);border-radius:4px;padding:5px 3px"><div style="font-size:9px;color:var(--muted)">DEI</div><div style="color:var(--amber);font-weight:700;font-size:11px">0</div><div style="font-size:8px;color:var(--muted)">1 bit</div></div>'
      +'<div style="background:rgba(56,217,192,0.1);border-radius:4px;padding:5px 3px"><div style="font-size:9px;color:var(--muted)">VID</div><div style="color:var(--cyan);font-weight:700;font-size:11px">'+vlanId+'</div><div style="font-size:8px;color:var(--muted)">12 bits</div></div>'
      +'</div>'
      +'<div style="font-size:10px;color:var(--muted2)">TPID=0x8100 identifies 802.1Q | PCP=CoS priority | DEI=drop eligible | VID=VLAN ID ('+vlan.name+')</div>'
      +'</div>';
  }
  
  function vlanLogMsg(msg,color){
    var el=document.getElementById('vlan-log'); if(!el) return;
    var row=document.createElement('div');
    row.style.cssText='color:'+(color||'var(--muted2)')+';padding:1px 0';
    row.textContent=msg;el.appendChild(row);el.scrollTop=el.scrollHeight;
  }
  
  /* ═══════════════════════════════════════════════════════════
     TCP STATE MACHINE ANIMATOR
  ═══════════════════════════════════════════════════════════ */
  var tcpCanvas=null,tcpCtx=null,tcpPackets=[],tcpState={client:'CLOSED',server:'LISTEN'};
  var tcpClientSeq=1000,tcpServerSeq=5000,tcpPayload=100,tcpPhaseIdx=0,tcpAnimId=null;
  var TCP_STATES_ORDER=['CLOSED','LISTEN','SYN_SENT','SYN_RECEIVED','ESTABLISHED','FIN_WAIT_1','FIN_WAIT_2','TIME_WAIT','CLOSE_WAIT','LAST_ACK'];
  
  function tcpAnimInit(){
    tcpCanvas=document.getElementById('tcp-canvas');
    if(!tcpCanvas) return;
    tcpCanvas.width=tcpCanvas.offsetWidth||480;
    tcpCtx=tcpCanvas.getContext('2d');
    tcpReset();
  }
  
  function tcpReset(){
    if(tcpAnimId) cancelAnimationFrame(tcpAnimId);
    var isnC=document.getElementById('tcp-client-isn'),isnS=document.getElementById('tcp-server-isn'),pl=document.getElementById('tcp-payload');
    tcpClientSeq=isnC?parseInt(isnC.value)||1000:1000;
    tcpServerSeq=isnS?parseInt(isnS.value)||5000:5000;
    tcpPayload=pl?parseInt(pl.value)||100:100;
    tcpPackets=[];tcpPhaseIdx=0;
    tcpState={client:'CLOSED',server:'LISTEN'};
    tcpUpdateStateBadges();tcpRenderStateList();tcpDrawAll();
    document.getElementById('tcp-pkt-detail').innerHTML='Click any packet arrow to inspect its headers.';
  }
  
  function tcpStart(){
    tcpReset();
    setTimeout(function(){tcpAddPacket('C→S','SYN','SYN',tcpClientSeq,0,0,'Client sends SYN. ISN='+tcpClientSeq+'. State: CLOSED → SYN_SENT',function(){
      tcpState.client='SYN_SENT';tcpUpdateStateBadges();
      setTimeout(function(){tcpAddPacket('S→C','SYN-ACK','SYN,ACK',tcpServerSeq,tcpClientSeq+1,0,'Server replies SYN-ACK. ISN='+tcpServerSeq+', ACK='+( tcpClientSeq+1)+'. State: LISTEN → SYN_RECEIVED',function(){
        tcpState.server='SYN_RECEIVED';tcpUpdateStateBadges();
        setTimeout(function(){tcpAddPacket('C→S','ACK','ACK',tcpClientSeq+1,tcpServerSeq+1,0,'Client ACKs SYN-ACK. Handshake complete. State: → ESTABLISHED',function(){
          tcpState.client='ESTABLISHED';tcpState.server='ESTABLISHED';tcpUpdateStateBadges();tcpRenderStateList();
        });},400);
      });},450);
    });},200);
  }
  
  function tcpTrigger(type){
    if(tcpState.client!=='ESTABLISHED'&&type!=='rst'){tcpLogPkt('<span style="color:var(--amber)">Establish connection first</span>');return;}
    if(type==='data'){
      tcpAddPacket('C→S','DATA','PSH,ACK',tcpClientSeq+1,tcpServerSeq+1,tcpPayload,'Client sends '+tcpPayload+' bytes of data',function(){
        tcpClientSeq+=tcpPayload;
        setTimeout(function(){tcpAddPacket('S→C','ACK','ACK',tcpServerSeq+1,tcpClientSeq+1,0,'Server acknowledges '+tcpPayload+' bytes (ACK='+( tcpClientSeq+1)+')',null);},300);
      });
    } else if(type==='fin'){
      tcpAddPacket('C→S','FIN','FIN,ACK',tcpClientSeq+1,tcpServerSeq+1,0,'Client initiates graceful close. State: ESTABLISHED → FIN_WAIT_1',function(){
        tcpState.client='FIN_WAIT_1';tcpUpdateStateBadges();
        setTimeout(function(){tcpAddPacket('S→C','ACK','ACK',tcpServerSeq+1,tcpClientSeq+2,0,'Server ACKs FIN. State: → CLOSE_WAIT',function(){
          tcpState.server='CLOSE_WAIT';tcpState.client='FIN_WAIT_2';tcpUpdateStateBadges();
          setTimeout(function(){tcpAddPacket('S→C','FIN','FIN,ACK',tcpServerSeq+1,tcpClientSeq+2,0,'Server sends FIN. State: → LAST_ACK',function(){
            tcpState.server='LAST_ACK';tcpUpdateStateBadges();
            setTimeout(function(){tcpAddPacket('C→S','ACK','ACK',tcpClientSeq+2,tcpServerSeq+2,0,'Client ACKs. State: TIME_WAIT → CLOSED (after 2MSL)',function(){
              tcpState.client='TIME_WAIT';tcpState.server='CLOSED';tcpUpdateStateBadges();
            });},300);
          });},350);
        });},300);
      });
    } else if(type==='rst'){
      tcpAddPacket('C→S','RST','RST',tcpClientSeq+1,0,0,'Connection RESET — abrupt close, no graceful teardown',function(){
        tcpState.client='CLOSED';tcpState.server='CLOSED';tcpUpdateStateBadges();
      });
    } else if(type==='loss'){
      var lostPkt={dir:'C→S',flags:'PSH,ACK',label:'LOST',seq:tcpClientSeq+1,ack:tcpServerSeq+1,len:tcpPayload,lost:true,desc:'Packet lost in transit — retransmit timer fires'};
      tcpPackets.push(lostPkt);tcpDrawAll();
      setTimeout(function(){
        tcpAddPacket('C→S','RETX','PSH,ACK',tcpClientSeq+1,tcpServerSeq+1,tcpPayload,'Retransmitting after timeout (RTO). Seq='+( tcpClientSeq+1),null);
      },600);
    }
  }
  
  function tcpAddPacket(dir,label,flags,seq,ack,len,desc,cb){
    var pkt={dir:dir,label:label,flags:flags,seq:seq,ack:ack,len:len,desc:desc,lost:false,t:0};
    tcpPackets.push(pkt);
    var startTime=null,dur=700;
    function anim(ts){
      if(!startTime) startTime=ts;
      pkt.t=Math.min((ts-startTime)/dur,1);
      tcpDrawAll();
      if(pkt.t<1) tcpAnimId=requestAnimationFrame(anim);
      else{pkt.t=1;tcpDrawAll();if(cb) cb();}
    }
    requestAnimationFrame(anim);
  }
  
  function tcpDrawAll(){
    if(!tcpCtx) return;
    var W=tcpCanvas.width,H=tcpCanvas.height;
    tcpCtx.clearRect(0,0,W,H);
    var cx=W*0.15,sx=W*0.85,topY=50,rowH=42;
    // Column headers
    tcpCtx.font='bold 11px IBM Plex Mono,monospace';tcpCtx.textAlign='center';tcpCtx.textBaseline='middle';
    tcpCtx.fillStyle='#5b9cf6';tcpCtx.fillText('CLIENT',cx,20);
    tcpCtx.fillStyle='#38d9c0';tcpCtx.fillText('SERVER',sx,20);
    // Timeline lines
    tcpCtx.strokeStyle='rgba(91,156,246,0.25)';tcpCtx.lineWidth=1.5;tcpCtx.setLineDash([4,4]);
    tcpCtx.beginPath();tcpCtx.moveTo(cx,35);tcpCtx.lineTo(cx,topY+tcpPackets.length*rowH+30);tcpCtx.stroke();
    tcpCtx.strokeStyle='rgba(56,217,192,0.25)';
    tcpCtx.beginPath();tcpCtx.moveTo(sx,35);tcpCtx.lineTo(sx,topY+tcpPackets.length*rowH+30);tcpCtx.stroke();
    tcpCtx.setLineDash([]);
  
    tcpPackets.forEach(function(pkt,i){
      var y=topY+i*rowH;
      var fromX=pkt.dir==='C→S'?cx:sx,toX=pkt.dir==='C→S'?sx:cx;
      var curX=fromX+(toX-fromX)*pkt.t;
      var arrowColor=pkt.lost?'#5a6080':(pkt.label==='RST'?'#f87171':(pkt.label==='FIN'?'#fbbf24':(pkt.label==='RETX'?'#f472b6':'#5b9cf6')));
      // Arrow line
      if(pkt.t>=1||pkt.lost){
        tcpCtx.strokeStyle=arrowColor+(pkt.lost?'55':'aa');tcpCtx.lineWidth=pkt.lost?1:2;
        tcpCtx.setLineDash(pkt.lost?[5,4]:[]);
        tcpCtx.beginPath();tcpCtx.moveTo(fromX,y);tcpCtx.lineTo(toX,y);tcpCtx.stroke();tcpCtx.setLineDash([]);
        // Arrowhead
        if(!pkt.lost){
          var dir=pkt.dir==='C→S'?1:-1;
          tcpCtx.fillStyle=arrowColor;
          tcpCtx.beginPath();tcpCtx.moveTo(toX,y);tcpCtx.lineTo(toX-dir*10,y-5);tcpCtx.lineTo(toX-dir*10,y+5);tcpCtx.fill();
        }
      } else {
        tcpCtx.strokeStyle=arrowColor+'cc';tcpCtx.lineWidth=2;
        tcpCtx.beginPath();tcpCtx.moveTo(fromX,y);tcpCtx.lineTo(curX,y);tcpCtx.stroke();
        tcpCtx.beginPath();tcpCtx.arc(curX,y,4,0,Math.PI*2);tcpCtx.fillStyle=arrowColor;tcpCtx.fill();
      }
      // Label
      var midX=(fromX+toX)/2;
      tcpCtx.font='bold 10px IBM Plex Mono,monospace';tcpCtx.textAlign='center';tcpCtx.fillStyle=arrowColor;
      tcpCtx.fillText((pkt.lost?'[LOST] ':'')+pkt.label+(pkt.len?' ('+pkt.len+'B)':''),midX,y-9);
      tcpCtx.font='9px IBM Plex Mono,monospace';tcpCtx.fillStyle='rgba(90,96,128,0.8)';
      tcpCtx.fillText('Seq='+pkt.seq+(pkt.ack?'  ACK='+pkt.ack:''),midX,y+13);
    });
  
    // Clickable: set pkt detail on click
    tcpCanvas.onclick=function(e){
      var rect=tcpCanvas.getBoundingClientRect(),scaleX=tcpCanvas.width/rect.width;
      var my=(e.clientY-rect.top)*scaleX;
      var idx=Math.floor((my-40)/42);
      if(idx>=0&&idx<tcpPackets.length) tcpShowPktDetail(tcpPackets[idx]);
    };
  }
  
  function tcpShowPktDetail(pkt){
    var el=document.getElementById('tcp-pkt-detail'); if(!el) return;
    el.innerHTML='<div style="background:var(--bg3);border-radius:8px;padding:10px 12px">'
      +'<div style="color:var(--blue);font-weight:700;margin-bottom:6px">TCP Segment: '+pkt.label+'</div>'
      +'<div><span style="color:var(--muted2)">Flags: </span><span style="color:var(--cyan)">'+pkt.flags+'</span></div>'
      +'<div><span style="color:var(--muted2)">Seq: </span><span style="color:var(--green)">'+pkt.seq+'</span></div>'
      +(pkt.ack?'<div><span style="color:var(--muted2)">ACK: </span><span style="color:var(--amber)">'+pkt.ack+'</span></div>':'')
      +(pkt.len?'<div><span style="color:var(--muted2)">Data: </span><span style="color:var(--pink)">'+pkt.len+' bytes</span></div>':'')
      +'<div style="margin-top:6px;font-size:10px;color:var(--muted2)">'+pkt.desc+'</div>'
      +'</div>';
  }
  
  function tcpLogPkt(msg){
    var el=document.getElementById('tcp-pkt-detail');if(el) el.innerHTML=msg;
  }
  
  function tcpUpdateStateBadges(){
    var c=document.getElementById('tcp-client-state'),s=document.getElementById('tcp-server-state');
    if(c) c.textContent='CLIENT: '+tcpState.client;
    if(s) s.textContent='SERVER: '+tcpState.server;
  }
  
  function tcpRenderStateList(){
    var el=document.getElementById('tcp-states'); if(!el) return;
    var states=[
      {s:'CLOSED',desc:'No connection'},
      {s:'LISTEN',desc:'Waiting for SYN (server)'},
      {s:'SYN_SENT',desc:'SYN sent, waiting SYN-ACK'},
      {s:'SYN_RECEIVED',desc:'SYN received, SYN-ACK sent'},
      {s:'ESTABLISHED',desc:'Data transfer active'},
      {s:'FIN_WAIT_1',desc:'FIN sent, waiting ACK'},
      {s:'FIN_WAIT_2',desc:'FIN ACKd, waiting server FIN'},
      {s:'TIME_WAIT',desc:'Waiting 2×MSL (60-120s)'},
      {s:'CLOSE_WAIT',desc:'Remote FIN received'},
      {s:'LAST_ACK',desc:'Server FIN sent, waiting ACK'},
    ];
    el.innerHTML=states.map(function(st){
      var active=st.s===tcpState.client||st.s===tcpState.server;
      var who='';
      if(st.s===tcpState.client&&st.s===tcpState.server) who=' (both)';
      else if(st.s===tcpState.client) who=' (client)';
      else if(st.s===tcpState.server) who=' (server)';
      return '<div style="display:flex;align-items:center;gap:8px;padding:5px 8px;border-radius:6px;background:'+(active?'rgba(91,156,246,0.1)':'transparent')+';border:1px solid '+(active?'rgba(91,156,246,0.3)':'transparent')+';">'
        +'<div style="width:8px;height:8px;border-radius:50%;background:'+(active?'var(--blue)':'var(--muted)')+';flex-shrink:0"></div>'
        +'<div><div style="font-family:var(--mono);font-size:10px;font-weight:700;color:'+(active?'var(--blue)':'var(--muted2)')+'">'+st.s+who+'</div>'
        +'<div style="font-family:var(--mono);font-size:9px;color:var(--muted)">'+st.desc+'</div></div></div>';
    }).join('');
  }
  
  /* ═══════════════════════════════════════════════════════════
     PREFIX-LIST & ROUTE-MAP BUILDER
  ═══════════════════════════════════════════════════════════ */
  var pfxEntries=[], pfxClauses=[], pfxVendor='ios';
  
  function pfxBuilderInit(){
    if(!pfxEntries.length){
      pfxEntries=[
        {seq:10,action:'permit',prefix:'10.0.0.0/8',ge:null,le:24},
        {seq:20,action:'deny',prefix:'192.168.0.0/16',ge:null,le:null},
        {seq:30,action:'permit',prefix:'0.0.0.0/0',ge:null,le:32},
      ];
      pfxClauses=[
        {seq:10,action:'permit',matchList:'MY-PREFIXES',setLocalPref:'200',setMED:'',setCommunity:'',setNextHop:'',setPrepend:''},
      ];
    }
    pfxRenderEntries();pfxRenderClauses();pfxGenConfig();pfxValidate();
  }
  
  function pfxAddEntry(){
    var maxSeq=pfxEntries.length?Math.max.apply(null,pfxEntries.map(function(e){return e.seq;})):0;
    pfxEntries.push({seq:maxSeq+10,action:'permit',prefix:'0.0.0.0/0',ge:null,le:null});
    pfxRenderEntries();pfxGenConfig();pfxValidate();
  }
  
  function pfxRenderEntries(){
    var el=document.getElementById('pfx-entries'); if(!el) return;
    el.innerHTML='';
    pfxEntries.forEach(function(e,i){
      var d=document.createElement('div');
      d.style.cssText='background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:10px 12px';
      d.innerHTML='<div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">'
        +'<span style="font-family:var(--mono);font-size:9px;color:var(--muted)">SEQ</span>'
        +'<input type="number" value="'+e.seq+'" min="1" onchange="pfxSetSeq('+i+',this.value)" style="width:52px;background:var(--bg1);border:1px solid var(--border);border-radius:5px;padding:3px 6px;font-family:var(--mono);font-size:11px;color:var(--text);outline:none">'
        +'<select onchange="pfxSetAction('+i+',this.value)" style="background:var(--bg1);border:1px solid var(--border);border-radius:5px;padding:3px 6px;font-family:var(--mono);font-size:11px;color:var(--text);outline:none">'
        +'<option value="permit"'+(e.action==='permit'?' selected':'')+' style="color:#4ade80">permit</option>'
        +'<option value="deny"'+(e.action==='deny'?' selected':'')+' style="color:#f87171">deny</option>'
        +'</select>'
        +'<button onclick="pfxDelEntry('+i+')" style="margin-left:auto;padding:3px 7px;border-radius:5px;border:1px solid rgba(248,113,113,0.3);background:rgba(248,113,113,0.08);color:var(--red);font-family:var(--mono);font-size:10px;cursor:pointer">✕</button>'
        +'</div>'
        +'<div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">'
        +'<span style="font-family:var(--mono);font-size:9px;color:var(--muted)">PREFIX</span>'
        +'<input type="text" value="'+e.prefix+'" onchange="pfxSetPrefix('+i+',this.value)" style="flex:1;min-width:120px;background:var(--bg1);border:1px solid var(--border);border-radius:5px;padding:3px 6px;font-family:var(--mono);font-size:11px;color:var(--cyan);outline:none">'
        +'<span style="font-family:var(--mono);font-size:9px;color:var(--muted)">ge</span>'
        +'<input type="number" value="'+(e.ge||'')+'" placeholder="—" min="0" max="32" onchange="pfxSetGe('+i+',this.value)" style="width:40px;background:var(--bg1);border:1px solid var(--border);border-radius:5px;padding:3px 5px;font-family:var(--mono);font-size:11px;color:var(--amber);outline:none;text-align:center">'
        +'<span style="font-family:var(--mono);font-size:9px;color:var(--muted)">le</span>'
        +'<input type="number" value="'+(e.le||'')+'" placeholder="—" min="0" max="32" onchange="pfxSetLe('+i+',this.value)" style="width:40px;background:var(--bg1);border:1px solid var(--border);border-radius:5px;padding:3px 5px;font-family:var(--mono);font-size:11px;color:var(--green);outline:none;text-align:center">'
        +'</div>';
      el.appendChild(d);
    });
  }
  
  function pfxSetSeq(i,v){pfxEntries[i].seq=parseInt(v);pfxGenConfig();pfxValidate();}
  function pfxSetAction(i,v){pfxEntries[i].action=v;pfxGenConfig();pfxValidate();}
  function pfxSetPrefix(i,v){pfxEntries[i].prefix=v.trim();pfxGenConfig();pfxValidate();}
  function pfxSetGe(i,v){pfxEntries[i].ge=v?parseInt(v):null;pfxGenConfig();pfxValidate();}
  function pfxSetLe(i,v){pfxEntries[i].le=v?parseInt(v):null;pfxGenConfig();pfxValidate();}
  function pfxDelEntry(i){pfxEntries.splice(i,1);pfxRenderEntries();pfxGenConfig();pfxValidate();}
  
  function pfxAddClause(){
    var maxSeq=pfxClauses.length?Math.max.apply(null,pfxClauses.map(function(c){return c.seq;})):0;
    pfxClauses.push({seq:maxSeq+10,action:'permit',matchList:'MY-PREFIXES',setLocalPref:'',setMED:'',setCommunity:'',setNextHop:'',setPrepend:''});
    pfxRenderClauses();pfxGenConfig();
  }
  
  function pfxRenderClauses(){
    var el=document.getElementById('rm-clauses'); if(!el) return;
    el.innerHTML='';
    pfxClauses.forEach(function(c,i){
      var d=document.createElement('div');
      d.style.cssText='background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:10px 12px';
      d.innerHTML='<div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">'
        +'<span style="font-family:var(--mono);font-size:9px;color:var(--muted)">SEQ</span>'
        +'<input type="number" value="'+c.seq+'" min="1" onchange="pfxRMSetSeq('+i+',this.value)" style="width:52px;background:var(--bg1);border:1px solid var(--border);border-radius:5px;padding:3px 6px;font-family:var(--mono);font-size:11px;color:var(--text);outline:none">'
        +'<select onchange="pfxRMSetAction('+i+',this.value)" style="background:var(--bg1);border:1px solid var(--border);border-radius:5px;padding:3px 6px;font-family:var(--mono);font-size:11px;color:var(--text);outline:none">'
        +'<option value="permit"'+(c.action==='permit'?' selected':'')+'>permit</option>'
        +'<option value="deny"'+(c.action==='deny'?' selected':'')+'>deny</option>'
        +'</select>'
        +'<button onclick="pfxDelClause('+i+')" style="margin-left:auto;padding:3px 7px;border-radius:5px;border:1px solid rgba(248,113,113,0.3);background:rgba(248,113,113,0.08);color:var(--red);font-family:var(--mono);font-size:10px;cursor:pointer">✕</button>'
        +'</div>'
        +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">'
        +'<div><span style="font-family:var(--mono);font-size:9px;color:var(--muted);display:block;margin-bottom:2px">MATCH PREFIX-LIST</span><input type="text" value="'+c.matchList+'" onchange="pfxRMSetMatch('+i+',this.value)" style="width:100%;background:var(--bg1);border:1px solid var(--border);border-radius:5px;padding:3px 6px;font-family:var(--mono);font-size:11px;color:var(--cyan);outline:none"></div>'
        +'<div><span style="font-family:var(--mono);font-size:9px;color:var(--muted);display:block;margin-bottom:2px">SET LOCAL-PREF</span><input type="text" value="'+c.setLocalPref+'" onchange="pfxRMSetLP('+i+',this.value)" placeholder="e.g. 200" style="width:100%;background:var(--bg1);border:1px solid var(--border);border-radius:5px;padding:3px 6px;font-family:var(--mono);font-size:11px;color:var(--blue);outline:none"></div>'
        +'<div><span style="font-family:var(--mono);font-size:9px;color:var(--muted);display:block;margin-bottom:2px">SET MED</span><input type="text" value="'+c.setMED+'" onchange="pfxRMSetMED('+i+',this.value)" placeholder="e.g. 100" style="width:100%;background:var(--bg1);border:1px solid var(--border);border-radius:5px;padding:3px 6px;font-family:var(--mono);font-size:11px;color:var(--amber);outline:none"></div>'
        +'<div><span style="font-family:var(--mono);font-size:9px;color:var(--muted);display:block;margin-bottom:2px">SET COMMUNITY</span><input type="text" value="'+c.setCommunity+'" onchange="pfxRMSetComm('+i+',this.value)" placeholder="e.g. 65001:100" style="width:100%;background:var(--bg1);border:1px solid var(--border);border-radius:5px;padding:3px 6px;font-family:var(--mono);font-size:11px;color:var(--green);outline:none"></div>'
        +'<div><span style="font-family:var(--mono);font-size:9px;color:var(--muted);display:block;margin-bottom:2px">SET NEXT-HOP</span><input type="text" value="'+c.setNextHop+'" onchange="pfxRMSetNH('+i+',this.value)" placeholder="e.g. 10.0.0.1" style="width:100%;background:var(--bg1);border:1px solid var(--border);border-radius:5px;padding:3px 6px;font-family:var(--mono);font-size:11px;color:var(--pink);outline:none"></div>'
        +'<div><span style="font-family:var(--mono);font-size:9px;color:var(--muted);display:block;margin-bottom:2px">SET AS-PATH PREPEND</span><input type="text" value="'+c.setPrepend+'" onchange="pfxRMSetPrepend('+i+',this.value)" placeholder="e.g. 65001 65001" style="width:100%;background:var(--bg1);border:1px solid var(--border);border-radius:5px;padding:3px 6px;font-family:var(--mono);font-size:11px;color:var(--muted2);outline:none"></div>'
        +'</div>';
      el.appendChild(d);
    });
  }
  
  function pfxRMSetSeq(i,v){pfxClauses[i].seq=parseInt(v);pfxGenConfig();}
  function pfxRMSetAction(i,v){pfxClauses[i].action=v;pfxGenConfig();}
  function pfxRMSetMatch(i,v){pfxClauses[i].matchList=v;pfxGenConfig();}
  function pfxRMSetLP(i,v){pfxClauses[i].setLocalPref=v;pfxGenConfig();}
  function pfxRMSetMED(i,v){pfxClauses[i].setMED=v;pfxGenConfig();}
  function pfxRMSetComm(i,v){pfxClauses[i].setCommunity=v;pfxGenConfig();}
  function pfxRMSetNH(i,v){pfxClauses[i].setNextHop=v;pfxGenConfig();}
  function pfxRMSetPrepend(i,v){pfxClauses[i].setPrepend=v;pfxGenConfig();}
  function pfxDelClause(i){pfxClauses.splice(i,1);pfxRenderClauses();pfxGenConfig();}

  function pfxUpdatePolicyRef(){
    var el=document.getElementById('pfx-policy-ref-entries'); if(!el) return;
    var sorted=pfxEntries.slice().sort(function(a,b){return a.seq-b.seq;});
    if(!sorted.length){
      el.innerHTML='<div style="font-family:var(--mono);font-size:11px;color:var(--muted)">Add entries to see analysis.</div>';
      return;
    }
    var html='';
    sorted.forEach(function(e){
      var parts=e.prefix.split('/'); if(parts.length!==2) return;
      var baseIP=parts[0], basePfxLen=parseInt(parts[1]);
      var ge=e.ge?parseInt(e.ge):null, le=e.le?parseInt(e.le):null, action=e.action;
      
      var isInvalid = (ge && ge <= basePfxLen) || (le && le < basePfxLen) || (ge && le && ge > le);
      var minLen = ge || basePfxLen;
      var maxLen = le || (ge ? 32 : basePfxLen);

      html+='<div style="margin-bottom:15px;border:1px solid '+(isInvalid?'var(--red)':'var(--border2)')+';border-radius:10px;overflow:hidden;background:var(--bg3)">';
      html+='<div style="background:rgba(0,0,0,0.2);padding:8px 12px;border-bottom:1px solid var(--border);font-family:var(--mono);font-size:10px;color:'+(isInvalid?'var(--red)':'var(--cyan)')+'">ip prefix-list TEST seq '+e.seq+' '+action+' '+e.prefix + (ge?' ge '+ge:'') + (le?' le '+le:'')+'</div>';
      html+='<div style="padding:12px;display:flex;flex-direction:column;gap:8px">';

      if(isInvalid){
          html+='<div style="font-family:var(--mono);font-size:11px;color:#fff;background:var(--red);padding:6px 10px;border-radius:6px;font-weight:700">❌ INVALID COMMAND</div>';
      } else {
          // 1. ge explanation
          if(ge) html+='<div style="font-family:var(--mono);font-size:11px;color:var(--text)"><span style="color:var(--amber);font-weight:700">ge '+ge+'</span> → length must be at least /'+ge+' (MINIMUM)</div>';
          
          // 2. Simple Trick
          var rangeText = (ge && le) ? 'between /' + ge + ' and /' + le : (ge ? 'at least /' + ge : (le ? 'up to /' + le : 'exactly /' + basePfxLen));
          html += '<div style="font-family:var(--mono);font-size:11px;color:var(--blue);padding:4px 0">'
               + '💡 <strong>Simple Trick:</strong> Matches any prefix inside <span style="color:var(--cyan)">' + e.prefix + '</span> where the length is ' + rangeText + '.'
               + '</div>';

          // 3. Matching Lengths
          var ls=[]; for(var j=minLen;j<=maxLen;j++) ls.push('/'+j);
          html+='<div style="font-family:var(--mono);font-size:11px;color:var(--muted)">Matching lengths: <span style="color:var(--blue)">'+ls.join(', ')+'</span></div>';

          // 4. Trap Detector
          var baseMatches = (basePfxLen >= minLen && basePfxLen <= maxLen);
          if(!baseMatches){
              html+='<div style="font-family:var(--mono);font-size:11px;color:var(--amber)">⚠️ Trap: '+e.prefix+' itself does NOT match (violates '+(basePfxLen<ge?'ge '+ge:'le '+le)+').</div>';
          }

          // 5. Valid Matches Breakdown
          html += '<div style="font-family:var(--mono);font-size:11px;margin-top:8px;border-top:1px solid var(--border);padding-top:10px">';
          html += '<div style="font-weight:700;color:var(--green);margin-bottom:4px">Examples of Valid Matches:</div>';
          html += '<div style="color:var(--muted);margin-bottom:8px">If you were looking at a routing table, these specific routes would be Permitted:</div>';
          
          try {
              var baseNum = pfxIP2n(baseIP);
              var getList = (len, count) => {
                  if(len < minLen || len > maxLen) return null;
                  var step = Math.pow(2, 32 - len);
                  var res = [];
                  for(var i=0; i<count; i++) {
                      var n = (baseNum + (i * step)) >>> 0;
                      var mask = basePfxLen === 0 ? 0 : ((0xffffffff << (32 - basePfxLen)) >>> 0);
                      if ((n & mask) >>> 0 === (baseNum & mask) >>> 0) res.push(pfxN2ip(n) + '/' + len);
                  }
                  return res;
              };

              var halves = getList(basePfxLen + 1, 2);
              if(halves) html += `<div style="margin-bottom:8px"><span style="color:var(--cyan)">The /${basePfxLen+1}s (The halves):</span><br><span style="color:var(--text)">${halves.join('<br>')}</span></div>`;

              var quarters = getList(basePfxLen + 2, 4);
              if(quarters) html += `<div style="margin-bottom:8px"><span style="color:var(--cyan)">The /${basePfxLen+2}s (The quarters):</span><br><span style="color:var(--text)">${quarters.join('<br>')}</span></div>`;

              if(maxLen >= 27) {
                  html += `<div style="margin-bottom:8px"><span style="color:var(--cyan)">Any smaller subnets:</span><br><span style="color:var(--text)">${pfxN2ip(baseNum + Math.pow(2, 32-27)*2)}/27, ${pfxN2ip(baseNum + Math.pow(2, 32-28)*3)}/28, etc.</span></div>`;
                  html += `<div style="margin-bottom:8px"><span style="color:var(--cyan)">Individual Hosts:</span><br><span style="color:var(--text)">${pfxN2ip(baseNum + 1)}/32, ${pfxN2ip(baseNum + 55)}/32, etc.</span></div>`;
              }
          } catch(err) {}
          html += '</div>';

          // 6. Visual Subnet Tree Link
          html += '<div style="margin-top:10px; padding-top:10px; border-top:1px solid var(--border);">';
          html += `<a href="javascript:void(0)" onclick="pfxGoToTree('${e.prefix}')" style="display:block; text-align:center; text-decoration:none; font-family:var(--mono); font-size:11px; color:var(--blue); background:rgba(91,156,246,0.1); padding:8px; border-radius:6px; border:1px solid rgba(91,156,246,0.2);">`;
          html += `🌳 For more divide, go to Visual Subnet Tree for ${e.prefix} →`;
          html += `</a></div>`;
      }

      html+='<div style="margin-top:5px;display:inline-block;padding:3px 10px;border-radius:5px;background:'+(action==='permit'?'rgba(74,222,128,0.1)':'rgba(248,113,113,0.1)')+';font-family:var(--mono);font-size:10px;font-weight:700;color:'+(action==='permit'?'var(--green)':'var(--red)')+'">'+action.toUpperCase()+'</div>';
      html+='</div></div>';
    });
    el.innerHTML=html;
}

// NAVIGATION HELPER FUNCTION
function pfxGoToTree(prefix) {
    // 1. Set the input in the Visual Subnet Tree tool
    const treeInput = document.getElementById('vst-input');
    if (treeInput) {
        treeInput.value = prefix;
    }

    // 2. Navigate to the Subnet Tree page
    // Using the existing gotoPage function found in your app.js
    const treeNavBtn = document.querySelector('.nav-btn[onclick*="subnet-tree"]');
    gotoPage('subnet-tree', treeNavBtn);

    // 3. Trigger the tree generation automatically
    if (typeof vstInit === 'function') {
        vstInit();
    }
}

  function pfxIP2n(ip){
    var p=ip.split('.').map(Number);
    return ((p[0]<<24)|(p[1]<<16)|(p[2]<<8)|p[3])>>>0;
  }
  function pfxN2ip(n){
    return [(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255].join('.');
  }
  
  function pfxShowVendor(v){
    pfxVendor=v;
    var bi=document.getElementById('pfx-btn-ios'),bj=document.getElementById('pfx-btn-junos');
    if(bi){bi.style.background=v==='ios'?'var(--blue)':'transparent';bi.style.color=v==='ios'?'#07090f':'var(--muted2)';bi.style.border=v==='ios'?'1.5px solid var(--blue)':'1.5px solid var(--border2)';}
    if(bj){bj.style.background=v==='junos'?'var(--blue)':'transparent';bj.style.color=v==='junos'?'#07090f':'var(--muted2)';bj.style.border=v==='junos'?'1.5px solid var(--blue)':'1.5px solid var(--border2)';}
    pfxGenConfig();
    pfxUpdatePolicyRef();

  }
  
  function pfxMatchesEntry(entry,testIP,testPfxLen){
    // Parse entry prefix
    var parts=entry.prefix.split('/'); if(parts.length!==2) return false;
    var entryIP=parts[0],entryPfxLen=parseInt(parts[1]);
    // Check if testIP is within entry prefix
    
    var mask=entryPfxLen===0?0:(0xffffffff<<(32-entryPfxLen))>>>0;
    if((ip2n(testIP)&mask)!==(ip2n(entryIP)&mask)) return false;
    // Check ge/le
    if(entry.ge!==null&&entry.ge!==undefined&&testPfxLen<entry.ge) return false;
    if(entry.le!==null&&entry.le!==undefined&&testPfxLen>entry.le) return false;
    if(entry.ge===null&&entry.le===null&&testPfxLen!==entryPfxLen) return false;
    return true;
  }
  
  function pfxValidate(){
    var el=document.getElementById('pfx-test-result'),wz=document.getElementById('pfx-walk-viz');
    var input=document.getElementById('pfx-test-input'); if(!input||!el) return;
    var val=input.value.trim(); if(!val){el.innerHTML='';return;}
    var parts=val.split('/'); if(parts.length!==2){el.innerHTML='<span style="color:var(--red);font-family:var(--mono);font-size:11px">Invalid format — use x.x.x.x/nn</span>';return;}
    var testIP=parts[0],testLen=parseInt(parts[1]);
  
    var sorted=pfxEntries.slice().sort(function(a,b){return a.seq-b.seq;});
    var match=null,walkHtml='';
    for(var i=0;i<sorted.length;i++){
      var e=sorted[i];
      var hit=pfxMatchesEntry(e,testIP,testLen);
      var color=hit?(e.action==='permit'?'var(--green)':'var(--red)'):'var(--muted)';
      walkHtml+='<div style="display:flex;align-items:center;gap:8px;padding:5px 8px;border-radius:6px;background:'+(hit?'rgba(91,156,246,0.07)':'transparent')+';border:1px solid '+(hit?'rgba(91,156,246,0.2)':'transparent')+';">'
        +'<span style="font-family:var(--mono);font-size:9px;color:var(--muted);min-width:30px">seq '+e.seq+'</span>'
        +'<span style="font-family:var(--mono);font-size:10px;font-weight:700;color:'+(e.action==='permit'?'var(--green)':'var(--red)')+'">'+e.action+'</span>'
        +'<span style="font-family:var(--mono);font-size:10px;color:var(--cyan)">'+e.prefix+(e.ge?' ge '+e.ge:'')+(e.le?' le '+e.le:'')+'</span>'
        +'<span style="margin-left:auto;font-family:var(--mono);font-size:10px;color:'+color+'">'+(hit?'✓ MATCH':'✗')+'</span>'
        +'</div>';
      if(hit&&!match){match=e;break;}
    }
    if(wz) wz.innerHTML=walkHtml||'<div style="font-family:var(--mono);font-size:11px;color:var(--muted)">No entries configured.</div>';
  
    if(!match){
      el.innerHTML='<div style="background:rgba(248,113,113,0.08);border:1px solid rgba(248,113,113,0.25);border-radius:8px;padding:8px 12px;font-family:var(--mono);font-size:11px;color:var(--red)">✗ IMPLICIT DENY — '+val+' did not match any entry (implicit deny all at end)</div>';
    } else {
      var c=match.action==='permit'?'var(--green)':'var(--red)';
      var bg=match.action==='permit'?'rgba(74,222,128,0.08)':'rgba(248,113,113,0.08)';
      var brd=match.action==='permit'?'rgba(74,222,128,0.25)':'rgba(248,113,113,0.25)';
      el.innerHTML='<div style="background:'+bg+';border:1px solid '+brd+';border-radius:8px;padding:8px 12px;font-family:var(--mono);font-size:11px;color:'+c+'">'+( match.action==='permit'?'✓ PERMIT':'✗ DENY')+' — matched seq '+match.seq+': '+match.prefix+(match.ge?' ge '+match.ge:'')+(match.le?' le '+match.le:'')+'</div>';
    }
  }
  
  function pfxGenConfig(){
    var out=document.getElementById('pfx-config-out'); if(!out) return;
    var lines=[];
    var sorted=pfxEntries.slice().sort(function(a,b){return a.seq-b.seq;});
    var listName='MY-PREFIXES';
  
    if(pfxVendor==='ios'){
      lines.push('! ── Prefix-list ──────────────────────────────────');
      sorted.forEach(function(e){
        var l='ip prefix-list '+listName+' seq '+e.seq+' '+e.action+' '+e.prefix;
        if(e.ge) l+=' ge '+e.ge;
        if(e.le) l+=' le '+e.le;
        lines.push(l);
      });
      lines.push('!');
      lines.push('! ── Route-map ────────────────────────────────────');
      pfxClauses.slice().sort(function(a,b){return a.seq-b.seq;}).forEach(function(c){
        lines.push('route-map BGP-POLICY '+c.action+' '+c.seq);
        if(c.matchList) lines.push(' match ip address prefix-list '+c.matchList);
        if(c.setLocalPref) lines.push(' set local-preference '+c.setLocalPref);
        if(c.setMED) lines.push(' set metric '+c.setMED);
        if(c.setCommunity) lines.push(' set community '+c.setCommunity+' additive');
        if(c.setNextHop) lines.push(' set ip next-hop '+c.setNextHop);
        if(c.setPrepend) lines.push(' set as-path prepend '+c.setPrepend);
        lines.push('!');
      });
      lines.push('! Apply to neighbor:');
      lines.push('! neighbor 10.0.0.1 route-map BGP-POLICY in');
    } else {
      lines.push('/* JunOS policy configuration */');
      lines.push('policy-options {');
      lines.push('  prefix-list '+listName+' {');
      sorted.forEach(function(e){lines.push('    '+e.prefix+';  /* seq '+e.seq+' '+e.action+' '+( e.ge?'ge '+e.ge:'')+(e.le?' le '+e.le:'')+' */');});
      lines.push('  }');
      lines.push('  policy-statement BGP-POLICY {');
      pfxClauses.slice().sort(function(a,b){return a.seq-b.seq;}).forEach(function(c){
        lines.push('    term CLAUSE-'+c.seq+' {');
        if(c.matchList) lines.push('      from { prefix-list '+c.matchList+'; }');
        lines.push('      then {');
        if(c.setLocalPref) lines.push('        local-preference '+c.setLocalPref+';');
        if(c.setMED) lines.push('        metric '+c.setMED+';');
        if(c.setCommunity) lines.push('        community add COMM-'+c.setCommunity.replace(':','-')+';');
        if(c.setNextHop) lines.push('        next-hop '+c.setNextHop+';');
        if(c.setPrepend) lines.push('        as-path-prepend "'+c.setPrepend+'";');
        lines.push('        '+c.action+';');
        lines.push('      }');
        lines.push('    }');
      });
      lines.push('    term DEFAULT { then reject; }');
      lines.push('  }');
      lines.push('}');
    }
    out.textContent=lines.join('\n');
    pfxUpdatePolicyRef();
  }
  
  function pfxCopyConfig(){
    var out=document.getElementById('pfx-config-out'); if(!out) return;
    navigator.clipboard.writeText(out.textContent).then(function(){
      var btn=document.querySelector('[onclick="pfxCopyConfig()"]');
      if(btn){var orig=btn.textContent;btn.textContent='✓ Copied!';setTimeout(function(){btn.textContent=orig;},1500);}
    });
    pfxUpdatePolicyRef();
  }
  
  
  // ═══════════════════════════════════════════════════════════
  // ABOUT PAGE — Networking Animation Background
  // ═══════════════════════════════════════════════════════════
  function aboutNetAnim(){
    var canvas=document.getElementById('about-net-canvas'); if(!canvas) return;
    var hero=canvas.parentElement;
    canvas.width=hero.offsetWidth; canvas.height=hero.offsetHeight;
    var ctx=canvas.getContext('2d');
    var W=canvas.width, H=canvas.height;
  
    var NODE_COUNT=22;
    var nodes=[];
    var COLS=['#5b9cf6','#38d9c0','#4ade80','#fbbf24','#f472b6','#a78bfa'];
    for(var i=0;i<NODE_COUNT;i++){
      nodes.push({
        x:Math.random()*W, y:Math.random()*H,
        vx:(Math.random()-0.5)*0.4, vy:(Math.random()-0.5)*0.4,
        r:Math.random()*3+2,
        col:COLS[i%COLS.length],
        pulse:Math.random()*Math.PI*2
      });
    }
  
    // Predefined "connections" (edges) — subset of nodes
    var edges=[];
    for(var i=0;i<NODE_COUNT;i++){
      var k=Math.floor(Math.random()*2)+1;
      for(var j=0;j<k;j++){
        var t=(i+j+1)%NODE_COUNT;
        if(!edges.find(function(e){return (e[0]===i&&e[1]===t)||(e[0]===t&&e[1]===i);})){
          edges.push([i,t]);
        }
      }
    }
  
    // Packets: {edge, progress, col}
    var packets=[];
    function spawnPacket(){
      var e=edges[Math.floor(Math.random()*edges.length)];
      packets.push({edge:e,t:0,col:COLS[Math.floor(Math.random()*COLS.length)],dir:Math.random()>0.5?1:-1});
    }
    for(var i=0;i<6;i++) spawnPacket();
  
    var frame=0;
    var animId=null;
  
    function tick(){
      frame++;
      ctx.clearRect(0,0,W,H);
  
      // Update nodes
      nodes.forEach(function(n){
        n.x+=n.vx; n.y+=n.vy; n.pulse+=0.04;
        if(n.x<0||n.x>W) n.vx*=-1;
        if(n.y<0||n.y>H) n.vy*=-1;
      });
  
      // Draw edges
      edges.forEach(function(e){
        var a=nodes[e[0]], b=nodes[e[1]];
        var dist=Math.hypot(a.x-b.x,a.y-b.y);
        if(dist>W*0.55) return;
        var alpha=Math.max(0,0.18-dist/W*0.3);
        ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y);
        ctx.strokeStyle='rgba(91,156,246,'+alpha.toFixed(2)+')';
        ctx.lineWidth=0.8; ctx.stroke();
      });
  
      // Draw packets
      packets=packets.filter(function(p){return p.t<=1;});
      packets.forEach(function(p){
        p.t+=0.012;
        var e=p.edge;
        var a=nodes[e[p.dir===1?0:1]], b=nodes[e[p.dir===1?1:0]];
        var x=a.x+(b.x-a.x)*p.t, y=a.y+(b.y-a.y)*p.t;
        ctx.beginPath(); ctx.arc(x,y,3,0,Math.PI*2);
        ctx.fillStyle=p.col; ctx.globalAlpha=0.85; ctx.fill();
        ctx.globalAlpha=1;
      });
      if(frame%60===0 && packets.length<12) spawnPacket();
  
      // Draw nodes
      nodes.forEach(function(n){
        var pulse=Math.abs(Math.sin(n.pulse))*0.4+0.4;
        ctx.beginPath(); ctx.arc(n.x,n.y,n.r,0,Math.PI*2);
        ctx.fillStyle=n.col; ctx.globalAlpha=pulse; ctx.fill();
        ctx.globalAlpha=1;
        // Occasional ring
        if(Math.abs(Math.sin(n.pulse*0.3))>0.95){
          ctx.beginPath(); ctx.arc(n.x,n.y,n.r+4,0,Math.PI*2);
          ctx.strokeStyle=n.col; ctx.lineWidth=0.8; ctx.globalAlpha=0.25; ctx.stroke(); ctx.globalAlpha=1;
        }
      });
  
      animId=requestAnimationFrame(tick);
    }
  
    // Stop if page changes
    var obs=new MutationObserver(function(){
      if(!document.getElementById('about-net-canvas')||!document.getElementById('page-about').classList.contains('active')){
        cancelAnimationFrame(animId); obs.disconnect();
      }
    });
    obs.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  
    tick();
  }


  

    const menuBtn = document.getElementById('menuBtn');
    const sidebar = document.getElementById('sidebar');
  
    if (menuBtn && sidebar) {
      menuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
      });
  
      // Optional: Close sidebar when clicking outside of it
      document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && e.target !== menuBtn) {
          sidebar.classList.remove('open');
        }
      });
    }

    // This runs automatically when the page is refreshed/loaded
    window.addEventListener('DOMContentLoaded', () => {
        // Get the ID from the URL (e.g., "bgp-anim" from #bgp-anim)
        const currentHash = window.location.hash.replace('#', '');
        
        if (currentHash) {
            // Find the corresponding button in your sidebar to keep the UI consistent
            const targetBtn = document.querySelector(`.nav-btn[onclick*="${currentHash}"]`);
            // Manually trigger the page transition and logic
            gotoPage(currentHash, targetBtn);
        } else {
            // Default to home or calc if no hash exists
            gotoPage('calc', document.querySelector('.nav-btn')); 
        }
    });


    function pfxIP2n(ip){
      var p=ip.split('.').map(Number);
      return ((p[0]<<24)|(p[1]<<16)|(p[2]<<8)|p[3])>>>0;
    }
    
    function pfxN2ip(n){
      return [(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255].join('.');
    }

    // ── FULLSCREEN MODE ──
    function toggleFullscreen() {
      const app = document.querySelector('.app');
      const btn = document.getElementById('fullscreen-btn');
      const isFullscreen = app.classList.toggle('fullscreen');
      btn.innerHTML = isFullscreen ? '⊠ Exit Full' : '⛶ Full Screen';
    }

    // Escape key to exit
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        const app = document.querySelector('.app');
        const btn = document.getElementById('fullscreen-btn');
        if (app.classList.contains('fullscreen')) {
          app.classList.remove('fullscreen');
          btn.innerHTML = '⛶ Full Screen';
        }
      }
    });

    document.addEventListener('DOMContentLoaded', () => {
      // This calls the function in mtu.js that injects the HTML
      if (typeof mtuInit === 'function') {
        mtuInit();
      }
    });
