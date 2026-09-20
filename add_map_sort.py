from pathlib import Path
p = Path('/home/ubuntu/lumin-candles-store/client/src/pages/Home.tsx')
s = p.read_text()
old = '<span className="map-city">الرياض، السعودية</span></div><div className="map-filters">'
new = '<div className="map-toolbar-actions"><div className="map-sort-buttons"><button className={mapSort === "distance" ? "active" : ""} onClick={() => setMapSort("distance")}><Navigation size={12} /> الأقرب</button><button className={mapSort === "rating" ? "active" : ""} onClick={() => setMapSort("rating")}><Star size={12} /> الأعلى تقييمًا</button></div><span className="map-city">الرياض، السعودية</span></div></div><div className="map-filters">'
if old not in s: raise SystemExit('map toolbar marker not found')
s = s.replace(old, new, 1)
p.write_text(s)
css = Path('/home/ubuntu/lumin-candles-store/client/src/index.css')
s = css.read_text()
s += '''\n.map-toolbar-actions { display: flex; align-items: center; gap: 10px; }.map-sort-buttons { display: flex; gap: 4px; }.map-sort-buttons button { display: inline-flex; align-items: center; gap: 4px; border: 1px solid transparent; border-radius: 999px; padding: 5px 7px; color: #8b9b91; font-size: 8px; transition: all .18s; }.map-sort-buttons button:hover { border-color: #c8dcca; color: #4d6c56; }.map-sort-buttons button.active { border-color: #b5d187; background: #e9f5d5; color: #547940; font-weight: 700; }.map-sort-buttons button svg { stroke-width: 2; }\n@media (max-width: 640px) { .map-toolbar { align-items: flex-start; gap: 6px; }.map-toolbar-actions { flex-direction: column-reverse; align-items: flex-end; gap: 3px; }.map-sort-buttons button { padding-inline: 5px; font-size: 7px; } }\n'''
css.write_text(s)
