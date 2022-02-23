
const mm = require('micromatch');
const cheerio = require('cheerio');
const visit = require('./visit');

module.exports = async (
  { markdownNode, markdownAST, reporter },
  { include = [],
    classe = 'display-embed-file',
    classe_highlight = 'display-embed-file-highlight',
    message,
    url }
) => {
  if(include.length > 0){
    const filePath = markdownNode.fileAbsolutePath
      .split(process.cwd())
      .pop()
      .replace(/^\//, '')
    const isIncluded = mm.isMatch(filePath, include)
    if (!isIncluded) { return }
  }
  if(!markdownNode.frontmatter.noSnippedUrl){
    visit(markdownAST, 'html', (node, {ancestors, index, parent}) => {
      if(node.data && node.data.embed){
        const $ = cheerio.load(node.value, {}, false);
        message =
          message && typeof message === 'string' ?
          message.replace('{{FILE}}', node.data.embed.file) :
          message && typeof message === 'function' ?
          message(node.data.embed.file) :
          node.data.embed.file;
        url =
          url && typeof url === 'string' ?
          url.replace('{{FILE}}', node.data.embed.file) :
          url && typeof url === 'function' ?
          url(node.data.embed.file) :
          node.data.embed.file;
        const content = `<div class="${classe}"><a href="${url}">${message}</a></div>`;
        $(':root').attr('class', $('div').attr('class') + ' ' + classe_highlight)
        $(':root').append(content)
        node.value = $.html()
      }
    });
  }
}
