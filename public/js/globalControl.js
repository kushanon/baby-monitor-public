let isUpdating = false;
let isInitialLoop = true;

export function getIsUpdating() {
  return isUpdating;
}

export function setIsUpdating(value) {
  isUpdating = value;
}

export function getIsInitialLoop() {
  return isInitialLoop;
}

export function setIsInitialLoop(value) {
  isInitialLoop = value;
}
