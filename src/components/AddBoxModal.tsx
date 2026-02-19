// src/components/AddBoxModal.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Package, Scale, Ruler, Palette } from 'lucide-react';
import { useContainerStore } from '../store/containerStore';

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
  color: string;
}

const PRESET_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
  '#FFEEAD', '#D4A5A5', '#9B59B6', '#3498DB',
  '#E67E22', '#2ECC71', '#E74C3C', '#F1C40F'
];

export const AddBoxModal: React.FC<AddBoxModalProps> = ({ isOpen, onClose }) => {
  const { addBox } = useContainerStore();
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<BoxFormData>({
    defaultValues: {
      name: '',
      length: 1,
      width: 1,
      height: 1,
      weight: 10,
      color: PRESET_COLORS[0]
    }
  });

  const onSubmit = (data: BoxFormData) => {
    addBox({
      ...data,
      length: Number(data.length),
      width: Number(data.width),
      height: Number(data.height),
      weight: Number(data.weight),
      color: selectedColor
    });
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
            Add New Box
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
              Box Name
            </label>
            <input
              type="text"
              {...register('name', { required: 'Name is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Product A"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Length (m)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                {...register('length', { 
                  required: 'Required',
                  min: { value: 0.1, message: 'Min 0.1m' }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Width (m)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                {...register('width', { 
                  required: 'Required',
                  min: { value: 0.1, message: 'Min 0.1m' }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Height (m)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                {...register('height', { 
                  required: 'Required',
                  min: { value: 0.1, message: 'Min 0.1m' }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Weight (kg)
            </label>
            <div className="relative">
              <Scale className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                step="0.1"
                min="0.1"
                {...register('weight', { 
                  required: 'Required',
                  min: { value: 0.1, message: 'Min 0.1kg' }
                })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="grid grid-cols-6 gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    selectedColor === color 
                      ? 'border-blue-500 scale-110' 
                      : 'border-transparent hover:scale-105'
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
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Box
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};