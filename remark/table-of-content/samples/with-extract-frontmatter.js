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
  .use(pluginToc, { property: ['data', 'toc'] })
  .use(remark2rehype)
  .use(html).process(dedent`
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
    { title: 'Heading 2', depth: 2, anchor: 'heading-2' },
  ],
})
