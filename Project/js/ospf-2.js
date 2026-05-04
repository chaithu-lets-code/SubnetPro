'use strict';

/* ─────────────────────────────────────────────────────────────────────
   POLYFILL: ctx.roundRect()
   Native roundRect was added in Chrome 99 / Firefox 112 / Safari 15.4.
   This shim makes all four call-sites in this file work on every browser.
   Handles both a single-number radius and a CSS-shorthand array [tl,tr,br,bl].
──────────────────────────────────────────────────────────────────────── */
if (typeof CanvasRenderingContext2D !== 'undefined' &&
    !CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, radii) {
    let tl, tr, br, bl;
    if (!Array.isArray(radii)) {
      tl = tr = br = bl = (radii || 0);
    } else if (radii.length === 1) {
      tl = tr = br = bl = radii[0];
    } else if (radii.length === 2) {
      tl = br = radii[0];  tr = bl = radii[1];
    } else if (radii.length === 3) {
      tl = radii[0];  tr = bl = radii[1];  br = radii[2];
    } else {
      tl = radii[0];  tr = radii[1];  br = radii[2];  bl = radii[3];
    }
    // Clamp each radius so it can't exceed half the side it's on
    const maxH = w / 2, maxV = h / 2;
    tl = Math.min(tl, maxH, maxV);
    tr = Math.min(tr, maxH, maxV);
    br = Math.min(br, maxH, maxV);
    bl = Math.min(bl, maxH, maxV);

    this.moveTo(x + tl, y);
    this.lineTo(x + w - tr, y);
    this.arcTo (x + w, y,     x + w, y + tr, tr);
    this.lineTo(x + w, y + h - br);
    this.arcTo (x + w, y + h, x + w - br, y + h, br);
    this.lineTo(x + bl, y + h);
    this.arcTo (x,     y + h, x, y + h - bl, bl);
    this.lineTo(x, y + tl);
    this.arcTo (x,     y,     x + tl, y, tl);
    this.closePath();
    return this;
  };
}

// ╔══════════════════════════════════════════════════════════════════╗
// ║   OSPF SIMULATOR  ·  Phase 1 : Neighbor State Machine  v2.0     ║
// ║   SubnetPro  ·  chaithu-lets-code.github.io/SubnetPro           ║
// ║   Domain expertise: Chaithanya Kumar  ·  Code: SubnetPro/Claude ║
// ╚══════════════════════════════════════════════════════════════════╝

/* ═══════════════════════════════════════════════════════
   MODULE STATE
   ═══════════════════════════════════════════════════════ */
let ospfCanvas, ospfCtx;
let ospfCurrentStep = 0;
let ospfPlaying     = false;
let ospfTimer       = null;
let ospfSpeedMs     = 5000;   // Default: 5 s per step (was 1.5 s)
let ospfTopo        = '2r';   // '2r' | '3r' | '4r'
let ospfTabMode     = 'normal';
let ospfTScene      = 'mtu';
let ospfSteps       = [];
let ospfAnimId      = null;
let ospfAnimStart   = null;   // for eased animation
let ospfAnimDur     = 1200;   // packet flight duration ms (was ~40 frames)
let ospfPkt = { on:false, prog:0, from:'', targets:[], type:'' };
let ospfPulseRings  = [];   // multi-ring receive pulse (one per target router)
let ospfTrails      = [];     // [{x,y,alpha}] trail particles

/* ═══════════════════════════════════════════════════════
   COLOUR PALETTE
   ═══════════════════════════════════════════════════════ */
const OSPF_SC = {
  Down:'#6b7280',   Attempt:'#8b5cf6', Init:'#f59e0b',
  '2-Way':'#3b82f6', ExStart:'#06b6d4', Exchange:'#10b981',
  Loading:'#f97316', Full:'#22c55e',   Stuck:'#ef4444'
};
const OSPF_PC = {
  Hello:'#3b82f6', DBD:'#8b5cf6',
  LSR:'#f59e0b',   LSU:'#10b981',  LSAck:'#06b6d4'
};

/* ═══════════════════════════════════════════════════════
   ROUTER DEFINITIONS
   ═══════════════════════════════════════════════════════ */
const OSPF_RTRS = {
  '2r': [
    { id:'R1', rid:'1.1.1.1', ip:'10.0.0.1',     mask:'/30', pri:1   },
    { id:'R2', rid:'2.2.2.2', ip:'10.0.0.2',     mask:'/30', pri:1   }
  ],
  '3r': [
    { id:'R1', rid:'1.1.1.1', ip:'192.168.1.1', mask:'/24', pri:1   },
    { id:'R2', rid:'2.2.2.2', ip:'192.168.1.2', mask:'/24', pri:100 },
    { id:'R3', rid:'3.3.3.3', ip:'192.168.1.3', mask:'/24', pri:1   }
  ],
  '4r': [
    { id:'R1', rid:'1.1.1.1', ip:'192.168.1.1', mask:'/24', pri:1   },
    { id:'R2', rid:'2.2.2.2', ip:'192.168.1.2', mask:'/24', pri:100 },
    { id:'R3', rid:'3.3.3.3', ip:'192.168.1.3', mask:'/24', pri:50  },
    { id:'R4', rid:'4.4.4.4', ip:'192.168.1.4', mask:'/24', pri:1   }
  ]
};

/* ═══════════════════════════════════════════════════════
   EASING
   ═══════════════════════════════════════════════════════ */
function easeInOutCubic(t) {
  return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;
}
function easeOutQuad(t) {
  return 1 - (1-t)*(1-t);
}

/* ═══════════════════════════════════════════════════════
   ENTRY POINT
   ═══════════════════════════════════════════════════════ */
   function ospfInit() {
    const host = document.getElementById('ospf-sim-container');
    if (!host) { console.error('OSPF: #ospf-sim-container missing'); return; }

    host.innerHTML = ospfBuildHTML();

    ospfCanvas = document.getElementById('ospfCanvas');
    ospfCtx    = ospfCanvas.getContext('2d');

    // Bind controls and load step data BEFORE any draw call,
    // so ospfSteps is populated and ospfUpdatePanel() has data to show.
    ospfBindControls();
    ospfLoadSteps();
    ospfUpdatePanel();

    ospfEnableResizer('ospfResizer', 'ospfColLeft');

    // Register resize listener only once (remove old one first to prevent stacking on re-visits).
    window.removeEventListener('resize', ospfResize);
    window.addEventListener('resize', ospfResize);

    // Defer the first resize/render to the next animation frame so the browser
    // has finished laying out the freshly-injected flex HTML and clientWidth is non-zero.
    requestAnimationFrame(() => { ospfResize(); });
  }


/* ═══════════════════════════════════════════════════════
   HTML + EMBEDDED CSS  (completely redesigned)
   ═══════════════════════════════════════════════════════ */
   function ospfBuildHTML() {
    return `
  <style>
  /* ── wrapper ─────────────────────────────────── */
  .ospf-wrap{font-family:'IBM Plex Mono',monospace;background:#080d1c;color:#e2e8f0;border-radius:16px;padding:20px;user-select:none;border:1px solid #1a2640;box-shadow:0 8px 40px rgba(0,0,0,.6);}
  
  /* ── split layout ────────────────────────────── */
  .ospf-app-body { display: flex; gap: 20px; align-items: flex-start; }
  .ospf-col-left { flex: 1.35; min-width: 0; }
  .ospf-col-right { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 14px; }
  
  /* ── draggable resizer ───────────────────────── */
  .ospf-resizer {
    align-self: stretch; 
    width: 12px;
    cursor: col-resize;
    background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 10 10" width="10" height="10" xmlns="http://www.w3.org/2000/svg"><circle cx="5" cy="2" r="1" fill="%2364748b"/><circle cx="5" cy="5" r="1" fill="%2364748b"/><circle cx="5" cy="8" r="1" fill="%2364748b"/></svg>') center/6px no-repeat;
    margin: 0 -4px;
    border-radius: 6px;
    transition: background-color 0.2s;
    z-index: 10;
  }
  .ospf-resizer:hover, .ospf-resizer.is-dragging { background-color: #1e293b; }
  
  /* ── top bar ─────────────────────────────────── */
  .ospf-top-bar{display:flex;flex-wrap:wrap;gap:12px;margin-bottom:14px;align-items:center;justify-content:space-between;padding:12px 16px;background:#0d1526;border-radius:10px;border:1px solid #1a2640;}
  .ospf-btn-group{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
  .ospf-group-lbl{color:#3b5278;font-size:10px;text-transform:uppercase;letter-spacing:1px;margin-right:4px;font-weight:700;}
  
  /* ── toggle buttons ──────────────────────────── */
  .ospf-btn{background:#0d1829;border:1px solid #1e3050;color:#64748b;padding:6px 14px;border-radius:7px;cursor:pointer;font-size:11px;font-family:'IBM Plex Mono',monospace;font-weight:600;transition:all .2s;letter-spacing:.3px;}
  .ospf-btn:hover{border-color:#3b82f6;color:#7cb9ff;background:#0f1f3a}
  .ospf-btn.active{background:linear-gradient(135deg,#0f2a52,#112244);border-color:#3b82f6;color:#7cb9ff;font-weight:700;box-shadow:0 0 12px rgba(59,130,246,.25);}
  
  /* ── trouble scenario bar ────────────────────── */
  .ospf-tbar{display:flex;align-items:center;gap:12px;margin-bottom:14px;padding:10px 16px;background:#0d1526;border-radius:10px;border:1px solid #1a2640;}
  .ospf-tbar select{background:#060d1a;border:1px solid #1e3050;color:#94a3b8;padding:6px 12px;border-radius:7px;font-size:11px;font-family:'IBM Plex Mono',monospace;cursor:pointer;outline:none;flex:1;transition:border-color .2s;}
  .ospf-tbar select:hover{border-color:#3b82f6}
  .ospf-tbar select:focus{border-color:#3b82f6;color:#e2e8f0}
  
  /* ── canvas ──────────────────────────────────── */
  .ospf-canvas-box{background:#04080f;border-radius:12px;overflow:hidden;margin-bottom:14px;border:1px solid #1a2640;position:relative;box-shadow:inset 0 2px 20px rgba(0,0,0,.4);}
  #ospfCanvas{display:block;width:100%;height:auto}
  
  /* ── progress strip ─────────────────────────── */
  .ospf-progress-wrap{margin-bottom:14px;display:flex;align-items:center;gap:10px;}
  .ospf-progress-track{flex:1;height:4px;background:#0d1526;border-radius:2px;overflow:hidden;}
  .ospf-progress-fill{height:100%;background:linear-gradient(90deg,#3b82f6,#22c55e);border-radius:2px;transition:width .4s ease;}
  .ospf-step-counter{font-size:11px;color:#3b5278;white-space:nowrap;font-weight:700;min-width:90px;text-align:right;}
  
  /* ── control bar ─────────────────────────────── */
  .ospf-ctrl-bar{display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;padding:12px 16px;background:#0d1526;border-radius:10px;border:1px solid #1a2640;margin-bottom:14px;}
  .ospf-cb{background:#0d1829;border:1px solid #1e3050;color:#94a3b8;width:44px;height:44px;border-radius:10px;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .2s;position:relative;}
  .ospf-cb::after{content:attr(data-label);position:absolute;bottom:-20px;left:50%;transform:translateX(-50%);font-size:9px;color:#3b5278;white-space:nowrap;font-family:'IBM Plex Mono',monospace;letter-spacing:.5px;pointer-events:none;}
  .ospf-cb:hover{background:#0f1f3a;border-color:#3b82f6;color:#7cb9ff;transform:translateY(-1px)}
  .ospf-cb.play-active{background:linear-gradient(135deg,#0a2515,#0d2a1a);border-color:#22c55e;color:#22c55e;box-shadow:0 0 14px rgba(34,197,94,.3);}
  .ospf-cb.ospf-play-btn{width:52px;height:52px;font-size:20px;border-radius:50%;border-color:#3b82f6;color:#3b82f6;box-shadow:0 0 14px rgba(59,130,246,.2);}
  .ospf-cb.ospf-play-btn:hover{box-shadow:0 0 20px rgba(59,130,246,.4);color:#7cb9ff;transform:translateY(-2px) scale(1.05);}
  .ospf-cb.ospf-play-btn.play-active{border-color:#22c55e;color:#22c55e;box-shadow:0 0 20px rgba(34,197,94,.4);}
  .ospf-ctrl-divider{width:1px;height:32px;background:#1a2640;margin:0 4px;}
  
  /* speed control */
  .ospf-spd{display:flex;align-items:center;gap:8px;}
  .ospf-spd-lbl{font-size:10px;color:#3b5278;text-transform:uppercase;letter-spacing:.8px;font-weight:700}
  .ospf-spd input[type=range]{width:90px;height:4px;appearance:none;background:#1a2640;border-radius:2px;cursor:pointer;outline:none;}
  .ospf-spd input[type=range]::-webkit-slider-thumb{appearance:none;width:14px;height:14px;border-radius:50%;background:#3b82f6;cursor:pointer;box-shadow:0 0 8px rgba(59,130,246,.5);transition:transform .15s;}
  .ospf-spd input[type=range]::-webkit-slider-thumb:hover{transform:scale(1.2)}
  .ospf-spd-val{font-size:11px;color:#7cb9ff;font-weight:700;min-width:28px;text-align:center;}
  
  /* ── info panels ─────────────────────────── */
  .ospf-panel{background:#0d1526;border-radius:10px;padding:16px;border:1px solid #1a2640;}
  .ospf-panel-title{font-size:9.5px;color:#2c4470;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;font-weight:700;display:flex;align-items:center;gap:6px;}
  .ospf-panel-title::before{content:'';display:inline-block;width:3px;height:12px;background:#3b82f6;border-radius:2px}
  .ospf-step-title{font-size:13px;font-weight:700;color:#60b8ff;margin-bottom:10px;line-height:1.4;}
  .ospf-step-desc{font-size:11px;color:#8aa3c5;line-height:1.8;margin-bottom:10px;font-family:'DM Sans',sans-serif;}
  .ospf-step-cli{font-size:10px;color:#4ade80;background:#050c1a;padding:10px 12px;border-radius:7px;margin-bottom:8px;white-space:pre-wrap;border-left:3px solid #22c55e;line-height:1.7;box-shadow:inset 0 1px 8px rgba(0,0,0,.3);}
  .ospf-step-rfc{font-size:10px;color:#2c4470;margin-top:8px;font-style:italic}
  
  /* ── log ─────────────────────────────────────── */
  .ospf-log-box{max-height:160px;overflow-y:auto;display:flex;flex-direction:column;gap:4px;scrollbar-width:thin;scrollbar-color:#1a2640 transparent;}
  .ospf-log-box::-webkit-scrollbar{width:4px}
  .ospf-log-box::-webkit-scrollbar-track{background:transparent}
  .ospf-log-box::-webkit-scrollbar-thumb{background:#1a2640;border-radius:2px}
  .ospf-log-item{font-size:10px;padding:5px 10px;border-radius:6px;background:#060d1a;border-left:3px solid #1a2640;color:#3b5278;line-height:1.4;transition:all .25s;cursor:pointer;}
  .ospf-log-item:hover{color:#64748b;background:#0a1525}
  .ospf-log-item.cur{border-left-color:#3b82f6;color:#c4ddff;background:#0a1e38;box-shadow:0 0 10px rgba(59,130,246,.12);}
  
  /* ── wireshark panel ─────────────────────────── */
  .ospf-pkt-section{background:#0d1526;border-radius:10px;padding:16px;border:1px solid #1a2640;}
  .ospf-pkt-hdr{display:flex;align-items:center;gap:12px;margin-bottom:12px}
  .ospf-pkt-badge{padding:4px 14px;border-radius:5px;font-size:11px;font-weight:700;letter-spacing:.5px;}
  .ospf-pkt-lbl{font-size:11px;color:#2c4470;font-weight:700;text-transform:uppercase;letter-spacing:.8px}
  .ospf-pkt-tbl{width:100%;border-collapse:collapse;font-size:10.5px}
  .ospf-pkt-tbl th{background:#060d1a;color:#2c4470;padding:6px 10px;text-align:left;font-weight:700;border-bottom:1px solid #1a2640;text-transform:uppercase;letter-spacing:.5px;font-size:9.5px;}
  .ospf-pkt-tbl td{padding:5px 10px;border-bottom:1px solid #080e1c;color:#8aa3c5;vertical-align:top}
  .ospf-pkt-tbl tr:hover td{background:#0a1525}
  .ospf-pkt-tbl td:first-child{color:#7db8ff;white-space:nowrap}
  .ospf-pkt-tbl td:nth-child(2){color:#86efac;font-family:'IBM Plex Mono',monospace;white-space:nowrap}
  .ospf-no-pkt{color:#2c4470;font-size:11px;padding:14px;text-align:center;font-style:italic}
  
  /* ── responsive ──────────────────────────────── */
  @media(max-width:980px){
    .ospf-app-body { flex-direction: column; }
    .ospf-top-bar{flex-direction:column;align-items:flex-start}
    .ospf-ctrl-bar{gap:8px}
    .ospf-resizer{display:none;}
  }
  </style>
  
  <div class="ospf-wrap">
    <div class="ospf-top-bar">
      <div class="ospf-btn-group">
        <span class="ospf-group-lbl">Topology</span>
        <button class="ospf-btn active" data-topo="2r">2-Router P2P</button>
        <button class="ospf-btn"        data-topo="3r">3-Router Broadcast</button>
        <button class="ospf-btn"        data-topo="4r">4-Router Broadcast</button>
      </div>
      <div class="ospf-btn-group">
        <button class="ospf-btn active" data-tab="normal">✔ Normal Path</button>
        <button class="ospf-btn"        data-tab="trouble">⚠ Troubleshoot</button>
      </div>
    </div>
  
    <div class="ospf-tbar" id="ospfTBar" style="display:none">
      <span class="ospf-group-lbl">Scenario</span>
      <select id="ospfTSel">
        <option value="mtu">MTU Mismatch → Stuck at ExStart</option>
        <option value="timer">Hello/Dead Timer Mismatch → Stuck at Init</option>
        <option value="area">Area ID Mismatch → No Neighbor</option>
        <option value="auth">Authentication Mismatch → Auth Fail</option>
        <option value="duprid">Duplicate Router-ID → Routing Loop</option>
        <option value="stub">Stub Flag Mismatch → No Neighbor</option>
        <option value="nettype">Network Type Mismatch → Partial Adjacency</option>
      </select>
    </div>
  
    <div class="ospf-app-body">
      
      <div class="ospf-col-left" id="ospfColLeft">
        <div class="ospf-canvas-box">
          <canvas id="ospfCanvas" width="900" height="380"></canvas>
        </div>
  
        <div class="ospf-progress-wrap">
          <div class="ospf-progress-track">
            <div class="ospf-progress-fill" id="ospfProgressFill" style="width:0%"></div>
          </div>
          <span class="ospf-step-counter" id="ospfSNum">Step 1 / 1</span>
        </div>
  
        <div class="ospf-ctrl-bar">
          <button class="ospf-cb" id="ospfReset" title="Reset to beginning" data-label="RESET">⏮</button>
          <button class="ospf-cb" id="ospfPrev"  title="Previous step"      data-label="PREV">◀</button>
          <button class="ospf-cb ospf-play-btn" id="ospfPlay" title="Play / Pause" data-label="PLAY">▶</button>
          <button class="ospf-cb" id="ospfNext"  title="Next step"          data-label="NEXT">▶|</button>
          <div class="ospf-ctrl-divider"></div>
          <div class="ospf-spd">
            <span class="ospf-spd-lbl">Speed</span>
            <span style="font-size:9px;color:#2c4470">Slow</span>
            <input type="range" id="ospfSpd" min="0.3" max="4" step="0.1" value="1">
            <span style="font-size:9px;color:#2c4470">Fast</span>
            <span class="ospf-spd-val" id="ospfSpdLbl">1×</span>
          </div>
        </div>
        
        <div class="ospf-pkt-section">
          <div class="ospf-pkt-hdr">
            <span class="ospf-pkt-badge" id="ospfPktBadge" style="background:#0d1526;color:#2c4470">—</span>
            <span class="ospf-pkt-lbl">Wireshark Dissection</span>
          </div>
          <div id="ospfPktBody"></div>
        </div>
      </div>
  
      <div class="ospf-resizer" id="ospfResizer"></div>
  
      <div class="ospf-col-right">
        <div class="ospf-panel">
          <div class="ospf-panel-title">Step Detail</div>
          <div class="ospf-step-title" id="ospfStepTitle">—</div>
          <div class="ospf-step-desc"  id="ospfStepDesc">—</div>
          <div class="ospf-step-cli"   id="ospfStepCli" style="display:none"></div>
          <div class="ospf-step-rfc"   id="ospfStepRfc"></div>
        </div>
        
        <div class="ospf-panel">
          <div class="ospf-panel-title">State Transition Log</div>
          <div class="ospf-log-box" id="ospfLog"></div>
        </div>
  
      </div>
  
    </div>
  </div>`;
  }


  /* ═══════════════════════════════════════════════════════
   DRAGGABLE SPLIT PANE LOGIC
   ═══════════════════════════════════════════════════════ */
function ospfEnableResizer(resizerId, leftColId) {
  const resizer = document.getElementById(resizerId);
  const leftCol = document.getElementById(leftColId);
  
  if (!resizer || !leftCol) return;

  let startX = 0;
  let startWidth = 0;

  const onMouseDown = function(e) {
    startX = e.clientX;
    startWidth = leftCol.getBoundingClientRect().width;
    
    // Attach listeners to document so dragging works even if mouse leaves the handle
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    
    resizer.classList.add('is-dragging');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none'; // Prevent text highlighting while dragging
  };

  const onMouseMove = function(e) {
    const dx = e.clientX - startX;
    const parentWidth = resizer.parentNode.getBoundingClientRect().width;
    
    // Calculate new width as a percentage
    const newWidth = ((startWidth + dx) * 100) / parentWidth;
    
    // Prevent making columns too tiny (keep between 25% and 75%)
    if (newWidth > 25 && newWidth < 75) {
      leftCol.style.flex = `0 0 ${newWidth}%`;
    }
  };

  const onMouseUp = function() {
    resizer.classList.remove('is-dragging');
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    
    // CRITICAL: Tell the canvas to redraw itself at the new exact pixel size
    window.dispatchEvent(new Event('resize')); 
  };

  resizer.addEventListener('mousedown', onMouseDown);
}


/* ═══════════════════════════════════════════════════════
   RESIZE + BIND
   ═══════════════════════════════════════════════════════ */

   
function ospfResize() {
  if (!ospfCanvas) return;
  const w = ospfCanvas.parentElement.clientWidth;
  ospfCanvas.style.width  = w + 'px';
  const h = Math.round(w * 0.40);
  ospfCanvas.style.height = h + 'px';
  ospfRender();
}

function ospfBindControls() {
  // topology
  document.querySelectorAll('[data-topo]').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('[data-topo]').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      ospfTopo = b.dataset.topo;
      ospfResetSim();
    });
  });
  // tab
  document.querySelectorAll('[data-tab]').forEach(b => {
    b.addEventListener('click', () => {
      document.querySelectorAll('[data-tab]').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      ospfTabMode = b.dataset.tab;
      document.getElementById('ospfTBar').style.display = ospfTabMode === 'trouble' ? 'flex' : 'none';
      ospfResetSim();
    });
  });
  // trouble scenario
  document.getElementById('ospfTSel').addEventListener('change', e => {
    ospfTScene = e.target.value;
    ospfResetSim();
  });
  // playback
  document.getElementById('ospfReset').addEventListener('click', ospfResetSim);
  
  document.getElementById('ospfPrev').addEventListener('click', () => {
    if (ospfPlaying) ospfTogglePlay(); // Pause if playing
    ospfGo(-1);
  });
  
  document.getElementById('ospfPlay').addEventListener('click', ospfTogglePlay);
  
  document.getElementById('ospfNext').addEventListener('click', () => {
    if (ospfPlaying) ospfTogglePlay(); // Pause if playing
    ospfGo(1);
  });
  // log items clickable
  document.getElementById('ospfLog').addEventListener('click', e => {
    const item = e.target.closest('.ospf-log-item');
    if (!item) return;
    const idx = parseInt(item.dataset.idx, 10);
    if (!isNaN(idx)) { ospfCurrentStep = idx; ospfPkt.on=false; ospfRender(); ospfUpdatePanel(); }
  });
  // speed — default 1× = 5000ms
  document.getElementById('ospfSpd').addEventListener('input', e => {
    const v = parseFloat(e.target.value);
    document.getElementById('ospfSpdLbl').textContent = v.toFixed(1) + '×';
    ospfSpeedMs = Math.round(5000 / v);
    // also scale animation duration
    ospfAnimDur  = Math.max(400, Math.round(1400 / v));
  });
}

/* ═══════════════════════════════════════════════════════
   PLAYBACK CONTROL
   ═══════════════════════════════════════════════════════ */
function ospfTogglePlay() {
  ospfPlaying = !ospfPlaying;
  const btn = document.getElementById('ospfPlay');
  if (ospfPlaying) {
    btn.textContent = '⏸';
    btn.setAttribute('data-label', 'PAUSE');
    btn.classList.add('play-active');
    ospfAutoStep();
  } else {
    btn.textContent = '▶';
    btn.setAttribute('data-label', 'PLAY');
    btn.classList.remove('play-active');
    clearTimeout(ospfTimer);
  }
}

function ospfAutoStep() {
  if (!ospfPlaying) return;
  if (ospfCurrentStep < ospfSteps.length - 1) {
    ospfGo(1);
    ospfTimer = setTimeout(ospfAutoStep, ospfSpeedMs);
  } else {
    ospfPlaying = false;
    const btn = document.getElementById('ospfPlay');
    btn.textContent = '▶';
    btn.setAttribute('data-label', 'PLAY');
    btn.classList.remove('play-active');
  }
}

function ospfGo(dir) {
  const n = ospfCurrentStep + dir;
  if (n < 0 || n >= ospfSteps.length) return;
  ospfCurrentStep = n;
  const s = ospfSteps[ospfCurrentStep];
  ospfTrails = [];
  if (s.pktType && s.from) {
    ospfPkt = { on:true, prog:0, from:s.from, targets: s.targets || [s.to], type:s.pktType };
    ospfAnimatePkt();
  } else {
    ospfPkt.on = false;
    cancelAnimationFrame(ospfAnimId);
    ospfRender();
    ospfUpdatePanel();
  }
}

function ospfResetSim() {
  clearTimeout(ospfTimer);
  ospfPlaying = false;
  const btn = document.getElementById('ospfPlay');
  btn.textContent = '▶';
  btn.setAttribute('data-label', 'PLAY');
  btn.classList.remove('play-active');
  ospfCurrentStep = 0;
  ospfPkt.on = false;
  ospfTrails = [];
  ospfPulseRings = [];
  cancelAnimationFrame(ospfAnimId);
  ospfLoadSteps();
  ospfRender();
  ospfUpdatePanel();
}

/* ═══════════════════════════════════════════════════════
   PACKET ANIMATION — eased, with trails
   ═══════════════════════════════════════════════════════ */
function ospfAnimatePkt() {
  ospfPkt.prog = 0;
  ospfAnimStart = null;

  const tick = (ts) => {
    if (!ospfAnimStart) ospfAnimStart = ts;
    const elapsed = ts - ospfAnimStart;
    const raw = Math.min(elapsed / ospfAnimDur, 1);
    ospfPkt.prog = easeInOutCubic(raw);

    // build trail particles from current pkt position
    ospfTrails.push({ prog: ospfPkt.prog, alpha: 1.0 });
    // fade old trails
    ospfTrails = ospfTrails
      .map(t => ({ ...t, alpha: t.alpha - 0.055 }))
      .filter(t => t.alpha > 0);

    ospfRender();

    if (raw < 1) {
      ospfAnimId = requestAnimationFrame(tick);
    } else {
      ospfPkt.prog = 1;
      ospfTrails = [];
      // Trigger receive pulse on ALL target routers (including multicast)
      const rtrs = OSPF_RTRS[ospfTopo] || [];
      const targets = (ospfPkt.targets && ospfPkt.targets[0] === 'ALL')
        ? rtrs.filter(r => r.id !== ospfPkt.from).map(r => r.id)
        : (ospfPkt.targets || []).filter(t => t && t !== 'ALL');
      if (targets.length > 0) {
        ospfPulseRings = targets.map(rid => ({ on:true, rid, t:0 }));
        ospfAnimPulse();
      }
      ospfPkt.on = false;
      ospfRender();
      ospfUpdatePanel();
    }
  };
  ospfAnimId = requestAnimationFrame(tick);
}

/* ── receive-pulse ring animation — supports multiple simultaneous rings ── */
// ospfPulseRings declared at top of module
function ospfAnimPulse() {
  ospfPulseRings = ospfPulseRings
    .map(r => ({ ...r, t: r.t + 0.065 }))
    .filter(r => r.t < 1);
  ospfRender();
  if (ospfPulseRings.length > 0) requestAnimationFrame(ospfAnimPulse);
}

/* ═══════════════════════════════════════════════════════
   CANVAS RENDERING
   ═══════════════════════════════════════════════════════ */
function ospfRender() {
  if (!ospfCtx) return;
  const W = ospfCanvas.width  = ospfCanvas.parentElement.clientWidth;
  const H = ospfCanvas.height = Math.round(W * 0.40);
  const ctx = ospfCtx;
  ctx.clearRect(0, 0, W, H);

  // === background gradient ===
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#040810');
  bg.addColorStop(1, '#060d1a');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // === dot grid ===
  ctx.fillStyle = 'rgba(30,48,80,0.35)';
  for (let x = 20; x < W; x += 36) {
    for (let y = 20; y < H; y += 36) {
      ctx.beginPath(); ctx.arc(x, y, 1, 0, Math.PI*2); ctx.fill();
    }
  }

  const rtrs = OSPF_RTRS[ospfTopo];
  const pos  = ospfCalcPos(rtrs, W, H);
  const step = ospfSteps[ospfCurrentStep] || {};

  if (ospfTopo === '2r') {
    ospf2rDraw(ctx, pos, rtrs, step, W, H);
  } else {
    ospfBcastDraw(ctx, pos, rtrs, step, W, H);
  }

  // draw all active pulse rings on top
  ospfPulseRings.forEach(ring => {
    if (pos[ring.rid]) ospfDrawPulse(ctx, pos[ring.rid], ring.t);
  });
}

function ospfCalcPos(rtrs, W, H) {
  const pos = {};
  const n = rtrs.length;
  if (n === 2) {
    pos['R1'] = { x: Math.round(W * 0.20), y: Math.round(H * 0.5) };
    pos['R2'] = { x: Math.round(W * 0.80), y: Math.round(H * 0.5) };
  } else if (n === 3) {
    pos['R1'] = { x: Math.round(W * 0.15), y: Math.round(H * 0.30) };
    pos['R2'] = { x: Math.round(W * 0.50), y: Math.round(H * 0.30) };
    pos['R3'] = { x: Math.round(W * 0.85), y: Math.round(H * 0.30) };
  } else {
    pos['R1'] = { x: Math.round(W * 0.12), y: Math.round(H * 0.28) };
    pos['R2'] = { x: Math.round(W * 0.38), y: Math.round(H * 0.28) };
    pos['R3'] = { x: Math.round(W * 0.63), y: Math.round(H * 0.28) };
    pos['R4'] = { x: Math.round(W * 0.88), y: Math.round(H * 0.28) };
  }
  return pos;
}

/* ── 2-Router P2P ─────────────────────────────────────────── */
function ospf2rDraw(ctx, pos, rtrs, step, W, H) {
  const r1 = pos['R1'], r2 = pos['R2'];

  // animated link glow based on state
  const states = step.states || {};
  const s1 = states['R1'] || 'Down', s2 = states['R2'] || 'Down';
  const linkCol = (s1 === 'Full' && s2 === 'Full') ? '#22c55e'
    : (s1 === 'Down' && s2 === 'Down') ? '#1a2640' : '#1e3a5f';

  // link line (glow for active)
  if (s1 !== 'Down' || s2 !== 'Down') {
    ctx.shadowColor = linkCol; ctx.shadowBlur = 8;
  }
  ctx.strokeStyle = linkCol;
  ctx.lineWidth   = 2.5;
  ctx.setLineDash([7, 5]);
  ctx.beginPath(); ctx.moveTo(r1.x, r1.y); ctx.lineTo(r2.x, r2.y); ctx.stroke();
  ctx.setLineDash([]);
  ctx.shadowBlur = 0;

  // link label
  ctx.fillStyle = '#1e3a5f'; ctx.font = '10px IBM Plex Mono';
  ctx.textAlign = 'center';
  ctx.fillText('Point-to-Point · GigabitEthernet · Cost 1', W/2, r1.y - 22);

  // trail particles
  ospfDrawTrails2r(ctx, pos);

  // packet bubble
  if (ospfPkt.on && ospfPkt.from) {
    const fp = pos[ospfPkt.from];
    const tp = pos[ospfPkt.targets[0]];
    if (fp && tp) {
      const bx = fp.x + (tp.x - fp.x) * ospfPkt.prog;
      const by = fp.y + (tp.y - fp.y) * ospfPkt.prog;
      ospfDrawBubble(ctx, bx, by, ospfPkt.type);
    }
  }

  rtrs.forEach(r => ospfDrawRouter(ctx, pos[r.id], r, step));
}

function ospfDrawTrails2r(ctx, pos) {
  if (!ospfPkt.from || !ospfPkt.targets || !ospfPkt.targets[0]) return;
  const fp = pos[ospfPkt.from];
  const tp = pos[ospfPkt.targets[0]];
  if (!fp || !tp) return;
  ospfTrails.forEach(t => {
    const bx = fp.x + (tp.x - fp.x) * t.prog;
    const by = fp.y + (tp.y - fp.y) * t.prog;
    const pc = OSPF_PC[ospfPkt.type] || '#94a3b8';
    ctx.globalAlpha = t.alpha * 0.4;
    ctx.beginPath(); ctx.arc(bx, by, 6, 0, Math.PI*2);
    ctx.fillStyle = pc; ctx.fill();
    ctx.globalAlpha = 1;
  });
}

/* ── Broadcast layout ─────────────────────────────────────── */
function ospfBcastDraw(ctx, pos, rtrs, step, W, H) {
  const busY  = Math.round(H * 0.76);
  const busX1 = Math.round(W * 0.06);
  const busX2 = Math.round(W * 0.94);
  const states = step.states || {};

  // check if any Full
  const anyFull = rtrs.some(r => (states[r.id] || 'Down') === 'Full');

  // bus line with optional glow
  if (anyFull) { ctx.shadowColor = '#22c55e'; ctx.shadowBlur = 6; }
  const busGrad = ctx.createLinearGradient(busX1, busY, busX2, busY);
  busGrad.addColorStop(0, '#0f2240');
  busGrad.addColorStop(0.5, anyFull ? '#1a4a2e' : '#1e3a5f');
  busGrad.addColorStop(1, '#0f2240');
  ctx.strokeStyle = busGrad;
  ctx.lineWidth   = 5;
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(busX1, busY); ctx.lineTo(busX2, busY); ctx.stroke();
  ctx.shadowBlur = 0; ctx.lineCap = 'butt';

  // bus label
  ctx.fillStyle = '#1e3a5f'; ctx.font = '10px IBM Plex Mono'; ctx.textAlign = 'center';
  ctx.fillText('Shared Ethernet Segment  ·  192.168.1.0/24  ·  Multi-access Broadcast', W/2, busY + 18);

  // drop lines with state-based color
  rtrs.forEach(r => {
    const p = pos[r.id];
    const sc = OSPF_SC[states[r.id] || 'Down'];
    ctx.strokeStyle = sc + '55';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(p.x, p.y + 30); ctx.lineTo(p.x, busY); ctx.stroke();
    ctx.setLineDash([]);
  });

  // trails on broadcast
  ospfDrawTrailsBcast(ctx, pos, rtrs, busY);

  // packet animation
  if (ospfPkt.on && ospfPkt.from) {
    ospfBcastPkt(ctx, pos, rtrs, busY);
  }

  rtrs.forEach(r => ospfDrawRouter(ctx, pos[r.id], r, step));
}

function ospfDrawTrailsBcast(ctx, pos, rtrs, busY) {
  if (!ospfPkt.from) return;
  const fp = pos[ospfPkt.from];
  if (!fp || !ospfTrails.length) return;
  const pc = OSPF_PC[ospfPkt.type] || '#94a3b8';
  const tgts = ospfPkt.targets || [];
  const isMulti = tgts.includes('ALL') || tgts.length > 1;

  ospfTrails.forEach(t => {
    const progT = t.prog;
    let positions = [];

    if (isMulti) {
      // Phase 1 (0–0.4): drop straight down to bus
      if (progT < 0.4) {
        const p = progT / 0.4;
        positions.push({ x: fp.x, y: fp.y + 30 + (busY - fp.y - 30) * p });
      } else {
        // Phase 2 (0.4–1): fan toward each target's x along the bus
        const targets = tgts.includes('ALL')
          ? rtrs.filter(r => r.id !== ospfPkt.from).map(r => r.id) : tgts;
        const p = easeOutQuad((progT - 0.4) / 0.6);
        targets.forEach(tid => {
          const tp = pos[tid];
          if (tp) positions.push({ x: fp.x + (tp.x - fp.x) * p, y: busY });
        });
      }
    } else if (tgts[0] && pos[tgts[0]]) {
      // Unicast 3-phase trail
      const tp = pos[tgts[0]];
      if (progT < 0.33) {
        const p = progT / 0.33;
        positions.push({ x: fp.x, y: fp.y + 30 + (busY - fp.y - 30) * p });
      } else if (progT < 0.66) {
        const p = (progT - 0.33) / 0.33;
        positions.push({ x: fp.x + (tp.x - fp.x) * p, y: busY });
      } else {
        const p = (progT - 0.66) / 0.34;
        positions.push({ x: tp.x, y: busY + (tp.y + 30 - busY) * p });
      }
    }

    positions.forEach(({ x, y }) => {
      ctx.globalAlpha = t.alpha * 0.35;
      ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = pc; ctx.fill();
      ctx.globalAlpha = 1;
    });
  });
}

