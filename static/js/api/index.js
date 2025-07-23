/**
 * API Module Exports for Practice Tracker
 *
 * This module centralizes all API function exports, making it easy to import
 * any API function from a single location. It re-exports functions from
 * specialized API modules for different application features.
 *
 * Available API Functions:
 * - Authentication: login, register, logout functions
 * - Dashboard: getDashboardStats for unified dashboard data
 * - Logs: practice log CRUD operations and recent logs
 *
 * Usage:
 *   import { getDashboardStats, recentLogs, login } from "../api/index.js";
 */

// Re-export all authentication API functions
export * from "./auth.js";

// Re-export all dashboard API functions
export * from "./dash.js";

// Re-export all practice log API functions
export * from "./logs.js";
