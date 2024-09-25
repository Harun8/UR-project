import { Guid } from "guid-typescript";
 

export const getUUID = (): string => {
    return Guid.create().toString();
}