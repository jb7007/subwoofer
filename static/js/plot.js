// plot.js

export function renderAsTxt(htmlId, minuteTime) {
  const practiceText = document.getElementById(htmlId);

  if (minuteTime === 0) {
    practiceText.innerHTML = `<em>Nothing logged yet.</em>`;
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

export function renderDailyMinutes(logs) {
  if (!logs || logs.length === 0) return;

  // get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  // filter logs for today and sum durations
  const todayLogs = logs.filter((log) => log.isodate === today);
  const totalToday = todayLogs.reduce((sum, log) => sum + log.duration, 0);

  const trace = [
    {
      value: totalToday,
      type: "indicator",
      mode: "gauge+number+delta",
      delta: { reference: 60 },
      gauge: {
        axis: { visible: false, range: [null, 120] },
        steps: [
          { range: [0, 60], color: "lightgray" },
          { range: [60, 90], color: "gray" },
        ],
      },
    },
  ];

  const layout = { height: 125, margin: { t: 10, b: 10, l: 0, r: 0 } };

  Plotly.newPlot("daily-gauge", trace, layout);

  renderAsTxt("daily-practice-txt", totalToday);
}

export function renderTotalMinutes(logs) {
  if (!logs || logs.length === 0) return;

  const today = new Date().toISOString().split("T")[0];

  const logsByDate = [...logs].sort(
    (a, b) => new Date(a.isodate) - new Date(b.isodate)
  );
  const firstLogDate = logsByDate[0].isodate;

  let current = new Date(firstLogDate); // stars at the date of first log
  const end = new Date(today); // ends at the current day

  const xVals = [];
  const yVals = [];

  let totalMins = 0;
  let xRange = 0;

  const logMap = new Map();

  for (const log of logs) {
    if (!logMap.has(log.isodate)) {
      logMap.set(log.isodate, []);
    }
    logMap.get(log.isodate).push(log);
  }

  while (current <= end) {
    const dateStr = current.toISOString().split("T")[0]; // string to use as key

    const currentLogs = logMap.get(dateStr) || [];
    const currentLogsMins = currentLogs.reduce(
      (sum, log) => (sum += log.duration),
      0
    ); // adds minutes for day (SINGLE VALUE)

    xVals.push(dateStr);
    totalMins += currentLogsMins;
    yVals.push(totalMins);
    xRange++;

    current.setDate(current.getDate() + 1); // add day
  }

  const data = [
    {
      type: "indicator",
      mode: "number+delta",
      title: {
        text: "Cummulative Total",
        font: {
          shadow: "2px 2px 3px #707070",
          style: "italic",
        },
      },
      value: totalMins,
      number: {
        font: {
          size: 48,
          shadow: "3px 3px 5px grey",
        },
      },
      delta: {
        reference: totalMins - 10,
        valueformat: ".0f",
        font: {
          size: 16,
          shadow: "auto",
        },
      }, // TODO: set up logic for yesterday's minutes
      axis: { visible: false },
    },
    {
      mode: "lines",
      y: yVals,
      fill: "tozeroy",
      line: {
        color: "cornflowerblue",
        width: 2,
      },
      fillcolor: "rgba(100, 149, 237, 0.3)",
    },
  ];

  const layout = {
    margin: { t: 5, b: 0, l: 0, r: 0 },
    xaxis: { range: [0, xRange - 1] },
  };

  Plotly.newPlot("total-chart", data, layout, { responsive: true });

  renderAsTxt("total-practice-txt", totalMins);
}
