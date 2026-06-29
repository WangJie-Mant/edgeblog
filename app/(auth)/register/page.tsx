"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import InputNickname from "@/app/components/InputBranch/InputNickname";
import InputEmail from "@/app/components/InputBranch/InputEmail";
import InputPassword from "@/app/components/InputBranch/InputPassword";
import { useAuth } from "@/app/components/auth/AuthProvider";

function validateEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}
function validateNickname(v: string) {
  return /^[A-Za-z][A-Za-z0-9-]{2,29}$/.test(v);
}
function validatePassword(v: string) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(v);
}

export default function Regist() {
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();
  const { login } = useAuth();

  const pwLen = password.length >= 8;
  const pwLower = /[a-z]/.test(password);
  const pwUpper = /[A-Z]/.test(password);
  const pwDigit = /\d/.test(password);
  const passwordInvalid =
    password.length > 0 && !(pwLen && pwLower && pwUpper && pwDigit);
  const mismatch = confirmPassword.length > 0 && password !== confirmPassword;

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSendCode = async () => {
    const emailValue = email.trim();
    if (cooldown > 0) return;
    if (!validateEmail(emailValue)) {
      setError("邮箱格式不正确");
      return;
    }
    setSending(true);
    setError(null);
    setSuccess(null);
    try {
      const resp = await fetch(`/api/auth/send-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailValue }),
      });
      if (resp.status === 409) {
        throw new Error("该邮箱已被注册");
      }
      if (!resp.ok) {
        throw new Error(`发送失败: ${resp.status}`);
      }
      const data: { message: string } = await resp.json();
      setSuccess(data.message || "验证码已发送，请检查邮箱");
      setCooldown(60);
    } catch (e) {
      setError(e instanceof Error ? e.message : "发送失败");
    } finally {
      setSending(false);
    }
  };

  const handleRegist = async () => {
    // client-side checks
    const nicknameValue = nickname.trim();
    const emailValue = email.trim();
    const codeValue = code.trim();
    if (!validateNickname(nicknameValue)) {
      setError("昵称需3-30位，以字母开头，只含字母/数字/短横线");
      return;
    }
    if (!validateEmail(emailValue)) {
      setError("邮箱格式不正确");
      return;
    }
    if (!validatePassword(password)) {
      setError("密码至少8位，需包含大小写字母和数字");
      return;
    }
    if (codeValue.length !== 6) {
      setError("请输入 6 位邮箱验证码");
      return;
    }
    if (password !== confirmPassword) {
      // 在确认密码输入下方已有提示，不重复显示全局错误
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const resp = await fetch(`/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailValue,
          nickname: nicknameValue,
          password,
          code: codeValue,
        }),
      });
      if (resp.status === 409) {
        throw new Error("该邮箱已被注册");
      }
      if (!resp.ok) {
        throw new Error(`注册失败: ${resp.status}`);
      }
      const data: { token: string } = await resp.json();
      await login(data.token);
      router.push("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "注册失败");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="hero bg-base-200 min-h-screen">
      <div className="hero-content flex-col lg:flex-row-reverse">
        <div className="text-center lg:text-left">
          <h1 className="text-5xl font-bold">欢迎</h1>
          <p className="py-6">注册新账号，让大家知道你是谁</p>
        </div>
        <div className="card bg-base-100 w-[720px] max-w-3xl shadow-2xl mx-auto">
          <div className="card-body items-center">
            <div className="flex flex-col gap-4 items-center w-full">
              <div className="flex items-center gap-3 w-full max-w-md">
                <span className="w-20 text-right font-bold">昵称</span>
                <div className="flex-1">
                  <InputNickname
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                  />
                </div>
              </div>
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
                <span className="w-20 text-right font-bold">验证码</span>
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    className="input input-bordered flex-1"
                    placeholder="6位验证码"
                    value={code}
                    onChange={(e) => setCode(e.target.value.trim())}
                  />
                  <button
                    className={`btn ${sending || cooldown > 0 ? "btn-disabled opacity-70" : "btn-outline"}`}
                    onClick={handleSendCode}
                    disabled={sending || cooldown > 0}
                  >
                    {sending ? (
                      "发送中"
                    ) : cooldown > 0 ? (
                      <span className="flex items-center gap-2">
                        <span className="loading loading-spinner loading-xs" />
                        <span>重新发送</span>
                        <span className="badge badge-ghost">{cooldown}s</span>
                      </span>
                    ) : (
                      "发送验证码"
                    )}
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full max-w-md">
                <span className="w-20 text-right font-bold">密码</span>
                <div className="flex-1">
                  <InputPassword
                    showHints={false}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
              {passwordInvalid && (
                <ul className="text-error text-sm mt-1 w-full max-w-md ml-[5.5rem]">
                  {!pwLen && <li>至少 8 位</li>}
                  {!pwDigit && <li>至少一个数字</li>}
                  {!pwLower && <li>至少一个小写字母</li>}
                  {!pwUpper && <li>至少一个大写字母</li>}
                </ul>
              )}
              <div className="flex items-center gap-3 w-full max-w-md">
                <span className="w-20 text-right font-bold">确认密码</span>
                <div className="flex-1">
                  <InputPassword
                    showHints={false}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
              {mismatch && (
                <div className="text-error text-sm mt-1 w-full max-w-md ml-[5.5rem]">
                  两次密码不一致
                </div>
              )}
            </div>
            <div className="w-full flex justify-end">
              <button
                className="btn btn-neutral"
                onClick={handleRegist}
                disabled={loading}
              >
                {loading ? "注册中..." : "注册"}
              </button>
            </div>
            {error && (
              <div className="text-error pt-2 w-full text-right">{error}</div>
            )}
            {success && (
              <div className="text-success pt-2 w-full text-right">
                {success}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
