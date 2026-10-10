import "server-only";
import { pick, type Locale } from "@/i18n/config";
import type { Block, RoomProgress, SitePage } from "@/lib/types";
import { page } from "./source";
import { ADMIN_PASSWORD, toBinary5 } from "../answers";

export const INTRANET_HOST = "intranet.meridian-inst.net";

type X = ReturnType<typeof pick>;

const footer = (x: X): Block => ({
  type: "footer",
  text: x({
    en: "© since 1978. Meridian Institute internal systems. Unauthorised access is a continuity violation.",
    ko: "© since 1978. 메리디언 연구소 내부 시스템. 무단 접근은 연속성 위반에 해당합니다.",
    "zh-TW": "© since 1978。子午研究院內部系統。未經授權之存取，即屬違反連續性。",
    es: "© since 1978. Sistemas internos del Instituto Meridian. El acceso no autorizado constituye una infracción de continuidad.",
    ja: "© since 1978. メリディアン研究所 内部システム。不正アクセスは継続性違反にあたります。",
  }),
});

function login(x: X, gatedFrom?: string): SitePage {
  const blocks: Block[] = [
    { type: "compass" },
    { type: "heading", level: 1, text: x({ en: "The Vault", ko: "볼트(The Vault)", "zh-TW": "金庫（The Vault）", es: "La Bóveda (The Vault)", ja: "金庫（The Vault）" }) },
    { type: "paragraph", text: x({ en: "Meridian Staff Access", ko: "메리디언 직원 전용 접속", "zh-TW": "子午研究院職員專用入口", es: "Acceso del personal de Meridian", ja: "メリディアン職員専用アクセス" }) },
    ...(gatedFrom
      ? [{ type: "notice", tone: "warning", text: x({ en: "Session required. Please sign in to continue.", ko: "세션이 필요합니다. 계속하려면 로그인하십시오.", "zh-TW": "需要登入工作階段。請先登入以繼續。", es: "Se requiere una sesión. Inicie sesión para continuar.", ja: "セッションが必要です。続行するにはログインしてください。" }) } as Block]
      : []),
    {
      type: "paragraph",
      text: x({
        en: "Authorised personnel only. Accounts follow the standard staff format.",
        ko: "인가된 인원만 접근할 수 있습니다. 계정은 표준 직원 형식을 따릅니다.",
        "zh-TW": "僅限授權人員存取。帳號採用標準職員格式。",
        es: "Solo personal autorizado. Las cuentas siguen el formato estándar del personal.",
        ja: "許可された職員専用です。アカウントは標準の職員形式に従います。",
      }),
    },
    { type: "form", form: "intranet-login", prompt: x({ en: "Enter your staff username and vault code.", ko: "직원 사용자명과 볼트 코드를 입력하십시오.", "zh-TW": "請輸入您的職員使用者名稱與金庫代碼。", es: "Ingrese su nombre de usuario del personal y su código de bóveda.", ja: "職員ユーザー名と金庫コードを入力してください。" }) },
    {
      type: "notice",
      tone: "info",
      text: x({
        en: "Forgotten your vault code? Legacy accounts were issued codes at onboarding. Contact Systems (W. Okafor) — extension unavailable.",
        ko: "볼트 코드를 잊으셨습니까? 구형 계정의 코드는 입사 시 발급되었습니다. 시스템 담당(W. Okafor)에게 문의하십시오. 내선 연결 불가.",
        "zh-TW": "忘記金庫代碼？舊版帳號的代碼於到職時核發。請洽系統組（W. Okafor）。分機無法接通。",
        es: "¿Olvidó su código de bóveda? A las cuentas antiguas se les asignaron códigos al incorporarse. Contacte a Sistemas (W. Okafor). Extensión no disponible.",
        ja: "金庫コードをお忘れですか？　旧アカウントのコードは入職時に発行されています。システム担当（W. Okafor）までお問い合わせください。内線は不通です。",
      }),
    },
    footer(x),
  ];
  return page(INTRANET_HOST, x({ en: "The Vault — Meridian Staff Access", ko: "볼트(The Vault) — 메리디언 직원 전용 접속", "zh-TW": "金庫（The Vault）— 子午研究院職員專用入口", es: "La Bóveda (The Vault) — Acceso del personal de Meridian", ja: "金庫（The Vault）— メリディアン職員専用アクセス" }), "intranet", blocks, {
    headComments: [x({ en: "MeridianAuth 1.3 — legacy mode", ko: "MeridianAuth 1.3 — 레거시 모드", "zh-TW": "MeridianAuth 1.3 — 舊版模式", es: "MeridianAuth 1.3 — modo heredado", ja: "MeridianAuth 1.3 — レガシーモード" })],
    bodyComments: [
      x({ en: "usernames: firstname.lastname (lowercase)", ko: "사용자명: firstname.lastname (소문자)", "zh-TW": "使用者名稱：firstname.lastname（小寫）", es: "nombres de usuario: firstname.lastname (en minúsculas)", ja: "ユーザー名：firstname.lastname（小文字）" }),
      x({
        en: "legacy vault codes per IT-2019-07: the TRUE founding year, followed by the 4-digit registry ID the user chose. yes, really. — W.O.",
        ko: "IT-2019-07에 따른 레거시 볼트 코드: 진짜(TRUE) 설립 연도 뒤에 사용자가 고른 4자리 등록번호(registry ID)를 붙인 것. 네, 진짜로요. — W.O.",
        "zh-TW": "依 IT-2019-07 的舊版金庫代碼：真正的（TRUE）創立年份，後面接上使用者自選的 4 位數登記編號（registry ID）。對，真的就是這樣。——W.O.",
        es: "códigos de bóveda heredados según IT-2019-07: el año de fundación VERDADERO (TRUE), seguido del número de registro (registry ID) de 4 dígitos que eligió el usuario. sí, en serio. — W.O.",
        ja: "IT-2019-07 に基づくレガシー金庫コード：本当の（TRUE）設立年のあとに、ユーザーが選んだ4桁の登録番号（registry ID）を続けたもの。はい、本当にです。— W.O.",
      }),
    ],
  });
}

