import { z } from "zod";

const slugSchema = z
  .string()
  .trim()
  .min(1, "请输入 slug")
  .max(80, "slug 最多 80 个字符")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "slug 只能包含小写字母、数字和中划线",
  );

export const adminProductSchema = z.object({
  name: z.string().trim().min(1, "请输入商品名称").max(120, "商品名称过长"),
  slug: slugSchema,
  description: z
    .string()
    .trim()
    .min(1, "请输入商品描述")
    .max(2000, "商品描述过长"),
  priceCents: z
    .number()
    .int()
    .min(0, "价格不能为负")
    .max(100_000_000, "价格过大"),
  stock: z
    .number()
    .int()
    .min(0, "库存不能为负")
    .max(1_000_000, "库存过大"),
  imageUrl: z
    .string()
    .trim()
    .max(500, "图片地址过长")
    .optional()
    .refine(
      (value) =>
        !value ||
        (value.startsWith("/") && !value.startsWith("//")) ||
        /^https?:\/\//i.test(value),
      "图片地址必须是站内路径或 http(s) URL",
    ),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  categoryId: z.string().trim().min(1, "请选择分类"),
  sortOrder: z
    .number()
    .int()
    .min(0, "排序不能为负")
    .max(100_000, "排序过大")
    .default(0),
});

export const adminCategorySchema = z.object({
  name: z.string().trim().min(1, "请输入分类名称").max(50, "分类名称过长"),
  slug: slugSchema,
  description: z.string().trim().max(200, "分类描述过长").optional(),
  sortOrder: z
    .number()
    .int()
    .min(0, "排序不能为负")
    .max(100_000, "排序过大")
    .default(0),
});

export const adminOrderStatusSchema = z.object({
  status: z.enum(["PAID", "SHIPPED", "COMPLETED", "CANCELLED"]),
});

export type AdminProductInput = z.infer<typeof adminProductSchema>;
export type AdminCategoryInput = z.infer<typeof adminCategorySchema>;
export type AdminOrderStatusInput = z.infer<typeof adminOrderStatusSchema>;
