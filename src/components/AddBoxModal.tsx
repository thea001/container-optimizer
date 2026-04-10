import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { X, Package, Scale, Copy } from "lucide-react";
import { useContainerStore } from "../store/containerStore";

interface AddBoxModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BoxFormData {
  name: string;
  length: number;
  width: number;
  height: number;
  weight: number;
  quantity: number;
  color: string;
}

const PRESET_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEEAD",
  "#D4A5A5",
  "#9B59B6",
  "#3498DB",
  "#E67E22",
  "#2ECC71",
  "#E74C3C",
  "#F1C40F",
];

export const AddBoxModal: React.FC<AddBoxModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { addBox } = useContainerStore();
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<BoxFormData>({
    defaultValues: {
      name: "",
      length: 1,
      width: 1,
      height: 1,
      weight: 10,
      quantity: 1,
      color: PRESET_COLORS[0],
    },
  });

  // Watch values for dynamic calculations
  const watchWeight = watch("weight");
  const watchQuantity = watch("quantity");
  const totalWeight = (Number(watchWeight) || 0) * (Number(watchQuantity) || 1);

  const onSubmit = (data: BoxFormData) => {
    // Add multiple boxes with the same dimensions
    for (let i = 0; i < data.quantity; i++) {
      // Add a suffix to the name for multiple boxes
      const boxName = data.quantity > 1 ? `${data.name} #${i + 1}` : data.name;

      addBox({
        name: boxName,
        length: Number(data.length),
        width: Number(data.width),
        height: Number(data.height),
        weight: Number(data.weight),
        color: selectedColor,
      });
    }

    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Package className="w-5 h-5" />
            Ajouter des palettes
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de la palette
            </label>
            <input
              type="text"
              {...register("name", { required: "Le nom est requis" })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ex : Produit A"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Longueur (cm)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                {...register("length", {
                  required: "Requis",
                  min: { value: 0.1, message: "Min 0.1cm" },
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Largeur (cm)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                {...register("width", {
                  required: "Requis",
                  min: { value: 0.1, message: "Min 0.1cm" },
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hauteur (cm)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                {...register("height", {
                  required: "Requis",
                  min: { value: 0.1, message: "Min 0.1cm" },
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Poids unitaire (kg)
            </label>
            <div className="relative">
              <Scale className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                step="0.1"
                min="1"
                {...register("weight", {
                  required: "Requis",
                  min: { value: 1, message: "Min 1kg" },
                })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          {/* Quantity field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center gap-1">
                <Copy className="w-4 h-4" />
                Nombre de palettes
              </div>
            </label>
            <input
              type="number"
              min="1"
              max="100"
              step="1"
              {...register("quantity", {
                required: "Requis",
                min: { value: 1, message: "Minimum 1 palette" },
                max: { value: 100, message: "Maximum 100 palettes" },
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.quantity && (
              <p className="mt-1 text-sm text-red-600">
                {errors.quantity.message}
              </p>
            )}
          </div>

          {/* Total weight indicator */}
          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-sm text-blue-800 flex items-center justify-between">
              <span>Poids total:</span>
              <span className="font-semibold">{totalWeight.toFixed(1)} kg</span>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Couleur des palettes
            </label>
            <div className="grid grid-cols-6 gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    selectedColor === color
                      ? "border-blue-500 scale-110"
                      : "border-transparent hover:scale-105"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Ajouter {watchQuantity || 1} palette
              {(watchQuantity || 1) > 1 ? "s" : ""}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
