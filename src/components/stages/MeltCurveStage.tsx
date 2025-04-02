import React, { useState, useEffect } from 'react';
import { Stage } from '../types';

interface MeltCurveStageProps {
  stage: Stage;
  width: number;
  height: number;
  padding: number;
  onStepSelect: (stepIndex: number) => void;
  onTemperatureChange: (stepIndex: number, temperature: number) => void;
  onDurationChange: (stepIndex: number, duration: string) => void;
  selectedStepIndex: number | null;
  isEnabled: boolean;
  selectedLane: 1 | 2;
}

interface DragState {
  stepIndex: number;
  startY: number;
  startTemp: number;
}

export function MeltCurveStage({
  stage,
  width,
  height,
  padding,
  onStepSelect,
  onTemperatureChange,
  onDurationChange,
  selectedStepIndex,
  isEnabled,
  selectedLane,
}: MeltCurveStageProps) {
  const [primaryDragState, setPrimaryDragState] = useState<DragState | null>(null);
  const [secondaryDragState, setSecondaryDragState] = useState<DragState | null>(null);
  const [primaryDurationEdit, setPrimaryDurationEdit] = useState<{ stepIndex: number; value: string } | null>(null);
  const [secondaryDurationEdit, setSecondaryDurationEdit] = useState<{ stepIndex: number; value: string } | null>(null);

  const zoneStart = padding + 2 * width;
  const zoneEnd = zoneStart + width;
  const stepWidth = width / stage.steps.length;

  const scaleYPrimary = (temp: number) => (
    padding + (220 - (temp + 100)) * ((height - 2 * padding) / (220 - 10))
  );

  const scaleYSecondary = (temp: number) => (
    padding + (220 - temp) * ((height - 2 * padding) / (220 - 10))
  );

  const isLineActive = (isSecondaryLine: boolean) => {
    if (!isEnabled) return false;
    return (selectedLane === 1 && !isSecondaryLine) || (selectedLane === 2 && isSecondaryLine);
  };

  const generatePrimaryPath = () => {
    const points = stage.steps.map((step, i) => ({
      x: zoneStart + (i + 0.5) * stepWidth,
      y: scaleYPrimary(step.lane1.temperature)
    }));

    return `M ${zoneStart} ${points[0].y} ` +
      points.map((point, i) => {
        if (i === 0) return `L ${point.x} ${point.y}`;
        
        const prev = points[i - 1];
        const controlX = (prev.x + point.x) / 2;
        return `C ${controlX} ${prev.y} ${controlX} ${point.y} ${point.x} ${point.y}`;
      }).join(' ') +
      ` L ${zoneEnd} ${points[points.length - 1].y}`;
  };

  const generateSecondaryPath = () => {
    const points = stage.steps.map((step, i) => ({
      x: zoneStart + (i + 0.5) * stepWidth,
      y: scaleYSecondary(step.lane2.temperature)
    }));

    return `M ${zoneStart} ${points[0].y} ` +
      points.map((point, i) => {
        if (i === 0) return `L ${point.x} ${point.y}`;
        
        const prev = points[i - 1];
        const controlX = (prev.x + point.x) / 2;
        return `C ${controlX} ${prev.y} ${controlX} ${point.y} ${point.x} ${point.y}`;
      }).join(' ') +
      ` L ${zoneEnd} ${points[points.length - 1].y}`;
  };

  const handlePrimaryMouseDown = (e: React.MouseEvent<SVGGElement>, stepIndex: number) => {
    if (!isLineActive(false)) return;
    
    setPrimaryDragState({
      stepIndex,
      startY: e.clientY,
      startTemp: stage.steps[stepIndex].lane1.temperature
    });
    onStepSelect(stepIndex);
  };

  const handleSecondaryMouseDown = (e: React.MouseEvent<SVGGElement>, stepIndex: number) => {
    if (!isLineActive(true)) return;
    
    setSecondaryDragState({
      stepIndex,
      startY: e.clientY,
      startTemp: stage.steps[stepIndex].lane2.temperature
    });
    onStepSelect(stepIndex);
  };

  useEffect(() => {
    if (!primaryDragState) return;

    const handlePrimaryMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - primaryDragState.startY;
      const tempChange = Math.round(deltaY * 0.5);
      const newTemp = Math.max(30, Math.min(97, primaryDragState.startTemp - tempChange));
      stage.steps[primaryDragState.stepIndex].lane1.temperature = newTemp;
      onTemperatureChange(primaryDragState.stepIndex, newTemp);
    };

    const handlePrimaryMouseUp = () => {
      setPrimaryDragState(null);
    };

    document.addEventListener('mousemove', handlePrimaryMouseMove);
    document.addEventListener('mouseup', handlePrimaryMouseUp);
    return () => {
      document.removeEventListener('mousemove', handlePrimaryMouseMove);
      document.removeEventListener('mouseup', handlePrimaryMouseUp);
    };
  }, [primaryDragState]);

  useEffect(() => {
    if (!secondaryDragState) return;

    const handleSecondaryMouseMove = (e: MouseEvent) => {
      const deltaY = e.clientY - secondaryDragState.startY;
      const tempChange = Math.round(deltaY * 0.5);
      const newTemp = Math.max(30, Math.min(97, secondaryDragState.startTemp - tempChange));
      stage.steps[secondaryDragState.stepIndex].lane2.temperature = newTemp;
      onTemperatureChange(secondaryDragState.stepIndex, newTemp);
    };

    const handleSecondaryMouseUp = () => {
      setSecondaryDragState(null);
    };

    document.addEventListener('mousemove', handleSecondaryMouseMove);
    document.addEventListener('mouseup', handleSecondaryMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleSecondaryMouseMove);
      document.removeEventListener('mouseup', handleSecondaryMouseUp);
    };
  }, [secondaryDragState]);

  const handleDurationClick = (e: React.MouseEvent, stepIndex: number, isSecondaryLine: boolean) => {
    if (!isLineActive(isSecondaryLine)) return;
    e.stopPropagation();
    if (isSecondaryLine) {
      setSecondaryDurationEdit({ stepIndex, value: stage.steps[stepIndex].lane2.duration });
    } else {
      setPrimaryDurationEdit({ stepIndex, value: stage.steps[stepIndex].lane1.duration });
    }
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^[0-5]?[0-9]?(:[0-5]?[0-9]?)?$/.test(value)) {
      if (primaryDurationEdit) {
        setPrimaryDurationEdit(prev => ({ ...prev!, value }));
      } else if (secondaryDurationEdit) {
        setSecondaryDurationEdit(prev => ({ ...prev!, value }));
      }
    }
  };

  const handleDurationBlur = () => {
    if (primaryDurationEdit?.value.match(/^[0-5][0-9]:[0-5][0-9]$/)) {
      stage.steps[primaryDurationEdit.stepIndex].lane1.duration = primaryDurationEdit.value;
      onDurationChange(primaryDurationEdit.stepIndex, primaryDurationEdit.value);
    } else if (secondaryDurationEdit?.value.match(/^[0-5][0-9]:[0-5][0-9]$/)) {
      stage.steps[secondaryDurationEdit.stepIndex].lane2.duration = secondaryDurationEdit.value;
      onDurationChange(secondaryDurationEdit.stepIndex, secondaryDurationEdit.value);
    }
    setPrimaryDurationEdit(null);
    setSecondaryDurationEdit(null);
  };

  const handleDurationKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleDurationBlur();
    } else if (e.key === 'Escape') {
      setPrimaryDurationEdit(null);
      setSecondaryDurationEdit(null);
    }
  };

  return (
    <g style={{ cursor: isEnabled ? 'pointer' : 'not-allowed' }}>
      <rect
        x={zoneStart}
        y={padding}
        width={width}
        height={height - 2 * padding}
        fill={isEnabled ? "#f8fafc" : "#e5e7eb"}
        stroke="#94a3b8"
        strokeWidth="1"
      />

      <path
        d={generatePrimaryPath()}
        stroke="#dc2626"
        strokeWidth="3"
        fill="none"
        opacity={!isEnabled ? 0.3 : selectedLane === 1 ? 1 : 0.3}
        pointerEvents={!isEnabled || selectedLane !== 1 ? 'none' : 'auto'}
      />

      <path
        d={generateSecondaryPath()}
        stroke="#0891b2"
        strokeWidth="3"
        fill="none"
        opacity={!isEnabled ? 0.3 : selectedLane === 2 ? 1 : 0.3}
        pointerEvents={!isEnabled || selectedLane !== 2 ? 'none' : 'auto'}
      />

      {stage.steps.map((step, index) => (
        <React.Fragment key={index}>
          <g 
            onMouseDown={(e) => handlePrimaryMouseDown(e, index)}
            style={{ 
              cursor: !isEnabled ? 'not-allowed' : selectedLane === 1 ? 'ns-resize' : 'not-allowed',
              pointerEvents: !isEnabled || selectedLane !== 1 ? 'none' : 'auto'
            }}
            opacity={!isEnabled ? 0.3 : selectedLane === 1 ? 1 : 0.3}
          >
            <circle
              cx={zoneStart + (index + 0.5) * stepWidth}
              cy={scaleYPrimary(step.lane1.temperature)}
              r={8}
              fill={step.lane1.plateRead ? '#ef4444' : (selectedStepIndex === index ? '#7f1d1d' : '#fca5a5')}
            />
            <text
              x={zoneStart + (index + 0.5) * stepWidth}
              y={scaleYPrimary(step.lane1.temperature) - 15}
              textAnchor="middle"
              fill="#1f2937"
              fontSize={12}
            >
              {`${step.lane1.temperature}°C`}
            </text>
            {primaryDurationEdit?.stepIndex === index ? (
              <foreignObject
                x={zoneStart + (index + 0.5) * stepWidth - 30}
                y={scaleYPrimary(step.lane1.temperature) + 15}
                width={60}
                height={30}
              >
                <input
                  type="text"
                  value={primaryDurationEdit.value}
                  onChange={handleDurationChange}
                  onBlur={handleDurationBlur}
                  onKeyDown={handleDurationKeyDown}
                  className="w-full text-center text-sm border rounded px-1 py-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </foreignObject>
            ) : (
              <text
                x={zoneStart + (index + 0.5) * stepWidth}
                y={scaleYPrimary(step.lane1.temperature) + 25}
                textAnchor="middle"
                fill="#64748b"
                fontSize={12}
                onClick={(e) => handleDurationClick(e, index, false)}
                style={{ cursor: 'pointer' }}
              >
                {step.lane1.duration}
              </text>
            )}
          </g>

          <g 
            onMouseDown={(e) => handleSecondaryMouseDown(e, index)}
            style={{ 
              cursor: !isEnabled ? 'not-allowed' : selectedLane === 2 ? 'ns-resize' : 'not-allowed',
              pointerEvents: !isEnabled || selectedLane !== 2 ? 'none' : 'auto'
            }}
            opacity={!isEnabled ? 0.3 : selectedLane === 2 ? 1 : 0.3}
          >
            <circle
              cx={zoneStart + (index + 0.5) * stepWidth}
              cy={scaleYSecondary(step.lane2.temperature)}
              r={8}
              fill={step.lane2.plateRead ? '#ef4444' : (selectedStepIndex === index ? '#164e63' : '#67e8f9')}
            />
            <text
              x={zoneStart + (index + 0.5) * stepWidth}
              y={scaleYSecondary(step.lane2.temperature) - 15}
              textAnchor="middle"
              fill="#1f2937"
              fontSize={12}
            >
              {`${step.lane2.temperature}°C`}
            </text>
            {secondaryDurationEdit?.stepIndex === index ? (
              <foreignObject
                x={zoneStart + (index + 0.5) * stepWidth - 30}
                y={scaleYSecondary(step.lane2.temperature) + 15}
                width={60}
                height={30}
              >
                <input
                  type="text"
                  value={secondaryDurationEdit.value}
                  onChange={handleDurationChange}
                  onBlur={handleDurationBlur}
                  onKeyDown={handleDurationKeyDown}
                  className="w-full text-center text-sm border rounded px-1 py-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </foreignObject>
            ) : (
              <text
                x={zoneStart + (index + 0.5) * stepWidth}
                y={scaleYSecondary(step.lane2.temperature) + 25}
                textAnchor="middle"
                fill="#64748b"
                fontSize={12}
                onClick={(e) => handleDurationClick(e, index, true)}
                style={{ cursor: 'pointer' }}
              >
                {step.lane2.duration}
              </text>
            )}
          </g>
        </React.Fragment>
      ))}
    </g>
  );
}