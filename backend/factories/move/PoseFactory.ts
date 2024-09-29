import { Pose, PoseValue } from "../../interfaces/waypoint";
export class PoseFactory {
  static createPose(poseStr: string): Pose {
    const values = poseStr.split(",").map((val) => parseFloat(val.trim()));
    const units = ["m", "m", "m", "rad", "rad", "rad"];

    const poseValue = (index: number): PoseValue => ({
      entity: {
        value: values[index],
        unit: units[index],
      },
      selectedType: "VALUE",
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
}
