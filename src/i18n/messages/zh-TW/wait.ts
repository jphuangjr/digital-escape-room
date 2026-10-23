import type en from "../en/wait";

const messages: Record<keyof typeof en, string> = {
  "wait.tips.label": "等待的時候",
  "wait.tips.gathering": "在等隊友嗎？分享下方的代碼或 QR 碼。",

  "wait.ada.boot1": "開機自我檢測……正常",
  "wait.ada.boot2": "正在掛載 /home/ada……正常",
  "wait.ada.boot3": "正在還原上次的工作階段……",
  "wait.ada.tip1": "大家看到的是同一台筆電。分頭進行：一個人讀電子郵件，另一個人翻檔案。",
  "wait.ada.tip2": "只要有一個人解鎖了什麼，整個房間會同時打開。",
  "wait.ada.tip3": "慢慢讀。名字、日期和奇怪的措辭，往往之後會派上用場。",
  "wait.ada.tip4": "筆記在分享之前只有你看得到。有好發現就傳到房間裡。",
  "wait.ada.tip5": "卡關了嗎？從「房間」向艾達索取提示，會以語音留言送給每個人。",

  "wait.train.departures": "出發",
  "wait.train.platform": "第 {n} 月台",
  "wait.train.status": "正在登車",
  "wait.train.tip1": "每人負責一面牆，把看到的東西說出來。每個房間有四面牆。",
  "wait.train.tip2": "任何人撿起的東西都會與全隊共享。",
  "wait.train.tip3": "試著把物品互相搭配。兩件普通的東西也許能湊成有用的東西。",
  "wait.train.tip4": "連續錯三次，鎖會卡住一分鐘，所以先看看大家試過什麼。",
  "wait.train.tip5": "卡關了嗎？按鈴找泰奧多爾。夜間服務員的紙條一張比一張清楚。",

  "wait.atlas.tip1": "大家不必待在一起。分頭探索，再到聊天室回報。",
  "wait.atlas.tip2": "讀過的內容都會抄進你的筆記本，不必走回去也能再看一次線索。",
  "wait.atlas.tip3": "任何人找到的東西都會與全隊共享。",
  "wait.atlas.tip4": "連續錯三次，鎖會卡住一分鐘，所以先看看大家試過什麼。",
  "wait.atlas.tip5": "卡關了嗎？製圖師的手記會幫你解開所在地點的謎題。",
};

export default messages;