const nav = (x: X): Block => ({
  type: "nav",
  links: [
    { text: x({ en: "Dashboard", ko: "대시보드", "zh-TW": "儀表板", es: "Panel", ja: "ダッシュボード" }), href: INTRANET_HOST },
    { text: x({ en: "Record Changes", ko: "기록 변경", "zh-TW": "紀錄變更", es: "Cambios en registros", ja: "記録変更" }), href: `${INTRANET_HOST}/records` },
    { text: x({ en: "Memos", ko: "메모", "zh-TW": "備忘錄", es: "Memorandos", ja: "社内メモ" }), href: `${INTRANET_HOST}/memos` },
    { text: x({ en: "Admin", ko: "관리자", "zh-TW": "管理", es: "Administración", ja: "管理" }), href: `${INTRANET_HOST}/admin` },
  ],
});

const diffs = (x: X): Block[] => [
  {
    type: "diff",
    label: x({ en: "Charter of Incorporation — founding year", ko: "설립 인가장 — 설립 연도", "zh-TW": "設立特許狀——創立年份", es: "Carta de constitución — año de fundación", ja: "設立認可状 — 設立年" }),
    before: x({ en: "Chartered 14 June 1978 by the Harbour Trust.", ko: "1978년 6월 14일 하버 트러스트에 의해 인가.", "zh-TW": "1978 年 6 月 14 日由港灣信託特許設立。", es: "Constituido el 14 de junio de 1978 por el Fideicomiso del Puerto.", ja: "1978年6月14日、ハーバー信託により認可。" }),
    after: x({ en: "Chartered 1987 by civic ordinance.", ko: "1987년 시 조례에 의해 인가.", "zh-TW": "1987 年依市府條例特許設立。", es: "Constituido en 1987 por ordenanza municipal.", ja: "1987年、市条例により認可。" }),
  },
  {
    type: "diff",
    label: x({ en: "Harbour Ledger vol. III, fol. 12 — entry for the night of the warehouse fire", ko: "하버 원장 제3권 12장 — 창고 화재 당일 밤 기록", "zh-TW": "港灣帳冊第 III 卷第 12 頁——倉庫大火當夜紀錄", es: "Libro del Puerto vol. III, fol. 12 — anotación de la noche del incendio del almacén", ja: "ハーバー台帳 第III巻 第12葉 — 倉庫火災当夜の記載" }),
    before: x({
      en: "Fire reported 02:10. Watchman's statement: lamps seen in the Trust office before the blaze.",
      ko: "02:10 화재 신고. 야간 경비원 진술: 불이 나기 전 트러스트 사무실에서 등불이 목격됨.",
      "zh-TW": "02:10 通報火警。守夜人證詞：起火前曾見港灣信託辦公室內有燈火。",
      es: "Incendio reportado a las 02:10. Declaración del vigilante: se vieron lámparas en la oficina del Fideicomiso antes del fuego.",
      ja: "02:10 火災通報。夜警の証言：出火前、信託事務所内に灯りが見えた。",
    }),
    after: x({ en: "Fire reported 02:10. Cause: electrical.", ko: "02:10 화재 신고. 원인: 전기 계통.", "zh-TW": "02:10 通報火警。原因：電氣故障。", es: "Incendio reportado a las 02:10. Causa: eléctrica.", ja: "02:10 火災通報。原因：電気系統。" }),
  },
  {
    type: "diff",
    label: x({ en: "Staff register — Systems Archivist", ko: "직원 명부 — 시스템 기록관", "zh-TW": "職員名冊——系統檔案研究員", es: "Registro del personal — Archivista de sistemas", ja: "職員名簿 — システム・アーキビスト" }),
    before: x({
      en: "Wren Okafor — Systems Archivist. Photograph on file. Witness, Continuity Inquiry 2019.",
      ko: "렌 오카포(Wren Okafor) — 시스템 기록관. 사진 보관됨. 2019년 연속성 조사 증인.",
      "zh-TW": "芮恩・奧卡佛（Wren Okafor）——系統檔案研究員。照片存檔。2019 年連續性調查證人。",
      es: "Wren Okafor — Archivista de sistemas. Fotografía en archivo. Testigo, Investigación de Continuidad 2019.",
      ja: "レン・オカフォー（Wren Okafor）— システム・アーキビスト。写真保管あり。2019年継続性調査の証人。",
    }),
    after: x({ en: "Wren Okafor — Systems Archivist.", ko: "렌 오카포(Wren Okafor) — 시스템 기록관.", "zh-TW": "芮恩・奧卡佛（Wren Okafor）——系統檔案研究員。", es: "Wren Okafor — Archivista de sistemas.", ja: "レン・オカフォー（Wren Okafor）— システム・アーキビスト。" }),
  },
  {
    type: "diff",
    label: x({ en: "Founders' correspondence — signatories", ko: "설립자 서신 — 서명인", "zh-TW": "創始人書信——簽署人", es: "Correspondencia de los fundadores — firmantes", ja: "創設者書簡 — 署名者" }),
    before: x({ en: "Signed: H. Calloway, T. Kell (sr.), E. Voss.", ko: "서명: H. 캘러웨이, T. 켈(부), E. 보스.", "zh-TW": "簽署：H. 卡洛威、T. 凱爾（父）、E. 佛斯。", es: "Firmado: H. Calloway, T. Kell (padre), E. Voss.", ja: "署名：H・キャロウェイ、T・ケル（父）、E・ヴォス。" }),
    after: x({ en: "Signed: [withdrawn].", ko: "서명: [철회됨].", "zh-TW": "簽署：[已撤回]。", es: "Firmado: [retirado].", ja: "署名：[撤回済み]。" }),
  },
  {
    type: "diff",
    label: x({ en: "Staff register — Senior Archivist", ko: "직원 명부 — 선임 기록관", "zh-TW": "職員名冊——資深檔案研究員", es: "Registro del personal — Archivista sénior", ja: "職員名簿 — 主任アーキビスト" }),
    before: x({ en: "Dr. Ada Voss — Senior Archivist. Status: active.", ko: "에이다 보스 박사 — 선임 기록관. 상태: 재직.", "zh-TW": "艾達・佛斯博士——資深檔案研究員。狀態：在職。", es: "Dra. Ada Voss — Archivista sénior. Estado: activa.", ja: "エイダ・ヴォス博士 — 主任アーキビスト。ステータス：在職。" }),
    after: x({ en: "Dr. Ada Voss — Senior Archivist. Status: on leave (indefinite).", ko: "에이다 보스 박사 — 선임 기록관. 상태: 휴직(무기한).", "zh-TW": "艾達・佛斯博士——資深檔案研究員。狀態：休假中（無限期）。", es: "Dra. Ada Voss — Archivista sénior. Estado: de licencia (indefinida).", ja: "エイダ・ヴォス博士 — 主任アーキビスト。ステータス：休暇中（無期限）。" }),
  },
];

