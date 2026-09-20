from pathlib import Path
p = Path('/home/ubuntu/lumin-candles-store/client/src/pages/Home.tsx')
s = p.read_text()
needle = '</div><div className={`contact-guard ${contactUnlocked ? "unlocked" : ""}`}>'
replacement = '<button className="wallet-settings-trigger" onClick={openWalletSettings}>إدارة Apple Pay ومدى وSTC Pay والحساب البنكي <ArrowLeft size={13} /></button></div><div className={`contact-guard ${contactUnlocked ? "unlocked" : ""}`}>'
if needle not in s: raise SystemExit('contact guard insertion point not found')
p.write_text(s.replace(needle, replacement, 1))
