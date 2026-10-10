import "server-only";
import type { Locale } from "@/i18n/config";
import type { Block, RoomProgress, SitePage } from "@/lib/types";
import { page } from "./source";

export const MERIDIAN_HOST = "meridian-inst.net";

const NAV: Block = {
  type: "nav",
  links: [
    { text: "Home", href: MERIDIAN_HOST },
    { text: "About", href: `${MERIDIAN_HOST}/about` },
    { text: "Staff", href: `${MERIDIAN_HOST}/staff` },
    { text: "Collections", href: `${MERIDIAN_HOST}/collections` },
    { text: "Staff portal", href: "intranet.meridian-inst.net" },
  ],
};

const FOOTER: Block = {
  type: "footer",
  text: "© since 1978. The Meridian Institute for Historical Continuity. All records verified. All records final.",
};

function home(): SitePage {
  const blocks: Block[] = [
    NAV,
    { type: "compass" },
    { type: "heading", level: 1, text: "The Meridian Institute" },
    { type: "paragraph", text: "Keepers of the record. Guardians of continuity. Since our founding, the Meridian Institute has preserved the documents, photographs and testimonies that tell this city who it is." },
    { type: "notice", tone: "info", text: "Notice: the Reading Room is closed until further notice while our archive migration is finalised. We thank patrons for their patience." },
    { type: "heading", level: 2, text: "Our Mission" },
    { type: "paragraph", text: "History is not what happened. History is what is kept. Every ledger, every deed, every faded photograph passes through our hands before it is entrusted to the public memory. We take that responsibility seriously. We take it personally." },
    { type: "heading", level: 2, text: "From the Director" },
    { type: "paragraph", text: "\"A city without a reliable past cannot have a stable future. The Institute exists so that no citizen ever has to wonder which version of events is true.\" — Director H. Calloway" },
    { type: "heading", level: 2, text: "Recent Announcements" },
    {
      type: "list",
      items: [
        "Archivist Dr. Ada Voss is on extended leave. Enquiries regarding the Harbour Ledgers should be directed to the Office of the Director.",
        "The 2019 digitisation programme is now complete. Physical originals have been retired.",
        "Our compass emblem has been restored to the main stair. Please do not touch the needle.",
      ],
    },
    { type: "link", text: "Meet the people who keep the record →", href: `${MERIDIAN_HOST}/staff` },
    FOOTER,
  ];
  return page(MERIDIAN_HOST, "Meridian Institute — Keepers of the Record", "meridian", blocks, {
    headComments: ["Meridian CMS v4.2 — template: civic-classic"],
    meta: { description: "The Meridian Institute for Historical Continuity", generator: "Meridian CMS 4.2" },
    inlineComments: {
      1: ["emblem: seven notches, needle intentionally unrepaired per Director"],
      4: ["archive migration complete: see /vault-2019"],
    },
    tailComments: ["analytics disabled per Records Directive 19"],
    scripts: ["/static/meridian.min.js"],
  });
}

const STAFF: Extract<Block, { type: "staff" }>["people"] = [
  { name: "Dr. Harriet Calloway", role: "Director", bio: "Has led the Institute for two decades. Believes the past is a public utility and should be maintained like one.", photo: "calloway.jpg" },
  { name: "Dr. Ada Voss", role: "Senior Archivist (on leave)", bio: "Specialist in harbour-era ledgers and municipal deeds. Known for reading the footnotes nobody else reads.", photo: "voss.jpg" },
  { name: "Wren Okafor", role: "Systems Archivist", bio: "Maintains the Institute's digital catalogue and access systems. Off the clock, she still holds the high score on Circuit Runner '94 — and will tell you so on runnerboard.net if you ask.", photo: null, link: { text: "runnerboard.net →", href: "runnerboard.net" } },
  { name: "Thomas Kell", role: "Deputy Director, Continuity", bio: "Oversees reconciliation of conflicting records. \"Two truths are one too many.\"", photo: "kell.jpg" },
  { name: "Priya Ramanathan", role: "Conservator", bio: "Restores paper, vellum and film. Can tell a forged watermark by the way it catches the light.", photo: "ramanathan.jpg" },
  { name: "Lionel Ash", role: "Head of Security", bio: "Former harbour police. Responsible for the vaults, the keys and the people who ask about them.", photo: "ash.jpg" },
  { name: "Margit Hollis", role: "Photographic Collections", bio: "Curates over two hundred thousand negatives. Prefers silver gelatin to pixels.", photo: "hollis.jpg" },
  { name: "Samuel Oduya", role: "Oral Histories", bio: "Records the memories of long-time residents, then cross-checks them against the record. Usually the record wins.", photo: "oduya.jpg" },
  { name: "Clémence Barre", role: "Public Programmes", bio: "Runs the Thursday lectures and the school visits. Has never once been asked a hard question by a child she couldn't answer.", photo: "barre.jpg" },
  { name: "Ivo Strand", role: "Digitisation Lead", bio: "Led the 2019 migration of the physical archive to the new catalogue. Originals retired on schedule.", photo: "strand.jpg" },
  { name: "Beatrice Lam", role: "Reading Room Supervisor", bio: "Has supervised the Reading Room for eleven years. The Reading Room is currently closed.", photo: "lam.jpg" },
  { name: "Noel Ferrante", role: "Facilities", bio: "Keeps the lights on and the boilers quiet. Knows which doors stick and which ones are meant to.", photo: "ferrante.jpg" },
];