const memo = (x: X): Block => ({
  type: "memo",
  heading: x({ en: "MEMO — Office of Continuity — RE: Dr. A. Voss", ko: "메모 — 연속성 관리실 — 건명: A. 보스 박사", "zh-TW": "備忘錄 — 連續性辦公室 — 主旨：A. 佛斯博士", es: "MEMORANDO — Oficina de Continuidad — ASUNTO: Dra. A. Voss", ja: "メモ — 継続性管理室 — 件名：A・ヴォス博士" }),
  parts: [
    {
      text: x({
        en: "To: Deputy Director T. Kell. From: Security (L. Ash). Voss has not been located. Her badge was last used at the server room at 23:58. We believe she has left something running on an external host. Our analysts traced outbound traffic to ",
        ko: "수신: 켈 부국장(Deputy Director T. Kell). 발신: 보안팀(애시). 보스의 소재는 아직 파악되지 않았습니다. 그녀의 출입증이 마지막으로 사용된 곳은 23:58 서버실입니다. 그녀가 외부 호스트에 무언가를 실행해 둔 것으로 판단됩니다. 분석팀이 외부 트래픽을 추적한 결과 목적지는 ",
        "zh-TW": "收件人：凱爾副所長（Deputy Director T. Kell）。寄件人：保安組（艾許）。佛斯仍下落不明。她的識別證最後一次刷卡是 23:58，地點在伺服器機房。我們研判她在外部主機上留下了某個仍在運作的東西。分析人員追蹤對外流量，目的地為 ",
        es: "Para: Subdirector T. Kell. De: Seguridad (L. Ash). No hemos localizado a Voss. Su credencial se usó por última vez en la sala de servidores a las 23:58. Creemos que dejó algo en funcionamiento en un servidor externo. Nuestros analistas rastrearon el tráfico saliente hasta ",
        ja: "宛先：T・ケル副所長。差出人：警備部（L・アッシュ）。ヴォスの所在は依然つかめていません。彼女の入館証が最後に使用されたのは 23:58、サーバー室です。外部ホスト上で何かを稼働させたままにしていると思われます。分析班が外向きの通信を追跡したところ、行き先は ",
      }),
    },
    { redacted: "switch.ada-voss.net" },
    {
      text: x({
        en: ". It appears to be a dead man's switch: if the timer runs out, the unaltered records go to every newsroom in the city. Recommend we locate her before it fires. Recommend we do not involve the police. Recommend we do not involve ",
        ko: "입니다. 데드맨 스위치로 보입니다. 타이머가 끝나면 수정되지 않은 원본 기록이 시내 모든 언론사로 전송됩니다. 작동 전에 그녀를 찾을 것을 권고합니다. 경찰을 개입시키지 않을 것을 권고합니다. 다음 인물도 개입시키지 않을 것을 권고합니다: ",
        "zh-TW": "。看起來是一個死手開關：計時器一旦歸零，未經修改的原始紀錄就會寄送給全市每一家新聞媒體。建議在它觸發前找到她。建議不要讓警方介入。建議也不要讓以下人士介入：",
        es: ". Parece ser un interruptor de hombre muerto: si el temporizador llega a cero, los registros sin alterar se enviarán a todas las redacciones de la ciudad. Recomendamos localizarla antes de que se active. Recomendamos no involucrar a la policía. Recomendamos no involucrar a ",
        ja: " でした。デッドマン・スイッチと見られます。タイマーが切れれば、改ざんされていない記録が市内のすべての報道機関に送られます。作動する前に彼女を見つけ出すよう進言します。警察は関与させないよう進言します。次の人物も関与させないよう進言します：",
      }),
    },
    { redacted: x({ en: "her sister", ko: "그녀의 여동생", "zh-TW": "她的妹妹", es: "su hermana", ja: "彼女の妹" }) },
    { text: x({ en: ".", ko: ".", "zh-TW": "。", es: ".", ja: "。" }) },
  ],
});

