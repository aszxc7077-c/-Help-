from pathlib import Path
p = Path('/home/ubuntu/lumin-candles-store/client/src/pages/Home.tsx')
s = p.read_text()
s = s.replace('نجدة تبحث عن مقدمي الخدمة حولك...', 'نجدة تبحث عن مقدمي الخدمة حولك... <strong className="live-provider-count">{availableCount}</strong> متاح الآن', 1)
p.write_text(s)
css = Path('/home/ubuntu/lumin-candles-store/client/src/index.css')
s = css.read_text()
s += '\n.live-provider-count { display: inline-flex; min-width: 19px; align-items: center; justify-content: center; border-radius: 999px; background: #e1f4b4; padding: 2px 5px; color: #4e7d3b; font-family: \'Manrope\', sans-serif; font-size: 11px; }\n'
css.write_text(s)
