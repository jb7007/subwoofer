// plot.js

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

export function renderDailyMinutes(logs) {
  let totalToday;
  if (!logs || logs.length === 0) {
    totalToday = 0;
  } else {
    // get today's date (local) in YYYY-MM-DD format
    const today = new Date().toLocaleString("sv-SE").split(" ")[0];

    // filter logs for today and sum durations
    const todayLogs = logs.filter((log) => log.isodate === today);
    totalToday = todayLogs.reduce((sum, log) => sum + log.duration, 0);
  }

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
  let totalMins;
  let xRange;
  const xVals = [];
  const yVals = [];
  if (!logs || logs.length === 0) {
    totalMins = 0;
    xRange = 0;
  } else {
    const logsByDate = [...logs].sort(
      (a, b) => new Date(a.isodate) - new Date(b.isodate)
    );

    const [year, month, day] = logsByDate[0].isodate.split("-").map(Number);
    let current = new Date(year, month - 1, day); // month is 0-indexed
    const end = new Date(); // ends at the current day

    totalMins = 0;
    xRange = 0;

    const logMap = new Map();

    for (const log of logs) {
      if (!logMap.has(log.isodate)) {
        logMap.set(log.isodate, []);
      }
      logMap.get(log.isodate).push(log);
    }

    while (current <= end) {
      const dateStr = current.toLocaleString("sv-SE").split(" ")[0]; // string to use as key

      console.log("CURRENT ISO LOOP INDEX: " + dateStr);

      const currentLogs = logMap.get(dateStr) || [];
      const currentLogsMins = currentLogs.reduce(
        (sum, log) => (sum += log.duration),
        0
      ); // adds minutes for day (SINGLE VALUE)

      xVals.push(dateStr);
      totalMins += currentLogsMins;
      yVals.push(totalMins);
      xRange++;

      console.log("IN LOOP: BEFORE DATE ITERATION: " + current);
      console.log("IN LOOP: END CONDITION: " + end);

      current.setDate(current.getDate() + 1); // add day
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
