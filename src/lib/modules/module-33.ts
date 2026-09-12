import type { Module } from "../curriculum";

export const module33: Module = {
  id: "module-33",
  slug: "33-cryptanalysis",
  title: "Cryptographic Attacks & Cryptanalysis",
  description:
    "Breaking weak crypto where it's misused: brute force, rainbow tables, timing attacks, padding oracle, hash collisions, side channels, and quantum-era threats.",
  language: "Crypto",
  lessons: [
    {
      id: 1,
      slug: "01-crypto-misuse-patterns",
      title: "Cryptographic Misuse Patterns",
      level: "intermediate",
      tag: "concept",
      duration: "40 min",
      description:
        "Most crypto 'breaks' come from misuse not math: weak ciphers, ECB, short keys, token reuse, homegrown algorithms.",
      content: `
# Cryptographic Misuse Patterns

## The honest headline

Modern algorithms (AES, RSA, ECDH, SHA-2/3) are sound. Attacks on crypto in the real world are almost always **misuse**: wrong mode, weak key, reusing nonces, funny PRNG, or custom algorithms.

## Misuse playbook

| Pattern | Why it's weak | Classic result |
|---------|---------------|----------------|
| **ECB mode** | Same plaintext block → same ciphertext block | Data repeats visible in patterns (see the penguin) |
| **CBC + predictable IV / reuse** | IV reuse leaks relationships | plaintext recovery with a few chosen pairs |
| **Short keys** (40-bit, 56-bit DES) | Exhausted by dedicated hardware | DES keys brute-forced feasibly |
| **Nonce reuse** (CTR/GCM, ChaCha) | Stream keystream repeats | XOR of two plaintexts recoverable |
| **Unpadded RSA** signature schemes | Multiplicative properties | forgery / Bleichenbacher-type attacks |
| **Weak PRNG**: rand() seeded | Predictable outputs | Predict all 'random' keys |
| **Homegrown crypto** | No peer review | Almost certainly broken (rare exceptions) |
| **Hashing passwords once, fast** | No salt + fast hash | Rainbow/GPU crack trivial |

## The impossible of 'verifying' crypto with eyes

Signatures/encryption look identical to a human. That's why *operation* and *coverage* matter:

- Are libraries current (OpenSSL/LibreSSL), not hand-rolled?
- Are all data-at-rest/in-transit paths covered (a forgotten HTTP endpoint?)
- Key management: rotation, HSMs, vault, no keys in configs
- Logging: CBC/ECB/nonce audit impossible on plaintext—so approve by design, not by inspection

\`\`\`
Good default stack for new code:
AES-256-GCM (AEAD) or ChaCha20-Poly1305 at rest/in transit
Argon2id/bcrypt/scrypt for password hashes (salted)
X25519 + AEAD for key exchange; ECDSA for signing
\`\`\`

> Learn the misuse table cold. When you audit a system and can name which pattern its crypto follows, you've already found the report's centerpiece.
`,
      defaultCode: `// The "never do this" strength guide
const hashes = {
  md5: 'broken',
  sha1: 'broken-collision',
  bcrypt: 'ok',
  argon2id: 'recommended'
};
function passwordStorage(h) {
  console.log(h, '=>', hashes[h] || 'unknown');
}
passwordStorage('md5');
passwordStorage('argon2id');`,
      solution: `const hashes = {
  md5: 'broken',
  sha1: 'broken-collision',
  bcrypt: 'ok',
  argon2id: 'recommended'
};
function passwordStorage(h) {
  console.log(h, '=>', hashes[h] || 'unknown');
}
passwordStorage('md5');
passwordStorage('argon2id');`,
      hint: "Wrong mode, weak key, nonce reuse = 90% of real crypto failures.",
      challenge: `**Home Lab — Spot the Misuse:**
1. Find any 'encryption' in a project you own or can read.
2. Identify: algorithm, mode, key handling, nonce/IV, PRNG use.
3. Grade it against the misuse table; be honest what's wrong.
4. If you find a real misuse in YOUR OLD code — fix it (upgrade lib/mode).
5. Write 4 lines: 'crypto audit one-pager' you could hand a developer.`,
    },
    {
      id: 2,
      slug: "02-brute-rainbow-tables",
      title: "Brute Force, Rainbow Tables & Password Hashes",
      level: "intermediate",
      tag: "lab",
      duration: "45 min",
      description:
        "Search space math, GPU cracking economics, salted-hashing, rainbow chains — and why 'complex' vs 'salted+slow' decides passwords.",
      content: `
# Brute Force, Rainbow Tables & Password Hashes

## Search-space math

\`\`\`
charset 26 (a-z) ^ length 6  = 308,915,776  (~3e8)
alphabets+punct 95 ^ 8        = 6.6e15
\`\`\`
Every extra char multiplies brutally. That's why length beats 'complexity'.

## GPU economics

- RTX-class: ~10 GH/s for MD5, ~100 Mil/s for bcrypt
- MD5/ SHA1/NTLM cracks in hours-minutes with rule lists
- bcrypt/argon2 with cost: seconds-to-years per hash → chosen to make GPUs sad

## Salt, the equalizer

- Salt random-per-user: no precomputed tables (rainbow) reuse; identical passwords hash differently
- Slow hash (work factor) multiplies per-attempt cost
- **Bottom line**: salted+slow changes attack from 'instantly look up' to 'brute force per user'

## Rainbow tables (and why they lost)

Precomputed hash→plaintext chain tables (1 TB of chains). Speed: O(1) lookups. They died to: salts (make tables useless) + modern memory. They still exist to explain *time-memory tradeoffs*.

## The practical crack ladder

\`\`\`
# from your OWN hashes only
hashcat -m 0 -a 0 hash.txt rockyou.txt                # fast
hashcat -m 1000 -a 0 hash.txt rockyou.txt -r rules/best64.rule
hashcat -m 3200 -a 3 '?l?l?l?l?l?d?d?'                # bcrypt mask (slow!)
john --format=raw-sha256 --wordlist=rockyou.txt hash.txt
\`\`\`

## Defense takeaways

- Store with argon2/bcrypt + per-user salt + reasonable cost
- Enforce length (15+) over mere 'complex'
- Never reuse; breach-compare; no plaintext heaven (the wiki of 'pwned passwords')
`,
      defaultCode: `// illustrate search space growth
function space(chars, len) { return Math.pow(chars, len).toExponential(2); }
console.log('6 chars a-z  :', space(26, 6));
console.log('8 chars 95   :', space(95, 8));
console.log('20 chars 95  :', space(95, 20), '(practically infinite)');`,
      solution: `function space(chars, len) { return Math.pow(chars, len).toExponential(2); }
console.log('6 chars a-z  :', space(26, 6));
console.log('8 chars 95   :', space(95, 8));
console.log('20 chars 95  :', space(95, 20), '(practically infinite)');`,
      hint: "Length wins over 'complication'; salt+slow hash turns tables useless.",
      challenge: `**Home Lab — Crack Your Own Hash:**
1. Generate: echo -n 'MyL0ngPassphrase!' | sha256sum  (YOUR password, you own it).
2. Crack it with john (wordlist includes it? probably not) — note the timeout.
3. Now make a 'realistic' one (a lyric + year) and crack with rules — share the experience.
4. Generate the same password with a salted argon2/gensalt hash (or bcrypt) — try again — measure the pain.
5. Write '3 password-storage rules' pad locked on your desk.`,
    },
    {
      id: 3,
      slug: "03-timing-side-channel",
      title: "Timing Attacks & Side Channels",
      level: "advanced",
      tag: "lab",
      duration: "45 min",
      description:
        "Timing differences leak secrets: login user-enum, toString overhead, padding oracle — and constant-time coding that makes timing flat.",
      content: `
# Timing Attacks & Side Channels

## The side channel: what your machine leaks without meaning to

A computer leaks information *through physics*: time taken, power used, EM radiated, cache hits/misses. Attackers measuring those physical signals can recover keys — all without 'breaking' the math.

## Timing attacks: the accessible one

If 'check password' returns faster when the first char is wrong, an attacker can time how many characters matched:

\`\`\`
// naive (avoid!)
function check(input) {
  // returns after first mismatch -> timing reveals prefix length
}
// constant-time (use hashes/compare)
crypto.timingSafeEqual(hash(input), hash(stored))
\`\`\`

**Real world**:
- User enumeration: login for unknown user returns faster/slower
- Padding oracle (Bleichenbacher / CBC-padding): server's error *timing* distinguishes 'bad padding' vs 'bad MAC' → decrypt chosen ciphertexts

## Padding oracle explained (concept)

\`\`\`
CBC + server = unpad: if "no, padding bad" response differs
from "yes but MAC bad" → attacker tweaks bytes, oracle leaks:
   manipulate 1 block, observe padding OK/MAC fail,
   infer plaintext byte-by-byte (a byte-at-a-time decryption oracle)
\`\`\`

## Defending against timing

- **Constant-time code**: compare complete buffers (timingSafeEqual), never short-circuit on secret values
- **AEAD with MAC-then-decrypt** (unpad first, MAC after) — the 'different errors' disappear if you return the SAME generic error
- Use authenticated modes (GCM) + fixed error text
- Normalize login duration (fake work) to kill user-enum timing

## Measuring matters

\`\`\`
python3 - <<'EOF'
# log response times for known vs unknown user (lab)
# typical: p50/p99 difference
EOF
\`\`\`
TC (timing attack) mitigation checks: run 1000 samples, look for mean shift.
`,
      defaultCode: `// constant-ish time compare concept
const crypto = require('crypto');
function safeEquals(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);  // same length guard
}
console.log('safe compare works:', safeEquals('secret','secret'));`,
      solution: `crypto.timingSafeEqual(hash(a), hash(b))
// Fix: compare hashes of equal length constant-time; return ONE generic error.`,
      hint: "Fixed-length constant-time compare + unified errors + AEAD = timing oracle starved.",
      challenge: `**Home Lab — Measure a Timing Gap:**
1. Write (lab) a naive login compare; time 'aaaaaaa' vs 'a' - observe mean difference.
2. Apply timingSafeEqual; re-measure; confirm flat.
3. (Optional, pure-writing) Read about Bleichenbacher padding oracle; explain in 3 lines.
4. Audit a codebase you own for 'user not found' vs 'wrong pass' differences in response or timing.
5. Write 3 rules your team should adopt for auth endpoints.`,
    },
    {
      id: 4,
      slug: "04-hash-collisions-length",
      title: "Hash Collisions, Length Extension & Block-chain Games",
      level: "advanced",
      tag: "lab",
      duration: "45 min",
      description:
        "Collision attacks, birthday bounds, preimage ambitions, and the length-extension weakness of naive MAC = SHA1(key||msg).",
      content: `
# Hash Collisions, Length Extension & Block-chain Games

## The hash threat model

| Property | Attacker ideal | Modern answer |
|----------|----------------|---------------|
| **Collision resistance** | Find any a≠b with H(a)=H(b) | SHA-256: ~2^128 (birthday) — fine |
| **Preimage resistance** | Hmm, find x for H(x)=y | 2^256 — fine |
| **Second-preimage** | Given a, find b same hash | 2^256 — fine |
| **Avalanche** | Small change → huge change | standard |

## Birthday bound reality

For n-bit hash, *collisions* appear by ~2^(n/2) (birthday paradox). MD5 (128-bit)→2^64→broken. SHA-1→2^80→broken in practice (SHAttered, 2017). SHA-256 destined-OK. The message: hash length != key length.

## Length-extension attack

Merkle–Damgård structure (MD5/SHA1/SHA2) lets you append to a message given H(m) but not m — IF H is used naively as a MAC:

\`\`\`
MAC = SHA1(secret || message)
attacker learns, without secret, SHA1(secret || message || append)
  -> forge a 'valid' signature for a modified message
\`\`\`
**Fix**: HMAC (keyed, length-immune), or SHA-3/tree-hash for keyed use.

## Block-chain connections

- **Proof-of-work** exploits hash difficulty for consensus (find nonce)
- **Chaining**: each block hashes the previous (mutation detection)
- **51% + reorg attacks** use hash-rate races — availability/extortion vectors
- Smart contract bugs deserve their own session (in M40)

## In your kit

\`\`\`
# collision check on legacy files (lab): sha1sum vs sha256sum
# avert: prefer HMAC-SHA256 for MAC; SHA-512 output for signatures
# integrity commands: sha256sum, hmac-calc patterns
\`\`\`

> When an inherited system 'scores a hash' for integrity, ask: is it HMAC? Is the length immune? Is the *output* ≥256-bit? Collision/padded answers win audits.
`,
      defaultCode: `// Right/recht choices for keyed uses
const choices = [
  { use: 'MAC', ok: 'HMAC-SHA256' },
  { use: 'signature', ok: 'EdDSA' },
  { use: 'integrity-log', ok: 'HMAC-SHA256 or SHA-512 + keyed' }
];
for (const c of choices) console.log(c.use, '->', c.ok);`,
      solution: `const choices = [
  { use: 'MAC', ok: 'HMAC-SHA256' },
  { use: 'signature', ok: 'EdDSA' },
  { use: 'integrity-log', ok: 'HMAC-SHA256 or SHA-512 + keyed' }
];
for (const c of choices) console.log(c.use, '->', c.ok);`,
      hint: "Naive secret||msg hashing is length-extendable; HMAC or SHA-3 is not.",
      challenge: `**Home Lab — Think It Through:**
1. Write the naive MAC (SHA1(secret+msg)) and demonstrate (using a hash-extension python lib or the concept) that an attacker can append.
2. Write the HMAC version; show the extension attempt now fails.
3. Check your own apps/configs: any 'secret salt' hashing we should be HMAC?
4. Read about SHAttered; summarize in 3 lines.
5. Write your 'hash discipline' 4-liner.`,
    },
    {
      id: 5,
      slug: "05-quantum-postquantum",
      title: "Quantum Threats & Post-Quantum Cryptography",
      level: "advanced",
      tag: "concept",
      duration: "35 min",
      description:
        "Shor vs RSA/ECC, Grover vs symmetric key, harvest-now-decrypt-later — and the NIST PQC winners you'll be deploying.",
      content: `
# Quantum Threats & Post-Quantum Cryptography

## What the threat actually is

**Shor's algorithm** (quantum) can factor integers and solve discrete log in polynomial time → breaks textbook RSA, DH, ECDSA/ECDH — the internet's public-key layers.

**Grover's algorithm** (quantum) square-roots brute force → 128-bit AES ≈ 64-bit effective for search; solvable with longer keys (AES-256, SHA-384 stay comfortable).

## Timeline honesty

- Quantum computers are small; no one breaks RSA-2048 today
- But 'Harvest now, decrypt later' is real: encrypted data recorded today becomes plaintext once long-term-secure quantum arrives
- Transition windows: years of migration; a patient adversary waits

## The NIST post-quantum winners (announced 2024)

| Algorithm | Purpose | Notes |
|-----------|---------|-------|
| **ML-KEM (Kyber)** | Key encapsulation (replaces DH/ECDHE) | Lattice-based |
| **ML-DSA (Dilithium)** | Digital signatures | Lattice-based |
| **SLH-DSA (SPHINCS+)**: stateless hash signatures | Backup, hash-based | Slower, huge signatures, ultra-conservative |

Plus **Falcon/KNIGHT** variants for special use.

## What changes for defenders

- Key exchange: hybrid TLS (X25519 + ML-KEM) — so today's PFS works and quantum-proofing lands atomically
- Today's public key ops: RSA/ECDH→ ML-KEM/ML-DSA in standards (RFC 8784, TLS 1.3 5093-ish hybrids)
- Post-quantum keys: bigger; signature sizes differ (use-case aware)

## Practical prep (even today)

\`\`\`
1. Inventory crypto use: TLS, code signing, email (S/MIME & OpenPGP), VPN, HSM
2. Prefer hybrid stacks now (X25519 + ML-KEM combo in your VPN/TLS)
3. Validate your CA/provid-w will rotate to PQC
4. Long-term data: apply 'harvest-now' lens (PQC-encrypt archival)
5. Watch NIST IR / vendor mappings as they land
\`\`\`

## The philosophical point

Crypto is clock-driven: you plan for the break *before* the computer exists, because data lasts longer than crypto reputations.

> Post-quantum is not 'next decade' — it's 'this decade's migration plan'. The professional stack: hybrid now, inventory crypto, prioritize long-lived secrets.
`,
      defaultCode: `// inventory-minded check
const ciphers = ['AES-256-GCM','X25519','RSA-2048','ECDSA-P256','ML-KEM768'];
for (const c of ciphers) {
  console.log(c, c.includes('RSA')||c.includes('ECDSA') ? 'quantum-weak (plan)' : 'pq-ready/ok');
}`,
      solution: `const ciphers = ['AES-256-GCM','X25519','RSA-2048','ECDSA-P256','ML-KEM768'];
for (const c of ciphers) {
  console.log(c, c.includes('RSA')||c.includes('ECDSA') ? 'quantum-weak (plan)' : 'pq-ready/ok');
}`,
      hint: "Hybrid crypto (X25519 + ML-KEM) + inventory + harvest-now lens for archival.",
      challenge: `**Home Lab — PQC Ready-Check:**
1. Run \`openssl ciphers | grep -i ecdhe\` — see the modern set your OS supports.
2. Search: do your browser/TLS versions include hybrid (X25519Kyber768)? (Chrome/Edge soon did; check about:config/)
3. Inventory YOUR long-lived secrets: backups encrypted with expired-era algos?
4. Read the NIST PQC summary page (nist.gov) and note 3 facts.
5. Write a 1-page 'quantum readiness' checklist for your own data.`,
    },
  ],
};