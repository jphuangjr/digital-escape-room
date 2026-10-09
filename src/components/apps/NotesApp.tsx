"use client";

import { useState } from "react";
import type { GameCtx } from "@/lib/client/game";
import type { FragmentTag, NoteDTO } from "@/lib/types";
import { ColorDot, btnDanger, btnGhost, btnPrimary, relativeTime, useNow } from "./shared";

export const FRAGMENT_TAGS: { value: FragmentTag; label: string }[] = [
  { value: "name", label: "name" },
  { value: "year", label: "year" },
  { value: "id", label: "ID" },
  { value: "cipher", label: "cipher key" },
  { value: "address", label: "address" },
];

const tagLabel = (t: FragmentTag | null) => FRAGMENT_TAGS.find((x) => x.value === t)?.label ?? null;

function TagChips({
  value,
  onChange,
}: {
  value: FragmentTag | null;
  onChange: (t: FragmentTag | null) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Fragment tag">
      {FRAGMENT_TAGS.map((t) => {
        const active = value === t.value;
        return (
          <button
            key={t.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(active ? null : t.value)}
            className={`min-h-11 rounded-full border px-3 text-xs font-semibold uppercase tracking-wide ${
              active
                ? "border-amber-400 bg-amber-500/20 text-amber-200"
                : "border-zinc-700 bg-zinc-900 text-zinc-400 active:bg-zinc-800"
            }`}
          >
            #{t.label}
          </button>
        );
      })}
    </div>
  );
}

function TagBadge({ tag }: { tag: FragmentTag | null }) {
  const l = tagLabel(tag);
  if (!l) return null;
  return (
    <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-300">
      #{l}
    </span>
  );
}

export function NotesApp({ ctx }: { ctx: GameCtx }) {
  const { state } = ctx;
  const now = useNow(15000);
  const [tab, setTab] = useState<"mine" | "room">("mine");
  const [body, setBody] = useState("");
  const [tag, setTag] = useState<FragmentTag | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ id: string; body: string; tag: FragmentTag | null } | null>(null);

  const mine = state.privateNotes;
  const room = state.publicNotes;
  const list = tab === "mine" ? mine : room;

  async function run(key: string, fn: () => Promise<{ ok: boolean; status: number; data: unknown }>, okMsg?: string) {
    setBusy(key);
    try {
      const res = await fn();
      if (!res.ok) {
        const msg = (res.data as { error?: string } | null)?.error;
        ctx.toast(msg || `Something went wrong (${res.status})`, "error");
        return false;
      }
      if (okMsg) ctx.toast(okMsg, "success");
      await ctx.refresh();
      return true;
    } catch {
      ctx.toast("Network error", "error");
      return false;
    } finally {
      setBusy(null);
    }
  }

  async function create() {
    const text = body.trim();
    if (!text) return;
    const ok = await run("create", () =>
      ctx.api("/notes", { method: "POST", body: { body: text, visibility: "PRIVATE", fragmentTag: tag } }),
    );
    if (ok) {
      setBody("");
      setTag(null);
      setTab("mine");
    }
  }

  const share = (n: NoteDTO) =>
    run(`share-${n.id}`, () => ctx.api(`/notes/${n.id}`, { method: "PATCH", body: { visibility: "PUBLIC" } }), "Shared to room");

  const makePrivate = (n: NoteDTO) =>
    run(`share-${n.id}`, () => ctx.api(`/notes/${n.id}`, { method: "PATCH", body: { visibility: "PRIVATE" } }), "Moved back to your notes");

  const remove = (n: NoteDTO) => {
    if (!window.confirm("Delete this note?")) return;
    void run(`del-${n.id}`, () => ctx.api(`/notes/${n.id}`, { method: "DELETE" }));
  };

  async function saveEdit() {
    if (!editing) return;
    const text = editing.body.trim();
    if (!text) return;
    const ok = await run(`edit-${editing.id}`, () =>
      ctx.api(`/notes/${editing.id}`, { method: "PATCH", body: { body: text, fragmentTag: editing.tag } }),
    );
    if (ok) setEditing(null);
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-zinc-950 text-zinc-100">
      {/* Tabs */}
      <div className="flex shrink-0 gap-1 border-b border-zinc-800 p-2" role="tablist">
        {(
          [
            ["mine", `Mine (${mine.length})`],
            ["room", `Room (${room.length})`],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`min-h-11 flex-1 rounded-lg text-sm font-semibold ${
              tab === id ? "bg-amber-500/15 text-amber-300" : "text-zinc-400 active:bg-zinc-900"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {/* Composer */}
        <div className="space-y-3 border-b border-zinc-800 p-3">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Jot down a clue…"
            rows={3}
            maxLength={2000}
            className="w-full resize-y rounded-lg border border-zinc-700 bg-zinc-900 p-3 text-base text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none"
          />
          <TagChips value={tag} onChange={setTag} />
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-zinc-500">New notes are private until you share them.</span>
            <button className={btnPrimary} disabled={!body.trim() || busy === "create"} onClick={create}>
              {busy === "create" ? "Saving…" : "Save note"}
            </button>
          </div>
        </div>

        {/* List */}
        <ul className="space-y-3 p-3">
          {list.length === 0 && (
            <li className="py-10 text-center text-sm text-zinc-500">
              {tab === "mine" ? "No private notes yet." : "Nobody has shared a note yet."}
            </li>
          )}
          {list.map((n) => {
            const isMine = n.authorId === state.me.id;
            const canDelete = isMine || (n.visibility === "PUBLIC" && state.me.isHost);
            const isEditing = editing?.id === n.id;
            return (
              <li key={n.id} className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-3">
                <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                  {n.visibility === "PUBLIC" && (
                    <>
                      <ColorDot color={n.authorColor} />
                      <span className="font-semibold text-zinc-200">{isMine ? "You" : n.authorName}</span>
                    </>
                  )}
                  <span>{relativeTime(n.createdAt, now)}</span>
                  <TagBadge tag={n.fragmentTag} />
                </div>

                {isEditing ? (
                  <div className="space-y-3">
                    <textarea
                      value={editing.body}
                      onChange={(e) => setEditing({ ...editing, body: e.target.value })}
                      rows={3}
                      maxLength={2000}
                      className="w-full resize-y rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-base focus:border-amber-500 focus:outline-none"
                    />
                    <TagChips value={editing.tag} onChange={(t) => setEditing({ ...editing, tag: t })} />
                    <div className="flex gap-2">
                      <button className={btnPrimary} onClick={saveEdit} disabled={busy === `edit-${n.id}`}>
                        Save
                      </button>
                      <button className={btnGhost} onClick={() => setEditing(null)}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed text-zinc-100">{n.body}</p>
                )}

                {!isEditing && (isMine || canDelete) && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {isMine && n.visibility === "PRIVATE" && (
                      <button className={btnPrimary} onClick={() => share(n)} disabled={busy === `share-${n.id}`}>
                        Share to room
                      </button>
                    )}
                    {isMine && n.visibility === "PUBLIC" && (
                      <button className={btnGhost} onClick={() => makePrivate(n)} disabled={busy === `share-${n.id}`}>
                        Make private
                      </button>
                    )}
                    {isMine && (
                      <button
                        className={btnGhost}
                        onClick={() => setEditing({ id: n.id, body: n.body, tag: n.fragmentTag })}
                      >
                        Edit
                      </button>
                    )}
                    {canDelete && (
                      <button className={btnDanger} onClick={() => remove(n)} disabled={busy === `del-${n.id}`}>
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
