import { drawKeypoints, drawSkeleton } from "./camera.js";
import { calculateFeatures, updateFeatureData } from "./features.js";
import { setIsInitialLoop, getIsInitialLoop } from "./globalControl.js";
export async function loadPosenet() {
  const net = await posenet.load();
  return net;
}

export async function poseDetectionFrame(
  net,
  video,
  ctx,
  previousPoseData,
  featureData,
  analyser,
  frequencyData,
) {
  const pose = await net.estimateSinglePose(video, {
    flipHorizontal: false,
    decodingMethod: "single-person",
  });

  if (getIsInitialLoop()) {
    for (const keypoint of pose.keypoints) {
      const variableX = `${keypoint.part}_x`;
      const variableY = `${keypoint.part}_y`;
      previousPoseData[variableX] = keypoint.position.x;
      previousPoseData[variableY] = keypoint.position.y;
    }
    setIsInitialLoop(false);
  } else {
    ctx.clearRect(0, 0, video.width, video.height);
    ctx.drawImage(video, 0, 0, video.width, video.height);
    drawKeypoints(pose.keypoints, 0.5, ctx);
    drawSkeleton(pose.keypoints, 0.5, ctx);

    analyser.getByteFrequencyData(frequencyData);

    const features = calculateFeatures(pose, frequencyData, previousPoseData);
    updateFeatureData(features, featureData);
  }

  requestAnimationFrame(() =>
    poseDetectionFrame(
      net,
      video,
      ctx,
      previousPoseData,
      featureData,
      analyser,
      frequencyData,
    ),
  );
}
