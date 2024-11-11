// factories/move/WaypointFactory.ts
import { Waypoint } from "../../interfaces/waypoint";
import { isArray } from "../../utils/ArrayChecker";
import { JointAnglesFactory } from "./JointAngelsFactory";
import { PoseFactory } from "./PoseFactory";

export class WaypointFactory {
  static async createWaypoints(waypointDataArray: any[]): Promise<Waypoint[]> {
    const waypoints: Waypoint[] = [];

    for (const waypointData of waypointDataArray) {
      try {
        const position = waypointData.position;

        if (!position) {
          console.error(`Waypoint is missing the "position" field.`);
          continue;
        }

        const jointAnglesArray = isArray(position.JointAngles);
        if (jointAnglesArray.length === 0) {
          console.error(`Waypoint has no "JointAngles" defined.`);
          continue;
        }

        const jointAngles = jointAnglesArray[0];
        const jointAnglesStr = jointAngles.$?.angles;
        if (!jointAnglesStr) {
          console.error(`Waypoint has no "angles" attribute in "JointAngles".`);
          continue;
        }

        const qNear = JointAnglesFactory.createJointAngles(jointAnglesStr);

        // Attempt to get pose, but provide a default value if undefined
        const pose = (await PoseFactory.getPose(jointAnglesStr)) || {
          x: { entity: { value: 0, unit: "m" }, selectedType: "VALUE", value: 0 },
          y: { entity: { value: 0, unit: "m" }, selectedType: "VALUE", value: 0 },
          z: { entity: { value: 0, unit: "m" }, selectedType: "VALUE", value: 0 },
          rx: { entity: { value: 0, unit: "rad" }, selectedType: "VALUE", value: 0 },
          ry: { entity: { value: 0, unit: "rad" }, selectedType: "VALUE", value: 0 },
          rz: { entity: { value: 0, unit: "rad" }, selectedType: "VALUE", value: 0 },
        };

        const tcp = {
          name: "Tool_flange",
          // THIS ID NEEDS TO MATCH THE TCP IDs IN APPLICATION,
          // UNDER TCPS ARRAY AND UNDER DEFAULT TCP OBJECT
          id: "708f6642-ea70-6871-7619-14318c664153",
        };

        waypoints.push({
          frame: "base",
          tcp,
          qNear,
          pose,
        });
      } catch (error) {
        console.error(`Error creating waypoint: ${error}`);
      }
    }

    return waypoints;
  }
}
