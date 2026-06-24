/**
 * Phase 0 spike (see PLAN.md): prove the join for one state.
 *
 * Pulls active 2026-cycle federal candidates for Tennessee from the FEC,
 * crosswalks sitting members to a bioguide ID via congress-legislators, and
 * attaches a cited DW-NOMINATE score from Voteview where one exists. Citation
 * columns (source_name/source_url/retrieved_at) are populated on every
 * ideology_score row; candidates with no Voteview match simply get no score,
 * the honesty flag the UI shows for that is real, not simulated here.
 *
 * Not idempotent: re-running this against a non-empty database will insert
 * duplicate rows. Fine for a one-off spike; Phase 1 hardens ingestion with
 * proper upserts against natural keys (fec_id, etc).
 *
 * Usage: npm run ingest:tn-spike
 * (runs via `node --env-file=.env --import tsx`, .env must already exist)
 */

import { db } from "../db/client";
import {
  offices,
  races,
  candidates,
  candidacies,
  ideologyScores,
} from "../db/schema";

const STATE = "TN";
const CYCLE = 2026;
const CONGRESS = 119;
const FEC_API_KEY = process.env.FEC_API_KEY;
if (!FEC_API_KEY) throw new Error("FEC_API_KEY is not set");

// ---------------------------------------------------------------------------
// FEC: active candidates for the cycle
// ---------------------------------------------------------------------------
type FecCandidate = {
  candidate_id: string;
  name: string;
  party: string;
  office: string; // "H" | "S"
  district: string | null;
  election_years: number[];
  incumbent_challenge_full: string | null;
};

