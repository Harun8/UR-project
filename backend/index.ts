import * as fs from 'fs';
import * as xml2js from 'xml2js';
import { getUUID } from './utils/uuid';

interface JointAngles {
  base: number;
  shoulder: number;
  elbow: number;
  wrist1: number;
  wrist2: number;
  wrist3: number;
}

interface PoseValue {
  entity: {
    value: number;
    unit: string;
  };
  selectedType: string;
  value: number;
}

interface Pose {
  x: PoseValue;
  y: PoseValue;
  z: PoseValue;
  rx: PoseValue;
  ry: PoseValue;
  rz: PoseValue;
}

interface Waypoint {
  name: string;
  frame: string;
  tcp: {
    name: string;
    id: string;
  };
  qNear: JointAngles;
  pose: Pose;
}

interface AdvancedParameters {
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

interface Parameters {
  moveType?: string;
  variable?: {
    entity: {
      name: string,
      reference: boolean,
      type: string,
      valueType: string,
      declaredByID: string
    },
    selectedType: string,
    value: string
  }
  waypoint?: Waypoint;
  advanced?: AdvancedParameters;
}

interface ProgramInformation {
  name: string;
  installation: string;
  directory: string;
  createdIn: string;
  lastSavedIn: string;
  robotSerialNumber: string;
}

interface URScript {
  script: string;
  nodeIDList: string[];
}

interface ContributedNode {
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

function ensureArray<T>(value: T | T[]): T[] {
  if (Array.isArray(value)) {
    return value;
  } else if (value !== undefined && value !== null) {
    return [value];
  } else {
    return [];
  }
}

function parseJointAngles(anglesStr: string): JointAngles {
  const angles = anglesStr.split(',').map((angle) => parseFloat(angle.trim()));
  return {
    base: angles[0],
    shoulder: angles[1],
    elbow: angles[2],
    wrist1: angles[3],
    wrist2: angles[4],
    wrist3: angles[5],
  };
}

function parsePose(poseStr: string): Pose {
  const values = poseStr.split(',').map((val) => parseFloat(val.trim()));
  const units = ['m', 'm', 'm', 'rad', 'rad', 'rad'];

  const poseValue = (index: number): PoseValue => ({
    entity: {
      value: values[index],
      unit: units[index],
    },
    selectedType: 'VALUE',
    value: values[index],
  });

  return {
    x: poseValue(0),
    y: poseValue(1),
    z: poseValue(2),
    rx: poseValue(3),
    ry: poseValue(4),
    rz: poseValue(5),
  };
}

function parseWaypoint(waypoint: any): Waypoint {
  const name = waypoint.$.name;
  const position = waypoint.position;

  const jointAnglesArray = ensureArray(position.JointAngles);
  const jointAngles = jointAnglesArray[0];
  const jointAnglesStr = jointAngles.$.angles;

  const tcpOffsetArray = ensureArray(position.TCPOffset);
  const tcpOffset = tcpOffsetArray[0];
  const poseStr = tcpOffset.$.pose;

  const qNear = parseJointAngles(jointAnglesStr);
  const pose = parsePose(poseStr);

  const tcp = {
    name: 'Tool_flange',
    id: '1855007c-7575-62f5-df63-69046ef9e9a7',
  };

  return {
    name,
    frame: 'tcp',
    tcp,
    qNear,
    pose,
  };
}

function convertMoveToJSON(move: any): any {
  const moveTypeText = move.$.motionType
  const moveType = moveTypeText === "MoveL" ? "moveL" : "moveJ"
  const speedValue = parseFloat(move.$.speed);
  const accelerationValue = parseFloat(move.$.acceleration);

  if (!move.children || !move.children.Waypoint) {
    console.error('No Waypoints found in Move node.');
    return null;
  }

  const waypointsXML = ensureArray(move.children.Waypoint);
  const waypoints = waypointsXML.map(parseWaypoint);

  const parameters: Parameters = {
    moveType,
    variable: {
      entity: {
        name: "Point",
        reference: false,
        type: "$$Variable",
        valueType: "waypoint",
        declaredByID: "a748a067-235b-d882-7956-5d8ee0bda641"
      },
      selectedType: "VALUE",
      value: "Point"
    },
    waypoint: waypoints[0], // Modify if multiple waypoints are needed
    advanced: {
      speed: {
        speed: {
          entity: {
            value: speedValue,
            unit: 'm/s',
          },
          selectedType: 'VALUE',
          value: speedValue,
        },
        acceleration: {
          entity: {
            value: accelerationValue,
            unit: 'm/s^2',
          },
          selectedType: 'VALUE',
          value: accelerationValue,
        },
      },
      blend: {
        enabled: false,
      },
      transform: {
        transform: false,
      },
    },
  };

  // Build programLabel
  const programLabel = [
    {
      type: 'primary',
      value: waypoints[0].name || 'Waypoint',
    },
    {
      type: 'secondary',
      value: waypoints[0].frame || '',
    },
    {
      type: 'secondary',
      value: waypoints[0].tcp.name || '',
    },
    {
      type: 'secondary',
      value: moveType === 'moveL' ? 'Linear' : 'Joint',
    },
    {
      type: 'secondary',
      value: `S: ${speedValue * 1000} mm/s`,
    },
    {
      type: 'secondary',
      value: `A: ${accelerationValue * 1000} mm/s²`,
    },
  ];

  return {
    children: [],
    contributedNode: {
      version: '0.0.3',
      type: 'ur-move-to',
      allowsChildren: false,
      parameters,
    },
    guid: getUUID, // Use the same guid as desired output
    parentId: '873fe730-b8d3-ac7e-1496-b4401107a1c7', // Parent guid
    programLabel,
  };
}

function findAllMoves(node: any, moves: any[] = []): any[] {
  if (node.Move) {
    const nodeMoves = ensureArray(node.Move);
    moves.push(...nodeMoves);
  }

  if (node.children) {
    const nodeChildren = ensureArray(node.children);
    nodeChildren.forEach((child: any) => {
      findAllMoves(child, moves);
    });
  }

  for (const key in node) {
    if (key !== '$' && key !== 'children') {
      const childNode = node[key];
      if (typeof childNode === 'object') {
        const childArray = ensureArray(childNode);
        childArray.forEach((c) => findAllMoves(c, moves));
      }
    }
  }

  return moves;
}

// Read the XML file
fs.readFile('files/skinkekutter2.urp', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading the XML file:', err);
    return;
  }

