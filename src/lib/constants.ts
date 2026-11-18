export const SITE_NAME = "Mini Mall";

export const PRODUCTS_PAGE_SIZE = 9;

export const MAX_CART_QUANTITY = 999;

export const ORDERS_PAGE_SIZE = 10;

export const ADMIN_PAGE_SIZE = 10;

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  ACTIVE: "上架",
  INACTIVE: "下架",
};

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

export const ORDER_ADMIN_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: [ORDER_STATUS.PAID, ORDER_STATUS.CANCELLED],
  PAID: [ORDER_STATUS.SHIPPED, ORDER_STATUS.CANCELLED],
  SHIPPED: [ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED],
  COMPLETED: [ORDER_STATUS.CANCELLED],
  CANCELLED: [],
};
