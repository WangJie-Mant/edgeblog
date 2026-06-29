import { Tutorial } from "../components/TutorialEngine/types";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const PUBLIC_API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (process.env.NODE_ENV === "production" ? "https://n4gasaki.icu" : "http://localhost:8888");

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;

  // Try service binding first (server-side, inside the Cloudflare Worker).
  // This calls the blog API worker directly, avoiding any routing issues.
  try {
    const { env } = await getCloudflareContext();
    if (env.BACKEND && typeof env.BACKEND.fetch === "function") {
      res = await env.BACKEND.fetch(
        new URL(path, "https://blog"),
        init,
      );
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Request failed: ${res.status} ${res.statusText} - ${text}`);
      }
      return (await res.json()) as T;
    }
  } catch (e: any) {
    // If the error was thrown AFTER a successful service-binding fetch,
    // re-throw it so we don't silently fall back.
    if (e?.message?.startsWith?.("Request failed:")) throw e;
    // Otherwise getCloudflareContext failed (build-time / client-side),
    // fall through to public fetch.
  }

  const fullUrl = `${PUBLIC_API_BASE}${path}`;
  res = await fetch(fullUrl, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Request failed: ${res.status} ${res.statusText} - ${text}`);
  }
  return (await res.json()) as T;
}

export type PostSummary = {
  id: string;
  title: string;
  digest: string;
  date: string;
  author?: string | null;
  image?: string | null;
  tags: string[];
  markdown?: string;
};

export type PostDetail = {
  id: string;
  title: string;
  digest: string;
  date: string;
  author?: string | null;
  image?: string | null;
  tags: string[];
  markdown: string;
};

export type CreeperStatus = {
  process_name: string | null;
  timestamp: number | null;
  recent: Array<{ process_name: string; timestamp: number }>;
};

export async function getPostList(
  page = 1,
  pageSize = 8,
): Promise<{
  items: PostSummary[];
  total: number;
  page: number;
  page_size: number;
}> {
  const q = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });
  return fetchJson(`/api/posts?${q.toString()}`);
}

export async function getPostDetail(id: string): Promise<PostDetail> {
  return fetchJson(`/api/posts/${encodeURIComponent(id)}`);
}

export async function getCreeperStatus(): Promise<CreeperStatus> {
  return fetchJson(`/api/creeper`);
}

export async function getTutorialDetail(key: string): Promise<Tutorial> {
  return fetchJson(`/api/tutorial/${encodeURIComponent(key)}`);
}
