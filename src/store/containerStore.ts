import { create } from "zustand";
import { Container, Box, KPIs, Vector3 } from "../types";
import { PackingOptimizer } from "../utils/packingAlgorithm";

interface ContainerState {
  container: Container | null;
  boxes: Box[];
  isOptimized: boolean;

  // Actions
  setContainer: (container: Container) => void;
  addBox: (box: Omit<Box, "id" | "placed">) => void;
  removeBox: (id: string) => void;
  updateBoxPosition: (id: string, position: Vector3) => void;
  optimize: () => void;
  reset: () => void;
  calculateKPIs: () => KPIs;
  clearAllBoxes: () => void;
  updateBoxes: (boxes: Box[]) => void;
}

export const useContainerStore = create<ContainerState>((set, get) => ({
  container: null,
  boxes: [],
  isOptimized: false,

  setContainer: (container) => {
    set({ container, boxes: [], isOptimized: false });
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

  // new action
  updateBoxes: (boxes) => {
    set({ boxes, isOptimized: true });
  },

  optimize: () => {
    const { container, boxes } = get();
    if (!container) return;

    const optimizer = new PackingOptimizer(container);
    let optimizedBoxes = optimizer.optimizeBoxes(boxes);

    // Add micro-offsets to prevent z-fighting
    optimizedBoxes = optimizedBoxes.map((box, index) => {
      if (box.position) {
        return {
          ...box,
          position: {
            x: box.position.x + index * 0.0001, // Tiny offset to prevent overlapping
            y: box.position.y + index * 0.0001,
            z: box.position.z + index * 0.0001,
          },
        };
      }
      return box;
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
