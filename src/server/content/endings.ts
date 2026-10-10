import "server-only";
import { pick, type Locale, type Tr } from "@/i18n/config";
import type { Ending } from "@/lib/types";

/** Paragraph lists per locale (joined at resolve time). */
type Paras = Record<Locale, string[]>;

const ENDINGS: Record<Ending, { title: Tr; body: Paras }> = {
  EXPOSE: {
    title: { en: "The Needle Points True", ko: "바늘은 진실을 가리킨다" },
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
    },
  },
  PROTECT: {
    title: { en: "A Record Kept Sealed", ko: "봉인된 채 남은 기록" },
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
    },
  },
];

export function bonusFiles(loc: Locale): { name: string; body: string }[] {
  return FILES.map((f) => ({ name: f.name, body: (f.body[loc] ?? f.body.en).join("\n") }));
}
