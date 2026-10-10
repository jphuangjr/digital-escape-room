import type en from "../en/browser";

const messages: Record<keyof typeof en, string> = {
  // Browser chrome
  "browser.toolbar.back": "上一頁",
  "browser.toolbar.forward": "下一頁",
  "browser.toolbar.address": "網址",
  "browser.toolbar.addressPlaceholder": "輸入網址",
  "browser.toolbar.reload": "重新載入",
  "browser.toolbar.menu": "書籤與工具",
  "browser.toolbar.loading": "載入中…",
  "browser.toolbar.bookmark": "加入書籤",
  "browser.toolbar.bookmarked": "已加入書籤",
  "browser.toolbar.bookmarkRemoved": "已移除書籤",
  "browser.toolbar.viewSource": "檢視原始碼",
  "browser.menu.bookmarks": "書籤",
  "browser.menu.removeBookmark": "移除書籤「{title}」",
  "browser.menu.empty": "還沒有書籤。",
  "browser.menu.bookmarkThisPage": "將此頁加入書籤",
  "browser.loading.connecting": "正在連線到 {address}…",
  "browser.error.title": "無法連上這個網站",
  "browser.error.unreachable": "找不到 <addr>{address}</addr> 的伺服器 IP 位址。",
  "browser.error.timeout": "<addr>{address}</addr> 回應時間過長。",
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
  "browser.form.cooling": "嘗試次數過多，系統冷卻中。",
  "browser.form.connectionError": "連線錯誤，請再試一次。",
  "browser.form.accepted": "已通過。",
  "browser.form.correct": "答對了！",
  "browser.form.rejected": "被拒絕了，答案不是這個。",
  "browser.form.retryIn": "請於 {s} 秒後再試。",
  "browser.form.previewFailed": "預覽失敗",
  "browser.form.decreaseShift": "減少位移",
  "browser.form.increaseShift": "增加位移",
  "browser.form.shiftSolved": "✓ 已為整個房間解碼刊登內容。",
  "browser.form.previewLabel": "預覽 · 位移 {n}（只有你看得到）",
  "browser.form.binaryPassed": "✓ 通過了。請開啟解碼器，找找二進位分頁。",
};

export default messages;