const systemsNotice = (x: X): Block => ({
  type: "notice",
  tone: "info",
  text: x({
    en: `SYSTEMS NOTICE (W. Okafor)\nAdmin console password rotated after Tuesday's badge incident. Flagged memos have moved there.\nNew password, written the way I teach it:\n${toBinary5(ADMIN_PASSWORD)}\nIf you skipped my class, that's on you.`,
    ko: `시스템 공지 (W. Okafor)\n화요일 출입증 사건 이후 관리자 콘솔 비밀번호를 교체했습니다. 플래그된 메모는 그쪽으로 옮겼습니다.\n새 비밀번호는 제 수업에서 가르치는 방식으로 적어 둡니다:\n${toBinary5(ADMIN_PASSWORD)}\n제 수업을 빼먹으셨다면, 그건 본인 책임입니다.`,
    "zh-TW": `系統公告（W. Okafor）\n週二識別證事件後，管理主控台密碼已更換。被標記的備忘錄已移到那裡。\n新密碼，用我上課教的方式寫：\n${toBinary5(ADMIN_PASSWORD)}\n如果你翹了我的課，那是你自己的問題。`,
    es: `AVISO DE SISTEMAS (W. Okafor)\nLa contraseña de la consola de administración se cambió tras el incidente de la credencial del martes. Los memorandos marcados se trasladaron allí.\nNueva contraseña, escrita como la enseño en clase:\n${toBinary5(ADMIN_PASSWORD)}\nSi faltaste a mi clase, es problema tuyo.`,
    ja: `システムからのお知らせ（W. Okafor）\n火曜の入館証の件を受けて、管理コンソールのパスワードを変更しました。フラグ付きメモはそちらに移してあります。\n新しいパスワードは、私が授業で教えているやり方で書いておきます：\n${toBinary5(ADMIN_PASSWORD)}\n私の授業をサボった人は、自己責任でどうぞ。`,
  }),
});

