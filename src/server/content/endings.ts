import "server-only";
import type { Locale } from "@/i18n/config";
import type { Ending } from "@/lib/types";

const ENDINGS: Record<Ending, { title: string; body: string }> = {
  EXPOSE: {
    title: "The Needle Points True",
    body: [
      "At 06:00 the switch fires on purpose. Ada lets it.",
      "Four thousand one hundred and twelve reconciled records land in every newsroom inbox in the city, each one paired with its original: the charter signed in 1978 by the Harbour Trust, the watchman's statement about lamps in the Trust office the night the warehouse burned, the list of founders with a name everyone at the Institute was told to forget. Voss. Her father's name.",
      "By noon the Meridian Institute's front page has been replaced with a single line about 'technical maintenance'. By evening there are television vans parked on the steps beneath the broken compass. Deputy Director Kell resigns by letter. Director Calloway does not resign; she is escorted.",
      "Wren Okafor gives her first interview with her face in frame. The photo they deleted runs on the front page of the morning edition, a little grainy, unmistakably her.",
      "Ada does not come out. Not yet. There are people who will be angry for a long time, and some of them know where the harbour is deepest. She sends one line to the investigator's inbox from an address that will stop working an hour later: 'Not yet. But soon. Tell Mara to save me a seat.'",
      "The record is open. It is messy and contradictory and alive, the way the truth usually is. Somewhere in the Institute's empty lobby, someone finally takes the compass down to have the needle fixed.",
    ].join("\n\n"),
  },
  PROTECT: {
    title: "A Record Kept Sealed",
    body: [
      "You let the timer run past its own deadline, and then you stop it. The unaltered records stay where Ada hid them: in the dark, unindexed, safe.",
      "The Institute never learns how close it came. The Continuity Office goes on reconciling. The founding year stays 1987 on the website and 1978 in the small print, and nobody reads the small print. That is the price, and everyone in the room knows it.",
      "In return, Ada gets the one thing the truth could not give her: a way out. By the time the Office of Continuity notices her switch has gone quiet, the host has been wiped, her accounts are closed, and the woman who read every footnote has become one.",
      "Wren keeps her job and her high score. She posts on RunnerBoard once more, a single message to compass_needle with the timestamp 07:15. Nobody else understands it. It was never meant for them.",
      "Three weeks later, a letter arrives for Mara Voss with no return address. Inside is a pressed sprig of lavender from the harbour wall and a single sheet of paper in her sister's handwriting:",
      "\"Mara — I'm sorry about Dad's papers. You were right that some ghosts are better left in the ledgers, and I was right that they were there. I'm safe. I can't come to the party, but I'll be thinking of you on March 14, the way I always do. Marry the man with the terrible speeches. Be happy loudly enough that I can hear it from wherever I am. All my love, the sister who reads footnotes. — A.\"",
      "Mara reads it at the kitchen table until the light changes. Then she sets an extra place at the engagement party anyway, and leaves it empty, and tells no one why.",
    ].join("\n\n"),
  },
};

export function endingText(ending: Ending, _loc: Locale): { title: string; body: string } {
  return ENDINGS[ending];
}

export function bonusEpilogue(_loc: Locale): string {
  return [
    "Inside Ada's personal folder, beneath the voicemail transcripts and the photographs of her father's ledgers, there is one more file. It is a scan of a child's drawing: two girls on a harbour wall, holding a compass between them. The needle is drawn whole.",
    "On the back, in an adult's careful hand: 'For when you both find your way back. — Dad, 1987.'",
    "Ada never told anyone she'd kept it. You've earned the right to know. The compass badge is yours.",
  ].join("\n\n");
}

export function bonusFiles(_loc: Locale): { name: string; body: string }[] {
  return [
    {
      name: "voicemail_to_mara_unsent.txt",
      body: [
        "[Transcript — recorded, never sent]",
        "",
        "Mara. It's me. I keep starting this and deleting it. I found Dad's name in the founders' letters. Not as a villain — as a witness. He saw what happened at the warehouse and they paid him to forget it, and when he wouldn't, they made the record forget him instead.",
        "",
        "You were right that I was obsessed. I was also right. I don't know how to say both of those things on the phone. Happy almost-engaged. I like Tom. Don't tell him.",
      ].join("\n"),
    },
    {
      name: "voicemail_to_wren.txt",
      body: [
        "[Transcript — 23:49]",
        "",
        "Wren, it's Ada. I'm in Server Room B. I'm using your login like you said — if anyone asks, you were at the arcade and you have a two-million-point alibi. Thank you for the key. I'm going to put the switch somewhere they can't reach. If I go quiet, it isn't because they found me. It's because I chose to.",
      ].join("\n"),
    },
    {
      name: "notes_on_mara.txt",
      body: [
        "Mara Voss. Younger by four years. Teaches swimming at the harbour baths. Has never once been on time and has never once missed something that mattered.",
        "",
        "Born on the night of the storm, so Dad called her his weather. I'm March 14 — Dad called me his compass. We stopped talking over his papers. I want to fix that more than I want to fix the record. Both, ideally.",
      ].join("\n"),
    },
    {
      name: "notes_on_wren.txt",
      body: [
        "Wren Okafor. Systems Archivist. Testified to the 2019 Continuity Inquiry that the digitisation was dropping records 'selectively'. Two weeks later her photograph disappeared from the staff page, then from the register, then from the building's ID system.",
        "",
        "She still comes to work. She still holds the Circuit Runner '94 high score. She says the trick is the same as with the archive: learn the level so well you notice when someone moves a wall.",
      ].join("\n"),
    },
    {
      name: "institute_history_true.txt",
      body: [
        "The Meridian Institute was chartered on 14 June 1978 by the Harbour Trust — a private company with a warehouse fire it needed the city to forget.",
        "",
        "In 1987 the Trust dissolved and the Institute was 'refounded' by civic ordinance, with a new charter, a new board, and a new founding date. Everything before 1987 became prehistory. The footer was never updated. Someone in the old print shop swapped the digits, and the lie and the truth have shared a page ever since.",
      ].join("\n"),
    },
    {
      name: "about_the_compass.txt",
      body: [
        "Seven notches, one for each founding collection. The seventh collection — the Trust's own papers — was withdrawn in 2019. The needle didn't break in the move. Kell snapped it at the pin so it would never point at number seven again.",
        "",
        "I took the broken tip home. It's in my coat pocket. When this is over, I'll give it back.",
      ].join("\n"),
    },
  ];
}
