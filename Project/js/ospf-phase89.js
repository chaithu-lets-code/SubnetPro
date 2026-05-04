'use strict';

/* ╔══════════════════════════════════════════════════════════════════╗
   ║  OSPF SIMULATOR · Phase 8 : Route Summarization                 ║
   ║  ABR Type-3 collapse · ASBR Type-5 aggregate · Prefix-cloud     ║
   ╚══════════════════════════════════════════════════════════════════╝ */

/* ═══════════════════════════════════════════════════════
   PHASE 8 STATE
   ═══════════════════════════════════════════════════════ */
let summCanvas, summCtx;
let summCurrentStep = 0;
let summPlaying     = false;
let summTimer       = null;
let summSpeedMs     = 4500;
let summAnimDur     = 1200;
let summScenario    = 'abr';
let summSteps       = [];
let summAnimId      = null;
let summAnimStart   = null;
let summFloodPkt    = { on:false, prog:0, from:'', to:'', type:'', color:'' };
let summTrails      = [];
let summPulseRings  = [];
// Prefix-cloud collapse animation state
let summCollapseAnim = { on:false, prog:0, routerId:'' };
let summCollapseAnimId = null;
let summCollapseStart  = null;

/* ── Summarization colours ── */
const SUMM_COLORS = {
  T3:'#f59e0b', T5:'#ef4444', T7:'#06b6d4',
  prefix:'#22c55e', summary:'#3b82f6', blocked:'#ef4444'
};

/* ── Topology: 3 areas, 5 routers ──
   Area 1 ── Area 0 (Backbone) ── Area 2
   R2(IR-A1) ─ R1(ABR,0+1) ─ R3(ASBR,A0) ─ R4(ABR,0+2) ─ R5(IR-A2)
*/
const SUMM_RTRS = [
  { id:'R1', rid:'1.1.1.1', role:'ABR',  area:'0+1', ip:'10.0.1.1' },
  { id:'R2', rid:'2.2.2.2', role:'IR',   area:'1',   ip:'10.1.0.2' },
  { id:'R3', rid:'3.3.3.3', role:'ASBR', area:'0',   ip:'10.0.0.3' },
  { id:'R4', rid:'4.4.4.4', role:'ABR',  area:'0+2', ip:'10.0.2.1' },
  { id:'R5', rid:'5.5.5.5', role:'IR',   area:'2',   ip:'10.2.0.2' },
];
const SUMM_LINKS = [
  { a:'R2', b:'R1', area:'1' },
  { a:'R1', b:'R3', area:'0' },
  { a:'R3', b:'R4', area:'0' },
  { a:'R4', b:'R5', area:'2' },
];

/* ── Scenario meta ── */
const SUMM_SCENARIO_META = {
  abr:   { label:'ABR Summarization (Type 3)',  color:'#f59e0b', accentColor:'#f59e0b' },
  asbr:  { label:'ASBR Summarization (Type 5)', color:'#ef4444', accentColor:'#ef4444' },
  nosumm:{ label:'No Summarization (default)',  color:'#3b82f6', accentColor:'#3b82f6' },
  discon:{ label:'Discontiguous — Troubleshoot',color:'#8b5cf6', accentColor:'#8b5cf6' },
};

/* ═══════════════════════════════════════════════════════
   ENTRY POINT
   ═══════════════════════════════════════════════════════ */
function ospfSummInit() {
  const host = document.getElementById('ospf-summ-container');
  if (!host) { console.error('Phase 8: #ospf-summ-container missing'); return; }
  host.innerHTML = summBuildHTML();
  summCanvas = document.getElementById('summCanvas');
  summCtx    = summCanvas.getContext('2d');
  summLoadScenario('abr');
  window.removeEventListener('resize', summResize);
  window.addEventListener('resize', summResize);
  requestAnimationFrame(() => summResize());
}

/* ═══════════════════════════════════════════════════════
   HTML + CSS
   ═══════════════════════════════════════════════════════ */
function summBuildHTML() {
  return `
<style>
.summ-wrap{font-family:'IBM Plex Mono',monospace;background:#080d1c;color:#e2e8f0;border-radius:16px;padding:20px;border:1px solid #1a2640;box-shadow:0 8px 40px rgba(0,0,0,.6);user-select:none}
.summ-topbar{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:14px;align-items:center;padding:12px 16px;background:#0d1526;border-radius:10px;border:1px solid #1a2640}
.summ-title{font-size:14px;font-weight:700;color:#60b8ff}
.summ-scen-row{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px}
.summ-btn{background:#0d1829;border:1px solid #1e3050;color:#64748b;padding:6px 14px;border-radius:7px;cursor:pointer;font-size:11px;font-family:'IBM Plex Mono',monospace;font-weight:600;transition:all .2s;letter-spacing:.3px}
.summ-btn:hover{border-color:#3b82f6;color:#7cb9ff;background:#0f1f3a}
.summ-btn.active{background:linear-gradient(135deg,#0f2a52,#112244);border-color:#3b82f6;color:#7cb9ff;font-weight:700;box-shadow:0 0 12px rgba(59,130,246,.2)}
.summ-canvas-box{background:#04080f;border-radius:12px;overflow:hidden;margin-bottom:10px;border:1px solid #1a2640;box-shadow:inset 0 2px 20px rgba(0,0,0,.4);position:relative;width:100%}
#summCanvas{display:block;width:100%;height:auto}
.summ-progress-wrap{margin-bottom:10px;display:flex;align-items:center;gap:10px}
.summ-progress-track{flex:1;height:4px;background:#0d1526;border-radius:2px;overflow:hidden}
.summ-progress-fill{height:100%;background:linear-gradient(90deg,#f59e0b,#ef4444);border-radius:2px;transition:width .4s ease}
.summ-step-counter{font-size:11px;color:#3b5278;white-space:nowrap;font-weight:700;min-width:90px;text-align:right}
.summ-ctrl-bar{display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;padding:12px 16px;background:#0d1526;border-radius:10px;border:1px solid #1a2640;margin-bottom:14px}
.summ-cb{background:#0d1829;border:1px solid #1e3050;color:#94a3b8;width:44px;height:44px;border-radius:10px;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .2s;position:relative}
.summ-cb::after{content:attr(data-label);position:absolute;bottom:-20px;left:50%;transform:translateX(-50%);font-size:9px;color:#3b5278;white-space:nowrap;font-family:'IBM Plex Mono',monospace;letter-spacing:.5px;pointer-events:none}
.summ-cb:hover{background:#0f1f3a;border-color:#3b82f6;color:#7cb9ff;transform:translateY(-1px)}
.summ-cb.play-active{background:linear-gradient(135deg,#0a2515,#0d2a1a);border-color:#22c55e;color:#22c55e;box-shadow:0 0 14px rgba(34,197,94,.3)}
.summ-cb.summ-play-btn{width:52px;height:52px;font-size:20px;border-radius:50%;border-color:#f59e0b;color:#f59e0b;box-shadow:0 0 14px rgba(245,158,11,.2)}
.summ-cb.summ-play-btn:hover{box-shadow:0 0 20px rgba(245,158,11,.4);transform:translateY(-2px) scale(1.05)}
.summ-cb.summ-play-btn.play-active{border-color:#22c55e;color:#22c55e;box-shadow:0 0 20px rgba(34,197,94,.4)}
.summ-ctrl-divider{width:1px;height:32px;background:#1a2640;margin:0 4px}
.summ-spd{display:flex;align-items:center;gap:8px}
.summ-spd-lbl{font-size:10px;color:#3b5278;text-transform:uppercase;letter-spacing:.8px;font-weight:700}
.summ-spd input[type=range]{width:90px;height:4px;appearance:none;background:#1a2640;border-radius:2px;cursor:pointer;outline:none}
.summ-spd input[type=range]::-webkit-slider-thumb{appearance:none;width:14px;height:14px;border-radius:50%;background:#f59e0b;cursor:pointer;box-shadow:0 0 8px rgba(245,158,11,.5);transition:transform .15s}
.summ-spd input[type=range]::-webkit-slider-thumb:hover{transform:scale(1.2)}
.summ-spd-val{font-size:11px;color:#fbbf24;font-weight:700;min-width:28px;text-align:center}
.summ-info-strip{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:12px}
@media(max-width:900px){.summ-info-strip{grid-template-columns:1fr}}
.summ-panel{background:#0d1526;border-radius:10px;padding:16px;border:1px solid #1a2640}
.summ-panel-title{font-size:9.5px;color:#2c4470;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;font-weight:700;display:flex;align-items:center;gap:6px}
.summ-panel-title::before{content:'';display:inline-block;width:3px;height:12px;background:var(--summ-ac,#f59e0b);border-radius:2px}
.summ-step-title{font-size:13px;font-weight:700;color:#60b8ff;margin-bottom:10px;line-height:1.4}
.summ-step-desc{font-size:11px;color:#8aa3c5;line-height:1.8;margin-bottom:10px;font-family:'DM Sans',sans-serif}
.summ-step-cli{font-size:10px;color:#4ade80;background:#050c1a;padding:10px 12px;border-radius:7px;margin-bottom:8px;white-space:pre-wrap;border-left:3px solid #22c55e;line-height:1.7;box-shadow:inset 0 1px 8px rgba(0,0,0,.3)}
.summ-step-rfc{font-size:10px;color:#2c4470;font-style:italic}
.summ-rule-box{margin-top:10px;padding:10px 12px;border-radius:7px;background:#0a1e38;border-left:3px solid #f59e0b;font-size:11px;color:#fbbf2488;line-height:1.7;display:none}
.summ-log-box{max-height:180px;overflow-y:auto;display:flex;flex-direction:column;gap:4px;scrollbar-width:thin;scrollbar-color:#1a2640 transparent}
.summ-log-box::-webkit-scrollbar{width:4px}
.summ-log-box::-webkit-scrollbar-thumb{background:#1a2640;border-radius:2px}
.summ-log-item{font-size:10px;padding:5px 10px;border-radius:6px;background:#060d1a;border-left:3px solid #1a2640;color:#3b5278;line-height:1.4;transition:all .25s;cursor:pointer}
.summ-log-item:hover{color:#64748b;background:#0a1525}
.summ-log-item.cur{border-left-color:#f59e0b;color:#fde68a;background:#0a1e38;box-shadow:0 0 10px rgba(245,158,11,.12)}
.summ-prefix-table{width:100%;border-collapse:collapse;font-size:10.5px}
.summ-prefix-table th{background:#060d1a;color:#2c4470;padding:6px 10px;text-align:left;font-weight:700;border-bottom:1px solid #1a2640;text-transform:uppercase;letter-spacing:.5px;font-size:9.5px}
.summ-prefix-table td{padding:5px 10px;border-bottom:1px solid #080e1c;color:#8aa3c5;vertical-align:top}
.summ-prefix-table td:first-child{color:#7db8ff;white-space:nowrap;font-weight:600}
.summ-prefix-table td:nth-child(2){color:#86efac;font-family:'IBM Plex Mono',monospace}
.summ-pkt-section{background:#0d1526;border-radius:10px;padding:16px;border:1px solid #1a2640;margin-bottom:4px}
.summ-pkt-hdr{display:flex;align-items:center;gap:12px;margin-bottom:12px}
.summ-pkt-badge{padding:4px 14px;border-radius:5px;font-size:11px;font-weight:700;letter-spacing:.5px}
.summ-no-pkt{color:#2c4470;font-size:11px;padding:14px;text-align:center;font-style:italic}
</style>

<div class="summ-wrap">
  <div class="summ-topbar">
    <span class="summ-title">⊕ OSPF Route Summarization — ABR/ASBR Route Collapse</span>
  </div>

  <div class="summ-scen-row" id="summScenRow"></div>

  <div class="summ-canvas-box">
    <canvas id="summCanvas" width="900" height="400"></canvas>
  </div>

  <div class="summ-progress-wrap">
    <div class="summ-progress-track">
      <div class="summ-progress-fill" id="summProgressFill" style="width:0%"></div>
    </div>
    <span class="summ-step-counter" id="summSNum">Step 1 / 1</span>
  </div>

  <div class="summ-ctrl-bar">
    <button class="summ-cb" id="summReset" data-label="RESET" onclick="summReset()">⏮</button>
    <button class="summ-cb" id="summPrev"  data-label="PREV"  onclick="summGo(-1)">◀</button>
    <button class="summ-cb summ-play-btn" id="summPlay" data-label="PLAY" onclick="summTogglePlay()">▶</button>
    <button class="summ-cb" id="summNext"  data-label="NEXT"  onclick="summGo(1)">▶|</button>
    <div class="summ-ctrl-divider"></div>
    <div class="summ-spd">
      <span class="summ-spd-lbl">Speed</span>
      <span style="font-size:9px;color:#2c4470">Slow</span>
      <input type="range" id="summSpd" min="0.3" max="4" step="0.1" value="1" oninput="summSetSpeed(this.value)">
      <span style="font-size:9px;color:#2c4470">Fast</span>
      <span class="summ-spd-val" id="summSpdLbl">1×</span>
    </div>
  </div>

  <div class="summ-info-strip">
    <div class="summ-panel" style="--summ-ac:#f59e0b">
      <div class="summ-panel-title">Step Detail</div>
      <div class="summ-step-title" id="summStepTitle">Select a scenario and press ▶</div>
      <div class="summ-step-desc"  id="summStepDesc">Choose an ABR or ASBR summarization scenario. Watch how multiple specific prefixes collapse into a single summary LSA at the boundary router.</div>
      <div class="summ-step-cli"   id="summStepCli" style="display:none"></div>
      <div class="summ-step-rfc"   id="summStepRfc"></div>
      <div class="summ-rule-box"   id="summRuleBox"></div>
    </div>

    <div class="summ-panel" style="--summ-ac:#22c55e">
      <div class="summ-panel-title">Prefix Summary Table</div>
      <div id="summPrefixTable"><div class="summ-no-pkt">No prefix data at this step</div></div>
      <div style="margin-top:12px;border-top:1px solid #1a2640;padding-top:10px;font-size:10px;line-height:2;color:#8aa3c5">
        <div><span style="color:#f59e0b;font-weight:700">T3</span> Summary LSA — ABR-generated, inter-area</div>
        <div><span style="color:#ef4444;font-weight:700">T5</span> AS External — ASBR, domain-wide</div>
        <div><span style="color:#22c55e;font-weight:700">Bits</span> Matching prefix bits = summary mask</div>
      </div>
    </div>

    <div class="summ-panel" style="--summ-ac:#8b5cf6">
      <div class="summ-panel-title">Propagation Log</div>
      <div class="summ-log-box" id="summLog"></div>
    </div>
  </div>

  <div class="summ-pkt-section">
    <div class="summ-pkt-hdr">
      <span class="summ-pkt-badge" id="summPktBadge" style="background:#0d1526;color:#2c4470">— No LSA</span>
      <span style="font-size:11px;color:#2c4470;font-weight:700;text-transform:uppercase;letter-spacing:.8px">🔬 LSA Dissection (Wireshark-style)</span>
    </div>
    <div id="summPktBody"><div class="summ-no-pkt">No LSA at this step — advance to a flooding step</div></div>
  </div>
</div>`;
}

/* ═══════════════════════════════════════════════════════
   SCENARIO LOADER
   ═══════════════════════════════════════════════════════ */
function summLoadScenario(key) {
  summScenario = key;
  const row = document.getElementById('summScenRow');
  const m = SUMM_SCENARIO_META;
  row.innerHTML = Object.entries(m).map(([k,v]) =>
    `<button class="summ-btn${k===key?' active':''}"
      style="${k===key?`background:linear-gradient(135deg,${v.color}22,${v.color}11);border-color:${v.color}88;color:${v.color}`:''}"
      onclick="summLoadScenario('${k}')">${v.label}</button>`
  ).join('');
  const fill = document.getElementById('summProgressFill');
  if (fill) fill.style.background = `linear-gradient(90deg,${m[key].color},${m[key].color}88)`;
  summSteps = SUMM_STEP_DATA[key] || [];
  summReset();
}

/* ═══════════════════════════════════════════════════════
   RESIZE + DRAW
   ═══════════════════════════════════════════════════════ */
function summResize() {
  if (!summCanvas) return;
  const w = summCanvas.parentElement.clientWidth || 800;
  const h = Math.round(w * 0.52);
  summCanvas.width  = w; summCanvas.height = h;
  summCanvas.style.width = w+'px'; summCanvas.style.height = h+'px';
  summDraw();
}

function summDraw() {
  if (!summCtx) return;
  const W = summCanvas.width, H = summCanvas.height;
  const ctx = summCtx;
  ctx.clearRect(0,0,W,H);

  // Background
  const bg = ctx.createLinearGradient(0,0,W,H);
  bg.addColorStop(0,'#040810'); bg.addColorStop(1,'#060d1a');
  ctx.fillStyle = bg; ctx.fillRect(0,0,W,H);
  ctx.fillStyle='rgba(30,48,80,0.28)';
  for(let x=20;x<W;x+=36) for(let y=20;y<H;y+=36){ctx.beginPath();ctx.arc(x,y,1,0,Math.PI*2);ctx.fill();}

  const pos  = summCalcPos(W,H);
  const step = summSteps[summCurrentStep] || {};

  // Draw area zones
  summDrawAreas(ctx, W, H);
  // Draw links
  summDrawLinks(ctx, pos, step);
  // Draw prefix clouds (unique to Phase 8)
  summDrawPrefixClouds(ctx, pos, step);
  // Draw flood packet trails + bubble
  summDrawTrails(ctx, pos);
  if (summFloodPkt.on) summDrawFloodPkt(ctx, pos);
  // Pulse rings
  summPulseRings.forEach(r => { if(pos[r.rid]) summDrawPulseRing(ctx,pos[r.rid],r.t,summFloodPkt.color||'#f59e0b'); });
  // Routers (on top)
  SUMM_RTRS.forEach(r => summDrawRouter(ctx, pos[r.id], r, step));
  // Block badge
  if (step.blockAt && pos[step.blockAt]) {
    ctx.fillStyle='#ef444488'; ctx.font='bold 11px IBM Plex Mono'; ctx.textAlign='center';
    ctx.fillText('⛔ BLOCKED', pos[step.blockAt].x, pos[step.blockAt].y - 50);
  }
  // Summary box (collapse target) when animation done
  if (step.summaryAt && step.summaryPrefix && !summFloodPkt.on) {
    summDrawSummaryBox(ctx, pos[step.summaryAt], step.summaryPrefix, step.summaryColor || '#f59e0b', step.collapseDone);
  }
}

function summCalcPos(W, H) {
  const midY = Math.round(H * 0.45);
  return {
    R1: { x: Math.round(W * 0.24), y: midY },
    R2: { x: Math.round(W * 0.08), y: midY },
    R3: { x: Math.round(W * 0.50), y: midY },
    R4: { x: Math.round(W * 0.76), y: midY },
    R5: { x: Math.round(W * 0.92), y: midY },
  };
}

function summDrawAreas(ctx, W, H) {
  summAreaZone(ctx, 0,      0, Math.round(W*0.32), H, '#22c55e', 'Area 1 · Standard');
  summAreaZone(ctx, Math.round(W*0.32), 0, Math.round(W*0.36), H, '#3b82f6', 'Area 0 · Backbone');
  summAreaZone(ctx, Math.round(W*0.68), 0, Math.round(W*0.32), H, '#f59e0b', 'Area 2 · Standard');
}

function summAreaZone(ctx, x, y, w, h, color, label) {
  ctx.fillStyle = color+'0d'; ctx.strokeStyle = color+'2e';
  ctx.lineWidth = 1.5; ctx.setLineDash([6,4]);
  ctx.beginPath(); ctx.rect(x+2,y+2,w-4,h-4); ctx.fill(); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = color+'66'; ctx.font = 'bold 10px IBM Plex Mono'; ctx.textAlign = 'center';
  ctx.fillText(label, x+w/2, 18);
}

function summDrawLinks(ctx, pos, step) {
  const scenColor = SUMM_SCENARIO_META[summScenario]?.color || '#f59e0b';
  SUMM_LINKS.forEach(lk => {
    const a=pos[lk.a], b=pos[lk.b]; if(!a||!b) return;
    const flooded = step.floodedLinks && step.floodedLinks.some(fl=>(fl.a===lk.a&&fl.b===lk.b)||(fl.a===lk.b&&fl.b===lk.a));
    const blocked = step.blockedLinks && step.blockedLinks.some(fl=>(fl.a===lk.a&&fl.b===lk.b)||(fl.a===lk.b&&fl.b===lk.a));
    const lc = flooded ? scenColor : blocked ? '#ef4444' : '#1a2640';
    if(flooded){ctx.shadowColor=lc;ctx.shadowBlur=8;}
    ctx.strokeStyle=lc; ctx.lineWidth=flooded?2.5:1.5;
    ctx.setLineDash(flooded?[]:[5,4]);
    ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
    ctx.setLineDash([]); ctx.shadowBlur=0;
  });
}

/* ── Prefix cloud: the new Phase 8 visual ─────────────────── */
function summDrawPrefixClouds(ctx, pos, step) {
  if (!step.prefixClouds) return;
  step.prefixClouds.forEach(cloud => {
    const p = pos[cloud.routerId];
    if (!p) return;
    const prefixes = cloud.prefixes || [];
    const collapsed = cloud.collapsed || false;
    const prog = summCollapseAnim.on && summCollapseAnim.routerId === cloud.routerId
      ? easeInOutCubic(summCollapseAnim.prog) : (collapsed ? 1 : 0);
    const color  = cloud.color || '#22c55e';
    const n = prefixes.length;
    const spreadR = Math.max(40, 22 * n);

    if (prog < 1) {
      // Draw individual prefix pills arranged in a fan above/below router
      prefixes.forEach((pfx, i) => {
        const angle = -Math.PI/2 + (i - (n-1)/2) * (Math.PI / Math.max(n,1)) * 0.8;
        const d = spreadR * (1 - prog);
        const px = p.x + Math.cos(angle) * d;
        const py = (p.y - 55) + Math.sin(angle) * d * 0.4;
        const alpha = 1 - prog * 0.8;
        ctx.globalAlpha = alpha;
        // Pill background
        const tw = ctx.measureText(pfx).width + 16;
        const th = 17;
        summRR(ctx, px - tw/2, py - th/2, tw, th, 4);
        ctx.fillStyle = color+'20'; ctx.strokeStyle = color+'55'; ctx.lineWidth=1;
        ctx.fill(); ctx.stroke();
        // Prefix text
        ctx.fillStyle = color; ctx.font = 'bold 8.5px IBM Plex Mono'; ctx.textAlign='center';
        ctx.fillText(pfx, px, py+4);
        ctx.globalAlpha = 1;
        // Line from pill to router
        ctx.strokeStyle = color+'33'; ctx.lineWidth=0.8;
        ctx.setLineDash([3,3]);
        ctx.beginPath(); ctx.moveTo(px, py+8); ctx.lineTo(p.x, p.y - 17); ctx.stroke();
        ctx.setLineDash([]);
      });
    }

    if (prog > 0 && cloud.summary) {
      // Draw the summary box emerging as collapse progresses
      const alpha = Math.min(prog * 1.5, 1);
      const scale = 0.6 + prog * 0.4;
      ctx.globalAlpha = alpha;
      ctx.save();
      ctx.translate(p.x, p.y - 56);
      ctx.scale(scale, scale);
      const sLabel = cloud.summary;
      const sw = ctx.measureText(sLabel).width + 20;
      const sh = 20;
      // Glow
      ctx.shadowColor = cloud.summaryColor || '#f59e0b';
      ctx.shadowBlur = 14 * prog;
      summRR(ctx, -sw/2, -sh/2, sw, sh, 5);
      const sg = ctx.createLinearGradient(-sw/2,-sh/2,-sw/2,sh/2);
      sg.addColorStop(0, (cloud.summaryColor||'#f59e0b')+'33');
      sg.addColorStop(1, (cloud.summaryColor||'#f59e0b')+'11');
      ctx.fillStyle = sg;
      ctx.strokeStyle = (cloud.summaryColor||'#f59e0b')+'aa'; ctx.lineWidth = 1.5;
      ctx.fill(); ctx.stroke(); ctx.shadowBlur=0;
      ctx.fillStyle = cloud.summaryColor || '#f59e0b';
      ctx.font = 'bold 9px IBM Plex Mono'; ctx.textAlign='center';
      ctx.fillText(sLabel, 0, 5);
      ctx.restore();
      ctx.globalAlpha=1;
      // Count badge
      if (prog > 0.5) {
        const badgeAlpha = (prog - 0.5) * 2;
        ctx.globalAlpha = badgeAlpha;
        ctx.fillStyle = '#0d1526'; ctx.strokeStyle = (cloud.summaryColor||'#f59e0b')+'66'; ctx.lineWidth=1;
        summRR(ctx, p.x+24, p.y - 64, 54, 14, 3); ctx.fill(); ctx.stroke();
        ctx.fillStyle = cloud.summaryColor || '#f59e0b';
        ctx.font = '7.5px IBM Plex Mono'; ctx.textAlign='center';
        ctx.fillText(`${n} → 1 prefix`, p.x+51, p.y - 54);
        ctx.globalAlpha=1;
      }
    }
  });
}

function summDrawSummaryBox(ctx, p, prefix, color, done) {
  if (!done) return;
  const tw = ctx.measureText(prefix).width + 20;
  const ty = p.y - 56;
  ctx.shadowColor = color; ctx.shadowBlur = 16;
  summRR(ctx, p.x-tw/2, ty-10, tw, 20, 5);
  const g = ctx.createLinearGradient(p.x-tw/2,ty-10,p.x-tw/2,ty+10);
  g.addColorStop(0,color+'33'); g.addColorStop(1,color+'11');
  ctx.fillStyle=g; ctx.strokeStyle=color+'aa'; ctx.lineWidth=1.5;
  ctx.fill(); ctx.stroke(); ctx.shadowBlur=0;
  ctx.fillStyle=color; ctx.font='bold 9px IBM Plex Mono'; ctx.textAlign='center';
  ctx.fillText(prefix, p.x, ty+5);
}

function summDrawRouter(ctx, p, rtr, step) {
  if (!p) return;
  const RW=106, RH=34;
  const rx=p.x-RW/2, ry=p.y-RH/2;
  const scenColor = SUMM_SCENARIO_META[summScenario]?.color || '#f59e0b';
  const highlighted = step.highlightedRouters && step.highlightedRouters.includes(rtr.id);
  const roleColor = { ABR:'#f59e0b', ASBR:'#8b5cf6', IR:'#3b82f6' }[rtr.role] || '#3b82f6';
  const borderColor = highlighted ? scenColor : '#1e3050';

  if (highlighted) { ctx.shadowColor=scenColor; ctx.shadowBlur=20; }
  const bg = ctx.createLinearGradient(rx,ry,rx,ry+RH);
  bg.addColorStop(0,'#0d1f3a'); bg.addColorStop(1,'#080f1e');
  ctx.fillStyle=bg; ctx.strokeStyle=borderColor; ctx.lineWidth=highlighted?2.5:1.5;
  summRR(ctx,rx,ry,RW,RH,9); ctx.fill(); ctx.stroke();
  ctx.shadowBlur=0;

  // Accent stripe
  const sg=ctx.createLinearGradient(rx,ry,rx+RW,ry);
  sg.addColorStop(0,borderColor+'00'); sg.addColorStop(0.5,borderColor+'55'); sg.addColorStop(1,borderColor+'00');
  ctx.fillStyle=sg; ctx.beginPath(); ctx.roundRect(rx,ry,RW,3,[9,9,0,0]); ctx.fill();

  ctx.fillStyle='#ddeeff'; ctx.font='bold 12px IBM Plex Mono'; ctx.textAlign='center';
  ctx.fillText(rtr.id, p.x, p.y-4);
  ctx.fillStyle='#4a6a90'; ctx.font='9px IBM Plex Mono';
  ctx.fillText(rtr.rid, p.x, p.y+9);
  ctx.fillStyle=roleColor+'99'; ctx.font='bold 9px IBM Plex Mono';
  ctx.fillText('['+rtr.role+']', p.x, ry-7);

  // Status badge (below)
  const ibw=RW, ibh=18, ibx=rx, iby=ry+RH+5;
  const statusText = step.routerStatus && step.routerStatus[rtr.id] ? step.routerStatus[rtr.id] : '—';
  const statusColor = highlighted ? scenColor : '#2c4470';
  ctx.fillStyle=statusColor+'20'; ctx.strokeStyle=statusColor+'55'; ctx.lineWidth=1;
  summRR(ctx,ibx,iby,ibw,ibh,4); ctx.fill(); ctx.stroke();
  ctx.fillStyle=statusColor; ctx.font='bold 8px IBM Plex Mono'; ctx.textAlign='center';
  ctx.fillText(statusText, p.x, iby+12);
}

function summDrawTrails(ctx, pos) {
  if (!summFloodPkt.from||!summFloodPkt.to) return;
  const fp=pos[summFloodPkt.from], tp=pos[summFloodPkt.to]; if(!fp||!tp) return;
  summTrails.forEach(t=>{
    const bx=fp.x+(tp.x-fp.x)*t.prog, by=fp.y+(tp.y-fp.y)*t.prog;
    ctx.globalAlpha=t.alpha*0.35; ctx.beginPath(); ctx.arc(bx,by,5,0,Math.PI*2);
    ctx.fillStyle=summFloodPkt.color||'#f59e0b'; ctx.fill(); ctx.globalAlpha=1;
  });
}

