"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import {
  adminInputClass,
  adminLabelClass,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
  adminTextareaClass,
} from "@/components/admin/form-styles";

export type AdminProductFormValue = {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  stock: number;
  imageUrl: string | null;
  status: string;
  categoryId: string;
  sortOrder: number;
  updatedAt: string;
};

type CategoryOption = {
  id: string;
  name: string;
};

type ProductFormProps = {
  categories: CategoryOption[];
  product?: AdminProductFormValue;
};

export function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const isEditing = Boolean(product);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);

    const formData = new FormData(event.currentTarget);
    const priceYuan = Number(formData.get("priceYuan"));
    const stock = Number(formData.get("stock"));
    const sortOrder = Number(formData.get("sortOrder") ?? 0);

    if (!Number.isFinite(priceYuan) || priceYuan < 0) {
      setError("请输入有效的价格");
      setPending(false);
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      setError("库存必须是非负整数");
      setPending(false);
      return;
    }

    const payload = {
      name: String(formData.get("name") ?? "").trim(),
      slug: String(formData.get("slug") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim(),
      priceCents: Math.round(priceYuan * 100),
      stock,
      imageUrl: String(formData.get("imageUrl") ?? "").trim(),
      status: String(formData.get("status") ?? "ACTIVE"),
      categoryId: String(formData.get("categoryId") ?? ""),
      sortOrder: Number.isInteger(sortOrder) ? sortOrder : 0,
      ...(product ? { version: product.updatedAt } : {}),
    };

    try {
      const response = await fetch(
        isEditing
          ? `/api/admin/products/${product?.id}`
          : "/api/admin/products",
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (response.status === 403) {
        window.alert("无权限访问");
        router.push("/");
        return;
      }

      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        setError(data?.error ?? "保存失败，请稍后重试");
        return;
      }

      router.push("/admin/products");
      router.refresh();
    } catch {
      setError("网络异常，请稍后重试");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={adminLabelClass}>
          商品名称
          <input
            name="name"
            required
            maxLength={120}
            defaultValue={product?.name ?? ""}
            className={adminInputClass}
          />
        </label>

        <label className={adminLabelClass}>
          slug
          <input
            name="slug"
            required
            maxLength={80}
            defaultValue={product?.slug ?? ""}
            placeholder="例如 wireless-headphones"
            className={adminInputClass}
          />
        </label>

        <label className={adminLabelClass}>
          分类
          <select
            name="categoryId"
            required
            defaultValue={product?.categoryId ?? categories[0]?.id ?? ""}
            className={adminInputClass}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className={adminLabelClass}>
          状态
          <select
            name="status"
            defaultValue={product?.status ?? "ACTIVE"}
            className={adminInputClass}
          >
            <option value="ACTIVE">上架</option>
            <option value="INACTIVE">下架</option>
          </select>
        </label>

        <label className={adminLabelClass}>
          价格（元）
          <input
            name="priceYuan"
            type="number"
            min="0"
            step="0.01"
            required
            defaultValue={
              product ? (product.priceCents / 100).toFixed(2) : ""
            }
            className={adminInputClass}
          />
        </label>

        <label className={adminLabelClass}>
          库存
          <input
            name="stock"
            type="number"
            min="0"
            step="1"
            required
            defaultValue={product?.stock ?? 0}
            className={adminInputClass}
          />
        </label>

        <label className={adminLabelClass}>
          排序
          <input
            name="sortOrder"
            type="number"
            min="0"
            step="1"
            defaultValue={product?.sortOrder ?? 0}
            className={adminInputClass}
          />
        </label>

        <label className={adminLabelClass}>
          图片地址（可选）
          <input
            name="imageUrl"
            maxLength={500}
            defaultValue={product?.imageUrl ?? ""}
            placeholder="/images/products/example.jpg"
            className={adminInputClass}
          />
        </label>
      </div>

      <label className={adminLabelClass}>
        商品描述
        <textarea
          name="description"
          required
          maxLength={2000}
          defaultValue={product?.description ?? ""}
          className={adminTextareaClass}
        />
      </label>

      {error ? (
        <p
          role="alert"
          className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600"
        >
          {error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          className={adminPrimaryButtonClass}
        >
          {pending ? "保存中…" : isEditing ? "保存修改" : "创建商品"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className={adminSecondaryButtonClass}
        >
          取消
        </button>
      </div>
    </form>
  );
}
