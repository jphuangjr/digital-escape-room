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
      subject: x({ en: "(no subject)", ko: "(제목 없음)" }),
      date: x({ en: "2 days ago, 23:57", ko: "2일 전 23:57" }),
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
      }),
    },
    {
      id: "email-sister-engagement",
      from: SISTER,
      subject: x({
        en: "The job — and some news I didn't want to share like this",
        ko: "의뢰 건, 그리고 이런 식으로 전하고 싶지 않았던 소식",
      }),
      date: x({ en: "Yesterday, 08:14", ko: "어제 08:14" }),
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
      }),
    },
    {
      id: "email-institute-pr",
      from: "Office of the Director, Meridian Institute <press@meridian-inst.net>",
      subject: x({ en: "Statement regarding Dr. A. Voss", ko: "A. 보스 박사 관련 입장문" }),
      date: x({ en: "Yesterday, 16:02", ko: "어제 16:02" }),
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
    subject: { en: "Voicemail — 0:31", ko: "음성 메시지 — 0:31" },
    body: {
      en: "[static] ...you found the notebook. Good. I wrote it in order so someone could follow me. Don't let the recipes distract you — those were for Mara. [click]",
      ko: "[잡음] ...노트를 찾았구나. 잘했어. 누군가 날 따라올 수 있게 순서대로 적어 뒀어. 레시피에 한눈팔지 마. 그건 마라 주려고 쓴 거야. [딸깍]",
    },
  },
  {
    id: "vm-ambient-trapdoor",
    when: (p) => p.visitedSites.some((s) => s.startsWith("trapdoor.net")),
    subject: { en: "Voicemail — 0:18", ko: "음성 메시지 — 0:18" },
    body: {
      en: "[wind] They built that door for people like you. Don't take it personally. Go back to the forum. My needle points true; theirs only points back at them. [click]",
      ko: "[바람 소리] 그 문은 너 같은 사람 잡으려고 만든 거야. 기분 나빠하지 마. 포럼으로 돌아가. 내 바늘은 진실을 가리켜. 그들 바늘은 자기들만 가리키고. [딸깍]",
    },
  },
  {
    id: "vm-ambient-decoded",
    when: (p) => p.solved.includes("shift-key"),
    subject: { en: "Voicemail — 0:44", ko: "음성 메시지 — 0:44" },
    body: {
      en: "[keyboard clatter] Seven notches. You turned the dial. Wren has the key — she gave it to me when she realised they'd erased her face. The vault code is the year they lied. Look at the bottom of their pages, where nobody reads. [click]",
      ko: "[키보드 소리] 눈금 일곱 개. 다이얼을 돌렸구나. 열쇠는 렌(Wren)이 갖고 있어. 그들이 자기 얼굴을 지웠다는 걸 알았을 때 나한테 넘겨줬지. 볼트 코드는 그들이 거짓말한 연도야. 아무도 안 읽는 곳, 그들 페이지 맨 아래를 봐. [딸깍]",
    },
  },
  {
    id: "vm-ambient-inside",
    when: (p) => p.solved.includes("intranet-login"),
    subject: { en: "Voicemail — 1:02", ko: "음성 메시지 — 1:02" },
    body: {
      en: "[server hum] You're inside. I'm sorry about what you're seeing in that log. Founding years, warehouse fires, my father's name. It's all real, and it's all been sanded off. The memo about me is in the admin console. Wren left the password on the dashboard, in ones and zeros. She taught me to read them. [click]",
      ko: "[서버 웅웅거리는 소리] 들어왔구나. 그 로그에서 보고 있는 것들, 미안해. 설립 연도, 창고 화재, 우리 아버지 이름. 전부 진짜고, 전부 깎여 나갔어. 나에 관한 메모는 관리자 콘솔에 있어. 렌이 대시보드에 비밀번호를 남겨 뒀어. 0과 1로. 그걸 읽는 법은 렌이 나한테 가르쳐 줬어. [딸깍]",
    },
  },
  {
    id: "vm-ambient-admin",
    when: (p) => p.solved.includes("admin-console"),
    subject: { en: "Voicemail — 0:31", ko: "음성 메시지 — 0:31" },
    body: {
      en: "[a laugh, barely] Five bits a letter. Wren would give you a gold star. Lamps in the Trust office, the night of the fire. She never forgot that line either. There's a memo in there with my name on it. Tap through the black bars. [click]",
      ko: "[아주 작게 웃는 소리] 글자 하나에 5비트. 렌이었으면 너한테 금별 스티커 붙여 줬을 거야. 화재 당일 밤, 트러스트 사무실의 등불. 렌도 그 구절은 절대 못 잊었어. 거기 내 이름이 적힌 메모가 있어. 검은 줄을 눌러서 열어 봐. [딸깍]",
    },
  },
  {
    id: "vm-ambient-alive",
    when: (p) => p.solved.includes("final-phrase"),
    subject: { en: "Voicemail — 0:52", ko: "음성 메시지 — 0:52" },
    body: {
      en: "[a breath, close to the phone] Hi. It's really me. Not a recording this time. Thank you. Now — you and the people with you get to decide what happens next. I'll live with it either way. [click]",
      ko: "[수화기 가까이서 숨소리] 안녕. 정말 나야. 이번엔 녹음 아니야. 고마워. 이제 너랑 같이 있는 사람들이 다음에 무슨 일이 일어날지 정해. 어느 쪽이든 받아들일게. [딸깍]",
    },
  },
];

export function voicemailsFor(progress: RoomProgress, hints: HintDTO[], loc: Locale): EmailDTO[] {
  const x = pick(loc);
  const unknown = x({ en: "Unknown number", ko: "알 수 없는 번호" });
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
      subject: x({ en: `Voicemail: ${title} (${h.tier}/3)`, ko: `음성 메시지: ${title} (${h.tier}/3)` }),
      date: formatWhen(h.unlockedAt, unknown),
      body: x({ en: `[recording] ${h.text} [click]`, ko: `[녹음] ${h.text} [딸깍]` }),
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
