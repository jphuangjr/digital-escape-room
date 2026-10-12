import type en from "../en/board";

const messages: Record<keyof typeof en, string> = {
  "board.title": "Clasificación",
  "board.subtitle": "{total, plural, =0 {Los equipos más rápidos} one {Los equipos más rápidos · # equipo ha escapado} other {Los equipos más rápidos · # equipos han escapado}}",
  "board.empty": "Ningún equipo ha escapado todavía. Sed los primeros.",
  "board.loading": "Cargando clasificación…",
  "board.rowMeta": "{attempts, plural, one {# respuesta} other {# respuestas}} · {wrong} incorrectas · {hints, plural, one {# pista} other {# pistas}}",
  "board.you": "Vosotros",
  "board.yourResult": "El resultado de tu equipo",
  "board.rankOf": "N.º {rank} de {total}",
  "board.stat.time": "Tiempo",
  "board.stat.answers": "Respuestas",
  "board.stat.wrong": "Incorrectas",
  "board.stat.hints": "Pistas",
  "board.morePlayers": "+{n}",
  "board.timeNote": "El tiempo corre desde que se abre el caso hasta la respuesta final.",
};

export default messages;
