from pathlib import Path
p = Path('/home/ubuntu/lumin-candles-store/client/src/pages/Home.tsx')
s = p.read_text()
old = '</div><div className="tracking-progress"><div><span>انطلق مقدم الخدمة</span>'
new = '''</div><div className={`contact-guard ${contactUnlocked ? "unlocked" : ""}`}>{contactUnlocked ? <><div className="guard-icon"><Check size={17} /></div><div><strong>تم فتح بيانات التواصل</strong><span>الهاتف والموقع الدقيق متاحان للطرفين بعد تسجيل الاتفاق.</span></div></> : <><div className="guard-icon"><ShieldCheck size={17} /></div><div><strong>بيانات التواصل والموقع محمية</strong><span>تظهر المنطقة التقريبية فقط حتى يتفق الطرفان على الطلب.</span></div><button onClick={requestContactUnlock}>تسجيل الاتفاق</button></>}</div><div className="tracking-progress"><div><span>انطلق مقدم الخدمة</span>'''
if old not in s: raise SystemExit('contact guard marker not found')
p.write_text(s.replace(old, new, 1))
css = Path('/home/ubuntu/lumin-candles-store/client/src/index.css')
s = css.read_text()
s += '''\n.contact-guard { display: flex; align-items: center; gap: 9px; margin: 0 25px 15px; border: 1px solid #d8e7ce; border-radius: 11px; background: #f0f8e8; padding: 10px; color: #547340; }.guard-icon { display: flex; height: 30px; width: 30px; flex: 0 0 auto; align-items: center; justify-content: center; border-radius: 9px; background: #dff0c6; color: #6e9b4d; }.contact-guard > div:nth-child(2) { flex: 1; }.contact-guard strong, .contact-guard span { display: block; }.contact-guard strong { font-size: 10px; }.contact-guard span { margin-top: 3px; color: #78906f; font-size: 8px; line-height: 1.6; }.contact-guard button { flex: 0 0 auto; border-radius: 999px; background: #668f4c; padding: 7px 9px; color: white; font-size: 8px; }.contact-guard button:hover { background: #4d783e; }.contact-guard.unlocked { border-color: #cce0da; background: #edf7f4; color: #3e7460; }.contact-guard.unlocked .guard-icon { background: #d9efe7; color: #4d9774; }\n@media (max-width: 640px) { .contact-guard { margin-inline: 20px; align-items: flex-start; } .contact-guard button { margin-top: 2px; } }\n'''
css.write_text(s)