function ospfBcastPkt(ctx, pos, rtrs, busY) {
  const from = ospfPkt.from;
  const tgts = ospfPkt.targets;
  const fp   = pos[from];
  if (!fp) return;
  const t = ospfPkt.prog;

  if (tgts.length === 1 && pos[tgts[0]]) {
    // Unicast: down → along bus → up
    const tp = pos[tgts[0]];
    let bx, by;
    if (t < 0.33) {
      const p = t/0.33;
      bx = fp.x; by = fp.y + 30 + (busY - fp.y - 30)*p;
    } else if (t < 0.66) {
      const p = (t-0.33)/0.33;
      bx = fp.x + (tp.x-fp.x)*p; by = busY;
    } else {
      const p = (t-0.66)/0.34;
      bx = tp.x; by = busY - (busY - tp.y - 30)*p;
    }
    ospfDrawBubble(ctx, bx, by, ospfPkt.type);
  } else {
    // Multicast: down to bus then fan out
    if (t < 0.4) {
      const p = t/0.4;
      ospfDrawBubble(ctx, fp.x, fp.y + 30 + (busY - fp.y - 30)*p, ospfPkt.type);
    } else {
      const p = easeOutQuad((t-0.4)/0.6);
      const targets = tgts.includes('ALL')
        ? rtrs.filter(r => r.id !== from).map(r => r.id) : tgts;
      targets.forEach(tid => {
        const tp = pos[tid];
        if (!tp) return;
        const bx = fp.x + (tp.x - fp.x)*p;
        const by = busY - (busY - tp.y - 30)*p;
        ospfDrawBubble(ctx, bx, by, ospfPkt.type);
      });
    }
  }
}

/* ── Router node — premium look ───────────────────────────── */
function ospfDrawRouter(ctx, p, rtr, step) {
  const RW = 100, RH = 34;
  const rx = p.x - RW/2, ry = p.y - RH/2;
  const states = (step && step.states) ? step.states : {};
  const state  = states[rtr.id] || 'Down';
  const sc     = OSPF_SC[state] || '#6b7280';
  const role   = (step && step.roles) ? (step.roles[rtr.id] || '') : '';

  // outer glow for Full/active states
  if (state === 'Full') {
    ctx.shadowColor = sc; ctx.shadowBlur = 20;
  } else if (state !== 'Down') {
    ctx.shadowColor = sc; ctx.shadowBlur = 8;
  }

  // body gradient
  const bodyGrad = ctx.createLinearGradient(rx, ry, rx, ry + RH);
  bodyGrad.addColorStop(0, '#0d1f3a');
  bodyGrad.addColorStop(1, '#080f1e');
  ctx.fillStyle   = bodyGrad;
  ctx.strokeStyle = sc;
  ctx.lineWidth   = state === 'Full' ? 2.5 : 1.5;
  ospfRoundRect(ctx, rx, ry, RW, RH, 9);
  ctx.fill(); ctx.stroke();
  ctx.shadowBlur = 0;

  // top accent stripe
  const stripeGrad = ctx.createLinearGradient(rx, ry, rx + RW, ry);
  stripeGrad.addColorStop(0, sc + '00');
  stripeGrad.addColorStop(0.5, sc + '55');
  stripeGrad.addColorStop(1, sc + '00');
  ctx.fillStyle = stripeGrad;
  ctx.beginPath();
  ctx.roundRect(rx, ry, RW, 3, [9, 9, 0, 0]);
  ctx.fill();

  // router ID
  ctx.fillStyle  = '#ddeeff';
  ctx.font       = 'bold 12px IBM Plex Mono';
  ctx.textAlign  = 'center';
  ctx.fillText(rtr.id, p.x, p.y - 5);

  // RID
  ctx.fillStyle = '#4a6a90'; ctx.font = '9px IBM Plex Mono';
  ctx.fillText(rtr.rid, p.x, p.y + 9);

  // State badge (below router)
  const bw = 90, bh = 20;
  const bx = p.x - bw/2, by = p.y + RH/2 + 7;

  // badge background
  const badgeGrad = ctx.createLinearGradient(bx, by, bx, by + bh);
  badgeGrad.addColorStop(0, sc + '28');
  badgeGrad.addColorStop(1, sc + '10');
  ctx.fillStyle   = badgeGrad;
  ctx.strokeStyle = sc + 'aa';
  ctx.lineWidth   = 1.5;
  ospfRoundRect(ctx, bx, by, bw, bh, 5);
  ctx.fill(); ctx.stroke();

  // state text
  ctx.fillStyle = sc;
  ctx.font = 'bold 9.5px IBM Plex Mono';
  ctx.fillText(state, p.x, by + 13.5);

  // IP label above
  ctx.fillStyle = '#203350'; ctx.font = '9px IBM Plex Mono';
  ctx.fillText(rtr.ip + rtr.mask, p.x, p.y - RH/2 - 10);

  // Priority (top-left of router)
  ctx.fillStyle = '#2a4060'; ctx.font = '8.5px IBM Plex Mono';
  ctx.textAlign = 'left';
  ctx.fillText('Pri ' + rtr.pri, rx + 6, ry + 11);
  ctx.textAlign = 'center';

  // Role badge DR/BDR/DROther
  if (role) {
    const rc = role === 'DR' ? '#22c55e' : role === 'BDR' ? '#f59e0b' : '#475569';
    const rLabel = '[' + role + ']';
    const rw = ctx.measureText(rLabel).width + 12;
    const rrx = p.x + RW/2 - rw/2 - 2;
    const rry = p.y - RH/2 - 22;

    ctx.fillStyle   = rc + '22';
    ctx.strokeStyle = rc + '88';
    ctx.lineWidth   = 1;
    ospfRoundRect(ctx, rrx, rry, rw, 16, 4);
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = rc;
    ctx.font = 'bold 8.5px IBM Plex Mono';
    ctx.fillText(rLabel, p.x + RW/2 - rw/2 + rw/2 - 2, rry + 11);
  }
}

/* ── Packet bubble — enhanced ─────────────────────────────── */
function ospfDrawBubble(ctx, x, y, type) {
  const pc  = OSPF_PC[type] || '#94a3b8';
  const rad = 16;

  // outer glow
  const grd = ctx.createRadialGradient(x, y, 0, x, y, rad * 2.8);
  grd.addColorStop(0, pc + '50');
  grd.addColorStop(0.6, pc + '18');
  grd.addColorStop(1, 'transparent');
  ctx.fillStyle = grd;
  ctx.beginPath(); ctx.arc(x, y, rad * 2.8, 0, Math.PI * 2); ctx.fill();

  // inner circle with gradient
  const inner = ctx.createRadialGradient(x - rad*0.3, y - rad*0.3, 0, x, y, rad);
  inner.addColorStop(0, pc + 'ff');
  inner.addColorStop(1, pc + 'aa');
  ctx.fillStyle   = inner;
  ctx.strokeStyle = '#fff4';
  ctx.lineWidth   = 1.5;
  ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();

  // label
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 8.5px IBM Plex Mono';
  ctx.textAlign = 'center';
  ctx.fillText(type, x, y + 3);
}

/* ── Receive pulse ring ───────────────────────────────────── */
function ospfDrawPulse(ctx, p, t) {
  const maxR = 55;
  const r = maxR * easeOutQuad(t);
  const alpha = (1 - t) * 0.7;
  const pc = OSPF_PC[ospfPkt.type] || '#3b82f6';
  ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
  ctx.strokeStyle = pc;
  ctx.globalAlpha = alpha;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function ospfRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.lineTo(x+w-r, y); ctx.arcTo(x+w, y, x+w, y+r, r);
  ctx.lineTo(x+w, y+h-r); ctx.arcTo(x+w, y+h, x+w-r, y+h, r);
  ctx.lineTo(x+r, y+h); ctx.arcTo(x, y+h, x, y+h-r, r);
  ctx.lineTo(x, y+r); ctx.arcTo(x, y, x+r, y, r);
  ctx.closePath();
}

/* ═══════════════════════════════════════════════════════
   UI PANEL UPDATE
   ═══════════════════════════════════════════════════════ */
function ospfUpdatePanel() {
  const s = ospfSteps[ospfCurrentStep];
  if (!s) return;

  // progress bar
  const pct = ospfSteps.length > 1
    ? Math.round((ospfCurrentStep / (ospfSteps.length - 1)) * 100) : 0;
  const fill = document.getElementById('ospfProgressFill');
  if (fill) fill.style.width = pct + '%';

  document.getElementById('ospfStepTitle').textContent = s.title || '—';
  document.getElementById('ospfStepDesc').innerHTML    = s.desc  || '—';

  const cliEl = document.getElementById('ospfStepCli');
  if (s.cli) { cliEl.style.display = 'block'; cliEl.textContent = s.cli; }
  else        { cliEl.style.display = 'none'; }

  document.getElementById('ospfStepRfc').textContent = s.rfc || '';
  document.getElementById('ospfSNum').textContent =
    'Step ' + (ospfCurrentStep + 1) + ' / ' + ospfSteps.length;

  // state log
  const log = document.getElementById('ospfLog');
  log.innerHTML = ospfSteps.map((st, i) => {
    const cls = i === ospfCurrentStep ? 'ospf-log-item cur' : 'ospf-log-item';
    return `<div class="${cls}" data-idx="${i}">${i+1}. ${st.log || st.title}</div>`;
  }).join('');
  const active = log.querySelector('.cur');
  if (active) active.scrollIntoView({ block:'nearest', behavior:'smooth' });

  ospfUpdateWireshark(s);
}

function ospfUpdateWireshark(s) {
  const badge = document.getElementById('ospfPktBadge');
  const body  = document.getElementById('ospfPktBody');
  if (!s.pktType || !s.pktFields) {
    badge.textContent = '— No Packet';
    badge.style.background = '#0d1526';
    badge.style.color = '#2c4470';
    badge.style.border = '1px solid #1a2640';
    body.innerHTML = '<div class="ospf-no-pkt">No packet captured at this step</div>';
    return;
  }
  const pc = OSPF_PC[s.pktType] || '#94a3b8';
  badge.textContent       = 'OSPF Type ' + ospfPktTypeNum(s.pktType) + ' · ' + s.pktType;
  badge.style.background  = pc + '1a';
  badge.style.color       = pc;
  badge.style.border      = '1px solid ' + pc + '44';
  body.innerHTML = `
    <table class="ospf-pkt-tbl">
      <thead><tr><th>Field</th><th>Value</th><th>Notes</th></tr></thead>
      <tbody>
        ${s.pktFields.map(f => `<tr><td>${f.f}</td><td>${f.v}</td><td>${f.n}</td></tr>`).join('')}
      </tbody>
    </table>`;
}

function ospfPktTypeNum(t) {
  return { Hello:'1', DBD:'2', LSR:'3', LSU:'4', LSAck:'5' }[t] || '?';
}

/* ═══════════════════════════════════════════════════════
   STEP LOADER
   ═══════════════════════════════════════════════════════ */
function ospfLoadSteps() {
  if (ospfTabMode === 'trouble') {
    ospfSteps = ospfTroubleSteps[ospfTScene] || [];
  } else {
    ospfSteps = { '2r': ospf2rSteps, '3r': ospf3rSteps, '4r': ospf4rSteps }[ospfTopo] || [];
  }
  ospfCurrentStep = 0;
}

/* ═══════════════════════════════════════════════════════════════════════════
   STEP DATA — 2-ROUTER P2P NORMAL PATH
   R1: 1.1.1.1  |  R2: 2.2.2.2  |  Interface: 10.0.0.x/30
   ═══════════════════════════════════════════════════════════════════════════ */
const ospf2rSteps = [
  {
    title: 'Step 1 — Initial State: Both Routers Down',
    log:   'Both routers in Down state',
    from:'', to:'', pktType:'',
    states:{ R1:'Down', R2:'Down' },
    desc: 'Both R1 and R2 have OSPF enabled but no Hello packets have been exchanged yet. The <b>Down</b> state is the initial state of the OSPF neighbor state machine. OSPF process has started but no neighbor relationship exists. Dead timers have not yet been set.',
    cli:'',
    rfc:'RFC 2328 §10.1 — Initial state of the neighbor state machine is Down',
    pktType:null, pktFields:null
  },
  {
    title: 'Step 2 — R1 Sends Hello to 224.0.0.5 (AllSPFRouters)',
    log:   'R1 → Hello → 224.0.0.5',
    from:'R1', targets:['R2'], pktType:'Hello',
    states:{ R1:'Down', R2:'Init' },
    desc: 'R1 sends its first Hello packet to the AllSPFRouters multicast group <b>224.0.0.5</b>. The Hello contains R1\'s Router-ID (1.1.1.1), Area ID, interface parameters, and an <b>empty neighbor list</b> (R1 has not seen anyone yet). R2 receives this Hello — since R1\'s neighbor list does NOT include R2\'s RID (2.2.2.2), R2 moves to <b>Init</b> state. R1 stays Down because it has not received a Hello yet.',
    cli:'show ip ospf neighbor\n! R2 shows: 1.1.1.1  INIT/  -',
    rfc:'RFC 2328 §10.5 — HelloReceived event: Move to Init',
    pktFields:[
      {f:'OSPF Version',    v:'2',          n:'OSPFv2 (RFC 2328)'},
      {f:'Message Type',    v:'1 (Hello)',   n:'Discovery and keepalive'},
      {f:'Router ID',       v:'1.1.1.1',    n:'R1 Router ID'},
      {f:'Area ID',         v:'0.0.0.0',    n:'Backbone area'},
      {f:'Checksum',        v:'0x8e4f',     n:'OSPF header checksum'},
      {f:'Auth Type',       v:'0 (None)',    n:'No authentication'},
      {f:'Src IP',          v:'10.0.0.1',   n:'R1 interface IP'},
      {f:'Dst IP',          v:'224.0.0.5',  n:'AllSPFRouters multicast'},
      {f:'IP Protocol',     v:'89',         n:'OSPF protocol number'},
      {f:'Network Mask',    v:'255.255.255.252', n:'Must match on broadcast links'},
      {f:'Hello Interval',  v:'10 sec',     n:'Must match for adjacency'},
      {f:'Options',         v:'0x02 (E-bit)', n:'External routing capable'},
      {f:'Router Priority', v:'1',          n:'Used for DR/BDR election'},
      {f:'Dead Interval',   v:'40 sec',     n:'Must match for adjacency'},
      {f:'DR',              v:'0.0.0.0',    n:'No DR on P2P links'},
      {f:'BDR',             v:'0.0.0.0',    n:'No BDR on P2P links'},
      {f:'Neighbor List',   v:'(empty)',    n:'R1 has not seen any neighbor yet'}
    ]
  },
  {
    title: 'Step 3 — R2 Sends Hello with R1\'s RID in Neighbor List',
    log:   'R2 → Hello → 224.0.0.5 (Neighbor: 1.1.1.1)',
    from:'R2', targets:['R1'], pktType:'Hello',
    states:{ R1:'2-Way', R2:'Init' },
    desc: 'R2 responds with its own Hello to <b>224.0.0.5</b>. This Hello includes R1\'s Router-ID <b>(1.1.1.1) in the neighbor list</b> — R2 is saying "I see you!" R1 receives this Hello, finds its own RID in R2\'s neighbor list, and moves to <b>2-Way</b> state. R2 is still in Init because it hasn\'t yet received a Hello from R1 that lists R2\'s RID.',
    cli:'show ip ospf neighbor\n! R1 shows: 2.2.2.2  2WAY/  -',
    rfc:'RFC 2328 §10.5 — 2-WayReceived event when own RID seen in Hello',
    pktFields:[
      {f:'OSPF Version',    v:'2',          n:'OSPFv2'},
      {f:'Message Type',    v:'1 (Hello)',   n:'Discovery and keepalive'},
      {f:'Router ID',       v:'2.2.2.2',    n:'R2 Router ID'},
      {f:'Area ID',         v:'0.0.0.0',    n:'Backbone area'},
      {f:'Src IP',          v:'10.0.0.2',   n:'R2 interface IP'},
      {f:'Dst IP',          v:'224.0.0.5',  n:'AllSPFRouters multicast'},
      {f:'Network Mask',    v:'255.255.255.252', n:'Matches R1 — adjacency can proceed'},
      {f:'Hello Interval',  v:'10 sec',     n:'Matches R1'},
      {f:'Dead Interval',   v:'40 sec',     n:'Matches R1'},
      {f:'Router Priority', v:'1',          n:'Equal priority'},
      {f:'Neighbor List',   v:'1.1.1.1',   n:'✔ R1 sees its own RID here → moves to 2-Way'}
    ]
  },
  {
    title: 'Step 4 — R1 Sends Hello with R2\'s RID — Both Reach 2-Way',
    log:   'R1 → Hello → 224.0.0.5 (Neighbor: 2.2.2.2) — Both 2-Way',
    from:'R1', targets:['R2'], pktType:'Hello',
    states:{ R1:'2-Way', R2:'2-Way' },
    desc: 'R1 now sends its Hello with R2\'s RID (2.2.2.2) in the neighbor list. R2 receives it, sees its own RID, and moves to <b>2-Way</b>. Both routers are now in 2-Way.',
    cli:'show ip ospf neighbor\n! Both show each other at 2WAY/  -',
    rfc:'RFC 2328 §10.4 — 2-Way: bidirectional communication confirmed',
    pktFields:[
      {f:'OSPF Version',    v:'2',         n:'OSPFv2'},
      {f:'Message Type',    v:'1 (Hello)',  n:'Keepalive'},
      {f:'Router ID',       v:'1.1.1.1',   n:'R1 Router ID'},
      {f:'Src IP',          v:'10.0.0.1',  n:'R1 interface IP'},
      {f:'Network Type',    v:'Point-to-Point', n:'No DR/BDR election needed'},
      {f:'Neighbor List',   v:'2.2.2.2',   n:'✔ R2 sees its own RID → moves to 2-Way'}
    ]
  },
  {
    title: 'Step 5 — 2-Way Decision: Should We Form Full Adjacency?',
    log:   '2-Way decision: P2P → YES, proceed to ExStart',
    from:'', targets:[], pktType:'',
    states:{ R1:'2-Way', R2:'2-Way' },
    desc: '<b>RFC 2328 §10.4 — The Adjacency Decision</b><br><br>At 2-Way, every OSPF router asks: <i>"Should I form a full adjacency with this neighbor?"</i><br><br><b>The decision depends on the network type:</b><br>• <b>Point-to-Point (this link):</b> ALWAYS yes → proceed to ExStart immediately<br>• <b>Broadcast (shared segment):</b> YES only if one of the pair is DR or BDR; DROther↔DROther stays at 2-Way forever<br>• <b>NBMA:</b> Configured manually via neighbor commands<br><br>Since R1↔R2 is a P2P link, both move immediately to <b>ExStart</b>.',
    cli:'show ip ospf neighbor\n! R1: 2.2.2.2  2WAY → EXSTART (P2P: always forms adj)\n\n! On broadcast — DROther to DROther:\n! R1: 4.4.4.4  2WAY/DROther — stays here forever',
    rfc:'RFC 2328 §10.4 — Adjacency forms based on network type and DR/BDR roles',
    pktType:null, pktFields:null
  },
  {
    title: 'Step 6 — ExStart: Master/Slave Election via DBD',
    log:   'R1 & R2 → ExStart, DBD I+M+MS sent',
    from:'R2', targets:['R1'], pktType:'DBD',
    states:{ R1:'ExStart', R2:'ExStart' },
    desc: 'Both routers enter <b>ExStart</b> — the first step of LSDB synchronization. Each sends a DBD (Database Description) packet with <b>I=1</b> (Initial), <b>M=1</b> (More), <b>MS=1</b> (Master) bits set, and a random sequence number. <br><br><b>Master/Slave election:</b> The router with the <b>higher Router-ID wins</b> and becomes Master. R2 (2.2.2.2) wins over R1 (1.1.1.1). The Master controls the DBD sequence number. The Slave must acknowledge using the Master\'s sequence numbers.',
    cli:'debug ip ospf adj\n! %OSPF-5-ADJCHG: EXSTART to EXCHANGE\nshow ip ospf neighbor\n! R1 shows: 2.2.2.2  EXSTART/  -',
    rfc:'RFC 2328 §10.6 — ExStart: Determine Master/Slave by Router-ID',
    pktFields:[
      {f:'OSPF Version',  v:'2',         n:'OSPFv2'},
      {f:'Message Type',  v:'2 (DBD)',    n:'Database Description'},
      {f:'Router ID',     v:'2.2.2.2',   n:'R2 claims Master (higher RID)'},
      {f:'Interface MTU', v:'1500',      n:'⚠ MTU must match or Exchange will fail'},
      {f:'Options',       v:'0x02 (E)',   n:'External routing capable'},
      {f:'I-bit',         v:'1',         n:'Initial — this is first DBD'},
      {f:'M-bit',         v:'1',         n:'More DBDs to follow'},
      {f:'MS-bit',        v:'1',         n:'R2 asserts Master role'},
      {f:'DD Sequence #', v:'4827391',   n:'R2\'s random initial sequence number'},
      {f:'LSA Headers',   v:'(none yet)', n:'No LSA headers in initial ExStart DBD'}
    ]
  },
  {
    title: 'Step 7 — Slave (R1) Acknowledges Master (R2)',
    log:   'R1 → DBD (MS=0, agrees to Slave) → R2',
    from:'R1', targets:['R2'], pktType:'DBD',
    states:{ R1:'ExStart', R2:'ExStart' },
    desc: 'R1, having the lower RID (1.1.1.1), accepts the <b>Slave</b> role. R1 sends a DBD with <b>MS=0</b> (not Master), adopting R2\'s sequence number. Both routers now agree on Master/Slave roles and transition to <b>Exchange</b> state where the actual LSDB summary exchange begins.',
    cli:'! At this point both move to Exchange state\nshow ip ospf neighbor\n! 2.2.2.2  EXCHANGE/ -',
    rfc:'RFC 2328 §10.6 — Slave sets MS=0 and uses Master sequence numbers',
    pktFields:[
      {f:'Message Type',  v:'2 (DBD)',   n:'Database Description'},
      {f:'Router ID',     v:'1.1.1.1',  n:'R1 = Slave'},
      {f:'Interface MTU', v:'1500',     n:'Must match R2'},
      {f:'I-bit',         v:'0',        n:'Not initial anymore'},
      {f:'M-bit',         v:'0',        n:'Slave does not assert M-bit'},
      {f:'MS-bit',        v:'0',        n:'R1 accepts Slave role'},
      {f:'DD Sequence #', v:'4827391',  n:'Adopted from R2 (Master\'s sequence)'}
    ]
  },
  {
    title: 'Step 9 — Exchange: R2 (Master) Sends LSDB Summary',
    log:   'R2 → DBD (LSDB headers) → R1',
    from:'R2', targets:['R1'], pktType:'DBD',
    states:{ R1:'Exchange', R2:'Exchange' },
    desc: 'R2 (Master) sends DBD packets containing <b>LSA headers</b> — a summary of every LSA in its LSDB. Each header contains: LS Type, Link State ID, Advertising Router, Sequence Number, and Checksum. R1 compares these against its own LSDB to determine which LSAs it needs to request.',
    cli:'show ip ospf database\n! Routers building LSDB picture\ndebug ip ospf adj',
    rfc:'RFC 2328 §10.6 — Exchange: Send DBD with LSA headers',
    pktFields:[
      {f:'Message Type',  v:'2 (DBD)',    n:'Database Description'},
      {f:'Router ID',     v:'2.2.2.2',   n:'R2 = Master, sends first'},
      {f:'I-bit',         v:'0',         n:'Not initial'},
      {f:'M-bit',         v:'0',         n:'Last DBD (only a few LSAs here)'},
      {f:'MS-bit',        v:'1',         n:'R2 is still Master'},
      {f:'DD Sequence #', v:'4827392',   n:'Incremented by Master'},
      {f:'LSA Header #1', v:'Type 1, ID:2.2.2.2, Adv:2.2.2.2, Seq:0x80000001', n:'Router LSA for R2'},
      {f:'LSA Header #2', v:'Type 1, ID:1.1.1.1, Adv:1.1.1.1, Seq:0x80000001', n:'Router LSA for R1 (from R2 DB)'}
    ]
  },
  {
    title: 'Step 9 — Exchange: R1 (Slave) Sends LSDB Summary',
    log:   'R1 → DBD (LSDB headers) → R2',
    from:'R1', targets:['R2'], pktType:'DBD',
    states:{ R1:'Exchange', R2:'Exchange' },
    desc: 'R1 (Slave) now sends its own DBD packets with its LSDB headers. R2 compares these to determine if it is missing any LSAs. Both routers now have a complete picture of what the other\'s LSDB contains.',
    cli:'! Exchange continues until all LSA headers sent\nshow ip ospf neighbor\n! 2.2.2.2  LOADING/ -',
    rfc:'RFC 2328 §10.6 — Both exchange DBD; move to Loading when done',
    pktFields:[
      {f:'Message Type',  v:'2 (DBD)',   n:'Database Description'},
      {f:'Router ID',     v:'1.1.1.1',  n:'R1 = Slave, echoes Master seq'},
      {f:'MS-bit',        v:'0',        n:'R1 is Slave'},
      {f:'DD Sequence #', v:'4827392',  n:'Same as Master'},
      {f:'LSA Header #1', v:'Type 1, ID:1.1.1.1, Adv:1.1.1.1, Seq:0x80000001', n:'R1\'s Router LSA'}
    ]
  },
  {
    title: 'Step 10 — Loading: R1 Sends LSR for Missing LSAs',
    log:   'R1 → LSR → R2 (request missing LSAs)',
    from:'R1', targets:['R2'], pktType:'LSR',
    states:{ R1:'Loading', R2:'Loading' },
    desc: 'Exchange is complete. R1 has identified LSAs in R2\'s DBD that it doesn\'t have in its own LSDB. R1 sends a <b>Link State Request (LSR)</b> to R2 specifying exactly which LSAs it needs. This transitions both routers to the <b>Loading</b> state. The LSR is a reliable request — it will be retransmitted if not answered.',
    cli:'debug ip ospf adj\n! OSPF: Building LSR\nshow ip ospf database\n! Some LSAs still missing',
    rfc:'RFC 2328 §10.9 — Loading state: Send LSR for each needed LSA',
    pktFields:[
      {f:'Message Type',  v:'3 (LSR)',     n:'Link State Request'},
      {f:'Router ID',     v:'1.1.1.1',    n:'R1 is requesting'},
      {f:'LS Type',       v:'1 (Router)',  n:'Requesting a Router LSA'},
      {f:'Link State ID', v:'2.2.2.2',    n:'R2\'s Router LSA'},
      {f:'Adv. Router',   v:'2.2.2.2',    n:'Advertising router of the LSA'}
    ]
  },
  {
    title: 'Step 11 — R2 Sends LSU Containing the Requested LSAs',
    log:   'R2 → LSU → R1 (delivers Router LSA)',
    from:'R2', targets:['R1'], pktType:'LSU',
    states:{ R1:'Loading', R2:'Loading' },
    desc: 'R2 responds to R1\'s LSR with a <b>Link State Update (LSU)</b> that contains the full content of the requested LSA(s). The LSU wraps one or more complete LSAs. This is the actual topology information being transferred — not just headers.',
    cli:'debug ip ospf database\n! OSPF: Install Type 1 LSA',
    rfc:'RFC 2328 §13 — LSU: Contains complete LSA data',
    pktFields:[
      {f:'Message Type',     v:'4 (LSU)',    n:'Link State Update'},
      {f:'Router ID',        v:'2.2.2.2',   n:'R2 is delivering'},
      {f:'# of LSAs',        v:'1',         n:'One LSA in this update'},
      {f:'LSA Type',         v:'1 (Router)', n:'Router LSA'},
      {f:'LS Age',           v:'1 sec',     n:'How old this LSA is'},
      {f:'Link State ID',    v:'2.2.2.2',   n:'R2\'s Router LSA'},
      {f:'Adv. Router',      v:'2.2.2.2',   n:'R2 generated this LSA'},
      {f:'Seq Number',       v:'0x80000001',n:'Initial sequence number'},
      {f:'# of Links',       v:'1',         n:'R2 has one link: to R1'},
      {f:'Link ID',          v:'10.0.0.1',  n:'R1\'s interface IP (P2P link)'},
      {f:'Link Data',        v:'10.0.0.2',  n:'R2\'s interface IP'},
      {f:'Link Type',        v:'1 (P2P)',   n:'Point-to-point link'},
      {f:'Link Cost',        v:'1',         n:'Default OSPF cost'}
    ]
  },
  {
    title: 'Step 12 — R1 Sends LSAck to Confirm Receipt',
    log:   'R1 → LSAck → R2',
    from:'R1', targets:['R2'], pktType:'LSAck',
    states:{ R1:'Loading', R2:'Loading' },
    desc: 'R1 acknowledges receipt of the LSU by sending an <b>LSAck</b>. OSPF uses reliable flooding — every LSU must be explicitly acknowledged. The LSAck contains the header of the acknowledged LSA. Without this, R2 would retransmit the LSU after the retransmission interval.',
    cli:'! Retransmit interval: ip ospf retransmit-interval 5 (default)\ndebug ip ospf retransmission',
    rfc:'RFC 2328 §13.5 — Explicit acknowledgment with LSAck',
    pktFields:[
      {f:'Message Type',  v:'5 (LSAck)',  n:'Link State Acknowledgement'},
      {f:'Router ID',     v:'1.1.1.1',   n:'R1 is acknowledging'},
      {f:'LSA Type',      v:'1 (Router)', n:'Acknowledging a Router LSA'},
      {f:'Link State ID', v:'2.2.2.2',   n:'The LSA being acknowledged'},
      {f:'Adv. Router',   v:'2.2.2.2',   n:'Who advertised it'},
      {f:'Seq Number',    v:'0x80000001',n:'Must match to be valid ACK'}
    ]
  },
  {
    title: 'Step 13 — R2 Sends LSR for R1\'s LSAs',
    log:   'R2 → LSR → R1 (request missing LSAs)',
    from:'R2', targets:['R1'], pktType:'LSR',
    states:{ R1:'Loading', R2:'Loading' },
    desc: 'R2 also has LSAs it needs from R1. R2 sends its own <b>LSR</b> requesting R1\'s Router LSA. This exchange is bidirectional — both routers may need LSAs from each other.',
    cli:'show ip ospf database router\n! R1\'s Router LSA not yet in R2\'s LSDB',
    rfc:'RFC 2328 §10.9 — LSR sent for each outstanding LSA needed',
    pktFields:[
      {f:'Message Type',  v:'3 (LSR)',     n:'Link State Request'},
      {f:'Router ID',     v:'2.2.2.2',    n:'R2 is requesting'},
      {f:'LS Type',       v:'1 (Router)',  n:'Requesting Router LSA'},
      {f:'Link State ID', v:'1.1.1.1',    n:'R1\'s Router LSA'},
      {f:'Adv. Router',   v:'1.1.1.1',    n:'Advertising router'}
    ]
  },
  {
    title: 'Step 14 — R1 Sends LSU with Its Router LSA',
    log:   'R1 → LSU → R2 (delivers Router LSA)',
    from:'R1', targets:['R2'], pktType:'LSU',
    states:{ R1:'Loading', R2:'Loading' },
    desc: 'R1 delivers its Router LSA to R2 via an <b>LSU</b>. The Router LSA describes all of R1\'s links and their costs. R2 installs this into its LSDB.',
    cli:'show ip ospf database router 1.1.1.1\n! After this, entry appears in R2\'s LSDB',
    rfc:'RFC 2328 §12.1 — Router LSA: describes all router links',
    pktFields:[
      {f:'Message Type',  v:'4 (LSU)',    n:'Link State Update'},
      {f:'Router ID',     v:'1.1.1.1',   n:'R1 is delivering'},
      {f:'# of LSAs',     v:'1',         n:'One Router LSA'},
      {f:'LSA Type',      v:'1 (Router)', n:'Router LSA'},
      {f:'Link State ID', v:'1.1.1.1',   n:'R1\'s Router LSA'},
      {f:'# of Links',    v:'1',         n:'R1\'s link to R2'},
      {f:'Link Type',     v:'1 (P2P)',   n:'Point-to-point'},
      {f:'Metric',        v:'1',         n:'Cost = 100Mbps Ref BW / Interface BW'}
    ]
  },
  {
    title: 'Step 15 — R2 Sends LSAck to R1',
    log:   'R2 → LSAck → R1',
    from:'R2', targets:['R1'], pktType:'LSAck',
    states:{ R1:'Loading', R2:'Loading' },
    desc: 'R2 acknowledges R1\'s LSU. With this acknowledgment, both routers have all the LSAs they need. The Loading state is almost complete.',
    cli:'! Last acknowledgment before Full state\ndebug ip ospf adj',
    rfc:'RFC 2328 §13.5 — Every LSU must be acknowledged',
    pktFields:[
      {f:'Message Type',  v:'5 (LSAck)',  n:'Link State Acknowledgement'},
      {f:'Router ID',     v:'2.2.2.2',   n:'R2 acknowledging'},
      {f:'Ack LSA ID',    v:'1.1.1.1',   n:'Acknowledging R1\'s Router LSA'},
      {f:'Seq Number',    v:'0x80000001',n:'Sequence must match'}
    ]
  },
  {
    title: 'Step 15 — FULL ADJACENCY ESTABLISHED ✔',
    log:   '✔ Both routers → FULL state',
    from:'R1', targets:['R2'], pktType:'Hello',
    states:{ R1:'Full', R2:'Full' },
    desc: '<b>🎉 Full adjacency achieved!</b> Both R1 and R2 are in the <b>Full</b> state. Their LSDBs are fully synchronized. R1 immediately sends a Hello keepalive to confirm the relationship is live.<br><br>In the Full state, routers continue exchanging Hello packets every <b>10 seconds</b> to maintain the neighbor relationship. The Dead Timer resets to 40s on each received Hello.',
    cli:'show ip ospf neighbor\n! 2.2.2.2  FULL/  -   00:00:05  10.0.0.2',
    rfc:'RFC 2328 §10.3 — Full: LSDB synchronized, routing table computed',
    pktFields:[
      {f:'Message Type',   v:'1 (Hello)',    n:'Keepalive — no longer for discovery'},
      {f:'Router ID',      v:'1.1.1.1',     n:'R1'},
      {f:'Neighbor List',  v:'2.2.2.2',     n:'R1 sees R2 — confirms bidirectional'},
      {f:'DR',             v:'0.0.0.0',     n:'P2P — no DR/BDR'},
      {f:'Hello Interval', v:'10 sec',      n:'Sent every 10s to keep neighbor alive'},
      {f:'Dead Interval',  v:'40 sec',      n:'R2 resets its countdown on receiving this'}
    ]
  },
  {
    title: 'Step 16 — SPF Runs: Shortest Path Tree Computed',
    log:   'SPF algorithm runs — routing table updated',
    from:'', targets:[], pktType:'',
    states:{ R1:'Full', R2:'Full' },
    desc: 'With the LSDB synchronized, both routers independently run <b>Dijkstra\'s Shortest Path First (SPF)</b> algorithm. Each router builds a Shortest Path Tree rooted at itself using the Router LSAs in the LSDB.<br><br><b>SPF result on R1:</b><br>• R1 to R2: cost 1 (direct link, GigabitEthernet)<br>• Route 10.0.0.2/32 via 10.0.0.2<br><br><b>SPF result on R2:</b><br>• R2 to R1: cost 1 (direct link)<br>• Route 10.0.0.1/32 via 10.0.0.1<br><br>SPF is throttled by timers (spf-start, spf-hold, spf-max-wait) to prevent CPU storms during topology changes.',
    cli:'show ip ospf database\n! Router Link States (Area 0)\n!   Link ID       ADV Router   Age  Seq#       Checksum\n!   1.1.1.1       1.1.1.1      12   0x80000001 0xa3f8  ← R1 Router LSA\n!   2.2.2.2       2.2.2.2      10   0x80000001 0xb2c1  ← R2 Router LSA\n\nshow ip route ospf\n! O 10.0.0.0/30 [110/1] via 10.0.0.2, 00:00:12, GigabitEthernet0/0',
    rfc:'RFC 2328 §16 — SPF: each router builds shortest-path tree from LSDB',
    pktType:null, pktFields:null
  },
  {
    title: 'Step 17 — Hello Keepalive: Dead Timer Reset',
    log:   'R2 → Hello → R1 (keepalive, Dead Timer reset)',
    from:'R2', targets:['R1'], pktType:'Hello',
    states:{ R1:'Full', R2:'Full' },
    desc: 'R2 sends its periodic Hello every 10 seconds. R1 receives it and <b>resets its Dead Timer back to 40 seconds</b>. This is how the neighbor relationship is kept alive — no data needs to be exchanged, just this small Hello.<br><br><b>If Hellos stop:</b> When the Dead Timer reaches 0, the neighbor is declared <b>Down</b>. OSPF removes it from the LSDB, floods a new Router LSA with MaxAge, and reruns SPF to find alternate paths. This is how OSPF detects link failures.',
    cli:'debug ip ospf hello\n! OSPF: Rcv hello from 2.2.2.2 area 0 from Gi0/0 10.0.0.2\n! OSPF: End of hello processing\n\n! If hellos stop for 40s:\n! %OSPF-5-ADJCHG: Process 1, Nbr 2.2.2.2 on Gi0/0 from FULL to DOWN, Dead timer expired',
    rfc:'RFC 2328 §9.5 — Hello: maintain neighbor relationships via periodic keepalives',
    pktFields:[
      {f:'Message Type',   v:'1 (Hello)',    n:'Periodic keepalive'},
      {f:'Router ID',      v:'2.2.2.2',     n:'R2'},
      {f:'Neighbor List',  v:'1.1.1.1',     n:'R2 confirms it still sees R1'},
      {f:'Hello Interval', v:'10 sec',      n:'Standard broadcast/P2P interval'},
      {f:'Dead Interval',  v:'40 sec',      n:'R1 resets its countdown — 40s clock restarts'},
      {f:'Seq#',           v:'(implicit)',  n:'Hellos are not sequence-numbered (LSAs are)'}
    ]
  }
];

/* ═══════════════════════════════════════════════════════════════════════════
   STEP DATA — 3-ROUTER BROADCAST (DR/BDR ELECTION)
   R1: 1.1.1.1 Pri=1  |  R2: 2.2.2.2 Pri=100 (DR)  |  R3: 3.3.3.3 Pri=1
   Segment: 192.168.1.0/24
   ═══════════════════════════════════════════════════════════════════════════ */
