from pathlib import Path
p = Path('/home/ubuntu/lumin-candles-store/client/src/index.css')
s = p.read_text()
s += '''

.notification-shell { position: relative; z-index: 45; }
.notification-button { position: relative; display: inline-flex; height: 38px; width: 38px; align-items: center; justify-content: center; border: 1px solid #cfdbd3; border-radius: 999px; color: #52625a; transition: all .18s ease; }
.notification-button:hover, .notification-button[aria-expanded="true"] { border-color: var(--navy); background: #e9efea; color: var(--navy); }
.notification-badge { position: absolute; top: -4px; left: -4px; display: flex; min-height: 17px; min-width: 17px; align-items: center; justify-content: center; border: 2px solid #f6f8f6; border-radius: 999px; background: #d4f250; color: #143225; font-size: 9px; font-weight: 800; line-height: 1; }
.notification-panel { position: absolute; top: calc(100% + 12px); left: 0; width: 360px; overflow: hidden; border: 1px solid #d8e5db; border-radius: 17px; background: rgba(250,252,249,.98); box-shadow: 0 18px 45px rgba(18,49,36,.16); direction: rtl; text-align: right; animation: notification-pop .18s ease-out both; }
.notification-panel-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; border-bottom: 1px solid #e2ece4; padding: 15px 16px 12px; }
.notification-panel-head > div { display: flex; flex-direction: column; gap: 3px; }
.notification-panel-head strong { color: var(--navy); font-size: 16px; }
.notification-panel-head button { color: #6e8c70; font-size: 10px; white-space: nowrap; }
.notification-panel-head button:hover:not(:disabled) { color: #203d2e; text-decoration: underline; }
.notification-panel-head button:disabled { cursor: not-allowed; opacity: .45; }
.notification-list { max-height: 355px; overflow-y: auto; padding: 6px; }
.notification-item { position: relative; display: flex; width: 100%; align-items: flex-start; gap: 10px; border-radius: 12px; padding: 11px 10px; text-align: right; transition: background .18s ease; }
.notification-item:hover { background: #edf5ec; }
.notification-item.is-read { opacity: .68; }
.notification-icon { display: flex; height: 30px; width: 30px; flex: 0 0 auto; align-items: center; justify-content: center; border-radius: 10px; background: #e3f2c4; color: #4e743f; }
.notification-payment { background: #f8edcf; color: #a07320; }
.notification-message { background: #e0eef5; color: #39718a; }
.notification-contract { background: #ece4f4; color: #6e4c89; }
.notification-system { background: #e7ece9; color: #61746a; }
.notification-copy { display: flex; min-width: 0; flex: 1; flex-direction: column; gap: 3px; }
.notification-copy strong { color: #284436; font-size: 12px; }
.notification-copy > span { color: #718178; font-size: 10px; line-height: 1.7; }
.notification-copy small { color: #a1afa6; font-size: 9px; }
.notification-unread-dot { height: 6px; width: 6px; flex: 0 0 auto; margin-top: 7px; border-radius: 999px; background: #a7d83e; box-shadow: 0 0 0 3px rgba(167,216,62,.14); }
.notification-empty { padding: 35px 15px; color: #829189; font-size: 11px; text-align: center; }
@keyframes notification-pop { from { opacity: 0; transform: translateY(-5px) scale(.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
@media (max-width: 640px) { .notification-panel { position: fixed; top: 68px; left: 16px; width: min(360px, calc(100vw - 32px)); } }
'''
p.write_text(s)
