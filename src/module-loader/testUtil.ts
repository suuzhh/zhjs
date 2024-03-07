export function mockScriptLoad(url: string) {
  const ls = Array.from(document.head.querySelectorAll("script"));

  let ok = false;
  for (const s of ls) {
    if (s.src === url) {
      s.dispatchEvent(new Event("load"));
      ok = true;
      break;
    }
  }

  return ok;
}

export function mockScriptError(url: string) {
  const ls = Array.from(document.head.querySelectorAll("script"));
  let ok = false;
  for (const s of ls) {
    if (s.src === url) {
      s.dispatchEvent(new Event("error"));
      ok = true;
      break;
    }
  }
  return ok;
}

export function hasScript(url: string) {
  const ls = Array.from(document.head.querySelectorAll("script"));
  return ls.some((s) => s.src === url);
}
