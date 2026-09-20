from pathlib import Path
p = Path('/home/ubuntu/lumin-candles-store/client/src/index.css')
s = p.read_text()
s += '''
.wallet-header-button { align-items: center; gap: 5px; border: 1px solid #dce8de; border-radius: 999px; background: #f8fbf7; padding: 8px 11px; color: #52745a; font-size: 10px; transition: background .18s ease, color .18s ease; }
.wallet-header-button:hover { background: #edf5df; color: #315d39; }
'''
p.write_text(s)