function summDrawFloodPkt(ctx, pos) {
  const fp=pos[summFloodPkt.from], tp=pos[summFloodPkt.to]; if(!fp||!tp) return;
  const t=summFloodPkt.prog, bx=fp.x+(tp.x-fp.x)*t, by=fp.y+(tp.y-fp.y)*t;
  const c=summFloodPkt.color||'#f59e0b', label=summFloodPkt.type;
  const grd=ctx.createRadialGradient(bx,by,0,bx,by,32);
  grd.addColorStop(0,c+'55'); grd.addColorStop(0.6,c+'18'); grd.addColorStop(1,'transparent');
  ctx.fillStyle=grd; ctx.beginPath(); ctx.arc(bx,by,32,0,Math.PI*2); ctx.fill();
  const inner=ctx.createRadialGradient(bx-5,by-5,0,bx,by,16);
  inner.addColorStop(0,c+'ff'); inner.addColorStop(1,c+'aa');
  ctx.fillStyle=inner; ctx.strokeStyle='#fff4'; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.arc(bx,by,16,0,Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.fillStyle='#fff'; ctx.font='bold 8px IBM Plex Mono'; ctx.textAlign='center';
  ctx.fillText(label, bx, by+3);
}

function summDrawPulseRing(ctx, p, t, color) {
  const r=60*easeOutQuad(t);
  ctx.beginPath(); ctx.arc(p.x,p.y,r,0,Math.PI*2);
  ctx.strokeStyle=color; ctx.globalAlpha=(1-t)*0.7; ctx.lineWidth=2; ctx.stroke(); ctx.globalAlpha=1;
}

function summRR(ctx,x,y,w,h,r) {
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.arcTo(x+w,y,x+w,y+r,r);
  ctx.lineTo(x+w,y+h-r); ctx.arcTo(x+w,y+h,x+w-r,y+h,r);
  ctx.lineTo(x+r,y+h); ctx.arcTo(x,y+h,x,y+h-r,r);
  ctx.lineTo(x,y+r); ctx.arcTo(x,y,x+r,y,r); ctx.closePath();
}

/* ═══════════════════════════════════════════════════════
   PLAYBACK CONTROL
   ═══════════════════════════════════════════════════════ */
function summReset() {
  clearTimeout(summTimer); summPlaying=false;
  cancelAnimationFrame(summAnimId); cancelAnimationFrame(summCollapseAnimId);
  summFloodPkt.on=false; summTrails=[]; summPulseRings=[];
  summCollapseAnim={on:false,prog:0,routerId:''};
  summCurrentStep=0;
  const btn=document.getElementById('summPlay');
  if(btn){btn.textContent='▶';btn.setAttribute('data-label','PLAY');btn.classList.remove('play-active');}
  summUpdatePanel(); summDraw();
}

function summTogglePlay() {
  summPlaying=!summPlaying;
  const btn=document.getElementById('summPlay');
  if(summPlaying){btn.textContent='⏸';btn.setAttribute('data-label','PAUSE');btn.classList.add('play-active');summAutoStep();}
  else{btn.textContent='▶';btn.setAttribute('data-label','PLAY');btn.classList.remove('play-active');clearTimeout(summTimer);}
}

function summAutoStep() {
  if(!summPlaying) return;
  if(summCurrentStep<summSteps.length-1){summGo(1);summTimer=setTimeout(summAutoStep,summSpeedMs);}
  else{summPlaying=false;const btn=document.getElementById('summPlay');if(btn){btn.textContent='▶';btn.setAttribute('data-label','PLAY');btn.classList.remove('play-active');}}
}

function summGo(dir) {
  if(summPlaying && dir===-1) summTogglePlay();
  const n=summCurrentStep+dir;
  if(n<0||n>=summSteps.length) return;
  summCurrentStep=n; summTrails=[];
  const s=summSteps[summCurrentStep];

  // Collapse animation trigger
  cancelAnimationFrame(summCollapseAnimId);
  if(s.triggerCollapse) {
    summCollapseAnim={on:true,prog:0,routerId:s.triggerCollapse};
    summCollapseStart=null;
    const colTick=(ts)=>{
      if(!summCollapseStart) summCollapseStart=ts;
      summCollapseAnim.prog=Math.min((ts-summCollapseStart)/800,1);
      summDraw();
      if(summCollapseAnim.prog<1) summCollapseAnimId=requestAnimationFrame(colTick);
      else{ summCollapseAnim.on=false; }
    };
    summCollapseAnimId=requestAnimationFrame(colTick);
  } else { summCollapseAnim={on:false,prog:0,routerId:''}; }

  if(s.flood&&s.flood.from&&s.flood.to){
    summFloodPkt={on:true,prog:0,from:s.flood.from,to:s.flood.to,type:s.flood.lsaType,color:SUMM_COLORS[s.flood.lsaType]||'#f59e0b'};
    summAnimatePkt();
  } else { summFloodPkt.on=false; cancelAnimationFrame(summAnimId); summUpdatePanel(); summDraw(); }
}

function summAnimatePkt() {
  summFloodPkt.prog=0; summAnimStart=null;
  const tick=ts=>{
    if(!summAnimStart) summAnimStart=ts;
    const raw=Math.min((ts-summAnimStart)/summAnimDur,1);
    summFloodPkt.prog=easeInOutCubic(raw);
    summTrails.push({prog:summFloodPkt.prog,alpha:1});
    summTrails=summTrails.map(t=>({...t,alpha:t.alpha-0.05})).filter(t=>t.alpha>0);
    summDraw();
    if(raw<1){summAnimId=requestAnimationFrame(tick);}
    else{
      summFloodPkt.prog=1; summTrails=[];
      if(summFloodPkt.to&&summFloodPkt.to!=='BLOCK'){summPulseRings=[{rid:summFloodPkt.to,t:0}];summAnimPulse();}
      summFloodPkt.on=false; summDraw(); summUpdatePanel();
    }
  };
  summAnimId=requestAnimationFrame(tick);
}

function summAnimPulse() {
  summPulseRings=summPulseRings.map(r=>({...r,t:r.t+0.06})).filter(r=>r.t<1);
  summDraw(); if(summPulseRings.length>0) requestAnimationFrame(summAnimPulse);
}

function summSetSpeed(v) {
  document.getElementById('summSpdLbl').textContent=parseFloat(v).toFixed(1)+'×';
  summSpeedMs=Math.round(4500/parseFloat(v));
  summAnimDur=Math.max(400,Math.round(1200/parseFloat(v)));
}

/* ═══════════════════════════════════════════════════════
   PANEL UPDATE
   ═══════════════════════════════════════════════════════ */
function summUpdatePanel() {
  const s=summSteps[summCurrentStep]; if(!s) return;
  const pct=summSteps.length>1?Math.round((summCurrentStep/(summSteps.length-1))*100):0;
  const fill=document.getElementById('summProgressFill');
  if(fill) fill.style.width=pct+'%';
  document.getElementById('summStepTitle').textContent=s.title||'—';
  document.getElementById('summStepDesc').innerHTML=s.desc||'—';
  document.getElementById('summSNum').textContent=`Step ${summCurrentStep+1} / ${summSteps.length}`;
  const cliEl=document.getElementById('summStepCli');
  if(s.cli){cliEl.style.display='block';cliEl.textContent=s.cli;}else cliEl.style.display='none';
  document.getElementById('summStepRfc').textContent=s.rfc||'';
  const ruleEl=document.getElementById('summRuleBox');
  if(s.rule){ruleEl.style.display='block';ruleEl.innerHTML=s.rule;}else ruleEl.style.display='none';

  // Prefix table
  const ptEl=document.getElementById('summPrefixTable');
  if(s.prefixRows&&s.prefixRows.length){
    ptEl.innerHTML=`<table class="summ-prefix-table">
      <thead><tr><th>Prefix</th><th>Type</th><th>Metric</th><th>Status</th></tr></thead>
      <tbody>${s.prefixRows.map(r=>`<tr>
        <td>${r.prefix}</td>
        <td><span style="background:${SUMM_COLORS[r.type]||'#1e3050'}22;color:${SUMM_COLORS[r.type]||'#64748b'};border:1px solid ${SUMM_COLORS[r.type]||'#1e3050'}55;padding:1px 6px;border-radius:3px;font-size:9px;font-weight:700">${r.type}</span></td>
        <td>${r.metric||'—'}</td>
        <td style="color:${r.ok?'#22c55e':'#ef4444'}">${r.status}</td>
      </tr>`).join('')}</tbody>
    </table>`;
  } else { ptEl.innerHTML='<div class="summ-no-pkt">No prefix data at this step</div>'; }

  // Log
  const logEl=document.getElementById('summLog');
  logEl.innerHTML=summSteps.map((st,i)=>{
    const cls=i===summCurrentStep?'summ-log-item cur':'summ-log-item';
    return `<div class="${cls}">${i+1}. ${st.log||st.title}</div>`;
  }).join('');
  const curEl=logEl.querySelector('.cur');
  if(curEl){const top=curEl.offsetTop-logEl.offsetTop-(logEl.clientHeight/2)+(curEl.clientHeight/2);logEl.scrollTo({top:Math.max(0,top),behavior:'smooth'});}

  // Wireshark
  const badge=document.getElementById('summPktBadge'), body=document.getElementById('summPktBody');
  const c=SUMM_SCENARIO_META[summScenario]?.color||'#f59e0b';
  if(!s.lsaFields){
    badge.textContent='— No LSA';badge.style.background='#0d1526';badge.style.color='#2c4470';badge.style.border='1px solid #1a2640';
    body.innerHTML='<div class="summ-no-pkt">No LSA at this step</div>'; return;
  }
  badge.textContent=s.lsaBadge||'LSA';
  badge.style.background=c+'1a';badge.style.color=c;badge.style.border=`1px solid ${c}44`;
  body.innerHTML=`<table class="summ-prefix-table">
    <thead><tr><th>Field</th><th>Value</th><th>Notes</th></tr></thead>
    <tbody>${s.lsaFields.map(f=>`<tr><td>${f.f}</td><td>${f.v}</td><td>${f.n}</td></tr>`).join('')}</tbody>
  </table>`;
}

/* ═══════════════════════════════════════════════════════════════════════════
   STEP DATA — PHASE 8 SCENARIOS
   ═══════════════════════════════════════════════════════════════════════════ */
const SUMM_STEP_DATA = {

/* ══════════════════════════════════════
   ABR SUMMARIZATION (Type 3 collapse)
   R2 has 172.16.1-4.0/24 in Area 1.
   R1(ABR) summarizes → 172.16.0.0/21
   floods a single T3 into Area 0.
══════════════════════════════════════ */
abr: [
  {
    title:'ABR Summarization — Overview',
    log:'ABR Summarization overview',
    desc:'When an ABR connects Area 1 to Area 0, by default it generates a <b>separate Type 3 Summary LSA</b> for every specific prefix it learns in Area 1. With summarization configured, the ABR collapses multiple contiguous prefixes into a <b>single Type 3 LSA</b> representing the summary block.<br><br>This demo: R2 (IR in Area 1) has four loopbacks — 172.16.1.0/24, 172.16.2.0/24, 172.16.3.0/24, 172.16.4.0/24. R1 (ABR) summarizes them into <b>172.16.0.0/21</b>, flooding a single Type 3 into Area 0 instead of four.',
    rfc:'RFC 2328 §12.4.3 — ABR summarization reduces Type 3 LSA count',
    highlightedRouters:[], floodedLinks:[], blockedLinks:[], prefixClouds:null,
    prefixRows:[
      {prefix:'172.16.1.0/24',type:'prefix',metric:'1',status:'In Area 1 (R2 loopback)',ok:true},
      {prefix:'172.16.2.0/24',type:'prefix',metric:'1',status:'In Area 1 (R2 loopback)',ok:true},
      {prefix:'172.16.3.0/24',type:'prefix',metric:'1',status:'In Area 1 (R2 loopback)',ok:true},
      {prefix:'172.16.4.0/24',type:'prefix',metric:'1',status:'In Area 1 (R2 loopback)',ok:true},
      {prefix:'172.16.0.0/21',type:'T3',metric:'1',status:'Summary (not yet created)',ok:false},
    ],
    flood:null, lsaFields:null,
    routerStatus:{R1:'ABR · summarizing',R2:'IR · 4 prefixes',R3:'ASBR · redistributing',R4:'ABR · inter-area',R5:'IR · Area 2'},
  },
  {
    title:'Step 1 — R2 Generates Router LSAs for Four /24 Prefixes',
    log:'R2 (Area 1) originates Type 1 with 4 stub networks',
    desc:'R2 (Internal Router in Area 1) originates its <b>Router LSA (Type 1)</b> listing four stub networks: 172.16.1.0/24 through 172.16.4.0/24. These represent loopback interfaces on R2.<br><br>Within Area 1, both R1 and R2 know these specific /24 prefixes via intra-area SPF.',
    cli:'! R2 configuration:\ninterface Loopback1\n ip address 172.16.1.1 255.255.255.0\n ip ospf 1 area 1\ninterface Loopback2\n ip address 172.16.2.1 255.255.255.0\n ip ospf 1 area 1\n! (repeat for .3 and .4)\n\nshow ip ospf database router 2.2.2.2\n! 4 stub-network entries in Area 1 Router LSA',
    rfc:'RFC 2328 §12.4.1 — Router LSA lists all stub networks',
    highlightedRouters:['R2'],
    floodedLinks:[],blockedLinks:[],
    prefixClouds:[{
      routerId:'R2',
      prefixes:['172.16.1.0/24','172.16.2.0/24','172.16.3.0/24','172.16.4.0/24'],
      summary:'172.16.0.0/21', summaryColor:'#f59e0b',
      color:'#22c55e', collapsed:false
    }],
    prefixRows:[
      {prefix:'172.16.1.0/24',type:'prefix',metric:'1',status:'R2 loopback — Area 1',ok:true},
      {prefix:'172.16.2.0/24',type:'prefix',metric:'1',status:'R2 loopback — Area 1',ok:true},
      {prefix:'172.16.3.0/24',type:'prefix',metric:'1',status:'R2 loopback — Area 1',ok:true},
      {prefix:'172.16.4.0/24',type:'prefix',metric:'1',status:'R2 loopback — Area 1',ok:true},
    ],
    flood:null,lsaFields:null,
    routerStatus:{R1:'ABR · waiting',R2:'IR · 4 prefixes',R3:'',R4:'',R5:''},
  },
  {
    title:'Step 2 — R2 Router LSA Floods to R1 (ABR)',
    log:'R2 → Type 1 Router LSA → R1 (carries 4 stubs)',
    desc:'R2 floods its Router LSA to R1 in Area 1. R1 installs this in its Area 1 LSDB and now knows about all four /24 prefixes.<br><br>R1 runs SPF for Area 1 and computes the intra-area routes. Next, R1 must decide what to advertise into Area 0.',
    cli:'show ip ospf database router 2.2.2.2  ! on R1\n! Router Link States (Area 1)\n! Stub Networks:\n!   172.16.1.0 255.255.255.0  metric 1\n!   172.16.2.0 255.255.255.0  metric 1\n!   172.16.3.0 255.255.255.0  metric 1\n!   172.16.4.0 255.255.255.0  metric 1',
    rfc:'RFC 2328 §13.3',
    highlightedRouters:['R1','R2'],
    floodedLinks:[{a:'R2',b:'R1'}],blockedLinks:[],
    prefixClouds:[{
      routerId:'R2',
      prefixes:['172.16.1.0/24','172.16.2.0/24','172.16.3.0/24','172.16.4.0/24'],
      summary:'172.16.0.0/21', summaryColor:'#f59e0b',
      color:'#22c55e', collapsed:false
    }],
    prefixRows:[
      {prefix:'172.16.1.0/24',type:'prefix',metric:'1',status:'R1 LSDB (Area 1) ✔',ok:true},
      {prefix:'172.16.2.0/24',type:'prefix',metric:'1',status:'R1 LSDB (Area 1) ✔',ok:true},
      {prefix:'172.16.3.0/24',type:'prefix',metric:'1',status:'R1 LSDB (Area 1) ✔',ok:true},
      {prefix:'172.16.4.0/24',type:'prefix',metric:'1',status:'R1 LSDB (Area 1) ✔',ok:true},
    ],
    flood:{from:'R2',to:'R1',lsaType:'T3'},lsaFields:null,
    routerStatus:{R1:'ABR · received 4 routes',R2:'IR · 4 prefixes',R3:'',R4:'',R5:''},
  },
  {
    title:'Step 3 — R1 ABR Runs SPF: Matches Prefix Bits → Summary',
    log:'R1 ABR: 172.16.1-4.0/24 → matches 172.16.0.0/21 → COLLAPSE',
    desc:'R1 (ABR) examines all four /24 routes it learned from Area 1.<br><br><b>Summarization check (bit matching):</b><br>172.16.<b>000</b>00001.0 /24<br>172.16.<b>000</b>00010.0 /24<br>172.16.<b>000</b>00011.0 /24<br>172.16.<b>000</b>00100.0 /24<br>— First 21 bits match → summary = <b>172.16.0.0/21</b><br><br>The configured <code>area 1 range 172.16.0.0 255.255.248.0</code> matches all four prefixes. R1 will now suppress the four individual Type 3s and generate <b>a single Type 3 for 172.16.0.0/21</b>.',
    cli:'! R1 ABR configuration:\nrouter ospf 1\n area 1 range 172.16.0.0 255.255.248.0\n\n! Verification:\nshow ip ospf summary-address\n! OSPF 1 - Summary-address\n!   172.16.0.0/255.255.248.0  Area 1  metric 1',
    rfc:'RFC 2328 §12.4.3 — range command suppresses specific prefixes, generates summary T3',
    rule:'<b>Metric of summary = lowest metric among contributing prefixes.</b> If 172.16.1.0/24 has cost 10 and 172.16.2.0/24 has cost 5, the summary 172.16.0.0/21 advertises with metric 5. The summary remains active as long as at least one contributing route is in the routing table.',
    triggerCollapse:'R1',
    highlightedRouters:['R1'],
    floodedLinks:[{a:'R2',b:'R1'}],blockedLinks:[],
    prefixClouds:[{
      routerId:'R1',
      prefixes:['172.16.1.0/24','172.16.2.0/24','172.16.3.0/24','172.16.4.0/24'],
      summary:'172.16.0.0/21', summaryColor:'#f59e0b',
      color:'#22c55e', collapsed:false
    }],
    prefixRows:[
      {prefix:'172.16.1.0/24',type:'prefix',metric:'1',status:'→ suppressed by summary',ok:false},
      {prefix:'172.16.2.0/24',type:'prefix',metric:'1',status:'→ suppressed by summary',ok:false},
      {prefix:'172.16.3.0/24',type:'prefix',metric:'1',status:'→ suppressed by summary',ok:false},
      {prefix:'172.16.4.0/24',type:'prefix',metric:'1',status:'→ suppressed by summary',ok:false},
      {prefix:'172.16.0.0/21',type:'T3',metric:'1',status:'✔ Summary generated at R1',ok:true},
    ],
    flood:null,lsaFields:null,
    routerStatus:{R1:'ABR · COLLAPSING → 172.16.0.0/21',R2:'IR · 4 prefixes',R3:'',R4:'',R5:''},
    summaryAt:'R1', summaryPrefix:'172.16.0.0/21', summaryColor:'#f59e0b', collapseDone:false,
  },
  {
    title:'Step 4 — R1 Floods Single Type 3 Summary LSA into Area 0',
    log:'R1 → Type 3 Summary LSA (172.16.0.0/21) → R3 (Area 0)',
    desc:'R1 originates a <b>single Type 3 Summary LSA</b> for 172.16.0.0/21 and floods it into Area 0. The four individual /24 LSAs are suppressed — they never appear in R3 or R4\'s LSDB.<br><br><b>Route count in Area 0 for this address block:</b><br>Without summarization: 4 Type 3 LSAs<br><b>With summarization: 1 Type 3 LSA — 75% reduction</b>',
    cli:'show ip ospf database summary  ! on R3 (Area 0)\n! Summary Net Link States (Area 0)\n! LS Type: Summary Links (Network)\n! Link State ID: 172.16.0.0\n! Adv. Router: 1.1.1.1        ← R1 is advertising\n! Network Mask: /21\n! Metric: 1\n\nshow ip route ospf  ! on R3\n! O IA   172.16.0.0/21 [110/2] via 10.0.1.1, Gi0/0',
    rfc:'RFC 2328 §12.4.3 — Type 3 from ABR represents inter-area prefix',
    highlightedRouters:['R1','R3'],
    floodedLinks:[{a:'R1',b:'R3'}],blockedLinks:[],
    prefixClouds:[{
      routerId:'R1',
      prefixes:['172.16.1.0/24','172.16.2.0/24','172.16.3.0/24','172.16.4.0/24'],
      summary:'172.16.0.0/21', summaryColor:'#f59e0b',
      color:'#22c55e', collapsed:true
    }],
    prefixRows:[
      {prefix:'172.16.0.0/21',type:'T3',metric:'1',status:'✔ Flooding to Area 0',ok:true},
      {prefix:'172.16.1.0/24',type:'prefix',metric:'—',status:'SUPPRESSED in Area 0',ok:false},
      {prefix:'172.16.2.0/24',type:'prefix',metric:'—',status:'SUPPRESSED in Area 0',ok:false},
      {prefix:'172.16.3.0/24',type:'prefix',metric:'—',status:'SUPPRESSED in Area 0',ok:false},
      {prefix:'172.16.4.0/24',type:'prefix',metric:'—',status:'SUPPRESSED in Area 0',ok:false},
    ],
    flood:{from:'R1',to:'R3',lsaType:'T3'},
    lsaBadge:'Type 3 · Summary LSA · 172.16.0.0/21',
    lsaFields:[
      {f:'LS Type',        v:'3 (Summary)',    n:'Network Summary LSA'},
      {f:'Link State ID',  v:'172.16.0.0',    n:'Summary network address'},
      {f:'Adv. Router',    v:'1.1.1.1',       n:'R1 (ABR) originates this — not R2'},
      {f:'Network Mask',   v:'/21 (255.255.248.0)', n:'Covers .1,.2,.3,.4 of /24s'},
      {f:'Metric',         v:'1',             n:'Min metric of contributing routes'},
      {f:'Seq Number',     v:'0x80000001',    n:'Fresh origination'},
      {f:'Scope',          v:'Area 0 + Area 2',n:'Floods to all non-originating areas'},
    ],
    routerStatus:{R1:'ABR · flooding T3',R2:'IR · 4 prefixes',R3:'Rcvd summary ✔',R4:'',R5:''},
    summaryAt:'R1', summaryPrefix:'172.16.0.0/21', summaryColor:'#f59e0b', collapseDone:true,
  },
  {
    title:'Step 5 — Summary LSA Floods Onward to R4 and R5 (Area 2)',
    log:'R3 → R4 (ABR) → R5 (Area 2): Type 3 propagates',
    desc:'R3 (ASBR in Area 0) receives R1\'s Type 3 and forwards it onward. R4 (ABR between Area 0 and Area 2) receives the Type 3 and generates a new Type 3 for Area 2 (with metric = original metric + inter-area cost to R1).<br><br>R5 (IR in Area 2) now has a route to 172.16.0.0/21 pointing back through R4 → R3 → R1 → R2.',
    cli:'show ip route ospf  ! on R5 (Area 2)\n! O IA  172.16.0.0/21 [110/3] via 10.2.0.1\n!       ↑ inter-area          ↑ R4 address\n\n! Cost breakdown:\n! R5→R4: 1  +  R4→R3: 1  +  R3→R1: 1  +  R1 metric: 1 = 4 (adjust per topo)\n! Actual cost depends on interface costs in topology',
    rfc:'RFC 2328 §12.4.3 — Type 3 propagated by each ABR; metric accumulates',
    highlightedRouters:['R3','R4','R5'],
    floodedLinks:[{a:'R3',b:'R4'},{a:'R4',b:'R5'}],blockedLinks:[],
    prefixClouds:[{routerId:'R1',prefixes:['172.16.1.0/24','172.16.2.0/24','172.16.3.0/24','172.16.4.0/24'],summary:'172.16.0.0/21',summaryColor:'#f59e0b',color:'#22c55e',collapsed:true}],
    prefixRows:[
      {prefix:'172.16.0.0/21',type:'T3',metric:'1+cost',status:'✔ Flooded to Area 2',ok:true},
    ],
    flood:{from:'R3',to:'R4',lsaType:'T3'},lsaFields:null,
    routerStatus:{R1:'ABR · T3 originated',R2:'IR · 4 prefixes',R3:'forwarding',R4:'ABR · re-originating T3',R5:'Rcvd ✔'},
    summaryAt:'R1', summaryPrefix:'172.16.0.0/21', summaryColor:'#f59e0b', collapseDone:true,
  },
  {
    title:'Step 6 — Null0 Discard Route: Loop Prevention',
    log:'R1: 172.16.0.0/21 → Null0 discard installed',
    desc:'A critical OSPF summarization side effect: R1 automatically installs a <b>discard route</b> (Null0) for the summary prefix in its own routing table.<br><br><b>Why?</b> If a packet arrives at R1 destined for 172.16.5.0/24 (which is within 172.16.0.0/21 but does NOT exist), R1 would forward it back into Area 0 (matching the Type 3 it generated), creating a <b>routing loop</b>. The Null0 route prevents this by dropping such packets.<br><br>This is automatically done when ABR summarization is configured.',
    cli:'show ip route  ! on R1\n! O   172.16.0.0/21 is a summary, 01:23:45, Null0\n!   ↑ OSPF     ↑ summary range     ↑ Null0 discard\n\n! This is NOT a real route — packets hitting it are dropped.\n! The actual /24 routes are in R1\'s Area 1 routing table.',
    rfc:'RFC 2328 §12.4.3 — ABR installs discard route to prevent inter-area loops',
    rule:'<b>Always verify the Null0 route exists after configuring ABR summarization.</b> If you see "area X range" configured but no Null0 in the routing table, the summary is not active (no contributing routes in the table).',
    highlightedRouters:['R1'],
    floodedLinks:[],blockedLinks:[],
    prefixClouds:[{routerId:'R1',prefixes:['172.16.1.0/24','172.16.2.0/24','172.16.3.0/24','172.16.4.0/24'],summary:'172.16.0.0/21',summaryColor:'#f59e0b',color:'#22c55e',collapsed:true}],
    prefixRows:[
      {prefix:'172.16.0.0/21',type:'T3',metric:'—',status:'Null0 discard on R1 ✔',ok:true},
      {prefix:'172.16.5.0/24',type:'prefix',metric:'—',status:'⛔ → Null0 drop (loop prevention)',ok:false},
    ],
    flood:null,lsaFields:null,
    routerStatus:{R1:'ABR · Null0 installed',R2:'IR · live',R3:'',R4:'',R5:''},
    summaryAt:'R1', summaryPrefix:'172.16.0.0/21', summaryColor:'#f59e0b', collapseDone:true,
  },
],

/* ══════════════════════════════════════
   ASBR SUMMARIZATION (Type 5 aggregate)
   R3 redistributes 3 external prefixes.
   summary-address collapses to 203.0.112.0/22.
══════════════════════════════════════ */
asbr: [
  {
    title:'ASBR Summarization — Overview',
    log:'ASBR Summarization overview',
    desc:'An ASBR (Autonomous System Boundary Router) redistributes external routes into OSPF as <b>Type 5 (AS External) LSAs</b>. Without summarization, each redistributed prefix becomes a separate Type 5 flooded domain-wide.<br><br><b>This demo:</b> R3 (ASBR in Area 0) redistributes from BGP: 203.0.113.0/24, 203.0.114.0/24, 203.0.115.0/24. With <code>summary-address</code>, these collapse into a single <b>203.0.112.0/22</b> Type 5 LSA flooded to the whole OSPF domain.',
    rfc:'RFC 2328 §12.4.4 — ASBR summarization via summary-address',
    highlightedRouters:[],floodedLinks:[],blockedLinks:[],prefixClouds:null,
    prefixRows:[
      {prefix:'203.0.113.0/24',type:'prefix',metric:'20',status:'BGP redistributed (pre-summary)',ok:true},
      {prefix:'203.0.114.0/24',type:'prefix',metric:'20',status:'BGP redistributed (pre-summary)',ok:true},
      {prefix:'203.0.115.0/24',type:'prefix',metric:'20',status:'BGP redistributed (pre-summary)',ok:true},
      {prefix:'203.0.112.0/22',type:'T5',metric:'20',status:'Summary (not yet active)',ok:false},
    ],
    flood:null,lsaFields:null,
    routerStatus:{R1:'ABR',R2:'IR',R3:'ASBR · 3 ext routes',R4:'ABR',R5:'IR'},
  },
  {
    title:'Step 1 — R3 Redistributes Three /24 Prefixes from BGP',
    log:'R3 (ASBR): redistribute BGP → 3 Type 5 LSAs (no summarization)',
    desc:'R3 redistributes three BGP prefixes into OSPF. Without summarization, each generates its own <b>Type 5 External LSA</b> flooded domain-wide.<br><br>All OSPF routers would receive and store all three Type 5 LSAs — increasing LSDB size by 3 entries for every router in every area.',
    cli:'router ospf 1\n redistribute bgp 65001 subnets\n\nshow ip ospf database external\n! AS External Link States\n! 203.0.113.0   Adv: 3.3.3.3  Metric: 20  Type: E2\n! 203.0.114.0   Adv: 3.3.3.3  Metric: 20  Type: E2\n! 203.0.115.0   Adv: 3.3.3.3  Metric: 20  Type: E2',
    rfc:'RFC 2328 §12.4.4 — Type 5: Autonomous System External LSA',
    highlightedRouters:['R3'],
    floodedLinks:[],blockedLinks:[],
    prefixClouds:[{
      routerId:'R3',
      prefixes:['203.0.113.0/24','203.0.114.0/24','203.0.115.0/24'],
      summary:'203.0.112.0/22',summaryColor:'#ef4444',
      color:'#ef444488',collapsed:false
    }],
    prefixRows:[
      {prefix:'203.0.113.0/24',type:'T5',metric:'20',status:'Active Type 5 LSA',ok:true},
      {prefix:'203.0.114.0/24',type:'T5',metric:'20',status:'Active Type 5 LSA',ok:true},
      {prefix:'203.0.115.0/24',type:'T5',metric:'20',status:'Active Type 5 LSA',ok:true},
    ],
    flood:null,lsaFields:null,
    routerStatus:{R1:'',R2:'',R3:'ASBR · 3 T5s',R4:'',R5:''},
  },
  {
    title:'Step 2 — summary-address Configured on R3 → Collapse',
    log:'R3: summary-address 203.0.112.0 255.255.252.0 → 1 Type 5',
    desc:'Adding <code>summary-address 203.0.112.0 255.255.252.0</code> to R3\'s OSPF config triggers ASBR summarization:<br><br>1. OSPF checks each redistributed prefix against the range<br>2. 203.0.113.0/24, .114.0/24, .115.0/24 all fall within 203.0.112.0/22<br>3. The three specific Type 5 LSAs are <b>withdrawn (MaxAge)</b><br>4. A <b>single new Type 5 for 203.0.112.0/22</b> is originated<br><br>Unlike ABR summarization (<code>area range</code>), ASBR summarization applies at the redistribution point.',
    cli:'router ospf 1\n summary-address 203.0.112.0 255.255.252.0\n\nshow ip ospf summary-address\n! OSPF Process 1 Summary Address\n!  203.0.112.0/22  Tag:0  Metric:-1  External:E2',
    rfc:'RFC 2328 — summary-address on ASBR aggregates Type 5 external routes',
    rule:'<b>ASBR summarization (summary-address) only works on the ASBR itself.</b> ABRs cannot summarize Type 5 LSAs — they are domain-scoped and pass through ABRs unchanged. Only the originating ASBR can collapse Type 5s.',
    triggerCollapse:'R3',
    highlightedRouters:['R3'],floodedLinks:[],blockedLinks:[],
    prefixClouds:[{
      routerId:'R3',
      prefixes:['203.0.113.0/24','203.0.114.0/24','203.0.115.0/24'],
      summary:'203.0.112.0/22',summaryColor:'#ef4444',
      color:'#ef444488',collapsed:false
    }],
    prefixRows:[
      {prefix:'203.0.113.0/24',type:'T5',metric:'—',status:'→ WITHDRAWN (MaxAge)',ok:false},
      {prefix:'203.0.114.0/24',type:'T5',metric:'—',status:'→ WITHDRAWN (MaxAge)',ok:false},
      {prefix:'203.0.115.0/24',type:'T5',metric:'—',status:'→ WITHDRAWN (MaxAge)',ok:false},
      {prefix:'203.0.112.0/22',type:'T5',metric:'20',status:'✔ New Type 5 originated',ok:true},
    ],
    flood:null,lsaFields:null,
    routerStatus:{R1:'',R2:'',R3:'ASBR · COLLAPSING',R4:'',R5:''},
    summaryAt:'R3',summaryPrefix:'203.0.112.0/22',summaryColor:'#ef4444',collapseDone:false,
  },
  {
    title:'Step 3 — Single Type 5 Floods Domain-Wide',
    log:'R3 → Type 5 (203.0.112.0/22) → R1 → all areas',
    desc:'R3 floods the <b>single Type 5 Summary LSA</b> for 203.0.112.0/22. Because Type 5 LSAs have OSPF domain-wide scope, this single LSA reaches every router in every area — including R2 (Area 1) and R5 (Area 2).<br><br>Every router in the domain now stores <b>1 Type 5</b> entry instead of 3 — a 67% reduction in external LSDB entries.',
    cli:'show ip ospf database external  ! on R2 (Area 1)\n! AS External Link States\n! 203.0.112.0  Adv:3.3.3.3  Mask:/22  Type:E2  Metric:20\n! (No more .113, .114, .115 — all gone)\n\nshow ip route  ! on R5\n! O E2  203.0.112.0/22 [110/20] via 10.2.0.1',
    rfc:'RFC 2328 §12.4.4 — Type 5 is domain-wide; passes through ABRs unchanged',
    highlightedRouters:['R1','R2','R3','R4','R5'],
    floodedLinks:[{a:'R3',b:'R1'},{a:'R1',b:'R2'},{a:'R3',b:'R4'},{a:'R4',b:'R5'}],blockedLinks:[],
    prefixClouds:[{routerId:'R3',prefixes:['203.0.113.0/24','203.0.114.0/24','203.0.115.0/24'],summary:'203.0.112.0/22',summaryColor:'#ef4444',color:'#ef444488',collapsed:true}],
    prefixRows:[
      {prefix:'203.0.112.0/22',type:'T5',metric:'20',status:'✔ In all routers\' LSDB',ok:true},
    ],
    flood:{from:'R3',to:'R1',lsaType:'T5'},
    lsaBadge:'Type 5 · AS External LSA · 203.0.112.0/22',
    lsaFields:[
      {f:'LS Type',       v:'5 (AS External)',  n:'Domain-wide scope'},
      {f:'Link State ID', v:'203.0.112.0',      n:'Summary network address'},
      {f:'Adv. Router',   v:'3.3.3.3',          n:'R3 (ASBR) originates'},
      {f:'Network Mask',  v:'/22 (255.255.252.0)',n:'Covers 203.0.112-115.0/24'},
      {f:'Metric Type',   v:'E2',               n:'External Type 2 (metric not accumulated)'},
      {f:'Metric',        v:'20',               n:'External metric from BGP MED or default'},
      {f:'Forwarding Addr',v:'0.0.0.0',         n:'0.0.0.0 = route to ASBR (R3) directly'},
      {f:'Scope',         v:'All areas',        n:'Floods through all ABRs — never blocked'},
    ],
    routerStatus:{R1:'Rcvd T5 ✔',R2:'Rcvd T5 ✔',R3:'ASBR · T5 flooding',R4:'Rcvd T5 ✔',R5:'Rcvd T5 ✔'},
    summaryAt:'R3',summaryPrefix:'203.0.112.0/22',summaryColor:'#ef4444',collapseDone:true,
  },
],

/* ══════════════════════════════════════
   NO SUMMARIZATION (default comparison)
══════════════════════════════════════ */
nosumm: [
  {
    title:'No Summarization — Default OSPF Behavior',
    log:'No summarization: each prefix floods as separate Type 3',
    desc:'By default, OSPF ABRs do <b>NOT summarize</b>. Every specific prefix learned in one area is advertised as a separate <b>Type 3 Summary LSA</b> into all other areas. This is called the "default" or "no summarization" mode.<br><br><b>Impact at scale:</b><br>• 100 prefixes in Area 1 → 100 Type 3 LSAs in Area 0 and Area 2<br>• Each ABR, each router stores every prefix individually<br>• SPF runs are heavier (larger LSDB)<br>• A single prefix flap causes LSA flooding and SPF re-run for every router<br><br>Summarization is almost always recommended in enterprise networks.',
    rfc:'RFC 2328 — default behavior: one Type 3 per specific network',
    highlightedRouters:[],floodedLinks:[],blockedLinks:[],prefixClouds:null,
    prefixRows:[
      {prefix:'172.16.1.0/24',type:'T3',metric:'1',status:'Floods as individual T3',ok:true},
      {prefix:'172.16.2.0/24',type:'T3',metric:'1',status:'Floods as individual T3',ok:true},
      {prefix:'172.16.3.0/24',type:'T3',metric:'1',status:'Floods as individual T3',ok:true},
      {prefix:'172.16.4.0/24',type:'T3',metric:'1',status:'Floods as individual T3',ok:true},
    ],
    flood:null,lsaFields:null,
    routerStatus:{R1:'ABR · no summarization',R2:'IR · 4 prefixes',R3:'',R4:'',R5:''},
  },
  {
    title:'Step 1 — 4 Separate Type 3 LSAs Flood from R1 into Area 0',
    log:'R1 → 4× Type 3 LSAs → R3 (no summarization)',
    desc:'Without the <code>area 1 range</code> command, R1 generates <b>four separate Type 3 Summary LSAs</b>, one per prefix from Area 1.<br><br>R3 and R5 both receive all four Type 3s. Their LSDBs grow by 4 entries. Compare this to the ABR summarization scenario where only 1 Type 3 is sent.',
    cli:'! No summarization configured on R1\nshow ip ospf database summary  ! on R3\n! Summary Net Link States (Area 0)\n!  172.16.1.0   Adv:1.1.1.1  Mask:/24  Metric:1\n!  172.16.2.0   Adv:1.1.1.1  Mask:/24  Metric:1\n!  172.16.3.0   Adv:1.1.1.1  Mask:/24  Metric:1\n!  172.16.4.0   Adv:1.1.1.1  Mask:/24  Metric:1\n! (4 entries vs 1 with summarization)',
    rfc:'RFC 2328 §12.4.3 — Without range command, each prefix is a separate T3',
    highlightedRouters:['R1','R3'],
    floodedLinks:[{a:'R1',b:'R3'}],blockedLinks:[],
    prefixClouds:[{
      routerId:'R1',
      prefixes:['172.16.1.0/24','172.16.2.0/24','172.16.3.0/24','172.16.4.0/24'],
      color:'#3b82f6',collapsed:false
    }],
    prefixRows:[
      {prefix:'172.16.1.0/24',type:'T3',metric:'1',status:'Flooding to Area 0',ok:true},
      {prefix:'172.16.2.0/24',type:'T3',metric:'1',status:'Flooding to Area 0',ok:true},
      {prefix:'172.16.3.0/24',type:'T3',metric:'1',status:'Flooding to Area 0',ok:true},
      {prefix:'172.16.4.0/24',type:'T3',metric:'1',status:'Flooding to Area 0',ok:true},
    ],
    flood:{from:'R1',to:'R3',lsaType:'T3'},lsaFields:null,
    routerStatus:{R1:'ABR · 4 T3s (no summ)',R2:'',R3:'Rcvd 4 T3s',R4:'',R5:''},
  },
  {
    title:'Step 2 — 4 Type 3s Continue to Area 2 (via R4)',
    log:'R4 → 4× Type 3 → R5 (Area 2) — full prefix table',
    desc:'R4 (ABR between Area 0 and Area 2) receives all 4 Type 3 LSAs from R3 and re-originates each one into Area 2. R5 now holds all 4 in its LSDB.<br><br><b>Scale problem:</b> If Area 1 had 1000 prefixes, every router in Area 0 and Area 2 would store 1000 Type 3 LSAs. With summarization, just 1 (or a handful of summaries) would be stored.<br><br>This is why OSPF summarization is considered a fundamental design requirement for any production network with more than trivial prefix counts.',
    cli:'show ip ospf database summary  ! on R5 (Area 2)\n! 172.16.1.0/24  Adv:4.4.4.4  Metric:2  ← R4 re-originated\n! 172.16.2.0/24  Adv:4.4.4.4  Metric:2\n! 172.16.3.0/24  Adv:4.4.4.4  Metric:2\n! 172.16.4.0/24  Adv:4.4.4.4  Metric:2\n! (4 entries = same prefix explosion in Area 2)',
    rfc:'RFC 2328 §12.4.3',
    highlightedRouters:['R4','R5'],
    floodedLinks:[{a:'R4',b:'R5'},{a:'R3',b:'R4'}],blockedLinks:[],
    prefixClouds:[{routerId:'R1',prefixes:['172.16.1.0/24','172.16.2.0/24','172.16.3.0/24','172.16.4.0/24'],color:'#3b82f6',collapsed:false}],
    prefixRows:[
      {prefix:'172.16.1.0/24',type:'T3',metric:'2',status:'R5 LSDB — stored',ok:true},
      {prefix:'172.16.2.0/24',type:'T3',metric:'2',status:'R5 LSDB — stored',ok:true},
      {prefix:'172.16.3.0/24',type:'T3',metric:'2',status:'R5 LSDB — stored',ok:true},
      {prefix:'172.16.4.0/24',type:'T3',metric:'2',status:'R5 LSDB — stored',ok:true},
    ],
    flood:{from:'R3',to:'R4',lsaType:'T3'},lsaFields:null,
    routerStatus:{R1:'ABR · 4 T3s sent',R2:'',R3:'',R4:'Re-orig 4 T3s',R5:'4 T3s in LSDB'},
  },
],

/* ══════════════════════════════════════
   DISCONTIGUOUS RANGES (Troubleshoot)
══════════════════════════════════════ */
discon: [
  {
    title:'Discontiguous Summarization — Problem Overview',
    log:'Discontiguous summary: prefix leakage risk',
    desc:'<b>A common misconfiguration:</b> Summarizing a range that includes addresses you do NOT own or do NOT have in your routing table. This can cause <b>traffic black-holing</b> and routing loops.<br><br><b>Scenario:</b> R1 is configured with <code>area 1 range 172.16.0.0 255.255.240.0</code> (= 172.16.0.0/20), but only has 172.16.1.0/24 and 172.16.14.0/24 in Area 1 — these are NOT contiguous within the /20 block. Packets for 172.16.8.0/24 (which R1 does not have) would match the summary and be dropped via Null0.',
    rfc:'Best practice: only summarize contiguous blocks you own',
    highlightedRouters:[],floodedLinks:[],blockedLinks:[],prefixClouds:null,
    prefixRows:[
      {prefix:'172.16.1.0/24',type:'prefix',metric:'1',status:'Exists in Area 1',ok:true},
      {prefix:'172.16.14.0/24',type:'prefix',metric:'1',status:'Exists in Area 1',ok:true},
      {prefix:'172.16.8.0/24',type:'prefix',metric:'—',status:'⛔ NOT in routing table',ok:false},
      {prefix:'172.16.0.0/20',type:'T3',metric:'1',status:'⚠ Summary covers "holes"',ok:false},
    ],
    flood:null,lsaFields:null,
    routerStatus:{R1:'ABR · ⚠ bad summary',R2:'IR',R3:'',R4:'',R5:''},
  },
  {
    title:'Step 1 — Bad Summary Originates Type 3 for 172.16.0.0/20',
    log:'R1 → T3 172.16.0.0/20 → floods → includes "holes"',
    desc:'R1 generates a Type 3 for 172.16.0.0/20 because its two contributing routes (.1.0/24 and .14.0/24) both fall within the /20 range.<br><br>The problem: Area 0 routers believe that all 172.16.x.x addresses within /20 are reachable via R1. But R1 does NOT have a route to 172.16.8.0/24 — it only has the Null0 discard.<br><br><b>Traffic to 172.16.8.x from Area 0 is black-holed at R1.</b>',
    cli:'! Bad config on R1:\nrouter ospf 1\n area 1 range 172.16.0.0 255.255.240.0\n\n! R1 routing table:\nO     172.16.1.0/24  [110/1] Area 1 ✔\nO     172.16.14.0/24 [110/1] Area 1 ✔\nO     172.16.0.0/20  is summary, Null0  ← covers holes!\n! (172.16.8.0/24 not present — packet drops happen here)',
    rfc:'RFC 2328 §12.4.3 — discard route covers the entire configured range',
    rule:'<b>Fix: Use smaller, precise summary ranges</b> — or split into two summaries: 172.16.0.0/24 and 172.16.14.0/24. Never include addresses you don\'t control in a summary range.',
    highlightedRouters:['R1'],
    floodedLinks:[{a:'R1',b:'R3'}],blockedLinks:[],
    prefixClouds:[{
      routerId:'R1',
      prefixes:['172.16.1.0/24','172.16.14.0/24','⚠ 172.16.8.0/24?'],
      summary:'172.16.0.0/20',summaryColor:'#8b5cf6',
      color:'#ef444488',collapsed:false
    }],
    prefixRows:[
      {prefix:'172.16.1.0/24',type:'prefix',metric:'1',status:'Contributes to summary ✔',ok:true},
      {prefix:'172.16.14.0/24',type:'prefix',metric:'1',status:'Contributes to summary ✔',ok:true},
      {prefix:'172.16.8.0/24',type:'prefix',metric:'—',status:'⛔ NOT in table → DROPPED',ok:false},
      {prefix:'172.16.0.0/20',type:'T3',metric:'1',status:'⚠ Floods bad summary',ok:false},
    ],
    flood:{from:'R1',to:'R3',lsaType:'T3'},lsaFields:null,
    routerStatus:{R1:'ABR · ⚠ bad /20 summary',R2:'IR',R3:'Rcvd bad T3',R4:'',R5:''},
  },
  {
    title:'Step 2 — Diagnosis: show ip route and show ip ospf summary-address',
    log:'Diagnosis: Null0 includes holes → packets dropped',
    desc:'<b>Troubleshooting commands to diagnose discontiguous summarization:</b><br><br><code>show ip route 172.16.8.1</code><br>→ Matches 172.16.0.0/20 → Null0 → packet dropped<br><br><code>show ip ospf database summary 172.16.0.0</code><br>→ Shows T3 originated with mask /20 by R1<br><br><code>show ip ospf summary-address</code><br>→ Shows which prefixes contributed vs which are "holes"<br><br><b>Fix:</b> Remove the broad /20 range and replace with specific ranges: <code>area 1 range 172.16.1.0 255.255.255.0</code> and <code>area 1 range 172.16.14.0 255.255.255.0</code> — or use <code>not-advertise</code> keyword to suppress the summary entirely if you don\'t want it in Area 0.',
    cli:'! Diagnosis:\nshow ip route 172.16.8.1  ! on R1\n! Routing entry for 172.16.0.0/20 (supernet)\n!   Known via "ospf 1", distance 110\n!   Routing Descriptor Blocks:\n!     directly connected, via Null0   ← BLACK HOLE\n\nshow ip ospf summary-address  ! on R1\n! OSPF Process 1 Summary Address\n!  172.16.0.0/255.255.240.0 (area 1)\n!    contributing: 172.16.1.0/24, 172.16.14.0/24\n!    HOLES: 172.16.2.0/24 through 172.16.13.0/24, 172.16.15.0/24',
    rfc:'Best practice — verify summarization with explicit show commands',
    rule:'<b>Rule:</b> Before configuring ABR summarization, always verify all addresses in the range are owned. Use the "not-advertise" option if you want to suppress specific prefixes without advertising the summary.',
    highlightedRouters:['R1'],floodedLinks:[],blockedLinks:[],prefixClouds:null,
    prefixRows:[
      {prefix:'172.16.0.0/20',type:'T3',metric:'—',status:'⚠ Active (REMOVE THIS)',ok:false},
      {prefix:'172.16.1.0/24',type:'T3',metric:'1',status:'Add specific range ✔',ok:true},
      {prefix:'172.16.14.0/24',type:'T3',metric:'1',status:'Add specific range ✔',ok:true},
    ],
    flood:null,lsaFields:null,
    routerStatus:{R1:'ABR · troubleshoot',R2:'',R3:'',R4:'',R5:''},
  },
],
}; // End SUMM_STEP_DATA


/* ╔══════════════════════════════════════════════════════════════════╗
   ║  OSPF SIMULATOR · Phase 9 : Virtual Link + Fast Convergence     ║
   ║  BFD · SPF Throttle · Reconvergence Timeline                    ║
   ╚══════════════════════════════════════════════════════════════════╝ */

/* ═══════════════════════════════════════════════════════
   PHASE 9 STATE
   ═══════════════════════════════════════════════════════ */
let fcCanvas, fcCtx;
let fcCurrentStep = 0;
let fcPlaying     = false;
let fcTimer       = null;
let fcSpeedMs     = 4500;
let fcAnimDur     = 1200;
let fcTab         = 'vlink';   // 'vlink' | 'bfd'
let fcScenario    = 'vlink_need';
let fcSteps       = [];
let fcAnimId      = null;
let fcAnimStart   = null;
let fcFloodPkt    = { on:false, prog:0, from:'', to:'', type:'', color:'' };
let fcTrails      = [];
let fcPulseRings  = [];
// BFD timeline animation
let fcTimelineAnim = { on:false, prog:0 };
let fcTimelineAnimId = null;
let fcTimelineStart  = null;

/* ── Colours ── */
const FC_COLORS = {
  vlink:'#06b6d4', bfd:'#22c55e', spf:'#f59e0b', fail:'#ef4444',
  T1:'#3b82f6', T3:'#f59e0b', Hello:'#3b82f6', LSU:'#10b981',
};

/* ── Tab scenarios ── */
const FC_TAB_META = {
  vlink: [
    { key:'vlink_need',   label:'1 · Why Virtual Link?'    },
    { key:'vlink_conf',   label:'2 · VL Configuration'    },
    { key:'vlink_adj',    label:'3 · VL Adjacency Forms'  },
    { key:'vlink_lsa',    label:'4 · LSA Propagation'     },
    { key:'vlink_fail',   label:'5 · VL Failure'          },
  ],
  bfd: [
    { key:'bfd_intro',   label:'1 · BFD Introduction'     },
    { key:'bfd_session', label:'2 · BFD Session Setup'    },
    { key:'bfd_detect',  label:'3 · Failure Detection'    },
    { key:'bfd_spf',     label:'4 · SPF Reconvergence'    },
    { key:'bfd_compare', label:'5 · BFD vs No-BFD'       },
  ],
};

/* ═══════════════════════════════════════════════════════
   ENTRY POINT
   ═══════════════════════════════════════════════════════ */
function ospfFcInit() {
  const host = document.getElementById('ospf-fc-container');
  if (!host) { console.error('Phase 9: #ospf-fc-container missing'); return; }
  host.innerHTML = fcBuildHTML();
  fcCanvas = document.getElementById('fcCanvas');
  fcCtx    = fcCanvas.getContext('2d');
  fcSetTab('vlink');
  window.removeEventListener('resize', fcResize);
  window.addEventListener('resize', fcResize);
  requestAnimationFrame(() => fcResize());
}

/* ═══════════════════════════════════════════════════════
   HTML + CSS
   ═══════════════════════════════════════════════════════ */
function fcBuildHTML() {
  return `
<style>
.fc-wrap{font-family:'IBM Plex Mono',monospace;background:#080d1c;color:#e2e8f0;border-radius:16px;padding:20px;border:1px solid #1a2640;box-shadow:0 8px 40px rgba(0,0,0,.6);user-select:none}
.fc-topbar{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:14px;align-items:center;padding:12px 16px;background:#0d1526;border-radius:10px;border:1px solid #1a2640}
.fc-title{font-size:14px;font-weight:700;color:#60b8ff}
.fc-tab-row{display:flex;gap:0;margin-bottom:14px;border-radius:10px;overflow:hidden;border:1px solid #1a2640}
.fc-tab{flex:1;padding:10px 16px;background:#0d1526;border:none;color:#3b5278;font-family:'IBM Plex Mono',monospace;font-size:12px;font-weight:700;cursor:pointer;transition:all .2s;text-align:center;border-right:1px solid #1a2640;letter-spacing:.3px}
.fc-tab:last-child{border-right:none}
.fc-tab:hover{background:#0f1f3a;color:#7cb9ff}
.fc-tab.active{background:linear-gradient(135deg,#0f2a52,#112244);color:#7cb9ff;box-shadow:inset 0 -2px 0 #3b82f6}
.fc-scen-row{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px}
.fc-btn{background:#0d1829;border:1px solid #1e3050;color:#64748b;padding:6px 14px;border-radius:7px;cursor:pointer;font-size:11px;font-family:'IBM Plex Mono',monospace;font-weight:600;transition:all .2s;letter-spacing:.3px}
.fc-btn:hover{border-color:#3b82f6;color:#7cb9ff;background:#0f1f3a}
.fc-btn.active{background:linear-gradient(135deg,#0f2a52,#112244);border-color:#06b6d4;color:#06b6d4;font-weight:700;box-shadow:0 0 12px rgba(6,182,212,.2)}
.fc-canvas-box{background:#04080f;border-radius:12px;overflow:hidden;margin-bottom:10px;border:1px solid #1a2640;box-shadow:inset 0 2px 20px rgba(0,0,0,.4);position:relative;width:100%}
#fcCanvas{display:block;width:100%;height:auto}
.fc-progress-wrap{margin-bottom:10px;display:flex;align-items:center;gap:10px}
.fc-progress-track{flex:1;height:4px;background:#0d1526;border-radius:2px;overflow:hidden}
.fc-progress-fill{height:100%;background:linear-gradient(90deg,#06b6d4,#22c55e);border-radius:2px;transition:width .4s ease}
.fc-step-counter{font-size:11px;color:#3b5278;white-space:nowrap;font-weight:700;min-width:90px;text-align:right}
.fc-ctrl-bar{display:flex;align-items:center;justify-content:center;gap:10px;flex-wrap:wrap;padding:12px 16px;background:#0d1526;border-radius:10px;border:1px solid #1a2640;margin-bottom:14px}
.fc-cb{background:#0d1829;border:1px solid #1e3050;color:#94a3b8;width:44px;height:44px;border-radius:10px;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .2s;position:relative}
.fc-cb::after{content:attr(data-label);position:absolute;bottom:-20px;left:50%;transform:translateX(-50%);font-size:9px;color:#3b5278;white-space:nowrap;font-family:'IBM Plex Mono',monospace;letter-spacing:.5px;pointer-events:none}
.fc-cb:hover{background:#0f1f3a;border-color:#3b82f6;color:#7cb9ff;transform:translateY(-1px)}
.fc-cb.play-active{background:linear-gradient(135deg,#0a2515,#0d2a1a);border-color:#22c55e;color:#22c55e;box-shadow:0 0 14px rgba(34,197,94,.3)}
.fc-cb.fc-play-btn{width:52px;height:52px;font-size:20px;border-radius:50%;border-color:#06b6d4;color:#06b6d4;box-shadow:0 0 14px rgba(6,182,212,.2)}
.fc-cb.fc-play-btn:hover{box-shadow:0 0 20px rgba(6,182,212,.4);transform:translateY(-2px) scale(1.05)}
.fc-cb.fc-play-btn.play-active{border-color:#22c55e;color:#22c55e;box-shadow:0 0 20px rgba(34,197,94,.4)}
.fc-ctrl-divider{width:1px;height:32px;background:#1a2640;margin:0 4px}
.fc-spd{display:flex;align-items:center;gap:8px}
.fc-spd-lbl{font-size:10px;color:#3b5278;text-transform:uppercase;letter-spacing:.8px;font-weight:700}
.fc-spd input[type=range]{width:90px;height:4px;appearance:none;background:#1a2640;border-radius:2px;cursor:pointer;outline:none}
.fc-spd input[type=range]::-webkit-slider-thumb{appearance:none;width:14px;height:14px;border-radius:50%;background:#06b6d4;cursor:pointer;box-shadow:0 0 8px rgba(6,182,212,.5);transition:transform .15s}
.fc-spd input[type=range]::-webkit-slider-thumb:hover{transform:scale(1.2)}
.fc-spd-val{font-size:11px;color:#22d3ee;font-weight:700;min-width:28px;text-align:center}
.fc-info-strip{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:12px}
@media(max-width:900px){.fc-info-strip{grid-template-columns:1fr}}
.fc-panel{background:#0d1526;border-radius:10px;padding:16px;border:1px solid #1a2640}
.fc-panel-title{font-size:9.5px;color:#2c4470;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;font-weight:700;display:flex;align-items:center;gap:6px}
.fc-panel-title::before{content:'';display:inline-block;width:3px;height:12px;background:var(--fc-ac,#06b6d4);border-radius:2px}
.fc-step-title{font-size:13px;font-weight:700;color:#60b8ff;margin-bottom:10px;line-height:1.4}
.fc-step-desc{font-size:11px;color:#8aa3c5;line-height:1.8;margin-bottom:10px;font-family:'DM Sans',sans-serif}
.fc-step-cli{font-size:10px;color:#4ade80;background:#050c1a;padding:10px 12px;border-radius:7px;margin-bottom:8px;white-space:pre-wrap;border-left:3px solid #22c55e;line-height:1.7;box-shadow:inset 0 1px 8px rgba(0,0,0,.3)}
.fc-step-rfc{font-size:10px;color:#2c4470;font-style:italic}
.fc-rule-box{margin-top:10px;padding:10px 12px;border-radius:7px;background:#0a1e38;border-left:3px solid #06b6d4;font-size:11px;color:#22d3ee88;line-height:1.7;display:none}
.fc-log-box{max-height:180px;overflow-y:auto;display:flex;flex-direction:column;gap:4px;scrollbar-width:thin;scrollbar-color:#1a2640 transparent}
.fc-log-box::-webkit-scrollbar{width:4px}
.fc-log-box::-webkit-scrollbar-thumb{background:#1a2640;border-radius:2px}
.fc-log-item{font-size:10px;padding:5px 10px;border-radius:6px;background:#060d1a;border-left:3px solid #1a2640;color:#3b5278;line-height:1.4;cursor:pointer;transition:all .25s}
.fc-log-item.cur{border-left-color:#06b6d4;color:#a5f3fc;background:#0a1e38;box-shadow:0 0 10px rgba(6,182,212,.12)}
.fc-timer-table{width:100%;border-collapse:collapse;font-size:10.5px}
.fc-timer-table th{background:#060d1a;color:#2c4470;padding:6px 10px;text-align:left;font-weight:700;border-bottom:1px solid #1a2640;text-transform:uppercase;letter-spacing:.5px;font-size:9.5px}
.fc-timer-table td{padding:5px 10px;border-bottom:1px solid #080e1c;color:#8aa3c5}
.fc-timer-table td:first-child{color:#7db8ff;font-weight:600;white-space:nowrap}
.fc-timer-table td:nth-child(2){color:#86efac}
.fc-pkt-section{background:#0d1526;border-radius:10px;padding:16px;border:1px solid #1a2640;margin-bottom:4px}
.fc-pkt-hdr{display:flex;align-items:center;gap:12px;margin-bottom:12px}
.fc-pkt-badge{padding:4px 14px;border-radius:5px;font-size:11px;font-weight:700;letter-spacing:.5px}
.fc-no-pkt{color:#2c4470;font-size:11px;padding:14px;text-align:center;font-style:italic}
</style>

<div class="fc-wrap">
  <div class="fc-topbar">
    <span class="fc-title">⚡ OSPF Virtual Link + BFD Fast Convergence</span>
  </div>

  <div class="fc-tab-row">
    <button class="fc-tab active" id="fcTabVlink" onclick="fcSetTab('vlink')">🔗 Virtual Link</button>
    <button class="fc-tab"        id="fcTabBfd"   onclick="fcSetTab('bfd')">⚡ BFD + Fast Convergence</button>
  </div>

  <div class="fc-scen-row" id="fcScenRow"></div>

  <div class="fc-canvas-box">
    <canvas id="fcCanvas" width="900" height="420"></canvas>
  </div>

  <div class="fc-progress-wrap">
    <div class="fc-progress-track">
      <div class="fc-progress-fill" id="fcProgressFill" style="width:0%"></div>
    </div>
    <span class="fc-step-counter" id="fcSNum">Step 1 / 1</span>
  </div>

  <div class="fc-ctrl-bar">
    <button class="fc-cb" id="fcReset" data-label="RESET" onclick="fcReset()">⏮</button>
    <button class="fc-cb" id="fcPrev"  data-label="PREV"  onclick="fcGo(-1)">◀</button>
    <button class="fc-cb fc-play-btn" id="fcPlay" data-label="PLAY" onclick="fcTogglePlay()">▶</button>
    <button class="fc-cb" id="fcNext"  data-label="NEXT"  onclick="fcGo(1)">▶|</button>
    <div class="fc-ctrl-divider"></div>
    <div class="fc-spd">
      <span class="fc-spd-lbl">Speed</span>
      <span style="font-size:9px;color:#2c4470">Slow</span>
      <input type="range" id="fcSpd" min="0.3" max="4" step="0.1" value="1" oninput="fcSetSpeed(this.value)">
      <span style="font-size:9px;color:#2c4470">Fast</span>
      <span class="fc-spd-val" id="fcSpdLbl">1×</span>
    </div>
  </div>

  <div class="fc-info-strip">
    <div class="fc-panel" style="--fc-ac:#06b6d4">
      <div class="fc-panel-title">Step Detail</div>
      <div class="fc-step-title" id="fcStepTitle">Select a scenario and press ▶</div>
      <div class="fc-step-desc"  id="fcStepDesc">Choose a Virtual Link or BFD scenario.</div>
      <div class="fc-step-cli"   id="fcStepCli" style="display:none"></div>
      <div class="fc-step-rfc"   id="fcStepRfc"></div>
      <div class="fc-rule-box"   id="fcRuleBox"></div>
    </div>

    <div class="fc-panel" style="--fc-ac:#22c55e">
      <div class="fc-panel-title">Timers &amp; Parameters</div>
      <div id="fcTimerTable"><div class="fc-no-pkt">No timer data at this step</div></div>
    </div>

    <div class="fc-panel" style="--fc-ac:#8b5cf6">
      <div class="fc-panel-title">Event Log</div>
      <div class="fc-log-box" id="fcLog"></div>
    </div>
  </div>

  <div class="fc-pkt-section">
    <div class="fc-pkt-hdr">
      <span class="fc-pkt-badge" id="fcPktBadge" style="background:#0d1526;color:#2c4470">— No Packet</span>
      <span style="font-size:11px;color:#2c4470;font-weight:700;text-transform:uppercase;letter-spacing:.8px">🔬 Packet / Frame Dissection</span>
    </div>
    <div id="fcPktBody"><div class="fc-no-pkt">No packet at this step</div></div>
  </div>
</div>`;
}

/* ═══════════════════════════════════════════════════════
   TAB + SCENARIO LOADING
   ═══════════════════════════════════════════════════════ */
function fcSetTab(tab) {
  fcTab = tab;
  document.getElementById('fcTabVlink').classList.toggle('active', tab==='vlink');
  document.getElementById('fcTabBfd').classList.toggle('active', tab==='bfd');
  const scenarios = FC_TAB_META[tab] || [];
  fcLoadScenario(scenarios[0]?.key || '');
}

function fcLoadScenario(key) {
  fcScenario = key;
  const tab = FC_TAB_META[fcTab] || [];
  const row = document.getElementById('fcScenRow');
  const acColor = fcTab==='vlink' ? '#06b6d4' : '#22c55e';
  row.innerHTML = tab.map(s =>
    `<button class="fc-btn${s.key===key?' active':''}"
      style="${s.key===key?`border-color:${acColor}88;color:${acColor};background:${acColor}11`:''}"
      onclick="fcLoadScenario('${s.key}')">${s.label}</button>`
  ).join('');
  fcSteps = FC_STEP_DATA[key] || [];
  fcReset();
}

/* ═══════════════════════════════════════════════════════
   RESIZE + DRAW
   ═══════════════════════════════════════════════════════ */
function fcResize() {
  if (!fcCanvas) return;
  const w = fcCanvas.parentElement.clientWidth || 800;
  const h = Math.round(w * (fcTab==='bfd' ? 0.56 : 0.50));
  fcCanvas.width=w; fcCanvas.height=h;
  fcCanvas.style.width=w+'px'; fcCanvas.style.height=h+'px';
  fcDraw();
}

function fcDraw() {
  if (!fcCtx) return;
  const W=fcCanvas.width, H=fcCanvas.height, ctx=fcCtx;
  ctx.clearRect(0,0,W,H);
  const bg=ctx.createLinearGradient(0,0,W,H);
  bg.addColorStop(0,'#040810'); bg.addColorStop(1,'#060d1a');
  ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);
  ctx.fillStyle='rgba(30,48,80,0.28)';
  for(let x=20;x<W;x+=36)for(let y=20;y<H;y+=36){ctx.beginPath();ctx.arc(x,y,1,0,Math.PI*2);ctx.fill();}

  const step=fcSteps[fcCurrentStep]||{};

  if(fcTab==='bfd') {
    fcDrawBFDScene(ctx, W, H, step);
  } else {
    fcDrawVLinkScene(ctx, W, H, step);
  }
}

