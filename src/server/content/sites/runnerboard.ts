import "server-only";
import { pick, type Locale } from "@/i18n/config";
import type { Block, RoomProgress, SitePage } from "@/lib/types";
import { page } from "./source";

export const RUNNERBOARD_HOST = "runnerboard.net";

export interface ForumPost {
  author: string;
  date: string;
  time: string; // HH:MM
  body: string;
  /** Translations of date and body. Author and time never change (the timestamps are the A1Z26 trail). */
  l10n: Record<Exclude<Locale, "en">, { date: string; body: string }>;
}

type X = ReturnType<typeof pick>;

/** Real trail: compass_needle (LO ST PA WS). Decoy: needle_compass (TR AP DO OR). */
export const FORUM_THREADS: { title: string; l10n: Record<Exclude<Locale, "en">, { title: string }>; posts: ForumPost[] }[] = [
  {
    title: "Circuit Runner '94 — all-time high score thread",
    l10n: { ko: { title: "Circuit Runner '94 — 역대 최고 점수 스레드" }, "zh-TW": { title: "Circuit Runner '94 — 歷代最高分討論串" } },
    posts: [
      { author: "pixel_marta", date: "Sep 29", time: "09:42", body: "Monthly reminder that the top of the board hasn't moved in five years. W.OKAFOR, 2,418,770. Nobody has come within a hundred thousand.",
        l10n: { ko: { date: "9월 29일", body: "월례 공지: 랭킹 1위 5년째 그대로임. W.OKAFOR, 2,418,770. 10만 점 차이 안으로 들어온 사람도 없음." }, "zh-TW": { date: "9月29日", body: "每月提醒：排行榜第一名已經五年沒動了。W.OKAFOR，2,418,770。沒有人追到十萬分以內。" } },
      },
      { author: "compass_needle", date: "Sep 30", time: "12:15", body: "She's earned it. Some people know where every wall is before the maze even loads. Ask her how and she'll just say she reads the level like a record.",
        l10n: { ko: { date: "9월 30일", body: "그럴 만하죠. 미로 로딩되기도 전에 벽이 어디 있는지 다 아는 사람들이 있어요. 어떻게 하냐고 물어보면 그냥 스테이지를 기록 읽듯이 읽는다고 할걸요." }, "zh-TW": { date: "9月30日", body: "她實至名歸。有些人在迷宮還沒載入前就知道每道牆在哪。問她怎麼做到的，她只會說她讀關卡就像讀紀錄一樣。" } },
      },
      { author: "turbo_gus", date: "Sep 30", time: "14:07", body: "Has anyone actually met W.OKAFOR? I'm starting to think it's a cabinet bug.",
        l10n: { ko: { date: "9월 30일", body: "W.OKAFOR 실제로 만나 본 사람 있음? 슬슬 기체 버그 아닌가 싶은데ㅋㅋ" }, "zh-TW": { date: "9月30日", body: "有人真的見過 W.OKAFOR 嗎？我開始覺得那是機台 bug 了XD" } },
      },
      { author: "needle_compass", date: "Oct 1", time: "20:18", body: "Don't bother with her. If you're looking for answers, follow ME. I'll leave the trail in plain sight.",
        l10n: { ko: { date: "10월 1일", body: "그 사람은 신경 꺼요. 답을 찾는 거면 나를 따라와요. 흔적은 눈에 잘 띄게 남겨 둘 테니까." }, "zh-TW": { date: "10月1日", body: "別管她了。想找答案就跟著我。我會把線索留在最顯眼的地方。" } },
      },
      { author: "pixel_marta", date: "Oct 1", time: "21:50", body: "She's real. She just doesn't post anymore. Weird thing — her avatar went blank last month. Like someone scrubbed it.",
        l10n: { ko: { date: "10월 1일", body: "실존 인물 맞음. 요즘 글을 안 올릴 뿐. 근데 이상한 게, 지난달에 프사가 갑자기 빈칸이 됨. 누가 싹 지운 것처럼." }, "zh-TW": { date: "10月1日", body: "她是真人啦，只是不再發文了。怪的是，她的頭貼上個月突然變空白。像被誰刷掉一樣。" } },
      },
    ],
  },
  {
    title: "Off-topic: things that go missing",
    l10n: { ko: { title: "잡담: 사라지는 것들" }, "zh-TW": { title: "閒聊：會消失的東西" } },
    posts: [
      { author: "lagfox", date: "Oct 2", time: "08:33", body: "My third cartridge of Circuit Runner this year, gone from my car. Who steals a cartridge?",
        l10n: { ko: { date: "10월 2일", body: "올해만 세 번째 Circuit Runner 카트리지 도난당함, 차에서. 대체 누가 카트리지를 훔쳐감?" }, "zh-TW": { date: "10月2日", body: "今年第三片 Circuit Runner 卡匣從我車上不見了。誰會偷卡匣啊？" } },
      },
      { author: "compass_needle", date: "Oct 2", time: "19:20", body: "Not everything that goes missing is stolen. Some things leave on purpose. Some things are hiding in plain sight, waiting for the right person to ask.",
        l10n: { ko: { date: "10월 2일", body: "사라진 게 다 도둑맞은 건 아니에요. 어떤 건 스스로 떠나요. 어떤 건 버젓이 보이는 곳에 숨어서, 제대로 물어봐 줄 사람을 기다리고 있죠." }, "zh-TW": { date: "10月2日", body: "不是所有消失的東西都是被偷的。有些是自己選擇離開。有些就藏在眼前，等著對的人來問。" } },
      },
      { author: "needle_compass", date: "Oct 3", time: "01:16", body: "Things go missing because people ask too many questions. Stick with me and I'll show you where they all end up.",
        l10n: { ko: { date: "10월 3일", body: "사람들이 질문을 너무 많이 하니까 뭔가가 사라지는 거예요. 나만 따라와요. 다 어디로 가는지 보여줄게요." }, "zh-TW": { date: "10月3日", body: "東西會消失，是因為有人問太多問題。跟著我，我帶你看它們最後都去了哪。" } },
      },
      { author: "turbo_gus", date: "Oct 3", time: "10:05", body: "This thread got dark fast.",
        l10n: { ko: { date: "10월 3일", body: "스레드 분위기 갑자기 왜 이럼;;" }, "zh-TW": { date: "10月3日", body: "這串怎麼突然變這麼陰暗…" } },
      },
    ],
  },
  {
    title: "Arcade cabinet restoration log (pics!)",
    l10n: { ko: { title: "오락실 기체 복원 일지 (사진 있음!)" }, "zh-TW": { title: "大型機台修復日誌（有圖！）" } },
    posts: [
      { author: "solder_queen", date: "Oct 3", time: "11:48", body: "New marquee on the Runner cabinet. Took the old one down and found someone had scratched a little compass into the back panel. Seven notches. Broken needle. Creepy or cute?",
        l10n: { ko: { date: "10월 3일", body: "Runner 기체에 새 마키 달았어요. 옛날 거 떼어 보니까 누가 뒷판에 작은 나침반을 긁어 놨더라고요. 눈금 일곱 개. 부러진 바늘. 소름인가요 귀여운 건가요?" }, "zh-TW": { date: "10月3日", body: "幫 Runner 機台換了新的招牌燈箱。拆下舊的時候發現有人在背板刻了一個小指南針。七道刻痕。斷掉的指針。這算毛骨悚然還是可愛？" } },
      },
      { author: "compass_needle", date: "Oct 4", time: "16:01", body: "Cute. Leave it. Somebody wanted to be remembered by whoever opened it up. Also — off topic — has anyone seen Biscuit? Little tabby, white socks, last seen near Harbour Street. She belongs to a friend who can't look for her right now.",
        l10n: { ko: { date: "10월 4일", body: "귀엽네요. 그대로 두세요. 누군가 그걸 열어 볼 사람한테 기억되고 싶었던 거예요. 그리고 — 딴 얘기지만 — Biscuit 본 사람 있어요? 작은 태비고, 발이 하얘요. 하버 스트리트(Harbour Street) 근처에서 마지막으로 봤대요. 지금 직접 찾으러 다닐 수 없는 친구의 고양이예요." }, "zh-TW": { date: "10月4日", body: "可愛。留著吧。有人希望被打開它的人記住。還有——離題一下——有人看到 Biscuit 嗎？小小的虎斑貓，腳是白的，最後在港灣街（Harbour Street）附近出現。她是一個朋友的貓，那個朋友現在沒辦法親自去找。" } },
      },
      { author: "needle_compass", date: "Oct 4", time: "04:15", body: "Forget the cat. I've got something better for you. Read my timestamps. That's where the door is.",
        l10n: { ko: { date: "10월 4일", body: "고양이는 잊어요. 더 좋은 걸 줄게요. 내 글 시간을 읽어요. 문은 거기 있어요." }, "zh-TW": { date: "10月4日", body: "忘了那隻貓吧。我有更好的東西給你。讀我的發文時間。門就在那裡。" } },
      },
      { author: "solder_queen", date: "Oct 4", time: "18:22", body: "@compass_needle I'll keep an eye out for Biscuit. Post on the pet board, they're good.",
        l10n: { ko: { date: "10월 4일", body: "@compass_needle Biscuit 보이면 알려 드릴게요. 반려동물 게시판에도 올려 보세요, 거기 잘 찾아줘요." }, "zh-TW": { date: "10月4日", body: "@compass_needle 我會幫忙留意 Biscuit。去寵物版發文吧，那邊很給力。" } },
      },
    ],
  },
  {
    title: "Speedrun routing: level 7 shortcut?",
    l10n: { ko: { title: "스피드런 루트: 7스테이지 지름길?" }, "zh-TW": { title: "速通路線：第 7 關有捷徑？" } },
    posts: [
      { author: "lagfox", date: "Oct 5", time: "13:37", body: "There's a gap in the level 7 wall if you hug the left side. Saves four seconds. Can't find it on any map.",
        l10n: { ko: { date: "10월 5일", body: "7스테이지에서 왼쪽 벽에 딱 붙어 가면 벽에 틈이 있음. 4초 단축. 근데 어느 맵에도 안 나옴." }, "zh-TW": { date: "10月5日", body: "第 7 關貼著左邊走，牆上有個縫。可以省四秒。但哪張地圖上都找不到。" } },
      },
      { author: "needle_compass", date: "Oct 5", time: "15:18", body: "Every shortcut is a door if you know how to read it. Mine's the only one that opens.",
        l10n: { ko: { date: "10월 5일", body: "읽을 줄만 알면 모든 지름길은 문이에요. 열리는 건 내 것뿐이고." }, "zh-TW": { date: "10月5日", body: "只要你懂得怎麼讀，每條捷徑都是一扇門。能打開的只有我這扇。" } },
      },
      { author: "compass_needle", date: "Oct 6", time: "23:19", body: "There's no shortcut on seven. The map was redrawn so you'd think there was. Trust the needle that points true, not the one that points back at you. If you're reading my posts, read the clock on them.",
        l10n: { ko: { date: "10월 6일", body: "7스테이지에 지름길 없어요. 있다고 믿게 하려고 맵을 다시 그린 거예요. 진짜 방향을 가리키는 바늘을 믿어요, 당신 쪽을 되돌아 가리키는 바늘 말고. 내 글을 읽고 있다면, 글에 찍힌 시계를 읽어요." }, "zh-TW": { date: "10月6日", body: "第七關沒有捷徑。地圖是被重畫過的，好讓你以為有。相信指向真實方向的那根指針，不是回頭指著你的那根。如果你在讀我的文，就讀文章上的時鐘。" } },
      },
      { author: "turbo_gus", date: "Oct 6", time: "23:58", body: "Why do you two have the same username backwards",
        l10n: { ko: { date: "10월 6일", body: "근데 둘이 왜 닉네임이 서로 거꾸로임" }, "zh-TW": { date: "10月6日", body: "為什麼你們兩個的帳號剛好是互相倒過來的" } },
      },
    ],
  },
];

