# PCR Protocol Designer Implementation Guide

## Core Features Currently Implemented

### 1. Protocol Stage Visualization
- Three-stage PCR protocol visualization using SVG
  - HOLDING stage (single temperature hold)
  - CYCLING stage (multi-temperature cycling)
  - MELT CURVE stage (temperature gradient)
- Interactive temperature points with drag functionality
- Real-time temperature curve updates
- Visual indicators for plate read positions

### 2. Protocol Parameters
- Temperature range: 30°C - 120°C
- Adjustable parameters per step:
  - Temperature (°C)
  - Duration (mm:ss)
  - Ramp Rate (°C/s)
  - Plate Read toggle
- Cycle count configuration per stage

### 3. Navigation Interface
- Protocol Designer (main view)
- Data Analysis
- Well Layout
- Melt Analysis

## Implementation Guidelines

### 1. Temperature Point Interaction
- Temperature points should be draggable vertically only
- Snap to whole degree values
- Stay within 30°C - 120°C range
- Update in real-time during drag
- Show current temperature value above point

### 2. Protocol Stage Visualization
- SVG elements for each stage
- HOLDING stage:
  - Single temperature line
  - Fixed cycle count of 1
- CYCLING stage:
  - Multiple temperature steps (default: 95°C → 65°C → 72°C)
  - Configurable cycles (2-50 range)
  - Smooth curve transitions between points
- MELT CURVE stage:
  - Temperature gradient (default: 60°C → 95°C)
  - Fixed cycle count of 1
  - Slower ramp rate for precise readings

### 3. Stage Visualization Standards
- Each stage should have distinct visual separation
- Show connecting lines between temperature points
- Display duration values below temperature points
- Indicate cycle count when applicable
- Use consistent color coding:
  - Regular points: #eab308 (yellow)
  - Selected points: #854d0e (brown)
  - Plate read points: #ef4444 (red)

### 4. Protocol Data Structure
- Step Interface:
  ```typescript
  interface Step {
    temperature: number;  // Range: 30-120
    duration: string;     // Format: "mm:ss"
    rampRate: number;     // Typical range: 0.1-4.0
    plateRead?: boolean;  // Optional plate reading
  }
  ```
- Stage Interface:
  ```typescript
  interface Stage {
    name: string;         // HOLDING, CYCLING, or MELT CURVE
    steps: Step[];        // Array of temperature steps
    cycles: number;       // Number of repetitions
  }
  ```

### 5. User Interaction Rules
- Double-click duration text to edit
- Drag temperature points for adjustment
- Click stage header to select entire stage
- Click individual points to select step
- Show parameter panel for selected step/stage

### 6. Visual Feedback Requirements
- Provide feedback for:
  - Currently selected step/stage
  - Valid/invalid temperature ranges
  - Active drag operations
  - Plate read positions
  - Current protocol status

### 7. Layout Guidelines
- Header with experiment controls
- Navigation tabs
- Main visualization area
- Parameter control panel
- Status information

### 8. State Management
- Track these state elements:
  - Selected step/stage
  - Current temperature values
  - Protocol configuration
  - Drag operations
  - Edit modes
- Additional state requirements:
  - Container width for responsive SVG scaling
  - Runtime calculation and updates
  - Current stage and step indices
  - Plate read status per step

### 9. Runtime Calculations
- Format: HH:MM:SS
- Calculate total runtime considering:
  - Step durations
  - Number of cycles per stage
  - Ramp rates between temperatures
- Update runtime display in real-time when:
  - Duration changes
  - Cycles are modified
  - Steps are added/removed

### 10. Input Validation Rules
- Duration format: MM:SS (00:05 to 40:00)
- Temperature constraints:
  - Holding stage: 30°C - 120°C
  - Cycling stage: 30°C - 97°C
  - Melt curve: 30°C - 97°C
- Ramp rate range: 0.1°C/s - 5.0°C/s
- Cycle count:
  - Holding: Fixed at 1
  - Cycling: 2-50 cycles
  - Melt curve: Fixed at 1

### 11. SVG Visualization Standards
- Graph structure:
  - Responsive width based on container
  - Maintain aspect ratio for readability
  - Consistent padding for point interactions
- Temperature scale:
  - Y-axis range: 30°C - 120°C
  - Dynamic scaling based on container height
  - Maintain readable temperature increments
- Visual hierarchy:
  - Temperature points must be clearly interactive
  - Duration labels must be readable and editable
  - Stage separators must be visually distinct
  - Temperature curve must show clear progression
- Interactive elements:
  - Points must have sufficient touch/click targets
  - Labels must have adequate spacing for interaction
  - Visual feedback for interactive states
  - Clear indication of selected/active elements

### 12. Event Handling
- Mouse interactions:
  - MouseDown: Initiate temperature point drag
  - MouseMove: Update temperature during drag
  - MouseUp: Complete temperature adjustment
  - Click: Select step/stage
  - DoubleClick: Edit duration
- Keyboard support:
  - Enter: Confirm duration input
  - Escape: Cancel duration edit
  - Input validation during editing

## Code Organization

### 1. Component Structure
- ProtocolDesigner (main container)
- Stage components:
  - HoldingStage
  - CyclingStage
  - MeltCurveStage
- Control panels
- Navigation components

### 2. Styling Conventions
- Use Tailwind classes for:
  - Layout structure
  - Component spacing
  - Color schemes
  - Interactive states
  - Responsive design

### 3. Type Definitions
- Maintain strict typing for:
  - Component props
  - State management
  - Event handlers
  - Configuration objects

## Best Practices

### 1. Performance Optimization
- Use React.memo for pure components
- Implement proper dependency arrays in useEffect
- Optimize SVG rendering for large protocols

### 2. Error Handling
- Validate temperature ranges
- Verify duration format
- Handle drag boundary conditions
- Manage invalid user inputs

### 3. Accessibility
- Implement keyboard navigation
- Provide ARIA labels
- Ensure proper contrast ratios
- Support screen readers

### 4. Responsive Design
- Scale visualization to container
- Adjust controls for mobile views
- Maintain usability across screen sizes

Instructions to Cursor: Always reflect on multiple, say 5-7, different possible sources of the problem, distill those down to 1-2 most likely sources, and then add logs to validate your assumptions before we move onto implementing actual code fix. You can take more time to do this, faster response is not important but critical thinking is important.

### 5. Update Rules
Always check and apply the code fix for all the three stages namely holding, cycling and melt curve.

When applying any code fix, always check the code for all the three stages namely holding, cycling and melt curve.

When fixing any issue, never forget to consider the vertical connecting lines which connect the temperature lines of different stages. The vertical lines should be considered as an integral part of the temperature lines.
