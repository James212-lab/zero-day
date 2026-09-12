import type { Module } from "../curriculum";

export const module06: Module = {
  id: "module-06",
  slug: "06-cryptography-pki",
  title: "Cryptography & Public Key Infrastructure",
  description:
    "Symmetric and asymmetric encryption, hashing, digital signatures, TLS, and PKI — the math that protects everything.",
  language: "Cryptography",
  lessons: [
    {
      id: 1,
      slug: "01-intro-cryptography",
      title: "Cryptography Foundations",
      level: "beginner",
      tag: "concept",
      duration: "30 min",
      description:
        "Encryption vs encoding, symmetric vs asymmetric, confidentiality vs integrity — the map before the math.",
      content: `
# Cryptography Foundations

## Encryption Is Not Magic. It's Math + Trust.

Cryptography provides:
- **Confidentiality** — encryption hides data
- **Integrity** — hashing & MACs detect tampering
- **Authentication** — digital signatures prove identity
- **Non-repudiation** — signatures prevent denial

## Encoding vs Encryption vs Hashing (Know the difference!)

| Name | Reversible? | With key? | Example |
|------|------------|-----------|---------|
| Encoding | Yes | No key | Base64, URL-encoding |
| Encryption | Yes | Needs key | AES, RSA |
| Hashing | No | — | SHA-256 |

**Encoding is NOT security.** Base64 of a password is still readable by anyone who decodes it. Malware and DLP tools rely on people confusing these.

## Symmetric Encryption: Same Key Both Ways

\`\`\`
plaintext --[AES(key)]--> ciphertext --[AES(key)]--> plaintext
                          SAME KEY
\`\`\`

- Fast, good for bulk data (AES-128/256, ChaCha20)
- Problem: **key distribution** — both sides must share the secret securely

## Asymmetric Encryption: Key Pairs

\`\`\`
plaintext --[RSA(publicKey)]--> ciphertext --[RSA(privateKey)]--> plaintext
\`\`\`

- Everything encrypted with the public key only decrypts with the private key
- Solves key distribution (public key = share freely)
- Slow — used for key exchange + signatures, not bulk data

## How They Combine: Hybrid Crypto

Practical systems use both:
1. Asymmetric (RSA/ECC) to exchange a **session key**
2. Symmetric (AES/ChaCha) to encrypt the data with that key quickly

This is how TLS actually works.

## The Threat Model

- **Brute force** — guessing the key (kept impractical by key length)
- **Ciphertext attacks** — analyzing ciphertext patterns (prevented by proper modes/IVs)
- **Side-channel** — timing, power, cache leaks of the KEY
- **Protocol misuse** — using crypto wrong (ECB mode, short key, reusing nonces)

> **Golden rule:** cryptography does NOT fix broken systems. A bank vault door hangs on the wall it's attached to. Misused crypto is worse than no crypto — it invites false confidence.
`,
      defaultCode: `import hashlib

# Encoding vs hashing (the difference that matters)
print("BASE64 (reversible):", "c2VjcmV0" )
print("base64 decodes to:", __import__('base64').b64decode("c2VjcmV0"))
print("SHA-256 hash of 'secret':", hashlib.sha256(b"secret").hexdigest()[:24] + "...")
print("SHA-256 of 'secret' again is identical (deterministic, one-way)")`,
      solution: `Shows base64 is trivially reversible while SHA-256 is one-way. Use hashes for integrity/storage; encryption for confidentiality.`,
      hint: "Encoding has no key. Encryption has a key. Hashing isn't reversible at all.",
      challenge: `**Home Lab — Play With Crypto:**
1. Base64-encode and decode your name in a terminal (\`echo -n "name" | base64\` / \`| base64 -d\`).
2. Compare sha256sum and md5sum of a file, then change one character and re-hash — observe how the entire hash changes.
3. Read about the difference between ECB and CBC modes — why is ECB "leaky" (a photo of the same data looks identical)?
4. Answer in your notes: where in YOUR daily life is the data encrypted vs merely encoded?`,
    },
    {
      id: 2,
      slug: "02-hashing-integrity",
      title: "Hashing, MACs & Data Integrity",
      level: "intermediate",
      tag: "lab",
      duration: "30 min",
      description:
        "Hash functions, password storage, HMAC, and how integrity checks catch tampering.",
      content: `
# Hashing, MACs & Data Integrity

## Hash Functions: One-Way Summaries

A cryptographic hash (SHA-256, SHA3):
- Maps ANY input → fixed length output (256 bits)
- **Deterministic** — same input, always same output
- **Preimage-resistant** — can't reverse output→input
- **Avalanche** — one changed bit changes ~half the output bits
- **Collision-resistant** — hard to find two inputs with the same hash

## Uses of Hashing

| Use | Example |
|-----|---------|
| Password storage | Store hash, not plaintext |
| File integrity | sha256sum of a downloaded ISO |
| Evidence integrity | Hash the forensic image before/after |
| Git/software | Verify code not tampered |
| Duplicate detection | dedupe by hash |

## Why Password Hashing Needs More Than a Hash

A plain SHA-256 of passwords is instantly crackable: attackers precompute hashes for millions of common passwords (**rainbow tables**) and just look up. Defense:
- **Salt** — random per-user value mixed into the hash → defeats rainbow tables
- **Slow hash** — bcrypt/argon2/scrypt with adjustable "cost" → defeats GPU brute force (each guess costs the attacker time)

\`\`\`python
import bcrypt
h = bcrypt.hashpw(b"correct horse battery", bcrypt.gensalt(rounds=10))
print(h)  # $2b$10$<salt>$<hash>
print(bcrypt.checkpw(b"wrong", h))   # False
\`\`\`

## HMAC: Authenticating Integrity

A plain hash proves "data didn't change" but not "data is from the right person". An **HMAC** (Hash-based Message Authentication Code) is a hash computed with a secret key. Only someone with the key can produce a valid HMAC.

\`\`\`python
import hmac, hashlib
mac = hmac.new(b"shared-secret", b"message", hashlib.sha256).hexdigest()
\`\`\`

HMACs verify integrity + authenticity (with shared secret). Used in API signatures, token validation, TLS.

## Real-World Integrity Stories

- **SolarWinds (2020)** — attackers signed malicious update; integrity check passed because the signature was genuinely theirs... after they stole the signing key. Key protection matters as much as the algorithm.
- **WannaCry (2017)** — the disaster was less the crypto, more the unpatched SMB. Crypto didn't save it because the flaw was elsewhere.
- **Fake Microsoft installers** — signed with stolen codesigning certs.

> **Takeaway:** integrity tooling (hashes, signatures) fails when the *trust anchor* (the key) is compromised. Protecting keys is a security discipline of its own.
`,
      defaultCode: `import hashlib, hmac

# File integrity tracking
with open(__file__, "rb") as f:
    data = f.read()
print("File SHA-256:", hashlib.sha256(data).hexdigest())

# HMAC with shared secret (authenticated integrity)
secret = b"lab-only-key"
msg = b"important message"
mac = hmac.new(secret, msg, hashlib.sha256).hexdigest()
print("HMAC:", mac[:16], "...")`,
      solution: `hashes give integrity; HMACs add authenticity with a secret. DRAG: never share the secret with anyone who shouldn't sign.`,
      hint: "HMAC = hash + secret key. Hash alone = integrity, HMAC = integrity + authenticity.",
      challenge: `**Home Lab — Integrity Toolkit:**
1. Create a file with a distinctive string. Hash it (\`sha256sum\` / \`Get-FileHash\`).
2. Tamper: add a space. Re-hash. Note that the hash is completely different.
3. Generate two bcrypt hashes of the same password with DIFFERENT salts (via Python bcrypt). Verify they differ and both verify true.
4. Write an HMAC in Python. Change the message; confirm the MAC fails.
5. Answer: if you downloaded a driver from a random mirror, which integrity tool would you use and why?`,
    },
    {
      id: 3,
      slug: "03-symmetric-asymmetric-algorithms",
      title: "Symmetric & Asymmetric Algorithms",
      level: "intermediate",
      tag: "concept",
      duration: "40 min",
      description:
        "AES, ChaCha20, RSA, ECC — understand the algorithms, their key sizes, and their real-world use.",
      content: `
# Symmetric & Asymmetric Algorithms

## The Symmetric Workhorses

| Algorithm | Key | Status |
|-----------|-----|--------|
| AES-128/192/256 | 128-256 bits | Industry standard (FIPS) |
| ChaCha20 | 256 bits | Modern (TLS 1.3 default cipher; fast on phones) |
| DES / 3DES | 56 / 112 | Broken — never use |

**AES modes matter:**
- ECB — insecure (same plaintext block → same ciphertext block; leaks patterns)
- CBC — better, but needs random IV + padding
- GCM / ChaCha20-Poly1305 — **AEAD** (Authenticated Encryption with Associated Data): encrypt + authenticate together

> Rule: prefer **AEAD** (AES-GCM, ChaCha20-Poly1305). Non-AEAD modes let an attacker tamper with ciphertext.

## The Asymmetric Algorithms

| Algorithm | Purpose | Key size |
|-----------|---------|----------|
| RSA | Encrypt / sign | 2048+ (3072 recommended) |
| ECC (ECDSA, ECDH) | Sign / key exchange | 256-bit (≈ RSA 3072 strength) |
| DSA | Sign | Legacy, avoid |

**ECC is the modern choice** — smaller keys, faster, same security (256-bit ECC ≈ 3072-bit RSA).

## The Numbers Game: "Bits of Security"

- 128-bit security = industry standard (AES-128, ECC-256)
- 256-bit = also common for AES against quantum timeline debates
- Think of "bits" as the log₂ of the search space

> A 56-bit DES key = ~72 quadrillion guesses. Feasible with GPUs. A 128-bit key is astronomically larger — effectively immune to brute force.

## Post-Quantum (2026 Reality Check)

Quantum computers threaten RSA/ECC (Shor's algorithm), NOT symmetric badly (Grover only halves effective key length). Standards (NIST PQC / ML-KEM, ML-DSA) are emerging. Strategy now:
- Use AES-256 symmetric (halves → 128 effective, still safe)
- Just-safer: plan transition to PQC keys for the asymmetric parts

## Putting It Together: A Full Session

1. **Key exchange**: ECDHE (Ephemeral) → session keys, forward secrecy
2. **Bulk encryption**: AES-256-GCM or ChaCha20-Poly1305
3. **Authentication**: server cert signed by CA → trust

That's exactly the TLS 1.3 handshake you saw in earlier lessons, now named properly.

## Cipher Suites (Reading a TLS Config)

\`TLS_AES_256_GCM_SHA384\` = TLS 1.3 + AES-256 + GCM mode + SHA-384 for MAC.

Being able to decode a cipher suite string and judge whether it's modern is a real analyst skill.
`,
      defaultCode: `from cryptography.hazmat.primitives.ciphers import (
    Cipher, algorithms, modes
)
# 1-line takeaway: AES in GCM mode (AEAD)
key = bytes(range(32))   # 256-bit key
iv = bytes(range(12))    # 96-bit GCM nonce
cipher = Cipher(algorithms.AES(key), modes.GCM(iv)).encryptor()
ct = cipher.update(b"Hello World".ljust(16)) + cipher.finalize()
print("Ciphertext:", ct.hex()[:48], "tag:", cipher.tag.hex()[:16])`,
  solution: `Uses AES-256-GCM via the cryptography library — encrypting with authenticated mode. Note the IV (nonce) used.`,
  hint: "If cryptography isn't installed: pip install cryptography.",
  challenge: `**Home Lab — Encrypt a Real File:**
1. Encrypt a small file with AES-256 (via \`openssl\` or Python). Save the key somewhere safe (or in a password manager).
2. Decrypt it back and verify integrity.
3. Re-encrypt the same file with the SAME key but a NEW random IV — verify the ciphertext differs.
4. Research GCM vs CBC: what can go wrong if you reuse an IV in GCM? (Answer: catastrophic — same keystream.)
5. Choose a cipher suite for your "future standard" and justify it in writing.`,
    },
    {
      id: 4,
      slug: "04-digital-certificates-pki",
      title: "Digital Certificates & PKI",
      level: "intermediate",
      tag: "concept",
      duration: "40 min",
      description:
        "Certificate authorities, chains of trust, X.509, and how browsers and TLS anchors trust the internet.",
      content: `
# Digital Certificates & PKI

## The Problem Certificates Solve

How does your browser know it's REALLY talking to example.com and not the attacker's server? The answer is **Public Key Infrastructure (PKI)** — a system of trust.

## X.509 Certificates

A TLS certificate is a data structure containing:
- **Subject** — who it's issued to (CN/domain)
- **Issuer** — who signed it (the CA)
- **Public key** — the site's public key
- **Validity dates** — not before / not after
- **Signature** — CA's signature over the rest
- **Extensions** — SANs (alternate names), usage constraints

## The Chain of Trust

\`\`\`
Root CA (trusted, built into your OS/browser)
  └─ signs → Intermediate CA
       └─ signs → example.com certificate (leaf)
\`\`\`

Your browser stores the **root CA** certificates (from OS or browser vendor). To verify example.com, it walks the chain: leaf → intermediate → root. If any signature fails to verify, or a cert is expired/revoked, the browser warns.

## PKI Operations (What Real Analysts Do)

- **Enroll** — request a cert (CSR) from a CA for a domain
- **Validate** — CA proves you own the domain (DV/OV/EV levels)
- **Issue** — CA signs and publishes
- **Renew** — before expiry
- **Revoke** — CA publishes the cert in a CRL/OCSP
- **Audit** — check all certs on your domains, expiry, validity

## Trust Anchors & the CA System

- Root CAs are the trust anchors — preinstalled
- Compromised CA = false certs for anyone (the **DigiNotar 2011** case: fake Google certs)
- **Certificate Transparency (CT)** logs every cert → detection of rogue certs

## Common PKI Misconfigurations (Blue Team)

- Expired certs → outages (available to see errors)
- Self-signed certs in production → users trained to ignore warnings (bad!)
- Wildcard certs shared → blast radius if key leaks
- Weak key ⻖ RSA-1024/ SHA-1 signatures legacy

## Certificate Validation — The Attack Angle

- **MITM** requires the victim to accept a fake cert (users clicking through warnings)
- **Phishing with free HTTPS** — DV certs are free, so "HTTPS padlock" ≠ "secure" — always check the DOMAIN
- **Phishkit "sharks"** named after legit domains but with '.xyz' — cert checks save you

> **Padlock ≠ safe.** The padlock only guarantees channel encryption, not the identity of who you're talking to. Always verify the domain.
`,
      defaultCode: `# Inspect a live cert chain
# Linux/macOS:
openssl s_client -connect example.com:443 -servername example.com -showcerts
# Windows PowerShell:
# (Get-Item cert:\\LocalMachine\\Root).Subject
echo "Look at subjects, issuers, expiry, and SANs."`,
      solution: `openssl s_client dumps the chain: leaf + intermediate + root. Analyze subject/issuer/expiry — the anatomy of trust.`,
      hint: "-showcerts shows the whole chain; add '</dev/null' on Unix to exit immediately.",
      challenge: `**Home Lab — Audit a Certificate:**
1. \`openssl s_client -connect example.com:443 -servername example.com -showcerts\` and inspect subject/issuer/expiry.
2. Map the chain: for each cert in the output, note subject → issuer.
3. On three real sites, check expiry within 90 days (that's the renewal timeline).
4. Visit a site that's HTTPS and check the padlock — but verify the DOMAIN name matches what you intended to visit (anti-phish check!).
5. Write a one-page "certificate hygiene" checklist for a small company.`,
    },
    {
      id: 5,
      slug: "05-tls-ssl-in-practice",
      title: "TLS in Practice: Handshakes & Attacks",
      level: "intermediate",
      tag: "lab",
      duration: "40 min",
      description:
        "The full TLS 1.3 handshake, cipher negotiation, forward secrecy, and the attacks that break TLS implementations.",
      content: `
# TLS in Practice: Handshakes & Attacks

## The Goal of TLS

1. **Authenticate** the server (certificates)
2. Establish **encrypted, tamper-proof** session
3. **Hide** application data + minimize metadata

## TLS 1.3 Handshake (Simplified)

\`\`\`
Client                                Server
  |----- ClientHello ---------------->|   (key_share, supported groups)
  |<---+ ServerHello, {Cert}, +Fin --|    + Server's keys (ECDHE)
  |----- {Finished}, key derived ---->|    → session keys computed
  |<---+ {Finished} ------------------|    ↔ BOTH encrypt now
\`\`\`

In TLS 1.3, keys are computed from **ephemeral** ECDHE values — **forward secrecy** (compromise of long-term key doesn't decrypt past sessions). 1-RTT full handshake, plus 0-RTT for resumption.

## Cipher Suite & TLS Version Attacks

- **Downgrade attacks** — force TLS 1.0/SSL → lobby known ciphers → easier cracking. Modern servers disallow anything below TLS 1.2.
- **POODLE / BEAST / CRIME** — compression+padding attacks on old TLS. Fixed by TLS 1.3 + disabling compression.
- **Heartbleed (CVE-2014-0160)** — bug in OpenSSL's heartbeats leaking server memory (including private keys). Lesson: even perfect crypto fails with buggy *implementation*.

## Certificate Validation (Where Attacks Actually Win)

- **Missing hostname check** → any cert accepted → easy MITM
- **Unchecking cert errors** → users wink at the danger
- **Phishing certs** — attacker buys their own DV cert for a lookalike domain (e.g., \`paypa1.com\`)

## Detecting TLS Problems (Blue Team)

- Use SSLScan/testssl.sh to analyze servers before they join your network
- Monitor for **self-signed certs on internal hosts**
- Watch for **shadow certs** tied to renamed/decommissioned domains
- **HSTS** — force HTTPS and prevent downgrade: \`Strict-Transport-Security: max-age=31536000; includeSubDomains\`

## TLS Observatory Checklist

1. Min TLS 1.2 (prefer 1.3)
2. Modern AEAD cipher (AES-GCM / ChaCha)
3. Valid full chain, good expiry
4. HSTS enabled
5. Certificate Transparency logged
6. No weak ciphers/algorithms in suite
`,
      defaultCode: `# testssl.sh / sslscan would be ideal; minimal version here
import ssl, socket

host = "example.com"
ctx = ssl.create_default_context()
with socket.create_connection((host, 443), timeout=5) as raw:
    with ctx.wrap_socket(raw, server_hostname=host) as s:
        print("TLS version:", s.version())
        print("Cipher:", s.cipher())
        cert = s.getpeercert()
        print("Domain SANs:", cert.get("subjectAltName"))
        print("Not After:", cert.get("notAfter"))`,
      solution: `Connects via Python and prints negotiated TLS version, cipher, SANs, expiry. Score against the observatory checklist.`,
      hint: "Run against example.com first, then compare to a legacy site you still see plain-http links from.",
      challenge: `**Home Lab — TLS Auditing:**
1. Run the Python check on 5 domains (mix of big sites & small sites). Score each against the observatory checklist.
2. Use testssl.sh (download) on your OWN local lab server — find its weak ciphers.
3. On your lab server, harden config: disable TLS<1.2, set modern cipher, enable HSTS.
4. Re-scan and confirm improvement.
5. Write: why does HSTS matter more than a padlock? What does it prevent?`,
    },
  ],
};