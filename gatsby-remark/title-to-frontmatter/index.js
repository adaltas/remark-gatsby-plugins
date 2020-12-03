
const mm = require('micromatch')
const toText = require('hast-util-to-text')

module.exports = async (
  { markdownNode, markdownAST },
  { include = [] }
) => {
  if(include.length > 0){
    const filePath = markdownNode.fileAbsolutePath
      .split(process.cwd())
      .pop()
      .replace(/^\//, '')
    // Skip node if not included
    if (!mm.isMatch(filePath, include)) { return }
  }
  if(!markdownNode.frontmatter.noTitleToFrontmatter){
    if(markdownAST.children.length && markdownAST.children[0].type === 'heading' && markdownAST.children[0].depth === 1){
      if(!markdownNode.frontmatter.title){
        markdownNode.frontmatter.title = toText(markdownAST.children[0])
      }
      markdownAST.children.shift()
    }
  }
}
