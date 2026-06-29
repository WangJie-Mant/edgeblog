"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import UserAvatar from "../../components/Avatar/UserAvatar";
import AvatarCropper from "../../components/AvatarCrop/AvatarCrop";
import { useAuth } from "../../components/auth/AuthProvider";
import BackToPreviousPage from "../../components/BackToPre/BackToPreviousPage";
import UserGroupTag from "../../components/Tag/UserGroupTag";
import {
  SKILLS,
  SKILL_GROUPS,
  SKILL_LEVEL_LABEL,
  defaultSkillRatings,
  parseSkillRatings,
  SkillLevel,
} from "../../lib/skills";

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

export default function ProfileEditPage() {
  const skillMap = new Map(SKILLS.map((skill) => [skill.key, skill]));
  const [profile, setProfile] = useState<Profile | null>(null);
  const [nickname, setNickname] = useState("");
  const [signature, setSignature] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [bannerUrl, setBannerUrl] = useState<string | undefined>(undefined);
  const [bannerRatio, setBannerRatio] = useState<string | null>(null);
  const [skillRatings, setSkillRatings] = useState<
    Record<string, SkillLevel>
  >(defaultSkillRatings());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  const { token, refresh, loading: authLoading } = useAuth();
  const router = useRouter();
  const bannerInputId = useId();
  const lastBannerUrlRef = useRef<string | undefined>(undefined);

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
        setNickname(data.nickname ?? "");
        setSignature(data.signature ?? "");
        setEmail(data.email ?? "");
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

  const handleSaveProfile = useCallback(async () => {
    if (!token) {
      setError("未找到登录凭证");
      return;
    }
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const body: Record<string, unknown> = {};
      if (nickname && nickname !== profile?.nickname) body.nickname = nickname;
      if (signature !== (profile?.signature ?? "")) body.signature = signature;
      if (email && email !== profile?.email) body.email = email;
      body.skill_ratings = skillRatings;

      const resp = await fetch(`${API_BASE}/api/auth/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!resp.ok) {
        throw new Error(`保存失败: ${resp.status}`);
      }

      const updated: Profile = await resp.json();
      setProfile(updated);
      setAvatarUrl(updated.avatar_data || undefined);
      setBannerUrl(updated.banner || undefined);
      if (updated.skill_ratings != null) {
        setSkillRatings(parseSkillRatings(updated.skill_ratings));
      }
      await refresh();
      setSuccess("保存成功");
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }, [email, nickname, profile, refresh, signature, skillRatings, token]);

  const handleAvatarDone = useCallback(
    async (res: { blob: Blob; url: string }) => {
      if (!token) {
        setError("未找到登录凭证");
        return;
      }
      setAvatarUrl(res.url);
      const formData = new FormData();
      formData.append("avatar", res.blob, "avatar.png");
      try {
        const resp = await fetch(`${API_BASE}/api/auth/avatar`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (!resp.ok) {
          throw new Error(`上传失败: ${resp.status}`);
        }
        const updated: Profile = await resp.json();
        setProfile(updated);
        setAvatarUrl(updated.avatar_data || undefined);
        await refresh();
        setSuccess("保存成功");
      } catch (err) {
        setError(err instanceof Error ? err.message : "上传头像失败");
      }
    },
    [refresh, token],
  );

  const handleBannerSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!token) {
      setBannerMessage("未找到登录凭证");
      return;
    }

    setBannerUploading(true);
    setBannerMessage(null);
    lastBannerUrlRef.current = bannerUrl;
    const previewUrl = URL.createObjectURL(file);
    setBannerUrl(previewUrl);
    let shouldRevokePreview = true;

    const formData = new FormData();
    formData.append("banner", file, file.name);

    try {
      const resp = await fetch(`${API_BASE}/api/auth/banner`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!resp.ok) {
        throw new Error(`上传失败: ${resp.status}`);
      }

      const updated: Profile = await resp.json();
      setProfile(updated);
      if (updated.banner) {
        setBannerUrl(updated.banner);
      } else {
        shouldRevokePreview = false;
      }
      await refresh();
      setBannerMessage("上传成功");
    } catch (err) {
      setBannerUrl(lastBannerUrlRef.current);
      setBannerMessage(err instanceof Error ? err.message : "上传背景图失败");
    } finally {
      setBannerUploading(false);
      if (shouldRevokePreview) {
        URL.revokeObjectURL(previewUrl);
      }
      e.target.value = "";
    }
  };

  if (loading) {
    return <div className="p-4">加载中...</div>;
  }

  if (error) {
    return <div className="p-4 text-error">{error}</div>;
  }

  return (
    <div>
      <div className="p-4 w-[90vw] sm:w-[85vw] lg:w-[70vw] max-w-4xl mx-auto">
        <div className="card bg-base-100 shadow-md">
          <div className="card-body flex flex-col gap-4">
            <BackToPreviousPage
              className="my-0"
              buttonClassName="btn btn-ghost px-0"
              label="返回"
            />
            <h1 className="font-bold text-xl">编辑资料</h1>
            <div className="divider divider-start">基本</div>

            <div className="flex flex-col gap-4 w-full max-w-2xl">
              {success && (
                <div className="alert alert-success py-2 text-sm">
                  {success}
                </div>
              )}
              {error && (
                <div className="alert alert-error py-2 text-sm">{error}</div>
              )}
              <div className="flex items-center gap-3 w-full max-w-md">
                <span className="w-16 text-right font-bold">用户组</span>
                <UserGroupTag
                  label={
                    profile?.role === "Admin"
                      ? "管理员"
                      : profile?.role
                        ? "注册用户"
                        : "游客"
                  }
                  color={
                    profile?.role === "Admin"
                      ? "error"
                      : profile?.role
                        ? "success"
                        : "neutral"
                  }
                />
              </div>
              <div className="flex items-center gap-3 w-full max-w-md">
                <span className="w-16 text-right font-bold">昵称</span>
                <input
                  type="text"
                  className="input input-bordered flex-1"
                  placeholder={profile?.nickname ?? "请输入昵称"}
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                />
              </div>

              <div className="flex items-start gap-3 w-full max-w-md">
                <span className="w-16 text-right font-bold mt-2">签名</span>
                <div className="flex-1">
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    placeholder="留下你的signature~"
                    value={signature}
                    maxLength={30}
                    onChange={(e) => setSignature(e.target.value.slice(0, 30))}
                  />
                  <div className="mt-1 text-xs text-base-content/60 text-right">
                    {signature.length}/30
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full max-w-md">
                <span className="w-16 text-right font-bold">邮箱</span>
                <input
                  type="email"
                  className="input input-bordered flex-1"
                  placeholder={profile?.email ?? "请输入邮箱"}
                  value={email}
                  disabled
                />
              </div>

              <div className="flex items-center gap-4 w-full max-w-md">
                <UserAvatar
                  id={(profile?.id ?? "user").toString()}
                  src={avatarUrl || "/file.svg"}
                />
                <AvatarCropper
                  onDone={handleAvatarDone}
                  buttonText="更改头像"
                  buttonClassName="btn btn-sm btn-neutral"
                />
              </div>

              <details className="collapse collapse-arrow border border-base-200">
                <summary className="collapse-title text-sm font-semibold">
                  Skills
                </summary>
                <div className="collapse-content">
                  <div className="flex flex-col gap-3">
                    {SKILL_GROUPS.map((group) => (
                      <details
                        key={group.key}
                        className="collapse collapse-arrow border border-base-200"
                      >
                        <summary className="collapse-title text-sm font-medium">
                          {group.name}
                        </summary>
                        <div className="collapse-content">
                          <div className="grid gap-3">
                            {group.skills
                              .map((key) => skillMap.get(key))
                              .filter((skill): skill is (typeof SKILLS)[number] =>
                                Boolean(skill),
                              )
                              .map((skill) => (
                                <div
                                  key={skill.key}
                                  className="grid items-center gap-3 sm:grid-cols-[1fr_auto]"
                                >
                                  <div className="flex items-center gap-2">
                                    <skill.icon className="h-5 w-5" />
                                    <span className="text-sm font-medium">
                                      {skill.name}
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-3">
                                    {(Object.keys(SKILL_LEVEL_LABEL) as SkillLevel[]).map(
                                      (level) => (
                                        <label
                                          key={level}
                                          className="flex items-center gap-1 text-xs text-base-content/80"
                                        >
                                          <input
                                            type="radio"
                                            name={`skill-${skill.key}`}
                                            className="radio radio-xs"
                                            checked={skillRatings[skill.key] === level}
                                            onChange={() =>
                                              setSkillRatings((prev) => ({
                                                ...prev,
                                                [skill.key]: level,
                                              }))
                                            }
                                          />
                                          {SKILL_LEVEL_LABEL[level]}
                                        </label>
                                      ),
                                    )}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              </details>

              <div className="divider divider-start">Banner</div>
              <div className="flex items-center gap-4 w-full max-w-md">
                <label htmlFor={bannerInputId} className="btn btn-sm btn-outline">
                  更改背景Banner
                </label>
                {bannerMessage && (
                  <span className="text-sm text-base-content/70">
                    {bannerMessage}
                  </span>
                )}
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                className={`btn btn-primary ${saving ? "btn-disabled" : ""}`}
                onClick={handleSaveProfile}
                disabled={saving}
              >
                {saving ? "保存中..." : "保存"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <input
        id={bannerInputId}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleBannerSelect}
        disabled={bannerUploading}
      />
    </div>
  );
}