/* ─────────────────────────────────────────────────────
   VIRTUAL LINK DRAWING
───────────────────────────────────────────────────── */
function fcDrawVLinkScene(ctx, W, H, step) {
  const pos = fcVLinkCalcPos(W, H);
  // Area zones
  fcDrawAreaZone(ctx, 0, 0, Math.round(W*0.22), H, '#22c55e', 'Area 2\n(Non-BB)');
  fcDrawAreaZone(ctx, Math.round(W*0.22), 0, Math.round(W*0.34), H, '#8b5cf6', 'Area 1\n(Transit)');
  fcDrawAreaZone(ctx, Math.round(W*0.56), 0, Math.round(W*0.44), H, '#3b82f6', 'Area 0\n(Backbone)');

  // Virtual link tunnel (dashed overlay between R2 and R3 through Area 1)
  if (step.showVirtualLink) {
    fcDrawVirtualLinkTunnel(ctx, pos, step);
  }

  // Links
  const vlLinks = [
    {a:'R1',b:'R2',area:'2'},{a:'R2',b:'R3',area:'1'},{a:'R3',b:'R4',area:'0'},{a:'R3',b:'R5',area:'0'},{a:'R4',b:'R5',area:'0'}
  ];
  vlLinks.forEach(lk=>{
    const a=pos[lk.a], b=pos[lk.b]; if(!a||!b) return;
    const flooded=step.floodedLinks&&step.floodedLinks.some(fl=>(fl.a===lk.a&&fl.b===lk.b)||(fl.a===lk.b&&fl.b===lk.a));
    const failed=step.failedLinks&&step.failedLinks.some(fl=>(fl.a===lk.a&&fl.b===lk.b)||(fl.a===lk.b&&fl.b===lk.a));
    const lc=flooded?'#06b6d4':failed?'#ef4444':'#1a2640';
    if(flooded){ctx.shadowColor=lc;ctx.shadowBlur=8;}
    ctx.strokeStyle=lc; ctx.lineWidth=flooded?2.5:1.5;
    if(failed){ctx.setLineDash([4,4]);}else ctx.setLineDash(flooded?[]:[5,4]);
    ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
    ctx.setLineDash([]); ctx.shadowBlur=0;
    if(failed){
      const mx=(a.x+b.x)/2, my=(a.y+b.y)/2;
      ctx.fillStyle='#ef4444'; ctx.font='bold 14px IBM Plex Mono'; ctx.textAlign='center';
      ctx.fillText('✕',mx,my+5);
    }
  });

  // Flood packet + trails
  fcDrawTrails(ctx, pos); if(fcFloodPkt.on) fcDrawFloodPkt(ctx,pos);
  fcPulseRings.forEach(r=>{if(pos[r.rid])fcDrawPulseRing(ctx,pos[r.rid],r.t,fcFloodPkt.color||'#06b6d4');});

  // Routers
  const vlRtrs=[
    {id:'R1',rid:'1.1.1.1',role:'IR',   area:'2'},
    {id:'R2',rid:'2.2.2.2',role:'ABR',  area:'1+2'},
    {id:'R3',rid:'3.3.3.3',role:'ABR',  area:'0+1'},
    {id:'R4',rid:'4.4.4.4',role:'IR',   area:'0'},
    {id:'R5',rid:'5.5.5.5',role:'IR',   area:'0'},
  ];
  vlRtrs.forEach(r=>fcDrawRouter(ctx,pos[r.id],r,step,'vlink'));
}

function fcVLinkCalcPos(W, H) {
  const midY=Math.round(H*0.45), lowY=Math.round(H*0.75);
  return {
    R1:{x:Math.round(W*0.10),y:midY},
    R2:{x:Math.round(W*0.30),y:midY},
    R3:{x:Math.round(W*0.65),y:midY},
    R4:{x:Math.round(W*0.82),y:midY-40},
    R5:{x:Math.round(W*0.82),y:midY+40},
  };
}

function fcDrawVirtualLinkTunnel(ctx, pos, step) {
  const r2=pos['R2'], r3=pos['R3']; if(!r2||!r3) return;
  const vProg = step.vlinkProgress || 1;
  const vColor = step.vlinkFail ? '#ef4444' : '#06b6d4';
  const x1=r2.x, y1=r2.y-42, x2=r3.x, y2=r3.y-42;
  const ex=x1+(x2-x1)*vProg, ey=y1+(y2-y1)*vProg;

  // Glow
  ctx.shadowColor=vColor; ctx.shadowBlur=step.vlinkActive?20:8;
  // Dashed tunnel line
  ctx.strokeStyle=vColor+(step.vlinkActive?'cc':'55');
  ctx.lineWidth=step.vlinkActive?2.5:1.5;
  ctx.setLineDash([8,5]);
  ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(ex,ey); ctx.stroke();
  ctx.setLineDash([]); ctx.shadowBlur=0;

  // VL label
  ctx.fillStyle=vColor+(step.vlinkActive?'cc':'66');
  ctx.font='bold 9px IBM Plex Mono'; ctx.textAlign='center';
  ctx.fillText('virtual-link',(x1+x2)/2,y1-12);
  ctx.font='8px IBM Plex Mono'; ctx.fillStyle=vColor+'88';
  ctx.fillText('R2↔R3 over Area 1 transit',(x1+x2)/2,y1-1);

  // Tunnel endpoint markers
  if(step.vlinkActive) {
    [r2,r3].forEach(p=>{
      ctx.fillStyle=vColor+'44'; ctx.strokeStyle=vColor+'88'; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.arc(p.x,p.y-42,7,0,Math.PI*2); ctx.fill(); ctx.stroke();
      ctx.fillStyle=vColor; ctx.font='bold 8px IBM Plex Mono'; ctx.textAlign='center';
      ctx.fillText('VL',p.x,p.y-38);
    });
  }
}

