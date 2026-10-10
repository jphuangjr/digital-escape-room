import "server-only";
import { pick, type Locale } from "@/i18n/config";
import type { Block, RoomProgress, SitePage } from "@/lib/types";
import { page } from "./source";

export const MERIDIAN_HOST = "meridian-inst.net";

type X = ReturnType<typeof pick>;

const nav = (x: X): Block => ({
  type: "nav",
  links: [
    { text: x({ en: "Home", ko: "홈", "zh-TW": "首頁" }), href: MERIDIAN_HOST },
    { text: x({ en: "About", ko: "연구소 소개", "zh-TW": "關於本院" }), href: `${MERIDIAN_HOST}/about` },
    { text: x({ en: "Staff", ko: "직원", "zh-TW": "職員" }), href: `${MERIDIAN_HOST}/staff` },
    { text: x({ en: "Collections", ko: "소장품", "zh-TW": "館藏" }), href: `${MERIDIAN_HOST}/collections` },
    { text: x({ en: "Staff portal", ko: "직원 포털", "zh-TW": "職員入口" }), href: "intranet.meridian-inst.net" },
  ],
});

const footer = (x: X): Block => ({
  type: "footer",
  text: x({
    en: "© since 1978. The Meridian Institute for Historical Continuity. All records verified. All records final.",
    ko: "© since 1978. 메리디언 역사연속성 연구소. 모든 기록은 검증되었습니다. 모든 기록은 확정되었습니다.",
    "zh-TW": "© since 1978。子午歷史連續性研究院。所有紀錄皆已查核。所有紀錄皆為定本。",
  }),
});

