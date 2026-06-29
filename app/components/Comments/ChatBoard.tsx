"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactElement } from "react";
import Link from "next/link";
import { useAuth } from "../auth/AuthProvider";

type Author = {
  id: number | string;
  nickname: string;
  avatar_data?: string | null;
};

type CommentItem = {
  id: number | string;
  content: string;
  created_at: string;
  author: Author;
  parent_id?: number | string | null;
};

type Props = {
  threadId: string;
  title?: string;
  apiBase?: string;
};

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

function makeRequestId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export default function ChatBoard({
  threadId,
  title = "留言板",
  apiBase = "",
}: Props) {
  const { user, token } = useAuth();
  const [items, setItems] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [replyTo, setReplyTo] = useState<CommentItem | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [hasMore, setHasMore] = useState(true);

  const sorted = useMemo(
    () =>
      [...items].sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      ),
    [items],
  );

  const loadPage = async (pageToLoad: number) => {
    const resp = await fetch(
      `${apiBase}/api/comments?threadId=${encodeURIComponent(threadId)}&page=${pageToLoad}&pageSize=${pageSize}`,
      { cache: "no-store" },
    );
    if (!resp.ok) throw new Error(`加载失败: ${resp.status}`);
    return (await resp.json()) as CommentItem[];
  };

  const loadInitial = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await loadPage(1);
      setItems((prev) => mergeById(prev, data, "replace"));
      setPage(1);
      setHasMore(data.length === pageSize);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitial();
  }, [apiBase, threadId, pageSize]);

  const loadMore = async () => {
    try {
      const nextPage = page + 1;
      const data = await loadPage(nextPage);
      setItems((prev) => mergeById(prev, data));
      setPage(nextPage);
      setHasMore(data.length === pageSize);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    }
  };

  const refreshLatest = async () => {
    try {
      const data = await loadPage(1);
      setItems((prev) => mergeById(prev, data, "replace"));
      setPage(1);
      setHasMore(data.length === pageSize);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    }
  };

  const submit = async () => {
    if (submittingRef.current) return;
    if (!user || !token) {
      setError("请先登录后再留言");
      return;
    }
    if (!content.trim()) return;
    try {
      submittingRef.current = true;
      setSubmitting(true);
      setError(null);
      const parentIdNum = replyTo ? Number(replyTo.id) : undefined;
      const payload: Record<string, unknown> = {
        threadId,
        content,
        requestId: makeRequestId(),
      };
      if (parentIdNum && !Number.isNaN(parentIdNum))
        payload.parentId = parentIdNum;
      const resp = await fetch(`${apiBase}/api/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) throw new Error(`提交失败: ${resp.status}`);
      const created = (await resp.json()) as CommentItem;
      setItems((prev) => mergeById(prev, [created]));
      await refreshLatest();
      setContent("");
      setReplyTo(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "提交失败");
    } finally {
      setSubmitting(false);
      submittingRef.current = false;
    }
  };

  const byId = useMemo(() => {
    const m = new Map<string, CommentItem>();
    for (const it of items) m.set(String(it.id), it);
    return m;
  }, [items]);

  function buildTree(list: CommentItem[]): CommentItem[] {
    const map = new Map<string, CommentItem & { replies: CommentItem[] }>();
    const roots: (CommentItem & { replies: CommentItem[] })[] = [];
    for (const it of list) {
      map.set(String(it.id), { ...it, replies: [] });
    }
    for (const it of map.values()) {
      if (it.parent_id != null) {
        const p = map.get(String(it.parent_id));
        if (p) p.replies.push(it);
        else roots.push(it);
      } else {
        roots.push(it);
      }
    }
    const sortFn = (a: CommentItem, b: CommentItem) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    const sortTree = (nodes: (CommentItem & { replies: CommentItem[] })[]) => {
      nodes.sort(sortFn);
      nodes.forEach((n) => sortTree(n.replies as any));
    };
    sortTree(roots);
    return roots as unknown as CommentItem[];
  }

  const tree = useMemo(() => buildTree(items), [items]);

  function mergeById(
    prev: CommentItem[],
    next: CommentItem[],
    mode: "append" | "replace" = "append",
  ) {
    const map = new Map<string, CommentItem>();
    const seed = mode === "replace" ? [] : prev;
    for (const it of seed) map.set(String(it.id), it);
    for (const it of next) map.set(String(it.id), it);
    return Array.from(map.values());
  }

  const renderNode = (msg: any): ReactElement => {
    const profileHref = `/profile/${encodeURIComponent(
      msg.author.id.toString(),
    )}`;
    const parent =
      msg.parent_id != null
        ? items.find((i) => String(i.id) === String(msg.parent_id))
        : undefined;
    const preview = parent
      ? parent.content.length > 120
        ? parent.content.slice(0, 120) + "…"
        : parent.content
      : null;
    return (
      <div key={msg.id} className="card bg-base-100 shadow-sm">
        <div className="card-body p-4">
          <div className="flex items-center gap-3">
            <Link href={profileHref} aria-label="View profile">
              <div className="avatar">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <img
                    src={msg.author.avatar_data || "/file.svg"}
                    alt={msg.author.nickname}
                    className="object-cover"
                  />
                </div>
              </div>
            </Link>
            <div className="flex-1">
              <Link
                href={profileHref}
                className="font-semibold text-base-content hover:underline"
              >
                {msg.author.nickname}
              </Link>
              <div className="text-xs text-base-content/60">
                {formatDate(msg.created_at)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="btn btn-link btn-xs"
                onClick={() =>
                  setReplyTo(replyTo && replyTo.id === msg.id ? null : msg)
                }
              >
                {replyTo && replyTo.id === msg.id ? "取消回复" : "回复"}
              </button>
              {user?.role === "Admin" && (
                <button
                  className="btn btn-link btn-xs text-error"
                  onClick={async () => {
                    if (!token) return;
                    const ok = confirm("确认删除此评论及其回复？");
                    if (!ok) return;
                    try {
                      const resp = await fetch(
                        `${apiBase}/api/comments/${msg.id}`,
                        {
                          method: "DELETE",
                          headers: { Authorization: `Bearer ${token}` },
                        },
                      );
                      if (!resp.ok) {
                        throw new Error(`删除失败: ${resp.status}`);
                      }
                      await loadInitial();
                    } catch (e) {
                      setError(e instanceof Error ? e.message : "删除失败");
                    }
                  }}
                >
                  删除
                </button>
              )}
            </div>
          </div>

          {/* {parent && (
            <div className="mt-2 text-xs bg-base-200 rounded px-2 py-1 w-fit">
              ↪ 回复 @{parent.author.nickname}: {preview}
            </div>
          )} */}

          <div className="mt-2 whitespace-pre-wrap">{msg.content}</div>

          {msg.replies && msg.replies.length > 0 && (
            <div className="mt-3 space-y-3 border-l border-base-200 pl-4">
              {msg.replies.map((child: any) => renderNode(child))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <section className="w-[90vw] sm:w-[85vw] lg:w-[70vw] max-w-4xl mx-auto py-6 space-y-4 min-h-screen flex flex-col">
      <div className="card bg-base-100 shadow-sm flex-1">
        <div className="card-body">
          <h3 className="card-title">留言</h3>
          {loading ? (
            <div className="text-base-content/70">加载中...</div>
          ) : sorted.length === 0 ? (
            <div className="text-base-content/70">
              还没有留言，来抢个沙发吧！
            </div>
          ) : (
            <div className="space-y-3">
              {tree.map((node: any) => renderNode(node))}
              {hasMore && (
                <div className="flex justify-center mt-2">
                  <button className="btn btn-outline btn-sm" onClick={loadMore}>
                    加载更多
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="card bg-base-100 shadow-sm">
        <div className="card-body gap-3">
          <h3 className="card-title">发布留言</h3>
          {replyTo && (
            <div className="alert alert-info py-1 text-sm">
              正在回复 @
              <span className="font-semibold">{replyTo.author.nickname}</span>
              <button
                className="btn btn-ghost btn-xs ml-2"
                onClick={() => setReplyTo(null)}
              >
                取消
              </button>
            </div>
          )}
          <div className="form-control">
            <label className="label">
              <span className="label-text">
                {user
                  ? replyTo
                    ? `回复 @     ${replyTo.author.nickname}`
                    : "发表你的看法     "
                  : "请登录后再留言   "}
              </span>
            </label>
            <textarea
              className="textarea textarea-bordered h-24"
              placeholder={user ? "写点什么..." : "未登录，无法留言"}
              disabled={!user || submitting}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            {!user && (
              <a href="/login" className="btn btn-ghost btn-sm">
                去登录
              </a>
            )}
            <button
              className="btn btn-primary btn-sm"
              onClick={submit}
              disabled={!user || submitting}
            >
              {submitting ? "发送中..." : "发送"}
            </button>
          </div>
          {error && <div className="text-error text-sm">{error}</div>}
        </div>
      </div>
    </section>
  );
}
