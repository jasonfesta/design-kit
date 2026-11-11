#!/usr/bin/env python3
"""clean-up: one artifact in, two copy-ready blocks out.

Turns a built single-file HTML artifact into (1) one injectable, spec-only prompt and (2) one pure React file that
imports nothing but react, with Google-style / React Native safe naming enforced as a hard gate, plus an instant
esbuild preview and a pre-lint report. Stdlib-only Python; esbuild is used only for the preview.

Usage:
  python3 clean_up.py INPUT.html [--name slug] [--out DIR] [--fix] [--no-preview]

Writes DIR/<slug>/:
  App.tsx       export function App() + export default App; imports only 'react'
  prompt.md     tokens, fonts, structure, tables, charts, behavior, breakpoints, acceptance
  preview.html  self-contained bundle of App.tsx for the artifact pane
  report.md     pass/fail checks, rename table, golden-template handoff
"""
import argparse, html, json, os, re, subprocess, sys, textwrap, time
from html.parser import HTMLParser


# ══ Naming: Google style (HTML/CSS + TypeScript), React / React Native safe ══════
# Whole-token expansions (Google style: no cryptic abbreviations). Domain terms like kpi, nav, cta, faq, api stay.
ABBREV = {
    'btn': 'button', 'btns': 'buttons', 'sb': 'sidebar', 'img': 'image', 'imgs': 'images', 'desc': 'description',
    'msg': 'message', 'msgs': 'messages', 'bg': 'background', 'sep': 'separator', 'vsep': 'separator-vertical',
    'hsep': 'separator-horizontal', 'hdr': 'header', 'ftr': 'footer', 'cnt': 'count', 'grad': 'gradient',
    'tpl': 'template', 'lbl': 'label', 'txt': 'text', 'sm': 'small', 'lg': 'large', 'nr': 'number',
    'qty': 'quantity', 'pct': 'percent', 'usr': 'user', 'pwd': 'password', 'cfg': 'config', 'prev': 'previous',
    'tmp': 'temporary', 'ctr': 'center', 'wrap': 'wrapper', 'dd': 'dropdown', 'tt': 'tooltip', 'chev': 'chevron',
}
# Expansions that only apply when the token is the entire name (e.g. a close button class "x", never "xAxis").
ABBREV_WHOLE = {'x': 'close'}
JS_RESERVED = {
    'break', 'case', 'catch', 'class', 'const', 'continue', 'debugger', 'default', 'delete', 'do', 'else', 'enum',
    'export', 'extends', 'false', 'finally', 'for', 'function', 'if', 'import', 'in', 'instanceof', 'new', 'null',
    'return', 'super', 'switch', 'this', 'throw', 'true', 'try', 'typeof', 'var', 'void', 'while', 'with', 'yield',
    'let', 'static', 'implements', 'interface', 'package', 'private', 'protected', 'public', 'await', 'arguments',
    'eval', 'undefined', 'NaN', 'Infinity', 'object', 'string', 'number', 'boolean', 'symbol', 'any', 'never', 'unknown',
}
KEBAB = re.compile(r'^[a-z][a-z0-9]*(-[a-z0-9]+)*$')
LOWER_CAMEL = re.compile(r'^[a-z][a-zA-Z0-9]*$')
UPPER_CAMEL = re.compile(r'^[A-Z][a-zA-Z0-9]*$')
CONST_CASE = re.compile(r'^[A-Z][A-Z0-9]*(_[A-Z0-9]+)*$')
ICON_PREFIXES = ('icon-', 'ico-', 'ic-', 'i-')
# Icon-key aliases for common brand / UI shorthands (applied before ABBREV).
ICON_ALIASES = {'ig': 'instagram', 'yt': 'youtube', 'in': 'linkedin', 'li': 'linkedin', 'fb': 'facebook',
                'tw': 'twitter', 'gh': 'github', 'x': 'close', 'msgs': 'messages', 'cog': 'settings'}


def _split_words(name):
    s = re.sub(r'([a-z0-9])([A-Z])', r'\1 \2', name)
    return [w for w in re.split(r'[^A-Za-z0-9]+', s) if w]


def kebab(name):
    if name in ABBREV_WHOLE:
        return ABBREV_WHOLE[name]
    name = re.sub(r'(^|[_-])-(\d)', r'\1neg-\2', name)  # keep sign: layer_-100 → layer-neg-100
    words = [w.lower() for w in _split_words(name)] or ['item']
    toks = []
    for w in words:
        toks += ABBREV.get(w, w).split('-')
    s = '-'.join(toks)
    return s if s[0].isalpha() else 'n-' + s


def lower_camel(name):
    for p in ICON_PREFIXES:
        if name.lower().startswith(p) and len(name) > len(p):
            name = name[len(p):]
            break
    words = [w.lower() for w in _split_words(name)] or ['item']
    if len(words) == 1 and words[0] in ICON_ALIASES:
        words = ICON_ALIASES[words[0]].split('-')
    words = [p for w in words for p in ABBREV.get(w, w).split('-')]
    s = words[0] + ''.join(w.capitalize() for w in words[1:])
    if not s[0].isalpha():
        s = 'n' + s
    return s + 'Icon' if s in JS_RESERVED else s


def upper_camel(name):
    words = _split_words(name) or ['App']
    s = ''.join(w[:1].upper() + w[1:].lower() for w in words)
    return s if s[0].isalpha() else 'App' + s


def infer_from_css(name, css):
    """Name a cryptic class from its own single CSS declaration, e.g. .r { text-align: right } → text-align-right."""
    rules = re.findall(r'(?<![\w-])\.' + re.escape(name) + r'\s*\{([^}]*)\}', css)
    decls = {d.strip() for r in rules for d in r.split(';') if ':' in d}
    if len(decls) != 1:
        return None
    prop, value = (s.strip() for s in decls.pop().split(':', 1))
    if not re.fullmatch(r'[a-z-]+', prop) or not re.fullmatch(r'[a-z0-9 -]+', value):
        return None
    return kebab(f'{prop} {value}')


