import type { ReplyPack } from "..";
import prompts from "./prompts";
import replies1 from "./replies1";
import replies2 from "./replies2";
import afterHoursPrompts from "./afterHoursPrompts";
import afterHoursReplies from "./afterHoursReplies";

// 全員に返信のカード(日本語)。アフターアワーズ(18禁)カードも含みます。
const pack: ReplyPack = {
  prompts,
  replies: [...replies1, ...replies2],
  afterHoursPrompts,
  afterHoursReplies,
};
export default pack;
