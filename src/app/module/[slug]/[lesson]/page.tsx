import Link from "next/link";
import { notFound } from "next/navigation";
import { modules } from "@/lib/curriculum";
import LessonContent from "@/components/LessonContent";
import LessonPanel from "@/components/LessonPanel";

export function generateStaticParams() {
  const params: { slug: string; lesson: string }[] = [];
  for (const mod of modules) {
    for (const lesson of mod.lessons) {
      params.push({ slug: mod.slug, lesson: lesson.slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; lesson: string }>;
}) {
  const { slug, lesson } = await params;
  const mod = modules.find((m) => m.slug === slug);
  const lessonData = mod?.lessons.find((l) => l.slug === lesson);
  return {
    title: lessonData
      ? `${lessonData.title} — Zero Day`
      : "Lesson — Zero Day",
    description: lessonData?.description,
  };
}

const levelBadge: Record<string, string> = {
  beginner: "badge-beginner",
  intermediate: "badge-intermediate",
  advanced: "badge-advanced",
};

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lesson: string }>;
}) {
  const { slug, lesson } = await params;
  const mod = modules.find((m) => m.slug === slug);
  if (!mod) return notFound();
  const lessonData = mod.lessons.find((l) => l.slug === lesson);
  if (!lessonData) return notFound();

  const lessonIdx = mod.lessons.findIndex((l) => l.slug === lesson);
  const prevLesson = lessonIdx > 0 ? mod.lessons[lessonIdx - 1] : null;
  const nextLesson =
    lessonIdx < mod.lessons.length - 1 ? mod.lessons[lessonIdx + 1] : null;

  return (
    <div className="min-h-screen">
      <main className="container-page py-6 md:py-8 max-w-6xl">
        {/* Breadcrumb */}
        <div className="mb-4 md:mb-6">
          <Link
            href={`/module/${mod.slug}`}
            className="inline-flex items-center gap-1.5 text-sm hover:underline"
            style={{ color: "var(--accent)" }}
          >
            ← {mod.title}
          </Link>
        </div>

        {/* Lesson header */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-6 md:mb-8">
          <span className={`badge ${levelBadge[lessonData.level]}`}>
            {lessonData.level}
          </span>
          <span
            className="text-[10px] font-mono uppercase tracking-wide"
            style={{ color: "var(--neon-blue)" }}
          >
            {lessonData.tag}
          </span>
          <span className="text-xs md:text-sm text-text-muted">
            {lessonData.duration}
          </span>
          <span className="text-xs md:text-sm text-text-muted font-mono">
            {String(lessonData.id).padStart(2, "0")} /{" "}
            {String(mod.lessons.length).padStart(2, "0")}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
          <div className="lg:col-span-3 min-w-0">
            <LessonContent content={lessonData.content} />
          </div>
          <div className="lg:col-span-2 space-y-4">
            <LessonPanel
              defaultCode={lessonData.defaultCode}
              solution={lessonData.solution}
              hint={lessonData.hint}
              challenge={lessonData.challenge}
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-12 pt-8 border-t border-border gap-3">
          {prevLesson ? (
            <Link
              href={`/module/${mod.slug}/${prevLesson.slug}`}
              className="btn-cyber btn-secondary max-w-[44%]"
            >
              <span className="truncate">← {prevLesson.title}</span>
            </Link>
          ) : (
            <Link
              href={`/module/${mod.slug}`}
              className="btn-cyber btn-secondary"
            >
              ← Module start
            </Link>
          )}
          {nextLesson ? (
            <Link
              href={`/module/${mod.slug}/${nextLesson.slug}`}
              className="btn-cyber btn-primary max-w-[44%]"
            >
              <span className="truncate">{nextLesson.title} →</span>
            </Link>
          ) : (
            <Link href={`/module/${mod.slug}`} className="btn-cyber btn-primary">
              Module complete ✓
            </Link>
          )}
        </div>
      </main>
    </div>
  );
}