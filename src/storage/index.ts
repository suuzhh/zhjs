import { isEmpty, isNumber, isString } from "../util/typeCheck";

export type StoragePayload =
  | object
  | string
  | number
  | null
  | Array<object | string | number | boolean | null>;

export interface StorageWrapper {
  /**
   * 获取数据项内容，可以设置默认值
   * @param key - 数据项名称
   * @param fallback - 默认返回值
   * @returns
   */
  get: <T extends StoragePayload>(key: string, fallback?: T) => T;
  /**
   * 设置storage数据
   * @param key - 数据项名称
   * @param value - 数据项内容
   * @returns
   *
   * @warn  null 和 undefined 不会被存储, boolean类型无法存储，请使用字符串或数字的1和0代替
   */
  set: <T extends StoragePayload>(key: string, value: T) => void;
  /** 清理storage,
   * 如果传入key，就清理对应的key
   * 如果未传递key，清空整个storage
   *  */
  unset: (key?: string) => void;
}

/** 尝试解析字符串 */
function tryParse<T extends StoragePayload>(str: string): T | string {
  try {
    return JSON.parse(str);
  } catch (error) {
    console.warn(error);
    return str;
  }
}

type StorageType = keyof Pick<typeof window, "localStorage" | "sessionStorage">;

/**
 * 构建一个Storage对象
 * @param type
 * @returns
 */
export function createStorage(
  type: "local" | "session" = "local",
): StorageWrapper {
  let storageName: StorageType = "localStorage";
  switch (type) {
    case "session":
      storageName = "sessionStorage";
      break;
    case "local":
    default:
      storageName = "localStorage";
  }

  let _storage: Storage | null = null;

  try {
    _storage = window[storageName];
  } catch (error) {
    // 提示错误

    console.warn(`${storageName} cannot be access, state will not be stored`);
  }

  return {
    get<T extends StoragePayload>(key: string, fallback = null as T): T {
      try {
        const data = _storage!.getItem(key);
        if ("string" === typeof data) {
          // 这里有可能返回''空字符串，是否需要处理？
          return tryParse<T>(data) as T;
        }
        return fallback;
      } catch (error) {
        console.warn(
          `${storageName} cannot be access, fallback state is ${fallback}`,
        );
      }

      return fallback;
    },

    set<U = StoragePayload>(key: string, value: U) {
      // 空数据不做处理
      if (isEmpty(value)) {
        return;
      }

      if (isNumber(value) && isNaN(value)) {
        return;
      }

      try {
        const inputData = isString(value) ? value : JSON.stringify(value);

        _storage!.setItem(key, inputData);
      } catch (error) {
        console.warn(`${storageName} cannot be access`);
      }
    },

    unset(key?: string) {
      try {
        key ? _storage!.removeItem(key) : _storage!.clear();
      } catch (error) {
        console.warn(`${storageName} cannot be access`);
      }
    },
  };
}
