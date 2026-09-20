from pathlib import Path
p = Path('/home/ubuntu/lumin-candles-store/client/src/pages/Home.tsx')
s = p.read_text()
old = '<div className="contract-tags"><span>{contractTerm === "short" ? "استجابة سريعة" : "دخل متكرر"}</span><span>{contractTerm === "short" ? "تسعير لكل مهمة" : "اتفاقية خدمة"}</span><span>تغطية المملكة</span></div></div><button className="dark-button"'
new = '<div className="contract-tags"><span>{contractTerm === "short" ? "استجابة سريعة" : "دخل متكرر"}</span><span>{contractTerm === "short" ? "تسعير لكل مهمة" : "اتفاقية خدمة"}</span><span>تغطية المملكة</span></div><div className="contract-details"><div><Clock3 size={13} /><small>المدة</small><strong>{contractDetails.duration}</strong></div><div><MapPin size={13} /><small>التغطية</small><strong>{contractDetails.coverage}</strong></div><div><Banknote size={13} /><small>القيمة التقديرية</small><strong>{contractDetails.value}</strong></div><div><Percent size={13} /><small>نسبة نجدة Help</small><strong>{contractDetails.commission}</strong></div></div></div><button className="dark-button"'
if old not in s: raise SystemExit('contract details marker not found')
p.write_text(s.replace(old, new, 1))
css = Path('/home/ubuntu/lumin-candles-store/client/src/index.css')
s = css.read_text()
s += '''\n.contract-details { display: grid; grid-template-columns: repeat(3, 1fr); gap: 7px; margin-top: 13px; border-top: 1px solid #e4ece3; padding-top: 12px; }.contract-details div { min-width: 0; }.contract-details svg { color: #7ca65b; }.contract-details small, .contract-details strong { display: block; }.contract-details small { margin-top: 4px; color: #9aa9a0; font-size: 8px; }.contract-details strong { margin-top: 3px; color: #4b6653; font-size: 9px; line-height: 1.5; }\n@media (max-width: 640px) { .contract-details { grid-template-columns: 1fr; gap: 9px; }.contract-details div { display: grid; grid-template-columns: auto 1fr; column-gap: 6px; align-items: center; }.contract-details small { margin-top: 0; }.contract-details strong { grid-column: 2; } }\n'''
css.write_text(s.replace('grid-template-columns: repeat(3, 1fr)', 'grid-template-columns: repeat(4, 1fr)'))
