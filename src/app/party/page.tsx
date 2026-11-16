import { redirect } from "next/navigation";

/** Party games now live on the home page, below the escape rooms. Old links land on that section. */
export default function PartyGames() {
  redirect("/#party-games");
}
