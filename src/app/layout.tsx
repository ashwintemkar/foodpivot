import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthSessionProvider } from "@/components/layout/session-provider";
import { SessionSync } from "@/components/layout/session-sync";
import { StoreHydrate } from "@/components/layout/store-hydrate";
import "./globals.css";
import "./foodpilot.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "FoodPilot AI — Your food concierge",
    template: "%s · FoodPilot AI",
  },
  description: "A premium deterministic demo of an AI-first Indian food concierge.",
};

const themeScript = `try{if(localStorage.getItem("theme")==="dark")document.documentElement.classList.add("dark")}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <AuthSessionProvider>
          <StoreHydrate />
          <SessionSync />
          {children}
        </AuthSessionProvider>
      </body>
    </html>
  );
}
