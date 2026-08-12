import type {
  HeadToHeadResponse,
  InsightsResponse,
  LeaderboardResponse,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.status = status;
    this.detail = detail;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = typeof body.detail === "string" ? body.detail : JSON.stringify(body.detail ?? body);
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, detail);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function ensureSession(): Promise<string> {
  const data = await request<{ session_id: string }>("/api/v1/sessions", { method: "POST" });
  return data.session_id;
}

export async function submitSwipeVote(winnerId: string, loserId: string) {
  return request<{ ok: boolean; winner_id: string; loser_id: string }>("/api/v1/votes/swipe", {
    method: "POST",
    body: JSON.stringify({ winner_id: winnerId, loser_id: loserId }),
  });
}

export async function submitTierBallot(
  placements: Array<{ committee_id: string; tier: string }>
) {
  return request<{ ok: boolean; submission_id: string; placed: number }>("/api/v1/votes/tier", {
    method: "PUT",
    body: JSON.stringify({ placements }),
  });
}

export async function submitRankBallot(scope: string, orderedIds: string[]) {
  return request<{ ok: boolean; submission_id: string; scope: string; ranked: number }>(
    "/api/v1/votes/rank",
    {
      method: "PUT",
      body: JSON.stringify({ scope, ordered_ids: orderedIds }),
    }
  );
}

export async function fetchLeaderboard(scope = "all"): Promise<LeaderboardResponse> {
  const q = encodeURIComponent(scope);
  return request<LeaderboardResponse>(`/api/v1/analytics/leaderboard?scope=${q}`, {
    method: "GET",
    cache: "no-store",
  });
}

export async function fetchHeadToHead(a: string, b: string): Promise<HeadToHeadResponse> {
  return request<HeadToHeadResponse>(
    `/api/v1/analytics/head-to-head?a=${encodeURIComponent(a)}&b=${encodeURIComponent(b)}`,
    { method: "GET", cache: "no-store" }
  );
}

export async function fetchInsights(): Promise<InsightsResponse> {
  return request<InsightsResponse>("/api/v1/analytics/insights", {
    method: "GET",
    cache: "no-store",
  });
}
