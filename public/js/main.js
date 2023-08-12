import { setupCamera } from "./camera.js";
import { sendFeatureDataToServer } from "./communication.js";
import { loadPosenet, poseDetectionFrame } from "./poseDetection.js";
import { createFeatureCharts, updateFeatureCharts } from "./visualization.js";
const video = document.getElementById("videoElement");
video.muted = true;
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const featureData = {};
let previousPoseData = {};
const featureNames = [
  "totalMovement",
  "headMovement",
  "handAndLegMovement",
  "bodyLength",
  "bodyOrientation",
  "noseDetected",
  "chestAndAbdomenMovement",
  "powerSum_2kHz_4kHz",
];

async function main() {
  const constraints = {
    video: {
      facingMode: "environment", // 背面カメラを使用
    },
    audio: true,
  };
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  await setupCamera(stream, video, canvas);
  const net = await loadPosenet();

  const audioContext = new AudioContext();
  const source = audioContext.createMediaStreamSource(stream);
  const analyser = audioContext.createAnalyser();
  source.connect(analyser);
  const frequencyData = new Uint8Array(analyser.frequencyBinCount);

  // Create chart.js charts for each feature
  const charts = createFeatureCharts(featureNames);

  // Update the charts with new data
  setInterval(() => {
    updateFeatureCharts(charts, featureData);
  }, 500);
  setInterval(() => sendFeatureDataToServer(featureData), 10000);
  poseDetectionFrame(
    net,
    video,
    ctx,
    previousPoseData,
    featureData,
    analyser,
    frequencyData,
  );
}
window.addEventListener("beforeunload", function () {
  // Stop video stream on page unload to free resources
  if (video.srcObject) {
    video.srcObject.getTracks().forEach((track) => track.stop());
  }
});

main();
