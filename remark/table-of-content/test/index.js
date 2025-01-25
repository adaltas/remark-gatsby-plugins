import dedent from 'dedent'
import { unified } from 'unified'
import parseMarkdown from 'remark-parse'
import remark2rehype from 'remark-rehype'
import html from 'rehype-stringify'
import extractFrontmatter from 'remark-frontmatter'
import pluginReadFrontmatter from 'remark-read-frontmatter'
import pluginToc from '../lib/index.js'

describe('Extract table of content', function () {
  it('default', async function () {
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
      { title: 'Heading 3', depth: 3, anchor: 'heading-3' },
    ])
  })

  it('`depth_min` option', async function () {
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
      { title: 'Heading 3', depth: 3, anchor: 'heading-3' },
    ])
  })

  it('`depth_max` option', async function () {
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
      { title: 'Heading 5', depth: 5, anchor: 'heading-5' },
    ])
  })

  it('heading with styling', async function () {
    const { toc } = await unified()
      .use(parseMarkdown)
      .use(pluginToc)
      .use(remark2rehype)
      .use(html).process(dedent`
        # Heading 1
        ## Heading 2
        ## Heading 2 *italic*
        ## Heading 2 **bold**
        ## Heading 2 ***italic bold***
        ## Heading 2 \`code();\`
        ### Heading 3
        ### Heading 3 *italic*
        ### Heading 3 **bold**
        ### Heading 3 ***italic bold***
        ### Heading 3 \`code();\`
        #### Heading 4
      `)
    toc.should.eql([
      { title: 'Heading 1', depth: 1, anchor: 'heading-1' },
      { title: 'Heading 2', depth: 2, anchor: 'heading-2' },
      { title: 'Heading 2 italic', depth: 2, anchor: 'heading-2-italic' },
      { title: 'Heading 2 bold', depth: 2, anchor: 'heading-2-bold' },
      {
        title: 'Heading 2 italic bold',
        depth: 2,
        anchor: 'heading-2-italic-bold',
      },
      { title: 'Heading 2 code();', depth: 2, anchor: 'heading-2-code' },
      { title: 'Heading 3', depth: 3, anchor: 'heading-3' },
      { title: 'Heading 3 italic', depth: 3, anchor: 'heading-3-italic' },
      { title: 'Heading 3 bold', depth: 3, anchor: 'heading-3-bold' },
      {
        title: 'Heading 3 italic bold',
        depth: 3,
        anchor: 'heading-3-italic-bold',
      },
      { title: 'Heading 3 code();', depth: 3, anchor: 'heading-3-code' },
    ])
  })

  describe('option `property`', function () {
    it('multi-level property', async function () {
      const { data } = await unified()
        .use(parseMarkdown)
        .use(extractFrontmatter, ['yaml'])
        .use(pluginReadFrontmatter)
        .use(pluginToc, { property: ['data', 'toc'] })
        .use(remark2rehype)
        .use(html).process(dedent`
          # Heading 1
          ## Heading 2
        `)
      data.should.eql({
        toc: [
          { title: 'Heading 1', depth: 1, anchor: 'heading-1' },
          { title: 'Heading 2', depth: 2, anchor: 'heading-2' },
        ],
      })
    })

    it('preserve value if `false`', async function () {
      const { data } = await unified()
        .use(parseMarkdown)
        .use(extractFrontmatter, ['yaml'])
        .use(pluginReadFrontmatter)
        .use(pluginToc, { property: ['data', 'toc'] })
        .use(remark2rehype)
        .use(html).process(dedent`
          ---
          toc: false
          ---
          # Heading 1
          ## Heading 2
        `)
      data.should.eql({
        toc: false,
      })
    })
  })
})
