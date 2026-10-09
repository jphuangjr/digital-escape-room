import "server-only";
import type { Block, RoomProgress, SitePage } from "@/lib/types";
import { page } from "./source";

export const INTRANET_HOST = "intranet.meridian-inst.net";

const FOOTER: Block = { type: "footer", text: "© since 1978. Meridian Institute internal systems. Unauthorised access is a continuity violation." };

function login(gatedFrom?: string): SitePage {
  const blocks: Block[] = [
    { type: "compass" },
    { type: "heading", level: 1, text: "The Vault" },
    { type: "paragraph", text: "Meridian Staff Access" },
    ...(gatedFrom ? [{ type: "notice", tone: "warning", text: "Session required. Please sign in to continue." } as Block] : []),
    { type: "paragraph", text: "Authorised personnel only. Accounts follow the standard staff format." },
    { type: "form", form: "intranet-login", prompt: "Enter your staff username and vault code." },
    { type: "notice", tone: "info", text: "Forgotten your vault code? Legacy accounts were issued codes at onboarding. Contact Systems (W. Okafor) — extension unavailable." },
    FOOTER,
  ];
  return page(INTRANET_HOST, "The Vault — Meridian Staff Access", "intranet", blocks, {
    headComments: ["MeridianAuth 1.3 — legacy mode"],
    bodyComments: [
      "usernames: firstname.lastname (lowercase)",
      "legacy vault codes per IT-2019-07: the TRUE founding year, followed by the 4-digit registry ID the user chose. yes, really. — W.O.",
    ],
  });
}

const NAV: Block = {
  type: "nav",
  links: [
    { text: "Dashboard", href: INTRANET_HOST },
    { text: "Record Changes", href: `${INTRANET_HOST}/records` },
    { text: "Memos", href: `${INTRANET_HOST}/memos` },
  ],
};

const DIFFS: Block[] = [
  { type: "diff", label: "Charter of Incorporation — founding year", before: "Chartered 14 June 1978 by the Harbour Trust.", after: "Chartered 1987 by civic ordinance." },
  { type: "diff", label: "Harbour Ledger vol. III, fol. 12 — entry for the night of the warehouse fire", before: "Fire reported 02:10. Watchman's statement: lamps seen in the Trust office before the blaze.", after: "Fire reported 02:10. Cause: electrical." },
  { type: "diff", label: "Staff register — Systems Archivist", before: "Wren Okafor — Systems Archivist. Photograph on file. Witness, Continuity Inquiry 2019.", after: "Wren Okafor — Systems Archivist." },
  { type: "diff", label: "Founders' correspondence — signatories", before: "Signed: H. Calloway, T. Kell (sr.), E. Voss.", after: "Signed: [withdrawn]." },
  { type: "diff", label: "Staff register — Senior Archivist", before: "Dr. Ada Voss — Senior Archivist. Status: active.", after: "Dr. Ada Voss — Senior Archivist. Status: on leave (indefinite)." },
];

const MEMO: Block = {
  type: "memo",
  heading: "MEMO — Office of Continuity — RE: Dr. A. Voss",
  parts: [
    { text: "To: Deputy Director T. Kell. From: Security (L. Ash). Voss has not been located. Her badge was last used at the server room at 23:58. We believe she has left something running on an external host. Our analysts traced outbound traffic to " },
    { redacted: "switch.ada-voss.net" },
    { text: ". It appears to be a dead man's switch: if the timer runs out, the unaltered records go to every newsroom in the city. Recommend we locate her before it fires. Recommend we do not involve the police. Recommend we do not involve " },
    { redacted: "her sister" },
    { text: "." },
  ],
};

function dashboard(): SitePage {
  const blocks: Block[] = [
    NAV,
    { type: "compass" },
    { type: "heading", level: 1, text: "Welcome back, wren.okafor" },
    { type: "notice", tone: "warning", text: "Last sign-in for this account: 2 days ago, 23:52, from Server Room B. Was this you?" },
    { type: "paragraph", text: "Continuity queue: 0 items pending. 4,112 items reconciled this year." },
    { type: "heading", level: 2, text: "Recent record changes" },
    ...DIFFS.slice(0, 3),
    { type: "link", text: "All record changes →", href: `${INTRANET_HOST}/records` },
    { type: "heading", level: 2, text: "Flagged memo" },
    MEMO,
    FOOTER,
  ];
  return page(INTRANET_HOST, "The Vault — Dashboard", "intranet", blocks, {
    headComments: ["MeridianAuth 1.3 — session ok"],
    bodyComments: ["she used my account. I let her. — W."],
  });
}

function records(): SitePage {
  const blocks: Block[] = [
    NAV,
    { type: "heading", level: 1, text: "Record Changes — Continuity Log" },
    { type: "paragraph", text: "Every reconciliation is logged here before the original is retired. Logs are purged quarterly." },
    ...DIFFS,
    { type: "notice", tone: "danger", text: "Purge scheduled. This log will be cleared in 3 days." },
    FOOTER,
  ];
  return page(`${INTRANET_HOST}/records`, "Record Changes", "intranet", blocks, {
    tailComments: ["export of this log was requested by A.VOSS 2 days ago. request completed (??)"],
  });
}

function memos(): SitePage {
  const blocks: Block[] = [
    NAV,
    { type: "heading", level: 1, text: "Memos" },
    MEMO,
    { type: "memo", heading: "MEMO — Director's Office — RE: public messaging", parts: [{ text: "If asked, Dr. Voss is on extended leave for personal reasons. Do not use the word 'missing'. Do not confirm or deny the existence of the Continuity Office." }] },
    FOOTER,
  ];
  return page(`${INTRANET_HOST}/memos`, "Memos", "intranet", blocks);
}

export function resolveIntranet(path: string, progress: RoomProgress): SitePage | null {
  const authed = progress.solved.includes("intranet-login");
  if (path === "" || path === "/login") return authed ? dashboard() : login();
  const known = ["/dashboard", "/records", "/memos"];
  if (!known.includes(path)) return null;
  if (!authed) return login(path);
  if (path === "/dashboard") return dashboard();
  if (path === "/records") return records();
  return memos();
}
