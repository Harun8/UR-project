// utils/xmlHelpers.ts
import { isArray } from "./ArrayChecker";

export function findAllMoves(node: any, moves: any[] = []): any[] {
  if (node.Move) {
    const nodeMoves = isArray(node.Move);
    moves.push(...nodeMoves);
  }

  if (node.children) {
    const nodeChildren = isArray(node.children);
    nodeChildren.forEach((child: any) => {
      findAllMoves(child, moves);
    });
  }

  for (const key in node) {
    if (key !== "$" && key !== "children") {
      const childNode = node[key];
      if (typeof childNode === "object") {
        const childArray = isArray(childNode);
        childArray.forEach((c) => findAllMoves(c, moves));
      }
    }
  }

  return moves;
}
