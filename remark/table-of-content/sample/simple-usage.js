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