function home(x: X): SitePage {
  const blocks: Block[] = [
    nav(x),
    { type: "compass" },
    { type: "heading", level: 1, text: x({ en: "The Meridian Institute", ko: "메리디언 연구소", "zh-TW": "子午研究院" }) },
    {
      type: "paragraph",
      text: x({
        en: "Keepers of the record. Guardians of continuity. Since our founding, the Meridian Institute has preserved the documents, photographs and testimonies that tell this city who it is.",
        ko: "기록의 수호자, 연속성의 파수꾼. 메리디언 연구소는 설립 이래 이 도시가 어떤 곳인지 말해 주는 문서와 사진, 증언을 보존해 왔습니다.",
        "zh-TW": "紀錄的守護者，連續性的看守人。子午研究院自創立以來，始終保存著那些告訴這座城市「你是誰」的文件、照片與證詞。",
      }),
    },
    {
      type: "notice",
      tone: "info",
      text: x({
        en: "Notice: the Reading Room is closed until further notice while our archive migration is finalised. We thank patrons for their patience.",
        ko: "안내: 아카이브 이전 작업이 마무리될 때까지 열람실을 별도 공지 시까지 휴관합니다. 이용자 여러분의 양해에 감사드립니다.",
        "zh-TW": "公告：檔案遷移作業完成前，閱覽室暫停開放，恢復日期另行公告。感謝各位讀者耐心配合。",
      }),
    },
    { type: "heading", level: 2, text: x({ en: "Our Mission", ko: "우리의 사명", "zh-TW": "我們的使命" }) },
    {
      type: "paragraph",
      text: x({
        en: "History is not what happened. History is what is kept. Every ledger, every deed, every faded photograph passes through our hands before it is entrusted to the public memory. We take that responsibility seriously. We take it personally.",
        ko: "역사는 일어난 일이 아닙니다. 역사는 보관된 것입니다. 모든 장부와 증서, 빛바랜 사진 한 장까지도 공공의 기억에 맡겨지기 전에 반드시 저희 손을 거칩니다. 저희는 그 책임을 무겁게 여깁니다. 그리고 그 책임을 개인적인 일로 받아들입니다.",
        "zh-TW": "歷史不是發生過的事。歷史是被保存下來的事。每一本帳冊、每一份契據、每一張褪色的照片，在交付公眾記憶之前，都必須經過我們的手。我們嚴肅看待這份責任，也把它當成自己的事。",
      }),
    },
    { type: "heading", level: 2, text: x({ en: "From the Director", ko: "소장 인사말", "zh-TW": "所長的話" }) },
    {
      type: "paragraph",
      text: x({
        en: "\"A city without a reliable past cannot have a stable future. The Institute exists so that no citizen ever has to wonder which version of events is true.\" — Director H. Calloway",
        ko: "\"믿을 수 있는 과거가 없는 도시에는 안정된 미래도 없습니다. 연구소는 어느 시민도 어떤 이야기가 진실인지 고민할 필요가 없도록 존재합니다.\" — 소장 H. 캘러웨이",
        "zh-TW": "「一座沒有可靠過去的城市，不可能擁有穩定的未來。本院存在的意義，就是讓每一位市民永遠不必懷疑哪個版本才是真相。」——卡洛威所長（H. Calloway）",
      }),
    },
    { type: "heading", level: 2, text: x({ en: "Recent Announcements", ko: "최근 공지", "zh-TW": "近期公告" }) },
    {
      type: "list",
      items: [
        x({
          en: "Archivist Dr. Ada Voss is on extended leave. Enquiries regarding the Harbour Ledgers should be directed to the Office of the Director.",
          ko: "기록연구사 에이다 보스(Ada Voss) 박사는 장기 휴가 중입니다. 하버 장부 관련 문의는 소장실로 해 주십시오.",
          "zh-TW": "檔案研究員艾達・佛斯博士（Dr. Ada Voss）目前長期休假。有關港灣帳冊之詢問，請洽所長辦公室。",
        }),
        x({
          en: "The 2019 digitisation programme is now complete. Physical originals have been retired.",
          ko: "2019년 디지털화 사업이 완료되었습니다. 실물 원본은 폐기되었습니다.",
          "zh-TW": "2019 年數位化計畫已全數完成。實體原件已汰除。",
        }),
        x({
          en: "Our compass emblem has been restored to the main stair. Please do not touch the needle.",
          ko: "나침반 문장이 중앙 계단에 다시 설치되었습니다. 바늘을 만지지 마십시오.",
          "zh-TW": "本院的指南針徽章已重新安置於主樓梯。請勿觸摸指針。",
        }),
      ],
    },
    { type: "link", text: x({ en: "Meet the people who keep the record →", ko: "기록을 지키는 사람들 →", "zh-TW": "認識守護紀錄的人們 →" }), href: `${MERIDIAN_HOST}/staff` },
    footer(x),
  ];
  return page(MERIDIAN_HOST, x({ en: "Meridian Institute — Keepers of the Record", ko: "메리디언 연구소 — 기록의 수호자", "zh-TW": "子午研究院 — 紀錄的守護者" }), "meridian", blocks, {
    headComments: [x({ en: "Meridian CMS v4.2 — template: civic-classic", ko: "Meridian CMS v4.2 — 템플릿: civic-classic", "zh-TW": "Meridian CMS v4.2 — 樣板：civic-classic" })],
    meta: {
      description: x({ en: "The Meridian Institute for Historical Continuity", ko: "메리디언 역사연속성 연구소", "zh-TW": "子午歷史連續性研究院" }),
      generator: "Meridian CMS 4.2",
    },
    inlineComments: {
      1: [x({ en: "emblem: seven notches, needle intentionally unrepaired per Director", ko: "문장: 눈금 일곱 개. 소장 지시로 바늘은 일부러 수리하지 않음", "zh-TW": "徽章：七道刻痕。依所長指示，指針刻意不予修復" })],
      4: [x({ en: "archive migration complete: see /vault-2019", ko: "아카이브 이전 완료: /vault-2019 참조", "zh-TW": "檔案遷移完成：見 /vault-2019" })],
    },
    tailComments: [x({ en: "analytics disabled per Records Directive 19", ko: "기록 지침 19호에 따라 분석 기능 비활성화", "zh-TW": "依紀錄指令第 19 號，分析功能已停用" })],
    scripts: ["/static/meridian.min.js"],
  });
}

