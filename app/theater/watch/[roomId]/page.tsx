"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Hls from "hls.js";
import Card from "@/app/components/Card/Card";
import { useAuth } from "@/app/components/auth/AuthProvider";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8888";

type MediaInfo = {
  id: string;
  hls_url: string;
};

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

type WatchState = {
  content_id: string;
  progress: number;
  playing: boolean;
};

function toWsUrl(httpUrl: string) {
  return httpUrl.replace(/^http/, "ws");
}

export default function WatchRoomPage() {
  const params = useParams<{ roomId: string }>();
  const router = useRouter();
  const search = useSearchParams();
  const { user } = useAuth();
  const roomId = params.roomId;
  const role = (search.get("role") || "viewer") as "host" | "viewer";

  const [room, setRoom] = useState<WatchRoom | null>(null);
  const [media, setMedia] = useState<MediaInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [remoteState, setRemoteState] = useState<WatchState | null>(null);
  const [progress, setProgress] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const isHost = role === "host";
  const lastSyncRef = useRef(0);
  const retryRef = useRef(0);
  const retryTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingRef = useRef<{ action: string; progress: number } | null>(null);

  const sendAction = (action: "Play" | "Pause" | "Seek", progress: number) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.debug("[ws] queue", { action, progress });
      pendingRef.current = { action, progress };
      return;
    }
    console.debug("[ws] send", { action, progress, readyState: ws.readyState });
    ws.send(JSON.stringify({ type: "Action", action, progress }));
  };

  const displayName = useMemo(() => {
    if (!user) return "游客";
    return user.nickname || user.email;
  }, [user]);

  const displayNameSafe = useMemo(() => displayName || "游客", [displayName]);

  const avatarSrc = useMemo(() => {
    if (user?.avatar_data && user.avatar_data.trim().length > 0) {
      return user.avatar_data;
    }
    return "/icons/logo.svg";
  }, [user]);

  useEffect(() => {
    fetch(`${API_BASE}/api/watch/rooms/${roomId}`)
      .then((resp) => {
        if (!resp.ok) throw new Error("未找到房间信息");
        return resp.json();
      })
      .then((data) =>
        setRoom({
          id: data.id,
          title: data.title,
          movieId: data.movie_title,
          movieTitle: data.movie_title,
          movieQuality: data.movie_quality,
          filename: data.filename,
          hostName: data.host_name,
          createdAt: data.created_at,
        }),
      )
      .catch((e) => setError(e instanceof Error ? e.message : "未找到房间"));
  }, [roomId]);

  useEffect(() => {
    if (!room) return;
    setError(null);
    fetch(`${API_BASE}/api/media/prepare/${room.filename}`, { method: "POST" })
      .then((resp) => {
        if (!resp.ok) throw new Error(`prepare failed: ${resp.status}`);
        return resp.json() as Promise<MediaInfo>;
      })
      .then(setMedia)
      .catch((e) =>
        setError(e instanceof Error ? e.message : "prepare failed"),
      );
  }, [room]);

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
    if (!room) return;
    let closed = false;

    const connect = () => {
      if (closed) return;
      const qs = new URLSearchParams({ role });
      if (isHost) {
        const hostName = room.hostName || displayNameSafe;
        qs.set("title", room.title);
        qs.set("movie_title", room.movieTitle);
        qs.set("movie_quality", room.movieQuality);
        qs.set("filename", room.filename);
        qs.set("host_name", hostName);
      }
      const wsUrl = `${toWsUrl(API_BASE)}/api/watch/${room.id}?${qs.toString()}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        retryRef.current = 0;
        setError(null);
        console.info("[ws] open", room.id);
        if (isHost) {
          const video = videoRef.current;
          const progress = video?.currentTime || 0;
          const action = video && !video.paused ? "Play" : "Pause";
          sendAction(action, progress);
        }
        if (pendingRef.current) {
          const { action, progress } = pendingRef.current;
          pendingRef.current = null;
          sendAction(action as "Play" | "Pause" | "Seek", progress);
        }
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          console.debug("[ws] recv", msg);
          if (msg.type === "Sync") {
            setRemoteState(msg.state as WatchState);
          }
        } catch {
          // ignore
        }
      };

      ws.onclose = () => {
        if (closed) return;
        console.warn("[ws] closed", room.id);
        if (retryRef.current < 5) {
          retryRef.current += 1;
          const wait = 300 * retryRef.current;
          retryTimerRef.current = setTimeout(connect, wait);
        } else {
          setError("WebSocket 连接失败");
        }
      };

      ws.onerror = () => {
        console.warn("[ws] error", room.id);
        // close handled by onclose
      };
    };

    connect();

    return () => {
      closed = true;
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
      }
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [room, role, isHost]);

  const handlePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    console.debug("[video] play", { currentTime: video.currentTime });
    if (!isHost) return;
    sendAction("Play", video.currentTime);
  };

  const handlePause = () => {
    const video = videoRef.current;
    if (!video) return;
    console.debug("[video] pause", { currentTime: video.currentTime });
    if (!isHost) return;
    sendAction("Pause", video.currentTime);
  };

  const handleSeeked = () => {
    const video = videoRef.current;
    if (!video) return;
    console.debug("[video] seeked", { currentTime: video.currentTime });
    if (!isHost) return;
    sendAction("Seek", video.currentTime);
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    const current = video.currentTime || 0;
    setProgress(current);
    if (!isHost) return;
    if (current - lastSyncRef.current >= 1) {
      lastSyncRef.current = current;
      sendAction("Seek", current);
    }
  };

  useEffect(() => {
    if (!remoteState || isHost) return;
    const video = videoRef.current;
    if (!video) return;

    const diff = Math.abs(video.currentTime - remoteState.progress);
    if (diff > 0.5) {
      video.currentTime = remoteState.progress;
    }
    if (remoteState.playing && video.paused) {
      video.play().catch(() => undefined);
    }
    if (!remoteState.playing && !video.paused) {
      video.pause();
    }
  }, [remoteState, isHost]);

  if (!user) {
    return (
      <div className="min-h-screen bg-base-200">
        <div className="max-w-3xl mx-auto px-6 py-10">
          <div className="alert alert-warning">
            <span>请先登录后再进入一起看房间。</span>
          </div>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-base-200">
        <div className="max-w-3xl mx-auto px-6 py-10">
          <div className="alert alert-error">
            <span>未找到房间信息，请从大厅进入。</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <span className="font-bold">影片：</span>
                <span>
                  {room.movieTitle} {room.movieQuality}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">房间号：</span>
                <span className="font-mono text-sm bg-base-100 px-2 py-1 rounded">
                  {room.id}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                wsRef.current?.close();
                router.push("/theater/watch");
              }}
            >
              退出房间
            </button>
            <div className="card bg-base-100 shadow-sm px-4 py-2 flex flex-row items-center gap-3">
              <div className="avatar">
                <div className="rounded-full w-9 h-9 overflow-hidden">
                  <img src={avatarSrc} alt={displayName} />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-semibold leading-tight">
                  {displayName}
                </span>
              </div>
              <span
                className={`badge ${isHost ? "badge-warning" : "badge-success"}`}
              >
                {isHost ? "Host" : "Viewer"}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-error mt-4">
            <span>{error}</span>
          </div>
        )}

        <div className="mt-6">
          <Card
            title=""
            date=""
            content={
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="badge badge-outline">
                    进度 {Math.floor(progress)}s
                  </span>
                  {remoteState && !isHost && (
                    <span className="badge badge-ghost">
                      同步中 {remoteState.playing ? "播放" : "暂停"}
                    </span>
                  )}
                </div>
                <div className="bg-black rounded-xl overflow-hidden shadow-lg">
                  <video
                    ref={videoRef}
                    controls={isHost}
                    className="w-full h-auto"
                    playsInline
                    onPlay={handlePlay}
                    onPause={handlePause}
                    onSeeked={handleSeeked}
                    onTimeUpdate={handleTimeUpdate}
                  />
                </div>
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
}
