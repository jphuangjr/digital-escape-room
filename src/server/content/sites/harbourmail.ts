import "server-only";
import type { Locale } from "@/i18n/config";
import type { Block, RoomProgress, SitePage } from "@/lib/types";
import { page } from "./source";
import { MARA_ADDRESS } from "../answers";
import { fill, maraText } from "../mara";
import type { MaraFolder } from "../mara/types";

/**
 * HarbourMail, Mara's webmail: the Easter egg. Her address is in the From line of her email to the
 * investigator. "Forgot password" mails a temporary password to the recovery contact (Ada, i.e. the
 * Email app on this laptop); signing in with it opens her inbox. Reachable from the start.
 */
export const HARBOURMAIL_HOST = "harbourmail.net";
/** The US spelling resolves to the same site. */
export const HARBORMAIL_HOST = "harbormail.net";

const RECOVERY_MASKED = "a•••@ada-voss.net";
const FOLDERS: MaraFolder[] = ["inbox", "sent", "drafts", "spam"];

function signIn(progress: RoomProgress, loc: Locale, gated: boolean): SitePage {
  const s = maraText(loc).site;
  const blocks: Block[] = [
    { type: "heading", level: 1, text: s.pageTitle },
    { type: "paragraph", text: s.tagline },
    ...(gated ? [{ type: "notice", tone: "warning", text: s.sessionRequired } as Block] : []),
    { type: "heading", level: 2, text: s.signInHeading },
    { type: "form", form: "mara-login", prompt: s.signInPrompt },
    { type: "link", text: s.forgotLink, href: `${HARBOURMAIL_HOST}/forgot` },
    { type: "footer", text: s.footer },
  ];
  return page(HARBOURMAIL_HOST, s.pageTitle, "harbourmail", blocks, {
    headComments: [s.headComment],
    bodyComments: [s.bodyComment],
  });
}

function forgot(progress: RoomProgress, loc: Locale): SitePage {
  const s = maraText(loc).site;
  const sent = progress.solved.includes("mara-reset");
  const blocks: Block[] = [
    { type: "heading", level: 1, text: s.pageTitle },
    { type: "heading", level: 2, text: s.forgotHeading },
    { type: "paragraph", text: s.forgotIntro },
    sent
      ? { type: "notice", tone: "success", text: fill(s.forgotSent, { recovery: RECOVERY_MASKED }) }
      : { type: "form", form: "mara-reset", prompt: s.forgotPrompt },
    { type: "link", text: s.backToSignIn, href: HARBOURMAIL_HOST },
    { type: "footer", text: s.footer },
  ];
  return page(`${HARBOURMAIL_HOST}/forgot`, s.forgotHeading, "harbourmail", blocks, { bodyComments: [s.bodyComment] });
}

function mailbox(folder: MaraFolder, loc: Locale): SitePage {
  const { site: s, messages } = maraText(loc);
  const mail = messages.filter((m) => m.folder === folder);
  const received = folder === "inbox" || folder === "spam";
  const blocks: Block[] = [
    { type: "heading", level: 1, text: s.pageTitle },
    { type: "paragraph", text: fill(s.signedInAs, { address: MARA_ADDRESS }) },
    {
      type: "nav",
      links: FOLDERS.map((f) => ({ text: s.folders[f], href: f === "inbox" ? HARBOURMAIL_HOST : `${HARBOURMAIL_HOST}/${f}` })),
    },
    { type: "heading", level: 2, text: s.folders[folder] },
    ...(folder === "spam" ? [{ type: "notice", tone: "warning", text: s.spamNotice } as Block] : []),
    ...(mail.length
      ? mail.map(
          (m): Block => ({
            type: "mail",
            subject: m.subject,
            party: fill(received ? s.fromLabel : s.toLabel, { party: m.party }),
            date: m.date,
            body: m.body.join("\n"),
            ...(folder === "drafts" ? { tag: s.draftNotice } : {}),
          }),
        )
      : [{ type: "paragraph", text: s.emptyFolder } as Block]),
    { type: "footer", text: s.footer },
  ];
  const address = folder === "inbox" ? HARBOURMAIL_HOST : `${HARBOURMAIL_HOST}/${folder}`;
  return page(address, `${s.folders[folder]} — ${s.pageTitle}`, "harbourmail", blocks, { headComments: [s.headComment] });
}

export function resolveHarbourmail(path: string, progress: RoomProgress, loc: Locale): SitePage | null {
  const signedIn = progress.solved.includes("mara-login");
  if (path === "/forgot") return signedIn ? mailbox("inbox", loc) : forgot(progress, loc);
  if (path === "" || path === "/inbox") return signedIn ? mailbox("inbox", loc) : signIn(progress, loc, false);
  const folder = path.slice(1) as MaraFolder;
  if (FOLDERS.includes(folder)) return signedIn ? mailbox(folder, loc) : signIn(progress, loc, true);
  return null;
}
