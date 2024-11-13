// ForceFactory.ts
import { MoveConverter } from "../../converter/MoveConverter";
import {
  ProgramInformation,
  URScript,
  ContributedNode,
} from "../../interfaces/waypoint";
import {
  getUUID,
  nil,
  parentId,
  randomId1,
  randomId2,
  randomId3,
  randomId4,
  randomId5,
  waypointGUID,
  waypointParentId,
} from "../../utils/uuid";

interface ForceNode {
  $: {
    type: string;
  };
  feature: {
    $: {
      referencedName: string;
    };
  };
  selection: {
    $: {
      value: string;
    };
  };
  wrench: {
    $: {
      value: string;
    };
  };
  limitsForce?: any;
  limitsMotion?: any;
  children?: any;
}

interface ForceContributedNode {
  type: string;
  version: string;
  allowsChildren: boolean;
  parameters: {
    [key: string]: any;
  };
}

const nodeIDList = [
  nil,
  parentId,
  randomId1,
  randomId2,
  randomId3,
  randomId4,
  randomId5,
  waypointGUID, // should not be removed, since the node id relies on it
];

export class ForceFactory {
  static async convertForceNode(
    forceNode: any,
    moveNodesWithinForceNode: any,
    parentId: string, // Add parentId as a parameter
    nodeIDList: string[] // Add nodeIDList as a parameter

  ): Promise<ContributedNode> {
    const selectionValue = forceNode.selection.$.value; // e.g., "0, 0, 1, 0, 0, 0"
    const selectionArray = selectionValue
      .split(",")
      .map((s: any) => parseInt(s.trim(), 10)); // make it an array, parse to integer

    const wrenchValue = forceNode.wrench.$.value; // e.g., "0.0, 0.0, 5.0, 0.0, 0.0, 0.0"
    const wrenchArray = wrenchValue.split(",").map((s: any) => parseFloat(s.trim()));

    const axisLabels = ["x", "y", "z"];
    const parameters: any = {};

    // Generate a new UUID for the force node
    const forceNodeId = waypointGUID ;
    nodeIDList.push(forceNodeId);

    // Call move converter for move node(s) within force node
    let getMoveNode = await ForceFactory.convertMovesToNodes(
      moveNodesWithinForceNode,
      nodeIDList,
      forceNodeId // Pass forceNodeId as parentId for move nodes
    );

    for (let i = 0; i < 3; i++) {
      const axis = axisLabels[i];
      const enabled = selectionArray[i] === 1;
      const value = wrenchArray[i].toString();

      parameters[axis] = {
        isValid: true,
        model: {
          entity: {
            force: {
              value: 0,
              unit: "N",
            },
            enabled: enabled,
          },
          selectedType: "VALUE",
          value: value,
        },
      };
    }

    // Set default values for zeroSensor and selectedFrame
    parameters["zeroSensor"] = {
      isValid: true,
      model: {
        entity: {
          waiting: {
            value: 0,
            unit: "s",
          },
          enabled: true,
        },
        selectedType: "VALUE",
        value: 0.02, // You can adjust this default value if needed
      },
    };

    parameters["selectedFrame"] = {
      isValid: false,
      model: {
        entity: {
          frameName: "tcp",
          enabled: true,
        },
        selectedType: "VALUE",
        value: "",
      },
    };
    const newUUID = getUUID()
    nodeIDList.push(newUUID);

    const contributedForceNode: any = {
      children: getMoveNode, // Assign move nodes as children
      contributedNode: {
        type: "ur-tool-force",
        version: "0.0.2",
        allowsChildren: true,
        parameters: parameters,
      },
      guid: newUUID,
      parentId: parentId, // Set parentId to the provided parent ID
      programLabel: [
        {
          type: "secondary",
          value: "Force Node Label", // Adjust the label as needed
        },
      ],
    };
    
    // Update parentId for each move node to be the force node's GUID
    getMoveNode.forEach((moveNode: ContributedNode) => {
      moveNode.parentId = forceNodeId;
    });
    
    // Return the force node with move nodes as children
    return contributedForceNode;
  }

  static async convertMovesToNodes(
    moves: any[],
    nodeIDList: string[],
    parentId: string // Pass the parent ID of the force node here
  ): Promise<ContributedNode[]> {
    try {
      let pointName = 0;

      // Convert each move and flatten the resulting arrays of nodes
      const convertedMoves = await Promise.all(
        moves.map(async (move) => {
          // Each call to convertMoveToJSON now returns an array of ContributedNodes
          const result = await MoveConverter.convertMoveToJSON(
            move,
            nodeIDList,
            pointName,
            parentId // Pass parentId here
          );
          pointName += result ? result.length : 0; // Update pointName based on the number of waypoints
          return result || []; // Return an empty array if result is null to keep structure consistent
        })
      );


      // Flatten the array of arrays
      const flattenedMoves = convertedMoves.flat();

      console.log("flaata",flattenedMoves)
      return flattenedMoves;
    } catch (error) {
      console.error("Error converting moves to nodes:", error);
      throw error; // Rethrow the error to be handled upstream if necessary
    }
  }
}
