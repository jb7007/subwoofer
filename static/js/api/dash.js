/**
 * Dashboard API Functions for Practice Tracker
 *
 * This module provides API functions specifically for dashboard data fetching.
 * It uses the unified dashboard stats endpoint that returns all chart data
 * and statistics in a single efficient API call.
 *
 * The dashboard stats endpoint provides:
 * - Cumulative practice chart data (all-time progress)
 * - Weekly practice chart data (current week daily totals)
 * - Daily practice gauge data (today's progress vs target)
 * - Summary statistics (totals, averages, most frequent items)
 */

import { fetchJson } from "./api-helper.js";

/**
 * Fetch all dashboard statistics and chart data in a single API call.
 *
 * This function calls the unified dashboard stats endpoint that provides
 * all necessary data for the dashboard page. The backend calculates all
 * chart data server-side for consistency and performance.
 *
 * @returns {Promise<Object>} API response containing:
 *   - cumulative: Data for all-time cumulative practice chart
 *   - weekly: Data for current week's daily practice chart
 *   - daily: Today's practice minutes and target for gauge
 *   - common_instrument: Most frequently used instrument
 *   - total_minutes: Lifetime total practice minutes
 *   - average_minutes: Average minutes per practice session
 *   - common_piece: Most frequently practiced piece
 *
 * @example
 * const result = await getDashboardStats();
 * if (result.ok) {
 *   const { cumulative, weekly, daily, total_minutes } = result.data;
 *   // Use data to render charts and update metrics
 * }
 */
export const getDashboardStats = () => fetchJson("/api/dashboard/stats");
