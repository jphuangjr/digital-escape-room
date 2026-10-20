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
    es: "Harbour Community College · Estudios nocturnos · Abrimos a las 6 p. m.; el café no está garantizado.",
    ja: "ハーバー・コミュニティ・カレッジ · 夜間講座 · 開校は午後6時、コーヒーの保証はありません。",
    "pt-BR": "Harbour Community College · Cursos noturnos · Abrimos às 18h; o café não é garantido.",
  }),
});

const nav = (x: X): Block => ({
  type: "nav",
  links: [
    { text: x({ en: "Home", ko: "홈", "zh-TW": "首頁", es: "Inicio", ja: "ホーム", "pt-BR": "Início" }), href: HARBOURCC_HOST },
    { text: "CS 110", href: `${HARBOURCC_HOST}/cs110` },
    { text: x({ en: "Week 3: Binary", ko: "3주차: 이진법", "zh-TW": "第 3 週：二進位", es: "Semana 3: Binario", ja: "第3週：2進数", "pt-BR": "Semana 3: Binário" }), href: `${HARBOURCC_HOST}/cs110/binary` },
  ],
});

function home(x: X): SitePage {
  const blocks: Block[] = [
    nav(x),
    { type: "heading", level: 1, text: x({ en: "Harbour Community College", ko: "하버 커뮤니티 칼리지", "zh-TW": "港灣社區學院", es: "Harbour Community College", ja: "ハーバー・コミュニティ・カレッジ", "pt-BR": "Harbour Community College" }) },
    { type: "paragraph", text: x({ en: "Evening Studies. Learn something after work.", ko: "야간 과정. 퇴근 후에 무언가를 배워 보세요.", "zh-TW": "夜間部。下班後，學點新東西。", es: "Estudios nocturnos. Aprenda algo después del trabajo.", ja: "夜間講座。仕事帰りに、何かを学びませんか。", "pt-BR": "Cursos noturnos. Aprenda algo depois do trabalho." }) },
    { type: "heading", level: 2, text: x({ en: "This term's evening courses", ko: "이번 학기 야간 강좌", "zh-TW": "本學期夜間課程", es: "Cursos nocturnos de este período", ja: "今学期の夜間講座", "pt-BR": "Cursos noturnos deste semestre" }) },
    {
      type: "list",
      items: [
        x({ en: "CS 110: How Computers Count (Tuesdays, W. Okafor)", ko: "CS 110: 컴퓨터는 어떻게 셈을 하나 (화요일, W. 오카포(Okafor))", "zh-TW": "CS 110：電腦怎麼數數（週二，W. 奧卡佛（Okafor））", es: "CS 110: Cómo cuentan las computadoras (martes, W. Okafor)", ja: "CS 110：コンピューターはどう数えるか（火曜、W・オカフォー（Okafor））", "pt-BR": "CS 110: Como os computadores contam (terças, W. Okafor)" }),
        x({ en: "HIST 204: The Harbour Before the Fire (Wednesdays, staff)", ko: "HIST 204: 대화재 이전의 항구 (수요일, 교직원)", "zh-TW": "HIST 204：大火之前的港灣（週三，校內教師）", es: "HIST 204: El puerto antes del incendio (miércoles, profesorado)", ja: "HIST 204：大火以前の港（水曜、教員）", "pt-BR": "HIST 204: O porto antes do incêndio (quartas, corpo docente)" }),
        x({ en: "ART 101: Drawing From Life (Thursdays, staff)", ko: "ART 101: 인물 드로잉 (목요일, 교직원)", "zh-TW": "ART 101：人物寫生（週四，校內教師）", es: "ART 101: Dibujo del natural (jueves, profesorado)", ja: "ART 101：人物デッサン（木曜、教員）", "pt-BR": "ART 101: Desenho com modelo vivo (quintas, corpo docente)" }),
      ],
    },
    { type: "link", text: x({ en: "CS 110 course page →", ko: "CS 110 강좌 페이지 →", "zh-TW": "CS 110 課程頁面 →", es: "Página del curso CS 110 →", ja: "CS 110 講座ページ →", "pt-BR": "Página do curso CS 110 →" }), href: `${HARBOURCC_HOST}/cs110` },
    {
      type: "notice",
      tone: "info",
      text: x({
        en: "HIST 204 is cancelled this term at the request of a community partner.",
        ko: "HIST 204는 지역 협력 기관의 요청으로 이번 학기에 폐강되었습니다.",
        "zh-TW": "應社區合作夥伴要求，HIST 204 本學期停開。",
        es: "HIST 204 se cancela este período a petición de una institución colaboradora de la comunidad.",
        ja: "HIST 204 は、地域連携団体の要請により今学期は休講となりました。",
        "pt-BR": "HIST 204 foi cancelado neste semestre a pedido de uma instituição parceira da comunidade.",
      }),
    },
    footer(x),
  ];
  return page(HARBOURCC_HOST, x({ en: "Harbour Community College", ko: "하버 커뮤니티 칼리지", "zh-TW": "港灣社區學院", es: "Harbour Community College", ja: "ハーバー・コミュニティ・カレッジ", "pt-BR": "Harbour Community College" }), "harbourcc", blocks, {
    headComments: [
      x({
        en: "site maintained by the Evening Studies office. please stop emailing us about the parking.",
        ko: "야간 과정 사무실에서 관리하는 사이트입니다. 주차 문제로 그만 이메일 보내 주세요.",
        "zh-TW": "本網站由夜間部辦公室維護。請不要再寄電子郵件來問停車的事了。",
        es: "sitio mantenido por la oficina de Estudios nocturnos. por favor, dejen de escribirnos por lo del estacionamiento.",
        ja: "夜間講座事務局が管理しているサイトです。駐車場の件でメールを送ってくるのはもうやめてください。",
        "pt-BR": "site mantido pela secretaria dos Cursos noturnos. por favor, parem de mandar e-mail pra gente sobre o estacionamento.",
      }),
    ],
  });
}

