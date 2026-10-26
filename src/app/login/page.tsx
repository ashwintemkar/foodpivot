import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginPage } from "@/components/screens/login-page";
import { demoAuthAllowed, googleAuthConfigured } from "@/lib/auth-mode";

export const instant = false;

export default function Login({ searchParams }: PageProps<"/login">) {
  return (
    <Suspense fallback={<p className="auth-layout">Loading sign-in…</p>}>
      <LoginScreen searchParams={searchParams} />
    </Suspense>
  );
}

async function LoginScreen({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  if (session?.user) redirect("/concierge");
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : undefined;
  return (
    <LoginPage googleEnabled={googleAuthConfigured()} demoEnabled={demoAuthAllowed()} error={error} />
  );
}
