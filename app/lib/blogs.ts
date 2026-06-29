import fs from "fs/promises";
import path from "path";

export type BlogMeta = {
  title: string;
  degistion: string;
  date: string; // Display date, as provided in metadata
  image?: string;
  slug: string;
  href: string;
};

const BLOG_DIR = path.join(process.cwd(), "content", "blogs");

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

function normalizeDate(date: string): string {
  // Accept YYYY-MM-DD or YYYYMMDD, return YYYYMMDD for sorting.
  const trimmed = date.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed.replace(/-/g, "");
  }
  return trimmed;
}

export async function getAllBlogMeta(): Promise<BlogMeta[]> {
  const files = await fs.readdir(BLOG_DIR);
  const mdFiles = files.filter((file) => file.endsWith(".md"));

  const posts = await Promise.all(
    mdFiles.map(async (file) => {
      const raw = await fs.readFile(path.join(BLOG_DIR, file), "utf-8");
      const { meta } = parseFrontmatter(raw);
      const slug = file.replace(/\.md$/, "");
      const dateRaw = meta.date ?? "1970-01-01";
      const sortKey = normalizeDate(dateRaw);

      return {
        title: meta.title ?? slug,
        degistion: meta.degistion ?? "",
        date: dateRaw,
        image: meta.image,
        slug,
        href: `/blog/${slug}`,
        sortKey,
      } as BlogMeta & { sortKey: string };
    })
  );

  return posts
    .sort((a, b) => (a.sortKey > b.sortKey ? -1 : 1))
    .map(({ sortKey, ...rest }) => rest);
}

const PAGE_SIZE = 8;

export async function getPaginatedBlogs(page = 1) {
  const all = await getAllBlogMeta();
  const totalPages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
  const current = Math.min(Math.max(page, 1), totalPages);
  const start = (current - 1) * PAGE_SIZE;

  return {
    blogs: all.slice(start, start + PAGE_SIZE),
    currentPage: current,
    totalPages,
  };
}

export async function getBlogBySlug(slug: string): Promise<{ meta: BlogMeta; body: string } | null> {
  const normalized = decodeURIComponent(slug).replace(/\/+$/, "");
  const candidates = [normalized, normalized.toLowerCase()];

  for (const candidate of candidates) {
    const filePath = path.join(BLOG_DIR, `${candidate}.md`);
    try {
      const raw = await fs.readFile(filePath, "utf-8");
      const { meta, body } = parseFrontmatter(raw);
      const date = meta.date ?? "1970-01-01";
      const result: BlogMeta = {
        title: meta.title ?? candidate,
        degistion: meta.degistion ?? "",
        date,
        image: meta.image,
        slug: candidate,
        href: `/blog/${candidate}`,
      };
      return { meta: result, body };
    } catch {
      // try next candidate
    }
  }
  return null;
}
