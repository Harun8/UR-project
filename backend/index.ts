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
const programLabelAfterUR_code = {
  programLabel: [
    {
      type: "secondary",
      value: "Looping: Enabled",
    },
  ],
};

// Read the XML file
fs.readFile("files/skinkekutter2.urp", "utf8", (err, data) => {
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

    const programInformation: ProgramInformation = {
      name: urProgram.$.name,
      installation: urProgram.$.installation,
      directory: urProgram.$.directory,
      createdIn: urProgram.$.createdIn,
      lastSavedIn: urProgram.$.lastSavedIn,
      robotSerialNumber: urProgram.$.robotSerialNumber,
    };

    // Define the urscript object
    const scriptContent = urProgram.Script ? urProgram.Script : "";
    const urscript: URScript = {
      script: scriptContent,
      nodeIDList: [
        nil,
        parentId,
        randomId1,
        randomId2,
        randomId3,
        randomId4,
        randomId5,
        waypointParentId,
        waypointGUID,
      ],
    };

    // Find all Move nodes
    const moves = findAllMoves(result);

    if (moves.length === 0) {
      console.error("No Move nodes found in the XML file.");
      return;
    }

    const convertedMoves = moves
      .map(MoveAdapter.convertMoveToJSON)
      .filter((move) => move !== null) as ContributedNode[];

    // Create the final JSON output
    const finalOutput = {
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
              children: convertedMoves,
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
            },

            programLabelAfterUR_code,
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
              name: "Default program",
            },
          },
          guid: parentId,
        },
        programInformation,
        urscript,
      },
    };

    // Output the JSON
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
  });
});
