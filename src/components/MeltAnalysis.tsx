import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const sampleData = Array.from({ length: 100 }, (_, i) => ({
  temperature: 60 + (i * 0.35),
  fluorescence: Math.exp(-(Math.pow(i-50, 2)/200)) + Math.random() * 0.1,
  derivative: i > 0 && i < 99 ? -Math.exp(-(Math.pow(i-50, 2)/200))/100 : 0
}));

export default function MeltAnalysis() {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between mb-4">
        <h2 className="text-lg font-semibold">Melt Curve Analysis</h2>
        <div className="flex space-x-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Analyze Peaks
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold mb-2">Melt Curve</h3>
          <LineChart width={500} height={300} data={sampleData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="temperature" 
              label={{ value: 'Temperature (°C)', position: 'bottom' }}
            />
            <YAxis label={{ value: 'Fluorescence', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="fluorescence" 
              stroke="#8884d8" 
              dot={false}
            />
          </LineChart>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Derivative Plot</h3>
          <LineChart width={500} height={300} data={sampleData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="temperature" 
              label={{ value: 'Temperature (°C)', position: 'bottom' }}
            />
            <YAxis 
              label={{ value: '-dF/dT', angle: -90, position: 'insideLeft' }} 
            />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="derivative" 
              stroke="#82ca9d" 
              dot={false}
            />
          </LineChart>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold mb-2">Peak Analysis</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-2 text-left">Well</th>
              <th className="px-4 py-2 text-left">Peak 1</th>
              <th className="px-4 py-2 text-left">Peak 2</th>
              <th className="px-4 py-2 text-left">Peak 3</th>
              <th className="px-4 py-2 text-left">Peak 4</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-4 py-2">A1</td>
              <td className="px-4 py-2">78.5°C</td>
              <td className="px-4 py-2">82.3°C</td>
              <td className="px-4 py-2">-</td>
              <td className="px-4 py-2">-</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}