type Person = Extract<Block, { type: "staff" }>["people"][number];

const staffList = (x: X): Person[] => [
  {
    name: x({ en: "Dr. Harriet Calloway", ko: "해리엇 캘러웨이 박사 (Harriet Calloway)", "zh-TW": "哈莉特・卡洛威博士（Harriet Calloway）" }),
    role: x({ en: "Director", ko: "소장", "zh-TW": "所長" }),
    bio: x({
      en: "Has led the Institute for two decades. Believes the past is a public utility and should be maintained like one.",
      ko: "20년째 연구소를 이끌고 있습니다. 과거는 공공 설비이며, 공공 설비처럼 관리되어야 한다고 믿습니다.",
      "zh-TW": "領導本院已二十年。她相信過去是一種公共設施，也應該像公共設施一樣維護。",
    }),
    photo: "calloway.jpg",
  },
  {
    name: x({ en: "Dr. Ada Voss", ko: "에이다 보스 박사 (Ada Voss)", "zh-TW": "艾達・佛斯博士（Ada Voss）" }),
    role: x({ en: "Senior Archivist (on leave)", ko: "수석 기록연구사 (휴가 중)", "zh-TW": "資深檔案研究員（休假中）" }),
    bio: x({
      en: "Specialist in harbour-era ledgers and municipal deeds. Known for reading the footnotes nobody else reads.",
      ko: "항구 시대 장부와 시 소유 증서 전문가. 아무도 읽지 않는 각주까지 읽는 사람으로 유명합니다.",
      "zh-TW": "專精港灣時代的帳冊與市府契據。以會讀別人都不讀的註腳聞名。",
    }),
    photo: "voss.jpg",
  },
  {
    name: x({ en: "Wren Okafor", ko: "렌 오카포 (Wren Okafor)", "zh-TW": "芮恩・奧卡佛（Wren Okafor）" }),
    role: x({ en: "Systems Archivist", ko: "시스템 기록연구사", "zh-TW": "系統檔案研究員" }),
    bio: x({
      en: "Maintains the Institute's digital catalogue and access systems. Off the clock, she still holds the high score on Circuit Runner '94 — and will tell you so on runnerboard.net if you ask.",
      ko: "연구소의 디지털 목록과 접근 시스템을 관리합니다. 퇴근 후에는 지금도 Circuit Runner '94 최고 기록 보유자이며, 물어보면 runnerboard.net에서 직접 자랑할 겁니다.",
      "zh-TW": "負責維護本院的數位目錄與存取系統。下班後，她至今仍保有 Circuit Runner '94 的最高分紀錄——只要你問，她就會在 runnerboard.net 上親口告訴你。",
    }),
    photo: null,
    link: { text: "runnerboard.net →", href: "runnerboard.net" },
  },
  {
    name: x({ en: "Thomas Kell", ko: "토머스 켈 (Thomas Kell)", "zh-TW": "湯瑪斯・凱爾（Thomas Kell）" }),
    role: x({ en: "Deputy Director, Continuity", ko: "연속성 담당 부국장", "zh-TW": "副所長（連續性事務）" }),
    bio: x({
      en: "Oversees reconciliation of conflicting records. \"Two truths are one too many.\"",
      ko: "상충하는 기록의 정리를 총괄합니다. \"진실은 하나면 충분하다.\"",
      "zh-TW": "負責統整彼此矛盾的紀錄。「兩個真相，就多了一個。」",
    }),
    photo: "kell.jpg",
  },
  {
    name: x({ en: "Priya Ramanathan", ko: "프리야 라마나단 (Priya Ramanathan)", "zh-TW": "普莉雅・拉馬納坦（Priya Ramanathan）" }),
    role: x({ en: "Conservator", ko: "보존처리 전문가", "zh-TW": "文物修復師" }),
    bio: x({
      en: "Restores paper, vellum and film. Can tell a forged watermark by the way it catches the light.",
      ko: "종이와 양피지, 필름을 복원합니다. 빛이 비치는 모양만 보고도 위조된 워터마크를 가려냅니다.",
      "zh-TW": "修復紙張、羊皮紙與底片。光看浮水印反光的樣子，就能認出偽造品。",
    }),
    photo: "ramanathan.jpg",
  },
  {
    name: x({ en: "Lionel Ash", ko: "라이어널 애시 (Lionel Ash)", "zh-TW": "萊諾・艾許（Lionel Ash）" }),
    role: x({ en: "Head of Security", ko: "보안 책임자", "zh-TW": "保安主任" }),
    bio: x({
      en: "Former harbour police. Responsible for the vaults, the keys and the people who ask about them.",
      ko: "전직 항만 경찰. 금고와 열쇠, 그리고 그것들에 대해 묻는 사람들을 책임집니다.",
      "zh-TW": "前港務警察。負責金庫、鑰匙，以及打聽這些東西的人。",
    }),
    photo: "ash.jpg",
  },
  {
    name: x({ en: "Margit Hollis", ko: "마르기트 홀리스 (Margit Hollis)", "zh-TW": "瑪姬特・霍利斯（Margit Hollis）" }),
    role: x({ en: "Photographic Collections", ko: "사진 소장품 담당", "zh-TW": "攝影典藏" }),
    bio: x({
      en: "Curates over two hundred thousand negatives. Prefers silver gelatin to pixels.",
      ko: "20만 장이 넘는 원판 필름을 관리합니다. 픽셀보다 젤라틴 실버 인화를 선호합니다.",
      "zh-TW": "管理超過二十萬張底片。比起像素，她更偏愛銀鹽相紙。",
    }),
    photo: "hollis.jpg",
  },
  {
    name: x({ en: "Samuel Oduya", ko: "새뮤얼 오두야 (Samuel Oduya)", "zh-TW": "山繆・歐杜亞（Samuel Oduya）" }),
    role: x({ en: "Oral Histories", ko: "구술사 담당", "zh-TW": "口述歷史" }),
    bio: x({
      en: "Records the memories of long-time residents, then cross-checks them against the record. Usually the record wins.",
      ko: "오래된 주민들의 기억을 녹음한 뒤 기록과 대조합니다. 대개는 기록이 이깁니다.",
      "zh-TW": "錄下老居民的記憶，再與紀錄交叉比對。通常是紀錄勝出。",
    }),
    photo: "oduya.jpg",
  },
  {
    name: x({ en: "Clémence Barre", ko: "클레망스 바르 (Clémence Barre)", "zh-TW": "克蕾蒙絲・巴爾（Clémence Barre）" }),
    role: x({ en: "Public Programmes", ko: "대중 프로그램 담당", "zh-TW": "公共推廣" }),
    bio: x({
      en: "Runs the Thursday lectures and the school visits. Has never once been asked a hard question by a child she couldn't answer.",
      ko: "목요 강연과 학교 견학을 맡고 있습니다. 아이들이 던진 어려운 질문에 답하지 못한 적이 한 번도 없습니다.",
      "zh-TW": "負責週四講座與學校參訪。孩子們丟出的難題，她從來沒有答不出來過。",
    }),
    photo: "barre.jpg",
  },
  {
    name: x({ en: "Ivo Strand", ko: "이보 스트랜드 (Ivo Strand)", "zh-TW": "伊沃・史川德（Ivo Strand）" }),
    role: x({ en: "Digitisation Lead", ko: "디지털화 책임자", "zh-TW": "數位化計畫主持人" }),
    bio: x({
      en: "Led the 2019 migration of the physical archive to the new catalogue. Originals retired on schedule.",
      ko: "2019년 실물 아카이브의 신규 목록 이전을 지휘했습니다. 원본은 일정대로 폐기되었습니다.",
      "zh-TW": "主導 2019 年將實體檔案遷移至新目錄的工作。原件已如期汰除。",
    }),
    photo: "strand.jpg",
  },
  {
    name: x({ en: "Beatrice Lam", ko: "비어트리스 램 (Beatrice Lam)", "zh-TW": "碧翠絲・林（Beatrice Lam）" }),
    role: x({ en: "Reading Room Supervisor", ko: "열람실 관리자", "zh-TW": "閱覽室主管" }),
    bio: x({
      en: "Has supervised the Reading Room for eleven years. The Reading Room is currently closed.",
      ko: "11년째 열람실을 관리하고 있습니다. 열람실은 현재 휴관 중입니다.",
      "zh-TW": "督導閱覽室已十一年。閱覽室目前暫停開放。",
    }),
    photo: "lam.jpg",
  },
  {
    name: x({ en: "Noel Ferrante", ko: "노엘 페란테 (Noel Ferrante)", "zh-TW": "諾爾・費蘭特（Noel Ferrante）" }),
    role: x({ en: "Facilities", ko: "시설 관리", "zh-TW": "設施管理" }),
    bio: x({
      en: "Keeps the lights on and the boilers quiet. Knows which doors stick and which ones are meant to.",
      ko: "불을 밝히고 보일러를 조용히 돌봅니다. 어느 문이 뻑뻑한지, 어느 문이 일부러 뻑뻑하게 되어 있는지 압니다.",
      "zh-TW": "讓燈亮著、讓鍋爐安靜。知道哪些門會卡，也知道哪些門是故意卡住的。",
    }),
    photo: "ferrante.jpg",
  },
];

