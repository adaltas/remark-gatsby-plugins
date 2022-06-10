
unified = require 'unified'
parseMarkdown = require 'remark-parse'
remark2rehype = require 'remark-rehype'
html = require 'rehype-stringify'
extractFrontmatter = require 'remark-frontmatter'
pluginReadFrontmatter = require '../lib'

describe 'Read frontmatter', ->
  
  it 'simple', ->
    {data} = await unified()
    .use parseMarkdown
    .use extractFrontmatter, ['yaml']
    .use pluginReadFrontmatter
    .use remark2rehype
    .use html
    .process """
    ---
    title: 'Article'
    lang: fr
    ---
    """
    data.should.eql title: 'Article', lang: 'fr'
      
  it 'option `property`', ->
    {data, test} = await unified()
    .use parseMarkdown
    .use extractFrontmatter, ['yaml']
    .use pluginReadFrontmatter, property: 'test'
    .use remark2rehype
    .use html
    .process """
    ---
    title: 'Article'
    lang: fr
    ---
    """
    data.should.eql {}
    test.should.eql title: 'Article', lang: 'fr'
