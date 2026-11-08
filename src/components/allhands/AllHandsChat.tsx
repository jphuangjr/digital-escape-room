"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { PlayerPublic, RoomState } from "@/lib/types";
import { apiFetch, type GameCtx } from "@/lib/client/game";
import { useChat } from "@/lib/client/chat";
import { ChatPanel } from "@/components/apps/ChatPanel";
import type { AllHandsView, MoleChatMessage } from "@/lib/allhands/types";

type Tab = "team" | "moles";

const seenKey = (code: string) => `ah_mole_seen_${code}`;

/**
 * All Hands chat: a floating button that opens a sheet with the team chat (the room's ordinary chat, which everyone
 * can read) and, for Moles, a private back channel. Mole messages live in the game state and reach a phone only in
 * its own state response, so the realtime channel never carries them.
 */
export function AllHandsChat({
  code,
  state,
  party,
  refresh,
  people,
  meId,
}: {
  /** Whose seat this phone is showing (a bot's, in an admin's test room). */
  meId: string;
  code: string;
  state: RoomState;
  party: AllHandsView;
  refresh: () => Promise<void>;
  people: Map<string, PlayerPublic>;
}) {
  const chat = useChat(code, state.me.id, state.me.blocked);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("team");
  const moles = party.moleChat;
  const hasMoles = moles !== null;
  // Mid-game, new Mole messages open the sheet on the back channel.
  const live = party.phase !== "lobby" && party.phase !== "over";
  useEffect(() => {
    if (!hasMoles) setTab("team");
  }, [hasMoles]);

  // Unread Mole messages: counted against the last one this phone has shown (per room).
  const [seen, setSeen] = useState<string>("");
  useEffect(() => {
    try {
      setSeen(localStorage.getItem(seenKey(code)) ?? "");
    } catch {}
  }, [code]);
  const lastMole = moles?.length ? moles[moles.length - 1] : null;
  const moleUnread = moles ? moles.filter((m) => m.from !== meId && m.at > seen).length : 0;
  const showingMoles = open && tab === "moles";
  useEffect(() => {
    if (!showingMoles || !lastMole || lastMole.at <= seen) return;
    setSeen(lastMole.at);
    try {
      localStorage.setItem(seenKey(code), lastMole.at);
    } catch {}
  }, [showingMoles, lastMole, seen, code]);

  const ctx = useMemo(
    () => ({ code, state, refresh, api: (path: string, init?: { method?: string; body?: unknown }) => apiFetch(code, path, init) }) as unknown as GameCtx,
    [code, state, refresh],
  );

  const badge = (open && tab === "team" ? 0 : chat.unread) + (showingMoles ? 0 : moleUnread);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (!open && hasMoles && live && moleUnread > 0) setTab("moles");
          setOpen(true);
        }}
        aria-label={badge ? `Chat, ${badge} unread` : "Chat"}
        className="fixed bottom-4 right-4 z-30 flex h-14 items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-5 font-semibold text-slate-100 shadow-lg shadow-black/50 active:bg-slate-800"
        style={{ marginBottom: "env(safe-area-inset-bottom)" }}
      >
        <span aria-hidden>💬</span> Chat
        {badge > 0 && (
          // One color for every badge: a red one would out a Mole to anyone glancing at their phone.
          <span className="rounded-full bg-lime-300 px-2 py-0.5 text-xs font-bold text-slate-950">
            {badge}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-40 flex flex-col justify-end bg-black/60" onClick={() => setOpen(false)}>
          <div
            role="dialog"
            aria-label="Chat"
            onClick={(e) => e.stopPropagation()}
            className="mx-auto flex h-[80dvh] w-full max-w-xl flex-col rounded-t-2xl border border-slate-800 bg-slate-950 px-4 pt-3"
            style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0.75rem)" }}
          >
            <div className="mb-3 flex items-center gap-2">
              <div className="flex flex-1 gap-1 rounded-xl bg-slate-900 p-1">
                <TabButton active={tab === "team"} onClick={() => setTab("team")}>
                  #general {tab !== "team" && chat.unread > 0 && <Dot tone="bg-lime-300" />}
                </TabButton>
                {hasMoles && (
                  <TabButton active={tab === "moles"} onClick={() => setTab("moles")} tone="rose">
                    🕵️ Moles only {tab !== "moles" && moleUnread > 0 && <Dot tone="bg-rose-500" />}
                  </TabButton>
                )}
              </div>
              <button type="button" onClick={() => setOpen(false)} className="min-h-11 rounded-lg px-3 text-sm text-slate-400 active:bg-slate-800">
                Close
              </button>
            </div>
            <div className="flex min-h-0 flex-1 flex-col">
              {tab === "team" ? (
                <>
                  <p className="mb-2 text-xs text-slate-500">Everyone in the room can read this. Moles too, so keep your poker face.</p>
                  <ChatPanel
                    ctx={ctx}
                    chat={chat}
                    readOnly={party.canTeamChat ? undefined : "You're out, so you can read along but not post until the game ends."}
                  />
                </>
              ) : (
                <MoleChannel code={code} party={party} meId={meId} people={people} refresh={refresh} />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function TabButton({ active, onClick, tone, children }: { active: boolean; onClick: () => void; tone?: "rose"; children: React.ReactNode }) {
  const on = tone === "rose" ? "bg-rose-500/20 text-rose-200" : "bg-slate-700 text-slate-100";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-lg text-sm font-semibold ${active ? on : "text-slate-400"}`}
    >
      {children}
    </button>
  );
}

function Dot({ tone }: { tone: string }) {
  return <span aria-hidden className={`inline-block h-2 w-2 rounded-full ${tone}`} />;
}

const MAX = 500;

/** The Moles' back channel. Posting goes through the game itself, so only living Moles can, and only mid-game. */
function MoleChannel({
  code,
  party,
  meId,
  people,
  refresh,
}: {
  code: string;
  party: AllHandsView;
  meId: string;
  people: Map<string, PlayerPublic>;
  refresh: () => Promise<void>;
}) {
  const messages: MoleChatMessage[] = party.moleChat ?? [];
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  async function send() {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    setError(null);
    const res = await apiFetch<{ error?: string }>(code, "/party", { body: { type: "moleChat", body } });
    setSending(false);
    if (res.ok) setDraft("");
    else setError(res.data?.error ?? "That didn't send. Try again.");
    await refresh();
  }

  const me = party.me;
  const solo = party.seats.filter((x) => x.role === "mole").length === 1;
  const note = party.canMoleChat
    ? solo
      ? "You're the only Mole this game, so it's just you in here. Notes to self are fine."
      : "Only Moles see this. Nobody else's phone gets these messages."
    : party.phase === "over"
      ? "Game over: here's everything the Moles said."
      : me.seated && !me.alive
        ? me.role === "mole"
          ? "You're out. You can read your team's channel, but not post."
          : "You're out, so you get to read the Moles' channel. Don't tell anyone."
        : "Only Moles see this.";

  return (
    <div className="flex h-full min-h-0 flex-col">
      <p className="mb-2 rounded-lg border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-xs text-rose-200">{note}</p>
      <div ref={listRef} className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain pb-2">
        {messages.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">
            Nothing yet. Pick a target together, or agree on who to throw under the bus at the all-hands.
          </p>
        ) : (
          messages.map((m, i) => {
            const mine = m.from === meId;
            const showName = !mine && messages[i - 1]?.from !== m.from;
            return (
              <div key={m.id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
                {showName && <span className="mb-0.5 text-xs text-rose-300/80">{people.get(m.from)?.displayName ?? "A Mole"}</span>}
                <div
                  className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm ${
                    mine ? "bg-rose-500 text-white" : "bg-slate-800 text-slate-100"
                  }`}
                >
                  {m.body}
                </div>
              </div>
            );
          })
        )}
      </div>
      {party.canMoleChat && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
          className="shrink-0 border-t border-slate-800 pt-2"
        >
          {error && (
            <p role="alert" className="mb-1 text-xs text-rose-400">
              {error}
            </p>
          )}
          <div className="flex items-end gap-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value.slice(0, MAX))}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  void send();
                }
              }}
              rows={1}
              placeholder="Whisper to the other Moles…"
              aria-label="Message the other Moles"
              enterKeyHint="send"
              className="max-h-28 min-h-11 min-w-0 flex-1 resize-none rounded-xl border border-slate-700 bg-black px-3 py-2.5 text-base text-slate-100 outline-none placeholder:text-slate-600 focus:border-rose-400"
            />
            <button
              type="submit"
              disabled={sending || !draft.trim()}
              className="min-h-11 shrink-0 rounded-xl bg-rose-500 px-4 font-semibold text-white active:bg-rose-400 disabled:opacity-40"
            >
              Send
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
