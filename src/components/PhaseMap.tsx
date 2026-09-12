"use client";

import Link from "next/link";
import { useState } from "react";
import { phases } from "@/lib/curriculum";

export default function PhaseMap() {
  const [expanded, setExpanded] = useState<Set<number>>(new Set([1]));
  const [selected, setSelected] = useState<string | null>(null);

  const toggle = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectModule = (slug: string) => {
    setSelected((prev) => (prev === slug ? null : slug));
  };

  const selectedModule = selected
    ? phases.flatMap((p) => p.modules).find((m) => m.slug === selected)
    : null;

  return (
    <div className="flex flex-col gap-3">
      {phases.map((phase) => {
        const isOpen = expanded.has(phase.id);
        const selectedIn = phase.modules.some((m) => m.slug === selected);
        return (
          <div key={phase.id} className="relative">
            {phase.id < phases.length && isOpen && (
              <div
                className="absolute left-[1.625rem] top-full bottom-auto w-px bg-accent/25"
                style={{ height: "1.25rem" }}
              />
            )}
            <div
              className={`cyber-card overflow-hidden transition-all duration-300 ${
                selectedIn ? "neon-border" : ""
              }`}
            >
              <button
                onClick={() => toggle(phase.id)}
                className="w-full flex items-center gap-4 px-4 py-4 md:px-5 text-left"
              >
                <div
                  className="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center font-mono text-sm font-bold"
                  style={{
                    background: "var(--accent-glow)",
                    color: "var(--accent)",
                    border: "1px solid var(--border-glow)",
                  }}
                >
                  {phase.id}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-bold text-sm md:text-base tracking-wider text-text-primary">
                    {phase.title}
                  </div>
                  <div className="text-xs text-text-muted mt-0.5 truncate">
                    {phase.subtitle}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[10px] font-mono text-text-muted">
                    {phase.modules.length} MODULES
                  </span>
                  <span
                    className="inline-flex items-center justify-center w-6 h-6 rounded border border-border text-xs text-text-secondary transition-transform duration-200"
                    style={{ transform: isOpen ? "rotate(90deg)" : "none" }}
                  >
                    ›
                  </span>
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-border">
                  {phase.modules.map((mod, idx) => {
                    const isSelected = selected === mod.slug;
                    const lessonCount = mod.lessons.length;
                    return (
                      <div key={mod.id}>
                        {idx > 0 && <div className="border-t border-border/50 mx-4" />}
                        <div
                          className="px-4 md:px-5 flex items-center gap-3 cursor-pointer transition-colors group"
                          onClick={() => selectModule(mod.slug)}
                          style={{
                            background: isSelected ? "var(--accent-glow)" : "transparent",
                          }}
                        >
                          <span className="w-8 shrink-0 font-mono text-xs text-text-muted group-hover:text-accent">
                            {String(mod.id.split("-")[1]).padStart(2, "0")}
                          </span>
                          <div className="flex-1 py-3 min-w-0">
                            <div className="text-sm font-medium text-text-primary group-hover:text-accent">
                              {mod.title}
                            </div>
                            {isSelected ? (
                              <div className="mt-1.5 text-xs text-text-secondary leading-relaxed">
                                {mod.description}
                                <span className="mt-1 text-text-muted block">
                                  {mod.language} · {lessonCount} lessons
                                </span>
                              </div>
                            ) : (
                              <div className="mt-0.5 text-[11px] text-text-muted">
                                {mod.language}
                              </div>
                            )}
                          </div>
                          {isSelected ? (
                            <Link
                              href={`/module/${mod.slug}`}
                              className="btn-primary btn-cyber shrink-0 text-[11px] px-3 py-1.5"
                              onClick={(e) => e.stopPropagation()}
                            >
                              ENTER MODULE
                            </Link>
                          ) : (
                            <span className="shrink-0 text-xs text-text-muted group-hover:text-accent transition-colors">
                              {lessonCount} ›
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })}
      <div className="flex items-center justify-between mt-4 px-2 text-xs text-text-muted">
        <span>
          {selectedModule ? (
            <>
              SELECTED:{" "}
              <span className="text-accent font-mono">{selectedModule.slug}</span>
            </>
          ) : (
            "SELECT A MODULE TO BEGIN"
          )}
        </span>
        <span className="font-mono">
          SYS.ONLINE <span className="animate-blink text-accent">▌</span>
        </span>
      </div>
    </div>
  );
}