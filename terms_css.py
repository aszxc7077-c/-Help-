from pathlib import Path
p = Path('/home/ubuntu/lumin-candles-store/client/src/index.css')
s = p.read_text()
s += '''
.terms-backdrop { z-index: 80; background: rgba(8, 29, 21, .72); }
.terms-modal { width: min(590px, 100%); border-radius: 20px; background: #fbfdf9; padding: 25px; box-shadow: 0 25px 80px rgba(7,38,26,.32); }
.terms-modal-top { display: flex; align-items: flex-start; gap: 12px; }
.terms-seal { display: grid; place-items: center; flex: 0 0 auto; width: 40px; height: 40px; border-radius: 12px; background: #edf6df; color: #6a9d47; }
.terms-modal h2 { margin-top: 4px; color: #294c36; font-size: 24px; letter-spacing: -.04em; }
.terms-copy { display: grid; gap: 10px; margin: 20px 0; border-top: 1px solid #e2ece2; border-bottom: 1px solid #e2ece2; padding: 16px 0; color: #64786a; font-size: 12px; line-height: 2; }
.terms-copy p { margin: 0; }
.terms-check-row { display: flex; align-items: flex-start; gap: 9px; color: #395945; cursor: pointer; font-size: 12px; font-weight: 700; line-height: 1.8; }
.terms-check-row input { width: 17px; height: 17px; margin-top: 2px; accent-color: #8fca38; }
.terms-accept-button { width: 100%; margin-top: 18px; border-radius: 9px; background: #294a36; padding: 12px; color: #ddf46a; font-size: 12px; font-weight: 700; }
.terms-accept-button:disabled { cursor: not-allowed; opacity: .45; }
.terms-version { display: block; margin-top: 10px; color: #8d9e91; font-size: 9px; line-height: 1.6; }
'''
p.write_text(s)
