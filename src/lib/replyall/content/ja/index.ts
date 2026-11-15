import type { ReplyPack } from "..";
import prompts from "./prompts";
import replies1 from "./replies1";
import replies2 from "./replies2";

// 全員に返信のカード(日本語)。アフターアワーズ(18禁)カードはまだ英語です。
const pack: ReplyPack = { prompts, replies: [...replies1, ...replies2] };
export default pack;