def plan(names, kind, css=''):
    """Map each non-conforming name to a conforming one. Collisions get a numeric suffix (reported as warnings).
    Single-character names are renamed from their CSS when unambiguous, otherwise left for the hard gate to fail."""
    taken, mapping, warnings = set(names), {}, []
    for n in sorted(names):
        new = kebab(n)
        if len(new) <= 1:
            inferred = infer_from_css(n, css) if kind == 'class' else None
            if not inferred:
                continue  # unresolved: lint() fails the run
            new = inferred
            warnings.append(f'{kind} "{n}" renamed from its CSS to "{new}"')
        if new == n:
            continue
        if new in taken:
            base, k = new, 2
            while f'{base}-{k}' in taken:
                k += 1
            warnings.append(f'{kind} "{n}" → "{base}" collided; used "{base}-{k}"')
            new = f'{base}-{k}'
        mapping[n] = new
        taken.add(new)
    return mapping, warnings


def icon_keys(ids):
    out, used = {}, set()
    for i in ids:
        k = lower_camel(i)
        base, n = k, 2
        while k in used:
            k, n = f'{base}{n}', n + 1
        out[i] = k
        used.add(k)
    return out


def _sub_tokens(text, cls_map, id_map, selectors_only=False):
    for old, new in sorted(cls_map.items(), key=lambda kv: -len(kv[0])):
        pat = r'(?<![\w-])\.' + re.escape(old) + r'(?![\w-])' if selectors_only else r'(?<![\w#.-])(\.?)' + re.escape(old) + r'(?![\w-])'
        text = re.sub(pat, (lambda m, new=new: '.' + new) if selectors_only else (lambda m, new=new: m.group(1) + new), text)
    for old, new in sorted(id_map.items(), key=lambda kv: -len(kv[0])):
        pat = r'(?<![\w-])#' + re.escape(old) + r'(?![\w-])' if selectors_only else r'(?<![\w.-])(#?)' + re.escape(old) + r'(?![\w-])'
        text = re.sub(pat, (lambda m, new=new: '#' + new) if selectors_only else (lambda m, new=new: m.group(1) + new), text)
    return text


def apply_css(css, cls_map, id_map):
    """Rename .class and #id selectors, leaving url(...) and quoted strings untouched."""
    parts = re.split(r'(url\([^)]*\)|"[^"]*"|\'[^\']*\')', css)
    return ''.join(p if i % 2 else _sub_tokens(p, cls_map, id_map, selectors_only=True) for i, p in enumerate(parts))


def apply_js(js, cls_map, id_map):
    """Rename class/id tokens only inside JS string literals (selectors, getElementById, classList)."""
    def repl(m):
        q, body = m.group(1), m.group(2)
        return q + _sub_tokens(body, cls_map, id_map) + q
    return re.sub(r'(["\'`])((?:\\.|(?!\1).)*)\1', repl, js, flags=re.S)


def apply_tree(root, cls_map, id_map, walk):
    id_ref_attrs = {'for', 'aria-controls', 'aria-labelledby', 'aria-describedby', 'aria-owns', 'aria-activedescendant',
                    'list', 'form', 'headers'}
    for n in walk(root):
        new_attrs = []
        for k, v in n.attrs:
            if v is None:
                new_attrs.append((k, v)); continue
            if k == 'class':
                v = ' '.join(cls_map.get(t, t) for t in v.split())
            elif k == 'id':
                v = id_map.get(v, v)
            elif k in id_ref_attrs:
                v = ' '.join(id_map.get(t, t) for t in v.split())
            elif k in ('href', 'xlink:href') and v.startswith('#'):
                v = '#' + id_map.get(v[1:], v[1:])
            if 'url(#' in v:
                v = re.sub(r'url\(#([^)]+)\)', lambda m: f'url(#{id_map.get(m.group(1), m.group(1))})', v)
            new_attrs.append((k, v))
        n.attrs = new_attrs


def lint(classes, ids, data_attrs, css_vars, icon_key_values, identifiers, slug):
    """Return list of (check, ok, detail) for the pre-lint report."""
    bad = lambda xs, rx: sorted(x for x in xs if not rx.match(x))
    out = []
    b = bad(classes, KEBAB) + ['#' + i for i in bad(ids, KEBAB)]
    out.append(('naming: classes + ids are kebab-case', not b, ', '.join(b[:8]) or f'{len(classes)} classes, {len(ids)} ids'))
    b = sorted(n for n in classes if len(n) <= 1) + sorted('#' + i for i in ids if len(i) <= 1)
    out.append(('naming: no single-character class or id names', not b, (', '.join(b) + ' (give these a meaningful name in the source)') if b else 'clean'))
    b = bad({d[5:] for d in data_attrs}, KEBAB) + bad({v[2:] for v in css_vars}, KEBAB)
    out.append(('naming: data-* + CSS custom properties are kebab-case', not b, ', '.join(b[:8]) or f'{len(data_attrs)} data attrs, {len(css_vars)} vars'))
    b = [k for k in icon_key_values if not LOWER_CAMEL.match(k) or k in JS_RESERVED]
    out.append(('naming: icon keys are lowerCamelCase, not reserved', not b, ', '.join(b[:8]) or f'{len(icon_key_values)} keys'))
    b = [f'{k}:{n}' for k, n in identifiers if not {'component': UPPER_CAMEL, 'constant': CONST_CASE, 'variable': LOWER_CAMEL}[k].match(n)]
    out.append(('naming: components UpperCamel, constants CONSTANT_CASE, vars lowerCamel', not b, ', '.join(b) or ', '.join(n for _, n in identifiers)))
    out.append(('naming: slug kebab-case + React Native project name', bool(KEBAB.match(slug)), f'{slug} → RN "{upper_camel(slug)}"'))
    return out


