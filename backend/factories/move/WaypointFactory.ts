import { Waypoint, JointAngles, Pose } from "../../interfaces/waypoint";
import { isArray } from "../../utils/ArrayChecker";
import { JointAnglesFactory } from "./JointAngelsFactory";
import { PoseFactory } from "./PoseFactory";

export class WaypointFactory {
  static createWaypoint(waypointData: any): Waypoint | null {
    try {
      // removed name
      // const name = waypointData.$.name;
      const position = waypointData.position;

      if (!position) {
        console.error(`Waypoint "${name}" is missing the "position" field.`);
        return null;
      }

      // Safely handle JointAngles
      const jointAnglesArray = isArray(position.JointAngles);
      if (jointAnglesArray.length === 0) {
        console.error(`Waypoint "${name}" has no "JointAngles" defined.`);
        return null;
      }
      const jointAngles = jointAnglesArray[0];
      const jointAnglesStr = jointAngles.$?.angles;
      if (!jointAnglesStr) {
        console.error(
          `Waypoint "${name}" has no "angles" attribute in "JointAngles".`
        );
        return null;
      }

      // Safely handle TCPOffset
      const tcpOffsetArray = isArray(position.TCPOffset);
      if (tcpOffsetArray.length === 0) {
        console.error(`Waypoint "${name}" has no "TCPOffset" defined.`);
        return null;
      }
      const tcpOffset = tcpOffsetArray[0];
      const poseStr = tcpOffset.$?.pose;
      if (!poseStr) {
        console.error(
          `Waypoint "${name}" has no "pose" attribute in "TCPOffset".`
        );
        return null;
      }

      const qNear = JointAnglesFactory.createJointAngles(jointAnglesStr);
      const pose = PoseFactory.createPose(poseStr);

      const tcp = {
        name: "Tool_flange",
        id: "1855007c-7575-62f5-df63-69046ef9e9a7",
      };

      return {
        // name,
        frame: "base",
        tcp,
        qNear,
        pose,
      };
    } catch (error) {
      console.error(`Error creating waypoint: ${error}`);
      return null;
    }
  }
}
