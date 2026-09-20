from pathlib import Path
p = Path('/home/ubuntu/lumin-candles-store/client/src/pages/Home.tsx')
s = p.read_text()
s = s.replace('<span><strong>نجدة</strong><small>NAJDA</small></span></button><p className="mt-5 max-w-[240px] text-sm leading-7 text-[#9eb1a8]">منصة المساعدة على الطريق', '<span><strong>نجدة <b>Help</b></strong><small>NAJDA HELP</small></span></button><p className="mt-5 max-w-[240px] text-sm leading-7 text-[#9eb1a8]">نجدة Help — منصة المساعدة على الطريق', 1)
p.write_text(s)
css = Path('/home/ubuntu/lumin-candles-store/client/src/index.css')
s = css.read_text()
s += '\n.najda-logo strong b { color: #769d48; font-family: \'Manrope\', sans-serif; font-size: .78em; font-weight: 800; letter-spacing: -.04em; }\n.footer-logo strong b { color: var(--lime); }\n'
css.write_text(s)
html = Path('/home/ubuntu/lumin-candles-store/client/index.html')
s = html.read_text().replace('نجدة — منصة المساعدة على الطريق، توصلك بأقرب مقدم خدمة موثوق.', 'نجدة Help — منصة المساعدة على الطريق، توصلك بأقرب مقدم خدمة موثوق.').replace('نجدة | المساعدة على الطريق', 'نجدة Help | المساعدة على الطريق')
html.write_text(s)
