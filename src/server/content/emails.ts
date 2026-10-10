import "server-only";
import { pick, type Locale, type Tr } from "@/i18n/config";
import type { EmailDTO, HintDTO, RoomProgress } from "@/lib/types";
import { HINT_PUZZLES, HINT_TITLES } from "./hints";

const SISTER = "Mara Voss <mara.voss@harbourmail.net>";
const ADA = "Ada Voss";

export function baseEmails(loc: Locale): EmailDTO[] {
  const x = pick(loc);
  return [
    {
      id: "email-ada-last",
      from: "Ada Voss <ada@ada-voss.net>",
      subject: x({ en: "(no subject)", ko: "(제목 없음)", "zh-TW": "（無主旨）", es: "(sin asunto)", ja: "（件名なし）", "pt-BR": "(sem assunto)" }),
      date: x({ en: "2 days ago, 23:57", ko: "2일 전 23:57", "zh-TW": "2 天前 23:57", es: "hace 2 días, 23:57", ja: "2日前 23:57", "pt-BR": "há 2 dias, 23:57" }),
      kind: "email",
      body: x({
        en: [
          "If you're reading this, I got too close. Start at the beginning.",
          "",
          "meridian-inst.net",
          "",
          "— A.",
          "",
          "P.S. Pack my tools before you go anywhere. They're in Files on this laptop, locked the way family locks things. Mara will tell you more than she means to.",
        ].join("\n"),
        ko: [
          "이걸 읽고 있다면, 내가 너무 가까이 갔던 거야. 처음부터 시작해.",
          "",
          "meridian-inst.net",
          "",
          "— A.",
          "",
          "추신. 어디 가기 전에 내 도구부터 챙겨. 이 노트북의 파일(Files)에 있어. 가족끼리 잠그는 방식으로 잠가 뒀어. 마라는 본인이 의도한 것보다 더 많은 걸 말해 줄 거야.",
        ].join("\n"),
        "zh-TW": [
          "如果你正在讀這封信，代表我靠得太近了。從頭開始。",
          "",
          "meridian-inst.net",
          "",
          "— A.",
          "",
          "附註：去任何地方之前，先把我的工具帶上。它們在這台筆電的檔案（Files）裡，用家人才懂的方式鎖著。瑪拉（Mara）會告訴你的，比她自己打算說的還多。",
        ].join("\n"),
        es: [
          "Si estás leyendo esto, me acerqué demasiado. Empieza por el principio.",
          "",
          "meridian-inst.net",
          "",
          "— A.",
          "",
          "P. D.: Antes de ir a cualquier parte, llévate mis herramientas. Están en Archivos (Files), en esta laptop, cerradas como la familia cierra las cosas. Mara te contará más de lo que pretende.",
        ].join("\n"),
        ja: [
          "これを読んでいるなら、わたしは近づきすぎた。最初から始めて。",
          "",
          "meridian-inst.net",
          "",
          "— A.",
          "",
          "追伸：どこかへ行く前に、わたしの道具を持っていって。このノートパソコンのファイル（Files）の中にある。家族がするやり方で鍵をかけてある。マーラ（Mara）は、本人が思っている以上のことを話してくれるはず。",
        ].join("\n"),
        "pt-BR": [
          "Se você está lendo isto, eu cheguei perto demais. Comece pelo começo.",
          "",
          "meridian-inst.net",
          "",
          "— A.",
          "",
          "P.S.: Antes de ir a qualquer lugar, leve as minhas ferramentas. Estão em Arquivos (Files), neste notebook, trancadas do jeito que a família tranca as coisas. A Mara vai contar mais do que pretende.",
        ].join("\n"),
      }),
    },
    {
      id: "email-sister-engagement",
      from: SISTER,
      subject: x({
        en: "The job — and some news I didn't want to share like this",
        ko: "의뢰 건, 그리고 이런 식으로 전하고 싶지 않았던 소식",
        "zh-TW": "委託的事，還有一個我不想用這種方式告訴您的消息",
        es: "El encargo — y una noticia que no quería darle así",
        ja: "依頼の件と、こんな形でお伝えしたくなかった知らせ",
        "pt-BR": "O trabalho — e uma notícia que eu não queria dar desse jeito",
      }),
      date: x({ en: "Yesterday, 08:14", ko: "어제 08:14", "zh-TW": "昨天 08:14", es: "Ayer, 08:14", ja: "昨日 08:14", "pt-BR": "Ontem, 08:14" }),
      kind: "email",
      body: x({
        en: [
          "Hi,",
          "",
          "Thank you for taking this on. I know the police think it's nothing. They keep saying 'grown woman, extended leave, she'll turn up'. The Institute said the same, in exactly the same words, which is half the reason I don't believe them.",
          "",
          "Ada and I haven't really spoken in two years. It was a stupid fight about our father's papers. She thought he'd been mixed up in something at the harbour; I told her she was seeing ghosts in ledgers. I'd give anything to have that conversation back.",
          "",
          "The other reason I'm writing — I'm getting married. Tom proposed last month, and we've booked the party for March 14. That's Ada's birthday. I picked it on purpose. I thought if I invited her on her own birthday she couldn't say no. She should be at my engagement party on her birthday, March 14, laughing at Tom's terrible speech. She has to be there.",
          "",
          "I've forwarded you her last email. I've given you her laptop login. Whatever you find, please tell me the truth. Even if it's bad.",
          "",
          "Mara",
        ].join("\n"),
        ko: [
          "안녕하세요,",
          "",
          "이 일을 맡아 주셔서 고마워요. 경찰은 별일 아니라고 생각하는 거 알아요. '성인 여성이고, 장기 휴가 중이고, 곧 나타날 거다'라는 말만 반복하죠. 연구소도 똑같은 말을 했어요. 토씨 하나 안 틀리고요. 제가 그 사람들을 못 믿는 이유의 절반이 그거예요.",
          "",
          "언니랑 저는 2년 동안 제대로 말을 안 했어요. 아버지 서류 때문에 바보 같은 싸움을 했거든요. 언니는 아버지가 항구에서 무슨 일에 얽혀 있었다고 생각했고, 저는 언니가 장부에서 유령을 보고 있다고 했어요. 그 대화를 되돌릴 수만 있다면 뭐든 할 거예요.",
          "",
          "편지를 쓰는 다른 이유는요, 저 결혼해요. 지난달 톰이 청혼했고, 약혼 파티를 3월 14일로 잡았어요. 그날이 언니 생일이에요. 일부러 그날로 골랐어요. 자기 생일에 초대하면 언니도 거절 못 할 거라고 생각했거든요. 언니는 자기 생일인 3월 14일에 제 약혼 파티에 와서, 톰의 형편없는 축사를 듣고 웃고 있어야 해요. 꼭 와야 해요.",
          "",
          "언니가 마지막으로 보낸 이메일을 전달해 드렸어요. 언니 노트북 로그인 정보도 드렸고요. 무엇을 찾든, 제발 사실대로 말해 주세요. 나쁜 소식이라도요.",
          "",
          "마라",
        ].join("\n"),
        "zh-TW": [
          "您好：",
          "",
          "謝謝您接下這件事。我知道警方覺得沒什麼。他們一直說「成年女性、長期休假，她會出現的」。研究院也說了同樣的話，一字不差，這就是我不相信他們的一半原因。",
          "",
          "艾達和我已經兩年沒好好說過話了。是為了我們父親的文件吵的一場蠢架。她認為父親在港口牽扯進了什麼事；我說她是在帳冊裡看見鬼。只要能把那段對話收回來，我什麼都願意。",
          "",
          "我寫信的另一個原因是——我要結婚了。湯姆上個月求婚，我們把訂婚派對訂在3月14日。那天是艾達的生日。我是故意挑的。我想，如果在她自己生日那天邀請她，她就沒辦法拒絕。她應該在她的生日、3月14日那天出現在我的訂婚派對上，笑湯姆那段糟透了的致詞。她一定要在場。",
          "",
          "我已經把她最後一封信轉寄給您了，也把她的筆電登入資訊給了您。不管您查到什麼，請告訴我真相。就算是壞消息也一樣。",
          "",
          "瑪拉",
        ].join("\n"),
        es: [
          "Hola:",
          "",
          "Gracias por aceptar este encargo. Sé que la policía cree que no es nada. Siguen diciendo 'mujer adulta, licencia prolongada, ya aparecerá'. El Instituto dijo lo mismo, con exactamente las mismas palabras, y esa es la mitad de la razón por la que no les creo.",
          "",
          "Ada y yo no hablamos de verdad desde hace dos años. Fue una pelea estúpida por los papeles de nuestro padre. Ella creía que él había estado metido en algo en el puerto; yo le dije que veía fantasmas en los libros de cuentas. Daría cualquier cosa por poder volver atrás y tener esa conversación de nuevo.",
          "",
          "La otra razón por la que le escribo: me voy a casar. Tom me lo propuso el mes pasado y reservamos la fiesta para el 14 de marzo. Es el cumpleaños de Ada. Lo elegí a propósito. Pensé que si la invitaba el día de su propio cumpleaños no podría decir que no. Ella debería estar en mi fiesta de compromiso el día de su cumpleaños, el 14 de marzo, riéndose del terrible discurso de Tom. Tiene que estar ahí.",
          "",
          "Le reenvié su último correo. Le di los datos para entrar en su laptop. Encuentre lo que encuentre, por favor, dígame la verdad. Aunque sea mala.",
          "",
          "Mara",
        ].join("\n"),
        ja: [
          "こんにちは。",
          "",
          "この件を引き受けてくださって、ありがとうございます。警察が大したことじゃないと思っているのはわかっています。「大人の女性で、長期休暇中で、そのうち現れますよ」と繰り返すばかりです。研究所もまったく同じことを、一字一句同じ言葉で言いました。わたしが彼らを信じられない理由の半分はそれです。",
          "",
          "姉とはこの二年、まともに話していません。父の書類のことで、ばかげた喧嘩をしたんです。姉は父が港で何かに巻き込まれていたと考えていて、わたしは、帳簿の中に幽霊を見ているだけだと言ってしまいました。あの会話をやり直せるなら、何だって差し出します。",
          "",
          "お便りしたもうひとつの理由は——わたし、結婚するんです。先月トムにプロポーズされて、パーティーを3月14日に予約しました。その日はエイダの誕生日です。わざとその日を選びました。自分の誕生日に招待されたら、姉も断れないと思ったから。姉は自分の誕生日、3月14日に、わたしの婚約パーティーにいて、トムのひどいスピーチを笑っているはずなんです。いてくれなきゃ困るんです。",
          "",
          "姉の最後のメールを転送しました。姉のノートパソコンのログイン情報もお渡ししました。何がわかっても、どうか本当のことを教えてください。たとえ悪い知らせでも。",
          "",
          "マーラ",
        ].join("\n"),
        "pt-BR": [
          "Olá,",
          "",
          "Obrigada por aceitar este trabalho. Sei que a polícia acha que não é nada. Eles vivem repetindo 'mulher adulta, licença prolongada, ela vai aparecer'. O Instituto disse a mesma coisa, com exatamente as mesmas palavras, e essa é metade da razão pela qual eu não acredito neles.",
          "",
          "A Ada e eu não conversamos de verdade há dois anos. Foi uma briga boba por causa dos papéis do nosso pai. Ela achava que ele tinha se metido em alguma coisa no porto; eu disse que ela estava vendo fantasmas nos livros-caixa. Eu daria qualquer coisa para poder ter aquela conversa de novo.",
          "",
          "O outro motivo pelo qual estou escrevendo: eu vou me casar. O Tom me pediu em casamento mês passado, e marcamos a festa para 14 de março. É o aniversário da Ada. Escolhi de propósito. Pensei que, se eu a convidasse no dia do próprio aniversário dela, ela não ia conseguir dizer não. Ela devia estar na minha festa de noivado no aniversário dela, 14 de março, rindo do discurso horrível do Tom. Ela tem que estar lá.",
          "",
          "Encaminhei para você o último e-mail dela. Passei o login do notebook dela. Seja o que for que você encontrar, por favor, me conte a verdade. Mesmo que seja ruim.",
          "",
          "Mara",
        ].join("\n"),
      }),
    },
    {
      id: "email-institute-pr",
      from: "Office of the Director, Meridian Institute <press@meridian-inst.net>",
      subject: x({ en: "Statement regarding Dr. A. Voss", ko: "A. 보스 박사 관련 입장문", "zh-TW": "關於 A. 佛斯博士之聲明", es: "Declaración sobre la Dra. A. Voss", ja: "A・ヴォス博士に関する声明", "pt-BR": "Declaração sobre a Dra. A. Voss" }),
      date: x({ en: "Yesterday, 16:02", ko: "어제 16:02", "zh-TW": "昨天 16:02", es: "Ayer, 16:02", ja: "昨日 16:02", "pt-BR": "Ontem, 16:02" }),
      kind: "email",
      body: x({
        en: [
          "Dear enquirer,",
          "",
          "The Meridian Institute is aware of speculation concerning our colleague Dr. Ada Voss. We can confirm that Dr. Voss is on extended leave for personal reasons. We ask that her privacy, and that of her family, be respected.",
          "",
          "The Institute's records are complete, verified and final. We do not comment on rumours.",
          "",
          "With continuity,",
          "The Office of the Director",
        ].join("\n"),
        ko: [
          "문의하신 분께,",
          "",
          "메리디언 연구소는 동료 에이다 보스 박사에 관한 추측이 돌고 있음을 알고 있습니다. 보스 박사는 개인 사유로 장기 휴직 중임을 확인해 드립니다. 박사 본인과 가족의 사생활을 존중해 주시기 바랍니다.",
          "",
          "연구소의 기록은 완전하고, 검증되었으며, 최종적입니다. 소문에 대해서는 논평하지 않습니다.",
          "",
          "연속성을 담아,",
          "소장실 드림",
        ].join("\n"),
        "zh-TW": [
          "敬啟者：",
          "",
          "子午研究院已知悉外界對本院同仁艾達・佛斯博士的種種揣測。本院在此證實，佛斯博士因個人因素正在長期休假中。懇請各界尊重博士本人及其家屬之隱私。",
          "",
          "本院紀錄完整、業經查核，且為最終版本。本院對傳聞不予置評。",
          "",
          "秉持連續性，",
          "院長辦公室 敬啟",
        ].join("\n"),
        es: [
          "A quien corresponda:",
          "",
          "El Instituto Meridian está al tanto de las especulaciones sobre nuestra colega, la Dra. Ada Voss. Podemos confirmar que la Dra. Voss se encuentra de licencia prolongada por motivos personales. Solicitamos que se respete su privacidad y la de su familia.",
          "",
          "Los registros del Instituto están completos, verificados y son definitivos. No comentamos rumores.",
          "",
          "Con continuidad,",
          "La Oficina del Director",
        ].join("\n"),
        ja: [
          "お問い合わせの皆様へ",
          "",
          "メリディアン研究所は、当研究所の同僚であるエイダ・ヴォス博士をめぐる憶測について承知しております。ヴォス博士は個人的な事情により長期休暇中であることをここに確認いたします。博士ご本人ならびにご家族のプライバシーにご配慮くださいますようお願い申し上げます。",
          "",
          "当研究所の記録は完全であり、検証済みかつ最終的なものです。噂についてはコメントいたしません。",
          "",
          "継続性をもって",
          "所長室",
        ].join("\n"),
        "pt-BR": [
          "Prezado(a) solicitante,",
          "",
          "O Instituto Meridian está ciente das especulações a respeito de nossa colega, a Dra. Ada Voss. Podemos confirmar que a Dra. Voss se encontra em licença prolongada por motivos pessoais. Solicitamos que a privacidade dela e de sua família seja respeitada.",
          "",
          "Os registros do Instituto são completos, verificados e definitivos. Não comentamos boatos.",
          "",
          "Com continuidade,",
          "Gabinete do Diretor",
        ].join("\n"),
      }),
    },
  ];
}

