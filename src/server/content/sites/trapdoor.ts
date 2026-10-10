import "server-only";
import { pick, type Locale } from "@/i18n/config";
import type { Block, RoomProgress, SitePage } from "@/lib/types";
import { page } from "./source";

export const TRAPDOOR_HOST = "trapdoor.net";

function home(x: ReturnType<typeof pick>): SitePage {
  const blocks: Block[] = [
    { type: "notice", tone: "danger", text: x({ en: "CONNECTION LOGGED.", ko: "접속이 기록되었습니다.", "zh-TW": "連線已記錄。", es: "CONEXIÓN REGISTRADA.", ja: "接続を記録しました。" }) },
    { type: "heading", level: 1, text: x({ en: "You followed the wrong needle.", ko: "당신은 엉뚱한 바늘을 따라왔습니다.", "zh-TW": "你跟錯了指針。", es: "Siguió la aguja equivocada.", ja: "あなたは間違った針をたどってきました。" }) },
    {
      type: "paragraph",
      text: x({ en: "Hello, investigator. We wondered how long it would take.", ko: "안녕하십니까, 탐정님. 얼마나 걸릴지 궁금하던 참이었습니다.", "zh-TW": "你好，調查員。我們正好奇你要花多久才會到這裡。", es: "Hola, investigador. Nos preguntábamos cuánto tardaría.", ja: "こんにちは、調査員。どれほどかかるものかと思っておりました。" }),
    },
    {
      type: "paragraph",
      text: x({
        en: "Dr. Voss was a gifted archivist and a troubled woman. She saw patterns in coffee stains and conspiracies in typographical errors. The people who loved her are grieving. You are being paid to keep that grief open.",
        ko: "보스 박사는 재능 있는 기록연구사였고, 동시에 위태로운 사람이었습니다. 커피 얼룩에서 패턴을, 오탈자에서 음모를 보던 사람이었지요. 그녀를 사랑했던 이들은 슬픔에 잠겨 있습니다. 당신은 그 상처를 계속 벌려 두는 대가로 돈을 받고 있고요.", "zh-TW": "佛斯博士是一位才華洋溢的檔案管理員，也是一個內心不安的女人。她能在咖啡漬裡看出規律，在錯字裡看出陰謀。愛她的人正沉浸在悲傷之中，而你收錢，就是為了讓這道傷口一直無法癒合。", es: "La Dra. Voss era una archivista talentosa y una mujer atormentada. Veía patrones en las manchas de café y conspiraciones en las erratas. Quienes la querían están de duelo. A usted le pagan por mantener abierta esa herida.", ja: "ヴォス博士は優れたアーキビストであり、同時に心を病んだ女性でした。コーヒーの染みにパターンを、誤植に陰謀を見る人でした。彼女を愛した人々は悲しみの中にいます。あなたはその傷口を開いたままにしておくために報酬を受け取っているのです。",
      }),
    },
    {
      type: "paragraph",
      text: x({
        en: "There is nothing behind this door. There never was. The account you followed was ours, and every timestamp you decoded was written for you to decode. Consider this a courtesy.",
        ko: "이 문 뒤에는 아무것도 없습니다. 처음부터 없었습니다. 당신이 따라온 계정은 우리 것이었고, 당신이 해독한 타임스탬프는 전부 당신이 해독하라고 써 둔 것입니다. 이건 일종의 호의로 받아들이십시오.", "zh-TW": "這扇門後面什麼都沒有，從來就沒有。你追蹤的帳號是我們的，你解開的每一個時間戳記，都是寫給你解的。請把這當作一份善意的提醒。", es: "No hay nada detrás de esta puerta. Nunca lo hubo. La cuenta que siguió era nuestra, y cada marca de tiempo que descifró fue escrita para que usted la descifrara. Considérelo una cortesía.", ja: "この扉の向こうには何もありません。最初から何もなかったのです。あなたがたどってきたアカウントは私たちのものであり、あなたが解読したタイムスタンプはすべて、あなたに解読させるために書かれたものです。これはささやかな厚意とお考えください。",
      }),
    },
    {
      type: "paragraph",
      text: x({ en: "Go home. Close the laptop. Let the record rest.", ko: "집으로 돌아가십시오. 노트북을 덮으십시오. 기록은 그대로 두십시오.", "zh-TW": "回家吧。闔上筆電。讓紀錄安息。", es: "Vuelva a casa. Apague el equipo. Deje que el registro descanse.", ja: "お帰りください。ノートパソコンを閉じてください。記録をそっとしておいてください。" }),
    },
    { type: "compass" },
    { type: "paragraph", text: x({ en: "— The Office of Continuity, Meridian Institute", ko: "— 메리디언 연구소 연속성 관리실", "zh-TW": "— 子午研究院 連續性辦公室", es: "— Oficina de Continuidad, Instituto Meridian", ja: "— メリディアン研究所 継続性管理室" }) },
    {
      type: "footer",
      text: x({ en: "This page is monitored. Your visit has been reconciled.", ko: "이 페이지는 감시되고 있습니다. 당신의 방문은 정리되었습니다.", "zh-TW": "本頁面受到監控。您的造訪已被校正。", es: "Esta página está vigilada. Su visita ha sido conciliada.", ja: "このページは監視されています。あなたの訪問は整合されました。" }),
    },
  ];
  return page(TRAPDOOR_HOST, "trapdoor.net", "honeypot", blocks, {
    headComments: [x({ en: "honeypot v2 — log visitor, notify T.K.", ko: "허니팟 v2 — 방문자 기록, T.K.에게 통보", "zh-TW": "誘捕頁 v2 — 記錄訪客，通知 T.K.", es: "honeypot v2 — registrar al visitante, avisar a T.K.", ja: "ハニーポット v2 — 訪問者を記録し、T.K. に通知" })],
    bodyComments: [
      x({
        en: "if they got here they found the sock account. the real one still posts. check whose needle points true.",
        ko: "여기까지 왔다면 위장 계정을 찾은 거다. 진짜 계정은 아직도 글을 올린다. 누구의 바늘이 제대로 가리키는지 확인할 것.", "zh-TW": "能走到這裡，代表他們找到分身帳號了。真正的帳號還在發文。查清楚是誰的指針指得正。", es: "si llegaron hasta aquí, encontraron la cuenta falsa. la verdadera todavía publica. revisar de quién es la aguja que señala la verdad.", ja: "ここまで来たなら、偽装アカウントは見つけている。本物のアカウントは今も投稿を続けている。どちらの針が真実を指しているか確認すること。",
      }),
      x({
        en: "reminder: our account's name is the mirror image. hers came first.",
        ko: "참고: 우리 계정 이름은 거울에 비친 모양이다. 그녀의 이름이 먼저였다.", "zh-TW": "備忘：我們帳號的名字是鏡像倒過來的。她的名字在先。", es: "recordatorio: el nombre de nuestra cuenta es su imagen en el espejo. el de ella fue primero.", ja: "備考：こちらのアカウント名は鏡像だ。彼女の名前が先だった。",
      }),
    ],
    tailComments: [x({ en: "DO NOT link this page from anywhere. — L.A.", ko: "이 페이지는 어디에도 링크하지 말 것. — L.A.", "zh-TW": "不准在任何地方連結到這個頁面。— L.A.", es: "NO enlazar esta página desde ningún sitio. — L.A.", ja: "このページをどこからもリンクしないこと。— L.A." })],
  });
}

export function resolveTrapdoor(path: string, _progress: RoomProgress, loc: Locale): SitePage | null {
  return path === "" ? home(pick(loc)) : null;
}
