
Remark = require 'remark'
toHtml = require 'hast-util-to-html'
toHast = require 'mdast-util-to-hast'

extractTitle = require '..'

describe 'Extract title', ->
  
  it 'Move the title to frontmatter', ->
    # Initialize
    mast = (new Remark()).parse """
    # this is the title
    and some text
    """
    frontmatter = {}
    # Run
    extractTitle
      markdownNode:
        frontmatter: frontmatter
      markdownAST: mast
    , {}
    # Convert
    hast = toHast mast
    html = toHtml hast
    # Assert
    html.should.eql '<p>and some text</p>'
    frontmatter.should.eql
      title: 'this is the title'
