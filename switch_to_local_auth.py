from pathlib import Path
p = Path('/home/ubuntu/lumin-candles-store/client/src/pages/Home.tsx')
s = p.read_text().replace('import { startLogin } from "@/const";\n', '').replace('startLogin()', 'openAuthModal("login")')
p.write_text(s)
