import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/components/providers";
import { AppShell } from "@/components/app-shell";
import { initialThemeScript } from "@/lib/theme";
import { getStore } from "@/lib/server/store";
import { getOverview } from "@/lib/server/daily";
import { isSupabaseConfigured } from "@/lib/config";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap", axes: ["SOFT", "WONK", "opsz"] });

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "Rarum – das Quiz der seltenen Antworten", template: "%s · Rarum" },
  description: "Jeden Tag neue Wissensfragen. Tippe deine eigene Antwort – je seltener sie ist, desto mehr Punkte. 15 Themenwelten, komplett kostenlos.",
  applicationName: "Rarum",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg", apple: "/icons/icon-192.png" },
  appleWebApp: { capable: true, title: "Rarum", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f2e8" },
    { media: "(prefers-color-scheme: dark)", color: "#121a15" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const content = await getStore().getContent();
  const overview = await getOverview().catch(() => null);
  return (
    <html lang="de-CH" className={`${inter.variable} ${fraunces.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: initialThemeScript() }} />
      </head>
      <body className="font-sans antialiased">
        <AppProvider packs={content.packs} settings={content.settings} accountsEnabled={isSupabaseConfigured()} initialOverview={overview}>
          <AppShell>{children}</AppShell>
        </AppProvider>
        <script dangerouslySetInnerHTML={{ __html: `if('serviceWorker' in navigator&&location.hostname!=='localhost'){window.addEventListener('load',function(){navigator.serviceWorker.register('/sw.js').catch(function(){})})}` }} />
      </body>
    </html>
  );
}
