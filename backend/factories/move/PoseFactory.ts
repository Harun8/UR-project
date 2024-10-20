import { Pose, PoseValue } from "../../interfaces/waypoint";
import { isArray } from "../../utils/ArrayChecker";
export class PoseFactory {
  static async getPose(jointAnglesStr: any) {
    try {
      // conversion from string to number
      const jointAnglesNumber = jointAnglesStr
        .split(",")
        .map((angle: string) => parseFloat(angle.trim()));

      // const response = await fetch(
      //   "http://localhost:/universal-robots/java-backend/java-backend/rest-api/robot/state/tcp",
      //   {
      //     method: "POST", // Set method to POST
      //     headers: {
      //       "Content-Type": "application/json", // Ensure correct headers are set
      //     },
      //     body: JSON.stringify({
      //       jointPositions: jointAnglesNumber, // Pass your data here
      //     }),
      //   }
      // );

      // if (!response.ok) {
      //   throw new Error(`HTTP error! status: ${response.status}`);
      // }

      // const data = await response.json(); // Extract the JSON body from the response

      // let pose = data;
      let pose;

      // const values = [...pose.position, ...pose.orientation];

      const values = [1, 2, 3, 4, 5, 6];

      const units = ["m", "m", "m", "rad", "rad", "rad"]; // Ensure units correspond to each value

      pose = {
        x: PoseFactory.getPoseStructure(0, values, units),
        y: PoseFactory.getPoseStructure(1, values, units),
        z: PoseFactory.getPoseStructure(2, values, units),
        rx: PoseFactory.getPoseStructure(3, values, units),
        ry: PoseFactory.getPoseStructure(4, values, units),
        rz: PoseFactory.getPoseStructure(5, values, units),
      };

      const defaultPose: Pose = {
        x: { entity: { value: 0, unit: "m" }, selectedType: "VALUE", value: 0 },
        y: { entity: { value: 0, unit: "m" }, selectedType: "VALUE", value: 0 },
        z: { entity: { value: 0, unit: "m" }, selectedType: "VALUE", value: 0 },
        rx: {
          entity: { value: 0, unit: "rad" },
          selectedType: "VALUE",
          value: 0,
        },
        ry: {
          entity: { value: 0, unit: "rad" },
          selectedType: "VALUE",
          value: 0,
        },
        rz: {
          entity: { value: 0, unit: "rad" },
          selectedType: "VALUE",
          value: 0,
        },
      };

      return (pose = pose || defaultPose);

      console.log("pose is", pose);
      return pose;
    } catch (error) {
      console.error("error in pose", error);
    }
  }

  static getPoseStructure(index: any, values: any, units: any) {
    return {
      entity: {
        value: values[index],
        unit: units[index],
      },
      selectedType: "VALUE",
      value: values[index],
    };
  }
}
