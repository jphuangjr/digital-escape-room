import "server-only";
import { pick, type Locale } from "@/i18n/config";
import type { Block, RoomProgress, SitePage } from "@/lib/types";
import { page } from "./source";

export const DRIFT_HOST = "thedrift.blog";

export interface DriftPost {
  slug: string;
  title: string;
  date: string;
  series: "Field Notes" | "Ada's Kitchen";
  body: string;
  /** Translations. Field Notes titles stay English in every locale (their initials spell DRIFT); the Korean title adds a subtitle. */
  l10n: Record<Exclude<Locale, "en">, { title: string; date: string; body: string }>;
}

type X = ReturnType<typeof pick>;

/**
 * Displayed newest first, with the kitchen series interleaved.
 * Field Notes, read oldest to newest: titles start D, R, I, F, T; days-of-month 2,1,1,2,1 (sum 7).
 * Ada's Kitchen: the only digits in the bodies are measurements, which sum to 11 (decoy).
 */
export const DRIFT_POSTS: DriftPost[] = [
  {
    slug: "true-north-is-a-rumour",
    title: "True North Is a Rumour",
    date: "May 1, 2019",
    series: "Field Notes",
    body: [
      "Last entry in this series, I think. Maybe the last entry anywhere.",
      "There is a compass on the main stair at work. Seven notches, needle snapped at the pin. They tell visitors it broke in the move. It didn't. Someone broke it so it would always point where they wanted.",
      "If you have read these in order — really in order, the way the calendar runs — then you already know how to turn the dial. Count the days, not the posts. The needle has as many notches as you need.",
      "Whoever you are: they lie about small things first. Dates. Names. A photograph that used to have a face in it.",
    ].join("\n"),
    l10n: {
      ko: {
        title: "True North Is a Rumour — 진북은 소문일 뿐",
        date: "2019년 5월 1일",
        body: [
          "아마 이 시리즈의 마지막 글이 될 것이다. 어쩌면 어디에 쓰는 글이든 마지막일지도 모른다.",
          "직장 중앙 계단에 나침반이 하나 있다. 눈금은 일곱 개, 바늘은 축에서 부러져 있다. 방문객들에게는 이사하다 깨졌다고 말한다. 그렇지 않다. 누군가 늘 자기가 원하는 쪽을 가리키게 하려고 부러뜨린 것이다.",
          "이 글들을 순서대로 읽었다면 — 정말로 순서대로, 달력이 흐르는 방향으로 — 다이얼을 어떻게 돌려야 하는지 이미 알 것이다. 글이 아니라 날짜를 세라. 바늘에는 필요한 만큼의 눈금이 있다.",
          "당신이 누구든: 그들은 작은 것부터 거짓말한다. 날짜. 이름. 한때 얼굴이 있던 사진 한 장.",
        ].join("\n"),
      },
    },
  },
  {
    slug: "kitchen-butter-and-patience",
    title: "Ada's Kitchen: Butter & Patience",
    date: "April 14, 2019",
    series: "Ada's Kitchen",
    body: [
      "Shortbread for the night shift. Cream 4 tablespoons of cold butter with sugar until your wrist complains, then flour until it stops being sticky and starts being honest.",
      "Bake until the edges go the colour of old paper. Eat at your desk. Leave no crumbs on the ledgers.",
    ].join("\n"),
    l10n: {
      ko: {
        title: "Ada's Kitchen: 버터와 인내",
        date: "2019년 4월 14일",
        body: [
          "야간 근무를 위한 쇼트브레드. 차가운 버터 4큰술에 설탕을 넣고 손목이 투덜댈 때까지 크림처럼 휘젓는다. 그다음 밀가루를 넣는다. 끈적이기를 멈추고 정직해지기 시작할 때까지.",
          "가장자리가 오래된 종이 색이 될 때까지 굽는다. 책상에서 먹는다. 장부 위에 부스러기는 남기지 않는다.",
        ].join("\n"),
      },
    },
  },
  {
    slug: "footnotes-for-a-ghost",
    title: "Footnotes for a Ghost",
    date: "April 2, 2019",
    series: "Field Notes",
    body: [
      "There is a colleague of mine who no longer has a face. Not in the literal sense. In the staff photographs, the frame where she stood is empty, as if she stepped out of it a second before the shutter.",
      "She is still at her desk every morning. She still beats everyone at that ridiculous arcade game. But on paper, she is being thinned out, one footnote at a time.",
      "I have started keeping footnotes of my own.",
    ].join("\n"),
    l10n: {
      ko: {
        title: "Footnotes for a Ghost — 유령을 위한 각주",
        date: "2019년 4월 2일",
        body: [
          "내 동료 중에 더 이상 얼굴이 없는 사람이 있다. 말 그대로의 뜻은 아니다. 직원 사진 속 그녀가 서 있던 자리가 비어 있다. 셔터가 눌리기 직전에 액자 밖으로 걸어 나간 것처럼.",
          "그녀는 지금도 매일 아침 자기 책상에 앉는다. 지금도 그 우스꽝스러운 오락실 게임에서 모두를 이긴다. 하지만 서류 위에서 그녀는 각주 하나씩, 조금씩 지워지고 있다.",
          "나도 나만의 각주를 쓰기 시작했다.",
        ].join("\n"),
      },
    },
  },
  {
    slug: "ink-that-moves",
    title: "Ink That Moves",
    date: "March 1, 2019",
    series: "Field Notes",
    body: [
      "Ink is supposed to stay where you put it. That is the whole contract.",
      "This week a founding date changed in three places and nobody blinked. The plaque in the lobby, the charter scan, the 'About' page. The old number survives only where nobody thought to look — down at the bottom of the page, in the small print, where the dust settles.",
      "Somebody got the digits backwards when they rewrote it. Or somebody left them backwards on purpose.",
    ].join("\n"),
    l10n: {
      ko: {
        title: "Ink That Moves — 움직이는 잉크",
        date: "2019년 3월 1일",
        body: [
          "잉크는 놓인 자리에 머물러야 한다. 그게 계약의 전부다.",
          "이번 주에 설립 연도가 세 군데에서 바뀌었는데 아무도 눈 하나 깜박하지 않았다. 로비의 명판, 정관 스캔본, '소개' 페이지. 옛 숫자는 아무도 들여다볼 생각을 못 한 곳에만 살아남았다 — 페이지 맨 아래, 작은 글씨 속, 먼지가 내려앉는 곳.",
          "누군가 고쳐 쓰다가 숫자를 거꾸로 적었다. 아니면 누군가 일부러 거꾸로 남겨 두었거나.",
        ].join("\n"),
      },
    },
  },
  {
    slug: "kitchen-midnight-bread",
    title: "Ada's Kitchen: Midnight Bread",
    date: "February 23, 2019",
    series: "Ada's Kitchen",
    body: [
      "No-knead loaf for people who come home too late to knead. Whisk 2 eggs into warm milk, fold in 1 cup of strong flour and a pinch of salt, and leave it under a tea towel overnight.",
      "In the morning it will have risen without anyone watching it. Most things do.",
    ].join("\n"),
    l10n: {
      ko: {
        title: "Ada's Kitchen: 한밤의 빵",
        date: "2019년 2월 23일",
        body: [
          "반죽할 기운도 없이 너무 늦게 귀가하는 사람을 위한 무반죽 빵. 따뜻한 우유에 달걀 2개를 풀고, 강력분 1컵과 소금 한 꼬집을 섞은 뒤 행주를 덮어 밤새 둔다.",
          "아침이면 아무도 지켜보지 않았는데도 부풀어 있을 것이다. 대부분의 일이 그렇다.",
        ].join("\n"),
      },
    },
  },
  {
    slug: "redacted-weather",
    title: "Redacted Weather",
    date: "February 1, 2019",
    series: "Field Notes",
    body: [
      "Today I found a weather report with a black bar through it. A weather report. Rain, apparently, was classified on the night the harbour warehouse burned.",
      "You start to see the shape of a thing by what has been cut out of it. Like a stencil. Like a photo negative.",
      "I'm going to keep writing these. In order. Somebody should keep something in order.",
    ].join("\n"),
    l10n: {
      ko: {
        title: "Redacted Weather — 지워진 날씨",
        date: "2019년 2월 1일",
        body: [
          "오늘 검은 줄이 그어진 기상 보고서를 발견했다. 기상 보고서를. 하버 창고가 불탄 그날 밤의 비는, 아무래도 기밀이었던 모양이다.",
          "무엇이 잘려 나갔는지를 보면 그것의 모양이 보이기 시작한다. 스텐실처럼. 사진 음화처럼.",
          "계속 이 글을 쓸 생각이다. 순서대로. 누군가는 무언가를 순서대로 지켜야 하니까.",
        ].join("\n"),
      },
    },
  },
  {
    slug: "kitchen-archivists-broth",
    title: "Ada's Kitchen: Archivist's Broth",
    date: "January 19, 2019",
    series: "Ada's Kitchen",
    body: [
      "My sister says I only ever eat soup out of a thermos at my desk, so here is the soup. Simmer 3 cups of water with an onion, a carrot and 1 bay leaf until the kitchen smells like somebody loves you.",
      "Salt to taste. Read something while it cooks. Not work. Never work.",
    ].join("\n"),
    l10n: {
      ko: {
        title: "Ada's Kitchen: 기록 보관인의 수프",
        date: "2019년 1월 19일",
        body: [
          "동생 말로는 내가 책상에서 보온병에 든 수프만 먹는다고 한다. 그래서, 그 수프. 물 3컵에 양파 하나, 당근 하나, 월계수 잎 1장을 넣고 부엌에서 누군가 나를 사랑하는 냄새가 날 때까지 뭉근히 끓인다.",
          "소금은 입맛대로. 끓는 동안 뭔가를 읽는다. 일 말고. 절대 일은 말고.",
        ].join("\n"),
      },
    },
  },
  {
    slug: "dead-reckoning",
    title: "Dead Reckoning",
    date: "January 2, 2019",
    series: "Field Notes",
    body: [
      "Sailors without stars used dead reckoning: you know where you started, you know how far you've gone, and you trust the arithmetic over your eyes.",
      "I'm starting a notebook. Not the kind the Institute can audit. If anything happens to me, someone will need to know where I started.",
      "First bearing: the records are moving. Second bearing: I am not imagining it.",
    ].join("\n"),
    l10n: {
      ko: {
        title: "Dead Reckoning — 추측 항법",
        date: "2019년 1월 2일",
        body: [
          "별이 없는 뱃사람들은 추측 항법을 썼다. 어디서 출발했는지 알고, 얼마나 왔는지 알면, 눈보다 계산을 믿는다.",
          "노트를 한 권 쓰기 시작한다. 연구소가 감사할 수 있는 종류가 아닌 것으로. 내게 무슨 일이 생긴다면, 누군가는 내가 어디서 출발했는지 알아야 할 테니까.",
          "첫 번째 방위: 기록이 움직이고 있다. 두 번째 방위: 내가 상상하는 게 아니다.",
        ].join("\n"),
      },
    },
  },
];

