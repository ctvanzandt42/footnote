# PLAN.md — Footnote (footnote.vote)

*Every claim, footnoted.*

A nonpartisan, source-cited guide to candidates in U.S. federal and state races,
filterable by political leaning. The name is the doctrine: every claim on the
site wears its source, like a footnote. The guiding principle of this entire
project:

> **We cite a candidate's leaning. We never assign one.**

Every ideological signal on the site traces to an external, attributable source.
The product's credibility lives or dies on that discipline. If a feature would
require us to be the arbiter of where a candidate falls on the spectrum, we don't
ship it.

---

## 1. Scope (v1)

**In scope:** Federal races (President, U.S. House, U.S. Senate) and state-level
races (governor, statewide offices, state legislature). Current election cycle.

**Out of scope (v1):** County, municipal, school board, judicial, and ballot
measures. These are where comprehensive data becomes a paid/scraped, full-time
data operation. They're the Phase-4+ / Ballotpedia-license conversation.

**Non-goals, permanently:** We do not rate, score, endorse, or editorialize. We
aggregate and attribute.

---

## 2. The neutrality doctrine (read this before writing any feature)

Leaning is presented in **three tiers**, and we always show the source:

1. **Party affiliation** — for every candidate. A fact from official filings.
   Coarse but unimpeachable. This is the always-on baseline filter.
2. **Academic ideology score** — for candidates with a voting record (incumbents).
   - Federal: DW-NOMINATE scores from Voteview (voteview.com).
   - State legislators: Shor-McCarty scores (Harvard Dataverse).
   - We display the number, link the methodology, and filter on it. We do not
     recompute or "adjust" it.
