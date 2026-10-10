"use client";

import type { AppId } from "@/lib/types";
import { APP_META, APP_ORDER, LockIcon, PeopleIcon } from "./icons";

export function Dock({
  active,
  isUnlocked,
  badges,
  onOpen,
  onRoom,
  onlineCount,
  chatUnread = 0,
}: {
  active: AppId | null;
  isUnlocked: (a: AppId) => boolean;
  badges: Partial<Record<AppId, number>>;
  onOpen: (a: AppId) => void;
  onRoom: () => void;
  onlineCount: number;
  chatUnread?: number;
}) {
  return (
    <nav
      aria-label="Dock"
      className="relative z-10 shrink-0 border-t border-stone-800 bg-stone-950/95 backdrop-blur md:hidden"
      style={{
        paddingBottom: "env(safe-area-inset-bottom)",
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
      }}
    >
      <ul className="flex items-stretch justify-around">
        {APP_ORDER.map((app) => {
          const { label, Icon } = APP_META[app];
          const locked = !isUnlocked(app);
          const badge = badges[app] ?? 0;
          const on = active === app;
          return (
            <li key={app} className="flex-1">
              <button
                onClick={() => onOpen(app)}
                aria-label={`${label}${locked ? " (locked)" : ""}${badge ? `, ${badge} unread` : ""}`}
                aria-current={on ? "page" : undefined}
                className={`flex min-h-14 w-full flex-col items-center justify-center gap-0.5 py-1.5 ${
                  on ? "text-amber-400" : locked ? "text-stone-600" : "text-stone-400"
                } active:bg-stone-900`}
              >
                <span className="relative">
                  <Icon className="h-6 w-6" />
                  {locked && <LockIcon className="absolute -bottom-1 -right-2 h-3.5 w-3.5 text-stone-500" />}
                  {badge > 0 && (
                    <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white">
                      {badge}
                    </span>
                  )}
                </span>
                <span className="text-[10px] tracking-wide">{label}</span>
                {on && <span aria-hidden className="mt-0.5 h-0.5 w-5 rounded bg-amber-400" />}
              </button>
            </li>
          );
        })}
        <li className="flex-1">
          <button
            onClick={onRoom}
            aria-label={`Room: ${onlineCount} online${chatUnread ? `, ${chatUnread} unread messages` : ""}`}
            className="flex min-h-14 w-full flex-col items-center justify-center gap-0.5 py-1.5 text-stone-400 active:bg-stone-900"
          >
            <span className="relative">
              <PeopleIcon className="h-6 w-6" />
              <span
                className={`absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none text-white ${
                  chatUnread ? "bg-red-600" : "bg-emerald-600"
                }`}
              >
                {chatUnread ? (chatUnread > 9 ? "9+" : chatUnread) : onlineCount}
              </span>
            </span>
            <span className="text-[10px] tracking-wide">Room</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
