
Remark = require 'remark'

enforceEmptyLine = require '..'

describe 'enforce-empty-lines', ->

  it 'nested list', ->
    messages = []
    await enforceEmptyLine
      markdownNode:
        fileAbsolutePath: __filename
        frontmatter: {}
      markdownAST: (new Remark()).parse '''
      * list 1
        - element 1
        - element 2
      * list 1
      '''
      reporter: warn: (message) ->
        messages.push message
    , {}
    messages.length.should.eql 0

  it 'paragraphs in list behave like inside root', ->
    messages = []
    await enforceEmptyLine
      markdownNode:
        fileAbsolutePath: __filename
        frontmatter: {}
      markdownAST: (new Remark()).parse '''
      * list 1
        - element 1
          no space before, raise a warning
        
        - element 2
        
          no space after, fine, this is a list
        - element 3
        
          no space
          between paragraphes
        
      * list 1
      '''
      reporter: warn: (message) ->
        messages.push message
    , {}
    messages.should.match [
      /test\/index\.coffee#3/
      /test\/index\.coffee#11/
    ]

  it 'list tolerate non empty lines', ->
    messages = []
    await enforceEmptyLine
      markdownNode:
        fileAbsolutePath: __filename
        frontmatter: {}
      markdownAST: (new Remark()).parse '''
      * valid list
        ```
        code
        ```
        > blockquote
        ***
        hello
        <html/>
      * invalid list
        text
        > blockquote
        text
        <html/>
      '''
      reporter: warn: (message) ->
        messages.push message
    , {}
    messages.should.match [
      /test\/index\.coffee#10/
      /test\/index\.coffee#12/
    ]
  