  // Parse XML to JS object
  const parser = new xml2js.Parser({ explicitArray: false });
  parser.parseString(data, (parseErr: any, result: any) => {
    if (parseErr) {
      console.error('Error parsing the XML file:', parseErr);
      return;
    }

    // Extract program information from the root element
    const urProgram = result.URProgram;

    const programInformation: ProgramInformation = {
      name: urProgram.$.name,
      installation: urProgram.$.installation,
      directory: urProgram.$.directory,
      createdIn: urProgram.$.createdIn,
      lastSavedIn: urProgram.$.lastSavedIn,
      robotSerialNumber: urProgram.$.robotSerialNumber,
    };

    // Define the urscript object
    const scriptContent = urProgram.Script ? urProgram.Script : '';
    const urscript: URScript = {
      script: scriptContent,
      nodeIDList: [], // Empty for now
    };

    // Find all Move nodes
    const moves = findAllMoves(result);

    if (moves.length === 0) {
      console.error('No Move nodes found in the XML file.');
      return;
    }

    const convertedMoves = moves
      .map(convertMoveToJSON)
      .filter((move) => move !== null) as ContributedNode[];

    // Create the final JSON output
    const finalOutput = {
      application: {
        id: '5',
        applicationInfo: {
          name: 'application',
        },
        applicationContent: {
          applicationContributions: {
            'ur-mounting': {
              type: 'ur-mounting',
              version: '0.0.1',
              mounting: {
                baseAngle: {
                  value: 0,
                  unit: 'deg',
                },
                tiltAngle: {
                  value: 0,
                  unit: 'deg',
                },
              },
            },
            'ur-frames': {
              type: 'ur-frames',
              version: '0.0.5',
              framesList: [
                {
                  name: 'base',
                  nameVariable: {
                    name: 'base',
                    reference: false,
                    type: '$$Variable',
                    valueType: 'frame',
                  },
                  parent: 'world',
                  pose: {
                    position: [0, 0, 0],
                    orientation: [0, 0, 0],
                  },
                },
                {
                  name: 'tcp',
                  nameVariable: {
                    name: 'tcp',
                    reference: false,
                    type: '$$Variable',
                    valueType: 'frame',
                  },
                  parent: 'base',
                  pose: {
                    position: [0, 0, 0],
                    orientation: [0, 0, 0],
                  },
                },
                {
                  name: 'world',
                  nameVariable: {
                    name: 'world',
                    reference: false,
                    type: '$$Variable',
                    valueType: 'frame',
                  },
                  pose: {
                    position: [0, 0, 0],
                    orientation: [0, 0, 0],
                  },
                },
              ],
            },
            'ur-grid-pattern': {
              type: 'ur-grid-pattern',
              version: '0.0.3',
              grids: [
                {
                  grid: {
                    name: 'grid',
                    reference: false,
                    type: '$$Variable',
                    valueType: 'grid',
                  },
                  waypoint: {
                    name: 'grid_iterator',
                    reference: false,
                    type: '$$Variable',
                    valueType: 'waypoint',
                  },
                  corners: [null, null, null, null],
                  numRows: 4,
                  numColumns: 5,
                },
              ],
            },
            'ur-end-effector': {
              type: 'ur-end-effector',
              version: '0.0.2',
              endEffectors: [
                {
                  id: '6f80429d-bc13-9674-1fbc-7b4f2dc9ab7a',
                  name: 'Robot',
                  payload: {
                    weight: {
                      value: 0,
                      unit: 'kg',
                    },
                  },
                  cog: {
                    cx: {
                      value: 0,
                      unit: 'm',
                    },
                    cy: {
                      value: 0,
                      unit: 'm',
                    },
                    cz: {
                      value: 0,
                      unit: 'm',
                    },
                  },
                  inertia: {
                    Ixx: {
                      value: 0,
                      unit: 'kg*m^2',
                    },
                    Iyy: {
                      value: 0,
                      unit: 'kg*m^2',
                    },
                    Izz: {
                      value: 0,
                      unit: 'kg*m^2',
                    },
                    Ixy: {
                      value: 0,
                      unit: 'kg*m^2',
                    },
                    Ixz: {
                      value: 0,
                      unit: 'kg*m^2',
                    },
                    Iyz: {
                      value: 0,
                      unit: 'kg*m^2',
                    },
                  },
                  useCustomInertia: false,
                  tcps: [
                    {
                      id: '1855007c-7575-62f5-df63-69046ef9e9a7',
                      name: 'Tool_flange',
                      x: {
                        value: 0,
                        unit: 'm',
                      },
                      y: {
                        value: 0,
                        unit: 'm',
                      },
                      z: {
                        value: 0,
                        unit: 'm',
                      },
                      rx: {
                        value: 0,
                        unit: 'rad',
                      },
                      ry: {
                        value: 0,
                        unit: 'rad',
                      },
                      rz: {
                        value: 0,
                        unit: 'rad',
                      },
                    },
                  ],
                },
              ],
              defaultTcp: {
                endEffectorId: '6f80429d-bc13-9674-1fbc-7b4f2dc9ab7a',
                tcpId: '1855007c-7575-62f5-df63-69046ef9e9a7',
              },
            },
            'ur-smart-skills': {
              type: 'ur-smart-skills',
              version: '0.0.2',
              preamble: '# Start of Forces\n###\n# Transforms the force and torque values along the axes of the given pose\n# @param pose pose Any valid pose, defaults to base, the x, y, and z values are ignored\n# @return array 6D force torque vector with [Fx, Fy, Fz, Mx, My, Mz] aligned to pose in N and Nm respectively\n###\ndef get_tcp_wrench_in_frame(pose = p[0.0, 0.0, 0.0, 0.0, 0.0, 0.0]):\n    # we are only interested in the rotation of pose, set translations to zero\n    local target_pose = pose\n    target_pose[0] = 0\n    target_pose[1] = 0\n    target_pose[2] = 0\n    # the conversion needs to happen as poses, so we need to convert back and forth a bit\n    local force = get_tcp_force()\n    local force_vector_as_pose = p[force[0], force[1], force[2], 0, 0, 0]\n    local torque_vector_as_pose = p[force[3], force[4], force[5], 0, 0, 0]\n    local transformed_force_as_pose = pose_trans(pose_inv(target_pose), force_vector_as_pose)\n    local transformed_torque_as_pose = pose_trans(pose_inv(target_pose), torque_vector_as_pose)\n    return [transformed_force_as_pose[0], transformed_force_as_pose[1], transformed_force_as_pose[2], transformed_torque_as_pose[0], transformed_torque_as_pose[1], transformed_torque_as_pose[2]]\nend\n###\n# See documentation for @link:get_tcp_wrench_in_frame()\n# @return forces and torques measured in TCP frame\n###\ndef get_tcp_wrench():\n    return get_tcp_wrench_in_frame(get_target_tcp_pose())\nend\n###\n# Projects the measured TCP force along the axis given\n# @param axis array 3D vector\n###\ndef project_tcp_force(axis):\n    local wrench = get_tcp_wrench()\n    local force = [wrench[0], wrench[1], wrench[2]]\n    return dot(force, axis)\nend\n# End of Forces\n# Start of Math\n# Definitions of constants\nglobal PI = acos(-1)\n###\n# Calculates the cross product between to 3D vectors\n# @param v1 array 3D vector\n# @param v2 array 3D vector\n###\ndef cross(v1, v2):\n    if length(v1) != length(v2):\n        popup(str_cat("For computing the cross product, the two vectors must have the same length. Provided lengths: ", [length(v1), length(v2)]), error=True, blocking=True)\n        return -1\n    end\n    if length(v1) != 3:\n        popup(str_cat("For computing the cross product, the two vectors must have length 3. Provided lengths: ", [length(v1), length(v2)]), error=True, blocking=True)\n        return -1\n    end\n    cross = [0.0, 0.0, 0.0]\n    i = 0\n    while i < 3:\n        j = (i + 1) % 3 // The next index in a cyclic order\n        k = (i + 2) % 3 // The next next index in a cyclic order\n        cross[i] = v1[j] * v2[k] - v1[k] * v2[j]\n        i = i + 1\n    end\n    return cross\nend\n###\n# Calculates the dot product between to n-dimensional vectors\n# @param v1 array nD vector\n# @param v2 array nD vector\n###\ndef dot(v1, v2):\n    if length(v1) != length(v2):\n        popup(str_cat("For computing the dot product, the two vectors must have the same length. Provided lengths: ", [length(v1), length(v2)]), error=True, blocking=True)\n        return -1\n    end\n    result = 0\n    i = 0\n    while i < length(v1):\n        result = result + (v1[i] * v2[i])\n        i = i + 1\n    end\n    return result\nend\n###\n# Return the larger number of a and b\n# @param a number a\n# @param b number b\n###\ndef max(a, b):\n    if a > b:\n        return a\n    end\n    return b\nend\n# End of Math\n# Start of Move Helper',
            },
          },
          sourceConfig: {
            labelMap: {},
            analogDomainMap: {},
            presets: {},
          },
          sourcesNodes: {
            robot: {
              groupId: 'robot',
              version: '1.0.0.',
              sources: [
                {
                  sourceID: 'ur-wired-io',
                  signals: [
                    { signalID: 'DI 0', direction: 'IN', valueType: 'BOOLEAN' },
                    { signalID: 'DI 1', direction: 'IN', valueType: 'BOOLEAN' },
                    { signalID: 'DI 2', direction: 'IN', valueType: 'BOOLEAN' },
                    { signalID: 'DI 3', direction: 'IN', valueType: 'BOOLEAN' },
                    { signalID: 'DI 4', direction: 'IN', valueType: 'BOOLEAN' },
                    { signalID: 'DI 5', direction: 'IN', valueType: 'BOOLEAN' },
                    { signalID: 'DI 6', direction: 'IN', valueType: 'BOOLEAN' },
                    { signalID: 'DI 7', direction: 'IN', valueType: 'BOOLEAN' },
                    { signalID: 'DO 0', direction: 'OUT', valueType: 'BOOLEAN' },
                    { signalID: 'DO 1', direction: 'OUT', valueType: 'BOOLEAN' },
                    { signalID: 'DO 2', direction: 'OUT', valueType: 'BOOLEAN' },
                    { signalID: 'DO 3', direction: 'OUT', valueType: 'BOOLEAN' },
                    { signalID: 'DO 4', direction: 'OUT', valueType: 'BOOLEAN' },
                    { signalID: 'DO 5', direction: 'OUT', valueType: 'BOOLEAN' },
                    { signalID: 'DO 6', direction: 'OUT', valueType: 'BOOLEAN' },
                    { signalID: 'DO 7', direction: 'OUT', valueType: 'BOOLEAN' },
                    { signalID: 'CI 0', direction: 'IN', valueType: 'BOOLEAN' },
                    { signalID: 'CI 1', direction: 'IN', valueType: 'BOOLEAN' },
                    { signalID: 'CI 2', direction: 'IN', valueType: 'BOOLEAN' },
                    { signalID: 'CI 3', direction: 'IN', valueType: 'BOOLEAN' },
                    { signalID: 'CI 4', direction: 'IN', valueType: 'BOOLEAN' },
                    { signalID: 'CI 5', direction: 'IN', valueType: 'BOOLEAN' },
                    { signalID: 'CI 6', direction: 'IN', valueType: 'BOOLEAN' },
                    { signalID: 'CI 7', direction: 'IN', valueType: 'BOOLEAN' },
                    { signalID: 'CO 0', direction: 'OUT', valueType: 'BOOLEAN' },
                    { signalID: 'CO 1', direction: 'OUT', valueType: 'BOOLEAN' },
                    { signalID: 'CO 2', direction: 'OUT', valueType: 'BOOLEAN' },
                    { signalID: 'CO 3', direction: 'OUT', valueType: 'BOOLEAN' },
                    { signalID: 'CO 4', direction: 'OUT', valueType: 'BOOLEAN' },
                    { signalID: 'CO 5', direction: 'OUT', valueType: 'BOOLEAN' },
                    { signalID: 'CO 6', direction: 'OUT', valueType: 'BOOLEAN' },
                    { signalID: 'CO 7', direction: 'OUT', valueType: 'BOOLEAN' },
                    { signalID: 'AI 0', direction: 'IN', valueType: 'FLOAT' },
                    { signalID: 'AI 1', direction: 'IN', valueType: 'FLOAT' },
                    { signalID: 'AO 0', direction: 'OUT', valueType: 'FLOAT' },
                    { signalID: 'AO 1', direction: 'OUT', valueType: 'FLOAT' },
                  ],
                  webSocketURL: '/sources/wired-io',
                },
                {
                  sourceID: 'ur-tool-io',
                  signals: [
                    { signalID: 'DI 0', direction: 'IN', valueType: 'BOOLEAN' },
                    { signalID: 'DI 1', direction: 'IN', valueType: 'BOOLEAN' },
                    { signalID: 'DO 0', direction: 'OUT', valueType: 'BOOLEAN' },
                    { signalID: 'DO 1', direction: 'OUT', valueType: 'BOOLEAN' },
                    { signalID: 'AI 0', direction: 'IN', valueType: 'FLOAT' },
                    { signalID: 'AI 1', direction: 'IN', valueType: 'FLOAT' },
                  ],
                  webSocketURL: '/sources/tool-io',
                },
              ],
              isDynamic: false,
            },
            'ur-modbus': {
              groupId: 'ur-modbus',
              isDynamic: true,
              version: '1.0.0',
              sources: [],
            },
          },
          safety: {
            settings: {
              io: {
                automaticModeSafeguardResetInput: {
                  name: "automaticModeSafeguardResetInput",
                  valueA: 255,
                  valueB: 255
                },
                automaticModeSafeguardStopInput: {
                  name: "automaticModeSafeguardStopInput",
                  valueA: 255,
                  valueB: 255
                },
                emergencyStopInput: {
                  name: "emergencyStopInput",
                  valueA: 255,
                  valueB: 255
                },
                notReducedModeOutput: {
                  name: "notReducedModeOutput",
                  ossdEnabled: false,
                  valueA: 255,
                  valueB: 255
                },
                operationalModeInput: {
                  name: "operationalModeInput",
                  valueA: 255,
                  valueB: 255
                },
                reducedModeInput: {
                  name: "reducedModeInput",
                  valueA: 255,
                  valueB: 255
                },
                reducedModeOutput: {
                  name: "reducedModeOutput",
                  ossdEnabled: false,
                  valueA: 255,
                  valueB: 255
                },
                robotMovingOutput: {
                  name: "robotMovingOutput",
                  ossdEnabled: false,
                  valueA: 255,
                  valueB: 255
                },
                robotNotStoppingOutput: {
                  name: "robotNotStoppingOutput",
                  ossdEnabled: false,
                  valueA: 255,
                  valueB: 255
                },
                safeHomeOutput: {
                  name: "safeHomeOutput",
                  ossdEnabled: false,
                  valueA: 255,
                  valueB: 255
                },
                safeguardResetInput: {
                  name: "safeguardResetInput",
                  valueA: 0,
                  valueB: 1
                },
                systemEmergencyStoppedOutput: {
                  name: "systemEmergencyStoppedOutput",
                  ossdEnabled: false,
                  valueA: 255,
                  valueB: 255
                },
                threePositionSwitchInput: {
                  name: "threePositionSwitchInput",
                  valueA: 255,
                  valueB: 255
                }
              },
              major: 5,
              minor: 5,
              normalJointPositions: {
                base: {
                  maximum: 6.33555,
                  maximumJointPosition: 0.05235988,
                  maximumRevolutionCounter: 1,
                  minimum: -6.33555,
                  minimumJointPosition: 6.2308254,
                  minimumRevolutionCounter: -2,
                  unlimited: false
                },
                elbow: {
                  maximum: 6.33555,
                  maximumJointPosition: 0.05235988,
                  maximumRevolutionCounter: 1,
                  minimum: -6.33555,
                  minimumJointPosition: 6.2308254,
                  minimumRevolutionCounter: -2,
                  unlimited: false
                },
                shoulder: {
                  maximum: 6.33555,
                  maximumJointPosition: 0.05235988,
                  maximumRevolutionCounter: 1,
                  minimum: -6.33555,
                  minimumJointPosition: 6.2308254,
                  minimumRevolutionCounter: -2,
                  unlimited: false
                },
                wrist1: {
                  maximum: 6.33555,
                  maximumJointPosition: 0.05235988,
                  maximumRevolutionCounter: 1,
                  minimum: -6.33555,
                  minimumJointPosition: 6.2308254,
                  minimumRevolutionCounter: -2,
                  unlimited: false
                },
                wrist2: {
                  maximum: 6.33555,
                  maximumJointPosition: 0.05235988,
                  maximumRevolutionCounter: 1,
                  minimum: -6.33555,
                  minimumJointPosition: 6.2308254,
                  minimumRevolutionCounter: -2,
                  unlimited: false
                },
                wrist3: {
                  maximum: 6.33555,
                  maximumJointPosition: 0.05235988,
                  maximumRevolutionCounter: 1,
                  minimum: -6.33555,
                  minimumJointPosition: 6.2308254,
                  minimumRevolutionCounter: -2,
                  unlimited: false
                }
              },
              normalJointSpeeds: {
                base: 2.2943952,
                shoulder: 2.2943952,
                elbow: 3.3415926,
                wrist1: 3.3415926,
                wrist2: 3.3415926,
                wrist3: 3.3415926
              },
              normalRobotLimits: {
                elbowForce: 150,
                elbowSpeed: 1.5,
                momentum: 25,
                power: 300,
                stoppingDistance: 0.5,
                stoppingTime: 0.4,
                toolForce: 150,
                toolSpeed: 1.5
              },
              reducedJointPositions: {
                base: {
                  maximum: 6.33555,
                  maximumJointPosition: 0.05235988,
                  maximumRevolutionCounter: 1,
                  minimum: -6.33555,
                  minimumJointPosition: 6.2308254,
                  minimumRevolutionCounter: -2,
                  unlimited: false
                },
                elbow: {
                  maximum: 6.33555,
                  maximumJointPosition: 0.05235988,
                  maximumRevolutionCounter: 1,
                  minimum: -6.33555,
                  minimumJointPosition: 6.2308254,
                  minimumRevolutionCounter: -2,
                  unlimited: false
                },
                shoulder: {
                  maximum: 6.33555,
                  maximumJointPosition: 0.05235988,
                  maximumRevolutionCounter: 1,
                  minimum: -6.33555,
                  minimumJointPosition: 6.2308254,
                  minimumRevolutionCounter: -2,
                  unlimited: false
                },
                wrist1: {
                  maximum: 6.33555,
                  maximumJointPosition: 0.05235988,
                  maximumRevolutionCounter: 1,
                  minimum: -6.33555,
                  minimumJointPosition: 6.2308254,
                  minimumRevolutionCounter: -2,
                  unlimited: false
                },
                wrist2: {
                  maximum: 6.33555,
                  maximumJointPosition: 0.05235988,
                  maximumRevolutionCounter: 1,
                  minimum: -6.33555,
                  minimumJointPosition: 6.2308254,
                  minimumRevolutionCounter: -2,
                  unlimited: false
                },
                wrist3: {
                  maximum: 6.33555,
                  maximumJointPosition: 0.05235988,
                  maximumRevolutionCounter: 1,
                  minimum: -6.33555,
                  minimumJointPosition: 6.2308254,
                  minimumRevolutionCounter: -2,
                  unlimited: false
                }
              },
              reducedJointSpeeds: {
                base: 2.2943952,
                shoulder: 2.2943952,
                elbow: 3.3415926,
                wrist1: 3.3415926,
                wrist2: 3.3415926,
                wrist3: 3.3415926
              },
              reducedRobotLimits: {
                elbowForce: 120,
                elbowSpeed: 0.75,
                momentum: 10,
                power: 200,
                stoppingDistance: 0.3,
                stoppingTime: 0.3,
                toolForce: 120,
                toolSpeed: 0.75
              },
              safetyHardware: {
                injectionMoldingMachineInterface: "NONE",
                teachPendant: "NORMAL"
              },
              "safetyPlanes": {
                "planes": [
                  {
                    "safetyPlane": {
                      "name": "UNDEFINED",
                      "normalModePlane": {
                        "distance": 0,
                        "emptyPlane": true,
                        "vector": {
                          "x": 0,
                          "y": 0,
                          "z": 0
                        }
                      },
                      "reducedModePlane": {
                        "distance": 0,
                        "emptyPlane": true,
                        "vector": {
                          "x": 0,
                          "y": 0,
                          "z": 0
                        }
                      },
                      "reducedModeTriggerPlane": {
                        "distance": 0,
                        "emptyPlane": true,
                        "vector": {
                          "x": 0,
                          "y": 0,
                          "z": 0
                        }
                      },
                      "restrictsElbow": false
                    },
                    "tilt": 0,
                    "offset": 0,
                    "rotation": 0,
                    "restriction": "disabled"
                  },
                  {
                    "safetyPlane": {
                      "name": "UNDEFINED",
                      "normalModePlane": {
                        "distance": 0,
                        "emptyPlane": true,
                        "vector": {
                          "x": 0,
                          "y": 0,
                          "z": 0
                        }
                      },
                      "reducedModePlane": {
                        "distance": 0,
                        "emptyPlane": true,
                        "vector": {
                          "x": 0,
                          "y": 0,
                          "z": 0
                        }
                      },
                      "reducedModeTriggerPlane": {
                        "distance": 0,
                        "emptyPlane": true,
                        "vector": {
                          "x": 0,
                          "y": 0,
                          "z": 0
                        }
                      },
                      "restrictsElbow": false
                    },
                    "tilt": 0,
                    "offset": 0,
                    "rotation": 0,
                    "restriction": "disabled"
                  },
                  {
                    "safetyPlane": {
                      "name": "UNDEFINED",
                      "normalModePlane": {
                        "distance": 0,
                        "emptyPlane": true,
                        "vector": {
                          "x": 0,
                          "y": 0,
                          "z": 0
                        }
                      },
                      "reducedModePlane": {
                        "distance": 0,
                        "emptyPlane": true,
                        "vector": {
                          "x": 0,
                          "y": 0,
                          "z": 0
                        }
                      },
                      "reducedModeTriggerPlane": {
                        "distance": 0,
                        "emptyPlane": true,
                        "vector": {
                          "x": 0,
                          "y": 0,
                          "z": 0
                        }
                      },
                      "restrictsElbow": false
                    },
                    "tilt": 0,
                    "offset": 0,
                    "rotation": 0,
                    "restriction": "disabled"
                  },
                  {
                    "safetyPlane": {
                      "name": "UNDEFINED",
                      "normalModePlane": {
                        "distance": 0,
                        "emptyPlane": true,
                        "vector": {
                          "x": 0,
                          "y": 0,
                          "z": 0
                        }
                      },
                      "reducedModePlane": {
                        "distance": 0,
                        "emptyPlane": true,
                        "vector": {
                          "x": 0,
                          "y": 0,
                          "z": 0
                        }
                      },
                      "reducedModeTriggerPlane": {
                        "distance": 0,
                        "emptyPlane": true,
                        "vector": {
                          "x": 0,
                          "y": 0,
                          "z": 0
                        }
                      },
                      "restrictsElbow": false
                    },
                    "tilt": 0,
                    "offset": 0,
                    "rotation": 0,
                    "restriction": "disabled"
                  },
                  {
                    "safetyPlane": {
                      "name": "UNDEFINED",
                      "normalModePlane": {
                        "distance": 0,
                        "emptyPlane": true,
                        "vector": {
                          "x": 0,
                          "y": 0,
                          "z": 0
                        }
                      },
                      "reducedModePlane": {
                        "distance": 0,
                        "emptyPlane": true,
                        "vector": {
                          "x": 0,
                          "y": 0,
                          "z": 0
                        }
                      },
                      "reducedModeTriggerPlane": {
                        "distance": 0,
                        "emptyPlane": true,
                        "vector": {
                          "x": 0,
                          "y": 0,
                          "z": 0
                        }
                      },
                      "restrictsElbow": false
                    },
                    "tilt": 0,
                    "offset": 0,
                    "rotation": 0,
                    "restriction": "disabled"
                  },
                  {
                    "safetyPlane": {
                      "name": "UNDEFINED",
                      "normalModePlane": {
                        "distance": 0,
                        "emptyPlane": true,
                        "vector": {
                          "x": 0,
                          "y": 0,
                          "z": 0
                        }
                      },
                      "reducedModePlane": {
                        "distance": 0,
                        "emptyPlane": true,
                        "vector": {
                          "x": 0,
                          "y": 0,
                          "z": 0
                        }
                      },
                      "reducedModeTriggerPlane": {
                        "distance": 0,
                        "emptyPlane": true,
                        "vector": {
                          "x": 0,
                          "y": 0,
                          "z": 0
                        }
                      },
                      "restrictsElbow": false
                    },
                    "tilt": 0,
                    "offset": 0,
                    "rotation": 0,
                    "restriction": "disabled"
                  },
                  {
                    "safetyPlane": {
                      "name": "UNDEFINED",
                      "normalModePlane": {
                        "distance": 0,
                        "emptyPlane": true,
                        "vector": {
                          "x": 0,
                          "y": 0,
                          "z": 0
                        }
                      },
                      "reducedModePlane": {
                        "distance": 0,
                        "emptyPlane": true,
                        "vector": {
                          "x": 0,
                          "y": 0,
                          "z": 0
                        }
                      },
                      "reducedModeTriggerPlane": {
                        "distance": 0,
                        "emptyPlane": true,
                        "vector": {
                          "x": 0,
                          "y": 0,
                          "z": 0
                        }
                      },
                      "restrictsElbow": false
                    },
                    "tilt": 0,
                    "offset": 0,
                    "rotation": 0,
                    "restriction": "disabled"
                  },
                  {
                    "safetyPlane": {
                      "name": "UNDEFINED",
                      "normalModePlane": {
                        "distance": 0,
                        "emptyPlane": true,
                        "vector": {
                          "x": 0,
                          "y": 0,
                          "z": 0
                        }
                      },
                      "reducedModePlane": {
                        "distance": 0,
                        "emptyPlane": true,
                        "vector": {
                          "x": 0,
                          "y": 0,
                          "z": 0
                        }
                      },
                      "reducedModeTriggerPlane": {
                        "distance": 0,
                        "emptyPlane": true,
                        "vector": {
                          "x": 0,
                          "y": 0,
                          "z": 0
                        }
                      },
                      "restrictsElbow": false
                    },
                    "tilt": 0,
                    "offset": 0,
                    "rotation": 0,
                    "restriction": "disabled"
                  }
                ]
              },
              safetySafeHome: {
                base: -1,
                elbow: -1,
                shoulder: -1,
                wrist1: -1,
                wrist2: -1,
                wrist3: -1
              },
              threePosition: {
                allowManualHighSpeed: true,
                useTeachPendantAs3PE: false
              },
              toolDirection: {
                limitDeviation: 6.2831855,
                limitDirection: { x: 0, y: 0, z: 1 },
                limitRestriction: "DISABLED",
                toolPan: 0,
                toolTilt: 0
              },
              toolPositions: {
                toolPositions: [
                  {
                    center: { x: 0, y: 0, z: 0 },
                    name: "UNDEFINED",
                    radius: 0
                  },
                  {
                    center: { x: 0, y: 0, z: 0 },
                    name: "UNDEFINED",
                    radius: 0
                  },
                  {
                    center: { x: 0, y: 0, z: 0 },
                    name: "UNDEFINED",
                    radius: 0
                  }
                ]
              }
            },
            crc: '1041004964', // Updated to match desired output
          },
          operatorScreens: [],
          smartSkills: [
            {
              name: "Align to Plane",
              enabled: true,
              type: "ur-align-to-plane",
              parameters: {
                radius: 0.05,
                push_force: 20,
                n_plane_points: 3,
                max_distance: 0.25,
                velocity_slow: 0.001,
                velocity_search: 0.035,
                velocity_move: 0.1,
                acceleration: 0.1
              }
            },
            {
              name: "Align Z to Nearest Axis",
              enabled: true,
              type: "ur-align-z-to-nearest-axis"
            },
            {
              name: "Center",
              enabled: true,
              type: "ur-center",
              parameters: {
                push_force: 10,
                velocity_move: 0.05,
                acc_move: 0.2,
                max_radius_search: 0.05,
                num_fingers: 3
              }
            },
            {
              name: "Freedrive",
              enabled: true,
              type: "ur-freedrive"
            },
            {
              name: "Move into Contact",
              enabled: true,
              type: "ur-move-into-contact",
              parameters: {
                force: 10,
                velocity: 0.05,
                acceleration: 0.2,
                max_distance: 0.25,
                retract: 0
              }
            },
            {
              name: "Retract",
              enabled: true,
              type: "ur-retract",
              parameters: {
                distance: -0.1,
                acceleration: 0.4,
                velocity: 0.1
              }
            },
            {
              name: "Custom Smart Skill",
              enabled: false,
              type: "ur-custom-smart-skill",
              parameters: {}
            }
          ],
        },
        urscript: {
          script: '',
          nodeIDList: [],
        },
      },
      program: {
        id: '5',
        programContent: {
          children: [
            {
              children: [],
              contributedNode: {
                children: [],
                type: 'ur-modules',
                version: '0.0.1',
                allowsChildren: true,
                lockChildren: false,
              },
              guid: getUUID(),
              parentId: '46e0acdd-f641-d632-53ad-04ad50071697',
            },
            {
              children: [],
              contributedNode: {
                type: 'ur-functions',
                version: '0.0.1',
                allowsChildren: true,
                lockChildren: false,
              },
              guid: getUUID(),
              parentId: '46e0acdd-f641-d632-53ad-04ad50071697',
            },
            {
              children: [],
              contributedNode: {
                type: 'ur-before-start',
                version: '0.0.1',
                allowsChildren: true,
              },
              guid: getUUID(),
              parentId: '46e0acdd-f641-d632-53ad-04ad50071697',
            },
            {
              children: [],
              contributedNode: {
                type: 'ur-configuration',
                version: '0.0.1',
                allowsChildren: true,
                parameters: {},
              },
              guid: getUUID(),
              parentId: '46e0acdd-f641-d632-53ad-04ad50071697',
            },
            {
              children: [],
              contributedNode: {
                type: 'ur-status',
                version: '0.0.1',
                allowsChildren: true,
                parameters: {},
              },
              guid: getUUID(),
              parentId: '46e0acdd-f641-d632-53ad-04ad50071697',
            },
            {
              children: convertedMoves,
              contributedNode: {
                type: 'ur-code',
                version: '0.0.1',
                allowsChildren: true,
                lockChildren: false,
                parameters: {
                  loopForever: false,
                },
              },
              guid: getUUID(),
              parentId: '46e0acdd-f641-d632-53ad-04ad50071697',
            },
          ],
          contributedNode: {
            children: [
              {
                children: [],
                type: "ur-modules",
                version: "0.0.1",
                allowsChildren: true,
                lockChildren: false
              },
              {
                type: "ur-functions",
                version: "0.0.1",
                allowsChildren: true,
                lockChildren: false
              },
              {
                type: "ur-before-start",
                version: "0.0.1",
                allowsChildren: true
              },
              {
                type: "ur-configuration",
                version: "0.0.1",
                allowsChildren: true,
                parameters: {}
              },
              { 
                type: "ur-status",
                version: "0.0.1",
                allowsChildren: true,
                parameters: {}
              },
              {
                type: "ur-code",
                version: "0.0.1",
                allowsChildren: true,
                lockChildren: false,
                parameters: {
                  loopForever: false
                }
              }
            ],
            type: 'ur-program',
            version: '0.0.1',
            allowsChildren: true,
            lockChildren: true,
            parameters: {
              name: 'Default program',
            },
          },
          guid: getUUID(),
        },
        programInformation,
        urscript,
      },
    };

    // Output the JSON
    fs.writeFile('output.urpx', JSON.stringify(finalOutput, null, 2), (writeErr) => {
      if (writeErr) {
        console.error('Error writing the JSON file:', writeErr);
        return;
      }
      console.log('Conversion completed successfully. Output written to output.urpx');
    });
  });
});



