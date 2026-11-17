import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-6 text-center">
      <p className="text-sm font-medium text-neutral-500">404</p>
      <h1 className="mt-3 text-3xl font-semibold text-neutral-900">
        页面不存在
      </h1>
      <p className="mt-3 text-base text-neutral-600">
        你访问的商品或页面可能已下架。
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex h-10 items-center rounded-full bg-neutral-900 px-5 text-sm font-medium text-white transition hover:bg-neutral-700"
      >
        返回首页
      </Link>
    </div>
  );
}
