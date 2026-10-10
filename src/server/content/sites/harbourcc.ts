import "server-only";
import { pick, type Locale } from "@/i18n/config";
import type { Block, RoomProgress, SitePage } from "@/lib/types";
import { BINARY_PRACTICE_WORD, toBinary5 } from "../answers";
import { page } from "./source";

export const HARBOURCC_HOST = "harbourcc.edu";

type X = ReturnType<typeof pick>;

const footer = (x: X): Block => ({
  type: "footer",
  text: x({
    en: "Harbour Community College · Evening Studies · Doors open 6pm, coffee is not guaranteed.",
    ko: "하버 커뮤니티 칼리지 · 야간 과정 · 저녁 6시 개문, 커피는 장담 못 합니다.",
    "zh-TW": "港灣社區學院 · 夜間部 · 晚上 6 點開門，咖啡不保證有。",
  }),
});

const nav = (x: X): Block => ({
  type: "nav",
  links: [
    { text: x({ en: "Home", ko: "홈", "zh-TW": "首頁" }), href: HARBOURCC_HOST },
    { text: "CS 110", href: `${HARBOURCC_HOST}/cs110` },
    { text: x({ en: "Week 3: Binary", ko: "3주차: 이진법", "zh-TW": "第 3 週：二進位" }), href: `${HARBOURCC_HOST}/cs110/binary` },
  ],
});

function home(x: X): SitePage {
  const blocks: Block[] = [
    nav(x),
    { type: "heading", level: 1, text: x({ en: "Harbour Community College", ko: "하버 커뮤니티 칼리지", "zh-TW": "港灣社區學院" }) },
    { type: "paragraph", text: x({ en: "Evening Studies. Learn something after work.", ko: "야간 과정. 퇴근 후에 무언가를 배워 보세요.", "zh-TW": "夜間部。下班後，學點新東西。" }) },
    { type: "heading", level: 2, text: x({ en: "This term's evening courses", ko: "이번 학기 야간 강좌", "zh-TW": "本學期夜間課程" }) },
    {
      type: "list",
      items: [
        x({ en: "CS 110: How Computers Count (Tuesdays, W. Okafor)", ko: "CS 110: 컴퓨터는 어떻게 셈을 하나 (화요일, W. 오카포(Okafor))", "zh-TW": "CS 110：電腦怎麼數數（週二，W. 奧卡佛（Okafor））" }),
        x({ en: "HIST 204: The Harbour Before the Fire (Wednesdays, staff)", ko: "HIST 204: 대화재 이전의 항구 (수요일, 교직원)", "zh-TW": "HIST 204：大火之前的港灣（週三，校內教師）" }),
        x({ en: "ART 101: Drawing From Life (Thursdays, staff)", ko: "ART 101: 인물 드로잉 (목요일, 교직원)", "zh-TW": "ART 101：人物寫生（週四，校內教師）" }),
      ],
    },
    { type: "link", text: x({ en: "CS 110 course page →", ko: "CS 110 강좌 페이지 →", "zh-TW": "CS 110 課程頁面 →" }), href: `${HARBOURCC_HOST}/cs110` },
    {
      type: "notice",
      tone: "info",
      text: x({
        en: "HIST 204 is cancelled this term at the request of a community partner.",
        ko: "HIST 204는 지역 협력 기관의 요청으로 이번 학기에 폐강되었습니다.",
        "zh-TW": "應社區合作夥伴要求，HIST 204 本學期停開。",
      }),
    },
    footer(x),
  ];
  return page(HARBOURCC_HOST, x({ en: "Harbour Community College", ko: "하버 커뮤니티 칼리지", "zh-TW": "港灣社區學院" }), "harbourcc", blocks, {
    headComments: [
      x({
        en: "site maintained by the Evening Studies office. please stop emailing us about the parking.",
        ko: "야간 과정 사무실에서 관리하는 사이트입니다. 주차 문제로 그만 이메일 보내 주세요.",
        "zh-TW": "本網站由夜間部辦公室維護。請不要再寄電子郵件來問停車的事了。",
      }),
    ],
  });
}

