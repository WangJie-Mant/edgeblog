"use client";

import { useEffect, useRef, useState } from "react";
import UserAvatar from "../components/Avatar/UserAvatar";
import { useRouter } from "next/navigation";
import { useAuth } from "../components/auth/AuthProvider";
import UserGroupTag from "../components/Tag/UserGroupTag";
import SkillWall from "../components/Profile/SkillWall";
import { parseSkillRatings, SkillLevel } from "../lib/skills";
import { useTutorial } from "@/app/components/TutorialEngine/useTutorial";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8888";

type Profile = {
  id: string;
  email: string;
  nickname: string;
  signature?: string | null;
  avatar_data?: string | null;
  role?: string;
  banner?: string | null;
  skill_ratings?: string | null;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [bannerUrl, setBannerUrl] = useState<string | undefined>(undefined);
  const [skillRatings, setSkillRatings] = useState<
    Record<string, SkillLevel>
  >(parseSkillRatings(null));
  const [bannerRatio, setBannerRatio] = useState<string | null>(null);
  const [bannerBaseHeight, setBannerBaseHeight] = useState<number | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSkills, setShowSkills] = useState(false);
  const { token, loading: authLoading } = useAuth();
  const router = useRouter();
  const bannerRef = useRef<HTMLElement | null>(null);
  const tutorial = useTutorial("space");

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      router.push("/login");
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const resp = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!resp.ok) {
          throw new Error(`加载失败: ${resp.status}`);
        }
        const data: Profile = await resp.json();
        setProfile(data);
        setAvatarUrl(data.avatar_data || undefined);
        setBannerUrl(data.banner || undefined);
        setSkillRatings(parseSkillRatings(data.skill_ratings));
      } catch (err) {
        setError(err instanceof Error ? err.message : "无法加载用户信息");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [authLoading, router, token]);

  useEffect(() => {
    const updateViewport = () => setViewportHeight(window.innerHeight);
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  useEffect(() => {
    const node = bannerRef.current;
    if (!node) return;
    const observer = new ResizeObserver(() => {
      setBannerBaseHeight(node.offsetHeight);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [bannerRatio, bannerUrl]);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const startHeight = bannerBaseHeight ?? 0;
        const minHeight = Math.max(Math.round(viewportHeight * 0.3), 180);
        if (!startHeight || startHeight <= minHeight) {
          setScrollProgress(1);
        } else {
          const maxDelta = startHeight - minHeight;
          const progress = Math.min(window.scrollY / maxDelta, 1);
          setScrollProgress(progress);
        }
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [bannerBaseHeight, viewportHeight]);

  const groupLabel = profile?.role === "Admin" ? "管理员" : "注册用户";
  const groupColor = profile?.role === "Admin" ? "error" : "success";

  if (loading) {
    return <div className="p-4">加载中...</div>;
  }

  if (error) {
    return <div className="p-4 text-error">{error}</div>;
  }

  const minBannerHeight = Math.max(Math.round(viewportHeight * 0.3), 180);
  const maxBannerHeight = Math.min(Math.round(viewportHeight * 0.55), 420);
  const maxDelta = bannerBaseHeight
    ? Math.max(bannerBaseHeight - minBannerHeight, 0)
    : 0;
  const cardLiftMax = Math.min(maxDelta, 160);
  const cardTranslate = showSkills ? -(scrollProgress * cardLiftMax) : 0;

  return (
    <div className="min-h-screen">
      <section
        ref={bannerRef}
        className="relative w-full overflow-hidden"
        style={{
          aspectRatio: bannerRatio ?? "16 / 5",
          minHeight: `${minBannerHeight}px`,
          maxHeight: `${maxBannerHeight}px`,
        }}
      >
        {bannerUrl ? (
          <img
            src={bannerUrl}
            alt="Banner"
            className="h-full w-full object-contain object-center"
            onLoad={(e) => {
              const img = e.currentTarget;
              if (img.naturalWidth && img.naturalHeight) {
                setBannerRatio(`${img.naturalWidth} / ${img.naturalHeight}`);
              }
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-base-200">
            <span className="text-sm text-base-content/70">暂无背景图</span>
          </div>
        )}
      </section>

      <div className="relative -mt-10 px-4">
        <div
          className="mx-auto w-full max-w-4xl"
          style={{ transform: `translateY(${cardTranslate}px)` }}
        >
          <div className="card bg-base-100 shadow-md">
            <div className="card-body pt-0">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="-mt-12">
                    <UserAvatar
                      id={(profile?.id ?? "user").toString()}
                      src={avatarUrl || "/file.svg"}
                      size={112}
                    />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="text-2xl font-bold">
                        {profile?.nickname ?? "未命名用户"}
                      </div>
                      <UserGroupTag label={groupLabel} color={groupColor} />
                    </div>
                    {profile?.signature && (
                      <div className="text-sm text-base-content/70">
                        {profile.signature}
                      </div>
                    )}
                    {profile?.id && (
                      <div className="mt-1 text-xs text-base-content/60">
                        UID: {profile.id}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => router.push("/profile/edit")}
                >
                  编辑个人资料
                </button>
              </div>
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  className="flex items-center text-base-content/50 hover:text-base-content/70"
                  onClick={() => setShowSkills((prev) => !prev)}
                  aria-label="Toggle skill wall"
                >
                  <img
                    src="/icons/downarrow.svg"
                    alt="Toggle skill wall"
                    className={`h-3 w-3 transition-transform ${
                      showSkills ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>
              {showSkills && (
                <div className="mt-4">
                  <SkillWall ratings={skillRatings} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
