export async function setupCamera(stream, videoElement, canvasElement) {
  try {
    videoElement.srcObject = stream;
    return new Promise((resolve, reject) => {
      videoElement.onloadedmetadata = () => {
        const track = stream.getVideoTracks()[0];
        const settings = track.getSettings();
        // Get aspect ratio from camera
        const aspectRatio = settings.width / settings.height;
        const width = window.innerWidth * 0.4;

        canvasElement.width = width;
        canvasElement.height = width / aspectRatio;

        videoElement.width = width;
        videoElement.height = width / aspectRatio;

        resolve(stream);
      };
      videoElement.onerror = (err) => reject(err);
    });
  } catch (err) {
    console.error("Error setting up camera:", err);
  }
}

export function drawKeypoints(keypoints, minConfidence, ctx, scale = 1) {
  keypoints.forEach(({ score, part, position }) => {
    if (score >= minConfidence) {
      const { y, x } = position;
      ctx.beginPath();
      ctx.arc(x * scale, y * scale, 3, 0, 2 * Math.PI);
      ctx.fillStyle = "aqua";
      ctx.fill();
    }
  });
}

export function drawSkeleton(keypoints, minConfidence, ctx, scale = 1) {
  const adjacentKeyPoints = posenet.getAdjacentKeyPoints(
    keypoints,
    minConfidence,
  );
  adjacentKeyPoints.forEach((keypoints) => {
    ctx.beginPath();
    ctx.moveTo(
      keypoints[0].position.x * scale,
      keypoints[0].position.y * scale,
    );
    ctx.lineTo(
      keypoints[1].position.x * scale,
      keypoints[1].position.y * scale,
    );
    ctx.lineWidth = 2;
    ctx.strokeStyle = "aqua";
    ctx.stroke();
  });
}
