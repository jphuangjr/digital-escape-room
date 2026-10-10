import type en from "../en/shell";

const messages: Record<keyof typeof en, string> = {
  "shell.app.browser": "브라우저",
  "shell.app.notes": "메모",
  "shell.app.email": "이메일",
  "shell.app.files": "파일",
  "shell.app.decoder": "해독기",
  "shell.dock.label": "독",
  "shell.dock.appAria": "{app}{locked, select, true { (잠김)} other {}}{unread, plural, =0 {} other {, 읽지 않음 #개}}",
  "shell.dock.room": "방",
  "shell.dock.roomAria": "방: {online}명 접속 중{unread, plural, =0 {} other {, 읽지 않은 메시지 #개}}",
  "shell.desktop.label": "바탕화면",
  "shell.window.close": "창 닫기",
  "shell.home.title": "홈",
  "shell.status.homeAria": "홈 화면",
  "shell.status.laptop": "에이다의 노트북",
  "shell.status.phase": "{status, select, voting {투표 진행 중} finished {사건 종결} other {수사 진행 중}}",
  "shell.status.roomAria": "방 정보, {online}명 접속 중",
  "shell.status.unreadAria": "{count, plural, other {읽지 않은 메시지 #개}}",
  "shell.toast.decoderLocked": "해독기는 아직 잠겨 있어요. 사이트를 더 파헤쳐 보세요.",
  "shell.toast.decoderUnlocked": "해독기가 열렸어요! 앱 목록에서 찾아보세요.",
  "shell.toast.open": "열기",
  "shell.toast.reply": "답장",
  "shell.toast.newEmail": "{kind, select, voicemail {새 음성 메시지: {subject}} other {새 이메일: {subject}}}",
};

export default messages;
