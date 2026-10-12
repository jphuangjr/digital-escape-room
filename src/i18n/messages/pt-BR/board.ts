import type en from "../en/board";

const messages: Record<keyof typeof en, string> = {
  "board.title": "Ranking",
  "board.subtitle": "{total, plural, =0 {Equipes mais rápidas} one {Equipes mais rápidas · # equipe escapou} other {Equipes mais rápidas · # equipes escaparam}}",
  "board.empty": "Nenhuma equipe escapou ainda. Sejam os primeiros.",
  "board.loading": "Carregando ranking…",
  "board.rowMeta": "{attempts, plural, one {# resposta} other {# respostas}} · {wrong} erradas · {hints, plural, one {# dica} other {# dicas}}",
  "board.you": "Vocês",
  "board.yourResult": "O resultado da sua equipe",
  "board.rankOf": "{rank}º de {total}",
  "board.stat.time": "Tempo",
  "board.stat.answers": "Respostas",
  "board.stat.wrong": "Erradas",
  "board.stat.hints": "Dicas",
  "board.morePlayers": "+{n}",
  "board.timeNote": "O tempo conta da abertura do caso até a resposta final.",
  "board.unsolved": "Acusação errada",
};

export default messages;