# ══ Parsing, stripping, JSX emission, prompt ═════════════════════════════════

VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'}
SVG_TAGS = {t.lower(): t for t in ['linearGradient', 'radialGradient', 'clipPath', 'foreignObject', 'textPath', 'feGaussianBlur',
            'feOffset', 'feBlend', 'feColorMatrix', 'feComposite', 'feFlood', 'feMerge', 'feMergeNode', 'feMorphology',
            'feTurbulence', 'feDisplacementMap', 'feDropShadow', 'animateTransform', 'animateMotion']}
SVG_ATTRS = {a.lower(): a for a in ['viewBox', 'preserveAspectRatio', 'gradientUnits', 'gradientTransform', 'patternUnits',
             'patternTransform', 'markerWidth', 'markerHeight', 'refX', 'refY', 'stdDeviation', 'pathLength', 'clipPathUnits',
             'maskUnits', 'filterUnits', 'textLength', 'lengthAdjust', 'baseFrequency', 'numOctaves', 'attributeName',
             'repeatCount', 'keyTimes', 'keySplines', 'calcMode']}
HTML_ATTRS = {'class': 'className', 'for': 'htmlFor', 'tabindex': 'tabIndex', 'readonly': 'readOnly', 'maxlength': 'maxLength',
              'minlength': 'minLength', 'colspan': 'colSpan', 'rowspan': 'rowSpan', 'autocomplete': 'autoComplete',
              'autofocus': 'autoFocus', 'crossorigin': 'crossOrigin', 'srcset': 'srcSet', 'inputmode': 'inputMode',
              'spellcheck': 'spellCheck', 'contenteditable': 'contentEditable', 'enterkeyhint': 'enterKeyHint',
              'cellpadding': 'cellPadding', 'cellspacing': 'cellSpacing', 'novalidate': 'noValidate', 'playsinline': 'playsInline',
              'autoplay': 'autoPlay', 'datetime': 'dateTime', 'xlink:href': 'href', 'accept-charset': 'acceptCharset',
              'http-equiv': 'httpEquiv', 'referrerpolicy': 'referrerPolicy', 'frameborder': 'frameBorder', 'allowfullscreen': 'allowFullScreen'}
BOOL = {'disabled', 'hidden', 'required', 'multiple', 'open', 'novalidate', 'playsinline', 'muted', 'loop', 'autoplay',
        'controls', 'readonly', 'autofocus', 'allowfullscreen', 'defer', 'async', 'inert'}
EVENTS = {'onclick': 'onClick', 'oninput': 'onInput', 'onchange': 'onChange', 'onsubmit': 'onSubmit', 'onkeydown': 'onKeyDown',
          'onkeyup': 'onKeyUp', 'onfocus': 'onFocus', 'onblur': 'onBlur', 'onmouseenter': 'onMouseEnter', 'onmouseleave': 'onMouseLeave',
          'onpointerdown': 'onPointerDown', 'onload': 'onLoad', 'onerror': 'onError'}
DROP_ATTRS = {'data-slot', 'xmlns:xlink', 'xml:space'}
LIB_ATTR = re.compile(r'^data-(recharts|radix|headlessui|reach|rbd|dnd|testid|sentry|vaul|sonner)', re.I)
# Provenance / tooling tokens that must never survive clean-up (plus golden-template forbidden nomenclature).
FORBIDDEN = re.compile(r'21st|shadcn|radix|lucide|recharts|kokonut|spectrumui|react-bits|reactbits|@fluid|'
                       r'efferd\.com|/usr/local|\bwda/|jetski|chatgpt|\bargon\b|nano.?banana|\bREF-\d+', re.I)
# Generic words that can be legitimate page copy (e.g. a product's "MCP server"): reported, never failing.
SOFT = re.compile(r'\bmcp\b|\bregistry\b', re.I)
# Embedded base64 payloads (images, fonts) are skipped by the provenance scan; random bytes can spell anything.
DATA_URI = re.compile(r'data:[\w/+.-]+;base64,[A-Za-z0-9+/=]+')
# Auto-fixable vendor names (same replacements as golden-template's linter), applied with --fix.
FIXES = [(re.compile(r'\bJetski\s+Argon\b'), 'Assistant Default'), (re.compile(r'\bJetski\s+Pro\b'), 'Assistant Pro'),
         (re.compile(r'\bJetski\s+Flash\b'), 'Assistant Fast'), (re.compile(r'\bJetski\b', re.I), 'Chat UI'),
         (re.compile(r'\bChatGPT\b', re.I), 'Chat UI'), (re.compile(r'\bgemini-4-argon\b', re.I), 'warm-moodboard'),
         (re.compile(r'\bArgon\b'), 'Studio'), (re.compile(r'\bREF-\d+\b'), '')]


class Node:
    __slots__ = ('tag', 'attrs', 'children', 'text')

    def __init__(self, tag=None, attrs=None, text=None):
        self.tag, self.attrs, self.children, self.text = tag, attrs or [], [], text


