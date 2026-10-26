"use server";

import { signIn, signOut } from "@/auth";
import { demoAuthAllowed } from "@/lib/auth-mode";

export async function signInWithGoogle() {
  await signIn("google", { redirectTo: "/onboarding" });
}

export async function signInWithDemo() {
  if (!demoAuthAllowed()) {
    throw new Error("Demo sign-in is disabled when Google is configured, and always disabled in production.");
  }
  await signIn("demo", { redirectTo: "/onboarding" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
