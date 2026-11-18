import { z } from "zod";

import { MAX_CART_QUANTITY } from "@/lib/constants";

const quantitySchema = z.coerce
  .number()
  .int()
  .min(1, "数量至少为 1")
  .max(MAX_CART_QUANTITY, `单个商品最多 ${MAX_CART_QUANTITY} 件`);

export const addToCartSchema = z.object({
  productId: z.string().trim().min(1, "缺少商品 ID").max(64, "商品 ID 过长"),
  quantity: quantitySchema.default(1),
});

export const updateCartItemSchema = z.object({
  quantity: quantitySchema,
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
