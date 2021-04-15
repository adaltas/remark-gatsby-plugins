
Remark = require 'remark'

enforceEmptyLine = require '..'

describe 'enforce-empty-lines', ->
  
  it 'error message', ->
    new Promise (resolve) ->
      enforceEmptyLine
        markdownNode:
          fileAbsolutePath: __filename
          frontmatter: {}
        markdownAST: (new Remark()).parse '''
        # this is the title
        and some text
        '''
        reporter: warn: (message) ->
          message.should.eql [
            'Use an empty line or 3 spaces between'
            'paragraphs to break the line'
            'in test/index.coffee#2'
          ].join ' '
          resolve()
      , {}
  
  it 'blocks without empty line', ->
    messages = []
    await enforceEmptyLine
      markdownNode:
        fileAbsolutePath: __filename
        frontmatter: {}
      markdownAST: (new Remark()).parse '''
      # this is the title
      and some text
      * list 1
      * list 2
      ```
      code
      ```
      > blockquote
      ***
      hello
      <html/>
      '''
      reporter: warn: (message) ->
        messages.push message
    , {}
    messages.length.should.eql 7
    messages.should.match [
      /test\/index\.coffee#2/
      /test\/index\.coffee#3/
      /test\/index\.coffee#5/
      /test\/index\.coffee#8/
      /test\/index\.coffee#9/
      /test\/index\.coffee#10/
      /test\/index\.coffee#11/
    ]
  
  it 'blocks with line', ->
    messages = []
    await enforceEmptyLine
      markdownNode:
        fileAbsolutePath: __filename
        frontmatter: {}
      markdownAST: (new Remark()).parse '''
      # this is the title
      
      and some text
      
      * list 1
      * list 2
      
      ```
      code
      ```
      
      > blockquote
      
      ***
      
      hello
      
      <div>html</div>
      '''
      reporter: warn: (message) ->
        messages.push message
    , {}
    messages.length.should.eql 0
  
  it 'blocks with line', ->
    messages = []
    await enforceEmptyLine
      markdownNode:
        fileAbsolutePath: __filename
        frontmatter: {}
      markdownAST: (new Remark()).parse '''
      paragraph 1
      paragraph 2
      '''
      reporter: warn: (message) ->
        messages.push message
    , {}
    messages.length.should.eql 1
    messages.should.match [
      /test\/index\.coffee#2/
    ]
  
  it 'consecutive blockquotes are accepted', ->
    messages = []
    await enforceEmptyLine
      markdownNode:
        fileAbsolutePath: __filename
        frontmatter: {}
      markdownAST: (new Remark()).parse '''
      > blockquote 1
      > blockquote 2
      
      > blockquote
        paragraphs no space above
      '''
      reporter: warn: (message) ->
        messages.push message
    , {}
    messages.length.should.eql 2
    messages.should.match [
      /test\/index\.coffee#2/
      /test\/index\.coffee#5/
    ]
