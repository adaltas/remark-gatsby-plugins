import dedent from 'dedent'
import { unified } from 'unified'
import parseMarkdown from 'remark-parse'
import remark2rehype from 'remark-rehype'
import html from 'rehype-stringify'
import extractFrontmatter from 'remark-frontmatter'
import pluginReadFrontmatter from 'remark-read-frontmatter'
import pluginTitleToFrontmatter from 'remark-title-to-frontmatter'

describe('Extract title', () => {
  it('without frontmatter', async () => {
    const { data } = await unified()
      .use(parseMarkdown)
      .use(extractFrontmatter, ['yaml'])
      .use(pluginReadFrontmatter)
      .use(pluginTitleToFrontmatter)
      .use(remark2rehype)
      .use(html).process(dedent`
        # My title
      `)
    data.should.eql({
      title: 'My title',
    })
  })

  it('with frontmatter', async () => {
    const { data } = await unified()
      .use(parseMarkdown)
      .use(extractFrontmatter, ['yaml'])
      .use(pluginReadFrontmatter)
      .use(pluginTitleToFrontmatter)
      .use(remark2rehype)
      .use(html).process(dedent`
         ---
         lang: fr
         ---

         # My title
      `)
    data.should.eql({
      lang: 'fr',
      title: 'My title',
    })
  })

  it('no title', async () => {
    const { data } = await unified()
      .use(parseMarkdown)
      .use(extractFrontmatter, ['yaml'])
      .use(pluginReadFrontmatter)
      .use(pluginTitleToFrontmatter)
      .use(remark2rehype)
      .use(html).process(dedent`
        ---
        lang: fr
        ---
        
        hello
      `)
    data.should.eql({
      lang: 'fr',
    })
  })

  it('no frontmatter, no content', async () => {
    const { data } = await unified()
      .use(parseMarkdown)
      .use(extractFrontmatter, ['yaml'])
      .use(pluginReadFrontmatter)
      .use(pluginTitleToFrontmatter)
      .use(remark2rehype)
      .use(html)
      .process('')
    data.should.eql({})
  })

  it('with frontmatter, no content', async () => {
    const { data } = await unified()
      .use(parseMarkdown)
      .use(extractFrontmatter, ['yaml'])
      .use(pluginReadFrontmatter)
      .use(pluginTitleToFrontmatter)
      .use(remark2rehype)
      .use(html).process(dedent`
      ---
      lang: fr
      ---
    `)
    data.should.eql({
      lang: 'fr',
    })
  })

  it('option `property`', async () => {
    const { data, test } = await unified()
      .use(parseMarkdown)
      .use(extractFrontmatter, ['yaml'])
      .use(pluginReadFrontmatter)
      .use(pluginTitleToFrontmatter, { property: 'test' })
      .use(remark2rehype)
      .use(html).process(dedent`
        # My title
      `)
    data.should.eql({})
    test.should.eql({
      title: 'My title',
    })
  })
})
