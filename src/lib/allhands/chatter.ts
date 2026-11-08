// Anonymous coworker chatter under the layoff and firing announcements in All Hands.
//
// The server picks a pool and an entry (see pickChatter) and stores only those numbers in the game state,
// so every phone shows the same thread. Which pool is used must never tell players more than the game
// already does: Moles can't be laid off at night, so night layoffs always use "framed"; at the performance
// review the role-specific pools are used only when the fired player's role is revealed anyway.

import { isMoleRole, type Role } from "./types";

export type ChatterPool =
  /** Laid off overnight. Always an innocent coworker: the Moles can't lay off their own. */
  | "framed"
  /** Fired at review, revealed as a Mole. */
  | "caught"
  /** Fired at review, revealed as not a Mole. */
  | "wronged"
  /** Fired at review with role reveals off: says nothing about the role. */
  | "mystery"
  /** Fired at review, revealed as the Burnt-out Employee (who wanted this). */
  | "burnout"
  /** The Founder's Nephew was voted out and is somehow still here. */
  | "nephew";

/** A chatter thread as stored in the game state and sent in views. */
export interface Chatter {
  pool: ChatterPool;
  /** Index into the pool. */
  i: number;
  /** One anonymous author per line, as indexes into ANON_NAMES. */
  who: number[];
}

/** Anonymous handles, Google Docs style. */
export const ANON_NAMES = [
  "Anonymous Capybara",
  "Anonymous Axolotl",
  "Anonymous Platypus",
  "Anonymous Narwhal",
  "Anonymous Llama",
  "Anonymous Otter",
  "Anonymous Quokka",
  "Anonymous Pangolin",
  "Anonymous Raccoon",
  "Anonymous Moose",
  "Anonymous Flamingo",
  "Anonymous Hedgehog",
  "Anonymous Walrus",
  "Anonymous Lemur",
  "Anonymous Badger",
  "Anonymous Pelican",
  "Anonymous Wombat",
  "Anonymous Goose",
  "Anonymous Iguana",
  "Anonymous Tapir",
  "Anonymous Yak",
  "Anonymous Ferret",
  "Anonymous Manatee",
  "Anonymous Koala",
] as const;

