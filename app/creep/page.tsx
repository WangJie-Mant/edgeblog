"use client";

import { useEffect, useState } from "react";
import Card from "@/app/components/Card/Card";
import { getCreeperStatus } from "@/app/lib/api";
import BackToPreviousPage from "../components/BackToPre/BackToPreviousPage";
import ChatBoard from "../components/Comments/ChatBoard";
import { useAuth } from "../components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { useTutorial } from "../components/TutorialEngine/useTutorial";

type CreeperData = Awaited<ReturnType<typeof getCreeperStatus>>;

const timeFormatter = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  timeZone: "Asia/Shanghai",
});

function formatTimestamp(ts: number | null): string {
  if (!ts) return "";
  const date = new Date(ts);
  if (Number.isNaN(date.getTime())) return "";
  return timeFormatter.format(date);
}

function matchApp(processName: string) {
  const lower = processName.toLowerCase();
  if (lower.includes("chrome")) {
    return { name: "Google Chrome", icon: "/icons/chrome.svg" };
  }
  if (lower.includes("vscode") || lower.includes("code")) {
    return { name: "Visual Studio Code", icon: "/icons/vscode.svg" };
  }
  if (
    lower.includes("yuanshen") ||
    lower.includes("yuanshen.exe") ||
    lower.includes("genshin") ||
    lower.includes("原神")
  ) {
    return { name: "原神", icon: "/icons/genshin.svg" };
  }
  if (
    lower === "hyp.exe" ||
    lower === "hyphelper.exe" ||
    lower.includes("hyp") ||
    lower.includes("mihoyo") ||
    lower.includes("launcher") ||
    lower.includes("米哈游")
  ) {
    return { name: "原神", icon: "/icons/genshin.svg" };
  }
  return { name: processName, icon: undefined as string | undefined };
}

export default function CreepPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<CreeperData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const tutorial = useTutorial("creep");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
    }
  }, [authLoading, router, user]);

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await getCreeperStatus();
      setData(resp);
    } catch (e) {
      setError("刷新失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  const processName = data?.process_name ?? null;
  const matched = processName ? matchApp(processName) : null;
  const displayTime = mounted ? formatTimestamp(data?.timestamp ?? null) : "";
  const recent = data?.recent ?? [];
  const recentUnique = recent
    .map((item) => {
      const app = matchApp(item.process_name);
      return { ...item, appName: app.name, appIcon: app.icon };
    })
    .reduce<
      Record<
        string,
        {
          process_name: string;
          timestamp: number;
          appName: string;
          appIcon?: string;
        }
      >
    >((acc, item) => {
      const existing = acc[item.appName];
      if (!existing || item.timestamp > existing.timestamp) {
        acc[item.appName] = item;
      }
      return acc;
    }, {});
  const recentList = Object.values(recentUnique)
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 3);

  return (
    <main className="py-6">
      <BackToPreviousPage />
      {!user && !authLoading ? (
        <div className="alert alert-warning w-[90vw] sm:w-[85vw] lg:w-[70vw] max-w-4xl mx-auto">
          <span>请先登录后访问该页面</span>
        </div>
      ) : null}
      <Card
        title="👀N4你在做什么"
        content={
          processName ? (
            <div className="space-y-2 text-sm text-base-content/80">
              <div className="flex items-center gap-2">
                <span>
                  <strong>他在：</strong>
                  {matched?.name ?? processName}
                </span>
                {matched?.icon ? (
                  <img
                    src={matched.icon}
                    alt={matched?.name ?? processName}
                    className={
                      matched.icon === "/icons/genshin.svg"
                        ? "w-7 h-7"
                        : "w-5 h-5"
                    }
                  />
                ) : null}
              </div>
              <div>
                <strong>时间：</strong>
                {displayTime}
              </div>
            </div>
          ) : undefined
        }
        date={displayTime}
        actions={
          <button
            className="btn btn-sm btn-primary"
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? "刷新中..." : "让我看看👀"}
          </button>
        }
      />
      {error && (
        <div className="alert alert-error w-[90vw] sm:w-[85vw] lg:w-[70vw] max-w-4xl mx-auto">
          <span>{error}</span>
        </div>
      )}
      {recentList.length > 0 && (
        <div className="w-[90vw] sm:w-[85vw] lg:w-[70vw] max-w-5xl mx-auto mt-6">
          <div className="text-sm text-base-content/60 mb-2">最近三次活动</div>
          <ul className="space-y-2">
            {recentList.map((item, idx) => {
              const ts = mounted ? formatTimestamp(item.timestamp) : "";
              return (
                <li
                  key={`${item.appName}-${item.timestamp}-${idx}`}
                  className="flex items-center justify-between rounded-md border border-base-300 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    {item.appIcon ? (
                      <img
                        src={item.appIcon}
                        alt={item.appName}
                        className={
                          item.appIcon === "/icons/genshin.svg"
                            ? "w-6 h-6"
                            : "w-4 h-4"
                        }
                      />
                    ) : (
                      <img
                        src="/icons/eyes.svg"
                        alt="Default Icon"
                        className="w-4 h-4"
                      />
                    )}
                    <span className="text-sm">{item.appName}</span>
                  </div>
                  <span className="text-xs text-base-content/60">{ts}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {user && (
        <div className="mt-8">
          <ChatBoard threadId="page:creep" title="评论" />
        </div>
      )}
    </main>
  );
}
