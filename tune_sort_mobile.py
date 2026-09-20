from pathlib import Path
p = Path('/home/ubuntu/lumin-candles-store/client/src/index.css')
s = p.read_text()
s += '\n@media (max-width: 640px) { .map-sort-buttons { flex-wrap: wrap; justify-content: flex-end; max-width: 210px; } }\n'
p.write_text(s)
