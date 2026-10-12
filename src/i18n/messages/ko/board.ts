import type en from "../en/board";

const messages: Record<keyof typeof en, string> = {
  "board.title": "리더보드",
  "board.subtitle": "{total, plural, =0 {가장 빠른 팀} other {가장 빠른 팀 · #팀 탈출}}",
  "board.empty": "아직 탈출한 팀이 없어요. 첫 번째 팀이 되어 보세요.",
  "board.loading": "리더보드 불러오는 중…",
  "board.rowMeta": "답 {attempts}개 · 오답 {wrong}개 · 힌트 {hints}개",
  "board.you": "우리 팀",
  "board.yourResult": "우리 팀 기록",
  "board.rankOf": "{total}팀 중 {rank}위",
  "board.stat.time": "시간",
  "board.stat.answers": "답",
  "board.stat.wrong": "오답",
  "board.stat.hints": "힌트",
  "board.morePlayers": "+{n}",
  "board.timeNote": "시간은 사건을 연 순간부터 마지막 답까지예요.",
  "board.unsolved": "잘못된 지목",
};

export default messages;
