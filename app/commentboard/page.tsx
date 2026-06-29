import ChatBoard from "../components/Comments/ChatBoard";

export const dynamic = "force-dynamic";

export default function CommentBoardPage() {
  return <ChatBoard threadId="board:global" title="留言板" />;
}
