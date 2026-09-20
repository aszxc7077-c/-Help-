from pathlib import Path
s = Path('/home/ubuntu/lumin-candles-store/client/src/pages/Home.tsx').read_text()
start = s.index('wallet-escrow-card')
print(s[start:start+1800])
