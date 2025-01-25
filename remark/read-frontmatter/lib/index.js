import yaml from 'js-yaml'

export default function readFrontmatter(options = {}) {
  if (!options.property) {
    options.property = 'data'
  }
  return (ast, vfile) => {
    // Extract frontmatter
    for (const child of ast.children) {
      if (child.type !== 'yaml') continue
      vfile[options.property] = yaml.load(child.value)
    }
    return null
  }
}