function staff(x: X): SitePage {
  const blocks: Block[] = [
    nav(x),
    { type: "compass" },
    { type: "heading", level: 1, text: x({ en: "Staff Directory", ko: "직원 명부", "zh-TW": "職員名錄" }) },
    {
      type: "paragraph",
      text: x({
        en: "The Institute's work is carried out by a small and dedicated team. Staff may be contacted through the Office of the Director.",
        ko: "연구소의 업무는 소수의 헌신적인 직원들이 수행합니다. 직원 연락은 소장실을 통해 주십시오.",
        "zh-TW": "本院工作由一支精簡而盡責的團隊執行。如需聯繫職員，請透過所長辦公室。",
      }),
    },
    { type: "staff", people: staffList(x) },
    footer(x),
  ];
  return page(`${MERIDIAN_HOST}/staff`, x({ en: "Staff — Meridian Institute", ko: "직원 — 메리디언 연구소", "zh-TW": "職員 — 子午研究院" }), "meridian", blocks, {
    headComments: [x({ en: "Meridian CMS v4.2 — template: directory", ko: "Meridian CMS v4.2 — 템플릿: directory", "zh-TW": "Meridian CMS v4.2 — 樣板：directory" })],
    inlineComments: {
      4: [
        x({
          en: "photo for W. Okafor removed pending review — do NOT re-upload",
          ko: "W. 오카포(Okafor) 사진은 검토 대기로 삭제됨 — 절대 다시 올리지 말 것",
          "zh-TW": "W. 奧卡佛（Okafor）的照片已撤下待審——絕對不要重新上傳",
        }),
        x({
          en: "A. Voss status: on leave. Do not change to 'missing'. — T.K.",
          ko: "A. 보스 상태: 휴가 중. '실종'으로 바꾸지 말 것. — T.K.",
          "zh-TW": "A. 佛斯狀態：休假中。不得改為「失蹤」。——T.K.",
        }),
      ],
    },
  });
}

