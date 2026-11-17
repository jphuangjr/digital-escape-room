import type { ReplyPack } from "..";
import prompts from "./prompts";
import replies1 from "./replies1";
import replies2 from "./replies2";
import afterHoursPrompts from "./afterHoursPrompts";
import afterHoursReplies from "./afterHoursReplies";

// 全部回覆卡牌(繁體中文)，包含下班後(18+)卡牌。
const pack: ReplyPack = {
  prompts,
  replies: [...replies1, ...replies2],
  afterHoursPrompts,
  afterHoursReplies,
};
export default pack;
