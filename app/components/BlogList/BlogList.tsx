import Link from "next/link";
import Card from "@/app/components/Card/Card";
import { getPostList, type PostSummary } from "@/app/lib/api";
import UserGroupTag from "../Tag/UserGroupTag";
import BlogListFilter from "./BlogListFilter";

type BlogTagKey = "nichichou" | "popsc" | "tools" | "anime";

type BlogTagMeta = {
  key: BlogTagKey;
  label: string;
  color:
    | "primary"
    | "success"
    | "warning"
    | "error"
    | "neutral"
    | "info"
    | "accent";
};

const BLOG_TAGS: BlogTagMeta[] = [
  { key: "nichichou", label: "日常 | Nichichou", color: "primary" },
  { key: "popsc", label: "科普 | PopSc", color: "info" },
  { key: "tools", label: "工具 | Tools", color: "success" },
  { key: "anime", label: "动画 | Anime", color: "warning" },
];

const TAG_ALIAS: Record<string, BlogTagKey> = {
  nichichou: "nichichou",
  日常: "nichichou",
  "日常|nichichou": "nichichou",
  popsc: "popsc",
  科普: "popsc",
  "科普|popsc": "popsc",
  tools: "tools",
  工具: "tools",
  "工具|tools": "tools",
  anime: "anime",
  动画: "anime",
  "动画|anime": "anime",
};

const BLOG_TAG_MAP = new Map(BLOG_TAGS.map((tag) => [tag.key, tag]));

function normalizeTagKey(input?: string | null): BlogTagKey | null {
  if (!input) return null;
  const normalized = input.replace(/\s+/g, "").toLowerCase();
  return TAG_ALIAS[normalized] ?? null;
}

function resolvePostTag(tags: string[] | null | undefined): BlogTagKey | null {
  if (!tags || tags.length === 0) return null;
  for (const tag of tags) {
    const key = normalizeTagKey(tag);
    if (key) return key;
  }
  return null;
}

type Props = {
  page?: number;
  basePath?: string;
  selectedTag?: string | null;
};

