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
import esCommon from "./es/common";
import esSite from "./es/site";
import esShell from "./es/shell";
import esRoom from "./es/room";
import esApps from "./es/apps";
import esBrowser from "./es/browser";
import esAdmin from "./es/admin";
import esApi from "./es/api";
import jaCommon from "./ja/common";
import jaSite from "./ja/site";
import jaShell from "./ja/shell";
import jaRoom from "./ja/room";
import jaApps from "./ja/apps";
import jaBrowser from "./ja/browser";
import jaAdmin from "./ja/admin";
import jaApi from "./ja/api";
import ptCommon from "./pt-BR/common";
import ptSite from "./pt-BR/site";
import ptShell from "./pt-BR/shell";
import ptRoom from "./pt-BR/room";
import ptApps from "./pt-BR/apps";
import ptBrowser from "./pt-BR/browser";
import ptAdmin from "./pt-BR/admin";
import ptApi from "./pt-BR/api";
import enBoard from "./en/board";
import koBoard from "./ko/board";
import zhBoard from "./zh-TW/board";
import esBoard from "./es/board";
import jaBoard from "./ja/board";
import ptBoard from "./pt-BR/board";
import enTrain from "./en/train";
import koTrain from "./ko/train";
import zhTrain from "./zh-TW/train";
import esTrain from "./es/train";
import jaTrain from "./ja/train";
import ptTrain from "./pt-BR/train";
import enTour from "./en/tour";
import koTour from "./ko/tour";
import zhTour from "./zh-TW/tour";
import esTour from "./es/tour";
import jaTour from "./ja/tour";
import ptTour from "./pt-BR/tour";
import enAtlas from "./en/atlas";
import koAtlas from "./ko/atlas";
import zhAtlas from "./zh-TW/atlas";
import esAtlas from "./es/atlas";
import jaAtlas from "./ja/atlas";
import ptAtlas from "./pt-BR/atlas";
import enProfile from "./en/profile";
import koProfile from "./ko/profile";
import zhProfile from "./zh-TW/profile";
import esProfile from "./es/profile";
import jaProfile from "./ja/profile";
import ptProfile from "./pt-BR/profile";
import enResult from "./en/result";
import koResult from "./ko/result";
import zhResult from "./zh-TW/result";
import esResult from "./es/result";
import jaResult from "./ja/result";
import ptResult from "./pt-BR/result";

export type Messages = Record<string, string>;

const en: Messages = { ...enResult, ...enAtlas, ...enProfile, ...enTrain, ...enBoard, ...enTour, ...enCommon, ...enSite, ...enShell, ...enRoom, ...enApps, ...enBrowser, ...enAdmin, ...enApi };
const ko: Messages = { ...koResult, ...koAtlas, ...koProfile, ...koTrain, ...koBoard, ...koTour, ...koCommon, ...koSite, ...koShell, ...koRoom, ...koApps, ...koBrowser, ...koAdmin, ...koApi };

const zhTW: Messages = { ...zhResult, ...zhAtlas, ...zhProfile, ...zhTrain, ...zhBoard, ...zhTour, ...zhCommon, ...zhSite, ...zhShell, ...zhRoom, ...zhApps, ...zhBrowser, ...zhAdmin, ...zhApi };

const es: Messages = { ...esResult, ...esAtlas, ...esProfile, ...esTrain, ...esBoard, ...esTour, ...esCommon, ...esSite, ...esShell, ...esRoom, ...esApps, ...esBrowser, ...esAdmin, ...esApi };

const ja: Messages = { ...jaResult, ...jaAtlas, ...jaProfile, ...jaTrain, ...jaBoard, ...jaTour, ...jaCommon, ...jaSite, ...jaShell, ...jaRoom, ...jaApps, ...jaBrowser, ...jaAdmin, ...jaApi };

const ptBR: Messages = { ...ptResult, ...ptAtlas, ...ptProfile, ...ptTrain, ...ptBoard, ...ptTour, ...ptCommon, ...ptSite, ...ptShell, ...ptRoom, ...ptApps, ...ptBrowser, ...ptAdmin, ...ptApi };

export const MESSAGES: Record<Locale, Messages> = { en, ko, "zh-TW": zhTW, es, ja, "pt-BR": ptBR };
