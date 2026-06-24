import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Methodology & neutrality: Footnote",
  description:
    "How Footnote sources, scores, and discloses everything it shows about a candidate, and the rule we follow when we can't.",
};

export default function Methodology() {
  return (
    <div className="vr-root">
      <div className="vr-doc-hero">
        <Link href="/" className="vr-back">
          ← Footnote
        </Link>
        <h1 className="vr-doc-h1">Methodology &amp; neutrality</h1>
        <p className="vr-doctrine" style={{ marginBottom: 16 }}>
          We cite a candidate&rsquo;s leaning. We never assign one.
        </p>
        <p className="vr-doc-lede">
          This page is the contract behind everything else on the site. It spells out, in plain
          language, exactly how every fact, score, and quote you see is produced: what we never
          do, where every number comes from, and how to tell us when we&rsquo;ve gotten something
          wrong. Rule of thumb: if a calculation or editorial choice isn&rsquo;t disclosed here, it
          shouldn&rsquo;t be on the site.
        </p>
      </div>

      <div className="vr-doc-callout vr-doc-callout--todo">
        <strong>Status:</strong>{" "}Footnote hasn&rsquo;t ingested real candidate data yet. What you
        see elsewhere on the site today is fictional sample data, built to test layout. This page
        describes the rules that will govern real candidate data the moment it ships, published
        ahead of time so the policy is public before any candidate appears.
      </div>

      <section className="vr-doc-section">
        <h2 className="vr-doc-h2">What we don&rsquo;t do</h2>
        <p className="vr-doc-p">
          We do not rate, score, endorse, or editorialize. We aggregate and attribute. Every
          ideological signal on this site traces to an external, attributable source. If a
          feature would require us to be the arbiter of where a candidate falls on the spectrum,
          we don&rsquo;t ship it. That includes:
        </p>
        <ul className="vr-doc-list">
          <li>No ratings, endorsements, or scores of our own invention.</li>
          <li>No AI-generated candidate summaries or characterizations.</li>
          <li>No predictions.</li>
          <li>
            No local races, county, municipal, school board, judicial races, or ballot measures.
            Not a judgment about their importance, just outside what we can responsibly source
            and maintain right now.
          </li>
        </ul>
        <p className="vr-doc-p" style={{ marginBottom: 0 }}>
          <strong>A note on AI.</strong>{" "}AI tools were used in building this site, including
          writing code and this page. They are not used to generate, summarize, score, or
          otherwise determine anything about a candidate. Every candidate-facing fact, score, and
          quote comes only from the disclosed sources above, through the disclosed methods, never
          from a model&rsquo;s judgment.
        </p>
      </section>

      <section className="vr-doc-section">
        <h2 className="vr-doc-h2">Three tiers, always with a source</h2>
        <p className="vr-doc-p">
          Leaning is presented in three tiers, never blended into one score. Each tier has a
          different evidentiary basis, and we show you which one you&rsquo;re looking at.
        </p>

        <div className="vr-doc-tier">
          <h3 className="vr-doc-h3">Tier 1: Party affiliation</h3>
          <p className="vr-doc-p" style={{ marginBottom: 0 }}>
            Shown for every candidate. A fact pulled from official candidate filings: coarse, but
            unimpeachable. This is the always-on baseline filter; we don&rsquo;t infer or
            second-guess it.
          </p>
        </div>

        <div className="vr-doc-tier">
          <h3 className="vr-doc-h3">Tier 2: Academic ideology score</h3>
          <p className="vr-doc-p">
            Shown for candidates with a voting record. Federal incumbents get DW-NOMINATE scores
            from Voteview; state legislators get Shor-McCarty scores from Harvard Dataverse. We
            display the number as published, link the methodology behind it, and filter on it. We
            never recompute, adjust, or smooth it.
          </p>
          <p className="vr-doc-p" style={{ marginBottom: 0 }}>
            Candidates with no legislative record (challengers, most state-executive candidates)
            don&rsquo;t get a score. We never fill that gap with a guess. Instead they get a
            visible <strong>&ldquo;No legislative record yet&rdquo;</strong>{" "}marker, and the
            ideology filter simply doesn&rsquo;t apply to them. The gap is information for the
            voter, not something to paper over.
          </p>
        </div>

        <div className="vr-doc-tier">
          <h3 className="vr-doc-h3">Tier 3: Self-reported positions</h3>
          <p className="vr-doc-p" style={{ marginBottom: 0 }}>
            Shown for everyone, especially challengers with no voting record. Pulled from campaign
            sites and candidate questionnaires (Vote Smart&rsquo;s Political Courage Test). Always
            shown as a verbatim quote with its source, never paraphrased or characterized in our
            own words.
          </p>
        </div>
      </section>

      <section className="vr-doc-section">
        <h2 className="vr-doc-h2">How the leaning buckets are calculated</h2>
        <p className="vr-doc-p">
          Filters like &ldquo;lean liberal,&rdquo; &ldquo;center,&rdquo; and &ldquo;lean
          conservative&rdquo; are <em>derived</em>{" "}from the Tier 2 score at query time; we never
          store a hand-assigned bucket. For federal candidates, the current (v1) method is a fixed
          cutoff on the DW-NOMINATE scale, which runs from −1 (most liberal) to +1 (most
          conservative):
        </p>
        <ul className="vr-doc-list">
          <li>Below −0.25 → <strong>Lean liberal</strong></li>
          <li>−0.25 to +0.25 → <strong>Center</strong></li>
          <li>Above +0.25 → <strong>Lean conservative</strong></li>
        </ul>
        <p className="vr-doc-p" style={{ marginBottom: 0 }}>
          This cutoff is arbitrary by necessity (any line drawn on a continuous score is), but it
          is fixed and applied identically to every candidate, regardless of party or office, with
          no exceptions. If we ever revise it, the new method replaces this section publicly; it
          is never changed quietly. State legislators&rsquo; Shor-McCarty scores use a different
          scale, and the published thresholds for bucketing them will be added here once state
          coverage ships.
        </p>
      </section>

      <section className="vr-doc-section">
        <h2 className="vr-doc-h2">Positions and factual claims</h2>
        <p className="vr-doc-p">
          A self-reported position often fuses two different kinds of statement: a{" "}
          <strong>stance</strong>{" "}(a value or policy preference; no truth value, we never
          adjudicate it) and an <strong>empirical claim</strong>{" "}(a checkable factual assertion;
          it has a truth value). Treating them as one thing is the trap: publish the fused quote
          whole and we launder any false premise; rate the premise ourselves and we become the
          arbiter we promised not to be.
        </p>
        <p className="vr-doc-p">
          <strong>Governing rule: evidence, never verdict.</strong>{" "}We never label a claim true or
          false, and we never attach a fact-checker&rsquo;s rating. Where a position contains a
          checkable empirical claim, we may eventually attach a neutral pointer to the primary
          data source (the relevant agency, Census, CBO, or academic review) so you can compare
          the claim to the data yourself. The judgment is outsourced to a citable source, never
          made by us.
        </p>
        <p className="vr-doc-p">Today, every position on the site carries this standing disclaimer:</p>
        <p className="vr-doc-quote">
          &ldquo;Positions are candidates&rsquo; own statements, in their own words; we do not
          verify factual claims within them.&rdquo;
        </p>
        <p className="vr-doc-p">
          The evidence-pointer layer described above is a deliberate later addition, not part of
          this disclaimer yet, but the data model already carries the hook so we never have to
          repaint history when it ships.
        </p>
        <p className="vr-doc-p">
          <strong>Residual judgment, stated honestly:</strong>{" "}we can&rsquo;t reduce judgment to
          zero. Deciding what counts as &ldquo;checkable,&rdquo; which source is
          &ldquo;authoritative,&rdquo; and whether to annotate at all are themselves judgments.
          Any such rule we adopt will be rule-based, symmetric, and published here, applied to
          every candidate regardless of who said it or which way it cuts. The goal isn&rsquo;t the
          absence of judgment; it&rsquo;s judgment that is minimal, disclosed, and auditable.
        </p>
        <p className="vr-doc-p" style={{ marginBottom: 0 }}>
          <strong>A note on participation bias:</strong>{" "}when positions come from a survey
          candidates opt into, response rates skew. Vote Smart&rsquo;s own program has seen large
          partisan gaps in some races. We pull from campaign sites in addition to Vote Smart,
          which softens this, but an empty Tier 3 for a candidate is never a neutral signal about
          that candidate. It&rsquo;s a coverage gap, and we&rsquo;d rather you know that than read
          silence as a statement.
        </p>
      </section>

      <section className="vr-doc-section">
        <h2 className="vr-doc-h2">Sources</h2>
        <p className="vr-doc-p">
          Every <code>Position</code> and <code>IdeologyScore</code>{" "}in our data carries its own
          provenance: source name, source URL, and retrieval date. If a row can&rsquo;t cite
          itself, it doesn&rsquo;t render. These are the sources that policy draws on:
        </p>
        <table className="vr-doc-table">
          <thead>
            <tr>
              <th>Source</th>
              <th>Provides</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <a href="https://www.fec.gov" target="_blank" rel="noopener noreferrer">
                  FEC
                </a>
              </td>
              <td>Federal candidates, committees, campaign finance</td>
              <td>Federal only; the most reliable record of who is actually running, plus money.</td>
            </tr>
            <tr>
              <td>
                <a href="https://www.congress.gov" target="_blank" rel="noopener noreferrer">
                  Congress.gov
                </a>
              </td>
              <td>Official bills, members, roll-call votes</td>
              <td>The official successor to the now-shut-down ProPublica Congress API.</td>
            </tr>
            <tr>
              <td>
                <a
                  href="https://github.com/unitedstates/congress-legislators"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  congress-legislators
                </a>
              </td>
              <td>Legislator ID crosswalk (bioguide, FEC, Vote Smart, ICPSR…)</td>
              <td>Public domain. Used to join every other federal source together.</td>
            </tr>
            <tr>
              <td>
                <a href="https://voteview.com" target="_blank" rel="noopener noreferrer">
                  Voteview
                </a>
              </td>
              <td>DW-NOMINATE ideology scores (federal)</td>
              <td>Academic (UCLA). The Tier 2 source for every member of Congress.</td>
            </tr>
            <tr>
              <td>
                <a href="https://v3.openstates.org" target="_blank" rel="noopener noreferrer">
                  OpenStates
                </a>
              </td>
              <td>State legislators, bills, votes</td>
              <td>Backbone of the state tier. Strong on sitting legislators; thinner on challengers.</td>
            </tr>
            <tr>
              <td>
                <a href="https://dataverse.harvard.edu" target="_blank" rel="noopener noreferrer">
                  Shor-McCarty (Harvard Dataverse)
                </a>
              </td>
              <td>State legislator ideology scores</td>
              <td>Academic. Released infrequently and lags the current cycle; vintage is always disclosed.</td>
            </tr>
            <tr>
              <td>
                <a href="https://votesmart.org" target="_blank" rel="noopener noreferrer">
                  Vote Smart
                </a>
              </td>
              <td>Political Courage Test, stated positions, interest-group ratings</td>
              <td>Covers challengers and state candidates, critical for Tier 3. API access is gated; campaign-site quotes are the fallback.</td>
            </tr>
          </tbody>
        </table>
        <p className="vr-doc-p" style={{ marginBottom: 0 }}>
          Local, county, and judicial races, and richer ballot-access data, sit behind a paid
          Ballotpedia license, a possible upgrade path, not part of the current scope.
        </p>
      </section>

      <section className="vr-doc-section">
        <h2 className="vr-doc-h2">Known limitations</h2>
        <ul className="vr-doc-list">
          <li>
            <strong>Score vintage and lag.</strong>{" "}Academic ideology scores aren&rsquo;t computed
            in real time. Every score shown carries the legislative session or vintage it was
            computed from.
          </li>
          <li>
            <strong>Coverage gaps.</strong>{" "}Self-reported positions depend on what a campaign has
            published and whether Vote Smart access pans out. An empty section means we
            don&rsquo;t have data, not that a candidate has no position.
          </li>
          <li>
            <strong>Participation bias.</strong>{" "}Survey-based position data skews toward
            candidates who choose to respond. See above.
          </li>
          <li>
            <strong>Freshness near election day.</strong>{" "}Ballot data (withdrawals, replacements,
            late entrants) changes heavily in the final weeks of a race. We tighten our update
            cadence as elections approach and will never imply the data is final; expect a
            &ldquo;verify with your local election office before voting&rdquo; notice near
            election day.
          </li>
        </ul>
      </section>

      <section className="vr-doc-section">
        <h2 className="vr-doc-h2">Corrections &amp; contact</h2>
        <div className="vr-doc-callout vr-doc-callout--todo">
          <strong>TODO: not live yet.</strong>{" "}A real correction process and contact path for
          candidates and the public belongs here, and we&rsquo;re not willing to ship a fake one
          just to fill the section. This placeholder stays until that channel exists. If
          you&rsquo;re reading this and need to reach us, none of the data here is real yet, which
          is exactly why.
        </div>
      </section>

      <footer className="vr-doc-foot">
        <p className="vr-doctrine">
          If a calculation or editorial choice isn&rsquo;t disclosed here, it shouldn&rsquo;t be on
          the site.
        </p>
      </footer>
    </div>
  );
}
