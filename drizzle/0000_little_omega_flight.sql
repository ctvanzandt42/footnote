CREATE TYPE "public"."candidacy_status" AS ENUM('running', 'withdrawn', 'won', 'lost');--> statement-breakpoint
CREATE TYPE "public"."election_type" AS ENUM('primary', 'general');--> statement-breakpoint
CREATE TYPE "public"."ideology_system" AS ENUM('dw_nominate', 'shor_mccarty');--> statement-breakpoint
CREATE TYPE "public"."office_level" AS ENUM('federal', 'state');--> statement-breakpoint
CREATE TABLE "candidacies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"candidate_id" uuid NOT NULL,
	"race_id" uuid NOT NULL,
	"status" "candidacy_status" DEFAULT 'running' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "candidates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text NOT NULL,
	"party" text NOT NULL,
	"incumbent" boolean DEFAULT false NOT NULL,
	"bioguide_id" text,
	"fec_id" text,
	"openstates_id" text,
	"votesmart_id" text
);
--> statement-breakpoint
CREATE TABLE "empirical_claims" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"position_id" uuid NOT NULL,
	"claim_text" text NOT NULL,
	"context_source_name" text,
	"context_source_url" text
);
--> statement-breakpoint
CREATE TABLE "finance_summaries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"candidate_id" uuid NOT NULL,
	"cycle" integer NOT NULL,
	"total_raised" numeric(14, 2),
	"total_spent" numeric(14, 2),
	"source_url" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ideology_scores" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"candidate_id" uuid NOT NULL,
	"system" "ideology_system" NOT NULL,
	"value" numeric(6, 3) NOT NULL,
	"scale_min" numeric(6, 3) NOT NULL,
	"scale_max" numeric(6, 3) NOT NULL,
	"vintage" text NOT NULL,
	"source_name" text NOT NULL,
	"source_url" text NOT NULL,
	"retrieved_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "offices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"level" "office_level" NOT NULL,
	"title" text NOT NULL,
	"state" text NOT NULL,
	"district" text,
	"chamber" text
);
--> statement-breakpoint
CREATE TABLE "positions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"candidate_id" uuid NOT NULL,
	"topic" text NOT NULL,
	"stance" text,
	"quote" text NOT NULL,
	"self_reported" boolean DEFAULT true NOT NULL,
	"source_name" text NOT NULL,
	"source_url" text NOT NULL,
	"retrieved_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "races" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"office_id" uuid NOT NULL,
	"cycle" integer NOT NULL,
	"election_type" "election_type" NOT NULL,
	"election_date" date
);
--> statement-breakpoint
ALTER TABLE "candidacies" ADD CONSTRAINT "candidacies_candidate_id_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidacies" ADD CONSTRAINT "candidacies_race_id_races_id_fk" FOREIGN KEY ("race_id") REFERENCES "public"."races"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "empirical_claims" ADD CONSTRAINT "empirical_claims_position_id_positions_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."positions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "finance_summaries" ADD CONSTRAINT "finance_summaries_candidate_id_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ideology_scores" ADD CONSTRAINT "ideology_scores_candidate_id_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "positions" ADD CONSTRAINT "positions_candidate_id_candidates_id_fk" FOREIGN KEY ("candidate_id") REFERENCES "public"."candidates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "races" ADD CONSTRAINT "races_office_id_offices_id_fk" FOREIGN KEY ("office_id") REFERENCES "public"."offices"("id") ON DELETE no action ON UPDATE no action;