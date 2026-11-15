import { describe, expect, it } from "vitest";
import { PROMPTS, REPLIES } from "@/lib/replyall/cards";
import { AFTER_HOURS_PROMPTS, AFTER_HOURS_REPLIES } from "@/lib/replyall/afterHours";
import { COMPLETE_PACKS, REPLY_PACK_LOADERS, localPrompt, localReply, localizeView } from "@/lib/replyall/content";
import { AFTER_HOURS_BASE } from "@/lib/replyall/deck";

describe("Reply All card packs", () => {
  for (const [locale, load] of Object.entries(REPLY_PACK_LOADERS)) {
    it(`${locale} has every regular card in English order, blanks kept`, async () => {
      const pack = (await load()).default;
      expect(pack.prompts).toHaveLength(PROMPTS.length);
      expect(pack.replies).toHaveLength(REPLIES.length);
      pack.prompts.forEach((p, i) => {
        expect(p.trim(), `${locale} prompt ${i}`).toBeTruthy();
        expect(p.includes("____"), `${locale} prompt ${i}: ${p}`).toBe(PROMPTS[i].includes("____"));
      });
      for (const r of pack.replies) expect(r.trim()).toBeTruthy();
      if (pack.afterHoursPrompts) expect(pack.afterHoursPrompts).toHaveLength(AFTER_HOURS_PROMPTS.length);
      if (pack.afterHoursReplies) expect(pack.afterHoursReplies).toHaveLength(AFTER_HOURS_REPLIES.length);
      if (COMPLETE_PACKS.has(locale)) expect(pack.afterHoursPrompts && pack.afterHoursReplies).toBeTruthy();
    });
  }

  it("shows a card in the pack's language, and falls back to English for cards it doesn't have", async () => {
    const ko = (await REPLY_PACK_LOADERS.ko()).default;
    expect(localPrompt(ko, 0, PROMPTS[0])).toBe(ko.prompts[0]);
    expect(localReply(ko, 3, REPLIES[3])).toBe(ko.replies[3]);
    const ah = AFTER_HOURS_BASE;
    expect(localReply({ prompts: [], replies: [] }, ah, "english")).toBe("english");
    expect(localPrompt(null, 0, "english")).toBe("english");
    const v = localizeView(
      {
        prompt: PROMPTS[1],
        promptId: 1,
        me: { hand: [{ card: 2, text: REPLIES[2] }], played: 2, playedText: REPLIES[2] },
        entries: [{ card: 4, text: REPLIES[4] }],
        history: [{ prompt: PROMPTS[0], reply: REPLIES[0], promptId: 0, replyId: 0 }],
      },
      ko,
    );
    expect(v.prompt).toBe(ko.prompts[1]);
    expect(v.me.hand[0].text).toBe(ko.replies[2]);
    expect(v.me.playedText).toBe(ko.replies[2]);
    expect(v.entries![0].text).toBe(ko.replies[4]);
    expect(v.history[0].reply).toBe(ko.replies[0]);
  });
});
