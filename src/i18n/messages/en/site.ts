const messages = {
  // Directory card / game info (English fallbacks also live in src/lib/games.ts)
  "site.game.ada-voss.title": "The Vanishing of Dr. Ada Voss",
  "site.game.ada-voss.tagline": "An archivist is missing. Her laptop is still warm.",
  "site.game.ada-voss.blurb":
    "Dr. Ada Voss vanished forty-eight hours ago, after getting too close to something at the Meridian Institute. Dig through her email, files and six corners of a fake internet to find out what she found, and what happened to her.",
  "site.game.ada-voss.players": "Solo or up to 16",
  "site.game.ada-voss.duration": "60–90 min",
  "site.game.ada-voss.difficulty": "Medium",
  "site.game.ada-voss.tone": "Noir mystery",

  // Directory
  "site.directory.eyebrow": "Online escape rooms",
  "site.directory.intro": "Puzzle mysteries you solve together, each on your own phone. Pick a case, invite your crew, and get out.",
  "site.directory.casesHeading": "Cases",
  "site.directory.comingSoon": "Coming soon",
  "site.directory.openCase": "Open the case →",
  "site.directory.playAria": "Play {title}",
  "site.directory.moreCases": "More cases are being written.",
  "site.directory.moreCasesHint": "Sign in to keep your times when they open.",
  "site.directory.footer": "Works of fiction. Rooms go cold after 48 hours.",
  "site.join.label": "Have a room code?",
  "site.join.button": "Join",
  "site.join.invalidCode": "Room codes look like ADA-7K2Q.",

  // Shared form bits
  "site.form.yourName": "Your name",
  "site.form.avatarColor": "Avatar color",
  "site.form.colorAria": "Color {color}",
  "site.form.joinInvestigation": "Join the investigation",
  "site.allRooms": "All escape rooms",
  "site.error.network": "Network trouble. Try again.",

  // Ada landing
  "site.ada.back": "← All escape rooms",
  "site.ada.caseFile": "Case file 0412",
  "site.ada.heading": "<line>The Vanishing of</line><accent>Dr. Ada Voss</accent>",
  "site.ada.intro":
    "Ada Voss, archivist at the Meridian Institute, vanished forty-eight hours ago. Her sister hired you. All you have is Ada's laptop, still warm, and one last message:",
  "site.ada.quote": "If you're reading this, I got too close. Start at the beginning.",
  "site.ada.solo": "Play solo or bring a crew. Best on a phone, with friends on theirs.",
  "site.ada.tabCreate": "Create room",
  "site.ada.tabJoin": "Join with code",
  "site.ada.roomCode": "Room code",
  "site.ada.namePlaceholder": "Investigator",
  "site.ada.errName": "Give yourself a name, investigator.",
  "site.ada.errPurchase": "Enter a purchase code to host this case.",
  "site.ada.errSignIn": "Sign in with Google to host a room.",
  "site.ada.errNoRoom": "No such room. It may have gone cold (rooms expire after 48h).",
  "site.ada.errGeneric": "Something went wrong.",
  "site.ada.signInToHost": "Sign in with Google to host",
  "site.ada.hostsSignIn": "Hosts sign in. Friends can join with just a name.",
  "site.ada.opening": "Opening the laptop…",
  "site.ada.openCase": "Open the case",
  "site.ada.footer": "A work of fiction. Rooms go cold after 48 hours.",

  // Account bar and My cases
  "site.account.signedInAs": "Signed in as <b>{name}</b>",
  "site.account.admin": "Admin",
  "site.account.signOut": "Sign out",
  "site.account.nudge": "Sign in to keep your cases and times, and pick up on any device.",
  "site.account.signIn": "Sign in",
  "site.cases.heading": "My cases",
  "site.cases.roomMeta":
    "{title} · {count, plural, one {# player} other {# players}}{host, select, true { · host} other {}} · {status, select, playing {in progress} voting {voting} finished {finished} other {{status}}}",
  "site.cases.rejoin": "Rejoin →",
  "site.cases.colCase": "Case",
  "site.cases.colTime": "Time",
  "site.cases.colEnding": "Ending",
  "site.cases.caseMeta": "{date} · {count, plural, one {# player} other {# players}}",
  "site.cases.ending": "{ending, select, EXPOSE {expose} PROTECT {protect} other {—}}",

  // Redeem box (inside the Ada landing form)
  "site.redeemBox.needsCode": "Hosting <b>{title}</b> needs a purchase code.",
  "site.redeemBox.failed": "Couldn't redeem that code.",
  "site.redeemBox.alreadyOwned": "You already own {title}.",
  "site.redeemBox.unlocked": "Unlocked {title}. It's yours for good.",
  "site.redeemBox.codeAria": "Purchase code",
  "site.redeemBox.unlock": "Unlock",
  "site.redeemBox.note": "A code unlocks hosting on your account permanently. Joining a friend's room is always free.",

  // Replace room dialog
  "site.replace.warning": "Warning",
  "site.replace.title": "{count, plural, one {You already have an open room} other {You already have # open rooms}}",
  "site.replace.roomMeta":
    "{title} · {status, select, playing {in progress} voting {voting on the ending} finished {finished} other {{status}}} · {count, plural, one {# player} other {# players}}",
  "site.replace.desc":
    "Starting a new room will <b>permanently delete {count, plural, one {this room} other {these rooms}} right away</b>, including progress, notes and the attempt log.",
  "site.replace.others": "{others, plural, one {The other player will be removed.} other {The # other players will be removed.}}",
  "site.replace.kept": "Finished-case times already saved to your account are kept.",
  "site.replace.deleting": "Deleting…",
  "site.replace.confirmOne": "Delete {code} and start a new room",
  "site.replace.confirmMany": "Delete them and start a new room",
  "site.replace.rejoin": "Rejoin {code} instead",

  // /redeem landing
  "site.redeem.missingCode": "This link is missing its code. Ask whoever gave it to you for a new one.",
  "site.redeem.checking": "Checking your account…",
  "site.redeem.invite":
    "You've been given a free escape room. Sign in with Google and it's added to your account for good, so you can host it for your friends.",
  "site.redeem.signIn": "Sign in with Google to claim",
  "site.redeem.claiming": "Claiming {code}…",
  "site.redeem.alreadyOwnedTitle": "You already own it",
  "site.redeem.okTitle": "It's yours",
  "site.redeem.alreadyOwnedBody": "{title} is already on your account, so this code wasn't used. Pass it on to a friend.",
  "site.redeem.okBody": "{title} is now on your account ({account}). Host it whenever you like.",
  "site.redeem.host": "Host {title} →",
  "site.redeem.failedTitle": "Couldn't claim it",
  "site.redeem.signedInAs": "Signed in as {account}.",
  "site.redeem.networkReload": "Network trouble. Reload to try again.",

  // /r/[code] join, loading and closed screens
  "site.room.booting": "Booting Ada's laptop…",
  "site.room.serverError": "Server error ({status})",
  "site.room.networkError": "Network error",
  "site.room.closedTitle": "This room is closed",
  "site.room.closedBody": "The trail has gone cold. The host may have started a new room, or it sat idle for 48 hours.",
  "site.room.caseFile": "Case file",
  "site.room.invited": "You've been invited to investigate in room {code}.",
  "site.room.namePlaceholder": "e.g. Marlowe",
  "site.room.errName": "Pick a name so the others know who you are.",
  "site.room.errJoin": "Couldn't join the room. Try again.",
  "site.room.joining": "Joining…",
  "site.room.optionalSignIn": "Optional: keep your progress and times, and rejoin from any device.",
  "site.room.signInGoogle": "Sign in with Google",
  "site.room.signedInAs": "Signed in as {name}. You'll join as yourself.",
} as const;

export default messages;
