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
    title: { en: "Pepper — black Labrador, male", ko: "Pepper — 검은색 래브라도, 수컷", "zh-TW": "Pepper — 黑色拉布拉多，公", es: "Pepper — labrador negro, macho", ja: "Pepper — 黒のラブラドール、オス", "pt-BR": "Pepper — labrador preto, macho" },
    meta: { en: "Lost · Canal Row · 6 days ago · reward offered", ko: "실종 · 커낼 로(Canal Row) · 6일 전 · 사례금 있음", "zh-TW": "走失 · 運河街（Canal Row） · 6 天前 · 有酬謝", es: "Perdido · Canal Row · hace 6 días · se ofrece recompensa", ja: "迷子 · キャナル・ロウ（Canal Row） · 6日前 · 謝礼あり", "pt-BR": "Perdido · Canal Row · há 6 dias · oferece-se recompensa" },
    petId: "0219",
  },
  {
    title: { en: "Biscuit — tabby, female, white socks", ko: "Biscuit — 태비, 암컷, 하얀 양말 무늬", "zh-TW": "Biscuit — 虎斑貓，母，白襪子花紋", es: "Biscuit — atigrada, hembra, patitas blancas", ja: "Biscuit — キジトラ、メス、足先が白い", "pt-BR": "Biscuit — rajada, fêmea, patinhas brancas" },
    meta: { en: "Lost · Harbour Street · 3 days ago · microchipped", ko: "실종 · 하버 스트리트(Harbour Street) · 3일 전 · 마이크로칩 있음", "zh-TW": "走失 · 港灣街（Harbour Street） · 3 天前 · 已植入晶片", es: "Perdida · Harbour Street · hace 3 días · con microchip", ja: "迷子 · ハーバー・ストリート（Harbour Street） · 3日前 · マイクロチップあり", "pt-BR": "Perdida · Harbour Street · há 3 dias · com microchip" },
    petId: "0412",
  },
  {
    title: { en: "Mr. Fennimore — grey rabbit", ko: "Mr. Fennimore — 회색 토끼", "zh-TW": "Mr. Fennimore — 灰色兔子", es: "Mr. Fennimore — conejo gris", ja: "Mr. Fennimore — 灰色のウサギ", "pt-BR": "Mr. Fennimore — coelho cinza" },
    meta: { en: "Found · Old Customs House steps · 2 days ago", ko: "발견 · 옛 세관 건물 계단 · 2일 전", "zh-TW": "尋獲 · 舊海關大樓階梯 · 2 天前", es: "Encontrado · escalinata de la antigua Aduana · hace 2 días", ja: "保護 · 旧税関の階段 · 2日前", "pt-BR": "Encontrado · escadaria da antiga Alfândega · há 2 dias" },
    petId: "0733",
  },
  {
    title: { en: "Juno — collie mix, female", ko: "Juno — 콜리 믹스, 암컷", "zh-TW": "Juno — 牧羊犬混種，母", es: "Juno — mestiza de collie, hembra", ja: "Juno — コリーのミックス、メス", "pt-BR": "Juno — vira-lata com collie, fêmea" },
    meta: { en: "Lost · Ferry Terminal · 9 days ago · shy, do not chase", ko: "실종 · 페리 터미널 · 9일 전 · 겁이 많음, 쫓지 마세요", "zh-TW": "走失 · 渡輪碼頭 · 9 天前 · 很怕生，請勿追趕", es: "Perdida · terminal del ferri · hace 9 días · es tímida, no la persigas", ja: "迷子 · フェリーターミナル · 9日前 · 臆病なので追いかけないで", "pt-BR": "Perdida · terminal das barcas · há 9 dias · é medrosa, não corra atrás dela" },
    petId: "1150",
  },
  {
    title: { en: "Sardine — ginger cat, male", ko: "Sardine — 치즈 고양이, 수컷", "zh-TW": "Sardine — 橘貓，公", es: "Sardine — gato naranja, macho", ja: "Sardine — 茶トラ猫、オス", "pt-BR": "Sardine — gato laranja, macho" },
    meta: { en: "Found · Meridian Institute loading dock · yesterday", ko: "발견 · 메리디언 연구소(Meridian Institute) 하역장 · 어제", "zh-TW": "尋獲 · 子午研究院（Meridian Institute）卸貨區 · 昨天", es: "Encontrado · muelle de carga del Instituto Meridian · ayer", ja: "保護 · メリディアン研究所（Meridian Institute）搬入口 · 昨日", "pt-BR": "Encontrado · doca de carga do Instituto Meridian · ontem" },
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
        "zh-TW": "舊港口一帶走失與尋獲動物的社區佈告欄。每一則刊登，都是窗邊為牠們留著的一盞小燈。",
        es: "Un tablón vecinal para animales perdidos y encontrados en los alrededores del viejo puerto. Cada anuncio es una lucecita que se deja encendida en una ventana.",
        ja: "旧港のまわりで迷子になった動物、保護された動物のための地域掲示板です。ひとつひとつの投稿が、窓辺に灯しておく小さな明かりです。",
        "pt-BR": "Um mural do bairro para animais perdidos e encontrados nos arredores do porto velho. Cada anúncio é uma luzinha deixada acesa numa janela.",
      }),
    },
    decoded
      ? {
          type: "notice",
          tone: "success",
          text: x({
            en: "Listings restored. Our volunteer's descriptions now read correctly.",
            ko: "게시글이 복구되었습니다. 이제 봉사자가 쓴 설명이 제대로 보여요.",
            "zh-TW": "刊登內容已恢復。志工寫的描述現在可以正常閱讀了。",
            es: "Anuncios restaurados. Las descripciones de nuestro voluntario ya se leen correctamente.",
            ja: "投稿を復元しました。ボランティアの説明文が正しく読めるようになりました。",
            "pt-BR": "Anúncios restaurados. As descrições do nosso voluntário agora aparecem corretamente.",
          }),
        }
      : {
          type: "notice",
          tone: "warning",
          text: x({
            en: "Our listing descriptions were scrambled after a volunteer changed a setting. They swear they only turned a dial a few notches. If you know the key, enter it below.",
            ko: "봉사자 한 분이 설정을 바꾼 뒤로 게시글 설명이 뒤죽박죽이 됐어요. 다이얼을 몇 칸 돌렸을 뿐이라고 하네요. 키를 아신다면 아래에 입력해 주세요.",
            "zh-TW": "一位志工改了某個設定之後，我們的刊登描述就全亂了。他發誓自己只是把轉盤轉了幾格。如果您知道金鑰，請在下方輸入。",
            es: "Las descripciones de nuestros anuncios se desordenaron después de que un voluntario cambió una configuración. Jura que solo giró el dial unas cuantas muescas. Si conoces la clave, escríbela abajo.",
            ja: "ボランティアが設定を変えてから、投稿の説明文がめちゃくちゃになってしまいました。本人いわく、ダイヤルを何目盛りか回しただけだそうです。キーをご存じでしたら、下に入力してください。",
            "pt-BR": "As descrições dos nossos anúncios ficaram embaralhadas depois que um voluntário mudou uma configuração. Ele jura que só girou o mostrador alguns entalhes. Se você souber a chave, digite abaixo.",
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
              "zh-TW": "恢復刊登內容——轉盤被轉了幾格？",
              es: "Restaurar anuncios — ¿cuántas muescas se giró el dial?",
              ja: "投稿を復元 — ダイヤルは何目盛り回されたのでしょう？",
              "pt-BR": "Restaurar anúncios — quantos entalhes o mostrador foi girado?",
            }),
          } as Block,
        ]),
    {
      type: "paragraph",
      text: x({
        en: "Microchipped pets are listed with their registry ID. If you find an animal, please do not feed it rich food — bring it to the Harbour Street shelter.",
        ko: "마이크로칩이 있는 동물은 등록 번호와 함께 올라갑니다. 동물을 발견하시면 기름진 음식은 주지 마시고 하버 스트리트(Harbour Street) 보호소로 데려와 주세요.",
        "zh-TW": "已植入晶片的寵物會附上登記編號。如果您發現動物，請不要餵牠吃油膩的食物——請帶到港灣街（Harbour Street）收容所。",
        es: "Las mascotas con microchip aparecen con su número de registro. Si encuentras un animal, por favor no le des comida pesada: llévalo al refugio de Harbour Street.",
        ja: "マイクロチップのある動物は登録番号つきで掲載しています。動物を見つけたら、脂っこい食べ物は与えず、ハーバー・ストリート（Harbour Street）の保護施設へ連れてきてください。",
        "pt-BR": "Pets com microchip aparecem com o número de registro. Se você encontrar um animal, por favor não dê comida pesada: leve-o ao abrigo da Harbour Street.",
      }),
    },
    { type: "footer", text: x({ en: "Lost Paws — run by volunteers. Bring them home.", ko: "Lost Paws — 봉사자들이 운영합니다. 집으로 데려다주세요.", "zh-TW": "Lost Paws — 由志工經營。帶牠們回家。", es: "Lost Paws — gestionado por voluntarios. Llevémoslos a casa.", ja: "Lost Paws — ボランティアが運営しています。おうちに帰してあげましょう。", "pt-BR": "Lost Paws — mantido por voluntários. Vamos levá-los para casa." }) },
  ];
  return page(LOSTPAWS_HOST, x({ en: "Lost Paws — Harbour District", ko: "Lost Paws — 하버 지구", "zh-TW": "Lost Paws — 港灣區", es: "Lost Paws — Distrito del Puerto", ja: "Lost Paws — ハーバー地区", "pt-BR": "Lost Paws — Distrito do Porto" }), "lostpaws", blocks, {
    headComments: [x({ en: "lostpaws board — volunteer build", ko: "lostpaws 게시판 — 봉사자 제작", "zh-TW": "lostpaws 佈告欄 — 志工製作", es: "tablón lostpaws — hecho por voluntarios", ja: "lostpaws 掲示板 — ボランティア製作", "pt-BR": "mural lostpaws — feito por voluntários" })],
    bodyComments: decoded
      ? [x({ en: "descriptions restored", ko: "설명 복구됨", "zh-TW": "描述已恢復", es: "descripciones restauradas", ja: "説明文を復元済み", "pt-BR": "descrições restauradas" })]
      : [
          x({
            en: "descriptions encoded with legacy rotate() — volunteer forgot the setting. it's a small number.",
            ko: "설명은 구형 rotate()로 인코딩됨 — 봉사자가 설정값을 잊어버림. 작은 숫자임.",
            "zh-TW": "描述以舊版 rotate() 編碼——志工忘了設定值。是個很小的數字。",
            es: "descripciones codificadas con el antiguo rotate() — el voluntario olvidó la configuración. es un número pequeño.",
            ja: "説明文は旧式の rotate() でエンコード — ボランティアが設定値を忘れた。小さい数字。",
            "pt-BR": "descrições codificadas com o antigo rotate() — o voluntário esqueceu a configuração. é um número pequeno.",
          }),
        ],
    tailComments: [
      x({
        en: "listing for Biscuit posted by a friend of the owner, owner 'can't come in person right now'",
        ko: "Biscuit 게시글은 주인의 친구가 올림. 주인은 '지금은 직접 올 수 없다'고 함",
        "zh-TW": "Biscuit 的刊登是飼主的朋友貼的，飼主「現在沒辦法親自過來」",
        es: "el anuncio de Biscuit lo publicó una amistad de la dueña; la dueña 'no puede venir en persona ahora mismo'",
        ja: "Biscuit の投稿は飼い主の友人によるもの。飼い主は「いまは直接来られない」とのこと",
        "pt-BR": "o anúncio da Biscuit foi postado por uma amiga da dona; a dona 'não pode vir pessoalmente agora'",
      }),
    ],
  });
}

export function resolveLostpaws(path: string, progress: RoomProgress, loc: Locale): SitePage | null {
  return path === "" ? home(progress, loc) : null;
}
