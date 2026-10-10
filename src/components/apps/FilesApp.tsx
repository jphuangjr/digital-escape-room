"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useT } from "@/i18n/client";
import { pick, type Locale, type Tr } from "@/i18n/config";
import type { GameCtx } from "@/lib/client/game";
import type { AttemptResponse } from "@/lib/types";
import { CompassBadge, btnGhost, useNow } from "./shared";

interface FileItem {
  name: string;
  body: string;
}

// Harmless, client-side flavor files. Contain NO puzzle answers.
interface LocalFile {
  name: string;
  body: Tr;
}

const LOCAL_FILES: LocalFile[] = [
  {
    name: "case_brief.txt",
    body: {
      en: `CASE BRIEF — CONFIDENTIAL
Client: the sister of Dr. Ada Voss
Subject: Dr. Ada Voss, archivist, Meridian Institute
Status: missing, last contact 48 hours ago

Assignment:
Find out what happened to Ada. She left one message behind:
"If you're reading this, I got too close. Start at the beginning."

This laptop is hers. The browser still has her bookmarks. Her inbox is
still syncing. Work together, write down everything, and share what
matters with the rest of the room.

Fee: paid in advance. Questions: none, apparently.`,
      ko: `사건 개요 — 대외비
의뢰인: 에이다 보스 박사의 여동생
대상: 에이다 보스(Ada Voss) 박사, 메리디언 연구소 아키비스트
상태: 실종, 마지막 연락 48시간 전

임무:
에이다에게 무슨 일이 있었는지 알아낼 것. 그녀가 남긴 메시지는 하나뿐이다.
"이걸 읽고 있다면, 내가 너무 가까이 갔다는 뜻이야. 처음부터 시작해."

이 노트북은 그녀의 것이다. 브라우저엔 아직 그녀의 북마크가 있고, 메일함은
아직 동기화 중이다. 함께 움직이고, 전부 적어 두고, 중요한 건
방 사람들과 나눌 것.

보수: 선불 완료. 질문: 없음, 아마도.`,
      "zh-TW": `案件摘要 — 機密
委託人：艾達・佛斯博士的妹妹
對象：艾達・佛斯（Ada Voss）博士，子午研究院檔案管理員
狀態：失蹤，最後聯絡於 48 小時前

任務：
查出艾達發生了什麼事。她只留下一則訊息：
「如果你正在讀這段話，代表我靠得太近了。從頭開始。」

這台筆電是她的。瀏覽器裡還留著她的書籤，收件匣也還在同步。
大家一起行動，把一切都記下來，重要的事要跟房間裡的其他人分享。

酬勞：已預付。疑問：看來沒有。`,
      es: `RESUMEN DEL CASO — CONFIDENCIAL
Cliente: la hermana de la Dra. Ada Voss
Asunto: Dra. Ada Voss, archivista, Instituto Meridian
Estado: desaparecida, último contacto hace 48 horas

Encargo:
Averiguar qué le pasó a Ada. Dejó un solo mensaje:
"Si estás leyendo esto, me acerqué demasiado. Empieza por el principio."

Esta laptop es suya. El navegador todavía tiene sus marcadores. Su bandeja
de entrada sigue sincronizándose. Trabajen juntos, anoten todo y compartan
lo importante con el resto de la sala.

Honorarios: pagados por adelantado. Preguntas: ninguna, al parecer.`,
      ja: `事件概要 — 極秘
依頼人：エイダ・ヴォス博士の妹
対象：エイダ・ヴォス（Ada Voss）博士、メリディアン研究所アーキビスト
状況：行方不明、最後の連絡は48時間前

任務：
エイダの身に何が起きたのかを突き止めること。彼女が残したメッセージはひとつだけ。
「これを読んでいるなら、私は近づきすぎた。最初から始めて。」

このノートPCは彼女のものだ。ブラウザには彼女のブックマークが残り、受信箱は
まだ同期を続けている。協力し、すべてを書き留め、重要なことは
ルームのメンバーと共有すること。

報酬：前払い済み。質問：どうやら無用。`,
    },
  },
  {
    name: "readme.txt",
    body: {
      en: `FIELD NOTES FOR WHOEVER USES THIS MACHINE

- Browser: type an address in the bar, or tap a bookmark.
  Every page has a "View Source" button. Images have "File Info".
  Black bars can be tapped to reveal what's underneath.
- Notes: private by default. Tap "Share to room" when it matters.
  Tag fragments (name / year / ID / cipher key / address).
- Email: keep an eye on it. Ada leaves voicemails.
- Decoder: Ada keeps it in "Ada's Tools", inside her personal
  folder. She never could resist a security question.
- Stuck? The hints panel can ask Ada for a nudge.`,
      ko: `이 기계를 쓰는 누군가를 위한 현장 메모

- 브라우저: 주소창에 주소를 입력하거나 북마크를 누를 것.
  모든 페이지에 "소스 보기" 버튼이 있다. 이미지엔 "파일 정보"가 있다.
  검은 줄은 누르면 아래 숨은 내용이 보인다.
- 메모: 기본은 비공개. 중요하면 "방에 공유"를 누를 것.
  조각에 태그를 달 것 (이름 / 연도 / ID / 암호 키 / 주소).
- 이메일: 계속 확인할 것. 에이다가 음성 메시지를 남긴다.
- 디코더: 에이다는 그걸 개인 폴더 안의 "Ada's Tools"에
  넣어 뒀다. 보안 질문을 그냥 못 지나치는 사람이었다.
- 막혔다면? 힌트 패널에서 에이다에게 귀띔을 부탁할 수 있다.`,
      "zh-TW": `給使用這台機器的人的現場筆記

- 瀏覽器：在網址列輸入網址，或點選書籤。
  每個頁面都有「檢視原始碼」按鈕，圖片則有「檔案資訊」。
  黑色色塊點一下，就能看到底下藏著什麼。
- 筆記：預設為私人。重要的話就點「分享到房間」。
  替線索片段加上標籤（名字／年份／ID／密碼金鑰／網址）。
- 電子郵件：記得留意。艾達會留下語音留言。
- 解碼器：艾達把它放在個人資料夾裡的「Ada's Tools」。
  她就是忍不住要設個安全提問。
- 卡住了？可以在提示面板請艾達給點暗示。`,
      es: `NOTAS DE CAMPO PARA QUIEN USE ESTA MÁQUINA

- Navegador: escribe una dirección en la barra o toca un marcador.
  Cada página tiene un botón "Ver código fuente". Las imágenes tienen
  "Información del archivo". Las barras negras se pueden tocar para
  revelar lo que hay debajo.
- Notas: privadas por defecto. Toca "Compartir con la sala" cuando importe.
  Etiqueta los fragmentos (nombre / año / ID / clave de cifrado / dirección).
- Correo: no le quites el ojo. Ada deja mensajes de voz.
- Decodificador: Ada lo guarda en "Ada's Tools", dentro de su carpeta
  personal. Nunca pudo resistirse a una pregunta de seguridad.
- ¿Atascado? En el panel de pistas puedes pedirle a Ada un empujón.`,
      ja: `このマシンを使う誰かへの現場メモ

- ブラウザ：アドレスバーにアドレスを入力するか、ブックマークをタップ。
  どのページにも「ソースを表示」ボタンがある。画像には「ファイル情報」がある。
  黒塗りの部分はタップすると下に隠れた内容が見える。
- メモ：初期設定では非公開。大事なときは「ルームに共有」をタップ。
  断片にはタグを付けること（名前／年／ID／暗号キー／アドレス）。
- メール：こまめに確認すること。エイダは留守電メッセージを残す。
- デコーダー：エイダは個人フォルダの中の「Ada's Tools」にしまっている。
  セキュリティの質問を設定せずにはいられない人だった。
- 行き詰まったら？ ヒントパネルからエイダにそれとなく助けを頼める。`,
    },
  },
  {
    name: "todo.txt",
    body: {
      en: `- back up the archive (again)
- call sis back
- stop drawing compasses on everything
- renew domain before it lapses`,
      ko: `- 아카이브 백업 (또)
- 동생한테 다시 전화하기
- 아무 데나 나침반 그리는 버릇 고치기
- 도메인 만료 전에 갱신하기`,
      "zh-TW": `- 備份檔案庫（又一次）
- 回電給妹妹
- 別再到處亂畫指南針了
- 網域到期前記得續約`,
      es: `- respaldar el archivo (otra vez)
- devolverle la llamada a mi hermana
- dejar de dibujar brújulas en todo
- renovar el dominio antes de que venza`,
      ja: `- アーカイブをバックアップ（また）
- 妹に折り返し電話
- 何にでもコンパスを描くクセをやめる
- 期限切れの前にドメインを更新`,
    },
  },
];

