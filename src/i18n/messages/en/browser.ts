const messages = {
  // Browser chrome
  "browser.toolbar.back": "Back",
  "browser.toolbar.forward": "Forward",
  "browser.toolbar.address": "Address",
  "browser.toolbar.addressPlaceholder": "Enter address",
  "browser.toolbar.reload": "Reload",
  "browser.toolbar.menu": "Bookmarks and tools",
  "browser.toolbar.loading": "Loading…",
  "browser.toolbar.bookmark": "Bookmark",
  "browser.toolbar.bookmarked": "Bookmarked",
  "browser.toolbar.bookmarkRemoved": "Bookmark removed",
  "browser.toolbar.viewSource": "View Source",
  "browser.menu.bookmarks": "Bookmarks",
  "browser.menu.removeBookmark": "Remove bookmark {title}",
  "browser.menu.empty": "No bookmarks yet.",
  "browser.menu.bookmarkThisPage": "Bookmark this page",
  "browser.loading.connecting": "Connecting to {address}…",
  "browser.error.title": "This site can't be reached",
  "browser.error.unreachable": "<addr>{address}</addr>’s server IP address could not be found.",
  "browser.error.timeout": "<addr>{address}</addr> took too long to respond.",
  "browser.newTab.title": "New Tab",

  // View Source
  "browser.source.dialog": "Page source",

  // Site renderer chrome
  "browser.fileInfo.button": "ⓘ File Info",
  "browser.fileInfo.title": "File Info",
  "browser.fileInfo.close": "Close file info",
  "browser.fileInfo.filename": "Filename",
  "browser.fileInfo.author": "Author",
  "browser.fileInfo.camera": "Camera",
  "browser.fileInfo.date": "Date",
  "browser.fileInfo.dimensions": "Dimensions",
  "browser.fileInfo.comment": "Comment",
  "browser.redacted.hidden": "Redacted text. Tap to reveal.",
  "browser.redacted.revealed": "Revealed: {text}",

  // In-site forms: game-system feedback only (site labels stay English)
  "browser.form.cooling": "Too many attempts. The system is cooling down.",
  "browser.form.connectionError": "Connection error. Try again.",
  "browser.form.accepted": "Accepted.",
  "browser.form.correct": "Correct!",
  "browser.form.rejected": "Rejected. That's not it.",
  "browser.form.retryIn": "Retry in {s}s.",
  "browser.form.decreaseShift": "Decrease shift",
  "browser.form.increaseShift": "Increase shift",
  "browser.form.shiftSolved": "✓ Listings decoded for the whole room.",
  "browser.form.lockNote": "Careful: a wrong key locks the system for everyone for 1 minute. Work it out first.",
  "browser.form.locked": "Locked · {s}s",
  "browser.form.binaryPassed": "✓ Passed. Open the Decoder and look for the Binary tab.",
} as const;

export default messages;
