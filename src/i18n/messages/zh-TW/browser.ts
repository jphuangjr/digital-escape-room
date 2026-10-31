import type en from "../en/browser";

const messages: Record<keyof typeof en, string> = {
  // Browser chrome
  "browser.toolbar.back": "上一頁",
  "browser.toolbar.forward": "下一頁",
  "browser.toolbar.address": "網址",
  "browser.toolbar.addressPlaceholder": "輸入網址",
  "browser.toolbar.reload": "重新載入",
  "browser.toolbar.loading": "載入中…",
  "browser.toolbar.viewSource": "檢視原始碼",
  "browser.loading.connecting": "正在連線到 {address}…",
  "browser.error.title": "無法連上這個網站",
  "browser.error.unreachable": "找不到 <addr>{address}</addr> 的伺服器 IP 位址。",
  "browser.error.timeout": "<addr>{address}</addr> 回應時間過長。",
  "browser.history.button": "瀏覽紀錄{count, plural, =0 {} other {，# 個新網站}}",
  "browser.history.title": "瀏覽紀錄",
  "browser.history.shared": "與隊友共用。任何人找到新網站，都會出現在這裡。",
  "browser.history.new": "新",
  "browser.history.foundBy": "{isMe, select, true {你} other {{name}}}找到 · {when}",
  "browser.history.start": "從這裡開始",
  "browser.newTab.title": "新分頁",

  // View Source
  "browser.source.dialog": "網頁原始碼",

  // Site renderer chrome
  "browser.fileInfo.button": "ⓘ 檔案資訊",
  "browser.fileInfo.title": "檔案資訊",
  "browser.fileInfo.close": "關閉檔案資訊",
  "browser.fileInfo.filename": "檔名",
  "browser.fileInfo.author": "作者",
  "browser.fileInfo.camera": "相機",
  "browser.fileInfo.date": "日期",
  "browser.fileInfo.dimensions": "尺寸",
  "browser.fileInfo.comment": "註解",
  "browser.redacted.hidden": "已塗黑的文字，點一下即可顯示。",
  "browser.redacted.revealed": "已顯示：{text}",

  // In-site forms: game-system feedback only (site labels stay English)
  "browser.form.connectionError": "連線錯誤，請再試一次。",
  "browser.form.accepted": "已通過。",
  "browser.form.correct": "答對了！",
  "browser.form.rejected": "被拒絕了，答案不是這個。",
  "browser.form.decreaseShift": "減少位移",
  "browser.form.increaseShift": "增加位移",
  "browser.form.shiftSolved": "✓ 已為整個房間解碼刊登內容。",
  "browser.form.lockNote": "注意：輸入錯誤的金鑰，所有人的系統都會鎖定 1 分鐘。請先解出來。",
  "browser.form.binaryPassed": "✓ 通過了。請開啟解碼器，找找二進位分頁。",
};

export default messages;