const nav = (x: X): Block => ({
  type: "nav",
  links: [
    { text: x({ en: "Forum", ko: "포럼", "zh-TW": "論壇" }), href: RUNNERBOARD_HOST },
    { text: x({ en: "High Scores", ko: "최고 점수", "zh-TW": "最高分" }), href: `${RUNNERBOARD_HOST}/scores` },
  ],
});

const footer = (x: X): Block => ({
  type: "footer",
  text: x({
    en: "RunnerBoard — fan forum for Circuit Runner '94. Not affiliated with anyone who'd sue us. All times local.",
    ko: "RunnerBoard — Circuit Runner '94 팬 포럼. 우리를 고소할 만한 누구와도 무관함. 모든 시간은 현지 시각.",
    "zh-TW": "RunnerBoard — Circuit Runner '94 粉絲論壇。與任何可能告我們的人都無關。所有時間皆為當地時間。",
  }),
});

function home(loc: Locale): SitePage {
  const x = pick(loc);
  const blocks: Block[] = [
    nav(x),
    { type: "compass" },
    { type: "heading", level: 1, text: "RunnerBoard" },
    {
      type: "paragraph",
      text: x({
        en: "INSERT COIN. Discuss routes, cabinets, and the eternal question of who W.OKAFOR really is.",
        ko: "INSERT COIN. 루트, 기체, 그리고 W.OKAFOR가 대체 누구냐는 영원한 질문을 떠드는 곳.",
        "zh-TW": "INSERT COIN。聊路線、聊機台，還有那個永恆的問題：W.OKAFOR 到底是誰。",
      }),
    },
  ];
  const realMeta = x({ en: "post-meta: user#0007 joined 2019", ko: "post-meta: user#0007 가입 2019", "zh-TW": "post-meta: user#0007 註冊於 2019" });
  const sockMeta = x({
    en: "post-meta: user#1987x joined last week — ip: 10.19.78.4 (meridian-inst range?)",
    ko: "post-meta: user#1987x 지난주 가입 — ip: 10.19.78.4 (meridian-inst 대역?)",
    "zh-TW": "post-meta: user#1987x 上週註冊 — ip: 10.19.78.4（meridian-inst 網段？）",
  });
  const inline: Record<number, string[]> = {};
  for (const t of FORUM_THREADS) {
    const title = loc === "en" ? t.title : t.l10n[loc].title;
    blocks.push({ type: "heading", level: 2, text: title });
    for (const p of t.posts) {
      const { date, body } = loc === "en" ? p : p.l10n[loc];
      if (p.author === "compass_needle") inline[blocks.length] = [realMeta];
      if (p.author === "needle_compass") inline[blocks.length] = [sockMeta];
      blocks.push({ type: "post", title: `Re: ${title}`, author: p.author, date, time: p.time, body });
    }
  }
  blocks.push(footer(x));
  const title = x({ en: "RunnerBoard — Circuit Runner '94 Forum", ko: "RunnerBoard — Circuit Runner '94 포럼", "zh-TW": "RunnerBoard — Circuit Runner '94 論壇" });
  return page(RUNNERBOARD_HOST, title, "runnerboard", blocks, {
    headComments: [x({ en: "phpBoard 2.0.4 (patched, mostly)", ko: "phpBoard 2.0.4 (패치함, 대충은)", "zh-TW": "phpBoard 2.0.4（有打補丁，大致上）" })],
    inlineComments: inline,
    tailComments: [
      x({
        en: "mods: two accounts with mirrored names. one of them is a sock. figure out which before banning.",
        ko: "운영진: 이름이 거울처럼 뒤집힌 계정 두 개. 하나는 부계정임. 밴하기 전에 어느 쪽인지 알아낼 것.",
        "zh-TW": "版主：有兩個名字互為鏡像的帳號。其中一個是分身。封鎖之前先搞清楚是哪一個。",
      }),
    ],
  });
}

