import type { ReplyPack } from "..";
import prompts from "./prompts";
import replies1 from "./replies1";
import replies2 from "./replies2";

// Cartas do baralho normal em português. O After Hours (18+) continua em inglês por enquanto.
const pack: ReplyPack = { prompts, replies: [...replies1, ...replies2] };

export default pack;
