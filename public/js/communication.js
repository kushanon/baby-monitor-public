import { getIsUpdating } from "./globalControl.js";
async function postData(url = "", data = {}) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return response.json();
}

let serverStatus = null;
async function isServerRunning(url = "") {
  if (serverStatus !== null) {
    return serverStatus;
  }

  try {
    const response = await fetch(url, {
      method: "HEAD",
    });

    // HTTP status in the range 200-299 indicate success
    if (response.status >= 200 && response.status <= 299) {
      serverStatus = {
        status: "success",
        message: "Server and Anomaly Detector API are running.",
      };
    } else {
      serverStatus = { status: "error", message: response.statusText };
    }
  } catch (err) {
    console.error("Error checking server status:", err);
    serverStatus = { status: "error", message: "Server is not running." };
  }

  return serverStatus;
}

let anomalyTimeoutId;
export async function sendFeatureDataToServer(featureData) {
  if (getIsUpdating()) {
    // If the data is currently being updated, delay the function call
    setTimeout(sendFeatureDataToServer, 100);
    return;
  }

  const serverUrl = "/api/detectAnomaly";
  serverStatus = await isServerRunning(serverUrl);
  if (serverStatus.status == "error") {
    console.error(serverStatus.message);
    return;
  }
  if (Object.values(featureData).length > 1) {
    for (const variable in featureData) {
      // Iterate through each feature's data and send it to the server
      const featureValues = featureData[variable].values;
      let groupedData = {};

      // Group data by seconds
      featureData[variable].timestamps.forEach((timestamp, index) => {
        let date = new Date(timestamp);
        date.setMilliseconds(0); // Round to the nearest second
        if (groupedData.hasOwnProperty(date)) {
          groupedData[date].push(featureValues[index]);
        } else {
          groupedData[date] = [featureValues[index]];
        }
      });

      // Calculate the average for each second
      for (const timestamp in groupedData) {
        groupedData[timestamp] =
          groupedData[timestamp].reduce((a, b) => a + b) /
          groupedData[timestamp].length;
      }
      // format to be compatible with Anomaly detector API
      const seriesData = Object.entries(groupedData).map(
        ([timestamp, value]) => ({
          timestamp: new Date(timestamp),
          value: value,
        }),
      );
      if (seriesData.length > 11) {
        // >11 due to the specification of Azure Anomaly Detector API
        try {
          const response = await postData("/api/detectAnomaly", {
            series: seriesData,
            type: variable,
          });
          console.log("Response:", response);

          // Check if the response indicates an anomaly
          if (response.isAnomaly) {
            // Change the background color to red
            document.body.style.backgroundColor = "red";

            // Update the anomaly message
            const messageElement = document.getElementById("anomaly-message");
            messageElement.textContent = `Anomaly detected in ${variable} data.`;

            // Clear any existing timeout
            if (anomalyTimeoutId) {
              clearTimeout(anomalyTimeoutId);
            }

            // Set a new timeout to reset the background color after 10 seconds
            anomalyTimeoutId = setTimeout(() => {
              document.body.style.backgroundColor = "";
              messageElement.textContent = "";
            }, 10000);
          }
        } catch (err) {
          console.log("Type of data", variable);
          console.log("Data", JSON.stringify(seriesData, null, 2));
          console.error("Error posting data:", err);
        }
      }
    }
  }

  // Delete data older than 100 seconds
  const deleteThreshold = 100;
  const cutoff = new Date(
    new Date().getTime() - deleteThreshold * 1000,
  ).toISOString();
  for (const variable in featureData) {
    while (
      featureData[variable].timestamps.length > 0 &&
      featureData[variable].timestamps[0] < cutoff
    ) {
      featureData[variable].timestamps.shift();
      featureData[variable].values.shift();
    }
  }
}
