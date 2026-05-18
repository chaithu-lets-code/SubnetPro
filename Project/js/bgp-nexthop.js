'use strict';

// BGP NEXT_HOP Reachability Simulator
// Built for SubnetLab Pro

var BGP_NH_PRESETS = {
  'ibgp-broken': { learnedFrom: 'ebgp-edge', resolution: 'none', nextHopSelf: false },
  'ibgp-fixed': { learnedFrom: 'ebgp-edge', resolution: 'ospf', nextHopSelf: true },
  'rr-reachable': { learnedFrom: 'ibgp-rr', resolution: 'isis', nextHopSelf: false },
  'ebgp-direct': { learnedFrom: 'ebgp-edge', resolution: 'static', nextHopSelf: false }
};

var bgpNhState = {
  preset: 'ibgp-broken',
  learnedFrom: 'ebgp-edge',
  resolution: 'none',
  nextHopSelf: false
};

function bgpNhInit() {
  if (!document.getElementById('page-bgp-nexthop')) return;
  bgpNhLoadPreset(bgpNhState.preset || 'ibgp-broken');
}

function bgpNhLoadPreset(name) {
  var preset = BGP_NH_PRESETS[name] || BGP_NH_PRESETS['ibgp-broken'];
  bgpNhState.preset = BGP_NH_PRESETS[name] ? name : 'ibgp-broken';
  bgpNhState.learnedFrom = preset.learnedFrom;
  bgpNhState.resolution = preset.resolution;
  bgpNhState.nextHopSelf = preset.nextHopSelf;
  bgpNhApplyState();
  bgpNhRender();
}

function bgpNhSync() {
  var learnedFromEl = document.getElementById('bgpNhLearnedFrom');
  var resolutionEl = document.getElementById('bgpNhResolution');
  var nextHopSelfEl = document.getElementById('bgpNhSelf');
  if (!learnedFromEl || !resolutionEl || !nextHopSelfEl) return;

  bgpNhState.learnedFrom = learnedFromEl.value;
  bgpNhState.resolution = resolutionEl.value;
  bgpNhState.nextHopSelf = !!nextHopSelfEl.checked;
  bgpNhState.preset = 'custom';
  bgpNhRender();
}

function bgpNhApplyState() {
  var learnedFromEl = document.getElementById('bgpNhLearnedFrom');
  var resolutionEl = document.getElementById('bgpNhResolution');
  var nextHopSelfEl = document.getElementById('bgpNhSelf');
  if (learnedFromEl) learnedFromEl.value = bgpNhState.learnedFrom;
  if (resolutionEl) resolutionEl.value = bgpNhState.resolution;
  if (nextHopSelfEl) nextHopSelfEl.checked = !!bgpNhState.nextHopSelf;
}

function bgpNhCompute() {
  var route;
  if (bgpNhState.learnedFrom === 'ibgp-rr') {
    route = {
      source: 'Route reflector RR1 advertises an internal route to R2.',
      sender: 'RR1',
      receiver: 'R2',
      upstream: 'RR1',
      prefix: '10.44.0.0/16',
      originalNextHop: '10.255.0.9',
      selfNextHop: '10.255.0.1',
      asPath: '65000 i',
      learnMode: 'iBGP reflected route'
    };
  } else {
    route = {
      source: 'Edge router R1 learns an external prefix and advertises it inward.',
      sender: 'R1',
      receiver: 'R2',
      upstream: 'AS 65110',
      prefix: '203.0.113.0/24',
      originalNextHop: '198.51.100.1',
      selfNextHop: '10.0.0.1',
      asPath: '65110 64496',
      learnMode: 'eBGP learned route'
    };
  }

  var advertisedNextHop = bgpNhState.nextHopSelf ? route.selfNextHop : route.originalNextHop;
  var resolutionMap = {
    none: 'No route to the advertised next hop exists.',
    ospf: 'The receiving router resolves the next hop through OSPF.',
    isis: 'The receiving router resolves the next hop through IS-IS.',
    static: 'The receiving router resolves the next hop through a static / recursive route.'
  };
  var reachable = bgpNhState.resolution !== 'none';

  return {
    route: route,
    advertisedNextHop: advertisedNextHop,
    reachable: reachable,
    resolutionText: resolutionMap[bgpNhState.resolution] || resolutionMap.none,
    installState: reachable ? 'Valid and installable' : 'Hidden / inaccessible',
    installReason: reachable
      ? 'Recursive next-hop lookup succeeds, so the path can enter the Loc-RIB and then the forwarding table.'
      : 'BGP may retain the path in memory, but it cannot use it because recursive next-hop lookup fails in the main routing table.',
    advertisedBehavior: bgpNhState.nextHopSelf
      ? 'The advertising router rewrites NEXT_HOP before sending the route.'
      : 'The advertising router preserves the original NEXT_HOP attribute.'
  };
}

