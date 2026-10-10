import type en from "../en/shell";

const messages: Record<keyof typeof en, string> = {
  "shell.app.browser": "瀏覽器",
  "shell.app.notes": "筆記",
  "shell.app.email": "電子郵件",
  "shell.app.files": "檔案",
  "shell.app.decoder": "解碼器",
  "shell.dock.label": "工具列",
  "shell.dock.appAria": "{app}{locked, select, true {（已鎖定）} other {}}{unread, plural, =0 {} other {，# 則未讀}}",
  "shell.dock.room": "房間",
  "shell.dock.roomAria": "房間：{online} 人在線{unread, plural, =0 {} other {，# 則未讀訊息}}",
  "shell.desktop.label": "桌面",
  "shell.window.close": "關閉視窗",
  "shell.home.title": "主畫面",
  "shell.status.homeAria": "主畫面",
  "shell.status.laptop": "艾達的筆電",
  "shell.status.phase": "{status, select, voting {投票進行中} finished {案件已結案} other {調查進行中}}",
  "shell.status.roomAria": "房間資訊，{online} 人在線",
  "shell.status.unreadAria": "{count, plural, other {# 則未讀訊息}}",
  "shell.toast.decoderLocked": "解碼器尚未解鎖。請繼續在各個網站中挖掘線索。",
  "shell.toast.decoderUnlocked": "解碼器已解鎖！請在工具列中找到它。",
  "shell.toast.open": "開啟",
  "shell.toast.reply": "回覆",
  "shell.toast.newEmail": "{kind, select, voicemail {新語音留言：{subject}} other {新電子郵件：{subject}}}",
};

export default messages;
