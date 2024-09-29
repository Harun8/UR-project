import { Guid } from "guid-typescript";

export const getUUID = (): string => {
  return Guid.create().toString();
};

export const nil = "00000000-0000-0000-0000-000000000000";
export const parentId: string = getUUID();

export const randomId1: string = getUUID();
export const randomId2: string = getUUID();
export const randomId3: string = getUUID();
export const randomId4: string = getUUID();
export const randomId5: string = getUUID();
export const waypointParentId: string = getUUID();
export const waypointGUID: string = getUUID();