function about(x: X): SitePage {
  const blocks: Block[] = [
    nav(x),
    { type: "compass" },
    { type: "heading", level: 1, text: x({ en: "About the Institute", ko: "연구소 소개", "zh-TW": "關於本院" }) },
    { type: "paragraph", text: x({ en: "Founded 1987.", ko: "1987년 설립.", "zh-TW": "創立於 1987 年。" }) },
    {
      type: "paragraph",
      text: x({
        en: "The Meridian Institute was established by civic charter to gather the scattered archives of the old harbour city under one roof. What began as three rooms above a shipping office is now the city's sole custodian of historical record.",
        ko: "메리디언 연구소는 옛 항구 도시 곳곳에 흩어진 기록물을 한 지붕 아래 모으기 위해 시 헌장에 따라 설립되었습니다. 해운 사무소 위층 방 세 칸에서 시작한 연구소는 이제 이 도시의 역사 기록을 관리하는 유일한 기관입니다.",
        "zh-TW": "子午研究院依市府憲章設立，宗旨是將舊港城散落各處的檔案集中於同一屋簷下。本院從一間航運辦公室樓上的三個房間起家，如今已是本市唯一的歷史紀錄保管機構。",
      }),
    },
    {
      type: "paragraph",
      text: x({
        en: "Our emblem, the compass, reminds us that a record is only as good as its bearing. Ours has seven notches — one for each of the founding collections. The needle was damaged in the move to our current building. We have chosen to leave it as it is.",
        ko: "연구소의 문장인 나침반은 기록이 방향만큼만 믿을 수 있다는 사실을 일깨웁니다. 저희 나침반에는 창립 소장품 하나마다 하나씩, 모두 일곱 개의 눈금이 있습니다. 바늘은 현 건물로 이전하던 중 손상되었습니다. 저희는 그대로 두기로 했습니다.",
        "zh-TW": "本院的徽章是一只指南針，提醒我們：一份紀錄可信與否，端看它的方位是否正確。我們的指南針有七道刻痕，每一道代表一個創始館藏。指針在遷入現址時受損。我們選擇讓它維持原樣。",
      }),
    },
    { type: "heading", level: 2, text: x({ en: "Our Principles", ko: "운영 원칙", "zh-TW": "我們的原則" }) },
    {
      type: "list",
      items: [
        x({ en: "Continuity — the record must not contradict itself.", ko: "연속성 — 기록은 스스로 모순되어서는 안 됩니다.", "zh-TW": "連續性——紀錄不得自相矛盾。" }),
        x({ en: "Custody — what we keep, we keep forever.", ko: "보관 — 한번 보관한 것은 영원히 보관합니다.", "zh-TW": "保管——凡我們保存的，便永久保存。" }),
        x({ en: "Discretion — not every truth is ready for every reader.", ko: "신중함 — 모든 진실이 모든 독자에게 준비된 것은 아닙니다.", "zh-TW": "審慎——並非每一個真相，都已準備好面對每一位讀者。" }),
      ],
    },
    {
      type: "image",
      alt: x({ en: "The first Institute offices, above a shipping agent", ko: "해운 대리점 위층에 있던 연구소의 첫 사무실", "zh-TW": "研究院最早的辦公室，位於一家航運代理行樓上" }),
      caption: x({ en: "The original reading rooms, Harbour Street.", ko: "하버 스트리트(Harbour Street)의 초창기 열람실.", "zh-TW": "港灣街（Harbour Street）的初代閱覽室。" }),
      art: "archive-building",
      fileInfo: {
        filename: "harbour-street-offices.jpg",
        author: x({ en: "Meridian Photographic Collections", ko: "메리디언 사진 소장품실", "zh-TW": "子午研究院攝影典藏室" }),
        camera: "Rolleiflex 2.8F",
        date: "1987-06-01",
        dimensions: "2400 × 1800",
        comment: x({ en: "Opening week. Scanned 2019.", ko: "개관 주간. 2019년 스캔.", "zh-TW": "開館週。2019 年掃描。" }),
      },
    },
    footer(x),
  ];
  return page(`${MERIDIAN_HOST}/about`, x({ en: "About — Meridian Institute", ko: "소개 — 메리디언 연구소", "zh-TW": "關於 — 子午研究院" }), "meridian", blocks, {
    headComments: [x({ en: "Meridian CMS v4.2 — template: civic-classic", ko: "Meridian CMS v4.2 — 템플릿: civic-classic", "zh-TW": "Meridian CMS v4.2 — 樣板：civic-classic" })],
    inlineComments: {
      3: [
        x({
          en: "copy approved by Office of the Director — footer to be reconciled at next continuity review",
          ko: "소장실 승인 문구 — 푸터는 다음 연속성 검토 때 정리할 것",
          "zh-TW": "文案經所長辦公室核可——頁尾待下次連續性審查時統一",
        }),
      ],
    },
  });
}

