// Plain JavaScript project → shared "types" are JSDoc typedefs + shared constants,
// importable from both apps/web and apps/api.

export const USER_ROLES = ["customer", "staff", "admin"];

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "shipped",
  "delivered",
  "returned",
  "cancelled",
];

export const PAYMENT_METHODS = ["bkash", "nagad", "card", "cod"];

/**
 * @typedef {Object} CategoryNode
 * @property {string} _id
 * @property {string} name
 * @property {string} slug
 * @property {string|null} parentId
 * @property {0|1} level
 * @property {{ name: string, slug: string }[]} [brands]
 */

/**
 * @typedef {Object} ProductSummary
 * @property {string} _id
 * @property {string} title
 * @property {string} slug
 * @property {number} price
 * @property {number} [discountPrice]
 * @property {string[]} images
 * @property {boolean} isFeatured
 */
