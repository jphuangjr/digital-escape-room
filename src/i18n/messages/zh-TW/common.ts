import type en from "../en/common";

const messages: Record<keyof typeof en, string> = {
  "common.language": "語言",
  "common.close": "關閉",
  "common.cancel": "取消",
  "common.back": "返回",
  "common.copy": "複製",
  "common.copied": "已複製",
  "common.paste": "貼上",
  "common.clear": "清除",
  "common.loading": "載入中…",
  "common.retry": "再試一次",
  "common.connectionError": "連線發生錯誤，請再試一次。",
};

export default messages;