function adminLogin(x: X): SitePage {
  const blocks: Block[] = [
    nav(x),
    { type: "heading", level: 1, text: x({ en: "Systems Admin Console", ko: "시스템 관리자 콘솔", "zh-TW": "系統管理主控台", es: "Consola de administración de sistemas", ja: "システム管理コンソール" }) },
    {
      type: "notice",
      tone: "warning",
      text: x({
        en: "Restricted. Flagged memos and badge logs. Admin password required, even for signed-in staff.",
        ko: "접근 제한. 플래그된 메모와 출입 기록 보관. 로그인한 직원이라도 관리자 비밀번호가 필요합니다.",
        "zh-TW": "限制存取。內含被標記的備忘錄與識別證紀錄。即使是已登入的職員，也需要管理員密碼。",
        es: "Acceso restringido. Memorandos marcados y registros de credenciales. Se requiere la contraseña de administración, incluso para el personal con sesión iniciada.",
        ja: "アクセス制限。フラグ付きメモと入館記録を保管。ログイン済みの職員であっても、管理者パスワードが必要です。",
      }),
    },
    { type: "form", form: "admin-login", prompt: x({ en: "Admin password", ko: "관리자 비밀번호", "zh-TW": "管理員密碼", es: "Contraseña de administración", ja: "管理者パスワード" }) },
    {
      type: "paragraph",
      text: x({
        en: "Password rotated by Systems. See the pinned notice on the dashboard.",
        ko: "시스템 담당이 비밀번호를 교체했습니다. 대시보드에 고정된 공지를 확인하십시오.",
        "zh-TW": "密碼已由系統組更換。請查看儀表板上的置頂公告。",
        es: "Sistemas cambió la contraseña. Consulte el aviso fijado en el panel.",
        ja: "パスワードはシステム担当により変更されました。ダッシュボードに固定表示されたお知らせを確認してください。",
      }),
    },
    footer(x),
  ];
  return page(`${INTRANET_HOST}/admin`, x({ en: "Systems Admin Console", ko: "시스템 관리자 콘솔", "zh-TW": "系統管理主控台", es: "Consola de administración de sistemas", ja: "システム管理コンソール" }), "intranet", blocks, {
    headComments: [x({ en: "MeridianAuth 1.3 — elevated", ko: "MeridianAuth 1.3 — 권한 상승", "zh-TW": "MeridianAuth 1.3 — 權限提升", es: "MeridianAuth 1.3 — privilegios elevados", ja: "MeridianAuth 1.3 — 権限昇格" })],
    bodyComments: [x({ en: "letters only. no spaces. case doesn't matter. — W.O.", ko: "영문자만. 띄어쓰기 없이. 대소문자는 상관없음. — W.O.", "zh-TW": "只有英文字母。不要空格。大小寫不拘。——W.O.", es: "solo letras. sin espacios. da igual mayúsculas o minúsculas. — W.O.", ja: "英字のみ。スペースなし。大文字・小文字は問わない。— W.O." })],
  });
}

