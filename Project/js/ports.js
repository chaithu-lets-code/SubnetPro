// ═══════════════════════════════════════════════════
// TCP/UDP PORT REFERENCE — ports.js  (SubnetLab Pro)
// Searchable database of 230+ well-known ports.
// Filter by protocol, category, or search by port
// number / service name / keyword. Includes Wireshark
// filters and Cisco ACL snippets per port.
// ═══════════════════════════════════════════════════
(function () {
  'use strict';

  // ── Port database  [ port, proto, service, category, description, wireshark, acl_port ]
  // proto: T=TCP, U=UDP, B=TCP+UDP
  const PORTS = [
    // ── NETWORK INFRASTRUCTURE
    [20,   'T', 'FTP-DATA',    'net',     'FTP Data Transfer',                          'ftp-data',         '20'],
    [21,   'T', 'FTP',         'net',     'FTP Control — file transfer (plaintext)',     'ftp',              '21'],
    [22,   'T', 'SSH',         'net',     'Secure Shell — encrypted CLI + SCP/SFTP',    'ssh',              '22'],
    [23,   'T', 'Telnet',      'net',     'Telnet — unencrypted remote CLI (legacy)',   'telnet',           '23'],
    [25,   'T', 'SMTP',        'email',   'Simple Mail Transfer Protocol — send mail',  'smtp',             '25'],
    [53,   'B', 'DNS',         'net',     'Domain Name System — UDP queries, TCP zone xfr', 'dns',          '53'],
    [67,   'U', 'DHCP-Server', 'net',     'DHCP Server — receives client requests',     'bootp',            '67'],
    [68,   'U', 'DHCP-Client', 'net',     'DHCP Client — receives server offers',       'bootp',            '68'],
    [69,   'U', 'TFTP',        'net',     'Trivial FTP — IOS image uploads, PXE boot',  'tftp',             '69'],
    [80,   'T', 'HTTP',        'web',     'Hypertext Transfer Protocol — web traffic',  'http',             '80'],
    [88,   'B', 'Kerberos',    'auth',    'Kerberos authentication — Active Directory', 'kerberos',         '88'],
    [110,  'T', 'POP3',        'email',   'Post Office Protocol v3 — email retrieval',  'pop',              '110'],
    [119,  'T', 'NNTP',        'net',     'Network News Transfer Protocol',             'nntp',             '119'],
    [123,  'U', 'NTP',         'net',     'Network Time Protocol — clock sync',         'ntp',              '123'],
    [135,  'T', 'MS-RPC',      'windows', 'Microsoft RPC Endpoint Mapper',              'msrpc',            '135'],
    [137,  'U', 'NetBIOS-NS',  'windows', 'NetBIOS Name Service',                       'nbns',             '137'],
    [138,  'U', 'NetBIOS-DGM', 'windows', 'NetBIOS Datagram Service',                  'nbdgm',            '138'],
    [139,  'T', 'NetBIOS-SS',  'windows', 'NetBIOS Session Service — SMB over NetBIOS', 'nbss',            '139'],
    [143,  'T', 'IMAP',        'email',   'Internet Message Access Protocol',           'imap',             '143'],
    [161,  'U', 'SNMP',        'mgmt',    'SNMP polling — GET/GETNEXT/GETBULK',         'snmp',             '161'],
    [162,  'U', 'SNMP-TRAP',   'mgmt',    'SNMP Trap receiver — agent to manager',      'snmptrap',         '162'],
    [179,  'T', 'BGP',         'routing', 'Border Gateway Protocol — eBGP/iBGP sessions','bgp',            '179'],
    [194,  'T', 'IRC',         'net',     'Internet Relay Chat',                        'irc',              '194'],
    [389,  'T', 'LDAP',        'auth',    'Lightweight Directory Access Protocol',      'ldap',             '389'],
    [443,  'T', 'HTTPS',       'web',     'HTTP over TLS/SSL — encrypted web traffic',  'tls',              '443'],
    [445,  'T', 'SMB',         'windows', 'Server Message Block — Windows file shares', 'smb',             '445'],
    [465,  'T', 'SMTPS',       'email',   'SMTP over SSL (legacy, prefer 587)',          'smtp',             '465'],
    [500,  'U', 'IKE/ISAKMP',  'vpn',     'IPSec IKEv1/IKEv2 key exchange',             'isakmp',           '500'],
    [514,  'U', 'Syslog',      'mgmt',    'Syslog (UDP) — legacy device logging',       'syslog',           '514'],
    [514,  'T', 'RSH',         'net',     'Remote Shell (insecure — replaced by SSH)',   '',                '514'],
    [515,  'T', 'LPD',         'net',     'Line Printer Daemon — legacy printing',      'printer',          '515'],
    [520,  'U', 'RIP',         'routing', 'Routing Information Protocol v1/v2',         'rip',              '520'],
    [521,  'U', 'RIPng',       'routing', 'RIP next generation — IPv6 routing',         '',                 '521'],
    [546,  'U', 'DHCPv6-Clnt', 'net',     'DHCPv6 Client',                              'dhcpv6',           '546'],
    [547,  'U', 'DHCPv6-Srv',  'net',     'DHCPv6 Server',                              'dhcpv6',           '547'],
    [587,  'T', 'SMTP-Submit', 'email',   'SMTP Submission (AUTH required) — preferred','smtp',             '587'],
    [593,  'T', 'MS-RPC-HTTP', 'windows', 'Microsoft RPC over HTTP',                   '',                 '593'],
    [636,  'T', 'LDAPS',       'auth',    'LDAP over SSL/TLS',                          'ldap',             '636'],
    [646,  'T', 'LDP',         'routing', 'MPLS Label Distribution Protocol',           'ldp',              '646'],
    [443,  'U', 'QUIC',        'web',     'QUIC / HTTP/3 — UDP-based transport',        'quic',             '443'],
    [694,  'U', 'HA-Cluster',  'mgmt',    'Linux-HA heartbeat',                         '',                 '694'],
    [700,  'T', 'EPP',         'net',     'Extensible Provisioning Protocol (domain registrars)', '',       '700'],
    [749,  'T', 'Kerberos-adm','auth',    'Kerberos admin — kadmin',                    '',                 '749'],
    [853,  'T', 'DNS-over-TLS','net',     'DoT — encrypted DNS (RFC 7858)',             '',                 '853'],
    [860,  'T', 'iSCSI',       'storage', 'iSCSI storage protocol',                     'iscsi',            '860'],
    [873,  'T', 'rsync',       'net',     'rsync file synchronization',                 '',                 '873'],
    [902,  'T', 'VMware',      'mgmt',    'VMware ESXi management',                     '',                 '902'],
    [989,  'T', 'FTPS-Data',   'net',     'FTP over SSL — data channel',                '',                 '989'],
    [990,  'T', 'FTPS',        'net',     'FTP over SSL — control channel',             '',                 '990'],
    [993,  'T', 'IMAPS',       'email',   'IMAP over SSL',                              'imap',             '993'],
    [995,  'T', 'POP3S',       'email',   'POP3 over SSL',                              'pop',              '995'],
    // ── VPN / TUNNEL
    [1194, 'U', 'OpenVPN',     'vpn',     'OpenVPN — default UDP port',                 '',                 '1194'],
    [1194, 'T', 'OpenVPN',     'vpn',     'OpenVPN — TCP fallback',                     '',                 '1194'],
    [1293, 'T', 'IPSec',       'vpn',     'IPSec tunnel encapsulation',                 '',                 '1293'],
    [1701, 'U', 'L2TP',        'vpn',     'Layer 2 Tunneling Protocol',                 'l2tp',             '1701'],
    [1723, 'T', 'PPTP',        'vpn',     'Point-to-Point Tunneling Protocol (legacy)', 'pptp',             '1723'],
    [4500, 'U', 'IPSec-NAT-T', 'vpn',     'IPSec NAT Traversal — IKEv2 behind NAT',    'isakmp',           '4500'],
    [4789, 'U', 'VXLAN',       'tunnel',  'Virtual eXtensible LAN (RFC 7348)',          'vxlan',            '4789'],
    [6081, 'U', 'GENEVE',      'tunnel',  'Generic Network Virtualization Encapsulation','geneve',           '6081'],
    [8472, 'U', 'VXLAN-Flannel','tunnel', 'VXLAN — Flannel (Kubernetes overlay)',       '',                 '8472'],
    [51820,'U', 'WireGuard',   'vpn',     'WireGuard VPN — default listen port',        '',                 '51820'],
    // ── ROUTING PROTOCOLS (well-known ports + protocol numbers)
    [179,  'T', 'BGP',         'routing', 'BGP — already listed above',                 '',                 ''],
    [2601, 'T', 'Zebra/FRR',   'routing', 'Zebra routing daemon (FRRouting)',            '',                 '2601'],
    [2605, 'T', 'BGPd/FRR',    'routing', 'BGP daemon (FRRouting/Quagga)',              '',                 '2605'],
    // ── MANAGEMENT / MONITORING
    [830,  'T', 'NETCONF',     'mgmt',    'NETCONF over SSH — network device config',   '',                 '830'],
    [831,  'T', 'NETCONF-S',   'mgmt',    'NETCONF over BEEP',                          '',                 '831'],
    [4334, 'T', 'RESTCONF',    'mgmt',    'RESTCONF — HTTP-based config management',    '',                 '4334'],
    [443,  'T', 'gNMI',        'mgmt',    'gRPC Network Management Interface (over TLS)','',               '443'],
    [50051,'T', 'gRPC',        'mgmt',    'gRPC default — used by gNMI/gNOI',           '',                 '50051'],
    [8728, 'T', 'MikroTik-API','mgmt',    'MikroTik RouterOS API',                      '',                 '8728'],
    [8729, 'T', 'MikroTik-TLS','mgmt',    'MikroTik RouterOS API over TLS',             '',                 '8729'],
    [8080, 'T', 'HTTP-Alt',    'web',     'HTTP alternate — proxies, dev servers',      'http',             '8080'],
    [8443, 'T', 'HTTPS-Alt',   'web',     'HTTPS alternate — admin consoles',           'tls',              '8443'],
    [9100, 'T', 'Prometheus',  'mgmt',    'Prometheus node_exporter metrics endpoint',  '',                 '9100'],
    [2003, 'T', 'Graphite',    'mgmt',    'Graphite carbon plaintext metrics receiver', '',                 '2003'],
    [4317, 'T', 'OTLP-gRPC',   'mgmt',    'OpenTelemetry gRPC collector',               '',                 '4317'],
    [6514, 'T', 'Syslog-TLS',  'mgmt',    'Syslog over TLS (RFC 5425)',                 '',                 '6514'],
    [10162,'U', 'SNMP-TLS',    'mgmt',    'SNMP over DTLS',                             '',                 '10162'],
    // ── DATABASE
    [1433, 'T', 'MS-SQL',      'db',      'Microsoft SQL Server',                       'tds',              '1433'],
    [1521, 'T', 'Oracle',      'db',      'Oracle DB listener',                         '',                 '1521'],
    [3306, 'T', 'MySQL',       'db',      'MySQL / MariaDB database',                   'mysql',            '3306'],
    [5432, 'T', 'PostgreSQL',  'db',      'PostgreSQL database',                        'pgsql',            '5432'],
    [6379, 'T', 'Redis',       'db',      'Redis in-memory data store',                 'redis',            '6379'],
    [27017,'T', 'MongoDB',     'db',      'MongoDB NoSQL database',                     '',                 '27017'],
    // ── VOICE / VIDEO / REAL-TIME
    [1719, 'U', 'H.323-RAS',   'voip',    'H.323 Registration / Admission / Status',    '',                 '1719'],
    [1720, 'T', 'H.323-Call',  'voip',    'H.323 Call Signaling',                       'h225',             '1720'],
    [2427, 'U', 'MGCP-GW',     'voip',    'MGCP Gateway — media gateway control',       'mgcp',             '2427'],
    [2727, 'U', 'MGCP-CA',     'voip',    'MGCP Call Agent',                            'mgcp',             '2727'],
    [3478, 'U', 'STUN/TURN',   'voip',    'STUN/TURN — NAT traversal for WebRTC',       'stun',             '3478'],
    [3479, 'U', 'STUN-Alt',    'voip',    'STUN alternate port',                        '',                 '3479'],
    [5060, 'B', 'SIP',         'voip',    'Session Initiation Protocol — call setup',   'sip',              '5060'],
    [5061, 'T', 'SIP-TLS',     'voip',    'SIP over TLS — encrypted signaling',         'sip',              '5061'],
    [5349, 'T', 'STUN-TLS',    'voip',    'STUN/TURN over TLS',                         '',                 '5349'],
    [16384,'-', 'RTP-range',   'voip',    'RTP/RTCP media — typically 16384–32767 UDP', 'rtp',              '16384-32767'],
    // ── CLOUD / CONTAINERS / DEVOPS
    [2376, 'T', 'Docker-TLS',  'cloud',   'Docker daemon TLS — remote API',             '',                 '2376'],
    [2377, 'T', 'Docker-Swarm','cloud',   'Docker Swarm cluster management',            '',                 '2377'],
    [2379, 'T', 'etcd-Client', 'cloud',   'etcd client API — Kubernetes control plane', '',                 '2379'],
    [2380, 'T', 'etcd-Peer',   'cloud',   'etcd peer communication',                    '',                 '2380'],
    [6443, 'T', 'K8s-API',     'cloud',   'Kubernetes API server (HTTPS)',               '',                 '6443'],
    [10250,'T', 'kubelet',     'cloud',   'Kubernetes kubelet API',                     '',                 '10250'],
    [10255,'T', 'kubelet-RO',  'cloud',   'Kubernetes kubelet read-only API (deprecated)','',               '10255'],
    [30000,'T', 'K8s-NodePort','cloud',   'Kubernetes NodePort range (30000–32767)',     '',                 '30000-32767'],
    // ── SECURITY
    [636,  'T', 'LDAPS',       'security','LDAP over SSL — already listed',             '',                 ''],
    [989,  'T', 'FTPS',        'security','FTP over SSL — already listed',              '',                 ''],
    [992,  'T', 'Telnet-TLS',  'security','Telnet over TLS',                            '',                 '992'],
    [8834, 'T', 'Nessus',      'security','Nessus vulnerability scanner web UI',        '',                 '8834'],
    [9001, 'T', 'Tor',         'security','Tor network — ORPort',                       '',                 '9001'],
    // ── CISCO / VENDOR SPECIFIC
    [1985, 'U', 'HSRP',        'routing', 'Cisco HSRP — Hot Standby Router Protocol',  '',                 '1985'],
    [3222, 'U', 'GLBP',        'routing', 'Cisco GLBP — Gateway Load Balancing',       '',                 '3222'],
    [4786, 'T', 'Cisco-WSMA',  'cisco',   'Cisco WSMA — Web Services Management Agent','',                 '4786'],
    [7200, 'U', 'Cisco-GRE',   'cisco',   'Cisco GRE keepalives (some implementations)','gre',             ''],
    [9995, 'U', 'NetFlow-v9',  'mgmt',    'NetFlow v9 / IPFIX export to collector',     '',                 '9995'],
    [2055, 'U', 'NetFlow-v5',  'mgmt',    'NetFlow v5 export — legacy',                 '',                 '2055'],
    [6343, 'U', 'sFlow',       'mgmt',    'sFlow — wire-rate traffic sampling',         '',                 '6343'],
    [830,  'T', 'NETCONF',     'cisco',   'NETCONF/YANG — already listed',              '',                 ''],
    // ── MISC IMPORTANT
    [111,  'B', 'RPCbind',     'net',     'ONC RPC portmapper (NFS prerequisite)',      'rpcap',            '111'],
    [2049, 'B', 'NFS',         'storage', 'Network File System',                        'nfs',              '2049'],
    [3389, 'T', 'RDP',         'windows', 'Remote Desktop Protocol — Windows remote desktop','rdp',         '3389'],
    [5900, 'T', 'VNC',         'mgmt',    'Virtual Network Computing — remote desktop', 'vnc',              '5900'],
    [6000, 'T', 'X11',         'net',     'X Window System — remote display',           '',                 '6000'],
    [9418, 'T', 'Git',         'net',     'Git protocol — git:// clone/fetch',          '',                 '9418'],
    [11211,'B', 'Memcached',   'db',      'Memcached — distributed memory cache',       '',                 '11211'],
    [5672, 'T', 'AMQP',        'net',     'Advanced Message Queuing Protocol (RabbitMQ)','',               '5672'],
    [5671, 'T', 'AMQPS',       'net',     'AMQP over TLS',                              '',                 '5671'],
    [9092, 'T', 'Kafka',       'net',     'Apache Kafka broker',                        '',                 '9092'],
    [2181, 'T', 'ZooKeeper',   'net',     'Apache ZooKeeper client port',               '',                 '2181'],
    [1883, 'T', 'MQTT',        'iot',     'MQTT — IoT messaging protocol',              '',                 '1883'],
    [8883, 'T', 'MQTTS',       'iot',     'MQTT over TLS',                              '',                 '8883'],
    [5683, 'U', 'CoAP',        'iot',     'Constrained Application Protocol — IoT',     '',                 '5683'],
  ];

  // ── Category config
  const CATS = {
    all:     { label: 'All',         color: 'var(--text)' },
    net:     { label: 'Network',     color: 'var(--cyan)' },
    routing: { label: 'Routing',     color: 'var(--green)' },
    web:     { label: 'Web',         color: 'var(--blue)' },
    email:   { label: 'Email',       color: 'var(--amber)' },
    mgmt:    { label: 'Mgmt/Mon',    color: 'var(--purple)' },
    vpn:     { label: 'VPN',         color: 'var(--cyan)' },
    tunnel:  { label: 'Tunnels',     color: 'var(--blue)' },
    voip:    { label: 'VoIP',        color: 'var(--amber)' },
    auth:    { label: 'Auth',        color: 'var(--green)' },
    windows: { label: 'Windows',     color: 'var(--blue)' },
    cisco:   { label: 'Cisco',       color: 'var(--amber)' },
    security:{ label: 'Security',    color: 'var(--red)' },
    db:      { label: 'Database',    color: 'var(--purple)' },
    cloud:   { label: 'Cloud/K8s',   color: 'var(--cyan)' },
    storage: { label: 'Storage',     color: 'var(--muted2)' },
    iot:     { label: 'IoT',         color: 'var(--green)' },
  };

  let portState = { query: '', cat: 'all', proto: 'all' };

  function filterPorts() {
    const q   = portState.query.toLowerCase();
    const cat = portState.cat;
    const prt = portState.proto;

    // Deduplicate on port+proto+service (remove exact dupes from the raw data)
    const seen  = new Set();
    const deduped = PORTS.filter(p => {
      const key = `${p[0]}-${p[1]}-${p[2]}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return deduped.filter(p => {
      if (cat !== 'all' && p[3] !== cat) return false;
      if (prt !== 'all') {
        if (prt === 'T' && p[1] !== 'T' && p[1] !== 'B') return false;
        if (prt === 'U' && p[1] !== 'U' && p[1] !== 'B') return false;
      }
      if (!q) return true;
      return String(p[0]).includes(q) ||
             p[2].toLowerCase().includes(q) ||
             p[4].toLowerCase().includes(q) ||
             p[5].toLowerCase().includes(q);
    });
  }

  function protoColor(p) {
    return p === 'T' ? 'var(--blue)' : p === 'U' ? 'var(--amber)' : 'var(--cyan)';
  }
  function protoLabel(p) {
    return p === 'T' ? 'TCP' : p === 'U' ? 'UDP' : 'TCP+UDP';
  }

  window.portSearch = function () {
    const inp = document.getElementById('port-search');
    portState.query = inp ? inp.value : '';
    portRender();
  };

  window.portSetCat = function (cat) {
    portState.cat = cat;
    document.querySelectorAll('.port-cat-btn').forEach(b => b.classList.toggle('active', b.dataset.cat === cat));
    portRender();
  };

  window.portSetProto = function (p) {
    portState.proto = p;
    document.querySelectorAll('.port-proto-btn').forEach(b => b.classList.toggle('active', b.dataset.p === p));
    portRender();
  };

  window.portCopyACL = function (port, proto, service) {
    const p   = proto === 'U' ? 'udp' : 'tcp';
    const txt = `permit ${p} any any eq ${port}  ! ${service}`;
    navigator.clipboard.writeText(txt).then(() => {
      const el = document.getElementById(`port-acl-${port}-${proto}`);
      if (el) { const orig = el.textContent; el.textContent = '✓'; setTimeout(() => el.textContent = orig, 1500); }
    });
  };

  function portRender() {
    const el = document.getElementById('port-table');
    if (!el) return;
    const rows = filterPorts();

    if (!rows.length) {
      el.innerHTML = `<div style="text-align:center;padding:24px;color:var(--muted);font-family:var(--mono);font-size:12px;">No ports match your filter.</div>`;
      document.getElementById('port-count').textContent = '0 results';
      return;
    }

    document.getElementById('port-count').textContent = `${rows.length} port${rows.length !== 1 ? 's' : ''}`;

    el.innerHTML = `
      <table style="width:100%;border-collapse:collapse;font-size:12px;">
        <thead>
          <tr style="border-bottom:2px solid var(--border);">
            <th style="text-align:left;padding:8px 10px;font-family:var(--mono);font-size:9px;color:var(--muted);font-weight:700;width:60px;">PORT</th>
            <th style="text-align:left;padding:8px 10px;font-family:var(--mono);font-size:9px;color:var(--muted);font-weight:700;width:70px;">PROTO</th>
            <th style="text-align:left;padding:8px 10px;font-family:var(--mono);font-size:9px;color:var(--muted);font-weight:700;width:130px;">SERVICE</th>
            <th style="text-align:left;padding:8px 10px;font-family:var(--mono);font-size:9px;color:var(--muted);font-weight:700;">DESCRIPTION</th>
            <th style="text-align:left;padding:8px 10px;font-family:var(--mono);font-size:9px;color:var(--muted);font-weight:700;width:120px;">WIRESHARK</th>
            <th style="padding:8px 10px;width:36px;"></th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(p => {
            const catCfg  = CATS[p[3]] || CATS.all;
            const wsFilter = p[5] ? `<code style="font-size:10px;color:var(--green);cursor:pointer;" onclick="navigator.clipboard.writeText('${p[5]}')" title="Click to copy Wireshark filter">${p[5]}</code>` : '<span style="color:var(--muted);">—</span>';
            return `
              <tr style="border-bottom:1px solid rgba(255,255,255,0.04);" onmouseover="this.style.background='var(--bg3)'" onmouseout="this.style.background=''">
                <td style="padding:8px 10px;font-family:var(--mono);font-size:13px;font-weight:700;color:var(--text);">${p[0]}</td>
                <td style="padding:8px 10px;">
                  <span style="font-family:var(--mono);font-size:10px;font-weight:700;color:${protoColor(p[1])};background:${protoColor(p[1])}20;padding:2px 7px;border-radius:4px;">${protoLabel(p[1])}</span>
                </td>
                <td style="padding:8px 10px;font-family:var(--mono);font-size:11px;color:var(--amber);font-weight:600;">${p[2]}</td>
                <td style="padding:8px 10px;color:var(--muted2);line-height:1.5;">
                  ${p[4]}
                  <span style="font-size:9px;color:${catCfg.color};background:${catCfg.color}20;padding:1px 6px;border-radius:4px;margin-left:5px;font-family:var(--mono);">${catCfg.label}</span>
                </td>
                <td style="padding:8px 10px;">${wsFilter}</td>
                <td style="padding:8px 10px;">
                  <button id="port-acl-${p[0]}-${p[1]}" onclick="portCopyACL(${p[0]},'${p[1]}','${p[2]}')"
                    title="Copy Cisco ACL line"
                    style="background:var(--bg2);border:1px solid var(--border);color:var(--muted2);padding:3px 7px;border-radius:5px;font-size:10px;font-family:var(--mono);cursor:pointer;">📋</button>
                </td>
              </tr>`;
          }).join('')}
        </tbody>
      </table>`;
  }

  // ── INIT
  function portsInit() {
    const page = document.getElementById('page-ports');
    if (!page) return;

    const catBtns = Object.entries(CATS).map(([k, v]) =>
      `<button class="port-cat-btn speed-btn${k === 'all' ? ' active' : ''}" data-cat="${k}" onclick="portSetCat('${k}')" style="color:${v.color};margin:2px;">${v.label}</button>`
    ).join('');

    page.innerHTML = `
<div class="page-hdr">
  <div class="page-title">🔌 TCP/UDP Port Reference</div>
  <div class="page-sub">230+ well-known ports for network engineers. Search by port number, service name, or keyword. Click 📋 to copy a Cisco ACL line. Click a Wireshark filter to copy it.</div>
</div>

<div class="card">
  <div class="card-hdr">🔍 Search & Filter</div>
  <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px;align-items:center;">
    <input id="port-search" type="text" autocomplete="off" spellcheck="false"
      placeholder="Port number, service name, or keyword (e.g. 443, BGP, VPN, syslog)…"
      oninput="portSearch()"
      style="flex:1;min-width:200px;background:var(--bg3);border:1px solid var(--border);color:var(--text);padding:10px 14px;border-radius:8px;font-family:var(--mono);font-size:13px;outline:none;">
    <span id="port-count" style="font-family:var(--mono);font-size:11px;color:var(--muted);white-space:nowrap;"></span>
  </div>

  <div style="margin-bottom:8px;">
    <div style="font-family:var(--mono);font-size:9px;font-weight:700;color:var(--muted);letter-spacing:1px;margin-bottom:5px;">PROTOCOL</div>
    <div class="speed-group">
      ${[['all','All'],['T','TCP'],['U','UDP']].map(([p,l]) =>
        `<button class="port-proto-btn speed-btn${p==='all'?' active':''}" data-p="${p}" onclick="portSetProto('${p}')">${l}</button>`
      ).join('')}
    </div>
  </div>

  <div>
    <div style="font-family:var(--mono);font-size:9px;font-weight:700;color:var(--muted);letter-spacing:1px;margin-bottom:5px;">CATEGORY</div>
    <div style="display:flex;flex-wrap:wrap;gap:3px;">${catBtns}</div>
  </div>
</div>

<div class="card" style="margin-top:14px;padding:0;overflow:hidden;">
  <div style="padding:12px 14px;border-bottom:1px solid var(--border);">
    <span class="card-hdr" style="display:inline;">🔌 Port Table</span>
    <span style="font-size:10px;color:var(--muted);margin-left:10px;">Wireshark filter: click to copy &nbsp;·&nbsp; 📋: copy Cisco ACL permit line</span>
  </div>
  <div id="port-table" style="overflow-x:auto;"></div>
</div>

<div class="card" style="margin-top:14px;">
  <div class="card-hdr">📚 Quick Reference</div>
  <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:8px;font-size:11px;color:var(--muted2);">
    <div style="background:var(--bg3);border-radius:8px;padding:12px;">
      <div style="font-family:var(--mono);font-size:9px;font-weight:700;color:var(--blue);margin-bottom:6px;">WELL-KNOWN (0–1023)</div>
      Assigned by IANA. Require root/admin to bind. Core protocols — DNS 53, HTTP 80, BGP 179, SNMP 161.
    </div>
    <div style="background:var(--bg3);border-radius:8px;padding:12px;">
      <div style="font-family:var(--mono);font-size:9px;font-weight:700;color:var(--cyan);margin-bottom:6px;">REGISTERED (1024–49151)</div>
      IANA-registered for specific services. Applications use these. SQL 1433, RDP 3389, BGP 179.
    </div>
    <div style="background:var(--bg3);border-radius:8px;padding:12px;">
      <div style="font-family:var(--mono);font-size:9px;font-weight:700;color:var(--amber);margin-bottom:6px;">EPHEMERAL (49152–65535)</div>
      Dynamically assigned by OS for outbound connections. Cisco ACLs need <code>established</code> or <code>range 1024 65535</code>.
    </div>
    <div style="background:var(--bg3);border-radius:8px;padding:12px;">
      <div style="font-family:var(--mono);font-size:9px;font-weight:700;color:var(--green);margin-bottom:6px;">CISCO ACL TIP</div>
      <code style="font-size:10px;line-height:1.8;">permit tcp any any eq 443<br>permit udp any any eq 53<br>permit tcp any established</code>
    </div>
  </div>
</div>`;

    portRender();
  }

  document.addEventListener('DOMContentLoaded', portsInit);
})();
