// src/components/Controls.tsx
import React, { useState } from 'react';
import { useContainerStore } from '../store/containerStore';
import { Zap, RotateCcw, Plus, Trash2, Download, Upload } from 'lucide-react';
import { AddBoxModal } from './AddBoxModal';

export const Controls: React.FC = () => {
  const { optimize, reset, clearAllBoxes, container, boxes } = useContainerStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleExport = () => {
    const data = {
      container: useContainerStore.getState().container,
      boxes: useContainerStore.getState().boxes,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `container-load-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        // Here you would dispatch actions to load the data
        console.log('Imported data:', data);
      } catch (error) {
        alert('Invalid file format');
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            disabled={!container}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            Add Box
          </button>

          <button
            onClick={optimize}
            disabled={!container || boxes.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Zap className="w-4 h-4" />
            Optimize
          </button>

          <button
            onClick={reset}
            disabled={!container || boxes.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>

          <button
            onClick={clearAllBoxes}
            disabled={!container || boxes.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>

          <div className="flex-1" />

          <button
            onClick={handleExport}
            disabled={!container || boxes.length === 0}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Export
          </button>

          <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            Import
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <AddBoxModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};