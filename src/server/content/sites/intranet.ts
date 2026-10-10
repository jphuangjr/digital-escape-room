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
  }),
});

function login(x: X, gatedFrom?: string): SitePage {
  const blocks: Block[] = [
    { type: "compass" },
    { type: "heading", level: 1, text: x({ en: "The Vault", ko: "볼트(The Vault)" }) },
    { type: "paragraph", text: x({ en: "Meridian Staff Access", ko: "메리디언 직원 전용 접속" }) },
    ...(gatedFrom
      ? [{ type: "notice", tone: "warning", text: x({ en: "Session required. Please sign in to continue.", ko: "세션이 필요합니다. 계속하려면 로그인하십시오." }) } as Block]
      : []),
    {
      type: "paragraph",
      text: x({
        en: "Authorised personnel only. Accounts follow the standard staff format.",
        ko: "인가된 인원만 접근할 수 있습니다. 계정은 표준 직원 형식을 따릅니다.",
      }),
    },
    { type: "form", form: "intranet-login", prompt: x({ en: "Enter your staff username and vault code.", ko: "직원 사용자명과 볼트 코드를 입력하십시오." }) },
    {
      type: "notice",
      tone: "info",
      text: x({
        en: "Forgotten your vault code? Legacy accounts were issued codes at onboarding. Contact Systems (W. Okafor) — extension unavailable.",
        ko: "볼트 코드를 잊으셨습니까? 구형 계정의 코드는 입사 시 발급되었습니다. 시스템 담당(W. Okafor)에게 문의하십시오. 내선 연결 불가.",
      }),
    },
    footer(x),
  ];
  return page(INTRANET_HOST, x({ en: "The Vault — Meridian Staff Access", ko: "볼트(The Vault) — 메리디언 직원 전용 접속" }), "intranet", blocks, {
    headComments: [x({ en: "MeridianAuth 1.3 — legacy mode", ko: "MeridianAuth 1.3 — 레거시 모드" })],
    bodyComments: [
      x({ en: "usernames: firstname.lastname (lowercase)", ko: "사용자명: firstname.lastname (소문자)" }),
      x({
        en: "legacy vault codes per IT-2019-07: the TRUE founding year, followed by the 4-digit registry ID the user chose. yes, really. — W.O.",
        ko: "IT-2019-07에 따른 레거시 볼트 코드: 진짜(TRUE) 설립 연도 뒤에 사용자가 고른 4자리 등록번호(registry ID)를 붙인 것. 네, 진짜로요. — W.O.",
      }),
    ],
  });
}

const nav = (x: X): Block => ({
  type: "nav",
  links: [
    { text: x({ en: "Dashboard", ko: "대시보드" }), href: INTRANET_HOST },
    { text: x({ en: "Record Changes", ko: "기록 변경" }), href: `${INTRANET_HOST}/records` },
    { text: x({ en: "Memos", ko: "메모" }), href: `${INTRANET_HOST}/memos` },
    { text: x({ en: "Admin", ko: "관리자" }), href: `${INTRANET_HOST}/admin` },
  ],
});