3. **Self-reported positions** — for everyone, especially challengers with no
   voting record. Pulled from campaign sites and candidate questionnaires
   (Vote Smart's Political Courage Test). Shown as **verbatim quotes with
   sources**, never paraphrased into our own characterization. How we handle
   factual claims *inside* those quotes is its own policy — see *Positions &
   factual claims* below.

**The honesty flag (product requirement, not polish):** A candidate with no
legislative record shows Tiers 1 and 3 with a visible
`No legislative record yet — positions self-reported` marker. We never fill the
gap with a guessed score. The gap is information for the voter.

### Positions & factual claims

A self-reported position often fuses two different kinds of statement: a
**stance** (a value or policy preference — no truth value, we never adjudicate
it) and an **empirical claim** (a checkable factual assertion — it has a truth
value). Treating them as one thing is the trap: publish the fused quote whole and
we launder any false premise; rate the premise ourselves and we become the
arbiter we promised not to be.

**Governing rule — evidence, never verdict.** We never label a claim true or
false and never attach a fact-checker's rating. Where a position contains a
checkable empirical claim, we may attach a neutral pointer to the **primary data
source** (e.g. BJS, Census, CBO, the relevant agency or academic review) so the
reader compares the claim to the data themselves. The judgment is outsourced to a
citable source — the same move as the ideology score — never made by us.

Any such annotation must be **rule-based, symmetric, and published**: the rule
for what counts as a checkable claim, and which sources are authoritative, applies
to every candidate regardless of who said it or which way it cuts, and the rule
lives on the methodology page. We never annotate selectively.

**v1 ships the defensible floor:** positions published as the candidate's own
words, verbatim, with one standing disclaimer applied to everyone equally —
*"Positions are candidates' own statements, in their own words; we do not verify
factual claims within them."* This is the League of Women Voters VOTE411 model.
The evidence-pointer layer is a deliberate Phase-2+ decision, not a v1 feature —
but the schema carries the hook now (`Position.claims[]`) so we never have to
repaint.

**Residual judgment, stated honestly:** we cannot reduce judgment to zero —
deciding what is "checkable," which source is "authoritative," and whether to
annotate at all are themselves judgments. The goal is not the absence of judgment
(impossible) but judgment that is minimal, rule-based, symmetric, and auditable.

**Participation bias (know it, disclose it):** when positions come from a survey
candidates opt into, response rates skew (VOTE411 has seen large partisan gaps in
some races). We pull from campaign sites + Vote Smart rather than running our own
survey, which softens this — but an empty Tier 3 is never neutral. Disclose
coverage gaps rather than letting absence read as a statement.

### Public methodology & neutrality page (launch blocker)

A first-class page, not a footer link — this is where trust is earned. It must
spell out, in plain language, exactly how everything on the site is produced:

- Every data source, what it provides, and how current it is.
- How each ideology score is obtained, and that we never recompute or adjust it.
- **Exactly how the leaning buckets are calculated** — the score system, the
  numeric thresholds (e.g. the DW-NOMINATE cutoffs), and that the method is fixed
  and applied uniformly to everyone.
- The positions policy in full: verbatim publication, the standing disclaimer,
  and — if/when added — the evidence-pointer rule and its claim/source criteria.
- Known limitations: score vintage/lag, coverage gaps, participation bias, and
  data freshness near election day.
- The correction process and a contact path for candidates and the public.

Rule of thumb: if a calculation or editorial choice isn't disclosed here, it
shouldn't be on the site.

---

## 3. Data sources

| Source | Provides | Cost / Auth | Notes & gotchas |
|---|---|---|---|
| **FEC API** (`api.open.fec.gov`) | Federal candidates, committees, campaign finance | Free; key via api.data.gov | Federal only. Most reliable "who is running federally" + money. |
| **Congress.gov API** (`api.congress.gov`) | Official bills, members, roll-call votes, nominations | Free; key via api.data.gov | The official replacement after ProPublica's Congress API was shut down. |
| **congress-legislators** (GitHub: `unitedstates/congress-legislators`) | Current + historical members, full ID crosswalk (bioguide, FEC, votesmart, icpsr…) | Free, public domain | Now the canonical legislator-data source. Use it to join everything. |
| **Voteview** (`voteview.com`) | DW-NOMINATE ideology scores for every member of Congress | Free, academic (UCLA) | Bulk CSV download. Federal Tier-2 scores. |
| **OpenStates API** (`v3.openstates.org`) | State legislators, bills, votes, committees | Free; key; rate-limited (bulk data also available) | Backbone of the state tier. Strong on *sitting* legislators. |
| **Shor-McCarty** (Harvard Dataverse) | State legislator ideology scores | Free, academic | Released infrequently and **lags** the current cycle. Disclose vintage. |
| **Vote Smart** (`votesmart.org`) | Political Courage Test, stated positions, bio, interest-group ratings | API access historically **gated** — confirm availability in Phase 0 | Covers challengers + state candidates. Critical for Tier 3. |
| **Secretary of State filings** (per state) | Authoritative ballot access (who's actually on the ballot) | Free; ~50 formats, mostly no API | The scraping graveyard. Needed for state challengers / open seats. Touch sparingly in v1. |
| **Ballotpedia API** | Comprehensive incl. local | Paid / restricted | The upgrade path if/when we add local. Not v1. |

**Freshness caveat:** Ballot data is revised heavily in the final weeks before an
election (withdrawals, additions, replacements). Plan an ingest cadence that
tightens near election day and show a "verify with your local election office
before voting" banner.

---

## 4. Data model (sketch)

Citations are first-class. Every `Position` and `IdeologyScore` carries its own
provenance — `source_name`, `source_url`, `retrieved_at`. If a row can't cite
itself, it doesn't render.

```
Office            id, level (federal|state), title, state, district, chamber
Race              id, office_id, cycle, election_type (primary|general), date
Candidate         id, full_name, party, incumbent (bool), bioguide_id?, fec_id?,
                  openstates_id?, votesmart_id?
Candidacy         id, candidate_id, race_id, status (running|withdrawn|won|lost)
IdeologyScore     id, candidate_id, system (dw_nominate|shor_mccarty),
                  value, scale_min, scale_max, vintage,
                  source_name, source_url, retrieved_at
Position          id, candidate_id, topic, stance, quote (verbatim),
                  source_name, source_url, retrieved_at, self_reported (bool)
EmpiricalClaim    id, position_id, claim_text (verbatim sub-claim),
                  context_source_name?, context_source_url?
                  # Phase 2+ evidence-pointer hook. Empty in v1.
FinanceSummary    id, candidate_id, cycle, total_raised, total_spent, source_url
```

Filter buckets (e.g. "lean left / center / lean right") are **derived from**
`IdeologyScore` at query time using a disclosed, fixed method (e.g. published
NOMINATE thresholds or quantiles), and the method is documented on /methodology.
We never store a hand-assigned bucket.

---

## 5. Architecture

A slow-moving, read-heavy, SEO-sensitive content site. Treat it as a build/ingest
pipeline feeding a mostly-static frontend — not a real-time app.

- **Ingest pipeline** (TypeScript or Python): pull → normalize → upsert into the
  store, attaching citations on the way in. Scheduled job: weekly off-cycle,
  daily (or faster) in the weeks before an election.
- **Store:** Postgres (Neon or Supabase). Bounded dataset (tens of thousands of
  rows for federal + state), relational citation model, easy filtering. SQLite/
  Turso is a fine lighter-weight alternative if you want zero ops.
- **Frontend:** Next.js (App Router, server components). Server-rendered for
  indexability — a voter guide wants to be found via search. Filtering is a
  server query against Postgres (party + ideology bucket + office + state +
  cycle).
- **No user accounts in v1.** No personalization, no tracking beyond basic
  privacy-respecting analytics. Less to defend, less to leak.

---

## 6. Costs

**v1 ships for the price of a domain.** The dataset is small and slow-moving, so
almost everything rides free tiers. Only two things can actually cost money:
Vote Smart's paid data and your own time.

**Free:** FEC, Congress.gov, congress-legislators, Voteview/DW-NOMINATE, and
Shor-McCarty are all free (government/academic downloads or api.data.gov keys).
OpenStates is free with rate limits.

**Hosting — $0 for v1.** Because reads are static between ingests, you don't need
a live database to *serve* the site: run the ingest locally or in CI, bake the
result into static JSON at build time, and deploy to **Vercel's free (Hobby)
tier** — 100 GB bandwidth, 100 hours of function execution, unlimited personal
projects. That covers a content site like this comfortably. (Netlify and
Cloudflare Pages free tiers are equivalent fallbacks.)

**Database (optional for v1).** If you keep a live Postgres instead of static
JSON, Neon's free tier (100 CU-hours, 0.5 GB storage, no credit card, scale-to-
zero) is plenty. Avoid Supabase's free tier for the public-facing piece —
free projects pause after 7 days of inactivity, which is fine for a side project
but awkward for a site you want findable at all times.

**What actually costs money:**

| Item | Cost | When |
|---|---|---|
| Domain | ~$12–15/yr (more for premium/.org) | Now |
| Vote Smart statements/endorsements | Unknown — paid add-on, get a quote | If scraping campaign sites isn't enough (de-risk in Phase 0) |
| Vercel Pro | $20/user/mo | Only if the project takes on commercial character — Hobby ToS is non-commercial |
| Paid DB tier | Usage-based | Only at real scale, or if you skip the static-build approach |
| Your time | The largest cost by far | Ongoing — esp. Secretary-of-State reconciliation and pre-election freshness |

The first dollar of meaningful spend is the decision of whether Vote Smart's
statement data beats scraping campaign sites yourself. Everything before that is
free.

---

## 7. Phased build

**Phase 0 — Spike (prove the join).** One state. Pull federal candidates (FEC) +
the congress-legislators crosswalk + DW-NOMINATE scores into Postgres. Prove a
candidate row can carry a party, a cited score, and a stated position, and that
the citation survives the pipeline. Confirm Vote Smart API access here, because
it gates Tier 3.

**Phase 1 — Federal, complete.** All federal races for the cycle. Tiered leaning
(party + DW-NOMINATE + stated positions). FEC finance summaries. Filtering UI.
/methodology page. The honesty flag for challengers.

**Phase 2 — State.** OpenStates ingest, Shor-McCarty scores (with vintage
disclosure), Secretary-of-State ballot-access reconciliation for challengers and
open seats. Expect thinner data and lean on the honesty flags.

**Phase 3 — Polish & trust.** Search, share links, accessibility pass, freshness
banners, an /about that names the team and the funding (transparency = trust),
and a clear correction/contact path.

---

## 8. Open questions & risks

- **Bucket thresholds.** How continuous NOMINATE/Shor-McCarty scores map to
  filterable buckets without smuggling in bias. Pick a published, fixed method
  and disclose it. This decision will get scrutinized — make it boring and cited.
- **Vote Smart access.** Tier 3 depends on it and access is gated. De-risk in
  Phase 0; have a campaign-site fallback.
- **Primary vs. general.** Which elections in the cycle, and ballot access rules
  that vary by state. Model `election_type` from day one (already in the schema).
- **Data freshness near election day.** Withdrawn/replaced candidates. Tighten
  ingest cadence and never imply the data is final.
- **Framing/liability.** It's a public, factual, sourced voter resource — keep it
  that way and label it informational. Worth a quick read with someone qualified
  before launch; this plan is engineering guidance, not legal advice.

---

## 9. What we are explicitly NOT building in v1

Local races. User accounts. Endorsements or our own scores. AI-generated
candidate summaries. Predictions. Anything that requires us to characterize a
candidate in our own voice rather than quote and cite.
