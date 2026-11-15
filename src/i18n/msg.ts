// A message to translate later, where the words are decided on the server or in shared game logic but shown in the
// viewer's language: game refusals, All Hands lineup warnings. A value written "@some.id" is itself a message id,
// translated first (a role's name inside a sentence, say).

export type MsgValues = Record<string, string | number>;

export interface Msg {
  id: string;
  values?: MsgValues;
}

type Translate = (id: string, values?: MsgValues) => string;

export function formatMsg(t: Translate, id: string, values?: MsgValues): string {
  if (!values) return t(id);
  const resolved: MsgValues = {};
  for (const [k, v] of Object.entries(values)) resolved[k] = typeof v === "string" && v.startsWith("@") ? t(v.slice(1)) : v;
  return t(id, resolved);
}
