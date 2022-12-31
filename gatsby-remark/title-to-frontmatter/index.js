
const mm = require('micromatch')
const toHast = require('mdast-util-to-hast')
const toText = require('hast-util-to-text')
const toHtml = require('hast-util-to-html')

module.exports = async (
  { markdownNode, markdownAST },
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
    // Skip node if not included
    if (!mm.isMatch(filePath, include)) { return }
  }
  if(!markdownNode.frontmatter.noTitleToFrontmatter){
    if(markdownAST.children.length && markdownAST.children[0].type === 'heading' && markdownAST.children[0].depth === 1){
      if(!markdownNode.frontmatter.title){
        hast = toHast(markdownAST.children[0])
        markdownNode.frontmatter.title = toText(hast)
        markdownNode.frontmatter.titleHtml = toHtml(hast)
      }
      markdownAST.children.shift()
    }
  }
}
