'use strict';

// BGP Communities and Large Communities Lab
// Built for SubnetLab Pro

var BGP_COMM_PRESETS = {
  'no-export': { tag: 'no-export', peer: 'transit', policy: 'honor' },
  'lp-boost': { tag: 'lp-boost', peer: 'ibgp-core', policy: 'honor' },
  'blackhole': { tag: 'blackhole', peer: 'transit', policy: 'honor' },
  'large-geo': { tag: 'large-geo', peer: 'ixp-rs', policy: 'honor' }
};

var bgpCommState = {
  preset: 'no-export',
  tag: 'no-export',
  peer: 'transit',
  policy: 'honor'
};

function bgpCommInit() {
  if (!document.getElementById('page-bgp-communities')) return;
  bgpCommLoadPreset(bgpCommState.preset || 'no-export');
}

function bgpCommLoadPreset(name) {
  var preset = BGP_COMM_PRESETS[name] || BGP_COMM_PRESETS['no-export'];
  bgpCommState.preset = BGP_COMM_PRESETS[name] ? name : 'no-export';
  bgpCommState.tag = preset.tag;
  bgpCommState.peer = preset.peer;
  bgpCommState.policy = preset.policy;
  bgpCommApplyState();
  bgpCommRender();
}

function bgpCommSync() {
  var tagEl = document.getElementById('bgpCommTag');
  var peerEl = document.getElementById('bgpCommPeer');
  var policyEl = document.getElementById('bgpCommPolicy');
  if (!tagEl || !peerEl || !policyEl) return;

  bgpCommState.tag = tagEl.value;
  bgpCommState.peer = peerEl.value;
  bgpCommState.policy = policyEl.value;
  bgpCommState.preset = 'custom';
  bgpCommRender();
}

function bgpCommApplyState() {
  var tagEl = document.getElementById('bgpCommTag');
  var peerEl = document.getElementById('bgpCommPeer');
  var policyEl = document.getElementById('bgpCommPolicy');
  if (tagEl) tagEl.value = bgpCommState.tag;
  if (peerEl) peerEl.value = bgpCommState.peer;
  if (policyEl) policyEl.value = bgpCommState.policy;
}

function bgpCommCompute() {
  var tagMap = {
    'none': {
      label: 'No community',
      routeTag: 'none',
      meaning: 'The route carries no additional policy metadata.',
      action: 'Forward using normal best-path logic only.',
      config: 'route-map OUT permit 10\n ! no set community'
    },
    'no-export': {
      label: 'NO_EXPORT',
      routeTag: 'no-export',
      meaning: 'The route should not be advertised to eBGP peers outside the local AS.',
      action: 'Keep inside the AS or confederation boundary.',
      config: 'route-map OUT permit 10\n set community no-export additive'
    },
    'lp-boost': {
      label: '65000:120',
      routeTag: '65000:120',
      meaning: 'Internal policy tag matched by route-map to raise local preference.',
      action: 'Prefer this path as the primary exit inside the AS.',
      config: 'route-map IN permit 10\n match community LP-HIGH\n set local-preference 250'
    },
    'blackhole': {
      label: '65535:666',
      routeTag: '65535:666',
      meaning: 'Signal remote-triggered blackhole handling for a victim prefix.',
      action: 'Discard traffic to the tagged prefix at the edge under controlled policy.',
      config: 'route-map BH-IN permit 10\n match community BLACKHOLE\n set ip next-hop 192.0.2.66'
    },
    'large-geo': {
      label: '65000:100:10',
      routeTag: '65000:100:10',
      meaning: 'Large community encodes structured metadata such as region and intent.',
      action: 'Apply region-specific export or prepending policy at scale.',
      config: 'route-map EDGE-OUT permit 10\n match large-community GEO-EAST\n set community 65000:120 additive'
    },
    'large-backup': {
      label: '65000:200:50',
      routeTag: '65000:200:50',
      meaning: 'Large community marks the route as backup or lower-priority path.',
      action: 'Export with prepending or selective advertisement.',
      config: 'route-map EDGE-OUT permit 10\n match large-community BACKUP\n set as-path prepend 65000 65000 65000'
    }
  };
  var peerMap = {
    'transit': 'Transit ISP',
    'ixp-rs': 'IXP route server',
    'ibgp-core': 'iBGP core router'
  };
  var policyMap = {
    'honor': 'Honor community meaning',
    'ignore': 'Ignore tag',
    'strip': 'Strip communities on egress'
  };

  var tag = tagMap[bgpCommState.tag] || tagMap.none;
  var peer = peerMap[bgpCommState.peer] || peerMap.transit;
  var policy = policyMap[bgpCommState.policy] || policyMap.honor;
  var exported = true;
  var policyResult = 'No special handling is triggered.';
  var effectiveTag = tag.routeTag;
  var status = 'Tag carried but unused';
  var tone = '#fbbf24';
  var toneBg = 'rgba(251,191,36,0.10)';

  if (bgpCommState.policy === 'strip') {
    effectiveTag = 'stripped';
    status = 'Communities removed';
    tone = '#f87171';
    toneBg = 'rgba(248,113,113,0.10)';
    policyResult = 'The neighbor never sees the original tag, so no community-driven action can occur downstream.';
  } else if (bgpCommState.policy === 'ignore') {
    status = 'Tag ignored';
    tone = '#fbbf24';
    toneBg = 'rgba(251,191,36,0.10)';
    policyResult = 'The route is accepted, but the tag is not matched by any policy object.';
  } else if (bgpCommState.tag === 'no-export' && bgpCommState.peer !== 'ibgp-core') {
    exported = false;
    status = 'Export blocked';
    tone = '#4ade80';
    toneBg = 'rgba(74,222,128,0.10)';
    policyResult = 'NO_EXPORT stops advertisement to external neighbors, so the route stays inside the AS.';
  } else if (bgpCommState.tag === 'lp-boost' && bgpCommState.peer === 'ibgp-core') {
    status = 'Local preference raised';
    tone = '#4ade80';
    toneBg = 'rgba(74,222,128,0.10)';
    policyResult = 'The core router matches the community and increases local preference, making this path more attractive internally.';
  } else if (bgpCommState.tag === 'blackhole' && bgpCommState.peer === 'transit') {
    status = 'Blackhole action triggered';
    tone = '#f87171';
    toneBg = 'rgba(248,113,113,0.10)';
    policyResult = 'The edge policy matches the blackhole signal and discards traffic toward the prefix to contain an attack.';
  } else if ((bgpCommState.tag === 'large-geo' || bgpCommState.tag === 'large-backup') && bgpCommState.policy === 'honor') {
    status = 'Structured policy matched';
    tone = '#5b9cf6';
    toneBg = 'rgba(91,156,246,0.10)';
    policyResult = 'The large community carries structured metadata that scales better than overloading standard communities across many domains.';
  }

  return {
    tag: tag,
    peer: peer,
    policy: policy,
    effectiveTag: effectiveTag,
    exported: exported,
    status: status,
    tone: tone,
    toneBg: toneBg,
    policyResult: policyResult
  };
}

