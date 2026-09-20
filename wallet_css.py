from pathlib import Path
p = Path('/home/ubuntu/lumin-candles-store/client/src/index.css')
s = p.read_text()
s += '''

.wallet-escrow-card { margin-top: 14px; border: 1px solid #d6e6c8; border-radius: 15px; background: linear-gradient(135deg, #f7fbf0, #eef7e5); padding: 14px; color: #45604b; }
.wallet-escrow-card.wallet-held { border-color: #b8d986; background: linear-gradient(135deg, #f5fbe9, #e8f3d5); }
.wallet-escrow-card.wallet-released { border-color: #b8dacf; background: linear-gradient(135deg, #f1faf3, #e3f2e7); }
.wallet-card-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; color: #547840; }
.wallet-card-head > div { display: flex; flex-direction: column; gap: 3px; }
.wallet-card-head strong { color: #294b32; font-size: 13px; }
.wallet-card-head > svg { margin-top: 4px; color: #77a44c; }
.wallet-breakdown { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 12px; border-top: 1px solid rgba(132,171,99,.22); padding-top: 10px; }
.wallet-breakdown span { display: flex; flex-direction: column; gap: 3px; }
.wallet-breakdown small { color: #88a187; font-size: 9px; }
.wallet-breakdown strong { color: #48633d; font-size: 12px; }
.wallet-escrow-card > p { margin: 11px 0 0; color: #769078; font-size: 10px; line-height: 1.7; }
.wallet-escrow-card > button { margin-top: 11px; width: 100%; border-radius: 9px; background: #294a36; padding: 9px 12px; color: #ddf46a; font-size: 10px; font-weight: 700; transition: background .18s ease, transform .18s ease; }
.wallet-escrow-card > button:hover:not(:disabled) { background: #1c3928; }
.wallet-escrow-card > button:active:not(:disabled) { transform: scale(.98); }
.wallet-escrow-card > button:disabled { cursor: not-allowed; opacity: .5; }
.wallet-success-note { display: flex; align-items: center; gap: 5px; color: #4e885c !important; font-weight: 700; }
@media (max-width: 520px) { .wallet-breakdown { gap: 5px; }.wallet-breakdown small { font-size: 8px; }.wallet-breakdown strong { font-size: 10px; } }
'''
p.write_text(s)
