import Link from "next/link";
import { ArrowRight, UtensilsCrossed } from "lucide-react";
import { AuthSubmitButton } from "@/components/auth/auth-submit-button";
import { OrderBrief } from "@/components/food/order-brief";
import { signInWithDemo, signInWithGoogle } from "@/app/login/actions";

const errorCopy: Record<string, string> = {
  Configuration: "Google sign-in is not configured. Add AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET, then restart the app.",
  AccessDenied: "Google denied this sign-in. Try another account.",
  OAuthAccountNotLinked: "This email is already tied to another sign-in method.",
  OAuthCallback: "Google returned an error. Check the callback URL in Google Cloud Console.",
  Callback: "Sign-in could not finish. Try again.",
  Default: "Sign-in failed. Please try again.",
};

export function LoginPage({
  googleEnabled,
  demoEnabled,
  error,
}: {
  googleEnabled: boolean;
  demoEnabled: boolean;
  error?: string;
}) {
  const message = error ? errorCopy[error] ?? errorCopy.Default : null;

  return (
    <div className="app-canvas">
    <div className="auth-layout">
      <section>
        <Link href="/" className="brand">
          <span className="brand-mark">
            <UtensilsCrossed />
          </span>
          FoodPilot AI
        </Link>
        <span className="eyebrow">{googleEnabled ? "Google sign-in" : "Development access"}</span>
        <h1>Your next good meal starts here.</h1>
        <p>
          {googleEnabled
            ? "Sign in with Google so FoodPilot can remember your table across sessions."
            : "Google OAuth keys are not in this environment yet. Use the labelled demo profile, or add AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET."}
        </p>
        {message ? <p className="auth-error">{message}</p> : null}
        {googleEnabled ? (
          <form action={signInWithGoogle}>
            <AuthSubmitButton className="google-button">
              <span>G</span> Continue with Google <ArrowRight />
            </AuthSubmitButton>
          </form>
        ) : (
          <p className="form-note">
            Create an OAuth client in Google Cloud Console. Authorized redirect URI:
            <code> http://localhost:3000/api/auth/callback/google</code>
          </p>
        )}
        {demoEnabled ? (
          <form action={signInWithDemo}>
            <AuthSubmitButton className="button secondary full">
              Continue in demo mode <ArrowRight />
            </AuthSubmitButton>
          </form>
        ) : null}
        <small>
          {googleEnabled
            ? "We only receive your Google name, email and photo. FoodPilot never charges a card from this screen."
            : "Demo mode is not Google authentication. It is disabled in production."}
        </small>
      </section>
      <div className="auth-photo">
        <OrderBrief />
      </div>
    </div>
    </div>
  );
}
