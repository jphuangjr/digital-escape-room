import type en from "../en/common";

const messages: Record<keyof typeof en, string> = {
  "common.language": "言語",
  "common.close": "閉じる",
  "common.cancel": "キャンセル",
  "common.back": "戻る",
  "common.copy": "コピー",
  "common.copied": "コピーしました",
  "common.paste": "貼り付け",
  "common.clear": "クリア",
  "common.loading": "読み込み中…",
  "common.retry": "再試行",
  "common.connectionError": "接続エラーが発生しました。もう一度お試しください。",
};

export default messages;
