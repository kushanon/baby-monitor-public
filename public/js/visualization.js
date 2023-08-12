export function createFeatureCharts(featureNames) {
  return featureNames.reduce((acc, feature) => {
    const container = document.getElementById(`${feature}-container`);
    const canvas = document.createElement("canvas");
    container.appendChild(canvas);
    const chart = new Chart(canvas, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: feature,
            data: [],
            fill: false,
            borderColor: "rgb(75, 192, 192)",
            tension: 0.1,
          },
        ],
      },
      options: {
        scales: {
          x: {
            type: "time",
            time: {
              unit: "second",
            },
          },
          y: {},
        },
      },
    });
    acc[feature] = chart;
    return acc;
  }, {});
}

export function updateFeatureCharts(charts, featureData) {
  for (const feature in charts) {
    if (featureData.hasOwnProperty(feature)) {
      charts[feature].data.labels = featureData[feature].timestamps;
      charts[feature].data.datasets[0].data = featureData[feature].values;
      charts[feature].update();
    }
  }
}