const ospf3rSteps = [
  {
    title: 'Step 1 — All Three Routers in Down State',
    log:   'R1, R2, R3 all Down',
    from:'', targets:[], pktType:'',
    states:{ R1:'Down', R2:'Down', R3:'Down' },
    roles:{},
    desc: 'R1, R2, and R3 are connected to a shared <b>Ethernet broadcast segment</b> (192.168.1.0/24). All three are in Down state. On a broadcast segment, OSPF will elect a <b>Designated Router (DR)</b> and <b>Backup DR (BDR)</b> to minimize adjacency overhead.<br><br><b>Why DR/BDR?</b> Without DR/BDR, n routers need n(n-1)/2 full adjacencies. With DR/BDR, only n-1 adjacencies to the DR are needed.',
    cli:'',
    rfc:'RFC 2328 §6.3 — DR/BDR election on broadcast networks',
    pktType:null, pktFields:null
  },
  {
    title: 'Step 2 — All Routers Send Hello — Neighbor Discovery',
    log:   'R1, R2, R3 → Hello → 224.0.0.5',
    from:'R2', targets:['ALL'], pktType:'Hello',
    states:{ R1:'Init', R2:'Init', R3:'Init' },
    roles:{},
    desc: 'All three routers send Hello packets to <b>224.0.0.5</b> (AllSPFRouters). Each Hello includes the router\'s priority — R2 has priority <b>100</b>, R1 and R3 have priority <b>1</b>. At this point, neighbor lists are empty or partial. All routers move to <b>Init</b> state as they start seeing each other\'s Hellos.',
    cli:'show ip ospf interface Gi0/0\n! Priority 100 (R2), Priority 1 (R1, R3)\n! DR 0.0.0.0, BDR 0.0.0.0 — election pending',
    rfc:'RFC 2328 §9.4 — Hello protocol on broadcast networks',
    pktFields:[
      {f:'Message Type',    v:'1 (Hello)',       n:'Discovery'},
      {f:'Src IP',          v:'192.168.1.2',     n:'R2 sends this Hello'},
      {f:'Dst IP',          v:'224.0.0.5',       n:'AllSPFRouters multicast'},
      {f:'Router ID',       v:'2.2.2.2',         n:'R2'},
      {f:'Network Mask',    v:'255.255.255.0',   n:'Must match on broadcast'},
      {f:'Hello Interval',  v:'10 sec',          n:'Broadcast default'},
      {f:'Dead Interval',   v:'40 sec',          n:'Broadcast default'},
      {f:'Router Priority', v:'100',             n:'⭐ High priority — R2 will become DR'},
      {f:'DR',              v:'0.0.0.0',         n:'Not yet elected'},
      {f:'BDR',             v:'0.0.0.0',         n:'Not yet elected'},
      {f:'Neighbor List',   v:'(partial)',        n:'Discovering neighbors'}
    ]
  },
  {
    title: 'Step 3 — 2-Way State Reached — DR/BDR Election',
    log:   'All reach 2-Way — DR/BDR Election begins',
    from:'', targets:[], pktType:'',
    states:{ R1:'2-Way', R2:'2-Way', R3:'2-Way' },
    roles:{ R2:'DR', R3:'BDR', R1:'DROther' },
    desc: '<b>DR/BDR election runs at 2-Way state:</b><br><br>' +
      '<b>DR Election:</b> Highest priority wins → R2 (pri=100) becomes DR.<br>' +
      '<b>BDR Election:</b> Highest priority among non-DR → R3 (pri=1) and R1 (pri=1) tie → highest Router-ID wins → R3 (3.3.3.3) becomes BDR.<br>' +
      '<b>DROther:</b> R1 remains DROther.<br><br>' +
      'DROthers only form FULL adjacency with DR and BDR. DROthers stay at 2-Way with each other.',
    cli:'show ip ospf interface Gi0/0\n! DR=192.168.1.2  BDR=192.168.1.3\n! State=DROther (on R1)',
    rfc:'RFC 2328 §9.4 — DR/BDR election algorithm',
    pktType:null, pktFields:null
  },
  {
    title: 'Step 4 — R1 ↔ R2 (DR) ExStart: DBD Master/Slave',
    log:   'R1 ↔ R2 → ExStart (DBD Master/Slave)',
    from:'R2', targets:['R1'], pktType:'DBD',
    states:{ R1:'ExStart', R2:'ExStart', R3:'2-Way' },
    roles:{ R2:'DR', R3:'BDR', R1:'DROther' },
    desc: '<b>DROther (R1) forms FULL adjacency ONLY with DR and BDR.</b> R1 begins adjacency with DR (R2) first. ExStart starts — R2 (2.2.2.2) wins Master election (higher RID vs R1\'s 1.1.1.1).<br><br>Meanwhile R3 (BDR) stays at 2-Way with R1 temporarily — it will form adjacency soon. R1 and R3 (both DROther vs BDR) will form full adjacency. R1-R3 <b>never reach Full with each other</b> — they stay at 2-Way since neither is DR/BDR.',
    cli:'show ip ospf neighbor\n! R1 shows: 2.2.2.2  EXSTART/DR\n!           3.3.3.3  2WAY/BDR',
    rfc:'RFC 2328 §10.4 — DROther only forms adjacency with DR and BDR',
    pktFields:[
      {f:'Message Type',    v:'2 (DBD)',    n:'Database Description'},
      {f:'From',            v:'R2 (DR)',    n:'R2 initiates as Master (higher RID)'},
      {f:'To',              v:'R1 (DROther)', n:'Unicast to R1'},
      {f:'Interface MTU',   v:'1500',      n:'Must match'},
      {f:'I-bit',           v:'1',         n:'Initial DBD'},
      {f:'MS-bit',          v:'1',         n:'R2 asserts Master'},
      {f:'DD Sequence #',   v:'9283741',   n:'R2\'s sequence number'}
    ]
  },
  {
    title: 'Step 5 — R1 ↔ R2 Exchange and Loading',
    log:   'R1 ↔ R2 → Exchange → Loading (LSR/LSU/LSAck)',
    from:'R1', targets:['R2'], pktType:'LSR',
    states:{ R1:'Loading', R2:'Loading', R3:'2-Way' },
    roles:{ R2:'DR', R3:'BDR', R1:'DROther' },
    desc: 'R1 and R2 proceed through Exchange (DBD swap) and enter Loading. R1 requests LSAs it\'s missing via LSR. R2 delivers them via LSU. R1 sends LSAck. R2 also requests missing LSAs from R1.',
    cli:'debug ip ospf adj\n! R1: EXCHANGE to LOADING\n! LSR and LSU packets visible',
    rfc:'RFC 2328 §10.6, 10.9 — Exchange and Loading states',
    pktFields:[
      {f:'Message Type',    v:'3 (LSR)',    n:'Link State Request'},
      {f:'From',            v:'R1',         n:'DROther requesting LSAs'},
      {f:'To',              v:'R2 (DR)',    n:'Unicast to DR'},
      {f:'Requesting',      v:'Type 1 LSA', n:'Router LSA from R2'},
      {f:'Link State ID',   v:'2.2.2.2',   n:'R2\'s Router LSA'}
    ]
  },
  {
    title: 'Step 6 — R1 ↔ R2 Reach FULL Adjacency',
    log:   'R1 ↔ R2 → FULL',
    from:'', targets:[], pktType:'',
    states:{ R1:'Full', R2:'Full', R3:'2-Way' },
    roles:{ R2:'DR', R3:'BDR', R1:'DROther' },
    desc: 'R1 and DR (R2) are now <b>FULL</b>. Their LSDBs are synchronized. Now the same ExStart→Exchange→Loading→Full process begins between R1 and BDR (R3).',
    cli:'show ip ospf neighbor\n! R1: 2.2.2.2  FULL/DR     — ✔ Full with DR\n!     3.3.3.3  EXSTART/BDR — Now forming with BDR',
    rfc:'RFC 2328 §10.3 — Full state: LSDB synchronized',
    pktType:null, pktFields:null
  },
  {
    title: 'Step 7 — R1 (DROther) ↔ R3 (BDR) → Full Adjacency',
    log:   'R1 ↔ R3 (BDR) → ExStart → Full',
    from:'R3', targets:['R1'], pktType:'DBD',
    states:{ R1:'Full', R2:'Full', R3:'Full' },
    roles:{ R2:'DR', R3:'BDR', R1:'DROther' },
    desc: 'R1 now forms full adjacency with BDR (R3). R3 (3.3.3.3) wins Master election over R1 (1.1.1.1). After ExStart→Exchange→Loading, both reach Full.<br><br><b>Final adjacency matrix:</b><br>✔ R1 ↔ R2 (DR): FULL<br>✔ R1 ↔ R3 (BDR): FULL<br>↔ R1 ↔ R3 as DROther-to-DROther: 2-WAY only<br><br>Total adjacencies: 2 instead of n(n-1)/2 = 3',
    cli:'show ip ospf neighbor\n! R1: 2.2.2.2  FULL/DR\n!     3.3.3.3  FULL/BDR\n! R2: 1.1.1.1  FULL/DROther\n!     3.3.3.3  FULL/BDR',
    rfc:'RFC 2328 §10.4 — DROther must form adjacency with both DR and BDR',
    pktFields:[
      {f:'Message Type',  v:'2 (DBD)',   n:'ExStart DBD'},
      {f:'From',          v:'R3 (BDR)',  n:'R3 = Master (3.3.3.3 > 1.1.1.1)'},
      {f:'To',            v:'R1',        n:'Unicast to R1'},
      {f:'MS-bit',        v:'1',         n:'R3 asserts Master'},
      {f:'DD Sequence #', v:'7621840',   n:'R3\'s sequence number'}
    ]
  },
  {
    title: 'Step 8 — R2 ↔ R3 (DR ↔ BDR) Full Adjacency',
    log:   'R2 (DR) ↔ R3 (BDR) → Full',
    from:'', targets:[], pktType:'',
    states:{ R1:'Full', R2:'Full', R3:'Full' },
    roles:{ R2:'DR', R3:'BDR', R1:'DROther' },
    desc: '<b>🎉 ALL ADJACENCIES COMPLETE!</b><br><br>DR (R2) and BDR (R3) also form full adjacency with each other.<br><br><b>LSU flooding on broadcast:</b><br>• DROthers send LSUs to <b>224.0.0.6</b> (AllDRRouters) → only DR and BDR receive<br>• DR floods received LSUs to <b>224.0.0.5</b> (AllSPFRouters) → all routers receive<br>• This ensures all routers get LSAs without every router flooding to every other router',
    cli:'show ip ospf neighbor (on R2 - DR)\n! 1.1.1.1  FULL/DROther  — R1\n! 3.3.3.3  FULL/BDR     — R3\n\nshow ip ospf neighbor (on R1 - DROther)\n! 2.2.2.2  FULL/DR      — R2\n! 3.3.3.3  FULL/BDR     — R3',
    rfc:'RFC 2328 §10.3, §13.3 — DR/BDR control flooding on broadcast',
    pktType:null, pktFields:null
  }
];

/* ═══════════════════════════════════════════════════════════════════════════
   STEP DATA — 4-ROUTER BROADCAST
   R1: Pri=1 (DROther) | R2: Pri=100 (DR) | R3: Pri=50 (BDR) | R4: Pri=1 (DROther)
   ═══════════════════════════════════════════════════════════════════════════ */
const ospf4rSteps = [
  {
    title: 'Step 1 — Four Routers on Shared Segment, All Down',
    log:   'R1, R2, R3, R4 all Down',
    from:'', targets:[], pktType:'',
    states:{ R1:'Down', R2:'Down', R3:'Down', R4:'Down' }, roles:{},
    desc: 'Four routers share an Ethernet segment (192.168.1.0/24). Priorities: R2=100, R3=50, R1=R4=1.<br><br><b>Without DR/BDR:</b> 4(4-1)/2 = <b>6 adjacencies</b> needed.<br><b>With DR/BDR:</b> Only <b>3 adjacencies</b> needed (R1→DR, R3→DR, R4→DR; BDR forms adjacency too for redundancy).<br>This is the OSPF broadcast efficiency gain.',
    cli:'', rfc:'RFC 2328 §6.3', pktType:null, pktFields:null
  },
  {
    title: 'Step 2 — Hello Exchange — All Discover Each Other',
    log:   'All → Hello → 224.0.0.5',
    from:'R2', targets:['ALL'], pktType:'Hello',
    states:{ R1:'Init', R2:'Init', R3:'Init', R4:'Init' }, roles:{},
    desc: 'All four routers send Hellos to 224.0.0.5. Each Hello includes the router\'s priority. Routers discover each other and move to Init as they receive Hellos.',
    cli:'show ip ospf interface Gi0/0\n! All show DR=0.0.0.0, BDR=0.0.0.0',
    rfc:'RFC 2328 §9.4',
    pktFields:[
      {f:'Dst IP',          v:'224.0.0.5',    n:'AllSPFRouters — all OSPF routers receive'},
      {f:'R2 Priority',     v:'100',          n:'Will become DR'},
      {f:'R3 Priority',     v:'50',           n:'Will become BDR'},
      {f:'R1, R4 Priority', v:'1',            n:'Will become DROther'}
    ]
  },
  {
    title: 'Step 3 — 2-Way Reached — DR/BDR Elected',
    log:   'DR=R2(Pri=100), BDR=R3(Pri=50), DROther=R1,R4',
    from:'', targets:[], pktType:'',
    states:{ R1:'2-Way', R2:'2-Way', R3:'2-Way', R4:'2-Way' },
    roles:{ R2:'DR', R3:'BDR', R1:'DROther', R4:'DROther' },
    desc: '<b>DR/BDR Election results:</b><br>• DR = R2 (priority 100 — highest)<br>• BDR = R3 (priority 50 — second highest)<br>• DROther = R1, R4 (priority 1 — lowest)<br><br><b>DROther behavior:</b><br>• R1 and R4 stay at 2-Way with EACH OTHER<br>• R1 and R4 will form FULL adjacency with DR and BDR only<br>• Total full adjacencies: 4 (R1↔DR, R1↔BDR, R4↔DR, R4↔BDR)',
    cli:'show ip ospf neighbor (on R1)\n! 2.2.2.2  2WAY/DR   — Will become FULL\n! 3.3.3.3  2WAY/BDR  — Will become FULL\n! 4.4.4.4  2WAY/DROther — Stays 2WAY',
    rfc:'RFC 2328 §9.4 — Priority→RID tiebreak for DR/BDR', pktType:null, pktFields:null
  },
  {
    title: 'Step 4 — DROthers Form Full Adjacency with DR and BDR',
    log:   'R1, R4 → ExStart/Exchange/Loading with R2(DR) and R3(BDR)',
    from:'R1', targets:['R2'], pktType:'DBD',
    states:{ R1:'Exchange', R2:'Exchange', R3:'Exchange', R4:'Exchange' },
    roles:{ R2:'DR', R3:'BDR', R1:'DROther', R4:'DROther' },
    desc: 'Both R1 and R4 (DROthers) simultaneously form adjacencies with DR (R2) and BDR (R3). They go through ExStart → Exchange → Loading with each.<br><br><b>Important:</b> R1 and R4 NEVER form adjacency with each other. They see each other\'s Hellos and stay at 2-Way. They exchange LSAs INDIRECTLY via the DR.',
    cli:'show ip ospf neighbor\n! On R1: R2=EXCHANGE/DR, R3=EXCHANGE/BDR, R4=2WAY/DROther\n! On R4: R2=EXCHANGE/DR, R3=EXCHANGE/BDR, R1=2WAY/DROther',
    rfc:'RFC 2328 §10.4', pktFields:[
      {f:'From',      v:'R1 (DROther)',   n:'DROther forming with DR'},
      {f:'To',        v:'R2 (DR)',        n:'Unicast DBD to DR'},
      {f:'MS-bit',    v:'0',             n:'R1 is Slave (lower RID)'},
      {f:'DD Seq #',  v:'9283741',       n:'Adopted from Master (R2)'}
    ]
  },
  {
    title: 'Step 5 — ALL FULL: LSU Flooding via DR',
    log:   '✔ All reach Full — LSU flooding via DR demonstrated',
    from:'R1', targets:['R2','R3'], pktType:'LSU',
    states:{ R1:'Full', R2:'Full', R3:'Full', R4:'Full' },
    roles:{ R2:'DR', R3:'BDR', R1:'DROther', R4:'DROther' },
    desc: '<b>🎉 All four routers are FULL!</b><br><br><b>LSU flooding on broadcast:</b><br>1. R1 (DROther) sends LSU to <b>224.0.0.6</b> (AllDRRouters)<br>2. Only DR (R2) and BDR (R3) receive this<br>3. DR (R2) re-floods to <b>224.0.0.5</b> (AllSPFRouters)<br>4. All routers (including R4) receive the update<br><br>This prevents every router from flooding to every other router — efficient!',
    cli:'show ip ospf neighbor (on R2 - DR)\n! 1.1.1.1  FULL/DROther\n! 3.3.3.3  FULL/BDR\n! 4.4.4.4  FULL/DROther\n\nshow ip ospf database\n! 4 Router LSAs, 1 Network LSA (from DR)',
    rfc:'RFC 2328 §13.3 — DR controls LSA flooding on broadcast networks',
    pktFields:[
      {f:'From',      v:'R1 (DROther)',   n:'DROther originates LSU'},
      {f:'To',        v:'224.0.0.6',      n:'AllDRRouters — only DR and BDR receive'},
      {f:'Then DR',   v:'→ 224.0.0.5',   n:'DR re-floods to AllSPFRouters'},
      {f:'# LSAs',    v:'1',             n:'Carrying updated Router LSA'}
    ]
  }
];

/* ═══════════════════════════════════════════════════════════════════════════
   TROUBLESHOOT STEP DATA
   ═══════════════════════════════════════════════════════════════════════════ */
const ospfTroubleSteps = {

  /* ── MTU Mismatch ──────────────────────────────────────── */
  mtu: [
    {
      title: 'Scenario: MTU Mismatch — Setup',
      log:   'MTU Mismatch scenario begins',
      from:'', targets:[], pktType:'',
      states:{ R1:'Down', R2:'Down' }, roles:{},
      desc: '<b>⚠ Troubleshoot: MTU Mismatch</b><br><br>R1 has MTU=1500. R2 has MTU=1400 (maybe a tunnel interface or misconfigured).<br><br>OSPF Hellos will form normally — the MTU field is NOT in the Hello packet. The problem appears in the <b>DBD (Database Description)</b> packet during ExStart. OSPF embeds the interface MTU in the DBD packet and checks for a match before proceeding to Exchange.',
      cli:'show ip ospf interface Gi0/0\n! R1: MTU is 1500\n! R2: MTU is 1400',
      rfc:'RFC 2328 §10.6 — MTU check during DBD exchange', pktType:null, pktFields:null
    },
    {
      title: 'Step 2 — Hello Exchange Succeeds (MTU not in Hello)',
      log:   'Hellos OK — MTU not checked at this stage',
      from:'R1', targets:['R2'], pktType:'Hello',
      states:{ R1:'2-Way', R2:'2-Way' }, roles:{},
      desc: 'Hello packets do NOT carry MTU information, so both routers form adjacency up to 2-Way without issue. This is a common trap — operators assume if Hellos work, everything will work. The MTU mismatch is hidden until DBD exchange.',
      cli:'show ip ospf neighbor\n! R1 shows: 2.2.2.2  2WAY/ -\n! Looks normal so far!',
      rfc:'RFC 2328 §9.5 — Hello packet format: no MTU field',
      pktFields:[
        {f:'Message Type',  v:'1 (Hello)',  n:'No MTU field here — problem hidden'},
        {f:'Hello Interval', v:'10',        n:'Match ✔'},
        {f:'Dead Interval',  v:'40',        n:'Match ✔'},
        {f:'Area ID',        v:'0.0.0.0',   n:'Match ✔'},
        {f:'MTU',            v:'(absent)',   n:'Not in Hello — mismatch hidden!'}
      ]
    },
    {
      title: 'Step 3 — ExStart: DBD Sent with MTU Field',
      log:   'DBD with MTU=1500 (R1) → R2',
      from:'R1', targets:['R2'], pktType:'DBD',
      states:{ R1:'ExStart', R2:'ExStart' }, roles:{},
      desc: 'Both routers enter ExStart and send DBD packets. R1 sends DBD with MTU=<b>1500</b>. R2 receives it but R2\'s own interface MTU is only 1400.<br><br><b>R2 checks:</b> "Is the received MTU (1500) ≤ my MTU (1400)? NO → Drop this DBD packet!"<br><br>R1 will never receive a proper DBD response. ExStart is stuck.',
      cli:'show ip ospf neighbor\n! 2.2.2.2  EXSTART/ -  ← STUCK HERE\n\ndebug ip ospf adj\n! OSPF: Rcv DBD from 1.1.1.1 on Gi0/0 seq 0x... mtu 1500, REJECT',
      rfc:'RFC 2328 §10.6 — If received MTU > interface MTU, DBD is discarded',
      pktFields:[
        {f:'Message Type',    v:'2 (DBD)',   n:'Database Description'},
        {f:'Router ID',       v:'1.1.1.1',  n:'R1 sending'},
        {f:'Interface MTU',   v:'1500',     n:'⚠ R1\'s MTU = 1500'},
        {f:'I-bit',           v:'1',        n:'Initial DBD'},
        {f:'MS-bit',          v:'1',        n:'R1 asserts Master (RID check pending)'}
      ]
    },
    {
      title: 'Step 4 — STUCK: ExStart — DBD Retransmission Loop',
      log:   '⛔ STUCK at ExStart — DBD being retransmitted',
      from:'R1', targets:['R2'], pktType:'DBD',
      states:{ R1:'ExStart', R2:'Stuck' }, roles:{},
      desc: '<b>⛔ STUCK AT EXSTART</b><br><br>R1 keeps retransmitting the DBD every <b>5 seconds</b> (retransmit interval). R2 keeps discarding it because MTU=1500 > R2\'s MTU=1400. The neighbor will eventually be declared Down after the Dead interval expires, then the process repeats.<br><br><b>Symptoms:</b><br>• Neighbor stuck at EXSTART for minutes<br>• High CPU from retransmissions<br>• Syslog: %OSPF-5-ADJCHG: EXSTART repeatedly',
      cli:'show ip ospf neighbor\n! 2.2.2.2  EXSTART/ -  dead 00:00:35 ← reset each Hello\n\ndebug ip ospf adj\n! %OSPF-5-ADJCHG: Neighbor 2.2.2.2 from LOADING to DOWN\n! %OSPF-5-ADJCHG: Neighbor 2.2.2.2 from DOWN to EXSTART',
      rfc:'RFC 2328 §10.6', pktFields:[
        {f:'MTU R1',        v:'1500',   n:'⚠ Causing the mismatch'},
        {f:'MTU R2',        v:'1400',   n:'⚠ Discards DBD with higher MTU'},
        {f:'Retransmit',    v:'Every 5 sec', n:'ip ospf retransmit-interval 5 (default)'},
        {f:'Result',        v:'Loop',   n:'EXSTART forever until fixed'}
      ]
    },
    {
      title: 'Step 5 — FIX: Match MTU or Use ip ospf mtu-ignore',
      log:   '✔ Fix applied — ip ospf mtu-ignore',
      from:'', targets:[], pktType:'',
      states:{ R1:'Full', R2:'Full' }, roles:{},
      desc: '<b>Resolution Options:</b><br><br><b>Option 1 (Best):</b> Fix the MTU mismatch at the interface level so both routers have matching MTUs.<br><b>Option 2 (Workaround):</b> Use <code>ip ospf mtu-ignore</code> on the interface to skip MTU check.<br><br><b>Why Option 1 is better:</b> MTU mismatch can cause packet fragmentation and black holes even after OSPF adjacency forms. Fixing the MTU ensures the entire data path works correctly.',
      cli:'! Option 1: Fix MTU\nR2(config-if)# ip mtu 1500\n\n! Option 2: Skip MTU check (workaround)\nR1(config-if)# ip ospf mtu-ignore\nR2(config-if)# ip ospf mtu-ignore\n\n! Verify\nshow ip ospf neighbor\n! 2.2.2.2  FULL/ -  ← Fixed!',
      rfc:'RFC 2328 §10.6 — MTU must match for DBD acceptance', pktType:null, pktFields:null
    }
  ],

  /* ── Hello/Dead Timer Mismatch ─────────────────────────── */
  timer: [
    {
      title: 'Scenario: Hello/Dead Timer Mismatch',
      log:   'Timer mismatch scenario begins',
      from:'', targets:[], pktType:'',
      states:{ R1:'Down', R2:'Down' }, roles:{},
      desc: '<b>⚠ Troubleshoot: Hello/Dead Timer Mismatch</b><br><br>R1: Hello=10, Dead=40 (default broadcast)<br>R2: Hello=30, Dead=120 (NBMA defaults or misconfigured)<br><br>The Hello interval and Dead interval <b>must match exactly</b> for two OSPF neighbors to form adjacency. If they don\'t match, the Hello is <b>silently discarded</b>.',
      cli:'', rfc:'RFC 2328 §9.5 — Hello/Dead interval mismatch = no adjacency', pktType:null, pktFields:null
    },
    {
      title: 'Step 2 — R1 Sends Hello (Hi=10, Di=40)',
      log:   'R1 → Hello (Hi=10, Di=40) → R2',
      from:'R1', targets:['R2'], pktType:'Hello',
      states:{ R1:'Down', R2:'Down' }, roles:{},
      desc: 'R1 sends Hello with Hello Interval=10 and Dead Interval=40. R2 receives this Hello. R2\'s own Hello interval is 30 and Dead Interval is 120. <b>R2 compares: Hi(10) ≠ 30 → DISCARDS Hello silently.</b><br><br>No log message is generated by default! This makes timer mismatch tricky to diagnose without debug.',
      cli:'debug ip ospf hello\n! OSPF: Mismatched hello parameters from 10.0.0.1\n! Dead R 40 C 120, Hello R 10 C 30\n! (R=Received, C=Configured)',
      rfc:'RFC 2328 §9.5.1 — If HelloInterval or RouterDeadInterval don\'t match, discard Hello',
      pktFields:[
        {f:'Hello Interval',  v:'10 sec',   n:'⚠ R1=10, R2=30 — MISMATCH'},
        {f:'Dead Interval',   v:'40 sec',   n:'⚠ R1=40, R2=120 — MISMATCH'},
        {f:'Result',          v:'DISCARDED', n:'R2 silently drops this Hello'}
      ]
    },
    {
      title: 'STUCK: No Adjacency Forms — Both Stay Down',
      log:   '⛔ STUCK — Both remain Down',
      from:'', targets:[], pktType:'',
      states:{ R1:'Down', R2:'Down' }, roles:{},
      desc: '<b>⛔ No adjacency ever forms.</b><br><br>R1 keeps sending Hellos every 10 seconds. R2 keeps discarding them. R2 sends its own Hellos every 30 seconds, which R1 also discards (R1 sees Hi=30, expects 10).<br><br><b>Fix:</b> Match Hello and Dead intervals on both sides.',
      cli:'! Fix on R2:\nR2(config-if)# ip ospf hello-interval 10\nR2(config-if)# ip ospf dead-interval 40\n\n! OR: Sub-second hellos (both sides must match)\nR1(config-if)# ip ospf dead-interval minimal hello-multiplier 4\nR2(config-if)# ip ospf dead-interval minimal hello-multiplier 4\n\n! Verify after fix:\nshow ip ospf neighbor\n! 2.2.2.2  FULL/  -',
      rfc:'RFC 2328 §9.5.1', pktType:null, pktFields:null
    }
  ],

  /* ── Area ID Mismatch ──────────────────────────────────── */
  area: [
    {
      title: 'Scenario: Area ID Mismatch',
      log:   'Area mismatch scenario',
      from:'', targets:[], pktType:'',
      states:{ R1:'Down', R2:'Down' }, roles:{},
      desc: '<b>⚠ Troubleshoot: Area ID Mismatch</b><br><br>R1\'s interface is in <b>Area 0</b> (backbone). R2\'s interface is configured for <b>Area 1</b>. Both are on the same physical link but in different areas.<br><br>The Area ID in the OSPF Hello <b>must match</b> between neighbors. If not, the Hello is discarded.',
      cli:'', rfc:'RFC 2328 §9.5.1', pktType:null, pktFields:null
    },
    {
      title: 'Step 2 — R1 Hello with Area 0 Rejected by R2 (Area 1)',
      log:   'R1 → Hello (Area 0) → R2 — DISCARDED',
      from:'R1', targets:['R2'], pktType:'Hello',
      states:{ R1:'Down', R2:'Down' }, roles:{},
      desc: 'R1 sends Hello with Area ID = 0.0.0.0. R2 receives it but R2\'s interface is in Area 1 (0.0.0.1). Area ID mismatch → R2 <b>silently discards</b> the Hello. No adjacency forms.',
      cli:'debug ip ospf hello\n! OSPF: Mismatched area from 10.0.0.1\n! Area R 0.0.0.0 C 0.0.0.1\n\n! Fix:\nR2(config-router)# no network 10.0.0.2 0.0.0.0 area 1\nR2(config-router)# network 10.0.0.2 0.0.0.0 area 0',
      rfc:'RFC 2328 §9.5.1 — Area ID must match',
      pktFields:[
        {f:'Area ID (R1)',   v:'0.0.0.0', n:'R1 configured in Area 0'},
        {f:'Area ID (R2)',   v:'0.0.0.1', n:'⚠ R2 configured in Area 1 — MISMATCH'},
        {f:'Result',         v:'DISCARDED', n:'R2 drops Hello silently'}
      ]
    }
  ],

  /* ── Authentication Mismatch ───────────────────────────── */
  auth: [
    {
      title: 'Scenario: Authentication Mismatch',
      log:   'Auth mismatch scenario',
      from:'', targets:[], pktType:'',
      states:{ R1:'Down', R2:'Down' }, roles:{},
      desc: '<b>⚠ Troubleshoot: Authentication Mismatch</b><br><br>R1 has MD5 authentication configured. R2 has no authentication (Type 0). When R1 sends a Hello with MD5 auth data, R2 expects Type 0 (no auth) and rejects the packet.<br><br>OSPF supports 3 auth types: Type 0 (None), Type 1 (Cleartext), Type 2 (MD5).',
      cli:'', rfc:'RFC 2328 §Appendix D — Authentication', pktType:null, pktFields:null
    },
    {
      title: 'Step 2 — R1 Hello with MD5 Auth Rejected by R2',
      log:   '⛔ R1 Hello (MD5) → R2 — AUTH FAIL',
      from:'R1', targets:['R2'], pktType:'Hello',
      states:{ R1:'Down', R2:'Down' }, roles:{},
      desc: 'R1 sends Hello with Auth Type=2 (MD5) and a key-id/digest. R2 has Auth Type=0 (None). R2 checks: Received Auth Type (2) ≠ Configured (0) → <b>Authentication failure. Hello discarded.</b><br><br>Syslog message generated: <code>%OSPF-4-BADAUTH</code>',
      cli:'debug ip ospf adj\n! %OSPF-4-BADAUTH: Bad authentication from 10.0.0.1\n\n! Fix (match auth on both):\nR2(config-if)# ip ospf authentication message-digest\nR2(config-if)# ip ospf message-digest-key 1 md5 secretkey\n\n! Or remove auth from R1:\nR1(config-if)# no ip ospf authentication',
      rfc:'RFC 2328 §Appendix D.3 — MD5 Cryptographic Authentication',
      pktFields:[
        {f:'Auth Type (R1)',  v:'2 (MD5)',   n:'⚠ R1 uses MD5'},
        {f:'Auth Type (R2)',  v:'0 (None)',  n:'⚠ R2 expects no auth — MISMATCH'},
        {f:'Key ID',          v:'1',         n:'MD5 key ID'},
        {f:'Auth Length',     v:'16',        n:'MD5 digest length'},
        {f:'Auth Data',       v:'a3f8...',   n:'MD5 hash of the OSPF packet'},
        {f:'Result',          v:'DISCARDED', n:'%OSPF-4-BADAUTH syslog generated'}
      ]
    }
  ],

  /* ── Duplicate Router-ID ───────────────────────────────── */
  duprid: [
    {
      title: 'Scenario: Duplicate Router-ID',
      log:   'Duplicate RID scenario',
      from:'', targets:[], pktType:'',
      states:{ R1:'Down', R2:'Down' }, roles:{},
      desc: '<b>⚠ Troubleshoot: Duplicate Router-ID</b><br><br>R1 and R2 both have Router-ID <b>1.1.1.1</b>. This is a critical misconfiguration. The Router-ID uniquely identifies each OSPF router in the domain. When two routers share a RID, their Router LSAs conflict and routing tables become corrupted.',
      cli:'', rfc:'RFC 2328 §3.3 — Router-ID must be unique in OSPF domain', pktType:null, pktFields:null
    },
    {
      title: 'Step 2 — Hello Received — Duplicate RID Detected',
      log:   '⛔ Duplicate RID 1.1.1.1 detected',
      from:'R2', targets:['R1'], pktType:'Hello',
      states:{ R1:'Init', R2:'Init' }, roles:{},
      desc: 'R2 sends Hello with Router-ID=1.1.1.1. R1 receives it and detects that the sender\'s RID is the same as its own. Cisco IOS generates a <b>%OSPF-4-DUP_RTRID_NBR</b> syslog message.<br><br><b>What can go wrong:</b><br>• Both routers\' Router LSAs overwrite each other<br>• SPF calculation produces incorrect topology<br>• Routing loops or black holes develop<br>• Very difficult to trace — routes appear correct but traffic is dropped',
      cli:'! Syslog:\n%OSPF-4-DUP_RTRID_NBR: Detected duplicate router-id\n  1.1.1.1 from 10.0.0.2 on interface Gi0/0\n\n! Verify:\nshow ip ospf | include Router ID\n! Both show 1.1.1.1 ← PROBLEM!\n\n! Fix: Set explicit Router-ID\nR2(config-router)# router-id 2.2.2.2\nR2(config-router)# end\nR2# clear ip ospf process',
      rfc:'RFC 2328 §3.3',
      pktFields:[
        {f:'R2 Router ID',   v:'1.1.1.1', n:'⚠ Same as R1!'},
        {f:'R1 Router ID',   v:'1.1.1.1', n:'⚠ Duplicate!'},
        {f:'Result',         v:'%OSPF-4-DUP_RTRID_NBR', n:'Syslog on Cisco IOS'},
        {f:'Impact',         v:'Routing corruption', n:'LSAs overwrite each other'}
      ]
    }
  ],

  /* ── Stub Flag Mismatch ────────────────────────────────── */
  stub: [
    {
      title: 'Scenario: Stub Flag Mismatch',
      log:   'Stub flag mismatch scenario',
      from:'', targets:[], pktType:'',
      states:{ R1:'Down', R2:'Down' }, roles:{},
      desc: '<b>⚠ Troubleshoot: Stub Flag Mismatch</b><br><br>Both R1 and R2 are in Area 1. R1 has Area 1 configured as a <b>stub area</b> (blocks Type 5 External LSAs). R2 has Area 1 as a <b>standard area</b>.<br><br>The stub/non-stub flag is carried in the <b>Hello Options field (E-bit)</b>. A set E-bit means external routing is supported. Stub area routers clear the E-bit. Mismatch → Hello discarded.',
      cli:'', rfc:'RFC 2328 §9.5.1 — E-bit mismatch causes Hello to be discarded', pktType:null, pktFields:null
    },
    {
      title: 'Step 2 — R2 Hello (E-bit=1) Discarded by R1 (Stub)',
      log:   '⛔ E-bit mismatch — Hello discarded',
      from:'R2', targets:['R1'], pktType:'Hello',
      states:{ R1:'Down', R2:'Down' }, roles:{},
      desc: 'R2 (standard area) sends Hello with E-bit=1 (external routing capable). R1 (stub area) receives Hello and checks: E-bit received=1, but R1 has stub=yes so it expects E-bit=0. <b>Mismatch → Hello silently discarded.</b><br><br><b>Fix:</b> Configure the same area type (both stub or both standard) on both sides.',
      cli:'debug ip ospf hello\n! OSPF: Options mismatch from 10.0.0.2, recv 0x2 config 0x0\n\n! Fix:\nR2(config-router)# area 1 stub\n! Now both have E-bit=0 → adjacency forms',
      rfc:'RFC 2328 §9.5.1 — E-bit (external capable) must match',
      pktFields:[
        {f:'Options (R2)',    v:'0x02 (E=1)', n:'⚠ R2 external capable (standard area)'},
        {f:'Options (R1)',    v:'0x00 (E=0)', n:'⚠ R1 stub area — E-bit=0'},
        {f:'E-bit',          v:'MISMATCH',   n:'Stub area discards Hello with E=1'},
        {f:'Result',         v:'DISCARDED',  n:'No adjacency forms'}
      ]
    }
  ],

  /* ── Network Type Mismatch ─────────────────────────────── */
  nettype: [
    {
      title: 'Scenario: Network Type Mismatch',
      log:   'Network type mismatch scenario',
      from:'', targets:[], pktType:'',
      states:{ R1:'Down', R2:'Down' }, roles:{},
      desc: '<b>⚠ Troubleshoot: Network Type Mismatch</b><br><br>R1 interface: <code>ip ospf network broadcast</code><br>R2 interface: <code>ip ospf network point-to-point</code><br><br>This is a subtle bug. Both routers will form adjacency up to FULL — but routing will be broken. On broadcast, R1 expects DR/BDR election. On P2P, R2 doesn\'t participate in DR/BDR election and sends Hellos every 10 sec to 224.0.0.5.<br><br>Symptoms: Neighbor shows FULL but routes are missing or incorrect.',
      cli:'', rfc:'RFC 2328 §8.1 — Network type affects Hello intervals, DR election, neighbor discovery', pktType:null, pktFields:null
    },
    {
      title: 'Step 2 — Hellos Work but Network Type Diverges',
      log:   'Hellos succeed — but subnet advertised incorrectly',
      from:'R1', targets:['R2'], pktType:'Hello',
      states:{ R1:'Full', R2:'Full' }, roles:{},
      desc: '<b>Neighbors reach FULL</b> — this is what makes this bug hard to catch.<br><br>However:<br>• R2 (P2P) advertises the connected subnet as a /32 host route<br>• R1 (Broadcast) advertises it as the full subnet prefix<br>• Routes may appear in the table but traffic is affected<br>• DR election may stall (R2 ignores it)<br><br>Fix: Match the network type on both sides.',
      cli:'! Problem — subnet advertised as /32 by P2P side:\nshow ip ospf database router\n! R2 link type 1 (P2P) vs R1 link type 2 (Transit)\n\n! Fix:\nR2(config-if)# ip ospf network broadcast\n! OR:\nR1(config-if)# ip ospf network point-to-point',
      rfc:'RFC 2328 §8.1',
      pktFields:[
        {f:'R1 Network Type', v:'Broadcast',     n:'⚠ Expects DR/BDR, Hi=10, Di=40'},
        {f:'R2 Network Type', v:'Point-to-Point', n:'⚠ No DR/BDR, Hi=10, Di=40'},
        {f:'Adjacency',       v:'Forms (FULL)',   n:'Neighbors reach Full state'},
        {f:'Routing',         v:'Broken',         n:'Subnet advertised differently by each side'}
      ]
    }
  ]
};


