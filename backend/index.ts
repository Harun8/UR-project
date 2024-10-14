// index.ts
import * as fs from "fs";
import * as xml2js from "xml2js";
import {
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
import { isArray } from "./utils/ArrayChecker";
import { MoveAdapter } from "./adapters/MoveAdapter";
import { application } from "./utils/application";
import {
  ProgramInformation,
  URScript,
  ContributedNode,
} from "./interfaces/waypoint";
import { findAllMoves } from "./utils/XMLHelper";

interface programLabel {
  type: string;
  value: string;
}
const programLabel = [
  {
    type: "secondary",
    value: "Looping: Enabled",
  },
];

// Define nodeIDList
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


// Read the XML file
fs.readFile("files/skinkekutterFull.urp", "utf8", (err, data) => {
  if (err) {
    console.error("Error reading the XML file:", err);
    return;
  }

  // Parse XML to JS object
  const parser = new xml2js.Parser({ explicitArray: false });
  parser.parseString(data, (parseErr: any, result: any) => {
    if (parseErr) {
      console.error("Error parsing the XML file:", parseErr);
      return;
    }

    // Extract program information from the root element
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
    const scriptContent = urProgram.Script ? urProgram.Script : "";
    const urscript: URScript = {
      script: scriptContent,
      nodeIDList
    };

    // Find all Move nodes
    const moves = findAllMoves(result);

    if (moves.length === 0) {
      console.error("No Move nodes found in the XML file.");
      return;
    }

    // Function to convert moves to nodes
    async function convertMovesToNodes(moves: any[]): Promise<ContributedNode[]> {
      try {
        const convertedMoves = await Promise.all(
            moves.map((move) => MoveAdapter.convertMoveToJSON(move, nodeIDList))
        );

        // Filter out any null results
        const nonNullMoves: ContributedNode[] = convertedMoves.filter(
            (move): move is ContributedNode => move !== null
        );

        return nonNullMoves;
      } catch (error) {
        console.error("Error converting moves to nodes:", error);
        throw error; // Rethrow the error to be handled upstream if necessary
      }
    }

    // Function to create the final output object
    function createFinalOutput(convertedMoves: ContributedNode[]): any {
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
                children: convertedMoves, // Ensure this is the resolved array
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
                  lockChildren: false,
                },
                {
                  type: "ur-functions",
                  version: "0.0.1",
                  allowsChildren: true,
                  lockChildren: false,
                },
                {
                  type: "ur-before-start",
                  version: "0.0.1",
                  allowsChildren: true,
                },
                {
                  type: "ur-configuration",
                  version: "0.0.1",
                  allowsChildren: true,
                  parameters: {},
                },
                {
                  type: "ur-status",
                  version: "0.0.1",
                  allowsChildren: true,
                  parameters: {},
                },
                {
                  type: "ur-code",
                  version: "0.0.1",
                  allowsChildren: true,
                  lockChildren: false,
                  parameters: {
                    loopForever: false,
                  },
                },
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
        const convertedMoves = await convertMovesToNodes(moves);

        // Create the final output object
        const finalOutput = createFinalOutput(convertedMoves);

        // Write the JSON to a file
        fs.writeFile(
          "output.urpx",
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
        console.log(
          "Conversion completed successfully. Output written to output.urpx"
        );
      } catch (error) {
        console.error("Error during file writing:", error);
      }
    }

    // Invoke the writeFile function with the moves array
    writeFile(moves);
  });
});
