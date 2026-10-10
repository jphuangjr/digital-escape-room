import "server-only";
import { pick, type Locale } from "@/i18n/config";
import type { Block, RoomProgress, SitePage } from "@/lib/types";
import { page } from "./source";

export const SWITCH_HOST = "switch.ada-voss.net";

function home(progress: RoomProgress, loc: Locale): SitePage {
  const x = pick(loc);
  const solved = progress.solved.includes("final-phrase");
  const blocks: Block[] = solved
    ? [
        { type: "compass" },
        { type: "notice", tone: "success", text: x({ en: "SWITCH DISARMED. Proof of life accepted.", ko: "스위치 해제됨. 생존 증명이 확인되었다." }) },
        { type: "heading", level: 1, text: x({ en: "You found me.", ko: "날 찾았구나." }) },
        {
          type: "paragraph",
          text: x({
            en: "If you're reading this, the phrase was right, and that means you walked the whole road: the name they erased, the year they lied about, the little cat with the number on her collar. Nobody stumbles into those three things by accident.",
            ko: "이걸 읽고 있다면 문구가 맞았다는 거고, 네가 그 길을 끝까지 걸어왔다는 뜻이야. 그들이 지운 이름, 그들이 거짓말한 연도, 목걸이에 번호를 단 작은 고양이. 그 세 가지에 우연히 닿는 사람은 없어.",
          }),
        },
        {
          type: "paragraph",
          text: x({
            en: "I'm alive. I've been alive the whole time, inside their own network, watching them reconcile me out of existence one record at a time.",
            ko: "나 살아 있어. 처음부터 쭉 살아 있었어. 그들의 네트워크 안에서, 그들이 기록을 하나씩 '정합'하며 나를 지워 가는 걸 지켜보면서.",
          }),
        },
        {
          type: "paragraph",
          text: x({
            en: "Now you have to choose. I can't make this call for you. I'm too close to it.",
            ko: "이제 네가 골라야 해. 이건 내가 대신 정해 줄 수 없어. 난 너무 가까이 있으니까.",
          }),
        },
        { type: "footer", text: x({ en: "switch.ada-voss.net — the needle points true.", ko: "switch.ada-voss.net — 바늘은 진실을 가리킨다." }) },
      ]
    : [
        { type: "compass" },
        { type: "heading", level: 1, text: x({ en: "Dead Man's Switch", ko: "데드맨 스위치" }) },
        {
          type: "countdown",
          seconds: 47 * 3600 + 59 * 60 + 12,
          label: x({ en: "Until the unaltered records are released", ko: "수정되지 않은 원본 기록 공개까지" }),
        },
        {
          type: "paragraph",
          text: x({
            en: "This is Ada Voss. If this timer is running, I haven't checked in. Either I can't, or I've decided not to.",
            ko: "에이다 보스야. 이 타이머가 돌고 있다면 내가 연락을 안 했다는 거야. 할 수 없거나, 안 하기로 했거나.",
          }),
        },
        {
          type: "paragraph",
          text: x({
            en: "If you're one of them, you can't stop it. If you're the one my sister hired — hello. You can prove I'm still breathing. Three pieces, joined by dashes: who has the key, the year they lied, and the number on Biscuit's collar.",
            ko: "네가 그들 쪽 사람이라면 이건 못 멈춰. 내 동생이 고용한 사람이라면, 안녕. 내가 아직 숨 쉬고 있다는 걸 증명할 수 있어. 세 조각을 대시(-)로 이어 붙여: 열쇠를 가진 사람, 그들이 거짓말한 연도, 그리고 Biscuit 목걸이의 번호.",
          }),
        },
        { type: "form", form: "final-phrase", prompt: x({ en: "Proof of life phrase", ko: "생존 증명 문구" }) },
        {
          type: "footer",
          text: x({ en: "switch.ada-voss.net — hosted somewhere they can't reconcile.", ko: "switch.ada-voss.net — 그들이 손댈 수 없는 곳에서 호스팅 중." }),
        },
      ];
  return page(SWITCH_HOST, solved ? x({ en: "You found me", ko: "날 찾았구나" }) : x({ en: "Dead Man's Switch", ko: "데드맨 스위치" }), "switch", blocks, {
    headComments: [x({ en: "no trackers. no analytics. no Institute.", ko: "추적기 없음. 분석 없음. 연구소 없음." })],
    bodyComments: [
      x({
        en: "if it fires, it fires. better the truth out late than never. — A.",
        ko: "터지면 터지는 거지. 진실은 늦게라도 나오는 게 안 나오는 것보단 나아. — A.",
      }),
    ],
  });
}

export function resolveSwitch(path: string, progress: RoomProgress, loc: Locale): SitePage | null {
  if (!progress.solved.includes("admin-console")) return null;
  return path === "" ? home(progress, loc) : null;
}
