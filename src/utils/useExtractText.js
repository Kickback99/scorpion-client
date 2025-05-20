import { marked } from 'marked';

export const mdToPlainText = (mdStr) =>{
  // t_question：空值处理
  if(!mdStr){
    return
  }
    // 先转换为HTML
  const html = marked.parse(mdStr);
  // 再从HTML提取文本
  return html.replace(/<[^>]*>?/gm, '');
}