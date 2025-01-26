# Remark Read Frontmatter

Remark Read Frontmatter is a Remark plugin written in TypeScript with native for YAML and and TOML frontmatters. No option is required.

The plugin parse the extracted frontmatter object by [`remark-frontmatter`](https://github.com/remarkjs/remark-frontmatter) and insert its properties in the vfile `data` object.
Place this plugins after `remark-frontmatter` and before `remark-rehype`.

## JavaScript example

See [example](https://github.com/adaltas/remark/blob/master/parse-frontmater/sample/index.js):

```js
import assert from "assert";
import { unified } from "unified";
import parseMarkdown from "remark-parse";
import remark2rehype from "remark-rehype";
import html from "rehype-stringify";
import extractFrontmatter from "remark-frontmatter";
const pluginParseFrontmatter = require("remark-read-frontmatter");

const { data } = unified()
  .use(parseMarkdown)
  .use(extractFrontmatter, ["yaml"])
  .use(pluginParseFrontmatter)
  .use(remark2rehype)
  .use(html)
  .processSync(
    `
---
title: Article
lang: fr
---
  `.trim(),
  );

// Output validation
assert.deepEqual(data, {
  title: "Article",
  lang: "fr",
});
```

## Options

- `property`, string, default `undefined`  
  The property in [vfile.data](https://github.com/vfile/vfile) where to assign the frontmatter object. The default behavior merge the VFile data object with the frontmatter object.
