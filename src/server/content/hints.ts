import "server-only";
import { pick, type Locale, type Tr } from "@/i18n/config";
import type { HintPuzzleId } from "@/lib/types";

export const HINT_PUZZLES: HintPuzzleId[] = [
  "bonus-pin",
  "tools-folder",
  "find-blog",
  "shift-key",
  "find-pets",
  "pet-id",
  "intranet-login",
  "binary-lesson",
  "admin-console",
  "final-phrase",
];

export const HINT_TITLES: Record<HintPuzzleId, Tr> = {
  "find-blog": { en: "Where I wrote it down", ko: "내가 적어 둔 곳" },
  "shift-key": { en: "The dial", ko: "다이얼" },
  "find-pets": { en: "The forum", ko: "포럼" },
  "pet-id": { en: "The cat", ko: "고양이" },
  "intranet-login": { en: "The door", ko: "문" },
  "final-phrase": { en: "Proof of life", ko: "생존 증명" },
  "bonus-pin": { en: "My folder", ko: "내 폴더" },
  "tools-folder": { en: "My tools", ko: "내 도구" },
  "binary-lesson": { en: "Night school", ko: "야간 수업" },
  "admin-console": { en: "Ones and zeros", ko: "0과 1" },
};

/** Ada's voicemails. Tier 1 = nudge, 2 = bigger nudge, 3 = near-answer. */
const HINTS: Record<HintPuzzleId, [Tr, Tr, Tr]> = {
  "find-blog": [
    {
      en: "It's me. If you're on the Institute's site, don't just read it — look underneath it. Every page has a skin and a skeleton. The skeleton never lies as well as the skin does.",
      ko: "나야. 연구소 사이트에 있다면 그냥 읽지만 말고 그 밑을 봐. 모든 페이지엔 피부와 뼈대가 있어. 뼈대는 피부만큼 능숙하게 거짓말하지 못해.",
    },
    {
      en: "Me again. Open the source of the Institute's front page. Somebody on the migration team left a note to themselves about where the old archive went. Follow it.",
      ko: "또 나야. 연구소 첫 페이지의 소스를 열어 봐. 이전(migration) 팀 누군가가 옛 아카이브가 어디로 갔는지 자기한테 남긴 메모가 있어. 그걸 따라가.",
    },
    {
      en: "Okay. Go to meridian-inst.net/vault-2019. There's a photograph there that isn't theirs — it's mine. Open its file info. I left the address of my notebook in the comment.",
      ko: "좋아. meridian-inst.net/vault-2019로 가. 거기 그들 것이 아닌 사진이 하나 있어. 내 거야. 파일 정보를 열어 봐. 코멘트 항목에 내 노트 주소를 남겨 뒀어.",
    },
  ],
  "shift-key": [
    {
      en: "The blog has two series. One is soup. Don't follow the soup. Follow the Field Notes, and read them the way time runs — oldest first.",
      ko: "블로그엔 연재가 두 개 있어. 하나는 수프 얘기야. 수프는 따라가지 마. Field Notes를 따라가. 시간이 흐르는 순서대로, 오래된 것부터 읽어.",
    },
    {
      en: "Read my Field Notes oldest to newest. Look at the first letter of each title. Then look at the dates — just the day of the month. Add them up. The compass has the same number of notches.",
      ko: "내 Field Notes를 오래된 것부터 최신 순으로 읽어. 제목마다 첫 글자를 봐. 그다음 날짜를 봐. 며칠인지만. 그걸 더해. 나침반에도 같은 수만큼 눈금이 있어.",
    },
    {
      en: "The titles spell DRIFT. The days are two, one, one, two, one. That's seven. Seven notches on the compass, seven turns of the dial. Ignore the kitchen — eleven is a trap.",
      ko: "제목 첫 글자는 DRIFT. 날짜는 2, 1, 1, 2, 1. 합치면 7이야. 나침반 눈금 일곱 개, 다이얼도 일곱 칸. 부엌 얘기는 무시해. 11은 함정이야.",
    },
  ],
  "find-pets": [
    {
      en: "Wren still beats everyone on that arcade game. Her friends hang out on a forum about it. I hung out there too, under a name you'd recognise if you've seen the compass.",
      ko: "렌은 아직도 그 오락실 게임에서 다 이겨. 렌 친구들이 그 게임 포럼에 모여 있어. 나도 거기 있었어. 나침반을 봤다면 알아볼 이름으로.",
    },
    {
      en: "On RunnerBoard there are two of us with almost the same name. One is me. One is them. Mine came first. Whoever I am, I only talk in my own posts — and I talk with the clock.",
      ko: "RunnerBoard엔 이름이 거의 똑같은 계정이 둘 있어. 하나는 나, 하나는 그들. 내 게 먼저 생겼어. 난 내 글로만 말하고, 시계로 말해.",
    },
    {
      en: "Take compass_needle's post times — hours and minutes — and turn each number into a letter: one is A, twenty-six is Z. Twelve fifteen is L-O. Keep going. It spells a website. The other account spells a trap.",
      ko: "compass_needle 글의 작성 시각, 시와 분을 각각 글자로 바꿔. 1은 A, 26은 Z. 12:15는 L-O. 계속 해 봐. LOSTPAWS, 웹사이트 이름이 나와: lostpaws.net. 다른 계정은 함정 이름이 나와.",
    },
  ],
  "pet-id": [
    {
      en: "I asked about a cat on the forum. She's real, she's a friend's, and the board where she's listed knows her better than I do.",
      ko: "포럼에서 고양이 얘기를 물어봤었지. 진짜 있는 고양이야, 친구네 애. 그 애가 올라가 있는 게시판이 나보다 그 애를 더 잘 알아.",
    },
    {
      en: "Find Biscuit on Lost Paws. Every chipped animal has a registry number. Write hers down — it's one of the three things you'll need at the end.",
      ko: "Lost Paws에서 Biscuit을 찾아. 칩을 심은 동물은 다 등록번호가 있어. 그 애 번호를 적어 둬. 마지막에 필요한 세 가지 중 하나야.",
    },
    {
      en: "Biscuit the tabby. Her registry ID is the number on her listing. Four digits, starts with a zero. That's your third fragment.",
      ko: "줄무늬 고양이 Biscuit. 등록번호(registry ID)는 공고에 적힌 숫자야. 0412, 0으로 시작하는 네 자리. 그게 세 번째 조각이야.",
    },
  ],
  "intranet-login": [
    {
      en: "There's a staff portal. Wren let me use her account. The decoded listings tell you whose key it is and what the code is made of.",
      ko: "직원 포털이 있어. 렌이 자기 계정을 쓰게 해 줬어. 해독한 공고들이 누구 열쇠인지, 코드가 뭘로 이뤄졌는지 알려 줄 거야.",
    },
    {
      en: "Username is the standard staff format: first name, dot, last name, lowercase. The code is two numbers stuck together — the year they lied about, then the cat's number.",
      ko: "사용자명은 표준 직원 형식이야. 이름, 점, 성, 전부 소문자. 코드는 숫자 두 개를 붙인 거야. 그들이 거짓말한 연도, 그다음 고양이 번호.",
    },
    {
      en: "Wren Okafor. The Institute says 1987 — that's the true year, the footer was the lie, they swapped the digits. Then add Biscuit's four digits. wren.okafor, then founding-year-then-ID, no spaces.",
      ko: "렌 오카포(Wren Okafor). 연구소는 1987이라고 해. 그게 진짜 연도고, 거짓말은 푸터였어. 숫자 순서를 바꿔 놨지. 거기에 Biscuit의 네 자리를 붙여. 사용자명 wren.okafor, 코드는 설립 연도 다음 등록번호, 띄어쓰기 없이: 19870412.",
    },
  ],
  "final-phrase": [
    {
      en: "The switch wants proof I'm alive. Only someone who walked my whole road could know it. Three pieces. You already have all of them.",
      ko: "스위치는 내가 살아 있다는 증거를 원해. 내 길을 끝까지 걸어온 사람만 알 수 있는 거. 세 조각. 넌 이미 다 갖고 있어.",
    },
    {
      en: "Name, year, number. The name who has the key. The year they lied. The number on the collar. Joined by dashes.",
      ko: "이름, 연도, 숫자. 열쇠를 가진 사람의 이름. 그들이 거짓말한 연도. 목걸이의 번호. 대시로 이어서.",
    },
    {
      en: "Her first name, the true founding year, Biscuit's ID — lowercase, dashes between. Name-year-number. That's me, still breathing.",
      ko: "렌의 영어 이름(first name), 진짜 설립 연도, Biscuit의 등록번호. 소문자로, 사이에 대시. 이름-연도-번호: wren-1987-0412. 그게 아직 숨 쉬고 있는 나야.",
    },
  ],
  "binary-lesson": [
    {
      en: "Wren teaches a night class at the community college. I took it. My syllabus is still in my tools folder.",
      ko: "렌은 커뮤니티 칼리지에서 야간 수업을 해. 나도 들었어. 내 강의계획서가 아직 내 도구 폴더에 있어.",
    },
    {
      en: "The syllabus points to the class website. Week three is the one about binary. Read the lesson, then take the practice quiz.",
      ko: "강의계획서가 수업 웹사이트를 가리켜. 3주차가 이진법 수업이야. 강의를 읽고 연습 퀴즈를 풀어.",
    },
    {
      en: "Go to harbourcc.edu/cs110/binary. Use the decoding sheet on the quiz word. It's the first word every programmer types: hello. Pass it and Wren's translator installs into my decoder.",
      ko: "harbourcc.edu/cs110/binary로 가. 퀴즈 단어에 해독표를 써 봐. 프로그래머라면 누구나 처음 치는 단어, hello야. 통과하면 렌의 번역기가 내 디코더에 설치돼.",
    },
  ],
  "admin-console": [
    {
      en: "The memo you need is locked in the admin console. Wren pinned the new password on the dashboard. She writes things down the way she teaches them.",
      ko: "필요한 메모는 관리자 콘솔에 잠겨 있어. 렌이 새 비밀번호를 대시보드에 고정해 뒀어. 렌은 가르치는 방식 그대로 적어 두거든.",
    },
    {
      en: "Those ones and zeros come in fives. Each group of five is one letter: add up the place values with a one in them, sixteen, eight, four, two, one, and A is one. Or let the decoder do it once you've passed her quiz.",
      ko: "그 0과 1은 다섯 개씩 묶여 있어. 다섯 개 한 묶음이 글자 하나야. 1이 있는 자리값, 16, 8, 4, 2, 1을 더해. A가 1이야. 아니면 렌의 퀴즈를 통과한 뒤 디코더한테 맡겨.",
    },
    {
      en: "01100 is eight plus four: twelve, L. 00001 is A. Keep going and it spells LANTERN, like the watchman's lamps. Type it into the admin console.",
      ko: "01100은 8 더하기 4, 12, 그러니까 L. 00001은 A. 계속하면 LANTERN이 나와. 경비원의 등불(lantern)처럼. 관리자 콘솔에 입력해.",
    },
  ],
  "bonus-pin": [
    {
      en: "My personal folder is locked with something only family would think of. My sister talks about me more than I'd like.",
      ko: "내 개인 폴더는 가족만 떠올릴 만한 걸로 잠가 놨어. 내 동생은 내 얘기를 내가 바라는 것보다 많이 해.",
    },
    {
      en: "Read my sister's email again. She mentions a date that's mine and no one else's.",
      ko: "동생 이메일을 다시 읽어 봐. 다른 누구도 아닌 내 날짜를 하나 말하고 있어.",
    },
    {
      en: "My birthday. March fourteenth. Month then day, four digits, with the zero in front.",
      ko: "내 생일. 3월 14일. 월 다음 일, 앞에 0을 붙여서 네 자리: 0314.",
    },
  ],
  "tools-folder": [
    {
      en: "You'll want my decoder before you go much further. I locked it behind a question only family could answer. The answer is in my personal folder.",
      ko: "더 가기 전에 내 디코더가 필요할 거야. 가족만 답할 수 있는 질문 뒤에 잠가 뒀어. 답은 내 개인 폴더에 있어.",
    },
    {
      en: "Open my personal folder and read what I wrote about my sister. Dad had a nickname for each of us.",
      ko: "내 개인 폴더를 열고 내가 동생에 대해 쓴 걸 읽어 봐. 아빠는 우리한테 별명을 하나씩 붙여 줬어.",
    },
    {
      en: "Dad called me his compass and my sister his weather. The answer is her name: Mara.",
      ko: "아빠는 나를 자기 나침반, 동생을 자기 날씨라고 불렀어. 답은 동생 이름이야: 마라(Mara).",
    },
  ],
};

export function getHint(puzzleId: HintPuzzleId, tier: 1 | 2 | 3, loc: Locale): string {
  const set = HINTS[puzzleId];
  if (!set) return "";
  const t = Math.min(3, Math.max(1, Math.trunc(tier))) as 1 | 2 | 3;
  return pick(loc)(set[t - 1]);
}
