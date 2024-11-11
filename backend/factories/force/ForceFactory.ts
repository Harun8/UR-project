import { MoveConverter } from "../../converter/MoveConverter";
import {
    ProgramInformation,
    URScript,
    ContributedNode,
  } from "../../interfaces/waypoint";
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
  } from "../../utils/uuid"

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

      
      static async convertForceNode(forceNode: any, moveNodesWithinForceNode: any): Promise<any> {
        const selectionValue = forceNode.selection.$.value; // e.g., "0, 0, 1, 0, 0, 0"
        const selectionArray = selectionValue.split(',').map((s:any) => parseInt(s.trim(), 10)); // make it an array, parse to integer
      
        const wrenchValue = forceNode.wrench.$.value; // e.g., "0.0, 0.0, 5.0, 0.0, 0.0, 0.0"
        const wrenchArray = wrenchValue.split(',').map((s: any) => parseFloat(s.trim()));
      
        const axisLabels = ['x', 'y', 'z'];
        const parameters: any = {};

        // call waypoint factory for move node(s) within force node

        let getMoveNode = await ForceFactory.convertMovesToNodes(moveNodesWithinForceNode)

      
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
                  unit: 'N',
                },
                enabled: enabled,
              },
              selectedType: 'VALUE',
              value: value,
            },
          };
        }
      
        // Set default values for zeroSensor and selectedFrame
        parameters['zeroSensor'] = {
          isValid: true,
          model: {
            entity: {
              waiting: {
                value: 0,
                unit: 's',
              },
              enabled: true,
            },
            selectedType: 'VALUE',
            value: 0.02, // You can adjust this default value if needed
          },
        };
      
        parameters['selectedFrame'] = {
          isValid: false,
          model: {
            entity: {
              frameName: 'tcp',
              enabled: true,
            },
            selectedType: 'VALUE',
            value: '',
          },
        };
      
        const contributedNode: ForceContributedNode = {
          type: 'ur-tool-force',
          version: '0.0.2',
          allowsChildren: true,
          parameters: parameters,
        };


        return {
          contributedForceNode: getMoveNode[0],
          contributedNode: contributedNode
        }
      }

      static async convertMovesToNodes(
        moves: any[]
      ): Promise<ContributedNode[]> {
        try {
          console
          let pointName = 0;
          const convertedMoves = await Promise.all(
            moves.map((move) => {
              const result = MoveConverter.convertMoveToJSON(
                move,
                nodeIDList,
                pointName
              );
              pointName++;
              return result;
            })
          );

          console.log('convertedMoves', convertedMoves)
        
  
          // Filter out any null results
          const nonNullMoves: any = convertedMoves.filter(
            (move): move is ContributedNode => move !== null
          );
  
          return nonNullMoves;
        } catch (error) {
          console.error("Error converting moves to nodes:", error);
          throw error; // Rethrow the error to be handled upstream if necessary
        }
      }
      
    //   // Assuming 'parsedJson' is your parsed JSON object
    //   const parsedJson = {
    //     // ... (Your parsed JSON data goes here)
    //   };
      
    //   // Extract the Force node from the parsed JSON
    //   const forceNode = parsedJson.URProgram.children.MainProgram.children.Force;
      
    //   // Convert the Force node to the contributedNode format
    //   const convertedNode = convertForceNode(forceNode);
      
    //   // Output the result
    //   console.log(JSON.stringify(convertedNode, null, 2));
      


}