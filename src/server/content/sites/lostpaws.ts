import "server-only";
import type { Block, RoomProgress, SitePage } from "@/lib/types";
import { caesar, LOSTPAWS_CIPHERTEXT_CHUNKS, LOSTPAWS_PLAINTEXT_CHUNKS } from "../cipher";
import { page } from "./source";

export const LOSTPAWS_HOST = "lostpaws.net";

interface PetListing {
  title: string;
  meta: string;
  petId: string;
}

/** Listing order matters: chunk i of the hidden message lives in listing i. */
const PETS: PetListing[] = [
  { title: "Pepper — black Labrador, male", meta: "Lost · Canal Row · 6 days ago · reward offered", petId: "0219" },
  { title: "Biscuit — tabby, female, white socks", meta: "Lost · Harbour Street · 3 days ago · microchipped", petId: "0412" },
  { title: "Mr. Fennimore — grey rabbit", meta: "Found · Old Customs House steps · 2 days ago", petId: "0733" },
  { title: "Juno — collie mix, female", meta: "Lost · Ferry Terminal · 9 days ago · shy, do not chase", petId: "1150" },
  { title: "Sardine — ginger cat, male", meta: "Found · Meridian Institute loading dock · yesterday", petId: "0868" },
];

if (PETS.length !== LOSTPAWS_CIPHERTEXT_CHUNKS.length) {
  throw new Error("lostpaws: listing count must match message chunk count");
}

function listingBlocks(bodies: readonly string[]): Block[] {
  return PETS.map((p, i) => ({ type: "listing", title: p.title, meta: p.meta, body: bodies[i], petId: p.petId }));
}

/** Listings with each body shifted back by `shift` from the ciphertext (server-side decoder preview). */
export function decodeListings(shift: number): Block[] {
  const s = Number.isFinite(shift) ? Math.trunc(shift) : 0;
  return listingBlocks(LOSTPAWS_CIPHERTEXT_CHUNKS.map((c) => caesar(c, -s)));
}

function home(progress: RoomProgress): SitePage {
  const decoded = progress.solved.includes("shift-key");
  const blocks: Block[] = [
    { type: "compass" },
    { type: "heading", level: 1, text: "Lost Paws" },
    { type: "paragraph", text: "A neighbourhood board for lost and found animals around the old harbour. Every listing is a little light left on in a window." },
    decoded
      ? { type: "notice", tone: "success", text: "Listings restored. Our volunteer's descriptions now read correctly." }
      : { type: "notice", tone: "warning", text: "Our listing descriptions were scrambled after a volunteer changed a setting. They swear they only turned a dial a few notches. If you know the key, enter it below." },
    ...listingBlocks(decoded ? LOSTPAWS_PLAINTEXT_CHUNKS : LOSTPAWS_CIPHERTEXT_CHUNKS),
    ...(decoded ? [] : [{ type: "form", form: "shift-key", prompt: "Restore listings — how many notches was the dial turned?" } as Block]),
    { type: "paragraph", text: "Microchipped pets are listed with their registry ID. If you find an animal, please do not feed it rich food — bring it to the Harbour Street shelter." },
    { type: "footer", text: "Lost Paws — run by volunteers. Bring them home." },
  ];
  return page(LOSTPAWS_HOST, "Lost Paws — Harbour District", "lostpaws", blocks, {
    headComments: ["lostpaws board — volunteer build"],
    bodyComments: decoded ? ["descriptions restored"] : ["descriptions encoded with legacy rotate() — volunteer forgot the setting. it's a small number."],
    tailComments: ["listing for Biscuit posted by a friend of the owner, owner 'can't come in person right now'"],
  });
}

export function resolveLostpaws(path: string, progress: RoomProgress): SitePage | null {
  return path === "" ? home(progress) : null;
}
