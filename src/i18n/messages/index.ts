// Message catalogs, merged per locale. Each area has an en/<area>.ts (source of truth) and a
// ko/<area>.ts typed as Record<keyof typeof en, string>, so a missing Korean string fails typecheck.
// To add a language: add it to LOCALES in ../config.ts and add a folder of area files here.
import type { Locale } from "../config";
import enCommon from "./en/common";
import koCommon from "./ko/common";
import enSite from "./en/site";
import koSite from "./ko/site";
import enShell from "./en/shell";
import koShell from "./ko/shell";
import enRoom from "./en/room";
import koRoom from "./ko/room";
import enApps from "./en/apps";
import koApps from "./ko/apps";
import enBrowser from "./en/browser";
import koBrowser from "./ko/browser";
import enAdmin from "./en/admin";
import koAdmin from "./ko/admin";
import enApi from "./en/api";
import koApi from "./ko/api";

import zhCommon from "./zh-TW/common";
import zhSite from "./zh-TW/site";
import zhShell from "./zh-TW/shell";
import zhRoom from "./zh-TW/room";
import zhApps from "./zh-TW/apps";
import zhBrowser from "./zh-TW/browser";
import zhAdmin from "./zh-TW/admin";
import zhApi from "./zh-TW/api";

export type Messages = Record<string, string>;

const en: Messages = { ...enCommon, ...enSite, ...enShell, ...enRoom, ...enApps, ...enBrowser, ...enAdmin, ...enApi };
const ko: Messages = { ...koCommon, ...koSite, ...koShell, ...koRoom, ...koApps, ...koBrowser, ...koAdmin, ...koApi };

const zhTW: Messages = { ...zhCommon, ...zhSite, ...zhShell, ...zhRoom, ...zhApps, ...zhBrowser, ...zhAdmin, ...zhApi };

export const MESSAGES: Record<Locale, Messages> = { en, ko, "zh-TW": zhTW };