// In Ada's Tools. Points to the binary lesson; contains no answers.
const SYLLABUS: LocalFile = {
  name: "cs110_syllabus.txt",
  body: {
    en: `HARBOUR COMMUNITY COLLEGE — EVENING STUDIES
CS 110: How Computers Count
Tuesdays 6:30–8:30pm, Room 12
Instructor: W. Okafor

Week 1  What is a computer, really?       (handout)
Week 2  Switches: on and off              (handout)
Week 3  Binary: counting with two fingers
        Lesson + practice quiz online:
        harbourcc.edu/cs110/binary
        Pass the quiz to install the class
        Binary translator on your machine.
Week 4  Passwords, and why yours is bad

Bring a pencil. Laptops welcome. Phones face down.

---
(Ada, in the margin:)
W. writes EVERYTHING in her class code now.
Shopping lists. Door codes. Probably passwords.
Learn it.`,
    ko: `하버 커뮤니티 칼리지 — 야간 강좌
CS 110: 컴퓨터는 어떻게 셀까
매주 화요일 오후 6:30–8:30, 12호실
강사: W. Okafor

1주차  컴퓨터란 정말 무엇인가?           (유인물)
2주차  스위치: 켜짐과 꺼짐               (유인물)
3주차  2진법: 손가락 두 개로 세기
        온라인 강의 + 연습 퀴즈:
        harbourcc.edu/cs110/binary
        퀴즈를 통과하면 수업용
        2진법 번역기가 기기에 설치됩니다.
4주차  비밀번호, 그리고 당신 것이 허술한 이유

연필 지참. 노트북 환영. 휴대폰은 뒤집어 둘 것.

---
(여백에 에이다의 글씨:)
W.는 요즘 '전부' 수업 코드로 적는다.
장보기 목록. 현관 비밀번호. 아마 패스워드도.
배워 둘 것.`,
    "zh-TW": `港灣社區學院 — 夜間進修部
CS 110：電腦如何計數
每週二 晚上 6:30–8:30，12 號教室
講師：W. Okafor

第 1 週  電腦到底是什麼？               （講義）
第 2 週  開關：開與關                   （講義）
第 3 週  二進位：用兩根手指數數
        線上課程 + 練習測驗：
        harbourcc.edu/cs110/binary
        通過測驗後，課堂用的
        二進位翻譯器就會安裝到你的機器上。
第 4 週  密碼，以及你的為什麼很爛

請帶鉛筆。歡迎帶筆電。手機請蓋著放。

---
（艾達寫在頁邊：）
W. 現在「什麼都」用她課堂上的代碼寫。
購物清單。門禁密碼。大概連密碼也是。
學起來。`,
    es: `HARBOUR COMMUNITY COLLEGE — ESTUDIOS NOCTURNOS
CS 110: Cómo cuentan las computadoras
Martes 6:30–8:30 p. m., Aula 12
Instructora: W. Okafor

Semana 1  ¿Qué es una computadora, en realidad?  (folleto)
Semana 2  Interruptores: encendido y apagado     (folleto)
Semana 3  Binario: contar con dos dedos
          Lección + prueba de práctica en línea:
          harbourcc.edu/cs110/binary
          Aprueba la prueba para instalar en tu
          equipo el traductor de binario de la clase.
Semana 4  Contraseñas, y por qué la tuya es mala

Trae un lápiz. Laptops bienvenidas. Teléfonos boca abajo.

---
(Ada, en el margen:)
W. ahora escribe TODO en el código de su clase.
Listas del súper. Códigos de puertas. Seguramente contraseñas.
Apréndelo.`,
    ja: `ハーバー・コミュニティ・カレッジ — 夜間講座
CS 110：コンピューターはどう数えるか
毎週火曜 6:30–8:30pm、12番教室
講師：W. Okafor

第1週  コンピューターとは、本当は何か？   （配布資料）
第2週  スイッチ：オンとオフ               （配布資料）
第3週  2進数：指2本で数える
        オンライン授業＋練習クイズ：
        harbourcc.edu/cs110/binary
        クイズに合格すると、授業用の
        2進数翻訳ツールがマシンにインストールされます。
第4週  パスワード、そしてあなたのがダメな理由

鉛筆持参。ノートPC歓迎。スマホは伏せておくこと。

---
（エイダの余白の書き込み：）
W.は最近「何でも」授業のコードで書く。
買い物リスト。ドアの暗証番号。たぶんパスワードも。
覚えておくこと。`,
  },
};

