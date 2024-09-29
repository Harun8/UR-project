import { JointAngles } from "../../interfaces/waypoint";

export class JointAnglesFactory {
  static createJointAngles(anglesStr: string): JointAngles {
    const angles = anglesStr
      .split(",")
      .map((angle) => parseFloat(angle.trim()));
    return {
      base: angles[0],
      shoulder: angles[1],
      elbow: angles[2],
      wrist1: angles[3],
      wrist2: angles[4],
      wrist3: angles[5],
    };
  }
}
