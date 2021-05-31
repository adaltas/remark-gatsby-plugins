
# Remark Read Frontmatter

Parse frontmatter and insert the "frontmatter" field in the vfile object.

## Usage

Place this plugins after `remark-frontmatter` and before `remark-rehype`.

See [example](https://github.com/adaltas/remark/blob/master/parse-frontmater/sample/index.js):

```js
const {frontmatter} = unified()
.use(parseMarkdown)
.use(extractFrontmatter, ['yaml'])
.use(pluginParseFrontmatter)
.use(remark2rehype)
.use(html)
.processSync([
  `---`,
  `title: 'Article'`,
  `lang: fr`,
  `---`,
].join('\n'))
// Test output
assert.deepEqual(frontmatter, {
  title: 'Article',
  lang: 'fr'
})
```