const diffs = (x: X): Block[] => [
  {
    type: "diff",
    label: x({ en: "Charter of Incorporation — founding year", ko: "설립 인가장 — 설립 연도" }),
    before: x({ en: "Chartered 14 June 1978 by the Harbour Trust.", ko: "1978년 6월 14일 하버 트러스트에 의해 인가." }),
    after: x({ en: "Chartered 1987 by civic ordinance.", ko: "1987년 시 조례에 의해 인가." }),
  },
  {
    type: "diff",
    label: x({ en: "Harbour Ledger vol. III, fol. 12 — entry for the night of the warehouse fire", ko: "하버 원장 제3권 12장 — 창고 화재 당일 밤 기록" }),
    before: x({
      en: "Fire reported 02:10. Watchman's statement: lamps seen in the Trust office before the blaze.",
      ko: "02:10 화재 신고. 야간 경비원 진술: 불이 나기 전 트러스트 사무실에서 등불이 목격됨.",
    }),
    after: x({ en: "Fire reported 02:10. Cause: electrical.", ko: "02:10 화재 신고. 원인: 전기 계통." }),
  },
  {
    type: "diff",
    label: x({ en: "Staff register — Systems Archivist", ko: "직원 명부 — 시스템 기록관" }),
    before: x({
      en: "Wren Okafor — Systems Archivist. Photograph on file. Witness, Continuity Inquiry 2019.",
      ko: "렌 오카포(Wren Okafor) — 시스템 기록관. 사진 보관됨. 2019년 연속성 조사 증인.",
    }),
    after: x({ en: "Wren Okafor — Systems Archivist.", ko: "렌 오카포(Wren Okafor) — 시스템 기록관." }),
  },
  {
    type: "diff",
    label: x({ en: "Founders' correspondence — signatories", ko: "설립자 서신 — 서명인" }),
    before: x({ en: "Signed: H. Calloway, T. Kell (sr.), E. Voss.", ko: "서명: H. 캘러웨이, T. 켈(부), E. 보스." }),
    after: x({ en: "Signed: [withdrawn].", ko: "서명: [철회됨]." }),
  },
  {
    type: "diff",
    label: x({ en: "Staff register — Senior Archivist", ko: "직원 명부 — 선임 기록관" }),
    before: x({ en: "Dr. Ada Voss — Senior Archivist. Status: active.", ko: "에이다 보스 박사 — 선임 기록관. 상태: 재직." }),
    after: x({ en: "Dr. Ada Voss — Senior Archivist. Status: on leave (indefinite).", ko: "에이다 보스 박사 — 선임 기록관. 상태: 휴직(무기한)." }),
  },
];

const memo = (x: X): Block => ({
  type: "memo",
  heading: x({ en: "MEMO — Office of Continuity — RE: Dr. A. Voss", ko: "메모 — 연속성 관리실 — 건명: A. 보스 박사" }),
  parts: [
    {
      text: x({
        en: "To: Deputy Director T. Kell. From: Security (L. Ash). Voss has not been located. Her badge was last used at the server room at 23:58. We believe she has left something running on an external host. Our analysts traced outbound traffic to ",
        ko: "수신: 켈 부국장(Deputy Director T. Kell). 발신: 보안팀(애시). 보스의 소재는 아직 파악되지 않았습니다. 그녀의 출입증이 마지막으로 사용된 곳은 23:58 서버실입니다. 그녀가 외부 호스트에 무언가를 실행해 둔 것으로 판단됩니다. 분석팀이 외부 트래픽을 추적한 결과 목적지는 ",
      }),
    },
    { redacted: "switch.ada-voss.net" },
    {
      text: x({
        en: ". It appears to be a dead man's switch: if the timer runs out, the unaltered records go to every newsroom in the city. Recommend we locate her before it fires. Recommend we do not involve the police. Recommend we do not involve ",
        ko: "입니다. 데드맨 스위치로 보입니다. 타이머가 끝나면 수정되지 않은 원본 기록이 시내 모든 언론사로 전송됩니다. 작동 전에 그녀를 찾을 것을 권고합니다. 경찰을 개입시키지 않을 것을 권고합니다. 다음 인물도 개입시키지 않을 것을 권고합니다: ",
      }),
    },
    { redacted: x({ en: "her sister", ko: "그녀의 여동생" }) },
    { text: "." },
  ],
});

const systemsNotice = (x: X): Block => ({
  type: "notice",
  tone: "info",
  text: x({
    en: `SYSTEMS NOTICE (W. Okafor)\nAdmin console password rotated after Tuesday's badge incident. Flagged memos have moved there.\nNew password, written the way I teach it:\n${toBinary5(ADMIN_PASSWORD)}\nIf you skipped my class, that's on you.`,
    ko: `시스템 공지 (W. Okafor)\n화요일 출입증 사건 이후 관리자 콘솔 비밀번호를 교체했습니다. 플래그된 메모는 그쪽으로 옮겼습니다.\n새 비밀번호는 제 수업에서 가르치는 방식으로 적어 둡니다:\n${toBinary5(ADMIN_PASSWORD)}\n제 수업을 빼먹으셨다면, 그건 본인 책임입니다.`,
  }),
});