// Each entry is a short thread, one line per anonymous coworker. {name} is the player who left.
export const CHATTER: Record<ChatterPool, readonly (readonly string[])[]> = {
  framed: [
    ["Heard {name} got blamed for the fish in the office microwave.", "They're vegan.", "Framed. Textbook."],
    ["Apparently someone used {name}'s login to reply-all to the entire company.", "With a GIF?", "With FOUR GIFs."],
    [
      "So {name} was let go for 'misusing the snack budget'.",
      "The receipt was for 600 LaCroix.",
      "Nobody drinks that much LaCroix. Somebody planted it.",
    ],
    [
      "HR says {name} unplugged the server rack to charge their phone.",
      "Didn't they have a dead phone all week though?",
      "Exactly. Who had a charged phone, hmm?",
    ],
    ["They found {name}'s badge in the CEO's parking spot.", "{name} takes the bus.", "Suspicious."],
    [
      "Word is {name} got pinned for the 'Please Don't Fire Me' shared doc.",
      "Edit history says it was 'Anonymous Mole'.",
      "Should HR... read that?",
    ],
    [
      "Legal says {name} put 'ninja rockstar' in a job posting.",
      "That posting went up before they were even hired.",
      "Yeah, this one smells.",
    ],
    [
      "{name} was blamed for the ping pong table going missing.",
      "They're 5'2\". That table weighs 300 pounds.",
      "Logistically impossible. Framed.",
    ],
    [
      "Someone set {name}'s Slack status to 'interviewing at Google lol'.",
      "{name} doesn't even know how to set a status.",
      "I watched them try once. It was sad.",
    ],
    ["Apparently {name} 'leaked the roadmap'.", "We have a roadmap?", "That's how you know it's fake."],
    [
      "They said {name} scheduled a recurring 7am meeting called 'Sync on the Sync'.",
      "{name} is never awake at 7am.",
      "Somebody wanted us to hate them.",
    ],
    [
      "Rumor is {name} deleted the prod database.",
      "{name} doesn't have prod access. I asked for it for them in March.",
      "Ticket's still open, by the way.",
    ],
    [
      "{name} got blamed for the Kombucha tap exploding.",
      "That thing was a war crime waiting to happen.",
      "And they picked {name} to take the fall.",
    ],
    ["Someone found {name}'s name on the 'Ideas for Layoffs' whiteboard.", "As the author?", "As the first idea."],
    [
      "Heard {name} was let go for 'quiet quitting'.",
      "They answered my Slack in 4 seconds yesterday.",
      "Too loud to be quiet quitting. Framed.",
    ],
    [
      "IT says {name} installed a crypto miner on the office smart fridge.",
      "The fridge has been warm for weeks.",
      "Yeah but {name} thinks Bitcoin is a Pokémon.",
    ],
    ["{name} got blamed for the 'reply all: STOP REPLYING ALL' chain.", "That was 300 people.", "And they picked one. Convenient."],
    [
      "Apparently {name} 'mispronounced the CEO's name on a client call'.",
      "It's spelled Jxsh. Nobody knows how to say it.",
      "Jxsh doesn't know how to say it.",
    ],
    ["The official reason for {name} is 'culture fit'.", "They organized the culture.", "They printed the culture on a mug."],
    ["They're saying {name} expensed a jet ski.", "The jet ski was in the Q3 offsite photos.", "With somebody ELSE on it."],
    [
      "{name} got pinned for the Wi‑Fi being called 'FBI Surveillance Van'.",
      "I mean that's just a classic.",
      "Still. Not their joke. Framed.",
    ],
    [
      "Heard {name} 'used AI to write their self-review'.",
      "Everyone used AI to write their self-review.",
      "Somebody snitched selectively.",
    ],
    ["The note on {name}'s desk says 'reassigned to a farm upstate'.", "We don't have a farm.", "We do now, apparently."],
    ["Apparently {name}'s calendar had a block called 'Do Nothing (Important)'.", "That's my calendar block.", "...Oh no."],
    [
      "Someone said {name} took the last oat milk and didn't replace it.",
      "That's a fireable offense honestly.",
      "It was a setup though. The carton was in MY bag.",
    ],
    ["{name} got blamed for the logo looking like a sad potato.", "The agency did the logo.", "The agency's cousin did the logo."],
    [
      "Heard {name} was 'caught' sleeping in a phone booth.",
      "That was a cardboard cutout of them.",
      "Who made a cardboard cutout of {name}??",
    ],
    [
      "Rumor: {name} printed 4,000 pages of memes on the color printer.",
      "The printer has been jammed since 2019.",
      "Nobody prints. Framed.",
    ],
    ["{name} was let go for 'not being on mute'.", "The barking was someone else's dog.", "{name} has a cat. Everyone knows."],
    [
      "Apparently {name} signed the CEO up for a pottery class as a prank.",
      "The CEO loved the pottery class.",
      "Still fired. Tough crowd.",
    ],
    ["Officially, {name} 'lacked synergy'.", "What does that even mean?", "It means somebody wanted them gone."],
    [
      "Heard {name} took credit for the new hire's deck.",
      "The new hire's deck was 3 slides of clip art.",
      "Nobody would take credit for that on purpose.",
    ],
    ["Someone used {name}'s Venmo to request money from the whole company.", "Memo: 'pizza??'", "I paid it honestly."],
    ["{name} got blamed for the standup going 2 hours.", "That was the PM doing a TED talk.", "PM was suspiciously quiet this morning…"],
    [
      "The rumor is {name} changed everyone's Zoom background to Nicolas Cage.",
      "I thought that was a company update.",
      "Honestly it was a morale boost.",
    ],
    [
      "IT found 'how to get fired gracefully' in {name}'s search history.",
      "That's not their history, that's the shared kiosk.",
      "Planted.",
    ],
    [
      "They blamed {name} for the 'Synergr Sux' graffiti in the bathroom.",
      "It was spelled correctly.",
      "{name} has never spelled Synergr correctly once.",
    ],
    [
      "Heard {name} accidentally CC'd a competitor on the pitch deck.",
      "{name} doesn't have the pitch deck.",
      "Somebody forwarded it 'as' them.",
    ],
    ["{name} was let go for 'excessive emoji use'.", "They only use 👍.", "Ruthless. And fake."],
    ["Apparently {name} 'stole' the CEO's standing desk.", "It's just raised.", "They raised a desk and got lowered."],
    ["Someone moved {name}'s stuff into a box labeled 'BYE' before HR even called.", "Who had a box ready?", "Asking the real questions."],
    [
      "The official reason is 'restructuring'. The unofficial reason is the potluck lasagna.",
      "That lasagna was store-bought.",
      "{name} didn't even bring the lasagna.",
    ],
    [
      "Word is {name} accidentally shared their screen during a 'job hunting' tab.",
      "That tab was in someone else's window.",
      "Zoom says the share came from Conference Room B.",
    ],
    ["{name} was let go for 'missing the vibe'.", "They WERE the vibe.", "Rest in peace to the vibe."],
    ["Heard {name} got blamed for the Slack bot that says 'k' to everything.", "I built that bot.", "Do NOT say that in #general."],
    ["They're saying {name} 'unsubscribed the CEO from his own newsletter'.", "That was the CEO.", "He clicked it himself and panicked."],
    [
      "Apparently {name} 'cut the line at the espresso machine'.",
      "That machine has no line. It's always broken.",
      "The cover story doesn't even make sense.",
    ],
    [
      "{name}'s laptop had a sticker that said 'ask me about my stock options'.",
      "That's every laptop here.",
      "Somebody needed a reason. Any reason.",
    ],
    ["Heard {name} tried to unionize the office plants.", "The plants deserve better.", "Framed, but the plants deserve better."],
    [
      "Someone logged {name} into the all-hands as 'Mole (not suspicious)'.",
      "Okay that one was obviously a setup.",
      "The Moles are getting cocky.",
    ],
  ],
  caught: [
    ["Security pulled {name} out of the CEO's office at 2am.", "Holding what?", "A USB stick labeled 'NOT THE ROADMAP'."],
    ["They found a second laptop in {name}'s desk. A rival startup's sticker on it.", "Wow.", "The sticker said 'Hiring! Ask {name}'."],
    ["{name} got caught forwarding the cap table to 'definitely_not_a_competitor@gmail.com'.", "Subtle.", "Real subtle."],
    ["Turns out {name} had a burner Slack account.", "Named what?", "'Totally Real Employee 2'."],
    ["IT caught {name} wiretapping the kombucha tap.", "Why the kombucha tap?", "That's where all the real conversations happen."],
    ["{name} was caught shredding documents.", "Which documents?", "The ones that said 'everyone gets equity'."],
    ["Apparently {name} had a calendar block called 'Sabotage (recurring)'.", "They didn't even make it private?", "Bold. Dumb, but bold."],
    ["Someone saw {name} whispering to the office fern.", "The fern had a wire in it.", "The fern was a microphone the whole time?!"],
    ["{name} was caught stealing the Wi‑Fi password.", "It's taped to the wall.", "Stealing it TO A COMPETITOR."],
    [
      "They caught {name} slowly unscrewing every chair in the conference room.",
      "That explains standup.",
      "My back has been through a lot.",
    ],
    ["{name}'s 'side project' was a clone of our app.", "With what name?", "Synergr 2: This Time It's Profitable."],
    ["Caught {name} in the server room, wearing a lanyard from three different startups.", "A collector.", "A corporate double agent."],
    ["Heard {name} was moving desks closer to whoever got laid off next.", "Every single time?", "Every. Single. Time."],
    ["{name} got caught renaming every Jira ticket to 'won't fix'.", "So that's why nothing ships.", "I thought that was just us."],
    [
      "The cameras caught {name} putting decaf in the espresso machine.",
      "For HOW long??",
      "Since onboarding. We've been running on placebo.",
    ],
    ["{name} was caught live-tweeting the board meeting.", "From the board meeting?", "From under the board meeting table."],
    ["They found {name}'s 'Who to Lay Off' spreadsheet.", "Who was on it?", "All of us. Color coded."],
    ["{name} got caught leaving fake 1-star Glassdoor reviews.", "How many?", "Four hundred. From 'a former employee'."],
    ["Apparently {name} had been CC'ing a Gmail on every single email.", "Whose Gmail?", "'moles.unite@gmail.com'."],
    ["{name} was caught training an AI on our Slack.", "To do what?", "To be more annoying than the PM. It's winning."],
    [
      "Heard {name} sabotaged the demo by unplugging the projector with their foot.",
      "It went dark right at the pricing slide.",
      "Right at the pricing slide!",
    ],
    ["Security caught {name} sneaking out with the company mascot.", "The inflatable llama?", "Fully inflated. Down the stairwell."],
    ["{name} was caught putting 'reply all' on the CEO's out-of-office.", "That explains the 900 auto-replies.", "Chaos agent."],
    [
      "They found {name}'s notebook. Every page says 'they suspect nothing'.",
      "We suspected everything.",
      "We suspected them on day one honestly.",
    ],
    ["{name} got caught moving the release date in the shared calendar.", "Every week?", "Every Friday at 4:59pm."],
    [
      "Turns out {name}'s 'standing desk' was a hollow box full of stolen staplers.",
      "THAT's where they went.",
      "I've been stapling with tape for months.",
    ],
    [
      "{name} was caught on the security cam doing a little evil dance after the last layoff.",
      "A dance?",
      "A little shimmy. Very incriminating.",
    ],
    ["Heard {name} was sending the competitor our snack orders.", "Why the snacks?", "To know our morale. It was low."],
    ["{name} got caught approving their own expense reports.", "Under whose name?", "'Head of Totally Not Moles'."],
    ["IT caught {name} with 47 browser tabs of 'how to act normal at work'.", "Did they act normal?", "Not even a little."],
    ["{name} was caught slipping onions into the fruit bowl.", "Psychological warfare.", "I bit one. I'm not okay."],
    [
      "The audit found {name} had been billing us for a 'mole removal service'.",
      "Wait.",
      "They were paying themselves to find themselves.",
    ],
    ["{name} got caught with the master keycard for every floor.", "There's only one floor.", "They had three copies."],
    [
      "Heard {name} was secretly booking every conference room so nobody could meet.",
      "So that's why it's always 'Booked by: ?'",
      "Yep. ? was {name}.",
    ],
    ["{name} was caught during the fire drill. Going IN.", "Toward the server room?", "Toward the server room."],
    ["The background check said {name} 'already works at three of our competitors'.", "At the same time?", "Hybrid, apparently."],
    ["{name} got caught editing the 'Values' poster.", "What did it say?", "'Integrity' was crossed out. 'Vibes' was written in."],
    ["Someone caught {name} talking to a pigeon on the balcony.", "Just talking?", "Handing it a tiny envelope."],
    [
      "{name} was caught with a trench coat and sunglasses. Indoors. In August.",
      "That's not proof.",
      "There was a nametag under the coat that said 'MOLE'.",
    ],
    ["Turns out {name}'s 'dentist appointments' were board meetings at a competitor.", "Every Tuesday?", "Their teeth must be immaculate."],
  ],
  wronged: [
    ["Wait, {name} wasn't even a Mole?", "Nope. Just bad at talking.", "We fired a guy for blinking too much."],
    ["Fun fact: {name}'s 'suspicious' behavior was a dentist appointment.", "We voted them out over a dentist appointment.", "Synergy."],
    ["So {name} was innocent.", "Yeah.", "Anyway, who's getting lunch?"],
    ["We fired {name} because they 'seemed shifty'.", "They had a cold.", "Shifty cold."],
    [
      "Turns out {name} was just nervous because it's their first week.",
      "We could have onboarded them.",
      "We onboarded them out the door.",
    ],
    ["The case against {name} was, and I quote, 'vibes'.", "The vibes were wrong.", "The vibes are always wrong."],
    ["{name} was clean. Someone owes them an apology.", "Who?", "All of us. Mostly the loudest one."],
    ["I voted for {name} because everyone else did.", "Same.", "So nobody actually suspected them?"],
    ["{name}'s 'alibi' was 'I was in the bathroom' and we didn't believe them.", "Were they?", "They were. For a long time. Poor {name}."],
    ["Can we talk about how {name} got fired for making eye contact?", "Too much eye contact.", "That's just confidence!"],
    ["Plot twist: {name} was the most loyal employee here.", "Their badge has a gold star on it.", "We fired the gold star."],
    ["The Moles are laughing at us right now.", "Out loud?", "In their secret chat probably. {name} deserved better."],
    ["{name} is innocent and I'll be wearing their lanyard in protest.", "That's my lanyard.", "Our lanyard. In protest."],
    ["We fired {name} for defending themselves too well.", "Too well??", "Suspiciously articulate."],
    ["RIP {name}. Fired for 'knowing too much about spreadsheets'.", "That was literally their job.", "In hindsight, yeah."],
    ["Someone tell {name}'s plant they're not coming back.", "It already knows.", "It's wilting out of solidarity."],
    ["So who convinced everyone it was {name}?", "Funny you should ask.", "Funny that THEY'RE suddenly quiet."],
    ["I knew {name} wasn't a Mole.", "You voted for them.", "I was hedging."],
    ["{name} gets fired, the real Mole gets a promotion. Love this place.", "Wait, who got promoted?", "Exactly. Think about it."],
    ["Fired: {name}. Crime: sneezed during the vote.", "It sounded like 'I'm the Mole'.", "It sounded like 'achoo'."],
    ["{name}'s exit interview was just them saying 'I told you' for five minutes.", "Fair.", "Very fair."],
    [
      "Turns out the 'suspicious tab' on {name}'s laptop was a recipe for banana bread.",
      "For the office?",
      "For US. We fired the banana bread person.",
    ],
    ["Petition to rehire {name}.", "There's no rehire button.", "There never is."],
    ["We were so sure about {name}.", "Were we though?", "We were confidently wrong, which is our brand."],
    ["{name} was so innocent the Moles probably sent flowers.", "With a card?", "'Thanks for your service. — Anonymous.'"],
    ["Hot take: {name} getting fired is the most Synergr thing that's ever happened.", "Bold claim.", "Remember the jet ski?"],
    ["Honestly, the Moles must love us.", "We do their job for them.", "Sorry {name}."],
    ["Who had {name} on their 'probably the Mole' list?", "Everyone.", "And everyone was wrong. Team building!"],
  ],
  mystery: [
    ["Bye {name}. Was it the right call?", "No idea. Badge got shredded.", "So we'll never know. Cool. Cool cool cool."],
    ["Anyone know what {name}'s badge said?", "HR shredded it before I could look.", "That's either very good or very bad."],
    ["{name} took it really calmly.", "Too calmly?", "I can't tell if that's innocent or evil."],
    ["Was {name} a Mole or did we just fire someone for talking too fast?", "Yes.", "That's not an answer."],
    [
      "{name} just winked on the way out.",
      "Winked like 'you got me' or winked like 'you idiots'?",
      "I'm going to be thinking about that wink for weeks.",
    ],
    ["They walked {name} out with a box and a smile.", "What was in the box?", "Mostly snacks. OUR snacks."],
    ["Okay, {name}'s gone. Do we feel safer?", "Not really.", "Me neither. Keep your doors locked."],
    ["{name} said 'you'll regret this' on the way out.", "Like a threat?", "Like a Yelp review."],
    ["So that's {name} done. Anyone else feel like we flipped a coin?", "We kind of did.", "A coin with feelings."],
    ["{name} left their mug.", "Check it for clues.", "It says 'World's Okayest Coworker'. Inconclusive."],
    ["HR shredded {name}'s badge so fast I heard it scream.", "Badges don't scream.", "This one did."],
    ["Did anyone see {name}'s face when the votes came in?", "Shocked.", "Shocked guilty or shocked innocent? Asking for everyone."],
    ["Moment of silence for {name}.", "...", "Okay was that a Mole moment of silence or a real one?"],
    ["{name}'s Slack just says 'deactivated'.", "Ominous.", "All Slack is ominous if you stare long enough."],
    ["We fired {name}. Somewhere, either a Mole is sweating or a Mole is laughing.", "Love that for us.", "Truly a coin toss of vibes."],
    ["I'm 60% sure about {name}.", "60 is a passing grade.", "Not at this company."],
    ["{name}'s farewell email is just one word: 'interesting'.", "That's not a farewell.", "That's a cliffhanger."],
    ["Did {name} just take the stapler?", "The good stapler?", "Mole behavior or justified severance? We may never know."],
    ["{name}'s gone and the coffee still tastes bad.", "So they weren't sabotaging the coffee.", "Or the sabotage is still going. 👀"],
    ["Let's all agree we definitely got the right person with {name}.", "Do we agree?", "We agree publicly. Privately, panic."],
    ["{name} high-fived security on the way out.", "That's either a Mole flex or extremely wholesome.", "Synergr has no in-between."],
    ["Gone: {name}. Known: nothing.", "Classic all-hands.", "Put it on the wall next to 'move fast and break people'."],
    ["{name} said 'good luck' to the whole room on the way out.", "Sarcastic good luck?", "The worst kind of good luck."],
    ["What did {name}'s badge say?", "HR says it's 'confidential'.", "HR says lunch is confidential."],
  ],
  burnout: [
    ["Did {name} just say 'thank you' to HR?", "And cry tears of joy?", "They asked for the severance in cash."],
    ["{name} skipped out of the building.", "Skipped?", "Like a kid on the last day of school."],
    [
      "Turns out {name} wanted to get fired this whole time.",
      "And we gave them exactly what they wanted.",
      "We got played by someone who stopped caring.",
    ],
    ["{name} had a 'Fire Me' sticker on their laptop for weeks.", "I thought that was ironic.", "Nothing is ironic anymore."],
    ["{name} brought a cake to their own firing.", "What flavor?", "'Freedom'. It was lemon."],
    ["{name}'s exit interview: 'Finally.'", "That's it?", "Then they walked into the sun."],
    ["Did anyone else notice {name} was campaigning for their own firing?", "The 'Vote Me Out' buttons were a clue.", "In hindsight, yes."],
    ["{name} changed their LinkedIn to 'Free' before the vote was even done.", "Pre-gaming the unemployment.", "Respect, honestly."],
    [
      "Burnt-out {name} just won the whole game by quitting with extra steps.",
      "That's the most efficient thing anyone here has done.",
      "Promote them. Oh wait.",
    ],
    ["{name} walked out humming.", "Humming what?", "'Take This Job and Shove It'. Pretty well, too."],
    ["We fired {name} and they tipped the HR rep.", "That's...", "Generous. And spiteful. Both."],
    ["So {name} has been trying to get fired since onboarding.", "And we finally helped.", "Teamwork makes the dream work, I guess."],
  ],
  nephew: [
    ["We voted {name} out and they're... still here?", "The Founder called.", "Of course the Founder called."],
    ["{name} came back from the exit interview with a promotion.", "A PROMOTION?", "'Vice President of Staying Employed'."],
    ["Turns out {name} is the Founder's nephew.", "That explains the corner office.", "And the jet ski."],
    ["{name} just got fired and un-fired in the same minute.", "Is that legal?", "It's nepotism. Nepotism is always legal here."],
    ["HR tried to walk {name} out and {name} handed them a phone.", "Who was on the phone?", "Uncle."],
    ["{name} said 'my uncle will hear about this' and he did.", "Immediately?", "Speakerphone."],
    ["So {name} is unfireable.", "Once.", "Once is all it takes to ruin morale."],
    ["{name} has a 'Founder's Family' parking spot.", "We have parking?", "THEY have parking."],
    ["Fun fact: {name}'s performance review is just a birthday card from the Founder.", "With money in it?", "With equity in it."],
    ["We did democracy and {name}'s uncle did a veto.", "Synergr is a monarchy.", "Always has been."],
    ["{name} just walked past my desk saying 'can't touch this'.", "Did they do the dance?", "They did the whole dance."],
    ["The good news: we know who {name} is now.", "The bad news?", "They know we tried."],
  ],
};

