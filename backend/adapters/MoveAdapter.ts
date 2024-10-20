// adapters/MoveAdapter.ts
import { ContributedNode, Parameters } from "../interfaces/waypoint";
import { WaypointFactory } from "../factories/move/WaypointFactory";
import { isArray } from "../utils/ArrayChecker";
import { getUUID, waypointGUID, waypointParentId } from "../utils/uuid";

export class MoveAdapter {
  static async convertMoveToJSON(
    move: any,
    nodeIDList: string[],
    pointName: Number
  ): Promise<ContributedNode | null> {
    try {
      console.log("move", move);
      const moveTypeText = move.$.motionType;
      const moveType = moveTypeText === "MoveL" ? "moveL" : "moveJ";
      const speedValue: any = parseFloat(move.$.speed);
      const accelerationValue: any = parseFloat(move.$.acceleration);
      const speedUnit = moveType === "moveL" ? "m/s" : "rad/s";
      const accelerationUnit = moveType === "moveL" ? "m/s^2" : "rad/s^2";

      if (!move.children || !move.children.Waypoint) {
        console.error("No Waypoints found in Move node.");
        return null;
      }

      // validation
      const waypointsXML = isArray(move.children.Waypoint);

      // call factory pattern
      const waypoints = await Promise.all(
        waypointsXML
          .map(WaypointFactory.createWaypoint)
          .filter((wp): wp is any => wp !== null)
      );

      // validation
      if (waypoints.length === 0) {
        console.error(
          "No valid waypoints could be created from the Move node."
        );
        return null;
      }

      const newUUID = getUUID();
      nodeIDList.push(newUUID); // Add new waypointGUID to nodeIDList

      const parameters: Parameters = {
        moveType,
        variable: {
          entity: {
            name: pointName === 0 ? "Point" : `Point_${pointName}`,
            reference: false,
            type: "$$Variable",
            valueType: "waypoint",
            declaredByID: newUUID,
          },
          selectedType: "VALUE",
          value: pointName === 0 ? "Point" : `Point_${pointName}`,
        },
        waypoint: waypoints[0], // Modify if multiple waypoints are needed
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
          // hardcoded
          value: pointName === 0 ? "Point" : `Point_${pointName}`,
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
            moveType === "moveL" ? speedValue.toFixed(3) * 1000 : speedValue
          }  ${speedUnit} `,
        },
        {
          type: "secondary",
          value: `A: ${
            moveType === "moveL"
              ? accelerationValue.toFixed(3) * 1000
              : accelerationValue
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
        guid: newUUID, // Use the same guid as desired output
        parentId: waypointGUID, // Parent guid
        programLabel,
      };
    } catch (error) {
      console.error(`Error converting Move to JSON: ${error}`);
      return null;
    }
  }
}
