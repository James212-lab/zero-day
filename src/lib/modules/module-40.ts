import type { Module } from "../curriculum";

export const module40: Module = {
  id: "module-40",
  slug: "40-ai-emerging-threats",
  title: "AI, Machine Learning & Emerging Cyber Threats",
  description:
    "The threat frontier: AI-powered malware, autonomous attack chains, quantum computing implications, and how defenders harness the same tools — an honest, evolving, professional overview.",
  language: "AICyber",
  lessons: [
    {
      id: 1,
      slug: "01-ai-threat-landscape",
      title: "The AI Threat Landscape: What's Real vs Hype",
      level: "intermediate",
      tag: "concept",
      duration: "40 min",
      description:
        "Separating science fiction from near-term reality: what AI already does in offensive/defensive security, and what's just marketing.",
      content: `
# The AI Threat Landscape: What's Real vs Hype

## The reality landscape (no hype)

**Already deployed (defense):**
- ML-based NDR/NDR (anomaly detection on flows, endpoints)
- UEBA (user & entity behavior analytics)
- Auto-triage for alerts (SOAR + ML classifiers)
- AI in CVE/prioritization triage

**Already deployed (offense):**
- AI-generated phishing content (human-like language, personalization)
- Automated recon at scale (osint-bots, web scraping)
- Polymorphic malware concepts (AI-driven mutation studies)

**Emerging but not everywhere:**
- Autonomous lateral movement (research-grade, fragile)
- AI malware agents (long distance from 'autonomous APT' — more agent-assisted)
- Quantum factoring (serious research, not yet threat-real at crypto scale)

## The hype filter

| Claim | Reality |
|-------|---------|
| "AI will autonomously compromise any org" | Fragile; needs infra, context, permissions. Not the near-term threat |
| "AI will replace SOC analysts" | AI augments triage; analysts provide context/judgment |
| "AI makes phishing impossible to detect" | Content-aware defenses (behavioral, simulation) still work; deepfakes are the real worry |
| "Quantum will break all encryption" | QC breaks some schemes (RSA/ECC); post-quantum crypto already deploying |

## The defender's advantage

- ML is better at *detecting patterns* than producing novel, persistent offensive chains
- AI-as-a-tool for blue (UEBA, triage) scales well
- The real challenge: attacker content gets *more human* (phishing) — detection needs to follow

## What you must learn

- The actual capabilities (not vendor promises)
- Where ML is *good* (anomaly at scale, triage) vs *bad* (novelty, context)
- What you *will* defend against in the next 2 years (not the theoretical 20-year threat)

> Hype tells you what to fear; reality tells you what to prepare. Defenders who study the actual tech edge out those listening to the marketing podcast.
`,
      defaultCode: `// classify threats by 'near-term' vs 'far-future'
const threats = [
  { name: 'ai-generated phishing', reality: 'near-term', defense: 'behavioral + simulation' },
  { name: 'autonomous ai exploit agent', reality: 'far-future', defense: 'traditional controls for now' },
  { name: 'quantum crypto-break', reality: 'long-term research', defense: 'post-quantum migration' },
  { name: 'ml-ueba detection', reality: 'near-term', defense: 'deploy baseline now' }
];
threats.forEach(t => console.log(t.name, '|', t.reality, '|', t.defense));`,
      solution: `const threats = [
  { name: 'ai-generated phishing', reality: 'near-term', defense: 'behavioral + simulation' },
  { name: 'autonomous ai exploit agent', reality: 'far-future', defense: 'traditional controls for now' },
  { name: 'quantum crypto-break', reality: 'long-term research', defense: 'post-quantum migration' },
  { name: 'ml-ueba detection', reality: 'near-term', defense: 'deploy baseline now' }
];
threats.forEach(t => console.log(t.name, '|', t.reality, '|', t.defense));`,
      hint: "AI phishing + UEBA = real now; autonomous offensive agents = distant and fragile.",
      challenge: `**Critical Thinking — The Hype Filter:**
1. List 5 "AI will hack everything" claims you've seen; classify each as real/near/far/fantasy.
2. For the near-term threats, name your organization's existing defense.
3. For the far-future claims, what WOULD break current defenses, and what early investment (if any) is justified?
4. Write 3 sentences on 'why ML is better at detection than novel offense right now'.
5. Sketch the 'minimum viable AI defense stack' for a small org (which tools/techniques).`,
    },
    {
      id: 2,
      slug: "02-deepfakes-ai-social-eng",
      title: "Deepfakes, Voice Cloning & AI Social Engineering",
      level: "intermediate",
      tag: "concept",
      duration: "40 min",
      description:
        "When seeing is not believing: voice/video clone attacks, phishing at scale, and the human defenses that still hold.",
      content: `
# Deepfakes, Voice Cloning & AI Social Engineering

## The threat

AI makes two things real (or near-real) at commodity cost:
1. **Voice clones** — few minutes of audio → a convincing phone call from "your CEO"
2. **Video deepfakes** — low-quality but functional for Zoom-style social manipulation
3. **Personalized phish** — AI crafts individualized messages from OSINT data; no more 'Dear Customer' mass blast

## Case reality

- Fraud calls using cloned executive voices asking for wire transfers (billions already lost in deepfake fraud — bank transfer scams using audio/visual clones)
- Phishing emails with perfect local language + specific job context (AI does the context pull from LinkedIn)
- Social engineering at scale: AI generates a convincing 'IT help desk' persona on a call

## What still works: human process controls

- **Call-back verification** (never act on an out-of-band request from voice alone)
- **Two-person rule** for financial actions
- **Slow down** (the adversarial psychology is speed + authority)
- **Simulate**: run regular phishing/vishing exercises with the new AI-flavored lures
- The defense is *process*, not tech

## Tech defenses

- Mark-origin protocols (email authentication, DMARC, voice origin marking — STIR/SHAKEN for caller ID)
- Content provenance tracking (C2PA standard — provenance metadata)
- Enterprise: verify who's calling via known-number confirmations; block spoofed caller ID

## The honest view

AI social engineering is the most *practical* near-term threat: it scales, it fools humans reliably, and it costs almost nothing to create. The technical defenses lag; process + training is where orgs should invest now.
> When AI writes the phish, the only reliable firewall is a trained, *slow*, process-following human who verifies out-of-band.
`,
      defaultCode: `// policy: financial request verification
function approvePayment(request) {
  if (request.source === 'voice-message') return 'BLOCK: require call-back verification';
  if (!request.twoPersonApproved) return 'BLOCK: 2-person rule';
  if (request.urgency === 'immediate') return 'BLOCK: slow down';
  return 'ALLOW';
}
console.log(approvePayment({ source: 'voice-message', urgency: 'immediate' }));`,
      solution: `function approvePayment(request) {
  if (request.source === 'voice-message') return 'BLOCK: require call-back verification';
  if (!request.twoPersonApproved) return 'BLOCK: 2-person rule';
  if (request.urgency === 'immediate') return 'BLOCK: slow down';
  return 'ALLOW';
}
console.log(approvePayment({ source: 'voice-message', urgency: 'immediate' }));`,
      hint: "Voice/video forgery scales; the defense is slow verification + two-person rule + training.",
      challenge: `**Organization — AI-Phish Response:**
1. Design a 5-minute vishing scenario using a cloned voice; write the defense checklist for the recipient.
2. Draft a 'deepfake policy' for financial actions (1 page).
3. How would you test your org against AI-phish? (what simulation would you run quarterly?)
4. Name 2 technical controls (C2PA, STIR/SHAKEN) — where they help, where they don't.
5. Write a 2-sentence advice line to send every employee about AI lures.`,
    },
    {
      id: 3,
      slug: "03-ai-powered-malware",
      title: "AI-Powered Malware & Evasion",
      level: "intermediate",
      tag: "concept",
      duration: "40 min",
      description:
        "Polymorphism, LLM-driven evasion, sandbox detection, and why AI might make malware fragile rather than unstoppable.",
      content: `
# AI-Powered Malware & Evasion

## What 'AI in malware' means in practice

1. **Mutation / polymorphism** — ML generates variant code to evade signature detection
2. **LLM-driven payloads** — craft code that avoids known patterns; probe behavior dynamically
3. **Smart sandbox detection** — the malware reads environment, behaves benignly if sandboxed
4. **Autonomous movement** (research) — agents that plan multi-step lateral hops

## What's actually concerning (near-term)

- **AV/EDR evasion via mutation**: not new (packers did this), but ML makes variant generation faster and more varied
- **LLM-assisted obfuscation**: easy access to code obfuscation advice and polymorphic shellcode patterns
- **Contextual payload building**: attacker LLM tailors the payload for specific defense stacks (from recon data)

## Why AI malware is fragile too

- Offense needs *robustness*; LLM-generated code has logic errors, fails edge cases
- Too much automation = noisy behavior that behavioral defenses catch
- Sandbox evasion tricks are detectable: check for timing anomalies, API-usage patterns

## Blue defenses that still win

- **Behavioral detection** (hunting the intent, not the code): process tree anomalies, network beacons, credential access patterns
- **ML-driven heuristics** (UEBA / anomaly on network + endpoint) beat signature-only
- **Containment**: isolate fast, contain blast radius — AI doesn't make the blast radius smaller
- **Patch + hardening**: the boring stuff still defeats fragile malware

## The realistic AI-malware timeline

Short term: more polymorphism, better phishing
Medium term: adaptive sandbox evasion and targeted payloads
Long term: possibly agents — fragile but creative. The defense: resilience + detection, not perfection.
> AI makes malware more *polymorphic*, not invincible. Behavioral detection + resilience + the basics still win more often than the headlines say.
`,
      defaultCode: `// concept: behavioral rule beats polymorphic payload
const rules = [
  'process-tree: x modifies y then contacts z',
  'network: periodic same-size POST to unknown external',
  'credential: lsass/sam access pattern',
  'behavioral: persistence + execution from temp'
];
console.log('behavioral rules beat signature:');
rules.forEach((r, i) => console.log((i+1) + '. ' + r));`,
      solution: `const rules = [
  'process-tree: x modifies y then contacts z',
  'network: periodic same-size POST to unknown external',
  'credential: lsass/sam access pattern',
  'behavioral: persistence + execution from temp'
];
console.log('behavioral rules beat signature:');
rules.forEach((r, i) => console.log((i+1) + '. ' + r));`,
      hint: "Mutation evades signatures; behavior still leaks; isolation + triage wins.",
      challenge: `**Defense Design — Counter AI-Malware:**
1. Name 3 behavioral detections that should fire on *any* mutation of a credential-dump + exfil tool.
2. Design a 'contain first' incident response flow for suspected AI-malware.
3. Sketch a home-lab proof: a payload that mutates (even simple XOR rewrites) and why your behavioral rule still catches it.
4. What does your EDR/EDR-like rule do vs a YARA signature? write the tradeoff.
5. Write the 'blue team win-condition' for this threat space (not 'detect all', what?).`,
    },
    {
      id: 4,
      slug: "04-quantum-computing-impact",
      title: "Quantum Computing & Cryptographic Risk",
      level: "intermediate",
      tag: "concept",
      duration: "40 min",
      description:
        "Factoring large numbers got a real machine; RSA/ECC are on the clock. The NIST post-quantum standards are here — migration is mandatory.",
      content: `
# Quantum Computing & Cryptographic Risk

## What quantum does (and doesn't) break

- **Shor's algorithm** (theoretical): breaks RSA, ECC (factoring/discrete log) efficiently
- **Grover's algorithm**: halves symmetric key strength (AES-256 → ~128 effective)
- Quantum machines today: small-scale; breaking RSA-2048 is not yet practical, but the threat is real enough to act

## What is NOT broken

- Symmetric crypto (AES-256 with minor param bump)
- Hashing (SHA-256 is fine)
- Post-quantum schemes (NIST PQC: Kyber, Dilithium, etc.)

## NIST standards (the migration guide)

\`\`\`
Kyber (ML-KEM)    -> key exchange (used in TLS)
Dilithium (ML-DSA) -> digital signatures (certs, code-sign)
\`\`\`

## Why 'harvest now, decrypt later' matters

- An adversary captures encrypted data TODAY, decrypts it in 10 years when QC is viable
- Long-lived secrets (patient data, state secrets, key material) need quantum-resistant protection NOW
- TLS already supports PQC in some libraries (Google Chrome, Cloudflare) — the migration has begun

## Migration strategy

1. Inventory: where is RSA/ECC used in your stack (keys, certs, protocols)
2. Classify by data lifetime: short (1yr) vs long (10yr+)
3. Start: rotate to PQC key exchange in TLS (Kyber)
4. Plan: migrate code-signing and long-lived keys to Dilithium
5. Test: PQC libraries have different sizes/perf — measure

## The realistic view

- Doomsday QC is not imminent; NIST says plan now
- Governments already mandate PQC migration timelines
- The risk is real for long-lived secrets; 'wait and see' is a liability if data lifetime > time-to-QC

## The blue team takeaway

Know your crypto inventory. The org that doesn't know where RSA lives will scramble when the standard rolls out.
> Quantum computing doesn't 'break everything' — it breaks RSA/ECC. Act now on long-lived secrets; plan migration for the rest; symmetric crypto stays safe.
`,
      defaultCode: `// inventory: where is RSA/ECC used?
const cryptoStack = [
  { item: 'tls-cert', algo: 'ECC', migration: 'kyber-x25519' },
  { item: 'code-sign', algo: 'RSA-4096', migration: 'dilithium' },
  { item: 'aes-key', algo: 'AES-256', migration: 'no change needed' }
];
cryptoStack.forEach(c => console.log(c.item, '|', c.algo, '|', c.migration));`,
      solution: `const cryptoStack = [
  { item: 'tls-cert', algo: 'ECC', migration: 'kyber-x25519' },
  { item: 'code-sign', algo: 'RSA-4096', migration: 'dilithium' },
  { item: 'aes-key', algo: 'AES-256', migration: 'no change needed' }
];
cryptoStack.forEach(c => console.log(c.item, '|', c.algo, '|', c.migration));`,
      hint: "Shor breaks RSA/ECC; AES-256/SHA stay fine; Kyber/Dilithium = migration targets.",
      challenge: `**Organization — PQC Audit:**
1. List every place RSA/ECC is used in your org stack (TLS, VPN, code signing, database connections).
2. Which of those protect data with lifetime > 10 years?
3. Write a 6-month PQC-readiness plan for one system.
4. Find a TLS library that supports Kyber; note the config change (example).
5. Write 3 sentences on 'harvest now, decrypt later' for your CISO.`,
    },
    {
      id: 5,
      slug: "05-defending-with-ai",
      title: "Using AI for Defense: UEBA, SOAR, Anomaly",
      level: "intermediate",
      tag: "lab",
      duration: "40 min",
      description:
        "The good side: ML-driven UEBA, anomaly detection in networks/endpoints, triage automation, and what 'AI-augmented SOC' means for a practitioner.",
      content: `
# Using AI for Defense: UEBA, SOAR, Anomaly

## ML-powered defense stack

| Layer | Tool type | What ML adds |
|-------|-----------|--------------|
| NDR/NDR | ML anomaly (Zeek → model) | New baseline behavior, not static rules |
| Endpoint | UEBA / behavioral | 'User X' profile drift → alert |
| SIEM/SOAR | ML triage classifier | Auto-prioritize, reduce noise |
| Vulnerability | Risk-based scoring (EPSS) | Prioritize by *exploit likelihood*, not CVSS alone |

## UEBA in practice

- Build baseline: 'alice usually accesses these systems at these times'
- ML flags: unusual hour, new data access, new location
- Requires: good telemetry + a minimum training window (weeks)
- Limitation: training-data quality = quality of detection; noisy initial FPs expected

## Anomaly-based network detection

- Baseline per host: connections, bytes, timing
- Flag: new destination, new timing pattern, large egress
- Combine with Zeek + ML (e.g., ml-ids concepts) for beaconing detection

## Practical SOAR automation

- High-confidence phishing: auto-isolate host
- Low-confidence alert: auto-enrich (whois, reputation, last contacts) then queue for analyst
- This triage automation is the *near-term AI win* for most SOCs

## Deploying ML in security (the craft)

1. Start with **detection-in-test** (log-only), never block
2. Measure F1 (precision vs recall), not just accuracy
3. Retrain periodically (threat drift)
4. Document model assumptions (the #1 audit question)
5. Keep a human in the loop on high-impact actions

## The honest limit

ML excels at *pattern recognition at scale*; it does not understand *intent*. The human analyst provides context; ML provides volume and speed.

> AI-augmented defense means the analyst stops spending time on known-noise and starts focusing on what ML can't decide. That's the real productivity unlock.
`,
      defaultCode: `// anomaly alert example (concept)
const alerts = [
  { host: 'alice-ws', metric: 'new_external', value: 1, baseline: 0, ml_conf: 0.92, action: 'auto-enrich' },
  { host: 'dave-ws', metric: 'new_external', value: 50, baseline: 2, ml_conf: 0.99, action: 'auto-isolate' }
];
alerts.forEach(a => console.log(a.host, a.metric, 'conf', a.ml_conf, '->', a.action));`,
      solution: `const alerts = [
  { host: 'alice-ws', metric: 'new_external', value: 1, baseline: 0, ml_conf: 0.92, action: 'auto-enrich' },
  { host: 'dave-ws', metric: 'new_external', value: 50, baseline: 2, ml_conf: 0.99, action: 'auto-isolate' }
];
alerts.forEach(a => console.log(a.host, a.metric, 'conf', a.ml_conf, '->', a.action));`,
      hint: "ML for triage/anomaly at scale; SOAR auto-enriches/isolates; humans judge edge cases.",
      challenge: `**Home Lab — ML-Augment One Detection:**
1. Choose one detection (e.g., beaconing or UEBA-like user anomaly).
2. Sketch a baseline: what 'normal' looks like, and what 'anomaly' would flag.
3. Decide the automated action (enrich, ticket, isolate) by confidence threshold.
4. Draft a 1-page model card: data source, assumption, limitations, retrain cadence.
5. Write what a 'false positive budget' means for your SOC.`,
    },
    {
      id: 6,
      slug: "06-future-professional",
      title: "The Future & Your Professional Path",
      level: "intermediate",
      tag: "concept",
      duration: "35 min",
      description:
        "Where the field is heading, the evolving role of the security practitioner, and a realistic learning path after this course.",
      content: `
# The Future & Your Professional Path

## Where we are heading (near-term reality)

- AI augments SOC triage + detection engineering; analysts shift to higher-order thinking
- Supply-chain integrity (SBOM, code signing, provenance) becomes mandatory
- Zero-trust is the default architecture, not a buzzword
- Cloud-native security dominates: CSPM, CWPP, runtime policy-as-code
- PQC migration starts now for long-lived secrets

## Skills that remain valuable (not hyped)

| Skill | Why it stays |
|-------|-------------|
| Foundations (networking, OS, crypto) | Every new tool is built on them |
| Detection engineering (writing rules) | The core of SOC craft |
| Threat modeling / risk | Translates tech into business |
| Scripting/automation (Python, bash) | Triage, detection, response at scale |
| Forensics & incident response | Always needed when things fail |
| Communication / writing | Translates technical findings into action |

## Career paths (honest)

- **SOC Analyst** (L1→L2→L3) → Detection Engineering → Threat Hunting
- **Penetration Tester** → Red Team → Adversary Emulation / Purple Team
- **Incident Response / DFIR** → Threat Intel → Enterprise IR Lead
- **Cloud Security** → DevSecOps → Cloud Security Architect
- **GRC / Risk** → Privacy → CISO track

## Learning path after this course

1. **Pick a lane** and go deep (no more 'I know a little of everything')
2. Get a lab running at home (the entire skill set is hands-on)
3. Build public work (write-ups, CTF results, small tools)
4. Take an entry cert (not to gatekeep, but to prove basics)
5. Get involved: community CTFs, bug bounties (recon/triage), local groups
6. Keep learning: the field moves fast; your notes + home labs move with it

## The mindset

- Stay curious; stay humble; keep building
- Security is a craft, not a set of facts — you build skill by doing
- Share what you learn (ethically) — the community grows together

> You've learned the full stack: from the foundations, through threats and defenses, to the edge. Now go specialize, build, and keep learning — the field needs practitioners, not commentators.
`,
      defaultCode: `// your post-course plan as data
const plan = [
  { action: 'pick-a-lane', deadline: '1 week', why: 'depth beats width' },
  { action: 'build home lab', deadline: '2 weeks', why: 'everything is hands-on' },
  { action: 'write up a CTF', deadline: 'monthly', why: 'public work = proof' },
  { action: 'start cert study', deadline: '1 month', why: 'prove basics' }
];
plan.forEach(p => console.log(p.action, '|', p.deadline, '|', p.why));`,
      solution: `const plan = [
  { action: 'pick-a-lane', deadline: '1 week', why: 'depth beats width' },
  { action: 'build home lab', deadline: '2 weeks', why: 'everything is hands-on' },
  { action: 'write up a CTF', deadline: 'monthly', why: 'public work = proof' },
  { action: 'start cert study', deadline: '1 month', why: 'prove basics' }
];
plan.forEach(p => console.log(p.action, '|', p.deadline, '|', p.why));`,
      hint: "Pick a lane, build labs, write public work, keep learning. Foundations carry you through every shift.",
      challenge: `**Final — Your Plan:**
1. Pick your career path from the list above; write why it fits.
2. Draft your 30-day learning plan (topics + home-lab goals).
3. Name one thing you'll build/write and publish within 60 days.
4. List the 3 most important skills from this entire course for your chosen path.
5. Write 3 sentences on how you'll stay current (feeds, labs, community).`,
    },
  ],
};