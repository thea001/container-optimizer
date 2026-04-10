// Scaling factor for visualization
// This ensures containers are always visible in the 3D view
export const VISUALIZATION_SCALE = 10; // Scale up small containers for visibility
export const MIN_VISUAL_SIZE = 2; // Minimum visual size in Three.js units

export interface ScaledDimensions {
  length: number;
  width: number;
  height: number;
  visualLength: number;
  visualWidth: number;
  visualHeight: number;
  scaleFactor: number;
}

export function getScaledDimensions(
  lengthCm: number,
  widthCm: number,
  heightCm: number,
): ScaledDimensions {
  // Check if dimensions are too small
  const avgSize = (lengthCm + widthCm + heightCm) / 3;

  // Calculate scale factor to ensure minimum visual size
  let scaleFactor = 1;
  if (avgSize < MIN_VISUAL_SIZE) {
    scaleFactor = MIN_VISUAL_SIZE / avgSize;
  }

  return {
    length: lengthCm,
    width: widthCm,
    height: heightCm,
    visualLength: lengthCm * scaleFactor,
    visualWidth: widthCm * scaleFactor,
    visualHeight: heightCm * scaleFactor,
    scaleFactor,
  };
}

// Convert user input (cm) to visual units
export function cmToVisual(cm: number, containerScaleFactor: number): number {
  return cm * containerScaleFactor;
}

// Convert visual units back to cm (for calculations)
export function visualToCm(
  visual: number,
  containerScaleFactor: number,
): number {
  return visual / containerScaleFactor;
}
