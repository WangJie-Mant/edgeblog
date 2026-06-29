import BlogList from "@/app/components/BlogList/BlogList";

export const dynamic = "force-dynamic";

export default async function BlogPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[]>;
}) {
  const pageParam = (await searchParams)?.page;
  const tagParam = (await searchParams)?.tag;
  const pageNumber = Array.isArray(pageParam)
    ? parseInt(pageParam[0] ?? "1", 10)
    : parseInt(pageParam ?? "1", 10);
  const page = Number.isFinite(pageNumber) && pageNumber > 0 ? pageNumber : 1;
  const tag = Array.isArray(tagParam)
    ? (tagParam[0] ?? null)
    : (tagParam ?? null);

  return (
    <main className="py-6">
      <BlogList page={page} basePath="/blog" selectedTag={tag} />
    </main>
  );
}
