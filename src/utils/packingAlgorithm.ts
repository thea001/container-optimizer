import { Container, Box, Space } from "../types";

export class PackingOptimizer {
  private spaces: Space[] = [];
  private container: Container;
  private padding: number;

  constructor(container: Container) {
    this.container = container;
    this.padding = 0.02; // 5cm padding

    // Initialize with the container space (with padding considered)
    this.spaces = [
      {
        x: this.padding, // Start with padding from left edge
        y: this.padding, // Start with padding from bottom
        z: this.padding, // Start with padding from front edge
        length: container.length - 2 * this.padding, // Reduce by padding on both sides
        width: container.width - 2 * this.padding, // Reduce by padding on both sides
        height: container.height - 2 * this.padding, // Reduce by padding on both sides
      },
    ];
  }

  private rotateBox(
    box: Box,
    rotation: 0 | 90,
  ): { length: number; width: number; height: number } {
    if (rotation === 90) {
      return {
        length: box.width,
        width: box.length,
        height: box.height,
      };
    }
    return {
      length: box.length,
      width: box.width,
      height: box.height,
    };
  }

  private fitsInSpace(
    boxDimensions: { length: number; width: number; height: number },
    space: Space,
  ): boolean {
    // Add small epsilon to avoid floating point errors
    const epsilon = 0.001;
    return (
      boxDimensions.length <= space.length + epsilon &&
      boxDimensions.width <= space.width + epsilon &&
      boxDimensions.height <= space.height + epsilon
    );
  }

  private calculateSpaceScore(
    boxDimensions: { length: number; width: number; height: number },
    space: Space,
  ): number {
    // Calculate how well the box fits in the space
    const volumeDifference =
      space.length * space.width * space.height -
      boxDimensions.length * boxDimensions.width * boxDimensions.height;

    // Prefer spaces that match box dimensions closely
    const lengthMatch = Math.abs(space.length - boxDimensions.length);
    const widthMatch = Math.abs(space.width - boxDimensions.width);
    const heightMatch = Math.abs(space.height - boxDimensions.height);

    return volumeDifference + (lengthMatch + widthMatch + heightMatch) * 10;
  }

  private isValidSpace = (space: Space): boolean => {
    // Use this.padding safely by accessing it from the class instance
    const padding = this.padding;
    const epsilon = 0.001;

    return (
      space.length > epsilon &&
      space.width > epsilon &&
      space.height > epsilon &&
      space.x >= padding - epsilon &&
      space.y >= padding - epsilon &&
      space.z >= padding - epsilon &&
      space.x + space.length <= this.container.length - padding + epsilon &&
      space.y + space.height <= this.container.height - padding + epsilon &&
      space.z + space.width <= this.container.width - padding + epsilon
    );
  };

  private splitSpace(
    space: Space,
    placedBox: {
      x: number;
      y: number;
      z: number;
      length: number;
      width: number;
      height: number;
    },
  ): Space[] {
    const newSpaces: Space[] = [];
    const padding = this.padding;

    // Space to the right (along X-axis)
    if (placedBox.x + placedBox.length + padding <= space.x + space.length) {
      newSpaces.push({
        x: placedBox.x + placedBox.length + padding,
        y: space.y,
        z: space.z,
        length:
          space.length - (placedBox.x - space.x) - placedBox.length - padding,
        width: placedBox.width,
        height: placedBox.height,
      });
    }

    // Space above (along Y-axis)
    if (placedBox.y + placedBox.height + padding <= space.y + space.height) {
      newSpaces.push({
        x: space.x,
        y: placedBox.y + placedBox.height + padding,
        z: space.z,
        length: space.length,
        width: space.width,
        height:
          space.height - (placedBox.y - space.y) - placedBox.height - padding,
      });
    }

    // Space in front (along Z-axis)
    if (placedBox.z + placedBox.width + padding <= space.z + space.width) {
      newSpaces.push({
        x: space.x,
        y: space.y,
        z: placedBox.z + placedBox.width + padding,
        length: placedBox.length,
        width:
          space.width - (placedBox.z - space.z) - placedBox.width - padding,
        height: placedBox.height,
      });
    }

    // Filter out invalid spaces
    return newSpaces.filter((space) => this.isValidSpace(space));
  }

  private findBestSpace(box: Box): {
    space: Space;
    rotation: 0 | 90;
    dimensions: { length: number; width: number; height: number };
  } | null {
    let bestSpace: Space | null = null;
    let bestRotation: 0 | 90 = 0;
    let bestDimensions = { length: 0, width: 0, height: 0 };
    let bestScore = Infinity;

    // Sort spaces by position (bottom-left-front first) and size
    const sortedSpaces = [...this.spaces].sort((a, b) => {
      // Prefer larger spaces first
      const volumeA = a.length * a.width * a.height;
      const volumeB = b.length * b.width * b.height;
      if (Math.abs(volumeA - volumeB) > 0.1) {
        return volumeB - volumeA;
      }
      // Then by position
      if (a.y !== b.y) return a.y - b.y;
      if (a.z !== b.z) return a.z - b.z;
      return a.x - b.x;
    });

    for (const space of sortedSpaces) {
      // Try both rotations
      for (const rotation of [0, 90] as const) {
        const rotatedDimensions = this.rotateBox(box, rotation);

        if (this.fitsInSpace(rotatedDimensions, space)) {
          const score = this.calculateSpaceScore(rotatedDimensions, space);
          if (score < bestScore) {
            bestScore = score;
            bestSpace = space;
            bestRotation = rotation;
            bestDimensions = rotatedDimensions;
          }
        }
      }
    }

    return bestSpace
      ? { space: bestSpace, rotation: bestRotation, dimensions: bestDimensions }
      : null;
  }

