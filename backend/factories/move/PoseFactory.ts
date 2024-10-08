import { Pose, PoseValue } from "../../interfaces/waypoint";
import { isArray } from "../../utils/ArrayChecker";
import { formatMatrix, forwardKinematics } from "../../utils/Kinematics";
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

  static getKinematicPose(kinematicsData: any) {
    try {
      if (!kinematicsData) {
        console.error("Kinematics data is missing.");
        return null;
      }

      // Handle the case where the parameters are arrays containing objects
      const deltaThetaArray = isArray(kinematicsData.deltaTheta);
      const aArray = isArray(kinematicsData.a);
      const dArray = isArray(kinematicsData.d);
      const alphaArray = isArray(kinematicsData.alpha);

      if (
        deltaThetaArray.length === 0 ||
        aArray.length === 0 ||
        dArray.length === 0 ||
        alphaArray.length === 0
      ) {
        console.error(
          "One or more DH parameter arrays are missing in the Kinematics data."
        );
        return null;
      }

      // Extract the value strings from the first element of each array
      const deltaThetaStr = deltaThetaArray[0].$?.value;
      const aStr = aArray[0].$?.value;
      const dStr = dArray[0].$?.value;
      const alphaStr = alphaArray[0].$?.value;

      if (!deltaThetaStr || !aStr || !dStr || !alphaStr) {
        console.error(
          "One or more DH parameter values are missing in the Kinematics data."
        );
        return null;
      }

      // Split the strings into arrays of numbers
      const deltaThetaValues = deltaThetaStr
        .split(",")
        .map((s: string) => parseFloat(s.trim()));
      const aValues = aStr.split(",").map((s: string) => parseFloat(s.trim()));
      const dValues = dStr.split(",").map((s: string) => parseFloat(s.trim()));
      const alphaValues = alphaStr
        .split(",")
        .map((s: string) => parseFloat(s.trim()));

      const length = deltaThetaValues.length;
      if (
        aValues.length !== length ||
        dValues.length !== length ||
        alphaValues.length !== length
      ) {
        console.error("DH parameter arrays have inconsistent lengths.");
        return null;
      }

      const dhParams = [];
      for (let i = 0; i < length; i++) {
        dhParams.push({
          a: aValues[i],
          alpha: alphaValues[i],
          d: dValues[i],
          deltaTheta: deltaThetaValues[i],
        });
      }

      return dhParams;
    } catch (error) {
      console.error(
        `Error parsing DH parameters from Kinematics data: ${error}`
      );
      return null;
    }
  }

  static async createKinematics(
    dhParams: any,
    jointAngles: any
  ): Promise<Pose> {
    let jointAnglesArr = Object.values(jointAngles);

    let gg = await forwardKinematics(dhParams, jointAnglesArr);
    let { eulerAngles, positionVector } = await formatMatrix(gg);

    console.log(eulerAngles, positionVector);

    // Convert objects to arrays
    const eulerAnglesArr = Object.values(eulerAngles);
    const positionVectorArr = Object.values(positionVector);

    // Combine the arrays for position and Euler angles
    const values = [...positionVectorArr, ...eulerAnglesArr]; // Merge positionVector and eulerAngles
    const units = ["m", "m", "m", "rad", "rad", "rad"]; // Ensure units correspond to each value

    // Function to map index to PoseValue
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
