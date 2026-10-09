import "server-only";
import type { Block, SitePage, SiteTheme } from "@/lib/types";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function ind(depth: number): string {
  return "  ".repeat(depth);
}

function blockToHtml(b: Block, d: number): string[] {
  const i = ind(d);
  switch (b.type) {
    case "heading": {
      const l = b.level ?? 2;
      return [`${i}<h${l}>${esc(b.text)}</h${l}>`];
    }
    case "paragraph":
      return [`${i}<p>${esc(b.text)}</p>`];
    case "link":
      return [`${i}<a href="https://${esc(b.href)}">${esc(b.text)}</a>`];
    case "nav":
      return [
        `${i}<nav>`,
        `${i}  <ul>`,
        ...b.links.map((l) => `${i}    <li><a href="https://${esc(l.href)}">${esc(l.text)}</a></li>`),
        `${i}  </ul>`,
        `${i}</nav>`,
      ];
    case "image":
      return [
        `${i}<figure>`,
        `${i}  <img src="/media/${esc(b.fileInfo.filename)}" alt="${esc(b.alt)}" />`,
        ...(b.caption ? [`${i}  <figcaption>${esc(b.caption)}</figcaption>`] : []),
        `${i}</figure>`,
      ];
    case "redacted":
      return [`${i}<span class="redacted" aria-label="${esc(b.label ?? "redacted")}">&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;</span>`];
    case "list":
      return [`${i}<ul>`, ...b.items.map((t) => `${i}  <li>${esc(t)}</li>`), `${i}</ul>`];
    case "staff":
      return [
        `${i}<section class="staff-grid">`,
        ...b.people.flatMap((p) => [
          `${i}  <article class="staff-card" id="staff-${slug(p.name)}">`,
          p.photo
            ? `${i}    <img src="/media/staff/${esc(p.photo)}" alt="${esc(p.name)}" />`
            : `${i}    <div class="photo-missing"></div>`,
          `${i}    <h3>${esc(p.name)}</h3>`,
          `${i}    <p class="role">${esc(p.role)}</p>`,
          `${i}    <p class="bio">${esc(p.bio)}</p>`,
          `${i}  </article>`,
        ]),
        `${i}</section>`,
      ];
    case "post":
      return [
        `${i}<article class="post"${b.series ? ` data-series="${esc(b.series)}"` : ""}>`,
        `${i}  <h2>${esc(b.title)}</h2>`,
        `${i}  <p class="byline">${b.author ? esc(b.author) + " · " : ""}<time>${esc(b.date)}${b.time ? " " + esc(b.time) : ""}</time></p>`,
        `${i}  <div class="post-body">`,
        ...b.body.split("\n").filter(Boolean).map((p) => `${i}    <p>${esc(p)}</p>`),
        `${i}  </div>`,
        `${i}</article>`,
      ];
    case "listing":
      return [
        `${i}<article class="listing"${b.petId ? ` data-pet-id="${esc(b.petId)}"` : ""}>`,
        `${i}  <h3>${esc(b.title)}</h3>`,
        `${i}  <p class="meta">${esc(b.meta)}</p>`,
        `${i}  <p class="desc">${esc(b.body)}</p>`,
        `${i}</article>`,
      ];
    case "diff":
      return [
        `${i}<div class="record-diff">`,
        `${i}  <h4>${esc(b.label)}</h4>`,
        `${i}  <del>${esc(b.before)}</del>`,
        `${i}  <ins>${esc(b.after)}</ins>`,
        `${i}</div>`,
      ];
    case "memo":
      return [
        `${i}<div class="memo">`,
        `${i}  <h3>${esc(b.heading)}</h3>`,
        `${i}  <p>`,
        ...b.parts.map((p) =>
          "text" in p
            ? `${i}    ${esc(p.text)}`
            : `${i}    <span class="redacted">&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;&#9608;</span>`,
        ),
        `${i}  </p>`,
        `${i}</div>`,
      ];
    case "countdown":
      return [`${i}<div class="countdown" data-seconds="${b.seconds}">${esc(b.label)}</div>`];
    case "form":
      return [
        `${i}<form method="post" action="/submit" data-form="${b.form}">`,
        `${i}  <label>${esc(b.prompt)}</label>`,
        ...(b.form === "intranet-login"
          ? [`${i}  <input name="username" autocomplete="off" />`, `${i}  <input name="password" type="password" />`]
          : [`${i}  <input name="answer" autocomplete="off" />`]),
        `${i}  <button type="submit">Submit</button>`,
        `${i}</form>`,
      ];
    case "notice":
      return [`${i}<div class="notice notice-${b.tone}">${esc(b.text)}</div>`];
    case "footer":
      return [`${i}<footer>${esc(b.text)}</footer>`];
    case "compass":
      return [
        `${i}<svg class="compass" viewBox="0 0 64 64" aria-hidden="true">`,
        `${i}  <circle cx="32" cy="32" r="30" />`,
        `${i}  <g class="notches"><!-- 7 --></g>`,
        `${i}  <path class="needle broken" d="M32 8 L35 32 L32 40" />`,
        `${i}</svg>`,
      ];
  }
}

export interface SourceOptions {
  /** Comments inserted at the top of <head>. */
  headComments?: string[];
  /** Comments inserted just after <body>. */
  bodyComments?: string[];
  /** Comments inserted just before </body>. */
  tailComments?: string[];
  /** Comments inserted before the block at the given index. */
  inlineComments?: Record<number, string[]>;
  meta?: Record<string, string>;
  scripts?: string[];
}

function comment(c: string, d: number): string {
  return `${ind(d)}<!-- ${c} -->`;
}

/** Build a prettified fake HTML document from a page's blocks. */
export function renderSource(
  page: { address: string; title: string; theme: SiteTheme; blocks: Block[] },
  opts: SourceOptions = {},
): string {
  const lines: string[] = [];
  lines.push("<!DOCTYPE html>");
  lines.push('<html lang="en">');
  lines.push("  <head>");
  for (const c of opts.headComments ?? []) lines.push(comment(c, 2));
  lines.push('    <meta charset="utf-8" />');
  lines.push('    <meta name="viewport" content="width=device-width, initial-scale=1" />');
  for (const [k, v] of Object.entries(opts.meta ?? {})) lines.push(`    <meta name="${esc(k)}" content="${esc(v)}" />`);
  lines.push(`    <title>${esc(page.title)}</title>`);
  lines.push(`    <link rel="stylesheet" href="/static/${page.theme}.css" />`);
  lines.push("  </head>");
  lines.push(`  <body class="theme-${page.theme}">`);
  for (const c of opts.bodyComments ?? []) lines.push(comment(c, 2));
  lines.push("    <main>");
  page.blocks.forEach((b, idx) => {
    for (const c of opts.inlineComments?.[idx] ?? []) lines.push(comment(c, 3));
    lines.push(...blockToHtml(b, 3));
  });
  lines.push("    </main>");
  for (const s of opts.scripts ?? []) lines.push(`    <script src="${esc(s)}"></script>`);
  for (const c of opts.tailComments ?? []) lines.push(comment(c, 2));
  lines.push("  </body>");
  lines.push("</html>");
  return lines.join("\n");
}

/** Convenience: build a full SitePage with generated source. */
export function page(
  address: string,
  title: string,
  theme: SiteTheme,
  blocks: Block[],
  opts: SourceOptions = {},
): SitePage {
  return { address, title, theme, blocks, source: renderSource({ address, title, theme, blocks }, opts) };
}
