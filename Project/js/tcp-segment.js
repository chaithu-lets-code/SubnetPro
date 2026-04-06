// ═══════════════════════════════════════════════════
// TCP SEGMENT DEEP DIVE — tcp-segment.js
// Scenarios: Handshake, Data Transfer, Congestion,
//            Teardown, Retransmit, RST
// Visual: Topology header + Wireshark ladder diagram
// ═══════════════════════════════════════════════════

let tcpMode = 'handshake';
let tcpCurrentStep = 0, tcpPlaying = false, tcpPlayTimer = null;
let tcpRafId = null;      // requestAnimationFrame handle
let tcpTimerId = null;    // setTimeout handle (finalization + no-arrow steps)
let tcpSpeedMode = 'normal';

// ─── Layout constants ───
const TCP_CX = 130;       // Client column X
const TCP_SX = 630;       // Server column X
const TCP_HDR_H = 100;    // Header height (topology nodes)
const TCP_STEP_H = 72;    // Height per step in ladder

// ─── TCP State colour map ───
const TCP_STATE_COLORS = {
  'CLOSED':      '#5a6080',
  'LISTEN':      '#5b9cf6',
  'SYN_SENT':    '#fbbf24',
  'SYN_RCVD':    '#f97316',
  'ESTABLISHED': '#4ade80',
  'FIN_WAIT_1':  '#a78bfa',
  'FIN_WAIT_2':  '#8b5cf6',
  'CLOSE_WAIT':  '#f97316',
  'LAST_ACK':    '#f87171',
  'TIME_WAIT':   '#ef4444',
};

// ─── Speed control ───
function tcpSetSpeed(s) {
  tcpSpeedMode = s;
  ['slow','normal','fast','manual'].forEach(x => {
    const el = document.getElementById('tspeed-' + x);
    if (el) el.classList.toggle('active', x === s);
  });
}
function tcpGetSegDur()    { return {slow:2200, normal:1100, fast:480, manual:900}[tcpSpeedMode]; }
function tcpGetAutoDelay() { return {slow:5500, normal:2800, fast:1200, manual:999999}[tcpSpeedMode]; }

// ═══════════════════════════════════════════════════
// STEP DATA — 6 SCENARIOS
// ═══════════════════════════════════════════════════

