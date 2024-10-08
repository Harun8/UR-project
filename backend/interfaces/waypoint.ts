// models/index.ts
export interface JointAngles {
  base: number;
  shoulder: number;
  elbow: number;
  wrist1: number;
  wrist2: number;
  wrist3: number;
}

export interface PoseValue {
  entity: {
    value: number;
    unit: string;
  };
  selectedType: string;
  value: number;
}

export interface Pose {
  x: PoseValue;
  y: PoseValue;
  z: PoseValue;
  rx: PoseValue;
  ry: PoseValue;
  rz: PoseValue;
}

export interface Waypoint {
  // name: string;
  frame: string;
  tcp: {
    name: string;
    id: string;
  };
  qNear: JointAngles;
  pose: Pose;
}

export interface AdvancedParameters {
  speed: {
    speed: PoseValue;
    acceleration: PoseValue;
  };
  blend: {
    enabled: boolean;
  };
  transform: {
    transform: boolean;
  };
}

export interface Parameters {
  moveType?: string;
  variable?: {
    entity: {
      name: string;
      reference: boolean;
      type: string;
      valueType: string;
      declaredByID: string;
    };
    selectedType: string;
    value: string;
  };
  waypoint?: Waypoint;
  advanced?: AdvancedParameters;
}

export interface ProgramInformation {
  name: string;
  description: string;
  createdDate: number;
  lastSavedDate: null;
  lastModifiedDate: number;
  programState: string;
  functionsBlockShown: false
}

export interface URScript {
  script: string;
  nodeIDList: string[];
}

export interface ContributedNode {
  children: any[];
  contributedNode: {
    version: string;
    type: string;
    allowsChildren: boolean;
    parameters?: Parameters;
  };
  guid: string;
  parentId: string;
  programLabel?: any[];
}
