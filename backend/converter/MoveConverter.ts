// adapters/moveConverter.ts
import { ContributedNode, Parameters } from "../interfaces/waypoint";
import { WaypointFactory } from "../factories/move/WaypointFactory";
import { getUUID } from "../utils/uuid";

export class MoveConverter {
  static async convertMoveToJSON(
    move: any,
    nodeIDList: string[],
    pointName: number,
    parentId: string
  ): Promise<ContributedNode[] | null> {
    try {
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
            translationKey: "program-node-label.move-to.name.default",
            interpolateParams: {
              name: variableName,
            },
          },
          {
            type: "secondary",
            translationKey:
              moveType === "moveL"
                ? "program-node-label.move-to.linear"
                : "program-node-label.move-to.joint",
          },
          {
            type: "secondary",
            translationKey: "program-node-label.single-value",
            interpolateParams: {
              value: waypoint.frame || "",
            },
          },
          {
            type: "secondary",
            translationKey: "program-node-label.single-value",
            interpolateParams: {
              value: waypoint.tcp.name || "",
            },
          },
          {
            type: "secondary",
            translationKey: "program-node-label.move-to.speed",
            interpolateParams: {
              speed:
                moveType === "moveL"
                  ? `${(speedValue * 1000).toFixed(3)} mm/s`
                  : `${speedValue.toFixed(3)} rad/s`,
            },
          },
          {
            type: "secondary",
            translationKey: "program-node-label.move-to.acceleration",
            interpolateParams: {
              acceleration:
                moveType === "moveL"
                  ? `${(accelerationValue * 1000).toFixed(3)} mm/s²`
                  : `${accelerationValue.toFixed(3)} rad/s²`,
            },
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
          parentId, // Set the parentId to the provided parent node ID
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
