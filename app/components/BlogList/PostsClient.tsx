"use client";
import React, { useEffect, useState } from "react";
import Card from "@/app/components/Card/Card";

interface PostItem {
  id: string;
  title: string;
  digest?: string;
  date?: string;
  author?: string;
  image?: string | null;
  tags?: string[];
}

export default function PostsClient({
  basePath = "/blog",
}: {
  basePath?: string;
}) {
  const [items, setItems] = useState<PostItem[]>([]);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/posts?page=1&page_size=20`);
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setItems(data.items || []);
      } catch (e) {
        // swallow
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="space-y-4 flex-1">
      {items.map((blog) => (
        <Card
          key={blog.id}
          title={blog.title}
          degistion={blog.digest}
          date={blog.date ?? ""}
          link={`${basePath}/${blog.id}`}
          imageSrc={blog.image ?? undefined}
        />
      ))}
    </div>
  );
}
