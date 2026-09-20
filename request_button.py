from pathlib import Path
p = Path('/home/ubuntu/lumin-candles-store/client/src/pages/Home.tsx')
s = p.read_text()
old = '<button className="request-submit" onClick={submitRequest}>متابعة إلى اختيار مقدم الخدمة <ArrowLeft size={17} /></button>'
new = '<button className="request-submit" onClick={submitRequest} disabled={createServiceRequest.isPending}>{createServiceRequest.isPending ? "جارٍ حفظ الطلب..." : "متابعة إلى اختيار مقدم الخدمة"} {!createServiceRequest.isPending && <ArrowLeft size={17} />}</button>'
if old not in s: raise SystemExit('request button not found')
p.write_text(s.replace(old, new, 1))
