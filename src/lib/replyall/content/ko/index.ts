import type { ReplyPack } from "..";
import prompts from "./prompts";
import replies1 from "./replies1";
import replies2 from "./replies2";
import afterHoursPrompts from "./afterHoursPrompts";
import afterHoursReplies from "./afterHoursReplies";

// 전체 답장 카드(한국어). 일반 카드와 After Hours(18+) 카드 모두 포함해요.
const pack: ReplyPack = {
  prompts,
  replies: [...replies1, ...replies2],
  afterHoursPrompts,
  afterHoursReplies,
};
export default pack;
