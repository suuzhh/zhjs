import { isFunc, isUndefined } from "../util/typeCheck";
import { Key } from "./types";

const table = new WeakMap<object, number | string>();
let counter = 0;
const stableHash = (arg: any): string => {
  const type = typeof arg;
  const constructor = arg && arg.constructor;
  const isDate = constructor == Date;

  let result: any;
  let index: any;

  if (Object(arg) === arg && !isDate && constructor != RegExp) {
    // Object/function, not null/date/regexp. Use WeakMap to store the id first.
    // If it's already hashed, directly return the result.
    result = table.get(arg);
    if (result) return result;

    // Store the hash first for circular reference detection before entering the
    // recursive `stableHash` calls.
    // For other objects like set and map, we use this id directly as the hash.
    result = ++counter + "~";
    table.set(arg, result);

    if (constructor == Array) {
      // Array.
      result = "@";
      for (index = 0; index < arg.length; index++) {
        result += stableHash(arg[index]) + ",";
      }
      table.set(arg, result);
    }
    if (constructor == Object) {
      // Object, sort keys.
      result = "#";
      const keys = Object.keys(arg).sort();
      while (!isUndefined((index = keys.pop() as string))) {
        if (!isUndefined(arg[index])) {
          result += index + ":" + stableHash(arg[index]) + ",";
        }
      }
      table.set(arg, result);
    }
  } else {
    result = isDate
      ? arg.toJSON()
      : type == "symbol"
        ? arg.toString()
        : type == "string"
          ? JSON.stringify(arg)
          : "" + arg;
  }

  return result;
};

export const serialize = (key: Key): [string, any[], string, string] => {
  if (isFunc(key)) {
    try {
      key = key();
    } catch (err) {
      // dependencies not ready
      key = "";
    }
  }

  const args = [].concat(key as any);

  // If key is not falsy, or not an empty array, hash it.
  key =
    typeof key == "string"
      ? key
      : (Array.isArray(key) ? key.length : key)
        ? stableHash(key)
        : "";

  const errorKey = key ? "$err$" + key : "";
  const isValidatingKey = key ? "$req$" + key : "";

  return [key, args, errorKey, isValidatingKey];
};
