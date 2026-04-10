// src/components/ContainerSetup.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { useContainerStore } from "../store/containerStore";
import { Container } from "../types";
import { Package, Scale, Ruler } from "lucide-react";

interface ContainerFormData {
  name: string;
  length: number;
  width: number;
  height: number;
  maxWeight: number;
}

export const ContainerSetup: React.FC = () => {
  const { setContainer, container } = useContainerStore();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContainerFormData>({
    defaultValues: container || {
      name: "Remorque",
      length: 60, // 600cm = 6m
      width: 24, // 240cm = 2.4m
      height: 26, // 260cm = 2.6m
      maxWeight: 50,
    },
  });

  const onSubmit = (data: ContainerFormData) => {
    const newContainer: Container = {
      id: crypto.randomUUID(),
      ...data,
      length: Number(data.length),
      width: Number(data.width),
      height: Number(data.height),
      maxWeight: Number(data.maxWeight),
    };
    setContainer(newContainer);
  };

  return (
    <div className="bg-white p-2 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Package className="w-5 h-5" />
        Configuration de la remorque
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom de la remorque
          </label>
          <input
            type="text"
            {...register("name", { required: "Le nom est requis" })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Longueur (cm)
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              {...register("length", {
                required: "Champ requis",
                min: { value: 0.1, message: "Minimum 0.1 m" },
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            {errors.length && (
              <p className="mt-1 text-xs text-red-600">
                {errors.length.message}
              </p>
            )}
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
                required: "Champ requis",
                min: { value: 0.1, message: "Minimum 0.1 m" },
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            {errors.width && (
              <p className="mt-1 text-xs text-red-600">
                {errors.width.message}
              </p>
            )}
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
                required: "Champ requis",
                min: { value: 0.1, message: "Minimum 0.1 m" },
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            {errors.height && (
              <p className="mt-1 text-xs text-red-600">
                {errors.height.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Poids maximum (kg)
          </label>
          <div className="relative">
            <Scale className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="number"
              step="1"
              min="1"
              {...register("maxWeight", {
                required: "Champ requis",
                min: { value: 1, message: "Minimum 1 kg" },
              })}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          {errors.maxWeight && (
            <p className="mt-1 text-sm text-red-600">
              {errors.maxWeight.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Définir les dimensions
        </button>
      </form>

      {container && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800">
            ✓ Remorque configurée : {container.name}
          </p>
          <p className="text-xs text-green-600 mt-1">
            {container.length}m × {container.width}m × {container.height}m | Max
            : {container.maxWeight}kg
          </p>
        </div>
      )}
    </div>
  );
};
