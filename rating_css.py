from pathlib import Path
p=Path('/home/ubuntu/lumin-candles-store/client/src/index.css')
s=p.read_text()
s+='''
.rating-card { margin-top:14px; border:1px solid #e0eadc; border-radius:13px; background:#f7fbf3; padding:13px; }
.rating-card-head { display:flex; align-items:flex-start; justify-content:space-between; gap:10px; color:#87aa43; }
.rating-card-head strong { display:block; margin-top:4px; color:#365b3e; font-size:12px; }
.rating-stars { display:flex; gap:2px; margin:12px 0 9px; direction:rtl; }
.rating-stars button { color:#c9d3c9; transition:color .15s ease, transform .15s ease; }
.rating-stars button:hover, .rating-stars button.selected { color:#e2b93d; transform:scale(1.08); }
.rating-card textarea { width:100%; min-height:58px; resize:vertical; border:1px solid #dce8dc; border-radius:8px; background:#fff; padding:9px; color:#365b3e; font-size:11px; outline:none; }
.rating-submit { width:100%; margin-top:9px; border-radius:8px; background:#31583d; padding:9px; color:#e4f47a; font-size:11px; font-weight:700; }
.rating-submit:disabled { opacity:.5; }
.rating-thanks { display:flex; align-items:center; gap:6px; margin-top:12px; color:#568557; font-size:11px; }
'''
p.write_text(s)
