import { useCallback } from 'react';
import { PackingOptimizer } from '../utils/packingAlgorithm';
import { useContainerStore } from '../store/containerStore';
export const useOptimization = () => {
  const { container, boxes, updateBoxes } = useContainerStore();

  const optimize = useCallback(() => {
    if (!container) {
      alert('No container selected!');
      return;
    }
    
    const optimizer = new PackingOptimizer(container);
    const optimizedBoxes = optimizer.optimizeBoxes(boxes);
    
    // Check weight constraint
    const totalWeight = optimizedBoxes.reduce((sum, box) => sum + box.weight, 0);
    if (totalWeight <= container.maxWeight) {
      updateBoxes(optimizedBoxes);
    } else {
      alert('Total weight exceeds container capacity!');
    }
  }, [container, boxes]);

  return { optimize };
};