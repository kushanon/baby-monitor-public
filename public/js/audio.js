export function calculatePowerSum(
  frequencyData,
  startFrequency,
  endFrequency,
  sampleRate = 48000,
) {
  const getIndexForFrequency = (frequency, sampleRate, dataLength) =>
    Math.floor(frequency / (sampleRate / dataLength));
  const startIndex = getIndexForFrequency(
    startFrequency,
    sampleRate,
    frequencyData.length,
  );
  const endIndex = getIndexForFrequency(
    endFrequency,
    sampleRate,
    frequencyData.length,
  );
  let powerSum = 0;

  for (let i = startIndex; i < endIndex; i++) {
    powerSum += frequencyData[i] ** 2;
  }

  return powerSum;
}
