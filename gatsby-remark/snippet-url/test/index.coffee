
Remark = require 'remark'
displayEmbedFileAfter = require '..'
visit = require '../visit'

source = JSON.stringify {
  "type": "paragraph",
  "children": [
    {
      "type": "html",
      "value": [
        '<div class="gatsby-highlight" data-language="html">'
          '<pre class="language-html">'
            '<code class="language-html">'
              '...'
            '</code>'
          '</pre>'
        '</div>'
      ].join(''),
      "data": {
        "embed": {
          "file": "file.html"
        }
      },
      "lang": "html"
    }
  ]
};

describe 'Extract title', ->

  it 'default options', ->
    ast = JSON.parse source
    await displayEmbedFileAfter
      markdownNode:
        fileAbsolutePath: __filename
        frontmatter: {}
      markdownAST: ast
    , {}
    visit ast, 'html', (node) ->
      node.value.should.eql [
        '<div class="gatsby-highlight display-embed-file-highlight" data-language="html">'
          '<pre class="language-html">'
            '<code class="language-html">'
              '...'
            '</code>'
          '</pre>'
          '<div class="display-embed-file">'
            '<a href="file.html">file.html</a>'
          '</div>'
        '</div>'
      ].join('')

  it 'with template strings', ->
    ast = JSON.parse source
    await displayEmbedFileAfter
      markdownNode:
        fileAbsolutePath: __filename
        frontmatter: {}
      markdownAST: ast
    , {
      message: 'Source: {{FILE}}'
      url: 'https://{{FILE}}'
    }
    visit ast, 'html', (node) ->
      node.value.should.eql [
        '<div class="gatsby-highlight display-embed-file-highlight" data-language="html">'
          '<pre class="language-html">'
            '<code class="language-html">'
              '...'
            '</code>'
          '</pre>'
          '<div class="display-embed-file">'
            '<a href="https://file.html">Source: file.html</a>'
          '</div>'
        '</div>'
      ].join('')

  it 'with user functions', ->
    ast = JSON.parse source
    await displayEmbedFileAfter
      markdownNode:
        fileAbsolutePath: __filename
        frontmatter: {}
      markdownAST: ast
    , {
      message: (message) -> "Source: #{message}"
      url: (url) -> "https://#{url}"
    }
    visit ast, 'html', (node) ->
      node.value.should.eql [
        '<div class="gatsby-highlight display-embed-file-highlight" data-language="html">'
          '<pre class="language-html">'
            '<code class="language-html">'
              '...'
            '</code>'
          '</pre>'
          '<div class="display-embed-file">'
            '<a href="https://file.html">Source: file.html</a>'
          '</div>'
        '</div>'
      ].join('')
