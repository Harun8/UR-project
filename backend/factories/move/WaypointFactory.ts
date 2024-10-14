import { Waypoint, JointAngles, Pose } from "../../interfaces/waypoint";
import { isArray } from "../../utils/ArrayChecker";
import { JointAnglesFactory } from "./JointAngelsFactory";
import { PoseFactory } from "./PoseFactory";

export class WaypointFactory {
  static async createWaypoint(waypointData: any): Promise<Waypoint | null> {
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

      // safely handle pose values
      let getDelthaTheta = PoseFactory.getKinematicPose(position.Kinematics);


    // conversion from string to number
    const jointAnglesNumber = jointAnglesStr.split(',').map((angle: string) => parseFloat(angle.trim()));

console.log(jointAnglesNumber);

    const getTCPPose = async (jointAnglesNumber: Number[]) => {
      try {
        const response = await fetch('your_url_here', {
          method: 'POST', // Set method to POST
          headers: {
            'Content-Type': 'application/json', // Ensure correct headers are set
          },
          body: JSON.stringify({
            jointAngles: [jointAnglesNumber], // Pass your data here
          }),
        });
    
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
    
        const data = await response.json(); // Extract the JSON body from the response
        return data; // Return the data (processed result)
      } catch (error) {
        console.error('Error fetching the pose:', error);
      }
    };


  let pose = await getTCPPose(jointAnglesNumber)
    

      // try {
      //   // Await the resolved value of createKinematics
      //   pose = await PoseFactory.createKinematics(getDelthaTheta, qNear);
      // } catch (error) {
      //   console.error("Error getting pose:", error);
      //   throw error; // If needed, rethrow the error to handle it upstream
      // }

      const tcp = {
        name: "Tool_flange",
        // THIS ID NEEDS TO MATCH THE TCP ID'S IN APPLICATION,
        // UNDER TCPS ARRAY AND UNDER DEFAULTCP OBJECT
        id: "708f6642-ea70-6871-7619-14318c664153",
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
