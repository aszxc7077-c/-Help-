from pathlib import Path
p = Path('/home/ubuntu/lumin-candles-store/server/routers.ts')
s = p.read_text().replace('sdk.signSession(user.openId, { name: user.name ?? "" })', 'sdk.createSessionToken(user.openId, { name: user.name ?? "" })')
p.write_text(s)
