'use strict';

var BGP_ANIM_TOPICS = [
  {
    id: 'fsm',
    icon: '🔄',
    title: 'BGP Finite State Machine',
    sub: 'Session Lifecycle',
    badge: 'FSM',
    bg: 'rgba(91,156,246,0.15)',
    col: '#5b9cf6',
    level: 'CCNA',
    focus: 'Session Control',
    why: 'A lot of BGP troubleshooting fails because engineers know commands but do not know which protocol state is blocking progress.',
    scenes: [
      {
        tag: 'IDLE',
        title: 'Session Starts in Idle',
        desc: 'No TCP session exists yet. BGP waits for a start event before attempting transport establishment.',
        takeaway: 'BGP cannot negotiate policy until transport exists. Idle means protocol work has not started yet.',
        cli: ['show ip bgp summary', 'show tcp brief | include 179'],
        trap: 'Do not assume Idle always means a remote problem. Local config, neighbor activation, or transport policy can keep the session here.',
        facts: ['Idle is a control state', 'TCP not up yet', 'No route exchange'],
        watch: ['Watch the protocol wait for a start event.', 'Separate protocol state from physical link state.', 'Notice that no BGP payload is exchanged yet.'],
        duration: 7,
        layout: {
          zones: [
            { x: 6, y: 15, w: 88, h: 70, label: 'Transport not yet established', color: '#5a6080', fill: 'rgba(90,96,128,0.07)' }
          ],
          nodes: [
            { id: 'r1', x: 25, y: 50, label: 'R1', sub: 'AS 65001', color: '#5b9cf6', glow: true },
            { id: 'r2', x: 75, y: 50, label: 'R2', sub: 'AS 65002', color: '#38d9c0', glow: true }
          ],
          links: [
            { from: 'r1', to: 'r2', color: '#5a6080', alpha: 0.22, dash: [7, 6], label: 'No TCP session yet' }
          ],
          callouts: [
            { x: 50, y: 28, text: 'Waiting for ManualStart / AutomaticStart', color: '#5a6080', bg: 'rgba(90,96,128,0.12)' }
          ]
        }
      },
      {
        tag: 'CONNECT',
        title: 'Connect and Active Are Transport Retry States',
        desc: 'BGP attempts TCP establishment. If the attempt fails, it moves to Active and retries again.',
        takeaway: 'Active is not “BGP is active and healthy.” It usually means BGP is retrying transport.',
        cli: ['show ip bgp neighbors x.x.x.x', 'show access-lists'],
        trap: 'Many engineers misread Active as progress. In reality it often points to TCP 179 reachability, TTL, ACL, or remote-AS issues.',
        facts: ['TCP port 179', 'Retries after failure', 'Often transport-driven'],
        watch: ['See the SYN attempt leave one router.', 'Watch the failed attempt trigger retry behavior.', 'Tie the protocol state back to transport reachability.'],
        duration: 8,
        layout: {
          zones: [
            { x: 6, y: 12, w: 88, h: 74, label: 'Transport negotiation', color: '#fbbf24', fill: 'rgba(251,191,36,0.05)' }
          ],
          nodes: [
            { id: 'r1', x: 23, y: 50, label: 'R1', sub: 'Connect', color: '#fbbf24', glow: true },
            { id: 'r2', x: 77, y: 50, label: 'R2', sub: 'Listening', color: '#38d9c0', glow: true }
          ],
          links: [
            { from: 'r1', to: 'r2', color: '#fbbf24', alpha: 0.55, label: 'TCP SYN attempt' }
          ],
          packets: [
            { path: ['r1', 'r2'], color: '#fbbf24', label: 'SYN', size: 10, offset: 0.0 },
            { path: ['r1', 'r2'], color: '#f87171', label: 'RST', size: 9, offset: 0.55 }
          ],
          callouts: [
            { x: 50, y: 26, text: 'Connect -> Active -> Retry', color: '#f87171', bg: 'rgba(248,113,113,0.12)' }
          ]
        }
      },
      {
        tag: 'OPEN',
        title: 'OPEN Exchange Builds the Session Identity',
        desc: 'Once TCP is up, the peers exchange OPEN messages containing ASN, hold timer, router ID, and capabilities.',
        takeaway: 'OPEN validates identity and capability. This is where ASN mismatch and capability mismatch often break the session.',
        cli: ['show ip bgp neighbors x.x.x.x | include hold|router ID', 'debug ip bgp events'],
        trap: 'If the remote ASN, hold timer expectations, or capabilities do not align, the session fails after transport is already established.',
        facts: ['ASN negotiated', 'Capabilities checked', 'Router IDs visible'],
        watch: ['See TCP succeed before BGP payload is accepted.', 'Watch OPEN move the session into protocol negotiation.', 'Notice that transport success does not guarantee BGP success.'],
        duration: 8,
        layout: {
          zones: [
            { x: 8, y: 14, w: 84, h: 72, label: 'Protocol negotiation over TCP', color: '#5b9cf6', fill: 'rgba(91,156,246,0.05)' }
          ],
          nodes: [
            { id: 'r1', x: 23, y: 50, label: 'R1', sub: 'OpenSent', color: '#5b9cf6', glow: true },
            { id: 'r2', x: 77, y: 50, label: 'R2', sub: 'OpenConfirm', color: '#a78bfa', glow: true }
          ],
          links: [
            { from: 'r1', to: 'r2', color: '#5b9cf6', alpha: 0.7, label: 'TCP established' }
          ],
          packets: [
            { path: ['r1', 'r2'], color: '#5b9cf6', label: 'OPEN', size: 11, offset: 0.0 },
            { path: ['r2', 'r1'], color: '#a78bfa', label: 'KA', size: 10, offset: 0.5 }
          ],
          cards: [
            { x: 18, y: 74, w: 22, h: 12, title: 'R1 OPEN', body: 'AS65001 | Hold 180 | ID 1.1.1.1', color: '#5b9cf6' },
            { x: 60, y: 74, w: 22, h: 12, title: 'R2 OPEN', body: 'AS65002 | Hold 180 | ID 2.2.2.2', color: '#a78bfa' }
          ]
        }
      },
      {
        tag: 'EST',
        title: 'Established Means Routes Can Finally Flow',
        desc: 'The peers exchange KEEPALIVEs successfully and move into Established. UPDATE messages can now carry reachable routes.',
        takeaway: 'Established is the handoff from session mechanics to actual routing behavior. Only here does policy start affecting traffic.',
        cli: ['show ip bgp summary', 'show ip bgp neighbors x.x.x.x advertised-routes'],
        trap: 'A session can be Established and still not exchange useful routes because of policy, next-hop issues, or filtering.',
        facts: ['KEEPALIVE confirmed', 'UPDATE allowed', 'Policy now matters'],
        watch: ['See the state complete after KEEPALIVE exchange.', 'Watch UPDATE enter only after Established.', 'Separate adjacency success from route-learning success.'],
        duration: 8,
        layout: {
          zones: [
            { x: 7, y: 12, w: 86, h: 74, label: 'Established BGP adjacency', color: '#4ade80', fill: 'rgba(74,222,128,0.05)' }
          ],
          nodes: [
            { id: 'r1', x: 25, y: 50, label: 'R1', sub: 'Established', color: '#4ade80', glow: true },
            { id: 'r2', x: 75, y: 50, label: 'R2', sub: 'Established', color: '#38d9c0', glow: true },
            { id: 'net1', x: 12, y: 28, label: '10.0.0.0/8', sub: 'Advertised', type: 'box', color: '#5b9cf6' },
            { id: 'net2', x: 88, y: 72, label: '172.16.0.0/12', sub: 'Advertised', type: 'box', color: '#38d9c0' }
          ],
          links: [
            { from: 'r1', to: 'r2', color: '#4ade80', alpha: 0.9, width: 2.5, label: 'Session up' }
          ],
          packets: [
            { path: ['net1', 'r1', 'r2'], color: '#5b9cf6', label: 'UPD', size: 10, offset: 0.0 },
            { path: ['r2', 'r1', 'net1'], color: '#38d9c0', label: 'KA', size: 8, offset: 0.45 },
            { path: ['net2', 'r2', 'r1'], color: '#38d9c0', label: 'UPD', size: 10, offset: 0.7 }
          ]
        }
      }
    ]
  },
  {
    id: 'msgs',
    icon: '📨',
    title: 'BGP Message Types',
    sub: 'OPEN, UPDATE, KEEPALIVE, NOTIFICATION',
    badge: 'MSG',
    bg: 'rgba(56,217,192,0.15)',
    col: '#38d9c0',
    level: 'CCNA',
    focus: 'Protocol Semantics',
    why: 'BGP message names are easy to memorize, but engineers need to understand what each one actually accomplishes.',
    scenes: [
      {
        tag: 'OPEN',
        title: 'OPEN Defines Identity and Capability',
        desc: 'The OPEN message brings BGP identity, ASN, timers, and capabilities into the session.',
        takeaway: 'OPEN is the protocol handshake, not the transport handshake.',
        cli: ['debug ip bgp events', 'show ip bgp neighbors x.x.x.x'],
        trap: 'If OPEN fails, TCP may still be up. That distinction matters when troubleshooting.',
        facts: ['ASN', 'Hold timer', 'Capabilities'],
        watch: ['See OPEN move after TCP success.', 'Read the fields as negotiated identity.', 'Notice that OPEN is directional and explicit.'],
        duration: 7,
        layout: {
          nodes: [
            { id: 'a', x: 20, y: 50, label: 'R-A', sub: 'AS 100', color: '#5b9cf6', glow: true },
            { id: 'b', x: 80, y: 50, label: 'R-B', sub: 'AS 200', color: '#38d9c0', glow: true }
          ],
          links: [{ from: 'a', to: 'b', color: '#5a6080', alpha: 0.45, label: 'TCP 179 already up' }],
          packets: [
            { path: ['a', 'b'], color: '#5b9cf6', label: 'OPEN', size: 12, offset: 0.05 },
            { path: ['b', 'a'], color: '#38d9c0', label: 'OPEN', size: 12, offset: 0.52 }
          ],
          cards: [
            { x: 10, y: 74, w: 26, h: 12, title: 'OPEN Fields', body: 'Version | ASN | Hold | Router-ID', color: '#5b9cf6' },
            { x: 64, y: 74, w: 26, h: 12, title: 'Capability Check', body: 'AFI/SAFI | 4-byte ASN | GR', color: '#38d9c0' }
          ]
        }
      },
      {
        tag: 'KA',
        title: 'KEEPALIVE Confirms Health',
        desc: 'KEEPALIVE confirms the negotiated session and prevents hold timer expiry.',
        takeaway: 'KEEPALIVE is liveness, not routing information.',
        cli: ['show ip bgp summary', 'show clock'],
        trap: 'A quiet BGP session is not a dead session. KEEPALIVEs may be the only traffic when no routes change.',
        facts: ['Small payload', 'Periodic', 'Hold timer driven'],
        watch: ['See small control packets preserve the session.', 'Tie the period to hold timer logic.', 'Notice that no prefixes ride inside KEEPALIVE.'],
        duration: 7,
        layout: {
          nodes: [
            { id: 'a', x: 20, y: 50, label: 'R-A', sub: 'Established', color: '#4ade80', glow: true },
            { id: 'b', x: 80, y: 50, label: 'R-B', sub: 'Established', color: '#38d9c0', glow: true }
          ],
          links: [{ from: 'a', to: 'b', color: '#4ade80', alpha: 0.65, width: 2.2, label: 'Session maintained' }],
          packets: [
            { path: ['a', 'b'], color: '#fbbf24', label: 'KA', size: 10, offset: 0.1 },
            { path: ['b', 'a'], color: '#fbbf24', label: 'KA', size: 10, offset: 0.58 }
          ],
          callouts: [
            { x: 50, y: 24, text: 'Hold timer expires if KA stops arriving', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' }
          ]
        }
      },
      {
        tag: 'UPDATE',
        title: 'UPDATE Carries Reachability and Withdrawals',
        desc: 'UPDATE is the real routing workhorse. It can advertise new routes or withdraw old ones.',
        takeaway: 'If you understand UPDATE fields, policy becomes interpretable rather than magical.',
        cli: ['show ip bgp', 'debug ip bgp updates'],
        trap: 'An UPDATE can remove routes too. It is not only an advertisement container.',
        facts: ['NLRI', 'Path attributes', 'Withdrawals'],
        watch: ['See NLRI move with path attributes.', 'Notice that next hop and AS path travel together.', 'Think in terms of advertisements and withdrawals.'],
        duration: 8,
        layout: {
          nodes: [
            { id: 'a', x: 18, y: 50, label: 'R-A', sub: 'Advertiser', color: '#5b9cf6', glow: true },
            { id: 'b', x: 82, y: 50, label: 'R-B', sub: 'Receiver', color: '#38d9c0', glow: true },
            { id: 'pfx', x: 18, y: 26, label: '10.0.0.0/8', sub: 'NLRI', type: 'box', color: '#4ade80' }
          ],
          links: [{ from: 'a', to: 'b', color: '#4ade80', alpha: 0.7, width: 2.2, label: 'UPDATE stream' }],
          packets: [{ path: ['pfx', 'a', 'b'], color: '#4ade80', label: 'UPD', size: 11, offset: 0.08 }],
          cards: [
            { x: 53, y: 30, w: 28, h: 18, title: 'Path Attributes', body: 'AS_PATH 65001\nNEXT_HOP 192.0.2.1\nLOCAL_PREF 100', color: '#4ade80' }
          ]
        }
      },
      {
        tag: 'NOTIF',
        title: 'NOTIFICATION Ends the Session with a Reason',
        desc: 'When BGP detects a serious error, it sends NOTIFICATION and tears the session down.',
        takeaway: 'NOTIFICATION is valuable because it tells you why the session died, not just that it died.',
        cli: ['show ip bgp neighbors x.x.x.x', 'debug ip bgp events'],
        trap: 'If you only observe “session down” and ignore the NOTIFICATION reason, you lose the fastest troubleshooting clue.',
        facts: ['Error code', 'Subcode', 'Session teardown'],
        watch: ['See NOTIFICATION explicitly tear the session down.', 'Map the error to the failure reason.', 'Use the reason to distinguish policy and capability faults.'],
        duration: 7,
        layout: {
          nodes: [
            { id: 'a', x: 20, y: 50, label: 'R-A', sub: 'Detects fault', color: '#f87171', glow: true },
            { id: 'b', x: 80, y: 50, label: 'R-B', sub: 'Session dropped', color: '#5a6080', glow: true }
          ],
          links: [{ from: 'a', to: 'b', color: '#f87171', alpha: 0.45, dash: [7, 6], label: 'Teardown in progress' }],
          packets: [{ path: ['a', 'b'], color: '#f87171', label: 'NOTIF', size: 12, offset: 0.12 }],
          callouts: [
            { x: 50, y: 26, text: 'Error Code 6: Cease / Hold timer / Capability issue', color: '#f87171', bg: 'rgba(248,113,113,0.12)' }
          ]
        }
      }
    ]
  },
  {
    id: 'peers',
    icon: '🔗',
    title: 'iBGP vs eBGP',
    sub: 'Peering Modes',
    badge: 'PEER',
    bg: 'rgba(74,222,128,0.15)',
    col: '#4ade80',
    level: 'CCNA',
    focus: 'Adjacency Design',
    why: 'A lot of BGP design quality comes down to understanding the difference between external boundaries and internal distribution.',
    scenes: [
      {
        tag: 'EBGP',
        title: 'eBGP Defines AS Boundaries',
        desc: 'Across an AS boundary, BGP behaves as external routing. Next hop changes and AS path grows.',
        takeaway: 'eBGP is where the internet-facing policy and AS path identity are formed.',
        cli: ['show ip bgp neighbors', 'show ip route x.x.x.x'],
        trap: 'Do not carry internal assumptions into eBGP. Boundary rules change next-hop handling and path identity.',
        facts: ['Different AS', 'AS_PATH prepended', 'Next hop changes'],
        watch: ['Observe the AS boundary line.', 'See the next hop rewrite at the edge.', 'Notice the path identity grow.'],
        duration: 8,
        layout: {
          zones: [
            { x: 6, y: 12, w: 38, h: 74, label: 'AS 65001', color: '#5b9cf6', fill: 'rgba(91,156,246,0.05)' },
            { x: 56, y: 12, w: 38, h: 74, label: 'AS 65100', color: '#4ade80', fill: 'rgba(74,222,128,0.05)' }
          ],
          nodes: [
            { id: 'a', x: 25, y: 50, label: 'R-A', sub: 'eBGP edge', color: '#5b9cf6', glow: true },
            { id: 'b', x: 75, y: 50, label: 'R-B', sub: 'eBGP edge', color: '#4ade80', glow: true }
          ],
          links: [{ from: 'a', to: 'b', color: '#4ade80', alpha: 0.82, width: 2.2, label: 'eBGP session across AS boundary' }],
          packets: [{ path: ['a', 'b'], color: '#4ade80', label: 'UPD', size: 11, offset: 0.18 }],
          cards: [
            { x: 34, y: 26, w: 18, h: 11, title: 'Advertised', body: 'AS_PATH 65001', color: '#5b9cf6' },
            { x: 59, y: 26, w: 18, h: 11, title: 'Received', body: 'NEXT_HOP = R-A', color: '#4ade80' }
          ]
        }
      },
      {
        tag: 'IBGP',
        title: 'iBGP Distributes Inside the Same AS',
        desc: 'Internal peers keep the same AS context and rely on the IGP for reachability.',
        takeaway: 'iBGP is about internal policy propagation, not redefining the AS boundary.',
        cli: ['show ip bgp summary', 'show ip ospf route'],
        trap: 'iBGP does not save you from reachability design. It depends on the IGP underlay.',
        facts: ['Same AS', 'IGP dependent', 'Internal policy propagation'],
        watch: ['Watch the same AS label across both routers.', 'See the internal loopback-style peering.', 'Keep the IGP dependency in mind.'],
        duration: 8,
        layout: {
          zones: [{ x: 8, y: 12, w: 84, h: 74, label: 'AS 65000', color: '#5b9cf6', fill: 'rgba(91,156,246,0.05)' }],
          nodes: [
            { id: 'core', x: 25, y: 50, label: 'R1', sub: 'Loopback peer', color: '#5b9cf6', glow: true },
            { id: 'rr', x: 75, y: 50, label: 'R2', sub: 'Loopback peer', color: '#38d9c0', glow: true },
            { id: 'igp', x: 50, y: 78, label: 'IGP', sub: 'Reachability fabric', type: 'box', color: '#fbbf24' }
          ],
          links: [
            { from: 'core', to: 'rr', color: '#5b9cf6', alpha: 0.75, width: 2.1, label: 'iBGP over loopbacks' },
            { from: 'core', to: 'igp', color: '#fbbf24', alpha: 0.45 },
            { from: 'rr', to: 'igp', color: '#fbbf24', alpha: 0.45 }
          ],
          packets: [{ path: ['core', 'rr'], color: '#5b9cf6', label: 'UPD', size: 10, offset: 0.2 }]
        }
      },
      {
        tag: 'NH',
        title: 'iBGP Next Hop Can Stay External',
        desc: 'An edge router can pass an external next hop inward unchanged, which means internal routers must resolve it recursively.',
        takeaway: 'This is the heart of the next-hop-self problem. Policy is irrelevant if reachability fails.',
        cli: ['show ip bgp x.x.x.x', 'show ip route 198.51.100.1'],
        trap: 'The route may exist in BGP memory but still be unusable because recursive next-hop lookup fails.',
        facts: ['Next hop unchanged', 'Recursive lookup', 'Black-hole risk'],
        watch: ['See the external next hop carried inward.', 'Notice the internal router still needs RIB reachability.', 'Connect this directly to next-hop-self design.'],
        duration: 8,
        layout: {
          nodes: [
            { id: 'isp', x: 10, y: 24, label: 'ISP', sub: '198.51.100.1', type: 'box', color: '#38d9c0' },
            { id: 'edge', x: 34, y: 50, label: 'Edge', sub: 'eBGP + iBGP', color: '#5b9cf6', glow: true },
            { id: 'core', x: 72, y: 50, label: 'Core', sub: 'Needs recursion', color: '#fbbf24', glow: true }
          ],
          links: [
            { from: 'isp', to: 'edge', color: '#38d9c0', alpha: 0.8, label: 'External next hop' },
            { from: 'edge', to: 'core', color: '#5b9cf6', alpha: 0.75, label: 'iBGP advertises same NH' }
          ],
          packets: [{ path: ['isp', 'edge', 'core'], color: '#38d9c0', label: 'NH', size: 11, offset: 0.1 }],
          callouts: [
            { x: 72, y: 24, text: 'Can Core reach 198.51.100.1?', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' }
          ]
        }
      },
      {
        tag: 'SPLIT',
        title: 'iBGP Split Horizon Forces Scale Design Choices',
        desc: 'Routes learned from one iBGP peer are not re-advertised to another iBGP peer unless route reflection or confederation design is used.',
        takeaway: 'iBGP scale is an architecture problem, not just a command problem.',
        cli: ['show ip bgp neighbors x.x.x.x advertised-routes', 'show ip bgp summary'],
        trap: 'If you forget split horizon, routes appear to vanish randomly when the real issue is the peering design.',
        facts: ['No iBGP re-advertisement', 'Full mesh pressure', 'Route reflector needed'],
        watch: ['See one internal speaker receive a route.', 'Watch the route stop instead of forwarding again.', 'Connect the failure to route reflector design.'],
        duration: 8,
        layout: {
          nodes: [
            { id: 'r1', x: 20, y: 45, label: 'R1', sub: 'Sender', color: '#5b9cf6', glow: true },
            { id: 'r2', x: 50, y: 45, label: 'R2', sub: 'Learns via iBGP', color: '#38d9c0', glow: true },
            { id: 'r3', x: 80, y: 45, label: 'R3', sub: 'No route yet', color: '#f87171', glow: true },
            { id: 'rr', x: 50, y: 76, label: 'RR', sub: 'Scale fix', type: 'box', color: '#a78bfa' }
          ],
          links: [
            { from: 'r1', to: 'r2', color: '#5b9cf6', alpha: 0.8, label: 'iBGP route' },
            { from: 'r2', to: 'r3', color: '#f87171', alpha: 0.28, dash: [7, 6], label: 'Blocked by split horizon' },
            { from: 'r1', to: 'rr', color: '#a78bfa', alpha: 0.3 },
            { from: 'rr', to: 'r3', color: '#a78bfa', alpha: 0.58, label: 'Reflector solves scale' }
          ],
          packets: [
            { path: ['r1', 'r2'], color: '#5b9cf6', label: 'UPD', size: 10, offset: 0.1 },
            { path: ['rr', 'r3'], color: '#a78bfa', label: 'RFL', size: 10, offset: 0.55 }
          ]
        }
      }
    ]
  },
  {
    id: 'bestpath',
    icon: '🏆',
    title: 'Best Path Selection',
    sub: 'Attribute Elimination',
    badge: 'ALGO',
    bg: 'rgba(251,191,36,0.15)',
    col: '#fbbf24',
    level: 'CCNP',
    focus: 'Decision Engine',
    why: 'Real traffic engineering depends on knowing exactly which attribute is winning and which ones are no longer relevant.',
    scenes: [
      {
        tag: 'INPUT',
        title: 'Three Paths Enter the Decision Process',
        desc: 'BGP does not guess. It compares explicit attributes and eliminates losing candidates one step at a time.',
        takeaway: 'Think elimination process, not vague route preference.',
        cli: ['show ip bgp 10.0.0.0/8', 'show ip bgp bestpath'],
        trap: 'Lower-order attributes do not matter if a higher-order attribute has already decided the winner.',
        facts: ['A/B/C candidates', 'Ordered comparison', 'One winner only'],
        watch: ['Compare the paths side by side.', 'Treat every attribute as a filter stage.', 'Expect losers to disappear early.'],
        duration: 7,
        layout: {
          nodes: [
            { id: 'a', x: 18, y: 30, label: 'Path A', sub: 'LP 200 | ASPATH 1', type: 'box', color: '#4ade80' },
            { id: 'b', x: 18, y: 52, label: 'Path B', sub: 'LP 100 | ASPATH 2', type: 'box', color: '#f87171' },
            { id: 'c', x: 18, y: 74, label: 'Path C', sub: 'LP 200 | ASPATH 3', type: 'box', color: '#a78bfa' },
            { id: 'rib', x: 82, y: 52, label: 'Loc-RIB', sub: 'One best path', type: 'box', color: '#38d9c0' }
          ],
          links: [
            { from: 'a', to: 'rib', color: '#4ade80', alpha: 0.65 },
            { from: 'b', to: 'rib', color: '#f87171', alpha: 0.65 },
            { from: 'c', to: 'rib', color: '#a78bfa', alpha: 0.65 }
          ],
          callouts: [{ x: 49, y: 16, text: 'Input stage: all candidates still alive', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' }]
        }
      },
      {
        tag: 'LP',
        title: 'Local Preference Eliminates Lower Exit Value',
        desc: 'The path with lower local preference is removed before later attributes are even considered.',
        takeaway: 'Local preference is a high-leverage internal traffic-engineering tool.',
        cli: ['show ip bgp', 'route-map SET-LP in'],
        trap: 'If LP already decided the winner set, MED and AS path might never get a chance to matter.',
        facts: ['Higher LP wins', 'Internal attribute', 'Outbound steering'],
        watch: ['See Path B fade first.', 'Observe the winner pool shrink to A and C.', 'Connect LP to outbound exit policy.'],
        duration: 7,
        layout: {
          nodes: [
            { id: 'a', x: 18, y: 30, label: 'Path A', sub: 'LP 200', type: 'box', color: '#4ade80' },
            { id: 'b', x: 18, y: 52, label: 'Path B', sub: 'LP 100', type: 'box', color: '#f87171' },
            { id: 'c', x: 18, y: 74, label: 'Path C', sub: 'LP 200', type: 'box', color: '#a78bfa' },
            { id: 'rib', x: 82, y: 52, label: 'Remaining', sub: 'A + C only', type: 'box', color: '#38d9c0' }
          ],
          links: [
            { from: 'a', to: 'rib', color: '#4ade80', alpha: 0.78, width: 2.2 },
            { from: 'b', to: 'rib', color: '#f87171', alpha: 0.18, dash: [7, 6], label: 'Eliminated' },
            { from: 'c', to: 'rib', color: '#a78bfa', alpha: 0.78, width: 2.2 }
          ],
          callouts: [{ x: 49, y: 16, text: 'Local Preference removes Path B immediately', color: '#4ade80', bg: 'rgba(74,222,128,0.12)' }]
        }
      },
      {
        tag: 'ASPATH',
        title: 'AS Path Breaks the Tie',
        desc: 'Once LP ties, AS path length becomes the decisive attribute in this scenario.',
        takeaway: 'Attributes only matter when all higher-order checks are equal.',
        cli: ['show ip bgp regexp _65001$', 'show ip bgp'],
        trap: 'Operators often over-focus on MED when AS path or LP already settled the race.',
        facts: ['Tie-break stage', 'Shortest path wins', 'Path C loses'],
        watch: ['See A and C compete only after LP tie.', 'Notice the shorter path win cleanly.', 'Connect this to prepending strategy.'],
        duration: 7,
        layout: {
          nodes: [
            { id: 'a', x: 18, y: 34, label: 'Path A', sub: 'AS_PATH length 1', type: 'box', color: '#4ade80' },
            { id: 'c', x: 18, y: 70, label: 'Path C', sub: 'AS_PATH length 3', type: 'box', color: '#a78bfa' },
            { id: 'rib', x: 82, y: 52, label: 'Winner pool', sub: 'A only', type: 'box', color: '#4ade80' }
          ],
          links: [
            { from: 'a', to: 'rib', color: '#4ade80', alpha: 0.9, width: 2.4, label: 'Shortest path wins' },
            { from: 'c', to: 'rib', color: '#a78bfa', alpha: 0.18, dash: [7, 6], label: 'Longer path loses' }
          ]
        }
      },
      {
        tag: 'WIN',
        title: 'One Path Enters the Loc-RIB',
        desc: 'The winning path becomes installable, and only then can forwarding follow the chosen control-plane result.',
        takeaway: 'The decision process is meaningful only when the winner can be installed and forwarded.',
        cli: ['show ip bgp 10.0.0.0/8 bestpath', 'show ip route 10.0.0.0'],
        trap: 'Best path does not help if next-hop recursion or policy later prevents actual installation.',
        facts: ['One winner', 'Loc-RIB installs', 'FIB follows'],
        watch: ['Watch all losing options disappear.', 'See the best path become the installed route.', 'Connect control-plane choice to forwarding effect.'],
        duration: 8,
        layout: {
          nodes: [
            { id: 'best', x: 24, y: 52, label: 'Path A', sub: 'Best path selected', type: 'box', color: '#4ade80' },
            { id: 'loc', x: 58, y: 52, label: 'Loc-RIB', sub: 'Installed', type: 'box', color: '#38d9c0' },
            { id: 'fwd', x: 84, y: 52, label: 'FIB', sub: 'Forwarding ready', type: 'box', color: '#5b9cf6' }
          ],
          links: [
            { from: 'best', to: 'loc', color: '#4ade80', alpha: 0.92, width: 2.3, label: 'Decision winner' },
            { from: 'loc', to: 'fwd', color: '#38d9c0', alpha: 0.8, width: 2.1, label: 'Install to forwarding' }
          ],
          packets: [{ path: ['best', 'loc', 'fwd'], color: '#4ade80', label: 'WIN', size: 10, offset: 0.18 }]
        }
      }
    ]
  },
  {
    id: 'rr',
    icon: '⭐',
    title: 'Route Reflector',
    sub: 'Scale vs Visibility',
    badge: 'RR',
    bg: 'rgba(244,114,182,0.15)',
    col: '#f472b6',
    level: 'CCNP',
    focus: 'Scale Design',
    why: 'Route reflectors solve full-mesh explosion, but they also reshape who sees which path and when.',
    scenes: [
      {
        tag: 'MESH',
        title: 'Full Mesh Explodes Session Count',
        desc: 'As the AS grows, every iBGP node needs adjacency to every other node in a full mesh.',
        takeaway: 'This is why route reflectors are not optional in larger environments.',
        cli: ['show ip bgp summary'],
        trap: 'Teams often underestimate the operational cost of full-mesh iBGP until session count becomes painful.',
        facts: ['n(n-1)/2', 'Session explosion', 'Poor scalability'],
        watch: ['Count the links, not just the routers.', 'Notice the dense adjacency fabric.', 'Connect topology size to control-plane cost.'],
        duration: 7,
        layout: {
          nodes: [
            { id: 'n1', x: 25, y: 28, label: 'R1', sub: 'Mesh', color: '#f472b6', glow: true },
            { id: 'n2', x: 48, y: 20, label: 'R2', sub: 'Mesh', color: '#f472b6', glow: true },
            { id: 'n3', x: 72, y: 28, label: 'R3', sub: 'Mesh', color: '#f472b6', glow: true },
            { id: 'n4', x: 34, y: 68, label: 'R4', sub: 'Mesh', color: '#f472b6', glow: true },
            { id: 'n5', x: 64, y: 68, label: 'R5', sub: 'Mesh', color: '#f472b6', glow: true }
          ],
          links: [
            { from: 'n1', to: 'n2', color: '#f472b6', alpha: 0.42 }, { from: 'n1', to: 'n3', color: '#f472b6', alpha: 0.42 },
            { from: 'n1', to: 'n4', color: '#f472b6', alpha: 0.42 }, { from: 'n1', to: 'n5', color: '#f472b6', alpha: 0.42 },
            { from: 'n2', to: 'n3', color: '#f472b6', alpha: 0.42 }, { from: 'n2', to: 'n4', color: '#f472b6', alpha: 0.42 },
            { from: 'n2', to: 'n5', color: '#f472b6', alpha: 0.42 }, { from: 'n3', to: 'n4', color: '#f472b6', alpha: 0.42 },
            { from: 'n3', to: 'n5', color: '#f472b6', alpha: 0.42 }, { from: 'n4', to: 'n5', color: '#f472b6', alpha: 0.42 }
          ],
          callouts: [{ x: 50, y: 84, text: '5 routers -> 10 sessions', color: '#f472b6', bg: 'rgba(244,114,182,0.12)' }]
        }
      },
      {
        tag: 'RR',
        title: 'Clients Send to the Reflector',
        desc: 'Clients peer with the route reflector instead of building a full mesh to every node.',
        takeaway: 'The route reflector centralizes distribution so scale becomes manageable.',
        cli: ['show ip bgp summary', 'show ip bgp neighbors x.x.x.x routes'],
        trap: 'If the RR is placed poorly, visibility and path quality may suffer even though scale improves.',
        facts: ['Clients', 'Central reflector', 'Fewer sessions'],
        watch: ['See clients point only at the RR.', 'Notice the session count drop immediately.', 'Think about RR placement as an architecture decision.'],
        duration: 7,
        layout: {
          nodes: [
            { id: 'rr', x: 50, y: 46, label: 'RR', sub: 'Cluster 100', color: '#4ade80', glow: true },
            { id: 'c1', x: 20, y: 22, label: 'R1', sub: 'Client', color: '#5b9cf6', glow: true },
            { id: 'c2', x: 80, y: 22, label: 'R2', sub: 'Client', color: '#5b9cf6', glow: true },
            { id: 'c3', x: 22, y: 72, label: 'R3', sub: 'Client', color: '#5b9cf6', glow: true },
            { id: 'c4', x: 78, y: 72, label: 'R4', sub: 'Client', color: '#5b9cf6', glow: true }
          ],
          links: [
            { from: 'c1', to: 'rr', color: '#4ade80', alpha: 0.7 }, { from: 'c2', to: 'rr', color: '#4ade80', alpha: 0.7 },
            { from: 'c3', to: 'rr', color: '#4ade80', alpha: 0.7 }, { from: 'c4', to: 'rr', color: '#4ade80', alpha: 0.7 }
          ],
          callouts: [{ x: 50, y: 84, text: '5 routers -> 4 sessions', color: '#4ade80', bg: 'rgba(74,222,128,0.12)' }]
        }
      },
      {
        tag: 'REFLECT',
        title: 'Reflection Replaces Re-advertisement',
        desc: 'A client sends one route to the RR, and the RR reflects it out to the rest of the cluster.',
        takeaway: 'Reflection changes propagation rules intentionally so scale can work.',
        cli: ['show ip bgp neighbors x.x.x.x advertised-routes'],
        trap: 'Reflection is not identical to full-mesh visibility. Path diversity can look different through an RR.',
        facts: ['Reflector forwards', 'Clients receive', 'Policy still matters'],
        watch: ['Watch one client originate a route.', 'See the reflector replicate it to others.', 'Notice how the reflector becomes a distribution hub.'],
        duration: 8,
        layout: {
          nodes: [
            { id: 'rr', x: 50, y: 46, label: 'RR', sub: 'Reflecting', color: '#4ade80', glow: true },
            { id: 'c1', x: 20, y: 22, label: 'R1', sub: 'Originates route', color: '#5b9cf6', glow: true },
            { id: 'c2', x: 80, y: 22, label: 'R2', sub: 'Learns route', color: '#fbbf24', glow: true },
            { id: 'c3', x: 22, y: 72, label: 'R3', sub: 'Learns route', color: '#fbbf24', glow: true },
            { id: 'c4', x: 78, y: 72, label: 'R4', sub: 'Learns route', color: '#fbbf24', glow: true }
          ],
          links: [
            { from: 'c1', to: 'rr', color: '#5b9cf6', alpha: 0.8, width: 2.2, label: 'Client route' },
            { from: 'rr', to: 'c2', color: '#4ade80', alpha: 0.76 },
            { from: 'rr', to: 'c3', color: '#4ade80', alpha: 0.76 },
            { from: 'rr', to: 'c4', color: '#4ade80', alpha: 0.76 }
          ],
          packets: [
            { path: ['c1', 'rr'], color: '#5b9cf6', label: 'UPD', size: 10, offset: 0.08 },
            { path: ['rr', 'c2'], color: '#4ade80', label: 'RFL', size: 10, offset: 0.45 },
            { path: ['rr', 'c3'], color: '#4ade80', label: 'RFL', size: 10, offset: 0.58 },
            { path: ['rr', 'c4'], color: '#4ade80', label: 'RFL', size: 10, offset: 0.71 }
          ]
        }
      },
      {
        tag: 'SAFE',
        title: 'ORIGINATOR_ID and CLUSTER_LIST Prevent Loops',
        desc: 'Because reflection breaks strict split horizon, new loop-prevention markers are added.',
        takeaway: 'Every scale shortcut needs compensating control-plane safety.',
        cli: ['show ip bgp', 'show ip bgp vpnv4 all'],
        trap: 'If you treat RR as “just fewer sessions,” you miss the loop-prevention fields that make it safe.',
        facts: ['ORIGINATOR_ID', 'CLUSTER_LIST', 'Loop prevention'],
        watch: ['See the metadata trail around reflected routes.', 'Notice why the route cannot bounce forever.', 'Tie scale design back to protocol safety.'],
        duration: 8,
        layout: {
          nodes: [
            { id: 'rr1', x: 35, y: 50, label: 'RR-1', sub: 'Cluster 100', color: '#4ade80', glow: true },
            { id: 'rr2', x: 65, y: 50, label: 'RR-2', sub: 'Cluster 100', color: '#a78bfa', glow: true },
            { id: 'route', x: 50, y: 24, label: 'Route', sub: 'ORIGINATOR_ID 1.1.1.1', type: 'box', color: '#5b9cf6' }
          ],
          links: [
            { from: 'rr1', to: 'rr2', color: '#fbbf24', alpha: 0.62, label: 'CLUSTER_LIST carries history' }
          ],
          packets: [{ path: ['route', 'rr1', 'rr2'], color: '#fbbf24', label: 'CLUSTER', size: 10, offset: 0.18 }],
          cards: [{ x: 37, y: 72, w: 26, h: 12, title: 'Loop Check', body: 'Discard if my cluster already seen', color: '#f87171' }]
        }
      },
      {
        tag: 'VIS',
        title: 'Best Exit Can Look Different Through a Reflector',
        desc: 'Clients do not always see the same path diversity they would have seen in a full mesh. The reflector can bias what becomes visible first.',
        takeaway: 'Route reflection solves scale, but it can also shape best-path visibility and create suboptimal forwarding patterns.',
        cli: ['show ip bgp 203.0.113.0/24', 'show ip bgp neighbors x.x.x.x routes'],
        trap: 'If you assume RR visibility equals full-mesh visibility, you can miss why one client chose a farther exit.',
        facts: ['Visibility asymmetry', 'Best-exit drift', 'Client path bias'],
        watch: ['See two exits exist at the edge.', 'Notice the client only receives the reflected winner.', 'Connect control-plane visibility to suboptimal forwarding.'],
        duration: 9,
        layout: {
          zones: [
            { x: 6, y: 12, w: 88, h: 74, label: 'Route reflector can hide alternate exits', color: '#f472b6', fill: 'rgba(244,114,182,0.05)' }
          ],
          nodes: [
            { id: 'exitA', x: 18, y: 28, label: 'Exit-A', sub: 'Closer egress', color: '#4ade80', glow: true },
            { id: 'exitB', x: 18, y: 72, label: 'Exit-B', sub: 'Farther egress', color: '#fbbf24', glow: true },
            { id: 'rr', x: 50, y: 50, label: 'RR', sub: 'Reflects one best path', color: '#f472b6', glow: true },
            { id: 'client', x: 82, y: 50, label: 'Client', sub: 'Learns reflected winner', color: '#5b9cf6', glow: true }
          ],
          links: [
            { from: 'exitA', to: 'rr', color: '#4ade80', alpha: 0.62, label: 'Path A available' },
            { from: 'exitB', to: 'rr', color: '#fbbf24', alpha: 0.62, label: 'Path B available' },
            { from: 'rr', to: 'client', color: '#f472b6', alpha: 0.84, width: 2.3, label: 'Only reflected winner visible' }
          ],
          packets: [
            { path: ['exitA', 'rr'], color: '#4ade80', label: 'A', size: 9, offset: 0.08 },
            { path: ['exitB', 'rr'], color: '#fbbf24', label: 'B', size: 9, offset: 0.22 },
            { path: ['rr', 'client'], color: '#f472b6', label: 'BEST', size: 11, offset: 0.5 }
          ],
          cards: [
            { x: 62, y: 24, w: 26, h: 14, title: 'Operational Effect', body: 'Client may prefer a reflected path even when another exit would be physically better.', color: '#f472b6' }
          ]
        }
      },
      {
        tag: 'HA',
        title: 'Dual Route Reflectors Improve Survivability, Not Perfection',
        desc: 'Two reflectors reduce single points of failure, but cluster design and consistency still determine how graceful the client experience feels.',
        takeaway: 'Redundancy in RR design protects reachability, but bad placement or inconsistent policy can still create churn and asymmetry.',
        cli: ['show ip bgp summary', 'show ip bgp neighbors | include cluster'],
        trap: 'Adding a second RR is not a magic fix. If the two reflectors learn or reflect differently, clients can still see unstable choices.',
        facts: ['Dual RR', 'Control-plane resilience', 'Policy consistency matters'],
        watch: ['See clients attach to two reflectors.', 'Watch one reflector fail while service continues.', 'Notice why consistency matters across both RRs.'],
        duration: 9,
        layout: {
          nodes: [
            { id: 'rr1', x: 35, y: 30, label: 'RR-1', sub: 'Primary reflector', color: '#4ade80', glow: true },
            { id: 'rr2', x: 65, y: 30, label: 'RR-2', sub: 'Backup reflector', color: '#a78bfa', glow: true },
            { id: 'c1', x: 24, y: 74, label: 'Client-1', sub: 'Dual peering', color: '#5b9cf6', glow: true },
            { id: 'c2', x: 50, y: 74, label: 'Client-2', sub: 'Dual peering', color: '#5b9cf6', glow: true },
            { id: 'c3', x: 76, y: 74, label: 'Client-3', sub: 'Dual peering', color: '#5b9cf6', glow: true }
          ],
          links: [
            { from: 'c1', to: 'rr1', color: '#4ade80', alpha: 0.74 },
            { from: 'c1', to: 'rr2', color: '#a78bfa', alpha: 0.56 },
            { from: 'c2', to: 'rr1', color: '#4ade80', alpha: 0.74 },
            { from: 'c2', to: 'rr2', color: '#a78bfa', alpha: 0.56 },
            { from: 'c3', to: 'rr1', color: '#f87171', alpha: 0.16, dash: [7, 6], label: 'RR-1 failure domain' },
            { from: 'c3', to: 'rr2', color: '#a78bfa', alpha: 0.76, width: 2.2, label: 'Surviving reflector' }
          ],
          packets: [
            { path: ['rr2', 'c1'], color: '#a78bfa', label: 'RFL', size: 10, offset: 0.1 },
            { path: ['rr2', 'c2'], color: '#a78bfa', label: 'RFL', size: 10, offset: 0.35 },
            { path: ['rr2', 'c3'], color: '#a78bfa', label: 'RFL', size: 10, offset: 0.62 }
          ],
          callouts: [
            { x: 35, y: 14, text: 'RR-1 degraded', color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
            { x: 66, y: 14, text: 'RR-2 continues service', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' }
          ]
        }
      }
    ]
  },
  {
    id: 'community',
    icon: '🏷',
    title: 'Communities',
    sub: 'Policy Signaling',
    badge: 'COMM',
    bg: 'rgba(167,139,250,0.15)',
    col: '#a78bfa',
    level: 'CCNP',
    focus: 'Policy Metadata',
    why: 'Communities let you express routing intent at scale without rewriting separate policies for every prefix everywhere.',
    scenes: [
      {
        tag: 'TAG',
        title: 'Communities Carry Intent',
        desc: 'Routes can carry standard or custom tags that downstream policy understands and acts on.',
        takeaway: 'Communities are metadata. They are powerful because policies agree on their meaning.',
        cli: ['show ip bgp community', 'show ip bgp'],
        trap: 'A community alone changes nothing until a route-map or policy process matches it.',
        facts: ['Standard communities', 'Custom policy tags', 'Metadata not forwarding'],
        watch: ['See the tag ride with the prefix.', 'Notice the route stays the same while intent changes.', 'Think like a policy designer, not just a route viewer.'],
        duration: 7,
        layout: {
          nodes: [
            { id: 'edge', x: 25, y: 50, label: 'Edge', sub: 'Sets community', color: '#5b9cf6', glow: true },
            { id: 'core', x: 75, y: 50, label: 'Core', sub: 'Matches policy', color: '#a78bfa', glow: true },
            { id: 'tag', x: 25, y: 24, label: '65000:120', sub: 'Policy tag', type: 'box', color: '#a78bfa' }
          ],
          links: [{ from: 'edge', to: 'core', color: '#a78bfa', alpha: 0.76, width: 2.2, label: 'Community travels with route' }],
          packets: [{ path: ['tag', 'edge', 'core'], color: '#a78bfa', label: 'TAG', size: 10, offset: 0.12 }]
        }
      },
      {
        tag: 'NOEXP',
        title: 'NO_EXPORT Contains Reachability',
        desc: 'A route marked NO_EXPORT should not leave the AS boundary toward external peers.',
        takeaway: 'NO_EXPORT is a containment tool. It limits blast radius without killing internal usability.',
        cli: ['show ip bgp community no-export'],
        trap: 'Do not confuse NO_EXPORT with dropping the route locally. It still exists; it just stays inside the policy boundary.',
        facts: ['Containment', 'AS boundary control', 'Internal use preserved'],
        watch: ['See the route stay inside the AS.', 'Observe the boundary suppress export.', 'Use it mentally as a containment tag.'],
        duration: 7,
        layout: {
          zones: [
            { x: 6, y: 12, w: 46, h: 74, label: 'AS 65000', color: '#5b9cf6', fill: 'rgba(91,156,246,0.05)' },
            { x: 58, y: 12, w: 34, h: 74, label: 'External AS', color: '#f87171', fill: 'rgba(248,113,113,0.04)' }
          ],
          nodes: [
            { id: 'core', x: 28, y: 50, label: 'Core', sub: 'NO_EXPORT set', color: '#a78bfa', glow: true },
            { id: 'edge', x: 48, y: 50, label: 'Edge', sub: 'Suppresses export', color: '#4ade80', glow: true },
            { id: 'peer', x: 76, y: 50, label: 'Peer', sub: 'Never sees route', color: '#f87171', glow: true }
          ],
          links: [
            { from: 'core', to: 'edge', color: '#a78bfa', alpha: 0.8 },
            { from: 'edge', to: 'peer', color: '#f87171', alpha: 0.18, dash: [7, 6], label: 'NO_EXPORT blocks here' }
          ],
          callouts: [{ x: 36, y: 24, text: 'Community: no-export', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' }]
        }
      },
      {
        tag: 'LARGE',
        title: 'Large Communities Scale Better',
        desc: 'Large communities add structure so region, intent, and action can be encoded without overloading a small tag space.',
        takeaway: 'At scale, structured metadata beats ad hoc tagging.',
        cli: ['show ip bgp large-community'],
        trap: 'Do not treat large communities as a cosmetic upgrade. They solve real policy-scaling problems.',
        facts: ['AS:Function:Value', 'Structured intent', 'Scale-friendly'],
        watch: ['See the tag carry structured meaning.', 'Think in terms of reusable policy taxonomies.', 'Notice the difference from one-dimensional tagging.'],
        duration: 7,
        layout: {
          nodes: [
            { id: 'edge', x: 24, y: 50, label: 'Edge', sub: 'Applies metadata', color: '#5b9cf6', glow: true },
            { id: 'ix', x: 50, y: 50, label: 'IX / RR', sub: 'Transports tag', color: '#38d9c0', glow: true },
            { id: 'core', x: 78, y: 50, label: 'Core', sub: 'Matches region policy', color: '#4ade80', glow: true },
            { id: 'tag', x: 50, y: 24, label: '65000:100:10', sub: 'Region East / prefer', type: 'box', color: '#a78bfa' }
          ],
          links: [
            { from: 'edge', to: 'ix', color: '#a78bfa', alpha: 0.75 },
            { from: 'ix', to: 'core', color: '#a78bfa', alpha: 0.75 }
          ],
          packets: [{ path: ['tag', 'edge', 'ix', 'core'], color: '#a78bfa', label: 'L-COMM', size: 10, offset: 0.14 }]
        }
      },
      {
        tag: 'BH',
        title: 'Blackhole Communities Trade Reachability for Safety',
        desc: 'A blackhole tag intentionally discards traffic toward a prefix to contain an attack and protect the rest of the network.',
        takeaway: 'Blackholing is operational sacrifice for stability. You lose one target to save the rest of the system.',
        cli: ['show ip bgp community 65535:666', 'show route-map BLACKHOLE'],
        trap: 'Blackholing is not “good routing.” It is controlled damage containment under policy.',
        facts: ['DDoS containment', 'Edge discard', 'Policy-driven loss'],
        watch: ['See the blackhole signal recognized at the edge.', 'Notice that the route still exists but traffic is intentionally killed.', 'Connect this to operational tradeoffs, not just theory.'],
        duration: 7,
        layout: {
          nodes: [
            { id: 'upstream', x: 16, y: 50, label: 'Transit', sub: 'Traffic source', color: '#38d9c0', glow: true },
            { id: 'edge', x: 45, y: 50, label: 'Edge', sub: 'Matches BH policy', color: '#f87171', glow: true },
            { id: 'victim', x: 80, y: 32, label: 'Victim /32', sub: 'Target prefix', type: 'box', color: '#fbbf24' },
            { id: 'null', x: 80, y: 68, label: 'Null0', sub: 'Discard', type: 'box', color: '#f87171' }
          ],
          links: [
            { from: 'upstream', to: 'edge', color: '#38d9c0', alpha: 0.7 },
            { from: 'edge', to: 'victim', color: '#fbbf24', alpha: 0.15, dash: [7, 6] },
            { from: 'edge', to: 'null', color: '#f87171', alpha: 0.82, width: 2.2, label: 'Community triggers discard' }
          ],
          packets: [{ path: ['upstream', 'edge', 'null'], color: '#f87171', label: 'BH', size: 11, offset: 0.15 }]
        }
      }
    ]
  },
  {
    id: 'aggregate',
    icon: '🗜',
    title: 'Aggregation',
    sub: 'Summarization and Suppression',
    badge: 'AGG',
    bg: 'rgba(56,217,192,0.15)',
    col: '#38d9c0',
    level: 'CCNP',
    focus: 'Table Hygiene',
    why: 'Aggregation reduces table size and failure blast radius, but it also hides detail and changes path visibility.',
    scenes: [
      {
        tag: 'SPEC',
        title: 'Specific Routes Arrive First',
        desc: 'Before summarization, the router sees multiple more-specific entries.',
        takeaway: 'Aggregation begins with detail. You cannot summarize what you never learned.',
        cli: ['show ip bgp | include 10.1.'],
        trap: 'A summary is not a separate truth. It is a deliberate abstraction over real specifics.',
        facts: ['/24 inputs', 'Detailed visibility', 'Raw route set'],
        watch: ['See all specifics independently.', 'Notice the table footprint.', 'Connect detail to convergence cost.'],
        duration: 7,
        layout: {
          nodes: [
            { id: 'p1', x: 18, y: 28, label: '10.1.0.0/24', sub: 'Specific', type: 'box', color: '#5b9cf6' },
            { id: 'p2', x: 18, y: 48, label: '10.1.1.0/24', sub: 'Specific', type: 'box', color: '#38d9c0' },
            { id: 'p3', x: 18, y: 68, label: '10.1.2.0/24', sub: 'Specific', type: 'box', color: '#4ade80' },
            { id: 'agg', x: 74, y: 50, label: 'AGG-R', sub: 'Sees all specifics', color: '#a78bfa', glow: true }
          ],
          links: [
            { from: 'p1', to: 'agg', color: '#5b9cf6', alpha: 0.65 },
            { from: 'p2', to: 'agg', color: '#38d9c0', alpha: 0.65 },
            { from: 'p3', to: 'agg', color: '#4ade80', alpha: 0.65 }
          ]
        }
      },
      {
        tag: 'SUM',
        title: 'Aggregate Address Creates a Summary',
        desc: 'The aggregating router creates a broader prefix that represents the specific components.',
        takeaway: 'Summaries reduce route count and external visibility of internal detail.',
        cli: ['aggregate-address 10.1.0.0 255.255.252.0 summary-only'],
        trap: 'A summary can improve scale while hiding important path distinctions. That tradeoff must be intentional.',
        facts: ['aggregate-address', 'Route count reduction', 'Broader prefix'],
        watch: ['See specifics converge into one summary.', 'Notice the route count shrink.', 'Think about the visibility tradeoff.'],
        duration: 7,
        layout: {
          nodes: [
            { id: 'agg', x: 40, y: 50, label: 'AGG-R', sub: 'Summarizes routes', color: '#a78bfa', glow: true },
            { id: 'sum', x: 74, y: 50, label: '10.1.0.0/22', sub: 'Aggregate', type: 'box', color: '#4ade80' }
          ],
          links: [{ from: 'agg', to: 'sum', color: '#4ade80', alpha: 0.82, width: 2.3, label: 'Summary advertised' }],
          packets: [{ path: ['agg', 'sum'], color: '#4ade80', label: 'AGG', size: 11, offset: 0.2 }]
        }
      },
      {
        tag: 'ASSET',
        title: 'AS_SET Preserves Origin Clues',
        desc: 'When multiple AS origins are summarized, AS_SET can preserve unordered origin hints.',
        takeaway: 'Aggregation simplifies the table, but AS_SET protects some loop-prevention context from being lost entirely.',
        cli: ['show ip bgp 10.1.0.0/22'],
        trap: 'If you aggregate blindly, you may hide path origin detail that was operationally important.',
        facts: ['AS_SET', 'Origin preservation', 'Loop awareness'],
        watch: ['See the aggregate carry origin hints.', 'Notice that order is gone but lineage remains.', 'Connect summarization back to safety.'],
        duration: 7,
        layout: {
          nodes: [
            { id: 'sum', x: 36, y: 50, label: '10.1.0.0/22', sub: 'Aggregate route', type: 'box', color: '#4ade80' },
            { id: 'set', x: 70, y: 50, label: '{65001,65002,65003}', sub: 'AS_SET', type: 'box', color: '#fbbf24' }
          ],
          links: [{ from: 'sum', to: 'set', color: '#fbbf24', alpha: 0.8, width: 2.2, label: 'Origin hints retained' }]
        }
      },
      {
        tag: 'SUPPRESS',
        title: 'Summary-Only Suppresses the Specifics',
        desc: 'The summary can be advertised while the underlying more-specific routes are intentionally hidden.',
        takeaway: 'Suppression is a design choice. It changes what downstream peers can see and prefer.',
        cli: ['show ip bgp neighbors x.x.x.x advertised-routes'],
        trap: 'Suppression can simplify the table but also remove path granularity that downstream peers might need.',
        facts: ['summary-only', 'Specifics hidden', 'Cleaner export'],
        watch: ['See specifics stop at the exporter.', 'Notice only the summary continues.', 'Think about downstream path visibility.'],
        duration: 8,
        layout: {
          nodes: [
            { id: 'p1', x: 18, y: 30, label: '10.1.0.0/24', sub: 'Suppressed', type: 'box', color: '#5b9cf6' },
            { id: 'p2', x: 18, y: 52, label: '10.1.1.0/24', sub: 'Suppressed', type: 'box', color: '#38d9c0' },
            { id: 'sum', x: 48, y: 52, label: '10.1.0.0/22', sub: 'Advertised', type: 'box', color: '#4ade80' },
            { id: 'peer', x: 82, y: 52, label: 'Downstream Peer', sub: 'Sees only summary', color: '#a78bfa', glow: true }
          ],
          links: [
            { from: 'p1', to: 'peer', color: '#5b9cf6', alpha: 0.14, dash: [7, 6] },
            { from: 'p2', to: 'peer', color: '#38d9c0', alpha: 0.14, dash: [7, 6] },
            { from: 'sum', to: 'peer', color: '#4ade80', alpha: 0.84, width: 2.2, label: 'Only exported route' }
          ],
          callouts: [{ x: 27, y: 78, text: 'Specifics suppressed', color: '#f87171', bg: 'rgba(248,113,113,0.12)' }]
        }
      }
    ]
  },
  {
    id: 'multihome',
    icon: '🌐',
    title: 'Multihoming',
    sub: 'Traffic Engineering',
    badge: 'MHOME',
    bg: 'rgba(251,191,36,0.15)',
    col: '#fbbf24',
    level: 'CCIE',
    focus: 'Traffic Engineering',
    why: 'Multihoming is where BGP policy turns directly into cost, resilience, and user traffic movement.',
    scenes: [
      {
        tag: 'OUT',
        title: 'Outbound Traffic Uses Local Preference',
        desc: 'Inside your AS, local preference decides which exit is preferred for outbound traffic.',
        takeaway: 'Outbound steering is mostly your decision because LP is under your control.',
        cli: ['show ip bgp', 'show route-map OUTBOUND-LP'],
        trap: 'Do not try to solve outbound problems with inbound-facing tools like prepending.',
        facts: ['Local preference', 'Internal control', 'Preferred exit'],
        watch: ['See one border router gain the higher LP.', 'Observe internal traffic choose that exit.', 'Treat LP as the primary outbound lever.'],
        duration: 8,
        layout: {
          nodes: [
            { id: 'int', x: 20, y: 52, label: 'Internal', sub: 'Traffic source', color: '#38d9c0', glow: true },
            { id: 'a', x: 54, y: 30, label: 'ISP-A', sub: 'LP 200', color: '#4ade80', glow: true },
            { id: 'b', x: 54, y: 74, label: 'ISP-B', sub: 'LP 100', color: '#f87171', glow: true },
            { id: 'net', x: 84, y: 52, label: 'Internet', sub: 'Destination', type: 'box', color: '#5b9cf6' }
          ],
          links: [
            { from: 'int', to: 'a', color: '#4ade80', alpha: 0.84, width: 2.3, label: 'Preferred exit' },
            { from: 'int', to: 'b', color: '#f87171', alpha: 0.24, dash: [7, 6], label: 'Backup exit' },
            { from: 'a', to: 'net', color: '#4ade80', alpha: 0.82 },
            { from: 'b', to: 'net', color: '#f87171', alpha: 0.28 }
          ],
          packets: [{ path: ['int', 'a', 'net'], color: '#4ade80', label: 'OUT', size: 10, offset: 0.14 }]
        }
      },
      {
        tag: 'IN',
        title: 'Inbound Traffic Is Only Influenced, Not Controlled',
        desc: 'AS-path prepending makes one path look longer so the internet may prefer another entry point.',
        takeaway: 'Inbound traffic engineering is persuasion, not command. Remote networks still make the final choice.',
        cli: ['show ip bgp', 'show ip bgp regexp _65000_'],
        trap: 'Prepending does not guarantee inbound results. It only changes one decision signal visible to remote ASes.',
        facts: ['AS-path prepending', 'External decision', 'Indirect influence'],
        watch: ['See one inbound path lengthen.', 'Notice the remote side prefer the shorter path.', 'Treat this as influence, not enforcement.'],
        duration: 8,
        layout: {
          nodes: [
            { id: 'net', x: 14, y: 52, label: 'Internet', sub: 'Remote ASes', type: 'box', color: '#38d9c0' },
            { id: 'a', x: 52, y: 30, label: 'ISP-A', sub: 'AS_PATH len 2', color: '#4ade80', glow: true },
            { id: 'b', x: 52, y: 74, label: 'ISP-B', sub: 'AS_PATH len 4', color: '#fbbf24', glow: true },
            { id: 'as', x: 84, y: 52, label: 'Your AS', sub: 'Target prefix', type: 'box', color: '#5b9cf6' }
          ],
          links: [
            { from: 'net', to: 'a', color: '#4ade80', alpha: 0.84, width: 2.3, label: 'Shorter path preferred' },
            { from: 'net', to: 'b', color: '#fbbf24', alpha: 0.25, dash: [7, 6], label: 'Prepended path' },
            { from: 'a', to: 'as', color: '#4ade80', alpha: 0.82 },
            { from: 'b', to: 'as', color: '#fbbf24', alpha: 0.35 }
          ],
          packets: [{ path: ['net', 'a', 'as'], color: '#4ade80', label: 'IN', size: 10, offset: 0.18 }]
        }
      },
      {
        tag: 'MED',
        title: 'MED Matters Mostly with the Same Neighboring AS',
        desc: 'MED suggests which entry point is preferred when multiple links exist to the same neighboring AS.',
        takeaway: 'MED is more surgical than prepending, but it is also more constrained in where it matters.',
        cli: ['show ip bgp', 'bgp always-compare-med'],
        trap: 'MED is often overestimated. It is not a universal inbound TE knob across unrelated upstreams.',
        facts: ['Lower MED wins', 'Same neighboring AS', 'Inbound suggestion'],
        watch: ['See two links into the same AS compete.', 'Observe lower MED become preferred.', 'Keep the same-neighbor condition in mind.'],
        duration: 7,
        layout: {
          zones: [{ x: 56, y: 12, w: 36, h: 74, label: 'Same neighboring AS 65100', color: '#a78bfa', fill: 'rgba(167,139,250,0.05)' }],
          nodes: [
            { id: 'as', x: 20, y: 52, label: 'Your AS', sub: 'Two exits', type: 'box', color: '#5b9cf6' },
            { id: 'l1', x: 58, y: 32, label: 'Link-1', sub: 'MED 20', color: '#4ade80', glow: true },
            { id: 'l2', x: 58, y: 72, label: 'Link-2', sub: 'MED 100', color: '#f87171', glow: true },
            { id: 'peer', x: 84, y: 52, label: 'Neighbor AS', sub: 'Compares MED', color: '#a78bfa', glow: true }
          ],
          links: [
            { from: 'as', to: 'l1', color: '#4ade80', alpha: 0.8 },
            { from: 'as', to: 'l2', color: '#f87171', alpha: 0.4 },
            { from: 'l1', to: 'peer', color: '#4ade80', alpha: 0.82, width: 2.2, label: 'Preferred lower MED' },
            { from: 'l2', to: 'peer', color: '#f87171', alpha: 0.25, dash: [7, 6] }
          ]
        }
      },
      {
        tag: 'FAIL',
        title: 'Failover Moves Traffic to the Surviving Exit',
        desc: 'When the primary exit disappears, BGP falls back to the surviving policy-valid path.',
        takeaway: 'The best backup design is the one whose failure behavior is already obvious before the outage happens.',
        cli: ['show ip bgp summary', 'show ip route'],
        trap: 'A secondary link is not a backup if policy accidentally keeps traffic pinned to a dead or unreachable path.',
        facts: ['Primary down', 'Backup path active', 'Convergence matters'],
        watch: ['See the preferred path disappear.', 'Watch the backup become active.', 'Connect policy intent to resilience.'],
        duration: 8,
        layout: {
          nodes: [
            { id: 'int', x: 20, y: 52, label: 'Internal', sub: 'Traffic source', color: '#38d9c0', glow: true },
            { id: 'a', x: 52, y: 30, label: 'ISP-A', sub: 'Down', color: '#f87171', glow: true },
            { id: 'b', x: 52, y: 74, label: 'ISP-B', sub: 'Backup active', color: '#4ade80', glow: true },
            { id: 'net', x: 84, y: 52, label: 'Internet', sub: 'Still reachable', type: 'box', color: '#5b9cf6' }
          ],
          links: [
            { from: 'int', to: 'a', color: '#f87171', alpha: 0.16, dash: [7, 6], label: 'Primary failed' },
            { from: 'int', to: 'b', color: '#4ade80', alpha: 0.86, width: 2.2, label: 'Backup takes over' },
            { from: 'b', to: 'net', color: '#4ade80', alpha: 0.82 }
          ],
          packets: [{ path: ['int', 'b', 'net'], color: '#4ade80', label: 'FAILOVER', size: 10, offset: 0.2 }]
        }
      },
      {
        tag: 'COMM',
        title: 'Provider Communities Can Shape Inbound Traffic Faster Than Prepending',
        desc: 'Instead of only lengthening AS paths, you can ask an upstream to lower local preference or change export behavior through provider-specific communities.',
        takeaway: 'Communities are often a cleaner inbound engineering tool because they influence upstream policy directly rather than merely hoping path length wins.',
        cli: ['show ip bgp community', 'show route-map ISP-A-INBOUND'],
        trap: 'If you only know prepending, you miss one of the most practical multihoming tools used in real transit relationships.',
        facts: ['Provider communities', 'Upstream LP control', 'Cleaner inbound TE'],
        watch: ['See the community attach before export.', 'Notice the upstream change its preference logic.', 'Compare that to the weaker signal of prepending.'],
        duration: 9,
        layout: {
          nodes: [
            { id: 'as', x: 18, y: 50, label: 'Your AS', sub: 'Sets provider community', type: 'box', color: '#5b9cf6' },
            { id: 'ispA', x: 48, y: 30, label: 'ISP-A', sub: 'Community lowers LP', color: '#4ade80', glow: true },
            { id: 'ispB', x: 48, y: 74, label: 'ISP-B', sub: 'Normal preference', color: '#fbbf24', glow: true },
            { id: 'remote', x: 84, y: 50, label: 'Remote ASes', sub: 'Choose best inbound path', type: 'box', color: '#38d9c0' },
            { id: 'tag', x: 30, y: 18, label: '65010:80', sub: 'Lower LP upstream', type: 'box', color: '#a78bfa' }
          ],
          links: [
            { from: 'as', to: 'ispA', color: '#a78bfa', alpha: 0.82, width: 2.1, label: 'Community-driven policy' },
            { from: 'as', to: 'ispB', color: '#fbbf24', alpha: 0.62 },
            { from: 'remote', to: 'ispA', color: '#f87171', alpha: 0.22, dash: [7, 6], label: 'Less preferred inbound' },
            { from: 'remote', to: 'ispB', color: '#4ade80', alpha: 0.84, width: 2.3, label: 'Preferred inbound' }
          ],
          packets: [
            { path: ['tag', 'as', 'ispA'], color: '#a78bfa', label: 'COMM', size: 10, offset: 0.1 },
            { path: ['remote', 'ispB', 'as'], color: '#4ade80', label: 'IN', size: 10, offset: 0.54 }
          ],
          cards: [
            { x: 60, y: 18, w: 24, h: 14, title: 'Why It Wins', body: 'Upstream policy changes beat hoping remote ASes care enough about prepends.', color: '#4ade80' }
          ]
        }
      },
      {
        tag: 'HOT',
        title: 'Hot-Potato vs Cold-Potato Changes Cost and Performance',
        desc: 'Some designs dump traffic out as fast as possible, while others keep it inside longer to reach a preferred exit with better economics or performance.',
        takeaway: 'Multihoming is not only about resilience. It is also an economic and latency strategy.',
        cli: ['show ip bgp', 'show ip route 203.0.113.0'],
        trap: 'If you only think in terms of “shortest path,” you miss why some networks intentionally carry traffic farther internally before exiting.',
        facts: ['Hot potato', 'Cold potato', 'Latency vs cost tradeoff'],
        watch: ['See the near exit available immediately.', 'Notice the network intentionally carry traffic farther to a better exit.', 'Relate TE policy to business outcomes, not just protocol trivia.'],
        duration: 9,
        layout: {
          zones: [
            { x: 8, y: 12, w: 42, h: 74, label: 'Internal backbone', color: '#5b9cf6', fill: 'rgba(91,156,246,0.05)' },
            { x: 56, y: 12, w: 34, h: 74, label: 'External exits', color: '#fbbf24', fill: 'rgba(251,191,36,0.05)' }
          ],
          nodes: [
            { id: 'src', x: 16, y: 50, label: 'User Edge', sub: 'Traffic source', color: '#38d9c0', glow: true },
            { id: 'core', x: 38, y: 50, label: 'Core', sub: 'Internal carry', color: '#5b9cf6', glow: true },
            { id: 'near', x: 66, y: 28, label: 'Exit-Near', sub: 'Hot potato', color: '#f87171', glow: true },
            { id: 'far', x: 66, y: 72, label: 'Exit-Far', sub: 'Cold potato target', color: '#4ade80', glow: true },
            { id: 'dst', x: 88, y: 50, label: 'Destination', sub: 'Remote service', type: 'box', color: '#a78bfa' }
          ],
          links: [
            { from: 'src', to: 'near', color: '#f87171', alpha: 0.24, dash: [7, 6], label: 'Fastest off-ramp' },
            { from: 'src', to: 'core', color: '#5b9cf6', alpha: 0.82, width: 2.2, label: 'Carry traffic internally' },
            { from: 'core', to: 'far', color: '#4ade80', alpha: 0.84, width: 2.3, label: 'Preferred economic exit' },
            { from: 'near', to: 'dst', color: '#f87171', alpha: 0.34 },
            { from: 'far', to: 'dst', color: '#4ade80', alpha: 0.84 }
          ],
          packets: [
            { path: ['src', 'near', 'dst'], color: '#f87171', label: 'HOT', size: 9, offset: 0.12 },
            { path: ['src', 'core', 'far', 'dst'], color: '#4ade80', label: 'COLD', size: 10, offset: 0.52 }
          ],
          callouts: [
            { x: 38, y: 22, text: 'Keep traffic longer when cost or quality justifies it', color: '#4ade80', bg: 'rgba(74,222,128,0.12)' }
          ]
        }
      }
    ]
  },
  {
    id: 'policy-eng',
    icon: '🎛',
    title: 'Internet Policy Engineering',
    sub: 'Transit, IX, and Community Strategy',
    badge: 'POLICY',
    bg: 'rgba(244,114,182,0.16)',
    col: '#f472b6',
    level: 'CCIE',
    focus: 'Business-Aware Routing',
    why: 'At scale, BGP is business policy encoded in routing attributes. Cost, SLAs, and peering contracts shape the decision model.',
    scenes: [
      {
        tag: 'ROLE',
        title: 'Policy Starts with Neighbor Role',
        desc: 'Classify each neighbor as transit, IX, customer, or private peer before setting attributes.',
        takeaway: 'A clean role model prevents random route-map logic and keeps policy explainable.',
        cli: ['show ip bgp neighbors', 'show route-map ROLE-BASE'],
        trap: 'If all peers share one policy, you lose business intent and risk route leaks.',
        facts: ['Transit policy', 'IX policy', 'Role-first design'],
        watch: ['See each neighbor category mapped explicitly.', 'Notice local-pref differs by role.', 'Treat role taxonomy as policy baseline.'],
        duration: 8,
        layout: {
          nodes: [
            { id: 'as', x: 24, y: 50, label: 'Your AS', sub: 'Policy core', color: '#5b9cf6', glow: true },
            { id: 'transit', x: 58, y: 20, label: 'Transit', sub: 'Paid backup', color: '#f87171', glow: true },
            { id: 'ix', x: 58, y: 50, label: 'IX Peers', sub: 'Low-cost regional', color: '#4ade80', glow: true },
            { id: 'pni', x: 58, y: 80, label: 'PNI', sub: 'High-volume private', color: '#38d9c0', glow: true },
            { id: 'lp', x: 84, y: 50, label: 'Local-Pref Matrix', sub: 'Role-driven', type: 'box', color: '#f472b6' }
          ],
          links: [
            { from: 'as', to: 'transit', color: '#f87171', alpha: 0.48, label: 'LP 90' },
            { from: 'as', to: 'ix', color: '#4ade80', alpha: 0.74, label: 'LP 120' },
            { from: 'as', to: 'pni', color: '#38d9c0', alpha: 0.82, label: 'LP 140' },
            { from: 'as', to: 'lp', color: '#f472b6', alpha: 0.64 }
          ],
          packets: [
            { path: ['as', 'pni', 'lp'], color: '#38d9c0', label: 'PREF', size: 10, offset: 0.18 },
            { path: ['as', 'ix', 'lp'], color: '#4ade80', label: 'PREF', size: 10, offset: 0.46 }
          ]
        }
      },
      {
        tag: 'COMM',
        title: 'Provider Communities Outperform Blind Prepending',
        desc: 'Use provider-defined communities to influence upstream local-pref and export scope directly.',
        takeaway: 'Communities are precision controls; prepending is a coarse hint.',
        cli: ['show ip bgp community', 'show route-map OUTBOUND-COMM'],
        trap: 'Overusing prepends without community policy makes inbound behavior inconsistent across regions.',
        facts: ['Provider knobs', 'Regional steering', 'Upstream LP influence'],
        watch: ['See a community attach at export.', 'Notice upstream policy changes immediately.', 'Compare deterministic signal vs heuristic prepends.'],
        duration: 8,
        layout: {
          nodes: [
            { id: 'as', x: 18, y: 52, label: 'Your AS', sub: 'Set community', color: '#5b9cf6', glow: true },
            { id: 'isp', x: 48, y: 34, label: 'Transit ISP', sub: 'Reads tag', color: '#fbbf24', glow: true },
            { id: 'remote1', x: 80, y: 28, label: 'Region A', sub: 'Lower pref', type: 'box', color: '#f87171' },
            { id: 'remote2', x: 80, y: 72, label: 'Region B', sub: 'Normal pref', type: 'box', color: '#4ade80' },
            { id: 'tag', x: 34, y: 18, label: '65010:120', sub: 'No-export-eu', type: 'box', color: '#a78bfa' }
          ],
          links: [
            { from: 'as', to: 'isp', color: '#a78bfa', alpha: 0.82, label: 'Tagged route' },
            { from: 'isp', to: 'remote1', color: '#f87171', alpha: 0.34, dash: [7, 6], label: 'Suppressed region' },
            { from: 'isp', to: 'remote2', color: '#4ade80', alpha: 0.84, label: 'Preferred region' }
          ],
          packets: [
            { path: ['tag', 'as', 'isp'], color: '#a78bfa', label: 'COMM', size: 10, offset: 0.08 },
            { path: ['isp', 'remote2'], color: '#4ade80', label: 'ADV', size: 9, offset: 0.52 }
          ]
        }
      },
      {
        tag: 'MED',
        title: 'MED and Deterministic-MED Need Guardrails',
        desc: 'MED can be useful inside one neighboring AS, but comparison behavior can become unpredictable without deterministic ordering.',
        takeaway: 'When MED is in play, deterministic processing and clear peering boundaries prevent policy drift.',
        cli: ['show ip bgp', 'show running-config | include deterministic-med'],
        trap: 'Comparing MED across unrelated ASes creates brittle decisions.',
        facts: ['Same-neighbor scope', 'Deterministic MED', 'Ordering effects'],
        watch: ['See multiple exits from one upstream.', 'Notice stable winner after deterministic ordering.', 'Avoid cross-AS MED assumptions.'],
        duration: 8,
        layout: {
          zones: [{ x: 54, y: 10, w: 38, h: 78, label: 'Upstream AS 65100', color: '#a78bfa', fill: 'rgba(167,139,250,0.05)' }],
          nodes: [
            { id: 'as', x: 20, y: 52, label: 'Your AS', sub: 'Compares MED', type: 'box', color: '#5b9cf6' },
            { id: 'u1', x: 60, y: 30, label: 'Exit-1', sub: 'MED 30', color: '#4ade80', glow: true },
            { id: 'u2', x: 60, y: 74, label: 'Exit-2', sub: 'MED 70', color: '#f87171', glow: true },
            { id: 'ctl', x: 84, y: 52, label: 'Deterministic MED', sub: 'Stable ordering', type: 'box', color: '#f472b6' }
          ],
          links: [
            { from: 'as', to: 'u1', color: '#4ade80', alpha: 0.84, label: 'Preferred lower MED' },
            { from: 'as', to: 'u2', color: '#f87171', alpha: 0.32, dash: [7, 6] },
            { from: 'as', to: 'ctl', color: '#f472b6', alpha: 0.66 }
          ],
          callouts: [
            { x: 33, y: 20, text: 'Compare MED only where policy intends', color: '#f472b6', bg: 'rgba(244,114,182,0.12)' }
          ]
        }
      },
      {
        tag: 'TE',
        title: 'Policy Engineering Balances Cost, Latency, and Risk',
        desc: 'Final production policy is usually a compromise between transport cost, user performance, and resilience constraints.',
        takeaway: 'Great BGP policy is a multi-objective design, not one-attribute tuning.',
        cli: ['show ip bgp', 'show policy-map control-plane'],
        trap: 'Optimizing only for shortest path can increase spend or reduce resilience.',
        facts: ['Cost vs performance', 'Resilience tradeoffs', 'Policy matrix'],
        watch: ['See parallel objectives pull in different directions.', 'Observe weighted policy choice.', 'Treat routing as an SRE plus finance decision.'],
        duration: 9,
        layout: {
          nodes: [
            { id: 'cost', x: 20, y: 26, label: 'Cost', sub: 'Transit spend', type: 'box', color: '#fbbf24' },
            { id: 'lat', x: 20, y: 52, label: 'Latency', sub: 'User QoE', type: 'box', color: '#38d9c0' },
            { id: 'res', x: 20, y: 78, label: 'Resilience', sub: 'Failure margin', type: 'box', color: '#f87171' },
            { id: 'engine', x: 55, y: 52, label: 'Policy Engine', sub: 'Weighted decisions', color: '#f472b6', glow: true },
            { id: 'out', x: 84, y: 52, label: 'Exported Best Policy', sub: 'Production behavior', type: 'box', color: '#4ade80' }
          ],
          links: [
            { from: 'cost', to: 'engine', color: '#fbbf24', alpha: 0.74 },
            { from: 'lat', to: 'engine', color: '#38d9c0', alpha: 0.8 },
            { from: 'res', to: 'engine', color: '#f87171', alpha: 0.72 },
            { from: 'engine', to: 'out', color: '#4ade80', alpha: 0.88, width: 2.3, label: 'Policy outcome' }
          ],
          packets: [
            { path: ['cost', 'engine', 'out'], color: '#fbbf24', label: 'C', size: 8, offset: 0.1 },
            { path: ['lat', 'engine', 'out'], color: '#38d9c0', label: 'L', size: 8, offset: 0.35 },
            { path: ['res', 'engine', 'out'], color: '#f87171', label: 'R', size: 8, offset: 0.62 }
          ]
        }
      }
    ]
  },
  {
    id: 'stability',
    icon: '🧯',
    title: 'Instability Controls',
    sub: 'Churn, Dampening, and Blast Radius',
    badge: 'STAB',
    bg: 'rgba(248,113,113,0.16)',
    col: '#f87171',
    level: 'CCIE',
    focus: 'Control-Plane Stability',
    why: 'BGP incidents are often churn incidents. Stability controls define whether a fault stays local or becomes global noise.',
    scenes: [
      {
        tag: 'CHURN',
        title: 'Route Flapping Multiplies Update Storms',
        desc: 'A single unstable prefix can trigger repeated updates, withdrawals, and recalculation pressure across many peers.',
        takeaway: 'Contain churn near the source before it propagates into broad control-plane stress.',
        cli: ['show ip bgp flap-statistics', 'show ip bgp neighbors | include updates'],
        trap: 'Ignoring one noisy prefix can degrade unrelated paths due to shared control-plane resources.',
        facts: ['Flap storm', 'CPU pressure', 'Propagation amplification'],
        watch: ['See one prefix oscillate rapidly.', 'Notice all peers process repeated deltas.', 'Connect local instability to global impact.'],
        duration: 8,
        layout: {
          nodes: [
            { id: 'src', x: 16, y: 52, label: 'Flapping Edge', sub: 'Origin unstable', color: '#f87171', glow: true },
            { id: 'rr', x: 46, y: 52, label: 'RR/Core', sub: 'Replicates churn', color: '#fbbf24', glow: true },
            { id: 'p1', x: 78, y: 24, label: 'Peer-1', sub: 'Update load', color: '#5b9cf6', glow: true },
            { id: 'p2', x: 78, y: 52, label: 'Peer-2', sub: 'Update load', color: '#5b9cf6', glow: true },
            { id: 'p3', x: 78, y: 80, label: 'Peer-3', sub: 'Update load', color: '#5b9cf6', glow: true }
          ],
          links: [
            { from: 'src', to: 'rr', color: '#f87171', alpha: 0.86, label: 'ADV/WDR oscillation' },
            { from: 'rr', to: 'p1', color: '#fbbf24', alpha: 0.68 },
            { from: 'rr', to: 'p2', color: '#fbbf24', alpha: 0.68 },
            { from: 'rr', to: 'p3', color: '#fbbf24', alpha: 0.68 }
          ],
          packets: [
            { path: ['src', 'rr', 'p1'], color: '#f87171', label: 'WDR', size: 9, offset: 0.08 },
            { path: ['src', 'rr', 'p2'], color: '#fbbf24', label: 'UPD', size: 9, offset: 0.32 },
            { path: ['src', 'rr', 'p3'], color: '#f87171', label: 'WDR', size: 9, offset: 0.64 }
          ]
        }
      },
      {
        tag: 'DAMP',
        title: 'Dampening Suppresses Repeat Offenders',
        desc: 'Penalty-based suppression can mute unstable prefixes, but aggressive thresholds can also hide legitimate recovery.',
        takeaway: 'Use dampening surgically. Stability gains can become reachability loss if tuned too hard.',
        cli: ['show ip bgp dampened-paths', 'show ip bgp neighbors x.x.x.x'],
        trap: 'Blindly enabling classic dampening profiles in modern internet edge can hurt convergence and valid recovery.',
        facts: ['Penalty half-life', 'Suppression threshold', 'Recovery timer'],
        watch: ['See penalties rise with each flap.', 'Observe suppression trigger.', 'Watch delayed re-advertisement after decay.'],
        duration: 8,
        layout: {
          nodes: [
            { id: 'flap', x: 20, y: 52, label: 'Noisy Prefix', sub: 'Penalty increases', color: '#f87171', glow: true },
            { id: 'policy', x: 52, y: 52, label: 'Dampening Policy', sub: 'Threshold logic', color: '#fbbf24', glow: true },
            { id: 'sup', x: 84, y: 34, label: 'Suppressed', sub: 'Hidden temporarily', type: 'box', color: '#f87171' },
            { id: 'rec', x: 84, y: 72, label: 'Re-advertised', sub: 'After decay', type: 'box', color: '#4ade80' }
          ],
          links: [
            { from: 'flap', to: 'policy', color: '#f87171', alpha: 0.82, label: 'Penalty +=' },
            { from: 'policy', to: 'sup', color: '#f87171', alpha: 0.74, label: 'Suppress' },
            { from: 'policy', to: 'rec', color: '#4ade80', alpha: 0.62, label: 'Reuse after decay' }
          ],
          callouts: [
            { x: 53, y: 20, text: 'Tune thresholds by edge role', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' }
          ]
        }
      },
      {
        tag: 'CONTAIN',
        title: 'Blast Radius Shrinks with Scoped Policy',
        desc: 'Applying instability controls per peer-role and prefix-class keeps local faults from becoming global events.',
        takeaway: 'Containment strategy beats one-size-fits-all suppression.',
        cli: ['show ip bgp regexp', 'show route-map STABILITY-SCOPE'],
        trap: 'Global suppression policy can punish stable critical routes along with noisy ones.',
        facts: ['Scope by role', 'Prefix classing', 'Containment over blanket controls'],
        watch: ['See noisy class isolated.', 'Notice critical routes bypass suppression.', 'Keep policy blast radius intentionally narrow.'],
        duration: 8,
        layout: {
          zones: [
            { x: 8, y: 12, w: 40, h: 74, label: 'Noisy class', color: '#f87171', fill: 'rgba(248,113,113,0.05)' },
            { x: 52, y: 12, w: 40, h: 74, label: 'Critical class', color: '#4ade80', fill: 'rgba(74,222,128,0.05)' }
          ],
          nodes: [
            { id: 'edge', x: 30, y: 52, label: 'Edge Policy', sub: 'Class aware', color: '#fbbf24', glow: true },
            { id: 'noisy', x: 18, y: 30, label: 'Noisy /24', sub: 'Suppressed scope', color: '#f87171', glow: true },
            { id: 'critical', x: 72, y: 30, label: 'Critical /24', sub: 'Preserved', color: '#4ade80', glow: true },
            { id: 'core', x: 72, y: 72, label: 'Core/Peers', sub: 'Stable feed', type: 'box', color: '#5b9cf6' }
          ],
          links: [
            { from: 'noisy', to: 'edge', color: '#f87171', alpha: 0.45, dash: [7, 6], label: 'Contained updates' },
            { from: 'critical', to: 'edge', color: '#4ade80', alpha: 0.84, label: 'Allowed updates' },
            { from: 'edge', to: 'core', color: '#4ade80', alpha: 0.78, width: 2.1, label: 'Clean export' }
          ]
        }
      },
      {
        tag: 'ROLL',
        title: 'Fast Rollback Is a Stability Feature',
        desc: 'When policy change causes churn, controlled rollback paths restore normal behavior quickly.',
        takeaway: 'Operational rollback design is part of protocol stability engineering.',
        cli: ['show archive config differences', 'show ip bgp summary'],
        trap: 'Without rollback guardrails, a bad policy deploy can prolong churn for far longer than the fault itself.',
        facts: ['Config rollback', 'Policy guardrail', 'Incident MTTR'],
        watch: ['See churn begin after policy push.', 'Notice rollback path restore baseline.', 'Think deployment safety as routing safety.'],
        duration: 8,
        layout: {
          nodes: [
            { id: 'old', x: 18, y: 52, label: 'Stable Policy', sub: 'Baseline', type: 'box', color: '#4ade80' },
            { id: 'new', x: 50, y: 30, label: 'New Policy', sub: 'Introduces churn', type: 'box', color: '#f87171' },
            { id: 'roll', x: 50, y: 74, label: 'Rollback Plan', sub: 'One-command restore', type: 'box', color: '#fbbf24' },
            { id: 'state', x: 84, y: 52, label: 'Control Plane', sub: 'Stabilized', color: '#5b9cf6', glow: true }
          ],
          links: [
            { from: 'old', to: 'new', color: '#f87171', alpha: 0.54, label: 'Change push' },
            { from: 'new', to: 'state', color: '#f87171', alpha: 0.36, dash: [7, 6], label: 'Churn' },
            { from: 'roll', to: 'state', color: '#4ade80', alpha: 0.86, width: 2.3, label: 'Recovery path' }
          ],
          packets: [
            { path: ['new', 'state'], color: '#f87171', label: 'ERR', size: 9, offset: 0.16 },
            { path: ['roll', 'state'], color: '#4ade80', label: 'RESTORE', size: 10, offset: 0.55 }
          ]
        }
      }
    ]
  },
  {
    id: 'troubleshoot',
    icon: '🧪',
    title: 'Advanced Troubleshooting',
    sub: 'Reason Codes and Control-Plane Forensics',
    badge: 'TSH',
    bg: 'rgba(56,217,192,0.16)',
    col: '#38d9c0',
    level: 'CCIE',
    focus: 'BGP Incident Workflow',
    why: 'CCIE troubleshooting is about proving why a path won or disappeared, not just listing commands from memory.',
    scenes: [
      {
        tag: 'REASON',
        title: 'Best-Path Reasoning Beats Guesswork',
        desc: 'Correlate route attributes and reason ordering to explain exactly why the selected path won.',
        takeaway: 'Always produce a deterministic winner explanation before making policy changes.',
        cli: ['show ip bgp 203.0.113.0/24', 'show ip bgp bestpath'],
        trap: 'Changing MED or prepends without proving current winner logic often makes incidents worse.',
        facts: ['Winner explanation', 'Attribute chain', 'Deterministic debug'],
        watch: ['See candidates side by side.', 'Eliminate losers by ordered checks.', 'State the exact winning attribute.'],
        duration: 8,
        layout: {
          nodes: [
            { id: 'a', x: 16, y: 30, label: 'Path A', sub: 'LP 200', type: 'box', color: '#4ade80' },
            { id: 'b', x: 16, y: 52, label: 'Path B', sub: 'LP 150', type: 'box', color: '#f87171' },
            { id: 'c', x: 16, y: 74, label: 'Path C', sub: 'LP 200 ASLEN 3', type: 'box', color: '#a78bfa' },
            { id: 'eng', x: 52, y: 52, label: 'Decision Trace', sub: 'Reason chain', color: '#38d9c0', glow: true },
            { id: 'win', x: 84, y: 52, label: 'Best Path', sub: 'Explained outcome', type: 'box', color: '#5b9cf6' }
          ],
          links: [
            { from: 'a', to: 'eng', color: '#4ade80', alpha: 0.84 },
            { from: 'b', to: 'eng', color: '#f87171', alpha: 0.34, dash: [7, 6] },
            { from: 'c', to: 'eng', color: '#a78bfa', alpha: 0.58 },
            { from: 'eng', to: 'win', color: '#38d9c0', alpha: 0.86, width: 2.2, label: 'Winner rationale' }
          ]
        }
      },
      {
        tag: 'RFRSH',
        title: 'Route-Refresh vs Soft-Reconfig Inbound',
        desc: 'Prefer route-refresh capability to re-evaluate policy without storing a large full-copy of inbound tables.',
        takeaway: 'Modern troubleshooting favors on-demand refresh over memory-heavy legacy soft-reconfig inbound.',
        cli: ['show ip bgp neighbors x.x.x.x | include refresh', 'clear ip bgp x.x.x.x soft in'],
        trap: 'Enabling soft-reconfig inbound everywhere can waste memory at scale.',
        facts: ['Route refresh', 'Policy replay', 'Memory tradeoff'],
        watch: ['See refresh request trigger update replay.', 'Notice policy recalculation without session reset.', 'Compare with stored inbound copy model.'],
        duration: 8,
        layout: {
          nodes: [
            { id: 'peer', x: 18, y: 52, label: 'Upstream Peer', sub: 'Refresh capable', color: '#4ade80', glow: true },
            { id: 'rr', x: 50, y: 52, label: 'Local Router', sub: 'Policy changed', color: '#38d9c0', glow: true },
            { id: 'ribin', x: 82, y: 30, label: 'Soft-Reconfig In', sub: 'Memory heavy', type: 'box', color: '#fbbf24' },
            { id: 'refresh', x: 82, y: 72, label: 'Route Refresh', sub: 'Preferred replay', type: 'box', color: '#5b9cf6' }
          ],
          links: [
            { from: 'rr', to: 'peer', color: '#5b9cf6', alpha: 0.82, label: 'Refresh request' },
            { from: 'peer', to: 'rr', color: '#4ade80', alpha: 0.84, label: 'Update replay' },
            { from: 'rr', to: 'ribin', color: '#fbbf24', alpha: 0.38, dash: [7, 6], label: 'Legacy path' },
            { from: 'rr', to: 'refresh', color: '#5b9cf6', alpha: 0.78, label: 'Operational path' }
          ]
        }
      },
      {
        tag: 'ORF',
        title: 'ORF Shrinks Noise Before It Arrives',
        desc: 'Outbound Route Filtering lets a receiver push filter intent upstream so unnecessary routes are never sent.',
        takeaway: 'Filtering at source is often cleaner than dropping volume after receiving it.',
        cli: ['show ip bgp neighbors x.x.x.x | include ORF', 'show ip bgp neighbors x.x.x.x received-routes'],
        trap: 'If ORF support is partial, troubleshooting assumptions about received-route visibility can be wrong.',
        facts: ['ORF negotiation', 'Pre-filtering', 'Lower churn volume'],
        watch: ['See filter capability negotiated.', 'Watch sender suppress unwanted prefixes.', 'Observe lower update noise downstream.'],
        duration: 8,
        layout: {
          nodes: [
            { id: 'sender', x: 18, y: 52, label: 'Sender', sub: 'Large table', color: '#fbbf24', glow: true },
            { id: 'recv', x: 52, y: 52, label: 'Receiver', sub: 'Requests ORF', color: '#38d9c0', glow: true },
            { id: 'flt', x: 84, y: 30, label: 'ORF Rule', sub: 'Prefix-set push', type: 'box', color: '#a78bfa' },
            { id: 'clean', x: 84, y: 72, label: 'Filtered Feed', sub: 'Only needed routes', type: 'box', color: '#4ade80' }
          ],
          links: [
            { from: 'recv', to: 'sender', color: '#a78bfa', alpha: 0.8, label: 'ORF capability + rules' },
            { from: 'sender', to: 'clean', color: '#4ade80', alpha: 0.84, label: 'Filtered updates' },
            { from: 'sender', to: 'recv', color: '#f87171', alpha: 0.24, dash: [7, 6], label: 'Suppressed noise' }
          ],
          packets: [{ path: ['recv', 'sender', 'clean'], color: '#a78bfa', label: 'ORF', size: 10, offset: 0.18 }]
        }
      },
      {
        tag: 'FOREN',
        title: 'Build a Repeatable Forensics Sequence',
        desc: 'During incidents, gather neighbor state, candidate paths, policy hits, and refresh behavior in a strict order.',
        takeaway: 'A fixed troubleshooting sequence reduces blind changes and shortens MTTR.',
        cli: ['show ip bgp summary', 'show ip bgp x.x.x.x', 'show route-map', 'show logging'],
        trap: 'Jumping straight to config edits before evidence collection destroys useful signal.',
        facts: ['Evidence-first', 'Command order', 'Lower MTTR'],
        watch: ['See staged evidence collection.', 'Notice policy hit confirmation before changes.', 'Treat troubleshooting like a reproducible runbook.'],
        duration: 9,
        layout: {
          nodes: [
            { id: 's1', x: 16, y: 24, label: '1. Neighbor State', sub: 'Session health', type: 'box', color: '#5b9cf6' },
            { id: 's2', x: 16, y: 50, label: '2. Path Candidates', sub: 'Reason chain', type: 'box', color: '#38d9c0' },
            { id: 's3', x: 16, y: 76, label: '3. Policy Hits', sub: 'Route-map match', type: 'box', color: '#fbbf24' },
            { id: 's4', x: 52, y: 50, label: '4. Refresh/ORF', sub: 'Re-evaluate safely', type: 'box', color: '#a78bfa' },
            { id: 'out', x: 84, y: 50, label: '5. Controlled Change', sub: 'Validated fix', color: '#4ade80', glow: true }
          ],
          links: [
            { from: 's1', to: 's2', color: '#5b9cf6', alpha: 0.72 },
            { from: 's2', to: 's3', color: '#38d9c0', alpha: 0.74 },
            { from: 's3', to: 's4', color: '#fbbf24', alpha: 0.76 },
            { from: 's4', to: 'out', color: '#4ade80', alpha: 0.86, width: 2.3 }
          ],
          packets: [{ path: ['s1', 's2', 's3', 's4', 'out'], color: '#4ade80', label: 'FLOW', size: 9, offset: 0.2 }]
        }
      }
    ]
  },
  {
    id: 'dualstack',
    icon: '🧬',
    title: 'Dual-Stack and Transport Edge Cases',
    sub: 'IPv6 Next-Hop, eBGP Transport, and TTL Pitfalls',
    badge: 'DSTACK',
    bg: 'rgba(91,156,246,0.16)',
    col: '#5b9cf6',
    level: 'CCIE',
    focus: 'Transport Reality',
    why: 'Many production BGP failures are transport or address-family edge cases, not pure policy mistakes.',
    scenes: [
      {
        tag: 'V6NH',
        title: 'IPv6 Next-Hop Reachability Still Rules',
        desc: 'Even when prefixes look correct, unresolved IPv6 next-hop reachability prevents installation.',
        takeaway: 'Control-plane acceptance does not guarantee FIB installation without recursive next-hop reachability.',
        cli: ['show bgp ipv6 unicast', 'show ipv6 route'],
        trap: 'Engineers often debug attributes while the true issue is missing IPv6 next-hop reachability.',
        facts: ['IPv6 recursion', 'RIB dependency', 'Install failure risk'],
        watch: ['See prefix learned in BGP table.', 'Notice failure to install in forwarding.', 'Tie root cause to v6 next-hop recursion.'],
        duration: 8,
        layout: {
          nodes: [
            { id: 'peer', x: 18, y: 30, label: 'eBGP v6 Peer', sub: 'Advertises /48', color: '#38d9c0', glow: true },
            { id: 'edge', x: 48, y: 52, label: 'Edge Router', sub: 'Learns route', color: '#5b9cf6', glow: true },
            { id: 'nh', x: 80, y: 30, label: 'Next-Hop', sub: '2001:db8::1', type: 'box', color: '#fbbf24' },
            { id: 'fib', x: 80, y: 74, label: 'FIB Install', sub: 'Blocked until reachable', type: 'box', color: '#f87171' }
          ],
          links: [
            { from: 'peer', to: 'edge', color: '#38d9c0', alpha: 0.82, label: 'UPDATE v6' },
            { from: 'edge', to: 'nh', color: '#fbbf24', alpha: 0.44, dash: [7, 6], label: 'Recursive lookup missing' },
            { from: 'edge', to: 'fib', color: '#f87171', alpha: 0.52, label: 'Not installed' }
          ],
          packets: [{ path: ['peer', 'edge', 'fib'], color: '#f87171', label: 'PENDING', size: 9, offset: 0.2 }]
        }
      },
      {
        tag: 'LLA',
        title: 'Link-Local IPv6 Peering Requires Interface Context',
        desc: 'Link-local neighbors can work reliably, but they are interface-scoped and easy to misconfigure.',
        takeaway: 'With link-local peering, interface identity is part of neighbor identity.',
        cli: ['show bgp ipv6 unicast summary', 'show ipv6 interface brief'],
        trap: 'Same link-local address can exist on many links; missing interface context breaks adjacency.',
        facts: ['Interface-scoped LLA', 'Neighbor binding', 'Dual-stack edge case'],
        watch: ['See neighbor bound to interface.', 'Observe mismatch failure with wrong interface.', 'Treat LLA as tuple: address plus interface.'],
        duration: 8,
        layout: {
          nodes: [
            { id: 'r1', x: 24, y: 52, label: 'R1', sub: 'fe80::1 on Gi0/0', color: '#5b9cf6', glow: true },
            { id: 'r2', x: 62, y: 32, label: 'R2', sub: 'fe80::2 Gi0/0', color: '#4ade80', glow: true },
            { id: 'r3', x: 62, y: 74, label: 'R2', sub: 'fe80::2 Gi0/1', color: '#f87171', glow: true },
            { id: 'bind', x: 86, y: 52, label: 'Neighbor Bind', sub: 'fe80::2%Gi0/0', type: 'box', color: '#a78bfa' }
          ],
          links: [
            { from: 'r1', to: 'r2', color: '#4ade80', alpha: 0.84, label: 'Correct interface binding' },
            { from: 'r1', to: 'r3', color: '#f87171', alpha: 0.28, dash: [7, 6], label: 'Wrong interface context' },
            { from: 'r2', to: 'bind', color: '#a78bfa', alpha: 0.72 }
          ]
        }
      },
      {
        tag: 'MHHOP',
        title: 'eBGP Multihop and TTL Security Must Align',
        desc: 'Loopback-based eBGP multihop and GTSM/TTL-security settings must be compatible on both peers.',
        takeaway: 'Transport security and multihop design are coupled; mismatch keeps sessions in connect/active loops.',
        cli: ['show ip bgp neighbors x.x.x.x', 'show access-lists'],
        trap: 'Setting ebgp-multihop without validating TTL-security behavior can silently block sessions.',
        facts: ['eBGP multihop', 'GTSM', 'TTL mismatch failure'],
        watch: ['See loopback peering path.', 'Observe session fail with TTL policy mismatch.', 'Resolve by aligned multihop plus GTSM configuration.'],
        duration: 8,
        layout: {
          nodes: [
            { id: 'a', x: 16, y: 52, label: 'AS65001', sub: 'Loopback peer', color: '#5b9cf6', glow: true },
            { id: 'core', x: 48, y: 52, label: 'Transit Fabric', sub: '2 hops', color: '#38d9c0', glow: true },
            { id: 'b', x: 80, y: 52, label: 'AS65002', sub: 'Loopback peer', color: '#4ade80', glow: true },
            { id: 'ttl', x: 48, y: 22, label: 'TTL Policy', sub: 'multihop 2 + GTSM align', type: 'box', color: '#fbbf24' }
          ],
          links: [
            { from: 'a', to: 'core', color: '#5b9cf6', alpha: 0.74 },
            { from: 'core', to: 'b', color: '#4ade80', alpha: 0.74 },
            { from: 'a', to: 'b', color: '#f87171', alpha: 0.26, dash: [7, 6], label: 'TTL mismatch drops session' },
            { from: 'ttl', to: 'core', color: '#fbbf24', alpha: 0.7 }
          ],
          packets: [
            { path: ['a', 'core', 'b'], color: '#f87171', label: 'SYN?', size: 9, offset: 0.18 },
            { path: ['ttl', 'core', 'b'], color: '#4ade80', label: 'OK', size: 9, offset: 0.58 }
          ]
        }
      },
      {
        tag: 'UNNUM',
        title: 'Unnumbered eBGP Simplifies Ops but Changes Assumptions',
        desc: 'Unnumbered peering can reduce address overhead, yet troubleshooting must pivot to interface and next-hop semantics.',
        takeaway: 'Address simplification does not remove design discipline; it shifts where failures surface.',
        cli: ['show bgp ipv4 unicast summary', 'show interfaces status'],
        trap: 'Treating unnumbered links like numbered links leads to wrong assumptions about neighbor identity and tracing.',
        facts: ['Unnumbered eBGP', 'Interface identity', 'Operational simplification'],
        watch: ['See peering built without unique link IPs.', 'Notice interface state becomes critical context.', 'Relate simplification to new troubleshooting habits.'],
        duration: 8,
        layout: {
          nodes: [
            { id: 'r1', x: 22, y: 52, label: 'Edge-1', sub: 'Unnumbered link', color: '#5b9cf6', glow: true },
            { id: 'r2', x: 58, y: 52, label: 'Edge-2', sub: 'Unnumbered link', color: '#4ade80', glow: true },
            { id: 'id', x: 84, y: 30, label: 'Peer Identity', sub: 'Interface + ASN', type: 'box', color: '#a78bfa' },
            { id: 'ops', x: 84, y: 74, label: 'Ops View', sub: 'Simpler addressing', type: 'box', color: '#38d9c0' }
          ],
          links: [
            { from: 'r1', to: 'r2', color: '#4ade80', alpha: 0.84, width: 2.2, label: 'Unnumbered eBGP adjacency' },
            { from: 'r2', to: 'id', color: '#a78bfa', alpha: 0.7 },
            { from: 'r2', to: 'ops', color: '#38d9c0', alpha: 0.72 }
          ],
          callouts: [
            { x: 41, y: 22, text: 'Fewer link IPs, different troubleshooting lens', color: '#38d9c0', bg: 'rgba(56,217,192,0.12)' }
          ]
        }
      }
    ]
  }
];

var BA = {
  topicIndex: 0,
  sceneIndex: 0,
  sceneElapsed: 0,
  speed: 1,
  paused: false,
  animId: null,
  lastTs: 0,
  canvas: null,
  ctx: null,
  W: 0,
  H: 0,
  resizeBound: false
};

function bgpAnimInit() {
  var grid = document.getElementById('bgpAnimGrid');
  if (!grid) return;

  bgpAnimBuildTopicCards();
  BA.canvas = document.getElementById('bgp-anim-canvas');
  BA.ctx = BA.canvas ? BA.canvas.getContext('2d') : null;
  if (!BA.ctx) return;

  if (!BA.resizeBound) {
    window.addEventListener('resize', bgpAnimResize);
    BA.resizeBound = true;
  }

  bgpAnimResize();
  bgpAnimLoad(BGP_ANIM_TOPICS[0].id);
}

function bgpAnimBuildTopicCards() {
  var grid = document.getElementById('bgpAnimGrid');
  if (!grid) return;
  grid.innerHTML = '';
  BGP_ANIM_TOPICS.forEach(function(topic, index) {
    var card = document.createElement('div');
    card.className = 'bgpanim-card' + (index === BA.topicIndex ? ' active' : '');
    card.id = 'bgpcard-' + topic.id;
    card.innerHTML =
      '<div class="bgpanim-card-icon">' + topic.icon + '</div>' +
      '<div class="bgpanim-card-title">' + topic.title + '</div>' +
      '<div class="bgpanim-card-sub">' + topic.sub + '</div>' +
      '<div class="bgpanim-card-badge" style="background:' + topic.bg + ';color:' + topic.col + '">' + topic.badge + '</div>';
    card.onclick = function() { bgpAnimLoad(topic.id); };
    grid.appendChild(card);
  });
}

function bgpAnimResize() {
  if (!BA.canvas) return;
  var parent = BA.canvas.parentElement;
  BA.canvas.width = parent ? parent.offsetWidth : 900;
  BA.canvas.height = 460;
  BA.W = BA.canvas.width;
  BA.H = BA.canvas.height;
}

function bgpAnimGetTopicById(id) {
  for (var i = 0; i < BGP_ANIM_TOPICS.length; i++) {
    if (BGP_ANIM_TOPICS[i].id === id) return { topic: BGP_ANIM_TOPICS[i], index: i };
  }
  return { topic: BGP_ANIM_TOPICS[0], index: 0 };
}

function bgpAnimLoad(id) {
  var match = bgpAnimGetTopicById(id);
  BA.topicIndex = match.index;
  BA.sceneIndex = 0;
  BA.sceneElapsed = 0;
  BA.speed = 1;
  BA.paused = false;
  BA.lastTs = 0;

  BGP_ANIM_TOPICS.forEach(function(topic) {
    var el = document.getElementById('bgpcard-' + topic.id);
    if (el) el.className = 'bgpanim-card' + (topic.id === match.topic.id ? ' active' : '');
  });

  bgpAnimBuildSceneRail();
  bgpAnimUpdatePanels();
  var titleEl = document.getElementById('bgpAnimCanvasTitle');
  if (titleEl) titleEl.textContent = match.topic.icon + '  ' + match.topic.title + ' - ' + match.topic.sub;
  var playBtn = document.getElementById('bgpAnimPlayBtn');
  if (playBtn) playBtn.textContent = '⏸ Pause';
  bgpAnimSyncSpeedButtons();
  bgpAnimEnsureLoop();
}

function bgpAnimBuildSceneRail() {
  var rail = document.getElementById('bgpAnimSceneRail');
  if (!rail) return;
  var topic = BGP_ANIM_TOPICS[BA.topicIndex];
  rail.innerHTML = '';
  topic.scenes.forEach(function(scene, index) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'bgpanim-scene-btn' + (index === BA.sceneIndex ? ' active' : '');
    btn.innerHTML =
      '<span class="bgpanim-scene-step">Scene ' + (index + 1) + '</span>' +
      '<span class="bgpanim-scene-title">' + scene.title + '</span>' +
      '<span class="bgpanim-scene-sub">' + scene.tag + '</span>';
    btn.onclick = function() { bgpAnimSetScene(index); };
    rail.appendChild(btn);
  });
}

function bgpAnimSetScene(index) {
  var topic = BGP_ANIM_TOPICS[BA.topicIndex];
  if (!topic || index < 0 || index >= topic.scenes.length) return;
  BA.sceneIndex = index;
  BA.sceneElapsed = 0;
  BA.lastTs = 0;
  bgpAnimBuildSceneRail();
  bgpAnimUpdatePanels();
}

function bgpAnimTogglePlay() {
  BA.paused = !BA.paused;
  var playBtn = document.getElementById('bgpAnimPlayBtn');
  if (playBtn) playBtn.textContent = BA.paused ? '▶ Play' : '⏸ Pause';
  if (!BA.paused) bgpAnimEnsureLoop();
}

function bgpAnimReset() {
  BA.sceneElapsed = 0;
  BA.paused = false;
  BA.lastTs = 0;
  var playBtn = document.getElementById('bgpAnimPlayBtn');
  if (playBtn) playBtn.textContent = '⏸ Pause';
  bgpAnimUpdatePanels();
  bgpAnimEnsureLoop();
}

function bgpAnimSetSpeed(speed, btn) {
  BA.speed = speed;
  bgpAnimSyncSpeedButtons(btn);
}

function bgpAnimSyncSpeedButtons(activeBtn) {
  var buttons = document.querySelectorAll('.bac-speed-btn');
  buttons.forEach(function(node) { node.classList.remove('active'); });
  if (activeBtn) {
    activeBtn.classList.add('active');
    return;
  }
  var targetId = BA.speed <= 0.5 ? 'bspeed-slow' : (BA.speed >= 2 ? 'bspeed-fast' : 'bspeed-normal');
  var target = document.getElementById(targetId);
  if (target) target.classList.add('active');
}

function bgpAnimPrevScene() {
  var topic = BGP_ANIM_TOPICS[BA.topicIndex];
  if (!topic || !topic.scenes.length) return;
  var nextIndex = BA.sceneIndex === 0 ? topic.scenes.length - 1 : BA.sceneIndex - 1;
  bgpAnimSetScene(nextIndex);
}

function bgpAnimNextScene() {
  var topic = BGP_ANIM_TOPICS[BA.topicIndex];
  if (!topic || !topic.scenes.length) return;
  var nextIndex = BA.sceneIndex === topic.scenes.length - 1 ? 0 : BA.sceneIndex + 1;
  bgpAnimSetScene(nextIndex);
}

function bgpAnimPrev() {
  var nextIndex = BA.topicIndex === 0 ? BGP_ANIM_TOPICS.length - 1 : BA.topicIndex - 1;
  bgpAnimLoad(BGP_ANIM_TOPICS[nextIndex].id);
}

function bgpAnimNext() {
  var nextIndex = BA.topicIndex === BGP_ANIM_TOPICS.length - 1 ? 0 : BA.topicIndex + 1;
  bgpAnimLoad(BGP_ANIM_TOPICS[nextIndex].id);
}

function bgpAnimEnsureLoop() {
  if (BA.animId) cancelAnimationFrame(BA.animId);
  BA.animId = requestAnimationFrame(bgpAnimTick);
}

function bgpAnimTick(ts) {
  if (!BA.ctx) return;
  if (!BA.lastTs) BA.lastTs = ts;
  var dt = Math.min(0.05, (ts - BA.lastTs) / 1000);
  BA.lastTs = ts;

  var topic = BGP_ANIM_TOPICS[BA.topicIndex];
  var scene = topic.scenes[BA.sceneIndex];
  if (!BA.paused) {
    BA.sceneElapsed += dt * BA.speed;
    if (BA.sceneElapsed >= scene.duration) {
      BA.sceneElapsed = 0;
      BA.sceneIndex = (BA.sceneIndex + 1) % topic.scenes.length;
      bgpAnimBuildSceneRail();
      bgpAnimUpdatePanels();
      scene = topic.scenes[BA.sceneIndex];
    }
  }

  bgpAnimRenderScene(topic, scene);
  BA.animId = requestAnimationFrame(bgpAnimTick);
}

function bgpAnimUpdatePanels() {
  var topic = BGP_ANIM_TOPICS[BA.topicIndex];
  var scene = topic.scenes[BA.sceneIndex];
  var tagEl = document.getElementById('bgpAnimTag');
  var titleEl = document.getElementById('bgpAnimTitle');
  var descEl = document.getElementById('bgpAnimDesc');
  var stepEl = document.getElementById('bgpAnimStepNum');
  var stepTotalEl = document.getElementById('bgpAnimStepTotal');
  var levelEl = document.getElementById('bgpAnimLevel');
  var focusEl = document.getElementById('bgpAnimFocus');
  var positionEl = document.getElementById('bgpAnimPosition');
  var whyEl = document.getElementById('bgpAnimWhy');
  var watchEl = document.getElementById('bgpAnimWatchList');
  var takeawayEl = document.getElementById('bgpAnimTakeaway');
  var cliEl = document.getElementById('bgpAnimCli');
  var trapEl = document.getElementById('bgpAnimTrap');
  var factsEl = document.getElementById('bgpAnimFacts');

  if (tagEl) {
    tagEl.textContent = scene.tag;
    tagEl.style.background = topic.bg;
    tagEl.style.color = topic.col;
  }
  if (titleEl) titleEl.textContent = scene.title;
  if (descEl) descEl.textContent = scene.desc;
  if (stepEl) stepEl.textContent = (BA.sceneIndex + 1);
  if (stepTotalEl) stepTotalEl.textContent = topic.scenes.length;
  if (levelEl) levelEl.textContent = topic.level;
  if (focusEl) focusEl.textContent = topic.focus;
  if (positionEl) positionEl.textContent = (BA.topicIndex + 1) + ' / ' + BGP_ANIM_TOPICS.length;
  if (whyEl) whyEl.textContent = topic.why;
  if (takeawayEl) takeawayEl.textContent = scene.takeaway;
  if (cliEl) cliEl.textContent = scene.cli.join('\n');
  if (trapEl) trapEl.textContent = scene.trap;
  if (watchEl) {
    watchEl.innerHTML = scene.watch.map(function(item, index) {
      return '<div class="bgpanim-watch-item"><div class="bgpanim-watch-bullet">' + (index + 1) + '</div><div>' + item + '</div></div>';
    }).join('');
  }
  if (factsEl) {
    factsEl.innerHTML = scene.facts.map(function(item) {
      return '<span class="bgpanim-fact">' + item + '</span>';
    }).join('');
  }
}

function bgpAnimRenderScene(topic, scene) {
  var ctx = BA.ctx;
  var W = BA.W;
  var H = BA.H;
  var progress = scene.duration > 0 ? (BA.sceneElapsed / scene.duration) : 0;
  var loopT = progress % 1;
  var pulse = 0.5 + Math.sin(loopT * Math.PI * 2) * 0.5;
  ctx.clearRect(0, 0, W, H);
  bgpAnimDrawBackdrop(ctx, W, H, topic.col, pulse, loopT);

  var layout = scene.layout || {};
  var nodeMap = {};
  (layout.nodes || []).forEach(function(node) { nodeMap[node.id] = node; });

  (layout.zones || []).forEach(function(zone) { bgpAnimDrawZone(ctx, W, H, zone, pulse); });
  (layout.links || []).forEach(function(link) { bgpAnimDrawLink(ctx, W, H, link, nodeMap, loopT); });
  (layout.cards || []).forEach(function(card) { bgpAnimDrawCard(ctx, W, H, card); });
  (layout.nodes || []).forEach(function(node) { bgpAnimDrawNode(ctx, W, H, node, pulse); });
  (layout.packets || []).forEach(function(packet) { bgpAnimDrawPacket(ctx, W, H, packet, nodeMap, loopT); });
  (layout.callouts || []).forEach(function(callout) { bgpAnimDrawCallout(ctx, W, H, callout); });

  bgpAnimDrawFooter(ctx, W, H, topic, scene, progress);
}

function bgpAnimDrawBackdrop(ctx, W, H, color, pulse, loopT) {
  var grd = ctx.createLinearGradient(0, 0, 0, H);
  grd.addColorStop(0, 'rgba(8,13,24,0.98)');
  grd.addColorStop(1, 'rgba(5,8,16,1)');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  var horizon = ctx.createLinearGradient(0, H * 0.58, 0, H);
  horizon.addColorStop(0, 'rgba(15,22,38,0)');
  horizon.addColorStop(1, 'rgba(6,10,19,0.92)');
  ctx.fillStyle = horizon;
  ctx.fillRect(0, H * 0.58, W, H * 0.42);
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = 'rgba(91,156,246,0.05)';
  ctx.lineWidth = 1;
  for (var x = 0; x < W; x += 46) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (var y = 0; y < H; y += 46) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
  ctx.restore();

  ctx.save();
  var glow = ctx.createRadialGradient(W * 0.5, H * 0.22, 0, W * 0.5, H * 0.22, W * 0.48);
  glow.addColorStop(0, bgpAnimHexA(color, 0.14 + pulse * 0.05));
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();

  ctx.save();
  for (var i = 0; i < 18; i++) {
    var sx = (i * 97 + loopT * 140) % W;
    var sy = (i * 41) % (H * 0.7);
    var sr = (i % 3) + 1;
    ctx.fillStyle = i % 2 ? 'rgba(255,255,255,0.06)' : bgpAnimHexA(color, 0.08);
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  ctx.save();
  var vignette = ctx.createRadialGradient(W * 0.5, H * 0.5, H * 0.18, W * 0.5, H * 0.5, H * 0.72);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.34)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

function bgpAnimDrawZone(ctx, W, H, zone, pulse) {
  var rect = bgpAnimRect(W, H, zone.x, zone.y, zone.w, zone.h);
  ctx.save();
  ctx.fillStyle = zone.fill || bgpAnimHexA(zone.color || '#5b9cf6', 0.06);
  ctx.strokeStyle = bgpAnimHexA(zone.color || '#5b9cf6', 0.32);
  ctx.lineWidth = 1.2;
  ctx.setLineDash([6, 5]);
  bgpAnimRoundRect(ctx, rect.x, rect.y, rect.w, rect.h, 14);
  ctx.fill();
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = bgpAnimHexA(zone.color || '#5b9cf6', 0.08 + pulse * 0.04);
  bgpAnimRoundRect(ctx, rect.x + 1, rect.y + 1, rect.w - 2, 22, 12);
  ctx.fill();
  ctx.fillStyle = zone.color || '#5b9cf6';
  ctx.font = 'bold 10px IBM Plex Mono, monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(zone.label || '', rect.x + 10, rect.y + 9);
  ctx.restore();
}

function bgpAnimDrawNode(ctx, W, H, node, pulse) {
  var pos = bgpAnimPos(W, H, node.x, node.y);
  var color = node.color || '#5b9cf6';
  if (node.type === 'box') {
    var bw = Math.max(118, Math.min(170, W * 0.16));
    var bh = 54;
    ctx.save();
    ctx.shadowColor = bgpAnimHexA(color, 0.2);
    ctx.shadowBlur = 18;
    ctx.fillStyle = 'rgba(12,18,31,0.95)';
    ctx.strokeStyle = bgpAnimHexA(color, 0.82);
    ctx.lineWidth = 1.6;
    bgpAnimRoundRect(ctx, pos.x - bw / 2, pos.y - bh / 2, bw, bh, 12);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.font = 'bold 11px IBM Plex Mono, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.label || '', pos.x, pos.y - 8);
    ctx.fillStyle = '#8d96b3';
    ctx.font = '9px IBM Plex Mono, monospace';
    ctx.fillText(node.sub || '', pos.x, pos.y + 10);
    ctx.restore();
    return;
  }

  if (node.glow) {
    ctx.save();
    var glow = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 42 + pulse * 6);
    glow.addColorStop(0, bgpAnimHexA(color, 0.34 + pulse * 0.08));
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(pos.x, pos.y, 42, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.strokeStyle = bgpAnimHexA(color, 0.18 + pulse * 0.14);
    ctx.lineWidth = 1.3;
    ctx.beginPath(); ctx.arc(pos.x, pos.y, 29 + pulse * 4, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();
  }

  ctx.save();
  ctx.shadowColor = bgpAnimHexA(color, 0.22);
  ctx.shadowBlur = 18;
  ctx.beginPath(); ctx.arc(pos.x, pos.y, 24, 0, Math.PI * 2);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.beginPath(); ctx.arc(pos.x, pos.y, 20, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(13,18,29,0.98)';
  ctx.fill();
  ctx.strokeStyle = bgpAnimHexA(color, 0.7);
  ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(pos.x - 8, pos.y); ctx.lineTo(pos.x + 8, pos.y); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(pos.x, pos.y - 8); ctx.lineTo(pos.x, pos.y + 8); ctx.stroke();
  ctx.fillStyle = '#e8eaf0';
  ctx.font = 'bold 11px IBM Plex Mono, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(node.label || '', pos.x, pos.y + 30);
  ctx.fillStyle = '#7d859f';
  ctx.font = '9px IBM Plex Mono, monospace';
  ctx.fillText(node.sub || '', pos.x, pos.y + 43);
  ctx.restore();
}

function bgpAnimDrawLink(ctx, W, H, link, nodeMap, loopT) {
  var from = bgpAnimResolvePoint(W, H, link.from, nodeMap);
  var to = bgpAnimResolvePoint(W, H, link.to, nodeMap);
  if (!from || !to) return;
  ctx.save();
  ctx.shadowColor = bgpAnimHexA(link.color || '#5b9cf6', 0.2);
  ctx.shadowBlur = 10;
  ctx.strokeStyle = link.color || '#5b9cf6';
  ctx.globalAlpha = typeof link.alpha === 'number' ? link.alpha : 0.6;
  ctx.lineWidth = link.width || 1.6;
  if (link.dash) ctx.setLineDash(link.dash);
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
  ctx.setLineDash([]);

  var hx = bgpAnimLerp(from.x, to.x, (loopT + 0.15) % 1);
  var hy = bgpAnimLerp(from.y, to.y, (loopT + 0.15) % 1);
  var angle = Math.atan2(to.y - from.y, to.x - from.x);
  ctx.save();
  ctx.translate(hx, hy);
  ctx.rotate(angle);
  ctx.fillStyle = bgpAnimHexA(link.color || '#5b9cf6', 0.8);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-8, 4);
  ctx.lineTo(-8, -4);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  if (link.label) {
    var mx = (from.x + to.x) / 2;
    var my = (from.y + to.y) / 2 - 12;
    ctx.fillStyle = 'rgba(8,12,20,0.9)';
    var tw = ctx.measureText(link.label).width;
    bgpAnimRoundRect(ctx, mx - tw / 2 - 7, my - 11, tw + 14, 18, 6);
    ctx.fill();
    ctx.fillStyle = link.color || '#5b9cf6';
    ctx.font = '9px IBM Plex Mono, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(link.label, mx, my - 2);
  }
  ctx.restore();
}

function bgpAnimDrawPacket(ctx, W, H, packet, nodeMap, loopT) {
  var path = [];
  packet.path.forEach(function(step) {
    var pt = bgpAnimResolvePoint(W, H, step, nodeMap);
    if (pt) path.push(pt);
  });
  if (path.length < 2) return;
  var offset = typeof packet.offset === 'number' ? packet.offset : 0;
  var t = (loopT + offset) % 1;
  var scaled = t * (path.length - 1);
  var seg = Math.min(path.length - 2, Math.floor(scaled));
  var local = scaled - seg;
  var eased = bgpAnimEase(local);
  var x = bgpAnimLerp(path[seg].x, path[seg + 1].x, eased);
  var y = bgpAnimLerp(path[seg].y, path[seg + 1].y, eased);
  var color = packet.color || '#38d9c0';
  var size = packet.size || 10;
  var prevT = ((t - 0.08) + 1) % 1;
  var prevScaled = prevT * (path.length - 1);
  var prevSeg = Math.min(path.length - 2, Math.floor(prevScaled));
  var prevLocal = prevScaled - prevSeg;
  var prevX = bgpAnimLerp(path[prevSeg].x, path[prevSeg + 1].x, bgpAnimEase(prevLocal));
  var prevY = bgpAnimLerp(path[prevSeg].y, path[prevSeg + 1].y, bgpAnimEase(prevLocal));

  ctx.save();
  ctx.strokeStyle = bgpAnimHexA(color, 0.45);
  ctx.lineWidth = size * 0.72;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(prevX, prevY);
  ctx.lineTo(x, y);
  ctx.stroke();
  var glow = ctx.createRadialGradient(x, y, 0, x, y, size * 2.4);
  glow.addColorStop(0, bgpAnimHexA(color, 0.42));
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(x, y, size * 2.3, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#05070d';
  ctx.font = 'bold 8px IBM Plex Mono, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(packet.label || '', x, y);
  ctx.restore();
}

function bgpAnimDrawCard(ctx, W, H, card) {
  var rect = bgpAnimRect(W, H, card.x, card.y, card.w, card.h);
  ctx.save();
  ctx.fillStyle = 'rgba(10,16,27,0.92)';
  ctx.strokeStyle = bgpAnimHexA(card.color || '#5b9cf6', 0.75);
  ctx.lineWidth = 1.3;
  bgpAnimRoundRect(ctx, rect.x, rect.y, rect.w, rect.h, 10);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = card.color || '#5b9cf6';
  ctx.font = 'bold 10px IBM Plex Mono, monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(card.title || '', rect.x + 10, rect.y + 8);
  ctx.fillStyle = '#94a0bf';
  ctx.font = '9px IBM Plex Mono, monospace';
  bgpAnimWrapText(ctx, card.body || '', rect.x + 10, rect.y + 24, rect.w - 20, 12);
  ctx.restore();
}

function bgpAnimDrawCallout(ctx, W, H, callout) {
  var pos = bgpAnimPos(W, H, callout.x, callout.y);
  ctx.save();
  ctx.font = 'bold 9px IBM Plex Mono, monospace';
  var tw = ctx.measureText(callout.text || '').width;
  ctx.fillStyle = callout.bg || 'rgba(91,156,246,0.12)';
  ctx.strokeStyle = bgpAnimHexA(callout.color || '#5b9cf6', 0.45);
  ctx.lineWidth = 1;
  bgpAnimRoundRect(ctx, pos.x - tw / 2 - 8, pos.y - 11, tw + 16, 22, 8);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = callout.color || '#5b9cf6';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(callout.text || '', pos.x, pos.y + 1);
  ctx.restore();
}

function bgpAnimDrawFooter(ctx, W, H, topic, scene, progress) {
  ctx.save();
  ctx.fillStyle = 'rgba(8,12,20,0.9)';
  ctx.fillRect(0, H - 28, W, 28);
  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  ctx.fillRect(0, H - 31, W, 3);
  ctx.fillStyle = topic.col;
  ctx.fillRect(0, H - 31, W * Math.min(progress, 1), 3);
  ctx.fillStyle = topic.col;
  ctx.font = 'bold 10px IBM Plex Mono, monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(topic.badge + '  ' + scene.tag + '  |  ' + scene.title, 14, H - 14);
  ctx.fillStyle = '#7d859f';
  ctx.textAlign = 'right';
  ctx.fillText('Auto-play scene ' + (BA.sceneIndex + 1) + ' of ' + topic.scenes.length, W - 14, H - 14);
  ctx.restore();
}

function bgpAnimResolvePoint(W, H, ref, nodeMap) {
  if (!ref) return null;
  if (typeof ref === 'string') {
    var node = nodeMap[ref];
    if (!node) return null;
    return bgpAnimPos(W, H, node.x, node.y);
  }
  return bgpAnimPos(W, H, ref.x, ref.y);
}

function bgpAnimPos(W, H, x, y) {
  return { x: W * (x / 100), y: H * (y / 100) };
}

function bgpAnimRect(W, H, x, y, w, h) {
  return { x: W * (x / 100), y: H * (y / 100), w: W * (w / 100), h: H * (h / 100) };
}

function bgpAnimRoundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function bgpAnimWrapText(ctx, text, x, y, maxWidth, lineHeight) {
  var words = String(text || '').split(' ');
  var line = '';
  var lineY = y;
  for (var i = 0; i < words.length; i++) {
    var testLine = line ? line + ' ' + words[i] : words[i];
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, lineY);
      line = words[i];
      lineY += lineHeight;
    } else {
      line = testLine;
    }
  }
  if (line) ctx.fillText(line, x, lineY);
}

function bgpAnimEase(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function bgpAnimLerp(a, b, t) {
  return a + (b - a) * t;
}

function bgpAnimHexA(hex, alpha) {
  if (!hex || hex.charAt(0) !== '#') return 'rgba(91,156,246,' + alpha + ')';
  var r = parseInt(hex.slice(1, 3), 16);
  var g = parseInt(hex.slice(3, 5), 16);
  var b = parseInt(hex.slice(5, 7), 16);
  return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
}
