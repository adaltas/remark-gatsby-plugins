
Remark = require 'remark'
displayEmbedFileBefore = require '..'
visit = require '../visit'

describe 'Extract title', ->

  it 'default option', ->
    ast = (new Remark()).parse '''
    before 1   
    before 2   
    `embed:path/to/source.ext`
    after
    '''
    await displayEmbedFileBefore
      markdownNode:
        fileAbsolutePath: __filename
        frontmatter: {}
      markdownAST: ast
    , {}
    visit ast, 'inlineCode', (node) ->
      node.should.match
        type: 'inlineCode'
        value: 'embed:path/to/source.ext'
        data: embed: file: 'path/to/source.ext'

  it 'with embeded options', ->
    ast = (new Remark()).parse '''
    before 1   
    before 2   
    `embed:path/to/source.ext{snippet: "value"}`
    after
    '''
    await displayEmbedFileBefore
      markdownNode:
        fileAbsolutePath: __filename
        frontmatter: {}
      markdownAST: ast
    , {}
    visit ast, 'inlineCode', (node) ->
      node.should.match
        type: 'inlineCode'
        value: 'embed:path/to/source.ext{snippet: "value"}'
        data: embed: file: 'path/to/source.ext'
