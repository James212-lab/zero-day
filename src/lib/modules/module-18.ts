import type { Module } from "../curriculum";

export const module18: Module = {
  id: "module-18",
  slug: "18-cloud-devsecops",
  title: "Cloud Security & DevSecOps",
  description:
    "The shared responsibility model, cloud attack surfaces, CI/CD pipeline security, and infrating security into how software ships.",
  language: "Cloud & DevOps",
  lessons: [
    {
      id: 1,
      slug: "01-cloud-security-fundamentals",
      title: "Cloud Security Model & IAM",
      level: "intermediate",
      tag: "concept",
      duration: "45 min",
      description:
        "Shared responsibility, the cloud attack surface, and why IAM is the real cloud perimeter.",
      content: `# Cloud Security Model & IAM

## The Shared Responsibility Model

Cloud = a RENTAL. Both parties have duties:

\`\`\`text
IaaS:    You: OS, apps, data, network config   Cloud: physical, hypervisor
PaaS:    You: apps, data, config               Cloud: runtime, host, patch
SaaS:    You: data, users, settings            Cloud: everything else (mostly)
\`\`\`

**The eternal misconfiguration:** teams assumed the cloud provider "secures it" — and left buckets public, databases open, keys in code. Always ask: **who owns THIS layer?**

## The Cloud Attack Surface (the Shell of Cloud Breaches)

1. **Misconfigured storage** (public S3/GCS bucket = data exfiltration)
2. **Credential leakage** (API keys in code/GitHub — M10's GitHub recon)
3. **IAM over-privilege** (wide roles = an account jacked = whole org plunder)
4. **SSRF hitting metadata** (cloud metadata = the keys to the kingdom, M11)
5. **Shadow assets** (new regions/zones are forgotten, unprotected)

## IAM: The Real Boundary

Traditional network edge (your firewall) is gone. The new perimeter is **identity**:

- **Least privilege** — every role/policy grants the minimum
- **MFA everywhere** — on roots, admins, console
- **Short-lived credentials** instead of static keys (tokens, not secrets)
- **Immutable roles** (arn:aws:iam::...:role/read-only-orders) used by apps, not long-lived passwords
- **Audit trails** — who called what, when (CloudTrail / equivalent)

\`\`\`json
{ "Effect": "Allow", "Action": "s3:GetObject",
  "Resource": "arn:aws:s3:::production-orders/*" }
\`\`\`

## Infra as Code & Security as Code

Cloud config written as code (Terraform / CloudFormation) means config is **reviewable, write-protected, and testable**:

- pre-commit scanning for public buckets, wide IAM
- \`checkov\` / \`tfsec\` on CI runs seconds after commit

## The Cloud Catastrophe Checklist (blue team)

- Default regions — who else can create in MY tenant?
- Root account — is MFA bound and is it used only for emergencies?
- Service keys — in secret store with rotation, or in a git history?
- Public exposure — one query finds all buckets/DBS that are public

> **The 2020s lesson:** cloud isn't 'more vulnerable' — it's *differently* vulnerable, concentrated in IAM + exposure + shadow. Master IAM and you master cloud.
`,
      defaultCode: `# Terraform-driven security check (checkov example output)
# install:  pip install checkov   (or run via docker)
# then run in your IaC repo:
checkov -d ./terraform \
  --bc-api-key none --policy-dir . --quiet
# Example finding it might catch:
# CHECK: Absolute S3 Public ACLs / "Bucket: production-orders" - PUBLIC - FAIL
# FIX: s3.bucket_acl = "private"  (least privilege)`,
  solution: `Scanning Terraform as part of CI catches public buckets & wide IAM before they ship — security as code in action.`,
  hint: "If you write cloud as code, scan it like code — pre-commit guardrails.",
  challenge: `**Home Lab — Cloud Basics Without Spending:**
1. Create a FREE account (AWS/Azure/GCP). Deploy a SINGLE resource (a storage bucket or a VM in a free tier).
2. Try to make it public, then scan it (checkov or manual): see what 'public exposure' flags look like.
3. Enforce MFA + set your root/admin up with least privilege thinking.
4. Review the audit log (CloudTrail/Activity log) - find your own actions.
5. Write 'my cloud incident-prevention rules' (3 rules) and keep for when you use real infra.`,
    },
    {
      id: 2,
      slug: "02-devsecops-pipeline",
      title: "DevSecOps: Securing the CI/CD Pipeline",
      level: "advanced",
      tag: "concept",
      duration: "45 min",
      description:
        "Shift-left scanning, secrets detection, supply-chain, and the pipeline itself as an attack target.",
      content: `# DevSecOps: Securing the CI/CD Pipeline

## What DevSecOps Means

Security that **ships with the software**, not "security review" bolted at the end. The shift-left principle: find bugs where they're cheapest (in the developer's editor, not in production).

## The Pipeline and Its Gates

\`\`\`text
commit → Lint → SAST → Build → SCA → Test → DAST → Image scan → Deploy → Runtime
         └──────────────────────── gates ────────────────────────────┘
\`\`\`

**"Shift left"** = run the cheap safety checks as early as possible; the expensive ones (DAST, pen test) stay near the end.

## The Tools by Stage

| Stage | Tool type | Example |
|-------|-----------|---------|
| IDE/pre-commit | secrets scan | gitleaks, detect-secrets |
| Commit | SAST (static app scan) | semgrep, codeql |
| Build | SCA (dependency scan) | trivy, osv-scanner, Dependabot |
| Container | image scan | trivy, grype, scan on top of base image |
| Deploy | IaC scan | checkov, tfsec (M18-1) |
| Package | registry integrity | sbom signing (cosign) |

## The Secrets Problem (the #1 CI leak)

- Hardcoded keys in code (the Google-breachers dream, real incidents everywhere)
- Files like \`.env\`, \`kubeconfig\` committed by mistake
- **Fix**: secret managers (GitHub Actions secrets / Vault / cloud key vault), rotation, and **gitleaks / detect-secrets** as a pre-commit hook.

\`\`\`bash
gitleaks detect --source . --report-path leaks.json
# anything with a high entropy string / keyword = BLOCK build
\`\`\`

## The Supply-Chain Dimension (M08's SolarWinds-cousin)

- **Dependencies you pull** (npm/pip/go) can be malicious or hijacked
- **Registry mirroring** & pinning versions (no \`latest\`)
- **Signing** (package provenance, cosign for images)
- **Software Bill of Materials (SBOM)** — 'what's IN this artifact' as a machine-readable list — for recall + audit

## The Pipeline Is Itself the Attack Surface

- Compromised **CI secrets** = attacker ships your next release!
- Supply-chain attacks on the CI runner, token theft
- **Guardrails:** least-privilege CI tokens, pin the runner images, audit pipeline config, never build with prod secrets in env

> **The paradigm:** every 'automated trust' is an attack surface. Automation accelerates humans — but it also accelerates *mistakes* unless gated. Gates are the name of the game.
`,
      defaultCode: `#!/bin/bash
# The shift-left pronominal: scanner + gate in one line
# 1. scan code for secrets (block if found)
if gitleaks detect --no-banner --redact -c .gitleaks.toml 2>/dev/null; then
  echo "secrets scan PASSED"
else
  echo "secrets scan FAILED — build BLOCKED" && exit 1
fi
# 2. image scan (gate on critical/high)
trivy image --severity CRITICAL,HIGH --ignore-unfixed myapp:latest --exit-code 1`,
  solution: `Two gates every repo needs: no secrets in code, no critical images shipped. Fail fast = ship safe.`,
  hint: "Gates fail the build early — cheaper upstream than a production incident.",
  challenge: `**Home Lab — Run Your Own CI Security Stand-Up:**
1. Create a tiny test git repo with TWO files: one containing a fake AWS key format, one clean.
2. Run gitleaks detect --detect… : does it flag the fake key?
3. Scan a small project with trivy/osv-scanner (or semgrep on a toy script): find at least 1 issue.
4. Write your 5-line 'CI security pre-commit hook' for future projects.
5. Much of DevSecOps is this: run tools early, gate on 'no'. You just did it.`,
    },
  ],
};