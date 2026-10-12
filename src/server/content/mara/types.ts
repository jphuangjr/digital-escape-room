/**
 * Story text for the HarbourMail Easter egg (Mara's inbox). One file per language, all the same shape,
 * so translators work on whole files. Addresses, the temporary password and names in `from`/`to`
 * stay as written in English (they're things players type).
 */
export type MaraFolder = "inbox" | "sent" | "drafts" | "spam";

export interface MaraMessage {
  id: string;
  folder: MaraFolder;
  /** "Tom Achebe <tom.achebe@harbourmail.com>" for received mail, "Ada Voss <ada@ada-voss.com>" (recipient) for sent/drafts */
  party: string;
  subject: string;
  date: string;
  body: string[]; // lines, joined with \n ("" = blank line)
}

export interface MaraText {
  site: {
    pageTitle: string;
    tagline: string;
    signInHeading: string;
    signInPrompt: string;
    forgotLink: string;
    sessionRequired: string;
    forgotHeading: string;
    forgotIntro: string;
    forgotPrompt: string;
    /** shown on the reset page once a reset has been sent; {recovery} = masked address */
    forgotSent: string;
    backToSignIn: string;
    signedInAs: string; // {address}
    folders: Record<MaraFolder, string>;
    emptyFolder: string;
    spamNotice: string;
    draftNotice: string;
    fromLabel: string; // "From: {party}"
    toLabel: string; // "To: {party}"
    footer: string;
    headComment: string;
    bodyComment: string;
  };
  messages: MaraMessage[];
  /**
   * The reset goes to Mara's recovery contact, Ada; {address} = Mara's address, {password} = temporary
   * password. Ada (alive, watching) forwards it to the investigator's inbox with a note.
   */
  resetEmail: {
    subject: string;
    date: string;
    body: string[];
    forward: {
      subject: string; // "Fwd: {subject}"
      note: string[]; // Ada's lines above the forwarded message
      header: string[]; // "---------- Forwarded message ----------", "From: {from}", "Subject: {subject}"
    };
  };
  /** Extra ending-screen section for teams who read Mara's inbox */
  epilogue: string[];
}
