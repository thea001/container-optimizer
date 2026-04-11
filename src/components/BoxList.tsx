import React, { useState, useMemo } from "react";
import { useContainerStore } from "../store/containerStore";
import {
  Trash2,
  Package,
  Square,
  Scale,
  RotateCw,
  CheckCircle,
  XCircle,
  Layers,
  Weight,
  Box,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
} from "lucide-react";
import clsx from "clsx";

export const BoxList: React.FC = () => {
  const { boxes, removeBox, isOptimized } = useContainerStore();
  const [expandedBox, setExpandedBox] = useState<string | null>(null);
  const [showPlaced, setShowPlaced] = useState(true);
  const [showUnplaced, setShowUnplaced] = useState(true);
  const [sortBy, setSortBy] = useState<"name" | "weight" | "volume" | "status">(
    "status",
  );

  // Calculate statistics
  const statistics = useMemo(() => {
    const placed = boxes.filter((b) => b.placed);
    const unplaced = boxes.filter((b) => !b.placed);

    const totalVolume = boxes.reduce(
      (sum, box) => sum + box.length * box.width * box.height,
      0,
    );

    const placedVolume = placed.reduce(
      (sum, box) => sum + box.length * box.width * box.height,
      0,
    );

    const totalWeight = boxes.reduce((sum, box) => sum + box.weight, 0);
    const placedWeight = placed.reduce((sum, box) => sum + box.weight, 0);

    return {
      total: boxes.length,
      placed: placed.length,
      unplaced: unplaced.length,
      placementRate:
        boxes.length > 0 ? (placed.length / boxes.length) * 100 : 0,
      totalVolume,
      placedVolume,
      volumeUtilization:
        totalVolume > 0 ? (placedVolume / totalVolume) * 100 : 0,
      totalWeight,
      placedWeight,
      weightUtilization:
        totalWeight > 0 ? (placedWeight / totalWeight) * 100 : 0,
    };
  }, [boxes]);

  // Sort boxes based on selected criteria
  const sortedBoxes = useMemo(() => {
    const sorted = [...boxes];

    switch (sortBy) {
      case "name":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case "weight":
        return sorted.sort((a, b) => b.weight - a.weight);
      case "volume":
        return sorted.sort(
          (a, b) =>
            b.length * b.width * b.height - a.length * a.width * a.height,
        );
      case "status":
      default:
        return sorted.sort((a, b) => {
          if (a.placed === b.placed) return 0;
          return a.placed ? -1 : 1;
        });
    }
  }, [boxes, sortBy]);

  const placedBoxes = sortedBoxes.filter((b) => b.placed);
  const unplacedBoxes = sortedBoxes.filter((b) => !b.placed);

  if (boxes.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-xl shadow-sm text-center border border-gray-200">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Package className="w-10 h-10 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Aucune palette ajoutée
        </h3>
        <p className="text-gray-500 mb-4">
          Commencez par ajouter des palettes pour optimiser votre chargement
        </p>
        <div className="inline-flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-full">
          <span>✨</span>
          Cliquez sur "Ajouter une palette" pour commencer
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500">Total</span>
            <Package className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {statistics.total}
          </div>
          <div className="text-xs text-gray-500 mt-1">palettes</div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500">Placées</span>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {statistics.placed}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {statistics.placementRate.toFixed(0)}% du total
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500">Volume</span>
            <Box className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {(statistics.placedVolume / 1000).toFixed(0)}L
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {statistics.volumeUtilization.toFixed(0)}% utilisé
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500">Poids</span>
            <Weight className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {statistics.placedWeight}kg
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {statistics.weightUtilization.toFixed(0)}% du total
          </div>
        </div>
      </div>

      {/* Main Box List Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                Gestion des palettes
              </h3>
              {isOptimized && (
                <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  <TrendingUp className="w-3 h-3" />
                  Optimisé
                </span>
              )}
            </div>

            {/* Sort Controls */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Trier par:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs border border-gray-200 rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="status">Statut</option>
                <option value="name">Nom</option>
                <option value="weight">Poids</option>
                <option value="volume">Volume</option>
              </select>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>Progression du placement</span>
              <span>
                {statistics.placed}/{statistics.total} palettes
              </span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500"
                style={{ width: `${statistics.placementRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Section Toggles */}
        <div className="flex border-b bg-gray-50/50 p-2 gap-2">
          <button
            onClick={() => setShowPlaced(!showPlaced)}
            className={clsx(
              "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
              showPlaced
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200",
            )}
          >
            <CheckCircle className="w-4 h-4" />
            Placées ({placedBoxes.length})
            {showPlaced ? (
              <Eye className="w-3 h-3 ml-1" />
            ) : (
              <EyeOff className="w-3 h-3 ml-1" />
            )}
          </button>

          <button
            onClick={() => setShowUnplaced(!showUnplaced)}
            className={clsx(
              "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
              showUnplaced
                ? "bg-yellow-100 text-yellow-700"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200",
            )}
          >
            <XCircle className="w-4 h-4" />
            Non placées ({unplacedBoxes.length})
            {showUnplaced ? (
              <Eye className="w-3 h-3 ml-1" />
            ) : (
              <EyeOff className="w-3 h-3 ml-1" />
            )}
          </button>
        </div>

        {/* Box Lists */}
        <div className="divide-y max-h-[500px] overflow-y-auto">
          {/* Placed Boxes Section */}
          {showPlaced && placedBoxes.length > 0 && (
            <div className="bg-green-50/30">
              <div className="px-4 py-2 bg-green-50 border-b border-green-100">
                <h4 className="text-xs font-semibold text-green-700 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Palettes placées ({placedBoxes.length})
                </h4>
              </div>
              {placedBoxes.map((box) => (
                <BoxItem
                  key={box.id}
                  box={box}
                  expandedBox={expandedBox}
                  setExpandedBox={setExpandedBox}
                  removeBox={removeBox}
                />
              ))}
            </div>
          )}

          {/* Unplaced Boxes Section */}
          {showUnplaced && unplacedBoxes.length > 0 && (
            <div className="bg-yellow-50/30">
              <div className="px-4 py-2 bg-yellow-50 border-b border-yellow-100">
                <h4 className="text-xs font-semibold text-yellow-700 uppercase tracking-wider flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  Palettes non placées ({unplacedBoxes.length})
                </h4>
              </div>
              {unplacedBoxes.map((box) => (
                <BoxItem
                  key={box.id}
                  box={box}
                  expandedBox={expandedBox}
                  setExpandedBox={setExpandedBox}
                  removeBox={removeBox}
                />
              ))}
            </div>
          )}

          {/* Empty State Messages */}
          {showPlaced && placedBoxes.length === 0 && (
            <div className="p-8 text-center text-gray-400 bg-gray-50/50">
              <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Aucune palette placée</p>
            </div>
          )}

          {showUnplaced && unplacedBoxes.length === 0 && (
            <div className="p-8 text-center text-gray-400 bg-gray-50/50">
              <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Toutes les palettes sont placées !</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Separate Box Item Component for better organization
const BoxItem: React.FC<{
  box: any;
  expandedBox: string | null;
  setExpandedBox: (id: string | null) => void;
  removeBox: (id: string) => void;
}> = ({ box, expandedBox, setExpandedBox, removeBox }) => {
  const volume = (box.length * box.width * box.height).toFixed(0);

  return (
    <div
      className={clsx(
        "p-4 hover:bg-white transition-colors cursor-pointer border-b last:border-b-0",
        expandedBox === box.id && "bg-white shadow-inner",
        box.placed ? "hover:bg-green-50/50" : "hover:bg-yellow-50/50",
      )}
      onClick={() => setExpandedBox(expandedBox === box.id ? null : box.id)}
    >
      <div className="flex items-start gap-3">
        {/* Color indicator with status badge */}
        <div className="relative">
          <div
            className="w-12 h-12 rounded-lg flex-shrink-0 shadow-sm border-2 border-white"
            style={{ backgroundColor: box.color }}
          />
          <div
            className={clsx(
              "absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white",
              box.placed ? "bg-green-500" : "bg-yellow-500",
            )}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold text-gray-900 flex items-center gap-2">
                {box.name}
                {box.rotation !== undefined && (
                  <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                    <RotateCw className="w-2.5 h-2.5" />
                    {box.rotation}°
                  </span>
                )}
              </p>

              <div className="flex items-center gap-3 text-xs mt-1">
                <span className="flex items-center gap-1 text-gray-600">
                  <Square className="w-3 h-3" />
                  {box.length}×{box.width}×{box.height} cm
                </span>
                <span className="flex items-center gap-1 text-gray-600">
                  <Scale className="w-3 h-3" />
                  {box.weight} kg
                </span>
                <span className="flex items-center gap-1 text-gray-600">
                  <Box className="w-3 h-3" />
                  {volume} cm³
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeBox(box.id);
                }}
                className="text-gray-400 hover:text-red-600 transition-colors p-1.5 hover:bg-red-50 rounded-full"
                title="Supprimer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              {expandedBox === box.id ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </div>
          </div>

          {/* Expanded Details */}
          {expandedBox === box.id && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-xs text-gray-500">Volume détaillé</p>
                  <p className="text-sm font-medium">
                    {box.length} × {box.width} × {box.height} cm
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    = {volume} cm³ ({(Number(volume) / 1000).toFixed(2)} L)
                  </p>
                </div>

                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-xs text-gray-500">Informations</p>
                  <p className="text-sm font-medium">
                    ID: {box.id.slice(0, 8)}...
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Densité: {((box.weight / Number(volume)) * 1000).toFixed(2)}{" "}
                    kg/L
                  </p>
                </div>

                {box.position && (
                  <div className="col-span-2 bg-blue-50 p-2 rounded">
                    <p className="text-xs text-blue-600 font-medium mb-1">
                      Position dans le conteneur
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-blue-400">X:</span>{" "}
                        {box.position.x.toFixed(1)} cm
                      </div>
                      <div>
                        <span className="text-blue-400">Y:</span>{" "}
                        {box.position.y.toFixed(1)} cm
                      </div>
                      <div>
                        <span className="text-blue-400">Z:</span>{" "}
                        {box.position.z.toFixed(1)} cm
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