/* ─────────────────────────────────────────────────────
   BFD / FAST CONVERGENCE DRAWING
───────────────────────────────────────────────────── */
function fcDrawBFDScene(ctx, W, H, step) {
  const pos = fcBFDCalcPos(W, H);

  // If step has a timeline, draw it
  if (step.showTimeline) {
    fcDrawConvergenceTimeline(ctx, W, H, step);
    return;
  }

  // Regular topology for non-timeline steps
  fcDrawAreaZone(ctx, Math.round(W*0.20), 0, Math.round(W*0.60), H, '#3b82f6', 'OSPF Domain');

  const bfdLinks=[{a:'RA',b:'RB'},{a:'RB',b:'RC'}];
  bfdLinks.forEach(lk=>{
    const a=pos[lk.a],b=pos[lk.b]; if(!a||!b) return;
    const failed=step.failedLinks&&step.failedLinks.some(fl=>(fl.a===lk.a&&fl.b===lk.b)||(fl.a===lk.b&&fl.b===lk.a));
    const bfdActive=step.bfdLinks&&step.bfdLinks.some(fl=>(fl.a===lk.a&&fl.b===lk.b)||(fl.a===lk.b&&fl.b===lk.a));
    const lc=failed?'#ef4444':bfdActive?'#22c55e':'#1a2640';
    if(bfdActive||failed){ctx.shadowColor=lc;ctx.shadowBlur=bfdActive?12:0;}
    ctx.strokeStyle=lc; ctx.lineWidth=bfdActive?3:1.5;
    ctx.setLineDash(failed?[4,4]:[]);
    ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke();
    ctx.setLineDash([]); ctx.shadowBlur=0;
    if(failed){
      const mx=(a.x+b.x)/2,my=(a.y+b.y)/2;
      ctx.fillStyle='#ef4444'; ctx.font='bold 16px IBM Plex Mono'; ctx.textAlign='center';
      ctx.fillText('✕',mx,my+5);
    }
    if(bfdActive){
      // BFD heartbeat label
      ctx.fillStyle='#22c55e88'; ctx.font='8px IBM Plex Mono'; ctx.textAlign='center';
      ctx.fillText('BFD ↔ '+((step.bfdInterval||50)+'ms'),(a.x+b.x)/2,(a.y+b.y)/2-14);
    }
  });

  // Flood packet
  fcDrawTrails(ctx, pos); if(fcFloodPkt.on) fcDrawFloodPkt(ctx,pos);
  fcPulseRings.forEach(r=>{if(pos[r.rid])fcDrawPulseRing(ctx,pos[r.rid],r.t,fcFloodPkt.color||'#22c55e');});

  const bfdRtrs=[{id:'RA',rid:'10.10.10.1',role:'OSPF'},{id:'RB',rid:'10.10.10.2',role:'OSPF'},{id:'RC',rid:'10.10.10.3',role:'OSPF'}];
  bfdRtrs.forEach(r=>fcDrawRouter(ctx,pos[r.id],r,step,'bfd'));
}

function fcBFDCalcPos(W, H) {
  const midY=Math.round(H*0.42);
  return {
    RA:{x:Math.round(W*0.22),y:midY},
    RB:{x:Math.round(W*0.50),y:midY},
    RC:{x:Math.round(W*0.78),y:midY},
  };
}

/* ── Convergence Timeline bars ── */
function fcDrawConvergenceTimeline(ctx, W, H, step) {
  const timelines = step.timelines || [];
  const tProg = fcTimelineAnim.on ? easeInOutCubic(fcTimelineAnim.prog) : 1;
  const labelX = Math.round(W*0.18);
  const barX   = Math.round(W*0.22);
  const barW   = Math.round(W*0.70);
  const barH   = 32;
  const rowGap = 52;
  const startY = Math.round(H*0.18);

  // Title
  ctx.fillStyle='#3b5278'; ctx.font='bold 11px IBM Plex Mono'; ctx.textAlign='center';
  ctx.fillText('OSPF Convergence Timeline: Link Failure → Route Restored', W/2, startY-18);

  // X-axis labels (time markers)
  const timeLabels = step.timeAxis || ['0ms','50ms','100ms','200ms','500ms','1s','5s','10s','40s'];
  const axisY = startY + timelines.length * rowGap + 14;
  ctx.fillStyle='#1e3050'; ctx.font='8px IBM Plex Mono'; ctx.textAlign='center';
  const nLabels = timeLabels.length;
  timeLabels.forEach((lbl,i)=>{
    const lx=barX + Math.round((i/(nLabels-1))*barW);
    ctx.beginPath(); ctx.moveTo(lx,startY-4); ctx.lineTo(lx,axisY); ctx.strokeStyle='#1a2640'; ctx.lineWidth=0.5; ctx.stroke();
    ctx.fillText(lbl, lx, axisY+10);
  });

  timelines.forEach((tl, idx) => {
    const rowY = startY + idx * rowGap;
    // Row label
    ctx.fillStyle = tl.color+'cc'; ctx.font='bold 9.5px IBM Plex Mono'; ctx.textAlign='right';
    ctx.fillText(tl.label, labelX-4, rowY+barH/2+4);

    // Background track
    fcRR2(ctx, barX, rowY, barW, barH, 4);
    ctx.fillStyle='#0a1525'; ctx.fill();

    // Segments
    tl.segments.forEach(seg => {
      const sx = barX + Math.round(seg.start * barW);
      const sw = Math.round((seg.end - seg.start) * barW * tProg);
      if(sw <= 0) return;
      fcRR2(ctx, sx, rowY+2, sw, barH-4, 3);
      ctx.fillStyle = seg.color + 'cc'; ctx.fill();
      // Segment label (if wide enough)
      const textW = ctx.measureText(seg.label).width;
      if(sw > textW + 10) {
        ctx.fillStyle='#fff'; ctx.font='bold 8px IBM Plex Mono'; ctx.textAlign='center';
        ctx.fillText(seg.label, sx+sw/2, rowY+barH/2+3);
      }
    });

    // Total time badge
    if(tl.totalMs && tProg > 0.8) {
      const badgeAlpha = (tProg-0.8)*5;
      ctx.globalAlpha=badgeAlpha;
      const bx=barX+barW+8;
      fcRR2(ctx,bx,rowY+2,62,barH-4,4);
      ctx.fillStyle=tl.color+'22'; ctx.fill();
      ctx.strokeStyle=tl.color+'66'; ctx.lineWidth=1; ctx.stroke();
      ctx.fillStyle=tl.color; ctx.font='bold 9px IBM Plex Mono'; ctx.textAlign='center';
      ctx.fillText(tl.totalMs, bx+31, rowY+barH/2+3);
      ctx.globalAlpha=1;
    }
  });

  // Legend
  ctx.fillStyle='#2c4470'; ctx.font='9px IBM Plex Mono'; ctx.textAlign='left';
  const legendY = axisY + 26;
  const items = step.legendItems || [];
  let lx2=barX;
  items.forEach(it=>{
    ctx.fillStyle=it.color+'cc'; ctx.fillRect(lx2,legendY-8,12,10);
    ctx.fillStyle='#475569'; ctx.font='9px IBM Plex Mono';
    ctx.fillText(it.label, lx2+16, legendY);
    lx2 += ctx.measureText(it.label).width + 32;
  });
}

function fcRR2(ctx,x,y,w,h,r) {
  ctx.beginPath();
  ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.arcTo(x+w,y,x+w,y+r,r);
  ctx.lineTo(x+w,y+h-r); ctx.arcTo(x+w,y+h,x+w-r,y+h,r);
  ctx.lineTo(x+r,y+h); ctx.arcTo(x,y+h,x,y+h-r,r);
  ctx.lineTo(x,y+r); ctx.arcTo(x,y,x+r,y,r); ctx.closePath();
}

/* ── Shared helpers ── */
function fcDrawAreaZone(ctx, x, y, w, h, color, label) {
  ctx.fillStyle=color+'0d'; ctx.strokeStyle=color+'2e';
  ctx.lineWidth=1.5; ctx.setLineDash([6,4]);
  ctx.beginPath(); ctx.rect(x+2,y+2,w-4,h-4); ctx.fill(); ctx.stroke(); ctx.setLineDash([]);
  ctx.fillStyle=color+'66'; ctx.font='bold 10px IBM Plex Mono'; ctx.textAlign='center';
  label.split('\n').forEach((l,i)=>ctx.fillText(l,x+w/2,18+i*13));
}

function fcDrawRouter(ctx, p, rtr, step, mode) {
  if(!p) return;
  const RW=110, RH=34, rx=p.x-RW/2, ry=p.y-RH/2;
  const highlight=step.highlightedRouters&&step.highlightedRouters.includes(rtr.id);
  const acColor=mode==='bfd'?'#22c55e':'#06b6d4';
  const roleColor={ABR:'#f59e0b',ASBR:'#8b5cf6',IR:'#3b82f6',OSPF:'#3b82f6'}[rtr.role]||'#3b82f6';
  const borderColor=highlight?acColor:'#1e3050';
  if(highlight){ctx.shadowColor=acColor;ctx.shadowBlur=20;}
  const bg=ctx.createLinearGradient(rx,ry,rx,ry+RH);
  bg.addColorStop(0,'#0d1f3a'); bg.addColorStop(1,'#080f1e');
  ctx.fillStyle=bg; ctx.strokeStyle=borderColor; ctx.lineWidth=highlight?2.5:1.5;
  fcRR2(ctx,rx,ry,RW,RH,9); ctx.fill(); ctx.stroke(); ctx.shadowBlur=0;
  const sg=ctx.createLinearGradient(rx,ry,rx+RW,ry);
  sg.addColorStop(0,borderColor+'00'); sg.addColorStop(0.5,borderColor+'55'); sg.addColorStop(1,borderColor+'00');
  ctx.fillStyle=sg; ctx.beginPath(); ctx.roundRect(rx,ry,RW,3,[9,9,0,0]); ctx.fill();
  ctx.fillStyle='#ddeeff'; ctx.font='bold 12px IBM Plex Mono'; ctx.textAlign='center';
  ctx.fillText(rtr.id,p.x,p.y-4);
  ctx.fillStyle='#4a6a90'; ctx.font='9px IBM Plex Mono';
  ctx.fillText(rtr.rid,p.x,p.y+9);
  ctx.fillStyle=roleColor+'99'; ctx.font='bold 9px IBM Plex Mono';
  ctx.fillText('['+rtr.role+']',p.x,ry-7);
  // Status badge
  const statusText=step.routerStatus&&step.routerStatus[rtr.id]?step.routerStatus[rtr.id]:'—';
  const statusColor=highlight?acColor:'#2c4470';
  const ibw=RW,ibh=18,ibx=rx,iby=ry+RH+5;
  ctx.fillStyle=statusColor+'20'; ctx.strokeStyle=statusColor+'55'; ctx.lineWidth=1;
  fcRR2(ctx,ibx,iby,ibw,ibh,4); ctx.fill(); ctx.stroke();
  ctx.fillStyle=statusColor; ctx.font='bold 8px IBM Plex Mono'; ctx.textAlign='center';
  ctx.fillText(statusText,p.x,iby+12);
}

function fcDrawTrails(ctx, pos) {
  if(!fcFloodPkt.from||!fcFloodPkt.to) return;
  const fp=pos[fcFloodPkt.from],tp=pos[fcFloodPkt.to]; if(!fp||!tp) return;
  fcTrails.forEach(t=>{
    const bx=fp.x+(tp.x-fp.x)*t.prog,by=fp.y+(tp.y-fp.y)*t.prog;
    ctx.globalAlpha=t.alpha*0.35; ctx.beginPath(); ctx.arc(bx,by,5,0,Math.PI*2);
    ctx.fillStyle=fcFloodPkt.color||'#06b6d4'; ctx.fill(); ctx.globalAlpha=1;
  });
}

function fcDrawFloodPkt(ctx, pos) {
  const fp=pos[fcFloodPkt.from],tp=pos[fcFloodPkt.to]; if(!fp||!tp) return;
  const t=fcFloodPkt.prog,bx=fp.x+(tp.x-fp.x)*t,by=fp.y+(tp.y-fp.y)*t;
  const c=fcFloodPkt.color||'#06b6d4',label=fcFloodPkt.type;
  const grd=ctx.createRadialGradient(bx,by,0,bx,by,32);
  grd.addColorStop(0,c+'55'); grd.addColorStop(0.6,c+'18'); grd.addColorStop(1,'transparent');
  ctx.fillStyle=grd; ctx.beginPath(); ctx.arc(bx,by,32,0,Math.PI*2); ctx.fill();
  const inner=ctx.createRadialGradient(bx-5,by-5,0,bx,by,16);
  inner.addColorStop(0,c+'ff'); inner.addColorStop(1,c+'aa');
  ctx.fillStyle=inner; ctx.strokeStyle='#fff4'; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.arc(bx,by,16,0,Math.PI*2); ctx.fill(); ctx.stroke();
  ctx.fillStyle='#fff'; ctx.font='bold 7.5px IBM Plex Mono'; ctx.textAlign='center';
  ctx.fillText(label,bx,by+3);
}

function fcDrawPulseRing(ctx, p, t, color) {
  const r=60*easeOutQuad(t);
  ctx.beginPath(); ctx.arc(p.x,p.y,r,0,Math.PI*2);
  ctx.strokeStyle=color; ctx.globalAlpha=(1-t)*0.7; ctx.lineWidth=2; ctx.stroke(); ctx.globalAlpha=1;
}

/* ═══════════════════════════════════════════════════════
   PLAYBACK
   ═══════════════════════════════════════════════════════ */
function fcReset() {
  clearTimeout(fcTimer); fcPlaying=false;
  cancelAnimationFrame(fcAnimId); cancelAnimationFrame(fcTimelineAnimId);
  fcFloodPkt.on=false; fcTrails=[]; fcPulseRings=[];
  fcTimelineAnim={on:false,prog:0};
  fcCurrentStep=0;
  const btn=document.getElementById('fcPlay');
  if(btn){btn.textContent='▶';btn.setAttribute('data-label','PLAY');btn.classList.remove('play-active');}
  fcUpdatePanel(); fcDraw();
}

function fcTogglePlay() {
  fcPlaying=!fcPlaying;
  const btn=document.getElementById('fcPlay');
  if(fcPlaying){btn.textContent='⏸';btn.setAttribute('data-label','PAUSE');btn.classList.add('play-active');fcAutoStep();}
  else{btn.textContent='▶';btn.setAttribute('data-label','PLAY');btn.classList.remove('play-active');clearTimeout(fcTimer);}
}

function fcAutoStep() {
  if(!fcPlaying)return;
  if(fcCurrentStep<fcSteps.length-1){fcGo(1);fcTimer=setTimeout(fcAutoStep,fcSpeedMs);}
  else{fcPlaying=false;const btn=document.getElementById('fcPlay');if(btn){btn.textContent='▶';btn.setAttribute('data-label','PLAY');btn.classList.remove('play-active');}}
}

function fcGo(dir) {
  if(fcPlaying&&dir===-1) fcTogglePlay();
  const n=fcCurrentStep+dir;
  if(n<0||n>=fcSteps.length)return;
  fcCurrentStep=n; fcTrails=[];
  const s=fcSteps[fcCurrentStep];
  cancelAnimationFrame(fcTimelineAnimId);
  if(s.showTimeline) {
    fcTimelineAnim={on:true,prog:0}; fcTimelineStart=null;
    const tlTick=(ts)=>{
      if(!fcTimelineStart) fcTimelineStart=ts;
      fcTimelineAnim.prog=Math.min((ts-fcTimelineStart)/1800,1);
      fcDraw();
      if(fcTimelineAnim.prog<1) fcTimelineAnimId=requestAnimationFrame(tlTick);
      else{fcTimelineAnim.on=false;}
    };
    fcTimelineAnimId=requestAnimationFrame(tlTick);
  } else {fcTimelineAnim={on:false,prog:0};}

  if(s.flood&&s.flood.from&&s.flood.to){
    fcFloodPkt={on:true,prog:0,from:s.flood.from,to:s.flood.to,type:s.flood.type,color:FC_COLORS[s.flood.type]||'#06b6d4'};
    fcAnimatePkt();
  } else {fcFloodPkt.on=false;cancelAnimationFrame(fcAnimId);fcUpdatePanel();fcDraw();}
}

function fcAnimatePkt() {
  fcFloodPkt.prog=0; fcAnimStart=null;
  const tick=ts=>{
    if(!fcAnimStart) fcAnimStart=ts;
    const raw=Math.min((ts-fcAnimStart)/fcAnimDur,1);
    fcFloodPkt.prog=easeInOutCubic(raw);
    fcTrails.push({prog:fcFloodPkt.prog,alpha:1});
    fcTrails=fcTrails.map(t=>({...t,alpha:t.alpha-0.05})).filter(t=>t.alpha>0);
    fcDraw();
    if(raw<1){fcAnimId=requestAnimationFrame(tick);}
    else{
      fcFloodPkt.prog=1;fcTrails=[];
      if(fcFloodPkt.to){fcPulseRings=[{rid:fcFloodPkt.to,t:0}];fcAnimPulse();}
      fcFloodPkt.on=false; fcDraw(); fcUpdatePanel();
    }
  };
  fcAnimId=requestAnimationFrame(tick);
}

function fcAnimPulse() {
  fcPulseRings=fcPulseRings.map(r=>({...r,t:r.t+0.06})).filter(r=>r.t<1);
  fcDraw(); if(fcPulseRings.length>0) requestAnimationFrame(fcAnimPulse);
}

function fcSetSpeed(v) {
  document.getElementById('fcSpdLbl').textContent=parseFloat(v).toFixed(1)+'×';
  fcSpeedMs=Math.round(4500/parseFloat(v)); fcAnimDur=Math.max(400,Math.round(1200/parseFloat(v)));
}

/* ═══════════════════════════════════════════════════════
   PANEL UPDATE
   ═══════════════════════════════════════════════════════ */
function fcUpdatePanel() {
  const s=fcSteps[fcCurrentStep]; if(!s) return;
  const pct=fcSteps.length>1?Math.round((fcCurrentStep/(fcSteps.length-1))*100):0;
  const fill=document.getElementById('fcProgressFill'); if(fill) fill.style.width=pct+'%';
  document.getElementById('fcStepTitle').textContent=s.title||'—';
  document.getElementById('fcStepDesc').innerHTML=s.desc||'—';
  document.getElementById('fcSNum').textContent=`Step ${fcCurrentStep+1} / ${fcSteps.length}`;
  const cliEl=document.getElementById('fcStepCli');
  if(s.cli){cliEl.style.display='block';cliEl.textContent=s.cli;}else cliEl.style.display='none';
  document.getElementById('fcStepRfc').textContent=s.rfc||'';
  const ruleEl=document.getElementById('fcRuleBox');
  if(s.rule){ruleEl.style.display='block';ruleEl.innerHTML=s.rule;}else ruleEl.style.display='none';

  // Timer table
  const ttEl=document.getElementById('fcTimerTable');
  if(s.timerRows&&s.timerRows.length){
    ttEl.innerHTML=`<table class="fc-timer-table">
      <thead><tr><th>Parameter</th><th>Value</th><th>Notes</th></tr></thead>
      <tbody>${s.timerRows.map(r=>`<tr><td>${r.name}</td><td>${r.value}</td><td style="color:#8aa3c5;font-size:10px">${r.note}</td></tr>`).join('')}</tbody>
    </table>`;
  } else { ttEl.innerHTML='<div class="fc-no-pkt">No timer data at this step</div>'; }

  // Log
  const logEl=document.getElementById('fcLog');
  logEl.innerHTML=fcSteps.map((st,i)=>{
    const cls=i===fcCurrentStep?'fc-log-item cur':'fc-log-item';
    return `<div class="${cls}">${i+1}. ${st.log||st.title}</div>`;
  }).join('');
  const curEl=logEl.querySelector('.cur');
  if(curEl){const top=curEl.offsetTop-logEl.offsetTop-(logEl.clientHeight/2)+(curEl.clientHeight/2);logEl.scrollTo({top:Math.max(0,top),behavior:'smooth'});}

  // Wireshark
  const badge=document.getElementById('fcPktBadge'),body=document.getElementById('fcPktBody');
  const ac=fcTab==='bfd'?'#22c55e':'#06b6d4';
  if(!s.pktFields){
    badge.textContent='— No Packet';badge.style.background='#0d1526';badge.style.color='#2c4470';badge.style.border='1px solid #1a2640';
    body.innerHTML='<div class="fc-no-pkt">No packet at this step</div>'; return;
  }
  badge.textContent=s.pktBadge||'Packet';
  badge.style.background=ac+'1a'; badge.style.color=ac; badge.style.border=`1px solid ${ac}44`;
  body.innerHTML=`<table class="fc-timer-table">
    <thead><tr><th>Field</th><th>Value</th><th>Notes</th></tr></thead>
    <tbody>${s.pktFields.map(f=>`<tr><td>${f.f}</td><td>${f.v}</td><td style="color:#8aa3c5;font-size:10px">${f.n}</td></tr>`).join('')}</tbody>
  </table>`;
}

/* ═══════════════════════════════════════════════════════════════════════════
   STEP DATA — PHASE 9 : ALL SCENARIOS  (expanded)
   ═══════════════════════════════════════════════════════════════════════════ */