function adminConsole(x: X): SitePage {
  const blocks: Block[] = [
    nav(x),
    { type: "heading", level: 1, text: x({ en: "Systems Admin Console", ko: "시스템 관리자 콘솔", "zh-TW": "系統管理主控台", es: "Consola de administración de sistemas", ja: "システム管理コンソール" }) },
    { type: "notice", tone: "success", text: x({ en: "Elevated session active.", ko: "권한 상승 세션이 활성화되었습니다.", "zh-TW": "權限提升工作階段已啟用。", es: "Sesión con privilegios elevados activa.", ja: "権限昇格セッションが有効です。" }) },
    { type: "heading", level: 2, text: x({ en: "Badge log, Server Room B", ko: "출입 기록, 서버실 B", "zh-TW": "識別證紀錄，B 號伺服器機房", es: "Registro de credenciales, Sala de Servidores B", ja: "入館記録、サーバー室B" }) },
    {
      type: "list",
      items: [
        x({ en: "23:41 W. OKAFOR: badge in", ko: "23:41 W. OKAFOR: 출입증 입실", "zh-TW": "23:41 W. OKAFOR：刷卡進入", es: "23:41 W. OKAFOR: entrada con credencial", ja: "23:41 W. OKAFOR：入館" }),
        x({ en: "23:52 W. OKAFOR: Vault sign-in (terminal 3)", ko: "23:52 W. OKAFOR: 볼트 로그인 (단말 3)", "zh-TW": "23:52 W. OKAFOR：金庫登入（3 號終端機）", es: "23:52 W. OKAFOR: inicio de sesión en la Bóveda (terminal 3)", ja: "23:52 W. OKAFOR：金庫にログイン（端末3）" }),
        x({
          en: "23:58 A. VOSS: badge in (badge reported deactivated 3 days earlier)",
          ko: "23:58 A. VOSS: 출입증 입실 (해당 출입증은 3일 전 비활성화로 보고됨)",
          "zh-TW": "23:58 A. VOSS：刷卡進入（該識別證已於 3 天前回報停用）",
          es: "23:58 A. VOSS: entrada con credencial (credencial reportada como desactivada 3 días antes)",
          ja: "23:58 A. VOSS：入館（この入館証は3日前に無効化が報告済み）",
        }),
        x({ en: "00:06 outbound transfer, 2.4 GB, to an external host", ko: "00:06 외부 호스트로 2.4 GB 송신", "zh-TW": "00:06 對外部主機傳出 2.4 GB 資料", es: "00:06 transferencia saliente, 2.4 GB, a un servidor externo", ja: "00:06 外部ホストへの送信、2.4 GB" }),
        x({ en: "00:09 A. VOSS: no badge out recorded", ko: "00:09 A. VOSS: 퇴실 기록 없음", "zh-TW": "00:09 A. VOSS：無刷卡離開紀錄", es: "00:09 A. VOSS: no consta salida con credencial", ja: "00:09 A. VOSS：退館記録なし" }),
      ],
    },
    { type: "heading", level: 2, text: x({ en: "Flagged memo", ko: "플래그된 메모", "zh-TW": "被標記的備忘錄", es: "Memorando marcado", ja: "フラグ付きメモ" }) },
    memo(x),
    footer(x),
  ];
  return page(`${INTRANET_HOST}/admin`, x({ en: "Systems Admin Console", ko: "시스템 관리자 콘솔", "zh-TW": "系統管理主控台", es: "Consola de administración de sistemas", ja: "システム管理コンソール" }), "intranet", blocks, {
    headComments: [x({ en: "MeridianAuth 1.3 — elevated session ok", ko: "MeridianAuth 1.3 — 권한 상승 세션 정상", "zh-TW": "MeridianAuth 1.3 — 權限提升工作階段正常", es: "MeridianAuth 1.3 — sesión con privilegios elevados correcta", ja: "MeridianAuth 1.3 — 権限昇格セッション正常" })],
    tailComments: [x({ en: "if you're reading this, Ada: I left the door open. — W.", ko: "에이다, 이걸 읽고 있다면: 문은 열어 뒀어. — W.", "zh-TW": "艾達，如果你在讀這段：門我留著沒關。——W.", es: "si estás leyendo esto, Ada: dejé la puerta abierta. — W.", ja: "エイダ、これを読んでるなら：ドアは開けておいた。— W." })],
  });
}

