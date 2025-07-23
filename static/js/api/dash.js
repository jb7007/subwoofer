// dash.js
import { fetchJson } from "./api-helper.js";

export const getDashboardStats = () => fetchJson("/api/dashboard/stats");