class TreeBuilder(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node('#root')
        self.stack = [self.root]

    def handle_starttag(self, tag, attrs):
        n = Node(SVG_TAGS.get(tag, tag), [(SVG_ATTRS.get(k, k), v) for k, v in attrs])
        self.stack[-1].children.append(n)
        if tag not in VOID:
            self.stack.append(n)

    def handle_startendtag(self, tag, attrs):
        self.stack[-1].children.append(Node(SVG_TAGS.get(tag, tag), [(SVG_ATTRS.get(k, k), v) for k, v in attrs]))

    def handle_endtag(self, tag):
        tag = SVG_TAGS.get(tag, tag)
        for i in range(len(self.stack) - 1, 0, -1):
            if self.stack[i].tag == tag:
                del self.stack[i:]
                return

    def handle_data(self, data):
        self.stack[-1].children.append(Node(text=data))


def find(node, pred, out=None):
    out = [] if out is None else out
    for c in node.children:
        if c.tag and pred(c):
            out.append(c)
        if c.tag:
            find(c, pred, out)
    return out


def attr(n, k, d=None):
    for a, v in n.attrs:
        if a == k:
            return v
    return d


def text_of(n):
    if n.text is not None:
        return n.text
    if n.tag in ('script', 'style'):
        return ''
    return ''.join(text_of(c) for c in n.children)


def squash(s):
    return re.sub(r'\s+', ' ', s or '').strip()


def raw_text(n):
    """Verbatim text content (used for style and script, which text_of skips)."""
    return ''.join(c.text if c.text is not None else raw_text(c) for c in n.children)


# ── Stripping ────────────────────────────────────────────────────────────────
def strip_css(css):
    css = re.sub(r'/\*[\s\S]*?\*/', '', css)
    css = css.replace('recharts-', 'chart-')
    css = re.sub(r'\n\s*\n+', '\n', css)
    return css.strip()


def strip_js(js):
    """Drop // and /* */ comments outside strings, template literals and regex-free code."""
    out, i, n, q = [], 0, len(js), None
    while i < n:
        c = js[i]
        if q:
            out.append(c)
            if c == '\\' and i + 1 < n:
                out.append(js[i + 1]); i += 2; continue
            if c == q:
                q = None
            i += 1; continue
        if c in '"\'`':
            q = c; out.append(c); i += 1; continue
        if js.startswith('//', i) and (i == 0 or js[i - 1] != ':'):
            j = js.find('\n', i); i = n if j < 0 else j; continue
        if js.startswith('/*', i):
            j = js.find('*/', i + 2); i = n if j < 0 else j + 2; continue
        out.append(c); i += 1
    js = ''.join(out).replace('recharts-', 'chart-')
    return re.sub(r'\n\s*\n+', '\n', js).strip('\n')


# ── JSX emission ─────────────────────────────────────────────────────────────
def camel(k):
    return re.sub(r'-([a-z])', lambda m: m.group(1).upper(), k)


def style_obj(s):
    parts, depth, cur = [], 0, ''
    for ch in s:
        if ch == '(':
            depth += 1
        elif ch == ')':
            depth -= 1
        if ch == ';' and depth == 0:
            parts.append(cur); cur = ''
        else:
            cur += ch
    parts.append(cur)
    items = []
    for p in parts:
        if ':' not in p:
            continue
        k, v = p.split(':', 1)
        k, v = k.strip(), v.strip()
        if not k:
            continue
        key = json.dumps(k) if k.startswith('--') else camel(k[1:].capitalize() if k.startswith('-webkit-') or k.startswith('-moz-') else k)
        if k.startswith('-webkit-'):
            key = 'Webkit' + camel(k[len('-webkit-'):])[0].upper() + camel(k[len('-webkit-'):])[1:]
        items.append(f'{key}: {json.dumps(v)}')
    return '{{ ' + ', '.join(items) + ' }}'


def jsx_attrs(n, ctx):
    out = []
    tag = n.tag
    for k, v in n.attrs:
        if k in DROP_ATTRS or k.startswith('xmlns') or LIB_ATTR.match(k):
            continue
        v = '' if v is None else v
        if k in EVENTS:
            out.append(f'{EVENTS[k]}={{(e) => {{ (function (this: HTMLElement) {{ {v} }}).call(e.currentTarget as HTMLElement); }}}}')
            ctx['handlers'] += 1
            continue
        if k == 'style':
            out.append('style=' + style_obj(v)); continue
        v = v.replace('recharts-', 'chart-').replace('recharts', 'chart')
        if tag == 'option' and k == 'selected':
            continue
        if tag in ('input', 'textarea', 'select') and k == 'value':
            k = 'defaultValue'
        elif tag == 'input' and k == 'checked':
            out.append('defaultChecked'); continue
        if k in BOOL and v in ('', k):
            out.append(HTML_ATTRS.get(k, k)); continue
        if k.startswith('data-') or k.startswith('aria-'):
            name = k
        elif k in HTML_ATTRS:
            name = HTML_ATTRS[k]
        elif '-' in k or ':' in k:
            name = camel(k.replace(':', '-'))
        else:
            name = k
        if '"' in v or '\n' in v or '{' in v or '}' in v:
            out.append(f'{name}={{{json.dumps(v)}}}')
        else:
            out.append(f'{name}="{v}"')
    return out


def jsx_text(t, pre=False):
    if pre:
        return '{' + json.dumps(t) + '}'
    if not t.strip():
        return '' if '\n' in t else '{" "}'
    s = re.sub(r'\s+', ' ', t)
    if re.search(r'[{}<>]', s) or s != s.strip():
        lead = '{" "}' if s.startswith(' ') else ''
        trail = '{" "}' if s.endswith(' ') else ''
        core = s.strip()
        core = '{' + json.dumps(core) + '}' if re.search(r'[{}<>]', core) else core
        return lead + core + trail
    return s


def emit(n, ctx, ind=0, pre=False):
    pad = '  ' * ind
    if n.text is not None:
        t = jsx_text(n.text, pre)
        return [pad + t] if t else []
    if n.tag in ('script', 'style', 'link', 'meta', 'title', 'noscript'):
        return []
    if n.tag == 'svg' and ctx['icons'] is not None:
        kids = [c for c in n.children if c.tag or (c.text and c.text.strip())]
        if len(kids) == 1 and kids[0].tag == 'use':
            ref = (attr(kids[0], 'href') or attr(kids[0], 'xlink:href') or '').lstrip('#')
            if ref in ctx['icons']:
                ctx['icon_uses'] += 1
                a = jsx_attrs(Node('svg', [(k, v) for k, v in n.attrs if k != 'viewBox']), ctx)
                return [pad + '<Icon name="' + ctx['icons'][ref] + '"' + ''.join(' ' + x for x in a) + ' />']
    a = jsx_attrs(n, ctx)
    open_tag = '<' + n.tag + ''.join(' ' + x for x in a)
    if n.tag in VOID or (not n.children and n.tag not in ('textarea',)):
        return [pad + open_tag + ' />']
    is_pre = pre or n.tag in ('pre', 'textarea')
    child_lines = []
    for c in n.children:
        child_lines += emit(c, ctx, ind + 1, is_pre)
    if not child_lines:
        return [pad + open_tag + ' />']
    inline = all(not l.strip().startswith('<') for l in child_lines) and sum(len(l.strip()) for l in child_lines) < 90
    if inline:
        return [pad + open_tag + '>' + ''.join(l.strip() for l in child_lines) + '</' + n.tag + '>']
    return [pad + open_tag + '>'] + child_lines + [pad + '</' + n.tag + '>']


# ── Prompt extraction ────────────────────────────────────────────────────────
LANDMARK = {'header', 'nav', 'aside', 'main', 'section', 'article', 'footer', 'form', 'table', 'dialog'}


def words(n):
    """Visible text with a space between separate text nodes (so '38' and '12.4%' don't fuse)."""
    if n.text is not None:
        return squash(n.text)
    if n.tag in ('script', 'style', 'svg'):
        return ''
    return squash(' '.join(w for w in (words(c) for c in n.children) if w))


def label_for(n):
    if n.tag in ('main', 'aside', 'body', 'div'):
        return attr(n, 'aria-label') or ''
    h = find(n, lambda x: x.tag in ('h1', 'h2', 'h3', 'h4') or 'title' in (attr(x, 'class') or '').split('-'))
    if h:
        return words(h[0])[:60]
    return attr(n, 'aria-label') or ''


def outline(n, depth=0, lines=None):
    lines = [] if lines is None else lines
    kids = [c for c in n.children if c.tag]
    i = 0
    while i < len(kids):
        c = kids[i]
        if c.tag in LANDMARK or (c.tag == 'div' and depth == 0 and find(c, lambda x: x.tag in LANDMARK)):
            if c.tag in LANDMARK:
                sig = (c.tag, attr(c, 'class'))
                j = i
                while j < len(kids) and (kids[j].tag, attr(kids[j], 'class')) == sig:
                    j += 1
                group = kids[i:j]
                cls = (attr(c, 'class') or '').split()
                name = c.tag + ('.' + cls[0] if cls else '')
                if len(group) > 1:
                    labels = [label_for(g) or words(g)[:48] for g in group]
                    lines.append('  ' * depth + f'- {name} ×{len(group)}: ' + ' | '.join(l for l in labels if l)[:260])
                else:
                    lab = label_for(c)
                    lines.append('  ' * depth + f'- {name}' + (f' — "{lab}"' if lab else ''))
                    if depth < 3:
                        outline(c, depth + 1, lines)
                i = j
                continue
            outline(c, depth, lines)
        elif depth < 4:
            outline(c, depth, lines)
        i += 1
    return lines


def build_prompt(title, tokens, fonts, breakpoints, body, scripts, css):
    lines = [f'Build "{title}" as a single responsive page.', '']
    if tokens:
        lines.append('TOKENS (CSS custom properties):')
        lines += ['  ' + ' · '.join(tokens[i:i + 4]) for i in range(0, len(tokens), 4)]
    if fonts:
        lines.append('FONTS: ' + ', '.join(fonts))
    lines += ['', 'STRUCTURE:'] + outline(body)
    tables = find(body, lambda x: x.tag == 'table')
    for t in tables[:3]:
        heads = [squash(text_of(h)) for h in find(t, lambda x: x.tag == 'th')]
        rows = [[squash(text_of(td)) for td in find(r, lambda x: x.tag == 'td')] for r in find(t, lambda x: x.tag == 'tr')]
        rows = [r for r in rows if r][:8]
        lines += ['', 'TABLE: ' + ' | '.join(heads)] + ['  ' + ' | '.join(r) for r in rows]
    def is_chart(s):
        if find(s, lambda x: x.tag == 'symbol'):
            return False
        vb = (attr(s, 'viewBox') or '').split()
        wide = len(vb) == 4 and float(vb[2]) >= 160
        return wide or len(find(s, lambda x: x.tag in ('path', 'rect', 'circle', 'line', 'polyline', 'polygon'))) > 12
    charts = [s for s in find(body, lambda x: x.tag == 'svg') if is_chart(s)]
    for s in charts:
        ticks = [squash(text_of(t)) for t in find(s, lambda x: x.tag in ('text', 'tspan')) if not find(t, lambda x: x.tag == 'tspan')]
        ticks = [t for t in ticks if t]
        cls = lambda x: attr(x, 'class') or ''
        kind = ('pie/donut' if find(s, lambda x: 'sector' in cls(x)) else
                'bar' if len(find(s, lambda x: 'rectangle' in cls(x) or x.tag == 'rect')) > 4 else
                'line' if find(s, lambda x: 'line-curve' in cls(x)) else
                'area' if find(s, lambda x: 'area' in cls(x) or 'curve' in cls(x)) else 'chart')
        lines.append(f'CHART ({kind}): labels ' + (', '.join(dict.fromkeys(ticks))[:240] or 'none'))
    beh = behaviors(scripts, body, css)
    if beh:
        lines += ['', 'BEHAVIOR:'] + ['  - ' + b for b in beh]
    if breakpoints:
        lines += ['', 'RESPONSIVE: breakpoints at ' + ', '.join(f'{b}px' for b in breakpoints) + '; zero horizontal overflow at 390px.']
    lines += ['', 'ACCEPTANCE: semantic landmarks; aria-label on every icon-only button; tabular numerals on metrics; '
              'body text ≥ 4.5:1 contrast; match the tokens above exactly.']
    return '\n'.join(lines)


def behaviors(js, body, css):
    b = []
    for q in dict.fromkeys(re.findall(r"matchMedia\('([^']+)'\)", js)):
        b.append(f'media query {q} switches behavior (e.g. drawer vs collapse)')
    for a in dict.fromkeys(re.findall(r"toggleAttribute\((?:[^,()]*\?\s*)?'([\w-]+)'(?:\s*:\s*'([\w-]+)')?", js)):
        b.append('toggles state attribute ' + ' / '.join(x for x in a if x) + ' on the shell')
    if 'aria-expanded' in js:
        b.append('collapsible menu groups via aria-expanded')
    keys = dict.fromkeys(re.findall(r"e\.key(?:\.toLowerCase\(\))?\s*===\s*'([^']+)'", js))
    if keys:
        b.append('keyboard: ' + ', '.join(('⌘/Ctrl+' + k.upper()) if len(k) == 1 and 'metaKey' in js else k for k in keys))
    if 'localStorage' in js:
        b.append('persists state in localStorage')
    if 'setInterval' in js or 'requestAnimationFrame' in js:
        b.append('live/animated updates (interval or rAF)')
    if find(body, lambda x: x.tag == 'select'):
        b.append('select menus: ' + ', '.join(squash(text_of(find(s, lambda x: x.tag == 'option')[0])) for s in find(body, lambda x: x.tag == 'select') if find(s, lambda x: x.tag == 'option')))
    if find(body, lambda x: attr(x, 'onclick')):
        b.append('dismissible elements (inline click handlers)')
    return b


# ══ Preview: bundle App.tsx with esbuild into one standalone HTML file ══════════
def find_node_modules(start):
    cands = [os.environ.get('CLEAN_UP_NODE_MODULES')]
    d = os.path.dirname(os.path.abspath(start))
    while d != os.path.dirname(d):
        cands.append(os.path.join(d, 'node_modules')); d = os.path.dirname(d)
    cands.append(os.path.expanduser('~/wda/node_modules'))
    return next((c for c in cands if c and os.path.exists(os.path.join(c, 'esbuild', 'bin', 'esbuild'))
                 and os.path.isdir(os.path.join(c, 'react-dom'))), None)


def build_preview(tsx_path, out_file, title, input_path):
    nm = find_node_modules(input_path) or find_node_modules(tsx_path)
    if not nm:
        return False, None, 'no node_modules with esbuild + react-dom (set CLEAN_UP_NODE_MODULES)'
    entry = ("import { StrictMode } from 'react';\nimport { createRoot } from 'react-dom/client';\n"
             f"import {{ App }} from {json.dumps(os.path.abspath(tsx_path))};\n"
             "createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);\n")
    t = time.time()
    r = subprocess.run([os.path.join(nm, 'esbuild', 'bin', 'esbuild'), '--bundle', '--minify', '--format=iife',
                        '--jsx=automatic', '--target=es2020', '--loader=tsx', '--log-level=error',
                        '--define:process.env.NODE_ENV="production"'], input=entry, capture_output=True, text=True,
                       cwd=os.path.dirname(os.path.abspath(tsx_path)), env={**os.environ, 'NODE_PATH': nm})
    ms = int((time.time() - t) * 1000)
    if r.returncode != 0:
        return False, ms, (r.stderr or r.stdout).strip()[-600:]
    js = r.stdout.replace('</script', '<\\/script')
    doc = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
           '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
           f'<title>{html.escape(title)}</title>\n</head>\n<body>\n<div id="root"></div>\n<script>{js}</script>\n</body>\n</html>\n')
    open(out_file, 'w').write(doc)
    return True, ms, ''


