import type { Module } from "../curriculum";

export const module07: Module = {
  id: "module-07",
  slug: "07-identity-access-management",
  title: "Identity & Access Management",
  description:
    "Authentication, authorization, MFA, SSO, RBAC/ABAC and IAM attacks — controlling who can touch what.",
  language: "IAM",
  lessons: [
    {
      id: 1,
      slug: "01-iam-concepts",
      title: "IAM Concepts: Authentication vs Authorization",
      level: "beginner",
      tag: "concept",
      duration: "25 min",
      description:
        "AAA, identity lifecycle, least privilege and the difference between proving who you are and what you may do.",
      content: `
# IAM Concepts: Authentication vs Authorization

## The AAA Model

- **Authentication** — "Are you who you say you are?"
- **Authorization** — "Are you ALLOWED to do this?"
- **Accounting/Auditing** — "What did you do?" (logs, attribution)

## Identity Lifecycle

The full path of an identity:

1. **Provision** — create account, assign permissions on hire/onboarding
2. **Manage** — role changes, permission adjustments
3. **Deactivate** — disable when leaving, transfer ownership (critical!)
4. **Offboard** — delete/archive, revoke tokens

> **The #1 real-world IAM failure:** forgotten deactivated accounts (old contractor accounts, shared "svc" accounts) become the attacker's doorway. **Identity sprawl** = unmanaged accounts = risk.

## Least Privilege & "Why"

A user or service should have the minimum permissions to do its job — and nothing more:

- No one needs root/SYSTEM for email
- Service accounts should be limited, non-interactive, with no shell
- **Separation of duties** — the person who approves a payment shouldn't be the one who submits it

## Identity Stores

| Store | Used For |
|-------|----------|
| Active Directory | Enterprise Windows + app SSO |
| Entra ID (Azure AD) | Microsoft cloud |
| LDAP | Generic directory (OpenLDAP) |
| Okta/Ping/Keycloak | Cloud IAM + SSO |
| Local accounts | Devices, Linux users |

The sprawl of identity stores is itself a management problem — and a detection blind spot (if one store is unmanaged, accounts linger).

## The "Why IAM" Pitch

- 80%+ of breaches involve credential misuse
- IAM is where prevention AND detection both live
- Every security control is meaningless if the wrong person holds the key

> **Mental model:** IAM is the lock system of the building. Authentication = "does this key fit this door?" Authorization = "is this door even on your list?" Accounting = "the camera recorded you trying.:
`,
      defaultCode: `// Model the AAA lifecycle simply
actor = { name: "alice", roles: ["user"], active: true }

function authenticate(actor, cred) {
  return cred.valid;                      // prove who you are
}
function authorize(actor, action) {
  return actor.roles.includes("user") && actor.active; // may you?
}
function record(actor, action) {
  console.log(actor.name, "performed", action);        // what happened
} 
console.log(authorize(actor, "read files"));   // true
actor.roles = [];                              // deprovision
console.log(authorize(actor, "read files"));   // false`,
      solution: `Demonstrates auth≠authz: role removal instantly denies actions. Record() is the accounting leg.`,
      hint: "Authenticate ≠ authorize. Both are separate decisions.",
      challenge: `**Home Lab — Map an Identity Lifecycle:**
1. List every account that can log into anything you manage (personal or lab).
2. Which are human, which are service accounts? Which are stale/unused?
3. For the service accounts: what is each allowed to do? Any that are 'root-everything' that shouldn't be (break them down)?
4. Deactivate any stale accounts now (document it).
5. Summarize: what could an attacker do with your most privileged account today, and what would they use it for?`,
    },
    {
      id: 2,
      slug: "02-mfa-sso-federation",
      title: "MFA, SSO & Federation",
      level: "intermediate",
      tag: "concept",
      duration: "30 min",
      description:
        "Second factors, single sign-on flows, OAuth/OIDC/SAML, and the security trade-offs of federated identity.",
      content: `
# MFA, SSO & Federation

## MFA: Defense Against the Password

The (now old) "password" is nearly useless alone. MFA adds a second factor. MITRE ATT&CK maps credential-theft attacks; MFA blocks a huge share:

- **Phishing** — attacker has your password but not your second factor
- **Credential stuffing** — same
- **Pass-the-hash/cookies** — some MFA blocks these too

## MFA Methods Ranked

| Factor | Security | Notes |
|--------|----------|-------|
| OTP app (TOTP) | Medium | Phishable in real-time relay; SIM-independent |
| Push prompting | Medium | MFA fatigue — user approves anyway |
| SMS | Weak | SIM swap + interception |
| WebAuthn/passkeys | Strong | Resistant to phishing; cryptographically bound to the site |
| Hardware key (FIDO2) | Strong | Best-in-class |

## SSO: One Login to Rule Them All

Single Sign-On lets one identity server act as the gate for many apps:
- User authenticates once (often MFA)
- Then every app trusts that session

**Benefits:** fewer passwords to phish, centralized policy, centralized logging.
**Risk:** one compromised SSO session = many apps. Hence: strong MFA + session monitoring are mandatory.

## Federation Protocols (The Alphabet Soup)

| Protocol | Used By | Type |
|----------|---------|------|
| SAML 2.0 | Many enterprise apps | XML assertions |
| OAuth 2.0 | Authorization ONLY (scoped access) | Tokens |
| OIDC (on OAuth2) | Modern identity + login | JWT ID tokens |

Key flows:
- **SAML/Web SSO** — browser redirects to IdP, IdP returns an assertion (XML), app trusts it
- **OAuth 2.0** — "are the app ALLOWED to act for the user?" → access token (not identity)
- **OIDC** — OAuth + an ID Token (JWT) that carries the identity claim

## The Trust Boundary Danger

Federation = multiple parties trust ONE identity source. Attack surface:
- **Token theft / replay** — steal an assertion/token, reuse elsewhere (mitigate: audience, nonce, short TTL, not in URL)
- **Badly implemented IdP** — weak MFA or no checks
- **Scope escalation** — a token issued for "read email" used for "send email" (OAuth scope confusion)
- **Session fixation** — attacker plants a session ID the victim logs into

> **Golden rule:** every federated app is only as strong as its IdP + its session handling. Secure both.
`,
      defaultCode: `// Bad vs good session handling (conceptual)
function badSessionCheck(req) {
  return req.cookies.session !== undefined;   // trivially forged
}
function goodSessionCheck(req, store) {
  const sid = req.cookies.session;
  const s = store.get(sid);
  return s && !s.expired && s.ip === req.ip;  // + expiry + binding
}
console.log(goodSessionCheck({cookies:{}}, {})); // false`,
      solution: `Good session checks require: exists, not expired, bound to client. That's the minimum bar.`,
      hint: "Session cookie theft is a top attack; bind sessions and expire them.",
      challenge: `**Home Lab — SSO in the Lab:**
1. If you use any SSO (Google/Okta work): count how many apps it gates.
2. Research your SSO's session timeout: how long is a session valid? Could a stolen cookie be used for hours?
3. Set up Keycloak (Docker) in your lab and protect a test app with OIDC.
4. Trigger an MFA flow and observe the tokens in DevTools/Keycloak logs.
5. Answer: what's in an ID token (JWT) and why is it structured that way?`,
    },
    {
      id: 3,
      slug: "03-rbac-abac-permissions",
      title: "RBAC, ABAC & Authorization Models",
      level: "intermediate",
      tag: "lab",
      duration: "35 min",
      description:
        "Role-based vs attribute-based access control, and why authorization bugs (IDOR) break everything anyway.",
      content: `
# RBAC, ABAC & Authorization Models

## Authorization Models Compared

| Model | Grants based on | Strength |
|-------|-----------------|----------|
| DAC | Ownership (file owner) | Worst — owner controls |
| MAC | System-enforced labels (Top Secret vs Secret) | Strong — user can't override |
| RBAC | Roles (admin, finance, user) | Common, manageable |
| ABAC | Attributes (dept, clearance, location, time) | Flexible, fine-grained |

## RBAC in Practice

Roles group PERMISSIONS, users belong to roles:

\`\`\`
Role: finance-analyst
  ├─ read reports
  ├─ export csv
  └─ run monthly-recap job
Users: {Bob, Carol} → finance-analyst
\`\`\`

RBAC advantages: fewer rules, easy to explain, matches organization structure.
Traps: **role explosion** (every variant needs a role), **privilege creep** (users accumulate roles over years), **shared roles** (both "read" and "delete" in one).

## ABAC for Fine Control

ABAC decides using *attributes*:

\`(&(department=finance)(clearance>=2)(time=08:00-18:00)(location=office))\`

- Location-aware (only from office network)
- Time-aware (only during business hours)
- Context-aware (MFA present)

ABAC is more expressive but harder to manage and audit.

## IDOR: When Authorization Code Fails

**IDOR (Insecure Direct Object Reference)** — the app checks WHO you are but never checks WHETHER you may touch THAT object:

\`\`\`http
GET /invoice/12345        → you own it? OK
GET /invoice/12346        → do YOU own it? ← if the app forgets the check → LEAK
\`\`\`

The fix isn't a better model — it's a **verify-the-owner-check** on every object: fetch the object and confirm the requester owns it, in the same transaction.

> Authorization bugs are separate from authentication. Strong MFA doesn't save you from IDOR — the attacker is already "authenticated as you".

## The Authorization Testing Habit (Blue Team)

1. Login as user A (normal), user B (privileged), and guest
2. For EVERY request: try A accessing B's objects
3. Check whether the server enforces ownership ON THE DATA, not on the URL
4. Test hidden/guessed IDs, batch endpoints, and toggles
`,
      defaultCode: `// IDOR demonstration — the missing ownership check
users = [
  { id: 1, owner: "alice", secret: "A-doc" },
  { id: 2, owner: "bob",   secret: "B-doc" },
];

function getDoc(id, requester) {
  const doc = users.find(u => u.id === id);
  // BUG: if (!doc || doc.owner !== requester) return 403;
  return doc ? doc.secret : null;   // IDOR: any id returns any secret
}
console.log(getDoc(2, "alice"));   // returns bob's secret = IDOR leak`,
  solution: `The commented-out ownership check is the FIX. uncomment it → alice gets 403 on bob's doc. Demonstrated IDOR.`,
  hint: "Add : if (!doc || doc.owner !== requester) return '403'",
  challenge: `**Home Lab — Practice IDOR Thinking:**
1. In DVWA (lab), try the IDOR exercise: change the object ID in a URL and observe.
2. Explain in writing why IDOR is so common (hint: devs check login, forget ownership).
3. Now audit a small app YOU write: beyond authentication, does every data object check ownership?
4. List 3 objects in systems you use (invoice, profile, message, order?) where an IDOR-style bug would be catastrophic.
5. Add an ownership check to \`getDoc\` and confirm it now returns 403 for bob's doc.`,
    },
    {
      id: 4,
      slug: "04-privilege-escalation-concepts",
      title: "Privilege Escalation & Lateral Movement",
      level: "intermediate",
      tag: "concept",
      duration: "35 min",
      description:
        "How attackers climb from 'user' to 'admin' and hop machines — vertical and horizontal movement.",
      content: `
# Privilege Escalation & Lateral Movement

## Why This Matters

Most initial access lands as a **low-privilege user**. The attack isn't over — the attacker now wants:

1. **Vertical escalation (PrivEsc)** — user → root/administrator/SYSTEM on this box
2. **Lateral movement** — this box → other boxes
3. **Persistence** — survive reboots
4. **Goal** — the crown jewels (domain admin, data, identity)

## Vertical PrivEsc Patterns

**Misconfigurations:**
- World-writable / SUID binaries (Linux: \`find / -perm -4000\`)
- Sudo misconfig (\`sudo -l\` — check what you can run as root)
- Unquoted service paths (Windows)
- Weak service permissions (Windows services startable by users)

**Kernel bugs:**
- Known CVE + public exploit (Dirty COW, etc.)
- Unpatched = free root

**Credential reuse:**
- Same password user→admin
- Credentials in config files, registery, memory

**Abuse of functionality:**
- \`docker run --privileged\` via a user in the docker group → root
- Web shells running as the web-server user

## Lateral Movement Patterns

- **Pass-the-Hash/NTLM reuse** — use the hash, no password needed
- **RDP/SSH hopping** — legit remoting abused
- **PsExec/SMB exec** — remote services
- **WMI / WinRM** — Windows-native remote execution
- **GPO/Scheduled Tasks across the domain**

## Detecting Movement (Blue Team)

| Signal | Where |
|--------|-------|
| New remote admin session (4624 LogonType 3/10) | Windows security log |
| Services created on endpoints (7045) | Windows |
| SMB admin tunnels (TreeConnect to ADMIN$) | network / EDR |
| Unexpected RDP/WinRM | firewall / EDR |
| New admin users on hosts | events 4720/4728 |

> **Analyst habit:** whenever you see nonsense logins from ONE source to MANY hosts in a short window — that's lateral movement or a scan. Both are worth investigating.

## The Bootstrapped Privileged Session

CISOs love this: even a stolen low-priv session lets an attacker:

1. Read the file where creds sit
2. Kerberoast / mine a ticket
3. Spray those creds across dozens of hosts until one works
4. Reach a service account → domain admin

**Because an attacker only needs ONE misconfigured credential to escalate, defense = (a) eliminate exploitable configs, (b) detect any escalation.**
`,
      defaultCode: `#!/bin/bash
# privilege audit primitives (run on YOUR lab, not production)
echo "== sudo rights =="; sudo -l 2>/dev/null
echo "== SUID binaries =="; find / -perm -4000 2>/dev/null
echo "== world-writable dirs =="; find / -type d -perm -o+w 2>/dev/null | grep -v proc | head
echo "== who can write /etc =="; ls -ld /etc`,
  solution: `Audit output shows what a low-priv user could leverage. Each line maps to a privilege escalation pattern from the lesson.`,
  hint: "Read sudo -l carefully — sudo misconfigs are the #1 lab escalation.",
  challenge: `**Home Lab — Escalation Path Walkthrough (TryHackMe-style, in your own VM):**
1. Boot a lab target (use TryHackMe 'Pickle Rick'/'VulnNet' or a prebuilt VirtualBox target).
2. From a low-priv shell: run \`sudo -l\`, check SUID, look for world-writable configs.
3. Find a sudo misconfig → escalate.
4. Document your exact commands + results.
5. Write: which THREE detection signals would an EDR flag on your path (e.g., 'sudo -u root', new process by web user)?`,
    },
  ],
};