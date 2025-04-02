import React, { useState, useRef, useEffect } from 'react';
import { Play, Plus, Minus, Edit2, Settings, Activity, Camera, Download, PauseOctagon, Save as SaveIcon } from 'lucide-react';
import { HoldingStage } from './stages/HoldingStage';
import { CyclingStage } from './stages/CyclingStage';
import { MeltCurveStage } from './stages/MeltCurveStage';
import { Stage, Step, DragState } from './types';

export default function ProtocolDesigner({ 
  isProtocolRunning, 
  setIsProtocolRunning 
}: { 
  isProtocolRunning: boolean;
  setIsProtocolRunning: (running: boolean) => void;
}) {
  const [selectedStep, setSelectedStep] = useState<{ stageIndex: number; stepIndex: number } | null>(null);
  const [selectedStage, setSelectedStage] = useState<number | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentTemperature, setCurrentTemperature] = useState(55);
  const [runtimeLeft, setRuntimeLeft] = useState("00:15:00");
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  
  const [protocolCycles, setProtocolCycles] = useState(30);
  const [meltCurveEnabled, setMeltCurveEnabled] = useState<{
    lane1: boolean;
    lane2: boolean;
  }>({
    lane1: false,
    lane2: false,
  });
  const [selectedLane, setSelectedLane] = useState<1 | 2>(1);

  const [stagesLane1, setStagesLane1] = useState<Stage[]>([{
    name: 'HOLDING',
    steps: [
      {
        temperature: 55,
        duration: '15:00',
        rampRate: 3.5,
        lane1: { temperature: 55, duration: '15:00', rampRate: 3.5 },
        lane2: { temperature: 55, duration: '15:00', rampRate: 3.5 }
      }
    ],
    cycles: 1
  }, {
    name: 'CYCLING',
    steps: [
      {
        temperature: 95,
        duration: '02:00',
        rampRate: 3.5,
        lane1: { temperature: 95, duration: '02:00', rampRate: 3.5 },
        lane2: { temperature: 95, duration: '02:00', rampRate: 3.5 }
      },
      {
        temperature: 65,
        duration: '00:30',
        rampRate: 3.5,
        lane1: { temperature: 65, duration: '00:30', rampRate: 3.5 },
        lane2: { temperature: 65, duration: '00:30', rampRate: 3.5 }
      },
      {
        temperature: 72,
        duration: '00:20',
        rampRate: 3.5,
        lane1: { temperature: 72, duration: '00:20', rampRate: 3.5 },
        lane2: { temperature: 72, duration: '00:20', rampRate: 3.5 }
      }
    ],
    cycles: protocolCycles
  }, {
    name: 'MELT CURVE',
    steps: [
      {
        temperature: 60,
        duration: '00:15',
        rampRate: 3.5,
        lane1: { temperature: 60, duration: '00:15', rampRate: 3.5 },
        lane2: { temperature: 60, duration: '00:15', rampRate: 3.5 }
      },
      {
        temperature: 95,
        duration: '02:00',
        rampRate: 0.1,
        lane1: { temperature: 95, duration: '02:00', rampRate: 0.1 },
        lane2: { temperature: 95, duration: '02:00', rampRate: 0.1 }
      }
    ],
    cycles: 1
  }]);

  const [stagesLane2, setStagesLane2] = useState<Stage[]>([{
    name: 'HOLDING',
    steps: [
      {
        temperature: 55,
        duration: '15:00',
        rampRate: 3.5,
        lane1: { temperature: 55, duration: '15:00', rampRate: 3.5 },
        lane2: { temperature: 55, duration: '15:00', rampRate: 3.5 }
      }
    ],
    cycles: 1
  }, {
    name: 'CYCLING',
    steps: [
      {
        temperature: 95,
        duration: '02:00',
        rampRate: 3.5,
        lane1: { temperature: 95, duration: '02:00', rampRate: 3.5 },
        lane2: { temperature: 95, duration: '02:00', rampRate: 3.5 }
      },
      {
        temperature: 65,
        duration: '00:30',
        rampRate: 3.5,
        lane1: { temperature: 65, duration: '00:30', rampRate: 3.5 },
        lane2: { temperature: 65, duration: '00:30', rampRate: 3.5 }
      },
      {
        temperature: 72,
        duration: '00:20',
        rampRate: 3.5,
        lane1: { temperature: 72, duration: '00:20', rampRate: 3.5 },
        lane2: { temperature: 72, duration: '00:20', rampRate: 3.5 }
      }
    ],
    cycles: protocolCycles
  }, {
    name: 'MELT CURVE',
    steps: [
      {
        temperature: 60,
        duration: '00:15',
        rampRate: 3.5,
        lane1: { temperature: 60, duration: '00:15', rampRate: 3.5 },
        lane2: { temperature: 60, duration: '00:15', rampRate: 3.5 }
      },
      {
        temperature: 95,
        duration: '02:00',
        rampRate: 0.1,
        lane1: { temperature: 95, duration: '02:00', rampRate: 0.1 },
        lane2: { temperature: 95, duration: '02:00', rampRate: 0.1 }
      }
    ],
    cycles: 1
  }]);

  const stages = selectedLane === 1 ? stagesLane1 : stagesLane2;
  const isEnabled = meltCurveEnabled[selectedLane === 1 ? 'lane1' : 'lane2'];

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };

    updateWidth();
    const resizeObserver = new ResizeObserver(updateWidth);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  const maxTemp = 220;
  const minTemp = 10;
  const padding = 20;
  const height = 400;
  const stageWidth = Math.max(0, (containerWidth - 2 * padding) / stages.length);

  const scaleY = (temp: number) => (
    padding + (220 - temp) * ((height - 2 * padding) / (220 - 10))
  );

  const getSecondaryTemp = (temp: number) => temp - 100;

  const handleStepSelect = (stageIndex: number, stepIndex: number) => {
    if (stageIndex === 2 && !meltCurveEnabled[selectedLane === 1 ? 'lane1' : 'lane2']) {
      return;
    }
    setSelectedStep({ stageIndex, stepIndex });
    setSelectedStage(stageIndex);
  };

  const handleTemperatureChange = (stageIndex: number, stepIndex: number, temperature: string | number) => {
    console.log('Temperature change:', { 
      stageIndex, 
      isMeltCurveEnabled: meltCurveEnabled[selectedLane === 1 ? 'lane1' : 'lane2'], 
      temperature 
    });
    
    if (stageIndex === 2 && !meltCurveEnabled[selectedLane === 1 ? 'lane1' : 'lane2']) {
      console.log('Prevented temperature change: Melt curve disabled for this lane');
      return;
    }

    const newStages = selectedLane === 1 
      ? JSON.parse(JSON.stringify(stagesLane1))
      : JSON.parse(JSON.stringify(stagesLane2));

    if (typeof temperature === 'string') {
      if (temperature === '') {
        newStages[stageIndex].steps[stepIndex].temperature = '' as any;
        if (selectedLane === 1) {
          newStages[stageIndex].steps[stepIndex].lane1.temperature = '' as any;
        } else {
          newStages[stageIndex].steps[stepIndex].lane2.temperature = '' as any;
        }
      } else {
        const temp = parseFloat(temperature);
        if (!isNaN(temp)) {
          if (stageIndex === 2) {
            const boundedTemp = Math.min(Math.max(temp, 30), 97);
            newStages[stageIndex].steps[stepIndex].temperature = boundedTemp;
            if (selectedLane === 1) {
              newStages[stageIndex].steps[stepIndex].lane1.temperature = boundedTemp;
            } else {
              newStages[stageIndex].steps[stepIndex].lane2.temperature = boundedTemp;
            }
          } else {
            newStages[stageIndex].steps[stepIndex].temperature = temp;
            if (selectedLane === 1) {
              newStages[stageIndex].steps[stepIndex].lane1.temperature = temp;
            } else {
              newStages[stageIndex].steps[stepIndex].lane2.temperature = temp;
            }
          }
        }
      }
    } else {
      if (stageIndex === 2) {
        const boundedTemp = Math.min(Math.max(temperature as number, 30), 97);
        newStages[stageIndex].steps[stepIndex].temperature = boundedTemp;
        if (selectedLane === 1) {
          newStages[stageIndex].steps[stepIndex].lane1.temperature = boundedTemp;
        } else {
          newStages[stageIndex].steps[stepIndex].lane2.temperature = boundedTemp;
        }
      } else {
        newStages[stageIndex].steps[stepIndex].temperature = temperature;
        if (selectedLane === 1) {
          newStages[stageIndex].steps[stepIndex].lane1.temperature = temperature as number;
        } else {
          newStages[stageIndex].steps[stepIndex].lane2.temperature = temperature as number;
        }
      }
    }

    if (selectedLane === 1) {
      setStagesLane1(newStages);
    } else {
      setStagesLane2(newStages);
    }
  };

  const handleRampRateChange = (stageIndex: number, stepIndex: number, rate: string | number) => {
    const lane = selectedLane === 1 ? 'lane1' : 'lane2';
    const newStages = [...stages];
    if (typeof rate === 'string') {
      if (rate === '' || rate === '.') {
        newStages[stageIndex].steps[stepIndex].rampRate = rate as any;
        newStages[stageIndex].steps[stepIndex][lane].rampRate = rate as any;
      } else {
        const rateRegex = /^\d*\.?\d*$/;
        if (rateRegex.test(rate)) {
          const rampRate = parseFloat(rate);
          if (!isNaN(rampRate)) {
            newStages[stageIndex].steps[stepIndex].rampRate = rate as any;
            newStages[stageIndex].steps[stepIndex][lane].rampRate = rate as any;
          }
        }
      }
    } else {
      const roundedRate = Math.round(rate * 2) / 2;
      const boundedRate = Math.min(Math.max(roundedRate, 1.0), 3.5);
      newStages[stageIndex].steps[stepIndex].rampRate = boundedRate;
      newStages[stageIndex].steps[stepIndex][lane].rampRate = boundedRate;
    }
    if (selectedLane === 1) {
      setStagesLane1(newStages);
    } else {
      setStagesLane2(newStages);
    }
  };

  const handleDurationChange = (stageIndex: number, stepIndex: number, duration: string) => {
    const newStages = stages.map(stage => ({
      ...stage,
      steps: stage.steps.map(step => ({
        ...step
      }))
    }));
    
    const lane = selectedLane === 1 ? 'lane1' : 'lane2';
    
    if (duration === '') {
      newStages[stageIndex].steps[stepIndex].duration = '00:00';
      newStages[stageIndex].steps[stepIndex][lane].duration = '00:00';
      if (selectedLane === 1) {
        setStagesLane1(newStages);
      } else {
        setStagesLane2(newStages);
      }
      return;
    }

    if (duration.includes(':')) {
      const [mins, secs] = duration.split(':');
      if (/^[0-5]?\d?$/.test(mins) && /^[0-5]?\d?$/.test(secs || '')) {
        newStages[stageIndex].steps[stepIndex].duration = duration;
        newStages[stageIndex].steps[stepIndex][lane].duration = duration;
      }
      return;
    }

    if (/^\d{0,4}$/.test(duration)) {
      let mins = '00';
      let secs = '00';
      
      if (duration.length <= 2) {
        mins = duration.padStart(2, '0');
        const newDuration = `${mins}:00`;
        newStages[stageIndex].steps[stepIndex].duration = newDuration;
        newStages[stageIndex].steps[stepIndex][lane].duration = newDuration;
        if (selectedLane === 1) {
          setStagesLane1(newStages);
        } else {
          setStagesLane2(newStages);
        }
      } else {
        mins = duration.slice(0, 2);
        secs = duration.slice(2).padStart(2, '0');
        if (parseInt(mins) <= 59 && parseInt(secs) <= 59) {
          const newDuration = `${mins}:${secs}`;
          newStages[stageIndex].steps[stepIndex].duration = newDuration;
          newStages[stageIndex].steps[stepIndex][lane].duration = newDuration;
        }
      }
    }
    if (selectedLane === 1) {
      setStagesLane1(newStages);
    } else {
      setStagesLane2(newStages);
    }
  };

  const handleCycleChange = (value: string) => {
    if (value === '') {
      setProtocolCycles(30);
    } else {
      const cycles = parseInt(value);
      if (!isNaN(cycles)) {
        const newCycles = Math.min(Math.max(cycles, 1), 50);
        setProtocolCycles(newCycles);
        
        const newStages = [...stages];
        const cyclingStageIndex = newStages.findIndex(stage => stage.name === 'CYCLING');
        if (cyclingStageIndex !== -1) {
          newStages[cyclingStageIndex].cycles = newCycles;
          if (selectedLane === 1) {
            setStagesLane1(newStages);
          } else {
            setStagesLane2(newStages);
          }
        }
      }
    }
  };

  const handleCycleIncrement = () => {
    if (protocolCycles < 50) {
      const newCycles = protocolCycles + 1;
      setProtocolCycles(newCycles);
      
      const newStages = [...stages];
      const cyclingStageIndex = newStages.findIndex(stage => stage.name === 'CYCLING');
      if (cyclingStageIndex !== -1) {
        newStages[cyclingStageIndex].cycles = newCycles;
        if (selectedLane === 1) {
          setStagesLane1(newStages);
        } else {
          setStagesLane2(newStages);
        }
      }
    }
  };

  const handleCycleDecrement = () => {
    if (protocolCycles > 1) {
      const newCycles = protocolCycles - 1;
      setProtocolCycles(newCycles);
      
      const newStages = [...stages];
      const cyclingStageIndex = newStages.findIndex(stage => stage.name === 'CYCLING');
      if (cyclingStageIndex !== -1) {
        newStages[cyclingStageIndex].cycles = newCycles;
        if (selectedLane === 1) {
          setStagesLane1(newStages);
        } else {
          setStagesLane2(newStages);
        }
      }
    }
  };

  const handleCycleBlur = () => {
    if (protocolCycles < 1 || isNaN(protocolCycles)) {
      const newCycles = 30;
      setProtocolCycles(newCycles);
      
      const newStages = [...stages];
      const cyclingStageIndex = newStages.findIndex(stage => stage.name === 'CYCLING');
      if (cyclingStageIndex !== -1) {
        newStages[cyclingStageIndex].cycles = newCycles;
        if (selectedLane === 1) {
          setStagesLane1(newStages);
        } else {
          setStagesLane2(newStages);
        }
      }
    }
  };

  const handleAddStep = () => {
    if (!selectedStep) return;

    const newStages = [...stages];
    const currentStage = newStages[selectedStep.stageIndex];
    const currentStep = currentStage.steps[selectedStep.stepIndex];

    const newStep = {
      temperature: currentStep.temperature,
      duration: '00:30',
      rampRate: currentStep.rampRate,
      lane1: {
        temperature: currentStep.lane1.temperature,
        duration: '00:30',
        rampRate: currentStep.lane1.rampRate
      },
      lane2: {
        temperature: currentStep.lane2.temperature,
        duration: '00:30',
        rampRate: currentStep.lane2.rampRate
      }
    };

    currentStage.steps.splice(selectedStep.stepIndex + 1, 0, newStep);

    if (selectedLane === 1) {
      setStagesLane1(newStages);
    } else {
      setStagesLane2(newStages);
    }
  };

  const handleRemoveStep = () => {
    if (!selectedStep) return;
    
    const newStages = [...stages];
    const currentStage = newStages[selectedStep.stageIndex];
    
    if (currentStage.steps.length > 1) {
      const { stageIndex, stepIndex } = selectedStep;
      
      currentStage.steps.splice(stepIndex, 1);
      
      const nextStepIndex = stepIndex >= currentStage.steps.length ? stepIndex - 1 : stepIndex;
      
      if (selectedLane === 1) {
        setStagesLane1(newStages);
      } else {
        setStagesLane2(newStages);
      }
      setSelectedStep({ stageIndex, stepIndex: nextStepIndex });
      setSelectedStage(stageIndex);
    }
  };

  const handlePlateReadToggle = (stageIndex: number, stepIndex: number) => {
    const newStages = [...stages];
    const step = newStages[stageIndex].steps[stepIndex];
    step.plateRead = !step.plateRead;
    if (selectedLane === 1) {
      step.lane1.plateRead = step.plateRead;
      setStagesLane1(newStages);
    } else {
      step.lane2.plateRead = step.plateRead;
      setStagesLane2(newStages);
    }
  };

  const calculateTotalTime = () => {
    let totalSeconds = 0;
    stages.forEach(stage => {
      const stageSeconds = stage.steps.reduce((acc, step) => {
        const [minutes, seconds] = step.duration.split(':').map(Number);
        return acc + (minutes * 60 + seconds);
      }, 0);
      totalSeconds += stageSeconds * stage.cycles;
    });
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    setRuntimeLeft(calculateTotalTime());
  }, [stages]);

  const handleTemperatureBlur = (stageIndex: number, stepIndex: number) => {
    const newStages = [...stages];
    const step = newStages[stageIndex].steps[stepIndex];
    const lane = selectedLane === 1 ? 'lane1' : 'lane2';
    
    if (typeof step[lane].temperature !== 'number' || isNaN(step[lane].temperature)) {
      step[lane].temperature = 55;
      step.temperature = 55;
    } else {
      const boundedTemp = Math.min(Math.max(step[lane].temperature, 30), 97);
      step[lane].temperature = boundedTemp;
      step.temperature = boundedTemp;
    }
    if (selectedLane === 1) {
      setStagesLane1(newStages);
    } else {
      setStagesLane2(newStages);
    }
  };

  const handleRampRateBlur = (stageIndex: number, stepIndex: number) => {
    const newStages = [...stages];
    const step = newStages[stageIndex].steps[stepIndex];
    const lane = selectedLane === 1 ? 'lane1' : 'lane2';
    const rate = step[lane].rampRate;
    
    if (typeof rate === 'string') {
      const parsedRate = parseFloat(rate);
      if (isNaN(parsedRate) || rate === '' || rate === '.') {
        step[lane].rampRate = 1.0;
        step.rampRate = 1.0;
      } else {
        const roundedRate = Math.round(parsedRate * 2) / 2;
        const boundedRate = Math.min(Math.max(roundedRate, 1.0), 3.5);
        step[lane].rampRate = boundedRate;
        step.rampRate = boundedRate;
      }
    }
    if (selectedLane === 1) {
      setStagesLane1(newStages);
    } else {
      setStagesLane2(newStages);
    }
  };

  const handleTemperatureIncrement = (stageIndex: number, stepIndex: number) => {
    const newStages = [...stages];
    const step = newStages[stageIndex].steps[stepIndex];
    const lane = selectedLane === 1 ? 'lane1' : 'lane2';
    const currentTemp = step[lane].temperature;
    const newTemp = typeof currentTemp === 'number' ? Math.min(currentTemp + 1, 97) : 55;
    step[lane].temperature = newTemp;
    step.temperature = newTemp;
    if (selectedLane === 1) {
      setStagesLane1(newStages);
    } else {
      setStagesLane2(newStages);
    }
  };

  const handleTemperatureDecrement = (stageIndex: number, stepIndex: number) => {
    const newStages = [...stages];
    const step = newStages[stageIndex].steps[stepIndex];
    const lane = selectedLane === 1 ? 'lane1' : 'lane2';
    const currentTemp = step[lane].temperature;
    const newTemp = typeof currentTemp === 'number' ? Math.max(currentTemp - 1, 30) : 55;
    step[lane].temperature = newTemp;
    step.temperature = newTemp;
    if (selectedLane === 1) {
      setStagesLane1(newStages);
    } else {
      setStagesLane2(newStages);
    }
  };

  const handleRampRateIncrement = (stageIndex: number, stepIndex: number) => {
    const newStages = [...stages];
    const step = newStages[stageIndex].steps[stepIndex];
    const lane = selectedLane === 1 ? 'lane1' : 'lane2';
    const currentRate = step[lane].rampRate;
    const newRate = typeof currentRate === 'number' ? Math.min(currentRate + 0.5, 3.5) : 1.0;
    step[lane].rampRate = newRate;
    step.rampRate = newRate;
    if (selectedLane === 1) {
      setStagesLane1(newStages);
    } else {
      setStagesLane2(newStages);
    }
  };

  const handleRampRateDecrement = (stageIndex: number, stepIndex: number) => {
    const newStages = [...stages];
    const step = newStages[stageIndex].steps[stepIndex];
    const lane = selectedLane === 1 ? 'lane1' : 'lane2';
    const currentRate = step[lane].rampRate;
    const newRate = typeof currentRate === 'number' ? Math.max(currentRate - 0.5, 1.0) : 1.0;
    step[lane].rampRate = newRate;
    step.rampRate = newRate;
    if (selectedLane === 1) {
      setStagesLane1(newStages);
    } else {
      setStagesLane2(newStages);
    }
  };

  const isValidDuration = (duration: string) => {
    const pattern = /^([0-5][0-9]):([0-5][0-9])$/;
    if (!pattern.test(duration)) return false;
    
    const [minutes, seconds] = duration.split(':').map(Number);
    const totalSeconds = minutes * 60 + seconds;
    return totalSeconds >= 1 && totalSeconds <= 3000;
  };

  const formatDuration = (duration: string) => {
    if (!duration) return '00:01';
    const [minutes, seconds] = duration.split(':').map(Number);
    const totalSeconds = Math.min(Math.max(minutes * 60 + seconds, 1), 3000);
    const newMinutes = Math.floor(totalSeconds / 60);
    const newSeconds = totalSeconds % 60;
    return `${newMinutes.toString().padStart(2, '0')}:${newSeconds.toString().padStart(2, '0')}`;
  };

  const handleDurationBlur = (stageIndex: number, stepIndex: number) => {
    const newStages = [...stages];
    const step = newStages[stageIndex].steps[stepIndex];
    const lane = selectedLane === 1 ? 'lane1' : 'lane2';
    const duration = step[lane].duration;
    
    const [mins = '0', secs = '0'] = duration.split(':');
    let minutes = parseInt(mins);
    let seconds = parseInt(secs);
    
    minutes = Math.min(Math.max(minutes, 0), 59);
    seconds = Math.min(Math.max(seconds, 0), 59);
    
    if (minutes === 0 && seconds === 0) {
      minutes = 0;
      seconds = 1;
    }
    
    const formattedDuration = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    step[lane].duration = formattedDuration;
    step.duration = formattedDuration;
    if (selectedLane === 1) {
      setStagesLane1(newStages);
    } else {
      setStagesLane2(newStages);
    }
  };

  useEffect(() => {
    if (!meltCurveEnabled[selectedLane === 1 ? 'lane1' : 'lane2'] && selectedStep?.stageIndex === 2) {
      setSelectedStep(null);
      setSelectedStage(null);
    }
  }, [meltCurveEnabled, selectedStep?.stageIndex]);

  const handleProtocolToggle = () => {
    setIsProtocolRunning(!isProtocolRunning);
  };

  const incrementDuration = (duration: string) => {
    const [mins, secs] = duration.split(':').map(Number);
    let newSecs = secs + 5;
    let newMins = mins;
    
    if (newSecs >= 60) {
      newMins += Math.floor(newSecs / 60);
      newSecs = newSecs % 60;
    }
    
    if (newMins > 59) {
      newMins = 59;
      newSecs = 59;
    }
    
    return `${newMins.toString().padStart(2, '0')}:${newSecs.toString().padStart(2, '0')}`;
  };

  const decrementDuration = (duration: string) => {
    const [mins, secs] = duration.split(':').map(Number);
    let newSecs = secs - 5;
    let newMins = mins;
    
    if (newSecs < 0) {
      newMins -= 1;
      newSecs = 60 + newSecs;
    }
    
    if (newMins < 0 || (newMins === 0 && newSecs < 1)) {
      newMins = 0;
      newSecs = 1;
    }
    
    return `${newMins.toString().padStart(2, '0')}:${newSecs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div 
        ref={containerRef}
        className="relative h-96 bg-gray-50 rounded-lg mb-6"
      >
        <svg
          width="100%"
          height={height}
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
          viewBox={`0 0 ${containerWidth} ${height}`}
        >
          <g>
            <rect
              x={-12}
              y={scaleY(115) - 30}
              width={padding}
              height={60}
              rx={4}
              fill="#e5e7eb"
              stroke="#9ca3af"
              strokeWidth="1"
              className="cursor-pointer"
            />
            <text
              x={-12 + padding/2}
              y={scaleY(115) - 35}
              textAnchor="middle"
              fill="#64748b"
              fontSize={11}
              fontWeight="700"
              dominantBaseline="text-after-edge"
              className="pointer-events-none"
            >
              L1
            </text>
            <text
              x={-12 + padding/2}
              y={scaleY(115) + 35}
              textAnchor="middle"
              fill="#64748b"
              fontSize={11}
              fontWeight="700"
              dominantBaseline="text-before-edge"
              className="pointer-events-none"
            >
              L2
            </text>
            <rect
              x={-10}
              y={selectedLane === 1 ? scaleY(115) - 28 : scaleY(115) + 2}
              width={padding - 4}
              height={24}
              rx={3}
              fill={selectedLane === 1 ? '#dc2626' : '#0891b2'}
              filter="drop-shadow(0 2px 2px rgb(0 0 0 / 0.1))"
              className="transition-all duration-200 ease-in-out cursor-pointer"
              onClick={() => setSelectedLane(selectedLane === 1 ? 2 : 1)}
            />
            <rect
              x={-12}
              y={scaleY(115) - 30}
              width={padding}
              height={30}
              fill="transparent"
              className="cursor-pointer"
              onClick={() => setSelectedLane(1)}
            />
            <rect
              x={-12}
              y={scaleY(115)}
              width={padding}
              height={30}
              fill="transparent"
              className="cursor-pointer"
              onClick={() => setSelectedLane(2)}
            />
          </g>

          {Array.from({ length: stages.length + 1 }, (_, i) => (
            <line
              key={i}
              x1={padding + i * stageWidth}
              y1={padding}
              x2={padding + i * stageWidth}
              y2={height - padding}
              stroke="#94a3b8"
              strokeWidth="1"
            />
          ))}

          <HoldingStage
            stage={stages[0]}
            width={stageWidth}
            height={height}
            padding={padding}
            onStepSelect={(stepIndex) => handleStepSelect(0, stepIndex)}
            onTemperatureChange={(stepIndex, temp) => handleTemperatureChange(0, stepIndex, temp)}
            onDurationChange={(stepIndex, duration) => handleDurationChange(0, stepIndex, duration)}
            selectedStepIndex={selectedStep?.stageIndex === 0 ? selectedStep.stepIndex : null}
            selectedLane={selectedLane}
          />
          <CyclingStage
            stage={stages[1]}
            width={stageWidth}
            height={height}
            padding={padding}
            onStepSelect={(stepIndex) => handleStepSelect(1, stepIndex)}
            onTemperatureChange={(stepIndex, temp) => handleTemperatureChange(1, stepIndex, temp)}
            onDurationChange={(stepIndex, duration) => handleDurationChange(1, stepIndex, duration)}
            selectedStepIndex={selectedStep?.stageIndex === 1 ? selectedStep.stepIndex : null}
            selectedLane={selectedLane}
          />
          <MeltCurveStage
            stage={stages[2]}
            width={stageWidth}
            height={height}
            padding={padding}
            onStepSelect={(stepIndex) => handleStepSelect(2, stepIndex)}
            onTemperatureChange={(stepIndex, temp) => handleTemperatureChange(2, stepIndex, temp)}
            onDurationChange={(stepIndex, duration) => handleDurationChange(2, stepIndex, duration)}
            selectedStepIndex={selectedStep?.stageIndex === 2 ? selectedStep.stepIndex : null}
            isEnabled={meltCurveEnabled[selectedLane === 1 ? 'lane1' : 'lane2']}
            selectedLane={selectedLane}
          />

          {stages.map((stage, index) => {
            if (index === 0) return null;
            
            const prevStage = stages[index - 1];
            const x = padding + index * stageWidth;
            
            const y1Primary = scaleY(prevStage.steps[prevStage.steps.length - 1].lane1.temperature + 100);
            const y2Primary = scaleY(stage.steps[0].lane1.temperature + 100);
            
            const y1Secondary = scaleY(prevStage.steps[prevStage.steps.length - 1].lane2.temperature);
            const y2Secondary = scaleY(stage.steps[0].lane2.temperature);
            
            return (
              <g key={`connection-${index}`}>
                <line
                  x1={x}
                  y1={y1Primary}
                  x2={x}
                  y2={y2Primary}
                  stroke="#dc2626"
                  strokeWidth="3"
                  opacity={!isEnabled && index === 2 ? 0.3 : selectedLane === 1 ? 1 : 0.3}
                />
                <line
                  x1={x}
                  y1={y1Secondary}
                  x2={x}
                  y2={y2Secondary}
                  stroke="#0891b2"
                  strokeWidth="3"
                  opacity={!isEnabled && index === 2 ? 0.3 : selectedLane === 2 ? 1 : 0.3}
                />
              </g>
            );
          })}

          {stages.map((stage, index) => (
            <text
              key={stage.name}
              x={padding + index * stageWidth + stageWidth / 2}
              y={height - padding / 3}
              textAnchor="middle"
              fill="#1f2937"
              fontWeight="bold"
              fontSize={12}
            >
              {stage.name}
            </text>
          ))}

          <line
            x1={padding}
            y1={scaleY(115)}
            x2={containerWidth - padding}
            y2={scaleY(115)}
            stroke="#475569"
            strokeWidth="1"
            strokeDasharray="4 4"
            opacity="0.8"
          />
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="space-y-4">
          <h3 className="text-center font-semibold text-gray-900 flex items-center justify-center gap-2 mb-4">
            <Settings className="w-4 h-4" />
            PROTOCOL SETUP
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="bg-blue-200 p-3 rounded-lg border-2 border-blue-300">
              <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider text-center mb-4">Step Tuning</h4>
              <div className="space-y-2">
                <button 
                  className={`w-full py-2 px-4 rounded-md flex items-center justify-center gap-2 ${
                    selectedStep === null 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'
                  }`}
                  onClick={handleAddStep}
                  disabled={selectedStep === null}
                >
                  <Plus className="w-4 h-4" />
                  Add Step
                </button>
                <button 
                  className={`w-full py-2 px-4 rounded-md flex items-center justify-center gap-2 ${
                    selectedStep === null 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                  }`}
                  onClick={handleRemoveStep}
                  disabled={selectedStep === null}
                >
                  <Minus className="w-4 h-4" />
                  Remove Step
                </button>
              </div>
            </div>

            <div className="bg-purple-200 p-3 rounded-lg border-2 border-purple-300">
              <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wider text-center mb-4">Stage Tuning</h4>
              <div className="space-y-3">
                <div className="bg-white p-3 rounded-lg border border-purple-300">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-600">Cycles</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleCycleDecrement}
                        className={`p-1 rounded-md ${
                          selectedStep !== null && stages[selectedStep.stageIndex].name === 'CYCLING'
                            ? 'bg-gray-100 hover:bg-gray-200'
                            : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                        }`}
                        disabled={!selectedStep || stages[selectedStep.stageIndex].name !== 'CYCLING' || stages[selectedStep.stageIndex].cycles <= 2}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="text"
                        min="2"
                        max="50"
                        value={selectedStep ? stages[selectedStep.stageIndex].cycles : 1}
                        onChange={(e) => handleCycleChange(e.target.value)}
                        className={`w-16 text-center border rounded-md ${
                          selectedStep !== null && stages[selectedStep.stageIndex].name === 'CYCLING'
                            ? 'bg-white'
                            : 'bg-gray-50 text-gray-400'
                        }`}
                        disabled={!selectedStep || stages[selectedStep.stageIndex].name !== 'CYCLING'}
                      />
                      <button
                        onClick={handleCycleIncrement}
                        className={`p-1 rounded-md ${
                          selectedStep !== null && stages[selectedStep.stageIndex].name === 'CYCLING'
                            ? 'bg-gray-100 hover:bg-gray-200'
                            : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                        }`}
                        disabled={!selectedStep || stages[selectedStep.stageIndex].name !== 'CYCLING' || stages[selectedStep.stageIndex].cycles >= 50}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-purple-300">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-600">Plate Read</span>
                    <button 
                      className={`py-1 px-3 rounded-md flex items-center gap-2 ${
                        !selectedStep
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : selectedStep && stages[selectedStep.stageIndex].steps[selectedStep.stepIndex].plateRead
                            ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                            : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'
                      }`}
                      onClick={() => selectedStep && handlePlateReadToggle(selectedStep.stageIndex, selectedStep.stepIndex)}
                      disabled={!selectedStep}
                    >
                      <Camera className="w-4 h-4" />
                      {selectedStep && stages[selectedStep.stageIndex].steps[selectedStep.stepIndex].plateRead
                        ? 'Remove'
                        : 'Add'
                      }
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-center font-semibold text-gray-900 flex items-center justify-center gap-2 mb-4">
            <Edit2 className="w-4 h-4" />
            STAGE PARAMETERS
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            {selectedStep !== null ? (
              <div className="space-y-4">
                <div className="grid grid-cols-[120px_1fr] gap-x-4 items-center text-sm">
                  <span className="text-gray-600">Stage Type</span>
                  <span className="font-medium text-gray-900 text-right">{stages[selectedStep.stageIndex].name}</span>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-x-4 items-center text-sm">
                  <span className="text-gray-600">Step</span>
                  <span className="font-medium text-gray-900 text-right">{selectedStep.stepIndex + 1}</span>
                </div>
                
                <div className="grid grid-cols-[120px_1fr] gap-x-4 items-center text-sm">
                  <span className="text-gray-600">Cycles</span>
                  <span className="font-medium text-gray-900 text-right">{stages[selectedStep.stageIndex].cycles}</span>
                </div>

                <div className="grid grid-cols-[120px_1fr] gap-x-4 items-center text-sm">
                  <span className="text-gray-600">Temperature</span>
                  <div className="flex items-center justify-end gap-2">
                    <div className="relative w-20">
                      <input
                        type="text"
                        value={stages[selectedStep.stageIndex].steps[selectedStep.stepIndex][selectedLane === 1 ? 'lane1' : 'lane2'].temperature}
                        onChange={(e) => handleTemperatureChange(selectedStep.stageIndex, selectedStep.stepIndex, e.target.value)}
                        onBlur={() => handleTemperatureBlur(selectedStep.stageIndex, selectedStep.stepIndex)}
                        className="w-full text-center border rounded px-2 py-1"
                      />
                      <button
                        onClick={() => handleTemperatureIncrement(selectedStep.stageIndex, selectedStep.stepIndex)}
                        className="absolute right-1 top-0 h-1/2 px-1 text-gray-400 hover:text-gray-600 flex items-center"
                      >
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 15l-6-6-6 6"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => handleTemperatureDecrement(selectedStep.stageIndex, selectedStep.stepIndex)}
                        className="absolute right-1 bottom-0 h-1/2 px-1 text-gray-400 hover:text-gray-600 flex items-center"
                      >
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M6 9l6 6 6-6"/>
                        </svg>
                      </button>
                    </div>
                    <span className="text-gray-600 w-12 text-left">°C</span>
                  </div>
                </div>

                <div className="grid grid-cols-[120px_1fr] gap-x-4 items-center text-sm">
                  <span className="text-gray-600">Ramp Speed</span>
                  <div className="flex items-center justify-end gap-2">
                    <div className="relative w-20">
                      <input
                        type="text"
                        value={stages[selectedStep.stageIndex].steps[selectedStep.stepIndex][selectedLane === 1 ? 'lane1' : 'lane2'].rampRate}
                        onChange={(e) => handleRampRateChange(selectedStep.stageIndex, selectedStep.stepIndex, e.target.value)}
                        onBlur={() => handleRampRateBlur(selectedStep.stageIndex, selectedStep.stepIndex)}
                        className="w-full text-center border rounded px-2 py-1"
                      />
                      <button
                        onClick={() => handleRampRateIncrement(selectedStep.stageIndex, selectedStep.stepIndex)}
                        className="absolute right-1 top-0 h-1/2 px-1 text-gray-400 hover:text-gray-600 flex items-center"
                      >
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 15l-6-6-6 6"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => handleRampRateDecrement(selectedStep.stageIndex, selectedStep.stepIndex)}
                        className="absolute right-1 bottom-0 h-1/2 px-1 text-gray-400 hover:text-gray-600 flex items-center"
                      >
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M6 9l6 6 6-6"/>
                        </svg>
                      </button>
                    </div>
                    <span className="text-gray-600 w-12 text-left">°C/s</span>
                  </div>
                </div>

                <div className="grid grid-cols-[120px_1fr] gap-x-4 items-center text-sm">
                  <span className="text-gray-600">Time</span>
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-20 relative">
                      <input
                        type="text"
                        value={stages[selectedStep.stageIndex].steps[selectedStep.stepIndex][selectedLane === 1 ? 'lane1' : 'lane2'].duration}
                        onChange={(e) => handleDurationChange(selectedStep.stageIndex, selectedStep.stepIndex, e.target.value)}
                        onBlur={() => handleDurationBlur(selectedStep.stageIndex, selectedStep.stepIndex)}
                        className="w-full text-center border rounded px-2 py-1"
                        placeholder="MM:SS"
                      />
                      <button
                        onClick={() => {
                          const newDuration = incrementDuration(stages[selectedStep.stageIndex].steps[selectedStep.stepIndex][selectedLane === 1 ? 'lane1' : 'lane2'].duration);
                          handleDurationChange(selectedStep.stageIndex, selectedStep.stepIndex, newDuration);
                        }}
                        className="absolute right-1 top-0 h-1/2 px-1 text-gray-400 hover:text-gray-600 flex items-center"
                      >
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 15l-6-6-6 6"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          const newDuration = decrementDuration(stages[selectedStep.stageIndex].steps[selectedStep.stepIndex][selectedLane === 1 ? 'lane1' : 'lane2'].duration);
                          handleDurationChange(selectedStep.stageIndex, selectedStep.stepIndex, newDuration);
                        }}
                        className="absolute right-1 bottom-0 h-1/2 px-1 text-gray-400 hover:text-gray-600 flex items-center"
                      >
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M6 9l6 6 6-6"/>
                        </svg>
                      </button>
                    </div>
                    <span className="text-gray-600 w-12"></span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center">Select a step to view details</p>
            )}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Melt Curve Analysis</span>
              <button
                onClick={() => {
                  const newState = {
                    ...meltCurveEnabled,
                    [selectedLane === 1 ? 'lane1' : 'lane2']: !meltCurveEnabled[selectedLane === 1 ? 'lane1' : 'lane2']
                  };
                  console.log('Toggling melt curve for lane', selectedLane, newState);
                  setMeltCurveEnabled(newState);
                }}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full
                  transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                  ${meltCurveEnabled[selectedLane === 1 ? 'lane1' : 'lane2'] ? 'bg-green-500' : 'bg-gray-200'}
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${meltCurveEnabled[selectedLane === 1 ? 'lane1' : 'lane2'] ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              {meltCurveEnabled[selectedLane === 1 ? 'lane1' : 'lane2'] 
                ? `Melt curve analysis is enabled for Lane ${selectedLane}` 
                : `Enable to adjust Melt Curve parameters for Lane ${selectedLane}`}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button className="py-2 px-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-xs font-medium flex items-center justify-center gap-1">
              <SaveIcon className="w-3 h-3" />
              Save Protocol
            </button>
            <button className="py-2 px-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-xs font-medium flex items-center justify-center gap-1">
              <Download className="w-3 h-3" />
              Load Protocol
            </button>
          </div>

          <button 
            className={`w-full py-2 px-4 ${
              isProtocolRunning 
                ? 'bg-yellow-600 hover:bg-yellow-700' 
                : 'bg-green-600 hover:bg-green-700'
            } text-white rounded-md flex items-center justify-center gap-2`}
            onClick={handleProtocolToggle}
          >
            {isProtocolRunning ? (
              <>
                <PauseOctagon className="w-4 h-4" />
                Stop Protocol
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Start Protocol
              </>
            )}
          </button>
        </div>

        <div className="space-y-4">
          <h3 className="text-center font-semibold text-gray-900 flex items-center justify-center gap-2 mb-4">
            <Activity className="w-4 h-4" />
            PROTOCOL STATUS
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-center space-y-4">
              <div className="bg-green-200 p-3 rounded-lg border-2 border-green-300">
                <h4 className="text-xs font-semibold text-green-900 uppercase tracking-wider text-center mb-4">Current Status</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Stage</span>
                    <span className="font-medium text-gray-900">{stages[currentStageIndex].name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Step</span>
                    <span className="font-medium text-gray-900">{currentStepIndex + 1}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Temperature</span>
                    <span className="font-medium text-gray-900">{currentTemperature}°C</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Runtime Left</span>
                    <span className="font-medium text-gray-900">{runtimeLeft}</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-200 p-3 rounded-lg border-2 border-green-300">
                <h4 className="text-xs font-semibold text-green-900 uppercase tracking-wider text-center mb-4">Protocol Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Stages</span>
                    <span className="font-medium">{stages.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Steps</span>
                    <span className="font-medium">{stages.reduce((acc, stage) => acc + stage.steps.length, 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Duration</span>
                    <span className="font-medium">{calculateTotalTime()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}