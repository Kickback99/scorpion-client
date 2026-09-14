// 全部动态导入：markdown-config 被 AppSidebar（首页）静态引用，
// 若在顶层 import 编辑器组件会把编辑器 chunk 拖回首屏，这里全部改为按需加载

// 裸文本里需要补 class 的 token：
//   标识符        字母/下划线/美元符开头，后接字母数字下划线美元符
//   运算符/括号   => || && = { } [ ] ( ) —— hljs 的 JS 语法完全不给它们发 class
// 注意 `=>` 必须排在 `=` 前面，否则箭头会被切成 `=` 和 `>` 两个 token。
const BARE_TOKEN = /[A-Za-z_$][\w$]*|=>|\|\||&&|=|[{}()\[\]]/g
// 上面第二类 token 各自对应的 class；不在表里的都按标识符处理。
// 注意圆括号 hljs 并不区分「函数调用的 ()」和「参数表的 ()」——两者都是裸文本，
// 这里统一归为 .hljs-paren，不做进一步区分。
const PUNCTUATION_CLASS = {
  // 裸箭头借用 .hljs-function —— hljs 给正常箭头的就是这个 class，
  // 借过来才能保证裸箭头与已着色的箭头同色，无需新增规则
  '=>': 'hljs-function',
  '=': 'hljs-operator',
  // && || 属于关键字运算符，借 .hljs-keyword —— 深浅两套都自动拿到与 const
  // 相同的颜色（深色橙 / 浅色红），也无需新增规则
  '||': 'hljs-keyword',
  '&&': 'hljs-keyword',
  '{': 'hljs-brace',
  '}': 'hljs-brace',
  '[': 'hljs-bracket',
  ']': 'hljs-bracket',
  '(': 'hljs-paren',
  ')': 'hljs-paren',
}
// Vue 指令前缀：v-if / :prop / @click / #slot
const VUE_DIRECTIVE = /^(v-|:|@|#)/
// 这几门语言的代码块「整块都是 JS」：独立的 ```js 代码块不会产生子语言容器，
// 裸标识符得从根节点去找。vue 是借道 xml 高亮的，script 段才有 .language-javascript
const JS_LANGUAGES = new Set(['javascript', 'js', 'jsx', 'typescript', 'ts', 'tsx'])
const JS_SUBLANGUAGE = 'language-javascript'

/**
 * 对 hljs 的高亮结果做两处补充（hljs 自身的语法覆盖不到的）：
 *
 * 1. 裸标识符 / 运算符 / 括号补 class
 *    hljs 的 javascript 语法既不给「裸标识符」发 class，也不给 = { } [ ] 这些
 *    运算符和括号发 —— const/let 声明的变量名、import { } 里的具名导入、
 *    赋值号、对象/数组的字面量括号，在高亮结果里全是没有任何 span 包裹的裸文本，
 *    因此 CSS 无从着色（关键词、字符串、方法名那些已有 class 的不受此限）。
 *    这里按类型分别包成 .hljs-variable / .hljs-operator / .hljs-brace / .hljs-bracket。
 *    只处理 JS 段「直接挂载」的文本节点：已经进了 span 的说明语法已经识别过，
 *    一律不动；template / style 段也一律不动
 *    （否则 CSS 里 hidden、2px 这类裸值会被误染）。
 *
 * 2. 属性名按来源补 class
 *    hljs 把三类语义完全不同的东西都标成 .hljs-attr：模板属性名（class）、
 *    Vue 指令（v-if）、JS 对象字面量的键（{ title: '' } 里的 title）。
 *    这里按 DOM 位置把它们拆开，让配色能分别处理：
 *      在 .hljs-tag 内  → 模板属性；带指令前缀的再补 .hljs-vue-directive
 *      不在标签内        → JS 对象键，补 .hljs-object-key
 *
 * @param {string} html - hljs 输出的高亮 HTML
 * @param {string} [language] - 本次高亮用的语言名（hljs 的 options.language），
 *   用来判断「整块就是 JS」还是「多语言块（vue 借道 xml）」
 * @returns {string} 处理后的 HTML
 */
function enhanceHighlightedHtml(html, language) {
  const needsAttrRoles = html.includes('hljs-attr')
  // 整块 JS 的代码块从根节点做；vue 这类多语言块只在 script 子语言容器里做
  const isWholeJsBlock = JS_LANGUAGES.has(language)
  const needsBareIdentifiers = isWholeJsBlock || html.includes(JS_SUBLANGUAGE)
  if (!needsBareIdentifiers && !needsAttrRoles) return html

  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html')

  if (needsAttrRoles) {
    doc.querySelectorAll('.hljs-attr').forEach((el) => {
      if (el.closest('.hljs-tag')) {
        // 在标签内 = 模板属性（HTML/XML 属性名），带指令前缀的再标一层
        if (VUE_DIRECTIVE.test(el.textContent)) el.classList.add('hljs-vue-directive')
      } else {
        // 不在标签内 = JS 对象字面量的键（{ title: '', content: '' } 里的 title/content）。
        // 这个判据对独立的 ```js 代码块同样成立 —— 那种块没有 .language-javascript
        // 容器，但仍不会有 .hljs-tag 祖先。
        el.classList.add('hljs-object-key')
      }
    })
  }

  if (!needsBareIdentifiers) return doc.body.innerHTML

  const jsRoots = isWholeJsBlock ? [doc.body] : doc.querySelectorAll(`.${JS_SUBLANGUAGE}`)
  jsRoots.forEach((box) => {
    const walker = doc.createTreeWalker(box, NodeFilter.SHOW_TEXT)
    const bareTextNodes = []
    let node
    while ((node = walker.nextNode())) {
      if (node.parentNode === box) bareTextNodes.push(node)
    }

    bareTextNodes.forEach((textNode) => {
      const text = textNode.nodeValue
      const fragment = doc.createDocumentFragment()
      BARE_TOKEN.lastIndex = 0

      let lastIndex = 0
      let match
      while ((match = BARE_TOKEN.exec(text)) !== null) {
        if (match.index > lastIndex) {
          fragment.appendChild(doc.createTextNode(text.slice(lastIndex, match.index)))
        }
        const span = doc.createElement('span')
        span.className = PUNCTUATION_CLASS[match[0]] || 'hljs-variable'
        span.textContent = match[0]
        fragment.appendChild(span)
        lastIndex = match.index + match[0].length
      }

      if (!fragment.childNodes.length) return
      if (lastIndex < text.length) {
        fragment.appendChild(doc.createTextNode(text.slice(lastIndex)))
      }
      textNode.parentNode.replaceChild(fragment, textNode)
    })
  })

  return doc.body.innerHTML
}

export async function createMarkdownPreview(theme = 'github') {
  // 基础预览组件 + 插件（与主题无关）
  const [
    { default: VMdPreview },
    { default: createLineNumbertPlugin },
    { default: createCopyCodePlugin },
    { default: createHighlightLinesPlugin },
  ] = await Promise.all([
    import('@kangc/v-md-editor/lib/preview'),
    import('@kangc/v-md-editor/lib/plugins/line-number/index'),
    import('@kangc/v-md-editor/lib/plugins/copy-code/index'),
    import('@kangc/v-md-editor/lib/plugins/highlight-lines/index'),
  ]);

  await Promise.all([
    import('@kangc/v-md-editor/lib/style/preview.css'),
    import('@kangc/v-md-editor/lib/plugins/copy-code/copy-code.css'),
    import('@kangc/v-md-editor/lib/plugins/highlight-lines/highlight-lines.css'),
  ]);

  const preview = VMdPreview;

  // 按主题懒加载对应的高亮库与样式（github → highlight.js，vuepress → prismjs），避免两者同时打包
  if (theme === 'vuepress') {
    const [{ default: vuepressTheme }, { default: Prism }] = await Promise.all([
      import('@kangc/v-md-editor/lib/theme/vuepress.js'),
      import('prismjs'),
    ]);
    // 补语言组件必须另起一个 await：prism 组件都是裸用全局 Prism 赋值（如 Prism.languages.json = ...），
    // 而 window.Prism 要等 prism-core 执行后才挂上，合并进上面的 Promise.all 会有求值顺序竞态。
    // 只补默认入口没带的（默认已含 markup/css/clike/javascript，即 html/xml/css/js）：
    // xml、html 是 markup 的别名；shell、sh 是 bash 的别名，故都不单列；
    // java 依赖 clike、ts 依赖 javascript，二者默认入口已带，无需前置。
    await Promise.all([
      import('prismjs/components/prism-json'),
      import('prismjs/components/prism-java'),
      import('prismjs/components/prism-bash'),
      import('prismjs/components/prism-typescript'),
      import('prismjs/components/prism-sql'),
      import('prismjs/components/prism-yaml'),
      import('prismjs/components/prism-nginx'),
    ]);
    await Promise.all([
      import('@kangc/v-md-editor/lib/theme/style/vuepress.css'),
      import('prismjs/themes/prism-tomorrow.css'), // Prism主题
    ]);
    // Prism 没有 vue 语言，借道 markup（xml/html 的别名本体），仅能着色 template 段
    preview.use(vuepressTheme, { Prism, codeHighlightExtensionMap: { vue: 'markup' } });
  } else {
    const [{ default: githubTheme }, { default: hljs }] = await Promise.all([
      import('@kangc/v-md-editor/lib/theme/github.js'),
      import('highlight.js'),
    ]);
    await import('@kangc/v-md-editor/lib/theme/style/github.css');
    // 包一层 hljs：只改写 highlight() 的返回值，补上裸标识符的 class。
    // 用 Object.create 而非展开，保证 getLanguage / registerLanguage 等方法照常可用
    const hljsWithVariables = Object.create(hljs);
    hljsWithVariables.highlight = (code, options) => {
      const result = hljs.highlight(code, options);
      return { ...result, value: enhanceHighlightedHtml(result.value, options?.language) };
    };
    // hljs 没有 vue 语言，借道 xml：其语法内置了 script/style 子语言，SFC 三段都能着色
    preview.use(githubTheme, { Hljs: hljsWithVariables, codeHighlightExtensionMap: { vue: 'xml' } });
  }

  return preview
    .use(createLineNumbertPlugin())
    .use(createCopyCodePlugin())
    .use(createHighlightLinesPlugin());
}