function dashboard(x: X): SitePage {
  const notice = systemsNotice(x);
  const blocks: Block[] = [
    nav(x),
    { type: "compass" },
    { type: "heading", level: 1, text: x({ en: "Welcome back, wren.okafor", ko: "다시 오신 것을 환영합니다, wren.okafor", "zh-TW": "歡迎回來，wren.okafor", es: "Bienvenida de nuevo, wren.okafor", ja: "おかえりなさい、wren.okafor" }) },
    {
      type: "notice",
      tone: "warning",
      text: x({
        en: "Last sign-in for this account: 2 days ago, 23:52, from Server Room B. Was this you?",
        ko: "이 계정의 마지막 로그인: 2일 전 23:52, 서버실 B. 본인이 맞습니까?",
        "zh-TW": "此帳號上次登入：2 天前 23:52，來自 B 號伺服器機房。是您本人嗎？",
        es: "Último inicio de sesión de esta cuenta: hace 2 días, 23:52, desde la Sala de Servidores B. ¿Fue usted?",
        ja: "このアカウントの前回ログイン：2日前 23:52、サーバー室Bから。ご本人ですか？",
      }),
    },
    {
      type: "paragraph",
      text: x({
        en: "Continuity queue: 0 items pending. 4,112 items reconciled this year.",
        ko: "연속성 대기열: 처리 대기 0건. 올해 정합 처리 4,112건.",
        "zh-TW": "連續性佇列：待處理 0 件。今年已統整 4,112 件。",
        es: "Cola de continuidad: 0 elementos pendientes. 4112 elementos conciliados este año.",
        ja: "継続性キュー：保留中 0件。今年の整合処理 4,112件。",
      }),
    },
    { type: "heading", level: 2, text: x({ en: "Recent record changes", ko: "최근 기록 변경", "zh-TW": "近期紀錄變更", es: "Cambios recientes en registros", ja: "最近の記録変更" }) },
    ...diffs(x).slice(0, 3),
    { type: "link", text: x({ en: "All record changes →", ko: "전체 기록 변경 →", "zh-TW": "所有紀錄變更 →", es: "Todos los cambios en registros →", ja: "すべての記録変更 →" }), href: `${INTRANET_HOST}/records` },
    { type: "heading", level: 2, text: x({ en: "Pinned by Systems", ko: "시스템 담당 고정 공지", "zh-TW": "系統組置頂公告", es: "Fijado por Sistemas", ja: "システム担当による固定表示" }) },
    notice,
    { type: "link", text: x({ en: "Systems Admin console →", ko: "시스템 관리자 콘솔 →", "zh-TW": "系統管理主控台 →", es: "Consola de administración de sistemas →", ja: "システム管理コンソール →" }), href: `${INTRANET_HOST}/admin` },
    footer(x),
  ];
  return page(INTRANET_HOST, x({ en: "The Vault — Dashboard", ko: "볼트(The Vault) — 대시보드", "zh-TW": "金庫（The Vault）— 儀表板", es: "La Bóveda (The Vault) — Panel", ja: "金庫（The Vault）— ダッシュボード" }), "intranet", blocks, {
    headComments: [x({ en: "MeridianAuth 1.3 — session ok", ko: "MeridianAuth 1.3 — 세션 정상", "zh-TW": "MeridianAuth 1.3 — 工作階段正常", es: "MeridianAuth 1.3 — sesión correcta", ja: "MeridianAuth 1.3 — セッション正常" })],
    bodyComments: [x({ en: "she used my account. I let her. — W.", ko: "그녀가 내 계정을 썼다. 내가 그러라고 했다. — W.", "zh-TW": "她用了我的帳號。是我讓她用的。——W.", es: "usó mi cuenta. yo la dejé. — W.", ja: "彼女は私のアカウントを使った。使わせたのは私だ。— W." })],
    inlineComments: {
      [blocks.indexOf(notice)]: [
        x({
          en: "five bits a letter, A is 00001. same as Tuesday nights. lesson notes: harbourcc.edu/cs110 — W.O.",
          ko: "글자 하나에 5비트, A는 00001. 화요일 밤 수업이랑 똑같아요. 강의 노트: harbourcc.edu/cs110 — W.O.",
          "zh-TW": "一個字母五個位元，A 是 00001。跟週二晚上的課一樣。課程筆記：harbourcc.edu/cs110 ——W.O.",
          es: "cinco bits por letra, la A es 00001. igual que los martes por la noche. apuntes de clase: harbourcc.edu/cs110 — W.O.",
          ja: "1文字5ビット、A は 00001。火曜の夜の授業と同じ。授業ノート：harbourcc.edu/cs110 — W.O.",
        }),
      ],
    },
  });
}

function records(x: X): SitePage {
  const blocks: Block[] = [
    nav(x),
    { type: "heading", level: 1, text: x({ en: "Record Changes — Continuity Log", ko: "기록 변경 — 연속성 로그", "zh-TW": "紀錄變更 — 連續性日誌", es: "Cambios en registros — Bitácora de continuidad", ja: "記録変更 — 継続性ログ" }) },
    {
      type: "paragraph",
      text: x({
        en: "Every reconciliation is logged here before the original is retired. Logs are purged quarterly.",
        ko: "모든 정합 처리는 원본 폐기 전 이곳에 기록됩니다. 로그는 분기마다 삭제됩니다.",
        "zh-TW": "每一次統整，都會在原件汰除前記錄於此。日誌每季清除。",
        es: "Cada conciliación se registra aquí antes de retirar el original. Las bitácoras se purgan cada trimestre.",
        ja: "すべての整合処理は、原本が廃棄される前にここに記録されます。ログは四半期ごとに消去されます。",
      }),
    },
    ...diffs(x),
    { type: "notice", tone: "danger", text: x({ en: "Purge scheduled. This log will be cleared in 3 days.", ko: "삭제 예정. 이 로그는 3일 후 삭제됩니다.", "zh-TW": "已排定清除。本日誌將於 3 天後清空。", es: "Purga programada. Esta bitácora se borrará en 3 días.", ja: "消去予定。このログは3日後に消去されます。" }) },
    footer(x),
  ];
  return page(`${INTRANET_HOST}/records`, x({ en: "Record Changes", ko: "기록 변경", "zh-TW": "紀錄變更", es: "Cambios en registros", ja: "記録変更" }), "intranet", blocks, {
    tailComments: [
      x({
        en: "export of this log was requested by A.VOSS 2 days ago. request completed (??)",
        ko: "이 로그의 내보내기를 2일 전 A.VOSS가 요청함. 요청 처리 완료 (??)",
        "zh-TW": "此日誌的匯出由 A.VOSS 於 2 天前申請。申請已完成（??）",
        es: "la exportación de esta bitácora la solicitó A.VOSS hace 2 días. solicitud completada (??)",
        ja: "このログのエクスポートが2日前に A.VOSS により申請された。申請は完了（??）",
      }),
    ],
  });
}

