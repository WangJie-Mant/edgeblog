"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import UserAvatar from "../Avatar/UserAvatar";
import { useAuth } from "../auth/AuthProvider";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;

type Author = {
  id: string | number;
  nickname: string;
  avatar_data?: string | null;
};

type CommentItem = {
  id: string;
  content: string;
  created_at: string;
  author: Author;
  parent_id: string | null;
  replies?: CommentItem[];
};

type FlatComment = CommentItem;

type Props = {
  threadId: string;
  apiBase?: string;
  title?: string;
};

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d
    .getDate()
    .toString()
    .padStart(2, "0")} ${d.getHours().toString().padStart(2, "0")}:${d
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
}

function makeRequestId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function buildTree(list: FlatComment[]): CommentItem[] {
  const map = new Map<string, CommentItem>();
  const roots: CommentItem[] = [];
  list.forEach((item) => {
    map.set(item.id, { ...item, replies: [] });
  });
  map.forEach((item) => {
    if (item.parent_id) {
      const parent = map.get(item.parent_id);
      if (parent) parent.replies?.push(item);
      else roots.push(item);
    } else {
      roots.push(item);
    }
  });
  // optional sort by created_at
  const sorter = (a: CommentItem, b: CommentItem) =>
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  const sortTree = (nodes: CommentItem[]) => {
    nodes.sort(sorter);
    nodes.forEach((n) => n.replies && sortTree(n.replies));
  };
  sortTree(roots);
  return roots;
}

export default function CommentBoard({
  threadId,
  apiBase = API_BASE,
  title,
}: Props) {
  const { user, token } = useAuth();
  const [flatComments, setFlatComments] = useState<FlatComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const tree = useMemo(() => buildTree(flatComments), [flatComments]);

  function mergeById(
    prev: FlatComment[],
    next: FlatComment[],
    mode: "append" | "replace" = "append",
  ) {
    const map = new Map<string, FlatComment>();
    const seed = mode === "replace" ? [] : prev;
    for (const it of seed) map.set(String(it.id), it);
    for (const it of next) map.set(String(it.id), it);
    return Array.from(map.values());
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await fetch(
          `${apiBase}/api/comments?threadId=${encodeURIComponent(threadId)}`,
          { cache: "no-store" },
        );
        if (!resp.ok) throw new Error(`加载失败: ${resp.status}`);
        const data = (await resp.json()) as FlatComment[];
        setFlatComments((prev) => mergeById(prev, data, "replace"));
      } catch (e) {
        setError(e instanceof Error ? e.message : "加载失败");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [apiBase, threadId]);

  const submit = async () => {
    if (submittingRef.current) return;
    if (!user || !token) {
      setError("请先登录后再留言");
      return;
    }
    if (!content.trim()) return;
    setError(null);
    const payload = {
      threadId,
      content,
      parentId: replyTo,
      requestId: makeRequestId(),
    };
    try {
      submittingRef.current = true;
      setSubmitting(true);
      const resp = await fetch(`${apiBase}/api/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!resp.ok) throw new Error(`提交失败: ${resp.status}`);
      const created = (await resp.json()) as FlatComment;
      setFlatComments((prev) => mergeById(prev, [created]));
      await reload();
      setContent("");
      setReplyTo(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "提交失败");
    } finally {
      setSubmitting(false);
      submittingRef.current = false;
    }
  };

  const reload = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(
        `${apiBase}/api/comments?threadId=${encodeURIComponent(threadId)}`,
        { cache: "no-store" },
      );
      if (!resp.ok) throw new Error(`加载失败: ${resp.status}`);
      const data = (await resp.json()) as FlatComment[];
      setFlatComments((prev) => mergeById(prev, data, "replace"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  };

  const renderItem = (item: CommentItem) => {
    const profileHref = `/profile/${encodeURIComponent(
      item.author.id.toString(),
    )}`;
    return (
      <li key={item.id} className="space-y-2">
        <div className="flex items-start gap-3">
          <UserAvatar
            id={item.author.id.toString()}
            src={item.author.avatar_data || "/file.svg"}
            size={40}
            href={profileHref}
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm text-base-content/70">
              <Link
                href={profileHref}
                className="font-semibold text-base-content hover:underline"
              >
                {item.author.nickname}
              </Link>
              <span>{formatDate(item.created_at)}</span>
            </div>
            <p className="mt-1 whitespace-pre-wrap text-base-content">
              {item.content}
            </p>
            <div className="flex items-center gap-2">
              <button
                className="btn btn-link btn-xs px-0"
                onClick={() => setReplyTo(replyTo === item.id ? null : item.id)}
              >
                {replyTo === item.id ? "取消回复" : "回复"}
              </button>
              {user?.role === "Admin" && (
                <button
                  className="btn btn-link btn-xs px-0 text-error"
                  onClick={async () => {
                    if (!token) return;
                    const ok = confirm("确认删除此评论及其回复？");
                    if (!ok) return;
                    try {
                      const resp = await fetch(
                        `${apiBase}/api/comments/${item.id}`,
                        {
                          method: "DELETE",
                          headers: { Authorization: `Bearer ${token}` },
                        },
                      );
                      if (!resp.ok) throw new Error(`删除失败: ${resp.status}`);
                      await reload();
                    } catch (e) {
                      setError(e instanceof Error ? e.message : "删除失败");
                    }
                  }}
                >
                  删除
                </button>
              )}
            </div>
            {replyTo === item.id && (
              <div className="mt-2 space-y-2">
                <textarea
                  className="textarea textarea-bordered w-full"
                  rows={3}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={`回复 @${item.author.nickname}`}
                />
                <div className="flex justify-end gap-2">
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setReplyTo(null)}
                  >
                    取消
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={submit}>
                    发送
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        {item.replies && item.replies.length > 0 && (
          <ul className="mt-2 ml-10 border-l border-base-200 pl-4 space-y-4">
            {item.replies.map((child) => renderItem(child))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <section className="w-[90vw] sm:w-[85vw] lg:w-[70vw] max-w-4xl mx-auto mt-8">
      {title && <h2 className="text-xl font-bold mb-4">{title}</h2>}
      <div className="card bg-base-100 shadow-sm">
        <div className="card-body space-y-4">
          <div className="space-y-2">
            <textarea
              className="textarea textarea-bordered w-full"
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={user ? "写点什么..." : "请登录后再留言"}
              disabled={!user}
            />
            <div className="flex justify-end">
              <button
                className="btn btn-primary"
                onClick={submit}
                disabled={!user || submitting}
              >
                {submitting ? "发送中..." : "发布"}
              </button>
            </div>
          </div>
          {error && <div className="text-error text-sm">{error}</div>}
          {loading ? (
            <div className="text-base-content/70">加载中...</div>
          ) : tree.length === 0 ? (
            <div className="text-base-content/70">
              还没有留言，来抢个沙发吧！
            </div>
          ) : (
            <ul className="space-y-6">
              {tree.map((item) => renderItem(item))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
