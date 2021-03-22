
Remark = require 'remark'

langInCodeBlock = require '..'

describe 'Extract title', ->
  
  it 'error message', ->
    new Promise (resolve) ->
      langInCodeBlock
        markdownNode:
          fileAbsolutePath: __filename
          frontmatter: {}
        markdownAST: (new Remark()).parse '''
        ```
        code
        ```
        '''
        reporter: warn: (message) ->
          message.should.eql [
            'Lang in code block is required'
            'in test/index.coffee#1'
          ].join ' '
          resolve()
      , {}
  
  it 'lang is not present', ->
    messages = []
    await langInCodeBlock
      markdownNode:
        fileAbsolutePath: __filename
        frontmatter: {}
      markdownAST: (new Remark()).parse '''
      ```
      code
      ```
      '''
      reporter: warn: (message) ->
        messages.push message
    , {}
    messages.length.should.eql 1
    messages.should.match [
      /test\/index\.coffee#1/
    ]

  it 'lang is present', ->
    messages = []
    await langInCodeBlock
      markdownNode:
        fileAbsolutePath: __filename
        frontmatter: {}
      markdownAST: (new Remark()).parse '''
      ```md
      code
      ```
      '''
      reporter: warn: (message) ->
        messages.push message
    , {}
    messages.length.should.eql 0
  