interface Ambient {
  id: string;
  when: (p: RoomProgress) => boolean;
  subject: Tr;
  body: Tr;
}

const AMBIENT: Ambient[] = [
  {
    id: "vm-ambient-drift",
    when: (p) => p.visitedSites.some((s) => s.startsWith("thedrift.blog")),
    subject: { en: "Voicemail — 0:31", ko: "음성 메시지 — 0:31", "zh-TW": "語音留言 — 0:31", es: "Mensaje de voz — 0:31", ja: "留守電メッセージ — 0:31", "pt-BR": "Mensagem de voz — 0:31" },
    body: {
      en: "[static] ...you found the notebook. Good. I wrote it in order so someone could follow me. Don't let the recipes distract you — those were for Mara. [click]",
      ko: "[잡음] ...노트를 찾았구나. 잘했어. 누군가 날 따라올 수 있게 순서대로 적어 뒀어. 레시피에 한눈팔지 마. 그건 마라 주려고 쓴 거야. [딸깍]",
      "zh-TW": "[雜訊] ……你找到那本筆記了。很好。我照順序寫，就是為了讓人能跟上我。別被食譜分心——那些是寫給瑪拉的。[喀]",
      es: "[estática] ...encontraste el cuaderno. Bien. Lo escribí en orden para que alguien pudiera seguirme. No dejes que las recetas te distraigan: eran para Mara. [clic]",
      ja: "[ノイズ] ……ノートを見つけたんだね。よかった。誰かがわたしを追えるように、順番どおりに書いておいた。レシピに気を取られないで——あれはマーラのためのものだから。[カチッ]",
      "pt-BR": "[estática] ...você encontrou o caderno. Ótimo. Escrevi em ordem para que alguém pudesse me seguir. Não deixe as receitas distraírem você: eram para a Mara. [clique]",
    },
  },
  {
    id: "vm-ambient-trapdoor",
    when: (p) => p.visitedSites.some((s) => s.startsWith("trapdoor.net")),
    subject: { en: "Voicemail — 0:18", ko: "음성 메시지 — 0:18", "zh-TW": "語音留言 — 0:18", es: "Mensaje de voz — 0:18", ja: "留守電メッセージ — 0:18", "pt-BR": "Mensagem de voz — 0:18" },
    body: {
      en: "[wind] They built that door for people like you. Don't take it personally. Go back to the forum. My needle points true; theirs only points back at them. [click]",
      ko: "[바람 소리] 그 문은 너 같은 사람 잡으려고 만든 거야. 기분 나빠하지 마. 포럼으로 돌아가. 내 바늘은 진실을 가리켜. 그들 바늘은 자기들만 가리키고. [딸깍]",
      "zh-TW": "[風聲] 那扇門就是為你這種人蓋的。別往心裡去。回論壇去。我的指針指向真實；他們的只會指回他們自己。[喀]",
      es: "[viento] Construyeron esa puerta para gente como tú. No te lo tomes personal. Vuelve al foro. Mi aguja apunta a la verdad; la suya solo apunta de vuelta hacia ellos. [clic]",
      ja: "[風の音] あの扉は、あなたみたいな人のために作られたの。気にしないで。フォーラムに戻って。わたしの針は真実を指す。あっちの針は、自分たちを指し返すだけ。[カチッ]",
      "pt-BR": "[vento] Construíram aquela porta para gente como você. Não leve para o lado pessoal. Volte ao fórum. A minha agulha aponta para a verdade; a deles só aponta de volta para eles. [clique]",
    },
  },
  {
    id: "vm-ambient-decoded",
    when: (p) => p.solved.includes("shift-key"),
    subject: { en: "Voicemail — 0:44", ko: "음성 메시지 — 0:44", "zh-TW": "語音留言 — 0:44", es: "Mensaje de voz — 0:44", ja: "留守電メッセージ — 0:44", "pt-BR": "Mensagem de voz — 0:44" },
    body: {
      en: "[keyboard clatter] Seven notches. You turned the dial. Wren has the key — she gave it to me when she realised they'd erased her face. The vault code is the year they lied. Look at the bottom of their pages, where nobody reads. [click]",
      ko: "[키보드 소리] 눈금 일곱 개. 다이얼을 돌렸구나. 열쇠는 렌(Wren)이 갖고 있어. 그들이 자기 얼굴을 지웠다는 걸 알았을 때 나한테 넘겨줬지. 볼트 코드는 그들이 거짓말한 연도야. 아무도 안 읽는 곳, 그들 페이지 맨 아래를 봐. [딸깍]",
      "zh-TW": "[鍵盤敲擊聲] 七道刻痕。你轉動了轉盤。鑰匙在芮恩（Wren）手上——她發現他們抹掉了她的臉之後，就把它交給了我。金庫密碼是他們說謊的那個年份。去看他們頁面的最底下，沒有人會讀的地方。[喀]",
      es: "[tecleo] Siete muescas. Giraste el dial. Wren tiene la llave: me la dio cuando se dio cuenta de que le habían borrado la cara. El código de la Bóveda es el año en que mintieron. Mira al pie de sus páginas, donde nadie lee. [clic]",
      ja: "[キーボードの音] 刻み目は七つ。ダイヤルを回したんだね。鍵はレン（Wren）が持ってる——彼らに顔を消されたと気づいたとき、わたしに託してくれた。金庫のコードは、彼らが嘘をついた年。彼らのページのいちばん下を見て。誰も読まないところ。[カチッ]",
      "pt-BR": "[teclado] Sete entalhes. Você girou o mostrador. A Wren tem a chave: ela me deu quando percebeu que tinham apagado o rosto dela. O código do Cofre é o ano em que eles mentiram. Olhe o pé das páginas deles, onde ninguém lê. [clique]",
    },
  },
  {
    id: "vm-ambient-inside",
    when: (p) => p.solved.includes("intranet-login"),
    subject: { en: "Voicemail — 1:02", ko: "음성 메시지 — 1:02", "zh-TW": "語音留言 — 1:02", es: "Mensaje de voz — 1:02", ja: "留守電メッセージ — 1:02", "pt-BR": "Mensagem de voz — 1:02" },
    body: {
      en: "[server hum] You're inside. I'm sorry about what you're seeing in that log. Founding years, warehouse fires, my father's name. It's all real, and it's all been sanded off. The memo about me is in the admin console. Wren left the password on the dashboard, in ones and zeros. She taught me to read them. [click]",
      ko: "[서버 웅웅거리는 소리] 들어왔구나. 그 로그에서 보고 있는 것들, 미안해. 설립 연도, 창고 화재, 우리 아버지 이름. 전부 진짜고, 전부 깎여 나갔어. 나에 관한 메모는 관리자 콘솔에 있어. 렌이 대시보드에 비밀번호를 남겨 뒀어. 0과 1로. 그걸 읽는 법은 렌이 나한테 가르쳐 줬어. [딸깍]",
      "zh-TW": "[伺服器嗡嗡聲] 你進來了。抱歉讓你看到那份紀錄裡的東西。創立年份、倉庫火災、我父親的名字。全都是真的，也全都被磨掉了。關於我的那份備忘錄在管理主控台裡。芮恩把密碼留在儀表板上，用一和零寫的。是她教我怎麼讀的。[喀]",
      es: "[zumbido de servidores] Estás dentro. Siento lo que estás viendo en ese registro. Años de fundación, incendios de almacenes, el nombre de mi padre. Todo es real, y todo lo han ido lijando. El memorándum sobre mí está en la consola de administración. Wren dejó la contraseña en el panel, en unos y ceros. Ella me enseñó a leerlos. [clic]",
      ja: "[サーバーの低いうなり] 中に入れたね。そのログで見ているもののこと、ごめん。創立年、倉庫の火事、父の名前。全部本当のことで、全部削り取られてきた。わたしについてのメモは管理コンソールにある。レンがダッシュボードにパスワードを残してくれた。1と0で。読み方を教えてくれたのはレンだよ。[カチッ]",
      "pt-BR": "[zumbido de servidores] Você entrou. Sinto muito pelo que você está vendo nesse registro. Anos de fundação, incêndios em armazéns, o nome do meu pai. É tudo real, e foi tudo sendo lixado. O memorando sobre mim está no console de administração. A Wren deixou a senha no painel, em uns e zeros. Foi ela que me ensinou a ler. [clique]",
    },
  },
  {
    id: "vm-ambient-admin",
    when: (p) => p.solved.includes("admin-console"),
    subject: { en: "Voicemail — 0:31", ko: "음성 메시지 — 0:31", "zh-TW": "語音留言 — 0:31", es: "Mensaje de voz — 0:31", ja: "留守電メッセージ — 0:31", "pt-BR": "Mensagem de voz — 0:31" },
    body: {
      en: "[a laugh, barely] Five bits a letter. Wren would give you a gold star. Lamps in the Trust office, the night of the fire. She never forgot that line either. There's a memo in there with my name on it. Tap through the black bars. [click]",
      ko: "[아주 작게 웃는 소리] 글자 하나에 5비트. 렌이었으면 너한테 금별 스티커 붙여 줬을 거야. 화재 당일 밤, 트러스트 사무실의 등불. 렌도 그 구절은 절대 못 잊었어. 거기 내 이름이 적힌 메모가 있어. 검은 줄을 눌러서 열어 봐. [딸깍]",
      "zh-TW": "[一聲幾乎聽不見的笑] 一個字母五個位元。芮恩會給你一顆金星。火災那晚，港灣信託辦公室裡的燈。她也從來沒忘記那一句。裡面有一份寫著我名字的備忘錄。點開那些黑條。[喀]",
      es: "[una risa, apenas] Cinco bits por letra. Wren te daría una estrellita dorada. Faroles en la oficina del Fideicomiso, la noche del incendio. Ella tampoco olvidó nunca esa frase. Ahí dentro hay un memorándum con mi nombre. Toca las barras negras. [clic]",
      ja: "[かすかな笑い声] 一文字につき5ビット。レンなら金の星をくれるよ。火事の夜、信託の事務所に灯っていた明かり。レンもあの一節だけは忘れなかった。そこにわたしの名前が書かれたメモがある。黒い線をタップして開いて。[カチッ]",
      "pt-BR": "[uma risada, quase nada] Cinco bits por letra. A Wren daria uma estrelinha dourada para você. Lampiões no escritório do Truste, na noite do incêndio. Ela também nunca esqueceu essa frase. Lá dentro tem um memorando com o meu nome. Toque nas tarjas pretas. [clique]",
    },
  },
  {
    id: "vm-ambient-alive",
    when: (p) => p.solved.includes("final-phrase"),
    subject: { en: "Voicemail — 0:52", ko: "음성 메시지 — 0:52", "zh-TW": "語音留言 — 0:52", es: "Mensaje de voz — 0:52", ja: "留守電メッセージ — 0:52", "pt-BR": "Mensagem de voz — 0:52" },
    body: {
      en: "[a breath, close to the phone] Hi. It's really me. Not a recording this time. Thank you. Now — you and the people with you get to decide what happens next. I'll live with it either way. [click]",
      ko: "[수화기 가까이서 숨소리] 안녕. 정말 나야. 이번엔 녹음 아니야. 고마워. 이제 너랑 같이 있는 사람들이 다음에 무슨 일이 일어날지 정해. 어느 쪽이든 받아들일게. [딸깍]",
      "zh-TW": "[貼著話筒的一聲呼吸] 嗨。真的是我。這次不是錄音。謝謝你。現在——你和你身邊的人可以決定接下來會發生什麼。不管是哪一種，我都會承受。[喀]",
      es: "[una respiración, cerca del teléfono] Hola. Soy yo, de verdad. Esta vez no es una grabación. Gracias. Ahora, tú y quienes están contigo deciden lo que pasa después. Lo aceptaré, sea lo que sea. [clic]",
      ja: "[受話器のすぐそばで、息づかい] もしもし。本当にわたし。今度は録音じゃない。ありがとう。さあ——あなたと、一緒にいる人たちで、次に何が起きるかを決めて。どちらになっても、わたしは受け入れる。[カチッ]",
      "pt-BR": "[uma respiração, perto do telefone] Oi. Sou eu, de verdade. Desta vez não é uma gravação. Obrigada. Agora, você e as pessoas que estão com você decidem o que acontece depois. Vou aceitar, seja o que for. [clique]",
    },
  },
];

