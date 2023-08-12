import { calculatePowerSum } from "./audio.js";
export function calculateFeatures(pose, frequencyData, previousPoseData) {
  let totalMovement = 0;
  let headMovement = 0;
  let handAndLegMovement = 0;
  let bodyLength = 0;
  let bodyOrientation = 0;
  let noseDetected = 0;
  let chestAndAbdomenMovement = 0;
  const powerSum = calculatePowerSum(frequencyData, 2000, 4000);

  for (const keypoint of pose.keypoints) {
    const variableX = `${keypoint.part}_x`;
    const variableY = `${keypoint.part}_y`;

    const movementX = Math.abs(
      previousPoseData[variableX] - keypoint.position.x,
    );
    const movementY = Math.abs(
      previousPoseData[variableY] - keypoint.position.y,
    );

    const totalKeypointMovement = Math.sqrt(movementX ** 2 + movementY ** 2);

    totalMovement += totalKeypointMovement;
    if (keypoint.part === "nose") {
      headMovement = totalKeypointMovement;
      noseDetected = keypoint.score > 0.5 ? 1 : 0;
    }
    if (
      ["leftWrist", "rightWrist", "leftAnkle", "rightAnkle"].includes(
        keypoint.part,
      )
    ) {
      handAndLegMovement += totalKeypointMovement;
    }
    if (
      ["leftShoulder", "rightShoulder", "leftHip", "rightHip"].includes(
        keypoint.part,
      )
    ) {
      chestAndAbdomenMovement += totalKeypointMovement;
    }

    previousPoseData[variableX] = keypoint.position.x;
    previousPoseData[variableY] = keypoint.position.y;
  }

  const leftShoulder = pose.keypoints.find(
    ({ part }) => part === "leftShoulder",
  );
  const rightShoulder = pose.keypoints.find(
    ({ part }) => part === "rightShoulder",
  );
  const leftHip = pose.keypoints.find(({ part }) => part === "leftHip");
  const rightHip = pose.keypoints.find(({ part }) => part === "rightHip");

  if (leftShoulder && rightShoulder && leftHip && rightHip) {
    const shoulderDistance = Math.hypot(
      leftShoulder.position.x - rightShoulder.position.x,
      leftShoulder.position.y - rightShoulder.position.y,
    );
    const hipDistance = Math.hypot(
      leftHip.position.x - rightHip.position.x,
      leftHip.position.y - rightHip.position.y,
    );
    const shoulderHipDistance = Math.hypot(
      leftShoulder.position.x - leftHip.position.x,
      leftShoulder.position.y - leftHip.position.y,
    );
    bodyLength = (shoulderDistance + hipDistance + shoulderHipDistance) / 3;
    bodyOrientation = Math.atan2(
      rightHip.position.y - rightShoulder.position.y,
      rightHip.position.x - rightShoulder.position.x,
    );
  }

  const features = {
    totalMovement,
    headMovement,
    handAndLegMovement,
    bodyLength,
    bodyOrientation,
    noseDetected,
    chestAndAbdomenMovement,
    powerSum_2kHz_4kHz: powerSum,
  };

  return features;
}

import { setIsUpdating } from "./globalControl.js";
export async function updateFeatureData(features, featureData) {
  setIsUpdating(true);
  for (const feature in features) {
    const variable = feature;
    if (!featureData.hasOwnProperty(variable)) {
      featureData[variable] = {
        variable: variable,
        timestamps: [],
        values: [],
      };
    }
    featureData[variable].timestamps.push(new Date().toISOString());
    featureData[variable].values.push(features[feature]);
  }
  setIsUpdating(false);
  return;
}
