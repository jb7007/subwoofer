// dash.js

import { fetchJson } from "./apiHelper.js";

export const getDashStats = () => fetchJson("/api/dash-stats");
