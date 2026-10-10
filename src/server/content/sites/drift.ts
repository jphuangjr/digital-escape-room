import "server-only";
import { pick, type Locale, type Tr } from "@/i18n/config";
import type { Block, RoomProgress, SitePage } from "@/lib/types";
import { page } from "./source";

export const DRIFT_HOST = "thedrift.blog";

export interface DriftPost {
  slug: string;
  title: string;
  date: string;
  series: "Field Notes" | "Ada's Kitchen";
  body: string;
  /** Translations. Field Notes titles stay English in every locale (their initials spell DRIFT); the Korean, Chinese and Spanish titles add a subtitle. */
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
      "zh-TW": {
        title: "True North Is a Rumour — 真北只是傳聞",
        date: "2019年5月1日",
        body: [
          "我想，這是這個系列的最後一篇。也許是我在任何地方寫下的最後一篇。",
          "單位的主樓梯上有一個指南針。七道刻痕，指針從軸心處斷了。他們跟訪客說是搬遷時摔壞的。不是。是有人把它弄斷，好讓它永遠指向他們想要的方向。",
          "如果你是按順序讀這些文章的——真正的順序，照著日曆走的方向——那你已經知道該怎麼轉動轉盤了。數的是日子，不是文章。指針需要幾道刻痕，就有幾道。",
          "不管你是誰：他們總是先從小事開始說謊。日期。名字。一張曾經有臉的照片。",
        ].join("\n"),
      },
      es: {
        title: "True North Is a Rumour — El norte verdadero es un rumor",
        date: "1 de mayo de 2019",
        body: [
          "Última entrada de esta serie, creo. Quizá la última entrada en cualquier parte.",
          "Hay una brújula en la escalera principal del trabajo. Siete muescas, la aguja partida en el eje. A los visitantes les dicen que se rompió en la mudanza. No es cierto. Alguien la rompió para que siempre apuntara hacia donde ellos querían.",
          "Si has leído estas entradas en orden —de verdad en orden, como corre el calendario—, ya sabes cómo girar el dial. Cuenta los días, no las entradas. La aguja tiene tantas muescas como necesites.",
          "Seas quien seas: primero mienten sobre las cosas pequeñas. Fechas. Nombres. Una fotografía en la que antes había un rostro.",
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
        title: "에이다의 부엌: 버터와 인내",
        date: "2019년 4월 14일",
        body: [
          "야간 근무를 위한 쇼트브레드. 차가운 버터 4큰술에 설탕을 넣고 손목이 투덜댈 때까지 크림처럼 휘젓는다. 그다음 밀가루를 넣는다. 끈적이기를 멈추고 정직해지기 시작할 때까지.",
          "가장자리가 오래된 종이 색이 될 때까지 굽는다. 책상에서 먹는다. 장부 위에 부스러기는 남기지 않는다.",
        ].join("\n"),
      },
      "zh-TW": {
        title: "艾達的廚房：奶油與耐心",
        date: "2019年4月14日",
        body: [
          "給夜班的奶油酥餅。把 4 大匙冰奶油和糖一起打發，打到手腕開始抱怨，再加麵粉，直到它不再黏手、開始變得誠實。",
          "烤到邊緣變成舊紙的顏色。在辦公桌前吃。別在帳冊上留下碎屑。",
        ].join("\n"),
      },
      es: {
        title: "La cocina de Ada: Mantequilla y paciencia",
        date: "14 de abril de 2019",
        body: [
          "Galletas de mantequilla para el turno de noche. Bate 4 cucharadas de mantequilla fría con azúcar hasta que la muñeca se queje; luego agrega harina hasta que la masa deje de ser pegajosa y empiece a ser honesta.",
          "Hornea hasta que los bordes tomen el color del papel viejo. Cómelas en tu escritorio. No dejes migas sobre los libros de registro.",
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
      "zh-TW": {
        title: "Footnotes for a Ghost — 寫給幽靈的註腳",
        date: "2019年4月2日",
        body: [
          "我有一位同事，已經沒有臉了。不是字面上的意思。在員工合照裡，她原本站的位置是空的，彷彿她在快門按下前一秒走出了相框。",
          "她每天早上仍然坐在自己的辦公桌前。仍然在那個荒謬的街機遊戲裡贏過所有人。但在紙面上，她正被一點一點抹淡，一次一條註腳。",
          "我也開始寫我自己的註腳了。",
        ].join("\n"),
      },
      es: {
        title: "Footnotes for a Ghost — Notas al pie para un fantasma",
        date: "2 de abril de 2019",
        body: [
          "Tengo una colega que ya no tiene rostro. No en sentido literal. En las fotografías del personal, el lugar donde ella estaba aparece vacío, como si hubiera salido del encuadre un segundo antes del disparo.",
          "Sigue en su escritorio todas las mañanas. Sigue ganándoles a todos en ese ridículo juego de arcade. Pero en el papel la están desdibujando, una nota al pie a la vez.",
          "Yo también empecé a escribir mis propias notas al pie.",
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
      "zh-TW": {
        title: "Ink That Moves — 會移動的墨水",
        date: "2019年3月1日",
        body: [
          "墨水應該待在你放下它的地方。這就是全部的約定。",
          "這個星期，創立年份在三個地方被改掉了，卻沒有人眨一下眼。大廳的牌匾、章程的掃描檔、「關於我們」頁面。舊的數字只倖存在沒人想到要看的地方——頁面最底下，小字裡，灰塵落定的地方。",
          "有人在改寫時把數字的順序弄反了。或者，有人故意把它們留成反的。",
        ].join("\n"),
      },
      es: {
        title: "Ink That Moves — Tinta que se mueve",
        date: "1 de marzo de 2019",
        body: [
          "Se supone que la tinta se queda donde la pones. Ese es todo el contrato.",
          "Esta semana una fecha de fundación cambió en tres lugares y nadie parpadeó. La placa del vestíbulo, el escaneo de los estatutos, la página 'Acerca de'. El número antiguo solo sobrevive donde a nadie se le ocurrió mirar: al final de la página, en la letra pequeña, donde se asienta el polvo.",
          "Alguien puso los dígitos al revés cuando lo reescribió. O alguien los dejó al revés a propósito.",
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
        title: "에이다의 부엌: 한밤의 빵",
        date: "2019년 2월 23일",
        body: [
          "반죽할 기운도 없이 너무 늦게 귀가하는 사람을 위한 무반죽 빵. 따뜻한 우유에 달걀 2개를 풀고, 강력분 1컵과 소금 한 꼬집을 섞은 뒤 행주를 덮어 밤새 둔다.",
          "아침이면 아무도 지켜보지 않았는데도 부풀어 있을 것이다. 대부분의 일이 그렇다.",
        ].join("\n"),
      },
      "zh-TW": {
        title: "艾達的廚房：午夜麵包",
        date: "2019年2月23日",
        body: [
          "給回家太晚、沒力氣揉麵的人的免揉麵包。把 2 顆蛋打進溫牛奶裡，拌入 1 杯高筋麵粉和一小撮鹽，蓋上茶巾放一整夜。",
          "到了早上，它會在沒人看著的時候自己膨起來。大多數事情都是這樣。",
        ].join("\n"),
      },
      es: {
        title: "La cocina de Ada: Pan de medianoche",
        date: "23 de febrero de 2019",
        body: [
          "Pan sin amasar para quienes llegan a casa demasiado tarde para amasar. Bate 2 huevos en leche tibia, incorpora 1 taza de harina de fuerza y una pizca de sal, y déjalo toda la noche bajo un paño de cocina.",
          "Por la mañana habrá crecido sin que nadie lo mirara. Casi todo hace lo mismo.",
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
      "zh-TW": {
        title: "Redacted Weather — 被塗黑的天氣",
        date: "2019年2月1日",
        body: [
          "今天我發現一份被黑條劃過的氣象報告。氣象報告。港口倉庫失火的那一晚，下雨這件事，顯然是機密。",
          "從被剪掉的部分，你會開始看出一件事的形狀。像模版。像相片底片。",
          "我會繼續寫下去。按順序。總得有人把某些東西維持在順序裡。",
        ].join("\n"),
      },
      es: {
        title: "Redacted Weather — El clima censurado",
        date: "1 de febrero de 2019",
        body: [
          "Hoy encontré un parte meteorológico tachado con una franja negra. Un parte meteorológico. La lluvia, al parecer, era información clasificada la noche en que se quemó el almacén del puerto.",
          "Empiezas a ver la forma de algo por lo que le han recortado. Como un esténcil. Como el negativo de una foto.",
          "Voy a seguir escribiendo estas entradas. En orden. Alguien tiene que mantener algo en orden.",
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
        title: "에이다의 부엌: 기록 보관인의 수프",
        date: "2019년 1월 19일",
        body: [
          "동생 말로는 내가 책상에서 보온병에 든 수프만 먹는다고 한다. 그래서, 그 수프. 물 3컵에 양파 하나, 당근 하나, 월계수 잎 1장을 넣고 부엌에서 누군가 나를 사랑하는 냄새가 날 때까지 뭉근히 끓인다.",
          "소금은 입맛대로. 끓는 동안 뭔가를 읽는다. 일 말고. 절대 일은 말고.",
        ].join("\n"),
      },
      "zh-TW": {
        title: "艾達的廚房：檔案管理員的湯",
        date: "2019年1月19日",
        body: [
          "我妹妹說我只會在辦公桌前喝保溫瓶裡的湯，所以，就是這碗湯。3 杯水加一顆洋蔥、一根紅蘿蔔和 1 片月桂葉，小火慢燉，直到廚房聞起來像是有人愛著你。",
          "鹽依口味加。煮的時候讀點東西。不是工作。永遠不要是工作。",
        ].join("\n"),
      },
      es: {
        title: "La cocina de Ada: Caldo de archivista",
        date: "19 de enero de 2019",
        body: [
          "Mi hermana dice que lo único que como es sopa de un termo en mi escritorio, así que aquí está la sopa. Cuece a fuego lento 3 tazas de agua con una cebolla, una zanahoria y 1 hoja de laurel hasta que la cocina huela a que alguien te quiere.",
          "Sal al gusto. Lee algo mientras se cocina. Nada del trabajo. Nunca del trabajo.",
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
      "zh-TW": {
        title: "Dead Reckoning — 航位推算",
        date: "2019年1月2日",
        body: [
          "沒有星星可看的水手會用航位推算：你知道自己從哪裡出發，知道自己走了多遠，於是你相信算術勝過相信眼睛。",
          "我開始寫一本筆記。不是研究院能稽核的那種。如果我出了什麼事，總會有人需要知道我是從哪裡出發的。",
          "第一個方位：紀錄在移動。第二個方位：這不是我的想像。",
        ].join("\n"),
      },
      es: {
        title: "Dead Reckoning — Navegación a estima",
        date: "2 de enero de 2019",
        body: [
          "Los marineros sin estrellas usaban la navegación a estima: sabes dónde empezaste, sabes cuánto has avanzado y confías en la aritmética más que en tus ojos.",
          "Empiezo un cuaderno. No del tipo que el Instituto puede auditar. Si algo me pasa, alguien tendrá que saber dónde empecé.",
          "Primer rumbo: los registros se están moviendo. Segundo rumbo: no lo estoy imaginando.",
        ].join("\n"),
      },
    },
  },
];

const nav = (x: X): Block => ({
  type: "nav",
  links: [
    { text: x({ en: "Home", ko: "홈", "zh-TW": "首頁", es: "Inicio" }), href: DRIFT_HOST },
    { text: x({ en: "About", ko: "소개", "zh-TW": "關於", es: "Acerca de" }), href: `${DRIFT_HOST}/about` },
  ],
});

const footer = (x: X): Block => ({
  type: "footer",
  text: x({
    en: "The Drift — notes from someone who reads the footnotes. Comments are closed.",
    ko: "The Drift — 각주까지 읽는 사람의 기록. 댓글은 닫혀 있습니다.",
    "zh-TW": "The Drift — 一個會讀註腳的人的筆記。留言功能已關閉。",
    es: "The Drift — notas de alguien que lee las notas al pie. Los comentarios están cerrados.",
  }),
});

const SERIES: Record<DriftPost["series"], Tr> = {
  "Field Notes": { en: "Field Notes", ko: "필드 노트 · Field Notes", "zh-TW": "田野筆記 · Field Notes", es: "Notas de campo · Field Notes" },
  "Ada's Kitchen": { en: "Ada's Kitchen", ko: "에이다의 부엌 · Ada's Kitchen", "zh-TW": "艾達的廚房 · Ada's Kitchen", es: "La cocina de Ada · Ada's Kitchen" },
};

/** The post's text in `loc` (English fields as-is for "en"). */
function localized(p: DriftPost, loc: Locale): { title: string; date: string; body: string } {
  return loc === "en" ? { title: p.title, date: p.date, body: p.body } : p.l10n[loc];
}

function postBlock(p: DriftPost, loc: Locale): Block {
  const t = localized(p, loc);
  return { type: "post", title: t.title, author: "A.", date: t.date, body: t.body, series: pick(loc)(SERIES[p.series]) };
}

function home(loc: Locale): SitePage {
  const x = pick(loc);
  const blocks: Block[] = [
    nav(x),
    { type: "compass" },
    { type: "heading", level: 1, text: "The Drift" },
    {
      type: "paragraph",
      text: x({
        en: "Field notes, small hours, and the occasional recipe. Posts appear newest first — the way the world reads, and the wrong way to read a story.",
        ko: "현장 기록, 늦은 밤의 생각, 그리고 가끔 레시피. 글은 최신순으로 보인다 — 세상이 읽는 방식이고, 이야기를 읽기에는 틀린 방식이다.",
        "zh-TW": "田野筆記、深夜的念頭，偶爾還有食譜。文章由新到舊排列——這是世界閱讀的方式，卻是讀一個故事的錯誤方式。",
        es: "Notas de campo, horas de madrugada y alguna que otra receta. Las entradas aparecen de la más reciente a la más antigua: así lee el mundo, y es la forma equivocada de leer una historia.",
      }),
    },
    ...DRIFT_POSTS.map((p) => postBlock(p, loc)),
    footer(x),
  ];
  return page(DRIFT_HOST, "The Drift", "drift", blocks, {
    headComments: [x({ en: "static export — minimal-ink theme", ko: "정적 내보내기 — minimal-ink 테마", "zh-TW": "靜態匯出 — minimal-ink 佈景主題", es: "exportación estática — tema minimal-ink" })],
    bodyComments: [x({ en: "two series live here. only one of them is a map.", ko: "여기엔 시리즈가 두 개 있다. 지도는 그중 하나뿐.", "zh-TW": "這裡有兩個系列。只有其中一個是地圖。", es: "aquí viven dos series. solo una de ellas es un mapa." })],
    tailComments: [
      x({
        en: "draft image IMG_8841 removed from header after upload — too recognisable",
        ko: "초안 이미지 IMG_8841, 업로드 후 헤더에서 제거 — 너무 알아보기 쉬움",
        "zh-TW": "草稿圖片 IMG_8841 上傳後已從頁首移除——太容易被認出來",
        es: "imagen de borrador IMG_8841 quitada del encabezado después de subirla — demasiado reconocible",
      }),
    ],
  });
}

function about(loc: Locale): SitePage {
  const x = pick(loc);
  const blocks: Block[] = [
    nav(x),
    { type: "compass" },
    { type: "heading", level: 1, text: x({ en: "About", ko: "소개", "zh-TW": "關於", es: "Acerca de" }) },
    {
      type: "paragraph",
      text: x({
        en: "I work with old paper for a living. This is where I write the things I can't put in the official finding aids.",
        ko: "나는 오래된 종이를 다루는 일로 먹고산다. 공식 목록에는 적을 수 없는 것들을 여기에 쓴다.",
        "zh-TW": "我靠處理舊紙張維生。官方檢索目錄裡寫不進去的東西，我寫在這裡。",
        es: "Me gano la vida trabajando con papel viejo. Aquí escribo lo que no puedo poner en los instrumentos de descripción oficiales.",
      }),
    },
    {
      type: "paragraph",
      text: x({
        en: "The Field Notes are a series. Read them from the first to the last. The first letter is where every bearing begins, and distance is measured in days.",
        ko: "필드 노트(Field Notes)는 연재다. 첫 글부터 마지막 글까지 순서대로 읽을 것. 모든 방위는 첫 글자에서 시작하고, 거리는 날짜로 잰다.",
        "zh-TW": "田野筆記（Field Notes）是一個系列。請從第一篇讀到最後一篇。每個方位都從第一個字母開始，而距離以日子計算。",
        es: "Las Notas de campo (Field Notes) son una serie. Léelas de la primera a la última. Cada rumbo empieza en la primera letra, y la distancia se mide en días.",
      }),
    },
    {
      type: "paragraph",
      text: x({
        en: "The kitchen posts are just for my sister, who worries I don't eat.",
        ko: "부엌 글은 그냥 동생을 위한 것이다. 내가 밥을 안 먹는다고 걱정하니까.",
        "zh-TW": "廚房的文章只是寫給我妹妹的，她總擔心我不吃飯。",
        es: "Las entradas de cocina son solo para mi hermana, que se preocupa porque cree que no como.",
      }),
    },
    footer(x),
  ];
  return page(`${DRIFT_HOST}/about`, x({ en: "About — The Drift", ko: "소개 — The Drift", "zh-TW": "關於 — The Drift", es: "Acerca de — The Drift" }), "drift", blocks);
}

function post(slug: string, loc: Locale): SitePage | null {
  const x = pick(loc);
  const p = DRIFT_POSTS.find((q) => q.slug === slug);
  if (!p) return null;
  const t = localized(p, loc);
  const blocks: Block[] = [
    nav(x),
    postBlock(p, loc),
    { type: "link", text: x({ en: "← All posts", ko: "← 전체 글", "zh-TW": "← 所有文章", es: "← Todas las entradas" }), href: DRIFT_HOST },
    footer(x),
  ];
  return page(`${DRIFT_HOST}/post/${p.slug}`, `${t.title} — The Drift`, "drift", blocks, {
    meta: { "article:published_time": t.date, "article:section": x(SERIES[p.series]) },
  });
}

export function resolveDrift(path: string, _progress: RoomProgress, loc: Locale): SitePage | null {
  if (path === "") return home(loc);
  if (path === "/about") return about(loc);
  const m = path.match(/^\/post\/([a-z0-9-]+)$/);
  if (m) return post(m[1], loc);
  return null;
}
