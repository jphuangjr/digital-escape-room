import "server-only";
import { pick, type Locale, type Tr } from "@/i18n/config";
import type { Block, RoomProgress, SitePage } from "@/lib/types";
import { caesar, LOSTPAWS_CIPHERTEXT_CHUNKS, LOSTPAWS_PLAINTEXT_CHUNKS } from "../cipher";
import { page } from "./source";

export const LOSTPAWS_HOST = "lostpaws.net";

interface PetListing {
  title: Tr;
  meta: Tr;
  petId: string;
}

/** Listing order matters: chunk i of the hidden message lives in listing i. */
const PETS: PetListing[] = [
  {
    title: { en: "Pepper — black Labrador, male", ko: "Pepper — 검은색 래브라도, 수컷" },
    meta: { en: "Lost · Canal Row · 6 days ago · reward offered", ko: "실종 · 커낼 로(Canal Row) · 6일 전 · 사례금 있음" },
    petId: "0219",
  },
  {
    title: { en: "Biscuit — tabby, female, white socks", ko: "Biscuit — 태비, 암컷, 하얀 양말 무늬" },
    meta: { en: "Lost · Harbour Street · 3 days ago · microchipped", ko: "실종 · 하버 스트리트(Harbour Street) · 3일 전 · 마이크로칩 있음" },
    petId: "0412",
  },
  {
    title: { en: "Mr. Fennimore — grey rabbit", ko: "Mr. Fennimore — 회색 토끼" },
    meta: { en: "Found · Old Customs House steps · 2 days ago", ko: "발견 · 옛 세관 건물 계단 · 2일 전" },
    petId: "0733",
  },
  {
    title: { en: "Juno — collie mix, female", ko: "Juno — 콜리 믹스, 암컷" },
    meta: { en: "Lost · Ferry Terminal · 9 days ago · shy, do not chase", ko: "실종 · 페리 터미널 · 9일 전 · 겁이 많음, 쫓지 마세요" },
    petId: "1150",
  },
  {
    title: { en: "Sardine — ginger cat, male", ko: "Sardine — 치즈 고양이, 수컷" },
    meta: { en: "Found · Meridian Institute loading dock · yesterday", ko: "발견 · 메리디언 연구소(Meridian Institute) 하역장 · 어제" },
    petId: "0868",
  },
];

if (PETS.length !== LOSTPAWS_CIPHERTEXT_CHUNKS.length) {
  throw new Error("lostpaws: listing count must match message chunk count");
}

/** Titles and meta follow `loc`; bodies are always the English ciphertext/plaintext (the puzzle). */
function listingBlocks(bodies: readonly string[], loc: Locale): Block[] {
  const x = pick(loc);
  return PETS.map((p, i) => ({ type: "listing", title: x(p.title), meta: x(p.meta), body: bodies[i], petId: p.petId }));
}

/** Listings with each body shifted back by `shift` from the ciphertext (server-side decoder preview). */
export function decodeListings(shift: number, loc: Locale): Block[] {
  const s = Number.isFinite(shift) ? Math.trunc(shift) : 0;
  return listingBlocks(LOSTPAWS_CIPHERTEXT_CHUNKS.map((c) => caesar(c, -s)), loc);
}

function home(progress: RoomProgress, loc: Locale): SitePage {
  const x = pick(loc);
  const decoded = progress.solved.includes("shift-key");
  const blocks: Block[] = [
    { type: "compass" },
    { type: "heading", level: 1, text: "Lost Paws" },
    {
      type: "paragraph",
      text: x({
        en: "A neighbourhood board for lost and found animals around the old harbour. Every listing is a little light left on in a window.",
        ko: "옛 항구 일대에서 잃어버리고 찾은 동물들을 위한 동네 게시판입니다. 글 하나하나가 창가에 켜 둔 작은 불빛이에요.",
      }),
    },
    decoded
      ? {
          type: "notice",
          tone: "success",
          text: x({
            en: "Listings restored. Our volunteer's descriptions now read correctly.",
            ko: "게시글이 복구되었습니다. 이제 봉사자가 쓴 설명이 제대로 보여요.",
          }),
        }
      : {
          type: "notice",
          tone: "warning",
          text: x({
            en: "Our listing descriptions were scrambled after a volunteer changed a setting. They swear they only turned a dial a few notches. If you know the key, enter it below.",
            ko: "봉사자 한 분이 설정을 바꾼 뒤로 게시글 설명이 뒤죽박죽이 됐어요. 다이얼을 몇 칸 돌렸을 뿐이라고 하네요. 키를 아신다면 아래에 입력해 주세요.",
          }),
        },
    ...listingBlocks(decoded ? LOSTPAWS_PLAINTEXT_CHUNKS : LOSTPAWS_CIPHERTEXT_CHUNKS, loc),
    ...(decoded
      ? []
      : [
          {
            type: "form",
            form: "shift-key",
            prompt: x({
              en: "Restore listings — how many notches was the dial turned?",
              ko: "게시글 복구 — 다이얼을 몇 칸 돌렸을까요?",
            }),
          } as Block,
        ]),
    {
      type: "paragraph",
      text: x({
        en: "Microchipped pets are listed with their registry ID. If you find an animal, please do not feed it rich food — bring it to the Harbour Street shelter.",
        ko: "마이크로칩이 있는 동물은 등록 번호와 함께 올라갑니다. 동물을 발견하시면 기름진 음식은 주지 마시고 하버 스트리트(Harbour Street) 보호소로 데려와 주세요.",
      }),
    },
    { type: "footer", text: x({ en: "Lost Paws — run by volunteers. Bring them home.", ko: "Lost Paws — 봉사자들이 운영합니다. 집으로 데려다주세요." }) },
  ];
  return page(LOSTPAWS_HOST, x({ en: "Lost Paws — Harbour District", ko: "Lost Paws — 하버 지구" }), "lostpaws", blocks, {
    headComments: [x({ en: "lostpaws board — volunteer build", ko: "lostpaws 게시판 — 봉사자 제작" })],
    bodyComments: decoded
      ? [x({ en: "descriptions restored", ko: "설명 복구됨" })]
      : [
          x({
            en: "descriptions encoded with legacy rotate() — volunteer forgot the setting. it's a small number.",
            ko: "설명은 구형 rotate()로 인코딩됨 — 봉사자가 설정값을 잊어버림. 작은 숫자임.",
          }),
        ],
    tailComments: [
      x({
        en: "listing for Biscuit posted by a friend of the owner, owner 'can't come in person right now'",
        ko: "Biscuit 게시글은 주인의 친구가 올림. 주인은 '지금은 직접 올 수 없다'고 함",
      }),
    ],
  });
}

export function resolveLostpaws(path: string, progress: RoomProgress, loc: Locale): SitePage | null {
  return path === "" ? home(progress, loc) : null;
}
