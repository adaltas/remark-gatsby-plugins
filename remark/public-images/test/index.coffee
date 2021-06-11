
os = os
{exec} = require 'child_process'
{promises: fs} = require 'fs'
path = require 'path'
unified = require 'unified'
parseMarkdown = require 'remark-parse'
remark2rehype = require 'remark-rehype'
html = require 'rehype-stringify'
pluginPublicImages = require '../lib'

describe 'Parse frontmatter', ->
  
  it 'simple', ->
    config =
      # repo_local was target
      "repo_local": "#{os.tmpdir()}/remark_public_images/local"
      # repo_public was repository
      "repo_public": "#{os.tmpdir()}/remark_public_images/public"
      "base_url": 'https://domain.com/repo/master/',
      "reset": true,
      "source": "#{os.tmpdir()}/remark_public_images/article/index.md"
    content = """
    ![Image 1](./image_1.png)
    """
    content_image_1 = 'R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs'
    await new Promise (resolve, reject) ->
      exec """
      rm -r #{os.tmpdir()}/remark_public_images
      mkdir #{os.tmpdir()}/remark_public_images
      mkdir #{os.tmpdir()}/remark_public_images/article
      mkdir #{os.tmpdir()}/remark_public_images/public
      cd #{os.tmpdir()}/remark_public_images/public
      git init --bare
      """, (err, stdout, stderr) ->
        if err then reject(err) else resolve()
    await fs.writeFile "#{os.tmpdir()}/remark_public_images/article/index.md", content, 'ascii'
    await fs.writeFile "#{os.tmpdir()}/remark_public_images/article/image_1.png", content_image_1, 'base64'
    {contents, images} = await unified()
    .use parseMarkdown
    .use pluginPublicImages, config
      # "location": ({options, node}) ->
      #   path.join("#{os.tmpdir()}/remark_public_images/local", node.url)
    .use remark2rehype
    .use html
    .process await fs.readFile config.source
    images.should.eql [
      url: './image_1.png',
      alt: 'Image 1',
      target: "#{hash config.source}/image_1.png"
    ]
    contents.should.eql [
      '<p>'
      "<img src=\"https://domain.com/repo/master/#{hash config.source}/image_1.png\" alt=\"Image 1\">"
      '</p>'
    ].join ''
