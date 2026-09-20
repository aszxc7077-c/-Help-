from pathlib import Path
p = Path('/home/ubuntu/lumin-candles-store/client/src/pages/Home.tsx')
s = p.read_text()
old = '<button className={mapSort === "rating" ? "active" : ""} onClick={() => setMapSort("rating")}><Star size={12} /> الأعلى تقييمًا</button></div><span className="map-city">'
new = '<button className={mapSort === "rating" ? "active" : ""} onClick={() => setMapSort("rating")}><Star size={12} /> الأعلى تقييمًا</button><button className={mapSort === "price" ? "active" : ""} onClick={() => setMapSort("price")}><Banknote size={12} /> الأقل سعرًا</button><button className={mapSort === "eta" ? "active" : ""} onClick={() => setMapSort("eta")}><Clock3 size={12} /> الأسرع وصولًا</button></div><span className="map-city">'
if old not in s: raise SystemExit('sort button marker not found')
p.write_text(s.replace(old, new, 1))
