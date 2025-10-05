import { type CamelCase, camelCase, type SnakeCase, snakeCase } from "scule";

/**
 * Transform object keys recursively using a provided key transformer function
 */
function transformKeys<T>(
  object: T,
  keyTransformer: (key: string) => string
): T {
  if (object === null || typeof object !== "object") {
    return object;
  }

  if (Array.isArray(object)) {
    return object.map((item) => transformKeys(item, keyTransformer)) as T;
  }

  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(object)) {
    const transformedKey = keyTransformer(key);
    result[transformedKey] = transformKeys(value, keyTransformer);
  }

  return result as T;
}

/**
 * Convert object keys to camelCase recursively
 */
export function toCamelCase<T extends Record<string, unknown>>(
  object: T
): KeysToCamelCase<T> {
  return transformKeys(object, camelCase) as KeysToCamelCase<T>;
}

/**
 * Convert object keys to snake_case recursively
 */
export function toSnakeCase<T extends Record<string, unknown>>(
  object: T
): KeysToSnakeCase<T> {
  return transformKeys(object, snakeCase) as KeysToSnakeCase<T>;
}

export type KeysToCamelCase<T> = T extends unknown[]
  ? { [K in keyof T]: KeysToCamelCase<T[K]> }
  : T extends object
  ? {
      [K in keyof T as CamelCase<string & K>]: KeysToCamelCase<T[K]>;
    }
  : T;

export type KeysToSnakeCase<T> = T extends unknown[]
  ? { [K in keyof T]: KeysToSnakeCase<T[K]> }
  : T extends object
  ? {
      [K in keyof T as SnakeCase<string & K>]: KeysToSnakeCase<T[K]>;
    }
  : T;
