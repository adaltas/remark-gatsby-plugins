# Remark Read Frontmatter

Parse frontmatter object and insert the properties in the vfile `data` object.

## Usage

Place this plugins after `remark-frontmatter` and before `remark-rehype`.

See [example](https://github.com/adaltas/remark/blob/master/parse-frontmater/sample/index.js):

```js
const assert = require("assert");
const unified = require("unified");
const parseMarkdown = require("remark-parse");
const remark2rehype = require("remark-rehype");
const html = require("rehype-stringify");
const extractFrontmatter = require("remark-frontmatter");
const pluginParseFrontmatter = require("remark-read-frontmatter");

const { data } = unified()
  .use(parseMarkdown)
  .use(extractFrontmatter, ["yaml"])
  .use(pluginParseFrontmatter)
  .use(remark2rehype)
  .use(html)
  .processSync([`---`, `title: 'Article'`, `lang: fr`, `---`].join("\n"));
// Test output
assert.deepEqual(data, {
  title: "Article",
  lang: "fr",
});
```

## Options

- `property`, string, default `undefined`  
  The property in [vfile.data](https://github.com/vfile/vfile) where to assign the frontmatter object.
