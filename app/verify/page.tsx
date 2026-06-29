"use client";

export const dynamic = "force-dynamic";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost";

function VerifyClient() {
  const params = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState("验证中...");

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      setStatus("缺少验证参数");
      return;
    }
    const run = async () => {
      try {
        const resp = await fetch(
          `${API_BASE}/api/auth/verify?token=${encodeURIComponent(token)}`,
        );
        if (!resp.ok) {
          setStatus("验证失败或已过期");
          return;
        }
        const data: { message: string } = await resp.json();
        setStatus(data.message || "验证成功");
        setTimeout(() => router.push("/login"), 1500);
      } catch {
        setStatus("验证失败，请稍后重试");
      }
    };
    run();
  }, [params, router]);

  return (
    <div className="hero bg-base-200 min-h-screen">
      <div className="card bg-base-100 w-full max-w-lg shadow-2xl mx-auto">
        <div className="card-body items-center">
          <h1 className="text-2xl font-bold">邮箱验证</h1>
          <p className="text-base-content/70 mt-2">{status}</p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="hero bg-base-200 min-h-screen">
          <div className="card bg-base-100 w-full max-w-lg shadow-2xl mx-auto">
            <div className="card-body items-center">
              <h1 className="text-2xl font-bold">邮箱验证</h1>
              <p className="text-base-content/70 mt-2">验证中...</p>
            </div>
          </div>
        </div>
      }
    >
      <VerifyClient />
    </Suspense>
  );
}
