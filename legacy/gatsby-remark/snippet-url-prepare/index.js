
const mm = require('micromatch')
const visit = require('./visit');

module.exports = async (
  { markdownNode, markdownAST, reporter },
  { include = [] }
) => {
  const fileAbsolutePath = (
    markdownNode.internal?.contentFilePath // gatsby-plugin-mdx style
    ||
    markdownNode.fileAbsolutePath // gatsby-transformer-remark style
  )
  if(include.length > 0){
    const filePath = fileAbsolutePath
      .split(process.cwd())
      .pop()
      .replace(/^\//, '')
    const isIncluded = mm.isMatch(filePath, include)
    if (!isIncluded) { return }
  }
  if(!markdownNode.frontmatter.noSnippedUrl){
    visit(markdownAST, 'inlineCode', (node, {ancestors, index, parent}) => {
      const match = /^embed:(.*?)({|$)/.exec(node.value);
      if(!match) return;
      const [, file] = match;
      if(!node.data){
        node.data = {};
      };
      node.data.embed = {
        file: file
      };
    });
  }
}
