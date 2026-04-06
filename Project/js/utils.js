  // ─── CORE UTILS ──────────────────────────────────────────────────────────
  const $ = id => document.getElementById(id);
  const ip2n = ip => ip.split('.').reduce((a,b) => (a*256) + (+b), 0) >>> 0;
  const n2ip = n => [24,16,8,0].map(s => (n>>s)&0xff).join('.');
  const toBin8 = n => (n & 0xff).toString(2).padStart(8,'0');
  const maskFromP = p => p===0 ? 0 : (0xffffffff << (32-p)) >>> 0;
  
  function validateIP(ip) {
    const p = ip.trim().split('.');
    if(p.length !== 4) return false;
    return p.every(o => o !== '' && !isNaN(o) && +o >= 0 && +o <= 255);
  }
  function validatePrefix(s) {
    const p = parseInt(s.replace('/','').trim());
    return !isNaN(p) && p >= 0 && p <= 32;
  }
  function getPrefix(s) { return parseInt(s.replace('/','').trim()); }
  function prefixFromMask(m) {
    let n = ip2n(m), c = 0;
    for(let i = 31; i >= 0; i--) { if((n>>i)&1) c++; else break; }
    return c;
  }

  // ═══════════════════════════════════════════════════
  // UTILITY
  // ═══════════════════════════════════════════════════
  
  //function easeInOut(t) { return t < 0.5 ? 2*t*t : -1+(4-2*t)*t; }
  window.easeInOut = function(t) { return t < 0.5 ? 2*t*t : -1+(4-2*t)*t; }
  
  // ─── SVG Node Helpers ───
  function svgPC(x, y, id, label, active) {
    const c = active ? '#5b9cf6' : '#1e2438', bc = active ? '#5b9cf6' : '#2a3550', tc = active ? '#fff' : '#8892b0';
    return `<g id="node-${id}" transform="translate(${x},${y})">
      <rect x="-30" y="-28" width="60" height="44" rx="6" fill="${c}22" stroke="${bc}" stroke-width="${active?2:1.5}"/>
      ${active?`<rect x="-30" y="-28" width="60" height="44" rx="6" fill="none" stroke="${c}" stroke-width="1.5" opacity="0.5"/>`:''}
      <rect x="-18" y="-22" width="36" height="24" rx="3" fill="${active?'#1a2a4a':'#111827'}" stroke="${bc}" stroke-width="1"/>
      <rect x="-8" y="4" width="16" height="3" rx="1" fill="${bc}"/>
      <rect x="-14" y="7" width="28" height="3" rx="1" fill="${bc}"/>
      <text x="0" y="24" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" font-weight="700" fill="${tc}">${label.split('\n')[0]}</text>
      <text x="0" y="34" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="${active?'#38d9c0':'#5a6080'}">${label.split('\n')[1]||''}</text>
    </g>`;
  }
  function svgSwitch(x, y, id, label, active) {
    const c = active?'#fbbf24':'#1e2438', bc = active?'#fbbf24':'#2a3550', tc = active?'#fff':'#8892b0';
    return `<g id="node-${id}" transform="translate(${x},${y})">
      <rect x="-32" y="-18" width="64" height="36" rx="6" fill="${c}22" stroke="${bc}" stroke-width="${active?2:1.5}"/>
      ${active?`<rect x="-32" y="-18" width="64" height="36" rx="6" fill="none" stroke="${c}" stroke-width="1.5" opacity="0.5"/>`:''}
      <rect x="-24" y="-10" width="10" height="6" rx="1" fill="${active?c:'#374151'}"/>
      <rect x="-10" y="-10" width="10" height="6" rx="1" fill="${active?c:'#374151'}"/>
      <rect x="4" y="-10" width="10" height="6" rx="1" fill="${active?c:'#374151'}"/>
      <rect x="-24" y="0" width="10" height="6" rx="1" fill="${active?c:'#374151'}"/>
      <rect x="-10" y="0" width="10" height="6" rx="1" fill="${active?c:'#374151'}"/>
      <rect x="4" y="0" width="10" height="6" rx="1" fill="${active?c:'#374151'}"/>
      <text x="0" y="26" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" font-weight="700" fill="${tc}">${label}</text>
    </g>`;
  }
  function svgRouter(x, y, id, label, active) {
    const c = active?'#a78bfa':'#1e2438', bc = active?'#a78bfa':'#2a3550', tc = active?'#fff':'#8892b0';
    return `<g id="node-${id}" transform="translate(${x},${y})">
      <circle cx="0" cy="-6" r="22" fill="${c}22" stroke="${bc}" stroke-width="${active?2:1.5}"/>
      ${active?`<circle cx="0" cy="-6" r="22" fill="none" stroke="${c}" stroke-width="1.5" opacity="0.5"/>`:''}
      <circle cx="0" cy="-6" r="8" fill="${active?c+'44':'#111827'}" stroke="${bc}" stroke-width="1.5"/>
      <line x1="-14" y1="-6" x2="-6" y2="-6" stroke="${bc}" stroke-width="1.5" marker-end="url(#rtr-arrow)"/>
      <line x1="6" y1="-6" x2="14" y2="-6" stroke="${bc}" stroke-width="1.5" marker-end="url(#rtr-arrow)"/>
      <text x="0" y="24" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" font-weight="700" fill="${tc}">${label.split('\n')[0]}</text>
      <text x="0" y="34" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="${active?'#a78bfa':'#5a6080'}">${label.split('\n')[1]||''}</text>
    </g>`;
  }
  function svgServer(x, y, id, label, active, color) {
    const ac = color||'#38d9c0', c = active?ac:'#1e2438', bc = active?ac:'#2a3550', tc = active?'#fff':'#8892b0';
    const l = label.split('\n');
    return `<g id="node-${id}" transform="translate(${x},${y})">
      <rect x="-28" y="-26" width="56" height="44" rx="5" fill="${c}22" stroke="${bc}" stroke-width="${active?2:1.5}"/>
      ${active?`<rect x="-28" y="-26" width="56" height="44" rx="5" fill="none" stroke="${c}" stroke-width="1.5" opacity="0.5"/>`:''}
      <rect x="-22" y="-20" width="44" height="7" rx="2" fill="${active?ac+'33':'#1f2937'}" stroke="${bc}" stroke-width="0.8"/>
      <rect x="-22" y="-10" width="44" height="7" rx="2" fill="${active?ac+'33':'#1f2937'}" stroke="${bc}" stroke-width="0.8"/>
      <rect x="-22" y="0" width="44" height="7" rx="2" fill="${active?ac+'33':'#1f2937'}" stroke="${bc}" stroke-width="0.8"/>
      <circle cx="14" cy="-16" r="2" fill="${active?ac:'#374151'}"/>
      <circle cx="14" cy="-6" r="2" fill="${active?ac:'#374151'}"/>
      <circle cx="14" cy="4" r="2" fill="${active?ac:'#374151'}"/>
      <text x="0" y="26" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" font-weight="700" fill="${tc}">${l[0]}</text>
      <text x="0" y="36" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="${active?ac:'#5a6080'}">${l[1]||''}</text>
    </g>`;
  }
  function svgCloud(x, y, id, label, active) {
    const c = active?'#38d9c0':'#1e2438', bc = active?'#38d9c0':'#2a3550', tc = active?'#fff':'#8892b0';
    return `<g id="node-${id}" transform="translate(${x},${y})">
      <path d="M-20,-14 Q-26,-22 -16,-24 Q-14,-34 -2,-30 Q4,-38 14,-30 Q24,-30 22,-20 Q28,-18 26,-10 Q28,-2 18,-2 Q10,4 -4,2 Q-18,6 -22,-4 Q-30,-4 -28,-14 Z"
        fill="${c}22" stroke="${bc}" stroke-width="${active?2:1.5}"/>
      ${active?`<path d="M-20,-14 Q-26,-22 -16,-24 Q-14,-34 -2,-30 Q4,-38 14,-30 Q24,-30 22,-20 Q28,-18 26,-10 Q28,-2 18,-2 Q10,4 -4,2 Q-18,6 -22,-4 Q-30,-4 -28,-14 Z" fill="none" stroke="${c}" stroke-width="1.5" opacity="0.5"/>`:''}
      <text x="0" y="20" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" font-weight="700" fill="${tc}">${label}</text>
    </g>`;
  }
  function svgNS(x, y, id, label1, label2, active, color) {
    const ac = color||'#a78bfa', c = active?ac:'#1e2438', bc = active?ac:'#2a3550', tc = active?'#fff':'#8892b0';
    return `<g id="node-${id}" transform="translate(${x},${y})">
      <rect x="-34" y="-26" width="68" height="44" rx="6" fill="${c}22" stroke="${bc}" stroke-width="${active?2:1.5}"/>
      ${active?`<rect x="-34" y="-26" width="68" height="44" rx="6" fill="none" stroke="${c}" stroke-width="1.5" opacity="0.5"/>`:''}
      <rect x="-26" y="-20" width="20" height="8" rx="2" fill="${active?ac+'44':'#1f2937'}" stroke="${bc}" stroke-width="0.8"/>
      <rect x="-26" y="-9" width="20" height="8" rx="2" fill="${active?ac+'44':'#1f2937'}" stroke="${bc}" stroke-width="0.8"/>
      <rect x="-26" y="2" width="32" height="8" rx="2" fill="${active?ac+'44':'#1f2937'}" stroke="${bc}" stroke-width="0.8"/>
      <circle cx="12" cy="-16" r="3" fill="${active?ac:'#374151'}"/>
      <text x="4" y="24" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" font-weight="700" fill="${tc}">${label1}</text>
      <text x="4" y="34" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7" fill="${active?ac:'#5a6080'}">${label2||''}</text>
    </g>`;
  }
  function svgEdge(x1,y1,x2,y2,active,color,dashed) {
    const c = active?(color||'#5b9cf6'):'rgba(100,160,255,0.15)', w = active?2:1;
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" ${dashed?'stroke-dasharray="5,4"':''}/>`;
  }
  window.svgPC     = svgPC;
  window.svgServer = svgServer;
  window.svgSwitch = svgSwitch;
  window.svgRouter = svgRouter;
  window.svgCloud  = svgCloud;
  window.svgNS     = svgNS;
  window.svgEdge   = svgEdge;

  window.ip2n = function(ip){
    return ip.split('.').reduce(function(a,b){
      return (a*256)+(+b);
    },0)>>>0;
  }

  window.n2ip = function(num){
    return [
      (num >>> 24) & 255,
      (num >>> 16) & 255,
      (num >>> 8) & 255,
      num & 255
    ].join('.');
  }

  window.maskFromP = function(p){
    return p === 0 ? 0 : (0xffffffff << (32 - p)) >>> 0;
  }

  window.validateIP = function(ip){
    const parts = ip.split('.');
    if(parts.length !== 4) return false;
    return parts.every(p => {
      const n = Number(p);
      return p !== '' && !isNaN(n) && n >= 0 && n <= 255;
    });
  }

  window.validatePrefix = function(p){
    if(!p) return false;
  
    // supports "/24" or "24"
    const val = p.startsWith('/') ? p.slice(1) : p;
    const num = Number(val);
  
    return !isNaN(num) && num >= 0 && num <= 32;
  }

  window.getPrefix = function(p){
    return Number(p.startsWith('/') ? p.slice(1) : p);
  }

  window.prefixFromMask = function(mask){
    if(!mask || !validateIP(mask)) return null;
  
    const parts = mask.split('.');
    let binary = parts.map(p => Number(p).toString(2).padStart(8,'0')).join('');
  
    // count continuous 1s from left
    let prefix = 0;
    for(let i = 0; i < binary.length; i++){
      if(binary[i] === '1') prefix++;
      else break;
    }
  
    return prefix;
  }