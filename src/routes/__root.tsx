import { Outlet, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "NusantaraJobs — Platform Pencocokan Kerja & Upskilling Berbasis AI" },
      { name: "description", content: "NusantaraJobs membantu pencari kerja Indonesia menemukan lowongan yang tepat dan meningkatkan skill, dengan bantuan AI." },
      { name: "author", content: "NusantaraJobs" },
      { property: "og:title", content: "NusantaraJobs — Pencocokan Kerja Berbasis AI" },
      { property: "og:description", content: "Unggah CV Anda, dapatkan rekomendasi pekerjaan dengan skor kecocokan, dan pelajari skill yang perlu ditingkatkan." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "NusantaraJobs — Pencocokan Kerja Berbasis AI" },
      { name: "twitter:description", content: "Unggah CV Anda, dapatkan rekomendasi pekerjaan dengan skor kecocokan, dan pelajari skill yang perlu ditingkatkan." },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <HeadContent />
      </head>
      <body className="pb-[env(safe-area-inset-bottom)]">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <>
      <Outlet />
      <Toaster position="top-center" />
    </>
  );
}