/* ╔══════════════════════════════════════════════════════════════════╗
   ║  OSPF SIMULATOR · Phase 3 : DR/BDR Election                     ║
   ║  Interactive · 2–6 Routers · Priority Sliders · All Scenarios   ║
   ╚══════════════════════════════════════════════════════════════════╝ */

/* ═══════════════════════════════════════════════════════
   DR STATE
   ═══════════════════════════════════════════════════════ */
let drCanvas, drCtx;
let drAnimId   = null;
let drStepMax  = 0;
let drPlaying  = false;
let drTimer    = null;
let drSpeedMs  = 4000;   // 4 s per step at 1× speed
let drScenario = 'normal';
let drLog      = [];
let drPktAnim  = null;     // {from, to, type, t, color}

// Router table — built by drBuildRouters()
let drRouters  = [];

/* ─── scenario presets ─── */
const DR_SCENARIOS = {
  normal:  { label:'Normal Election',        desc:'Standard 4-router broadcast. Highest priority wins DR, second-highest wins BDR.',          routers:[{id:'R1',pri:1,rid:'1.1.1.1',ip:'192.168.1.1'},{id:'R2',pri:100,rid:'2.2.2.2',ip:'192.168.1.2'},{id:'R3',pri:50,rid:'3.3.3.3',ip:'192.168.1.3'},{id:'R4',pri:1,rid:'4.4.4.4',ip:'192.168.1.4'}] },
  tiebreak:{ label:'Priority Tie → RID Wins',desc:'R1 and R2 both have priority 1. Router-ID tiebreak: highest RID (4.4.4.4) wins DR.',       routers:[{id:'R1',pri:1,rid:'1.1.1.1',ip:'192.168.1.1'},{id:'R2',pri:1,rid:'2.2.2.2',ip:'192.168.1.2'},{id:'R3',pri:1,rid:'3.3.3.3',ip:'192.168.1.3'},{id:'R4',pri:1,rid:'4.4.4.4',ip:'192.168.1.4'}] },
  pri0:    { label:'Priority 0 = Never DR',  desc:'R2 has priority=0 so it can NEVER become DR or BDR, even if it has the highest RID.',       routers:[{id:'R1',pri:1,rid:'1.1.1.1',ip:'192.168.1.1'},{id:'R2',pri:0,rid:'2.2.2.2',ip:'192.168.1.2'},{id:'R3',pri:1,rid:'3.3.3.3',ip:'192.168.1.3'}] },
  nopreempt:{ label:'Non-Preemptive Rule',   desc:'R1(pri=200) joins AFTER election. R2(pri=100) stays DR — election is NON-preemptive.',      routers:[{id:'R2',pri:100,rid:'2.2.2.2',ip:'192.168.1.2'},{id:'R3',pri:50,rid:'3.3.3.3',ip:'192.168.1.3'},{id:'R4',pri:1,rid:'4.4.4.4',ip:'192.168.1.4'},{id:'R1',pri:200,rid:'1.1.1.1',ip:'192.168.1.1',late:true}] },
  drfail:  { label:'DR Failure → BDR Promotes', desc:'DR goes down. BDR immediately becomes DR. New BDR election runs.',                    routers:[{id:'R1',pri:1,rid:'1.1.1.1',ip:'192.168.1.1'},{id:'R2',pri:100,rid:'2.2.2.2',ip:'192.168.1.2'},{id:'R3',pri:50,rid:'3.3.3.3',ip:'192.168.1.3'},{id:'R4',pri:1,rid:'4.4.4.4',ip:'192.168.1.4'}] },
  custom:  { label:'Custom (Edit Below)',     desc:'Drag the sliders to set any priority on any router and watch the election outcome change.', routers:[{id:'R1',pri:1,rid:'1.1.1.1',ip:'192.168.1.1'},{id:'R2',pri:1,rid:'2.2.2.2',ip:'192.168.1.2'},{id:'R3',pri:1,rid:'3.3.3.3',ip:'192.168.1.3'}] },
};

/* ═══════════════════════════════════════════════════════
   ENTRY POINT
   ═══════════════════════════════════════════════════════ */
function ospfDrInit() {
  const host = document.getElementById('ospf-dr-container');
  if (!host) { console.error('OSPF Phase 3: #ospf-dr-container missing'); return; }
  host.innerHTML = drBuildHTML();
  drCanvas = document.getElementById('drCanvas');
  drCtx    = drCanvas.getContext('2d');

  // Load scenario data (builds steps + populates controls) BEFORE any draw call.
  drLoadScenario('normal');

  // Prevent listener stacking on repeated page visits.
  window.removeEventListener('resize', drResize);
  window.addEventListener('resize', drResize);

  // Defer first resize/draw so flex layout has settled and clientWidth is non-zero.
  requestAnimationFrame(() => { drResize(); });
}

/* ═══════════════════════════════════════════════════════
   HTML
   ═══════════════════════════════════════════════════════ */
   function drBuildHTML() {
    return `
  <style>
  .dr-wrap{font-family:'IBM Plex Mono',monospace;background:#0a0f1e;color:#e2e8f0;border-radius:14px;padding:18px;border:1px solid #1e293b;user-select:none;box-shadow:0 8px 40px rgba(0,0,0,.6);}
  .dr-topbar{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;align-items:center}
  .dr-title{font-size:14px;font-weight:700;color:#38bdf8}
  .dr-scen-row{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px}
  .dr-scen-btn{padding:5px 13px;border-radius:6px;border:1px solid #1e293b;background:#111827;color:#64748b;font-size:11px;font-family:'IBM Plex Mono',monospace;cursor:pointer;transition:all .18s}
  .dr-scen-btn:hover{border-color:#3b82f6;color:#93c5fd}
  .dr-scen-btn.active{background:linear-gradient(135deg,#0f2a52,#112244);border-color:#3b82f6;color:#93c5fd;font-weight:700;box-shadow:0 0 12px rgba(59,130,246,.25);}
  .dr-desc-bar{font-size:11px;color:#8aa3c5;background:#0d1526;border-radius:7px;padding:8px 12px;margin-bottom:14px;border:1px solid #1a2640;line-height:1.6}
  .dr-desc-bar b{color:#e2e8f0}
  
  /* ── split layout ────────────────────────────── */
  .dr-app-body { display: flex; gap: 20px; align-items: flex-start; }
  .dr-col-left { flex: 1.25; min-width: 0; display: flex; flex-direction: column; gap: 14px;}
  .dr-col-right { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 14px; }
  
  .dr-canvas-wrap{background:#04080f;border-radius:12px;overflow:hidden;border:1px solid #1a2640;position:relative;box-shadow:inset 0 2px 20px rgba(0,0,0,.4);}
  #drCanvas{display:block;width:100%;height:auto}
  
  /* Control bar */
  .dr-ctrl-bar{
    display:flex; align-items:center; justify-content:center; gap:10px; flex-wrap:wrap;
    padding:12px 16px; background:#0d1526; border-radius:10px; border:1px solid #1a2640;
  }
  .dr-cb{
    background:#0d1829; border:1px solid #1e3050; color:#94a3b8; width:44px; height:44px; border-radius:10px;
    cursor:pointer; font-size:16px; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:all .2s; position:relative;
  }
  .dr-cb::after{
    content:attr(data-label); position:absolute; bottom:-20px; left:50%; transform:translateX(-50%);
    font-size:9px; color:#3b5278; white-space:nowrap; font-family:'IBM Plex Mono',monospace; letter-spacing:.5px; pointer-events:none;
  }
  .dr-cb:hover{background:#0f1f3a;border-color:#3b82f6;color:#7cb9ff;transform:translateY(-1px)}
  .dr-cb.on{
    background:linear-gradient(135deg,#0a2515,#0d2a1a); border-color:#22c55e; color:#22c55e; box-shadow:0 0 14px rgba(34,197,94,.3);
  }
  .dr-cb.dr-play-btn{
    width:52px; height:52px; font-size:20px; border-radius:50%; border-color:#3b82f6; color:#3b82f6; box-shadow:0 0 14px rgba(59,130,246,.2);
  }
  .dr-cb.dr-play-btn:hover{box-shadow:0 0 20px rgba(59,130,246,.4); color:#7cb9ff; transform:translateY(-2px) scale(1.05);}
  .dr-cb.dr-play-btn.on{border-color:#22c55e; color:#22c55e; box-shadow:0 0 20px rgba(34,197,94,.4);}
  .dr-ctrl-divider{width:1px;height:32px;background:#1a2640;margin:0 4px;}
  
  /* Speed Slider */
  .dr-spd{display:flex;align-items:center;gap:8px;}
  .dr-spd input[type=range]{width:90px;height:4px;appearance:none;background:#1a2640;border-radius:2px;cursor:pointer;outline:none;}
  .dr-spd input[type=range]::-webkit-slider-thumb{appearance:none;width:14px;height:14px;border-radius:50%;background:#3b82f6;cursor:pointer;box-shadow:0 0 8px rgba(59,130,246,.5);transition:transform .15s;}
  .dr-spd input[type=range]::-webkit-slider-thumb:hover{transform:scale(1.2)}
  
  /* Info Panels */
  .dr-panel{background:#0d1526; border-radius:10px; padding:16px; border:1px solid #1a2640; display:flex; flex-direction:column;}
  .dr-panel-title{font-size:9.5px; color:#2c4470; text-transform:uppercase; letter-spacing:1px; margin-bottom:12px; font-weight:700; display:flex; align-items:center; gap:6px;}
  .dr-panel-title::before{content:'';display:inline-block;width:3px;height:12px;background:#3b82f6;border-radius:2px}
  
  .dr-info-title{font-size:13px;font-weight:700;color:#60b8ff;margin-bottom:10px;line-height:1.4}
  .dr-info-body{font-size:11px;color:#8aa3c5;line-height:1.8;margin-bottom:10px;font-family:'DM Sans',sans-serif;}
  .dr-info-cli{font-size:10px;color:#4ade80;background:#050c1a;border-left:3px solid #22c55e;padding:10px 12px;border-radius:7px;white-space:pre-wrap;margin-top:8px;line-height:1.7;box-shadow:inset 0 1px 8px rgba(0,0,0,.3);}
  .dr-rule-box{background:rgba(56,217,192,0.06);border:1px solid rgba(56,217,192,0.2);border-radius:7px;padding:10px 12px;margin-top:10px;font-size:11px;color:#94a3b8;line-height:1.7}
  .dr-rule-box b{color:#38d9c0}

  /* Router config rows */
  .dr-rtr-row{display:flex;align-items:center;gap:8px;margin-bottom:8px;padding:7px 9px;border-radius:7px;background:#060d1a;border:1px solid #1e293b;transition:border-color .2s}
  .dr-rtr-row:hover{border-color:#334155}
  .dr-rtr-badge{width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;flex-shrink:0}
  .dr-rtr-pri-wrap{flex:1}
  .dr-rtr-pri-lbl{font-size:9px;color:#475569;display:flex;justify-content:space-between;margin-bottom:2px}
  .dr-pri-slider{width:100%;accent-color:#3b82f6;cursor:pointer}
  .dr-rtr-role-badge{font-size:9px;font-weight:700;padding:2px 7px;border-radius:4px;min-width:52px;text-align:center;flex-shrink:0}
  .dr-add-btn{padding:5px 12px;border-radius:6px;border:1px solid rgba(56,217,192,0.3);background:rgba(56,217,192,0.07);color:#38d9c0;font-size:10px;font-family:'IBM Plex Mono',monospace;cursor:pointer;transition:all .15s}
  .dr-add-btn:hover{background:rgba(56,217,192,0.14)}
  
  /* Result table */
  .dr-result-tbl{width:100%;border-collapse:collapse;font-size:10.5px;}
  .dr-result-tbl th{background:#060d1a;color:#2c4470;padding:6px 10px;text-align:left;font-weight:700;border-bottom:1px solid #1a2640;font-size:9.5px;text-transform:uppercase;letter-spacing:.5px}
  .dr-result-tbl td{padding:5px 10px;border-bottom:1px solid #080e1c;vertical-align:middle}
  
  /* Log */
  .dr-log{max-height:170px;overflow-y:auto;display:flex;flex-direction:column;gap:4px;scrollbar-width:thin;scrollbar-color:#1a2640 transparent;}
  .dr-log::-webkit-scrollbar{width:4px}
  .dr-log::-webkit-scrollbar-track{background:transparent}
  .dr-log::-webkit-scrollbar-thumb{background:#1a2640;border-radius:2px}
  .dr-log-item{font-size:10px;padding:5px 10px;border-radius:6px;background:#060d1a;border-left:3px solid #1a2640;color:#3b5278;line-height:1.4;}
  .dr-log-item.cur{border-left-color:#3b82f6;color:#c4ddff;background:#0a1e38;box-shadow:0 0 10px rgba(59,130,246,.12);}
  .dr-log-item.dr-ev{border-left-color:#22c55e;}
  
  @media(max-width:960px){
    .dr-app-body { flex-direction: column; }
  }
  </style>
  
  <div class="dr-wrap">
    <div class="dr-topbar">
      <span class="dr-title">🗳 DR / BDR Election Simulator</span>
      <span style="font-size:10px;color:#475569;margin-left:4px">RFC 2328 §9.4</span>
    </div>
  
    <div class="dr-scen-row" id="drScenRow"></div>
    <div class="dr-desc-bar" id="drDescBar"></div>
  
    <div class="dr-app-body">
      
      <div class="dr-col-left">
        <div class="dr-canvas-wrap">
          <canvas id="drCanvas" width="680" height="360"></canvas>
        </div>
  
        <div class="dr-ctrl-bar">
          <button class="dr-cb" id="drBtnReset" title="Reset to beginning" data-label="RESET" onclick="drReset()">⏮</button>
          <button class="dr-cb" id="drBtnPrev"  title="Previous step"      data-label="PREV" onclick="if(drPlaying)drTogglePlay(); drGo(-1)">◀</button>
          <button class="dr-cb dr-play-btn" id="drBtnPlay" title="Play / Pause" data-label="PLAY" onclick="drTogglePlay()">▶</button>
          <button class="dr-cb" id="drBtnNext"  title="Next step"          data-label="NEXT" onclick="if(drPlaying)drTogglePlay(); drGo(1)">▶|</button>
          <div class="dr-ctrl-divider"></div>
          <div class="dr-spd">
            <span style="font-size:10px;color:#3b5278;text-transform:uppercase;letter-spacing:.8px;font-weight:700">Speed</span>
            <span style="font-size:9px;color:#2c4470">Slow</span>
            <input type="range" id="drSpd" min="0.1" max="3" step="0.1" value="1" oninput="drSetSpeed(this.value)">
            <span style="font-size:9px;color:#2c4470">Fast</span>
            <span id="drSpdLbl" style="font-size:11px;color:#7cb9ff;font-weight:700;min-width:28px;text-align:center;">1×</span>
          </div>
          <div class="dr-ctrl-divider"></div>
          <span class="dr-snum" id="drSNum" style="font-size:11px;color:#3b5278;font-weight:700;white-space:nowrap;">Step 0 / 0</span>
        </div>
  
        <div class="dr-panel">
          <div class="dr-panel-title">Router Priorities (Live Edit)
            <span style="margin-left:auto;display:flex;gap:5px">
              <button class="dr-add-btn" onclick="drAddRouter()">+ Add</button>
              <button class="dr-add-btn" style="border-color:rgba(239,68,68,0.3);background:rgba(239,68,68,0.07);color:#f87171" onclick="drRemoveRouter()">− Remove</button>
            </span>
          </div>
          <div id="drRtrConfig"></div>
        </div>
      </div>
  
      <div class="dr-col-right">
        <div class="dr-panel">
          <div class="dr-panel-title">Step Detail</div>
          <div class="dr-info-title" id="drInfoTitle">Press ▶ Run Election to begin</div>
          <div class="dr-info-body"  id="drInfoBody">Choose a scenario above or customize router priorities with the sliders. Then click Play to watch the DR/BDR algorithm execute.</div>
          <div class="dr-info-cli"   id="drInfoCli"  style="display:none"></div>
          <div class="dr-rule-box"   id="drRuleBox"  style="display:none"></div>
        </div>
  
        <div class="dr-panel" style="padding-bottom:2px;">
          <div class="dr-panel-title">Election Result</div>
          <table class="dr-result-tbl">
            <thead><tr><th>Router</th><th>Priority</th><th>RID</th><th>Role</th></tr></thead>
            <tbody id="drResultTbl"></tbody>
          </table>
        </div>
  
        <div class="dr-panel" style="flex:1;">
          <div class="dr-panel-title">Election Log</div>
          <div class="dr-log" id="drLog"></div>
        </div>
      </div>
  
    </div>
  </div>`;
  }

/* ═══════════════════════════════════════════════════════
   SCENARIO LOAD
   ═══════════════════════════════════════════════════════ */
function drLoadScenario(key) {
  drScenario = key;
  const sc   = DR_SCENARIOS[key];
  // Deep-copy routers so sliders can mutate without affecting preset
  drRouters  = sc.routers.map(r => ({ ...r }));

  // Render scenario buttons
  const row = document.getElementById('drScenRow');
  row.innerHTML = Object.entries(DR_SCENARIOS).map(([k,s]) =>
    `<button class="dr-scen-btn${k===key?' active':''}" onclick="drLoadScenario('${k}')">${s.label}</button>`
  ).join('');

  document.getElementById('drDescBar').innerHTML = `<b>${sc.label}:</b> ${sc.desc}`;
  drBuildRtrConfig();
  drReset();
}

/* ═══════════════════════════════════════════════════════
   ROUTER CONFIG PANEL
   ═══════════════════════════════════════════════════════ */
function drBuildRtrConfig() {
  const wrap = document.getElementById('drRtrConfig');
  wrap.innerHTML = drRouters.map((r, i) => `
    <div class="dr-rtr-row" id="drRtrRow_${i}">
      <div class="dr-rtr-badge" style="background:${drRtrColor(i)}22;border:1.5px solid ${drRtrColor(i)}88;color:${drRtrColor(i)}">${r.id}</div>
      <div class="dr-rtr-pri-wrap">
        <div class="dr-rtr-pri-lbl">
          <span style="color:${drRtrColor(i)}">${r.id} · ${r.rid}</span>
          <span id="drPriVal_${i}" style="color:${r.pri===0?'#ef4444':'#e2e8f0'}">${r.pri===0?'Pri=0 (never DR)':'Pri='+r.pri}</span>
        </div>
        <input type="range" class="dr-pri-slider" min="0" max="255" value="${r.pri}"
          oninput="drUpdatePri(${i},this.value)">
      </div>
      <div class="dr-rtr-role-badge" id="drRoleBadge_${i}" style="background:#1e293b;color:#475569">—</div>
    </div>
  `).join('');
}

function drUpdatePri(idx, val) {
  drRouters[idx].pri = parseInt(val);
  const lbl = document.getElementById('drPriVal_'+idx);
  lbl.textContent = val==0 ? 'Pri=0 (never DR)' : 'Pri='+val;
  lbl.style.color = val==0 ? '#ef4444' : '#e2e8f0';
  // If we're in custom mode, recalculate live
  if (drScenario === 'custom') drReset();
}

function drAddRouter() {
  if (drRouters.length >= 6) return;
  const n = drRouters.length + 1;
  const ids = ['R1','R2','R3','R4','R5','R6'];
  const rid = `${n}.${n}.${n}.${n}`;
  drRouters.push({ id: ids[drRouters.length] || 'R'+n, pri:1, rid, ip:`192.168.1.${n}` });
  drBuildRtrConfig(); drReset();
}

function drRemoveRouter() {
  if (drRouters.length <= 2) return;
  drRouters.pop();
  drBuildRtrConfig(); drReset();
}

function drRtrColor(i) {
  return ['#3b82f6','#22c55e','#f59e0b','#8b5cf6','#ef4444','#06b6d4'][i % 6];
}

/* ═══════════════════════════════════════════════════════
   ELECTION ALGORITHM
   ═══════════════════════════════════════════════════════ */
function drElect(routers) {
  // Eligible = priority > 0
  const eligible = routers.filter(r => r.pri > 0);
  // Sort by priority desc, then RID desc
  const sorted = [...eligible].sort((a,b) => {
    if (b.pri !== a.pri) return b.pri - a.pri;
    return drRidNum(b.rid) - drRidNum(a.rid);
  });
  const dr  = sorted[0] || null;
  const bdr = sorted[1] || null;
  return { dr, bdr };
}

function drRidNum(rid) {
  return rid.split('.').reduce((acc,o) => acc*256 + parseInt(o), 0);
}

/* ═══════════════════════════════════════════════════════
   STEP DATA BUILDER
   ═══════════════════════════════════════════════════════ */
let drSteps = [];
let drCurrentStep = 0;

function drBuildSteps() {
  drSteps = [];
  const rtrs    = drRouters;
  // For the non-preempt scenario, the late-joining router is NOT present at initial election
  const initialRtrs = drScenario === 'nopreempt' ? rtrs.filter(r => !r.late) : rtrs;
  const { dr, bdr } = drElect(initialRtrs);
  const drId    = dr  ? dr.id  : null;
  const bdrId   = bdr ? bdr.id : null;
  const eligible = initialRtrs.filter(r => r.pri > 0).map(r=>r.id);

  // Neutral roles
  const noRoles = {};
  initialRtrs.forEach(r => noRoles[r.id] = 'DROther');
  // late routers shown as Down during initial steps
  rtrs.filter(r => r.late).forEach(r => noRoles[r.id] = 'Down');

  const finalRoles = {};
  rtrs.forEach(r => {
    finalRoles[r.id] = r.id === drId ? 'DR' : r.id === bdrId ? 'BDR' : r.late ? 'DROther' : 'DROther';
  });

  // ─ Step 0: All Down ─
  const downStates = {};
  rtrs.forEach(r => downStates[r.id] = 'Down');
  drSteps.push({
    title: 'All Routers Start — Down State',
    body:  'All routers have OSPF enabled but no Hello packets have been exchanged yet. Everyone is in <b>Down</b> state. OSPF process has started on each router.',
    cli:   '',
    rule:  '',
    roles: { ...downStates }, states: { ...downStates },
    pkt:   null,
  });

  // ─ Step 0b: Wait Interval ─
  drSteps.push({
    title: 'Wait Interval — Listening for Existing DR/BDR',
    body:  `Before starting the election, each router enters a <b>Wait Interval</b> equal to the Dead Interval (default <b>40 seconds</b>). During this time, routers listen to Hello packets to see if a DR and BDR are already announced on the segment.<br><br><b>Why wait?</b> If there is already a DR/BDR (e.g. after a reload), routers should accept them rather than start a new election and disrupt the network. Only if no DR/BDR announcements are heard during the Wait Interval does the router proceed to elect.<br><br><b>Wait can be cut short</b> if a router receives a Hello advertising a valid DR/BDR — in that case, the WaitTimer event fires early and election begins immediately.`,
    cli:   `show ip ospf interface Gi0/0\n! Wait interval: 40 sec\n! Timer intervals configured: Hello 10, Dead 40, Wait 40, Retransmit 5`,
    rule:  `<b>RFC 2328 §9.4 — WaitTimer:</b> If no DR/BDR seen within the Wait Interval, fire the WaitTimer event and begin the election algorithm.`,
    roles: { ...downStates }, states: { ...downStates },
    pkt:   null,
  });

  // ─ Step 1: Hello exchange / Init→2Way ─
  // For nopreempt: late router is still Down at this point
  const twoWayStates = {};
  initialRtrs.forEach(r => twoWayStates[r.id] = '2-Way');
  rtrs.filter(r => r.late).forEach(r => twoWayStates[r.id] = 'Down');
  drSteps.push({
    title: 'Hello Exchange — All Reach 2-Way',
    body:  `All routers send Hello packets to <b>224.0.0.5</b> (AllSPFRouters). Each Hello carries the router's <b>Priority</b> and <b>Router-ID</b>. After exchanging Hellos, every router has heard from all neighbors — everyone moves to <b>2-Way</b> state.<br><br>At 2-Way, the DR/BDR election algorithm runs.`,
    cli:   `show ip ospf interface Gi0/0\n! All: DR=0.0.0.0, BDR=0.0.0.0 — election pending`,
    rule:  `<b>Election fires at 2-Way state.</b> Each router independently runs the same algorithm and reaches the same conclusion — no negotiation needed.`,
    roles: { ...noRoles }, states: { ...twoWayStates },
    pkt:   { from: initialRtrs[0].id, type:'Hello', multi:true },
  });

  // ─ Step 2: Show priority 0 routers excluded (if any) ─
  const zeroPriRtrs = initialRtrs.filter(r => r.pri === 0);
  if (zeroPriRtrs.length > 0) {
    drSteps.push({
      title: `Priority 0 Routers Excluded: ${zeroPriRtrs.map(r=>r.id).join(', ')}`,
      body:  `${zeroPriRtrs.map(r=>`<b>${r.id}</b> (priority=0)`).join(', ')} ${zeroPriRtrs.length===1?'is':'are'} excluded from DR/BDR candidacy. Priority=0 means "I will never be DR or BDR." This is commonly set on routers that should always be DROther — for example, stub routers or routers with limited CPU.<br><br>Eligible routers: <b>${eligible.join(', ')}</b>`,
      cli:   `ip ospf priority 0  ! on ${zeroPriRtrs[0].id}'s interface\n! This router can never become DR or BDR`,
      rule:  `<b>RFC 2328 §9.4:</b> A router with priority 0 is not eligible to become DR or BDR. It participates in Hello exchange but does not enter the candidate pool.`,
      roles: { ...noRoles }, states: { ...twoWayStates },
      pkt:   null,
    });
  }

  // ─ Step 3: BDR election ─
  const bdrRoles = {};
  rtrs.forEach(r => bdrRoles[r.id] = r.late ? 'Down' : 'DROther');
  if (bdrId) bdrRoles[bdrId] = 'BDR';
  drSteps.push({
    title: `BDR Election → ${bdrId||'None'} Elected`,
    body:  bdr
      ? `BDR election runs first. Eligible candidates sorted by priority then RID:<br><br>${
          eligible.map(id => {
            const r = initialRtrs.find(x=>x.id===id);
            return `• <b>${r.id}</b> — Priority ${r.pri}, RID ${r.rid}`;
          }).join('<br>')
        }<br><br><b>${bdrId}</b> wins BDR with Priority=${bdr.pri}, RID=${bdr.rid}.`
      : `Only one eligible router — no BDR can be elected.`,
    cli:   `show ip ospf neighbor\n! ${bdrId||'—'} shows: BDR role`,
    rule:  `<b>BDR = second-highest priority.</b> Tie → highest Router-ID wins. BDR is elected FIRST so it can immediately promote if DR fails.`,
    roles: { ...bdrRoles }, states: { ...twoWayStates },
    pkt:   null,
  });

  // ─ Step 4: DR election ─
  const drRoles2 = { ...bdrRoles };
  if (drId) drRoles2[drId] = 'DR';
  drSteps.push({
    title: `DR Election → ${drId||'None'} Elected`,
    body:  dr
      ? `DR election runs from the same eligible pool. <b>${drId}</b> has the highest priority (${dr.pri}) ${bdr&&dr.pri===bdr.pri?'— tied on priority, RID wins':''}.<br><br>Final result:<br>• <b>DR = ${drId}</b> (Priority ${dr.pri}, RID ${dr.rid})<br>• <b>BDR = ${bdrId||'None'}</b>${bdrId?` (Priority ${bdr.pri}, RID ${bdr.rid})`:''}<br>• <b>DROther = ${initialRtrs.filter(r=>r.id!==drId&&r.id!==bdrId).map(r=>r.id).join(', ')||'None'}</b>`
      : `No eligible routers — no DR elected.`,
    cli:   `show ip ospf interface Gi0/0\n! Designated Router (ID) ${dr?.rid||'—'}\n! Backup Designated Router (ID) ${bdr?.rid||'—'}`,
    rule:  `<b>DR = highest priority, then highest RID.</b> DR is elected AFTER BDR. This order ensures BDR is always elected from the same pool before the top candidate is promoted.`,
    roles: { ...drRoles2 }, states: { ...twoWayStates },
    pkt:   null,
  });

  // ─ Step 5: Adjacency formation ─
  const adjStates = {};
  rtrs.forEach(r => {
    if (r.late) { adjStates[r.id] = 'Down'; return; }
    adjStates[r.id] = r.id === drId || r.id === bdrId ? 'Full' : '2-Way';
  });
  // First non-late, non-DR router to use as LSU sender (avoid sending from DR itself)
  const lsuSender = initialRtrs.find(r => r.id !== drId) || initialRtrs[0];
  drSteps.push({
    title: 'Full Adjacency Forms with DR and BDR',
    body:  `DROthers form <b>Full</b> adjacency ONLY with DR and BDR — not with each other. DROther↔DROther stays at <b>2-Way</b>.<br><br>Adjacency count with DR/BDR: <b>${eligible.length >= 2 ? 2*(eligible.length-2)+1 : 0} Full</b> (vs ${Math.round(eligible.length*(eligible.length-1)/2)} without DR/BDR).<br><br><b>LSU flooding path:</b> DROther → <b>224.0.0.6</b> (AllDRRouters) → DR re-floods → <b>224.0.0.5</b> (all routers).`,
    cli:   `show ip ospf neighbor\n${initialRtrs.map(r=>`! ${r.id}: ${r.id===drId?'FULL/DR':r.id===bdrId?'FULL/BDR':'2WAY/DROther'}`).join('\n')}`,
    rule:  `<b>This is the whole point of DR/BDR</b> — reducing adjacencies from n(n-1)/2 to n-1. On a 6-router segment: 15 full adjacencies → only 5.`,
    roles: { ...finalRoles }, states: { ...adjStates },
    pkt:   null,
    twoHop: (drId && lsuSender) ? { from: lsuSender.id, dr: drId } : null,
  });

  // ─ Step 5b: Post-election Hello carrying DR/BDR fields ─
  if (drId) {
    drSteps.push({
      title: `Post-Election Hello — DR/BDR Fields Now Populated`,
      body:  `After election, every Hello on this segment carries the elected DR and BDR IP addresses. This is how routers that join <i>later</i> instantly learn who the DR/BDR are without running the full election — they see the DR/BDR fields in the first Hello they receive and accept those values.<br><br><b>Hello from ${drId} now includes:</b><br>• DR = ${dr?.ip || drId}<br>• BDR = ${bdr?.ip || bdrId || '0.0.0.0'}<br><br>Any router receiving this Hello with a valid DR field present will skip the Wait Interval and accept the existing DR/BDR immediately.`,
      cli:   `debug ip ospf hello\n! OSPF: Send hello to 224.0.0.5 area 0 on Gi0/0\n! Designated Router: ${dr?.ip || '(DR IP)'}\n! Backup Designated Router: ${bdr?.ip || '0.0.0.0'}`,
      rule:  `<b>RFC 2328 §9.5 — Hello packet DR/BDR fields:</b> Used by joining routers to discover existing DR/BDR and skip election. This makes OSPF convergence faster on stable segments.`,
      roles: { ...finalRoles }, states: { ...adjStates },
      pkt:   { from: drId, type:'Hello', multi: true },
    });
  }

  // ─ Step 5c: DR generates Network LSA (Type 2) ─
  if (drId) {
    drSteps.push({
      title: `DR Generates Type-2 Network LSA`,
      body:  `The DR's primary function beyond reducing adjacencies is to generate the <b>Type-2 Network LSA</b> for this broadcast segment. This LSA:<br><br>• <b>Link State ID</b> = DR's interface IP address<br>• <b>Advertising Router</b> = DR's Router-ID (${dr?.rid || drId})<br>• <b>Attached Routers</b> = list of all routers with Full adjacency<br><br>The Network LSA tells the rest of the OSPF domain that this broadcast segment exists and who is attached to it. Without it, other areas cannot see this transit network in their LSDB.<br><br>The DR floods it to <b>224.0.0.5</b> (AllSPFRouters) so all attached routers install it.`,
      cli:   `show ip ospf database network\n! Net Link States (Area 0)\n!  Link ID: ${dr?.ip || '(DR IP)'}\n!  ADV Router: ${dr?.rid || drId}\n!  Network Mask: ${initialRtrs[0]?.mask || '/24'}\n!  Attached Router: ${initialRtrs.map(r=>r.rid||r.id).join('\n!  Attached Router: ')}`,
      rule:  `<b>RFC 2328 §12.4.2 — Type-2 Network LSA:</b> Only the DR generates this. If the DR fails and a new DR is elected, the new DR immediately originates a new Network LSA and the old one is flushed (MaxAge).`,
      roles: { ...finalRoles }, states: { ...adjStates },
      pkt:   { from: drId, type:'LSU', multi: true },
    });
  }

  // ─ Scenario-specific extra steps ─
  if (drScenario === 'nopreempt') {
    // Step 6: Late high-priority router joins
    const lateIdx = drRouters.findIndex(r=>r.late);
    if (lateIdx >= 0) {
      const lateR = drRouters[lateIdx];
      drSteps.push({
        title: `${lateR.id} Joins Late (Priority=${lateR.pri}) — NO Preemption`,
        body:  `<b>${lateR.id}</b> (Priority=${lateR.pri}) joins the segment AFTER DR/BDR have already been elected. Even though ${lateR.id} has a higher priority than the current DR, <b>the election does NOT re-run.</b><br><br>The current DR keeps its role. ${lateR.id} becomes a DROther. This is the <b>non-preemptive</b> nature of OSPF DR election.`,
        cli:   `! To force re-election:\nclear ip ospf process  ! on all routers\n! This is disruptive — avoid in production`,
        rule:  `<b>RFC 2328 §9.4 — Non-preemptive:</b> Once a DR is elected, it keeps its role until it fails or the OSPF process is restarted. A higher-priority router joining later does NOT trigger a new election.`,
        roles: { ...finalRoles, [lateR.id]:'DROther' },
        states:{ ...adjStates,   [lateR.id]:'2-Way' },
        pkt:   null,
      });
    }
  }

  if (drScenario === 'drfail') {
    // Step A: DR fails — Dead Timer expires
    const failStates = { ...adjStates };
    const failRoles  = { ...finalRoles };
    if (drId) { failStates[drId] = 'Down'; failRoles[drId] = 'Down'; }
    drSteps.push({
      title: `DR Failure — ${drId} Dead Timer Expires`,
      body:  `The Dead Timer for <b>${drId}</b> (DR) has reached zero — no Hello has been received in 40 seconds. All other routers declare ${drId} as <b>Down</b> and remove it from their neighbor tables.<br><br><b>The BDR detects this immediately</b> — it was already monitoring the DR. The BDR starts a short timer (equal to one Hello interval) and waits to see if any other router asserts the DR role. Since none do, the BDR promotes itself.`,
      cli:   `! %OSPF-5-ADJCHG: Process 1, Nbr ${dr?.rid||drId} on Gi0/0\n!   from FULL to DOWN, Dead timer expired\n\nshow ip ospf neighbor\n! ${drId}: DEAD — removed from neighbor table`,
      rule:  `<b>RFC 2328 §9.5 — Dead Interval:</b> Default 4× Hello Interval. Reduce with BFD for sub-second failure detection: "ip ospf bfd" + "bfd interval 50 min_rx 50 multiplier 3"`,
      roles: { ...failRoles }, states: { ...failStates },
      pkt:   null,
    });

    // Step B: BDR → DR crown transfer (visual promotion moment)
    const crownRoles  = {};
    const crownStates = {};
    rtrs.forEach(r => {
      if (r.id === drId)  { crownRoles[r.id] = 'Down';    crownStates[r.id] = 'Down';  return; }
      if (r.id === bdrId) { crownRoles[r.id] = 'DR';      crownStates[r.id] = 'Full';  return; }
      crownRoles[r.id] = 'DROther'; crownStates[r.id] = '2-Way';
    });
    const remaining = rtrs.filter(r => r.id !== drId && r.id !== bdrId && r.pri > 0);
    const { dr: newBDR } = drElect(remaining);
    if (newBDR) { crownRoles[newBDR.id] = 'BDR'; crownStates[newBDR.id] = 'Full'; }

    drSteps.push({
      title: `👑 BDR Promotes → ${bdrId} Becomes New DR`,
      body:  `<b>${bdrId}</b> (former BDR) immediately promotes itself to <b>DR</b> — no election needed, no negotiation. This is instantaneous because the BDR was already maintaining Full adjacency with all DROthers.<br><br>Simultaneously, a new BDR election runs from the remaining DROthers. <b>${newBDR?.id||'None'}</b> wins with Priority=${newBDR?.pri||'—'}, RID=${newBDR?.rid||'—'}.<br><br><b>Why this is fast:</b> The BDR existed precisely for this moment. No Wait Interval. No Hello exchange. The promotion fires the instant the BDR decides the DR is gone.`,
      cli:   `! %OSPF-5-ADJCHG: Neighbor Change Event — BDR becomes DR\nshow ip ospf interface Gi0/0\n! Process 1, Area 0.0.0.0\n! Designated Router (ID) ${bdr?.rid||bdrId}\n! Backup Designated Router (ID) ${newBDR?.rid||'—'}`,
      rule:  `<b>RFC 2328 §9.4 — BDR Promotion:</b> The BDR declares itself DR if the DR becomes unavailable. This is non-negotiated and immediate — the BDR simply sets its own role flag.`,
      roles: { ...crownRoles }, states: { ...crownStates },
      pkt:   bdrId ? { from: bdrId, type:'Hello', multi: true } : null,
      crownTransfer: true,   // flag picked up by drDraw for special visual effect
    });

    // Step C: New DR floods updated Network LSA
    drSteps.push({
      title: `New DR Floods Updated Network LSA to 224.0.0.5`,
      body:  `<b>${bdrId}</b> (new DR) immediately originates a new <b>Type-2 Network LSA</b> reflecting the updated list of attached routers (${drId} is now absent). This LSA is flooded to <b>224.0.0.5</b> (AllSPFRouters).<br><br>The old DR's Network LSA is simultaneously purged with <b>MaxAge (3600s)</b> so all routers flush it from their LSDBs.<br><br>Each router runs <b>SPF</b> when the new Network LSA arrives. If there are alternate paths through other areas, they are now installed into the routing table.`,
      cli:   `show ip ospf database network\n! OLD: Link ID ${dr?.ip||'(old DR IP)'} — MAXAGE (being purged)\n! NEW: Link ID ${bdr?.ip||bdrId}, ADV: ${bdr?.rid||bdrId}\n!   Attached: ${rtrs.filter(r=>r.id!==drId).map(r=>r.rid||r.id).join(', ')}\n\nshow ip route ospf\n! Routing table updated after SPF reconvergence`,
      rule:  `<b>RFC 2328 §13.4 — MaxAge flushing:</b> The old Network LSA is sent with Age=3600 (MaxAge) to force immediate deletion from all LSDBs in the area.`,
      roles: { ...crownRoles }, states: { ...crownStates },
      pkt:   bdrId ? { from: bdrId, type:'LSU', multi: true } : null,
    });
  }

  drCurrentStep = 0;
  drStepMax     = drSteps.length;
}