function adminLogin(x: X): SitePage {
  const blocks: Block[] = [
    nav(x),
    { type: "heading", level: 1, text: x({ en: "Systems Admin Console", ko: "시스템 관리자 콘솔" }) },
    {
      type: "notice",
      tone: "warning",
      text: x({
        en: "Restricted. Flagged memos and badge logs. Admin password required, even for signed-in staff.",
        ko: "접근 제한. 플래그된 메모와 출입 기록 보관. 로그인한 직원이라도 관리자 비밀번호가 필요합니다.",
      }),
    },
    { type: "form", form: "admin-login", prompt: x({ en: "Admin password", ko: "관리자 비밀번호" }) },
    {
      type: "paragraph",
      text: x({
        en: "Password rotated by Systems. See the pinned notice on the dashboard.",
        ko: "시스템 담당이 비밀번호를 교체했습니다. 대시보드에 고정된 공지를 확인하십시오.",
      }),
    },
    footer(x),
  ];
  return page(`${INTRANET_HOST}/admin`, x({ en: "Systems Admin Console", ko: "시스템 관리자 콘솔" }), "intranet", blocks, {
    headComments: [x({ en: "MeridianAuth 1.3 — elevated", ko: "MeridianAuth 1.3 — 권한 상승" })],
    bodyComments: [x({ en: "letters only. no spaces. case doesn't matter. — W.O.", ko: "영문자만. 띄어쓰기 없이. 대소문자는 상관없음. — W.O." })],
  });
}

function adminConsole(x: X): SitePage {
  const blocks: Block[] = [
    nav(x),
    { type: "heading", level: 1, text: x({ en: "Systems Admin Console", ko: "시스템 관리자 콘솔" }) },
    { type: "notice", tone: "success", text: x({ en: "Elevated session active.", ko: "권한 상승 세션이 활성화되었습니다." }) },
    { type: "heading", level: 2, text: x({ en: "Badge log, Server Room B", ko: "출입 기록, 서버실 B" }) },
    {
      type: "list",
      items: [
        x({ en: "23:41 W. OKAFOR: badge in", ko: "23:41 W. OKAFOR: 출입증 입실" }),
        x({ en: "23:52 W. OKAFOR: Vault sign-in (terminal 3)", ko: "23:52 W. OKAFOR: 볼트 로그인 (단말 3)" }),
        x({
          en: "23:58 A. VOSS: badge in (badge reported deactivated 3 days earlier)",
          ko: "23:58 A. VOSS: 출입증 입실 (해당 출입증은 3일 전 비활성화로 보고됨)",
        }),
        x({ en: "00:06 outbound transfer, 2.4 GB, to an external host", ko: "00:06 외부 호스트로 2.4 GB 송신" }),
        x({ en: "00:09 A. VOSS: no badge out recorded", ko: "00:09 A. VOSS: 퇴실 기록 없음" }),
      ],
    },
    { type: "heading", level: 2, text: x({ en: "Flagged memo", ko: "플래그된 메모" }) },
    memo(x),
    footer(x),
  ];
  return page(`${INTRANET_HOST}/admin`, x({ en: "Systems Admin Console", ko: "시스템 관리자 콘솔" }), "intranet", blocks, {
    headComments: [x({ en: "MeridianAuth 1.3 — elevated session ok", ko: "MeridianAuth 1.3 — 권한 상승 세션 정상" })],
    tailComments: [x({ en: "if you're reading this, Ada: I left the door open. — W.", ko: "에이다, 이걸 읽고 있다면: 문은 열어 뒀어. — W." })],
  });
}

