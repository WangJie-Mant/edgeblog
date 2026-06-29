"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/app/components/Card/Card";
import { useAuth } from "@/app/components/auth/AuthProvider";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8888";

type MovieItem = {
  id: string;
  title: string;
  quality: string;
  filename: string;
};

type CreateRoomResp = {
  id: string;
};

export default function WatchCreatePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [movieId, setMovieId] = useState("example");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const movies = useMemo<MovieItem[]>(
    () => [
      {
        id: "example",
        title: "示例影片",
        quality: "1080p",
        filename: "example.mp4",
      },
    ],
    [],
  );

  const handleCreate = async () => {
    setError(null);
    if (!user) {
      setError("请先登录后再创建房间");
      return;
    }
    const movie = movies.find((m) => m.id === movieId);
    if (!movie) {
      setError("请选择影片");
      return;
    }
    if (!title.trim()) {
      setError("请输入房间标题");
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/api/watch/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          movie_title: movie.title,
          movie_quality: movie.quality,
          filename: movie.filename,
          host_name: user.nickname || user.email,
        }),
      });
      if (!resp.ok) {
        throw new Error(`创建失败: ${resp.status}`);
      }
      const data = (await resp.json()) as CreateRoomResp;
      router.push(`/theater/watch/${data.id}?role=host`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "创建失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">创建一起看房间</h1>
            <p className="text-sm opacity-70 mt-2">
              填写房间信息后进入播放间。
            </p>
          </div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => router.push("/theater/watch")}
          >
            返回大厅
          </button>
        </div>

        {error && (
          <div className="alert alert-error mt-4">
            <span>{error}</span>
          </div>
        )}

        <Card
          title="房间信息"
          date=""
          content={
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm opacity-70">房间标题</label>
                <input
                  className="input input-bordered"
                  placeholder="例如：周末看片会"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm opacity-70">影片</label>
                <select
                  className="select select-bordered"
                  value={movieId}
                  onChange={(e) => setMovieId(e.target.value)}
                >
                  {movies.map((movie) => (
                    <option key={movie.id} value={movie.id}>
                      {movie.title} {movie.quality}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end">
                <button
                  className="btn btn-primary"
                  onClick={handleCreate}
                  disabled={loading}
                >
                  {loading ? "创建中..." : "创建并进入"}
                </button>
              </div>
            </div>
          }
        />
      </div>
    </div>
  );
}
