
# Plugin `remark-table-of-content`

This is a Remark plugin to extract a table of content from your Markdown file.

It supports CommonJS and ES modules.

## Options

* `depth_min`, integer, default `1`
  The minimum heading level to include, default with heading 1 (`# Heading 1`).
* `depth_max`, integer, default `3`
  The maximum heading level to include, default with heading 1 (`### Heading 3`).
* `property`, string, default `toc`   
  The [vfile](https://github.com/vfile/vfile) property name where to find the table of content array.

## Simple usage

This is a Remark plugin. As such, place the plugin after `remark-parse` and before `remark-rehype`.

```js
import assert from 'node:assert'
import dedent from 'dedent'
import { unified } from 'unified'
import parseMarkdown from 'remark-parse'
import remark2rehype from 'remark-rehype'
import html from 'rehype-stringify'
import pluginToc from '../lib/index.js'

const { toc } = await unified()
.use(parseMarkdown)
.use(pluginToc, {property: ['data', 'toc']})
.use(remark2rehype)
.use(html)
.process(dedent`
  ---
  description: Using with frontmatter
  ---
  # Heading 1
  ## Heading 2
`)
assert.deepEqual(toc, {
  description: 'Using with frontmatter',
  toc: [
    { title: 'Heading 1', depth: 1, anchor: 'heading-1' },
    { title: 'Heading 2', depth: 2, anchor: 'heading-2' }
  ]
})
```

## Using the `property` option

The resulting array is returned with the `toc` property by default or any property of you like. For example, when used conjointly with the `remark-read-frontmatter` plugin, setting the `property` option to `['data', 'toc']` enriches the frontmatter `data` property.


```js
import assert from 'node:assert'
import dedent from 'dedent'
import { unified } from 'unified'
import parseMarkdown from 'remark-parse'
import remark2rehype from 'remark-rehype'
import html from 'rehype-stringify'
import extractFrontmatter from 'remark-frontmatter'
import pluginReadFrontmatter from 'remark-read-frontmatter'
import pluginToc from '../lib/index.js'

const { data } = await unified()
.use(parseMarkdown)
.use(extractFrontmatter, ['yaml'])
.use(pluginReadFrontmatter)
.use(pluginToc, {property: ['data', 'toc']})
.use(remark2rehype)
.use(html)
.process(dedent`
  ---
  description: Using with frontmatter
  ---
  # Heading 1
  ## Heading 2
`)
assert.deepEqual(data, {
  description: 'Using with frontmatter',
  toc: [
    { title: 'Heading 1', depth: 1, anchor: 'heading-1' },
    { title: 'Heading 2', depth: 2, anchor: 'heading-2' }
  ]
})
```
