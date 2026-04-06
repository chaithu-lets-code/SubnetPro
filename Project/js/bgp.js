    // ═══════════════════════════════════════════════════════════
  // BGP ANIMATIONS HUB
  // Built for SubnetLab Pro — Chaithanya Kumar Katari
  // ═══════════════════════════════════════════════════════════

  var BGP_TOPICS = [
    {id:'fsm',       icon:'🔄', title:'BGP FSM',       sub:'6-State Machine',        badge:'FSM',   bg:'rgba(91,156,246,0.15)',  col:'#5b9cf6'},
    {id:'msgs',      icon:'📨', title:'Message Types', sub:'OPEN·UPDATE·KA·NOTIF',   badge:'MSG',   bg:'rgba(56,217,192,0.15)',  col:'#38d9c0'},
    {id:'peers',     icon:'🔗', title:'iBGP vs eBGP',  sub:'Peering Modes',          badge:'PEER',  bg:'rgba(74,222,128,0.15)',  col:'#4ade80'},
    {id:'bestpath',  icon:'🏆', title:'Best Path',     sub:'LP · AS-PATH · MED',     badge:'ALGO',  bg:'rgba(251,191,36,0.15)',  col:'#fbbf24'},
    {id:'rr',        icon:'⭐', title:'Route Reflector',sub:'vs Full Mesh',           badge:'RR',    bg:'rgba(244,114,182,0.15)', col:'#f472b6'},
    {id:'community', icon:'🏷', title:'Communities',   sub:'Policy Tags',            badge:'COMM',  bg:'rgba(167,139,250,0.15)', col:'#a78bfa'},
    {id:'aggregate', icon:'🗜', title:'Aggregation',   sub:'Route Summarization',    badge:'AGG',   bg:'rgba(56,217,192,0.15)',  col:'#38d9c0'},
    {id:'multihome', icon:'🌐', title:'Multihoming',   sub:'Traffic Engineering',    badge:'MHOME', bg:'rgba(251,191,36,0.15)',  col:'#fbbf24'}
  ];

  var BA = {
    current:'fsm', animId:null, frame:0, t:0,
    paused:false, speed:1, step:0, packets:[], phase:0,
    canvas:null, ctx:null, W:0, H:0
  };

  // ── Init ──
  function bgpAnimInit() {
    var grid = document.getElementById('bgpAnimGrid');
    BGP_TOPICS.forEach(function(t) {
      var d = document.createElement('div');
      d.className = 'bgpanim-card' + (t.id==='fsm'?' active':'');
      d.id = 'bgpcard-'+t.id;
      d.innerHTML =
        '<div class="bgpanim-card-icon">'+t.icon+'</div>'+
        '<div class="bgpanim-card-title">'+t.title+'</div>'+
        '<div class="bgpanim-card-sub">'+t.sub+'</div>'+
        '<div class="bgpanim-card-badge" style="background:'+t.bg+';color:'+t.col+'">'+t.badge+'</div>';
      d.onclick = function(){ bgpAnimLoad(t.id); };
      grid.appendChild(d);
    });
    BA.canvas = document.getElementById('bgp-anim-canvas');
    BA.ctx    = BA.canvas.getContext('2d');
    bgpAnimResize();
    window.addEventListener('resize', bgpAnimResize);
    bgpAnimLoad('fsm');
  }

  function bgpAnimResize() {
    var c = BA.canvas;
    c.width  = c.parentElement.offsetWidth;
    c.height = 420;
    BA.W = c.width; BA.H = c.height;
  }

  function bgpAnimLoad(id) {
    if (BA.animId) { cancelAnimationFrame(BA.animId); BA.animId=null; }
    BA.current=id; BA.frame=0; BA.t=0; BA.step=0; BA.phase=0;
    BA.packets=[]; BA.paused=false;
    // Reset per-anim state
    fsmActive=0; fsmHoldTime=0;
    msgStep=0; msgPkt=null; msgHold=0; msgDone=false; msgLog=[];
    peersPackets=[]; peersTimer=0; peersPhase=0; peersPhaseTimer=0;
    bpStep=0; bpTimer=0;
    rrPackets=[]; rrTimer=0; rrPhase=0; rrPhaseTimer=0; rrActiveSender=0;
    commTimer=0; commActiveRoute=-1; commPackets=[];
    aggTimer=0; aggPhase=0;
    mhPackets=[]; mhTimer=0; mhPhaseTimer=0; mhMode='inbound';
    BGP_TOPICS.forEach(function(t){
      var c=document.getElementById('bgpcard-'+t.id);
      if(c) c.className='bgpanim-card'+(t.id===id?' active':'');
    });
    var topic = BGP_TOPICS.find(function(t){return t.id===id;});
    if(topic) document.getElementById('bgpAnimCanvasTitle').textContent = topic.icon+'  '+topic.title+' — '+topic.sub;
    document.getElementById('bgpAnimPlayBtn').textContent = '⏸ Pause';
    ['slow','normal','fast'].forEach(function(x){
        var el=document.getElementById('bspeed-'+x);
        if(el) el.classList.remove('active');
      });
      var slowBtn=document.getElementById('bspeed-slow');
      if(slowBtn) slowBtn.classList.add('active');
      BA.speed=0.3;
    bgpAnimTick();
  }

  function bgpAnimTick() {
    if (!BA.paused) { BA.frame++; BA.t += 0.016 * BA.speed; }
    var ctx=BA.ctx, W=BA.W, H=BA.H;
    ctx.clearRect(0,0,W,H);
    // grid bg
    ctx.save(); ctx.strokeStyle='rgba(91,156,246,0.04)'; ctx.lineWidth=1;
    for(var x=0;x<W;x+=48){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
    for(var y=0;y<H;y+=48){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
    ctx.restore();
    switch(BA.current){
      case 'fsm':       bgpDrawFSM(ctx,W,H); break;
      case 'msgs':      bgpDrawMsgs(ctx,W,H); break;
      case 'peers':     bgpDrawPeers(ctx,W,H); break;
      case 'bestpath':  bgpDrawBestPath(ctx,W,H); break;
      case 'rr':        bgpDrawRR(ctx,W,H); break;
      case 'community': bgpDrawCommunity(ctx,W,H); break;
      case 'aggregate': bgpDrawAggregate(ctx,W,H); break;
      case 'multihome': bgpDrawMultihome(ctx,W,H); break;
    }
    BA.animId = requestAnimationFrame(bgpAnimTick);
  }

  function bgpAnimTogglePlay() {
    BA.paused = !BA.paused;
    document.getElementById('bgpAnimPlayBtn').textContent = BA.paused ? '▶ Play' : '⏸ Pause';
  }
  function bgpAnimReset() { bgpAnimLoad(BA.current); }
  function bgpAnimSetSpeed(s, btn) {
    BA.speed = s;
    document.querySelectorAll('.bac-speed-btn').forEach(function(b){b.classList.remove('active');});
    if(btn) btn.classList.add('active');
  }
  function bgpSetStep(num, tag, tagBg, tagCol, title, desc) {
    document.getElementById('bgpAnimStepNum').textContent = num;
    var t = document.getElementById('bgpAnimTag');
    t.textContent=tag; t.style.background=tagBg; t.style.color=tagCol;
    document.getElementById('bgpAnimTitle').textContent = title;
    document.getElementById('bgpAnimDesc').textContent  = desc;
  }

  // ══ SHARED DRAWING UTILITIES ══════════════════════════════

  function drawRouter(ctx, x, y, r, ringColor, label, sublabel, glow) {
    if (glow) {
      var g = ctx.createRadialGradient(x,y,r*0.5,x,y,r*2.8);
      g.addColorStop(0, hexA(ringColor,0.35)); g.addColorStop(1,'transparent');
      ctx.beginPath(); ctx.arc(x,y,r*2.8,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
    }
    ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2);
    ctx.strokeStyle=ringColor; ctx.lineWidth=2.5; ctx.stroke();
    ctx.beginPath(); ctx.arc(x,y,r-3,0,Math.PI*2);
    ctx.fillStyle='rgba(12,15,26,0.92)'; ctx.fill();
    // crosshair icon
    ctx.strokeStyle=ringColor; ctx.lineWidth=1.5;
    var cr = r*0.38;
    ctx.beginPath(); ctx.arc(x,y,cr*0.38,0,Math.PI*2); ctx.stroke();
    [[x-cr*0.47,y,x-cr,y],[x+cr*0.47,y,x+cr,y],[x,y-cr*0.47,x,y-cr],[x,y+cr*0.47,x,y+cr]].forEach(function(l){
      ctx.beginPath(); ctx.moveTo(l[0],l[1]); ctx.lineTo(l[2],l[3]); ctx.stroke();
    });
    if (label) {
      ctx.save(); ctx.fillStyle='#e8eaf0'; ctx.font='bold 11px IBM Plex Mono,monospace';
      ctx.textAlign='center'; ctx.textBaseline='top'; ctx.fillText(label,x,y+r+7); ctx.restore();
    }
    if (sublabel) {
      ctx.save(); ctx.fillStyle='#5a6080'; ctx.font='9px IBM Plex Mono,monospace';
      ctx.textAlign='center'; ctx.textBaseline='top'; ctx.fillText(sublabel,x,y+r+20); ctx.restore();
    }
  }

  function drawLink(ctx,x1,y1,x2,y2,color,w,alpha,dash) {
    ctx.save(); ctx.globalAlpha=alpha||1; ctx.strokeStyle=color; ctx.lineWidth=w||1.5;
    if(dash) ctx.setLineDash(dash); ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
    ctx.setLineDash([]); ctx.restore();
  }

  function drawArrow(ctx,x1,y1,x2,y2,color,w,alpha) {
    var dx=x2-x1,dy=y2-y1,len=Math.hypot(dx,dy);
    if(len<1) return;
    var ux=dx/len,uy=dy/len;
    ctx.save(); ctx.globalAlpha=alpha||1; ctx.strokeStyle=color; ctx.lineWidth=w||1.5;
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2-ux*14,y2-uy*14); ctx.stroke();
    ctx.fillStyle=color; ctx.beginPath();
    ctx.moveTo(x2-ux*16+uy*5,y2-uy*16-ux*5);
    ctx.lineTo(x2,y2);
    ctx.lineTo(x2-ux*16-uy*5,y2-uy*16+ux*5);
    ctx.fill(); ctx.restore();
  }

  function drawPacket(ctx,x,y,label,color,size) {
    var s=size||12;
    ctx.save();
    var g=ctx.createRadialGradient(x,y,0,x,y,s*2.2);
    g.addColorStop(0,hexA(color,0.4)); g.addColorStop(1,'transparent');
    ctx.fillStyle=g; ctx.beginPath(); ctx.arc(x,y,s*2.2,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=color; ctx.beginPath(); ctx.arc(x,y,s,0,Math.PI*2); ctx.fill();
    if(label){
      ctx.fillStyle='#07090f'; ctx.font='bold 8px IBM Plex Mono,monospace';
      ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(label,x,y);
    }
    ctx.restore();
  }

  function drawZone(ctx,x,y,w,h,label,color,al) {
    ctx.save(); ctx.globalAlpha=al||0.8;
    ctx.strokeStyle=color; ctx.lineWidth=1; ctx.setLineDash([5,4]);
    ctx.strokeRect(x,y,w,h); ctx.setLineDash([]);
    ctx.fillStyle=color; ctx.globalAlpha=(al||0.8)*0.1; ctx.fillRect(x,y,w,h);
    ctx.globalAlpha=al||0.8; ctx.fillStyle=color;
    ctx.font='bold 9px IBM Plex Mono,monospace'; ctx.textAlign='left'; ctx.textBaseline='top';
    ctx.fillText(label,x+8,y+7); ctx.restore();
  }

  function drawTag(ctx,x,y,text,bg,color) {
    ctx.save(); ctx.font='bold 9px IBM Plex Mono,monospace';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    var tw=ctx.measureText(text).width, pw=tw+12, ph=16;
    ctx.fillStyle=bg; rr(ctx,x-pw/2,y-ph/2,pw,ph,4); ctx.fill();
    ctx.fillStyle=color; ctx.fillText(text,x,y); ctx.restore();
  }

  function drawLabel(ctx,x,y,text,color,size,align) {
    ctx.save(); ctx.fillStyle=color||'#e8eaf0';
    ctx.font=(size||11)+'px IBM Plex Mono,monospace';
    ctx.textAlign=align||'center'; ctx.textBaseline='middle';
    ctx.fillText(text,x,y); ctx.restore();
  }

  function rr(ctx,x,y,w,h,rad) {
    ctx.beginPath(); ctx.moveTo(x+rad,y); ctx.lineTo(x+w-rad,y);
    ctx.quadraticCurveTo(x+w,y,x+w,y+rad); ctx.lineTo(x+w,y+h-rad);
    ctx.quadraticCurveTo(x+w,y+h,x+w-rad,y+h); ctx.lineTo(x+rad,y+h);
    ctx.quadraticCurveTo(x,y+h,x,y+h-rad); ctx.lineTo(x,y+rad);
    ctx.quadraticCurveTo(x,y,x+rad,y); ctx.closePath();
  }

  function hexA(hex,a) {
    var r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
    return 'rgba('+r+','+g+','+b+','+a+')';
  }
  function eio(t){ return t<0.5?2*t*t:-1+(4-2*t)*t; }
  function lerp(a,b,t){ return a+(b-a)*t; }

  // ════════════════════════════════════════════════════════════
  // 1. BGP FINITE STATE MACHINE
  // ════════════════════════════════════════════════════════════
  var FSM_STATES = [
    {id:'idle',        label:'Idle',        col:'#5a6080', desc:'BGP stopped. No connections. Waiting for ManualStart / AutomaticStart event.'},
    {id:'connect',     label:'Connect',     col:'#fbbf24', desc:'TCP connection attempt in progress. BGP waits for three-way handshake to complete.'},
    {id:'active',      label:'Active',      col:'#f472b6', desc:'TCP connection failed. BGP actively retries a new TCP connection to the peer.'},
    {id:'opensent',    label:'OpenSent',    col:'#5b9cf6', desc:'TCP established. BGP sent OPEN message, waiting for peer OPEN in response.'},
    {id:'openconfirm', label:'OpenConfirm', col:'#a78bfa', desc:'OPEN received & validated. Sent KEEPALIVE, waiting for peer KEEPALIVE confirmation.'},
    {id:'established', label:'Established', col:'#4ade80', desc:'🟢 Full BGP session UP! UPDATE messages can now be exchanged. Routes flowing!'}
  ];
  var FSM_HAPPY = ['idle','connect','active','connect','opensent','openconfirm','established'];
  var FSM_ARROWS = [
    {f:'idle',        t:'connect',     lbl:'BGP Start'},
    {f:'connect',     t:'opensent',    lbl:'TCP Success'},
    {f:'connect',     t:'active',      lbl:'TCP Fail'},
    {f:'active',      t:'connect',     lbl:'Retry'},
    {f:'opensent',    t:'openconfirm', lbl:'OPEN rcvd'},
    {f:'openconfirm', t:'established', lbl:'KEEPALIVE rcvd'},
    {f:'established', t:'idle',        lbl:'NOTIFICATION'}
  ];
  var fsmActive=0, fsmHoldTime=0;

  function bgpDrawFSM(ctx,W,H) {
    var CX=W/2, gap=Math.min(W/3.8,170), rowH=160;
    // Row 1: Idle, Connect, Active
    FSM_STATES[0].x=CX-gap;  FSM_STATES[0].y=H/2-rowH/2-10;
    FSM_STATES[1].x=CX;      FSM_STATES[1].y=H/2-rowH/2-10;
    FSM_STATES[2].x=CX+gap;  FSM_STATES[2].y=H/2-rowH/2-10;
    // Row 2: Established, OpenConfirm, OpenSent
    FSM_STATES[5].x=CX-gap;  FSM_STATES[5].y=H/2+rowH/2-10;
    FSM_STATES[4].x=CX;      FSM_STATES[4].y=H/2+rowH/2-10;
    FSM_STATES[3].x=CX+gap;  FSM_STATES[3].y=H/2+rowH/2-10;

    fsmHoldTime++;
    var hold = BA.paused?999 : Math.round((fsmActive===6?200:110)/BA.speed);
    if (fsmHoldTime > hold) {
      fsmHoldTime=0; fsmActive=(fsmActive+1)%FSM_HAPPY.length;
      var st = FSM_STATES.find(function(s){return s.id===FSM_HAPPY[fsmActive];});
      var stepDescs = {
        'idle':        {tag:'STOPPED',  desc:'BGP process started. No peer connections exist yet. Waiting for ManualStart or AutomaticStart event to begin.'},
        'connect':     {tag:'TCP SYN',  desc:'TCP connection attempt in progress toward the peer. BGP is waiting for the three-way handshake to complete.'},
        'active':      {tag:'TCP FAIL', desc:'⚠️ TCP connection failed! BGP enters Active state — actively retrying a new TCP connection to the peer. This is a common state during link flaps or misconfiguration.'},
        'opensent':    {tag:'OPEN SENT',desc:'TCP handshake succeeded on retry. BGP sent its OPEN message — containing AS number, Hold Timer, and BGP Router-ID. Waiting for peer OPEN.'},
        'openconfirm': {tag:'CONFIRMING',desc:'Peer OPEN received and validated. KEEPALIVE sent to confirm. Waiting for peer KEEPALIVE to complete the negotiation.'},
        'established': {tag:'✓ UP',     desc:'🟢 BGP session ESTABLISHED! Full peering is UP. UPDATE messages can now be exchanged and routes are flowing between peers.'}
      };
      var info = stepDescs[FSM_HAPPY[fsmActive]];
      bgpSetStep(fsmActive+1,'FSM','rgba(91,156,246,0.12)',st.col, st.label+' State', info.desc);
      document.getElementById('bgpAnimStepNum').textContent = fsmActive+1;
    }

    var curId  = FSM_HAPPY[fsmActive];
    var nextId = FSM_HAPPY[(fsmActive+1)%FSM_HAPPY.length];

    // Draw arrows
    FSM_ARROWS.forEach(function(ar){
      var fs=FSM_STATES.find(function(s){return s.id===ar.f;});
      var ts=FSM_STATES.find(function(s){return s.id===ar.t;});
      if(!fs||!ts) return;
      var isHot = ar.f===curId && ar.t===nextId;
      var dx=ts.x-fs.x,dy=ts.y-fs.y,len=Math.hypot(dx,dy);
      var ox=-dy/len*10, oy=dx/len*10;
      drawArrow(ctx,fs.x+ox,fs.y+oy,ts.x+ox,ts.y+oy, isHot?fs.col:'rgba(90,96,128,0.35)', isHot?2:1, isHot?1:0.35);
      if(isHot){
        var mx=(fs.x+ts.x)/2+ox, my=(fs.y+ts.y)/2+oy;
        ctx.save(); ctx.font='bold 9px IBM Plex Mono,monospace'; ctx.textAlign='center'; ctx.textBaseline='middle';
        var tw=ctx.measureText(ar.lbl).width;
        ctx.fillStyle='rgba(12,15,26,0.88)'; ctx.fillRect(mx-tw/2-5,my-9,tw+10,18);
        ctx.fillStyle=fs.col; ctx.fillText(ar.lbl,mx,my); ctx.restore();
      }
    });

    // Draw state nodes
    FSM_STATES.forEach(function(s){
      var isCur = s.id===curId;
      var r = isCur?30:24;
      if(isCur){
        var p=Math.sin(BA.t*4)*0.3+0.7;
        ctx.save(); ctx.globalAlpha=p*0.22;
        ctx.beginPath(); ctx.arc(s.x,s.y,r+14,0,Math.PI*2);
        ctx.strokeStyle=s.col; ctx.lineWidth=3; ctx.stroke(); ctx.restore();
      }
      drawRouter(ctx,s.x,s.y,r,s.col,s.label,'',isCur);
    });

    // Travelling packet on happy-path
    if(fsmActive>0 && fsmHoldTime<40){
      var prev=FSM_STATES.find(function(s){return s.id===FSM_HAPPY[fsmActive-1];});
      var cur =FSM_STATES.find(function(s){return s.id===curId;});
      if(prev&&cur){
        var pt=Math.min(1,fsmHoldTime/36);
        drawPacket(ctx,lerp(prev.x,cur.x,eio(pt)),lerp(prev.y,cur.y,eio(pt)),'BGP',cur.col,8);
      }
    }
    drawLabel(ctx,W/2,18,'BGP Finite State Machine — Happy Path','#5a6080',10);
  }

  // ════════════════════════════════════════════════════════════
  // 2. BGP MESSAGE TYPES
  // ════════════════════════════════════════════════════════════
  var MSG_SEQ = [
  {f:'A',t:'B',type:'OPEN',        col:'#5b9cf6',lbl:'OPEN', fields:'Ver:4 | AS:100 | Hold:180s | BGP-ID:1.1.1.1',          desc:'Router A → Router B: OPEN message sent. Contains BGP version, AS number, Hold Timer and Router-ID.'},
  {f:'B',t:'A',type:'OPEN',        col:'#5b9cf6',lbl:'OPEN', fields:'Ver:4 | AS:200 | Hold:180s | BGP-ID:2.2.2.2',          desc:'Router B → Router A: OPEN reply. Both routers now know each other\'s AS numbers and capabilities.'},
  {f:'A',t:'B',type:'KEEPALIVE',   col:'#fbbf24',lbl:'KA',   fields:'Type:4 | Len:19 | (empty body)',                       desc:'Router A → Router B: KEEPALIVE confirms the OPEN is acceptable. Moves toward Established state.'},
  {f:'B',t:'A',type:'KEEPALIVE',   col:'#fbbf24',lbl:'KA',   fields:'Type:4 | Len:19 | (empty body)',                       desc:'Router B → Router A: KEEPALIVE reply. Handshake complete — session is now ESTABLISHED! ✓'},
  {f:'A',t:'B',type:'UPDATE',      col:'#4ade80',lbl:'UPD',  fields:'NLRI:10.0.0.0/8 | AS_PATH:[100] | NH:1.1.1.1 | LP:200', desc:'Router A → Router B: UPDATE advertises prefix 10.0.0.0/8 with path attributes. Core BGP routing message.'},
  {f:'B',t:'A',type:'UPDATE',      col:'#4ade80',lbl:'UPD',  fields:'NLRI:172.16.0.0/12 | AS_PATH:[200] | NH:2.2.2.2',      desc:'Router B → Router A: UPDATE advertises 172.16.0.0/12. UPDATE can also withdraw previously advertised routes.'},
  {f:'A',t:'B',type:'KEEPALIVE',   col:'#fbbf24',lbl:'KA',   fields:'Periodic KA — every Hold/3 seconds (default: 60s)',    desc:'Periodic KEEPALIVE to prevent hold-timer expiry. Sent every 60s by default (hold time = 180s).'},
  {f:'B',t:'A',type:'KEEPALIVE',   col:'#fbbf24',lbl:'KA',   fields:'Periodic KA — every Hold/3 seconds (default: 60s)',    desc:'Router B sends periodic KEEPALIVE back. Both peers must send KA to keep the session alive.'},
  {f:'A',t:'B',type:'NOTIFICATION',col:'#f87171',lbl:'NOTIF',fields:'Error Code:6 | Subcode:2 | (Hold Timer Expired)',       desc:'NOTIFICATION message: signals an error — here Hold Timer Expired. BGP session will be torn down after this.'},
  {f:'B',t:'A',type:'NOTIFICATION',col:'#f87171',lbl:'NOTIF',fields:'Error Code:6 | Subcode:2 | (Cease)',                   desc:'Router B also sends NOTIFICATION (Cease) to confirm session teardown. Both sides return to Idle state.'}
  ];
  var msgStep=0, msgPkt=null, msgHold=0, msgDone=false, msgLog=[];

  function bgpDrawMsgs(ctx,W,H) {
  var AX=W*0.18, BX=W*0.82, RY=H*0.42;
  var est = msgStep>=4;
  var done = msgDone;

  // TCP line
  drawLink(ctx,AX,RY,BX,RY, done||est?'#4ade80':'#5a6080', done||est?2.5:1.5, done||est?0.5:0.2, done||est?[]:[4,4]);
  drawLabel(ctx,W/2,RY-20, done?'✓ Session Complete — All BGP Messages Shown': est?'✓ TCP — BGP Session ESTABLISHED':'TCP session (establishing…)', done?'#4ade80':est?'#4ade80':'#5a6080', 9);

  // Routers
  drawRouter(ctx,AX,RY,32,'#5b9cf6','R-A','AS 100',false);
  drawRouter(ctx,BX,RY,32,'#38d9c0','R-B','AS 200',false);

  // Step labels on routers
  ctx.save();
  ctx.font='bold 9px IBM Plex Mono,monospace'; ctx.textAlign='center';
  ctx.fillStyle='#5b9cf6'; ctx.fillText('Sender / Receiver',AX,RY+52);
  ctx.fillStyle='#38d9c0'; ctx.fillText('Sender / Receiver',BX,RY+52);
  ctx.restore();

  // Draw completed message log as stacked rows on canvas
  var logStartY = H*0.72;
  var rowH2 = Math.min(22, (H*0.24)/Math.max(msgLog.length,1));
  msgLog.forEach(function(entry, i){
    var ry2 = logStartY + i*rowH2;
    var fromX = entry.f==='A'?AX:BX;
    var toX   = entry.f==='A'?BX:AX;
    // Faded arrow line
    drawLink(ctx, fromX, ry2, toX, ry2, entry.col, 1, 0.35);
    // Direction dot
    ctx.beginPath(); ctx.arc(toX, ry2, 4, 0, Math.PI*2);
    ctx.fillStyle=entry.col; ctx.globalAlpha=0.7; ctx.fill(); ctx.globalAlpha=1;
    // Badge
    var bw=52;
    ctx.fillStyle=entry.col+'22';
    rr(ctx, W/2-bw/2, ry2-9, bw, 18, 4); ctx.fill();
    ctx.strokeStyle=entry.col; ctx.lineWidth=0.8;
    rr(ctx, W/2-bw/2, ry2-9, bw, 18, 4); ctx.stroke();
    ctx.fillStyle=entry.col; ctx.font='bold 8px IBM Plex Mono,monospace';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(entry.lbl, W/2, ry2);
    // Step number
    ctx.fillStyle='#5a6080'; ctx.font='8px IBM Plex Mono,monospace';
    ctx.textAlign= entry.f==='A'?'right':'left';
    ctx.fillText('Step '+(i+1), entry.f==='A'?W/2-bw/2-6:W/2+bw/2+6, ry2);
  });

  // Animate current packet
  if(!msgDone){
    msgHold++;
    if(!msgPkt && !BA.paused && msgHold > Math.round(80/BA.speed)){
      if(msgStep < MSG_SEQ.length){
        msgHold=0;
        var sq=MSG_SEQ[msgStep];
        msgPkt={fx:sq.f==='A'?AX:BX, tx:sq.f==='A'?BX:AX, t:0, idx:msgStep};
        var tagBg = sq.col==='#5b9cf6'?'rgba(91,156,246,0.15)':sq.col==='#fbbf24'?'rgba(251,191,36,0.15)':sq.col==='#4ade80'?'rgba(74,222,128,0.15)':'rgba(248,113,113,0.15)';
        bgpSetStep(msgStep+1, sq.type, tagBg, sq.col, sq.type+' Message', sq.desc);
      } else {
        msgDone=true;
        bgpSetStep(10,'DONE','rgba(74,222,128,0.15)','#4ade80','All BGP Messages Complete','All 10 BGP message types demonstrated: OPEN handshake → KEEPALIVE → UPDATE route exchange → Periodic KEEPALIVE → NOTIFICATION teardown. Full BGP session lifecycle shown.');
      }
    }
    if(msgPkt){
      msgPkt.t += 0.018*BA.speed;
      if(msgPkt.t>=1){
        // Add to log
        var sq=MSG_SEQ[msgPkt.idx];
        msgLog.push({f:sq.f, col:sq.col, lbl:sq.lbl});
        msgStep++; msgPkt=null; msgHold=0;
      } else {
        var sq=MSG_SEQ[msgPkt.idx];
        var px=lerp(msgPkt.fx,msgPkt.tx,eio(msgPkt.t));
        var py=RY+Math.sin(msgPkt.t*Math.PI)*-42;
        drawPacket(ctx,px,py,sq.lbl,sq.col,14);
        if(msgPkt.t>0.25&&msgPkt.t<0.75){
          ctx.save(); ctx.font='9px IBM Plex Mono,monospace'; ctx.fillStyle=sq.col;
          ctx.textAlign='center'; ctx.textBaseline='bottom';
          ctx.fillText(sq.fields,W/2,py-24); ctx.restore();
        }
      }
    }
  }

  drawLabel(ctx,W/2,18,'BGP Message Types — Full Session Lifecycle (10 Steps)','#5a6080',10);
}

  // ════════════════════════════════════════════════════════════
// 3. iBGP vs eBGP PEERING
// ════════════════════════════════════════════════════════════
var peersPackets=[], peersTimer=0, peersPhase=0, peersPhaseTimer=0;

var PEERS_STEPS = [

  // ══════════════════════════════════════════
  // ── iBGP SECTION (your existing 18 steps) ──
  // ══════════════════════════════════════════

  { tag:'BASICS①',    col:'#4ade80', level:'CCNA',   side:'ibgp',
    title:'What is iBGP? — Internal BGP Definition',
    desc:'iBGP (Internal BGP) connects routers WITHIN the same Autonomous System (same AS number). It distributes BGP routes learned from outside (via eBGP) to all routers inside the AS. iBGP uses TCP port 179 — same as eBGP. Key rule: iBGP does NOT require direct physical connection between peers — they can be multiple hops away through IGP (OSPF/ISIS).' },

  { tag:'BASICS②',    col:'#4ade80', level:'CCNA',   side:'ibgp',
    title:'iBGP vs eBGP — The Golden Comparison',
    desc:'eBGP = Between DIFFERENT Autonomous Systems. iBGP = Within the SAME Autonomous System. eBGP Administrative Distance = 20 (highly trusted). iBGP Administrative Distance = 200 (least trusted). If same prefix learned from both, eBGP route always wins (lower AD). BGP uses triggered updates — 5s interval for iBGP, 30s interval for eBGP (slower to prevent internet route flaps).' },

  { tag:'BASICS③',    col:'#4ade80', level:'CCNA',   side:'ibgp',
    title:'TTL Behavior — iBGP=255 vs eBGP=1',
    desc:'eBGP sets TTL=1 — peer MUST be directly connected. iBGP sets TTL=255 — peer can be many hops away through IGP. This is why iBGP peers use loopback IPs — session survives physical link failure as long as IGP has another path. Fix for eBGP across multiple hops: "neighbor X ebgp-multihop 2" increases TTL. Command: "neighbor X update-source Loopback0".' },

  { tag:'BASICS④',    col:'#4ade80', level:'CCNA',   side:'ibgp',
    title:'AS-PATH Loop Prevention — eBGP Prepends, iBGP Does Not',
    desc:'When eBGP advertises a route to another AS, it PREPENDS its own ASN to AS_PATH. Receiving router checks: if my ASN is already in AS_PATH = loop, discard! iBGP does NOT add its ASN (same AS, no need). Internet routes show chains like [1299 3356 7018 65001] — each number is one AS hop. iBGP split-horizon handles loop prevention internally instead.' },

  { tag:'NEIGHBOR①',  col:'#38d9c0', level:'CCNA',   side:'ibgp',
    title:'iBGP Neighbor Formation — Loopback vs Physical Interface',
    desc:'Best practice: iBGP peers MUST use LOOPBACK interfaces as update-source. Why? Loopbacks never go down — session survives physical link failure. Without loopback, losing one interface = losing all BGP sessions on that router. Command: "neighbor X.X.X.X update-source Loopback0". Router ID = highest loopback IP (or highest physical IP if no loopback). Must be unique across all peers.' },

  { tag:'NEIGHBOR②',  col:'#38d9c0', level:'CCNA',   side:'ibgp',
    title:'Keepalive & Hold Timers — Negotiation & Fast Detection',
    desc:'BGP Hold Timer default = 180s. Keepalive default = 60s (1:3 ratio). Both values are NEGOTIATED — the LOWER value between two peers wins. For fast convergence: set timers 3/1 (hold=3s, keepalive=1s). Better: use BFD (Bidirectional Forwarding Detection) — sub-second failure detection without waiting 180s for hold timer. Command: "neighbor X fall-over bfd".' },

  { tag:'SPLIT-HZ',   col:'#f87171', level:'CCNA',   side:'ibgp',
    title:'⚠ iBGP Split-Horizon — Most Critical iBGP Rule',
    desc:'THE MOST IMPORTANT iBGP RULE: A route learned from an iBGP peer CANNOT be re-advertised to another iBGP peer. Prevents routing loops inside AS. Example: R1 tells R2 about 10.0.0.0/8 via iBGP. R2 CANNOT tell R3 via iBGP — R3 never learns the route! RFC 4271 mandates this. This forces FULL MESH peering or use of Route Reflector / Confederation as scaling solutions.' },

  { tag:'FULLMESH',   col:'#fbbf24', level:'CCNP',   side:'ibgp',
    title:'Full Mesh iBGP — n(n-1)/2 Scalability Explosion',
    desc:'Because of split-horizon, every iBGP router must peer with every other. Formula n(n-1)/2: 5 routers=10 sessions, 10=45, 50=1,225, 100=4,950 sessions! Each session consumes CPU, memory, keepalive bandwidth. At ISP scale this is impossible. Solution: Route Reflectors reduce 4,950 sessions to ~100. Confederations split AS into sub-ASes. Both are industry-standard solutions.' },

  { tag:'RR①',        col:'#5b9cf6', level:'CCNP',   side:'ibgp',
    title:'Route Reflector — Breaking Split-Horizon (RFC 4456)',
    desc:'Route Reflector (RR) breaks split-horizon on purpose. Clients peer ONLY with RR. RR reflects routes between all clients. Rules: Routes from RR-Client → reflected to all other clients AND non-clients. Routes from Non-Client → reflected to clients ONLY. Routes from eBGP → reflected to everyone. 100 routers now need 99 sessions instead of 4,950! Standard in all ISP/enterprise networks today.' },

  { tag:'RR②',        col:'#5b9cf6', level:'CCNP',   side:'ibgp',
    title:'RR Loop Prevention — ORIGINATOR_ID & CLUSTER_LIST',
    desc:'Since RR breaks split-horizon, new loop prevention needed. ORIGINATOR_ID = Router-ID of original route advertiser — if you receive a route with your own Router-ID as ORIGINATOR_ID, discard (loop!). CLUSTER_LIST = list of Cluster-IDs the route passed through — if RR sees its own Cluster-ID, discard. Multiple RRs in same cluster must share same Cluster-ID for proper loop prevention.' },

  { tag:'CONFED',     col:'#a78bfa', level:'CCNP',   side:'ibgp',
    title:'BGP Confederation — Sub-AS Design (RFC 5065)',
    desc:'Confederation splits one large AS into multiple sub-ASes (private ASNs 64512–65535). Each sub-AS has its own internal full mesh. Between sub-ASes: sessions look like eBGP but BEHAVE like iBGP — LOCAL_PREF, MED, next-hop all preserved. Outside world sees ONLY the main confederation AS — sub-AS numbers are hidden and stripped from AS_PATH. Reduces full-mesh while keeping iBGP behavior.' },

  { tag:'NEXTHOP①',   col:'#fbbf24', level:'CCNP',   side:'ibgp',
    title:'Next-Hop Unchanged in iBGP — Recursive Routing Problem',
    desc:'When eBGP border router receives route with next-hop=203.0.113.1 from ISP and advertises it via iBGP internally, NEXT-HOP stays as 203.0.113.1 (unchanged). Internal routers must do RECURSIVE ROUTING — look up 203.0.113.1 via IGP. If IGP does not carry that external IP, internal routers CANNOT use the BGP route — silent BLACK HOLE! This is the #1 iBGP misconfiguration in production.' },

  { tag:'NEXTHOP②',   col:'#fbbf24', level:'CCNP',   side:'ibgp',
    title:'next-hop-self — The Production Fix',
    desc:'"neighbor X next-hop-self" — border router sets its OWN IP as next-hop when advertising via iBGP. Internal routers now see next-hop = border router loopback (known via IGP). Recursive routing works perfectly. WARNING: Do NOT apply next-hop-self on Route Reflectors — it puts RR in the data forwarding path causing suboptimal routing. Apply only on eBGP-facing border routers.' },

  { tag:'ATTR①',      col:'#f472b6', level:'CCNP',   side:'ibgp',
    title:'LOCAL_PREF — Most Important iBGP Attribute',
    desc:'LOCAL_PREF is ONLY carried inside iBGP — NEVER sent to eBGP peers (stripped at AS boundary). Tells ALL routers inside AS which exit to prefer for OUTBOUND traffic. Default=100. Higher wins. Example: Primary ISP LP=200, Backup ISP LP=50 — every internal router automatically prefers primary. Set via route-map on inbound eBGP session at border router. Cisco command: "set local-preference 200".' },

  { tag:'ATTR②',      col:'#f472b6', level:'CCNP',   side:'ibgp',
    title:'Weight, MED and Community in iBGP Context',
    desc:'WEIGHT (Cisco-only): local to the router, not advertised to any peer. Highest wins. Default=0 learned routes, 32768 local. Used for per-router path preference before it enters BGP table. MED: sent TO eBGP peers to influence their INBOUND entry into your AS — lower MED preferred, compared only between same neighboring AS. COMMUNITY: policy tags carried in iBGP — no-export, no-advertise, or custom 65001:100 values.' },

  { tag:'SYNC',       col:'#38d9c0', level:'CCIE',   side:'ibgp',
    title:'BGP Synchronization — Legacy Rule (Must Know for CCIE)',
    desc:'Old rule (now disabled): iBGP router must NOT install or advertise BGP route until SAME prefix exists in IGP. Prevented black holes when transit routers did not run BGP. Modern networks use "no synchronization" because all routers run BGP or MPLS handles forwarding. Without this fix, non-BGP transit router would drop traffic for BGP-only prefixes. Still tested on CCIE written and lab exams.' },

  { tag:'MULTIPATH',  col:'#38d9c0', level:'CCIE',   side:'ibgp',
    title:'iBGP Multipath Load Balancing',
    desc:'"maximum-paths ibgp 8" — install up to 8 equal-cost iBGP paths in RIB simultaneously for load balancing. Requirements: equal AS_PATH length, same MED, same LOCAL_PREF, different next-hops. "bgp bestpath as-path multipath-relax" allows multipath even with different AS_PATH values (checks length only, ignores content). BGP Link Bandwidth for unequal-cost load balancing via MPLS.' },

  { tag:'SECURITY①',  col:'#f87171', level:'CCIE',   side:'ibgp',
    title:'iBGP Security — MD5, GTSM & Troubleshooting',
    desc:'MD5 Auth: "neighbor X password SECRET" — both sides must match. GTSM/TTL Security: "neighbor X ttl-security hops 1" — drops BGP packets below TTL threshold, hardens against spoofed attacks. Common iBGP issues: ① Neighbor stuck in Active = wrong update-source, ACL blocking TCP 179, wrong remote-as ② Routes not propagating = split-horizon, missing full mesh or RR ③ Next-hop unreachable = missing next-hop-self ④ Incorrect LOCAL_PREF = wrong route-map direction.' },

  { tag:'BFD+IGP',    col:'#a78bfa', level:'CCIE',   side:'ibgp',
    title:'iBGP Convergence — BFD, IGP Interaction & Design Rules',
    desc:'BGP convergence depends on IGP convergence first. BFD provides sub-second failure detection — "neighbor X fall-over bfd" drops BGP session within 300ms instead of waiting 180s hold timer. Graceful Restart (GR): "bgp graceful-restart" — allows BGP session to restart without withdrawing routes (preserves forwarding during restart). Design rules: always use loopback peering, redundant IGP paths, stable Router-IDs, and BFD on all iBGP sessions in production.' },

  // ══════════════════════════════════════════
  // ── eBGP SECTION — 20 Steps ──
  // ══════════════════════════════════════════

  { tag:'eBASIC①',    col:'#4ade80', level:'CCNA',   side:'ebgp',
    title:'What is eBGP? — External BGP & Internet Routing',
    desc:'eBGP (External BGP) connects routers in DIFFERENT Autonomous Systems — the protocol that runs the entire internet. Every ISP, cloud provider, and large enterprise uses eBGP to exchange routing information across AS boundaries. Path-vector protocol: BGP does NOT use metrics like OSPF/EIGRP — it uses AS_PATH (list of ASes the route passed through) to make routing decisions and prevent loops.' },

  { tag:'eBASIC②',    col:'#4ade80', level:'CCNA',   side:'ebgp',
    title:'eBGP Neighbor Formation — Direct Connect & TCP 179',
    desc:'eBGP default rule: peers MUST be directly connected (TTL=1). Configure with: "neighbor X.X.X.X remote-as 200". For non-directly connected eBGP (over multiple hops): "neighbor X ebgp-multihop 2" increases TTL. Update-source with loopback: "neighbor X update-source Loopback0" (then add ebgp-multihop). Keepalive=60s, Hold=180s by default — same as iBGP. TCP session established on port 179.' },

  { tag:'eBASIC③',    col:'#4ade80', level:'CCNA',   side:'ebgp',
    title:'eBGP AD=20 — Preferred Over All Other Routing Protocols',
    desc:'eBGP Administrative Distance = 20. This is LOWER than OSPF (110), EIGRP (90), RIP (120), and iBGP (200). Lower AD = more trusted. If a router learns the same prefix from eBGP and OSPF simultaneously, it installs the eBGP route because AD 20 wins. This means: if your BGP border router also runs OSPF and both learn 10.0.0.0/8, the eBGP route goes into the forwarding table.' },

  { tag:'AS_PATH①',   col:'#fbbf24', level:'CCNA',   side:'ebgp',
    title:'AS_PATH — How Internet Loop Prevention Works',
    desc:'AS_PATH is the most important eBGP attribute. When AS 100 advertises a route to AS 200, it adds "100" to AS_PATH. AS 200 adds "200" when forwarding to AS 300 — now AS_PATH = [200, 100]. If AS 100 ever receives this route back, it sees its own ASN 100 in the path and DISCARDS it — loop prevented! Internet routes show full paths like [1299 3356 7018 65001]. Shorter AS_PATH = preferred path (fewer hops).' },

  { tag:'AS_PATH②',   col:'#fbbf24', level:'CCNP',   side:'ebgp',
    title:'AS_PATH Prepending — Traffic Engineering Tool',
    desc:'AS_PATH Prepending = artificially making your AS_PATH LONGER to make a route LESS preferred for inbound traffic. Example: You have 2 ISPs. To force traffic through ISP-A, prepend extra copies of your ASN to the route advertised to ISP-B: AS_PATH becomes [65001 65001 65001] instead of [65001]. ISP-B peers see longer path and prefer ISP-A route. Command: "set as-path prepend 65001 65001" in route-map.' },

  { tag:'AS_SET',     col:'#fbbf24', level:'CCNP',   side:'ebgp',
    title:'AS_SEQUENCE vs AS_SET — Aggregation Impact',
    desc:'AS_SEQUENCE = ordered list of ASNs a route passed through (normal routing). AS_SET = UNORDERED set of ASNs — used in route aggregation when summarizing multiple routes from different ASes. Example: Aggregating 10.1.0.0/24 (from AS 65001) and 10.1.1.0/24 (from AS 65002) into 10.1.0.0/23 creates AS_SET {65001,65002}. ATOMIC_AGGREGATE attribute signals information was lost during summarization.' },

  { tag:'NEXTHOP③',   col:'#38d9c0', level:'CCNA',   side:'ebgp',
    title:'eBGP Next-Hop — Changed at Every AS Boundary',
    desc:'eBGP ALWAYS changes the NEXT_HOP attribute to the advertising router\'s own IP when sending to an eBGP peer. Example: R-A (10.0.0.1) in AS 100 sends route to R-B (10.0.0.2) in AS 200 — R-B sees next-hop = 10.0.0.1. R-B sends it to R-C in AS 300 — R-C sees next-hop = 10.0.0.2. Next-hop changes at EVERY AS boundary. Direct reachability to next-hop is always guaranteed on eBGP links.' },

  { tag:'MULTIHOME',  col:'#5b9cf6', level:'CCNP',   side:'ebgp',
    title:'eBGP Multihoming Designs — 4 Types',
    desc:'① Single-homed: 1 router, 1 ISP — no redundancy, simplest. ② Dual-homed: 1 ISP, 2 links — redundancy, no ISP diversity. ③ Multihomed: 2+ ISPs — full redundancy and ISP diversity, most common enterprise design. ④ Transit AS: carries traffic BETWEEN ISPs — you become part of internet routing fabric (complex, usually only ISPs). Best practice: advertise your own IP space, filter ISP routes with prefix-lists, never become unintentional transit.' },

  { tag:'TRAFFIC-ENG', col:'#5b9cf6', level:'CCNP',  side:'ebgp',
    title:'eBGP Traffic Engineering — Outbound vs Inbound Control',
    desc:'OUTBOUND (you control your exit): Use LOCAL_PREF inside AS — set LP=200 on primary ISP, LP=50 on backup. All internal routers prefer primary exit automatically. INBOUND (influence external peers): Use AS_PATH Prepending to make one path longer (last resort). Use MED to suggest preferred entry point to same neighboring AS (lower MED preferred). Use BGP Communities to signal ISP peers to apply specific policies on your behalf.' },

  { tag:'MED',        col:'#a78bfa', level:'CCNP',   side:'ebgp',
    title:'MED — Multi-Exit Discriminator Explained',
    desc:'MED influences inbound traffic from a directly connected neighboring AS. Lower MED = preferred entry. IMPORTANT: MED is only compared between routes from the SAME neighboring AS by default. "bgp always-compare-med" allows MED comparison across different ASes (use carefully). MED is NOT transitive — it is stripped when route passes to another AS. Think: LP controls YOUR outbound, MED suggests their inbound.' },

  { tag:'COMMUNITY①', col:'#f472b6', level:'CCNP',   side:'ebgp',
    title:'BGP Communities — Policy Tags Across AS Boundaries',
    desc:'BGP Community = 32-bit policy tag attached to routes. Format: AS:VALUE (e.g., 65001:100). Well-known communities: NO_EXPORT (don\'t send beyond AS), NO_ADVERTISE (keep locally only), NO_EXPORT_SUBCONFED. Custom communities let ISPs offer services: "65001:666" = blackhole, "65001:100" = set LP=200, "65001:prepend" = prepend for me. LARGE_COMMUNITY (RFC 8092): 96-bit, format AS:TAG:VALUE for more granular policy.' },

  { tag:'FILTER①',    col:'#f87171', level:'CCNP',   side:'ebgp',
    title:'eBGP Route Filtering — Inbound & Outbound',
    desc:'INBOUND filtering (control what you accept from ISP): Prefix-list to accept only specific prefixes. AS_PATH filter-list to reject routes with specific ASNs. OUTBOUND filtering (control what you advertise): Never advertise more-specifics if you have aggregate. Never advertise transit routes unless you are a transit AS. Always filter BOGON prefixes (RFC1918, documentation ranges, unallocated space). "maximum-prefix 100000 80" — alert at 80%, disconnect at 100k prefixes.' },

  { tag:'FILTER②',    col:'#f87171', level:'CCNP',   side:'ebgp',
    title:'Prefix-List, Route-Map & AS_PATH Filter — The Toolkit',
    desc:'Prefix-list: "ip prefix-list ALLOW permit 192.0.2.0/24" — most efficient, hardware-accelerated match. Route-map: combines match (prefix, community, AS_PATH) with action (set local-pref, MED, community, next-hop) — most powerful tool. AS_PATH access-list: "ip as-path access-list 1 permit ^65001$" — match only routes originated by AS 65001. Apply inbound: "neighbor X route-map POLICY in". Always soft-clear after changes: "clear ip bgp X soft".' },

  { tag:'SECURITY②',  col:'#f87171', level:'CCNP',   side:'ebgp',
    title:'eBGP Security — Hijacking, Route Leaks & Defenses',
    desc:'BGP Hijacking: malicious/misconfigured AS announces your IP prefix — internet routes traffic to them (Pakistan Telecom hijacked YouTube 2008, affecting 75% of internet). Route Leak: AS accidentally advertises routes learned from one ISP to another ISP — accidentally becoming transit. Defenses: ① MD5 Auth ② GTSM/TTL Security ③ IRR filtering (RIPE/ARIN database) ④ RPKI (Resource Public Key Infrastructure) — cryptographic prefix origin validation. Filter bogons always.' },

  { tag:'RPKI',       col:'#f87171', level:'CCIE',   side:'ebgp',
    title:'RPKI — Cryptographic Route Origin Validation',
    desc:'RPKI (Resource Public Key Infrastructure): cryptographically ties IP prefix ownership to AS number using ROA (Route Origin Authorization) certificates. Router validator checks: VALID = prefix matches ROA, INVALID = wrong AS is announcing (possible hijack — REJECT), NOT FOUND = no ROA exists (accept but monitor). Cisco command: "bgp rpki server tcp X.X.X.X". Major ISPs now enforce RPKI — invalids are dropped. Critical for internet security.' },

  { tag:'MULTIPATH②', col:'#38d9c0', level:'CCNP',   side:'ebgp',
    title:'eBGP Multipath Load Balancing',
    desc:'"maximum-paths 8" — installs up to 8 equal-cost eBGP paths in RIB. Requirements: same AS_PATH length, same MED, next-hops different, IGP metric to each next-hop must be equal. "bgp bestpath as-path multipath-relax" — relaxes requirement to match AS_PATH content, checks length only — allows multipath even when paths come through different transit ASes (different AS numbers, same length).' },

  { tag:'ADDR-FAM',   col:'#5b9cf6', level:'CCNP',   side:'ebgp',
    title:'eBGP Address Families — IPv4, IPv6, VPNv4, EVPN',
    desc:'BGP Address Families extend BGP to carry multiple protocol types. IPv4 Unicast: default, classic internet routing. IPv6 Unicast: "address-family ipv6" for IPv6 internet routing. VPNv4/VPNv6: carries MPLS VPN routes with Route Distinguisher (RD) and Route Target (RT) — backbone of MPLS SP networks. EVPN (L2VPN): carries MAC/IP routes for data center fabric, VXLAN overlays, and DCI. MP-BGP (RFC 4760) enables all these families simultaneously.' },

  { tag:'GRACEFUL',   col:'#38d9c0', level:'CCIE',   side:'ebgp',
    title:'Graceful Restart & Route Flap Damping',
    desc:'Graceful Restart (RFC 4724): "bgp graceful-restart" — during BGP restart, router tells peer "I\'m restarting, keep forwarding traffic for up to X seconds". Peer keeps stale routes active during restart window. Prevents mass route withdrawal during planned maintenance. Route Flap Damping: penalizes unstable routes that keep coming up/down. Penalty increments on each flap, route suppressed when penalty exceeds threshold. Disabled by default on modern networks (can cause slow convergence).' },

  { tag:'TROUBLESH',  col:'#a78bfa', level:'CCNP',   side:'ebgp',
    title:'eBGP Troubleshooting — Common Issues & Commands',
    desc:'① Neighbor not forming: check AS mismatch ("show bgp neighbors"), TTL=1 issue (add ebgp-multihop), ACL blocking TCP 179, wrong IP in neighbor command. ② Routes not received: check inbound route-map/prefix-list ("show bgp neighbors X received-routes"), missing "network" statement. ③ Routes not advertised: check outbound filter, "show bgp neighbors X advertised-routes". ④ Prefix not in table: check "network" command matches exact route in RIB. ⑤ Always soft-reset after policy changes: "clear ip bgp X soft in/out".' },

  { tag:'LABS',       col:'#4ade80', level:'CCNA',   side:'ebgp',
    title:'Practical eBGP Lab Scenarios — What to Practice',
    desc:'① Basic eBGP peering: 2 routers different AS, advertise loopbacks. ② eBGP multihop with loopbacks: add ebgp-multihop + update-source. ③ Dual ISP failover: LP=200 primary, LP=50 backup — verify failover with "shut" command. ④ AS_PATH prepending: force all inbound via ISP-A. ⑤ MED-based traffic engineering: influence inbound on dual-connected ISP. ⑥ Prefix-list filtering: only advertise your /24, block all others. ⑦ Route-map community tagging: tag routes for ISP policy. ⑧ RPKI validation: configure ROA validator, test INVALID route rejection.' }

];

function bgpDrawPeers(ctx,W,H) {
  var half=W/2;

  // ── Zones ──
  var s = PEERS_STEPS[peersPhase];
  var levelCol = s.level==='CCNA'?'#4ade80':s.level==='CCNP'?'#fbbf24':'#a78bfa';
  var sideCol   = s.side==='ibgp'?'#5b9cf6':'#4ade80';
  var leftActive  = s.side==='ibgp';
  var rightActive = s.side==='ebgp';
  var totalSteps  = PEERS_STEPS.length;

  // ── Side indicator banner ──
  ctx.save();
  ctx.fillStyle = s.side==='ibgp'?'rgba(91,156,246,0.1)':'rgba(74,222,128,0.1)';
  rr(ctx, W/2-110, 6, 220, 22, 6); ctx.fill();
  ctx.strokeStyle=sideCol; ctx.lineWidth=1;
  rr(ctx, W/2-110, 6, 220, 22, 6); ctx.stroke();
  ctx.fillStyle=sideCol; ctx.font='bold 10px IBM Plex Mono,monospace';
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText((s.side==='ibgp'?'◀ iBGP CONCEPT':'▶ eBGP CONCEPT')+' — Step '+(peersPhase+1)+'/'+totalSteps, W/2, 17);
  ctx.restore();
  // Draw level badge top right
  ctx.save();
  ctx.fillStyle = s.level==='CCNA'?'rgba(74,222,128,0.12)':s.level==='CCNP'?'rgba(251,191,36,0.12)':'rgba(167,139,250,0.12)';
  rr(ctx, W-90, 6, 82, 22, 6); ctx.fill();
  ctx.strokeStyle=levelCol; ctx.lineWidth=1;
  rr(ctx, W-90, 6, 82, 22, 6); ctx.stroke();
  ctx.fillStyle=levelCol; ctx.font='bold 10px IBM Plex Mono,monospace';
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText('⬡ '+s.level+' LEVEL', W-49, 17);
  ctx.restore();
  drawZone(ctx,8,32,half-16,H-52,'iBGP — Internal BGP (Same AS)','#5b9cf6', leftActive?0.9:0.4);
  drawZone(ctx,half+8,32,half-16,H-52,'eBGP — External BGP (Different AS)','#4ade80', rightActive?0.9:0.4);

  // ══ LEFT SIDE — iBGP ══
  var iCY=H*0.42, iGap=Math.min(half*0.28,80);
  var iR=[
    {x:half*0.28, y:iCY-iGap, label:'R1', sub:'AS 100'},
    {x:half*0.72, y:iCY-iGap, label:'R2', sub:'AS 100'},
    {x:half*0.50, y:iCY+iGap, label:'R3', sub:'AS 100'}
  ];

  // Draw iBGP mesh links
  [[0,1],[0,2],[1,2]].forEach(function(pair){
    var hot = (peersPhase===1 && pair[0]===0 && pair[1]===1);
    var blocked = (peersPhase===2 && pair[0]===1 && pair[1]===2);
    var col = blocked?'#f87171': hot?'#5b9cf6':'#5b9cf6';
    var al  = blocked?0.6: hot?0.8:0.25;
    var dash= blocked?[4,3]:[];
    drawLink(ctx,iR[pair[0]].x,iR[pair[0]].y,iR[pair[1]].x,iR[pair[1]].y,col,hot?2.5:1.5,al,dash);
  });

  // Routers
  iR.forEach(function(n,i){
    var isActive = (peersPhase===1&&i<=1)||(peersPhase===2&&i>=1);
    var col = (peersPhase===2&&i===2)?'#f87171':'#5b9cf6';
    drawRouter(ctx,n.x,n.y,18,col,n.label,n.sub,isActive&&leftActive);
  });

  // AS label on each router
  ctx.save(); ctx.font='8px IBM Plex Mono,monospace'; ctx.textAlign='center';
  ctx.fillStyle='#5a6080';
  ctx.fillText('AS 100',half*0.50,iCY+iGap+36);
  ctx.restore();

  // Next-hop label for iBGP send phase
  if(peersPhase===1){
    var nhY=iR[0].y-32;
    ctx.save();
    ctx.font='bold 8px IBM Plex Mono,monospace'; ctx.textAlign='center';
    // Prefix box
    ctx.fillStyle='rgba(91,156,246,0.12)';
    rr(ctx,(iR[0].x+iR[1].x)/2-70,nhY-10,140,20,4); ctx.fill();
    ctx.strokeStyle='rgba(91,156,246,0.3)'; ctx.lineWidth=1;
    rr(ctx,(iR[0].x+iR[1].x)/2-70,nhY-10,140,20,4); ctx.stroke();
    ctx.fillStyle='#5b9cf6';
    ctx.fillText('10.0.0.0/8  NH: 203.0.113.1 (unchanged)',(iR[0].x+iR[1].x)/2,nhY+1);
    ctx.restore();
  }

  // Split horizon warning
  if(peersPhase===2){
    var wY=(iR[1].y+iR[2].y)/2;
    ctx.save();
    ctx.font='bold 9px IBM Plex Mono,monospace'; ctx.textAlign='center';
    ctx.fillStyle='rgba(248,113,113,0.15)';
    rr(ctx,half*0.5-90,wY-14,180,28,6); ctx.fill();
    ctx.strokeStyle='#f87171'; ctx.lineWidth=1.5;
    rr(ctx,half*0.5-90,wY-14,180,28,6); ctx.stroke();
    ctx.fillStyle='#f87171';
    ctx.fillText('✗ BLOCKED — Split-Horizon Rule',half*0.5,wY-2);
    ctx.font='8px IBM Plex Mono,monospace'; ctx.fillStyle='#8892b0';
    ctx.fillText('R2 cannot re-advertise iBGP learned route',half*0.5,wY+11);
    ctx.restore();
  }

  // iBGP fact pills at bottom left
  var fy=H-62;
  var iBGPFacts=['Same AS','NH Unchanged','TTL = 255','Full Mesh / RR needed'];
  ctx.save();
  iBGPFacts.forEach(function(f,i){
    var fx=18+(i%2)*((half-36)/2), ffy=fy+Math.floor(i/2)*16;
    ctx.fillStyle='rgba(91,156,246,0.08)';
    rr(ctx,fx,ffy-8,(half-44)/2,16,4); ctx.fill();
    ctx.strokeStyle='rgba(91,156,246,0.2)'; ctx.lineWidth=0.8;
    rr(ctx,fx,ffy-8,(half-44)/2,16,4); ctx.stroke();
    ctx.fillStyle='#5b9cf6'; ctx.font='8px IBM Plex Mono,monospace'; ctx.textAlign='center';
    ctx.fillText(f, fx+(half-44)/4, ffy+1);
  });
  ctx.restore();

  // ══ RIGHT SIDE — eBGP ══
  var eAX=half+half*0.22, eBX=half+half*0.78, eRY=H*0.42;
  var eActive=peersPhase>=3;

  // AS zones for eBGP side
  ctx.save();
  ctx.fillStyle='rgba(91,156,246,0.06)';
  ctx.fillRect(half+8,iCY-iGap-30,half*0.42,iGap*2+60);
  ctx.fillStyle='rgba(74,222,128,0.06)';
  ctx.fillRect(half+half*0.5,iCY-iGap-30,half*0.48,iGap*2+60);
  ctx.font='8px IBM Plex Mono,monospace'; ctx.textAlign='center';
  ctx.fillStyle='#5b9cf6'; ctx.fillText('AS 100',half+half*0.22,eRY+iGap+18);
  ctx.fillStyle='#4ade80'; ctx.fillText('AS 200',half+half*0.78,eRY+iGap+18);
  ctx.restore();

  // AS boundary dashed line
  var bndX=half+half*0.5;
  ctx.save(); ctx.strokeStyle=peersPhase>=3?'#5a6080':'rgba(90,96,128,0.2)';
  ctx.lineWidth=1; ctx.setLineDash([4,4]);
  ctx.beginPath(); ctx.moveTo(bndX,42); ctx.lineTo(bndX,H-48); ctx.stroke();
  ctx.setLineDash([]);
  ctx.font='bold 8px IBM Plex Mono,monospace'; ctx.textAlign='center';
  ctx.fillStyle='#5a6080'; ctx.fillText('AS Boundary',bndX,eRY+iGap+18);
  ctx.restore();

  // eBGP link
  var eLinkCol = peersPhase===4?'#fbbf24': peersPhase===5?'#a78bfa':'#4ade80';
  var eLinkAl  = eActive? (Math.sin(BA.t*3)*0.2+0.7) : 0.2;
  drawLink(ctx,eAX,eRY,eBX,eRY,eLinkCol,2.5,eLinkAl);

  // TTL label on link
  if(peersPhase===5){
    drawTag(ctx,(eAX+eBX)/2,eRY-22,'TTL = 1  (Direct link only!)','rgba(167,139,250,0.15)','#a78bfa');
    drawTag(ctx,(eAX+eBX)/2,eRY+22,'ebgp-multihop = increase TTL','rgba(167,139,250,0.1)','#a78bfa');
  } else if(eActive){
    drawTag(ctx,(eAX+eBX)/2,eRY-22,'eBGP Session','rgba(74,222,128,0.12)','#4ade80');
    drawTag(ctx,(eAX+eBX)/2,eRY+22,'TTL = 1','rgba(251,191,36,0.12)','#fbbf24');
  }

  drawRouter(ctx,eAX,eRY,22,'#5b9cf6','R-A','AS 100',eActive&&rightActive);
  drawRouter(ctx,eBX,eRY,22,'#4ade80','R-B','AS 200',eActive&&rightActive);

  // Next-hop change visual — phase 4
  if(peersPhase===4){
    var nhY2=eRY-42;
    ctx.save(); ctx.font='bold 8px IBM Plex Mono,monospace'; ctx.textAlign='center';
    // Before box (left of boundary)
    ctx.fillStyle='rgba(91,156,246,0.12)';
    rr(ctx,eAX-68,nhY2-11,136,22,4); ctx.fill();
    ctx.strokeStyle='rgba(91,156,246,0.3)'; ctx.lineWidth=1;
    rr(ctx,eAX-68,nhY2-11,136,22,4); ctx.stroke();
    ctx.fillStyle='#5b9cf6'; ctx.fillText('192.168.1.0/24  NH: 10.0.0.1',eAX,nhY2);
    // Arrow
    ctx.fillStyle='#fbbf24'; ctx.font='bold 12px sans-serif';
    ctx.fillText('→',bndX-8,nhY2+1);
    // After box (right of boundary)
    ctx.fillStyle='rgba(251,191,36,0.12)';
    rr(ctx,eBX-72,nhY2-11,144,22,4); ctx.fill();
    ctx.strokeStyle='rgba(251,191,36,0.4)'; ctx.lineWidth=1.5;
    rr(ctx,eBX-72,nhY2-11,144,22,4); ctx.stroke();
    ctx.fillStyle='#fbbf24'; ctx.fillText('192.168.1.0/24  NH: '+eAX.toFixed(0)+'→ R-A IP',eBX,nhY2);
    ctx.font='8px IBM Plex Mono,monospace'; ctx.fillStyle='#fbbf24';
    ctx.fillText('⚡ Next-Hop CHANGED to R-A interface IP',bndX,(nhY2+eRY)/2+4);
    ctx.restore();
  }

  // eBGP fact pills at bottom right
  var eBGPFacts=['Diff AS','NH Changed','TTL = 1','Direct Connect'];
  ctx.save();
  eBGPFacts.forEach(function(f,i){
    var fx=half+18+(i%2)*((half-36)/2), ffy=fy+Math.floor(i/2)*16;
    ctx.fillStyle='rgba(74,222,128,0.08)';
    rr(ctx,fx,ffy-8,(half-44)/2,16,4); ctx.fill();
    ctx.strokeStyle='rgba(74,222,128,0.2)'; ctx.lineWidth=0.8;
    rr(ctx,fx,ffy-8,(half-44)/2,16,4); ctx.stroke();
    ctx.fillStyle='#4ade80'; ctx.font='8px IBM Plex Mono,monospace'; ctx.textAlign='center';
    ctx.fillText(f, fx+(half-44)/4, ffy+1);
  });
  ctx.restore();

  // ── Packet animation ──
  peersTimer++;
  if(!BA.paused){
    if(peersPhase===1 && peersTimer%Math.round(60/BA.speed)===0){
      peersPackets.push({fx:iR[0].x,fy:iR[0].y,tx:iR[1].x,ty:iR[1].y,t:0,col:'#5b9cf6',lbl:'UPD'});
    }
    if(peersPhase===4 && peersTimer%Math.round(60/BA.speed)===0){
      peersPackets.push({fx:eAX,fy:eRY,tx:eBX,ty:eRY,t:0,col:'#fbbf24',lbl:'UPD',arc:true});
    }
    if(peersPhase===3 && peersTimer%Math.round(60/BA.speed)===0){
      peersPackets.push({fx:eAX,fy:eRY,tx:eBX,ty:eRY,t:0,col:'#4ade80',lbl:'UPD',arc:true});
    }
  }

  peersPackets = peersPackets.filter(function(p){
    p.t += 0.02*BA.speed; if(p.t>=1) return false;
    var px=lerp(p.fx,p.tx,eio(p.t));
    var py=p.arc? p.fy+Math.sin(p.t*Math.PI)*-36 : lerp(p.fy,p.ty,eio(p.t));
    drawPacket(ctx,px,py,p.lbl,p.col,10);
    return true;
  });

  // ── Phase timer ──
  peersPhaseTimer++;
  var phaseDur=Math.round(260/BA.speed);
  if(!BA.paused && peersPhaseTimer>phaseDur){
    peersPhaseTimer=0; peersPackets=[];
    peersPhase=(peersPhase+1)%PEERS_STEPS.length;
    var s=PEERS_STEPS[peersPhase];
    var levelBg = s.level==='CCNA'?'rgba(74,222,128,0.12)':s.level==='CCNP'?'rgba(251,191,36,0.12)':'rgba(167,139,250,0.12)';
    bgpSetStep(peersPhase+1, s.tag, levelBg, s.col,
      '['+(peersPhase+1)+'/'+PEERS_STEPS.length+'] ['+s.level+'] ['+(s.side==='ibgp'?'iBGP':'eBGP')+'] '+s.title,
      s.desc);
  }

  // Divider
  ctx.save(); ctx.strokeStyle='rgba(100,160,255,0.08)'; ctx.lineWidth=1; ctx.setLineDash([4,4]);
  ctx.beginPath(); ctx.moveTo(half,32); ctx.lineTo(half,H-20); ctx.stroke();
  ctx.setLineDash([]);
  ctx.font='bold 9px IBM Plex Mono,monospace'; ctx.textAlign='center';
  ctx.fillStyle='#5a6080'; ctx.fillText('vs',half,H/2);
  ctx.restore();

  drawLabel(ctx,W/2,18,'iBGP vs eBGP — Peering Modes Explained','#5a6080',10);
}

  // ════════════════════════════════════════════════════════════
  // 4. BEST PATH SELECTION
  // ════════════════════════════════════════════════════════════
  var BP_PATHS=[
    {id:'A',col:'#4ade80',lp:200,asp:['65001'],      med:50, wt:100,origin:'i'},
    {id:'B',col:'#f87171',lp:100,asp:['65002','65003'],med:10,wt:100,origin:'e'},
    {id:'C',col:'#f472b6',lp:200,asp:['65004','65005'],med:100,wt:100,origin:'i'}
  ];
  var BP_STEPS=[
    {s:1,rule:'① Weight (Cisco)',    w:'tie', desc:'All paths Weight=100. No decision — Weight equal. (Only Cisco; not in standard BGP.)'},
    {s:2,rule:'② Local Preference', w:'AC',  desc:'Path A & C have LP=200. Path B has LP=100. → Path B ELIMINATED. Higher LP always wins.'},
    {s:3,rule:'③ Locally Originated',w:'tie',desc:'None of the remaining paths are locally originated. A and C still tied — move to next step.'},
    {s:4,rule:'④ AS-PATH Length',   w:'A',   desc:'Path A has AS-PATH length 1 [65001]. Path C has length 2 [65004,65005]. → Path C ELIMINATED.'},
    {s:5,rule:'🏆 WINNER: Path A',  w:'A',   desc:'Path A wins! Highest LP=200 and shortest AS-PATH [65001]. Route installed in RIB and forwarded.'}
  ];
  var bpStep=0, bpTimer=0;

  function bgpDrawBestPath(ctx,W,H) {
    bpTimer++;
    if(!BA.paused && bpTimer>Math.round(160/BA.speed)){
      bpTimer=0; bpStep=(bpStep+1)%BP_STEPS.length;
      var s=BP_STEPS[bpStep];
      bgpSetStep(s.s,'STEP '+s.s,'rgba(251,191,36,0.12)','#fbbf24',s.rule,s.desc);
    }
    var cur=BP_STEPS[bpStep];
    var destX=W*0.88, destY=H*0.44;
    drawZone(ctx,W*0.79,35,W*0.19,H-50,'Destination','#38d9c0',0.6);
    drawRouter(ctx,destX,destY,24,'#38d9c0','R-D','10.0.0.0/8',true);

    BP_PATHS.forEach(function(path,i){
      var py=H*0.18+i*(H*0.22)+H*0.1;
      var elim = (cur.w==='AC'&&path.id==='B') || (cur.w==='A'&&(path.id==='B'||path.id==='C'));
      var isWin = bpStep===4&&path.id==='A';
      var al = elim?0.22:1;
      ctx.save(); ctx.globalAlpha=al;

      drawRouter(ctx,W*0.1,py,20,path.col,'R-'+path.id,'eBGP',isWin);
      drawLink(ctx,W*0.1+20,py,destX-24,destY, isWin?'#4ade80':elim?'#5a6080':path.col, isWin?3:1.5, elim?0.2:0.55, elim?[4,4]:[]);

      // Attribute tiles
      var attrs=[
        {k:'LP',   v:path.lp,              bg:'rgba(91,156,246,0.12)',  c:'#5b9cf6'},
        {k:'AS-PATH',v:'['+path.asp.join(',')+']', bg:'rgba(251,191,36,0.12)',c:'#fbbf24'},
        {k:'ALEN', v:path.asp.length,      bg:'rgba(167,139,250,0.12)', c:'#a78bfa'},
        {k:'MED',  v:path.med,             bg:'rgba(56,217,192,0.12)',  c:'#38d9c0'},
        {k:'ORIG', v:path.origin,          bg:'rgba(74,222,128,0.12)',  c:'#4ade80'}
      ];
      attrs.forEach(function(at,j){
        var ax=W*0.22+j*Math.min(94,W*0.12);
        var hot=(bpStep===1&&at.k==='LP')||(bpStep===3&&at.k==='ALEN');
        ctx.fillStyle=hot?at.bg:'rgba(24,29,46,0.6)';
        rr(ctx,ax,py-19,Math.min(85,W*0.11),38,6); ctx.fill();
        ctx.strokeStyle=hot?at.c:'rgba(100,160,255,0.1)'; ctx.lineWidth=hot?2:1;
        rr(ctx,ax,py-19,Math.min(85,W*0.11),38,6); ctx.stroke();
        ctx.textAlign='center'; ctx.textBaseline='middle';
        ctx.fillStyle='#5a6080'; ctx.font='8px IBM Plex Mono,monospace';
        ctx.fillText(at.k,ax+Math.min(85,W*0.11)/2,py-8);
        ctx.fillStyle=hot?at.c:'#e8eaf0'; ctx.font='bold 10px IBM Plex Mono,monospace';
        ctx.fillText(at.v,ax+Math.min(85,W*0.11)/2,py+6);
      });
      if(isWin) drawTag(ctx,W*0.1,py-44,'🏆 WINNER','rgba(74,222,128,0.18)','#4ade80');
      if(elim)  drawTag(ctx,W*0.1,py-44,'✗ ELIM','rgba(248,113,113,0.12)','#f87171');
      ctx.restore();
    });
    ctx.save(); ctx.font='bold 10px IBM Plex Mono,monospace'; ctx.textAlign='center'; ctx.fillStyle='#fbbf24';
    ctx.fillText('Decision Step '+(bpStep+1)+'/5: '+cur.rule, W/2, H-18); ctx.restore();
    drawLabel(ctx,W/2,18,'BGP Best Path Selection Algorithm','#5a6080',10);
  }

  // ════════════════════════════════════════════════════════════
// 5. ROUTE REFLECTOR vs FULL MESH
// ════════════════════════════════════════════════════════════
var rrPackets=[], rrTimer=0, rrPhase=0, rrPhaseTimer=0, rrActiveSender=0;

var RR_STEPS = [
  { tag:'PROBLEM',  col:'#f472b6', title:'Full Mesh iBGP — The Scaling Problem',
    desc:'With 5 routers in full mesh iBGP, each router needs a session to every other. That is n(n-1)/2 = 10 sessions. With 100 routers it becomes 4,950 sessions — completely unscalable!' },
  { tag:'SEND',     col:'#5b9cf6', title:'R1 Sends UPDATE to Route Reflector',
    desc:'In Route Reflector design, R1 (client) sends its UPDATE route to the RR only — just 1 session needed instead of connecting to all peers.' },
  { tag:'REFLECT',  col:'#4ade80', title:'RR Reflects Route to All Other Clients',
    desc:'The Route Reflector receives R1\'s UPDATE and REFLECTS it to R2, R3 and R4 automatically. Clients do not need to know about each other!' },
  { tag:'RESULT',   col:'#fbbf24', title:'All Clients Have R1\'s Route',
    desc:'R2, R3 and R4 all now have R1\'s route — reflected by RR. Total sessions = 4 (one per client). Compare: full mesh needed 10 sessions for same 5 routers.' },
  { tag:'SCALE',    col:'#38d9c0', title:'Why Route Reflector Wins at Scale',
    desc:'Full mesh: 100 routers = 4,950 sessions. Route Reflector: 100 routers = 99 sessions (each client connects only to RR). RR is the industry standard solution for iBGP scalability.' }
];

function bgpDrawRR(ctx,W,H) {
  var half=W/2;

  // ── Left side: Full Mesh ──
  drawZone(ctx,8,32,half-16,H-48,'Full Mesh iBGP','#f472b6',0.6);
  var fmCX=half*0.5, fmCY=H*0.46, R=Math.min(H*0.26,100);
  var fmN=[];
  for(var i=0;i<5;i++){
    var a=(i/5)*Math.PI*2-Math.PI/2;
    fmN.push({x:fmCX+Math.cos(a)*R, y:fmCY+Math.sin(a)*R});
  }
  // Draw all full mesh links — highlight all during phase 0
  for(var i=0;i<5;i++) for(var j=i+1;j<5;j++){
    var hot = rrPhase===0;
    drawLink(ctx,fmN[i].x,fmN[i].y,fmN[j].x,fmN[j].y,'#f472b6', hot?1.5:1, hot?0.5:0.2);
  }
  fmN.forEach(function(n,i){
    drawRouter(ctx,n.x,n.y,16,'#f472b6','R'+(i+1),'iBGP',rrPhase===0);
  });
  // Session count label
  ctx.save(); ctx.textAlign='center';
  ctx.font='bold 10px IBM Plex Mono,monospace'; ctx.fillStyle='#f472b6';
  ctx.fillText('5 routers = 10 sessions',fmCX,H-42);
  ctx.font='9px IBM Plex Mono,monospace'; ctx.fillStyle='#5a6080';
  ctx.fillText('n(n-1)/2 formula',fmCX,H-28);
  ctx.restore();

  // ── Right side: Route Reflector ──
  drawZone(ctx,half+8,32,half-16,H-48,'Route Reflector iBGP','#4ade80',0.6);
  var rrCX=half+half*0.5, rrCY=H*0.46;
  var rrCtr={x:rrCX, y:rrCY};
  var rrCli=[];
  for(var i=0;i<4;i++){
    var a=(i/4)*Math.PI*2-Math.PI/2;
    rrCli.push({x:rrCX+Math.cos(a)*R, y:rrCY+Math.sin(a)*R});
  }

  // Draw RR spokes — highlight active client during send phase
  rrCli.forEach(function(c,i){
    var isActive = (rrPhase===1 && i===rrActiveSender) || (rrPhase===2) || (rrPhase===3);
    drawLink(ctx,rrCtr.x,rrCtr.y,c.x,c.y,'#4ade80', isActive?2:1.2, isActive?0.7:0.25);
  });

  // Draw RR center
  var rrGlow = rrPhase===1||rrPhase===2||rrPhase===3;
  drawRouter(ctx,rrCtr.x,rrCtr.y,26,'#4ade80','RR','Reflector',rrGlow);

  // Draw clients — highlight receiver during reflect phase
  rrCli.forEach(function(c,i){
    var isSender   = rrPhase===1 && i===rrActiveSender;
    var isReceiver = rrPhase===2 && i!==rrActiveSender;
    var isDone     = rrPhase===3;
    var col = isSender?'#5b9cf6': isReceiver?'#fbbf24': isDone?'#4ade80':'#5b9cf6';
    drawRouter(ctx,c.x,c.y,18,col,'R'+(i+1), isSender?'Sender':isReceiver?'Got Route!':isDone?'✓ Route':'Client', isSender||isReceiver);
  });

  // Session count label
  ctx.save(); ctx.textAlign='center';
  ctx.font='bold 10px IBM Plex Mono,monospace'; ctx.fillStyle='#4ade80';
  ctx.fillText('5 routers = 4 sessions',rrCX,H-42);
  ctx.font='9px IBM Plex Mono,monospace'; ctx.fillStyle='#5a6080';
  ctx.fillText('each client connects to RR only',rrCX,H-28);
  ctx.restore();

  // ── Phase timer & packet animation ──
  rrPhaseTimer++;
  var phaseDur = Math.round(180/BA.speed);

  if(!BA.paused && rrPhaseTimer > phaseDur){
    rrPhaseTimer=0;
    rrPhase=(rrPhase+1)%RR_STEPS.length;
    if(rrPhase===1){ rrActiveSender=Math.floor(Math.random()*4); }
    rrPackets=[];
    var s=RR_STEPS[rrPhase];
    bgpSetStep(rrPhase+1, s.tag,'rgba(91,156,246,0.12)',s.col, s.title, s.desc);
  }

  // Phase 1: client → RR packet
  if(!BA.paused && rrPhase===1){
    if(rrTimer%Math.round(50/BA.speed)===0){
      var c=rrCli[rrActiveSender];
      rrPackets.push({fx:c.x,fy:c.y,tx:rrCtr.x,ty:rrCtr.y,t:0,col:'#5b9cf6',lbl:'UPD'});
    }
  }

  // Phase 2: RR → all other clients packets
  if(!BA.paused && rrPhase===2){
    if(rrTimer%Math.round(40/BA.speed)===0){
      rrCli.forEach(function(c,i){
        if(i!==rrActiveSender){
          rrPackets.push({fx:rrCtr.x,fy:rrCtr.y,tx:c.x,ty:c.y,t:0,col:'#4ade80',lbl:'RFL'});
        }
      });
    }
  }

  rrTimer++;

  // Move and draw packets
  rrPackets = rrPackets.filter(function(p){
    p.t += 0.022*BA.speed;
    if(p.t>=1) return false;
    drawPacket(ctx,lerp(p.fx,p.tx,eio(p.t)),lerp(p.fy,p.ty,eio(p.t)),p.lbl,p.col,8);
    return true;
  });

  // Phase label in centre divider
  ctx.save();
  ctx.strokeStyle='rgba(100,160,255,0.1)'; ctx.lineWidth=1; ctx.setLineDash([4,4]);
  ctx.beginPath(); ctx.moveTo(half,38); ctx.lineTo(half,H-20); ctx.stroke();
  ctx.setLineDash([]);
  ctx.font='bold 9px IBM Plex Mono,monospace'; ctx.textAlign='center';
  ctx.fillStyle='#5a6080';
  ctx.fillText('vs',half,H/2);
  ctx.restore();

  drawLabel(ctx,W/2,18,'iBGP Scalability — Full Mesh vs Route Reflector','#5a6080',10);
}

  // ════════════════════════════════════════════════════════════
  // 6. BGP COMMUNITIES
  // ════════════════════════════════════════════════════════════
  var COMM_ROUTES=[
    {pfx:'10.0.0.0/8',    comm:'65001:100',  action:'SET LP=200',             result:'PERMIT',col:'#5b9cf6',rc:'#4ade80',desc:'High-priority prefix. LP raised to 200, preferred exit.'},
    {pfx:'172.16.0.0/12', comm:'65001:200',  action:'LP=150 + AS-PREPEND',    result:'PERMIT',col:'#a78bfa',rc:'#fbbf24',desc:'Backup path. Lower LP, AS-PATH prepended to make less preferred inbound.'},
    {pfx:'192.168.0.0/16',comm:'no-export',  action:'BLOCK at AS boundary',   result:'BLOCK', col:'#38d9c0',rc:'#f87171',desc:'no-export community: not advertised to eBGP peers outside AS.'},
    {pfx:'10.100.0.0/24', comm:'no-advertise',action:'LOCAL RIB only',        result:'LOCAL', col:'#fbbf24',rc:'#fbbf24',desc:'no-advertise community: kept in local RIB only, not sent to any peer.'}
  ];
  var commTimer=0, commActiveRoute=-1, commPackets=[];

  function bgpDrawCommunity(ctx,W,H) {
    var inX=W*0.02, peX=W*0.35, outX=W*0.7;
    var sY=H*0.18, rH=(H*0.68)/COMM_ROUTES.length;
    var bw=W*0.29, pw=W*0.3, ow=W*0.27;

    // Zone labels
    drawLabel(ctx,inX+bw/2,sY-12,'Incoming Routes','#5b9cf6',9);
    ctx.save(); ctx.strokeStyle='#a78bfa'; ctx.lineWidth=1; ctx.setLineDash([4,3]);
    ctx.strokeRect(peX,sY-15,pw,COMM_ROUTES.length*rH+10);
    ctx.setLineDash([]); ctx.fillStyle='rgba(167,139,250,0.06)';
    ctx.fillRect(peX,sY-15,pw,COMM_ROUTES.length*rH+10);
    ctx.fillStyle='#a78bfa'; ctx.font='bold 9px IBM Plex Mono,monospace'; ctx.textAlign='center'; ctx.textBaseline='top';
    ctx.fillText('⚙  Route-Map / Community Policy Engine',peX+pw/2,sY-12); ctx.restore();
    drawLabel(ctx,outX+ow/2,sY-12,'Policy Result','#4ade80',9);

    commTimer++;
    if(!BA.paused && commTimer>Math.round(90/BA.speed)){
      commTimer=0; commActiveRoute=(commActiveRoute+1)%COMM_ROUTES.length;
      var r=COMM_ROUTES[commActiveRoute];
      commPackets.push({t:0,idx:commActiveRoute});
      bgpSetStep(commActiveRoute+1,'COMMUNITY','rgba(167,139,250,0.12)','#a78bfa',r.pfx+' ['+r.comm+']',r.desc+' — Policy: '+r.action);
    }

    COMM_ROUTES.forEach(function(route,i){
      var ry=sY+i*rH+rH/2;
      var hot=i===commActiveRoute;
      var al=hot?1:0.4;
      ctx.save(); ctx.globalAlpha=al;
      // Incoming box
      ctx.fillStyle=hot?'rgba(24,29,46,0.8)':'rgba(24,29,46,0.4)';
      rr(ctx,inX,ry-20,bw-5,40,8); ctx.fill();
      ctx.strokeStyle=hot?route.col:'rgba(100,160,255,0.08)'; ctx.lineWidth=hot?1.5:1;
      rr(ctx,inX,ry-20,bw-5,40,8); ctx.stroke();
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillStyle=route.col; ctx.font='bold 10px IBM Plex Mono,monospace';
      ctx.fillText(route.pfx,inX+(bw-5)/2,ry-7);
      ctx.fillStyle='#5a6080'; ctx.font='8px IBM Plex Mono,monospace';
      ctx.fillText('['+route.comm+']',inX+(bw-5)/2,ry+8);
      // Policy box
      ctx.fillStyle=hot?'rgba(167,139,250,0.08)':'transparent';
      rr(ctx,peX+4,ry-16,pw-8,32,6); ctx.fill();
      ctx.strokeStyle=hot?'#a78bfa':'rgba(100,160,255,0.05)'; ctx.lineWidth=1;
      rr(ctx,peX+4,ry-16,pw-8,32,6); ctx.stroke();
      ctx.fillStyle=hot?'#a78bfa':'#5a6080'; ctx.font=(hot?'bold ':'')+' 9px IBM Plex Mono,monospace';
      ctx.fillText(route.action,peX+4+(pw-8)/2,ry);
      // Result box
      ctx.fillStyle='rgba(24,29,46,0.5)';
      rr(ctx,outX,ry-16,ow,32,6); ctx.fill();
      ctx.strokeStyle=hot?route.rc:'rgba(100,160,255,0.06)'; ctx.lineWidth=hot?1.5:1;
      rr(ctx,outX,ry-16,ow,32,6); ctx.stroke();
      ctx.fillStyle=hot?route.rc:'#5a6080'; ctx.font='bold 10px IBM Plex Mono,monospace';
      ctx.fillText(route.result,outX+ow/2,ry);
      ctx.restore();
    });

    commPackets = commPackets.filter(function(p){
      p.t += 0.022*BA.speed; if(p.t>=1) return false;
      var route=COMM_ROUTES[p.idx];
      var ry=sY+p.idx*rH+rH/2;
      drawPacket(ctx,lerp(inX+bw,outX+ow*0.5,eio(p.t)),ry,'🏷',route.col,9);
      return true;
    });

    drawLabel(ctx,W/2,16,'BGP Communities — Policy-Based Route Control','#5a6080',10);
  }

  // ════════════════════════════════════════════════════════════
  // 7. ROUTE AGGREGATION
  // ════════════════════════════════════════════════════════════
  var SPECIFICS=[
    {pfx:'10.1.0.0/24',as:'65001',col:'#5b9cf6'},
    {pfx:'10.1.1.0/24',as:'65002',col:'#38d9c0'},
    {pfx:'10.1.2.0/24',as:'65001',col:'#4ade80'},
    {pfx:'10.1.3.0/24',as:'65003',col:'#fbbf24'}
  ];
  var aggTimer=0, aggPhase=0;

  function bgpDrawAggregate(ctx,W,H) {
    aggTimer++;
    if(!BA.paused){
      var d=Math.round(110/BA.speed);
      if(aggTimer>d*3){aggTimer=0;aggPhase=0;}
      else if(aggTimer>d*1.5) aggPhase=2;
      else if(aggTimer>d)     aggPhase=1;
      else                    aggPhase=0;
    }

    var spacing=W*0.85/SPECIFICS.length, startX=W*0.08;
    var specY=H*0.67, aggY=H*0.2;
    var bw=Math.min(148,spacing*0.82), bh=52;
    var rtrX=W/2, rtrY=H*0.45;

    // Router with command
    drawRouter(ctx,rtrX,rtrY,26,'#a78bfa','AGG-R','aggregate-address',false);
    ctx.save(); ctx.font='10px IBM Plex Mono,monospace'; ctx.textAlign='center'; ctx.textBaseline='middle';
    var cmd='aggregate-address 10.1.0.0/22 summary-only';
    var tw=ctx.measureText(cmd).width;
    ctx.fillStyle='rgba(12,15,26,0.9)';
    rr(ctx,rtrX-tw/2-8,rtrY+34,tw+16,20,4); ctx.fill();
    ctx.strokeStyle='rgba(167,139,250,0.3)'; ctx.lineWidth=1;
    rr(ctx,rtrX-tw/2-8,rtrY+34,tw+16,20,4); ctx.stroke();
    ctx.fillStyle='#a78bfa'; ctx.fillText(cmd,rtrX,rtrY+44); ctx.restore();

    // Merge progress
    var mProg = aggPhase===1 ? Math.min(1,(aggTimer-Math.round(110/BA.speed))/Math.round(60/BA.speed)) : 0;

    SPECIFICS.forEach(function(spec,i){
      var sx=startX+i*spacing+spacing/2, sy=specY;
      var al=aggPhase===2?0.2:1;
      ctx.save(); ctx.globalAlpha=al;
      ctx.fillStyle='rgba(24,29,46,0.8)';
      rr(ctx,sx-bw/2,sy-bh/2,bw,bh,8); ctx.fill();
      ctx.strokeStyle=spec.col; ctx.lineWidth=1.5;
      rr(ctx,sx-bw/2,sy-bh/2,bw,bh,8); ctx.stroke();
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillStyle=spec.col; ctx.font='bold 11px IBM Plex Mono,monospace';
      ctx.fillText(spec.pfx,sx,sy-9);
      ctx.fillStyle='#5a6080'; ctx.font='9px IBM Plex Mono,monospace';
      ctx.fillText('AS '+spec.as,sx,sy+9);
      ctx.restore();
      // Lines/packets
      drawLink(ctx,sx,sy-bh/2,rtrX,rtrY+26,spec.col,1,aggPhase===0?0.2:0.5,[3,3]);
      if(aggPhase===1&&mProg>0){
        drawPacket(ctx,lerp(sx,rtrX,eio(mProg)),lerp(sy-bh/2,rtrY+26,eio(mProg)),'',spec.col,7);
      }
    });

    // Aggregate box at top
    if(aggPhase>=1){
      var aAl=aggPhase===1?Math.min(1,(aggTimer-Math.round(110/BA.speed))/35):1;
      ctx.save(); ctx.globalAlpha=aAl;
      var aw=Math.min(280,W*0.38);
      ctx.fillStyle='rgba(74,222,128,0.1)';
      rr(ctx,W/2-aw/2,aggY-28,aw,58,10); ctx.fill();
      ctx.strokeStyle='#4ade80'; ctx.lineWidth=2;
      rr(ctx,W/2-aw/2,aggY-28,aw,58,10); ctx.stroke();
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillStyle='#4ade80'; ctx.font='bold 14px IBM Plex Mono,monospace'; ctx.fillText('10.1.0.0 / 22',W/2,aggY-10);
      ctx.fillStyle='#8892b0'; ctx.font='9px IBM Plex Mono,monospace'; ctx.fillText('AS_SET: {65001, 65002, 65003}',W/2,aggY+10);
      ctx.restore();
      drawArrow(ctx,rtrX,rtrY-26,W/2,aggY+30,'#4ade80',2,aAl*0.7);
    }
    if(aggPhase===2) drawTag(ctx,W/2+180,aggY,'✓ summary-only: specifics suppressed','rgba(74,222,128,0.1)','#4ade80');

    var descs=['Four specific /24 prefixes received by the aggregating router from different AS peers.',
      'aggregate-address command triggers summarization — specifics converging into /22 aggregate.',
      '10.1.0.0/22 is advertised. summary-only suppresses specific /24s. AS_SET {65001,65002,65003} prevents loops.'];
    if(BA.frame===0 || BA.frame%120===0) bgpSetStep(aggPhase+1,'AGG','rgba(56,217,192,0.12)','#38d9c0',
      ['Receiving Specific Routes','Aggregation in Progress','Aggregate Route Advertised'][aggPhase], descs[aggPhase]);
    drawLabel(ctx,W/2,17,'BGP Route Aggregation — Summarization','#5a6080',10);
  }

  // ════════════════════════════════════════════════════════════
  // 8. eBGP MULTIHOMING + TRAFFIC ENGINEERING
  // ════════════════════════════════════════════════════════════
  var mhPackets=[], mhTimer=0, mhPhaseTimer=0, mhMode='inbound';

  function bgpDrawMultihome(ctx,W,H) {
    var ispAX=W*0.2,  ispAY=H*0.1;
    var ispBX=W*0.8,  ispBY=H*0.1;
    var brAX=W*0.28,  brAY=H*0.38;
    var brBX=W*0.72,  brBY=H*0.38;
    var intX=W*0.5,   intY=H*0.63;
    var dstX=W*0.5,   dstY=H*0.83;

    drawZone(ctx,8,5,W-16,H*0.22,'Internet / ISPs','#5b9cf6',0.5);
    drawZone(ctx,8,H*0.25,W-16,H*0.68,'Customer AS 65000','#4ade80',0.5);

    drawRouter(ctx,ispAX,ispAY,26,'#38d9c0','ISP-A','AS 1000',false);
    drawRouter(ctx,ispBX,ispBY,26,'#a78bfa','ISP-B','AS 2000',false);
    drawRouter(ctx,brAX,brAY,22,'#5b9cf6','BR-A',mhMode==='outbound'?'LP=200':'Border',mhMode==='outbound');
    drawRouter(ctx,brBX,brBY,22,'#fbbf24','BR-B',mhMode==='outbound'?'LP=100':'Border',false);
    drawRouter(ctx,intX,intY,20,'#4ade80','INT-R','iBGP',false);
    drawRouter(ctx,dstX,dstY,16,'#38d9c0','Dest','10.0.0.0',false);

    // Links
    drawLink(ctx,ispAX,ispAY+26,brAX,brAY-22,'#38d9c0',2,0.7);
    drawLink(ctx,ispBX,ispBY+26,brBX,brBY-22,'#a78bfa',2,0.5);
    drawLink(ctx,brAX,brAY+22,intX,intY-20,'#5b9cf6',1.5,0.5);
    drawLink(ctx,brBX,brBY+22,intX,intY-20,'#fbbf24',1.5,0.5);
    drawLink(ctx,intX,intY+20,dstX,dstY-16,'#4ade80',1.5,0.6);
    drawLink(ctx,brAX+22,brAY,brBX-22,brBY,'#5b9cf6',1,0.3,[4,4]);

    // Mode-specific annotations
    if(mhMode==='inbound'){
      drawTag(ctx,(ispAX+brAX)/2-20,(ispAY+brAY)/2,'[1000,65000] len=2','rgba(56,217,192,0.12)','#38d9c0');
      drawTag(ctx,(ispBX+brBX)/2+40,(ispBY+brBY)/2,'[2000,65000,65000,65000] PREPENDED len=4','rgba(167,139,250,0.1)','#a78bfa');
      drawTag(ctx,ispAX,ispAY-36,'✓ PREFERRED (shorter path)','rgba(74,222,128,0.15)','#4ade80');
      drawTag(ctx,ispBX,ispBY-36,'✗ LONGER (prepended)','rgba(248,113,113,0.1)','#f87171');
    } else {
      drawTag(ctx,brAX-45,brAY-42,'LP=200 PRIMARY EXIT','rgba(74,222,128,0.15)','#4ade80');
      drawTag(ctx,brBX+55,brBY-42,'LP=100 BACKUP EXIT','rgba(248,113,113,0.1)','#f87171');
    }

    mhPhaseTimer++;
    if(!BA.paused && mhPhaseTimer>Math.round(260/BA.speed)){
      mhPhaseTimer=0; mhMode=mhMode==='inbound'?'outbound':'inbound';
      bgpSetStep(mhMode==='inbound'?1:2,'TE','rgba(251,191,36,0.12)','#fbbf24',
        mhMode==='inbound'?'Inbound Traffic Engineering (AS-PATH Prepending)':'Outbound Traffic Engineering (Local Preference)',
        mhMode==='inbound'
          ?'Internet prefers shortest AS-PATH. ISP-A path length=2, ISP-B prepended to length=4. External traffic enters via ISP-A automatically.'
          :'Local Preference controls which exit the AS uses. BR-A sets LP=200 (primary via ISP-A). BR-B sets LP=100 (backup). All routers prefer BR-A.');
    }

    mhTimer++;
    if(!BA.paused && mhTimer%Math.round(55/BA.speed)===0){
      if(mhMode==='inbound'){
        mhPackets.push({pts:[{x:ispAX,y:ispAY+26},{x:brAX,y:brAY-22},{x:intX,y:intY-20},{x:dstX,y:dstY-16}],t:0,col:'#38d9c0'});
      } else {
        mhPackets.push({pts:[{x:dstX,y:dstY-16},{x:intX,y:intY+20},{x:brAX,y:brAY+22},{x:ispAX,y:ispAY+26}],t:0,col:'#5b9cf6'});
      }
    }
    mhPackets = mhPackets.filter(function(p){
      p.t += 0.014*BA.speed; if(p.t>=1) return false;
      var segs=p.pts.length-1, st=p.t*segs, seg=Math.min(Math.floor(st),segs-1), lt=st-seg;
      drawPacket(ctx,lerp(p.pts[seg].x,p.pts[seg+1].x,eio(lt)),lerp(p.pts[seg].y,p.pts[seg+1].y,eio(lt)),'DATA',p.col,10);
      return true;
    });

    ctx.save(); ctx.font='bold 10px IBM Plex Mono,monospace'; ctx.textAlign='center';
    ctx.fillStyle=mhMode==='inbound'?'#38d9c0':'#5b9cf6';
    ctx.fillText(mhMode==='inbound'?'← Inbound: Internet traffic enters via ISP-A (shorter AS-PATH)':'→ Outbound: Customer exits via BR-A (higher Local Preference LP=200)',W/2,H-16);
    ctx.restore();
    drawLabel(ctx,W/2,18,'eBGP Multihoming — Traffic Engineering','#5a6080',10);
  }

  function bgpAnimPrev() {
    var idx = BGP_TOPICS.findIndex(function(t){ return t.id === BA.current; });
    if (idx > 0) bgpAnimLoad(BGP_TOPICS[idx - 1].id);
  }
  function bgpAnimNext() {
    var idx = BGP_TOPICS.findIndex(function(t){ return t.id === BA.current; });
    if (idx < BGP_TOPICS.length - 1) bgpAnimLoad(BGP_TOPICS[idx + 1].id);
  }
  function bgpAnimSetNamedSpeed(s) {
    var map = { slow: 0.3, normal: 0.8, fast: 1.3 };
    BA.speed = map[s] || 1;
    ['slow','normal','fast'].forEach(function(x) {
      var el = document.getElementById('bspeed-' + x);
      if (el) el.classList.toggle('active', x === s);
    });
  }