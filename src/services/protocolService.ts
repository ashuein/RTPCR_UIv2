import { Protocol, ExperimentRun } from '../types/protocol';

class ProtocolService {
  private protocols: Map<string, Protocol> = new Map();
  private runs: Map<string, ExperimentRun> = new Map();

  // Protocol Management
  async saveProtocol(protocol: Protocol): Promise<void> {
    this.protocols.set(protocol.id, protocol);
    // TODO: Add API call to save to backend
  }

  async loadProtocol(id: string): Promise<Protocol | undefined> {
    return this.protocols.get(id);
    // TODO: Add API call to load from backend
  }

  // Experiment Management
  async startExperiment(protocolId: string): Promise<ExperimentRun> {
    const run: ExperimentRun = {
      id: crypto.randomUUID(),
      protocolId,
      startTime: new Date(),
      status: 'running',
      currentStage: 0,
      currentStep: 0,
      currentTemperature: 25,
      timeRemaining: '00:00:00',
      data: []
    };
    
    this.runs.set(run.id, run);
    return run;
  }

  async updateExperimentData(runId: string, data: ExperimentData): Promise<void> {
    const run = this.runs.get(runId);
    if (run) {
      run.data.push(data);
      // TODO: Add API call to update backend
    }
  }

  async getExperimentData(runId: string): Promise<ExperimentData[]> {
    return this.runs.get(runId)?.data || [];
  }
}

export const protocolService = new ProtocolService(); 