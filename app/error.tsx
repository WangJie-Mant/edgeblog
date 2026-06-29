"use client";
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="card bg-base-100 shadow-lg w-[90vw] max-w-2xl">
        <div className="card-body">
          <h2 className="card-title text-3xl">出错了！</h2>
          <p className="text-base-content/70">
            {error.message || "发生了意外错误"}
          </p>
          <div className="card-actions justify-end">
            <button className="btn btn-primary" onClick={() => reset()}>
              重试
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
