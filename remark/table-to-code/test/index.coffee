
unified = require 'unified'
markdown = require 'remark-parse'
gfm = require 'remark-gfm'
remark2rehype = require 'remark-rehype'
html = require 'rehype-stringify'
pluginTableToCode = require '../lib'

describe 'Markdown table to AST', ->
  
  it 'simple', ->
    {contents} = await unified()
    .use markdown
    .use gfm
    .use pluginTableToCode
    .use remark2rehype
    .use html
    .process """
    | 123 | b  |
    |-----|----|
    | 1   | ab |
    """
    contents.should.eql """
    <pre><code>| 123 | b  |
    | --- | -- |
    | 1   | ab |
    </code></pre>
    """
    