function vault(x: X): SitePage {
  const blocks: Block[] = [
    nav(x),
    { type: "compass" },
    { type: "heading", level: 1, text: x({ en: "Vault 2019 — Migration Staging", ko: "Vault 2019 — 이전 대기 구역", "zh-TW": "Vault 2019 — 遷移暫存區" }) },
    {
      type: "notice",
      tone: "warning",
      text: x({
        en: "Internal staging area. This page is not indexed. If you have reached it in error, please close your browser.",
        ko: "내부 대기 구역입니다. 이 페이지는 검색되지 않습니다. 잘못 들어오셨다면 브라우저를 닫아 주십시오.",
        "zh-TW": "內部暫存區。本頁面不會被搜尋引擎收錄。若您誤入此頁，請關閉瀏覽器。",
      }),
    },
    {
      type: "paragraph",
      text: x({
        en: "Items below were held back from the public catalogue during the 2019 migration, pending continuity review.",
        ko: "아래 자료는 2019년 이전 당시 연속성 검토를 이유로 공개 목록에서 보류된 것입니다.",
        "zh-TW": "以下項目於 2019 年遷移期間暫緩列入公開目錄，待連續性審查。",
      }),
    },
    {
      type: "image",
      alt: x({
        en: "A woman at a reading-room table, face turned from the camera, a ledger open in front of her",
        ko: "열람실 책상에 앉은 여자. 얼굴은 카메라 반대쪽을 향해 있고, 앞에는 장부가 펼쳐져 있다",
        "zh-TW": "閱覽室桌前的一名女子，臉背對鏡頭，面前攤著一本帳冊",
      }),
      caption: x({ en: "Reading Room, late. Subject unidentified.", ko: "늦은 밤의 열람실. 인물 미상.", "zh-TW": "深夜的閱覽室。人物身分不明。" }),
      art: "photo-reading-room",
      fileInfo: {
        filename: "IMG_8841_draft.jpg",
        author: x({ en: "A. Voss", ko: "A. 보스 (A. Voss)", "zh-TW": "A. 佛斯（A. Voss）" }),
        camera: "Pentax K1000 (scanned)",
        date: "2019-01-02 23:41",
        dimensions: "3008 × 2000",
        comment: x({ en: "draft uploaded to thedrift.blog", ko: "thedrift.blog에 초안 업로드함", "zh-TW": "草稿已上傳至 thedrift.blog" }),
      },
    },
    {
      type: "image",
      alt: x({ en: "A ledger page with a column of dates, one line scraped away", ko: "날짜가 세로로 적힌 장부 한 면. 한 줄이 긁혀 지워져 있다", "zh-TW": "一頁帳冊，上面直直列著一欄日期，其中一行被刮除" }),
      caption: x({ en: "Harbour Ledger, vol. III, folio 12.", ko: "하버 장부 제III권, 12장.", "zh-TW": "港灣帳冊，第 III 卷，第 12 頁。" }),
      art: "photo-ledger",
      fileInfo: {
        filename: "ledger-iii-f12.tif",
        author: x({ en: "Meridian Digitisation", ko: "메리디언 디지털화팀", "zh-TW": "子午研究院數位化小組" }),
        camera: "Phase One IQ3",
        date: "2019-03-11",
        dimensions: "8000 × 6000",
        comment: x({ en: "original retired", ko: "원본 폐기됨", "zh-TW": "原件已汰除" }),
      },
    },
    {
      type: "list",
      items: [
        x({ en: "Harbour Ledgers vol. I–IV — status: reconciled", ko: "하버 장부 제I–IV권 — 상태: 정리 완료", "zh-TW": "港灣帳冊第 I–IV 卷——狀態：已統整" }),
        x({ en: "Founders' correspondence — status: sealed", ko: "창립자 서신 — 상태: 봉인", "zh-TW": "創始人書信——狀態：已封存" }),
        x({ en: "Staff photographs (1987–2019) — status: under review", ko: "직원 사진 (1987–2019) — 상태: 검토 중", "zh-TW": "職員照片（1987–2019）——狀態：審查中" }),
      ],
    },
    footer(x),
  ];
  return page(`${MERIDIAN_HOST}/vault-2019`, x({ en: "Vault 2019 — Staging", ko: "Vault 2019 — 대기 구역", "zh-TW": "Vault 2019 — 暫存區" }), "meridian", blocks, {
    headComments: ["robots: noindex, nofollow"],
    meta: { robots: "noindex, nofollow" },
    inlineComments: { 5: [x({ en: "this one isn't ours. who uploaded it?  — I.S.", ko: "이건 우리 게 아닌데. 누가 올렸지?  — I.S.", "zh-TW": "這張不是我們的。誰上傳的？ ——I.S." })] },
  });
}

