import "server-only";
import { pick, type Locale } from "@/i18n/config";
import type { Block, RoomProgress, SitePage } from "@/lib/types";
import { page } from "./source";

export const TRAPDOOR_HOST = "trapdoor.net";

function home(x: ReturnType<typeof pick>): SitePage {
  const blocks: Block[] = [
    { type: "notice", tone: "danger", text: x({ en: "CONNECTION LOGGED.", ko: "접속이 기록되었습니다." }) },
    { type: "heading", level: 1, text: x({ en: "You followed the wrong needle.", ko: "당신은 엉뚱한 바늘을 따라왔습니다." }) },
    {
      type: "paragraph",
      text: x({ en: "Hello, investigator. We wondered how long it would take.", ko: "안녕하십니까, 탐정님. 얼마나 걸릴지 궁금하던 참이었습니다." }),
    },
    {
      type: "paragraph",
      text: x({
        en: "Dr. Voss was a gifted archivist and a troubled woman. She saw patterns in coffee stains and conspiracies in typographical errors. The people who loved her are grieving. You are being paid to keep that grief open.",
        ko: "보스 박사는 재능 있는 기록연구사였고, 동시에 위태로운 사람이었습니다. 커피 얼룩에서 패턴을, 오탈자에서 음모를 보던 사람이었지요. 그녀를 사랑했던 이들은 슬픔에 잠겨 있습니다. 당신은 그 상처를 계속 벌려 두는 대가로 돈을 받고 있고요.",
      }),
    },
    {
      type: "paragraph",
      text: x({
        en: "There is nothing behind this door. There never was. The account you followed was ours, and every timestamp you decoded was written for you to decode. Consider this a courtesy.",
        ko: "이 문 뒤에는 아무것도 없습니다. 처음부터 없었습니다. 당신이 따라온 계정은 우리 것이었고, 당신이 해독한 타임스탬프는 전부 당신이 해독하라고 써 둔 것입니다. 이건 일종의 호의로 받아들이십시오.",
      }),
    },
    {
      type: "paragraph",
      text: x({ en: "Go home. Close the laptop. Let the record rest.", ko: "집으로 돌아가십시오. 노트북을 덮으십시오. 기록은 그대로 두십시오." }),
    },
    { type: "compass" },
    { type: "paragraph", text: x({ en: "— The Office of Continuity, Meridian Institute", ko: "— 메리디언 연구소 연속성 관리실" }) },
    {
      type: "footer",
      text: x({ en: "This page is monitored. Your visit has been reconciled.", ko: "이 페이지는 감시되고 있습니다. 당신의 방문은 정리되었습니다." }),
    },
  ];
  return page(TRAPDOOR_HOST, "trapdoor.net", "honeypot", blocks, {
    headComments: [x({ en: "honeypot v2 — log visitor, notify T.K.", ko: "허니팟 v2 — 방문자 기록, T.K.에게 통보" })],
    bodyComments: [
      x({
        en: "if they got here they found the sock account. the real one still posts. check whose needle points true.",
        ko: "여기까지 왔다면 위장 계정을 찾은 거다. 진짜 계정은 아직도 글을 올린다. 누구의 바늘이 제대로 가리키는지 확인할 것.",
      }),
      x({
        en: "reminder: our account's name is the mirror image. hers came first.",
        ko: "참고: 우리 계정 이름은 거울에 비친 모양이다. 그녀의 이름이 먼저였다.",
      }),
    ],
    tailComments: [x({ en: "DO NOT link this page from anywhere. — L.A.", ko: "이 페이지는 어디에도 링크하지 말 것. — L.A." })],
  });
}

export function resolveTrapdoor(path: string, _progress: RoomProgress, loc: Locale): SitePage | null {
  return path === "" ? home(pick(loc)) : null;
}
