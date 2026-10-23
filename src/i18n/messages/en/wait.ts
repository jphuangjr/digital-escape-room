// Loading and waiting: the room page's themed loaders and the rotating tips shown while a team gathers.
// Tips stay spoiler-free: how to play together, never what to do.
const messages = {
  "wait.tips.label": "While you wait",
  "wait.tips.gathering": "Waiting for your team? Share the code or the QR code below.",

  "wait.ada.boot1": "Power-on self test… ok",
  "wait.ada.boot2": "Mounting /home/ada… ok",
  "wait.ada.boot3": "Restoring last session…",
  "wait.ada.tip1": "Everyone sees the same laptop. Split up: one of you reads the email while another explores the files.",
  "wait.ada.tip2": "Anything one of you unlocks opens for the whole room at once.",
  "wait.ada.tip3": "Read slowly. Names, dates and odd turns of phrase tend to matter later.",
  "wait.ada.tip4": "Notes are private until you share them. Send the good finds to the room.",
  "wait.ada.tip5": "Stuck? Ask Ada for a hint from Room. It arrives as a voicemail for everyone.",

  "wait.train.departures": "Departures",
  "wait.train.platform": "Platform {n}",
  "wait.train.status": "Now boarding",
  "wait.train.tip1": "Take a wall each and call out what you see. Every room has four.",
  "wait.train.tip2": "Whatever anyone picks up is shared with the whole team.",
  "wait.train.tip3": "Try your things on each other. Two ordinary objects can make something useful.",
  "wait.train.tip4": "Three wrong codes in a row jam a lock for a minute, so check what's been tried first.",
  "wait.train.tip5": "Stuck? Ring for Teodor. The night porter's notes get clearer one at a time.",

  "wait.atlas.tip1": "You don't have to stay together. Spread out and report back in the chat.",
  "wait.atlas.tip2": "Everything you read is copied into your notebook, so you can check a clue without walking back.",
  "wait.atlas.tip3": "Whatever anyone finds is shared with the whole team.",
  "wait.atlas.tip4": "Three wrong tries in a row jam a lock for a minute, so check what's been tried first.",
  "wait.atlas.tip5": "Stuck? The Cartographer's notes help with the place where you're standing.",
} as const;

export default messages;
