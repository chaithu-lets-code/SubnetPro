// ═══════════════════════════════════════════════════════════════════════════
// BGP REGULAR EXPRESSIONS TOOL  ·  bgp-regex.js
// SubnetLab Pro — Chaithanya Kumar Katari
// Features: Live Tester · Visual Builder · Challenge Mode · Cheat Sheet
// Improvements: 4-byte ASN · AS_SET paths · Regex History · Explain My Regex
//               Drag-and-drop Builder · Fixed brCiscoToJS · Copy IOS buttons
//               Persistent Saved Patterns · Diff Summary in Challenges
//               More Challenges · 4-byte ASN Cheat Sheet section
// Entry: bgpRegexInit()
// ═══════════════════════════════════════════════════════════════════════════

// ─── STATE ───────────────────────────────────────────────────────────────────
let brTab              = 'tester';
let brBuilderParts     = [];
let brBuilderDragIdx   = null;
let brChallengeIdx     = 0;
let brChallengeScore   = { correct: 0, attempted: 0 };
let brChallengeAnswered = false;
let brRegexHistory     = [];        // improvement #3 — history
let brSavedPatterns    = [];        // improvement #9 — saved patterns

// ─── STORAGE HELPERS ─────────────────────────────────────────────────────────
function brStorageLoad() {
  try {
    const h = localStorage.getItem('br_history');
    const s = localStorage.getItem('br_saved');
    if (h) brRegexHistory  = JSON.parse(h);
    if (s) brSavedPatterns = JSON.parse(s);
  } catch(e) {}
}
function brStorageSave() {
  try {
    localStorage.setItem('br_history',  JSON.stringify(brRegexHistory.slice(0, 20)));
    localStorage.setItem('br_saved',    JSON.stringify(brSavedPatterns));
  } catch(e) {}
}
function brHistoryPush(pattern) {
  if (!pattern) return;
  brRegexHistory = [pattern, ...brRegexHistory.filter(p => p !== pattern)].slice(0, 15);
  brStorageSave();
}

// ─── AS-PATH SAMPLE DATA (expanded: #1 — more sample paths) ──────────────────
const BR_SAMPLE_PATHS = [
  // Original paths
  { path: '',                  desc: 'Locally originated (empty AS path)' },
  { path: '100',               desc: 'Single-hop: directly from AS 100' },
  { path: '200',               desc: 'Single-hop: directly from AS 200' },
  { path: '65001',             desc: 'Private AS (eBGP customer)' },
  { path: '100 200',           desc: 'Learned via AS 100, originated in AS 200' },
  { path: '100 200 300',       desc: 'Three-hop path through AS 100 → 200 → 300' },
  { path: '200 300',           desc: 'Learned via AS 200, originated in AS 300' },
  { path: '100 200 65001',     desc: 'Transit via AS 100, 200 into private AS' },
  { path: '300 200 100',       desc: 'Originated in AS 100, transits 200, 300' },
  { path: '65001 65002',       desc: 'Private-to-private path' },
  { path: '100 300',           desc: 'AS 100 → AS 300 (skips 200)' },
  { path: '1000 2000 3000',    desc: 'Large ASN path: 1000 → 2000 → 3000' },
  { path: '100 100 200',       desc: 'AS 100 prepended twice before AS 200' },
  { path: '400',               desc: 'Single-hop: directly from AS 400' },
  { path: '400 500 600',       desc: 'Path through AS 400 → 500 → 600' },
  { path: '100 200 300 400',   desc: 'Four-hop path' },
  { path: '65100',             desc: 'Private AS range (65000–65535)' },
  { path: '200 65001',         desc: 'Transit via AS 200 into private AS' },
  // New paths for improvement #1
  { path: '64512',             desc: '4-byte private ASN (64512)' },
  { path: '131072',            desc: '4-byte public ASN (131072)' },
  { path: '4200000000',        desc: '4-byte private ASN — very large (4200000000)' },
  { path: '100 131072 200',    desc: '4-byte ASN 131072 as transit' },
  { path: '{100 200}',         desc: 'AS_SET: aggregate with AS 100 and AS 200' },
  { path: '300 {100 200}',     desc: 'Path with AS_SET at origin' },
  { path: '100 100 100 100 100', desc: 'AS 100 heavily prepended (5×)' },
  { path: '100 200 300 400 500', desc: 'Five-hop path' },
  { path: '65535',             desc: 'Last private ASN (65535)' },
  { path: '64496 64511',       desc: 'Documentation ASNs (RFC 5398)' },
];

// ─── REGEX SYMBOL REFERENCE ──────────────────────────────────────────────────
const BR_SYMBOLS = [
  { sym: '^',    name: 'Start anchor',       desc: 'Match at the beginning of the AS path. Routes originated by the directly connected neighbor.' },
  { sym: '$',    name: 'End anchor',         desc: 'Match at the end of the AS path. A lone $ matches locally originated routes (empty path).' },
  { sym: '_',    name: 'Delimiter',          desc: 'Matches any AS path delimiter: space, comma, start-of-string, end-of-string, or { }. This is the most Cisco-specific BGP regex character.' },
  { sym: '.',    name: 'Any character',      desc: 'Matches any single character (including digits and spaces). Use cautiously — often combined with * or +.' },
  { sym: '*',    name: 'Zero or more',       desc: 'The preceding element zero or more times. .* matches anything (including empty string).' },
  { sym: '+',    name: 'One or more',        desc: 'The preceding element one or more times. [0-9]+ matches any ASN.' },
  { sym: '?',    name: 'Zero or one',        desc: 'The preceding element is optional. Makes a character or group optional.' },
  { sym: '[ ]',  name: 'Character class',    desc: 'Match any one character inside the brackets. [0-9] matches any digit. [^0-9] matches any non-digit.' },
  { sym: '( )',  name: 'Grouping',           desc: 'Groups a subexpression. Used with |, *, +, ? for complex patterns.' },
  { sym: '|',    name: 'Alternation (OR)',   desc: 'Match either the left or right expression. (100|200) matches AS 100 or AS 200.' },
  { sym: '{n,m}',name: 'Repetition range',   desc: 'Match the preceding element between n and m times. [0-9]{1,5} matches an ASN of 1 to 5 digits.' },
];

// ─── CHEAT SHEET DATA (improvement #4 — 4-byte ASN section added) ─────────────
const BR_CHEATSHEET = [
  {
    category: 'Origin & Neighbor',
    color: 'var(--green)',
    bg: 'rgba(74,222,128,0.08)',
    items: [
      { regex: '^$',           desc: 'Locally originated routes (empty AS path — your own networks)',           ios: 'ip as-path access-list 1 permit ^$' },
      { regex: '^100_',        desc: 'Routes learned directly from AS 100 (AS 100 is the first AS)',            ios: 'ip as-path access-list 1 permit ^100_' },
      { regex: '_100$',        desc: 'Routes originated in AS 100 (AS 100 is the last in the path)',            ios: 'ip as-path access-list 1 permit _100$' },
      { regex: '^100$',        desc: 'Routes received from AS 100 and originated by AS 100 (single hop)',       ios: 'ip as-path access-list 1 permit ^100$' },
    ]
  },
  {
    category: 'Transit & Filtering',
    color: 'var(--blue)',
    bg: 'rgba(91,156,246,0.08)',
    items: [
      { regex: '.*',           desc: 'Match ALL AS paths (permit any — use for catch-all permit)',              ios: 'ip as-path access-list 1 permit .*' },
      { regex: '^[0-9]+$',     desc: 'Routes with exactly ONE AS in the path (directly connected neighbor)',    ios: 'ip as-path access-list 1 permit ^[0-9]+$' },
      { regex: '^_100_.*_200_',desc: 'Path must pass through AS 100 AND AS 200 (in that order)',                ios: 'ip as-path access-list 1 permit ^_100_.*_200_' },
      { regex: '_200_',        desc: 'AS 200 appears anywhere in the path (transit through AS 200)',            ios: 'ip as-path access-list 1 permit _200_' },
    ]
  },
  {
    category: 'Private AS Handling',
    color: 'var(--amber)',
    bg: 'rgba(251,191,36,0.08)',
    items: [
      { regex: '_6[5-9][0-9]{3}_|_6[5-9][0-9]{3}$|^6[5-9][0-9]{3}_',
        desc: 'Routes containing private ASNs (65000–65535) — use to detect or strip private AS',
        ios: 'ip as-path access-list 10 permit _6[5-9][0-9]{3}_' },
      { regex: '^65',          desc: 'Routes where the first AS starts with 65 (likely a private AS customer)',  ios: 'ip as-path access-list 1 permit ^65' },
      { regex: '_65[0-9]{3}$', desc: 'Routes originated inside a private ASN (last AS is private)',             ios: 'ip as-path access-list 1 permit _65[0-9]{3}$' },
    ]
  },
  {
    category: 'AS Path Length',
    color: 'var(--cyan)',
    bg: 'rgba(56,217,192,0.08)',
    items: [
      { regex: '^[0-9]+$',                 desc: 'Exactly 1 AS hop',          ios: 'ip as-path access-list 1 permit ^[0-9]+$' },
      { regex: '^[0-9]+ [0-9]+$',          desc: 'Exactly 2 AS hops',         ios: 'ip as-path access-list 1 permit ^[0-9]+ [0-9]+$' },
      { regex: '^([0-9]+ ){0,2}[0-9]+$',   desc: 'Paths up to 3 hops long',   ios: 'ip as-path access-list 1 permit ^([0-9]+ ){0,2}[0-9]+$' },
      { regex: '^([0-9]+ ){4,}[0-9]+$',    desc: 'Paths 5 or more hops long', ios: 'ip as-path access-list 1 permit ^([0-9]+ ){4,}[0-9]+$' },
    ]
  },
  {
    category: 'AS Prepending Detection',
    color: 'var(--pink)',
    bg: 'rgba(244,114,182,0.08)',
    items: [
      { regex: '(^| )([0-9]+)( \\2)+',   desc: 'Detect any repeated AS (AS prepending present in path)',       ios: '! Use route-map + as-path filter to match prepended routes' },
      { regex: '^(100 )+100$',            desc: 'AS 100 prepended multiple times — all hops are AS 100',        ios: 'ip as-path access-list 1 permit ^(100 )+100$' },
    ]
  },
  // improvement #4 — new 4-byte ASN section
  {
    category: '4-Byte ASN (ASN32 / RFC 6793)',
    color: 'var(--purple)',
    bg: 'rgba(168,85,247,0.08)',
    items: [
      { regex: '^[0-9]{5,10}$',
        desc: 'Single-hop path with a 4-byte (5–10 digit) ASN',
        ios: 'ip as-path access-list 1 permit ^[0-9]{5,10}$' },
      { regex: '_[0-9]{5,10}_',
        desc: '4-byte ASN appears anywhere in the path (transit)',
        ios: 'ip as-path access-list 1 permit _[0-9]{5,10}_' },
      { regex: '^(42[0-9]{8}|4[3-2][0-9]{8})_',
        desc: 'Routes from 4-byte private ASN range 4200000000–4294967294 (RFC 6996)',
        ios: 'ip as-path access-list 10 permit ^42[0-9]{8}_' },
      { regex: '^6451[2-9]_|^645[2-9][0-9]_|^64[6-9][0-9]{2}_|^65[0-4][0-9]{2}_|^655[0-2][0-9]_|^6553[0-5]_',
        desc: 'Routes from 16-bit private ASN range 64512–65535 as first hop',
        ios: 'ip as-path access-list 10 permit ^6451[2-9]_' },
      { regex: '^[0-9]+\\.[0-9]+$',
        desc: 'ASN in dot notation (asdot format, e.g. 1.65000)',
        ios: 'ip as-path access-list 1 permit ^[0-9]+\\.[0-9]+$' },
    ]
  },
];

