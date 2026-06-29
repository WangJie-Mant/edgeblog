import ChatBoard from "@/app/components/Comments/ChatBoard";
import { getPostDetail } from "@/app/lib/api";
import Card from "@/app/components/Card/Card";

export default async function AboutPage() {
  let about: Awaited<ReturnType<typeof getPostDetail>> | null = null;
  try {
    about = await getPostDetail("about");
  } catch (e) {
    about = null;
  }

  return (
    <main className="py-8">
      {about ? (
        <Card
          title={about.title || "About"}
          degistion={about.digest}
          date={about.date}
          imageSrc={about.image ?? undefined}
          markdown={about.markdown}
        />
      ) : (
        <div className="alert alert-error w-[90vw] sm:w-[85vw] lg:w-[70vw] max-w-4xl mx-auto">
          <span>未找到 About 内容</span>
        </div>
      )}
      <div className="mt-6">
        <ChatBoard threadId="page:about" title="评论" />
      </div>
    </main>
  );
}
