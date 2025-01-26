# Remark table of content

This is a Remark plugin to extract a table of content from your Markdown file.

It supports CommonJS and ES modules.

## Options

- `depth_min`, integer, default `1`
  The minimum heading level to include, default with heading 1 (`# Heading 1`).
- `depth_max`, integer, default `3`
  The maximum heading level to include, default with heading 1 (`### Heading 3`).
- `property`, string|array(string), default `toc`
  The property name in the [VFile](https://github.com/vfile/vfile) `data` object where to store the table of content. The value may be an array if the property is made of multiple levels.

## Simple usage

This is a Remark plugin. As such, place the plugin after `remark-parse` and before `remark-rehype`. Here is how to [return a `toc` property](./samples/simple-usage.js) with the table of content.

```js
import assert from "node:assert";
import dedent from "dedent";
import { unified } from "unified";
import parseMarkdown from "remark-parse";
import remark2rehype from "remark-rehype";
import html from "rehype-stringify";
import pluginToc from "../lib/index.js";

// Create a toc property
const { toc } = await unified()
  .use(parseMarkdown)
  .use(pluginToc, { property: "toc" })
  .use(remark2rehype)
  .use(html).process(dedent`
  # Heading 1
  ## Heading 2
`);
// Validation
assert.deepEqual(toc, [
  { title: "Heading 1", depth: 1, anchor: "heading-1" },
  { title: "Heading 2", depth: 2, anchor: "heading-2" },
]);
```

## Using the `property` option

By default, the VFile `data` object is enriched with the new `toc` object.

The resulting array is returned with the `toc` property by default or any property of you like. For example, when used conjointly with the `remark-read-frontmatter` plugin, setting the `property` option to `['data', 'toc']` [enriches the frontmatter `data` property](./samples/with-extract-frontmatter.js).

```js
import assert from "node:assert";
import dedent from "dedent";
import { unified } from "unified";
import parseMarkdown from "remark-parse";
import remark2rehype from "remark-rehype";
import html from "rehype-stringify";
import extractFrontmatter from "remark-frontmatter";
import pluginReadFrontmatter from "remark-read-frontmatter";
import pluginToc from "../lib/index.js";

const { data } = await unified()
  .use(parseMarkdown)
  .use(extractFrontmatter, ["yaml"])
  .use(pluginReadFrontmatter)
  .use(pluginToc, { property: ["table_of_content"] })
  .use(remark2rehype)
  .use(html).process(dedent`
  ---
  description: Using with frontmatter
  ---
  # Heading 1
  ## Heading 2
`);
assert.deepEqual(data, {
  description: "Using with frontmatter",
  table_of_content: [
    { title: "Heading 1", depth: 1, anchor: "heading-1" },
    { title: "Heading 2", depth: 2, anchor: "heading-2" },
  ],
});
```

A value is preserved if the property is already exists in the vfile, for example in the frontmatter,