function dashboard(x: X): SitePage {
  const notice = systemsNotice(x);
  const blocks: Block[] = [
    nav(x),
    { type: "compass" },
    { type: "heading", level: 1, text: x({ en: "Welcome back, wren.okafor", ko: "다시 오신 것을 환영합니다, wren.okafor" }) },
    {
      type: "notice",
      tone: "warning",
      text: x({
        en: "Last sign-in for this account: 2 days ago, 23:52, from Server Room B. Was this you?",
        ko: "이 계정의 마지막 로그인: 2일 전 23:52, 서버실 B. 본인이 맞습니까?",
      }),
    },
    {
      type: "paragraph",
      text: x({
        en: "Continuity queue: 0 items pending. 4,112 items reconciled this year.",
        ko: "연속성 대기열: 처리 대기 0건. 올해 정합 처리 4,112건.",
      }),
    },
    { type: "heading", level: 2, text: x({ en: "Recent record changes", ko: "최근 기록 변경" }) },
    ...diffs(x).slice(0, 3),
    { type: "link", text: x({ en: "All record changes →", ko: "전체 기록 변경 →" }), href: `${INTRANET_HOST}/records` },
    { type: "heading", level: 2, text: x({ en: "Pinned by Systems", ko: "시스템 담당 고정 공지" }) },
    notice,
    { type: "link", text: x({ en: "Systems Admin console →", ko: "시스템 관리자 콘솔 →" }), href: `${INTRANET_HOST}/admin` },
    footer(x),
  ];
  return page(INTRANET_HOST, x({ en: "The Vault — Dashboard", ko: "볼트(The Vault) — 대시보드" }), "intranet", blocks, {
    headComments: [x({ en: "MeridianAuth 1.3 — session ok", ko: "MeridianAuth 1.3 — 세션 정상" })],
    bodyComments: [x({ en: "she used my account. I let her. — W.", ko: "그녀가 내 계정을 썼다. 내가 그러라고 했다. — W." })],
    inlineComments: {
      [blocks.indexOf(notice)]: [
        x({
          en: "five bits a letter, A is 00001. same as Tuesday nights. lesson notes: harbourcc.edu/cs110 — W.O.",
          ko: "글자 하나에 5비트, A는 00001. 화요일 밤 수업이랑 똑같아요. 강의 노트: harbourcc.edu/cs110 — W.O.",
        }),
      ],
    },
  });
}

function records(x: X): SitePage {
  const blocks: Block[] = [
    nav(x),
    { type: "heading", level: 1, text: x({ en: "Record Changes — Continuity Log", ko: "기록 변경 — 연속성 로그" }) },
    {
      type: "paragraph",
      text: x({
        en: "Every reconciliation is logged here before the original is retired. Logs are purged quarterly.",
        ko: "모든 정합 처리는 원본 폐기 전 이곳에 기록됩니다. 로그는 분기마다 삭제됩니다.",
      }),
    },
    ...diffs(x),
    { type: "notice", tone: "danger", text: x({ en: "Purge scheduled. This log will be cleared in 3 days.", ko: "삭제 예정. 이 로그는 3일 후 삭제됩니다." }) },
    footer(x),
  ];
  return page(`${INTRANET_HOST}/records`, x({ en: "Record Changes", ko: "기록 변경" }), "intranet", blocks, {
    tailComments: [
      x({
        en: "export of this log was requested by A.VOSS 2 days ago. request completed (??)",
        ko: "이 로그의 내보내기를 2일 전 A.VOSS가 요청함. 요청 처리 완료 (??)",
      }),
    ],
  });
}

function memos(x: X): SitePage {
  const blocks: Block[] = [
    nav(x),
    { type: "heading", level: 1, text: x({ en: "Memos", ko: "메모" }) },
    {
      type: "notice",
      tone: "warning",
      text: x({
        en: "1 flagged memo (RE: Dr. A. Voss) has been moved to the Systems Admin console.",
        ko: "플래그된 메모 1건(건명: A. 보스 박사)이 시스템 관리자 콘솔로 이동되었습니다.",
      }),
    },
    { type: "link", text: x({ en: "Systems Admin console →", ko: "시스템 관리자 콘솔 →" }), href: `${INTRANET_HOST}/admin` },
    {
      type: "memo",
      heading: x({ en: "MEMO — Director's Office — RE: public messaging", ko: "메모 — 소장실 — 건명: 대외 발표" }),
      parts: [
        {
          text: x({
            en: "If asked, Dr. Voss is on extended leave for personal reasons. Do not use the word 'missing'. Do not confirm or deny the existence of the Continuity Office.",
            ko: "문의가 있을 경우, 보스 박사는 개인 사유로 장기 휴직 중이라고 답할 것. '실종'이라는 단어는 쓰지 말 것. 연속성 관리실의 존재는 확인도 부인도 하지 말 것.",
          }),
        },
      ],
    },
    footer(x),
  ];
  return page(`${INTRANET_HOST}/memos`, x({ en: "Memos", ko: "메모" }), "intranet", blocks);
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
