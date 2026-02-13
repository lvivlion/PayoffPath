/**
 * content.js — PayoffPath v3
 * Universal loan payoff accelerator.
 * Supports: Mortgage, Student Loan, Auto Loan, Personal Loan, Other.
 */

console.log('PayoffPath v3 Content Script Loaded');

// ═══════════════════════════════════════════════════════════════
//  MODULE 1: CSS — All shadow DOM styles
// ═══════════════════════════════════════════════════════════════
const PP_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
  :host { all: initial; font-family: 'Outfit', system-ui, -apple-system, sans-serif; -webkit-font-smoothing: antialiased; }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :host {
    display: block;
    /* v3 Platinum Dark Theme */
    --accent: #10b981; --accent-2: #059669; --accent-glow: rgba(16,185,129,0.3);
    --primary: #6366f1; --primary-glow: rgba(99,102,241,0.25);
    --cyan: #06b6d4; --cyan-glow: rgba(6,182,212,0.25);
    --bg-0: #020617; --bg-1: #0f172a; --bg-2: #1e293b; --bg-3: #020617;
    --surface: rgba(30, 41, 59, 0.7); --surface-hover: rgba(51, 65, 85, 0.8);
    --glass: rgba(15, 23, 42, 0.8); --glass-border: rgba(255,255,255,0.08);
    --border: rgba(255,255,255,0.08); --border-accent: rgba(99,102,241,0.4);
    --text: #f8fafc; --text-2: #e2e8f0; --text-muted: #94a3b8;
    --radius: 16px; --radius-lg: 24px; --radius-sm: 10px;
    --font-display: 'Outfit', sans-serif;
    --font-mono: 'JetBrains Mono', monospace;
    --shadow: 0 20px 50px rgba(0,0,0,0.4);
    --chart-grid: rgba(255,255,255,0.03);
    --danger: #ef4444; --danger-dim: rgba(239, 68, 68, 0.1);
  }

  :host(.light-theme) {
    /* v3 Platinum Light Theme */
    --bg-0: #f8fafc; --bg-1: #ffffff; --bg-2: #f1f5f9; --bg-3: #ffffff;
    --surface: rgba(255, 255, 255, 0.9); --surface-hover: #f1f5f9;
    --glass: rgba(255, 255, 255, 0.9); --glass-border: rgba(15,23,42,0.08);
    --border: rgba(15,23,42,0.08); --border-accent: #6366f1;
    --text: #020617; --text-2: #334155; --text-muted: #64748b;
    --accent: #10b981; --accent-2: #0d9488; --accent-glow: rgba(16,185,129,0.1);
    --primary: #4f46e5;
    --cyan: #0891b2;
    --shadow: 0 10px 40px rgba(15,23,42,0.05);
    --chart-grid: rgba(15,23,42,0.04);
  }

  /* ── Bubble ── */
  /* ── v3 Premium Bubble ── */
  .pp-bubble {
    pointer-events: auto;
    position: fixed; bottom: 32px; right: 32px; width: 56px; height: 56px;
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #3730a3 100%);
    border-radius: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center;
    box-shadow: 0 10px 25px rgba(99,102,241,0.4), 0 0 0 1px rgba(255,255,255,0.1) inset;
    z-index: 2147483640;
    transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
  }
  .pp-bubble svg { filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2)); }
  .pp-bubble:hover { transform: translateY(-6px) scale(1.08) rotate(5deg); box-shadow: 0 15px 35px rgba(99,102,241,0.5); }
  .pp-bubble:active { transform: translateY(-2px) scale(0.98); }

  /* ── Modal Overlay ── */
  .pp-modal {
    pointer-events: auto;
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    background: var(--bg-0);
    display: none; z-index: 2147483641; flex-direction: column; overflow: hidden;
    font-family: inherit; color: var(--text);
  }
  .pp-modal[style*="flex"] { display: flex; animation: ppEntrance 0.6s cubic-bezier(0.19, 1, 0.22, 1); }
  @keyframes ppEntrance { from { opacity: 0; transform: scale(1.02); filter: blur(10px); } to { opacity: 1; transform: scale(1); filter: blur(0); } }

  /* ── Modal Header ── */
  .pp-header {
    padding: 28px 48px; display: flex; justify-content: space-between; align-items: center;
    border-bottom: 1px solid var(--border); flex-shrink: 0;
    background: var(--bg-3); position: relative;
  }
  .pp-header::after { content: ''; position: absolute; bottom: -1px; left: 48px; right: 48px; height: 1px; background: linear-gradient(90deg, transparent, var(--primary), transparent); opacity: 0.5; }
  .pp-header h1 {
    margin: 0; font-size: 1.5rem; font-weight: 800; color: var(--text);
    letter-spacing: -0.02em; display: flex; align-items: center; gap: 12px;
  }
  .pp-header .subtitle { margin: 4px 0 0; color: var(--text-muted); font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase; font-weight: 600; opacity: 0.8; }
  
  .pp-close {
    width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;
    font-size: 20px; cursor: pointer; color: var(--text-muted); transition: all 0.3s cubic-bezier(0.19, 1, 0.22, 1);
    background: var(--surface); border: 1px solid var(--border); border-radius: 12px;
  }
  .pp-close:hover { color: var(--text); background: var(--danger-dim); border-color: var(--danger); transform: rotate(90deg); }
  
  .pp-header-btn {
    background: var(--surface); border: 1px solid var(--border); color: var(--text-2);
    padding: 10px 20px; border-radius: 12px; cursor: pointer; font-weight: 700; font-size: 0.8rem;
    display: flex; align-items: center; gap: 10px; transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1); font-family: inherit;
    letter-spacing: 0.03em; text-transform: uppercase;
  }
  .pp-header-btn:hover { background: var(--surface-hover); color: var(--text); border-color: var(--primary); box-shadow: 0 0 25px var(--primary-glow); transform: translateY(-2px); }
  .pp-theme-toggle .pp-sun { display: none; }
  .pp-theme-toggle .pp-moon { display: block; }
  :host(.light-theme) .pp-theme-toggle .pp-sun { display: block; }
  :host(.light-theme) .pp-theme-toggle .pp-moon { display: none; }
  :host(.light-theme) .pp-header-btn:hover { color: var(--accent); }

  /* ── Dashboard Grid ── */
  .pp-grid {
    display: flex; flex-wrap: wrap; gap: 28px; padding: 32px 48px;
    flex: 1; min-height: 0; overflow-y: auto; align-content: flex-start;
  }
  .pp-col { display: flex; flex-direction: column; gap: 28px; min-width: 320px; flex: 1; }
  .pp-col:nth-child(2) { flex: 2; min-width: 500px; }

  /* ── v3 Platinum Cards ── */
  .pp-card {
    background: var(--bg-1); border: 1px solid var(--border); border-radius: var(--radius-lg);
    padding: 24px; transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
    position: relative; overflow: hidden; box-shadow: var(--shadow);
    display: flex; flex-direction: column; backdrop-filter: blur(12px);
  }
  .pp-card::before {
    content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 50%);
    pointer-events: none;
  }
  .pp-card:hover { border-color: var(--border-accent); transform: translateY(-4px); box-shadow: 0 30px 60px rgba(0,0,0,0.5); }
  .pp-card h3 {
    margin: 0 0 20px; font-size: 0.85rem; color: var(--primary); font-weight: 800;
    text-transform: uppercase; letter-spacing: 0.12em; display: flex; align-items: center; gap: 12px;
  }

  /* ── Stats ── */
  .pp-stat { margin-bottom: 16px; }
  .pp-stat-label {
    font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;
    letter-spacing: 0.15em; font-weight: 700; margin-bottom: 6px; opacity: 0.8;
  }
  .pp-stat-value {
    font-size: 1.8rem; font-weight: 800; color: var(--text);
    letter-spacing: -0.03em; line-height: 1;
  }
  .pp-stat-value.green {
    background: linear-gradient(135deg, #10b981, #34d399);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }

  /* ── Progress ── */
  .pp-progress-bg { height: 8px; background: rgba(255,255,255,0.05); border-radius: 4px; overflow: hidden; }
  .pp-progress-bar {
    height: 100%; width: 0%; border-radius: 4px;
    background: linear-gradient(90deg, #6366f1, #a855f7, #6366f1);
    background-size: 200% auto; animation: pulseGradient 4s linear infinite;
    transition: width 1.5s cubic-bezier(0.19, 1, 0.22, 1);
    box-shadow: 0 0 15px rgba(99,102,241,0.4);
  }
  @keyframes pulseGradient { 0% { background-position: 0% center; } 100% { background-position: 200% center; } }

  /* ── v3 Form Controls ── */
  .pp-control { margin-bottom: 20px; }
  .pp-control-header { display: flex; justify-content: space-between; margin-bottom: 8px; font-weight: 600; font-size: 0.8rem; }
  .pp-control-header .highlight { color: var(--primary); font-family: var(--font-mono); font-size: 0.85rem; }
  
  input[type=range] {
    width: 100%; height: 6px; background: rgba(255,255,255,0.08); border-radius: 3px;
    appearance: none; outline: none; margin: 12px 0; transition: all 0.3s;
  }
  input[type=range]::-webkit-slider-thumb {
    appearance: none; width: 20px; height: 20px;
    background: #ffffff; border: 4px solid var(--primary); border-radius: 50%;
    cursor: pointer; box-shadow: 0 0 15px var(--primary-glow); transition: all 0.3s cubic-bezier(0.19, 1, 0.22, 1);
  }
  input[type=range]::-webkit-slider-thumb:hover { transform: scale(1.2); box-shadow: 0 0 25px var(--primary-glow); }

  /* ── Table ── */
  .pp-table-wrap {
    flex: 1; min-height: 250px; overflow-y: auto; border-radius: var(--radius);
    background: rgba(0,0,0,0.15); border: 1px solid var(--border);
  }
  .pp-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
  .pp-table th {
    text-align: left; padding: 14px 20px; color: var(--text-muted); font-weight: 800;
    font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.1em;
    border-bottom: 1px solid var(--border); position: sticky; top: 0; background: #0f172a; z-index: 10;
  }
  .pp-table td { padding: 12px 20px; border-bottom: 1px solid rgba(255,255,255,0.01); color: var(--text-2); font-family: var(--font-mono); }
  .pp-table tr:hover { background: rgba(99,102,241,0.05); }
  .pp-row-current { background: rgba(99,102,241,0.15) !important; border-left: 4px solid var(--primary); }
  .pp-row-current td { color: #fff; font-weight: 700; border-bottom-color: rgba(99,102,241,0.2); }
  .pp-row-past.hidden { display: none; }
  .pp-toggle-history {
    font-size: 0.65rem; color: var(--accent); cursor: pointer; border: 1px solid var(--border-accent);
    padding: 3px 8px; border-radius: 6px; background: rgba(16,185,129,0.05);
    transition: all 0.2s; font-family: var(--font-display); font-weight: 600; outline: none;
  }
  .pp-toggle-history:hover { background: var(--accent); color: white; }

  /* ── Charts ── */
  .pp-chart-container { flex: 1; min-height: 260px; position: relative; width: 100%; margin: 16px 0; }
  .pp-pie-container { height: 180px; position: relative; display: flex; justify-content: center; align-items: center; }
  .pp-pie-wrapper { position: relative; width: 180px; height: 180px; }
  .pp-pie-center-text {
    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
    font-weight: 800; font-size: 1.4rem; color: var(--text); pointer-events: none;
  }

  /* ── Recommendation ── */
  .pp-recommendation-card {
    background: linear-gradient(135deg, rgba(16,185,129,0.1), rgba(6,182,212,0.05));
    border: 1px solid var(--border-accent); padding: 20px; border-radius: var(--radius-lg);
    display: flex; flex-direction: column; gap: 12px; flex: 1;
  }

  /* ── Banner ── */
  .pp-banner {
    background: linear-gradient(135deg, rgba(110,231,183,0.08), rgba(103,232,249,0.04));
    border: 1px solid rgba(110,231,183,0.15); padding: 16px 20px; border-radius: var(--radius);
    display: flex; align-items: center; gap: 14px; margin-bottom: 12px;
  }
  .pp-icon-circle {
    width: 40px; height: 40px; border-radius: 14px;
    background: linear-gradient(135deg, var(--accent-2), #059669);
    display: flex; align-items: center; justify-content: center; font-size: 1.1rem;
    flex-shrink: 0; box-shadow: 0 4px 12px rgba(52,211,153,0.3);
  }

  /* ── Settings Panel ── */
  .pp-settings {
    pointer-events: auto;
    position: absolute; top: 72px; right: 36px; width: 340px;
    background: #111827; border: 1px solid var(--border-accent); border-radius: var(--radius-lg);
    background: var(--bg-3);
    padding: 24px; display: none; flex-direction: column; gap: 12px;
    box-shadow: 0 24px 60px rgba(0,0,0,0.7), 0 0 40px rgba(110,231,183,0.06);
    z-index: 2147483645; animation: ppSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    font-family: 'DM Sans', sans-serif; color: var(--text);
  }
  @keyframes ppSlideIn { from { transform: translateY(-12px) scale(0.97); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
  .pp-settings label { font-size: 0.75rem; color: var(--text-muted); font-weight: 500; display: block; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.06em; font-family: var(--font-display); }
  .pp-settings input, .pp-settings select {
    width: 100%; background: rgba(255,255,255,0.05); border: 1px solid var(--border);
    color: white; padding: 10px 14px; border-radius: var(--radius-sm); outline: none;
    font-size: 0.85rem; font-family: inherit; transition: all 0.2s;
  }
  .pp-settings input:focus, .pp-settings select:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-glow); }
  .pp-btn {
    background: linear-gradient(135deg, var(--accent-2), #059669); border: none; color: white;
    padding: 11px 16px; border-radius: var(--radius-sm); cursor: pointer; font-weight: 600;
    transition: all 0.25s; font-family: inherit; font-size: 0.85rem;
    box-shadow: 0 2px 12px rgba(52,211,153,0.25);
  }
  .pp-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 20px rgba(52,211,153,0.35); }
  .pp-btn-danger {
    background: var(--danger-dim); color: var(--danger); border: 1px solid rgba(251,113,133,0.2);
    padding: 11px 16px; border-radius: var(--radius-sm); cursor: pointer; font-weight: 600;
    transition: all 0.25s; font-family: inherit; font-size: 0.85rem;
  }
  .pp-btn-danger:hover { background: rgba(251,113,133,0.18); border-color: var(--danger); }

  /* ── Onboarding Overlay ── */
  .pp-onboarding {
    pointer-events: auto;
    position: fixed; inset: 0;
    background: #0b1121;
    z-index: 2147483646; display: none; align-items: center; justify-content: center;
    font-family: 'DM Sans', sans-serif; color: var(--text);
  }
  /* ── v3 Onboarding ── */
  .pp-ob-card {
    width: 520px; background: #020617; border: 1px solid var(--primary); border-radius: 32px;
    padding: 48px; text-align: center; box-shadow: 0 50px 100px rgba(0,0,0,0.8), 0 0 100px rgba(99,102,241,0.1);
    animation: ppScaleUp 0.6s cubic-bezier(0.19, 1, 0.22, 1);
  }
  @keyframes ppScaleUp { from { transform: scale(0.95) translateY(20px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
  .pp-ob-close {
    position: absolute; top: 14px; right: 18px; cursor: pointer; color: var(--text-muted);
    font-size: 1.1rem; transition: all 0.3s; background: var(--surface); border: 1px solid var(--border);
    width: 32px; height: 32px; border-radius: 10px; display: flex; align-items: center; justify-content: center;
  }
  .pp-ob-close:hover { color: white; border-color: var(--border-accent); }

  /* Stepper dots */
  .pp-stepper { display: flex; justify-content: center; gap: 8px; margin-bottom: 28px; }
  .pp-dot {
    width: 8px; height: 8px; border-radius: 4px; background: rgba(255,255,255,0.1);
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .pp-dot.active { width: 42px; background: var(--primary); box-shadow: 0 0 20px var(--primary-glow); }
  .pp-dot.done { background: rgba(110,231,183,0.35); }

  .pp-ob-step { display: none; flex-direction: column; gap: 14px; }
  .pp-ob-step.active { display: flex; animation: ppStepIn 0.35s ease; }
  @keyframes ppStepIn { from { opacity: 0; transform: translateX(12px); } to { opacity: 1; transform: translateX(0); } }
  .pp-ob-title { font-size: 1.4rem; font-weight: 700; color: #fff; font-family: var(--font-display); letter-spacing: -0.02em; }
  .pp-ob-text { color: var(--text-muted); line-height: 1.7; font-size: 0.9rem; }
  .pp-ob-footer { display: flex; justify-content: center; gap: 10px; margin-top: 16px; }

  .pp-ob-btn {
    background: linear-gradient(135deg, #6366f1, #4f46e5); color: white; border: none;
    padding: 16px 36px; border-radius: 16px; font-weight: 700; transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
    box-shadow: 0 10px 25px rgba(99,102,241,0.3);
  }
  .pp-ob-btn:hover { transform: translateY(-3px); box-shadow: 0 15px 35px rgba(99,102,241,0.4); }
  .pp-ob-btn:active { transform: translateY(0); }
  .pp-ob-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
  .pp-ob-btn.secondary {
    background: var(--surface); border: 1px solid var(--border); color: var(--text-2); box-shadow: none;
  }
  .pp-ob-btn.secondary:hover { background: var(--surface-hover); color: white; border-color: rgba(255,255,255,0.15); }

  /* Suggestion tokens */
  .pp-suggestions { display: flex; flex-direction: column; gap: 8px; margin: 10px 0; max-height: 200px; overflow-y: auto; }
  .pp-suggestions::-webkit-scrollbar { width: 4px; }
  .pp-suggestions::-webkit-scrollbar-thumb { background: rgba(110,231,183,0.2); border-radius: 2px; }
  .pp-suggestion {
    display: flex; justify-content: space-between; align-items: center;
    background: var(--surface); border: 1px solid var(--border); border-radius: 14px;
    padding: 14px 18px; cursor: pointer; transition: all 0.25s;
  }
  .pp-suggestion:hover { border-color: rgba(110,231,183,0.3); background: rgba(110,231,183,0.05); }
  .pp-suggestion.selected {
    border-color: var(--accent); background: rgba(110,231,183,0.08);
    box-shadow: 0 0 0 3px var(--accent-glow), inset 0 0 20px rgba(110,231,183,0.03);
  }

  /* Onboarding form */
  .pp-ob-form { display: flex; flex-direction: column; gap: 12px; text-align: left; }
  .pp-ob-form label {
    font-size: 0.72rem; color: var(--text-muted); font-weight: 500;
    text-transform: uppercase; letter-spacing: 0.08em; font-family: var(--font-display);
  }
  .pp-ob-form input, .pp-ob-form select {
    width: 100%; background: rgba(255,255,255,0.04); border: 1px solid var(--border);
    color: white; padding: 11px 14px; border-radius: 12px; outline: none;
    font-size: 0.9rem; font-family: inherit; transition: all 0.2s;
  }
  .pp-ob-form input:focus, .pp-ob-form select:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-glow); }
  .pp-ob-form input::placeholder { color: var(--text-muted); opacity: 0.5; }
  .pp-ob-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  select option { background: var(--bg-1); color: var(--text); }

  /* Premium Utility v3 */
  .v3-badge {
    background: linear-gradient(90deg, #6366f1, #a855f7); color: white;
    padding: 4px 10px; border-radius: 20px; font-size: 0.65rem; font-weight: 800;
    text-transform: uppercase; margin-left: 8px; box-shadow: 0 4px 12px rgba(99,102,241,0.3);
  }
  .highlight-box {
    background: rgba(99,102,241,0.05); border: 1px solid rgba(99,102,241,0.2);
    border-radius: 14px; padding: 12px; margin-top: 12px;
  }
`;

// ═══════════════════════════════════════════════════════════════
//  MODULE 2: HTML — Template for the full UI
// ═══════════════════════════════════════════════════════════════
function buildHTML() {
  const host = window.location.hostname;
  return `
    <div class="pp-bubble" id="pp-bubble">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
    </div>

    <!-- ═══ DASHBOARD ═══ -->
    <div class="pp-modal" id="pp-modal">
      <div class="pp-header">
        <div style="display:flex; align-items:center; gap:14px">
          <div class="pp-icon-circle">🏠</div>
          <div>
            <h1>PayoffPath Dashboard <span class="v3-badge">v3.0</span></h1>
            <p class="subtitle">Loan Payoff Simulator & Tracker</p>
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:10px">
          <a href="https://www.linkedin.com/in/ost4p/" target="_blank" style="color:var(--text-muted); display:flex; align-items:center"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg></a>
          <a href="https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=ostaplernatovych@gmail.com&currency_code=USD" target="_blank" style="text-decoration:none">
            <button style="background:linear-gradient(135deg,#fbbf24,#f59e0b); color:#1a1a2e; border:none; padding:7px 14px; border-radius:var(--radius-sm); cursor:pointer; font-weight:600; font-size:0.75rem; display:flex; align-items:center; gap:5px; font-family:var(--font-display); letter-spacing:0.02em; box-shadow:0 2px 10px rgba(251,191,36,0.25)">☕ Donate</button>
          </a>

          <button class="pp-header-btn pp-theme-toggle" id="pp-theme-toggle" title="Toggle Theme">
            <svg class="pp-sun" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
            <svg class="pp-moon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
          </button>
          <button class="pp-header-btn" id="pp-settings-btn" title="Settings">⚙</button>
          <button class="pp-close" id="pp-close">✕</button>
        </div>
      </div>

      <!-- Dashboard Grid -->
      <div class="pp-grid">
        <!-- COLUMN 1: Loan Profile & Simulator -->
        <div class="pp-col">
          <div class="pp-card">
            <h3><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg> <span id="pp-orig-label">Original Loan</span></h3>
            <div class="pp-stat">
              <div class="pp-stat-label">ORIGINAL AMOUNT</div>
              <div class="pp-stat-value" id="pp-orig">$---</div>
            </div>
            <div class="pp-stat">
              <div class="pp-stat-label">CURRENT BALANCE</div>
              <div class="pp-stat-value" id="pp-balance">$---</div>
            </div>
            <div style="margin:8px 0 4px">
              <div style="display:flex; justify-content:space-between; margin-bottom:8px">
                <span class="pp-stat-label">LOAN PROGRESS</span>
                <span id="pp-percent" style="font-size:0.75rem; color:var(--accent); font-weight:700; font-family:var(--font-mono)">0%</span>
              </div>
              <div class="pp-progress-bg"><div class="pp-progress-bar" id="pp-bar"></div></div>
            </div>
          </div>

          <div class="pp-card" style="border-color:var(--border-accent); flex:1">
            <h3 style="color:var(--accent)"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> Premium Simulator</h3>
            <div class="pp-control">
              <div class="pp-control-header"><span>Extra Monthly</span><span class="highlight" id="pp-lbl-monthly">+$0</span></div>
              <input type="range" id="pp-slide-monthly" min="0" max="5000" step="50" value="0">
            </div>
            <div class="pp-control">
              <div class="pp-control-header"><span>Lump-Sum Payment</span><span class="highlight" id="pp-lbl-drop">+$0</span></div>
              <input type="range" id="pp-slide-drop" min="0" max="50000" step="1000" value="0">
            </div>
            <div style="padding-top:16px; margin-top:8px; border-top:1px solid var(--border)">
              <div class="pp-stat-label">TIME SAVED</div>
              <div class="pp-stat-value green" id="pp-time-saved" style="font-size:1.4rem">0 Months</div>
              <div class="pp-stat-label" style="margin-top:12px">DEBT-FREE DATE</div>
              <div class="pp-stat-value" id="pp-payoff-date" style="font-size:1.1rem">---</div>
            </div>
          </div>
        </div>

        <!-- COLUMN 2: Analytics & Amortization -->
        <div class="pp-col">
          <div class="pp-card" style="flex:1">
            <h3><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg> Payoff Trajectory</h3>
            <div class="pp-chart-container">
              <canvas id="pp-chart-line"></canvas>
            </div>
            
            <div style="margin-top:16px; border-top:1px solid var(--border); pt:16px">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px">
                <h3 style="margin:0"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> Amortized Path</h3>
                <button class="pp-toggle-history" id="pp-toggle-history">Show History</button>
              </div>
              <div class="pp-table-wrap">
                <table class="pp-table">
                  <thead id="pp-table-head"></thead>
                  <tbody id="pp-table-body"></tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- COLUMN 3: Progress & Real-time Edge -->
        <div class="pp-col">
          <div class="pp-card">
            <h3><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg> Interest Savings</h3>
            <div class="pp-stat" style="margin-bottom:8px">
              <div class="pp-stat-label">SAVED SO FAR</div>
              <div class="pp-stat-value green" id="pp-hist-savings" style="font-size:1.4rem">$0</div>
              <div id="pp-hist-savings-note" style="font-size:0.65rem; color:var(--text-muted); margin-top:2px; line-height:1.3"></div>
            </div>
            <div class="pp-stat" style="margin-bottom:8px; padding-top:8px; border-top:1px solid var(--border)">
              <div class="pp-stat-label">PROJECTED SAVINGS</div>
              <div class="pp-stat-value green" id="pp-sim-savings" style="font-size:1.4rem">$0</div>
              <div style="font-size:0.65rem; color:var(--text-muted); margin-top:2px">From simulation sliders</div>
            </div>
            <div style="padding-top:8px; border-top:1px solid var(--border-accent)">
              <div class="pp-stat-label" style="color:var(--accent)">TOTAL POTENTIAL SAVINGS</div>
              <div class="pp-stat-value green" id="pp-total-savings" style="font-size:1.8rem">$0</div>
            </div>
          </div>

          <div class="pp-card">
            <h3><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg> Progress</h3>
            <div class="pp-pie-container">
              <div class="pp-pie-wrapper">
                <canvas id="pp-chart-pie"></canvas>
                <div id="pp-pie-percent" class="pp-pie-center-text">0%</div>
              </div>
            </div>
            <div id="pp-pie-legend" style="margin-top:16px; font-size:0.7rem; color:var(--text-muted); text-align:center; font-family:var(--font-mono)"></div>
          </div>

          <div class="pp-recommendation-card">
            <h3 style="color:var(--accent); margin-bottom:8px"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9.663 17h4.674"></path><path d="M10 20h4"></path><path d="M9 13a4.5 4.5 0 1 1 6 0 4.5 4.5 0 0 1-3 4.093c-1.332.407-3 2.179-3 3.907"></path></svg> Smart Strategy</h3>
            <p id="pp-recommendation-text" style="font-size:0.75rem; line-height:1.6; color:var(--text-2); margin:0"></p>
            <div id="pp-status-msg" style="font-size:0.65rem; color:var(--text-muted); margin-top:auto"></div>
          </div>
        </div>
      </div>

      <!-- Settings Panel -->
      <div class="pp-settings" id="pp-settings">
        <h3 style="color:var(--accent); margin:0; font-family:var(--font-display)">Settings <span style="color:var(--text-muted); font-weight:400; font-size:0.8rem">· ${host}</span></h3>
        <div><label>Loan Type</label><select id="set-loan-type"><option value="mortgage">Mortgage</option><option value="student">Student Loan</option><option value="auto">Auto Loan</option><option value="personal">Personal Loan</option><option value="other">Other</option></select></div>
        <div><label>Original Amount ($)</label><input type="number" id="set-orig-amount"></div>
        <div><label>Interest Rate (% APR)</label><input type="number" id="set-rate" step="0.1"></div>
        <div><label>Monthly Payment ($)</label><input type="number" id="set-payment"></div>
        <div><label>First Payment Date</label><input type="date" id="set-start-date"></div>
        <button class="pp-btn" id="pp-save-settings">Save Settings</button>
        <hr style="border:none; border-top:1px solid var(--border)">
        <button class="pp-btn-danger" id="pp-reset-all">Reset All Settings</button>
        <div style="font-size:0.7rem; color:rgba(239,68,68,0.6); text-align:center">Clears all connections and loan terms for this site.</div>
      </div>
    </div>



    <!-- ═══ ONBOARDING ═══ -->
    <div class="pp-onboarding" id="pp-onboarding">
      <div class="pp-ob-card">
        <button class="pp-ob-close" id="pp-ob-close">✕</button>
        <div class="pp-stepper" id="pp-stepper">
          <div class="pp-dot active" data-step="0"></div>
          <div class="pp-dot" data-step="1"></div>
          <div class="pp-dot" data-step="2"></div>
        </div>

        <!-- Step 0: Detect Balance -->
        <div class="pp-ob-step active" data-step="0">
          <div class="pp-ob-title">💰 Balance Detected</div>
          <p class="pp-ob-text">We found potential loan balances on this page. Select the correct one, or pick it manually.</p>
          <div class="pp-suggestions" id="pp-suggestions"></div>
          <div style="margin: 15px 0; display:flex; flex-direction:column; gap:8px; text-align:left">
            <label style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.08em; font-family: var(--font-display); font-weight: 600;">Or Enter Manually</label>
            <input type="number" id="pp-ob-manual-amount" placeholder="Current Balance ($)" style="width: 100%; background: rgba(255,255,255,0.04); border: 1px solid var(--border); color: white; padding: 11px 14px; border-radius: 12px; outline: none; font-size: 0.9rem; font-family: inherit;">
          </div>
          <div class="pp-ob-footer">
            <button class="pp-ob-btn" id="pp-ob-confirm" disabled style="width:100%">Use This Balance</button>
          </div>
        </div>

        <!-- Step 1: Loan Details -->
        <div class="pp-ob-step" data-step="1">
          <div class="pp-ob-title">📋 Loan Details</div>
          <p class="pp-ob-text">Tell us about this loan so we can calculate your payoff path.</p>
          <div class="pp-ob-form">
            <div>
              <label>Loan Type</label>
              <select id="ob-loan-type"><option value="mortgage">Mortgage</option><option value="student">Student Loan</option><option value="auto">Auto Loan</option><option value="personal">Personal Loan</option><option value="other">Other</option></select>
            </div>
            <div class="pp-ob-row">
              <div><label>Original Amount ($)</label><input type="number" id="ob-orig-amount" placeholder="260000"></div>
              <div><label>Interest Rate (% APR)</label><input type="number" id="ob-rate" placeholder="6.0" step="0.1"></div>
            </div>
            <div class="pp-ob-row">
              <div><label>Monthly Payment ($)</label><input type="number" id="ob-payment" placeholder="1558"></div>
              <div><label>Loan Term (years)</label><input type="number" id="ob-term" placeholder="30"></div>
            </div>
            <div><label>First Payment Date</label><input type="date" id="ob-start-date"></div>
          </div>
          <div class="pp-ob-footer">
            <button class="pp-ob-btn" id="pp-ob-finish">Finish Setup</button>
            <button class="pp-ob-btn secondary" id="pp-ob-back0">Back</button>
          </div>
        </div>

        <!-- Step 2: Ready -->
        <div class="pp-ob-step" data-step="2">
          <div class="pp-ob-title">🎉 You're All Set!</div>
          <p class="pp-ob-text">PayoffPath is ready to track your loan and show you how to pay it off faster.</p>
          <div id="pp-ob-summary" style="background:rgba(52,211,153,0.08); border:1px solid rgba(52,211,153,0.2); border-radius:16px; padding:20px; text-align:left; font-size:0.9rem; color:var(--text)"></div>
          <div class="pp-ob-footer">
            <button class="pp-ob-btn" id="pp-ob-open-dash">Open Dashboard</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ═══════════════════════════════════════════════════════════════
//  MODULE 3: SCANNER — Find dollar amounts on page
// ═══════════════════════════════════════════════════════════════
function scanPageForAmounts() {
  const amounts = [];
  const seen = new Set();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
  const regex = /-?\$?[\d,]+\.?\d*/g; // Increased robustness for negative/unformatted

  while (walker.nextNode()) {
    const node = walker.currentNode;
    const el = node.parentElement;
    if (!el || el.closest('script, style, noscript')) continue;
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') continue;

    let match;
    while ((match = regex.exec(node.textContent)) !== null) {
      const raw = match[0];
      const val = parseFloat(raw.replace(/[$,]/g, ''));
      const absVal = Math.abs(val);
      if (!isNaN(val) && absVal >= 100 && !seen.has(val)) {
        seen.add(val);
        amounts.push({ value: val, text: raw, element: el });
      }
    }
  }

  // Sort by absolute value descending
  amounts.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
  return amounts.slice(0, 10);
}



// ═══════════════════════════════════════════════════════════════
//  MODULE 4: FULL UI — Build + wire everything
// ═══════════════════════════════════════════════════════════════
function buildFullUI() {
  if (document.getElementById('payoffpath-root')) return;

  const root = document.createElement('div');
  root.id = 'payoffpath-root';
  root.style.cssText = 'position:relative; z-index:2147483647;';
  const shadow = root.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = PP_CSS;

  const container = document.createElement('div');
  container.innerHTML = buildHTML();

  shadow.appendChild(style);
  shadow.appendChild(container);
  document.body.appendChild(root);

  // ── Refs ──
  const $ = (id) => shadow.getElementById(id);
  const bubble = $('pp-bubble');
  const modal = $('pp-modal');
  const onboarding = $('pp-onboarding');
  const settings = $('pp-settings');

  const els = {
    orig: $('pp-orig'), balance: $('pp-balance'), percent: $('pp-percent'),
    bar: $('pp-bar'),
    histSavings: $('pp-hist-savings'), histSavingsNote: $('pp-hist-savings-note'),
    simSavings: $('pp-sim-savings'), totalSavings: $('pp-total-savings'),
    slideMonthly: $('pp-slide-monthly'), slideDrop: $('pp-slide-drop'),
    lblMonthly: $('pp-lbl-monthly'), lblDrop: $('pp-lbl-drop'),
    timeSaved: $('pp-time-saved'), payoffDate: $('pp-payoff-date'),
    tableBody: $('pp-table-body'), tableHead: $('pp-table-head'),
    statusMsg: $('pp-status-msg'),
    recommendation: $('pp-recommendation-text'), pieLegend: $('pp-pie-legend'),
    origLabel: $('pp-orig-label'), piePercent: $('pp-pie-percent'),
    toggleHistory: $('pp-toggle-history')
  };

  let charts = { line: null, pie: null };
  let detectedBalance = null;
  let showHistory = false;
  let retryCount = 0;

  // ── Stepper ──
  const steps = shadow.querySelectorAll('.pp-ob-step');
  const dots = shadow.querySelectorAll('.pp-dot');
  function setStep(idx) {
    steps.forEach((s, i) => { s.classList.toggle('active', i === idx); });
    dots.forEach((d, i) => {
      d.classList.remove('active', 'done');
      if (i === idx) d.classList.add('active');
      else if (i < idx) d.classList.add('done');
    });
  }

  // ── Scanner: populate suggestions ──
  function showSuggestions() {
    const container = $('pp-suggestions');
    container.innerHTML = '';
    const amounts = scanPageForAmounts();
    if (amounts.length === 0) {
      container.innerHTML = '<p style="color:var(--text-muted); font-size:0.9rem">No amounts detected. Please try reloading the page or check the selector.</p>';
      return;
    }
    amounts.forEach((a, i) => {
      const token = document.createElement('div');
      token.className = 'pp-suggestion';
      token.innerHTML = `<span style="font-weight:700; color:var(--primary); font-size:1.1rem">${a.text}</span><span style="font-size:0.8rem; color:var(--text-muted)">Click to select</span>`;
      token.onclick = () => {
        shadow.querySelectorAll('.pp-suggestion').forEach(s => s.classList.remove('selected'));
        token.classList.add('selected');
        detectedBalance = { value: a.value, selector: '' };
        $('pp-ob-manual-amount').value = ''; // Clear manual if selection picked
        $('pp-ob-confirm').disabled = false;
      };
      if (i === 0) {
        token.classList.add('selected');
        detectedBalance = { value: a.value, selector: '' };
        $('pp-ob-confirm').disabled = false;
      }
      container.appendChild(token);
    });
  }

  // ── Manual Input: handle manual entry ──
  $('pp-ob-manual-amount').oninput = (e) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val) && val > 0) {
      detectedBalance = { value: val, selector: '' };
      $('pp-ob-confirm').disabled = false;
      // Deselect suggestions
      shadow.querySelectorAll('.pp-suggestion').forEach(s => s.classList.remove('selected'));
    } else if (!shadow.querySelector('.pp-suggestion.selected')) {
      $('pp-ob-confirm').disabled = true;
    }
  };



  // ── Re-scan page for updated balance ──
  function refreshBalanceFromPage(callback) {
    const amounts = scanPageForAmounts();
    if (amounts.length === 0) return callback(null);

    const hostname = window.location.hostname;
    chrome.storage.local.get(['siteOverrides', 'loanData'], (res) => {
      const cfg = res.siteOverrides?.[hostname];
      const currentStored = parseFloat(res.loanData?.ledgerBalance) || 0;
      const origAmount = parseFloat(cfg?.origAmount) || 0;

      // Find the best candidate: a value that is <= original loan amount and > 0
      // Prefer the value closest to the previously stored balance (likely the updated version)
      let bestMatch = null;
      let bestDiff = Infinity;
      for (const a of amounts) {
        const v = Math.abs(a.value);
        if (v > 0 && (origAmount <= 0 || v <= origAmount * 1.05)) {
          const diff = Math.abs(v - currentStored);
          if (diff < bestDiff) {
            bestDiff = diff;
            bestMatch = v;
          }
        }
      }

      if (bestMatch !== null && bestMatch !== currentStored) {
        // Update stored loanData with refreshed balance
        const updatedLoanData = { ...(res.loanData || {}), ledgerBalance: bestMatch };
        chrome.storage.local.set({ loanData: updatedLoanData }, () => {
          console.log('[PayoffPath] Balance refreshed from page:', currentStored, '→', bestMatch);
          callback(bestMatch);
        });
      } else {
        callback(null); // No change
      }
    });
  }

  // ── Dashboard calculation ──
  function runCalculation() {
    const hostname = window.location.hostname;
    chrome.storage.local.get(['siteOverrides', 'loanData'], (res) => {
      const cfg = res.siteOverrides?.[hostname];
      if (!cfg) return;

      const balance = parseFloat(res.loanData?.ledgerBalance) || cfg.origAmount || 0;
      const rate = parseFloat(cfg.rate) || 0;
      const origAmount = parseFloat(cfg.origAmount) || balance || 0;
      let monthlyPayment = parseFloat(cfg.monthlyPayment) || 0;
      const startDate = cfg.startDate;

      // Fallback: If payment is missing or too low to cover interest
      const minPayment = (balance * (rate / 100 / 12)) + 1;
      if (monthlyPayment < minPayment) {
        monthlyPayment = LoanCalculator.calculateMonthlyPayment(origAmount || balance, rate || 7, 30);
      }

      const extraMonthly = parseFloat(els.slideMonthly.value) || 0;
      const lumpSum = parseFloat(els.slideDrop.value) || 0;

      els.lblMonthly.textContent = '+$' + extraMonthly.toLocaleString();
      els.lblDrop.textContent = '+$' + lumpSum.toLocaleString();

      // Baseline (no extra)
      const baseline = LoanCalculator.getAmortizationStats(balance, rate, monthlyPayment, 0, 0);
      // Optimized (with extra)
      const optimized = LoanCalculator.getAmortizationStats(balance, rate, monthlyPayment, extraMonthly, lumpSum);

      const simSaved = Math.max(0, baseline.totalInterest - optimized.totalInterest);
      const monthsSaved = Math.max(0, baseline.months - optimized.months);
      const pctPaid = origAmount > 0 ? Math.min(100, (1 - balance / origAmount) * 100).toFixed(1) : 0;

      // ── Historical Interest Savings ──
      // Compare where the standard schedule expects them to be vs. where they actually are
      let histSaved = 0;
      let monthsAhead = 0;
      let expectedBalance = balance; // default: assume on track
      const monthlyRate = rate / 100 / 12;

      // Historical Path
      let history = [];
      let monthsDiff = 0;
      if (startDate && origAmount > balance) {
        const sDate = new Date(startDate);
        const now = new Date();
        monthsDiff = (now.getFullYear() - sDate.getFullYear()) * 12 + (now.getMonth() - sDate.getMonth());

        // Calculate expected balance via standard amortization
        expectedBalance = origAmount;
        let expectedInterest = 0;
        for (let i = 0; i < monthsDiff; i++) {
          const interest = expectedBalance * monthlyRate;
          const principalPart = monthlyPayment - interest;
          if (principalPart <= 0) break;
          expectedInterest += interest;
          expectedBalance -= principalPart;
          if (expectedBalance <= 0) { expectedBalance = 0; break; }
        }

        // If actual balance is lower than expected → they're ahead!
        if (balance < expectedBalance) {
          // Calculate interest saved: simulate standard path to reach current balance
          let simBalance = origAmount;
          let interestToReachActual = 0;
          let monthsToReachActual = 0;
          while (simBalance > balance && monthsToReachActual < 600) {
            const interest = simBalance * monthlyRate;
            const principalPart = monthlyPayment - interest;
            if (principalPart <= 0) break;
            interestToReachActual += interest;
            simBalance -= principalPart;
            monthsToReachActual++;
          }
          monthsAhead = monthsToReachActual - monthsDiff;
          // Interest they would have paid on the "extra" balance over remaining months
          // More accurate: difference in total interest from expected vs actual remaining
          const remainingFromExpected = LoanCalculator.getAmortizationStats(expectedBalance, rate, monthlyPayment, 0, 0);
          const remainingFromActual = LoanCalculator.getAmortizationStats(balance, rate, monthlyPayment, 0, 0);
          histSaved = Math.max(0, remainingFromExpected.totalInterest - remainingFromActual.totalInterest);
        }

        // Build history rows for table/chart
        let hBalance = origAmount;
        let hTotalInterest = 0;
        let hTotalPrincipal = 0;
        for (let i = 0; i < monthsDiff; i++) {
          const interest = hBalance * monthlyRate;
          const principalPart = monthlyPayment - interest;
          if (principalPart <= 0) break;
          hTotalInterest += interest;
          hTotalPrincipal += principalPart;
          hBalance -= principalPart;
          history.push({
            month: i - monthsDiff,
            balance: hBalance,
            interestPaid: hTotalInterest,
            principalPaid: hTotalPrincipal,
            isHistory: true
          });
          if (hBalance <= balance) break;
        }
      }

      const totalSaved = histSaved + simSaved;

      // ── Update UI ──
      els.orig.textContent = '$' + Math.round(origAmount).toLocaleString();
      els.origLabel.textContent = `Original Loan (${rate}%)`;
      els.balance.textContent = '$' + Math.round(balance).toLocaleString();
      els.percent.textContent = pctPaid + '%';
      els.bar.style.width = pctPaid + '%';

      // Savings breakdown
      els.histSavings.textContent = '$' + Math.round(histSaved).toLocaleString();
      if (histSaved > 0 && monthsAhead > 0) {
        const aheadYrs = Math.floor(monthsAhead / 12);
        const aheadMos = monthsAhead % 12;
        const aheadStr = aheadYrs > 0 ? `${aheadYrs}y ${aheadMos}m` : `${aheadMos} months`;
        els.histSavingsNote.textContent = `You're ${aheadStr} ahead of schedule!`;
      } else if (startDate) {
        els.histSavingsNote.textContent = 'On track with standard schedule';
      } else {
        els.histSavingsNote.textContent = 'Set a start date in Settings to track';
      }
      els.simSavings.textContent = '$' + Math.round(simSaved).toLocaleString();
      els.totalSavings.textContent = '$' + Math.round(totalSaved).toLocaleString();

      const yrs = Math.floor(monthsSaved / 12);
      const mos = monthsSaved % 12;
      els.timeSaved.textContent = yrs > 0 ? `${yrs}y ${mos}m` : `${mos} Months`;

      const payoffDate = new Date();
      payoffDate.setMonth(payoffDate.getMonth() + optimized.months);
      els.payoffDate.textContent = payoffDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      if (startDate) {
        els.statusMsg.textContent = `Tracking since ${new Date(startDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
      }

      // Recommendation
      if (extraMonthly > 0 || lumpSum > 0) {
        const timeParts = [];
        if (yrs > 0) timeParts.push(`${yrs} years`);
        if (mos > 0) timeParts.push(`${mos} months`);
        const timeStr = timeParts.join(' and ') || 'less than a month';
        let recText = `By paying an extra $${(extraMonthly + lumpSum).toLocaleString()}, you'll save $${Math.round(simSaved).toLocaleString()} in interest and be debt-free ${timeStr} sooner.`;
        if (histSaved > 0) {
          recText += ` Combined with your $${Math.round(histSaved).toLocaleString()} already saved, your total savings would be $${Math.round(totalSaved).toLocaleString()}.`;
        }
        els.recommendation.textContent = recText;
      } else if (histSaved > 0) {
        els.recommendation.textContent = `Great progress! You've already saved $${Math.round(histSaved).toLocaleString()} in interest by paying ahead of schedule. Use the simulation sliders to see how you can save even more.`;
      } else {
        els.recommendation.textContent = `Use the simulation sliders to see how extra payments can accelerate your payoff and save thousands in interest.`;
      }

      // Table
      const thead = els.tableHead;
      if (thead && thead.innerHTML === '') {
        thead.innerHTML = '<tr><th>Pmnt #</th><th>Month</th><th>Balance</th><th>Interest</th><th>Equity</th></tr>';
      }
      const tbody = els.tableBody;
      tbody.innerHTML = '';

      // Prepare data for table
      const lastHist = history[history.length - 1] || { interestPaid: 0, principalPaid: 0 };
      const todayRow = {
        month: 0,
        balance: balance,
        interestPaid: lastHist.interestPaid,
        principalPaid: lastHist.principalPaid,
        isToday: true
      };
      const combinedSched = [...history, todayRow, ...optimized.schedule];

      // Ensure toggle exists and works
      els.toggleHistory.onclick = () => {
        showHistory = !showHistory;
        els.toggleHistory.textContent = showHistory ? 'Hide History' : 'Show History';
        runCalculation();
      };
      els.toggleHistory.textContent = showHistory ? 'Hide History' : 'Show History';

      for (let i = 0; i < combinedSched.length; i++) {
        const row = combinedSched[i];
        if (row.isHistory && !showHistory) continue;

        const tr = document.createElement('tr');
        if (row.isHistory) tr.style.opacity = '0.6';
        if (row.isToday) tr.classList.add('pp-row-current');

        const d = new Date(); d.setMonth(d.getMonth() + row.month);

        // Pmnt # calculation: If startDate is 24 months ago, Today is pmnt #25
        const historyLen = history.length;
        const pmntNum = historyLen + row.month + (startDate ? 1 : 0);
        const pmntDisplay = pmntNum > 0 ? `#${pmntNum}` : '-';

        tr.innerHTML = `
          <td>${pmntDisplay}</td>
          <td>${d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} ${row.isToday ? '<b>(Current)</b>' : (row.isHistory ? '(Past)' : '')}</td>
          <td>$${Math.round(row.balance).toLocaleString()}</td>
          <td>$${Math.round(row.interestPaid).toLocaleString()}</td>
          <td>$${Math.round(row.principalPaid).toLocaleString()}</td>
        `;
        tbody.appendChild(tr);
      }

      // Charts: Stable Initialization
      requestAnimationFrame(() => {
        renderCharts(balance, baseline, optimized, origAmount, rate, startDate, monthlyPayment, history);
      });
    });
  }

  function renderCharts(currentBalance, baseline, optimized, origAmount, rate, startDate, monthlyPayment, history = []) {
    const Chart = window.Chart;
    if (!Chart) return;

    const lineCtx = $('pp-chart-line');
    const pieCtx = $('pp-chart-pie');
    if (!lineCtx || !pieCtx) return;

    const rect = lineCtx.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      retryCount++;
      if (retryCount < 30) { // Limit retries to ~0.5s
        requestAnimationFrame(() => renderCharts(currentBalance, baseline, optimized, origAmount, rate, startDate, monthlyPayment, history));
      }
      return;
    }
    retryCount = 0; // Reset on success

    if (charts.line) charts.line.destroy();
    if (charts.pie) charts.pie.destroy();

    const isLight = root.classList.contains('light-theme');
    const textColor = isLight ? '#475569' : '#94a3b8';
    const gridColor = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)';
    const accentColor = isLight ? '#059669' : '#10b981';

    // Derive Data (Include history if available)
    const fullBaseline = [...history, ...baseline.schedule];
    const fullOptimized = [...history, ...optimized.schedule];

    // x-axis step logic
    const totalMonths = fullBaseline.length;
    const step = totalMonths > 240 ? 12 : 6;

    const labels = fullBaseline.filter((_, i) => i % step === 0).map(d => d.month);
    const baseData = fullBaseline.filter((_, i) => i % step === 0).map(d => d.balance);

    // Map Optimized to same labels, padding with 0 when paid off
    const optData = labels.map(m => {
      const found = fullOptimized.find(s => s.month === m);
      return found ? found.balance : 0;
    });

    charts.line = new Chart(lineCtx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: 'Standard', data: baseData, borderColor: isLight ? '#94a3b8' : 'rgba(148,163,184,0.3)', borderWidth: 2, borderDash: [6, 4], fill: false, tension: 0.4, pointRadius: 0 },
          { label: 'Accelerated', data: optData, borderColor: accentColor, borderWidth: 3, fill: { target: 'origin', above: isLight ? 'rgba(16,185,129,0.04)' : 'rgba(16,185,129,0.06)' }, tension: 0.4, pointRadius: 0 }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { intersect: false, mode: 'index' },
        plugins: {
          legend: { labels: { color: textColor, font: { size: 10, weight: '600', family: 'DM Sans' }, usePointStyle: true, pointStyle: 'circle', padding: 20 } },
          tooltip: {
            backgroundColor: isLight ? '#ffffff' : '#111827',
            titleColor: isLight ? '#0f172a' : '#ffffff',
            bodyColor: isLight ? '#334155' : '#e2e8f0',
            borderColor: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.1)',
            borderWidth: 1, padding: 12, cornerRadius: 8,
            titleFont: { family: 'Space Grotesk', size: 12, weight: 'bold' },
            bodyFont: { family: 'JetBrains Mono', size: 11 },
            callbacks: { label: ctx => ` ${ctx.dataset.label}: $${ctx.parsed.y.toLocaleString()}` }
          }
        },
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: textColor, font: { size: 10, family: 'Space Grotesk' } }, title: { display: true, text: 'Months (Projected)', color: textColor, font: { weight: '600' } } },
          y: { grid: { color: gridColor }, ticks: { color: textColor, font: { size: 10, family: 'JetBrains Mono' }, callback: v => '$' + (v / 1000).toFixed(0) + 'k' }, title: { display: true, text: 'Remaining Balance', color: textColor, font: { weight: '600' } } }
        }
      }
    });

    // Pie chart

    const paid = origAmount - currentBalance;
    const remaining = currentBalance;
    const progressPct = origAmount > 0 ? ((paid / origAmount) * 100).toFixed(0) : 0;
    els.piePercent.textContent = `${progressPct}%`;

    charts.pie = new Chart(pieCtx, {
      type: 'doughnut',
      data: {
        labels: ['Paid Off', 'Remaining'],
        datasets: [{
          data: [paid, remaining],
          backgroundColor: isLight ? ['#10b981', '#cbd5e1'] : ['#6ee7b7', '#1e293b'],
          borderWidth: 0,
          borderRadius: 4,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '78%',
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: isLight ? '#ffffff' : '#0b1121',
            titleColor: isLight ? '#111827' : '#ffffff',
            bodyColor: isLight ? '#374151' : '#e2e8f0',
            borderColor: isLight ? '#e2e8f0' : '#1e293b',
            borderWidth: 1,
            cornerRadius: 10,
            padding: 10,
            callbacks: { label: ctx => ' $' + ctx.parsed.toLocaleString() }
          }
        }
      }
    });
    const paidDot = isLight ? '#10b981' : '#6ee7b7';
    const remDot = isLight ? '#cbd5e1' : '#1e293b';
    els.pieLegend.innerHTML = `
      <div style="display:flex; justify-content:center; gap:20px; font-weight:600">
        <span><span style="color:${paidDot}">●</span> Paid</span>
        <span><span style="color:${remDot}">●</span> Remaining</span>
      </div>
    `;
  }

  function updateDashboard() { runCalculation(); }

  // ── Event Wiring ──

  // Bubble toggle
  bubble.onclick = () => {
    const hostname = window.location.hostname;
    chrome.storage.local.get(['siteOverrides', 'prefs'], (res) => {
      if (res.prefs?.theme === 'light') root.classList.add('light-theme');
      else root.classList.remove('light-theme');

      const ov = res.siteOverrides?.[hostname];
      if (ov && ov.rate > 0 && ov.origAmount > 0) {
        modal.style.display = 'flex';
        // Re-scan page for updated balance before showing dashboard
        refreshBalanceFromPage(() => {
          updateDashboard();
        });
      } else {
        onboarding.style.display = 'flex';
        setStep(0);
        showSuggestions();
      }
    });
  };

  // Theme Toggle
  $('pp-theme-toggle').onclick = () => {
    root.classList.toggle('light-theme');
    const theme = root.classList.contains('light-theme') ? 'light' : 'dark';
    chrome.storage.local.get(['prefs'], (res) => {
      const prefs = res.prefs || {};
      prefs.theme = theme;
      chrome.storage.local.set({ prefs });
    });
    runCalculation(); // Refresh charts with new colors
  };

  // Close buttons
  $('pp-close').onclick = () => { modal.style.display = 'none'; settings.style.display = 'none'; };
  $('pp-ob-close').onclick = () => { onboarding.style.display = 'none'; };



  // Sliders
  els.slideMonthly.oninput = runCalculation;
  els.slideDrop.oninput = runCalculation;

  $('pp-ob-confirm').onclick = () => setStep(1);
  $('pp-ob-back0').onclick = () => setStep(0);

  // Onboarding: Step 1 → finish
  $('pp-ob-finish').onclick = () => {
    const hostname = window.location.hostname;
    const origAmount = parseFloat($('ob-orig-amount').value);
    const rate = parseFloat($('ob-rate').value);
    const payment = parseFloat($('ob-payment').value);
    const term = parseFloat($('ob-term').value);
    const startDate = $('ob-start-date').value;
    const loanType = $('ob-loan-type').value;

    if (!origAmount || !rate || !payment) {
      alert('Please fill in the required fields: Original Amount, Interest Rate, and Monthly Payment.');
      return;
    }

    const balanceValue = detectedBalance ? detectedBalance.value : origAmount;

    // Save overrides
    chrome.storage.local.get(['siteOverrides'], (res) => {
      const overrides = res.siteOverrides || {};
      overrides[hostname] = {
        loanType, origAmount, rate, termYears: term || 30,
        monthlyPayment: payment, startDate: startDate || new Date().toISOString().slice(0, 10),
        nickname: loanType.charAt(0).toUpperCase() + loanType.slice(1) + ' Loan'
      };

      const loanData = {
        ledgerBalance: balanceValue, loanAmount: origAmount,
        monthlyPayment: payment, interestRate: rate,
        loanType, isRealData: !!detectedBalance
      };

      chrome.storage.local.set({ siteOverrides: overrides, loanData }, () => {
        // Show summary
        const summary = $('pp-ob-summary');
        summary.innerHTML = `
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px">
            <div><strong style="color:var(--text-muted)">Type:</strong> ${loanType}</div>
            <div><strong style="color:var(--text-muted)">Balance:</strong> $${balanceValue.toLocaleString()}</div>
            <div><strong style="color:var(--text-muted)">Original:</strong> $${origAmount.toLocaleString()}</div>
            <div><strong style="color:var(--text-muted)">Rate:</strong> ${rate}%</div>
            <div><strong style="color:var(--text-muted)">Payment:</strong> $${payment.toLocaleString()}/mo</div>
            <div><strong style="color:var(--text-muted)">Term:</strong> ${term || 30} years</div>
          </div>`;
        setStep(2);
      });
    });
  };

  // Onboarding: Step 2 → open dashboard
  $('pp-ob-open-dash').onclick = () => {
    onboarding.style.display = 'none';
    modal.style.display = 'flex';
    updateDashboard();
  };

  // Settings
  $('pp-settings-btn').onclick = () => {
    const vis = settings.style.display === 'flex';
    settings.style.display = vis ? 'none' : 'flex';
    if (!vis) {
      const hostname = window.location.hostname;
      chrome.storage.local.get(['siteOverrides'], (res) => {
        const cfg = res.siteOverrides?.[hostname];
        if (cfg) {
          $('set-loan-type').value = cfg.loanType || 'mortgage';
          $('set-orig-amount').value = cfg.origAmount || '';
          $('set-rate').value = cfg.rate || '';
          $('set-payment').value = cfg.monthlyPayment || '';
          $('set-start-date').value = cfg.startDate || '';
        }
      });
    }
  };

  $('pp-save-settings').onclick = () => {
    const hostname = window.location.hostname;
    chrome.storage.local.get(['siteOverrides'], (res) => {
      const overrides = res.siteOverrides || {};
      overrides[hostname] = {
        ...(overrides[hostname] || {}),
        loanType: $('set-loan-type').value,
        origAmount: parseFloat($('set-orig-amount').value) || 0,
        rate: parseFloat($('set-rate').value) || 0,
        monthlyPayment: parseFloat($('set-payment').value) || 0,
        startDate: $('set-start-date').value
      };
      chrome.storage.local.set({ siteOverrides: overrides }, () => {
        settings.style.display = 'none';
        updateDashboard();
      });
    });
  };

  $('pp-reset-all').onclick = () => {
    if (confirm('Reset ALL settings for this site? This cannot be undone.')) {
      const hostname = window.location.hostname;
      chrome.storage.local.get(['siteOverrides', 'siteSelectors'], (res) => {
        const overrides = res.siteOverrides || {};
        const selectors = res.siteSelectors || {};
        delete overrides[hostname];
        delete selectors[hostname];
        chrome.storage.local.set({ siteOverrides: overrides, siteSelectors: selectors }, () => {
          chrome.storage.local.remove(['loanData'], () => {
            modal.style.display = 'none';
            settings.style.display = 'none';
            detectedBalance = null;
            onboarding.style.display = 'flex';
            setStep(0);
            showSuggestions();
          });
        });
      });
    }
  };

  // Close settings when clicking modal background
  modal.onclick = (e) => {
    if (settings.style.display === 'flex' && !settings.contains(e.target) && e.target.id !== 'pp-settings-btn') {
      settings.style.display = 'none';
    }
  };

  // ── AUTO-SHOW: decide what to show on first open ──
  const hostname = window.location.hostname;
  chrome.storage.local.get(['siteOverrides'], (res) => {
    const ov = res.siteOverrides?.[hostname];
    if (ov && ov.rate > 0 && ov.origAmount > 0) {
      modal.style.display = 'flex';
      // Re-scan page for updated balance on page load
      refreshBalanceFromPage(() => {
        updateDashboard();
      });
    } else {
      onboarding.style.display = 'flex';
      setStep(0);
      showSuggestions();
    }
  });
}

// ═══════════════════════════════════════════════════════════════
//  MODULE 5: BOOTSTRAP — Bubble only on page load
// ═══════════════════════════════════════════════════════════════
function injectBubbleOnly() {
  if (document.getElementById('payoffpath-root')) return;

  const root = document.createElement('div');
  root.id = 'payoffpath-root';
  root.style.cssText = 'position:relative; z-index:2147483647;';
  const shadow = root.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');
    .pp-bubble {
      pointer-events: auto;
      position: fixed; bottom: 24px; right: 24px; width: 48px; height: 48px;
      background: linear-gradient(135deg, #34d399, #10b981);
      border-radius: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center;
      box-shadow: 0 6px 24px rgba(52,211,153,0.3); z-index: 2147483640;
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .pp-bubble:hover { transform: translateY(-3px) scale(1.08); }
  `;

  const bubble = document.createElement('div');
  bubble.className = 'pp-bubble';
  bubble.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`;

  bubble.onclick = () => {
    root.remove();
    buildFullUI();
  };

  shadow.appendChild(style);
  shadow.appendChild(bubble);
  document.body.appendChild(root);
}

// ── Entry Point ──
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectBubbleOnly);
} else {
  injectBubbleOnly();
}