  private mergeSpaces(): void {
    let merged = true;
    let iterations = 0;
    const maxIterations = 100;
    const padding = this.padding;
    const epsilon = 0.01;

    while (merged && iterations < maxIterations) {
      merged = false;
      iterations++;

      for (let i = 0; i < this.spaces.length; i++) {
        for (let j = i + 1; j < this.spaces.length; j++) {
          const space1 = this.spaces[i];
          const space2 = this.spaces[j];

          // Merge along X-axis
          if (
            Math.abs(space1.y - space2.y) < epsilon &&
            Math.abs(space1.z - space2.z) < epsilon &&
            Math.abs(space1.height - space2.height) < epsilon &&
            Math.abs(space1.width - space2.width) < epsilon &&
            Math.abs(space1.x + space1.length + padding - space2.x) < epsilon
          ) {
            this.spaces[i] = {
              ...space1,
              length: space1.length + space2.length + padding,
            };
            this.spaces.splice(j, 1);
            merged = true;
            break;
          }

          // Merge along Y-axis
          if (
            Math.abs(space1.x - space2.x) < epsilon &&
            Math.abs(space1.z - space2.z) < epsilon &&
            Math.abs(space1.length - space2.length) < epsilon &&
            Math.abs(space1.width - space2.width) < epsilon &&
            Math.abs(space1.y + space1.height + padding - space2.y) < epsilon
          ) {
            this.spaces[i] = {
              ...space1,
              height: space1.height + space2.height + padding,
            };
            this.spaces.splice(j, 1);
            merged = true;
            break;
          }

          // Merge along Z-axis
          if (
            Math.abs(space1.x - space2.x) < epsilon &&
            Math.abs(space1.y - space2.y) < epsilon &&
            Math.abs(space1.length - space2.length) < epsilon &&
            Math.abs(space1.height - space2.height) < epsilon &&
            Math.abs(space1.z + space1.width + padding - space2.z) < epsilon
          ) {
            this.spaces[i] = {
              ...space1,
              width: space1.width + space2.width + padding,
            };
            this.spaces.splice(j, 1);
            merged = true;
            break;
          }
        }

        if (merged) break;
      }
    }
  }

  optimizeBoxes(boxes: Box[]): Box[] {
    // Sort boxes by volume (largest first) for better packing
    const sortedBoxes = [...boxes].sort(
      (a, b) => b.length * b.width * b.height - a.length * a.width * a.height,
    );

    const result: Box[] = [];
    const padding = this.padding;

    // Reset spaces to full container with padding
    this.spaces = [
      {
        x: padding,
        y: padding,
        z: padding,
        length: this.container.length - 2 * padding,
        width: this.container.width - 2 * padding,
        height: this.container.height - 2 * padding,
      },
    ];

    for (const box of sortedBoxes) {
      const bestFit = this.findBestSpace(box);

      if (bestFit) {
        const { space, rotation, dimensions } = bestFit;

        // Place the box with padding considered
        const placedPosition = {
          x: space.x + dimensions.length / 2, // Center X for Three.js
          y: space.y + dimensions.height / 2, // Center Y (from ground up)
          z: space.z + dimensions.width / 2, // Center Z
        };

        const placedBox: Box = {
          ...box,
          position: placedPosition,
          rotation: rotation,
          placed: true,
        };

        result.push(placedBox);

        // Remove the used space
        this.spaces = this.spaces.filter((s) => s !== space);

        // Add new spaces from the split
        const placedDimensions = {
          x: space.x,
          y: space.y,
          z: space.z,
          length: dimensions.length,
          width: dimensions.width,
          height: dimensions.height,
        };

        const newSpaces = this.splitSpace(space, placedDimensions);
        this.spaces.push(...newSpaces);

        // Sort and merge spaces
        this.spaces.sort((a, b) => {
          const volumeA = a.length * a.width * a.height;
          const volumeB = b.length * b.width * b.height;
          return volumeB - volumeA;
        });

        this.mergeSpaces();
      } else {
        // Box doesn't fit, add it as unplaced
        result.push({ ...box, placed: false });
      }
    }

    // Add back any boxes that weren't in the original sort order
    const placedIds = new Set(result.map((b) => b.id));
    const unplacedBoxes = boxes.filter((b) => !placedIds.has(b.id));

    return [...result, ...unplacedBoxes];
  }

  // Method to adjust padding
  setPadding(padding: number): void {
    this.padding = padding;
  }
}
