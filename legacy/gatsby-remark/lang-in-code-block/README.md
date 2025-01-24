
# Package `gatsby-remark-enforce-empty-lines`

Ensure that every code block define a lang. It print a warning with the file name and the line number.

Options are:

* `include` (array)
  Globing expression of paths matching the file path, default to all files, for example `**/*.md`.

The plugin can be disabled on a document basis by setting the `noLangInCodeBlock` frontmatter property to `true`.