function course(x: X): SitePage {
  const blocks: Block[] = [
    nav(x),
    { type: "heading", level: 1, text: x({ en: "CS 110: How Computers Count", ko: "CS 110: 컴퓨터는 어떻게 셈을 하나", "zh-TW": "CS 110：電腦怎麼數數", es: "CS 110: Cómo cuentan las computadoras", ja: "CS 110：コンピューターはどう数えるか", "pt-BR": "CS 110: Como os computadores contam" }) },
    {
      type: "paragraph",
      text: x({
        en: "Tuesdays, 6:30 to 8:30pm, Room 12. Instructor: W. Okafor (by day, a systems archivist; by night, this).",
        ko: "매주 화요일 저녁 6:30~8:30, 12호실. 강사: W. 오카포(Okafor) (낮에는 시스템 기록연구사, 밤에는 이 일).",
        "zh-TW": "每週二晚上 6:30 至 8:30，12 號教室。講師：W. 奧卡佛（Okafor）（白天是系統檔案研究員，晚上就是這個）。",
        es: "Martes, de 6:30 a 8:30 p. m., Aula 12. Instructora: W. Okafor (de día, archivista de sistemas; de noche, esto).",
        ja: "毎週火曜 午後6:30〜8:30、12号教室。講師：W・オカフォー（Okafor）（昼はシステム・アーキビスト、夜はこれ）。",
        "pt-BR": "Terças, das 18h30 às 20h30, Sala 12. Instrutora: W. Okafor (de dia, arquivista de sistemas; à noite, isto aqui).",
      }),
    },
    { type: "heading", level: 2, text: x({ en: "Lessons", ko: "수업", "zh-TW": "課程", es: "Lecciones", ja: "授業", "pt-BR": "Aulas" }) },
    {
      type: "list",
      items: [
        x({ en: "Week 1: What is a computer, really? (handout only)", ko: "1주차: 컴퓨터란 대체 뭘까? (유인물만)", "zh-TW": "第 1 週：電腦到底是什麼？（僅講義）", es: "Semana 1: ¿Qué es una computadora, en realidad? (solo material impreso)", ja: "第1週：そもそもコンピューターって何？（配布資料のみ）", "pt-BR": "Semana 1: O que é um computador, afinal? (só apostila)" }),
        x({ en: "Week 2: Switches, on and off (handout only)", ko: "2주차: 스위치, 켜짐과 꺼짐 (유인물만)", "zh-TW": "第 2 週：開關，開與關（僅講義）", es: "Semana 2: Interruptores, encendido y apagado (solo material impreso)", ja: "第2週：スイッチ、オンとオフ（配布資料のみ）", "pt-BR": "Semana 2: Interruptores, ligado e desligado (só apostila)" }),
        x({ en: "Week 3: Binary, counting with two fingers (online lesson below)", ko: "3주차: 이진법, 손가락 두 개로 세기 (아래 온라인 수업)", "zh-TW": "第 3 週：二進位，用兩根手指數數（線上課程見下方）", es: "Semana 3: Binario, contar con dos dedos (lección en línea abajo)", ja: "第3週：2進数、2本の指で数える（オンライン授業は下記）", "pt-BR": "Semana 3: Binário, contando com dois dedos (aula on-line abaixo)" }),
        x({ en: "Week 4: Passwords, and why yours is bad (coming soon)", ko: "4주차: 비밀번호, 그리고 당신 비밀번호가 허술한 이유 (준비 중)", "zh-TW": "第 4 週：密碼，以及你的密碼為什麼很爛（即將推出）", es: "Semana 4: Contraseñas, y por qué la tuya es mala (próximamente)", ja: "第4週：パスワード、そしてあなたのパスワードがダメな理由（近日公開）", "pt-BR": "Semana 4: Senhas, e por que a sua é ruim (em breve)" }),
      ],
    },
    { type: "link", text: x({ en: "Week 3 lesson: Binary →", ko: "3주차 수업: 이진법 →", "zh-TW": "第 3 週課程：二進位 →", es: "Lección de la semana 3: Binario →", ja: "第3週の授業：2進数 →", "pt-BR": "Aula da semana 3: Binário →" }), href: `${HARBOURCC_HOST}/cs110/binary` },
    {
      type: "paragraph",
      text: x({
        en: "Pass the Week 3 practice quiz and you can install the class Binary translator on your own machine.",
        ko: "3주차 연습 퀴즈를 통과하면 수업용 이진수 번역기를 내 컴퓨터에 설치할 수 있습니다.",
        "zh-TW": "通過第 3 週練習測驗，就能在自己的電腦上安裝課堂用的二進位翻譯器。",
        es: "Aprueba el cuestionario de práctica de la semana 3 y podrás instalar el traductor binario de la clase en tu propia máquina.",
        ja: "第3週の練習クイズに合格すると、授業用の2進数翻訳ツールを自分のマシンにインストールできます。",
        "pt-BR": "Passe no quiz de prática da semana 3 e você poderá instalar o tradutor binário da turma na sua própria máquina.",
      }),
    },
    footer(x),
  ];
  return page(`${HARBOURCC_HOST}/cs110`, x({ en: "CS 110: How Computers Count", ko: "CS 110: 컴퓨터는 어떻게 셈을 하나", "zh-TW": "CS 110：電腦怎麼數數", es: "CS 110: Cómo cuentan las computadoras", ja: "CS 110：コンピューターはどう数えるか", "pt-BR": "CS 110: Como os computadores contam" }), "harbourcc", blocks, {
    bodyComments: [
      x({
        en: "attendance this term: 4. one of them is Ada, and she keeps asking about checksums. — W.",
        ko: "이번 학기 수강생: 4명. 그중 하나가 에이다인데, 자꾸 체크섬 얘기를 묻는다. — W.",
        "zh-TW": "本學期出席人數：4。其中一個是艾達，她一直追問校驗和的事。——W.",
        es: "asistencia este período: 4. una de ellas es Ada, y no deja de preguntar por las sumas de verificación. — W.",
        ja: "今学期の出席者：4人。そのうち一人がエイダで、チェックサムのことばかり聞いてくる。— W.",
        "pt-BR": "frequência neste semestre: 4. uma delas é a Ada, e ela não para de perguntar sobre somas de verificação. — W.",
      }),
    ],
  });
}