/* ═══════════════════════════════════════════════════════
   PLAYBACK
   ═══════════════════════════════════════════════════════ */
   function drReset() {
    clearTimeout(drTimer);
    drPlaying = false;
    const btn = document.getElementById('drBtnPlay');
    if (btn) { 
      btn.textContent = '▶'; 
      btn.setAttribute('data-label', 'PLAY');
      btn.classList.remove('on'); 
    }
    cancelAnimationFrame(drAnimId);
    drPktAnim = null;
    drBuildSteps();
    drBuildRtrConfig();
    drUpdateResultTable({ dr:null, bdr:null });
    drRenderStep();
    drDraw();
  }
  
  function drTogglePlay() {
    drPlaying = !drPlaying;
    const btn = document.getElementById('drBtnPlay');
    if (drPlaying) {
      btn.textContent = '⏸'; 
      btn.setAttribute('data-label', 'PAUSE');
      btn.classList.add('on');
      drAutoStep();
    } else {
      btn.textContent = '▶'; 
      btn.setAttribute('data-label', 'PLAY');
      btn.classList.remove('on');
      clearTimeout(drTimer);
    }
  }
  
  function drAutoStep() {
    if (!drPlaying) return;
    if (drCurrentStep < drSteps.length - 1) {
      drGo(1);
      drTimer = setTimeout(drAutoStep, drSpeedMs);
    } else {
      drPlaying = false;
      const btn = document.getElementById('drBtnPlay');
      if (btn) { 
        btn.textContent = '▶'; 
        btn.setAttribute('data-label', 'PLAY');
        btn.classList.remove('on'); 
      }
    }
  }
  
  function drGo(dir) {
    const n = drCurrentStep + dir;
    if (n < 0 || n >= drSteps.length) return;
    drCurrentStep = n;
    const s = drSteps[drCurrentStep];
    if (s.twoHop) {
      drFireTwoHopLSU(s.twoHop);
    } else if (s.pkt) {
      drFirePkt(s.pkt);
    }
    drRenderStep();
    drDraw();
  }
  
  function drSetSpeed(v) {
    document.getElementById('drSpdLbl').textContent = parseFloat(v).toFixed(1) + '×';
    drSpeedMs = Math.round(4000 / parseFloat(v));
  }
/* ═══════════════════════════════════════════════════════
   PACKET ANIMATION
   ═══════════════════════════════════════════════════════ */

/* Two-hop LSU: DROther → 224.0.0.6 (DR unicast) then DR → 224.0.0.5 (multicast flood) */
function drFireTwoHopLSU({ from, dr }) {
  const hopDur = Math.max(1400, Math.min(Math.round(drSpeedMs * 0.45), 3200));

  // Hop 1: DROther → DR (224.0.0.6 AllDRRouters)
  drPktAnim = { from, to: dr, type: 'LSU', t: 0,
    label1: `${from} → 224.0.0.6 (AllDRRouters) → ${dr}` };
  const t1Start = performance.now();

  const hop1 = (now) => {
    drPktAnim.t = Math.min(1, (now - t1Start) / hopDur);
    drDraw();
    if (drPktAnim.t < 1) { drAnimId = requestAnimationFrame(hop1); return; }

    // Hop 2: DR → 224.0.0.5 multicast (re-flood)
    drPktAnim = { from: dr, type: 'LSU', multi: true, t: 0,
      label2: `${dr} re-floods → 224.0.0.5 (AllSPFRouters)` };
    const t2Start = performance.now();

    const hop2 = (now2) => {
      drPktAnim.t = Math.min(1, (now2 - t2Start) / hopDur);
      drDraw();
      if (drPktAnim.t < 1) { drAnimId = requestAnimationFrame(hop2); return; }
      drPktAnim = null;
      drDraw();
    };
    drAnimId = requestAnimationFrame(hop2);
  };
  drAnimId = requestAnimationFrame(hop1);
}
function drFirePkt(pkt) {
  drPktAnim = { ...pkt, t: 0, done: false };
  // Duration scales with speed slider: 65% of step time, clamped between 1800ms and 5000ms
  const dur = Math.max(1800, Math.min(Math.round(drSpeedMs * 0.65), 5000));
  const startTime = performance.now();
  const tick = (now) => {
    if (!drPktAnim) return;
    const elapsed = now - startTime;
    drPktAnim.t = Math.min(1, elapsed / dur);
    if (drPktAnim.t >= 1) { drPktAnim = null; drDraw(); return; }
    drDraw();
    drAnimId = requestAnimationFrame(tick);
  };
  drAnimId = requestAnimationFrame(tick);
}

/* ═══════════════════════════════════════════════════════
   CANVAS DRAW
   ═══════════════════════════════════════════════════════ */
function drResize() {
  if (!drCanvas) return;
  const W = drCanvas.parentElement.clientWidth;
  drCanvas.style.width  = W + 'px';
  drCanvas.style.height = Math.round(W * 0.52) + 'px';
  drDraw();
}

function drDraw() {
  if (!drCtx) return;
  const W = drCanvas.width  = drCanvas.parentElement.clientWidth;
  const H = drCanvas.height = Math.round(W * 0.52);
  const ctx = drCtx;
  ctx.clearRect(0,0,W,H);

  // background
  ctx.fillStyle = '#060d1a'; ctx.fillRect(0,0,W,H);
  // grid
  ctx.strokeStyle = 'rgba(30,41,59,0.5)'; ctx.lineWidth = 1;
  for (let x=0;x<W;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
  for (let y=0;y<H;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}

  const step = drSteps[drCurrentStep];
  if (!step) return;

  const rtrs = drRouters;
  const pos  = drCalcPos(rtrs, W, H);
  const busY = Math.round(H * 0.74);

  // ── Bus ──
  const bx1 = Math.round(W*0.06), bx2 = Math.round(W*0.94);
  ctx.strokeStyle = '#1e3a5f'; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(bx1, busY); ctx.lineTo(bx2, busY); ctx.stroke();

  // bus label
  ctx.fillStyle = '#1e3a5f'; ctx.font = '10px IBM Plex Mono'; ctx.textAlign='center';
  ctx.fillText('Shared Ethernet · 192.168.1.0/24 · 224.0.0.5 AllSPFRouters', W/2, busY+18);

  // ── Drop wires ──
  ctx.setLineDash([4,3]); ctx.lineWidth=2;
  rtrs.forEach((r,i) => {
    const p = pos[r.id];
    const state = step.states[r.id];
    const dead  = state === 'Down';
    ctx.strokeStyle = dead ? '#374151' : '#1e3a5f';
    ctx.beginPath(); ctx.moveTo(p.x, p.y+30); ctx.lineTo(p.x, busY); ctx.stroke();
  });
  ctx.setLineDash([]);

  // ── Multicast zone glow (if elected) ──
  const drR  = rtrs.find(r => step.roles[r.id]==='DR');
  const bdrR = rtrs.find(r => step.roles[r.id]==='BDR');
  if (drR) {
    const p = pos[drR.id];
    const grd = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,70);
    grd.addColorStop(0,'rgba(34,197,94,0.1)'); grd.addColorStop(1,'transparent');
    ctx.fillStyle=grd; ctx.beginPath(); ctx.arc(p.x,p.y,70,0,Math.PI*2); ctx.fill();
  }
  if (bdrR) {
    const p = pos[bdrR.id];
    const grd = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,55);
    grd.addColorStop(0,'rgba(245,158,11,0.08)'); grd.addColorStop(1,'transparent');
    ctx.fillStyle=grd; ctx.beginPath(); ctx.arc(p.x,p.y,55,0,Math.PI*2); ctx.fill();
  }

  // ── Packet animation ──
  if (drPktAnim) drDrawPkt(ctx, pos, busY, W);

  // ── In-flight packet status banner ──
  if (drPktAnim) {
    const pkt = drPktAnim;
    const pktColor = pkt.type==='Hello' ? '#3b82f6' : pkt.type==='LSU' ? '#10b981' : '#f59e0b';
    const destStr  = pkt.label2 || pkt.label1
      ? (pkt.label2 || pkt.label1)
      : pkt.multi
      ? '224.0.0.5 (AllSPFRouters)'
      : (pkt.to ? pkt.to : '—');
    const bannerTxt = pkt.label1 || pkt.label2
      ? `📡  ${destStr}`
      : `📡  ${pkt.from}  transmitting  ${pkt.type}  →  ${destStr}`;
    ctx.font = 'bold 10px IBM Plex Mono';
    const bw = ctx.measureText(bannerTxt).width + 28;
    const bx = (W - bw) / 2, by = 10, bh = 22;
    ctx.fillStyle = '#080e1c';
    ctx.strokeStyle = pktColor + '88';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 6); ctx.fill(); ctx.stroke();
    ctx.fillStyle = pktColor;
    ctx.textAlign = 'center';
    ctx.fillText(bannerTxt, W/2, by + 15);
  }

  // ── Router nodes ──
  // For crown transfer step: pulse the new DR with a golden scale ring
  const isCrownStep = !!(step.crownTransfer);
  const crownPulseT = isCrownStep ? ((Date.now() % 1400) / 1400) : 0;

  rtrs.forEach((r,i) => {
    const p     = pos[r.id];
    const role  = step.roles[r.id]  || 'DROther';
    const state = step.states[r.id] || 'Down';

    // Crown transfer: draw animated gold ring around the new DR
    if (isCrownStep && role === 'DR') {
      const pulseR = 38 + 18 * easeOutQuad(crownPulseT);
      const alpha  = (1 - crownPulseT) * 0.7;
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth   = 3;
      ctx.beginPath(); ctx.arc(p.x, p.y, pulseR, 0, Math.PI * 2); ctx.stroke();
      // Second ring slightly offset in time
      const pulseR2 = 38 + 18 * easeOutQuad((crownPulseT + 0.4) % 1);
      const alpha2  = (1 - ((crownPulseT + 0.4) % 1)) * 0.45;
      ctx.globalAlpha = alpha2;
      ctx.beginPath(); ctx.arc(p.x, p.y, pulseR2, 0, Math.PI * 2); ctx.stroke();
      ctx.globalAlpha = 1;
    }

    drDrawRouter(ctx, p, r, role, state, i);
  });

  // Keep crown animation running while on this step
  if (isCrownStep && !drPktAnim) {
    requestAnimationFrame(() => drDraw());
  }

  // ── Legend strip ──
  drDrawLegend(ctx, W, H);
}

function drDrawPkt(ctx, pos, busY, W) {
  const pkt  = drPktAnim;
  const from = pos[pkt.from];
  if (!from) return;
  const c = pkt.type==='Hello' ? '#3b82f6' : pkt.type==='LSU' ? '#10b981' : '#f59e0b';
  // Apply easing for smooth motion
  const t = easeInOutCubic(pkt.t);

  const destLabel = pkt.label2
    ? pkt.label2
    : pkt.label1
    ? pkt.label1
    : pkt.multi
    ? (pkt.type === 'LSU' ? '224.0.0.6 → DR floods → 224.0.0.5' : '224.0.0.5 (AllSPFRouters)')
    : (pkt.to || '');
  const ballLabel = pkt.label1 || pkt.label2 || `${pkt.from} → ${pkt.type} → ${destLabel}`;

  if (pkt.multi) {
    // Phase 1 (0–0.35): drop from sender straight down to bus
    if (t < 0.35) {
      const p = t / 0.35;
      drBubble(ctx, from.x, from.y + 30 + (busY - from.y - 30) * p, pkt.type, c, ballLabel);
    } else {
      // Phase 2 (0.35–1): fan out from sender X toward each OTHER router's X position
      const p = easeOutQuad((t - 0.35) / 0.65);
      const targets = drRouters.filter(r => r.id !== pkt.from);
      if (targets.length === 0) {
        drBubble(ctx, from.x, busY, pkt.type, c, ballLabel);
      } else {
        targets.forEach((r, i) => {
          const tp = pos[r.id];
          if (!tp) return;
          const bx = from.x + (tp.x - from.x) * p;
          const roleLabel = i === 0 ? ballLabel : `${pkt.type} multicast`;
          drBubble(ctx, bx, busY, pkt.type, c, roleLabel);
        });
      }
    }
  } else if (pkt.to && pos[pkt.to]) {
    const to = pos[pkt.to];
    const unicastLabel = `${pkt.from} → ${pkt.type} → ${pkt.to}`;
    if (t < 0.33) {
      // Phase 1: drop down from router to bus
      drBubble(ctx, from.x, from.y + 30 + (busY - from.y - 30) * (t / 0.33), pkt.type, c, unicastLabel);
    } else if (t < 0.66) {
      // Phase 2: travel along bus toward target
      const p = (t - 0.33) / 0.33;
      drBubble(ctx, from.x + (to.x - from.x) * p, busY, pkt.type, c, unicastLabel);
    } else {
      // Phase 3: rise up from bus to destination router
      const p = (t - 0.66) / 0.34;
      drBubble(ctx, to.x, busY + (to.y + 30 - busY) * p, pkt.type, c, unicastLabel);
    }
  }
}

function drBubble(ctx, x, y, type, c, label) {
  // outer glow
  const g = ctx.createRadialGradient(x,y,0,x,y,28);
  g.addColorStop(0,c+'44'); g.addColorStop(1,'transparent');
  ctx.fillStyle=g; ctx.beginPath(); ctx.arc(x,y,28,0,Math.PI*2); ctx.fill();

  // circle
  ctx.fillStyle=c+'cc'; ctx.strokeStyle=c; ctx.lineWidth=2;
  ctx.beginPath(); ctx.arc(x,y,15,0,Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.fillStyle='#fff'; ctx.font='bold 8px IBM Plex Mono'; ctx.textAlign='center';
  ctx.fillText(type, x, y+3);

  // floating label above bubble
  if (label) {
    ctx.font = 'bold 9px IBM Plex Mono';
    const textW = ctx.measureText(label).width;
    const padX = 8, bh = 16;
    const bw = textW + padX*2;
    const bx = x - bw/2, by = y - 46;

    // badge background
    ctx.fillStyle = '#0d1526';
    ctx.strokeStyle = c + 'aa';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 4);
    ctx.fill(); ctx.stroke();

    // dashed connector line from badge to ball
    ctx.strokeStyle = c + '55';
    ctx.lineWidth = 1;
    ctx.setLineDash([2,3]);
    ctx.beginPath(); ctx.moveTo(x, by+bh); ctx.lineTo(x, y-15); ctx.stroke();
    ctx.setLineDash([]);

    // label text
    ctx.fillStyle = c;
    ctx.font = 'bold 9px IBM Plex Mono';
    ctx.textAlign = 'center';
    ctx.fillText(label, x, by + bh - 4);
  }
}

function drCalcPos(rtrs, W, H) {
  const n   = rtrs.length;
  const pos = {};
  const topY = Math.round(H * 0.27);
  const margin = Math.round(W * 0.10);
  const span   = W - 2*margin;
  rtrs.forEach((r,i) => {
    const x = n === 1 ? W/2 : Math.round(margin + (span/(n-1))*i);
    pos[r.id] = { x, y: topY };
  });
  return pos;
}

const DR_ROLE_COLORS = {
  DR:'#22c55e', BDR:'#f59e0b', DROther:'#6b7280', Down:'#374151'
};

function drDrawRouter(ctx, p, rtr, role, state, idx) {
  const W  = 84, H = 26;
  const rx = p.x - W/2, ry = p.y - H/2;
  const dead = state === 'Down';
  const bc   = dead ? '#374151' : DR_ROLE_COLORS[role] || '#6b7280';
  const cc   = drRtrColor(idx);

  // shadow
  ctx.shadowColor = dead ? 'transparent' : bc+'44';
  ctx.shadowBlur  = 12;

  // box
  ctx.fillStyle   = dead ? '#0f1020' : '#0f1d35';
  ctx.strokeStyle = bc;
  ctx.lineWidth   = role === 'DR' ? 2.5 : 1.5;
  drRR(ctx, rx, ry, W, H, 8); ctx.fill(); ctx.stroke();
  ctx.shadowBlur = 0;

  // router ID text
  ctx.fillStyle = dead ? '#374151' : '#e2e8f0';
  ctx.font = 'bold 11px IBM Plex Mono'; ctx.textAlign='center';
  ctx.fillText(rtr.id, p.x, p.y - 3);

  // RID
  ctx.fillStyle = dead ? '#374151' : cc;
  ctx.font = '8px IBM Plex Mono';
  ctx.fillText(rtr.rid, p.x, p.y + 9);

  // Priority badge (above box)
  ctx.fillStyle = dead ? '#374151' : '#334155';
  ctx.font = '9px IBM Plex Mono';
  ctx.fillText('Pri:' + rtr.pri, p.x, p.y - H/2 - 7);

  // Role badge (below)
  const bw=66, bh=17;
  const bx=p.x-bw/2, by=p.y+H/2+5;
  ctx.fillStyle   = dead ? '#1a2030' : bc+'22';
  ctx.strokeStyle = dead ? '#374151' : bc;
  ctx.lineWidth   = 1.5;
  drRR(ctx,bx,by,bw,bh,5); ctx.fill(); ctx.stroke();
  ctx.fillStyle = dead ? '#374151' : bc;
  ctx.font = 'bold 9px IBM Plex Mono';
  ctx.fillText(dead?'Down':role, p.x, by+11);

  // DR crown icon
  if (role === 'DR' && !dead) {
    ctx.fillStyle='#fbbf24'; ctx.font='13px serif'; ctx.textAlign='center';
    ctx.fillText('♛', p.x, p.y-H/2-19);
  }
  if (role === 'BDR' && !dead) {
    ctx.fillStyle='#f59e0b'; ctx.font='11px serif'; ctx.textAlign='center';
    ctx.fillText('♜', p.x, p.y-H/2-19);
  }
}

function drDrawLegend(ctx, W, H) {
  const items = [
    {c:'#22c55e', label:'DR (♛ Designated)'},
    {c:'#f59e0b', label:'BDR (♜ Backup)'},
    {c:'#6b7280', label:'DROther'},
    {c:'#374151', label:'Down'},
  ];
  let x = 12, y = H - 14;
  ctx.font='9px IBM Plex Mono'; ctx.textAlign='left';
  items.forEach(it => {
    ctx.fillStyle=it.c+'99';
    ctx.fillRect(x, y-8, 10, 10);
    ctx.fillStyle='#475569';
    ctx.fillText(it.label, x+13, y);
    x += ctx.measureText(it.label).width + 26;
  });
}

function drRR(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.arcTo(x+w,y,x+w,y+r,r);
  ctx.lineTo(x+w,y+h-r); ctx.arcTo(x+w,y+h,x+w-r,y+h,r);
  ctx.lineTo(x+r,y+h); ctx.arcTo(x,y+h,x,y+h-r,r);
  ctx.lineTo(x,y+r); ctx.arcTo(x,y,x+r,y,r);
  ctx.closePath();
}

/* ═══════════════════════════════════════════════════════
   UI PANELS
   ═══════════════════════════════════════════════════════ */
function drRenderStep() {
  if (!drSteps.length) return;
  const s   = drSteps[drCurrentStep];
  const { dr, bdr } = drElect(drRouters);

  // title / body
  document.getElementById('drInfoTitle').textContent = s.title;
  document.getElementById('drInfoBody').innerHTML    = s.body;

  // CLI
  const cliEl = document.getElementById('drInfoCli');
  if (s.cli) { cliEl.style.display='block'; cliEl.textContent=s.cli; }
  else         cliEl.style.display='none';

  // Rule
  const ruleEl = document.getElementById('drRuleBox');
  if (s.rule) { ruleEl.style.display='block'; ruleEl.innerHTML=s.rule; }
  else          ruleEl.style.display='none';

  // Step counter
  document.getElementById('drSNum').textContent = `Step ${drCurrentStep+1} / ${drSteps.length}`;

  // Role badges on sliders
  drRouters.forEach((r, i) => {
    const badge = document.getElementById('drRoleBadge_'+i);
    if (!badge) return;
    const role = s.roles[r.id] || '—';
    const c    = DR_ROLE_COLORS[role] || '#475569';
    badge.textContent   = role;
    badge.style.background = c+'22';
    badge.style.color       = c;
    badge.style.border      = `1px solid ${c}55`;
  });

  // Result table
  drUpdateResultTable(drElect(drRouters));

  // Log
  drLog.push({ text: `${drCurrentStep+1}. ${s.title}`, cls: s.roles && Object.values(s.roles).includes('DR') ? 'dr-ev' : '' });
  const logEl = document.getElementById('drLog');
  logEl.innerHTML = drLog.map((l,i) => {
    const cur = i === drLog.length-1 ? ' cur' : '';
    return `<div class="dr-log-item ${l.cls}${cur}">${l.text}</div>`;
  }).join('');
  if (logEl.lastElementChild) {
    logEl.scrollTo({ top: logEl.scrollHeight, behavior: 'smooth' });
  }
}

function drUpdateResultTable({ dr, bdr }) {
  const tbody = document.getElementById('drResultTbl');
  if (!tbody) return;
  tbody.innerHTML = drRouters.map((r,i) => {
    const isDR  = dr  && r.id === dr.id;
    const isBDR = bdr && r.id === bdr.id;
    const role  = isDR ? 'DR' : isBDR ? 'BDR' : r.pri===0 ? 'Pri=0' : 'DROther';
    const c     = isDR ? '#22c55e' : isBDR ? '#f59e0b' : r.pri===0 ? '#ef4444' : '#6b7280';
    return `<tr>
      <td style="color:${drRtrColor(i)};font-weight:700">${r.id}</td>
      <td style="color:#e2e8f0">${r.pri}</td>
      <td style="color:#64748b;font-size:10px">${r.rid}</td>
      <td><span style="background:${c}22;color:${c};border:1px solid ${c}44;padding:2px 8px;border-radius:4px;font-size:10px;font-weight:700">${role}</span></td>
    </tr>`;
  }).join('');
}

/* ╔══════════════════════════════════════════════════════════════════╗
   ║  OSPF SIMULATOR · Phase 4 : LSA Flooding                        ║
   ║  Types 1-7 · Multi-Area · LSDB per Router · CCIE Depth          ║
   ╚══════════════════════════════════════════════════════════════════╝ */

/* ═══════════════════════════════════════════════════════
   PHASE 4 STATE
   ═══════════════════════════════════════════════════════ */
let lsaCanvas, lsaCtx;
let lsaCurrentStep  = 0;
let lsaPlaying      = false;
let lsaTimer        = null;
let lsaSpeedMs      = 4000;
let lsaAnimDur      = 1200;
let lsaScenario     = 'type1';
let lsaSteps        = [];
let lsaAnimId       = null;
let lsaAnimStart    = null;
let lsaFloodPkt     = { on:false, prog:0, from:'', to:'', type:'', color:'' };
let lsaTrails       = [];
let lsaPulseRings   = [];

/* ── LSA type colours ── */
const LSA_FLD_COLORS = {
  T1:'#3b82f6', T2:'#22c55e', T3:'#f59e0b',
  T4:'#8b5cf6', T5:'#ef4444', T7:'#06b6d4'
};

/* ── Fixed topology (3 Areas, 6 routers) ──
   Area 1 ── Area 0 (Backbone) ── Area 2 (NSSA)
   R4  ──  R1(ABR1) ── R2 ── R3(ABR2) ── R5(ASBR/NSSA)
                        └─ R6(ASBR, redistributes external into Area 0)
*/
const LSA_RTRS = [
  { id:'R1', rid:'1.1.1.1', role:'ABR',  area:'0+1', ip:'10.1.0.1' },
  { id:'R2', rid:'2.2.2.2', role:'ASBR', area:'0',   ip:'10.0.0.2' },
  { id:'R3', rid:'3.3.3.3', role:'ABR',  area:'0+2', ip:'10.2.0.1' },
  { id:'R4', rid:'4.4.4.4', role:'IR',   area:'1',   ip:'10.1.0.2' },
  { id:'R5', rid:'5.5.5.5', role:'IR',   area:'0',   ip:'10.0.0.5' },
  { id:'R6', rid:'6.6.6.6', role:'ASBR', area:'2',   ip:'10.2.0.2' },
];

/* Router positions are calculated in lsaCalcPos() based on canvas size */

/* ── Area definitions ── */
const LSA_AREAS = [
  { id:'0',  label:'Area 0 — Backbone',    color:'#3b82f6', rtrs:['R1','R2','R3','R5'] },
  { id:'1',  label:'Area 1 — Standard',    color:'#22c55e', rtrs:['R1','R4']           },
  { id:'2',  label:'Area 2 — NSSA',        color:'#f59e0b', rtrs:['R3','R6']           },
];

/* ── Links between routers ── */
const LSA_LINKS = [
  { a:'R1', b:'R2', area:'0' },
  { a:'R2', b:'R3', area:'0' },
  { a:'R2', b:'R5', area:'0' },
  { a:'R1', b:'R4', area:'1' },
  { a:'R3', b:'R6', area:'2' },
];

/* ═══════════════════════════════════════════════════════
   ENTRY POINT
   ═══════════════════════════════════════════════════════ */
function ospfLsaInit() {
  const host = document.getElementById('ospf-lsa-container');
  if (!host) { console.error('Phase 4: #ospf-lsa-container missing'); return; }
  host.innerHTML = lsaBuildHTML();
  lsaCanvas = document.getElementById('lsaCanvas');
  lsaCtx    = lsaCanvas.getContext('2d');

  // Load scenario data (builds steps + populates panel) BEFORE any draw call.
  lsaLoadScenario('type1');

  // Prevent listener stacking on repeated page visits.
  window.removeEventListener('resize', lsaResize);
  window.addEventListener('resize', lsaResize);

  // Defer first resize/draw so flex layout has settled and clientWidth is non-zero.
  requestAnimationFrame(() => { lsaResize(); });
}

/* ═══════════════════════════════════════════════════════
   HTML + CSS
   ═══════════════════════════════════════════════════════ */
function lsaBuildHTML() {
  return `
<style>
/* ── Phase 4 — LSA Flooding — redesigned full-width layout ── */
.lsa-wrap{font-family:'IBM Plex Mono',monospace;background:#080d1c;color:#e2e8f0;border-radius:16px;padding:20px;border:1px solid #1a2640;box-shadow:0 8px 40px rgba(0,0,0,.6);user-select:none}
.lsa-topbar{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:14px;align-items:center;padding:12px 16px;background:#0d1526;border-radius:10px;border:1px solid #1a2640}
.lsa-title{font-size:14px;font-weight:700;color:#60b8ff}
.lsa-scen-row{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px}
.lsa-btn{background:#0d1829;border:1px solid #1e3050;color:#64748b;padding:6px 14px;border-radius:7px;cursor:pointer;font-size:11px;font-family:'IBM Plex Mono',monospace;font-weight:600;transition:all .2s;letter-spacing:.3px}
.lsa-btn:hover{border-color:#3b82f6;color:#7cb9ff;background:#0f1f3a}
.lsa-btn.active{background:linear-gradient(135deg,#0f2a52,#112244);border-color:#3b82f6;color:#7cb9ff;font-weight:700;box-shadow:0 0 12px rgba(59,130,246,.2)}

/* ── canvas section (full width) ── */
.lsa-canvas-box{background:#04080f;border-radius:12px;overflow:hidden;margin-bottom:10px;border:1px solid #1a2640;box-shadow:inset 0 2px 20px rgba(0,0,0,.4);position:relative;width:100%}
#lsaCanvas{display:block;width:100%;height:auto}

/* ── progress strip ── */
.lsa-progress-wrap{margin-bottom:10px;display:flex;align-items:center;gap:10px}
.lsa-progress-track{flex:1;height:5px;background:#0d1526;border-radius:3px;overflow:hidden}
.lsa-progress-fill{height:100%;border-radius:3px;transition:width .4s ease}
.lsa-step-counter{font-size:11px;color:#3b5278;white-space:nowrap;font-weight:700;min-width:90px;text-align:right}

/* ── control bar (full width) ── */
.lsa-ctrl-bar{display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;padding:10px 16px;background:#0d1526;border-radius:10px;border:1px solid #1a2640;margin-bottom:14px}
.lsa-cb{background:#0d1829;border:1px solid #1e3050;color:#94a3b8;width:44px;height:44px;border-radius:10px;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .2s;position:relative}
.lsa-cb::after{content:attr(data-label);position:absolute;bottom:-18px;left:50%;transform:translateX(-50%);font-size:9px;color:#3b5278;white-space:nowrap;pointer-events:none;font-family:'IBM Plex Mono',monospace;letter-spacing:.5px}
.lsa-cb:hover{background:#0f1f3a;border-color:#3b82f6;color:#7cb9ff;transform:translateY(-1px)}
.lsa-cb.play-active{background:linear-gradient(135deg,#0a2515,#0d2a1a);border-color:#22c55e;color:#22c55e;box-shadow:0 0 14px rgba(34,197,94,.3)}
.lsa-play-btn{width:52px!important;height:52px!important;font-size:20px!important;border-radius:50%!important;border-color:#3b82f6;color:#3b82f6;box-shadow:0 0 14px rgba(59,130,246,.2)}
.lsa-play-btn:hover{box-shadow:0 0 22px rgba(59,130,246,.4)!important}
.lsa-ctrl-div{width:1px;height:32px;background:#1a2640;margin:0 4px}
.lsa-spd{display:flex;align-items:center;gap:8px}
.lsa-spd-lbl{font-size:10px;color:#3b5278;text-transform:uppercase;letter-spacing:.8px;font-weight:700}
.lsa-spd input{width:90px;height:4px;appearance:none;background:#1a2640;border-radius:2px;cursor:pointer;outline:none}
.lsa-spd input::-webkit-slider-thumb{appearance:none;width:14px;height:14px;border-radius:50%;background:#3b82f6;cursor:pointer;box-shadow:0 0 8px rgba(59,130,246,.5);transition:transform .15s}
.lsa-spd input::-webkit-slider-thumb:hover{transform:scale(1.2)}
.lsa-spd-val{font-size:11px;color:#7cb9ff;font-weight:700;min-width:28px;text-align:center}

/* ── 3-column info strip ── */
.lsa-info-strip{display:grid;grid-template-columns:1.7fr 1fr 0.9fr;gap:12px;margin-bottom:14px;align-items:start}
.lsa-panel{background:#0d1526;border-radius:10px;padding:14px;border:1px solid #1a2640}
.lsa-panel-title{font-size:9.5px;color:#2c4470;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;font-weight:700;display:flex;align-items:center;gap:6px}
.lsa-panel-title::before{content:'';display:inline-block;width:3px;height:11px;border-radius:2px;background:var(--lsa-ac,#3b82f6)}
.lsa-step-title{font-size:12.5px;font-weight:700;color:#60b8ff;margin-bottom:7px;line-height:1.4}
.lsa-step-desc{font-size:11px;color:#8aa3c5;line-height:1.8;margin-bottom:8px;font-family:'DM Sans',sans-serif;max-height:220px;overflow-y:auto;scrollbar-width:thin;scrollbar-color:#1a2640 transparent}
.lsa-step-desc::-webkit-scrollbar{width:3px}
.lsa-step-desc::-webkit-scrollbar-thumb{background:#1a2640;border-radius:2px}
.lsa-step-cli{font-size:10px;color:#4ade80;background:#050c1a;padding:9px 12px;border-radius:7px;margin-bottom:8px;white-space:pre-wrap;border-left:3px solid #22c55e;line-height:1.7;display:none;max-height:130px;overflow-y:auto;scrollbar-width:thin;scrollbar-color:#1a2640 transparent}
.lsa-step-rfc{font-size:10px;color:#2c4470;margin-top:5px;font-style:italic}
.lsa-rule-box{background:rgba(56,189,248,0.05);border:1px solid rgba(56,189,248,0.15);border-radius:7px;padding:9px 12px;margin-top:8px;font-size:11px;color:#8aa3c5;line-height:1.75;display:none;font-family:'DM Sans',sans-serif}
.lsa-rule-box b{color:#38bdf8}

/* ── LSDB table ── */
.lsa-db-tbl{width:100%;border-collapse:collapse;font-size:10px}
.lsa-db-tbl th{background:#050c1a;color:#2c4470;padding:4px 7px;text-align:left;font-weight:700;border-bottom:1px solid #1a2640;text-transform:uppercase;font-size:9px;letter-spacing:.5px}
.lsa-db-tbl td{padding:4px 7px;border-bottom:1px solid #080e1c;vertical-align:middle}
.lsa-db-entry{display:inline-block;padding:1px 6px;border-radius:3px;font-size:9px;font-weight:700;margin:1px}

/* ── Log ── */
.lsa-log-box{max-height:220px;overflow-y:auto;display:flex;flex-direction:column;gap:3px;scrollbar-width:thin;scrollbar-color:#1a2640 transparent}
.lsa-log-box::-webkit-scrollbar{width:4px}
.lsa-log-box::-webkit-scrollbar-thumb{background:#1a2640;border-radius:2px}
.lsa-log-item{font-size:10px;padding:5px 10px;border-radius:5px;background:#060d1a;border-left:3px solid #1a2640;color:#3b5278;line-height:1.4;cursor:pointer;transition:all .2s}
.lsa-log-item:hover{color:#64748b}
.lsa-log-item.cur{border-left-color:#3b82f6;color:#c4ddff;background:#0a1e38;box-shadow:0 0 10px rgba(59,130,246,.12)}

/* ── Wireshark panel (full width bottom) ── */
.lsa-pkt-section{background:#0d1526;border-radius:10px;padding:14px;border:1px solid #1a2640;margin-bottom:0}
.lsa-pkt-hdr{display:flex;align-items:center;gap:10px;margin-bottom:10px}
.lsa-pkt-badge{padding:4px 14px;border-radius:5px;font-size:11px;font-weight:700;letter-spacing:.5px}
.lsa-pkt-tbl{width:100%;border-collapse:collapse;font-size:10.5px}
.lsa-pkt-tbl th{background:#050c1a;color:#2c4470;padding:5px 10px;text-align:left;font-weight:700;border-bottom:1px solid #1a2640;text-transform:uppercase;font-size:9.5px;letter-spacing:.5px}
.lsa-pkt-tbl td{padding:5px 10px;border-bottom:1px solid #080e1c;color:#8aa3c5;vertical-align:top}
.lsa-pkt-tbl tr:hover td{background:#0a1525}
.lsa-pkt-tbl td:first-child{color:#7db8ff;white-space:nowrap}
.lsa-pkt-tbl td:nth-child(2){color:#86efac;font-family:'IBM Plex Mono',monospace;white-space:nowrap}
.lsa-no-pkt{color:#2c4470;font-size:11px;padding:12px;text-align:center;font-style:italic}

/* ── legend row ── */
.lsa-legend{display:flex;flex-wrap:wrap;gap:10px;padding:8px 12px;background:#0d1526;border-radius:8px;border:1px solid #1a2640;margin-bottom:12px}
.lsa-leg-item{display:flex;align-items:center;gap:5px;font-size:10px;color:#64748b}
.lsa-leg-dot{width:11px;height:11px;border-radius:3px;flex-shrink:0}

@media(max-width:860px){
  .lsa-info-strip{grid-template-columns:1fr}
}
@media(min-width:861px) and (max-width:1100px){
  .lsa-info-strip{grid-template-columns:1.5fr 1fr}
}
</style>

<div class="lsa-wrap">
  <!-- Top bar -->
  <div class="lsa-topbar">
    <span class="lsa-title">📡 LSA Flooding Simulator</span>
    <span style="font-size:10px;color:#3b5278;margin-left:4px">RFC 2328 §12–13 · Types 1–7</span>
  </div>

  <!-- Scenario buttons -->
  <div class="lsa-scen-row" id="lsaScenRow"></div>

  <!-- Area legend (full width) -->
  <div class="lsa-legend">
    <div class="lsa-leg-item"><div class="lsa-leg-dot" style="background:#3b82f622;border:1px solid #3b82f6"></div>Area 0 — Backbone (R1,R2,R3,R5)</div>
    <div class="lsa-leg-item"><div class="lsa-leg-dot" style="background:#22c55e22;border:1px solid #22c55e"></div>Area 1 — Standard (R1,R4)</div>
    <div class="lsa-leg-item"><div class="lsa-leg-dot" style="background:#f59e0b22;border:1px solid #f59e0b"></div>Area 2 — NSSA (R3,R6)</div>
    <div class="lsa-leg-item"><div class="lsa-leg-dot" style="background:#ef4444aa"></div>Blocked (not flooded)</div>
  </div>

  <!-- Canvas (full width) -->
  <div class="lsa-canvas-box">
    <canvas id="lsaCanvas" width="800" height="448"></canvas>
  </div>

  <!-- Progress bar (full width) -->
  <div class="lsa-progress-wrap">
    <div class="lsa-progress-track">
      <div class="lsa-progress-fill" id="lsaProgressFill" style="width:0%;background:#3b82f6"></div>
    </div>
    <span class="lsa-step-counter" id="lsaSNum">Step 1 / 1</span>
  </div>

  <!-- Controls (full width) -->
  <div class="lsa-ctrl-bar">
    <button class="lsa-cb" data-label="RESET" onclick="lsaReset()" title="Reset">⏮</button>
    <button class="lsa-cb" data-label="PREV"  onclick="lsaGo(-1)"  title="Previous">◀</button>
    <button class="lsa-cb lsa-play-btn" id="lsaPlayBtn" data-label="PLAY" onclick="lsaTogglePlay()" title="Play">▶</button>
    <button class="lsa-cb" data-label="NEXT"  onclick="lsaGo(1)"   title="Next">▶|</button>
    <div class="lsa-ctrl-div"></div>
    <div class="lsa-spd">
      <span class="lsa-spd-lbl">Speed</span>
      <span style="font-size:9px;color:#2c4470">Slow</span>
      <input type="range" id="lsaSpd" min="0.3" max="4" step="0.1" value="1" oninput="lsaSetSpeed(this.value)">
      <span style="font-size:9px;color:#2c4470">Fast</span>
      <span class="lsa-spd-val" id="lsaSpdLbl">1×</span>
    </div>
  </div>

  <!-- 3-column info strip: Step Detail | LSDB State | Flood Log -->
  <div class="lsa-info-strip">

    <!-- Column 1: Step Detail -->
    <div class="lsa-panel" style="--lsa-ac:#3b82f6">
      <div class="lsa-panel-title">Step Detail</div>
      <div class="lsa-step-title" id="lsaStepTitle">Select a scenario and press ▶</div>
      <div class="lsa-step-desc"  id="lsaStepDesc">Choose an LSA type from the buttons above. Each scenario animates the full flooding path through the multi-area topology, showing which routers receive the LSA and where it is blocked.</div>
      <div class="lsa-step-cli"   id="lsaStepCli"></div>
      <div class="lsa-step-rfc"   id="lsaStepRfc"></div>
      <div class="lsa-rule-box"   id="lsaRuleBox"></div>
    </div>

    <!-- Column 2: LSDB State per router -->
    <div class="lsa-panel" style="--lsa-ac:#22c55e">
      <div class="lsa-panel-title">LSDB State (per router)</div>
      <div style="overflow-x:auto">
        <table class="lsa-db-tbl">
          <thead><tr>
            <th>Router</th><th>Area</th><th>Role</th><th>LSAs</th>
          </tr></thead>
          <tbody id="lsaDbTbl"></tbody>
        </table>
      </div>
      <!-- LSA Type quick-reference inside LSDB column -->
      <div style="margin-top:12px;border-top:1px solid #1a2640;padding-top:10px;font-size:10px;line-height:2;color:#8aa3c5">
        <div><span style="color:#3b82f6;font-weight:700">T1</span> Router — every router, area-scoped</div>
        <div><span style="color:#22c55e;font-weight:700">T2</span> Network — DR only, area-scoped</div>
        <div><span style="color:#f59e0b;font-weight:700">T3</span> Summary — ABR, inter-area</div>
        <div><span style="color:#8b5cf6;font-weight:700">T4</span> ASBR Summary — ABR, ASBR reach</div>
        <div><span style="color:#ef4444;font-weight:700">T5</span> AS External — ASBR, domain-wide</div>
        <div><span style="color:#06b6d4;font-weight:700">T7</span> NSSA External — NSSA only→T5</div>
      </div>
    </div>

    <!-- Column 3: Flooding Log -->
    <div class="lsa-panel" style="--lsa-ac:#f59e0b">
      <div class="lsa-panel-title">Flooding Log</div>
      <div class="lsa-log-box" id="lsaLog"></div>
    </div>

  </div><!-- /lsa-info-strip -->

  <!-- Wireshark LSA dissection (full width, bottom) -->
  <div class="lsa-pkt-section">
    <div class="lsa-pkt-hdr">
      <span class="lsa-pkt-badge" id="lsaPktBadge" style="background:#0d1526;color:#2c4470;border:1px solid #1a2640">— No LSA</span>
      <span style="font-size:11px;color:#2c4470;font-weight:700;text-transform:uppercase;letter-spacing:.8px">🔬 LSA Header Dissection (Wireshark-style)</span>
    </div>
    <div id="lsaPktBody"><div class="lsa-no-pkt">No LSA captured at this step — advance to a flooding step to see the header fields</div></div>
  </div>

</div>`;
}

