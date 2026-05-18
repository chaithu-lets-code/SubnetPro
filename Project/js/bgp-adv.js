// BGP Advanced Topics — bgp-adv.js (SubnetLab Pro)

(function() {
  'use strict';

  // BGP Route Selection Process
  // ... (existing code)

  // BGP Peering and Session Management
  var PEERS_STEPS = [
    {
      tag: 'BASICS①',
      col: '#4ade80',
      level: 'CCNA',
      side: 'ibgp',
      title: 'What is iBGP? — Internal BGP Definition',
      description: 'iBGP (Internal BGP) connects routers WITHIN the same Autonomous System (same AS number). It distributes BGP routes learned from outside (via eBGP) to all routers inside the AS. iBGP uses TCP port 179 — same as eBGP. Key rule: iBGP does NOT require direct physical connection between peers — they can be multiple hops away through IGP (OSPF/ISIS).'
    },
    {
      tag: 'BASICS②',
      col: '#4ade80',
      level: 'CCNA',
      side: 'ibgp',
      title: 'iBGP vs eBGP — The Golden Comparison',
      description: 'eBGP = Between DIFFERENT Autonomous Systems. iBGP = Within the SAME Autonomous System. eBGP Administrative Distance = 20 (highly trusted). iBGP Administrative Distance = 200 (least trusted). If same prefix learned from both, eBGP route always wins (lower AD). BGP uses triggered updates — 5s interval for iBGP, 30s interval for eBGP (slower to prevent internet route flaps).'
    },
    {
      tag: 'BASICS③',
      col: '#4ade80',
      level: 'CCNA',
      side: 'ibgp',
      title: 'TTL Behavior — iBGP=255 vs eBGP=1',
      description: 'eBGP sets TTL=1 — peer MUST be directly connected. iBGP sets TTL=255 — peer can be many hops away through IGP. This is why iBGP peers use loopback IPs — session survives physical link failure as long as IGP has another path. Fix for eBGP across multiple hops: "neighbor X ebgp-multihop 2" increases TTL. Command: "neighbor X update-source Loopback0".'
    },
    // ... (additional iBGP and eBGP steps)
  ];

  function drawBGPPeering(ctx, W, H) {
    var peersPhase = 0;
    var peersTimer = 0;
    var peersPhaseTimer = 0;
    var peersPackets = [];

    function updateBGPPeering() {
      var s = PEERS_STEPS[peersPhase];
      var levelCol = s.level === 'CCNA' ? '#4ade80' : s.level === 'CCNP' ? '#fbbf24' : '#a78bfa';
      var sideCol = s.side === 'ibgp' ? '#5b9cf6' : '#4ade80';
      var leftActive = s.side === 'ibgp';
      var rightActive = s.side === 'ebgp';
      var totalSteps = PEERS_STEPS.length;

      // Draw iBGP and eBGP zones
      // Draw routers, links, and annotations based on the current peersPhase

      peersPhaseTimer++;
      var phaseDur = Math.round(260 / BA.speed);
      if (!BA.paused && peersPhaseTimer > phaseDur) {
        peersPhaseTimer = 0;
        peersPackets = [];
        peersPhase = (peersPhase + 1) % PEERS_STEPS.length;
        var step = PEERS_STEPS[peersPhase];
        var levelBg = step.level === 'CCNA' ? 'rgba(74,222,128,0.12)' : step.level === 'CCNP' ? 'rgba(251,191,36,0.12)' : 'rgba(167,139,250,0.12)';
        bgpSetStep(peersPhase + 1, step.tag, levelBg, step.col, '[' + (peersPhase + 1) + '/' + PEERS_STEPS.length + '] [' + step.level + '] [' + (step.side === 'ibgp' ? 'iBGP' : 'eBGP') + '] ' + step.title, step.description);
      }

      // Draw packet animations based on the current peersPhase

      drawLabel(ctx, W / 2, 18, 'iBGP vs eBGP — Peering Modes Explained', '#5a6080', 10);
    }

    updateBGPPeering();
  }

  // Other advanced BGP topic sections would go here...

})();