async function fetchFecCandidates(office: "H" | "S"): Promise<FecCandidate[]> {
  const all: FecCandidate[] = [];
  let page = 1;
  while (true) {
    const url = `https://api.open.fec.gov/v1/candidates/?api_key=${FEC_API_KEY}&state=${STATE}&office=${office}&cycle=${CYCLE}&per_page=100&page=${page}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`FEC API ${res.status}: ${await res.text()}`);
    const data = await res.json();
    all.push(...data.results);
    if (page >= data.pagination.pages) break;
    page++;
  }
  return all.filter((c) => c.election_years?.includes(CYCLE));
}

// ---------------------------------------------------------------------------
// congress-legislators: FEC id -> bioguide id crosswalk
// ---------------------------------------------------------------------------
type Legislator = {
  id: { bioguide: string; fec?: string[]; votesmart?: number };
  name: { official_full: string };
};

async function fetchFecToBioguideMap(): Promise<{
  fecToBioguide: Map<string, string>;
  bioguideToName: Map<string, string>;
  bioguideToVotesmart: Map<string, string>;
}> {
  const res = await fetch(
    "https://unitedstates.github.io/congress-legislators/legislators-current.json",
  );
  if (!res.ok) throw new Error(`congress-legislators ${res.status}`);
  const legislators: Legislator[] = await res.json();

  const fecToBioguide = new Map<string, string>();
  const bioguideToName = new Map<string, string>();
  const bioguideToVotesmart = new Map<string, string>();
  for (const l of legislators) {
    bioguideToName.set(l.id.bioguide, l.name.official_full);
    if (l.id.votesmart) {
      bioguideToVotesmart.set(l.id.bioguide, String(l.id.votesmart));
    }
    for (const fecId of l.id.fec ?? []) {
      fecToBioguide.set(fecId, l.id.bioguide);
    }
  }
  return { fecToBioguide, bioguideToName, bioguideToVotesmart };
}

// ---------------------------------------------------------------------------
// Voteview: bioguide id -> DW-NOMINATE score for the current congress
// ---------------------------------------------------------------------------
function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      fields.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  fields.push(cur);
  return fields;
}

async function fetchVoteviewScores(): Promise<
  Map<string, { value: number; bioname: string }>
> {
  const res = await fetch(
    "https://voteview.com/static/data/out/members/HSall_members.csv",
  );
  if (!res.ok) throw new Error(`Voteview ${res.status}`);
  const csv = await res.text();
  const lines = csv.trim().split("\n");
  const header = parseCsvLine(lines[0]);
  const congressIdx = header.indexOf("congress");
  const bioguideIdx = header.indexOf("bioguide_id");
  const dim1Idx = header.indexOf("nominate_dim1");
  const bionameIdx = header.indexOf("bioname");

  const byBioguide = new Map<string, { value: number; bioname: string }>();
  for (const line of lines.slice(1)) {
    const fields = parseCsvLine(line);
    if (fields[congressIdx] !== String(CONGRESS)) continue;
    const bioguideId = fields[bioguideIdx];
    const dim1 = fields[dim1Idx];
    if (!bioguideId || !dim1) continue;
    byBioguide.set(bioguideId, {
      value: Number(dim1),
      bioname: fields[bionameIdx],
    });
  }
  return byBioguide;
}

// ---------------------------------------------------------------------------
// Name formatting for FEC's "LAST, FIRST MIDDLE SUFFIX" convention
// ---------------------------------------------------------------------------
const SUFFIXES = new Set([
  "MR",
  "MRS",
  "MS",
  "DR",
  "JR",
  "SR",
  "II",
  "III",
  "IV",
  "HON",
  "ESQ",
  "N/A",
]);

function formatFecName(raw: string): string {
  const [last, rest] = raw.split(",").map((s) => s.trim());
  if (!rest) return titleCase(last);
  const firstMiddle = rest
    .split(/\s+/)
    .map((tok) => tok.replace(/\.$/, ""))
    .filter((tok) => tok && !SUFFIXES.has(tok.toUpperCase()))
    .join(" ");
  return `${titleCase(firstMiddle)} ${titleCase(last)}`;
}

function titleCase(s: string): string {
  return s
    .split(/\s+/)
    .map((w) => (w.length > 1 ? w[0] + w.slice(1).toLowerCase() : w))
    .join(" ");
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------
async function main() {
  console.log(`Fetching FEC candidates for ${STATE}, cycle ${CYCLE}...`);
  const [houseCandidates, senateCandidates] = await Promise.all([
    fetchFecCandidates("H"),
    fetchFecCandidates("S"),
  ]);
  console.log(
    `  House: ${houseCandidates.length} active candidates, Senate: ${senateCandidates.length}`,
  );

  console.log("Fetching congress-legislators crosswalk...");
  const { fecToBioguide, bioguideToName, bioguideToVotesmart } =
    await fetchFecToBioguideMap();

  console.log(`Fetching Voteview scores for the ${CONGRESS}th Congress...`);
  const voteviewByBioguide = await fetchVoteviewScores();

  // One Senate office + race for the state.
  const [senateOffice] = await db
    .insert(offices)
    .values({ level: "federal", title: "U.S. Senate", state: STATE })
    .returning();
  const [senateRace] = await db
    .insert(races)
    .values({ officeId: senateOffice.id, cycle: CYCLE, electionType: "general" })
    .returning();

  // One House office + race per district that actually has a candidate.
  const districts = [
    ...new Set(
      houseCandidates
        .map((c) => c.district)
        .filter((d): d is string => Boolean(d)),
    ),
  ].sort();
  const houseRaceByDistrict = new Map<string, string>();
  for (const district of districts) {
    const [office] = await db
      .insert(offices)
      .values({ level: "federal", title: "U.S. House", state: STATE, district })
      .returning();
    const [race] = await db
      .insert(races)
      .values({ officeId: office.id, cycle: CYCLE, electionType: "general" })
      .returning();
    houseRaceByDistrict.set(district, race.id);
  }
  console.log(`Created Senate race + ${districts.length} House district races.`);

  let scored = 0;
  let unscored = 0;

  async function ingestCandidate(c: FecCandidate, raceId: string) {
    const bioguideId = fecToBioguide.get(c.candidate_id);
    const fullName = bioguideId
      ? bioguideToName.get(bioguideId) ?? formatFecName(c.name)
      : formatFecName(c.name);

    const [candidate] = await db
      .insert(candidates)
      .values({
        fullName,
        party: c.party,
        incumbent: c.incumbent_challenge_full === "Incumbent",
        bioguideId: bioguideId ?? null,
        fecId: c.candidate_id,
        votesmartId: bioguideId
          ? bioguideToVotesmart.get(bioguideId) ?? null
          : null,
      })
      .returning();

    await db.insert(candidacies).values({
      candidateId: candidate.id,
      raceId,
      status: "running",
    });

    const score = bioguideId ? voteviewByBioguide.get(bioguideId) : undefined;
    if (score) {
      await db.insert(ideologyScores).values({
        candidateId: candidate.id,
        system: "dw_nominate",
        value: String(score.value),
        scaleMin: "-1",
        scaleMax: "1",
        vintage: `${CONGRESS}th Congress`,
        sourceName: "Voteview",
        sourceUrl: "https://voteview.com",
        retrievedAt: new Date(),
      });
      scored++;
    } else {
      unscored++;
    }
  }

  for (const c of senateCandidates) {
    await ingestCandidate(c, senateRace.id);
  }
  for (const c of houseCandidates) {
    const raceId = houseRaceByDistrict.get(c.district!);
    if (!raceId) continue;
    await ingestCandidate(c, raceId);
  }

  console.log(
    `Done. ${scored} candidates got a cited DW-NOMINATE score, ${unscored} did not (no legislative record, or no Voteview match yet).`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => process.exit());
