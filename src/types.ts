export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Container {
  id: string;
  name: string;
  length: number;
  width: number;
  height: number;
  maxWeight: number;
}

export interface Box {
  id: string;
  name: string;
  length: number;
  width: number;
  height: number;
  weight: number;
  color: string;
  position?: Vector3;
  rotation?: 0 | 90;
  placed: boolean;
}

export interface Space {
  x: number;
  y: number;
  z: number;
  length: number;
  width: number;
  height: number;
}

export interface KPIs {
  totalWeight: number;
  maxWeight: number;
  filledVolume: number;
  totalVolume: number;
  boxesPlaced: number;
  totalBoxes: number;
  remainingVolume: number;
  weightPercentage: number;
  volumePercentage: number;
  utilizationScore: number;
}