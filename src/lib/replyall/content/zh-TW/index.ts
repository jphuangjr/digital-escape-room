import type { ReplyPack } from "..";
import prompts from "./prompts";
import replies1 from "./replies1";
import replies2 from "./replies2";

// 全部回覆卡牌(繁體中文)。下班後(18+)卡牌目前還是英文。
const pack: ReplyPack = { prompts, replies: [...replies1, ...replies2] };
export default pack;