function scores(loc: Locale): SitePage {
  const x = pick(loc);
  const blocks: Block[] = [
    nav(x),
    { type: "heading", level: 1, text: x({ en: "Circuit Runner '94 — Verified High Scores", ko: "Circuit Runner '94 — 공인 최고 점수", "zh-TW": "Circuit Runner '94 — 官方認證最高分" }) },
    {
      type: "list",
      items: [
        "1. W.OKAFOR — 2,418,770",
        "2. PIXEL_MARTA — 2,301,115",
        "3. SOLDER_QUEEN — 2,288,040",
        "4. LAGFOX — 2,140,900",
        "5. TURBO_GUS — 1,998,600",
      ],
    },
    {
      type: "paragraph",
      text: x({ en: "W.OKAFOR's profile picture is currently unavailable.", ko: "W.OKAFOR의 프로필 사진은 현재 표시할 수 없습니다.", "zh-TW": "W.OKAFOR 的大頭貼目前無法顯示。" }),
    },
    footer(x),
  ];
  return page(`${RUNNERBOARD_HOST}/scores`, x({ en: "High Scores — RunnerBoard", ko: "최고 점수 — RunnerBoard", "zh-TW": "最高分 — RunnerBoard" }), "runnerboard", blocks);
}

export function resolveRunnerboard(path: string, _progress: RoomProgress, loc: Locale): SitePage | null {
  if (path === "") return home(loc);
  if (path === "/scores") return scores(loc);
  return null;
}