/* ═══════════════════════════════════════════════════════
   SCENARIO LOADER
   ═══════════════════════════════════════════════════════ */
const LSA_SCENARIO_META = {
  type1: { label:'Type 1 · Router LSA',    color:LSA_FLD_COLORS.T1, accentColor:'#3b82f6' },
  type2: { label:'Type 2 · Network LSA',   color:LSA_FLD_COLORS.T2, accentColor:'#22c55e' },
  type3: { label:'Type 3 · Summary LSA',   color:LSA_FLD_COLORS.T3, accentColor:'#f59e0b' },
  type4: { label:'Type 4 · ASBR Summary',  color:LSA_FLD_COLORS.T4, accentColor:'#8b5cf6' },
  type5: { label:'Type 5 · AS External',   color:LSA_FLD_COLORS.T5, accentColor:'#ef4444' },
  type7: { label:'Type 7 · NSSA External', color:LSA_FLD_COLORS.T7, accentColor:'#06b6d4' },
};

function lsaLoadScenario(key) {
  lsaScenario = key;
  // Render buttons
  const row = document.getElementById('lsaScenRow');
  row.innerHTML = Object.entries(LSA_SCENARIO_META).map(([k,m]) =>
    `<button class="lsa-btn${k===key?' active':''}" onclick="lsaLoadScenario('${k}')"
      style="${k===key?`background:linear-gradient(135deg,${m.color}22,${m.color}11);border-color:${m.color}88;color:${m.color}`:''}">${m.label}</button>`
  ).join('');
  // Update progress fill color
  const fill = document.getElementById('lsaProgressFill');
  if (fill) fill.style.background = LSA_SCENARIO_META[key].color;
  // Build steps
  lsaSteps = LSA_STEP_DATA[key] || [];
  lsaReset();
}

/* ═══════════════════════════════════════════════════════
   RESIZE
   ═══════════════════════════════════════════════════════ */
function lsaResize() {
  if (!lsaCanvas) return;
  const box = lsaCanvas.parentElement;
  const w = box.clientWidth || box.offsetWidth || 800;
  const h = Math.round(w * 0.56);
  lsaCanvas.width  = w;
  lsaCanvas.height = h;
  lsaCanvas.style.width  = w + 'px';
  lsaCanvas.style.height = h + 'px';
  lsaDraw();
}

/* ═══════════════════════════════════════════════════════
   PLAYBACK
   ═══════════════════════════════════════════════════════ */
function lsaReset() {
  clearTimeout(lsaTimer); lsaPlaying=false;
  cancelAnimationFrame(lsaAnimId);
  lsaFloodPkt.on=false; lsaTrails=[]; lsaPulseRings=[];
  lsaCurrentStep=0;
  const btn=document.getElementById('lsaPlayBtn');
  if(btn){btn.textContent='▶';btn.setAttribute('data-label','PLAY');btn.classList.remove('play-active');}
  lsaUpdatePanel(); lsaDraw();
}

function lsaTogglePlay() {
  lsaPlaying=!lsaPlaying;
  const btn=document.getElementById('lsaPlayBtn');
  if(lsaPlaying){
    btn.textContent='⏸'; btn.setAttribute('data-label','PAUSE'); btn.classList.add('play-active');
    lsaAutoStep();
  } else {
    btn.textContent='▶'; btn.setAttribute('data-label','PLAY'); btn.classList.remove('play-active');
    clearTimeout(lsaTimer);
  }
}

function lsaAutoStep() {
  if(!lsaPlaying)return;
  if(lsaCurrentStep<lsaSteps.length-1){
    lsaGo(1); lsaTimer=setTimeout(lsaAutoStep,lsaSpeedMs);
  } else {
    lsaPlaying=false;
    const btn=document.getElementById('lsaPlayBtn');
    if(btn){btn.textContent='▶';btn.setAttribute('data-label','PLAY');btn.classList.remove('play-active');}
  }
}

function lsaGo(dir) {
  const n=lsaCurrentStep+dir;
  if(n<0||n>=lsaSteps.length)return;
  lsaCurrentStep=n;
  lsaTrails=[];
  const s=lsaSteps[lsaCurrentStep];
  if(s.flood&&s.flood.from&&s.flood.to){
    lsaFloodPkt={ on:true, prog:0, from:s.flood.from, to:s.flood.to, type:s.flood.lsaType, color:LSA_FLD_COLORS[s.flood.lsaType]||'#94a3b8' };
    lsaAnimatePkt();
  } else {
    lsaFloodPkt.on=false; cancelAnimationFrame(lsaAnimId);
    lsaUpdatePanel(); lsaDraw();
  }
}

function lsaSetSpeed(v) {
  document.getElementById('lsaSpdLbl').textContent=parseFloat(v).toFixed(1)+'×';
  lsaSpeedMs=Math.round(4000/parseFloat(v));
  lsaAnimDur=Math.max(400,Math.round(1200/parseFloat(v)));
}

/* ═══════════════════════════════════════════════════════
   PACKET ANIMATION
   ═══════════════════════════════════════════════════════ */
function lsaAnimatePkt() {
  lsaFloodPkt.prog=0; lsaAnimStart=null;
  const tick = ts => {
    if(!lsaAnimStart) lsaAnimStart=ts;
    const raw=Math.min((ts-lsaAnimStart)/lsaAnimDur,1);
    lsaFloodPkt.prog=easeInOutCubic(raw);
    lsaTrails.push({prog:lsaFloodPkt.prog,alpha:1});
    lsaTrails=lsaTrails.map(t=>({...t,alpha:t.alpha-0.05})).filter(t=>t.alpha>0);
    lsaDraw();
    if(raw<1){ lsaAnimId=requestAnimationFrame(tick); }
    else {
      lsaFloodPkt.prog=1; lsaTrails=[];
      // pulse on target
      if(lsaFloodPkt.to&&lsaFloodPkt.to!=='BLOCK'){
        lsaPulseRings=[{rid:lsaFloodPkt.to,t:0}];
        lsaAnimPulse();
      }
      lsaFloodPkt.on=false; lsaDraw(); lsaUpdatePanel();
    }
  };
  lsaAnimId=requestAnimationFrame(tick);
}

function lsaAnimPulse() {
  lsaPulseRings=lsaPulseRings.map(r=>({...r,t:r.t+0.06})).filter(r=>r.t<1);
  lsaDraw();
  if(lsaPulseRings.length>0) requestAnimationFrame(lsaAnimPulse);
}

/* ═══════════════════════════════════════════════════════
   CANVAS DRAW
   ═══════════════════════════════════════════════════════ */
function lsaDraw() {
  if(!lsaCtx)return;
  const W=lsaCanvas.width=lsaCanvas.parentElement.clientWidth;
  const H=lsaCanvas.height=Math.round(W*0.56);
  const ctx=lsaCtx;
  ctx.clearRect(0,0,W,H);

  // background gradient
  const bg=ctx.createLinearGradient(0,0,W,H);
  bg.addColorStop(0,'#040810'); bg.addColorStop(1,'#060d1a');
  ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

  // dot grid
  ctx.fillStyle='rgba(30,48,80,0.3)';
  for(let x=20;x<W;x+=36)for(let y=20;y<H;y+=36){ctx.beginPath();ctx.arc(x,y,1,0,Math.PI*2);ctx.fill();}

  const pos=lsaCalcPos(W,H);
  const step=lsaSteps[lsaCurrentStep]||{};

  // ── Area zones ──
  lsaDrawAreas(ctx,pos,W,H,step);

  // ── Links ──
  lsaDrawLinks(ctx,pos,step);

  // ── Trails ──
  lsaDrawTrails(ctx,pos);

  // ── Flood packet ──
  if(lsaFloodPkt.on) lsaDrawFloodPkt(ctx,pos);

  // ── Pulse rings ──
  lsaPulseRings.forEach(r=>{
    if(pos[r.rid]) lsaDrawPulseRing(ctx,pos[r.rid],r.t,lsaFloodPkt.color||lsaSteps[lsaCurrentStep]?.flood?.color||'#3b82f6');
  });

  // ── Routers ──
  LSA_RTRS.forEach(r=>lsaDrawRouter(ctx,pos[r.id],r,step));

  // ── Block badge (if blocked at boundary) ──
  if(step.blockAt&&pos[step.blockAt]){
    const bp=pos[step.blockAt];
    ctx.fillStyle='#ef444488';
    ctx.font='bold 11px IBM Plex Mono';
    ctx.textAlign='center';
    ctx.fillText('⛔ BLOCKED', bp.x, bp.y-46);
  }
}

function lsaCalcPos(W,H) {
  // Layout: Area 1 (left) | Area 0 (middle) | Area 2 (right)
  // Row 1: R4(Area1) · R1(ABR) · R2(Area0) · R3(ABR) · R6(Area2)
  // Row 2 (lower-centre): R5(Area0) — sits below R2, same horizontal zone
  const row1 = Math.round(H * 0.36);   // main row — slightly higher than centre
  const row2 = Math.round(H * 0.72);   // R5 lower row
  return {
    R1:{ x:Math.round(W*0.24), y:row1 },
    R2:{ x:Math.round(W*0.50), y:row1 },
    R3:{ x:Math.round(W*0.76), y:row1 },
    R4:{ x:Math.round(W*0.09), y:row1 },
    R5:{ x:Math.round(W*0.50), y:row2 },
    R6:{ x:Math.round(W*0.91), y:row1 },
  };
}

function lsaDrawAreas(ctx,pos,W,H,step) {
  // Area 1 zone
  lsaAreaZone(ctx, 0, 0, Math.round(W*0.33), H, '#22c55e', 'Area 1\nStandard');
  // Area 0 zone
  lsaAreaZone(ctx, Math.round(W*0.33), 0, Math.round(W*0.34), H, '#3b82f6', 'Area 0\nBackbone');
  // Area 2 zone
  lsaAreaZone(ctx, Math.round(W*0.67), 0, Math.round(W*0.33), H, '#f59e0b', 'Area 2\nNSSA');
}

function lsaAreaZone(ctx,x,y,w,h,color,label) {
  // Filled zone with rounded feel
  ctx.fillStyle=color+'0d';
  ctx.strokeStyle=color+'2e';
  ctx.lineWidth=1.5;
  ctx.setLineDash([6,4]);
  ctx.beginPath(); ctx.rect(x+2,y+2,w-4,h-4); ctx.fill(); ctx.stroke();
  ctx.setLineDash([]);
  // Label at top-centre of zone
  ctx.fillStyle=color+'66';
  ctx.font='bold 10px IBM Plex Mono';
  ctx.textAlign='center';
  label.split('\n').forEach((l,i)=>ctx.fillText(l, x+w/2, 18+i*13));
}

function lsaDrawLinks(ctx,pos,step) {
  const activeLsaType = step.flood?.lsaType || null;
  LSA_LINKS.forEach(lk=>{
    const a=pos[lk.a], b=pos[lk.b];
    if(!a||!b)return;
    const flooded = step.floodedLinks && step.floodedLinks.some(fl=>(fl.a===lk.a&&fl.b===lk.b)||(fl.a===lk.b&&fl.b===lk.a));
    const blocked = step.blockedLinks && step.blockedLinks.some(fl=>(fl.a===lk.a&&fl.b===lk.b)||(fl.a===lk.b&&fl.b===lk.a));
    const lc = flooded ? (LSA_FLD_COLORS[activeLsaType]||'#22c55e') : blocked ? '#ef4444' : '#1a2640';
    if(flooded){ctx.shadowColor=lc;ctx.shadowBlur=8;}
    ctx.strokeStyle=lc; ctx.lineWidth=flooded?2.5:blocked?1.5:1.5;
    ctx.setLineDash(flooded?[]:[5,4]);
    ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
    ctx.setLineDash([]); ctx.shadowBlur=0;
  });
}

function lsaDrawTrails(ctx,pos) {
  if(!lsaFloodPkt.from||!lsaFloodPkt.to)return;
  const fp=pos[lsaFloodPkt.from], tp=pos[lsaFloodPkt.to];
  if(!fp||!tp)return;
  lsaTrails.forEach(t=>{
    const bx=fp.x+(tp.x-fp.x)*t.prog;
    const by=fp.y+(tp.y-fp.y)*t.prog;
    ctx.globalAlpha=t.alpha*0.35;
    ctx.beginPath(); ctx.arc(bx,by,5,0,Math.PI*2);
    ctx.fillStyle=lsaFloodPkt.color||'#3b82f6'; ctx.fill();
    ctx.globalAlpha=1;
  });
}

function lsaDrawFloodPkt(ctx,pos) {
  const fp=pos[lsaFloodPkt.from], tp=pos[lsaFloodPkt.to];
  if(!fp||!tp)return;
  const t=lsaFloodPkt.prog;
  const bx=fp.x+(tp.x-fp.x)*t;
  const by=fp.y+(tp.y-fp.y)*t;
  const c=lsaFloodPkt.color||'#3b82f6';
  const label=lsaFloodPkt.type;
  // glow
  const grd=ctx.createRadialGradient(bx,by,0,bx,by,32);
  grd.addColorStop(0,c+'55'); grd.addColorStop(0.6,c+'18'); grd.addColorStop(1,'transparent');
  ctx.fillStyle=grd; ctx.beginPath(); ctx.arc(bx,by,32,0,Math.PI*2); ctx.fill();
  // circle
  const inner=ctx.createRadialGradient(bx-5,by-5,0,bx,by,16);
  inner.addColorStop(0,c+'ff'); inner.addColorStop(1,c+'aa');
  ctx.fillStyle=inner; ctx.strokeStyle='#fff4'; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.arc(bx,by,16,0,Math.PI*2); ctx.fill(); ctx.stroke();
  // label
  ctx.fillStyle='#fff'; ctx.font='bold 8px IBM Plex Mono'; ctx.textAlign='center';
  ctx.fillText(label,bx,by+3);
}

function lsaDrawPulseRing(ctx,p,t,color) {
  const r=60*easeOutQuad(t);
  ctx.beginPath(); ctx.arc(p.x,p.y,r,0,Math.PI*2);
  ctx.strokeStyle=color; ctx.globalAlpha=(1-t)*0.7; ctx.lineWidth=2; ctx.stroke();
  ctx.globalAlpha=1;
}

function lsaDrawRouter(ctx,p,rtr,step) {
  if(!p)return;
  const RW=106, RH=34;
  const rx=p.x-RW/2, ry=p.y-RH/2;
  const hasLsa  = step.rotersWithLsa  && step.rotersWithLsa.includes(rtr.id);
  const blocked = step.rotersBlocked  && step.rotersBlocked.includes(rtr.id);
  const lsaColor= LSA_SCENARIO_META[lsaScenario]?.color||'#3b82f6';
  const bc = hasLsa?lsaColor:blocked?'#ef4444':'#1e3050';
  const roleColor={ ABR:'#f59e0b', ASBR:'#8b5cf6', IR:'#3b82f6', DR:'#22c55e' }[rtr.role]||'#3b82f6';

  if(hasLsa){ctx.shadowColor=lsaColor;ctx.shadowBlur=20;}
  const bg=ctx.createLinearGradient(rx,ry,rx,ry+RH);
  bg.addColorStop(0,'#0d1f3a'); bg.addColorStop(1,'#080f1e');
  ctx.fillStyle=bg; ctx.strokeStyle=bc; ctx.lineWidth=hasLsa?2.5:1.5;
  lsaRR(ctx,rx,ry,RW,RH,9); ctx.fill(); ctx.stroke();
  ctx.shadowBlur=0;

  // accent stripe
  const sg=ctx.createLinearGradient(rx,ry,rx+RW,ry);
  sg.addColorStop(0,bc+'00'); sg.addColorStop(0.5,bc+'55'); sg.addColorStop(1,bc+'00');
  ctx.fillStyle=sg;
  ctx.beginPath(); ctx.roundRect(rx,ry,RW,3,[9,9,0,0]); ctx.fill();

  // router ID
  ctx.fillStyle='#ddeeff'; ctx.font='bold 12px IBM Plex Mono'; ctx.textAlign='center';
  ctx.fillText(rtr.id,p.x,p.y-4);
  // RID
  ctx.fillStyle='#4a6a90'; ctx.font='9px IBM Plex Mono';
  ctx.fillText(rtr.rid,p.x,p.y+9);

  // role badge (above)
  ctx.fillStyle=roleColor+'99'; ctx.font='bold 9px IBM Plex Mono';
  ctx.fillText('['+rtr.role+']',p.x,ry-7);

  // LSDB indicator (below)
  const ibw=RW, ibh=18;
  const ibx=rx, iby=ry+RH+5;
  const ic=hasLsa?lsaColor:blocked?'#ef444444':'#1a264088';
  ctx.fillStyle=ic+'22'; ctx.strokeStyle=ic; ctx.lineWidth=1;
  lsaRR(ctx,ibx,iby,ibw,ibh,4); ctx.fill(); ctx.stroke();
  ctx.fillStyle=hasLsa?lsaColor:blocked?'#ef4444':'#2c4470';
  ctx.font='bold 8.5px IBM Plex Mono'; ctx.textAlign='center';
  ctx.fillText(hasLsa?'✔ LSA in LSDB':blocked?'✘ BLOCKED':'— no LSA yet',p.x,iby+12);
}

function lsaRR(ctx,x,y,w,h,r) {
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.arcTo(x+w,y,x+w,y+r,r);
  ctx.lineTo(x+w,y+h-r); ctx.arcTo(x+w,y+h,x+w-r,y+h,r);
  ctx.lineTo(x+r,y+h); ctx.arcTo(x,y+h,x,y+h-r,r);
  ctx.lineTo(x,y+r); ctx.arcTo(x,y,x+r,y,r);
  ctx.closePath();
}

/* ═══════════════════════════════════════════════════════
   PANEL UPDATE
   ═══════════════════════════════════════════════════════ */
function lsaUpdatePanel() {
  const s=lsaSteps[lsaCurrentStep];
  if(!s)return;
  const meta=LSA_SCENARIO_META[lsaScenario];

  // progress
  const pct=lsaSteps.length>1?Math.round((lsaCurrentStep/(lsaSteps.length-1))*100):0;
  const fill=document.getElementById('lsaProgressFill');
  if(fill) fill.style.width=pct+'%';

  document.getElementById('lsaStepTitle').textContent=s.title||'—';
  document.getElementById('lsaStepDesc').innerHTML=s.desc||'—';
  document.getElementById('lsaSNum').textContent=`Step ${lsaCurrentStep+1} / ${lsaSteps.length}`;

  const cliEl=document.getElementById('lsaStepCli');
  if(s.cli){cliEl.style.display='block';cliEl.textContent=s.cli;}else cliEl.style.display='none';
  document.getElementById('lsaStepRfc').textContent=s.rfc||'';
  const ruleEl=document.getElementById('lsaRuleBox');
  if(s.rule){ruleEl.style.display='block';ruleEl.innerHTML=s.rule;}else ruleEl.style.display='none';

  // LSDB table
  const tbody=document.getElementById('lsaDbTbl');
  const roleC={ABR:'#f59e0b',ASBR:'#8b5cf6',IR:'#3b82f6',DR:'#22c55e'};
  tbody.innerHTML=LSA_RTRS.map(r=>{
    const hasLsa=s.rotersWithLsa&&s.rotersWithLsa.includes(r.id);
    const blocked=s.rotersBlocked&&s.rotersBlocked.includes(r.id);
    const lsas=(s.lsaDb&&s.lsaDb[r.id])||[];
    const rc=roleC[r.role]||'#3b82f6';
    return `<tr>
      <td style="color:${rc};font-weight:700">${r.id}</td>
      <td style="color:#3b5278">${r.area}</td>
      <td><span style="background:${rc}22;color:${rc};border:1px solid ${rc}44;padding:1px 6px;border-radius:3px;font-size:9px;font-weight:700">${r.role}</span></td>
      <td>${lsas.length?lsas.map(l=>`<span class="lsa-db-entry" style="background:${LSA_FLD_COLORS[l]||'#1e3050'}22;color:${LSA_FLD_COLORS[l]||'#64748b'};border:1px solid ${LSA_FLD_COLORS[l]||'#1e3050'}55">${l}</span>`).join(''):'<span style="color:#1e3050;font-size:9px">—</span>'}
      ${blocked?'<span style="color:#ef4444;font-size:9px;margin-left:4px">⛔ blocked</span>':''}
      </td>
    </tr>`;
  }).join('');

  // Log
  const logEl=document.getElementById('lsaLog');
  logEl.innerHTML=lsaSteps.map((st,i)=>{
    const cls=i===lsaCurrentStep?'lsa-log-item cur':'lsa-log-item';
    return `<div class="${cls}">${i+1}. ${st.log||st.title}</div>`;
  }).join('');
  // Scroll INSIDE the log box only — never let scrollIntoView touch the page scroll
  const curEl = logEl.querySelector('.cur');
  if (curEl) {
    const target = curEl.offsetTop - logEl.offsetTop - (logEl.clientHeight / 2) + (curEl.clientHeight / 2);
    logEl.scrollTo({ top: Math.max(0, target), behavior: 'smooth' });
  }

  // Wireshark
  lsaUpdateWireshark(s);
}

function lsaUpdateWireshark(s) {
  const badge=document.getElementById('lsaPktBadge');
  const body=document.getElementById('lsaPktBody');
  const c=LSA_SCENARIO_META[lsaScenario]?.color||'#3b82f6';
  if(!s.lsaFields){
    badge.textContent='— No LSA'; badge.style.background='#0d1526';
    badge.style.color='#2c4470'; badge.style.border='1px solid #1a2640';
    body.innerHTML='<div class="lsa-no-pkt">No LSA captured at this step</div>'; return;
  }
  badge.textContent=s.lsaBadge||'LSA';
  badge.style.background=c+'1a'; badge.style.color=c; badge.style.border=`1px solid ${c}44`;
  body.innerHTML=`<table class="lsa-pkt-tbl">
    <thead><tr><th>Field</th><th>Value</th><th>Notes</th></tr></thead>
    <tbody>${s.lsaFields.map(f=>`<tr><td>${f.f}</td><td>${f.v}</td><td>${f.n}</td></tr>`).join('')}</tbody>
  </table>`;
}

/* ═══════════════════════════════════════════════════════════════════════════
   STEP DATA — ALL 6 LSA TYPES
   ═══════════════════════════════════════════════════════════════════════════ */
