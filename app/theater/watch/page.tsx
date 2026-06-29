"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/app/components/Card/Card";
import { useAuth } from "@/app/components/auth/AuthProvider";

type WatchRoom = {
  id: string;
  title: string;
  movieId: string;
  movieTitle: string;
  movieQuality: string;
  filename: string;
  hostName: string;
  createdAt: number;
};
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8888";

export default function WatchHallPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [rooms, setRooms] = useState<WatchRoom[]>([]);
  const [panel, setPanel] = useState<"join">("join");
  const [joinId, setJoinId] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const load = () => {
      fetch(`${API_BASE}/api/watch/rooms`)
        .then((resp) => resp.json())
        .then((data) => {
          if (!alive) return;
          const list = (data as any[]).map((room) => ({
            id: room.id,
            title: room.title,
            movieId: room.movie_title,
            movieTitle: room.movie_title,
            movieQuality: room.movie_quality,
            filename: room.filename,
            hostName: room.host_name,
            createdAt: room.created_at,
          })) as WatchRoom[];
          setRooms(list);
        })
        .catch(() => {
          if (alive) setRooms([]);
        });
    };
    load();
    const timer = setInterval(load, 5000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  const handleJoin = () => {
    setError(null);
    if (!user) {
      setError("请先登录后再加入房间");
      return;
    }
    const id = joinId.trim();
    if (!id) {
      setError("请输入房间号");
      return;
    }
    fetch(`${API_BASE}/api/watch/rooms/${id}`)
      .then((resp) => {
        if (!resp.ok) throw new Error("未找到该房间，请检查房间号");
        return resp.json();
      })
      .then(() => router.push(`/theater/watch/${id}?role=viewer`))
      .catch((e) => setError(e instanceof Error ? e.message : "未找到该房间"));
  };

  return (
    <div className="min-h-screen bg-base-200">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">一起看大厅</h1>
            <p className="text-sm opacity-70 mt-2">
              已登录用户可创建房间或加入已有房间。
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="btn btn-sm btn-primary"
              onClick={() => router.push("/theater/watch/create")}
            >
              创建一起看房间
            </button>
            <button className="btn btn-sm btn-outline">搜索房间</button>
          </div>
        </div>

        {error && (
          <div className="alert alert-error mt-4">
            <span>{error}</span>
          </div>
        )}

        <div className="mt-6">
          {panel === "join" && (
            <Card
              title="加入已有房间"
              date=""
              content={
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm opacity-70">房间号</label>
                    <input
                      className="input input-bordered"
                      placeholder="粘贴房间号"
                      value={joinId}
                      onChange={(e) => setJoinId(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end">
                    <button className="btn btn-primary" onClick={handleJoin}>
                      加入房间
                    </button>
                  </div>
                </div>
              }
            />
          )}
        </div>

        <div className="mt-10">
          <h2 className="text-xl font-bold">房间列表</h2>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rooms.length === 0 && (
              <div className="text-sm opacity-70">暂无房间</div>
            )}
            {rooms.map((room) => (
              <button
                key={room.id}
                className="card bg-base-100 shadow hover:shadow-lg transition text-left"
                onClick={() =>
                  router.push(`/theater/watch/${room.id}?role=viewer`)
                }
              >
                <div className="card-body">
                  <h3 className="card-title">{room.title}</h3>
                  <p className="text-sm opacity-70">
                    影片：{room.movieTitle} {room.movieQuality}
                  </p>
                  <p className="text-sm opacity-70">房主：{room.hostName}</p>
                  <div className="card-actions justify-end">
                    <span className="btn btn-sm btn-outline">进入</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
