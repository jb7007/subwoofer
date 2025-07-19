// log-core/log-helper.js

import { renderLogs } from "./utils.js";
import { submitLog, fetchLogs } from "./api.js";
import { closeModal } from "../modals/modal-setup.js";
import { instrumentMap } from "../utils.js"; // maps instrument codes to names
import { logAnimateModalOut } from "../modals/modal-setup.js";

export function getLogData() {
    // !ANCHOR Sending Log Data
      /*
      SENT DATA:
      - log.local_date
      - log.utc_timestamp
      - log.duration
      - log.instrument
      - log.piece
      - log.composer
      - log.notes

      REMAINING DATA    (initialized by backend):
      - log.id          (increments user log number index)
      - log.updated_at  (uses log.utc_timestamp)
      */
    const logData = {
      local_date: document.getElementById("logDate").value,
      utc_timestamp: new Date().toISOString(),

      duration: parseInt(document.getElementById("logDuration").value),
      instrument: document.getElementById("instrument").value,
      piece: pieceTitle,
      composer: composer,
      notes: document.getElementById("logNotes")?.value || null,
    };

    return logData;
}

export async function postLog(logData) {
    try {
      const { ok, data } = await submitLog(logData);
      console.log(ok);
      if (!ok) {
        alert(data.message || "Log failed.");
        return;
      }

      // 1) Animate out if available, else just close
      const modalEl = document.getElementById("logModal");
      if (typeof logAnimateModalOut === "function") {
        logAnimateModalOut();
      } else {
        closeModal(modalEl);
      }

      // 2) Re-fetch logs and update table
      const { ok: fetchOk, data: logs } = await fetchLogs();
      if (fetchOk) {
        renderLogs(logs);
      }
    } catch {
      alert("network error.");
    }
}

export function renderLogs(logs) {
  const tableBody = document.getElementById("log-table-body");
  if (!tableBody) return;

  tableBody.innerHTML = ""; // Clear current rows

  logs.forEach((log) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${log.id}</td>
      <td>${log.display_date}</td>
      <td>${log.duration}</td>
      <td>${instrumentMap[log.instrument] || log.instrument}</td>
      <td>${log.piece}</td>
      <td>${log.composer || "N/A"}</td>
      <td>${log.notes}</td>
    `;

    tableBody.appendChild(row);
  });
}