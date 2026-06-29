import BackToPreviousPage from "@/app/components/BackToPre/BackToPreviousPage";
import ChatBoard from "@/app/components/Comments/ChatBoard";
import { getPostDetail } from "@/app/lib/api";
import Card from "@/app/components/Card/Card";
import BlogOutline from "@/app/components/BlogOutline/BlogOutline";
import UserGroupTag from "@/app/components/Tag/UserGroupTag";

type HeadingItem = {
  id: string;
  text: string;
  level: number;
};

function slugifyHeading(text: string, index: number, cache: Map<string, number>) {
  const base = text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\u4e00-\u9fa5\-]/g, "");
  const key = base || `section-${index}`;
  const count = cache.get(key) ?? 0;
  cache.set(key, count + 1);
  return count > 0 ? `${key}-${count}` : key;
}

function extractHeadings(markdown: string): HeadingItem[] {
  const lines = markdown.split("\n");
  const headings: HeadingItem[] = [];
  const cache = new Map<string, number>();
  lines.forEach((line, index) => {
    const match = /^(#{1,6})\s+(.*)$/.exec(line.trim());
    if (!match) return;
    const level = match[1]?.length ?? 1;
    const text = match[2]?.trim();
    if (!text) return;
    const id = slugifyHeading(text, index, cache);
    headings.push({ id, text, level });
  });
  return headings;
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const slug = (await params).id;
  try {
    const post = await getPostDetail(slug);
    const headings = extractHeadings(post.markdown);
    let headingCursor = 0;
    const nextHeadingId = () => headings[headingCursor++]?.id;

    return (
      <main className="py-8">
        <div>
          <BackToPreviousPage />
        </div>
        <BlogOutline headings={headings} />
        <div className="flex justify-center">
          <Card
            title={post.title}
            degistion={post.digest}
            date={post.date}
            imageSrc={post.image ?? undefined}
            markdown={post.markdown}
            topRight={
              post.author ? (
                <UserGroupTag
                  label={
                    <span className="inline-flex items-center gap-1">
                      <img
                        src="/icons/author.svg"
                        alt="Author"
                        className="h-3 w-3"
                      />
                      <span>{post.author}</span>
                    </span>
                  }
                  className="border-black text-black"
                  color="neutral"
                />
              ) : undefined
            }
            markdownComponents={{
              h1: ({ children, ...props }) => (
                <h1 id={nextHeadingId()} {...props}>
                  {children}
                </h1>
              ),
              h2: ({ children, ...props }) => (
                <h2 id={nextHeadingId()} {...props}>
                  {children}
                </h2>
              ),
              h3: ({ children, ...props }) => (
                <h3 id={nextHeadingId()} {...props}>
                  {children}
                </h3>
              ),
              h4: ({ children, ...props }) => (
                <h4 id={nextHeadingId()} {...props}>
                  {children}
                </h4>
              ),
              h5: ({ children, ...props }) => (
                <h5 id={nextHeadingId()} {...props}>
                  {children}
                </h5>
              ),
              h6: ({ children, ...props }) => (
                <h6 id={nextHeadingId()} {...props}>
                  {children}
                </h6>
              ),
            }}
          />
        </div>
        {/* 评论区 */}
        <div className="mt-6">
          <ChatBoard threadId={`blog:${slug}`} title="评论" />
        </div>
      </main>
    );
  } catch (e) {
    return (
      <main className="py-8">
        <div className="alert alert-error w-[90vw] sm:w-[85vw] lg:w-[70vw] max-w-4xl mx-auto">
          <span>未找到博客：{slug}</span>
        </div>
      </main>
    );
  }
}