function memos(x: X): SitePage {
  const blocks: Block[] = [
    nav(x),
    { type: "heading", level: 1, text: x({ en: "Memos", ko: "메모", "zh-TW": "備忘錄", es: "Memorandos", ja: "社内メモ" }) },
    {
      type: "notice",
      tone: "warning",
      text: x({
        en: "1 flagged memo (RE: Dr. A. Voss) has been moved to the Systems Admin console.",
        ko: "플래그된 메모 1건(건명: A. 보스 박사)이 시스템 관리자 콘솔로 이동되었습니다.",
        "zh-TW": "1 份被標記的備忘錄（主旨：A. 佛斯博士）已移至系統管理主控台。",
        es: "1 memorando marcado (ASUNTO: Dra. A. Voss) se trasladó a la consola de administración de sistemas.",
        ja: "フラグ付きメモ1件（件名：A・ヴォス博士）はシステム管理コンソールに移動されました。",
      }),
    },
    { type: "link", text: x({ en: "Systems Admin console →", ko: "시스템 관리자 콘솔 →", "zh-TW": "系統管理主控台 →", es: "Consola de administración de sistemas →", ja: "システム管理コンソール →" }), href: `${INTRANET_HOST}/admin` },
    {
      type: "memo",
      heading: x({ en: "MEMO — Director's Office — RE: public messaging", ko: "메모 — 소장실 — 건명: 대외 발표", "zh-TW": "備忘錄 — 所長辦公室 — 主旨：對外說法", es: "MEMORANDO — Oficina de la Dirección — ASUNTO: comunicación pública", ja: "メモ — 所長室 — 件名：対外説明" }),
      parts: [
        {
          text: x({
            en: "If asked, Dr. Voss is on extended leave for personal reasons. Do not use the word 'missing'. Do not confirm or deny the existence of the Continuity Office.",
            ko: "문의가 있을 경우, 보스 박사는 개인 사유로 장기 휴직 중이라고 답할 것. '실종'이라는 단어는 쓰지 말 것. 연속성 관리실의 존재는 확인도 부인도 하지 말 것.",
            "zh-TW": "如有人詢問，一律回覆佛斯博士因個人因素長期休假。不得使用「失蹤」一詞。對連續性辦公室的存在，不予證實也不予否認。",
            es: "Si alguien pregunta, la Dra. Voss está de licencia prolongada por motivos personales. No use la palabra 'desaparecida'. No confirme ni niegue la existencia de la Oficina de Continuidad.",
            ja: "問い合わせがあった場合、ヴォス博士は一身上の都合により長期休暇中であると回答すること。「失踪」という言葉は使わないこと。継続性管理室の存在については、肯定も否定もしないこと。",
          }),
        },
      ],
    },
    footer(x),
  ];
  return page(`${INTRANET_HOST}/memos`, x({ en: "Memos", ko: "메모", "zh-TW": "備忘錄", es: "Memorandos", ja: "社内メモ" }), "intranet", blocks);
}

export function resolveIntranet(path: string, progress: RoomProgress, loc: Locale): SitePage | null {
  const x = pick(loc);
  const authed = progress.solved.includes("intranet-login");
  if (path === "" || path === "/login") return authed ? dashboard(x) : login(x);
  const known = ["/dashboard", "/records", "/memos", "/admin"];
  if (!known.includes(path)) return null;
  if (!authed) return login(x, path);
  if (path === "/dashboard") return dashboard(x);
  if (path === "/admin") return progress.solved.includes("admin-console") ? adminConsole(x) : adminLogin(x);
  if (path === "/records") return records(x);
  return memos(x);
}
