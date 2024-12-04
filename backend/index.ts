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

fs.readFile("files/input/forcecon.urp", "utf8", (err, data) => {
  if (err) {
    console.error("Error reading the XML file:", err);
    return;
  }

  // xml -> json parser
  const parser = new xml2js.Parser({ explicitArray: false });
  parser.parseString(data, async (parseErr: any, result: any) => {
    if (parseErr) {
      console.error("Error parsing the XML file:", parseErr);
      return;
    }

    const urProgram = result.URProgram;

    // hardcoded
    const programInformation: ProgramInformation = {
      name: urProgram.$.name,
      description: "",
      createdDate: 1727260350196,
      lastSavedDate: null,
      lastModifiedDate: 1727260810398,
      programState: "DRAFT",
      functionsBlockShown: false,
    };

    // Define the urscript object
    // urscript should always be empty therefore redundant teneary operator
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

      // console.log(
      //   "Movesoutside",
      //   movesOutsideForce.length,
      //   movesOutsideForce,

      //   "movesWithinForce",
      //   movesWithinForce.length,
      //   movesWithinForce
      // );

      movesNodesAndForceNodes =
        movesWithinForce.length > 0
          ? await ForceFactory.convertForceNode(
              forceNodes[0],
              movesWithinForce,
              waypointGUID,
              nodeIDList
            )
          : [];
          console.log("outputtt", movesWithinForce, movesNodesAndForceNodes)

        }

    async function convertMovesToNodes(
      moves: any[]
    ): Promise<ContributedNode[]> {

      if (moves[0] === undefined) return []
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
        throw error; // Rethrow the error to be handled upstream if necessary
      }
    }
  
  

    function createFinalOutput(
      convertedMoves: any,
      convertedForceNode: any
    ): any {
      console.log("convertedMoves", convertedMoves)
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
             
   
                convertedForceNode,
                                  children: convertedMoves.children, // Add convertedMoves.children explicitly
              
                
                

                //children: convertedMoves, // Ensure this is the resolved array
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
              children: [
                {
                  children: [],
                  type: "ur-modules",
                  version: "0.0.1",
                  allowsChildren: true,
                  lockChildren: false
                },
                {
                  type: "ur-functions",
                  version: "0.0.1",
                  allowsChildren: true,
                  lockChildren: false
                },
                {
                  type: "ur-before-start",
                  version: "0.0.1",
                  allowsChildren: true
                },
                {
                  type: "ur-configuration",
                  version: "0.0.1",
                  allowsChildren: true,
                  parameters: {}
                },
                {
                  type: "ur-status",
                  version: "0.0.1",
                  allowsChildren: true,
                  parameters: {}
                },
                {
                  type: "ur-code",
                  version: "0.0.1",
                  allowsChildren: true,
                  lockChildren: false,
                  parameters: {
                    loopForever: false
                  }
                }
              ],
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

    // Async function to write the final output to a file
    async function writeFile(moves: any[]) {
      try {
        // Convert moves to nodes
        const convertedMoves =
          movesOutsideForce.length > 0
            ? await convertMovesToNodes(movesOutsideForce)
            : [];

        // Update parentId of move nodes
        const movesParentNodeGUID = getUUID();
        nodeIDList.push(movesParentNodeGUID);


        // Create moves parent node
        const movesParentNode: any = {
          children: convertedMoves,
      };
      
      console.log("to final output", movesNodesAndForceNodes, movesParentNode)

        // Adjust the final output
        const finalOutput = createFinalOutput(
          movesParentNode,
          movesNodesAndForceNodes
        );

        // Write the JSON to a file
        fs.writeFile(
          "files/output/testfile.urpx",
          JSON.stringify(finalOutput, null, 2),
          (writeErr) => {
            if (writeErr) {
              console.error("Error writing the JSON file:", writeErr);
              return;
            }
            console.log(
              "Conversion completed successfully. Output written to output.urpx"
            );
          }
        );
      } catch (error) {
        console.error("Error during file writing:", error);
      }
    }

    // Invoke the writeFile function with the moves array
    writeFile(moves);
  });
});
