import "server-only";
import { pick, type Locale, type Tr } from "@/i18n/config";
import type { Ending } from "@/lib/types";

/** Paragraph lists per locale (joined at resolve time). */
type Paras = Record<Locale, string[]>;

const ENDINGS: Record<Ending, { title: Tr; body: Paras }> = {
  EXPOSE: {
    title: { en: "The Needle Points True", ko: "바늘은 진실을 가리킨다", "zh-TW": "指針指向真相", es: "La aguja señala la verdad", ja: "針は真実を指す", "pt-BR": "A agulha aponta a verdade" },
    body: {
      en: [
        "At 06:00 the switch fires on purpose. Ada lets it.",
        "Four thousand one hundred and twelve reconciled records land in every newsroom inbox in the city, each one paired with its original: the charter signed in 1978 by the Harbour Trust, the watchman's statement about lamps in the Trust office the night the warehouse burned, the list of founders with a name everyone at the Institute was told to forget. Voss. Her father's name.",
        "By noon the Meridian Institute's front page has been replaced with a single line about 'technical maintenance'. By evening there are television vans parked on the steps beneath the broken compass. Deputy Director Kell resigns by letter. Director Calloway does not resign; she is escorted.",
        "Wren Okafor gives her first interview with her face in frame. The photo they deleted runs on the front page of the morning edition, a little grainy, unmistakably her.",
        "Ada does not come out. Not yet. There are people who will be angry for a long time, and some of them know where the harbour is deepest. She sends one line to the investigator's inbox from an address that will stop working an hour later: 'Not yet. But soon. Tell Mara to save me a seat.'",
        "The record is open. It is messy and contradictory and alive, the way the truth usually is. Somewhere in the Institute's empty lobby, someone finally takes the compass down to have the needle fixed.",
      ],
      ko: [
        "06:00, 스위치가 일부러 작동한다. 에이다는 그것을 막지 않는다.",
        "'정리'된 기록 4,112건이 도시의 모든 언론사 메일함에 도착한다. 하나하나에 원본이 짝지어져 있다. 1978년 하버 트러스트가 서명한 설립 인가서, 창고가 불타던 밤 트러스트 사무실에 등불이 켜져 있었다는 야간 경비원의 진술서, 그리고 연구소 사람들 모두가 잊으라고 지시받았던 이름이 적힌 설립자 명단. 보스(Voss). 그녀 아버지의 이름이다.",
        "정오 무렵 메리디언 연구소의 첫 화면은 '기술 점검 중'이라는 한 줄로 바뀐다. 저녁이 되자 부러진 나침반 아래 계단에 방송사 중계차들이 늘어선다. 켈 부국장은 서면으로 사임한다. 캘러웨이 소장은 사임하지 않는다. 그녀는 연행된다.",
        "렌 오카포는 처음으로 얼굴을 드러낸 채 인터뷰에 응한다. 그들이 지웠던 사진이 조간 1면에 실린다. 조금 거칠지만, 틀림없는 그녀다.",
        "에이다는 나오지 않는다. 아직은. 오래도록 분노할 사람들이 있고, 그중 몇은 항구가 어디서 가장 깊은지 알고 있다. 그녀는 한 시간 뒤면 사라질 주소에서 조사관의 메일함으로 한 줄을 보낸다. '아직은 아니야. 하지만 곧. 마라한테 내 자리 하나 남겨 두라고 전해 줘.'",
        "기록은 열렸다. 진실이 대개 그렇듯 어지럽고, 모순투성이에, 살아 있다. 텅 빈 연구소 로비 어딘가에서, 누군가 마침내 바늘을 고치려고 나침반을 벽에서 내린다.",
      ],
      "zh-TW": [
        "06:00，開關如期觸發。艾達沒有阻止它。",
        "四千一百一十二筆經過「校正」的紀錄，同時送進全市每一家新聞媒體的收件匣，每一筆都附上原始版本：1978年由港灣信託簽署的設立章程；倉庫失火那一夜，守夜人看見信託辦公室亮著燈的證詞；還有那份創辦人名單，上面有一個研究院裡人人都被要求忘掉的名字。佛斯（Voss）。她父親的名字。",
        "到了中午，子午研究院的首頁只剩下一行「技術維護中」。到了傍晚，轉播車已經停滿那座斷了指針的指南針底下的階梯。凱爾副所長以書面辭職。卡洛威所長沒有辭職，她是被帶走的。",
        "芮恩・奧卡佛（Wren Okafor）第一次露臉接受訪問。那張被他們刪掉的照片登上了早報頭版，有點模糊，但絕對是她。",
        "艾達沒有現身。還不是時候。有些人會憤怒很久，其中幾個知道港口哪裡最深。她從一個一小時後就會失效的地址，寄了一行字到調查員的收件匣：「還不是時候。但快了。跟瑪拉說幫我留個位子。」",
        "紀錄公開了。就像真相通常的樣子：雜亂、矛盾，而且活著。在研究院空蕩蕩的大廳某處，終於有人把指南針取下來，送去修理指針。",
      ],
      es: [
        "A las 06:00 el interruptor se activa a propósito. Ada lo deja.",
        "Cuatro mil ciento doce registros «conciliados» llegan a la bandeja de entrada de todas las redacciones de la ciudad, cada uno junto a su original: la carta fundacional firmada en 1978 por el Fideicomiso del Puerto, la declaración del vigilante nocturno sobre las lámparas encendidas en la oficina del Fideicomiso la noche en que ardió el almacén, la lista de fundadores con un apellido que a todos en el Instituto se les ordenó olvidar. Voss. El apellido de su padre.",
        "Al mediodía, la portada del Instituto Meridian ya no muestra más que una línea sobre «mantenimiento técnico». Al anochecer hay camionetas de televisión estacionadas en la escalinata, bajo la brújula rota. El subdirector Kell renuncia por carta. La directora Calloway no renuncia: se la llevan escoltada.",
        "Wren Okafor da su primera entrevista dando la cara. La foto que borraron sale en la portada de la edición matutina, algo granulada, inconfundiblemente ella.",
        "Ada no sale. Todavía no. Hay gente que va a estar furiosa por mucho tiempo, y algunos saben dónde es más profundo el puerto. Desde una dirección que dejará de funcionar una hora después, envía una sola línea a la bandeja de entrada del investigador: «Todavía no. Pero pronto. Dile a Mara que me guarde un lugar».",
        "El registro está abierto. Es desordenado, contradictorio y está vivo, como suele estarlo la verdad. En algún rincón del vestíbulo vacío del Instituto, alguien por fin descuelga la brújula para que le arreglen la aguja.",
      ],
      ja: [
        "06:00、スイッチが意図どおりに作動する。エイダはそれを止めない。",
        "「整合」された記録4,112件が、市内のすべての報道機関の受信トレイに届く。その一件一件に原本が添えられている。1978年にハーバー信託が署名した設立認可状。倉庫が燃えた夜、信託の事務所に灯りがともっていたという夜警の証言。そして、研究所の誰もが忘れるよう命じられていた名前が載った創設者名簿。ヴォス（Voss）。彼女の父の名だ。",
        "正午には、メリディアン研究所のトップページは「技術メンテナンス中」という一行に差し替えられている。夕方には、針の折れたコンパスの下の階段にテレビ局の中継車が並ぶ。ケル副所長は書面で辞任する。キャロウェイ所長は辞任しない。連行されるのだ。",
        "レン・オカフォー（Wren Okafor）は、初めて顔を出してインタビューに応じる。彼らが消したあの写真が朝刊の一面を飾る。少し粗いが、紛れもなく彼女だ。",
        "エイダは姿を現さない。まだ。長く怒り続ける人々がいて、その中には港のどこがいちばん深いかを知っている者もいる。彼女は一時間後には使えなくなるアドレスから、調査員の受信トレイに一行だけ送る。「まだだよ。でも、もうすぐ。マーラに、私の席を取っておいてって伝えて」",
        "記録は開かれた。真実がたいていそうであるように、乱雑で、矛盾だらけで、生きている。研究所のがらんとしたロビーのどこかで、誰かがようやくコンパスを壁から下ろし、針を直しに出す。",
      ],
      "pt-BR": [
        "Às 06:00 o interruptor dispara de propósito. A Ada deixa.",
        "Quatro mil cento e doze registros “conciliados” chegam à caixa de entrada de todas as redações da cidade, cada um ao lado do seu original: o estatuto assinado em 1978 pelo Truste do Porto, o depoimento do vigia sobre as lâmpadas acesas no escritório do Truste na noite em que o armazém pegou fogo, a lista de fundadores com um sobrenome que todos no Instituto foram mandados esquecer. Voss. O sobrenome do pai dela.",
        "Ao meio-dia, a página inicial do Instituto Meridian já não mostra nada além de uma linha sobre “manutenção técnica”. À noite há vans de televisão estacionadas na escadaria, embaixo da bússola quebrada. O vice-diretor Kell pede demissão por carta. A diretora Calloway não pede demissão: sai escoltada.",
        "Wren Okafor dá sua primeira entrevista mostrando o rosto. A foto que eles apagaram sai na primeira página da edição da manhã, um pouco granulada, inconfundivelmente ela.",
        "A Ada não aparece. Ainda não. Tem gente que vai ficar furiosa por muito tempo, e alguns sabem onde o porto é mais fundo. De um endereço que vai parar de funcionar uma hora depois, ela manda uma única linha para a caixa de entrada do investigador: “Ainda não. Mas logo. Diga à Mara para guardar um lugar para mim.”",
        "O registro está aberto. É bagunçado, contraditório e vivo, como a verdade costuma ser. Em algum canto do saguão vazio do Instituto, alguém finalmente tira a bússola da parede para mandar consertar a agulha.",
      ],
    },
  },
  PROTECT: {
    title: { en: "A Record Kept Sealed", ko: "봉인된 채 남은 기록", "zh-TW": "封存的紀錄", es: "Un registro que sigue sellado", ja: "封印されたままの記録", "pt-BR": "Um registro que continua lacrado" },
    body: {
      en: [
        "You let the timer run past its own deadline, and then you stop it. The unaltered records stay where Ada hid them: in the dark, unindexed, safe.",
        "The Institute never learns how close it came. The Continuity Office goes on reconciling. The founding year stays 1987 on the website and 1978 in the small print, and nobody reads the small print. That is the price, and everyone in the room knows it.",
        "In return, Ada gets the one thing the truth could not give her: a way out. By the time the Office of Continuity notices her switch has gone quiet, the host has been wiped, her accounts are closed, and the woman who read every footnote has become one.",
        "Wren keeps her job and her high score. She posts on RunnerBoard once more, a single message to compass_needle with the timestamp 07:15. Nobody else understands it. It was never meant for them.",
        "Three weeks later, a letter arrives for Mara Voss with no return address. Inside is a pressed sprig of lavender from the harbour wall and a single sheet of paper in her sister's handwriting:",
        "\"Mara — I'm sorry about Dad's papers. You were right that some ghosts are better left in the ledgers, and I was right that they were there. I'm safe. I can't come to the party, but I'll be thinking of you on March 14, the way I always do. Marry the man with the terrible speeches. Be happy loudly enough that I can hear it from wherever I am. All my love, the sister who reads footnotes. — A.\"",
        "Mara reads it at the kitchen table until the light changes. Then she sets an extra place at the engagement party anyway, and leaves it empty, and tells no one why.",
      ],
      ko: [
        "당신은 타이머가 제 마감 시각을 넘기도록 내버려 두었다가, 그제야 멈춘다. 변조되지 않은 기록들은 에이다가 숨겨 둔 자리에 그대로 남는다. 어둠 속에, 색인 없이, 안전하게.",
        "연구소는 자신들이 얼마나 위태로웠는지 끝내 알지 못한다. 연속성 관리실은 계속해서 기록을 '정리'한다. 설립 연도는 웹사이트에선 1987년, 작은 글씨로는 1978년인 채로 남고, 그 작은 글씨를 읽는 사람은 아무도 없다. 그것이 대가이고, 이 방의 모두가 그것을 안다.",
        "그 대신 에이다는 진실이 줄 수 없었던 단 하나를 얻는다. 빠져나갈 길. 연속성 관리실이 그녀의 스위치가 잠잠해졌다는 걸 알아챘을 때, 서버는 이미 지워졌고 계정은 닫혔으며, 모든 각주를 읽던 그 여자는 스스로 하나의 각주가 되어 있다.",
        "렌은 일자리도, 최고 기록도 지킨다. 그녀는 RunnerBoard에 한 번 더 글을 올린다. compass_needle에게 보내는 메시지 하나, 타임스탬프는 07:15. 아무도 그 뜻을 모른다. 애초에 그들을 위한 글이 아니었다.",
        "3주 뒤, 마라 보스 앞으로 보낸 사람 주소가 없는 편지 한 통이 도착한다. 안에는 항구 방파제에서 꺾은 라벤더 한 줄기가 눌려 말린 채 들어 있고, 언니의 글씨로 쓴 종이 한 장이 있다.",
        "\"마라, 아빠 서류 일은 미안해. 어떤 유령들은 장부 속에 남겨 두는 게 낫다는 네 말이 맞았고, 그 유령들이 거기 있다는 내 말도 맞았어. 난 안전해. 파티엔 못 가지만, 3월 14일엔 늘 그랬듯 네 생각을 할게. 연설 끔찍하게 못하는 그 남자랑 결혼해. 내가 어디에 있든 들릴 만큼 크게 행복해. 사랑을 담아, 각주 읽는 언니가. — A.\"",
        "마라는 부엌 식탁에 앉아 빛이 바뀔 때까지 그것을 읽는다. 그리고 약혼 파티에 굳이 자리 하나를 더 차려 놓고, 비워 두고, 아무에게도 이유를 말하지 않는다.",
      ],
      "zh-TW": [
        "你讓計時器跑過它自己的期限，然後才把它停下。未經竄改的紀錄留在艾達藏起它們的地方：在黑暗裡，沒有索引，安全無虞。",
        "研究院永遠不會知道自己離崩塌有多近。連續性辦公室繼續「校正」紀錄。網站上的創立年份依舊是1987，小字裡依舊是1978，而沒有人會去讀小字。這就是代價，房間裡每個人都心知肚明。",
        "作為交換，艾達得到了真相給不了她的那一樣東西：一條出路。等到連續性辦公室發現她的開關已經沉寂，主機早已被抹除，帳號全數關閉，那個讀遍每一條註腳的女人，自己也成了一條註腳。",
        "芮恩保住了工作，也保住了她的最高分。她在 RunnerBoard 上又發了一次文，只有一則寫給 compass_needle 的訊息，時間戳記是 07:15。沒有人看得懂。那本來就不是寫給他們的。",
        "三週後，一封沒有寄件地址的信寄到瑪拉・佛斯（Mara Voss）手上。信封裡有一小枝從港口堤防摘下、壓乾的薰衣草，還有一張紙，上面是她姊姊的字跡：",
        "「瑪拉，爸的文件那件事，對不起。你說得對，有些鬼魂最好就留在帳本裡；我也說得對，它們確實在那裡。我很安全。我沒辦法去派對，但3月14日那天，我會像以往一樣想著你。嫁給那個致詞爛透了的男人吧。要幸福得大聲一點，大聲到不管我在哪裡都聽得見。愛你的，那個會讀註腳的姊姊。— A.」",
        "瑪拉坐在廚房餐桌前讀著那封信，直到窗外的光線變了。然後，她還是在訂婚派對上多擺了一副餐具，讓那個位子空著，沒有告訴任何人為什麼。",
      ],
      es: [
        "Dejas que el temporizador pase de su propio plazo, y solo entonces lo detienes. Los registros sin alterar se quedan donde Ada los escondió: a oscuras, sin índice, a salvo.",
        "El Instituto nunca sabrá lo cerca que estuvo. La Oficina de Continuidad sigue conciliando. El año de fundación sigue siendo 1987 en el sitio web y 1978 en la letra pequeña, y nadie lee la letra pequeña. Ese es el precio, y todos en la sala lo saben.",
        "A cambio, Ada obtiene lo único que la verdad no podía darle: una salida. Para cuando la Oficina de Continuidad nota que su interruptor ha enmudecido, el servidor ya está borrado, sus cuentas están cerradas y la mujer que leía cada nota al pie se ha convertido en una.",
        "Wren conserva su empleo y su récord. Publica en RunnerBoard una vez más: un único mensaje para compass_needle con la marca de tiempo 07:15. Nadie más lo entiende. Nunca fue para ellos.",
        "Tres semanas después llega una carta sin remitente a nombre de Mara Voss. Dentro hay una ramita de lavanda prensada, cortada en el malecón del puerto, y una sola hoja con la letra de su hermana:",
        "«Mara: perdóname lo de los papeles de papá. Tenías razón en que hay fantasmas que es mejor dejar en los libros de cuentas, y yo tenía razón en que estaban ahí. Estoy a salvo. No puedo ir a la fiesta, pero el 14 de marzo pensaré en ti, como siempre. Cásate con el hombre de los discursos terribles. Sé feliz tan fuerte que pueda oírte desde dondequiera que esté. Con todo mi amor, la hermana que lee las notas al pie. — A.»",
        "Mara la lee en la mesa de la cocina hasta que cambia la luz. Luego, de todos modos, pone un lugar de más en la fiesta de compromiso, lo deja vacío y no le dice a nadie por qué.",
      ],
      ja: [
        "あなたはタイマーが自らの期限を過ぎるまで走らせ、それから止める。改ざんされていない記録は、エイダが隠した場所にそのまま残る。闇の中に、索引もなく、安全に。",
        "研究所は、自分たちがどれほど危うかったかを知ることはない。継続性管理室は「整合」を続ける。設立年はウェブサイトでは1987年、小さな文字では1978年のまま残り、その小さな文字を読む者はいない。それが代償であり、この部屋の誰もがそれを知っている。",
        "その代わりに、エイダは真実が与えられなかった唯一のものを手にする。逃げ道だ。継続性管理室が彼女のスイッチの沈黙に気づく頃には、サーバーは消去され、アカウントは閉じられ、あらゆる脚注を読んだあの女性は、自らひとつの脚注になっている。",
        "レンは仕事も、ハイスコアも守る。彼女はRunnerBoardにもう一度だけ投稿する。compass_needle宛てのメッセージがひとつ、タイムスタンプは07:15。ほかの誰にも意味はわからない。最初から彼らに向けたものではなかったのだ。",
        "3週間後、差出人の住所のない手紙がマーラ・ヴォス（Mara Voss）宛てに届く。中には港の防波堤で摘んだラベンダーの押し花がひと枝と、姉の筆跡で書かれた便箋が一枚。",
        "「マーラへ。父さんの書類のこと、ごめん。幽霊の中には帳簿の中に眠らせておいたほうがいいものもあるっていうあなたの言葉は正しかったし、幽霊がそこにいるっていう私の言葉も正しかった。私は無事。パーティーには行けないけど、3月14日には、いつものようにあなたのことを想ってる。スピーチがひどく下手なあの人と結婚して。私がどこにいても聞こえるくらい、大きな声で幸せになって。愛をこめて、脚注を読む姉より。— A.」",
        "マーラは台所のテーブルで、光の色が変わるまでそれを読む。それから、婚約パーティーにはやはり席をひとつ余分に用意し、空けたままにして、その理由を誰にも話さない。",
      ],
      "pt-BR": [
        "Você deixa o cronômetro passar do próprio prazo e só então o interrompe. Os registros sem alteração ficam onde a Ada os escondeu: no escuro, sem índice, a salvo.",
        "O Instituto nunca vai saber o quanto chegou perto. O Escritório de Continuidade continua conciliando. O ano de fundação continua sendo 1987 no site e 1978 nas letras miúdas, e ninguém lê as letras miúdas. Esse é o preço, e todos na sala sabem disso.",
        "Em troca, a Ada ganha a única coisa que a verdade não podia lhe dar: uma saída. Quando o Escritório de Continuidade percebe que o interruptor dela ficou em silêncio, o servidor já foi apagado, as contas dela estão encerradas e a mulher que lia cada nota de rodapé virou uma.",
        "A Wren mantém o emprego e o recorde. Ela posta no RunnerBoard mais uma vez: uma única mensagem para compass_needle com o horário 07:15. Ninguém mais entende. Nunca foi para eles.",
        "Três semanas depois, chega uma carta sem remetente para Mara Voss. Dentro há um raminho de lavanda prensado, colhido no muro do porto, e uma única folha com a letra da irmã:",
        "“Mara, me desculpe pelos papéis do papai. Você tinha razão quando disse que alguns fantasmas é melhor deixar nos livros-caixa, e eu tinha razão quando disse que eles estavam lá. Estou segura. Não posso ir à festa, mas no dia 14 de março vou pensar em você, como sempre. Case com o homem dos discursos terríveis. Seja feliz tão alto que eu consiga ouvir de onde quer que eu esteja. Com todo o meu amor, a irmã que lê as notas de rodapé. — A.”",
        "A Mara lê a carta na mesa da cozinha até a luz mudar. Depois, mesmo assim, põe um lugar a mais na festa de noivado, deixa vazio e não conta a ninguém por quê.",
      ],
    },
  },
};

