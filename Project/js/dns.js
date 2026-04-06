// ═══════════════════════════════════════════════════
  // DNS SIMULATOR
  // ═══════════════════════════════════════════════════
  const DNS_NODES = {
    pc:       {x: 60,  y: 270},
    sw:       {x: 170, y: 270},
    rtr:      {x: 290, y: 270},
    inet:     {x: 420, y: 220},
    resolver: {x: 570, y: 140},
    root:     {x: 770, y: 80},
    tld:      {x: 770, y: 210},
    auth:     {x: 770, y: 340},
    web:      {x: 570, y: 330},
  };
  
  let dnsMode = 'recursive', dnsCurrentStep = 0, dnsAnimId = null, dnsPlaying = false;
  let dnsPlayTimer = null, dnsActiveNodes = [], dnsCacheEntries = [];
  let dnsSpeedMode = 'slow';
  
  function setDnsSpeed(s) {
    dnsSpeedMode = s;
    ['slow','normal','fast'].forEach(x => {
      const el = document.getElementById('nspeed-' + x);
      if (el) el.classList.toggle('active', x === s);
    });
  }
  function dnsGetSegDur()    { return {slow:1300, normal:700, fast:320}[dnsSpeedMode]; }
  function dnsGetAutoDelay() { return {slow:5000, normal:2600, fast:1300}[dnsSpeedMode]; }
  
  // ─── DNS Chain labels ───
  const DNS_RECURSIVE_CHAIN = [
    'Browser Cache','OS Cache','/etc/hosts','Router Cache','Resolver Cache',
    '→ Root NS','Root→TLD','TLD→Auth',
    'Auth→TLD','TLD→Root','Root→Resolver',
    '→ PC','Done ✓'
  ];  
  const DNS_ITERATIVE_CHAIN  = ['Browser Cache','OS Cache','Router Cache','Resolver Cache','→ Root NS','← Root Ref','→ TLD NS','← TLD Ref','→ Auth NS','← Auth IP','→ PC','Done ✓'];
  
  function updateDnsChain(step) {
    const chainEl = document.getElementById('dns-chain-bar');
    if (!chainEl) return;
    const labels = dnsMode === 'recursive' ? DNS_RECURSIVE_CHAIN : DNS_ITERATIVE_CHAIN;
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
  
  // ─────────────────────────────────────────
  // DNS RECURSIVE STEPS — 12 steps (complete real-world chain)
  // ─────────────────────────────────────────
  const DNS_RECURSIVE_STEPS = [
    {
      step:1, title:'Step 1 — Browser Checks Its Own DNS Cache',
      tag:'BROWSER CACHE', tagColor:'var(--blue)', tagBg:'rgba(91,156,246,0.12)',
      desc:'User types <strong>www.google.com</strong> in the browser. Before anything leaves the machine, Chrome/Firefox checks its <em>internal DNS cache</em>. Fast in-memory lookup. Result: <strong>CACHE MISS</strong> — not found.',
      from:'pc', to:'pc', via:[], pktColor:'#f87171', pktLabel:'MISS',
      activeNodes:['pc'],
      pktCard:['BROWSER DNS CACHE','www.google.com → ❌ MISS','Chrome: chrome://net-internals/#dns','TTL expired or never visited','→ Checking OS cache next'],
      fields:[{k:'Check',v:'Browser DNS Cache',c:'#5b9cf6'},{k:'Domain',v:'www.google.com',c:'#38d9c0'},{k:'Result',v:'❌ MISS — not found'},{k:'Cache Type',v:'Chrome: chrome://net-internals/#dns'},{k:'Next Step',v:'Check OS DNS cache →',c:'#fbbf24'}],
      cacheAdd: null
    },
    {
      step:2, title:'Step 2 — OS Checks /etc/hosts & OS DNS Cache',
      tag:'OS CACHE', tagColor:'var(--blue)', tagBg:'rgba(91,156,246,0.12)',
      desc:'The OS checks: (1) <strong>/etc/hosts</strong> for static hostname mappings, (2) the <strong>OS-level DNS cache</strong> (ipconfig /displaydns on Windows, nscd on Linux). Both: <strong>MISS</strong>.',
      from:'pc', to:'pc', via:[], pktColor:'#f87171', pktLabel:'MISS',
      activeNodes:['pc'],
      pktCard:['OS DNS RESOLVER CACHE','/etc/hosts → ❌ No static entry','OS Resolver Cache → ❌ MISS','ipconfig /displaydns (Windows)','→ Querying router next'],
      fields:[{k:'Check 1',v:'/etc/hosts file',c:'#8892b0'},{k:'Hosts Result',v:'❌ MISS — no static entry'},{k:'Check 2',v:'OS DNS Resolver Cache',c:'#5b9cf6'},{k:'OS Cache Result',v:'❌ MISS — no record'},{k:'Next Step',v:'Query default gateway →',c:'#fbbf24'}],
      cacheAdd: null
    },
    {
      step:3, title:'Step 3 — Query Sent to Router; Router Checks DNS Cache',
      tag:'ROUTER CACHE', tagColor:'var(--purple)', tagBg:'rgba(167,139,250,0.12)',
      desc:'The DNS query travels <strong>PC → Switch → Router (192.168.1.1)</strong>. The router runs a lightweight DNS caching service (dnsmasq). Its cache is empty for this domain. Result: <strong>MISS</strong> — forwarding to resolver.',
      from:'pc', to:'rtr', via:['sw'],
      pktColor:'#a78bfa', pktLabel:'DNS?',
      activeNodes:['pc','sw','rtr'],
      pktCard:['DNS QUERY → ROUTER','Dest: 192.168.1.1 (Gateway)','dnsmasq cache: ❌ MISS','Role: Caching DNS forwarder','→ Forwarding to 8.8.8.8'],
      fields:[{k:'Dest',v:'192.168.1.1 (Gateway)',c:'#a78bfa'},{k:'Path',v:'PC → Switch → Router'},{k:'Router Cache',v:'❌ MISS — not cached'},{k:'Next Step',v:'Forward to resolver →',c:'#fbbf24'}],
      cacheAdd: null
    },
    {
      step:4, title:'Step 4 — Router Forwards to DNS Resolver; Resolver Checks Cache',
      tag:'RESOLVER CACHE', tagColor:'var(--cyan)', tagBg:'rgba(56,217,192,0.12)',
      desc:'Router forwards query to <strong>DNS Resolver 8.8.8.8</strong>. Resolver checks its large shared cache — <strong>MISS</strong>. With <strong>RD=1</strong> (Recursion Desired), the resolver will now walk the full DNS hierarchy on behalf of the client.',
      from:'rtr', to:'resolver', via:['inet'],
      pktColor:'#38d9c0', pktLabel:'Q?',
      activeNodes:['rtr','inet','resolver'],
      pktCard:['DNS RESOLVER (8.8.8.8)','Resolver Cache → ❌ MISS','RD=1 (Recursion Desired)','Resolver walks full hierarchy','→ Querying Root NS next'],
      fields:[{k:'Resolver IP',v:'8.8.8.8 (Google DNS)',c:'#38d9c0'},{k:'RD Flag',v:'1 (Recursion Desired)'},{k:'Resolver Cache',v:'❌ MISS'},{k:'Next Step',v:'Query Root NS →',c:'#fbbf24'}],
      cacheAdd: null
    },
   
    // ── FORWARD: query walks DOWN the hierarchy ───────────────────────────────
    {
      step:5, title:'Step 5 — Resolver Queries Root Name Server',
      tag:'→ ROOT NS', tagColor:'var(--amber)', tagBg:'rgba(251,191,36,0.12)',
      desc:'Resolver contacts a <strong>Root Name Server</strong> (13 logical root servers A–M, 1000+ anycast nodes worldwide). These IPs are hardcoded in every resolver. It asks: <em>"Who manages .com?"</em> — Root NS will pass the query down the chain.',
      from:'resolver', to:'root', via:[],
      pktColor:'#fbbf24', pktLabel:'who\n.com?',
      activeNodes:['resolver','root'],
      pktCard:['QUERY → ROOT NAME SERVER','a.root-servers.net (198.41.0.4)','Anycast: 1000+ physical nodes','Asking: Who handles .com TLD?','Root will forward query to TLD NS'],
      fields:[{k:'Target',v:'a.root-servers.net',c:'#fbbf24'},{k:'Root IP',v:'198.41.0.4 (anycast)'},{k:'Asks',v:'Who manages .com TLD?'},{k:'Chain Step',v:'Forward ①: Resolver → Root'}],
      cacheAdd: null
    },
    {
      step:6, title:'Step 6 — Root NS Passes Query Forward to .com TLD NS',
      tag:'ROOT → TLD NS', tagColor:'var(--amber)', tagBg:'rgba(251,191,36,0.12)',
      desc:'Root NS knows who manages <em>.com</em>. It forwards the query <strong>down to .com TLD Name Server</strong> (a.gtld-servers.net, 192.5.6.30). The chain is walking forward — resolver is waiting for the answer to come all the way back.',
      from:'root', to:'tld', via:[],
      pktColor:'#fbbf24', pktLabel:'→TLD\n.com?',
      activeNodes:['root','tld'],
      pktCard:['ROOT NS → .com TLD NS','Forwarding to: a.gtld-servers.net','Glue record IP: 192.5.6.30','Query walking down hierarchy','Asking TLD: Auth NS for google.com?'],
      fields:[{k:'.com TLD NS',v:'a.gtld-servers.net',c:'#fbbf24'},{k:'Glue Record',v:'192.5.6.30'},{k:'Chain Step',v:'Forward ②: Root → TLD'},{k:'Next',v:'TLD passes to Auth NS →',c:'#a78bfa'}],
      cacheAdd: {domain:'.com NS',type:'NS',value:'a.gtld-servers.net',ttl:'172800s'}
    },
    {
      step:7, title:'Step 7 — TLD NS Passes Query Forward to google.com Auth NS',
      tag:'TLD → AUTH NS', tagColor:'var(--purple)', tagBg:'rgba(167,139,250,0.12)',
      desc:'The .com TLD NS knows google.com is served by <strong>ns1.google.com</strong>. It forwards the query <strong>down to the Authoritative NS</strong> (216.239.32.10). The query has reached the <strong>bottom of the DNS tree</strong> — the source of truth.',
      from:'tld', to:'auth', via:[],
      pktColor:'#a78bfa', pktLabel:'→Auth\ngoogle?',
      activeNodes:['tld','auth'],
      pktCard:['TLD NS → AUTH NS','a.gtld-servers.net → ns1.google.com','Glue: 216.239.32.10','Bottom of DNS tree reached!','Auth NS has the real A record'],
      fields:[{k:'Auth NS',v:'ns1.google.com',c:'#a78bfa'},{k:'Auth NS IP',v:'216.239.32.10 (glue)'},{k:'Managed by',v:'Google LLC'},{k:'Chain Step',v:'Forward ③: TLD → Auth NS (bottom!)'}],
      cacheAdd: {domain:'google.com NS',type:'NS',value:'ns1.google.com',ttl:'172800s'}
    },
   
    // ── UNWIND: answer bubbles back UP through every hop ──────────────────────
    {
      step:8, title:'Step 8 — Auth NS Returns Answer (AA=1) → TLD NS',
      tag:'AUTH → TLD ✓', tagColor:'var(--green)', tagBg:'rgba(74,222,128,0.12)',
      desc:'Auth NS has the ground truth: <strong>www.google.com → 142.250.182.100</strong>, TTL 300s, <strong>AA=1</strong>. The answer now begins unwinding back up the same path. First hop back: <strong>Auth NS → TLD NS</strong>.',
      from:'auth', to:'tld', via:[],
      pktColor:'#4ade80', pktLabel:'✓ IP\nAA=1',
      activeNodes:['auth','tld'],
      pktCard:['← AUTH ANSWER ✓ (AA=1)','www.google.com → 142.250.182.100','TTL: 300s | AA=1 authoritative','Unwind ①: Auth → TLD','Answer climbing back up the chain…'],
      fields:[{k:'Answer',v:'142.250.182.100',c:'#4ade80'},{k:'AA Flag',v:'1 ✓ (Authoritative)'},{k:'TTL',v:'300 seconds (5 min)'},{k:'Chain Step',v:'Unwind ①: Auth → TLD'}],
      cacheAdd: null
    },
    {
      step:9, title:'Step 9 — Answer Unwinds: TLD NS → Root NS',
      tag:'TLD → ROOT NS', tagColor:'var(--amber)', tagBg:'rgba(251,191,36,0.12)',
      desc:'The answer continues unwinding: <strong>TLD NS → Root NS</strong>. Every server that participated in the forward walk passes the answer back up to whoever called it. This is the recursive contract — each node relays the answer back up the chain.',
      from:'tld', to:'root', via:[],
      pktColor:'#fbbf24', pktLabel:'✓ IP\n→Root',
      activeNodes:['tld','root'],
      pktCard:['TLD NS → ROOT NS (unwind)','Answer: 142.250.182.100','Unwind ②: TLD → Root','Each node passes answer back up','One more hop: Root → Resolver'],
      fields:[{k:'Answer',v:'142.250.182.100',c:'#38d9c0'},{k:'Chain Step',v:'Unwind ②: TLD → Root',c:'#fbbf24'},{k:'Next',v:'Root passes answer to Resolver →',c:'#38d9c0'}],
      cacheAdd: null
    },
    {
      step:10, title:'Step 10 — Answer Unwinds: Root NS → Resolver',
      tag:'ROOT → RESOLVER ✓', tagColor:'var(--amber)', tagBg:'rgba(251,191,36,0.12)',
      desc:'Final unwind hop: <strong>Root NS → DNS Resolver (8.8.8.8)</strong>. The resolver waited through the entire forward + unwind journey. It now receives the answer, caches <strong>www.google.com → 142.250.182.100</strong> for 300s, and the full recursive chain is complete.',
      from:'root', to:'resolver', via:[],
      pktColor:'#38d9c0', pktLabel:'✓ IP\n→ Res',
      activeNodes:['root','resolver'],
      pktCard:['ROOT NS → RESOLVER (unwind done!)','Answer: 142.250.182.100','Unwind ③: Root → Resolver','Recursive chain fully unwound ✓','Resolver caches result for 300s'],
      fields:[{k:'Answer',v:'142.250.182.100',c:'#38d9c0'},{k:'Chain Step',v:'Unwind ③: Root → Resolver ✓',c:'#fbbf24'},{k:'Resolver caches',v:'300s TTL'},{k:'Recursive chain',v:'Fully unwound ✓'}],
      cacheAdd: {domain:'www.google.com',type:'A',value:'142.250.182.100',ttl:'300s'}
    },
   
    // ── DELIVER ───────────────────────────────────────────────────────────────
    {
      step:11, title:'Step 11 — Resolver Returns Final Answer to PC',
      tag:'ANSWER → PC', tagColor:'var(--cyan)', tagBg:'rgba(56,217,192,0.12)',
      desc:'The resolver delivers the final answer: <strong>Resolver → Internet → Router → Switch → PC</strong>. From the PC\'s perspective: it sent ONE query and got ONE answer. The entire recursive hierarchy walk happened transparently behind the scenes.',
      from:'resolver', to:'pc', via:['inet','rtr','sw'],
      pktColor:'#38d9c0', pktLabel:'142.250\n.182.100',
      activeNodes:['resolver','inet','rtr','sw','pc'],
      pktCard:['FINAL ANSWER → PC','142.250.182.100 ✓','Path: Resolver→inet→Router→SW→PC','Total DNS time: ~50ms','PC caches in OS + Browser'],
      fields:[{k:'Final Answer',v:'142.250.182.100 ✓',c:'#38d9c0'},{k:'Total DNS Time',v:'~50ms (typical)'},{k:'Path',v:'Resolver→inet→Router→SW→PC'},{k:'Cached at',v:'Resolver (300s) + Router + OS + Browser'}],
      cacheAdd: null
    },
    {
      step:12, title:'Step 12 — Browser Opens TCP Connection to Web Server 🎉',
      tag:'DONE ✓', tagColor:'var(--green)', tagBg:'rgba(74,222,128,0.12)',
      desc:'🎉 DNS resolution complete! Browser now has <strong>142.250.182.100</strong>. It initiates a <strong>TCP 3-way handshake</strong> (SYN → SYN-ACK → ACK) to port 443 (HTTPS), then TLS handshake, then HTTP GET.',
      from:'pc', to:'web', via:['sw','rtr','inet'],
      pktColor:'#4ade80', pktLabel:'HTTPS\nGET',
      activeNodes:['pc','sw','rtr','inet','web'],
      pktCard:['TCP HANDSHAKE → WEB SERVER','Dest: 142.250.182.100:443','SYN → SYN-ACK → ACK','TLS Handshake then HTTP GET','DNS resolution: COMPLETE ✓'],
      fields:[{k:'Action',v:'TCP 3-Way Handshake',c:'#4ade80'},{k:'Dest IP',v:'142.250.182.100'},{k:'Port',v:'443 (HTTPS / TLS)'},{k:'After',v:'TLS → HTTP GET / HTTP 200 OK'},{k:'DNS Role',v:'Complete ✓'}],
      cacheAdd: null
    }
  ];
  
  // ─────────────────────────────────────────
  // DNS ITERATIVE STEPS — 12 steps
  // ─────────────────────────────────────────
  const DNS_ITERATIVE_STEPS = [
    {
      step:1, title:'Step 1 — Browser DNS Cache: MISS',
      tag:'BROWSER CACHE', tagColor:'var(--blue)', tagBg:'rgba(91,156,246,0.12)',
      desc:'Browser checks its local DNS cache for <strong>www.google.com</strong>. Cache MISS — either never visited or TTL expired. Moves to OS level.',
      from:'pc', to:'pc', via:[], pktColor:'#f87171', pktLabel:'MISS',
      activeNodes:['pc'],
      pktCard:['BROWSER DNS CACHE','www.google.com → ❌ MISS','Chrome: chrome://net-internals/#dns','TTL expired or never visited','→ Checking OS cache next'],
      fields:[{k:'Browser Cache',v:'❌ MISS',c:'#f87171'},{k:'Domain',v:'www.google.com'},{k:'Next',v:'OS cache check →'}],
      cacheAdd: null
    },
    {
      step:2, title:'Step 2 — OS Cache & /etc/hosts: MISS',
      tag:'OS CACHE', tagColor:'var(--blue)', tagBg:'rgba(91,156,246,0.12)',
      desc:'OS checks /etc/hosts and the OS DNS cache. Both MISS. Query travels to router.',
      from:'pc', to:'pc', via:[], pktColor:'#f87171', pktLabel:'MISS',
      activeNodes:['pc'],
      pktCard:['OS DNS RESOLVER CACHE','/etc/hosts → ❌ No static entry','OS Resolver Cache → ❌ MISS','ipconfig /displaydns (Windows)','→ Querying router next'],
      fields:[{k:'/etc/hosts',v:'❌ No static entry'},{k:'OS DNS Cache',v:'❌ MISS'},{k:'Next',v:'Router DNS cache →'}],
      cacheAdd: null
    },
    {
      step:3, title:'Step 3 — Router DNS Cache: MISS → Forwards to Resolver',
      tag:'ROUTER CACHE', tagColor:'var(--purple)', tagBg:'rgba(167,139,250,0.12)',
      desc:'Query goes to <strong>router (192.168.1.1)</strong>. Router\'s DNS cache is empty for this domain. Router forwards query to configured DNS Resolver (8.8.8.8).',
      from:'pc', to:'rtr', via:['sw'],
      pktColor:'#a78bfa', pktLabel:'DNS?',
      activeNodes:['pc','sw','rtr'],
      pktCard:['DNS QUERY → ROUTER','Router Cache: ❌ MISS','Forwarding to: 8.8.8.8','Resolver will do iterative queries','→ 3 iterative rounds ahead'],
      fields:[{k:'Router Cache',v:'❌ MISS'},{k:'Forwarding to',v:'8.8.8.8 (DNS Resolver)',c:'#38d9c0'},{k:'Next',v:'Resolver cache check →'}],
      cacheAdd: null
    },
    {
      step:4, title:'Step 4 — Resolver Receives Query; Resolver Cache: MISS',
      tag:'RESOLVER CACHE', tagColor:'var(--cyan)', tagBg:'rgba(56,217,192,0.12)',
      desc:'Router forwards to <strong>DNS Resolver (8.8.8.8)</strong>. Resolver checks its cache — MISS. Resolver will now use <em>iterative queries</em>, asking each nameserver in sequence and following referrals itself.',
      from:'rtr', to:'resolver', via:['inet'],
      pktColor:'#38d9c0', pktLabel:'Q?',
      activeNodes:['rtr','inet','resolver'],
      pktCard:['DNS RESOLVER (8.8.8.8)','Resolver Cache: ❌ MISS','Mode: Iterative (RD=0)','Will follow each referral itself','→ Iterative #1: Root NS'],
      fields:[{k:'Resolver',v:'8.8.8.8 (Google DNS)',c:'#38d9c0'},{k:'Cache',v:'❌ MISS'},{k:'Mode',v:'Iterative (follows referrals)'},{k:'Next',v:'Iterative query to Root NS →',c:'#fbbf24'}],
      cacheAdd: null
    },
    {
      step:5, title:'Step 5 — Resolver → Root NS (Iterative Step 1)',
      tag:'ITER #1 → ROOT', tagColor:'var(--amber)', tagBg:'rgba(251,191,36,0.12)',
      desc:'The resolver starts iterative resolution. Queries Root NS with <strong>RD=0</strong> (no recursion expected). Root NS answers with a referral, not the final answer.',
      from:'resolver', to:'root', via:[],
      pktColor:'#fbbf24', pktLabel:'ITER\n#1',
      activeNodes:['resolver','root'],
      pktCard:['ITER #1 → ROOT NS','a.root-servers.net','RD=0 (just give referral)','Asking: Who handles .com?','Resolver handles follow-up itself'],
      fields:[{k:'Iterative Step',v:'#1 of 3',c:'#fbbf24'},{k:'Target',v:'a.root-servers.net'},{k:'RD Flag',v:'0 (just give referral)'},{k:'Question',v:'Who handles .com?'}],
      cacheAdd: null
    },
    {
      step:6, title:'Step 6 — Root NS → Resolver: Referral to .com TLD',
      tag:'ROOT REFERRAL', tagColor:'var(--amber)', tagBg:'rgba(251,191,36,0.12)',
      desc:'Root NS returns a <strong>referral</strong> pointing to .com TLD servers. AA=0. The resolver follows this referral itself (that\'s what makes it iterative — the resolver does the legwork).',
      from:'root', to:'resolver', via:[],
      pktColor:'#fbbf24', pktLabel:'REF\n.com',
      activeNodes:['root','resolver'],
      pktCard:['← ROOT NS REFERRAL','AA=0 (not authoritative)','.com TLD: a.gtld-servers.net','Glue IP: 192.5.6.30','→ Resolver queries TLD directly'],
      fields:[{k:'Response',v:'NS Referral',c:'#fbbf24'},{k:'AA Flag',v:'0 (not authoritative)'},{k:'.com NS',v:'a.gtld-servers.net'},{k:'Glue IP',v:'192.5.6.30'},{k:'Next',v:'Resolver queries TLD directly'}],
      cacheAdd: {domain:'.com NS',type:'NS',value:'a.gtld-servers.net',ttl:'172800s'}
    },
    {
      step:7, title:'Step 7 — Resolver → .com TLD NS (Iterative Step 2)',
      tag:'ITER #2 → TLD', tagColor:'var(--purple)', tagBg:'rgba(167,139,250,0.12)',
      desc:'Resolver contacts the <strong>.com TLD NS</strong> directly using the glue IP from step 6. Again RD=0 — just asking for a referral.',
      from:'resolver', to:'tld', via:[],
      pktColor:'#a78bfa', pktLabel:'ITER\n#2',
      activeNodes:['resolver','tld'],
      pktCard:['ITER #2 → .com TLD NS','a.gtld-servers.net (192.5.6.30)','RD=0 (ask for referral only)','Asking: Auth NS for google.com?','Resolver handles follow-up itself'],
      fields:[{k:'Iterative Step',v:'#2 of 3',c:'#a78bfa'},{k:'Target',v:'a.gtld-servers.net'},{k:'Using IP',v:'192.5.6.30 (glue record)'},{k:'Question',v:'Auth NS for google.com?'}],
      cacheAdd: null
    },
    {
      step:8, title:'Step 8 — .com TLD → Resolver: Referral to Auth NS',
      tag:'TLD REFERRAL', tagColor:'var(--purple)', tagBg:'rgba(167,139,250,0.12)',
      desc:'TLD NS gives another <strong>referral</strong>: google.com is served by ns1.google.com. Includes glue records so resolver can go directly to the auth server.',
      from:'tld', to:'resolver', via:[],
      pktColor:'#a78bfa', pktLabel:'REF\nAuth',
      activeNodes:['tld','resolver'],
      pktCard:['← TLD NS REFERRAL','AA=0 (not authoritative)','Auth NS: ns1.google.com','Glue: 216.239.32.10','→ Resolver queries Auth NS directly'],
      fields:[{k:'Response',v:'NS Referral',c:'#a78bfa'},{k:'Auth NS',v:'ns1.google.com'},{k:'Glue',v:'216.239.32.10'},{k:'Next',v:'Resolver queries Auth NS directly'}],
      cacheAdd: {domain:'google.com NS',type:'NS',value:'ns1.google.com',ttl:'172800s'}
    },
    {
      step:9, title:'Step 9 — Resolver → Auth NS (Iterative Step 3)',
      tag:'ITER #3 → AUTH', tagColor:'var(--green)', tagBg:'rgba(74,222,128,0.12)',
      desc:'Third and final iterative query. Resolver contacts <strong>ns1.google.com</strong> — this time it expects the actual answer.',
      from:'resolver', to:'auth', via:[],
      pktColor:'#4ade80', pktLabel:'ITER\n#3',
      activeNodes:['resolver','auth'],
      pktCard:['ITER #3 → AUTH NS (FINAL)','ns1.google.com (216.239.32.10)','RD=0 → Expects final answer!','Asking: A record for www.google.com','This is the last iterative query'],
      fields:[{k:'Iterative Step',v:'#3 of 3 — FINAL',c:'#4ade80'},{k:'Target',v:'ns1.google.com'},{k:'Auth IP',v:'216.239.32.10'},{k:'Expects',v:'Definitive A record answer!'}],
      cacheAdd: null
    },
    {
      step:10, title:'Step 10 — Auth NS Returns Authoritative Answer (AA=1)',
      tag:'ANSWER ✓', tagColor:'var(--green)', tagBg:'rgba(74,222,128,0.12)',
      desc:'Auth NS returns the <strong>definitive final answer</strong>. AA=1 (Authoritative Answer). 3 iterative rounds complete. www.google.com = 142.250.182.100.',
      from:'auth', to:'resolver', via:[],
      pktColor:'#4ade80', pktLabel:'✓ IP',
      activeNodes:['auth','resolver'],
      pktCard:['← AUTH ANSWER ✓ (AA=1)','www.google.com','→ 142.250.182.100','TTL: 300s | 3 iterations complete','Resolver caches all NS + IP'],
      fields:[{k:'Response',v:'AUTHORITATIVE',c:'#4ade80'},{k:'AA Flag',v:'1 ✓'},{k:'www.google.com',v:'142.250.182.100',c:'#38d9c0'},{k:'Iterations',v:'3 (Root → TLD → Auth)'}],
      cacheAdd: {domain:'www.google.com',type:'A',value:'142.250.182.100',ttl:'300s'}
    },
    {
      step:11, title:'Step 11 — Resolver Returns Answer to PC',
      tag:'ANSWER → PC', tagColor:'var(--cyan)', tagBg:'rgba(56,217,192,0.12)',
      desc:'Resolver sends final answer to the PC. From the client\'s view: 1 query → 1 answer. The resolver handled all 3 iterative lookups internally.',
      from:'resolver', to:'pc', via:['inet','rtr','sw'],
      pktColor:'#38d9c0', pktLabel:'142.250\n.182.100',
      activeNodes:['resolver','inet','rtr','sw','pc'],
      pktCard:['FINAL ANSWER → PC','142.250.182.100 ✓','3 iterative queries by resolver','Client sent 1 query → 1 answer','All caches updated along path'],
      fields:[{k:'Final Answer',v:'142.250.182.100 ✓',c:'#38d9c0'},{k:'Total Queries',v:'3 iterative (all by resolver)'},{k:'Client sees',v:'1 query → 1 answer'},{k:'Resolver cached',v:'All NS records + final IP'}],
      cacheAdd: null
    },
    {
      step:12, title:'Step 12 — Browser Connects to Web Server 🎉',
      tag:'DONE ✓', tagColor:'var(--green)', tagBg:'rgba(74,222,128,0.12)',
      desc:'DNS complete! Browser opens TCP/HTTPS connection to 142.250.182.100 and loads the page.',
      from:'pc', to:'web', via:['sw','rtr','inet'],
      pktColor:'#4ade80', pktLabel:'HTTPS\nGET',
      activeNodes:['pc','sw','rtr','inet','web'],
      pktCard:['TCP HANDSHAKE → WEB SERVER','Dest: 142.250.182.100:443','SYN → SYN-ACK → ACK','TLS Handshake then HTTP GET','DNS resolution: COMPLETE ✓'],
      fields:[{k:'Action',v:'TCP Handshake + HTTPS',c:'#4ade80'},{k:'Dest IP',v:'142.250.182.100'},{k:'Port',v:'443 (HTTPS)'},{k:'DNS Role',v:'Complete ✓'}],
      cacheAdd: null
    }
  ];
  
  function dnsSetMode(mode) {
    dnsMode = mode;
    dnsReset();
    document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
    const tab = document.getElementById('dns-tab-' + mode);
    if (tab) tab.classList.add('active');
  
    const descEl = document.getElementById('dns-mode-desc');
    const totalEl = document.getElementById('dns-step-total');
    const steps = mode === 'recursive' ? DNS_RECURSIVE_STEPS : DNS_ITERATIVE_STEPS;
    if (totalEl) totalEl.textContent = steps.length;
    if (descEl) {
      if (mode === 'recursive') {
        descEl.innerHTML = `<strong style="color:var(--cyan)">Recursive Query</strong> — Full real-world chain: Browser Cache → OS Cache → /etc/hosts → Router DNS Cache → Resolver Cache → Root NS → TLD NS → Auth NS → Answer. The PC sends ONE query and gets ONE complete answer.`;
      } else {
        descEl.innerHTML = `<strong style="color:var(--purple)">Iterative Query</strong> — Same cache chain, but the resolver performs <em>iterative</em> queries to each NS level (RD=0), getting referrals and following them step by step. Root → TLD → Auth. Resolver does the legwork itself.`;
      }
    }
    updateDnsChain(0);
  }
  
  function dnsDrawTopo(activeEdge, pktX, pktY, pktColor, pktLabel, pktCard, animStyle, animT, animSeg) {
    const svg = document.getElementById('dns-svg');
    if (!svg) return;
    const N = DNS_NODES;
    const aN = dnsActiveNodes;
  
    let html = `<defs>
      <marker id="rtr-arrow" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
        <path d="M1 1L7 4L1 7" fill="none" stroke="currentColor" stroke-width="1.5"/>
      </marker>
    </defs>`;
  
    // Edges
    html += svgEdge(N.pc.x, N.pc.y, N.sw.x, N.sw.y, aN.includes('pc')&&aN.includes('sw'), '#5b9cf6');
    html += svgEdge(N.sw.x, N.sw.y, N.rtr.x, N.rtr.y, aN.includes('sw')&&aN.includes('rtr'), '#5b9cf6');
    html += svgEdge(N.rtr.x, N.rtr.y, N.inet.x, N.inet.y, aN.includes('rtr')&&aN.includes('inet'), '#38d9c0');
    html += svgEdge(N.inet.x, N.inet.y, N.resolver.x, N.resolver.y, aN.includes('inet')&&aN.includes('resolver'), '#38d9c0');
    html += svgEdge(N.resolver.x, N.resolver.y, N.root.x, N.root.y, aN.includes('resolver')&&aN.includes('root'), '#fbbf24');
    html += svgEdge(N.resolver.x, N.resolver.y, N.tld.x, N.tld.y, aN.includes('resolver')&&aN.includes('tld'), '#a78bfa', true);
    html += svgEdge(N.resolver.x, N.resolver.y, N.auth.x, N.auth.y, aN.includes('resolver')&&aN.includes('auth'), '#4ade80', true);
    // DNS hierarchy (faint dashed)
    html += svgEdge(N.root.x, N.root.y, N.tld.x, N.tld.y, false, '#444', true);
    html += svgEdge(N.tld.x, N.tld.y, N.auth.x, N.auth.y, false, '#444', true);
    // Web server
    html += svgEdge(N.inet.x, N.inet.y, N.web.x, N.web.y, aN.includes('web')&&aN.includes('inet'), '#4ade80', true);
  
    // Labels
    html += `<text x="200" y="295" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#5a6080">LAN 192.168.1.0/24</text>`;
    html += `<text x="420" y="195" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#5a6080">Internet</text>`;
    html += `<text x="800" y="55" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="7.5" fill="#5a6080">DNS Hierarchy</text>`;
  
    // Zone brackets
    html += `<rect x="22" y="235" width="306" height="55" rx="4" fill="none" stroke="rgba(91,156,246,0.08)" stroke-width="1" stroke-dasharray="4,3"/>`;
    html += `<rect x="530" y="50" width="270" height="320" rx="4" fill="none" stroke="rgba(251,191,36,0.06)" stroke-width="1" stroke-dasharray="4,3"/>`;
  
    // Nodes
    html += svgPC(N.pc.x, N.pc.y, 'pc', 'PC\nBrowser', aN.includes('pc'));
    html += svgSwitch(N.sw.x, N.sw.y, 'sw', 'Switch', aN.includes('sw'));
    html += svgRouter(N.rtr.x, N.rtr.y, 'rtr', 'Router\n192.168.1.1', aN.includes('rtr'));
    html += svgCloud(N.inet.x, N.inet.y, 'inet', 'Internet', aN.includes('inet'));
    html += svgNS(N.resolver.x, N.resolver.y, 'resolver', 'DNS Resolver', '8.8.8.8', aN.includes('resolver'), '#38d9c0');
    html += svgNS(N.root.x, N.root.y, 'root', 'Root NS', 'a.root-servers.net', aN.includes('root'), '#fbbf24');
    html += svgNS(N.tld.x, N.tld.y, 'tld', '.com TLD NS', 'a.gtld-servers.net', aN.includes('tld'), '#a78bfa');
    html += svgNS(N.auth.x, N.auth.y, 'auth', 'Auth NS', 'ns1.google.com', aN.includes('auth'), '#4ade80');
    html += svgServer(N.web.x, N.web.y, 'web', 'Web Server\n142.250.182.100', aN.includes('web'), '#4ade80');
  
    // ─── Animated packet — style varies by mode ───────────────────────────────
    if (pktX !== undefined) {
      const lines = pktLabel.split('\n');
      const style = animStyle || 'recursive';
      const t = animT ?? 0;

      if (style === 'recursive') {
        // Smooth glowing orb with comet tail — resolver carries the query fluidly
        const haloR = 26 + Math.sin(t * Math.PI) * 4;
        html += `<circle cx="${pktX}" cy="${pktY}" r="${haloR}" fill="${pktColor}08" stroke="${pktColor}22" stroke-width="1"/>`;
        html += `<circle cx="${pktX}" cy="${pktY}" r="18" fill="${pktColor}18" stroke="${pktColor}" stroke-width="2"/>`;
        html += `<circle cx="${pktX}" cy="${pktY}" r="9" fill="${pktColor}cc"/>`;
        if (animSeg) {
          const dx = animSeg.to.x - animSeg.from.x, dy = animSeg.to.y - animSeg.from.y;
          const len = Math.sqrt(dx*dx + dy*dy) || 1;
          const ux = dx/len, uy = dy/len;
          const tailLen = 28 + t * 10;
          html += `<line x1="${pktX - ux*tailLen}" y1="${pktY - uy*tailLen}" x2="${pktX}" y2="${pktY}" stroke="${pktColor}" stroke-width="2" stroke-linecap="round" opacity="${0.18 + t*0.12}"/>`;
        }

      } else if (style === 'recursive-pulse') {
        // Expanding concentric rings — resolver absorbed the query
        const r1 = 9 + t * 28, r2 = 9 + t * 18;
        html += `<circle cx="${pktX}" cy="${pktY}" r="${r1}" fill="none" stroke="${pktColor}" stroke-width="1.5" opacity="${(1-t)*0.5}"/>`;
        html += `<circle cx="${pktX}" cy="${pktY}" r="${r2}" fill="none" stroke="${pktColor}" stroke-width="2" opacity="${(1-t)*0.7}"/>`;
        html += `<circle cx="${pktX}" cy="${pktY}" r="18" fill="${pktColor}18" stroke="${pktColor}" stroke-width="2" opacity="${1-t*0.4}"/>`;
        html += `<circle cx="${pktX}" cy="${pktY}" r="9" fill="${pktColor}cc"/>`;

      } else if (style === 'recursive-cache') {
        // Spinning arc ring — recursive cache check feels like a smooth scan
        const spin = t * Math.PI * 2.5;
        const r = 18;
        const arcX1 = pktX + r * Math.cos(spin), arcY1 = pktY + r * Math.sin(spin);
        const arcX2 = pktX + r * Math.cos(spin + Math.PI * 1.3), arcY2 = pktY + r * Math.sin(spin + Math.PI * 1.3);
        html += `<circle cx="${pktX}" cy="${pktY}" r="${r}" fill="${pktColor}10" stroke="${pktColor}25" stroke-width="1.5"/>`;
        html += `<path d="M${arcX1},${arcY1} A${r},${r} 0 0,1 ${arcX2},${arcY2}" fill="none" stroke="${pktColor}" stroke-width="2.5" stroke-linecap="round"/>`;
        html += `<circle cx="${pktX}" cy="${pktY}" r="9" fill="${pktColor}99"/>`;

      } else if (style === 'iterative') {
        // Sharp diamond + dashed trail — deliberate iterative hop forward
        const size = 10;
        html += `<rect x="${pktX-15}" y="${pktY-15}" width="30" height="30" rx="4" fill="none" stroke="${pktColor}50" stroke-width="1" stroke-dasharray="3,2"/>`;
        html += `<polygon points="${pktX},${pktY-size} ${pktX+size},${pktY} ${pktX},${pktY+size} ${pktX-size},${pktY}" fill="${pktColor}cc" stroke="${pktColor}" stroke-width="2"/>`;
        if (animSeg) {
          const dx = animSeg.to.x - animSeg.from.x, dy = animSeg.to.y - animSeg.from.y;
          const len = Math.sqrt(dx*dx + dy*dy) || 1;
          const ux = dx/len, uy = dy/len;
          const trailLen = Math.min(t * len * 0.65, 50);
          html += `<line x1="${pktX - ux*trailLen}" y1="${pktY - uy*trailLen}" x2="${pktX}" y2="${pktY}" stroke="${pktColor}" stroke-width="1.5" stroke-dasharray="4,3" opacity="0.45"/>`;
        }

      } else if (style === 'iterative-return') {
        // Arrow chevron + dashed trail — referral returning to resolver
        const size = 9;
        html += `<polygon points="${pktX+size},${pktY-size} ${pktX-size},${pktY} ${pktX+size},${pktY+size} ${pktX},${pktY}" fill="${pktColor}bb" stroke="${pktColor}" stroke-width="1.8"/>`;
        if (animSeg) {
          const dx = animSeg.to.x - animSeg.from.x, dy = animSeg.to.y - animSeg.from.y;
          const len = Math.sqrt(dx*dx + dy*dy) || 1;
          const ux = dx/len, uy = dy/len;
          const trailLen = Math.min(t * len * 0.55, 45);
          html += `<line x1="${pktX - ux*trailLen}" y1="${pktY - uy*trailLen}" x2="${pktX}" y2="${pktY}" stroke="${pktColor}" stroke-width="1.5" stroke-dasharray="5,4" opacity="0.4"/>`;
        }

      } else if (style === 'iterative-cache') {
        // Blinking square — discrete cache lookup feel
        const blink = Math.sin(t * Math.PI * 6) * 0.5 + 0.5;
        const alpha = Math.round(blink * 0x22).toString(16).padStart(2,'0');
        html += `<rect x="${pktX-14}" y="${pktY-14}" width="28" height="28" rx="3" fill="${pktColor}${alpha}" stroke="${pktColor}" stroke-width="2" opacity="${0.5 + blink*0.5}"/>`;
        html += `<rect x="${pktX-7}" y="${pktY-7}" width="14" height="14" rx="2" fill="${pktColor}cc"/>`;
      }

      // Label text (shared across all styles)
      lines.forEach((l, i) => {
        html += `<text x="${pktX}" y="${pktY - 3 + i * 10}" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="8" font-weight="700" fill="#fff">${l}</text>`;
      });

      // Floating info card — dashed border for iterative, solid for recursive
      if (pktCard && pktCard.length) {
        const cx = Math.max(96, Math.min(pktX, 830-96));
        const cy = pktY - 90;
        const cw = 200, ch = 14 + pktCard.length * 14;
        const dashAttr = style.startsWith('iterative') ? ' stroke-dasharray="4,2"' : '';
        html += `<rect x="${cx-cw/2}" y="${cy}" width="${cw}" height="${ch}" rx="5" fill="rgba(7,9,15,0.94)" stroke="${pktColor}" stroke-width="1.2"${dashAttr}/>`;
        html += `<line x1="${pktX}" y1="${pktY-18}" x2="${cx}" y2="${cy+ch}" stroke="${pktColor}" stroke-width="0.8" stroke-dasharray="3,2" opacity="0.6"/>`;
        pktCard.forEach((line, i) => {
          const fc = i === 0 ? pktColor : (i === 1 ? '#c8d0e0' : '#8892b0');
          const fw = i === 0 ? '700' : '400';
          html += `<text x="${cx}" y="${cy+12+i*14}" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="${i===0?9.5:8.5}" font-weight="${fw}" fill="${fc}">${line}</text>`;
        });
      }
    }

    svg.innerHTML = html;
  }
  
  // Ease helpers
  function easeInOut(t) { return t < 0.5 ? 2*t*t : -1+(4-2*t)*t; }
  // Cubic ease-out — crisp deceleration for iterative "hop" feel
  function easeStep(t) { return 1 - Math.pow(1 - t, 3); }

  // ─── Recursive animation ───────────────────────────────────────────────────
  // Smooth glide with expanding pulse ring at destination — conveys the resolver
  // seamlessly "carrying" the full query on behalf of the client.
  function dnsAnimateRecursive(s, uniqPath, nodes) {
    const segDur = dnsGetSegDur();
    const segments = [];
    for (let i = 0; i < uniqPath.length - 1; i++)
      segments.push({from: nodes[uniqPath[i]], to: nodes[uniqPath[i+1]]});

    let segIdx = 0, startTime = null;
    let phase = 'forward'; // 'forward' | 'pulse'
    let pulseStart = null;
    const pulseDur = segDur * 0.45;

    function anim(ts) {
      if (phase === 'forward') {
        if (!startTime) startTime = ts;
        const elapsed = ts - startTime;
        const t = Math.min(elapsed / segDur, 1);
        const e = easeInOut(t);
        const seg = segments[segIdx];
        const px = seg.from.x + (seg.to.x - seg.from.x) * e;
        const py = seg.from.y + (seg.to.y - seg.from.y) * e;
        dnsDrawTopo(true, px, py, s.pktColor, s.pktLabel, s.pktCard, 'recursive', t, seg);
        if (t >= 1) {
          if (segIdx < segments.length - 1) {
            segIdx++; startTime = ts;
            dnsAnimId = requestAnimationFrame(anim);
          } else {
            phase = 'pulse'; pulseStart = ts;
            dnsAnimId = requestAnimationFrame(anim);
          }
        } else {
          dnsAnimId = requestAnimationFrame(anim);
        }
      } else {
        // Pulse ring expands at destination then finalizes
        const elapsed = ts - pulseStart;
        const t = Math.min(elapsed / pulseDur, 1);
        const dest = nodes[uniqPath[uniqPath.length - 1]];
        dnsDrawTopo(true, dest.x, dest.y, s.pktColor, s.pktLabel, s.pktCard, 'recursive-pulse', t, null);
        if (t >= 1) { dnsFinalizeStep(s); }
        else { dnsAnimId = requestAnimationFrame(anim); }
      }
    }
    dnsAnimId = requestAnimationFrame(anim);
  }

  // ─── Iterative animation ───────────────────────────────────────────────────
  // Sharp cubic-ease hop with a dashed trailing line — conveys deliberate
  // step-by-step referral hops the resolver makes on its own.
  function dnsAnimateIterative(s, uniqPath, nodes) {
    const segDur = dnsGetSegDur();
    const isReturn = (s.to === 'resolver' && s.from !== 'pc') || (s.to === 'pc');
    const segments = [];
    for (let i = 0; i < uniqPath.length - 1; i++)
      segments.push({from: nodes[uniqPath[i]], to: nodes[uniqPath[i+1]]});

    let segIdx = 0, startTime = null;
    const hopDur = segDur * 0.85;

    function anim(ts) {
      if (!startTime) startTime = ts;
      const elapsed = ts - startTime;
      const t = Math.min(elapsed / hopDur, 1);
      const e = easeStep(t);
      const seg = segments[segIdx];
      const px = seg.from.x + (seg.to.x - seg.from.x) * e;
      const py = seg.from.y + (seg.to.y - seg.from.y) * e;
      const style = isReturn ? 'iterative-return' : 'iterative';
      dnsDrawTopo(true, px, py, s.pktColor, s.pktLabel, s.pktCard, style, t, seg);
      if (t >= 1) {
        if (segIdx < segments.length - 1) {
          segIdx++; startTime = ts;
          dnsAnimId = requestAnimationFrame(anim);
        } else {
          dnsDrawTopo(true, seg.to.x, seg.to.y, s.pktColor, s.pktLabel, s.pktCard, style, 1, seg);
          dnsAnimId = setTimeout(() => { dnsFinalizeStep(s); }, 300);
        }
      } else {
        dnsAnimId = requestAnimationFrame(anim);
      }
    }
    dnsAnimId = requestAnimationFrame(anim);
  }

  function dnsAnimateStep(step) {
    const steps = dnsMode === 'recursive' ? DNS_RECURSIVE_STEPS : DNS_ITERATIVE_STEPS;
    const s = steps[step - 1];
    if (!s) return;
    const nodes = DNS_NODES;
    const path = [s.from, ...s.via, s.to];
    const uniqPath = path.filter((n, i) => i === 0 || n !== path[i-1]);
    dnsActiveNodes = s.activeNodes || uniqPath;

    if (s.from === s.to) {
      // Cache-check flash — spinning ring for recursive, blinking square for iterative
      const node = DNS_NODES[s.from];
      const px = node.x, py = node.y - 15;
      const flashMode = dnsMode === 'recursive' ? 'recursive-cache' : 'iterative-cache';
      let flashStart = null;
      const flashDur = dnsGetSegDur() * 1.2;
      function flashAnim(ts) {
        if (!flashStart) flashStart = ts;
        const t = Math.min((ts - flashStart) / flashDur, 1);
        dnsDrawTopo(true, px, py, s.pktColor, s.pktLabel, s.pktCard, flashMode, t, null);
        if (t < 1) dnsAnimId = requestAnimationFrame(flashAnim);
        else { dnsDrawTopo(false); dnsFinalizeStep(s); }
      }
      dnsAnimId = requestAnimationFrame(flashAnim);
      return;
    }

    if (dnsMode === 'recursive') {
      dnsAnimateRecursive(s, uniqPath, nodes);
    } else {
      dnsAnimateIterative(s, uniqPath, nodes);
    }
  }
  
  function dnsFinalizeStep(s) {
    if (s.cacheAdd) { dnsCacheEntries.push(s.cacheAdd); dnsRenderCache(); }
    dnsUpdateUI();
  }
  
  function dnsUpdateUI() {
    const steps = dnsMode === 'recursive' ? DNS_RECURSIVE_STEPS : DNS_ITERATIVE_STEPS;
    const step = dnsCurrentStep;
    const info = document.getElementById('dns-step-info');
    const numEl = document.getElementById('dns-step-num');
    const prog = document.getElementById('dns-progress');
    if (numEl) numEl.textContent = step;
    if (prog) prog.style.width = (step / steps.length * 100) + '%';
    updateDnsChain(step);
  
    if (step === 0) {
      if (info) info.innerHTML = `<div class="step-tag" style="background:rgba(56,217,192,0.1);color:var(--cyan)">READY</div>
        <div class="step-title">Select a query mode and press ▶ Play to begin DNS resolution</div>
        <div class="step-desc">Watch the <em>complete real-world</em> DNS journey for <strong>www.google.com</strong>. Every cache check, every hop, every referral — step by step.</div>`;
      document.getElementById('dns-pkt-fields').innerHTML = '<div style="color:var(--muted);font-family:var(--mono);font-size:11px;">Start the animation to see query details…</div>';
      return;
    }
  
    const s = steps[step - 1];
    if (info) info.innerHTML = `<div class="step-tag" style="background:${s.tagBg};color:${s.tagColor}">${s.tag}</div>
      <div class="step-title">${s.title}</div>
      <div class="step-desc">${s.desc}</div>`;
  
    const fieldsEl = document.getElementById('dns-pkt-fields');
    if (fieldsEl && s.fields) {
      let fhtml = '<div class="pkt-fields">';
      s.fields.forEach(f => {
        fhtml += `<div class="pkt-field"><div class="pkt-field-key">${f.k}</div><div class="pkt-field-val" style="color:${f.c||'var(--text)'}">${f.v}</div></div>`;
      });
      fhtml += '</div>';
      fieldsEl.innerHTML = fhtml;
    }
  }
  
  function dnsRenderCache() {
    const tbody = document.getElementById('dns-cache-body');
    const note = document.getElementById('dns-cache-note');
    if (!tbody) return;
    if (dnsCacheEntries.length === 0) {
      tbody.innerHTML = '';
      if (note) note.textContent = 'Cache is empty';
      return;
    }
    tbody.innerHTML = dnsCacheEntries.map((e, i) =>
      `<tr class="${i===dnsCacheEntries.length-1?'new':''}">
        <td>${e.domain}</td><td style="color:var(--blue)">${e.type}</td>
        <td style="color:var(--cyan)">${e.value}</td><td style="color:var(--amber)">${e.ttl}</td>
      </tr>`
    ).join('');
    if (note) note.textContent = `${dnsCacheEntries.length} record(s) cached by resolver`;
  }
  
  function dnsStep(dir) {
    if (dnsAnimId) { cancelAnimationFrame(dnsAnimId); clearTimeout(dnsAnimId); dnsAnimId = null; }
    const steps = dnsMode === 'recursive' ? DNS_RECURSIVE_STEPS : DNS_ITERATIVE_STEPS;
    const newStep = dnsCurrentStep + dir;
    if (newStep < 0 || newStep > steps.length) return;
    dnsCurrentStep = newStep;
    dnsActiveNodes = [];
    dnsDrawTopo(false);
    dnsUpdateUI();
    if (newStep > 0) dnsAnimateStep(newStep);
  }
  
  function dnsTogglePlay() {
    dnsPlaying = !dnsPlaying;
    const btn = document.getElementById('dns-play-btn');
    if (btn) btn.textContent = dnsPlaying ? '⏸ Pause' : '▶ Play';
    if (dnsPlaying) dnsAutoPlay();
    else clearTimeout(dnsPlayTimer);
  }
  
  function dnsAutoPlay() {
    if (!dnsPlaying) return;
    const steps = dnsMode === 'recursive' ? DNS_RECURSIVE_STEPS : DNS_ITERATIVE_STEPS;
    if (dnsCurrentStep >= steps.length) {
      dnsPlaying = false;
      document.getElementById('dns-play-btn').textContent = '▶ Play';
      return;
    }
    dnsStep(1);
    dnsPlayTimer = setTimeout(dnsAutoPlay, dnsGetAutoDelay());
  }
  
  function dnsReset() {
    dnsPlaying = false;
    clearTimeout(dnsPlayTimer);
    if (dnsAnimId) { cancelAnimationFrame(dnsAnimId); clearTimeout(dnsAnimId); dnsAnimId = null; }
    const btn = document.getElementById('dns-play-btn');
    if (btn) btn.textContent = '▶ Play';
    dnsCurrentStep = 0;
    dnsActiveNodes = [];
    dnsCacheEntries = [];
    dnsDrawTopo(false);
    dnsUpdateUI();
    dnsRenderCache();
    updateDnsChain(0);
  }

  document.addEventListener("DOMContentLoaded", function () {
    dnsSetMode('recursive');
    dnsDrawTopo(false);
    dnsRenderCache();
  });