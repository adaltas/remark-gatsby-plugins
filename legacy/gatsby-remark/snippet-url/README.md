
# Package `gatsby-remark-snippet-url`

Display a link next to the source code when it is embeded from a source file.

The plugin works conjointly with the `gatsby-remark-embed-snippet` and `gatsby-remark-prismjs` plugins and must be declare after. Also, it requires the declaration of `gatsby-remark-enforce-empty-lines-prepare` before `gatsby-remark-embed-snippet`.

Options are:

* `include` (array)
  Globing expression of paths matching the file path, default to all files, for example `**/*.md`.
* `message` (string|function)   
  The message inside a link. If defined as a string, `{{FILE}}` is replaced with
  the embed file name.
* `url` (string|function)   
  The URL of the link. If defined as a string, `{{FILE}}` is replaced with
  the embed file name.

The plugin can be disabled on a document basis by setting the `noSnippedUrl` frontmatter property to `true`.