export default async function BlogList({
  page = 1,
  basePath = "/blog",
  selectedTag = null,
}: Props) {
  const pageSize = 8;

  let items: PostSummary[] = [];
  let currentPage = page;
  let total = 0;
  let page_size = pageSize;

  try {
    const result = await getPostList(page, pageSize);
    items = result.items;
    currentPage = result.page;
    total = result.total;
    page_size = result.page_size;
  } catch (error) {
    console.error(
      "[BlogList] Error fetching posts:",
      error instanceof Error ? error.message : String(error),
    );
    // Return empty state instead of crashing
    items = [];
    total = 0;
    currentPage = page;
    page_size = pageSize;
  }

  const totalPages = Math.max(1, Math.ceil(total / page_size));
  const selectedKey = normalizeTagKey(selectedTag);
  const tagCounts = BLOG_TAGS.reduce(
    (acc, tag) => {
      acc[tag.key] = 0;
      return acc;
    },
    {} as Record<BlogTagKey, number>,
  );

  for (const blog of items) {
    const key = resolvePostTag(blog.tags);
    if (key) tagCounts[key] += 1;
  }

  const filteredItems = selectedKey
    ? items.filter((blog) => resolvePostTag(blog.tags) === selectedKey)
    : items;

  const timelineItems = [...filteredItems]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);
  const showTimelineEllipsis = filteredItems.length > 3;
  const tagQuery = selectedKey ? `&tag=${selectedKey}` : "";

  return (
    <div className="flex flex-col gap-4">
      <div className="lg:flex lg:items-start lg:gap-6">
        <aside className="flex flex-col gap-4 lg:w-[240px] lg:shrink-0">
          <Card
            title=""
            date=""
            className="!w-[220px] !max-w-[220px] !mx-0 my-2"
            content={
              <BlogListFilter
                basePath={basePath}
                selectedTag={selectedKey ?? "all"}
                options={BLOG_TAGS.map((tag) => ({
                  key: tag.key,
                  label: tag.label,
                  count: tagCounts[tag.key],
                }))}
              />
            }
          />

          <Card
            title=""
            date=""
            className="!w-[220px] !max-w-[220px] !mx-0 my-2 ml-2"
            content={
              <div>
                <div className="text-xs uppercase tracking-widest text-base-content/50 mb-3">
                  时间线
                </div>
                <ul className="timeline timeline-vertical">
                  {timelineItems.map((post, idx, list) => {
                    const isLatest = idx === 0;
                    const isFirst = idx === 0;
                    const isLast =
                      idx === list.length - 1 && !showTimelineEllipsis;
                    return (
                      <li key={`timeline-${post.id}`}>
                        {isFirst ? null : <hr className="bg-base-300 my-0" />}
                        <div
                          className={`timeline-start text-xs ${
                            isLatest
                              ? "text-primary/90"
                              : "text-base-content/60"
                          }`}
                        >
                          {post.date}
                        </div>
                        <div className="timeline-middle">
                          <span
                            className={`block rounded-full ${
                              isLatest
                                ? "h-3 w-3 bg-primary shadow-[0_0_0_4px_rgba(59,130,246,0.18)]"
                                : "h-2 w-2 bg-base-300"
                            }`}
                          />
                        </div>
                        <div
                          className={`timeline-end text-sm mt-1 ${
                            isLatest
                              ? "text-base-content font-semibold"
                              : "text-base-content"
                          }`}
                        >
                          {post.title}
                        </div>
                        {isLast ? null : <hr className="bg-base-300 my-0" />}
                      </li>
                    );
                  })}
                  {showTimelineEllipsis ? (
                    <li>
                      <hr className="bg-base-300 my-0" />
                      <div className="timeline-start text-xs text-base-content/50">
                        ...
                      </div>
                      <div className="timeline-middle">
                        <span className="block h-2 w-2 rounded-full bg-base-300" />
                      </div>
                      <div className="timeline-end" />
                    </li>
                  ) : null}
                </ul>
              </div>
            }
          />
        </aside>

        <div className="space-y-4 flex-1">
          {filteredItems.map((blog) => {
            const tagKey = resolvePostTag(blog.tags);
            const tagMeta = tagKey ? BLOG_TAG_MAP.get(tagKey) : null;
            const authorLabel = blog.author?.trim();
            const authorTag = authorLabel ? (
              <UserGroupTag
                label={
                  <span className="inline-flex items-center gap-1">
                    <img
                      src="/icons/author.svg"
                      alt="Author"
                      className="h-3 w-3"
                    />
                    <span>{authorLabel}</span>
                  </span>
                }
                className="border-black text-black"
                color="neutral"
              />
            ) : null;
            return (
              <Card
                key={blog.id}
                title={blog.title}
                degistion={blog.digest}
                date={blog.date}
                link={`${basePath}/${blog.id}`}
                imageSrc={blog.image ?? undefined}
                topRight={
                  authorTag || tagMeta ? (
                    <div className="flex items-center gap-2">
                      {authorTag}
                      {tagMeta ? (
                        <UserGroupTag
                          label={tagMeta.label}
                          color={tagMeta.color}
                        />
                      ) : null}
                    </div>
                  ) : undefined
                }
              />
            );
          })}
        </div>
      </div>
      <div className="sticky bottom-0 mt-auto border-t border-base-200 bg-base-100/90 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-3 max-w-5xl mx-auto">
          <Link
            aria-label="Previous page"
            className={`btn btn-sm ${currentPage <= 1 ? "btn-disabled" : "btn-outline"}`}
            href={`${basePath}?page=${Math.max(currentPage - 1, 1)}${tagQuery}`}
          >
            ‹ Prev
          </Link>

          <span className="text-sm text-base-content/70">
            Page {currentPage} / {totalPages}
          </span>

          <Link
            aria-label="Next page"
            className={`btn btn-sm ${currentPage >= totalPages ? "btn-disabled" : "btn-outline"}`}
            href={`${basePath}?page=${Math.min(currentPage + 1, totalPages)}${tagQuery}`}
          >
            Next ›
          </Link>
        </div>
      </div>
    </div>
  );
}
