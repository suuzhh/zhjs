/**
 * 通知器
 *
 * 用于通知模块已注册
 *
 * 直接使用html原始做事件的分发
 */
export class Dispatcher {
  private context: HTMLElement;

  private EVENT_NAME = "__dispatcher__";

  constructor(eventName?: string) {
    this.context = document.body;

    if (eventName) {
      this.EVENT_NAME = eventName;
    }
  }

  listen(name: string, callback: Function) {
    // 只监听一次
    const once = (e: Event) => {
      if (e instanceof CustomEvent && e.detail && e.detail === name) {
        callback();
      }
    };

    this.context.addEventListener(this.EVENT_NAME, once, { once: true });
  }

  notify(name: string) {
    this.context.dispatchEvent(
      new CustomEvent(this.EVENT_NAME, { detail: name }),
    );
  }
}