const TCP_STEPS = {

  // ────────────────────────────────────────────────
  // SCENARIO 1: 3-WAY HANDSHAKE
  // ────────────────────────────────────────────────
  handshake: [
    {
      step:1, title:'Step 1 — Client Sends SYN (Connection Request)',
      tag:'SYN', tagColor:'var(--amber)', tagBg:'rgba(251,191,36,0.12)',
      desc:'Client picks a random <strong>Initial Sequence Number (ISN = 1000)</strong> and sends SYN. ISN is random (RFC 6528) to prevent old segments from confusing new connections and to prevent TCP hijacking. The SYN flag <em>consumes 1 sequence number</em> — even though no data is carried.',
      dir:'c2s', label:'SYN', sub:'Seq=1000  Flags=SYN  Win=65535  Len=0',
      arrowColor:'#fbbf24', clientState:'SYN_SENT', serverState:'LISTEN',
      fields:[
        {k:'Flags',        v:'SYN (0x002)',                    c:'#fbbf24'},
        {k:'Seq Num',      v:'1000  (ISN — random!)',          c:'#fbbf24'},
        {k:'Ack Num',      v:'0  (not set yet)'},
        {k:'Window',       v:'65535 bytes  (recv buffer)'},
        {k:'MSS Option',   v:'1460 bytes  (typical Ethernet)'},
        {k:'WSCALE Option',v:'7  (actual window × 128)'},
        {k:'SACK Permitted',v:'Yes  (negotiated here)'},
        {k:'Why random ISN?',v:'Prevents hijacking & stale seg confusion'},
      ],
    },
    {
      step:2, title:'Step 2 — Server Replies SYN-ACK',
      tag:'SYN-ACK', tagColor:'var(--green)', tagBg:'rgba(74,222,128,0.12)',
      desc:'Server picks its own ISN (2000) and acknowledges the client SYN. <strong>Ack = Client ISN + 1 = 1001</strong> — because SYN consumes one sequence number. Server enters SYN_RCVD and allocates a half-open connection in its backlog queue.',
      dir:'s2c', label:'SYN-ACK', sub:'Seq=2000  Ack=1001  Flags=SYN+ACK  Win=32768  Len=0',
      arrowColor:'#4ade80', clientState:'SYN_SENT', serverState:'SYN_RCVD',
      fields:[
        {k:'Flags',        v:'SYN + ACK (0x012)',             c:'#4ade80'},
        {k:'Seq Num',      v:'2000  (Server ISN)',            c:'#4ade80'},
        {k:'Ack Num',      v:'1001  (Client ISN + 1)',        c:'#38d9c0'},
        {k:'Why Ack+1?',   v:'SYN consumes 1 sequence number'},
        {k:'Window',       v:'32768 bytes  (server recv buf)'},
        {k:'Server State', v:'SYN_RCVD  (half-open)'},
        {k:'Backlog queue',v:'Stored — waiting for final ACK'},
        {k:'SYN cookies',  v:'Stateless defense against SYN flood'},
      ],
    },
    {
      step:3, title:'Step 3 — Client Sends ACK → Both ESTABLISHED',
      tag:'ACK', tagColor:'var(--blue)', tagBg:'rgba(91,156,246,0.12)',
      desc:'Client ACKs the server SYN-ACK: <strong>Ack = Server ISN + 1 = 2001</strong>. Both sides are now <strong>ESTABLISHED</strong>. This completes the 3-way handshake in exactly <strong>1 RTT</strong>. Client can piggyback data on this ACK (common in HTTP/2).',
      dir:'c2s', label:'ACK', sub:'Seq=1001  Ack=2001  Flags=ACK  Win=65535  Len=0',
      arrowColor:'#5b9cf6', clientState:'ESTABLISHED', serverState:'ESTABLISHED',
      fields:[
        {k:'Flags',        v:'ACK (0x010)',                   c:'#5b9cf6'},
        {k:'Seq Num',      v:'1001  (Client ISN + 1)',        c:'#5b9cf6'},
        {k:'Ack Num',      v:'2001  (Server ISN + 1)',        c:'#38d9c0'},
        {k:'Client State', v:'ESTABLISHED ✓',                 c:'#4ade80'},
        {k:'Server State', v:'ESTABLISHED ✓  (on receive)',   c:'#4ade80'},
        {k:'Data piggyback',v:'Client can send data immediately'},
        {k:'Total cost',   v:'1 RTT to establish connection'},
        {k:'TLS 1.3',      v:'Adds 1 more RTT  (TLS 1.2 = 2 RTT)'},
      ],
    },
    {
      step:4, title:'Step 4 — Options Negotiated During Handshake',
      tag:'OPTIONS', tagColor:'var(--cyan)', tagBg:'rgba(56,217,192,0.12)',
      desc:'During the SYN / SYN-ACK, both sides negotiate <strong>TCP Options</strong> that cannot be changed after the handshake: MSS, Window Scaling (allows windows beyond 65535 bytes), SACK Permitted, and Timestamps (RTT measurement + PAWS). If one side omits an option, it is disabled for the session.',
      dir:'none', label:'OPTIONS NEGOTIATED', arrowColor:'#38d9c0',
      clientState:'ESTABLISHED', serverState:'ESTABLISHED',
      fields:[
        {k:'MSS',          v:'1460 B  (MTU 1500 − IP 20 − TCP 20)'},
        {k:'Window Scale', v:'×128 → actual window up to 8.5 MB',  c:'#38d9c0'},
        {k:'SACK',         v:'Permitted → selective retransmit',   c:'#4ade80'},
        {k:'Timestamps',   v:'RTT measurement + PAWS protection'},
        {k:'PAWS',         v:'Protect Against Wrapped Seq numbers'},
        {k:'TFO',          v:'TCP Fast Open — data in SYN (RFC 7413)'},
        {k:'Why 3-way?',   v:'Ensures BOTH sides can send AND receive'},
        {k:'SYN flood',    v:'Defense: SYN cookies — no state allocated'},
      ],
    },
  ],

  // ────────────────────────────────────────────────
  // SCENARIO 2: DATA TRANSFER + WINDOW SIZING
  // ────────────────────────────────────────────────
  data: [
    {
      step:1, title:'Step 1 — Client Sends First Data Segment',
      tag:'DATA SEND', tagColor:'var(--blue)', tagBg:'rgba(91,156,246,0.12)',
      desc:'Connection ESTABLISHED. Client sends 500 bytes (HTTP GET). <strong>PSH</strong> flag tells the server to deliver this to the application immediately — do not buffer waiting for more data. ACK flag is always set after the handshake. Seq=1001 is the first data byte.',
      dir:'c2s', label:'PSH+ACK', sub:'Seq=1001  Ack=2001  Len=500  [HTTP GET /]',
      arrowColor:'#5b9cf6', clientState:'ESTABLISHED', serverState:'ESTABLISHED',
      fields:[
        {k:'Flags',        v:'PSH + ACK (0x018)',             c:'#5b9cf6'},
        {k:'Seq Num',      v:'1001  (first data byte)',       c:'#5b9cf6'},
        {k:'Ack Num',      v:'2001  (acking server ISN+1)'},
        {k:'Length',       v:'500 bytes  (HTTP GET request)'},
        {k:'Data range',   v:'bytes 1001 – 1500'},
        {k:'PSH flag',     v:'Deliver to application NOW'},
        {k:'Next Seq',     v:'1001 + 500 = 1501'},
        {k:'Payload',      v:'GET /index.html HTTP/1.1'},
      ],
    },
    {
      step:2, title:'Step 2 — Client Sends Second Segment (Pipelining!)',
      tag:'PIPELINING', tagColor:'var(--blue)', tagBg:'rgba(91,156,246,0.12)',
      desc:'Client <em>doesn\'t wait</em> for an ACK — it sends another segment immediately. This is <strong>TCP pipelining</strong>. As long as outstanding data < receive window (65535 bytes), the sender keeps sending. This eliminates stop-and-wait latency and fills the pipe efficiently.',
      dir:'c2s', label:'PSH+ACK', sub:'Seq=1501  Ack=2001  Len=500  [continues]',
      arrowColor:'#5b9cf6', clientState:'ESTABLISHED', serverState:'ESTABLISHED',
      fields:[
        {k:'Flags',        v:'PSH + ACK (0x018)',             c:'#5b9cf6'},
        {k:'Seq Num',      v:'1501  (next byte)',             c:'#5b9cf6'},
        {k:'Length',       v:'500 bytes'},
        {k:'Data range',   v:'bytes 1501 – 2000'},
        {k:'Pipelining',   v:'Sent without waiting for ACK!', c:'#4ade80'},
        {k:'Outstanding',  v:'1000 bytes in-flight'},
        {k:'Window left',  v:'65535 − 1000 = 64535 bytes'},
        {k:'Nagle algo',   v:'Batches small segments  (RFC 896)'},
      ],
    },
    {
      step:3, title:'Step 3 — Server Cumulative ACK (Covers Both Segments)',
      tag:'CUMUL. ACK', tagColor:'var(--green)', tagBg:'rgba(74,222,128,0.12)',
      desc:'Server acknowledges <strong>both</strong> segments with a single ACK: <strong>Ack=2001</strong> means "I have everything up to byte 2000 — send 2001 next." One ACK covers multiple segments. TCP Delayed ACK (RFC 1122): server may wait up to 200 ms to see if it can piggyback on a response.',
      dir:'s2c', label:'ACK', sub:'Ack=2001  Win=65535  Len=0  [covers both segs]',
      arrowColor:'#4ade80', clientState:'ESTABLISHED', serverState:'ESTABLISHED',
      fields:[
        {k:'Ack Num',      v:'2001 — cumulative!',            c:'#4ade80'},
        {k:'Covers',       v:'Segments 1 AND 2  (1000 bytes)'},
        {k:'Window',       v:'65535  (server can receive more)'},
        {k:'Delayed ACK',  v:'Server waits 40–200 ms to batch'},
        {k:'ACK every N',  v:'ACK every 2nd full-sized segment'},
        {k:'Client now',   v:'Knows server got bytes 1001–2000'},
        {k:'In-flight',    v:'0  (all acknowledged)'},
        {k:'RFC 5681',     v:'Delayed ACK rules'},
      ],
    },
    {
      step:4, title:'Step 4 — Server Sends HTTP Response',
      tag:'RESPONSE', tagColor:'var(--cyan)', tagBg:'rgba(56,217,192,0.12)',
      desc:'Server sends the HTTP 200 OK response. Large responses are <strong>segmented</strong> by TCP at the MSS boundary (1460 bytes). The client\'s receive window tells the server how much data it can send before waiting for an ACK — this is <em>flow control</em>.',
      dir:'s2c', label:'PSH+ACK', sub:'Seq=2001  Ack=2001  Len=1460  [HTTP 200 OK]',
      arrowColor:'#38d9c0', clientState:'ESTABLISHED', serverState:'ESTABLISHED',
      fields:[
        {k:'Flags',        v:'PSH + ACK (0x018)',             c:'#38d9c0'},
        {k:'Seq Num',      v:'2001',                          c:'#38d9c0'},
        {k:'Length',       v:'1460 bytes  (1 full MSS)'},
        {k:'MSS',          v:'1460 = MTU(1500) − IP(20) − TCP(20)'},
        {k:'Data range',   v:'bytes 2001 – 3460'},
        {k:'HTTP response',v:'HTTP/1.1 200 OK + Content-Type'},
        {k:'Flow control', v:'Client recv window limits server rate'},
        {k:'Segmentation', v:'TCP splits large data at MSS boundary'},
      ],
    },
    {
      step:5, title:'Step 5 — Server Continues (Sliding Window in Action)',
      tag:'SLIDING WIN', tagColor:'var(--cyan)', tagBg:'rgba(56,217,192,0.12)',
      desc:'Server sends another full-MSS segment without waiting for ACK. The <strong>sliding window</strong> allows multiple unACK\'d segments in-flight simultaneously. As the client sends ACKs, the window "slides" forward — this is the key to high-throughput TCP.',
      dir:'s2c', label:'PSH+ACK', sub:'Seq=3461  Ack=2001  Len=1460  [body continued]',
      arrowColor:'#38d9c0', clientState:'ESTABLISHED', serverState:'ESTABLISHED',
      fields:[
        {k:'Seq Num',      v:'3461  (next segment)',          c:'#38d9c0'},
        {k:'Length',       v:'1460 bytes'},
        {k:'In-flight',    v:'2920 bytes  (2 segs unACK\'d)'},
        {k:'Sliding window',v:'Advances as ACKs arrive',      c:'#4ade80'},
        {k:'Send buffer',  v:'Server socket send buffer'},
        {k:'Recv buffer',  v:'Client socket receive buffer'},
        {k:'Flow control', v:'Window prevents buffer overflow'},
        {k:'Zero window',  v:'Win=0 → sender MUST stop!'},
      ],
    },
    {
      step:6, title:'Step 6 — Client ACKs + Advertises Shrinking Window',
      tag:'WIN UPDATE', tagColor:'var(--amber)', tagBg:'rgba(251,191,36,0.12)',
      desc:'Client ACKs both response segments. The receive window has <strong>shrunk</strong> because the application hasn\'t read all data from the socket buffer yet: <strong>Win=62616</strong> (down from 65535). This is flow control in action. If Win=0, the server must stop completely and send a 1-byte window probe to check periodically.',
      dir:'c2s', label:'ACK', sub:'Ack=4921  Win=62616  Len=0  [window shrinking!]',
      arrowColor:'#fbbf24', clientState:'ESTABLISHED', serverState:'ESTABLISHED',
      fields:[
        {k:'Ack Num',      v:'4921 — covers both responses', c:'#4ade80'},
        {k:'Window',       v:'62616  (app not reading fast)', c:'#fbbf24'},
        {k:'Win shrink',   v:'Recv buffer filling up!'},
        {k:'Zero window',  v:'Win=0 → server stops sending'},
        {k:'Win probe',    v:'1-byte probe to reopen window'},
        {k:'Persist timer',v:'Prevents deadlock on zero window'},
        {k:'Buffer bloat', v:'Large buffers = high latency (Bufferbloat)'},
        {k:'Recv buffer',  v:'Grows as app reads data via read()'},
      ],
    },
  ],

  // ────────────────────────────────────────────────
  // SCENARIO 3: SLOW START / CONGESTION CONTROL
  // ────────────────────────────────────────────────
  congestion: [
    {
      step:1, title:'Step 1 — Slow Start Phase Begins (cwnd=1 MSS)',
      tag:'SLOW START', tagColor:'var(--amber)', tagBg:'rgba(251,191,36,0.12)',
      desc:'New connection established. TCP knows nothing about network capacity — it starts conservatively with <strong>cwnd = 1 MSS</strong>. ssthresh = 64 MSS (initial guess). Growth rule: <strong>cwnd += 1 per ACK received</strong> → cwnd doubles every RTT. Despite the name, this is actually exponential growth!',
      dir:'none', label:'cwnd=1 MSS  ssthresh=64', arrowColor:'#fbbf24',
      clientState:'ESTABLISHED', serverState:'ESTABLISHED', cwnd:1, ssthresh:64,
      fields:[
        {k:'cwnd',         v:'1 MSS = 1460 bytes',            c:'#fbbf24'},
        {k:'ssthresh',     v:'64 MSS  (initial threshold)',   c:'#a78bfa'},
        {k:'Phase',        v:'Slow Start  (exponential growth)'},
        {k:'Growth rule',  v:'cwnd += 1 per ACK  → doubles/RTT'},
        {k:'Why start=1?', v:'Unknown network capacity'},
        {k:'RFC 5681',     v:'TCP Congestion Control'},
        {k:'Linux default',v:'CUBIC  (RFC 8312)'},
        {k:'Google BBR',   v:'Model-based  (no loss signal)'},
      ],
    },
    {
      step:2, title:'Step 2 — RTT 1: cwnd 1 → 2 MSS',
      tag:'cwnd: 2 MSS', tagColor:'var(--amber)', tagBg:'rgba(251,191,36,0.12)',
      desc:'Client sends 1 segment. Server ACKs it. Per rule: cwnd += 1 per ACK → <strong>cwnd = 2 MSS</strong>. Next RTT can send 2 segments simultaneously. Pattern: 1 → 2 → 4 → 8 — exponential. The growth feels "slow" only at the very start.',
      dir:'c2s', label:'1 segment →', sub:'ACK received → cwnd: 1 → 2 MSS',
      arrowColor:'#fbbf24', clientState:'ESTABLISHED', serverState:'ESTABLISHED', cwnd:2, ssthresh:64,
      fields:[
        {k:'RTT 1',        v:'Sent 1 segment  →  got 1 ACK'},
        {k:'cwnd now',     v:'2 MSS = 2920 bytes',            c:'#fbbf24'},
        {k:'ssthresh',     v:'64 MSS  (unchanged)',           c:'#a78bfa'},
        {k:'Growth',       v:'+1 MSS per ACK'},
        {k:'Exponential',  v:'Doubles every full RTT'},
        {k:'Next RTT',     v:'Will send 2 segments'},
        {k:'Phase',        v:'Still Slow Start'},
        {k:'Runway left',  v:'cwnd(2) << ssthresh(64)'},
      ],
    },
    {
      step:3, title:'Step 3 — RTT 2 & 3: cwnd Continues Doubling',
      tag:'cwnd: 8 MSS', tagColor:'var(--amber)', tagBg:'rgba(251,191,36,0.12)',
      desc:'RTT2: cwnd 2 → 4. RTT3: cwnd 4 → 8. Each ACK increments cwnd by 1 MSS. In a RTT where N segments are in-flight, N ACKs arrive → cwnd grows by N → effectively doubles. ssthresh is still far away at 64.',
      dir:'c2s', label:'2→4 segs →', sub:'RTT2: cwnd 2→4   RTT3: cwnd 4→8',
      arrowColor:'#fbbf24', clientState:'ESTABLISHED', serverState:'ESTABLISHED', cwnd:8, ssthresh:64,
      fields:[
        {k:'RTT 2',        v:'cwnd 2 → 4 MSS',               c:'#fbbf24'},
        {k:'RTT 3',        v:'cwnd 4 → 8 MSS',               c:'#fbbf24'},
        {k:'Pattern',      v:'1 → 2 → 4 → 8 → 16 → 32…'},
        {k:'cwnd now',     v:'8 MSS = 11,680 bytes'},
        {k:'ssthresh',     v:'64 MSS  (still far)',           c:'#a78bfa'},
        {k:'Throughput',   v:'Growing rapidly each RTT!'},
        {k:'Phase',        v:'Still Slow Start'},
        {k:'Next',         v:'cwnd doubles until ssthresh hit'},
      ],
    },
    {
      step:4, title:'Step 4 — ssthresh Reached → Congestion Avoidance',
      tag:'CONG. AVOID', tagColor:'var(--purple)', tagBg:'rgba(167,139,250,0.12)',
      desc:'cwnd reaches <strong>ssthresh = 64 MSS</strong>. TCP switches from exponential to <strong>linear</strong> growth: cwnd += 1 MSS per RTT. This is the "Additive Increase" in AIMD. TCP is now carefully probing for available bandwidth without overwhelming the network.',
      dir:'c2s', label:'64 segs →', sub:'cwnd = ssthresh = 64 → Congestion Avoidance',
      arrowColor:'#a78bfa', clientState:'ESTABLISHED', serverState:'ESTABLISHED', cwnd:64, ssthresh:64,
      fields:[
        {k:'cwnd',         v:'64 MSS = 93,440 bytes',         c:'#a78bfa'},
        {k:'ssthresh',     v:'64 MSS  (threshold hit!)',      c:'#a78bfa'},
        {k:'Phase',        v:'Congestion Avoidance',          c:'#a78bfa'},
        {k:'Growth rate',  v:'+1 MSS per RTT  (linear)',      c:'#4ade80'},
        {k:'Algorithm',    v:'cwnd += MSS²/cwnd per ACK'},
        {k:'AIMD',         v:'Additive Increase Multiplicative Decrease'},
        {k:'Why linear?',  v:'Gentle probing for spare bandwidth'},
        {k:'Next',         v:'Grows slowly until loss detected'},
      ],
    },
    {
      step:5, title:'Step 5 — Packet Loss via RTO (Severe Congestion)',
      tag:'LOSS / RTO', tagColor:'var(--red)', tagBg:'rgba(248,113,113,0.12)',
      desc:'A segment was not ACK\'d within the <strong>Retransmission Timeout (RTO)</strong>. TCP interprets this as severe congestion. <strong>ssthresh = cwnd / 2</strong>. <strong>cwnd = 1 MSS</strong> — back to Slow Start! RTO is calculated from RTT using Jacobson\'s algorithm (SRTT + 4×RTTVAR). Minimum RTO = 1 second.',
      dir:'none', label:'RTO! ssthresh=48  cwnd=1', arrowColor:'#f87171',
      clientState:'ESTABLISHED', serverState:'ESTABLISHED', cwnd:1, ssthresh:48,
      fields:[
        {k:'Event',        v:'Retransmit Timeout  (RTO)!',    c:'#f87171'},
        {k:'ssthresh',     v:'cwnd/2 = 48 MSS',              c:'#a78bfa'},
        {k:'New cwnd',     v:'1 MSS — back to Slow Start!',  c:'#f87171'},
        {k:'RTO formula',  v:'SRTT + 4×RTTVAR  (Jacobson)'},
        {k:'Min RTO',      v:'1 second  (RFC 6298)'},
        {k:'Backoff',      v:'RTO doubles on each timeout  (Karn\'s)'},
        {k:'Max backoff',  v:'64 seconds  (Linux default)'},
        {k:'Phase',        v:'Slow Start again  (from cwnd=1)'},
      ],
    },
    {
      step:6, title:'Step 6 — Fast Retransmit (3 Dup ACKs)',
      tag:'FAST REXMIT', tagColor:'var(--amber)', tagBg:'rgba(251,191,36,0.12)',
      desc:'Better recovery: <strong>3 duplicate ACKs</strong> fire Fast Retransmit <em>without</em> waiting for RTO. Since other segments are still arriving, loss is likely isolated — not full congestion. TCP Reno: <strong>ssthresh = cwnd/2, cwnd = ssthresh</strong>. Jumps directly to Congestion Avoidance — no Slow Start!',
      dir:'s2c', label:'Dup ACK ×3', sub:'3 dup ACKs → Fast Retransmit → cwnd=ssthresh',
      arrowColor:'#fbbf24', clientState:'ESTABLISHED', serverState:'ESTABLISHED', cwnd:48, ssthresh:48,
      fields:[
        {k:'Trigger',      v:'3 duplicate ACKs received',     c:'#fbbf24'},
        {k:'Means',        v:'One segment lost, rest arriving'},
        {k:'ssthresh',     v:'cwnd / 2 = 48 MSS',            c:'#a78bfa'},
        {k:'New cwnd',     v:'48 MSS  (= ssthresh)',          c:'#fbbf24'},
        {k:'Phase',        v:'Congestion Avoidance directly!', c:'#4ade80'},
        {k:'TCP Reno',     v:'Fast Recovery state'},
        {k:'TCP CUBIC',    v:'More conservative reduction'},
        {k:'vs RTO',       v:'Much faster! No 1-second wait'},
      ],
    },
    {
      step:7, title:'Step 7 — SACK: Surgical Retransmission (CCIE Level)',
      tag:'SACK', tagColor:'var(--cyan)', tagBg:'rgba(56,217,192,0.12)',
      desc:'With <strong>SACK</strong> (negotiated in handshake), the receiver tells sender exactly which ranges it holds — even if out-of-order. Sender retransmits <em>only the missing holes</em>. Without SACK, the sender must retransmit from the first missing byte onward — even segments the receiver already has.',
      dir:'s2c', label:'ACK + SACK', sub:'Ack=1501  SACK:{2001-3001}  → retransmit only 1501',
      arrowColor:'#38d9c0', clientState:'ESTABLISHED', serverState:'ESTABLISHED', cwnd:48, ssthresh:48,
      fields:[
        {k:'SACK block',   v:'Ack=1501  SACK={2001–3001}',   c:'#38d9c0'},
        {k:'Means',        v:'Missing: 1501.  Have: 2001-3001'},
        {k:'Sender does',  v:'Retransmit ONLY Seq=1501',     c:'#4ade80'},
        {k:'Without SACK', v:'Retransmit 1501,2001,2501…',  c:'#f87171'},
        {k:'D-SACK',       v:'Reports duplicate segments received'},
        {k:'FACK',         v:'Forward ACK — tracks highest SACK block'},
        {k:'RFC 2018',     v:'SACK Option'},
        {k:'Enable',       v:'net.ipv4.tcp_sack=1  (Linux default)'},
      ],
    },
  ],

  // ────────────────────────────────────────────────
  // SCENARIO 4: 4-WAY TEARDOWN + TIME_WAIT
  // ────────────────────────────────────────────────
  teardown: [
    {
      step:1, title:'Step 1 — Client Sends FIN (Active Close)',
      tag:'FIN', tagColor:'var(--purple)', tagBg:'rgba(167,139,250,0.12)',
      desc:'Client has sent all data and initiates close by sending <strong>FIN+ACK</strong>. FIN consumes 1 sequence number (like SYN). Client → <strong>FIN_WAIT_1</strong>. Critical: FIN only closes the <em>client→server</em> direction. The server can still send remaining data (half-close).',
      dir:'c2s', label:'FIN+ACK', sub:'Seq=5000  Ack=4001  Flags=FIN+ACK  Len=0',
      arrowColor:'#a78bfa', clientState:'FIN_WAIT_1', serverState:'ESTABLISHED',
      fields:[
        {k:'Flags',        v:'FIN + ACK (0x011)',             c:'#a78bfa'},
        {k:'Seq Num',      v:'5000  (consumes 1 seq!)',       c:'#a78bfa'},
        {k:'Client State', v:'FIN_WAIT_1',                   c:'#fbbf24'},
        {k:'Server State', v:'ESTABLISHED  (can still send!)'},
        {k:'Half-close',   v:'Only c→s direction closed'},
        {k:'Server can',   v:'Continue sending data to client'},
        {k:'Why 4-way?',   v:'Each direction closes independently'},
        {k:'Active close', v:'Whoever sends FIN first → TIME_WAIT'},
      ],
    },
    {
      step:2, title:'Step 2 — Server ACKs FIN (Half-Closed State)',
      tag:'ACK', tagColor:'var(--green)', tagBg:'rgba(74,222,128,0.12)',
      desc:'Server immediately ACKs the FIN: <strong>Ack = 5001</strong>. Server → <strong>CLOSE_WAIT</strong> (waiting for app to finish sending). Client → <strong>FIN_WAIT_2</strong>. The connection is now half-closed — client cannot send, but server still can.',
      dir:'s2c', label:'ACK', sub:'Seq=4001  Ack=5001  Flags=ACK  [half-close]',
      arrowColor:'#4ade80', clientState:'FIN_WAIT_2', serverState:'CLOSE_WAIT',
      fields:[
        {k:'Flags',        v:'ACK (0x010)',                   c:'#4ade80'},
        {k:'Ack Num',      v:'5001  (FIN seq + 1)',           c:'#4ade80'},
        {k:'Server State', v:'CLOSE_WAIT',                   c:'#fbbf24'},
        {k:'Client State', v:'FIN_WAIT_2',                   c:'#a78bfa'},
        {k:'Half-close',   v:'s→c direction still open!'},
        {k:'Server still', v:'Can send any remaining data'},
        {k:'Simultaneous', v:'Both sides may send FIN together'},
        {k:'SO_LINGER',    v:'Controls FIN/RST behavior on close()'},
      ],
    },
    {
      step:3, title:'Step 3 — Server Sends Its FIN (Passive Close)',
      tag:'FIN', tagColor:'var(--purple)', tagBg:'rgba(167,139,250,0.12)',
      desc:'Server application calls close(). Server sends <strong>FIN+ACK</strong>. Server → <strong>LAST_ACK</strong> — waiting only for the client\'s final ACK. Note: steps 2 and 3 are sometimes combined into one FIN+ACK packet if the server has no more data to send.',
      dir:'s2c', label:'FIN+ACK', sub:'Seq=4001  Ack=5001  Flags=FIN+ACK',
      arrowColor:'#a78bfa', clientState:'FIN_WAIT_2', serverState:'LAST_ACK',
      fields:[
        {k:'Flags',        v:'FIN + ACK (0x011)',             c:'#a78bfa'},
        {k:'Seq Num',      v:'4001  (Server FIN)',            c:'#a78bfa'},
        {k:'Server State', v:'LAST_ACK',                     c:'#fbbf24'},
        {k:'Client',       v:'Receives FIN → must send ACK'},
        {k:'After ACK',    v:'Server immediately → CLOSED'},
        {k:'3-way close',  v:'Steps 2+3 combined if no data'},
        {k:'RST instead',  v:'Kills immediately, no FIN exchange'},
        {k:'Client next',  v:'ACK → TIME_WAIT (not CLOSED yet!)'},
      ],
    },
    {
      step:4, title:'Step 4 — Client ACKs → Enters TIME_WAIT',
      tag:'TIME_WAIT', tagColor:'var(--red)', tagBg:'rgba(248,113,113,0.12)',
      desc:'Client sends final ACK → Server → <strong>CLOSED</strong>. Client enters <strong>TIME_WAIT</strong> — it cannot immediately reuse this 4-tuple (src IP, src port, dst IP, dst port) for 2×MSL (60–240 seconds). TIME_WAIT is one of the most misunderstood states in TCP!',
      dir:'c2s', label:'ACK', sub:'Seq=5001  Ack=4002  Flags=ACK  → TIME_WAIT 2×MSL',
      arrowColor:'#f87171', clientState:'TIME_WAIT', serverState:'CLOSED',
      fields:[
        {k:'Ack Num',      v:'4002  (Server FIN + 1)',        c:'#f87171'},
        {k:'Client State', v:'TIME_WAIT ⏱️',                  c:'#f87171'},
        {k:'Server State', v:'CLOSED ✓',                     c:'#4ade80'},
        {k:'Duration',     v:'2 × MSL = 60–240 seconds'},
        {k:'MSL',          v:'Maximum Segment Lifetime (30–120s)'},
        {k:'Why wait?',    v:'Final ACK may be lost (see step 5)'},
        {k:'Also',         v:'Absorb late duplicate segments'},
        {k:'Port reuse',   v:'SO_REUSEADDR bypasses TIME_WAIT'},
      ],
    },
    {
      step:5, title:'Step 5 — Why TIME_WAIT Exists (TAC / CCIE Critical)',
      tag:'TIME_WAIT WHY', tagColor:'var(--red)', tagBg:'rgba(248,113,113,0.12)',
      desc:'<strong>Two critical reasons:</strong> (1) If the final ACK is lost, the server retransmits FIN — the client must still be alive to respond. (2) Old duplicate segments from this connection must expire before the same 4-tuple is reused — otherwise stale data could corrupt a new connection on the same ports.',
      dir:'none', label:'2×MSL  Reason 1 & 2', arrowColor:'#f87171',
      clientState:'TIME_WAIT', serverState:'CLOSED',
      fields:[
        {k:'Reason 1',     v:'Lost ACK → server retransmits FIN', c:'#f87171'},
        {k:'Reason 2',     v:'Stale dup segs expire in 2×MSL',    c:'#f87171'},
        {k:'Linux',        v:'60s  (net.ipv4.tcp_fin_timeout)'},
        {k:'Windows',      v:'4 min  (TcpTimedWaitDelay)'},
        {k:'Problem',      v:'High-traffic server: port exhaustion!'},
        {k:'Fix 1',        v:'SO_REUSEADDR / SO_REUSEPORT'},
        {k:'Fix 2',        v:'tcp_tw_reuse=1  (Linux, needs timestamps)'},
        {k:'TAC symptom',  v:'"Address already in use"  (EADDRINUSE)'},
      ],
    },
    {
      step:6, title:'Step 6 — TIME_WAIT Expires → Fully CLOSED 🎉',
      tag:'CLOSED ✓', tagColor:'var(--green)', tagBg:'rgba(74,222,128,0.12)',
      desc:'🎉 After 2×MSL, TIME_WAIT expires → both sides <strong>CLOSED</strong>. The port tuple is free. The 4-way FIN ensures all data is flushed and both sides acknowledge each other\'s close. <strong>Contrast with RST</strong>: RST kills instantly, no TIME_WAIT, buffered data discarded — use FIN for graceful shutdown.',
      dir:'none', label:'CLOSED ✓  Port free', arrowColor:'#4ade80',
      clientState:'CLOSED', serverState:'CLOSED',
      fields:[
        {k:'Client State', v:'CLOSED ✓',                     c:'#4ade80'},
        {k:'Server State', v:'CLOSED ✓',                     c:'#4ade80'},
        {k:'Port free',    v:'4-tuple can now be reused'},
        {k:'Buffers',      v:'All data delivered to application'},
        {k:'FIN vs RST',   v:'FIN: graceful  |  RST: immediate kill'},
        {k:'CLOSE_WAIT',   v:'Server bug: forgot to call close()!'},
        {k:'Debug',        v:'netstat -an | grep TIME_WAIT'},
        {k:'Wireshark',    v:'tcp.flags.fin==1 filter'},
      ],
    },
  ],

  // ────────────────────────────────────────────────
  // SCENARIO 5: RETRANSMISSION (RTO + FAST + SACK)
  // ────────────────────────────────────────────────
  retransmit: [
    {
      step:1, title:'Step 1 — Seg1 Sent and Arrives OK',
      tag:'SEG1 OK', tagColor:'var(--blue)', tagBg:'rgba(91,156,246,0.12)',
      desc:'Client sends Segment 1 (Seq=1001, 500 bytes). It travels through the network and arrives at the server intact. Server buffers it. All normal so far — the problem is about to happen with Segment 2.',
      dir:'c2s', label:'Seg1 Seq=1001 ✓', sub:'Seq=1001  Len=500  → arrives at server OK',
      arrowColor:'#5b9cf6', clientState:'ESTABLISHED', serverState:'ESTABLISHED',
      fields:[
        {k:'Seq Num',      v:'1001',                          c:'#5b9cf6'},
        {k:'Length',       v:'500 bytes'},
        {k:'Arrives',      v:'✓ Server receives OK',          c:'#4ade80'},
        {k:'Server',       v:'Buffers seg1, waiting for more'},
        {k:'Server ACK',   v:'Delayed — waiting for seg2'},
        {k:'In-flight',    v:'500 bytes unACK\'d'},
        {k:'Next',         v:'Client sends seg2 (pipelining)'},
        {k:'Problem',      v:'Seg2 is about to be lost ☠️'},
      ],
    },
    {
      step:2, title:'Step 2 — Seg2 Sent but LOST in Network ☠️',
      tag:'SEG2 LOST ☠️', tagColor:'var(--red)', tagBg:'rgba(248,113,113,0.12)',
      desc:'Client sends Segment 2 (Seq=1501). It is <strong>lost in the network</strong> — dropped by a congested router, corrupted by a bit error, or discarded by a queue overflow. The server never receives it. Client has no idea yet — it just keeps sending.',
      dir:'c2s', label:'Seg2 Seq=1501 ☠️', sub:'Seq=1501  Len=500  → DROPPED in network!',
      arrowColor:'#f87171', clientState:'ESTABLISHED', serverState:'ESTABLISHED',
      lost: true,
      fields:[
        {k:'Seq Num',      v:'1501',                          c:'#f87171'},
        {k:'Length',       v:'500 bytes'},
        {k:'Arrives',      v:'✗ LOST — never reaches server!',c:'#f87171'},
        {k:'Lost due to',  v:'Queue drop / bit error / congestion'},
        {k:'Client',       v:'Unaware — keeps sending!'},
        {k:'Server',       v:'Will buffer seg3 but wait for 1501'},
        {k:'Detection',    v:'Duplicate ACKs or RTO timeout'},
        {k:'Next',         v:'Seg3 arrives out-of-order'},
      ],
    },
    {
      step:3, title:'Step 3 — Seg3 Arrives Out-of-Order',
      tag:'OUT-OF-ORDER', tagColor:'var(--amber)', tagBg:'rgba(251,191,36,0.12)',
      desc:'Client sends Segment 3 (Seq=2001). It <em>does</em> arrive at the server. But the server cannot deliver it to the application — it\'s out of order. Server holds Seg3 in its receive buffer and sends a duplicate ACK: <strong>Ack=1501</strong> (still expecting the missing byte).',
      dir:'c2s', label:'Seg3 Seq=2001', sub:'Seq=2001  Len=500  → arrives OOO at server',
      arrowColor:'#fbbf24', clientState:'ESTABLISHED', serverState:'ESTABLISHED',
      fields:[
        {k:'Seq Num',      v:'2001',                          c:'#fbbf24'},
        {k:'Arrives',      v:'✓ But OUT-OF-ORDER!',           c:'#fbbf24'},
        {k:'Server',       v:'Buffers seg3 in receive buffer'},
        {k:'Cannot deliver',v:'App needs 1501 first (in-order)'},
        {k:'SACK',         v:'Server will report {2001-2501} held'},
        {k:'Dup ACK',      v:'Server sends Ack=1501 again!'},
        {k:'Reorder?',     v:'Could be reordering (wait for dup ACKs)'},
        {k:'Next',         v:'Server sends duplicate ACKs...'},
      ],
    },
    {
      step:4, title:'Step 4 — Dup ACK #1: Still Waiting for 1501',
      tag:'DUP ACK #1', tagColor:'var(--amber)', tagBg:'rgba(251,191,36,0.12)',
      desc:'Server sends <strong>Dup ACK #1: Ack=1501</strong> with SACK block reporting it holds bytes 2001–2501. This says: "I got seg1 and seg3, but I\'m still missing 1501!" Client sees the dup ACK but waits — it might just be reordering.',
      dir:'s2c', label:'Dup ACK #1', sub:'Ack=1501  SACK:{2001-2501}  — still waiting!',
      arrowColor:'#fbbf24', clientState:'ESTABLISHED', serverState:'ESTABLISHED',
      fields:[
        {k:'Ack Num',      v:'1501 — SAME (duplicate!)',      c:'#fbbf24'},
        {k:'SACK block',   v:'{2001–2501}  — have seg3',     c:'#38d9c0'},
        {k:'Means',        v:'Missing: bytes 1501–2000',      c:'#f87171'},
        {k:'Client',       v:'Counts dup ACKs (1 so far)'},
        {k:'Might be',     v:'Network reordering (wait…)'},
        {k:'Threshold',    v:'Act at 3 dup ACKs'},
        {k:'Without SACK', v:'Only see Ack=1501, no block info'},
        {k:'RTO timer',    v:'Running in background'},
      ],
    },
    {
      step:5, title:'Step 5 — Dup ACK #2: Still Missing!',
      tag:'DUP ACK #2', tagColor:'var(--amber)', tagBg:'rgba(251,191,36,0.12)',
      desc:'Client sent another segment (Seg4). Server ACKs it but <em>still</em> cannot advance past 1501. Sends <strong>Dup ACK #2: Ack=1501</strong>. SACK block grows to {2001–3001}. Client still waiting for the 3rd dup ACK threshold. At 2 dup ACKs, it could still be reordering.',
      dir:'s2c', label:'Dup ACK #2', sub:'Ack=1501  SACK:{2001-3001}  — 2nd dup!',
      arrowColor:'#fbbf24', clientState:'ESTABLISHED', serverState:'ESTABLISHED',
      fields:[
        {k:'Ack Num',      v:'1501 — STILL same (2nd dup!)',  c:'#fbbf24'},
        {k:'SACK block',   v:'{2001–3001}  — more arrived',  c:'#38d9c0'},
        {k:'Dup ACK count',v:'2 — not quite there yet'},
        {k:'Reorder',      v:'Network reorder ≤ 2 dup ACKs'},
        {k:'Client',       v:'Counting… one more to trigger!'},
        {k:'cwnd',         v:'Not changed yet  (waiting)'},
        {k:'RTO timer',    v:'Still running — backup plan'},
        {k:'Next',         v:'3rd dup ACK → Fast Retransmit!'},
      ],
    },
    {
      step:6, title:'Step 6 — 3rd Dup ACK → FAST RETRANSMIT! 🚨',
      tag:'FAST REXMIT!', tagColor:'var(--red)', tagBg:'rgba(248,113,113,0.12)',
      desc:'<strong>Third duplicate ACK!</strong> Fast Retransmit threshold reached. Client immediately retransmits Seg2 (Seq=1501) <em>without waiting for RTO</em> — which could be 1+ second. ssthresh = cwnd/2, cwnd = ssthresh. No Slow Start — jumps directly to Congestion Avoidance.',
      dir:'s2c', label:'Dup ACK #3 🚨', sub:'Ack=1501  SACK:{2001-3001}  → FAST RETRANSMIT!',
      arrowColor:'#f87171', clientState:'ESTABLISHED', serverState:'ESTABLISHED',
      fields:[
        {k:'Ack Num',      v:'1501 — 3rd DUP ACK! 🚨',       c:'#f87171'},
        {k:'TRIGGER',      v:'Fast Retransmit threshold hit!', c:'#f87171'},
        {k:'Action',       v:'Immediately retransmit Seq=1501'},
        {k:'ssthresh',     v:'= cwnd / 2'},
        {k:'cwnd',         v:'= ssthresh  (skip Slow Start!)'},
        {k:'No wait',      v:'No RTO! Saves up to 1+ second'},
        {k:'RFC 5681',     v:'Fast Retransmit / Fast Recovery'},
        {k:'Why 3?',       v:'Not too eager, not too slow'},
      ],
    },
    {
      step:7, title:'Step 7 — Client Retransmits ONLY Seg2 (SACK Power!)',
      tag:'RETRANSMIT', tagColor:'var(--red)', tagBg:'rgba(248,113,113,0.12)',
      desc:'Thanks to SACK, client <em>knows</em> server already holds Seg3 and beyond. So it retransmits <strong>only Seq=1501</strong> — not Seg3, not Seg4. Without SACK (cumulative ACK only), the sender would have to retransmit everything from 1501 onward, wasting bandwidth.',
      dir:'c2s', label:'RETX Seq=1501', sub:'Retransmit ONLY the missing segment  (SACK!)',
      arrowColor:'#f87171', clientState:'ESTABLISHED', serverState:'ESTABLISHED',
      fields:[
        {k:'Retransmit',   v:'Seq=1501  Len=500  (seg2 only)', c:'#f87171'},
        {k:'SACK helps',   v:'Know seg3+ already at server',   c:'#4ade80'},
        {k:'Without SACK', v:'Retransmit 1501,2001,2501… all', c:'#f87171'},
        {k:'Bandwidth',    v:'Saved — only 1 retransmit needed'},
        {k:'Recovery time',v:'~1 RTT vs potentially many RTTs'},
        {k:'Bytes resent', v:'500 bytes  (not thousands)'},
        {k:'Server',       v:'Has all pieces — gap fill incoming!'},
        {k:'Next',         v:'Server sends big cumulative ACK'},
      ],
    },
    {
      step:8, title:'Step 8 — Server ACKs Everything — Recovered 🎉',
      tag:'RECOVERED ✓', tagColor:'var(--green)', tagBg:'rgba(74,222,128,0.12)',
      desc:'🎉 Server receives retransmitted Seg2, filling the gap. It now has Seg1+Seg2+Seg3+ in order. Sends <strong>Ack=3001</strong> (or beyond) covering everything. Recovery complete in <strong>~1 RTT</strong>! Compare: RTO-based recovery waits at least 1 full second before retransmitting.',
      dir:'s2c', label:'ACK ✓', sub:'Ack=3001  — gap filled  Recovery COMPLETE!',
      arrowColor:'#4ade80', clientState:'ESTABLISHED', serverState:'ESTABLISHED',
      fields:[
        {k:'Ack Num',      v:'3001 — covers ALL segments!',   c:'#4ade80'},
        {k:'Recovery',     v:'Complete in ~1 RTT',            c:'#4ade80'},
        {k:'vs RTO',       v:'RTO: 1+ second wait'},
        {k:'Fast Retransmit',v:'~1 RTT = milliseconds!',      c:'#4ade80'},
        {k:'SACK benefit', v:'1 retransmit  vs  many without'},
        {k:'cwnd',         v:'At ssthresh  → Cong. Avoidance'},
        {k:'Monitor',      v:'netstat -s | grep retransmit'},
        {k:'Wireshark',    v:'tcp.analysis.retransmission filter'},
      ],
    },
  ],

  // ────────────────────────────────────────────────
  // SCENARIO 6: RST — RESET
  // ────────────────────────────────────────────────
  rst: [
    {
      step:1, title:'Step 1 — Client SYNs to a Closed Port',
      tag:'SYN → CLOSED', tagColor:'var(--blue)', tagBg:'rgba(91,156,246,0.12)',
      desc:'Client sends SYN to port 8080 on the server. No application is listening on port 8080 — the port is <strong>CLOSED</strong>. The server OS receives the SYN. Since no socket is in LISTEN state for port 8080, the kernel generates an RST immediately in microseconds — no timeout.',
      dir:'c2s', label:'SYN', sub:'Seq=1000  Flags=SYN  Dest Port=8080  (CLOSED!)',
      arrowColor:'#5b9cf6', clientState:'SYN_SENT', serverState:'CLOSED',
      fields:[
        {k:'Client action',v:'SYN to 192.168.1.1:8080'},
        {k:'Server port',  v:'8080  — no listener!  CLOSED'},
        {k:'Server OS',    v:'Generates RST in microseconds'},
        {k:'No timeout',   v:'Instant reject (no backlog queue)'},
        {k:'Port scanning',v:'RST = closed port  (not stealthed)'},
        {k:'Firewall drop',v:'No RST = filtered / firewalled'},
        {k:'nmap',         v:'RST → "closed",  no reply → "filtered"'},
        {k:'UDP closed',   v:'ICMP Port Unreachable  (not RST)'},
      ],
    },
    {
      step:2, title:'Step 2 — Server Sends RST+ACK (Immediate Rejection)',
      tag:'RST+ACK', tagColor:'var(--red)', tagBg:'rgba(248,113,113,0.12)',
      desc:'Server sends <strong>RST+ACK</strong>. RST = Reset — abruptly terminate this connection attempt. <strong>No TIME_WAIT. No 4-way close. No buffer flush.</strong> Client receives RST and gets "Connection refused" (ECONNREFUSED) instantly. Stack tears down the connection immediately.',
      dir:'s2c', label:'RST+ACK', sub:'Seq=0  Ack=1001  Flags=RST+ACK  → REFUSED',
      arrowColor:'#f87171', clientState:'CLOSED', serverState:'CLOSED',
      fields:[
        {k:'Flags',        v:'RST + ACK (0x014)',             c:'#f87171'},
        {k:'Effect',       v:'Immediate abort!',              c:'#f87171'},
        {k:'No TIME_WAIT', v:'Connection cleared instantly!', c:'#4ade80'},
        {k:'No 4-way',     v:'No FIN handshake'},
        {k:'App error',    v:'"Connection refused"'},
        {k:'Linux errno',  v:'ECONNREFUSED  (111)'},
        {k:'Windows',      v:'WSAECONNREFUSED  (10061)'},
        {k:'Wireshark',    v:'[RST, ACK]  shown in red'},
      ],
    },
    {
      step:3, title:'Step 3 — RST in Mid-Connection (Abrupt Termination)',
      tag:'MID-CONN RST', tagColor:'var(--red)', tagBg:'rgba(248,113,113,0.12)',
      desc:'RST can also kill an <em>ESTABLISHED</em> connection. Common causes: application crash (kernel RSTs on behalf of app), firewall policy/ACL change, NAT state timeout, load balancer idle timeout, or <code>SO_LINGER</code> with <code>l_linger=0</code>. Buffered unsent data is <strong>discarded</strong> immediately — no flush like FIN.',
      dir:'none', label:'RST  mid-connection causes', arrowColor:'#f87171',
      clientState:'CLOSED', serverState:'CLOSED',
      fields:[
        {k:'Cause 1',      v:'App crash  (kernel sends RST)',  c:'#f87171'},
        {k:'Cause 2',      v:'Firewall / NAT state timeout'},
        {k:'Cause 3',      v:'LB idle timeout  (AWS ALB=60s)'},
        {k:'Cause 4',      v:'SO_LINGER  l_linger=0  close()'},
        {k:'Data loss',    v:'Unsent buffer discarded!',       c:'#f87171'},
        {k:'vs FIN',       v:'FIN: graceful  |  RST: hard kill'},
        {k:'App sees',     v:'ECONNRESET  (104 Linux)'},
        {k:'TAC',          v:'"TCP RST storm" = device issue'},
      ],
    },
    {
      step:4, title:'Step 4 — RST Attack Defense (CCIE Level)',
      tag:'CCIE LEVEL', tagColor:'var(--purple)', tagBg:'rgba(167,139,250,0.12)',
      desc:'RST injection attacks require knowing the correct sequence number (within the receive window). BGP sessions are prime targets — a single RST kills the BGP session causing a routing outage. <strong>TCP MD5 Signature</strong> (RFC 2385) and <strong>GTSM/TTL Security</strong> (RFC 5082) protect BGP against RST injection and off-path attacks.',
      dir:'none', label:'RST attack defense', arrowColor:'#a78bfa',
      clientState:'CLOSED', serverState:'CLOSED',
      fields:[
        {k:'BGP RST risk',  v:'RST kills BGP → routing outage!', c:'#f87171'},
        {k:'TCP MD5',       v:'RFC 2385: signs each segment',    c:'#4ade80'},
        {k:'GTSM',          v:'RFC 5082: drop if TTL ≠ 255',    c:'#4ade80'},
        {k:'RST injection', v:'Attacker guesses seq num (in-window)'},
        {k:'Defense',       v:'Large windows make guessing harder'},
        {k:'IDS/IPS',       v:'Sends RST to both sides to block'},
        {k:'TCP intercept', v:'Cisco: proxy mode for SYN flood'},
        {k:'Filter',        v:'Wireshark: tcp.flags.reset==1'},
      ],
    },
  ],
};

