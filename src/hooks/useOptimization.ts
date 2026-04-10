import { useCallback } from "react";
import { PackingOptimizer } from "../utils/packingAlgorithm";
import { useContainerStore } from "../store/containerStore";

export const useOptimization = () => {
  const { container, boxes, optimize: storeOptimize } = useContainerStore();

  const optimize = useCallback(() => {
    if (!container) {
      alert("Please set up container first!");
      return;
    }

    if (boxes.length === 0) {
      alert("Please add some boxes first!");
      return;
    }

    // Use the store's optimize method
    storeOptimize();
  }, [container, boxes, storeOptimize]);

  return { optimize };
};
