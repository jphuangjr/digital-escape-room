import { describe, expect, it } from "vitest";
import { EN_PACK, PACK_LOADERS, localPoll, localTitle } from "@/lib/allhands/content";
import { chatterLines } from "@/lib/allhands/chatter";

describe("All Hands content packs", () => {
  for (const [locale, load] of Object.entries(PACK_LOADERS)) {
    it(`${locale} has every thread, line, handle, title and poll question, with {name} kept`, async () => {
      const pack = (await load()).default;
      expect(pack.anon).toHaveLength(EN_PACK.anon.length);
      expect(pack.titles).toHaveLength(EN_PACK.titles.length);
      expect(pack.polls).toHaveLength(EN_PACK.polls.length);
      for (const s of [...pack.anon, ...pack.titles, ...pack.polls]) expect(s.trim(), locale).toBeTruthy();
      for (const [pool, threads] of Object.entries(EN_PACK.chatter)) {
        const local = pack.chatter[pool as keyof typeof EN_PACK.chatter];
        expect(local, `${locale} ${pool}`).toHaveLength(threads.length);
        threads.forEach((lines, i) => {
          expect(local[i], `${locale} ${pool}.${i}`).toHaveLength(lines.length);
          for (const l of local[i]) expect(l.trim(), `${locale} ${pool}.${i}`).toBeTruthy();
          if (lines.some((l) => l.includes("{name}"))) expect(local[i].join(" "), `${locale} ${pool}.${i}`).toContain("{name}");
        });
      }
    });
  }

  it("shows a stored English title, poll question or thread in the pack's language, and falls back to English", async () => {
    const ko = (await PACK_LOADERS.ko()).default;
    expect(localTitle(ko, EN_PACK.titles[0])).toBe(ko.titles[0]);
    expect(localPoll(ko, EN_PACK.polls[3])).toBe(ko.polls[3]);
    expect(localTitle(ko, "Unknown Title")).toBe("Unknown Title");
    const lines = chatterLines({ pool: "framed", i: 0, who: [0, 1, 2] }, "Priya", ko)!;
    expect(lines[0].who).toBe(ko.anon[0]);
    expect(lines.map((l) => l.text).join(" ")).toContain("Priya");
  });
});
