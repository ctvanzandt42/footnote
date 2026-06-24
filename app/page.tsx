"use client";

import { useMemo, useState } from "react";

/**
 * Footnote (footnote.vote) — homepage
 *
 * Demonstrates the layout and the core product doctrine in real components:
 *   - Tier 1: party affiliation (a fact; tiny color dot, never the page identity)
 *   - Tier 2: academic ideology score (cited — DW-NOMINATE / Voteview), on a
 *             NEUTRAL spectrum track (no red/blue gradient = no editorializing)
 *   - Tier 3: self-reported positions (quotes, each with its own source chip)
 *   - Honesty flag: candidates with no legislative record get a dignified
 *             "no cited score" panel — the gap is shown, never guessed at.
 *
 * Signature element: the monospace SOURCE CHIP. Provenance is visible on every
 * data point. That is the thing this UI is remembered by.
 *
 * NOTE: All candidates, scores, quotes, and figures below are FICTIONAL sample
 * data for layout purposes, ahead of the real ingest pipeline (see PLAN.md).
 * No real person's positions are represented.
 */

type Party = "D" | "R" | "I";

type Score = {
  system: string;
  value: number;
  source: string;
  vintage: string;
};

type Position = {
  topic: string;
  quote: string;
  source: string;
  self: boolean;
};

type Candidate = {
  id: string;
  name: string;
  party: Party;
  office: string;
  state: string;
  district: string | null;
  incumbent: boolean;
  score: Score | null;
  positions: Position[];
  finance: { raised: string; spent: string; source: string };
};

// ---------------------------------------------------------------------------
// Sample data (fictional)
// ---------------------------------------------------------------------------
const CANDIDATES: Candidate[] = [
  {
    id: "c1",
    name: "Dana Okafor",
    party: "D",
    office: "U.S. Senate",
    state: "OH",
    district: null,
    incumbent: true,
    // Tier 2 — cited academic score. null === no legislative record.
    score: { system: "DW-NOMINATE", value: -0.34, source: "Voteview", vintage: "119th Cong." },
    // Tier 3 — self-reported positions, each independently sourced.
    positions: [
      { topic: "Broadband", quote: "Expand rural broadband through federal matching grants.", source: "Campaign site", self: true },
      { topic: "Infrastructure", quote: "Voted to reauthorize the state infrastructure bank.", source: "Voteview · roll-call", self: false },
    ],
    finance: { raised: "$4.2M", spent: "$3.1M", source: "FEC" },
  },
  {
    id: "c2",
    name: "Marcus Reed",
    party: "R",
    office: "U.S. House",
    state: "OH",
    district: "3",
    incumbent: true,
    score: { system: "DW-NOMINATE", value: 0.41, source: "Voteview", vintage: "119th Cong." },
    positions: [
      { topic: "Budget", quote: "Favors a balanced-budget amendment with phased spending caps.", source: "Vote Smart · PCT", self: true },
      { topic: "Local control", quote: "Opposes new federal mandates on local zoning.", source: "Campaign site", self: true },
    ],
    finance: { raised: "$1.9M", spent: "$1.4M", source: "FEC" },
  },
  {
    id: "c3",
    name: "Priya Castellanos",
    party: "I",
    office: "U.S. House",
    state: "OH",
    district: "7",
    incumbent: false,
    score: null, // challenger — no voting record → honesty flag
    positions: [
      { topic: "Elections", quote: "Pilot ranked-choice voting in statewide primaries.", source: "Campaign site", self: true },
      { topic: "Access", quote: "Fund a year-round constituent town-hall program.", source: "Candidate questionnaire", self: true },
    ],
    finance: { raised: "$310K", spent: "$190K", source: "FEC" },
  },
  {
    id: "c4",
    name: "Tom Bridger",
    party: "R",
    office: "Governor",
    state: "OH",
    district: null,
    incumbent: false,
    score: null, // state executive race — no congressional DW-NOMINATE
    positions: [
      { topic: "Taxes", quote: "Property-tax rebate for first-time homeowners.", source: "Campaign site", self: true },
      { topic: "Redistricting", quote: "Establish an independent redistricting commission.", source: "Vote Smart · PCT", self: true },
    ],
    finance: { raised: "$2.7M", spent: "$2.2M", source: "FEC" },
  },
];

