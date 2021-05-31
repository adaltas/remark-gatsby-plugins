
unified = require 'unified'
parseMarkdown = require 'remark-parse'
remark2rehype = require 'remark-rehype'
html = require 'rehype-stringify'
extractFrontmatter = require 'remark-frontmatter'
pluginParseFrontmatter = require '../lib'

describe 'Parse frontmatter', ->
  
  it 'simple', ->
    {frontmatter} = await unified()
    .use parseMarkdown
    .use extractFrontmatter, ['yaml']
    .use pluginParseFrontmatter
    .use remark2rehype
    .use html
    .process """
    ---
    title: 'Article'
    lang: fr
    ---
    """
    frontmatter.should.eql title: 'Article', lang: 'fr'
