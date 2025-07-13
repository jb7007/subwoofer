// utils.js

export const logsNotFound = (logs) => {
  if (!logs || logs.length === 0) {
    return true;
  }
  return false;
};

export function getTodayISO() {
  return new Date().toLocaleString("sv-SE").split(" ")[0];
}

export function getDaysLogs(logs, targetDate = getTodayISO()) {
  return logs.filter((log) => log.isodate === targetDate);
}

export function totalLogMins(logs) {
  return logs.reduce((sum, log) => sum + log.duration, 0);
}

export function getDailyGraphVal(logs) {
  if (logsNotFound(logs)) {
    return 0;
  } else {
    const today = getTodayISO();
    const todayLogs = getDaysLogs(logs, today);
    return totalLogMins(todayLogs);
  }
}

export function setAsTmrw(date) {
  date.setDate(date.getDate() + 1);
}

export function setTextContent(id, text) {
  document.getElementById(id).textContent = text;
}
