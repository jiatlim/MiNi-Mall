export const SITE_NAME = "Mini Mall";

export const PRODUCTS_PAGE_SIZE = 9;

export const MAX_CART_QUANTITY = 999;

export const ORDERS_PAGE_SIZE = 10;

export const PRODUCT_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
} as const;

export type ProductStatus = (typeof PRODUCT_STATUS)[keyof typeof PRODUCT_STATUS];

export const USER_ROLES = {
  USER: "USER",
  ADMIN: "ADMIN",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const ORDER_STATUS = {
  PENDING: "PENDING",
  PAID: "PAID",
  SHIPPED: "SHIPPED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "待付款",
  PAID: "已支付",
  SHIPPED: "已发货",
  COMPLETED: "已完成",
  CANCELLED: "已取消",
};
