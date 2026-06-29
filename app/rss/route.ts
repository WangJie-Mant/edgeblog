import { getCloudflareContext } from "@opennextjs/cloudflare";

export const dynamic = "force-dynamic";

function buildErrorXml(message: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<error>${message}</error>`;
}

export async function GET(): Promise<Response> {
  try {
    // 优先使用 service binding 直接调用 blog Worker，绕过公网路由
    const { env } = await getCloudflareContext();
    if (env.BACKEND && typeof env.BACKEND.fetch === "function") {
      const upstream = await env.BACKEND.fetch(
        new URL("/rss.xml", "https://blog"),
        { method: "GET" }
      );

      if (!upstream.ok) {
        console.error(
          `[rss] BACKEND service binding returned ${upstream.status} ${upstream.statusText}`
        );
        return new Response(
          buildErrorXml(
            `RSS backend returned ${upstream.status} ${upstream.statusText}.`
          ),
          {
            status: 502,
            headers: {
              "Content-Type": "application/xml; charset=utf-8",
            },
          }
        );
      }

      const xml = await upstream.text();
      return new Response(xml, {
        status: 200,
        headers: {
          "Content-Type": "application/rss+xml; charset=utf-8",
        },
      });
    }

    // Fallback: 公网 fetch（仅当 service binding 不可用时）
    const baseUrl =
      process.env.API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      (process.env.NODE_ENV === "production" ? "https://n4gasaki.icu" : "http://localhost:8888");

    if (!baseUrl) {
      return new Response(buildErrorXml("RSS base URL is not configured."), {
        status: 500,
        headers: {
          "Content-Type": "application/xml; charset=utf-8",
        },
      });
    }

    console.warn("[rss] Falling back to public fetch — service binding unavailable");

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15_000);

    try {
      const upstream = await fetch(`${baseUrl}/rss.xml`, {
        cache: "no-store",
        signal: controller.signal,
      });

      if (!upstream.ok) {
        return new Response(
          buildErrorXml(
            `RSS upstream returned ${upstream.status} ${upstream.statusText}.`
          ),
          {
            status: 502,
            headers: {
              "Content-Type": "application/xml; charset=utf-8",
            },
          }
        );
      }

      const xml = await upstream.text();
      return new Response(xml, {
        status: 200,
        headers: {
          "Content-Type": "application/rss+xml; charset=utf-8",
        },
      });
    } finally {
      clearTimeout(timeoutId);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[rss] Failed to fetch RSS:", message);

    return new Response(buildErrorXml(`RSS unavailable: ${message}`), {
      status: 500,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
      },
    });
  }
}
