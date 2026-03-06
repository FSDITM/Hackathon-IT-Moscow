export const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,700;1,800&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: #0D0F14;
    color: #F0F2F7;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  :root {
    /* IT.МОСКВА brand colors */
    --blue:        #4169FF;
    --blue-dark:   #2F52D9;
    --blue-hover:  #3358E8;
    --blue-dim:    rgba(65,105,255,0.10);
    --blue-border: rgba(65,105,255,0.22);
    --blue-light:  #6B8EFF;

    /* Accent colors (secondary, used sparingly) */
    --orange: #FF6B35;
    --green:  #22C55E;
    --red:    #EF4444;
    --yellow: #F5A623;

    /* Backgrounds */
    --bg:    #0D0F14;
    --bg2:   #111418;
    --bg3:   #161A22;
    --card:  #13161E;
    --card2: #181C26;

    /* Borders */
    --border:  rgba(255,255,255,0.07);
    --border2: rgba(255,255,255,0.04);

    /* Text */
    --text:  #F0F2F7;
    --text2: #8A94AA;
    --muted: #4A5268;

    /* Functional */
    --success: #22C55E;
    --danger:  #EF4444;
    --warning: #F5A623;

    /* IT.МОСКВА blue line (branding) */
    --brand-line: 2px solid var(--blue);
  }

  /* ── LAYOUT ─────────────────────────────────────────── */
  .app { display: flex; min-height: 100vh; }

  /* ── SIDEBAR ────────────────────────────────────────── */
  .sidebar {
    width: 244px; min-height: 100vh;
    background: var(--bg2);
    border-right: 1px solid var(--border);
    display: flex; flex-direction: column;
    position: fixed; left: 0; top: 0; bottom: 0; z-index: 100;
  }

  .sidebar-logo {
    padding: 20px 18px 16px;
    border-bottom: 1px solid var(--border2);
    display: flex; align-items: center; gap: 11px;
  }

  /* SVG-like laptop M icon */
  .sidebar-logo-icon {
    width: 34px; height: 34px; flex-shrink: 0;
    background: var(--blue);
    border-radius: 7px;
    display: flex; align-items: center; justify-content: center;
    color: #fff; font-weight: 900; font-size: 16px;
    font-style: italic; letter-spacing: -1px;
    line-height: 1;
  }

  .sidebar-logo-wordmark {
    font-size: 15px; font-weight: 800; letter-spacing: -0.2px;
    line-height: 1;
    color: var(--text);
  }
  .sidebar-logo-wordmark em {
    color: var(--blue); font-style: italic;
  }
  .sidebar-logo-sub {
    font-size: 10px; color: var(--muted);
    letter-spacing: 0.6px; text-transform: uppercase;
    margin-top: 3px; font-weight: 500;
  }

  .sidebar-nav { flex: 1; padding: 10px 0; overflow-y: auto; }

  .nav-section {
    padding: 16px 18px 5px;
    font-size: 10px; color: var(--muted);
    letter-spacing: 1.8px; text-transform: uppercase; font-weight: 600;
  }

  .nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 18px; cursor: pointer; transition: all 0.12s;
    font-size: 13.5px; font-weight: 500; color: var(--text2);
    border-left: 2px solid transparent;
    user-select: none;
  }
  .nav-item:hover { color: var(--text); background: rgba(255,255,255,0.025); }
  .nav-item.active {
    color: var(--blue); background: var(--blue-dim);
    border-left-color: var(--blue); font-weight: 600;
  }
  .nav-item .icon { font-size: 15px; width: 20px; text-align: center; }

  .sidebar-user {
    padding: 13px 18px; border-top: 1px solid var(--border2);
    display: flex; align-items: center; gap: 10px; cursor: pointer;
    transition: background 0.12s;
  }
  .sidebar-user:hover { background: rgba(255,255,255,0.025); }

  .user-avatar-sm {
    width: 32px; height: 32px; border-radius: 7px; flex-shrink: 0;
    background: var(--blue-dim); border: 1px solid var(--blue-border);
    display: flex; align-items: center; justify-content: center; font-size: 15px;
  }
  .user-info-sm .name { font-size: 13px; font-weight: 600; color: var(--text); line-height: 1.2; }
  .user-info-sm .role { font-size: 11px; color: var(--muted); margin-top: 2px; }

  /* ── MAIN ───────────────────────────────────────────── */
  .main { margin-left: 244px; flex: 1; min-height: 100vh; }

  .topbar {
    height: 54px; background: var(--bg2);
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 28px; position: sticky; top: 0; z-index: 50;
  }
  .topbar-title {
    font-size: 12px; font-weight: 700; color: var(--muted);
    letter-spacing: 1.5px; text-transform: uppercase;
  }
  .topbar-right { display: flex; align-items: center; gap: 10px; }

  .coins-badge {
    display: flex; align-items: center; gap: 6px;
    background: rgba(245,166,35,0.08); border: 1px solid rgba(245,166,35,0.2);
    border-radius: 6px; padding: 5px 11px;
    font-size: 13px; font-weight: 600; color: var(--yellow);
  }
  .logout-btn {
    background: transparent; border: 1px solid var(--border);
    color: var(--text2); padding: 6px 14px; border-radius: 6px;
    cursor: pointer; font-family: 'Inter'; font-weight: 500; font-size: 13px;
    transition: all 0.12s;
  }
  .logout-btn:hover { border-color: var(--red); color: var(--red); background: rgba(239,68,68,0.05); }

  .content { padding: 28px; max-width: 1140px; }

  /* ── CARDS ──────────────────────────────────────────── */
  .card {
    background: var(--card); border: 1px solid var(--border);
    border-radius: 10px; padding: 20px;
  }
  /* IT.МОСКВА brand card title — blue line above text */
  .card-title {
    font-size: 10px; font-weight: 700; color: var(--blue);
    letter-spacing: 2px; text-transform: uppercase;
    margin-bottom: 16px; padding-bottom: 10px;
    border-bottom: var(--brand-line);
    display: inline-block;
  }

  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
  .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 18px; }
  .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }

  /* ── BUTTONS ────────────────────────────────────────── */
  .btn {
    padding: 9px 18px; border-radius: 7px; border: none; cursor: pointer;
    font-family: 'Inter'; font-weight: 600; font-size: 13.5px;
    transition: all 0.13s; display: inline-flex; align-items: center; gap: 7px;
    letter-spacing: -0.1px;
  }
  .btn-primary { background: var(--blue); color: #fff; }
  .btn-primary:hover { background: var(--blue-hover); box-shadow: 0 4px 18px rgba(65,105,255,0.30); }
  .btn-secondary {
    background: transparent; border: 1px solid var(--border); color: var(--text2);
  }
  .btn-secondary:hover { background: rgba(255,255,255,0.03); color: var(--text); border-color: rgba(255,255,255,0.12); }
  .btn-danger { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.22); color: var(--red); }
  .btn-danger:hover { background: rgba(239,68,68,0.14); }
  .btn-purple { background: var(--blue-dim); border: 1px solid var(--blue-border); color: var(--blue-light); }
  .btn-purple:hover { background: rgba(65,105,255,0.18); }
  .btn-orange { background: rgba(255,107,53,0.08); border: 1px solid rgba(255,107,53,0.22); color: var(--orange); }
  .btn-orange:hover { background: rgba(255,107,53,0.15); }
  .btn-sm { padding: 6px 12px; font-size: 12px; }
  .btn-full { width: 100%; justify-content: center; }
  .btn:disabled { opacity: 0.35; cursor: not-allowed; }

  /* ── INPUTS ─────────────────────────────────────────── */
  .input {
    background: var(--bg3); border: 1px solid var(--border);
    border-radius: 7px; padding: 9px 13px; color: var(--text);
    font-family: 'Inter'; font-size: 13.5px; font-weight: 400;
    width: 100%; outline: none; transition: border-color 0.13s;
  }
  .input:focus { border-color: var(--blue); box-shadow: 0 0 0 3px rgba(65,105,255,0.10); }
  .input::placeholder { color: var(--muted); }
  .label {
    font-size: 11px; color: var(--text2); letter-spacing: 0.4px;
    text-transform: uppercase; font-weight: 600; margin-bottom: 6px; display: block;
  }
  .form-group { margin-bottom: 16px; }
  select.input { cursor: pointer; }
  select.input option { background: var(--card); }

  /* ── BADGES ─────────────────────────────────────────── */
  .badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 8px; border-radius: 4px;
    font-size: 11px; font-weight: 600; letter-spacing: 0.2px;
  }
  .badge-cyan   { background: var(--blue-dim); color: var(--blue-light); border: 1px solid var(--blue-border); }
  .badge-orange { background: rgba(255,107,53,0.08); color: var(--orange); border: 1px solid rgba(255,107,53,0.2); }
  .badge-purple { background: var(--blue-dim); color: var(--blue-light); border: 1px solid var(--blue-border); }
  .badge-green  { background: rgba(34,197,94,0.08); color: var(--green); border: 1px solid rgba(34,197,94,0.2); }
  .badge-red    { background: rgba(239,68,68,0.08); color: var(--red); border: 1px solid rgba(239,68,68,0.2); }
  .badge-yellow { background: rgba(245,166,35,0.08); color: var(--yellow); border: 1px solid rgba(245,166,35,0.2); }

  /* ── STAT CARDS ─────────────────────────────────────── */
  .stat-card {
    background: var(--card); border: 1px solid var(--border); border-radius: 10px;
    padding: 18px 20px;
  }
  .stat-value { font-size: 26px; font-weight: 800; margin: 6px 0; letter-spacing: -0.5px; }
  .stat-label { font-size: 11px; color: var(--muted); letter-spacing: 0.5px; text-transform: uppercase; font-weight: 500; }
  .stat-icon  { font-size: 20px; margin-bottom: 6px; }

  /* ── ZONE CARDS ─────────────────────────────────────── */
  .zone-card {
    background: var(--card); border: 1px solid var(--border); border-radius: 10px;
    padding: 18px; cursor: pointer; transition: all 0.14s; position: relative; overflow: hidden;
  }
  .zone-card:hover { border-color: var(--blue-border); transform: translateY(-2px); box-shadow: 0 6px 20px rgba(65,105,255,0.10); }
  .zone-card.selected { border-color: var(--blue); background: var(--blue-dim); }
  /* Blue top accent line on selected/hover — IT brand style */
  .zone-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: var(--blue); opacity: 0; transition: opacity 0.14s;
  }
  .zone-card:hover::before, .zone-card.selected::before { opacity: 1; }

  .zone-icon  { font-size: 28px; margin-bottom: 10px; }
  .zone-name  { font-size: 13.5px; font-weight: 700; color: var(--text); margin-bottom: 5px; }
  .zone-desc  { font-size: 12px; color: var(--text2); line-height: 1.5; }
  .zone-seats { font-size: 12px; margin-top: 10px; }

  /* ── CALENDAR ───────────────────────────────────────── */
  .cal-header { font-size: 10px; color: var(--muted); text-align: center; padding: 5px 2px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
  .cal-slot {
    height: 34px; border-radius: 4px; cursor: pointer; transition: all 0.10s;
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; flex-direction: column; font-weight: 500;
  }
  .cal-slot.free       { background: rgba(255,255,255,0.02); border: 1px solid var(--border2); color: var(--muted); }
  .cal-slot.free:hover { background: var(--blue-dim); border-color: var(--blue-border); color: var(--blue-light); }
  .cal-slot.booked     { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.16); cursor: default; color: var(--red); }
  .cal-slot.mine       { background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.22); color: var(--green); }
  .cal-slot.selected   { background: var(--blue-dim); border: 1px solid var(--blue); color: #fff; }
  .cal-slot.class-time { background: rgba(245,166,35,0.06); border: 1px solid rgba(245,166,35,0.18); cursor: not-allowed; color: var(--yellow); }

  /* ── PROGRESS ───────────────────────────────────────── */
  .progress-bar  { background: rgba(255,255,255,0.05); border-radius: 99px; height: 5px; overflow: hidden; }
  .progress-fill { height: 100%; border-radius: 99px; background: var(--blue); transition: width 0.4s; }

  /* ── ACHIEVEMENTS ───────────────────────────────────── */
  .achievement-item {
    display: flex; align-items: center; gap: 14px; padding: 12px;
    background: var(--bg3); border: 1px solid var(--border2); border-radius: 8px; margin-bottom: 8px;
  }
  .achievement-item.locked { opacity: 0.28; filter: grayscale(1); }
  .ach-icon { font-size: 24px; }
  .ach-name { font-size: 13.5px; font-weight: 700; color: var(--text); }
  .ach-desc { font-size: 12px; color: var(--text2); margin-top: 1px; }
  .rarity-legendary { color: var(--yellow); }
  .rarity-epic      { color: var(--blue-light); }
  .rarity-rare      { color: var(--blue); }
  .rarity-common    { color: var(--muted); }

  /* ── FEED ───────────────────────────────────────────── */
  .feed-item { display: flex; align-items: flex-start; gap: 12px; padding: 11px 0; border-bottom: 1px solid var(--border2); }
  .feed-icon {
    width: 32px; height: 32px; border-radius: 7px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center; font-size: 14px;
  }
  .feed-text { font-size: 13px; color: var(--text); line-height: 1.5; }
  .feed-time { font-size: 11px; color: var(--muted); margin-top: 2px; }

  /* ── TOURNAMENT / TEAM ──────────────────────────────── */
  .tournament-card {
    background: var(--card); border: 1px solid var(--border); border-radius: 10px;
    padding: 18px; transition: border-color 0.13s; position: relative; overflow: hidden;
  }
  .tournament-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: var(--blue);
  }
  .tournament-card:hover { border-color: var(--blue-border); }
  .team-card { background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 18px; }

  /* ── AUTH ───────────────────────────────────────────── */
  .auth-screen {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: var(--bg); position: relative; overflow: hidden;
  }
  /* Subtle dot grid — like IT.МОСКВА brand texture */
  .auth-screen::before {
    content: '';
    position: absolute; inset: 0;
    background-image: radial-gradient(circle, rgba(65,105,255,0.08) 1px, transparent 1px);
    background-size: 32px 32px;
  }
  .auth-screen::after {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 70% 60% at 50% 50%, rgba(65,105,255,0.04), transparent 70%);
  }
  .auth-card {
    background: var(--card); border: 1px solid var(--border); border-radius: 14px;
    padding: 40px; width: 400px; position: relative; z-index: 1;
    box-shadow: 0 20px 60px rgba(0,0,0,0.45);
    /* IT.МОСКВА brand: top blue line on card */
    border-top: 2px solid var(--blue);
  }
  .auth-logo-block { text-align: center; margin-bottom: 28px; }
  .auth-logo-badge {
    display: inline-flex; align-items: center; gap: 10px;
    padding: 7px 16px; background: var(--blue-dim);
    border: 1px solid var(--blue-border); border-radius: 8px; margin-bottom: 16px;
  }
  .auth-logo-badge-icon {
    width: 26px; height: 26px; background: var(--blue); border-radius: 5px;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 900; color: #fff; font-style: italic; line-height: 1;
  }
  .auth-logo-badge-text {
    font-size: 15px; font-weight: 800; color: var(--text); letter-spacing: -0.2px;
  }
  .auth-logo-badge-text span { color: var(--blue); font-style: italic; }
  .auth-title  { font-size: 20px; font-weight: 800; color: var(--text); margin-bottom: 4px; text-align: center; letter-spacing: -0.3px; }
  .auth-sub    { text-align: center; color: var(--muted); font-size: 13px; }

  /* ── TABS ───────────────────────────────────────────── */
  .tabs {
    display: flex; gap: 0; background: var(--bg3);
    border: 1px solid var(--border2); border-radius: 7px;
    padding: 3px; margin-bottom: 20px;
  }
  .tab {
    flex: 1; padding: 7px; text-align: center; cursor: pointer;
    border-radius: 5px; font-size: 13px; font-weight: 500;
    color: var(--muted); transition: all 0.12s;
  }
  .tab.active { background: var(--blue); color: #fff; font-weight: 600; }

  /* ── ALERTS ─────────────────────────────────────────── */
  .alert { padding: 11px 14px; border-radius: 7px; font-size: 13px; margin-bottom: 14px; line-height: 1.5; }
  .alert-success { background: rgba(34,197,94,0.07); border: 1px solid rgba(34,197,94,0.18); color: var(--green); }
  .alert-error   { background: rgba(239,68,68,0.07); border: 1px solid rgba(239,68,68,0.18); color: var(--red); }
  .alert-info    { background: var(--blue-dim); border: 1px solid var(--blue-border); color: var(--blue-light); }
  .alert-warning { background: rgba(245,166,35,0.07); border: 1px solid rgba(245,166,35,0.18); color: var(--yellow); }

  /* ── MODAL ──────────────────────────────────────────── */
  .modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.72);
    display: flex; align-items: center; justify-content: center; z-index: 999;
    backdrop-filter: blur(5px);
  }
  .modal {
    background: var(--card); border: 1px solid var(--border);
    border-top: 2px solid var(--blue);
    border-radius: 12px; padding: 28px; width: 460px;
    max-height: 90vh; overflow-y: auto;
    box-shadow: 0 28px 70px rgba(0,0,0,0.5);
  }
  .modal-title { font-size: 15px; font-weight: 700; color: var(--text); margin-bottom: 20px; letter-spacing: -0.2px; }
  .modal-close { float: right; background: none; border: none; color: var(--muted); cursor: pointer; font-size: 18px; }

  /* ── LEVEL BADGE ────────────────────────────────────── */
  .level-badge {
    display: inline-flex; align-items: center; gap: 5px;
    background: rgba(255,107,53,0.08); border: 1px solid rgba(255,107,53,0.22);
    border-radius: 5px; padding: 3px 9px;
    font-size: 11px; font-weight: 700; color: var(--orange);
  }

  /* ── TABLE ──────────────────────────────────────────── */
  table { width: 100%; border-collapse: collapse; }
  th {
    text-align: left; font-size: 10px; color: var(--muted);
    text-transform: uppercase; letter-spacing: 1px; font-weight: 700;
    padding: 8px 12px; border-bottom: 1px solid var(--border);
  }
  td { padding: 11px 12px; font-size: 13px; border-bottom: 1px solid var(--border2); vertical-align: middle; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: rgba(255,255,255,0.012); }

  /* ── BOOKING ROW ────────────────────────────────────── */
  .booking-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 10px 0; border-bottom: 1px solid var(--border2);
  }
  .booking-row:last-child { border-bottom: none; }

  /* ── SECTION HEADERS (IT.МОСКВА style) ─────────────── */
  .section-title {
    font-size: 20px; font-weight: 800; color: var(--text);
    margin-bottom: 4px; letter-spacing: -0.4px;
  }
  .section-sub { color: var(--text2); font-size: 13.5px; margin-bottom: 22px; line-height: 1.5; }

  /* IT.МОСКВА brand accent: thin blue line before section labels */
  .it-label {
    font-size: 10px; color: var(--blue); letter-spacing: 2px;
    text-transform: uppercase; font-weight: 700;
    display: flex; align-items: center; gap: 8px; margin-bottom: 6px;
  }
  .it-label::before {
    content: ''; display: block; width: 24px; height: 2px; background: var(--blue); border-radius: 1px;
  }

  /* ── UTILITY ────────────────────────────────────────── */
  .mb-2  { margin-bottom: 8px; }
  .mb-4  { margin-bottom: 16px; }
  .mb-6  { margin-bottom: 24px; }
  .mt-4  { margin-top: 16px; }
  .flex  { display: flex; }
  .items-center   { align-items: center; }
  .justify-between{ justify-content: space-between; }
  .flex-wrap { flex-wrap: wrap; }
  .text-muted { color: var(--muted); font-size: 13px; }
  .text-sm    { font-size: 13px; }
  .text-blue  { color: var(--blue); }
  .font-bold  { font-weight: 700; }
  .w-full     { width: 100%; }
  .gap-2      { gap: 8px; }
  .gap-3      { gap: 12px; }

  /* ── SCROLLBAR ──────────────────────────────────────── */
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(65,105,255,0.4); }

  /* ── 📱 MOBILE ──────────────────────────────────────────── */
  @media (max-width: 768px) {
    .content { padding: 14px !important; }
    .topbar  { padding: 0 14px !important; }
    .main    { margin-left: 0 !important; }
    .grid-2  { grid-template-columns: 1fr !important; }
    .grid-3  { grid-template-columns: 1fr !important; }
    .grid-4  { grid-template-columns: 1fr 1fr !important; }
    .stat-value { font-size: 22px !important; }
    .section-title { font-size: 17px !important; }
    .auth-card { width: calc(100vw - 32px) !important; padding: 28px 20px !important; }
    .modal { width: calc(100vw - 24px) !important; padding: 20px !important; }
    table { font-size: 12px !important; }
    th, td { padding: 8px !important; }
  }


  /* ── 🌓 LIGHT THEME ────────────────────────────────────── */
  [data-theme="light"] {
    --blue:        #3358E8;
    --blue-dark:   #2244CC;
    --blue-hover:  #2A4BD4;
    --blue-dim:    rgba(51,88,232,0.08);
    --blue-border: rgba(51,88,232,0.20);
    --blue-light:  #3358E8;

    --orange: #E05A20;
    --green:  #16A34A;
    --red:    #DC2626;
    --yellow: #D97706;

    --bg:    #F4F6FA;
    --bg2:   #FFFFFF;
    --bg3:   #EEF1F8;
    --card:  #FFFFFF;
    --card2: #F8FAFF;

    --border:  rgba(0,0,0,0.08);
    --border2: rgba(0,0,0,0.05);

    --text:  #111827;
    --text2: #4B5563;
    --muted: #9CA3AF;
  }
  [data-theme="light"] body { background: #F4F6FA; color: #111827; }
  [data-theme="light"] .sidebar { background: #fff; border-right: 1px solid rgba(0,0,0,0.08); }
  [data-theme="light"] .topbar  { background: #fff; border-bottom: 1px solid rgba(0,0,0,0.07); }
  [data-theme="light"] .auth-screen { background: #F4F6FA; }
  [data-theme="light"] .auth-screen::before {
    background-image: radial-gradient(circle, rgba(51,88,232,0.06) 1px, transparent 1px);
  }
  [data-theme="light"] .auth-card { background: #fff; box-shadow: 0 8px 40px rgba(0,0,0,0.10); }
  [data-theme="light"] .input { background: #F8FAFF; border-color: rgba(0,0,0,0.10); color: #111827; }
  [data-theme="light"] .input:focus { border-color: var(--blue); }
  [data-theme="light"] .btn-secondary { border-color: rgba(0,0,0,0.12); color: #4B5563; }
  [data-theme="light"] .btn-secondary:hover { background: rgba(0,0,0,0.04); color: #111827; }
  [data-theme="light"] .modal { background: #fff; }
  [data-theme="light"] .modal-overlay { background: rgba(0,0,0,0.45); }
  [data-theme="light"] .nav-item { color: #4B5563; }
  [data-theme="light"] .nav-item:hover { background: rgba(0,0,0,0.04); color: #111827; }
  [data-theme="light"] .nav-item.active { color: var(--blue); background: var(--blue-dim); }
  [data-theme="light"] .sidebar-user:hover { background: rgba(0,0,0,0.03); }
  [data-theme="light"] select.input option { background: #fff; color: #111827; }
  [data-theme="light"] ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); }
  [data-theme="light"] ::-webkit-scrollbar-thumb:hover { background: rgba(51,88,232,0.3); }

  /* ── ✨ PAGE TRANSITIONS ────────────────────────────────── */
  @keyframes pageIn {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes pageFadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  .page-enter {
    animation: pageIn 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
  }

  /* ── ⚡ LAZY LOADING SKELETON ───────────────────────────── */
  @keyframes shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position: 600px 0; }
  }
  .skeleton {
    background: linear-gradient(90deg, var(--bg3) 25%, var(--bg2) 50%, var(--bg3) 75%);
    background-size: 600px 100%;
    animation: shimmer 1.4s ease-in-out infinite;
    border-radius: 8px;
  }
  .skeleton-line { height: 14px; margin-bottom: 10px; }
  .skeleton-card { height: 120px; border-radius: 10px; margin-bottom: 16px; }
  .skeleton-title { height: 24px; width: 40%; margin-bottom: 20px; }

  /* ── THEME TOGGLE BUTTON ────────────────────────────────── */
  .theme-toggle {
    width: 36px; height: 36px; border-radius: 8px;
    border: 1px solid var(--border); background: transparent;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    font-size: 16px; transition: all 0.15s; color: var(--text2);
  }
  .theme-toggle:hover { background: var(--blue-dim); border-color: var(--blue-border); color: var(--blue); }

`;