function collections(x: X): SitePage {
  const blocks: Block[] = [
    nav(x),
    { type: "compass" },
    { type: "heading", level: 1, text: x({ en: "Collections", ko: "소장품", "zh-TW": "館藏" }) },
    {
      type: "paragraph",
      text: x({
        en: "The Institute's holdings are organised into seven founding collections. Following the 2019 migration, all collections are available exclusively through the digital catalogue.",
        ko: "연구소의 소장 자료는 일곱 개의 창립 소장품으로 분류됩니다. 2019년 이전 이후 모든 소장품은 디지털 목록을 통해서만 열람할 수 있습니다.",
        "zh-TW": "本院館藏分為七個創始館藏。自 2019 年遷移後，所有館藏僅能透過數位目錄查閱。",
      }),
    },
    {
      type: "list",
      items: [
        x({ en: "I. Harbour Ledgers", ko: "I. 하버 장부", "zh-TW": "I. 港灣帳冊" }),
        x({ en: "II. Municipal Deeds", ko: "II. 시 소유 증서", "zh-TW": "II. 市府契據" }),
        x({ en: "III. Founders' Correspondence", ko: "III. 창립자 서신", "zh-TW": "III. 創始人書信" }),
        x({ en: "IV. Photographic Collections", ko: "IV. 사진 소장품", "zh-TW": "IV. 攝影典藏" }),
        x({ en: "V. Oral Histories", ko: "V. 구술사", "zh-TW": "V. 口述歷史" }),
        x({ en: "VI. Maps & Charts", ko: "VI. 지도 및 해도", "zh-TW": "VI. 地圖與海圖" }),
        x({ en: "VII. [Collection withdrawn]", ko: "VII. [소장품 회수됨]", "zh-TW": "VII. [館藏已撤回]" }),
      ],
    },
    { type: "notice", tone: "info", text: x({ en: "Catalogue access is temporarily restricted to staff.", ko: "목록 열람은 일시적으로 직원에게만 허용됩니다.", "zh-TW": "目錄查閱暫時僅限職員。" }) },
    footer(x),
  ];
  return page(`${MERIDIAN_HOST}/collections`, x({ en: "Collections — Meridian Institute", ko: "소장품 — 메리디언 연구소", "zh-TW": "館藏 — 子午研究院" }), "meridian", blocks, {
    inlineComments: { 4: [x({ en: "VII withdrawn 2019 by order of the Deputy Director", ko: "VII은 2019년 부국장 지시로 회수됨", "zh-TW": "VII 於 2019 年依副所長命令撤回" })] },
  });
}

export function resolveMeridian(path: string, _progress: RoomProgress, loc: Locale): SitePage | null {
  const x = pick(loc);
  switch (path) {
    case "":
    case "/index.html":
    case "/home":
      return home(x);
    case "/staff":
      return staff(x);
    case "/about":
      return about(x);
    case "/vault-2019":
      return vault(x);
    case "/collections":
      return collections(x);
    default:
      return null;
  }
}
