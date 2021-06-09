
{exec} = require 'child_process'
{promises: fs} = require 'fs'
path = require 'path'
unified = require 'unified'
parseMarkdown = require 'remark-parse'
remark2rehype = require 'remark-rehype'
html = require 'rehype-stringify'
pluginPublicImages = require '../lib'

describe 'Parse frontmatter', ->
  
  it.skip 'simple', ->
    content = """
    ![Image 1](./image_1.png)
    """
    content_image_1 = 'R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs'
    await new Promise (resolve, reject) ->
      exec """
      rm -r #{require('os').tmpdir()}/remark_public_images
      mkdir #{require('os').tmpdir()}/remark_public_images
      mkdir #{require('os').tmpdir()}/remark_public_images/article
      mkdir #{require('os').tmpdir()}/remark_public_images/public
      cd #{require('os').tmpdir()}/remark_public_images/public
      git init
      echo 'Readme' > README.md
      git add README.md
      git commit -m "Readme"
      """, (err, stdout, stderr) ->
        if err then reject(err) else resolve()
    await fs.writeFile "#{require('os').tmpdir()}/remark_public_images/article/index.md", content, 'ascii'
    await fs.writeFile "#{require('os').tmpdir()}/remark_public_images/article/image_1.png", content_image_1, 'base64'
    {images} = await unified()
    .use parseMarkdown
    .use pluginPublicImages,
      # repo_local was target
      "repo_local": "#{require('os').tmpdir()}/remark_public_images/local"
      # repo_public was repository
      "repo_public": "#{require('os').tmpdir()}/remark_public_images/public"
      "base_url": 'https://domain.com/repo/master/',
      "reset": true,
      "source": "#{require('os').tmpdir()}/remark_public_images/article/index.md",
      "location": ({options, node}) ->
        path.join("#{require('os').tmpdir()}/remark_public_images/local", node.url)
    .use remark2rehype
    .use html
    .process await fs.readFile "#{require('os').tmpdir()}/remark_public_images/article/index.md"
    console.log '>>images>>', images
