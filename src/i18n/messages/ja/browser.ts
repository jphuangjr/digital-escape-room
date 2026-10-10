import type en from "../en/browser";

const messages: Record<keyof typeof en, string> = {
  // Browser chrome
  "browser.toolbar.back": "戻る",
  "browser.toolbar.forward": "進む",
  "browser.toolbar.address": "アドレス",
  "browser.toolbar.addressPlaceholder": "アドレスを入力",
  "browser.toolbar.reload": "再読み込み",
  "browser.toolbar.menu": "ブックマークとツール",
  "browser.toolbar.loading": "読み込み中…",
  "browser.toolbar.bookmark": "ブックマーク",
  "browser.toolbar.bookmarked": "ブックマークしました",
  "browser.toolbar.bookmarkRemoved": "ブックマークを削除しました",
  "browser.toolbar.viewSource": "ソースを表示",
  "browser.menu.bookmarks": "ブックマーク",
  "browser.menu.removeBookmark": "ブックマーク「{title}」を削除",
  "browser.menu.empty": "まだブックマークはありません。",
  "browser.menu.bookmarkThisPage": "このページをブックマーク",
  "browser.loading.connecting": "{address} に接続中…",
  "browser.error.title": "このサイトにアクセスできません",
  "browser.error.unreachable": "<addr>{address}</addr> のサーバーIPアドレスが見つかりませんでした。",
  "browser.error.timeout": "<addr>{address}</addr> からの応答に時間がかかりすぎています。",
  "browser.newTab.title": "新しいタブ",

  // View Source
  "browser.source.dialog": "ページのソース",

  // Site renderer chrome
  "browser.fileInfo.button": "ⓘ ファイル情報",
  "browser.fileInfo.title": "ファイル情報",
  "browser.fileInfo.close": "ファイル情報を閉じる",
  "browser.fileInfo.filename": "ファイル名",
  "browser.fileInfo.author": "作成者",
  "browser.fileInfo.camera": "カメラ",
  "browser.fileInfo.date": "日付",
  "browser.fileInfo.dimensions": "サイズ",
  "browser.fileInfo.comment": "コメント",
  "browser.redacted.hidden": "黒塗りのテキストです。タップして表示します。",
  "browser.redacted.revealed": "表示された内容：{text}",

  // In-site forms: game-system feedback only (site labels stay English)
  "browser.form.cooling": "試行回数が多すぎます。しばらくお待ちください。",
  "browser.form.connectionError": "接続エラーです。もう一度お試しください。",
  "browser.form.accepted": "承認されました。",
  "browser.form.correct": "正解です！",
  "browser.form.rejected": "却下されました。違います。",
  "browser.form.retryIn": "{s}秒後に再試行できます。",
  "browser.form.decreaseShift": "シフトを減らす",
  "browser.form.increaseShift": "シフトを増やす",
  "browser.form.shiftSolved": "✓ ルーム全員に掲載内容を解読しました。",
  "browser.form.lockNote": "注意：キーを間違えると、全員のシステムが1分間ロックされます。先に解いてから入力しよう。",
  "browser.form.locked": "ロック中 · {s}秒",
  "browser.form.binaryPassed": "✓ 合格です。デコーダーを開いて「2進数」タブを確認してください。",
};

export default messages;
