import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/components/providers";
import { AppShell } from "@/components/app-shell";
import { getStore } from "@/lib/server/store";
import { getOverview } from "@/lib/server/daily";
import { isSupabaseConfigured } from "@/lib/config";

const bebas = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--font-bebas", display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
const space = Space_Grotesk({ subsets: ["latin"], variable: "--font-space", display: "swap" });

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { default: "NNAXOS – das Quiz der seltenen Antworten", template: "%s · NNAXOS" },
  description: "Jeden Tag neue Wissensfragen. Tippe deine eigene Antwort – je seltener sie ist, desto mehr Punkte. 15 Themenwelten, komplett kostenlos.",
  applicationName: "NNAXOS",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg", apple: "/icons/icon-192.png" },
  appleWebApp: { capable: true, title: "NNAXOS", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: [
    { color: "#0c0a14" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const content = await getStore().getContent();
  const overview = await getOverview().catch(() => null);
  return (
    <html lang="de-CH" className={`dark ${bebas.variable} ${manrope.variable} ${space.variable}`} suppressHydrationWarning>
      <head>
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
