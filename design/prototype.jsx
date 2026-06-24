import { useState, useEffect, useMemo } from "react";

/**
 * Footnote (footnote.vote) — design/prototype.jsx
 *
 * Static design mockup for Claude Code handoff. Demonstrates the layout and the
 * core product doctrine in real components:
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
 * data for layout purposes. No real person's positions are represented.
 */

// ---------------------------------------------------------------------------
// Sample data (fictional)
// ---------------------------------------------------------------------------
const CANDIDATES = [
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

const PARTY = {
  D: { label: "Democrat", color: "var(--d)" },
  R: { label: "Republican", color: "var(--r)" },
  I: { label: "Independent", color: "var(--i)" },
};

// Disclosed, fixed bucketing method (documented on /methodology in production).
function bucketOf(score) {
  if (!score) return null;
  if (score.value < -0.25) return "lean-liberal";
  if (score.value > 0.25) return "lean-conservative";
  return "center";
}
const BUCKET_LABEL = {
  "lean-liberal": "Lean liberal",
  center: "Center",
  "lean-conservative": "Lean conservative",
};

// ---------------------------------------------------------------------------
// Tiny inline icons (kept self-contained — no icon dependency)
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
function Source({ children }) {
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
function IdeologyTier({ candidate }) {
  const s = candidate.score;
  if (!s) {
    const why = candidate.office === "Governor"
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
  const bucket = bucketOf(s);
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
          {s.system} {s.value > 0 ? "+" : ""}{s.value.toFixed(2)}
        </span>
        <Source>{s.source} · {s.vintage}</Source>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Candidate card
// ---------------------------------------------------------------------------
function CandidateCard({ candidate }) {
  const p = PARTY[candidate.party];
  const seat = candidate.office + (candidate.district ? " · District " + candidate.district : "") + " · " + candidate.state;
  const initials = candidate.name.split(" ").map((w) => w[0]).join("").slice(0, 2);
  return (
    <article className="vr-card">
      <header className="vr-card-head">
        <div className="vr-avatar" aria-hidden="true">{initials}</div>
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
        <span><span className="vr-fin-k">Raised</span> {candidate.finance.raised}</span>
        <span><span className="vr-fin-k">Spent</span> {candidate.finance.spent}</span>
        <Source>{candidate.finance.source}</Source>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Filter bar
// ---------------------------------------------------------------------------
function Segmented({ label, options, value, onChange }) {
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
// App
// ---------------------------------------------------------------------------
export default function VoterGuidePrototype() {
  const [q, setQ] = useState("");
  const [office, setOffice] = useState("all");
  const [party, setParty] = useState("all");
  const [ideology, setIdeology] = useState("all");

  useEffect(() => {
    const id = "vr-fonts";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  const { shown, hiddenByIdeology } = useMemo(() => {
    let hidden = 0;
    const shown = CANDIDATES.filter((c) => {
      if (q && !c.name.toLowerCase().includes(q.toLowerCase())) return false;
      if (office !== "all" && c.office !== office) return false;
      if (party !== "all" && c.party !== party) return false;
      if (ideology !== "all") {
        // Honesty: ideology filter applies ONLY to candidates with a cited score.
        if (!c.score) { hidden++; return false; }
        if (bucketOf(c.score) !== ideology) return false;
      }
      return true;
    });
    return { shown, hiddenByIdeology: hidden };
  }, [q, office, party, ideology]);

  return (
    <div className="vr-root">
      <style>{CSS}</style>

      <header className="vr-masthead">
        <div className="vr-eyebrow">Footnote · footnote.vote · Sample / OH</div>
        <h1 className="vr-title">Every candidate. Every source. No verdict.</h1>
        <p className="vr-doctrine">
          <SourceMark /> We cite a candidate&rsquo;s leaning. We never assign one.
        </p>
        <div className="vr-tierkey">
          <span><b>1</b> Party — a filed fact</span>
          <span><b>2</b> Ideology — cited academic score</span>
          <span><b>3</b> Positions — self-reported, sourced</span>
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
          {hiddenByIdeology > 0 && ` ${hiddenByIdeology} candidate${hiddenByIdeology > 1 ? "s" : ""} without a score ${hiddenByIdeology > 1 ? "are" : "is"} hidden from this view.`}
        </p>
      )}

      <main className="vr-grid">
        {shown.map((c) => <CandidateCard key={c.id} candidate={c} />)}
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

// ---------------------------------------------------------------------------
// Styles — full control via custom properties (avoids Tailwind JIT limits)
// ---------------------------------------------------------------------------
const CSS = `
.vr-root{
  --paper:#ECEEE8; --card:#FBFBF8; --ink:#1C211E; --ink-soft:#5C645E;
  --line:#D5D8CF; --cite:#8A5E14; --cite-bg:#F2E8D2;
  --d:#2B5C9B; --r:#B23A3A; --i:#73776F;
  background:var(--paper); color:var(--ink);
  font-family:'Inter',system-ui,sans-serif;
  min-height:100%; padding:32px 22px 56px; box-sizing:border-box;
  -webkit-font-smoothing:antialiased;
}
.vr-root *{box-sizing:border-box;}

/* Masthead */
.vr-masthead{max-width:1080px;margin:0 auto 26px;}
.vr-eyebrow{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.14em;
  text-transform:uppercase;color:var(--ink-soft);}
.vr-title{font-family:'Space Grotesk',sans-serif;font-weight:700;
  font-size:clamp(28px,4.4vw,46px);line-height:1.04;letter-spacing:-.02em;
  margin:10px 0 12px;max-width:14ch;}
.vr-doctrine{display:inline-flex;align-items:center;gap:7px;margin:0;
  font-family:'JetBrains Mono',monospace;font-size:13px;color:var(--cite);
  background:var(--cite-bg);padding:6px 11px;border-radius:2px;}
.vr-tierkey{display:flex;flex-wrap:wrap;gap:18px;margin-top:18px;
  font-size:12.5px;color:var(--ink-soft);}
.vr-tierkey b{font-family:'JetBrains Mono',monospace;color:var(--ink);
  border:1px solid var(--line);border-radius:50%;width:18px;height:18px;
  display:inline-flex;align-items:center;justify-content:center;font-size:11px;
  margin-right:6px;}
.vr-tierkey span{display:inline-flex;align-items:center;}

/* Filters */
.vr-filters{max-width:1080px;margin:0 auto;display:flex;flex-wrap:wrap;
  align-items:flex-end;gap:14px 22px;padding-bottom:16px;
  border-bottom:1px solid var(--line);}
.vr-search{font-family:'Inter',sans-serif;font-size:13px;color:var(--ink);
  background:var(--card);border:1px solid var(--line);border-radius:3px;
  padding:9px 12px;min-width:190px;flex:1 1 190px;max-width:280px;}
.vr-search::placeholder{color:var(--ink-soft);}
.vr-seg{display:flex;flex-direction:column;gap:6px;}
.vr-seg-label{font-family:'JetBrains Mono',monospace;font-size:10px;
  letter-spacing:.12em;text-transform:uppercase;color:var(--ink-soft);}
.vr-seg-opts{display:flex;gap:0;border:1px solid var(--line);border-radius:3px;
  overflow:hidden;background:var(--card);}
.vr-seg-btn{font-family:'Inter',sans-serif;font-size:12.5px;color:var(--ink-soft);
  background:transparent;border:0;border-left:1px solid var(--line);
  padding:8px 12px;cursor:pointer;display:inline-flex;align-items:center;gap:6px;
  transition:background .12s,color .12s;}
.vr-seg-btn:first-child{border-left:0;}
.vr-seg-btn:hover{background:var(--paper);color:var(--ink);}
.vr-seg-btn.is-on{background:var(--ink);color:var(--card);}
.vr-seg-btn.is-on .vr-party-dot{outline:1px solid var(--card);}

.vr-honestnote{max-width:1080px;margin:14px auto 0;display:flex;align-items:center;
  gap:7px;font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--cite);}

/* Grid */
.vr-grid{max-width:1080px;margin:22px auto 0;display:grid;gap:18px;
  grid-template-columns:repeat(auto-fill,minmax(330px,1fr));}
.vr-empty{grid-column:1/-1;padding:40px;text-align:center;color:var(--ink-soft);
  border:1px dashed var(--line);border-radius:4px;}

/* Card */
.vr-card{background:var(--card);border:1px solid var(--line);border-radius:5px;
  padding:18px 18px 16px;transition:box-shadow .15s,transform .15s;}
.vr-card:hover{box-shadow:0 6px 22px -14px rgba(28,33,30,.4);transform:translateY(-1px);}
.vr-card-head{display:flex;align-items:flex-start;gap:13px;}
.vr-avatar{width:44px;height:44px;border-radius:4px;flex-shrink:0;
  background:var(--paper);border:1px solid var(--line);
  display:flex;align-items:center;justify-content:center;
  font-family:'Space Grotesk',sans-serif;font-weight:500;font-size:15px;color:var(--ink-soft);}
.vr-id{flex:1;min-width:0;}
.vr-name{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:18px;
  letter-spacing:-.01em;margin:1px 0 3px;}
.vr-seat{font-size:12.5px;color:var(--ink-soft);}
.vr-party{display:flex;flex-direction:column;align-items:flex-end;gap:3px;flex-shrink:0;}
.vr-party-dot{width:9px;height:9px;border-radius:50%;display:inline-block;}
.vr-party-label{font-size:11.5px;color:var(--ink-soft);display:flex;align-items:center;gap:5px;}
.vr-inc{font-family:'JetBrains Mono',monospace;font-size:9.5px;letter-spacing:.08em;
  text-transform:uppercase;color:var(--ink-soft);border:1px solid var(--line);
  padding:1px 5px;border-radius:2px;}

.vr-rule{height:1px;background:var(--line);margin:14px 0;}

.vr-tier-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.13em;
  text-transform:uppercase;color:var(--ink-soft);margin-bottom:10px;
  display:flex;align-items:center;gap:9px;}
.vr-bucket{font-family:'Inter',sans-serif;font-size:11px;letter-spacing:0;
  text-transform:none;color:var(--ink);background:var(--paper);
  border:1px solid var(--line);border-radius:2px;padding:1px 7px;}

/* Ideology axis (neutral track — deliberately not red/blue) */
.vr-axis{display:flex;align-items:center;gap:10px;}
.vr-axis-end{font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--ink-soft);
  white-space:nowrap;}
.vr-track{position:relative;flex:1;height:3px;background:var(--line);border-radius:2px;}
.vr-track-tick{position:absolute;top:-3px;width:1px;height:9px;background:var(--line);transform:translateX(-50%);}
.vr-marker{position:absolute;top:50%;width:13px;height:13px;border-radius:50%;
  background:var(--ink);border:2.5px solid var(--card);
  box-shadow:0 0 0 1px var(--ink);transform:translate(-50%,-50%);}
.vr-score-row{display:flex;align-items:center;justify-content:space-between;
  gap:10px;margin-top:10px;flex-wrap:wrap;}
.vr-score-val{font-family:'JetBrains Mono',monospace;font-size:12.5px;color:var(--ink);}

/* Honesty flag */
.vr-noflag{border:1px dashed var(--line);border-radius:4px;padding:11px 12px;
  background:repeating-linear-gradient(135deg,transparent,transparent 7px,rgba(0,0,0,.012) 7px,rgba(0,0,0,.012) 14px);}
.vr-noflag-head{font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--ink);margin-bottom:3px;}
.vr-noflag-body{font-size:12.5px;color:var(--ink-soft);line-height:1.45;}

/* Positions */
.vr-pos{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:11px;}
.vr-pos-item{display:grid;gap:4px;}
.vr-pos-topic{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.1em;
  text-transform:uppercase;color:var(--ink-soft);}
.vr-pos-quote{font-size:13.5px;line-height:1.45;color:var(--ink);}

/* Finance */
.vr-finance{display:flex;align-items:center;gap:16px;flex-wrap:wrap;font-size:13px;}
.vr-fin-k{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.1em;
  text-transform:uppercase;color:var(--ink-soft);margin-right:5px;}

/* Source chip — the signature */
.vr-src{display:inline-flex;align-items:center;gap:5px;color:var(--cite);
  font-family:'JetBrains Mono',monospace;font-size:11px;line-height:1;}

.vr-foot{max-width:1080px;margin:40px auto 0;font-family:'JetBrains Mono',monospace;
  font-size:11px;color:var(--ink-soft);line-height:1.6;border-top:1px solid var(--line);padding-top:16px;}

/* Quality floor */
.vr-root :focus-visible{outline:2px solid var(--cite);outline-offset:2px;border-radius:2px;}
@media (max-width:560px){
  .vr-filters{gap:12px 16px;}
  .vr-grid{grid-template-columns:1fr;}
}
@media (prefers-reduced-motion:reduce){
  .vr-card,.vr-seg-btn{transition:none;}
  .vr-card:hover{transform:none;}
}
`;
