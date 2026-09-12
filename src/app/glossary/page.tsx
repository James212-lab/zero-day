import { glossary, categories } from "@/lib/glossaries";
import GlossaryBrowser from "@/components/GlossaryBrowser";

export const metadata = {
  title: "Glossary — Zero Day",
  description: "The Zero Day cybersecurity glossary: every term you'll meet across the 40 modules.",
};

export default function GlossaryPage() {
  return (
    <div className="min-h-screen">
      <main className="container-page py-8 md:py-12 max-w-5xl">
        <div className="mb-8">
          <div className="text-[11px] font-mono tracking-[0.3em] text-accent uppercase glow-text mb-2">
            lexicon.v0.9
          </div>
          <h1 className="font-display font-black text-3xl md:text-4xl tracking-wide glow-text">
            THE&nbsp;GLOSSARY
          </h1>
          <p className="mt-3 text-sm text-text-secondary max-w-2xl leading-relaxed">
            Every term you will meet across the {glossary.length} entries in the
            curriculum, decrypted and categorized.
          </p>
        </div>

        <GlossaryBrowser terms={glossary} categories={categories} />
      </main>
    </div>
  );
}