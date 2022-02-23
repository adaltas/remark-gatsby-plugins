
const mm = require('micromatch')
const visit = require('./visit');

module.exports = async (
  { markdownNode, markdownAST, reporter },
  { include = [] }
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
    visit(markdownAST, 'inlineCode', (node, {ancestors, index, parent}) => {
      let file; if([,file] = /^embed:(.*?)({|$)/.exec(node.value)){
        if(!node.data){
          node.data = {};
        };
        node.data.embed = {
          file: file
        };
      }
    });
  }
}
