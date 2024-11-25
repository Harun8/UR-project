// adapters/moveConverter.ts
import { ContributedNode, Parameters } from "../interfaces/waypoint";
import { WaypointFactory } from "../factories/move/WaypointFactory";
import { getUUID } from "../utils/uuid";

export class MoveConverter {
  static async convertMoveToJSON(
    move: any,
    nodeIDList: string[],
    pointName: number,
    waypointGUID: string
  ): Promise<ContributedNode[] | null> {
    try {
      if (!move || !move.$) {
        console.error("Invalid move object, missing '$' property:", move);
        return []; // Skip processing this move
      }
      const moveTypeText = move.$.motionType;
      const moveType =
        moveTypeText.toLowerCase() === "movel" ? "moveL" : "moveJ";
      const speedValue: number = parseFloat(move.$.speed);
      const accelerationValue: number = parseFloat(move.$.acceleration);
      const speedUnit = moveType === "moveL" ? "m/s" : "rad/s";
      const accelerationUnit = moveType === "moveL" ? "m/s²" : "rad/s²";

      if (!move.children || !move.children.Waypoint) {
        console.error("No Waypoints found in Move node.");
        return null;
      }

      // Ensure waypointsXML is an array
      const waypointsXML = Array.isArray(move.children.Waypoint)
        ? move.children.Waypoint
        : [move.children.Waypoint];

      // Call createWaypoints with waypointsXML
      const waypoints = await WaypointFactory.createWaypoints(waypointsXML);

      // Validation
      if (waypoints.length === 0) {
        console.error(
          "No valid waypoints could be created from the Move node."
        );
        return null;
      }

      const contributedNodes: ContributedNode[] = [];

      for (let i = 0; i < waypoints.length; i++) {
        const waypoint = waypoints[i];

        const newUUID = getUUID();
        nodeIDList.push(newUUID);

        const variableName = `Point_${pointName + i}`;

        const parameters: Parameters = {
          moveType,
          variable: {
            entity: {
              name: variableName,
              reference: false,
              type: "$$Variable",
              valueType: "waypoint",
              declaredByID: newUUID,
            },
            selectedType: "VALUE",
            value: variableName,
          },
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
        contributedNodes.push({
          children: [],
          contributedNode: {
            version: "0.0.3",
            type: "ur-move-to",
            allowsChildren: false,
            parameters,
          },
          guid: newUUID,
          parentId:waypointGUID, // Set the waypointGUID to the provided parent node ID
          programLabel,
        });
      }

      return contributedNodes;
    } catch (error) {
      console.error(`Error converting Move to JSON: ${error}`);
      return null;
    }
  }
}