// ─── CHALLENGE DATA (improvement #2 — more challenges added) ─────────────────
const BR_CHALLENGES = [
  {
    id: 1, level: 'CCNA',
    goal: 'Match ONLY locally originated routes (routes generated by this router — empty AS path).',
    hint: 'An empty AS path has a start ^ and an end $ with nothing between them.',
    answer: '^$',
    accept: ['^$'],
    explain: '^ anchors to the start, $ anchors to the end. With nothing between them, this matches only an empty string — which is exactly what a locally originated route\'s AS path looks like on the originating router.'
  },
  {
    id: 2, level: 'CCNA',
    goal: 'Match all routes learned DIRECTLY from AS 100 (AS 100 must be the first AS in the path).',
    hint: 'Use the start anchor ^ followed by the ASN, then _ as a delimiter.',
    answer: '^100_',
    accept: ['^100_', '^100 ', '^100$'],
    explain: '^100_ means the path must start with AS 100 followed by any BGP delimiter (space, end, comma). This catches routes where AS 100 is your directly connected eBGP neighbor.'
  },
  {
    id: 3, level: 'CCNA',
    goal: 'Match routes ORIGINATED inside AS 200 (AS 200 must be the last AS in the path).',
    hint: 'Use the _ delimiter before the ASN and $ end anchor after it.',
    answer: '_200$',
    accept: ['_200$', ' 200$'],
    explain: '_200$ means AS 200 is preceded by a delimiter and sits at the very end of the AS path. The originating AS is always the rightmost (last) entry in the path.'
  },
  {
    id: 4, level: 'CCNP',
    goal: 'Match ALL AS paths — a catch-all permit that matches every route regardless of path.',
    hint: 'The dot matches any character. The asterisk means zero or more.',
    answer: '.*',
    accept: ['.*', '^.*$', '^.*'],
    explain: '.* means "any character, zero or more times." Since an AS path can be empty or any length, .* is the universal match-all regex in BGP. This is used as the last entry in a route-map to permit everything remaining.'
  },
  {
    id: 5, level: 'CCNP',
    goal: 'Match only routes with exactly ONE AS hop in the path (single AS — direct eBGP neighbor that also originated the prefix).',
    hint: 'Use [0-9]+ to match one ASN. Anchor both ends with ^ and $.',
    answer: '^[0-9]+$',
    accept: ['^[0-9]+$'],
    explain: '^[0-9]+$ means start of string, one or more digits, end of string — no spaces allowed. Since spaces separate ASNs, this matches a path with exactly one ASN (one hop).'
  },
  {
    id: 6, level: 'CCNP',
    goal: 'Match routes that pass THROUGH AS 200 anywhere in the path (AS 200 is a transit AS).',
    hint: 'Use _ on both sides of the ASN so it matches AS 200 as a complete token, not just the digits.',
    answer: '_200_',
    accept: ['_200_'],
    explain: '_200_ uses the BGP delimiter _ on both sides, ensuring AS 200 is matched as a complete ASN anywhere in the path. Without the underscores, a pattern like 200 would also match AS 2001 or AS 1200.'
  },
  {
    id: 7, level: 'CCIE',
    goal: 'Match routes received from AS 100 that were ORIGINATED in AS 300 (path goes: 100 → ... → 300).',
    hint: 'The first AS must be 100 (use ^100_) and the last AS must be 300 (use _300$). Allow anything in between.',
    answer: '^100_.*_300$',
    accept: ['^100_.*_300$', '^100 .*300$', '^100_.+_300$'],
    explain: '^100_ anchors AS 100 as the neighbor. .* allows any number of transit ASes in between. _300$ ensures AS 300 is the originating (last) AS. This is a classic inter-domain policy pattern.'
  },
  {
    id: 8, level: 'CCIE',
    goal: 'Match routes containing private ASNs (65000–65535) anywhere in the path. Used to detect customer routes with private AS leaking into the internet.',
    hint: 'Private ASNs start with 65. The range is 65000–65535. Use character classes and repetition.',
    answer: '_6[5-9][0-9]{3}_',
    accept: ['_6[5-9][0-9]{3}_', '(^|_)6[5-9][0-9]{3}(_|$)', '_65[0-9]{3}_'],
    explain: '_6[5-9][0-9]{3}_ matches a 5-digit ASN starting with 65, 66, 67, 68, or 69 (the private range 65000–69999 — though technically only 65000–65535 are private, this catches the full 6xxxx range). The _ delimiters ensure it matches a complete ASN token.'
  },
  // improvement #2 — new challenges
  {
    id: 9, level: 'CCNP',
    goal: 'Match routes with EXACTLY 4 AS hops in the path (four ASNs separated by spaces).',
    hint: 'Each hop is [0-9]+. Use ^ and $ to anchor. Three spaces means four ASNs.',
    answer: '^[0-9]+ [0-9]+ [0-9]+ [0-9]+$',
    accept: ['^[0-9]+ [0-9]+ [0-9]+ [0-9]+$', '^([0-9]+ ){3}[0-9]+$'],
    explain: '^[0-9]+ [0-9]+ [0-9]+ [0-9]+$ anchors both ends and requires exactly four ASN tokens separated by spaces. ^([0-9]+ ){3}[0-9]+$ is the more concise equivalent using a repeat group — both are correct.'
  },
  {
    id: 10, level: 'CCNP',
    goal: 'Match routes with 5 OR MORE AS hops (paths that are long — useful for detecting BGP route leaks or poorly optimized paths).',
    hint: 'Five or more hops means at least four spaces. Use a repeat group like ([0-9]+ ) and set a minimum count with {4,}.',
    answer: '^([0-9]+ ){4,}[0-9]+$',
    accept: ['^([0-9]+ ){4,}[0-9]+$'],
    explain: '^([0-9]+ ){4,} means "four or more repetitions of an ASN-followed-by-space" — that accounts for hops 1–4. The final [0-9]+$ matches the 5th (or later) hop without a trailing space. This pattern is used in route-maps to prefer shorter AS paths or filter excessively long ones.'
  },
  {
    id: 11, level: 'CCIE',
    goal: 'Match routes that transit BOTH AS 100 and AS 200, in that order (AS 100 must come before AS 200).',
    hint: 'Chain two _AS_ patterns with .* between them. The first _ anchors AS 100 after a delimiter, .* allows anything in between, then _AS 200_.',
    answer: '_100_.*_200_',
    accept: ['_100_.*_200_', '^100_.*_200_', '^100 .*200'],
    explain: '_100_.*_200_ ensures AS 100 appears first (surrounded by delimiters), then anything (.*), then AS 200 surrounded by delimiters. This is a strict ordered AND match — it will NOT match paths where AS 200 comes before AS 100.'
  },
  {
    id: 12, level: 'CCIE',
    goal: 'Match routes where any ASN is REPEATED (AS path prepending detected). The same AS number appears more than once anywhere in the path.',
    hint: 'Use a backreference. Capture an ASN with ([0-9]+), then match a space and the same group again with \\1 (or \\2 depending on nesting).',
    answer: '([0-9]+) \\1',
    accept: ['([0-9]+) \\1', '(^| )([0-9]+)( \\2)+', '([0-9]+) ([0-9]+ )*\\1'],
    explain: '([0-9]+) \\1 captures any ASN and then checks if the same value appears again after a space — a backreference. This detects AS prepending without needing to know which specific AS is being prepended. It works on Cisco IOS and is commonly used in route-maps to detect inbound prepending from peers.'
  },
  {
    id: 13, level: 'CCIE',
    goal: 'Match routes where AS 100 originated the prefix AND it passed through exactly one transit AS before reaching you (path length = 2: neighbor_AS + 100).',
    hint: 'Exactly 2 hops means one ASN, one space, then AS 100 at the end. Anchor both sides.',
    answer: '^[0-9]+ 100$',
    accept: ['^[0-9]+ 100$', '^[0-9]+_100$'],
    explain: '^[0-9]+ 100$ means: start of path, any ASN (the directly connected neighbor), one space, then 100 at the end of path. This is a two-hop path where your neighbor is any AS and the originator is AS 100. Useful to set a specific local-preference for routes from a particular origin AS received via any single transit.'
  },
];

