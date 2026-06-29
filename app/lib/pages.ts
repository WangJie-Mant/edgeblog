import fs from "fs/promises";
import path from "path";

export type PageMeta = {
  title: string;
  degistion?: string;
  image?: string;
  slug: string;
};

const PAGE_DIR = path.join(process.cwd(), "content", "pages");

function parseFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
  const frontmatterMatch = raw.match(/^---\n([\s\S]*?)\n---\n?/);
  const fmBlock = frontmatterMatch?.[1] ?? "";
  const body = frontmatterMatch ? raw.slice(frontmatterMatch[0].length) : raw;
  const meta: Record<string, string> = {};

  fmBlock
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      const [key, ...rest] = line.split(":");
      if (!key) return;
      meta[key.trim()] = rest.join(":").trim().replace(/^"|"$/g, "");
    });

  return { meta, body };
}

export async function getPageBySlug(slug: string): Promise<{ meta: PageMeta; body: string } | null> {
  const normalized = decodeURIComponent(slug).replace(/\/+$/, "");
  const candidates = [normalized, normalized.toLowerCase()];

  for (const candidate of candidates) {
    const filePath = path.join(PAGE_DIR, `${candidate}.md`);
    try {
      const raw = await fs.readFile(filePath, "utf-8");
      const { meta, body } = parseFrontmatter(raw);
      const result: PageMeta = {
        title: meta.title ?? candidate,
        degistion: meta.degistion,
        image: meta.image,
        slug: candidate,
      };
      return { meta: result, body };
    } catch {
      // try next candidate
    }
  }
  return null;
}
