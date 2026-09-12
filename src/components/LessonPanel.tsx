"use client";

import { useState } from "react";

export default function LessonPanel({
  defaultCode,
  solution,
  hint,
  challenge,
}: {
  defaultCode: string;
  solution: string;
  hint: string;
  challenge: string;
}) {
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  return (
    <div className="cyber-card overflow-hidden sticky top-20 relative">
      <div className="scanline-overlay opacity-40" />

      <div className="relative">
        {/* Terminal code block */}
        <div className="terminal-header">
          <div className="terminal-dot" style={{ background: "var(--danger)" }} />
          <div className="terminal-dot" style={{ background: "var(--amber)" }} />
          <div className="terminal-dot" style={{ background: "var(--accent)" }} />
          <span className="ml-2 text-xs text-text-muted font-mono">
            lab/environment.ts
          </span>
        </div>
        <pre className="p-4 text-[13px] overflow-x-auto max-h-72 leading-relaxed font-mono">
          <code style={{ color: "var(--accent)" }}>{defaultCode}</code>
        </pre>

        {/* Challenge */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-mono tracking-widest text-bg-primary px-2 py-0.5 rounded font-bold"
              style={{ background: "var(--amber)", color: "var(--bg-primary)" }}>
              MISSION
            </span>
            <h4 className="text-sm font-bold" style={{ color: "var(--amber)" }}>
              Home Lab Challenge
            </h4>
          </div>
          <p className="text-xs md:text-sm text-text-secondary leading-relaxed whitespace-pre-line">
            {challenge}
          </p>
        </div>

        {/* Hint */}
        <div className="border-t border-border">
          <button
            onClick={() => setShowHint(!showHint)}
            className="w-full flex items-center justify-between px-4 py-3 text-left text-xs font-mono font-bold tracking-widest hover:bg-accent/5 transition-colors"
            style={{ color: "var(--neon-blue)" }}
          >
            <span>INTEL (HINT)</span>
            <span>{showHint ? "−" : "+"}</span>
          </button>
          {showHint && (
            <p className="px-4 pb-4 text-xs md:text-sm text-text-secondary leading-relaxed">
              {hint}
            </p>
          )}
        </div>

        {/* Solution */}
        <div className="border-t border-border">
          <button
            onClick={() => setShowSolution(!showSolution)}
            className="w-full flex items-center justify-between px-4 py-3 text-left text-xs font-mono font-bold tracking-widest hover:bg-accent/5 transition-colors"
            style={{ color: "var(--accent)" }}
          >
            <span>DECRYPT SOLUTION</span>
            <span>{showSolution ? "−" : "+"}</span>
          </button>
          {showSolution && (
            <pre className="px-4 pb-4 font-mono text-xs overflow-x-auto leading-relaxed whitespace-pre-wrap">
              <code style={{ color: "var(--text-secondary)" }}>{solution}</code>
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}