# ── Main ─────────────────────────────────────────────────────────────────────
def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('input')
    ap.add_argument('--out', default=None)
    ap.add_argument('--name', default=None)
    ap.add_argument('--no-preview', action='store_true')
    ap.add_argument('--fix', action='store_true', help='auto-replace vendor names (ChatGPT, Jetski, Argon, REF-NN) with neutral terms')
    ap.add_argument('--keep', action='append', default=[], help='brand word that is intentional page copy (e.g. --keep ChatGPT for an exact clone); repeatable')
    a = ap.parse_args()
    t0 = time.time()
    src = open(a.input, encoding='utf-8').read()
    slug = kebab(a.name or os.path.basename(os.path.dirname(os.path.abspath(a.input))) or 'page')
    out = os.path.join(a.out or os.path.join(os.path.dirname(os.path.abspath(a.input)), 'clean-up'), slug)
    os.makedirs(out, exist_ok=True)

    tb = TreeBuilder(); tb.feed(src)
    root = tb.root
    html_el = (find(root, lambda x: x.tag == 'html') or [root])[0]
    head = (find(root, lambda x: x.tag == 'head') or [Node('head')])[0]
    body = (find(root, lambda x: x.tag == 'body') or [root])[0]
    title = squash(text_of((find(head, lambda x: x.tag == 'title') or [Node(text='Page')])[0]))
    title = squash(re.sub(r'\((remake|regenerated|study|clone)\)|—\s*(remake|study)\b', '', title, flags=re.I)).strip(' —-') or slug

    css = strip_css('\n'.join(raw_text(s) for s in find(root, lambda x: x.tag == 'style')))
    font_links = [attr(l, 'href') for l in find(head, lambda x: x.tag == 'link' and attr(x, 'rel') == 'stylesheet') if 'fonts.googleapis' in (attr(l, 'href') or '')]
    fonts = list(dict.fromkeys(f.replace('+', ' ') for href in font_links for f in re.findall(r'family=([^:&]+)', href)))
    css = ''.join(f"@import url('{h}');\n" for h in font_links) + css
    root_block = re.search(r':root\s*\{([^}]*)\}', css)
    tokens = [squash(m) for m in re.findall(r'(--[\w-]+\s*:\s*[^;]+)', root_block.group(1))] if root_block else []
    breakpoints = sorted({int(x) for x in re.findall(r'@media[^{]*max-width:\s*(\d+)px', css)}, reverse=True)

    scripts = '\n'.join(strip_js(raw_text(s)) for s in find(body, lambda x: x.tag == 'script' and not attr(x, 'src')))
    sprite_svgs = [s for s in body.children if s.tag == 'svg' and s.children and all((c.tag == 'symbol') or (c.text is not None and not c.text.strip()) for c in s.children)]

    # ── Naming: Google style + React / React Native safe ──
    def walk(n):
        for c in n.children:
            if c.tag:
                yield c
                yield from walk(c)
    symbol_ids = {attr(s, 'id') for sp in sprite_svgs for s in sp.children if s.tag == 'symbol' and attr(s, 'id')}
    for n in walk(root):  # strip library prefixes before naming so the report shows final names
        n.attrs = [(k, v.replace('recharts-', 'chart-').replace('recharts', 'chart') if v and k in ('class', 'id') or (v and 'url(#' in v) else v) for k, v in n.attrs]
    all_classes = {t for n in walk(root) for t in (attr(n, 'class') or '').split()}
    all_classes |= set(re.findall(r'(?<![\w-])\.([A-Za-z_][\w-]*)', re.sub(r'url\([^)]*\)|"[^"]*"|\'[^\']*\'', '', css)))
    all_ids = {attr(n, 'id') for n in walk(root) if attr(n, 'id')} - symbol_ids
    cls_map, w1 = plan(all_classes, 'class', css)
    id_map, w2 = plan(all_ids, 'id')
    naming_warnings = w1 + w2
    apply_tree(root, cls_map, id_map, walk)
    css = apply_css(css, cls_map, id_map)
    scripts = apply_js(scripts, cls_map, id_map)
    ikeys = icon_keys(sorted(symbol_ids))
    icons = {}
    ctx = {'icons': {}, 'icon_uses': 0, 'handlers': 0}
    for sp in sprite_svgs:
        for sym in [c for c in sp.children if c.tag == 'symbol']:
            sid = attr(sym, 'id')
            if sid:
                ctx['icons'][sid] = ikeys[sid]
                inner = []
                for c in sym.children:
                    inner += emit(c, {'icons': None, 'icon_uses': 0, 'handlers': 0}, 0)
                icons[ikeys[sid]] = (attr(sym, 'viewBox', '0 0 24 24'), ''.join(l.strip() for l in inner))

    markup = []
    for c in body.children:
        if c in sprite_svgs:
            continue
        markup += emit(c, ctx, 3)
    html_cls = attr(html_el, 'class') or ''
    body_cls = attr(body, 'class') or ''

    # ── App.tsx ──
    tsx = ["import { useEffect, useRef } from 'react';", "import type { ReactElement, SVGProps } from 'react';", '']
    tsx.append('const STYLES = ' + '`' + css.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${') + '`;')
    tsx.append('')
    if icons:
        tsx.append('const ICONS: Record<string, { viewBox: string; body: ReactElement }> = {')
        for k, (vb, inner) in icons.items():
            tsx.append(f'  {k}: {{ viewBox: {json.dumps(vb)}, body: <>{inner}</> }},')
        tsx.append('};')
        tsx.append('')
        tsx.append('function Icon({ name, ...props }: SVGProps<SVGSVGElement> & { name: string }) {')
        tsx.append('  const icon = ICONS[name];')
        tsx.append('  return icon ? <svg viewBox={icon.viewBox} aria-hidden="true" {...props}>{icon.body}</svg> : null;')
        tsx.append('}')
        tsx.append('')
    tsx.append('export function App() {')
    if scripts or html_cls or body_cls:
        tsx.append('  const didInitRef = useRef(false);')
        tsx.append('  useEffect(() => {')
        tsx.append('    if (didInitRef.current) return;')
        tsx.append('    didInitRef.current = true;')
        if html_cls:
            tsx.append(f'    document.documentElement.classList.add(...{json.dumps([cls_map.get(c, c) for c in html_cls.split()])});')
        if body_cls:
            tsx.append(f'    document.body.classList.add(...{json.dumps([cls_map.get(c, c) for c in body_cls.split()])});')
        for line in textwrap.dedent(scripts).splitlines():
            tsx.append('    ' + line.rstrip() if line.strip() else '')
        tsx.append('  }, []);')
        tsx.append('')
    tsx.append('  return (')
    tsx.append('    <>')
    tsx.append('      <style>{STYLES}</style>')
    tsx += markup
    tsx.append('    </>')
    tsx.append('  );')
    tsx.append('}')
    tsx.append('')
    tsx.append('export default App;')
    tsx_src = '\n'.join(tsx) + '\n'
    prompt = build_prompt(title, tokens, fonts, breakpoints, body, scripts, css)
    fixes = []
    if a.fix:
        for rx, rep_txt in FIXES:
            if any(rx.search(k) for k in a.keep):
                continue
            n = len(rx.findall(tsx_src)) + len(rx.findall(prompt))
            if n:
                fixes.append(f'{rx.pattern} → "{rep_txt}" ×{n}')
                tsx_src, prompt = rx.sub(rep_txt, tsx_src), rx.sub(rep_txt, prompt)
    tsx_path = os.path.join(out, 'App.tsx')
    open(tsx_path, 'w').write(tsx_src)

    prompt_path = os.path.join(out, 'prompt.md')
    open(prompt_path, 'w').write(prompt + '\n')

    # ── Pre-lint ──
    checks = []
    imports = re.findall(r"^import .* from '([^']+)';", tsx_src, re.M)
    checks.append(('imports only react', all(i == 'react' for i in imports), ', '.join(sorted(set(imports)))))
    hits = []
    for name, body_txt in (('App.tsx', tsx_src), ('prompt.md', prompt)):
        for i, line in enumerate(body_txt.splitlines(), 1):
            scan = DATA_URI.sub('data:', line)
            for k in a.keep:
                scan = re.sub(re.escape(k), '', scan, flags=re.I)
            m = FORBIDDEN.search(scan)
            if m:
                hits.append(f'{name}:{i} "{m.group(0)}"')
    fixable = any(rx.search(h) for h in hits for rx, _ in FIXES)
    hint = ' (vendor names: re-run with --fix)' if fixable and not a.fix else ' (rename this copy in the source page)' if hits else ''
    checks.append(('no provenance / tooling tokens', not hits, '; '.join(hits[:8]) + hint if hits else ('clean' + (f' after {len(fixes)} fix(es): ' + '; '.join(fixes) if fixes else ''))))
    soft = sorted({m.group(0) for m in SOFT.finditer(DATA_URI.sub('data:', tsx_src))})
    if soft:
        naming_warnings.append('page copy mentions ' + ', '.join(f'"{s}"' for s in soft) + '; fine if it is real content, remove if it leaked from tooling')
    ext = sorted({u for u in re.findall(r'https?://[^\s\'")]+', tsx_src) if 'fonts.g' not in u and 'www.w3.org' not in u})
    checks.append(('no external runtime URLs (fonts allowed)', not ext, ', '.join(ext[:5]) or 'clean'))
    checks.append(('no <script>/<link> tags in JSX', not re.search(r'<(script|link)\b', '\n'.join(markup)), ''))
    checks.append(('no HTML comments', '<!--' not in tsx_src, ''))
    final_classes = {t for n in walk(body) for t in (attr(n, 'class') or '').split()}
    final_ids = {attr(n, 'id') for n in walk(body) if attr(n, 'id')} - symbol_ids
    data_attrs = {k for n in walk(body) for k, _ in n.attrs if k.startswith('data-') and not LIB_ATTR.match(k) and k not in DROP_ATTRS}
    css_vars = set(re.findall(r'(--[A-Za-z0-9_-]+)\s*:', css))
    idents = [('component', 'App'), ('constant', 'STYLES')] + ([('constant', 'ICONS'), ('component', 'Icon')] if icons else []) + ([('variable', 'didInitRef')] if scripts else [])
    checks += lint(final_classes, final_ids, data_attrs, css_vars, list(icons), idents, slug)

    preview_path = os.path.join(out, 'preview.html')
    build_ms, build_ok, build_err = None, None, ''
    if not a.no_preview:
        build_ok, build_ms, build_err = build_preview(tsx_path, preview_path, title, a.input)
        checks.append(('compiles + bundles (esbuild)', build_ok, f'{build_ms} ms' if build_ok else build_err))

    total_ms = int((time.time() - t0) * 1000)
    passed = all(ok for _, ok, _ in checks)
    rep = [f'# clean-up report — {title}', '', f'**Result:** {"PASS" if passed else "FAIL"} · {total_ms} ms total', '',
           '| Check | Status | Detail |', '| :-- | :-: | :-- |']
    rep += [f'| {n} | {"✅" if ok else "❌"} | {d} |' for n, ok, d in checks]
    rep += ['', '## Output', f'- prompt: `{slug}/prompt.md` ({len(prompt.splitlines())} lines)',
            f'- react: `{slug}/App.tsx` ({len(tsx_src.splitlines())} lines, {len(tsx_src)//1024} KB, {len(icons)} icons, {ctx["icon_uses"]} icon uses, {ctx["handlers"]} inline handlers)',
            f'- preview: `{slug}/preview.html`' if not a.no_preview else '- preview: skipped',
            f'- React Native project name: `{upper_camel(slug)}`',
            '', '## Naming (Google style + React / React Native safe)',
            f'{len(cls_map)} classes, {len(id_map)} ids and {len(ikeys)} icon keys normalized.', '']
    renames = [('class', o, n) for o, n in cls_map.items()] + [('id', o, n) for o, n in id_map.items()] + [('icon', o, n) for o, n in ikeys.items() if o != n]
    if renames:
        rep += ['| Kind | Before | After |', '| :-- | :-- | :-- |'] + [f'| {k} | `{o}` | `{n}` |' for k, o, n in renames]
    rep += [''] + [f'> ⚠️ {w}' for w in naming_warnings]
    rep += ['', '## Golden-template handoff (next stage, not done here)',
            '- [ ] split `App` markup into `src/components/*.tsx` (one per landmark section) with `interface XProps` + `React.FC<XProps>`',
            '- [ ] move arrays/copy into `src/data/<domain>Data.ts`; move `css` into `src/index.css` below `@import "tailwindcss";`',
            '- [ ] port the verbatim DOM behavior in `useEffect` to `useState` handlers (required for strict `tsc`)' if scripts else '- [x] no imperative behavior to port',
            '- [ ] run `lint-golden-template.mjs --fix` and `tsc --noEmit`']
    open(os.path.join(out, 'report.md'), 'w').write('\n'.join(rep) + '\n')
    print(json.dumps({'pass': passed, 'ms': total_ms, 'prompt': prompt_path, 'tsx': tsx_path,
                      'preview': None if a.no_preview else preview_path, 'report': os.path.join(out, 'report.md'),
                      'checks': [{'check': n, 'ok': ok, 'detail': d} for n, ok, d in checks]}, indent=1))
    sys.exit(0 if passed else 1)


if __name__ == '__main__':
    main()
