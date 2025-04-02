import React, { useState } from 'react';
import { PauseOctagon } from 'lucide-react';
import ProtocolDesigner from './components/ProtocolDesigner';
import DataViewer from './components/DataViewer';
import WellPlate from './components/WellPlate';
import MeltAnalysis from './components/MeltAnalysis';

type View = 'protocol' | 'data' | 'wells' | 'melt';

function App() {
  const [currentView, setCurrentView] = useState<View>('protocol');
  const [isProtocolRunning, setIsProtocolRunning] = useState(false);
  const [isDeviceConnected, setIsDeviceConnected] = useState(false);

  const renderView = () => {
    switch (currentView) {
      case 'protocol':
        return <ProtocolDesigner 
          isProtocolRunning={isProtocolRunning} 
          setIsProtocolRunning={setIsProtocolRunning} 
        />;
      case 'data':
        return <DataViewer />;
      case 'wells':
        return <WellPlate />;
      case 'melt':
        return <MeltAnalysis />;
      default:
        return <ProtocolDesigner 
          isProtocolRunning={isProtocolRunning} 
          setIsProtocolRunning={setIsProtocolRunning} 
        />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced Header */}
      <header className="bg-white shadow-md">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
              iNTERface
            </h1>
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full shadow-sm border border-gray-200">
              <div 
                className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                  isDeviceConnected ? 'bg-emerald-500 shadow-lg' : 'bg-red-500'
                }`}
              />
              <span className="text-sm font-medium text-gray-700">
                {isDeviceConnected ? 'Device Connected' : 'Device Disconnected'}
              </span>
            </div>
          </div>
          <button 
            className={`px-5 py-2.5 bg-red-600 text-white rounded-lg transition-all duration-200 flex items-center gap-2 font-medium shadow-sm
              ${!isProtocolRunning 
                ? 'opacity-50 cursor-not-allowed bg-gray-400' 
                : 'hover:bg-red-700 hover:shadow-md active:transform active:scale-95'
              }`}
            disabled={!isProtocolRunning}
            onClick={() => isProtocolRunning && setIsProtocolRunning(false)}
          >
            <PauseOctagon className="h-5 w-5" />
            Halt Machine
          </button>
        </div>
        {/* Enhanced Navigation */}
        <nav className="px-6 py-2 border-t border-gray-100 bg-white/50 backdrop-blur-sm">
          <div className="flex space-x-6">
            {[
              { id: 'protocol', label: 'Protocol Designer' },
              { id: 'data', label: 'Data Analysis' },
              { id: 'wells', label: 'Well Layout' },
              { id: 'melt', label: 'Melt Analysis' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as View)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${currentView === item.id
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                  }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </nav>
      </header>

      {/* Enhanced Main Content */}
      <main className="p-8 max-w-7xl mx-auto">
        {renderView()}
      </main>

      {/* Enhanced Status Bar */}
      <footer className="fixed bottom-0 left-0 right-0 bg-gray-900 bg-opacity-95 backdrop-blur-sm text-white px-6 py-3 text-sm shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div 
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                isProtocolRunning 
                  ? 'bg-green-500 blob-pulse-1' 
                  : 'bg-red-500'
              }`}
            />
            <div 
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                isProtocolRunning 
                  ? 'bg-green-500 blob-pulse-2' 
                  : 'bg-red-500'
              }`}
            />
            <div 
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                isProtocolRunning 
                  ? 'bg-green-500 blob-pulse-3' 
                  : 'bg-red-500'
              }`}
            />
          </div>
          <span className="font-medium tracking-wide">
            {isProtocolRunning ? 'EXPERIMENT IN PROGRESS' : 'NO EXPERIMENT RUNNING'}
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;