export interface MoveNode {
  move?: any;
  force?: any;
  withinForce: boolean;
}

export function findAllNodes(node: any, nodes: MoveNode[] = [], withinForce: boolean = false): MoveNode[] {
  // Return immediately if node is not an object
  if (!node || typeof node !== 'object') {
    return nodes;
  }

  // Check if the current node is a Force node and update the withinForce flag
  const isForceNode = node['$']?.['type'] === 'Simple' || !!node.Force;
  const currentWithinForce = withinForce || isForceNode;

  // If the current node is a Force node, add it to the list
  if (isForceNode && node.Force) {
    nodes.push({ force: node.Force, withinForce: false });
  }

  // If the current node is a Move node, add it to the list with the withinForce context
  if (node.Move) {
    const nodeMoves = Array.isArray(node.Move) ? node.Move : [node.Move];
    nodeMoves.forEach((move: any) => {
      nodes.push({ move, withinForce: currentWithinForce });
    });
  }

  // Recursively traverse all properties of the node
  for (const key in node) {
    if (node.hasOwnProperty(key)) {
      const childNode = node[key];
      if (typeof childNode === 'object' && childNode !== null) {
        const childNodes = Array.isArray(childNode) ? childNode : [childNode];
        childNodes.forEach((child: any) => {
          findAllNodes(child, nodes, currentWithinForce);
        });
      }
    }
  }

  return nodes;
}
