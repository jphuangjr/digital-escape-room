import type en from "../en/browser";

const messages: Record<keyof typeof en, string> = {
  // Browser chrome
  "browser.toolbar.back": "뒤로",
  "browser.toolbar.forward": "앞으로",
  "browser.toolbar.address": "주소",
  "browser.toolbar.addressPlaceholder": "주소 입력",
  "browser.toolbar.reload": "새로고침",
  "browser.toolbar.menu": "북마크 및 도구",
  "browser.toolbar.loading": "불러오는 중…",
  "browser.toolbar.bookmark": "북마크",
  "browser.toolbar.bookmarked": "북마크됨",
  "browser.toolbar.bookmarkRemoved": "북마크를 삭제했어요",
  "browser.toolbar.viewSource": "소스 보기",
  "browser.menu.bookmarks": "북마크",
  "browser.menu.removeBookmark": "{title} 북마크 삭제",
  "browser.menu.empty": "아직 북마크가 없어요.",
  "browser.menu.bookmarkThisPage": "이 페이지 북마크",
  "browser.loading.connecting": "{address}에 연결하는 중…",
  "browser.error.title": "사이트에 연결할 수 없어요",
  "browser.error.unreachable": "<addr>{address}</addr>의 서버 IP 주소를 찾을 수 없어요.",
  "browser.error.timeout": "<addr>{address}</addr>에서 응답하는 데 시간이 너무 오래 걸려요.",
  "browser.newTab.title": "새 탭",

  // View Source
  "browser.source.dialog": "페이지 소스",

  // Site renderer chrome
  "browser.fileInfo.button": "ⓘ 파일 정보",
  "browser.fileInfo.title": "파일 정보",
  "browser.fileInfo.close": "파일 정보 닫기",
  "browser.fileInfo.filename": "파일 이름",
  "browser.fileInfo.author": "작성자",
  "browser.fileInfo.camera": "카메라",
  "browser.fileInfo.date": "날짜",
  "browser.fileInfo.dimensions": "크기",
  "browser.fileInfo.comment": "설명",
  "browser.redacted.hidden": "가려진 텍스트예요. 눌러서 확인하세요.",
  "browser.redacted.revealed": "드러난 내용: {text}",

  // In-site forms: game-system feedback only (site labels stay English)
  "browser.form.cooling": "시도 횟수가 너무 많아요. 잠시 기다려 주세요.",
  "browser.form.connectionError": "연결 오류가 발생했어요. 다시 시도해 주세요.",
  "browser.form.accepted": "통과했어요.",
  "browser.form.correct": "정답이에요!",
  "browser.form.rejected": "틀렸어요. 다시 생각해 보세요.",
  "browser.form.retryIn": "{s}초 후 다시 시도할 수 있어요.",
  "browser.form.decreaseShift": "이동 값 줄이기",
  "browser.form.increaseShift": "이동 값 늘리기",
  "browser.form.shiftSolved": "✓ 방 전체에 목록이 해독됐어요.",
  "browser.form.lockNote": "주의: 틀린 키를 넣으면 모두의 시스템이 1분 동안 잠겨요. 먼저 풀어 보세요.",
  "browser.form.locked": "잠김 · {s}초",
  "browser.form.binaryPassed": "✓ 통과했어요. 해독기를 열고 이진수 탭을 확인해 보세요.",
};

export default messages;
