// utils/ensureArray.ts
export function isArray<T>(value: T | T[]): T[] {
  if (Array.isArray(value)) {
    return value;
  } else if (value !== undefined && value !== null) {
    return [value];
  } else {
    return [];
  }
}
