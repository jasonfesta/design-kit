#!/usr/bin/env node
/**
 * Automated HTML Bundle & Live React Mount Verifier
 *
 * Ensures that no built HTML page (main moodboard or standalone Golden Template component):
 * 1. Leaks raw JS/CSS outside <script>/<style> tags (e.g., from premature </script> or $& replacement).
 * 2. Has any JavaScript syntax error in inline or external <script> bundles.
 * 3. Renders a blank white page (#root must mount with >0 children and non-trivial rendered HTML).
 */

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

class FakeNode {
  constructor(tag, ns) {
    this.nodeType = tag === '#text' ? 3 : 1;
    this.tagName = tag.toUpperCase();
    this.nodeName = this.tagName;
    this.namespaceURI = ns || 'http://www.w3.org/1999/xhtml';
    this.children = [];
    this.childNodes = this.children;
    this.attributes = {};
    this.style = {
      setProperty: (k, v) => {
        this.style[k] = v;
      },
      removeProperty: (k) => {
        delete this.style[k];
      },
    };
    this.relList = { supports: () => true };
    this.classList = {
      add: () => {},
      remove: () => {},
      toggle: () => {},
      contains: () => false,
    };
    this.ownerDocument = null;
  }
  get options() {
    return this.children;
  }
  get firstChild() {
    return this.children[0] || null;
  }
  get lastChild() {
    return this.children[this.children.length - 1] || null;
  }
  set innerHTML(val) {
    this._innerHTML = String(val);
  }
  get innerHTML() {
    return this._innerHTML || this.children.map((c) => c.outerHTML()).join('');
  }
  setAttribute(k, v) {
    this.attributes[k] = String(v);
  }
  setAttributeNS(_, k, v) {
    this.attributes[k] = String(v);
  }
  removeAttribute(k) {
    delete this.attributes[k];
  }
  replaceChildren(...nodes) {
    this.children = nodes;
  }
  appendChild(c) {
    if (c && typeof c === 'object') {
      c.parentNode = this;
      this.children.push(c);
    }
    return c;
  }
  insertBefore(c, ref) {
    if (c && typeof c === 'object') {
      c.parentNode = this;
      const i = this.children.indexOf(ref);
      if (i === -1) this.children.push(c);
      else this.children.splice(i, 0, c);
    }
    return c;
  }
  removeChild(c) {
    const i = this.children.indexOf(c);
    if (i !== -1) this.children.splice(i, 1);
    return c;
  }
  addEventListener() {}
  removeEventListener() {}
  querySelector() {
    return new FakeNode('div');
  }
  querySelectorAll() {
    return [];
  }
  getElementById() {
    return new FakeNode('div');
  }
  attachShadow() {
    return new FakeNode('shadow-root');
  }
  getBoundingClientRect() {
    return { left: 0, top: 0, width: 1200, height: 800, right: 1200, bottom: 800 };
  }
  getContext() {
    return null;
  }
  outerHTML() {
    if (this.nodeType === 3) return this.nodeValue || this.textContent || '';
    const attrs = Object.entries(this.attributes)
      .map(([k, v]) => `${k}="${v}"`)
      .join(' ');
    const open = attrs ? `<${this.tagName.toLowerCase()} ${attrs}>` : `<${this.tagName.toLowerCase()}>`;
    const inner = this.children.length
      ? this.children.map((c) => c.outerHTML()).join('')
      : this.textContent || this._innerHTML || '';
    return `${open}${inner}</${this.tagName.toLowerCase()}>`;
  }
}

