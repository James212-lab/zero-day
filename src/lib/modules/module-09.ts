import type { Module } from "../curriculum";

export const module09: Module = {
  id: "module-09",
  slug: "09-social-engineering",
  title: "Social Engineering & Human Factors",
  description:
    "Phishing, pretexting, baiting, and the psychology of manipulation — because the human is still the #1 vulnerability.",
  language: "Human Security",
  lessons: [
    {
      id: 1,
      slug: "01-social-engineering-psychology",
      title: "The Psychology of Social Engineering",
      level: "beginner",
      tag: "concept",
      duration: "30 min",
      description:
        "Authority, scarcity, urgency and reciprocity — the cognitive levers every attacker pulls.",
      content: `
# The Psychology of Social Engineering

## Why Attackers Attack People

Humans:
- Are busy and distracted
- Want to help / be polite
- Fear authority and urgency
- Follow process blindly
- Are easier than software to exploit

Social engineering bypasses every firewall, AV, and EDR on the planet, because the "compromise" happens in a human brain.

## The Six Influence Principles (Cialdini)

1. **Authority** — "IT Support calling, I need your password NOW"
2. **Scarcity** — "Only 3 licenses left, act today!"
3. **Urgency** — "Your account will be locked in 24h unless you verify"
4. **Reciprocity** — "Here's a free gift; just confirm your details"
5. **Consistency/Commitment** — "You already signed up; just update the details"
6. **Social proof** — "Thousands already updated, you should too"

> **The attacker's job** is to trigger these levers faster than you can think. Your defense is a pause: *Who is actually asking? Why would they ask THIS way?*

## The Helper's Dilemma

Legitimate help desks ask for details. Attackers mimic that. The tension: a good culture is trusting; a secure culture questions. Solutions:

- **Verify in a different channel** — hang up and call the known number
- **Never give *current* secrets** — passwords, MFA codes, OTPs are never "re-confirmed" by real IT
- **The password reset rule** — real support resets, never asks for the existing one

## The "Human Firewall" Model

Treat *employees as sensors*, not as the weakest link:

1. Training: recognize + report (phishing drills)
2. Reporting: one-click "report phishing" that reaches SOC
3. Rewards: praise reports, never punish a "was tricked" employee (they report NEXT time)
4. Process: no executive override by email/phone alone (the classic "CEO fraud")

## Pretexting, Baiting & Tailgating

| Technique | Play |
|-----------|------|
| Pretexting | Attacker fabricates a *story* (the pretext) to get info ("I'm from compliance, need your inventory") |
| Baiting | Physical/digital treats: infected USB ("Free movies!") |
| Tailgating/piggybacking | Follow someone through a badge door |
| Quid pro quo | "I'll fix your printer for your password" |
| Dumpster diving | Physical recovery of sensitive documents |

> **Blue-team insight:** treat every "unexpected request for information or action" as the trigger to verify. That one behavior blocks most of the playbook.
`,
      defaultCode: `// Simulate a phishing decision flow
function analyze(contact) {
  const red = [
    "password", "otp", "verify your account", "urgent",
    "payment", "gift card", "transfer today"
  ];
  const hits = red.filter(k => contact.toLowerCase().includes(k));
  return {
    suspicious: hits.length > 0,
    flags: hits,
    recommendation: hits.length > 0 ? "Do NOT respond. Verify via known channel." : "Proceed with caution."
  };
}
console.log(analyze("Verify your account now: send your OTP to confirm"));
console.log(analyze("Your weekly report is ready"));`,
      solution: `Flags language typical of social engineering. Teaching yourself the "red flag list" builds the human firewall habit.`,
      hint: "Add keywords: 'transfer', 'password reset', 'flash'.",
      challenge: `**Home Lab — Build a Phishing Radar:**
1. Collect 5 real phishing examples (from your spam folder, or public sources like Phishtank).
2. For each, identify: which influence principle does it use? What action does it demand? What does it want?
3. Write the "red flag checklist" you'd give a non-technical person (5-10 items).
4. Test yourself: draft a *legitimate* urgent email from your bank, then draft a *phishing* version. Compare — what feels different?
5. Bonus: set up a personal "report phishing" habit — use the built-in "report as phishing" in your mail client next time one slips through.`,
    },
    {
      id: 2,
      slug: "02-phishing-detection",
      title: "Phishing: Anatomy & Detection",
      level: "intermediate",
      tag: "lab",
      duration: "45 min",
      description:
        "Lure, hook, line and sinker — break down a phishing email, read headers, and spot the tells.",
      content: `
# Phishing: Anatomy & Detection

## The Phishing Chain

1. **Lure** — the channel: email, SMS (smishing), voice (vishing), QR (quishing), DM
2. **Hook** — the bait: an urgent message + a clickable something
3. **Payload** — the link to a fake login, or an attachment macro
4. **Exploitation** — credentials stolen, session hijacked, malware dropped
5. **Follow-up** — attacker uses the captured access

## Reading a Phishing Email (Analyst Style)

Check in order:

| Check | Where | Red Flag |
|-------|-------|----------|
| Sender | \`from\` header + \`reply-to\` | spoofed or foreign address; some other reply-to |
| Domain | DKIM/SPF/DMARC | Fail = not from the claimed org |
| Subject | urgency language | "URGENT", "Your account is locked" |
| Recipient | \`To\` vs \`Bcc\` blast | You're part of a mass send |
| Link target | HOVER (don't click) | \`paypa1.com\` or \`bit.ly/xxx\` |
| Attachment | extension + scanner | \`.docm\`, \`.zip\`+\`.exe\`, macro-enabled |

## Email Authentication: SPF, DKIM, DMARC

- **SPF** — DNS record listing authorized mail servers for a domain
- **DKIM** — domain signs email with a cryptographic key
- **DMARC** — policy on what to do with failing mail + reporting

\`\`\`bash
# Check the auth headers of a FRIEND's legitimate mail = the baseline
# (In Gmail: Show original / View source)
\`\`\`

**Defender job:** a properly configured DMARC policy is a *receiving* kill-switch that prevents 90% of spoofing.

## The Elevation-of-Privilege Inside Phishing

Modern phishing is surgical:
- **Credential phishing** — exact clone of the login page
- **MFA relay** — real-time passport problem: "I'm stealing a session, not a password"
- **BEC (Business Email Compromise)** — fake invoice, wire transfer, HR doc

## Detection Playbook for a SOC

1. Does the email claim to come from a domain with DMARC=reject, but no DKIM? → likely spoof
2. Does the link resolve to a recently registered domain? → recently-registered = platform option flagged
3. Attach a sandbox URL scanner on suspicious links
4. If a user submits it via "Report phishing" → triage quickly, the "spill rate" of legit-looking phish is minutes

## Defensive Layer (Not Just Training)

- DMARC policy: reject on all your domains
- **URL/DNS filtering** at the gateway (block newly-registered domains)
- **Sandbox scanning** of attachments
- **Crypto-email for executives** (vishing/AI-voice is on executives: fake messages from the "CEO")
- **Report button + quick SOC feedback loop**
`,
      defaultCode: `#!/bin/bash
# Quick-link safety check (no clicking!): resolve a link's real host
# Replace the URL with an actual link from a suspicious email
HOST=$(curl -sI -o /dev/null -w "%{url_effective}" "https://www.google.com" )
echo "Final URL host of that link: $HOST"
# (Each redirect printed = where you were really taken)`,
  solution: `Use -w "%{url_effective}" to see the FINAL URL after any redirects — phishing links often redirect to the fake site.`,
  hint: "Never click unknown links. Curl headers is a read-only peek.",
  challenge: `**Home Lab — Triage a Phish:**
1. Grab a real phishing email (spam folder). Save the full source (\`.eml\`).
2. Check headers: SPF/DKIM/DMARC results (Gmail shows "Show original").
3. Identify: sender spoof? reply-to? link target? attachment?
4. Safely resolve the payload link (read-only request) and document the landing domain.
5. Write a SOC-format "phishing triage note": verdict + IOCs + recommended block rule.`,
    },
    {
      id: 3,
      slug: "03-voice-ai-social-engineering",
      title: "Vishing, Smishing & AI-Powered Attacks",
      level: "intermediate",
      tag: "concept",
      duration: "30 min",
      description:
        "Phone scams, SMS scams, and the new weapon: AI-generated voice and video that sound exactly like your boss.",
      content: `
# Vishing, Smishing & AI-Powered Attacks

## Vishing — Voice Social Engineering

Phone-based attacks work because people are more polite on the phone than with email.

Classic plays:
- "Bank security" wants to confirm a transaction (then steal OTP)
- "IT support" needs your password for a "fix"
- Fake caller ID (spoofed numbers, "your bank" with the real number)

**Defense:** if a caller claims urgency about YOUR account — hang up and call the number on the BACK of your card / official site yourself.

## Smishing — SMS Social Engineering

Texts:
- "Your package is undeliverable, click to track" → credential harvest
- "Your account is suspended, verify here"
- QR-code quishing: a printed/stuck QR code on parking meters & machines — scan = phish

> **The QR phish is spicy:** it's physical, unverifiable, and phones often bypass URL filters. Research "quishing" — corporate 2FA pages are the target.

## AI: The New Social Engineering Weapon

Generative AI changed the game:

| Before | With AI |
|--------|---------|
| Phishing with typos | Flawless, targeted emails in the victim's language |
| Generic scams | Hyper-personalized using OSINT |
| Voice call "it's me" | Cloned CEO voice (LLM + TTS) |
| Static video | Deepfake video calls (rare but real) |

**The voice clone attack:** 3-10 minutes of a person's voice online is enough to clone. CEO voice calls CFO: "transfer $200k to vendor, I'll confirm by text." The CFO's "verify the number" check fails — the caller ID shows the CEO's number.

## The Nuclear Verification

For ANY decision that matters:

1. **Reverse call** — hang up, call the known-verified number
2. **Out-of-band check** — text/IM the person through a channel the attacker doesn't control
3. **Codeword** — family/business agreed secret phrase
4. **Verify the reason** — why NOW? why THROUGH THIS channel? why ME?

## OSINT in Social Engineering

Attackers gather (public) info before calling you:
- LinkedIn → role, org, colleagues
- Schedules/posts → where you are, business trips
- Breach dumps → reused passwords, personal details

Your LinkedIn post "On vacation in Dubai next week" + a cloned co-worker voice = a top-tier spearphish a day later.

> **The meta-defense:** treat anything *unexpected* that asks you to act as untrusted until verified. Surprises are the attack window.
`,
      defaultCode: `// Simple "verify-before-act" checklist simulator
function decide(req, outOfBandVerified) {
  const countsAsHighRisk = /transfer|otp|password|payment|urgent|immediately/.test(
    (req.action || "").toLowerCase()
  );
  if (countsAsHighRisk && !outOfBandVerified) {
    return "STOP. Verify via known channel.";
  }
  return "Continue with caution.";
}
console.log(decide({action: "transfer money now"}, false));
console.log(decide({action: "read the report"}, true));`,
  solution: `High-risk actions demand out-of-band verification. This is the 'nuclear option' applied to everyday requests.`,
  hint: "Program your own decision rule: risky + unverified → stop.",
  challenge: `**Home Lab — Model the Human Firewall:**
1. Write your "personal verification protocol" (3 steps for any risky request).
2. Research one real vishing/BEC/call-cloning incident and break it down into the chain.
3. Test a QR code in a fake-name environment: what does the QR reveal? (read-only, no login!)
4. Draft instructions for a non-technical relative on how to verify "It's me" calls.
5. Bonus: enable "Unknown caller" blocks on your phone and start practicing "verify from the official channel".`,
    },
  ],
};