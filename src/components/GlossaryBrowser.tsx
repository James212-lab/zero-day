"use client";

import { useMemo, useState } from "react";
import type { Term } from "@/lib/glossaries";

export default function GlossaryBrowser({
  terms,
  categories,
}: {
  terms: Term[];
  categories: Record<Term["cat"], string>;
}) {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string>("all");
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return terms.filter((t) => {
      if (cat !== "all" && t.cat !== cat) return false;
      if (q && !(t.term.toLowerCase().includes(q) || t.def.toLowerCase().includes(q)))
        return false;
      return true;
    });
  }, [terms, query, cat]);

  const groups = useMemo(() => {
    const map = new Map<string, Term[]>();
    for (const t of filtered) {
      const list = map.get(t.cat) ?? [];
      list.push(t);
      map.set(t.cat, list);
    }
    return Array.from(map.entries()) as [Term["cat"], Term[]][];
  }, [filtered]);

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <div className="terminal px-0 flex items-center">
            <span className="pl-4 text-accent">$</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="search_lexicon..."
              className="w-full bg-transparent px-3 py-2.5 text-sm font-mono outline-none placeholder:text-text-muted"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="pr-4 text-xs text-text-muted hover:text-accent"
              >
                CLEAR
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setCat("all")}
            className={`px-3 py-2 rounded-md text-[11px] font-mono font-bold tracking-widest border transition-colors ${
              cat === "all" ? "text-accent border-accent bg-accent-glow" : "text-text-muted border-border hover:text-accent"
            }`}
          >
            ALL
          </button>
          {(Object.entries(categories) as [Term["cat"], string][]).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setCat(cat === id ? "all" : id)}
              className={`px-3 py-2 rounded-md text-[11px] font-mono font-bold tracking-widest border transition-colors ${
                cat === id ? "text-accent border-accent bg-accent-glow" : "text-text-muted border-border hover:text-accent"
              }`}
            >
              {label.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
        {groups.map(([c, list]) => (
          <div key={c} className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-mono tracking-[0.25em] text-text-muted uppercase">
                {categories[c]}
              </span>
              <span className="h-px flex-1 bg-border" />
              <span className="text-[10px] font-mono text-text-muted">{list.length}</span>
            </div>
            <div className="space-y-1.5">
              {list.map((t) => (
                <button
                  key={t.term}
                  onClick={() => setSelected(selected === t.term ? null : t.term)}
                  className="w-full text-left rounded-md border border-border bg-bg-surface px-3 py-2 transition-colors hover:border-accent hover:bg-accent/5"
                >
                  <span className="text-xs font-semibold text-text-primary">{t.term}</span>
                  {selected === t.term && (
                    <span className="block mt-1.5 text-xs leading-relaxed text-text-secondary">
                      {t.def}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="cyber-card p-10 text-center">
          <div className="text-2xl mb-2">⌀</div>
          <div className="text-sm text-text-muted font-mono">
            no entries match the filter — adjust query or category
          </div>
        </div>
      )}
    </div>
  );
}