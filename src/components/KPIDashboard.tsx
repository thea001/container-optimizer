// src/components/KPIDashboard.tsx
import React from "react";
import { useContainerStore } from "../store/containerStore";
import { Package, Scale, Box, Percent, TrendingUp } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  percentage?: number;
  color?: string;
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  icon,
  percentage,
  color = "blue",
}) => {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200",
    green: "bg-green-50 border-green-200",
    yellow: "bg-yellow-50 border-yellow-200",
    purple: "bg-purple-50 border-purple-200",
  };

  return (
    <div
      className={`p-4 rounded-lg border ${colorClasses[color as keyof typeof colorClasses]} relative overflow-hidden`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-semibold">{value}</p>
        </div>
        <div className={`p-2 rounded-lg bg-${color}-100`}>{icon}</div>
      </div>
      {percentage !== undefined && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
            <span>Utilization</span>
            <span>{percentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className={`bg-${color}-600 h-1.5 rounded-full transition-all duration-500`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export const KPIDashboard: React.FC = () => {
  const { calculateKPIs } = useContainerStore();
  const kpis = calculateKPIs();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <KPICard
        title="Weight Utilization"
        value={`${kpis.totalWeight.toFixed(1)} / ${kpis.maxWeight} kg`}
        icon={<Scale className="w-5 h-5 text-blue-600" />}
        percentage={kpis.weightPercentage}
        color="blue"
      />

      <KPICard
        title="Volume Utilization"
        value={`${kpis.filledVolume.toFixed(1)} / ${kpis.totalVolume.toFixed(1)} cm³`}
        icon={<Box className="w-5 h-5 text-green-600" />}
        percentage={kpis.volumePercentage}
        color="green"
      />

      <KPICard
        title="Boxes Placed"
        value={`${kpis.boxesPlaced} / ${kpis.totalBoxes}`}
        icon={<Package className="w-5 h-5 text-yellow-600" />}
        percentage={(kpis.boxesPlaced / Math.max(kpis.totalBoxes, 1)) * 100}
        color="yellow"
      />

      <KPICard
        title="Overall Efficiency"
        value={`${kpis.utilizationScore.toFixed(1)}%`}
        icon={<TrendingUp className="w-5 h-5 text-purple-600" />}
        percentage={kpis.utilizationScore}
        color="purple"
      />
    </div>
  );
};
