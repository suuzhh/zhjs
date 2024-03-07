import { retry } from "../retry";
import { Dispatcher } from "./Dispatcher";

function createScriptNode(url: string, attrs?: Record<string, string>) {
  const script = document.createElement("script");
  script.src = url;
  script.async = true;
  script;
  if (attrs) for (const attr in attrs) script.setAttribute(attr, attrs[attr]);
  return script;
}

/**
 * js 模块定义
 */
export interface Module {
  readonly _url: string;
  /** 模块名称 */
  name: string;
  deps: string[];
  /** 资源url地址 */
  url: string;
  onLoad: (callback: Function) => void;
  isDefine: boolean;
  /** 是否加载完毕 */
  isLoaded: boolean;
}

export function createModule(name: string, url: string, deps: string[] = []) {
  const isDefine = url ? true : false;
  const dispatcher = new Dispatcher(`__module_loaded__${name}`);

  const onLoad = (cb: Function) => {
    dispatcher.listen(name, cb);
  };

  let node: HTMLScriptElement | undefined;
  // 重试节点的引用，有可能为空 目前处理加载失败的策略是无限重试
  let retryNode: HTMLScriptElement;

  const mountEvents = (node: HTMLScriptElement) => {
    node.addEventListener("load", _handleLoadEvent, {
      capture: false,
      once: true,
    });
    node.addEventListener("error", _handleErrorEvent, {
      capture: false,
      once: true,
    });
  };

  const _handleLoadEvent = () => {
    mod.isLoaded = true;
    dispatcher.notify(name);
    node!.remove();
    node = undefined;
  };

  const _handleErrorEvent = () => {
    // 错误发生时记录一下需要重试脚本的url
    const retryUrl = mod._url;

    retry((attempt) => {
      // 重试时 url发生了变化 需要终止当前重试
      // 比对请求url, 如果发生了变化 终止重试
      if (mod._url !== retryUrl) {
        return Promise.resolve();
      }

      // 重试时不能移除原来的节点 要创建新的节点
      // 移除旧节点
      if (retryNode) {
        retryNode.remove();
      }

      // TODO: 新的事件需不需要再挂一次
      retryNode = createScriptNode(retryUrl, {
        async: "true",
        // 记录当前是第几次重试生成的
        "data-retry": attempt + "",
      });
      return new Promise((resolve, reject) => {
        // 如果在这过程中url发生了变化 会收到外部触发的load事件
        // 制造加载成功的效果 让重试结束
        retryNode.addEventListener("load", () => resolve());
        retryNode.addEventListener("error", () => reject());
        document.head.appendChild(retryNode);
      });
    }).then(() => {
      if (mod._url === retryUrl) {
        // 重试成功
        mod.isLoaded = true;
        dispatcher.notify(name);
      } else {
        console.warn(`retry abort, the url is ${retryUrl}`);
      }
      // 重试结束 移除节点
      retryNode?.remove();
    });
  };

  /** 取消加载 */
  const cancel = () => {
    mod.isLoaded = false;
    if (node) {
      node.removeEventListener("load", _handleLoadEvent);
      node.removeEventListener("error", _handleErrorEvent);

      node.remove();
    }

    if (retryNode) {
      // 立即触发load事件 让重试结束
      retryNode.dispatchEvent(new Event("load"));
    }
  };

  const mod = {
    /** 模块名称 */
    name,
    deps,
    _url: "",
    /** 资源url地址 */
    url: "",
    /** 获取加载结果 */
    onLoad,
    isDefine,
    isLoaded: false,
  };

  const proxyMod = Object.defineProperty<Module>(mod, "url", {
    set: (url: string) => {
      if (url !== mod._url) {
        mod._url = url;
        // 先移除 再安装监听
        cancel();
        node = undefined;

        // 新的url不为空 才需要挂新的事件
        if (url) {
          node = createScriptNode(url, { async: "true" });
          mountEvents(node);
          document.head.appendChild(node);
        }
      }
    },
    get: () => mod._url,
  });

  proxyMod.url = url;

  return proxyMod;
}
