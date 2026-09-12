"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { phases, modules } from "@/lib/curriculum";

const accents = [
  { id: "green", label: "GN", color: "#00ffa3" },
  { id: "cyan", label: "CY", color: "#00d4ff" },
  { id: "red", label: "RD", color: "#ff3b55" },
];

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [accent, setAccent] = useState("green");

  useEffect(() => {
    document.documentElement.setAttribute("data-accent", accent);
    try {
      localStorage.setItem("zd-accent", accent);
    } catch {
      /* ignore */
    }
  }, [accent]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("zd-accent");
      if (saved) setAccent(saved);
    } catch {
      /* ignore */
    }
    setSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-border bg-bg-primary/85 backdrop-blur-md">
        <div className="container-page py-3 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-bg-primary font-black font-display text-xs"
              style={{ background: "var(--accent)", boxShadow: "0 0 12px var(--accent-glow)" }}>
              ZD
            </div>
            <span className="text-sm font-display font-bold tracking-widest text-text-primary">
              ZERO&nbsp;DAY
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-5 text-xs text-text-muted">
            <Link href="/" className="hover:text-accent transition-colors">Map</Link>
            <Link href="/glossary" className="hover:text-accent transition-colors">Glossary</Link>
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-blink" style={{ background: "var(--accent)" }} />
            <span className="text-text-muted">{modules.length} MODULES</span>
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 rounded-full border border-border px-1 py-0.5">
              {accents.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setAccent(a.id)}
                  title={`Accent: ${a.id}`}
                  className="w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center transition-all"
                  style={{
                    background: accent === a.id ? a.color : "transparent",
                    color: accent === a.id ? "#030308" : a.color,
                    border: accent === a.id ? "none" : `1px solid ${a.color}`,
                    boxShadow: accent === a.id ? `0 0 10px ${a.color}66` : "none",
                  }}
                >
                  {a.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden w-9 h-9 rounded-lg border border-border flex items-center justify-center text-sm text-text-primary"
              aria-label="Toggle modules"
            >
              {sidebarOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 pt-14 flex">
        <aside
          className={`fixed md:sticky top-14 z-30 h-[calc(100vh-3.5rem)] w-64 shrink-0 border-r border-border bg-bg-secondary overflow-y-auto transition-transform duration-200 md:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <nav className="p-3 space-y-4">
            {phases.map((phase) => (
              <div key={phase.id}>
                <div className="px-2 mb-1 text-[10px] font-display font-bold tracking-widest text-text-muted">
                  PHASE {phase.id} / {phase.title.toUpperCase()}
                </div>
                <div className="space-y-0.5">
                  {phase.modules.map((mod) => {
                    const active = pathname === `/module/${mod.slug}` ||
                      pathname?.startsWith(`/module/${mod.slug}/`);
                    return (
                      <Link
                        key={mod.id}
                        href={`/module/${mod.slug}`}
                        onClick={() => setSidebarOpen(false)}
                        className={`block rounded-md px-2 py-1.5 text-xs transition-colors ${
                          active
                            ? "bg-accent/10 text-accent"
                            : "text-text-secondary hover:text-accent hover:bg-accent/5"
                        }`}
                      >
                        <span className="text-text-muted mr-1.5 font-mono">
                          {String(mod.id.split("-")[1]).padStart(2, "0")}
                        </span>
                        {mod.title}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}