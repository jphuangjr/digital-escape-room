import type en from "../en/wait";

const messages: Record<keyof typeof en, string> = {
  "wait.tips.label": "待っているあいだに",
  "wait.tips.gathering": "チームを待っていますか？下のコードかQRコードを共有しましょう。",

  "wait.ada.boot1": "自己診断… OK",
  "wait.ada.boot2": "/home/ada をマウント中… OK",
  "wait.ada.boot3": "前回のセッションを復元中…",
  "wait.ada.tip1": "全員が同じノートPCを見ています。手分けしましょう。一人がメールを読み、もう一人がファイルを調べます。",
  "wait.ada.tip2": "誰かがロックを解除すると、ルーム全員に一度に開きます。",
  "wait.ada.tip3": "ゆっくり読みましょう。名前や日付、引っかかる言い回しが後で効いてきます。",
  "wait.ada.tip4": "メモは共有するまで自分だけのものです。良い発見はルームに送りましょう。",
  "wait.ada.tip5": "行き詰まったら、ルームからエイダにヒントを。全員に留守電メッセージで届きます。",

  "wait.train.departures": "発車案内",
  "wait.train.platform": "{n}番線",
  "wait.train.status": "ご乗車ください",
  "wait.train.tip1": "壁をひとつずつ分担して、見えたものを声に出しましょう。各部屋に壁は四つあります。",
  "wait.train.tip2": "誰かが拾ったものは、チーム全員で共有されます。",
  "wait.train.tip3": "持ち物同士を組み合わせてみましょう。ありふれた二つが役に立つものになることも。",
  "wait.train.tip4": "三回続けて間違えると錠前が一分間動かなくなります。まず試行ログを確認しましょう。",
  "wait.train.tip5": "行き詰まったら、テオドールを呼びましょう。夜間ポーターの書き付けは一枚ごとにわかりやすくなります。",

  "wait.atlas.tip1": "一緒に行動しなくても大丈夫です。手分けして探索し、チャットで報告しましょう。",
  "wait.atlas.tip2": "読んだものはすべてノートに写されるので、戻らなくても手がかりを見直せます。",
  "wait.atlas.tip3": "誰かが見つけたものは、チーム全員で共有されます。",
  "wait.atlas.tip4": "三回続けて間違えると錠前が一分間動かなくなります。まず試行ログを確認しましょう。",
  "wait.atlas.tip5": "行き詰まったら、地図師の覚え書きが今いる場所の謎を助けてくれます。",
};

export default messages;
