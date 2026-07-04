import { supabase } from "./supabase";

export async function signUp(
  email: string,
  password: string,
  captchaToken: string,
): Promise<string | null> {
  if (!supabase) return "Cloud saves aren't configured yet.";
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { captchaToken },
  });
  return error?.message ?? null;
}

export async function signIn(
  email: string,
  password: string,
  captchaToken: string,
): Promise<string | null> {
  if (!supabase) return "Cloud saves aren't configured yet.";
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
    options: { captchaToken },
  });
  return error?.message ?? null;
}

export async function signOut(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}
