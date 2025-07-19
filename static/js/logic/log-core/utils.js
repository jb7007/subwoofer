// log-core/utils.js

let logsData = []; // raw logs fetched from Flask
let currentSort = { field: "date", asc: false };

// getter so other files can access logsData safely
// TODO: fix and refactor sorting log logic
export function setLogsData(data) {
  logsData = data;
}

export function sortLogs(field) {
  if (currentSort.field === field) {
    currentSort.asc = !currentSort.asc;
  } else {
    currentSort.field = field;
    currentSort.asc = true;
  }

  const sorted = [...logsData].sort((a, b) => {
    let valA = a[field];
    let valB = b[field];
    if (field === "date") {
      valA = new Date(valA);
      valB = new Date(valB);
    }
    if (valA < valB) return currentSort.asc ? -1 : 1;
    if (valA > valB) return currentSort.asc ? 1 : -1;
    return 0;
  });

  renderLogs(sorted);
}