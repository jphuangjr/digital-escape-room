import type { ReplyPack } from "..";
import prompts from "./prompts";
import replies1 from "./replies1";
import replies2 from "./replies2";

// Cartas de Reply All (español). Las cartas After Hours (+18) siguen en inglés por ahora.
const pack: ReplyPack = { prompts, replies: [...replies1, ...replies2] };
export default pack;
