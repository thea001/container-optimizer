import { create } from "zustand";
import { Container, Box, KPIs, Vector3 } from "../types";
import { PackingOptimizer } from "../utils/packingAlgorithm";
import { getScaledDimensions, ScaledDimensions } from "../utils/scaling";

interface ContainerState {
  container: Container | null;
  boxes: Box[];
  isOptimized: boolean;
  scaledDimensions: ScaledDimensions | null;

  // Actions
  setContainer: (container: Container) => void;
  addBox: (box: Omit<Box, "id" | "placed">) => void;
  removeBox: (id: string) => void;
  updateBoxPosition: (id: string, position: Vector3) => void;
  optimize: () => void;
  reset: () => void;
  calculateKPIs: () => KPIs;
  clearAllBoxes: () => void;
  getVisualPosition: (
    box: Box,
  ) => { x: number; y: number; z: number } | undefined;
}

export const useContainerStore = create<ContainerState>((set, get) => ({
  container: null,
  boxes: [],
  isOptimized: false,
  scaledDimensions: null,

  setContainer: (container) => {
    const scaledDimensions = getScaledDimensions(
      container.length,
      container.width,
      container.height,
    );
    set({
      container,
      boxes: [],
      isOptimized: false,
      scaledDimensions,
    });
  },

  addBox: (boxData) => {
    const newBox: Box = {
      ...boxData,
      id: crypto.randomUUID(),
      placed: false,
    };

    set((state) => ({
      boxes: [...state.boxes, newBox],
      isOptimized: false,
    }));
  },

  removeBox: (id) => {
    set((state) => ({
      boxes: state.boxes.filter((box) => box.id !== id),
      isOptimized: false,
    }));
  },

  updateBoxPosition: (id, position) => {
    set((state) => ({
      boxes: state.boxes.map((box) =>
        box.id === id ? { ...box, position, placed: true } : box,
      ),
    }));
  },

  optimize: () => {
    const { container, boxes, scaledDimensions } = get();
    if (!container || !scaledDimensions) return;

    // Create a virtual container with scaled dimensions for packing
    const virtualContainer = {
      ...container,
      length: scaledDimensions.visualLength,
      width: scaledDimensions.visualWidth,
      height: scaledDimensions.visualHeight,
    };

    // Scale boxes to match virtual container
    const scaledBoxes = boxes.map((box) => ({
      ...box,
      length: box.length * scaledDimensions.scaleFactor,
      width: box.width * scaledDimensions.scaleFactor,
      height: box.height * scaledDimensions.scaleFactor,
    }));

    const optimizer = new PackingOptimizer(virtualContainer);
    let optimizedBoxes = optimizer.optimizeBoxes(scaledBoxes);

    // Convert positions back to cm scale for storage
    optimizedBoxes = optimizedBoxes.map((box, index) => {
      if (box.position) {
        return {
          ...box,
          // Restore original dimensions
          length: box.length / scaledDimensions.scaleFactor,
          width: box.width / scaledDimensions.scaleFactor,
          height: box.height / scaledDimensions.scaleFactor,
          position: {
            x: box.position.x / scaledDimensions.scaleFactor,
            y: box.position.y / scaledDimensions.scaleFactor,
            z: box.position.z / scaledDimensions.scaleFactor,
          },
        };
      }
      return {
        ...box,
        // Restore original dimensions even if not placed
        length: box.length / scaledDimensions.scaleFactor,
        width: box.width / scaledDimensions.scaleFactor,
        height: box.height / scaledDimensions.scaleFactor,
      };
    });

    // Check weight constraint
    const totalWeight = optimizedBoxes.reduce(
      (sum, box) => sum + box.weight,
      0,
    );

    if (totalWeight <= container.maxWeight) {
      set({ boxes: optimizedBoxes, isOptimized: true });
    } else {
      alert(
        `Total weight (${totalWeight}kg) exceeds container capacity (${container.maxWeight}kg)!`,
      );
    }
  },

  reset: () => {
    set((state) => ({
      boxes: state.boxes.map((box) => ({
        ...box,
        position: undefined,
        placed: false,
      })),
      isOptimized: false,
    }));
  },

  clearAllBoxes: () => {
    set({ boxes: [], isOptimized: false });
  },

  getVisualPosition: (box) => {
    const { scaledDimensions } = get();
    if (!box.position || !scaledDimensions) return undefined;

    return {
      x: box.position.x * scaledDimensions.scaleFactor,
      y: box.position.y * scaledDimensions.scaleFactor,
      z: box.position.z * scaledDimensions.scaleFactor,
    };
  },

  calculateKPIs: () => {
    const { container, boxes } = get();

    if (!container) {
      return {
        totalWeight: 0,
        maxWeight: 0,
        filledVolume: 0,
        totalVolume: 0,
        boxesPlaced: 0,
        totalBoxes: 0,
        remainingVolume: 0,
        weightPercentage: 0,
        volumePercentage: 0,
        utilizationScore: 0,
      };
    }

    const totalVolume = container.length * container.width * container.height;
    const placedBoxes = boxes.filter((b) => b.placed);

    const filledVolume = placedBoxes.reduce(
      (sum, box) => sum + box.length * box.width * box.height,
      0,
    );

    const totalWeight = placedBoxes.reduce((sum, box) => sum + box.weight, 0);

    const weightPercentage = (totalWeight / container.maxWeight) * 100;
    const volumePercentage = (filledVolume / totalVolume) * 100;

    return {
      totalWeight,
      maxWeight: container.maxWeight,
      filledVolume,
      totalVolume,
      boxesPlaced: placedBoxes.length,
      totalBoxes: boxes.length,
      remainingVolume: totalVolume - filledVolume,
      weightPercentage,
      volumePercentage,
      utilizationScore: (volumePercentage + weightPercentage) / 2,
    };
  },
}));
