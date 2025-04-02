export interface Step {
  temperature: number;
  duration: string;
  rampRate: number;
  plateRead?: boolean;
  lane1: {
    temperature: number;
    duration: string;
    rampRate: number;
    plateRead?: boolean;
  };
  lane2: {
    temperature: number;
    duration: string;
    rampRate: number;
    plateRead?: boolean;
  };
}

export interface Stage {
  name: string;
  steps: Step[];
  cycles: number;
}

export interface DragState {
  stageIndex: number;
  stepIndex: number;
  initialY: number;
  initialTemp: number;
}