import type { ReplyPack } from "..";
import prompts from "./prompts";
import replies1 from "./replies1";
import replies2 from "./replies2";
import afterHoursPrompts from "./afterHoursPrompts";
import afterHoursReplies from "./afterHoursReplies";

// Cartas do Reply All em português, incluindo as do After Hours (18+).
const pack: ReplyPack = {
  prompts,
  replies: [...replies1, ...replies2],
  afterHoursPrompts,
  afterHoursReplies,
};

export default pack;
