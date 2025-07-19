// dash.js

import { fetchJson } from "./api-helper.js";

export const getDashStats = () => fetchJson("/api/dash-stats");