/** The chatter pool for a firing at the performance review: role-specific only when the role is revealed. */
export function reviewChatterPool(role: Role | null | undefined, revealed: boolean, spared: boolean): ChatterPool {
  if (spared) return "nephew"; // the Nephew's survival reveals him to everyone anyway
  if (!revealed) return "mystery";
  if (isMoleRole(role)) return "caught";
  if (role === "burnout") return "burnout";
  return "wronged";
}

/** A small deterministic PRNG (mulberry32), so a draw depends only on the game's seed and how many threads came before. */
function prng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A string key for a drawn thread, so a game doesn't repeat one. */
export const chatterKey = (c: Pick<Chatter, "pool" | "i">) => `${c.pool}:${c.i}`;

/**
 * Draw a thread from a pool, avoiding the ones this game already used (until the pool runs out).
 * `seed` is the game's random seed and `step` how many threads it has drawn so far.
 */
export function pickChatter(pool: ChatterPool, seed: number, step: number, used: readonly string[]): Chatter {
  const rand = prng((seed ^ Math.imul(step + 1, 0x9e3779b1)) >>> 0);
  const entries = CHATTER[pool];
  const fresh = entries.map((_, i) => i).filter((i) => !used.includes(chatterKey({ pool, i })));
  const choices = fresh.length ? fresh : entries.map((_, i) => i);
  const i = choices[Math.floor(rand() * choices.length)];
  const names = ANON_NAMES.map((_, k) => k);
  const who: number[] = [];
  for (let k = 0; k < entries[i].length; k++) {
    const j = Math.floor(rand() * names.length);
    who.push(names.splice(j, 1)[0]);
  }
  return { pool, i, who };
}

/** The thread's lines with the player's name filled in, or null if the chatter is unknown (e.g. an older client). */
export function chatterLines(c: Chatter, name: string): { who: string; text: string }[] | null {
  const entry = CHATTER[c.pool]?.[c.i];
  if (!entry) return null;
  return entry.map((line, k) => ({
    who: ANON_NAMES[c.who[k] ?? k] ?? "Anonymous Coworker",
    text: line.replaceAll("{name}", name),
  }));
}
