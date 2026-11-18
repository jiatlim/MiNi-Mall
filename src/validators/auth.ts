import { z } from "zod";

const MAX_PASSWORD_BYTES = 72;

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(254, "邮箱过长")
  .pipe(z.email("请输入有效的邮箱地址"));

const passwordSchema = z
  .string()
  .min(6, "密码至少 6 位")
  .refine(
    (value) => new TextEncoder().encode(value).length <= MAX_PASSWORD_BYTES,
    "密码最多 72 字节",
  );

const loginPasswordSchema = z
  .string()
  .min(1, "请输入密码")
  .refine(
    (value) => new TextEncoder().encode(value).length <= MAX_PASSWORD_BYTES,
    "密码最多 72 字节",
  );

export const registerSchema = z.object({
  name: z.string().trim().max(30, "昵称最多 30 个字符").optional(),
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: loginPasswordSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
