// 全部动态导入：markdown-config 被 AppSidebar（首页）静态引用，
// 若在顶层 import 编辑器组件会把编辑器 chunk 拖回首屏，这里全部改为按需加载

// 需要补 class 的裸文本分两类，作用域不同：

// ① 运算符 / 括号：:= = => || && { } [ ] ( )
//    hljs 对大多数语言都不给它们发 class —— JS 的 = ( ) 、Java 的 { } 、CSS 的 ( ) 都是裸文本。
//    因此这一类的补色范围是「所有语言」。
//    注意 `=>` 必须排在 `=` 前面，否则箭头会被切成 `=` 和 `>` 两个 token。
const BARE_PUNCTUATION = /=>|\|\||&&|=|[{}()\[\]]/g
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
// ② 裸标识符：字母/下划线/美元符开头，后接字母数字下划线美元符。
//    只对 JS 系语言补 —— 其它语言的裸文本语义完全不同（CSS 里 flex、hidden 是属性值，
//    补成「变量色」是错的），所以这类严格限定作用域。
const BARE_IDENTIFIER = /[A-Za-z_$][\w$]*/g

// ③ CSS 段的裸 token：允许前导 `-`（-webkit-、-clamp 这类），后接字母数字下划线连字符
const CSS_BARE_TOKEN = /-?[A-Za-z][\w-]*/g

