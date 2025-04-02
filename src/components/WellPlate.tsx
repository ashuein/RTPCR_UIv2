import React, { useState } from 'react';

interface Well {
  id: string;
  targets: string[];
  quantity?: number;
  lane: number;
}

export default function WellPlate() {
  const [selectedWell, setSelectedWell] = useState<string | null>(null);
  
  const createWellGrid = () => {
    const lane1Rows = 'AB'.split('');
    const lane2Rows = 'CD'.split('');
    const cols = Array.from({ length: 12 }, (_, i) => i + 1);
    
    // Create wells for both lanes
    const lane1 = lane1Rows.map(row =>
      cols.map(col => ({
        id: `L1-${row}${col}`,
        targets: [],
        lane: 1
      }))
    );

    const lane2 = lane2Rows.map(row =>
      cols.map(col => ({
        id: `L2-${row}${col}`,
        targets: [],
        lane: 2
      }))
    );

    return [lane1, lane2];
  };

  const [wellGrids] = useState(createWellGrid());

  const renderLane = (laneWells: Well[][], laneNumber: number) => (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-700 mb-3">Lane {laneNumber}</h3>
      <div className="grid grid-cols-12 gap-1">
        {laneWells.map((row, rowIndex) => (
          <React.Fragment key={rowIndex}>
            {row.map((well) => (
              <button
                key={well.id}
                className={`aspect-square border rounded-lg p-2 text-xs hover:bg-gray-50 ${
                  selectedWell === well.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedWell(well.id)}
              >
                <div className="h-full flex flex-col justify-between">
                  <div className="text-left text-gray-500">
                    {well.id.split('-')[1]} {/* Show only A1, B2, etc. */}
                  </div>
                  {well.targets.map((target, i) => (
                    <div
                      key={i}
                      className="w-full h-2 rounded-full bg-blue-500 mb-1"
                    />
                  ))}
                </div>
              </button>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Lane 1 Wells */}
      {renderLane(wellGrids[0], 1)}
      
      {/* Lane 2 Wells */}
      {renderLane(wellGrids[1], 2)}

      {/* Settings Panel */}
      <div className="grid grid-cols-2 gap-6 mt-8">
        <div>
          <h3 className="font-semibold mb-4">Sample Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Sample</label>
              <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                <option>Choose</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Ch 1 Target</label>
              <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                <option>GAPDH</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Ch 2 Target</label>
              <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                <option>HPRT</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-4">Current Selection</h3>
          {selectedWell ? (
            <div className="p-4 border rounded-lg">
              <p className="text-lg font-medium">Well {selectedWell}</p>
              <button 
                className="mt-4 w-full py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                onClick={() => setSelectedWell(null)}
              >
                Clear Selection
              </button>
            </div>
          ) : (
            <p className="text-gray-500">No well selected</p>
          )}
        </div>
      </div>
    </div>
  );
}