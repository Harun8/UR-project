// forwardKinematics.js

import { Matrix } from "mathjs";

// import math from "mathjs"
const math = require("mathjs");

function dhTransform(a: any, alpha: any, d: any, theta: any) {
  return math.matrix([
    [
      Math.cos(theta),
      -Math.sin(theta) * Math.cos(alpha),
      Math.sin(theta) * Math.sin(alpha),
      a * Math.cos(theta),
    ],
    [
      Math.sin(theta),
      Math.cos(theta) * Math.cos(alpha),
      -Math.cos(theta) * Math.sin(alpha),
      a * Math.sin(theta),
    ],
    [0, Math.sin(alpha), Math.cos(alpha), d],
    [0, 0, 0, 1],
  ]);
}

export async function forwardKinematics(dhParams: any, jointAngles: any) {
  if (dhParams.length !== jointAngles.length) {
    throw new Error(
      "Number of DH parameters must match number of joint angles."
    );
  }

  // Initialize the transformation matrix as Identity
  let T = math.identity(4);

  for (let i = 0; i < dhParams.length; i++) {
    const { a, alpha, d, deltaTheta } = dhParams[i];
    const theta = deltaTheta + jointAngles[i];
    const A = dhTransform(a, alpha, d, theta);
    T = math.multiply(T, A);
  }

  return T;
}

export async function formatMatrix(matrix: Matrix) {
  const data: number[][] = matrix.toArray() as number[][];

  let matixx = data
    .map((row) => row.map((num) => num.toFixed(6)).join("\t"))
    .join("\n");

  let k = matixx
    .trim() // Remove any leading/trailing whitespace
    .split("\n") // Split the string into rows
    .map(
      (line) =>
        line
          .trim() // Remove leading/trailing whitespace from each line
          .split(/\s+/) // Split each line by one or more whitespace characters (tabs or spaces)
          .map((numStr) => parseFloat(numStr)) // Convert each string number to a float
    );

  const positionVector = {
    x: k[0][3],
    y: k[1][3],
    z: k[2][3],
  };
  console.log("POSITION VECTOR", positionVector);

  const eulerAngles = await extractEulerAngles(k);

  return { eulerAngles, positionVector };
}

function extractEulerAngles(matrix: Matrix | number[][]): {
  roll: number;
  pitch: number;
  yaw: number;
} {
  let data: number[][];

  // If the input is a mathjs matrix, convert it to a number[][] array
  if (typeof (matrix as Matrix).toArray === "function") {
    data = (matrix as Matrix).toArray() as number[][];
  } else {
    // Assume it's already a number[][]
    data = matrix as number[][];
  }

  // Extract rotation matrix (upper-left 3x3)
  const rotationMatrix = [
    [data[0][0], data[0][1], data[0][2]],
    [data[1][0], data[1][1], data[1][2]],
    [data[2][0], data[2][1], data[2][2]],
  ];

  return rotationMatrixToEulerZYX(rotationMatrix);
}

function rotationMatrixToEulerZYX(R: number[][]): {
  roll: number;
  pitch: number;
  yaw: number;
} {
  let sy = Math.sqrt(R[0][0] * R[0][0] + R[1][0] * R[1][0]);

  let singular = sy < 1e-6; // If true, the matrix is singular

  let x, y, z;
  if (!singular) {
    x = Math.atan2(R[2][1], R[2][2]); // Roll
    y = Math.atan2(-R[2][0], sy); // Pitch
    z = Math.atan2(R[1][0], R[0][0]); // Yaw
  } else {
    x = Math.atan2(-R[1][2], R[1][1]); // Roll
    y = Math.atan2(-R[2][0], sy); // Pitch
    z = 0; // Yaw
  }

  console.log(x, y, z);
  return { roll: x, pitch: y, yaw: z };
}
