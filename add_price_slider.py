from pathlib import Path
p = Path('/home/ubuntu/lumin-candles-store/client/src/pages/Home.tsx')
s = p.read_text()
old = '<label><span>التقييم</span><select value={mapRatingFilter} onChange={(event) => setMapRatingFilter(event.target.value)}><option value="all">كل التقييمات</option><option value="4.8">٤٫٨ فأعلى</option><option value="4.9">٤٫٩ فأعلى</option></select></label><button className="clear-map-filters"'
new = '<label><span>التقييم</span><select value={mapRatingFilter} onChange={(event) => setMapRatingFilter(event.target.value)}><option value="all">كل التقييمات</option><option value="4.8">٤٫٨ فأعلى</option><option value="4.9">٤٫٩ فأعلى</option></select></label><label className="price-range-control"><span>السعر حتى <strong>{maxPrice} ر.س</strong></span><input type="range" min="80" max="400" step="10" value={maxPrice} onChange={(event) => setMaxPrice(Number(event.target.value))} /></label><button className="clear-map-filters"'
if old not in s: raise SystemExit('price slider marker not found')
s = s.replace(old, new, 1)
s = s.replace('setMapServiceFilter("all"); setMapRatingFilter("all");', 'setMapServiceFilter("all"); setMapRatingFilter("all"); setMaxPrice(400);', 1)
p.write_text(s)
css = Path('/home/ubuntu/lumin-candles-store/client/src/index.css')
s = css.read_text()
s += '''\n.price-range-control { min-width: 125px !important; }.price-range-control span { display: flex; justify-content: space-between; gap: 5px; white-space: nowrap; }.price-range-control strong { color: #5b8749; font-family: 'Manrope', sans-serif; font-size: 9px; }.price-range-control input { width: 100%; height: 4px; margin-top: 7px; accent-color: #7ca65b; cursor: pointer; }\n@media (max-width: 640px) { .price-range-control { min-width: 100px !important; } }\n'''
css.write_text(s)
