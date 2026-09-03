// 全部动态导入：markdown-config 被 AppSidebar（首页）静态引用，
// 若在顶层 import 编辑器组件会把编辑器 chunk 拖回首屏，这里全部改为按需加载
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
    await Promise.all([
      import('@kangc/v-md-editor/lib/theme/style/vuepress.css'),
      import('prismjs/themes/prism-tomorrow.css'), // Prism主题
    ]);
    preview.use(vuepressTheme, { Prism });
  } else {
    const [{ default: githubTheme }, { default: hljs }] = await Promise.all([
      import('@kangc/v-md-editor/lib/theme/github.js'),
      import('highlight.js'),
    ]);
    await import('@kangc/v-md-editor/lib/theme/style/github.css');
    preview.use(githubTheme, { Hljs: hljs });
  }

  return preview
    .use(createLineNumbertPlugin())
    .use(createCopyCodePlugin())
    .use(createHighlightLinesPlugin());
}
