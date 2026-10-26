import { AppHeader } from "./app-header";
import { MobileBottomNav } from "./mobile-bottom-nav";

export function AppFrame({
  children,
  landing = false,
}: {
  children: React.ReactNode;
  landing?: boolean;
}) {
  return (
    <div className="app-canvas">
      <AppHeader />
      <main className={landing ? "" : "page-shell"}>{children}</main>
      {landing ? null : <MobileBottomNav />}
    </div>
  );
}
