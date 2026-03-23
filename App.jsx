import { useState, useEffect, useRef, useCallback } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};
const _fbApp = initializeApp(firebaseConfig);
const db     = getFirestore(_fbApp);
const auth   = getAuth(_fbApp);

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,500;0,700;0,900;1,300;1,500&family=DM+Sans:wght@300;400;500;600&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #0c0c16; --bg2: #111122; --bg3: #181830; --bg4: #1f1f3a;
      --border: #272748; --border2: #353560;
      --amber: #00d4ff; --amber-soft: #38e8ff; --amber-dim: rgba(0,212,255,0.10);
      --sage: #00e5a8; --sage-dim: rgba(0,229,168,0.10);
      --clay: #ff3d78; --clay-dim: rgba(255,61,120,0.10);
      --sky: #4d8fff; --sky-dim: rgba(77,143,255,0.10);
      --lavender: #b060ff; --lavender-dim: rgba(176,96,255,0.10);
      --cream: #e8eeff; --cream-dim: rgba(232,238,255,0.65);
      --muted: #6a6a90;
      --font-display: 'Fraunces', Georgia, serif;
      --font-body: 'DM Sans', system-ui, sans-serif;
      --r: 10px; --r-lg: 16px;
    }
    body { background: var(--bg); color: var(--cream); font-family: var(--font-body); }
    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-track { background: var(--bg); }
    ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
    .app-wrap { display: flex; height: 100vh; overflow: hidden; }
    .sidebar { width: 228px; min-width: 228px; background: var(--bg2); border-right: 1px solid var(--border); display: flex; flex-direction: column; padding: 20px 0; overflow-y: auto; }
    .sidebar-logo { padding: 0 20px 20px; border-bottom: 1px solid var(--border); margin-bottom: 8px; }
    .logo-title { font-family: var(--font-display); font-size: 24px; font-weight: 700; color: var(--amber); letter-spacing: -0.5px; }
    .logo-badge { display: inline-block; font-size: 9px; text-transform: uppercase; letter-spacing: 2px; color: #0c0c16; background: var(--amber); padding: 2px 7px; border-radius: 20px; margin-top: 4px; font-weight: 700; }
    .logo-role { font-size: 10px; color: var(--muted); margin-top: 5px; }
    .nav-section { padding: 14px 12px 4px; font-size: 9px; text-transform: uppercase; letter-spacing: 2px; color: var(--muted); }
    .nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 20px; cursor: pointer; font-size: 13px; font-weight: 500; color: var(--muted); transition: all 0.15s; border-radius: 0; position: relative; }
    .nav-item:hover { color: var(--cream); background: var(--bg3); }
    .nav-item.active { color: var(--amber); background: var(--amber-dim); }
    .nav-item.active::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: var(--amber); border-radius: 0 3px 3px 0; }
    .nav-icon { font-size: 15px; width: 20px; text-align: center; }
    .nav-badge { margin-left: auto; background: var(--clay); color: #fff; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 10px; }
    .sidebar-footer { margin-top: auto; padding: 16px 20px; border-top: 1px solid var(--border); }
    .pts-label { font-size: 10px; color: var(--muted); text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px; }
    .pts-count { font-family: var(--font-display); font-size: 28px; font-weight: 700; color: var(--amber); line-height: 1; }
    .pts-bar { height: 4px; background: var(--border); border-radius: 4px; margin-top: 8px; overflow: hidden; }
    .pts-fill { height: 100%; background: linear-gradient(90deg, var(--amber), var(--lavender)); border-radius: 4px; transition: width 0.6s ease; }
    .main { flex: 1; overflow-y: auto; background: var(--bg); }
    .page-header { padding: 28px 36px 18px; border-bottom: 1px solid var(--border); }
    .page-title { font-family: var(--font-display); font-size: 30px; font-weight: 700; color: var(--cream); letter-spacing: -0.8px; }
    .page-sub { font-size: 13px; color: var(--muted); margin-top: 3px; }
    .page-content { padding: 24px 36px; }
    .card { background: var(--bg2); border: 1px solid var(--border); border-radius: var(--r-lg); padding: 20px; }
    .card-sm { background: var(--bg2); border: 1px solid var(--border); border-radius: var(--r); padding: 14px; }
    .card:hover { border-color: var(--border2); }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
    .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
    .tag { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 500; }
    .tag-amber { background: var(--amber-dim); color: var(--amber); border: 1px solid rgba(0,212,255,0.30); }
    .tag-sage { background: var(--sage-dim); color: var(--sage); border: 1px solid rgba(0,229,168,0.30); }
    .tag-clay { background: var(--clay-dim); color: var(--clay); border: 1px solid rgba(255,61,120,0.30); }
    .tag-sky { background: var(--sky-dim); color: var(--sky); border: 1px solid rgba(77,143,255,0.30); }
    .tag-lavender { background: var(--lavender-dim); color: var(--lavender); border: 1px solid rgba(176,96,255,0.30); }
    .tag-muted { background: var(--bg3); color: var(--muted); border: 1px solid var(--border); }
    .btn { display: inline-flex; align-items: center; gap: 7px; padding: 9px 18px; border-radius: var(--r); border: none; cursor: pointer; font-family: var(--font-body); font-weight: 600; font-size: 13px; transition: all 0.15s; }
    .btn-primary { background: var(--amber); color: #0c0c16; }
    .btn-primary:hover { background: var(--amber-soft); }
    .btn-ghost { background: transparent; color: var(--cream-dim); border: 1px solid var(--border); }
    .btn-ghost:hover { background: var(--bg3); color: var(--cream); }
    .btn-sage { background: var(--sage-dim); color: var(--sage); border: 1px solid rgba(0,229,168,0.3); }
    .btn-clay { background: var(--clay-dim); color: var(--clay); border: 1px solid rgba(255,61,120,0.3); }
    .btn-sky { background: var(--sky-dim); color: var(--sky); border: 1px solid rgba(77,143,255,0.3); }
    .btn-lavender { background: var(--lavender-dim); color: var(--lavender); border: 1px solid rgba(176,96,255,0.3); }
    .btn-sm { padding: 6px 13px; font-size: 12px; }
    .btn-xs { padding: 4px 9px; font-size: 11px; border-radius: 6px; }
    .btn-icon { padding: 7px; border-radius: 8px; }
    .btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .input { background: var(--bg3); border: 1px solid var(--border); border-radius: var(--r); padding: 9px 13px; color: var(--cream); font-family: var(--font-body); font-size: 13px; width: 100%; outline: none; transition: border 0.15s; }
    .input:focus { border-color: var(--amber); }
    .input::placeholder { color: var(--muted); }
    select.input { cursor: pointer; }
    .textarea { min-height: 72px; resize: vertical; }
    .label { font-size: 11px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; display: block; }
    .form-row { margin-bottom: 14px; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.88); z-index: 200; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .modal { background: var(--bg2); border: 1px solid var(--border); border-radius: var(--r-lg); width: 100%; max-width: 580px; max-height: 88vh; overflow-y: auto; }
    .modal-lg { max-width: 780px; }
    .modal-header { padding: 22px 26px 18px; border-bottom: 1px solid var(--border); position: sticky; top: 0; background: var(--bg2); z-index: 1; display: flex; align-items: center; justify-content: space-between; }
    .modal-body { padding: 22px 26px; }
    .modal-footer { padding: 14px 26px; border-top: 1px solid var(--border); display: flex; gap: 10px; justify-content: flex-end; }
    .stat-card { background: var(--bg2); border: 1px solid var(--border); border-radius: var(--r-lg); padding: 20px; }
    .stat-num { font-family: var(--font-display); font-size: 36px; font-weight: 700; line-height: 1; }
    .stat-label { font-size: 12px; color: var(--muted); margin-top: 4px; font-weight: 500; }
    .interest-chip { padding: 9px 15px; border-radius: 30px; border: 1.5px solid var(--border); background: var(--bg2); cursor: pointer; font-size: 13px; font-weight: 500; color: var(--muted); transition: all 0.15s; display: inline-flex; align-items: center; gap: 6px; }
    .interest-chip:hover { border-color: var(--amber); color: var(--cream); }
    .interest-chip.selected { border-color: var(--amber); background: var(--amber-dim); color: var(--amber); }
    .skill-card { background: var(--bg2); border: 1px solid var(--border); border-radius: var(--r); padding: 15px; cursor: pointer; transition: all 0.15s; position: relative; }
    .skill-card:hover { border-color: var(--amber); transform: translateY(-2px); }
    .skill-card.done { border-color: var(--sage); background: var(--sage-dim); }
    .proj-card { background: var(--bg2); border: 1px solid var(--border); border-radius: var(--r-lg); padding: 18px; cursor: pointer; transition: all 0.2s; position: relative; overflow: hidden; }
    .proj-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; }
    .proj-card.color-amber::before { background: var(--amber); }
    .proj-card.color-sage::before { background: var(--sage); }
    .proj-card.color-clay::before { background: var(--clay); }
    .proj-card.color-sky::before { background: var(--sky); }
    .proj-card.color-lavender::before { background: var(--lavender); }
    .proj-card:hover { transform: translateY(-3px); box-shadow: 0 12px 40px rgba(0,0,0,0.5); }
    .proj-title { font-family: var(--font-display); font-size: 16px; font-weight: 600; color: var(--cream); margin: 8px 0 5px; line-height: 1.3; }
    .proj-desc { font-size: 13px; color: var(--muted); line-height: 1.6; margin-bottom: 10px; }
    .pts-badge { display: inline-flex; align-items: center; gap: 4px; background: var(--amber-dim); color: var(--amber); border: 1px solid rgba(0,212,255,0.30); padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 600; }
    .duration-badge { display: inline-flex; align-items: center; gap: 4px; background: var(--bg3); color: var(--muted); border: 1px solid var(--border); padding: 3px 9px; border-radius: 20px; font-size: 11px; }
    .year-block { background: var(--bg2); border: 1px solid var(--border); border-radius: var(--r-lg); margin-bottom: 20px; overflow: hidden; }
    .year-header { padding: 14px 20px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; cursor: pointer; }
    .year-title { font-family: var(--font-display); font-size: 20px; font-weight: 700; color: var(--cream); }
    .year-body { padding: 20px; }
    .quarter-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .quarter-card { background: var(--bg3); border: 1px solid var(--border); border-radius: var(--r); padding: 14px; }
    .quarter-label { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: var(--muted); margin-bottom: 8px; }
    .portfolio-item { background: var(--bg2); border: 1px solid var(--border); border-radius: var(--r-lg); padding: 18px; display: flex; gap: 14px; align-items: flex-start; }
    .portfolio-thumb { width: 52px; height: 52px; border-radius: var(--r); display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; }
    .transcript-area { background: var(--bg2); border: 1px solid var(--border); border-radius: var(--r-lg); overflow: hidden; margin-bottom: 14px; }
    .transcript-header { padding: 13px 18px; display: flex; align-items: center; justify-content: space-between; background: var(--bg3); border-bottom: 1px solid var(--border); }
    .transcript-progress { height: 3px; background: var(--border); overflow: hidden; }
    .transcript-fill { height: 100%; border-radius: 3px; }
    .transcript-row { padding: 9px 18px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; font-size: 13px; }
    .transcript-row:last-child { border-bottom: none; }
    .onboard-wrap { min-height: 100vh; background: var(--bg); display: flex; align-items: center; justify-content: center; padding: 40px; }
    .onboard-card { background: var(--bg2); border: 1px solid var(--border); border-radius: 24px; padding: 44px; width: 100%; max-width: 700px; }
    .check-box { width: 20px; height: 20px; border: 2px solid var(--border); border-radius: 5px; cursor: pointer; flex-shrink: 0; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
    .check-box.checked { background: var(--sage); border-color: var(--sage); }
    .checklist-item { display: flex; align-items: flex-start; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--border); }
    .checklist-item:last-child { border-bottom: none; }
    .filter-row { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 18px; }
    .filter-btn { padding: 6px 13px; border-radius: 20px; border: 1px solid var(--border); background: var(--bg2); cursor: pointer; font-size: 12px; font-weight: 500; color: var(--muted); transition: all 0.15s; font-family: var(--font-body); }
    .filter-btn:hover { color: var(--cream); border-color: var(--border2); }
    .filter-btn.active { background: var(--amber-dim); border-color: rgba(0,212,255,0.4); color: var(--amber); }
    .search-bar { display: flex; align-items: center; gap: 8px; background: var(--bg3); border: 1px solid var(--border); border-radius: 30px; padding: 8px 14px; flex: 1; }
    .search-bar input { background: none; border: none; outline: none; color: var(--cream); font-family: var(--font-body); font-size: 13px; width: 100%; }
    .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 24px; text-align: center; gap: 12px; }
    .empty-state .icon { font-size: 40px; opacity: 0.5; }
    .divider { height: 1px; background: var(--border); margin: 18px 0; }
    .flex { display: flex; } .flex-center { display: flex; align-items: center; } .flex-between { display: flex; align-items: center; justify-content: space-between; }
    .gap-6 { gap: 6px; } .gap-8 { gap: 8px; } .gap-10 { gap: 10px; } .gap-12 { gap: 12px; } .gap-16 { gap: 16px; }
    .wrap { flex-wrap: wrap; } .mt-4{margin-top:4px} .mt-8{margin-top:8px} .mt-10{margin-top:10px} .mt-12{margin-top:12px} .mt-16{margin-top:16px} .mt-20{margin-top:20px} .mt-24{margin-top:24px}
    .mb-4{margin-bottom:4px} .mb-8{margin-bottom:8px} .mb-10{margin-bottom:10px} .mb-12{margin-bottom:12px} .mb-16{margin-bottom:16px} .mb-20{margin-bottom:20px} .mb-24{margin-bottom:24px}
    .text-muted{color:var(--muted)} .text-amber{color:var(--amber)} .text-sage{color:var(--sage)} .text-cream{color:var(--cream)} .text-clay{color:var(--clay)} .text-sky{color:var(--sky)} .text-lavender{color:var(--lavender)}
    .text-sm{font-size:12px} .text-xs{font-size:11px} .font-display{font-family:var(--font-display)} .fw-600{font-weight:600} .fw-700{font-weight:700}
    .pill-row { display: flex; flex-wrap: wrap; gap: 6px; }
    .editable-text { border: 1px dashed transparent; border-radius: 6px; padding: 2px 5px; margin: -2px -5px; cursor: text; transition: border 0.15s; }
    .editable-text:hover { border-color: var(--border); }
    .editable-text:focus { border-color: var(--amber); outline: none; background: var(--bg3); }
    .role-selector { min-height: 100vh; background: var(--bg); display: flex; align-items: center; justify-content: center; padding: 40px; }
    .role-card { background: var(--bg2); border: 2px solid var(--border); border-radius: 20px; padding: 32px; cursor: pointer; transition: all 0.2s; text-align: center; width: 260px; }
    .role-card:hover { border-color: var(--amber); transform: translateY(-4px); box-shadow: 0 20px 60px rgba(0,212,255,0.15); }
    .faction-card { background: var(--bg2); border: 1px solid var(--border); border-radius: var(--r-lg); padding: 20px; cursor: pointer; transition: all 0.2s; position: relative; overflow: hidden; }
    .faction-card:hover { transform: translateY(-3px); border-color: var(--border2); }
    .faction-card.selected { border-color: var(--amber) !important; background: var(--amber-dim); }
    .gig-card { background: var(--bg3); border: 1px solid var(--border); border-radius: var(--r); padding: 14px; transition: all 0.15s; }
    .gig-card:hover { border-color: var(--border2); }
    .gig-card.done { border-color: var(--sage); background: rgba(0,229,168,0.08); }
    .planner-slot { background: var(--bg2); border: 1px solid var(--border); border-radius: var(--r); padding: 14px; transition: all 0.15s; }
    .planner-slot.filled { border-color: var(--sage); background: var(--sage-dim); }
    .planner-slot.empty { border-style: dashed; cursor: pointer; }
    .planner-slot.empty:hover { border-color: var(--amber); }
    .rhythm-badge { padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
    .content-table { width: 100%; border-collapse: collapse; }
    .content-table th { padding: 10px 14px; text-align: left; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: var(--muted); border-bottom: 1px solid var(--border); background: var(--bg3); }
    .content-table td { padding: 11px 14px; font-size: 13px; border-bottom: 1px solid var(--border); vertical-align: middle; }
    .content-table tr:last-child td { border-bottom: none; }
    .content-table tr:hover td { background: var(--bg3); }
    .approval-card { background: var(--bg2); border: 1px solid var(--border); border-radius: var(--r-lg); padding: 18px; margin-bottom: 12px; }
    .student-row { display: flex; align-items: center; gap: 14px; padding: 14px 18px; border-bottom: 1px solid var(--border); cursor: pointer; transition: background 0.15s; }
    .student-row:hover { background: var(--bg3); }
    .student-avatar { width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 15px; flex-shrink: 0; }
    .ai-chat { display: flex; flex-direction: column; height: 420px; }
    .ai-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
    .ai-msg { padding: 10px 14px; border-radius: 12px; font-size: 13px; line-height: 1.6; max-width: 85%; }
    .ai-msg.user { background: var(--amber-dim); color: var(--cream); border: 1px solid rgba(0,212,255,0.25); margin-left: auto; border-bottom-right-radius: 4px; }
    .ai-msg.assistant { background: var(--bg3); color: var(--cream-dim); border: 1px solid var(--border); border-bottom-left-radius: 4px; }
    .ai-input-row { display: flex; gap: 8px; padding: 12px 16px; border-top: 1px solid var(--border); }
    .ripple-card { background: var(--bg2); border: 1px solid var(--border); border-radius: var(--r-lg); padding: 18px; transition: all 0.15s; }
    .ripple-card:hover { border-color: var(--sage); }
    .ripple-card.done { border-color: var(--sage); background: var(--sage-dim); }
    .guide-card { background: var(--bg2); border: 1px solid var(--border); border-radius: var(--r-lg); padding: 18px; cursor: pointer; transition: all 0.15s; }
    .guide-card:hover { border-color: var(--sky); transform: translateY(-2px); }
    .lightroom-card { background: var(--bg2); border: 1px solid var(--border); border-radius: var(--r-lg); padding: 18px; cursor: pointer; transition: all 0.15s; position: relative; overflow: hidden; }
    .lightroom-card:hover { transform: translateY(-2px); border-color: var(--lavender); }
    .lightroom-card.done { border-color: var(--sage); }
    .drop-card { border-radius: var(--r-lg); padding: 24px; border: 1px solid; }
    .week-progress-ring { width: 56px; height: 56px; flex-shrink: 0; }
  `}</style>
);

// ─── DATA ─────────────────────────────────────────────────────────────────────

const INTERESTS = [
  { id: "writing", label: "Writing", icon: "✍️", color: "amber" },
  { id: "art", label: "Visual Art", icon: "🎨", color: "lavender" },
  { id: "music", label: "Music", icon: "🎵", color: "lavender" },
  { id: "film", label: "Film & Photography", icon: "🎬", color: "sky" },
  { id: "tech", label: "Technology & Code", icon: "💻", color: "sky" },
  { id: "gaming", label: "Game Design", icon: "🎮", color: "sky" },
  { id: "making", label: "Making & Building", icon: "🔨", color: "amber" },
  { id: "science", label: "Science", icon: "🔬", color: "sage" },
  { id: "math", label: "Math", icon: "🔢", color: "sky" },
  { id: "history", label: "History & Politics", icon: "🏛️", color: "amber" },
  { id: "philosophy", label: "Philosophy & Ethics", icon: "🏺", color: "amber" },
  { id: "people", label: "People & Communities", icon: "🤝", color: "clay" },
  { id: "nature", label: "Nature & Ecology", icon: "🌿", color: "sage" },
  { id: "food", label: "Food & Cooking", icon: "🍳", color: "clay" },
  { id: "movement", label: "Movement & Sport", icon: "⚡", color: "amber" },
  { id: "business", label: "Business & Entrepreneurship", icon: "🚀", color: "amber" },
  { id: "social", label: "Social Media & Content", icon: "📱", color: "lavender" },
  { id: "fashion", label: "Fashion & Design", icon: "👗", color: "lavender" },
  { id: "health", label: "Health & Wellness", icon: "🧘", color: "sage" },
  { id: "space", label: "Space & Astronomy", icon: "🌙", color: "sky" },
  { id: "animals", label: "Animals & Wildlife", icon: "🦋", color: "sage" },
];

const STRENGTHS = [
  "I learn best by doing, building, or making things",
  "I need to understand the why before I can engage",
  "I work better in short intense sprints than long slow sessions",
  "I prefer self-directed exploration over structured curriculum",
  "I love deep conversations and learning from other people",
  "I'm most creative when I'm given complete freedom",
  "I like having clear goals and knowing when something is done",
  "I'm drawn to projects that have real-world impact",
  "I process things by writing or journaling",
];

const AREAS = [
  { id: "comm", name: "Communication", icon: "🎤", target: 80, color: "--amber",
    subcats: [
      { id: "writing", name: "Writing" },
      { id: "speaking", name: "Speaking & Debate" },
      { id: "languages", name: "World Languages" },
      { id: "digital_media", name: "Digital Media" },
    ]
  },
  { id: "math", name: "Mathematics", icon: "🔢", target: 80, color: "--sky",
    subcats: [
      { id: "applied_math", name: "Applied & Financial Math" },
      { id: "algebra", name: "Algebra & Patterns" },
      { id: "geometry", name: "Geometry & Spatial" },
      { id: "stats", name: "Statistics & Data" },
      { id: "logic", name: "Logic & Reasoning" },
      { id: "calculus", name: "Calculus" },
    ]
  },
  { id: "science", name: "Science", icon: "🔬", target: 80, color: "--sage",
    subcats: [
      { id: "life_sciences", name: "Life Sciences" },
      { id: "chemistry", name: "Chemistry" },
      { id: "physics", name: "Physics" },
      { id: "earth_space", name: "Earth & Space" },
      { id: "sci_method", name: "Scientific Method" },
      { id: "social_sci", name: "Social Sciences" },
    ]
  },
  { id: "history", name: "History & Society", icon: "🏛️", target: 80, color: "--clay",
    subcats: [
      { id: "world_hist", name: "World History" },
      { id: "american_hist", name: "American History" },
      { id: "economics", name: "Economics" },
      { id: "civics", name: "Civics & Government" },
      { id: "anthropology", name: "Anthropology & Culture" },
      { id: "social_movements", name: "Social Movements" },
    ]
  },
  { id: "arts", name: "Arts & Expression", icon: "🎨", target: 80, color: "--lavender",
    subcats: [
      { id: "visual_art", name: "Visual Art" },
      { id: "music", name: "Music" },
      { id: "film_photo", name: "Film & Photography" },
      { id: "creative_writing", name: "Creative Writing" },
      { id: "theater", name: "Theater & Performance" },
      { id: "design", name: "Design & UX" },
    ]
  },
  { id: "tech", name: "Technology & Making", icon: "💻", target: 80, color: "--sky",
    subcats: [
      { id: "coding", name: "Coding & Software" },
      { id: "web", name: "Web Development" },
      { id: "making", name: "Fabrication & Making" },
      { id: "game_design", name: "Game Design" },
      { id: "electronics", name: "Electronics & Robotics" },
      { id: "ai_ml", name: "AI & Machine Learning" },
    ]
  },
  { id: "health", name: "Health & Wellness", icon: "🧘", target: 45, color: "--sage",
    subcats: [
      { id: "fitness", name: "Physical Fitness" },
      { id: "nutrition", name: "Nutrition & Food" },
      { id: "mental_health", name: "Mental Health" },
    ]
  },
  { id: "thinking", name: "Critical Thinking", icon: "🏺", target: 60, color: "--amber",
    subcats: [
      { id: "philosophy", name: "Philosophy & Ethics" },
      { id: "media_lit", name: "Media Literacy" },
      { id: "systems", name: "Systems Thinking" },
      { id: "meta_learning", name: "Learning How to Learn" },
    ]
  },
  { id: "life", name: "Life Skills", icon: "🌱", target: 100, color: "--clay",
    subcats: [
      { id: "business", name: "Business & Entrepreneurship" },
      { id: "finance", name: "Personal Finance" },
      { id: "organization", name: "Organization & Planning" },
      { id: "homemaking", name: "Home & Culinary Arts" },
      { id: "community", name: "Community & Service" },
      { id: "exploration", name: "Exploration & Navigation" },
    ]
  },
];

const SKILLS = [
  { id: "s1", area: "comm", subcat: "writing", name: "Narrative Writing", icon: "📖", pts: 15, interests: ["writing", "film"], desc: "Write compelling stories with structure, voice, and authentic characters.", how: ["Write 3 short stories across different genres", "Get feedback and revise one story twice", "Study a published author's technique"] },
  { id: "s2", area: "comm", subcat: "writing", name: "Research & Synthesis", icon: "🔍", pts: 15, interests: ["philosophy", "history", "science"], desc: "Find, evaluate, and weave information from multiple sources into clear arguments.", how: ["Complete a research project on a topic you care about", "Use at least 5 different source types", "Write a 1,500+ word synthesis piece"] },
  { id: "s3", area: "comm", subcat: "speaking", name: "Persuasive Communication", icon: "🎤", pts: 15, interests: ["people", "business", "philosophy"], desc: "Make compelling cases through writing and speaking.", how: ["Write and deliver a 5-min persuasive speech", "Write a persuasive essay on a real issue", "Debate a topic with someone who disagrees"] },
  { id: "s4", area: "comm", subcat: "writing", name: "Journalism & Reporting", icon: "📰", pts: 20, interests: ["writing", "people", "history"], desc: "Interview people, investigate a story, and write factually with clarity.", how: ["Interview 3 people and write an article", "Research and fact-check a local issue", "Publish something in any format"] },
  { id: "s5", area: "comm", subcat: "speaking", name: "Public Speaking", icon: "🎙️", pts: 10, interests: ["people", "philosophy", "business"], desc: "Structure your thoughts, manage nerves, and speak so people remember.", how: ["Give 3 presentations to real audiences", "Record yourself and review", "Facilitate a group discussion"] },
  { id: "s6", area: "comm", subcat: "languages", name: "World Language Foundations", icon: "🌐", pts: 20, interests: ["history", "people"], desc: "Build functional fluency in a language other than English.", how: ["Complete 100 hrs of study", "Have a 10-minute conversation with a native speaker", "Read one piece in that language"] },
  { id: "s7", area: "comm", subcat: "writing", name: "Poetry & Lyric Writing", icon: "🌸", pts: 10, interests: ["writing", "music", "art"], desc: "Use language as art — rhythm, imagery, compression, and truth.", how: ["Write 12 poems in different styles", "Study 5 poets you love", "Perform or share your work publicly"] },
  { id: "s8", area: "comm", subcat: "digital_media", name: "Content Creation & Media Literacy", icon: "📱", pts: 15, interests: ["social", "film", "business"], desc: "Create content intentionally and understand how media shapes culture.", how: ["Create 10 pieces on a consistent theme", "Study the algorithms of one platform", "Analyze 5 pieces of media critically"] },
  { id: "m1", area: "math", subcat: "applied_math", name: "Practical Math & Financial Literacy", icon: "💰", pts: 20, interests: ["business", "people"], desc: "Real numbers for real life — budgets, taxes, interest, and how money works.", how: ["Build a personal monthly budget", "Calculate compound interest scenarios", "Research and plan a major purchase"] },
  { id: "m2", area: "math", subcat: "algebra", name: "Algebra & Pattern Thinking", icon: "🔢", pts: 15, interests: ["math", "tech", "science"], desc: "Variables, functions, equations — the grammar of mathematical thinking.", how: ["Complete 50 varied algebra problems", "Use algebra to solve a real problem", "Explain a concept to someone else"] },
  { id: "m3", area: "math", subcat: "geometry", name: "Geometry & Spatial Reasoning", icon: "📐", pts: 15, interests: ["art", "making", "math"], desc: "Shapes, space, proportion, and proof — the math behind everything you can see.", how: ["Complete 40 geometry problems including proofs", "Apply geometry to a design project", "Create geometric art"] },
  { id: "m4", area: "math", subcat: "stats", name: "Statistics & Data Literacy", icon: "📊", pts: 20, interests: ["science", "business", "tech"], desc: "Understand data, spot misleading statistics, and draw honest conclusions.", how: ["Collect and analyze a real dataset", "Create visualizations from data", "Debunk a misleading statistic"] },
  { id: "m5", area: "math", subcat: "logic", name: "Logic & Critical Reasoning", icon: "🧩", pts: 15, interests: ["philosophy", "math", "tech"], desc: "Formal and informal logic — how to actually think through arguments.", how: ["Study logical fallacies and identify them in real debates", "Complete formal logic puzzles", "Construct a formal argument"] },
  { id: "m6", area: "math", subcat: "calculus", name: "Calculus Concepts", icon: "∞", pts: 20, interests: ["math", "science", "tech"], desc: "Change, rates, and the math behind motion — conceptual and applied.", how: ["Study limits, derivatives, and integrals conceptually", "Apply calculus to a real problem", "Complete 30 calculus problems"] },
  { id: "sc1", area: "science", subcat: "life_sciences", name: "Ecology & Living Systems", icon: "🌿", pts: 20, interests: ["nature", "animals", "science"], desc: "How living things relate to each other and their environment.", how: ["Do a field study in a local ecosystem", "Map a food web in your area", "Track environmental changes over 30 days"] },
  { id: "sc2", area: "science", subcat: "life_sciences", name: "Human Biology & Health Science", icon: "🫀", pts: 15, interests: ["science", "health", "movement"], desc: "How your body works — from cells to systems to peak performance.", how: ["Study all major body systems", "Run an experiment on your own health metric", "Research one health topic you care about"] },
  { id: "sc3", area: "science", subcat: "chemistry", name: "Chemistry Fundamentals", icon: "⚗️", pts: 15, interests: ["science", "food", "making"], desc: "Atoms, reactions, and why matter does what it does.", how: ["Complete 15 foundational chemistry concepts", "Do 5 hands-on experiments", "Connect chemistry to something you love"] },
  { id: "sc4", area: "science", subcat: "physics", name: "Physics & Forces", icon: "⚡", pts: 15, interests: ["science", "making", "movement"], desc: "Motion, energy, electricity — the rules everything in the universe obeys.", how: ["Build a simple machine demonstrating a physics principle", "Study Newton's laws through real-world examples", "Complete 20 physics problems"] },
  { id: "sc5", area: "science", subcat: "earth_space", name: "Astronomy & Space Science", icon: "🌙", pts: 15, interests: ["space", "science", "philosophy"], desc: "The universe, our place in it, and the science behind it all.", how: ["Observe and document 10 celestial events", "Study the lifecycle of stars", "Research current space exploration missions"] },
  { id: "sc6", area: "science", subcat: "sci_method", name: "Scientific Method & Experimentation", icon: "🔬", pts: 15, interests: ["science", "philosophy", "math"], desc: "How to actually do science — hypothesize, test, observe, and question.", how: ["Design and conduct 3 original experiments", "Write results in proper format", "Peer-review someone else's experiment"] },
  { id: "sc7", area: "science", subcat: "social_sci", name: "Psychology & Human Behavior", icon: "🧬", pts: 15, interests: ["people", "philosophy", "science"], desc: "Why people think, feel, and act the way they do — including you.", how: ["Study 5 major psychological concepts", "Read one psychology book", "Apply concepts to understand a real situation"] },
  { id: "h1", area: "history", subcat: "world_hist", name: "World History & Civilizations", icon: "🏛️", pts: 20, interests: ["history", "people", "philosophy"], desc: "The sweep of human experience — empires, revolutions, and reinvention.", how: ["Study 4 major historical periods in depth", "Make connections between history and today", "Create a timeline or visual history"] },
  { id: "h2", area: "history", subcat: "american_hist", name: "American History", icon: "🦅", pts: 15, interests: ["history", "people", "philosophy"], desc: "The full, complex story of this country — triumphs, contradictions, unfinished business.", how: ["Study 5 pivotal moments", "Read primary sources from multiple perspectives", "Research how events affect your community today"] },
  { id: "h3", area: "history", subcat: "economics", name: "Economics & How Systems Work", icon: "🏗️", pts: 20, interests: ["business", "history", "philosophy"], desc: "How goods, money, power, and incentives shape the world.", how: ["Study basic economic principles", "Follow and analyze a real economic story", "Create a mini-economy or business model"] },
  { id: "h4", area: "history", subcat: "civics", name: "Civics & Power Structures", icon: "⚖️", pts: 15, interests: ["history", "people", "philosophy"], desc: "How governments work and how to participate meaningfully.", how: ["Study how local, state, and federal government functions", "Attend a city council meeting", "Take a position on a civic issue and research all sides"] },
  { id: "h5", area: "history", subcat: "anthropology", name: "Cultural Anthropology", icon: "🌍", pts: 15, interests: ["people", "history", "art"], desc: "How different cultures build meaning, community, and ways of life.", how: ["Study 3 cultures different from your own", "Interview someone from a different background", "Create a comparative cultural analysis"] },
  { id: "h6", area: "history", subcat: "social_movements", name: "Social Movements & Change", icon: "✊", pts: 15, interests: ["history", "people", "philosophy"], desc: "How ordinary people change the world — the mechanics of collective action.", how: ["Study 3 social movements in depth", "Understand tactics, leadership, and outcomes", "Connect to a current issue you care about"] },
  { id: "a1", area: "arts", subcat: "visual_art", name: "Visual Art & Design Fundamentals", icon: "🎨", pts: 15, interests: ["art", "making", "fashion"], desc: "The principles that make things beautiful and communicate without words.", how: ["Study color theory, composition, and typography", "Complete 20 hours of deliberate practice", "Create a series of 5 cohesive pieces"] },
  { id: "a2", area: "arts", subcat: "music", name: "Music Theory & Practice", icon: "🎵", pts: 20, interests: ["music", "math"], desc: "The language of music — from reading notation to composing your own.", how: ["Learn an instrument to intermediate level", "Study music theory fundamentals", "Compose or arrange an original piece"] },
  { id: "a3", area: "arts", subcat: "film_photo", name: "Film, Photography & Visual Storytelling", icon: "🎬", pts: 20, interests: ["film", "art", "writing"], desc: "Use the camera as a storytelling tool.", how: ["Shoot and edit 3 short films or photo series", "Study a director or photographer you admire", "Create one polished portfolio piece"] },
  { id: "a4", area: "arts", subcat: "creative_writing", name: "Creative Writing as Craft", icon: "✍️", pts: 15, interests: ["writing", "philosophy", "art"], desc: "Go deep on the craft — character, structure, voice, revision.", how: ["Complete a 5,000+ word project", "Study craft through a writing book", "Workshop your writing with real readers"] },
  { id: "a5", area: "arts", subcat: "theater", name: "Theater & Performance", icon: "🎭", pts: 15, interests: ["people", "writing", "art"], desc: "Embody a character, tell stories through the body, develop presence.", how: ["Perform in or produce a short play", "Study acting techniques or improv", "Direct or stage manage a production"] },
  { id: "a6", area: "arts", subcat: "design", name: "Design Thinking & UX", icon: "✏️", pts: 15, interests: ["art", "tech", "business", "people"], desc: "Human-centered design — solve problems beautifully.", how: ["Complete a full design thinking project", "Build and test a prototype with real users", "Create a case study for your portfolio"] },
  { id: "t1", area: "tech", subcat: "coding", name: "Programming Fundamentals", icon: "💻", pts: 20, interests: ["tech", "gaming", "math"], desc: "Learn to think like a computer and build things that work.", how: ["Build 3 working programs solving real problems", "Learn one language thoroughly", "Contribute to or document an open-source project"] },
  { id: "t2", area: "tech", subcat: "web", name: "Web Development", icon: "🌐", pts: 20, interests: ["tech", "art", "business"], desc: "HTML, CSS, JavaScript — the building blocks of the web.", how: ["Build 3 complete websites", "Learn a framework or library", "Deploy a live project"] },
  { id: "t3", area: "tech", subcat: "making", name: "Fabrication & Making", icon: "🔧", pts: 20, interests: ["making", "art", "tech"], desc: "Turn ideas into physical things — 3D printing, electronics, woodworking.", how: ["Complete 3 hands-on build projects", "Document your process thoroughly", "Teach someone a technique you've mastered"] },
  { id: "t4", area: "tech", subcat: "game_design", name: "Game Design", icon: "🎮", pts: 20, interests: ["gaming", "tech", "art", "writing"], desc: "Design experiences people love — systems, rules, narrative, and play.", how: ["Design and playtest 2 original games", "Study the design of 3 games you love", "Build a digital or physical prototype"] },
  { id: "t5", area: "tech", subcat: "ai_ml", name: "AI & Machine Learning Concepts", icon: "🤖", pts: 15, interests: ["tech", "math", "philosophy"], desc: "Understand how AI works and how to use it thoughtfully.", how: ["Study how ML models are trained", "Build a simple ML project", "Research the ethics and implications of AI"] },
  { id: "t6", area: "tech", subcat: "electronics", name: "Electronics & Robotics", icon: "⚡", pts: 20, interests: ["making", "tech", "science"], desc: "Make things move, sense, and respond — circuits to microcontrollers.", how: ["Build 3 electronics projects", "Learn to read circuit diagrams", "Create something using sensors or automation"] },
  { id: "hw1", area: "health", subcat: "fitness", name: "Physical Fitness & Training", icon: "💪", pts: 15, interests: ["movement", "science", "health"], desc: "Build a training practice you love — strength, endurance, recovery.", how: ["Maintain a consistent training program for 12 weeks", "Track and analyze progress", "Research the science behind your training"] },
  { id: "hw2", area: "health", subcat: "nutrition", name: "Nutrition & Food Science", icon: "🥗", pts: 15, interests: ["food", "science", "health"], desc: "Understand how what you eat affects everything — and learn to cook real food.", how: ["Study macronutrients and food systems", "Cook 20 different meals from scratch", "Plan a week of nutritionally balanced meals"] },
  { id: "hw3", area: "health", subcat: "mental_health", name: "Mental Health & Self-Knowledge", icon: "🧘", pts: 15, interests: ["philosophy", "health", "people"], desc: "Understand your own mind — emotions, patterns, stress, and self-care.", how: ["Study foundational concepts in mental health", "Keep a reflective journal for 60 days", "Develop personal wellness practices that work for you"] },
  { id: "ct1", area: "thinking", subcat: "philosophy", name: "Philosophy & Ethics", icon: "🏺", pts: 20, interests: ["philosophy", "history", "people"], desc: "The biggest questions: What is good? What is true? How to live well?", how: ["Study 5 major philosophical traditions", "Write a personal ethics statement", "Engage in a structured debate"] },
  { id: "ct2", area: "thinking", subcat: "media_lit", name: "Media Literacy & Propaganda Analysis", icon: "📡", pts: 15, interests: ["social", "history", "philosophy"], desc: "See through spin, identify bias, and think for yourself.", how: ["Analyze the same story from 5 sources", "Study 3 historical examples of propaganda", "Create a guide to spotting media manipulation"] },
  { id: "ct3", area: "thinking", subcat: "systems", name: "Systems Thinking", icon: "🕸️", pts: 15, interests: ["science", "business", "philosophy", "math"], desc: "See the whole, not just the parts — feedback loops and unintended consequences.", how: ["Map the system behind something you care about", "Study a major systems failure", "Apply systems thinking to a real problem"] },
  { id: "ct4", area: "thinking", subcat: "meta_learning", name: "Self-Directed Learning Mastery", icon: "🧭", pts: 15, interests: [], desc: "The meta-skill: how to learn anything and pursue mastery independently.", how: ["Document your learning process over 6 months", "Develop a personal learning system", "Teach yourself a complex skill from zero"] },
  { id: "ls1", area: "life", subcat: "business", name: "Entrepreneurship & Business Building", icon: "🚀", pts: 25, interests: ["business", "tech", "art", "social"], desc: "Build something real — a product, service, or idea that creates value.", how: ["Research a market and validate an idea", "Build an MVP or prototype", "Get 10 people to pay or seriously engage"] },
  { id: "ls2", area: "life", subcat: "finance", name: "Personal Finance & Investing", icon: "📈", pts: 20, interests: ["business", "math"], desc: "Make money work for you — savings, investing, and long-term thinking.", how: ["Learn the basics of investing", "Open a savings or investing account", "Build a 5-year financial plan"] },
  { id: "ls3", area: "life", subcat: "organization", name: "Project Management", icon: "📋", pts: 15, interests: ["business", "making", "tech"], desc: "Get things done — plan, execute, adapt, and ship.", how: ["Manage a complex personal project from start to finish", "Use a project management system for 60 days", "Lead a group project or collaboration"] },
  { id: "ls4", area: "life", subcat: "homemaking", name: "Cooking & Culinary Arts", icon: "🍳", pts: 15, interests: ["food", "science", "art"], desc: "Feed yourself and others well — techniques, flavor, creativity, hospitality.", how: ["Cook 30 different dishes", "Host a dinner for people you care about", "Learn the science behind 5 cooking techniques"] },
  { id: "ls5", area: "life", subcat: "community", name: "Civic Engagement & Volunteering", icon: "🤲", pts: 20, interests: ["people", "history", "philosophy"], desc: "Show up in your community — contribute time and skills.", how: ["Complete 40 hours of meaningful volunteer work", "Know an organization you serve deeply", "Reflect on what you learned about community"] },
  { id: "ls6", area: "life", subcat: "homemaking", name: "Homesteading & Self-Sufficiency", icon: "🌱", pts: 20, interests: ["nature", "food", "making"], desc: "Grow food, fix things, reduce dependence — practical life skills.", how: ["Grow something edible successfully", "Fix or build something in your home", "Learn one preservation skill"] },
  { id: "ls7", area: "life", subcat: "exploration", name: "Photography & Visual Documentation", icon: "📷", pts: 15, interests: ["film", "art", "nature"], desc: "Document your life and work with intention.", how: ["Complete a 30-day photo project with a theme", "Study the work of 3 photographers", "Create a photo book"] },
  { id: "ls8", area: "life", subcat: "exploration", name: "Independent Travel & Navigation", icon: "🗺️", pts: 15, interests: ["nature", "history", "people"], desc: "Navigate the physical world — map reading, trip planning, exploration.", how: ["Plan and execute a solo trip", "Learn to navigate by map and compass", "Travel somewhere unfamiliar and document what you learn"] },
];


const PROJECTS = [
  { id: "p1", title: "Start Your Own Micro-Business", color: "amber", interests: ["business", "tech", "social", "art"], skills: ["ls1", "m1", "s8"], pts: 40, duration: "2-4 months", desc: "Identify a real problem, validate a product or service, and get your first customer.", output: "Business plan, revenue records, reflection write-up", steps: ["Identify 3 possible business ideas", "Interview 10 potential customers", "Build a minimum viable product", "Get your first 5 paying customers", "Track revenue and costs for 30 days", "Write a retrospective"] },
  { id: "p2", title: "Build & Publish a Website", color: "sky", interests: ["tech", "art", "business", "social"], skills: ["t2", "a6", "s8"], pts: 30, duration: "4-8 weeks", desc: "Design and build a complete website about something you care about. Make it live.", output: "Live website URL, case study", steps: ["Define your audience and purpose", "Write all the content first", "Design the visual style and layout", "Build it with HTML/CSS/JS", "Deploy it live", "Get feedback and iterate"] },
  { id: "p3", title: "Document a Place That Matters to You", color: "sage", interests: ["film", "nature", "history", "people"], skills: ["a3", "s1", "ls7"], pts: 25, duration: "3-6 weeks", desc: "Tell the story of a place through photos, video, and writing.", output: "Photo essay or short documentary film", steps: ["Choose your place and research it", "Plan your visual and narrative approach", "Spend time in the place gathering material", "Write the story and edit visuals", "Combine into a cohesive piece", "Share with your community"] },
  { id: "p4", title: "Write & Publish a Zine", color: "lavender", interests: ["writing", "art", "people", "history"], skills: ["s1", "a1", "a4"], pts: 20, duration: "3-5 weeks", desc: "Create a physical or digital publication on a topic you care about.", output: "Printed or PDF zine, distribution plan", steps: ["Choose a topic and angle", "Research thoroughly", "Write 1,500-3,000 words", "Design the layout", "Print or publish digitally", "Distribute to 20+ people"] },
  { id: "p5", title: "Build Something Physical From Scratch", color: "clay", interests: ["making", "art", "tech", "nature"], skills: ["t3", "m3", "sc4"], pts: 30, duration: "4-8 weeks", desc: "Design and build a real object — furniture, tool, instrument, clothing. Use your hands.", output: "Physical object, build documentation, reflection", steps: ["Identify what you want to build and why", "Research materials and techniques", "Create a design or blueprint", "Source materials", "Build it", "Document the process with photos/video"] },
  { id: "p6", title: "Make an Original Album or EP", color: "sky", interests: ["music", "art", "tech"], skills: ["a2", "t1", "a1"], pts: 35, duration: "2-4 months", desc: "Write, record, and release music. Even 3 songs counts — make it intentional.", output: "Released album/EP, artist statement", steps: ["Write 3-6 original songs", "Study basic recording and production", "Record tracks", "Mix and master", "Create artwork", "Release on at least one platform"] },
  { id: "p7", title: "Investigate & Report a Local Story", color: "amber", interests: ["writing", "history", "people", "philosophy"], skills: ["s4", "s2", "ct2"], pts: 25, duration: "3-5 weeks", desc: "Dig into something real in your community. Interview people, verify facts, write the story.", output: "Journalistic article or podcast episode", steps: ["Identify a story worth telling", "Interview at least 4 people", "Research background and verify facts", "Write a draft", "Revise based on feedback", "Publish or pitch the piece"] },
  { id: "p8", title: "Run a 30-Day Fitness Experiment", color: "sage", interests: ["movement", "science", "health"], skills: ["hw1", "sc6", "hw2"], pts: 20, duration: "5-6 weeks", desc: "Design a training experiment. Track data, adjust, and write up your findings.", output: "Data log, written analysis, personal reflection", steps: ["Define your hypothesis and metrics", "Design a protocol", "Track everything for 30 days", "Analyze your data", "Write a science-style report", "Share what you learned"] },
  { id: "p9", title: "Design a Game", color: "lavender", interests: ["gaming", "art", "writing", "math"], skills: ["t4", "ct3", "a6"], pts: 30, duration: "4-8 weeks", desc: "Design a playable game — tabletop, digital, or physical. Focus on elegant mechanics.", output: "Playable prototype, rules document, playtest feedback", steps: ["Define the experience you want players to have", "Design core mechanics", "Create a rough prototype", "Playtest and redesign", "Polish rules and components", "Run a final playtest"] },
  { id: "p10", title: "Grow Something & Track the Science", color: "sage", interests: ["nature", "science", "food"], skills: ["sc1", "sc6", "hw2"], pts: 20, duration: "2-4 months", desc: "Grow food or plants while experimenting with variables. Real science, real food.", output: "Data journal, harvest record, written analysis", steps: ["Choose what to grow and design your experiment", "Prepare beds or containers", "Plant and track variables", "Record data at regular intervals", "Harvest and evaluate results", "Write a report with photos"] },
  { id: "p11", title: "Build a Social Media Content Series", color: "lavender", interests: ["social", "business", "art", "film"], skills: ["s8", "a3", "ls1"], pts: 25, duration: "2-3 months", desc: "Create and grow a content series about something you love. Analyze performance.", output: "10+ piece content series, analytics report, strategy document", steps: ["Choose topic and platform", "Define your audience and voice", "Create a content calendar", "Produce and publish 10+ pieces", "Track analytics", "Analyze what worked and why"] },
  { id: "p12", title: "Teach a Workshop or Class", color: "amber", interests: ["people", "art", "making", "tech"], skills: ["s5", "ct4", "a6"], pts: 25, duration: "4-6 weeks", desc: "Take something you know and teach it to others. Get real feedback.", output: "Curriculum document, workshop materials, participant feedback", steps: ["Choose a skill you've already built", "Design a 2-4 hour workshop", "Create all materials", "Teach it to at least 5 people", "Gather written feedback", "Reflect and revise"] },
  { id: "p13", title: "Research & Write a Deep Dive Essay", color: "sky", interests: ["writing", "philosophy", "history", "science"], skills: ["s2", "ct1", "ct2"], pts: 20, duration: "3-4 weeks", desc: "Choose a question you don't know the answer to. Research it deeply and write.", output: "2,000-4,000 word essay with citations", steps: ["Choose a compelling question", "Research at least 8 different sources", "Build an outline", "Write a full draft", "Revise twice", "Share and get serious feedback"] },
  { id: "p14", title: "Create a Visual Art Portfolio Series", color: "lavender", interests: ["art", "film", "fashion"], skills: ["a1", "a3", "ls7"], pts: 25, duration: "2-3 months", desc: "Create a cohesive series of 8-12 pieces around a theme. Intentionality over quantity.", output: "Portfolio series, artist statement, digital exhibition", steps: ["Define your theme and concept", "Experiment with different approaches", "Create 8-12 cohesive pieces", "Edit down to your best", "Write an artist statement", "Share in an online gallery"] },
  { id: "p15", title: "Produce a Short Film", color: "lavender", interests: ["film", "writing", "art", "music"], skills: ["a3", "s1", "a2"], pts: 35, duration: "6-10 weeks", desc: "Write, direct, shoot, and edit a short film. 5-15 minutes. Show it to real people.", output: "Completed short film, director's statement, screening", steps: ["Write a complete script", "Create a shot list and production plan", "Gather cast and crew", "Shoot", "Edit: cut, audio, color", "Show to an audience"] },
  { id: "p16", title: "Build a Personal Finance System", color: "amber", interests: ["business", "math"], skills: ["ls2", "m1", "ct3"], pts: 20, duration: "3-4 weeks", desc: "Build the financial life you want. Track money, understand investing, make a real plan.", output: "Budget spreadsheet, investment plan, 5-year roadmap", steps: ["Track all money in and out for 30 days", "Build a realistic monthly budget", "Research and open an investment account", "Create a 5-year savings goal", "Research tax basics", "Write a financial philosophy"] },
  { id: "p17", title: "Host a Community Event", color: "clay", interests: ["people", "business", "art", "music", "food"], skills: ["ls3", "s5", "ls5"], pts: 25, duration: "4-6 weeks", desc: "Organize and run a real event — a show, gathering, workshop, or market.", output: "Event recap, photos, lessons learned", steps: ["Define your vision and audience", "Choose a venue and date", "Create a promotion plan", "Organize logistics", "Run the event", "Write a retrospective"] },
  { id: "p18", title: "Restore, Repair, or Upcycle Something", color: "clay", interests: ["making", "nature", "art", "fashion"], skills: ["t3", "sc3", "a1"], pts: 20, duration: "2-5 weeks", desc: "Take something broken or discarded and make it better. Resist the throwaway culture.", output: "Restored item, process documentation, reflection", steps: ["Find something broken worth fixing", "Research what's needed", "Gather materials and tools", "Do the work", "Document before and after", "Reflect on what you learned"] },
  { id: "p19", title: "Build a Physical Field Guide", color: "sage", interests: ["nature", "writing", "art", "science"], skills: ["sc1", "s2", "a1"], pts: 20, duration: "6-8 weeks", desc: "Identify, document, and illustrate plants, animals, fungi, or birds in your local area.", output: "Illustrated field guide (print or digital)", steps: ["Choose your subject", "Go out regularly and observe", "Research scientific names and ecology", "Illustrate or photograph each entry", "Write descriptions in your own words", "Compile and share it"] },
];

const FACTIONS = [
  { id: "f1", name: "The Forge", icon: "🔨", color: "amber", colorVar: "--amber", dimVar: "--amber-dim", desc: "Makers, builders, and fabricators. You create things that exist in the physical world.", interests: ["making", "tech", "art"] },
  { id: "f2", name: "The Signal", icon: "📡", color: "sky", colorVar: "--sky", dimVar: "--sky-dim", desc: "Communicators, storytellers, and media makers. You shape how people understand the world.", interests: ["writing", "social", "film"] },
  { id: "f3", name: "The Root", icon: "🌱", color: "sage", colorVar: "--sage", dimVar: "--sage-dim", desc: "Earth workers, stewards, and naturalists. You build relationships with land and living things.", interests: ["nature", "food", "science"] },
  { id: "f4", name: "The Circuit", icon: "⚡", color: "sky", colorVar: "--sky", dimVar: "--sky-dim", desc: "Coders, engineers, and systems thinkers. You make machines do useful and interesting things.", interests: ["tech", "math", "gaming"] },
  { id: "f5", name: "The Commons", icon: "🤝", color: "clay", colorVar: "--clay", dimVar: "--clay-dim", desc: "Community builders, advocates, and organizers. You make spaces where people belong.", interests: ["people", "social", "philosophy"] },
  { id: "f6", name: "The Studio", icon: "🎨", color: "lavender", colorVar: "--lavender", dimVar: "--lavender-dim", desc: "Artists, designers, and performers. You make people feel things.", interests: ["art", "music", "film"] },
];

const SANDBOX_GIGS_DEFAULT = [
  // The Forge
  { id: "g1", faction: "f1", title: "Design and Build a Shelf From Scrap Materials", pts: 15, difficulty: "Beginner", time: "4-6 hrs", deliverable: "Photos of finished shelf + materials list", area: "tech" },
  { id: "g2", faction: "f1", title: "Repair Something That's Broken in Your Home", pts: 10, difficulty: "Beginner", time: "2-4 hrs", deliverable: "Before/after photos + one-page reflection", area: "life" },
  { id: "g3", faction: "f1", title: "Create a Tool or Jig That Solves a Specific Problem", pts: 20, difficulty: "Intermediate", time: "6-8 hrs", deliverable: "Documentation + demo video", area: "tech" },
  { id: "g4", faction: "f1", title: "Build a Birdhouse or Pollinator Box From Scratch", pts: 15, difficulty: "Beginner", time: "4-6 hrs", deliverable: "Finished product + build journal", area: "science" },
  { id: "g5", faction: "f1", title: "Design a Piece of Furniture and Build a Scale Model", pts: 25, difficulty: "Advanced", time: "8-12 hrs", deliverable: "Design drawings + scale model + reflection", area: "arts" },
  // The Signal
  { id: "g6", faction: "f2", title: "Interview Someone Doing Work You Admire", pts: 15, difficulty: "Beginner", time: "3-5 hrs", deliverable: "Interview transcript or recording + 300-word summary", area: "comm" },
  { id: "g7", faction: "f2", title: "Write and Publish a 500-Word Essay on Something You Disagree With", pts: 10, difficulty: "Beginner", time: "2-3 hrs", deliverable: "Published essay (blog, newsletter, or social post)", area: "comm" },
  { id: "g8", faction: "f2", title: "Create a 3-Episode Podcast Mini-Series", pts: 30, difficulty: "Advanced", time: "12-15 hrs", deliverable: "3 published episodes with show notes", area: "comm" },
  { id: "g9", faction: "f2", title: "Produce a 2-3 Minute Explainer Video", pts: 20, difficulty: "Intermediate", time: "6-10 hrs", deliverable: "Finished video published anywhere online", area: "comm" },
  { id: "g10", faction: "f2", title: "Document Your Town: A 10-Photo Essay", pts: 15, difficulty: "Beginner", time: "4-6 hrs", deliverable: "10 edited photos + caption for each", area: "arts" },
  // The Root
  { id: "g11", faction: "f3", title: "Start and Maintain a Compost System for 30 Days", pts: 15, difficulty: "Beginner", time: "Ongoing", deliverable: "Log + before/after photos + reflection", area: "science" },
  { id: "g12", faction: "f3", title: "Identify 20 Plants, Insects, or Birds in Your Area", pts: 20, difficulty: "Beginner", time: "6-10 hrs", deliverable: "Documented field notes with photos", area: "science" },
  { id: "g13", faction: "f3", title: "Cook a Full Week of Meals Using Only Whole Ingredients", pts: 20, difficulty: "Intermediate", time: "Ongoing", deliverable: "Meal log + notes on what you learned", area: "life" },
  { id: "g14", faction: "f3", title: "Grow Something From Seed to Harvest", pts: 25, difficulty: "Intermediate", time: "Ongoing", deliverable: "Growth journal with photos + harvest record", area: "science" },
  { id: "g15", faction: "f3", title: "Research and Map Your Local Watershed", pts: 20, difficulty: "Intermediate", time: "5-8 hrs", deliverable: "Annotated map + 500-word write-up", area: "science" },
  // The Circuit
  { id: "g16", faction: "f4", title: "Build a Calculator App Without Tutorials", pts: 15, difficulty: "Beginner", time: "4-6 hrs", deliverable: "Working app + code on GitHub", area: "tech" },
  { id: "g17", faction: "f4", title: "Automate Something Annoying in Your Life", pts: 20, difficulty: "Intermediate", time: "5-8 hrs", deliverable: "Working script or automation + documentation", area: "tech" },
  { id: "g18", faction: "f4", title: "Build a Simple Game With a Physics Engine", pts: 25, difficulty: "Intermediate", time: "8-12 hrs", deliverable: "Playable game + reflection on what you learned", area: "tech" },
  { id: "g19", faction: "f4", title: "Set Up a Raspberry Pi for a Specific Purpose", pts: 20, difficulty: "Intermediate", time: "5-8 hrs", deliverable: "Working device + setup guide", area: "tech" },
  { id: "g20", faction: "f4", title: "Analyze a Dataset and Create 3 Visualizations", pts: 20, difficulty: "Beginner", time: "4-6 hrs", deliverable: "3 charts + a 300-word interpretation", area: "math" },
  // The Commons
  { id: "g21", faction: "f5", title: "Organize a Neighborhood Cleanup or Beautification Project", pts: 20, difficulty: "Intermediate", time: "8-12 hrs", deliverable: "Before/after photos + participant count + reflection", area: "life" },
  { id: "g22", faction: "f5", title: "Facilitate a Community Discussion on a Local Issue", pts: 20, difficulty: "Intermediate", time: "6-8 hrs", deliverable: "Discussion notes + summary of perspectives + reflection", area: "comm" },
  { id: "g23", faction: "f5", title: "Start or Participate in a Buy-Nothing or Mutual Aid Group", pts: 15, difficulty: "Beginner", time: "Ongoing", deliverable: "Log of exchanges + 300-word reflection", area: "life" },
  { id: "g24", faction: "f5", title: "Research and Present a Solution to a Local Problem", pts: 25, difficulty: "Advanced", time: "10-14 hrs", deliverable: "Written proposal + presentation to at least 5 people", area: "comm" },
  { id: "g25", faction: "f5", title: "Mentor or Tutor Someone Younger in a Skill You Have", pts: 20, difficulty: "Beginner", time: "5-8 hrs", deliverable: "4+ session log + reflection on teaching", area: "life" },
  // The Studio
  { id: "g26", faction: "f6", title: "Create a Series of 5 Pieces Around a Single Theme", pts: 20, difficulty: "Beginner", time: "6-10 hrs", deliverable: "5 finished pieces + artist statement (100 words)", area: "arts" },
  { id: "g27", faction: "f6", title: "Design and Print a Zine on a Topic You Care About", pts: 15, difficulty: "Beginner", time: "5-8 hrs", deliverable: "Printed or PDF zine + distribution to 10+ people", area: "arts" },
  { id: "g28", faction: "f6", title: "Compose and Record an Original Instrumental Track", pts: 20, difficulty: "Intermediate", time: "5-8 hrs", deliverable: "Finished track (any format) + production notes", area: "arts" },
  { id: "g29", faction: "f6", title: "Design a Complete Brand Identity From Scratch", pts: 25, difficulty: "Intermediate", time: "8-12 hrs", deliverable: "Logo, palette, typography, and usage guide", area: "arts" },
  { id: "g30", faction: "f6", title: "Perform Something Live (Music, Comedy, Poetry, Theater)", pts: 25, difficulty: "Intermediate", time: "10-15 hrs", deliverable: "Video of performance + reflection", area: "arts" },
];

const RIPPLE_MISSIONS_DEFAULT = [
  { id: "rm1", title: "Write 10 Letters to Elderly Residents in Care Facilities", pts: 20, cause: "Connection", icon: "✉️", color: "sky", desc: "Many elderly residents receive no mail. Write meaningful, personal letters — share your life, ask about theirs. Coordinate with a local facility.", steps: ["Contact a local care facility and ask about their letter program", "Write 10 individual, personalized letters (no form letters)", "Mail them or deliver in person if allowed", "Write a reflection on what you learned about loneliness and connection"] },
  { id: "rm2", title: "Create a Meal and Deliver It to a Family in Need", pts: 15, cause: "Food Security", icon: "🍲", color: "amber", desc: "Cook a real meal — not a snack, a full meal — and deliver it to someone who needs it. This is about dignity, not charity.", steps: ["Identify a family or individual who could use support (through a mutual aid group or personal connection)", "Plan a nutritious, complete meal", "Cook it with care and package it properly", "Deliver it personally and spend a few minutes with the person"] },
  { id: "rm3", title: "Teach a Basic Skill to 5 People Who Want to Learn It", pts: 25, cause: "Education", icon: "📚", color: "sage", desc: "Take something you actually know how to do — cook, code, grow things, fix things — and teach it intentionally to 5 people who want to learn.", steps: ["Choose a skill you genuinely have", "Find 5 people who want to learn it", "Teach it in person or over video — no prerecorded content", "Get written feedback from each person", "Reflect on what teaching taught you"] },
  { id: "rm4", title: "Restore or Create a Public Space in Your Community", pts: 30, cause: "Community", icon: "🌳", color: "sage", desc: "Find a neglected public space — a park corner, a library wall, a community board — and make it better.", steps: ["Identify a specific public space that needs attention", "Get permission from whoever manages it", "Plan what you'll do and get any supplies needed", "Do the work", "Document before and after", "Tell people about it"] },
  { id: "rm5", title: "Collect and Donate 50 Items of Clothing or Supplies", pts: 15, cause: "Material Needs", icon: "👕", color: "amber", desc: "Run a real collection drive — not just donating your own stuff, actually mobilizing other people to give.", steps: ["Identify a specific organization accepting donations", "Set a goal of 50+ items (clothes, books, hygiene items, etc.)", "Spread the word and collect from at least 10 different people", "Sort and deliver the items yourself", "Document the impact"] },
  { id: "rm6", title: "Create a Resource Guide for Something People Struggle With in Your Community", pts: 20, cause: "Information Access", icon: "📋", color: "sky", desc: "Mental health resources, food banks, housing help, job training — make the information easy to find.", steps: ["Choose a real need in your community", "Research what resources actually exist (and verify they're current)", "Create a clear, well-organized guide", "Get it reviewed by someone with lived experience", "Distribute it somewhere it will reach people who need it"] },
  { id: "rm7", title: "Spend 20 Hours Volunteering With an Organization Whose Work You Believe In", pts: 25, cause: "Service", icon: "🤲", color: "clay", desc: "Not a one-time thing. Show up enough to actually understand the work and build real relationships.", steps: ["Choose an organization whose mission you genuinely care about", "Commit to and complete 20 hours of volunteer work", "Keep a log of your hours and what you did", "Build at least one real relationship with someone there", "Write a 500-word reflection on what you learned"] },
  { id: "rm8", title: "Start a Recurring Act of Care in Your Neighborhood", pts: 20, cause: "Community", icon: "🏘️", color: "clay", desc: "Not a one-off — something you commit to doing repeatedly. Pick up trash on a specific block every week. Check in on elderly neighbors. Water a shared garden.", steps: ["Choose something small but consistent", "Commit to doing it at least 8 times over 2 months", "Document each time with a brief note", "Tell someone else about it so they might continue it", "Reflect on what it means to take ongoing responsibility for something"] },
];

const TEENS_GUIDE_DEFAULT = [
  { id: "tg1", title: "How to Disagree Without Destroying a Relationship", category: "People", icon: "🤝", readTime: "8 min", content: "Disagreement is a skill. Most people treat it like a battle to win or lose. The ones who are genuinely good at relationships have figured out that the goal is understanding, not victory — and that you can hold your position firmly while staying genuinely curious about how someone else sees it differently." },
  { id: "tg2", title: "What to Do When You Don't Know What You Want to Do", category: "Direction", icon: "🧭", readTime: "10 min", content: "The pressure to 'figure out your life' is real, but it's also a kind of trick. The people who seem most certain often just stopped asking the real questions. Not knowing is a completely honest place to be — and it's actually better than being confidently wrong about what you want." },
  { id: "tg3", title: "Money: The Basics Nobody Teaches You", category: "Life Skills", icon: "💰", readTime: "12 min", content: "The most important thing about money is that it buys time and options. The second most important thing is that compound interest works both for you and against you — which means starting early matters more than almost anything else. Here's what you actually need to know." },
  { id: "tg4", title: "How to Actually Get Better at Things", category: "Learning", icon: "🎯", readTime: "9 min", content: "Most people plateau because they keep doing what they're already comfortable doing. Deliberate practice means spending time in the discomfort zone — the edge of what you can do — with focused attention on what you're getting wrong. It's less fun. It works much better." },
  { id: "tg5", title: "When Mental Health Gets Heavy: A Practical Guide", category: "Wellbeing", icon: "🧘", readTime: "11 min", content: "Sometimes things get heavy in ways that are hard to explain. Understanding what's actually happening in your brain and body during anxiety, depression, or overwhelm can make those states feel less like permanent truths and more like temporary conditions that can shift." },
  { id: "tg6", title: "The Art of Asking Good Questions", category: "Thinking", icon: "❓", readTime: "7 min", content: "Good questions are a superpower. They're the tool behind most important discoveries, most good relationships, and most of the best work in the world. Most people never learn to ask them because we're trained from childhood to have the right answer, not to probe into why the question even makes sense." },
  { id: "tg7", title: "How to Handle Being Wrong Gracefully", category: "Character", icon: "🪞", readTime: "6 min", content: "Being wrong is not a character flaw. It's evidence that you formed a belief and then updated it when you got new information — which is exactly what intelligent people do. The embarrassment around being wrong is a social hangover, not a moral failing." },
  { id: "tg8", title: "Building Relationships With Adults Who Aren't Your Parents", category: "People", icon: "🌐", readTime: "8 min", content: "Mentors, advisors, teachers, collaborators — your network of adults matters enormously for where your life goes. Most teens don't have it because no one taught them how to build it. It starts with genuine curiosity about other people's work and courage to simply ask." },
];

const LIGHT_ROOM_DEFAULT = [
  { id: "lr1", title: "The Science of Flow States", type: "Read", icon: "🧠", duration: "10 min", topic: "Peak Performance", content: "Psychologist Mihaly Csikszentmihalyi spent decades studying what happens when humans are completely absorbed in a task they care about. The conditions that produce flow — challenging but not impossible, clear goals, immediate feedback — are reproducible. Here's what the research actually says." },
  { id: "lr2", title: "A Brief History of How Humans Have Thought About Time", type: "Read", icon: "⏳", duration: "12 min", topic: "Philosophy", content: "Linear time is a recent invention. Different cultures and different eras have understood time cyclically, seasonally, cosmically, or personally. Understanding how the modern concept of time was constructed helps you see it more clearly — and question whether it serves you." },
  { id: "lr3", title: "What Makes a Mentor Relationship Actually Work", type: "Read", icon: "🌱", duration: "8 min", topic: "Relationships", content: "The best mentorship relationships don't look like formal arrangements. They look like two people who are genuinely interested in each other's minds, where one happens to have walked further down a path. Here's what the research says about what makes them work — and how to build one." },
  { id: "lr4", title: "The Case for Learning Things That Don't Scale", type: "Read", icon: "🔧", duration: "9 min", topic: "Learning", content: "In a world obsessed with efficiency, some of the most valuable skills are things that must be learned slowly, impractically, and by doing them yourself. Baking bread. Fixing an engine. Playing an instrument. Here's what those things teach that nothing else can." },
  { id: "lr5", title: "How to Sit With Uncertainty", type: "Reflection", icon: "🌊", duration: "15 min", topic: "Wellbeing", content: "Most of us are terrible at not knowing. We reach for certainty even when it's false. But the ability to hold open questions with curiosity rather than anxiety is one of the most important things a person can develop. This is a guided exercise in practicing exactly that." },
  { id: "lr6", title: "The Interesting History of Self-Directed Learning", type: "Read", icon: "📖", duration: "11 min", topic: "Education", content: "Schools as we know them are young. For most of human history, learning was apprenticeship, exploration, and mentorship. The people who changed the world most often learned outside of institutions. Here's the history — and what it suggests about how you might think about your own education." },
  { id: "lr7", title: "On Making Things That Might Fail", type: "Reflection", icon: "🎨", duration: "7 min", topic: "Creativity", content: "Everything worth making involves the risk of making something bad. The paralysis that keeps most people from creating is fear of the outcome rather than love of the work. This is about how to shift your relationship with failure — especially in creative work." },
  { id: "lr8", title: "What the Research Actually Says About Habits", type: "Read", icon: "🔄", duration: "10 min", topic: "Behavior", content: "James Clear made habit formation mainstream, but the science is more nuanced and interesting than a loop. Identity, context, implementation intentions, and the neuroscience of automaticity all play a role. Here's what actually works — and what's overblown." },
];

// ─── DAILY DROP UTILITIES ────────────────────────────────────────────────────
function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function formatDisplayDate(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${months[parseInt(m,10)-1]} ${parseInt(d,10)}, ${y}`;
}
function toYouTubeEmbed(url) {
  if (!url) return "";
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
  if (m) return `https://www.youtube.com/embed/${m[1]}`;
  return url;
}

const DAILY_DROPS_DEFAULT = [
  {
    id: "drop_2026-03-22",
    date: "2026-03-22",
    video: { url: "https://www.youtube.com/watch?v=bM7SZ5SBzyY", title: "What Makes a Life Well-Lived?", description: "Watch the first 8 minutes. Come back ready to talk about what surprised you." },
    journal: { title: "Morning Check-In", prompt: "What are you most looking forward to this week? What's one thing you've been quietly dreading — and why? Take 5 minutes to write honestly." },
    careerSpotlights: [
      { id: "cs1", targetStudent: "all", name: "Ira Glass", role: "Radio Producer & Storyteller", bio: "Creator of This American Life, one of the most downloaded podcasts in the world. Started in public radio at 19 with no connections.", insight: "\"The most important thing you can do is a lot of work. Put yourself on a deadline so that every week you finish one story. It is only by going through a volume of work that you will close the gap.\"" }
    ],
    kindnessChallenge: { title: "Write a Specific Thank-You", description: "Think of someone who's helped you in the last month — not a big life-changing thing, just something real. Text, write, or say to them specifically what they did and why it mattered to you. Be concrete, not generic." }
  }
];

const CHECK_INS_DEFAULT = [];

const DEFAULT_STUDENT_ACCOUNTS = [
  { id: "sa1", name: "Student One", username: "student1", password: "forge1", profileAnswers: {}, points: 0, completed: [] },
  { id: "sa2", name: "Student Two", username: "student2", password: "forge2", profileAnswers: {}, points: 0, completed: [] },
];

const PROFILE_QUESTIONS_DEFAULT = [
  { id: "pq_age",    question: "How old are you?",          type: "text",          placeholder: "e.g. 15",   required: false, routing: [] },
  { id: "pq_goals",  question: "In your own words — what do you want this to be for?", type: "textarea", placeholder: "What do you want your life to look like? Doesn't have to be profound — just honest.", required: false, routing: [] },
  { id: "pq_interests", question: "What gets you going? Pick everything that genuinely interests you.", type: "interests", required: false, routing: [] },
  { id: "pq_strengths", question: "How do you actually work? Pick every statement that feels true.", type: "strengths", required: false, routing: [] },
  { id: "pq_style",  question: "What kind of learner do you tend to be?", type: "single_choice",
    options: ["I dive deep into one thing at a time", "I explore many things at once", "I'm somewhere in between", "I honestly don't know yet"],
    required: false, routing: [] },
];

const defaultRoadmap = {
  name: "My 4-Year Learning Journey",
  years: [
    { label: "Year 1", subtitle: "Exploration & Foundation", theme: "Try everything. Find out what you love. Build base skills.", quarters: [
      { label: "Q1 (Sept–Nov)", focus: "Interest exploration & self-assessment", items: ["Complete interest inventory", "Start 2-3 skill areas", "Begin learning journal"] },
      { label: "Q2 (Dec–Feb)", focus: "First projects & skill building", items: ["Complete first project", "Identify strongest interests", "Build daily learning habit"] },
      { label: "Q3 (Mar–May)", focus: "Going deeper in 2-3 areas", items: ["Complete 2 skill masteries", "Start portfolio documentation", "Begin a longer project"] },
      { label: "Q4 (June–Aug)", focus: "Year reflection & planning", items: ["Reflect on what worked", "Plan Year 2 focus areas", "Complete summer project"] },
    ]},
    { label: "Year 2", subtitle: "Depth & Direction", theme: "Go deep on what matters. Start building real things.", quarters: [
      { label: "Q1 (Sept–Nov)", focus: "Deep dive into 2-3 passions", items: ["Start a major skill area", "Begin a portfolio project", "Find mentors or communities"] },
      { label: "Q2 (Dec–Feb)", focus: "Building & creating", items: ["Complete a major project", "Present work to real audience", "Explore monetization ideas"] },
      { label: "Q3 (Mar–May)", focus: "Collaboration & community", items: ["Work with others on a project", "Teach something you know", "Start a long-term project"] },
      { label: "Q4 (June–Aug)", focus: "Mid-journey check-in", items: ["Evaluate transcript progress", "Update 4-year plan", "Document all portfolio pieces"] },
    ]},
    { label: "Year 3", subtitle: "Mastery & Real-World Application", theme: "Get really good. Test your skills in the real world.", quarters: [
      { label: "Q1 (Sept–Nov)", focus: "Apprenticeship or real work experience", items: ["Shadow or work with a professional", "Apply skills to a real problem", "Build something used by others"] },
      { label: "Q2 (Dec–Feb)", focus: "Advanced projects", items: ["Complete a capstone-level project", "Publish or present significant work", "Build professional relationships"] },
      { label: "Q3 (Mar–May)", focus: "Testing & entrepreneurship", items: ["Launch something in the world", "Get real feedback and iterate", "Document case studies"] },
      { label: "Q4 (June–Aug)", focus: "Preparing for independence", items: ["Review financial literacy skills", "Plan post-high school path", "Build professional portfolio"] },
    ]},
    { label: "Year 4", subtitle: "Launch & Legacy", theme: "Finish strong. Know who you are. Launch into what's next.", quarters: [
      { label: "Q1 (Sept–Nov)", focus: "Capstone project begins", items: ["Define your senior capstone", "Identify gaps to fill", "Build connections for your future"] },
      { label: "Q2 (Dec–Feb)", focus: "Final skill certifications", items: ["Complete all transcript requirements", "Finish major portfolio pieces", "Get recommendation letters"] },
      { label: "Q3 (Mar–May)", focus: "Capstone presentation", items: ["Present capstone to a real audience", "Document your learning journey", "Celebrate and reflect"] },
      { label: "Q4 (June–Aug)", focus: "Transition & launch", items: ["Create your transition plan", "Launch what's next", "Maintain your portfolio and connections"] },
    ]},
  ],
};

// TOTAL_POINTS is now computed dynamically from content.areas wherever needed

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────

function Modal({ open, onClose, title, children, footer, size = "" }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${size}`}>
        <div className="modal-header">
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "var(--cream)" }}>{title}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose} style={{ fontSize: 18, lineHeight: 1 }}>×</button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

function CheckBox({ checked, onChange }) {
  return (
    <div className={`check-box ${checked ? "checked" : ""}`} onClick={onChange}>
      {checked && <span style={{ color: "#0c0c16", fontSize: 11, fontWeight: 700 }}>✓</span>}
    </div>
  );
}

function EmptyState({ icon, title, sub, action }) {
  return (
    <div className="empty-state">
      <div className="icon">{icon}</div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, color: "var(--cream)" }}>{title}</div>
      {sub && <div style={{ fontSize: 13, color: "var(--muted)", maxWidth: 320, lineHeight: 1.6 }}>{sub}</div>}
      {action}
    </div>
  );
}

// ─── BOARDS DATA ──────────────────────────────────────────────────────────────

const DEFAULT_BOARDS = [
  { id: "b1", name: "Save for Later", locked: true, color: "--amber", icon: "🔖", items: [] },
  { id: "b2", name: "Things I Want to Try", locked: true, color: "--sky", icon: "🌟", items: [] },
  { id: "b3", name: "Careers I'm Interested In", locked: true, color: "--lavender", icon: "💼", items: [] },
  { id: "b4", name: "My Board", locked: false, color: "--sage", icon: "📌", items: [] },
  { id: "b5", name: "My Board 2", locked: false, color: "--clay", icon: "🗂", items: [] },
];

// ─── SAVE BUTTON ──────────────────────────────────────────────────────────────

function SaveButton({ item, boards, onSaveToBoard, style }) {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(null);
  const ref = useRef(null);

  const snapshot = {
    id: item.id,
    type: item.type || "item",
    title: item.name || item.title || "Untitled",
    icon: item.icon || "📌",
    desc: item.desc || item.content || "",
    pts: item.pts || 0,
    url: item.url || null,
    savedAt: Date.now(),
  };

  const isAlreadySaved = boards.some(b => b.items.some(i => i.id === item.id));

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleSave = (boardId) => {
    onSaveToBoard(boardId, snapshot);
    setSaved(boardId);
    setTimeout(() => { setSaved(null); setOpen(false); }, 900);
  };

  return (
    <div style={Object.assign({ position: "relative", display: "inline-block" }, style || {})} ref={ref}>
      <button className="btn btn-ghost btn-xs"
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
        title="Save to board"
        style={{ color: isAlreadySaved ? "var(--amber)" : "var(--muted)", borderColor: isAlreadySaved ? "rgba(0,212,255,0.45)" : "var(--border)" }}>
        {isAlreadySaved ? "🔖 Saved" : "🔖 Save"}
      </button>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 300,
          background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)",
          padding: 10, width: 220, boxShadow: "0 16px 48px rgba(0,0,0,0.5)" }}>
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: "var(--muted)", marginBottom: 8, padding: "0 4px" }}>Save to board</div>
          {boards.map(board => {
            const isSavedHere = board.items.some(i => i.id === item.id);
            const justSaved = saved === board.id;
            return (
              <div key={board.id} onClick={() => !isSavedHere && handleSave(board.id)}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px",
                  borderRadius: "var(--r)", cursor: isSavedHere ? "default" : "pointer",
                  background: justSaved ? "var(--sage-dim)" : isSavedHere ? "var(--bg3)" : "transparent", transition: "background 0.12s" }}
                onMouseEnter={e => { if (!isSavedHere) e.currentTarget.style.background = "var(--bg3)"; }}
                onMouseLeave={e => { if (!isSavedHere && !justSaved) e.currentTarget.style.background = "transparent"; }}>
                <span style={{ fontSize: 15 }}>{board.icon}</span>
                <span style={{ flex: 1, fontSize: 12, fontWeight: 500, color: isSavedHere ? "var(--muted)" : "var(--cream)" }}>{board.name}</span>
                {isSavedHere && <span style={{ fontSize: 10, color: "var(--sage)" }}>✓ Saved</span>}
                {justSaved && <span style={{ fontSize: 12, color: "var(--sage)" }}>✓</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── PIN BOARDS ────────────────────────────────────────────────────────────────

function PinBoards({ boards, setBoards, content, onNavigate }) {
  const [activeBoard, setActiveBoard] = useState(0);
  const [editingName, setEditingName] = useState(null);
  const [nameInput, setNameInput] = useState("");
  const [editingIcon, setEditingIcon] = useState(null);
  const [detailItem, setDetailItem] = useState(null); // item snapshot being viewed

  const board = boards[activeBoard] || boards[0];
  const color = board ? `var(${board.color || "--amber"})` : "var(--amber)";

  const removeItem = (boardId, itemId) => {
    setBoards(prev => prev.map(b => b.id === boardId ? { ...b, items: b.items.filter(i => i.id !== itemId) } : b));
  };

  const saveEditName = (boardId) => {
    if (nameInput.trim()) setBoards(prev => prev.map(b => b.id === boardId ? { ...b, name: nameInput.trim() } : b));
    setEditingName(null);
  };

  // Look up the full item from content by id+type
  const getFullItem = (snapshot) => {
    if (!content || !snapshot) return null;
    const { id, type } = snapshot;
    if (type === "skill") return content.skills?.find(s => s.id === id) || null;
    if (type === "project") return content.projects?.find(p => p.id === id) || null;
    if (type === "gig") return content.gigs?.find(g => g.id === id) || null;
    if (type === "ripple") return content.ripple?.find(r => r.id === id) || null;
    if (type === "guide") return content.teensGuide?.find(e => e.id === id) || null;
    if (type === "lightroom") return content.lightRoom?.find(e => e.id === id) || null;
    if (type === "drop") return content.dailyDrops?.find(d => d.id === id.replace("_video","")) || null;
    if (type === "career") return null; // career spotlights are embedded in drops
    return null;
  };

  // Map type → nav route
  const typeNavMap = {
    skill: "skills", project: "projects", gig: "factions",
    ripple: "ripple", guide: "teensguide", lightroom: "lightroom",
    drop: "drops", career: "drops", item: null,
  };

  const typeLabel = {
    skill: "Skill", project: "Project", gig: "Sandbox Gig",
    ripple: "Ripple Mission", guide: "Teen's Guide", lightroom: "Light Room",
    drop: "Daily Drop", career: "Career Spotlight", item: "Saved Item",
  };

  const ICONS = ["📌","🌟","💡","🎯","🔥","🎨","🧠","🚀","📚","🌿","💼","🏆","❤️","⚡","🌸","🗂"];
  const typeColors = { skill: "--amber", project: "--sky", gig: "--sage", ripple: "--clay", lightroom: "--sky", guide: "--lavender", drop: "--amber", career: "--lavender", item: "--amber" };

  // Detail modal content for a saved snapshot
  const renderDetail = () => {
    if (!detailItem) return null;
    const full = getFullItem(detailItem);
    const itemColor = "var(" + (typeColors[detailItem.type] || "--amber") + ")";
    const navRoute = typeNavMap[detailItem.type];

    return (
      <Modal open={!!detailItem} onClose={() => setDetailItem(null)}
        title={typeLabel[detailItem.type] || "Saved Item"}
        size="modal-lg"
        footer={
          <div style={{ display: "flex", gap: 10, justifyContent: "space-between", width: "100%" }}>
            <button className="btn btn-ghost" onClick={() => setDetailItem(null)}>Close</button>
            {navRoute && (
              <button className="btn btn-primary" onClick={() => { setDetailItem(null); onNavigate(navRoute); }}>
                Go to {typeLabel[detailItem.type]} Explorer →
              </button>
            )}
          </div>
        }>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 20 }}>
          <div style={{ width: 52, height: 52, borderRadius: "var(--r)", background: itemColor + "18", border: "2px solid " + itemColor + "44", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>
            {detailItem.icon}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: itemColor, fontWeight: 700, marginBottom: 4 }}>{typeLabel[detailItem.type]}</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "var(--cream)", lineHeight: 1.2 }}>{detailItem.title}</div>
            {detailItem.pts > 0 && <span className="pts-badge" style={{ marginTop: 8, display: "inline-flex" }}>⭐ {detailItem.pts} pts</span>}
          </div>
        </div>

        {/* Description */}
        {(full?.desc || full?.content || detailItem.desc) && (
          <div style={{ background: "var(--bg3)", borderRadius: "var(--r)", padding: "14px 16px", marginBottom: 16, border: "1px solid var(--border)" }}>
            <p style={{ fontSize: 14, color: "var(--cream-dim)", lineHeight: 1.8 }}>
              {full?.desc || full?.content || detailItem.desc}
            </p>
          </div>
        )}

        {/* Skill-specific: how to master */}
        {detailItem.type === "skill" && full?.how?.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: "var(--muted)", fontWeight: 700, marginBottom: 10 }}>How to Master It</div>
            {full.how.map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 10, padding: "7px 0", borderBottom: "1px solid var(--border)", fontSize: 13, color: "var(--cream-dim)", lineHeight: 1.6 }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--bg4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "var(--muted)", fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                <span>{step}</span>
              </div>
            ))}
          </div>
        )}

        {/* Project-specific: steps */}
        {detailItem.type === "project" && full?.steps?.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: "var(--muted)", fontWeight: 700, marginBottom: 10 }}>Project Steps</div>
            {full.steps.map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 10, padding: "7px 0", borderBottom: "1px solid var(--border)", fontSize: 13, color: "var(--cream-dim)", lineHeight: 1.5 }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--bg4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "var(--muted)", fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                <span>{step}</span>
              </div>
            ))}
          </div>
        )}

        {/* Ripple / Gig: steps */}
        {(detailItem.type === "ripple" || detailItem.type === "gig") && full?.steps?.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: "var(--muted)", fontWeight: 700, marginBottom: 10 }}>How to Complete It</div>
            {full.steps.map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 10, padding: "7px 0", borderBottom: "1px solid var(--border)", fontSize: 13, color: "var(--cream-dim)", lineHeight: 1.5 }}>
                <span style={{ color: itemColor, flexShrink: 0 }}>→</span><span>{step}</span>
              </div>
            ))}
          </div>
        )}

        {/* Video link for drop/video type */}
        {detailItem.url && (
          <div style={{ padding: "12px 16px", background: "var(--sky-dim)", border: "1px solid rgba(77,143,255,0.35)", borderRadius: "var(--r)", display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 20 }}>📹</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--cream)" }}>{detailItem.title}</div>
            </div>
            <a href={detailItem.url} target="_blank" rel="noopener noreferrer"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "var(--sky)", color: "#0c0c16", borderRadius: "var(--r)", fontWeight: 700, fontSize: 13, textDecoration: "none" }}>
              ▶ Watch
            </a>
          </div>
        )}

        {/* Career spotlight specific */}
        {detailItem.type === "career" && (
          <div style={{ padding: "14px 16px", background: "var(--lavender-dim)", border: "1px solid rgba(176,96,255,0.35)", borderRadius: "var(--r)" }}>
            <div style={{ fontSize: 12, color: "var(--lavender)", fontWeight: 600, marginBottom: 6 }}>Career Spotlight</div>
            <p style={{ fontSize: 13, color: "var(--cream-dim)", lineHeight: 1.75 }}>{detailItem.desc}</p>
          </div>
        )}

        {/* Saved date */}
        <div style={{ marginTop: 16, fontSize: 11, color: "var(--muted)", textAlign: "right" }}>
          Saved {detailItem.savedAt ? new Date(detailItem.savedAt).toLocaleDateString() : ""}
        </div>
      </Modal>
    );
  };

  return (
    <div style={{ marginTop: 36 }}>
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: "var(--muted)", fontWeight: 700, marginBottom: 14 }}>📌 My Boards</div>

      {/* Board tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {boards.map((b, i) => (
          <button key={b.id} onClick={() => setActiveBoard(i)}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 20,
              border: "1.5px solid " + (activeBoard === i ? "var(" + b.color + ")" : "var(--border)"),
              background: activeBoard === i ? "var(" + b.color + ")18" : "var(--bg2)",
              color: activeBoard === i ? "var(" + b.color + ")" : "var(--muted)",
              cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, transition: "all 0.15s" }}>
            <span>{b.icon}</span>
            <span>{b.name}</span>
            {b.items.length > 0 && (
              <span style={{ background: `var(${b.color})`, color: "#0c0c16", borderRadius: 20, fontSize: 10, fontWeight: 700, padding: "1px 6px" }}>{b.items.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Active board content */}
      {board && (
        <div style={{ background: "var(--bg2)", border: "1px solid " + color + "44", borderRadius: "var(--r-lg)", overflow: "hidden" }}>
          {/* Board header */}
          <div style={{ padding: "13px 18px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12, background: color + "0a" }}>
            {/* Icon picker */}
            <div style={{ position: "relative" }}>
              <button onClick={() => setEditingIcon(editingIcon === board.id ? null : board.id)}
                style={{ fontSize: 20, background: "none", border: "none", cursor: "pointer", lineHeight: 1 }} title="Change icon">{board.icon}</button>
              {editingIcon === board.id && (
                <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 200, background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--r)", padding: 8, display: "flex", flexWrap: "wrap", gap: 4, width: 192, boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
                  {ICONS.map(ic => (
                    <button key={ic} onClick={() => { setBoards(prev => prev.map(b => b.id === board.id ? { ...b, icon: ic } : b)); setEditingIcon(null); }}
                      style={{ fontSize: 18, background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 6 }}
                      onMouseEnter={e => e.currentTarget.style.background = "var(--bg3)"}
                      onMouseLeave={e => e.currentTarget.style.background = "none"}>{ic}</button>
                  ))}
                </div>
              )}
            </div>

            {/* Name */}
            {editingName === board.id ? (
              <input autoFocus className="input" value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                onBlur={() => saveEditName(board.id)}
                onKeyDown={e => { if (e.key === "Enter") saveEditName(board.id); if (e.key === "Escape") setEditingName(null); }}
                style={{ fontSize: 15, fontWeight: 700, flex: 1, padding: "3px 8px" }} />
            ) : (
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--cream)" }}>{board.name}</span>
                {!board.locked && (
                  <button onClick={() => { setNameInput(board.name); setEditingName(board.id); }}
                    style={{ fontSize: 11, color: "var(--muted)", background: "none", border: "none", cursor: "pointer", padding: "2px 5px" }} title="Rename">✏️</button>
                )}
              </div>
            )}
            <span style={{ fontSize: 11, color: "var(--muted)" }}>{board.items.length} saved</span>
          </div>

          {/* Cards */}
          {board.items.length === 0 ? (
            <div style={{ padding: "36px 20px", textAlign: "center", color: "var(--muted)" }}>
              <div style={{ fontSize: 32, marginBottom: 10, opacity: 0.4 }}>{board.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Nothing saved yet</div>
              <div style={{ fontSize: 12, lineHeight: 1.7, maxWidth: 280, margin: "0 auto" }}>Hit the 🔖 Save button on any skill, project, gig, video, or career spotlight to pin it here.</div>
            </div>
          ) : (
            <div style={{ padding: 16, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(195px, 1fr))", gap: 12 }}>
              {board.items.map((item, idx) => {
                const itemColor = "var(" + (typeColors[item.type] || "--amber") + ")";
                return (
                  <div key={item.id + idx}
                    onClick={() => setDetailItem(item)}
                    style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", overflow: "hidden", position: "relative", cursor: "pointer", transition: "all 0.15s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = itemColor; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.3)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
                    <div style={{ height: 3, background: itemColor }} />
                    <div style={{ padding: "11px 12px 13px" }}>
                      {/* Remove button */}
                      <button onClick={e => { e.stopPropagation(); removeItem(board.id, item.id); }}
                        style={{ position: "absolute", top: 9, right: 9, background: "var(--bg3)", border: "1px solid var(--border)", cursor: "pointer", color: "var(--muted)", fontSize: 13, lineHeight: 1, padding: "2px 5px", borderRadius: 4 }}
                        title="Remove">×</button>
                      <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1.5, color: itemColor, fontWeight: 700, marginBottom: 6 }}>{typeLabel[item.type] || item.type}</div>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 7, marginBottom: 6 }}>
                        <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1.25 }}>{item.icon}</span>
                        <span style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 700, color: "var(--cream)", lineHeight: 1.3, paddingRight: 16 }}>{item.title}</span>
                      </div>
                      {item.desc && <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.6, marginBottom: 7 }}>{String(item.desc).substring(0, 75)}{String(item.desc).length > 75 ? "…" : ""}</div>}
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        {item.url && <span style={{ fontSize: 10, color: "var(--sky)", fontWeight: 600 }}>▶ Video</span>}
                        {item.pts > 0 && <span className="pts-badge" style={{ fontSize: 10 }}>{item.pts} pts</span>}
                        <span style={{ fontSize: 10, color: "var(--muted)", marginLeft: "auto" }}>Tap to open →</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Item detail modal */}
      {renderDetail()}
    </div>
  );
}

function ProgressRing({ pct, size = 48, stroke = 4, color = "var(--amber)" }) {
  const r = (size - stroke * 2) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.5s ease" }} />
    </svg>
  );
}

function areaColor(areaId, areas) {
  if (areas) {
    const area = areas.find(a => a.id === areaId);
    if (area?.color) return area.color.startsWith("var(") ? area.color : `var(${area.color})`;
  }
  const map = { comm: "var(--amber)", math: "var(--sky)", science: "var(--sage)", history: "var(--clay)", arts: "var(--lavender)", tech: "var(--sky)", health: "var(--sage)", thinking: "var(--amber)", life: "var(--clay)" };
  return map[areaId] || "var(--muted)";
}

function avatarColor(idx) {
  const colors = ["var(--amber)", "var(--sage)", "var(--clay)", "var(--sky)", "var(--lavender)"];
  return colors[idx % colors.length];
}

// ─── CONTENT BLOCKS SYSTEM ────────────────────────────────────────────────────

const BLOCK_TYPES_CONFIG = [
  { id: "video",        label: "Video",        icon: "🎬", color: "var(--sky)",      desc: "Embed a YouTube video" },
  { id: "text",         label: "Text",         icon: "📝", color: "var(--cream)",    desc: "Rich text or reading passage" },
  { id: "writing",      label: "Writing",      icon: "✍️", color: "var(--amber)",    desc: "Student writing prompt" },
  { id: "quiz",         label: "Quiz",         icon: "❓", color: "var(--clay)",     desc: "Multiple choice question" },
  { id: "image",        label: "Image",        icon: "🖼️", color: "var(--lavender)", desc: "Display an image" },
  { id: "ai_tutor",     label: "AI Tutor",     icon: "🤖", color: "var(--amber)",    desc: "AI tutor with custom context" },
  { id: "upload",       label: "Upload",       icon: "📤", color: "var(--sage)",     desc: "Student submission prompt" },
  { id: "link",         label: "Link",         icon: "🔗", color: "var(--sky)",      desc: "External resource link" },
  { id: "reflect",      label: "Reflect",      icon: "🪞", color: "var(--lavender)", desc: "Reflection prompt" },
  { id: "flashcards",   label: "Flashcards",   icon: "🃏", color: "var(--clay)",     desc: "Term & definition cards" },
  { id: "micro_lesson", label: "Micro Lesson", icon: "⚡", color: "var(--amber)",    desc: "Interactive lesson content" },
  { id: "code",         label: "Code Block",   icon: "{/}", color: "var(--sage)",    desc: "Code display or sandbox" },
];

function newBlock(type) {
  const id = "blk_" + Date.now();
  const base = { id, type };
  switch (type) {
    case "video":        return { ...base, url: "", caption: "" };
    case "text":         return { ...base, heading: "", content: "" };
    case "writing":      return { ...base, prompt: "", placeholder: "Write your response here…", minWords: "" };
    case "quiz":         return { ...base, question: "", options: ["", "", "", ""], correctIndex: 0, explanation: "" };
    case "image":        return { ...base, url: "", caption: "" };
    case "ai_tutor":     return { ...base, context: "", buttonLabel: "Ask AI Tutor" };
    case "upload":       return { ...base, instructions: "", acceptedTypes: "" };
    case "link":         return { ...base, url: "", label: "", description: "" };
    case "reflect":      return { ...base, prompt: "", lines: 4 };
    case "flashcards":   return { ...base, cards: [{ term: "", def: "" }] };
    case "micro_lesson": return { ...base, heading: "", content: "", interactiveHtml: "" };
    case "code":         return { ...base, language: "javascript", code: "", instructions: "" };
    default:             return base;
  }
}

// ── Teacher: block type picker ─────────────────────────────────────────
function BlockTypePicker({ onPick, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: 24, width: "100%", maxWidth: 540 }}>
        <div className="flex-between mb-16">
          <span style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--cream)" }}>Add Content Block</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose} style={{ fontSize: 18 }}>×</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {BLOCK_TYPES_CONFIG.map(bt => (
            <div key={bt.id} onClick={() => { onPick(bt.id); onClose(); }}
              style={{ padding: "14px 10px", borderRadius: "var(--r)", border: "1px solid var(--border)", background: "var(--bg3)", cursor: "pointer", textAlign: "center", transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = bt.color; e.currentTarget.style.background = "var(--bg4)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--bg3)"; }}>
              <div style={{ fontSize: bt.id === "code" ? 13 : 20, fontWeight: bt.id === "code" ? 700 : 400, color: bt.color, marginBottom: 6, fontFamily: bt.id === "code" ? "monospace" : "inherit" }}>{bt.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--cream)" }}>{bt.label}</div>
              <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2, lineHeight: 1.4 }}>{bt.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Teacher: editor for one block ──────────────────────────────────────
function SingleBlockEditor({ block, onChange, onRemove, onMoveUp, onMoveDown, isFirst, isLast }) {
  const cfg = BLOCK_TYPES_CONFIG.find(b => b.id === block.type);
  const upd = (key, val) => onChange({ ...block, [key]: val });

  const renderFields = () => {
    switch (block.type) {
      case "video": return (
        <>
          <div className="form-row"><label className="label">YouTube URL</label><input className="input" value={block.url || ""} onChange={e => upd("url", e.target.value)} placeholder="https://youtube.com/watch?v=..." /></div>
          <div className="form-row"><label className="label">Caption (optional)</label><input className="input" value={block.caption || ""} onChange={e => upd("caption", e.target.value)} placeholder="Context or instructions for students" /></div>
        </>
      );
      case "text": return (
        <>
          <div className="form-row"><label className="label">Heading (optional)</label><input className="input" value={block.heading || ""} onChange={e => upd("heading", e.target.value)} placeholder="Section heading" /></div>
          <div className="form-row"><label className="label">Content</label><textarea className="input textarea" style={{ minHeight: 90 }} value={block.content || ""} onChange={e => upd("content", e.target.value)} placeholder="Write the text content here…" /></div>
        </>
      );
      case "writing": return (
        <>
          <div className="form-row"><label className="label">Writing Prompt</label><textarea className="input textarea" style={{ minHeight: 72 }} value={block.prompt || ""} onChange={e => upd("prompt", e.target.value)} placeholder="What should the student write about?" /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div className="form-row"><label className="label">Min Words (optional)</label><input className="input" type="number" value={block.minWords || ""} onChange={e => upd("minWords", e.target.value)} placeholder="e.g. 150" /></div>
            <div className="form-row"><label className="label">Input Placeholder</label><input className="input" value={block.placeholder || ""} onChange={e => upd("placeholder", e.target.value)} placeholder="Write your response…" /></div>
          </div>
        </>
      );
      case "quiz": return (
        <>
          <div className="form-row"><label className="label">Question</label><input className="input" value={block.question || ""} onChange={e => upd("question", e.target.value)} placeholder="What is the question?" /></div>
          <div className="form-row">
            <label className="label">Answer Options (click radio = correct answer)</label>
            {(block.options || ["","","",""]).map((opt, i) => (
              <div key={i} className="flex-center gap-8" style={{ marginBottom: 6 }}>
                <input type="radio" checked={block.correctIndex === i} onChange={() => upd("correctIndex", i)} style={{ accentColor: "var(--sage)", width: 14, height: 14, flexShrink: 0 }} />
                <input className="input" style={{ flex: 1 }} value={opt} onChange={e => { const opts = [...(block.options||["","","",""])]; opts[i] = e.target.value; upd("options", opts); }} placeholder={`Option ${i+1}`} />
              </div>
            ))}
          </div>
          <div className="form-row"><label className="label">Explanation (shown after answer)</label><textarea className="input textarea" style={{ minHeight: 52 }} value={block.explanation || ""} onChange={e => upd("explanation", e.target.value)} placeholder="Why is this the correct answer?" /></div>
        </>
      );
      case "image": return (
        <>
          <div className="form-row"><label className="label">Image URL</label><input className="input" value={block.url || ""} onChange={e => upd("url", e.target.value)} placeholder="https://…" /></div>
          <div className="form-row"><label className="label">Caption</label><input className="input" value={block.caption || ""} onChange={e => upd("caption", e.target.value)} placeholder="Image caption or attribution" /></div>
        </>
      );
      case "ai_tutor": return (
        <>
          <div className="form-row"><label className="label">Context / Topic for AI</label><textarea className="input textarea" style={{ minHeight: 60 }} value={block.context || ""} onChange={e => upd("context", e.target.value)} placeholder="What should the AI tutor help with? e.g. 'Help the student understand photosynthesis using the Socratic method'" /></div>
          <div className="form-row"><label className="label">Button Label</label><input className="input" value={block.buttonLabel || "Ask AI Tutor"} onChange={e => upd("buttonLabel", e.target.value)} placeholder="Ask AI Tutor" /></div>
        </>
      );
      case "upload": return (
        <>
          <div className="form-row"><label className="label">Submission Instructions</label><textarea className="input textarea" style={{ minHeight: 60 }} value={block.instructions || ""} onChange={e => upd("instructions", e.target.value)} placeholder="What should the student submit? How will they know it's done?" /></div>
          <div className="form-row"><label className="label">Accepted Types (optional hint)</label><input className="input" value={block.acceptedTypes || ""} onChange={e => upd("acceptedTypes", e.target.value)} placeholder="e.g. photo, video, PDF, Google Doc link" /></div>
        </>
      );
      case "link": return (
        <>
          <div className="form-row"><label className="label">URL</label><input className="input" value={block.url || ""} onChange={e => upd("url", e.target.value)} placeholder="https://…" /></div>
          <div className="form-row"><label className="label">Link Label</label><input className="input" value={block.label || ""} onChange={e => upd("label", e.target.value)} placeholder="e.g. Khan Academy: Photosynthesis" /></div>
          <div className="form-row"><label className="label">Description</label><input className="input" value={block.description || ""} onChange={e => upd("description", e.target.value)} placeholder="What will they find here?" /></div>
        </>
      );
      case "reflect": return (
        <>
          <div className="form-row"><label className="label">Reflection Prompt</label><textarea className="input textarea" style={{ minHeight: 72 }} value={block.prompt || ""} onChange={e => upd("prompt", e.target.value)} placeholder="What should the student reflect on?" /></div>
          <div className="form-row"><label className="label">Lines (textarea size)</label><input className="input" type="number" value={block.lines || 4} onChange={e => upd("lines", parseInt(e.target.value)||4)} /></div>
        </>
      );
      case "flashcards": return (
        <>
          <div className="form-row">
            <label className="label">Cards (term / definition)</label>
            {(block.cards || []).map((card, i) => (
              <div key={i} className="flex-center gap-6" style={{ marginBottom: 6 }}>
                <input className="input" style={{ flex: 1 }} value={card.term || ""} onChange={e => { const c = [...block.cards]; c[i] = { ...c[i], term: e.target.value }; upd("cards", c); }} placeholder="Term" />
                <span style={{ color: "var(--muted)", fontSize: 12, flexShrink: 0 }}>→</span>
                <input className="input" style={{ flex: 2 }} value={card.def || ""} onChange={e => { const c = [...block.cards]; c[i] = { ...c[i], def: e.target.value }; upd("cards", c); }} placeholder="Definition" />
                <button className="btn btn-clay btn-xs" onClick={() => upd("cards", block.cards.filter((_, ci) => ci !== i))}>✕</button>
              </div>
            ))}
            <button className="btn btn-ghost btn-xs mt-4" onClick={() => upd("cards", [...(block.cards||[]), { term: "", def: "" }])}>+ Add Card</button>
          </div>
        </>
      );
      case "micro_lesson": return (
        <>
          <div className="form-row"><label className="label">Lesson Heading</label><input className="input" value={block.heading || ""} onChange={e => upd("heading", e.target.value)} placeholder="e.g. What is a Variable?" /></div>
          <div className="form-row"><label className="label">Lesson Content</label><textarea className="input textarea" style={{ minHeight: 80 }} value={block.content || ""} onChange={e => upd("content", e.target.value)} placeholder="Explain the concept, step by step…" /></div>
          <div className="form-row"><label className="label">Interactive HTML (optional — advanced)</label><textarea className="input textarea" style={{ minHeight: 60, fontFamily: "monospace", fontSize: 12 }} value={block.interactiveHtml || ""} onChange={e => upd("interactiveHtml", e.target.value)} placeholder="<button onclick='…'>Try it</button>" /></div>
        </>
      );
      case "code": return (
        <>
          <div className="form-row"><label className="label">Instructions</label><input className="input" value={block.instructions || ""} onChange={e => upd("instructions", e.target.value)} placeholder="What should the student do with this code?" /></div>
          <div className="form-row"><label className="label">Language</label>
            <select className="input" value={block.language || "javascript"} onChange={e => upd("language", e.target.value)}>
              {["javascript","python","html","css","json","bash","sql","typescript"].map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="form-row"><label className="label">Code</label><textarea className="input textarea" style={{ minHeight: 100, fontFamily: "monospace", fontSize: 12 }} value={block.code || ""} onChange={e => upd("code", e.target.value)} placeholder="// paste code here" /></div>
        </>
      );
      default: return <div style={{ fontSize: 13, color: "var(--muted)" }}>Unknown block type</div>;
    }
  };

  return (
    <div style={{ background: "var(--bg3)", border: `1px solid ${cfg?.color || "var(--border)"}30`, borderRadius: "var(--r)", padding: 14, marginBottom: 10 }}>
      <div className="flex-between mb-10">
        <div className="flex-center gap-8">
          <span style={{ fontSize: 16, color: cfg?.color || "var(--muted)" }}>{cfg?.id === "code" ? <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700 }}>{"{/}"}</span> : cfg?.icon}</span>
          <span style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: cfg?.color || "var(--muted)" }}>{cfg?.label}</span>
        </div>
        <div className="flex gap-4">
          {!isFirst && <button className="btn btn-ghost btn-xs" onClick={onMoveUp} title="Move up">↑</button>}
          {!isLast && <button className="btn btn-ghost btn-xs" onClick={onMoveDown} title="Move down">↓</button>}
          <button className="btn btn-clay btn-xs" onClick={onRemove}>Remove</button>
        </div>
      </div>
      {renderFields()}
    </div>
  );
}

// ── Teacher: full block list editor ───────────────────────────────────
function ContentBlockEditor({ blocks, setBlocks }) {
  const [showPicker, setShowPicker] = useState(false);
  const list = blocks || [];

  const addBlock = (type) => setBlocks([...list, newBlock(type)]);
  const removeBlock = (id) => setBlocks(list.filter(b => b.id !== id));
  const updateBlock = (id, updated) => setBlocks(list.map(b => b.id === id ? updated : b));
  const moveUp = (i) => { if (i === 0) return; const a = [...list]; [a[i-1], a[i]] = [a[i], a[i-1]]; setBlocks(a); };
  const moveDown = (i) => { if (i === list.length-1) return; const a = [...list]; [a[i], a[i+1]] = [a[i+1], a[i]]; setBlocks(a); };

  return (
    <div>
      <div style={{ height: 1, background: "var(--border)", margin: "18px 0" }} />
      <div className="flex-between mb-12">
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, color: "var(--muted)" }}>Content Blocks</div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{list.length} block{list.length !== 1 ? "s" : ""} · shown to students when they open this item</div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => setShowPicker(true)}>+ Add Block</button>
      </div>

      {list.length === 0 && (
        <div style={{ textAlign: "center", padding: "24px 16px", background: "var(--bg3)", borderRadius: "var(--r)", border: "1px dashed var(--border)", marginBottom: 8 }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>⬡</div>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>No content blocks yet — add video, text, quizzes, writing prompts, and more</div>
        </div>
      )}

      {list.map((block, i) => (
        <SingleBlockEditor
          key={block.id}
          block={block}
          onChange={(updated) => updateBlock(block.id, updated)}
          onRemove={() => removeBlock(block.id)}
          onMoveUp={() => moveUp(i)}
          onMoveDown={() => moveDown(i)}
          isFirst={i === 0}
          isLast={i === list.length - 1}
        />
      ))}

      {list.length > 0 && (
        <button className="btn btn-ghost btn-sm" style={{ width: "100%" }} onClick={() => setShowPicker(true)}>+ Add Another Block</button>
      )}

      {showPicker && <BlockTypePicker onPick={addBlock} onClose={() => setShowPicker(false)} />}
    </div>
  );
}

// ── Student: renders one block ─────────────────────────────────────────
function BlockRendererItem({ block, apiKey, context }) {
  const [quizAnswer, setQuizAnswer] = useState(null);
  const [writingText, setWritingText] = useState("");
  const [reflectText, setReflectText] = useState("");
  const [cardIndex, setCardIndex] = useState(0);
  const [cardFlipped, setCardFlipped] = useState(false);
  const [tutorOpen, setTutorOpen] = useState(false);
  const cfg = BLOCK_TYPES_CONFIG.find(b => b.id === block.type);

  switch (block.type) {
    case "video": {
      const embedUrl = block.url ? toYouTubeEmbed(block.url) : null;
      if (!embedUrl) return null;
      return (
        <div className="card" style={{ borderColor: "rgba(77,143,255,0.35)", padding: 0, overflow: "hidden" }}>
          {block.caption && <div style={{ padding: "12px 16px", fontSize: 13, color: "var(--cream-dim)" }}>{block.caption}</div>}
          <div style={{ aspectRatio: "16/9", background: "#000" }}>
            <iframe src={embedUrl} style={{ width: "100%", height: "100%", border: "none" }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title={block.caption || "Video"} />
          </div>
        </div>
      );
    }
    case "text": return (
      <div className="card">
        {block.heading && <h3 style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, color: "var(--cream)", marginBottom: 10 }}>{block.heading}</h3>}
        <p style={{ fontSize: 14, color: "var(--cream-dim)", lineHeight: 1.85, whiteSpace: "pre-wrap" }}>{block.content}</p>
      </div>
    );
    case "writing": return (
      <div className="card" style={{ borderColor: "rgba(0,212,255,0.35)", background: "rgba(232,160,32,0.03)" }}>
        <div className="flex-center gap-8 mb-10">
          <span style={{ fontSize: 16 }}>✍️</span>
          <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: "var(--amber)", fontWeight: 700 }}>Writing Prompt</span>
          {block.minWords && <span style={{ fontSize: 11, color: "var(--muted)", marginLeft: "auto" }}>Min {block.minWords} words</span>}
        </div>
        <p style={{ fontSize: 14, color: "var(--cream-dim)", lineHeight: 1.8, marginBottom: 12 }}>{block.prompt}</p>
        <textarea className="input textarea" style={{ minHeight: 100 }} value={writingText} onChange={e => setWritingText(e.target.value)} placeholder={block.placeholder || "Write your response here…"} />
        {(() => {
          const wordCount = writingText.trim() ? writingText.trim().split(/\s+/).length : 0;
          const minW = parseInt(block.minWords) || 0;
          if (!wordCount && !minW) return null;
          return (
            <div style={{ fontSize: 11, marginTop: 5, color: minW > 0 && wordCount < minW ? "var(--clay)" : "var(--sage)" }}>
              {wordCount} word{wordCount !== 1 ? "s" : ""}{minW > 0 ? ` · ${Math.max(0, minW - wordCount)} more to go` : ""}
              {minW > 0 && wordCount >= minW ? " ✓" : ""}
            </div>
          );
        })()}
      </div>
    );
    case "quiz": {
      const opts = (block.options || []).filter(o => o.trim());
      const answered = quizAnswer !== null;
      const correct = quizAnswer === block.correctIndex;
      return (
        <div className="card" style={{ borderColor: answered ? (correct ? "rgba(122,170,122,0.4)" : "rgba(200,112,96,0.4)") : "rgba(255,61,120,0.28)" }}>
          <div className="flex-center gap-8 mb-12">
            <span style={{ fontSize: 16 }}>❓</span>
            <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: "var(--clay)", fontWeight: 700 }}>Quiz</span>
            {answered && <span className={`tag ${correct ? "tag-sage" : "tag-clay"}`} style={{ marginLeft: "auto" }}>{correct ? "✓ Correct!" : "✗ Not quite"}</span>}
          </div>
          <p style={{ fontSize: 15, fontWeight: 600, color: "var(--cream)", lineHeight: 1.5, marginBottom: 14 }}>{block.question}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {opts.map((opt, i) => {
              let bg = "var(--bg3)", border = "var(--border)", color = "var(--cream-dim)";
              if (answered && i === block.correctIndex) { bg = "rgba(0,229,168,0.12)"; border = "var(--sage)"; color = "var(--sage)"; }
              else if (answered && i === quizAnswer && i !== block.correctIndex) { bg = "rgba(255,61,120,0.12)"; border = "var(--clay)"; color = "var(--clay)"; }
              else if (!answered && quizAnswer === i) { bg = "var(--amber-dim)"; border = "var(--amber)"; color = "var(--amber)"; }
              return (
                <div key={i} onClick={() => !answered && setQuizAnswer(i)}
                  style={{ padding: "11px 14px", borderRadius: "var(--r)", background: bg, border: `1px solid ${border}`, color, fontSize: 14, cursor: answered ? "default" : "pointer", transition: "all 0.15s" }}>
                  <span style={{ fontWeight: 600, marginRight: 8 }}>{["A","B","C","D"][i]}.</span>{opt}
                </div>
              );
            })}
          </div>
          {answered && block.explanation && (
            <div style={{ marginTop: 12, padding: "10px 14px", background: "var(--bg3)", borderRadius: "var(--r)", fontSize: 13, color: "var(--muted)", borderLeft: `3px solid ${correct ? "var(--sage)" : "var(--clay)"}` }}>
              <strong style={{ color: "var(--cream-dim)" }}>Explanation: </strong>{block.explanation}
            </div>
          )}
          {answered && <button className="btn btn-ghost btn-xs mt-8" onClick={() => setQuizAnswer(null)}>Try Again</button>}
        </div>
      );
    }
    case "image": return block.url ? (
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <img src={block.url} alt={block.caption || ""} style={{ width: "100%", display: "block", borderRadius: "var(--r-lg)" }} />
        {block.caption && <div style={{ padding: "10px 14px", fontSize: 12, color: "var(--muted)", fontStyle: "italic" }}>{block.caption}</div>}
      </div>
    ) : null;
    case "ai_tutor": return (
      <div className="card" style={{ borderColor: "rgba(0,212,255,0.35)", background: "rgba(232,160,32,0.04)", textAlign: "center", padding: 24 }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>🤖</div>
        <button className="btn btn-primary" onClick={() => setTutorOpen(true)}>{block.buttonLabel || "Ask AI Tutor"}</button>
        {tutorOpen && <AITutor open={true} onClose={() => setTutorOpen(false)} context={block.context || context || ""} apiKey={apiKey} />}
      </div>
    );
    case "upload": return (
      <div className="card" style={{ borderColor: "rgba(0,229,168,0.35)", background: "rgba(122,170,122,0.04)" }}>
        <div className="flex-center gap-8 mb-10">
          <span style={{ fontSize: 16 }}>📤</span>
          <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: "var(--sage)", fontWeight: 700 }}>Submission</span>
        </div>
        <p style={{ fontSize: 14, color: "var(--cream-dim)", lineHeight: 1.8, marginBottom: 10 }}>{block.instructions}</p>
        {block.acceptedTypes && <div style={{ fontSize: 11, color: "var(--muted)" }}>Accepted: {block.acceptedTypes}</div>}
      </div>
    );
    case "link": return block.url ? (
      <div className="card" style={{ borderColor: "rgba(77,143,255,0.35)" }}>
        <div className="flex-between">
          <div>
            <div className="flex-center gap-8 mb-4">
              <span style={{ fontSize: 14 }}>🔗</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--sky)" }}>{block.label || block.url}</span>
            </div>
            {block.description && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{block.description}</div>}
          </div>
          <a href={block.url} target="_blank" rel="noreferrer" className="btn btn-sky btn-sm" style={{ flexShrink: 0, marginLeft: 12, textDecoration: "none" }}>Open →</a>
        </div>
      </div>
    ) : null;
    case "reflect": return (
      <div className="card" style={{ borderColor: "rgba(176,96,255,0.35)", background: "rgba(144,128,192,0.04)" }}>
        <div className="flex-center gap-8 mb-10">
          <span style={{ fontSize: 16 }}>🪞</span>
          <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: "var(--lavender)", fontWeight: 700 }}>Reflection</span>
        </div>
        <p style={{ fontSize: 14, color: "var(--cream-dim)", lineHeight: 1.8, marginBottom: 12 }}>{block.prompt}</p>
        <textarea className="input textarea" style={{ minHeight: `${(block.lines || 4) * 24}px` }} value={reflectText} onChange={e => setReflectText(e.target.value)} placeholder="Write your reflection…" />
      </div>
    );
    case "flashcards": {
      const cards = (block.cards || []).filter(c => c.term);
      if (!cards.length) return null;
      const card = cards[cardIndex];
      return (
        <div className="card" style={{ borderColor: "rgba(255,61,120,0.35)" }}>
          <div className="flex-between mb-12">
            <div className="flex-center gap-8">
              <span style={{ fontSize: 16 }}>🃏</span>
              <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: "var(--clay)", fontWeight: 700 }}>Flashcards</span>
            </div>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>{cardIndex + 1} / {cards.length}</span>
          </div>
          <div onClick={() => setCardFlipped(f => !f)} style={{ minHeight: 100, background: "var(--bg3)", borderRadius: "var(--r)", padding: 20, cursor: "pointer", textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)", transition: "all 0.2s" }}>
            <div>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: "var(--muted)", marginBottom: 8 }}>{cardFlipped ? "Definition" : "Term"}</div>
              <div style={{ fontSize: 16, fontWeight: 600, color: "var(--cream)", lineHeight: 1.5 }}>{cardFlipped ? card.def : card.term}</div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 8 }}>Click to flip</div>
            </div>
          </div>
          <div className="flex gap-8 mt-10" style={{ justifyContent: "center" }}>
            <button className="btn btn-ghost btn-sm" disabled={cardIndex === 0} onClick={() => { setCardIndex(i => i-1); setCardFlipped(false); }}>← Prev</button>
            <button className="btn btn-ghost btn-sm" disabled={cardIndex === cards.length-1} onClick={() => { setCardIndex(i => i+1); setCardFlipped(false); }}>Next →</button>
          </div>
        </div>
      );
    }
    case "micro_lesson": return (
      <div className="card" style={{ borderColor: "rgba(0,212,255,0.35)", background: "rgba(232,160,32,0.04)" }}>
        <div className="flex-center gap-8 mb-10">
          <span style={{ fontSize: 16 }}>⚡</span>
          <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: "var(--amber)", fontWeight: 700 }}>Micro Lesson</span>
        </div>
        {block.heading && <h3 style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, color: "var(--cream)", marginBottom: 10 }}>{block.heading}</h3>}
        {block.content && <p style={{ fontSize: 14, color: "var(--cream-dim)", lineHeight: 1.85, marginBottom: block.interactiveHtml ? 14 : 0 }}>{block.content}</p>}
        {block.interactiveHtml && (
          <iframe
            srcDoc={`<!DOCTYPE html><html><head><style>body{background:#1e1e18;color:#f0ead8;font-family:system-ui,sans-serif;padding:16px;margin:0}button{cursor:pointer}input,select,textarea{background:#272720;border:1px solid #3a3a30;color:#f0ead8;padding:6px 10px;border-radius:6px}input:focus,select:focus,textarea:focus{outline:none;border-color:#e8a020}</style></head><body>${block.interactiveHtml}</body></html>`}
            style={{ width: "100%", minHeight: 120, border: "1px solid var(--border)", borderRadius: "var(--r)", background: "var(--bg3)" }}
            sandbox="allow-scripts allow-forms"
            title="Interactive element"
          />
        )}
      </div>
    );
    case "code": {
      const lang = block.language || "javascript";
      const code = block.code || "";

      const buildSrcDoc = () => {
        if (lang === "html") return code;
        if (lang === "css") return `<!DOCTYPE html><html><head><style>body{background:#1e1e18;color:#f0ead8;font-family:system-ui,sans-serif;padding:16px;margin:0}${code}</style></head><body></body></html>`;
        if (lang === "javascript") return `<!DOCTYPE html><html><head><style>body{background:#141410;color:#f0ead8;font-family:monospace;font-size:13px;padding:14px;margin:0;line-height:1.65}pre{margin:0;white-space:pre-wrap;word-break:break-word}.err{color:#c87060}</style></head><body><pre id="out"></pre><script>
const _out=document.getElementById('out');
const _log=(...a)=>{_out.textContent+=a.map(x=>{if(x===null)return'null';if(x===undefined)return'undefined';if(typeof x==='object'){try{return JSON.stringify(x,null,2)}catch(e){return String(x)}}return String(x)}).join(' ')+'\\n'};
const _err=(e)=>{const s=document.createElement('span');s.className='err';s.textContent='Error: '+e.message;_out.appendChild(s)};
window.console={log:_log,warn:_log,error:_log,info:_log,dir:_log};
window.onerror=(m,s,l,c,e)=>{_err(e||{message:m});return true};
try{${code}}catch(e){_err(e)}
<\/script></body></html>`;
        return null;
      };

      const srcDoc = buildSrcDoc();
      if (!srcDoc) return null;

      return (
        <iframe
          srcDoc={srcDoc}
          sandbox="allow-scripts allow-forms allow-modals"
          style={{ width: "100%", minHeight: 400, border: "none", display: "block", borderRadius: "var(--r-lg)" }}
          title={block.instructions || "Interactive content"}
          onLoad={e => {
            try {
              const h = e.target.contentDocument?.documentElement?.scrollHeight;
              if (h && h > 50) e.target.style.minHeight = (h + 32) + "px";
            } catch {}
          }}
        />
      );
    }
    default: return null;
  }
}

// ── Student: renders all blocks for an item ────────────────────────────
function ContentBlockRenderer({ blocks, apiKey, context }) {
  if (!blocks || blocks.length === 0) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {blocks.map(block => (
        <BlockRendererItem key={block.id} block={block} apiKey={apiKey} context={context} />
      ))}
    </div>
  );
}

// ─── TEACHER: SKILLS MANAGER ──────────────────────────────────────────────────

function SkillsManager({ items, setItems, areas }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [blocks, setBlocks] = useState([]);
  const [search, setSearch] = useState("");
  const [filterArea, setFilterArea] = useState("all");
  const [openAreas, setOpenAreas] = useState({});   // collapsed by default
  const [openSubcats, setOpenSubcats] = useState({}); // collapsed by default

  const openAdd = () => { setForm({}); setBlocks([]); setEditing(null); setShowForm(true); };
  const openEdit = (item) => { setForm({ ...item }); setBlocks(item.blocks ? JSON.parse(JSON.stringify(item.blocks)) : []); setEditing(item.id); setShowForm(true); };
  const save = () => {
    const itemWithBlocks = { ...form, blocks };
    if (editing) {
      setItems(prev => prev.map(i => i.id === editing ? { ...i, ...itemWithBlocks } : i));
    } else {
      setItems(prev => [...prev, { ...itemWithBlocks, id: "sk" + Date.now() }]);
    }
    setShowForm(false);
  };
  const del = (id) => setItems(prev => prev.filter(i => i.id !== id));

  const selectedArea = areas.find(a => a.id === form.area);
  const subcatOptions = selectedArea?.subcats || [];

  const filtered = items.filter(i => {
    const matchArea = filterArea === "all" || i.area === filterArea;
    const matchSearch = !search || (i.name + (i.desc || "")).toLowerCase().includes(search.toLowerCase());
    return matchArea && matchSearch;
  });

  // Group filtered skills by area then subcat for the table
  const grouped = [];
  areas.forEach(area => {
    const areaSkills = filtered.filter(s => s.area === area.id);
    if (areaSkills.length === 0) return;
    const subcats = area.subcats || [];
    const subcatMap = {};
    areaSkills.forEach(skill => {
      const key = skill.subcat || "__none__";
      if (!subcatMap[key]) subcatMap[key] = [];
      subcatMap[key].push(skill);
    });
    grouped.push({ area, subcatMap, subcats });
  });

  return (
    <div>
      <div className="page-header">
        <div className="flex-between">
          <div>
            <h1 className="page-title">◈ Skills</h1>
            <p className="page-sub">{items.length} skills in library</p>
          </div>
          <button className="btn btn-primary" onClick={openAdd}>+ Add Skill</button>
        </div>
      </div>
      <div className="page-content">
        <div className="flex gap-10 mb-16">
          <div className="search-bar" style={{ flex: 1, marginBottom: 0 }}>
            <span style={{ color: "var(--muted)" }}>🔍</span>
            <input placeholder="Search skills..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="filter-row mb-16">
          <button className={`filter-btn ${filterArea === "all" ? "active" : ""}`} onClick={() => setFilterArea("all")}>All Areas</button>
          {areas.map(a => (
            <button key={a.id} className={`filter-btn ${filterArea === a.id ? "active" : ""}`} onClick={() => setFilterArea(a.id)}>
              {a.icon} {a.name}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon="◈" title="No skills found" action={<button className="btn btn-primary btn-sm" onClick={openAdd}>+ Add First Skill</button>} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {grouped.map(({ area, subcatMap, subcats }) => {
              const color = `var(${area.color || "--amber"})`;
              const totalSkills = Object.values(subcatMap).flat().length;
              const isAreaOpen = openAreas[area.id] === true;
              return (
                <div key={area.id} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", overflow: "hidden" }}>
                  {/* Clickable area header */}
                  <div onClick={() => setOpenAreas(p => ({ ...p, [area.id]: !isAreaOpen }))}
                    style={{ padding: "13px 18px", background: isAreaOpen ? "var(--bg3)" : "var(--bg2)", borderBottom: isAreaOpen ? "1px solid var(--border)" : "none", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", transition: "background 0.15s", userSelect: "none" }}>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: color + "22", border: `2px solid ${color}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>{area.icon}</div>
                    <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--cream)", flex: 1 }}>{area.name}</span>
                    <span style={{ fontSize: 11, color: "var(--muted)", marginRight: 8 }}>{totalSkills} skill{totalSkills !== 1 ? "s" : ""}</span>
                    <span style={{ color: "var(--muted)", fontSize: 12 }}>{isAreaOpen ? "▲" : "▼"}</span>
                  </div>

                  {/* Subcategories and skills — only when open */}
                  {isAreaOpen && (() => {
                    const rows = [];
                    subcats.forEach(sc => {
                      const scSkills = subcatMap[sc.id] || [];
                      if (scSkills.length === 0) return;
                      const scKey = area.id + ":" + sc.id;
                      const isScOpen = openSubcats[scKey] === true;
                      rows.push(
                        <div key={sc.id}>
                          <div onClick={() => setOpenSubcats(p => ({ ...p, [scKey]: !isScOpen }))}
                            style={{ padding: "8px 18px 8px 54px", background: "var(--bg3)", borderTop: "1px solid var(--border)", borderBottom: isScOpen ? "1px solid var(--border)" : "none", display: "flex", alignItems: "center", gap: 8, cursor: "pointer", userSelect: "none" }}>
                            <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color, flex: 1 }}>◆ {sc.name}</span>
                            <span style={{ fontSize: 10, color: "var(--muted)", marginRight: 6 }}>{scSkills.length}</span>
                            <span style={{ fontSize: 10, color: "var(--muted)" }}>{isScOpen ? "▲" : "▼"}</span>
                          </div>
                          {isScOpen && scSkills.map((skill) => (
                            <div key={skill.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 18px 11px 54px", borderTop: "1px solid var(--border)", transition: "background 0.1s" }}
                              onMouseEnter={e => e.currentTarget.style.background = "var(--bg3)"}
                              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                              <span style={{ fontSize: 20, width: 28, textAlign: "center" }}>{skill.icon || "◈"}</span>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: 13, color: "var(--cream)" }}>{skill.name}</div>
                                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{(skill.desc || "").substring(0, 80)}{(skill.desc || "").length > 80 ? "…" : ""}</div>
                              </div>
                              <span className="pts-badge">{skill.pts || 0} pts</span>
                              {skill.blocks?.length > 0 && <span className="tag tag-sky" style={{ fontSize: 10 }}>{skill.blocks.length} block{skill.blocks.length !== 1 ? "s" : ""}</span>}
                              <div className="flex gap-6">
                                <button className="btn btn-ghost btn-xs" onClick={() => openEdit(skill)}>Edit</button>
                                <button className="btn btn-clay btn-xs" onClick={() => del(skill.id)}>✕</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    });
                    const uncatSkills = subcatMap["__none__"] || [];
                    if (uncatSkills.length > 0) {
                      const scKey = area.id + ":__none__";
                      const isScOpen = openSubcats[scKey] === true;
                      rows.push(
                        <div key="__none__">
                          <div onClick={() => setOpenSubcats(p => ({ ...p, [scKey]: !isScOpen }))}
                            style={{ padding: "8px 18px 8px 54px", background: "var(--bg3)", borderTop: "1px solid var(--border)", borderBottom: isScOpen ? "1px solid var(--border)" : "none", display: "flex", alignItems: "center", gap: 8, cursor: "pointer", userSelect: "none" }}>
                            <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 2, color: "var(--muted)", flex: 1 }}>◆ Uncategorized</span>
                            <span style={{ fontSize: 10, color: "var(--muted)", marginRight: 6 }}>{uncatSkills.length}</span>
                            <span style={{ fontSize: 10, color: "var(--muted)" }}>{isScOpen ? "▲" : "▼"}</span>
                          </div>
                          {isScOpen && uncatSkills.map(skill => (
                            <div key={skill.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 18px 11px 54px", borderTop: "1px solid var(--border)", transition: "background 0.1s" }}
                              onMouseEnter={e => e.currentTarget.style.background = "var(--bg3)"}
                              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                              <span style={{ fontSize: 20, width: 28, textAlign: "center" }}>{skill.icon || "◈"}</span>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: 13, color: "var(--cream)" }}>{skill.name}</div>
                                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{(skill.desc || "").substring(0, 80)}{(skill.desc || "").length > 80 ? "…" : ""}</div>
                              </div>
                              <span className="pts-badge">{skill.pts || 0} pts</span>
                              <div className="flex gap-6">
                                <button className="btn btn-ghost btn-xs" onClick={() => openEdit(skill)}>Edit</button>
                                <button className="btn btn-clay btn-xs" onClick={() => del(skill.id)}>✕</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return rows;
                  })()}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? "Edit Skill" : "Add Skill"} size="modal-lg"
        footer={<><button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button><button className="btn btn-primary" onClick={save}>Save Skill</button></>}>
        <div className="grid-2" style={{ gap: 12 }}>
          <div className="form-row">
            <label className="label">Skill Name</label>
            <input className="input" value={form.name || ""} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Narrative Writing" />
          </div>
          <div className="form-row">
            <label className="label">Icon (emoji)</label>
            <input className="input" value={form.icon || ""} onChange={e => setForm(p => ({ ...p, icon: e.target.value }))} placeholder="📖" />
          </div>
        </div>
        <div className="form-row">
          <label className="label">Description</label>
          <textarea className="input textarea" value={form.desc || ""} onChange={e => setForm(p => ({ ...p, desc: e.target.value }))} placeholder="What does this skill involve?" />
        </div>
        <div className="grid-2" style={{ gap: 12 }}>
          <div className="form-row">
            <label className="label">Subject Area (Category)</label>
            <select className="input" value={form.area || ""} onChange={e => setForm(p => ({ ...p, area: e.target.value, subcat: "" }))}>
              <option value="">— Select Area —</option>
              {areas.map(a => <option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}
            </select>
          </div>
          <div className="form-row">
            <label className="label">Subcategory</label>
            <select className="input" value={form.subcat || ""} onChange={e => setForm(p => ({ ...p, subcat: e.target.value }))} disabled={!form.area}>
              <option value="">— Select Subcategory —</option>
              {subcatOptions.map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
            </select>
            {!form.area && <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>Select an area first</div>}
          </div>
        </div>
        <div className="form-row">
          <label className="label">Points</label>
          <input className="input" type="number" min="1" value={form.pts || ""} onChange={e => setForm(p => ({ ...p, pts: e.target.value }))} placeholder="15" />
        </div>
        <ContentBlockEditor blocks={blocks} setBlocks={setBlocks} />
      </Modal>
    </div>
  );
}

// ─── TEACHER: CONTENT CRUD ────────────────────────────────────────────────────

function ContentManager({ title, icon, items, setItems, fields, colorKey }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [blocks, setBlocks] = useState([]);
  const [search, setSearch] = useState("");

  const openAdd = () => { setForm({}); setBlocks([]); setEditing(null); setShowForm(true); };
  const openEdit = (item) => { setForm({ ...item }); setBlocks(item.blocks ? JSON.parse(JSON.stringify(item.blocks)) : []); setEditing(item.id); setShowForm(true); };
  const save = () => {
    const itemWithBlocks = { ...form, blocks };
    if (editing) {
      setItems(prev => prev.map(i => i.id === editing ? { ...i, ...itemWithBlocks } : i));
    } else {
      setItems(prev => [...prev, { ...itemWithBlocks, id: "c" + Date.now() }]);
    }
    setShowForm(false);
  };
  const del = (id) => setItems(prev => prev.filter(i => i.id !== id));

  const filtered = items.filter(i =>
    Object.values(i).some(v => typeof v === "string" && v.toLowerCase().includes(search.toLowerCase()))
  );

  const primaryField = fields[0];

  return (
    <div>
      <div className="page-header">
        <div className="flex-between">
          <div>
            <h1 className="page-title">{icon} {title}</h1>
            <p className="page-sub">{items.length} items in library</p>
          </div>
          <button className="btn btn-primary" onClick={openAdd}>+ Add {title.slice(0,-1)}</button>
        </div>
      </div>
      <div className="page-content">
        <div className="search-bar mb-16" style={{ marginBottom: 16 }}>
          <span style={{ color: "var(--muted)" }}>🔍</span>
          <input placeholder={`Search ${title.toLowerCase()}...`} value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {filtered.length === 0 ? (
          <EmptyState icon={icon} title={`No ${title.toLowerCase()} yet`} sub={`Add your first ${title.slice(0,-1).toLowerCase()} to get started.`}
            action={<button className="btn btn-primary btn-sm" onClick={openAdd}>+ Add First Item</button>} />
        ) : (
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", overflow: "hidden" }}>
            <table className="content-table" style={{ width: "100%" }}>
              <thead>
                <tr>
                  {fields.slice(0, 3).map(f => <th key={f.key}>{f.label}</th>)}
                  <th>Points</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => (
                  <tr key={item.id}>
                    <td style={{ maxWidth: 260 }}>
                      <div style={{ fontWeight: 600, color: "var(--cream)", fontSize: 13 }}>
                        {item.icon && <span style={{ marginRight: 6 }}>{item.icon}</span>}
                        {item[primaryField.key] || "—"}
                      </div>
                      {item[fields[1]?.key] && <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{String(item[fields[1].key]).substring(0, 80)}{String(item[fields[1].key]).length > 80 ? "…" : ""}</div>}
                    </td>
                    {fields[2] && <td style={{ fontSize: 12, color: "var(--muted)" }}>{item[fields[2].key] || "—"}</td>}
                    <td>
                      <div className="flex gap-6">
                        <span className="pts-badge">{item.pts || 0} pts</span>
                        {item.blocks?.length > 0 && <span className="tag tag-sky" style={{ fontSize: 10 }}>{item.blocks.length} block{item.blocks.length !== 1 ? "s" : ""}</span>}
                      </div>
                    </td>
                    <td>
                      <div className="flex gap-6">
                        <button className="btn btn-ghost btn-xs" onClick={() => openEdit(item)}>Edit</button>
                        <button className="btn btn-clay btn-xs" onClick={() => del(item.id)}>✕</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? `Edit ${title.slice(0,-1)}` : `Add ${title.slice(0,-1)}`} size="modal-lg"
        footer={<><button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button><button className="btn btn-primary" onClick={save}>Save</button></>}>
        {fields.map(f => (
          <div className="form-row" key={f.key}>
            <label className="label">{f.label}</label>
            {f.type === "textarea" ? (
              <textarea className="input textarea" value={form[f.key] || ""} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder || ""} />
            ) : f.type === "select" ? (
              <select className="input" value={form[f.key] || ""} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}>
                <option value="">— Select —</option>
                {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            ) : (
              <input className="input" type={f.type || "text"} value={form[f.key] || ""} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder || ""} />
            )}
          </div>
        ))}
        <ContentBlockEditor blocks={blocks} setBlocks={setBlocks} />
      </Modal>
    </div>
  );
}

// ─── TEACHER: OVERVIEW ────────────────────────────────────────────────────────

function TeacherOverview({ content, students, approvals, onNavigate }) {
  const totalContent = Object.values(content).reduce((a, b) => a + b.length, 0);
  const pendingApprovals = approvals.filter(a => a.status === "pending").length;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Teacher Dashboard</h1>
        <p className="page-sub">Manage your Forge platform — content, students, and approvals</p>
      </div>
      <div className="page-content">
        <div className="grid-4 mb-24">
          {[
            { num: students.length, label: "Students", color: "var(--amber)", icon: "👥", nav: "students" },
            { num: totalContent, label: "Content Items", color: "var(--sky)", icon: "📚", nav: "skills" },
            { num: pendingApprovals, label: "Pending Approvals", color: pendingApprovals > 0 ? "var(--clay)" : "var(--sage)", icon: "✅", nav: "approvals" },
            { num: content.dailyDrops.length, label: "Daily Drops Set", color: "var(--lavender)", icon: "⚡", nav: "drops" },
          ].map((s, i) => (
            <div key={i} className="stat-card" style={{ cursor: "pointer" }} onClick={() => onNavigate(s.nav)}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
              <div className="stat-num" style={{ color: s.color }}>{s.num}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid-2" style={{ gap: 20 }}>
          <div>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, color: "var(--cream)", marginBottom: 14 }}>Content Library</h3>
            {[
              { key: "skills", label: "Skills", icon: "◈", count: content.skills.length, nav: "skills" },
              { key: "projects", label: "Projects", icon: "⬟", count: content.projects.length, nav: "projects" },
              { key: "gigs", label: "Sandbox Gigs", icon: "⚡", count: content.gigs.length, nav: "gigs" },
              { key: "ripple", label: "Ripple Missions", icon: "🌊", count: content.ripple.length, nav: "ripple" },
              { key: "teensGuide", label: "Teen's Guide", icon: "📖", count: content.teensGuide.length, nav: "teensguide" },
              { key: "lightRoom", label: "Light Room", icon: "💡", count: content.lightRoom.length, nav: "lightroom" },
              { key: "dailyDrops", label: "Daily Drops", icon: "🌤️", count: content.dailyDrops.length, nav: "drops" },
            ].map(item => (
              <div key={item.key} className="student-row" onClick={() => onNavigate(item.nav)} style={{ borderRadius: "var(--r)", marginBottom: 2 }}>
                <span style={{ fontSize: 18, width: 28 }}>{item.icon}</span>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>{item.label}</span>
                <span style={{ fontSize: 13, color: "var(--muted)" }}>{item.count} items</span>
                <span style={{ color: "var(--muted)", fontSize: 12 }}>→</span>
              </div>
            ))}
          </div>

          <div>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, color: "var(--cream)", marginBottom: 14 }}>Students</h3>
            {students.length === 0 ? (
              <div className="card" style={{ textAlign: "center", padding: 32, color: "var(--muted)" }}>
                No students enrolled yet
              </div>
            ) : students.slice(0, 5).map((s, i) => (
              <div key={s.id} className="student-row" onClick={() => onNavigate("students")} style={{ borderRadius: "var(--r)", marginBottom: 2 }}>
                <div className="student-avatar" style={{ background: avatarColor(i), color: "#0c0c16" }}>{s.name?.[0] || "?"}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--cream)" }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>{s.completed?.length || 0} items completed</div>
                </div>
                <span className="pts-badge">{s.points || 0} pts</span>
              </div>
            ))}
            {pendingApprovals > 0 && (
              <div style={{ marginTop: 16, padding: "12px 16px", background: "var(--clay-dim)", border: "1px solid rgba(255,61,120,0.35)", borderRadius: "var(--r)", cursor: "pointer" }} onClick={() => onNavigate("approvals")}>
                <span style={{ color: "var(--clay)", fontWeight: 600, fontSize: 13 }}>⚠️ {pendingApprovals} mastery check{pendingApprovals > 1 ? "s" : ""} need{pendingApprovals === 1 ? "s" : ""} review</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TEACHER: STUDENTS PANEL ──────────────────────────────────────────────────

function TeacherStudents({ students = [], content }) {
  const [selected, setSelected] = useState(null);

  if (selected) {
    const s = selected;
    const completedSkills = (s.completed || []).filter(id => content.skills.find(sk => sk.id === id));
    const completedProjects = (s.completed || []).filter(id => content.projects.find(p => p.id === id));
    const pct = Math.round(((s.points || 0) / content.areas.reduce((a,b)=>a+(b.target||0),0)) * 100);

    return (
      <div>
        <div className="page-header">
          <div className="flex-between">
            <div>
              <button className="btn btn-ghost btn-sm mb-8" onClick={() => setSelected(null)}>← Back to Students</button>
              <h1 className="page-title">{s.name}</h1>
              <p className="page-sub">Age {s.age} · {s.interests?.length || 0} interests · Learning style: {s.learningStyle || "Not specified"}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 700, color: "var(--amber)", lineHeight: 1 }}>{s.points || 0}</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>of {content.areas.reduce((a,b)=>a+(b.target||0),0)} pts · {pct}%</div>
            </div>
          </div>
        </div>
        <div className="page-content">
          <div className="grid-4 mb-20">
            {[
              { num: completedSkills.length, label: "Skills", color: "var(--sage)" },
              { num: completedProjects.length, label: "Projects", color: "var(--amber)" },
              { num: (s.completed || []).length, label: "Total Items", color: "var(--sky)" },
              { num: pct + "%", label: "Transcript", color: "var(--lavender)" },
            ].map((stat, i) => (
              <div key={i} className="stat-card">
                <div style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 700, color: stat.color, lineHeight: 1 }}>{stat.num}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
          <div className="grid-2" style={{ gap: 20 }}>
            <div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, color: "var(--cream)", marginBottom: 12 }}>Interests</h3>
              <div className="pill-row mb-16">
                {(s.interests || []).map(id => {
                  const int = INTERESTS.find(i => i.id === id);
                  return int ? <span key={id} className={`tag tag-${int.color}`}>{int.icon} {int.label}</span> : null;
                })}
              </div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, color: "var(--cream)", marginBottom: 12 }}>Student's Why</h3>
              <p style={{ fontSize: 13, color: "var(--cream-dim)", lineHeight: 1.7, fontStyle: "italic" }}>{s.goals || "Not provided"}</p>
            </div>
            <div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, color: "var(--cream)", marginBottom: 12 }}>Progress by Area</h3>
              {content.areas.map(area => {
                const areaSkills = content.skills.filter(sk => sk.area === area.id);
                const done = areaSkills.filter(sk => (s.completed || []).includes(sk.id));
                const areaPts = done.reduce((a, b) => a + (b.pts || 0), 0);
                const pct2 = Math.min(100, Math.round((areaPts / area.target) * 100));
                return (
                  <div key={area.id} style={{ marginBottom: 10 }}>
                    <div className="flex-between mb-4">
                      <span style={{ fontSize: 12, color: "var(--cream-dim)" }}>{area.icon} {area.name}</span>
                      <span style={{ fontSize: 11, color: "var(--muted)" }}>{areaPts}/{area.target} pts</span>
                    </div>
                    <div style={{ height: 4, background: "var(--border)", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ width: `${pct2}%`, height: "100%", background: areaColor(area.id, content.areas), borderRadius: 4, transition: "width 0.5s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">👥 Students</h1>
        <p className="page-sub">{students.length} enrolled student{students.length !== 1 ? "s" : ""}</p>
      </div>
      <div className="page-content">
        {students.length === 0 ? (
          <EmptyState icon="👥" title="No students yet" sub="Students will appear here when they onboard to the platform." />
        ) : (
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", overflow: "hidden" }}>
            {students.map((s, i) => {
              const pct = Math.round(((s.points || 0) / content.areas.reduce((a,b)=>a+(b.target||0),0)) * 100);
              return (
                <div key={s.id} className="student-row" onClick={() => setSelected(s)}>
                  <div className="student-avatar" style={{ background: avatarColor(i), color: "#0c0c16" }}>{s.name?.[0] || "?"}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "var(--cream)" }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>Age {s.age} · {(s.completed || []).length} items completed</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span className="pts-badge">{s.points || 0} pts</span>
                    <div style={{ marginTop: 4, width: 80, height: 3, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: "var(--amber)", borderRadius: 3 }} />
                    </div>
                  </div>
                  <span style={{ color: "var(--muted)", marginLeft: 10, fontSize: 14 }}>→</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── TEACHER: APPROVALS ───────────────────────────────────────────────────────

function TeacherApprovals({ approvals, setApprovals }) {
  const pending = approvals.filter(a => a.status === "pending");
  const reviewed = approvals.filter(a => a.status !== "pending");

  const approve = (id) => setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: "approved" } : a));
  const reject = (id) => setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: "rejected" } : a));

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">✅ Mastery Approvals</h1>
        <p className="page-sub">{pending.length} pending · {reviewed.length} reviewed</p>
      </div>
      <div className="page-content">
        {pending.length === 0 && reviewed.length === 0 ? (
          <EmptyState icon="✅" title="No submissions yet" sub="Mastery check submissions from students will appear here." />
        ) : (
          <>
            {pending.length > 0 && (
              <>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, color: "var(--clay)", marginBottom: 14 }}>Needs Review ({pending.length})</h3>
                {pending.map(a => (
                  <div key={a.id} className="approval-card mb-12">
                    <div className="flex-between mb-8">
                      <div>
                        <div style={{ fontWeight: 600, color: "var(--cream)", fontSize: 14 }}>{a.studentName} — {a.skillName}</div>
                        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{a.submittedAt}</div>
                      </div>
                      <span className="pts-badge">{a.pts} pts</span>
                    </div>
                    {a.notes && <p style={{ fontSize: 13, color: "var(--cream-dim)", lineHeight: 1.6, marginBottom: 12, padding: "10px 12px", background: "var(--bg3)", borderRadius: "var(--r)" }}>{a.notes}</p>}
                    <div className="flex gap-8">
                      <button className="btn btn-sage btn-sm" onClick={() => approve(a.id)}>✓ Approve</button>
                      <button className="btn btn-clay btn-sm" onClick={() => reject(a.id)}>✕ Request More Evidence</button>
                    </div>
                  </div>
                ))}
              </>
            )}
            {reviewed.length > 0 && (
              <>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, color: "var(--muted)", marginBottom: 14, marginTop: pending.length > 0 ? 24 : 0 }}>Reviewed ({reviewed.length})</h3>
                {reviewed.map(a => (
                  <div key={a.id} className="approval-card mb-8" style={{ opacity: 0.7 }}>
                    <div className="flex-between">
                      <div>
                        <div style={{ fontWeight: 600, color: "var(--cream)", fontSize: 14 }}>{a.studentName} — {a.skillName}</div>
                        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{a.submittedAt}</div>
                      </div>
                      <span className={`tag ${a.status === "approved" ? "tag-sage" : "tag-clay"}`}>{a.status === "approved" ? "✓ Approved" : "✕ Needs More"}</span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── TEACHER: API SETTINGS ────────────────────────────────────────────────────

function APISettings({ apiKey, setApiKey }) {
  const [val, setVal] = useState(apiKey);
  const [saved, setSaved] = useState(false);
  const save = () => { setApiKey(val); setSaved(true); setTimeout(() => setSaved(false), 2000); };
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">⚙️ API Settings</h1>
        <p className="page-sub">Configure the Anthropic API key for AI Tutor and Mastery Check features</p>
      </div>
      <div className="page-content">
        <div className="card" style={{ maxWidth: 560 }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, color: "var(--cream)", marginBottom: 8 }}>Anthropic API Key</h3>
          <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16, lineHeight: 1.6 }}>This enables the AI Tutor on the student dashboard. Your key is stored locally and never sent anywhere except Anthropic's API. Get a key at console.anthropic.com.</p>
          <div className="form-row">
            <label className="label">API Key</label>
            <input className="input" type="password" value={val} onChange={e => setVal(e.target.value)} placeholder="sk-ant-..." />
          </div>
          <button className="btn btn-primary" onClick={save}>{saved ? "✓ Saved!" : "Save Key"}</button>
        </div>
      </div>
    </div>
  );
}

// ─── TEACHER: DROP CALENDAR ───────────────────────────────────────────────────

function TeacherDropCalendar({ drops, setDrops, students }) {
  const [calMonth, setCalMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [editDate, setEditDate] = useState(null);
  const [editDrop, setEditDrop] = useState(null);

  // Build calendar grid
  const { year, month } = calMonth;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const today = todayStr();

  const getDropForDate = (d) => {
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    return drops.find(x => x.date === dateStr) || null;
  };

  const openEdit = (d) => {
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const existing = drops.find(x => x.date === dateStr);
    setEditDate(dateStr);
    setEditDrop(existing ? JSON.parse(JSON.stringify(existing)) : {
      id: "drop_" + dateStr,
      date: dateStr,
      video: null,
      journal: null,
      careerSpotlights: [],
      kindnessChallenge: null,
    });
  };

  const saveDrop = () => {
    if (!editDrop) return;
    const clean = { ...editDrop };
    // Remove empty blocks
    if (clean.video && !clean.video.url?.trim()) clean.video = null;
    if (clean.journal && !clean.journal.prompt?.trim()) clean.journal = null;
    if (clean.kindnessChallenge && !clean.kindnessChallenge.description?.trim()) clean.kindnessChallenge = null;
    clean.careerSpotlights = (clean.careerSpotlights || []).filter(cs => cs.name?.trim());

    setDrops(prev => {
      const without = prev.filter(x => x.date !== clean.date);
      // Only add if there's actual content
      const hasContent = clean.video || clean.journal || (clean.careerSpotlights?.length > 0) || clean.kindnessChallenge;
      return hasContent ? [...without, clean] : without;
    });
    setEditDate(null);
    setEditDrop(null);
  };

  const deleteDrop = (dateStr) => {
    setDrops(prev => prev.filter(x => x.date !== dateStr));
    setEditDate(null);
    setEditDrop(null);
  };

  const updateBlock = (key, val) => setEditDrop(prev => ({ ...prev, [key]: val }));
  const toggleBlock = (key, template) => setEditDrop(prev => ({
    ...prev,
    [key]: prev[key] ? null : template,
  }));

  const studentOptions = [{ value: "all", label: "All Students" }, ...students.map(s => ({ value: s.name, label: s.name }))];

  // Upcoming drops sorted
  const upcomingDrops = [...drops].filter(d => d.date >= today).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 6);
  const pastDrops = [...drops].filter(d => d.date < today).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);

  return (
    <div>
      <div className="page-header">
        <div className="flex-between">
          <div>
            <h1 className="page-title">🌤️ Daily Drop Calendar</h1>
            <p className="page-sub">{drops.length} drops scheduled · Click any date to add or edit content</p>
          </div>
          <button className="btn btn-primary" onClick={() => openEdit(new Date().getDate())}>+ Add Today's Drop</button>
        </div>
      </div>

      <div className="page-content">
        <div className="grid-2" style={{ gap: 24, alignItems: "start" }}>
          {/* Calendar */}
          <div>
            <div className="card">
              <div className="flex-between mb-16">
                <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setCalMonth(p => {
                  const d = new Date(p.year, p.month - 1, 1);
                  return { year: d.getFullYear(), month: d.getMonth() };
                })}>←</button>
                <span style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, color: "var(--cream)" }}>{MONTHS[month]} {year}</span>
                <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setCalMonth(p => {
                  const d = new Date(p.year, p.month + 1, 1);
                  return { year: d.getFullYear(), month: d.getMonth() };
                })}>→</button>
              </div>

              {/* Day headers */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 4 }}>
                {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
                  <div key={d} style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, padding: "4px 0" }}>{d}</div>
                ))}
              </div>

              {/* Calendar grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
                {Array.from({ length: firstDay }).map((_, i) => <div key={"e"+i} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const d = i + 1;
                  const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
                  const drop = getDropForDate(d);
                  const isToday = dateStr === today;
                  const isEdit = editDate === dateStr;
                  const blockCount = drop ? [drop.video, drop.journal, drop.kindnessChallenge, ...(drop.careerSpotlights||[])].filter(Boolean).length : 0;

                  return (
                    <div key={d} onClick={() => openEdit(d)} style={{
                      aspectRatio: "1",
                      borderRadius: 8,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      position: "relative",
                      border: isEdit ? "2px solid var(--amber)" : isToday ? "2px solid rgba(0,212,255,0.45)" : "2px solid transparent",
                      background: drop ? "var(--amber-dim)" : isToday ? "rgba(0,212,255,0.05)" : "var(--bg3)",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = drop ? "rgba(0,212,255,0.15)" : "var(--bg4)"}
                    onMouseLeave={e => e.currentTarget.style.background = drop ? "var(--amber-dim)" : isToday ? "rgba(0,212,255,0.05)" : "var(--bg3)"}>
                      <span style={{ fontSize: 13, fontWeight: isToday ? 700 : 500, color: drop ? "var(--amber)" : isToday ? "var(--amber-soft)" : "var(--cream-dim)" }}>{d}</span>
                      {blockCount > 0 && (
                        <div style={{ display: "flex", gap: 2, marginTop: 2 }}>
                          {Array.from({ length: Math.min(blockCount, 4) }).map((_, bi) => (
                            <div key={bi} style={{ width: 4, height: 4, borderRadius: 2, background: "var(--amber)" }} />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex-center gap-12 mt-12" style={{ paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                <div className="flex-center gap-6">
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: "var(--amber-dim)", border: "1px solid rgba(0,212,255,0.45)" }} />
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>Has drop</span>
                </div>
                <div className="flex-center gap-6">
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: "var(--bg3)", border: "2px solid rgba(0,212,255,0.45)" }} />
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>Today</span>
                </div>
                <div className="flex-center gap-6">
                  <div style={{ width: 4, height: 4, borderRadius: 2, background: "var(--amber)" }} />
                  <span style={{ fontSize: 11, color: "var(--muted)" }}>Content blocks</span>
                </div>
              </div>
            </div>

            {/* Upcoming drops */}
            {upcomingDrops.length > 0 && (
              <div className="mt-16">
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: "var(--muted)", marginBottom: 8 }}>Upcoming</div>
                {upcomingDrops.map(drop => (
                  <div key={drop.id} onClick={() => { setEditDate(drop.date); setEditDrop(JSON.parse(JSON.stringify(drop))); }}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: "var(--r)", background: "var(--bg2)", border: "1px solid var(--border)", cursor: "pointer", marginBottom: 6, transition: "all 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "var(--amber)"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: drop.date === today ? "var(--amber)" : "var(--cream)" }}>
                        {formatDisplayDate(drop.date)}{drop.date === today ? " · Today" : ""}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                        {[drop.video && "📹 Video", drop.journal && "📓 Journal", drop.careerSpotlights?.length > 0 && "💼 Career", drop.kindnessChallenge && "💛 Kindness"].filter(Boolean).join(" · ")}
                      </div>
                    </div>
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>Edit →</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Editor panel */}
          <div>
            {editDrop ? (
              <div>
                <div className="flex-between mb-16">
                  <div>
                    <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: "var(--amber)", fontWeight: 700, marginBottom: 4 }}>Editing Drop</div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "var(--cream)" }}>{formatDisplayDate(editDate)}</div>
                  </div>
                  <div className="flex gap-8">
                    {drops.find(x => x.date === editDate) && (
                      <button className="btn btn-clay btn-sm" onClick={() => deleteDrop(editDate)}>Delete Drop</button>
                    )}
                    <button className="btn btn-ghost btn-sm" onClick={() => { setEditDate(null); setEditDrop(null); }}>Cancel</button>
                    <button className="btn btn-primary btn-sm" onClick={saveDrop}>Save Drop ✓</button>
                  </div>
                </div>

                {/* Content blocks */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

                  {/* VIDEO */}
                  <div className="card" style={{ borderColor: editDrop.video ? "var(--sky)" : "var(--border)" }}>
                    <div className="flex-between mb-10">
                      <div className="flex-center gap-8">
                        <span style={{ fontSize: 18 }}>📹</span>
                        <span style={{ fontWeight: 600, fontSize: 14, color: "var(--cream)" }}>Embedded Video</span>
                        {editDrop.video && <span className="tag tag-sky" style={{ fontSize: 10 }}>Active</span>}
                      </div>
                      <button className="btn btn-ghost btn-xs" onClick={() => toggleBlock("video", { url: "", title: "", description: "" })}>
                        {editDrop.video ? "Remove" : "+ Add"}
                      </button>
                    </div>
                    {editDrop.video && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <div>
                          <label className="label">YouTube URL</label>
                          <input className="input" value={editDrop.video.url || ""} onChange={e => updateBlock("video", { ...editDrop.video, url: e.target.value })} placeholder="https://www.youtube.com/watch?v=..." />
                        </div>
                        <div>
                          <label className="label">Video Title</label>
                          <input className="input" value={editDrop.video.title || ""} onChange={e => updateBlock("video", { ...editDrop.video, title: e.target.value })} placeholder="What students see as the title" />
                        </div>
                        <div>
                          <label className="label">Instructions / Context</label>
                          <textarea className="input textarea" style={{ minHeight: 60 }} value={editDrop.video.description || ""} onChange={e => updateBlock("video", { ...editDrop.video, description: e.target.value })} placeholder="What should students do while watching? What are they looking for?" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* JOURNAL */}
                  <div className="card" style={{ borderColor: editDrop.journal ? "var(--amber)" : "var(--border)" }}>
                    <div className="flex-between mb-10">
                      <div className="flex-center gap-8">
                        <span style={{ fontSize: 18 }}>📓</span>
                        <span style={{ fontWeight: 600, fontSize: 14, color: "var(--cream)" }}>Guided Journal Entry</span>
                        {editDrop.journal && <span className="tag tag-amber" style={{ fontSize: 10 }}>Active</span>}
                      </div>
                      <button className="btn btn-ghost btn-xs" onClick={() => toggleBlock("journal", { title: "", prompt: "" })}>
                        {editDrop.journal ? "Remove" : "+ Add"}
                      </button>
                    </div>
                    {editDrop.journal && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <div>
                          <label className="label">Prompt Title</label>
                          <input className="input" value={editDrop.journal.title || ""} onChange={e => updateBlock("journal", { ...editDrop.journal, title: e.target.value })} placeholder="e.g. Morning Reflection" />
                        </div>
                        <div>
                          <label className="label">Journal Prompt</label>
                          <textarea className="input textarea" style={{ minHeight: 80 }} value={editDrop.journal.prompt || ""} onChange={e => updateBlock("journal", { ...editDrop.journal, prompt: e.target.value })} placeholder="What should students reflect on or write about? Be specific..." />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* CAREER SPOTLIGHTS */}
                  <div className="card" style={{ borderColor: (editDrop.careerSpotlights?.length > 0) ? "var(--lavender)" : "var(--border)" }}>
                    <div className="flex-between mb-10">
                      <div className="flex-center gap-8">
                        <span style={{ fontSize: 18 }}>💼</span>
                        <span style={{ fontWeight: 600, fontSize: 14, color: "var(--cream)" }}>Career Spotlight</span>
                        {editDrop.careerSpotlights?.length > 0 && <span className="tag tag-lavender" style={{ fontSize: 10 }}>{editDrop.careerSpotlights.length} added</span>}
                      </div>
                      {(editDrop.careerSpotlights?.length || 0) < 3 && (
                        <button className="btn btn-ghost btn-xs" onClick={() => updateBlock("careerSpotlights", [...(editDrop.careerSpotlights||[]), { id: "cs" + Date.now(), targetStudent: "all", name: "", role: "", bio: "", insight: "" }])}>
                          + Add Spotlight
                        </button>
                      )}
                    </div>
                    {(editDrop.careerSpotlights || []).map((cs, ci) => (
                      <div key={cs.id} style={{ background: "var(--bg3)", borderRadius: "var(--r)", padding: 12, marginBottom: 10, border: "1px solid var(--border)" }}>
                        <div className="flex-between mb-8">
                          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--lavender)", textTransform: "uppercase", letterSpacing: 1 }}>Spotlight {ci + 1}</span>
                          <button className="btn btn-clay btn-xs" onClick={() => updateBlock("careerSpotlights", editDrop.careerSpotlights.filter((_, i) => i !== ci))}>Remove</button>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                          <div>
                            <label className="label">Show To</label>
                            <select className="input" value={cs.targetStudent || "all"} onChange={e => {
                              const updated = [...editDrop.careerSpotlights];
                              updated[ci] = { ...cs, targetStudent: e.target.value };
                              updateBlock("careerSpotlights", updated);
                            }}>
                              {studentOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                            </select>
                          </div>
                          <div className="grid-2" style={{ gap: 8 }}>
                            <div>
                              <label className="label">Person's Name</label>
                              <input className="input" value={cs.name || ""} onChange={e => { const u = [...editDrop.careerSpotlights]; u[ci] = { ...cs, name: e.target.value }; updateBlock("careerSpotlights", u); }} placeholder="e.g. Ira Glass" />
                            </div>
                            <div>
                              <label className="label">Role / Title</label>
                              <input className="input" value={cs.role || ""} onChange={e => { const u = [...editDrop.careerSpotlights]; u[ci] = { ...cs, role: e.target.value }; updateBlock("careerSpotlights", u); }} placeholder="e.g. Radio Producer" />
                            </div>
                          </div>
                          <div>
                            <label className="label">Brief Bio</label>
                            <textarea className="input textarea" style={{ minHeight: 52 }} value={cs.bio || ""} onChange={e => { const u = [...editDrop.careerSpotlights]; u[ci] = { ...cs, bio: e.target.value }; updateBlock("careerSpotlights", u); }} placeholder="2-3 sentences about who they are and how they got there" />
                          </div>
                          <div>
                            <label className="label">Key Insight / Quote</label>
                            <textarea className="input textarea" style={{ minHeight: 52 }} value={cs.insight || ""} onChange={e => { const u = [...editDrop.careerSpotlights]; u[ci] = { ...cs, insight: e.target.value }; updateBlock("careerSpotlights", u); }} placeholder="A quote or key insight worth sitting with" />
                          </div>
                        </div>
                      </div>
                    ))}
                    {!editDrop.careerSpotlights?.length && (
                      <p style={{ fontSize: 12, color: "var(--muted)", fontStyle: "italic" }}>Add up to 3 spotlights. You can personalize each one for a specific student.</p>
                    )}
                  </div>

                  {/* KINDNESS CHALLENGE */}
                  <div className="card" style={{ borderColor: editDrop.kindnessChallenge ? "var(--sage)" : "var(--border)" }}>
                    <div className="flex-between mb-10">
                      <div className="flex-center gap-8">
                        <span style={{ fontSize: 18 }}>💛</span>
                        <span style={{ fontWeight: 600, fontSize: 14, color: "var(--cream)" }}>Kindness Challenge</span>
                        {editDrop.kindnessChallenge && <span className="tag tag-sage" style={{ fontSize: 10 }}>Active</span>}
                      </div>
                      <button className="btn btn-ghost btn-xs" onClick={() => toggleBlock("kindnessChallenge", { title: "", description: "" })}>
                        {editDrop.kindnessChallenge ? "Remove" : "+ Add"}
                      </button>
                    </div>
                    {editDrop.kindnessChallenge && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        <div>
                          <label className="label">Challenge Title</label>
                          <input className="input" value={editDrop.kindnessChallenge.title || ""} onChange={e => updateBlock("kindnessChallenge", { ...editDrop.kindnessChallenge, title: e.target.value })} placeholder="e.g. Write a Specific Thank-You" />
                        </div>
                        <div>
                          <label className="label">Description / Instructions</label>
                          <textarea className="input textarea" style={{ minHeight: 70 }} value={editDrop.kindnessChallenge.description || ""} onChange={e => updateBlock("kindnessChallenge", { ...editDrop.kindnessChallenge, description: e.target.value })} placeholder="What exactly should the student do? How will they know they've done it?" />
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              </div>
            ) : (
              <div style={{ background: "var(--bg2)", border: "1px dashed var(--border)", borderRadius: "var(--r-lg)", padding: 40, textAlign: "center" }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>📅</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600, color: "var(--cream)", marginBottom: 8 }}>Select a date to edit</div>
                <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6, maxWidth: 280, margin: "0 auto" }}>Click any day on the calendar to create or edit that day's drop. Dates with amber dots already have content.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TEACHER: CATEGORY MANAGER ───────────────────────────────────────────────

const COLOR_OPTIONS = [
  { label: "Amber", value: "var(--amber)" },
  { label: "Sky", value: "var(--sky)" },
  { label: "Sage", value: "var(--sage)" },
  { label: "Clay", value: "var(--clay)" },
  { label: "Lavender", value: "var(--lavender)" },
];

function TeacherCategories({ areas, setAreas, skills }) {
  const [editing, setEditing] = useState(null); // area id or "new"
  const [form, setForm] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [expandedArea, setExpandedArea] = useState(null);
  // Subcat editing
  const [editingSubcat, setEditingSubcat] = useState(null); // { areaId, subcatId } | "new:{areaId}"
  const [subcatForm, setSubcatForm] = useState({});
  const [confirmDeleteSubcat, setConfirmDeleteSubcat] = useState(null);

  const openEdit = (area) => { setForm({ ...area, subcats: area.subcats ? JSON.parse(JSON.stringify(area.subcats)) : [] }); setEditing(area.id); };
  const openNew  = () => { setForm({ id: "cat_" + Date.now(), name: "", icon: "📚", target: 10, color: "var(--amber)", subcats: [] }); setEditing("new"); };

  const save = () => {
    if (!form.name?.trim()) return;
    const updated = { ...form, target: parseInt(form.target) || 10, subcats: form.subcats || [] };
    if (editing === "new") {
      setAreas(prev => [...prev, updated]);
    } else {
      setAreas(prev => prev.map(a => a.id === editing ? updated : a));
    }
    setEditing(null);
  };

  const del = (id) => {
    setAreas(prev => prev.filter(a => a.id !== id));
    setConfirmDelete(null);
  };

  const moveUp   = (i) => { if (i === 0) return; const a = [...areas]; [a[i-1],a[i]]=[a[i],a[i-1]]; setAreas(a); };
  const moveDown = (i) => { if (i === areas.length-1) return; const a = [...areas]; [a[i],a[i+1]]=[a[i+1],a[i]]; setAreas(a); };

  // Subcat helpers (operate directly on areas state)
  const openNewSubcat = (areaId) => {
    setSubcatForm({ id: "sc_" + Date.now(), name: "" });
    setEditingSubcat("new:" + areaId);
  };
  const openEditSubcat = (areaId, subcat) => {
    setSubcatForm({ ...subcat });
    setEditingSubcat(areaId + ":" + subcat.id);
  };
  const saveSubcat = () => {
    if (!subcatForm.name?.trim()) return;
    if (typeof editingSubcat === "string" && editingSubcat.startsWith("new:")) {
      const areaId = editingSubcat.slice(4);
      setAreas(prev => prev.map(a => a.id === areaId ? { ...a, subcats: [...(a.subcats || []), { ...subcatForm }] } : a));
    } else {
      const [areaId] = editingSubcat.split(":");
      setAreas(prev => prev.map(a => a.id === areaId ? {
        ...a, subcats: (a.subcats || []).map(sc => sc.id === subcatForm.id ? { ...subcatForm } : sc)
      } : a));
    }
    setEditingSubcat(null);
  };
  const delSubcat = () => {
    const { areaId, subcatId } = confirmDeleteSubcat;
    setAreas(prev => prev.map(a => a.id === areaId ? { ...a, subcats: (a.subcats || []).filter(sc => sc.id !== subcatId) } : a));
    setConfirmDeleteSubcat(null);
  };
  const moveSubcatUp = (areaId, i) => {
    setAreas(prev => prev.map(a => {
      if (a.id !== areaId) return a;
      const scs = [...(a.subcats || [])];
      if (i === 0) return a;
      [scs[i-1], scs[i]] = [scs[i], scs[i-1]];
      return { ...a, subcats: scs };
    }));
  };
  const moveSubcatDown = (areaId, i) => {
    setAreas(prev => prev.map(a => {
      if (a.id !== areaId) return a;
      const scs = [...(a.subcats || [])];
      if (i >= scs.length - 1) return a;
      [scs[i], scs[i+1]] = [scs[i+1], scs[i]];
      return { ...a, subcats: scs };
    }));
  };

  const totalTarget = areas.reduce((s, a) => s + (a.target || 0), 0);

  return (
    <div>
      <div className="page-header">
        <div className="flex-between">
          <div>
            <h1 className="page-title">📋 Transcript Categories</h1>
            <p className="page-sub">{areas.length} categories · {totalTarget} total pts to complete transcript</p>
          </div>
          <button className="btn btn-primary" onClick={openNew}>+ Add Category</button>
        </div>
      </div>

      <div className="page-content">
        <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", overflow: "hidden", marginBottom: 20 }}>
          {areas.map((area, i) => {
            const areaSkills = skills.filter(s => s.area === area.id);
            const color = area.color || "var(--muted)";
            const isExpanded = expandedArea === area.id;
            const subcats = area.subcats || [];
            return (
              <div key={area.id} style={{ borderBottom: i < areas.length - 1 ? "1px solid var(--border)" : "none" }}>
                {/* Area row */}
                <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", transition: "background 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--bg3)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: color + "22", border: `2px solid ${color}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>{area.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: "var(--cream)" }}>{area.name}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                      {areaSkills.length} skill{areaSkills.length !== 1 ? "s" : ""} · {subcats.length} subcategor{subcats.length !== 1 ? "ies" : "y"}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", minWidth: 90 }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color, fontFamily: "var(--font-display)" }}>{area.target}</div>
                    <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1 }}>pts to complete</div>
                  </div>
                  <div className="flex gap-4">
                    <button className="btn btn-ghost btn-xs" onClick={() => setExpandedArea(isExpanded ? null : area.id)} title="Manage subcategories">
                      {isExpanded ? "▲ Subcats" : "▼ Subcats"}
                    </button>
                    <button className="btn btn-ghost btn-xs" onClick={() => moveUp(i)} disabled={i === 0} style={{ opacity: i === 0 ? 0.3 : 1 }}>↑</button>
                    <button className="btn btn-ghost btn-xs" onClick={() => moveDown(i)} disabled={i === areas.length-1} style={{ opacity: i === areas.length-1 ? 0.3 : 1 }}>↓</button>
                    <button className="btn btn-ghost btn-xs" onClick={() => openEdit(area)}>Edit</button>
                    <button className="btn btn-clay btn-xs" onClick={() => setConfirmDelete(area)}>✕</button>
                  </div>
                </div>

                {/* Subcategories panel */}
                {isExpanded && (
                  <div style={{ background: "var(--bg3)", borderTop: "1px solid var(--border)", padding: "14px 20px 14px 56px" }}>
                    <div className="flex-between mb-10">
                      <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: "var(--muted)", fontWeight: 700 }}>Subcategories</span>
                      <button className="btn btn-ghost btn-xs" onClick={() => openNewSubcat(area.id)}>+ Add Subcategory</button>
                    </div>
                    {subcats.length === 0 ? (
                      <div style={{ fontSize: 13, color: "var(--muted)", fontStyle: "italic", paddingBottom: 4 }}>
                        No subcategories yet — add one to organize skills inside this area.
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        {subcats.map((sc, si) => {
                          const scSkillCount = areaSkills.filter(s => s.subcat === sc.id).length;
                          return (
                            <div key={sc.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--r)" }}>
                              <span style={{ fontSize: 10, color, fontWeight: 700 }}>◆</span>
                              <span style={{ flex: 1, fontSize: 13, color: "var(--cream)", fontWeight: 500 }}>{sc.name}</span>
                              <span style={{ fontSize: 11, color: "var(--muted)" }}>{scSkillCount} skill{scSkillCount !== 1 ? "s" : ""}</span>
                              <div className="flex gap-4">
                                <button className="btn btn-ghost btn-xs" onClick={() => moveSubcatUp(area.id, si)} disabled={si === 0} style={{ opacity: si === 0 ? 0.3 : 1 }}>↑</button>
                                <button className="btn btn-ghost btn-xs" onClick={() => moveSubcatDown(area.id, si)} disabled={si === subcats.length-1} style={{ opacity: si === subcats.length-1 ? 0.3 : 1 }}>↓</button>
                                <button className="btn btn-ghost btn-xs" onClick={() => openEditSubcat(area.id, sc)}>Edit</button>
                                <button className="btn btn-clay btn-xs" onClick={() => setConfirmDeleteSubcat({ areaId: area.id, subcatId: sc.id, name: sc.name })}>✕</button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="card" style={{ background: "var(--bg3)" }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: "var(--muted)", marginBottom: 8 }}>How categories & subcategories work</div>
          <p style={{ fontSize: 13, color: "var(--cream-dim)", lineHeight: 1.7 }}>
            Each <strong style={{ color: "var(--cream)" }}>category</strong> (e.g. Mathematics) has a points target for transcript completion. 
            <strong style={{ color: "var(--cream)" }}> Subcategories</strong> (e.g. Statistics, Algebra) organize skills within each area — they appear as accordion sections in the Skill Explorer for both teachers and students. Add, rename, reorder, or remove subcategories any time; skills will follow their assigned subcategory automatically.
          </p>
        </div>
      </div>

      {/* Edit / Add Area Modal */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing === "new" ? "Add Category" : "Edit Category"}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={save} disabled={!form.name?.trim()}>Save Category</button>
          </>
        }>
        <div className="form-row">
          <label className="label">Category Name</label>
          <input className="input" value={form.name || ""} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Mathematics" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="form-row">
            <label className="label">Icon (emoji)</label>
            <input className="input" value={form.icon || ""} onChange={e => setForm(p => ({ ...p, icon: e.target.value }))} placeholder="📚" />
          </div>
          <div className="form-row">
            <label className="label">Color</label>
            <select className="input" value={form.color || "var(--amber)"} onChange={e => setForm(p => ({ ...p, color: e.target.value }))}>
              {COLOR_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <label className="label">Points needed to complete this category</label>
          <input className="input" type="number" min="1" value={form.target || ""} onChange={e => setForm(p => ({ ...p, target: e.target.value }))} placeholder="e.g. 80" />
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 5 }}>Students must earn this many points from skills in this category to mark it complete on their transcript.</div>
        </div>
        <div className="form-row">
          <label className="label">Category ID (used to link skills — don't change after assigning skills)</label>
          <input className="input" value={form.id || ""} onChange={e => setForm(p => ({ ...p, id: e.target.value.replace(/\s/g,"_").toLowerCase() }))}
            placeholder="e.g. math" style={{ fontFamily: "monospace", fontSize: 12 }}
            disabled={editing !== "new"} />
          {editing !== "new" && <div style={{ fontSize: 11, color: "var(--clay)", marginTop: 4 }}>⚠ ID cannot be changed after creation — it links skills to this category.</div>}
        </div>
      </Modal>

      {/* Add / Edit Subcat Modal */}
      <Modal open={!!editingSubcat} onClose={() => setEditingSubcat(null)} title={editingSubcat?.startsWith?.("new:") ? "Add Subcategory" : "Edit Subcategory"}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setEditingSubcat(null)}>Cancel</button>
            <button className="btn btn-primary" onClick={saveSubcat} disabled={!subcatForm.name?.trim()}>Save</button>
          </>
        }>
        <div className="form-row">
          <label className="label">Subcategory Name</label>
          <input className="input" value={subcatForm.name || ""} onChange={e => setSubcatForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Statistics & Data" autoFocus />
        </div>
        <div className="form-row">
          <label className="label">Subcategory ID (used to link skills)</label>
          <input className="input" value={subcatForm.id || ""} onChange={e => setSubcatForm(p => ({ ...p, id: e.target.value.replace(/\s/g,"_").toLowerCase() }))}
            placeholder="e.g. stats" style={{ fontFamily: "monospace", fontSize: 12 }}
            disabled={!editingSubcat?.startsWith?.("new:")} />
          {!editingSubcat?.startsWith?.("new:") && <div style={{ fontSize: 11, color: "var(--clay)", marginTop: 4 }}>⚠ ID cannot be changed after creation.</div>}
        </div>
      </Modal>

      {/* Confirm delete area */}
      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Delete Category?"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setConfirmDelete(null)}>Cancel</button>
            <button className="btn btn-clay" onClick={() => del(confirmDelete.id)}>Delete</button>
          </>
        }>
        <p style={{ fontSize: 14, color: "var(--cream-dim)", lineHeight: 1.7 }}>
          Delete <strong style={{ color: "var(--cream)" }}>{confirmDelete?.name}</strong>? Skills assigned to this category will lose their category link but won't be deleted. This cannot be undone.
        </p>
      </Modal>

      {/* Confirm delete subcat */}
      <Modal open={!!confirmDeleteSubcat} onClose={() => setConfirmDeleteSubcat(null)} title="Delete Subcategory?"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setConfirmDeleteSubcat(null)}>Cancel</button>
            <button className="btn btn-clay" onClick={delSubcat}>Delete</button>
          </>
        }>
        <p style={{ fontSize: 14, color: "var(--cream-dim)", lineHeight: 1.7 }}>
          Delete subcategory <strong style={{ color: "var(--cream)" }}>{confirmDeleteSubcat?.name}</strong>? Skills assigned to this subcategory will become uncategorized but won't be deleted.
        </p>
      </Modal>
    </div>
  );
}

// ─── CHECK-IN CONSTANTS & HELPERS ─────────────────────────────────────────────

const CI_TYPES = [
  { value: "mental_health", label: "Mental Health", icon: "💭", color: "lavender" },
  { value: "skill_check", label: "Skill Check", icon: "🎯", color: "amber" },
  { value: "fact", label: "Fun Fact / Info", icon: "💡", color: "sky" },
  { value: "question", label: "Open Question", icon: "🤔", color: "sage" },
  { value: "reflection", label: "Reflection", icon: "🪞", color: "clay" },
];

const CI_ANSWER_FORMATS = [
  { value: "scale_1_5", label: "Scale 1–5" },
  { value: "multiple_choice", label: "Multiple Choice" },
  { value: "yes_no", label: "Yes / No" },
  { value: "text", label: "Free Text" },
  { value: "none", label: "No Response (fact / info)" },
];

const CI_WEEK_DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function ciTriggerOptions(fmt, choices) {
  if (fmt === "scale_1_5") return [
    { value: "always", label: "Any answer" },
    { value: "scale_lte_2", label: "Score 1 or 2 (struggling)" },
    { value: "scale_eq_3", label: "Score exactly 3 (middle)" },
    { value: "scale_gte_4", label: "Score 4 or 5 (doing well)" },
  ];
  if (fmt === "multiple_choice") return [
    { value: "always", label: "Any answer" },
    ...(choices || []).map((c, i) => ({ value: `choice_${i}`, label: `"${c.trim() || "Choice " + (i+1)}"` })),
  ];
  if (fmt === "yes_no") return [
    { value: "always", label: "Any answer" },
    { value: "yes", label: "Student answers Yes" },
    { value: "no", label: "Student answers No" },
  ];
  return [{ value: "always", label: "Always (after they respond)" }];
}

function ciRecommendItems(type, content) {
  const map = {
    skill: content.skills,
    project: content.projects,
    gig: content.gigs,
    ripple: content.ripple,
    lightroom: content.lightRoom,
    teensguide: content.teensGuide,
  };
  return (map[type] || []).map(i => ({ value: i.id, label: i.name || i.title || "Untitled" }));
}

function ciIsScheduledToday(ci) {
  const today = todayStr();
  const dayOfWeek = new Date().getDay();
  if (ci.scheduleType === "specific_dates") return (ci.specificDates || []).includes(today);
  if (ci.scheduleType === "weekly") return (ci.scheduleDays || []).includes(dayOfWeek);
  return false;
}

function ciEvaluateRule(rule, answer, fmt) {
  const t = rule.trigger;
  if (t === "always") return true;
  if (fmt === "scale_1_5") {
    const v = parseInt(answer);
    if (t === "scale_lte_2") return v <= 2;
    if (t === "scale_eq_3") return v === 3;
    if (t === "scale_gte_4") return v >= 4;
  }
  if (fmt === "multiple_choice" && t.startsWith("choice_")) return answer === parseInt(t.split("_")[1]);
  if (fmt === "yes_no") return answer === t;
  return false;
}

// ─── TEACHER: CHECK-IN MANAGER ────────────────────────────────────────────────

function CheckInManager({ checkIns, setCheckIns, content }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});
  const [rules, setRules] = useState([]);
  const [choicesText, setChoicesText] = useState("");

  const blankForm = () => ({
    type: "question", icon: "💬", title: "", subtitle: "",
    answerFormat: "scale_1_5", factContent: "",
    scheduleType: "weekly", scheduleDays: [1,2,3,4,5], specificDatesText: "",
  });

  const openNew = () => {
    setEditingId(null);
    setForm(blankForm());
    setChoicesText("Option A\nOption B\nOption C\nOption D");
    setRules([]);
    setShowForm(true);
  };

  const openEdit = (ci) => {
    setEditingId(ci.id);
    setForm({ ...ci, specificDatesText: (ci.specificDates || []).join(", ") });
    setChoicesText((ci.choices || []).join("\n"));
    setRules(ci.routing || []);
    setShowForm(true);
  };

  const save = () => {
    if (!form.title?.trim()) return;
    const item = {
      id: editingId || ("ci_" + Date.now()),
      type: form.type || "question",
      icon: form.icon || "💬",
      title: form.title,
      subtitle: form.subtitle || "",
      answerFormat: form.answerFormat || "scale_1_5",
      factContent: form.factContent || "",
      choices: form.answerFormat === "multiple_choice" ? choicesText.split("\n").map(s => s.trim()).filter(Boolean) : [],
      scheduleType: form.scheduleType || "weekly",
      scheduleDays: form.scheduleType === "weekly" ? (form.scheduleDays || []) : [],
      specificDates: form.scheduleType === "specific_dates"
        ? (form.specificDatesText || "").split(",").map(s => s.trim()).filter(Boolean)
        : [],
      routing: rules,
    };
    setCheckIns(prev => editingId ? prev.map(x => x.id === editingId ? item : x) : [...prev, item]);
    setShowForm(false);
  };

  const del = (id) => setCheckIns(prev => prev.filter(x => x.id !== id));

  const toggleDay = (d) => setForm(p => ({
    ...p,
    scheduleDays: (p.scheduleDays || []).includes(d)
      ? (p.scheduleDays || []).filter(x => x !== d)
      : [...(p.scheduleDays || []), d],
  }));

  const addRule = () => setRules(prev => [...prev, { id: "r" + Date.now(), trigger: "always", message: "", recommendType: "none", recommendId: "" }]);
  const updateRule = (id, k, v) => setRules(prev => prev.map(r => r.id === id ? { ...r, [k]: v } : r));
  const removeRule = (id) => setRules(prev => prev.filter(r => r.id !== id));

  const currentChoices = choicesText.split("\n").map(s => s.trim()).filter(Boolean);

  const scheduleSummary = (ci) => {
    if (ci.scheduleType === "specific_dates") {
      const n = (ci.specificDates || []).length;
      return `${n} specific date${n !== 1 ? "s" : ""}`;
    }
    const days = (ci.scheduleDays || []).sort().map(d => CI_WEEK_DAYS[d]).join(", ");
    return days || "No days selected";
  };

  const colorOf = (type) => (CI_TYPES.find(t => t.value === type) || CI_TYPES[3]).color;

  return (
    <div>
      <div className="page-header">
        <div className="flex-between">
          <div>
            <h1 className="page-title">💬 Check-Ins</h1>
            <p className="page-sub">{checkIns.length} check-in{checkIns.length !== 1 ? "s" : ""} · Scheduled pop-ups shown to students on specific days</p>
          </div>
          <button className="btn btn-primary" onClick={openNew}>+ New Check-In</button>
        </div>
      </div>

      <div className="page-content">
        {checkIns.length === 0 ? (
          <div>
            <EmptyState icon="💬" title="No check-ins yet" sub="Create your first check-in to start getting insights from students on scheduled days." />
            <div className="card mt-16" style={{ background: "var(--bg3)", maxWidth: 620 }}>
              <div style={{ fontWeight: 700, color: "var(--amber)", marginBottom: 8, fontSize: 14 }}>What are Check-Ins?</div>
              <p style={{ fontSize: 13, color: "var(--cream-dim)", lineHeight: 1.8 }}>
                Check-ins are small pop-up cards that greet students on scheduled days. They can be a mood check, a skill self-assessment, a fun fact, or an open question.
                Based on the student's answer, you can automatically route them to a specific skill, project, gig, or resource — or keep it simple with no routing at all.
              </p>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {checkIns.map(ci => {
              const typeInfo = CI_TYPES.find(t => t.value === ci.type) || CI_TYPES[3];
              const fmtInfo = CI_ANSWER_FORMATS.find(f => f.value === ci.answerFormat) || CI_ANSWER_FORMATS[0];
              const C = typeInfo.color;
              return (
                <div key={ci.id} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: "18px 20px", display: "flex", alignItems: "flex-start", gap: 16, transition: "border 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = `var(--${C})`}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: `var(--${C}-dim)`, border: `2px solid var(--${C})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>
                    {ci.icon || typeInfo.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--cream)", marginBottom: 5 }}>{ci.title}</div>
                    {ci.subtitle && <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>{ci.subtitle}</div>}
                    <div className="flex gap-6 flex-wrap">
                      <span className={`tag tag-${C}`}>{typeInfo.icon} {typeInfo.label}</span>
                      <span className="tag tag-muted">{fmtInfo.label}</span>
                      <span className="tag tag-muted">📅 {scheduleSummary(ci)}</span>
                      {(ci.routing || []).length > 0 && (
                        <span className="tag tag-amber">↗ {ci.routing.length} route{ci.routing.length !== 1 ? "s" : ""}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-8">
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(ci)}>Edit</button>
                    <button className="btn btn-clay btn-sm" onClick={() => del(ci.id)}>✕</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)}
        title={editingId ? "Edit Check-In" : "New Check-In"}
        size="modal-lg"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={save} disabled={!form.title?.trim()}>Save Check-In</button>
          </>
        }>

        {/* TYPE */}
        <div className="form-row">
          <label className="label">Type</label>
          <div className="flex gap-6 flex-wrap">
            {CI_TYPES.map(t => (
              <button key={t.value} className={`filter-btn ${form.type === t.value ? "active" : ""}`}
                onClick={() => setForm(p => ({ ...p, type: t.value }))}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "72px 1fr", gap: 12, marginBottom: 14 }}>
          <div>
            <label className="label">Icon</label>
            <input className="input" value={form.icon || ""} onChange={e => setForm(p => ({ ...p, icon: e.target.value }))}
              placeholder="💬" maxLength={4} style={{ fontSize: 22, textAlign: "center", padding: "8px 6px" }} />
          </div>
          <div>
            <label className="label">Question / Prompt *</label>
            <input className="input" value={form.title || ""} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="e.g. How are you feeling today? · Did you know that…" autoFocus />
          </div>
        </div>

        <div className="form-row">
          <label className="label">Subtitle / Context (optional)</label>
          <input className="input" value={form.subtitle || ""} onChange={e => setForm(p => ({ ...p, subtitle: e.target.value }))}
            placeholder="e.g. Be honest — this is just for you. No wrong answers." />
        </div>

        {/* ANSWER FORMAT */}
        <div className="form-row">
          <label className="label">Answer Format</label>
          <div className="flex gap-6 flex-wrap">
            {CI_ANSWER_FORMATS.map(f => (
              <button key={f.value} className={`filter-btn ${form.answerFormat === f.value ? "active" : ""}`}
                onClick={() => setForm(p => ({ ...p, answerFormat: f.value }))}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {form.answerFormat === "multiple_choice" && (
          <div className="form-row">
            <label className="label">Answer Choices (one per line, up to 5)</label>
            <textarea className="input textarea" style={{ minHeight: 100 }} value={choicesText}
              onChange={e => setChoicesText(e.target.value)}
              placeholder={"Great!\nPretty good\nOkay\nNot so great\nStruggling"} />
          </div>
        )}

        {form.answerFormat === "scale_1_5" && (
          <div style={{ padding: "12px 14px", background: "var(--bg3)", borderRadius: "var(--r)", marginBottom: 14, fontSize: 12, color: "var(--muted)", lineHeight: 1.6 }}>
            Students will see five circles numbered 1–5 to tap. 1 = low, 5 = high. Use the routing rules below to respond differently based on their score.
          </div>
        )}

        {form.answerFormat === "none" && (
          <div className="form-row">
            <label className="label">Fact / Announcement Content</label>
            <textarea className="input textarea" value={form.factContent || ""} onChange={e => setForm(p => ({ ...p, factContent: e.target.value }))}
              placeholder="Write the fact, announcement, or message here. Students will tap 'Got it' — no response required." />
          </div>
        )}

        <div className="divider" />

        {/* SCHEDULE */}
        <div style={{ marginBottom: 14 }}>
          <label className="label">Schedule</label>
          <div className="flex gap-8 mb-12">
            {[["weekly", "🔁 Repeat weekly"], ["specific_dates", "📅 Specific dates"]].map(([val, label]) => (
              <button key={val} className={`filter-btn ${form.scheduleType === val ? "active" : ""}`}
                onClick={() => setForm(p => ({ ...p, scheduleType: val }))}>
                {label}
              </button>
            ))}
          </div>

          {form.scheduleType === "weekly" && (
            <div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>Show on these days each week:</div>
              <div className="flex gap-6">
                {CI_WEEK_DAYS.map((d, i) => {
                  const selected = (form.scheduleDays || []).includes(i);
                  return (
                    <button key={i} onClick={() => toggleDay(i)} style={{
                      width: 42, height: 42, borderRadius: "var(--r)",
                      border: `2px solid ${selected ? "var(--amber)" : "var(--border)"}`,
                      background: selected ? "var(--amber-dim)" : "var(--bg3)",
                      color: selected ? "var(--amber)" : "var(--muted)",
                      cursor: "pointer", fontSize: 11, fontWeight: 700,
                      fontFamily: "var(--font-body)", transition: "all 0.15s",
                    }}>{d.slice(0, 2)}</button>
                  );
                })}
              </div>
            </div>
          )}

          {form.scheduleType === "specific_dates" && (
            <div>
              <label className="label">Dates (YYYY-MM-DD, comma-separated)</label>
              <input className="input" value={form.specificDatesText || ""}
                onChange={e => setForm(p => ({ ...p, specificDatesText: e.target.value }))}
                placeholder="e.g. 2026-04-07, 2026-04-14, 2026-04-21" />
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>Pop-up will appear on those exact dates.</div>
            </div>
          )}
        </div>

        {form.answerFormat !== "none" && (
          <>
            <div className="divider" />

            {/* ROUTING RULES */}
            <div>
              <div className="flex-between mb-10">
                <div>
                  <div className="label" style={{ marginBottom: 2 }}>Smart Routing — optional</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>
                    Recommend specific content to students based on how they answer
                  </div>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={addRule}>+ Add Route</button>
              </div>

              {rules.length === 0 ? (
                <div style={{ padding: "16px", background: "var(--bg3)", borderRadius: "var(--r)", fontSize: 13, color: "var(--muted)", textAlign: "center" }}>
                  No routing rules yet — responses will just be acknowledged.
                </div>
              ) : rules.map((rule, ri) => {
                const triggerOpts = ciTriggerOptions(form.answerFormat, currentChoices);
                const recommendItems = ciRecommendItems(rule.recommendType, content);
                return (
                  <div key={rule.id} style={{ background: "var(--bg3)", borderRadius: "var(--r-lg)", padding: "16px", marginBottom: 12, border: "1px solid var(--border)" }}>
                    <div className="flex-between mb-12">
                      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--amber)", textTransform: "uppercase", letterSpacing: 1 }}>Route {ri + 1}</span>
                      <button className="btn btn-clay btn-xs" onClick={() => removeRule(rule.id)}>Remove</button>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                      <div>
                        <label className="label">When student…</label>
                        <select className="input" value={rule.trigger || "always"} onChange={e => updateRule(rule.id, "trigger", e.target.value)}>
                          {triggerOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="label">Recommend a…</label>
                        <select className="input" value={rule.recommendType || "none"} onChange={e => updateRule(rule.id, "recommendType", e.target.value)}>
                          {[
                            { value: "none", label: "— Message only (no item) —" },
                            { value: "skill", label: "Skill" },
                            { value: "project", label: "Project" },
                            { value: "gig", label: "Gig" },
                            { value: "ripple", label: "Ripple Mission" },
                            { value: "lightroom", label: "Light Room entry" },
                            { value: "teensguide", label: "Teen's Guide entry" },
                          ].map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>
                    </div>

                    {rule.recommendType !== "none" && (
                      <div className="form-row">
                        <label className="label">Specific Item</label>
                        <select className="input" value={rule.recommendId || ""} onChange={e => updateRule(rule.id, "recommendId", e.target.value)}>
                          <option value="">— Select an item —</option>
                          {recommendItems.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="label">Message to show student</label>
                      <input className="input" value={rule.message || ""} onChange={e => updateRule(rule.id, "message", e.target.value)}
                        placeholder="e.g. Sounds like you could use something grounding. Try this:" />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}

// ─── STUDENT: CHECK-IN POPUP ──────────────────────────────────────────────────

function CheckInPopup({ checkIns, content, seenToday, onSeen, onNavigate }) {
  const pending = (checkIns || []).filter(ci => ciIsScheduledToday(ci) && !seenToday.includes(ci.id));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answer, setAnswer] = useState(null);
  const [textAnswer, setTextAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [matchedRules, setMatchedRules] = useState([]);

  if (pending.length === 0 || currentIdx >= pending.length) return null;
  const ci = pending[currentIdx];

  const typeInfo = CI_TYPES.find(t => t.value === ci.type) || CI_TYPES[3];
  const C = typeInfo.color;

  const handleSubmit = () => {
    const ans = ci.answerFormat === "text" ? textAnswer : answer;
    const matched = (ci.routing || []).filter(r => ciEvaluateRule(r, ans, ci.answerFormat));
    setMatchedRules(matched);
    setSubmitted(true);
  };

  const advance = () => {
    onSeen(ci.id);
    setAnswer(null);
    setTextAnswer("");
    setSubmitted(false);
    setMatchedRules([]);
    setCurrentIdx(i => i + 1);
  };

  const handleNavigate = (rule) => {
    const viewMap = { skill: "skills", project: "projects", gig: "factions", ripple: "ripple", lightroom: "lightroom", teensguide: "teensguide" };
    if (rule.recommendType && rule.recommendType !== "none" && viewMap[rule.recommendType]) {
      onNavigate(viewMap[rule.recommendType]);
    }
    advance();
  };

  const getRecommendedItem = (rule) => {
    if (!rule.recommendId || !rule.recommendType || rule.recommendType === "none") return null;
    const map = { skill: content.skills, project: content.projects, gig: content.gigs, ripple: content.ripple, lightroom: content.lightRoom, teensguide: content.teensGuide };
    return (map[rule.recommendType] || []).find(i => i.id === rule.recommendId) || null;
  };

  const canSubmit = () => {
    if (ci.answerFormat === "none") return true;
    if (ci.answerFormat === "text") return textAnswer.trim().length > 0;
    return answer !== null;
  };

  const isLast = currentIdx + 1 >= pending.length;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{
        background: "var(--bg2)",
        border: `2px solid var(--${C})`,
        borderRadius: 20,
        width: "100%",
        maxWidth: 460,
        boxShadow: "0 32px 80px rgba(0,0,0,0.8)",
        overflow: "hidden",
      }}>
        {/* Header strip */}
        <div style={{ background: `var(--${C}-dim)`, borderBottom: `1px solid var(--border)`, padding: "20px 24px", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "var(--bg2)", border: `2px solid var(--${C})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0 }}>
            {ci.icon || typeInfo.icon}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase", color: `var(--${C})`, marginBottom: 4 }}>{typeInfo.label}</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--cream)", lineHeight: 1.3 }}>{ci.title}</div>
          </div>
          {pending.length > 1 && (
            <div style={{ fontSize: 11, color: "var(--muted)", flexShrink: 0 }}>{currentIdx + 1} / {pending.length}</div>
          )}
        </div>

        <div style={{ padding: "22px 24px" }}>
          {ci.subtitle && (
            <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.65, marginBottom: 20, fontStyle: "italic" }}>{ci.subtitle}</p>
          )}

          {!submitted ? (
            <>
              {/* SCALE 1–5 */}
              {ci.answerFormat === "scale_1_5" && (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 8 }}>
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n} onClick={() => setAnswer(n)} style={{
                        width: 56, height: 56, borderRadius: "50%",
                        border: `2px solid ${answer === n ? `var(--${C})` : "var(--border)"}`,
                        background: answer === n ? `var(--${C}-dim)` : "var(--bg3)",
                        color: answer === n ? `var(--${C})` : "var(--cream-dim)",
                        fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700,
                        cursor: "pointer", transition: "all 0.15s",
                        transform: answer === n ? "scale(1.12)" : "scale(1)",
                      }}>{n}</button>
                    ))}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--muted)", padding: "0 4px" }}>
                    <span>Not great</span><span>Doing great</span>
                  </div>
                </div>
              )}

              {/* YES / NO */}
              {ci.answerFormat === "yes_no" && (
                <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
                  {["yes", "no"].map(opt => (
                    <button key={opt} onClick={() => setAnswer(opt)} style={{
                      flex: 1, padding: "16px", borderRadius: "var(--r-lg)",
                      border: `2px solid ${answer === opt ? `var(--${C})` : "var(--border)"}`,
                      background: answer === opt ? `var(--${C}-dim)` : "var(--bg3)",
                      color: answer === opt ? `var(--${C})` : "var(--cream-dim)",
                      fontFamily: "var(--font-body)", fontSize: 15, fontWeight: 700,
                      cursor: "pointer", transition: "all 0.15s",
                    }}>{opt === "yes" ? "👍 Yes" : "👎 No"}</button>
                  ))}
                </div>
              )}

              {/* MULTIPLE CHOICE */}
              {ci.answerFormat === "multiple_choice" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
                  {(ci.choices || []).map((choice, i) => (
                    <button key={i} onClick={() => setAnswer(i)} style={{
                      padding: "13px 16px", borderRadius: "var(--r)",
                      border: `2px solid ${answer === i ? `var(--${C})` : "var(--border)"}`,
                      background: answer === i ? `var(--${C}-dim)` : "var(--bg3)",
                      color: answer === i ? `var(--${C})` : "var(--cream-dim)",
                      fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 500,
                      cursor: "pointer", transition: "all 0.15s", textAlign: "left",
                      display: "flex", alignItems: "center", gap: 12,
                    }}>
                      <span style={{
                        width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                        border: `2px solid ${answer === i ? `var(--${C})` : "var(--border)"}`,
                        background: answer === i ? `var(--${C})` : "transparent",
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.15s",
                      }}>
                        {answer === i && <span style={{ color: "#0c0c16", fontSize: 9, fontWeight: 900 }}>✓</span>}
                      </span>
                      {choice}
                    </button>
                  ))}
                </div>
              )}

              {/* FREE TEXT */}
              {ci.answerFormat === "text" && (
                <div style={{ marginBottom: 24 }}>
                  <textarea className="input textarea" value={textAnswer} onChange={e => setTextAnswer(e.target.value)}
                    placeholder="Write your answer here…" style={{ minHeight: 110 }} autoFocus />
                </div>
              )}

              {/* FACT / NO RESPONSE */}
              {ci.answerFormat === "none" && (
                <div style={{ padding: "16px 18px", background: "var(--bg3)", border: `1px solid var(--${C})`, borderRadius: "var(--r-lg)", marginBottom: 24, fontSize: 14, color: "var(--cream-dim)", lineHeight: 1.8 }}>
                  {ci.factContent || ci.title}
                </div>
              )}

              <button className="btn btn-primary" style={{ width: "100%", padding: "13px" }} onClick={handleSubmit} disabled={!canSubmit()}>
                {ci.answerFormat === "none" ? "Got it! 👋" : "Submit →"}
              </button>
              <button className="btn btn-ghost btn-sm" style={{ width: "100%", marginTop: 8 }}
                onClick={advance}>
                Skip for now
              </button>
            </>
          ) : (
            /* POST-SUBMISSION */
            <>
              <div style={{ textAlign: "center", padding: "4px 0 22px" }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>✓</div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--cream)" }}>
                  {ci.answerFormat === "none" ? "Noted!" : "Thanks for sharing!"}
                </div>
              </div>

              {/* Routing recommendations */}
              {matchedRules.filter(r => r.recommendType !== "none" && r.recommendId).map(rule => {
                const item = getRecommendedItem(rule);
                const typeLabels = { skill: "Skill", project: "Project", gig: "Gig", ripple: "Ripple Mission", lightroom: "Light Room", teensguide: "Teen's Guide" };
                if (!item) return null;
                return (
                  <div key={rule.id} style={{ background: "var(--bg3)", border: `1px solid var(--${C})`, borderRadius: "var(--r-lg)", padding: "16px 18px", marginBottom: 12 }}>
                    {rule.message && (
                      <p style={{ fontSize: 13, color: "var(--cream-dim)", lineHeight: 1.65, marginBottom: 14 }}>{rule.message}</p>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "var(--bg2)", borderRadius: "var(--r)", border: "1px solid var(--border)" }}>
                      <span style={{ fontSize: 22, flexShrink: 0 }}>{item.icon || "◈"}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: `var(--${C})`, fontWeight: 700, marginBottom: 2 }}>
                          {typeLabels[rule.recommendType]}
                        </div>
                        <div style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "var(--cream)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {item.name || item.title}
                        </div>
                      </div>
                      <button className="btn btn-primary btn-sm" onClick={() => handleNavigate(rule)}>Go →</button>
                    </div>
                  </div>
                );
              })}

              {/* Message-only rules */}
              {matchedRules.filter(r => r.message && (r.recommendType === "none" || !r.recommendId)).map(rule => (
                <div key={rule.id + "_m"} style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "var(--r)", padding: "14px 16px", marginBottom: 10, fontSize: 13, color: "var(--cream-dim)", lineHeight: 1.65 }}>
                  {rule.message}
                </div>
              ))}

              <button className="btn btn-ghost" style={{ width: "100%", marginTop: 4 }} onClick={advance}>
                {isLast ? "Close" : "Next →"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── STUDENT LOGIN ────────────────────────────────────────────────────────────

function StudentLogin({ accounts, onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    const acct = accounts.find(
      a => a.username.toLowerCase() === username.trim().toLowerCase() && a.password === password
    );
    if (acct) { setError(""); onLogin(acct); }
    else setError("Username or password doesn't match. Ask your teacher if you need help.");
  };

  return (
    <div className="onboard-wrap">
      <div className="onboard-card" style={{ maxWidth: 440 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 42, fontWeight: 900, color: "var(--amber)", letterSpacing: -2, marginBottom: 6 }}>Forge</div>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>Student Login</div>
        </div>
        <div className="form-row">
          <label className="label">Username</label>
          <input className="input" value={username} onChange={e => setUsername(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            placeholder="Enter your username" autoFocus />
        </div>
        <div className="form-row">
          <label className="label">Password</label>
          <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleLogin()}
            placeholder="Enter your password" />
        </div>
        {error && (
          <div style={{ padding: "10px 14px", background: "var(--clay-dim)", border: "1px solid rgba(200,112,96,0.4)", borderRadius: "var(--r)", fontSize: 13, color: "var(--clay)", marginBottom: 14, lineHeight: 1.5 }}>
            {error}
          </div>
        )}
        <button className="btn btn-primary" style={{ width: "100%", padding: "13px" }}
          onClick={handleLogin} disabled={!username.trim() || !password.trim()}>
          Log In →
        </button>
      </div>
    </div>
  );
}

// ─── TEACHER: STUDENT ACCOUNTS ────────────────────────────────────────────────

function TeacherStudentAccounts({ accounts = [], setAccounts }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", username: "", password: "" });
  const [showPasswords, setShowPasswords] = useState({});

  const openNew = () => {
    setEditingId(null);
    setForm({ name: "", username: "", password: "" });
    setShowForm(true);
  };

  const openEdit = (acct) => {
    setEditingId(acct.id);
    setForm({ name: acct.name, username: acct.username, password: acct.password });
    setShowForm(true);
  };

  const save = () => {
    if (!form.name.trim() || !form.username.trim() || !form.password.trim()) return;
    if (editingId) {
      setAccounts(prev => prev.map(a => a.id === editingId ? { ...a, ...form } : a));
    } else {
      setAccounts(prev => [...prev, { id: "sa" + Date.now(), ...form, profileAnswers: {}, points: 0, completed: [] }]);
    }
    setShowForm(false);
  };

  const del = (id) => setAccounts(prev => prev.filter(a => a.id !== id));

  const toggleShowPw = (id) => setShowPasswords(p => ({ ...p, [id]: !p[id] }));

  const avatarColors = ["var(--amber)", "var(--sage)", "var(--sky)", "var(--lavender)", "var(--clay)"];

  return (
    <div>
      <div className="page-header">
        <div className="flex-between">
          <div>
            <h1 className="page-title">🔑 Student Accounts</h1>
            <p className="page-sub">{accounts.length} student account{accounts.length !== 1 ? "s" : ""} · Students log in from the Student role selector</p>
          </div>
          <button className="btn btn-primary" onClick={openNew}>+ Add Account</button>
        </div>
      </div>

      <div className="page-content">
        {accounts.length === 0 ? (
          <EmptyState icon="🔑" title="No accounts yet" sub="Add student accounts so students can log in without the onboarding questionnaire." />
        ) : (
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", overflow: "hidden" }}>
            {accounts.map((acct, i) => (
              <div key={acct.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", borderBottom: i < accounts.length - 1 ? "1px solid var(--border)" : "none" }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: avatarColors[i % avatarColors.length], display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: "#0c0c16", flexShrink: 0 }}>
                  {acct.name?.[0] || "?"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "var(--cream)", marginBottom: 4 }}>{acct.name}</div>
                  <div className="flex gap-12 flex-wrap" style={{ fontSize: 12, color: "var(--muted)" }}>
                    <span>@{acct.username}</span>
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {showPasswords[acct.id] ? acct.password : "••••••••"}
                      <button onClick={() => toggleShowPw(acct.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "var(--muted)", padding: 0 }}>
                        {showPasswords[acct.id] ? "hide" : "show"}
                      </button>
                    </span>
                    {acct.points > 0 && <span className="pts-badge">{acct.points} pts</span>}
                    {(acct.completed || []).length > 0 && <span style={{ color: "var(--sage)" }}>✓ {acct.completed.length} completed</span>}
                  </div>
                </div>
                <div className="flex gap-8">
                  <button className="btn btn-ghost btn-sm" onClick={() => openEdit(acct)}>Edit</button>
                  <button className="btn btn-clay btn-sm" onClick={() => del(acct.id)}>✕</button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="card mt-20" style={{ background: "var(--bg3)", maxWidth: 560 }}>
          <div style={{ fontWeight: 700, color: "var(--amber)", marginBottom: 6, fontSize: 13 }}>How it works</div>
          <p style={{ fontSize: 13, color: "var(--cream-dim)", lineHeight: 1.8 }}>
            Students select "Student" on the home screen and log in with their username and password. Their profile, progress, and points are saved to their account. Profile questions are in the My Profile section — students can fill them in at their own pace.
          </p>
        </div>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)}
        title={editingId ? "Edit Account" : "New Student Account"}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={save} disabled={!form.name.trim() || !form.username.trim() || !form.password.trim()}>
              {editingId ? "Save Changes" : "Create Account"}
            </button>
          </>
        }>
        <div className="form-row">
          <label className="label">Student's Name</label>
          <input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            placeholder="e.g. Emma" autoFocus />
        </div>
        <div className="form-row">
          <label className="label">Username</label>
          <input className="input" value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value.replace(/\s/g, "") }))}
            placeholder="e.g. emma (no spaces)" />
        </div>
        <div className="form-row">
          <label className="label">Password</label>
          <input className="input" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
            placeholder="Something simple they'll remember" />
        </div>
        <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6 }}>
          Passwords are stored in plain text in this prototype — keep them simple and family-friendly.
        </div>
      </Modal>
    </div>
  );
}

// ─── TEACHER: PROFILE QUESTIONS MANAGER ──────────────────────────────────────

const PQ_TYPES = [
  { value: "text",          label: "Short Answer",     icon: "✏️" },
  { value: "textarea",      label: "Long Answer",       icon: "📝" },
  { value: "single_choice", label: "Single Choice",     icon: "◉" },
  { value: "multi_choice",  label: "Multi Choice",      icon: "☑️" },
  { value: "interests",     label: "Interests Picker",  icon: "💡" },
  { value: "strengths",     label: "Strengths Picker",  icon: "💪" },
];

function pqRouteTriggerOptions(type, options) {
  if (type === "single_choice" || type === "multi_choice") {
    return [
      { value: "always", label: "Any answer" },
      ...(options || []).map((o, i) => ({ value: `opt_${i}`, label: `"${o.trim() || "Option " + (i + 1)}"` })),
    ];
  }
  if (type === "interests") return [{ value: "always", label: "Always (after they save)" }];
  if (type === "strengths") return [{ value: "always", label: "Always (after they save)" }];
  return [{ value: "always", label: "Always (after they save)" }];
}

function ProfileQuestionsManager({ questions = [], setQuestions, content }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});
  const [optionsText, setOptionsText] = useState("");
  const [rules, setRules] = useState([]);

  const blank = () => ({ question: "", type: "text", placeholder: "", required: false });

  const openNew = () => {
    setEditingId(null);
    setForm(blank());
    setOptionsText("Option A\nOption B\nOption C");
    setRules([]);
    setShowForm(true);
  };

  const openEdit = (q) => {
    setEditingId(q.id);
    setForm({ question: q.question, type: q.type, placeholder: q.placeholder || "", required: q.required || false });
    setOptionsText((q.options || []).join("\n"));
    setRules(q.routing || []);
    setShowForm(true);
  };

  const save = () => {
    if (!form.question?.trim()) return;
    const item = {
      id: editingId || ("pq_" + Date.now()),
      question: form.question,
      type: form.type || "text",
      placeholder: form.placeholder || "",
      required: form.required || false,
      options: (form.type === "single_choice" || form.type === "multi_choice")
        ? optionsText.split("\n").map(s => s.trim()).filter(Boolean)
        : [],
      routing: rules,
    };
    setQuestions(prev => editingId ? prev.map(q => q.id === editingId ? item : q) : [...prev, item]);
    setShowForm(false);
  };

  const del = (id) => setQuestions(prev => prev.filter(q => q.id !== id));

  const moveUp = (i) => setQuestions(prev => {
    const a = [...prev]; if (i === 0) return a;
    [a[i - 1], a[i]] = [a[i], a[i - 1]]; return a;
  });
  const moveDown = (i) => setQuestions(prev => {
    const a = [...prev]; if (i === a.length - 1) return a;
    [a[i], a[i + 1]] = [a[i + 1], a[i]]; return a;
  });

  const addRule = () => setRules(prev => [...prev, { id: "r" + Date.now(), trigger: "always", message: "", recommendType: "none", recommendId: "" }]);
  const updateRule = (id, k, v) => setRules(prev => prev.map(r => r.id === id ? { ...r, [k]: v } : r));
  const removeRule = (id) => setRules(prev => prev.filter(r => r.id !== id));

  const currentOptions = optionsText.split("\n").map(s => s.trim()).filter(Boolean);
  const typeInfo = (type) => PQ_TYPES.find(t => t.value === type) || PQ_TYPES[0];

  return (
    <div>
      <div className="page-header">
        <div className="flex-between">
          <div>
            <h1 className="page-title">📝 Profile Questions</h1>
            <p className="page-sub">{questions.length} question{questions.length !== 1 ? "s" : ""} · Students fill these in from My Profile at their own pace</p>
          </div>
          <button className="btn btn-primary" onClick={openNew}>+ Add Question</button>
        </div>
      </div>

      <div className="page-content">
        {questions.length === 0 ? (
          <EmptyState icon="📝" title="No profile questions" sub="Add questions to learn about your students and optionally route them to content based on their answers." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {questions.map((q, i) => {
              const ti = typeInfo(q.type);
              return (
                <div key={q.id} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: "16px 20px", display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "var(--r)", background: "var(--amber-dim)", border: "1px solid rgba(0,212,255,0.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0, marginTop: 2 }}>
                    {ti.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "var(--cream)", marginBottom: 5, lineHeight: 1.3 }}>{q.question}</div>
                    <div className="flex gap-6 flex-wrap">
                      <span className="tag tag-amber">{ti.label}</span>
                      {q.required && <span className="tag tag-clay">Required</span>}
                      {(q.routing || []).length > 0 && <span className="tag tag-sage">↗ {q.routing.length} route{q.routing.length !== 1 ? "s" : ""}</span>}
                      {(q.options || []).length > 0 && <span className="tag tag-muted">{q.options.length} options</span>}
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button className="btn btn-ghost btn-xs" onClick={() => moveUp(i)} disabled={i === 0} style={{ opacity: i === 0 ? 0.3 : 1 }}>↑</button>
                    <button className="btn btn-ghost btn-xs" onClick={() => moveDown(i)} disabled={i === questions.length - 1} style={{ opacity: i === questions.length - 1 ? 0.3 : 1 }}>↓</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(q)}>Edit</button>
                    <button className="btn btn-clay btn-sm" onClick={() => del(q.id)}>✕</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="card mt-20" style={{ background: "var(--bg3)", maxWidth: 620 }}>
          <div style={{ fontWeight: 700, color: "var(--amber)", marginBottom: 6, fontSize: 13 }}>How profile questions work</div>
          <p style={{ fontSize: 13, color: "var(--cream-dim)", lineHeight: 1.8 }}>
            Students see these questions in their My Profile page. They can fill them in and update them any time — there's no pressure to answer everything at once. You can optionally add routing rules to each question: when a student selects a specific answer, Forge will recommend a skill, project, gig, or other content to them.
          </p>
        </div>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)}
        title={editingId ? "Edit Question" : "New Profile Question"}
        size="modal-lg"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={save} disabled={!form.question?.trim()}>Save Question</button>
          </>
        }>

        <div className="form-row">
          <label className="label">Question Text *</label>
          <input className="input" value={form.question || ""} onChange={e => setForm(p => ({ ...p, question: e.target.value }))}
            placeholder="e.g. What's one thing you want to get better at this year?" autoFocus />
        </div>

        <div className="form-row">
          <label className="label">Answer Type</label>
          <div className="flex gap-6 flex-wrap">
            {PQ_TYPES.map(t => (
              <button key={t.value} className={`filter-btn ${form.type === t.value ? "active" : ""}`}
                onClick={() => setForm(p => ({ ...p, type: t.value }))}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>

        {(form.type === "text" || form.type === "textarea") && (
          <div className="form-row">
            <label className="label">Placeholder Text (optional)</label>
            <input className="input" value={form.placeholder || ""} onChange={e => setForm(p => ({ ...p, placeholder: e.target.value }))}
              placeholder="Hint shown inside the input field" />
          </div>
        )}

        {(form.type === "single_choice" || form.type === "multi_choice") && (
          <div className="form-row">
            <label className="label">Options (one per line)</label>
            <textarea className="input textarea" style={{ minHeight: 100 }} value={optionsText}
              onChange={e => setOptionsText(e.target.value)}
              placeholder={"Option A\nOption B\nOption C"} />
          </div>
        )}

        {form.type === "interests" && (
          <div style={{ padding: "12px 14px", background: "var(--bg3)", borderRadius: "var(--r)", marginBottom: 14, fontSize: 12, color: "var(--muted)", lineHeight: 1.6 }}>
            Students will see the full interests picker (same as the original onboarding). Their selected interests will also power the "My Interests ✦" filter in the Skill Explorer.
          </div>
        )}

        {form.type === "strengths" && (
          <div style={{ padding: "12px 14px", background: "var(--bg3)", borderRadius: "var(--r)", marginBottom: 14, fontSize: 12, color: "var(--muted)", lineHeight: 1.6 }}>
            Students will see the full strengths checklist (same as the original onboarding).
          </div>
        )}

        <div className="form-row">
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input type="checkbox" checked={form.required || false} onChange={e => setForm(p => ({ ...p, required: e.target.checked }))} />
            <span style={{ fontSize: 13, color: "var(--cream-dim)" }}>Mark as required (student must answer before saving profile)</span>
          </label>
        </div>

        <div className="divider" />

        <div>
          <div className="flex-between mb-10">
            <div>
              <div className="label" style={{ marginBottom: 2 }}>Routing Rules — optional</div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>Recommend specific content based on how the student answers</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={addRule}>+ Add Route</button>
          </div>

          {rules.length === 0 ? (
            <div style={{ padding: "14px", background: "var(--bg3)", borderRadius: "var(--r)", fontSize: 13, color: "var(--muted)", textAlign: "center" }}>
              No routing rules — answers will just be saved.
            </div>
          ) : rules.map((rule, ri) => {
            const triggerOpts = pqRouteTriggerOptions(form.type, currentOptions);
            const recItems = ciRecommendItems(rule.recommendType, content);
            return (
              <div key={rule.id} style={{ background: "var(--bg3)", borderRadius: "var(--r-lg)", padding: "16px", marginBottom: 10, border: "1px solid var(--border)" }}>
                <div className="flex-between mb-10">
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--amber)", textTransform: "uppercase", letterSpacing: 1 }}>Route {ri + 1}</span>
                  <button className="btn btn-clay btn-xs" onClick={() => removeRule(rule.id)}>Remove</button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                  <div>
                    <label className="label">When student selects…</label>
                    <select className="input" value={rule.trigger || "always"} onChange={e => updateRule(rule.id, "trigger", e.target.value)}>
                      {triggerOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Recommend a…</label>
                    <select className="input" value={rule.recommendType || "none"} onChange={e => updateRule(rule.id, "recommendType", e.target.value)}>
                      {[
                        { value: "none", label: "— Message only —" },
                        { value: "skill", label: "Skill" },
                        { value: "project", label: "Project" },
                        { value: "gig", label: "Gig" },
                        { value: "ripple", label: "Ripple Mission" },
                        { value: "lightroom", label: "Light Room entry" },
                        { value: "teensguide", label: "Teen's Guide entry" },
                      ].map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>
                {rule.recommendType !== "none" && (
                  <div className="form-row">
                    <label className="label">Specific Item</label>
                    <select className="input" value={rule.recommendId || ""} onChange={e => updateRule(rule.id, "recommendId", e.target.value)}>
                      <option value="">— Select —</option>
                      {recItems.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label className="label">Message to show student</label>
                  <input className="input" value={rule.message || ""} onChange={e => updateRule(rule.id, "message", e.target.value)}
                    placeholder="e.g. Based on your answer, you might love this:" />
                </div>
              </div>
            );
          })}
        </div>
      </Modal>
    </div>
  );
}

// ─── TEACHER: HABITS & CHORES MANAGER ────────────────────────────────────────

function TeacherHabitsManager({ habitDefs = [], setHabitDefs, studentAccounts = [] }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});

  const blank = () => ({ name: "", icon: "✅", type: "chore", scheduleDays: [0,1,2,3,4,5,6], assignedTo: "all", points: 1, notes: "" });

  const openNew = () => { setEditingId(null); setForm(blank()); setShowForm(true); };
  const openEdit = (h) => { setEditingId(h.id); setForm({ ...h }); setShowForm(true); };

  const save = () => {
    if (!form.name?.trim()) return;
    const item = { id: editingId || ("h_" + Date.now()), ...form, scheduleDays: form.scheduleDays || [0,1,2,3,4,5,6] };
    setHabitDefs(prev => editingId ? prev.map(x => x.id === editingId ? item : x) : [...prev, item]);
    setShowForm(false);
  };

  const del = (id) => setHabitDefs(prev => prev.filter(h => h.id !== id));

  const chores = habitDefs.filter(h => h.type === "chore");
  const habits = habitDefs.filter(h => h.type === "habit");

  const assignLabel = (a) => a === "all" ? "All Students" : (studentAccounts.find(s => s.id === a)?.name || a);

  return (
    <div>
      <div className="page-header">
        <div className="flex-between">
          <div>
            <h1 className="page-title">✅ Habits & Chores</h1>
            <p className="page-sub">{habitDefs.length} defined · Students check these off daily from their dashboard</p>
          </div>
          <button className="btn btn-primary" onClick={openNew}>+ Add New</button>
        </div>
      </div>
      <div className="page-content">
        {habitDefs.length === 0 ? (
          <EmptyState icon="✅" title="No habits or chores yet"
            sub="Create chores to assign to students, or habits to encourage. Both show up on the student dashboard as daily check-ins."
            action={<button className="btn btn-primary btn-sm" onClick={openNew}>+ Add First Item</button>} />
        ) : (
          <>
            {chores.length > 0 && (
              <div className="mb-24">
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "var(--clay)", marginBottom: 10 }}>🧹 Chores — Assigned</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {chores.map(h => (
                    <div key={h.id} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
                      <span style={{ fontSize: 22, flexShrink: 0 }}>{h.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: "var(--cream)", marginBottom: 4 }}>{h.name}</div>
                        <div className="flex gap-6 flex-wrap">
                          <span className="tag tag-clay">{(h.scheduleDays||[0,1,2,3,4,5,6]).length === 7 ? "Every day" : (h.scheduleDays||[]).map(d=>["Su","Mo","Tu","We","Th","Fr","Sa"][d]).join(", ")}</span>
                          <span className="tag tag-muted">👤 {assignLabel(h.assignedTo)}</span>
                          {h.points > 0 && <span className="pts-badge">+{h.points} pts</span>}
                        </div>
                      </div>
                      <div className="flex gap-8">
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(h)}>Edit</button>
                        <button className="btn btn-clay btn-sm" onClick={() => del(h.id)}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {habits.length > 0 && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "var(--sage)", marginBottom: 10 }}>🌱 Habits — Encouraged</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {habits.map(h => (
                    <div key={h.id} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
                      <span style={{ fontSize: 22, flexShrink: 0 }}>{h.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: "var(--cream)", marginBottom: 4 }}>{h.name}</div>
                        <div className="flex gap-6 flex-wrap">
                          <span className="tag tag-sage">{(h.scheduleDays||[0,1,2,3,4,5,6]).length === 7 ? "Every day" : (h.scheduleDays||[]).map(d=>["Su","Mo","Tu","We","Th","Fr","Sa"][d]).join(", ")}</span>
                          <span className="tag tag-muted">👤 {assignLabel(h.assignedTo)}</span>
                          {h.points > 0 && <span className="pts-badge">+{h.points} pts</span>}
                          {h.notes && <span style={{ fontSize: 11, color: "var(--muted)", fontStyle: "italic" }}>{h.notes}</span>}
                        </div>
                      </div>
                      <div className="flex gap-8">
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(h)}>Edit</button>
                        <button className="btn btn-clay btn-sm" onClick={() => del(h.id)}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)}
        title={editingId ? "Edit Item" : "New Habit or Chore"}
        footer={<><button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button><button className="btn btn-primary" onClick={save} disabled={!form.name?.trim()}>Save</button></>}>
        <div className="form-row">
          <label className="label">Type</label>
          <div className="flex gap-8">
            {[["chore","🧹 Chore","Assigned task, required"],["habit","🌱 Habit","Encouraged routine"]].map(([val,label,sub]) => (
              <div key={val} onClick={() => setForm(p => ({ ...p, type: val }))} style={{ flex: 1, padding: "12px 14px", borderRadius: "var(--r-lg)", border: `2px solid ${form.type === val ? (val === "chore" ? "var(--clay)" : "var(--sage)") : "var(--border)"}`, background: form.type === val ? (val === "chore" ? "var(--clay-dim)" : "var(--sage-dim)") : "var(--bg3)", cursor: "pointer", transition: "all 0.15s" }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: form.type === val ? (val === "chore" ? "var(--clay)" : "var(--sage)") : "var(--cream)" }}>{label}</div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "56px 1fr", gap: 10, marginBottom: 14 }}>
          <div>
            <label className="label">Icon</label>
            <input className="input" value={form.icon || ""} onChange={e => setForm(p => ({ ...p, icon: e.target.value }))} style={{ textAlign: "center", fontSize: 20, padding: "8px 4px" }} maxLength={4} />
          </div>
          <div>
            <label className="label">Name *</label>
            <input className="input" value={form.name || ""} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder={form.type === "chore" ? "e.g. Clean your room" : "e.g. Read for 20 minutes"} autoFocus />
          </div>
        </div>
        <div className="form-row">
          <label className="label">Schedule — show on these days</label>
          {/* Quick presets */}
          <div className="flex gap-6 mb-8 flex-wrap">
            {[
              ["Every day", [0,1,2,3,4,5,6]],
              ["Weekdays", [1,2,3,4,5]],
              ["Weekends", [0,6]],
              ["Mon / Wed / Fri", [1,3,5]],
              ["Tue / Thu", [2,4]],
            ].map(([label, days]) => (
              <button key={label} type="button" onClick={() => setForm(p => ({ ...p, scheduleDays: days }))}
                style={{ padding: "4px 10px", borderRadius: 20, border: `1px solid ${JSON.stringify((form.scheduleDays||[]).slice().sort()) === JSON.stringify([...days].sort()) ? (form.type === "chore" ? "var(--clay)" : "var(--sage)") : "var(--border)"}`, background: JSON.stringify((form.scheduleDays||[]).slice().sort()) === JSON.stringify([...days].sort()) ? (form.type === "chore" ? "var(--clay-dim)" : "var(--sage-dim)") : "var(--bg3)", color: "var(--cream-dim)", fontSize: 11, cursor: "pointer", fontFamily: "var(--font-body)", transition: "all 0.15s" }}>
                {label}
              </button>
            ))}
          </div>
          <div className="flex gap-6">
            {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d, i) => {
              const selected = (form.scheduleDays || []).includes(i);
              return (
                <button key={i} type="button" onClick={() => setForm(p => {
                  const days = p.scheduleDays || [];
                  return { ...p, scheduleDays: selected ? days.filter(x => x !== i) : [...days, i].sort() };
                })} style={{
                  width: 42, height: 42, borderRadius: "var(--r)",
                  border: `2px solid ${selected ? (form.type === "chore" ? "var(--clay)" : "var(--sage)") : "var(--border)"}`,
                  background: selected ? (form.type === "chore" ? "var(--clay-dim)" : "var(--sage-dim)") : "var(--bg3)",
                  color: selected ? (form.type === "chore" ? "var(--clay)" : "var(--sage)") : "var(--muted)",
                  cursor: "pointer", fontSize: 11, fontWeight: 700,
                  fontFamily: "var(--font-body)", transition: "all 0.15s",
                }}>{d}</button>
              );
            })}
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 6 }}>
            {(form.scheduleDays || []).length === 0 ? "⚠ No days selected — item won't appear on dashboard"
              : (form.scheduleDays || []).length === 7 ? "Every day"
              : (form.scheduleDays || []).map(d => ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][d]).join(", ")}
          </div>
        </div>
        <div className="form-row">
          <label className="label">Assign To</label>
          <select className="input" value={form.assignedTo || "all"} onChange={e => setForm(p => ({ ...p, assignedTo: e.target.value }))}>
            <option value="all">All Students</option>
            {studentAccounts.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="form-row">
          <label className="label">Points per completion</label>
          <input className="input" type="number" min="0" max="20" value={form.points ?? 1} onChange={e => setForm(p => ({ ...p, points: parseInt(e.target.value) || 0 }))} />
        </div>
        {form.type === "habit" && (
          <div className="form-row">
            <label className="label">Note for student (optional)</label>
            <input className="input" value={form.notes || ""} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="e.g. Even 10 minutes counts." />
          </div>
        )}
      </Modal>
    </div>
  );
}

// ─── TEACHER: MESSAGING ───────────────────────────────────────────────────────

function TeacherMessaging({ messages = {}, setMessages, studentAccounts = [], content }) {
  const [selectedStudentId, setSelectedStudentId] = useState(studentAccounts[0]?.id || null);
  const [selectedThread, setSelectedThread] = useState(null);
  const [newThreadOpen, setNewThreadOpen] = useState(false);
  const [newThreadForm, setNewThreadForm] = useState({ subject: "", linkedType: "none", linkedId: "" });
  const [replyText, setReplyText] = useState("");

  const studentThreads = (messages[selectedStudentId] || []).slice().reverse();

  const allContent = [
    ...content.skills.map(i => ({ type: "skill", id: i.id, label: i.name })),
    ...content.projects.map(i => ({ type: "project", id: i.id, label: i.title })),
    ...content.gigs.map(i => ({ type: "gig", id: i.id, label: i.title })),
    ...content.ripple.map(i => ({ type: "ripple", id: i.id, label: i.title })),
  ];

  const createThread = () => {
    if (!newThreadForm.subject.trim()) return;
    const thread = {
      id: "t_" + Date.now(),
      subject: newThreadForm.subject,
      linkedType: newThreadForm.linkedType !== "none" ? newThreadForm.linkedType : null,
      linkedId: newThreadForm.linkedId || null,
      messages: [{ id: "m_" + Date.now(), role: "teacher", text: replyText, date: new Date().toLocaleDateString() }],
      unread: true,
      createdAt: Date.now(),
    };
    setMessages(prev => ({ ...prev, [selectedStudentId]: [...(prev[selectedStudentId] || []), thread] }));
    setNewThreadOpen(false);
    setNewThreadForm({ subject: "", linkedType: "none", linkedId: "" });
    setReplyText("");
    setSelectedThread(thread.id);
  };

  const sendReply = (threadId) => {
    if (!replyText.trim()) return;
    const msg = { id: "m_" + Date.now(), role: "teacher", text: replyText, date: new Date().toLocaleDateString() };
    setMessages(prev => ({
      ...prev,
      [selectedStudentId]: (prev[selectedStudentId] || []).map(t =>
        t.id === threadId ? { ...t, messages: [...t.messages, msg], unread: false } : t
      )
    }));
    setReplyText("");
  };

  const viewThread = studentThreads.find(t => t.id === selectedThread);
  const linkedItem = viewThread?.linkedId ? allContent.find(i => i.id === viewThread.linkedId) : null;

  const unreadCount = (sid) => (messages[sid] || []).filter(t => t.unread && t.messages[t.messages.length - 1]?.role === "student").length;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">💬 Messages</h1>
        <p className="page-sub">Direct feedback and conversations with each student</p>
      </div>
      <div className="page-content">
        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 20, alignItems: "start" }}>
          {/* Student list */}
          <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", overflow: "hidden" }}>
            {studentAccounts.map((s, i) => {
              const uc = unreadCount(s.id);
              return (
                <div key={s.id} onClick={() => { setSelectedStudentId(s.id); setSelectedThread(null); }}
                  style={{ padding: "13px 16px", cursor: "pointer", background: selectedStudentId === s.id ? "var(--amber-dim)" : "transparent", borderBottom: i < studentAccounts.length - 1 ? "1px solid var(--border)" : "none", transition: "background 0.15s", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: selectedStudentId === s.id ? "var(--amber)" : "var(--bg4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: selectedStudentId === s.id ? "#0c0c16" : "var(--cream)", flexShrink: 0 }}>{s.name[0]}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: selectedStudentId === s.id ? "var(--amber)" : "var(--cream)" }}>{s.name}</div>
                    <div style={{ fontSize: 10, color: "var(--muted)" }}>{(messages[s.id] || []).length} thread{(messages[s.id] || []).length !== 1 ? "s" : ""}</div>
                  </div>
                  {uc > 0 && <span style={{ background: "var(--clay)", color: "#fff", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 10 }}>{uc}</span>}
                </div>
              );
            })}
          </div>

          {/* Thread list + detail */}
          <div>
            {!viewThread ? (
              <>
                <div className="flex-between mb-14">
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, color: "var(--cream)" }}>
                    {studentAccounts.find(s => s.id === selectedStudentId)?.name || "Student"}'s Threads
                  </div>
                  <button className="btn btn-primary btn-sm" onClick={() => { setNewThreadOpen(true); setReplyText(""); }}>+ New Thread</button>
                </div>
                {studentThreads.length === 0 ? (
                  <div className="card" style={{ textAlign: "center", padding: 32, color: "var(--muted)" }}>
                    No threads yet — start a conversation or leave feedback on something they've done.
                  </div>
                ) : studentThreads.map(t => {
                  const last = t.messages[t.messages.length - 1];
                  const unread = t.unread && last?.role === "student";
                  return (
                    <div key={t.id} onClick={() => { setSelectedThread(t.id); setMessages(prev => ({ ...prev, [selectedStudentId]: (prev[selectedStudentId] || []).map(x => x.id === t.id ? { ...x, unread: false } : x) })); }}
                      style={{ background: "var(--bg2)", border: `1px solid ${unread ? "var(--amber)" : "var(--border)"}`, borderRadius: "var(--r-lg)", padding: "14px 18px", cursor: "pointer", marginBottom: 8, transition: "all 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = "var(--amber)"}
                      onMouseLeave={e => e.currentTarget.style.borderColor = unread ? "var(--amber)" : "var(--border)"}>
                      <div className="flex-between mb-4">
                        <div style={{ fontWeight: 700, fontSize: 14, color: unread ? "var(--amber)" : "var(--cream)" }}>{t.subject}</div>
                        <span style={{ fontSize: 11, color: "var(--muted)" }}>{last?.date}</span>
                      </div>
                      <div className="flex-center gap-8">
                        {t.linkedType && <span className="tag tag-lavender" style={{ fontSize: 10 }}>{t.linkedType}</span>}
                        <span style={{ fontSize: 12, color: "var(--muted)", flex: 1 }}>{last?.text?.substring(0, 80)}{last?.text?.length > 80 ? "…" : ""}</span>
                        {unread && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--amber)", flexShrink: 0 }} />}
                      </div>
                    </div>
                  );
                })}
              </>
            ) : (
              <div>
                <button className="btn btn-ghost btn-sm mb-14" onClick={() => setSelectedThread(null)}>← Back to Threads</button>
                <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", overflow: "hidden" }}>
                  <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", background: "var(--bg3)" }}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--cream)", marginBottom: 6 }}>{viewThread.subject}</div>
                    {linkedItem && (
                      <div className="flex-center gap-8">
                        <span className="tag tag-lavender" style={{ fontSize: 10 }}>{linkedItem.type}</span>
                        <span style={{ fontSize: 12, color: "var(--muted)" }}>{linkedItem.label}</span>
                      </div>
                    )}
                  </div>
                  <div style={{ padding: "16px 20px", maxHeight: 400, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
                    {viewThread.messages.map(msg => (
                      <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: msg.role === "teacher" ? "flex-end" : "flex-start" }}>
                        <div style={{ padding: "10px 14px", borderRadius: 14, maxWidth: "80%", background: msg.role === "teacher" ? "var(--amber-dim)" : "var(--bg3)", border: `1px solid ${msg.role === "teacher" ? "rgba(0,212,255,0.35)" : "var(--border)"}`, borderBottomRightRadius: msg.role === "teacher" ? 4 : 14, borderBottomLeftRadius: msg.role === "student" ? 4 : 14 }}>
                          <div style={{ fontSize: 13, color: "var(--cream)", lineHeight: 1.65, whiteSpace: "pre-wrap" }}>{msg.text}</div>
                        </div>
                        <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 3, paddingLeft: 4, paddingRight: 4 }}>{msg.role === "teacher" ? "You" : studentAccounts.find(s => s.id === selectedStudentId)?.name} · {msg.date}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)" }}>
                    <textarea className="input textarea" style={{ minHeight: 80, marginBottom: 10 }} value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Write your reply…" />
                    <button className="btn btn-primary btn-sm" onClick={() => sendReply(viewThread.id)} disabled={!replyText.trim()}>Send Reply →</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New Thread Modal */}
      <Modal open={newThreadOpen} onClose={() => setNewThreadOpen(false)} title="New Thread"
        footer={<><button className="btn btn-ghost" onClick={() => setNewThreadOpen(false)}>Cancel</button><button className="btn btn-primary" onClick={createThread} disabled={!newThreadForm.subject.trim() || !replyText.trim()}>Send →</button></>}>
        <div className="form-row">
          <label className="label">Subject</label>
          <input className="input" value={newThreadForm.subject} onChange={e => setNewThreadForm(p => ({ ...p, subject: e.target.value }))} placeholder="e.g. Feedback on your essay project" autoFocus />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          <div>
            <label className="label">Link to (optional)</label>
            <select className="input" value={newThreadForm.linkedType} onChange={e => setNewThreadForm(p => ({ ...p, linkedType: e.target.value, linkedId: "" }))}>
              {[["none","— None —"],["skill","Skill"],["project","Project"],["gig","Gig"],["ripple","Ripple Mission"]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          {newThreadForm.linkedType !== "none" && (
            <div>
              <label className="label">Item</label>
              <select className="input" value={newThreadForm.linkedId} onChange={e => setNewThreadForm(p => ({ ...p, linkedId: e.target.value }))}>
                <option value="">— Select —</option>
                {allContent.filter(i => i.type === newThreadForm.linkedType).map(i => <option key={i.id} value={i.id}>{i.label}</option>)}
              </select>
            </div>
          )}
        </div>
        <div className="form-row">
          <label className="label">Message</label>
          <textarea className="input textarea" style={{ minHeight: 120 }} value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Write your feedback or message…" />
        </div>
      </Modal>
    </div>
  );
}

// ─── STUDENT: HABITS WIDGET ───────────────────────────────────────────────────

function HabitsWidget({ habitDefs, habitLogs, setHabitLogs, student, onComplete, onNavigate }) {
  const today = todayStr();
  const dayOfWeek = new Date().getDay();

  const isScheduledToday = (h) => {
    const days = h.scheduleDays;
    if (!days || days.length === 0) return false;
    return days.includes(dayOfWeek);
  };

  const mine = habitDefs.filter(h =>
    (h.assignedTo === "all" || h.assignedTo === student?.id) && isScheduledToday(h)
  );

  const isDone = (id) => (habitLogs[id] || []).includes(today);

  const toggle = (h) => {
    const log = habitLogs[h.id] || [];
    const wasDone = log.includes(today);
    setHabitLogs(prev => ({ ...prev, [h.id]: wasDone ? log.filter(d => d !== today) : [...log, today] }));
    if (!wasDone && h.points > 0) onComplete("habit_" + h.id + "_" + today, h.points);
  };

  const doneCount = mine.filter(h => isDone(h.id)).length;

  if (mine.length === 0) return null;

  return (
    <div className="card mb-16" style={{ borderColor: doneCount === mine.length ? "rgba(0,229,168,0.4)" : "var(--border)", transition: "border-color 0.3s" }}>
      <div className="flex-between mb-12">
        <div className="flex-center gap-8">
          <span style={{ fontSize: 16 }}>✅</span>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: doneCount === mine.length ? "var(--sage)" : "var(--cream)" }}>
            Today's Habits & Chores
          </h3>
        </div>
        <div className="flex-center gap-8">
          <span style={{ fontSize: 12, color: doneCount === mine.length ? "var(--sage)" : "var(--muted)", fontWeight: 600 }}>{doneCount}/{mine.length}</span>
          <button className="btn btn-ghost btn-xs" onClick={() => onNavigate("habits")}>All →</button>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {mine.map(h => {
          const done = isDone(h.id);
          return (
            <div key={h.id} onClick={() => toggle(h)}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: "var(--r)", background: done ? "var(--sage-dim)" : "var(--bg3)", border: `1px solid ${done ? "rgba(0,229,168,0.35)" : "var(--border)"}`, cursor: "pointer", transition: "all 0.15s" }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${done ? "var(--sage)" : "var(--border)"}`, background: done ? "var(--sage)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
                {done && <span style={{ color: "#0c0c16", fontSize: 11, fontWeight: 900 }}>✓</span>}
              </div>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{h.icon}</span>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: done ? "var(--sage)" : "var(--cream)", textDecoration: done ? "line-through" : "none" }}>{h.name}</span>
              {h.type === "chore" && <span style={{ fontSize: 10, color: "var(--clay)", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>chore</span>}
              {h.points > 0 && !done && <span className="pts-badge" style={{ fontSize: 10 }}>+{h.points}</span>}
            </div>
          );
        })}
      </div>
      {doneCount === mine.length && (
        <div style={{ textAlign: "center", marginTop: 10, fontSize: 13, color: "var(--sage)", fontWeight: 600 }}>
          🎉 All done for today!
        </div>
      )}
    </div>
  );
}

// ─── STUDENT: GOALS WIDGET ────────────────────────────────────────────────────

function GoalsWidget({ goals, onNavigate }) {
  const active = (goals || []).filter(g => g.status === "active");
  if (active.length === 0) return null;

  return (
    <div className="card mb-16" style={{ borderColor: "rgba(77,143,255,0.3)" }}>
      <div className="flex-between mb-12">
        <div className="flex-center gap-8">
          <span style={{ fontSize: 16 }}>🎯</span>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--sky)" }}>Active Goals</h3>
        </div>
        <button className="btn btn-ghost btn-xs" onClick={() => onNavigate("goals")}>All →</button>
      </div>
      {active.slice(0, 3).map(g => {
        const done = (g.milestones || []).filter(m => m.done).length;
        const total = (g.milestones || []).length;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
        return (
          <div key={g.id} onClick={() => onNavigate("goals")} style={{ marginBottom: 10, padding: "10px 12px", background: "var(--bg3)", borderRadius: "var(--r)", border: "1px solid var(--border)", cursor: "pointer" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "var(--sky)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
            <div className="flex-between mb-6">
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--cream)" }}>{g.title}</div>
              {g.targetDate && <span style={{ fontSize: 11, color: "var(--muted)" }}>by {g.targetDate}</span>}
            </div>
            {total > 0 && (
              <div>
                <div style={{ height: 4, background: "var(--border)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: "var(--sky)", borderRadius: 4, transition: "width 0.4s" }} />
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 3 }}>{done}/{total} milestones</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── STUDENT: MESSAGES WIDGET ─────────────────────────────────────────────────

function MessagesWidget({ messages, studentId, onNavigate }) {
  const threads = (messages[studentId] || []).slice().reverse();
  const unread = threads.filter(t => t.unread && t.messages[t.messages.length - 1]?.role === "teacher").length;
  if (threads.length === 0) return null;

  return (
    <div className="card mb-16" style={{ borderColor: unread > 0 ? "rgba(0,212,255,0.45)" : "var(--border)" }}>
      <div className="flex-between mb-12">
        <div className="flex-center gap-8">
          <span style={{ fontSize: 16 }}>✉️</span>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: unread > 0 ? "var(--amber)" : "var(--cream)" }}>
            Messages {unread > 0 && <span style={{ marginLeft: 6, background: "var(--amber)", color: "#0c0c16", fontSize: 11, fontWeight: 700, padding: "1px 7px", borderRadius: 10 }}>{unread} new</span>}
          </h3>
        </div>
        <button className="btn btn-ghost btn-xs" onClick={() => onNavigate("messages")}>All →</button>
      </div>
      {threads.slice(0, 2).map(t => {
        const last = t.messages[t.messages.length - 1];
        const isNew = t.unread && last?.role === "teacher";
        return (
          <div key={t.id} onClick={() => onNavigate("messages")} style={{ padding: "10px 12px", background: isNew ? "var(--amber-dim)" : "var(--bg3)", borderRadius: "var(--r)", border: `1px solid ${isNew ? "rgba(0,212,255,0.35)" : "var(--border)"}`, marginBottom: 8, cursor: "pointer", transition: "all 0.15s" }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: isNew ? "var(--amber)" : "var(--cream)", marginBottom: 3 }}>{t.subject}</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>{last?.text?.substring(0, 70)}{last?.text?.length > 70 ? "…" : ""}</div>
          </div>
        );
      })}
    </div>
  );
}

// ─── STUDENT: HABITS FULL PAGE ────────────────────────────────────────────────

function StudentHabitsPage({ habitDefs, habitLogs, setHabitLogs, student, onComplete }) {
  const today = todayStr();
  const dayOfWeek = new Date().getDay();
  const [showHistory, setShowHistory] = useState({});

  const isScheduledOn = (h, date) => {
    const days = h.scheduleDays;
    if (!days || days.length === 0) return false;
    return days.includes(new Date(date + "T12:00:00").getDay());
  };

  const isScheduledToday = (h) => isScheduledOn(h, today);

  const mine = habitDefs.filter(h => h.assignedTo === "all" || h.assignedTo === student?.id);
  const isDone = (id, date = today) => (habitLogs[id] || []).includes(date);

  const toggle = (h) => {
    const log = habitLogs[h.id] || [];
    const wasDone = log.includes(today);
    setHabitLogs(prev => ({ ...prev, [h.id]: wasDone ? log.filter(d => d !== today) : [...log, today] }));
    if (!wasDone && h.points > 0) onComplete("habit_" + h.id + "_" + today, h.points);
  };

  // Streak = consecutive scheduled days that were completed
  const getStreak = (h) => {
    const log = habitLogs[h.id] || [];
    let streak = 0;
    const d = new Date();
    // Walk backwards day by day, only counting scheduled days
    for (let i = 0; i < 365; i++) {
      const ds = d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0");
      if (isScheduledOn(h, ds)) {
        if (!log.includes(ds)) break; // scheduled but not done — streak broken
        streak++;
      }
      d.setDate(d.getDate() - 1);
    }
    return streak;
  };

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0");
  });

  const todayItems = mine.filter(isScheduledToday);
  const doneToday = todayItems.filter(h => isDone(h.id)).length;

  const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  const scheduleSummary = (h) => {
    const days = h.scheduleDays || [];
    if (days.length === 0) return "Not scheduled";
    if (days.length === 7) return "Every day";
    if (JSON.stringify(days) === JSON.stringify([1,2,3,4,5])) return "Weekdays";
    if (JSON.stringify(days) === JSON.stringify([0,6])) return "Weekends";
    return days.map(d => DAY_NAMES[d]).join(", ");
  };

  return (
    <div>
      <div className="page-header">
        <div className="flex-between">
          <div>
            <h1 className="page-title">✅ Habits & Chores</h1>
            <p className="page-sub">Today: {doneToday}/{todayItems.length} due · {todayItems.length === 0 ? "Nothing scheduled today" : "Keep the streak alive"}</p>
          </div>
        </div>
      </div>
      <div className="page-content">
        {mine.length === 0 ? (
          <EmptyState icon="✅" title="Nothing assigned yet" sub="Your teacher will add habits and chores here soon." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Show today's items first */}
            {todayItems.length > 0 && (
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "var(--amber)", marginBottom: 2 }}>Due Today</div>
            )}
            {[...mine].sort((a, b) => {
              const aToday = isScheduledToday(a) ? 0 : 1;
              const bToday = isScheduledToday(b) ? 0 : 1;
              return aToday - bToday;
            }).map((h, idx, arr) => {
              const done = isDone(h.id);
              const streak = getStreak(h);
              const scheduledToday = isScheduledToday(h);
              const prevScheduled = idx > 0 ? isScheduledToday(arr[idx-1]) : true;
              const showDivider = !scheduledToday && (idx === 0 || prevScheduled);
              return (
                <div key={h.id}>
                  {showDivider && mine.some(isScheduledToday) && (
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "var(--muted)", marginTop: 8, marginBottom: 4 }}>Rest of Your Schedule</div>
                  )}
                  <div style={{ background: "var(--bg2)", border: `1px solid ${done && scheduledToday ? "rgba(0,229,168,0.4)" : scheduledToday ? "var(--border)" : "var(--border)"}`, borderRadius: "var(--r-lg)", overflow: "hidden", transition: "border-color 0.2s", opacity: scheduledToday ? 1 : 0.6 }}>
                    <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
                      {scheduledToday ? (
                        <div onClick={() => toggle(h)} style={{ width: 28, height: 28, borderRadius: 8, border: `2px solid ${done ? "var(--sage)" : "var(--border)"}`, background: done ? "var(--sage)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, transition: "all 0.15s" }}>
                          {done && <span style={{ color: "#0c0c16", fontSize: 13, fontWeight: 900 }}>✓</span>}
                        </div>
                      ) : (
                        <div style={{ width: 28, height: 28, borderRadius: 8, border: "2px solid var(--border)", background: "transparent", flexShrink: 0 }} />
                      )}
                      <span style={{ fontSize: 24, flexShrink: 0 }}>{h.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 15, color: done && scheduledToday ? "var(--sage)" : "var(--cream)", textDecoration: done && scheduledToday ? "line-through" : "none" }}>{h.name}</div>
                        <div className="flex-center gap-8 mt-4">
                          <span className={`tag ${h.type === "chore" ? "tag-clay" : "tag-sage"}`} style={{ fontSize: 10 }}>{h.type}</span>
                          <span style={{ fontSize: 11, color: scheduledToday ? "var(--amber)" : "var(--muted)", fontWeight: scheduledToday ? 600 : 400 }}>
                            {scheduledToday ? "Today · " : ""}{scheduleSummary(h)}
                          </span>
                          {h.points > 0 && <span className="pts-badge" style={{ fontSize: 10 }}>+{h.points} pts</span>}
                          {h.notes && <span style={{ fontSize: 11, color: "var(--muted)", fontStyle: "italic" }}>{h.notes}</span>}
                        </div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        {streak > 0 && (
                          <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "var(--amber)" }}>{streak}🔥</div>
                        )}
                        <div style={{ fontSize: 10, color: "var(--muted)" }}>{streak > 0 ? "day streak" : "no streak"}</div>
                      </div>
                    </div>
                    {/* 7-day history — show scheduled days prominently, unscheduled days dimmed */}
                    <div style={{ padding: "8px 20px 14px", display: "flex", gap: 6 }}>
                      {last7.map((date) => {
                        const wasScheduled = isScheduledOn(h, date);
                        const wasDone = isDone(h.id, date);
                        return (
                          <div key={date} style={{ flex: 1, textAlign: "center" }}>
                            <div style={{
                              width: "100%", height: 20, borderRadius: 4,
                              background: !wasScheduled ? "transparent" : wasDone ? "var(--sage)" : "var(--bg3)",
                              border: `1px solid ${!wasScheduled ? "var(--border)" : wasDone ? "rgba(0,229,168,0.4)" : "var(--border2)"}`,
                              opacity: wasScheduled ? 1 : 0.3,
                              transition: "all 0.15s"
                            }} />
                            <div style={{ fontSize: 9, color: wasScheduled ? "var(--muted)" : "var(--border2)", marginTop: 3 }}>
                              {["S","M","T","W","T","F","S"][(new Date(date + "T12:00:00").getDay())]}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── STUDENT: GOALS FULL PAGE ─────────────────────────────────────────────────

function StudentGoalsPage({ goals, setGoals }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", targetDate: "", milestones: [] });
  const [milestoneText, setMilestoneText] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [reflectId, setReflectId] = useState(null);
  const [reflectText, setReflectText] = useState("");

  const active = (goals || []).filter(g => g.status === "active");
  const done = (goals || []).filter(g => g.status === "done");

  const addGoal = () => {
    if (!form.title.trim()) return;
    const g = { id: "g_" + Date.now(), title: form.title, targetDate: form.targetDate, milestones: form.milestones, status: "active", reflection: "", createdAt: todayStr() };
    setGoals(prev => [...(prev || []), g]);
    setShowForm(false);
    setForm({ title: "", targetDate: "", milestones: [] });
    setMilestoneText("");
  };

  const addMilestone = () => {
    if (!milestoneText.trim()) return;
    setForm(p => ({ ...p, milestones: [...p.milestones, { id: "ms_" + Date.now(), text: milestoneText.trim(), done: false }] }));
    setMilestoneText("");
  };

  const toggleMilestone = (goalId, msId) => {
    setGoals(prev => (prev || []).map(g => g.id !== goalId ? g : {
      ...g, milestones: g.milestones.map(m => m.id === msId ? { ...m, done: !m.done } : m)
    }));
  };

  const completeGoal = (goalId, reflection) => {
    setGoals(prev => (prev || []).map(g => g.id !== goalId ? g : { ...g, status: "done", reflection }));
    setReflectId(null);
    setReflectText("");
  };

  const deleteGoal = (id) => setGoals(prev => (prev || []).filter(g => g.id !== id));

  return (
    <div>
      <div className="page-header">
        <div className="flex-between">
          <div>
            <h1 className="page-title">🎯 Goals</h1>
            <p className="page-sub">{active.length} active · {done.length} completed</p>
          </div>
          <button className="btn btn-primary" onClick={() => { setShowForm(true); setForm({ title: "", targetDate: "", milestones: [] }); setMilestoneText(""); }}>+ New Goal</button>
        </div>
      </div>
      <div className="page-content">
        {(goals || []).length === 0 ? (
          <EmptyState icon="🎯" title="No goals yet" sub="Goals are different from projects — they're personal intentions. Something you want to be, do, or figure out."
            action={<button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>+ Set a Goal</button>} />
        ) : (
          <>
            {active.length > 0 && (
              <div className="mb-24">
                <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, color: "var(--cream)", marginBottom: 14 }}>Active</div>
                {active.map(g => {
                  const msDone = g.milestones.filter(m => m.done).length;
                  const msTotal = g.milestones.length;
                  const pct = msTotal > 0 ? Math.round((msDone / msTotal) * 100) : 0;
                  const isExp = expandedId === g.id;
                  return (
                    <div key={g.id} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", overflow: "hidden", marginBottom: 10, transition: "border-color 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = "var(--sky)"}
                      onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
                      <div onClick={() => setExpandedId(isExp ? null : g.id)} style={{ padding: "16px 20px", cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 14 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--cream)", marginBottom: 6 }}>{g.title}</div>
                          <div className="flex-center gap-10">
                            {g.targetDate && <span style={{ fontSize: 11, color: "var(--muted)" }}>🗓 by {g.targetDate}</span>}
                            {msTotal > 0 && (
                              <div className="flex-center gap-6">
                                <div style={{ width: 80, height: 4, background: "var(--border)", borderRadius: 4, overflow: "hidden" }}>
                                  <div style={{ width: `${pct}%`, height: "100%", background: "var(--sky)", borderRadius: 4 }} />
                                </div>
                                <span style={{ fontSize: 11, color: "var(--muted)" }}>{msDone}/{msTotal}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-6" onClick={e => e.stopPropagation()}>
                          <button className="btn btn-sage btn-xs" onClick={() => { setReflectId(g.id); setReflectText(""); }}>Mark Done</button>
                          <button className="btn btn-clay btn-xs" onClick={() => deleteGoal(g.id)}>✕</button>
                        </div>
                        <span style={{ color: "var(--muted)", fontSize: 12, marginTop: 2 }}>{isExp ? "▲" : "▼"}</span>
                      </div>
                      {isExp && g.milestones.length > 0 && (
                        <div style={{ padding: "0 20px 16px" }}>
                          {g.milestones.map(m => (
                            <div key={m.id} onClick={() => toggleMilestone(g.id, m.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderTop: "1px solid var(--border)", cursor: "pointer" }}>
                              <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${m.done ? "var(--sky)" : "var(--border)"}`, background: m.done ? "var(--sky)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                {m.done && <span style={{ color: "#0c0c16", fontSize: 9, fontWeight: 900 }}>✓</span>}
                              </div>
                              <span style={{ fontSize: 13, color: m.done ? "var(--muted)" : "var(--cream)", textDecoration: m.done ? "line-through" : "none" }}>{m.text}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {done.length > 0 && (
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, color: "var(--muted)", marginBottom: 14 }}>Completed</div>
                {done.map(g => (
                  <div key={g.id} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: "14px 18px", marginBottom: 8, opacity: 0.7 }}>
                    <div style={{ fontWeight: 600, color: "var(--sage)", fontSize: 14, marginBottom: g.reflection ? 6 : 0 }}>✓ {g.title}</div>
                    {g.reflection && <div style={{ fontSize: 13, color: "var(--muted)", fontStyle: "italic", lineHeight: 1.6 }}>{g.reflection}</div>}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* New Goal Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title="New Goal"
        footer={<><button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button><button className="btn btn-primary" onClick={addGoal} disabled={!form.title.trim()}>Set Goal →</button></>}>
        <div className="form-row">
          <label className="label">What's the goal? *</label>
          <input className="input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Finish a song I'm proud of · Talk to someone working in design · Run a 5k" autoFocus />
        </div>
        <div className="form-row">
          <label className="label">Target Date (optional)</label>
          <input className="input" type="date" value={form.targetDate} onChange={e => setForm(p => ({ ...p, targetDate: e.target.value }))} />
        </div>
        <div className="form-row">
          <label className="label">Milestones (optional — break it down)</label>
          <div className="flex gap-8 mb-8">
            <input className="input" value={milestoneText} onChange={e => setMilestoneText(e.target.value)} onKeyDown={e => e.key === "Enter" && addMilestone()} placeholder="Add a step and press Enter" />
            <button className="btn btn-ghost btn-sm" onClick={addMilestone} disabled={!milestoneText.trim()}>Add</button>
          </div>
          {form.milestones.map((m, i) => (
            <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontSize: 12, color: "var(--muted)", width: 18 }}>{i + 1}.</span>
              <span style={{ flex: 1, fontSize: 13, color: "var(--cream)" }}>{m.text}</span>
              <button className="btn btn-ghost btn-xs" style={{ fontSize: 10 }} onClick={() => setForm(p => ({ ...p, milestones: p.milestones.filter(x => x.id !== m.id) }))}>✕</button>
            </div>
          ))}
        </div>
      </Modal>

      {/* Reflection Modal */}
      <Modal open={!!reflectId} onClose={() => setReflectId(null)} title="🎉 Mark Goal Complete"
        footer={<><button className="btn btn-ghost" onClick={() => setReflectId(null)}>Not Yet</button><button className="btn btn-sage" onClick={() => completeGoal(reflectId, reflectText)}>Complete It ✓</button></>}>
        <p style={{ fontSize: 14, color: "var(--cream-dim)", lineHeight: 1.75, marginBottom: 16 }}>
          Nice work. Before you mark it done — what did you learn, or what changed?
        </p>
        <textarea className="input textarea" style={{ minHeight: 100 }} value={reflectText} onChange={e => setReflectText(e.target.value)} placeholder="Optional reflection — even one sentence is worth it." />
      </Modal>
    </div>
  );
}

// ─── STUDENT: MESSAGES FULL PAGE ──────────────────────────────────────────────

function StudentMessagesPage({ messages, setMessages, studentId }) {
  const [selectedThread, setSelectedThread] = useState(null);
  const [replyText, setReplyText] = useState("");

  const threads = (messages[studentId] || []).slice().reverse();
  const viewThread = threads.find(t => t.id === selectedThread);

  const sendReply = () => {
    if (!replyText.trim()) return;
    const msg = { id: "m_" + Date.now(), role: "student", text: replyText, date: new Date().toLocaleDateString() };
    setMessages(prev => ({
      ...prev,
      [studentId]: (prev[studentId] || []).map(t =>
        t.id === selectedThread ? { ...t, messages: [...t.messages, msg], unread: true } : t
      )
    }));
    setReplyText("");
  };

  const markRead = (threadId) => {
    setMessages(prev => ({
      ...prev,
      [studentId]: (prev[studentId] || []).map(t => t.id === threadId ? { ...t, unread: false } : t)
    }));
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">✉️ Messages</h1>
        <p className="page-sub">Feedback and notes from your teacher</p>
      </div>
      <div className="page-content">
        {threads.length === 0 ? (
          <EmptyState icon="✉️" title="No messages yet" sub="Your teacher will leave feedback and notes here." />
        ) : !viewThread ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {threads.map(t => {
              const last = t.messages[t.messages.length - 1];
              const isNew = t.unread && last?.role === "teacher";
              return (
                <div key={t.id} onClick={() => { setSelectedThread(t.id); markRead(t.id); }}
                  style={{ background: "var(--bg2)", border: `1px solid ${isNew ? "var(--amber)" : "var(--border)"}`, borderRadius: "var(--r-lg)", padding: "16px 20px", cursor: "pointer", transition: "all 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "var(--amber)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = isNew ? "var(--amber)" : "var(--border)"}>
                  <div className="flex-between mb-6">
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: isNew ? "var(--amber)" : "var(--cream)" }}>{t.subject}</div>
                    <div className="flex-center gap-8">
                      {isNew && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--amber)" }} />}
                      <span style={{ fontSize: 11, color: "var(--muted)" }}>{last?.date}</span>
                    </div>
                  </div>
                  <div className="flex-center gap-8">
                    {t.linkedType && <span className="tag tag-lavender" style={{ fontSize: 10 }}>{t.linkedType}</span>}
                    <span style={{ fontSize: 12, color: "var(--muted)" }}>{last?.text?.substring(0, 90)}{last?.text?.length > 90 ? "…" : ""}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div>
            <button className="btn btn-ghost btn-sm mb-14" onClick={() => setSelectedThread(null)}>← Back</button>
            <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", overflow: "hidden", maxWidth: 680 }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", background: "var(--bg3)" }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--cream)" }}>{viewThread.subject}</div>
                {viewThread.linkedType && <span className="tag tag-lavender mt-4" style={{ fontSize: 10 }}>{viewThread.linkedType}</span>}
              </div>
              <div style={{ padding: "16px 20px", maxHeight: 440, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
                {viewThread.messages.map(msg => (
                  <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: msg.role === "student" ? "flex-end" : "flex-start" }}>
                    <div style={{ padding: "10px 14px", borderRadius: 14, maxWidth: "80%", background: msg.role === "student" ? "var(--sky-dim)" : "var(--bg3)", border: `1px solid ${msg.role === "student" ? "rgba(77,143,255,0.35)" : "var(--border)"}`, borderBottomRightRadius: msg.role === "student" ? 4 : 14, borderBottomLeftRadius: msg.role === "teacher" ? 4 : 14 }}>
                      <div style={{ fontSize: 13, color: "var(--cream)", lineHeight: 1.65, whiteSpace: "pre-wrap" }}>{msg.text}</div>
                    </div>
                    <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 3, paddingLeft: 4, paddingRight: 4 }}>{msg.role === "teacher" ? "Teacher" : "You"} · {msg.date}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding: "12px 16px", borderTop: "1px solid var(--border)" }}>
                <textarea className="input textarea" style={{ minHeight: 80, marginBottom: 10 }} value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Write a reply…" />
                <button className="btn btn-primary btn-sm" onClick={sendReply} disabled={!replyText.trim()}>Send Reply →</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ERROR BOUNDARY ───────────────────────────────────────────────────────────

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) return (
      <div style={{ padding: 40, maxWidth: 700 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--clay)", marginBottom: 12 }}>
          Something went wrong
        </div>
        <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "var(--r)", padding: 16, fontFamily: "monospace", fontSize: 12, color: "var(--cream-dim)", lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
          {this.state.error?.message || String(this.state.error)}
        </div>
        <button className="btn btn-ghost" style={{ marginTop: 16 }} onClick={() => this.setState({ error: null })}>Try again</button>
      </div>
    );
    return this.props.children;
  }
}

// ─── TEACHER APP ──────────────────────────────────────────────────────────────

function TeacherApp({ content, setContent, studentAccounts, setStudentAccounts, approvals, setApprovals, apiKey, setApiKey, messages, setMessages, onSwitchRole }) {
  const [view, setView] = useState("overview");

  const setContentKey = (key) => (fn) => setContent(prev => ({ ...prev, [key]: typeof fn === "function" ? fn(prev[key]) : fn }));

  const SKILL_FIELDS = [
    { key: "name", label: "Skill Name", placeholder: "e.g. Narrative Writing" },
    { key: "desc", label: "Description", type: "textarea", placeholder: "What does this skill involve?" },
    { key: "area", label: "Subject Area", type: "select", options: content.areas.map(a => ({ value: a.id, label: a.name })) },
    { key: "icon", label: "Icon (emoji)", placeholder: "📖" },
    { key: "pts", label: "Points", type: "number", placeholder: "15" },
  ];

  const PROJECT_FIELDS = [
    { key: "title", label: "Project Title", placeholder: "e.g. Build & Publish a Website" },
    { key: "desc", label: "Description", type: "textarea", placeholder: "What will students do?" },
    { key: "color", label: "Accent Color", type: "select", options: ["amber","sage","clay","sky","lavender"].map(c => ({ value: c, label: c })) },
    { key: "duration", label: "Duration", placeholder: "e.g. 4-8 weeks" },
    { key: "pts", label: "Points", type: "number", placeholder: "30" },
  ];

  const GIG_FIELDS = [
    { key: "title", label: "Gig Title", placeholder: "e.g. Design a T-Shirt for a Local Brand" },
    { key: "faction", label: "Faction", type: "select", options: FACTIONS.map(f => ({ value: f.id, label: `${f.icon} ${f.name}` })) },
    { key: "difficulty", label: "Difficulty", type: "select", options: ["Beginner","Intermediate","Advanced"].map(d => ({ value: d, label: d })) },
    { key: "time", label: "Time Estimate", placeholder: "e.g. 2–3 hrs" },
    { key: "relatedCareer", label: "Related Career", placeholder: "e.g. Graphic Designer" },
    { key: "area", label: "Subject Area", type: "select", options: content.areas.map(a => ({ value: a.id, label: a.name })) },
    { key: "tags", label: "Skill Tags (comma-separated)", placeholder: "e.g. typography, branding, layout" },
    { key: "clientBackground", label: "Client Background", type: "textarea", placeholder: "Who is the fictional client? What do they do?" },
    { key: "problem", label: "The Problem", type: "textarea", placeholder: "What does the client need help with?" },
    { key: "deliverable", label: "Deliverables (one per line)", type: "textarea", placeholder: "T-shirt design (PNG)\nProduct mockup\nOne-sentence concept" },
    { key: "qualityChecklist", label: "Quality Checklist (one per line)", type: "textarea", placeholder: "Is the message readable?\nWould someone actually use this?" },
    { key: "reflectionPrompt", label: "Reflection Prompt", placeholder: "e.g. What surprised you about this challenge?" },
    { key: "studentTips", label: "Student Tips (one per line)", type: "textarea", placeholder: "Study real examples\nKeep it simple\nLet the concept lead" },
    { key: "pts", label: "Points", type: "number", placeholder: "15" },
  ];

  const RIPPLE_FIELDS = [
    { key: "title", label: "Mission Title", placeholder: "e.g. Write Letters to Elderly Residents" },
    { key: "desc", label: "Description", type: "textarea", placeholder: "What is this mission?" },
    { key: "cause", label: "Cause Area", placeholder: "e.g. Connection, Food Security" },
    { key: "icon", label: "Icon (emoji)", placeholder: "✉️" },
    { key: "pts", label: "Points", type: "number", placeholder: "20" },
  ];

  const GUIDE_FIELDS = [
    { key: "title", label: "Entry Title", placeholder: "e.g. How to Handle Being Wrong Gracefully" },
    { key: "content", label: "Content", type: "textarea", placeholder: "The full entry text..." },
    { key: "category", label: "Category", placeholder: "e.g. Character, Life Skills, Thinking" },
    { key: "icon", label: "Icon (emoji)", placeholder: "🪞" },
    { key: "pts", label: "Points", type: "number", placeholder: "5" },
  ];

  const LIGHT_FIELDS = [
    { key: "title", label: "Title", placeholder: "e.g. The Science of Flow States" },
    { key: "content", label: "Content", type: "textarea", placeholder: "Full content..." },
    { key: "type", label: "Type", type: "select", options: ["Read","Watch","Listen","Reflection"].map(t => ({ value: t, label: t })) },
    { key: "topic", label: "Topic", placeholder: "e.g. Peak Performance, Philosophy" },
    { key: "pts", label: "Points", type: "number", placeholder: "5" },
  ];

  const DROP_FIELDS = [
    { key: "title", label: "Drop Title", placeholder: "e.g. What Are You Actually Good At?" },
    { key: "prompt", label: "Prompt / Instructions", type: "textarea", placeholder: "What should students do with this drop?" },
    { key: "type", label: "Type", type: "select", options: ["Reflection","Action","Creative","Thinking","Connection","Awareness"].map(t => ({ value: t, label: t })) },
    { key: "icon", label: "Icon (emoji)", placeholder: "⭐" },
    { key: "pts", label: "Points", type: "number", placeholder: "5" },
  ];

  const pendingCount = approvals.filter(a => a.status === "pending").length;
  const unreadMsgCount = Object.values(messages).flat().filter(t => t.unread && t.messages[t.messages.length-1]?.role === "student").length;

  const NAV = [
    { section: "overview", items: [{ id: "overview", label: "Overview", icon: "⬡" }] },
    { section: "content", items: [
      { id: "skills", label: "Skills", icon: "◈" },
      { id: "projects", label: "Projects", icon: "⬟" },
      { id: "gigs", label: "Sandbox Gigs", icon: "⚡" },
      { id: "ripple", label: "Ripple Missions", icon: "🌊" },
      { id: "teensguide", label: "Teen's Guide", icon: "📖" },
      { id: "lightroom", label: "Light Room", icon: "💡" },
      { id: "drops", label: "Daily Drops", icon: "🌤️" },
      { id: "checkins", label: "Check-Ins", icon: "💬" },
      { id: "categories", label: "Transcript Categories", icon: "📋" },
    ]},
    { section: "students", items: [
      { id: "accounts", label: "Student Accounts", icon: "🔑" },
      { id: "profileqs", label: "Profile Questions", icon: "📝" },
      { id: "habits", label: "Habits & Chores", icon: "✅" },
      { id: "messages", label: "Messages", icon: "✉️", badge: unreadMsgCount > 0 ? unreadMsgCount : null },
      { id: "students", label: "Progress", icon: "👥" },
      { id: "approvals", label: "Approvals", icon: "✅", badge: pendingCount > 0 ? pendingCount : null },
    ]},
    { section: "settings", items: [{ id: "settings", label: "API Settings", icon: "⚙️" }] },
  ];

  const renderView = () => {
    switch (view) {
      case "overview": return <TeacherOverview content={content} students={studentAccounts} approvals={approvals} onNavigate={setView} />;
      case "skills": return <SkillsManager items={content.skills} setItems={setContentKey("skills")} areas={content.areas} />;
      case "projects": return <ContentManager title="Projects" icon="⬟" items={content.projects} setItems={setContentKey("projects")} fields={PROJECT_FIELDS} />;
      case "gigs": return <ContentManager title="Sandbox Gigs" icon="⚡" items={content.gigs} setItems={setContentKey("gigs")} fields={GIG_FIELDS} />;
      case "ripple": return <ContentManager title="Ripple Missions" icon="🌊" items={content.ripple} setItems={setContentKey("ripple")} fields={RIPPLE_FIELDS} />;
      case "teensguide": return <ContentManager title="Teen's Guide" icon="📖" items={content.teensGuide} setItems={setContentKey("teensGuide")} fields={GUIDE_FIELDS} />;
      case "lightroom": return <ContentManager title="Light Room" icon="💡" items={content.lightRoom} setItems={setContentKey("lightRoom")} fields={LIGHT_FIELDS} />;
      case "drops": return <TeacherDropCalendar drops={content.dailyDrops} setDrops={setContentKey("dailyDrops")} students={studentAccounts} />;
      case "checkins": return <CheckInManager checkIns={content.checkIns || []} setCheckIns={setContentKey("checkIns")} content={content} />;
      case "categories": return <TeacherCategories areas={content.areas} setAreas={setContentKey("areas")} skills={content.skills} />;
      case "habits": return <TeacherHabitsManager habitDefs={content.habitDefs || []} setHabitDefs={setContentKey("habitDefs")} studentAccounts={studentAccounts} />;
      case "messages": return <TeacherMessaging messages={messages} setMessages={setMessages} studentAccounts={studentAccounts} content={content} />;
      case "profileqs": return <ProfileQuestionsManager questions={content.profileQuestions || []} setQuestions={setContentKey("profileQuestions")} content={content} />;
      case "students": return <TeacherStudents students={studentAccounts} content={content} />;
      case "approvals": return <TeacherApprovals approvals={approvals} setApprovals={setApprovals} />;
      case "settings": return <APISettings apiKey={apiKey} setApiKey={setApiKey} />;
      default: return null;
    }
  };

  return (
    <div className="app-wrap">
      <nav className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-title">Forge</div>
          <div className="logo-badge">Teacher</div>
          <div className="logo-role">Platform Manager</div>
        </div>
        {NAV.map(({ section, items }) => (
          <div key={section}>
            <div className="nav-section">{section}</div>
            {items.map(item => (
              <div key={item.id} className={`nav-item ${view === item.id ? "active" : ""}`} onClick={() => setView(item.id)}>
                <span className="nav-icon">{item.icon}</span>
                {item.label}
                {item.badge ? <span className="nav-badge">{item.badge}</span> : null}
              </div>
            ))}
          </div>
        ))}
        <div className="sidebar-footer">
          <button className="btn btn-ghost btn-sm" style={{ width: "100%" }} onClick={onSwitchRole}>Switch to Student →</button>
        </div>
      </nav>
      <main className="main"><ErrorBoundary>{renderView()}</ErrorBoundary></main>
    </div>
  );
}

// ─── STUDENT: ONBOARDING ──────────────────────────────────────────────────────
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [selectedStrengths, setSelectedStrengths] = useState([]);
  const [learningStyle, setLearningStyle] = useState("");
  const [goals, setGoals] = useState("");

  const toggleInterest = (id) => setSelectedInterests(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleStrength = (s) => setSelectedStrengths(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);

  const steps = [
    {
      title: "Welcome to Forge.",
      sub: "This is your space. Not a classroom, not a test — a place to figure out what you're made of and build something real. Let's start by getting to know you.",
      content: (
        <div>
          <div className="grid-2" style={{ gap: 14, marginTop: 22 }}>
            <div className="form-row">
              <label className="label">What's your name?</label>
              <input className="input" placeholder="First name is fine" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="form-row">
              <label className="label">How old are you?</label>
              <input className="input" placeholder="e.g. 15" value={age} onChange={e => setAge(e.target.value)} />
            </div>
          </div>
          <div className="form-row">
            <label className="label">In your own words — what do you want this to be for?</label>
            <textarea className="input textarea" style={{ minHeight: 90 }} placeholder="What do you want your life to look like? What are you hoping to figure out? Doesn't have to be profound — just honest." value={goals} onChange={e => setGoals(e.target.value)} />
          </div>
        </div>
      ),
    },
    {
      title: "What gets you going?",
      sub: "Pick everything that genuinely interests you. Don't think about school subjects or careers — what would you choose to spend time on?",
      content: (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 9, marginTop: 20 }}>
          {INTERESTS.map(int => (
            <button key={int.id} className={`interest-chip ${selectedInterests.includes(int.id) ? "selected" : ""}`} onClick={() => toggleInterest(int.id)}>
              <span>{int.icon}</span> {int.label}
            </button>
          ))}
        </div>
      ),
    },
    {
      title: "How do you actually work?",
      sub: "Pick every statement that feels true for you. This helps us suggest the right kinds of projects.",
      content: (
        <div style={{ marginTop: 18 }}>
          {STRENGTHS.map(s => (
            <div key={s} className="checklist-item">
              <CheckBox checked={selectedStrengths.includes(s)} onChange={() => toggleStrength(s)} />
              <span style={{ fontSize: 14, color: "var(--cream-dim)", marginTop: 1 }}>{s}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      title: "One last thing.",
      sub: "There's no right answer here. This is about understanding your starting point.",
      content: (
        <div style={{ marginTop: 20 }}>
          <label className="label">What kind of learner do you tend to be?</label>
          {["I dive deep into one thing at a time", "I explore many things at once", "I'm somewhere in between — it depends", "I honestly don't know yet"].map(opt => (
            <div key={opt} onClick={() => setLearningStyle(opt)} style={{ padding: "13px 15px", marginBottom: 8, borderRadius: "var(--r)", border: `1.5px solid ${learningStyle === opt ? "var(--amber)" : "var(--border)"}`, background: learningStyle === opt ? "var(--amber-dim)" : "var(--bg3)", cursor: "pointer", color: learningStyle === opt ? "var(--amber)" : "var(--cream-dim)", fontSize: 14, transition: "all 0.15s" }}>
              {opt}
            </div>
          ))}
        </div>
      ),
    },
  ];

  const canProceed = () => {
    if (step === 0) return name.length > 0;
    if (step === 1) return selectedInterests.length >= 3;
    if (step === 2) return selectedStrengths.length >= 1;
    if (step === 3) return learningStyle.length > 0;
    return true;
  };

  return (
    <div className="onboard-wrap">
      <div className="onboard-card">
        <div className="flex-between mb-8">
          <span style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 2 }}>Step {step + 1} of {steps.length}</span>
          <div className="flex gap-6">
            {steps.map((_, i) => <div key={i} style={{ width: 28, height: 3, borderRadius: 3, background: i <= step ? "var(--amber)" : "var(--border)", transition: "all 0.3s" }} />)}
          </div>
        </div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700, color: "var(--cream)", marginTop: 22, lineHeight: 1.2 }}>{steps[step].title}</h1>
        <p style={{ color: "var(--muted)", marginTop: 9, fontSize: 14, lineHeight: 1.7 }}>{steps[step].sub}</p>
        {steps[step].content}
        <div className="flex-between mt-24">
          <button className="btn btn-ghost" onClick={() => setStep(p => p - 1)} style={{ visibility: step === 0 ? "hidden" : "visible" }}>← Back</button>
          <button className="btn btn-primary" onClick={() => step < steps.length - 1 ? setStep(p => p + 1) : onComplete({ name, age, interests: selectedInterests, strengths: selectedStrengths, learningStyle, goals })} disabled={!canProceed()} style={{ opacity: canProceed() ? 1 : 0.4 }}>
            {step === steps.length - 1 ? "Build My Dashboard →" : "Continue →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── STUDENT: AI TUTOR ────────────────────────────────────────────────────────

function AITutor({ open, onClose, context, apiKey }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: "assistant", content: context ? `I'm your AI tutor. I can see you're working on **${context}**. What would you like help with — understanding concepts, finding resources, or thinking through your approach?` : "I'm your AI tutor. What are you working on today? I'm here to help you think through ideas, understand concepts, or figure out your next steps." }]);
    }
  }, [open]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    if (!apiKey) {
      setMessages(prev => [...prev, { role: "assistant", content: "The AI Tutor needs an Anthropic API key to work. Ask your teacher to add one in the API Settings panel." }]);
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 800,
          system: `You are a Socratic AI tutor for a self-directed homeschool teen on the Forge platform. You ask questions rather than just giving answers. You're warm, encouraging, and intellectually curious. Keep responses concise and conversational. Context: ${context || "general learning"}`,
          messages: [...messages.filter(m => m.role !== "assistant" || messages.indexOf(m) > 0).map(m => ({ role: m.role, content: m.content })), userMsg],
        }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.content?.[0]?.text || "Something went wrong. Please try again." }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Couldn't connect to the AI right now. Check your API key in settings." }]);
    }
    setLoading(false);
  };

  return (
    <Modal open={open} onClose={onClose} title="🤖 AI Tutor">
      <div className="ai-chat">
        <div className="ai-messages">
          {messages.map((m, i) => (
            <div key={i} className={`ai-msg ${m.role}`}>{m.content}</div>
          ))}
          {loading && <div className="ai-msg assistant" style={{ opacity: 0.6 }}>Thinking…</div>}
          <div ref={bottomRef} />
        </div>
        <div className="ai-input-row">
          <input className="input" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Ask anything…" />
          <button className="btn btn-primary btn-sm" onClick={send} disabled={loading || !input.trim()}>Send</button>
        </div>
      </div>
    </Modal>
  );
}

// ─── STUDENT: DASHBOARD ───────────────────────────────────────────────────────

function StudentDashboard({ student, completed, points, content, weekPlan, grabbedGigs, onNavigate, boards, setBoards, saveToBoard, onComplete, onUncomplete, journalEntries, habitDefs, habitLogs, setHabitLogs, goals, messages }) {
  const pct = Math.round((points / content.areas.reduce((a,b)=>a+(b.target||0),0)) * 100);
  const todayDrop = content.dailyDrops.find(d => d.date === todayStr()) || null;
  const myInterests = student.interests || [];
  const suggestedSkills = content.skills.filter(s => s.interests?.some(i => myInterests.includes(i)) && !completed.includes(s.id)).slice(0, 3);
  const recentCompleted = completed.slice(-6).reverse();
  const activeGigs = content.gigs.filter(g => grabbedGigs?.[g.id] && !completed.includes(g.id));
  const weekTotal = Object.values(weekPlan).flat().filter(x => x).length;
  const weekTarget = 15;

  return (
    <div>
      <div className="page-header">
        <div className="flex-between">
          <div>
            <p style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 2, marginBottom: 4 }}>Welcome back</p>
            <h1 className="page-title">{student.name} 👋</h1>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 38, fontWeight: 700, color: "var(--amber)", lineHeight: 1 }}>{points}</div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>of {content.areas.reduce((a,b)=>a+(b.target||0),0)} pts · {pct}%</div>
          </div>
        </div>
        <div style={{ marginTop: 14, height: 5, background: "var(--border)", borderRadius: 5, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, var(--amber), var(--amber-soft))", borderRadius: 5, transition: "width 0.8s ease" }} />
        </div>
      </div>

      <div className="page-content">
        <div className="grid-4 mb-20">
          {[
            { num: completed.filter(id => content.skills.find(s => s.id === id)).length, label: "Skills Mastered", color: "var(--sage)" },
            { num: completed.filter(id => content.projects.find(p => p.id === id)).length, label: "Projects Done", color: "var(--amber)" },
            { num: completed.filter(id => content.gigs.find(g => g.id === id)).length, label: "Gigs Completed", color: "var(--sky)" },
            { num: `${weekTotal}/${weekTarget}`, label: "This Week", color: "var(--lavender)" },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div className="stat-num" style={{ color: s.color }}>{s.num}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid-2" style={{ gap: 20 }}>
          <div>
            {/* Messages Widget */}
            <MessagesWidget messages={messages} studentId={student.id} onNavigate={onNavigate} />

            {/* Today's Drop */}
            {todayDrop && (todayDrop.video || todayDrop.journal || todayDrop.kindnessChallenge || todayDrop.careerSpotlights?.length > 0) && (
              <div className="drop-card mb-16" style={{ background: "var(--amber-dim)", borderColor: "rgba(0,212,255,0.35)" }}>
                <div className="flex-between mb-8">
                  <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: "var(--amber)", fontWeight: 700 }}>Today's Drop · {formatDisplayDate(todayStr())}</span>
                </div>
                <div className="flex gap-8 mb-10 flex-wrap">
                  {todayDrop.video && <span className="tag tag-sky">📹 Video</span>}
                  {todayDrop.journal && <span className="tag tag-amber">📓 Journal</span>}
                  {todayDrop.careerSpotlights?.length > 0 && <span className="tag tag-lavender">💼 Career</span>}
                  {todayDrop.kindnessChallenge && <span className="tag tag-sage">💛 Kindness</span>}
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("drops")}>Open Today's Drop →</button>
              </div>
            )}

            {/* Weekly Rhythm */}
            <div className="card mb-16">
              <div className="flex-between mb-12">
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, color: "var(--cream)" }}>This Week</h3>
                <div className="flex-center gap-8">
                  <ProgressRing pct={Math.round((weekTotal / weekTarget) * 100)} size={36} stroke={3} />
                  <button className="btn btn-ghost btn-xs" onClick={() => onNavigate("planner")}>Open Planner →</button>
                </div>
              </div>
              {[
                { label: "Skills", target: 10, done: (weekPlan.skills || []).filter(Boolean).length, color: "var(--amber)" },
                { label: "Mission", target: 1, done: weekPlan.mission ? 1 : 0, color: "var(--clay)" },
                { label: "Sandbox Gig", target: 1, done: weekPlan.gig ? 1 : 0, color: "var(--sky)" },
                { label: "Ripple Mission", target: 1, done: weekPlan.ripple ? 1 : 0, color: "var(--sage)" },
                { label: "Teen's Guide", target: 1, done: weekPlan.guide ? 1 : 0, color: "var(--lavender)" },
                { label: "Light Room", target: 1, done: weekPlan.lightroom ? 1 : 0, color: "var(--sky)" },
              ].map(row => (
                <div key={row.label} className="flex-between mb-8">
                  <span style={{ fontSize: 12, color: "var(--cream-dim)" }}>{row.label}</span>
                  <div className="flex-center gap-8">
                    {Array.from({ length: row.target }).map((_, i) => (
                      <div key={i} style={{ width: 10, height: 10, borderRadius: 3, background: i < row.done ? row.color : "var(--border)" }} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            {/* Goals Widget */}
            <GoalsWidget goals={goals} onNavigate={onNavigate} />

            {/* Habits & Chores Widget */}
            <HabitsWidget habitDefs={habitDefs || []} habitLogs={habitLogs} setHabitLogs={setHabitLogs} student={student} onComplete={onComplete} onNavigate={onNavigate} />

            {/* Active Gigs */}
            {activeGigs.length > 0 && (
              <div className="card mb-16" style={{ borderColor: "rgba(96,144,184,0.4)", background: "rgba(77,143,255,0.05)" }}>
                <div className="flex-between mb-12">
                  <div className="flex-center gap-8">
                    <span style={{ fontSize: 16 }}>⚡</span>
                    <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--sky)" }}>Active Gigs</h3>
                  </div>
                  <button className="btn btn-ghost btn-xs" onClick={() => onNavigate("factions")}>View All →</button>
                </div>
                {activeGigs.map(gig => {
                  const faction = FACTIONS.find(f => f.id === gig.faction);
                  return (
                    <div key={gig.id} onClick={() => onNavigate("factions")}
                      style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: "var(--r)", background: "var(--bg3)", border: "1px solid var(--border)", marginBottom: 8, cursor: "pointer", transition: "all 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = "var(--sky)"}
                      onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
                      <span style={{ fontSize: 18, flexShrink: 0 }}>{faction?.icon || "⚡"}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--cream)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{gig.title}</div>
                        <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                          {faction?.name}{gig.time ? ` · ${gig.time}` : ""}
                        </div>
                      </div>
                      <span className="pts-badge" style={{ flexShrink: 0 }}>{gig.pts || 0} pts</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Right column end */}

            {/* Recently Completed */}
            {recentCompleted.length > 0 && (
              <>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, color: "var(--cream)", marginBottom: 12, marginTop: 20 }}>Recently Completed</h3>
                {recentCompleted.map(id => {
                  const item = [...content.skills, ...content.projects, ...content.gigs, ...content.ripple].find(x => x.id === id);
                  return item ? (
                    <div key={id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, padding: "8px 10px", background: "var(--bg3)", borderRadius: "var(--r)", border: "1px solid var(--border)" }}>
                      <span style={{ color: "var(--sage)", fontSize: 14 }}>✓</span>
                      <span style={{ fontSize: 13, color: "var(--cream-dim)", flex: 1 }}>{item.name || item.title}</span>
                      <span className="pts-badge" style={{ fontSize: 10 }}>{item.pts}pts</span>
                      <button className="btn btn-ghost btn-xs" style={{ fontSize: 10 }}
                        onClick={() => onUncomplete(id, item.pts || 0)} title="Mark as not done">Undo</button>
                    </div>
                  ) : null;
                })}
              </>
            )}
          </div>
        </div>

        {/* Suggested skills */}
        {suggestedSkills.length > 0 && (
          <div className="mt-20">
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, color: "var(--cream)", marginBottom: 12 }}>Suggested for You</h3>
            <div className="grid-3" style={{ gap: 10 }}>
              {suggestedSkills.map(skill => (
                <div key={skill.id} className="card-sm flex-center gap-12" style={{ cursor: "pointer" }} onClick={() => onNavigate("skills")}>
                  <span style={{ fontSize: 22 }}>{skill.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--cream)" }}>{skill.name}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{skill.desc?.substring(0, 55)}…</div>
                  </div>
                  <div className="flex-center gap-6">
                    <span className="pts-badge">{skill.pts}pts</span>
                    <SaveButton item={{ ...skill, type: "skill" }} boards={boards} onSaveToBoard={saveToBoard} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Journal Entries */}
        {(() => {
          const entries = Object.entries(journalEntries || {})
            .filter(([, e]) => e?.text?.trim())
            .sort((a, b) => (b[1].dropDate || "").localeCompare(a[1].dropDate || ""))
            .slice(0, 3);
          if (entries.length === 0) return null;
          return (
            <div className="mt-20">
              <div className="flex-between mb-12">
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, color: "var(--cream)" }}>Recent Journal Entries</h3>
                <button className="btn btn-ghost btn-xs" onClick={() => onNavigate("journal")}>View All →</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {entries.map(([dropId, entry]) => (
                  <div key={dropId} onClick={() => onNavigate("journal")}
                    style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", padding: "14px 18px", cursor: "pointer", borderLeft: "3px solid var(--amber)", transition: "border-color 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "var(--amber)"}
                    onMouseLeave={e => e.currentTarget.style.borderLeft = "3px solid var(--amber)"}>
                    <div className="flex-between mb-6">
                      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--amber)", textTransform: "uppercase", letterSpacing: 1.5 }}>
                        📓 {entry.title || "Journal"} · {entry.dropDate ? formatDisplayDate(entry.dropDate) : ""}
                      </span>
                    </div>
                    <p style={{ fontSize: 13, color: "var(--cream-dim)", lineHeight: 1.65, margin: 0 }}>
                      {entry.text.length > 140 ? entry.text.substring(0, 140) + "…" : entry.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Pin Boards */}
        <PinBoards boards={boards} setBoards={setBoards} content={content} onNavigate={onNavigate} />
      </div>
    </div>
  );
}

// ─── STUDENT: WEEKLY PLANNER ──────────────────────────────────────────────────

// ─── PLANNER PICKER: grouped item row ─────────────────────────────────────────

function PlannerPickerRow({ item, isSelected, isDone, accentColor, onPick }) {
  return (
    <div onClick={() => !isDone && onPick(item)}
      style={{
        display: "flex", alignItems: "center", gap: 12, padding: "10px 13px",
        borderRadius: "var(--r)", cursor: isDone ? "default" : "pointer",
        border: `1px solid ${isSelected ? (accentColor || "var(--amber)") : "var(--border)"}`,
        background: isSelected ? (accentColor || "var(--amber)") + "18" : "var(--bg3)",
        opacity: isDone ? 0.5 : 1, transition: "all 0.12s",
      }}>
      <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon || "◈"}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--cream)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name || item.title}</div>
        {item.desc && <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{String(item.desc).substring(0, 75)}</div>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        {item.pts && <span className="pts-badge">{item.pts}pts</span>}
        {isDone && <span className="tag tag-sage" style={{ fontSize: 10 }}>Done</span>}
        {isSelected && <span style={{ color: accentColor || "var(--amber)", fontWeight: 800, fontSize: 16 }}>✓</span>}
      </div>
    </div>
  );
}

// ─── PLANNER PICKER: grouped section header ────────────────────────────────────

function PickerGroup({ label, icon, color, count, isOpen, onToggle, children }) {
  return (
    <div style={{ marginBottom: 4 }}>
      <div onClick={onToggle}
        style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: "var(--r)", cursor: "pointer", userSelect: "none", background: "var(--bg2)", border: "1px solid var(--border)" }}>
        {icon && <span style={{ fontSize: 15 }}>{icon}</span>}
        <span style={{ flex: 1, fontSize: 12, fontWeight: 700, color: color || "var(--cream-dim)", textTransform: "uppercase", letterSpacing: 1 }}>{label}</span>
        <span style={{ fontSize: 11, color: "var(--muted)" }}>{count}</span>
        <span style={{ color: "var(--muted)", fontSize: 11 }}>{isOpen ? "▲" : "▼"}</span>
      </div>
      {isOpen && <div style={{ paddingLeft: 12, paddingTop: 6, display: "flex", flexDirection: "column", gap: 5 }}>{children}</div>}
    </div>
  );
}

// ─── PLANNER PICKER: skills grouped by area → subcat ──────────────────────────

function SkillPickerContent({ pool, areas, weekPlan, completed, onPick }) {
  const [openG, setOpenG] = useState({});
  const [openSC, setOpenSC] = useState({});
  const selectedIds = weekPlan.skills || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {areas.map(area => {
        const areaSkills = pool.filter(s => s.area === area.id);
        if (areaSkills.length === 0) return null;
        const color = `var(${area.color || "--amber"})`;
        const isAreaOpen = openG[area.id] === true;
        const subcats = area.subcats || [];
        const subcatMap = {};
        areaSkills.forEach(s => {
          const k = s.subcat || "__none__";
          if (!subcatMap[k]) subcatMap[k] = [];
          subcatMap[k].push(s);
        });

        return (
          <div key={area.id}>
            {/* Area header */}
            <div onClick={() => setOpenG(p => ({ ...p, [area.id]: !isAreaOpen }))}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: "var(--r)", cursor: "pointer", userSelect: "none", background: "var(--bg2)", border: `1px solid var(--border)`, marginBottom: 2 }}>
              <span style={{ fontSize: 16 }}>{area.icon}</span>
              <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: "var(--cream)" }}>{area.name}</span>
              <span style={{ fontSize: 11, color: "var(--muted)" }}>{areaSkills.length}</span>
              <span style={{ color: "var(--muted)", fontSize: 11 }}>{isAreaOpen ? "▲" : "▼"}</span>
            </div>

            {isAreaOpen && (
              <div style={{ paddingLeft: 14, marginBottom: 6 }}>
                {(() => {
                  const rows = [];
                  // Ordered subcats
                  subcats.forEach(sc => {
                    const scSkills = subcatMap[sc.id] || [];
                    if (!scSkills.length) return;
                    const key = area.id + ":" + sc.id;
                    const isOpen = openSC[key] === true;
                    rows.push(
                      <div key={sc.id} style={{ marginBottom: 4 }}>
                        <div onClick={() => setOpenSC(p => ({ ...p, [key]: !isOpen }))}
                          style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 6, cursor: "pointer", userSelect: "none", background: "var(--bg3)" }}>
                          <span style={{ fontSize: 9, color, fontWeight: 800 }}>◆</span>
                          <span style={{ flex: 1, fontSize: 11, fontWeight: 700, color: "var(--cream-dim)", textTransform: "uppercase", letterSpacing: 1 }}>{sc.name}</span>
                          <span style={{ fontSize: 10, color: "var(--muted)" }}>{scSkills.length}</span>
                          <span style={{ fontSize: 10, color: "var(--muted)" }}>{isOpen ? "▲" : "▼"}</span>
                        </div>
                        {isOpen && (
                          <div style={{ paddingLeft: 10, paddingTop: 4, display: "flex", flexDirection: "column", gap: 4 }}>
                            {scSkills.map(item => (
                              <PlannerPickerRow key={item.id} item={item} isSelected={selectedIds.includes(item.id)}
                                isDone={completed.includes(item.id)} accentColor={color}
                                onPick={onPick} />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  });
                  // Uncategorized
                  const uncat = subcatMap["__none__"] || [];
                  if (uncat.length) {
                    const key = area.id + ":__none__";
                    const isOpen = openSC[key] === true;
                    rows.push(
                      <div key="__none__" style={{ marginBottom: 4 }}>
                        <div onClick={() => setOpenSC(p => ({ ...p, [key]: !isOpen }))}
                          style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 6, cursor: "pointer", userSelect: "none", background: "var(--bg3)" }}>
                          <span style={{ fontSize: 9, color: "var(--muted)", fontWeight: 800 }}>◆</span>
                          <span style={{ flex: 1, fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1 }}>General</span>
                          <span style={{ fontSize: 10, color: "var(--muted)" }}>{uncat.length}</span>
                          <span style={{ fontSize: 10, color: "var(--muted)" }}>{isOpen ? "▲" : "▼"}</span>
                        </div>
                        {isOpen && (
                          <div style={{ paddingLeft: 10, paddingTop: 4, display: "flex", flexDirection: "column", gap: 4 }}>
                            {uncat.map(item => (
                              <PlannerPickerRow key={item.id} item={item} isSelected={selectedIds.includes(item.id)}
                                isDone={completed.includes(item.id)} accentColor={color} onPick={onPick} />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }
                  return rows;
                })()}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── PLANNER PICKER: gigs grouped by faction ──────────────────────────────────

function GigPickerContent({ pool, weekPlan, completed, onPick }) {
  const [openG, setOpenG] = useState({});
  const selectedId = weekPlan.gig?.id || weekPlan.gig;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {FACTIONS.map(faction => {
        const fGigs = pool.filter(g => g.faction === faction.id);
        if (!fGigs.length) return null;
        const isOpen = openG[faction.id] === true;
        const color = `var(--${faction.color})`;
        return (
          <PickerGroup key={faction.id} label={faction.name} icon={faction.icon} color={color}
            count={fGigs.length} isOpen={isOpen} onToggle={() => setOpenG(p => ({ ...p, [faction.id]: !isOpen }))}>
            {fGigs.map(item => (
              <PlannerPickerRow key={item.id} item={{ ...item, icon: faction.icon, desc: item.problem || item.deliverable }}
                isSelected={selectedId === item.id} isDone={completed.includes(item.id)}
                accentColor={color} onPick={onPick} />
            ))}
          </PickerGroup>
        );
      })}
    </div>
  );
}

// ─── PLANNER PICKER: ripple grouped by cause ──────────────────────────────────

function RipplePickerContent({ pool, weekPlan, completed, onPick }) {
  const [openG, setOpenG] = useState({});
  const selectedId = weekPlan.ripple?.id || weekPlan.ripple;
  const causes = [...new Set(pool.map(r => r.cause || "General"))];

  const colorMap = { "Connection": "var(--sky)", "Food Security": "var(--amber)", "Education": "var(--sage)",
    "Community": "var(--clay)", "Material Needs": "var(--amber)", "Information Access": "var(--sky)",
    "Service": "var(--lavender)" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {causes.map(cause => {
        const causeItems = pool.filter(r => (r.cause || "General") === cause);
        const isOpen = openG[cause] === true;
        const color = colorMap[cause] || "var(--sage)";
        return (
          <PickerGroup key={cause} label={cause} color={color} count={causeItems.length}
            isOpen={isOpen} onToggle={() => setOpenG(p => ({ ...p, [cause]: !isOpen }))}>
            {causeItems.map(item => (
              <PlannerPickerRow key={item.id} item={item} isSelected={selectedId === item.id}
                isDone={completed.includes(item.id)} accentColor={color} onPick={onPick} />
            ))}
          </PickerGroup>
        );
      })}
    </div>
  );
}

// ─── PLANNER PICKER: projects grouped by theme color ──────────────────────────

function ProjectPickerContent({ pool, weekPlan, completed, onPick }) {
  const [openG, setOpenG] = useState({});
  const selectedId = weekPlan.mission?.id || weekPlan.mission;
  const colorVars = { amber: "var(--amber)", sage: "var(--sage)", clay: "var(--clay)", sky: "var(--sky)", lavender: "var(--lavender)" };
  const colorLabels = { amber: "Entrepreneurship & Life", sage: "Nature & Science", clay: "Community & Craft", sky: "Tech & Story", lavender: "Arts & Design" };
  const themes = [...new Set(pool.map(p => p.color || "amber"))];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {themes.map(theme => {
        const themeItems = pool.filter(p => (p.color || "amber") === theme);
        const isOpen = openG[theme] === true;
        const color = colorVars[theme] || "var(--amber)";
        return (
          <PickerGroup key={theme} label={colorLabels[theme] || theme} color={color} count={themeItems.length}
            isOpen={isOpen} onToggle={() => setOpenG(p => ({ ...p, [theme]: !isOpen }))}>
            {themeItems.map(item => (
              <PlannerPickerRow key={item.id} item={item} isSelected={selectedId === item.id}
                isDone={completed.includes(item.id)} accentColor={color} onPick={onPick} />
            ))}
          </PickerGroup>
        );
      })}
    </div>
  );
}

// ─── PLANNER PICKER: guide/lightroom grouped by category/topic ─────────────────

function SimpleGroupedPickerContent({ pool, groupKey, weekPlanKey, weekPlan, completed, onPick, accentColor }) {
  const [openG, setOpenG] = useState({});
  const selectedId = weekPlan[weekPlanKey]?.id || weekPlan[weekPlanKey];
  const groups = [...new Set(pool.map(i => i[groupKey] || "General"))];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {groups.map(group => {
        const groupItems = pool.filter(i => (i[groupKey] || "General") === group);
        const isOpen = openG[group] === true;
        return (
          <PickerGroup key={group} label={group} color={accentColor} count={groupItems.length}
            isOpen={isOpen} onToggle={() => setOpenG(p => ({ ...p, [group]: !isOpen }))}>
            {groupItems.map(item => (
              <PlannerPickerRow key={item.id} item={item} isSelected={selectedId === item.id}
                isDone={completed.includes(item.id)} accentColor={accentColor} onPick={onPick} />
            ))}
          </PickerGroup>
        );
      })}
    </div>
  );
}

// ─── WEEKLY PLANNER ───────────────────────────────────────────────────────────

function WeeklyPlanner({ content, completed, weekPlan, setWeekPlan, onComplete, onUncomplete }) {
  const [picking, setPicking] = useState(null);
  const [search, setSearch] = useState("");
  const [viewItem, setViewItem] = useState(null); // { item, rhythmKey }

  const RHYTHM = [
    { key: "skills", label: "Skills", count: 10, icon: "◈", color: "var(--amber)", desc: "10 skills to work on this week", pool: content.skills },
    { key: "mission", label: "Mission", count: 1, icon: "🎯", color: "var(--clay)", desc: "1 project or mission", pool: content.projects },
    { key: "gig", label: "Sandbox Gig", count: 1, icon: "⚡", color: "var(--sky)", desc: "1 faction gig to complete", pool: content.gigs },
    { key: "ripple", label: "Ripple Mission", count: 1, icon: "🌊", color: "var(--sage)", desc: "1 act of service or community care", pool: content.ripple },
    { key: "guide", label: "Teen's Guide", count: 1, icon: "📖", color: "var(--lavender)", desc: "1 life skills entry to read", pool: content.teensGuide },
    { key: "lightroom", label: "Light Room", count: 1, icon: "💡", color: "var(--sky)", desc: "1 curated piece to explore", pool: content.lightRoom },
  ];

  const getSlotItems = (rhythm) => {
    if (rhythm.count === 1) return weekPlan[rhythm.key] ? [weekPlan[rhythm.key]] : [];
    return (weekPlan[rhythm.key] || []).filter(Boolean);
  };

  const pickItem = (rhythm, item) => {
    if (rhythm.count === 1) {
      setWeekPlan(p => ({ ...p, [rhythm.key]: item }));
      setPicking(null);
    } else {
      const current = weekPlan[rhythm.key] || [];
      if (current.includes(item.id)) {
        setWeekPlan(p => ({ ...p, [rhythm.key]: current.filter(x => x !== item.id) }));
      } else if (current.length < rhythm.count) {
        setWeekPlan(p => ({ ...p, [rhythm.key]: [...current, item.id] }));
      }
    }
  };

  const removeItem = (rhythmKey, itemId) => {
    if (RHYTHM.find(r => r.key === rhythmKey)?.count === 1) {
      setWeekPlan(p => ({ ...p, [rhythmKey]: null }));
    } else {
      setWeekPlan(p => ({ ...p, [rhythmKey]: (p[rhythmKey] || []).filter(x => x !== itemId) }));
    }
  };

  const totalFilled = RHYTHM.reduce((acc, r) => acc + getSlotItems(r).length, 0);
  const totalTarget = RHYTHM.reduce((a, r) => a + r.count, 0);
  const pickingRhythm = picking ? RHYTHM.find(r => r.key === picking) : null;

  const searchFiltered = pickingRhythm
    ? pickingRhythm.pool.filter(item =>
        (item.name || item.title || "").toLowerCase().includes(search.toLowerCase()) ||
        (item.desc || "").toLowerCase().includes(search.toLowerCase())
      )
    : [];

  // ── Item detail modal renderer ──────────────────────────────────────────────
  const renderItemDetail = () => {
    if (!viewItem) return null;
    const { item, rhythmKey } = viewItem;
    const isDone = completed.includes(item.id);
    const rhythm = RHYTHM.find(r => r.key === rhythmKey);
    const accentColor = rhythm?.color || "var(--amber)";

    // Parse multi-line fields
    const parseLines = (str) => (str || "").split("\n").map(s => s.trim()).filter(Boolean);

    // Render type-specific content
    const renderContent = () => {
      // SKILL
      if (rhythmKey === "skills") return (
        <>
          <p style={{ fontSize: 14, color: "var(--cream-dim)", lineHeight: 1.75, marginBottom: 20 }}>{item.desc}</p>
          {item.how?.length > 0 && (
            <div className="card" style={{ marginBottom: 16 }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 600, color: "var(--cream)", marginBottom: 12 }}>How to Master It</h3>
              {item.how.map((step, i) => (
                <div key={i} className="checklist-item">
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: isDone ? "var(--sage)" : "var(--bg4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: isDone ? "#0c0c16" : "var(--muted)", fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                  <span style={{ fontSize: 13, color: "var(--cream-dim)", lineHeight: 1.6 }}>{step}</span>
                </div>
              ))}
            </div>
          )}
        </>
      );

      // PROJECT / MISSION
      if (rhythmKey === "mission") return (
        <>
          <p style={{ fontSize: 14, color: "var(--cream-dim)", lineHeight: 1.75, marginBottom: 16 }}>{item.desc}</p>
          {item.output && (
            <div style={{ padding: "10px 13px", background: "var(--bg3)", borderRadius: "var(--r)", fontSize: 12, color: "var(--muted)", marginBottom: 16 }}>
              <strong style={{ color: "var(--cream-dim)" }}>Output: </strong>{item.output}
            </div>
          )}
          {item.steps?.length > 0 && (
            <div className="card" style={{ marginBottom: 16 }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 600, color: "var(--cream)", marginBottom: 12 }}>Steps</h3>
              {item.steps.map((step, i) => (
                <div key={i} className="checklist-item">
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--bg4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "var(--muted)", fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                  <span style={{ fontSize: 13, color: "var(--cream-dim)", lineHeight: 1.5 }}>{step}</span>
                </div>
              ))}
            </div>
          )}
          {item.duration && <div className="duration-badge" style={{ marginBottom: 16 }}>🕐 {item.duration}</div>}
        </>
      );

      // GIG
      if (rhythmKey === "gig") {
        const faction = FACTIONS.find(f => f.id === item.faction);
        const deliverables = parseLines(item.deliverable);
        const checklist = parseLines(item.qualityChecklist);
        const tips = parseLines(item.studentTips);
        return (
          <>
            {faction && (
              <div className="flex-center gap-8 mb-12">
                <span style={{ fontSize: 16 }}>{faction.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "var(--" + faction.color + ")" }}>{faction.name}</span>
                {item.difficulty && <span className="tag tag-muted">{item.difficulty}</span>}
                {item.time && <span className="tag tag-muted">⏱ {item.time}</span>}
              </div>
            )}
            {item.clientBackground && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6 }}>Client Background</div>
                <p style={{ fontSize: 13, color: "var(--cream-dim)", lineHeight: 1.75 }}>{item.clientBackground}</p>
              </div>
            )}
            {item.problem && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6 }}>The Problem</div>
                <p style={{ fontSize: 13, color: "var(--cream-dim)", lineHeight: 1.75 }}>{item.problem}</p>
              </div>
            )}
            {deliverables.length > 0 && (
              <div className="card" style={{ marginBottom: 16 }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 600, color: "var(--cream)", marginBottom: 10 }}>Your Deliverables</h3>
                {deliverables.map((d, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, padding: "7px 0", borderBottom: "1px solid var(--border)", fontSize: 13, color: "var(--cream-dim)", lineHeight: 1.5 }}>
                    <span style={{ color: "var(--amber)", flexShrink: 0 }}>→</span>{d}
                  </div>
                ))}
              </div>
            )}
            {!deliverables.length && item.deliverable && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6 }}>Your Deliverable</div>
                <p style={{ fontSize: 13, color: "var(--cream-dim)", lineHeight: 1.75 }}>{item.deliverable}</p>
              </div>
            )}
            {checklist.length > 0 && (
              <div className="card" style={{ marginBottom: 16 }}>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 600, color: "var(--cream)", marginBottom: 10 }}>Quality Checklist</h3>
                {checklist.map((c, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, padding: "7px 0", borderBottom: "1px solid var(--border)", fontSize: 13, color: "var(--cream-dim)" }}>
                    <span style={{ color: "var(--sage)", flexShrink: 0 }}>□</span>{c}
                  </div>
                ))}
              </div>
            )}
            {tips.length > 0 && (
              <div style={{ padding: "12px 14px", background: "var(--amber-dim)", border: "1px solid rgba(0,212,255,0.35)", borderRadius: "var(--r)", marginBottom: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "var(--amber)", textTransform: "uppercase", marginBottom: 6 }}>💡 Tips</div>
                {tips.map((t, i) => <div key={i} style={{ fontSize: 12, color: "var(--cream-dim)", lineHeight: 1.7 }}>{t}</div>)}
              </div>
            )}
            {item.reflectionPrompt && (
              <div style={{ padding: "12px 14px", background: "var(--bg3)", borderRadius: "var(--r)", marginBottom: 16, border: "1px solid var(--border)", fontSize: 13, color: "var(--muted)", fontStyle: "italic" }}>
                💭 {item.reflectionPrompt}
              </div>
            )}
          </>
        );
      }

      // RIPPLE
      if (rhythmKey === "ripple") return (
        <>
          {item.cause && <span className="tag tag-sage" style={{ marginBottom: 14, display: "inline-flex" }}>{item.cause}</span>}
          <p style={{ fontSize: 14, color: "var(--cream-dim)", lineHeight: 1.75, marginBottom: 16 }}>{item.desc}</p>
          {item.steps?.length > 0 && (
            <div className="card" style={{ marginBottom: 16 }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 600, color: "var(--cream)", marginBottom: 12 }}>How to Complete It</h3>
              {item.steps.map((step, i) => (
                <div key={i} className="checklist-item">
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: "var(--bg4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "var(--muted)", fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                  <span style={{ fontSize: 13, color: "var(--cream-dim)", lineHeight: 1.5 }}>{step}</span>
                </div>
              ))}
            </div>
          )}
        </>
      );

      // TEEN'S GUIDE
      if (rhythmKey === "guide") return (
        <>
          <div className="flex gap-8 mb-16">
            {item.category && <span className="tag tag-sky">{item.category}</span>}
            {item.readTime && <span className="tag tag-muted">📖 {item.readTime}</span>}
          </div>
          <div className="card" style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 14, color: "var(--cream-dim)", lineHeight: 1.85 }}>{item.content}</p>
          </div>
        </>
      );

      // LIGHT ROOM
      if (rhythmKey === "lightroom") return (
        <>
          <div className="flex gap-8 mb-16">
            {item.type && <span className="tag tag-lavender">{item.type}</span>}
            {item.topic && <span className="tag tag-muted">{item.topic}</span>}
            {item.duration && <span className="tag tag-muted">{item.duration}</span>}
          </div>
          <div className="card" style={{ border: "1px solid rgba(176,96,255,0.35)", marginBottom: 16 }}>
            <p style={{ fontSize: 14, color: "var(--cream-dim)", lineHeight: 1.85 }}>{item.content}</p>
          </div>
        </>
      );

      return <p style={{ fontSize: 13, color: "var(--muted)" }}>No detail available.</p>;
    };

    return (
      <Modal open={!!viewItem} onClose={() => setViewItem(null)} size="modal-lg"
        title={item.name || item.title || "Item Detail"}
        footer={
          <div style={{ display: "flex", gap: 10, justifyContent: "space-between", width: "100%" }}>
            <button className="btn btn-ghost" onClick={() => setViewItem(null)}>Close</button>
            <div className="flex gap-8">
              {isDone ? (
                <>
                  <div className="flex-center gap-6" style={{ color: "var(--sage)", fontSize: 13, fontWeight: 600 }}>
                    <span>✓</span><span>Done! +{item.pts || 0} pts</span>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => { onUncomplete(item.id, item.pts || 0); setViewItem(null); }}>↩ Undo</button>
                </>
              ) : (
                <button className="btn btn-sage" onClick={() => { onComplete(item.id, item.pts || 0); setViewItem(null); }}>
                  Mark Complete ✓ {item.pts ? "+ " + item.pts + " pts" : ""}
                </button>
              )}
            </div>
          </div>
        }>

        {/* Header */}
        <div className="flex-center gap-12 mb-20" style={{ paddingBottom: 16, borderBottom: "1px solid var(--border)" }}>
          <div style={{ width: 48, height: 48, borderRadius: "var(--r)", background: accentColor + "18", border: "2px solid " + accentColor + "44", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
            {item.icon || rhythm?.icon || "📌"}
          </div>
          <div>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: accentColor, fontWeight: 700, marginBottom: 3 }}>{rhythm?.label}</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "var(--cream)", lineHeight: 1.2 }}>{item.name || item.title}</div>
            {item.pts > 0 && <span className="pts-badge" style={{ marginTop: 6, display: "inline-flex" }}>⭐ {item.pts} pts</span>}
          </div>
          {isDone && <span className="tag tag-sage" style={{ marginLeft: "auto" }}>✓ Done</span>}
        </div>

        {/* Type-specific content */}
        <div style={{ maxHeight: "60vh", overflowY: "auto", paddingRight: 4 }}>
          {renderContent()}
        </div>
      </Modal>
    );
  };

  // ── Picker body renderer ────────────────────────────────────────────────────
  const renderPickerBody = () => {
    if (!pickingRhythm) return null;
    const r = pickingRhythm;

    if (search.trim()) {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {searchFiltered.length === 0
            ? <div style={{ textAlign: "center", color: "var(--muted)", padding: 24 }}>No items found</div>
            : searchFiltered.map(item => {
                const isSelected = r.count === 1
                  ? (weekPlan[r.key]?.id === item.id || weekPlan[r.key] === item.id)
                  : (weekPlan[r.key] || []).includes(item.id);
                return (
                  <PlannerPickerRow key={item.id} item={item} isSelected={isSelected}
                    isDone={completed.includes(item.id)} accentColor={r.color}
                    onPick={(it) => pickItem(r, it)} />
                );
              })}
        </div>
      );
    }

    if (r.key === "skills") return (
      <SkillPickerContent pool={r.pool} areas={content.areas} weekPlan={weekPlan}
        completed={completed} onPick={(item) => pickItem(r, item)} />
    );
    if (r.key === "gig") return (
      <GigPickerContent pool={r.pool} weekPlan={weekPlan} completed={completed}
        onPick={(item) => pickItem(r, item)} />
    );
    if (r.key === "ripple") return (
      <RipplePickerContent pool={r.pool} weekPlan={weekPlan} completed={completed}
        onPick={(item) => pickItem(r, item)} />
    );
    if (r.key === "mission") return (
      <ProjectPickerContent pool={r.pool} weekPlan={weekPlan} completed={completed}
        onPick={(item) => pickItem(r, item)} />
    );
    if (r.key === "guide") return (
      <SimpleGroupedPickerContent pool={r.pool} groupKey="category" weekPlanKey="guide"
        weekPlan={weekPlan} completed={completed} accentColor="var(--lavender)"
        onPick={(item) => pickItem(r, item)} />
    );
    if (r.key === "lightroom") return (
      <SimpleGroupedPickerContent pool={r.pool} groupKey="topic" weekPlanKey="lightroom"
        weekPlan={weekPlan} completed={completed} accentColor="var(--sky)"
        onPick={(item) => pickItem(r, item)} />
    );
    return null;
  };

  // ── Slot renderer helper ────────────────────────────────────────────────────
  const renderSlotItem = (item, itemId, rhythmKey, rhythm) => {
    const isDone = completed.includes(itemId);
    return (
      <div key={itemId} className="planner-slot filled"
        style={{ cursor: "pointer", transition: "all 0.15s" }}
        onClick={() => setViewItem({ item, rhythmKey })}
        onMouseEnter={e => e.currentTarget.style.borderColor = rhythm.color}
        onMouseLeave={e => e.currentTarget.style.borderColor = isDone ? "var(--sage)" : "var(--border)"}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: isDone ? 16 : 16 }}>{isDone ? "✅" : (item.icon || rhythm.icon || "◈")}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: isDone ? "var(--sage)" : "var(--cream)", textDecoration: isDone ? "line-through" : "none", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {item.name || item.title}
            </div>
            <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>
              {isDone ? "Done ✓" : "Tap to open & complete"} {item.pts ? "· " + item.pts + " pts" : ""}
            </div>
          </div>
        </div>
        <div className="flex gap-4" onClick={e => e.stopPropagation()}>
          {isDone && (
            <button className="btn btn-ghost btn-xs" style={{ fontSize: 10 }} onClick={() => onUncomplete(itemId, item.pts || 0)} title="Undo">↩</button>
          )}
          <button className="btn btn-ghost btn-xs" onClick={() => removeItem(rhythmKey, itemId)} title="Remove from plan">✕</button>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="page-header">
        <div className="flex-between">
          <div>
            <h1 className="page-title">📅 Weekly Planner</h1>
            <p className="page-sub">Pick what you'll work on this week. Tap any item to open and complete it.</p>
          </div>
          <div className="flex-center gap-10">
            <ProgressRing pct={Math.round((totalFilled / totalTarget) * 100)} size={48} stroke={4} />
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "var(--amber)" }}>{totalFilled}/{totalTarget}</div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>slots filled</div>
            </div>
          </div>
        </div>
      </div>

      <div className="page-content">
        <div className="card mb-20" style={{ background: "var(--bg3)" }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: "var(--muted)", marginBottom: 10 }}>Weekly Rhythm Guide</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {RHYTHM.map(r => (
              <div key={r.key} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 20, background: "var(--bg2)", border: "1px solid var(--border)" }}>
                <span style={{ color: r.color }}>{r.icon}</span>
                <span style={{ fontSize: 12, color: "var(--cream-dim)" }}>{r.count}× {r.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {RHYTHM.map(rhythm => {
            const slotItems = getSlotItems(rhythm);
            const filled = slotItems.length;
            const target = rhythm.count;
            const doneCount = rhythm.count === 1
              ? (slotItems[0] && completed.includes(slotItems[0]?.id || slotItems[0]) ? 1 : 0)
              : (weekPlan[rhythm.key] || []).filter(id => completed.includes(id)).length;

            return (
              <div key={rhythm.key} className="card">
                <div className="flex-between mb-12">
                  <div className="flex-center gap-10">
                    <span style={{ fontSize: 20, color: rhythm.color }}>{rhythm.icon}</span>
                    <div>
                      <div style={{ fontWeight: 600, color: "var(--cream)", fontSize: 15 }}>{rhythm.label}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>{rhythm.desc}</div>
                    </div>
                  </div>
                  <div className="flex-center gap-8">
                    {/* Progress dots */}
                    {Array.from({ length: target }).map((_, i) => (
                      <div key={i} style={{ width: 10, height: 10, borderRadius: 3, background: i < doneCount ? "var(--sage)" : i < filled ? rhythm.color : "var(--border)" }} />
                    ))}
                    {filled < target && (
                      <button className="btn btn-ghost btn-xs" style={{ marginLeft: 4, borderColor: rhythm.color, color: rhythm.color }}
                        onClick={() => { setPicking(rhythm.key); setSearch(""); }}>
                        + Add
                      </button>
                    )}
                  </div>
                </div>

                {slotItems.length === 0 ? (
                  <div className="planner-slot empty" onClick={() => { setPicking(rhythm.key); setSearch(""); }}>
                    <div style={{ textAlign: "center", color: "var(--muted)", fontSize: 13 }}>Click to pick {rhythm.label.toLowerCase()}</div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {rhythm.count === 1 ? (() => {
                      const itemId = weekPlan[rhythm.key]?.id || weekPlan[rhythm.key];
                      const item = rhythm.pool.find(i => i.id === itemId) || weekPlan[rhythm.key];
                      if (!item) return null;
                      return renderSlotItem(item, item.id, rhythm.key, rhythm);
                    })() : (weekPlan[rhythm.key] || []).map(itemId => {
                      const item = rhythm.pool.find(i => i.id === itemId);
                      if (!item) return null;
                      return renderSlotItem(item, itemId, rhythm.key, rhythm);
                    })}
                    {rhythm.count > 1 && filled < target && (
                      <div className="planner-slot empty" onClick={() => { setPicking(rhythm.key); setSearch(""); }}>
                        <div style={{ textAlign: "center", color: "var(--muted)", fontSize: 12 }}>+ Add more ({target - filled} remaining)</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Item detail modal */}
      {renderItemDetail()}

      {/* Picker modal */}
      <Modal open={!!picking} onClose={() => setPicking(null)}
        title={"Pick " + (pickingRhythm?.label || "") + (pickingRhythm?.count > 1 ? " (" + (weekPlan[picking] || []).length + "/" + pickingRhythm.count + ")" : "")}
        size="modal-lg"
        footer={<button className="btn btn-primary" onClick={() => setPicking(null)}>Done</button>}>
        <div className="search-bar mb-14" style={{ marginBottom: 14 }}>
          <span style={{ color: "var(--muted)" }}>🔍</span>
          <input placeholder={"Search " + (pickingRhythm?.label?.toLowerCase() || "") + "…"} value={search} onChange={e => setSearch(e.target.value)} autoFocus />
        </div>
        {pickingRhythm?.count > 1 && (
          <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12, padding: "7px 10px", background: "var(--bg3)", borderRadius: "var(--r)", border: "1px solid var(--border)" }}>
            Select up to {pickingRhythm.count} skills — {(weekPlan[picking] || []).length} chosen so far. Click a selected skill to deselect it.
          </div>
        )}
        <div style={{ maxHeight: 480, overflowY: "auto", paddingRight: 2 }}>
          {renderPickerBody()}
        </div>
      </Modal>
    </div>
  );
}

// ─── STUDENT: SKILL EXPLORER ──────────────────────────────────────────────────

function SkillExplorer({ student, completed, content, apiKey, onComplete, onUncomplete, onSubmitApproval, boards, saveToBoard, submissions, setSubmission }) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [tutorOpen, setTutorOpen] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [showApproval, setShowApproval] = useState(false);
  const [openAreas, setOpenAreas] = useState({});   // area.id → bool, default true
  const [openSubcats, setOpenSubcats] = useState({}); // "areaId:subcatId" → bool, default true

  const skills = content.skills;
  const myInterests = student.interests || [];

  const filtered = skills.filter(s => {
    const matchArea = filter === "all" || filter === "interest" && s.interests?.some(i => myInterests.includes(i)) || s.area === filter;
    const matchSearch = (s.name + s.desc).toLowerCase().includes(search.toLowerCase());
    return matchArea && matchSearch;
  });

  if (selected) {
    const isDone = completed.includes(selected.id);
    return (
      <div>
        <div className="page-header">
          <button className="btn btn-ghost btn-sm mb-8" onClick={() => setSelected(null)}>← Back to Skills</button>
          <div className="flex-between">
            <div>
              <div className="flex-center gap-10 mb-4">
                <span style={{ fontSize: 26 }}>{selected.icon}</span>
                <div>
                  <span style={{ color: areaColor(selected.area, content.areas), fontSize: 11, textTransform: "uppercase", letterSpacing: 2, fontWeight: 700 }}>
                    {content.areas.find(a => a.id === selected.area)?.name}
                  </span>
                  {selected.subcat && (() => {
                    const area = content.areas.find(a => a.id === selected.area);
                    const sc = area?.subcats?.find(s => s.id === selected.subcat);
                    return sc ? <span style={{ color: "var(--muted)", fontSize: 11 }}> › {sc.name}</span> : null;
                  })()}
                </div>
              </div>
              <h1 className="page-title">{selected.name}</h1>
            </div>
            <div className="flex gap-8">
              <span className="pts-badge" style={{ fontSize: 14, padding: "5px 14px" }}>⭐ {selected.pts} pts</span>
              <SaveButton item={{ ...selected, type: "skill" }} boards={boards} onSaveToBoard={saveToBoard} />
            </div>
          </div>
        </div>
        <div className="page-content">
          <div className="grid-2" style={{ gap: 24 }}>
            <div>
              <div className="card mb-16">
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, color: "var(--cream)", marginBottom: 10 }}>What You'll Learn</h3>
                <p style={{ fontSize: 14, color: "var(--cream-dim)", lineHeight: 1.7 }}>{selected.desc}</p>
              </div>
              <div className="card">
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, color: "var(--cream)", marginBottom: 12 }}>How to Master It</h3>
                {(selected.how || []).map((step, i) => (
                  <div key={i} className="checklist-item">
                    <div style={{ width: 22, height: 22, borderRadius: 50, background: isDone ? "var(--sage)" : "var(--bg4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: isDone ? "#0c0c16" : "var(--muted)", fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                    <span style={{ fontSize: 13, color: "var(--cream-dim)", lineHeight: 1.6 }}>{step}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="card mb-16">
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, color: "var(--cream)", marginBottom: 12 }}>Actions</h3>
                {isDone ? (
                  <>
                    <div className="flex-center gap-8 mb-12" style={{ color: "var(--sage)" }}>
                      <span style={{ fontSize: 20 }}>✓</span>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>Mastered! +{selected.pts} points</span>
                    </div>
                    <button className="btn btn-ghost btn-sm" style={{ width: "100%", marginBottom: 8 }} onClick={() => onUncomplete(selected.id, selected.pts)}>↩ Mark as Not Mastered</button>
                  </>
                ) : (
                  <>
                    <button className="btn btn-primary mb-8" style={{ width: "100%" }} onClick={() => setShowApproval(true)}>Submit for Mastery Check ✓</button>
                    <button className="btn btn-ghost btn-sm" style={{ width: "100%" }} onClick={() => setTutorOpen(true)}>🤖 Ask AI Tutor</button>
                  </>
                )}
              </div>
              {selected.interests?.length > 0 && (
                <div className="card">
                  <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: "var(--muted)", marginBottom: 10 }}>Related Interest Areas</div>
                  <div className="pill-row">
                    {selected.interests.map(id => {
                      const int = INTERESTS.find(i => i.id === id);
                      return int ? <span key={id} className={`tag tag-${int.color}`}>{int.icon} {int.label}</span> : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
          {selected.blocks?.length > 0 && (
            <ContentBlockRenderer blocks={selected.blocks} apiKey={apiKey} context={selected.name} />
          )}

          {/* Submission / Portfolio Documentation */}
          <div style={{ marginTop: 32, background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", background: "var(--bg3)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 18 }}>📁</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--cream)" }}>My Portfolio Submission</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>Document your work with text, images, links, and files — this appears in your portfolio</div>
              </div>
              {(submissions[selected.id]?.blocks?.length > 0) && (
                <span className="tag tag-sage" style={{ fontSize: 10 }}>📁 {submissions[selected.id].blocks.length} block{submissions[selected.id].blocks.length !== 1 ? "s" : ""} saved</span>
              )}
            </div>
            <div style={{ padding: 20 }}>
              <SubmissionBuilder
                submission={submissions[selected.id]}
                onChange={(updated) => setSubmission(selected.id, updated)}
                itemTitle={selected.name}
              />
            </div>
          </div>
        </div>
        <AITutor open={tutorOpen} onClose={() => setTutorOpen(false)} context={selected.name} apiKey={apiKey} />
        <Modal open={showApproval} onClose={() => setShowApproval(false)} title="Submit Mastery Check"
          footer={<><button className="btn btn-ghost" onClick={() => setShowApproval(false)}>Cancel</button><button className="btn btn-primary" onClick={() => { onSubmitApproval({ skillId: selected.id, skillName: selected.name, pts: selected.pts, notes: approvalNotes }); setShowApproval(false); onComplete(selected.id, selected.pts); }}>Submit →</button></>}>
          <p style={{ fontSize: 13, color: "var(--cream-dim)", lineHeight: 1.7, marginBottom: 16 }}>Tell your teacher what you did to master this skill. Include evidence — what you made, wrote, built, or documented.</p>
          <textarea className="input textarea" style={{ minHeight: 100 }} value={approvalNotes} onChange={e => setApprovalNotes(e.target.value)} placeholder="Describe your evidence for mastery. What did you create or accomplish? How do you know you've mastered this?" />
        </Modal>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">◈ Skill Explorer</h1>
        <p className="page-sub">{skills.length} skills · {completed.filter(id => skills.find(s => s.id === id)).length} mastered</p>
      </div>
      <div className="page-content">
        <div className="flex gap-10 mb-16">
          <div className="search-bar" style={{ flex: 1, marginBottom: 0 }}>
            <span style={{ color: "var(--muted)" }}>🔍</span>
            <input placeholder="Search skills…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => setTutorOpen(true)}>🤖 AI Tutor</button>
        </div>

        {/* Area filter pills */}
        <div className="filter-row">
          {[{ id: "all", label: "All Skills", icon: "" }, { id: "interest", label: "My Interests ✦", icon: "" }, ...content.areas].map(a => (
            <button key={a.id} className={`filter-btn ${filter === a.id ? "active" : ""}`} onClick={() => setFilter(a.id)}>
              {a.icon && `${a.icon} `}{a.label || a.name}
            </button>
          ))}
        </div>

        {/* Category → Subcategory Accordion */}
        {(() => {
          // If searching, flatten to a grid
          if (search.trim()) {
            return filtered.length === 0
              ? <EmptyState icon="◈" title="No skills found" sub="Try a different search term." />
              : (
                <div className="grid-3">
                  {filtered.map(skill => {
                    const isDone = completed.includes(skill.id);
                    return (
                      <div key={skill.id} className={`skill-card ${isDone ? "done" : ""}`} onClick={() => setSelected(skill)}>
                        <div className="flex-between mb-6">
                          <span style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: areaColor(skill.area, content.areas) }}>{skill.pts}</span>
                          <span style={{ fontSize: 22 }}>{skill.icon}</span>
                        </div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: "var(--cream)", marginBottom: 4 }}>{skill.name}</div>
                        <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>{skill.desc?.substring(0, 70)}…</div>
                        {isDone && <div style={{ marginTop: 8, color: "var(--sage)", fontSize: 12, fontWeight: 600 }}>✓ Mastered</div>}
                      </div>
                    );
                  })}
                </div>
              );
          }

          // Accordion view grouped by area → subcat
          const areasToShow = filter === "all" || filter === "interest"
            ? content.areas
            : content.areas.filter(a => a.id === filter);

          const sections = areasToShow.map(area => {
            const areaSkills = filtered.filter(s => s.area === area.id);
            if (areaSkills.length === 0) return null;
            const subcats = area.subcats || [];
            const subcatMap = {};
            areaSkills.forEach(skill => {
              const key = skill.subcat || "__none__";
              if (!subcatMap[key]) subcatMap[key] = [];
              subcatMap[key].push(skill);
            });
            return { area, subcats, subcatMap, areaSkills };
          }).filter(Boolean);

          if (sections.length === 0) return <EmptyState icon="◈" title="No skills found" sub="Try a different filter." />;

          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {sections.map(({ area, subcats, subcatMap, areaSkills }) => {
                const color = `var(${area.color || "--amber"})`;
                const doneCount = areaSkills.filter(s => completed.includes(s.id)).length;
                const pct = areaSkills.length > 0 ? Math.round((doneCount / areaSkills.length) * 100) : 0;
                const isAreaOpen = openAreas[area.id] === true; // default collapsed
                return (
                  <div key={area.id} style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", overflow: "hidden" }}>
                    {/* Area header — click to collapse */}
                    <div onClick={() => setOpenAreas(p => ({ ...p, [area.id]: !isAreaOpen }))}
                      style={{ padding: "14px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, userSelect: "none", background: isAreaOpen ? "var(--bg3)" : "var(--bg2)", transition: "background 0.15s" }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: color + "22", border: `2px solid ${color}55`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{area.icon}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 17, color: "var(--cream)" }}>{area.name}</div>
                        <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                          {areaSkills.length} skill{areaSkills.length !== 1 ? "s" : ""} · {doneCount} mastered
                        </div>
                      </div>
                      {/* Progress mini bar */}
                      <div style={{ textAlign: "right", minWidth: 80 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color, fontFamily: "var(--font-display)" }}>{pct}%</div>
                        <div style={{ width: 80, height: 4, background: "var(--border)", borderRadius: 4, marginTop: 4, overflow: "hidden" }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 4, transition: "width 0.4s" }} />
                        </div>
                      </div>
                      <span style={{ color: "var(--muted)", fontSize: 14, marginLeft: 6 }}>{isAreaOpen ? "▲" : "▼"}</span>
                    </div>

                    {/* Subcategories */}
                    {isAreaOpen && (
                      <div>
                        {(() => {
                          const rows = [];
                          subcats.forEach(sc => {
                            const scSkills = subcatMap[sc.id] || [];
                            if (scSkills.length === 0) return;
                            const scDone = scSkills.filter(s => completed.includes(s.id)).length;
                            const isScOpen = openSubcats[area.id + ":" + sc.id] === true;
                            rows.push(
                              <div key={sc.id} style={{ borderTop: "1px solid var(--border)" }}>
                                {/* Subcat header */}
                                <div onClick={() => setOpenSubcats(p => ({ ...p, [area.id + ":" + sc.id]: !isScOpen }))}
                                  style={{ padding: "10px 20px 10px 56px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, background: "var(--bg3)", userSelect: "none" }}>
                                  <span style={{ fontSize: 10, color, fontWeight: 800 }}>◆</span>
                                  <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "var(--cream-dim)", textTransform: "uppercase", letterSpacing: 1 }}>{sc.name}</span>
                                  <span style={{ fontSize: 11, color: "var(--muted)" }}>{scDone}/{scSkills.length}</span>
                                  <span style={{ color: "var(--muted)", fontSize: 12 }}>{isScOpen ? "▲" : "▼"}</span>
                                </div>
                                {/* Skills grid */}
                                {isScOpen && (
                                  <div style={{ padding: "12px 16px 12px 52px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
                                    {scSkills.map(skill => {
                                      const isDone = completed.includes(skill.id);
                                      return (
                                        <div key={skill.id} className={`skill-card ${isDone ? "done" : ""}`} onClick={() => setSelected(skill)}>
                                          <div className="flex-between mb-6">
                                            <span style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color }}>{skill.pts}</span>
                                            <span style={{ fontSize: 20 }}>{skill.icon}</span>
                                          </div>
                                          <div style={{ fontWeight: 600, fontSize: 13, color: "var(--cream)", marginBottom: 4 }}>{skill.name}</div>
                                          <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.5 }}>{skill.desc?.substring(0, 65)}…</div>
                                          {isDone && <div style={{ marginTop: 8, color: "var(--sage)", fontSize: 11, fontWeight: 600 }}>✓ Mastered</div>}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          });
                          // Uncategorized
                          const uncatSkills = subcatMap["__none__"] || [];
                          if (uncatSkills.length > 0) {
                            const isScOpen = openSubcats[area.id + ":__none__"] === true;
                            rows.push(
                              <div key="__none__" style={{ borderTop: "1px solid var(--border)" }}>
                                <div onClick={() => setOpenSubcats(p => ({ ...p, [area.id + ":__none__"]: !isScOpen }))}
                                  style={{ padding: "10px 20px 10px 56px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, background: "var(--bg3)", userSelect: "none" }}>
                                  <span style={{ fontSize: 10, color: "var(--muted)", fontWeight: 800 }}>◆</span>
                                  <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1 }}>General</span>
                                  <span style={{ fontSize: 11, color: "var(--muted)" }}>{uncatSkills.filter(s => completed.includes(s.id)).length}/{uncatSkills.length}</span>
                                  <span style={{ color: "var(--muted)", fontSize: 12 }}>{isScOpen ? "▲" : "▼"}</span>
                                </div>
                                {isScOpen && (
                                  <div style={{ padding: "12px 16px 12px 52px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
                                    {uncatSkills.map(skill => {
                                      const isDone = completed.includes(skill.id);
                                      return (
                                        <div key={skill.id} className={`skill-card ${isDone ? "done" : ""}`} onClick={() => setSelected(skill)}>
                                          <div className="flex-between mb-6">
                                            <span style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: areaColor(skill.area, content.areas) }}>{skill.pts}</span>
                                            <span style={{ fontSize: 20 }}>{skill.icon}</span>
                                          </div>
                                          <div style={{ fontWeight: 600, fontSize: 13, color: "var(--cream)", marginBottom: 4 }}>{skill.name}</div>
                                          <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.5 }}>{skill.desc?.substring(0, 65)}…</div>
                                          {isDone && <div style={{ marginTop: 8, color: "var(--sage)", fontSize: 11, fontWeight: 600 }}>✓ Mastered</div>}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          }
                          return rows;
                        })()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>
      <AITutor open={tutorOpen} onClose={() => setTutorOpen(false)} context="skill exploration" apiKey={apiKey} />
    </div>
  );
}

// ─── SUBMISSION BUILDER & RENDERER ───────────────────────────────────────────

function SubmissionRenderer({ blocks, compact }) {
  if (!blocks || blocks.length === 0) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: compact ? 12 : 20 }}>
      {blocks.map((block, i) => {
        if (block.type === "text") return (
          <div key={i} style={{ fontSize: compact ? 13 : 15, color: "var(--cream-dim)", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
            {block.value}
          </div>
        );
        if (block.type === "heading") return (
          <div key={i} style={{ fontFamily: "var(--font-display)", fontSize: compact ? 17 : 22, fontWeight: 700, color: "var(--cream)", lineHeight: 1.2, marginTop: i > 0 ? 8 : 0 }}>
            {block.value}
          </div>
        );
        if (block.type === "image") return (
          <div key={i} style={{ borderRadius: "var(--r-lg)", overflow: "hidden", border: "1px solid var(--border)" }}>
            <img src={block.value} alt={block.caption || "Submission image"} style={{ width: "100%", display: "block", maxHeight: compact ? 220 : 480, objectFit: "cover" }} />
            {block.caption && <div style={{ padding: "8px 14px", fontSize: 12, color: "var(--muted)", fontStyle: "italic", background: "var(--bg3)", borderTop: "1px solid var(--border)" }}>{block.caption}</div>}
          </div>
        );
        if (block.type === "link") return (
          <div key={i} style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "var(--r)", padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: "var(--r)", background: "var(--sky-dim)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🔗</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--cream)", marginBottom: 2 }}>{block.label || block.value}</div>
              <a href={block.value} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "var(--sky)", textDecoration: "none" }}>{block.value}</a>
            </div>
          </div>
        );
        if (block.type === "file") return (
          <div key={i} style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "var(--r)", padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: "var(--r)", background: "var(--amber-dim)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>📎</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "var(--cream)", marginBottom: 2 }}>{block.filename || "Attached file"}</div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>{block.filesize || ""}</div>
            </div>
            {block.value && (
              <a href={block.value} download={block.filename}
                style={{ padding: "6px 12px", background: "var(--amber)", color: "#0c0c16", borderRadius: "var(--r)", fontSize: 12, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}>
                Download
              </a>
            )}
          </div>
        );
        return null;
      })}
    </div>
  );
}

function SubmissionBuilder({ submission, onChange, itemTitle }) {
  const blocks = submission?.blocks || [];
  const [addingType, setAddingType] = useState(null);
  const [newText, setNewText] = useState("");
  const [newHeading, setNewHeading] = useState("");
  const [newLink, setNewLink] = useState({ value: "", label: "" });
  const [newCaption, setNewCaption] = useState("");

  const addBlock = (block) => {
    onChange({ ...(submission || { blocks: [], featured: false, reflection: "" }), blocks: [...blocks, block] });
    setAddingType(null);
    setNewText(""); setNewHeading(""); setNewLink({ value: "", label: "" }); setNewCaption("");
  };

  const removeBlock = (i) => {
    const updated = blocks.filter((_, idx) => idx !== i);
    onChange({ ...(submission || { blocks: [], featured: false, reflection: "" }), blocks: updated });
  };

  const moveBlock = (i, dir) => {
    const updated = [...blocks];
    const j = i + dir;
    if (j < 0 || j >= updated.length) return;
    [updated[i], updated[j]] = [updated[j], updated[i]];
    onChange({ ...(submission || {}), blocks: updated });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      addBlock({ type: "image", value: ev.target.result, caption: newCaption, filename: file.name });
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    const sizeStr = file.size > 1024 * 1024 ? (file.size / (1024 * 1024)).toFixed(1) + " MB" : (file.size / 1024).toFixed(0) + " KB";
    reader.onload = (ev) => {
      addBlock({ type: "file", value: ev.target.result, filename: file.name, filesize: sizeStr });
    };
    reader.readAsDataURL(file);
  };

  const BLOCK_TYPES = [
    { id: "heading", icon: "📝", label: "Heading" },
    { id: "text", icon: "✍️", label: "Text" },
    { id: "image", icon: "🖼️", label: "Image" },
    { id: "link", icon: "🔗", label: "Link" },
    { id: "file", icon: "📎", label: "File" },
  ];

  return (
    <div>
      {/* Existing blocks */}
      {blocks.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {blocks.map((block, i) => (
            <div key={i} style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", overflow: "hidden" }}>
              {/* Block controls */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderBottom: "1px solid var(--border)", background: "var(--bg2)" }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>
                  {block.type === "text" ? "✍️" : block.type === "heading" ? "📝" : block.type === "image" ? "🖼️" : block.type === "link" ? "🔗" : "📎"}
                </span>
                <span style={{ flex: 1, fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>{block.type}</span>
                <button className="btn btn-ghost btn-xs" onClick={() => moveBlock(i, -1)} disabled={i === 0} style={{ opacity: i === 0 ? 0.3 : 1 }}>↑</button>
                <button className="btn btn-ghost btn-xs" onClick={() => moveBlock(i, 1)} disabled={i === blocks.length - 1} style={{ opacity: i === blocks.length - 1 ? 0.3 : 1 }}>↓</button>
                <button className="btn btn-clay btn-xs" onClick={() => removeBlock(i)}>✕ Remove</button>
              </div>
              {/* Block preview */}
              <div style={{ padding: "12px 14px" }}>
                {block.type === "heading" && <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--cream)" }}>{block.value}</div>}
                {block.type === "text" && <div style={{ fontSize: 13, color: "var(--cream-dim)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{block.value.substring(0, 200)}{block.value.length > 200 ? "…" : ""}</div>}
                {block.type === "image" && (
                  <div>
                    <img src={block.value} alt="" style={{ maxHeight: 180, maxWidth: "100%", borderRadius: 6, objectFit: "cover" }} />
                    {block.caption && <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4, fontStyle: "italic" }}>{block.caption}</div>}
                  </div>
                )}
                {block.type === "link" && <div style={{ fontSize: 13, color: "var(--sky)" }}>{block.label || block.value}</div>}
                {block.type === "file" && <div style={{ fontSize: 13, color: "var(--amber)" }}>📎 {block.filename} {block.filesize && ("· " + block.filesize)}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add block panel */}
      {!addingType ? (
        <div>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: "var(--muted)", fontWeight: 700, marginBottom: 10 }}>Add a Block</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {BLOCK_TYPES.map(bt => (
              <button key={bt.id} className="btn btn-ghost btn-sm" onClick={() => setAddingType(bt.id)}
                style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span>{bt.icon}</span> {bt.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ background: "var(--bg3)", border: "1px solid var(--amber)", borderRadius: "var(--r-lg)", padding: 16 }}>
          <div className="flex-between mb-12">
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--amber)" }}>
              {BLOCK_TYPES.find(bt => bt.id === addingType)?.icon} Add {addingType.charAt(0).toUpperCase() + addingType.slice(1)} Block
            </div>
            <button className="btn btn-ghost btn-xs" onClick={() => setAddingType(null)}>Cancel</button>
          </div>

          {addingType === "heading" && (
            <div>
              <label className="label">Heading Text</label>
              <input className="input" value={newHeading} onChange={e => setNewHeading(e.target.value)} placeholder="e.g. My Approach, What I Learned, Results..." />
              <button className="btn btn-primary btn-sm mt-10" disabled={!newHeading.trim()} onClick={() => addBlock({ type: "heading", value: newHeading.trim() })}>Add Heading</button>
            </div>
          )}

          {addingType === "text" && (
            <div>
              <label className="label">Your Text</label>
              <textarea className="input textarea" style={{ minHeight: 100 }} value={newText} onChange={e => setNewText(e.target.value)} placeholder="Write about your process, what you learned, what you're proud of..." />
              <button className="btn btn-primary btn-sm mt-10" disabled={!newText.trim()} onClick={() => addBlock({ type: "text", value: newText.trim() })}>Add Text</button>
            </div>
          )}

          {addingType === "image" && (
            <div>
              <label className="label">Caption (optional)</label>
              <input className="input" style={{ marginBottom: 10 }} value={newCaption} onChange={e => setNewCaption(e.target.value)} placeholder="Describe this image..." />
              <label className="label">Upload Image</label>
              <input type="file" accept="image/*" onChange={handleImageUpload}
                style={{ display: "block", fontSize: 13, color: "var(--cream-dim)", padding: "8px 0" }} />
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 6 }}>PNG, JPG, GIF, WebP — stored in your browser session</div>
            </div>
          )}

          {addingType === "link" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <label className="label">URL</label>
                <input className="input" value={newLink.value} onChange={e => setNewLink(p => ({ ...p, value: e.target.value }))} placeholder="https://..." />
              </div>
              <div>
                <label className="label">Label (optional)</label>
                <input className="input" value={newLink.label} onChange={e => setNewLink(p => ({ ...p, label: e.target.value }))} placeholder="e.g. View my project, Published article..." />
              </div>
              <button className="btn btn-primary btn-sm" disabled={!newLink.value.trim()} onClick={() => addBlock({ type: "link", value: newLink.value.trim(), label: newLink.label.trim() })}>Add Link</button>
            </div>
          )}

          {addingType === "file" && (
            <div>
              <label className="label">Upload File</label>
              <input type="file" onChange={handleFileUpload}
                style={{ display: "block", fontSize: 13, color: "var(--cream-dim)", padding: "8px 0" }} />
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 6 }}>Any file type — stored in your browser session</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── STUDENT: PROJECT LAB ─────────────────────────────────────────────────────

function ProjectLab({ student, completed, content, apiKey, onComplete, onUncomplete, boards, saveToBoard, submissions, setSubmission, portfolioFeatured, setPortfolioFeatured }) {
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  const projects = content.projects;
  const myInterests = student.interests || [];

  const filtered = filter === "all" ? projects : filter === "my" ? projects.filter(p => p.interests?.some(i => myInterests.includes(i))) : projects.filter(p => p.color === filter);

  if (selected) {
    const isDone = completed.includes(selected.id);
    const sub = submissions[selected.id] || { blocks: [], featured: false, reflection: "" };
    return (
      <div>
        <div className="page-header">
          <button className="btn btn-ghost btn-sm mb-8" onClick={() => setSelected(null)}>← Back to Projects</button>
          <div className="flex-between">
            <div>
              <h1 className="page-title">{selected.title}</h1>
              <div className="flex gap-8 mt-8">
                <span className="pts-badge">⭐ {selected.pts} pts</span>
                {selected.duration && <span className="duration-badge">🕐 {selected.duration}</span>}
              </div>
            </div>
            <SaveButton item={{ ...selected, type: "project", name: selected.title }} boards={boards} onSaveToBoard={saveToBoard} />
          </div>
        </div>
        <div className="page-content">
          <div className="grid-2" style={{ gap: 24 }}>
            <div>
              <div className="card mb-16">
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, color: "var(--cream)", marginBottom: 10 }}>About This Project</h3>
                <p style={{ fontSize: 14, color: "var(--cream-dim)", lineHeight: 1.7 }}>{selected.desc}</p>
                {selected.output && <div style={{ marginTop: 12, padding: "10px 12px", background: "var(--bg3)", borderRadius: "var(--r)", fontSize: 12, color: "var(--muted)" }}><strong style={{ color: "var(--cream-dim)" }}>Output: </strong>{selected.output}</div>}
              </div>
              <div className="card">
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, color: "var(--cream)", marginBottom: 12 }}>Steps</h3>
                {(selected.steps || []).map((step, i) => (
                  <div key={i} className="checklist-item">
                    <div style={{ width: 22, height: 22, borderRadius: 50, background: "var(--bg4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "var(--muted)", fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                    <span style={{ fontSize: 13, color: "var(--cream-dim)", lineHeight: 1.5 }}>{step}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="card">
                {isDone ? (
                  <div>
                    <div className="flex-center gap-8 mb-12" style={{ color: "var(--sage)" }}>
                      <span style={{ fontSize: 20 }}>✓</span>
                      <span style={{ fontWeight: 600 }}>Project completed! +{selected.pts} points</span>
                    </div>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", cursor: "pointer", marginBottom: 10 }}>
                      <input type="checkbox" checked={portfolioFeatured[selected.id] !== false}
                        onChange={e => setPortfolioFeatured(p => ({ ...p, [selected.id]: e.target.checked }))} />
                      <span style={{ fontSize: 13, color: "var(--cream-dim)" }}>Feature in Portfolio</span>
                    </label>
                    <button className="btn btn-ghost btn-sm" style={{ width: "100%", marginBottom: 8 }} onClick={() => onUncomplete(selected.id, selected.pts)}>↩ Mark as Incomplete</button>
                  </div>
                ) : (
                  <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => { onComplete(selected.id, selected.pts); }}>Mark Complete ✓</button>
                )}
              </div>
            </div>
          </div>
          {selected.blocks?.length > 0 && (
            <ContentBlockRenderer blocks={selected.blocks} apiKey={apiKey} context={selected.title} />
          )}

          {/* Submission — always visible */}
          <div style={{ marginTop: 32, background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", background: "var(--bg3)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 18 }}>📁</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--cream)" }}>My Portfolio Submission</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>Document your work — add text, images, links, and files. This is your portfolio entry for this project.</div>
              </div>
              {(sub.blocks?.length > 0) && (
                <span className="tag tag-sage" style={{ fontSize: 10 }}>📁 {sub.blocks.length} block{sub.blocks.length !== 1 ? "s" : ""} saved</span>
              )}
            </div>
            <div style={{ padding: 20 }}>
              <SubmissionBuilder submission={sub} onChange={(updated) => setSubmission(selected.id, updated)} itemTitle={selected.title} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">⬟ Project Lab</h1>
        <p className="page-sub">{projects.length} projects · {completed.filter(id => projects.find(p => p.id === id)).length} completed</p>
      </div>
      <div className="page-content">
        <div className="filter-row">
          {[{ id: "all", label: "All" }, { id: "my", label: "My Interests ✦" }, ...["amber","sage","clay","sky","lavender"].map(c => ({ id: c, label: c.charAt(0).toUpperCase() + c.slice(1) }))].map(f => (
            <button key={f.id} className={`filter-btn ${filter === f.id ? "active" : ""}`} onClick={() => setFilter(f.id)}>{f.label}</button>
          ))}
        </div>
        <div className="grid-2">
          {filtered.map(proj => {
            const isDone = completed.includes(proj.id);
            return (
              <div key={proj.id} className={`proj-card color-${proj.color} ${isDone ? "done" : ""}`} onClick={() => setSelected(proj)}>
                <div className="pill-row mb-4">
                  {(proj.interests || []).slice(0, 3).map(id => {
                    const int = INTERESTS.find(i => i.id === id);
                    return int ? <span key={id} className="tag tag-muted">{int.icon} {int.label}</span> : null;
                  })}
                </div>
                <div className="proj-title">{proj.title}</div>
                <div className="proj-desc">{proj.desc?.substring(0, 110)}…</div>
                <div className="flex gap-8" style={{ alignItems: "center" }}>
                  <span className="pts-badge">⭐ {proj.pts} pts</span>
                  {proj.duration && <span className="duration-badge">🕐 {proj.duration}</span>}
                  {isDone && <span className="tag tag-sage">✓ Done</span>}
                  <div style={{ marginLeft: "auto" }} onClick={e => e.stopPropagation()}>
                    <SaveButton item={{ ...proj, type: "project", name: proj.title }} boards={boards} onSaveToBoard={saveToBoard} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {filtered.length === 0 && <EmptyState icon="⬟" title="No projects found" />}
      </div>
    </div>
  );
}

// ─── STUDENT: FACTIONS ────────────────────────────────────────────────────────

function GigDetail({ gig, completed, grabbed, onGrab, onComplete, onUncomplete, onBack, backLabel, boards, saveToBoard, submissions, setSubmission, portfolioFeatured, setPortfolioFeatured }) {
  const [checksDone, setChecksDone] = useState({});
  const faction = FACTIONS.find(f => f.id === gig.faction);
  const isDone = completed.includes(gig.id);
  const isGrabbed = grabbed[gig.id];

  const parseLines = (str) => (str || "").split("\n").map(s => s.trim()).filter(Boolean);
  const parseTags = (str) => (str || "").split(",").map(s => s.trim()).filter(Boolean);

  const deliverables = parseLines(gig.deliverable);
  const checklist = parseLines(gig.qualityChecklist);
  const tips = parseLines(gig.studentTips);
  const tags = parseTags(gig.tags);

  const colorRgb = { amber: "232,160,32", sage: "122,170,122", sky: "96,144,184", clay: "200,112,96", lavender: "144,128,192" };
  const factionRgb = faction ? (colorRgb[faction.color] || "232,160,32") : "232,160,32";

  const difficultyStars = (d) => {
    if (d === "Beginner") return "★☆☆";
    if (d === "Intermediate") return "★★☆";
    if (d === "Advanced") return "★★★";
    return d || "—";
  };

  return (
    <div>
      <div className="page-header">
        <button className="btn btn-ghost btn-sm mb-8" onClick={onBack}>← {backLabel}</button>
      </div>
      <div className="page-content" style={{ maxWidth: 680, paddingTop: 0 }}>

        {/* Faction + tag badges */}
        <div className="flex-center gap-10 mb-12" style={{ flexWrap: "wrap" }}>
          {faction && (
            <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "4px 12px", borderRadius: 20, background: `rgba(${factionRgb},.15)`, border: `1px solid rgba(${factionRgb},.35)` }}>
              <span style={{ fontSize: 14 }}>{faction.icon}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: `var(--${faction.color})` }}>{faction.name}</span>
            </div>
          )}
          {tags.map((tag, i) => <span key={i} className="tag tag-muted">{tag}</span>)}
        </div>

        {/* Title */}
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 900, color: "var(--cream)", lineHeight: 1.15, marginBottom: 20, textTransform: "uppercase", letterSpacing: -0.5 }}>{gig.title}</h1>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "var(--border)", borderRadius: "var(--r)", overflow: "hidden", marginBottom: 28 }}>
          {[
            { label: "TIME", value: gig.time || "—" },
            { label: "DIFFICULTY", value: difficultyStars(gig.difficulty) },
            { label: "RELATED CAREER", value: gig.relatedCareer || "—", highlight: true },
          ].map(s => (
            <div key={s.label} style={{ background: "var(--bg2)", padding: "14px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: s.highlight ? "var(--amber)" : "var(--cream)", lineHeight: 1.2 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Client Background */}
        {gig.clientBackground && (
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>Client Background</div>
            <p style={{ fontSize: 14, color: "var(--cream-dim)", lineHeight: 1.75 }}>{gig.clientBackground}</p>
          </div>
        )}

        {/* The Problem */}
        {gig.problem && (
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>The Problem</div>
            <p style={{ fontSize: 14, color: "var(--cream-dim)", lineHeight: 1.75 }}>{gig.problem}</p>
          </div>
        )}

        {/* Deliverables */}
        {deliverables.length > 0 && (
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>Your Deliverables</div>
            {deliverables.map((d, i) => (
              <div key={i} style={{ display: "flex", gap: 10, padding: "7px 0", borderBottom: "1px solid var(--border)", fontSize: 14, color: "var(--cream-dim)", lineHeight: 1.5 }}>
                <span style={{ color: "var(--amber)", flexShrink: 0 }}>→</span>{d}
              </div>
            ))}
          </div>
        )}

        {/* Fallback single deliverable */}
        {deliverables.length === 0 && gig.deliverable && (
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>Your Deliverable</div>
            <p style={{ fontSize: 14, color: "var(--cream-dim)", lineHeight: 1.75 }}>{gig.deliverable}</p>
          </div>
        )}

        {/* Quality Checklist */}
        {checklist.length > 0 && (
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>Quality Checklist</div>
            {checklist.map((item, i) => (
              <div key={i} onClick={() => setChecksDone(p => ({ ...p, [i]: !p[i] }))}
                style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "9px 0", borderBottom: "1px solid var(--border)", cursor: "pointer" }}>
                <div style={{ width: 16, height: 16, border: `2px solid ${checksDone[i] ? "var(--sage)" : "var(--border)"}`, borderRadius: 3, flexShrink: 0, marginTop: 2, background: checksDone[i] ? "var(--sage)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
                  {checksDone[i] && <span style={{ color: "#0c0c16", fontSize: 10, fontWeight: 900 }}>✓</span>}
                </div>
                <span style={{ fontSize: 14, color: checksDone[i] ? "var(--sage)" : "var(--cream-dim)", textDecoration: checksDone[i] ? "line-through" : "none", lineHeight: 1.5 }}>{item}</span>
              </div>
            ))}
          </div>
        )}

        {/* Reflection Prompt */}
        {gig.reflectionPrompt && (
          <div style={{ padding: "14px 16px", background: "var(--bg3)", borderRadius: "var(--r)", marginBottom: 22, border: "1px solid var(--border)" }}>
            <p style={{ fontSize: 13, color: "var(--muted)", fontStyle: "italic", lineHeight: 1.6 }}>💭 {gig.reflectionPrompt}</p>
          </div>
        )}

        {/* Student Tips */}
        {tips.length > 0 && (
          <div style={{ padding: "14px 16px", background: "var(--amber-dim)", border: "1px solid rgba(0,212,255,0.35)", borderRadius: "var(--r)", marginBottom: 28 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "var(--amber)", textTransform: "uppercase", marginBottom: 8 }}>💡 Student Tips</div>
            {tips.map((tip, i) => <div key={i} style={{ fontSize: 13, color: "var(--cream-dim)", lineHeight: 1.75 }}>{tip}</div>)}
          </div>
        )}

        {/* Action buttons */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
            <SaveButton item={{ ...gig, type: "gig", name: gig.title }} boards={boards} onSaveToBoard={saveToBoard} />
          </div>
          {isDone ? (
            <div>
              <div className="flex-center gap-8 mb-10" style={{ color: "var(--sage)" }}>
                <span style={{ fontSize: 20 }}>✓</span>
                <span style={{ fontWeight: 700, fontSize: 15 }}>Gig complete! +{gig.pts || 0} pts</span>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", cursor: "pointer", marginBottom: 8 }}>
                <input type="checkbox" checked={portfolioFeatured[gig.id] !== false}
                  onChange={e => setPortfolioFeatured(p => ({ ...p, [gig.id]: e.target.checked }))} />
                <span style={{ fontSize: 13, color: "var(--cream-dim)" }}>Feature in Portfolio</span>
              </label>
              <button className="btn btn-ghost btn-sm" style={{ width: "100%" }} onClick={() => onUncomplete(gig.id, gig.pts || 0)}>↩ Mark as Incomplete</button>
            </div>
          ) : !isGrabbed ? (
            <button onClick={onGrab}
              style={{ width: "100%", padding: "16px", background: "var(--amber)", color: "#0c0c16", border: "none", borderRadius: "var(--r)", fontWeight: 900, fontSize: 15, letterSpacing: 1, textTransform: "uppercase", cursor: "pointer", fontFamily: "var(--font-body)" }}>
              Grab This Gig →
            </button>
          ) : (
            <div>
              <div style={{ padding: "12px 14px", background: "var(--sage-dim)", border: "1px solid rgba(0,229,168,0.35)", borderRadius: "var(--r)", marginBottom: 12, fontSize: 13, color: "var(--sage)" }}>
                ✓ You've grabbed this gig — complete your deliverables and mark it done below.
              </div>
              <button className="btn btn-sage" style={{ width: "100%" }} onClick={onComplete}>
                Mark Gig Complete ✓
              </button>
            </div>
          )}
        </div>

        {/* Submission — always visible */}
        <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "var(--r-lg)", overflow: "hidden", marginTop: 8 }}>
          <div style={{ padding: "16px 20px", background: "var(--bg3)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>📁</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, color: "var(--cream)" }}>My Portfolio Submission</div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>Show your work — add text, images, links to deliverables, and attached files</div>
            </div>
            {(submissions[gig.id]?.blocks?.length > 0) && (
              <span className="tag tag-sage" style={{ fontSize: 10 }}>📁 {submissions[gig.id].blocks.length} block{submissions[gig.id].blocks.length !== 1 ? "s" : ""} saved</span>
            )}
          </div>
          <div style={{ padding: 20 }}>
            <SubmissionBuilder
              submission={submissions[gig.id]}
              onChange={(updated) => setSubmission(gig.id, updated)}
              itemTitle={gig.title}
            />
          </div>
        </div>

      </div>
    </div>
  );
}

function FactionsView({ completed, content, studentFaction, setStudentFaction, grabbed, setGrabbed, onComplete, onUncomplete, boards, saveToBoard, submissions, setSubmission, portfolioFeatured, setPortfolioFeatured }) {
  const [view, setView] = useState("factions");
  const [selectedGig, setSelectedGig] = useState(null);
  const gigs = content.gigs;

  const parseTags = (str) => (str || "").split(",").map(s => s.trim()).filter(Boolean);
  const parseLines = (str) => (str || "").split("\n").map(s => s.trim()).filter(Boolean);

  if (selectedGig) {
    return (
      <GigDetail
        gig={selectedGig}
        completed={completed}
        grabbed={grabbed}
        onGrab={() => setGrabbed(p => ({ ...p, [selectedGig.id]: true }))}
        onComplete={() => { onComplete(selectedGig.id, selectedGig.pts || 0); setSelectedGig(null); }}
        onUncomplete={onUncomplete}
        onBack={() => setSelectedGig(null)}
        backLabel={view === "factions" ? "Factions" : (FACTIONS.find(f => f.id === view)?.name || "Gigs")}
        boards={boards}
        saveToBoard={saveToBoard}
        submissions={submissions}
        setSubmission={setSubmission}
        portfolioFeatured={portfolioFeatured}
        setPortfolioFeatured={setPortfolioFeatured}
      />
    );
  }

  // ── Faction gig list ────────────────────────────────────────────────
  if (view !== "factions") {
    const faction = FACTIONS.find(f => f.id === view);
    const factionGigs = gigs.filter(g => g.faction === view);
    return (
      <div>
        <div className="page-header">
          <button className="btn btn-ghost btn-sm mb-8" onClick={() => setView("factions")}>← All Factions</button>
          <div className="flex-between">
            <div>
              <div style={{ fontSize: 32, marginBottom: 6 }}>{faction.icon}</div>
              <h1 className="page-title" style={{ color: `var(--${faction.color})` }}>{faction.name}</h1>
              <p className="page-sub">{faction.desc}</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, color: `var(--${faction.color})` }}>
                {factionGigs.filter(g => completed.includes(g.id)).length} / {factionGigs.length}
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>gigs completed</div>
            </div>
          </div>
        </div>
        <div className="page-content">
          {factionGigs.length === 0 ? (
            <EmptyState icon={faction.icon} title="No gigs yet" sub="Your teacher hasn't added gigs for this faction yet." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {factionGigs.map(gig => {
                const isDone = completed.includes(gig.id);
                const tags = parseTags(gig.tags);
                return (
                  <div key={gig.id} onClick={() => setSelectedGig(gig)}
                    style={{ background: "var(--bg2)", border: `1px solid ${isDone ? "var(--sage)" : "var(--border)"}`, borderRadius: "var(--r-lg)", padding: "16px 20px", cursor: "pointer", transition: "all 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = isDone ? "var(--sage)" : `var(--${faction.color})`}
                    onMouseLeave={e => e.currentTarget.style.borderColor = isDone ? "var(--sage)" : "var(--border)"}>
                    <div className="flex-between mb-6">
                      <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, color: "var(--cream)", fontSize: 16, lineHeight: 1.3, flex: 1, marginRight: 12 }}>{gig.title}</div>
                      {isDone && <span className="tag tag-sage">✓ Done</span>}
                    </div>
                    {gig.problem && <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5, marginBottom: 10 }}>{gig.problem.substring(0, 100)}{gig.problem.length > 100 ? "…" : ""}</p>}
                    <div className="flex gap-6 flex-wrap">
                      <span className="pts-badge">{gig.pts || 0} pts</span>
                      {gig.time && <span className="tag tag-muted">⏱ {gig.time}</span>}
                      {gig.difficulty && <span className="tag tag-muted">{gig.difficulty}</span>}
                      {tags.slice(0, 3).map((t, i) => <span key={i} className="tag tag-muted">{t}</span>)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Faction grid ────────────────────────────────────────────────────
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">⚡ Factions</h1>
        <p className="page-sub">Pick your crew. Complete sandbox gigs to earn points and build your portfolio.</p>
      </div>
      <div className="page-content">
        {studentFaction && (
          <div className="card mb-20" style={{ borderColor: `var(--${FACTIONS.find(f => f.id === studentFaction)?.color || "amber"})`, background: "var(--bg3)" }}>
            <div className="flex-between">
              <div className="flex-center gap-10">
                <span style={{ fontSize: 28 }}>{FACTIONS.find(f => f.id === studentFaction)?.icon}</span>
                <div>
                  <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: "var(--muted)" }}>Your Faction</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--cream)" }}>{FACTIONS.find(f => f.id === studentFaction)?.name}</div>
                </div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setView(studentFaction)}>View Gigs →</button>
            </div>
          </div>
        )}
        <div className="grid-2" style={{ gap: 16 }}>
          {FACTIONS.map(faction => {
            const factionGigs = gigs.filter(g => g.faction === faction.id);
            const doneCount = factionGigs.filter(g => completed.includes(g.id)).length;
            const isMyFaction = studentFaction === faction.id;
            return (
              <div key={faction.id}
                onClick={() => setView(faction.id)}
                className={`faction-card ${isMyFaction ? "selected" : ""}`}
                style={{ borderColor: isMyFaction ? `var(--${faction.color})` : "transparent", cursor: "pointer" }}
                onMouseEnter={e => { if (!isMyFaction) e.currentTarget.style.borderColor = `var(--${faction.color})`; }}
                onMouseLeave={e => { if (!isMyFaction) e.currentTarget.style.borderColor = "var(--border)"; }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `var(--${faction.color})`, opacity: 0.7 }} />
                <div style={{ fontSize: 28, marginBottom: 8 }}>{faction.icon}</div>
                <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: `var(--${faction.color})`, marginBottom: 4 }}>{faction.name}</h3>
                <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6, marginBottom: 14 }}>{faction.desc}</p>
                <div className="flex-between">
                  <span style={{ fontSize: 12, color: "var(--muted)" }}>{doneCount}/{factionGigs.length} gigs</span>
                  <div className="flex gap-6" onClick={e => e.stopPropagation()}>
                    {!isMyFaction && (
                      <button className="btn btn-ghost btn-xs" onClick={(e) => { e.stopPropagation(); setStudentFaction(faction.id); }}>Join</button>
                    )}
                    <button className="btn btn-ghost btn-xs" onClick={() => setView(faction.id)}>View Gigs →</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── STUDENT: RIPPLE MISSIONS ─────────────────────────────────────────────────

function RippleMissions({ completed, content, apiKey, onComplete, onUncomplete, boards, saveToBoard }) {
  const [selected, setSelected] = useState(null);
  const missions = content.ripple;

  if (selected) {
    const isDone = completed.includes(selected.id);
    return (
      <div>
        <div className="page-header">
          <button className="btn btn-ghost btn-sm mb-8" onClick={() => setSelected(null)}>← Back to Missions</button>
          <div className="flex-between">
            <div>
              <div style={{ fontSize: 28, marginBottom: 6 }}>{selected.icon}</div>
              <h1 className="page-title">{selected.title}</h1>
              <div className="flex gap-8 mt-8">
                <span className="pts-badge">⭐ {selected.pts} pts</span>
                {selected.cause && <span className="tag tag-sage">{selected.cause}</span>}
              </div>
            </div>
            <SaveButton item={{ ...selected, type: "ripple", name: selected.title }} boards={boards} onSaveToBoard={saveToBoard} />
          </div>
        </div>
        <div className="page-content">
          <div className="grid-2" style={{ gap: 24 }}>
            <div>
              <div className="card mb-16">
                <p style={{ fontSize: 14, color: "var(--cream-dim)", lineHeight: 1.7 }}>{selected.desc}</p>
              </div>
              {selected.steps && selected.steps.length > 0 && (
                <div className="card">
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600, color: "var(--cream)", marginBottom: 12 }}>How to Complete It</h3>
                  {selected.steps.map((step, i) => (
                    <div key={i} className="checklist-item">
                      <div style={{ width: 22, height: 22, borderRadius: 50, background: "var(--bg4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "var(--muted)", fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                      <span style={{ fontSize: 13, color: "var(--cream-dim)", lineHeight: 1.5 }}>{step}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="card">
              {isDone ? (
                <div>
                  <div className="flex-center gap-8 mb-12" style={{ color: "var(--sage)" }}>
                    <span style={{ fontSize: 22 }}>✓</span>
                    <span style={{ fontWeight: 600 }}>Mission completed! +{selected.pts} points</span>
                  </div>
                  <button className="btn btn-ghost btn-sm" style={{ width: "100%" }} onClick={() => onUncomplete(selected.id, selected.pts)}>↩ Mark as Incomplete</button>
                </div>
              ) : (
                <button className="btn btn-sage" style={{ width: "100%" }} onClick={() => { onComplete(selected.id, selected.pts); setSelected(null); }}>
                  Mark Mission Complete ✓
                </button>
              )}
            </div>
          </div>
          {selected.blocks?.length > 0 && (
            <ContentBlockRenderer blocks={selected.blocks} apiKey={apiKey} context={selected.title} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🌊 Ripple Missions</h1>
        <p className="page-sub">Philanthropic missions that create real impact. Your actions ripple outward.</p>
      </div>
      <div className="page-content">
        {missions.length === 0 ? (
          <EmptyState icon="🌊" title="No missions yet" sub="Your teacher hasn't added ripple missions yet." />
        ) : (
          <div className="grid-2" style={{ gap: 14 }}>
            {missions.map(m => {
              const isDone = completed.includes(m.id);
              return (
                <div key={m.id} className={`ripple-card ${isDone ? "done" : ""}`} style={{ cursor: "pointer" }} onClick={() => setSelected(m)}>
                  <div className="flex-between mb-10">
                    <span style={{ fontSize: 28 }}>{m.icon}</span>
                    <div className="flex gap-6" onClick={e => e.stopPropagation()}>
                      <SaveButton item={{ ...m, type: "ripple", name: m.title }} boards={boards} onSaveToBoard={saveToBoard} />
                      <span className="pts-badge">{m.pts} pts</span>
                      {isDone && <span className="tag tag-sage">✓</span>}
                    </div>
                  </div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 600, color: "var(--cream)", marginBottom: 6 }}>{m.title}</h3>
                  <p style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.6, marginBottom: 10 }}>{m.desc?.substring(0, 100)}…</p>
                  {m.cause && <span className="tag tag-sage">{m.cause}</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── STUDENT: TEEN'S GUIDE ────────────────────────────────────────────────────

function TeensGuide({ completed, content, apiKey, onComplete, onUncomplete, boards, saveToBoard }) {
  const [selected, setSelected] = useState(null);
  const entries = content.teensGuide;

  if (selected) {
    const isDone = completed.includes(selected.id);
    return (
      <div>
        <div className="page-header">
          <button className="btn btn-ghost btn-sm mb-8" onClick={() => setSelected(null)}>← Back to Teen's Guide</button>
          <div className="flex-between">
            <div>
              <div style={{ fontSize: 28, marginBottom: 6 }}>{selected.icon}</div>
              <h1 className="page-title">{selected.title}</h1>
              <div className="flex gap-8 mt-8">
                {selected.category && <span className="tag tag-sky">{selected.category}</span>}
                {selected.readTime && <span className="tag tag-muted">📖 {selected.readTime}</span>}
              </div>
            </div>
            <SaveButton item={{ ...selected, type: "guide", name: selected.title }} boards={boards} onSaveToBoard={saveToBoard} />
          </div>
        </div>
        <div className="page-content">
          <div style={{ maxWidth: 680 }}>
            <div className="card mb-16">
              <p style={{ fontSize: 15, color: "var(--cream-dim)", lineHeight: 1.85 }}>{selected.content}</p>
            </div>
          </div>
          {selected.blocks?.length > 0 && (
            <ContentBlockRenderer blocks={selected.blocks} apiKey={apiKey} context={selected.title} />
          )}
          <div style={{ maxWidth: 680, marginTop: 16 }}>
            {!isDone ? (
              <button className="btn btn-sky" onClick={() => { onComplete(selected.id, selected.pts || 5); setSelected(null); }}>Mark as Read ✓</button>
            ) : (
              <div className="flex-center gap-10">
                <div className="flex-center gap-8" style={{ color: "var(--sky)" }}>
                  <span>✓</span><span style={{ fontWeight: 600 }}>Read and saved to your library</span>
                </div>
                <button className="btn btn-ghost btn-xs" onClick={() => onUncomplete(selected.id, selected.pts || 5)}>↩ Undo</button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📖 Teen's Guide</h1>
        <p className="page-sub">Life skills, hard conversations, and things nobody else teaches you.</p>
      </div>
      <div className="page-content">
        {entries.length === 0 ? (
          <EmptyState icon="📖" title="No entries yet" sub="Your teacher hasn't added Teen's Guide entries yet." />
        ) : (
          <div className="grid-2" style={{ gap: 14 }}>
            {entries.map(entry => {
              const isDone = completed.includes(entry.id);
              return (
                <div key={entry.id} className="guide-card" onClick={() => setSelected(entry)}>
                  <div className="flex-between mb-8">
                    <span style={{ fontSize: 24 }}>{entry.icon}</span>
                    <div className="flex gap-6" onClick={e => e.stopPropagation()}>
                      <SaveButton item={{ ...entry, type: "guide", name: entry.title }} boards={boards} onSaveToBoard={saveToBoard} />
                      {entry.readTime && <span className="tag tag-muted">{entry.readTime}</span>}
                      {isDone && <span className="tag tag-sky">✓ Read</span>}
                    </div>
                  </div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 600, color: "var(--cream)", marginBottom: 6, lineHeight: 1.4 }}>{entry.title}</h3>
                  {entry.category && <span className="tag tag-sky" style={{ fontSize: 10 }}>{entry.category}</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── STUDENT: LIGHT ROOM ──────────────────────────────────────────────────────

function LightRoom({ completed, content, apiKey, onComplete, onUncomplete, boards, saveToBoard }) {
  const [selected, setSelected] = useState(null);
  const items = content.lightRoom;

  if (selected) {
    const isDone = completed.includes(selected.id);
    return (
      <div>
        <div className="page-header">
          <button className="btn btn-ghost btn-sm mb-8" onClick={() => setSelected(null)}>← Back to Light Room</button>
          <div className="flex-between">
            <div>
              <div style={{ fontSize: 28, marginBottom: 6 }}>{selected.icon}</div>
              <h1 className="page-title">{selected.title}</h1>
              <div className="flex gap-8 mt-8">
                {selected.type && <span className="tag tag-lavender">{selected.type}</span>}
                {selected.topic && <span className="tag tag-muted">{selected.topic}</span>}
                {selected.duration && <span className="tag tag-muted">{selected.duration}</span>}
              </div>
            </div>
            <SaveButton item={{ ...selected, type: "lightroom", name: selected.title }} boards={boards} onSaveToBoard={saveToBoard} />
          </div>
        </div>
        <div className="page-content">
          <div style={{ maxWidth: 680 }}>
            <div className="card mb-16" style={{ border: "1px solid rgba(176,96,255,0.35)" }}>
              <p style={{ fontSize: 15, color: "var(--cream-dim)", lineHeight: 1.85 }}>{selected.content}</p>
            </div>
          </div>
          {selected.blocks?.length > 0 && (
            <ContentBlockRenderer blocks={selected.blocks} apiKey={apiKey} context={selected.title} />
          )}
          <div style={{ maxWidth: 680, marginTop: 16 }}>
            {!isDone ? (
              <button className="btn btn-lavender" onClick={() => { onComplete(selected.id, selected.pts || 5); setSelected(null); }}>Mark Complete ✓</button>
            ) : (
              <div className="flex-center gap-10">
                <div className="flex-center gap-8" style={{ color: "var(--lavender)" }}>
                  <span>✓</span><span style={{ fontWeight: 600 }}>Added to your library</span>
                </div>
                <button className="btn btn-ghost btn-xs" onClick={() => onUncomplete(selected.id, selected.pts || 5)}>↩ Undo</button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">💡 Light Room</h1>
        <p className="page-sub">Curated reading, watching, and reflection. For minds that want more.</p>
      </div>
      <div className="page-content">
        {items.length === 0 ? (
          <EmptyState icon="💡" title="Coming soon" sub="Your teacher is curating Light Room content for you." />
        ) : (
          <div className="grid-2" style={{ gap: 14 }}>
            {items.map(item => {
              const isDone = completed.includes(item.id);
              return (
                <div key={item.id} className={`lightroom-card ${isDone ? "done" : ""}`} onClick={() => setSelected(item)}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "var(--lavender)", opacity: 0.5 }} />
                  <div className="flex-between mb-8">
                    <span style={{ fontSize: 24 }}>{item.icon}</span>
                    <div className="flex gap-6" onClick={e => e.stopPropagation()}>
                      <SaveButton item={{ ...item, type: "lightroom", name: item.title }} boards={boards} onSaveToBoard={saveToBoard} />
                      {item.type && <span className="tag tag-lavender">{item.type}</span>}
                      {isDone && <span className="tag tag-sage">✓</span>}
                    </div>
                  </div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 600, color: "var(--cream)", marginBottom: 4, lineHeight: 1.4 }}>{item.title}</h3>
                  {item.topic && <div style={{ fontSize: 11, color: "var(--lavender)" }}>{item.topic}</div>}
                  {item.duration && <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 3 }}>{item.duration}</div>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── STUDENT: DAILY DROPS ─────────────────────────────────────────────────────

function DailyDrops({ completed, content, onComplete, onUncomplete, student, boards, saveToBoard, journalEntries, onSaveJournal }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const drops = content.dailyDrops;
  const today = todayStr();

  const todayDrop = drops.find(d => d.date === today) || null;
  const viewDrop = selectedDate ? drops.find(d => d.date === selectedDate) : null;
  const sortedDrops = [...drops].sort((a, b) => a.date.localeCompare(b.date));

  const filterSpotlights = (drop) => {
    if (!drop?.careerSpotlights?.length) return [];
    return drop.careerSpotlights.filter(cs =>
      cs.targetStudent === "all" || cs.targetStudent === student?.name
    );
  };

  const hasContent = (drop) => drop && (drop.video || drop.journal || filterSpotlights(drop).length > 0 || drop.kindnessChallenge);

  if (viewDrop && hasContent(viewDrop)) {
    const dropId = viewDrop.id;
    const isDone = completed.includes(dropId);
    const spotlights = filterSpotlights(viewDrop);
    const embedUrl = viewDrop.video ? toYouTubeEmbed(viewDrop.video.url) : null;
    const savedEntry = journalEntries[dropId] || null;
    const journalText = savedEntry?.text || "";

    const handleJournalChange = (text) => {
      onSaveJournal(dropId, {
        text,
        prompt: viewDrop.journal?.prompt || "",
        title: viewDrop.journal?.title || "Journal",
        dropDate: viewDrop.date,
      });
    };

    return (
      <div>
        <div className="page-header">
          <button className="btn btn-ghost btn-sm mb-8" onClick={() => setSelectedDate(null)}>← Back to Drops</button>
          <div className="flex-between">
            <div>
              <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: "var(--amber)", fontWeight: 700 }}>
                {viewDrop.date === today ? "Today's Drop" : formatDisplayDate(viewDrop.date)}
              </span>
              <h1 className="page-title mt-4">{formatDisplayDate(viewDrop.date)}</h1>
            </div>
            {isDone && <span className="tag tag-sage" style={{ fontSize: 12 }}>✓ Completed</span>}
          </div>
        </div>
        <div className="page-content">
          <div style={{ maxWidth: 700, display: "flex", flexDirection: "column", gap: 20 }}>

            {viewDrop.video && viewDrop.video.url && (
              <div className="card" style={{ borderColor: "rgba(77,143,255,0.35)" }}>
                <div className="flex-between mb-12">
                  <div className="flex-center gap-8">
                    <span style={{ fontSize: 16 }}>📹</span>
                    <div>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, color: "var(--cream)" }}>{viewDrop.video.title || "Watch"}</div>
                      {viewDrop.video.description && <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>{viewDrop.video.description}</div>}
                    </div>
                  </div>
                  <SaveButton item={{ id: viewDrop.id + "_video", type: "drop", title: viewDrop.video.title || "Drop Video", icon: "📹", desc: viewDrop.video.description, url: viewDrop.video.url, pts: 0 }} boards={boards} onSaveToBoard={saveToBoard} />
                </div>
                <div style={{ borderRadius: 10, overflow: "hidden", background: "#000", aspectRatio: "16/9" }}>
                  <iframe src={embedUrl} style={{ width: "100%", height: "100%", border: "none" }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title={viewDrop.video.title || "Drop Video"} />
                </div>
              </div>
            )}

            {viewDrop.journal && (
              <div className="card" style={{ borderColor: "rgba(0,212,255,0.35)", background: "rgba(0,212,255,0.05)" }}>
                <div className="flex-between mb-8">
                  <div className="flex-center gap-8">
                    <span style={{ fontSize: 16 }}>📓</span>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, color: "var(--cream)" }}>{viewDrop.journal.title || "Journal"}</span>
                  </div>
                  {savedEntry?.text && (
                    <span style={{ fontSize: 11, color: "var(--sage)" }}>✓ Saved</span>
                  )}
                </div>
                <p style={{ fontSize: 14, color: "var(--cream-dim)", lineHeight: 1.85, marginBottom: 14 }}>{viewDrop.journal.prompt}</p>
                <div>
                  <label className="label">Your Response</label>
                  <textarea
                    className="input textarea"
                    style={{ minHeight: 130 }}
                    value={journalText}
                    onChange={e => handleJournalChange(e.target.value)}
                    placeholder="Write your thoughts here… this is just for you."
                  />
                  <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
                    Saves automatically as you type · Visible in your Journal
                  </div>
                </div>
              </div>
            )}

            {spotlights.length > 0 && spotlights.map(cs => (
              <div key={cs.id} className="card" style={{ borderColor: "rgba(176,96,255,0.35)", background: "rgba(144,128,192,0.05)" }}>
                <div className="flex-between mb-12">
                  <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: "var(--lavender)", fontWeight: 700 }}>💼 Career Spotlight</div>
                  <SaveButton item={{ id: cs.id, type: "career", title: cs.name + " — " + cs.role, icon: "💼", desc: cs.bio, pts: 0 }} boards={boards} onSaveToBoard={saveToBoard} />
                </div>
                <div className="flex-center gap-14 mb-12">
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--lavender-dim)", border: "2px solid rgba(176,96,255,0.45)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{cs.name?.[0] || "?"}</div>
                  <div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, color: "var(--cream)" }}>{cs.name}</div>
                    <div style={{ fontSize: 12, color: "var(--lavender)", marginTop: 2 }}>{cs.role}</div>
                  </div>
                </div>
                {cs.bio && <p style={{ fontSize: 13, color: "var(--cream-dim)", lineHeight: 1.75, marginBottom: 12 }}>{cs.bio}</p>}
                {cs.insight && (
                  <div style={{ padding: "12px 16px", background: "var(--bg3)", borderRadius: "var(--r)", borderLeft: "3px solid var(--lavender)" }}>
                    <p style={{ fontSize: 13, color: "var(--cream-dim)", lineHeight: 1.8, fontStyle: "italic" }}>{cs.insight}</p>
                  </div>
                )}
              </div>
            ))}

            {viewDrop.kindnessChallenge && (
              <div className="card" style={{ borderColor: "rgba(0,229,168,0.35)", background: "rgba(122,170,122,0.05)" }}>
                <div className="flex-center gap-8 mb-8">
                  <span style={{ fontSize: 16 }}>💛</span>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, color: "var(--cream)" }}>{viewDrop.kindnessChallenge.title || "Kindness Challenge"}</span>
                  <span className="tag tag-sage" style={{ marginLeft: "auto", fontSize: 10 }}>Today's Challenge</span>
                </div>
                <p style={{ fontSize: 14, color: "var(--cream-dim)", lineHeight: 1.85 }}>{viewDrop.kindnessChallenge.description}</p>
              </div>
            )}

            {!isDone && hasContent(viewDrop) && (
              <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => { onComplete(dropId, 5); }}>
                Mark Today's Drop Complete ✓
              </button>
            )}
            {isDone && (
              <div className="flex-center gap-10" style={{ justifyContent: "center", padding: "14px 0" }}>
                <div className="flex-center gap-8" style={{ color: "var(--sage)" }}>
                  <span style={{ fontSize: 18 }}>✓</span>
                  <span style={{ fontWeight: 600, fontSize: 15 }}>Drop complete — nice work.</span>
                </div>
                <button className="btn btn-ghost btn-xs" onClick={() => onUncomplete(dropId, 5)}>↩ Undo</button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🌤️ Daily Drops</h1>
        <p className="page-sub">Video, journal, career spotlight, and kindness challenge — fresh each day.</p>
      </div>
      <div className="page-content">
        {drops.length === 0 ? (
          <EmptyState icon="🌤️" title="No drops yet" sub="Your teacher will add daily drops here — check back soon." />
        ) : (
          <>
            {/* Today's Drop */}
            {todayDrop && hasContent(todayDrop) && (
              <div className="mb-24">
                <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: "var(--amber)", fontWeight: 700, marginBottom: 10 }}>Today's Drop</div>
                <div style={{ background: "var(--amber-dim)", border: "1px solid rgba(0,212,255,0.40)", borderRadius: "var(--r-lg)", padding: 24, cursor: "pointer" }} onClick={() => setSelectedDate(today)}>
                  <div className="flex-between mb-12">
                    <span style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--cream)" }}>{formatDisplayDate(today)}</span>
                    <span className={`tag ${completed.includes(todayDrop.id) ? "tag-sage" : "tag-amber"}`}>{completed.includes(todayDrop.id) ? "✓ Done" : "Open →"}</span>
                  </div>
                  <div className="flex gap-8 flex-wrap">
                    {todayDrop.video && <span className="tag tag-sky">📹 Video</span>}
                    {todayDrop.journal && <span className="tag tag-amber">📓 Journal</span>}
                    {filterSpotlights(todayDrop).length > 0 && <span className="tag tag-lavender">💼 Career Spotlight</span>}
                    {todayDrop.kindnessChallenge && <span className="tag tag-sage">💛 Kindness Challenge</span>}
                  </div>
                </div>
              </div>
            )}
            {(!todayDrop || !hasContent(todayDrop)) && (
              <div className="card mb-20" style={{ textAlign: "center", padding: 28 }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>📭</div>
                <div style={{ fontSize: 14, color: "var(--muted)" }}>No drop for today yet — check back later.</div>
              </div>
            )}

            {/* All drops list */}
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 600, color: "var(--muted)", marginBottom: 12 }}>All Drops</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {sortedDrops.map(drop => {
                if (!hasContent(drop)) return null;
                const isDone = completed.includes(drop.id);
                const isPast = drop.date < today;
                const isToday = drop.date === today;
                const spots = filterSpotlights(drop);
                return (
                  <div key={drop.id} onClick={() => setSelectedDate(drop.date)}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: "var(--r)", background: "var(--bg2)", border: `1px solid ${isToday ? "rgba(0,212,255,0.45)" : "var(--border)"}`, cursor: "pointer", opacity: isPast && !isDone ? 0.65 : 1, transition: "all 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "var(--amber)"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = isToday ? "rgba(0,212,255,0.45)" : "var(--border)"}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: isToday ? "var(--amber)" : "var(--cream)" }}>
                        {formatDisplayDate(drop.date)}{isToday ? " · Today" : ""}
                      </div>
                      <div className="flex gap-6 mt-4">
                        {drop.video && <span style={{ fontSize: 10, color: "var(--sky)" }}>📹</span>}
                        {drop.journal && <span style={{ fontSize: 10, color: "var(--amber)" }}>📓</span>}
                        {spots.length > 0 && <span style={{ fontSize: 10, color: "var(--lavender)" }}>💼</span>}
                        {drop.kindnessChallenge && <span style={{ fontSize: 10, color: "var(--sage)" }}>💛</span>}
                      </div>
                    </div>
                    {isDone ? <span className="tag tag-sage">✓ Done</span> : <span style={{ color: "var(--muted)", fontSize: 12 }}>→</span>}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── STUDENT: PORTFOLIO ───────────────────────────────────────────────────────

function Portfolio({ student, completed, content, onUncomplete, submissions, setSubmission, portfolioFeatured, setPortfolioFeatured }) {
  const allItems = [
    ...content.skills.filter(s => completed.includes(s.id)).map(s => ({ ...s, type: "skill", label: "Skill" })),
    ...content.projects.filter(p => completed.includes(p.id)).map(p => ({ ...p, type: "project", label: "Project", name: p.title })),
    ...content.gigs.filter(g => completed.includes(g.id)).map(g => ({ ...g, type: "gig", label: "Gig", name: g.title })),
    ...content.ripple.filter(r => completed.includes(r.id)).map(r => ({ ...r, type: "ripple", label: "Ripple", name: r.title })),
  ];

  const typeColors = { skill: "amber", project: "sky", gig: "sage", ripple: "clay" };
  const [filter, setFilter] = useState("all");
  const [expandedItem, setExpandedItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  const filtered = filter === "all" ? allItems
    : filter === "featured" ? allItems.filter(i => portfolioFeatured[i.id] !== false && (submissions[i.id]?.blocks?.length > 0))
    : allItems.filter(i => i.type === filter);

  const featuredCount = allItems.filter(i => portfolioFeatured[i.id] !== false && submissions[i.id]?.blocks?.length > 0).length;

  // Generate and download portfolio as HTML
  const downloadPortfolio = () => {
    const featuredItems = allItems.filter(i => portfolioFeatured[i.id] !== false);
    const now = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

    const renderBlocksHTML = (blocks) => {
      if (!blocks || !blocks.length) return "";
      return blocks.map(b => {
        if (b.type === "heading") return "<h3 class=\"sub-heading\">" + escH(b.value) + "</h3>";
        if (b.type === "text") return "<p class=\"block-text\">" + escH(b.value).replace(/\n/g, "<br>") + "</p>";
        if (b.type === "image") return "<figure class=\"block-image\"><img src=\"" + b.value + "\" alt=\"" + escH(b.caption || "") + "\"><figcaption>" + escH(b.caption || "") + "</figcaption></figure>";
        if (b.type === "link") return "<a class=\"block-link\" href=\"" + escH(b.value) + "\" target=\"_blank\">" + escH(b.label || b.value) + " →</a>";
        if (b.type === "file") return "<div class=\"block-file\">📎 " + escH(b.filename || "File") + "</div>";
        return "";
      }).join("\n");
    };
    const escH = (s) => String(s || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");

    const itemsHTML = featuredItems.map(item => {
      const sub = submissions[item.id] || {};
      const color = { skill: "#e8a020", project: "#6090b8", gig: "#7aaa7a", ripple: "#c87060" }[item.type] || "#e8a020";
      const hasBlocks = sub.blocks && sub.blocks.length > 0;
      return [
        "<article class=\"portfolio-item\">",
        "  <div class=\"item-header\" style=\"border-left: 4px solid " + color + "\">",
        "    <div class=\"item-meta\"><span class=\"item-type\" style=\"color:" + color + "\">" + escH(item.label) + "</span>" + (item.pts ? " <span class=\"item-pts\">+" + item.pts + " pts</span>" : "") + "</div>",
        "    <h2 class=\"item-title\">" + escH(item.name || item.title || "") + "</h2>",
        "    " + (item.desc ? "<p class=\"item-desc\">" + escH(String(item.desc).substring(0, 200)) + (String(item.desc).length > 200 ? "…" : "") + "</p>" : ""),
        "  </div>",
        hasBlocks ? ("  <div class=\"submission\">\n    <h3 class=\"submission-label\">My Submission</h3>\n" + renderBlocksHTML(sub.blocks) + "\n  </div>") : "",
        "</article>",
      ].filter(Boolean).join("\n");
    }).join("\n\n");

    const html = [
      "<!DOCTYPE html>",
      "<html lang=\"en\">",
      "<head>",
      "<meta charset=\"UTF-8\">",
      "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">",
      "<title>" + escH(student.name) + " — Learning Portfolio</title>",
      "<style>",
      "  *{box-sizing:border-box;margin:0;padding:0}",
      "  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8f7f4;color:#2d2d2a;line-height:1.6;padding:0}",
      "  .cover{background:linear-gradient(135deg,#141410,#272720);color:#f0ead8;padding:64px 40px;text-align:center}",
      "  .cover-name{font-size:48px;font-weight:900;letter-spacing:-2px;margin-bottom:8px}",
      "  .cover-sub{font-size:18px;opacity:.65;margin-bottom:24px}",
      "  .cover-stats{display:flex;gap:32px;justify-content:center;flex-wrap:wrap}",
      "  .stat{background:rgba(255,255,255,.08);border-radius:12px;padding:16px 28px;text-align:center}",
      "  .stat-num{font-size:32px;font-weight:800;color:#e8a020}",
      "  .stat-label{font-size:12px;opacity:.6;text-transform:uppercase;letter-spacing:1px;margin-top:4px}",
      "  .main{max-width:760px;margin:0 auto;padding:48px 24px}",
      "  .portfolio-item{background:#fff;border-radius:16px;margin-bottom:28px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.07)}",
      "  .item-header{padding:28px 32px;background:#fafaf8}",
      "  .item-meta{margin-bottom:8px}",
      "  .item-type{font-size:11px;text-transform:uppercase;letter-spacing:2px;font-weight:700}",
      "  .item-pts{font-size:11px;color:#888;margin-left:10px}",
      "  .item-title{font-size:24px;font-weight:800;margin-bottom:10px;letter-spacing:-0.5px}",
      "  .item-desc{font-size:14px;color:#666;line-height:1.7}",
      "  .submission{padding:28px 32px;border-top:1px solid #eee}",
      "  .submission-label{font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#aaa;font-weight:700;margin-bottom:20px}",
      "  .sub-heading{font-size:20px;font-weight:700;margin:20px 0 10px;color:#1a1a18}",
      "  .block-text{font-size:15px;color:#444;line-height:1.8;margin-bottom:16px}",
      "  .block-image{margin:20px 0;border-radius:12px;overflow:hidden}",
      "  .block-image img{width:100%;display:block;max-height:500px;object-fit:cover}",
      "  .block-image figcaption{padding:8px 14px;font-size:12px;color:#888;font-style:italic;background:#f5f5f3}",
      "  .block-link{display:inline-flex;align-items:center;gap:8px;padding:10px 18px;background:#f0f7ff;color:#2563eb;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;margin:8px 0;border:1px solid #dbeafe}",
      "  .block-file{padding:12px 16px;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;font-size:14px;color:#92400e;margin:8px 0}",
      "  .footer{text-align:center;padding:40px;color:#aaa;font-size:13px;border-top:1px solid #eee;margin-top:48px}",
      "</style>",
      "</head>",
      "<body>",
      "<div class=\"cover\">",
      "  <div class=\"cover-name\">" + escH(student.name || "Student") + "</div>",
      "  <div class=\"cover-sub\">Learning Portfolio · " + now + "</div>",
      "  <div class=\"cover-stats\">",
      "    <div class=\"stat\"><div class=\"stat-num\">" + allItems.reduce((a, b) => a + (b.pts || 0), 0) + "</div><div class=\"stat-label\">Total Points</div></div>",
      "    <div class=\"stat\"><div class=\"stat-num\">" + allItems.filter(i => i.type === "skill").length + "</div><div class=\"stat-label\">Skills Mastered</div></div>",
      "    <div class=\"stat\"><div class=\"stat-num\">" + allItems.filter(i => i.type === "project").length + "</div><div class=\"stat-label\">Projects</div></div>",
      "    <div class=\"stat\"><div class=\"stat-num\">" + allItems.filter(i => i.type === "gig").length + "</div><div class=\"stat-label\">Gigs Completed</div></div>",
      "  </div>",
      "</div>",
      "<div class=\"main\">",
      itemsHTML || "<p style=\"color:#aaa;text-align:center;padding:40px\">No items in portfolio yet.</p>",
      "</div>",
      "<div class=\"footer\">Generated by Forge Learning Platform · " + now + "</div>",
      "</body>",
      "</html>",
    ].join("\n");

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (student.name || "student").replace(/\s+/g, "-").toLowerCase() + "-portfolio.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="page-header">
        <div className="flex-between">
          <div>
            <h1 className="page-title">🗂 Portfolio</h1>
            <p className="page-sub">{allItems.length} items · {featuredCount} with submissions</p>
          </div>
          <div className="flex gap-10" style={{ alignItems: "center" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 700, color: "var(--amber)", lineHeight: 1 }}>
                {allItems.reduce((a, b) => a + (b.pts || 0), 0)}
              </div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>total pts</div>
            </div>
            <button className="btn btn-primary" onClick={downloadPortfolio} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              ⬇ Download HTML
            </button>
          </div>
        </div>
      </div>

      <div className="page-content">
        {allItems.length === 0 ? (
          <EmptyState icon="🗂" title="Your portfolio is empty" sub="Complete skills, projects, gigs, and missions — they'll automatically appear here." />
        ) : (
          <>
            <div className="filter-row">
              {[{ id: "all", label: "All" }, { id: "featured", label: "With Submissions ✦" }, { id: "skill", label: "Skills" }, { id: "project", label: "Projects" }, { id: "gig", label: "Gigs" }, { id: "ripple", label: "Ripple" }].map(f => (
                <button key={f.id} className={"filter-btn " + (filter === f.id ? "active" : "")} onClick={() => setFilter(f.id)}>{f.label}</button>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {filtered.map(item => {
                const sub = submissions[item.id] || {};
                const hasBlocks = sub.blocks && sub.blocks.length > 0;
                const isFeatured = portfolioFeatured[item.id] !== false;
                const isExpanded = expandedItem === item.id;
                const isEditing = editingItem === item.id;
                const accentColor = "var(--" + typeColors[item.type] + ")";

                return (
                  <div key={item.id} style={{ background: "var(--bg2)", border: "1px solid " + (isEditing ? "var(--amber)" : isFeatured && hasBlocks ? accentColor + "55" : "var(--border)"), borderRadius: "var(--r-lg)", overflow: "hidden", transition: "border 0.2s" }}>
                    {/* Color bar */}
                    <div style={{ height: 3, background: accentColor }} />

                    {/* Item header row */}
                    <div style={{ padding: "16px 20px", display: "flex", alignItems: "flex-start", gap: 14 }}>
                      <div style={{ width: 44, height: 44, borderRadius: "var(--r)", background: accentColor + "18", border: "2px solid " + accentColor + "44", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                        {item.icon || "◈"}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="flex-center gap-8 mb-3">
                          <span className={"tag tag-" + typeColors[item.type]}>{item.label}</span>
                          {item.area && <span style={{ fontSize: 11, color: "var(--muted)" }}>{content.areas.find(a => a.id === item.area)?.name}</span>}
                          {hasBlocks && <span className="tag tag-sage" style={{ fontSize: 10 }}>📁 {sub.blocks.length} block{sub.blocks.length !== 1 ? "s" : ""}</span>}
                        </div>
                        <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--cream)", marginBottom: 3 }}>{item.name}</div>
                        <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>{item.desc?.substring(0, 90)}{item.desc?.length > 90 ? "…" : ""}</div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
                        <span className="pts-badge">+{item.pts} pts</span>
                        <div className="flex gap-6">
                          <label style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}>
                            <input type="checkbox" checked={isFeatured}
                              onChange={e => setPortfolioFeatured(p => ({ ...p, [item.id]: e.target.checked }))} />
                            <span style={{ fontSize: 11, color: "var(--muted)" }}>Feature</span>
                          </label>
                          {hasBlocks && !isEditing && (
                            <button className="btn btn-ghost btn-xs" onClick={() => setExpandedItem(isExpanded ? null : item.id)}>
                              {isExpanded ? "▲ Hide" : "▼ Preview"}
                            </button>
                          )}
                          <button
                            className={"btn btn-xs " + (isEditing ? "btn-primary" : "btn-ghost")}
                            onClick={() => { setEditingItem(isEditing ? null : item.id); setExpandedItem(null); }}>
                            {isEditing ? "✓ Done Editing" : hasBlocks ? "✏️ Edit Submission" : "+ Add Submission"}
                          </button>
                          <button className="btn btn-ghost btn-xs" style={{ fontSize: 10, color: "var(--muted)" }}
                            onClick={() => onUncomplete(item.id, item.pts || 0)} title="Remove from portfolio">↩</button>
                        </div>
                      </div>
                    </div>

                    {/* Submission preview */}
                    {isExpanded && hasBlocks && !isEditing && (
                      <div style={{ padding: "0 20px 20px", borderTop: "1px solid var(--border)" }}>
                        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 2, color: "var(--muted)", fontWeight: 700, padding: "14px 0 12px" }}>Submission Preview</div>
                        <SubmissionRenderer blocks={sub.blocks} compact={true} />
                      </div>
                    )}

                    {/* Submission editor — full and obvious */}
                    {isEditing && (
                      <div style={{ borderTop: "2px solid var(--amber)" }}>
                        <div style={{ padding: "14px 20px", background: "var(--amber-dim)", display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: 16 }}>📁</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--amber)" }}>Portfolio Submission Editor</div>
                            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>Add text, images, links, and files to document your work</div>
                          </div>
                          <button className="btn btn-primary btn-sm" onClick={() => setEditingItem(null)}>✓ Done</button>
                        </div>
                        <div style={{ padding: 20 }}>
                          <SubmissionBuilder
                            submission={sub}
                            onChange={(updated) => setSubmission(item.id, updated)}
                            itemTitle={item.name}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {filtered.length === 0 && filter === "featured" && (
              <EmptyState icon="📁" title="No submissions yet" sub="Complete a project or gig, then use the submission builder to document your work." />
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── STUDENT: TRANSCRIPT ──────────────────────────────────────────────────────

function Transcript({ completed, content }) {
  const skills = content.skills;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📋 Transcript</h1>
        <p className="page-sub">Your official learning record — organized by subject area</p>
      </div>
      <div className="page-content">
        <div className="grid-4 mb-20">
          {(() => {
            const totalEarned = content.areas.reduce((acc, area) => {
              const areaSkills = skills.filter(s => s.area === area.id && completed.includes(s.id));
              return acc + areaSkills.reduce((a, b) => a + (b.pts || 0), 0);
            }, 0);
            const totalTarget = content.areas.reduce((a,b)=>a+(b.target||0),0);
            const pct = Math.round((totalEarned / totalTarget) * 100);
            const areasComplete = content.areas.filter(area => {
              const earned = skills.filter(s => s.area === area.id && completed.includes(s.id)).reduce((a, b) => a + (b.pts || 0), 0);
              return earned >= area.target;
            }).length;
            return [
              { num: totalEarned, label: "Total Points", color: "var(--amber)" },
              { num: pct + "%", label: "Completion", color: "var(--sky)" },
              { num: areasComplete, label: "Areas Complete", color: "var(--sage)" },
              { num: completed.filter(id => skills.find(s => s.id === id)).length, label: "Skills Mastered", color: "var(--lavender)" },
            ].map((s, i) => (
              <div key={i} className="stat-card">
                <div className="stat-num" style={{ color: s.color }}>{s.num}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ));
          })()}
        </div>

        {content.areas.map(area => {
          const areaSkills = skills.filter(s => s.area === area.id);
          const doneSkills = areaSkills.filter(s => completed.includes(s.id));
          const earned = doneSkills.reduce((a, b) => a + (b.pts || 0), 0);
          const pct = Math.min(100, Math.round((earned / area.target) * 100));
          const color = areaColor(area.id, content.areas);

          return (
            <div key={area.id} className="transcript-area mb-12">
              <div className="transcript-header">
                <div className="flex-center gap-10">
                  <span style={{ fontSize: 18 }}>{area.icon}</span>
                  <div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 600, color: "var(--cream)" }}>{area.name}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>{doneSkills.length} of {areaSkills.length} skills · {earned}/{area.target} pts</div>
                  </div>
                </div>
                <div className="flex-center gap-10">
                  <div style={{ width: 120, height: 5, background: "var(--border)", borderRadius: 5, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 5, transition: "width 0.5s" }} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: pct >= 100 ? "var(--sage)" : color, minWidth: 36, textAlign: "right" }}>{pct}%</span>
                  {pct >= 100 && <span className="tag tag-sage">✓</span>}
                </div>
              </div>
              {doneSkills.length > 0 && doneSkills.map(skill => (
                <div key={skill.id} className="transcript-row">
                  <div className="flex-center gap-8">
                    <span style={{ fontSize: 14 }}>{skill.icon}</span>
                    <span style={{ color: "var(--cream-dim)" }}>{skill.name}</span>
                  </div>
                  <span className="pts-badge">+{skill.pts} pts</span>
                </div>
              ))}
              {doneSkills.length === 0 && (
                <div style={{ padding: "12px 18px", fontSize: 12, color: "var(--muted)", fontStyle: "italic" }}>No skills mastered yet in this area</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── STUDENT: ROADMAP ─────────────────────────────────────────────────────────

function Roadmap({ roadmap, setRoadmap }) {
  const [openYears, setOpenYears] = useState([]);
  const toggle = (i) => setOpenYears(p => p.includes(i) ? p.filter(x => x !== i) : [...p, i]);

  const updateItem = (yearIdx, qIdx, itemIdx, val) => {
    setRoadmap(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next.years[yearIdx].quarters[qIdx].items[itemIdx] = val;
      return next;
    });
  };
  const updateFocus = (yearIdx, qIdx, val) => {
    setRoadmap(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next.years[yearIdx].quarters[qIdx].focus = val;
      return next;
    });
  };
  const addItem = (yearIdx, qIdx) => {
    setRoadmap(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      next.years[yearIdx].quarters[qIdx].items.push("New goal");
      return next;
    });
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🗺 4-Year Roadmap</h1>
        <p className="page-sub">Your long-game plan. Click any text to edit it.</p>
      </div>
      <div className="page-content">
        {roadmap.years.map((year, yi) => (
          <div key={yi} className="year-block">
            <div className="year-header" onClick={() => toggle(yi)}>
              <div>
                <div className="year-title">{year.label} <span style={{ fontSize: 14, fontWeight: 400, color: "var(--muted)" }}>— {year.subtitle}</span></div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 3 }}>{year.theme}</div>
              </div>
              <span style={{ color: "var(--muted)", fontSize: 18 }}>{openYears.includes(yi) ? "▾" : "▸"}</span>
            </div>
            {openYears.includes(yi) && (
              <div className="year-body">
                <div className="quarter-grid">
                  {year.quarters.map((q, qi) => (
                    <div key={qi} className="quarter-card">
                      <div className="quarter-label">{q.label}</div>
                      <div contentEditable suppressContentEditableWarning style={{ fontSize: 13, fontWeight: 600, color: "var(--amber)", marginBottom: 8, outline: "none", cursor: "text" }} onBlur={e => updateFocus(yi, qi, e.target.innerText)}>{q.focus}</div>
                      <div>
                        {q.items.map((item, ii) => (
                          <div key={ii} className="checklist-item" style={{ padding: "5px 0" }}>
                            <div style={{ width: 5, height: 5, borderRadius: 50, background: "var(--amber)", flexShrink: 0, marginTop: 6 }} />
                            <span contentEditable suppressContentEditableWarning style={{ fontSize: 12, color: "var(--cream-dim)", outline: "none", cursor: "text", flex: 1 }} onBlur={e => updateItem(yi, qi, ii, e.target.innerText)}>{item}</span>
                          </div>
                        ))}
                        <button onClick={() => addItem(yi, qi)} style={{ fontSize: 11, color: "var(--muted)", background: "none", border: "none", cursor: "pointer", padding: "4px 0", marginTop: 2 }}>+ Add goal</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── STUDENT: MY PROFILE ──────────────────────────────────────────────────────

function MyProfile({ student, setStudent, content }) {
  const questions = content.profileQuestions || [];
  const [answers, setAnswers] = useState(() => ({ ...(student.profileAnswers || {}) }));
  const [saved, setSaved] = useState(false);
  const [recommendations, setRecommendations] = useState([]);

  const setAns = (id, val) => setAnswers(p => ({ ...p, [id]: val }));

  const toggleMulti = (id, opt) => {
    const cur = answers[id] || [];
    setAnswers(p => ({ ...p, [id]: cur.includes(opt) ? cur.filter(x => x !== opt) : [...cur, opt] }));
  };

  const toggleInterest = (intId) => {
    const cur = answers["pq_interests"] || student.interests || [];
    setAnswers(p => ({ ...p, pq_interests: cur.includes(intId) ? cur.filter(x => x !== intId) : [...cur, intId] }));
  };

  const toggleStrength = (s) => {
    const cur = answers["pq_strengths"] || student.strengths || [];
    setAnswers(p => ({ ...p, pq_strengths: cur.includes(s) ? cur.filter(x => x !== s) : [...cur, s] }));
  };

  const handleSave = () => {
    // Collect routing recommendations
    const recs = [];
    questions.forEach(q => {
      const ans = answers[q.id];
      if (!ans && ans !== 0) return;
      (q.routing || []).forEach(rule => {
        let matched = false;
        if (rule.trigger === "always") matched = true;
        else if (rule.trigger.startsWith("opt_")) {
          const idx = parseInt(rule.trigger.split("_")[1]);
          if (q.type === "single_choice") matched = ans === idx;
          else if (q.type === "multi_choice") matched = Array.isArray(ans) && ans.includes(idx);
        }
        if (matched && (rule.message || (rule.recommendType && rule.recommendType !== "none" && rule.recommendId))) {
          recs.push({ ...rule, questionId: q.id });
        }
      });
    });

    // Update student: merge interests/strengths from dedicated question types
    const interestAns = answers["pq_interests"] ?? student.interests ?? [];
    const strengthAns = answers["pq_strengths"] ?? student.strengths ?? [];
    setStudent(prev => ({
      ...prev,
      profileAnswers: answers,
      interests: interestAns,
      strengths: strengthAns,
    }));
    setRecommendations(recs);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const getItem = (type, id) => {
    const map = { skill: content.skills, project: content.projects, gig: content.gigs, ripple: content.ripple, lightroom: content.lightRoom, teensguide: content.teensGuide };
    return (map[type] || []).find(i => i.id === id) || null;
  };
  const typeLabel = { skill: "Skill", project: "Project", gig: "Gig", ripple: "Ripple Mission", lightroom: "Light Room", teensguide: "Teen's Guide" };

  const requiredUnanswered = questions.filter(q => q.required && !answers[q.id]).length;

  return (
    <div>
      <div className="page-header">
        <div className="flex-between">
          <div>
            <h1 className="page-title">👤 My Profile</h1>
            <p className="page-sub">Fill in your info at your own pace — your answers help Forge recommend the right things for you</p>
          </div>
          <button className="btn btn-primary" onClick={handleSave} disabled={requiredUnanswered > 0}>
            {saved ? "✓ Saved!" : "Save Profile"}
          </button>
        </div>
      </div>

      <div className="page-content">
        {/* Student name / login info card */}
        <div className="card mb-20" style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--amber-dim)", border: "2px solid var(--amber)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, color: "var(--amber)", flexShrink: 0 }}>
            {student.name?.[0] || "?"}
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "var(--cream)" }}>{student.name}</div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>@{student.username} · {(student.completed || []).length} items completed · {student.points || 0} pts</div>
          </div>
        </div>

        {/* Profile questions */}
        {questions.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: 32, color: "var(--muted)", fontSize: 13 }}>
            No profile questions set up yet — your teacher will add some soon.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 680 }}>
            {questions.map((q) => {
              const ans = answers[q.id];
              return (
                <div key={q.id} className="card">
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--cream)", lineHeight: 1.3 }}>
                      {q.question}
                      {q.required && <span style={{ color: "var(--clay)", marginLeft: 6, fontSize: 13 }}>*</span>}
                    </div>
                  </div>

                  {q.type === "text" && (
                    <input className="input" value={ans || ""} onChange={e => setAns(q.id, e.target.value)} placeholder={q.placeholder || ""} />
                  )}

                  {q.type === "textarea" && (
                    <textarea className="input textarea" style={{ minHeight: 90 }} value={ans || ""} onChange={e => setAns(q.id, e.target.value)} placeholder={q.placeholder || ""} />
                  )}

                  {q.type === "single_choice" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {(q.options || []).map((opt, i) => (
                        <div key={i} onClick={() => setAns(q.id, i)} style={{
                          padding: "11px 15px", borderRadius: "var(--r)",
                          border: `1.5px solid ${ans === i ? "var(--amber)" : "var(--border)"}`,
                          background: ans === i ? "var(--amber-dim)" : "var(--bg3)",
                          color: ans === i ? "var(--amber)" : "var(--cream-dim)",
                          cursor: "pointer", fontSize: 14, transition: "all 0.15s",
                          display: "flex", alignItems: "center", gap: 10,
                        }}>
                          <span style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${ans === i ? "var(--amber)" : "var(--border)"}`, background: ans === i ? "var(--amber)" : "transparent", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
                            {ans === i && <span style={{ color: "#0c0c16", fontSize: 8, fontWeight: 900 }}>✓</span>}
                          </span>
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}

                  {q.type === "multi_choice" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {(q.options || []).map((opt, i) => {
                        const selected = Array.isArray(ans) && ans.includes(i);
                        return (
                          <div key={i} onClick={() => toggleMulti(q.id, i)} style={{
                            padding: "11px 15px", borderRadius: "var(--r)",
                            border: `1.5px solid ${selected ? "var(--amber)" : "var(--border)"}`,
                            background: selected ? "var(--amber-dim)" : "var(--bg3)",
                            color: selected ? "var(--amber)" : "var(--cream-dim)",
                            cursor: "pointer", fontSize: 14, transition: "all 0.15s",
                            display: "flex", alignItems: "center", gap: 10,
                          }}>
                            <span style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${selected ? "var(--amber)" : "var(--border)"}`, background: selected ? "var(--amber)" : "transparent", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              {selected && <span style={{ color: "#0c0c16", fontSize: 8, fontWeight: 900 }}>✓</span>}
                            </span>
                            {opt}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {q.type === "interests" && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {INTERESTS.map(int => {
                        const cur = answers["pq_interests"] ?? student.interests ?? [];
                        const sel = cur.includes(int.id);
                        return (
                          <button key={int.id} className={`interest-chip ${sel ? "selected" : ""}`} onClick={() => toggleInterest(int.id)}>
                            <span>{int.icon}</span> {int.label}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {q.type === "strengths" && (
                    <div>
                      {STRENGTHS.map(s => {
                        const cur = answers["pq_strengths"] ?? student.strengths ?? [];
                        const sel = cur.includes(s);
                        return (
                          <div key={s} className="checklist-item" onClick={() => toggleStrength(s)} style={{ cursor: "pointer" }}>
                            <CheckBox checked={sel} onChange={() => toggleStrength(s)} />
                            <span style={{ fontSize: 14, color: "var(--cream-dim)", marginTop: 1 }}>{s}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Save button */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              {requiredUnanswered > 0 && (
                <div style={{ fontSize: 12, color: "var(--clay)", alignSelf: "center" }}>
                  {requiredUnanswered} required question{requiredUnanswered !== 1 ? "s" : ""} unanswered
                </div>
              )}
              <button className="btn btn-primary" onClick={handleSave} disabled={requiredUnanswered > 0}>
                {saved ? "✓ Saved!" : "Save Profile"}
              </button>
            </div>

            {/* Recommendations from routing rules */}
            {recommendations.length > 0 && (
              <div style={{ marginTop: 4 }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--cream)", marginBottom: 14 }}>
                  ✦ Recommended for you
                </div>
                {recommendations.map((rec, i) => {
                  const item = getItem(rec.recommendType, rec.recommendId);
                  return (
                    <div key={i} style={{ background: "var(--bg2)", border: "1px solid var(--amber)", borderRadius: "var(--r-lg)", padding: "16px 18px", marginBottom: 10 }}>
                      {rec.message && <p style={{ fontSize: 13, color: "var(--cream-dim)", lineHeight: 1.65, marginBottom: item ? 12 : 0 }}>{rec.message}</p>}
                      {item && (
                        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "var(--bg3)", borderRadius: "var(--r)", border: "1px solid var(--border)" }}>
                          <span style={{ fontSize: 20 }}>{item.icon || "◈"}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: "var(--amber)", fontWeight: 700, marginBottom: 2 }}>{typeLabel[rec.recommendType]}</div>
                            <div style={{ fontFamily: "var(--font-display)", fontSize: 14, fontWeight: 700, color: "var(--cream)" }}>{item.name || item.title}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── STUDENT: JOURNAL ────────────────────────────────────────────────────────

function StudentJournal({ journalEntries, content, onNavigate }) {
  const [expandedId, setExpandedId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const entries = Object.entries(journalEntries || {})
    .filter(([, e]) => e?.text?.trim() || e?.prompt)
    .map(([dropId, entry]) => {
      const drop = content.dailyDrops.find(d => d.id === dropId);
      return { dropId, ...entry, drop };
    })
    .sort((a, b) => (b.dropDate || "").localeCompare(a.dropDate || ""));

  if (entries.length === 0) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">📓 Journal</h1>
          <p className="page-sub">Your writing from Daily Drops will appear here</p>
        </div>
        <div className="page-content">
          <EmptyState icon="📓" title="No journal entries yet"
            sub="When you write in a Daily Drop's journal prompt, it'll be saved and collected here."
            action={<button className="btn btn-ghost btn-sm" onClick={() => onNavigate("drops")}>Go to Daily Drops →</button>} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div className="flex-between">
          <div>
            <h1 className="page-title">📓 Journal</h1>
            <p className="page-sub">{entries.length} entr{entries.length !== 1 ? "ies" : "y"} · Your writing from Daily Drops</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("drops")}>+ New Drop →</button>
        </div>
      </div>

      <div className="page-content" style={{ maxWidth: 720 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {entries.map(({ dropId, text, prompt, title, dropDate }) => {
            const isExpanded = expandedId === dropId;
            const wordCount = text ? text.trim().split(/\s+/).filter(Boolean).length : 0;
            return (
              <div key={dropId} style={{
                background: "var(--bg2)",
                border: "1px solid var(--border)",
                borderLeft: "3px solid var(--amber)",
                borderRadius: "var(--r-lg)",
                overflow: "hidden",
                transition: "border-color 0.15s",
              }}>
                {/* Entry header — always visible */}
                <div onClick={() => setExpandedId(isExpanded ? null : dropId)}
                  style={{ padding: "16px 20px", cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="flex-center gap-10 mb-4">
                      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--amber)", textTransform: "uppercase", letterSpacing: 1.5 }}>
                        {title || "Journal"}
                      </span>
                      {dropDate && (
                        <span style={{ fontSize: 11, color: "var(--muted)" }}>{formatDisplayDate(dropDate)}</span>
                      )}
                      <span style={{ fontSize: 10, color: "var(--muted)", marginLeft: "auto" }}>
                        {wordCount} word{wordCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                    {prompt && (
                      <div style={{ fontSize: 12, color: "var(--muted)", fontStyle: "italic", lineHeight: 1.5, marginBottom: isExpanded ? 0 : 6 }}>
                        {prompt.length > 100 && !isExpanded ? prompt.substring(0, 100) + "…" : prompt}
                      </div>
                    )}
                    {!isExpanded && text && (
                      <p style={{ fontSize: 13, color: "var(--cream-dim)", lineHeight: 1.65, margin: "8px 0 0" }}>
                        {text.length > 160 ? text.substring(0, 160) + "…" : text}
                      </p>
                    )}
                  </div>
                  <span style={{ color: "var(--muted)", fontSize: 12, flexShrink: 0, marginTop: 2 }}>{isExpanded ? "▲" : "▼"}</span>
                </div>

                {/* Expanded full entry */}
                {isExpanded && (
                  <div style={{ borderTop: "1px solid var(--border)", padding: "16px 20px", background: "rgba(232,160,32,0.03)" }}>
                    <div style={{ fontSize: 12, color: "var(--muted)", fontStyle: "italic", lineHeight: 1.6, marginBottom: 12, padding: "10px 14px", background: "var(--bg3)", borderRadius: "var(--r)", borderLeft: "2px solid var(--amber)" }}>
                      {prompt}
                    </div>
                    <div style={{ fontSize: 14, color: "var(--cream-dim)", lineHeight: 1.85, whiteSpace: "pre-wrap" }}>
                      {text}
                    </div>
                    <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end" }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => onNavigate("drops")}>
                        Open in Daily Drops →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── STUDENT APP ──────────────────────────────────────────────────────────────

function StudentApp({ student, setStudent, content, apiKey, messages, setMessages, onSwitchRole }) {
  const [view, setView] = useState("dashboard");
  const [completed, setCompleted] = useState([]);
  const [points, setPoints] = useState(0);
  const [weekPlan, setWeekPlan] = useState({ skills: [], mission: null, gig: null, ripple: null, guide: null, lightroom: null });
  const [roadmap, setRoadmap] = useState(defaultRoadmap);
  const [studentFaction, setStudentFaction] = useState(null);
  const [approvals, setApprovals] = useState([]);
  const [grabbedGigs, setGrabbedGigs] = useState({});
  const [boards, setBoards] = useState(DEFAULT_BOARDS);
  const [submissions, setSubmissions] = useState({}); // itemId → { blocks: [], featured: bool, reflection: string }
  const [portfolioFeatured, setPortfolioFeatured] = useState({}); // itemId → bool
  const [seenCheckIns, setSeenCheckIns] = useState([]); // ids seen this session
  const [journalEntries, setJournalEntries] = useState({}); // dropId → { text, prompt, title, dropDate }
  const [habitLogs, setHabitLogs] = useState({}); // habitId → [dateStr]
  const [goals, setGoals] = useState([]); // [{id, title, targetDate, milestones, status, reflection}]

  const saveJournalEntry = useCallback((dropId, entry) => {
    setJournalEntries(prev => ({ ...prev, [dropId]: entry }));
  }, []);

  const markCheckInSeen = useCallback((id) => {
    setSeenCheckIns(prev => prev.includes(id) ? prev : [...prev, id]);
  }, []);

  const setSubmission = useCallback((itemId, updater) => {
    setSubmissions(prev => ({ ...prev, [itemId]: typeof updater === "function" ? updater(prev[itemId] || { blocks: [], featured: false, reflection: "" }) : updater }));
  }, []);

  const saveToBoard = useCallback((boardId, snapshot) => {
    setBoards(prev => prev.map(b => b.id === boardId
      ? { ...b, items: b.items.some(i => i.id === snapshot.id) ? b.items : [snapshot, ...b.items] }
      : b
    ));
  }, []);

  const complete = useCallback((id, pts) => {
    setCompleted(prev => prev.includes(id) ? prev : [...prev, id]);
    setPoints(prev => prev + (pts || 0));
  }, []);

  const uncomplete = useCallback((id, pts) => {
    setCompleted(prev => prev.filter(x => x !== id));
    setPoints(prev => Math.max(0, prev - (pts || 0)));
  }, []);

  const submitApproval = (data) => {
    setApprovals(prev => [...prev, {
      id: "a" + Date.now(),
      studentName: student.name,
      ...data,
      status: "pending",
      submittedAt: new Date().toLocaleDateString(),
    }]);
  };

  const NAV = [
    { id: "dashboard", label: "Dashboard", icon: "⬡" },
    { id: "planner", label: "Weekly Planner", icon: "📅" },
    null,
    { id: "skills", label: "Skill Explorer", icon: "◈" },
    { id: "projects", label: "Project Lab", icon: "⬟" },
    { id: "factions", label: "Factions & Gigs", icon: "⚡" },
    { id: "ripple", label: "Ripple Missions", icon: "🌊" },
    null,
    { id: "teensguide", label: "Teen's Guide", icon: "📖" },
    { id: "lightroom", label: "Light Room", icon: "💡" },
    { id: "drops", label: "Daily Drops", icon: "🌤️" },
    { id: "journal", label: "Journal", icon: "📓" },
    { id: "habits", label: "Habits & Chores", icon: "✅" },
    { id: "goals", label: "Goals", icon: "🎯" },
    { id: "messages", label: "Messages", icon: "✉️" },
    null,
    { id: "portfolio", label: "Portfolio", icon: "🗂" },
    { id: "transcript", label: "Transcript", icon: "📋" },
    { id: "roadmap", label: "Roadmap", icon: "🗺" },
    { id: "profile", label: "My Profile", icon: "👤" },
  ];

  const renderView = () => {
    switch (view) {
      case "dashboard": return <StudentDashboard student={student} completed={completed} points={points} content={content} weekPlan={weekPlan} grabbedGigs={grabbedGigs} onNavigate={setView} boards={boards} setBoards={setBoards} saveToBoard={saveToBoard} onComplete={complete} onUncomplete={uncomplete} journalEntries={journalEntries} habitDefs={content.habitDefs || []} habitLogs={habitLogs} setHabitLogs={setHabitLogs} goals={goals} messages={messages} />;
      case "habits": return <StudentHabitsPage habitDefs={content.habitDefs || []} habitLogs={habitLogs} setHabitLogs={setHabitLogs} student={student} onComplete={complete} />;
      case "goals": return <StudentGoalsPage goals={goals} setGoals={setGoals} />;
      case "messages": return <StudentMessagesPage messages={messages} setMessages={setMessages} studentId={student.id} />;
      case "planner": return <WeeklyPlanner content={content} completed={completed} weekPlan={weekPlan} setWeekPlan={setWeekPlan} onComplete={complete} onUncomplete={uncomplete} />;
      case "skills": return <SkillExplorer student={student} completed={completed} content={content} apiKey={apiKey} onComplete={complete} onUncomplete={uncomplete} onSubmitApproval={submitApproval} boards={boards} saveToBoard={saveToBoard} submissions={submissions} setSubmission={setSubmission} />;
      case "projects": return <ProjectLab student={student} completed={completed} content={content} apiKey={apiKey} onComplete={complete} onUncomplete={uncomplete} boards={boards} saveToBoard={saveToBoard} submissions={submissions} setSubmission={setSubmission} portfolioFeatured={portfolioFeatured} setPortfolioFeatured={setPortfolioFeatured} />;
      case "factions": return <FactionsView completed={completed} content={content} studentFaction={studentFaction} setStudentFaction={setStudentFaction} grabbed={grabbedGigs} setGrabbed={setGrabbedGigs} onComplete={complete} onUncomplete={uncomplete} boards={boards} saveToBoard={saveToBoard} submissions={submissions} setSubmission={setSubmission} portfolioFeatured={portfolioFeatured} setPortfolioFeatured={setPortfolioFeatured} />;
      case "ripple": return <RippleMissions completed={completed} content={content} apiKey={apiKey} onComplete={complete} onUncomplete={uncomplete} boards={boards} saveToBoard={saveToBoard} />;
      case "teensguide": return <TeensGuide completed={completed} content={content} apiKey={apiKey} onComplete={complete} onUncomplete={uncomplete} boards={boards} saveToBoard={saveToBoard} />;
      case "lightroom": return <LightRoom completed={completed} content={content} apiKey={apiKey} onComplete={complete} onUncomplete={uncomplete} boards={boards} saveToBoard={saveToBoard} />;
      case "drops": return <DailyDrops completed={completed} content={content} onComplete={complete} onUncomplete={uncomplete} student={student} boards={boards} saveToBoard={saveToBoard} journalEntries={journalEntries} onSaveJournal={saveJournalEntry} />;
      case "portfolio": return <Portfolio student={student} completed={completed} content={content} onUncomplete={uncomplete} submissions={submissions} setSubmission={setSubmission} portfolioFeatured={portfolioFeatured} setPortfolioFeatured={setPortfolioFeatured} />;
      case "journal": return <StudentJournal journalEntries={journalEntries} content={content} onNavigate={setView} />;
      case "transcript": return <Transcript completed={completed} content={content} />;
      case "roadmap": return <Roadmap roadmap={roadmap} setRoadmap={setRoadmap} />;
      case "profile": return <MyProfile student={student} setStudent={setStudent} content={content} />;
      default: return null;
    }
  };

  const pct = Math.round((points / content.areas.reduce((a,b)=>a+(b.target||0),0)) * 100);

  return (
    <div className="app-wrap">
      <CheckInPopup
        checkIns={content.checkIns || []}
        content={content}
        seenToday={seenCheckIns}
        onSeen={markCheckInSeen}
        onNavigate={setView}
      />
      <nav className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-title">Forge</div>
          <div className="logo-badge" style={{ background: "var(--sky)", color: "#0c0c16" }}>Student</div>
          <div className="logo-role">{student.name}</div>
        </div>
        {NAV.map((item, i) => {
          if (!item) return <div key={i} className="divider" style={{ margin: "6px 20px" }} />;
          return (
            <div key={item.id} className={`nav-item ${view === item.id ? "active" : ""}`} onClick={() => setView(item.id)}>
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </div>
          );
        })}
        <div className="sidebar-footer">
          <div className="pts-label">Total Points</div>
          <div className="pts-count">{points}</div>
          <div className="pts-bar"><div className="pts-fill" style={{ width: `${pct}%` }} /></div>
          <button className="btn btn-ghost btn-sm mt-12" style={{ width: "100%", fontSize: 11 }} onClick={onSwitchRole}>Teacher Mode →</button>
        </div>
      </nav>
      <main className="main">{renderView()}</main>
    </div>
  );
}

// ─── ROLE SELECTOR ────────────────────────────────────────────────────────────

function RoleSelector({ onSelect }) {
  return (
    <div className="role-selector">
      <div style={{ textAlign: "center", maxWidth: 640, width: "100%" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 48, fontWeight: 900, color: "var(--amber)", letterSpacing: -2, marginBottom: 8 }}>Forge</div>
        <div style={{ fontSize: 14, color: "var(--muted)", marginBottom: 48 }}>Who are you today?</div>
        <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
          <div className="role-card" onClick={() => onSelect("teacher")}>
            <div style={{ fontSize: 44, marginBottom: 14 }}>🧭</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--cream)", marginBottom: 8 }}>Teacher</div>
            <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>Manage content, students, approvals, and platform settings</div>
          </div>
          <div className="role-card" onClick={() => onSelect("student")}>
            <div style={{ fontSize: 44, marginBottom: 14 }}>🔥</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--cream)", marginBottom: 8 }}>Student</div>
            <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>Explore skills, complete projects, and build your portfolio</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────

function LoadingScreen() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 48, fontWeight: 900, color: "var(--amber)", letterSpacing: -2 }}>Forge</div>
      <div style={{ fontSize: 13, color: "var(--muted)" }}>Loading…</div>
    </div>
  );
}

function TeacherPasswordModal({ onConfirm, onCancel, storedPassword }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  const check = () => {
    if (pw === storedPassword) { setErr(false); onConfirm(); }
    else { setErr(true); setPw(""); }
  };
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
      <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 20, padding: 40, width: "100%", maxWidth: 380 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: "var(--cream)", marginBottom: 6 }}>Teacher Access</div>
        <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 22 }}>Enter your teacher password to continue.</div>
        <div className="form-row">
          <input className="input" type="password" value={pw} onChange={e => { setPw(e.target.value); setErr(false); }}
            onKeyDown={e => e.key === "Enter" && check()} placeholder="Password" autoFocus />
          {err && <div style={{ fontSize: 12, color: "var(--clay)", marginTop: 6 }}>Incorrect password.</div>}
        </div>
        <div className="flex gap-10 mt-12">
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onCancel}>← Back</button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={check} disabled={!pw.trim()}>Enter →</button>
        </div>
      </div>
    </div>
  );
}

function buildDefaultPlatformDoc() {
  return {
    content: {
      areas: AREAS, skills: SKILLS, projects: PROJECTS,
      gigs: SANDBOX_GIGS_DEFAULT, ripple: RIPPLE_MISSIONS_DEFAULT,
      teensGuide: TEENS_GUIDE_DEFAULT, lightRoom: LIGHT_ROOM_DEFAULT,
      dailyDrops: DAILY_DROPS_DEFAULT, checkIns: CHECK_INS_DEFAULT,
      profileQuestions: PROFILE_QUESTIONS_DEFAULT, habitDefs: [],
    },
    studentAccounts: DEFAULT_STUDENT_ACCOUNTS,
    apiKey: "",
    teacherPassword: "forge2026",
    messages: {},
  };
}

export default function App() {
  const [appReady, setAppReady]          = useState(false);
  const [role, setRole]                  = useState(null);
  const [pendingTeacher, setPending]     = useState(false);
  const [student, setStudentLocal]       = useState(null);

  const [content, setContentLocal]       = useState(null);
  const [studentAccounts, setAcctsLocal] = useState([]);
  const [apiKey, setApiKeyLocal]         = useState("");
  const [teacherPassword, setTpwLocal]   = useState("forge2026");
  const [messages, setMsgsLocal]         = useState({});
  const [approvals, setApprovalsLocal]   = useState([]);

  // On mount: sign in anonymously and subscribe to Firestore
  useEffect(() => {
    let unsubPlatform = null;
    let unsubApprovals = null;

    signInAnonymously(auth).then(() => {
      unsubPlatform = onSnapshot(doc(db, "platform", "main"), async (snap) => {
        if (!snap.exists()) {
          await setDoc(doc(db, "platform", "main"), buildDefaultPlatformDoc());
          return;
        }
        const d = snap.data();
        // Enrich account list with live student progress
        const enriched = await Promise.all(
          (d.studentAccounts || DEFAULT_STUDENT_ACCOUNTS).map(async (acct) => {
            try {
              const s = await getDoc(doc(db, "students", acct.id));
              return s.exists() ? { ...acct, ...s.data() } : acct;
            } catch { return acct; }
          })
        );
        setContentLocal(d.content || buildDefaultPlatformDoc().content);
        setAcctsLocal(enriched);
        setApiKeyLocal(d.apiKey || "");
        setTpwLocal(d.teacherPassword || "forge2026");
        setMsgsLocal(d.messages || {});
        setAppReady(true);
      });

      unsubApprovals = onSnapshot(doc(db, "platform", "approvals"), (snap) => {
        setApprovalsLocal(snap.exists() ? (snap.data().list || []) : []);
      });
    }).catch(() => setAppReady(true));

    return () => { unsubPlatform?.(); unsubApprovals?.(); };
  }, []);

  // Firebase-backed setters
  const setContent = useCallback((updater) => {
    setContentLocal((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      setDoc(doc(db, "platform", "main"), { content: next }, { merge: true }).catch(console.error);
      return next;
    });
  }, []);

  const setStudentAccounts = useCallback((updater) => {
    setAcctsLocal((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      const lean = next.map(({ id, name, username, password, profileAnswers }) =>
        ({ id, name, username, password, profileAnswers: profileAnswers || {} })
      );
      setDoc(doc(db, "platform", "main"), { studentAccounts: lean }, { merge: true }).catch(console.error);
      return next;
    });
  }, []);

  const setApiKey = useCallback((val) => {
    setApiKeyLocal(val);
    setDoc(doc(db, "platform", "main"), { apiKey: val }, { merge: true }).catch(console.error);
  }, []);

  const setTeacherPassword = useCallback((val) => {
    setTpwLocal(val);
    setDoc(doc(db, "platform", "main"), { teacherPassword: val }, { merge: true }).catch(console.error);
  }, []);

  const setApprovals = useCallback((updater) => {
    setApprovalsLocal((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      setDoc(doc(db, "platform", "approvals"), { list: next }).catch(console.error);
      return next;
    });
  }, []);

  const setMessages = useCallback((updater) => {
    setMsgsLocal((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      setDoc(doc(db, "platform", "main"), { messages: next }, { merge: true }).catch(console.error);
      return next;
    });
  }, []);

  const handleSetStudent = useCallback((updatedOrFn) => {
    setStudentLocal((prev) => {
      const updated = typeof updatedOrFn === "function" ? updatedOrFn(prev) : updatedOrFn;
      setDoc(doc(db, "students", updated.id), updated).catch(console.error);
      setAcctsLocal((accts) => accts.map((a) => a.id === updated.id ? { ...a, ...updated } : a));
      return updated;
    });
  }, []);

  const handleStudentLogin = useCallback(async (acct) => {
    try {
      const snap = await getDoc(doc(db, "students", acct.id));
      if (snap.exists()) {
        setStudentLocal({ ...acct, ...snap.data() });
      } else {
        const init = { ...acct, points: 0, completed: [], profileAnswers: {} };
        await setDoc(doc(db, "students", acct.id), init);
        setStudentLocal(init);
      }
      setRole("student");
    } catch (err) { console.error("Login error:", err); }
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────
  if (!appReady || content === null) return (<><GlobalStyles /><LoadingScreen /></>);

  if (pendingTeacher) return (
    <><GlobalStyles />
      <TeacherPasswordModal
        storedPassword={teacherPassword}
        onConfirm={() => { setPending(false); setRole("teacher"); }}
        onCancel={() => setPending(false)}
      /></>
  );

  if (!role) return (
    <><GlobalStyles />
      <RoleSelector onSelect={(r) => { if (r === "teacher") setPending(true); else setRole(r); }} /></>
  );

  if (role === "teacher") return (
    <><GlobalStyles />
      <TeacherApp
        content={content} setContent={setContent}
        studentAccounts={studentAccounts} setStudentAccounts={setStudentAccounts}
        approvals={approvals} setApprovals={setApprovals}
        apiKey={apiKey} setApiKey={setApiKey}
        teacherPassword={teacherPassword} setTeacherPassword={setTeacherPassword}
        messages={messages} setMessages={setMessages}
        onSwitchRole={() => setRole(null)}
      /></>
  );

  if (role === "student") {
    if (!student) return (
      <><GlobalStyles />
        <StudentLogin accounts={studentAccounts} onLogin={handleStudentLogin} /></>
    );
    return (
      <><GlobalStyles />
        <StudentApp
          student={student} setStudent={handleSetStudent}
          content={content} apiKey={apiKey}
          messages={messages} setMessages={setMessages}
          onSwitchRole={() => { setStudentLocal(null); setRole(null); }}
        /></>
    );
  }

  return null;
}

