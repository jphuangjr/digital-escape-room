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
};

export default messages;