const NAV: Block = {
  type: "nav",
  links: [
    { text: "Home", href: DRIFT_HOST },
    { text: "About", href: `${DRIFT_HOST}/about` },
  ],
};

const FOOTER: Block = { type: "footer", text: "The Drift — notes from someone who reads the footnotes. Comments are closed." };

function postBlock(p: DriftPost): Block {
  return { type: "post", title: p.title, author: "A.", date: p.date, body: p.body, series: p.series };
}

function home(): SitePage {
  const blocks: Block[] = [
    NAV,
    { type: "compass" },
    { type: "heading", level: 1, text: "The Drift" },
    { type: "paragraph", text: "Field notes, small hours, and the occasional recipe. Posts appear newest first — the way the world reads, and the wrong way to read a story." },
    ...DRIFT_POSTS.map(postBlock),
    FOOTER,
  ];
  return page(DRIFT_HOST, "The Drift", "drift", blocks, {
    headComments: ["static export — minimal-ink theme"],
    bodyComments: ["two series live here. only one of them is a map."],
    tailComments: ["draft image IMG_8841 removed from header after upload — too recognisable"],
  });
}

function about(): SitePage {
  const blocks: Block[] = [
    NAV,
    { type: "compass" },
    { type: "heading", level: 1, text: "About" },
    { type: "paragraph", text: "I work with old paper for a living. This is where I write the things I can't put in the official finding aids." },
    { type: "paragraph", text: "The Field Notes are a series. Read them from the first to the last. The first letter is where every bearing begins, and distance is measured in days." },
    { type: "paragraph", text: "The kitchen posts are just for my sister, who worries I don't eat." },
    FOOTER,
  ];
  return page(`${DRIFT_HOST}/about`, "About — The Drift", "drift", blocks);
}

function post(slug: string): SitePage | null {
  const p = DRIFT_POSTS.find((x) => x.slug === slug);
  if (!p) return null;
  const blocks: Block[] = [NAV, postBlock(p), { type: "link", text: "← All posts", href: DRIFT_HOST }, FOOTER];
  return page(`${DRIFT_HOST}/post/${p.slug}`, `${p.title} — The Drift`, "drift", blocks, {
    meta: { "article:published_time": p.date, "article:section": p.series },
  });
}

export function resolveDrift(path: string, _progress: RoomProgress, _loc: Locale): SitePage | null {
  if (path === "") return home();
  if (path === "/about") return about();
  const m = path.match(/^\/post\/([a-z0-9-]+)$/);
  if (m) return post(m[1]);
  return null;
}