export function endingText(ending: Ending, loc: Locale): { title: string; body: string } {
  const e = ENDINGS[ending];
  return { title: pick(loc)(e.title), body: (e.body[loc] ?? e.body.en).join("\n\n") };
}

const EPILOGUE: Paras = {
  en: [
    "Inside Ada's personal folder, beneath the voicemail transcripts and the photographs of her father's ledgers, there is one more file. It is a scan of a child's drawing: two girls on a harbour wall, holding a compass between them. The needle is drawn whole.",
    "On the back, in an adult's careful hand: 'For when you both find your way back. — Dad, 1987.'",
    "Ada never told anyone she'd kept it. You've earned the right to know. The compass badge is yours.",
  ],
  ko: [
    "에이다의 개인 폴더 안, 음성 메시지 녹취록과 아버지의 장부를 찍은 사진들 아래에 파일이 하나 더 있다. 아이가 그린 그림을 스캔한 것이다. 항구 방파제 위의 두 소녀가 나침반 하나를 사이에 두고 함께 들고 있다. 바늘은 온전하게 그려져 있다.",
    "뒷면에는 어른의 조심스러운 글씨로 이렇게 적혀 있다. '너희 둘이 돌아올 길을 찾을 때를 위해. — 아빠, 1987.'",
    "에이다는 이걸 간직하고 있다는 걸 누구에게도 말하지 않았다. 당신은 그것을 알 자격을 얻었다. 나침반 배지는 당신의 것이다.",
  ],
  "zh-TW": [
    "在艾達的私人資料夾裡，在語音留言的逐字稿和她父親帳本的照片底下，還有一個檔案。那是一張孩子畫作的掃描檔：兩個女孩坐在港口堤防上，一起捧著一只指南針。指針畫得完完整整。",
    "背面是一行大人小心翼翼的字跡：「給你們兩個，等你們找到回家的路。— 爸爸，1987。」",
    "艾達從沒告訴任何人她留著這張畫。你已經有資格知道了。指南針徽章是你的。",
  ],
  es: [
    "Dentro de la carpeta personal de Ada, debajo de las transcripciones de los mensajes de voz y las fotografías de los libros de cuentas de su padre, hay un archivo más. Es el escaneo de un dibujo infantil: dos niñas sobre el malecón del puerto, sosteniendo una brújula entre las dos. La aguja está dibujada entera.",
    "Al reverso, con la letra cuidadosa de un adulto: «Para cuando las dos encuentren el camino de vuelta. — Papá, 1987».",
    "Ada nunca le contó a nadie que lo había guardado. Te has ganado el derecho a saberlo. La insignia de la brújula es tuya.",
  ],
  ja: [
    "エイダの個人フォルダーの中、留守電メッセージの文字起こしと父の帳簿を撮った写真の下に、もうひとつファイルがある。子どもが描いた絵をスキャンしたものだ。港の防波堤の上で、二人の少女がひとつのコンパスを間に挟んで持っている。針は折れずに描かれている。",
    "裏には、大人の丁寧な筆跡でこう書かれている。「ふたりが帰り道を見つけるときのために。— 父より、1987」",
    "エイダは、これを持っていることを誰にも話さなかった。あなたはそれを知る資格を得た。コンパスのバッジはあなたのものだ。",
  ],
  "pt-BR": [
    "Dentro da pasta pessoal da Ada, embaixo das transcrições das mensagens de voz e das fotos dos livros-caixa do pai dela, há mais um arquivo. É a digitalização de um desenho de criança: duas meninas no muro do porto, segurando uma bússola entre as duas. A agulha está desenhada inteira.",
    "No verso, com a letra caprichada de um adulto: “Para quando vocês duas encontrarem o caminho de volta. — Papai, 1987.”",
    "A Ada nunca contou a ninguém que tinha guardado isso. Você conquistou o direito de saber. A insígnia da bússola é sua.",
  ],
};

