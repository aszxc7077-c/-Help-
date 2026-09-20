from pathlib import Path
p=Path('/home/ubuntu/lumin-candles-store/client/src/index.css')
s=p.read_text()
s+='''
.provider-modal { max-width:560px; }
.provider-form { display:grid; gap:11px; margin-top:12px; }
.provider-form label { display:grid; gap:5px; color:#49634d; font-size:11px; font-weight:700; }
.provider-form label span { color:#8a9a8c; font-weight:400; }
.provider-form input, .provider-form select { width:100%; border:1px solid #dce8dc; border-radius:8px; background:#fff; padding:9px; color:#365b3e; font-size:12px; outline:none; }
.provider-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
@media (max-width:560px) { .provider-form-grid { grid-template-columns:1fr; } }
'''
p.write_text(s)
