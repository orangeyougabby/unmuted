import supabase from "./supabase";
import { Href, Router } from "expo-router";

export async function getSessionOrRedirect(router: Router, to: Href = "/auth") {
  const { data } = await supabase.auth.getSession();
  if (!data.session) {
    router.replace(to);
    return false;
  }
  return true;
}
