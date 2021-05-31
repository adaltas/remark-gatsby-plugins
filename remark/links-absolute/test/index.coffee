
unified = require 'unified'
parseMarkdown = require 'remark-parse'
remark2rehype = require 'remark-rehype'
html = require 'rehype-stringify'
pluginAbsoluteLinks = require '../lib'
format = require 'rehype-format'

describe 'Normalize absolute links', ->
  
  it 'simple', ->
    {contents} = await unified()
    .use parseMarkdown
    .use pluginAbsoluteLinks, baseURL: 'http://www.adaltas.com'
    .use remark2rehype
    .use html
    .use format
    .process """
    [HTTP link](http://www.adaltas.com/some/path/)
    [absolute link](/some/path/)
    """
    contents.trim().should.eql """
    <p>
      <a href="http://www.adaltas.com/some/path/">HTTP link</a>
      <a href="http:/www.adaltas.com/some/path/">absolute link</a>
    </p>
    """