const FC_STEP_DATA = {

/* ══════════════════════════════════════
   VIRTUAL LINK — WHY NEEDED
══════════════════════════════════════ */
vlink_need: [
  {
    title:'Virtual Link — Why Is It Needed?',
    log:'Problem: Area 2 not connected to Backbone (Area 0)',
    desc:'<b>OSPF Fundamental Rule:</b> Every non-backbone area MUST have a direct physical (or virtual) connection to Area 0. This is called the <b>backbone connectivity requirement</b>.<br><br><b>This topology:</b><br>• Area 2 (R1, R2) has no direct link to Area 0<br>• Area 2 only connects to Area 1<br>• Area 1 connects to Area 0<br><br>This creates a <b>discontiguous backbone</b> or <b>partitioned area</b> problem. OSPF cannot route between Area 2 and the rest of the domain without a fix.',
    rfc:'RFC 2328 §C.3 — Areas must connect to backbone; virtual links fix non-contiguous areas',
    highlightedRouters:['R1','R2'],
    floodedLinks:[],blockedLinks:[],showVirtualLink:false,failedLinks:[],
    routerStatus:{R1:'Area 2 IR',R2:'ABR · isolated',R3:'ABR',R4:'Area 0',R5:'Area 0'},
    timerRows:[
      {name:'OSPF Rule',value:'Area → Area 0',note:'All areas must be directly adjacent to backbone'},
      {name:'Area 2 state',value:'ISOLATED',note:'No direct link to Area 0 = routes not propagated'},
      {name:'Fix',value:'Virtual Link',note:'Tunnel through transit area (Area 1)'},
    ],
    flood:null,pktFields:null,
  },
  {
    title:'Step 2 — OSPF Area Hierarchy and the Backbone Rule',
    log:'OSPF design: all inter-area traffic must transit Area 0',
    desc:'OSPF uses a <b>two-level hierarchy</b>: the backbone (Area 0) sits at the center, and all other areas connect to it like spokes on a wheel.<br><br><b>Why this matters:</b><br>• All inter-area routing traffic flows THROUGH Area 0<br>• ABRs filter LSAs at area boundaries — Type 3 LSAs only flow from an area into Area 0 and then back out<br>• An area not connected to Area 0 cannot exchange routes with any other area<br><br>This rule exists to prevent routing loops in a hierarchical design. The backbone acts as a hub guaranteeing loop-free inter-area routing.',
    rfc:'RFC 2328 §2.2 — OSPF two-level hierarchy; backbone is the top level',
    highlightedRouters:['R3','R4'],
    floodedLinks:[{a:'R3',b:'R4'},{a:'R3',b:'R5'}],blockedLinks:[],showVirtualLink:false,failedLinks:[],
    routerStatus:{R1:'Area 2 · isolated',R2:'ABR · no backbone',R3:'ABR Area 0+1',R4:'Area 0 IR',R5:'Area 0 IR'},
    timerRows:[
      {name:'Area 0 role',value:'Hub / Backbone',note:'All inter-area traffic transits Area 0'},
      {name:'ABR role',value:'LSA filter',note:'Converts intra-area routes to Type 3 for other areas'},
      {name:'No-backbone area',value:'Cannot route',note:'Routes invisible to rest of domain'},
    ],
    flood:null,pktFields:null,
  },
  {
    title:'Step 3 — Without VL: Type 3 LSAs Blocked at R2',
    log:'No VL: Area 2 routes BLOCKED — R2 has no Area 0 attachment',
    desc:'Without a virtual link, R2 (ABR between Area 1 and Area 2) <b>cannot originate Type 3 Summary LSAs</b> for Area 2 into Area 0. The OSPF rule is strict: an ABR can only originate Type 3s for an area if it is also attached to Area 0.<br><br>R2 has:<br>• Area 2 interface: ✔<br>• Area 1 interface: ✔<br>• Area 0 interface: ✗ (missing!)<br><br><b>Result:</b> R4 and R5 in Area 0 have zero routes to Area 2. Packets destined for Area 2 are dropped.',
    cli:'show ip ospf database  ! on R4 (Area 0)\n! Area 0 LSDB:\n!   R3 Router LSA (Area 0)\n!   R4 Router LSA (Area 0)\n!   R5 Router LSA (Area 0)\n!   (NO Type 3 LSAs for Area 2 — R2 cannot originate them)\n\nshow ip route  ! on R5\n!   (No routes to 10.2.0.0/24 or any Area 2 prefix)',
    rfc:'RFC 2328 §12.4.3 — ABR can only originate Type 3s if attached to Area 0',
    highlightedRouters:['R2','R3'],
    floodedLinks:[],blockedLinks:[{a:'R2',b:'R3'}],showVirtualLink:false,failedLinks:[],
    routerStatus:{R1:'Area 2',R2:'ABR · NO backbone',R3:'ABR · no Area 2 T3s',R4:'No Area 2 routes',R5:'No Area 2 routes'},
    timerRows:[
      {name:'R2 Area 0?',value:'NO',note:'R2 only has Area 1+2 interfaces'},
      {name:'R2 T3 origination',value:'BLOCKED',note:'Cannot originate T3 without Area 0 attachment'},
      {name:'Area 2 reachability',value:'NONE',note:'Area 0 has no knowledge of Area 2 prefixes'},
    ],
    flood:null,pktFields:null,
  },
  {
    title:'Step 4 — What the LSDB Looks Like Without VL',
    log:'LSDB inspection: Area 0 has no Type 3 LSAs for Area 2',
    desc:'Examining the LSDB on R4 (Area 0 router) shows the problem clearly. Only Area 0 Router LSAs exist — there are <b>no Type 3 Summary LSAs</b> advertising any Area 2 prefixes.<br><br>Without Type 3 LSAs, the SPF tree on R4 has no knowledge of Area 2 networks. The routing table shows no routes to 10.2.0.0/x subnets.<br><br>Contrast this with what R4 DOES have:<br>• R3\'s Type 3 LSA for Area 1 prefixes (10.1.0.0/24) — because R3 IS attached to Area 0<br>• R4 and R5\'s own Router LSAs for Area 0 links',
    cli:'show ip ospf database  ! on R4\n! Router Link States (Area 0):\n!  R3  3.3.3.3  0x80000005  0x009a22  Area 0 router\n!  R4  4.4.4.4  0x80000003  0x006b31  Area 0 router\n!  R5  5.5.5.5  0x80000004  0x001b45  Area 0 router\n!\n! Summary Net Link States (Area 0):\n!  Link ID: 10.1.0.0  Adv:3.3.3.3  ← Area 1 prefix (OK)\n!  (MISSING: 10.2.0.0/24 and any Area 2 prefix from R2)',
    rfc:'RFC 2328 §13.4 — Summary-LSA not originated without Area 0 adjacency',
    highlightedRouters:['R4','R5'],
    floodedLinks:[],blockedLinks:[],showVirtualLink:false,failedLinks:[],
    routerStatus:{R1:'Area 2',R2:'Type 3 blocked',R3:'ABR: Area 1 T3 ok',R4:'LSDB: no Area 2',R5:'LSDB: no Area 2'},
    timerRows:[
      {name:'Area 0 Router LSAs',value:'R3,R4,R5',note:'Normal — only Area 0 routers present'},
      {name:'Type 3 from R3',value:'Area 1 only',note:'R3 properly advertises Area 1 into Area 0'},
      {name:'Type 3 from R2',value:'NONE',note:'R2 cannot advertise because no Area 0 attachment'},
    ],
    flood:null,pktFields:null,
  },
  {
    title:'Step 5 — Solution: Virtual Link Concept',
    log:'Solution: virtual-link creates logical Area 0 extension through transit area',
    desc:'The <b>Virtual Link (VL)</b> solves this by creating a <b>logical point-to-point link in Area 0</b> that tunnels through Area 1 (the transit area) between the two ABRs: R2 and R3.<br><br>After the VL is configured:<br>• R2 has a virtual Area 0 interface (OSPF_VL0)<br>• R2 is now logically attached to Area 0<br>• R2 can originate Type 3 LSAs for Area 2 into Area 0<br>• The VL uses intra-area SPF routing through Area 1 to carry its Hello/LSA packets<br><br>Think of it as a GRE-like tunnel at the OSPF layer.',
    rfc:'RFC 2328 §C.3 — Virtual link as logical extension of Area 0 through transit area',
    highlightedRouters:['R2','R3'],
    floodedLinks:[{a:'R2',b:'R3'}],blockedLinks:[],showVirtualLink:true,vlinkProgress:0.4,vlinkActive:false,failedLinks:[],
    routerStatus:{R1:'Area 2',R2:'VL: being configured',R3:'VL: being configured',R4:'Area 0',R5:'Area 0'},
    timerRows:[
      {name:'VL type',value:'Point-to-point',note:'Unnumbered P2P link in Area 0'},
      {name:'VL transit',value:'Area 1',note:'Must be standard area — not stub/NSSA'},
      {name:'VL endpoints',value:'R2 ↔ R3',note:'Both ABRs bordering the transit area'},
      {name:'Area 0 attachment',value:'R2 gains Area 0',note:'VL gives R2 logical backbone connection'},
    ],
    flood:null,pktFields:null,
  },
],

/* ══════════════════════════════════════
   VIRTUAL LINK — CONFIGURATION
══════════════════════════════════════ */
vlink_conf: [
  {
    title:'Step 1 — VL Configuration Prerequisites',
    log:'Prerequisites: identify transit area and both ABR router IDs',
    desc:'Before configuring a Virtual Link, you must identify three things:<br><br><b>1. Transit Area:</b> The area that the VL will tunnel through. Must be a <b>standard (non-stub, non-NSSA)</b> area. In this topology, Area 1 is the transit area.<br><br><b>2. Both ABR Router IDs:</b> Each end of the VL is identified by the OSPF Router ID of the remote ABR — not an IP address.<br>• R2 Router ID = 2.2.2.2<br>• R3 Router ID = 3.3.3.3<br><br><b>3. Verify transit area reachability:</b> Both ABRs must have intra-area routes to each other through the transit area before the VL can form.',
    cli:'! Verify router IDs before configuration:\nshow ip ospf  ! on R2\n! Routing Process "ospf 1" with ID 2.2.2.2\n! Area 1 (transit), Area 2 (non-backbone)\n\nshow ip ospf  ! on R3\n! Routing Process "ospf 1" with ID 3.3.3.3\n! Area 0 (backbone), Area 1 (transit)\n\n! Verify intra-area path exists in Area 1:\nshow ip route ospf  ! on R2\n! O  10.1.0.3/32 [110/1] via Gi0/1 — R3 is reachable in Area 1 ✔',
    rfc:'RFC 2328 §C.3 — VL requires both endpoints to have intra-area path in transit area',
    highlightedRouters:['R2','R3'],
    floodedLinks:[{a:'R2',b:'R3'}],blockedLinks:[],showVirtualLink:false,failedLinks:[],
    routerStatus:{R1:'Area 2',R2:'RID: 2.2.2.2',R3:'RID: 3.3.3.3',R4:'Area 0',R5:'Area 0'},
    timerRows:[
      {name:'VL transit area',value:'Area 1',note:'Must be standard (not stub/NSSA)'},
      {name:'R2 Router ID',value:'2.2.2.2',note:'R3 uses this when configuring VL'},
      {name:'R3 Router ID',value:'3.3.3.3',note:'R2 uses this when configuring VL'},
      {name:'Prerequisite',value:'Intra-area path',note:'R2 must reach R3 within Area 1 first'},
    ],
    flood:null,pktFields:null,
  },
  {
    title:'Step 2 — Configure VL on R2 (Area 1+2 ABR)',
    log:'R2: area 1 virtual-link 3.3.3.3',
    desc:'Configure the virtual link on R2 first. The syntax specifies:<br>• The <b>transit area number</b> (Area 1)<br>• The <b>remote ABR\'s Router ID</b> (R3 = 3.3.3.3)<br><br>After this command, R2 will start sending BFD/Hello packets toward R3 using the Area 1 intra-area path. However, the VL won\'t form until R3 is also configured with the matching command.<br><br>Optional: you can set custom Hello/Dead/retransmit intervals on the VL — these are negotiated with the far end.',
    cli:'! On R2:\nrouter ospf 1\n area 1 virtual-link 3.3.3.3\n!\n! Optional: custom timers on the VL:\n area 1 virtual-link 3.3.3.3 hello-interval 10 dead-interval 40\n area 1 virtual-link 3.3.3.3 retransmit-interval 5\n area 1 virtual-link 3.3.3.3 transmit-delay 1\n!\n! Show VL state (one-sided — not UP yet):\nshow ip ospf virtual-links\n! Virtual Link OSPF_VL0 to router 3.3.3.3 is DOWN\n! (R3 not yet configured)',
    rfc:'RFC 2328 §C.3 — VL configured with transit area + remote RID',
    highlightedRouters:['R2'],
    floodedLinks:[],blockedLinks:[],showVirtualLink:true,vlinkProgress:0.3,vlinkActive:false,failedLinks:[],
    routerStatus:{R1:'Area 2',R2:'VL: configuring (R2 side)',R3:'not yet configured',R4:'',R5:''},
    timerRows:[
      {name:'Command',value:'area 1 virtual-link 3.3.3.3',note:'Transit area = 1, remote RID = R3'},
      {name:'VL state',value:'DOWN',note:'Waiting for R3 to be configured'},
      {name:'VL Hello',value:'10s default',note:'Same as backbone — can be customized'},
      {name:'VL Dead',value:'40s default',note:'Must exceed transit area convergence time'},
    ],
    flood:null,pktFields:null,
  },
  {
    title:'Step 3 — Configure VL on R3 (Area 0+1 ABR)',
    log:'R3: area 1 virtual-link 2.2.2.2 — both sides now configured',
    desc:'Now configure the matching VL on R3. The transit area is still Area 1, and the remote Router ID is R2 = 2.2.2.2.<br><br>With both sides configured, OSPF will:<br>1. Compute the intra-area SPF path through Area 1 to find the path from R2 to R3<br>2. Begin sending VL Hello packets along that path<br>3. Start the OSPF adjacency state machine on the VL interface<br><br>The VL Hellos are unicast (not multicast) — sent directly to the intra-area IP address of the remote ABR.',
    cli:'! On R3:\nrouter ospf 1\n area 1 virtual-link 2.2.2.2\n! ↑ transit area  ↑ remote ABR RID (R2)\n\n! Both sides now configured — Hellos will flow:\nshow ip ospf virtual-links\n! Virtual Link OSPF_VL0 to router 2.2.2.2 is UP  ← R3 perspective\n\n! On R2:\nshow ip ospf virtual-links\n! Virtual Link OSPF_VL0 to router 3.3.3.3 is UP  ← R2 perspective',
    rfc:'RFC 2328 §C.3 — VL requires configuration on BOTH ABRs',
    rule:'<b>Transit area cannot be a stub or NSSA area.</b> Virtual links require Type 5 LSA flooding, which is blocked in stub areas. A stub transit area causes the VL to fail to form. Also: VL uses the intra-area path — if the transit area partitions, the VL also fails.',
    highlightedRouters:['R2','R3'],
    floodedLinks:[],blockedLinks:[],showVirtualLink:true,vlinkProgress:0.7,vlinkActive:false,failedLinks:[],
    routerStatus:{R1:'Area 2',R2:'VL: Hello sending',R3:'VL: Hello sending',R4:'',R5:''},
    timerRows:[
      {name:'R3 command',value:'area 1 virtual-link 2.2.2.2',note:'Symmetric to R2 config'},
      {name:'Hello type',value:'Unicast',note:'VL Hellos are unicast — not 224.0.0.5 multicast'},
      {name:'Area ID in Hello',value:'0.0.0.0',note:'VL belongs to Area 0, not transit Area 1'},
      {name:'VL state',value:'Forming…',note:'Adjacency state machine starts'},
    ],
    flood:{from:'R2',to:'R3',type:'Hello'},
    pktBadge:'OSPF Hello · VL Initiation',
    pktFields:[
      {f:'OSPF Area ID',v:'0.0.0.0',n:'VL is part of Area 0 — not transit Area 1'},
      {f:'Destination',v:'10.1.0.3 (R3)',n:'Unicast — found via Area 1 intra-area path'},
      {f:'Hello Interval',v:'10s',n:'Default backbone Hello interval'},
      {f:'Dead Interval',v:'40s',n:'Must be > transit area reconvergence time'},
      {f:'Router Priority',v:'0',n:'VL is P2P — no DR/BDR election'},
    ],
  },
  {
    title:'Step 4 — VL Restrictions: What Cannot Be a Transit Area',
    log:'Restriction: stub, NSSA, or partitioned area cannot be VL transit',
    desc:'Not every area can serve as a transit area for a virtual link. The restrictions are:<br><br><b>❌ Stub Area:</b> Cannot transit a VL — stub areas block Type 5 LSAs which VL needs to propagate backbone LSAs. The VL will fail to form.<br><br><b>❌ NSSA Area:</b> Cannot transit a VL — similar restriction. NSSA converts Type 7→Type 5 at the ABR; VL propagation is incompatible.<br><br><b>❌ Partitioned Transit Area:</b> If Area 1 loses connectivity between R2 and R3, the VL path breaks too.<br><br><b>✔ Standard Area:</b> Only standard (non-stub) areas work as transit.',
    rfc:'RFC 2328 §C.3 — Transit area must be a standard OSPF area',
    highlightedRouters:['R2','R3'],
    floodedLinks:[],blockedLinks:[],showVirtualLink:true,vlinkProgress:0.5,vlinkActive:false,failedLinks:[],
    routerStatus:{R1:'Area 2',R2:'VL: Area 1 transit',R3:'VL: Area 1 transit',R4:'',R5:''},
    timerRows:[
      {name:'Stub transit?',value:'❌ NOT allowed',note:'Type 5 LSAs blocked in stub — VL fails'},
      {name:'NSSA transit?',value:'❌ NOT allowed',note:'NSSA incompatible with VL LSA flooding'},
      {name:'Standard transit?',value:'✔ Required',note:'Area 1 must be standard for VL to work'},
      {name:'If transit partitions',value:'VL goes DOWN',note:'VL inherits transit area path stability'},
    ],
    flood:null,pktFields:null,
  },
  {
    title:'Step 5 — Verifying VL Configuration',
    log:'Verification: show ip ospf virtual-links — check state and parameters',
    desc:'After configuration, verify the virtual link is UP using <code>show ip ospf virtual-links</code>. The output shows:<br><br>• <b>State:</b> Should be UP/POINT_TO_POINT<br>• <b>Transit area:</b> Confirms which area is being used<br>• <b>Adjacency state:</b> Should be FULL<br>• <b>Interface:</b> Auto-created as OSPF_VL0, OSPF_VL1, etc.<br>• <b>Timer values:</b> Negotiated Hello/Dead/Retransmit<br><br>If the VL shows DOWN, check: both sides configured? transit area reachability? router IDs correct?',
    cli:'show ip ospf virtual-links  ! on R2\n! Virtual Link OSPF_VL0 to router 3.3.3.3 is up\n!   Run as demand circuit\n!   DoNotAge LSA allowed\n!   Transit area 1\n!   Transmit Delay is 1 sec, State POINT_TO_POINT\n!   Timer intervals configured: Hello 10, Dead 40, Retransmit 5\n!   Hello due in 00:00:07\n!   Adjacency State FULL\n!   Index 1/1, retransmit queue len 0, number of retransmit 0\n!   First 0x0(0)/0x0(0) Next 0x0(0)/0x0(0)\n!   Last retransmission scan length is 0, maximum is 4\n\nshow ip ospf interface OSPF_VL0\n! Process ID 1, Router ID 2.2.2.2, Network Type POINT_TO_POINT\n! Area 0.0.0.0, via interface GigabitEthernet0/0',
    rfc:'RFC 2328 §C.3 — VL verification',
    highlightedRouters:['R2','R3'],
    floodedLinks:[{a:'R2',b:'R3'}],blockedLinks:[],showVirtualLink:true,vlinkProgress:1,vlinkActive:true,failedLinks:[],
    routerStatus:{R1:'Area 2',R2:'VL: UP ✔ FULL',R3:'VL: UP ✔ FULL',R4:'',R5:''},
    timerRows:[
      {name:'VL state',value:'UP',note:'Both ends configured and intra-area path exists'},
      {name:'Adjacency',value:'FULL',note:'All LSAs exchanged on virtual link'},
      {name:'VL interface',value:'OSPF_VL0',note:'Auto-created virtual interface on R2'},
      {name:'Area on VL',value:'Area 0',note:'VL is logically an Area 0 link'},
    ],
    flood:null,pktFields:null,
  },
],

/* ══════════════════════════════════════
   VIRTUAL LINK — ADJACENCY FORMS
══════════════════════════════════════ */
vlink_adj: [
  {
    title:'Step 1 — VL Hello Packets Traverse the Transit Area',
    log:'VL: R2 sends Hello toward R3 through Area 1',
    desc:'Once VL is configured on both sides, OSPF sends <b>Hello packets across the transit area</b> using the intra-area path between R2 and R3 (through Area 1).<br><br>Key properties of VL Hello packets:<br>• They are <b>unicast</b> — sent to R3\'s Area 1 IP address directly<br>• The OSPF Area ID in the packet header = <b>0.0.0.0</b> (Area 0) — not Area 1<br>• They travel physically through Area 1 links but logically belong to Area 0<br><br>This is how OSPF identifies these Hellos as VL (Area 0) packets — by the area ID field, even though they physically traverse Area 1 links.',
    cli:'debug ip ospf adj\n! OSPF: 2 Way Communication to 3.3.3.3 on OSPF_VL0, state 2WAY\n! OSPF: Nbr 3.3.3.3 is now in ExStart state\n\nshow ip ospf neighbor detail  ! on R2\n! Neighbor 3.3.3.3, interface address 10.1.0.3\n!  In the area 0 via interface OSPF_VL0\n!  Neighbor is up for 00:00:02',
    rfc:'RFC 2328 §C.3 — VL adjacency: Hellos traverse transit area, area ID = 0',
    highlightedRouters:['R2','R3'],
    floodedLinks:[{a:'R2',b:'R3'}],blockedLinks:[],showVirtualLink:true,vlinkProgress:1,vlinkActive:false,failedLinks:[],
    routerStatus:{R1:'',R2:'VL: Hello sent → Init',R3:'VL: Hello rcvd → Init',R4:'',R5:''},
    timerRows:[
      {name:'Hello interval (VL)',value:'10s',note:'Same as backbone Hello default'},
      {name:'Dead interval (VL)',value:'40s',note:'Longer than transit area convergence time'},
      {name:'Area ID in Hello',value:'0.0.0.0',note:'VL belongs to Area 0, not transit area'},
      {name:'Destination',value:'Unicast to R3',note:'Not multicast — VL always unicast'},
    ],
    flood:{from:'R2',to:'R3',type:'Hello'},
    pktBadge:'OSPF Hello · Virtual Link',
    pktFields:[
      {f:'OSPF Area ID',  v:'0.0.0.0',    n:'Area 0 — not Area 1 (transit)'},
      {f:'Source RID',    v:'2.2.2.2 (R2)',n:'R2 Router ID'},
      {f:'Destination',   v:'10.1.0.3',   n:'Unicast to R3\'s Area 1 interface IP'},
      {f:'Hello Interval',v:'10s',        n:'Standard backbone Hello interval'},
      {f:'Neighbor list', v:'(empty)',     n:'First Hello — R2 hasn\'t seen R3 yet'},
    ],
  },
  {
    title:'Step 2 — VL 2-Way State: Bidirectional Hello Confirmed',
    log:'VL: R3 Hello seen in R2\'s neighbor list → 2-Way',
    desc:'R3 replies with its own VL Hello packet (also Area ID = 0.0.0.0, unicast back to R2). When R2 sees its own Router ID listed in R3\'s neighbor list, <b>2-Way state</b> is reached on the VL.<br><br>At 2-Way, both routers have confirmed bidirectional communication. On a normal broadcast network, non-DR/BDR routers would stop here. But the VL is a <b>Point-to-Point link</b> — so the state machine always continues to Full adjacency (no DR/BDR election needed).',
    cli:'debug ip ospf adj\n! OSPF: Rcv Hello from 3.3.3.3, interface OSPF_VL0\n! OSPF: 2 Way Communication to 3.3.3.3 on OSPF_VL0, state 2WAY\n! OSPF: Backup seen Event before any state\n! OSPF: Neighbor change Event, state going from 2WAY to ExStart\n\nshow ip ospf neighbor  ! on R2\n! Neighbor ID   State    Dead Time  Address    Interface\n! 3.3.3.3       2WAY/- (transitioning) OSPF_VL0',
    rfc:'RFC 2328 §10.4 — 2-Way: router sees itself in neighbor\'s Hello',
    highlightedRouters:['R2','R3'],
    floodedLinks:[{a:'R3',b:'R2'}],blockedLinks:[],showVirtualLink:true,vlinkProgress:1,vlinkActive:false,failedLinks:[],
    routerStatus:{R1:'',R2:'VL: 2-Way ↔',R3:'VL: 2-Way ↔',R4:'',R5:''},
    timerRows:[
      {name:'VL state',value:'2-Way',note:'Bidirectional communication confirmed'},
      {name:'VL link type',value:'Point-to-Point',note:'Always proceeds to Full — no DR/BDR election'},
      {name:'Next state',value:'ExStart',note:'Immediately transitions — DR election skipped'},
    ],
    flood:{from:'R3',to:'R2',type:'Hello'},
    pktBadge:'OSPF Hello · 2-Way Confirmed',
    pktFields:[
      {f:'Area ID',v:'0.0.0.0',n:'Confirms this is a VL (Area 0) Hello'},
      {f:'Neighbor list',v:'2.2.2.2',n:'R3 lists R2 — 2-Way confirmed!'},
      {f:'Hello Interval',v:'10s',n:'Matches R2 — parameters compatible'},
    ],
  },
  {
    title:'Step 3 — ExStart: Master/Slave Election for DD Exchange',
    log:'VL: ExStart — R2 and R3 elect master/slave for DBD exchange',
    desc:'After 2-Way, the VL moves to <b>ExStart</b>. Both routers negotiate who will be the <b>Master</b> (controls the Database Description sequence) and who will be the <b>Slave</b>.<br><br>Mechanism:<br>• Each router sends a DBD packet with its own sequence number and the Master (MS) bit set<br>• The router with the <b>higher Router ID becomes Master</b><br>• R3 (3.3.3.3) > R2 (2.2.2.2) → R3 is Master<br>• R2 acknowledges by sending DBD with MS bit clear and R3\'s sequence number<br><br>The Master controls the Exchange — Slave acknowledges each DBD with a matching sequence number.',
    cli:'debug ip ospf adj\n! OSPF: Send DBD to 3.3.3.3 on OSPF_VL0 seq 0x1234 opt 0x52 flag 0x7 len 32\n! (MS=1 = claiming master, Init=1, More=1)\n! OSPF: Rcv DBD from 3.3.3.3 on OSPF_VL0 seq 0x5678 opt 0x52 flag 0x7 len 32\n! OSPF: First DBD and I am not MASTER — 3.3.3.3 is higher RID\n! OSPF: Neighbor 3.3.3.3 state changed to Exchange\n! OSPF: Send DBD to 3.3.3.3 seq 0x5678 flag 0x0 (slave - MS bit clear)',
    rfc:'RFC 2328 §10.6 — ExStart: master/slave negotiation via DBD with I,M,MS bits',
    highlightedRouters:['R2','R3'],
    floodedLinks:[{a:'R2',b:'R3'}],blockedLinks:[],showVirtualLink:true,vlinkProgress:1,vlinkActive:false,failedLinks:[],
    routerStatus:{R1:'',R2:'VL: Slave (RID lower)',R3:'VL: Master (RID higher)',R4:'',R5:''},
    timerRows:[
      {name:'VL state',value:'ExStart',note:'Master/Slave negotiation'},
      {name:'Master',value:'R3 (3.3.3.3)',note:'Higher Router ID wins Master role'},
      {name:'Slave',value:'R2 (2.2.2.2)',note:'Lower Router ID — follows sequence numbers'},
      {name:'DBD bits',value:'I=1 M=1 MS=1',note:'Initial DBD: Init, More, MasterSlave all set'},
    ],
    flood:{from:'R2',to:'R3',type:'DBD'},
    pktBadge:'OSPF DBD · ExStart (Master/Slave)',
    pktFields:[
      {f:'I (Init) bit',v:'1',n:'First DBD in the sequence'},
      {f:'M (More) bit',v:'1',n:'More DBDs will follow'},
      {f:'MS (Master) bit',v:'1',n:'Claiming master role (will be overridden by R3)'},
      {f:'Sequence',v:'0x1234',n:'R2\'s initial sequence number — R3 will override'},
    ],
  },
  {
    title:'Step 4 — Exchange: LSDB Summaries Shared',
    log:'VL: Exchange — R2 and R3 swap LSA headers in DBD packets',
    desc:'In the <b>Exchange</b> state, R3 (Master) sends a series of <b>Database Description (DBD) packets</b> to R2. Each DBD contains a list of LSA headers (Type, Link-State ID, Advertising Router, Sequence Number, Age, Checksum).<br><br>R2 also sends DBD packets to R3 (the Slave is allowed to send DBDs too — it just must acknowledge the Master\'s DBDs).<br><br>After Exchange, each router knows which LSAs the other has. They compare their local LSDB — any LSA the neighbor has that is newer or missing locally goes on the <b>Link State Request List</b>.',
    cli:'debug ip ospf adj\n! OSPF: Send DBD to 3.3.3.3 seq 0x5679 flag 0x0 len 172\n! (contains R2\'s Area 0 LSA headers)\n! OSPF: Rcv DBD from 3.3.3.3 seq 0x5679 flag 0x0 len 244\n! (contains R3\'s LSDB summary — Area 0 Router LSAs, Summary LSAs)\n! OSPF: 3.3.3.3 says it has: R3-RouterLSA, R4-RouterLSA, R5-RouterLSA, ...\n! OSPF: Build Request list: R3-RouterLSA (need fresher copy)',
    rfc:'RFC 2328 §10.6 — Exchange: DBD packets contain LSA headers',
    highlightedRouters:['R2','R3'],
    floodedLinks:[{a:'R3',b:'R2'}],blockedLinks:[],showVirtualLink:true,vlinkProgress:1,vlinkActive:false,failedLinks:[],
    routerStatus:{R1:'',R2:'VL: Exchange rcving DBD',R3:'VL: Exchange sending DBD',R4:'',R5:''},
    timerRows:[
      {name:'VL state',value:'Exchange',note:'Swapping LSDB summaries (LSA headers)'},
      {name:'DBD content',value:'LSA headers only',note:'Headers describe each LSA — not full content'},
      {name:'Request list',value:'Building…',note:'LSAs to request from neighbor after Exchange'},
    ],
    flood:{from:'R3',to:'R2',type:'DBD'},
    pktBadge:'OSPF DBD · Exchange (LSA Headers)',
    pktFields:[
      {f:'DBD type',v:'Summary/Data',n:'Not Init — now exchanging actual LSDB summary'},
      {f:'LSA headers',v:'Multiple',n:'Each entry: Type, LSID, AdvRtr, Seq, Age, Checksum'},
      {f:'M (More) bit',v:'0',n:'Last DBD — no more to send'},
      {f:'Seq number',v:'0x5679',n:'Master\'s sequence — Slave acknowledges with same seq'},
    ],
  },
  {
    title:'Step 5 — Loading: LSAs Requested and Received',
    log:'VL: Loading — R2 requests and receives full LSA content from R3',
    desc:'In the <b>Loading</b> state, R2 sends <b>Link State Request (LSR) packets</b> for each LSA in its Request List — those that are newer at R3 or missing from R2\'s LSDB.<br><br>R3 responds with <b>Link State Update (LSU) packets</b> containing the full LSA content. R2 installs each received LSA in its LSDB and sends a <b>Link State Acknowledgment (LSAck)</b>.<br><br>This process continues until R2\'s Request List is empty. Similarly, R3 may request LSAs from R2 if R2 has newer ones.',
    cli:'debug ip ospf adj\n! OSPF: Send LS REQ to 3.3.3.3 on OSPF_VL0 length 36\n! Requesting: Type 1 LSID 3.3.3.3 AdvRtr 3.3.3.3 (Router LSA)\n! Requesting: Type 3 LSID 10.0.0.0 AdvRtr 3.3.3.3 (Summary LSA)\n!\n! OSPF: Rcv LS UPD from 3.3.3.3 on OSPF_VL0, length 280\n! Installing: Type 1 R3-RouterLSA ... done\n! Installing: Type 3 Summary LSA 10.0.0.0 ... done\n! OSPF: Send LS ACK on OSPF_VL0 to 3.3.3.3',
    rfc:'RFC 2328 §10.7 — Loading state: LSR/LSU/LSAck exchange',
    highlightedRouters:['R2','R3'],
    floodedLinks:[{a:'R2',b:'R3'}],blockedLinks:[],showVirtualLink:true,vlinkProgress:1,vlinkActive:false,failedLinks:[],
    routerStatus:{R1:'',R2:'VL: Loading (requesting LSAs)',R3:'VL: Loading (sending LSAs)',R4:'',R5:''},
    timerRows:[
      {name:'VL state',value:'Loading',note:'Fetching missing/stale LSAs from neighbor'},
      {name:'LSR packet',value:'Request list items',note:'Asks for specific LSAs by Type+LSID+AdvRtr'},
      {name:'LSU response',value:'Full LSA content',note:'R3 sends complete LSA body'},
      {name:'LSAck',value:'Sent by R2',note:'Confirms receipt — prevents retransmission'},
    ],
    flood:{from:'R2',to:'R3',type:'LSR'},
    pktBadge:'OSPF LSR · Loading Phase',
    pktFields:[
      {f:'LS Type',v:'1 (Router)',n:'Requesting R3\'s Router LSA — not in R2\'s LSDB'},
      {f:'Link-State ID',v:'3.3.3.3',n:'R3\'s Router LSA identifier'},
      {f:'Advertising Router',v:'3.3.3.3',n:'R3 originated this LSA'},
    ],
  },
  {
    title:'Step 6 — VL Adjacency Reaches FULL State',
    log:'VL: R2 ↔ R3 → FULL — Area 2 now logically connected to backbone',
    desc:'The VL adjacency reaches <b>FULL state</b> when both routers have identical LSDBs for Area 0 (all LSRs acknowledged, no pending requests).<br><br>With FULL adjacency on the virtual link:<br>• R2 is now logically part of Area 0 (via the VL as a P2P Area 0 interface)<br>• R2 can now originate <b>Type 3 Summary LSAs</b> for Area 2 prefixes into Area 0<br>• R3 will propagate these Type 3s to all Area 0 routers (R4, R5)<br>• Area 2 is now reachable from the entire OSPF domain',
    cli:'show ip ospf virtual-links  ! on R2\n! Virtual Link OSPF_VL0 to router 3.3.3.3 is up\n! Transit area 1, Transmit Delay 1s, State POINT_TO_POINT\n! Adjacency State FULL ✔\n\nshow ip ospf neighbor  ! on R2\n! 3.3.3.3   FULL/  -   00:00:38   10.1.0.3   OSPF_VL0\n\nshow ip ospf database summary  ! on R4\n! 10.2.0.0  Adv:2.2.2.2  ← Area 2 prefix now visible in Area 0!',
    rfc:'RFC 2328 §C.3 — VL in FULL state: Area 2 logically attached to backbone',
    highlightedRouters:['R2','R3'],
    floodedLinks:[{a:'R2',b:'R3'}],blockedLinks:[],showVirtualLink:true,vlinkProgress:1,vlinkActive:true,failedLinks:[],
    routerStatus:{R1:'Area 2 reachable ✔',R2:'VL: FULL ✔',R3:'VL: FULL ✔',R4:'Area 2 routes ✔',R5:'Area 2 routes ✔'},
    timerRows:[
      {name:'VL state',value:'FULL',note:'Complete LSDB synchronization achieved'},
      {name:'VL interface',value:'OSPF_VL0',note:'Logical Area 0 interface on R2'},
      {name:'Area 2 status',value:'Connected ✔',note:'R2 now logically part of Area 0'},
      {name:'Type 3 LSAs',value:'R2 can originate',note:'Area 2 routes now visible in Area 0'},
    ],
    flood:null,pktFields:null,
  },
],

/* ══════════════════════════════════════
   VIRTUAL LINK — LSA PROPAGATION
══════════════════════════════════════ */
vlink_lsa: [
  {
    title:'Step 1 — R2 Becomes a Proper ABR: Type 3 LSA Generation',
    log:'R2 originates Type 3 Summary LSAs for Area 2 into Area 0',
    desc:'With the VL in Full state, R2 is now logically attached to Area 0. OSPF now recognizes R2 as a true ABR (attached to two areas: Area 2 and Area 0 via VL).<br><br>R2 immediately begins originating <b>Type 3 Summary LSAs</b> for each prefix in Area 2. These Type 3 LSAs are sent across the VL to R3 in Area 0.<br><br>Each Type 3 LSA contains:<br>• The Area 2 prefix (Link-State ID)<br>• R2\'s Router ID as the Advertising Router<br>• The metric (Area 2 internal cost + VL cost)',
    cli:'show ip ospf database summary  ! on R3 (Area 0)\n! Summary Net Link States (Area 0):\n!  Link ID: 10.2.0.0    Adv: 2.2.2.2  Age: 3    Seq: 0x80000001  Metric: 2\n!  Link ID: 10.2.1.0    Adv: 2.2.2.2  Age: 3    Seq: 0x80000001  Metric: 3\n!  ← These are NEW — R2 now advertising Area 2 prefixes into Area 0!',
    rfc:'RFC 2328 §12.4.3 — ABR originates Type 3 Summary LSAs',
    highlightedRouters:['R2','R3'],
    floodedLinks:[{a:'R2',b:'R3'}],blockedLinks:[],
    showVirtualLink:true,vlinkProgress:1,vlinkActive:true,failedLinks:[],
    routerStatus:{R1:'Area 2',R2:'ABR · T3 originating',R3:'Rcvg Area 2 T3s',R4:'',R5:''},
    timerRows:[
      {name:'R2 role',value:'ABR ✔',note:'Now attached to Area 0 via VL'},
      {name:'Type 3 LSAs',value:'One per Area 2 prefix',note:'R2 originates T3 for each Area 2 subnet'},
      {name:'Advertising Router',value:'2.2.2.2',note:'R2\'s RID in all T3 LSAs'},
      {name:'Metric',value:'cost + VL cost',note:'Area 2 link cost plus VL interface cost'},
    ],
    flood:{from:'R2',to:'R3',type:'T3'},
    pktBadge:'Type 3 Summary LSA via Virtual Link',
    pktFields:[
      {f:'LS Type',       v:'3 (Summary)',  n:'Inter-area summary — R2 now a proper ABR'},
      {f:'Link-State ID', v:'10.2.0.0',     n:'Area 2 prefix being advertised'},
      {f:'Adv. Router',   v:'2.2.2.2',     n:'R2 originates this LSA'},
      {f:'Area',          v:'0.0.0.0',     n:'Flooded into Area 0 via virtual link'},
      {f:'Metric',        v:'2',           n:'Area 2 interface cost + VL cost'},
    ],
  },
  {
    title:'Step 2 — R3 Floods Type 3 LSAs Throughout Area 0',
    log:'R3 floods Area 2 Type 3 LSAs to R4, R5 in Area 0',
    desc:'R3 receives the Type 3 LSAs from R2 via the VL (which is a virtual Area 0 interface). R3 treats these LSAs exactly like any other Area 0 LSA — it floods them to all Area 0 neighbors (R4, R5) using normal OSPF flooding.<br><br>R4 and R5 install these Type 3 LSAs in their LSDBs. Their next SPF run will compute routes to Area 2 prefixes via R3 (which has the path back to R2 via Area 1).<br><br>The routing table entries appear as <code>O IA</code> (OSPF inter-area) on R4 and R5.',
    cli:'show ip ospf database summary  ! on R4 (Area 0)\n! Summary Net Link States (Area 0):\n!  Link ID: 10.2.0.0  Adv: 2.2.2.2  Metric: 2  ← Area 2 visible!\n!  Link ID: 10.2.1.0  Adv: 2.2.2.2  Metric: 3\n\nshow ip route  ! on R5\n! O IA  10.2.0.0/24 [110/3] via 10.0.0.3, GigabitEthernet0/0\n! O IA  10.2.1.0/24 [110/4] via 10.0.0.3, GigabitEthernet0/0',
    rfc:'RFC 2328 §13.3 — LSA flooding: Area 0 routers flood to all Area 0 neighbors',
    highlightedRouters:['R3','R4','R5'],
    floodedLinks:[{a:'R3',b:'R4'},{a:'R3',b:'R5'}],blockedLinks:[],
    showVirtualLink:true,vlinkProgress:1,vlinkActive:true,failedLinks:[],
    routerStatus:{R1:'',R2:'ABR · T3 sent',R3:'Flooding to Area 0',R4:'Rcvd Area 2 routes ✔',R5:'Rcvd Area 2 routes ✔'},
    timerRows:[
      {name:'Area 2 routes',value:'Reachable ✔',note:'R4 and R5 now have O IA routes to Area 2'},
      {name:'Path: R5→Area 2',value:'R5→R3→R2→Area 2',note:'Via Area 0 to R3, then through transit Area 1 to R2'},
      {name:'Route tag',value:'O IA',note:'Inter-area OSPF route in routing table'},
    ],
    flood:{from:'R3',to:'R4',type:'T3'},
    pktBadge:'Type 3 Flood · R3 → Area 0',
    pktFields:[
      {f:'LS Type',v:'3 (Summary)',n:'R3 is just forwarding — Adv Router is still R2'},
      {f:'Adv. Router',v:'2.2.2.2',n:'R2 originated — unchanged in flooding'},
      {f:'Area',v:'0.0.0.0',n:'Area 0 flooding — R4, R5 receive this'},
      {f:'Metric',v:'2',n:'Cost to reach 10.2.0.0 from Area 2 boundary'},
    ],
  },
  {
    title:'Step 3 — Reverse Direction: Area 0 Routes Reach Area 2',
    log:'R3 sends Area 0 Type 3s to R2 via VL → R2 floods into Area 2',
    desc:'Reachability is bidirectional. R3 also sends <b>Type 3 Summary LSAs</b> for Area 0 and Area 1 prefixes back to R2 across the VL. R2 then floods these into Area 2 so R1 can reach all other areas.<br><br>This means R1 in Area 2 will have O IA routes to:<br>• Area 0 prefixes (via R2 → VL → R3 → Area 0)<br>• Area 1 prefixes (via R2 → Area 1 → R3)<br><br>Full two-way reachability is now restored across all areas.',
    cli:'show ip route  ! on R1 (Area 2)\n! O IA  10.0.0.0/24 [110/3] via R2 — Area 0 reachable!\n! O IA  10.1.0.0/24 [110/2] via R2 — Area 1 reachable!\n\nshow ip ospf database summary  ! on R2\n! Summary from R3 via VL: 10.0.0.0/24 (Area 0)\n! Summary from R3 via VL: 10.1.0.0/24 (Area 1)\n! R2 re-originates these as T3 into Area 2',
    rfc:'RFC 2328 §12.4.3 — ABR summarizes routes in both directions',
    highlightedRouters:['R2','R1'],
    floodedLinks:[{a:'R3',b:'R2'},{a:'R2',b:'R1'}],blockedLinks:[],
    showVirtualLink:true,vlinkProgress:1,vlinkActive:true,failedLinks:[],
    routerStatus:{R1:'O IA routes ✔',R2:'ABR: bidirectional',R3:'Sending T3 to R2',R4:'',R5:''},
    timerRows:[
      {name:'Area 2 → Area 0',value:'Via VL ✔',note:'R2 sends Area 2 T3s to R3 via VL'},
      {name:'Area 0 → Area 2',value:'Via VL ✔',note:'R3 sends Area 0 T3s to R2 via VL'},
      {name:'Full reachability',value:'All areas ✔',note:'Area 1, 0, 2 all mutually reachable'},
    ],
    flood:{from:'R3',to:'R2',type:'T3'},
    pktBadge:'Type 3 · Area 0→Area 2 via VL',
    pktFields:[
      {f:'LS Type',v:'3',n:'Summary LSA for Area 0 prefix'},
      {f:'Adv. Router',v:'3.3.3.3',n:'R3 originates for Area 0 routes going to Area 2'},
      {f:'Link-State ID',v:'10.0.0.0',n:'Area 0 prefix advertised to Area 2 via VL'},
    ],
  },
  {
    title:'Step 4 — Demand Circuit Behavior of VL',
    log:'VL demand circuit: Hellos suppressed after adjacency — DoNotAge LSAs',
    desc:'By default, OSPF virtual links run as <b>demand circuits</b> (RFC 2328 §D). This means:<br><br><b>1. Hello suppression:</b> After adjacency reaches FULL, periodic Hello packets are suppressed (no longer sent). The VL stays up without constant keepalives.<br><br><b>2. DoNotAge LSAs:</b> LSAs flooded across the VL have the <b>DoNotAge (DNA) bit</b> set. This prevents LSA age from incrementing while the VL is idle — avoiding periodic re-flooding every 30 minutes (MaxAge refresh).<br><br>This behavior is important on slow WAN links to reduce unnecessary overhead. Hellos resume only when the VL needs to re-establish.',
    cli:'show ip ospf virtual-links\n! Virtual Link OSPF_VL0 to router 3.3.3.3 is up\n! Run as demand circuit  ← demand circuit mode!\n! DoNotAge LSA allowed    ← DNA bit set on LSAs\n\nshow ip ospf database  ! on R2\n! R3-RouterLSA  Age: 0 (DoNotAge)  ← no aging\n!\n! To disable demand circuit behavior:\nrouter ospf 1\n no area 1 virtual-link 3.3.3.3 demand-circuit',
    rfc:'RFC 2328 §D — Demand circuits: Hello suppression and DoNotAge LSAs',
    highlightedRouters:['R2','R3'],
    floodedLinks:[],blockedLinks:[],
    showVirtualLink:true,vlinkProgress:1,vlinkActive:true,failedLinks:[],
    routerStatus:{R1:'',R2:'VL: demand circuit',R3:'VL: demand circuit',R4:'',R5:''},
    timerRows:[
      {name:'Hello suppression',value:'Enabled',note:'No periodic Hellos after FULL — reduces overhead'},
      {name:'DoNotAge bit',value:'Set on VL LSAs',note:'LSAs don\'t age — no 30min refresh needed'},
      {name:'Re-Hello trigger',value:'Topology change',note:'Hellos resume only when needed'},
      {name:'Demand circuit',value:'RFC 2328 §D',note:'Designed for low-bandwidth WAN links'},
    ],
    flood:null,pktFields:null,
  },
  {
    title:'Step 5 — Full Topology: End-to-End Reachability Verified',
    log:'Full topology: all areas reachable via VL — traceroute proves path',
    desc:'With the virtual link fully operational, a traceroute from R1 (Area 2) to R5 (Area 0) shows the complete path through the OSPF domain:<br><br><b>R1 → R2 → R3 (via Area 1) → R4/R5</b><br><br>The path traverses the transit area (Area 1) between R2 and R3, even though the routing appears as a normal inter-area route. The VL is transparent to end-to-end routing.<br><br>OSPF route types on each router confirm correct operation: O (intra-area), O IA (inter-area), and the VL next-hop (R3 from R2\'s perspective).',
    cli:'traceroute 10.0.0.5  ! from R1 to R5\n!  1  R2 (10.2.0.1)  1ms\n!  2  R3 (10.1.0.3)  2ms  ← goes through Area 1 (transit)\n!  3  R5 (10.0.0.5)  3ms\n\nshow ip route  ! summary on R1\n! O IA  10.0.0.0/24  via R2\n! O IA  10.0.1.0/24  via R2\n! O IA  10.1.0.0/24  via R2\n\nshow ip route  ! summary on R5\n! O IA  10.2.0.0/24  via R3  ← Area 2 reachable from Area 0!\n! O IA  10.2.1.0/24  via R3',
    rfc:'RFC 2328 — Full inter-area reachability with virtual link',
    highlightedRouters:['R1','R2','R3','R4','R5'],
    floodedLinks:[{a:'R1',b:'R2'},{a:'R2',b:'R3'},{a:'R3',b:'R4'},{a:'R3',b:'R5'}],blockedLinks:[],
    showVirtualLink:true,vlinkProgress:1,vlinkActive:true,failedLinks:[],
    routerStatus:{R1:'Full reach ✔',R2:'ABR active ✔',R3:'ABR active ✔',R4:'Full reach ✔',R5:'Full reach ✔'},
    timerRows:[
      {name:'Area 2 ↔ Area 0',value:'REACHABLE ✔',note:'VL enables full bi-directional reachability'},
      {name:'Path transparency',value:'VL invisible to traceroute',note:'Routing uses VL but traceroute sees physical hops'},
      {name:'O IA routes',value:'On all routers',note:'Inter-area routes installed everywhere'},
    ],
    flood:null,pktFields:null,
  },
],

/* ══════════════════════════════════════
   VIRTUAL LINK — FAILURE SCENARIOS
══════════════════════════════════════ */
vlink_fail: [
  {
    title:'Step 1 — VL Failure: Transit Area Link Breaks',
    log:'VL failure: R2↔R3 physical link in Area 1 fails',
    desc:'A virtual link is only as stable as the <b>transit area\'s routing path</b>. The R2-R3 physical link in Area 1 fails. This breaks the intra-area path that the VL uses to carry its Hello packets.<br><br><b>Immediate consequence:</b><br>• No physical path for VL Hellos to travel<br>• R2 and R3 stop receiving VL Hello packets<br>• Both sides start counting down the <b>VL Dead Timer (40s)</b><br>• VL packets pile up in the retransmit queue<br><br>Note: the failure is NOT instantly detected — unlike with BFD, a virtual link uses the OSPF Hello/Dead timer mechanism.',
    cli:'! Link R2-R3 fails\nshow ip ospf virtual-links  ! on R2 (immediately after failure)\n! Virtual Link OSPF_VL0 to router 3.3.3.3 is UP  ← still UP!\n! Hello due in 00:00:02, Dead timer countdown: 00:00:38 (started)\n!\n! OSPF still thinks VL is up — waiting for Dead timer',
    rfc:'RFC 2328 §C.3 — VL stability depends on transit area availability',
    highlightedRouters:['R2','R3'],
    floodedLinks:[],blockedLinks:[],showVirtualLink:true,vlinkProgress:1,vlinkActive:false,vlinkFail:true,
    failedLinks:[{a:'R2',b:'R3'}],
    routerStatus:{R1:'Area 2',R2:'VL: Dead timer running',R3:'VL: Dead timer running',R4:'',R5:''},
    timerRows:[
      {name:'Physical link',value:'DOWN ✕',note:'R2-R3 Area 1 link failed'},
      {name:'VL state',value:'UP (waiting)',note:'VL not yet declared down — Dead timer running'},
      {name:'VL Dead timer',value:'40s countdown',note:'Will expire if no Hello received in 40s'},
    ],
    flood:null,pktFields:null,
  },
  {
    title:'Step 2 — Dead Timer Expires: VL Declared DOWN',
    log:'VL Dead timer expired (40s) → VL goes DOWN → OSPF adjacency torn down',
    desc:'After 40 seconds without a Hello on the VL, the <b>Dead Timer expires</b>. OSPF declares the VL adjacency down and transitions from FULL to DOWN state.<br><br>An OSPF adjacency change syslog message is generated:<br><code>%OSPF-5-ADJCHG: Nbr 3.3.3.3 on OSPF_VL0 from FULL to DOWN, Dead timer expired</code><br><br>This is 40 seconds of black-hole routing — packets destined for Area 2 are forwarded toward R3 but can\'t reach Area 2. This is a major weakness: VL uses the slow Dead Timer, not BFD.',
    cli:'! 40 seconds after failure:\n%OSPF-5-ADJCHG: Process 1, Nbr 3.3.3.3 on OSPF_VL0 from FULL to DOWN,\n  Dead timer expired\n\nshow ip ospf virtual-links  ! on R2\n! Virtual Link OSPF_VL0 to router 3.3.3.3 is DOWN\n! Dead timer expired\n\n! Notice: this took 40s — unlike BFD which would detect in 150ms',
    rfc:'RFC 2328 §10.5 — Dead timer expiry triggers neighbor down event',
    highlightedRouters:['R2','R3'],
    floodedLinks:[],blockedLinks:[],showVirtualLink:true,vlinkProgress:1,vlinkActive:false,vlinkFail:true,
    failedLinks:[{a:'R2',b:'R3'}],
    routerStatus:{R1:'isolated again',R2:'VL: DOWN ↓ (40s elapsed)',R3:'VL: DOWN ↓',R4:'Area 2 routes stale',R5:'Area 2 routes stale'},
    timerRows:[
      {name:'Detection time',value:'40 seconds',note:'VL uses OSPF Dead Timer — no BFD'},
      {name:'VL state',value:'DOWN',note:'Adjacency torn down after Dead timer expires'},
      {name:'Black-hole window',value:'~40s',note:'Traffic to Area 2 drops during this window'},
    ],
    flood:null,pktFields:null,
  },
  {
    title:'Step 3 — Area 2 Routes Withdrawn from LSDB',
    log:'Area 2 routes MaxAge flushed from Area 0 — R4, R5 lose reachability',
    desc:'After the VL goes DOWN, R2 is no longer a valid ABR (no Area 0 attachment). R2 withdraws all its Type 3 LSAs by setting their <b>age to MaxAge (3600s)</b> and re-flooding them. This signals all Area 0 routers to remove these LSAs from their LSDBs.<br><br>R3, R4, and R5 receive the MaxAge Type 3 LSAs and purge them. Their routing tables no longer have routes to Area 2 prefixes.<br><br>Packets from Area 0 to Area 2 are now silently dropped — no ICMP unreachable is generated because OSPF has no fast notification mechanism without BFD.',
    cli:'show ip ospf database summary  ! on R4 (after VL failure + 40s)\n! Summary Net Link States (Area 0):\n!  (EMPTY — 10.2.0.0 and 10.2.1.0 gone!)\n\nshow ip route  ! on R5\n!  (No routes to 10.2.x.x — black hole until VL restores)\n\n! MaxAge flush log:\n! OSPF: Rcv MaxAge LS UPD from 2.2.2.2 — purging 10.2.0.0 summary LSA',
    rfc:'RFC 2328 §14.1 — MaxAge LSAs are purged from the LSDB',
    highlightedRouters:['R3','R4','R5'],
    floodedLinks:[{a:'R3',b:'R4'},{a:'R3',b:'R5'}],blockedLinks:[],
    showVirtualLink:true,vlinkProgress:1,vlinkActive:false,vlinkFail:true,failedLinks:[{a:'R2',b:'R3'}],
    routerStatus:{R1:'isolated',R2:'VL: DOWN — withdrew T3s',R3:'Flushing Area 2 LSAs',R4:'Area 2 routes gone',R5:'Area 2 routes gone'},
    timerRows:[
      {name:'Area 2 T3 LSAs',value:'MaxAge = 3600s',note:'R2 floods MaxAge to signal withdrawal'},
      {name:'R4 routing table',value:'No 10.2.x.x',note:'Area 2 unreachable from Area 0'},
      {name:'Traffic behavior',value:'Black hole',note:'Packets dropped silently — no ICMP'},
    ],
    flood:{from:'R3',to:'R4',type:'LSU'},
    pktBadge:'OSPF LSU · MaxAge Flush',
    pktFields:[
      {f:'LSA type',v:'3 (Summary)',n:'Type 3 for Area 2 prefix being withdrawn'},
      {f:'LS Age',v:'3600 (MaxAge)',n:'MaxAge triggers immediate purge from all LSDBs'},
      {f:'Adv. Router',v:'2.2.2.2',n:'R2 floods MaxAge to withdraw its LSAs'},
    ],
  },
  {
    title:'Step 4 — VL Recovery: Transit Area Restores',
    log:'VL recovery: R2-R3 link restored → VL reforms in ~40s',
    desc:'When the R2-R3 physical link in Area 1 is restored:<br><br>1. Intra-area SPF in Area 1 reconverges — path between R2 and R3 re-established<br>2. R2 can now reach R3 again through Area 1<br>3. VL Hellos start flowing again — state machine restarts<br>4. VL goes through Hello → ExStart → Exchange → Loading → <b>Full</b> again<br>5. R2 re-originates Type 3 LSAs for Area 2 → flooded to Area 0<br>6. Area 2 reachability restored<br><br>Total recovery time: ~40s (Hello/Dead) + LSDB sync + SPF runs.',
    cli:'! Link R2-R3 restored in Area 1:\nshow ip ospf virtual-links  ! ~40s after restoration\n! Virtual Link OSPF_VL0 to router 3.3.3.3 is UP\n! Adjacency State FULL ✔\n\nshow ip route  ! on R5\n! O IA  10.2.0.0/24 [110/3] via R3 — Area 2 reachable again!',
    rfc:'RFC 2328 §C.3 — VL reforms when transit area path is restored',
    rule:'<b>VLs are a temporary fix — not a design best practice.</b> The preferred solution is to add a direct physical or logical link from Area 2 to Area 0. Virtual links create fragile dependencies on transit area stability and have 40s+ failure detection. Use only during migrations.',
    highlightedRouters:['R2','R3'],
    floodedLinks:[{a:'R2',b:'R3'}],blockedLinks:[],
    showVirtualLink:true,vlinkProgress:1,vlinkActive:true,vlinkFail:false,failedLinks:[],
    routerStatus:{R1:'Area 2 reachable ✔',R2:'VL: reforming',R3:'VL: reforming',R4:'Routes returning',R5:'Routes returning'},
    timerRows:[
      {name:'Recovery start',value:'Link up',note:'Area 1 intra-area SPF runs first'},
      {name:'VL Hello starts',value:'~10s',note:'R2/R3 discover path and send Hello'},
      {name:'Full adjacency',value:'~40s',note:'Dead timer cycle before full LSDB sync'},
      {name:'Area 2 restored',value:'~60-90s total',note:'From failure detection to full recovery'},
    ],
    flood:{from:'R2',to:'R3',type:'Hello'},
    pktBadge:'OSPF Hello · VL Recovery',
    pktFields:[
      {f:'State',v:'INIT',n:'VL restarting — both sides send Hello again'},
      {f:'Area ID',v:'0.0.0.0',n:'Still an Area 0 VL Hello'},
      {f:'Neighbor list',v:'(empty)',n:'Starting fresh after adjacency was torn down'},
    ],
  },
  {
    title:'Step 5 — Best Practice: Replace VL with Physical Connectivity',
    log:'Best practice: eliminate VL dependency with direct Area 0 link or GRE tunnel',
    desc:'Virtual links should be treated as a <b>temporary workaround</b>, not a permanent design. The proper fix is to give Area 2 direct physical connectivity to Area 0.<br><br><b>Options in order of preference:</b><br><br>1. <b>Physical link:</b> Add a direct WAN or fiber link from R2 (or a new router) into Area 0 — eliminates the transit dependency entirely.<br><br>2. <b>GRE tunnel:</b> Configure a GRE or MPLS tunnel from Area 2 to Area 0 and run OSPF over it in Area 0 — more reliable than VL and supports BFD.<br><br>3. <b>Keep VL short-term:</b> If the transit area is stable and the VL is only needed temporarily (migration, hardware upgrade), VL is acceptable.',
    rfc:'RFC 2328 §C.3 — VL as a design option; best practice is direct Area 0 attachment',
    highlightedRouters:['R2'],
    floodedLinks:[],blockedLinks:[],
    showVirtualLink:false,failedLinks:[],
    routerStatus:{R1:'Area 2',R2:'Needs direct Area 0 link',R3:'',R4:'',R5:''},
    timerRows:[
      {name:'VL weakness',value:'40s detection',note:'No BFD support on virtual links (per RFC)'},
      {name:'VL weakness',value:'Transit dependency',note:'If transit area fails, Area 2 isolated'},
      {name:'Better option',value:'Physical link',note:'Direct Area 0 connection — stable, BFD-capable'},
      {name:'Better option',value:'GRE + Area 0',note:'GRE tunnel running in Area 0 — supports BFD'},
    ],
    flood:null,pktFields:null,
  },
],

/* ══════════════════════════════════════
   BFD — INTRODUCTION
══════════════════════════════════════ */
bfd_intro: [
  {
    title:'BFD — Bidirectional Forwarding Detection Overview',
    log:'BFD: sub-second failure detection protocol (RFC 5880)',
    desc:'<b>BFD (Bidirectional Forwarding Detection)</b> is a lightweight, protocol-independent hello mechanism designed to detect link/path failures at sub-second speed. Without BFD, OSPF relies on its <b>Dead Timer (default 40 seconds)</b> to detect neighbor loss.<br><br><b>Key design goals of BFD:</b><br>• Independent of routing protocols — one BFD session can serve multiple protocols (OSPF, BGP, VRRP, etc.)<br>• Operates at the forwarding plane — often hardware-offloaded for lowest latency<br>• Very low overhead — tiny packets (24-byte BFD control header)<br>• RFC 5880 (BFD core) + RFC 5882 (BFD for OSPF)',
    rfc:'RFC 5880 — BFD protocol | RFC 5882 — BFD for OSPF',
    highlightedRouters:['RA','RB','RC'],bfdLinks:[{a:'RA',b:'RB'},{a:'RB',b:'RC'}],failedLinks:[],
    routerStatus:{RA:'OSPF+BFD',RB:'OSPF+BFD',RC:'OSPF+BFD'},
    timerRows:[
      {name:'OSPF Dead Timer',value:'40 seconds',note:'Default — time to detect link loss WITHOUT BFD'},
      {name:'BFD min interval',value:'50 ms',note:'Typical production value — both TX and RX'},
      {name:'BFD multiplier',value:'3',note:'Failure detected after 3 missed BFD hellos = 150ms'},
      {name:'Detection time',value:'50ms × 3 = 150ms',note:'Failure declared after 150ms with these settings'},
      {name:'RFC 5880',value:'BFD core',note:'Defines BFD packet format and state machine'},
      {name:'RFC 5882',value:'BFD for OSPF',note:'How BFD integrates with OSPF neighbor detection'},
    ],
    flood:null,pktFields:null,
  },
  {
    title:'Step 2 — BFD Packet Format Deep Dive',
    log:'BFD packet format: 24-byte header with state machine fields',
    desc:'BFD uses tiny <b>24-byte control packets</b> sent over UDP (port 3784 for single-hop). The packet header contains:<br><br>• <b>Version:</b> 1 (current)<br>• <b>Detect Multiplier:</b> Number of missed packets before declaring failure<br>• <b>My Discriminator:</b> Unique ID for this BFD session (locally generated)<br>• <b>Your Discriminator:</b> Copy of the neighbor\'s discriminator (demultiplexes sessions)<br>• <b>Desired Min TX Interval:</b> How often this router wants to send<br>• <b>Required Min RX Interval:</b> Minimum gap this router can accept between received packets<br>• <b>State bits:</b> Session state (DOWN/INIT/UP) and flags',
    cli:'! BFD packet capture (decoded):\n! UDP Source Port: 49152, Destination Port: 3784\n! BFD Control, Length: 24\n!   Version: 1\n!   Diagnostic: No Diagnostic (0)\n!   State: Up (3)\n!   Detect Multi: 3\n!   My Discriminator: 0x00001001  (4097)\n!   Your Discriminator: 0x00001002 (4098)\n!   Desired Min TX Interval: 50000 us (50ms)\n!   Required Min RX Interval: 50000 us (50ms)\n!   Required Min Echo RX Interval: 0 us',
    rfc:'RFC 5880 §4 — BFD Control Packet Format',
    highlightedRouters:['RA','RB'],bfdLinks:[{a:'RA',b:'RB'}],failedLinks:[],bfdInterval:50,
    routerStatus:{RA:'BFD sending',RB:'BFD receiving',RC:''},
    timerRows:[
      {name:'BFD header',value:'24 bytes',note:'Compact — designed for high-frequency sending'},
      {name:'UDP port',value:'3784',note:'Single-hop BFD; multi-hop uses 4784'},
      {name:'Discriminator',value:'Locally unique',note:'Allows multiple BFD sessions on same interface'},
      {name:'Negotiated TX',value:'max(my_tx,peer_rx)',note:'TX interval = higher of the two configured values'},
    ],
    flood:{from:'RA',to:'RB',type:'BFD'},
    pktBadge:'BFD Control Packet · Header Detail',
    pktFields:[
      {f:'Version',v:'1',n:'BFD protocol version 1'},
      {f:'State',v:'Up (3)',n:'0=AdminDown, 1=Down, 2=Init, 3=Up'},
      {f:'My Discriminator',v:'0x1001',n:'RA\'s unique session ID'},
      {f:'Your Discriminator',v:'0x1002',n:'RB\'s discriminator (from RB\'s last packet)'},
      {f:'Desired Min TX',v:'50000 μs',n:'RA wants to send every 50ms'},
      {f:'Required Min RX',v:'50000 μs',n:'RA requires packets at least every 50ms'},
      {f:'Detect Multiplier',v:'3',n:'Miss 3 × 50ms = 150ms → session DOWN'},
    ],
  },
  {
    title:'Step 3 — BFD Configuration on Cisco IOS',
    log:'BFD configuration: interface-level + router ospf binding',
    desc:'Configuring BFD for OSPF on Cisco IOS requires two steps:<br><br><b>1. Interface-level BFD:</b> Sets the TX/RX interval and multiplier on the physical interface.<br><br><b>2. OSPF BFD binding:</b> Tells OSPF to use BFD for neighbor failure detection on that interface (or all interfaces).<br><br>After configuration, OSPF registers its neighbor sessions with BFD. When BFD detects a failure, it calls back to OSPF immediately — OSPF doesn\'t need to wait for its own Dead Timer.',
    cli:'! Step 1: Configure BFD on the interface\ninterface GigabitEthernet0/0\n bfd interval 50 min_rx 50 multiplier 3\n ! ↑ TX 50ms  ↑ RX 50ms  ↑ miss 3 = 150ms detection\n\n! Step 2: Enable BFD under OSPF\nrouter ospf 1\n bfd all-interfaces\n ! OR per-interface:\n ! neighbor x.x.x.x bfd (for specific neighbors)\n\n! Verify:\nshow bfd neighbors\n! NeighAddr    LD/RD    RH/RS    State  Int\n! 10.0.0.2    4097/4098  Up/Up   Up     Gi0/0',
    rfc:'RFC 5882 §4 — OSPF registers with BFD; BFD notifies OSPF on session state change',
    rule:'<b>Always configure BFD bilaterally.</b> If only one side has BFD and the link fails, the BFD-enabled end detects in 150ms, but the other end still waits for the Dead Timer (40s). For BFD to work end-to-end, BOTH routers must be configured.',
    highlightedRouters:['RA','RB'],bfdLinks:[{a:'RA',b:'RB'}],failedLinks:[],bfdInterval:50,
    routerStatus:{RA:'BFD configured',RB:'BFD configured',RC:''},
    timerRows:[
      {name:'bfd interval',value:'50ms',note:'TX interval — send BFD hello every 50ms'},
      {name:'min_rx',value:'50ms',note:'Minimum RX interval — expect hello every 50ms'},
      {name:'multiplier',value:'3',note:'Declare failure after 3 missed hellos = 150ms'},
      {name:'bfd all-interfaces',value:'OSPF global',note:'Applies BFD to all OSPF neighbors globally'},
    ],
    flood:null,pktFields:null,
  },
  {
    title:'Step 4 — BFD State Machine: DOWN → INIT → UP',
    log:'BFD state machine: 3-way handshake to establish session',
    desc:'BFD uses a simple 3-state state machine to establish a session:<br><br><b>DOWN state:</b> Initial state. Router sends BFD packets with State=DOWN and Your-Discriminator=0 (doesn\'t know peer yet).<br><br><b>INIT state:</b> Received a DOWN or INIT packet from the peer. Router responds with State=INIT. Now knows peer\'s discriminator.<br><br><b>UP state:</b> Received an INIT or UP packet from the peer. Session is established. Continuous hellos begin at the negotiated rate.<br><br>The full 3-way takes just 2-3 packet exchanges — very fast.',
    cli:'! BFD session establishment debug:\ndebug bfd\n! BFD: neighbor 10.0.0.2, state DOWN → INIT\n! (received DOWN from peer, sending INIT)\n! BFD: neighbor 10.0.0.2, state INIT → UP\n! (received INIT from peer, sending UP)\n! BFD: session 10.0.0.2 UP — notifying OSPF: neighbor reachable\n\nshow bfd neighbors detail\n! Session state is UP, uptime: 00:00:02\n! Registered protocols: OSPF',
    rfc:'RFC 5880 §6.7 — BFD state machine: DOWN → INIT → UP',
    highlightedRouters:['RA','RB'],bfdLinks:[{a:'RA',b:'RB'}],failedLinks:[],bfdInterval:50,
    routerStatus:{RA:'BFD: UP ✔',RB:'BFD: UP ✔',RC:''},
    timerRows:[
      {name:'State: DOWN',v:'Initial',note:'Sending DOWN, Your-Discriminator=0'},
      {name:'State: INIT',value:'Peer seen',note:'Received DOWN from peer, now sending INIT'},
      {name:'State: UP',value:'Session UP',note:'Received INIT from peer — 3-way complete'},
      {name:'Setup time',value:'~3 packets',note:'Extremely fast — milliseconds to establish'},
    ],
    flood:{from:'RA',to:'RB',type:'BFD'},
    pktBadge:'BFD Control · DOWN→INIT Handshake',
    pktFields:[
      {f:'State',v:'DOWN (1)',n:'Initial state — advertising DOWN'},
      {f:'My Discriminator',v:'0x1001',n:'RA\'s session ID'},
      {f:'Your Discriminator',v:'0x0000',n:'Zero — don\'t know RB\'s discriminator yet'},
    ],
  },
  {
    title:'Step 5 — BFD vs OSPF Dead Timer: The Speed Difference',
    log:'BFD: 150ms detection vs OSPF dead timer: 40s',
    showTimeline:true,
    desc:'<b>This timeline shows the critical difference</b> in convergence speed between using OSPF Dead Timer alone versus BFD-assisted detection.<br><br>With traditional OSPF, after a link failure the router must wait for the full Dead Timer (40s) before running SPF. BFD at 50ms/×3 detects failure in just 150ms — adding SPF (50ms) gives total convergence under 300ms. A <b>100× improvement</b>.',
    rfc:'RFC 5880 §5 — BFD detection time = min(local_tx,remote_rx) × multiplier',
    timerRows:[
      {name:'BFD TX interval',value:'50 ms',note:'Hello sent every 50ms'},
      {name:'BFD Multiplier',value:'3',note:'Fail after 3 consecutive missed hellos'},
      {name:'Detection time',value:'≤ 150ms',note:'Max time to declare failure'},
      {name:'SPF initial delay',value:'50ms',note:'Cisco default spf-start timer'},
      {name:'Total convergence',value:'~200-300ms',note:'vs 40s+ without BFD'},
    ],
    timeAxis:['0','50ms','150ms','200ms','300ms','1s','5s','10s','40s+'],
    timelines:[
      {
        label:'With BFD',color:'#22c55e',totalMs:'~250ms',
        segments:[
          {start:0/100,  end:1.5/100,  color:'#ef4444', label:'Link Fail'},
          {start:1.5/100,end:3.5/100,  color:'#22c55e', label:'BFD detect (150ms)'},
          {start:3.5/100,end:4.5/100,  color:'#f59e0b', label:'SPF delay (50ms)'},
          {start:4.5/100,end:6/100,    color:'#3b82f6', label:'SPF run'},
          {start:6/100,  end:7/100,    color:'#8b5cf6', label:'RIB update'},
        ]
      },
      {
        label:'No BFD',color:'#ef4444',totalMs:'40s+',
        segments:[
          {start:0/100,   end:1/100,   color:'#ef4444', label:'Link Fail'},
          {start:1/100,   end:95/100,  color:'#6b7280', label:'Waiting for Dead Timer (40s)...'},
          {start:95/100,  end:97.5/100,color:'#f59e0b', label:'SPF'},
          {start:97.5/100,end:100/100, color:'#8b5cf6', label:'RIB'},
        ]
      },
    ],
    legendItems:[
      {color:'#ef4444',label:'Link Failure'},{color:'#22c55e',label:'BFD Detection'},
      {color:'#6b7280',label:'Dead Timer Wait'},{color:'#f59e0b',label:'SPF Computation'},
      {color:'#3b82f6',label:'SPF Run'},{color:'#8b5cf6',label:'RIB/FIB Update'},
    ],
    highlightedRouters:[],bfdLinks:[],failedLinks:[],routerStatus:{RA:'',RB:'',RC:''},
    flood:null,pktFields:null,
  },
],

/* ══════════════════════════════════════
   BFD — SESSION SETUP
══════════════════════════════════════ */
bfd_session: [
  {
    title:'Step 1 — OSPF Triggers BFD Session Creation',
    log:'OSPF reaches FULL state → registers neighbor with BFD subsystem',
    desc:'BFD sessions for OSPF are <b>triggered by OSPF itself</b> when a neighbor adjacency reaches the FULL state. OSPF calls the BFD API to create a session to the neighbor\'s IP address.<br><br>The sequence is:<br>1. OSPF adjacency reaches FULL state normally (through Hello/DBD/LSR exchange)<br>2. OSPF registers the neighbor\'s IP with the BFD subsystem<br>3. BFD starts its own session negotiation (3-way: DOWN → INIT → UP)<br>4. Once BFD session reaches UP, OSPF relies on BFD for failure detection<br><br>BFD and OSPF operate in parallel — OSPF still sends Hellos, but BFD failure fires first.',
    cli:'! OSPF adjacency forms normally first:\n%OSPF-5-ADJCHG: Process 1, Nbr 10.10.10.2 on Gi0/0 from LOADING to FULL\n!\n! Then BFD session is created:\n%BFD-6-BFD_SESS_CREATED: Neighbor 10.0.0.2 on GigE0/0\n!\nshow bfd neighbors\n! (session appears but state: INIT — negotiating)',
    rfc:'RFC 5882 §3 — OSPF registers with BFD after adjacency formation',
    highlightedRouters:['RA','RB'],bfdLinks:[{a:'RA',b:'RB'}],failedLinks:[],bfdInterval:50,
    routerStatus:{RA:'OSPF FULL → BFD starting',RB:'OSPF FULL → BFD starting',RC:''},
    timerRows:[
      {name:'Trigger',value:'OSPF FULL state',note:'OSPF calls BFD API when neighbor reaches FULL'},
      {name:'BFD session',value:'Creating…',note:'BFD begins 3-way handshake independently'},
      {name:'OSPF Hellos',value:'Still running',note:'OSPF continues sending Hellos even with BFD'},
      {name:'Failure detection',value:'BFD takes over',note:'Once BFD UP — BFD fires before OSPF Dead timer'},
    ],
    flood:null,pktFields:null,
  },
  {
    title:'Step 2 — BFD Session Negotiation: RA ↔ RB',
    log:'BFD: RA and RB exchange DOWN→INIT→UP control packets',
    desc:'After OSPF registers with BFD, the BFD 3-way handshake begins. RA sends a BFD control packet with State=DOWN (it doesn\'t know the peer yet, Your-Discriminator=0).<br><br>RB receives RA\'s DOWN packet and replies with State=INIT (I see you, waiting for you to see me). RA receives RB\'s INIT packet and sends State=UP (I see you saying you see me — we\'re done). RB receives UP and transitions to UP too.<br><br>The full 3-way takes just 2-3 BFD packet exchanges — completes in milliseconds.',
    cli:'show bfd neighbors\n!  NeighAddr        LD/RD    RH/RS     State  Int\n!  10.0.0.2      4097/4097  Up/Up     Up    Gi0/0\n\nshow bfd neighbors detail\n!  Session state is UP and using echo function with 50ms interval\n!  Registered protocols: OSPF\n!  TX interval: 50ms, RX interval: 50ms, Multiplier: 3\n!  Registered in OSPF process 1',
    rfc:'RFC 5880 §6.7 — BFD session establishment: DOWN → INIT → UP',
    highlightedRouters:['RA','RB'],bfdLinks:[{a:'RA',b:'RB'}],failedLinks:[],bfdInterval:50,
    routerStatus:{RA:'BFD: UP ✔',RB:'BFD: UP ✔',RC:''},
    timerRows:[
      {name:'BFD state',value:'UP',note:'3-way handshake complete'},
      {name:'TX interval',value:'50ms',note:'RA sends BFD hello every 50ms'},
      {name:'RX interval',value:'50ms',note:'RA expects hello every 50ms from RB'},
      {name:'Multiplier',value:'3',note:'Miss 3 hellos → declare failure'},
      {name:'Detection time',value:'150ms',note:'Time before failure declared'},
    ],
    flood:{from:'RA',to:'RB',type:'BFD'},
    pktBadge:'BFD Control Packet · Session UP',
    pktFields:[
      {f:'BFD Vers',       v:'1',          n:'BFD version 1 (RFC 5880)'},
      {f:'State',          v:'UP',         n:'Session is up'},
      {f:'My Discrim',     v:'4097',       n:'RA\'s local discriminator — unique per session'},
      {f:'Your Discrim',   v:'4098',       n:'RB\'s discriminator (from RB\'s last packet)'},
      {f:'Desired TX',     v:'50000 μs',   n:'50ms — RA wants to send every 50ms'},
      {f:'Required RX',    v:'50000 μs',   n:'50ms — RA requires RB to send every 50ms'},
      {f:'Detect Mult',    v:'3',          n:'Miss 3 × 50ms = 150ms detection'},
      {f:'Demand Mode',    v:'0',          n:'Not in demand mode — continuous hellos'},
    ],
  },
  {
    title:'Step 3 — BFD Interval Negotiation',
    log:'BFD: TX/RX intervals negotiated to max of both endpoints',
    desc:'BFD does not simply use the locally configured interval. The <b>actual TX interval is negotiated</b> to be the maximum of what both sides advertise:<br><br><b>Negotiated TX interval = max(my_desired_tx, peer_required_rx)</b><br><br>Example:<br>• RA configured: TX=50ms, RX=50ms<br>• RB configured: TX=100ms, RX=100ms<br>• Negotiated TX (RA→RB) = max(50, 100) = 100ms<br>• Negotiated TX (RB→RA) = max(100, 50) = 100ms<br>• Detection = 100ms × 3 = 300ms<br><br>Both ends always converge to the same effective detection time. This prevents asymmetric detection.',
    cli:'! Asymmetric config example:\n! RA: bfd interval 50 min_rx 50 multiplier 3\n! RB: bfd interval 100 min_rx 100 multiplier 3\n\nshow bfd neighbors detail  ! on RA\n!  Actual TX interval: 100ms  ← negotiated UP from 50ms\n!  Actual RX interval: 100ms\n!  Detection time: 300ms  (100ms × 3)\n!\n! Both ends use 100ms — the higher of 50 vs 100ms',
    rfc:'RFC 5880 §6.8.3 — BFD interval negotiation using Desired Min TX and Required Min RX',
    highlightedRouters:['RA','RB'],bfdLinks:[{a:'RA',b:'RB'}],failedLinks:[],bfdInterval:100,
    routerStatus:{RA:'TX: 100ms (negotiated)',RB:'TX: 100ms (negotiated)',RC:''},
    timerRows:[
      {name:'RA desired TX',value:'50ms',note:'RA wants to send every 50ms'},
      {name:'RB required RX',value:'100ms',note:'RB requires packets at most every 100ms'},
      {name:'Negotiated TX',value:'100ms',note:'max(50,100) = 100ms — both use this'},
      {name:'Detection time',value:'300ms',note:'100ms × 3 multiplier'},
    ],
    flood:null,pktFields:null,
  },
  {
    title:'Step 4 — BFD Echo Mode vs Control Mode',
    log:'BFD Echo mode: loopback test for faster sub-CPU detection',
    desc:'BFD supports two modes for failure detection:<br><br><b>1. Asynchronous Mode (Control Packets)</b> — both ends send periodic BFD Control packets at the negotiated interval. Standard and most common. CPU processes each packet.<br><br><b>2. Echo Mode</b> — one end sends packets that the remote end loops back without processing. The originator detects failure if its own packets don\'t return. Echo mode can run faster than control mode because it doesn\'t require remote CPU involvement — it offloads to the forwarding plane.<br><br>In Echo mode, the remote system just forwards the echo packets back to the sender unchanged — this is why it\'s faster: no CPU processing on the remote end.',
    cli:'! Enable BFD echo mode:\ninterface GigabitEthernet0/0\n bfd interval 50 min_rx 50 multiplier 3\n bfd echo\n\n! Very aggressive echo (lab only — hardware required):\n! bfd interval 3 min_rx 3 multiplier 3  ← 9ms detection!\n\n! Common production setting (echo + conservative):\n! bfd interval 300 min_rx 300 multiplier 3  ← 900ms detection\n\nshow bfd neighbors detail\n! Session state is UP and using echo function with 50ms interval',
    rfc:'RFC 5880 §6.3 — BFD Echo mode | §6.6 — Demand mode',
    rule:'<b>Production BFD tuning:</b> 50ms is aggressive and suitable only for dedicated hardware. Software-based BFD on busy CPUs uses 300-500ms to avoid false positives. Always match TX and RX to avoid asymmetric detection. Test under load before deploying.',
    highlightedRouters:['RA','RB'],bfdLinks:[{a:'RA',b:'RB'}],failedLinks:[],bfdInterval:50,
    routerStatus:{RA:'BFD echo active',RB:'BFD echo: loopback',RC:''},
    timerRows:[
      {name:'Mode',value:'Echo',note:'RA sends, RB loops back — RA detects failure'},
      {name:'Echo TX',value:'50ms',note:'RA sends echo every 50ms'},
      {name:'Remote CPU',value:'Not involved',note:'RB just loops packets — no OSPF processing'},
      {name:'Sub-10ms option',value:'3ms × 3',note:'9ms detection — dedicated hardware required'},
    ],
    flood:{from:'RA',to:'RB',type:'BFD'},
    pktBadge:'BFD Echo Packet',
    pktFields:[
      {f:'Type',v:'Echo',n:'RA sends its own IP as destination — RB loops back'},
      {f:'Interval',v:'50ms',n:'Echo packets sent every 50ms'},
      {f:'Remote processing',v:'None',n:'RB\'s CPU not involved — pure forwarding plane'},
    ],
  },
  {
    title:'Step 5 — BFD Demand Mode and Poll Sequence',
    log:'BFD Demand mode: suspends hellos, uses explicit polls',
    desc:'<b>Demand Mode</b> is a BFD optimization for situations where continuous hellos are wasteful. In Demand Mode:<br><br>1. After adjacency is UP, both sides set the Demand (D) bit in BFD packets<br>2. Continuous asynchronous hellos are suspended<br>3. Liveness is verified only via explicit <b>Poll (P) and Final (F) sequences</b><br>4. Either side can poll the other by sending a BFD packet with Poll bit set; the other responds with Final bit<br><br>Demand mode is typically used in conjunction with hardware failure detection (e.g., when the physical link detects failure faster than BFD would).',
    cli:'! BFD Demand mode configuration (Cisco):\ninterface GigabitEthernet0/0\n bfd interval 50 min_rx 50 multiplier 3\n! Demand mode is auto-negotiated based on platform\n!\n! In demand mode, periodic hellos stop:\nshow bfd neighbors detail\n! Session state is UP using demand mode\n! TX interval: suspended (demand mode active)\n! Poll sequence: enabled\n\n! To force a poll:\ndebug bfd\n! BFD: sending Poll to 10.0.0.2\n! BFD: received Final from 10.0.0.2 — alive',
    rfc:'RFC 5880 §6.6 — BFD Demand mode; §6.5 — Poll and Final sequences',
    highlightedRouters:['RA','RB'],bfdLinks:[{a:'RA',b:'RB'}],failedLinks:[],bfdInterval:50,
    routerStatus:{RA:'BFD: demand mode',RB:'BFD: demand mode',RC:''},
    timerRows:[
      {name:'Demand mode',value:'Hellos suspended',note:'After UP, stop sending continuous hellos'},
      {name:'Poll (P bit)',value:'Liveness check',note:'Send with Poll=1 → peer must reply with Final=1'},
      {name:'Final (F bit)',value:'Poll ack',note:'Response to Poll — confirms liveness'},
      {name:'Use case',value:'Low-overhead links',note:'Useful when hardware already detects failures'},
    ],
    flood:null,pktFields:null,
  },
  {
    title:'Step 6 — BFD Multi-Hop for Non-Adjacent Neighbors',
    log:'BFD multi-hop (RFC 5883): track non-adjacent paths',
    desc:'Standard BFD (RFC 5880, UDP port 3784) is for <b>single-hop</b> sessions between directly connected neighbors. For tracking paths across multiple hops (e.g., BGP eBGP peers, route tracking), <b>BFD multi-hop</b> (RFC 5883, UDP port 4784) is used.<br><br>BFD multi-hop works the same way as single-hop but:<br>• Uses port 4784 instead of 3784<br>• TTL is NOT decremented to 1 — packets can traverse multiple hops<br>• The detection time represents the end-to-end path, not just the first hop<br>• Can be used with OSPF virtual links or BGP sessions',
    cli:'! BFD Multi-hop (for tracking non-adjacent paths):\nbfd-template multi-hop MHOP_TEMPLATE\n interval min-tx 300 min-rx 300 multiplier 3\n!\n! Apply to routing protocol:\nrouter bgp 65000\n neighbor 192.168.100.1 fall-over bfd\n!\n! Multi-hop BFD session uses port 4784:\nshow bfd neighbors detail\n! Port: 4784 (multi-hop)',
    rfc:'RFC 5883 — BFD for Multi-Hop Paths',
    highlightedRouters:['RA','RC'],bfdLinks:[{a:'RA',b:'RB'},{a:'RB',b:'RC'}],failedLinks:[],bfdInterval:300,
    routerStatus:{RA:'BFD multi-hop',RB:'transit',RC:'BFD multi-hop'},
    timerRows:[
      {name:'Single-hop BFD',value:'Port 3784',note:'Between directly connected OSPF neighbors'},
      {name:'Multi-hop BFD',value:'Port 4784',note:'Across multiple hops — for BGP, VRF tracking'},
      {name:'Multi-hop interval',value:'300ms typical',note:'Slower — path not hardware-monitorable end-to-end'},
    ],
    flood:null,pktFields:null,
  },
],

/* ══════════════════════════════════════
   BFD — FAILURE DETECTION
══════════════════════════════════════ */
bfd_detect: [
  {
    title:'Step 1 — Physical Link Failure at t=0ms',
    log:'t=0ms: RA-RB link physically fails — BFD begins counting',
    desc:'At t=0ms the RA-RB physical link fails (cable cut, NIC down, switch port down). The <b>physical layer goes down immediately</b>, but OSPF and BFD are not instantly notified on all platforms.<br><br><b>Two paths to detection:</b><br>1. <b>Fast path (hardware-assisted):</b> NIC driver signals link-down event instantly → OS propagates → BFD/OSPF notified in milliseconds. No need to wait for timers.<br>2. <b>Slow path (no link-down event):</b> e.g., fiber optic partial failure, far-end switch failure, or lossy link where the physical layer doesn\'t signal down. BFD must wait for missed hellos to declare failure.<br><br>For BFD to provide its full value, scenario 2 is where it shines — detecting <b>silent path failures</b> that the physical layer doesn\'t report.',
    cli:'! At t=0ms: link physically fails\n! If hardware reports link-down instantly:\n%LINK-3-UPDOWN: Interface GigabitEthernet0/0, changed state to down\n%OSPF-5-ADJCHG: Nbr 10.10.10.2 on Gi0/0 from FULL to DOWN, Interface down\n! (Instant — no BFD needed for physical link-down)\n!\n! If hardware does NOT report (e.g. far-end switch silent failure):\n! → BFD must detect via missed hellos\n! → t=50ms: first hello missed\n! → t=100ms: second hello missed\n! → t=150ms: third hello missed → BFD fires',
    rfc:'RFC 5882 §4.2 — BFD notifies OSPF on session state change',
    highlightedRouters:['RA','RB'],
    bfdLinks:[],failedLinks:[{a:'RA',b:'RB'}],bfdInterval:50,
    routerStatus:{RA:'Link: DOWN t=0ms',RB:'link down',RC:'unaffected'},
    timerRows:[
      {name:'t=0ms',value:'Link fails',note:'Physical failure — hardware may or may not signal'},
      {name:'Hardware link-down',value:'Instant detect',note:'Best case: OS reports immediately'},
      {name:'No hw signal',value:'BFD takes over',note:'BFD detects via 3 missed hellos = 150ms'},
      {name:'OSPF dead timer',value:'Would be 40s',note:'Without BFD — this is what we\'re avoiding'},
    ],
    flood:null,pktFields:null,
  },
  {
    title:'Step 2 — BFD Misses First Hello at t=50ms',
    log:'t=50ms: First BFD hello from RB not received by RA',
    desc:'RA expected a BFD hello from RB at t=50ms (the negotiated interval). No hello arrived. RA increments its <b>missed-packet counter to 1</b>.<br><br>At this point, <b>nothing happens yet</b> — BFD needs to miss <i>multiplier</i> (3) consecutive hellos before declaring failure. This prevents false positives from a single dropped packet or brief CPU spike.<br><br>RA continues sending its own BFD hellos toward RB (these will be dropped since the link is down), and waiting for the next expected RX at t=100ms.',
    cli:'! t=50ms: expected hello not received\n! Internal BFD counter: missed = 1 of 3\n! No action yet — waiting for multiplier threshold\n!\n! RA still sending its own hellos:\n! BFD TX: to 10.0.0.2 (these are silently dropped)\n!\ndebug bfd\n! BFD: neighbor 10.0.0.2 missed 1 RX (threshold: 3)',
    rfc:'RFC 5880 §6.8.4 — Detection time = RX interval × detect multiplier',
    highlightedRouters:['RA'],
    bfdLinks:[],failedLinks:[{a:'RA',b:'RB'}],bfdInterval:50,
    routerStatus:{RA:'BFD: miss 1/3',RB:'link down',RC:''},
    timerRows:[
      {name:'t=50ms',value:'Miss #1',note:'First expected hello not received'},
      {name:'Miss counter',value:'1 / 3',note:'Need 3 consecutive misses before declaring DOWN'},
      {name:'OSPF action',value:'None yet',note:'OSPF still in FULL state — BFD hasn\'t fired'},
    ],
    flood:null,pktFields:null,
  },
  {
    title:'Step 3 — Second and Third Missed Hellos: t=100ms, t=150ms',
    log:'t=100ms miss #2, t=150ms miss #3 → BFD detection threshold reached',
    desc:'At t=100ms, the second expected hello from RB does not arrive. Miss counter = 2.<br>At t=150ms, the third expected hello from RB does not arrive. Miss counter = 3.<br><br>The miss counter has now reached the <b>Detect Multiplier (3)</b>. BFD declares the session <b>DOWN</b> and immediately notifies all registered protocols (OSPF in this case).<br><br>Key: this happens at exactly <b>150ms</b> (3 × 50ms) after the failure. It\'s deterministic and fast — regardless of how large the OSPF LSDB is or how busy the router is.',
    cli:'! t=100ms: miss #2\n! BFD counter: missed = 2 of 3\n!\n! t=150ms: miss #3 → THRESHOLD REACHED\n! BFD session DOWN:\n%BFD-6-BFD_SESS_DESTROYED: Neighbor 10.0.0.2 on GigabitEthernet0/0 is DOWN\n!\n! BFD immediately notifies OSPF:\n%OSPF-5-ADJCHG: Process 1, Nbr 10.10.10.2 on Gi0/0 from FULL to DOWN,\n  BFD node down notification\n!\n! Total time from failure to OSPF notification: 150ms',
    rfc:'RFC 5882 §4.2 — BFD-DOWN event triggers immediate OSPF neighbor teardown',
    highlightedRouters:['RA','RB'],
    bfdLinks:[],failedLinks:[{a:'RA',b:'RB'}],bfdInterval:50,
    routerStatus:{RA:'BFD: DOWN → notify OSPF',RB:'link down',RC:''},
    timerRows:[
      {name:'t=100ms',value:'Miss #2',note:'Second consecutive missed hello'},
      {name:'t=150ms',value:'Miss #3 → DOWN!',note:'Multiplier reached — BFD declares session DOWN'},
      {name:'OSPF notification',value:'t=150ms',note:'Instant callback — no additional delay'},
      {name:'Detection latency',value:'150ms total',note:'From failure to OSPF notification'},
    ],
    flood:null,pktFields:null,
  },
  {
    title:'Step 4 — OSPF Receives BFD Down Notification',
    log:'OSPF: BFD callback → neighbor immediately torn down (no dead timer)',
    desc:'The BFD subsystem calls back to OSPF with a <b>BFD-down event</b> for neighbor 10.10.10.2 (RB). OSPF processes this immediately:<br><br>1. OSPF transitions RB from FULL to DOWN state instantly<br>2. RB\'s Router LSA is marked stale in the LSDB<br>3. OSPF generates its own MaxAge LSA for the link to RB<br>4. OSPF starts the <b>SPF delay timer</b> (spf-start, default 50ms on Cisco)<br><br>This happens at <b>t=150ms</b> — compare to 40s+ without BFD. The OSPF dead timer is completely bypassed — BFD fires before it even gets close.',
    cli:'! t=150ms: OSPF receives BFD callback\n%OSPF-5-ADJCHG: Process 1, Nbr 10.10.10.2 on Gi0/0 from FULL to DOWN,\n  BFD node down notification  ← not "Dead timer" — it\'s BFD!\n!\n! OSPF immediately:\n! - Removes RB from neighbor table\n! - Marks RB\'s Router LSA as stale\n! - Starts SPF delay timer (50ms)\n!\nshow ip ospf neighbor  ! immediately after\n! (No RB entry — already removed)\n!\nshow ip ospf database  ! RB\'s Router LSA age climbing to MaxAge',
    rfc:'RFC 5882 §4 — BFD failure → OSPF neighbor teardown without waiting for Dead timer',
    highlightedRouters:['RA','RC'],
    bfdLinks:[],failedLinks:[{a:'RA',b:'RB'}],bfdInterval:50,
    routerStatus:{RA:'BFD callback → SPF queued',RB:'down',RC:'waiting for new routes'},
    timerRows:[
      {name:'t=150ms',value:'BFD fires',note:'BFD notifies OSPF — no dead timer wait'},
      {name:'OSPF action',value:'RB removed instantly',note:'Neighbor table cleared immediately'},
      {name:'SPF queued',value:'t=150ms+50ms',note:'SPF will run at t=200ms (spf-start delay)'},
      {name:'Dead timer',value:'BYPASSED',note:'Would have fired at t=40,000ms — irrelevant now'},
    ],
    flood:null,pktFields:null,
  },
  {
    title:'Step 5 — SPF Runs: New Shortest Path Computed',
    log:'t=200ms: SPF delay expires → Dijkstra runs → new routes computed',
    desc:'After the SPF delay timer (50ms), OSPF runs <b>Dijkstra\'s algorithm</b> on the updated LSDB (without RB\'s Router LSA). It computes new shortest paths to all destinations.<br><br>Results:<br>• Routes previously via RB are <b>removed</b> from the Routing Information Base (RIB)<br>• Any <b>alternate paths</b> (e.g., via RC) are now installed as the primary route<br>• If no alternate path exists, destinations are marked unreachable<br><br>The SPF run itself typically takes <b>10-50ms</b> depending on LSDB size and CPU speed.',
    cli:'! t=200ms: SPF starts\ndebug ip ospf spf\n! OSPF: starting SPF at 00:00:00.200 (150ms BFD + 50ms delay)\n! OSPF: SPF reason: topo change (BFD notification)\n! OSPF: computing SPF for Area 0\n! OSPF: SPF complete at 00:00:00.248  (48ms SPF duration)\n! OSPF: RIB update: removing routes via 10.0.0.2\n! OSPF: RIB update: installing alternate via 10.0.0.6 (RC)\n!\nshow ip route\n! O  192.168.x.x  via RC  ← alternate path active',
    rfc:'RFC 2328 §16.1 — SPF computation triggered by LSDB change',
    highlightedRouters:['RA','RC'],
    bfdLinks:[],failedLinks:[{a:'RA',b:'RB'}],
    routerStatus:{RA:'SPF running',RB:'down',RC:'new primary path'},
    timerRows:[
      {name:'t=200ms',value:'SPF starts',note:'BFD(150ms) + spf-start(50ms) delay'},
      {name:'SPF duration',value:'~10-50ms',note:'Dijkstra runtime depends on LSDB size'},
      {name:'Routes removed',value:'Via RB',note:'All next-hops pointing to RB removed'},
      {name:'Routes added',value:'Via RC',note:'Alternate path installed if it exists'},
    ],
    flood:{from:'RA',to:'RC',type:'LSU'},
    pktBadge:'OSPF LSU · MaxAge Flood after BFD Failure',
    pktFields:[
      {f:'Action',v:'MaxAge LSA flood',n:'RA floods MaxAge Router LSA to purge RB\'s routes'},
      {f:'Trigger',v:'BFD callback',n:'Not dead timer — BFD triggered this instantly'},
      {f:'SPF delay',v:'50ms (spf-start)',n:'Cisco default — batch topology changes'},
      {f:'New next-hop',v:'Via RC',n:'Alternate path through RC now active'},
    ],
  },
  {
    title:'Step 6 — RIB and FIB Update: Traffic Rerouted',
    log:'t=260ms: RIB updated → FIB programmed → traffic flows via RC',
    desc:'After SPF completes, OSPF pushes the new routes to the <b>Routing Information Base (RIB)</b>. The RIB then programs the <b>Forwarding Information Base (FIB)</b> — the hardware table that actually forwards packets.<br><br><b>Complete convergence timeline:</b><br>• t=0ms: Link fails<br>• t=150ms: BFD detects, notifies OSPF<br>• t=200ms: SPF starts (50ms spf-start delay)<br>• t=248ms: SPF completes<br>• t=258ms: RIB updated<br>• t=268ms: FIB programmed in hardware<br><br><b>Total: ~260-300ms</b> — vs 40,000ms+ without BFD. A 100-150× improvement.',
    cli:'! Full convergence timeline:\n! t=0ms    : Link fails\n! t=150ms  : BFD session DOWN, OSPF notified\n! t=200ms  : SPF starts (spf-start=50ms elapsed)\n! t=248ms  : SPF complete\n! t=258ms  : RIB updated\n! t=268ms  : FIB programmed (CEF/hardware)\n!\nshow ip route  ! at t=270ms\n! O  10.20.0.0/24  [110/2] via 10.0.0.6 (RC)  ← rerouted!\n!\n! Packet loss window: 0ms to ~270ms = 270ms total\n! (vs 40,000ms+ without BFD — 148× faster)',
    rfc:'RFC 5882 §4 — Total convergence with BFD vs without',
    highlightedRouters:['RA','RC'],
    bfdLinks:[{a:'RA',b:'RC'}],failedLinks:[{a:'RA',b:'RB'}],
    routerStatus:{RA:'RIB/FIB updated ✔',RB:'down',RC:'carrying traffic ✔'},
    timerRows:[
      {name:'BFD detection',value:'150ms',note:'Already complete'},
      {name:'SPF delay+run',value:'+100ms',note:'50ms spf-start + ~50ms Dijkstra'},
      {name:'RIB+FIB update',value:'+20ms',note:'Hardware FIB programming'},
      {name:'Total',value:'~270ms',note:'vs 40,000ms without BFD — 148× faster'},
    ],
    flood:null,pktFields:null,
  },
],

/* ══════════════════════════════════════
   BFD — SPF RECONVERGENCE
══════════════════════════════════════ */
bfd_spf: [
  {
    title:'Step 1 — What Triggers an SPF Run?',
    log:'SPF trigger: BFD callback → LSDB change → SPF scheduled',
    desc:'OSPF\'s Dijkstra SPF is <b>not run continuously</b> — it is triggered only when the LSDB changes in a way that affects topology. Four events trigger SPF:<br><br><b>1. BFD callback:</b> BFD notifies OSPF a neighbor is down → OSPF marks that router\'s Router LSA as stale → SPF scheduled.<br><b>2. New Router LSA received:</b> A router advertises a topology change (new/removed link) in its Type 1 LSA → SPF scheduled.<br><b>3. New Network LSA:</b> A Type 2 LSA (DR-generated, multi-access) changes → SPF may be needed.<br><b>4. Summary/External LSA changes:</b> Type 3/5/7 changes — may trigger inter-area SPF only (not full intra-area SPF).<br><br>In BFD scenarios, the trigger path is: <b>BFD down → OSPF neighbor teardown → LSDB stale LSA → SPF scheduled → routes removed/replaced.</b>',
    cli:'! What event triggered the last SPF?\nshow ip ospf statistics\n! Area 0\n!   SPF algorithm executed 3 times\n!   SPF run #3 at 00:01:25, duration 28ms\n!   Reason: topo change (BFD notification)\n!   LSA that caused SPF: Type 1, RID 10.10.10.2\n!\n! Debug to see real-time triggers:\ndebug ip ospf spf\n! OSPF: Schedule SPF in area 0\n! OSPF: Reason: topo change, LSID: 10.10.10.2 (Router LSA)',
    rfc:'RFC 2328 §16 — SPF is computed when there is a topology change in the LSDB',
    rule:'<b>Key insight:</b> Only Type 1 (Router) and Type 2 (Network) LSA changes trigger a full intra-area SPF run. Type 3/5/7 (Summary/External) changes use a lighter calculation — they just re-evaluate inter-area paths without re-running Dijkstra on the full topology graph.',
    highlightedRouters:['RA','RB'],
    bfdLinks:[{a:'RA',b:'RB'},{a:'RB',b:'RC'}],failedLinks:[{a:'RA',b:'RB'}],
    routerStatus:{RA:'BFD down → SPF queued',RB:'down',RC:'waiting for routes'},
    timerRows:[
      {name:'SPF trigger (BFD)',value:'Immediate',note:'BFD callback fires → OSPF schedules SPF'},
      {name:'SPF trigger (LSA)',value:'On LSDB change',note:'New/changed Type 1 or Type 2 LSA received'},
      {name:'T3/T5 trigger',value:'Lighter calc',note:'No full Dijkstra — just inter-area recalc'},
      {name:'Batching',value:'spf-start timer',note:'Multiple changes collected before SPF runs'},
    ],
    flood:{from:'RA',to:'RC',type:'LSU'},
    pktBadge:'OSPF LSU · MaxAge (BFD-triggered)',
    pktFields:[
      {f:'LSA Type',v:'1 (Router)',n:'RA floods RB\'s Router LSA at MaxAge to withdraw it'},
      {f:'LS Age',v:'3600 (MaxAge)',n:'MaxAge signals all routers to purge this LSA'},
      {f:'Advertising Router',v:'10.10.10.2 (RB)',n:'This is RB\'s LSA being withdrawn by RA'},
      {f:'Trigger',v:'BFD callback',n:'Not dead timer — BFD made this happen in 150ms'},
    ],
  },
  {
    title:'Step 2 — SPF Throttle Timers: Start, Hold, Max-Wait',
    log:'SPF throttle: spf-start, spf-hold, spf-max-wait',
    desc:'OSPF SPF is controlled by three throttle timers to prevent CPU storms during rapid topology changes:<br><br><b>spf-start (initial delay):</b> How long to wait after the first topology change before running SPF. Allows multiple near-simultaneous changes to be batched into one SPF run.<br><br><b>spf-hold (hold interval):</b> After an SPF run, the minimum time before the next SPF can run. Doubles after each run (exponential back-off) until max-wait is reached.<br><br><b>spf-max-wait:</b> Maximum hold time. After the back-off plateaus here, it resets if no SPF is needed for the "wait" interval.',
    cli:'! Cisco IOS aggressive BFD + SPF config:\nrouter ospf 1\n timers throttle spf 50 100 5000\n ! initial=50ms, hold=100ms, max=5s (exponential back-off)\n bfd all-interfaces\n\n! Very aggressive (lab only):\n timers throttle spf 0 50 5000\n\n! Conservative (large network):\n timers throttle spf 200 1000 10000\n\n! Show SPF stats:\nshow ip ospf statistics\n! SPF algorithm executed 5 times\n! Last SPF: 00:00:12 · Duration: 42ms · Reason: topo change',
    rfc:'RFC 2328 §16 — SPF scheduling; vendor-specific throttle timers not in RFC',
    rule:'<b>SPF back-off sequence example (hold=100ms, max=5s):</b><br>1st change → wait 50ms → SPF runs<br>2nd change → wait 100ms → SPF runs<br>3rd change → wait 200ms → SPF runs<br>4th change → wait 400ms → SPF runs<br>...doubles each time until 5s max<br>After 5s idle → resets back to 50ms initial delay',
    highlightedRouters:['RA'],bfdLinks:[{a:'RA',b:'RB'},{a:'RB',b:'RC'}],failedLinks:[],
    routerStatus:{RA:'SPF: throttle active',RB:'SPF: computing',RC:'SPF: complete'},
    timerRows:[
      {name:'spf-start',value:'50ms',note:'Initial delay — collect multiple changes'},
      {name:'spf-hold',value:'100ms',note:'Minimum gap after 1st SPF; doubles each run'},
      {name:'spf-max-wait',value:'5000ms',note:'Maximum back-off; resets after idle period'},
      {name:'SPF cost',value:'O(E log V)',note:'Dijkstra on Type 1+2 LSAs'},
    ],
    flood:null,pktFields:null,
  },
  {
    title:'Step 3 — Full SPF vs Partial Route Calculation (PRC)',
    log:'Full SPF vs PRC: only topology changes need full Dijkstra',
    desc:'OSPF does NOT always run a full Dijkstra when the LSDB changes. It distinguishes between two types of calculations:<br><br><b>Full SPF (Dijkstra):</b> Run when the <b>topology graph changes</b> — i.e., a Type 1 (Router) or Type 2 (Network) LSA changes. The entire Shortest Path Tree is recomputed from scratch. Expensive on large networks (O(E log V)).<br><br><b>Partial Route Calculation (PRC):</b> Run when only <b>leaf prefixes change</b> — i.e., a Type 1 LSA changes a stub network entry (not a transit link), or a Type 3/5/7 LSA changes. PRC simply re-evaluates the affected prefix against the existing SPF tree. Much cheaper — O(1) per prefix.<br><br>BFD-triggered neighbor failure → Type 1 LSA change → <b>Full SPF required</b>.',
    cli:'! To see full SPF vs PRC distinction:\nshow ip ospf statistics detail\n! Area 0 SPF runs:\n!   Full SPF: 3 runs  (topology changes — T1/T2 LSA)\n!   PRC:      7 runs  (leaf/prefix changes — T3/T5 LSA)\n!\n! Full SPF is triggered by:\n! - BFD callback (neighbor down)\n! - Router LSA (Type 1) change in transit link\n! - Network LSA (Type 2) change\n!\n! PRC is triggered by:\n! - Stub network in Router LSA changed\n! - Summary LSA (Type 3) changed\n! - External LSA (Type 5/7) changed',
    rfc:'RFC 2328 §16.2 — Stub networks use simpler calculation; Cisco implements PRC as extension',
    rule:'<b>Why PRC matters for BFD:</b> If BFD detects a link failure on a transit link (carries routing traffic), a Full SPF is needed. If only an end-host prefix is lost, PRC handles it cheaply. The distinction affects how much CPU the failure event consumes.',
    highlightedRouters:['RA','RB','RC'],
    bfdLinks:[{a:'RA',b:'RB'},{a:'RB',b:'RC'}],failedLinks:[],
    routerStatus:{RA:'SPF: Full Dijkstra',RB:'SPF: PRC only',RC:'SPF: PRC only'},
    timerRows:[
      {name:'Full SPF trigger',value:'T1/T2 LSA change',note:'Transit link up/down → full Dijkstra rerun'},
      {name:'PRC trigger',value:'T3/T5 or stub',note:'Leaf prefix change → just re-evaluate that prefix'},
      {name:'Full SPF cost',value:'O(E log V)',note:'Grows with topology size — expensive'},
      {name:'PRC cost',value:'O(prefixes)',note:'Independent of topology size — very fast'},
    ],
    flood:null,pktFields:null,
  },
  {
    title:'Step 4 — Dijkstra Algorithm: Building the SPF Tree',
    log:'Dijkstra step-by-step: RA builds shortest path tree without RB',
    desc:'After BFD removes RB from the topology, RA runs Dijkstra on the updated LSDB. The algorithm builds a <b>Shortest Path Tree (SPT)</b> rooted at RA:<br><br><b>Step 1:</b> Add RA to the TENT (candidate) list with cost 0.<br><b>Step 2:</b> Move RA to PATH. Examine RA\'s links — add reachable neighbors (RC is still reachable via direct link; RB is gone per BFD).<br><b>Step 3:</b> Pick the lowest-cost node from TENT (RC, cost 10). Move RC to PATH.<br><b>Step 4:</b> Examine RC\'s links — add any new destinations reachable via RC.<br><b>Step 5:</b> TENT is empty → SPF tree is complete.<br><br>Result: RA now has a direct path to RC. All prefixes previously via RB are now routed via RC if an alternate path exists.',
    cli:'debug ip ospf spf\n! SPF computation starting for Area 0\n! Examining LSDB (RB\'s LSA already MaxAged/removed)\n! Adding RA to TENT: cost 0\n! Moving RA to PATH — examining neighbors:\n!   RB: skipped (MaxAge — BFD removed)\n!   RC: cost 10, adding to TENT\n! Moving RC (lowest cost=10) from TENT to PATH\n!   RC links: 10.20.0.0/24 stub cost 10 → added\n! TENT empty — SPF done in 18ms\n! Installing new routes:\n!   10.20.0.0/24 via RC (cost 20)',
    rfc:'RFC 2328 §16.1 — Dijkstra algorithm for intra-area SPF',
    highlightedRouters:['RA','RC'],
    bfdLinks:[{a:'RA',b:'RC'}],failedLinks:[{a:'RA',b:'RB'}],
    routerStatus:{RA:'SPF: Dijkstra running',RB:'removed from topology',RC:'found via SPF ✔'},
    timerRows:[
      {name:'TENT list',value:'Candidates',note:'Nodes discovered but not yet finalized'},
      {name:'PATH list',value:'Finalized nodes',note:'Shortest path confirmed — won\'t change'},
      {name:'SPF root',value:'RA (self)',note:'RA builds tree from its own perspective'},
      {name:'RB in LSDB',value:'MaxAge — skipped',note:'BFD removed RB before SPF started'},
    ],
    flood:{from:'RA',to:'RC',type:'Hello'},
    pktBadge:'OSPF Hello · Confirming RC still alive',
    pktFields:[
      {f:'Neighbor',v:'RC',n:'RA confirms RC is still up during SPF'},
      {f:'Dead timer',v:'Resetting',note:'RC is alive — no BFD event for RA-RC link'},
      {f:'SPF result',v:'RC as next-hop',n:'Dijkstra chose RC as the alternate path'},
    ],
  },
  {
    title:'Step 5 — Route Installation Pipeline: OSPF → RIB → FIB',
    log:'SPF complete → OSPF → RIB → CEF FIB → hardware forwarding updated',
    desc:'After SPF completes, new routes don\'t immediately appear in the hardware forwarding table. They travel through a <b>3-layer pipeline</b>:<br><br><b>1. OSPF RIB (Routing Information Base):</b> OSPF installs its computed routes into its own internal routing table. Routes are tagged with OSPF administrative distance (110).<br><br><b>2. Global RIB (ip route table):</b> OSPF submits routes to the global IP routing table. If OSPF wins over other protocols (lower AD), its route is installed. This is the <code>show ip route</code> table.<br><br><b>3. FIB (Forwarding Information Base / CEF):</b> The global RIB programs the hardware forwarding table (CEF, TCAM, ASIC). This is what actually forwards packets. Programming time depends on platform — 1ms (ASIC) to 20ms (software CEF).<br><br><b>Total pipeline latency:</b> typically 5-20ms after SPF completes.',
    cli:'! After SPF completes at ~t=248ms:\n!\n! Step 1: OSPF internal RIB updated immediately\nshow ip ospf rib\n! OSPF Router with ID (10.10.10.1) (Process ID 1)\n! Base Topology (MTID 0)\n!  10.20.0.0/24, Intra, cost 20, area 0, via RC\n!\n! Step 2: Global RIB updated\nshow ip route 10.20.0.0\n! O  10.20.0.0/24 [110/20] via 10.0.0.6, Gi0/1  ← t=~255ms\n!\n! Step 3: CEF/FIB programmed\nshow ip cef 10.20.0.0\n! 10.20.0.0/24  nexthop 10.0.0.6 GigabitEthernet0/1  ← t=~265ms\n!\n! Hardware-forwarding platforms (ASR, Nexus):\nshow platform hardware qfp active feature cef lookup 10.20.0.0',
    rfc:'RFC 2328 §16.4 — OSPF routing table calculation and installation',
    rule:'<b>CEF (Cisco Express Forwarding)</b> is the FIB implementation on Cisco platforms. When the RIB changes, the CEF table is updated — this is the last step before packets are actually forwarded correctly. On software-forwarding platforms, CEF update takes ~5-20ms. On hardware ASIC platforms (ASR9K, Nexus), it can be sub-millisecond.',
    highlightedRouters:['RA','RC'],
    bfdLinks:[{a:'RA',b:'RC'}],failedLinks:[{a:'RA',b:'RB'}],
    routerStatus:{RA:'FIB updated ✔',RB:'removed',RC:'carrying traffic ✔'},
    timerRows:[
      {name:'OSPF RIB',value:'t=248ms',note:'SPF result installed in OSPF internal table'},
      {name:'Global RIB',value:'t=~255ms',note:'\'show ip route\' shows new path'},
      {name:'CEF/FIB',value:'t=~265ms',note:'Hardware forwarding table updated — packets flow'},
      {name:'Total pipeline',value:'~17ms',note:'From SPF completion to first packet forwarded correctly'},
    ],
    flood:null,pktFields:null,
  },
  {
    title:'Step 6 — LSA Flooding During Reconvergence',
    log:'Reconvergence flooding: MaxAge LSU → LSAck → SPF on all routers',
    desc:'While RA runs SPF locally, it also <b>floods LSAs</b> to inform other routers. The flooding process during reconvergence involves:<br><br><b>MaxAge LSU Flood:</b> RA generates a MaxAge (age=3600) copy of RB\'s Router LSA and floods it across Area 0 to RC. This tells RC to purge RB from its LSDB.<br><br><b>LSAck:</b> RC acknowledges the MaxAge LSU so RA stops retransmitting.<br><br><b>RC runs SPF:</b> Upon receiving the MaxAge LSA, RC also runs its own SPF computation. RC removes RB from its topology and recalculates routes.<br><br><b>Flooding scope:</b> LSAs flood within an area boundary. Router LSAs (Type 1) stay within Area 0 — they don\'t cross into Area 1 or Area 2. Only Summary LSAs (Type 3) cross area boundaries at ABRs.',
    cli:'! RA floods MaxAge RB Router LSA to RC:\n! [RA → RC] LSU: Type1 RID=RB Age=3600 (MaxAge)\n!\n! RC processes MaxAge LSU:\n! OSPF: Rcv MaxAge LS Update from RA on Gi0/1\n! OSPF: Purging Router LSA from 10.10.10.2 (RB) from LSDB\n! OSPF: Schedule SPF (topology change)\n!\n! RC sends LSAck to RA:\n! [RC → RA] LSAck: Type1 LSID=10.10.10.2 (confirms receipt)\n!\n! RC runs SPF:\n! OSPF: SPF complete — routes to RB\'s subnets removed\n!\nshow ip ospf database  ! on RC after flooding\n! Router LSAs: RA, RC (RB removed — MaxAge purged)\n! Summary LSAs: still present (Type3 not affected by intra-area failure)',
    rfc:'RFC 2328 §13.3 — MaxAge LSA flooding and purging procedure',
    highlightedRouters:['RA','RC'],
    bfdLinks:[{a:'RA',b:'RC'}],failedLinks:[{a:'RA',b:'RB'}],
    routerStatus:{RA:'Flooding MaxAge LSU',RB:'removed from LSDB',RC:'SPF running locally'},
    timerRows:[
      {name:'RA floods',value:'MaxAge LSU',note:'RB Router LSA flooded at age=3600 to purge it'},
      {name:'RC acknowledges',value:'LSAck',note:'Stops RA retransmit timer — reliable delivery'},
      {name:'RC SPF',value:'Triggered',note:'RC runs its own SPF after MaxAge purge'},
      {name:'Flood scope',value:'Area 0 only',note:'Type 1 LSAs don\'t cross area boundaries'},
    ],
    flood:{from:'RA',to:'RC',type:'LSU'},
    pktBadge:'OSPF LSU · MaxAge Flood (Reconvergence)',
    pktFields:[
      {f:'LSA Type',v:'1 (Router)',n:'RB\'s Router LSA being purged'},
      {f:'LS Age',v:'3600 (MaxAge)',n:'Signals all routers to delete this LSA'},
      {f:'Adv. Router',v:'10.10.10.2 (RB)',n:'Original originator — being withdrawn'},
      {f:'Seq Number',v:'0x80000006',n:'Incremented by RA to override any cached copy'},
    ],
  },
  {
    title:'Step 7 — Complete Reconvergence Timeline & Tuning Guide',
    log:'Full timeline: BFD+SPF reconvergence event log and optimization guide',
    desc:'<b>Complete reconvergence event log</b> with BFD at 50ms/×3:<br><br>• <b>t=0ms:</b> Physical link RA-RB fails<br>• <b>t=50ms:</b> BFD hello #1 missed<br>• <b>t=100ms:</b> BFD hello #2 missed<br>• <b>t=150ms:</b> BFD hello #3 missed → BFD declares DOWN, calls OSPF<br>• <b>t=150ms:</b> OSPF removes RB, floods MaxAge LSU, queues SPF<br>• <b>t=200ms:</b> spf-start timer expires → Dijkstra starts<br>• <b>t=228ms:</b> Dijkstra completes (28ms on small LSDB)<br>• <b>t=235ms:</b> OSPF RIB updated<br>• <b>t=245ms:</b> Global RIB updated (show ip route)<br>• <b>t=265ms:</b> CEF/FIB programmed → hardware forwards correctly<br>• <b>t=265ms:</b> RC receives MaxAge LSU, runs SPF (~30ms)<br>• <b>t=295ms:</b> RC FIB updated<br><br><b>Total: ~265-295ms end-to-end</b> vs 40,000ms+ without BFD.',
    cli:'! Optimal Cisco IOS configuration for BFD + fast SPF:\ninterface GigabitEthernet0/0\n bfd interval 50 min_rx 50 multiplier 3\n!\nrouter ospf 1\n bfd all-interfaces\n timers throttle spf 50 100 5000\n ! ↑ start=50ms  ↑ hold=100ms  ↑ max=5s\n timers throttle lsa 10 100 5000\n ! LSA throttle too — prevents LSA storm\n!\n! Verify reconvergence quality:\nshow ip ospf statistics\nshow ip ospf statistics detail  ! per-LSA and per-SPF breakdown\nshow ip ospf neighbor  ! confirm BFD active on all neighbors\nshow bfd neighbors  ! confirm all sessions UP\n!\n! Platform-specific optimization:\n! IOS-XR: hw-module profile bfd hw-offload enable\n! Nexus: bfd interval 250 min_rx 250 multiplier 3',
    rfc:'RFC 5882 §4 — BFD-OSPF integration | RFC 2328 §16 — SPF computation',
    rule:'<b>Tuning summary:</b><br>• Production LAN: BFD 50ms×3=150ms + SPF 50ms = ~265ms total<br>• Production WAN: BFD 300ms×3=900ms + SPF 50ms = ~1s total<br>• Conservative (large net): BFD 500ms×3 + SPF 200ms = ~1.7s total<br>• Never below 50ms on software platforms — risk of false positives under CPU load',
    highlightedRouters:['RA','RC'],
    bfdLinks:[{a:'RA',b:'RC'}],failedLinks:[{a:'RA',b:'RB'}],
    routerStatus:{RA:'Converged ✔ 265ms',RB:'down',RC:'Converged ✔ 295ms'},
    timerRows:[
      {name:'BFD detection',value:'0→150ms',note:'3 × 50ms hellos missed'},
      {name:'SPF delay',value:'+50ms',note:'spf-start timer batches changes'},
      {name:'Dijkstra runtime',value:'+28ms',note:'Small LSDB — large nets take longer'},
      {name:'RIB+FIB update',value:'+17ms',note:'Pipeline: OSPF RIB → global RIB → CEF'},
      {name:'Total RA',value:'~265ms',note:'Traffic rerouted on RA'},
      {name:'Total RC',value:'~295ms',note:'RC also reconverges after receiving MaxAge flood'},
    ],
    flood:null,pktFields:null,
  },
],

/* ══════════════════════════════════════
   BFD — COMPARISON TABLE
══════════════════════════════════════ */
bfd_compare: [
  {
    title:'Step 1 — BFD vs Traditional OSPF: Full Convergence Comparison',
    log:'Comparison: BFD vs no-BFD convergence timeline (4 scenarios)',
    showTimeline:true,
    desc:'<b>This animated timeline compares four convergence scenarios:</b><br><br>1. <b>No BFD, default timers</b> (40s dead timer) — worst case for production<br>2. <b>No BFD, aggressive Hello</b> (1s dead timer) — better but still slow, high overhead<br>3. <b>BFD 300ms</b> — conservative production setting, works on software platforms<br>4. <b>BFD 50ms</b> — aggressive sub-second detection, dedicated hardware required<br><br>Each scenario shows the phases: link failure → detection → SPF → RIB/FIB update. The x-axis is proportional — notice how BFD compresses the detection window from 40 seconds down to 150ms.',
    rfc:'RFC 5880/5882 — BFD | RFC 2328 §9.5 — Hello/Dead timers',
    timerRows:[
      {name:'No BFD default',value:'40s+',note:'Default OSPF dead timer — unacceptable for most apps'},
      {name:'No BFD 1s Dead',value:'3-5s',note:'Tuned aggressive Hello/Dead timers — better'},
      {name:'BFD 300ms',value:'~1s',note:'Conservative BFD — safe for most hardware'},
      {name:'BFD 50ms',value:'~250ms',note:'Aggressive BFD — hardware platform required'},
    ],
    timeAxis:['0','50ms','150ms','300ms','1s','3s','10s','40s+'],
    timelines:[
      {
        label:'BFD 50ms',color:'#22c55e',totalMs:'~250ms',
        segments:[
          {start:0,end:0.02,color:'#ef4444',label:'Fail'},
          {start:0.02,end:0.06,color:'#22c55e',label:'BFD 150ms'},
          {start:0.06,end:0.09,color:'#f59e0b',label:'SPF'},
          {start:0.09,end:0.11,color:'#8b5cf6',label:'RIB'},
        ]
      },
      {
        label:'BFD 300ms',color:'#3b82f6',totalMs:'~1s',
        segments:[
          {start:0,end:0.02,color:'#ef4444',label:'Fail'},
          {start:0.02,end:0.18,color:'#3b82f6',label:'BFD 900ms detect'},
          {start:0.18,end:0.22,color:'#f59e0b',label:'SPF'},
          {start:0.22,end:0.25,color:'#8b5cf6',label:'RIB'},
        ]
      },
      {
        label:'Hello 1s Dead',color:'#f59e0b',totalMs:'~3-5s',
        segments:[
          {start:0,end:0.02,color:'#ef4444',label:'Fail'},
          {start:0.02,end:0.58,color:'#6b7280',label:'Dead Timer (3s)'},
          {start:0.58,end:0.65,color:'#f59e0b',label:'SPF'},
          {start:0.65,end:0.70,color:'#8b5cf6',label:'RIB'},
        ]
      },
      {
        label:'No BFD 40s',color:'#ef4444',totalMs:'40s+',
        segments:[
          {start:0,end:0.01,color:'#ef4444',label:'Fail'},
          {start:0.01,end:0.96,color:'#374151',label:'Waiting Dead Timer (40s)...'},
          {start:0.96,end:0.99,color:'#f59e0b',label:'SPF'},
          {start:0.99,end:1.0,color:'#8b5cf6',label:'RIB'},
        ]
      },
    ],
    legendItems:[
      {color:'#ef4444',label:'Link Failure'},{color:'#22c55e',label:'BFD Detect (fast)'},
      {color:'#3b82f6',label:'BFD Detect (slow)'},{color:'#6b7280',label:'Dead Timer Wait'},
      {color:'#374151',label:'Long Wait'},{color:'#f59e0b',label:'SPF'},{color:'#8b5cf6',label:'RIB Update'},
    ],
    highlightedRouters:[],bfdLinks:[],failedLinks:[],routerStatus:{RA:'',RB:'',RC:''},
    flood:null,pktFields:null,
  },
  {
    title:'Step 2 — Why Aggressive Hello/Dead Timers Alone Are Not Enough',
    log:'Hello tuning: sub-second Hellos cause CPU overhead — BFD is better',
    desc:'Before BFD existed, engineers tried to achieve fast convergence by tuning OSPF Hello/Dead timers aggressively (e.g., Hello=250ms, Dead=1s). This approach has serious problems:<br><br><b>1. CPU overhead:</b> OSPF Hellos are processed by the router CPU (not the forwarding plane). At 250ms intervals, a router with 100 neighbors processes <b>400 Hellos per second</b> — a massive CPU burden.<br><br><b>2. Scaling fails:</b> Works fine with 2-3 neighbors; becomes a CPU storm on a large broadcast segment (e.g., hub-and-spoke Frame Relay or 50-router broadcast LAN).<br><br><b>3. False positives under load:</b> When the router CPU is busy (routing table churn, BGP updates), it may not process Hellos in time → spurious adjacency resets → oscillating neighbors.<br><br><b>BFD solves all these:</b> Runs in the forwarding plane, scales to many sessions, hardware-offloadable.',
    cli:'! Aggressive Hello config (the old way — not recommended):\ninterface GigabitEthernet0/0\n ip ospf hello-interval 1\n ip ospf dead-interval 3\n!\n! Problem: on 50-neighbor LAN segment:\n! 50 neighbors × 4 Hellos/sec = 200 Hellos/sec CPU overhead\n!\n! BFD equivalent (forwarding-plane, scales):\ninterface GigabitEthernet0/0\n bfd interval 50 min_rx 50 multiplier 3\n!\nrouter ospf 1\n bfd all-interfaces\n ! Zero additional CPU per extra neighbor at forwarding plane level',
    rfc:'RFC 2328 §9.5 — Hello/Dead interval configuration; BFD comparison RFC 5880 §1',
    rule:'<b>Rule of thumb:</b> Use BFD instead of aggressive Hellos whenever sub-second failure detection is required. OSPF Hellos should remain at default (10s/40s) when BFD is deployed — they serve as a backup detection mechanism, not the primary one.',
    highlightedRouters:['RA','RB','RC'],
    bfdLinks:[{a:'RA',b:'RB'},{a:'RB',b:'RC'}],failedLinks:[],
    routerStatus:{RA:'BFD preferred',RB:'BFD preferred',RC:'BFD preferred'},
    timerRows:[
      {name:'Aggressive Hello',value:'250ms/1s',note:'CPU-based — 400 pkts/sec per 100 neighbors'},
      {name:'BFD 50ms',value:'50ms/×3',note:'Forwarding plane — hardware-offloadable'},
      {name:'Hello CPU load',value:'Scales badly',note:'50 neighbors × 4Hz = 200 Hellos/sec to CPU'},
      {name:'BFD CPU load',value:'Near zero',note:'Hardware forwarding plane — no CPU involvement'},
    ],
    flood:{from:'RA',to:'RB',type:'Hello'},
    pktBadge:'OSPF Hello · Legacy Fast Hello (inefficient)',
    pktFields:[
      {f:'Hello interval',v:'1 second',n:'Aggressive — but still CPU-processed'},
      {f:'Dead interval',v:'3 seconds',n:'3× Hello — minimum per RFC 2328'},
      {f:'CPU overhead',v:'HIGH',n:'Every Hello processed by OSPF process on CPU'},
      {f:'BFD alternative',v:'50ms / forwarding plane',n:'100× faster, near-zero CPU'},
    ],
  },
  {
    title:'Step 3 — BFD Hardware Offload: Platforms and Capabilities',
    log:'BFD hardware offload: line-card offload vs software BFD comparison',
    desc:'BFD\'s real power comes from <b>hardware offloading</b> on modern network platforms. When BFD is offloaded to the forwarding ASIC or line card, it runs independently of the route processor CPU:<br><br><b>Software BFD (IOS on Route Processor):</b><br>• Minimum interval: ~50ms practical (timer jitter on shared CPU)<br>• False positive risk: high under CPU load<br>• Suitable for: campus routing, small-medium WAN<br><br><b>Hardware BFD (line-card / ASIC offloaded):</b><br>• Minimum interval: 3-10ms (sub-10ms detection!)<br>• No CPU involvement for periodic hellos<br>• Suitable for: carrier/ISP core, data center fabric<br>• Platforms: Cisco ASR9K, NCS, IOS-XR; Nexus ASIC; Juniper MX<br><br>Even without hardware offload, BFD at 300ms is still <b>100× better</b> than OSPF dead timer.',
    cli:'! Check if BFD is hardware-offloaded:\nshow bfd neighbors detail\n! Session state is UP and using echo function with 50ms interval\n! Hardware BFD: Enabled  ← hardware offload active\n!\n! IOS-XR hardware BFD:\nshow bfd session\n! Interface  Dest Addr  Local det time (int×mult)  State  Echo  Async  H/W NPU\n! Gi0/0/0/0  10.0.0.2   150ms(50ms×3)             Up     Yes   Yes    Yes  0/0/CPU0\n!\n! Nexus BFD hardware offload:\nshow bfd neighbors detail\n! Hardware offload: Yes  Minimum interval: 3ms\n!\n! Check platform BFD minimums:\nshow bfd drops  ! shows if BFD packets were dropped due to rate limits',
    rfc:'RFC 5880 §1 — BFD designed for forwarding-plane implementation',
    rule:'<b>Platform selection for sub-100ms BFD:</b> You MUST use a platform with hardware BFD support. Attempting 3ms BFD on a software-only platform (Cisco ISR, basic IOS) will cause constant false positives — the CPU cannot guarantee that precise a timing. Always verify with <code>show bfd neighbors detail</code> → "Hardware BFD: Enabled".',
    highlightedRouters:['RA','RB','RC'],
    bfdLinks:[{a:'RA',b:'RB'},{a:'RB',b:'RC'}],failedLinks:[],bfdInterval:50,
    routerStatus:{RA:'BFD: HW offload ✔',RB:'BFD: HW offload ✔',RC:'BFD: HW offload ✔'},
    timerRows:[
      {name:'Software BFD min',value:'50ms practical',note:'CPU timer jitter limits reliable minimum'},
      {name:'HW BFD min',value:'3-10ms',note:'ASIC-timed — no CPU jitter'},
      {name:'Software CPU load',value:'Shared CPU',note:'Risk of false positives under load'},
      {name:'HW offload CPU load',value:'Zero',note:'Line card handles BFD independently'},
    ],
    flood:{from:'RA',to:'RB',type:'BFD'},
    pktBadge:'BFD Control · Hardware Offloaded',
    pktFields:[
      {f:'Processing',v:'Line card ASIC',n:'Not sent to Route Processor CPU'},
      {f:'Timer accuracy',v:'±1ms',n:'Hardware timer — no OS jitter'},
      {f:'Min interval',v:'3ms capable',n:'Sub-10ms detection on HW platforms'},
      {f:'CPU involvement',v:'Setup only',n:'CPU only involved during session setup, not hellos'},
    ],
  },
  {
    title:'Step 4 — False Positives: When BFD Causes Unnecessary Flaps',
    log:'BFD false positives: too-aggressive timers → flapping adjacencies',
    desc:'BFD can cause problems if configured too aggressively for the platform. <b>False positives</b> occur when BFD declares a neighbor down even though the path is still healthy:<br><br><b>Common causes:</b><br>• <b>CPU overload:</b> Software BFD on a busy router misses its own TX window → peer doesn\'t receive hello → peer declares DOWN<br>• <b>Control plane policing (CoPP):</b> BFD packets rate-limited by CoPP policy → missed at high rates<br>• <b>High CPU during BGP convergence:</b> BFD share CPU with BGP route installs — BFD timers slip<br>• <b>QoS misconfiguration:</b> BFD UDP packets not classified into high-priority queue → queued behind bulk data<br><br><b>Symptoms:</b> OSPF/BGP adjacency bounces repeatedly; <code>show bfd drops</code> shows dropped BFD packets; syslog shows BFD UP/DOWN cycling.',
    cli:'! Diagnosing BFD false positives:\nshow bfd drops\n! Interface: Gi0/0\n!   Input: 0   Output: 47  ← outbound BFD drops! (CoPP/QoS issue)\n\nshow bfd neighbors detail\n! Registered protocols: OSPF\n! Uptime: 00:00:03  ← was just reset! flapping!\n\n! Fix 1: Raise BFD interval:\nbfd interval 300 min_rx 300 multiplier 3\n! → less aggressive, less false-positive risk\n\n! Fix 2: CoPP exception for BFD:\nip access-list extended BFD_ACL\n permit udp any any eq 3784  ! single-hop BFD\n permit udp any any eq 4784  ! multi-hop BFD\n!\nclass-map BFD_CLASS\n match access-group name BFD_ACL\n!\npolicy-map CoPP\n class BFD_CLASS\n  police rate 8000 pps  ! allow BFD packets\n\n! Fix 3: QoS — mark BFD as CS6 (network control):\ninterface Gi0/0\n service-policy input MARK_BFD',
    rfc:'RFC 5880 §6.8.6 — BFD demand mode to reduce packet rate | §6.8.7 — CoPP considerations',
    rule:'<b>If BFD is flapping:</b> (1) Increase interval to 300-500ms first. (2) Check <code>show bfd drops</code>. (3) Verify CoPP is not rate-limiting BFD UDP port 3784. (4) Check QoS — BFD must be in the highest-priority queue. (5) Consider hardware offload platform upgrade.',
    highlightedRouters:['RA','RB'],
    bfdLinks:[{a:'RA',b:'RB'}],failedLinks:[],bfdInterval:50,
    routerStatus:{RA:'BFD: flapping! ⚠',RB:'BFD: flapping! ⚠',RC:'unaffected'},
    timerRows:[
      {name:'show bfd drops',value:'Check for drops',note:'Outbound drops = CoPP or QoS issue'},
      {name:'CoPP rate-limit',value:'Common cause',note:'BFD UDP 3784 not exempted from policing'},
      {name:'Fix: raise interval',value:'300ms+',note:'Reduces false positive risk on busy CPUs'},
      {name:'Fix: CoPP exception',value:'BFD UDP 3784',note:'Ensure BFD UDP is not policed aggressively'},
    ],
    flood:{from:'RA',to:'RB',type:'BFD'},
    pktBadge:'BFD Control · Flapping (False Positive)',
    pktFields:[
      {f:'BFD State',v:'DOWN (false positive)',n:'Neighbor still alive — BFD packet was dropped'},
      {f:'OSPF reaction',v:'Adjacency reset!',n:'OSPF receives BFD callback → tears down neighbor'},
      {f:'Root cause',v:'CoPP drop / CPU busy',n:'BFD packet never sent or received due to overload'},
      {f:'Fix',v:'Raise interval / CoPP',n:'300ms+ interval or exempt BFD from rate-limiting'},
    ],
  },
  {
    title:'Step 5 — BFD for Multi-Area OSPF + ABR Considerations',
    log:'BFD with ABRs: inter-area BFD, VL + BFD incompatibility',
    desc:'When deploying BFD in a multi-area OSPF network, several important design rules apply:<br><br><b>1. BFD applies to direct physical neighbors only</b> (single-hop). Each physical link between OSPF neighbors gets its own BFD session. BFD does not follow LSA flooding paths.<br><br><b>2. ABR physical links are fully BFD-capable:</b> An ABR (like R3 in our topology) has physical interfaces in both Area 0 and Area 1. Each physical OSPF adjacency can have its own BFD session.<br><br><b>3. Virtual Links cannot use single-hop BFD:</b> A VL traverses multiple hops through a transit area. Single-hop BFD (RFC 5880) doesn\'t work across multiple hops. Multi-hop BFD (RFC 5883, port 4784) could be applied, but it\'s not commonly deployed for VLs.<br><br><b>4. BFD failure is area-local:</b> A BFD-detected failure on a physical link triggers OSPF neighbor teardown only for that link\'s OSPF adjacency. LSA flooding then propagates the topology change to the rest of the network.',
    cli:'! BFD on ABR (R3) — Area 0 interface:\ninterface GigabitEthernet0/0  ! Area 0 link\n bfd interval 50 min_rx 50 multiplier 3\n!\n! BFD on ABR (R3) — Area 1 interface:\ninterface GigabitEthernet0/1  ! Area 1 link (toward R2)\n bfd interval 50 min_rx 50 multiplier 3\n!\nrouter ospf 1\n bfd all-interfaces\n!\n! Verify BFD on all interfaces:\nshow bfd neighbors\n! NeighAddr    LD/RD      RH/RS  State  Int\n! 10.0.0.4   4097/4098  Up/Up   Up    Gi0/0  ← Area 0 neighbor\n! 10.1.0.2   4099/4100  Up/Up   Up    Gi0/1  ← Area 1 neighbor (R2)\n!\n! Virtual link — BFD NOT applicable (multi-hop):\nshow ip ospf virtual-links\n! VL OSPF_VL0 to 2.2.2.2 — no BFD (VL is multi-hop)',
    rfc:'RFC 5882 §3 — BFD for OSPF: one BFD session per OSPF neighbor interface',
    rule:'<b>BFD + Virtual Link:</b> Standard single-hop BFD (RFC 5880) cannot monitor a virtual link because the VL traverses multiple physical hops. If fast VL failure detection is critical, the solution is to add a direct physical link between the areas (eliminating the VL) and then apply BFD to that physical link.',
    highlightedRouters:['RA','RB','RC'],
    bfdLinks:[{a:'RA',b:'RB'},{a:'RB',b:'RC'}],failedLinks:[],bfdInterval:50,
    routerStatus:{RA:'BFD: 2 sessions',RB:'BFD: ABR mid',RC:'BFD: 2 sessions'},
    timerRows:[
      {name:'BFD scope',value:'Physical link only',note:'Single-hop — one BFD session per physical adjacency'},
      {name:'ABR support',value:'Full',note:'Each physical interface on ABR gets own BFD session'},
      {name:'VL + BFD',value:'NOT supported',note:'VL is multi-hop — single-hop BFD cannot monitor it'},
      {name:'Multi-hop BFD',value:'RFC 5883 port 4784',note:'Could track VL path but rarely deployed in practice'},
    ],
    flood:null,pktFields:null,
  },
  {
    title:'Step 6 — BFD Configuration Verification Commands',
    log:'Show commands: verify BFD + OSPF integration',
    desc:'<b>Key verification commands for BFD + OSPF on Cisco IOS/IOS-XE:</b><br><br><code>show bfd neighbors</code> — list all BFD sessions and their state<br><code>show bfd neighbors detail</code> — full session parameters (TX/RX/mult, hardware offload status, uptime)<br><code>show ip ospf neighbor</code> — verify OSPF neighbor shows BFD-registered<br><code>show ip ospf statistics</code> — SPF run count and timing (how many SPFs have run)<br><code>show ip ospf statistics detail</code> — per-LSA and per-SPF breakdown<br><code>debug bfd</code> — real-time BFD state machine events (careful — verbose!)<br><code>show bfd drops</code> — check if BFD packets are being dropped by CoPP or QoS<br><br><b>Health check flow:</b> Start with <code>show bfd neighbors</code> — all sessions should be UP. Then check <code>show ip ospf neighbor</code> — neighbor State should be FULL and adjacency stable (no frequent flaps in syslog).',
    cli:'show bfd neighbors\n! NeighAddr        LD/RD    RH/RS    State   Int\n! 10.0.0.2       4097/4098  Up/Up   Up      Gi0/0\n! 10.0.0.6       4099/4100  Up/Up   Up      Gi0/1\n\nshow bfd neighbors detail\n! Session state is UP and using echo function with 50ms interval\n! Registered protocols: OSPF\n! Uptime: 02:14:33  ← stable (hours, not seconds)\n! TX interval: 50ms, RX interval: 50ms, Multiplier: 3\n\nshow ip ospf neighbor\n! Neighbor ID    State  Dead Time  Address    Interface\n! 10.10.10.2     FULL/- 00:00:36   10.0.0.2   Gi0/0  BFD enabled\n\nshow ip ospf statistics\n! Area 0: SPF runs: 3, Last: 02:11:20, Duration 28ms\n! (low SPF count = stable topology)\n\nshow bfd drops  ! should show 0\n! BFD packet drops: Input: 0  Output: 0  ← healthy',
    rfc:'RFC 5882 §4 — BFD-OSPF integration',
    rule:'<b>Common BFD misconfiguration:</b> Configuring BFD on only ONE side. BFD requires both neighbors to be configured — if only one end has BFD and the link fails, the BFD-enabled end detects immediately, but the other end still waits for the dead timer. Always configure BFD bilaterally.',
    highlightedRouters:['RA','RB','RC'],bfdLinks:[{a:'RA',b:'RB'},{a:'RB',b:'RC'}],failedLinks:[],bfdInterval:50,
    routerStatus:{RA:'BFD: UP ✔',RB:'BFD: UP ✔',RC:'BFD: UP ✔'},
    timerRows:[
      {name:'show bfd neighbors',value:'All UP',note:'Verify both sessions established'},
      {name:'show ip ospf nbr',value:'BFD enabled',note:'Confirms OSPF registered with BFD'},
      {name:'show ip ospf stats',value:'SPF count+time',note:'Monitor for excessive SPF churn'},
      {name:'show bfd drops',value:'Should be 0',note:'Any drops = CoPP or QoS misconfiguration'},
    ],
    flood:null,pktFields:null,
  },
  {
    title:'Step 7 — BFD Design Best Practices & Production Checklist',
    log:'BFD production checklist: design, deployment, and monitoring guidance',
    desc:'<b>Complete BFD + OSPF production deployment checklist:</b><br><br><b>Design Phase:</b><br>✔ Identify which links require sub-second detection (transit links, not stub edges)<br>✔ Select BFD interval based on platform capability (50ms HW, 300ms SW)<br>✔ Plan for CoPP exceptions for BFD UDP ports 3784/4784<br><br><b>Configuration Phase:</b><br>✔ Configure BFD bilaterally on ALL routers sharing a link<br>✔ Match or confirm interval negotiation (show bfd neighbors detail → Actual TX)<br>✔ Tune SPF timers to complement BFD speed (spf-start 50ms, spf-hold 100ms)<br>✔ Set LSA throttle timers to match (lsa throttle 10ms 100ms 5000ms)<br><br><b>Verification Phase:</b><br>✔ All BFD sessions show UP — uptime in hours, not seconds<br>✔ OSPF neighbors FULL + BFD enabled in show output<br>✔ BFD drops = 0 (no CoPP/QoS issues)<br>✔ SPF run count stable (not constantly running)<br><br><b>Monitoring:</b><br>✔ SNMP trap for BFD session state change (bfdSessDown MIB)<br>✔ Syslog alert on %BFD-6-BFD_SESS_DESTROYED or %OSPF-5-ADJCHG BFD',
    cli:'! Complete production BFD + OSPF config:\ninterface GigabitEthernet0/0\n description === CORE LINK — BFD ENABLED ===\n bfd interval 50 min_rx 50 multiplier 3\n ip ospf 1 area 0\n!\nrouter ospf 1\n bfd all-interfaces\n timers throttle spf 50 100 5000\n timers throttle lsa 10 100 5000\n!\n! CoPP — allow BFD packets (do this first!):\nip access-list extended BFD_PERMIT\n permit udp any any eq 3784\n permit udp any any eq 4784\n!\nclass-map match-all BFD\n match access-group name BFD_PERMIT\npolicy-map CoPP_POLICY\n class BFD\n  police rate 8000 pps conform-action transmit exceed-action drop\n!\n! SNMP BFD monitoring:\nsnmp-server enable traps bfd\nsnmp-server host <NMS_IP> traps bfd\n!\n! Final verification:\nshow bfd neighbors  ! all UP\nshow ip ospf neighbor  ! all FULL + BFD enabled\nshow bfd drops  ! all zeros\nshow ip ospf statistics  ! low SPF count',
    rfc:'RFC 5882 — BFD for OSPF | RFC 5880 — BFD core protocol',
    rule:'<b>Summary — BFD vs alternatives:</b><br>• BFD 50ms: 150ms detection, HW required, 148× faster than 40s Dead Timer<br>• BFD 300ms: 900ms detection, SW capable, 44× faster<br>• OSPF Hello 1s/Dead 3s: 3s detection, high CPU, scaling issues<br>• OSPF default 10s/40s: 40s detection, zero overhead, lowest reliability<br>For ANY production network carrying voice, video, or financial transactions — deploy BFD.',
    highlightedRouters:['RA','RB','RC'],
    bfdLinks:[{a:'RA',b:'RB'},{a:'RB',b:'RC'}],failedLinks:[],bfdInterval:50,
    routerStatus:{RA:'Production ready ✔',RB:'Production ready ✔',RC:'Production ready ✔'},
    timerRows:[
      {name:'BFD 50ms HW',value:'150ms detect',note:'Best-in-class — HW platform required'},
      {name:'BFD 300ms SW',value:'900ms detect',note:'Software platforms — safe, scalable'},
      {name:'OSPF Hello 1s',value:'3s detect',note:'Legacy — high CPU, scaling issues'},
      {name:'OSPF default',value:'40s detect',note:'Worst — never acceptable for production transit'},
    ],
    flood:{from:'RA',to:'RB',type:'BFD'},
    pktBadge:'BFD Control · Production Steady-State',
    pktFields:[
      {f:'BFD State',v:'UP',n:'Stable session — uptime hours'},
      {f:'TX interval',v:'50ms negotiated',n:'Hardware-timed — no jitter'},
      {f:'OSPF adjacency',v:'FULL',n:'OSPF relies on BFD for failure detection'},
      {f:'Detection time',v:'150ms',n:'148× faster than OSPF Dead Timer default'},
      {f:'CoPP',v:'Exempted',n:'BFD UDP 3784 bypasses rate-limiting'},
    ],
  },
],
}; // End FC_STEP_DATA