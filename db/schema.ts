import {
  boolean,
  date,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

// Fixed, disclosed enumerations per PLAN.md. Party is intentionally NOT an
// enum here: it's whatever a candidate's official filing says (FEC party
// codes, write-in, no party, etc.), not a category we get to narrow.
export const officeLevelEnum = pgEnum("office_level", ["federal", "state"]);
export const electionTypeEnum = pgEnum("election_type", ["primary", "general"]);
export const candidacyStatusEnum = pgEnum("candidacy_status", [
  "running",
  "withdrawn",
  "won",
  "lost",
]);
export const ideologySystemEnum = pgEnum("ideology_system", [
  "dw_nominate",
  "shor_mccarty",
]);

export const offices = pgTable("offices", {
  id: uuid("id").primaryKey().defaultRandom(),
  level: officeLevelEnum("level").notNull(),
  title: text("title").notNull(), // e.g. "U.S. Senate", "Governor"
  state: text("state").notNull(), // two-letter postal code
  district: text("district"), // null for statewide / at-large seats
  chamber: text("chamber"), // e.g. "House", "Senate" for state legislatures
});

export const races = pgTable("races", {
  id: uuid("id").primaryKey().defaultRandom(),
  officeId: uuid("office_id")
    .notNull()
    .references(() => offices.id),
  cycle: integer("cycle").notNull(), // e.g. 2026
  electionType: electionTypeEnum("election_type").notNull(),
  electionDate: date("election_date"),
});

export const candidates = pgTable("candidates", {
  id: uuid("id").primaryKey().defaultRandom(),
  fullName: text("full_name").notNull(),
  party: text("party").notNull(),
  incumbent: boolean("incumbent").notNull().default(false),
  bioguideId: text("bioguide_id"),
  fecId: text("fec_id"),
  openstatesId: text("openstates_id"),
  votesmartId: text("votesmart_id"),
});

export const candidacies = pgTable("candidacies", {
  id: uuid("id").primaryKey().defaultRandom(),
  candidateId: uuid("candidate_id")
    .notNull()
    .references(() => candidates.id),
  raceId: uuid("race_id")
    .notNull()
    .references(() => races.id),
  status: candidacyStatusEnum("status").notNull().default("running"),
});

// Tier 2. Citation columns are NOT NULL on purpose: per PLAN.md, "if a row
// can't cite itself, it doesn't render" is enforced at the schema level, not
// just the UI.
export const ideologyScores = pgTable("ideology_scores", {
  id: uuid("id").primaryKey().defaultRandom(),
  candidateId: uuid("candidate_id")
    .notNull()
    .references(() => candidates.id),
  system: ideologySystemEnum("system").notNull(),
  value: numeric("value", { precision: 6, scale: 3 }).notNull(),
  scaleMin: numeric("scale_min", { precision: 6, scale: 3 }).notNull(),
  scaleMax: numeric("scale_max", { precision: 6, scale: 3 }).notNull(),
  vintage: text("vintage").notNull(), // e.g. "119th Congress"
  sourceName: text("source_name").notNull(),
  sourceUrl: text("source_url").notNull(),
  retrievedAt: timestamp("retrieved_at", { withTimezone: true }).notNull(),
});

// Tier 3. Same citation discipline as ideology_scores.
export const positions = pgTable("positions", {
  id: uuid("id").primaryKey().defaultRandom(),
  candidateId: uuid("candidate_id")
    .notNull()
    .references(() => candidates.id),
  topic: text("topic").notNull(),
  stance: text("stance"),
  quote: text("quote").notNull(), // verbatim, never paraphrased
  selfReported: boolean("self_reported").notNull().default(true),
  sourceName: text("source_name").notNull(),
  sourceUrl: text("source_url").notNull(),
  retrievedAt: timestamp("retrieved_at", { withTimezone: true }).notNull(),
});

// Phase 2+ evidence-pointer hook described in PLAN.md. The table exists now
// so we never have to repaint the schema later; ingestion leaves it empty
// in v1.
export const empiricalClaims = pgTable("empirical_claims", {
  id: uuid("id").primaryKey().defaultRandom(),
  positionId: uuid("position_id")
    .notNull()
    .references(() => positions.id),
  claimText: text("claim_text").notNull(), // verbatim sub-claim
  contextSourceName: text("context_source_name"),
  contextSourceUrl: text("context_source_url"),
});

export const financeSummaries = pgTable("finance_summaries", {
  id: uuid("id").primaryKey().defaultRandom(),
  candidateId: uuid("candidate_id")
    .notNull()
    .references(() => candidates.id),
  cycle: integer("cycle").notNull(),
  totalRaised: numeric("total_raised", { precision: 14, scale: 2 }),
  totalSpent: numeric("total_spent", { precision: 14, scale: 2 }),
  sourceUrl: text("source_url").notNull(),
});
