import type { ReplyPack } from "..";
import prompts from "./prompts";
import replies1 from "./replies1";
import replies2 from "./replies2";

// 전체 답장 카드(한국어). After Hours(18+) 카드는 아직 영어예요.
const pack: ReplyPack = { prompts, replies: [...replies1, ...replies2] };
export default pack;
