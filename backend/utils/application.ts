export const application = {
  id: "55",
  applicationInfo: {
      name: "main_application"
  },
  applicationContent: {
      applicationContributions: {
          "ur-mounting": {
              type: "ur-mounting",
              version: "0.0.1",
              mounting: {
                  baseAngle: {
                      value: 0,
                      unit: "deg"
                  },
                  tiltAngle: {
                      value: 0,
                      unit: "deg"
                  }
              }
          },
          "ur-frames": {
              type: "ur-frames",
              version: "0.0.5",
              framesList: [
                  {
                      name: "base",
                      nameVariable: {
                          name: "base",
                          reference: false,
                          type: "$$Variable",
                          valueType: "frame"
                      },
                      parent: "world",
                      pose: {
                          position: [
                              0,
                              0,
                              0
                          ],
                          orientation: [
                              0,
                              0,
                              0
                          ]
                      }
                  },
                  {
                      name: "tcp",
                      nameVariable: {
                          name: "tcp",
                          reference: false,
                          type: "$$Variable",
                          valueType: "frame"
                      },
                      parent: "base",
                      pose: {
                          position: [
                              0,
                              0,
                              0
                          ],
                          orientation: [
                              0,
                              0,
                              0
                          ]
                      }
                  },
                  {
                      name: "world",
                      nameVariable: {
                          name: "world",
                          reference: false,
                          type: "$$Variable",
                          valueType: "frame"
                      },
                      pose: {
                          position: [
                              0,
                              0,
                              0
                          ],
                          orientation: [
                              0,
                              0,
                              0
                          ]
                      }
                  }
              ]
          },
          "ur-grid-pattern": {
              type: "ur-grid-pattern",
              version: "0.0.3",
              grids: [
                  {
                      grid: {
                          name: "grid",
                          reference: false,
                          type: "$$Variable",
                          valueType: "grid"
                      },
                      waypoint: {
                          name: "grid_iterator",
                          reference: false,
                          type: "$$Variable",
                          valueType: "waypoint"
                      },
                      corners: [
                          null,
                          null,
                          null,
                          null
                      ],
                      numRows: 4,
                      numColumns: 5
                  }
              ]
          },
          "ur-end-effector": {
              type: "ur-end-effector",
              version: "0.0.2",
              endEffectors: [
                  {
                      id: "86009adf-7a5d-ffa5-ed92-06670768600f",
                      name: "Robot",
                      payload: {
                          weight: {
                              value: 0,
                              unit: "kg"
                          }
                      },
                      cog: {
                          cx: {
                              value: 0,
                              unit: "m"
                          },
                          cy: {
                              value: 0,
                              unit: "m"
                          },
                          cz: {
                              value: 0,
                              unit: "m"
                          }
                      },
                      inertia: {
                          Ixx: {
                              value: 0,
                              unit: "kg*m^2"
                          },
                          Iyy: {
                              value: 0,
                              unit: "kg*m^2"
                          },
                          Izz: {
                              value: 0,
                              unit: "kg*m^2"
                          },
                          Ixy: {
                              value: 0,
                              unit: "kg*m^2"
                          },
                          Ixz: {
                              value: 0,
                              unit: "kg*m^2"
                          },
                          Iyz: {
                              value: 0,
                              unit: "kg*m^2"
                          }
                      },
                      useCustomInertia: false,
                      tcps: [
                          {
                              id: "708f6642-ea70-6871-7619-14318c664153",
                              name: "Tool_flange",
                              x: {
                                  value: 0,
                                  unit: "m"
                              },
                              y: {
                                  value: 0,
                                  unit: "m"
                              },
                              z: {
                                  value: 0,
                                  unit: "m"
                              },
                              rx: {
                                  value: 0,
                                  unit: "rad"
                              },
                              ry: {
                                  value: 0,
                                  unit: "rad"
                              },
                              rz: {
                                  value: 0,
                                  unit: "rad"
                              }
                          }
                      ]
                  }
              ],
              defaultTcp: {
                  endEffectorId: "86009adf-7a5d-ffa5-ed92-06670768600f",
                  tcpId: "708f6642-ea70-6871-7619-14318c664153"
              }
          },
          "ur-smart-skills": {
              type: "ur-smart-skills",
              version: "0.0.2",
              preamble: "# Start of Forces\n###\n# Transforms the force and torque values along the axes of the given pose\n# @param pose pose Any valid pose, defaults to base, the x, y, and z values are ignored\n# @return array 6D force torque vector with [Fx, Fy, Fz, Mx, My, Mz] aligned to pose in N and Nm respectively\n###\ndef get_tcp_wrench_in_frame(pose = p[0.0, 0.0, 0.0, 0.0, 0.0, 0.0]):\n    # we are only interested in the rotation of pose, set translations to zero\n    local target_pose = pose\n    target_pose[0] = 0\n    target_pose[1] = 0\n    target_pose[2] = 0\n    # the conversion needs to happen as poses, so we need to convert back and forth a bit\n    local force = get_tcp_force()\n    local force_vector_as_pose = p[force[0], force[1], force[2], 0, 0, 0]\n    local torque_vector_as_pose = p[force[3], force[4], force[5], 0, 0, 0]\n    local transformed_force_as_pose = pose_trans(pose_inv(target_pose), force_vector_as_pose)\n    local transformed_torque_as_pose = pose_trans(pose_inv(target_pose), torque_vector_as_pose)\n    return [transformed_force_as_pose[0], transformed_force_as_pose[1], transformed_force_as_pose[2], transformed_torque_as_pose[0], transformed_torque_as_pose[1], transformed_torque_as_pose[2]]\nend\n###\n# See documentation for @link:get_tcp_wrench_in_frame()\n# @return forces and torques measured in TCP frame\n###\ndef get_tcp_wrench():\n    return get_tcp_wrench_in_frame(get_target_tcp_pose())\nend\n###\n# Projects the measured TCP force along the axis given\n# @param axis array 3D vector\n###\ndef project_tcp_force(axis):\n    local wrench = get_tcp_wrench()\n    local force = [wrench[0], wrench[1], wrench[2]]\n    return dot(force, axis)\nend\n# End of Forces\n# Start of Math\n# Definitions of constants\nglobal PI = acos(-1)\n###\n# Calculates the cross product between to 3D vectors\n# @param v1 array 3D vector\n# @param v2 array 3D vector\n###\ndef cross(v1, v2):\n    if length(v1) != length(v2):\n        popup(str_cat(\"For computing the cross product, the two vectors must have the same length. Provided lengths: \", [length(v1), length(v2)]), error=True, blocking=True)\n        return -1\n    end\n    if length(v1) != 3:\n        popup(str_cat(\"For computing the cross product, the two vectors must have length 3. Provided lengths: \", [length(v1), length(v2)]), error=True, blocking=True)\n        return -1\n    end\n    cross = [0.0, 0.0, 0.0]\n    i = 0\n    while i < 3:\n        j = (i + 1) % 3 # The next index in a cyclic order\n        k = (i + 2) % 3 # The next next index in a cyclic order\n        cross[i] = v1[j] * v2[k] - v1[k] * v2[j]\n        i = i + 1\n    end\n    return cross\nend\n###\n# Calculates the dot product between to n-dimensional vectors\n# @param v1 array nD vector\n# @param v2 array nD vector\n###\ndef dot(v1, v2):\n    if length(v1) != length(v2):\n        popup(str_cat(\"For computing the dot product, the two vectors must have the same length. Provided lengths: \", [length(v1), length(v2)]), error=True, blocking=True)\n        return -1\n    end\n    result = 0\n    i = 0\n    while i < length(v1):\n        result = result + (v1[i] * v2[i])\n        i = i + 1\n    end\n    return result\nend\n###\n# Return the larger number of a and b\n# @param a number a\n# @param b number b\n###\ndef max(a, b):\n    if a > b:\n        return a\n    end\n    return b\nend\n# End of Math\n# Start of Move Helper\nur_move_until_force_distance = 0.1\nur_move_until_force_direction = [0, 0, 1]\nur_move_until_force_velocity = 0.1\nur_move_until_force_acceleration = 0.2\ndef ur_move_tcp_direction(distance, direction, velocity, acceleration, blend_radius):\n    current_pose = get_target_tcp_pose()\n    movement = normalize(direction) * distance\n    target_pose = pose_trans(current_pose, p[movement[0], movement[1], movement[2], 0, 0, 0])\n    movel(target_pose, a = 0.2, v = velocity, r = blend_radius)\nend\nthread ur_move_until_force_thread():\n    ur_move_tcp_direction(ur_move_until_force_distance, ur_move_until_force_direction, ur_move_until_force_velocity, ur_move_until_force_acceleration, 0)\n    popup(\"No contact detected.\", title = \"No Contact\", warning = False, error = True, blocking = False)\n    halt\nend\n###\n# Moves the robot in the TCP direction specified until a contact point is reached *or*\n# the robot reaches the maximum distance allowed specified by the distance parameter.\n# @param distance number The maximum distance the robot is allowed to travel in the direction specified\n# @param direction array 3D vector determining the move direction of the TCP\n# @param velocity number Velocity of the robot\n# @param acceleration number Acceleration of the robot\n# @param stop_force number Maximum search radius\n###\ndef ur_move_until_force(distance = 0.1, direction = [0, 0, 1], velocity = 0.1, acceleration = 0.2, stop_force = 20):\n    ur_move_until_force_distance = distance\n    ur_move_until_force_direction = direction\n    ur_move_until_force_velocity = velocity\n    ur_move_until_force_acceleration = acceleration\n    \n    thrd = run ur_move_until_force_thread()\n    while - project_tcp_force(direction) < stop_force:\n        sync()\n    end\n    kill thrd\n    actual_pose = get_actual_tcp_pose()\n    stopl(1.0)\n    return actual_pose\nend\ndef ur_path_move(end_q, v, rampdown=False):\n    # Calculate distance to target\n    delta_q = end_q - get_target_joint_positions()\n    # Calculate time to move based on desired velocity\n    t = norm(delta_q) / v\n    if(rampdown):\n        while(norm(get_target_joint_speeds()) > 0.0001):\n            servoj(end_q , 0, 0, max(t, 0.001))\n        end\n    else:\n        servoj(end_q , 0, 0, t, lookahead_time=0.1,  gain=2000)\n    end\nend\n# End of Move Helper"
          }
      },
      sourceConfig: {
          labelMap: {},
          analogDomainMap: {},
          presets: {}
      },
      sourcesNodes: {
          robot: {
              groupId: "robot",
              version: "1.0.0.",
              sources: [
                  {
                      sourceID: "ur-wired-io",
                      signals: [
                          {
                              signalID: "DI 0",
                              direction: "IN",
                              valueType: "BOOLEAN"
                          },
                          {
                              signalID: "DI 1",
                              direction: "IN",
                              valueType: "BOOLEAN"
                          },
                          {
                              signalID: "DI 2",
                              direction: "IN",
                              valueType: "BOOLEAN"
                          },
                          {
                              signalID: "DI 3",
                              direction: "IN",
                              valueType: "BOOLEAN"
                          },
                          {
                              signalID: "DI 4",
                              direction: "IN",
                              valueType: "BOOLEAN"
                          },
                          {
                              signalID: "DI 5",
                              direction: "IN",
                              valueType: "BOOLEAN"
                          },
                          {
                              signalID: "DI 6",
                              direction: "IN",
                              valueType: "BOOLEAN"
                          },
                          {
                              signalID: "DI 7",
                              direction: "IN",
                              valueType: "BOOLEAN"
                          },
                          {
                              signalID: "DO 0",
                              direction: "OUT",
                              valueType: "BOOLEAN"
                          },
                          {
                              signalID: "DO 1",
                              direction: "OUT",
                              valueType: "BOOLEAN"
                          },
                          {
                              signalID: "DO 2",
                              direction: "OUT",
                              valueType: "BOOLEAN"
                          },
                          {
                              signalID: "DO 3",
                              direction: "OUT",
                              valueType: "BOOLEAN"
                          },
                          {
                              signalID: "DO 4",
                              direction: "OUT",
                              valueType: "BOOLEAN"
                          },
                          {
                              signalID: "DO 5",
                              direction: "OUT",
                              valueType: "BOOLEAN"
                          },
                          {
                              signalID: "DO 6",
                              direction: "OUT",
                              valueType: "BOOLEAN"
                          },
                          {
                              signalID: "DO 7",
                              direction: "OUT",
                              valueType: "BOOLEAN"
                          },
                          {
                              signalID: "CI 0",
                              direction: "IN",
                              valueType: "BOOLEAN"
                          },
                          {
                              signalID: "CI 1",
                              direction: "IN",
                              valueType: "BOOLEAN"
                          },
                          {
                              signalID: "CI 2",
                              direction: "IN",
                              valueType: "BOOLEAN"
                          },
                          {
                              signalID: "CI 3",
                              direction: "IN",
                              valueType: "BOOLEAN"
                          },
                          {
                              signalID: "CI 4",
                              direction: "IN",
                              valueType: "BOOLEAN"
                          },
                          {
                              signalID: "CI 5",
                              direction: "IN",
                              valueType: "BOOLEAN"
                          },
                          {
                              signalID: "CI 6",
                              direction: "IN",
                              valueType: "BOOLEAN"
                          },
                          {
                              signalID: "CI 7",
                              direction: "IN",
                              valueType: "BOOLEAN"
                          },
                          {
                              signalID: "CO 0",
                              direction: "OUT",
                              valueType: "BOOLEAN"
                          },
                          {
                              signalID: "CO 1",
                              direction: "OUT",
                              valueType: "BOOLEAN"
                          },
                          {
                              signalID: "CO 2",
                              direction: "OUT",
                              valueType: "BOOLEAN"
                          },
                          {
                              signalID: "CO 3",
                              direction: "OUT",
                              valueType: "BOOLEAN"
                          },
                          {
                              signalID: "CO 4",
                              direction: "OUT",
                              valueType: "BOOLEAN"
                          },
                          {
                              signalID: "CO 5",
                              direction: "OUT",
                              valueType: "BOOLEAN"
                          },
                          {
                              signalID: "CO 6",
                              direction: "OUT",
                              valueType: "BOOLEAN"
                          },
                          {
                              signalID: "CO 7",
                              direction: "OUT",
                              valueType: "BOOLEAN"
                          },
                          {
                              signalID: "AI 0",
                              direction: "IN",
                              valueType: "FLOAT"
                          },
                          {
                              signalID: "AI 1",
                              direction: "IN",
                              valueType: "FLOAT"
                          },
                          {
                              signalID: "AO 0",
                              direction: "OUT",
                              valueType: "FLOAT"
                          },
                          {
                              signalID: "AO 1",
                              direction: "OUT",
                              valueType: "FLOAT"
                          }
                      ],
                      webSocketURL: "/sources/wired-io"
                  },
                  {
                      sourceID: "ur-tool-io",
                      signals: [
                          {
                              signalID: "DI 0",
                              direction: "IN",
                              valueType: "BOOLEAN"
                          },
                          {
                              signalID: "DI 1",
                              direction: "IN",
                              valueType: "BOOLEAN"
                          },
                          {
                              signalID: "DO 0",
                              direction: "OUT",
                              valueType: "BOOLEAN"
                          },
                          {
                              signalID: "DO 1",
                              direction: "OUT",
                              valueType: "BOOLEAN"
                          },
                          {
                              signalID: "AI 0",
                              direction: "IN",
                              valueType: "FLOAT"
                          },
                          {
                              signalID: "AI 1",
                              direction: "IN",
                              valueType: "FLOAT"
                          }
                      ],
                      webSocketURL: "/sources/tool-io"
                  }
              ],
              isDynamic: false
          },
          "ur-modbus": {
              groupId: "ur-modbus",
              isDynamic: true,
              version: "1.0.0",
              sources: []
          }
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
                      maximum: 0,
                      maximumJointPosition: 0,
                      maximumRevolutionCounter: 2147483647,
                      minimum: 0,
                      minimumJointPosition: 0,
                      minimumRevolutionCounter: -2147483648,
                      unlimited: true
                  }
              },
              normalJointSpeeds: {
                  base: 3.3415926,
                  shoulder: 3.3415926,
                  elbow: 3.3415926,
                  wrist1: 6.4832,
                  wrist2: 6.4832,
                  wrist3: 6.4832
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
                      maximum: 0,
                      maximumJointPosition: 0,
                      maximumRevolutionCounter: 2147483647,
                      minimum: 0,
                      minimumJointPosition: 0,
                      minimumRevolutionCounter: -2147483648,
                      unlimited: true
                  }
              },
              reducedJointSpeeds: {
                  base: 3.3415926,
                  shoulder: 3.3415926,
                  elbow: 3.3415926,
                  wrist1: 6.4832,
                  wrist2: 6.4832,
                  wrist3: 6.4832
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
              safetyPlanes: {
                planes: [
                    {
                        safetyPlane: {
                            name: "UNDEFINED",
                            normalModePlane: {
                                distance: 0,
                                emptyPlane: true,
                                vector: {
                                    x: 0,
                                    y: 0,
                                    z: 0
                                }
                            },
                            reducedModePlane: {
                                distance: 0,
                                emptyPlane: true,
                                vector: {
                                    x: 0,
                                    y: 0,
                                    z: 0
                                }
                            },
                            reducedModeTriggerPlane: {
                                distance: 0,
                                emptyPlane: true,
                                vector: {
                                    x: 0,
                                    y: 0,
                                    z: 0
                                }
                            },
                            restrictsElbow: false
                        },
                        tilt: 0,
                        offset: 0,
                        rotation: 0,
                        restriction: "disabled"
                    },
                    {
                        safetyPlane: {
                            name: "UNDEFINED",
                            normalModePlane: {
                                distance: 0,
                                emptyPlane: true,
                                vector: {
                                    x: 0,
                                    y: 0,
                                    z: 0
                                }
                            },
                            reducedModePlane: {
                                distance: 0,
                                emptyPlane: true,
                                vector: {
                                    x: 0,
                                    y: 0,
                                    z: 0
                                }
                            },
                            reducedModeTriggerPlane: {
                                distance: 0,
                                emptyPlane: true,
                                vector: {
                                    x: 0,
                                    y: 0,
                                    z: 0
                                }
                            },
                            restrictsElbow: false
                        },
                        tilt: 0,
                        offset: 0,
                        rotation: 0,
                        restriction: "disabled"
                    },
                    {
                        safetyPlane: {
                            name: "UNDEFINED",
                            normalModePlane: {
                                distance: 0,
                                emptyPlane: true,
                                vector: {
                                    x: 0,
                                    y: 0,
                                    z: 0
                                }
                            },
                            reducedModePlane: {
                                distance: 0,
                                emptyPlane: true,
                                vector: {
                                    x: 0,
                                    y: 0,
                                    z: 0
                                }
                            },
                            reducedModeTriggerPlane: {
                                distance: 0,
                                emptyPlane: true,
                                vector: {
                                    x: 0,
                                    y: 0,
                                    z: 0
                                }
                            },
                            restrictsElbow: false
                        },
                        tilt: 0,
                        offset: 0,
                        rotation: 0,
                        restriction: "disabled"
                    },
                    {
                        safetyPlane: {
                            name: "UNDEFINED",
                            normalModePlane: {
                                distance: 0,
                                emptyPlane: true,
                                vector: {
                                    x: 0,
                                    y: 0,
                                    z: 0
                                }
                            },
                            reducedModePlane: {
                                distance: 0,
                                emptyPlane: true,
                                vector: {
                                    x: 0,
                                    y: 0,
                                    z: 0
                                }
                            },
                            reducedModeTriggerPlane: {
                                distance: 0,
                                emptyPlane: true,
                                vector: {
                                    x: 0,
                                    y: 0,
                                    z: 0
                                }
                            },
                            restrictsElbow: false
                        },
                        tilt: 0,
                        offset: 0,
                        rotation: 0,
                        restriction: "disabled"
                    },
                    {
                        safetyPlane: {
                            name: "UNDEFINED",
                            normalModePlane: {
                                distance: 0,
                                emptyPlane: true,
                                vector: {
                                    x: 0,
                                    y: 0,
                                    z: 0
                                }
                            },
                            reducedModePlane: {
                                distance: 0,
                                emptyPlane: true,
                                vector: {
                                    x: 0,
                                    y: 0,
                                    z: 0
                                }
                            },
                            reducedModeTriggerPlane: {
                                distance: 0,
                                emptyPlane: true,
                                vector: {
                                    x: 0,
                                    y: 0,
                                    z: 0
                                }
                            },
                            restrictsElbow: false
                        },
                        tilt: 0,
                        offset: 0,
                        rotation: 0,
                        restriction: "disabled"
                    },
                    {
                        safetyPlane: {
                            name: "UNDEFINED",
                            normalModePlane: {
                                distance: 0,
                                emptyPlane: true,
                                vector: {
                                    x: 0,
                                    y: 0,
                                    z: 0
                                }
                            },
                            reducedModePlane: {
                                distance: 0,
                                emptyPlane: true,
                                vector: {
                                    x: 0,
                                    y: 0,
                                    z: 0
                                }
                            },
                            reducedModeTriggerPlane: {
                                distance: 0,
                                emptyPlane: true,
                                vector: {
                                    x: 0,
                                    y: 0,
                                    z: 0
                                }
                            },
                            restrictsElbow: false
                        },
                        tilt: 0,
                        offset: 0,
                        rotation: 0,
                        restriction: "disabled"
                    },
                    {
                        safetyPlane: {
                            name: "UNDEFINED",
                            normalModePlane: {
                                distance: 0,
                                emptyPlane: true,
                                vector: {
                                    x: 0,
                                    y: 0,
                                    z: 0
                                }
                            },
                            reducedModePlane: {
                                distance: 0,
                                emptyPlane: true,
                                vector: {
                                    x: 0,
                                    y: 0,
                                    z: 0
                                }
                            },
                            reducedModeTriggerPlane: {
                                distance: 0,
                                emptyPlane: true,
                                vector: {
                                    x: 0,
                                    y: 0,
                                    z: 0
                                }
                            },
                            restrictsElbow: false
                        },
                        tilt: 0,
                        offset: 0,
                        rotation: 0,
                        restriction: "disabled"
                    },
                    {
                        safetyPlane: {
                            name: "UNDEFINED",
                            normalModePlane: {
                                distance: 0,
                                emptyPlane: true,
                                vector: {
                                    x: 0,
                                    y: 0,
                                    z: 0
                                }
                            },
                            reducedModePlane: {
                                distance: 0,
                                emptyPlane: true,
                                vector: {
                                    x: 0,
                                    y: 0,
                                    z: 0
                                }
                            },
                            reducedModeTriggerPlane: {
                                distance: 0,
                                emptyPlane: true,
                                vector: {
                                    x: 0,
                                    y: 0,
                                    z: 0
                                }
                            },
                            restrictsElbow: false
                        },
                        tilt: 0,
                        offset: 0,
                        rotation: 0,
                        restriction: "disabled"
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
                  limitDirection: {
                      x: 0,
                      y: 0,
                      z: 1
                  },
                  limitRestriction: "DISABLED",
                  toolPan: 0,
                  toolTilt: 0
              },
              toolPositions: {
                  toolPositions: [
                      {
                          center: {
                              x: 0,
                              y: 0,
                              z: 0
                          },
                          name: "UNDEFINED",
                          radius: 0
                      },
                      {
                          center: {
                              x: 0,
                              y: 0,
                              z: 0
                          },
                          name: "UNDEFINED",
                          radius: 0
                      },
                      {
                          center: {
                              x: 0,
                              y: 0,
                              z: 0
                          },
                          name: "UNDEFINED",
                          radius: 0
                      }
                  ]
              }
          },
          crc: "3683737400"
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
      ]
  },
  urscript: {
     script: "set_safety_mode_transition_hardness(1)\nreset_world_model()\nset_input_actions_to_default()\nset_analog_outputdomain(0,1)\nset_analog_outputdomain(1,1)\nset_standard_analog_input_domain(0,1)\nset_standard_analog_input_domain(1,1)\nset_tool_voltage(12)\nset_tool_analog_input_domain(0,1)\nset_tool_analog_input_domain(1,1)\nset_gravity([0, 0, 9.82])\nmove_frame(\"base\", p[0, 0, 0, 0, 0, 0], \"world\")\nglobal base = \"base\"\nglobal tcp = \"tcp\"\nglobal world = \"world\"\nset_target_payload(0, [0, 0, 0], [0, 0, 0, 0, 0, 0])\nset_tcp(p[0, 0, 0, 0, 0, 0], \"Tool_flange\")\n# Start of Forces\n###\n# Transforms the force and torque values along the axes of the given pose\n# @param pose pose Any valid pose, defaults to base, the x, y, and z values are ignored\n# @return array 6D force torque vector with [Fx, Fy, Fz, Mx, My, Mz] aligned to pose in N and Nm respectively\n###\ndef get_tcp_wrench_in_frame(pose = p[0.0, 0.0, 0.0, 0.0, 0.0, 0.0]):\n    # we are only interested in the rotation of pose, set translations to zero\n    local target_pose = pose\n    target_pose[0] = 0\n    target_pose[1] = 0\n    target_pose[2] = 0\n    # the conversion needs to happen as poses, so we need to convert back and forth a bit\n    local force = get_tcp_force()\n    local force_vector_as_pose = p[force[0], force[1], force[2], 0, 0, 0]\n    local torque_vector_as_pose = p[force[3], force[4], force[5], 0, 0, 0]\n    local transformed_force_as_pose = pose_trans(pose_inv(target_pose), force_vector_as_pose)\n    local transformed_torque_as_pose = pose_trans(pose_inv(target_pose), torque_vector_as_pose)\n    return [transformed_force_as_pose[0], transformed_force_as_pose[1], transformed_force_as_pose[2], transformed_torque_as_pose[0], transformed_torque_as_pose[1], transformed_torque_as_pose[2]]\nend\n###\n# See documentation for @link:get_tcp_wrench_in_frame()\n# @return forces and torques measured in TCP frame\n###\ndef get_tcp_wrench():\n    return get_tcp_wrench_in_frame(get_target_tcp_pose())\nend\n###\n# Projects the measured TCP force along the axis given\n# @param axis array 3D vector\n###\ndef project_tcp_force(axis):\n    local wrench = get_tcp_wrench()\n    local force = [wrench[0], wrench[1], wrench[2]]\n    return dot(force, axis)\nend\n# End of Forces\n# Start of Math\n# Definitions of constants\nglobal PI = acos(-1)\n###\n# Calculates the cross product between to 3D vectors\n# @param v1 array 3D vector\n# @param v2 array 3D vector\n###\ndef cross(v1, v2):\n    if length(v1) != length(v2):\n        popup(str_cat(\"For computing the cross product, the two vectors must have the same length. Provided lengths: \", [length(v1), length(v2)]), error=True, blocking=True)\n        return -1\n    end\n    if length(v1) != 3:\n        popup(str_cat(\"For computing the cross product, the two vectors must have length 3. Provided lengths: \", [length(v1), length(v2)]), error=True, blocking=True)\n        return -1\n    end\n    cross = [0.0, 0.0, 0.0]\n    i = 0\n    while i < 3:\n        j = (i + 1) % 3 # The next index in a cyclic order\n        k = (i + 2) % 3 # The next next index in a cyclic order\n        cross[i] = v1[j] * v2[k] - v1[k] * v2[j]\n        i = i + 1\n    end\n    return cross\nend\n###\n# Calculates the dot product between to n-dimensional vectors\n# @param v1 array nD vector\n# @param v2 array nD vector\n###\ndef dot(v1, v2):\n    if length(v1) != length(v2):\n        popup(str_cat(\"For computing the dot product, the two vectors must have the same length. Provided lengths: \", [length(v1), length(v2)]), error=True, blocking=True)\n        return -1\n    end\n    result = 0\n    i = 0\n    while i < length(v1):\n        result = result + (v1[i] * v2[i])\n        i = i + 1\n    end\n    return result\nend\n###\n# Return the larger number of a and b\n# @param a number a\n# @param b number b\n###\ndef max(a, b):\n    if a > b:\n        return a\n    end\n    return b\nend\n# End of Math\n# Start of Move Helper\nur_move_until_force_distance = 0.1\nur_move_until_force_direction = [0, 0, 1]\nur_move_until_force_velocity = 0.1\nur_move_until_force_acceleration = 0.2\ndef ur_move_tcp_direction(distance, direction, velocity, acceleration, blend_radius):\n    current_pose = get_target_tcp_pose()\n    movement = normalize(direction) * distance\n    target_pose = pose_trans(current_pose, p[movement[0], movement[1], movement[2], 0, 0, 0])\n    movel(target_pose, a = 0.2, v = velocity, r = blend_radius)\nend\nthread ur_move_until_force_thread():\n    ur_move_tcp_direction(ur_move_until_force_distance, ur_move_until_force_direction, ur_move_until_force_velocity, ur_move_until_force_acceleration, 0)\n    popup(\"No contact detected.\", title = \"No Contact\", warning = False, error = True, blocking = False)\n    halt\nend\n###\n# Moves the robot in the TCP direction specified until a contact point is reached *or*\n# the robot reaches the maximum distance allowed specified by the distance parameter.\n# @param distance number The maximum distance the robot is allowed to travel in the direction specified\n# @param direction array 3D vector determining the move direction of the TCP\n# @param velocity number Velocity of the robot\n# @param acceleration number Acceleration of the robot\n# @param stop_force number Maximum search radius\n###\ndef ur_move_until_force(distance = 0.1, direction = [0, 0, 1], velocity = 0.1, acceleration = 0.2, stop_force = 20):\n    ur_move_until_force_distance = distance\n    ur_move_until_force_direction = direction\n    ur_move_until_force_velocity = velocity\n    ur_move_until_force_acceleration = acceleration\n    \n    thrd = run ur_move_until_force_thread()\n    while - project_tcp_force(direction) < stop_force:\n        sync()\n    end\n    kill thrd\n    actual_pose = get_actual_tcp_pose()\n    stopl(1.0)\n    return actual_pose\nend\ndef ur_path_move(end_q, v, rampdown=False):\n    # Calculate distance to target\n    delta_q = end_q - get_target_joint_positions()\n    # Calculate time to move based on desired velocity\n    t = norm(delta_q) / v\n    if(rampdown):\n        while(norm(get_target_joint_speeds()) > 0.0001):\n            servoj(end_q , 0, 0, max(t, 0.001))\n        end\n    else:\n        servoj(end_q , 0, 0, t, lookahead_time=0.1,  gain=2000)\n    end\nend\n# End of Move Helper\n# Start of Align to Plane\n###\n# Align to plane will touch up a plane by moving the robot into contact with the table or part in several locations to determine its orientation. Afterwards the robot will orient its tool to the plane.\n# @param radius number Radius [m] of the circle within the plane will be touched up\n# @param push_force number How hard to robot pushed against the plane\n# @param n_plane_points number Number of points that the robot uses to compute the plane\n# @param max_distance number Maximum distance that the robot searches\n# @param velocity_slow number Velocity when pressing downwards\n# @param velocity_search number Velocity used when approaching the touch up point\n# @param velocity_move number Velocity used in freespace\n# @param acceleration number Acceleration of the robot\n# @param direction array 3D vector determining the direction of the TCP for touching up the plane\n###\ndef ur_align_to_plane(radius = 0.05, push_force = 20, n_plane_points = 3, max_distance = 0.25, velocity_slow = 0.001, velocity_search = 0.035, velocity_move = 0.10, acceleration = 0.1, direction = [0, 0, 1]):\n    angle = 2 * PI / n_plane_points\n    start_pos = get_target_tcp_pose()\n    retract_distance = -0.015\n    ur_move_tcp_direction(retract_distance, direction, velocity_move, acceleration, 0)\n    sleep(0.25)\n    zero_ftsensor()\n    cnt = 0\n    t_base_target = get_target_tcp_pose()\n    mean_point = [0.0, 0.0, 0.0]\n    A = [[0.0, 0.0, 0.0], [0.0, 0.0, 0.0], [0.0, 0.0, 0.0], [0.0, 0.0, 0.0], [0.0, 0.0, 0.0], [0.0, 0.0, 0.0]]\n    b = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0]\n    while cnt < n_plane_points:\n        new_pos = pose_trans(t_base_target, p[cos(angle * cnt) * radius, sin(angle * cnt) * radius, 0.0, 0.0, 0.0, 0.0])\n        blend_radius = norm(point_dist(get_actual_tcp_pose(), new_pos))/5\n        movel(new_pos, a = acceleration, v = velocity_move, r = blend_radius)\n        ur_move_until_force(max_distance + norm(retract_distance), direction, velocity_search, acceleration, push_force)\n        movement = normalize(direction * -1) * 0.0005\n        target_pose = pose_trans(get_actual_tcp_pose(), p[movement[0], movement[1], movement[2], 0, 0, 0])\n        movel(target_pose)\n        sleep(0.2)\n        ur_move_until_force(max_distance + norm(retract_distance), direction, velocity_slow, acceleration, push_force)\n        sleep(0.2)\n        while (not is_steady()):\n            sync()\n        end\n        poked_point = get_target_tcp_pose()\n        poked_point = pose_trans(inv(t_base_target), poked_point)\n        A[cnt, 0] = poked_point[0]\n        A[cnt, 1] = poked_point[1]\n        A[cnt, 2] = 1.0\n        b[cnt] = poked_point[2]\n        mean_point = mean_point + [poked_point[0], poked_point[1], poked_point[2]]\n        movel(new_pos, a = 0.2, v = velocity_move, r = blend_radius)\n        cnt = cnt + 1\n    end\n    mean_point = mean_point / n_plane_points\n    cnt = 0\n    while cnt < n_plane_points:\n        cntj = 0\n        while cntj < 2:\n            A[cnt, cntj] = A[cnt, cntj] - mean_point[cntj]\n            cntj = cntj + 1\n        end\n        b[cnt] = b[cnt] - mean_point[2]\n        cnt = cnt + 1\n    end\n    x1 = inv(transpose(A) * A) * transpose(A) * b\n    x = normalize([x1[0], x1[1], -1])\n    d = dot(mean_point, x)\n    dval = dot(direction, x)\n    if dval < 0:\n        x = -x\n        dval = -dval\n    end\n    eaa = [0.0, 0.0, 0.0]\n    EPSILON = 1e-10\n    if norm(dval - 1) < EPSILON:\n        # if the projection is close to 1 then the angle between the vectors are almost 0 and we cannot\n        # reliably determine the perpendicular axis.\n        # A good approximation is therefore just to set the EAA equal to 0.\n        eaa = [0.0, 0.0, 0.0]\n    else:\n        axis = cross(direction, x)\n        eaa = normalize(axis) * acos(dval)\n    end\n    t_base_target_aligned = pose_trans(t_base_target, p[0, 0, 0, eaa[0], eaa[1], eaa[2]])\n    movel(t_base_target_aligned, a = 0.2, v = velocity_move)\nend\n# End of Align to Plane\n# Start of Align Z to Nearest Axis\n###\n# Aligns the TCP Z axis to the nearest axis of the given frame\n# @param frame_id string frame_id to lookup frame\n###\ndef ur_align_z_to_nearest_axis(frame_id = \"world\"):\n    ###\n    # Given a reference frame as input this function returns a struct with the nearest\n    # pose which aligns the z-axis of the robot TCP with the z-axis of the given reference frame.\n    # The pose is in the reference of the given frame.\n    # @param frame bool frame\n    # @returns struct pose, distance, referencePose\n    ###\n    def get_aligned_z_pose(frame):\n        actualPose = get_actual_tcp_pose()\n        actualPoseInFrame = pose_trans(pose_inv(frame), actualPose)\n        # Create rotation vector and convert that to RPY representation\n        actualRotInFrame = [actualPoseInFrame[3], actualPoseInFrame[4], actualPoseInFrame[5]]\n        actRPY = rotvec2rpy(actualRotInFrame)\n        # Set RX and RY to 0 and convert back to rotation vector\n        alignedRot = rpy2rotvec([0, 0, actRPY[2]])\n        alignedRotFlipped = rpy2rotvec([PI, 0, actRPY[2]])\n        zUpPose = actualPoseInFrame\n        zUpPose[3] = alignedRot[0]\n        zUpPose[4] = alignedRot[1]\n        zUpPose[5] = alignedRot[2]\n        zUpStruct = struct(pose = zUpPose, distance=pose_dist(actualPoseInFrame, zUpPose), referencePose=frame)\n        zDownPose = actualPoseInFrame\n        zDownPose[3] = alignedRotFlipped[0]\n        zDownPose[4] = alignedRotFlipped[1]\n        zDownPose[5] = alignedRotFlipped[2]\n        zDownStruct = struct(pose = zDownPose, distance=pose_dist(actualPoseInFrame, zDownPose), referencePose=frame)\n        # Return the solution which is closer to the current robot pose\n        if (zDownStruct.distance > zUpStruct.distance):\n            return zUpStruct\n        else:\n            return zDownStruct\n        end\n    end\n    frame = get_pose(frame_id)\n    # Rotate the given frame so that Z can be align to X-Y-Z respectively \n    rotZtoX = rpy2rotvec([0,0.5*PI,0])\n    rotZtoY = rpy2rotvec([0.5*PI,0,0])\n    rotZtoZ = rpy2rotvec([0,0,0])\n    # Get aligned poses for each of the rotated frames\n    structAlignedToX = get_aligned_z_pose(pose_trans(frame, p[0,0,0,rotZtoX[0],rotZtoX[1],rotZtoX[2]]))\n    structAlignedToY = get_aligned_z_pose(pose_trans(frame, p[0,0,0,rotZtoY[0],rotZtoY[1],rotZtoY[2]]))\n    structAlignedToZ = get_aligned_z_pose(pose_trans(frame, p[0,0,0,rotZtoZ[0],rotZtoZ[1],rotZtoZ[2]]))\n    # Find the nearest alignement\n    structAligned = structAlignedToZ\n    if(structAligned.distance > structAlignedToX.distance):\n        structAligned = structAlignedToX    \n    end\n    if(structAligned.distance > structAlignedToY.distance):\n        structAligned = structAlignedToY    \n    end\n    # Move the robot to the aligned pose\n    movel(pose_trans(get_actual_tcp_pose(), p[0,0,0.00001,0,0,0]), v = 0.1)\n    movel(pose_trans(structAligned.referencePose, structAligned.pose ), v = 0.1)\nend\n# End of Align Z to Nearest Axis\n# Start of Center to Object\n###\n# Centers to an object by touching the externals of it. It works well for fixtured or heavy parts.\n# @param push_force number Force the robot uses to determine if a contact has been achieved\n# @param velocity_move number Velocity in freespace\n# @param velocity_search number First move is used then search\n# @param acc_move number Acceleration in freespace\n# @param max_radius_search number Maximum search radius\n# @param num_fingers number Number of fingers that the gripper has\n###\ndef ur_center_to_object(push_force = 10, velocity_move = 0.10, velocity_search = 0.01, acc_move = 0.2, max_radius_search = 0.05, num_fingers = 3):\n    def compute_circle_center(p_list):\n        # Compute the circle center by circular regression\n        # Source: https://math.stackexchange.com/questions/2898295/how-to-quickly-fit-a-circle-by-given-random-arc-points\n        itr = 0\n        x = 0\n        y = 1\n    \n        m1 = [[0,0,0],[0,0,0],[0,0,0]]\n        m2 = [[0,0],[0,0],[0,0]]\n        m3 = [[0],[0],[0]]\n    \n        while(itr < get_list_length(p_list)):\n            p = p_list[itr]\n    \n            if(p_list[itr] == p[0,0,0,0,0,0]):\n                break\n            end\n    \n            m1[0,0] = m1[0,0] + (p[x]*p[x])\n            m1[0,1] = m1[0,1] + (p[x]*p[y])\n            m1[0,2] = m1[0,2] + (p[x])\n    \n            m1[1,0] = m1[1,0] + (p[x]*p[y])\n            m1[1,1] = m1[1,1] + (p[y]*p[y])\n            m1[1,2] = m1[1,2] + (p[y])\n    \n            m1[2,0] = m1[2,0] + (p[x])\n            m1[2,1] = m1[2,1] + (p[y])\n    \n            m2[0,0] = m2[0,0] + (pow(p[x], 3))\n            m2[0,1] = m2[0,1] + (p[x] * pow(p[y], 2))\n    \n            m2[1,0] = m2[1,0] + (pow(p[y], 3))\n            m2[1,1] = m2[1,1] + (pow(p[x], 2) * p[y])\n    \n            m2[2,0] = m2[2,0] + (pow(p[x], 2))\n            m2[2,1] = m2[2,1] + (pow(p[y], 2))\n    \n            itr = itr +1\n        end\n    \n        if(itr < 2):\n            return p[0,0,0,0,0,0]\n        elif(itr > get_list_length(p_list)):\n            return p[0,0,0,0,0,0]\n        end\n    \n        m1[0,0] = 2 * m1[0,0]\n        m1[0,1] = 2 * m1[0,1]\n        m1[1,0] = 2 * m1[1,0]\n        m1[1,1] = 2 * m1[1,1]\n        m1[2,0] = 2 * m1[2,0]\n        m1[2,1] = 2 * m1[2,1]\n        m1[2,2] = itr\n        m3[0,0] = m2[0,0] + m2[0,1]\n        m3[1,0] = m2[1,0] + m2[1,1]\n        m3[2,0] = m2[2,0] + m2[2,1]\n    \n        center = inv(m1) * m3\n    \n        return p[center[0,0], center[1,0],0,0,0,0]\n    end\n    \n    def sanity_checked_move(p_org, p_new, max_diff, acc, vel):\n        if (pose_dist(p_org, p_new) > max_diff):\n            movel(p_org, a = acc, v = vel)\n            popup(\"New pose is too far away from original. Returning to original\", title = \"Failed\", warning = False, error = True, blocking = True)\n        else:\n            movel(p_new, a = acc, v = vel)\n        end\n    end\n    # Start by zeroing the FT sensor\n    sleep(0.25)\n    zero_ftsensor()\n    p_start = get_actual_tcp_pose()\n    p0 = p[0,0,0,0,0,0]\n    DIR_X = [1, 0, 0]\n    if (num_fingers == 2):\n        dir_list = [DIR_X, -DIR_X, DIR_X, -DIR_X]\n        start_offset = [p[0,0,0,0,0,0], p[0,0,0,0,0,0], p[0,0,0,0,0,0.35], p[0,0,0,0,0,0.35]]\n        p_list = [p0, p0, p0, p0]\n    elif (num_fingers == 3):\n        DIR_P1 = DIR_X\n        DIR_P2 = [-1 / 2, sqrt(3.0) / 2.0, 0]\n        DIR_P3 = [-1 / 2, -sqrt(3.0) / 2.0, 0]\n        dir_list = [DIR_P1, DIR_P2, DIR_P3, DIR_P1, DIR_P2, DIR_P3]\n        start_offset = [p[0,0,0,0,0,0], p[0,0,0,0,0,0], p[0,0,0,0,0,0], p[0,0,0,0,0,0.35], p[0,0,0,0,0,0.35], p[0,0,0,0,0,0.35]]\n        p_list = [p0, p0, p0, p0, p0, p0]\n    else:\n        popup(\"Number of fingers not supported\")\n        halt\n    end\n    # Loop through directions\n    it = 0\n    dir_list_size = size(dir_list)\n    dir_list_length = dir_list_size[0]\n    while(it < dir_list_length):\n        # Move to starting position if more than 3 positions is stored then calculate a new starting position\n        if(it < 3):\n            movel(pose_trans(p_start, start_offset[it]), a = acc_move, v = velocity_move)\n        else:\n            p_start_temp = pose_trans(pose_trans(p_start, compute_circle_center(p_list)), start_offset[it])\n            p_start_w_offset = pose_trans(p_start, start_offset[it])\n            sanity_checked_move(p_start_w_offset, p_start_temp, max_radius_search, acc_move, velocity_move)\n        end\n        p_start_temp = get_actual_tcp_pose()\n        # Move into contact and store contact point\n        sleep(0.1)\n        contact_point = ur_move_until_force(distance = max_radius_search, direction = [dir_list[it, 0], dir_list[it, 1], dir_list[it, 2]], velocity = velocity_search, acceleration = acc_move, stop_force = push_force)\n        \n        dir = [dir_list[it, 0], dir_list[it, 1], dir_list[it, 2]]\n        dir = normalize(dir) * 0.05\n        contact_point = pose_trans(contact_point, p[dir[0], dir[1], dir[2], 0, 0, 0])\n        p_list[it] = pose_trans(pose_inv(p_start), contact_point)\n        # Move out of contact\n        movel(p_start_temp, a = acc_move, v = velocity_move)\n        it = it + 1\n    end\n    # Find circle center based on n stored  points\n    center_offset_xy = compute_circle_center(p_list)\n    p_center = pose_trans(p_start, center_offset_xy)\n    \n    # Move the robot to the center if it can\n    sanity_checked_move(p_start, p_center, max_radius_search, acc_move, velocity_move)\nend\n# End of Center to Object\n# Start of Move Into Contact\n###\n# Moves the robot into contact in the TCP direction set\n# @param force number Force that determines when a contact has been achieved\n# @param velocity number Velocity of the robot\n# @param acceleration number Acceleration of the robot\n# @param max_distance number Maximum distance that the robot searches\n# @param velocity_search number velocity_search\n# @param retract number Retract distance after a contact has been found\n# @param move_tcp_dir array TCP direction (3D vector)\n# @param zero_ft_on_start bool Determines if the force-torque sensor should be zeroed on start\n###\ndef ur_move_into_contact(force = 10, velocity = 0.05, acceleration = 0.1, max_distance = 0.25, retract = 0.0, move_tcp_dir = [0, 0, 1], zero_ft_on_start = True):\n    # Zero the force torque sensor\n    if (zero_ft_on_start):\n        sleep(0.25)\n        zero_ftsensor()\n    end\n    # Move the robot\n    ur_move_until_force(max_distance, move_tcp_dir, velocity, acceleration, force)\n    # If a retract distance is set, move the robot back to that position\n    if (retract != 0):\n        # Compute position offset from TCP direction and retract distance\n        position = normalize(move_tcp_dir) * retract\n        movel(pose_trans(get_actual_tcp_pose(), p[position[0], position[1], position[2], 0, 0, 0]))\n    end\nend\n# End of Move Into Contact\n# Start of Retract\n###\n# Retract in the TCP direction set\n# @param distance number Retraction distance\n# @param direction array TCP direction to move in (3D vector)\n# @param acceleration number Acceleration used by the robot\n# @param velocity number Velocity used by the robot\n###\ndef ur_retract(distance = -0.1, direction = [0, 0, 1], acceleration = 0.4, velocity = 0.1):\n    movement = normalize(direction) * distance\n    movel(pose_trans(get_actual_tcp_pose(), p[movement[0], movement[1], movement[2], 0, 0, 0]), a = acceleration, v = velocity)\nend\n# End of Retract",

  },
  nodeIDList: []
};

