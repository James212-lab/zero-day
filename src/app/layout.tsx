import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";
import { modules, phases } from "@/lib/curriculum";

const totalLessons = modules.reduce((n, m) => n + m.lessons.length, 0);

export const metadata: Metadata = {
  title: "Zero Day — Cybersecurity Mastery",
  description: `Master cybersecurity from the hardware up to advanced defense, governance and emerging threats. ${modules.length} modules, ${phases.length} phases, ${totalLessons} hands-on lessons, real home labs. Everything runs offline in-browser.`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700;800&family=Orbitron:wght@500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}