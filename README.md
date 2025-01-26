# Remark and Gatsby plugins by Adaltas

## Projects

- [Remark links absolute](./remark/links-absolute)  
  Convert relative links to absolute link.
- [Remark Public images](./remark/public-images)  
  Upload every image present on the markdown article into a public GIT repository and update the `src` image attribute to reflect the new public URL.
- [Remark Read Frontmatter](./remark/read-frontmatter)  
  Parse frontmatter and insert the "data" field in the vfile object.
- [Remark table of content](./remark/table-of-content)  
  This is a Remark plugin to extract a table of content from your Markdown file.
- [Remark Table to Code](./remark/table-to-code)  
  Convert markdown tables to HTML code instead of HTML tables.
- [Remark Title to Frontmatter](./remark/title-to-frontmatter)  
  Export the title present in the Markdown to the frontmatter.

## Gatsby legacy projects

- [Gatsby Remark enforce empty lines](./legacy/gatsby-remark/enforce-empty-lines)  
  Ensure there is an empty line between each blocks. It print a warning with the file name and the line number. A block is one of "blockquote", "code", "heading", "html", "list", "paragraph" and "thematicBreak".

- [Gatsby Remark enforce empty lines](./legacy/gatsby-remark/lang-in-code-block)  
  Ensure that every code block define a lang. It print a warning with the file name and the line number.
- [Gatsby Remark snippet URL](./legacy/gatsby-remark/snippet-url)  
  Display a link next to the source code when it is embeded from a source file.
- [Gatsby Remark snippet URL prepare](./legacy/gatsby-remark/snippet-url-prepare)  
  The plugin work conjointly with the `gatsby-remark-embed-snippet` plugin by updating the Markdown AST node with the `data.embed.file` property. Its value is the embeded source file.
- [Gatsby Remark title to frontmatter](./legacy/gatsby-remark/title-to-frontmatter)  
  This package is a Gatsby module to move the title from the Markdown content to the frontmatter object.
- [Gatsby Caddy redirect configuration generation](./legacy/gatsvy-caddy-redirects-conf)  
  Generate a Caddy compatible config file.

## Developers

The following command bumps the package versions, creates the tags, synchronizes with the remote repository which triggers the CI pipeline and publish the packages:

```bash
yarn run version
```