function course(x: X): SitePage {
  const blocks: Block[] = [
    nav(x),
    { type: "heading", level: 1, text: x({ en: "CS 110: How Computers Count", ko: "CS 110: 컴퓨터는 어떻게 셈을 하나", "zh-TW": "CS 110：電腦怎麼數數" }) },
    {
      type: "paragraph",
      text: x({
        en: "Tuesdays, 6:30 to 8:30pm, Room 12. Instructor: W. Okafor (by day, a systems archivist; by night, this).",
        ko: "매주 화요일 저녁 6:30~8:30, 12호실. 강사: W. 오카포(Okafor) (낮에는 시스템 기록연구사, 밤에는 이 일).",
        "zh-TW": "每週二晚上 6:30 至 8:30，12 號教室。講師：W. 奧卡佛（Okafor）（白天是系統檔案研究員，晚上就是這個）。",
      }),
    },
    { type: "heading", level: 2, text: x({ en: "Lessons", ko: "수업", "zh-TW": "課程" }) },
    {
      type: "list",
      items: [
        x({ en: "Week 1: What is a computer, really? (handout only)", ko: "1주차: 컴퓨터란 대체 뭘까? (유인물만)", "zh-TW": "第 1 週：電腦到底是什麼？（僅講義）" }),
        x({ en: "Week 2: Switches, on and off (handout only)", ko: "2주차: 스위치, 켜짐과 꺼짐 (유인물만)", "zh-TW": "第 2 週：開關，開與關（僅講義）" }),
        x({ en: "Week 3: Binary, counting with two fingers (online lesson below)", ko: "3주차: 이진법, 손가락 두 개로 세기 (아래 온라인 수업)", "zh-TW": "第 3 週：二進位，用兩根手指數數（線上課程見下方）" }),
        x({ en: "Week 4: Passwords, and why yours is bad (coming soon)", ko: "4주차: 비밀번호, 그리고 당신 비밀번호가 허술한 이유 (준비 중)", "zh-TW": "第 4 週：密碼，以及你的密碼為什麼很爛（即將推出）" }),
      ],
    },
    { type: "link", text: x({ en: "Week 3 lesson: Binary →", ko: "3주차 수업: 이진법 →", "zh-TW": "第 3 週課程：二進位 →" }), href: `${HARBOURCC_HOST}/cs110/binary` },
    {
      type: "paragraph",
      text: x({
        en: "Pass the Week 3 practice quiz and you can install the class Binary translator on your own machine.",
        ko: "3주차 연습 퀴즈를 통과하면 수업용 이진수 번역기를 내 컴퓨터에 설치할 수 있습니다.",
        "zh-TW": "通過第 3 週練習測驗，就能在自己的電腦上安裝課堂用的二進位翻譯器。",
      }),
    },
    footer(x),
  ];
  return page(`${HARBOURCC_HOST}/cs110`, x({ en: "CS 110: How Computers Count", ko: "CS 110: 컴퓨터는 어떻게 셈을 하나", "zh-TW": "CS 110：電腦怎麼數數" }), "harbourcc", blocks, {
    bodyComments: [
      x({
        en: "attendance this term: 4. one of them is Ada, and she keeps asking about checksums. — W.",
        ko: "이번 학기 수강생: 4명. 그중 하나가 에이다인데, 자꾸 체크섬 얘기를 묻는다. — W.",
        "zh-TW": "本學期出席人數：4。其中一個是艾達，她一直追問校驗和的事。——W.",
      }),
    ],
  });
}

const SHEET_ROWS: string[][] = Array.from({ length: 26 }, (_, i) => [
  String.fromCharCode(65 + i),
  String(i + 1),
  (i + 1).toString(2).padStart(5, "0"),
]);

