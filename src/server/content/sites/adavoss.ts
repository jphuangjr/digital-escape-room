import "server-only";
import { pick, type Locale } from "@/i18n/config";
import type { Block, RoomProgress, SitePage } from "@/lib/types";
import { page } from "./source";

/**
 * ada-voss.net: Ada's personal site, archived when she disappeared. A deliberate dead end: players see
 * her address on her emails and try it. Every path shows the same notice. (switch.ada-voss.net is a
 * separate host and unaffected.)
 */
export const ADAVOSS_HOST = "ada-voss.net";

export function resolveAdaVoss(path: string, _progress: RoomProgress, loc: Locale): SitePage {
  const x = pick(loc);
  const blocks: Block[] = [
    { type: "heading", level: 1, text: x({ en: "This website has been archived", ko: "이 웹사이트는 보관 처리되었습니다", "zh-TW": "此網站已封存", es: "Este sitio web ha sido archivado", ja: "このウェブサイトはアーカイブされました", "pt-BR": "Este site foi arquivado" }) },
    {
      type: "paragraph",
      text: x({
        en: "ada-voss.net is no longer active. The owner archived this site and its contents are no longer available.",
        ko: "ada-voss.net은 더 이상 운영되지 않습니다. 소유자가 이 사이트를 보관 처리했으며, 콘텐츠는 더 이상 볼 수 없습니다.",
        "zh-TW": "ada-voss.net 已停止運作。網站擁有者已將此網站封存，內容已無法瀏覽。",
        es: "ada-voss.net ya no está activo. Su propietaria archivó el sitio y su contenido ya no está disponible.",
        ja: "ada-voss.net は現在運用されていません。所有者がこのサイトをアーカイブしたため、コンテンツは閲覧できません。",
        "pt-BR": "ada-voss.net não está mais ativo. A proprietária arquivou o site e o conteúdo não está mais disponível.",
      }),
    },
    { type: "notice", tone: "info", text: x({ en: "Archived by the site owner 2 days ago.", ko: "2일 전 사이트 소유자가 보관 처리함.", "zh-TW": "網站擁有者於 2 天前封存。", es: "Archivado por la propietaria del sitio hace 2 días.", ja: "2日前にサイト所有者がアーカイブしました。", "pt-BR": "Arquivado pela proprietária do site há 2 dias." }) },
    { type: "footer", text: x({ en: "Harbourline Hosting · Archived site", ko: "Harbourline Hosting · 보관된 사이트", "zh-TW": "Harbourline Hosting · 已封存網站", es: "Harbourline Hosting · Sitio archivado", ja: "Harbourline Hosting · アーカイブ済みサイト", "pt-BR": "Harbourline Hosting · Site arquivado" }) },
  ];
  return page(`${ADAVOSS_HOST}${path}`, x({ en: "Website archived", ko: "보관된 웹사이트", "zh-TW": "網站已封存", es: "Sitio archivado", ja: "アーカイブ済みサイト", "pt-BR": "Site arquivado" }), "archived", blocks, {
    headComments: [x({ en: "Harbourline Hosting: archived placeholder", ko: "Harbourline Hosting: 보관 안내 페이지", "zh-TW": "Harbourline Hosting：封存頁面", es: "Harbourline Hosting: página de sitio archivado", ja: "Harbourline Hosting：アーカイブ用プレースホルダー", "pt-BR": "Harbourline Hosting: página de site arquivado" })],
  });
}
