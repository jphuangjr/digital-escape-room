import type en from "../en/tour";

const messages: Record<keyof typeof en, string> = {
  "tour.next": "다음",
  "tour.back": "이전",
  "tour.skip": "투어 건너뛰기",
  "tour.done": "이메일 열기",
  "tour.progress": "{n}/{total}",
  "tour.replay": "플레이 방법",
  "tour.welcome.title": "에이다의 노트북에 오신 걸 환영해요",
  "tour.welcome.body": "에이다 보스 박사가 실종됐고, 이건 그녀의 노트북이에요. 방에 있는 모두가 각자의 휴대폰으로 같은 노트북을 보고 있어서, 누구 한 명이 잠금을 풀면 모두에게 열려요. 간단히 둘러볼게요.",
  "tour.room.title": "내 방",
  "tour.room.body": "방을 눌러 누가 있는지, 누가 접속 중인지, 각자 무엇을 보고 있는지 확인해 보세요. 방 코드는 맨 위에 있어요.",
  "tour.invite.title": "팀원 초대하기",
  "tour.invite.body": "초대를 눌러 링크를 공유하거나, 참가자 목록 아래의 QR 코드를 친구에게 스캔하게 하세요. Google로 로그인하거나 이름만 입력해도 참가할 수 있어요.",
  "tour.chat.title": "채팅",
  "tour.chat.body": "여기서 팀원들과 대화하세요. 누군가 메시지를 보내면 방에 빨간 배지가 표시돼요.",
  "tour.hints.title": "힌트와 기록",
  "tour.hints.body": "막혔나요? 에이다에게 힌트를 요청하세요. 힌트는 방 전체에 공개되고 음성 메시지로 도착해요. 사건 기록에서는 방에서 찾아낸 것을, 시도 기록에서는 지금까지 입력한 모든 답을 볼 수 있으니 같은 시도를 반복하지 않아도 돼요.",
  "tour.email.title": "이메일: 여기서 시작하세요",
  "tour.email.body": "에이다의 마지막 메시지와 여동생이 보낸 이메일이 기다리고 있어요. 먼저 읽어 보세요. 에이다가 보내는 힌트 음성 메시지도 여기로 와요.",
  "tour.browser.title": "브라우저",
  "tour.browser.body": "작은 인터넷이 통째로 들어 있어요. meridian-inst.net 같은 주소를 입력해 보세요. 모든 페이지에 소스 보기가 있고, 검은 막대를 누르면 가려진 텍스트가 보이며, 사진에는 파일 정보가 있어요.",
  "tour.notes.title": "메모",
  "tour.notes.body": "찾은 것을 적어 두세요. 메모는 방에 공유를 누르기 전까지 나만 볼 수 있어요. 중요한 단서(이름, 연도, ID)에 태그를 달면 팀원들이 쉽게 찾을 수 있어요.",
  "tour.files.title": "파일",
  "tour.files.body": "에이다의 파일이에요. 일부 폴더는 잠겨 있고, 코드는 이야기 속에 숨어 있어요. 그중 하나를 열면 암호를 풀 때 필요한 도구인 해독기가 잠금 해제돼요.",
  "tour.end.title": "처음부터 시작해",
  "tour.end.body": "이제 다 둘러봤어요. 에이다의 마지막 말은 “처음부터 시작해.”였어요. 행운을 빌어요, 탐정님. 이 투어는 언제든 방에서 다시 볼 수 있어요.",
};

export default messages;
