// index.ts
import * as fs from "fs";
import * as xml2js from "xml2js";
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
} from "./utils/uuid";
import { MoveConverter } from "./converter/MoveConverter";
import { ForceFactory } from "./factories/force/ForceFactory";
import { application } from "./utils/application";
import {
  ProgramInformation,
  URScript,
  ContributedNode,
} from "./interfaces/waypoint";
import { findAllNodes } from "./utils/XMLHelper";

// flyt til interface fiæ
interface programLabel {
  type: string;
  value: string;
}

// flyt
const programLabel = [
  {
    type: "secondary",
    value: "Looping: Enabled",
  },
];

// Id's
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


export const fileReading = async (file: any): Promise<Buffer> => {
  try {
    // Read the file contents using promises
    const data = await fs.promises.readFile(file, "utf8");

    // xml -> json parser
    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(data);

    const urProgram = result.URProgram;

    // Hardcoded program information
    const programInformation: ProgramInformation = {
      name: urProgram.$.name,
      description: "",
      createdDate: 1727260350196,
      lastSavedDate: null,
      lastModifiedDate: 1727260810398,
      programState: "DRAFT",
      functionsBlockShown: false,
    };

    // Define the URScript object
    const scriptContent = urProgram.Script ? urProgram.Script : "";
    const urscript: URScript = {
      script: scriptContent,
      nodeIDList,
    };

    // Assuming 'result' is your parsed JSON object
    const moves = findAllNodes(result);

    let movesOutsideForce: any;
    let movesNodesAndForceNodes: any;

    if (moves.length === 0) {
      console.error("No Move nodes found in the XML file.");
    } else {
      // Separate moves by those under a Force node and those that are not
      const movesWithinForce = moves
        .filter((m) => m.withinForce)
        .map((m) => m.move);
      movesOutsideForce = moves
        .filter((m) => !m.withinForce)
        .map((m) => m.move);
      const forceNodes = moves
        .filter((node) => node.force)
        .map((node) => node.force);

      movesNodesAndForceNodes =
        movesWithinForce.length > 0
          ? await ForceFactory.convertForceNode(
              forceNodes[0],
              movesWithinForce,
              waypointGUID,
              nodeIDList
            )
          : [];
    }

    async function convertMovesToNodes(
      moves: any[]
    ): Promise<ContributedNode[]> {
      try {
        let pointName = 0;
        const convertedMoves = await Promise.all(
          moves.map((move) => {
            const result = MoveConverter.convertMoveToJSON(
              move,
              nodeIDList,
              pointName,
              waypointGUID
            );
            pointName++;
            return result;
          })
        );

        // Filter out any null results
        const nonNullMoves: ContributedNode[] = convertedMoves
          .filter((move): move is ContributedNode[] => move !== null)
          .flat();

        return nonNullMoves;
      } catch (error) {
        console.error("Error converting moves to nodes:", error);
        throw error;
      }
    }

    function createFinalOutput(
      convertedMoves: ContributedNode[],
      convertedForceNode: any
    ): any {
      return {
        application,
        program: {
          id: "5",
          programContent: {
            children: [
              {
                children: [],
                contributedNode: {
                  children: [],
                  type: "ur-modules",
                  version: "0.0.1",
                  allowsChildren: true,
                  lockChildren: false,
                },
                guid: randomId1,
                parentId: parentId,
              },
              {
                children: [],
                contributedNode: {
                  type: "ur-functions",
                  version: "0.0.1",
                  allowsChildren: true,
                  lockChildren: false,
                },
                guid: randomId2,
                parentId: parentId,
              },
              {
                children: [],
                contributedNode: {
                  type: "ur-before-start",
                  version: "0.0.1",
                  allowsChildren: true,
                },
                guid: randomId3,
                parentId: parentId,
              },
              {
                children: [],
                contributedNode: {
                  type: "ur-configuration",
                  version: "0.0.1",
                  allowsChildren: true,
                  parameters: {},
                },
                guid: randomId4,
                parentId: parentId,
              },
              {
                children: [],
                contributedNode: {
                  type: "ur-status",
                  version: "0.0.1",
                  allowsChildren: true,
                  parameters: {},
                },
                guid: randomId5,
                parentId: parentId,
              },
              {
                children: [
                  ...(convertedForceNode ? [convertedForceNode] : []),
                  convertedMoves,
                ],
                contributedNode: {
                  type: "ur-code",
                  version: "0.0.1",
                  allowsChildren: true,
                  lockChildren: false,
                  parameters: {
                    loopForever: false,
                  },
                },
                guid: waypointGUID,
                parentId: parentId,
                programLabel: programLabel,
              },
            ],
            contributedNode: {
              type: "ur-program",
              version: "0.0.1",
              allowsChildren: true,
              lockChildren: true,
              parameters: {
                name: urProgram.$.name,
              },
            },
            guid: parentId,
          },
          programInformation,
          urscript,
        },
      };
    }

    // Function to process and return the buffer
    async function processAndReturnBuffer(moves: any[]): Promise<Buffer> {
      try {
        // Convert moves to nodes
        const convertedMoves =
          movesOutsideForce.length > 0
            ? await convertMovesToNodes(movesOutsideForce)
            : [];

        // Update parentId of move nodes
        const movesParentNodeGUID = getUUID();
        nodeIDList.push(movesParentNodeGUID);

        convertedMoves.forEach((moveNode) => {
          moveNode.parentId = movesParentNodeGUID;
        });

        // Create moves parent node
        const movesParentNode: any = {
          children: convertedMoves,
          contributedNode: {
            type: "ur-moves-wrapper",
            version: "0.0.1",
            allowsChildren: true,
            parameters: {},
          },
          guid: movesParentNodeGUID,
          parentId: waypointGUID,
          programLabel: [
            {
              type: "secondary",
              value: "Moves Outside Force Node",
            },
          ],
        };

        // Adjust the final output
        const finalOutput = createFinalOutput(
          movesParentNode,
          movesNodesAndForceNodes
        );

        const buffer = Buffer.from(JSON.stringify(finalOutput, null, 2));
        console.log("buffer", buffer.toString(), finalOutput);
        return buffer;
      } catch (error) {
        console.error("Error during processing:", error);
        throw error;
      }
    }

    // Invoke the processing function and return the buffer
    const buffer = await processAndReturnBuffer(moves);
    return buffer;
  } catch (error) {
    console.error("Error in fileReading:", error);
    throw error;
  }
};