// ─── Chain bar labels per scenario ───
const TCP_CHAINS = {
  handshake:  ['SYN →','← SYN-ACK','ACK →','Options'],
  data:       ['Seg1 →','Seg2 →','← ACK','← Resp','← Cont.','Win Update'],
  congestion: ['cwnd=1','cwnd=2','cwnd=8','Cong.Avoid','Loss/RTO','Fast Rexmit','SACK'],
  teardown:   ['FIN →','← ACK','← FIN','ACK/TW','TW Why?','CLOSED ✓'],
  retransmit: ['Seg1 ✓','Seg2 ☠️','Seg3 OOO','Dup ACK1','Dup ACK2','Dup ACK3!','RETX','ACK ✓'],
  rst:        ['SYN →','← RST','Mid-conn','Defense'],
};

// ═══════════════════════════════════════════════════
// INIT & MODE SELECT
// ═══════════════════════════════════════════════════
function tcpSegInit() {
  tcpSetMode('handshake');
}

function tcpSegRedraw() {
  tcpDrawLadder();
}

function tcpSetMode(mode) {
  tcpMode = mode;
  tcpReset();
  document.querySelectorAll('.tcp-mode-tab').forEach(t => t.classList.remove('active'));
  const tab = document.getElementById('tcp-tab-' + mode);
  if (tab) tab.classList.add('active');

  const totalEl = document.getElementById('tcp-step-total');
  if (totalEl) totalEl.textContent = TCP_STEPS[mode].length;

  const descs = {
    handshake:  `<strong style="color:var(--amber)">3-Way Handshake</strong> — SYN → SYN-ACK → ACK. Watch the ISN math, option negotiation, and TCP state transitions. The foundation of every TCP connection.`,
    data:       `<strong style="color:var(--blue)">Data Transfer</strong> — PSH+ACK pipelining, cumulative ACKs, sliding window flow control, and what happens when the receive buffer fills up.`,
    congestion: `<strong style="color:var(--purple)">Congestion Control</strong> — Slow Start exponential growth → Congestion Avoidance → Loss detection → Fast Retransmit → SACK. AIMD in action.`,
    teardown:   `<strong style="color:var(--purple)">4-Way Teardown</strong> — FIN → ACK → FIN → ACK. Half-close, TIME_WAIT (2×MSL), and why TIME_WAIT exists — critical for TAC engineers.`,
    retransmit: `<strong style="color:var(--red)">Retransmission</strong> — Segment loss, 3 duplicate ACKs, Fast Retransmit vs RTO, and SACK surgical recovery. The exact flow TAC traces in packet captures.`,
    rst:        `<strong style="color:var(--red)">RST / Reset</strong> — Closed port rejection, mid-connection abort, causes, data loss implications, and BGP RST injection defense for CCIE level.`,
  };
  const descEl = document.getElementById('tcp-mode-desc');
  if (descEl) descEl.innerHTML = descs[mode] || '';
}

