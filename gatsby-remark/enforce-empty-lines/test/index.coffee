
Remark = require 'remark'
# toHtml = require 'hast-util-to-html'
# toHast = require 'mdast-util-to-hast'

blockEmptyLine = require '..'

describe 'Extract title', ->
  
  it 'error message', ->
    new Promise (resolve) ->
      blockEmptyLine
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
    await blockEmptyLine
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
        # console.log message
        messages.push message
    , {}
    messages.should.match [
      /test\/index\.coffee#2/
      /test\/index\.coffee#3/
      /test\/index\.coffee#5/
      /test\/index\.coffee#8/
      /test\/index\.coffee#9/
      /test\/index\.coffee#10/
    ]
  
  it 'blocks with line', ->
    messages = []
    await blockEmptyLine
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
        # console.log message
        messages.push message
    , {}
    messages.length.should.eql 0
  
  it 'blocks with line', ->
    messages = []
    await blockEmptyLine
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
    messages.should.match [
      /test\/index\.coffee#2/
    ]

  it 'html require an empty line', ->
    messages = []
    await blockEmptyLine
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
