import type en from "../en/shell";

const messages: Record<keyof typeof en, string> = {
  "shell.app.browser": "ブラウザ",
  "shell.app.notes": "メモ",
  "shell.app.email": "メール",
  "shell.app.files": "ファイル",
  "shell.app.decoder": "デコーダー",
  "shell.dock.label": "ドック",
  "shell.dock.appAria": "{app}{locked, select, true {（ロック中）} other {}}{unread, plural, =0 {} other {、未読 # 件}}",
  "shell.dock.room": "ルーム",
  "shell.dock.roomAria": "ルーム：{online} 人がオンライン{unread, plural, =0 {} other {、未読メッセージ # 件}}",
  "shell.desktop.label": "デスクトップ",
  "shell.window.close": "ウィンドウを閉じる",
  "shell.lock.jammed": "動かなくなりました。{time} 後にもう一度どうぞ",
  "shell.lock.left": "あと{n}回間違えると動かなくなります",
  "shell.lock.opened": "開きました",
  "shell.lock.locked": "施錠中",
  "shell.home.title": "ホーム",
  "shell.status.homeAria": "ホーム画面",
  "shell.status.laptop": "エイダのノートPC",
  "shell.status.phase": "{status, select, voting {投票中} finished {事件解決} other {捜査中}}",
  "shell.status.roomAria": "ルームの詳細、{online} 人がオンライン",
  "shell.status.soundOff": "ノートPCの音を消す",
  "shell.status.soundOn": "ノートPCの音を出す",
  "shell.status.unreadAria": "{count, plural, other {未読メッセージ # 件}}",
  "shell.toast.decoderLocked": "デコーダーはロックされています。サイトをもっと調べてみてください。",
  "shell.toast.decoderUnlocked": "デコーダーのロックが解除されました！ドックから開けます。",
  "shell.toast.open": "開く",
  "shell.toast.reply": "返信",
  "shell.toast.newEmail": "{kind, select, voicemail {新しい留守電メッセージ：{subject}} other {新着メール：{subject}}}",
};

export default messages;
