"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import InputEmail from "@/app/components/InputBranch/InputEmail";
import InputPassword from "@/app/components/InputBranch/InputPassword";
import { useAuth } from "@/app/components/auth/AuthProvider";

type Stage = "login" | "password-reset" | "verify-code" | "new-password";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>("login");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async () => {
    const emailValue = email.trim();
    if (!emailValue || !password) {
      setError("请输入邮箱与密码");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailValue, password }),
      });
      const data = await resp.json();

      if (data.error === "password-reset-required") {
        setStage("password-reset");
        setError(null);
        return;
      }

      if (resp.status === 403) {
        throw new Error("邮箱未验证，请先完成验证");
      }
      if (resp.status === 401) {
        throw new Error("邮箱或密码错误");
      }
      if (!resp.ok) throw new Error(`登录失败: ${resp.status}`);

      await login(data.token);
      router.push("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "登录失败");
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = async () => {
    const emailValue = email.trim();
    if (!emailValue) {
      setError("请输入邮箱");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`/api/auth/send-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailValue }),
      });
      if (!resp.ok) throw new Error("验证码发送失败");
      setStage("verify-code");
    } catch (e) {
      setError(e instanceof Error ? e.message : "验证码发送失败");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code || !newPassword) {
      setError("请输入验证码和新密码");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(`/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          code,
          password: newPassword,
        }),
      });
      if (!resp.ok) throw new Error("密码重置失败");
      const data = await resp.json();
      await login(data.token);
      router.push("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "密码重置失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hero bg-base-200 min-h-screen">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <div className="text-center lg:text-left">
          <h1 className="text-5xl font-bold">恭候多时。</h1>
          <p className="py-6">
            {stage === "login"
              ? "欢迎回来！请登录来让大家知道你是谁。"
              : "需要重置密码？我们来帮你。"}
          </p>
        </div>
        <div className="card bg-base-100 w-[720px] max-w-3xl shadow-2xl mx-auto">
          <div className="card-body items-center">
            <div className="flex flex-col gap-4 items-center w-full">
              {stage === "login" && (
                <>
                  <div className="flex items-center gap-3 w-full max-w-md">
                    <span className="w-20 text-right font-bold">邮箱</span>
                    <div className="flex-1">
                      <InputEmail
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full max-w-md">
                    <span className="w-20 text-right font-bold">密码</span>
                    <div className="flex-1">
                      <InputPassword
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}

              {stage === "password-reset" && (
                <div className="flex items-center gap-3 w-full max-w-md">
                  <span className="w-20 text-right font-bold">邮箱</span>
                  <div className="flex-1">
                    <InputEmail
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled
                    />
                  </div>
                </div>
              )}

              {stage === "verify-code" && (
                <>
                  <div className="w-full max-w-md">
                    <label className="label">
                      <span className="label-text font-bold">验证码</span>
                    </label>
                    <input
                      type="text"
                      placeholder="请输入邮箱中收到的6位验证码"
                      className="input input-bordered w-full"
                      value={code}
                      onChange={(e) => setCode(e.target.value.slice(0, 6))}
                    />
                  </div>
                  <div className="w-full max-w-md">
                    <label className="label">
                      <span className="label-text font-bold">新密码</span>
                    </label>
                    <InputPassword
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="请设置新密码"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="w-full max-w-md flex justify-start pt-2">
              {stage === "login" && (
                <button
                  className="link link-hover"
                  onClick={() => {
                    setStage("password-reset");
                    setError(null);
                    setPassword("");
                  }}
                >
                  忘记密码？
                </button>
              )}
            </div>
            <div className="w-full max-w-md flex justify-start pt-1">
              {stage === "login" && (
                <a className="link link-hover" href="/register">
                  还没有账号？点击注册
                </a>
              )}
            </div>

            <div className="w-full flex justify-end gap-2">
              {(stage === "password-reset" || stage === "verify-code") && (
                <button
                  className="btn btn-ghost"
                  onClick={() => {
                    setStage("login");
                    setError(null);
                    setCode("");
                    setNewPassword("");
                  }}
                  disabled={loading}
                >
                  返回
                </button>
              )}
              <button
                className="btn btn-neutral"
                onClick={
                  stage === "login"
                    ? handleLogin
                    : stage === "password-reset"
                      ? handleSendCode
                      : handleVerifyCode
                }
                disabled={loading}
              >
                {loading
                  ? stage === "login"
                    ? "登录中..."
                    : stage === "password-reset"
                      ? "发送验证码中..."
                      : "重置中..."
                  : stage === "login"
                    ? "登录"
                    : stage === "password-reset"
                      ? "发送验证码"
                      : "重置密码"}
              </button>
            </div>
            {error && (
              <div className="text-error pt-2 w-full text-right">{error}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
