
# Package `gatsby-remark-snippet-url-prepare`

The plugin work conjointly with the `gatsby-remark-embed-snippet` plugin by updating the Markdown AST node with the `data.embed.file` property. Its value is the embeded source file.

Options are:

* `include` (array)
  Globing expression of paths matching the file path, default to all files, for example `**/*.md`.

The plugin can be disabled on a document basis by setting the `noSnippedUrl` frontmatter property to `true`.
