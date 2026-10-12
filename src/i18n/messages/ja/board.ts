import type en from "../en/board";

const messages: Record<keyof typeof en, string> = {
  "board.title": "ランキング",
  "board.subtitle": "{total, plural, =0 {最速チーム} other {最速チーム · #チームが脱出}}",
  "board.empty": "まだ脱出したチームはありません。最初のチームになろう。",
  "board.loading": "ランキングを読み込み中…",
  "board.rowMeta": "回答 {attempts} 回 · 不正解 {wrong} 回 · ヒント {hints} 個",
  "board.you": "あなたのチーム",
  "board.yourResult": "あなたのチームの記録",
  "board.rankOf": "{total}チーム中 {rank}位",
  "board.stat.time": "タイム",
  "board.stat.answers": "回答",
  "board.stat.wrong": "不正解",
  "board.stat.hints": "ヒント",
  "board.morePlayers": "+{n}",
  "board.timeNote": "タイムは事件を開いた時から最後の回答までです。",
};

export default messages;
