-- Pollr voting schema v1
-- Applied remotely via Supabase MCP as pollr_voting_schema_v1

DROP TABLE IF EXISTS public.votes_star CASCADE;
DROP TABLE IF EXISTS public.votes_pairwise CASCADE;
DROP TABLE IF EXISTS public.votes_tier CASCADE;
DROP TABLE IF EXISTS public.votes_rank CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.committees CASCADE;

CREATE TABLE public.committees (
  id text PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  short_name text NOT NULL,
  category text NOT NULL CHECK (category = ANY (ARRAY[
    'Student Chapters'::text,
    'Tech Committees'::text,
    'Clubs'::text,
    'SAE Teams'::text,
    'IETE Teams'::text
  ])),
  tagline text NOT NULL DEFAULT '',
  established integer,
  instagram_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.voter_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  ip_hash text,
  user_agent_hash text
);

CREATE TABLE public.pairwise_votes (
  id bigserial PRIMARY KEY,
  session_id uuid NOT NULL REFERENCES public.voter_sessions(id) ON DELETE CASCADE,
  winner_id text NOT NULL REFERENCES public.committees(id),
  loser_id text NOT NULL REFERENCES public.committees(id),
  pair_low text NOT NULL,
  pair_high text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pairwise_distinct CHECK (winner_id <> loser_id),
  CONSTRAINT pairwise_unique_pair UNIQUE (session_id, pair_low, pair_high)
);

CREATE INDEX pairwise_votes_winner_idx ON public.pairwise_votes (winner_id);
CREATE INDEX pairwise_votes_loser_idx ON public.pairwise_votes (loser_id);
CREATE INDEX pairwise_votes_created_idx ON public.pairwise_votes (created_at);

CREATE TABLE public.tier_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.voter_sessions(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT tier_one_per_session UNIQUE (session_id)
);

CREATE TABLE public.tier_placements (
  id bigserial PRIMARY KEY,
  submission_id uuid NOT NULL REFERENCES public.tier_submissions(id) ON DELETE CASCADE,
  committee_id text NOT NULL REFERENCES public.committees(id),
  tier text NOT NULL CHECK (tier = ANY (ARRAY['S'::text,'A'::text,'B'::text,'C'::text,'F'::text])),
  CONSTRAINT tier_placement_unique UNIQUE (submission_id, committee_id)
);

CREATE INDEX tier_placements_committee_idx ON public.tier_placements (committee_id);

CREATE TABLE public.rank_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.voter_sessions(id) ON DELETE CASCADE,
  scope text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT rank_one_per_session_scope UNIQUE (session_id, scope)
);

CREATE TABLE public.rank_positions (
  id bigserial PRIMARY KEY,
  submission_id uuid NOT NULL REFERENCES public.rank_submissions(id) ON DELETE CASCADE,
  committee_id text NOT NULL REFERENCES public.committees(id),
  position integer NOT NULL CHECK (position >= 1),
  CONSTRAINT rank_position_unique UNIQUE (submission_id, committee_id),
  CONSTRAINT rank_position_order UNIQUE (submission_id, position)
);

CREATE INDEX rank_positions_committee_idx ON public.rank_positions (committee_id);
CREATE INDEX rank_submissions_scope_idx ON public.rank_submissions (scope);

CREATE TABLE public.score_snapshots (
  id bigserial PRIMARY KEY,
  captured_at timestamptz NOT NULL DEFAULT now(),
  scope text NOT NULL DEFAULT 'all',
  committee_id text NOT NULL REFERENCES public.committees(id),
  pollr_score double precision NOT NULL,
  swipe_score double precision,
  tier_score double precision,
  rank_score double precision,
  sample_size integer NOT NULL DEFAULT 0
);

CREATE INDEX score_snapshots_lookup_idx ON public.score_snapshots (scope, committee_id, captured_at DESC);

ALTER TABLE public.committees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voter_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pairwise_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tier_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tier_placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rank_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rank_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.score_snapshots ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon')
     AND EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE POLICY committees_public_read ON public.committees
      FOR SELECT TO anon, authenticated USING (true);
  END IF;
END $$;
