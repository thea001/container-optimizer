// src/components/BoxList.tsx
import React, { useState } from "react";
import { useContainerStore } from "../store/containerStore";
import { Trash2, Package, Square, Scale, RotateCw } from "lucide-react";
import clsx from "clsx";

export const BoxList: React.FC = () => {
  const { boxes, removeBox, isOptimized } = useContainerStore();
  const [expandedBox, setExpandedBox] = useState<string | null>(null);

  if (boxes.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No boxes added yet</p>
        <p className="text-sm text-gray-400 mt-1">
          Click "Add Box" to start loading
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b bg-gray-50">
        <h3 className="font-semibold flex items-center justify-between">
          <span>Boxes ({boxes.length})</span>
          {isOptimized && (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              Optimized
            </span>
          )}
        </h3>
      </div>

      <div className="divide-y max-h-[400px] overflow-y-auto">
        {boxes.map((box) => (
          <div
            key={box.id}
            className={clsx(
              "p-4 hover:bg-gray-50 transition-colors cursor-pointer",
              expandedBox === box.id && "bg-gray-50",
            )}
            onClick={() =>
              setExpandedBox(expandedBox === box.id ? null : box.id)
            }
          >
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-md flex-shrink-0 "
                style={{ backgroundColor: box.color }}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900 truncate">
                      {box.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Square
                          className={clsx(
                            "w-3 h-3",
                            box.placed ? "text-green-500" : "text-yellow-500",
                          )}
                        />
                        {box.length}m × {box.width}m × {box.height}m
                      </span>
                      <span className="flex items-center gap-1">
                        <Scale className="w-3 h-3" />
                        {box.weight}kg
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeBox(box.id);
                    }}
                    className="text-gray-400 hover:text-red-600 transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {expandedBox === box.id && (
                  <div className={" mt-3 pt-3 border-t text-sm"}>
                    <div className="grid grid-cols-2 gap-2 text-gray-600">
                      <div>
                        <p className="text-xs text-gray-400">Volume</p>
                        <p className="font-medium">
                          {(box.length * box.width * box.height).toFixed(2)} m³
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Status</p>
                        <p
                          className={clsx(
                            "font-medium",
                            box.placed ? "text-green-600" : "text-yellow-600",
                          )}
                        >
                          {box.placed ? "Placed" : "Not placed"}
                        </p>
                      </div>
                      {box.rotation !== undefined && (
                        <div className="col-span-2">
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <RotateCw className="w-3 h-3" />
                            Rotation
                          </p>
                          <p className="font-medium">{box.rotation}°</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
