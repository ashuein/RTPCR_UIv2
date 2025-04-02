export interface Protocol {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  stages: Stage[];
  cycles: number;
  isMeltCurveEnabled: boolean;
}

export interface Stage {
  id: string;
  name: string;
  steps: Step[];
  cycles: number;
}

export interface Step {
  id: string;
  temperature: number;
  duration: string;
  rampRate: number;
  plateRead?: boolean;
}

export interface ExperimentRun {
  id: string;
  protocolId: string;
  startTime: Date;
  endTime?: Date;
  status: 'running' | 'completed' | 'halted' | 'error';
  currentStage: number;
  currentStep: number;
  currentTemperature: number;
  timeRemaining: string;
  data: ExperimentData[];
}

export interface ExperimentData {
  timestamp: Date;
  temperature: number;
  fluorescence?: number[];
  stage: number;
  step: number;
  cycle: number;
} 