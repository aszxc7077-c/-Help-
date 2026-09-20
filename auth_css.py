from pathlib import Path
p=Path('/home/ubuntu/lumin-candles-store/client/src/index.css')
s=p.read_text()
s+='''
.auth-backdrop { z-index: 90; background: rgba(8, 29, 21, .68); }
.auth-modal { width: min(480px, 100%); border-radius: 20px; background: #fbfdf9; padding: 24px; box-shadow: 0 25px 80px rgba(7,38,26,.32); }
.auth-modal-head { display:flex; justify-content:space-between; gap:16px; }
.auth-modal h2 { margin-top:5px; color:#294c36; font-size:24px; letter-spacing:-.04em; }
.auth-modal-head p { margin-top:8px; color:#718277; font-size:11px; line-height:1.8; }
.modal-close { display:grid; place-items:center; width:32px; height:32px; border-radius:50%; background:#edf4ed; color:#58715e; }
.auth-tabs { display:grid; grid-template-columns:1fr 1fr; gap:6px; margin:20px 0 14px; border-bottom:1px solid #e1ebe1; }
.auth-tabs button { padding:10px; color:#8a988d; font-size:12px; }
.auth-tabs button.active { border-bottom:2px solid #9ccf3d; color:#31583c; font-weight:700; }
.auth-form { display:grid; gap:12px; }
.auth-form label { display:grid; gap:6px; color:#42614c; font-size:11px; font-weight:700; }
.auth-form input:not([type="checkbox"]) { width:100%; border:1px solid #dce8dc; border-radius:9px; background:#fff; padding:11px 12px; color:#294c36; outline:none; font-size:12px; }
.auth-form input:focus { border-color:#a4ce58; box-shadow:0 0 0 3px rgba(164,206,88,.14); }
.private-field-label { color:#9aa99e; font-size:9px; font-weight:400; }
.auth-consent { display:flex!important; grid-template-columns:none!important; grid-auto-flow:column; justify-content:start; align-items:start; gap:8px; line-height:1.7; }
.auth-consent input { margin-top:3px; accent-color:#8fca38; }
.auth-submit { border-radius:9px; background:#294a36; padding:12px; color:#ddf46a; font-size:12px; font-weight:700; }
.auth-submit:disabled { opacity:.5; cursor:not-allowed; }
.auth-privacy-note { display:flex; align-items:center; gap:5px; margin-top:14px; color:#7b917f; font-size:9px; }
'''
p.write_text(s)
