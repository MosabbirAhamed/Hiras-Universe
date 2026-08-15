/**
 * fileRepo.ts — Supabase migration shim
 * All exports are now served from supabaseRepo.ts.
 * This file exists only to preserve import paths across the codebase.
 * Do not add logic here.
 */
export {
  // Products
  getProducts,
  getProductsByIds,
  saveProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  // Categories
  getCategories,
  getCategoryById,
  saveCategories,
  // Homepage & Navigation
  getHomepageSections,
  saveHomepageSections,
  getNavigation,
  saveNavigation,
  // Settings & Theme
  getSettings,
  saveSettings,
  getTheme,
  saveTheme,
  // Pages
  getPages,
  getPageById,
  getPageBySlug,
  createPage,
  updatePage,
  deletePage,
  // Orders
  getOrders,
  saveOrders,
  getOrderById,
  getOrderByNumber,
  generateNextOrderNumber,
  createOrderWithInventoryDeduction,
  updateOrderStatus,
  // Notifications
  getNotificationLogs,
  saveNotificationLogs,
  logNotification,
  getNotificationsByOrderNumber,
} from './supabaseRepo'

export type { StoreSettings, PageRecord } from './supabaseRepo'