function tcpUpdateChain(step) {
  const chainEl = document.getElementById('tcp-chain-bar');
  if (!chainEl) return;
  const labels = TCP_CHAINS[tcpMode] || [];
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
// LADDER DIAGRAM DRAWING
// ═══════════════════════════════════════════════════
function tcpDrawLadder(animT) {
  const svg = document.getElementById('tcp-svg');
  if (!svg) return;

  const steps = TCP_STEPS[tcpMode];
  const totalH = TCP_HDR_H + steps.length * TCP_STEP_H + 50;
  svg.setAttribute('viewBox', `0 0 760 ${totalH}`);
  svg.style.width = '100%';
  svg.style.height = 'auto';

  // Current step state info
  const curS = tcpCurrentStep > 0 ? steps[tcpCurrentStep - 1] : null;
  const cState = curS ? curS.clientState : 'CLOSED';
  const sState = curS ? curS.serverState : 'LISTEN';
  const cColor = TCP_STATE_COLORS[cState] || '#5a6080';
  const sColor = TCP_STATE_COLORS[sState] || '#5a6080';
  const isEstab = cState === 'ESTABLISHED' && sState === 'ESTABLISHED';

  let html = `<defs>
    <marker id="tcp-arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
      <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </marker>
  </defs>`;

  // ── Topology header ──
  // Client panel
  html += `<rect x="55" y="8" width="150" height="80" rx="10" fill="rgba(91,156,246,0.06)" stroke="rgba(91,156,246,0.2)" stroke-width="1"/>`;
  html += svgPC(TCP_CX, 38, 'tcp-cli', 'CLIENT\n192.168.1.10', tcpCurrentStep > 0);
  html += `<rect x="${TCP_CX-40}" y="65" width="80" height="17" rx="4" fill="${cColor}22" stroke="${cColor}" stroke-width="1"/>`;
  html += `<text x="${TCP_CX}" y="77" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" font-weight="700" fill="${cColor}">${cState}</text>`;

  // Server panel
  html += `<rect x="555" y="8" width="150" height="80" rx="10" fill="rgba(74,222,128,0.06)" stroke="rgba(74,222,128,0.2)" stroke-width="1"/>`;
  html += svgServer(TCP_SX, 38, 'tcp-srv', 'SERVER\n192.168.1.1', tcpCurrentStep > 0, '#4ade80');
  html += `<rect x="${TCP_SX-40}" y="65" width="80" height="17" rx="4" fill="${sColor}22" stroke="${sColor}" stroke-width="1"/>`;
  html += `<text x="${TCP_SX}" y="77" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" font-weight="700" fill="${sColor}">${sState}</text>`;

  // Connection line between nodes
  const connColor = isEstab ? '#4ade8033' : 'rgba(100,120,180,0.12)';
  const connDash  = isEstab ? '' : 'stroke-dasharray="6,4"';
  html += `<line x1="205" y1="38" x2="555" y2="38" stroke="${connColor}" stroke-width="${isEstab?2:1}" ${connDash}/>`;

  // cwnd bar for congestion scenario
  if (tcpMode === 'congestion' && curS && curS.cwnd !== undefined) {
    const cw = Math.min(curS.cwnd, 64), ss = Math.min(curS.ssthresh, 64);
    const barW = 200, bx = 280, by = 18;
    html += `<rect x="${bx}" y="${by}" width="${barW}" height="16" rx="3" fill="rgba(100,120,180,0.08)" stroke="rgba(100,120,180,0.2)" stroke-width="0.8"/>`;
    html += `<rect x="${bx}" y="${by}" width="${(cw/64)*barW}" height="16" rx="3" fill="rgba(251,191,36,0.3)" stroke="#fbbf24" stroke-width="0.8"/>`;
    // ssthresh marker
    const ssX = bx + (ss/64)*barW;
    html += `<line x1="${ssX}" y1="${by-2}" x2="${ssX}" y2="${by+18}" stroke="#a78bfa" stroke-width="1.5" stroke-dasharray="3,2"/>`;
    html += `<text x="${bx+4}" y="${by+11}" font-family="IBM Plex Mono,monospace" font-size="8" font-weight="700" fill="#fbbf24">cwnd: ${curS.cwnd} MSS</text>`;
    html += `<text x="${ssX+3}" y="${by-4}" font-family="IBM Plex Mono,monospace" font-size="7" fill="#a78bfa">ssth=${curS.ssthresh}</text>`;
  }

  // ── Timeline lines ──
  const tlY = TCP_HDR_H;
  const tlEnd = totalH - 25;
  html += `<line x1="${TCP_CX}" y1="${tlY}" x2="${TCP_CX}" y2="${tlEnd}" stroke="rgba(91,156,246,0.2)" stroke-width="1.5" stroke-dasharray="5,5"/>`;
  html += `<line x1="${TCP_SX}" y1="${tlY}" x2="${TCP_SX}" y2="${tlEnd}" stroke="rgba(74,222,128,0.2)" stroke-width="1.5" stroke-dasharray="5,5"/>`;
  html += `<text x="${TCP_CX}" y="${tlY+13}" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="rgba(91,156,246,0.5)">CLIENT</text>`;
  html += `<text x="${TCP_SX}" y="${tlY+13}" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="rgba(74,222,128,0.5)">SERVER</text>`;

  // ── Draw arrows ──
  steps.forEach((s, i) => {
    const stepNum  = i + 1;
    const isCur    = stepNum === tcpCurrentStep;
    const isPast   = stepNum < tcpCurrentStep;
    const isFuture = stepNum > tcpCurrentStep;
    if (isFuture) return;

    const y = TCP_HDR_H + 28 + i * TCP_STEP_H;

    // ── "no-arrow" steps: state / educational panels ──
    if (s.dir === 'none') {
      const midX = (TCP_CX + TCP_SX) / 2;
      const color = isPast ? '#2a3050' : (s.arrowColor || '#5b9cf6');
      const opacity = isPast ? 0.5 : 1;
      html += `<rect x="${midX-110}" y="${y-11}" width="220" height="24" rx="5" fill="${color}${isPast?'0d':'1a'}" stroke="${color}${isPast?'33':'55'}" stroke-width="${isPast?0.5:1}"/>`;
      html += `<text x="${midX}" y="${y+5}" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="${isPast?8:9}" font-weight="700" fill="${color}" opacity="${opacity}">${s.label}</text>`;
      // Step number
      html += `<text x="${TCP_CX-20}" y="${y+5}" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="#3a4060" opacity="${isPast?0.4:0.7}">${stepNum}</text>`;
      return;
    }

    const fromX = s.dir === 'c2s' ? TCP_CX : TCP_SX;
    const toX   = s.dir === 'c2s' ? TCP_SX : TCP_CX;
    const fromY = y;
    const toY   = y + 24; // diagonal shows RTT delay
    const color = isPast ? '#2a3558' : s.arrowColor;
    const lw    = isPast ? 1 : 2;
    const opacity = isPast ? 0.45 : 1;

    // Arrow line
    html += `<line x1="${fromX}" y1="${fromY}" x2="${toX}" y2="${toY}" stroke="${color}" stroke-width="${lw}" opacity="${opacity}" marker-end="url(#tcp-arr)"/>`;

    // Step number
    const badgeX = s.dir === 'c2s' ? TCP_CX - 20 : TCP_SX + 20;
    html += `<text x="${badgeX}" y="${fromY+4}" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" fill="${isPast?'#2a3050':'#5a6080'}" opacity="${opacity}">${stepNum}</text>`;

    const midX = (fromX + toX) / 2;
    const midY = (fromY + toY) / 2;

    // Label pill (current only)
    if (isCur) {
      const pw = Math.min(s.label.length * 7.5 + 20, 200);
      html += `<rect x="${midX-pw/2}" y="${midY-23}" width="${pw}" height="18" rx="4" fill="${color}22" stroke="${color}55" stroke-width="0.8"/>`;
    }
    html += `<text x="${midX}" y="${midY-9}" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="${isPast?8:10}" font-weight="${isPast?'400':'700'}" fill="${color}" opacity="${opacity}">${s.label}</text>`;

    // Sub-label
    if (s.sub) {
      const sub = isPast ? s.sub.split('  ')[0] : s.sub;
      html += `<text x="${midX}" y="${midY+22}" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="${isPast?7:8}" fill="${isPast?'#1e2438':'#8892b0'}" opacity="${isPast?0.5:1}">${sub}</text>`;
    }

    // LOST segment indicator
    if (s.lost) {
      html += `<circle cx="${midX}" cy="${midY}" r="14" fill="#f8717120" stroke="#f87171" stroke-width="1.5"/>`;
      html += `<text x="${midX}" y="${midY+5}" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="13" font-weight="700" fill="#f87171">✕</text>`;
      html += `<text x="${midX}" y="${midY+26}" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" font-weight="700" fill="#f87171">LOST</text>`;
    }

    // Animated dot on current step
    if (isCur && animT !== undefined && animT >= 0) {
      const dotX = fromX + (toX - fromX) * animT;
      const dotY = fromY + (toY - fromY) * animT;
      html += `<circle cx="${dotX}" cy="${dotY}" r="13" fill="${color}12" stroke="${color}44" stroke-width="1"/>`;
      html += `<circle cx="${dotX}" cy="${dotY}" r="7" fill="${color}40" stroke="${color}" stroke-width="2"/>`;
      html += `<circle cx="${dotX}" cy="${dotY}" r="3.5" fill="${color}"/>`;
    }
  });

  svg.innerHTML = html;
}

// ═══════════════════════════════════════════════════
// ANIMATION ENGINE
// ═══════════════════════════════════════════════════
function tcpCancelAll() {
  if (tcpRafId)   { cancelAnimationFrame(tcpRafId); tcpRafId = null; }
  if (tcpTimerId) { clearTimeout(tcpTimerId);        tcpTimerId = null; }
}

function tcpAnimateStep(step) {
  const steps = TCP_STEPS[tcpMode];
  const s = steps[step - 1];
  if (!s) return;

  const animatingStep = step; // capture so stale callbacks self-abort

  if (s.dir === 'none') {
    tcpDrawLadder(1);
    tcpTimerId = setTimeout(() => {
      tcpTimerId = null;
      if (tcpCurrentStep !== animatingStep) return;
      tcpDrawLadder();
      tcpFinalizeStep(s);
    }, tcpGetSegDur() * 1.1);
    return;
  }

  let startTime = null;
  const dur = tcpGetSegDur();

  function frame(ts) {
    if (tcpCurrentStep !== animatingStep) { tcpRafId = null; return; }
    if (!startTime) startTime = ts;
    const t = Math.min((ts - startTime) / dur, 1);
    tcpDrawLadder(easeInOut(t));
    if (t < 1) {
      tcpRafId = requestAnimationFrame(frame);
    } else {
      tcpRafId = null;
      tcpTimerId = setTimeout(() => {
        tcpTimerId = null;
        if (tcpCurrentStep !== animatingStep) return;
        tcpDrawLadder();
        tcpFinalizeStep(s);
      }, 320);
    }
  }
  tcpRafId = requestAnimationFrame(frame);
}

function tcpFinalizeStep(s) {
  tcpUpdateUI();
}

// ═══════════════════════════════════════════════════
// UI UPDATE
// ═══════════════════════════════════════════════════
function tcpUpdateUI() {
  const steps = TCP_STEPS[tcpMode];
  const step  = tcpCurrentStep;
  const numEl = document.getElementById('tcp-step-num');
  const prog  = document.getElementById('tcp-progress');
  const info  = document.getElementById('tcp-step-info');
  if (numEl) numEl.textContent = step;
  if (prog)  prog.style.width = (step / steps.length * 100) + '%';
  tcpUpdateChain(step);

  if (step === 0) {
    if (info) info.innerHTML = `<div class="step-tag" style="background:rgba(91,156,246,0.12);color:var(--blue)">READY</div>
      <div class="step-title">Select a scenario above and press ▶ Play to begin</div>
      <div class="step-desc">Ladder diagram shows every segment — past steps dimmed, current highlighted, animated dot travels along each arrow. Both topology header and Wireshark-style sequence diagram are visible simultaneously.</div>`;
    const f = document.getElementById('tcp-pkt-fields');
    if (f) f.innerHTML = '<div style="color:var(--muted);font-family:var(--mono);font-size:11px;">Start the animation to see TCP segment field details…</div>';
    return;
  }

  const s = steps[step - 1];
  if (info) info.innerHTML = `<div class="step-tag" style="background:${s.tagBg};color:${s.tagColor}">${s.tag}</div>
    <div class="step-title">${s.title}</div>
    <div class="step-desc">${s.desc}</div>`;

  const fieldsEl = document.getElementById('tcp-pkt-fields');
  if (fieldsEl && s.fields) {
    let fhtml = '<div class="pkt-fields">';
    s.fields.forEach(f => {
      fhtml += `<div class="pkt-field"><div class="pkt-field-key">${f.k}</div><div class="pkt-field-val" style="color:${f.c||'var(--text)'}"> ${f.v}</div></div>`;
    });
    fhtml += '</div>';
    fieldsEl.innerHTML = fhtml;
  }
}

// ═══════════════════════════════════════════════════
// PLAYBACK CONTROLS
// ═══════════════════════════════════════════════════
function tcpStep(dir) {
  tcpCancelAll();
  const steps = TCP_STEPS[tcpMode];
  const newStep = tcpCurrentStep + dir;
  if (newStep < 0 || newStep > steps.length) return;
  tcpCurrentStep = newStep;
  tcpDrawLadder();
  tcpUpdateUI();
  if (newStep > 0) tcpAnimateStep(newStep);
}

function tcpTogglePlay() {
  if (tcpSpeedMode === 'manual') { tcpStep(1); return; }
  tcpPlaying = !tcpPlaying;
  const btn = document.getElementById('tcp-play-btn');
  if (btn) btn.textContent = tcpPlaying ? '⏸ Pause' : '▶ Play';
  if (tcpPlaying) tcpAutoPlay();
  else clearTimeout(tcpPlayTimer);
}

function tcpAutoPlay() {
  if (!tcpPlaying) return;
  const steps = TCP_STEPS[tcpMode];
  if (tcpCurrentStep >= steps.length) {
    tcpPlaying = false;
    const btn = document.getElementById('tcp-play-btn');
    if (btn) btn.textContent = '▶ Play';
    return;
  }
  tcpStep(1);
  tcpPlayTimer = setTimeout(tcpAutoPlay, tcpGetAutoDelay());
}

function tcpReset() {
  tcpPlaying = false;
  clearTimeout(tcpPlayTimer);
  tcpCancelAll();
  const btn = document.getElementById('tcp-play-btn');
  if (btn) btn.textContent = '▶ Play';
  tcpCurrentStep = 0;
  tcpDrawLadder();
  tcpUpdateUI();
  tcpUpdateChain(0);
}

// ─── Auto-init ───
document.addEventListener('DOMContentLoaded', function () {
  tcpSetMode('handshake');
});