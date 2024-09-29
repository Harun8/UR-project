// adapters/MoveAdapter.ts
import { ContributedNode, Parameters } from "../interfaces/waypoint";
import { WaypointFactory } from "../factories/move/WaypointFactory";
import { isArray } from "../utils/ArrayChecker";
import { waypointGUID, waypointParentId } from "../utils/uuid";

export class MoveAdapter {
  static convertMoveToJSON(move: any): ContributedNode | null {
    try {
      const moveTypeText = move.$.motionType;
      const moveType = moveTypeText === "MoveL" ? "moveL" : "moveJ";
      const speedValue = parseFloat(move.$.speed);
      const accelerationValue = parseFloat(move.$.acceleration);

      if (!move.children || !move.children.Waypoint) {
        console.error("No Waypoints found in Move node.");
        return null;
      }

      const waypointsXML = isArray(move.children.Waypoint);
      const waypoints = waypointsXML
        .map(WaypointFactory.createWaypoint)
        .filter((wp): wp is any => wp !== null);

      if (waypoints.length === 0) {
        console.error(
          "No valid waypoints could be created from the Move node."
        );
        return null;
      }

      const parameters: Parameters = {
        moveType,
        variable: {
          entity: {
            name: "Point",
            reference: false,
            type: "$$Variable",
            valueType: "waypoint",
            declaredByID: waypointParentId,
          },
          selectedType: "VALUE",
          value: "Point",
        },
        waypoint: waypoints[0], // Modify if multiple waypoints are needed
        advanced: {
          speed: {
            speed: {
              entity: {
                value: speedValue,
                unit: "m/s",
              },
              selectedType: "VALUE",
              value: speedValue,
            },
            acceleration: {
              entity: {
                value: accelerationValue,
                unit: "m/s^2",
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
          // hardcoded
          value: "Point",
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
          value: `S: ${speedValue * 1000} mm/s`,
        },
        {
          type: "secondary",
          value: `A: ${accelerationValue * 1000} mm/s²`,
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
        guid: waypointParentId, // Use the same guid as desired output
        parentId: waypointGUID, // Parent guid
        programLabel,
      };
    } catch (error) {
      console.error(`Error converting Move to JSON: ${error}`);
      return null;
    }
  }
}