const PARTY: Record<Party, { label: string; color: string }> = {
  D: { label: "Democrat", color: "var(--d)" },
  R: { label: "Republican", color: "var(--r)" },
  I: { label: "Independent", color: "var(--i)" },
};

type Bucket = "lean-liberal" | "center" | "lean-conservative";

// Disclosed, fixed bucketing method (documented on /methodology in production).
function bucketOf(score: Score | null): Bucket | null {
  if (!score) return null;
  if (score.value < -0.25) return "lean-liberal";
  if (score.value > 0.25) return "lean-conservative";
  return "center";
}
const BUCKET_LABEL: Record<Bucket, string> = {
  "lean-liberal": "Lean liberal",
  center: "Center",
  "lean-conservative": "Lean conservative",
};

// ---------------------------------------------------------------------------
// Tiny inline icon (kept self-contained — no icon dependency)
// ---------------------------------------------------------------------------
function SourceMark() {
  // a small "verified source" seal
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden="true" style={{ flexShrink: 0 }}>
      <circle cx="6" cy="6" r="5.2" fill="none" stroke="currentColor" strokeWidth="1.1" />
      <path d="M3.7 6.1 L5.2 7.6 L8.3 4.3" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Source chip — the signature element
// ---------------------------------------------------------------------------
function Source({ children }: { children: React.ReactNode }) {
  return (
    <span className="vr-src">
      <SourceMark />
      <span>{children}</span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// Tier 2 — ideology spectrum (neutral track) OR honesty flag
// ---------------------------------------------------------------------------
function IdeologyTier({ candidate }: { candidate: Candidate }) {
  const s = candidate.score;
  if (!s) {
    const why =
      candidate.office === "Governor"
        ? "No congressional voting record — state executive office."
        : "No legislative record yet.";
    return (
      <div className="vr-tier">
        <div className="vr-tier-label">Ideology</div>
        <div className="vr-noflag">
          <div className="vr-noflag-head">No cited score</div>
          <div className="vr-noflag-body">{why} Positions below are self-reported.</div>
        </div>
      </div>
    );
  }
  const pct = ((s.value + 1) / 2) * 100; // map [-1,1] → [0,100]
  const bucket = bucketOf(s)!;
  return (
    <div className="vr-tier">
      <div className="vr-tier-label">
        Ideology <span className="vr-bucket">{BUCKET_LABEL[bucket]}</span>
      </div>
      <div className="vr-axis">
        <span className="vr-axis-end">Liberal</span>
        <div className="vr-track">
          <div className="vr-track-tick" style={{ left: "50%" }} />
          <div className="vr-marker" style={{ left: pct + "%" }} aria-hidden="true" />
        </div>
        <span className="vr-axis-end vr-axis-end--r">Conservative</span>
      </div>
      <div className="vr-score-row">
        <span className="vr-score-val">
          {s.system} {s.value > 0 ? "+" : ""}
          {s.value.toFixed(2)}
        </span>
        <Source>
          {s.source} · {s.vintage}
        </Source>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Candidate card
// ---------------------------------------------------------------------------
function CandidateCard({ candidate }: { candidate: Candidate }) {
  const p = PARTY[candidate.party];
  const seat =
    candidate.office +
    (candidate.district ? " · District " + candidate.district : "") +
    " · " +
    candidate.state;
  const initials = candidate.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);
  return (
    <article className="vr-card">
      <header className="vr-card-head">
        <div className="vr-avatar" aria-hidden="true">
          {initials}
        </div>
        <div className="vr-id">
          <h3 className="vr-name">{candidate.name}</h3>
          <div className="vr-seat">{seat}</div>
        </div>
        <div className="vr-party" title={p.label}>
          <span className="vr-party-dot" style={{ background: p.color }} />
          <span className="vr-party-label">{p.label}</span>
          {candidate.incumbent && <span className="vr-inc">Incumbent</span>}
        </div>
      </header>

      <div className="vr-rule" />

      <IdeologyTier candidate={candidate} />

      <div className="vr-rule" />

      <div className="vr-tier">
        <div className="vr-tier-label">Stated positions</div>
        <ul className="vr-pos">
          {candidate.positions.map((pos, i) => (
            <li key={i} className="vr-pos-item">
              <span className="vr-pos-topic">{pos.topic}</span>
              <span className="vr-pos-quote">&ldquo;{pos.quote}&rdquo;</span>
              <Source>{pos.source}</Source>
            </li>
          ))}
        </ul>
      </div>

      <div className="vr-rule" />

      <div className="vr-finance">
        <span>
          <span className="vr-fin-k">Raised</span> {candidate.finance.raised}
        </span>
        <span>
          <span className="vr-fin-k">Spent</span> {candidate.finance.spent}
        </span>
        <Source>{candidate.finance.source}</Source>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Filter bar
// ---------------------------------------------------------------------------
type SegOption = { v: string; t: string; dot?: string };

function Segmented({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: SegOption[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="vr-seg">
      <span className="vr-seg-label">{label}</span>
      <div className="vr-seg-opts" role="group" aria-label={label}>
        {options.map((o) => (
          <button
            key={o.v}
            className={"vr-seg-btn" + (value === o.v ? " is-on" : "")}
            aria-pressed={value === o.v}
            onClick={() => onChange(o.v)}
          >
            {o.dot && <span className="vr-party-dot" style={{ background: o.dot }} />}
            {o.t}
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function Home() {
  const [q, setQ] = useState("");
  const [office, setOffice] = useState("all");
  const [party, setParty] = useState("all");
  const [ideology, setIdeology] = useState("all");

  const { shown, hiddenByIdeology } = useMemo(() => {
    let hidden = 0;
    const shown = CANDIDATES.filter((c) => {
      if (q && !c.name.toLowerCase().includes(q.toLowerCase())) return false;
      if (office !== "all" && c.office !== office) return false;
      if (party !== "all" && c.party !== party) return false;
      if (ideology !== "all") {
        // Honesty: ideology filter applies ONLY to candidates with a cited score.
        if (!c.score) {
          hidden++;
          return false;
        }
        if (bucketOf(c.score) !== ideology) return false;
      }
      return true;
    });
    return { shown, hiddenByIdeology: hidden };
  }, [q, office, party, ideology]);

  return (
    <div className="vr-root">
      <header className="vr-masthead">
        <div className="vr-eyebrow">Footnote · footnote.vote · Sample / OH</div>
        <h1 className="vr-title">Every candidate. Every source. No verdict.</h1>
        <p className="vr-doctrine">
          <SourceMark /> We cite a candidate&rsquo;s leaning. We never assign one.
        </p>
        <div className="vr-tierkey">
          <span>
            <b>1</b> Party — a filed fact
          </span>
          <span>
            <b>2</b> Ideology — cited academic score
          </span>
          <span>
            <b>3</b> Positions — self-reported, sourced
          </span>
        </div>
      </header>

      <div className="vr-filters">
        <input
          className="vr-search"
          placeholder="Search candidates"
          aria-label="Search candidates"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <Segmented
          label="Office"
          value={office}
          onChange={setOffice}
          options={[
            { v: "all", t: "All" },
            { v: "U.S. Senate", t: "Senate" },
            { v: "U.S. House", t: "House" },
            { v: "Governor", t: "Governor" },
          ]}
        />
        <Segmented
          label="Party"
          value={party}
          onChange={setParty}
          options={[
            { v: "all", t: "All" },
            { v: "D", t: "D", dot: "var(--d)" },
            { v: "R", t: "R", dot: "var(--r)" },
            { v: "I", t: "I", dot: "var(--i)" },
          ]}
        />
        <Segmented
          label="Ideology"
          value={ideology}
          onChange={setIdeology}
          options={[
            { v: "all", t: "All" },
            { v: "lean-liberal", t: "Lean lib." },
            { v: "center", t: "Center" },
            { v: "lean-conservative", t: "Lean con." },
          ]}
        />
      </div>

      {ideology !== "all" && (
        <p className="vr-honestnote">
          <SourceMark /> Ideology filter applies only to candidates with a cited score.
          {hiddenByIdeology > 0 &&
            ` ${hiddenByIdeology} candidate${hiddenByIdeology > 1 ? "s" : ""} without a score ${
              hiddenByIdeology > 1 ? "are" : "is"
            } hidden from this view.`}
        </p>
      )}

      <main className="vr-grid">
        {shown.map((c) => (
          <CandidateCard key={c.id} candidate={c} />
        ))}
        {shown.length === 0 && (
          <div className="vr-empty">No candidates match these filters. Clear one to see more.</div>
        )}
      </main>

      <footer className="vr-foot">
        Sample data — fictional candidates for layout only. Production sources: FEC,
        Congress.gov, Voteview, OpenStates, Vote Smart.
      </footer>
    </div>
  );
}
