# Gatsby Remark enforce empty lines

Ensure there is an empty line between each blocks. It print a warning with the file name and the line number. A block is one of "blockquote", "code", "heading", "html", "list", "paragraph" and "thematicBreak".

Options are:

- `include` (array)
  Globing expression of paths matching the file path, default to all files, for example `**/*.md`.

The plugin can be disabled on a document basis by setting the `noEnforceEmptyLines` frontmatter property to `true`.
