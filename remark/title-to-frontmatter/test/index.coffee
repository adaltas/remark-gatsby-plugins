
unified = require 'unified'
parseMarkdown = require 'remark-parse'
remark2rehype = require 'remark-rehype'
html = require 'rehype-stringify'
extractFrontmatter = require 'remark-frontmatter'
pluginReadFrontmatter = require 'remark-read-frontmatter'
pluginTitleToFrontmatter = require '../lib'

describe 'Extract title', ->

  it 'without frontmatter', ->
    {data} = await unified()
    .use parseMarkdown
    .use extractFrontmatter, ['yaml']
    .use pluginReadFrontmatter
    .use pluginTitleToFrontmatter
    .use remark2rehype
    .use html
    .process """
    # My title
    """
    data.should.eql
      title: 'My title'

  it 'with frontmatter', ->
    {data} = await unified()
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
    data.should.eql
      lang: 'fr'
      title: 'My title'

  it 'no title', ->
    {data} = await unified()
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
    data.should.eql
      lang: 'fr'

  it 'no frontmatter, no content', ->
    {data} = await unified()
    .use parseMarkdown
    .use extractFrontmatter, ['yaml']
    .use pluginReadFrontmatter
    .use pluginTitleToFrontmatter
    .use remark2rehype
    .use html
    .process """
    """
    data.should.eql {}

  it 'with frontmatter, no content', ->
    {data} = await unified()
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
    data.should.eql
      lang: 'fr'

  it 'option `property`', ->
    {data, test} = await unified()
    .use parseMarkdown
    .use extractFrontmatter, ['yaml']
    .use pluginReadFrontmatter
    .use pluginTitleToFrontmatter, property: 'test'
    .use remark2rehype
    .use html
    .process """
    # My title
    """
    data.should.eql {}
    test.should.eql
      title: 'My title'
