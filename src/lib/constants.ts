export const SITE_NAME = "Mini Mall";

export const PRODUCTS_PAGE_SIZE = 9;

export const PRODUCT_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
} as const;

export type ProductStatus = (typeof PRODUCT_STATUS)[keyof typeof PRODUCT_STATUS];
