import Link from "next/link";
import { notFound } from "next/navigation";
import { modules, phases } from "@/lib/curriculum";

export function generateStaticParams() {
  return modules.map((mod) => ({ slug: mod.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const mod = modules.find((m) => m.slug === slug);
  return {
    title: mod ? `${mod.title} — Zero Day` : "Module — Zero Day",
    description: mod?.description,
  };
}

const levelBadge: Record<string, string> = {
  beginner: "badge-beginner",
  intermediate: "badge-intermediate",
  advanced: "badge-advanced",
};

export default async function ModulePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const mod = modules.find((m) => m.slug === slug);
  if (!mod) return notFound();

  const phase = phases.find((p) => p.modules.some((m) => m.slug === slug));
  const idxInPhase = phase
    ? phase.modules.findIndex((m) => m.slug === slug)
    : -1;
  const prevModule =
    phase && idxInPhase > 0 ? phase.modules[idxInPhase - 1] : null;
  const nextModule =
    phase && idxInPhase < phase.modules.length - 1
      ? phase.modules[idxInPhase + 1]
      : null;

  const code = String(mod.id.split("-")[1]).padStart(2, "0");

  return (
    <div className="min-h-screen">
      <main className="container-page py-8 md:py-12 max-w-5xl">
        {/* Breadcrumb */}
        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm hover:underline" style={{ color: "var(--accent)" }}>
            ← PHASE MAP
          </Link>
          {phase && (
            <>
              <span className="text-text-muted">/</span>
              <Link href="/#map" className="text-text-muted hover:text-accent">
                PHASE {phase.id}
              </Link>
            </>
          )}
          <span className="text-text-muted">/</span>
          <span className="text-text-secondary font-mono">{code}</span>
        </div>

        {/* Module header */}
        <div className="cyber-card relative overflow-hidden mb-8">
          <div className="absolute inset-0 grid-lines opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/90 via-transparent to-transparent" />
          <div className="relative p-6 md:p-8">
            <div className="flex items-start gap-4 md:gap-5">
              <div
                className="w-14 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center font-display font-black text-xl md:text-2xl text-bg-primary shrink-0 glow-text"
                style={{ background: "var(--accent)" }}
              >
                {code}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="badge badge-neon-purple">{mod.language}</span>
                  <span className="badge badge-neon-blue">
                    {mod.lessons.length} LESSONS
                  </span>
                  {phase && (
                    <span className="badge" style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
                      PHASE {phase.id} · {phase.title}
                    </span>
                  )}
                </div>
                <h1 className="font-display font-black text-2xl md:text-3xl tracking-wide text-text-primary glow-text">
                  {mod.title}
                </h1>
                <p className="mt-2 text-sm md:text-base text-text-secondary leading-relaxed">
                  {mod.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lessons */}
        <div className="space-y-3">
          {mod.lessons.map((lesson, idx) => (
            <Link
              key={lesson.id}
              href={`/module/${mod.slug}/${lesson.slug}`}
              className="cyber-card cyber-card-hover p-5 flex items-center gap-4 animate-fade-up"
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              <div
                className="w-10 h-10 shrink-0 rounded-lg flex items-center justify-center font-mono text-sm font-bold"
                style={{
                  background: "var(--accent-glow)",
                  color: "var(--accent)",
                }}
              >
                {String(lesson.id).padStart(2, "0")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-semibold text-sm md:text-base">{lesson.title}</h3>
                  <span className={`badge ${levelBadge[lesson.level]}`}>
                    {lesson.level}
                  </span>
                  <span
                    className="text-[10px] font-mono uppercase tracking-wide"
                    style={{ color: "var(--neon-blue)" }}
                  >
                    {lesson.tag}
                  </span>
                </div>
                <p className="text-xs md:text-sm text-text-muted truncate">
                  {lesson.description}
                </p>
              </div>
              <div className="flex items-center gap-3 text-sm text-text-muted shrink-0">
                <span className="hidden sm:inline">{lesson.duration}</span>
                <span style={{ color: "var(--accent)" }}>→</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Phase nav */}
        <div className="flex items-center justify-between mt-12 pt-8 border-t border-border">
          {prevModule ? (
            <Link href={`/module/${prevModule.slug}`} className="btn-cyber btn-secondary max-w-[45%]">
              <span className="truncate">← {prevModule.title}</span>
            </Link>
          ) : (
            <div />
          )}
          {nextModule ? (
            <Link href={`/module/${nextModule.slug}`} className="btn-cyber btn-primary max-w-[45%]">
              <span className="truncate">{nextModule.title} →</span>
            </Link>
          ) : (
            <Link href="/" className="btn-cyber btn-primary">
              COMPLETE PHASE 6 ✓
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}