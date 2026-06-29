"use client";

import { useEffect, useMemo, useState } from "react";

type MeResponse = {
  id: string;
  nickname: string;
  role?: string;
};

type PostItem = {
  id: string;
  title: string;
  digest: string;
  date: string;
  author?: string | null;
  image?: string | null;
  tags: string[];
  markdown?: string;
};

type Stage = "login" | "dashboard" | "forbidden";

const TOKEN_KEY = "dashboard_admin_token";

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

function storeToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (!token) {
    localStorage.removeItem(TOKEN_KEY);
    return;
  }
  localStorage.setItem(TOKEN_KEY, token);
}

async function fetchMe(token: string): Promise<MeResponse> {
  const resp = await fetch("/api/auth/me", {
    headers: { Authorization: "Bearer " + token },
  });
  if (!resp.ok) throw new Error("auth me failed: " + resp.status);
  return (await resp.json()) as MeResponse;
}

function isAdminRole(role?: string): boolean {
  return (role || "").toLowerCase() === "admin";
}

async function apiFetch(
  token: string,
  path: string,
  init?: RequestInit,
): Promise<Response> {
  return fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
      ...(init?.headers || {}),
    },
  });
}

export default function DashboardPage() {
  const [stage, setStage] = useState<Stage>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [nickname, setNickname] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Upload state
  const [file, setFile] = useState<File | null>(null);
  const [imageRefs, setImageRefs] = useState<{ ref: string; file: File | null }[]>([]);
  const [markdownContent, setMarkdownContent] = useState("");

  // Parse local image references from markdown
  const detectImages = async (mdFile: File) => {
    const text = await mdFile.text();
    setMarkdownContent(text);
    // Match ![alt](path) where path is NOT http/data/asset
    const re = /!\[([^\]]*)\]\(((?!https?:\/\/|data:|#|\/assets\/)[^)]+)\)/g;
    const refs: string[] = [];
    let m;
    while ((m = re.exec(text)) !== null) {
      if (!refs.includes(m[2])) refs.push(m[2]);
    }
    setImageRefs(refs.map((r) => ({ ref: r, file: null })));
  };

  // Match images from a folder to detected references by filename
  const matchFolder = (files: FileList) => {
    const fileMap = new Map<string, File>();
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (f.type.startsWith("image/")) {
        fileMap.set(f.name, f);
        // Also index without extension for flexible matching
        const dot = f.name.lastIndexOf(".");
        if (dot > 0) fileMap.set(f.name.slice(0, dot), f);
      }
    }
    setImageRefs((prev) =>
      prev.map((img) => {
        if (img.file) return img; // already matched
        // Try exact filename match first
        const basename = img.ref.split("/").pop()?.split("?")[0] || "";
        if (fileMap.has(basename)) return { ...img, file: fileMap.get(basename)! };
        // Try without extension
        const dot = basename.lastIndexOf(".");
        if (dot > 0 && fileMap.has(basename.slice(0, dot))) return { ...img, file: fileMap.get(basename.slice(0, dot))! };
        // Try case-insensitive
        for (const [name, f] of fileMap) {
          if (name.toLowerCase() === basename.toLowerCase()) return { ...img, file: f };
        }
        return img;
      })
    );
  };

  // Upload a single image to R2, return the asset URL
  const uploadImage = async (file: File): Promise<string> => {
    const dataUri = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
    // Warn if image is large (>5MB base64)
    if (dataUri.length > 7_000_000) {
      setError("图片过大（>" + Math.round(dataUri.length / 1_000_000) + "MB），请压缩后再试");
      throw new Error("图片过大");
    }
    const resp = await apiFetch(token!, "/api/posts/upload-image", {
      method: "POST",
      body: JSON.stringify({ image: dataUri }),
    });
    let body: any;
    try { body = await resp.json(); } catch { throw new Error("服务器响应异常，请重试"); }
    if (!resp.ok) throw new Error(body.error || "图片上传失败");
    return body.url as string;
  };

  // Process markdown: upload images to R2, replace local refs with R2 URLs
  const buildMarkdown = async (): Promise<string> => {
    let md = markdownContent;
    for (const img of imageRefs) {
      if (img.file) {
        const url = await uploadImage(img.file);
        const escaped = img.ref.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        md = md.replace(new RegExp('!\\[([^\\]]*)\\]\\((' + escaped + ')\\)', 'g'), '![$1](' + url + ')');
      }
    }
    return md;
  };

  // Post management state
  const [posts, setPosts] = useState<PostItem[]>([]);

  // Edit modal state
  const [editing, setEditing] = useState<PostItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDigest, setEditDigest] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editAuthor, setEditAuthor] = useState("");
  const [editImage, setEditImage] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editContent, setEditContent] = useState("");

  // Dashboard tab
  const [activeTab, setActiveTab] = useState("blogs");

  // Gitversions state
  const [gvContent, setGvContent] = useState("");
  const [gvLoading, setGvLoading] = useState(false);

  const loadGitversions = async (t: string) => {
    try {
      const resp = await apiFetch(t, "/api/gitversions");
      if (resp.ok) {
        const data = await resp.json();
        setGvContent(data.content || "");
      }
    } catch { /* ignore */ }
  };

  const saveGitversions = async () => {
    if (!token) return;
    setGvLoading(true);
    setError(null);
    try {
      const resp = await apiFetch(token, "/api/gitversions", {
        method: "PUT",
        body: JSON.stringify({ content: gvContent }),
      });
      if (!resp.ok) {
        const data = await resp.json();
        throw new Error(data.error || "保存失败");
      }
      setSuccess("建设历史已更新");
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
    } finally {
      setGvLoading(false);
    }
  };

  const loadPosts = async (t: string) => {
    try {
      const resp = await apiFetch(t, "/api/posts?page=1&page_size=100");
      if (resp.ok) {
        const data = await resp.json();
        setPosts(data.items || []);
      }
    } catch { /* ignore */ }
  };

  const checkAdmin = async (candidateToken: string) => {
    setChecking(true);
    setError(null);
    try {
      const me = await fetchMe(candidateToken);
      if (!isAdminRole(me.role)) {
        setStage("forbidden");
        setToken(null);
        setNickname(me.nickname || "");
        storeToken(null);
        return false;
      }
      setNickname(me.nickname || "");
      setStage("dashboard");
      setToken(candidateToken);
      storeToken(candidateToken);
      await loadPosts(candidateToken);
      await loadGitversions(candidateToken);
      return true;
    } catch {
      setStage("login");
      setToken(null);
      storeToken(null);
      return false;
    } finally {
      setChecking(false);
    }
  };

  const handleUseStoredToken = async () => {
    const stored = getStoredToken();
    if (!stored) {
      setError("未发现已登录令牌，请先登录");
      return;
    }
    await checkAdmin(stored);
  };

  const handleLogin = async () => {
    const emailValue = email.trim();
    if (!emailValue || !password) {
      setError("请输入邮箱和密码");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const resp = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailValue, password }),
      });
      const data = (await resp.json()) as { token?: string; error?: string };
      if (!resp.ok || !data.token) {
        throw new Error(data.error || "登录失败: " + resp.status);
      }
      const ok = await checkAdmin(data.token);
      if (!ok) {
        setError("403：你不是管理员账号，禁止访问后台");
      } else {
        setSuccess("管理员验证通过");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "登录失败");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setStage("login");
    setNickname("");
    setPassword("");
    setPosts([]);
    storeToken(null);
    setSuccess("已退出后台");
  };

  // ── Upload ──
  const handleUpload = async () => {
    if (!token) {
      setError("登录已失效");
      setStage("login");
      return;
    }
    if (!file) {
      setError("请选择 .md 文件");
      return;
    }
    if (!file.name.toLowerCase().endsWith(".md")) {
      setError("只支持 .md 文件");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const markdown = await buildMarkdown();
      const resp = await apiFetch(token, "/api/posts/upload-md", {
        method: "POST",
        body: JSON.stringify({ file_name: file.name, markdown }),
      });
      const data = (await resp.json()) as { id?: string; title?: string; error?: string };
      if (resp.status === 401) throw new Error("登录过期，请重新登录");
      if (resp.status === 403) { setStage("forbidden"); throw new Error("403：当前账号不是管理员"); }
      if (!resp.ok || !data.id) throw new Error(data.error || "上传失败");
      setSuccess("上传成功：" + (data.title || data.id));
      setFile(null);
      setImageRefs([]);
      setMarkdownContent("");
      (document.getElementById("upload-file") as HTMLInputElement).value = "";
      await loadPosts(token);
    } catch (e) {
      setError(e instanceof Error ? e.message : "上传失败");
    } finally {
      setLoading(false);
    }
  };

  // ── Edit ──
  const openEdit = async (postId: string) => {
    if (!token) return;
    try {
      const resp = await apiFetch(token, "/api/posts/" + encodeURIComponent(postId));
      if (!resp.ok) throw new Error("获取博客失败");
      const p = (await resp.json()) as PostItem;
      setEditing(p);
      setEditTitle(p.title || "");
      setEditDigest(p.digest || "");
      setEditDate(p.date || "");
      setEditAuthor(p.author || "");
      setEditImage(p.image || "");
      setEditTags((p.tags || []).join(", "));
      setEditContent(p.markdown || "");
    } catch (e) {
      setError(e instanceof Error ? e.message : "获取博客失败");
    }
  };

  const handleEdit = async () => {
    if (!token || !editing) return;
    setLoading(true);
    setError(null);
    try {
      const body = {
        title: editTitle,
        digest: editDigest,
        date: editDate,
        author: editAuthor || null,
        image: editImage || null,
        tags: editTags.split(",").map((t: string) => t.trim()).filter(Boolean),
        content: editContent,
      };
      const resp = await apiFetch(token, "/api/posts/" + encodeURIComponent(editing.id), {
        method: "PUT",
        body: JSON.stringify(body),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || "保存失败");
      setEditing(null);
      setSuccess("已更新：" + data.title);
      await loadPosts(token);
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
    } finally {
      setLoading(false);
    }
  };

  // ── Delete ──
  const handleDelete = async (postId: string) => {
    if (!token) return;
    if (!confirm("确定删除这篇博客吗？此操作不可撤销。")) return;
    setLoading(true);
    setError(null);
    try {
      const resp = await apiFetch(token, "/api/posts/" + encodeURIComponent(postId), {
        method: "DELETE",
      });
      if (!resp.ok) {
        const data = await resp.json();
        throw new Error(data.error || "删除失败");
      }
      setSuccess("已删除");
      await loadPosts(token);
    } catch (e) {
      setError(e instanceof Error ? e.message : "删除失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-base-200 py-6 px-4">
      {/* ── Login Stage ── */}
      {stage === "login" && (
        <section className="mx-auto max-w-md card bg-base-100 shadow-xl">
          <div className="card-body">
            <h1 className="card-title text-2xl">Dashboard</h1>
            <p className="text-sm opacity-70">N4Gasaki 管理后台 · 仅限管理员</p>
            {error && <div className="alert alert-error"><span>{error}</span></div>}
            <div className="form-control">
              <label className="label"><span className="label-text">管理员邮箱</span></label>
              <input className="input input-bordered" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text">密码</span></label>
              <input type="password" className="input input-bordered" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="请输入密码" />
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <button className="btn btn-ghost" onClick={handleUseStoredToken} disabled={loading || checking}>使用已登录令牌</button>
              <button className="btn btn-primary" onClick={handleLogin} disabled={loading || checking}>{loading || checking ? "验证中..." : "登录"}</button>
            </div>
          </div>
        </section>
      )}

      {/* ── Forbidden Stage ── */}
      {stage === "forbidden" && (
        <section className="mx-auto max-w-md card bg-base-100 shadow-xl">
          <div className="card-body">
            <div className="alert alert-warning">
              <div>
                <p className="font-semibold">403 Forbidden</p>
                <p className="text-sm">当前账号不是管理员，禁止访问后台。</p>
                {nickname ? <p className="text-xs opacity-70">当前账号：{nickname}</p> : null}
              </div>
            </div>
            <a href="https://n4gasaki.icu/" className="btn btn-ghost btn-sm mt-4">← 返回主站</a>
          </div>
        </section>
      )}

      {/* ── Dashboard Stage ── */}
      {stage === "dashboard" && (
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-sm opacity-70">欢迎，{nickname}（Admin）</p>
            </div>
            <button className="btn btn-ghost" onClick={handleLogout}>退出</button>
          </div>

          {error && <div className="alert alert-error mb-4"><span>{error}</span><button className="btn btn-ghost btn-xs" onClick={() => setError(null)}>✕</button></div>}
          {success && <div className="alert alert-success mb-4"><span>{success}</span><button className="btn btn-ghost btn-xs" onClick={() => setSuccess(null)}>✕</button></div>}

          {/* Tab Navigation */}
          <div role="tablist" className="tabs tabs-box mb-4">
            <a role="tab" className={"tab" + (activeTab === "blogs" ? " tab-active" : "")} onClick={() => setActiveTab("blogs")}>📝 博客管理</a>
            <a role="tab" className={"tab" + (activeTab === "history" ? " tab-active" : "")} onClick={() => setActiveTab("history")}>🏗️ 建设历史</a>
          </div>

          {/* Tab: Blogs */}
          {activeTab === "blogs" && (
            <div className="space-y-6">
              {/* Upload */}
              <div className="card bg-base-100 shadow-sm">
                <div className="card-body">
                  <h2 className="card-title">上传新博客</h2>
                  <div className="flex gap-3 items-end flex-wrap">
                    <div className="form-control flex-1 min-w-64">
                      <input type="file" id="upload-file" accept=".md,text/markdown" className="file-input file-input-bordered" onChange={async (e) => {
                        const f = e.target.files?.[0] ?? null;
                        setFile(f);
                        if (f) await detectImages(f);
                        else { setImageRefs([]); setMarkdownContent(""); }
                      }} />
                      <label className="label"><span className="label-text-alt opacity-70">支持 YAML frontmatter。md 中的本地图片路径会被自动检测，请在下方补选对应文件。</span></label>
                    </div>
                    {imageRefs.length > 0 && (
                      <div className="bg-base-200 rounded-lg p-4 space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <p className="text-sm font-semibold">检测到 {imageRefs.length} 个本地图片引用</p>
                          <input type="file" id="folder-picker" className="hidden" {...{ webkitdirectory: "" } as any}
                            onChange={(e) => { if (e.target.files) matchFolder(e.target.files); }} />
                          <button className="btn btn-sm btn-outline" onClick={() => document.getElementById("folder-picker")?.click()}>
                            📁 选择文件夹自动匹配
                          </button>
                          <span className="text-xs opacity-70">已匹配 {imageRefs.filter((i) => i.file).length}/{imageRefs.length}</span>
                        </div>
                        {imageRefs.map((img, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <span className="text-xs font-mono truncate max-w-xs opacity-70">{img.ref}</span>
                            <input type="file" accept="image/*" className="file-input file-input-bordered file-input-sm flex-1"
                              onChange={(e) => {
                                const f = e.target.files?.[0] ?? null;
                                setImageRefs((prev) => prev.map((item, i) => i === idx ? { ...item, file: f } : item));
                              }}
                            />
                            {img.file && <span className="badge badge-success badge-sm">✓</span>}
                          </div>
                        ))}
                      </div>
                    )}
                    <button className="btn btn-primary" onClick={handleUpload} disabled={loading || !file || imageRefs.some((img) => !img.file)}>{loading ? "上传中..." : "上传并发布"}</button>
                  </div>
                </div>
              </div>

              {/* Posts Table */}
              <div className="card bg-base-100 shadow-sm">
                <div className="card-body">
                  <h2 className="card-title mb-3">管理博客文章 ({posts.length})</h2>
                  {posts.length === 0 ? (
                    <p className="text-base-content/50 text-center py-8">还没有文章，上传第一篇吧</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="table table-zebra table-sm">
                        <thead>
                          <tr>
                            <th>标题</th>
                            <th>日期</th>
                            <th>作者</th>
                            <th>操作</th>
                          </tr>
                        </thead>
                        <tbody>
                          {posts.map((p) => (
                            <tr key={p.id}>
                              <td><a href={"/blog/" + encodeURIComponent(p.id)} target="_blank" rel="noreferrer" className="link link-hover">{p.title}</a></td>
                              <td className="text-xs opacity-70">{p.date?.slice(0, 10)}</td>
                              <td className="text-xs opacity-70">{p.author || "-"}</td>
                              <td>
                                <div className="flex gap-1">
                                  <button className="btn btn-xs btn-outline btn-info" onClick={() => openEdit(p.id)}>编辑</button>
                                  <button className="btn btn-xs btn-outline btn-error" onClick={() => handleDelete(p.id)} disabled={loading}>删除</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tab: History */}
          {activeTab === "history" && (
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <h2 className="card-title">编辑建设历史</h2>
                <p className="text-sm opacity-70">
                  格式：使用 <code>---</code> 分隔条目，每组包含 group / version / date / digest 元数据，正文支持 Markdown。
                  参考 <a href="/gitversions" target="_blank" className="link">建设历史页面</a>。
                </p>
                <textarea
                  className="textarea textarea-bordered h-64 font-mono text-sm"
                  value={gvContent}
                  onChange={(e) => setGvContent(e.target.value)}
                  placeholder={`---\ngroup: V1 初显锦绣\nversion: 1.0\ndate: 2026-01-30\ndigest: 上线\n---\n\n## 更新内容\n...`}
                />
                <div className="flex justify-end mt-3">
                  <button className="btn btn-primary" onClick={saveGitversions} disabled={gvLoading}>
                    {gvLoading ? "保存中..." : "保存建设历史"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editing && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="text-lg font-bold mb-4">编辑博客</h3>
            <div className="flex flex-col gap-3">
              <label className="form-control">
                <span className="label-text">标题</span>
                <input className="input input-bordered" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
              </label>
              <label className="form-control">
                <span className="label-text">摘要</span>
                <input className="input input-bordered" value={editDigest} onChange={(e) => setEditDigest(e.target.value)} />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="form-control">
                  <span className="label-text">日期</span>
                  <input className="input input-bordered" value={editDate} onChange={(e) => setEditDate(e.target.value)} placeholder="YYYY-MM-DD" />
                </label>
                <label className="form-control">
                  <span className="label-text">作者</span>
                  <input className="input input-bordered" value={editAuthor} onChange={(e) => setEditAuthor(e.target.value)} />
                </label>
              </div>
              <label className="form-control">
                <span className="label-text">图片 URL</span>
                <input className="input input-bordered" value={editImage} onChange={(e) => setEditImage(e.target.value)} />
              </label>
              <label className="form-control">
                <span className="label-text">标签（逗号分隔）</span>
                <input className="input input-bordered" value={editTags} onChange={(e) => setEditTags(e.target.value)} />
              </label>
              <label className="form-control">
                <span className="label-text">内容（Markdown）</span>
                <textarea className="textarea textarea-bordered h-48" value={editContent} onChange={(e) => setEditContent(e.target.value)}
                  onPaste={async (e) => {
                    const items = e.clipboardData?.items;
                    if (!items) return;
                    for (let i = 0; i < items.length; i++) {
                      if (items[i].type.startsWith("image/")) {
                        e.preventDefault();
                        const blob = items[i].getAsFile();
                        if (!blob) continue;
                        const reader = new FileReader();
                        reader.onload = () => {
                          const dataUri = reader.result as string;
                          const alt = "image";
                          const md = "![" + alt + "](" + dataUri + ")";
                          const ta = document.getElementById("edit-content") as HTMLTextAreaElement;
                          if (ta) {
                            const start = ta.selectionStart;
                            const end = ta.selectionEnd;
                            const before = editContent.slice(0, start);
                            const after = editContent.slice(end);
                            const newContent = before + md + after;
                            setEditContent(newContent);
                            setTimeout(() => { ta.selectionStart = ta.selectionEnd = start + md.length; }, 0);
                          }
                        };
                        reader.readAsDataURL(blob);
                        break;
                      }
                    }
                  }}
                  id="edit-content" />
              </label>
            </div>
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setEditing(null)}>取消</button>
              <button className="btn btn-primary" onClick={handleEdit} disabled={loading}>{loading ? "保存中..." : "保存"}</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