function bgpNhRender() {
  var outcomeEl = document.getElementById('bgpNhOutcome');
  var walkEl = document.getElementById('bgpNhWalk');
  var cliEl = document.getElementById('bgpNhCli');
  var topologyEl = document.getElementById('bgpNhTopology');
  if (!outcomeEl || !walkEl || !cliEl || !topologyEl) return;

  var view = bgpNhCompute();
  var toneBg = view.reachable ? 'rgba(74,222,128,0.10)' : 'rgba(248,113,113,0.10)';
  var toneCol = view.reachable ? '#4ade80' : '#f87171';

  outcomeEl.innerHTML =
    '<div><strong>Route source:</strong> ' + view.route.learnMode + '</div>' +
    '<div><strong>Prefix:</strong> ' + view.route.prefix + '</div>' +
    '<div><strong>Advertised NEXT_HOP:</strong> ' + view.advertisedNextHop + '</div>' +
    '<div><strong>Resolution:</strong> ' + view.resolutionText + '</div>' +
    '<div style="margin-top:10px;padding:10px 12px;border-radius:8px;border:1px solid ' + toneCol + ';background:' + toneBg + ';color:' + toneCol + ';font-weight:700;">' + view.installState + '</div>' +
    '<div style="margin-top:10px;">' + view.installReason + '</div>';

  walkEl.innerHTML =
    '<div>1. ' + view.route.source + '</div>' +
    '<div>2. ' + view.advertisedBehavior + '</div>' +
    '<div>3. ' + view.route.receiver + ' tries recursive lookup for NEXT_HOP ' + view.advertisedNextHop + '.</div>' +
    '<div>4. ' + (view.reachable
      ? 'Lookup succeeds, so the route is eligible for installation and forwarding.'
      : 'Lookup fails, so the path stays unusable even if its BGP attributes look good.') + '</div>';

  topologyEl.textContent =
    '[' + view.route.upstream + '] --(' + (bgpNhState.learnedFrom === 'ibgp-rr' ? 'iBGP' : 'eBGP') + ')-> [' + view.route.sender + '] --(iBGP)-> [' + view.route.receiver + ']\n' +
    '             prefix ' + view.route.prefix + '\n' +
    'original NEXT_HOP : ' + view.route.originalNextHop + '\n' +
    'advertised NH     : ' + view.advertisedNextHop + '\n' +
    'receiver lookup   : ' + (view.reachable ? bgpNhState.resolution.toUpperCase() : 'FAILED') + '\n' +
    'installation      : ' + (view.reachable ? 'usable path' : 'hidden path');

  cliEl.textContent =
    'R2# show ip bgp ' + view.route.prefix + '\n' +
    'BGP routing table entry for ' + view.route.prefix + '\n' +
    '  Paths: (1 available, best ' + (view.reachable ? '#1' : 'not installed') + ')\n' +
    '  ' + view.route.asPath + '\n' +
    '    ' + view.advertisedNextHop + ' from ' + view.route.sender + ' (' + view.route.sender + ')\n' +
    '      Origin IGP, localpref 100, valid ' + (view.reachable ? ', internal, best' : 'but inaccessible') + '\n\n' +
    'R2# show ip route ' + view.advertisedNextHop + '\n' +
    (view.reachable
      ? 'Routing entry for ' + view.advertisedNextHop + '/32\n  Known via "' + bgpNhState.resolution + '", next-hop resolved successfully'
      : '% Network not in table\n% Recursive next-hop lookup failed');
}
