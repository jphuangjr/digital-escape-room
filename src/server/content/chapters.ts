import "server-only";
import { pick, type Locale, type Tr } from "@/i18n/config";
import type { ChapterDTO, RoomProgress } from "@/lib/types";
import { chapterOf, type ChapterDef } from "../chapters";

/** Ada's case in chapters, for the progress line: each one opens with a main-story puzzle solved. */
export const ADA_CHAPTERS: ChapterDef<RoomProgress>[] = [
  { id: "laptop", reached: () => true },
  { id: "trail", reached: (p) => p.solved.includes("shift-key") },
  { id: "vault", reached: (p) => p.solved.includes("intranet-login") },
  { id: "console", reached: (p) => p.solved.includes("admin-console") },
  { id: "choice", reached: (p) => p.solved.includes("final-phrase") },
];

const NAMES: Record<string, Tr> = {
  laptop: { en: "Ada's laptop", ko: "에이다의 노트북", "zh-TW": "艾達的筆電", es: "La laptop de Ada", ja: "エイダのノートPC", "pt-BR": "O notebook da Ada" },
  trail: { en: "The forum trail", ko: "포럼의 흔적", "zh-TW": "論壇上的蹤跡", es: "El rastro del foro", ja: "掲示板の足跡", "pt-BR": "A trilha do fórum" },
  vault: { en: "Inside the Vault", ko: "The Vault 안으로", "zh-TW": "金庫之內", es: "Dentro de la Bóveda", ja: "金庫（The Vault）の中へ", "pt-BR": "Dentro do Cofre" },
  console: { en: "The admin console", ko: "관리자 콘솔", "zh-TW": "管理主控台", es: "La consola de administración", ja: "管理コンソール", "pt-BR": "O console de administração" },
  choice: { en: "The choice", ko: "선택", "zh-TW": "抉擇", es: "La decisión", ja: "決断", "pt-BR": "A escolha" },
};

export function adaChapter(progress: RoomProgress, loc: Locale): ChapterDTO {
  const t = pick(loc);
  return chapterOf(ADA_CHAPTERS, progress, (id) => t(NAMES[id]));
}
