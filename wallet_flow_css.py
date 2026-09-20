from pathlib import Path
p = Path('/home/ubuntu/lumin-candles-store/client/src/index.css')
s = p.read_text()
s += '''
.wallet-flow-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-top: 14px; }
.wallet-flow-card { border: 1px solid #dce8de; border-radius: 12px; background: #fff; padding: 12px; }
.wallet-flow-card p { min-height: 34px; margin: 7px 0 10px; color: #87968d; font-size: 9px; line-height: 1.7; }
.wallet-flow-row { display: flex; align-items: center; gap: 5px; }
.wallet-flow-row input { min-width: 0; flex: 1; border: 1px solid #d9e5dc; border-radius: 7px; background: #f9fcf9; padding: 8px; color: #385346; font-size: 10px; }
.wallet-flow-row > span { color: #819285; font-size: 9px; }
.wallet-flow-row button { flex: 0 0 auto; border-radius: 7px; background: #edf5df; padding: 8px 10px; color: #4e713f; font-size: 9px; font-weight: 700; }
.wallet-flow-row button:hover:not(:disabled) { background: #dff0bf; }
.wallet-flow-row button:disabled { cursor: not-allowed; opacity: .5; }
@media (max-width: 640px) { .wallet-flow-grid { grid-template-columns: 1fr; } }
'''
p.write_text(s)
