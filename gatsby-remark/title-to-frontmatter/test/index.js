const Remark = require('remark')
const toHtml = require('hast-util-to-html')
const toHast = require('mdast-util-to-hast')

const extractTitle = require('..')

describe( 'Extract title', () => {
  
  it( 'Move the title to frontmatter', () => {
    // Initialize
    const mast = (new Remark()).parse(
      [
        '# this is the title',
        'and some text'
      ].join('\n')
    )
    const frontmatter = {}
    // Run
    extractTitle({
      markdownNode: {
        frontmatter: frontmatter
      },
      markdownAST: mast
    }, {})
    // Convert
    const hast = toHast(mast)
    const html = toHtml(hast)
    // Assert
    html.should.eql('<p>and some text</p>')
    frontmatter.should.eql({
      title: 'this is the title'
    })
  })
})
