"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";

type VersionEntry = {
  group?: string;
  version?: string;
  name?: string;
  digest?: string;
  degist?: string;
  date?: string;
  content: string;
};

function parseEntries(raw: string): VersionEntry[] {
  const lines = raw.split(/\r?\n/);
  const entries: VersionEntry[] = [];
  let i = 0;
  while (i < lines.length) {
    while (i < lines.length && !lines[i].trim()) i++;
    if (i >= lines.length) break;
    if (lines[i].trim() !== "---") { i++; continue; }
    i++;
    const meta: Record<string, string> = {};
    while (i < lines.length && lines[i].trim() !== "---") {
      const line = lines[i].trim();
      if (line) {
        const idx = line.indexOf(":");
        if (idx > 0) {
          const key = line.slice(0, idx).trim();
          const value = line.slice(idx + 1).trim().replace(/^"|"$/g, "");
          meta[key] = value;
        }
      }
      i++;
    }
    if (lines[i]?.trim() === "---") i++;
    const body: string[] = [];
    while (i < lines.length && lines[i].trim() !== "---") {
      body.push(lines[i]);
      i++;
    }
    const content = body.join("\n").trim();
    entries.push({
      group: meta.group,
      version: meta.version,
      name: meta.name,
      digest: meta.digest,
      degist: meta.degist,
      date: meta.date,
      content,
    });
  }
  return entries.filter((e) => e.version || e.content);
}

function formatMonthDay(date?: string) {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return date;
  return String(d.getMonth() + 1).padStart(2, "0") + "/" + String(d.getDate()).padStart(2, "0");
}

function renderDiffBlock(code: string) {
  const lines = code.replace(/\n$/, "").split("\n");
  return (
    <pre className="rounded-lg bg-neutral/90 p-4 text-sm leading-6">
      <code className="block whitespace-pre-wrap font-mono">
        {lines.map((line, idx) => {
          let cls = "text-base-200/80";
          if (line.startsWith("+")) cls = "text-green-300";
          else if (line.startsWith("-")) cls = "text-red-300";
          else if (line.startsWith("@@")) cls = "text-yellow-300";
          else if (line.startsWith("diff") || line.startsWith("index")) cls = "text-base-200/60";
          return <span key={idx} className={"block " + cls}>{line || " "}</span>;
        })}
      </code>
    </pre>
  );
}

export default function GitVersionsPage() {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/gitversions");
        if (!res.ok) throw new Error("加载失败: " + res.status);
        const data = await res.json();
        setContent(data.content || "");
      } catch (e) {
        setError(e instanceof Error ? e.message : "加载失败");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <main className="min-h-screen bg-base-200/30 px-4 py-16"><div className="text-center">加载中...</div></main>;
  if (error) return <main className="min-h-screen bg-base-200/30 px-4 py-16"><div className="alert alert-error">{error}</div></main>;

  const entries = content ? parseEntries(content) : [];
  const groups: { name: string; items: VersionEntry[] }[] = [];
  const groupIndex = new Map<string, number>();
  const fallbackGroup = "未分组";
  entries.forEach((entry) => {
    const groupName = entry.group?.trim() || fallbackGroup;
    const existingIndex = groupIndex.get(groupName);
    if (existingIndex === undefined) {
      groupIndex.set(groupName, groups.length);
      groups.push({ name: groupName, items: [entry] });
    } else {
      groups[existingIndex].items.push(entry);
    }
  });

  return (
    <main className="min-h-screen bg-base-200/30 px-4 py-16">
      <div className="mx-auto flex w-full max-w-none flex-col items-start">
        <div className="mb-12 w-full text-left">
          <h1 className="text-3xl font-bold">站点维护日志</h1>
          <p className="mt-2 text-base-content/70">大海航行靠舵手</p>
        </div>
        {groups.map((group) => (
          <section key={group.name} className="mb-12 w-full">
            <h2 className="mb-6 text-2xl font-semibold">{group.name}</h2>
            <ul className="timeline timeline-vertical timeline-snap-icon timeline-compact w-full">
              {group.items.map((entry, index) => {
                const monthDay = formatMonthDay(entry.date);
                const summary = entry.name ?? entry.digest ?? entry.degist;
                return (
                  <li key={group.name + "-" + (entry.version ?? "entry") + "-" + index}>
                    <hr className="bg-base-300" />
                    <div className="timeline-middle">
                      <span className="inline-block h-3 w-3 rounded-full bg-primary" />
                    </div>
                    {monthDay && (
                      <div className="timeline-start text-sm text-base-content/70">
                        <span className="badge badge-neutral badge-sm">{monthDay}</span>
                      </div>
                    )}
                    <div className="timeline-end w-full pb-10">
                      <div className="card w-full max-w-none border border-base-200 bg-base-100 shadow-xl">
                        <div className="card-body min-h-40 py-6">
                          <div className="flex flex-wrap items-center gap-2">
                            {entry.date && <div className="badge badge-neutral badge-sm">{entry.date}</div>}
                            {entry.version && <div className="badge badge-outline">v{entry.version}</div>}
                          </div>
                          <h3 className="card-title text-xl">{summary ?? "版本更新"}</h3>
                          <div className="collapse collapse-arrow w-full border border-base-200 bg-base-100">
                            <input type="checkbox" />
                            <div className="collapse-title px-0 text-sm font-medium text-base-content/70 mx-3">做了什么？详细看看</div>
                            <div className="collapse-content px-0">
                              {entry.content ? (
                                <div className="prose max-w-none pl-3 text-base-content">
                                  <ReactMarkdown
                                    remarkPlugins={[remarkBreaks]}
                                    components={{
                                      code({ className, children }) {
                                        const match = /language-(\w+)/.exec(className || "");
                                        const lang = match?.[1];
                                        const raw = String(children).replace(/\n$/, "");
                                        if (lang === "diff") return renderDiffBlock(raw);
                                        return <code className={className}>{children}</code>;
                                      },
                                    }}
                                  >
                                    {entry.content}
                                  </ReactMarkdown>
                                </div>
                              ) : (
                                <p className="text-base-content/70">暂无记录</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <hr className="bg-base-300" />
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}