const resolveFile = (f: LocalFile, loc: Locale): FileItem => ({ name: f.name, body: pick(loc)(f.body) });

const PIN_LEN = 4;

function PinPad({ ctx }: { ctx: GameCtx }) {
  const t = useT();
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryUntil, setRetryUntil] = useState<number | null>(null);
  const [shake, setShake] = useState(false);
  const now = useNow(500);
  const waiting = retryUntil !== null && retryUntil > now;

  const submit = useCallback(
    async (value: string) => {
      setBusy(true);
      setError(null);
      const res = await ctx.api<AttemptResponse>("/attempt", {
        method: "POST",
        body: { puzzleId: "bonus-pin", input: value },
      });
      setBusy(false);
      const d = res.data;
      if (res.status === 429 || d?.rateLimited) {
        const sec = d?.retryAfterSec ?? 60;
        setRetryUntil(Date.now() + sec * 1000);
        setError(d?.message ?? t("apps.files.tooManyAttempts"));
        setPin("");
        return;
      }
      if (!res.ok || !d) {
        setError(t("apps.files.unreachable"));
        setPin("");
        return;
      }
      if (d.correct) {
        ctx.toast(t("apps.files.folderUnlocked"), "success");
        await ctx.refresh();
      } else {
        setError(d.message ?? t("apps.files.wrongPin"));
        setShake(true);
        setTimeout(() => setShake(false), 400);
        setPin("");
      }
    },
    [ctx, t],
  );

  function press(d: string) {
    if (busy || waiting) return;
    setError(null);
    if (pin.length >= PIN_LEN) return;
    const next = pin + d;
    setPin(next);
    if (next.length === PIN_LEN) void submit(next);
  }

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "del"];

  return (
    <div className="mx-auto flex w-full max-w-xs flex-col items-center gap-5 py-6">
      <div className="text-center">
        <div className="mb-1 text-3xl" aria-hidden>
          🔒
        </div>
        <h3 className="text-base font-semibold text-zinc-100">Ada&apos;s Personal</h3>
        <p className="text-xs text-zinc-500">{t("apps.files.enterPin")}</p>
      </div>
      <div className={`flex gap-4 ${shake ? "animate-pulse" : ""}`} aria-label={t("apps.files.pinProgress", { count: pin.length })}>
        {Array.from({ length: PIN_LEN }).map((_, i) => (
          <span
            key={i}
            className={`h-4 w-4 rounded-full border-2 ${
              i < pin.length ? "border-amber-400 bg-amber-400" : "border-zinc-600"
            } ${error && !waiting ? "border-red-500" : ""}`}
          />
        ))}
      </div>
      <div className="min-h-5 text-center text-sm" aria-live="polite">
        {waiting ? (
          <span className="text-amber-300">
            {t("apps.files.lockedOut", { s: Math.ceil(((retryUntil ?? 0) - now) / 1000) })}
          </span>
        ) : busy ? (
          <span className="text-zinc-400">{t("apps.files.checking")}</span>
        ) : error ? (
          <span className="text-red-400">{error}</span>
        ) : null}
      </div>
      <div className="grid w-full grid-cols-3 gap-3">
        {keys.map((k) => {
          const isDigit = /^\d$/.test(k);
          return (
            <button
              key={k}
              type="button"
              aria-label={k === "del" ? t("apps.files.pinDelete") : undefined}
              disabled={busy || waiting || (!isDigit && pin.length === 0)}
              onClick={() => {
                if (isDigit) press(k);
                else if (k === "del") setPin((p) => p.slice(0, -1));
                else setPin("");
              }}
              className={`flex h-16 items-center justify-center rounded-2xl border text-2xl font-semibold disabled:opacity-40 ${
                isDigit
                  ? "border-zinc-700 bg-zinc-900 text-zinc-100 active:bg-zinc-800"
                  : "border-transparent text-sm uppercase tracking-wider text-zinc-400 active:bg-zinc-900"
              }`}
            >
              {k === "del" ? "⌫" : k === "clear" ? t("apps.files.pinClear") : k}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SecurityQuestion({ ctx }: { ctx: GameCtx }) {
  const t = useT();
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryUntil, setRetryUntil] = useState<number | null>(null);
  const now = useNow(500);
  const waiting = retryUntil !== null && retryUntil > now;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const value = answer.trim();
    if (!value || busy || waiting) return;
    setBusy(true);
    setError(null);
    const res = await ctx.api<AttemptResponse>("/attempt", {
      method: "POST",
      body: { puzzleId: "tools-folder", input: value },
    });
    setBusy(false);
    const d = res.data;
    if (res.status === 429 || d?.rateLimited) {
      setRetryUntil(Date.now() + (d?.retryAfterSec ?? 60) * 1000);
      setError(d?.message ?? t("apps.files.tooManyAttempts"));
      return;
    }
    if (!d) {
      setError(t("apps.files.unreachable"));
      return;
    }
    if (d.correct) {
      ctx.toast(t("apps.files.folderUnlocked"), "success");
      await ctx.refresh();
    } else {
      setError(d.message ?? t("apps.files.wrongAnswer"));
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto flex w-full max-w-xs flex-col gap-4 py-6">
      <div className="text-center">
        <div className="mb-1 text-3xl" aria-hidden>
          🔒
        </div>
        <h3 className="text-base font-semibold text-zinc-100">Ada&apos;s Tools</h3>
        <p className="mt-3 text-xs uppercase tracking-widest text-zinc-500">{t("apps.files.securityQuestion")}</p>
        <p className="mt-1 font-serif text-lg text-zinc-100">{t("apps.files.weatherQuestion")}</p>
      </div>
      <input
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder={t("apps.files.answerPlaceholder")}
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        enterKeyHint="go"
        aria-label={t("apps.files.answerAria")}
        className="min-h-12 rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-zinc-100 placeholder:text-zinc-600"
      />
      <button
        type="submit"
        disabled={busy || waiting || !answer.trim()}
        className="min-h-12 rounded-lg bg-amber-400 font-semibold text-zinc-950 disabled:opacity-50"
      >
        {busy ? t("apps.files.checking") : t("apps.files.unlock")}
      </button>
      <div className="min-h-5 text-center text-sm" aria-live="polite">
        {waiting ? (
          <span className="text-amber-300">
            {t("apps.files.lockedOut", { s: Math.ceil(((retryUntil ?? 0) - now) / 1000) })}
          </span>
        ) : error ? (
          <span className="text-red-400">{error}</span>
        ) : null}
      </div>
    </form>
  );
}

type View =
  | { kind: "root" }
  | { kind: "personal" }
  | { kind: "tools" }
  | { kind: "file"; file: FileItem; from: "root" | "personal" | "tools" };

export function FilesApp({ ctx }: { ctx: GameCtx }) {
  const t = useT();
  const locale = useLocale();
  const { state } = ctx;
  const unlocked = state.progress.solved.includes("bonus-pin");
  const toolsUnlocked = state.progress.solved.includes("tools-folder");
  const hasCompass = state.progress.badges.includes("compass");
  const [view, setView] = useState<View>({ kind: "root" });
  // Cached per language, so switching language mid-game refetches Ada's files in the new one.
  const [personalCache, setPersonalCache] = useState<{ locale: string; files: FileItem[] } | null>(null);
  const personal = personalCache?.locale === locale ? personalCache.files : null;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!unlocked || view.kind !== "personal" || personal) return;
    let cancelled = false;
    setLoading(true);
    ctx
      .api<{ locked: true } | { locked: false; files: FileItem[] }>("/files")
      .then((res) => {
        if (cancelled) return;
        if (res.ok && res.data && !res.data.locked) setPersonalCache({ locale, files: res.data.files });
        else ctx.toast(t("apps.files.openFolderFailed"), "error");
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [unlocked, view.kind, personal, ctx, t, locale]);

  const header = (title: string, back?: () => void) => (
    <div className="flex shrink-0 items-center gap-2 border-b border-zinc-800 px-2 py-2">
      {back ? (
        <button onClick={back} className="min-h-11 min-w-11 rounded-lg px-3 text-sm font-semibold text-amber-300 active:bg-zinc-900">
          {t("apps.files.back")}
        </button>
      ) : (
        <span className="px-2 text-zinc-500" aria-hidden>
          ▤
        </span>
      )}
      <h2 className="min-w-0 flex-1 truncate font-mono text-sm text-zinc-300">{title}</h2>
      {hasCompass && <CompassBadge label={t("apps.files.compass")} />}
    </div>
  );

  const row = (icon: string, name: string, sub: string, onClick: () => void) => (
    <li key={name}>
      <button onClick={onClick} className="flex min-h-14 w-full items-center gap-3 px-3 py-2 text-left active:bg-zinc-900">
        <span className="w-8 text-center text-xl" aria-hidden>
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-mono text-sm text-zinc-100">{name}</span>
          <span className="block text-xs text-zinc-500">{sub}</span>
        </span>
        <span className="text-zinc-600" aria-hidden>
          ›
        </span>
      </button>
    </li>
  );

  if (view.kind === "file") {
    const back = () => setView({ kind: view.from });
    return (
      <div className="flex h-full min-h-0 flex-col bg-zinc-950 text-zinc-100">
        {header(view.file.name, back)}
        <div className="min-h-0 flex-1 overflow-auto overscroll-contain p-4">
          <pre className="whitespace-pre-wrap break-words font-mono text-[13px] leading-relaxed text-zinc-200">
            {view.file.body}
          </pre>
        </div>
      </div>
    );
  }

  if (view.kind === "tools") {
    return (
      <div className="flex h-full min-h-0 flex-col bg-zinc-950 text-zinc-100">
        {header("~/Ada's Personal/Ada's Tools", () => setView({ kind: "personal" }))}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {!toolsUnlocked ? (
            <SecurityQuestion ctx={ctx} />
          ) : (
            <ul className="divide-y divide-zinc-900">
              {row("🧭", t("apps.files.decoderName"), t("apps.files.decoderSub"), () => ctx.openApp("decoder"))}
              {row("📄", SYLLABUS.name, t("apps.files.textFile"), () =>
                setView({ kind: "file", file: resolveFile(SYLLABUS, locale), from: "tools" }),
              )}
            </ul>
          )}
        </div>
      </div>
    );
  }

  if (view.kind === "personal") {
    return (
      <div className="flex h-full min-h-0 flex-col bg-zinc-950 text-zinc-100">
        {header("~/Ada's Personal", () => setView({ kind: "root" }))}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {!unlocked ? (
            <PinPad ctx={ctx} />
          ) : loading || !personal ? (
            <p className="p-10 text-center text-sm text-zinc-500">{t("apps.files.opening")}</p>
          ) : (
            <>
              {hasCompass && (
                <div className="m-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-amber-200">
                  <CompassBadge /> <span className="ml-1">{t("apps.files.foundPersonal")}</span>
                </div>
              )}
              <ul className="divide-y divide-zinc-900">
                {row(
                  toolsUnlocked ? "📂" : "🔒",
                  "Ada's Tools",
                  toolsUnlocked ? t("apps.files.folderUnlockedSub") : t("apps.files.folderSecuritySub"),
                  () => setView({ kind: "tools" }),
                )}
                {personal.map((f) =>
                  row("📄", f.name, t("apps.files.textFile"), () => setView({ kind: "file", file: f, from: "personal" })),
                )}
              </ul>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-zinc-950 text-zinc-100">
      {header("~/")}
      <ul className="min-h-0 flex-1 divide-y divide-zinc-900 overflow-y-auto overscroll-contain">
        {row(
          unlocked ? "📂" : "🔒",
          "Ada's Personal",
          unlocked ? t("apps.files.folderUnlockedSub") : t("apps.files.folderPinSub"),
          () => setView({ kind: "personal" }),
        )}
        {LOCAL_FILES.map((f) =>
          row("📄", f.name, t("apps.files.textFile"), () => setView({ kind: "file", file: resolveFile(f, locale), from: "root" })),
        )}
      </ul>
      <div className="shrink-0 border-t border-zinc-900 p-2 text-center">
        <button className={`${btnGhost} w-full`} onClick={() => ctx.openApp("notes")}>
          {t("apps.files.openNotes")}
        </button>
      </div>
    </div>
  );
}