function bgpCommRender() {
  var walkEl = document.getElementById('bgpCommWalk');
  var outcomeEl = document.getElementById('bgpCommOutcome');
  var routeEl = document.getElementById('bgpCommRoute');
  var cliEl = document.getElementById('bgpCommCli');
  if (!walkEl || !outcomeEl || !routeEl || !cliEl) return;

  var view = bgpCommCompute();

  walkEl.innerHTML =
    '<div>1. Tag the route with <strong>' + view.tag.label + '</strong>.</div>' +
    '<div>2. Send it toward <strong>' + view.peer + '</strong>.</div>' +
    '<div>3. Neighbor policy mode is <strong>' + view.policy + '</strong>.</div>' +
    '<div>4. Result: ' + view.policyResult + '</div>';

  outcomeEl.innerHTML =
    '<div><strong>Community meaning:</strong> ' + view.tag.meaning + '</div>' +
    '<div><strong>Effective tag seen by peer:</strong> ' + view.effectiveTag + '</div>' +
    '<div><strong>Operational action:</strong> ' + view.tag.action + '</div>' +
    '<div style="margin-top:10px;padding:10px 12px;border-radius:8px;border:1px solid ' + view.tone + ';background:' + view.toneBg + ';color:' + view.tone + ';font-weight:700;">' + view.status + '</div>' +
    '<div style="margin-top:10px;">' + (view.exported ? 'Route remains eligible for advertisement based on policy.' : 'Route is intentionally contained and not exported further.') + '</div>';

  routeEl.textContent =
    'Prefix           : 198.51.100.0/24\n' +
    'Peer             : ' + view.peer + '\n' +
    'Community        : ' + view.tag.routeTag + '\n' +
    'Effective Tag    : ' + view.effectiveTag + '\n' +
    'Exported Further : ' + (view.exported ? 'yes' : 'no') + '\n' +
    'Policy Outcome   : ' + view.status;

  cliEl.textContent =
    'route-map COMMUNITY-DEMO permit 10\n' +
    ' set community ' + view.tag.routeTag + ' additive\n\n' +
    'show ip bgp 198.51.100.0/24\n' +
    '  Community: ' + view.tag.routeTag + '\n' +
    '  Large Community: ' + (view.tag.routeTag.indexOf(':') !== -1 && view.tag.routeTag.split(':').length === 3 ? view.tag.routeTag : 'not set') + '\n' +
    '  Policy mode: ' + view.policy + '\n\n' +
    view.tag.config;
}