async function verifyHtmlFile(htmlPath) {
  const absPath = path.resolve(htmlPath);
  const baseDir = path.dirname(absPath);
  const html = fs.readFileSync(absPath, 'utf8');

  // 1. Check for leaked raw JS outside <script> and <style>
  const stripped = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '');

  if (
    stripped.includes('react.production.js') ||
    stripped.includes('react-dom.production.js') ||
    stripped.includes('createRoot(') ||
    /<script/i.test(stripped)
  ) {
    throw new Error(`[${absPath}] Leaked raw JavaScript or unclosed <script> tag detected in HTML body!`);
  }

  // 1b. Check for external crossorigin stylesheet links that break x20web UberProxy
  if (/<link\b[^>]*rel\s*=\s*["']stylesheet["'][^>]*\bcrossorigin\b/i.test(stripped)) {
    throw new Error(`[${absPath}] External crossorigin stylesheet detected! Must be inlined for x20web.`);
  }

  // 2. Collect executable JS scripts (inline or external)
  const scriptsToRun = [];
  const scriptTagRegex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = scriptTagRegex.exec(html)) !== null) {
    const attrs = match[1] || '';
    const body = match[2] || '';
    if (/type\s*=\s*["']application\/json["']/i.test(attrs)) {
      JSON.parse(body);
      continue;
    }
    const srcMatch = attrs.match(/src\s*=\s*["']([^"']+)["']/i);
    if (srcMatch) {
      throw new Error(
        `[${absPath}] External <script src="${srcMatch[1]}"> detected! Must be 100% single-file inlined for x20web.`,
      );
    } else if (body.trim()) {
      scriptsToRun.push({ label: `${absPath} (inline script)`, code: body });
    }
  }

  if (scriptsToRun.length === 0) {
    throw new Error(`[${absPath}] No executable <script> tags found!`);
  }

  // 3. Syntax check every script via vm.Script
  for (const s of scriptsToRun) {
    try {
      new vm.Script(s.code, { filename: s.label });
    } catch (err) {
      throw new Error(`[${s.label}] JS SyntaxError: ${err.message}`);
    }
  }

  // 4. Execute in DOM harness and verify React mounts into #root with >0 children
  const rootEl = new FakeNode('div');
  rootEl.setAttribute('id', 'root');

  const reactErrors = [];
  const doc = {
    nodeType: 9,
    title: '',
    oninput: null,
    documentMode: 11,
    documentElement: new FakeNode('html'),
    head: new FakeNode('head'),
    body: new FakeNode('body'),
    createElement: (t) => {
      const n = new FakeNode(t);
      n.ownerDocument = doc;
      return n;
    },
    createElementNS: (ns, t) => {
      const n = new FakeNode(t, ns);
      n.ownerDocument = doc;
      return n;
    },
    createTextNode: (txt) => {
      const n = new FakeNode('#text');
      n.nodeValue = String(txt);
      n.ownerDocument = doc;
      return n;
    },
    querySelector: () => new FakeNode('div'),
    querySelectorAll: () => [],
    getElementById: (id) => {
      if (id === 'root') return rootEl;
      return null;
    },
    addEventListener: () => {},
    removeEventListener: () => {},
  };
  rootEl.ownerDocument = doc;

  const sandbox = {
    console: {
      log: () => {},
      warn: () => {},
      error: () => {},
      info: () => {},
    },
    reportError: (err) => {
      reactErrors.push(err);
    },
    document: doc,
    Element: FakeNode,
    HTMLElement: FakeNode,
    SVGElement: FakeNode,
    HTMLIFrameElement: class {},
    Image: class {
      set src(_) {}
    },
    location: {
      hash: '',
      pathname: '/index.html',
      search: '',
      href: 'http://localhost:5387/index.html',
    },
    history: { replaceState: () => {}, pushState: () => {} },
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    ResizeObserver: class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
    IntersectionObserver: class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
    MutationObserver: class {
      observe() {}
      disconnect() {}
    },
    requestAnimationFrame: (cb) => setTimeout(cb, 0),
    cancelAnimationFrame: (id) => clearTimeout(id),
    queueMicrotask,
    setTimeout,
    clearTimeout,
    setInterval: () => 0,
    clearInterval: () => {},
    performance: { now: () => Date.now() },
    navigator: { userAgent: 'node-verifier', clipboard: { writeText: async () => {} } },
    matchMedia: () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} }),
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
    CustomEvent: class {},
    Event: class {},
    ErrorEvent: class {},
    MessageChannel: undefined,
    setImmediate: undefined,
    Uint8Array,
    Float32Array,
    Uint16Array,
    Uint32Array,
    Int32Array,
    ArrayBuffer,
    DataView,
    Math,
    Date,
    JSON,
    Object,
    Array,
    String,
    Number,
    Boolean,
    RegExp,
    Map,
    Set,
    WeakMap,
    WeakSet,
    Symbol,
    Promise,
    Error,
    TypeError,
    RangeError,
    SyntaxError,
    URIError,
    encodeURIComponent,
    decodeURIComponent,
    parseInt,
    parseFloat,
    isNaN,
    isFinite,
    URLSearchParams,
    URL,
    innerWidth: 1440,
    innerHeight: 900,
    scrollTo: () => {},
  };
  sandbox.window = sandbox;
  sandbox.globalThis = sandbox;
  sandbox.self = sandbox;
  doc.defaultView = sandbox;

  const context = vm.createContext(sandbox);
  for (const s of scriptsToRun) {
    vm.runInContext(s.code, context, { filename: s.label });
  }

  await new Promise((r) => setTimeout(r, 180));

  if (reactErrors.length > 0) {
    throw new Error(`[${absPath}] React runtime error during mount: ${reactErrors[0]?.stack || reactErrors[0]}`);
  }

  const renderedHtml = rootEl.outerHTML();
  if (rootEl.children.length === 0 || renderedHtml.length < 4000) {
    throw new Error(
      `[${absPath}] WHITE OR INCOMPLETE PAGE DETECTED: #root has ${rootEl.children.length} children (HTML length ${renderedHtml.length})`,
    );
  }

  const sectionCount = (renderedHtml.match(/<section\b/gi) || []).length;
  const buttonCount = (renderedHtml.match(/<button\b/gi) || []).length;

  console.log(
    `✅ VERIFIED [${path.relative(process.cwd(), absPath)}] — 0 syntax/leak/CORS errors, mounted #root (${renderedHtml.length.toLocaleString()} chars, ${sectionCount} sections, ${buttonCount} interactive buttons)`,
  );
}

async function main() {
  const targets = process.argv.slice(2);
  if (targets.length === 0) {
    console.error('Usage: node scripts/verify-html-bundle.mjs <html-file> [...]');
    process.exit(1);
  }
  for (const t of targets) {
    await verifyHtmlFile(t);
  }
}

main().catch((err) => {
  console.error(`❌ VERIFICATION FAILED:\n${err.message}`);
  process.exit(1);
});
