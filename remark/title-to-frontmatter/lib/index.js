
const toText = require('hast-util-to-text')

module.exports = () =>

  (ast, vfile) => {
    if(vfile.frontmatter && vfile.frontmatter.noTitleToFrontmatter) return
    if(!ast.children.length) return
    let index = 0
    if(ast.children[0].type === 'yaml') index++
    const child = ast.children[index]
    if(child.type === 'heading' && child.depth === 1)
      if(!vfile.frontmatter) vfile.frontmatter = {}
      if(!vfile.frontmatter.title)
        vfile.frontmatter.title = toText(child)
      ast.children.splice(index, 1)
    return null
  }
