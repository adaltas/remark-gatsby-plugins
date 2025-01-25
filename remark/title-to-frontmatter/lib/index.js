import { toText } from 'hast-util-to-text'

export default function titleToFrontMatter(options = {}) {
  if (!options.property) {
    options.property = 'data'
  }
  return (ast, vfile) => {
    if (vfile[options.property] && vfile[options.property].noTitleToFrontmatter)
      return
    if (!ast.children.length) return
    let index = 0
    if (ast.children[0].type === 'yaml') index++
    const child = ast.children[index]
    if (child === undefined) return // no content, just some frontmatter
    if (child.type === 'heading' && child.depth === 1) {
      if (!vfile[options.property]) vfile[options.property] = {}
      if (!vfile[options.property].title)
        vfile[options.property].title = toText(child)
      ast.children.splice(index, 1)
    }
    return null
  }
}