export function voicemailsFor(progress: RoomProgress, hints: HintDTO[], loc: Locale): EmailDTO[] {
  const x = pick(loc);
  const unknown = x({ en: "Unknown number", ko: "알 수 없는 번호", "zh-TW": "未知號碼", es: "Número desconocido", ja: "不明な番号", "pt-BR": "Número desconhecido" });
  const out: EmailDTO[] = [];
  for (const a of AMBIENT) {
    if (a.when(progress)) out.push({ id: a.id, from: ADA, subject: x(a.subject), date: unknown, body: x(a.body), kind: "voicemail" });
  }
  const sorted = [...hints].sort(
    (p, q) =>
      p.unlockedAt.localeCompare(q.unlockedAt) ||
      HINT_PUZZLES.indexOf(p.puzzleId) - HINT_PUZZLES.indexOf(q.puzzleId) ||
      p.tier - q.tier,
  );
  for (const h of sorted) {
    const title = HINT_TITLES[h.puzzleId] ? x(HINT_TITLES[h.puzzleId]) : h.puzzleId;
    out.push({
      id: `vm-hint-${h.puzzleId}-${h.tier}`,
      from: ADA,
      subject: x({ en: `Voicemail: ${title} (${h.tier}/3)`, ko: `음성 메시지: ${title} (${h.tier}/3)`, "zh-TW": `語音留言：${title}（${h.tier}/3）`, es: `Mensaje de voz: ${title} (${h.tier}/3)`, ja: `留守電メッセージ：${title}（${h.tier}/3）`, "pt-BR": `Mensagem de voz: ${title} (${h.tier}/3)` }),
      date: formatWhen(h.unlockedAt, unknown),
      body: x({ en: `[recording] ${h.text} [click]`, ko: `[녹음] ${h.text} [딸깍]`, "zh-TW": `[錄音] ${h.text} [喀]`, es: `[grabación] ${h.text} [clic]`, ja: `[録音] ${h.text} [カチッ]`, "pt-BR": `[gravação] ${h.text} [clique]` }),
      kind: "voicemail",
    });
  }
  return out;
}

function formatWhen(iso: string, unknown: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return unknown;
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${unknown} · ${hh}:${mm}`;
}
