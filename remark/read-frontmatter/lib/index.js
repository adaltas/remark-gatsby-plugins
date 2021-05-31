
yaml = require('js-yaml')

module.exports = () =>
  (ast, vfile) => {
    // Extract frontmatter
    for(const child of ast.children) {
      if(child.type !== 'yaml') continue
      vfile.frontmatter = yaml.load(child.value)
    }
    return null
  }
