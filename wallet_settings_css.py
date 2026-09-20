from pathlib import Path
p = Path('/home/ubuntu/lumin-candles-store/client/src/index.css')
s = p.read_text()
s += '''
.wallet-balance-line { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 10px; border-radius: 8px; background: rgba(255,255,255,.55); padding: 7px 9px; color: #789176; font-size: 9px; }
.wallet-balance-line strong { color: #3f6739; font-size: 11px; }
.wallet-settings-trigger { display: inline-flex; width: 100%; align-items: center; justify-content: center; gap: 5px; margin-top: 9px; border-top: 1px solid rgba(132,171,99,.22); padding-top: 10px; color: #688c58; font-size: 9px; }
.wallet-settings-trigger:hover { color: #315d39; }
.wallet-settings-modal { width: min(760px, 100%); max-height: min(88vh, 700px); overflow-y: auto; border-radius: 22px; background: #f8fbf7; padding: 25px; box-shadow: 0 25px 70px rgba(18,49,36,.25); }
.wallet-settings-note { margin: 10px 0 18px; color: #74867b; font-size: 11px; line-height: 1.8; }
.wallet-settings-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
.wallet-settings-form { display: flex; flex-direction: column; gap: 10px; border: 1px solid #dce8de; border-radius: 14px; background: white; padding: 15px; }
.wallet-form-heading { display: flex; align-items: center; gap: 7px; margin-bottom: 2px; color: #385c42; }
.wallet-form-heading strong { font-size: 13px; }
.wallet-settings-form label { display: flex; flex-direction: column; gap: 5px; color: #708176; font-size: 10px; }
.wallet-settings-form input, .wallet-settings-form select { width: 100%; border: 1px solid #d9e5dc; border-radius: 8px; background: #f9fcf9; padding: 9px 10px; color: #385346; font: inherit; font-size: 11px; outline: none; }
.wallet-settings-form input:focus, .wallet-settings-form select:focus { border-color: #92b870; box-shadow: 0 0 0 3px rgba(146,184,112,.14); }
.wallet-form-button { border-radius: 8px; background: #294a36; padding: 10px; color: #ddf46a; font-size: 10px; font-weight: 700; }
.wallet-form-button:disabled { cursor: not-allowed; opacity: .55; }
.saved-wallet-items { display: flex; flex-direction: column; gap: 5px; color: #6b8670; font-size: 9px; }
.saved-wallet-items span { display: flex; align-items: center; gap: 4px; border-radius: 7px; background: #f0f7ee; padding: 6px 7px; }
.wallet-settings-footnote { display: flex; align-items: center; gap: 5px; margin-top: 15px; color: #8c9d91; font-size: 9px; line-height: 1.7; }
@media (max-width: 640px) { .wallet-settings-modal { padding: 19px; border-radius: 19px 19px 0 0; }.wallet-settings-grid { grid-template-columns: 1fr; } }
'''
p.write_text(s)
