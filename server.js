const express = require("express");
const axios = require("axios");
// const posenet = require('@tensorflow-models/posenet');
const { SecretClient } = require("@azure/keyvault-secrets");
const { DefaultAzureCredential } = require("@azure/identity");
const app = express();
app.use(express.json());

// Serve static files (index.html, CSS, JS, etc.)
app.use(express.static("public"));
const appServiceUrl = "Add your endpoint URL of appservice";

async function getKeyVaultSecrets() {
  const credential = new DefaultAzureCredential();
  const keyVaultUrl = "Add your KeyVault endpoint URL";
  const secretClient = new SecretClient(keyVaultUrl, credential);

  // Retrieve API Key from Azure Key Vault
  const apiKey = await secretClient.getSecret(
    "Add your secret name in your KeyVault",
  );
  process.env.API_KEY = apiKey.value;
}

getKeyVaultSecrets()
  .then(() => {
    app.head("/api/detectAnomaly", async (req, res) => {
      try {
        const testData = {
          series: [
            { timestamp: "2021-01-01T00:00:00Z", value: 1 },
            { timestamp: "2021-01-02T00:00:00Z", value: 1 },
            { timestamp: "2021-01-03T00:00:00Z", value: 1 },
            { timestamp: "2021-01-04T00:00:00Z", value: 1 },
            { timestamp: "2021-01-05T00:00:00Z", value: 1 },
            { timestamp: "2021-01-06T00:00:00Z", value: 1 },
            { timestamp: "2021-01-07T00:00:00Z", value: 1 },
            { timestamp: "2021-01-08T00:00:00Z", value: 1 },
            { timestamp: "2021-01-09T00:00:00Z", value: 1 },
            { timestamp: "2021-01-10T00:00:00Z", value: 1 },
            { timestamp: "2021-01-11T00:00:00Z", value: 1 },
            { timestamp: "2021-01-12T00:00:00Z", value: 1 },
          ],
          granularity: "daily",
        };

        // Anomaly Detector APIとの疎通確認
        const testResponse = await axios.post(
          `${appServiceUrl}/anomalydetector/v1.0/timeseries/last/detect`,
          testData,
          {
            headers: {
              "Content-Type": "application/json",
              "Ocp-Apim-Subscription-Key": process.env.API_KEY,
            },
          },
        );

        if (testResponse.status >= 200 && testResponse.status <= 299) {
          res.status(200).send("OK");
        } else {
          res.status(500).send("Anomaly Detector API is not responding");
        }
      } catch (error) {
        console.log(
          "Error testing connection to Azure Anomaly Detector:",
          error.message,
          error.response ? error.response.data : "",
        );
        res.status(500).send("Anomaly Detector API is not responding");
      }
    });

    app.post("/api/detectAnomaly", async (req, res) => {
      const data = {
        series: req.body.series, // change this as per your data structure
        maxAnomalyRatio: 0.25,
        sensitivity: 95,
        granularity: "secondly",
      };
      try {
        const response = await axios.post(
          `${appServiceUrl}/anomalydetector/v1.0/timeseries/last/detect`,
          data,
          {
            headers: {
              "Content-Type": "application/json",
              "Ocp-Apim-Subscription-Key": process.env.API_KEY,
            },
          },
        );
        res.json(response.data);
      } catch (error) {
        console.log("Error sending request to Azure Functions:", error.message);
        console.log("Type of data", req.body.type);
        console.log("Data", JSON.stringify(data, null, 2));
        res
          .status(500)
          .json({ error: "An error occurred while sending the request." });
      }
    });

    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`Server started on port ${port}`));
  })
  .catch((err) => {
    console.error("Error fetching secrets:", err);
  });
