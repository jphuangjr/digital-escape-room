// English is the source of truth. Ids are "<area>.<component>.<thing>"; values use ICU syntax
// ({name}, {count, plural, one {# player} other {# players}}, <b>rich</b>).
const messages = {
  "common.language": "Language",
  "common.close": "Close",
  "common.cancel": "Cancel",
  "common.back": "Back",
  "common.copy": "Copy",
  "common.copied": "Copied",
  "common.paste": "Paste",
  "common.clear": "Clear",
  "common.loading": "Loading…",
  "common.retry": "Try again",
  "common.connectionError": "Connection error. Try again.",
} as const;

export default messages;
