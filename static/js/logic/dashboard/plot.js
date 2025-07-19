// plot.js

import { renderAsTxt } from "./dashHelper.js";
import {
  getDailyGraphVal,
  logsNotFound,
  setAsTmrw,
  totalLogMins,
} from "./utils.js";

// renders graphic for user's minute total for today
export function renderDailyMinutes(logs) {
  const totalToday = getDailyGraphVal(logs);

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

// renders graphic for user's minute total for all-time
// TODO: fix log date sorting 
export function renderTotalMinutes(logs) {
  let totalMins;
  let xRange;
  // x and y plots
  const xVals = [];
  const yVals = [];
  if (logsNotFound(logs)) {
    totalMins = 0;
    xRange = 0;
  } else {
    // sort logs
    const logsByDate = [...logs].sort(
      (a, b) => new Date(a.isodate) - new Date(b.isodate)
    );

    const [year, month, day] = logsByDate[0].isodate.split("-").map(Number); // get first log date
    let current = new Date(year, month - 1, day); // month is 0-indexed
    const end = new Date(); // ends at the current day

    totalMins = 0;
    xRange = 0;

    const logMap = new Map();

    for (const log of logs) {
      // TODO: fix log attributes
      if (!logMap.has(log.isodate)) {
        logMap.set(log.isodate, []); // sets key as date and value as array of logs
      }
      logMap.get(log.isodate).push(log); // gets the value for the key (e.g., the date) which is the array, and pushes a log
    }

    while (current <= end) {
      const dateStr = current.toLocaleString("sv-SE").split(" ")[0]; // string to use as key

      console.log("CURRENT ISO LOOP INDEX: " + dateStr);

      const currentLogs = logMap.get(dateStr) || [];
      const currentLogsMins = totalLogMins(currentLogs); // adds minutes for day (SINGLE VALUE)

      xVals.push(dateStr);
      totalMins += currentLogsMins;
      yVals.push(totalMins);
      xRange++;

      console.log("IN LOOP: BEFORE DATE ITERATION: " + current);
      console.log("IN LOOP: END CONDITION: " + end);

      setAsTmrw(current); // add day
    }
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
    xaxis: { range: [0, xRange - 1], visible: false },
    yaxis: { visible: false },
  };

  Plotly.newPlot("total-chart", data, layout, { responsive: true });

  renderAsTxt("total-practice-txt", totalMins);
}

// renders graphic for user's minute average for all time as well as comparisons for each day of the week
export function renderAvgMinutes(logs) {
  let minAvg;
  let yVals;
  let minAvgArr;
  let xAxisRange;
  if (!logs || logs.length === 0) {
    minAvg = 0;
    yVals = [];
    minAvgArr = [];
    xAxisRange = 1;
  } else {
    const totalMin = logs.reduce((sum, log) => (sum += log.duration), 0);
    minAvg = totalMin / logs.length;

    const startOfWeek = new Date();
    const dayOfWeek = new Date().getDay();
    startOfWeek.setDate(new Date().getDate() - dayOfWeek);

    const daysThisWeek = [];

    let current = new Date(startOfWeek);
    let end = new Date();

    while (current <= end) {
      const iso = current.toLocaleString("sv-SE").split(" ")[0];
      daysThisWeek.push(iso);
      current.setDate(current.getDate() + 1);
    }

    const minsPerDay = daysThisWeek.map((date) => {
      const logsThatDay = logs.filter((log) => log.isodate === date);
      const total = logsThatDay.reduce((sum, log) => (sum += log.duration), 0);
      return total;
    });

    yVals = minsPerDay;
    minAvgArr = new Array(daysThisWeek.length);
    minAvgArr.fill(minAvg);
    xAxisRange = daysThisWeek.length - 1;
  }

  const trace1 = [
    {
      type: "indicator",
      mode: "number+delta",
      title: {
        text: "Total Average",
        font: {
          shadow: "2px 2px 3px #707070",
          style: "italic",
        },
      },
      value: Math.floor(minAvg),
      number: {
        font: {
          size: 48,
          shadow: "3px 3px 5px grey",
        },
      },
      delta: {
        reference: minAvg - 25,
        valueformat: ".0f",
        font: {
          size: 16,
          shadow: "auto",
        },
      }, // TODO: set up logic for last week's minutes
      axis: { visible: false },
      showlegend: false,
    },
    {
      mode: "lines+markers",
      y: yVals,
      showlegend: false,
      line: {
        color: "rgb(38, 56, 91).3)",
        width: 2,
      },
    },
    {
      mode: "lines",
      y: minAvgArr,
      fill: "tozeroy",
      line: {
        color: "cornflowerblue",
        width: 2,
      },
      fillcolor: "rgba(100, 149, 237, 0.3)",
      showlegend: false,
    },
  ];

  const layout = {
    margin: { t: 5, b: 0, l: 0, r: 0 },
    xaxis: { range: [0, xAxisRange], visible: false },
    yaxis: { range: [-1, null], visible: false },
  };

  Plotly.newPlot("avg-chart", trace1, layout, { responsive: true });
  renderAsTxt("avg-practice-txt", Math.floor(minAvg), false, true);
}

export function renderGraphs(logs) {
  renderDailyMinutes(logs);
  renderTotalMinutes(logs);
  renderAvgMinutes(logs);
}
