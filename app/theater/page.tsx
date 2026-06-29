"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Hls from "hls.js";
import Card from "@/app/components/Card/Card";
import Link from "next/link";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8888";

type MediaInfo = {
  id: string;
  hls_url: string;
};

type MovieItem = {
  id: string;
  title: string;
  filename: string;
  cover: string;
  desc?: string;
};

export default function TheaterPage() {
  const movies = useMemo<MovieItem[]>(
    () => [
      {
        id: "example",
        title: "示例影片 · 1080p",
        filename: "example.mp4",
        cover: "/CarouselPhotos/1.jpg",
        desc: "测试用视频文件，默认 1920x1080",
      },
    ],
    [],
  );

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [media, setMedia] = useState<MediaInfo | null>(null);
  const [selected, setSelected] = useState<MovieItem | null>(null);
  const [progress, setProgress] = useState(0);

  const handlePrepare = async () => {
    if (!selected) return;
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(
        `${API_BASE}/api/media/prepare/${selected.filename}`,
        {
          method: "POST",
        },
      );
      if (!resp.ok) {
        throw new Error(`prepare failed: ${resp.status}`);
      }
      const data: MediaInfo = await resp.json();
      setMedia(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "prepare failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selected) return;
    setMedia(null);
    handlePrepare();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected?.id]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !media?.hls_url) return;

    const hlsUrl = new URL(media.hls_url, API_BASE).toString();

    if (Hls.isSupported()) {
      hlsRef.current?.destroy();
      const hls = new Hls();
      hlsRef.current = hls;
      hls.loadSource(hlsUrl);
      hls.attachMedia(video);
    } else {
      video.src = hlsUrl;
    }

    return () => {
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [media]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onTime = () => setProgress(video.currentTime || 0);
    video.addEventListener("timeupdate", onTime);
    return () => video.removeEventListener("timeupdate", onTime);
  }, []);

  return (
    <div className="min-h-screen bg-base-200">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">选择影片</h1>
            <p className="text-sm opacity-70 mt-2">
              选择一部影片开始播放，后续将接入“一起看”功能。
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/theater/watch" className="btn btn-outline btn-sm">
              一起看大厅
            </Link>
            {selected && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setSelected(null);
                  setMedia(null);
                  hlsRef.current?.destroy();
                  hlsRef.current = null;
                }}
              >
                返回列表
              </button>
            )}
          </div>
        </div>

        {!selected ? (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {movies.map((movie) => (
              <button
                key={movie.id}
                className="card bg-base-100 shadow hover:shadow-lg transition text-left"
                onClick={() => setSelected(movie)}
              >
                <figure className="w-full aspect-video overflow-hidden">
                  <img
                    src={movie.cover}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                  />
                </figure>
                <div className="card-body">
                  <h2 className="card-title">{movie.title}</h2>
                  <p className="text-sm opacity-70">{movie.desc}</p>
                  <div className="card-actions justify-end">
                    <span className="btn btn-sm btn-primary">播放</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-8">
            <Card
              title={selected.title}
              date=""
              degistion={selected.desc}
              content={
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="badge badge-outline">
                      进度 {Math.floor(progress)}s
                    </span>
                    {loading && (
                      <span className="badge badge-ghost">加载中...</span>
                    )}
                  </div>

                  {error && (
                    <div className="alert alert-error">
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="bg-black rounded-xl overflow-hidden shadow-lg">
                    <video
                      ref={videoRef}
                      controls
                      className="w-full h-auto"
                      playsInline
                    />
                  </div>
                </div>
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
