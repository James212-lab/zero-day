import Link from "next/link";
import PhaseMap from "@/components/PhaseMap";
import { modules, phases } from "@/lib/curriculum";

export default function HomePage() {
  const totalLessons = modules.reduce((n, m) => n + m.lessons.length, 0);

  return (
    <div className="min-h-screen">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-lines opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bg-primary" />
        <div className="relative container-page py-16 md:py-24 text-center">
          <div className="inline-block mb-6">
            <span
              className="text-[11px] font-mono tracking-[0.35em] text-accent border rounded-full px-4 py-1.5 uppercase glow-text"
              style={{ borderColor: "var(--border-glow)" }}
            >
              SYSTEM ACCESS: GRANTED
            </span>
          </div>
          <h1 className="font-display font-black text-5xl md:text-7xl tracking-wider animate-glitch glow-text">
            ZERO&nbsp;DAY
          </h1>
          <p className="mt-5 max-w-2xl mx-auto text-sm md:text-base text-text-secondary leading-relaxed">
            Master offensive and defensive cybersecurity from the silicon up.
            {` `}
            {modules.length} modules across {phases.length} phases — from malware
            analysis to cloud security — with real home labs, not just slides.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href="#map" className="btn-primary btn-cyber">
              ▸ INITIATE PHASE MAP
            </a>
            <Link href="/module/01-hardware-computing-iot" className="btn-secondary btn-cyber">
              START MODULE 01
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {[
              { label: "MODULES", value: String(modules.length).padStart(2, "0") },
              { label: "LESSONS", value: String(totalLessons).padStart(2, "0") },
              { label: "PHASES", value: String(phases.length).padStart(2, "0") },
              { label: "HOME LABS", value: "ON-LINE" },
            ].map((s) => (
              <div key={s.label} className="cyber-card px-4 py-4">
                <div className="font-display font-bold text-xl md:text-2xl text-accent glow-text">
                  {s.value}
                </div>
                <div className="mt-1 text-[10px] font-mono text-text-muted tracking-widest">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TERMINAL INTRO */}
      <section className="container-page pb-12">
        <div className="terminal mx-auto max-w-3xl">
          <div className="terminal-header">
            <div className="terminal-dot bg-danger" style={{ background: "var(--danger)" }} />
            <div className="terminal-dot" style={{ background: "var(--amber)" }} />
            <div className="terminal-dot" style={{ background: "var(--accent)" }} />
            <span className="ml-2 text-xs text-text-muted font-mono">
              zero-day@terminal:~$ ./audit --system
            </span>
          </div>
          <pre className="p-4 md:p-5 text-xs md:text-sm leading-relaxed overflow-x-auto">
{`> INITIALIZING ZERO-DAY CURRICULUM...
> ${String(modules.length).padStart(2, '0')} MODULES DETECTED / ${phases.length} PHASES
> MODE: HANDS-ON, EVERY LESSON SHIPS A HOME LAB
> WARNING: SOME LESSONS REQUIRE A VIRTUAL MACHINE
> RECOMMENDED SETUP: VIRTUALBOX + KALI + UBUNTU
> PROCEED? [Y/n] Y
> PHASE MAP DECRYPTED. GOOD HUNTING, ANALYST.`}
          </pre>
        </div>
      </section>

      {/* PHASE MAP */}
      <section id="map" className="container-page pb-16" aria-label="Curriculum phase map">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="font-display font-bold text-xl md:text-2xl tracking-wider text-text-primary">
            OPERATION PHASE&nbsp;MAP
          </h2>
          <div className="flex-1 h-px bg-gradient-to-r from-accent/50 to-transparent" />
        </div>
        <PhaseMap />
      </section>

      {/* TAGS / TRACKS */}
      <section className="container-page pb-16">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="font-display font-bold text-xl md:text-2xl tracking-wider text-text-primary">
            PLAYSTYLES
          </h2>
          <div className="flex-1 h-px bg-gradient-to-r from-accent/50 to-transparent" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              tag: "concept",
              color: "var(--neon-blue)",
              title: "CONCEPT",
              desc: "The theory that makes you dangerous on paper — before you touch a keyboard.",
            },
            {
              tag: "lab",
              color: "var(--neon-purple)",
              title: "HOME LAB",
              desc: "Hands-on drills with VirtualBox, Kali, Wireshark and your own VMs. Break it, fix it, learn it.",
            },
            {
              tag: "challenge",
              color: "var(--neon-pink)",
              title: "CHALLENGE",
              desc: "A challenge mission at the end of every lesson that proves you can do it cold.",
              count: `${String(totalLessons)} LESSONS`,
            },
          ].map((t) => (
            <div key={t.tag} className="cyber-card cyber-card-hover p-5">
              <span
                className="inline-block text-[10px] font-mono font-bold tracking-widest px-2 py-1 rounded border mb-3"
                style={{
                  color: t.color,
                  borderColor: t.color,
                  background: `${t.color}1f`,
                }}
              >
                {t.count ?? `${tagLessons(t.tag).length} LESSONS`}
              </span>
              <h3 className="font-display font-bold text-sm tracking-widest" style={{ color: t.color }}>
                {t.title}
              </h3>
              <p className="mt-2 text-sm text-text-secondary leading-relaxed">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="container-page pb-20 text-center">
        <div className="cyber-card p-8 md:p-12 relative overflow-hidden">
          <div className="scanline-overlay" />
          <div className="relative">
            <div className="text-[11px] font-mono text-text-muted tracking-[0.3em] uppercase">
              the only way out is through
            </div>
            <h2 className="mt-3 font-display font-black text-3xl md:text-4xl tracking-wider text-accent glow-text animate-flicker">
              BEGIN AT MODULE 01
            </h2>
            <div className="mt-6">
              <Link href="/module/01-hardware-computing-iot" className="btn-primary btn-cyber">
                ▸ HIGHER THE STAKES
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function tagLessons(tag: string) {
  return modules.flatMap((m) => m.lessons.filter((l) => l.tag === tag));
}