/** 2⁰ to 2⁷ for the lesson's table (8 bits, as real computers use). */
const SUPERSCRIPT = ["⁰", "¹", "²", "³", "⁴", "⁵", "⁶", "⁷"];
const POWER_ROWS: string[][] = SUPERSCRIPT.map((sup, n) => [`2${sup}`, n === 0 ? "1" : Array(n).fill("2").join(" × "), String(2 ** n)]);

const SHEET_ROWS: string[][] = Array.from({ length: 26 }, (_, i) => [
  String.fromCharCode(65 + i),
  String(i + 1),
  (i + 1).toString(2).padStart(5, "0"),
]);

function lesson(x: X, progress: RoomProgress): SitePage {
  const passed = progress.solved.includes("binary-lesson");
  const blocks: Block[] = [
    nav(x),
    { type: "heading", level: 1, text: x({ en: "Week 3: Binary", ko: "3주차: 이진법", "zh-TW": "第 3 週：二進位", es: "Semana 3: Binario", ja: "第3週：2進数", "pt-BR": "Semana 3: Binário" }) },
    {
      type: "paragraph",
      text: x({
        en: "Computers only have two fingers: a switch is either off (0) or on (1). So instead of counting in tens, they count in twos.",
        ko: "컴퓨터에게는 손가락이 두 개뿐입니다. 스위치는 꺼짐(0) 아니면 켜짐(1)이죠. 그래서 컴퓨터는 10씩이 아니라 2씩 셉니다.",
        "zh-TW": "電腦只有兩根手指：開關不是關（0）就是開（1）。所以電腦不是十個十個數，而是兩個兩個數。",
        es: "Las computadoras solo tienen dos dedos: un interruptor está apagado (0) o encendido (1). Así que, en lugar de contar de diez en diez, cuentan de dos en dos.",
        ja: "コンピューターには指が2本しかありません。スイッチはオフ（0）かオン（1）のどちらかです。だから10ずつではなく、2ずつ数えるのです。",
        "pt-BR": "Computadores só têm dois dedos: um interruptor está desligado (0) ou ligado (1). Então, em vez de contar de dez em dez, eles contam de dois em dois.",
      }),
    },
    { type: "heading", level: 2, text: x({ en: "How binary works", ko: "이진법은 어떻게 작동할까", "zh-TW": "二進位怎麼運作", es: "Cómo funciona el binario", ja: "2進数のしくみ", "pt-BR": "Como o binário funciona" }) },
    {
      type: "paragraph",
      text: x({
        en: "You already know place values from ordinary numbers. In 345, the 5 means 5 ones, the 4 means 4 tens and the 3 means 3 hundreds. Each place is worth ten times the place to its right: 1, 10, 100, 1,000. Written as powers of ten, that's 10⁰, 10¹, 10², 10³.",
        ko: "자릿값은 평소에 쓰는 숫자에서 이미 알고 있어요. 345에서 5는 일이 5개, 4는 십이 4개, 3은 백이 3개라는 뜻이죠. 각 자리는 바로 오른쪽 자리의 10배입니다: 1, 10, 100, 1,000. 10의 거듭제곱으로 쓰면 10⁰, 10¹, 10², 10³이에요.",
        "zh-TW": "位值你其實早就懂了，平常用的數字就是這樣。在 345 裡，5 代表 5 個一，4 代表 4 個十，3 代表 3 個百。每一位都是右邊那一位的十倍：1、10、100、1,000。寫成 10 的次方，就是 10⁰、10¹、10²、10³。",
        es: "Ya conoces los valores posicionales de los números de siempre. En 345, el 5 significa 5 unidades, el 4 significa 4 decenas y el 3 significa 3 centenas. Cada posición vale diez veces la de su derecha: 1, 10, 100, 1000. Escrito como potencias de diez: 10⁰, 10¹, 10², 10³.",
        ja: "位の値は、ふだん使っている数でもうおなじみです。345 なら、5 は「1が5つ」、4 は「10が4つ」、3 は「100が3つ」という意味です。どの位も、すぐ右の位の10倍の値になっています：1、10、100、1,000。10の累乗で書くと 10⁰、10¹、10²、10³ です。",
        "pt-BR": "Você já conhece valores posicionais dos números do dia a dia. Em 345, o 5 significa 5 unidades, o 4 significa 4 dezenas e o 3 significa 3 centenas. Cada posição vale dez vezes a posição à sua direita: 1, 10, 100, 1.000. Em potências de dez: 10⁰, 10¹, 10², 10³.",
      }),
    },
    {
      type: "paragraph",
      text: x({
        en: "Binary works exactly the same way, except each place is worth two times the place to its right. Reading from the right, the places are 2⁰, 2¹, 2², 2³, 2⁴, and so on: 1, 2, 4, 8, 16. Any number to the power of 0 is 1, so the rightmost place is always the ones.",
        ko: "이진법도 똑같이 작동해요. 다만 각 자리가 바로 오른쪽 자리의 2배라는 점만 다릅니다. 오른쪽부터 읽으면 자리는 2⁰, 2¹, 2², 2³, 2⁴… 즉 1, 2, 4, 8, 16이에요. 어떤 수든 0제곱은 1이므로, 맨 오른쪽 자리는 언제나 일의 자리입니다.",
        "zh-TW": "二進位的道理完全一樣，只是每一位是右邊那一位的兩倍。從右邊讀起，各位依序是 2⁰、2¹、2²、2³、2⁴……也就是 1、2、4、8、16。任何數的 0 次方都是 1，所以最右邊那一位永遠是個位。",
        es: "El binario funciona exactamente igual, salvo que cada posición vale dos veces la de su derecha. Leyendo desde la derecha, las posiciones son 2⁰, 2¹, 2², 2³, 2⁴, etcétera: 1, 2, 4, 8, 16. Cualquier número elevado a 0 es 1, así que la posición de más a la derecha siempre son las unidades.",
        ja: "2進数もまったく同じしくみです。違うのは、どの位もすぐ右の位の2倍になっていることだけ。右から読むと、位は 2⁰、2¹、2²、2³、2⁴…つまり 1、2、4、8、16 です。どんな数も0乗は1なので、いちばん右の位はいつも「1の位」です。",
        "pt-BR": "O binário funciona exatamente do mesmo jeito, só que cada posição vale duas vezes a posição à sua direita. Lendo da direita, as posições são 2⁰, 2¹, 2², 2³, 2⁴ e assim por diante: 1, 2, 4, 8, 16. Qualquer número elevado a 0 é 1, então a posição mais à direita é sempre a das unidades.",
      }),
    },
    {
      type: "table",
      caption: x({ en: "Powers of two", ko: "2의 거듭제곱", "zh-TW": "2 的次方", es: "Potencias de dos", ja: "2の累乗", "pt-BR": "Potências de dois" }),
      columns: [
        x({ en: "Power", ko: "거듭제곱", "zh-TW": "次方", es: "Potencia", ja: "累乗", "pt-BR": "Potência" }),
        x({ en: "Multiplied out", ko: "풀어 쓰면", "zh-TW": "展開", es: "Desarrollada", ja: "かけ算で書くと", "pt-BR": "Por extenso" }),
        x({ en: "Value", ko: "값", "zh-TW": "值", es: "Valor", ja: "値", "pt-BR": "Valor" }),
      ],
      rows: POWER_ROWS,
    },
    {
      type: "paragraph",
      text: x({
        en: "Each place holds a 0 (off) or a 1 (on). To read a binary number, add up the values of the places that hold a 1. For example, 1011 is 8 + 0 + 2 + 1 = 11. With five places, the biggest number you can make is 11111 = 16 + 8 + 4 + 2 + 1 = 31, which is plenty for 26 letters.",
        ko: "각 자리에는 0(꺼짐)이나 1(켜짐)이 들어갑니다. 이진수를 읽으려면 1이 들어 있는 자리의 값을 모두 더하세요. 예를 들어 1011은 8 + 0 + 2 + 1 = 11이에요. 다섯 자리로 만들 수 있는 가장 큰 수는 11111 = 16 + 8 + 4 + 2 + 1 = 31이라서, 26글자를 담기에 충분합니다.",
        "zh-TW": "每一位放的是 0（關）或 1（開）。要讀一個二進位數，就把放著 1 的那些位的值加起來。例如 1011 是 8 + 0 + 2 + 1 = 11。用五位能組出的最大數是 11111 = 16 + 8 + 4 + 2 + 1 = 31，裝下 26 個字母綽綽有餘。",
        es: "Cada posición contiene un 0 (apagado) o un 1 (encendido). Para leer un número binario, suma los valores de las posiciones que tienen un 1. Por ejemplo, 1011 es 8 + 0 + 2 + 1 = 11. Con cinco posiciones, el número más grande que puedes formar es 11111 = 16 + 8 + 4 + 2 + 1 = 31, de sobra para 26 letras.",
        ja: "どの位にも 0（オフ）か 1（オン）が入ります。2進数を読むには、1 が入っている位の値を足すだけ。たとえば 1011 は 8 + 0 + 2 + 1 = 11 です。5桁で作れるいちばん大きな数は 11111 = 16 + 8 + 4 + 2 + 1 = 31 なので、26文字には十分です。",
        "pt-BR": "Cada posição guarda um 0 (desligado) ou um 1 (ligado). Para ler um número binário, some os valores das posições que têm 1. Por exemplo, 1011 é 8 + 0 + 2 + 1 = 11. Com cinco posições, o maior número que dá para formar é 11111 = 16 + 8 + 4 + 2 + 1 = 31, mais do que suficiente para 26 letras.",
      }),
    },
    {
      type: "paragraph",
      text: x({
        en: "Counting up works like a car's odometer that only has the digits 0 and 1: 0, 1, 10, 11, 100, 101, 110, 111, 1000. When a place is already 1 and you add one more, it rolls back to 0 and carries 1 to the place on its left.",
        ko: "숫자를 하나씩 늘려 가는 건 0과 1만 있는 자동차 주행 거리계 같아요: 0, 1, 10, 11, 100, 101, 110, 111, 1000. 이미 1인 자리에 하나를 더하면 그 자리는 0으로 돌아가고, 왼쪽 자리로 1을 올립니다.",
        "zh-TW": "往上數就像一個只有 0 和 1 的汽車里程表：0、1、10、11、100、101、110、111、1000。某一位已經是 1 時再加一，它就會歸 0，並往左邊那一位進 1。",
        es: "Contar hacia arriba funciona como el cuentakilómetros de un coche que solo tuviera los dígitos 0 y 1: 0, 1, 10, 11, 100, 101, 110, 111, 1000. Cuando una posición ya es 1 y sumas uno más, vuelve a 0 y se lleva 1 a la posición de su izquierda.",
        ja: "数を数え上げていくのは、0 と 1 しかない車の走行距離計のようなものです：0、1、10、11、100、101、110、111、1000。すでに 1 の位にもう1を足すと、その位は 0 に戻り、左の位へ 1 繰り上がります。",
        "pt-BR": "Contar para cima funciona como o hodômetro de um carro que só tivesse os dígitos 0 e 1: 0, 1, 10, 11, 100, 101, 110, 111, 1000. Quando uma posição já é 1 e você soma mais um, ela volta a 0 e leva 1 para a posição à esquerda.",
      }),
    },
    { type: "heading", level: 2, text: x({ en: "Place values", ko: "자릿값", "zh-TW": "位值", es: "Valores posicionales", ja: "位の値", "pt-BR": "Valores posicionais" }) },
    {
      type: "paragraph",
      text: x({
        en: "In our class code every letter is five switches. From left to right the switches are worth 16, 8, 4, 2 and 1 (2⁴ down to 2⁰). Add up the values of the switches that are on. That number is the letter: A is 1, B is 2, all the way to Z at 26.",
        ko: "우리 수업 암호에서는 글자 하나가 스위치 다섯 개입니다. 왼쪽부터 각 스위치의 값은 16, 8, 4, 2, 1입니다(2⁴부터 2⁰까지). 켜진 스위치의 값을 모두 더하세요. 그 숫자가 곧 글자입니다. A는 1, B는 2, 그렇게 Z는 26까지 갑니다.",
        "zh-TW": "在我們的課堂密碼裡，每個字母由五個開關組成。由左到右，各開關的值分別是 16, 8, 4, 2, 1（也就是 2⁴ 到 2⁰）。把開著的開關的值加起來，那個數字就是字母：A 是 1，B 是 2，一路到 Z 是 26。",
        es: "En nuestro código de clase, cada letra son cinco interruptores. De izquierda a derecha, los interruptores valen 16, 8, 4, 2 y 1 (de 2⁴ a 2⁰). Suma los valores de los interruptores encendidos. Ese número es la letra: la A es 1, la B es 2, y así hasta la Z, que es 26.",
        ja: "このクラスの暗号では、1文字がスイッチ5個でできています。左から順に、スイッチの値は 16, 8, 4, 2, 1 です（2⁴ から 2⁰ まで）。オンになっているスイッチの値を足しましょう。その数が文字を表します。A が 1、B が 2、と続いて Z が 26 です。",
        "pt-BR": "No código da nossa turma, cada letra são cinco interruptores. Da esquerda para a direita, os interruptores valem 16, 8, 4, 2 e 1 (de 2⁴ a 2⁰). Some os valores dos interruptores ligados. Esse número é a letra: A é 1, B é 2, e assim por diante até o Z, que é 26.",
      }),
    },
    {
      type: "paragraph",
      text: x({
        en: "Worked example: 01000. Only the 8 switch is on, so it's 8, and the 8th letter is H. Another: 10011 is 16 + 2 + 1 = 19, which is S.",
        ko: "예시: 01000. 8 스위치만 켜져 있으니 8이고, 여덟 번째 글자는 H입니다. 하나 더: 10011은 16 + 2 + 1 = 19, 즉 S입니다.",
        "zh-TW": "範例：01000。只有 8 那個開關是開的，所以是 8，第 8 個字母是 H。再一個：10011 是 16 + 2 + 1 = 19，也就是 S。",
        es: "Ejemplo resuelto: 01000. Solo está encendido el interruptor del 8, así que es 8, y la 8.ª letra es la H. Otro: 10011 es 16 + 2 + 1 = 19, que es la S.",
        ja: "例題：01000。オンなのは 8 のスイッチだけなので 8、8番目の文字は H です。もう一つ：10011 は 16 + 2 + 1 = 19 で、S です。",
        "pt-BR": "Exemplo resolvido: 01000. Só o interruptor do 8 está ligado, então é 8, e a 8ª letra é o H. Outro: 10011 é 16 + 2 + 1 = 19, que é o S.",
      }),
    },
    { type: "heading", level: 2, text: x({ en: "Try it", ko: "직접 해 보기", "zh-TW": "動手試試", es: "Pruébalo", ja: "やってみよう", "pt-BR": "Experimente" }) },
    { type: "paragraph", text: x({ en: "Tap the switches to turn them on and off.", ko: "스위치를 탭해서 켜고 꺼 보세요.", "zh-TW": "點一下開關，把它們打開或關上。", es: "Toca los interruptores para encenderlos y apagarlos.", ja: "スイッチをタップして、オン・オフを切り替えてみましょう。", "pt-BR": "Toque nos interruptores para ligá-los e desligá-los." }) },
    { type: "bits" },
    { type: "heading", level: 2, text: x({ en: "Decoding sheet", ko: "해독표", "zh-TW": "解碼表", es: "Hoja de decodificación", ja: "解読表", "pt-BR": "Tabela de decodificação" }) },
    {
      type: "table",
      caption: x({ en: "Class code: one letter, five bits", ko: "수업 암호: 글자 하나에 5비트", "zh-TW": "課堂密碼：一個字母，五個位元", es: "Código de clase: una letra, cinco bits", ja: "クラスの暗号：1文字＝5ビット", "pt-BR": "Código da turma: uma letra, cinco bits" }),
      columns: [x({ en: "Letter", ko: "글자", "zh-TW": "字母", es: "Letra", ja: "文字", "pt-BR": "Letra" }), x({ en: "Number", ko: "숫자", "zh-TW": "數字", es: "Número", ja: "数", "pt-BR": "Número" }), x({ en: "Binary", ko: "이진수", "zh-TW": "二進位", es: "Binario", ja: "2進数", "pt-BR": "Binário" })],
      rows: SHEET_ROWS,
    },
    { type: "heading", level: 2, text: x({ en: "Practice quiz", ko: "연습 퀴즈", "zh-TW": "練習測驗", es: "Cuestionario de práctica", ja: "練習クイズ", "pt-BR": "Quiz de prática" }) },
    passed
      ? {
          type: "notice",
          tone: "success",
          text: x({
            en: "Quiz passed. The class Binary translator is installed in your Decoder.",
            ko: "퀴즈 통과. 수업용 이진수 번역기가 해독기에 설치되었습니다.",
            "zh-TW": "測驗通過。課堂用的二進位翻譯器已安裝到你的解碼器。",
            es: "Cuestionario aprobado. El traductor binario de la clase está instalado en tu Decodificador.",
            ja: "クイズ合格。授業用の2進数翻訳ツールがデコーダーにインストールされました。",
            "pt-BR": "Quiz concluído. O tradutor binário da turma está instalado no seu Decodificador.",
          }),
        }
      : {
          type: "paragraph",
          text: x({
            en: "Decode this word with the sheet, then type it in. Pass and the class Binary translator installs on your machine.",
            ko: "해독표로 이 단어를 풀어서 입력하세요. 통과하면 수업용 이진수 번역기가 내 컴퓨터에 설치됩니다.",
            "zh-TW": "用解碼表解出這個單字，然後輸入。通過後，課堂用的二進位翻譯器就會安裝到你的電腦上。",
            es: "Decodifica esta palabra con la hoja y luego escríbela. Si apruebas, el traductor binario de la clase se instala en tu máquina.",
            ja: "解読表を使ってこの単語を解読し、入力してください。合格すると、授業用の2進数翻訳ツールがあなたのマシンにインストールされます。",
            "pt-BR": "Decodifique esta palavra com a tabela e depois digite-a. Se passar, o tradutor binário da turma é instalado na sua máquina.",
          }),
        },
    { type: "form", form: "binary-quiz", prompt: toBinary5(BINARY_PRACTICE_WORD) },
    footer(x),
  ];
  return page(`${HARBOURCC_HOST}/cs110/binary`, x({ en: "Week 3: Binary", ko: "3주차: 이진법", "zh-TW": "第 3 週：二進位", es: "Semana 3: Binario", ja: "第3週：2進数", "pt-BR": "Semana 3: Binário" }), "harbourcc", blocks, {
    bodyComments: [
      x({
        en: "yes, real computers use 8 bits and a different table. this is a class, not a job. — W.O.",
        ko: "네, 실제 컴퓨터는 8비트에 다른 표를 씁니다. 이건 수업이지 실무가 아니에요. — W.O.",
        "zh-TW": "對，真正的電腦用的是 8 位元和另一張表。這是上課，不是上班。——W.O.",
        es: "sí, las computadoras de verdad usan 8 bits y otra tabla. esto es una clase, no un trabajo. — W.O.",
        ja: "はい、本物のコンピューターは8ビットで、表も違います。これは授業であって、仕事じゃありません。— W.O.",
        "pt-BR": "sim, computadores de verdade usam 8 bits e outra tabela. isto é uma aula, não um emprego. — W.O.",
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
