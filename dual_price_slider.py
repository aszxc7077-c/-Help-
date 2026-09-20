from pathlib import Path
p = Path('/home/ubuntu/lumin-candles-store/client/src/pages/Home.tsx')
s = p.read_text()
old = '<label className="price-range-control"><span>السعر حتى <strong>{maxPrice} ر.س</strong></span><input type="range" min="80" max="400" step="10" value={maxPrice} onChange={(event) => setMaxPrice(Number(event.target.value))} /></label>'
new = '<label className="price-range-control"><span>النطاق السعري <strong>{minPrice}–{maxPrice} ر.س</strong></span><div className="dual-range"><span className="range-fill" style={{ right: `${((minPrice - 80) / 320) * 100}%`, left: `${100 - ((maxPrice - 80) / 320) * 100}%` }} /><input type="range" min="80" max="400" step="10" value={minPrice} onChange={(event) => setMinPrice(Math.min(Number(event.target.value), maxPrice - 10))} aria-label="الحد الأدنى للسعر" /><input type="range" min="80" max="400" step="10" value={maxPrice} onChange={(event) => setMaxPrice(Math.max(Number(event.target.value), minPrice + 10))} aria-label="الحد الأعلى للسعر" /></div></label>'
if old not in s: raise SystemExit('single slider marker not found')
s = s.replace(old, new, 1)
s = s.replace('setMapServiceFilter("all"); setMapRatingFilter("all"); setMaxPrice(400);', 'setMapServiceFilter("all"); setMapRatingFilter("all"); setMinPrice(80); setMaxPrice(400);', 1)
p.write_text(s)
css = Path('/home/ubuntu/lumin-candles-store/client/src/index.css')
s = css.read_text()
s += '''\n.dual-range { position: relative; height: 18px; margin-top: 5px; }.dual-range::before { position: absolute; top: 7px; right: 0; left: 0; height: 4px; border-radius: 999px; background: #dbe7d9; content: ''; }.dual-range .range-fill { position: absolute; top: 7px; z-index: 1; height: 4px; border-radius: 999px; background: #7ca65b; }.dual-range input { position: absolute; inset: 0; z-index: 2; width: 100%; height: 18px; margin: 0; appearance: none; background: transparent; pointer-events: none; }.dual-range input::-webkit-slider-thumb { height: 13px; width: 13px; appearance: none; border: 2px solid white; border-radius: 999px; background: #618f4f; box-shadow: 0 1px 4px rgba(35,70,38,.28); cursor: grab; pointer-events: auto; }.dual-range input::-moz-range-thumb { height: 10px; width: 10px; border: 2px solid white; border-radius: 999px; background: #618f4f; box-shadow: 0 1px 4px rgba(35,70,38,.28); cursor: grab; pointer-events: auto; }.dual-range input:focus-visible::-webkit-slider-thumb { outline: 2px solid #b7d88c; outline-offset: 2px; }\n'''
css.write_text(s)
