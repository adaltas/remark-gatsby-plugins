
const path = require('path')
const fs = require('fs').promises
const mm = require('micromatch')
const visit = require('unist-util-visit')

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
  if(!markdownNode.frontmatter.noLangInCodeBlock){
    warnings = []
    visit(markdownAST, 'code', (node) => {
      if(node.lang === null || node.lang.trim() === ''){
        warnings.push({
          line: node.position.start.line
        })
      }
    })
    if(warnings.length){
      const fmlines = await countFrontMatterLines(markdownNode.fileAbsolutePath)
      const file = path.relative('.', markdownNode.fileAbsolutePath)
      warnings.map( ({line}) => {
        reporter.warn(
          `Lang in code block is required in ${file}#${fmlines + line}`,
          new Error("Invalid Markdown Paragraph"))
      })
    }
  }
}

const countFrontMatterLines = async (fileAbsolutePath) => {
  const content = await fs.readFile(fileAbsolutePath, 'utf8')
  const lines = content.split(/\r\n|[\n\r\u0085\u2028\u2029]/g)
  let count = 0
  if(lines[0].trim().substr(0, 3) === '---'){
    for(let i=0; i<lines.length; i++){
      if(i === 0){
        continue
      }else if(lines[i].trim() === '---'){
        count = i + 1
        break
      }
    }
  }
  return count
}