function staff(): SitePage {
  const blocks: Block[] = [
    NAV,
    { type: "compass" },
    { type: "heading", level: 1, text: "Staff Directory" },
    { type: "paragraph", text: "The Institute's work is carried out by a small and dedicated team. Staff may be contacted through the Office of the Director." },
    { type: "staff", people: STAFF },
    FOOTER,
  ];
  return page(`${MERIDIAN_HOST}/staff`, "Staff — Meridian Institute", "meridian", blocks, {
    headComments: ["Meridian CMS v4.2 — template: directory"],
    inlineComments: {
      4: [
        "photo for W. Okafor removed pending review — do NOT re-upload",
        "A. Voss status: on leave. Do not change to 'missing'. — T.K.",
      ],
    },
  });
}

function about(): SitePage {
  const blocks: Block[] = [
    NAV,
    { type: "compass" },
    { type: "heading", level: 1, text: "About the Institute" },
    { type: "paragraph", text: "Founded 1987." },
    { type: "paragraph", text: "The Meridian Institute was established by civic charter to gather the scattered archives of the old harbour city under one roof. What began as three rooms above a shipping office is now the city's sole custodian of historical record." },
    { type: "paragraph", text: "Our emblem, the compass, reminds us that a record is only as good as its bearing. Ours has seven notches — one for each of the founding collections. The needle was damaged in the move to our current building. We have chosen to leave it as it is." },
    { type: "heading", level: 2, text: "Our Principles" },
    {
      type: "list",
      items: [
        "Continuity — the record must not contradict itself.",
        "Custody — what we keep, we keep forever.",
        "Discretion — not every truth is ready for every reader.",
      ],
    },
    { type: "image", alt: "The first Institute offices, above a shipping agent", caption: "The original reading rooms, Harbour Street.", art: "archive-building", fileInfo: { filename: "harbour-street-offices.jpg", author: "Meridian Photographic Collections", camera: "Rolleiflex 2.8F", date: "1987-06-01", dimensions: "2400 × 1800", comment: "Opening week. Scanned 2019." } },
    FOOTER,
  ];
  return page(`${MERIDIAN_HOST}/about`, "About — Meridian Institute", "meridian", blocks, {
    headComments: ["Meridian CMS v4.2 — template: civic-classic"],
    inlineComments: {
      3: ["copy approved by Office of the Director — footer to be reconciled at next continuity review"],
    },
  });
}

function vault(): SitePage {
  const blocks: Block[] = [
    NAV,
    { type: "compass" },
    { type: "heading", level: 1, text: "Vault 2019 — Migration Staging" },
    { type: "notice", tone: "warning", text: "Internal staging area. This page is not indexed. If you have reached it in error, please close your browser." },
    { type: "paragraph", text: "Items below were held back from the public catalogue during the 2019 migration, pending continuity review." },
    { type: "image", alt: "A woman at a reading-room table, face turned from the camera, a ledger open in front of her", caption: "Reading Room, late. Subject unidentified.", art: "photo-reading-room", fileInfo: { filename: "IMG_8841_draft.jpg", author: "A. Voss", camera: "Pentax K1000 (scanned)", date: "2019-01-02 23:41", dimensions: "3008 × 2000", comment: "draft uploaded to thedrift.blog" } },
    { type: "image", alt: "A ledger page with a column of dates, one line scraped away", caption: "Harbour Ledger, vol. III, folio 12.", art: "photo-ledger", fileInfo: { filename: "ledger-iii-f12.tif", author: "Meridian Digitisation", camera: "Phase One IQ3", date: "2019-03-11", dimensions: "8000 × 6000", comment: "original retired" } },
    { type: "list", items: ["Harbour Ledgers vol. I–IV — status: reconciled", "Founders' correspondence — status: sealed", "Staff photographs (1987–2019) — status: under review"] },
    FOOTER,
  ];
  return page(`${MERIDIAN_HOST}/vault-2019`, "Vault 2019 — Staging", "meridian", blocks, {
    headComments: ["robots: noindex, nofollow"],
    meta: { robots: "noindex, nofollow" },
    inlineComments: { 5: ["this one isn't ours. who uploaded it?  — I.S."] },
  });
}

function collections(): SitePage {
  const blocks: Block[] = [
    NAV,
    { type: "compass" },
    { type: "heading", level: 1, text: "Collections" },
    { type: "paragraph", text: "The Institute's holdings are organised into seven founding collections. Following the 2019 migration, all collections are available exclusively through the digital catalogue." },
    { type: "list", items: ["I. Harbour Ledgers", "II. Municipal Deeds", "III. Founders' Correspondence", "IV. Photographic Collections", "V. Oral Histories", "VI. Maps & Charts", "VII. [Collection withdrawn]"] },
    { type: "notice", tone: "info", text: "Catalogue access is temporarily restricted to staff." },
    FOOTER,
  ];
  return page(`${MERIDIAN_HOST}/collections`, "Collections — Meridian Institute", "meridian", blocks, {
    inlineComments: { 4: ["VII withdrawn 2019 by order of the Deputy Director"] },
  });
}

export function resolveMeridian(path: string, _progress: RoomProgress, _loc: Locale): SitePage | null {
  switch (path) {
    case "":
    case "/index.html":
    case "/home":
      return home();
    case "/staff":
      return staff();
    case "/about":
      return about();
    case "/vault-2019":
      return vault();
    case "/collections":
      return collections();
    default:
      return null;
  }
}
