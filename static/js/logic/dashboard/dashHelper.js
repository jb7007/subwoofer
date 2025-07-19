// dashHelper.js
// provides helper functions for dashboard logic files

import { instrumentMap } from "../../instrument-map.js"

export function renderAsTxt(
  htmlId,
  minuteTime,
  numeric = false,
  hasAffix = false
) {
  const practiceText = document.getElementById(htmlId);

  if (minuteTime === 0) {
    if (numeric) {
      practiceText.innerHTML = `<em>${minuteTime} minutes</em>`;
    } else {
      if (hasAffix) {
        practiceText.parentElement.innerHTML = `<em>Nothing logged yet.</em>`;
      } else {
        practiceText.innerHTML = `<em>Nothing logged yet.</em>`;
      }
    }
  } else if (minuteTime < 60) {
    practiceText.innerHTML = `<em>${minuteTime} minute${
      minuteTime === 1 ? "" : "s"
    }</em>`;
  } else {
    const hours = Math.floor(minuteTime / 60);
    const minutes = minuteTime % 60;

    const hourText = `${hours} hour${hours === 1 ? "" : "s"}`;
    const minuteText =
      minutes > 0 ? ` and ${minutes} minute${minutes === 1 ? "" : "s"}` : "";

    practiceText.innerHTML = `<em>${hourText + minuteText}</em>`;
  }
}

export function renderTxtShort(htmlId, minuteTime) {
  const practiceText = document.getElementById(htmlId);

  if (minuteTime < 60) {
    practiceText.innerHTML = `<em>${minuteTime} min${
      minuteTime === 1 ? "" : "s"
    }</em>`;
  } else {
    const hours = Math.floor(minuteTime / 60);
    const minutes = minuteTime % 60;

    const hourText = `${hours} hr${hours === 1 ? "" : "s"}`;
    const minuteText =
      minutes > 0 ? ` ${minutes} min${minutes === 1 ? "" : "s"}` : "";

    practiceText.innerHTML = `<em>${hourText + minuteText}</em>`;
  }
}

export function renderRecentLogs(logs) {
  const recentLogs = document.getElementById("recent-logs");
  if (!recentLogs) return;

  recentLogs.innerHTML = ""; // Clear it first

  // Group logs by date
  const grouped = {};

  logs.forEach((log) => {
    // FIXME
    // TODO: adjust log attribute to match backend
    if (!grouped[log.date]) {
      // Initialize array for logs for this date if not already present
      grouped[log.date] = []; // the date is the key, the log is the value
    }
    grouped[log.date].push(log); // Add log to the date group
  });

  // Render each date group
  // FIXME
  // TODO: adjust log attribute to match backend
  Object.keys(grouped).forEach((date) => {
    const dateHeading = document.createElement("li"); // Create a list item for the date
    dateHeading.className = "log-date-heading";
    dateHeading.innerHTML = `<strong>${date}</strong>`;
    recentLogs.appendChild(dateHeading); // Append the date heading to the recent logs container

    const dateGroup = document.createElement("ul"); // Create a new unordered list for this date's logs
    dateGroup.className = "log-date-group";
    recentLogs.appendChild(dateGroup); // Append the date group to the recent logs container
    let count = 0;

    grouped[date].forEach((log) => {
      // For each log in this date group
      const logItem = document.createElement("li"); // Create a list item for the log
      logItem.className = "recent-log-item";
      logItem.innerHTML = `
        ${instrumentMap[log.instrument] || log.instrument} - 
        <em>${log.piece || "N/A"} by ${log.composer || "Unknown"}
        (<span class="log-duration" id="${count}durationIs${
        log.duration
      }">Loading...</span>)</em>
      `;

      let listId = count + "durationIs" + log.duration;
      dateGroup.appendChild(logItem); // Append the log item to the date group
      count++;
      renderTxtShort(listId, log.duration);
    });
  });
}
