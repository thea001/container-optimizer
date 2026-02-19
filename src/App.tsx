// src/App.tsx
import React from 'react';
import { ContainerSetup } from './components/ContainerSetup';
import { Container3D } from './components/Container3D';
import { KPIDashboard } from './components/KPIDashboard';
import { Controls } from './components/Controls';
import { BoxList } from './components/BoxList';
import { useContainerStore } from './store/containerStore';

function App() {
  const { container } = useContainerStore();

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            3D Container Loading Optimizer
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Optimize space utilization for shipping containers
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left sidebar - Container Setup */}
          <div className="lg:col-span-1">
            <ContainerSetup />
            
            {container && (
              <div className="mt-6">
                <BoxList />
              </div>
            )}
          </div>

          {/* Main content - 3D Viewer and KPIs */}
          <div className="lg:col-span-3 space-y-6">
            {!container ? (
              <div className="bg-white p-12 rounded-lg shadow-md text-center">
                <div className="text-6xl mb-4">📦</div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  Configure Your Container First
                </h2>
                <p className="text-gray-500">
                  Set up your container dimensions and weight capacity to start loading boxes
                </p>
              </div>
            ) : (
              <>
                <Controls />
                <KPIDashboard />
                <Container3D />
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;