function lesson(x: X, progress: RoomProgress): SitePage {
  const passed = progress.solved.includes("binary-lesson");
  const blocks: Block[] = [
    nav(x),
    { type: "heading", level: 1, text: x({ en: "Week 3: Binary", ko: "3주차: 이진법", "zh-TW": "第 3 週：二進位" }) },
    {
      type: "paragraph",
      text: x({
        en: "Computers only have two fingers: a switch is either off (0) or on (1). So instead of counting in tens, they count in twos.",
        ko: "컴퓨터에게는 손가락이 두 개뿐입니다. 스위치는 꺼짐(0) 아니면 켜짐(1)이죠. 그래서 컴퓨터는 10씩이 아니라 2씩 셉니다.",
        "zh-TW": "電腦只有兩根手指：開關不是關（0）就是開（1）。所以電腦不是十個十個數，而是兩個兩個數。",
      }),
    },
    { type: "heading", level: 2, text: x({ en: "Place values", ko: "자릿값", "zh-TW": "位值" }) },
    {
      type: "paragraph",
      text: x({
        en: "In our class code every letter is five switches. From left to right the switches are worth 16, 8, 4, 2 and 1. Add up the values of the switches that are on. That number is the letter: A is 1, B is 2, all the way to Z at 26.",
        ko: "우리 수업 암호에서는 글자 하나가 스위치 다섯 개입니다. 왼쪽부터 각 스위치의 값은 16, 8, 4, 2, 1입니다. 켜진 스위치의 값을 모두 더하세요. 그 숫자가 곧 글자입니다. A는 1, B는 2, 그렇게 Z는 26까지 갑니다.",
        "zh-TW": "在我們的課堂密碼裡，每個字母由五個開關組成。由左到右，各開關的值分別是 16, 8, 4, 2, 1。把開著的開關的值加起來，那個數字就是字母：A 是 1，B 是 2，一路到 Z 是 26。",
      }),
    },
    {
      type: "paragraph",
      text: x({
        en: "Worked example: 01000. Only the 8 switch is on, so it's 8, and the 8th letter is H. Another: 10011 is 16 + 2 + 1 = 19, which is S.",
        ko: "예시: 01000. 8 스위치만 켜져 있으니 8이고, 여덟 번째 글자는 H입니다. 하나 더: 10011은 16 + 2 + 1 = 19, 즉 S입니다.",
        "zh-TW": "範例：01000。只有 8 那個開關是開的，所以是 8，第 8 個字母是 H。再一個：10011 是 16 + 2 + 1 = 19，也就是 S。",
      }),
    },
    { type: "heading", level: 2, text: x({ en: "Try it", ko: "직접 해 보기", "zh-TW": "動手試試" }) },
    { type: "paragraph", text: x({ en: "Tap the switches to turn them on and off.", ko: "스위치를 탭해서 켜고 꺼 보세요.", "zh-TW": "點一下開關，把它們打開或關上。" }) },
    { type: "bits" },
    { type: "heading", level: 2, text: x({ en: "Decoding sheet", ko: "해독표", "zh-TW": "解碼表" }) },
    {
      type: "table",
      caption: x({ en: "Class code: one letter, five bits", ko: "수업 암호: 글자 하나에 5비트", "zh-TW": "課堂密碼：一個字母，五個位元" }),
      columns: [x({ en: "Letter", ko: "글자", "zh-TW": "字母" }), x({ en: "Number", ko: "숫자", "zh-TW": "數字" }), x({ en: "Binary", ko: "이진수", "zh-TW": "二進位" })],
      rows: SHEET_ROWS,
    },
    { type: "heading", level: 2, text: x({ en: "Practice quiz", ko: "연습 퀴즈", "zh-TW": "練習測驗" }) },
    passed
      ? {
          type: "notice",
          tone: "success",
          text: x({
            en: "Quiz passed. The class Binary translator is installed in your Decoder.",
            ko: "퀴즈 통과. 수업용 이진수 번역기가 해독기에 설치되었습니다.",
            "zh-TW": "測驗通過。課堂用的二進位翻譯器已安裝到你的解碼器。",
          }),
        }
      : {
          type: "paragraph",
          text: x({
            en: "Decode this word with the sheet, then type it in. Pass and the class Binary translator installs on your machine.",
            ko: "해독표로 이 단어를 풀어서 입력하세요. 통과하면 수업용 이진수 번역기가 내 컴퓨터에 설치됩니다.",
            "zh-TW": "用解碼表解出這個單字，然後輸入。通過後，課堂用的二進位翻譯器就會安裝到你的電腦上。",
          }),
        },
    { type: "form", form: "binary-quiz", prompt: toBinary5(BINARY_PRACTICE_WORD) },
    footer(x),
  ];
  return page(`${HARBOURCC_HOST}/cs110/binary`, x({ en: "Week 3: Binary", ko: "3주차: 이진법", "zh-TW": "第 3 週：二進位" }), "harbourcc", blocks, {
    bodyComments: [
      x({
        en: "yes, real computers use 8 bits and a different table. this is a class, not a job. — W.O.",
        ko: "네, 실제 컴퓨터는 8비트에 다른 표를 씁니다. 이건 수업이지 실무가 아니에요. — W.O.",
        "zh-TW": "對，真正的電腦用的是 8 位元和另一張表。這是上課，不是上班。——W.O.",
      }),
    ],
  });
}

export function resolveHarbourcc(path: string, progress: RoomProgress, loc: Locale): SitePage | null {
  const x = pick(loc);
  if (path === "") return home(x);
  if (path === "/cs110") return course(x);
  if (path === "/cs110/binary") return lesson(x, progress);
  return null;
}
