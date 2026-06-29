export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="card bg-base-100 shadow-lg w-[90vw] max-w-2xl">
        <div className="card-body">
          <h2 className="card-title text-3xl">什么？！</h2>
          <p className="text-base-content/70">
            你访问的页面不存在或是出错了，很遗憾，这很有可能是我还没做这部分 :|
          </p>
          <p className="text-base-content/60">请检查链接或返回首页。</p>
          <div className="card-actions justify-end">
            <a className="btn btn-primary" href="/">
              返回首页
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
