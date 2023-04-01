import dedent from 'dedent'
import { unified } from 'unified'
import parseMarkdown from 'remark-parse'
import remark2rehype from 'remark-rehype'
import html from 'rehype-stringify'
import extractFrontmatter from 'remark-frontmatter'
import pluginReadFrontmatter from 'remark-read-frontmatter'
import pluginToc from '../lib/index.js'

describe('Extract table of content', () => {
  it('default', async () => {
    const { toc } = await unified()
      .use(parseMarkdown)
      .use(pluginToc)
      .use(remark2rehype)
      .use(html).process(dedent`
        # Heading 1
        ## Heading 2
        ### Heading 3
        #### Heading 4
      `)
    toc.should.eql([
      { title: 'Heading 1', depth: 1, anchor: 'heading-1' },
      { title: 'Heading 2', depth: 2, anchor: 'heading-2' },
      { title: 'Heading 3', depth: 3, anchor: 'heading-3' }
    ])
  })
  it('`depth_min` option', async () => {
    const { toc } = await unified()
      .use(parseMarkdown)
      .use(pluginToc, { depth_min: 2 })
      .use(remark2rehype)
      .use(html).process(dedent`
        # Heading 1
        ## Heading 2
        ### Heading 3
        #### Heading 4
      `)
    toc.should.eql([
      { title: 'Heading 2', depth: 2, anchor: 'heading-2' },
      { title: 'Heading 3', depth: 3, anchor: 'heading-3' }
    ])
  })
  it('`depth_max` option', async () => {
    const { toc } = await unified()
      .use(parseMarkdown)
      .use(pluginToc, { depth_max: 5 })
      .use(remark2rehype)
      .use(html).process(dedent`
        # Heading 1
        ## Heading 2
        ### Heading 3
        #### Heading 4
        ##### Heading 5
        ###### Heading 6
      `)
    toc.should.eql([
      { title: 'Heading 1', depth: 1, anchor: 'heading-1' },
      { title: 'Heading 2', depth: 2, anchor: 'heading-2' },
      { title: 'Heading 3', depth: 3, anchor: 'heading-3' },
      { title: 'Heading 4', depth: 4, anchor: 'heading-4' },
      { title: 'Heading 5', depth: 5, anchor: 'heading-5' }
    ])
  })
  it('`property` option', async () => {
    const { data } = await unified()
      .use(parseMarkdown)
      .use(extractFrontmatter, ['yaml'])
      .use(pluginReadFrontmatter)
      .use(pluginToc, {property: ['data', 'toc']})
      .use(remark2rehype)
      .use(html).process(dedent`
        # Heading 1
        ## Heading 2
      `)
    data.should.eql({
      toc: [
        { title: 'Heading 1', depth: 1, anchor: 'heading-1' },
        { title: 'Heading 2', depth: 2, anchor: 'heading-2' }
      ]
    })
  })
})
