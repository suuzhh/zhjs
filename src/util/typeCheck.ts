/**
 * 判断入参是否为字符串类型
 * @param {any} param
 */
function isString (param: any): boolean{
  return typeof param === 'string'
}

/**
 * 判断入参是否为数字类型
 * @param {any} param
 */
function isNumber (param: any) {
  return typeof param === 'number'
}

/**
 * 判断入参是否为数组类型
 * @param {any} param
 */
function isArray (param: any) {
  return Array.isArray(param)
}

/**
 * 判断入参是否为undefined|null|''
 * @param {any} param
 */
function isEmpty (param: any) {
  return param === undefined || param === null
}

function isFunc (params: unknown): params is Function {
  return typeof params === 'function'
}

const noop = () => {}
const UNDEFINED: undefined = (/*#__NOINLINE__*/ noop()) as undefined
function isUndefined (params: unknown): params is undefined {
  return params === UNDEFINED
}

export {
  isEmpty,
  isArray,
  isNumber,
  isString,
  isFunc,
  isUndefined
}