// Vue 指令前缀：v-if / :prop / @click / #slot
const VUE_DIRECTIVE = /^(v-|:|@|#)/
// 这几门语言的代码块「整块都是 JS」：独立的 ```js 代码块不会产生子语言容器，
// 裸标识符得从根节点去找。vue 是借道 xml 高亮的，script 段才有 .language-javascript
const JS_LANGUAGES = new Set(['javascript', 'js', 'jsx', 'typescript', 'ts', 'tsx'])
const JS_SUBLANGUAGE = 'language-javascript'
const CSS_SUBLANGUAGE = 'language-css'
// Vue 特有的「伪类」（实为作用域组合器），hljs 把它们和 :not/:is 一样标成 .hljs-built_in，
// 但语义上是选择器的一部分，不是 CSS 伪类 —— 按名字区分开
const VUE_PSEUDO = new Set(['deep', 'global', 'slotted'])

/**
 * 对 hljs 的高亮结果做三处补充（hljs 自身的语法覆盖不到的）：
 *
 * 1. 运算符 / 括号补 class —— 作用于所有语言
 *    hljs 对多数语言都不给 => || && = { } [ ] ( ) 这些发 class：JS 的 = ( ) 、
 *    Java 的 { } 、CSS 的 ( ) 在高亮结果里全是裸文本。这会造成同一类 token
 *    在不同语言的代码块里「有的有色有的没色」，观感不一致。
 *    这里统一补 class，配色见 markdown-highlight.scss。
 *
 * 2. 裸标识符补 class —— 仅 JS 系语言
 *    hljs 的 javascript 语法不给裸标识符发 class：const/let 声明的变量名、
 *    import { } 里的具名导入都是裸文本，补 .hljs-variable。
 *    严格限定 JS —— 其它语言的裸文本语义完全不同（CSS 里 flex、hidden 是属性值），
 *    补成「变量色」是错的。
 *
 * 3. 属性名按来源补 class
 *    hljs 把三类语义完全不同的东西都标成 .hljs-attr：模板属性名（class）、
 *    Vue 指令（v-if）、JS 对象字面量的键（{ title: '' } 里的 title）。
 *    这里按 DOM 位置把它们拆开，让配色能分别处理：
 *      在 .hljs-tag 内  → 模板属性；带指令前缀的再补 .hljs-vue-directive
 *      不在标签内        → JS 对象键，补 .hljs-object-key
 *
 * 三处都只处理「直接挂载」的文本节点：已经进了 span 的说明语法已经识别过，
 * 一律不动（否则字符串里的 { 、CSS 里的 hidden 都会被误伤）。
 *
 * @param {string} html - hljs 输出的高亮 HTML
 * @param {string} [language] - 本次高亮用的语言名（hljs 的 options.language），
 *   用来判断「整块就是 JS」还是「多语言块（vue 借道 xml）」
 * @returns {string} 处理后的 HTML
 */

/**
 * 把 box 下「直接挂载」的文本节点里匹配 regex 的片段，包成带 class 的 span。
 * @param {Document} doc
 * @param {Node} box - 容器节点，只处理它的直接子文本节点
 * @param {RegExp} regex - 带 g 的 token 正则
 * @param {(token: string) => string} classOf - token → class 名
 */
function wrapBareTokens(doc, box, regex, classOf) {
  const walker = doc.createTreeWalker(box, NodeFilter.SHOW_TEXT)
  const targets = []
  let node
  while ((node = walker.nextNode())) {
    if (node.parentNode === box) targets.push(node)
  }

  targets.forEach((textNode) => {
    const text = textNode.nodeValue
    const fragment = doc.createDocumentFragment()
    regex.lastIndex = 0

    let lastIndex = 0
    let match
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        fragment.appendChild(doc.createTextNode(text.slice(lastIndex, match.index)))
      }
      const span = doc.createElement('span')
      span.className = classOf(match[0])
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
}

/**
 * 给 CSS 段重新分派角色。
 *
 * hljs 的 CSS 语法在这几处是不可靠的，光靠 class 名没法配色：
 *   1. -webkit-line-clamp 被拆成 -webkit-(裸) + line(.hljs-selector-tag) + -clamp(裸)
 *   2. 属性值（vertical / hidden / -webkit-box）整段是裸文本，完全没色
 *   3. :deep(...) / :not(...) 里的内容会被误判 —— .markdown-content 变成「值」、
 *      code / pre 变成「属性名」，看 class 名完全看不出它其实在选择器位
 *
 * 所以这里不猜 class，改为按「大括号深度」判断当前位置：
 *   深度 0（在选择器里）→ 裸 token 归选择器；但紧跟在 `.` 后面的仍按类选择器处理
 *   深度 > 0（在声明块里）→ 冒号之前的是属性名，冒号之后的是属性值
 * 另外 :deep/:global/:slotted 是 Vue 的，不是 CSS 伪类 —— hljs 把它们和 :not/:is
 * 一样标成 .hljs-built_in，这里按名字拆开。
 * @param {Document} doc
 */
function markCssRoles(doc) {
  doc.querySelectorAll(`.${CSS_SUBLANGUAGE}`).forEach((box) => {
    // 深度 0 = 选择器位；>0 = 声明块内
    let depth = 0
    // 当前声明里是否已经过了冒号（过了就是属性值）
    let afterColon = false

    const step = (chunk) => {
      for (const ch of chunk) {
        if (ch === '{') {
          depth++
          afterColon = false
        } else if (ch === '}') {
          depth--
          afterColon = false
        } else if (ch === ';') {
          afterColon = false
        } else if (ch === ':' && depth > 0) {
          afterColon = true
        }
      }
    }

    const visit = (parent) => {
      for (const child of [...parent.childNodes]) {
        if (child.nodeType === 3) {
          // 只处理容器的「直接子」文本节点 —— 进了 span 的说明 hljs 已经识别过，
          // 一律不动。否则注释里的中文、字符串里的内容都会被误当成 CSS 拆碎
          // （递归进去会连 /* ... */ 里的文字都包成 css-prop）。
          // 深度推进由 splitCssTextNode 内部负责，这里不能再 step 一次，否则重复计数。
          if (parent === box) splitCssTextNode(child)
        } else if (child.nodeType === 1) {
          // 元素（hljs 已识别过的片段）：按当前深度分派
          // 声明块里本不该出现选择器 —— 出现了就是 hljs 把 -webkit-line-clamp
          // 这类拆碎后把 line 误标成 .hljs-selector-tag，归回属性名
          if (depth > 0 && /(^|\s)hljs-selector-/.test(child.className)) {
            child.classList.add('hljs-css-prop')
          }
          if (child.classList.contains('hljs-built_in')) {
            // :deep/:global/:slotted 归选择器；其余（:not/:is/...）是 CSS 伪类
            child.classList.add(VUE_PSEUDO.has(child.textContent) ? 'hljs-css-selector' : 'hljs-css-pseudo')
          }
          // 元素内部的文本不再拆，但深度仍要推进（大括号理论上不会落在 span 里，
          // 这里只是保险：直接按它的文本内容推进一次）
          step(child.textContent)
        }
      }
    }

    const splitCssTextNode = (textNode) => {
      const text = textNode.nodeValue
      const fragment = doc.createDocumentFragment()
      CSS_BARE_TOKEN.lastIndex = 0

      let lastIndex = 0
      let match
      while ((match = CSS_BARE_TOKEN.exec(text)) !== null) {
        const between = text.slice(lastIndex, match.index)
        if (between) fragment.appendChild(doc.createTextNode(between))
        step(between)

        const token = match[0]
        // 选择器位（深度 0 且还没到冒号）里，紧跟在 . 后面的是类选择器、紧跟 : 后面的是伪类。
        // 这两类 hljs 常常不给 class —— 例如 :deep(...) 里的
        //   .v-skeleton-loader__text:first-child
        // 整段都是裸文本，只看 class 名会把它俩当成属性名
        // （那样 first-child 就会显示成属性名的绿，而不是伪类色）。
        // 例外：:deep/:global/:slotted 是 Vue 的作用域组合器，不算 CSS 伪类。
        const isClassSelector = !afterColon && between.endsWith('.')
        const isPseudo = !afterColon && between.endsWith(':')
        const role = isClassSelector
          ? 'hljs-css-selector'
          : isPseudo
            ? (VUE_PSEUDO.has(token) ? 'hljs-css-selector' : 'hljs-css-pseudo')
            : afterColon
              ? 'hljs-css-value'
              : 'hljs-css-prop'

        const span = doc.createElement('span')
        span.className = role
        span.textContent = token
        fragment.appendChild(span)
        lastIndex = match.index + token.length
      }

      const tail = text.slice(lastIndex)
      if (tail) fragment.appendChild(doc.createTextNode(tail))
      step(tail)

      if (fragment.childNodes.length) textNode.parentNode.replaceChild(fragment, textNode)
    }

    visit(box)
  })
}

function enhanceHighlightedHtml(html, language) {
  const isWholeJsBlock = JS_LANGUAGES.has(language)
  const hasJsSection = html.includes(JS_SUBLANGUAGE)
  const hasCssSection = html.includes(CSS_SUBLANGUAGE)
  // 快速短路：没有要补的标点、没有属性名要拆、也没有 CSS 段要分派角色，直接原样返回
  if (!hasCssSection && !/[{}()\[\]=|&]/.test(html) && !html.includes('hljs-attr')) return html

  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html')

  // ① CSS 段：按大括号深度分派属性名 / 属性值 / 选择器。
  //    必须排在标点那一步之前 —— 它要靠 { } 还在裸文本里来判断当前位置
  //    （标点那步会把大括号包成 span，之后就没法计数了）
  if (hasCssSection) markCssRoles(doc)

  // ② 运算符 / 括号：整块根节点 + 各子语言容器（.language-xxx）都要处理。
  //    子语言容器要单独列，是因为 Vue 借道 xml 时 script / style 段各自包了一层。
  const punctuationRoots = [doc.body, ...doc.querySelectorAll('[class*="language-"]')]
  punctuationRoots.forEach((box) => {
    wrapBareTokens(doc, box, BARE_PUNCTUATION, (token) => PUNCTUATION_CLASS[token])
  })

  // ③ 裸标识符：整块 JS 的从根节点做；vue 这类多语言块只在 script 段做
  if (isWholeJsBlock) {
    wrapBareTokens(doc, doc.body, BARE_IDENTIFIER, () => 'hljs-variable')
  } else if (hasJsSection) {
    doc.querySelectorAll(`.${JS_SUBLANGUAGE}`).forEach((box) => {
      wrapBareTokens(doc, box, BARE_IDENTIFIER, () => 'hljs-variable')
    })
  }

  // ③ 属性名按来源拆分
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
