/* ═══════════════════════════════════════════════════════════════
   password.js  —  KeyForge Password Generator
   SubnetLab Pro  |  Author: Chaithanya Kumar Katari
   Drop into:  Project/js/password.js
   Matches base.css + layout.css design tokens exactly.
═══════════════════════════════════════════════════════════════ */

/* ── Inject page HTML into #page-password ── */
(function buildPasswordPage() {
    const container = document.getElementById('page-password');
    if (!container) return;
  
    container.innerHTML = `
  <!-- ════════════════  KEYFORGE PASSWORD GENERATOR  ════════════════ -->
  <style>
  /* ── scoped to #page-password so nothing bleeds out ── */
  #page-password {
    --pw-gap: 20px;
  }
  
  /* Two-column layout: controls left, output right (sticky) */
  #page-password .pw-layout {
    display: grid;
    grid-template-columns: 1fr 380px;
    gap: var(--pw-gap);
    align-items: start;
  }
  @media (max-width: 960px) {
    #page-password .pw-layout {
      grid-template-columns: 1fr;
    }
    #page-password .pw-right {
      position: static !important;
    }
  }
  
  /* Right panel sticky */
  #page-password .pw-right {
    position: sticky;
    top: 24px;
  }
  
  /* ── Mode selector cards ── */
  #page-password .mode-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-bottom: 18px;
  }
  @media (max-width: 600px) {
    #page-password .mode-grid { grid-template-columns: 1fr; }
  }
  
  #page-password .mode-card {
    padding: 14px 12px;
    border-radius: var(--r);
    border: 1px solid var(--border);
    background: var(--bg2);
    cursor: pointer;
    text-align: center;
    transition: all .2s;
    user-select: none;
  }
  #page-password .mode-card:hover {
    border-color: var(--border2);
    background: var(--bg3);
  }
  #page-password .mode-card.pw-selected {
    border-color: var(--blue);
    background: rgba(91,156,246,0.08);
    box-shadow: 0 0 0 1px rgba(91,156,246,0.15);
  }
  #page-password .mode-emoji { font-size: 22px; margin-bottom: 6px; }
  #page-password .mode-name {
    font-family: var(--mono);
    font-size: 12px; font-weight: 700;
    color: var(--text); margin-bottom: 3px;
  }
  #page-password .mode-desc {
    font-size: 11px; color: var(--muted2); line-height: 1.5;
  }
  #page-password .mode-rec {
    display: inline-block; margin-top: 5px;
    padding: 1px 7px; border-radius: 4px;
    font-family: var(--mono); font-size: 9px; font-weight: 700;
    background: rgba(74,222,128,0.1); color: var(--green);
    text-transform: uppercase; letter-spacing: .5px;
  }
  
  /* ── Section inside a card ── */
  #page-password .pw-section { margin-bottom: 18px; }
  #page-password .pw-section:last-child { margin-bottom: 0; }
  
  #page-password .pw-label {
    font-family: var(--mono);
    font-size: 10px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 1.2px;
    color: var(--muted); margin-bottom: 10px;
    display: flex; align-items: center; gap: 6px;
  }
  
  /* ── Text input ── */
  #page-password .pw-input {
    width: 100%; padding: 10px 13px;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: var(--r);
    color: var(--text);
    font-family: var(--sans); font-size: 14px;
    outline: none; transition: border-color .2s;
  }
  #page-password .pw-input:focus {
    border-color: var(--border2);
  }
  #page-password .pw-input::placeholder { color: var(--muted); }
  
  #page-password .pw-hint {
    margin-top: 9px; padding: 9px 12px;
    background: rgba(91,156,246,0.05);
    border-left: 2px solid var(--blue);
    border-radius: 0 var(--r) var(--r) 0;
    font-size: 12px; color: var(--muted2); line-height: 1.6;
  }
  #page-password .pw-hint strong { color: var(--blue); }
  
  /* ── Slider ── */
  #page-password .slider-row {
    display: flex; align-items: center; gap: 10px; margin-bottom: 6px;
  }
  #page-password .slider-row span {
    font-size: 13px; color: var(--muted2);
  }
  #page-password .slider-row strong {
    font-family: var(--mono); font-size: 15px;
    color: var(--cyan); min-width: 26px; text-align: right;
  }
  #page-password input[type="range"] {
    flex: 1; -webkit-appearance: none;
    height: 4px; border-radius: 2px;
    background: var(--bg3); outline: none; cursor: pointer;
  }
  #page-password input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px; height: 16px; border-radius: 50%;
    background: var(--blue); cursor: pointer;
    box-shadow: 0 0 8px rgba(91,156,246,0.4);
    border: 2px solid var(--bg2);
  }
  #page-password .slider-guide {
    display: flex; justify-content: space-between;
    font-family: var(--mono); font-size: 10px; color: var(--muted);
    margin-top: 4px;
  }
  
  /* ── Toggle pills ── */
  #page-password .pw-toggles {
    display: flex; gap: 8px; flex-wrap: wrap;
  }
  #page-password .pw-toggle {
    display: flex; align-items: center; gap: 7px;
    padding: 7px 13px; border-radius: 20px;
    border: 1px solid var(--border);
    background: var(--bg2);
    font-family: var(--mono); font-size: 11px; font-weight: 600;
    color: var(--muted); cursor: pointer; user-select: none;
    transition: all .18s;
  }
  #page-password .pw-toggle input { display: none; }
  #page-password .pw-toggle.pw-on {
    border-color: rgba(91,156,246,0.4);
    background: rgba(91,156,246,0.08);
    color: var(--blue);
  }
  #page-password .pw-toggle-dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: var(--muted); transition: all .18s;
  }
  #page-password .pw-toggle.pw-on .pw-toggle-dot {
    background: var(--blue);
    box-shadow: 0 0 5px rgba(91,156,246,0.6);
  }
  
  /* ── Separator pills ── */
  #page-password .sep-opts {
    display: flex; gap: 7px; flex-wrap: wrap; margin-top: 8px;
  }
  #page-password .sep-opt {
    padding: 5px 13px; border-radius: 6px; cursor: pointer;
    border: 1px solid var(--border);
    background: var(--bg2);
    font-family: var(--mono); font-size: 12px; color: var(--muted);
    transition: all .15s;
  }
  #page-password .sep-opt.pw-sel {
    border-color: var(--cyan);
    background: rgba(56,217,192,0.07); color: var(--cyan);
  }
  
  /* ── Radio options ── */
  #page-password .pw-radio-list { display: flex; flex-direction: column; gap: 6px; }
  #page-password .pw-radio {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 12px; border-radius: var(--r);
    border: 1px solid var(--border);
    background: var(--bg2);
    font-size: 13px; color: var(--muted2); cursor: pointer;
    transition: all .15s;
  }
  #page-password .pw-radio:has(input:checked) {
    border-color: rgba(91,156,246,0.3);
    background: rgba(91,156,246,0.06); color: var(--text);
  }
  #page-password .pw-radio input { accent-color: var(--blue); }
  #page-password .pw-radio .radio-tag {
    margin-left: auto; font-family: var(--mono); font-size: 10px;
    padding: 1px 7px; border-radius: 4px;
  }
  #page-password .tag-green { background: rgba(74,222,128,0.1); color: var(--green); }
  #page-password .tag-amber { background: rgba(251,191,36,0.1);  color: var(--amber); }
  #page-password .tag-red   { background: rgba(248,113,113,0.1); color: var(--red);   }
  
  /* ── Advanced accordion ── */
  #page-password .adv-hdr {
    display: flex; align-items: center; justify-content: space-between;
    padding: 10px 14px; border-radius: var(--r);
    background: var(--bg2); border: 1px solid var(--border);
    font-family: var(--mono); font-size: 11px; font-weight: 700;
    color: var(--muted); cursor: pointer; user-select: none;
    transition: all .18s; margin-top: 16px;
  }
  #page-password .adv-hdr:hover { color: var(--text); border-color: var(--border2); }
  #page-password .adv-hdr .adv-arrow { transition: transform .25s; }
  #page-password .adv-hdr.adv-open .adv-arrow { transform: rotate(180deg); }
  #page-password .adv-body {
    overflow: hidden; max-height: 0;
    transition: max-height .35s ease, padding .3s;
    background: var(--bg2);
    border: 1px solid var(--border); border-top: none;
    border-radius: 0 0 var(--r) var(--r);
    padding: 0 14px;
  }
  #page-password .adv-body.adv-open { max-height: 700px; padding: 16px 14px; }
  #page-password .adv-subsection { margin-bottom: 16px; }
  #page-password .adv-subsection:last-child { margin-bottom: 0; }
  
  /* ── Generate button ── */
  #page-password .pw-gen-btn {
    width: 100%; padding: 13px;
    background: linear-gradient(90deg, rgba(91,156,246,0.9), rgba(56,217,192,0.8));
    border: none; border-radius: var(--r2);
    font-family: var(--mono); font-size: 14px; font-weight: 700;
    color: #fff; letter-spacing: 0.5px; cursor: pointer;
    box-shadow: 0 6px 24px rgba(91,156,246,0.2);
    transition: all .18s; display: flex;
    align-items: center; justify-content: center; gap: 8px;
    margin-top: 4px;
  }
  #page-password .pw-gen-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 30px rgba(91,156,246,0.3);
  }
  #page-password .pw-gen-btn:active { transform: none; }
  
  /* ════ RIGHT PANEL — OUTPUT ════ */
  #page-password .pw-out-header {
    display: flex; align-items: center;
    justify-content: space-between; margin-bottom: 14px;
  }
  #page-password .pw-out-title {
    font-family: var(--mono); font-size: 12px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 1.2px; color: var(--muted);
  }
  #page-password .pw-regen {
    padding: 5px 12px; border-radius: 7px; cursor: pointer;
    background: var(--bg3); border: 1px solid var(--border);
    font-family: var(--mono); font-size: 11px; color: var(--muted2);
    transition: all .15s;
  }
  #page-password .pw-regen:hover { color: var(--text); border-color: var(--border2); }
  
  /* ── Stats strip ── */
  #page-password .pw-stats {
    display: grid; grid-template-columns: repeat(3,1fr);
    gap: 8px; margin-bottom: 14px;
  }
  #page-password .pw-stat {
    background: var(--bg2); border: 1px solid var(--border);
    border-radius: var(--r); padding: 10px 8px; text-align: center;
  }
  #page-password .pw-stat-num {
    font-family: var(--mono); font-size: 18px; font-weight: 700; color: var(--text);
  }
  #page-password .pw-stat-lbl {
    font-size: 10px; color: var(--muted); margin-top: 2px;
    font-family: var(--mono);
  }
  
  /* ── Password card ── */
  #page-password .pw-card {
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: var(--r2);
    padding: 14px 16px;
    margin-bottom: 10px;
    transition: border-color .2s;
    animation: pwFadeUp .25s ease both;
  }
  #page-password .pw-card:hover { border-color: var(--border2); }
  @keyframes pwFadeUp {
    from { opacity:0; transform:translateY(6px); }
    to   { opacity:1; transform:none; }
  }
  
  #page-password .pw-text-row {
    display: flex; align-items: flex-start;
    justify-content: space-between; gap: 12px;
  }
  #page-password .pw-text {
    font-family: var(--mono); font-size: 15px; font-weight: 500;
    color: var(--cyan); word-break: break-all; flex: 1; line-height: 1.5;
  }
  
  #page-password .pw-copy-btn {
    flex-shrink: 0; padding: 6px 13px; border-radius: 7px; cursor: pointer;
    background: rgba(91,156,246,0.1); border: 1px solid rgba(91,156,246,0.25);
    font-family: var(--mono); font-size: 11px; font-weight: 700; color: var(--blue);
    transition: all .15s; white-space: nowrap;
  }
  #page-password .pw-copy-btn:hover { background: rgba(91,156,246,0.2); }
  #page-password .pw-copy-btn.pw-copied {
    background: rgba(74,222,128,0.1);
    border-color: rgba(74,222,128,0.3); color: var(--green);
  }
  
  /* Strength bar */
  #page-password .str-row {
    display: flex; align-items: center; gap: 8px; margin-top: 10px;
  }
  #page-password .str-bar {
    flex: 1; height: 4px; border-radius: 2px;
    background: var(--bg3); overflow: hidden;
  }
  #page-password .str-fill {
    height: 100%; border-radius: 2px;
    transition: width .45s cubic-bezier(.4,0,.2,1);
  }
  #page-password .str-label {
    font-family: var(--mono); font-size: 10px; font-weight: 700;
    min-width: 72px; text-align: right;
  }
  
  /* Meta chips */
  #page-password .pw-meta {
    display: flex; align-items: center; gap: 7px;
    margin-top: 8px; flex-wrap: wrap;
  }
  #page-password .pw-chip {
    font-family: var(--mono); font-size: 10px; font-weight: 700;
    padding: 2px 8px; border-radius: 4px;
  }
  #page-password .chip-blue  { background: rgba(91,156,246,0.1); color: var(--blue); }
  #page-password .chip-cyan  { background: rgba(56,217,192,0.1); color: var(--cyan); }
  #page-password .chip-muted { background: var(--bg3); color: var(--muted2); }
  #page-password .chip-green { background: rgba(74,222,128,0.1); color: var(--green); }
  #page-password .chip-red   { background: rgba(248,113,113,0.1); color: var(--red); }
  #page-password .chip-amber { background: rgba(251,191,36,0.1);  color: var(--amber); }
  
  /* Breach row */
  #page-password .breach-row {
    margin-top: 7px; font-size: 11px; font-family: var(--mono);
    display: flex; align-items: center; gap: 6px;
  }
  #page-password .breach-loading { color: var(--muted); }
  #page-password .breach-safe    { color: var(--green); }
  #page-password .breach-found   { color: var(--red); font-weight: 700; }
  #page-password .breach-err     { color: var(--muted); }
  
  /* Card action buttons */
  #page-password .pw-card-actions {
    display: flex; gap: 7px; margin-top: 10px;
  }
  #page-password .pw-act {
    padding: 4px 10px; border-radius: 6px; cursor: pointer;
    background: var(--bg3); border: 1px solid var(--border);
    font-family: var(--mono); font-size: 10px; color: var(--muted2);
    transition: all .15s;
  }
  #page-password .pw-act:hover { color: var(--text); border-color: var(--border2); }
  
  /* Phonetic */
  #page-password .pw-phonetic {
    display: none; margin-top: 9px;
    background: var(--bg); border: 1px solid var(--border);
    border-radius: 8px; padding: 8px 11px;
    font-family: var(--mono); font-size: 10px;
    color: var(--muted2); line-height: 1.9;
  }
  
  /* Clipboard countdown */
  #page-password .pw-cliptimer {
    display: none; align-items: center; gap: 5px;
    margin-top: 6px; font-family: var(--mono);
    font-size: 10px; color: var(--amber);
  }
  
  /* Clipboard snoop warning */
  #page-password .pw-snoop {
    display: none; align-items: center; gap: 8px;
    padding: 10px 14px; border-radius: var(--r);
    background: rgba(248,113,113,0.06);
    border: 1px solid rgba(248,113,113,0.2);
    font-family: var(--mono); font-size: 11px; color: var(--red);
    margin-top: 10px;
  }
  
  /* Action footer */
  #page-password .pw-actions-footer {
    display: none; gap: 8px; flex-wrap: wrap;
    margin-top: 12px;
  }
  #page-password .pw-footer-btn {
    padding: 8px 14px; border-radius: var(--r); cursor: pointer;
    background: var(--bg2); border: 1px solid var(--border);
    font-family: var(--mono); font-size: 11px; font-weight: 700;
    color: var(--muted2); transition: all .15s;
  }
  #page-password .pw-footer-btn:hover {
    color: var(--text); border-color: var(--border2);
    background: var(--bg3);
  }
  
  /* Empty state */
  #page-password .pw-empty {
    text-align: center; padding: 32px 16px; color: var(--muted);
  }
  #page-password .pw-empty-icon { font-size: 30px; margin-bottom: 8px; }
  #page-password .pw-empty p {
    font-family: var(--mono); font-size: 12px; line-height: 1.7;
  }
  
  /* Trust badge */
  #page-password .pw-trust {
    display: flex; align-items: center; gap: 6px;
    padding: 7px 12px; border-radius: var(--r);
    background: rgba(74,222,128,0.05);
    border: 1px solid rgba(74,222,128,0.15);
    font-family: var(--mono); font-size: 10px;
    font-weight: 700; color: var(--green);
    margin-bottom: 16px;
  }
  #page-password .pw-trust-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--green); animation: pwPulse 2s infinite;
  }
  @keyframes pwPulse { 0%,100%{opacity:1} 50%{opacity:.3} }
  
  /* Exclude input */
  #page-password .excl-input {
    width: 100%; padding: 8px 11px;
    background: var(--bg); border: 1px solid var(--border);
    border-radius: 8px; color: var(--text);
    font-family: var(--mono); font-size: 12px; outline: none;
    transition: border-color .2s;
  }
  #page-password .excl-input:focus { border-color: var(--border2); }
  </style>
  
  <!-- ═══════════════  PAGE HEADER  ═══════════════ -->
  <div class="page-header">
    <div class="page-title">🔐 KeyForge Password Generator</div>
    <div class="page-desc">crypto.getRandomValues() · HIBP breach-check · 100% local — nothing sent to any server</div>
  </div>
  
  <!-- ═══════════════  TWO-COLUMN LAYOUT  ═══════════════ -->
  <div class="pw-layout">
  
    <!-- ══ LEFT — CONTROLS ══ -->
    <div class="pw-left">
  
      <!-- MODE SELECTOR -->
      <div class="card">
        <div class="pw-label"><span>01</span> Choose Password Style</div>
        <div class="mode-grid">
          <div class="mode-card pw-selected" onclick="pwSelectMode('memorable',this)">
            <div class="mode-emoji">🧠</div>
            <div class="mode-name">Memorable</div>
            <div class="mode-desc">Based on a personal phrase you'll never forget</div>
            <div class="mode-rec">Best for most</div>
          </div>
          <div class="mode-card" onclick="pwSelectMode('passphrase',this)">
            <div class="mode-emoji">📖</div>
            <div class="mode-name">Passphrase</div>
            <div class="mode-desc">4–6 random words, easy to type and recall</div>
          </div>
          <div class="mode-card" onclick="pwSelectMode('random',this)">
            <div class="mode-emoji">🎲</div>
            <div class="mode-name">Full Random</div>
            <div class="mode-desc">Cryptographically random, maximum security</div>
          </div>
        </div>
  
        <!-- MEMORABLE INPUT -->
        <div id="pw-input-memorable">
          <div class="pw-label"><span>02</span> Your Memorable Phrase</div>
          <input type="text" class="pw-input" id="pw-sentence"
            placeholder="e.g., My first router was a Cisco 2811 in 2012"
            autocomplete="off">
          <div class="pw-hint">
            <strong>Tip:</strong> Use something only you'd know — a memory, a place, a year.
            Your phrase never leaves this browser.
          </div>
        </div>
  
        <!-- PASSPHRASE INPUT -->
        <div id="pw-input-passphrase" style="display:none">
          <div class="pw-label"><span>02</span> Passphrase Length</div>
          <div class="slider-row">
            <span>Words</span>
            <input type="range" id="pw-pp-words" min="3" max="8" value="5"
              oninput="document.getElementById('pw-pp-words-val').textContent=this.value">
            <strong id="pw-pp-words-val">5</strong>
          </div>
          <div class="slider-guide"><span>3 — shorter</span><span>8 — strongest</span></div>
          <div class="pw-label" style="margin-top:14px;">Word Separator</div>
          <div class="sep-opts" id="pw-sep-row">
            <div class="sep-opt pw-sel" onclick="pwSetSep(this,'-')">– hyphen</div>
            <div class="sep-opt" onclick="pwSetSep(this,'.')">· dot</div>
            <div class="sep-opt" onclick="pwSetSep(this,'_')">_ under</div>
            <div class="sep-opt" onclick="pwSetSep(this,'#')"># hash</div>
            <div class="sep-opt" onclick="pwSetSep(this,'')">(none)</div>
          </div>
        </div>
  
        <!-- RANDOM INPUT -->
        <div id="pw-input-random" style="display:none">
          <div class="pw-label"><span>02</span> Random Length</div>
          <div class="slider-row">
            <span>Length</span>
            <input type="range" id="pw-rnd-length" min="8" max="64" value="20"
              oninput="document.getElementById('pw-rnd-len-val').textContent=this.value">
            <strong id="pw-rnd-len-val">20</strong>
          </div>
          <div class="slider-guide"><span>8 — min</span><span>20 — recommended</span><span>64 — max</span></div>
        </div>
      </div>
  
      <!-- OPTIONS -->
      <div class="card">
        <div class="pw-label"><span>03</span> Password Options</div>
  
        <!-- Length (memorable mode) -->
        <div class="pw-section" id="pw-len-section">
          <div class="slider-row">
            <span>Length</span>
            <input type="range" id="pw-length" min="8" max="40" value="16"
              oninput="document.getElementById('pw-len-val').textContent=this.value">
            <strong id="pw-len-val">16</strong>
          </div>
          <div class="slider-guide"><span>8 — min</span><span>16 — recommended ✓</span><span>40 — max</span></div>
        </div>
  
        <!-- Include types -->
        <div class="pw-section">
          <div class="pw-label">Include in password</div>
          <div class="pw-toggles">
            <label class="pw-toggle pw-on" id="pw-tg-digits" onclick="pwToggle(this,'pw-incl-digits')">
              <input type="checkbox" id="pw-incl-digits" checked>
              <div class="pw-toggle-dot"></div> Numbers
            </label>
            <label class="pw-toggle pw-on" id="pw-tg-special" onclick="pwToggle(this,'pw-incl-special')">
              <input type="checkbox" id="pw-incl-special" checked>
              <div class="pw-toggle-dot"></div> Symbols
            </label>
            <label class="pw-toggle pw-on" id="pw-tg-case" onclick="pwToggle(this,'pw-incl-case')">
              <input type="checkbox" id="pw-incl-case" checked>
              <div class="pw-toggle-dot"></div> Mixed Case
            </label>
          </div>
        </div>
  
        <!-- Count -->
        <div class="pw-section">
          <div class="pw-label">How many passwords?</div>
          <div class="pw-toggles" id="pw-count-row">
            <label class="pw-toggle"    onclick="pwSetCount(this,3)"><input type="radio" name="pwcount"> 3</label>
            <label class="pw-toggle pw-on" onclick="pwSetCount(this,4)"><input type="radio" name="pwcount" checked> 4</label>
            <label class="pw-toggle"    onclick="pwSetCount(this,5)"><input type="radio" name="pwcount"> 5</label>
            <label class="pw-toggle"    onclick="pwSetCount(this,6)"><input type="radio" name="pwcount"> 6</label>
          </div>
        </div>
  
        <!-- ADVANCED ACCORDION -->
        <div class="adv-hdr" id="pw-adv-hdr" onclick="pwToggleAdv()">
          <span>⚙ Advanced Settings <span style="font-size:10px;opacity:.5;margin-left:6px">(optional)</span></span>
          <span class="adv-arrow">▾</span>
        </div>
        <div class="adv-body" id="pw-adv-body">
  
          <div class="adv-subsection" id="pw-adv-strategy">
            <div class="pw-label">Substitution Style</div>
            <div class="pw-radio-list">
              <label class="pw-radio">
                <input type="radio" name="pw-strategy" value="vowels" checked>
                Replace vowels only
                <span class="radio-tag tag-green">Easy to read</span>
              </label>
              <label class="pw-radio">
                <input type="radio" name="pw-strategy" value="smart">
                Smart mix — vowels + consonants
                <span class="radio-tag tag-amber">Balanced</span>
              </label>
              <label class="pw-radio">
                <input type="radio" name="pw-strategy" value="fullleet">
                Aggressive — replace everything
                <span class="radio-tag tag-red">Max security</span>
              </label>
            </div>
          </div>
  
          <div class="adv-subsection" id="pw-adv-leet">
            <div class="pw-label">Substitution Intensity</div>
            <div class="pw-radio-list">
              <label class="pw-radio">
                <input type="radio" name="pw-leet" value="basic">
                Light &nbsp;<span style="color:var(--muted);font-size:11px;">(a→@ e→3)</span>
                <span class="radio-tag tag-green">Most readable</span>
              </label>
              <label class="pw-radio">
                <input type="radio" name="pw-leet" value="medium" checked>
                Medium &nbsp;<span style="color:var(--muted);font-size:11px;">(more replacements)</span>
              </label>
              <label class="pw-radio">
                <input type="radio" name="pw-leet" value="full">
                Heavy &nbsp;<span style="color:var(--muted);font-size:11px;">(maximum obfuscation)</span>
                <span class="radio-tag tag-red">Hardest to type</span>
              </label>
            </div>
          </div>
  
          <div class="adv-subsection">
            <div class="pw-label">Security Extras</div>
            <div class="pw-toggles">
              <label class="pw-toggle pw-on" id="pw-tg-hibp" onclick="pwToggle(this,'pw-check-hibp')">
                <input type="checkbox" id="pw-check-hibp" checked>
                <div class="pw-toggle-dot"></div> Breach DB Check
              </label>
              <label class="pw-toggle pw-on" id="pw-tg-autoclr" onclick="pwToggle(this,'pw-auto-clr')">
                <input type="checkbox" id="pw-auto-clr" checked>
                <div class="pw-toggle-dot"></div> Auto-clear clipboard (30s)
              </label>
            </div>
          </div>
  
          <div class="adv-subsection" id="pw-adv-excl" style="display:none">
            <div class="pw-label">Exclude Characters</div>
            <input type="text" class="excl-input" id="pw-excl-chars"
              placeholder='e.g., 0 O 1 l I " / \'>
            <div style="font-family:var(--mono);font-size:10px;color:var(--muted);margin-top:5px;">
              Useful when a system rejects certain symbols
            </div>
          </div>
        </div><!-- /adv-body -->
      </div>
  
      <!-- GENERATE BUTTON -->
      <button class="pw-gen-btn" onclick="pwGenerate()">
        <span>🔐</span> Generate Passwords
      </button>
  
    </div><!-- /pw-left -->
  
    <!-- ══ RIGHT — OUTPUT (sticky) ══ -->
    <div class="pw-right">
      <div class="card">
  
        <div class="pw-trust">
          <div class="pw-trust-dot"></div>
          100% LOCAL — Nothing sent to any server
        </div>
  
        <div class="pw-out-header">
          <div class="pw-out-title">Generated Passwords</div>
          <button class="pw-regen" onclick="pwGenerate()">↺ Regenerate</button>
        </div>
  
        <!-- Stats -->
        <div class="pw-stats" id="pw-stats" style="display:none">
          <div class="pw-stat">
            <div class="pw-stat-num" id="pw-stat-bits">—</div>
            <div class="pw-stat-lbl">avg entropy</div>
          </div>
          <div class="pw-stat">
            <div class="pw-stat-num" id="pw-stat-strong">—</div>
            <div class="pw-stat-lbl">strong</div>
          </div>
          <div class="pw-stat">
            <div class="pw-stat-num" id="pw-stat-leaked">—</div>
            <div class="pw-stat-lbl">leaked</div>
          </div>
        </div>
  
        <!-- Password list -->
        <div id="pw-list">
          <div class="pw-empty">
            <div class="pw-empty-icon">🔑</div>
            <p>Choose a style on the left<br>and click <strong>Generate Passwords</strong></p>
          </div>
        </div>
  
        <!-- Clipboard snoop warning -->
        <div class="pw-snoop" id="pw-snoop">
          ⚠ Another app was focused after copying — clipboard may be exposed.
        </div>
  
        <!-- Footer actions -->
        <div class="pw-actions-footer" id="pw-footer-actions">
          <button class="pw-footer-btn" onclick="pwCopyAll()">📋 Copy All</button>
          <button class="pw-footer-btn" onclick="pwDownloadTxt()">💾 Save .txt</button>
          <button class="pw-footer-btn" onclick="pwDownloadICS()">📅 Rotate Reminder (90d)</button>
        </div>
  
        <!-- Pro tip -->
        <div id="pw-tip" style="display:none;margin-top:12px;padding:10px 12px;background:rgba(91,156,246,0.05);border:1px solid rgba(91,156,246,0.12);border-radius:var(--r);font-family:var(--mono);font-size:11px;color:var(--muted2);line-height:1.7;">
          💡 <strong style="color:var(--blue)">Tip:</strong>
          Pick the password that feels natural to say aloud.
          The easier it sounds, the faster you'll type it — and remember it.
        </div>
  
      </div><!-- /card -->
    </div><!-- /pw-right -->
  
  </div><!-- /pw-layout -->
  `;
  })();
  
  
  /* ═══════════════════════════════════════════════════════════════
     ENGINE
  ═══════════════════════════════════════════════════════════════ */
  
  /* ── Wordlist (300 words) ── */
  const PW_WORDLIST = ['apple','bridge','castle','dragon','eagle','flame','garden','harbor','island','jungle','kitten','lantern','marble','needle','orange','paddle','quartz','ribbon','silver','timber','umbrella','valley','walnut','yellow','zephyr','anchor','basket','candle','dagger','engine','falcon','gravel','hunter','jacket','kernel','laser','mango','napkin','oyster','pepper','rocket','saddle','turret','venom','winter','acorn','blaze','crane','dense','ember','frost','grove','hinge','inlet','jewel','lemon','maple','noble','orbit','plank','quill','raven','stone','thorn','unity','vivid','wrist','arrow','brine','coral','drift','epoch','flint','gloom','haven','ivory','judge','lunar','mirth','onset','prism','ridge','spark','trove','ultra','verse','whirl','alarm','baton','chord','delta','eerie','forge','gnome','hippo','icing','joust','lotus','moose','nerve','optic','pulse','quest','realm','snare','tidal','vigor','wedge','broth','crisp','dunce','elbow','fizzy','graft','hoist','joker','karma','lemur','masks','oxbow','pinch','quirk','rivet','tabby','viper','yacht','adorn','bevel','civic','dowry','envoy','finch','glint','helix','irony','joist','lilac','mural','octet','plume','radar','saint','tithe','unify','wizen','yearn','abode','brash','clump','dwarf','ethos','fjord','guile','heron','inlay','jazzy','lyric','muted','nadir','olive','plaid','query','relic','scone','tangy','verge','aztec','blunt','crest','ditty','frond','girth','humid','index','kneel','latch','melon','niche','piano','renew','scout','plume','crimp','risky','blend','tower','depot','handy','finch','grill','spade','brace','oxide','trunk','witch','moult','boxer','groan'];
  
  /* ── Leet maps ── */
  const PW_MAPS = {
    basic:  {a:'@',A:'@',e:'3',E:'3',i:'1',I:'1',o:'0',O:'0',s:'5',S:'5'},
    medium: {a:'@',A:'@',b:'8',B:'8',c:'(',C:'(',e:'3',E:'3',g:'9',G:'9',i:'1',I:'1',l:'|',L:'|',o:'0',O:'0',s:'5',S:'5',t:'7',T:'7'},
    full:   {a:'@',A:'4',b:'8',B:'8',c:'(',C:'(',e:'3',E:'3',g:'9',G:'9',h:'#',H:'#',i:'1',I:'!',l:'|',L:'|',o:'0',O:'0',s:'5',S:'$',t:'7',T:'7',z:'2',Z:'2'}
  };
  
  /* ── Crypto random ── */
  function pwRndInt(max) {
    if (max <= 1) return 0;
    const a = new Uint32Array(1);
    const lim = Math.floor(0xFFFFFFFF / max) * max;
    let v; do { crypto.getRandomValues(a); v = a[0]; } while (v >= lim);
    return v % max;
  }
  function pwPick(arr) { return arr[pwRndInt(arr.length)]; }
  function pwShuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = pwRndInt(i + 1); [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  
  /* ── Entropy ── */
  function pwEntropy(pw) {
    let p = 0;
    if (/[a-z]/.test(pw)) p += 26;
    if (/[A-Z]/.test(pw)) p += 26;
    if (/\d/.test(pw))    p += 10;
    if (/[^a-zA-Z0-9]/.test(pw)) p += 32;
    return p < 2 ? 0 : Math.floor(pw.length * Math.log2(p));
  }
  function pwStrInfo(bits) {
    if (bits >= 80) return { label:'Very Strong', color:'var(--green)',  pct:100 };
    if (bits >= 60) return { label:'Strong',      color:'var(--cyan)',   pct:78  };
    if (bits >= 40) return { label:'Fair',         color:'var(--amber)', pct:50  };
    if (bits >= 25) return { label:'Weak',         color:'var(--red)',   pct:28  };
    return               { label:'Very Weak',   color:'var(--red)',   pct:10  };
  }
  
  /* ── HIBP ── */
  async function pwHIBP(pw) {
    try {
      const buf = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(pw));
      const hex = [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2,'0')).join('').toUpperCase();
      const res = await fetch(`https://api.pwnedpasswords.com/range/${hex.slice(0,5)}`, {cache:'no-store'});
      if (!res.ok) return null;
      return (await res.text()).split('\r\n').some(l => l.startsWith(hex.slice(5)));
    } catch { return null; }
  }
  
  /* ── NATO phonetic ── */
  const PW_NATO = {a:'Alpha',b:'Bravo',c:'Charlie',d:'Delta',e:'Echo',f:'Foxtrot',g:'Golf',h:'Hotel',i:'India',j:'Juliet',k:'Kilo',l:'Lima',m:'Mike',n:'November',o:'Oscar',p:'Papa',q:'Quebec',r:'Romeo',s:'Sierra',t:'Tango',u:'Uniform',v:'Victor',w:'Whiskey',x:'X-ray',y:'Yankee',z:'Zulu'};
  function pwPhonetic(pw) {
    return pw.split('').map(c => { const l = c.toLowerCase(); return PW_NATO[l] || (/\d/.test(c) ? `[${c}]` : `{${c}}`); }).join(' · ');
  }
  
  /* ── Helpers ── */
  function pwApplyMap(str, map) { return str.split('').map(c => map[c] ?? c).join(''); }
  function pwEsc(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  
  /* ── Generators ── */
  function pwGenMemorable(words, idx) {
    const leet   = document.querySelector('input[name="pw-leet"]:checked')?.value || 'medium';
    const strat  = document.querySelector('input[name="pw-strategy"]:checked')?.value || 'vowels';
    const digits = document.getElementById('pw-incl-digits')?.checked;
    const spec   = document.getElementById('pw-incl-special')?.checked;
    const mcase  = document.getElementById('pw-incl-case')?.checked;
    const length = parseInt(document.getElementById('pw-length')?.value) || 16;
    const map    = {...PW_MAPS[leet]};
    const SPEC   = ['!','#','$','%','&','*','?','@'];
  
    let parts = words.map(w => {
      if (strat === 'vowels') return w.replace(/[aeiouAEIOU]/g, c => map[c] ?? c);
      if (strat === 'smart')  return pwApplyMap(w, {...map, s:'5',S:'5',g:'9',G:'9',t:'7',T:'7'});
      return pwApplyMap(w, map);
    });
  
    let c = parts.join('');
    switch (idx % 4) {
      case 1: c = c.split('').reverse().join(''); break;
      case 2: if (leet==='basic') c=pwApplyMap(c,PW_MAPS.medium); else if(leet==='medium') c=pwApplyMap(c,PW_MAPS.full); break;
      case 3: { const ns=c.match(/\d+/g)||[]; c=c.replace(/\d+/g,'')+ns.join(''); } break;
    }
    if (digits && !/\d/.test(c)) { const n=(words.join('').match(/\d+/g)||['42']).join(''); c+=n; }
    if (spec   && !/[!@#$%&*?]/.test(c)) c += SPEC[idx % SPEC.length];
    if (mcase) {
      let t=true, out='';
      for (const ch of c) {
        if (/[a-zA-Z]/.test(ch)) { out += t ? ch.toUpperCase() : ch.toLowerCase(); t=!t; }
        else out += ch;
      }
      c = out;
      if (!/[a-z]/.test(c)) c = c.replace(/[A-Z]/, m => m.toLowerCase());
      else if (!/[A-Z]/.test(c)) c = c.replace(/[a-z]/, m => m.toUpperCase());
    }
    const PAD = '7@3$1'; let pi = 0;
    while (c.length < length) { c += PAD[pi++ % PAD.length]; }
    c = c.slice(0, length);
    if (digits && !/\d/.test(c)) c = c.slice(0,-1) + '7';
    if (spec   && !/[!@#$%&*?]/.test(c)) c = c.slice(0,-1) + SPEC[(idx+2)%SPEC.length];
    return c;
  }
  
  let pwSep = '-';
  function pwSetSep(el, sep) {
    pwSep = sep;
    document.querySelectorAll('#pw-sep-row .sep-opt').forEach(e => e.classList.remove('pw-sel'));
    el.classList.add('pw-sel');
  }
  
  function pwGenPassphrase() {
    const n    = parseInt(document.getElementById('pw-pp-words')?.value) || 5;
    const caps = document.getElementById('pw-incl-case')?.checked;
    const digs = document.getElementById('pw-incl-digits')?.checked;
    const spec = document.getElementById('pw-incl-special')?.checked;
    const words = [];
    for (let i = 0; i < n; i++) {
      let w = pwPick(PW_WORDLIST);
      if (caps) w = w[0].toUpperCase() + w.slice(1);
      words.push(w);
    }
    let pw = words.join(pwSep);
    if (digs) pw += pwRndInt(100);
    if (spec) pw += pwPick(['!','@','#','$','%','&','*']);
    return pw;
  }
  
  function pwGenRandom() {
    const len   = parseInt(document.getElementById('pw-rnd-length')?.value) || 20;
    const upper = document.getElementById('pw-incl-case')?.checked;
    const digs  = document.getElementById('pw-incl-digits')?.checked;
    const spec  = document.getElementById('pw-incl-special')?.checked;
    const excl  = document.getElementById('pw-excl-chars')?.value || '';
    let cs = 'abcdefghijklmnopqrstuvwxyz';
    if (upper) cs += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (digs)  cs += '0123456789';
    if (spec)  cs += '!@#$%^&*()-_=+[]{}|;:,.<>?';
    cs = [...new Set(cs.split(''))].filter(c => !excl.includes(c)).join('');
    if (!cs) cs = 'abcdefghijkmnopqrstuvwxyz23456789';
    let must = '';
    if (upper && /[A-Z]/.test(cs)) must += pwPick(cs.match(/[A-Z]/g));
    if (/[a-z]/.test(cs))          must += pwPick(cs.match(/[a-z]/g));
    if (digs  && /\d/.test(cs))    must += pwPick(cs.match(/\d/g));
    if (spec  && /[^a-zA-Z0-9]/.test(cs)) must += pwPick(cs.match(/[^a-zA-Z0-9]/g));
    let pw = must;
    while (pw.length < len) pw += pwPick([...cs]);
    return pwShuffle([...pw]).slice(0, len).join('');
  }
  
  /* ═══════════════════════════════════════════════════════════════
     UI STATE
  ═══════════════════════════════════════════════════════════════ */
  let pwCurrentMode  = 'memorable';
  let pwVariantCount = 4;
  let pwLastPasswords = [];
  let pwClipDirty    = false;
  let pwClipTimers   = [];
  
  function pwSelectMode(mode, el) {
    pwCurrentMode = mode;
    document.querySelectorAll('#page-password .mode-card').forEach(c => c.classList.remove('pw-selected'));
    el.classList.add('pw-selected');
    document.getElementById('pw-input-memorable').style.display  = mode === 'memorable'  ? '' : 'none';
    document.getElementById('pw-input-passphrase').style.display = mode === 'passphrase' ? '' : 'none';
    document.getElementById('pw-input-random').style.display     = mode === 'random'     ? '' : 'none';
    document.getElementById('pw-len-section').style.display      = mode === 'memorable'  ? '' : 'none';
    document.getElementById('pw-adv-strategy').style.display     = mode === 'memorable'  ? '' : 'none';
    document.getElementById('pw-adv-leet').style.display         = mode === 'memorable'  ? '' : 'none';
    document.getElementById('pw-adv-excl').style.display         = mode === 'random'     ? '' : 'none';
  }
  
  function pwToggle(lbl, id) {
    const inp = document.getElementById(id);
    inp.checked = !inp.checked;
    lbl.classList.toggle('pw-on', inp.checked);
  }
  
  function pwSetCount(el, n) {
    pwVariantCount = n;
    document.querySelectorAll('#pw-count-row .pw-toggle').forEach(t => t.classList.remove('pw-on'));
    el.classList.add('pw-on');
  }
  
  function pwToggleAdv() {
    const hdr  = document.getElementById('pw-adv-hdr');
    const body = document.getElementById('pw-adv-body');
    hdr.classList.toggle('adv-open');
    body.classList.toggle('adv-open');
  }
  
  /* ── Clipboard auto-clear ── */
    function pwFallbackCopy(text) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0';
        document.body.appendChild(ta);
        ta.focus(); ta.select();
        try { document.execCommand('copy'); } catch(e) {}
        document.body.removeChild(ta);
    }
    
    function pwCopyWithClear(text, btn, cardId) {
        const doClip = () => {
        btn.textContent = '✓ Copied'; btn.classList.add('pw-copied');
        setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('pw-copied'); }, 1200);
        pwClipDirty = true;
        if (document.getElementById('pw-auto-clr')?.checked) {
            pwClipTimers.forEach(clearTimeout); pwClipTimers = [];
            const timer = document.getElementById('pw-cliptimer-' + cardId);
            const ct    = document.getElementById('pw-ct-' + cardId);
            if (timer) {
            timer.style.display = 'flex'; let s = 30; ct.textContent = s;
            const iv = setInterval(() => { s--; ct.textContent = s; if (s <= 0) { clearInterval(iv); timer.style.display = 'none'; } }, 1000);
            pwClipTimers.push(setTimeout(() => { navigator.clipboard?.writeText(''); timer.style.display = 'none'; }, 30000));
            }
        }
        };
        if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(doClip).catch(() => { pwFallbackCopy(text); doClip(); });
        } else {
        pwFallbackCopy(text); doClip();
        }
    }
  
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && pwClipDirty) {
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          const w = document.getElementById('pw-snoop');
          if (w) { w.style.display = 'flex'; pwClipDirty = false; setTimeout(() => w.style.display = 'none', 6000); }
        }
      }, { once: true });
    }
  });
  
  /* ── Toggle mask / phonetic ── */
  function pwToggleMask(idx, btn) {
    const el = document.getElementById('pwt-' + idx);
    const pw = pwLastPasswords[idx] || '';
    if (el.dataset.masked === '1') { el.textContent = pw; el.dataset.masked = '0'; btn.textContent = 'Hide'; }
    else { el.textContent = '•'.repeat(pw.length); el.dataset.masked = '1'; btn.textContent = 'Show'; }
  }
  function pwTogglePhonetic(idx, btn) {
    const el = document.getElementById('pw-phon-' + idx);
    const pw = pwLastPasswords[idx] || '';
    if (el.style.display === 'none') { el.textContent = pwPhonetic(pw); el.style.display = 'block'; btn.textContent = 'Hide Phonetic'; }
    else { el.style.display = 'none'; btn.textContent = 'Phonetic'; }
  }
  
  /* ── Render card ── */
  function pwRenderCard(pw, idx) {
    const bits = pwEntropy(pw);
    const si   = pwStrInfo(bits);
    const card = document.createElement('div');
    card.className = 'pw-card';
    card.style.animationDelay = (idx * 0.07) + 's';
    card.innerHTML = `
      <div class="pw-text-row">
        <div class="pw-text" id="pwt-${idx}">${pwEsc(pw)}</div>
        <button class="pw-copy-btn" id="pw-copybtn-${idx}">Copy</button>
      </div>
      <div class="str-row">
        <div class="str-bar"><div class="str-fill" style="width:${si.pct}%;background:${si.color}"></div></div>
        <div class="str-label" style="color:${si.color}">${si.label}</div>
      </div>
      <div class="pw-meta">
        <span class="pw-chip chip-blue">~${bits} bits</span>
        <span class="pw-chip chip-cyan">${pw.length} chars</span>
      </div>
      <div class="breach-row breach-loading" id="pw-breach-${idx}">🔍 Checking breach database…</div>
      <div class="pw-card-actions">
        <button class="pw-act" id="pw-maskbtn-${idx}">Hide</button>
        <button class="pw-act" id="pw-phonbtn-${idx}">Phonetic</button>
      </div>
      <div class="pw-phonetic" id="pw-phon-${idx}"></div>
      <div class="pw-cliptimer" id="pw-cliptimer-${idx}">
        ⏳ Clipboard clears in <strong id="pw-ct-${idx}">30</strong>s
      </div>
    `;
    card.querySelector('#pw-copybtn-' + idx)
        .addEventListener('click', function() { pwCopyWithClear(pw, this, idx); });
    card.querySelector('#pw-maskbtn-' + idx)
        .addEventListener('click', function() { pwToggleMask(idx, this); });
    card.querySelector('#pw-phonbtn-' + idx)
        .addEventListener('click', function() { pwTogglePhonetic(idx, this); });
    return card;
  }
  
  /* ═══════════════════════════════════════════════════════════════
     MAIN GENERATE
  ═══════════════════════════════════════════════════════════════ */
  function pwGenerate() {
    const list     = document.getElementById('pw-list');
    const doHIBP   = document.getElementById('pw-check-hibp')?.checked;
    if (!list) return;
    list.innerHTML = '';
    pwLastPasswords = [];
  
    let passwords = [];
  
    if (pwCurrentMode === 'memorable') {
      const sentence = document.getElementById('pw-sentence')?.value.trim();
      if (!sentence) {
        list.innerHTML = `<div class="pw-empty"><div class="pw-empty-icon">✏️</div><p>Please enter a memorable<br>phrase in the left panel first.</p></div>`;
        return;
      }
      const words = sentence.trim().split(/\s+/).filter(Boolean);
      for (let i = 0; i < pwVariantCount; i++) passwords.push(pwGenMemorable(words, i));
    } else if (pwCurrentMode === 'passphrase') {
      for (let i = 0; i < pwVariantCount; i++) passwords.push(pwGenPassphrase());
    } else {
      for (let i = 0; i < pwVariantCount; i++) passwords.push(pwGenRandom());
    }
  
    pwLastPasswords = passwords;
  
    passwords.forEach((pw, i) => list.appendChild(pwRenderCard(pw, i)));
  
    // Stats
    const bits   = passwords.map(pwEntropy);
    const avg    = Math.round(bits.reduce((a,b) => a+b, 0) / bits.length);
    const strong = bits.filter(b => b >= 60).length;
    document.getElementById('pw-stat-bits').textContent   = avg;
    document.getElementById('pw-stat-strong').textContent = `${strong}/${passwords.length}`;
    document.getElementById('pw-stat-leaked').textContent = doHIBP ? '…' : '—';
    document.getElementById('pw-stats').style.display            = 'grid';
    document.getElementById('pw-footer-actions').style.display   = 'flex';
    document.getElementById('pw-tip').style.display              = 'block';
    document.getElementById('pw-snoop').style.display            = 'none';
  
    // HIBP checks
    if (doHIBP) {
      let leakCount = 0, done = 0;
      passwords.forEach((pw, i) => {
        pwHIBP(pw).then(res => {
          done++;
          const el = document.getElementById(`pw-breach-${i}`);
          if (!el) return;
          if (res === null) {
            el.className = 'breach-row breach-err';
            el.textContent = '⚠ Could not reach breach database';
          } else if (res) {
            leakCount++;
            el.className = 'breach-row breach-found';
            el.textContent = '🚨 Found in breach database — avoid using this!';
          } else {
            el.className = 'breach-row breach-safe';
            el.textContent = '✅ Not found in any known data breach';
          }
          if (done === passwords.length)
            document.getElementById('pw-stat-leaked').textContent = leakCount === 0 ? '0 ✅' : `${leakCount} 🚨`;
        });
      });
    } else {
      passwords.forEach((_, i) => {
        const el = document.getElementById(`pw-breach-${i}`);
        if (el) el.style.display = 'none';
      });
    }
  }
  
  /* ── Bulk actions ── */
  function pwCopyAll() {
    if (!pwLastPasswords.length) return;
    const text = pwLastPasswords.join('\n');
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => pwFallbackCopy(text));
    } else {
      pwFallbackCopy(text);
    }
  }
  function pwDownloadTxt() {
    if (!pwLastPasswords.length) return;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([pwLastPasswords.join('\n')], {type:'text/plain'}));
    a.download = 'keyforge-passwords.txt';
    document.body.appendChild(a); a.click(); a.remove();
  }
  function pwDownloadICS() {
    const now = new Date(), then = new Date(now.getTime() + 90 * 864e5);
    const fmt = d => d.toISOString().replace(/[-:]/g,'').split('.')[0] + 'Z';
    const ics = `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nBEGIN:VEVENT\r\nDTSTART:${fmt(then)}\r\nDTEND:${fmt(new Date(then.getTime()+36e5))}\r\nSUMMARY:🔐 Rotate passwords (SubnetLab KeyForge)\r\nDESCRIPTION:Passwords generated on ${now.toLocaleDateString()}. Open KeyForge to generate new ones.\r\nEND:VEVENT\r\nEND:VCALENDAR`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([ics], {type:'text/calendar'}));
    a.download = 'rotate-passwords.ics';
    document.body.appendChild(a); a.click(); a.remove();
  }
  
  /* ── Enter key on sentence input ── */
  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.id === 'pw-sentence') pwGenerate();
  });
  
  /* ── Rotating placeholders ── */
  const PW_PH = [
    'My first router was a Cisco 2811 in 2012',
    'I passed my CCNA exam on March 15 2019',
    'My home lab switch is a Catalyst 3560',
    'I joined Cisco training in the summer of 2018',
    'My favourite protocol is BGP since 2015',
    'I built my first network in college 2010',
    'I deployed my first MPLS VPN in 2016',
  ];
  (function pwSetPlaceholder() {
    const el = document.getElementById('pw-sentence');
    if (el) el.placeholder = 'e.g., ' + PW_PH[pwRndInt(PW_PH.length)];
  })();

  /* ── Expose functions to global scope for onclick attributes ── */
  window.pwSelectMode   = pwSelectMode;
  window.pwSetSep       = pwSetSep;
  window.pwToggle       = pwToggle;
  window.pwSetCount     = pwSetCount;
  window.pwToggleAdv    = pwToggleAdv;
  window.pwGenerate     = pwGenerate;
  window.pwCopyAll      = pwCopyAll;
  window.pwDownloadTxt  = pwDownloadTxt;
  window.pwDownloadICS  = pwDownloadICS;