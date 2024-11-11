// adapters/moveConverter.ts
import { ContributedNode, Parameters } from "../interfaces/waypoint";
import { WaypointFactory } from "../factories/move/WaypointFactory";
import { isArray } from "../utils/ArrayChecker";
import { getUUID, waypointGUID } from "../utils/uuid";

export class MoveConverter {
  static async convertMoveToJSON(
    move: any,
    nodeIDList: string[],
    pointName: number
  ): Promise<ContributedNode | null> {
    try {
      const moveTypeText = move.$.motionType;
      const moveType =
        moveTypeText.toLowerCase() === "movel" ? "moveL" : "moveJ";
      const speedValue: any = parseFloat(move.$.speed);
      const accelerationValue: any = parseFloat(move.$.acceleration);
      const speedUnit = moveType === "moveL" ? "m/s" : "rad/s";
      const accelerationUnit = moveType === "moveL" ? "m/s^2" : "rad/s^2";

      if (!move.children || !move.children.Waypoint) {
        console.error("No Waypoints found in Move node.");
        return null;
      }

      // Ensure waypointsXML is an array
      const waypointsXML = Array.isArray(move.children.Waypoint)
        ? move.children.Waypoint
        : [move.children.Waypoint];
      console.log("waypointsXML", waypointsXML);

      // Call createWaypoints with waypointsXML
      const waypoints = await WaypointFactory.createWaypoints(waypointsXML);

      // Validation
      if (waypoints.length === 0) {
        console.error(
          "No valid waypoints could be created from the Move node."
        );
        return null;
      }

      const newUUID = getUUID();
      nodeIDList.push(newUUID); // Add new UUID to nodeIDList

      // Build variables for each waypoint
      const variables = waypoints.map((wp, index) => ({
        entity: {
          name:
            pointName === 0
              ? `Point_${index}`
              : `Point_${pointName + index}`,
          reference: false,
          type: "$$Variable",
          valueType: "waypoint",
          declaredByID: newUUID,
        },
        selectedType: "VALUE",
        value:
          pointName === 0 ? `Point_${index}` : `Point_${pointName + index}`,
      }));

      const parameters: Parameters = {
        moveType,
        variables,
        waypoints,
        advanced: {
          speed: {
            speed: {
              entity: {
                value: speedValue,
                unit: speedUnit,
              },
              selectedType: "VALUE",
              value: speedValue,
            },
            acceleration: {
              entity: {
                value: accelerationValue,
                unit: accelerationUnit,
              },
              selectedType: "VALUE",
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
          type: "primary",
          value: `Move (${waypoints.length} waypoints)`,
        },
        {
          type: "secondary",
          value: waypoints[0].frame || "",
        },
        {
          type: "secondary",
          value: waypoints[0].tcp.name || "",
        },
        {
          type: "secondary",
          value: moveType === "moveL" ? "Linear" : "Joint",
        },
        {
          type: "secondary",
          value: `S: ${
            moveType === "moveL"
              ? (speedValue * 1000).toFixed(3)
              : speedValue.toFixed(3)
          } ${speedUnit}`,
        },
        {
          type: "secondary",
          value: `A: ${
            moveType === "moveL"
              ? (accelerationValue * 1000).toFixed(3)
              : accelerationValue.toFixed(3)
          } ${accelerationUnit}`,
        },
      ];

      console.log("parameters", parameters);

      return {
        children: [],
        contributedNode: {
          version: "0.0.3",
          type: "ur-move-to",
          allowsChildren: false,
          parameters,
        },
        guid: newUUID,
        parentId: waypointGUID,
        programLabel,
      };
    } catch (error) {
      console.error(`Error converting Move to JSON: ${error}`);
      return null;
    }
  }
}
