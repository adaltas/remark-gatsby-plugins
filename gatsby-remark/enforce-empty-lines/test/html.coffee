
Remark = require 'remark'
# toHtml = require 'hast-util-to-html'
# toHast = require 'mdast-util-to-hast'

enforceEmptyLine = require '..'

describe 'enforce-empty-lines html', ->

  it 'require an empty line', ->
    messages = []
    await enforceEmptyLine
      markdownNode:
        fileAbsolutePath: __filename
        frontmatter: {}
      markdownAST: (new Remark()).parse '''
      <div>html</div>
      paragraph
      '''
      reporter: warn: (message) ->
        messages.push message
    , {}
    # HTML require an empty line,
    # in the example above,
    # only one node of type html is created,
    # there is no paragraph node
    messages.length.should.eql 0

  it 'require an empty line before', ->
    messages = []
    await enforceEmptyLine
      markdownNode:
        fileAbsolutePath: __filename
        frontmatter: {}
      markdownAST: (new Remark()).parse '''
      * list
        
      <html/>
      '''
      reporter: warn: (message) ->
        messages.push message
    , {}
    messages.length.should.eql 0