// ─── BUILDER BLOCKS ──────────────────────────────────────────────────────────
const BR_BUILDER_BLOCKS = [
  { label: '^',        val: '^',        tip: 'Start of path',       color: 'var(--green)' },
  { label: '$',        val: '$',        tip: 'End of path',         color: 'var(--green)' },
  { label: '_',        val: '_',        tip: 'Any delimiter',       color: 'var(--cyan)' },
  { label: '.*',       val: '.*',       tip: 'Match anything',      color: 'var(--amber)' },
  { label: '[0-9]+',   val: '[0-9]+',   tip: 'Any ASN',             color: 'var(--blue)' },
  { label: 'ASN',      val: '__ASN__',  tip: 'Type a specific ASN', color: 'var(--blue)' },
  { label: '|',        val: '|',        tip: 'OR',                  color: 'var(--pink)' },
  { label: '( )',      val: '(__)',      tip: 'Group',               color: 'var(--purple)' },
  { label: '{n,m}',    val: '{__,__}',  tip: 'Repeat range',        color: 'var(--amber)' },
  { label: ' ',        val: ' ',        tip: 'Space (AS separator)', color: 'var(--muted)' },
  { label: '⌫',        val: '__DEL__',  tip: 'Remove last block',   color: 'var(--red)' },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

// improvement #7 — fixed brCiscoToJS using non-capturing groups and correct edge handling
function brCiscoToJS(pattern) {
  // _ in Cisco BGP regex = any delimiter: space, comma, braces, start/end of string
  // Use non-capturing (?:...) for performance; handle _ correctly at all positions
  const jsPattern = pattern.replace(/_/g, '(?:^|$|[ ,{}])');
  try {
    return new RegExp(jsPattern);
  } catch(e) {
    return null;
  }
}

function brMatchPath(jsRegex, path) {
  if (!jsRegex) return false;
  try { return jsRegex.test(path); } catch(e) { return false; }
}

function brValidateRegex(pattern) {
  if (!pattern) return { valid: false, err: 'Empty pattern' };
  try {
    // improvement #7 — use same non-capturing group fix
    const jsPattern = pattern.replace(/_/g, '(?:^|$|[ ,{}])');
    new RegExp(jsPattern);
    return { valid: true };
  } catch(e) {
    return { valid: false, err: e.message };
  }
}

function brLevelColor(level) {
  return level === 'CCNA' ? 'var(--green)' : level === 'CCNP' ? 'var(--blue)' : 'var(--pink)';
}
function brLevelBg(level) {
  return level === 'CCNA' ? 'rgba(74,222,128,0.12)' : level === 'CCNP' ? 'rgba(91,156,246,0.12)' : 'rgba(244,114,182,0.12)';
}

// improvement #5 — plain-English regex explainer
function brExplainRegex(pattern) {
  if (!pattern) return '';
  const parts = [];
  let p = pattern;

  // Anchors
  const hasStart = p.startsWith('^');
  const hasEnd   = p.endsWith('$') && !p.endsWith('\\$');
  if (hasStart && hasEnd && p === '^$') return 'Matches ONLY empty AS paths — locally originated routes.';
  if (hasStart) parts.push('path must START with the following');
  if (hasEnd)   parts.push('path must END with the preceding element');

  // Common full patterns
  if (p === '.*')  return 'Matches ALL routes regardless of AS path (universal permit).';
  if (p === '^[0-9]+$') return 'Matches paths with exactly ONE ASN — single-hop routes from a directly connected eBGP neighbor that also originated the prefix.';

  const clauses = [];

  // Backreference — prepending
  if (/\(.*\).*\\[0-9]/.test(p)) clauses.push('detects repeated ASNs (AS prepending)');

  // Start anchor + specific ASN
  const startAsn = p.match(/^\^(\d+)_/);
  if (startAsn) clauses.push(`routes received directly from AS ${startAsn[1]} (first hop)`);

  // End anchor + specific ASN
  const endAsn = p.match(/_(\d+)\$$/) ;
  if (endAsn) clauses.push(`routes originated inside AS ${endAsn[1]} (last AS in path)`);

  // Transit ASN (surrounded by _)
  const transitMatches = [...p.matchAll(/_(\d+)_/g)];
  transitMatches.forEach(m => clauses.push(`AS ${m[1]} appears as a transit AS anywhere in the path`));

  // Lone _ at start => after any delimiter
  if (p.startsWith('_') && !p.startsWith('^')) clauses.push('AS can appear at start or after any delimiter');

  // .* in middle => any number of hops in between
  if (/\.\*/.test(p) && !(/^\.\*$/.test(p))) clauses.push('any number of intermediate ASes are allowed');

  // Private AS patterns
  if (/6\[5-9\]/.test(p) || /65\[0-9\]/.test(p)) clauses.push('matches private ASNs in the 65000–65535 range');

  // Path length patterns
  const repeatGroup = p.match(/\(\[0-9\]\+ \)\{(\d+),(\d*)\}/);
  if (repeatGroup) {
    const min = repeatGroup[1], max = repeatGroup[2];
    if (max) clauses.push(`path length between ${parseInt(min)+1} and ${parseInt(max)+1} hops`);
    else clauses.push(`path length of at least ${parseInt(min)+1} hops`);
  }

  // 4-byte ASN
  if (/\[0-9\]\{5,/.test(p)) clauses.push('involves 4-byte (32-bit) ASNs with 5 or more digits');

  if (clauses.length === 0) {
    return `Matches AS paths satisfying the pattern: <code>${brEscape(pattern)}</code>. Use the symbol reference below for token details.`;
  }

  let sentence = 'This regex ' + clauses.join('; ') + '.';
  if (hasStart && !startAsn) sentence = 'Anchored to the START of path — ' + sentence;
  if (hasEnd   && !endAsn)   sentence += ' Anchored to the END of path.';
  return sentence;
}

// ─── MAIN INIT ────────────────────────────────────────────────────────────────
function bgpRegexInit() {
  const page = document.getElementById('page-bgp-regex');
  if (!page) return;
  brStorageLoad();
  brInjectStyles();
  page.innerHTML = brShell();
  brSwitchTab('tester');
}

// ─── SHELL HTML ───────────────────────────────────────────────────────────────
function brShell() {
  return `
<div class="br-wrap">

  <!-- HEADER -->
  <div class="page-header" style="margin-bottom:20px">
    <div>
      <div class="page-title">BGP Regular Expressions</div>
      <div class="page-desc">Live Tester · Visual Builder · Challenge Mode · Reference Sheet</div>
    </div>
  </div>

  <!-- TABS -->
  <div class="br-tabs">
    <button class="br-tab active" id="br-tab-tester"     onclick="brSwitchTab('tester')">🧪 Live Tester</button>
    <button class="br-tab"        id="br-tab-builder"    onclick="brSwitchTab('builder')">🔧 Regex Builder</button>
    <button class="br-tab"        id="br-tab-challenge"  onclick="brSwitchTab('challenge')">🎯 Challenge Mode</button>
    <button class="br-tab"        id="br-tab-ref"        onclick="brSwitchTab('ref')">📋 Cheat Sheet</button>
    <button class="br-tab"        id="br-tab-saved"      onclick="brSwitchTab('saved')">🔖 Saved Patterns</button>
  </div>

  <!-- TAB CONTENT -->
  <div id="br-tab-content"></div>

</div>`;
}

// ─── TAB SWITCHER ─────────────────────────────────────────────────────────────
function brSwitchTab(tab) {
  brTab = tab;
  document.querySelectorAll('.br-tab').forEach(t => {
    t.classList.toggle('active', t.id === 'br-tab-' + tab);
  });
  const content = document.getElementById('br-tab-content');
  if (!content) return;
  if (tab === 'tester')    { content.innerHTML = brTesterHTML();   brRunTest(); }
  if (tab === 'builder')   { content.innerHTML = brBuilderHTML();  brBuilderRender(); }
  if (tab === 'challenge') { content.innerHTML = brChallengeHTML(); brLoadChallenge(brChallengeIdx); }
  if (tab === 'ref')       { content.innerHTML = brRefHTML(); }
  if (tab === 'saved')     { content.innerHTML = brSavedHTML(); }
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 1 — LIVE TESTER
// ══════════════════════════════════════════════════════════════════════════════
function brTesterHTML() {
  return `
<div class="br-section">

  <!-- Quick-load preset patterns -->
  <div class="br-preset-bar">
    <span class="br-preset-label">Quick Load:</span>
    ${[
      { label: 'Locally Originated', val: '^$' },
      { label: 'From AS 100',        val: '^100_' },
      { label: 'Originated in AS 200', val: '_200$' },
      { label: 'Match All',          val: '.*' },
      { label: 'Single Hop',         val: '^[0-9]+$' },
      { label: 'Transit via AS 200', val: '_200_' },
      { label: 'Private AS',         val: '^65' },
      { label: '4-byte ASN',         val: '_[0-9]{5,10}_' },
    ].map(p => `<button class="br-preset-btn" onclick="brLoadPreset('${p.val}')">${p.label}</button>`).join('')}
  </div>

  <!-- Input row -->
  <div class="br-input-row">
    <div class="br-input-group" style="flex:2">
      <label class="br-label">BGP Regex (Cisco IOS Syntax)</label>
      <div style="position:relative;display:flex;gap:6px;align-items:center">
        <input type="text" id="br-regex-input" class="br-input" style="flex:1"
               placeholder="e.g. ^100_" oninput="brRunTest()" spellcheck="false" autocomplete="off">
        <!-- improvement #3 — history dropdown -->
        <button class="br-hist-btn" id="br-hist-toggle" onclick="brToggleHistory()" title="History">🕑</button>
        <div class="br-hist-dropdown" id="br-hist-dropdown" style="display:none"></div>
      </div>
      <div class="br-regex-err" id="br-regex-err" style="display:none"></div>
    </div>
    <div class="br-input-group" style="flex:1">
      <label class="br-label">IOS Command Preview</label>
      <div class="br-ios-preview" id="br-ios-preview">ip as-path access-list 1 permit <em>…</em></div>
    </div>
  </div>

  <!-- improvement #5 — Explain My Regex + Save button row -->
  <div style="display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap;align-items:center">
    <button class="btn btn-reset" onclick="brExplainCurrent()" style="font-size:11px;padding:5px 12px">💬 Explain My Regex</button>
    <button class="btn btn-reset" onclick="brSaveCurrent()"    style="font-size:11px;padding:5px 12px">🔖 Save Pattern</button>
    <div id="br-explain-output" style="flex:1;font-size:12px;color:var(--cyan);line-height:1.6"></div>
  </div>

  <!-- Inline symbol explainer -->
  <div class="br-symbol-row" id="br-symbol-row"></div>

  <!-- Stats bar -->
  <div class="br-stats-bar" id="br-stats-bar">
    <div class="br-stat"><span>Matched</span><em id="br-stat-match">—</em></div>
    <div class="br-stat"><span>Not Matched</span><em id="br-stat-nomatch">—</em></div>
    <div class="br-stat"><span>Match Rate</span><em id="br-stat-rate">—</em></div>
    <div class="br-stat"><span>Status</span><em id="br-stat-status">Enter a regex above</em></div>
  </div>

  <!-- Custom path input -->
  <div class="br-custom-row">
    <span class="br-label" style="white-space:nowrap">Test custom AS path:</span>
    <input type="text" id="br-custom-path" class="br-input" placeholder="e.g. 100 200 300" oninput="brRunTest()" spellcheck="false" style="flex:1">
    <div class="br-custom-result" id="br-custom-result"></div>
  </div>

  <!-- AS Path table -->
  <div class="br-table-wrap">
    <table class="br-table" id="br-path-table">
      <thead>
        <tr>
          <th style="width:34px">#</th>
          <th>AS Path</th>
          <th>Description</th>
          <th style="width:110px;text-align:center">Match</th>
        </tr>
      </thead>
      <tbody id="br-path-tbody">
        ${BR_SAMPLE_PATHS.map((p, i) => `
        <tr id="br-row-${i}">
          <td class="br-row-num">${i + 1}</td>
          <td><code class="br-path-code">${p.path || '<em style="color:var(--muted)">empty</em>'}</code></td>
          <td class="br-row-desc">${p.desc}</td>
          <td class="br-match-cell" id="br-match-${i}"><span class="br-badge br-badge-idle">—</span></td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>

  <!-- Symbol reference mini-table -->
  <div class="card" style="margin-top:20px">
    <div class="card-hdr">⚡ BGP Regex Symbol Quick Reference</div>
    <div class="br-sym-grid">
      ${BR_SYMBOLS.map(s => `
      <div class="br-sym-card">
        <div class="br-sym-token">${s.sym}</div>
        <div class="br-sym-name">${s.name}</div>
        <div class="br-sym-desc">${s.desc}</div>
      </div>`).join('')}
    </div>
  </div>

</div>`;
}

function brRunTest() {
  const input = document.getElementById('br-regex-input');
  const errEl  = document.getElementById('br-regex-err');
  const iosEl  = document.getElementById('br-ios-preview');
  if (!input) return;

  const pattern = input.value.trim();

  // Update IOS preview
  if (iosEl) {
    iosEl.innerHTML = pattern
      ? `ip as-path access-list 1 permit <strong>${brEscape(pattern)}</strong>`
      : `ip as-path access-list 1 permit <em style="color:var(--muted)">…</em>`;
  }

  // Validate
  const v = brValidateRegex(pattern);
  if (!v.valid && pattern) {
    if (errEl) { errEl.style.display = 'block'; errEl.textContent = '⚠ Invalid regex: ' + v.err; }
    input.style.borderColor = 'var(--red)';
    brResetTable();
    brUpdateStats(0, 0, 'Invalid regex');
    return;
  }
  if (errEl) { errEl.style.display = 'none'; }
  input.style.borderColor = pattern ? 'var(--blue)' : '';

  // Highlight symbols in use
  brHighlightSymbols(pattern);

  // improvement #3 — push valid non-empty patterns to history
  if (pattern && v.valid) brHistoryPush(pattern);

  if (!pattern) { brResetTable(); brUpdateStats(0, 0, 'Enter a regex above'); return; }

  const jsRegex = brCiscoToJS(pattern);
  let matched = 0, total = BR_SAMPLE_PATHS.length;

  BR_SAMPLE_PATHS.forEach((p, i) => {
    const cell = document.getElementById('br-match-' + i);
    const row  = document.getElementById('br-row-' + i);
    if (!cell || !row) return;
    const hit = brMatchPath(jsRegex, p.path);
    if (hit) { matched++; }
    cell.innerHTML = hit
      ? `<span class="br-badge br-badge-match">✓ Match</span>`
      : `<span class="br-badge br-badge-nomatch">✗ No match</span>`;
    row.classList.toggle('br-row-match',   hit);
    row.classList.toggle('br-row-nomatch', !hit);
  });

  brUpdateStats(matched, total - matched, matched + ' / ' + total + ' paths matched');

  // Custom path
  const customInput  = document.getElementById('br-custom-path');
  const customResult = document.getElementById('br-custom-result');
  if (customInput && customResult) {
    const cp = customInput.value.trim();
    if (cp) {
      const hit = brMatchPath(jsRegex, cp);
      customResult.innerHTML = hit
        ? `<span class="br-badge br-badge-match">✓ Match</span>`
        : `<span class="br-badge br-badge-nomatch">✗ No match</span>`;
    } else {
      customResult.innerHTML = '';
    }
  }

  // Clear explain output on new input
  const expOut = document.getElementById('br-explain-output');
  if (expOut) expOut.innerHTML = '';
}

function brLoadPreset(val) {
  const input = document.getElementById('br-regex-input');
  if (input) { input.value = val; brRunTest(); }
}

function brResetTable() {
  BR_SAMPLE_PATHS.forEach((_, i) => {
    const cell = document.getElementById('br-match-' + i);
    const row  = document.getElementById('br-row-' + i);
    if (cell) cell.innerHTML = `<span class="br-badge br-badge-idle">—</span>`;
    if (row)  { row.classList.remove('br-row-match', 'br-row-nomatch'); }
  });
}

function brUpdateStats(matched, notMatched, status) {
  const sm = document.getElementById('br-stat-match');
  const sn = document.getElementById('br-stat-nomatch');
  const sr = document.getElementById('br-stat-rate');
  const ss = document.getElementById('br-stat-status');
  const total = matched + notMatched;
  if (sm) sm.textContent = matched;
  if (sn) sn.textContent = notMatched;
  if (sr) sr.textContent = total ? Math.round((matched / total) * 100) + '%' : '—';
  if (ss) ss.textContent = status;
}

function brHighlightSymbols(pattern) {
  const row = document.getElementById('br-symbol-row');
  if (!row) return;
  if (!pattern) { row.innerHTML = ''; return; }
  const found = BR_SYMBOLS.filter(s => {
    const sym = s.sym.replace(/[()[\]{}]/g, '\\$&');
    try { return new RegExp(sym).test(pattern); } catch(e) { return false; }
  });
  if (!found.length) { row.innerHTML = ''; return; }
  row.innerHTML = `<span class="br-sym-hint-label">Symbols detected:</span>` +
    found.map(s => `<span class="br-sym-hint" title="${s.desc}">${s.sym} <em>${s.name}</em></span>`).join('');
}

// improvement #5 — Explain My Regex button handler
function brExplainCurrent() {
  const input  = document.getElementById('br-regex-input');
  const expOut = document.getElementById('br-explain-output');
  if (!input || !expOut) return;
  const pattern = input.value.trim();
  if (!pattern) { expOut.innerHTML = '<span style="color:var(--muted)">Enter a regex first.</span>'; return; }
  const v = brValidateRegex(pattern);
  if (!v.valid) { expOut.innerHTML = `<span style="color:var(--red)">⚠ Invalid regex — fix syntax first.</span>`; return; }
  expOut.innerHTML = `<span style="color:var(--cyan)">💬 ${brExplainRegex(pattern)}</span>`;
}

// improvement #9 — Save current pattern
function brSaveCurrent() {
  const input = document.getElementById('br-regex-input');
  if (!input || !input.value.trim()) return;
  const pattern = input.value.trim();
  const v = brValidateRegex(pattern);
  if (!v.valid) return;
  const label = prompt('Label for this saved pattern (optional):', pattern);
  if (label === null) return; // cancelled
  brSavedPatterns = brSavedPatterns.filter(s => s.pattern !== pattern);
  brSavedPatterns.unshift({ pattern, label: label || pattern, saved: Date.now() });
  brStorageSave();
  const expOut = document.getElementById('br-explain-output');
  if (expOut) expOut.innerHTML = `<span style="color:var(--green)">✓ Pattern saved to 🔖 Saved Patterns tab.</span>`;
}

// improvement #3 — History toggle
function brToggleHistory() {
  const dd = document.getElementById('br-hist-dropdown');
  if (!dd) return;
  if (dd.style.display !== 'none') { dd.style.display = 'none'; return; }
  if (!brRegexHistory.length) {
    dd.innerHTML = `<div class="br-hist-empty">No history yet</div>`;
  } else {
    dd.innerHTML = brRegexHistory.map(h =>
      `<div class="br-hist-item" onclick="brLoadPreset('${brEscapeAttr(h)}');document.getElementById('br-hist-dropdown').style.display='none'">
        <code>${brEscape(h)}</code>
        <span class="br-hist-explain">${brExplainRegex(h).slice(0, 60)}…</span>
      </div>`
    ).join('') +
    `<div class="br-hist-clear" onclick="brClearHistory()">🗑 Clear history</div>`;
  }
  dd.style.display = 'block';
}

function brClearHistory() {
  brRegexHistory = [];
  brStorageSave();
  const dd = document.getElementById('br-hist-dropdown');
  if (dd) dd.style.display = 'none';
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 2 — VISUAL BUILDER (improvement #6 — drag-and-drop reorder)
// ══════════════════════════════════════════════════════════════════════════════
function brBuilderHTML() {
  return `
<div class="br-section">
  <div class="callout callout-info" style="margin-bottom:16px">
    💡 Click blocks below to build a BGP regex visually. The regex and IOS command are generated live.
    When you click <strong>ASN</strong>, type an AS number in the prompt.
    <strong>Drag tokens</strong> in the canvas to reorder them.
  </div>

  <!-- Block palette -->
  <div class="card" style="margin-bottom:16px">
    <div class="card-hdr">🧱 Building Blocks — click to add</div>
    <div class="br-block-palette">
      ${BR_BUILDER_BLOCKS.map(b => `
      <button class="br-block-btn" style="border-color:${b.color};color:${b.color}"
              onclick="brBuilderAdd('${brEscapeAttr(b.val)}')" title="${b.tip}">
        ${b.label}
        <span class="br-block-tip">${b.tip}</span>
      </button>`).join('')}
    </div>
  </div>

  <!-- Builder canvas -->
  <div class="card" style="margin-bottom:16px">
    <div class="card-hdr">🖥 Your Regex — <span style="font-weight:400;font-size:11px;color:var(--muted)">drag tokens to reorder · click token to remove</span></div>
    <div class="br-builder-canvas" id="br-builder-canvas"
         ondragover="event.preventDefault()"
         ondrop="brBuilderDrop(event)">
      <span class="br-builder-empty" id="br-builder-empty">Click blocks above to start building…</span>
    </div>
    <div style="display:flex;gap:10px;margin-top:12px;flex-wrap:wrap;align-items:center">
      <div class="br-ios-preview" id="br-builder-ios" style="flex:1">ip as-path access-list 1 permit <em>…</em></div>
      <button class="btn btn-reset" onclick="brBuilderClear()">↺ Clear</button>
      <button class="btn btn-primary" onclick="brBuilderSendToTester()">→ Test in Live Tester</button>
    </div>
  </div>

  <!-- Builder test results -->
  <div id="br-builder-results"></div>

</div>`;
}

function brBuilderRender() {
  const canvas = document.getElementById('br-builder-canvas');
  const iosEl  = document.getElementById('br-builder-ios');
  if (!canvas) return;

  if (brBuilderParts.length === 0) {
    canvas.innerHTML = `<span class="br-builder-empty">Click blocks above to start building…</span>`;
    if (iosEl) iosEl.innerHTML = `ip as-path access-list 1 permit <em style="color:var(--muted)">…</em>`;
    const r = document.getElementById('br-builder-results');
    if (r) r.innerHTML = '';
    return;
  }

  const regex = brBuilderParts.join('');
  // improvement #6 — each token is draggable
  canvas.innerHTML = brBuilderParts.map((p, i) =>
    `<span class="br-builder-token"
       draggable="true"
       ondragstart="brBuilderDragStart(${i})"
       ondragover="event.preventDefault()"
       ondrop="event.stopPropagation();brBuilderDropOnToken(event,${i})"
       onclick="brBuilderRemoveAt(${i})"
       title="Click to remove · drag to reorder">${brEscape(p)}</span>`
  ).join('') + `<span class="br-builder-cursor">|</span>`;

  if (iosEl) {
    iosEl.innerHTML = `ip as-path access-list 1 permit <strong>${brEscape(regex)}</strong>`;
  }

  // Run test against sample paths
  const v = brValidateRegex(regex);
  const resultsEl = document.getElementById('br-builder-results');
  if (!resultsEl) return;
  if (!v.valid) {
    resultsEl.innerHTML = `<div class="callout callout-warn">⚠ Incomplete or invalid regex: ${v.err}</div>`;
    return;
  }

  const jsRegex = brCiscoToJS(regex);
  const hits   = BR_SAMPLE_PATHS.filter(p => brMatchPath(jsRegex, p.path));
  const misses = BR_SAMPLE_PATHS.filter(p => !brMatchPath(jsRegex, p.path));

  resultsEl.innerHTML = `
  <div class="br-builder-result-grid">
    <div class="card" style="border-color:rgba(74,222,128,0.3)">
      <div class="card-hdr" style="color:var(--green)">✓ Matched (${hits.length})</div>
      ${hits.length ? hits.map(p => `
        <div class="br-result-row br-result-match">
          <code>${p.path || '<em>empty</em>'}</code>
          <span>${p.desc}</span>
        </div>`).join('') : `<div style="color:var(--muted);font-size:12px;padding:6px 0">No paths matched</div>`}
    </div>
    <div class="card" style="border-color:rgba(248,113,113,0.3)">
      <div class="card-hdr" style="color:var(--red)">✗ Not Matched (${misses.length})</div>
      ${misses.length ? misses.map(p => `
        <div class="br-result-row br-result-nomatch">
          <code>${p.path || '<em>empty</em>'}</code>
          <span>${p.desc}</span>
        </div>`).join('') : `<div style="color:var(--muted);font-size:12px;padding:6px 0">All paths matched</div>`}
    </div>
  </div>`;
}

// improvement #6 — drag handlers
function brBuilderDragStart(idx) {
  brBuilderDragIdx = idx;
}
function brBuilderDropOnToken(event, targetIdx) {
  if (brBuilderDragIdx === null || brBuilderDragIdx === targetIdx) return;
  const moved = brBuilderParts.splice(brBuilderDragIdx, 1)[0];
  const insertAt = brBuilderDragIdx < targetIdx ? targetIdx - 1 : targetIdx;
  brBuilderParts.splice(insertAt, 0, moved);
  brBuilderDragIdx = null;
  brBuilderRender();
}
function brBuilderDrop(event) {
  brBuilderDragIdx = null;
}

function brBuilderAdd(val) {
  if (val === '__DEL__') { brBuilderParts.pop(); brBuilderRender(); return; }
  if (val === '__ASN__') {
    const asn = prompt('Enter AS number (e.g. 65001):');
    if (!asn || !/^\d+$/.test(asn.trim())) return;
    brBuilderParts.push(asn.trim());
    brBuilderRender();
    return;
  }
  if (val === '(__)') { brBuilderParts.push('(', ')'); brBuilderRender(); return; }
  if (val === '{__,__}') {
    const n = prompt('Min repeats (n):');
    const m = prompt('Max repeats (m), or leave blank for exact:');
    if (!n) return;
    brBuilderParts.push('{' + n.trim() + (m ? ',' + m.trim() : '') + '}');
    brBuilderRender();
    return;
  }
  brBuilderParts.push(val);
  brBuilderRender();
}

function brBuilderRemoveAt(i) {
  brBuilderParts.splice(i, 1);
  brBuilderRender();
}

function brBuilderClear() {
  brBuilderParts = [];
  brBuilderRender();
}

function brBuilderSendToTester() {
  const regex = brBuilderParts.join('');
  if (!regex) return;
  brSwitchTab('tester');
  setTimeout(() => {
    const input = document.getElementById('br-regex-input');
    if (input) { input.value = regex; brRunTest(); }
  }, 80);
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 3 — CHALLENGE MODE
// ══════════════════════════════════════════════════════════════════════════════
function brChallengeHTML() {
  const c     = BR_CHALLENGES[brChallengeIdx];
  const total = BR_CHALLENGES.length;
  return `
<div class="br-section">

  <!-- Score bar -->
  <div class="br-ch-score-bar">
    <div class="br-ch-score-item">
      <span>Question</span>
      <em>${brChallengeIdx + 1} / ${total}</em>
    </div>
    <div class="br-ch-score-item">
      <span>Score</span>
      <em>${brChallengeScore.correct} / ${brChallengeScore.attempted}</em>
    </div>
    <div class="br-ch-score-item">
      <span>Level</span>
      <em style="color:${brLevelColor(c.level)}">${c.level}</em>
    </div>
    <button class="br-ch-reset-btn" onclick="brChallengeReset()">↺ Reset All</button>
  </div>

  <!-- Progress bar -->
  <div class="br-ch-progress-wrap">
    <div class="br-ch-progress-fill" style="width:${((brChallengeIdx)/total)*100}%"></div>
  </div>

  <!-- Challenge card -->
  <div class="card" style="margin-bottom:16px" id="br-ch-card">
    <div class="card-hdr" style="color:${brLevelColor(c.level)}">
      Challenge ${brChallengeIdx + 1} · <span style="font-weight:400">${c.level}</span>
    </div>
    <div class="br-ch-goal">${c.goal}</div>
    <div class="br-ch-hint-row">
      <button class="br-hint-btn" id="br-hint-btn" onclick="brShowHint()">💡 Show Hint</button>
      <div class="br-hint-text" id="br-hint-text" style="display:none">${c.hint}</div>
    </div>
  </div>

  <!-- Input -->
  <div class="br-input-row" style="margin-bottom:12px">
    <div class="br-input-group" style="flex:1">
      <label class="br-label">Your Regex Answer</label>
      <input type="text" id="br-ch-input" class="br-input" placeholder="Type your BGP regex here…"
             spellcheck="false" autocomplete="off"
             onkeydown="if(event.key==='Enter') brChallengeCheck()">
    </div>
    <button class="btn btn-primary" style="margin-top:20px" onclick="brChallengeCheck()">Check ✓</button>
  </div>

  <!-- Result area -->
  <div id="br-ch-result"></div>

  <!-- Nav buttons -->
  <div class="br-ch-nav" id="br-ch-nav" style="display:none">
    <button class="btn btn-primary" onclick="brChallengeNext()">Next Challenge →</button>
  </div>

</div>`;
}

function brLoadChallenge(idx) {
  brChallengeIdx   = idx;
  brChallengeAnswered = false;
  const content = document.getElementById('br-tab-content');
  if (content) content.innerHTML = brChallengeHTML();
  const input = document.getElementById('br-ch-input');
  if (input) input.focus();
}

function brShowHint() {
  const hint = document.getElementById('br-hint-text');
  const btn  = document.getElementById('br-hint-btn');
  if (!hint) return;
  hint.style.display = 'block';
  if (btn) btn.style.display = 'none';
}

function brChallengeCheck() {
  if (brChallengeAnswered) return;
  const input    = document.getElementById('br-ch-input');
  const resultEl = document.getElementById('br-ch-result');
  const navEl    = document.getElementById('br-ch-nav');
  if (!input || !resultEl) return;

  const answer = input.value.trim();
  const c      = BR_CHALLENGES[brChallengeIdx];

  if (!answer) {
    resultEl.innerHTML = `<div class="callout callout-warn">⚠ Please enter a regex before checking.</div>`;
    return;
  }

  const v = brValidateRegex(answer);
  if (!v.valid) {
    resultEl.innerHTML = `<div class="callout callout-warn">⚠ Your regex has a syntax error: ${v.err}</div>`;
    return;
  }

  brChallengeAnswered = true;
  brChallengeScore.attempted++;

  const jsAnswer  = brCiscoToJS(answer);
  const jsCorrect = brCiscoToJS(c.accept[0]);

  const answerResults  = BR_SAMPLE_PATHS.map(p => brMatchPath(jsAnswer,  p.path));
  const correctResults = BR_SAMPLE_PATHS.map(p => brMatchPath(jsCorrect, p.path));
  const functionallyCorrect = answerResults.every((r, i) => r === correctResults[i]);
  const exactMatch = c.accept.includes(answer);
  const isCorrect  = exactMatch || functionallyCorrect;

  if (isCorrect) brChallengeScore.correct++;

  // improvement #10 — diff summary: count over-matches and under-matches
  const overMatches  = answerResults.filter((r, i) => r  && !correctResults[i]).length;
  const underMatches = answerResults.filter((r, i) => !r && correctResults[i]).length;
  let diffSummary = '';
  if (!isCorrect) {
    diffSummary = `<div class="br-diff-summary">
      ${overMatches  ? `<span class="br-diff-over">Over-matches: +${overMatches} extra path(s) matched that shouldn't be</span>` : ''}
      ${underMatches ? `<span class="br-diff-under">Under-matches: −${underMatches} path(s) should match but don't</span>` : ''}
    </div>`;
  }

  // Path-by-path comparison table (all paths)
  const tableRows = BR_SAMPLE_PATHS.map((p, i) => {
    const yourHit    = answerResults[i];
    const correctHit = correctResults[i];
    const agree      = yourHit === correctHit;
    return `<tr class="${agree ? '' : 'br-ch-disagree'}">
      <td><code>${p.path || '<em>empty</em>'}</code></td>
      <td class="br-ch-cell ${yourHit    ? 'br-match-yes' : 'br-match-no'}">${yourHit    ? '✓' : '✗'}</td>
      <td class="br-ch-cell ${correctHit ? 'br-match-yes' : 'br-match-no'}">${correctHit ? '✓' : '✗'}</td>
      <td class="br-ch-cell">${agree ? '✓' : '<span style="color:var(--red)">⚠</span>'}</td>
    </tr>`;
  }).join('');

  resultEl.innerHTML = `
  <div class="callout ${isCorrect ? 'callout-info' : 'callout-warn'}" style="border-color:${isCorrect ? 'var(--green)' : 'var(--red)'};margin-bottom:14px">
    ${isCorrect
      ? `<strong style="color:var(--green)">✓ Correct!</strong> Well done — your regex works as expected.`
      : `<strong style="color:var(--red)">✗ Not quite.</strong> Your regex doesn't match the same paths as the expected answer.`}
  </div>
  ${diffSummary}
  <div class="card" style="margin-bottom:14px">
    <div class="card-hdr">📖 Explanation</div>
    <div style="font-size:13px;line-height:1.7;color:var(--text2)">
      <div style="margin-bottom:8px"><strong>Expected answer:</strong>
        <code class="br-inline-code">${brEscape(c.answer)}</code>
        &nbsp;→&nbsp;
        <span style="color:var(--muted);font-size:12px">ip as-path access-list 1 permit ${brEscape(c.answer)}</span>
      </div>
      <div style="margin-bottom:8px"><strong>Your answer:</strong>
        <code class="br-inline-code" style="border-color:${isCorrect ? 'var(--green)' : 'var(--red)'}">${brEscape(answer)}</code>
      </div>
      <div>${c.explain}</div>
    </div>
  </div>
  <div class="card" style="margin-bottom:14px">
    <div class="card-hdr">🔬 Path Comparison (all ${BR_SAMPLE_PATHS.length} paths)</div>
    <div style="overflow-x:auto">
    <table class="br-ch-table">
      <thead><tr>
        <th>AS Path</th>
        <th>Your Regex</th>
        <th>Expected</th>
        <th>Agree?</th>
      </tr></thead>
      <tbody>${tableRows}</tbody>
    </table>
    </div>
  </div>`;

  if (navEl) navEl.style.display = 'flex';
  input.disabled = true;
  input.style.opacity = '0.6';
}

function brChallengeNext() {
  if (brChallengeIdx < BR_CHALLENGES.length - 1) {
    brLoadChallenge(brChallengeIdx + 1);
  } else {
    const content = document.getElementById('br-tab-content');
    if (!content) return;
    const pct   = Math.round((brChallengeScore.correct / BR_CHALLENGES.length) * 100);
    const grade = pct >= 85 ? 'CCIE Ready 🏆' : pct >= 65 ? 'CCNP Level 📗' : 'Keep Practicing 📘';
    content.innerHTML = `
    <div class="br-section" style="text-align:center;padding:32px 16px">
      <div style="font-size:48px;margin-bottom:8px">🎯</div>
      <div style="font-size:22px;font-weight:700;color:var(--text);margin-bottom:4px">Challenge Complete!</div>
      <div style="font-size:32px;font-weight:700;color:var(--blue);margin:16px 0">${brChallengeScore.correct} / ${BR_CHALLENGES.length}</div>
      <div style="font-size:18px;color:var(--cyan);margin-bottom:24px">${grade}</div>
      <div style="color:var(--muted2);font-size:13px;margin-bottom:28px">
        You scored ${pct}% — ${pct >= 85 ? 'Excellent mastery of BGP regex patterns.' : pct >= 65 ? 'Good understanding — review the explanations for the ones you missed.' : 'Review the Cheat Sheet tab and try again.'}
      </div>
      <button class="btn btn-primary" style="font-size:15px;padding:10px 28px" onclick="brChallengeReset()">↺ Try Again</button>
      <button class="btn btn-reset" style="font-size:15px;padding:10px 28px;margin-left:10px" onclick="brSwitchTab('ref')">📋 Review Cheat Sheet</button>
    </div>`;
  }
}

function brChallengeReset() {
  brChallengeIdx      = 0;
  brChallengeScore    = { correct: 0, attempted: 0 };
  brChallengeAnswered = false;
  brLoadChallenge(0);
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 4 — CHEAT SHEET (improvement #8 — Copy IOS buttons)
// ══════════════════════════════════════════════════════════════════════════════
function brRefHTML() {
  return `
<div class="br-section">

  <div class="callout callout-info" style="margin-bottom:20px">
    💡 All patterns use <strong>Cisco IOS BGP regex syntax</strong>. The underscore <code>_</code> is special — it matches any AS path delimiter: space, comma, start, or end of string.
    Click <strong>▶ Test</strong> on any pattern to load it in the Live Tester. Click <strong>📋 Copy</strong> to copy the IOS command.
  </div>

  ${BR_CHEATSHEET.map(cat => `
  <div class="card" style="margin-bottom:16px;border-color:${cat.color}33">
    <div class="card-hdr" style="color:${cat.color}">${cat.category}</div>
    <div class="br-ref-table-wrap">
      <table class="br-ref-table">
        <thead><tr>
          <th style="width:200px">Regex</th>
          <th>What It Matches</th>
          <th style="width:300px">IOS Command</th>
          <th style="width:110px">Actions</th>
        </tr></thead>
        <tbody>
          ${cat.items.map(item => `
          <tr>
            <td><code class="br-ref-code">${brEscape(item.regex)}</code></td>
            <td class="br-ref-desc">${item.desc}</td>
            <td><code class="br-ref-ios">${brEscape(item.ios)}</code></td>
            <td style="white-space:nowrap">
              <button class="br-test-btn" onclick="brRefTest('${brEscapeAttr(item.regex)}')">▶ Test</button>
              <button class="br-copy-btn" onclick="brCopyIOS('${brEscapeAttr(item.ios)}', this)" title="Copy IOS command">📋</button>
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>`).join('')}

  <!-- Cisco-specific tips -->
  <div class="card" style="margin-top:4px">
    <div class="card-hdr">🏭 Production Tips & CCIE Traps</div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px">

      <div style="background:var(--bg3);border-radius:8px;padding:12px">
        <div style="font-family:var(--mono);font-size:10px;font-weight:700;color:var(--amber);margin-bottom:6px">The _ Gotcha</div>
        <div style="font-size:12px;color:var(--muted2);line-height:1.7">
          In Cisco BGP regex, <code>_</code> is NOT just a space. It matches space, comma, open/close brace, start-of-string, and end-of-string.
          This is why <code>_100_</code> correctly matches AS 100 whether it's the first, last, or middle AS —
          and why you should always use <code>_</code> instead of a literal space to delimit ASNs.
        </div>
      </div>

      <div style="background:var(--bg3);border-radius:8px;padding:12px">
        <div style="font-family:var(--mono);font-size:10px;font-weight:700;color:var(--cyan);margin-bottom:6px">Implicit Deny</div>
        <div style="font-size:12px;color:var(--muted2);line-height:1.7">
          An <code>ip as-path access-list</code> has an <strong>implicit deny all</strong> at the end, just like a standard ACL.
          If you only want to filter specific routes and permit the rest, always add <code>permit .*</code> as the last entry.
          Forgetting this in production drops all BGP routes — a common CCIE lab trap.
        </div>
      </div>

      <div style="background:var(--bg3);border-radius:8px;padding:12px">
        <div style="font-family:var(--mono);font-size:10px;font-weight:700;color:var(--green);margin-bottom:6px">Apply to Neighbor</div>
        <div style="font-family:var(--mono);font-size:11px;color:var(--muted2);line-height:1.9">
          router bgp 65001<br>
          &nbsp;neighbor 1.2.3.4 filter-list 1 in<br>
          &nbsp;neighbor 1.2.3.4 filter-list 2 out<br>
          <span style="color:var(--muted)">! filter-list uses as-path acl number</span>
        </div>
      </div>

      <div style="background:var(--bg3);border-radius:8px;padding:12px">
        <div style="font-family:var(--mono);font-size:10px;font-weight:700;color:var(--blue);margin-bottom:6px">Verify with show</div>
        <div style="font-family:var(--mono);font-size:11px;color:var(--muted2);line-height:1.9">
          show ip bgp regexp ^100_<br>
          show ip bgp filter-list 1<br>
          show ip as-path-access-list<br>
          <span style="color:var(--muted)">! Test regex live on router</span>
        </div>
      </div>

      <div style="background:var(--bg3);border-radius:8px;padding:12px">
        <div style="font-family:var(--mono);font-size:10px;font-weight:700;color:var(--pink);margin-bottom:6px">JunOS Equivalent</div>
        <div style="font-family:var(--mono);font-size:11px;color:var(--muted2);line-height:1.9">
          policy-options {<br>
          &nbsp;as-path PEER "^100 .*";<br>
          &nbsp;policy-statement FILTER {<br>
          &nbsp;&nbsp;term T1 {<br>
          &nbsp;&nbsp;&nbsp;from as-path PEER;<br>
          &nbsp;&nbsp;&nbsp;then accept;<br>
          &nbsp;}}<br>
          <span style="color:var(--muted)">! JunOS: space not _</span>
        </div>
      </div>

      <div style="background:var(--bg3);border-radius:8px;padding:12px">
        <div style="font-family:var(--mono);font-size:10px;font-weight:700;color:var(--purple);margin-bottom:6px">Route-map Integration</div>
        <div style="font-family:var(--mono);font-size:11px;color:var(--muted2);line-height:1.9">
          ip as-path access-list 10 permit ^$<br>
          !<br>
          route-map SET-LP permit 10<br>
          &nbsp;match as-path 10<br>
          &nbsp;set local-preference 200<br>
          route-map SET-LP permit 20<br>
          <span style="color:var(--muted)">! Permit rest (implicit deny if omitted)</span>
        </div>
      </div>

    </div>
  </div>

</div>`;
}

function brRefTest(regex) {
  brSwitchTab('tester');
  setTimeout(() => {
    const input = document.getElementById('br-regex-input');
    if (input) { input.value = regex; brRunTest(); }
  }, 80);
}

// improvement #8 — Copy IOS command to clipboard
function brCopyIOS(text, btn) {
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    const orig = btn.textContent;
    btn.textContent = '✓';
    btn.style.color = 'var(--green)';
    setTimeout(() => { btn.textContent = orig; btn.style.color = ''; }, 1500);
  }).catch(() => {
    // fallback
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    const orig = btn.textContent;
    btn.textContent = '✓'; btn.style.color = 'var(--green)';
    setTimeout(() => { btn.textContent = orig; btn.style.color = ''; }, 1500);
  });
}

// ══════════════════════════════════════════════════════════════════════════════
// TAB 5 — SAVED PATTERNS (improvement #9 — persistent saved patterns)
// ══════════════════════════════════════════════════════════════════════════════
function brSavedHTML() {
  if (!brSavedPatterns.length) {
    return `
<div class="br-section">
  <div class="callout callout-info">
    🔖 No saved patterns yet. Go to the <strong>Live Tester</strong> tab, type a regex, and click <strong>Save Pattern</strong>.
  </div>
</div>`;
  }
  return `
<div class="br-section">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
    <div style="font-family:var(--mono);font-size:12px;color:var(--muted)">${brSavedPatterns.length} saved pattern(s)</div>
    <button class="br-ch-reset-btn" onclick="brClearSaved()">🗑 Clear All</button>
  </div>
  <div class="br-table-wrap">
    <table class="br-ref-table">
      <thead><tr>
        <th>Pattern</th>
        <th>Label</th>
        <th>Plain English</th>
        <th style="width:140px">Actions</th>
      </tr></thead>
      <tbody>
        ${brSavedPatterns.map((s, i) => `
        <tr>
          <td><code class="br-ref-code">${brEscape(s.pattern)}</code></td>
          <td style="color:var(--muted2);font-size:12px">${brEscape(s.label)}</td>
          <td style="color:var(--muted2);font-size:11px;line-height:1.5">${brExplainRegex(s.pattern)}</td>
          <td style="white-space:nowrap">
            <button class="br-test-btn" onclick="brSavedLoad('${brEscapeAttr(s.pattern)}')">▶ Test</button>
            <button class="br-copy-btn" onclick="brCopyIOS('ip as-path access-list 1 permit ${brEscapeAttr(s.pattern)}', this)" title="Copy IOS">📋</button>
            <button class="br-copy-btn" style="color:var(--red)" onclick="brSavedDelete(${i})" title="Delete">✕</button>
          </td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>
</div>`;
}

function brSavedLoad(pattern) {
  brSwitchTab('tester');
  setTimeout(() => {
    const input = document.getElementById('br-regex-input');
    if (input) { input.value = pattern; brRunTest(); }
  }, 80);
}

function brSavedDelete(i) {
  brSavedPatterns.splice(i, 1);
  brStorageSave();
  const content = document.getElementById('br-tab-content');
  if (content) content.innerHTML = brSavedHTML();
}

function brClearSaved() {
  if (!confirm('Clear all saved patterns?')) return;
  brSavedPatterns = [];
  brStorageSave();
  const content = document.getElementById('br-tab-content');
  if (content) content.innerHTML = brSavedHTML();
}

// ─── UTILITY ─────────────────────────────────────────────────────────────────
function brEscape(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function brEscapeAttr(str) {
  // Safe for use in onclick="..." single-quoted attribute values
  return String(str)
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '&quot;');
}

// ─── STYLES ──────────────────────────────────────────────────────────────────
function brInjectStyles() {
  if (document.getElementById('br-styles')) return;
  const s = document.createElement('style');
  s.id = 'br-styles';
  s.textContent = `
  /* ── Wrap ── */
  .br-wrap { max-width: 960px; }
  .br-section { padding-top: 4px; }

  /* ── Tabs ── */
  .br-tabs {
    display: flex; gap: 4px; flex-wrap: wrap;
    margin-bottom: 20px;
    border-bottom: 1px solid var(--border);
    padding-bottom: 0;
  }
  .br-tab {
    background: none; border: none; border-bottom: 2px solid transparent;
    color: var(--muted2); font-family: var(--mono); font-size: 12px;
    padding: 8px 16px; cursor: pointer; margin-bottom: -1px;
    transition: color 0.15s, border-color 0.15s;
  }
  .br-tab:hover { color: var(--text); }
  .br-tab.active { color: var(--blue); border-bottom-color: var(--blue); }

  /* ── Presets ── */
  .br-preset-bar {
    display: flex; flex-wrap: wrap; gap: 6px; align-items: center;
    margin-bottom: 14px;
  }
  .br-preset-label { font-family: var(--mono); font-size: 11px; color: var(--muted); }
  .br-preset-btn {
    background: var(--bg2); border: 1px solid var(--border); border-radius: 5px;
    color: var(--muted2); font-family: var(--mono); font-size: 11px;
    padding: 4px 10px; cursor: pointer; transition: all 0.15s;
  }
  .br-preset-btn:hover { border-color: var(--blue); color: var(--blue); background: rgba(91,156,246,0.08); }

  /* ── Inputs ── */
  .br-input-row { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 12px; }
  .br-input-group { display: flex; flex-direction: column; gap: 5px; min-width: 180px; }
  .br-label { font-family: var(--mono); font-size: 11px; font-weight: 600; color: var(--muted); }
  .br-input {
    background: var(--bg2); border: 1px solid var(--border); border-radius: 6px;
    color: var(--text); font-family: var(--mono); font-size: 13px;
    padding: 8px 12px; outline: none; transition: border-color 0.2s;
  }
  .br-input:focus { border-color: var(--blue); }
  .br-regex-err { font-size: 11px; color: var(--red); font-family: var(--mono); }
  .br-ios-preview {
    background: var(--bg3); border: 1px solid var(--border); border-radius: 6px;
    font-family: var(--mono); font-size: 11px; color: var(--muted2);
    padding: 8px 12px; line-height: 1.5; word-break: break-all;
  }
  .br-ios-preview strong { color: var(--cyan); }

  /* ── History dropdown (improvement #3) ── */
  .br-hist-btn {
    background: var(--bg2); border: 1px solid var(--border); border-radius: 6px;
    padding: 7px 10px; cursor: pointer; font-size: 14px; flex-shrink: 0;
    transition: border-color 0.15s;
  }
  .br-hist-btn:hover { border-color: var(--blue); }
  .br-hist-dropdown {
    position: absolute; top: calc(100% + 4px); right: 0; z-index: 100;
    background: var(--bg2); border: 1px solid var(--border); border-radius: 8px;
    min-width: 340px; max-height: 260px; overflow-y: auto;
    box-shadow: 0 8px 24px rgba(0,0,0,0.3);
  }
  .br-hist-item {
    padding: 8px 12px; cursor: pointer; border-bottom: 1px solid var(--border2);
    display: flex; flex-direction: column; gap: 2px;
  }
  .br-hist-item:hover { background: var(--bg3); }
  .br-hist-item code { font-family: var(--mono); font-size: 13px; color: var(--cyan); }
  .br-hist-explain { font-size: 10px; color: var(--muted); line-height: 1.4; }
  .br-hist-empty { padding: 12px; color: var(--muted); font-size: 12px; text-align: center; }
  .br-hist-clear {
    padding: 8px 12px; color: var(--red); font-size: 11px; cursor: pointer;
    font-family: var(--mono); text-align: center;
  }
  .br-hist-clear:hover { background: rgba(248,113,113,0.08); }

  /* ── Symbol hint row ── */
  .br-symbol-row {
    display: flex; flex-wrap: wrap; gap: 6px; align-items: center;
    min-height: 22px; margin-bottom: 10px;
  }
  .br-sym-hint-label { font-size: 11px; color: var(--muted); font-family: var(--mono); }
  .br-sym-hint {
    background: rgba(91,156,246,0.1); border: 1px solid rgba(91,156,246,0.25);
    border-radius: 4px; padding: 2px 8px;
    font-family: var(--mono); font-size: 11px; color: var(--blue); cursor: default;
  }
  .br-sym-hint em { font-style: normal; color: var(--muted2); margin-left: 4px; }

  /* ── Stats bar ── */
  .br-stats-bar {
    display: flex; gap: 12px; margin-bottom: 14px; flex-wrap: wrap;
  }
  .br-stat {
    background: var(--bg2); border: 1px solid var(--border); border-radius: 6px;
    padding: 8px 14px; display: flex; flex-direction: column; gap: 2px; min-width: 90px;
  }
  .br-stat span { font-size: 10px; color: var(--muted); font-family: var(--mono); font-weight: 600; }
  .br-stat em { font-size: 15px; font-weight: 700; color: var(--blue); font-style: normal; }

  /* ── Custom path row ── */
  .br-custom-row {
    display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
    background: var(--bg2); border: 1px solid var(--border); border-radius: 8px;
    padding: 10px 14px; margin-bottom: 14px;
  }
  .br-custom-result { min-width: 100px; }

  /* ── Table ── */
  .br-table-wrap { overflow-x: auto; border-radius: 8px; border: 1px solid var(--border); }
  .br-table {
    width: 100%; border-collapse: collapse; font-size: 12px;
  }
  .br-table thead { background: var(--bg3); }
  .br-table th {
    padding: 9px 12px; text-align: left; font-family: var(--mono);
    font-size: 10px; font-weight: 700; color: var(--muted);
    text-transform: uppercase; letter-spacing: 0.04em;
    border-bottom: 1px solid var(--border);
  }
  .br-table td { padding: 8px 12px; border-bottom: 1px solid var(--border2); vertical-align: middle; }
  .br-table tr:last-child td { border-bottom: none; }
  .br-row-num { color: var(--muted); font-family: var(--mono); font-size: 11px; }
  .br-path-code {
    font-family: var(--mono); font-size: 12px; color: var(--cyan);
    background: rgba(56,217,192,0.07); padding: 2px 6px; border-radius: 4px;
  }
  .br-row-desc { color: var(--muted2); font-size: 12px; }
  .br-match-cell { text-align: center; }
  .br-row-match  td { background: rgba(74,222,128,0.04); }
  .br-row-nomatch td { background: rgba(248,113,113,0.03); }

  /* ── Badges ── */
  .br-badge {
    display: inline-block; font-family: var(--mono); font-size: 11px; font-weight: 600;
    padding: 3px 10px; border-radius: 5px; border: 1px solid transparent;
  }
  .br-badge-match   { color: var(--green); background: rgba(74,222,128,0.12); border-color: rgba(74,222,128,0.3); }
  .br-badge-nomatch { color: var(--red);   background: rgba(248,113,113,0.1); border-color: rgba(248,113,113,0.3); }
  .br-badge-idle    { color: var(--muted); background: var(--bg2); }

  /* ── Symbol grid ── */
  .br-sym-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 10px;
    margin-top: 2px;
  }
  .br-sym-card {
    background: var(--bg3); border-radius: 7px; padding: 10px 12px;
  }
  .br-sym-token {
    font-family: var(--mono); font-size: 16px; font-weight: 700; color: var(--amber);
    margin-bottom: 3px;
  }
  .br-sym-name { font-size: 11px; font-weight: 600; color: var(--text2); margin-bottom: 3px; }
  .br-sym-desc { font-size: 11px; color: var(--muted2); line-height: 1.5; }

  /* ── Builder ── */
  .br-block-palette { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px; }
  .br-block-btn {
    background: var(--bg2); border: 1px solid; border-radius: 6px;
    font-family: var(--mono); font-size: 13px; font-weight: 600;
    padding: 8px 14px; cursor: pointer; transition: all 0.15s;
    display: flex; flex-direction: column; align-items: center; gap: 2px; min-width: 70px;
  }
  .br-block-btn:hover { opacity: 0.8; transform: translateY(-1px); }
  .br-block-tip { font-size: 9px; font-weight: 400; color: var(--muted); font-family: var(--sans,sans-serif); }
  .br-builder-canvas {
    min-height: 48px; background: var(--bg3); border-radius: 8px; border: 1px solid var(--border);
    padding: 10px 14px; display: flex; flex-wrap: wrap; gap: 4px; align-items: center;
    margin-top: 4px;
  }
  .br-builder-empty { color: var(--muted); font-size: 12px; font-style: italic; }
  /* improvement #6 — draggable token highlight */
  .br-builder-token {
    background: rgba(91,156,246,0.12); border: 1px solid rgba(91,156,246,0.3); border-radius: 5px;
    font-family: var(--mono); font-size: 15px; font-weight: 700; color: var(--blue);
    padding: 4px 10px; cursor: grab; transition: background 0.15s; user-select: none;
  }
  .br-builder-token:hover { background: rgba(248,113,113,0.15); border-color: var(--red); color: var(--red); cursor: pointer; }
  .br-builder-token:active { cursor: grabbing; opacity: 0.6; }
  .br-builder-cursor { color: var(--blue); font-size: 18px; animation: br-blink 1s step-end infinite; }
  @keyframes br-blink { 50% { opacity: 0; } }
  .br-builder-result-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 4px;
  }
  .br-result-row {
    display: flex; gap: 10px; padding: 5px 0;
    border-bottom: 1px solid var(--border2); align-items: baseline;
    font-size: 12px;
  }
  .br-result-row code { font-family: var(--mono); font-size: 11px; white-space: nowrap; }
  .br-result-match code  { color: var(--green); }
  .br-result-nomatch code { color: var(--red); }
  .br-result-row span { color: var(--muted2); }

  /* ── Challenge ── */
  .br-ch-score-bar {
    display: flex; gap: 12px; align-items: center; flex-wrap: wrap;
    margin-bottom: 10px;
  }
  .br-ch-score-item {
    background: var(--bg2); border: 1px solid var(--border); border-radius: 6px;
    padding: 7px 14px; display: flex; flex-direction: column; gap: 2px;
  }
  .br-ch-score-item span { font-size: 10px; color: var(--muted); font-family: var(--mono); font-weight: 600; }
  .br-ch-score-item em   { font-size: 15px; font-weight: 700; color: var(--text); font-style: normal; }
  .br-ch-reset-btn {
    margin-left: auto; background: var(--bg2); border: 1px solid var(--border); border-radius: 6px;
    color: var(--muted2); font-family: var(--mono); font-size: 11px;
    padding: 6px 14px; cursor: pointer;
  }
  .br-ch-reset-btn:hover { border-color: var(--red); color: var(--red); }
  .br-ch-progress-wrap {
    height: 4px; background: var(--bg3); border-radius: 2px; margin-bottom: 16px; overflow: hidden;
  }
  .br-ch-progress-fill { height: 100%; background: var(--blue); border-radius: 2px; transition: width 0.3s; }
  .br-ch-goal {
    font-size: 14px; color: var(--text); line-height: 1.6; margin-bottom: 12px;
  }
  .br-ch-hint-row { display: flex; align-items: flex-start; gap: 10px; flex-wrap: wrap; }
  .br-hint-btn {
    background: rgba(251,191,36,0.1); border: 1px solid rgba(251,191,36,0.3); border-radius: 5px;
    color: var(--amber); font-family: var(--mono); font-size: 11px;
    padding: 5px 12px; cursor: pointer; white-space: nowrap;
  }
  .br-hint-text {
    font-size: 12px; color: var(--amber); background: rgba(251,191,36,0.07);
    border: 1px solid rgba(251,191,36,0.2); border-radius: 6px;
    padding: 6px 12px; line-height: 1.5; flex: 1;
  }
  .br-ch-nav { display: flex; gap: 10px; margin-top: 16px; }
  .br-ch-table { width: 100%; border-collapse: collapse; font-size: 12px; }
  .br-ch-table th {
    background: var(--bg3); padding: 7px 10px; text-align: left;
    font-family: var(--mono); font-size: 10px; font-weight: 700; color: var(--muted);
    border-bottom: 1px solid var(--border);
  }
  .br-ch-table td { padding: 6px 10px; border-bottom: 1px solid var(--border2); }
  .br-ch-table tr.br-ch-disagree td { background: rgba(248,113,113,0.06); }
  .br-ch-cell { text-align: center; font-family: var(--mono); font-weight: 700; }
  .br-match-yes { color: var(--green); }
  .br-match-no  { color: var(--red); }

  /* improvement #10 — diff summary styles */
  .br-diff-summary {
    display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 14px;
  }
  .br-diff-over {
    background: rgba(248,113,113,0.1); border: 1px solid rgba(248,113,113,0.3);
    color: var(--red); border-radius: 6px; padding: 6px 12px;
    font-size: 12px; font-family: var(--mono);
  }
  .br-diff-under {
    background: rgba(251,191,36,0.1); border: 1px solid rgba(251,191,36,0.3);
    color: var(--amber); border-radius: 6px; padding: 6px 12px;
    font-size: 12px; font-family: var(--mono);
  }

  /* ── Ref / Cheat sheet ── */
  .br-ref-table-wrap { overflow-x: auto; }
  .br-ref-table { width: 100%; border-collapse: collapse; font-size: 12px; }
  .br-ref-table th {
    padding: 8px 10px; text-align: left; font-family: var(--mono);
    font-size: 10px; font-weight: 700; color: var(--muted); text-transform: uppercase;
    border-bottom: 1px solid var(--border);
  }
  .br-ref-table td { padding: 9px 10px; border-bottom: 1px solid var(--border2); vertical-align: middle; }
  .br-ref-table tr:last-child td { border-bottom: none; }
  .br-ref-code {
    font-family: var(--mono); font-size: 12px; font-weight: 700; color: var(--amber);
    background: rgba(251,191,36,0.08); padding: 2px 7px; border-radius: 4px; white-space: nowrap;
  }
  .br-ref-ios {
    font-family: var(--mono); font-size: 10px; color: var(--muted2); white-space: nowrap;
  }
  .br-ref-desc { color: var(--muted2); font-size: 12px; }
  .br-test-btn {
    background: rgba(91,156,246,0.1); border: 1px solid rgba(91,156,246,0.25); border-radius: 5px;
    color: var(--blue); font-family: var(--mono); font-size: 10px;
    padding: 4px 8px; cursor: pointer; white-space: nowrap; margin-right: 4px;
  }
  .br-test-btn:hover { background: rgba(91,156,246,0.2); }
  /* improvement #8 — copy button */
  .br-copy-btn {
    background: rgba(56,217,192,0.1); border: 1px solid rgba(56,217,192,0.25); border-radius: 5px;
    color: var(--cyan); font-family: var(--mono); font-size: 10px;
    padding: 4px 8px; cursor: pointer; white-space: nowrap; margin-right: 4px;
    transition: all 0.15s;
  }
  .br-copy-btn:hover { background: rgba(56,217,192,0.2); }
  .br-inline-code {
    font-family: var(--mono); font-size: 12px; color: var(--cyan);
    background: rgba(56,217,192,0.08); padding: 2px 7px; border-radius: 4px;
    border: 1px solid rgba(56,217,192,0.2);
  }

  /* ── Responsive ── */
  @media(max-width:600px) {
    .br-builder-result-grid { grid-template-columns: 1fr; }
    .br-input-row { flex-direction: column; }
    .br-tabs { gap: 0; }
    .br-tab { font-size: 11px; padding: 7px 10px; }
    .br-hist-dropdown { min-width: 260px; right: -40px; }
  }
  `;
  document.head.appendChild(s);
}
