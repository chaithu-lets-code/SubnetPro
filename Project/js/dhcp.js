 // ═══════════════════════════════════════════════════
  // DHCP SIMULATOR
  // ═══════════════════════════════════════════════════
  const DHCP_NODES = {
    pc:   {x:110, y:130},
    sw:   {x:380, y:130},
    dhcp: {x:650, y:130},
  };
  
  // Speed control
  let dhcpSpeedMode = 'slow';
  function setDhcpSpeed(s) {
    dhcpSpeedMode = s;
    ['slow','normal','fast'].forEach(x => {
      const el = document.getElementById('dspeed-' + x);
      if (el) el.classList.toggle('active', x === s);
    });
  }
  function dhcpGetSegDur()   { return {slow:2400, normal:1750, fast:850}[dhcpSpeedMode]; }
  function dhcpGetAutoDelay(){ return {slow:5500, normal:2800, fast:1400}[dhcpSpeedMode]; }
  
  // DORA chain updater
  function updateDoraChain(step) {
    const map = {1:'d',2:'o',3:'r',4:'a'};
    ['d','o','r','a'].forEach((x,i) => {
      const el = document.getElementById('dchain-' + x);
      if (!el) return;
      el.classList.remove('active','done');
      if (step > i+1) el.classList.add('done');
      else if (step === i+1) el.classList.add('active');
    });
  }
  
  const DHCP_STEPS = [
    {
      step: 1, title: '1. DHCP DISCOVER — Client Broadcasts for a DHCP Server',
      tag: 'DISCOVER', tagColor: 'var(--amber)', tagBg: 'rgba(251,191,36,0.12)',
      desc: 'The PC just booted with no IP address (<strong>0.0.0.0</strong>). It sends a <strong>DHCPDISCOVER</strong> broadcast to 255.255.255.255 on UDP port 67, asking: <em>"Is there any DHCP server? I need an IP address!"</em> All devices on the subnet receive this.',
      from:'pc', to:'dhcp', via:['sw'],
      pktColor:'#fbbf24', pktLabel:'DISC',
      pktCard:['DHCPDISCOVER','Src: 0.0.0.0 → 255.255.255.255','Opt 53: DISCOVER','Opt 61: AA:BB:CC:DD:EE:FF'],
      wsOptions:[
        {num:'(53)',name:'Message Type',val:'DISCOVER'},
        {num:'(61)',name:'Client Identifier',val:'AA:BB:CC:DD:EE:FF'},
        {num:'(50)',name:'Requested IP',val:'(none — no IP yet)'},
        {num:'(12)',name:'Host Name',val:'WIN-PC01'},
        {num:'(55)',name:'Parameter Request',val:'Mask,GW,DNS,Domain'},
        {num:'(255)',name:'End',val:'—'},
      ],
      fields:[
        {k:'Source IP', v:'0.0.0.0 (no IP yet)', c:'#f87171'},
        {k:'Dest IP', v:'255.255.255.255 (bcast)', c:'#fbbf24'},
        {k:'Source Port', v:'68 (DHCP Client)'},
        {k:'Dest Port', v:'67 (DHCP Server)'},
        {k:'Client MAC', v:'AA:BB:CC:DD:EE:FF'},
        {k:'Dest MAC', v:'FF:FF:FF:FF:FF:FF'},
        {k:'Transaction ID', v:'0x3D1D8C6A'},
        {k:'Boot Request', v:'1 (Client → Server)'},
      ],
      poolState:{offered:null, leased:null}, doraHighlight:'d'
    },
    {
      step: 2, title: '2. DHCP OFFER — Server Offers an IP Address from Pool',
      tag: 'OFFER', tagColor: 'var(--green)', tagBg: 'rgba(74,222,128,0.12)',
      desc: 'The DHCP Server checks its pool and picks <strong>192.168.1.100</strong> (first available). It sends a <strong>DHCPOFFER</strong> unicast/broadcast back with the proposed IP, subnet mask, default gateway, DNS server, and lease time. The IP is temporarily reserved.',
      from:'dhcp', to:'pc', via:['sw'],
      pktColor:'#4ade80', pktLabel:'OFFER',
      pktCard:['DHCPOFFER','Opt 53: OFFER','Offered: 192.168.1.100','Opt 51: Lease 86400s'],
      wsOptions:[
        {num:'(53)',name:'Message Type',val:'OFFER'},
        {num:'(54)',name:'Server Identifier',val:'192.168.1.1'},
        {num:'(51)',name:'Lease Time',val:'86400 sec (24h)'},
        {num:'(1)', name:'Subnet Mask',val:'255.255.255.0'},
        {num:'(3)', name:'Router',val:'192.168.1.1'},
        {num:'(6)', name:'Domain Name Server',val:'8.8.8.8'},
        {num:'(15)',name:'Domain Name',val:'local.lan'},
        {num:'(12)',name:'Host Name',val:'WIN-PC01'},
        {num:'(255)',name:'End',val:'—'},
      ],
      fields:[
        {k:'Source IP', v:'192.168.1.1 (DHCP Srv)', c:'#4ade80'},
        {k:'Dest IP', v:'255.255.255.255', c:'#8892b0'},
        {k:'Offered IP', v:'192.168.1.100', c:'#38d9c0'},
        {k:'Transaction ID', v:'0x3D1D8C6A (matches)'},
        {k:'Your IP (yiaddr)', v:'192.168.1.100'},
        {k:'Server IP (siaddr)', v:'192.168.1.1'},
        {k:'Client MAC', v:'AA:BB:CC:DD:EE:FF'},
        {k:'Msg Type', v:'2 (BOOTREPLY)'},
      ],
      poolState:{offered:'192.168.1.100', leased:null}, doraHighlight:'o'
    },
    {
      step: 3, title: '3. DHCP REQUEST — Client Formally Requests the IP',
      tag: 'REQUEST', tagColor: 'var(--blue)', tagBg: 'rgba(91,156,246,0.12)',
      desc: 'The PC <strong>broadcasts</strong> DHCPREQUEST to formally accept the offer. Broadcasting (not unicasting) ensures <em>all</em> DHCP servers on the subnet see this — declining any other offers they may have reserved. It echoes back the Server ID.',
      from:'pc', to:'dhcp', via:['sw'],
      pktColor:'#5b9cf6', pktLabel:'REQ',
      pktCard:['DHCPREQUEST','Src: 0.0.0.0 → 255.255.255.255','Opt 50: 192.168.1.100','Opt 54: Server 192.168.1.1'],
      wsOptions:[
        {num:'(53)',name:'Message Type',val:'REQUEST'},
        {num:'(61)',name:'Client Identifier',val:'AA:BB:CC:DD:EE:FF'},
        {num:'(50)',name:'Requested IP',val:'192.168.1.100'},
        {num:'(54)',name:'Server Identifier',val:'192.168.1.1'},
        {num:'(12)',name:'Host Name',val:'WIN-PC01'},
        {num:'(55)',name:'Parameter Request',val:'Mask,GW,DNS,Domain'},
        {num:'(255)',name:'End',val:'—'},
      ],
      fields:[
        {k:'Source IP', v:'0.0.0.0 (still no IP!)', c:'#f87171'},
        {k:'Dest IP', v:'255.255.255.255 (bcast)', c:'#8892b0'},
        {k:'Why Broadcast?', v:'Notifies ALL servers!', c:'#fbbf24'},
        {k:'Transaction ID', v:'0x3D1D8C6A (same)'},
        {k:'Client MAC', v:'AA:BB:CC:DD:EE:FF'},
        {k:'Ciaddr', v:'0.0.0.0 (not confirmed yet)'},
        {k:'Msg Type', v:'1 (BOOTREQUEST)'},
        {k:'Other servers', v:'See REQUEST → decline'},
      ],
      poolState:{offered:'192.168.1.100', leased:null}, doraHighlight:'r'
    },
    {
      step: 4, title: '4. DHCP ACK — Server Confirms, Lease Active! 🎉',
      tag: 'ACK ✓', tagColor: 'var(--cyan)', tagBg: 'rgba(56,217,192,0.12)',
      desc: 'DHCP Server sends <strong>DHCPACK</strong> confirming the lease. Options include T1 renewal time (50%) and T2 rebinding time (87.5%). The PC now configures its NIC: sets IP, subnet, gateway, DNS. Lease countdown begins!',
      from:'dhcp', to:'pc', via:['sw'],
      pktColor:'#38d9c0', pktLabel:'ACK ✓',
      pktCard:['DHCPACK ✓','Assigned: 192.168.1.100','Opt 58: T1=43200s (50%)','Opt 59: T2=75600s (87.5%)'],
      wsOptions:[
        {num:'(53)',name:'Message Type',val:'ACK'},
        {num:'(54)',name:'Server Identifier',val:'192.168.1.1'},
        {num:'(51)',name:'Lease Time',val:'86400 sec (24h)'},
        {num:'(58)',name:'Renewal Time T1',val:'43200s (50%)'},
        {num:'(59)',name:'Rebinding Time T2',val:'75600s (87.5%)'},
        {num:'(1)', name:'Subnet Mask',val:'255.255.255.0'},
        {num:'(3)', name:'Router',val:'192.168.1.1'},
        {num:'(6)', name:'Domain Name Server',val:'8.8.8.8'},
        {num:'(255)',name:'End',val:'—'},
      ],
      fields:[
        {k:'Assigned IP', v:'192.168.1.100 ✓', c:'#4ade80'},
        {k:'Default Gateway', v:'192.168.1.1'},
        {k:'DNS Server', v:'8.8.8.8 (Google)'},
        {k:'Subnet Mask', v:'255.255.255.0'},
        {k:'Lease Time', v:'86400s = 24 hours'},
        {k:'T1 Renewal', v:'43200s (at 50% mark)'},
        {k:'T2 Rebind', v:'75600s (at 87.5% mark)'},
        {k:'Msg Type', v:'5 (DHCPACK)'},
      ],
      poolState:{offered:null, leased:'192.168.1.100'}, doraHighlight:'a'
    }
  ];
  
  let dhcpCurrentStep = 0, dhcpAnimId = null, dhcpPlaying = false, dhcpPlayTimer = null;
  let dhcpActiveNodes = [], dhcpAnimPktCard = null;
  
  function dhcpDrawTopo(activeEdge, pktX, pktY, pktColor, pktLabel, pktCard) {
    const svg = document.getElementById('dhcp-svg');
    if (!svg) return;
    const N = DHCP_NODES;
    const aNodes = dhcpActiveNodes;
  
    let html = `<defs>
      <marker id="rtr-arrow" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
        <path d="M1 1L7 4L1 7" fill="none" stroke="currentColor" stroke-width="1.5"/>
      </marker>
      <filter id="glow"><feGaussianBlur stdDeviation="3" result="b"/><feComposite in="SourceGraphic" in2="b" operator="over"/></filter>
    </defs>`;
  
    html += svgEdge(N.pc.x, N.pc.y, N.sw.x, N.sw.y, aNodes.includes('pc')||aNodes.includes('sw'), '#5b9cf6');
    html += svgEdge(N.sw.x, N.sw.y, N.dhcp.x, N.dhcp.y, aNodes.includes('sw')||aNodes.includes('dhcp'), '#5b9cf6');
  
    html += `<rect x="240" y="150" width="120" height="18" rx="4" fill="rgba(91,156,246,0.06)" stroke="rgba(91,156,246,0.15)" stroke-width="0.8"/>
      <text x="300" y="162" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#5a6080">192.168.1.0/24</text>`;
  
    html += svgPC(N.pc.x, N.pc.y, 'pc', 'PC Client\n'+(dhcpCurrentStep>=4?'192.168.1.100':'0.0.0.0'), aNodes.includes('pc'));
    html += svgSwitch(N.sw.x, N.sw.y, 'sw', 'L2 Switch', aNodes.includes('sw'));
    html += svgServer(N.dhcp.x, N.dhcp.y, 'dhcp', 'DHCP Server\n192.168.1.1', aNodes.includes('dhcp'), '#38d9c0');
    html += `<text x="${N.dhcp.x}" y="${N.dhcp.y+60}" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#4a5568">Pool: .100–.110</text>`;
  
    // Animated packet + floating info card
    if (pktX !== undefined) {
      html += `<circle cx="${pktX}" cy="${pktY}" r="16" fill="${pktColor}18" stroke="${pktColor}" stroke-width="2.5"/>`;
      html += `<circle cx="${pktX}" cy="${pktY}" r="9" fill="${pktColor}99"/>`;
      html += `<text x="${pktX}" y="${pktY+3}" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" font-weight="700" fill="#fff">${pktLabel}</text>`;
  
      // Floating info card above packet
      if (pktCard && pktCard.length) {
        const cx = Math.max(96, Math.min(pktX, 760-96));
        const cy = pktY - 85;
        const cw = 192, ch = 14 + pktCard.length * 14;
        html += `<rect x="${cx-cw/2}" y="${cy}" width="${cw}" height="${ch}" rx="5" fill="rgba(7,9,15,0.94)" stroke="${pktColor}" stroke-width="1.2"/>`;
        // Connector line
        html += `<line x1="${pktX}" y1="${pktY-16}" x2="${cx}" y2="${cy+ch}" stroke="${pktColor}" stroke-width="0.8" stroke-dasharray="3,2" opacity="0.6"/>`;
        pktCard.forEach((line, i) => {
          const fc = i === 0 ? pktColor : (i === 1 ? '#c8d0e0' : '#8892b0');
          const fw = i === 0 ? '700' : '400';
          html += `<text x="${cx}" y="${cy+12+i*14}" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="${i===0?9.5:8.5}" font-weight="${fw}" fill="${fc}">${line}</text>`;
        });
      }
    }
  
    svg.innerHTML = html;
  }
  
  function dhcpAnimateStep(step) {
    const s = DHCP_STEPS[step - 1];
    const nodes = DHCP_NODES;
    const path = [s.from, ...s.via, s.to];
    const segments = [];
    for (let i = 0; i < path.length - 1; i++) segments.push({from:nodes[path[i]], to:nodes[path[i+1]]});
  
    dhcpActiveNodes = path;
    updateDoraChain(step);
  
    // Highlight DORA card
    ['d','o','r','a'].forEach(x => { const el=document.getElementById('dora-'+x); if(el) el.style.boxShadow=''; });
    const doraEl = document.getElementById('dora-' + s.doraHighlight);
    if (doraEl) doraEl.style.boxShadow = '0 0 0 1.5px ' + s.pktColor;
  
    let segIdx = 0, startTime = null;
    const segDur = dhcpGetSegDur();
  
    function anim(ts) {
      if (!startTime) startTime = ts;
      const elapsed = ts - startTime;
      const t = Math.min(elapsed / segDur, 1);
      const e = easeInOut(t);
      const seg = segments[segIdx];
      const px = seg.from.x + (seg.to.x - seg.from.x) * e;
      const py = seg.from.y + (seg.to.y - seg.from.y) * e;
      dhcpDrawTopo(true, px, py, s.pktColor, s.pktLabel, s.pktCard);
      if (t >= 1) {
        if (segIdx < segments.length - 1) { segIdx++; startTime = ts; dhcpAnimId = requestAnimationFrame(anim); }
        else {
          dhcpDrawTopo(true, seg.to.x, seg.to.y, s.pktColor, s.pktLabel, s.pktCard);
          setTimeout(() => { dhcpDrawTopo(false); dhcpUpdateUI(); }, 500);
        }
      } else {
        dhcpAnimId = requestAnimationFrame(anim);
      }
    }
    dhcpAnimId = requestAnimationFrame(anim);
  }
  
  function dhcpUpdateUI() {
    const step = dhcpCurrentStep;
    const info = document.getElementById('dhcp-step-info');
    const numEl = document.getElementById('dhcp-step-num');
    const prog = document.getElementById('dhcp-progress');
    if (numEl) numEl.textContent = step;
    if (prog) prog.style.width = (step / 4 * 100) + '%';
    updateDoraChain(step);
  
    if (step === 0) {
      if (info) info.innerHTML = `<div class="step-tag" style="background:rgba(91,156,246,0.12);color:var(--blue)">READY</div>
        <div class="step-title">Press ▶ Play or Next to begin the DORA process</div>
        <div class="step-desc">Watch how PC obtains IP via DHCP DORA. All DHCP option numbers are shown on the moving packet.</div>`;
      dhcpRenderPool({offered:null, leased:null});
      document.getElementById('dhcp-pkt-fields').innerHTML = '<div style="color:var(--muted);font-family:var(--mono);font-size:11px;">Start the animation to see packet details & DHCP option numbers…</div>';
      const wsEl0 = document.getElementById('dhcp-ws-options');
      if (wsEl0) wsEl0.innerHTML = '';
      return;
    }
  
    const s = DHCP_STEPS[step - 1];
    if (info) info.innerHTML = `<div class="step-tag" style="background:${s.tagBg};color:${s.tagColor}">${s.tag}</div>
      <div class="step-title">${s.title}</div>
      <div class="step-desc">${s.desc}</div>`;
  
    const fieldsEl = document.getElementById('dhcp-pkt-fields');
    if (fieldsEl) {
      // Header fields grid only
      let fhtml = '<div class="pkt-fields">';
      s.fields.forEach(f => {
        fhtml += `<div class="pkt-field"><div class="pkt-field-key">${f.k}</div><div class="pkt-field-val" style="color:${f.c||'var(--text)'}">${f.v}</div></div>`;
      });
      fhtml += '</div>';
      fieldsEl.innerHTML = fhtml;
    }
  
    // Wireshark-style options — rendered inside the pool section
    const wsEl = document.getElementById('dhcp-ws-options');
    if (wsEl) {
      if (s.wsOptions) {
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
      } else {
        wsEl.innerHTML = '';
      }
    }
  
    dhcpRenderPool(s.poolState);
  }
  
  function dhcpRenderPool(state) {
    const pool = document.getElementById('dhcp-pool');
    const leaseInfo = document.getElementById('dhcp-lease-info');
    if (!pool) return;
    let html = '';
    for (let i = 100; i <= 110; i++) {
      const ip = '192.168.1.' + i;
      if (state.leased === ip) html += `<div class="pool-ip ip-leased">192.168.1.${i} ✓</div>`;
      else if (state.offered === ip) html += `<div class="pool-ip ip-offered">192.168.1.${i} ⏳</div>`;
      else html += `<div class="pool-ip ip-free">192.168.1.${i}</div>`;
    }
    pool.innerHTML = html;
    if (leaseInfo) {
      if (state.leased) leaseInfo.innerHTML = `<span style="color:var(--green)">✓ LEASED:</span> 192.168.1.100 → AA:BB:CC:DD:EE:FF<br>Gateway: 192.168.1.1 | DNS: 8.8.8.8 | TTL: 24h`;
      else if (state.offered) leaseInfo.innerHTML = `<span style="color:var(--amber)">⏳ OFFERED:</span> 192.168.1.100 temporarily reserved…`;
      else leaseInfo.innerHTML = `Waiting for lease negotiation…`;
    }
  }
  
  function dhcpStep(dir) {
    if (dhcpAnimId) { cancelAnimationFrame(dhcpAnimId); dhcpAnimId = null; }
    const newStep = dhcpCurrentStep + dir;
    if (newStep < 0 || newStep > 4) return;
    dhcpCurrentStep = newStep;
    dhcpActiveNodes = [];
    dhcpDrawTopo(false);
    dhcpUpdateUI();
    if (newStep > 0) dhcpAnimateStep(newStep);
  }
  
  function dhcpTogglePlay() {
    dhcpPlaying = !dhcpPlaying;
    const btn = document.getElementById('dhcp-play-btn');
    if (btn) btn.textContent = dhcpPlaying ? '⏸ Pause' : '▶ Play';
    if (dhcpPlaying) dhcpAutoPlay();
    else clearTimeout(dhcpPlayTimer);
  }
  
  function dhcpAutoPlay() {
    if (!dhcpPlaying) return;
    if (dhcpCurrentStep >= 4) {
      dhcpPlaying = false;
      const btn = document.getElementById('dhcp-play-btn');
      if (btn) btn.textContent = '▶ Play';
      return;
    }
    dhcpStep(1);
    dhcpPlayTimer = setTimeout(dhcpAutoPlay, dhcpGetAutoDelay());
  }
  
  function dhcpReset() {
    dhcpPlaying = false;
    clearTimeout(dhcpPlayTimer);
    if (dhcpAnimId) { cancelAnimationFrame(dhcpAnimId); dhcpAnimId = null; }
    document.getElementById('dhcp-play-btn').textContent = '▶ Play';
    dhcpCurrentStep = 0;
    dhcpActiveNodes = [];
    ['d','o','r','a'].forEach(x => { const el=document.getElementById('dora-'+x); if(el) el.style.boxShadow=''; });
    updateDoraChain(0);
    dhcpDrawTopo(false);
    dhcpUpdateUI();
  }

  
  document.addEventListener("DOMContentLoaded", function () {
    dhcpDrawTopo(false);
    dhcpRenderPool({offered:null, leased:null});
    updateDoraChain(0);
  });