export function bonusEpilogue(loc: Locale): string {
  return (EPILOGUE[loc] ?? EPILOGUE.en).join("\n\n");
}

const FILES: { name: string; body: Paras }[] = [
  {
    name: "voicemail_to_mara_unsent.txt",
    body: {
      en: [
        "[Transcript — recorded, never sent]",
        "",
        "Mara. It's me. I keep starting this and deleting it. I found Dad's name in the founders' letters. Not as a villain — as a witness. He saw what happened at the warehouse and they paid him to forget it, and when he wouldn't, they made the record forget him instead.",
        "",
        "You were right that I was obsessed. I was also right. I don't know how to say both of those things on the phone. Happy almost-engaged. I like Tom. Don't tell him.",
      ],
      ko: [
        "[녹취록 — 녹음함, 보내지 않음]",
        "",
        "마라. 나야. 자꾸 말을 시작했다가 지우게 되네. 설립자들 편지에서 아빠 이름을 찾았어. 악당으로서가 아니라, 목격자로서. 아빠는 창고에서 무슨 일이 있었는지 봤고, 그 사람들은 아빠한테 돈을 주고 잊으라고 했어. 아빠가 거절하니까, 대신 기록이 아빠를 잊게 만들었고.",
        "",
        "내가 집착한다는 네 말, 맞았어. 그리고 내 말도 맞았어. 그 두 가지를 전화로 어떻게 같이 말해야 할지 모르겠다. 약혼 거의 축하해. 톰 괜찮더라. 톰한텐 말하지 마.",
      ],
      "zh-TW": [
        "[逐字稿 — 已錄音，未寄出]",
        "",
        "瑪拉，是我。我一直開了頭又刪掉。我在創辦人的信件裡找到爸的名字了。不是以壞人的身分，而是證人。他看見倉庫那晚發生了什麼，他們付錢要他忘掉；他不肯，他們就讓紀錄忘掉他。",
        "",
        "你說我走火入魔，你說得對。我說的也是對的。我不知道怎麼在電話裡同時說出這兩件事。快要訂婚了，恭喜。我滿喜歡湯姆的。別跟他說。",
      ],
      es: [
        "[Transcripción — grabado, nunca enviado]",
        "",
        "Mara. Soy yo. Empiezo esto y lo borro una y otra vez. Encontré el nombre de papá en las cartas de los fundadores. No como villano, sino como testigo. Vio lo que pasó en el almacén y le pagaron para que lo olvidara, y como no quiso, hicieron que el registro lo olvidara a él.",
        "",
        "Tenías razón en que estaba obsesionada. Y yo también tenía razón. No sé cómo decir las dos cosas por teléfono. Feliz casi compromiso. Tom me cae bien. No se lo digas.",
      ],
      ja: [
        "[文字起こし — 録音済み・未送信]",
        "",
        "マーラ。私。何度も話し始めては消してる。創設者たちの手紙の中に父さんの名前を見つけた。悪役としてじゃない。証人として。父さんは倉庫で何が起きたかを見ていて、あの人たちはお金を払って忘れさせようとした。父さんが拒むと、今度は記録のほうに父さんを忘れさせた。",
        "",
        "私が取り憑かれてるって、あなたの言うとおりだった。でも、私の言うことも正しかった。その両方を電話でどう言えばいいのかわからない。ほぼ婚約おめでとう。トムのこと、好きだよ。本人には言わないで。",
      ],
      "pt-BR": [
        "[Transcrição — gravada, nunca enviada]",
        "",
        "Mara. Sou eu. Fico começando isto e apagando. Encontrei o nome do papai nas cartas dos fundadores. Não como vilão, como testemunha. Ele viu o que aconteceu no armazém e pagaram para ele esquecer, e como ele não quis, fizeram o registro esquecer dele.",
        "",
        "Você tinha razão: eu estava obcecada. E eu também tinha razão. Não sei dizer as duas coisas por telefone. Feliz quase noivado. Eu gosto do Tom. Não conte para ele.",
      ],
    },
  },
  {
    name: "voicemail_to_wren.txt",
    body: {
      en: [
        "[Transcript — 23:49]",
        "",
        "Wren, it's Ada. I'm in Server Room B. I'm using your login like you said — if anyone asks, you were at the arcade and you have a two-million-point alibi. Thank you for the key. I'm going to put the switch somewhere they can't reach. If I go quiet, it isn't because they found me. It's because I chose to.",
      ],
      ko: [
        "[녹취록 — 23:49]",
        "",
        "렌, 나 에이다야. 지금 서버실 B에 있어. 네 말대로 네 로그인 쓰고 있어. 누가 물으면 넌 오락실에 있었고, 200만 점짜리 알리바이가 있는 거야. 열쇠 고마워. 스위치는 그 사람들 손이 닿지 않는 곳에 둘 거야. 내가 연락이 끊겨도, 그건 들켜서가 아니야. 내가 그러기로 한 거야.",
      ],
      "zh-TW": [
        "[逐字稿 — 23:49]",
        "",
        "芮恩，我是艾達。我在 B 號伺服器機房。照你說的用你的帳號登入了，要是有人問，你人在電玩間，還有兩百萬分的不在場證明。謝謝你的鑰匙。我要把開關放在他們碰不到的地方。如果我沒了消息，不是因為他們找到我，而是我自己選擇的。",
      ],
      es: [
        "[Transcripción — 23:49]",
        "",
        "Wren, soy Ada. Estoy en la Sala de Servidores B. Estoy usando tu usuario, como dijiste: si alguien pregunta, estabas en el salón de videojuegos y tienes una coartada de dos millones de puntos. Gracias por la llave. Voy a poner el interruptor donde no puedan alcanzarlo. Si me quedo callada, no es porque me hayan encontrado. Es porque yo lo elegí.",
      ],
      ja: [
        "[文字起こし — 23:49]",
        "",
        "レン、エイダだよ。今、サーバールームBにいる。言われたとおり、あなたのログインを使ってる。誰かに聞かれたら、あなたはゲームセンターにいて、200万点のアリバイがある。鍵をありがとう。スイッチはあいつらの手が届かない場所に置く。私が連絡を絶っても、それは見つかったからじゃない。自分でそう決めたから。",
      ],
      "pt-BR": [
        "[Transcrição — 23:49]",
        "",
        "Wren, é a Ada. Estou na Sala de Servidores B. Estou usando o seu login, como você disse: se alguém perguntar, você estava no fliperama e tem um álibi de dois milhões de pontos. Obrigada pela chave. Vou colocar o interruptor num lugar que eles não alcançam. Se eu ficar em silêncio, não é porque me acharam. É porque eu escolhi.",
      ],
    },
  },
  {
    name: "notes_on_mara.txt",
    body: {
      en: [
        "Mara Voss. Younger by four years. Teaches swimming at the harbour baths. Has never once been on time and has never once missed something that mattered.",
        "",
        "Born on the night of the storm, so Dad called her his weather. I'm March 14 — Dad called me his compass. We stopped talking over his papers. I want to fix that more than I want to fix the record. Both, ideally.",
      ],
      ko: [
        "마라 보스(Mara). 나보다 네 살 어림. 항구 수영장에서 수영을 가르침. 단 한 번도 제시간에 온 적 없고, 중요한 순간을 놓친 적도 단 한 번도 없음.",
        "",
        "폭풍이 치던 밤에 태어나서, 아빠는 마라를 자기의 '날씨'라고 불렀다. 나는 3월 14일생. 아빠는 나를 자기의 '나침반'이라고 불렀다. 우리는 아빠 서류 문제로 말을 끊었다. 기록을 바로잡는 것보다 그걸 바로잡고 싶다. 둘 다면 제일 좋고.",
      ],
      "zh-TW": [
        "瑪拉・佛斯（Mara）。小我四歲。在港口泳池教游泳。從來沒有準時過，也從來沒有錯過任何重要的時刻。",
        "",
        "她在暴風雨的夜裡出生，所以爸叫她他的「天氣」。我是3月14日生的，爸叫我他的「指南針」。我們為了爸的文件不再說話。比起修正紀錄，我更想修好這件事。兩件都能做到最好。",
      ],
      es: [
        "Mara Voss. Cuatro años menor que yo. Da clases de natación en los baños del puerto. Nunca ha llegado a tiempo y nunca se ha perdido nada que importara.",
        "",
        "Nació la noche de la tormenta, así que papá la llamaba su clima. Yo nací el 14 de marzo; papá me llamaba su brújula. Dejamos de hablarnos por sus papeles. Quiero arreglar eso más que arreglar el registro. Las dos cosas, idealmente.",
      ],
      ja: [
        "マーラ・ヴォス（Mara）。私より四つ下。港の公営プールで水泳を教えている。時間どおりに来たことは一度もないし、大事なことを見逃したことも一度もない。",
        "",
        "嵐の夜に生まれたから、父さんはマーラを自分の「天気」と呼んだ。私は3月14日生まれ。父さんは私を自分の「コンパス」と呼んだ。私たちは父さんの書類のことで口をきかなくなった。記録を正すことより、そっちを直したい。できれば両方。",
      ],
      "pt-BR": [
        "Mara Voss. Quatro anos mais nova. Dá aulas de natação nas piscinas do porto. Nunca chegou na hora uma única vez e nunca perdeu nada que importasse.",
        "",
        "Nasceu na noite da tempestade, então o papai a chamava de o clima dele. Eu nasci em 14 de março; o papai me chamava de a bússola dele. Paramos de nos falar por causa dos papéis dele. Quero consertar isso mais do que quero consertar o registro. As duas coisas, de preferência.",
      ],
    },
  },
  {
    name: "notes_on_wren.txt",
    body: {
      en: [
        "Wren Okafor. Systems Archivist. Testified to the 2019 Continuity Inquiry that the digitisation was dropping records 'selectively'. Two weeks later her photograph disappeared from the staff page, then from the register, then from the building's ID system.",
        "",
        "She still comes to work. She still holds the Circuit Runner '94 high score. She says the trick is the same as with the archive: learn the level so well you notice when someone moves a wall.",
      ],
      ko: [
        "렌 오카포(Wren Okafor). 시스템 아키비스트. 2019년 연속성 조사위원회에서 디지털화 과정에서 기록이 '선별적으로' 누락되고 있다고 증언함. 2주 뒤 그녀의 사진이 직원 페이지에서, 이어 명부에서, 이어 건물 출입증 시스템에서 사라졌다.",
        "",
        "그래도 그녀는 여전히 출근한다. Circuit Runner '94 최고 기록도 여전히 그녀 거다. 요령은 아카이브랑 똑같다고 한다. 레벨을 속속들이 익혀 두면, 누가 벽 하나를 옮겨도 알아챈다고.",
      ],
      "zh-TW": [
        "芮恩・奧卡佛（Wren Okafor）。系統檔案管理員。曾在2019年連續性調查委員會上作證，指出數位化過程正「有選擇地」遺漏紀錄。兩週後，她的照片從員工頁面消失，接著從名冊消失，再接著從大樓的識別證系統消失。",
        "",
        "她還是照常上班。Circuit Runner '94 的最高分紀錄也還是她的。她說訣竅跟檔案庫一樣：把關卡摸得夠熟，有人移動了一面牆你就會發現。",
      ],
      es: [
        "Wren Okafor. Archivista de sistemas. Declaró ante la Comisión de Investigación de Continuidad de 2019 que la digitalización estaba perdiendo registros «de forma selectiva». Dos semanas después, su fotografía desapareció de la página del personal, luego del padrón y luego del sistema de identificación del edificio.",
        "",
        "Todavía va a trabajar. Todavía tiene el récord de Circuit Runner '94. Dice que el truco es el mismo que con el archivo: aprenderte el nivel tan bien que notes cuando alguien mueve una pared.",
      ],
      ja: [
        "レン・オカフォー（Wren Okafor）。システム・アーキビスト。2019年の継続性調査委員会で、デジタル化の過程で記録が「選択的に」抜け落ちていると証言した。2週間後、彼女の写真は職員ページから消え、次に名簿から、そして建物のIDシステムから消えた。",
        "",
        "それでも彼女は出勤している。Circuit Runner '94 のハイスコアも、今も彼女のものだ。コツはアーカイブと同じだという。ステージを隅々まで覚えておけば、誰かが壁を一枚動かしたときに気づける。",
      ],
      "pt-BR": [
        "Wren Okafor. Arquivista de sistemas. Declarou na Comissão de Inquérito de Continuidade de 2019 que a digitalização estava perdendo registros “de forma seletiva”. Duas semanas depois, a foto dela sumiu da página da equipe, depois do cadastro, depois do sistema de identificação do prédio.",
        "",
        "Ela ainda vai trabalhar. Ainda tem o recorde de Circuit Runner '94. Diz que o truque é o mesmo do arquivo: conhecer a fase tão bem que você percebe quando alguém muda uma parede de lugar.",
      ],
    },
  },
  {
    name: "institute_history_true.txt",
    body: {
      en: [
        "The Meridian Institute was chartered on 14 June 1978 by the Harbour Trust — a private company with a warehouse fire it needed the city to forget.",
        "",
        "In 1987 the Trust dissolved and the Institute was 'refounded' by civic ordinance, with a new charter, a new board, and a new founding date. Everything before 1987 became prehistory. The footer was never updated. Someone in the old print shop swapped the digits, and the lie and the truth have shared a page ever since.",
      ],
      ko: [
        "메리디언 연구소는 1978년 6월 14일 하버 트러스트가 설립 인가를 받았다. 도시가 잊어 주길 바랐던 창고 화재를 안고 있던 민간 회사다.",
        "",
        "1987년 트러스트는 해산했고, 연구소는 시 조례에 따라 '재설립'되었다. 새 인가서, 새 이사회, 그리고 새 설립일. 1987년 이전의 모든 것은 선사시대가 되었다. 푸터는 끝내 고쳐지지 않았다. 옛 인쇄소의 누군가가 숫자를 바꿔 놓았고, 그 뒤로 거짓과 진실은 한 페이지를 나눠 쓰고 있다.",
      ],
      "zh-TW": [
        "子午研究院於1978年6月14日由港灣信託取得設立章程。港灣信託是一家民間公司，身上背著一場它需要全市遺忘的倉庫大火。",
        "",
        "1987年，信託解散，研究院依市政條例「重新創立」：新的章程、新的董事會、新的創立日期。1987年以前的一切都成了史前時代。頁尾從來沒有更新。舊印刷廠裡有人把數字對調了，從此謊言和真相就共用同一頁。",
      ],
      es: [
        "El Instituto Meridian recibió su carta fundacional el 14 de junio de 1978 de manos del Fideicomiso del Puerto, una empresa privada con un incendio en un almacén que necesitaba que la ciudad olvidara.",
        "",
        "En 1987 el Fideicomiso se disolvió y el Instituto fue «refundado» por ordenanza municipal, con una nueva carta, una nueva junta y una nueva fecha de fundación. Todo lo anterior a 1987 se volvió prehistoria. El pie de página nunca se actualizó. Alguien en la vieja imprenta intercambió los dígitos, y desde entonces la mentira y la verdad comparten página.",
      ],
      ja: [
        "メリディアン研究所は1978年6月14日、ハーバー信託によって設立認可を受けた。街に忘れてほしい倉庫火災を抱えた民間企業である。",
        "",
        "1987年、信託は解散し、研究所は市条例によって「再設立」された。新しい認可状、新しい理事会、新しい設立日。1987年以前のすべては先史時代になった。フッターは一度も更新されなかった。古い印刷所の誰かが数字を入れ替え、以来、嘘と真実は同じページを分け合っている。",
      ],
      "pt-BR": [
        "O Instituto Meridian recebeu seu estatuto em 14 de junho de 1978, concedido pelo Truste do Porto, uma empresa privada com um incêndio num armazém que precisava que a cidade esquecesse.",
        "",
        "Em 1987 o Truste foi dissolvido e o Instituto foi “refundado” por decreto municipal, com um novo estatuto, um novo conselho e uma nova data de fundação. Tudo o que veio antes de 1987 virou pré-história. O rodapé nunca foi atualizado. Alguém na velha gráfica trocou os dígitos de lugar, e desde então a mentira e a verdade dividem a mesma página.",
      ],
    },
  },
  {
    name: "about_the_compass.txt",
    body: {
      en: [
        "Seven notches, one for each founding collection. The seventh collection — the Trust's own papers — was withdrawn in 2019. The needle didn't break in the move. Kell snapped it at the pin so it would never point at number seven again.",
        "",
        "I took the broken tip home. It's in my coat pocket. When this is over, I'll give it back.",
      ],
      ko: [
        "눈금 일곱 개, 설립 컬렉션 하나에 하나씩. 일곱 번째 컬렉션, 트러스트 자신의 문서들은 2019년에 회수됐다. 바늘은 이전하다가 부러진 게 아니다. 다시는 7번을 가리키지 못하도록 켈이 축에서 꺾어 버린 거다.",
        "",
        "부러진 바늘 끝은 내가 집에 가져왔다. 코트 주머니에 있다. 이 일이 끝나면 돌려줄 거다.",
      ],
      "zh-TW": [
        "七道刻痕，每一道代表一批創始館藏。第七批館藏，也就是信託自己的文件，在2019年被撤下。指針不是搬遷時弄斷的。是凱爾從軸心把它折斷，好讓它再也不會指向七號。",
        "",
        "斷掉的指針尖我帶回家了，就放在我的大衣口袋裡。等這一切結束，我會把它還回去。",
      ],
      es: [
        "Siete muescas, una por cada colección fundacional. La séptima colección, los propios papeles del Fideicomiso, se retiró en 2019. La aguja no se rompió en la mudanza. Kell la partió a la altura del eje para que nunca volviera a señalar el número siete.",
        "",
        "Me llevé la punta rota a casa. Está en el bolsillo de mi abrigo. Cuando esto termine, la devolveré.",
      ],
      ja: [
        "刻み目は七つ。創設時のコレクションひとつにつきひとつ。七つ目のコレクション、つまり信託自身の文書は、2019年に撤去された。針は移転の際に折れたのではない。二度と七番を指さないよう、ケルが軸のところでへし折ったのだ。",
        "",
        "折れた針先は私が家に持ち帰った。コートのポケットに入っている。これが終わったら、返すつもりだ。",
      ],
      "pt-BR": [
        "Sete entalhes, um para cada coleção fundadora. A sétima coleção, os próprios papéis do Truste, foi retirada em 2019. A agulha não quebrou na mudança. O Kell a partiu rente ao pino para que ela nunca mais apontasse para o número sete.",
        "",
        "Levei a ponta quebrada para casa. Está no bolso do meu casaco. Quando isso acabar, eu devolvo.",
      ],
    },
  },
];

export function bonusFiles(loc: Locale): { name: string; body: string }[] {
  return FILES.map((f) => ({ name: f.name, body: (f.body[loc] ?? f.body.en).join("\n") }));
}
