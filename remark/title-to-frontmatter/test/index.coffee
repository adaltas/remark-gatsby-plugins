
unified = require 'unified'
parseMarkdown = require 'remark-parse'
remark2rehype = require 'remark-rehype'
html = require 'rehype-stringify'
extractFrontmatter = require 'remark-frontmatter'
pluginReadFrontmatter = require 'remark-read-frontmatter'
pluginTitleToFrontmatter = require '../lib'

describe 'Extract title', ->

  it 'without frontmatter', ->
    {frontmatter} = await unified()
    .use parseMarkdown
    .use extractFrontmatter, ['yaml']
    .use pluginReadFrontmatter
    .use pluginTitleToFrontmatter
    .use remark2rehype
    .use html
    .process """
    # My title
    """
    frontmatter.should.eql
      title: 'My title'

  it 'with frontmatter', ->
    {frontmatter} = await unified()
    .use parseMarkdown
    .use extractFrontmatter, ['yaml']
    .use pluginReadFrontmatter
    .use pluginTitleToFrontmatter
    .use remark2rehype
    .use html
    .process """
    ---
    lang: fr
    ---

    # My title
    """
    frontmatter.should.eql
      lang: 'fr'
      title: 'My title'

  it 'no title', ->
    {frontmatter} = await unified()
    .use parseMarkdown
    .use extractFrontmatter, ['yaml']
    .use pluginReadFrontmatter
    .use pluginTitleToFrontmatter
    .use remark2rehype
    .use html
    .process """
    ---
    lang: fr
    ---
    
    hello
    """
    frontmatter.should.eql
      lang: 'fr'

  it 'no frontmatter, no content', ->
    {frontmatter} = await unified()
    .use parseMarkdown
    .use extractFrontmatter, ['yaml']
    .use pluginReadFrontmatter
    .use pluginTitleToFrontmatter
    .use remark2rehype
    .use html
    .process """
    """
    should(frontmatter).be.undefined()

  it 'with frontmatter, no content', ->
    {frontmatter} = await unified()
    .use parseMarkdown
    .use extractFrontmatter, ['yaml']
    .use pluginReadFrontmatter
    .use pluginTitleToFrontmatter
    .use remark2rehype
    .use html
    .process """
    ---
    lang: fr
    ---
    """
    frontmatter.should.eql
      lang: 'fr'
