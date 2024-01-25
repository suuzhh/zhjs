/**
 * 判断入参是否为字符串类型
 * @param {any} param
 */
function isString(param: any): param is string {
  return typeof param === "string";
}

/**
 * 判断入参是否为数字类型
 * @param {any} param
 */
function isNumber(param: any): param is number {
  return typeof param === "number";
}

/**
 * 判断入参是否为数组类型
 * @param {any} param
 */
function isArray(param: any): param is Array<any> {
  return (
    Array.isArray(param) &&
    Object.prototype.toString.call(param) === "[object Array]"
  );
}

/**
 * 判断入参是否为undefined|null|''
 * @param {any} param
 */
function isEmpty(param: any) {
  return param === undefined || param === null;
}

function isFunc(params: unknown): params is Function {
  return typeof params === "function";
}

function isObject(params: unknown): params is Object {
  return Object.prototype.toString.call(params) === "[object Object]";
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

const noop = () => {};
const UNDEFINED: undefined = noop() as undefined;
function isUndefined(params: unknown): params is undefined {
  return params === UNDEFINED;
}

export {
  isEmpty,
  isArray,
  isNumber,
  isString,
  isFunc,
  isUndefined,
  isObject,
  isBoolean,
};
