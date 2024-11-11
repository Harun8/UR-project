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
      const speedValue = parseFloat(move.$.speed);
      const accelerationValue = parseFloat(move.$.acceleration);
      const speedUnit = moveType === "moveL" ? "m/s" : "rad/s";
      const accelerationUnit = moveType === "moveL" ? "m/s²" : "rad/s²";

      if (!move.children || !move.children.Waypoint) {
        console.error("No Waypoints found in Move node.");
        return null;
      }

      // Extract waypoints
      const waypointsXML = isArray(move.children.Waypoint);

      // Create waypoints using the factory
      const waypoints = await Promise.all(
        waypointsXML
          .map((wpXML: any, index: number) =>
            WaypointFactory.createWaypoint(wpXML, index + pointName)
          )
          .filter((wp): wp is any => wp !== null)
      );

      if (waypoints.length === 0) {
        console.error(
          "No valid waypoints could be created from the Move node."
        );
        return null;
      }

      const newUUID = getUUID();
      nodeIDList.push(newUUID);

      // Build variables for each waypoint
      const variables = waypoints.map((wp: any, index: number) => ({
        entity: {
          name: `Point_${pointName + index}`,
          reference: false,
          type: "$$Variable",
          valueType: "waypoint",
          declaredByID: newUUID,
        },
        selectedType: "VALUE",
        value: `Point_${pointName + index}`,
      }));

      const parameters: Parameters = {
        moveType,
        variables,
        waypoint,
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

      return {
        children: [],
        contributedNode: {
          version: "0.0.3",
          type: "ur-move-to",
          allowsChildren: false,
          parameters,
        },
        guid: newUUID,
        parentId: waypointGUID, // Adjust if necessary
        programLabel,
      };
    } catch (error) {
      console.error(`Error converting Move to JSON: ${error}`);
      return null;
    }
  }
}
