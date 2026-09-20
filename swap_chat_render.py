from pathlib import Path
p = Path('/home/ubuntu/lumin-candles-store/client/src/pages/Home.tsx')
s = p.read_text()
s = s.replace('chatMessages.length > 2 && <span className="chat-badge">{chatMessages.length - 2}</span>', 'chatDisplayMessages.length > 2 && <span className="chat-badge">{chatDisplayMessages.length - 2}</span>')
s = s.replace('{chatMessages.map((message, index) =>', '{chatDisplayMessages.map((message, index) =>')
s = s.replace('{index === chatMessages.length - 1 ? "الآن" : "منذ لحظات"}', '{index === chatDisplayMessages.length - 1 ? "الآن" : "منذ لحظات"}')
p.write_text(s)