const LSA_STEP_DATA = {

/* ══════════════════════════════════════════════════════
   TYPE 1 — Router LSA
   Generated by: every OSPF router
   Scope: within ONE area only
   ══════════════════════════════════════════════════════ */
type1: [
  {
    title:'Type 1 — Router LSA Overview',
    log:'Type 1 Router LSA — every router originates',
    desc:'<b>Router LSA (Type 1)</b> is generated by <b>every OSPF router</b> in the domain. It describes all of the router\'s OSPF-enabled interfaces within a specific area and their associated costs.<br><br><b>Flooding scope: within one area only.</b> Router LSAs never cross area boundaries — they are stopped by ABRs. R1 (ABR) maintains separate Router LSAs for Area 0 and Area 1.',
    rfc:'RFC 2328 §12.4.1 — Router LSA originates every router, area scope',
    rule:'<b>Key rule:</b> Router LSA is the foundation of SPF. Every router runs Dijkstra against the Type 1/2 LSAs to build its shortest path tree.',
    rotersWithLsa:[], rotersBlocked:[], lsaDb:{ R1:[],R2:[],R3:[],R4:[],R5:[],R6:[] },
    floodedLinks:[], blockedLinks:[], flood:null, lsaFields:null,
  },
  {
    title:'Step 1 — R4 Generates Router LSA in Area 1',
    log:'R4 → Type 1 Router LSA generated (Area 1)',
    desc:'R4 (Internal Router in Area 1) originates its <b>Type 1 Router LSA</b>. This LSA describes R4\'s single interface in Area 1 (link to R1, cost=1) and its loopback (4.4.4.4/32, cost=0).<br><br>The LSA is given initial sequence number <b>0x80000001</b> and flooded out all Area 1 interfaces.',
    cli:'show ip ospf database router 4.4.4.4\n! OSPF Router with ID (4.4.4.4) (Process ID 1)\n! Router Link States (Area 1)\n! LS Type: Router Links\n! Link State ID: 4.4.4.4\n! Adv Router: 4.4.4.4\n! Seq#: 0x80000001  Checksum: 0xA3C7  Length: 36',
    rfc:'RFC 2328 §12.4.1',
    rule:'<b>Origination triggers:</b> Interface state change, neighbor state change, every 30 minutes (LSRefreshTime).',
    rotersWithLsa:['R4'], rotersBlocked:[], lsaDb:{ R1:[],R2:[],R3:[],R4:['T1'],R5:[],R6:[] },
    floodedLinks:[], blockedLinks:[], flood:null,
    lsaBadge:'Type 1 · Router LSA · R4',
    lsaFields:[
      {f:'LS Age',         v:'0',           n:'Freshly originated'},
      {f:'Options',        v:'0x22 (E=1)',   n:'External capable, Area 1'},
      {f:'LS Type',        v:'1 (Router)',   n:'Router LSA'},
      {f:'Link State ID',  v:'4.4.4.4',     n:'= R4 Router ID'},
      {f:'Adv. Router',    v:'4.4.4.4',     n:'R4 originated this LSA'},
      {f:'Seq Number',     v:'0x80000001',  n:'Initial sequence, first origination'},
      {f:'Checksum',       v:'0xA3C7',      n:'Fletcher checksum over LSA body'},
      {f:'Length',         v:'36 bytes',    n:'Header(20) + Body(16): 1 P2P link + 1 stub'},
      {f:'Router Flags',   v:'0x00',        n:'Not ABR (B=0), not ASBR (E=0)'},
      {f:'# of Links',     v:'2',           n:'Link to R1 (P2P) + Loopback (stub)'},
      {f:'Link#1 Type',    v:'1 (P2P)',     n:'Point-to-point to R1'},
      {f:'Link#1 ID',      v:'10.1.0.1',   n:'R1 interface IP on P2P link'},
      {f:'Link#1 Metric',  v:'1',           n:'Cost = 100Mbps / GigE = 1'},
      {f:'Link#2 Type',    v:'3 (Stub)',    n:'R4 loopback network'},
      {f:'Link#2 ID',      v:'4.4.4.4',    n:'Loopback IP'},
      {f:'Link#2 Metric',  v:'0',           n:'Loopback cost = 0'},
    ]
  },
  {
    title:'Step 2 — R4 Router LSA Floods to R1 (ABR) in Area 1',
    log:'R4 → LSU (Type 1) → R1',
    desc:'R4 sends its Router LSA to neighbor <b>R1</b> via LSU. R1 receives it, installs it in its <b>Area 1 LSDB</b>, and sends an LSAck back to R4.<br><br>R1 now has R4\'s Router LSA in its Area 1 LSDB and can run SPF for Area 1.',
    cli:'show ip ospf database router 4.4.4.4  ! on R1\n! Now shows R4\'s Router LSA in Area 1',
    rfc:'RFC 2328 §13.3 — Flooding a received LSA',
    rotersWithLsa:['R4','R1'], rotersBlocked:[], lsaDb:{ R1:['T1'],R2:[],R3:[],R4:['T1'],R5:[],R6:[] },
    floodedLinks:[{a:'R4',b:'R1'}], blockedLinks:[], flood:{ from:'R4', to:'R1', lsaType:'T1' },
  },
  {
    title:'Step 3 — Router LSA BLOCKED at ABR (R1) — Cannot Enter Area 0',
    log:'T1 BLOCKED at R1 ABR — cannot cross into Area 0',
    desc:'<b>This is the most important rule for Type 1 LSAs:</b> R1 (ABR) does <b>NOT</b> forward R4\'s Router LSA into Area 0. Router LSAs are <b>strictly area-scoped</b>.<br><br>Instead, R1 will generate a <b>Type 3 Summary LSA</b> that represents R4\'s prefix in Area 0. The routers in Area 0 never see R4\'s Router LSA directly — they only see R1\'s summary.',
    cli:'show ip ospf database  ! on R2 (in Area 0)\n! Area 0 LSDB: Does NOT contain 4.4.4.4 Router LSA\n! (R1 blocks it — generates Type 3 instead)',
    rfc:'RFC 2328 §12.4.3 — Router LSA flooding scope: one area only',
    rule:'<b>Router LSA crosses NO area boundaries.</b> ABRs summarize inter-area topology via Type 3 LSAs. This containment of SPF computation is the primary reason areas exist.',
    rotersWithLsa:['R4','R1'], rotersBlocked:['R2','R3','R5'], blockAt:'R2',
    lsaDb:{ R1:['T1'],R2:[],R3:[],R4:['T1'],R5:[],R6:[] },
    floodedLinks:[{a:'R4',b:'R1'}], blockedLinks:[{a:'R1',b:'R2'},{a:'R1',b:'R5'}],
    flood:null, lsaFields:null,
  },
  {
    title:'Step 4 — All Area 1 Routers Have Type 1 LSAs',
    log:'Area 1 LSDB complete — R1 & R4 Router LSAs present',
    desc:'Both R1 and R4 have flooded their Router LSAs within Area 1. The Area 1 LSDB now contains:<br><br>• <b>R1\'s Router LSA</b> — describes R1\'s links in Area 1<br>• <b>R4\'s Router LSA</b> — describes R4\'s links<br><br>Each router runs SPF independently and computes identical shortest-path trees for Area 1. Both reach Full adjacency.<br><br>Similarly, all Area 0 routers (R1,R2,R3,R5) exchange their Type 1 LSAs within Area 0, and Area 2 routers (R3,R6) do the same.',
    cli:'show ip ospf database router  ! on R4\n! Area 1 full LSDB:\n! 1.1.1.1 (R1) Router LSA — links in Area 1\n! 4.4.4.4 (R4) Router LSA — links in Area 1\n\nshow ip ospf database router  ! on R2 (Area 0)\n! Area 0 LSDB: 1.1.1.1, 2.2.2.2, 3.3.3.3, 5.5.5.5',
    rfc:'RFC 2328 §10.3 — LSDB synchronization leads to Full adjacency',
    rotersWithLsa:['R1','R2','R3','R4','R5','R6'], rotersBlocked:[],
    lsaDb:{ R1:['T1'],R2:['T1'],R3:['T1'],R4:['T1'],R5:['T1'],R6:['T1'] },
    floodedLinks:[{a:'R4',b:'R1'},{a:'R1',b:'R2'},{a:'R2',b:'R3'},{a:'R2',b:'R5'},{a:'R3',b:'R6'}],
    blockedLinks:[], flood:null, lsaFields:null,
  },
  {
    title:'Step 5 — ABR Dual Router LSA: R1 Generates One per Area',
    log:'R1 (ABR) generates separate Type 1 LSA for Area 0 AND Area 1',
    desc:'<b>ABRs originate a separate Router LSA for EACH area they participate in.</b> R1 is attached to Area 0 and Area 1, so it maintains two distinct Type 1 LSAs:<br><br>• <b>R1 Router LSA in Area 0</b>: lists R1\'s interface 10.0.0.1 (link to R2, R3, R5) with Area 0 cost<br>• <b>R1 Router LSA in Area 1</b>: lists R1\'s interface 10.1.0.1 (link to R4) with Area 1 cost<br><br>Each LSA has the same Advertising Router (1.1.1.1) but different link descriptions and different sequence number counters — they are completely independent. R4 only sees R1\'s Area 1 Router LSA. R2 only sees R1\'s Area 0 Router LSA.<br><br>The <b>B-bit (ABR bit)</b> is set in both LSAs to indicate R1 is an Area Border Router.',
    cli:'show ip ospf database router 1.1.1.1  ! on R4 (Area 1)\n! Area 1 LSDB — R1 Router LSA:\n! B-bit=1 (ABR), E-bit=0 (not ASBR)\n! Link#1: 10.1.0.1 → R4 (P2P, cost 1)\n\nshow ip ospf database router 1.1.1.1  ! on R2 (Area 0)\n! Area 0 LSDB — R1 Router LSA:\n! B-bit=1 (ABR), Links to R2/R3/R5\n! Different from Area 1 version!',
    rfc:'RFC 2328 §12.4.1 — ABR originates separate router-LSA per area',
    rule:'<b>Critical:</b> R1\'s Area 1 Router LSA is invisible in Area 0 and vice versa. ABRs are the partition point — they carry separate LSDB entries for each area. The B-bit in the Router LSA flags the router as an ABR to all its neighbors.',
    rotersWithLsa:['R1','R2','R3','R4','R5','R6'], rotersBlocked:[],
    lsaDb:{ R1:['T1'],R2:['T1'],R3:['T1'],R4:['T1'],R5:['T1'],R6:['T1'] },
    floodedLinks:[{a:'R1',b:'R2'},{a:'R1',b:'R4'}], blockedLinks:[],
    flood:null,
    lsaBadge:'Type 1 · R1 ABR · Dual-Area Router LSA',
    lsaFields:[
      {f:'LS Type',         v:'1 (Router)',    n:'Router LSA — area-scoped'},
      {f:'Link State ID',   v:'1.1.1.1',      n:'R1\'s Router ID'},
      {f:'Adv. Router',     v:'1.1.1.1',      n:'R1 owns both LSAs (Area 0 and Area 1 versions)'},
      {f:'Router Flags (B)',v:'B=1',           n:'B-bit set: R1 is an ABR connecting multiple areas'},
      {f:'Router Flags (E)',v:'E=0',           n:'E-bit clear: R1 is NOT an ASBR'},
      {f:'Area 1 Links',    v:'1 P2P + 1 Stub',n:'Interface 10.1.0.1 to R4 + loopback stub network'},
      {f:'Area 0 Links',    v:'1 Transit + Stubs',n:'Broadcast interface to Area 0 segment'},
      {f:'Scope',           v:'Per-area',      n:'R4 sees Area 1 version only; R2 sees Area 0 version only'},
    ]
  },
  {
    title:'Step 6 — LSA Aging, Refresh, and MaxAge Flushing',
    log:'LSA age counter: 0→1800 (refresh) → 3600 (MaxAge/flush)',
    desc:'<b>Every LSA carries an LS Age field</b> (in seconds) that starts at 0 and increments as it traverses the network and sits in LSDBs. Three critical timers govern LSA lifecycle:<br><br>• <b>LSRefreshTime (1800s / 30 min)</b>: The originating router re-originates the LSA with an incremented sequence number to keep it alive. Without this, peers would discard it at MaxAge.<br>• <b>MaxAge (3600s / 60 min)</b>: An LSA that reaches age 3600 is considered stale and must be flushed from all LSDBs. The originator explicitly sets Age=MaxAge to withdraw a route (e.g., interface goes down).<br>• <b>MinLSArrival (1 sec)</b>: A router discards duplicate LSAs arriving within 1 second of each other — prevents flooding storms.<br><br>When an LSA is MAX-AGED, it is re-flooded with Age=3600 to notify all neighbors to delete it, then an LSAck confirms receipt.',
    cli:'show ip ospf database router 4.4.4.4  ! on R1\n! LS Age: 347          ← 347 seconds since originated\n! Sequence Number: 0x80000003  ← refreshed twice (1800s each)\n\n! Sequence number space: 0x80000001 → 0x7FFFFFFF (wrap around)\n! Each origination increments by 1\n\ndebug ip ospf lsa-generation  ! watch refresh events\n! %OSPF: LSA update timer fired — refreshing Router LSA 4.4.4.4',
    rfc:'RFC 2328 §14 — LSA aging: MinLSInterval=5s, LSRefreshTime=1800s, MaxAge=3600s',
    rule:'<b>Sequence number wrap:</b> Sequence numbers go from 0x80000001 to 0x7FFFFFFF (about 2 billion increments). When the maximum is reached, the router ages its LSA to MaxAge, waits for it to be flushed, then re-originates at 0x80000001. This is called "premature aging." In practice this almost never happens.',
    rotersWithLsa:['R1','R2','R3','R4','R5','R6'], rotersBlocked:[],
    lsaDb:{ R1:['T1'],R2:['T1'],R3:['T1'],R4:['T1'],R5:['T1'],R6:['T1'] },
    floodedLinks:[], blockedLinks:[], flood:null, lsaFields:null,
  },
  {
    title:'Step 7 — SPF Computation Triggered by Type 1/2 Changes',
    log:'Type 1/2 change → SPF timer → Dijkstra runs → RIB update',
    desc:'<b>Every Type 1 (Router) or Type 2 (Network) LSA change triggers SPF recalculation</b> within the affected area. The SPF algorithm is NOT run instantly — OSPF uses SPF throttle timers to dampen rapid topology changes:<br><br>1. LSA arrives → installed in LSDB<br>2. <b>SPF delay timer</b> fires (default 5000ms initial, 10s min hold, 10s max wait on Cisco IOS)<br>3. Dijkstra runs on the full intra-area LSDB (Type 1 + Type 2 LSAs only)<br>4. Shortest path tree computed — each router as root<br>5. Intra-area routes installed into RIB<br>6. ABRs then re-compute inter-area summaries (Type 3) based on new intra-area SPF<br><br><b>Type 3, 4, 5 LSAs do NOT trigger full SPF</b> — they use a lighter incremental calculation (partial SPF or "iSPF"). Only Type 1/2 changes trigger full Dijkstra.',
    cli:'show ip ospf  ! check SPF timers\n! Initial SPF schedule delay 5000 msecs\n! Minimum hold time between two consecutive SPFs 10000 msecs\n! Maximum wait time between two consecutive SPFs 10000 msecs\n\nshow ip ospf statistics  ! SPF run count\n! SPF algorithm executed 12 times\n! Last executed 00:02:14.832 ago\n! Duration: 4ms (small topology)',
    rfc:'RFC 2328 §16.1 — Calculating the shortest-path tree; RFC 3137 — SPF throttling',
    rule:'<b>iSPF (Incremental SPF):</b> Cisco IOS supports "ospf ispf" which runs partial SPF for leaf-node changes, avoiding a full Dijkstra rerun. Only changes affecting the core topology (transit links, ABRs) trigger full SPF.',
    rotersWithLsa:['R1','R2','R3','R4','R5','R6'], rotersBlocked:[],
    lsaDb:{ R1:['T1'],R2:['T1'],R3:['T1'],R4:['T1'],R5:['T1'],R6:['T1'] },
    floodedLinks:[], blockedLinks:[], flood:null, lsaFields:null,
  },
],

/* ══════════════════════════════════════════════════════
   TYPE 2 — Network LSA
   Generated by: DR only (broadcast segments)
   Scope: within ONE area only
   ══════════════════════════════════════════════════════ */
type2: [
  {
    title:'Type 2 — Network LSA Overview',
    log:'Type 2 Network LSA — DR only, broadcast segments',
    desc:'<b>Network LSA (Type 2)</b> is generated <b>only by the Designated Router (DR)</b> on a broadcast or NBMA segment. It exists to represent the multi-access network as a pseudonode in the SPF topology — linking all routers on the segment.<br><br>On the Area 0 backbone, assume R2 is the DR on the 10.0.0.0/24 segment (containing R1, R2, R3, R5).<br><br><b>Flooding scope: within one area only.</b> Same as Type 1 — never crosses area boundaries.',
    rfc:'RFC 2328 §12.4.2 — Network LSA generated by DR',
    rule:'<b>Why Type 2 exists:</b> Without it, each router on a broadcast segment would need a separate P2P link description to every other router. The Network LSA represents the entire broadcast segment as a single node in SPF.',
    rotersWithLsa:[], rotersBlocked:[], lsaDb:{ R1:[],R2:[],R3:[],R4:[],R5:[],R6:[] },
    floodedLinks:[], blockedLinks:[], flood:null, lsaFields:null,
  },
  {
    title:'Step 1 — R2 (DR) Generates Network LSA for Area 0 Segment',
    log:'R2 (DR) → Type 2 Network LSA generated',
    desc:'R2 is elected DR on the Area 0 broadcast segment. R2 originates a <b>Network LSA</b> that lists all routers on this segment: <b>R1, R2, R3, R5</b>.<br><br>The Network LSA\'s Link State ID = R2\'s interface IP (10.0.0.2). It contains the subnet mask and a list of all attached router RIDs.',
    cli:'show ip ospf database network\n! Network Link States (Area 0)\n! Routing Bit Set on this LSA in topology Base with MTID 0\n! LS Type: Network Links\n! Link State ID: 10.0.0.2 (address of Designated Router)\n! Adv Router: 2.2.2.2  (R2 = DR)\n! Attached Router: 1.1.1.1, 2.2.2.2, 3.3.3.3, 5.5.5.5',
    rfc:'RFC 2328 §12.4.2',
    rotersWithLsa:['R2'], rotersBlocked:[], lsaDb:{ R1:[],R2:['T2'],R3:[],R4:[],R5:[],R6:[] },
    floodedLinks:[], blockedLinks:[], flood:null,
    lsaBadge:'Type 2 · Network LSA · R2 (DR)',
    lsaFields:[
      {f:'LS Age',           v:'1',           n:'Just originated'},
      {f:'LS Type',          v:'2 (Network)', n:'Network LSA — DR only'},
      {f:'Link State ID',    v:'10.0.0.2',   n:'DR\'s interface IP on this segment'},
      {f:'Adv. Router',      v:'2.2.2.2',    n:'R2 = DR originated this LSA'},
      {f:'Seq Number',       v:'0x80000001', n:'Initial sequence'},
      {f:'Length',           v:'32 bytes',   n:'Header(20) + mask(4) + 4 RIDs × 2B'},
      {f:'Network Mask',     v:'255.255.255.0', n:'/24 broadcast segment'},
      {f:'Attached Router 1',v:'1.1.1.1',   n:'R1 is on this segment'},
      {f:'Attached Router 2',v:'2.2.2.2',   n:'R2 (DR) is on this segment'},
      {f:'Attached Router 3',v:'3.3.3.3',   n:'R3 is on this segment'},
      {f:'Attached Router 4',v:'5.5.5.5',   n:'R5 is on this segment'},
    ]
  },
  {
    title:'Step 2 — Network LSA Floods to All Area 0 Routers',
    log:'R2 → Network LSA → R1, R3, R5 (Area 0)',
    desc:'R2 floods the Network LSA to all Area 0 DROthers (R1, R3, R5). The LSU goes to <b>224.0.0.5</b> (AllSPFRouters). All three install it in their Area 0 LSDB and ACK.<br><br>Now every Area 0 router knows the full broadcast segment topology and can run SPF.',
    cli:'show ip ospf database network  ! on R1, R3, R5\n! All show 10.0.0.2 Network LSA',
    rfc:'RFC 2328 §13.3 — DR floods LSU to 224.0.0.5',
    rotersWithLsa:['R1','R2','R3','R5'], rotersBlocked:['R4','R6'],
    lsaDb:{ R1:['T2'],R2:['T2'],R3:['T2'],R4:[],R5:['T2'],R6:[] },
    floodedLinks:[{a:'R2',b:'R1'},{a:'R2',b:'R3'},{a:'R2',b:'R5'}],
    blockedLinks:[], flood:{ from:'R2', to:'R1', lsaType:'T2' },
  },
  {
    title:'Step 3 — Network LSA BLOCKED — Never Crosses ABR',
    log:'T2 BLOCKED at ABRs R1 and R3',
    desc:'Like Router LSAs, Network LSAs are <b>area-scoped</b>. R1 (ABR) does NOT forward this Network LSA into Area 1. R3 (ABR) does NOT forward it into Area 2.<br><br><b>R4 and R6 never see this Network LSA.</b> They learn about the Area 0 broadcast segment via Type 3 Summary LSAs generated by their respective ABRs.',
    cli:'show ip ospf database  ! on R4 (Area 1)\n! Area 1 LSDB: No Network LSA from Area 0\n! (R1 ABR blocks it — generates Type 3 instead)',
    rfc:'RFC 2328 §12.4.3 — Network LSA flooding scope: one area only',
    rule:'<b>Type 1 and Type 2 LSAs are always area-scoped.</b> Together they represent the complete intra-area topology used by SPF. No intra-area LSA ever leaves its area.',
    rotersWithLsa:['R1','R2','R3','R5'], rotersBlocked:['R4','R6'],
    lsaDb:{ R1:['T2'],R2:['T2'],R3:['T2'],R4:[],R5:['T2'],R6:[] },
    floodedLinks:[{a:'R2',b:'R1'},{a:'R2',b:'R3'},{a:'R2',b:'R5'}],
    blockedLinks:[{a:'R1',b:'R4'},{a:'R3',b:'R6'}],
    flood:null, lsaFields:null,
  },
  {
    title:'Step 4 — DR Failure: Network LSA Flushed, BDR Takes Over',
    log:'DR (R2) fails → BDR becomes new DR → new Network LSA originated',
    desc:'When the <b>DR (R2) fails</b>, the following sequence occurs:<br><br>1. <b>BDR detects DR loss</b> (Dead interval expires ~40 sec)<br>2. BDR (say R5, pri=50) transitions from BDR → <b>DR</b> immediately (no re-election delay)<br>3. New DR (R5) <b>originates a brand-new Network LSA</b> with its own interface IP as Link State ID<br>4. R2\'s old Network LSA is aged to <b>MaxAge (3600)</b> and re-flooded to signal deletion<br>5. All Area 0 routers flush R2\'s Network LSA and install R5\'s new one<br>6. <b>A new BDR election occurs</b> among remaining DROthers<br>7. SPF runs as the Network LSA changed (new pseudonode, new attached router list)<br><br>Until a new BDR is elected, the segment has only a DR — a critical window where a second failure would restart the entire election process.',
    cli:'! Before failure:\nshow ip ospf neighbor  ! R2=DR, R5=BDR, R1=DROther, R3=DROther\n\n! After R2 fails (simulate with shutdown):\ndebug ip ospf adj\n! %OSPF: DR/BDR election on GigE: new DR=R5 (5.5.5.5)\n! %OSPF: MaxAge LSA 10.0.0.2 (R2 Network LSA) being flushed\n\nshow ip ospf database network  ! on R1\n! NEW: Network LSA Link State ID: 10.0.0.5 (R5 interface)\n! Adv Router: 5.5.5.5 (new DR)',
    rfc:'RFC 2328 §9.4 — DR/BDR election; §13.5 — Premature aging of self-originated LSAs',
    rule:'<b>Non-preemption rule:</b> When R2 comes back up, it does NOT reclaim the DR role. R5 remains DR. R2 becomes a DROther or BDR depending on priority. This is by design — constant DR changes destabilize the network.',
    rotersWithLsa:['R1','R3','R5'], rotersBlocked:['R4','R6'],
    lsaDb:{ R1:['T2'],R2:[],R3:['T2'],R4:[],R5:['T2'],R6:[] },
    floodedLinks:[{a:'R5',b:'R1'},{a:'R5',b:'R3'}], blockedLinks:[{a:'R1',b:'R4'},{a:'R3',b:'R6'}],
    flood:{ from:'R5', to:'R1', lsaType:'T2' },
    lsaBadge:'Type 2 · New Network LSA · R5 (new DR)',
    lsaFields:[
      {f:'LS Type',           v:'2 (Network)', n:'New Network LSA after DR failover'},
      {f:'Link State ID',     v:'10.0.0.5',   n:'R5\'s interface IP — new DR on segment'},
      {f:'Adv. Router',       v:'5.5.5.5',    n:'R5 is now DR and owns this LSA'},
      {f:'Seq Number',        v:'0x80000001', n:'Fresh start — new DR generates new LSA'},
      {f:'Attached Router 1', v:'1.1.1.1',    n:'R1 still on segment'},
      {f:'Attached Router 2', v:'3.3.3.3',    n:'R3 still on segment'},
      {f:'Attached Router 3', v:'5.5.5.5',    n:'R5 (new DR) on segment'},
      {f:'Absent',            v:'2.2.2.2',    n:'R2 removed — it is down, not listed'},
    ]
  },
  {
    title:'Step 5 — Pseudonode Model: How Type 2 Shapes the SPF Tree',
    log:'Network LSA creates pseudonode — represents broadcast segment in SPF graph',
    desc:'<b>The Network LSA introduces a "pseudonode" into the SPF topology.</b> Instead of modeling a broadcast segment as N×(N-1)/2 point-to-point links (which scales badly), OSPF represents it as a <b>virtual node</b> (pseudonode) connected to all routers on the segment.<br><br><b>Without pseudonode (N=4 routers):</b> Would need 6 bidirectional links → 12 link records in Router LSAs.<br><b>With pseudonode:</b> 4 links to pseudonode + 1 Network LSA = 5 entries total. Massive LSDB savings.<br><br><b>SPF graph structure (Area 0 example):</b><br>R1 → Pseudonode_10.0.0.2 (cost 1)<br>R2 → Pseudonode_10.0.0.2 (cost 0, DR owns it)<br>R3 → Pseudonode_10.0.0.2 (cost 1)<br>R5 → Pseudonode_10.0.0.2 (cost 1)<br>Pseudonode → {R1, R2, R3, R5} (cost 0 always)<br><br>The Dijkstra algorithm traverses pseudonodes at zero cost — they are purely topological devices, not real routers.',
    cli:'show ip ospf database router 2.2.2.2  ! R2 Router LSA\n! Link: to 10.0.0.2 (pseudonode) — Type Transit, cost 0\n! (DR links to its own Network LSA at cost 0)\n\nshow ip ospf database router 1.1.1.1  ! R1 Router LSA\n! Link: to 10.0.0.2 (pseudonode) — Type Transit, cost 1\n! (DROther links to pseudonode with its interface cost)',
    rfc:'RFC 2328 §12.4.2 — Network LSA and pseudonode; §16.1.1 — SPF with pseudonodes',
    rule:'<b>Transit link cost rule:</b> In Router LSAs, the link to the pseudonode (transit network) has cost = the router\'s actual interface cost. The pseudonode\'s links back to all routers always have cost 0. SPF cost flows: R1 to R3 via pseudonode = cost(R1→PN) + cost(PN→R3) = 1 + 0 = 1.',
    rotersWithLsa:['R1','R2','R3','R5'], rotersBlocked:['R4','R6'],
    lsaDb:{ R1:['T2'],R2:['T2'],R3:['T2'],R4:[],R5:['T2'],R6:[] },
    floodedLinks:[{a:'R2',b:'R1'},{a:'R2',b:'R3'},{a:'R2',b:'R5'}],
    blockedLinks:[{a:'R1',b:'R4'},{a:'R3',b:'R6'}],
    flood:null, lsaFields:null,
  },
],

/* ══════════════════════════════════════════════════════
   TYPE 3 — Summary LSA
   Generated by: ABRs only
   Scope: inter-area (one area → adjacent area, not full domain)
   ══════════════════════════════════════════════════════ */
type3: [
  {
    title:'Type 3 — Summary LSA Overview',
    log:'Type 3 Summary LSA — ABR generated, inter-area',
    desc:'<b>Summary LSA (Type 3)</b> is generated by <b>ABRs</b> to advertise prefixes from one area into adjacent areas. It is the inter-area routing mechanism.<br><br>When R1 (ABR) learns about 10.1.0.2/32 (R4\'s loopback) from Area 1\'s Router LSA, it generates a Type 3 Summary LSA and floods it into Area 0. R3 (ABR) then re-generates another Type 3 to flood into Area 2.<br><br><b>Critical:</b> Type 3 LSAs do NOT pass through areas — ABRs regenerate them. They also carry the full metric (accumulated cost).',
    rfc:'RFC 2328 §12.4.3 — Summary LSA: ABR advertises inter-area routes',
    rule:'<b>Distance Vector at the area boundary:</b> OSPF uses link-state within an area but behaves like distance-vector between areas (Type 3 carries cost, not topology). This is why inter-area loops are possible without area 0.',
    rotersWithLsa:[], rotersBlocked:[], lsaDb:{ R1:[],R2:[],R3:[],R4:[],R5:[],R6:[] },
    floodedLinks:[], blockedLinks:[], flood:null, lsaFields:null,
  },
  {
    title:'Step 1 — R1 (ABR) Generates Type 3 for R4\'s Loopback',
    log:'R1 generates Type 3 Summary LSA for 4.4.4.4/32',
    desc:'R1 learns R4\'s loopback (4.4.4.4/32, cost=1) from the Area 1 LSDB. As ABR, R1 originates a <b>Type 3 Summary LSA</b> and floods it into <b>Area 0</b>.<br><br>The Type 3 carries: prefix=4.4.4.4/32, metric=1 (cost from R1 to R4). Area 0 routers add their own cost to R1 to get the total path cost.',
    cli:'show ip ospf database summary  ! on R2 (Area 0)\n! Type-3 AS Summary Link States\n! 4.4.4.4  [1] via 1.1.1.1 (R1 ABR)',
    rfc:'RFC 2328 §12.4.3',
    rotersWithLsa:['R1','R4'], rotersBlocked:[], lsaDb:{ R1:['T1','T3'],R2:[],R3:[],R4:['T1'],R5:[],R6:[] },
    floodedLinks:[{a:'R4',b:'R1'}], blockedLinks:[], flood:null,
    lsaBadge:'Type 3 · Summary LSA · R1→Area0',
    lsaFields:[
      {f:'LS Type',        v:'3 (Summary)',   n:'Inter-area summary from ABR'},
      {f:'Link State ID',  v:'4.4.4.4',      n:'Destination prefix being summarized'},
      {f:'Adv. Router',    v:'1.1.1.1',      n:'R1 ABR originated this Summary LSA'},
      {f:'Seq Number',     v:'0x80000001',   n:'Initial — R1 generates fresh LSA'},
      {f:'Length',         v:'28 bytes',     n:'Fixed size for Summary LSA'},
      {f:'Network Mask',   v:'255.255.255.255', n:'/32 loopback prefix'},
      {f:'Metric (Cost)',  v:'1',            n:'Cost from R1 to 4.4.4.4 in Area 1'},
    ]
  },
  {
    title:'Step 2 — Type 3 Floods into Area 0 (R2, R3, R5)',
    log:'R1 → Type 3 → R2, R3, R5 (Area 0)',
    desc:'R1 floods the Summary LSA to all Area 0 neighbors. R2, R3, and R5 install it in their LSDB and compute routes to 4.4.4.4/32 via R1.<br><br><b>Cost calculation at R2:</b> R2→R1 cost(1) + R1→R4 cost(1) = total <b>cost 2</b> to reach 4.4.4.4.',
    cli:'show ip route ospf  ! on R2\n! O IA 4.4.4.4/32 [110/2] via 10.0.0.1 (R1)\n!                  (IA = Inter-Area)',
    rfc:'RFC 2328 §16.2 — Inter-area route calculation using Type 3',
    rotersWithLsa:['R1','R2','R3','R4','R5'], rotersBlocked:[],
    lsaDb:{ R1:['T1','T3'],R2:['T3'],R3:['T3'],R4:['T1'],R5:['T3'],R6:[] },
    floodedLinks:[{a:'R1',b:'R2'},{a:'R2',b:'R3'},{a:'R2',b:'R5'}],
    blockedLinks:[], flood:{ from:'R1', to:'R2', lsaType:'T3' },
  },
  {
    title:'Step 3 — R3 (ABR) Re-generates Type 3 for Area 2',
    log:'R3 re-generates Type 3 → floods into Area 2',
    desc:'R3 (ABR, Area 0/Area 2) receives the Type 3 from Area 0. R3 does NOT forward R1\'s Type 3 into Area 2. Instead, R3 <b>originates a NEW Type 3</b> for Area 2 with:<br>• Prefix = 4.4.4.4/32<br>• Metric = R3\'s total cost to reach 4.4.4.4 (cost of 2 via R2→R1→R4 = total 3)<br>• Advertising Router = 3.3.3.3 (R3, not R1)<br><br>This is how Type 3 LSAs hop across areas — each ABR regenerates them.',
    cli:'show ip ospf database summary  ! on R6 (Area 2)\n! Type-3 Summary, Adv Router: 3.3.3.3\n! 4.4.4.4  [110/3] via R3',
    rfc:'RFC 2328 §12.4.3 — ABR re-originates Summary into next area',
    rule:'<b>Key:</b> Type 3 is NOT the same LSA forwarded — it is a brand-new LSA with R3 as originator and updated metric. This is fundamentally different from Type 5 which is flooded unchanged.',
    rotersWithLsa:['R1','R2','R3','R4','R5','R6'], rotersBlocked:[],
    lsaDb:{ R1:['T1','T3'],R2:['T3'],R3:['T3'],R4:['T1'],R5:['T3'],R6:['T3'] },
    floodedLinks:[{a:'R3',b:'R6'}], blockedLinks:[], flood:{ from:'R3', to:'R6', lsaType:'T3' },
    lsaBadge:'Type 3 · Summary LSA · R3→Area2',
    lsaFields:[
      {f:'LS Type',        v:'3 (Summary)',   n:'Re-generated by R3 for Area 2'},
      {f:'Link State ID',  v:'4.4.4.4',      n:'Same prefix being advertised'},
      {f:'Adv. Router',    v:'3.3.3.3',      n:'R3 now originates this — NOT forwarded from R1'},
      {f:'Seq Number',     v:'0x80000001',   n:'R3\'s first origination of this LSA'},
      {f:'Network Mask',   v:'255.255.255.255', n:'/32 prefix unchanged'},
      {f:'Metric (Cost)',  v:'3',            n:'R3\'s accumulated cost to 4.4.4.4 (R3→R2→R1→R4)'},
    ]
  },
  {
    title:'Step 4 — Stub Area Filtering: Type 3 blocked (demo)',
    log:'Stub area: Type 3 summarized into default route',
    desc:'<b>Stub area behavior:</b> If Area 1 were configured as a <b>stub area</b>, R1 (ABR) would block all Type 3 LSAs from entering Area 1 (except a default route 0.0.0.0/0).<br><br>This scenario shows R1 blocking inbound Type 3 LSAs (from Area 0 into Area 1) and instead sending only a Type 3 default route. R4 uses 0.0.0.0/0 via R1 for all inter-area destinations.<br><br><b>Totally stub:</b> All Type 3s blocked — only 0.0.0.0/0 allowed in.',
    cli:'! Configure Area 1 as stub:\nR1(config-router)# area 1 stub\nR4(config-router)# area 1 stub\n\n! Result on R4:\nshow ip route\n! O*IA 0.0.0.0/0 [110/2] via R1  ← Default only!',
    rfc:'RFC 2328 §3.6 — Stub areas restrict Type 3/4/5 LSAs',
    rule:'<b>Stub area rules:</b><br>• Stub: blocks Type 5, allows Type 3, injects default<br>• Totally Stub: blocks Type 3,4,5, injects only default<br>• NSSA: blocks Type 5, allows Type 7, ABR converts 7→5',
    rotersWithLsa:['R1'], rotersBlocked:['R4'],
    lsaDb:{ R1:['T3'],R2:['T3'],R3:['T3'],R4:[],R5:['T3'],R6:['T3'] },
    floodedLinks:[{a:'R1',b:'R2'}], blockedLinks:[{a:'R1',b:'R4'}],
    flood:null, lsaFields:null,
  },
  {
    title:'Step 5 — ABR Route Summarization with "area range"',
    log:'R1 ABR uses area range → one Type 3 replaces many specific routes',
    desc:'<b>ABR Route Summarization</b> reduces the number of Type 3 LSAs flooded into Area 0. Instead of advertising each specific prefix from Area 1 separately (e.g., 10.1.0.0/30, 10.1.1.0/30, 10.1.2.0/30…), R1 can generate a <b>single aggregate Type 3</b> covering them all (10.1.0.0/24).<br><br><b>Benefits:</b><br>• Fewer LSAs in LSDB → smaller LSDB across the domain<br>• SPF runs faster with fewer nodes to process<br>• Hides Area 1 topology churn from Area 0 (individual link flaps don\'t affect Area 0 LSDB)<br><br><b>Suppression:</b> The more-specific Type 3s (10.1.0.0/30 etc.) are NOT flooded into Area 0 — only the summary. If no prefix in Area 1 matches the range, the aggregate Type 3 is not originated.<br><br><b>Cost of summary:</b> The metric in the aggregate Type 3 = the highest cost among all matching specific routes.',
    cli:'! Configuration:\nR1(config-router)# area 1 range 10.1.0.0 255.255.0.0\n\n! Effect on Area 0 (R2\'s LSDB):\nshow ip ospf database summary  ! on R2\n! Type-3: 10.1.0.0/16  Adv:1.1.1.1  Cost:max-of-specifics\n! (specific /30 routes from Area 1 are suppressed)\n\n! Verify summary installed:\nshow ip route ospf  ! on R2\n! O IA 10.1.0.0/16 [110/2] via R1',
    rfc:'RFC 2328 §12.4.3.1 — Originating summary-LSAs; area range command',
    rule:'<b>When NOT to summarize:</b> Summarization can hide subnet-level failures. If 10.1.1.0/30 goes down but the /16 summary persists, Area 0 routers still route toward Area 1 (traffic black-holes until TTL expires). Use summarization carefully with null0 discard routes to prevent loops: <code>ip route 10.1.0.0 255.255.0.0 null0</code>',
    rotersWithLsa:['R1','R2','R3','R4','R5','R6'], rotersBlocked:[],
    lsaDb:{ R1:['T1','T3'],R2:['T3'],R3:['T3'],R4:['T1'],R5:['T3'],R6:['T3'] },
    floodedLinks:[{a:'R1',b:'R2'}], blockedLinks:[],
    flood:{ from:'R1', to:'R2', lsaType:'T3' },
    lsaBadge:'Type 3 · Aggregate Summary · 10.1.0.0/16',
    lsaFields:[
      {f:'LS Type',       v:'3 (Summary)',     n:'Aggregate inter-area summary from R1 ABR'},
      {f:'Link State ID', v:'10.1.0.0',        n:'Summarized aggregate prefix'},
      {f:'Adv. Router',   v:'1.1.1.1',         n:'R1 ABR generated this aggregate'},
      {f:'Network Mask',  v:'255.255.0.0',     n:'/16 — covers all specific Area 1 prefixes'},
      {f:'Metric (Cost)', v:'max of specifics', n:'Highest cost among all prefixes in the range'},
      {f:'Suppresses',    v:'10.1.0.0/30, /30s',n:'More-specific Type 3s NOT flooded into Area 0'},
    ]
  },
  {
    title:'Step 6 — Split-Horizon Rule: Preventing Inter-Area Loops',
    log:'ABR split-horizon: Type 3 from non-backbone ≠ flooded back to backbone',
    desc:'OSPF enforces a <b>split-horizon rule at ABRs</b> to prevent inter-area routing loops. The rule has two parts:<br><br><b>Rule 1 — Backbone-to-non-backbone:</b> An ABR may install and re-advertise into non-backbone areas only the Type 3 LSAs it learns via Area 0 (backbone). It never re-advertises a Type 3 learned via a non-backbone area back into Area 0.<br><br><b>Rule 2 — Area 0 mandatory transit:</b> For inter-area traffic, all paths MUST pass through Area 0. If R1 learns a Type 3 for 10.2.0.0/24 (Area 2) via Area 0, it correctly advertises it into Area 1. But if R1 had a rogue direct link to Area 2 (bypassing Area 0), OSPF would NOT install that as a transit path.<br><br><b>Why this matters:</b> Without this rule, traffic from Area 1 to Area 2 could loop: Area1→R1→Area0→R3→Area2 while simultaneously Area1→R1→direct→Area2 creating routing inconsistency.<br><br>This is the reason <b>Area 0 must be contiguous</b>. Discontiguous Area 0 is fixed via virtual links.',
    cli:'! Verify split horizon in action:\nshow ip ospf database summary  ! on R1\n! Type-3 from Area 0: flooded into Area 1 ✔\n! Type-3 from Area 1: NOT re-flooded back into Area 0 ✔\n\n! Virtual link (workaround for discontiguous Area 0):\nR1(config-router)# area 2 virtual-link 3.3.3.3\nR3(config-router)# area 2 virtual-link 1.1.1.1\n! Creates a logical Area 0 tunnel through Area 2',
    rfc:'RFC 2328 §16.2 — Inter-area SPF and backbone requirement; RFC 3509 — ABR behavior clarification',
    rule:'<b>Virtual Links:</b> If Area 0 is partitioned (no physical backbone path), a virtual link through a transit area reconnects the segments. The virtual link appears as an unnumbered P2P link in Area 0. It carries OSPF packets tunneled through the transit area.',
    rotersWithLsa:['R1','R2','R3','R4','R5','R6'], rotersBlocked:[],
    lsaDb:{ R1:['T1','T3'],R2:['T3'],R3:['T3'],R4:['T1','T3'],R5:['T3'],R6:['T3'] },
    floodedLinks:[{a:'R1',b:'R4'},{a:'R3',b:'R6'}],
    blockedLinks:[{a:'R4',b:'R1'},{a:'R6',b:'R3'}],
    flood:null, lsaFields:null,
  },
  {
    title:'Step 7 — Type 3 Filtering with Distribute-List and Prefix-List',
    log:'ABR applies prefix-list → selective Type 3 suppression',
    desc:'ABRs can <b>filter which Type 3 LSAs are originated</b> into neighboring areas using distribute-lists or prefix-lists. This is used for traffic engineering, security, or reducing LSDB size.<br><br><b>Two filtering directions at ABR:</b><br>• <b>Outbound filter</b> (area X to area Y): prevents specific Type 3 LSAs from being originated into area Y. The prefix exists in area X but is invisible to area Y routers.<br>• <b>Inbound filter</b> (from area Y into RIB): prefix exists in LSDB but not installed in routing table (RIB). Less common, not recommended.<br><br><b>Cisco "area filter-list" (preferred for Type 3):</b><br>Filters Type 3 LSAs generated by ABR in a specified direction. Unlike distribute-list (which filters RIB), area filter-list prevents LSA origination.<br><br><b>Warning:</b> Asymmetric filtering creates black holes. If R1 filters prefix X into Area 1 but R3 does NOT filter X into Area 2, traffic from Area 1 that gets routed toward Area 0 will still reach prefix X — but return traffic may take a different path, violating symmetry.',
    cli:'! Filter 10.99.0.0/24 from entering Area 1:\nip prefix-list FILTER_AREA1 deny 10.99.0.0/24\nip prefix-list FILTER_AREA1 permit 0.0.0.0/0 le 32\n\nrouter ospf 1\n area 1 filter-list prefix FILTER_AREA1 in\n! "in" = filtering prefixes going INTO area 1\n\n! Verify:\nshow ip ospf database summary  ! on R4 (Area 1)\n! 10.99.0.0/24 is MISSING (filtered by R1 ABR)',
    rfc:'RFC 2328 §12.4.3 — ABR summary LSA origination; Cisco extension: area filter-list',
    rule:'<b>Distribute-list vs filter-list:</b><br>• distribute-list: filters RIB (routing table), LSA still in LSDB<br>• area filter-list: prevents Type 3 LSA origination — prefix truly hidden<br>Use area filter-list for network-wide policy; distribute-list only for local RIB control.',
    rotersWithLsa:['R1','R2','R3','R5'], rotersBlocked:['R4'],
    lsaDb:{ R1:['T3'],R2:['T3'],R3:['T3'],R4:[],R5:['T3'],R6:['T3'] },
    floodedLinks:[{a:'R1',b:'R2'}], blockedLinks:[{a:'R1',b:'R4'}],
    flood:null, lsaFields:null,
  },
],

/* ══════════════════════════════════════════════════════
   TYPE 4 — ASBR Summary LSA
   Generated by: ABRs
   Purpose: tell other areas how to reach the ASBR
   ══════════════════════════════════════════════════════ */
type4: [
  {
    title:'Type 4 — ASBR Summary LSA Overview',
    log:'Type 4 ASBR Summary — ABR tells domain where ASBR is',
    desc:'<b>ASBR Summary LSA (Type 4)</b> is generated by ABRs to tell routers in other areas how to reach an ASBR (AS Boundary Router).<br><br>In this topology, R2 is an ASBR in Area 0 (redistributing an external BGP route). Routers in Area 1 (R4) need to know how to reach R2 to use its Type 5 External LSAs. The Type 4 provides this reachability.<br><br>R1 (ABR) generates a Type 4 and floods it into Area 1.',
    rfc:'RFC 2328 §12.4.4 — ASBR Summary LSA',
    rule:'<b>Why Type 4?</b> Type 5 LSA carries the external prefix but only says "ASBR 2.2.2.2 knows about this route." Routers in other areas need Type 4 to know the COST to reach ASBR 2.2.2.2. Without Type 4, they can\'t calculate the total path cost to the external destination.',
    rotersWithLsa:[], rotersBlocked:[], lsaDb:{ R1:[],R2:[],R3:[],R4:[],R5:[],R6:[] },
    floodedLinks:[], blockedLinks:[], flood:null, lsaFields:null,
  },
  {
    title:'Step 1 — R2 Redistributes External Route (Becomes ASBR)',
    log:'R2 becomes ASBR — redistributes BGP 203.0.113.0/24',
    desc:'R2 redistributes an external BGP route <b>203.0.113.0/24</b> into OSPF using the <code>redistribute bgp</code> command. This makes R2 an <b>ASBR</b>.<br><br>R2 sets the E-bit in its Router LSA to signal it is an ASBR. R2 then generates a <b>Type 5 AS External LSA</b> for the external prefix.',
    cli:'R2(config-router)# redistribute bgp 65001 subnets\n! R2 is now ASBR\nshow ip ospf database external\n! R2 generates Type 5 for 203.0.113.0/24',
    rfc:'RFC 2328 §12.4.4',
    rotersWithLsa:['R2'], rotersBlocked:[], lsaDb:{ R1:[],R2:['T4'],R3:[],R4:[],R5:[],R6:[] },
    floodedLinks:[], blockedLinks:[], flood:null,
    lsaBadge:'Type 4 · ASBR Summary · ASBR=R2',
    lsaFields:[
      {f:'LS Type',        v:'4 (ASBR Summary)', n:'Points to an ASBR'},
      {f:'Link State ID',  v:'2.2.2.2',         n:'= Router ID of the ASBR (R2)'},
      {f:'Adv. Router',    v:'1.1.1.1',         n:'R1 ABR generates this Type 4'},
      {f:'Seq Number',     v:'0x80000001',      n:'Initial sequence'},
      {f:'Network Mask',   v:'0.0.0.0',         n:'Always 0 for Type 4 — host route to ASBR RID'},
      {f:'Metric (Cost)',  v:'1',               n:'R1\'s cost to reach ASBR R2 (1 hop)'},
    ]
  },
  {
    title:'Step 2 — R1 (ABR) Generates Type 4 for Area 1',
    log:'R1 → Type 4 ASBR Summary → R4 (Area 1)',
    desc:'R1 sees that R2 is an ASBR (E-bit set in R2\'s Router LSA). R1 generates a <b>Type 4 ASBR Summary LSA</b> and floods it into Area 1.<br><br>Type 4 structure is identical to Type 3 except:<br>• Link State ID = ASBR\'s Router ID (2.2.2.2)<br>• Network Mask = 0.0.0.0 (not a network prefix)<br>• Metric = R1\'s cost to reach R2',
    cli:'show ip ospf database asbr-summary  ! on R4\n! ASBR Summary Link States (Area 1)\n! Link State ID: 2.2.2.2 (ASBR R2\'s RID)\n! Adv Router: 1.1.1.1 (R1 ABR)\n! Metric: 1',
    rfc:'RFC 2328 §12.4.4',
    rotersWithLsa:['R1','R2','R4'], rotersBlocked:[],
    lsaDb:{ R1:['T4'],R2:['T4'],R3:[],R4:['T4'],R5:[],R6:[] },
    floodedLinks:[{a:'R1',b:'R4'}], blockedLinks:[], flood:{ from:'R1', to:'R4', lsaType:'T4' },
  },
  {
    title:'Step 3 — R4 Uses Type 4 + Type 5 for Complete Path',
    log:'R4 combines T4 + T5 to compute total external path cost',
    desc:'R4 now has both:<br>• <b>Type 5 LSA</b>: 203.0.113.0/24, ASBR=2.2.2.2, E2 metric=20<br>• <b>Type 4 LSA</b>: ASBR 2.2.2.2 reachable via R1, cost=1<br><br><b>R4\'s route calculation:</b><br>Cost to ASBR (R4→R1→R2) = 1+1 = 2<br>External metric (E2) = 20 (does not add internal cost)<br><br>Route: O E2 203.0.113.0/24 [110/20] via R1<br><br>Without Type 4, R4 would have no way to know how to reach ASBR 2.2.2.2.',
    cli:'show ip route ospf  ! on R4\n! O E2 203.0.113.0/24 [110/20] via 10.1.0.1 (R1)\n!                      ↑ E2 metric only — no internal cost\n! show ip ospf border-routers  ! on R4\n! R2 is ASBR, reachable via R1 cost 2',
    rfc:'RFC 2328 §16.4 — External route calculation requires Type 4',
    rule:'<b>Stub areas do NOT get Type 4 LSAs.</b> This is why stub areas also cannot have ASBRs — routers in stub areas have no way to find external route costs.',
    rotersWithLsa:['R1','R2','R4'], rotersBlocked:[],
    lsaDb:{ R1:['T4'],R2:['T4'],R3:[],R4:['T4'],R5:[],R6:[] },
    floodedLinks:[{a:'R1',b:'R2'},{a:'R1',b:'R4'}], blockedLinks:[{a:'R3',b:'R6'}],
    flood:null, lsaFields:null,
  },
  {
    title:'Step 4 — Type 4 NOT Needed in ASBR\'s Own Area',
    log:'Routers in ASBR\'s area (Area 0) find ASBR via Type 1 — no T4 needed',
    desc:'<b>Type 4 is only generated by ABRs for areas OTHER than the ASBR\'s home area.</b><br><br>R2 is the ASBR in Area 0. Routers in Area 0 (R1, R3, R5) can locate R2 directly from <b>R2\'s Router LSA (Type 1)</b> — the E-bit in R2\'s Router LSA flags it as ASBR. They already know R2\'s reachability from intra-area SPF — no Type 4 needed.<br><br>R1 (ABR) generates a Type 4 only when flooding into Area 1 (R4\'s area). R3 (ABR) generates a Type 4 only when flooding into Area 2 — BUT Area 2 is NSSA, which blocks Type 5 AND Type 4.<br><br><b>Summary of Type 4 distribution:</b><br>• Area 0 (ASBR\'s area): No Type 4 — uses Type 1 E-bit<br>• Area 1 (non-stub, via R1): Gets Type 4 from R1 ✔<br>• Area 2 (NSSA, via R3): Blocked — NSSA cannot have Type 4 or Type 5',
    cli:'show ip ospf database  ! on R2 (Area 0)\n! Area 0 LSDB: NO Type 4 entry for 2.2.2.2\n! R2 found as ASBR via its own Router LSA (E-bit=1)\n\nshow ip ospf database asbr-summary  ! on R4 (Area 1)\n! ASBR Summary Link States — Type 4 present for 2.2.2.2 ✔\n\nshow ip ospf database  ! on R6 (Area 2/NSSA)\n! Area 2 LSDB: NO Type 4 — NSSA blocks it',
    rfc:'RFC 2328 §12.4.4 — Type 4 only generated for external areas; §3.6 NSSA',
    rule:'<b>Rule:</b> An ABR does not generate a Type 4 into its own backbone area (Area 0) or into stub/NSSA areas. The Type 4 is purely a cross-area reachability signal — "this ASBR exists, here\'s how far I am from it."',
    rotersWithLsa:['R1','R2','R4'], rotersBlocked:['R6'],
    lsaDb:{ R1:['T4'],R2:[],R3:[],R4:['T4'],R5:[],R6:[] },
    floodedLinks:[{a:'R1',b:'R4'}], blockedLinks:[{a:'R3',b:'R6'}],
    flood:null, lsaFields:null,
  },
  {
    title:'Step 5 — Multiple ASBRs: Each ABR Generates Separate Type 4 per ASBR',
    log:'Two ASBRs (R2 + hypothetical R5) → two Type 4 LSAs from each ABR',
    desc:'When an OSPF domain has <b>multiple ASBRs</b>, each ABR must generate a <b>separate Type 4 for each ASBR</b> when flooding into non-ASBR areas.<br><br>Suppose R5 also becomes an ASBR (redistributing a different external source). Now Area 0 has TWO ASBRs: R2 (5.5.5.5) and R5 (2.2.2.2 was R2, let\'s keep original IDs).<br><br>R1 (ABR) floods into Area 1:<br>• <b>Type 4 for ASBR R2</b> (Link State ID = 2.2.2.2, cost = R1→R2)<br>• <b>Type 4 for ASBR R5</b> (Link State ID = 5.5.5.5, cost = R1→R5)<br><br>R4 then has two Type 4 entries. When a Type 5 says "ASBR 5.5.5.5 redistributed 8.8.8.0/24", R4 looks up the Type 4 for 5.5.5.5 to find the path cost to that ASBR.<br><br><b>Best ASBR selection (E1 routes):</b> For E1 routes, R4 picks the ASBR with the lowest total cost (internal + external). For E2 routes, R4 first compares external metrics; equal external = compare cost to ASBR.',
    cli:'show ip ospf database asbr-summary  ! on R4 (Area 1)\n! ASBR Summary: 2.2.2.2 [cost 2] via R1  ← ASBR R2\n! ASBR Summary: 5.5.5.5 [cost 3] via R1  ← ASBR R5\n\nshow ip ospf border-routers\n! ASBR 2.2.2.2 cost 2 via R1\n! ASBR 5.5.5.5 cost 3 via R1\n\n! Route selection for E1 prefix via ASBR R2:\n! total = cost_to_R2(2) + external(15) = 17\n! total = cost_to_R5(3) + external(10) = 13  ← R5 wins for E1!',
    rfc:'RFC 2328 §16.4 — Calculating AS external routes with multiple ASBRs',
    rule:'<b>ECMP with Type 4:</b> If two ABRs both generate a Type 4 for the same ASBR with equal costs, routers will load-balance to the ASBR via both ABRs — true ECMP for external routes.',
    rotersWithLsa:['R1','R2','R4','R5'], rotersBlocked:['R6'],
    lsaDb:{ R1:['T4'],R2:['T4'],R3:[],R4:['T4'],R5:['T4'],R6:[] },
    floodedLinks:[{a:'R1',b:'R4'},{a:'R1',b:'R2'},{a:'R1',b:'R5'}],
    blockedLinks:[{a:'R3',b:'R6'}],
    flood:null, lsaFields:null,
  },
],

/* ══════════════════════════════════════════════════════
   TYPE 5 — AS External LSA
   Generated by: ASBR
   Scope: entire OSPF routing domain (all non-stub areas)
   ══════════════════════════════════════════════════════ */
type5: [
  {
    title:'Type 5 — AS External LSA Overview',
    log:'Type 5 AS External — ASBR, entire OSPF domain',
    desc:'<b>AS External LSA (Type 5)</b> is generated by an <b>ASBR</b> when redistributing external routes into OSPF. It is the only LSA type with <b>domain-wide flooding scope</b> — it reaches every router in every non-stub area.<br><br>In this topology, R2 is the ASBR redistributing 203.0.113.0/24 from BGP. The Type 5 LSA will flood from R2 through ALL areas — Area 0, Area 1, and Area 2 (NSSA). It is NOT blocked at ABRs.<br><br><b>Exception:</b> Type 5 LSAs are blocked by stub and NSSA area boundaries.',
    rfc:'RFC 2328 §12.4.5 — AS External LSA flooding scope',
    rule:'<b>E1 vs E2 metrics:</b><br>• E2 (default): external metric only. Total cost = external metric (does NOT add internal OSPF cost). Most common.<br>• E1: external + internal. Total cost = internal cost to ASBR + external metric.',
    rotersWithLsa:[], rotersBlocked:[], lsaDb:{ R1:[],R2:[],R3:[],R4:[],R5:[],R6:[] },
    floodedLinks:[], blockedLinks:[], flood:null, lsaFields:null,
  },
  {
    title:'Step 1 — R2 (ASBR) Originates Type 5 LSA',
    log:'R2 (ASBR) → Type 5 AS External LSA for 203.0.113.0/24',
    desc:'R2 generates a <b>Type 5 LSA</b> for the external prefix 203.0.113.0/24 redistributed from BGP with metric=20 (E2 type).<br><br>Key difference from Type 3: the <b>Forward Address</b> field. If non-zero, routers use it as the next-hop instead of the ASBR. In most cases it is 0.0.0.0 (use ASBR as next-hop).',
    cli:'show ip ospf database external\n! AS External Link States\n! LS Type: AS External Link\n! Link State ID: 203.0.113.0\n! Adv Router: 2.2.2.2\n! Network Mask: /24\n! Metric Type: 2 (E2 — Larger than any link state cost)\n! Metric: 20\n! Forward Address: 0.0.0.0',
    rfc:'RFC 2328 §12.4.5',
    rotersWithLsa:['R2'], rotersBlocked:[], lsaDb:{ R1:[],R2:['T5'],R3:[],R4:[],R5:[],R6:[] },
    floodedLinks:[], blockedLinks:[], flood:null,
    lsaBadge:'Type 5 · AS External LSA · ASBR=R2',
    lsaFields:[
      {f:'LS Type',           v:'5 (AS External)', n:'Domain-wide flooding scope'},
      {f:'Link State ID',     v:'203.0.113.0',     n:'Destination network being redistributed'},
      {f:'Adv. Router',       v:'2.2.2.2',         n:'R2 ASBR — originated and owns this LSA'},
      {f:'Seq Number',        v:'0x80000001',      n:'Initial sequence'},
      {f:'Length',            v:'36 bytes',        n:'Fixed Type 5 size'},
      {f:'Network Mask',      v:'255.255.255.0',   n:'/24 external prefix'},
      {f:'Metric Type (E)',   v:'E2 (bit=1)',       n:'E2: external metric only, no internal cost added'},
      {f:'Metric',            v:'20',              n:'External metric (seed metric from redistribute)'},
      {f:'Forward Address',   v:'0.0.0.0',         n:'0.0.0.0 = use ASBR (R2) as next-hop directly'},
      {f:'External Route Tag',v:'0',               n:'Policy tag — useful for route filtering'},
    ]
  },
  {
    title:'Step 2 — Type 5 Floods Across All of Area 0',
    log:'R2 → Type 5 → R1, R3, R5 (Area 0)',
    desc:'R2 floods the Type 5 LSA to all Area 0 neighbors. R1, R3, and R5 install it in their LSDB. <b>Unlike Type 1/2/3/4, Type 5 LSAs are stored in a domain-wide LSDB, not per-area.</b><br><br>R1 and R3 (ABRs) do NOT stop the Type 5 here — they will continue flooding it into their other areas.',
    cli:'show ip ospf database external  ! on R1, R3, R5\n! AS External Link States (this is domain-wide)\n! 203.0.113.0  adv:2.2.2.2  E2:20  fwd:0.0.0.0',
    rfc:'RFC 2328 §13.3 — Type 5 flooded unchanged throughout domain',
    rotersWithLsa:['R1','R2','R3','R5'], rotersBlocked:[],
    lsaDb:{ R1:['T5'],R2:['T5'],R3:['T5'],R4:[],R5:['T5'],R6:[] },
    floodedLinks:[{a:'R2',b:'R1'},{a:'R2',b:'R3'},{a:'R2',b:'R5'}],
    blockedLinks:[], flood:{ from:'R2', to:'R1', lsaType:'T5' },
  },
  {
    title:'Step 3 — Type 5 Floods into Area 1 via R1 (ABR)',
    log:'R1 → Type 5 → R4 (Area 1 — not stub)',
    desc:'R1 (ABR) floods the Type 5 into Area 1 (non-stub). The <b>SAME Type 5 LSA</b> (with Adv. Router = 2.2.2.2) is flooded unchanged — no regeneration unlike Type 3.<br><br>R4 receives it and computes: "External prefix 203.0.113.0/24 via ASBR 2.2.2.2. How do I reach 2.2.2.2? Via Type 4 ASBR Summary — cost 2. E2 metric=20."',
    cli:'show ip ospf database external  ! on R4\n! Same Type 5 LSA — Adv Router still 2.2.2.2\n! (NOT regenerated like Type 3)\n\nshow ip route ospf  ! on R4\n! O E2 203.0.113.0/24 [110/20] via 10.1.0.1',
    rfc:'RFC 2328 §12.4.5 — Type 5 flooded unchanged, not regenerated',
    rotersWithLsa:['R1','R2','R3','R4','R5'], rotersBlocked:['R6'],
    lsaDb:{ R1:['T5'],R2:['T5'],R3:['T5'],R4:['T5'],R5:['T5'],R6:[] },
    floodedLinks:[{a:'R1',b:'R4'}], blockedLinks:[{a:'R3',b:'R6'}],
    flood:{ from:'R1', to:'R4', lsaType:'T5' },
  },
  {
    title:'Step 4 — Type 5 BLOCKED at NSSA Boundary (Area 2)',
    log:'⛔ Type 5 BLOCKED at R3 — Area 2 is NSSA',
    desc:'Area 2 is an <b>NSSA (Not-So-Stubby Area)</b>. NSSA areas <b>block Type 5 External LSAs</b> — R3 (ABR) does NOT flood the Type 5 into Area 2.<br><br>R6 (in Area 2) cannot see 203.0.113.0/24 via Type 5. Instead:<br>• If Area 2 had its own ASBR, it would use <b>Type 7</b> for external routes<br>• R3 injects a <b>default route</b> (Type 3) into Area 2 so R6 can reach external destinations<br><br>This is the fundamental difference: NSSA allows EXTERNAL REDISTRIBUTION (via Type 7) while still blocking Type 5.',
    cli:'show ip ospf database  ! on R6 (Area 2)\n! Area 2 LSDB: NO Type 5 entries\n! (Type 5 blocked by NSSA)\n! R6 uses default route from R3 for external destinations',
    rfc:'RFC 2328 §3.6 — NSSA blocks Type 5, uses Type 7 instead',
    rule:'<b>NSSA vs Stub:</b><br>Stub: blocks T5, no external redistribution allowed<br>NSSA: blocks T5, but allows T7 from local ASBR<br>Both: ABR injects default route (T3)',
    rotersWithLsa:['R1','R2','R3','R4','R5'], rotersBlocked:['R6'], blockAt:'R6',
    lsaDb:{ R1:['T5'],R2:['T5'],R3:['T5'],R4:['T5'],R5:['T5'],R6:[] },
    floodedLinks:[{a:'R1',b:'R4'},{a:'R2',b:'R1'},{a:'R2',b:'R3'},{a:'R2',b:'R5'}],
    blockedLinks:[{a:'R3',b:'R6'}], flood:null, lsaFields:null,
  },
  {
    title:'Step 5 — E1 vs E2 Metric Deep Dive',
    log:'E1 adds internal OSPF cost; E2 uses only external metric — affects route selection',
    desc:'<b>External Metric Type is the most misunderstood OSPF concept.</b> It controls how the total route cost is computed for external prefixes.<br><br><b>E2 (default) — External metric only:</b><br>Total cost = external metric (constant regardless of internal path length)<br>All routers see the same cost to 203.0.113.0/24 = 20, whether they\'re 1 hop or 10 hops from ASBR R2.<br>Tie-break: lowest cost to ASBR via Type 4.<br><br><b>E1 — External + Internal:</b><br>Total cost = internal cost to ASBR + external metric<br>R4 sees: cost_to_R2(2) + seed_metric(20) = <b>22</b><br>R5 sees: cost_to_R2(1) + seed_metric(20) = <b>21</b><br>Each router computes a different total → routes naturally prefer the closest ASBR.<br><br><b>When to use E1:</b> Multiple ASBRs redistributing the same prefix. E1 ensures traffic uses the nearest exit point (optimal routing). Use E1 when running mutual redistribution between OSPF and BGP/EIGRP at multiple boundary points.',
    cli:'! Change metric type to E1:\nR2(config-router)# redistribute bgp 65001 metric-type 1 subnets\n\n! E2 cost on R4 (2 hops from ASBR):\nshow ip route ospf  ! O E2 203.0.113.0/24 [110/20]\n\n! E1 cost on R4 (2 hops from ASBR, seed=20):\nshow ip route ospf  ! O E1 203.0.113.0/24 [110/22]\n!                          ↑ 2 (internal) + 20 (external) = 22\n\n! E1 cost on R5 (1 hop from ASBR):\n! O E1 203.0.113.0/24 [110/21]  ← 1 + 20 = 21 (R5 prefers its closer path)',
    rfc:'RFC 2328 §16.4.1 — E1 vs E2 route calculation',
    rule:'<b>E2 route preference over E1 (same prefix):</b> If one ASBR redistributes as E1 and another as E2, <b>E2 always wins</b> over E1 (regardless of cost). This is a frequent TAC issue when dual-redistributing between OSPF instances — always standardize metric type across all ASBRs.',
    rotersWithLsa:['R1','R2','R3','R4','R5'], rotersBlocked:['R6'],
    lsaDb:{ R1:['T5'],R2:['T5'],R3:['T5'],R4:['T5'],R5:['T5'],R6:[] },
    floodedLinks:[{a:'R2',b:'R1'},{a:'R2',b:'R5'},{a:'R1',b:'R4'}],
    blockedLinks:[{a:'R3',b:'R6'}], flood:null, lsaFields:null,
  },
  {
    title:'Step 6 — Forward Address (FA) Non-Zero: Traffic Bypasses ASBR',
    log:'FA != 0.0.0.0 — routers skip ASBR and route directly to next-hop',
    desc:'The <b>Forward Address (FA)</b> field in the Type 5 LSA is critical for optimal routing when the ASBR\'s next-hop is OSPF-reachable.<br><br><b>FA = 0.0.0.0 (default):</b> Use ASBR (R2) as the packet destination. All traffic flows through R2.<br><br><b>FA = non-zero:</b> Set by ASBR when:<br>• The redistributed route\'s next-hop is on an OSPF-enabled, non-passive interface<br>• Example: R2 redistributes a BGP route with next-hop 172.16.1.1 (a BGP peer on an OSPF-active interface)<br><br>With FA=172.16.1.1: routers compute the path to 172.16.1.1 directly (not R2). Traffic bypasses R2 and goes directly to the BGP peer network.<br><br><b>Prevents suboptimal routing:</b> Without FA, all external traffic would funnel through R2 even if a shorter path exists to the actual next-hop. With FA, SPF routes directly to the real forwarding address.<br><br><b>FA set to 0.0.0.0 when:</b> Redistributed interface is passive, loopback, or point-to-point with no OSPF neighbor.',
    cli:'! Case 1: ASBR next-hop on OSPF-active broadcast interface\nR2 redistributes BGP, next-hop=172.16.0.1 (on GigE to ISP, OSPF-active)\n! Type 5: Forward Address = 172.16.0.1 ← non-zero!\n\n! Case 2: ASBR next-hop on passive/loopback interface\n! Type 5: Forward Address = 0.0.0.0 ← default\n\nshow ip ospf database external\n! If FA != 0.0.0.0 → verify OSPF can reach FA:\nshow ip route 172.16.0.1\n! Must be in OSPF RIB — otherwise FA-based routes are invalid!',
    rfc:'RFC 2328 §12.4.5 — Forward Address field; §16.4 — FA-based route computation',
    rule:'<b>FA reachability critical:</b> If the FA address is not reachable via OSPF, the Type 5 LSA is ignored for forwarding. This is a common TAC issue: ASBR sets a non-zero FA to an address that is not in the OSPF topology → routers discard the Type 5 as unreachable.',
    rotersWithLsa:['R1','R2','R3','R4','R5'], rotersBlocked:['R6'],
    lsaDb:{ R1:['T5'],R2:['T5'],R3:['T5'],R4:['T5'],R5:['T5'],R6:[] },
    floodedLinks:[{a:'R2',b:'R1'},{a:'R2',b:'R5'},{a:'R1',b:'R4'}],
    blockedLinks:[{a:'R3',b:'R6'}],
    flood:null,
    lsaBadge:'Type 5 · Forward Address · non-zero FA',
    lsaFields:[
      {f:'LS Type',           v:'5 (AS External)', n:'Domain-wide scope'},
      {f:'Link State ID',     v:'203.0.113.0',     n:'External prefix'},
      {f:'Adv. Router',       v:'2.2.2.2',         n:'ASBR R2'},
      {f:'Forward Address',   v:'172.16.0.1',      n:'⭐ Non-zero FA: route directly to BGP next-hop, not via R2'},
      {f:'Metric Type',       v:'E2',              n:'External metric only'},
      {f:'Metric',            v:'20',              n:'Seed metric from redistribute'},
      {f:'FA Reachability',   v:'OSPF RIB needed', n:'FA must be reachable via OSPF or LSA is ignored'},
    ]
  },
  {
    title:'Step 7 — MaxAge Flushing: ASBR Withdraws External Route',
    log:'ASBR withdraws route → Type 5 aged to MaxAge → all routers flush',
    desc:'When an external route is removed from the ASBR (e.g., BGP session drops, redistribute command removed), the ASBR <b>flushes the Type 5 LSA</b> from the domain by setting its LS Age to <b>MaxAge (3600)</b> and re-flooding it.<br><br><b>Flush sequence:</b><br>1. R2 detects external route 203.0.113.0/24 is gone (BGP withdrawn)<br>2. R2 originates a MaxAge version of its Type 5 LSA (Age=3600, same SeqNo)<br>3. R2 floods MaxAge LSA to all Area 0 neighbors (R1, R3, R5)<br>4. Each neighbor installs MaxAge LSA, ACKs, and reflood to THEIR neighbors<br>5. All routers delete the LSA from LSDB<br>6. SPF recalculates — 203.0.113.0/24 disappears from routing table<br><br><b>Retransmission list:</b> Until an LSAck is received for each neighbor, the MaxAge LSA stays on that neighbor\'s retransmission list (retransmitted every RxmtInterval = 5s). This ensures reliable delivery even if ACK is lost.',
    cli:'! Simulate by removing redistribute command:\nR2(config-router)# no redistribute bgp 65001 subnets\n\n! Debug on R1 (receiver):\ndebug ip ospf database\n! %OSPF: Received MaxAge LSA 203.0.113.0 from R2\n! %OSPF: Flushing MaxAge LSA from LSDB\n! %OSPF: SPF scheduled — external route removed\n\nshow ip route  ! after flush on R4\n! O E2 203.0.113.0/24 — GONE ✔',
    rfc:'RFC 2328 §14.1 — Aging LSAs; §13.5 — Premature aging (self-originated MaxAge)',
    rule:'<b>MinLSInterval (5 seconds):</b> A router cannot re-originate an LSA more than once every 5 seconds. If a route flaps rapidly (up/down/up), OSPF waits at least 5s before re-advertising — protects against flooding storms during instability.',
    rotersWithLsa:[], rotersBlocked:['R1','R2','R3','R4','R5'],
    lsaDb:{ R1:[],R2:[],R3:[],R4:[],R5:[],R6:[] },
    floodedLinks:[{a:'R2',b:'R1'},{a:'R2',b:'R3'},{a:'R2',b:'R5'}],
    blockedLinks:[], flood:{ from:'R2', to:'R1', lsaType:'T5' }, lsaFields:null,
  },
],

/* ══════════════════════════════════════════════════════
   TYPE 7 — NSSA External LSA
   Generated by: ASBR inside NSSA area
   Scope: within NSSA area only → converted to Type 5 at ABR
   ══════════════════════════════════════════════════════ */
type7: [
  {
    title:'Type 7 — NSSA External LSA Overview',
    log:'Type 7 NSSA External — ASBR in NSSA, converted to T5 at ABR',
    desc:'<b>NSSA External LSA (Type 7)</b> is the NSSA equivalent of Type 5. It is generated by an <b>ASBR inside an NSSA area</b> and flooded only within that NSSA area.<br><br>In this topology, R6 (ASBR in Area 2/NSSA) redistributes a static route 192.0.2.0/24 into OSPF. R6 generates a Type 7 which floods within Area 2 only. At the ABR (R3), the Type 7 is <b>translated to a Type 5</b> and flooded into the rest of the OSPF domain.<br><br>This allows NSSA areas to redistribute external routes while still blocking external routes from the rest of the domain.',
    rfc:'RFC 3101 — NSSA Option and Type 7 LSA',
    rule:'<b>Type 7 to Type 5 translation at ABR:</b> The ABR with the highest Router-ID performs the translation if multiple ABRs exist. The translated Type 5 carries the NSSA ASBR\'s address as the Forward Address — routers outside NSSA route directly to R6, not through R3.',
    rotersWithLsa:[], rotersBlocked:[], lsaDb:{ R1:[],R2:[],R3:[],R4:[],R5:[],R6:[] },
    floodedLinks:[], blockedLinks:[], flood:null, lsaFields:null,
  },
  {
    title:'Step 1 — R6 (ASBR) Originates Type 7 in NSSA Area 2',
    log:'R6 → Type 7 NSSA External LSA for 192.0.2.0/24',
    desc:'R6 redistributes a static route 192.0.2.0/24 into OSPF. Since Area 2 is NSSA, R6 generates a <b>Type 7 LSA</b> (not Type 5).<br><br>Type 7 is structurally almost identical to Type 5 with two key differences:<br>• LS Type = 7<br>• <b>Forward Address</b> = R6\'s OSPF interface IP (not 0.0.0.0) — this ensures outside routers can route directly to R6 after translation',
    cli:'show ip ospf database nssa-external  ! on R6\n! NSSA External Link States (Area 2)\n! LS Type: AS NSSA External Link\n! Link State ID: 192.0.2.0\n! Adv Router: 6.6.6.6 (R6)\n! Forward Address: 10.2.0.2 (R6\'s interface IP)',
    rfc:'RFC 3101 §2 — Type 7 LSA format',
    rotersWithLsa:['R6'], rotersBlocked:[], lsaDb:{ R1:[],R2:[],R3:[],R4:[],R5:[],R6:['T7'] },
    floodedLinks:[], blockedLinks:[], flood:null,
    lsaBadge:'Type 7 · NSSA External · R6 ASBR',
    lsaFields:[
      {f:'LS Type',            v:'7 (NSSA External)', n:'NSSA equivalent of Type 5'},
      {f:'Link State ID',      v:'192.0.2.0',         n:'Redistributed external prefix'},
      {f:'Adv. Router',        v:'6.6.6.6',           n:'R6 ASBR in NSSA Area 2'},
      {f:'Seq Number',         v:'0x80000001',        n:'Initial'},
      {f:'Network Mask',       v:'255.255.255.0',     n:'/24 prefix'},
      {f:'Metric Type (E)',    v:'E2 (default)',       n:'Type 2 external metric'},
      {f:'Metric',             v:'20',                n:'Seed metric from redistribute static'},
      {f:'Forward Address',   v:'10.2.0.2',          n:'⭐ R6\'s interface IP — NOT 0.0.0.0 (used after T5 translation so outside routers reach R6 directly)'},
      {f:'External Route Tag', v:'0',                 n:'Optional policy tag'},
    ]
  },
  {
    title:'Step 2 — Type 7 Floods Within Area 2 Only (to R3)',
    log:'R6 → Type 7 → R3 (within NSSA Area 2)',
    desc:'R6 floods the Type 7 within Area 2. R3 (ABR) receives and installs it. The Type 7 stays within Area 2 boundaries — it is <b>NOT flooded</b> into Area 0 as a Type 7.',
    cli:'show ip ospf database nssa-external  ! on R3\n! Type 7 present — Area 2 scope only\n! Adv Router: 6.6.6.6',
    rfc:'RFC 3101 §2.3 — Type 7 flooding scope: within NSSA area only',
    rotersWithLsa:['R3','R6'], rotersBlocked:['R1','R2','R4','R5'],
    lsaDb:{ R1:[],R2:[],R3:['T7'],R4:[],R5:[],R6:['T7'] },
    floodedLinks:[{a:'R6',b:'R3'}], blockedLinks:[], flood:{ from:'R6', to:'R3', lsaType:'T7' },
  },
  {
    title:'Step 3 — R3 (ABR) Translates Type 7 → Type 5',
    log:'R3 translates T7 → T5 and floods into Area 0 + rest of domain',
    desc:'R3 (ABR) performs the <b>Type 7 → Type 5 translation</b>. R3 generates a new Type 5 LSA with:<br>• Same prefix: 192.0.2.0/24<br>• Same metric: E2, cost 20<br>• <b>Forward Address = 10.2.0.2</b> (R6\'s interface IP copied from Type 7)<br>• Advertising Router = 3.3.3.3 (R3, the translator)<br><br>The Forward Address is critical — it tells all outside routers to send traffic directly to R6 (not R3), preventing suboptimal routing.',
    cli:'show ip ospf database external  ! on R2 (Area 0)\n! Type 5 generated by R3 for 192.0.2.0/24\n! Adv Router: 3.3.3.3 (translator)\n! Forward Address: 10.2.0.2 (R6\'s interface — traffic goes directly to R6)',
    rfc:'RFC 3101 §2.3 — ABR translates Type 7 to Type 5',
    rule:'<b>Translation rule:</b> If multiple ABRs connect to the NSSA, the ABR with the highest Router-ID performs the translation. The other ABRs do NOT translate to avoid duplicate Type 5 LSAs.',
    rotersWithLsa:['R1','R2','R3','R5','R6'], rotersBlocked:['R4'],
    lsaDb:{ R1:['T5'],R2:['T5'],R3:['T7','T5'],R4:[],R5:['T5'],R6:['T7'] },
    floodedLinks:[{a:'R3',b:'R2'},{a:'R2',b:'R1'},{a:'R2',b:'R5'}],
    blockedLinks:[{a:'R1',b:'R4'}], flood:{ from:'R3', to:'R2', lsaType:'T5' },
    lsaBadge:'Type 5 (translated from T7) · R3',
    lsaFields:[
      {f:'LS Type',           v:'5 (AS External)', n:'Translated from Type 7 by R3 ABR'},
      {f:'Link State ID',     v:'192.0.2.0',       n:'Same prefix from Type 7'},
      {f:'Adv. Router',       v:'3.3.3.3',         n:'R3 is translator and owner of this Type 5'},
      {f:'Seq Number',        v:'0x80000001',      n:'R3\'s initial sequence for this LSA'},
      {f:'Network Mask',      v:'255.255.255.0',   n:'/24 — unchanged from Type 7'},
      {f:'Metric',            v:'20',              n:'Same external metric from Type 7'},
      {f:'Forward Address',   v:'10.2.0.2',        n:'⭐ R6\'s interface IP — copied from Type 7. Outside routers route directly to R6, not R3.'},
    ]
  },
  {
    title:'Step 4 — Full Domain View: T7 in NSSA, T5 Everywhere Else',
    log:'Complete: T7 (Area 2) + T5 (rest of domain)',
    desc:'<b>Final state of 192.0.2.0/24 distribution:</b><br><br>• Area 2 (NSSA): R3 and R6 have <b>Type 7</b><br>• Area 0 and Area 1: R1, R2, R3, R5 have <b>Type 5</b><br>• R4 (Area 1): also receives Type 5 via R1 (Area 1 is non-stub)<br><br>All routers outside Area 2 compute their route to 192.0.2.0/24 via the Forward Address (10.2.0.2 = R6 directly). Traffic flows optimally: outside routers → R3 → R6 (not: outside routers → R3 → R3 again).',
    cli:'show ip route ospf  ! on R2\n! O E2 192.0.2.0/24 [110/20] via 10.0.0.3 (R3)\n!   → then R3 forwards toward R6 (10.2.0.2)\n\nshow ip route ospf  ! on R4\n! O E2 192.0.2.0/24 [110/20] via 10.1.0.1 (R1)',
    rfc:'RFC 3101 §2 — complete NSSA mechanics',
    rotersWithLsa:['R1','R2','R3','R4','R5','R6'], rotersBlocked:[],
    lsaDb:{ R1:['T5'],R2:['T5'],R3:['T7','T5'],R4:['T5'],R5:['T5'],R6:['T7'] },
    floodedLinks:[{a:'R6',b:'R3'},{a:'R3',b:'R2'},{a:'R2',b:'R1'},{a:'R2',b:'R5'},{a:'R1',b:'R4'}],
    blockedLinks:[], flood:null, lsaFields:null,
  },
  {
    title:'Step 5 — P-bit (Propagate Bit): Controlling T7→T5 Translation',
    log:'P-bit=0 on Type 7 → ABR does NOT translate to Type 5',
    desc:'The <b>P-bit (Propagate bit)</b> in the Type 7 LSA options field controls whether an ABR should translate this Type 7 into a Type 5 and flood it into the rest of the domain.<br><br><b>P=1 (default):</b> ABR translates T7→T5 and floods into Area 0 and beyond. External route is visible domain-wide.<br><br><b>P=0:</b> ABR does NOT translate. The external route remains NSSA-local. Only routers inside Area 2 can reach this prefix; routers outside Area 2 have no route to it.<br><br><b>When is P=0 used?</b><br>• When the NSSA ASBR wants to redistribute a route only for local NSSA use (not domain-wide)<br>• When another redistribution point already advertises the same prefix domain-wide<br>• Controlled via: <code>redistribute ... nssa-only</code> on Cisco IOS (forces P=0)<br><br><b>N-bit (NSSA capability):</b> In OSPF Hello packets, the N-bit signals that a router supports NSSA. If a Hello is received without N-bit on an NSSA interface, the neighbor relationship is rejected.',
    cli:'! Set P=0 (nssa-only — do not propagate outside NSSA):\nR6(config-router)# redistribute static subnets nssa-only\n! Result: Type 7 P-bit = 0\n\n! Verify on R3 (ABR):\nshow ip ospf database nssa-external  ! Type 7 detail\n! Options: (N) — N-bit set (NSSA capable)\n! Note: if P-bit=0, no Type 5 generated by R3\n\n! Verify Type 5 NOT generated:\nshow ip ospf database external  ! on R2 — no entry for 192.0.2.0',
    rfc:'RFC 3101 §2.2 — P-bit in Type 7 options; nssa-only Cisco extension',
    rule:'<b>Default route in NSSA:</b> By default, when an area is configured as NSSA, the ABR does NOT automatically inject a default route (unlike stub areas). To inject a default into NSSA: <code>area X nssa default-information-originate</code>. This generates a special Type 7 LSA with prefix 0.0.0.0/0 from the ABR into the NSSA.',
    rotersWithLsa:['R3','R6'], rotersBlocked:['R1','R2','R4','R5'],
    lsaDb:{ R1:[],R2:[],R3:['T7'],R4:[],R5:[],R6:['T7'] },
    floodedLinks:[{a:'R6',b:'R3'}], blockedLinks:[{a:'R3',b:'R2'}],
    flood:null,
    lsaBadge:'Type 7 · P-bit=0 · NSSA-local only',
    lsaFields:[
      {f:'LS Type',          v:'7 (NSSA External)', n:'NSSA External LSA'},
      {f:'Link State ID',    v:'192.0.2.0',         n:'Redistributed prefix'},
      {f:'Adv. Router',      v:'6.6.6.6',           n:'R6 ASBR in NSSA Area 2'},
      {f:'Options P-bit',    v:'P=0',               n:'⭐ Do NOT propagate — ABR will NOT generate Type 5'},
      {f:'Options N-bit',    v:'N=1',               n:'NSSA capability flag (router supports Type 7)'},
      {f:'Forward Address',  v:'10.2.0.2',          n:'R6\'s interface — only relevant if P=1 and T5 is generated'},
      {f:'Scope',            v:'Area 2 only',       n:'Stays within NSSA — never reaches Area 0 or Area 1'},
    ]
  },
  {
    title:'Step 6 — Multiple NSSA ABRs: Highest RID Wins Translation',
    log:'Two ABRs connect Area 2: highest Router-ID performs T7→T5 translation',
    desc:'When an NSSA area has <b>multiple ABRs</b> (e.g., R3 at 3.3.3.3 AND a second ABR at 9.9.9.9), both ABRs receive the Type 7 LSA. However, <b>only ONE should translate it to Type 5</b> to avoid duplicate Type 5 LSAs flooding the domain.<br><br><b>RFC 3101 Rule:</b> The ABR with the <b>highest Router-ID</b> among all NSSA ABRs performs the translation. The lower-RID ABR(s) suppress translation.<br><br>In this topology, if R3 (3.3.3.3) and a new ABR (9.9.9.9) both connect Area 2:<br>• ABR 9.9.9.9 wins (highest RID) → translates T7→T5<br>• ABR R3 (3.3.3.3) → does NOT translate<br><br><b>What happens when the translator fails?</b><br>If ABR 9.9.9.9 fails, R3 detects the absence (via neighbor loss) and takes over translation. R3 sets a <b>Stability Interval timer</b> (default 40s) before assuming translator role — prevents oscillation if ABR 9.9.9.9 briefly flaps.<br><br>The translated Type 5 has the translator\'s RID as Advertising Router, so when translator changes, a new Type 5 is originated and the old one is flushed.',
    cli:'! Check which ABR is the active translator:\nshow ip ospf database nssa-external  ! on R3\n! Translator status: Enabled (or Disabled)\n! Active translator: 9.9.9.9 (highest RID wins)\n\n! Override translator (force specific ABR):\nR3(config-router)# area 2 nssa translate type7 suppress-fa\n! suppress-fa: sets FA=0 in translated T5 (forces traffic via ABR)\n\n! Stability timer:\nR3(config-router)# area 2 nssa translate type7 always\n! "always": R3 ALWAYS translates (ignores RID competition)',
    rfc:'RFC 3101 §2.3 — Translator selection: highest RID among NSSA ABRs',
    rule:'<b>suppress-fa option:</b> Normally the translated Type 5 carries the NSSA ASBR\'s FA (10.2.0.2) so outside routers go directly to R6. With suppress-fa, the Type 5 FA=0.0.0.0 — outside routers send traffic to the ABR instead. Useful when the FA address is not routable outside the NSSA.',
    rotersWithLsa:['R3','R6'], rotersBlocked:['R1','R2','R4','R5'],
    lsaDb:{ R1:[],R2:[],R3:['T7'],R4:[],R5:[],R6:['T7'] },
    floodedLinks:[{a:'R6',b:'R3'}], blockedLinks:[{a:'R3',b:'R2'}],
    flood:null, lsaFields:null,
  },
  {
    title:'Step 7 — NSSA Default Route & Complete LSA Type Comparison',
    log:'Full domain summary: T1/T2 (intra), T3/T4 (inter), T5 (external), T7 (NSSA)',
    desc:'<b>NSSA Default Route Injection:</b><br>Unlike stub areas (which automatically get a default route), NSSA requires explicit configuration for default injection:<br><code>area 2 nssa default-information-originate</code><br>This generates a <b>Type 7 LSA with prefix 0.0.0.0/0</b> from R3 into Area 2. R6 then uses this for reaching any destination not in its LSDB.<br><br>──────────────────────────────<br><b>Complete LSA Type Reference:</b><br>──────────────────────────────<br><b>T1 Router LSA</b>: Every router, per-area, intra-area SPF<br><b>T2 Network LSA</b>: DR only, per-area, broadcast pseudonode<br><b>T3 Summary LSA</b>: ABR, per-area, inter-area prefixes<br><b>T4 ASBR Summary</b>: ABR, per-area, ASBR reachability<br><b>T5 AS External</b>: ASBR, domain-wide, external routes<br><b>T7 NSSA External</b>: NSSA ASBR, NSSA-area scope, converted to T5 at ABR<br>──────────────────────────────<br><b>Flooding scope hierarchy:</b><br>Link-local (T9 Opaque) → Per-area (T1,T2,T3,T4,T10) → Domain-wide (T5,T7→T5,T11)',
    cli:'! NSSA default injection:\nR3(config-router)# area 2 nssa default-information-originate\n\n! Verify on R6:\nshow ip route ospf  ! on R6\n! O*N2 0.0.0.0/0 [110/1] via 10.2.0.1 (R3) ← NSSA default\n\n! Complete LSDB summary command:\nshow ip ospf database  ! shows all LSA types per area\n! Area 0: Router, Network, Summary (T3), ASBR Summary (T4), External (T5)\n! Area 1: Router, Summary (T3), ASBR Summary (T4), External (T5)\n! Area 2: Router, Summary (T3), NSSA External (T7)',
    rfc:'RFC 3101 §2.6 — NSSA default route; RFC 2328 — LSA type summary',
    rule:'<b>NSSA Totally Stub (Totally NSSA):</b> Configure with <code>area X nssa no-summary</code>. Blocks ALL Type 3s (like totally stub) AND blocks Type 5, but still allows Type 7. ABR injects a single Type 3 default. This is the most scalable area type — minimal LSDB, still allows local redistribution.',
    rotersWithLsa:['R1','R2','R3','R4','R5','R6'], rotersBlocked:[],
    lsaDb:{ R1:['T5'],R2:['T5'],R3:['T7','T5'],R4:['T5'],R5:['T5'],R6:['T7'] },
    floodedLinks:[{a:'R6',b:'R3'},{a:'R3',b:'R2'},{a:'R2',b:'R1'},{a:'R2',b:'R5'},{a:'R1',b:'R4'}],
    blockedLinks:[], flood:null, lsaFields:null,
  },
],

}; // end LSA_STEP_DATA