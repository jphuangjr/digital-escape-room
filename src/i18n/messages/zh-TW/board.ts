import type en from "../en/board";

const messages: Record<keyof typeof en, string> = {
  "board.title": "排行榜",
  "board.subtitle": "{total, plural, =0 {最快的隊伍} other {最快的隊伍 · 已有 # 隊逃脫}}",
  "board.empty": "還沒有隊伍逃脫。成為第一隊吧。",
  "board.loading": "正在載入排行榜…",
  "board.rowMeta": "作答 {attempts} 次 · 答錯 {wrong} 次 · 提示 {hints} 個",
  "board.you": "你們",
  "board.yourResult": "你們隊伍的成績",
  "board.rankOf": "{total} 隊中第 {rank} 名",
  "board.stat.time": "時間",
  "board.stat.answers": "作答",
  "board.stat.wrong": "答錯",
  "board.stat.hints": "提示",
  "board.morePlayers": "+{n}",
  "board.timeNote": "時間從開啟案件起算，到最後一個答案為止。",
};

export default messages;
