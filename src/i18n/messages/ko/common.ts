import type en from "../en/common";

const messages: Record<keyof typeof en, string> = {
  "common.language": "언어",
  "common.close": "닫기",
  "common.cancel": "취소",
  "common.back": "뒤로",
  "common.copy": "복사",
  "common.copied": "복사했어요",
  "common.paste": "붙여넣기",
  "common.clear": "지우기",
  "common.loading": "불러오는 중…",
  "common.retry": "다시 시도",
  "common.connectionError": "연결 오류가 발생했어요. 다시 시도해 주세요.",
};

export default messages;
