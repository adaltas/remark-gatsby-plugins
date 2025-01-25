import dedent from 'dedent'
import { unified } from 'unified'
import parseMarkdown from 'remark-parse'
import remark2rehype from 'remark-rehype'
import html from 'rehype-stringify'
import extractFrontmatter from 'remark-frontmatter'
import pluginReadFrontmatter from 'remark-read-frontmatter'

describe('Read frontmatter', function () {
  it('simple', async function () {
    const { data } = await unified()
      .use(parseMarkdown)
      .use(extractFrontmatter, ['yaml'])
      .use(pluginReadFrontmatter)
      .use(remark2rehype)
      .use(html).process(dedent`
        ---
        title: 'Article'
        lang: fr
        ---
      `)
    data.should.eql({ title: 'Article', lang: 'fr' })
  })

  it('option `property`', async function () {
    const { data, test } = await unified()
      .use(parseMarkdown)
      .use(extractFrontmatter, ['yaml'])
      .use(pluginReadFrontmatter, { property: 'test' })
      .use(remark2rehype)
      .use(html).process(dedent`
        ---
        title: 'Article'
        lang: fr
        ---
      `)
    data.should.eql({})
    test.should.eql({ title: 'Article', lang: 'fr' })
  })
})
