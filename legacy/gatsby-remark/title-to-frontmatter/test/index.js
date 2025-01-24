
const dedent = require('dedent')
const Remark = require('remark')
const toHtml = require('hast-util-to-html')
const toHast = require('mdast-util-to-hast')
const extractTitle = require('../lib/index.js')

describe('Extract title', () => {
  
  it('Move the title to frontmatter', () => {
    // Initialize
    const mast = (new Remark()).parse(dedent`
      # this is the title
      and some text
    `)
    let frontmatter = {}
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
      title: 'this is the title',
      titleHtml: '<h1>this is the title</h1>'
    })
  })

  it('Move with inline code', () => {
    // Initialize
    const mast = (new Remark()).parse(dedent`
      # this is the \`inlineCode\` title
      and some text
    `)
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
      title: 'this is the inlineCode title',
      titleHtml: '<h1>this is the <code>inlineCode</code> title</h1>'
    })
  })

  it('Dont overwrite frontmatter', () => {
    // Initialize
    const mast = (new Remark()).parse(dedent`
      # Content title
      Some text
    `)
    const frontmatter = {
      title: 'Frontmatter title'
    }
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
    html.should.eql('<p>Some text</p>')
    frontmatter.should.eql({
      title: 'Frontmatter title'
    })
  })

  it('only use heading 1', () => {
    // Initialize
    const mast = (new Remark()).parse(dedent`
      ## Title
      Some text
    `)
    const frontmatter = {}
    // Run
    extractTitle({
      markdownNode:{
        frontmatter: frontmatter
      },
      markdownAST: mast
    }, {})
    // Convert
    const hast = toHast(mast)
    const html = toHtml(hast)
    // Assert
    html.should.eql('<h2>Title</h2>\n<p>Some text</p>')
    frontmatter.should.eql({})
  })
  
})
