import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const sampleData = Array.from({ length: 40 }, (_, i) => ({
  cycle: i,
  ch1: Math.exp(i/10) - 1 + Math.random() * 0.5,
  ch2: Math.exp(i/12) - 1 + Math.random() * 0.5,
}));

export default function DataViewer() {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between mb-4">
        <h2 className="text-lg font-semibold">Amplification Curve</h2>
        <div className="flex space-x-4">
          <select className="border rounded px-2 py-1">
            <option>Linear</option>
            <option>Log</option>
          </select>
          <select className="border rounded px-2 py-1">
            <option>Well</option>
            <option>Target</option>
            <option>Sample</option>
          </select>
        </div>
      </div>

      <div className="flex">
        <div className="flex-1">
          <LineChart width={800} height={400} data={sampleData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="cycle" label={{ value: 'Cycle Number', position: 'bottom' }} />
            <YAxis label={{ value: 'RFU', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="ch1" stroke="#8884d8" dot={false} />
            <Line type="monotone" dataKey="ch2" stroke="#82ca9d" dot={false} />
          </LineChart>
        </div>

        <div className="w-64 ml-4">
          <div className="border rounded p-4">
            <h3 className="font-semibold mb-2">Well Data</h3>
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left">Well</th>
                  <th className="text-left">Cq</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>A1</td>
                  <td>18.13</td>
                </tr>
                <tr>
                  <td>A2</td>
                  <td>11.94</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}